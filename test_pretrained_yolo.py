#!/usr/bin/env python3
"""
Test with a pre-trained YOLO model to see if the issue is with the custom model
"""

import torch
import cv2
import numpy as np
import os

def test_pretrained_yolo():
    """Test with pre-trained YOLO model"""
    print("Testing with pre-trained YOLO model...")
    
    # Use the same test image
    test_image_path = "Deep_Sea-NN-main/data/test_imgs/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
    
    if not os.path.exists(test_image_path):
        print(f"Test image not found: {test_image_path}")
        return
    
    try:
        from ultralytics import YOLO
        
        # Test with pre-trained YOLOv8 model
        print("Loading pre-trained YOLOv8 model...")
        model = YOLO('yolov8n.pt')  # nano version for speed
        
        print("Running detection with pre-trained model...")
        results = model.predict(test_image_path, conf=0.3, iou=0.45, verbose=False)
        result = results[0]
        
        print(f"Pre-trained model results: {len(result.boxes) if result.boxes is not None else 0} detections")
        
        if result.boxes is not None and len(result.boxes) > 0:
            boxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            class_ids = result.boxes.cls.cpu().numpy().astype(int)
            
            for i in range(len(boxes)):
                x1, y1, x2, y2 = boxes[i]
                confidence = float(confidences[i])
                class_id = int(class_ids[i])
                class_name = model.names[class_id]
                
                print(f"  Detection {i+1}: {class_name} (confidence: {confidence:.3f})")
                print(f"    Bbox: [{x1:.1f}, {y1:.1f}, {x2-x1:.1f}, {y2-y1:.1f}]")
        else:
            print("  No objects detected with pre-trained model either")
        
        # Save annotated image
        annotated_img = result.plot()
        cv2.imwrite("pretrained_detection_output.jpg", annotated_img)
        print("Saved pre-trained detection output: pretrained_detection_output.jpg")
        
    except Exception as e:
        print(f"Error with pre-trained model: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_pretrained_yolo()
