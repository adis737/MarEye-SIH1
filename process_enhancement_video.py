#!/usr/bin/env python3
"""
Robust Video Enhancement Processor
Handles CNN model processing with multiple codec fallbacks for browser compatibility
"""

import cv2
import numpy as np
import time
import json
import torch
import torch.nn as nn
from skimage.metrics import peak_signal_noise_ratio as psnr
from skimage.metrics import structural_similarity as ssim
import sys
import os

# Add the current directory to Python path to import model
cnn_dir = os.path.normpath(r'Deep_Sea-NN-main')
sys.path.insert(0, cnn_dir)

# Import the model architecture
from model import Unet

class VideoEnhancer:
    def __init__(self, model_path):
        """Initialize the video enhancer with the trained CNN model"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Load the trained model
        self.model = Unet(in_channels=3, out_channels=3, init_features=32)
        
        # Load checkpoint with weights_only=False for compatibility with older checkpoints
        checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
        
        # Handle different checkpoint formats
        if isinstance(checkpoint, dict):
            if 'state_dict' in checkpoint:
                self.model.load_state_dict(checkpoint['state_dict'])
            elif 'model_state_dict' in checkpoint:
                self.model.load_state_dict(checkpoint['model_state_dict'])
            else:
                # Assume it's a state dict directly
                self.model.load_state_dict(checkpoint)
        else:
            # The checkpoint is the model object itself
            self.model = checkpoint
        
        self.model.to(self.device)
        self.model.eval()
        print(f"Model loaded successfully from {model_path}")
    
    def preprocess_frame(self, frame):
        """Preprocess frame for the CNN model"""
        # Resize to model input size (256x256 as per training config)
        frame_resized = cv2.resize(frame, (256, 256))
        
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
        
        # Normalize to [0, 1]
        frame_normalized = frame_rgb.astype(np.float32) / 255.0
        
        # Convert to tensor and add batch dimension
        frame_tensor = torch.from_numpy(frame_normalized).permute(2, 0, 1).unsqueeze(0)
        frame_tensor = frame_tensor.to(self.device)
        
        return frame_tensor, frame_resized.shape[:2]
    
    def postprocess_frame(self, enhanced_tensor, original_shape):
        """Postprocess enhanced frame from the CNN model"""
        # Convert tensor back to numpy
        enhanced_np = enhanced_tensor.squeeze(0).permute(1, 2, 0).cpu().numpy()
        
        # Denormalize
        enhanced_np = np.clip(enhanced_np * 255.0, 0, 255).astype(np.uint8)
        
        # Convert RGB back to BGR
        enhanced_bgr = cv2.cvtColor(enhanced_np, cv2.COLOR_RGB2BGR)
        
        # Resize back to original frame size
        enhanced_frame = cv2.resize(enhanced_bgr, (original_shape[1], original_shape[0]))
        
        return enhanced_frame
    
    def enhance_frame(self, frame):
        """Enhance a single frame using the trained CNN model"""
        with torch.no_grad():
            # Preprocess frame
            frame_tensor, resized_shape = self.preprocess_frame(frame)
            
            # Run inference
            enhanced_tensor = self.model(frame_tensor)
            
            # Postprocess frame
            enhanced_frame = self.postprocess_frame(enhanced_tensor, frame.shape[:2])
            
            return enhanced_frame

def calculate_uiqm(img):
    """Calculate UIQM for a frame"""
    # Convert to float
    img_float = img.astype(np.float32) / 255.0
    
    # Calculate contrast (standard deviation)
    contrast = np.std(img_float)
    
    # Calculate saturation
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    saturation = np.mean(hsv[:, :, 1]) / 255.0
    
    # Calculate sharpness (gradient magnitude)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    sharpness = np.mean(np.abs(laplacian))
    
    # Calculate colorfulness (simplified)
    r, g, b = cv2.split(img)
    rg = np.absolute(r - g)
    yb = np.absolute(0.5 * (r + g) - b)
    colorfulness = np.sqrt((rg.std() ** 2) + (yb.std() ** 2)) + (0.3 * np.absolute(rg.mean()) + 0.1 * np.absolute(yb.mean()))
    
    # Combine metrics (simplified UIQM)
    uiqm = (contrast * 100) + (saturation * 50) + (sharpness / 100) + (colorfulness * 25)
    return uiqm

def ensure_even_dimensions(width, height):
    """Ensure dimensions are even (required for some codecs)"""
    if width % 2 != 0:
        width -= 1
    if height % 2 != 0:
        height -= 1
    return width, height

def test_codec_compatibility(fourcc, output_path, fps, width, height):
    """Test if a codec can create a video writer"""
    try:
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        if out.isOpened():
            out.release()
            return True
        else:
            out.release()
            return False
    except Exception:
        return False

def enhance_video_robust(input_path, output_path, model_path):
    """Enhance video with robust codec handling and multiple fallbacks"""
    start_time = time.time()
    
    print(f"Starting robust video enhancement...")
    print(f"Input: {input_path}")
    print(f"Output: {output_path}")
    print(f"Model: {model_path}")
    
    # Initialize the video enhancer
    try:
        enhancer = VideoEnhancer(model_path)
    except Exception as e:
        return {'error': f'Failed to load model: {str(e)}'}
    
    # Open input video
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        return {'error': 'Could not open input video'}
    
    # Get video properties
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Ensure even dimensions (required for some codecs)
    width, height = ensure_even_dimensions(width, height)
    
    print(f"Video properties: {width}x{height} @ {fps}fps, {total_frames} frames")
    
    # Test codecs in order of browser compatibility
    # H.264 is the most browser-compatible codec
    codecs_to_try = [
        ('avc1', 'H.264', cv2.VideoWriter_fourcc(*'avc1')),      # Best browser support
        ('H264', 'H.264', cv2.VideoWriter_fourcc(*'H264')),      # Alternative H.264
        ('X264', 'H.264', cv2.VideoWriter_fourcc(*'X264')),      # Another H.264 variant
        ('mp4v', 'MPEG-4', cv2.VideoWriter_fourcc(*'mp4v')),     # Fallback
        ('MJPG', 'Motion JPEG', cv2.VideoWriter_fourcc(*'MJPG')), # Last resort
    ]
    
    out = None
    used_codec = None
    
    # Test each codec
    for codec_name, codec_desc, fourcc in codecs_to_try:
        print(f"Testing {codec_desc} codec...")
        if test_codec_compatibility(fourcc, output_path, fps, width, height):
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            if out.isOpened():
                used_codec = codec_desc
                print(f"[SUCCESS] Successfully opened video writer with {codec_desc} codec")
                break
            else:
                out.release()
                out = None
        else:
            print(f"[FAILED] {codec_desc} codec not supported")
    
    if not out or not out.isOpened():
        cap.release()
        return {'error': f'Could not create output video with any codec. Tried: {[desc for _, desc, _ in codecs_to_try]}'}
    
    # Process frames
    frame_count = 0
    total_psnr = 0
    total_ssim = 0
    total_uiqm_original = 0
    total_uiqm_enhanced = 0
    
    print(f"Processing {total_frames} frames with CNN model...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print(f"Finished processing {frame_count} frames")
            break
        
        try:
            # Resize frame to even dimensions if needed
            if frame.shape[1] != width or frame.shape[0] != height:
                frame = cv2.resize(frame, (width, height))
            
            # Enhance frame using CNN model
            enhanced_frame = enhancer.enhance_frame(frame)
            
            # Write enhanced frame
            out.write(enhanced_frame)
        except Exception as e:
            print(f"Error processing frame {frame_count}: {e}")
            continue
        
        # Calculate metrics for this frame
        original_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        enhanced_gray = cv2.cvtColor(enhanced_frame, cv2.COLOR_BGR2GRAY)
        
        frame_psnr = psnr(original_gray, enhanced_gray)
        frame_ssim = ssim(original_gray, enhanced_gray)
        frame_uiqm_original = calculate_uiqm(frame)
        frame_uiqm_enhanced = calculate_uiqm(enhanced_frame)
        
        total_psnr += frame_psnr
        total_ssim += frame_ssim
        total_uiqm_original += frame_uiqm_original
        total_uiqm_enhanced += frame_uiqm_enhanced
        
        frame_count += 1
        
        # Progress update every 30 frames
        if frame_count % 30 == 0:
            print(f"Processed {frame_count}/{total_frames} frames...")
    
    # Cleanup
    cap.release()
    out.release()
    
    # Check if output file was created
    if os.path.exists(output_path):
        file_size = os.path.getsize(output_path)
        print(f"[SUCCESS] Output video created successfully: {output_path}")
        print(f"[SUCCESS] Output video size: {file_size} bytes")
        print(f"[SUCCESS] Used codec: {used_codec}")
    else:
        print(f"[ERROR] Output video file not created: {output_path}")
        return {'error': 'Output video file was not created'}
    
    # Calculate average metrics
    avg_psnr = total_psnr / frame_count if frame_count > 0 else 0
    avg_ssim = total_ssim / frame_count if frame_count > 0 else 0
    avg_uiqm_original = total_uiqm_original / frame_count if frame_count > 0 else 0
    avg_uiqm_enhanced = total_uiqm_enhanced / frame_count if frame_count > 0 else 0
    avg_uiqm_improvement = avg_uiqm_enhanced - avg_uiqm_original
    
    processing_time = time.time() - start_time
    print(f"[SUCCESS] CNN video processing completed in {processing_time:.2f} seconds")
    print(f"[SUCCESS] Final metrics - PSNR: {avg_psnr:.2f}, SSIM: {avg_ssim:.3f}, UIQM improvement: {avg_uiqm_improvement:.2f}")
    
    # Check if enhancement actually improved quality
    if avg_uiqm_improvement < 0:
        print(f"[WARNING] UIQM improvement is negative ({avg_uiqm_improvement:.2f}), model may be degrading quality")
        print(f"[INFO] Consider using a better trained model or different enhancement approach")
    
    # Return results
    return {
        'psnr': avg_psnr,
        'ssim': avg_ssim,
        'uiqm_original': avg_uiqm_original,
        'uiqm_enhanced': avg_uiqm_enhanced,
        'uiqm_improvement': avg_uiqm_improvement,
        'processing_time': processing_time,
        'frames_processed': frame_count,
        'fps': fps,
        'duration': frame_count / fps if fps > 0 else 0,
        'codec_used': used_codec,
        'output_size': file_size,
        'enhancement_quality': 'degraded' if avg_uiqm_improvement < 0 else 'improved'
    }

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 4:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        model_path = sys.argv[3]
    else:
        input_path = os.path.normpath(r"temp/input/test_video.mp4")
        output_path = os.path.normpath(r"temp/output/enhanced_test_video.mp4")
        model_path = os.path.normpath(r"Deep_Sea-NN-main/snapshots/unetSSIM/model_epoch_4_unetSSIM_MODEL.ckpt")
    
    result = enhance_video_robust(input_path, output_path, model_path)
    print(json.dumps(result))
