---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- self-supervised
---

# Masked Autoencoder (MAE)

Masks most image patches and reconstructs them — the MAE / VideoMAE pretraining objective.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score.

| | |
|---|---|
| **Task** | self-supervised pretraining |
| **Data** | synthetic images |
| **Track** | B · 3D & rendering |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_mae_pretrain.ipynb) |

## Dataset

- **Name:** Synthetic images
- **Type:** synthetic — procedural
- **Size / stats:** 24×24 grayscale (random discs); 36 patches of 4×4, 60% masked; 64/batch
- **Split:** generative (infinite)
- **Source:** procedural

## Results

| metric | value |
|---|---|
| recon_mse (final) | 0.1236 |


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
- `mae.pt`
- `metrics.json`


## Reproduce / train your own

Open the [lab notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_mae_pretrain.ipynb) → **Runtime → GPU → Run all**, then its *Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection.*
