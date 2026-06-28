---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- mapping
---

# Bayesian semantic mapping

Fuses noisy observations into an occupancy (log-odds) + semantic-label map that converges to ground truth.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score.

| | |
|---|---|
| **Task** | occupancy + semantic mapping |
| **Data** | 2D grid world |
| **Track** | D · Scene & world models |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/D_semantic_mapping.ipynb) |

## Dataset

- **Name:** 2D grid world
- **Type:** synthetic — procedural
- **Size / stats:** 32×32 cells, 4 semantic classes; ~60 noisy observations/step (p_occ=0.8, p_label=0.7)
- **Split:** single map
- **Source:** procedural

## Results

| metric | value |
|---|---|
| history (final) | 1.0 |


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
- `labels.npy`
- `metrics.json`
- `occ.npy`


## Reproduce / train your own

Open the [lab notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/D_semantic_mapping.ipynb) → **Runtime → GPU → Run all**, then its *Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection.*
