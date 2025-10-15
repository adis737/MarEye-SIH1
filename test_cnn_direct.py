#!/usr/bin/env python3
"""
Test CNN model directly to see why enhancement is failing
"""

import os
import sys
import subprocess

def test_cnn_direct():
    """Test CNN model directly"""
    print("Testing CNN model directly...")
    
    # Check if the CNN directory exists
    cnn_dir = "Deep_Sea-NN-main"
    if not os.path.exists(cnn_dir):
        print(f"CNN directory not found: {cnn_dir}")
        return
    
    # Check if the inference script exists
    inference_script = os.path.join(cnn_dir, "enhanced_inference.py")
    if not os.path.exists(inference_script):
        print(f"Inference script not found: {inference_script}")
        return
    
    # Use a test image
    test_image = "Deep_Sea-NN-main/data/test_imgs/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
    if not os.path.exists(test_image):
        print(f"Test image not found: {test_image}")
        return
    
    print(f"Using test image: {test_image}")
    
    # Run the CNN inference
    try:
        print("Running CNN inference...")
        result = subprocess.run([
            "python", "enhanced_inference.py", "--input", test_image
        ], cwd=cnn_dir, capture_output=True, text=True, timeout=60)
        
        print(f"Return code: {result.returncode}")
        print(f"STDOUT: {result.stdout}")
        print(f"STDERR: {result.stderr}")
        
        if result.returncode == 0:
            print("CNN inference completed successfully")
            
            # Check for output files
            output_dir = os.path.join(cnn_dir, "data", "test_output", "unetssim")
            if os.path.exists(output_dir):
                output_files = os.listdir(output_dir)
                print(f"Output files: {output_files}")
                
                # Look for the specific output file
                expected_output = os.path.basename(test_image)
                output_path = os.path.join(output_dir, expected_output)
                
                if os.path.exists(output_path):
                    print(f"Enhanced image found: {output_path}")
                    
                    # Check for metrics file
                    metrics_file = output_path.replace(os.path.splitext(output_path)[1], "_metrics.txt")
                    if os.path.exists(metrics_file):
                        print(f"Metrics file found: {metrics_file}")
                        with open(metrics_file, 'r') as f:
                            metrics_content = f.read()
                            print(f"Metrics content:\n{metrics_content}")
                    else:
                        print("No metrics file found")
                else:
                    print(f"Enhanced image not found: {output_path}")
            else:
                print(f"Output directory not found: {output_dir}")
        else:
            print("CNN inference failed")
            
    except subprocess.TimeoutExpired:
        print("CNN inference timed out")
    except Exception as e:
        print(f"Error running CNN inference: {e}")

if __name__ == "__main__":
    test_cnn_direct()
