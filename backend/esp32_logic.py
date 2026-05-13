# esp32_logic.py
# Portable logic for ESP32 - No external dependencies
# This is MicroPython compatible

from typing import Dict, Any


# ===== METRICS ANALYSIS =====
def predict_metrics(data: Dict[str, Any]) -> Dict[str, float]:
    """
    Lightweight CPU metric analysis.
    Input: {"cpu": 75.5}
    Output: {"cpu": 75.5, "cpu_risk": 0.755}
    """
    cpu = data.get("cpu", 0)
    cpu_risk = min(cpu / 100.0, 1.0)
    
    return {
        "cpu": cpu,
        "cpu_risk": float(cpu_risk)
    }


# ===== FUSION LAYER =====
def fuse_results(metrics: Dict, log: Dict) -> Dict:
    """
    Combine metrics and log predictions into unified view.
    Receives predictions from backend's predict_log() function.
    """
    return {
        "cpu_risk": metrics.get("cpu_risk", 0.0),
        "log_risk": log.get("log_risk", 0.0),
        "log_anomaly": log.get("is_anomaly", False)
    }


# ===== DECISION LAYER =====
def system_decision(fusion: Dict) -> Dict:
    """
    Make final risk decision based on fused data.
    Returns state (CRITICAL/WARNING/SAFE) and risk level.
    """
    cpu_risk = fusion["cpu_risk"]
    log_risk = fusion["log_risk"]
    log_anomaly = fusion["log_anomaly"]
    
    # Final risk score: 70% CPU, 30% Logs
    risk_score = (0.7 * cpu_risk) + (0.3 * log_risk)
    
    # Decision thresholds
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
        "reason": f"CPU risk: {cpu_risk:.2f}, Log anomaly: {log_anomaly}"
    }


# ===== RISK EVALUATION =====
def evaluate_risk(prediction: Dict, intelligence: Dict) -> Dict:
    """
    Evaluate and score risk based on predictions and intelligence.
    Weights: 60% CPU, 40% Logs
    """
    cpu_risk = prediction.get("cpu_risk", 0)
    log_risk = intelligence.get("log_risk", 0)
    
    # Weighted fusion
    risk_score = (0.6 * cpu_risk) + (0.4 * log_risk)
    
    # Risk level classification
    if risk_score > 0.8:
        level = "HIGH"
    elif risk_score > 0.5:
        level = "MEDIUM"
    else:
        level = "LOW"
    
    risk = {
        "risk_score": risk_score,
        "level": level
    }
    
    return risk


# ===== FULL PIPELINE (WITHOUT MODEL DEPENDENCIES) =====
def analyze_system_local(cpu_metric: float, log_risk: float = 0.0, is_anomaly: bool = False) -> Dict:
    """
    Local analysis on ESP32 (without ML models).
    
    Args:
        cpu_metric: CPU percentage (0-100)
        log_risk: Risk from backend's log analysis (0-1)
        is_anomaly: Whether log anomaly was detected
    
    Returns:
        Complete analysis with state, level, and risk score
    """
    # Step 1: Predict metrics
    metrics = predict_metrics({"cpu": cpu_metric})
    
    # Step 2: Create log dict (simulated - real data comes from backend)
    log = {
        "log_risk": log_risk,
        "is_anomaly": is_anomaly
    }
    
    # Step 3: Fuse results
    fusion = fuse_results(metrics, log)
    
    # Step 4: Make decision
    decision = system_decision(fusion)
    
    return decision


# ===== EXAMPLE USAGE =====
if __name__ == "__main__":
    # Test 1: Normal system
    result1 = analyze_system_local(cpu_metric=30.0, log_risk=0.1, is_anomaly=False)
    print("Test 1 (Normal):", result1)
    
    # Test 2: Warning level
    result2 = analyze_system_local(cpu_metric=65.0, log_risk=0.4, is_anomaly=True)
    print("Test 2 (Warning):", result2)
    
    # Test 3: Critical level
    result3 = analyze_system_local(cpu_metric=95.0, log_risk=0.7, is_anomaly=True)
    print("Test 3 (Critical):", result3)
