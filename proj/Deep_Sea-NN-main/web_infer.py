import os
import sys

# Ensure repo root is on path so that imports like TRAINING_CONFIG work
REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

import shutil
from TRAINING_CONFIG import test_image_path, output_images_path, test_img_size, test_model_path
import test as test_module
import torch
from torch.serialization import add_safe_globals
import model as model_module
import cv2
import numpy as np
from PIL import Image
import json
try:
    # skimage provides robust PSNR/SSIM implementations
    from skimage.metrics import peak_signal_noise_ratio as sk_psnr, structural_similarity as sk_ssim
except Exception:
    sk_psnr = None
    sk_ssim = None

# Edge-device friendly defaults: prefer configured device in TRAINING_CONFIG, but
# also limit torch thread usage to avoid oversubscription on small CPUs.
try:
    import torch
    torch.set_num_threads(max(1, min(4, os.cpu_count() or 1)))
except Exception:
    pass


def run_for_single_image(image_filename: str) -> str:
    """Runs inference for a single file already placed in test_image_path.

    Returns path to the enhanced image written by the model.
    """
    # Allowlist model.Unet for torch.load when weights_only=True default is used
    try:
        add_safe_globals([model_module.Unet])
    except Exception:
        pass
    # Clean only output so current results are easy to locate; keep uploaded test image
    os.makedirs(output_images_path, exist_ok=True)
    try:
        for n in os.listdir(output_images_path):
            p = os.path.join(output_images_path, n)
            if os.path.isfile(p):
                os.remove(p)
    except Exception:
        pass

    # Run the batch-oriented testing which reads from folder and writes to output folder
    test_module.run_testing()
    # Output file has the same filename in output_images_path
    return os.path.join(output_images_path, image_filename)


def clear_test_dirs():
    # Deprecated: keeping for backward compatibility; no-op to avoid deleting uploaded input
    os.makedirs(test_image_path, exist_ok=True)
    os.makedirs(output_images_path, exist_ok=True)


