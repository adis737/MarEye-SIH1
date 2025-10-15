#!/usr/bin/env python3
"""
Convert video to H.264 codec for browser compatibility
Uses ffmpeg-python for reliable conversion
"""

import sys
import os
import subprocess

def convert_to_h264(input_path, output_path):
    """Convert video to H.264 codec using ffmpeg"""
    try:
        # Check if ffmpeg is available
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, 
                              text=True)
        if result.returncode != 0:
            print("ERROR: ffmpeg not found. Please install ffmpeg.")
            return False
            
        # Convert using ffmpeg with H.264 codec
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'libx264',  # Use H.264 codec
            '-preset', 'fast',   # Fast encoding
            '-crf', '23',        # Quality (lower = better, 18-28 is good)
            '-c:a', 'aac',       # Audio codec
            '-b:a', '128k',      # Audio bitrate
            '-movflags', '+faststart',  # Enable streaming
            '-y',                # Overwrite output
            output_path
        ]
        
        print(f"Converting video to H.264...")
        print(f"Command: {' '.join(cmd)}")
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"[SUCCESS] Video converted to H.264: {output_path}")
            if os.path.exists(output_path):
                size = os.path.getsize(output_path)
                print(f"[SUCCESS] Output size: {size} bytes")
                return True
            else:
                print(f"[ERROR] Output file not created")
                return False
        else:
            print(f"[ERROR] ffmpeg conversion failed")
            print(f"stderr: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("ERROR: ffmpeg not found. Please install ffmpeg.")
        return False
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_to_h264.py <input_video> <output_video>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(input_path):
        print(f"ERROR: Input file not found: {input_path}")
        sys.exit(1)
    
    success = convert_to_h264(input_path, output_path)
    sys.exit(0 if success else 1)
