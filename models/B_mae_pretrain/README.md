---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- embodied-ai
- from-scratch
- reproducible
- self-supervised
---

# Masked Autoencoder (MAE)

> Masks half the image patches and reconstructs them on real handwritten digits — the MAE / VideoMAE pretraining objective; reports held-out reconstruction error.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score. Try it live in the **[Ropedia demos Space](https://huggingface.co/spaces/cy0307/ropedia-demos)**.

## At a glance

| | |
|---|---|
| **Base model** | Trained **from scratch** (random initialization) — no pretrained base model. |
| **Task** | self-supervised pretraining |
| **Training objective** | **Masked patch reconstruction** (MSE on masked tokens) — self-supervised pretraining. |
| **Track** | B · 3D & rendering |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_mae_pretrain.ipynb) |

## Dataset

- **Name:** Handwritten digits (UCI / scikit-learn)
- **Type:** real — public dataset
- **Size / stats:** 1,797 real 8×8 grayscale digit images; 16 patches of 2×2, 50% masked; 128/batch
- **Split:** 1,257 train / 540 test (held-out reconstruction)
- **Source:** scikit-learn load_digits (UCI Optical Recognition of Handwritten Digits)

## Training config

Adam (lr 1e-3), 1200 steps, batch 128; 16 patches of 2×2, 50% masked; 2-layer transformer enc/dec.

## Evaluation results

| metric | value | meaning |
|---|---|---|
| `recon_mse (final)` | 0.1393 |  |
| `test_recon_mse` | 0.1365 | held-out masked-patch reconstruction MSE (lower = better) |


![figure](figure.png)

## Inference example

```python
import torch
state = torch.load("mae.pt", map_location="cpu")   # this repo's checkpoint
# Rebuild the exact module from the lab notebook (see "Reproduce"), then:
# model.load_state_dict(state); model.eval()
```

## Limitations

**Educational scale.** Trained quickly on CPU on small or synthetic data, so absolute numbers are not competitive with production systems — the value is the *method* and a reproducible pipeline. No large-scale data, no hyperparameter sweep, and no multi-seed variance is reported. **Not for production use.**

Tiny model on **8×8 digits** → blurry reconstructions; not a general visual encoder.

## Failure cases

A high mask ratio with only 16 patches removes too much context → over-smoothed fills.

## Reproduce / train your own

**One click:** open the notebook in Colab → **Runtime → GPU → Run all**, then run its *Publish to the Hugging Face Hub* cell.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/B_mae_pretrain.ipynb)

**From a shell:**
```bash
git clone https://github.com/ChaoYue0307/ropedia-academy.git && cd ropedia-academy
pip install torch numpy matplotlib scikit-learn scikit-image gymnasium
jupyter nbconvert --to notebook --execute notebooks/training/B_mae_pretrain.ipynb --output run.ipynb
# optional: override training length, e.g.  STEPS=2000  (or EPISODES=600)  before running
```

## Files

- `figure.png`
- `mae.pt`
- `metrics.json`


## License

Code & weights: **MIT** (this repository) — educational use encouraged.  
Handwritten-digits data: UCI ML Repository via scikit-learn — CC BY 4.0.

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


**Method / original work:** He et al., *Masked Autoencoders Are Scalable Vision Learners (MAE)*, CVPR 2022; Tong et al., *VideoMAE*, NeurIPS 2022.

## Related assets

- 🚀 **Live demos:** [https://huggingface.co/spaces/cy0307/ropedia-demos](https://huggingface.co/spaces/cy0307/ropedia-demos)
- 🤗 **All trained models + collection:** [https://huggingface.co/cy0307](https://huggingface.co/cy0307)
- 📚 **Course & all labs:** [https://chaoyue0307.github.io/ropedia-academy/](https://chaoyue0307.github.io/ropedia-academy/) · [Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs)
- 💻 **Source / notebooks:** [github.com/ChaoYue0307/ropedia-academy](https://github.com/ChaoYue0307/ropedia-academy)


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection. Contributions & issues welcome on [GitHub](https://github.com/ChaoYue0307/ropedia-academy).*
