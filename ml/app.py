from flask import Flask, request, jsonify
import joblib
import os

app = Flask(__name__)  # ✅ Harus didefinisikan sebelum digunakan

model_path = os.path.join(os.path.dirname(__file__), 'article_classifier.pkl')
model = joblib.load(model_path)

API_TOKEN = "supersecret_issi_token_2025"

@app.route('/api/v1/classify', methods=['POST'])
def classify():
    auth = request.headers.get("Authorization")
    if auth != f"Bearer {API_TOKEN}":
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    text = data.get('text', '')
    pred = model.predict([text])[0]
    return jsonify({'prediction': pred})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8001)
