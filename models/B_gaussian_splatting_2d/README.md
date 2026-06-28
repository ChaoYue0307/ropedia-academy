---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- embodied-ai
- from-scratch
- reproducible
- gaussian-splatting
---

# 2D Gaussian Splatting

> Reconstructs a real photograph with anisotropic 2D Gaussians (with densification) — the 2D analogue of 3D Gaussian Splatting.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score. Try it live in the **[Ropedia demos Space](https://huggingface.co/spaces/cy0307/ropedia-demos)**.

## At a glance

| | |
|---|---|
| **Base model** | Trained **from scratch** (random initialization) — no pretrained base model. |
| **Task** | differentiable image fitting |
| **Training objective** | **Photometric L2** between the splatted render and the target image, with gradient-based **densification**. |
| **Track** | B · 3D & rendering |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_gaussian_splatting_2d.ipynb) |

## Dataset

- **Name:** Real photograph (astronaut)
- **Type:** real — public-domain image
- **Size / stats:** 1 RGB photo resized to 64×64; ~500 Gaussians (densified to ~650)
- **Split:** single image (overfit)
- **Source:** scikit-image data.astronaut() (NASA, public domain)

## Training config

Adam (lr 0.02), 800 steps; 500 Gaussians, gradient-based densification (→ ~650); 64×64 target.

## Evaluation results

| metric | value | meaning |
|---|---|---|
| `psnr (final)` | 32.45 |  |


![figure](figure.png)

## Inference example

```python
import torch
g = torch.load("gaussians.pt", map_location="cpu")   # dict: pos, logs, rot, col, op
# Re-create render() from the notebook (see "Reproduce") and call it on these tensors
# to reconstruct the fitted image.
```

## Limitations

**Educational scale.** Trained quickly on CPU on small or synthetic data, so absolute numbers are not competitive with production systems — the value is the *method* and a reproducible pipeline. No large-scale data, no hyperparameter sweep, and no multi-seed variance is reported. **Not for production use.**

Overfits a **single image** — it does not generalize to other images; quality is capped by the Gaussian count.

## Failure cases

Without densification, large flat regions stay blurry; over-large σ washes the image out.

## Reproduce / train your own

**One click:** open the notebook in Colab → **Runtime → GPU → Run all**, then run its *Publish to the Hugging Face Hub* cell.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_gaussian_splatting_2d.ipynb)

**From a shell:**
```bash
git clone https://github.com/ChaoYue0307/ropedia-academy.git && cd ropedia-academy
pip install torch numpy matplotlib scikit-learn scikit-image gymnasium
jupyter nbconvert --to notebook --execute notebooks/training/B_gaussian_splatting_2d.ipynb --output run.ipynb
# optional: override training length, e.g.  STEPS=2000  (or EPISODES=600)  before running
```

## Files

- `figure.png`
- `gaussians.pt`
- `metrics.json`


## License

Code & weights: **MIT** (this repository) — educational use encouraged.  
Image: *astronaut* test image (NASA) — public domain, shipped with scikit-image.

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


**Method / original work:** Kerbl et al., *3D Gaussian Splatting for Real-Time Radiance Field Rendering*, SIGGRAPH 2023.

## Related assets

- 🚀 **Live demos:** [https://huggingface.co/spaces/cy0307/ropedia-demos](https://huggingface.co/spaces/cy0307/ropedia-demos)
- 🤗 **All trained models + collection:** [https://huggingface.co/cy0307](https://huggingface.co/cy0307)
- 📚 **Course & all labs:** [https://chaoyue0307.github.io/ropedia-academy/](https://chaoyue0307.github.io/ropedia-academy/) · [Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs)
- 💻 **Source / notebooks:** [github.com/ChaoYue0307/ropedia-academy](https://github.com/ChaoYue0307/ropedia-academy)


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection. Contributions & issues welcome on [GitHub](https://github.com/ChaoYue0307/ropedia-academy).*
