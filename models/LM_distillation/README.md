---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- knowledge-distillation
---

# Knowledge distillation

A small student trained on a teacher's soft predictions beats one trained on only a few hard labels.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score.

| | |
|---|---|
| **Task** | model compression |
| **Data** | two-spiral classification |
| **Track** | LM · Language & models |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/LM_distillation.ipynb) |

## Dataset

- **Name:** Two interleaved spirals
- **Type:** synthetic — procedural
- **Size / stats:** 2 classes; 2,000 train / 1,000 test (2-D); the student sees only 80 labels
- **Split:** 2,000 train / 1,000 test
- **Source:** procedural

## Results

| metric | value |
|---|---|
| teacher | 1.0 |
| student_plain (final) | 0.938 |
| student_distill (final) | 0.96 |


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
- `metrics.json`
- `teacher.pt`


## Reproduce / train your own

Open the [lab notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/LM_distillation.ipynb) → **Runtime → GPU → Run all**, then its *Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection.*