if __name__ == "__main__":
    # CLI usage:
    #   python web_infer.py image <image_filename_in_test_dir>
    #   python web_infer.py video <input_video_path> <output_video_path>
    if len(sys.argv) < 3:
        print("Usage: python web_infer.py image <image_filename> | video <input_video> <output_video>")
        sys.exit(2)
    mode = sys.argv[1]
    if mode == "image":
        fname = sys.argv[2]
        out = run_for_single_image(fname)

        # Try to compute metrics between original (test_image_path/fname) and enhanced (out)
        metrics = {"psnr": None, "ssim": None, "uiqm": None, "uiqm_orig": None, "uiqm_enh": None}
        try:
            orig_path = os.path.join(test_image_path, fname)
            if os.path.isfile(orig_path) and os.path.isfile(out):
                # Load images as RGB
                orig = cv2.cvtColor(cv2.imread(orig_path), cv2.COLOR_BGR2RGB)
                enh = cv2.cvtColor(cv2.imread(out), cv2.COLOR_BGR2RGB)
                # Ensure same size
                if orig.shape != enh.shape:
                    enh = cv2.resize(enh, (orig.shape[1], orig.shape[0]))
                if sk_psnr is not None:
                    metrics["psnr"] = float(sk_psnr(orig, enh, data_range=255))
                if sk_ssim is not None:
                    metrics["ssim"] = float(sk_ssim(orig, enh, channel_axis=2, data_range=255))
                # Simple UIQM proxy (placeholder): use mean brightness contrast as proxy if no package
                # This avoids adding heavy dependencies; replace with proper UIQM if available.
                try:
                    gray_enh = cv2.cvtColor(enh, cv2.COLOR_RGB2GRAY)
                    gray_orig = cv2.cvtColor(orig, cv2.COLOR_RGB2GRAY)
                    contrast_gain = float(np.std(gray_enh) - np.std(gray_orig))
                    brightness_enh = float(np.mean(gray_enh))
                    brightness_orig = float(np.mean(gray_orig))
                    # proxy UIQM values for original and enhanced
                    uiqm_enh = max(0.0, brightness_enh / 5.0 + float(np.std(gray_enh)))
                    uiqm_orig = max(0.0, brightness_orig / 5.0 + float(np.std(gray_orig)))
                    metrics["uiqm_enh"] = round(uiqm_enh, 2)
                    metrics["uiqm_orig"] = round(uiqm_orig, 2)
                    metrics["uiqm"] = metrics["uiqm_enh"]
                except Exception:
                    pass
        except Exception:
            pass

        print(json.dumps({"path": out, "metrics": metrics}))
    elif mode == "video":
        if len(sys.argv) < 4:
            print("Usage: python web_infer.py video <input_video> <output_video>")
            sys.exit(2)
        input_video = sys.argv[2]
        output_video = sys.argv[3]

        # Prepare folders
        os.makedirs(test_image_path, exist_ok=True)
        os.makedirs(output_images_path, exist_ok=True)
        for folder in (test_image_path, output_images_path):
            for n in os.listdir(folder):
                p = os.path.join(folder, n)
                if os.path.isfile(p):
                    os.remove(p)

        cap = cv2.VideoCapture(input_video)
        if not cap.isOpened():
            print("ERROR: cannot open video")
            sys.exit(3)
        fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
        frames = []
        idx = 0
        # For metrics aggregation
        psnr_vals = []
        ssim_vals = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            # resize to test_img_size
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil = Image.fromarray(frame).resize((test_img_size, test_img_size))
            fname = f"frame_{idx:06d}.png"
            pil.save(os.path.join(test_image_path, fname))
            frames.append(fname)
            idx += 1
        cap.release()

        # Run batch inference
        test_module.run_testing()

        # Assemble video from output frames
        first = cv2.imread(os.path.join(output_images_path, frames[0]))
        height, width = first.shape[:2]
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        vw = cv2.VideoWriter(output_video, fourcc, fps, (width, height))
        series = []
        uiqm_vals = []
        uiqm_orig_vals = []
        for fname in frames:
            img = cv2.imread(os.path.join(output_images_path, fname))
            if img is None:
                continue
            # Compute frame-wise metrics if original exists and metrics libs available
            try:
                if sk_psnr is not None or sk_ssim is not None:
                    orig = cv2.imread(os.path.join(test_image_path, fname))
                    if orig is not None and orig.shape == img.shape:
                        if sk_psnr is not None:
                            psnr_val = float(sk_psnr(orig, img, data_range=255))
                            psnr_vals.append(psnr_val)
                        if sk_ssim is not None:
                            ssim_val = float(sk_ssim(orig, img, channel_axis=2, data_range=255))
                            ssim_vals.append(ssim_val)
                        # lightweight UIQM proxy using brightness and contrast
                        try:
                            gray_enh = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                            gray_orig = cv2.cvtColor(orig, cv2.COLOR_BGR2GRAY)
                            uiqm_enh = max(0.0, float(np.mean(gray_enh)) / 5.0 + float(np.std(gray_enh)))
                            uiqm_orig = max(0.0, float(np.mean(gray_orig)) / 5.0 + float(np.std(gray_orig)))
                            uiqm_vals.append(uiqm_enh)
                            uiqm_orig_vals.append(uiqm_orig)
                        except Exception:
                            uiqm_enh = None
                            uiqm_orig = None
                        # store per-frame entry for charting
                        series.append({
                            "frame": len(series) + 1,
                            "psnr": psnr_vals[-1] if psnr_vals else None,
                            "ssim": ssim_vals[-1] if ssim_vals else None,
                            "uiqm_enh": uiqm_enh,
                            "uiqm_orig": uiqm_orig
                        })
            except Exception:
                pass
            vw.write(img)
        vw.release()

        # Ensure browser-compatible video (H.264 MP4 if possible)
        try:
            if shutil.which("ffmpeg"):
                h264_path = os.path.splitext(output_video)[0] + "_h264.mp4"
                # faststart for web playback
                os.system(f'ffmpeg -y -i "{output_video}" -c:v libx264 -preset veryfast -pix_fmt yuv420p -movflags +faststart "{h264_path}"')
                if os.path.isfile(h264_path) and os.path.getsize(h264_path) > 0:
                    try:
                        os.remove(output_video)
                    except Exception:
                        pass
                    output_video = h264_path
        except Exception:
            pass

        vid_metrics = {
            "psnr": float(np.mean(psnr_vals)) if psnr_vals else None,
            "ssim": float(np.mean(ssim_vals)) if ssim_vals else None,
            "uiqm": float(np.mean(uiqm_vals)) if uiqm_vals else None,
            "uiqm_orig": float(np.mean(uiqm_orig_vals)) if uiqm_orig_vals else None,
            "series": series
        }
        print(json.dumps({"path": output_video, "metrics": vid_metrics}))
    else:
        print("Unknown mode")
        sys.exit(2)

