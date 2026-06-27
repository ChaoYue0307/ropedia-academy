# Advanced labs · heavy GPU pipelines

Real research-repo pipelines — **training, fine-tuning, and inference on actual foundation models** — two per track. Unlike the [Training labs](../training/), these clone official repos, download large checkpoints/datasets, and **require a GPU**.

> ⚠️ **Read me.** These are authored to each project's **official recipe** and are **not pre-executed here** (they need a GPU + multi-GB downloads, and some need gated data). Treat them as ready-to-run scaffolds: open in Colab, set **Runtime → GPU**, and expect to pin a version or two. Each notebook has a *Troubleshooting* section. For pipelines verified end-to-end, use the [Training labs](../training/).

| Lab | Track | Kind | Open |
|---|---|---|---|
| MDM — text-to-motion | A · Human | Generate | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/A_mdm_text_to_motion.ipynb) |
| 4D-Humans (HMR 2.0) — mesh from video | A · Human | Inference | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/A_4dhumans_mesh.ipynb) |
| 3D Gaussian Splatting — your photos | B · 3D / rendering | Train | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/B_gaussian_splatting_3d.ipynb) |
| Nerfstudio nerfacto — your video | B · 3D / rendering | Train | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/B_nerfstudio_nerfacto.ipynb) |
| VideoMAE — fine-tune on egocentric data | C · Egocentric | Fine-tune | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/C_videomae_egocentric.ipynb) |
| SAM 2 — promptable video segmentation | C · Egocentric | Inference | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/C_sam2_video_segmentation.ipynb) |
| SplaTAM — Gaussian-Splatting SLAM | D · Scene / world | Reconstruct | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/D_splatam_slam.ipynb) |
| DreamerV3 — world-model RL | D · Scene / world | Train | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/D_dreamerv3_world_model.ipynb) |
| QLoRA — fine-tune an LLM | LM · Language & multimodal | Fine-tune | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/LM_qlora_finetune_llm.ipynb) |
| DPO — align an LLM with preferences | LM · Language & multimodal | Align | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/LM_dpo_alignment.ipynb) |
| Fine-tune a VLM (vision-language) | LM · Language & multimodal | Fine-tune | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/LM_vlm_finetune.ipynb) |
| Video-LM — Qwen2-VL on video | LM · Language & multimodal | Inference + LoRA | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/LM_videolm_qwen2vl.ipynb) |

Each maps to a lesson and to its lighter, verified counterpart in `notebooks/training/`.
