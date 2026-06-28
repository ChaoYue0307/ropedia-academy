---
license: mit
tags:
- ropedia-academy
- advanced
- todo
- track-b
---

# SplaTAM — Gaussian-Splatting SLAM  🚧 placeholder

> **Status — not trained yet.** This is a *documented placeholder* for an advanced, GPU-heavy pipeline from **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)**. The checkpoint, metrics and plots are **TODO** — train it on a GPU (link below) and the weights + a full results card land here.

Recover the camera trajectory and a dense 3D Gaussian map jointly (SLAM).

| | |
|---|---|
| **Task** | dense neural SLAM (RGB-D → map + trajectory) |
| **Built on** | [spla-tam/SplaTAM](https://github.com/spla-tam/SplaTAM) |
| **Track** | D · Scene & world models |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/D_splatam_slam.ipynb) |
| **Compute / storage / time** | see the *Compute · storage · time* table inside the notebook (GPU required) |

## How to fill this repo
1. Open the [notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/D_splatam_slam.ipynb) → **Runtime → GPU → Run all** (trains/runs the real pipeline).
2. Run its **Publish to the Hugging Face Hub** step (or `HfApi().upload_folder(...)`) to push the checkpoint + metrics + plots here, replacing this placeholder.

## TODO
- [ ] Train / run on a GPU (see the notebook)
- [ ] Upload the checkpoint / adapter weights
- [ ] Add `metrics.json` (loss / eval history)
- [ ] Add result figures & sample outputs
- [ ] Replace this placeholder card with the real results

## Results
_TODO — add final metrics and plots after training. (Placeholder.)_

## Links to tracks A–D
Relates to: **B** — see the *How this links to tracks A–D* note in the notebook.

---
*Placeholder in the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection. Browse all labs in the [Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).*
