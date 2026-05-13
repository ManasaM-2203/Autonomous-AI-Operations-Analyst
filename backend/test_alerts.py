"""
Test script to verify alert system is working
"""
import requests
import json

def test_alert_system():
    """Test the complete alert pipeline"""
    
    base_url = "http://localhost:8000"
    
    print("=== Testing Alert System ===\n")
    
    # Test Case 1: Safe system (should NOT trigger alert)
    print("🟢 TEST 1: Safe System (CPU: 30, Normal Log)")
    safe_data = {
        "cpu": 30,
        "log": "system operating normally"
    }
    
    try:
        response = requests.post(f"{base_url}/api/process", json=safe_data)
        result = response.json()
        print(f"Risk Level: {result.get('risk')}")
        print(f"Risk Score: {result.get('risk_score')}")
        print("Expected: NO alert\n")
    except Exception as e:
        print(f"Error: {e}\n")
    
    # Test Case 2: High risk system (SHOULD trigger alert)
    print("🔴 TEST 2: High Risk System (CPU: 95, Suspicious Log)")
    high_risk_data = {
        "cpu": 95,
        "log": "unauthorized root access detected - potential security breach"
    }
    
    try:
        response = requests.post(f"{base_url}/api/process", json=high_risk_data)
        result = response.json()
        print(f"Risk Level: {result.get('risk')}")
        print(f"Risk Score: {result.get('risk_score')}")
        print("Expected: ALERT should trigger!\n")
    except Exception as e:
        print(f"Error: {e}\n")
    
    # Check alerts
    print("📋 CHECKING STORED ALERTS:")
    try:
        response = requests.get(f"{base_url}/api/alerts")
        alerts_data = response.json()
        print(f"Alert Count: {alerts_data.get('count')}")
        
        if alerts_data.get('count') > 0:
            print("🚨 ALERTS FOUND:")
            for alert in alerts_data.get('alerts', []):
                print(f"  - {alert.get('message')} (Risk: {alert.get('risk')})")
        else:
            print("❌ NO ALERTS STORED")
            
    except Exception as e:
        print(f"Error checking alerts: {e}")

if __name__ == "__main__":
    test_alert_system()
