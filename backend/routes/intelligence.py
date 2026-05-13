from fastapi import APIRouter
from services.predictor import predict_log
from services.ai_explainer import generate_ai_explanation

router = APIRouter()

# ===== MOCK METRICS =====
def predict_metrics(data):
    cpu = data.get("cpu", 0)
    risk = min(cpu / 100.0, 1.0)
    return {"risk": risk}


def fuse_results(metrics_result, log_result):
    return {
        "cpu_risk": metrics_result.get("risk", 0.0),
        "log_anomaly": log_result.get("is_anomaly", False),
        "log_score": log_result.get("score", 0.0)
    }


def system_decision(fusion):
    cpu_risk = fusion["cpu_risk"]
    log_anomaly = fusion["log_anomaly"]

    if cpu_risk > 0.8 and log_anomaly:
        return {
            "state": "CRITICAL",
            "reason": "High CPU and anomalous logs detected",
            "recommended_action": "Immediate investigation required",
            "confidence_score": float(max(cpu_risk, 0.9))
        }

    elif cpu_risk > 0.8:
        return {
            "state": "WARNING",
            "reason": "High CPU usage",
            "recommended_action": "Monitor system performance",
            "confidence_score": float(cpu_risk)
        }

    elif log_anomaly:
        return {
            "state": "WARNING",
            "reason": "Suspicious log activity",
            "recommended_action": "Check logs",
            "confidence_score": 0.7
        }

    else:
        return {
            "state": "SAFE",
            "reason": "System normal",
            "recommended_action": "No action needed",
            "confidence_score": 0.1
        }

def evaluate_risk(fusion: dict, decision: dict):

    cpu_risk = fusion.get("cpu_risk", 0.0)
    log_anomaly = fusion.get("log_anomaly", False)

    # Convert log anomaly → numeric
    log_risk = 1.0 if log_anomaly else 0.0

    # Weighted risk
    final_risk = (0.7 * cpu_risk) + (0.3 * log_risk)

    return {
        "final_risk_score": round(final_risk, 3),
        "cpu_component": cpu_risk,
        "log_component": log_risk
    }


def generate_alert(decision: dict, risk: dict):

    state = decision.get("state")
    risk_score = risk.get("final_risk_score", 0)

    if state == "SAFE":
        return {
            "active": False,
            "level": "none",
            "message": "System is stable"
        }

    elif state == "WARNING":
        return {
            "active": True,
            "level": "medium",
            "message": f"⚠️ Warning: Risk score {risk_score}. Monitor system."
        }

    elif state == "CRITICAL":
        return {
            "active": True,
            "level": "high",
            "message": f"🚨 Critical: Risk score {risk_score}. Immediate action required!",
            "escalation": True
        }


# ===== MAIN API =====
@router.post("/analyze")
def analyze(data: dict):

    # 1. Predictions
    metrics = predict_metrics(data)
    log = predict_log(data.get("log", ""))

    # 2. Fusion
    fusion = fuse_results(metrics, log)

    # Decision
    decision = system_decision(fusion)

# 🔥 Risk Evaluation
    risk = evaluate_risk(fusion, decision)

# 🔥 Alert System
    alert = generate_alert(decision, risk)

    # 5. 🔥 AI Explanation
    explanation = generate_ai_explanation(decision)

    return {
        "metrics": metrics,
        "log": log,
        "fusion": fusion,
        "decision": decision,
        "risk": risk,                  # 🔥 ADD THIS
        "alert": alert,
        "ai_explanation": explanation
}