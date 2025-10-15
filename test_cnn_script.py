#!/usr/bin/env python3
"""
Test the CNN script directly
"""

import sys
import os
import json

# Add the current directory to Python path
repo_root = os.path.dirname(os.path.abspath(__file__))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

def test_cnn_script():
    """Test the CNN script directly"""
    try:
        # Test with the images we know exist
        input_path = "Deep_Sea-NN-main/data/test_imgs/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
        output_path = "test_output.jpg"
        
        print(f"Testing CNN script...")
        print(f"Input: {input_path}")
        print(f"Output: {output_path}")
        
        if not os.path.exists(input_path):
            print(f"Input image not found: {input_path}")
            return
        
        # Import the CNN model components
        from test import run_testing
        from evaluation_metrics import evaluate_image_pair
        from TRAINING_CONFIG import test_image_path, output_images_path
        
        # Clear test directory and copy the input image
        if os.path.exists(test_image_path):
            import shutil
            shutil.rmtree(test_image_path)
        os.makedirs(test_image_path, exist_ok=True)
        
        # Copy the input image to test directory
        image_name = os.path.basename(input_path)
        shutil.copy2(input_path, os.path.join(test_image_path, image_name))
        
        # Run the CNN model
        print("Running CNN model inference...")
        run_testing()
        
        # Find the enhanced image
        enhanced_image_path = os.path.join(output_images_path, image_name)
        if not os.path.exists(enhanced_image_path):
            print("Enhanced image not found after CNN processing")
            return
        
        # Copy enhanced image to output path
        shutil.copy2(enhanced_image_path, output_path)
        
        # Calculate metrics
        print("Calculating evaluation metrics...")
        metrics = evaluate_image_pair(input_path, enhanced_image_path)
        
        print(f"Metrics: {metrics}")
        
        result = {
            'psnr': metrics.get('PSNR', 0),
            'ssim': metrics.get('SSIM', 0),
            'uiqm_original': metrics.get('UIQM_original', 0),
            'uiqm_enhanced': metrics.get('UIQM_enhanced', 0),
            'uiqm_improvement': metrics.get('UIQM_improvement', 0),
            'processing_time': 1.0
        }
        
        print(f"Final result: {result}")
        print(json.dumps(result))
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_cnn_script()
