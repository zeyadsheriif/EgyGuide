from flask import Flask
from flask_cors import CORS
import os
from flask import request
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import torch
from peft import PeftModel
import sqlite3
from datetime import datetime
import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from deep_translator import GoogleTranslator
import json

app = Flask(__name__)


def init_db():
    conn = sqlite3.connect("egyguide.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT,
        answer TEXT,
        landmark TEXT,
        chat_type TEXT,
        timestamp TEXT
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT,
        answer TEXT,
        rating TEXT,
        timestamp TEXT
    )
    """)

    conn.commit()
    conn.close()


init_db()
CORS(app)
CLASS_NAMES = [
    "AmenhotebIII and wife Tiye",
    "Bent pyramid for senefru",
    "Colossoi of Memnon",
    "Hatshepsut",
    "Khafre Pyramid",
    "Ramesses II",
    "Temple of Ramessum",
    "The Great Temple of Ramesses II",
    "Tut Ankh Amun",
    "sphinx",
]
LANDMARK_DATA = {
    "AmenhotebIII and wife Tiye": {
        "dynasty": "18th Dynasty",
        "location": "Luxor, West Bank",
        "description": "Statues representing Pharaoh Amenhotep III and his Great Royal Wife Tiye, symbolizing royal power and divine status.",
    },
    "Bent pyramid for senefru": {
        "dynasty": "4th Dynasty",
        "location": "Dahshur",
        "description": "The Bent Pyramid was built by Pharaoh Sneferu and is famous for its unique change in angle during construction.",
    },
    "Colossoi of Memnon": {
        "dynasty": "18th Dynasty",
        "location": "Luxor, West Bank",
        "description": "Two massive stone statues of Pharaoh Amenhotep III that have stood for over 3,000 years.",
    },
    "Hatshepsut": {
        "dynasty": "18th Dynasty",
        "location": "Deir el-Bahari, Luxor",
        "description": "Hatshepsut was one of the most powerful female pharaohs, known for her magnificent mortuary temple.",
    },
    "Khafre Pyramid": {
        "dynasty": "4th Dynasty",
        "location": "Giza Plateau",
        "description": "The Pyramid of Khafre is the second largest pyramid at Giza and appears taller due to its elevated foundation.",
    },
    "Ramesses II": {
        "dynasty": "19th Dynasty",
        "location": "Various locations across Egypt",
        "description": "Ramesses II, also known as Ramesses the Great, was one of Egypt’s most powerful and celebrated pharaohs.",
    },
    "Temple of Ramessum": {
        "dynasty": "19th Dynasty",
        "location": "West Bank of Luxor",
        "description": "The Ramesseum is the mortuary temple of Ramesses II, showcasing monumental architecture and inscriptions.",
    },
    "The Great Temple of Ramesses II": {
        "dynasty": "19th Dynasty",
        "location": "Abu Simbel",
        "description": "The Great Temple at Abu Simbel was built by Ramesses II and features colossal seated statues carved into rock.",
    },
    "Tut Ankh Amun": {
        "dynasty": "18th Dynasty",
        "location": "Valley of the Kings",
        "description": "Tutankhamun was a young pharaoh whose nearly intact tomb discovery became one of the greatest archaeological finds.",
    },
    "sphinx": {
        "dynasty": "4th Dynasty",
        "location": "Giza Plateau",
        "description": "The Great Sphinx of Giza is a massive limestone statue believed to represent Pharaoh Khafre.",
    },
}
import json

df = pd.read_csv("cleaned_data.csv")
texts = df["text"].tolist()

embedder = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = embedder.encode(texts)

index = faiss.IndexFlatL2(len(embeddings[0]))
index.add(np.array(embeddings))


def retrieve(query, k=3):
    q_emb = embedder.encode([query])
    distances, indices = index.search(q_emb, k)
    return [texts[i] for i in indices[0]]


model = tf.keras.models.load_model("efficientnet_model.keras")
CONFIDENCE_THRESHOLD = 70
last_prediction = None

from transformers import AutoTokenizer, AutoModelForCausalLM

model_name = "Qwen/Qwen2.5-1.5B-Instruct"

tokenizer_qwen = AutoTokenizer.from_pretrained(model_name)

model_qwen = AutoModelForCausalLM.from_pretrained(
    model_name, device_map="auto", torch_dtype="auto"
)


def answer_question(query):
    context_list = retrieve(query)
    context = "\n".join(context_list)

    prompt = f"""
You are a friendly and knowledgeable Egyptian tourist guide.

Answer using ONLY the context.

Context:
{context}

