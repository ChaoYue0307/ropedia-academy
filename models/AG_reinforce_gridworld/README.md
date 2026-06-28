---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- reinforcement-learning
---

# REINFORCE / actor-critic

A policy-gradient agent with a value baseline + entropy bonus that learns to reach the goal.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score.

| | |
|---|---|
| **Task** | reinforcement learning |
| **Data** | gridworld navigation |
| **Track** | AG · Agents & RL |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/AG_reinforce_gridworld.ipynb) |

## Dataset

- **Name:** 5×5 gridworld (RL env)
- **Type:** synthetic env — no fixed dataset
- **Size / stats:** agent learns from its own rollouts; reward −0.1/step, +5 at goal
- **Split:** online RL
- **Source:** procedural env

## Results

| metric | value |
|---|---|
| return (final) | 4.64 |


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
- `policy.pt`


## Reproduce / train your own

Open the [lab notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/AG_reinforce_gridworld.ipynb) → **Runtime → GPU → Run all**, then its *Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection.*
