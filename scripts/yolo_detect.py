#!/usr/bin/env python3
"""
Lightweight YOLO detection runner for Next.js API integration.

Usage:
  python scripts/yolo_detect.py --weights /path/to/model.pt --input /abs/input.jpg --outdir /abs/out_dir

Prints a single JSON line on success: {"path": "/abs/out/file.jpg"}
Exits non-zero on failure.
"""

import argparse
import json
import os
import sys
import glob


def main() -> int:
  parser = argparse.ArgumentParser()
  parser.add_argument("--weights", required=True)
  parser.add_argument("--input", required=True)
  parser.add_argument("--outdir", required=True)
  parser.add_argument("--media", choices=["image","video"], default=None, help="Hint output type")
  parser.add_argument("--conf", type=float, default=0.25)
  args = parser.parse_args()

  # Defer ultralytics import with clear error if unavailable
  try:
    from ultralytics import YOLO  # type: ignore
  except Exception as e:
    print(f"Ultralytics not available: {e}", file=sys.stderr)
    return 2

  os.makedirs(args.outdir, exist_ok=True)

  model = YOLO(args.weights)

  # For consistent output path management, use project/name layout
  project_dir = args.outdir
  run_name = "run"

  try:
    results = model.predict(
      source=args.input,
      save=True,
      save_txt=False,
      conf=args.conf,
      project=project_dir,
      name=run_name,
      exist_ok=True,
      verbose=False,
    )
  except Exception as e:
    print(f"YOLO prediction failed: {e}", file=sys.stderr)
    return 3

  # Find the saved file in project/run directory
  run_dir = os.path.join(project_dir, run_name)
  saved_path = None

  # Prefer same basename if present; else take first image/video file
  base = os.path.basename(args.input)
  base_noext, _ = os.path.splitext(base)

  # Search common image/video outputs
  patterns = [
    os.path.join(run_dir, f"{base_noext}.*"),
    os.path.join(run_dir, "labels", f"{base_noext}.*"),
    os.path.join(run_dir, "**", f"{base_noext}.*"),
  ]

  matches = []
  for pat in patterns:
    matches.extend(glob.glob(pat, recursive=True))

  # Fallback to any file in run_dir
  if not matches:
    matches = glob.glob(os.path.join(run_dir, "**", "*.*"), recursive=True)

  # Allowed extensions by media type
  image_exts = {".jpg", ".jpeg", ".png", ".bmp", ".gif"}
  video_exts = {".mp4", ".webm", ".avi", ".mov", ".mkv"}
  exts_allow = None
  if args.media == "image":
    exts_allow = image_exts
  elif args.media == "video":
    exts_allow = video_exts

  for m in matches:
    # Skip label .txt files
    if os.path.isdir(m):
      continue
    if m.lower().endswith(".txt"):
      continue
    if exts_allow is not None:
      _, ext = os.path.splitext(m)
      if ext.lower() not in exts_allow:
        continue
    saved_path = m
    break

  if not saved_path or not os.path.exists(saved_path):
    print(f"No output file found in {run_dir}", file=sys.stderr)
    return 4

  print(json.dumps({"path": os.path.abspath(saved_path)}))
  return 0


if __name__ == "__main__":
  raise SystemExit(main())


