from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import NearestNeighbors
import joblib
import mysql.connector
from datetime import datetime
import os
import logging
from textblob import TextBlob
import re
from collections import Counter
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class DatabaseConnection:
    def __init__(self):
        self.config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'issi_purbalingga'),
            'charset': 'utf8mb4'
        }

    def get_connection(self):
        return mysql.connector.connect(**self.config)

    def execute_query(self, query, params=None):
        conn = self.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(query, params)
            result = cursor.fetchall()
            return result
        finally:
            cursor.close()
            conn.close()

class ArticleClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        self.model_path = 'models/article_classifier.pkl'

    def preprocess_text(self, text):
        """Clean and preprocess text"""
        if not text:
            return ""
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        # Convert to lowercase
        text = text.lower()
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        return text

    def train(self, force_retrain=False):
        """Train the article classifier"""
        if self.is_trained and not force_retrain:
            return

        db = DatabaseConnection()

        # Get articles with categories
        query = """
        SELECT a.judul, a.content, a.excerpt, a.tags, k.nama as kategori
        FROM artikels a
        JOIN kategori_artikels k ON a.kategori_id = k.id
        WHERE a.status = 'published'
        """

        articles = db.execute_query(query)

        if not articles:
            logger.warning("No articles found for training")
            return

        # Prepare training data
        texts = []
        categories = []

        for article in articles:
            # Combine title, content, and excerpt
            combined_text = f"{article['judul']} {article['content']} {article['excerpt']}"
            processed_text = self.preprocess_text(combined_text)
            texts.append(processed_text)
            categories.append(article['kategori'])

        # Convert to numpy arrays
        X = np.array(texts)
        y = np.array(categories)

        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )

        # Vectorize text
        X_train_tfidf = self.vectorizer.fit_transform(X_train)
        X_test_tfidf = self.vectorizer.transform(X_test)

        # Train classifier
        self.classifier.fit(X_train_tfidf, y_train)

        # Evaluate
        y_pred = self.classifier.predict(X_test_tfidf)

        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted')
        recall = recall_score(y_test, y_pred, average='weighted')
        f1 = f1_score(y_test, y_pred, average='weighted')

        logger.info(f"Model trained - Accuracy: {accuracy:.4f}, Precision: {precision:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}")

        # Save model
        os.makedirs('models', exist_ok=True)
        model_data = {
            'vectorizer': self.vectorizer,
            'classifier': self.classifier,
            'label_encoder': self.label_encoder,
            'metrics': {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1_score': f1
            }
        }
        joblib.dump(model_data, self.model_path)

        self.is_trained = True

        # Update database with model info
        self.update_model_in_db(accuracy, precision, recall, f1, len(X_train), len(X_test))

    def load_model(self):
        """Load trained model"""
        if os.path.exists(self.model_path):
            model_data = joblib.load(self.model_path)
            self.vectorizer = model_data['vectorizer']
            self.classifier = model_data['classifier']
            self.label_encoder = model_data['label_encoder']
            self.is_trained = True
            logger.info("Article classifier model loaded successfully")
        else:
            logger.warning("No trained model found, training new model")
            self.train()

    def predict(self, text):
        """Predict category for given text"""
        if not self.is_trained:
            self.load_model()

        processed_text = self.preprocess_text(text)
        text_tfidf = self.vectorizer.transform([processed_text])
        prediction = self.classifier.predict(text_tfidf)[0]
        probability = self.classifier.predict_proba(text_tfidf)[0]

        category = self.label_encoder.inverse_transform([prediction])[0]
        confidence = np.max(probability)

        return {
            'category': category,
            'confidence': float(confidence),
            'all_probabilities': {
                self.label_encoder.inverse_transform([i])[0]: float(prob)
                for i, prob in enumerate(probability)
            }
        }

    def update_model_in_db(self, accuracy, precision, recall, f1_score, train_samples, val_samples):
        """Update model information in database"""
        db = DatabaseConnection()
        conn = db.get_connection()
        cursor = conn.cursor()

        try:
            # Check if model exists
            cursor.execute("SELECT id FROM model_mls WHERE nama_model = 'Article Classifier'")
            result = cursor.fetchone()

            if result:
                # Update existing model
                query = """
                UPDATE model_mls SET
                    accuracy_score = %s,
                    precision_score = %s,
                    recall_score = %s,
                    f1_score = %s,
                    training_samples = %s,
                    validation_samples = %s,
                    last_trained_at = %s,
                    updated_at = %s
                WHERE nama_model = 'Article Classifier'
                """
                cursor.execute(query, (accuracy, precision, recall, f1_score, train_samples, val_samples, datetime.now(), datetime.now()))
            else:
                # Insert new model
                query = """
                INSERT INTO model_mls (nama_model, tipe_model, versi, deskripsi, model_path,
                                     model_parameters, accuracy_score, precision_score, recall_score,
                                     f1_score, status, is_active, training_samples, validation_samples,
                                     last_trained_at, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(query, (
                    'Article Classifier', 'classification', 'v1.0',
                    'Model untuk mengklasifikasikan artikel berdasarkan kategori',
                    self.model_path, json.dumps({'algorithm': 'Random Forest', 'n_estimators': 100}),
                    accuracy, precision, recall, f1_score, 'ready', True,
                    train_samples, val_samples, datetime.now(), datetime.now(), datetime.now()
                ))

            conn.commit()
            logger.info("Model information updated in database")
        except Exception as e:
            logger.error(f"Error updating model in database: {str(e)}")
            conn.rollback()
        finally:
            cursor.close()
            conn.close()

class EventRecommender:
    def __init__(self):
        self.model = NearestNeighbors(n_neighbors=5, metric='cosine')
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = 'models/event_recommender.pkl'
        self.user_features = None
        self.event_features = None
        self.event_ids = None

    def prepare_user_features(self, user_id):
        """Prepare user feature vector"""
        db = DatabaseConnection()

        # Get user registration history
        query = """
        SELECT e.type, e.kategori, e.difficulty_level, e.jarak_km, e.terrain_type
        FROM registrasis r
        JOIN events e ON r.event_id = e.id
        WHERE r.user_id = %s AND r.status = 'confirmed'
        """

        user_events = db.execute_query(query, (user_id,))

        if not user_events:
            # New user - return default preferences
            return np.zeros(10)  # Adjust size based on feature count

        # Create user preference vector
        features = {
            'downhill_pref': 0, 'roadbike_pref': 0, 'unsupported_pref': 0,
            'professional_pref': 0, 'amatir_pref': 0, 'senior_pref': 0,
            'beginner_pref': 0, 'medium_pref': 0, 'expert_pref': 0,
            'avg_distance': 0
        }

        total_events = len(user_events)
        total_distance = 0

        for event in user_events:
            # Event type preferences
            if event['type'] == 'downhill':
                features['downhill_pref'] += 1
            elif event['type'] == 'roadbike':
                features['roadbike_pref'] += 1
            elif event['type'] == 'unsupported':
                features['unsupported_pref'] += 1

            # Category preferences
            if event['kategori'] == 'professional':
                features['professional_pref'] += 1
            elif event['kategori'] == 'amatir':
                features['amatir_pref'] += 1
            elif event['kategori'] == 'senior':
                features['senior_pref'] += 1

            # Difficulty preferences
            if event['difficulty_level'] == 'beginner':
                features['beginner_pref'] += 1
            elif event['difficulty_level'] == 'medium':
                features['medium_pref'] += 1
            elif event['difficulty_level'] == 'expert':
                features['expert_pref'] += 1

            total_distance += event['jarak_km'] or 0

        # Normalize preferences
        for key in features:
            if key != 'avg_distance':
                features[key] = features[key] / total_events

        features['avg_distance'] = total_distance / total_events if total_events > 0 else 0

        return np.array(list(features.values()))

    def prepare_event_features(self):
        """Prepare event feature matrix"""
        db = DatabaseConnection()

        query = """
        SELECT id, type, kategori, difficulty_level, jarak_km, max_participants,
               registration_fee, elevation_gain, popularity_score, success_rate
        FROM events
        WHERE status IN ('published', 'registration_open')
        """

        events = db.execute_query(query)

        if not events:
            return None, None

        features_list = []
        event_ids = []

        for event in events:
            features = [
                1 if event['type'] == 'downhill' else 0,
                1 if event['type'] == 'roadbike' else 0,
                1 if event['type'] == 'unsupported' else 0,
                1 if event['kategori'] == 'professional' else 0,
                1 if event['kategori'] == 'amatir' else 0,
                1 if event['kategori'] == 'senior' else 0,
                1 if event['difficulty_level'] == 'beginner' else 0,
                1 if event['difficulty_level'] == 'medium' else 0,
                1 if event['difficulty_level'] == 'expert' else 0,
                event['jarak_km'] or 0,
                event['max_participants'] or 0,
                event['registration_fee'] or 0,
                event['elevation_gain'] or 0,
                event['popularity_score'] or 0,
                event['success_rate'] or 0
            ]

            features_list.append(features)
            event_ids.append(event['id'])

        return np.array(features_list), event_ids

    def train(self):
        """Train the event recommender"""
        self.event_features, self.event_ids = self.prepare_event_features()

        if self.event_features is None:
            logger.warning("No events found for training recommender")
            return

        # Scale features
        self.event_features_scaled = self.scaler.fit_transform(self.event_features)

        # Fit model
        self.model.fit(self.event_features_scaled)

        self.is_trained = True

        # Save model
        os.makedirs('models', exist_ok=True)
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'event_features': self.event_features,
            'event_ids': self.event_ids
        }
        joblib.dump(model_data, self.model_path)

        logger.info("Event recommender trained successfully")

    def load_model(self):
        """Load trained model"""
        if os.path.exists(self.model_path):
            model_data = joblib.load(self.model_path)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.event_features = model_data['event_features']
            self.event_ids = model_data['event_ids']
            self.is_trained = True
            logger.info("Event recommender model loaded successfully")
        else:
            logger.warning("No trained model found, training new model")
            self.train()

    def recommend(self, user_id, n_recommendations=5):
        """Recommend events for user"""
        if not self.is_trained:
            self.load_model()

        if not self.is_trained:
            return []

        user_features = self.prepare_user_features(user_id)
        user_features_scaled = self.scaler.transform([user_features])

        # Find similar events
        distances, indices = self.model.kneighbors(user_features_scaled, n_neighbors=n_recommendations)

        recommendations = []
        for i, idx in enumerate(indices[0]):
            event_id = self.event_ids[idx]
            similarity = 1 - distances[0][i]  # Convert distance to similarity

            # Get event details
            db = DatabaseConnection()
            query = "SELECT * FROM events WHERE id = %s"
            event = db.execute_query(query, (event_id,))

            if event:
                recommendations.append({
                    'event': event[0],
                    'similarity_score': float(similarity),
                    'rank': i + 1
                })

        return recommendations

class SentimentAnalyzer:
    def __init__(self):
        self.model_path = 'models/sentiment_analyzer.pkl'

    def analyze_sentiment(self, text):
        """Analyze sentiment of text using TextBlob"""
        if not text:
            return {
                'sentiment': 'neutral',
                'polarity': 0.0,
                'subjectivity': 0.0
            }

        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity

        # Classify sentiment
        if polarity > 0.1:
            sentiment = 'positive'
        elif polarity < -0.1:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'

        return {
            'sentiment': sentiment,
            'polarity': float(polarity),
            'subjectivity': float(subjectivity)
        }

    def extract_keywords(self, text, top_n=10):
        """Extract keywords from text"""
        if not text:
            return []

        # Remove HTML tags and clean text
        clean_text = re.sub(r'<[^>]+>', '', text)
        clean_text = re.sub(r'[^a-zA-Z\s]', '', clean_text.lower())

        # Split into words
        words = clean_text.split()

        # Filter out common stop words (basic list)
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'dan', 'atau', 'dengan', 'dari', 'untuk', 'yang', 'di', 'ke', 'pada', 'oleh', 'adalah', 'akan', 'dapat', 'bisa', 'sudah', 'telah', 'sedang', 'masih'}

        words = [word for word in words if word not in stop_words and len(word) > 2]

        # Count word frequency
        word_freq = Counter(words)

        return [{'word': word, 'frequency': freq} for word, freq in word_freq.most_common(top_n)]

# Initialize models
article_classifier = ArticleClassifier()
event_recommender = EventRecommender()
sentiment_analyzer = SentimentAnalyzer()

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/classify-article', methods=['POST'])
def classify_article():
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'Text is required'}), 400

        result = article_classifier.predict(text)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in classify_article: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/recommend-events', methods=['POST'])
def recommend_events():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        n_recommendations = data.get('n_recommendations', 5)

        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        recommendations = event_recommender.recommend(user_id, n_recommendations)
        return jsonify({'recommendations': recommendations})

    except Exception as e:
        logger.error(f"Error in recommend_events: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'Text is required'}), 400

        result = sentiment_analyzer.analyze_sentiment(text)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in analyze_sentiment: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/extract-keywords', methods=['POST'])
def extract_keywords():
    try:
        data = request.get_json()
        text = data.get('text', '')
        top_n = data.get('top_n', 10)

        if not text:
            return jsonify({'error': 'Text is required'}), 400

        keywords = sentiment_analyzer.extract_keywords(text, top_n)
        return jsonify({'keywords': keywords})

    except Exception as e:
        logger.error(f"Error in extract_keywords: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/train-models', methods=['POST'])
def train_models():
    try:
        data = request.get_json()
        model_type = data.get('model_type', 'all')

        if model_type in ['all', 'classifier']:
            article_classifier.train(force_retrain=True)

        if model_type in ['all', 'recommender']:
            event_recommender.train()

        return jsonify({'message': f'Model(s) trained successfully', 'model_type': model_type})

    except Exception as e:
        logger.error(f"Error in train_models: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/model-status', methods=['GET'])
def model_status():
    return jsonify({
        'article_classifier': {
            'is_trained': article_classifier.is_trained,
            'model_path': article_classifier.model_path
        },
        'event_recommender': {
            'is_trained': event_recommender.is_trained,
            'model_path': event_recommender.model_path
        },
        'sentiment_analyzer': {
            'model_path': sentiment_analyzer.model_path
        }
    })

if __name__ == '__main__':
    try:
        article_classifier.load_model()
        event_recommender.load_model()
        logger.info("ML models loaded successfully")
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")

    app.run(host='0.0.0.0', port=5000, debug=True)
