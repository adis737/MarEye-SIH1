@echo off
echo 🧬 Gene Sequence Prediction Model Server
echo ================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo ✅ Python found

REM Check if model files exist
if not exist "..\Model\stack_meta_clf.pkl" (
    echo ❌ Model files not found in Model directory
    echo Please ensure all model files are present
    pause
    exit /b 1
)

echo ✅ Model files found

REM Install requirements
echo 📦 Installing dependencies...
cd ..\ml-models
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed

REM Start the server
echo 🚀 Starting model server...
echo 📍 Server will be available at: http://localhost:5000
echo 🛑 Press Ctrl+C to stop the server
echo ----------------------------------------

cd scripts
python model_wrapper.py

pause
