import joblib
import os

def load_severity_models():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_dir = os.path.join(base, 'model')
    early_path = os.path.join(model_dir, 'early_severity_model_v2.pkl')
    final_path = os.path.join(model_dir, 'final_severity_model_v2.pkl')
    early = joblib.load(early_path)
    final = joblib.load(final_path)
    return early, final
