#!/usr/bin/env python3
"""
Test YOLO model with a real image
"""

import torch
import cv2
import numpy as np
import os

def test_yolo_with_real_image():
    """Test YOLO model with a real image"""
    print("Testing YOLO model with real image...")
    
    model_path = "best.pt"
    if not os.path.exists(model_path):
        print(f"Model not found: {model_path}")
        return
    
    # Use an existing image from the project
    test_image_path = "Deep_Sea-NN-main/data/test_imgs/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
    
    if not os.path.exists(test_image_path):
        print(f"Test image not found: {test_image_path}")
        return
    
    print(f"Using test image: {test_image_path}")
    
    try:
        # Try ultralytics first
        print("Trying ultralytics YOLO...")
        from ultralytics import YOLO
        model = YOLO(model_path)
        
        results = model.predict(test_image_path, conf=0.3, iou=0.45, verbose=False)  # Lower confidence for testing
        result = results[0]
        
        print(f"Ultralytics results: {len(result.boxes) if result.boxes is not None else 0} detections")
        
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
        
        # Save annotated image
        annotated_img = result.plot()
        cv2.imwrite("test_output_real_image.jpg", annotated_img)
        print("Saved annotated image: test_output_real_image.jpg")
        
    except Exception as e:
        print(f"Ultralytics failed: {e}")
        
        # Try torch.hub
        try:
            print("Trying torch.hub YOLO...")
            model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path, force_reload=True, trust_repo=True)
            model.conf = 0.3  # Lower confidence for testing
            model.iou = 0.45
            
            results = model(test_image_path)
            
            print(f"Torch.hub results: {len(results.xyxy[0])} detections")
            
            class_names = ['submarine', 'auv', 'mines', 'divers']
            
            if len(results.xyxy[0]) > 0:
                for i, (*box, conf, cls) in enumerate(results.xyxy[0]):
                    x1, y1, x2, y2 = box
                    confidence = float(conf)
                    class_id = int(cls)
                    class_name = class_names[class_id] if class_id < len(class_names) else f'class_{class_id}'
                    
                    print(f"  Detection {i+1}: {class_name} (confidence: {confidence:.3f})")
                    print(f"    Bbox: [{x1:.1f}, {y1:.1f}, {x2-x1:.1f}, {y2-y1:.1f}]")
            else:
                print("  No objects detected")
            
            # Save annotated image
            annotated_img = results.render()[0]
            cv2.imwrite("test_output_real_image_torchhub.jpg", annotated_img)
            print("Saved annotated image: test_output_real_image_torchhub.jpg")
            
        except Exception as e2:
            print(f"Torch.hub also failed: {e2}")

if __name__ == "__main__":
    test_yolo_with_real_image()
