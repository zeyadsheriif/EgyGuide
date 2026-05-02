import os
# Force CPU for TensorFlow to keep it lightweight and stable
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

# --- CONFIGURATION ---
MODEL_PATH = 'new_efficientnet_model.keras'
IMAGE_SIZE = (224, 224)
CLASS_NAMES = [
    'AmenhotebIII and wife Tiye', 'Bent pyramid for senefru', 'Colossoi of Memnon', 
    'Hatshepsut', 'Khafre Pyramid', 'Ramesses II', 'Temple of Ramessum', 
    'The Great Temple of Ramesses II', 'Tut Ankh Amun', 'sphinx'
]

# --- LOAD MODEL ---
print("--- Starting Vision Service ---")
if not os.path.exists(MODEL_PATH):
    print(f"❌ CRITICAL ERROR: Model not found at {MODEL_PATH}")
    exit()

print("Loading EfficientNet...")
# compile=False is safer for inference
model = tf.keras.models.load_model(MODEL_PATH, compile=False)
print("✅ Vision Model Loaded & Ready on Port 5000")

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    try:
        # 1. Read Image
        image = Image.open(file.stream).convert('RGB')
        image = image.resize(IMAGE_SIZE)
        
        # 2. Preprocess (Convert to array & batch)
        img_array = tf.keras.preprocessing.image.img_to_array(image)
        img_batch = tf.expand_dims(img_array, 0)
        
        # 3. Predict
        predictions = model.predict(img_batch, verbose=0)
        scores = predictions[0]
        
        # 4. Process Results
        top_index = np.argmax(scores)
        top_landmark = CLASS_NAMES[top_index]
        confidence = float(scores[top_index] * 100)
        
        # Create dictionary of all scores
        all_scores = {CLASS_NAMES[i]: float(scores[i]) for i in range(len(CLASS_NAMES))}
        
        return jsonify({
            'landmark': top_landmark,
            'confidence': confidence,
            'scores': all_scores
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)