# Training labs

Real, multi-cell notebooks you can **actually train** in Colab — split into clear blocks (data · model · train · compare) so you can run them step by step and see each stage. Open **Runtime → Change runtime type → T4 GPU** first.

Two kinds:
- **Self-contained PyTorch** — train from scratch on bundled/synthetic data, no fragile installs (verified to train).
- **Foundation-model pipelines** — apply/fine-tune a pretrained model (CLIP, VideoMAE).

| Lab | Track | What you train | Open |
|---|---|---|---|
| Train a NeRF from scratch (tiny_nerf) | B · 3D & Neural Rendering | A NeRF MLP via photometric loss (PSNR climbs) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_nerf_from_scratch.ipynb) |
| Train a neural SDF (DeepSDF-style) | B · 3D & Neural Rendering | An MLP signed-distance field + marching-cubes surface | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_deepsdf_shape.ipynb) |
| Fit a body by reprojection (SMPLify mechanics) | A · Human Modeling | Pose by reprojection optimization (+ how to use real SMPL) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/A_smplify_fit.ipynb) |
| CLIP: zero-shot vs. trained linear probe | C/D · Foundation model | A linear probe on frozen CLIP features vs. zero-shot | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/CD_clip_zeroshot_probe.ipynb) |
| Fine-tune VideoMAE for action recognition | C · Egocentric Vision (foundation) | Fine-tune VideoMAE for action recognition | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/C_videomae_finetune.ipynb) |

> The three self-contained labs are verified to train (loss decreases) on CPU with small configs; raise `STEPS` for sharper results. The two foundation labs follow the official APIs and are meant to run on a Colab GPU (they download weights/data), so they are not pre-executed here.
