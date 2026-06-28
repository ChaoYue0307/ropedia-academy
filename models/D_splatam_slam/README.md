---
license: mit
tags:
- ropedia-academy
- advanced
- gpu
- todo
- embodied-ai
- track-b
---

# SplaTAM — Gaussian-Splatting SLAM  🚧 not trained yet

> Recover the camera trajectory and a dense 3D Gaussian map jointly (SLAM).

**Status — documented recipe (placeholder).** A production-grade pipeline from **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** for an advanced, GPU-heavy task. Everything below — base model, objective, dataset, config, the exact evaluation — is specified; the **weights / metrics / figures** land here automatically when you run the notebook on a GPU (one click below). Try the trained models live in the **[Ropedia demos Space](https://huggingface.co/spaces/cy0307/ropedia-demos)**.

## At a glance

| | |
|---|---|
| **Base model** | From scratch — per-sequence |
| **Task** | dense neural SLAM (RGB-D → map + trajectory) |
| **Training objective** | Joint camera tracking + Gaussian-map optimization (photometric + depth). |
| **Track** | D · Scene & world models |
| **Built on** | [spla-tam/SplaTAM](https://github.com/spla-tam/SplaTAM) |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/D_splatam_slam.ipynb) |
| **Compute / storage / time** | GPU required — see the *Compute · storage · time* table in the notebook |

## Dataset
- **Source:** Replica / TUM-RGBD / your RGB-D stream.

## Training config
GPU-scale — the notebook ships a **demo** profile (free Colab T4) and a **full** profile, with an exact *Compute · storage · time* table. Hyperparameters (optimizer, steps, batch, LoRA rank, …) are in the training cell.

## Evaluation results
⏳ **Pending** — run the notebook on a GPU to fill this in. This lab reports **ATE RMSE (cm) · PSNR/SSIM/LPIPS** on a held-out split (see its *Evaluate* cell).

## Inference example
No weights are published yet. After a GPU run, load the checkpoint/adapter the notebook saves (it also has a ready inference cell). Base model: **From scratch — per-sequence**.

## How to fill this repo
1. Open the [notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/D_splatam_slam.ipynb) → **Runtime → GPU → Run all** (runs the real pipeline).
2. Run its **Publish to the Hugging Face Hub** step (or `HfApi().upload_folder(...)`) — the checkpoint + `metrics.json` + figures replace this placeholder.

- [ ] Train / run on a GPU · [ ] upload weights · [ ] add `metrics.json` · [ ] add figures · [ ] swap in the real results card

## Limitations
Not yet trained — no numbers to report. The pipeline is **GPU-heavy** (see the compute table); on free Colab use the demo-scale settings. This is an educational, reproducible recipe, not a tuned production release.

## License
Code: **MIT** (this repository). The **base model** ([spla-tam/SplaTAM](https://github.com/spla-tam/SplaTAM)) and **dataset** are each under their own licenses — check the upstream source before redistribution.

## Citation
```bibtex
@misc{ropedia_academy,
  title  = {Ropedia Academy: an interactive course on embodied & spatial AI},
  author = {Ropedia Academy},
  year   = {2026},
  howpublished = {\url{https://chaoyue0307.github.io/ropedia-academy/}}
}
```

**Method / original work:** Keetha et al., *SplaTAM*, CVPR 2024.

## Related assets
- 🚀 **Live demos:** [https://huggingface.co/spaces/cy0307/ropedia-demos](https://huggingface.co/spaces/cy0307/ropedia-demos)
- 🤗 **All models + collection:** [https://huggingface.co/cy0307](https://huggingface.co/cy0307)
- 📚 **Course & all labs:** [https://chaoyue0307.github.io/ropedia-academy/](https://chaoyue0307.github.io/ropedia-academy/) · [Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs)
- 💻 **Source / notebooks:** [github.com/ChaoYue0307/ropedia-academy](https://github.com/ChaoYue0307/ropedia-academy)
- 🔗 **Relates to tracks:** B

---
*Documented placeholder in the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) collection — train it on a GPU to publish the real model. Contributions welcome on [GitHub](https://github.com/ChaoYue0307/ropedia-academy).*
