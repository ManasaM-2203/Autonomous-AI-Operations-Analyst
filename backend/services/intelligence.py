# services/intelligence.py

from typing import Dict, Any
from services.predictor import predict_log


# ===== METRICS MODEL =====
def predict_metrics(data: Dict[str, Any]) -> Dict[str, float]:
    cpu = data.get("cpu", 0)
    memory = data.get("memory", 0)

    cpu_risk = min(cpu / 100.0, 1.0)
    memory_risk = min(memory / 100.0, 1.0)

    return {
        "cpu": cpu,
        "memory": memory,
        "cpu_risk": float(cpu_risk),
        "memory_risk": float(memory_risk)
    }


# ===== FUSION LAYER =====
def fuse_results(metrics: Dict, log: Dict):

    return {
        "cpu_risk": metrics.get("cpu_risk", 0.0),
        "memory_risk": metrics.get("memory_risk", 0.0),
        "log_risk": log.get("log_risk", 0.0),
        "log_anomaly": log.get("is_anomaly", False)
    }


# ===== DECISION LAYER =====
def system_decision(fusion: Dict):

    cpu_risk = fusion["cpu_risk"]
    memory_risk = fusion.get("memory_risk", 0.0)
    log_risk = fusion["log_risk"]
    log_anomaly = fusion["log_anomaly"]

    # 🔥 FINAL RISK SCORE
    risk_score = (0.7 * cpu_risk) + (0.3 * log_risk)

    if risk_score > 0.8:
        level = "HIGH"
        state = "CRITICAL"
    elif risk_score > 0.5:
        level = "MEDIUM"
        state = "WARNING"
    else:
        level = "LOW"
        state = "SAFE"

    return {
        "state": state,
        "level": level,
        "risk_score": float(risk_score),
        "reason": f"CPU risk: {cpu_risk:.2f}, Memory risk: {memory_risk:.2f}, Log anomaly: {log_anomaly}"
    }


# ===== FULL PIPELINE =====
def analyze_system(data: Dict[str, Any]):

    print("🧠 INTELLIGENCE PIPELINE STARTED")

    # 1. Predictions
    metrics = predict_metrics({
        "cpu": data.get("cpu", 0),
        "memory": data.get("memory", 0),
    })
    log = predict_log(data.get("log", ""))

    print("📊 METRICS:", metrics)
    print("📜 LOG:", log)

    # 2. Fusion
    fusion = fuse_results(metrics, log)
    print("🔗 FUSION:", fusion)

    # 3. Decision
    decision = system_decision(fusion)
    print("⚡ DECISION:", decision)

    return {
        "metrics": metrics,
        "log": log,
        "fusion": fusion,
        "decision": decision
    }