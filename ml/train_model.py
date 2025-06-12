import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib

data = pd.DataFrame({
    'text': [
        "Pemain bola mencetak gol",
        "Presiden umumkan kebijakan baru",
        "Google merilis produk baru"
    ],
    'category': ['sport', 'politics', 'tech']
})

model = make_pipeline(TfidfVectorizer(), MultinomialNB())
model.fit(data['text'], data['category'])
joblib.dump(model, 'article_classifier.pkl')
