#!/usr/bin/env python3
"""
Simple test to see what the API is actually doing
"""

import requests
import os
import json

def test_simple_api():
    """Test the API with a simple request"""
    print("Testing simple API request...")
    
    # Create a simple test image
    import cv2
    import numpy as np
    
    # Create a simple test image with a circle
    test_img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.circle(test_img, (50, 50), 20, (255, 255, 255), -1)
    cv2.imwrite("simple_test.jpg", test_img)
    
    # Test the API
    url = "http://localhost:3000/api/detection/process"
    
    try:
        with open("simple_test.jpg", 'rb') as f:
            files = {'file': f}
            data = {'type': 'image'}
            
            print("Sending simple request to detection API...")
            response = requests.post(url, files=files, data=data, timeout=30)
            
            print(f"Response status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print("Response JSON:")
                print(json.dumps(result, indent=2))
            else:
                print(f"Error response: {response.text}")
                
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple_api()
