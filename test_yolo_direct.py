#!/usr/bin/env python3
"""
Direct test of YOLO model without API
"""

import torch
import cv2
import numpy as np
import os

def test_yolo_direct():
    """Test YOLO model directly"""
    print("Testing YOLO model directly...")
    
    model_path = "best.pt"
    if not os.path.exists(model_path):
        print(f"Model not found: {model_path}")
        return
    
    # Create a test image
    test_img = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    cv2.imwrite("test_input.jpg", test_img)
    
    try:
        # Try ultralytics first
        print("Trying ultralytics YOLO...")
        from ultralytics import YOLO
        model = YOLO(model_path)
        
        results = model.predict("test_input.jpg", conf=0.5, iou=0.45, verbose=False)
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
        
        # Save annotated image
        annotated_img = result.plot()
        cv2.imwrite("test_output_ultralytics.jpg", annotated_img)
        print("Saved annotated image: test_output_ultralytics.jpg")
        
    except Exception as e:
        print(f"Ultralytics failed: {e}")
        
        # Try torch.hub
        try:
            print("Trying torch.hub YOLO...")
            model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path, force_reload=True, trust_repo=True)
            model.conf = 0.5
            model.iou = 0.45
            
            results = model("test_input.jpg")
            
            print(f"Torch.hub results: {len(results.xyxy[0])} detections")
            
            class_names = ['submarine', 'auv', 'mines', 'divers']
            
            for i, (*box, conf, cls) in enumerate(results.xyxy[0]):
                x1, y1, x2, y2 = box
                confidence = float(conf)
                class_id = int(cls)
                class_name = class_names[class_id] if class_id < len(class_names) else f'class_{class_id}'
                
                print(f"  Detection {i+1}: {class_name} (confidence: {confidence:.3f})")
                print(f"    Bbox: [{x1:.1f}, {y1:.1f}, {x2-x1:.1f}, {y2-y1:.1f}]")
            
            # Save annotated image
            annotated_img = results.render()[0]
            cv2.imwrite("test_output_torchhub.jpg", annotated_img)
            print("Saved annotated image: test_output_torchhub.jpg")
            
        except Exception as e2:
            print(f"Torch.hub also failed: {e2}")
    
    # Cleanup
    if os.path.exists("test_input.jpg"):
        os.remove("test_input.jpg")

if __name__ == "__main__":
    test_yolo_direct()
