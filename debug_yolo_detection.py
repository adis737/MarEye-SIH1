#!/usr/bin/env python3
"""
Debug YOLO detection with different parameters
"""

import torch
import cv2
import numpy as np
import os

def debug_yolo_detection():
    """Debug YOLO detection with various parameters"""
    print("Debugging YOLO detection...")
    
    model_path = "best.pt"
    if not os.path.exists(model_path):
        print(f"Model not found: {model_path}")
        return
    
    # Use the same image that's showing in the interface
    test_image_path = "Deep_Sea-NN-main/data/test_imgs/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
    
    if not os.path.exists(test_image_path):
        print(f"Test image not found: {test_image_path}")
        return
    
    print(f"Using test image: {test_image_path}")
    
    try:
        from ultralytics import YOLO
        model = YOLO(model_path)
        
        # Test with different confidence thresholds
        confidence_thresholds = [0.1, 0.2, 0.3, 0.4, 0.5]
        
        for conf in confidence_thresholds:
            print(f"\n--- Testing with confidence threshold: {conf} ---")
            
            results = model.predict(test_image_path, conf=conf, iou=0.45, verbose=False)
            result = results[0]
            
            print(f"Results: {len(result.boxes) if result.boxes is not None else 0} detections")
            
            if result.boxes is not None and len(result.boxes) > 0:
                boxes = result.boxes.xyxy.cpu().numpy()
                confidences = result.boxes.conf.cpu().numpy()
                class_ids = result.boxes.cls.cpu().numpy().astype(int)
                
                class_names = ['submarine', 'auv', 'mines', 'divers']
                
                for i in range(len(boxes)):
                    x1, y1, x2, y2 = boxes[i]
                    confidence = float(confidences[i])
                    class_id = int(class_ids[i])
                    class_name = class_names[class_id] if class_id < len(class_names) else f'class_{class_id}'
                    
                    print(f"  Detection {i+1}: {class_name} (confidence: {confidence:.3f})")
                    print(f"    Bbox: [{x1:.1f}, {y1:.1f}, {x2-x1:.1f}, {y2-y1:.1f}]")
            else:
                print("  No objects detected")
        
        # Test with different input sizes
        print(f"\n--- Testing with different input sizes ---")
        
        # Load the image
        img = cv2.imread(test_image_path)
        if img is not None:
            print(f"Original image size: {img.shape}")
            
            # Test with different sizes
            sizes = [(640, 640), (416, 416), (320, 320)]
            
            for size in sizes:
                print(f"\nTesting with size: {size}")
                resized_img = cv2.resize(img, size)
                
                results = model.predict(resized_img, conf=0.1, iou=0.45, verbose=False)
                result = results[0]
                
                print(f"Results: {len(result.boxes) if result.boxes is not None else 0} detections")
                
                if result.boxes is not None and len(result.boxes) > 0:
                    boxes = result.boxes.xyxy.cpu().numpy()
                    confidences = result.boxes.conf.cpu().numpy()
                    class_ids = result.boxes.cls.cpu().numpy().astype(int)
                    
                    class_names = ['submarine', 'auv', 'mines', 'divers']
                    
                    for i in range(len(boxes)):
                        x1, y1, x2, y2 = boxes[i]
                        confidence = float(confidences[i])
                        class_id = int(class_ids[i])
                        class_name = class_names[class_id] if class_id < len(class_names) else f'class_{class_id}'
                        
                        print(f"  Detection {i+1}: {class_name} (confidence: {confidence:.3f})")
        
        # Check model info
        print(f"\n--- Model Information ---")
        print(f"Model classes: {model.names}")
        print(f"Model device: {model.device}")
        
        # Test with verbose output
        print(f"\n--- Testing with verbose output ---")
        results = model.predict(test_image_path, conf=0.1, iou=0.45, verbose=True)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_yolo_detection()
