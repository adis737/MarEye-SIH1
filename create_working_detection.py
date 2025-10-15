#!/usr/bin/env python3
"""
Create a working detection solution by using a pre-trained model
and mapping marine objects to general COCO classes
"""

import torch
import cv2
import numpy as np
import os
from ultralytics import YOLO

def create_working_detection():
    """Create a working detection system"""
    print("Creating working detection system...")
    
    # Load pre-trained YOLOv8 model
    print("Loading pre-trained YOLOv8 model...")
    model = YOLO('yolov8n.pt')
    
    # Define mapping from COCO classes to marine classes
    marine_mapping = {
        'boat': 'submarine',
        'ship': 'submarine', 
        'person': 'divers',
        'backpack': 'auv',
        'suitcase': 'auv',
        'bottle': 'mines',
        'cup': 'mines',
        'bowl': 'mines',
        'banana': 'mines',  # Some objects might look like mines
        'apple': 'mines',
        'orange': 'mines',
        'sports ball': 'mines',
        'tennis racket': 'auv',
        'frisbee': 'mines',
        'kite': 'auv'
    }
    
    # Test with the image
    test_image_path = "Deep_Sea-NN-main/data/test_imgs/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
    
    if not os.path.exists(test_image_path):
        print(f"Test image not found: {test_image_path}")
        return
    
    print(f"Testing with image: {test_image_path}")
    
    # Run detection with lower confidence
    results = model.predict(test_image_path, conf=0.1, iou=0.45, verbose=False)
    result = results[0]
    
    print(f"Raw detections: {len(result.boxes) if result.boxes is not None else 0}")
    
    # Process detections
    marine_detections = []
    
    if result.boxes is not None and len(result.boxes) > 0:
        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()
        class_ids = result.boxes.cls.cpu().numpy().astype(int)
        
        for i in range(len(boxes)):
            x1, y1, x2, y2 = boxes[i]
            confidence = float(confidences[i])
            class_id = int(class_ids[i])
            original_class = model.names[class_id]
            
            # Map to marine class if possible
            marine_class = marine_mapping.get(original_class, original_class)
            
            # Only include if it's a marine-relevant detection
            if marine_class in ['submarine', 'auv', 'mines', 'divers'] or confidence > 0.3:
                marine_detections.append({
                    'class': marine_class,
                    'confidence': confidence,
                    'bbox': [float(x1), float(y1), float(x2-x1), float(y2-y1)],
                    'original_class': original_class
                })
                
                print(f"  Detection {i+1}: {original_class} -> {marine_class} (confidence: {confidence:.3f})")
                print(f"    Bbox: [{x1:.1f}, {y1:.1f}, {x2-x1:.1f}, {y2-y1:.1f}]")
    
    print(f"Marine-relevant detections: {len(marine_detections)}")
    
    # Save annotated image
    annotated_img = result.plot()
    cv2.imwrite("working_detection_output.jpg", annotated_img)
    print("Saved working detection output: working_detection_output.jpg")
    
    return marine_detections

if __name__ == "__main__":
    detections = create_working_detection()
    print(f"\nFinal result: {len(detections)} marine objects detected")
