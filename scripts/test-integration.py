#!/usr/bin/env python3
"""Test script for model integration."""

import requests
import json

def test_model_server():
    """Test the Python model server."""
    try:
        # Test health endpoint
        response = requests.get('http://localhost:5000/health', timeout=5)
        if response.status_code == 200:
            print("✅ Model server is running")
            return True
        else:
            print("❌ Model server health check failed")
            return False
    except requests.exceptions.RequestException:
        print("❌ Model server is not running")
        return False

def test_prediction():
    """Test a sample prediction."""
    try:
        data = {
            "sequences": ["ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCG"]
        }
        response = requests.post(
            'http://localhost:5000/predict',
            json=data,
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Prediction test successful")
                return True
            else:
                print(f"❌ Prediction failed: {result.get('message')}")
                return False
        else:
            print(f"❌ Prediction request failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Prediction test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Model Integration")
    print("=" * 30)
    
    if test_model_server():
        test_prediction()
    else:
        print("💡 Start the model server with: python scripts/start-model-server.py")
