#!/usr/bin/env python3
"""
Test the analytics API
"""

import requests
import json

def test_analytics_api():
    """Test the analytics API"""
    print("Testing Analytics API...")
    
    try:
        response = requests.get("http://localhost:3000/api/analytics", timeout=30)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("[OK] Analytics API Response received!")
            print(f"Success: {data.get('success', False)}")
            print(f"Total analyses: {data.get('totalAnalyses', 0)}")
            
            if 'analyses' in data and data['analyses']:
                print("\nAnalyses found:")
                for i, analysis in enumerate(data['analyses']):
                    print(f"  {i+1}. {analysis['analysisName']}")
                    print(f"     Timestamp: {analysis['timestamp']}")
                    print(f"     Graphs: {len(analysis['graphs'])}")
                    
                    if 'reportData' in analysis:
                        report = analysis['reportData']
                        if 'basic_metrics' in report:
                            metrics = report['basic_metrics']
                            print(f"     PSNR: {metrics.get('psnr', 0):.2f} dB")
                            print(f"     SSIM: {metrics.get('ssim', 0):.4f}")
                            print(f"     UIQM Improvement: {metrics.get('uiqm_improvement', 0):.2f}")
            else:
                print("No analyses found")
        else:
            print(f"[ERROR] API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Connection Error: Make sure the Next.js server is running on localhost:3000")
    except Exception as e:
        print(f"[ERROR] Error: {e}")

def test_models_api():
    """Test the models API"""
    print("\nTesting Models API...")
    
    try:
        response = requests.get("http://localhost:3000/api/models", timeout=30)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("[OK] Models API Response received!")
            print(f"Success: {data.get('success', False)}")
            
            if 'models' in data:
                models = data['models']
                print(f"ONNX models: {len(models.get('onnx', []))}")
                print(f"TensorRT deployments: {len(models.get('tensorrt', []))}")
                
                if models.get('onnx'):
                    print("\nONNX Models:")
                    for model in models['onnx']:
                        print(f"  - {model['name']} ({model['sizeFormatted']})")
                
                if models.get('tensorrt'):
                    print("\nTensorRT Deployments:")
                    for deployment in models['tensorrt']:
                        print(f"  - {deployment['name']} ({len(deployment['files'])} files)")
        else:
            print(f"[ERROR] API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Connection Error: Make sure the Next.js server is running on localhost:3000")
    except Exception as e:
        print(f"[ERROR] Error: {e}")

if __name__ == "__main__":
    test_analytics_api()
    test_models_api()
