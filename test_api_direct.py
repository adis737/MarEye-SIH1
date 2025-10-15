#!/usr/bin/env python3
"""
Test the detection API directly
"""

import requests
import os
import json

def test_detection_api():
    """Test the detection API with a real image"""
    print("Testing Detection API...")
    
    # Use an existing image from the project
    test_image_path = "Deep_Sea-NN-main/data/test_imgs/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
    
    if not os.path.exists(test_image_path):
        print(f"Test image not found: {test_image_path}")
        return
    
    # Test the API
    url = "http://localhost:3000/api/detection/process"
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'file': f}
            data = {'type': 'image'}
            
            print("Sending request to detection API...")
            response = requests.post(url, files=files, data=data, timeout=60)
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("[OK] API Response received!")
                print(f"Success: {result.get('success', False)}")
                print(f"Type: {result.get('type', 'unknown')}")
                print(f"Total objects: {result.get('totalObjects', 0)}")
                
                if 'detections' in result and result['detections']:
                    print("Detections:")
                    for i, detection in enumerate(result['detections']):
                        print(f"  {i+1}. {detection['class']} (confidence: {detection['confidence']:.3f})")
                        print(f"     Bbox: {detection['bbox']}")
                else:
                    print("No detections found")
                
                if 'detectedImage' in result:
                    print("[OK] Detected image received (base64 encoded)")
                    # Save the detected image
                    import base64
                    img_data = result['detectedImage'].split(',')[1]  # Remove data:image/jpeg;base64, prefix
                    with open('api_detected_output.jpg', 'wb') as img_file:
                        img_file.write(base64.b64decode(img_data))
                    print("Saved detected image: api_detected_output.jpg")
                
            else:
                print(f"[ERROR] API Error: {response.status_code}")
                print(f"Response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("[ERROR] Connection Error: Make sure the Next.js server is running on localhost:3000")
    except Exception as e:
        print(f"[ERROR] Error: {e}")

if __name__ == "__main__":
    test_detection_api()
