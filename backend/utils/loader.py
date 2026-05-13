import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "model")

def load_models():
    tfidf = joblib.load(os.path.join(MODEL_PATH, "tfidf.pkl"))
    isolation = joblib.load(os.path.join(MODEL_PATH, "isolation.pkl"))
    early = joblib.load(os.path.join(MODEL_PATH, "early_model.pkl"))
    final = joblib.load(os.path.join(MODEL_PATH, "final_model.pkl"))

    return tfidf, isolation, early, final