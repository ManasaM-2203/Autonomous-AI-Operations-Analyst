import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

def generate_ai_explanation(decision: dict) -> str:
    try:
        prompt = f"""
        You are an AI system monitoring assistant.

        System State: {decision.get("state")}
        Reason: {decision.get("reason")}
        Recommended Action: {decision.get("recommended_action")}

        Explain this clearly for a system admin.
        Keep it short and practical.
        """

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False
            },
            timeout=10,
        )

        return response.json().get("response", "").strip()

    except Exception as e:
        return f"AI error: {str(e)}"