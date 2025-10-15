#!/usr/bin/env python3
"""
Test the model with different approaches to understand why it's not detecting
"""

import torch
import cv2
import numpy as np
import os
import yaml

def test_model_training_data():
    """Test model with different approaches"""
    print("Testing model training data and approach...")
    
    # Check data.yaml
    yaml_path = "data.yaml"
    if os.path.exists(yaml_path):
        with open(yaml_path, 'r') as f:
            data = yaml.safe_load(f)
        print(f"Data.yaml classes: {data.get('names', [])}")
        print(f"Number of classes: {data.get('nc', 0)}")
    
    # Check if there are training images
    train_path = "yolov11_dataset/images"
    if os.path.exists(train_path):
        train_images = [f for f in os.listdir(train_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        print(f"Found {len(train_images)} training images")
        
        if train_images:
            # Test with a training image
            test_train_image = os.path.join(train_path, train_images[0])
            print(f"Testing with training image: {test_train_image}")
            
            try:
                from ultralytics import YOLO
                model = YOLO("best.pt")
                
                results = model.predict(test_train_image, conf=0.1, iou=0.45, verbose=False)
                result = results[0]
                
                print(f"Training image results: {len(result.boxes) if result.boxes is not None else 0} detections")
                
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
                else:
                    print("  No detections on training image either!")
                    
            except Exception as e:
                print(f"Error testing training image: {e}")
    else:
        print("Training dataset not found")
    
    # Test with a simple synthetic image
    print(f"\n--- Testing with synthetic mine image ---")
    
    # Create a simple synthetic image with a mine-like object
    synthetic_img = np.zeros((640, 640, 3), dtype=np.uint8)
    synthetic_img[:] = (50, 100, 150)  # Blue background
    
    # Draw a simple mine-like object (circle with spikes)
    center = (320, 320)
    radius = 50
    cv2.circle(synthetic_img, center, radius, (100, 100, 100), -1)  # Gray circle
    
    # Add some spikes
    for angle in range(0, 360, 30):
        x = int(center[0] + (radius + 20) * np.cos(np.radians(angle)))
        y = int(center[1] + (radius + 20) * np.sin(np.radians(angle)))
        cv2.circle(synthetic_img, (x, y), 5, (150, 150, 150), -1)
    
    cv2.imwrite("synthetic_mine.jpg", synthetic_img)
    print("Created synthetic mine image")
    
    try:
        from ultralytics import YOLO
        model = YOLO("best.pt")
        
        results = model.predict("synthetic_mine.jpg", conf=0.1, iou=0.45, verbose=False)
        result = results[0]
        
        print(f"Synthetic image results: {len(result.boxes) if result.boxes is not None else 0} detections")
        
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
        else:
            print("  No detections on synthetic image either!")
            
    except Exception as e:
        print(f"Error testing synthetic image: {e}")
    
    # Check model file size and info
    print(f"\n--- Model File Information ---")
    if os.path.exists("best.pt"):
        size_mb = os.path.getsize("best.pt") / (1024 * 1024)
        print(f"Model file size: {size_mb:.1f} MB")
        
        # Try to load model and get more info
        try:
            model = torch.load("best.pt", map_location='cpu')
            print(f"Model type: {type(model)}")
            if hasattr(model, 'model'):
                print(f"Model architecture: {type(model.model)}")
        except Exception as e:
            print(f"Could not inspect model: {e}")

if __name__ == "__main__":
    test_model_training_data()
