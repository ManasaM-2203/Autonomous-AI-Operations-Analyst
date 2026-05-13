def evaluate_risk(prediction, intelligence):

    print("🔥 ENTERED RISK EVALUATOR")

    cpu_risk = prediction.get("cpu_risk", 0)
    log_risk = intelligence.get("log_risk", 0)

    # weighted fusion
    risk_score = (0.6 * cpu_risk) + (0.4 * log_risk)

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

    print("🔥 RISK OUTPUT:", risk)

    return risk