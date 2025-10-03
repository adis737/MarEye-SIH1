import os
import sys

repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from TRAINING_CONFIG import raw_image_path, clear_image_path, device  # noqa


def main() -> None:
    raw_files = sorted([
        f for f in os.listdir(raw_image_path)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ])
    lbl_files = sorted([
        f for f in os.listdir(clear_image_path)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ])

    missing_in_label = [f for f in raw_files if f not in lbl_files]
    missing_in_input = [f for f in lbl_files if f not in raw_files]

    print("RAW count:", len(raw_files))
    print("LABEL count:", len(lbl_files))
    print("Missing in label:", len(missing_in_label))
    if missing_in_label:
        print("Sample missing in label:", missing_in_label[:10])
    print("Missing in input:", len(missing_in_input))
    if missing_in_input:
        print("Sample missing in input:", missing_in_input[:10])

    print("Device selected:", device)


if __name__ == "__main__":
    main()


