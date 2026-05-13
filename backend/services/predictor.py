# services/predictor.py

from utils.loader import load_models
import re

# ===== LOAD MODELS =====
tfidf, isolation_model, _, _ = load_models()

# ===== KEYWORDS =====
security_keywords = [
    "sql","injection","passwd","unauthorized",
    "overflow","exploit","malware","attack",
    "nmap","drop","script","root","etc",
    "failure","error","denied"
]

# ===== CLEAN LOG =====
def clean_log(line: str):
    line = line.lower()
    line = re.sub(r'\d+\.\d+\.\d+\.\d+', '<IP>', line)
    line = re.sub(r'\d+', '<NUM>', line)
    line = re.sub(r'\s+', ' ', line).strip()
    return line

# ===== GIBBERISH DETECTION =====
def is_gibberish(text: str):
    words = text.split()
    if len(words) == 0:
        return False

    weird = sum(1 for w in words if not w.isalpha())
    return weird / len(words) > 0.6

# ===== FINAL LOG PREDICTION =====
def predict_log(log: str):
    try:
        cl = clean_log(log)

        vector = tfidf.transform([cl])

        pred = isolation_model.predict(vector)[0]
        score = isolation_model.decision_function(vector)[0]

        # 🔥 RULE-BASED BOOST
        if any(k in cl for k in security_keywords) or is_gibberish(cl):
            pred = -1
            score = min(score, -0.3)

        return {
            "is_anomaly": bool(pred == -1),
            "log_risk": 1.0 if pred == -1 else 0.0,
            "score": float(score),
            "cleaned_log": cl
        }

    except Exception as e:
        print("❌ LOG MODEL ERROR:", e)
        return {
            "is_anomaly": False,
            "log_risk": 0.0,
            "score": 0.0,
            "error": str(e)
        }