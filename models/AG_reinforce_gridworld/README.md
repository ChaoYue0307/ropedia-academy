---
license: mit
library_name: pytorch
pipeline_tag: reinforcement-learning
tags:
- ropedia-academy
- educational
- embodied-ai
- from-scratch
- reproducible
- reinforcement-learning
---

# REINFORCE / actor-critic (CartPole)

> A policy-gradient agent with a value baseline + entropy bonus that solves the Gymnasium CartPole-v1 benchmark (greedy return near the 500 maximum).

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score. Try it live in the **[Ropedia demos Space](https://huggingface.co/spaces/cy0307/ropedia-demos)**.

## At a glance

| | |
|---|---|
| **Base model** | Trained **from scratch** (random initialization) — no pretrained base model. |
| **Task** | reinforcement learning |
| **Training objective** | **REINFORCE** policy gradient with a **value baseline** + entropy bonus (actor-critic). |
| **Track** | AG · Agents & RL |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/AG_reinforce_gridworld.ipynb) |

## Dataset

- **Name:** Gymnasium CartPole-v1
- **Type:** standard RL benchmark environment (no fixed dataset)
- **Size / stats:** 4-D continuous state, 2 discrete actions; reward +1/step, episode cap 500; agent learns from its own rollouts
- **Split:** online RL; greedy eval over 20 episodes
- **Source:** Gymnasium (Farama Foundation) CartPole-v1

## Training config

Actor-critic; Adam (lr 3e-3), 600 episodes, γ=0.99, entropy 0.01, value baseline. `EPISODES` env-overridable.

## Evaluation results

| metric | value | meaning |
|---|---|---|
| `return (final)` | 452.7 |  |
| `greedy_eval` | 449.45 | mean return of the greedy policy over 20 CartPole episodes (max 500) |


![figure](figure.png)

## Inference example

```python
import torch, torch.nn as nn
policy = nn.Sequential(nn.Linear(4,64), nn.Tanh(), nn.Linear(64,2))
policy.load_state_dict(torch.load("policy.pt", map_location="cpu")); policy.eval()
# CartPole state s = [x, x_dot, theta, theta_dot]
# action = int(policy(torch.tensor(s, dtype=torch.float32)).argmax())   # 0 = push left, 1 = push right
```

## Limitations

**Educational scale.** Trained quickly on CPU on small or synthetic data, so absolute numbers are not competitive with production systems — the value is the *method* and a reproducible pipeline. No large-scale data, no hyperparameter sweep, and no multi-seed variance is reported. **Not for production use.**

Solves **CartPole only** — not a general control policy; on-policy and high-variance.

## Failure cases

High-variance gradients; a length-1 episode gives a NaN advantage (std 0) — fixed with `unbiased=False` + grad clipping; stalls without the entropy bonus.

## Reproduce / train your own

**One click:** open the notebook in Colab → **Runtime → GPU → Run all**, then run its *Publish to the Hugging Face Hub* cell.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/AG_reinforce_gridworld.ipynb)

**From a shell:**
```bash
git clone https://github.com/ChaoYue0307/ropedia-academy.git && cd ropedia-academy
pip install torch numpy matplotlib scikit-learn scikit-image gymnasium
jupyter nbconvert --to notebook --execute notebooks/training/AG_reinforce_gridworld.ipynb --output run.ipynb
# optional: override training length, e.g.  STEPS=2000  (or EPISODES=600)  before running
```

## Files

- `figure.png`
- `metrics.json`
- `policy.pt`


## License

Code & weights: **MIT** (this repository) — educational use encouraged.  
Environment: Gymnasium (Farama Foundation) — MIT license.

## Citation

If you use this model or the course materials, please cite:

```bibtex
@misc{ropedia_academy,
  title  = {Ropedia Academy: an interactive course on embodied & spatial AI},
  author = {Ropedia Academy},
  year   = {2026},
  howpublished = {\url{https://chaoyue0307.github.io/ropedia-academy/}}
}
```


**Method / original work:** Williams, *REINFORCE*, 1992; Sutton et al., *Policy Gradient Methods*, NeurIPS 1999; Brockman et al., *OpenAI Gym*, 2016.

## Related assets

- 🚀 **Live demos:** [https://huggingface.co/spaces/cy0307/ropedia-demos](https://huggingface.co/spaces/cy0307/ropedia-demos)
- 🤗 **All trained models + collection:** [https://huggingface.co/cy0307](https://huggingface.co/cy0307)
- 📚 **Course & all labs:** [https://chaoyue0307.github.io/ropedia-academy/](https://chaoyue0307.github.io/ropedia-academy/) · [Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs)
- 💻 **Source / notebooks:** [github.com/ChaoYue0307/ropedia-academy](https://github.com/ChaoYue0307/ropedia-academy)


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection. Contributions & issues welcome on [GitHub](https://github.com/ChaoYue0307/ropedia-academy).*
