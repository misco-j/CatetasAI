from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os
from werkzeug.utils import secure_filename

# Import Google Cloud Vision client library
from google.cloud import vision

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

client = genai.Client(api_key="AIzaSyAXI-yLqe4jfGv-abhQBNGDVOAXTEHThIY")

# Initialize Google Cloud Vision client
vision_client = vision.ImageAnnotatorClient()

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return jsonify({'response': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    return jsonify({'message': 'Image uploaded successfully', 'filename': filename})

@app.route('/generate_with_image', methods=['POST'])
def generate_with_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400
    file = request.files['image']
    prompt = request.form.get('prompt', '')
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    def generate_image_caption(image_path):
        with open(image_path, 'rb') as image_file:
            content = image_file.read()
        image = vision.Image(content=content)
        response = vision_client.label_detection(image=image)
        labels = response.label_annotations
        descriptions = [label.description for label in labels]
        return ', '.join(descriptions)

    try:
        image_caption = generate_image_caption(filepath)
        combined_prompt = f"Image description: {image_caption}\nUser prompt: {prompt}"
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=combined_prompt,
        )
        return jsonify({'response': response.text})
    except Exception as e:
        if "DefaultCredentialsError" in str(e):
            return jsonify({'error': 'Google Cloud credentials not found. Please set up credentials as per SETUP_GOOGLE_CLOUD_VISION.md'}), 500
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
