#!/usr/bin/env python3
"""
Test the CNN API to see if the enhancement failure is fixed
"""

import requests
import os
import json

def test_cnn_api():
    """Test the CNN API"""
    print("Testing CNN API...")
    
    # Use an existing image from the project
    test_image_path = "Deep_Sea-NN-main/data/test_imgs/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
    
    if not os.path.exists(test_image_path):
        print(f"Test image not found: {test_image_path}")
        return
    
    # Test the API
    url = "http://localhost:3000/api/cnn/process"
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'file': f}
            data = {'type': 'image'}
            
            print("Sending request to CNN API...")
            response = requests.post(url, files=files, data=data, timeout=60)
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("[OK] CNN API Response received!")
                print(f"Success: {result.get('success', False)}")
                print(f"Type: {result.get('type', 'unknown')}")
                
                if 'metrics' in result:
                    metrics = result['metrics']
                    print(f"PSNR: {metrics.get('psnr', 0):.2f} dB")
                    print(f"SSIM: {metrics.get('ssim', 0):.4f}")
                    print(f"UIQM Original: {metrics.get('uiqm_original', 0):.2f}")
                    print(f"UIQM Enhanced: {metrics.get('uiqm_enhanced', 0):.2f}")
                    print(f"UIQM Improvement: {metrics.get('uiqm_improvement', 0):.2f}")
                    
                    if metrics.get('uiqm_improvement', 0) > 0:
                        print("[SUCCESS] Enhancement successful!")
                    else:
                        print("[WARNING] Enhancement failed or degraded")
                
                if 'enhancedImage' in result:
                    print("[OK] Enhanced image received (base64 encoded)")
                    # Save the enhanced image
                    import base64
                    img_data = result['enhancedImage'].split(',')[1]  # Remove data:image/jpeg;base64, prefix
                    with open('cnn_api_output.jpg', 'wb') as img_file:
                        img_file.write(base64.b64decode(img_data))
                    print("Saved enhanced image: cnn_api_output.jpg")
                
            else:
                print(f"[ERROR] API Error: {response.status_code}")
                print(f"Response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("[ERROR] Connection Error: Make sure the Next.js server is running on localhost:3000")
    except Exception as e:
        print(f"[ERROR] Error: {e}")

if __name__ == "__main__":
    test_cnn_api()
