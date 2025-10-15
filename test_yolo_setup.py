#!/usr/bin/env python3
"""
Test script to verify YOLO setup and dependencies
"""

import sys
import os

def test_imports():
    """Test if required packages are installed"""
    print("Testing Python package imports...")
    
    try:
        import torch
        print(f"[OK] PyTorch: {torch.__version__}")
    except ImportError as e:
        print(f"[ERROR] PyTorch not found: {e}")
        return False
    
    try:
        import cv2
        print(f"[OK] OpenCV: {cv2.__version__}")
    except ImportError as e:
        print(f"[ERROR] OpenCV not found: {e}")
        return False
    
    try:
        import numpy as np
        print(f"[OK] NumPy: {np.__version__}")
    except ImportError as e:
        print(f"[ERROR] NumPy not found: {e}")
        return False
    
    return True

def test_yolo_model():
    """Test if YOLO model can be loaded"""
    print("\nTesting YOLO model...")
    
    model_path = "best.pt"
    if not os.path.exists(model_path):
        print(f"[ERROR] YOLO model not found at: {model_path}")
        return False
    
    print(f"[OK] YOLO model found: {model_path}")
    print(f"   Size: {os.path.getsize(model_path) / (1024*1024):.1f} MB")
    
    try:
        import torch
        model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path)
        print("[OK] YOLO model loaded successfully")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to load YOLO model: {e}")
        return False

def test_data_yaml():
    """Test if data.yaml exists and is valid"""
    print("\nTesting data.yaml...")
    
    yaml_path = "data.yaml"
    if not os.path.exists(yaml_path):
        print(f"[ERROR] data.yaml not found at: {yaml_path}")
        return False
    
    print(f"[OK] data.yaml found: {yaml_path}")
    
    try:
        import yaml
        with open(yaml_path, 'r') as f:
            data = yaml.safe_load(f)
        
        print(f"   Classes: {data.get('names', [])}")
        print(f"   Number of classes: {data.get('nc', 0)}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to read data.yaml: {e}")
        return False

def main():
    print("=== YOLO Setup Test ===")
    
    # Test imports
    imports_ok = test_imports()
    
    # Test data.yaml
    yaml_ok = test_data_yaml()
    
    # Test YOLO model
    model_ok = test_yolo_model()
    
    print("\n=== Summary ===")
    if imports_ok and yaml_ok and model_ok:
        print("[OK] All tests passed! YOLO setup is working correctly.")
    else:
        print("[ERROR] Some tests failed. Please check the issues above.")
        
        if not imports_ok:
            print("\nTo fix import issues, run:")
            print("pip install torch torchvision opencv-python numpy ultralytics")
        
        if not yaml_ok:
            print("\nMake sure data.yaml exists in the project root.")
        
        if not model_ok:
            print("\nMake sure best.pt exists in the project root.")

if __name__ == "__main__":
    main()
