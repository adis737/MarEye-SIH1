#!/usr/bin/env python3
"""
YOLO Detection Helper Script for MarEye
This script provides a simple interface for running YOLO detection on images and videos.
"""

import torch
import cv2
import numpy as np
import json
import sys
import os
from pathlib import Path

def load_yolo_model(model_path="best.pt", conf_threshold=0.5, iou_threshold=0.45):
    """
    Load YOLO model with specified parameters.
    
    Args:
        model_path (str): Path to the YOLO model file
        conf_threshold (float): Confidence threshold for detections
        iou_threshold (float): IoU threshold for NMS
    
    Returns:
        YOLO model object or None if loading fails
    """
    try:
        if not os.path.exists(model_path):
            print(f"Error: Model file not found at {model_path}")
            return None
            
        # Load YOLO model using ultralytics
        model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path)
        model.conf = conf_threshold
        model.iou = iou_threshold
        
        print(f"YOLO model loaded successfully from {model_path}")
        return model
        
    except Exception as e:
        print(f"Error loading YOLO model: {str(e)}")
        return None

def detect_objects_in_image(model, image_path, output_path=None):
    """
    Detect objects in a single image.
    
    Args:
        model: Loaded YOLO model
        image_path (str): Path to input image
        output_path (str, optional): Path to save annotated image
    
    Returns:
        dict: Detection results with bounding boxes and confidence scores
    """
    try:
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Could not load image from {image_path}")
            return None
            
        # Run detection
        results = model(img)
        
        # Get detections
        detections = []
        class_names = ['submarine', 'auv', 'mines', 'divers']
        
        for *box, conf, cls in results.xyxy[0]:
            x1, y1, x2, y2 = box
            class_id = int(cls)
            confidence = float(conf)
            
            class_name = class_names[class_id] if class_id < len(class_names) else f'class_{class_id}'
            
            detections.append({
                'class': class_name,
                'confidence': confidence,
                'bbox': [float(x1), float(y1), float(x2-x1), float(y2-y1)]  # [x, y, width, height]
            })
        
        # Save annotated image if output path is provided
        if output_path:
            annotated_img = results.render()[0]
            cv2.imwrite(output_path, annotated_img)
            print(f"Annotated image saved to {output_path}")
        
        return {
            'detections': detections,
            'total_objects': len(detections),
            'image_shape': img.shape
        }
        
    except Exception as e:
        print(f"Error in image detection: {str(e)}")
        return None

def detect_objects_in_video(model, video_path, output_path):
    """
    Detect objects in a video file.
    
    Args:
        model: Loaded YOLO model
        video_path (str): Path to input video
        output_path (str): Path to save annotated video
    
    Returns:
        dict: Detection results with frame-by-frame detections
    """
    try:
        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error: Could not open video from {video_path}")
            return None
            
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"Processing video: {width}x{height} @ {fps} FPS, {total_frames} frames")
        
        # Setup video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        frame_count = 0
        all_detections = []
        class_names = ['submarine', 'auv', 'mines', 'divers']
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Run detection on frame
            results = model(frame)
            
            # Get detections for this frame
            frame_detections = []
            for *box, conf, cls in results.xyxy[0]:
                x1, y1, x2, y2 = box
                class_id = int(cls)
                confidence = float(conf)
                
                class_name = class_names[class_id] if class_id < len(class_names) else f'class_{class_id}'
                
                frame_detections.append({
                    'class': class_name,
                    'confidence': confidence,
                    'bbox': [float(x1), float(y1), float(x2-x1), float(y2-y1)],
                    'frame': frame_count
                })
            
            all_detections.extend(frame_detections)
            
            # Write annotated frame
            annotated_frame = results.render()[0]
            out.write(annotated_frame)
            
            frame_count += 1
            
            # Progress update
            if frame_count % 30 == 0:
                progress = (frame_count / total_frames) * 100
                print(f"Progress: {progress:.1f}% ({frame_count}/{total_frames} frames)")
        
        cap.release()
        out.release()
        
        print(f"Video processing completed. {frame_count} frames processed.")
        print(f"Annotated video saved to {output_path}")
        
        return {
            'detections': all_detections,
            'total_objects': len(all_detections),
            'frame_count': frame_count,
            'video_properties': {
                'width': width,
                'height': height,
                'fps': fps,
                'total_frames': total_frames
            }
        }
        
    except Exception as e:
        print(f"Error in video detection: {str(e)}")
        return None

def main():
    """
    Main function for command line usage.
    """
    if len(sys.argv) < 3:
        print("Usage:")
        print("  python yolo_detection_helper.py image <input_image> [output_image]")
        print("  python yolo_detection_helper.py video <input_video> <output_video>")
        print("  python yolo_detection_helper.py model_info")
        return
    
    command = sys.argv[1]
    
    if command == "model_info":
        # Display model information
        model_path = "best.pt"
        if os.path.exists(model_path):
            print(f"YOLO model found at: {model_path}")
            print(f"Model size: {os.path.getsize(model_path) / (1024*1024):.1f} MB")
            
            # Try to load model and get info
            model = load_yolo_model(model_path)
            if model:
                print("Model loaded successfully!")
                print("Detection classes: submarine, auv, mines, divers")
        else:
            print(f"YOLO model not found at: {model_path}")
        return
    
    # Load YOLO model
    model = load_yolo_model()
    if model is None:
        print("Failed to load YOLO model. Exiting.")
        return
    
    if command == "image":
        if len(sys.argv) < 3:
            print("Error: Input image path required")
            return
            
        input_image = sys.argv[2]
        output_image = sys.argv[3] if len(sys.argv) > 3 else None
        
        if not os.path.exists(input_image):
            print(f"Error: Input image not found: {input_image}")
            return
        
        print(f"Processing image: {input_image}")
        result = detect_objects_in_image(model, input_image, output_image)
        
        if result:
            print(f"Detection completed!")
            print(f"Objects found: {result['total_objects']}")
            for i, detection in enumerate(result['detections']):
                print(f"  {i+1}. {detection['class']} (confidence: {detection['confidence']:.3f})")
        else:
            print("Detection failed!")
    
    elif command == "video":
        if len(sys.argv) < 4:
            print("Error: Input and output video paths required")
            return
            
        input_video = sys.argv[2]
        output_video = sys.argv[3]
        
        if not os.path.exists(input_video):
            print(f"Error: Input video not found: {input_video}")
            return
        
        print(f"Processing video: {input_video}")
        result = detect_objects_in_video(model, input_video, output_video)
        
        if result:
            print(f"Video processing completed!")
            print(f"Total objects detected: {result['total_objects']}")
            print(f"Frames processed: {result['frame_count']}")
        else:
            print("Video processing failed!")
    
    else:
        print(f"Unknown command: {command}")
        print("Available commands: image, video, model_info")

if __name__ == "__main__":
    main()
