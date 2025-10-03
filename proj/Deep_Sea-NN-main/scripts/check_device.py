import os
import sys

repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

import torch
print("cuda available:", torch.cuda.is_available())
try:
    import torch_directml as tdl
    print("DirectML available:", True)
    d = tdl.device()
    print("DirectML device:", d)
except Exception as e:
    print("DirectML available:", False, "err=", e)

from TRAINING_CONFIG import device
print("Selected device:", device)
