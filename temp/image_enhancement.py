
import cv2
import numpy as np
import os
import time
import json
from skimage.metrics import peak_signal_noise_ratio as psnr
from skimage.metrics import structural_similarity as ssim

def enhance_image(input_path, output_path):
    """Enhance image using advanced OpenCV techniques"""
    start_time = time.time()
    
    # Read the original image
    original = cv2.imread(input_path)
    if original is None:
        return {'error': 'Could not read input image'}
    
    # Advanced enhancement pipeline
    # 1. Convert to LAB color space for better enhancement
    lab = cv2.cvtColor(original, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # 2. Apply CLAHE to L channel for contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    l = clahe.apply(l)
    
    # 3. Merge channels back
    enhanced_lab = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
    
    # 4. Apply bilateral filter for noise reduction while preserving edges
    enhanced = cv2.bilateralFilter(enhanced, 9, 75, 75)
    
    # 5. Apply unsharp masking for sharpening
    gaussian = cv2.GaussianBlur(enhanced, (0, 0), 2.0)
    enhanced = cv2.addWeighted(enhanced, 1.5, gaussian, -0.5, 0)
    
    # 6. Apply gamma correction for brightness adjustment
    gamma = 1.2
    lookup_table = np.array([((i / 255.0) ** (1.0 / gamma)) * 255 for i in range(256)]).astype("uint8")
    enhanced = cv2.LUT(enhanced, lookup_table)
    
    # 7. Clamp values to valid range
    enhanced = np.clip(enhanced, 0, 255).astype(np.uint8)
    
    # Save enhanced image
    cv2.imwrite(output_path, enhanced)
    
    # Calculate metrics
    processing_time = time.time() - start_time
    
    # Convert to grayscale for SSIM calculation
    original_gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    enhanced_gray = cv2.cvtColor(enhanced, cv2.COLOR_BGR2GRAY)
    
    # Calculate PSNR
    psnr_value = psnr(original_gray, enhanced_gray)
    
    # Calculate SSIM
    ssim_value = ssim(original_gray, enhanced_gray)
    
    # Calculate UIQM (Underwater Image Quality Measure)
    def calculate_uiqm(img):
        # Convert to float
        img_float = img.astype(np.float32) / 255.0
        
        # Calculate contrast (standard deviation)
        contrast = np.std(img_float)
        
        # Calculate saturation
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        saturation = np.mean(hsv[:,:,1]) / 255.0
        
        # Calculate sharpness (using Laplacian variance)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Calculate colorfulness
        b, g, r = cv2.split(img)
        colorfulness = np.sqrt(np.var(r) + np.var(g) + np.var(b)) / 255.0
        
        # Combine metrics (simplified UIQM)
        uiqm = (contrast * 100) + (saturation * 50) + (sharpness / 100) + (colorfulness * 25)
        return uiqm
    
    uiqm_original = calculate_uiqm(original)
    uiqm_enhanced = calculate_uiqm(enhanced)
    uiqm_improvement = uiqm_enhanced - uiqm_original
    
    # Generate analytics - this will be done after the main function returns
    # We'll create a separate analytics generation call
    
    return {
        'psnr': psnr_value,
        'ssim': ssim_value,
        'uiqm_original': uiqm_original,
        'uiqm_enhanced': uiqm_enhanced,
        'uiqm_improvement': uiqm_improvement,
        'processing_time': processing_time
    }

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 3:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
    else:
        input_path = "D:\MAREYE-frontend(no modules, .next,venv)\Oceanova---SIH\temp\input\auv.jpg"
        output_path = "D:\MAREYE-frontend(no modules, .next,venv)\Oceanova---SIH\temp\output\enhanced_auv.jpg"
    
    result = enhance_image(input_path, output_path)
    print(json.dumps(result))
