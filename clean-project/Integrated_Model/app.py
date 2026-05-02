import gradio as gr
import torch
import requests
from PIL import Image
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from peft import PeftModel
import os

# --- CONFIGURATION ---
LLM_ADAPTER_PATH = 't5_domain_adapted' 
VISION_API_URL = "http://127.0.0.1:5000/predict"

# Set Device for LLM (PyTorch) - Mac MPS is safe now!
device = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"🚀 Running LLM on: {device}")

# --- LOAD LLM ---
print("Loading T5 LLM...")
try:
    base_model_id = "google-t5/t5-base"
    tokenizer = AutoTokenizer.from_pretrained(base_model_id)
    base_model = AutoModelForSeq2SeqLM.from_pretrained(base_model_id)
    
    if not os.path.exists(LLM_ADAPTER_PATH):
        raise FileNotFoundError(f"Adapter not found at {LLM_ADAPTER_PATH}")
        
    llm_model = PeftModel.from_pretrained(base_model, LLM_ADAPTER_PATH)
    llm_model.to(device)
    llm_model.eval()
    print("✅ T5 LLM Loaded!")
except Exception as e:
    print(f"❌ Error loading LLM: {e}")
    exit()

# --- LOGIC ---

def process_image_and_start_chat(image):
    """
    Sends image to vision_api.py and initializes chat.
    """
    if image is None:
        return None, None, []

    print("\n--- Sending Image to Vision API ---")
    try:
        # 1. Convert Numpy Image (from Gradio) to Bytes for API
        pil_image = Image.fromarray(image.astype('uint8'), 'RGB')
        
        # Save to a memory buffer to send via request
        import io
        img_byte_arr = io.BytesIO()
        pil_image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0) # Reset pointer
        
        # 2. Send to Vision Service
        files = {'file': ('image.jpg', img_byte_arr, 'image/jpeg')}
        response = requests.post(VISION_API_URL, files=files)
        
        if response.status_code != 200:
            return None, None, [{"role": "assistant", "content": f"Error from Vision API: {response.text}"}]
            
        data = response.json()
        
        # 3. Extract Data
        landmark = data['landmark']
        confidence = data['confidence']
        scores = data['scores']
        
        print(f"Received: {landmark} ({confidence}%)")
        
        # 4. Create Chat Message
        welcome_msg = f"I identified this artifact as **{landmark}** ({confidence:.1f}% confidence).\n\nWhat would you like to know about it?"
        
        # Format: List of dictionaries (Standard for Gradio 6.0)
        new_history = [{"role": "assistant", "content": welcome_msg}]
        
        return scores, landmark, new_history

    except requests.exceptions.ConnectionError:
        return None, None, [{"role": "assistant", "content": "❌ Error: Vision Service is not running. Please run 'python vision_api.py' in a separate terminal."}]
    except Exception as e:
        print(f"Error: {e}")
        return None, None, [{"role": "assistant", "content": f"Error: {str(e)}"}]

def chat_response(user_message, history, current_landmark):
    """
    Generates text using the local T5 model with strict anti-repetition settings.
    """
    if not user_message:
        return "", history

    try:
        if not current_landmark:
            current_landmark = "Egypt"
            
        # Contextual Prompt
        input_text = f"tell me information about {current_landmark}: {user_message}"
        
        # Tokenize
        input_ids = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True).input_ids.to(device)
        
        # Generate with Anti-Repetition Settings
        with torch.no_grad():
            outputs = llm_model.generate(
                input_ids=input_ids,
                max_length=150,           # Keep answers concise
                do_sample=True,           # Keep some creativity
                temperature=0.6,          # Lower temperature = more focused
                top_p=0.9,
                repetition_penalty=2.5,   # CRITICAL: Heavily penalize repeating words
                no_repeat_ngram_size=3,   # CRITICAL: Never repeat a phrase of 3 words
                early_stopping=True
            )
        
        bot_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Append User Message
        history.append({"role": "user", "content": user_message})
        # Append Bot Message
        history.append({"role": "assistant", "content": bot_response})
        
        return "", history

    except Exception as e:
        history.append({"role": "assistant", "content": f"Error generating response: {e}"})
        return "", history

# --- USER INTERFACE ---
with gr.Blocks(title="AI Tourist Guide") as demo:
    current_landmark_state = gr.State(value=None)
    
    gr.Markdown("# 🇪🇬 AI Tourist Guide")
    gr.Markdown("Identify ancient landmarks and chat about them.")
    
    with gr.Row():
        with gr.Column(scale=4):
            input_image = gr.Image(label="Upload Photo", type="numpy")
            identify_btn = gr.Button("🔍 Identify & Start Chat", variant="primary")
            classification_output = gr.Label(num_top_classes=3, label="Results")
            
        with gr.Column(scale=6):
            # FIX: Removed type="messages" (Gradio detects it automatically from the data)
            chatbot = gr.Chatbot(label="Chat", height=500)
            msg_input = gr.Textbox(label="Your Question", placeholder="Type here...")
            send_btn = gr.Button("Send")

    identify_btn.click(
        fn=process_image_and_start_chat,
        inputs=[input_image],
        outputs=[classification_output, current_landmark_state, chatbot]
    )
    
    send_btn.click(
        fn=chat_response,
        inputs=[msg_input, chatbot, current_landmark_state],
        outputs=[msg_input, chatbot]
    )
    
    msg_input.submit(
        fn=chat_response,
        inputs=[msg_input, chatbot, current_landmark_state],
        outputs=[msg_input, chatbot]
    )

if __name__ == "__main__":
    demo.launch()