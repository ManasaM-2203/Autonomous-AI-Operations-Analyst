"""
Test script for the System Intelligence Layer
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.intelligence import analyze_system

def test_system_intelligence():
    """Test various scenarios"""
    
    test_cases = [
        {
            "name": "Safe System",
            "input": {"cpu": 45, "log": "normal system operation completed successfully"},
            "expected_state": "SAFE"
        },
        {
            "name": "Warning - High CPU",
            "input": {"cpu": 85, "log": "system performance monitoring active"},
            "expected_state": "WARNING"
        },
        {
            "name": "Warning - Log Anomaly",
            "input": {"cpu": 60, "log": "unauthorized access attempt detected"},
            "expected_state": "WARNING"
        },
        {
            "name": "Critical - Both Issues",
            "input": {"cpu": 92, "log": "root privilege escalation attack detected"},
            "expected_state": "CRITICAL"
        }
    ]
    
    print("=== System Intelligence Layer Test ===\n")
    
    for test_case in test_cases:
        print(f"Test: {test_case['name']}")
        print(f"Input: CPU={test_case['input']['cpu']}%, Log='{test_case['input']['log']}'")
        
        result = analyze_system(test_case['input'])
        
        print(f"State: {result['decision']['state']}")
        print(f"Reason: {result['decision']['reason']}")
        print(f"Alert: {result['alert']['message'] if result['alert']['active'] else 'No alert'}")
        print(f"Confidence: {result['decision']['confidence_score']:.2f}")
        print("-" * 50)

if __name__ == "__main__":
    test_system_intelligence()
