#!/usr/bin/env python3
"""
Startup script for the gene sequence prediction model server.
This script sets up the environment and starts the Flask API server.
"""

import os
import sys
import subprocess
import platform

def check_python_version():
    """Check if Python version is compatible."""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def check_model_files():
    """Check if required model files exist."""
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'Model')
    required_files = [
        'stack_meta_clf.pkl',
        'stack_label_encoder.pkl',
        'lgb_models_list.pkl',
        'xgb_models_list.pkl'
    ]
    
    missing_files = []
    for file in required_files:
        file_path = os.path.join(model_dir, file)
        if not os.path.exists(file_path):
            missing_files.append(file)
    
    if missing_files:
        print("❌ Missing model files:")
        for file in missing_files:
            print(f"   - {file}")
        print(f"\nModel directory: {model_dir}")
        return False
    
    print("✅ All model files found")
    return True

def install_requirements():
    """Install Python requirements."""
    requirements_file = os.path.join(os.path.dirname(__file__), '..', 'ml-models', 'requirements.txt')
    
    if not os.path.exists(requirements_file):
        print("❌ Requirements file not found")
        return False
    
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', requirements_file
        ], check=True, capture_output=True, text=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        print(f"Error output: {e.stderr}")
        return False

def start_server():
    """Start the Flask server."""
    script_dir = os.path.join(os.path.dirname(__file__), '..', 'ml-models', 'scripts')
    server_script = os.path.join(script_dir, 'model_wrapper.py')
    
    if not os.path.exists(server_script):
        print("❌ Model wrapper script not found")
        return False
    
    print("🚀 Starting model server...")
    print("📍 Server will be available at: http://localhost:5000")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Change to the script directory and run the server
        os.chdir(script_dir)
        subprocess.run([sys.executable, 'model_wrapper.py'], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        return False
    
    return True

def main():
    """Main function."""
    print("🧬 Gene Sequence Prediction Model Server")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check model files
    if not check_model_files():
        print("\n💡 Make sure all model files are in the Model/ directory")
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        print("\n💡 Try running: pip install -r ml-models/requirements.txt")
        sys.exit(1)
    
    # Start server
    if not start_server():
        sys.exit(1)

if __name__ == "__main__":
    main()
