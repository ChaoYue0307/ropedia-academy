---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- contrastive
- self-supervised
---

# SimCLR self-supervised pretraining

Contrastive (NT-Xent) pretraining with a large batch; a linear probe on the frozen features beats a random encoder.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score.

| | |
|---|---|
| **Task** | contrastive representation learning |
| **Data** | synthetic shapes |
| **Track** | C · Egocentric vision |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/C_simclr_pretrain.ipynb) |

## Dataset

- **Name:** Synthetic shapes
- **Type:** synthetic — procedural
- **Size / stats:** 6 shape classes at random position & scale, 20×20; 256/batch contrastive; probe = 40 labelled / 600 test
- **Split:** self-supervised + few-shot probe
- **Source:** procedural

## Results

| metric | value |
|---|---|
| nt_xent (final) | 4.735 |
| probe_simclr | 0.3917 |
| probe_random | 0.2817 |


![figure](figure.png)

## How to use

```python
import torch
state = torch.load("model.pt", map_location="cpu")   # some labs save pose.pt / gaussians.pt / transform.pt
# Rebuild the model class from the Ropedia Academy notebook (linked above), then:
# model.load_state_dict(state)
```

## Files

- `encoder.pt`
- `figure.png`
- `metrics.json`


## Reproduce / train your own

Open the [lab notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/C_simclr_pretrain.ipynb) → **Runtime → GPU → Run all**, then its *Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection.*