Question: {query}
Answer:
"""

    inputs = tokenizer_qwen(prompt, return_tensors="pt").to(model_qwen.device)

    outputs = model_qwen.generate(
        **inputs, max_new_tokens=80, do_sample=True, temperature=0.7
    )

    response = tokenizer_qwen.decode(outputs[0], skip_special_tokens=True)

    answer = response.split("Answer:")[-1].strip()
    # Fix cut-off sentences
    if not answer.endswith((".", "!", "?")):
        if "." in answer:
            answer = answer.rsplit(".", 1)[0] + "."

    return answer


def is_arabic(text):
    return any("\u0600" <= c <= "\u06ff" for c in text)


def answer_question_multilang(query):

    arabic = is_arabic(query)

    try:
        if arabic:
            query_en = GoogleTranslator(source="auto", target="en").translate(query)
        else:
            query_en = query
    except:
        return "حدث خطأ في الترجمة" if arabic else "Translation error"

    answer_en = answer_question(query_en)

    try:
        if arabic:
            answer_ar = GoogleTranslator(source="auto", target="ar").translate(
                answer_en
            )
            return answer_ar
    except:
        return answer_en

    return answer_en


# @app.route("/")
# def home():
# return {"message": "EgyGuide Backend is running!"}

# @app.route("/api/test")
# def test():
# return {"status": "success", "message": "Backend connected successfully!"}


def log_chat(question, answer, landmark, chat_type):
    conn = sqlite3.connect("egyguide.db")
    cursor = conn.cursor()

    cursor.execute(
        """
    INSERT INTO chat_logs (question, answer, landmark, chat_type, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """,
        (
            question,
            answer,
            landmark,
            chat_type,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        ),
    )

    conn.commit()
    conn.close()


@app.route("/api/upload", methods=["POST"])
def upload():
    global last_prediction
    if "image" not in request.files:
        return {"error": "No image uploaded"}, 400

    file = request.files["image"]

    if file.filename == "":
        return {"error": "Empty filename"}, 400

    image = Image.open(file)
    image = image.convert("RGB")
    image = image.resize((224, 224))

    img_array = np.array(image)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    predictions = model.predict(img_array, verbose=0)
    predicted_index = int(np.argmax(predictions))
    predicted_label = CLASS_NAMES[predicted_index]
    confidence = float(np.max(predictions))
    confidence_percent = round(confidence * 100, 2)
    if confidence_percent < CONFIDENCE_THRESHOLD:
        last_prediction = None
        return {
            "landmark": "Unknown",
            "description": "Sorry, I am still working on identifying this landmark.",
            "confidence": confidence_percent,
        }
    info = LANDMARK_DATA.get(
        predicted_label,
        {
            "dynasty": "Unknown",
            "location": "Unknown",
            "description": "Information will be added soon.",
        },
    )
    print("Predictions:", predictions)
    last_prediction = predicted_label

    return {
        "landmark": predicted_label,
        "dynasty": info["dynasty"],
        "location": info["location"],
        "description": info["description"],
        "confidence": confidence_percent,
    }


@app.route("/api/chat", methods=["POST"])
def chat():
    global last_prediction

    data = request.get_json()

    if not data or "question" not in data:
        return {"error": "No question provided"}, 400

    question = data["question"]

    if not last_prediction:
        return {"answer": "Please upload a landmark image first."}

    enhanced_question = f"{question} about {last_prediction}"

    answer = answer_question_multilang(enhanced_question)

    log_chat(question, answer, last_prediction, "context_rag_chat")

    return app.response_class(
        response=json.dumps({"answer": answer}, ensure_ascii=False),
        status=200,
        mimetype="application/json",
    )


@app.route("/api/llm-chat", methods=["POST"])
def llm_chat():
    data = request.get_json()

    if not data or "question" not in data:
        return {"error": "No question provided"}, 400

    question = data["question"]

    answer = answer_question_multilang(question)

    log_chat(question, answer, None, "llm_rag_chat")

    return app.response_class(
        response=json.dumps({"answer": answer}, ensure_ascii=False),
        status=200,
        mimetype="application/json",
    )

@app.route("/api/feedback", methods=["POST"])
def feedback():

    data = request.get_json()

    if not data:
        return {"error": "No feedback data provided"}, 400

    question = data.get("question")
    answer = data.get("answer")
    rating = data.get("rating")

    conn = sqlite3.connect("egyguide.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO feedback (question, answer, rating, timestamp)
        VALUES (?, ?, ?, ?)
        """,
        (
            question,
            answer,
            rating,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        ),
    )

    conn.commit()
    conn.close()

    return {"message": "Feedback saved successfully"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    app.run(host="0.0.0.0", port=port)
