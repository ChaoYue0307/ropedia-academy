---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- embodied-ai
- from-scratch
- reproducible
- diffusion
---

# Motion diffusion (DDPM)

> A denoising-diffusion model that generates motion trajectories — the MDM recipe, trained from scratch, sampled from EMA weights.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score. Try it live in the **[Ropedia demos Space](https://huggingface.co/spaces/cy0307/ropedia-demos)**.

## At a glance

| | |
|---|---|
| **Base model** | Trained **from scratch** (random initialization) — no pretrained base model. |
| **Task** | human-motion generation |
| **Training objective** | **DDPM** denoising objective (predict the added noise) over motion trajectories; sample from an EMA of the weights. |
| **Track** | A · Human modeling |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/A_motion_diffusion.ipynb) |

## Dataset

- **Name:** Synthetic motion trajectories
- **Type:** synthetic — procedural
- **Size / stats:** 4,096 looping 2D trajectories, 32 timesteps × 2 = 64-D each (varied radius/phase/noise)
- **Split:** train only (generative model)
- **Source:** procedural

## Training config

DDPM; Adam (lr 2e-4), 4000 steps, sequence length 32; EMA of weights for sampling. `STEPS` env-overridable.

## Evaluation results

| metric | value | meaning |
|---|---|---|
| `loss (final)` | 0.159 |  |


![figure](figure.png)

## Inference example

```python
import torch
state = torch.load("denoiser.pt", map_location="cpu")   # this repo's checkpoint
# Rebuild the exact module from the lab notebook (see "Reproduce"), then:
# model.load_state_dict(state); model.eval()
```

## Limitations

**Educational scale.** Trained quickly on CPU on small or synthetic data, so absolute numbers are not competitive with production systems — the value is the *method* and a reproducible pipeline. No large-scale data, no hyperparameter sweep, and no multi-seed variance is reported. **Not for production use.**

## Failure cases

Too few sampling steps or no EMA → jittery/averaged motions; mode collapse with too little data.

## Reproduce / train your own

**One click:** open the notebook in Colab → **Runtime → GPU → Run all**, then run its *Publish to the Hugging Face Hub* cell.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/A_motion_diffusion.ipynb)

**From a shell:**
```bash
git clone https://github.com/ChaoYue0307/ropedia-academy.git && cd ropedia-academy
pip install torch numpy matplotlib scikit-learn scikit-image gymnasium
jupyter nbconvert --to notebook --execute notebooks/training/A_motion_diffusion.ipynb --output run.ipynb
# optional: override training length, e.g.  STEPS=2000  (or EPISODES=600)  before running
```

## Files

- `denoiser.pt`
- `figure.png`
- `metrics.json`


## License

Code & weights: **MIT** (this repository) — educational use encouraged.  
Data: generated procedurally in the notebook — no external dataset.

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


**Method / original work:** Tevet et al., *Human Motion Diffusion Model (MDM)*, ICLR 2023 (arXiv:2209.14916); Ho et al., *DDPM*, NeurIPS 2020.

## Related assets

- 🚀 **Live demos:** [https://huggingface.co/spaces/cy0307/ropedia-demos](https://huggingface.co/spaces/cy0307/ropedia-demos)
- 🤗 **All trained models + collection:** [https://huggingface.co/cy0307](https://huggingface.co/cy0307)
- 📚 **Course & all labs:** [https://chaoyue0307.github.io/ropedia-academy/](https://chaoyue0307.github.io/ropedia-academy/) · [Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs)
- 💻 **Source / notebooks:** [github.com/ChaoYue0307/ropedia-academy](https://github.com/ChaoYue0307/ropedia-academy)


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection. Contributions & issues welcome on [GitHub](https://github.com/ChaoYue0307/ropedia-academy).*
