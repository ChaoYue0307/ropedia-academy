---
license: mit
tags:
- ropedia-academy
- advanced
- todo
- track-a
- track-d
---

# VideoMAE — egocentric fine-tune  🚧 placeholder

> **Status — not trained yet.** This is a *documented placeholder* for an advanced, GPU-heavy pipeline from **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)**. The checkpoint, metrics and plots are **TODO** — train it on a GPU (link below) and the weights + a full results card land here.

Fine-tune the VideoMAE video transformer for first-person action recognition.

| | |
|---|---|
| **Task** | egocentric action recognition |
| **Built on** | [EPIC-Kitchens / Ego4D (🤗 transformers)](https://huggingface.co/docs/transformers/en/tasks/video_classification) |
| **Track** | C · Egocentric vision |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/C_videomae_egocentric.ipynb) |
| **Compute / storage / time** | see the *Compute · storage · time* table inside the notebook (GPU required) |

## How to fill this repo
1. Open the [notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/C_videomae_egocentric.ipynb) → **Runtime → GPU → Run all** (trains/runs the real pipeline).
2. Run its **Publish to the Hugging Face Hub** step (or `HfApi().upload_folder(...)`) to push the checkpoint + metrics + plots here, replacing this placeholder.

## TODO
- [ ] Train / run on a GPU (see the notebook)
- [ ] Upload the checkpoint / adapter weights
- [ ] Add `metrics.json` (loss / eval history)
- [ ] Add result figures & sample outputs
- [ ] Replace this placeholder card with the real results

## Results
_TODO — add final metrics and plots after training. (Placeholder.)_

## Links to tracks A–D
Relates to: **A · D** — see the *How this links to tracks A–D* note in the notebook.

---
*Placeholder in the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection. Browse all labs in the [Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).*
