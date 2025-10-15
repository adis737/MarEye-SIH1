#!/usr/bin/env python3
"""
Debug the API detection by simulating the exact same logic
"""

import torch
import cv2
import numpy as np
import os
import json

def debug_api_detection():
    """Debug API detection logic"""
    print("Debugging API detection logic...")
    
    # Simulate the API logic
    input_path = "Deep_Sea-NN-main/data/test_imgs/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
    output_path = "debug_api_output.jpg"
    
    if not os.path.exists(input_path):
        print(f"Input file not found: {input_path}")
        return
    
    # Try to load YOLO model
    model_path = "best.pt"
    print(f"Looking for model at: {model_path}")
    
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}")
        print("Falling back to pre-trained YOLOv8 model...")
        
        try:
            from ultralytics import YOLO
            model = YOLO('yolov8n.pt')
            model_type = 'pretrained_fallback'
            print("Using pre-trained YOLOv8 model as fallback")
        except Exception as pretrained_error:
            print(f"Failed to load pre-trained model: {str(pretrained_error)}")
            return
    else:
        print("Custom model found, but we'll skip it for testing")
        return
    
    # Load image
    img = cv2.imread(input_path)
    if img is None:
        print(f"Could not load image: {input_path}")
        return
        
    print(f"Image loaded successfully: {img.shape}")
    
    # Run detection
    print("Running YOLO detection...")
    
    # Define class names based on model type
    if model_type == 'pretrained_fallback':
        # Use pre-trained model's class names
        class_names = model.names
    else:
        # Use custom model class names
        class_names = ['submarine', 'auv', 'mines', 'divers']
    
    print(f"Model type: {model_type}")
    print(f"Class names: {class_names}")
    
    # Use lower confidence for pre-trained model
    conf_threshold = 0.1 if model_type == 'pretrained_fallback' else 0.5
    print(f"Confidence threshold: {conf_threshold}")
    
    results = model.predict(img, conf=conf_threshold, iou=0.45, verbose=False)
    result = results[0]  # Get first result
    
    print(f"Raw results: {len(result.boxes) if result.boxes is not None else 0} detections")
    
    detections = []
    
    if result.boxes is not None and len(result.boxes) > 0:
        boxes = result.boxes.xyxy.cpu().numpy()  # Get bounding boxes
        confidences = result.boxes.conf.cpu().numpy()  # Get confidences
        class_ids = result.boxes.cls.cpu().numpy().astype(int)  # Get class IDs
        
        print(f"Processing {len(boxes)} raw detections...")
        
        # Define mapping from COCO classes to marine classes for pre-trained model
        marine_mapping = {
            'boat': 'submarine',
            'ship': 'submarine', 
            'person': 'divers',
            'backpack': 'auv',
            'suitcase': 'auv',
            'bottle': 'mines',
            'cup': 'mines',
            'bowl': 'mines',
            'sports ball': 'mines',
            'tennis racket': 'auv',
            'frisbee': 'mines',
            'kite': 'auv'
        }
        
        for i in range(len(boxes)):
            x1, y1, x2, y2 = boxes[i]
            confidence = float(confidences[i])
            class_id = int(class_ids[i])
            
            if model_type == 'pretrained_fallback':
                # Use marine mapping for pre-trained model
                original_class = class_names[class_id] if class_id < len(class_names) else f'class_{class_id}'
                class_name = marine_mapping.get(original_class, original_class)
                
                print(f"  Raw detection {i+1}: {original_class} -> {class_name} (confidence: {confidence:.3f})")
                
                # Only include marine-relevant detections or high confidence ones
                if class_name in ['submarine', 'auv', 'mines', 'divers'] or confidence > 0.3:
                    detections.append({
                        'class': class_name,
                        'confidence': confidence,
                        'bbox': [float(x1), float(y1), float(x2-x1), float(y2-y1)]  # [x, y, width, height]
                    })
                    print(f"    -> Added to marine detections")
                else:
                    print(f"    -> Skipped (not marine-relevant)")
            else:
                # Use original class names for custom model
                class_name = class_names[class_id] if class_id < len(class_names) else f'class_{class_id}'
                detections.append({
                    'class': class_name,
                    'confidence': confidence,
                    'bbox': [float(x1), float(y1), float(x2-x1), float(y2-y1)]  # [x, y, width, height]
                })
    
    print(f"Final marine detections: {len(detections)}")
    
    # Save annotated image
    try:
        annotated_img = result.plot()  # ultralytics method
        cv2.imwrite(output_path, annotated_img)
        print(f"Annotated image saved to: {output_path}")
    except Exception as save_error:
        print(f"Failed to save annotated image: {str(save_error)}")
        # Fallback: save original image
        cv2.imwrite(output_path, img)
        print(f"Saved original image to: {output_path}")
    
    # Return results in API format
    result_data = {
        'detections': detections,
        'total_objects': len(detections)
    }
    
    print(f"\nAPI Result: {json.dumps(result_data, indent=2)}")
    
    return result_data

if __name__ == "__main__":
    debug_api_detection()
