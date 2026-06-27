# Training labs

Real, multi-cell notebooks you can **actually train** in Colab — split into clear blocks (data · model · train · compare) so you can run them step by step and see each stage. Open **Runtime → Change runtime type → T4 GPU** first.

Two kinds:
- **Self-contained PyTorch** — train from scratch on bundled/synthetic data, no fragile installs (verified to train).
- **Foundation-model pipelines** — apply/fine-tune a pretrained model (CLIP, VideoMAE).

| Lab | Track | Kind | What you train | Open |
|---|---|---|---|---|
| Fit a body by reprojection (SMPLify mechanics) | A · Human Modeling | PyTorch | pose by reprojection optimization (+ how to use real SMPL) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/A_smplify_fit.ipynb) |
| Train a motion diffusion model | A · Human Modeling | PyTorch | a DDPM that generates motion trajectories (ε-prediction) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/A_motion_diffusion.ipynb) |
| Train a NeRF from scratch (tiny_nerf) | B · 3D & Neural Rendering | PyTorch | a NeRF MLP via photometric loss (PSNR climbs) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_nerf_from_scratch.ipynb) |
| Train a neural SDF (DeepSDF-style) | B · 3D & Neural Rendering | PyTorch | an MLP signed-distance field + marching-cubes surface | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_deepsdf_shape.ipynb) |
| 2D Gaussian Splatting — fit an image | B · 3D & Neural Rendering | PyTorch | N anisotropic 2D Gaussians optimized to reconstruct an image | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_gaussian_splatting_2d.ipynb) |
| CLIP: zero-shot vs. trained linear probe | C/D · Foundation model | Foundation | a linear probe on frozen CLIP features vs. zero-shot | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/CD_clip_zeroshot_probe.ipynb) |
| Fine-tune VideoMAE for action recognition | C · Egocentric Vision (foundation) | Foundation | fine-tune VideoMAE for action recognition | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/C_videomae_finetune.ipynb) |
| DINOv2 features: PCA segmentation + probe | C · Egocentric Vision (foundation) | Foundation | patch-feature PCA (objects emerge) + a linear probe on CLS features | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/C_dinov2_features_probe.ipynb) |
| Learn a world model + plan | D · Scene & World Models | PyTorch | a learned dynamics model used for planning (model-predictive control) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/D_world_model.ipynb) |
| Train a tiny GPT from scratch (nanoGPT) | LM · Language models | PyTorch | a character-level GPT (decoder-only transformer) by next-token prediction | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/LM_nanogpt_pretrain.ipynb) |

> The self-contained **PyTorch** labs are verified to train (loss decreases) on CPU with small configs; raise `STEPS` for sharper results. The **Foundation** labs follow the official APIs and are meant to run on a Colab GPU (they download weights/data), so they are not pre-executed here.
