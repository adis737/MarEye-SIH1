# Detection models setup (Windows PowerShell)

This project uses YOLO via Ultralytics for divers, mines, and submarines detection. Install Python deps in a virtual environment.

## Quick setup

1) Create and activate venv

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2) Install CPU PyTorch and Ultralytics

```powershell
pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install -r ml-models/requirements.txt
```

If you have a compatible NVIDIA GPU and drivers, replace the CPU line with the CUDA build from the PyTorch selector.

3) Optional (videos): install FFmpeg for better video encode/decode (e.g., via winget)

```powershell
winget install Gyan.FFmpeg
```

## Run a quick test

```powershell
python scripts/yolo_detect.py --weights "Detection model/divers/best.pt" --input public/test.jpg --outdir temp/test_out
```

The script prints a JSON line with the saved output path.
