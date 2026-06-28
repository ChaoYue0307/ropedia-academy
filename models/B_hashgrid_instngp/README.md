---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- instant-ngp
---

# Multiresolution hash grid (Instant-NGP)

A multiresolution hash-grid feature encoding + tiny MLP that fits a real photograph to high PSNR — the trick that made NeRF ~1000× faster.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score.

| | |
|---|---|
| **Task** | differentiable image fitting |
| **Data** | real photograph |
| **Track** | B · 3D & rendering |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_hashgrid_instngp.ipynb) |

## Dataset

- **Name:** Real photograph (astronaut)
- **Type:** real — public-domain image
- **Size / stats:** 1 RGB photo resized to 96×96; 8-level hash grid (2^14 entries/level)
- **Split:** single image (overfit)
- **Source:** scikit-image data.astronaut() (NASA, public domain)

## Results

| metric | value |
|---|---|
| psnr (final) | 64.25 |


![figure](figure.png)

## How to use

```python
import torch
state = torch.load("model.pt", map_location="cpu")   # some labs save pose.pt / gaussians.pt / transform.pt
# Rebuild the model class from the Ropedia Academy notebook (linked above), then:
# model.load_state_dict(state)
```

## Files

- `figure.png`
- `hashgrid.pt`
- `metrics.json`


## Reproduce / train your own

Open the [lab notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_hashgrid_instngp.ipynb) → **Runtime → GPU → Run all**, then its *Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection.*
