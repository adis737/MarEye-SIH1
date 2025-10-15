#!/usr/bin/env python3
"""
Test the detection API with a simple image
"""

import requests
import os
import json
from PIL import Image
import numpy as np

def create_test_image():
    """Create a simple test image"""
    # Create a simple test image
    img = Image.new('RGB', (640, 480), color='blue')
    
    # Add some simple shapes to simulate objects
    pixels = np.array(img)
    
    # Add a rectangle (simulating a submarine)
    pixels[100:200, 150:300] = [255, 0, 0]  # Red rectangle
    
    # Add a circle (simulating a mine)
    center_x, center_y = 400, 200
    radius = 50
    y, x = np.ogrid[:480, :640]
    mask = (x - center_x)**2 + (y - center_y)**2 <= radius**2
    pixels[mask] = [0, 255, 0]  # Green circle
    
    test_img = Image.fromarray(pixels)
    test_img.save('test_image.jpg')
    print("Created test image: test_image.jpg")
    return 'test_image.jpg'

def test_detection_api():
    """Test the detection API"""
    print("Testing Detection API...")
    
    # Create test image
    test_image_path = create_test_image()
    
    # Test the API
    url = "http://localhost:3000/api/detection/process"
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'file': f}
            data = {'type': 'image'}
            
            print("Sending request to detection API...")
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ API Response received!")
                print(f"Success: {result.get('success', False)}")
                print(f"Type: {result.get('type', 'unknown')}")
                print(f"Total objects: {result.get('totalObjects', 0)}")
                
                if 'detections' in result:
                    print("Detections:")
                    for i, detection in enumerate(result['detections']):
                        print(f"  {i+1}. {detection['class']} (confidence: {detection['confidence']:.3f})")
                        print(f"     Bbox: {detection['bbox']}")
                
                if 'detectedImage' in result:
                    print("✅ Detected image received (base64 encoded)")
                
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"Response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Next.js server is running on localhost:3000")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Cleanup
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            print(f"Cleaned up test image: {test_image_path}")

if __name__ == "__main__":
    test_detection_api()
