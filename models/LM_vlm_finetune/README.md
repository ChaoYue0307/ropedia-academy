---
license: mit
pipeline_tag: image-text-to-text
tags:
- ropedia-academy
- advanced
- todo
- track-c
- track-d
---

# Fine-tune a VLM (vision-language)  🚧 placeholder

> **Status — not trained yet.** This is a *documented placeholder* for an advanced, GPU-heavy pipeline from **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)**. The checkpoint, metrics and plots are **TODO** — train it on a GPU (link below) and the weights + a full results card land here.

LoRA-fine-tune a vision-language model on image Q&A.

| | |
|---|---|
| **Task** | image question answering |
| **Built on** | [huggingface/trl + SmolVLM](https://huggingface.co/docs/trl/en/sft_trainer) |
| **Track** | LM · Language & multimodal |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/LM_vlm_finetune.ipynb) |
| **Compute / storage / time** | see the *Compute · storage · time* table inside the notebook (GPU required) |

## How to fill this repo
1. Open the [notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/LM_vlm_finetune.ipynb) → **Runtime → GPU → Run all** (trains/runs the real pipeline).
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
Relates to: **C · D** — see the *How this links to tracks A–D* note in the notebook.

---
*Placeholder in the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection. Browse all labs in the [Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).*
