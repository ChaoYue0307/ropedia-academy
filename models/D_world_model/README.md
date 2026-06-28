---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- reinforcement-learning
---

# World model + planning (CEM)

Learns environment dynamics, then plans with the Cross-Entropy Method to reach a goal inside imagination.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score.

| | |
|---|---|
| **Task** | model-based control |
| **Data** | 2D point-mass environment |
| **Track** | D · Scene & world models |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/D_world_model.ipynb) |

## Results

| metric | value |
|---|---|
| dyn_mse (final) | 0.0 |
| final_dist.planner | 0.0062 |
| final_dist.random | 2.169 |


![figure](figure.png)

## How to use

```python
import torch
state = torch.load("model.pt", map_location="cpu")   # some labs save pose.pt / gaussians.pt / transform.pt
# Rebuild the model class from the Ropedia Academy notebook (linked above), then:
# model.load_state_dict(state)
```

## Files

- `dynamics.pt`
- `figure.png`
- `metrics.json`


## Reproduce / train your own

Open the [lab notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/D_world_model.ipynb) → **Runtime → GPU → Run all**, then its *Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection.*
