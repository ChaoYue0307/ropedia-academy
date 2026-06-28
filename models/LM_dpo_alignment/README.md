---
license: mit
pipeline_tag: text-generation
base_model: Qwen/Qwen2.5-0.5B-Instruct
tags:
- ropedia-academy
- advanced
- gpu
- todo
- embodied-ai
- track-a
- track-d
---

# DPO — align an LLM  🚧 not trained yet

> Align an LLM to preferred answers with Direct Preference Optimization.

**Status — documented recipe (placeholder).** A production-grade pipeline from **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** for an advanced, GPU-heavy task. Everything below — base model, objective, dataset, config, the exact evaluation — is specified; the **weights / metrics / figures** land here automatically when you run the notebook on a GPU (one click below). Try the trained models live in the **[Ropedia demos Space](https://huggingface.co/spaces/cy0307/ropedia-demos)**.

## At a glance

| | |
|---|---|
| **Base model** | An SFT'd LLM (e.g. Qwen2.5-0.5B-Instruct, 4-bit) |
| **Task** | preference alignment |
| **Training objective** | Direct Preference Optimization on chosen/rejected pairs (no reward model). |
| **Track** | LM · Language & multimodal |
| **Built on** | [huggingface/trl](https://huggingface.co/docs/trl/dpo_trainer) |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/LM_dpo_alignment.ipynb) |
| **Compute / storage / time** | GPU required — see the *Compute · storage · time* table in the notebook |

## Dataset
- **Source:** trl-lib/ultrafeedback_binarized.

## Training config
GPU-scale — the notebook ships a **demo** profile (free Colab T4) and a **full** profile, with an exact *Compute · storage · time* table. Hyperparameters (optimizer, steps, batch, LoRA rank, …) are in the training cell.

## Evaluation results
⏳ **Pending** — run the notebook on a GPU to fill this in. This lab reports **preference accuracy (eval_rewards/accuracies)** on a held-out split (see its *Evaluate* cell).

## Inference example
No weights are published yet. After a GPU run, load the checkpoint/adapter the notebook saves (it also has a ready inference cell). Base model: **An SFT'd LLM (e.g. Qwen2.5-0.5B-Instruct, 4-bit)**.

## How to fill this repo
1. Open the [notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/LM_dpo_alignment.ipynb) → **Runtime → GPU → Run all** (runs the real pipeline).
2. Run its **Publish to the Hugging Face Hub** step (or `HfApi().upload_folder(...)`) — the checkpoint + `metrics.json` + figures replace this placeholder.

- [ ] Train / run on a GPU · [ ] upload weights · [ ] add `metrics.json` · [ ] add figures · [ ] swap in the real results card

## Limitations
Not yet trained — no numbers to report. The pipeline is **GPU-heavy** (see the compute table); on free Colab use the demo-scale settings. This is an educational, reproducible recipe, not a tuned production release.

## License
Code: **MIT** (this repository). The **base model** ([huggingface/trl](https://huggingface.co/docs/trl/dpo_trainer)) and **dataset** are each under their own licenses — check the upstream source before redistribution.

## Citation
```bibtex
@misc{ropedia_academy,
  title  = {Ropedia Academy: an interactive course on embodied & spatial AI},
  author = {Ropedia Academy},
  year   = {2026},
  howpublished = {\url{https://chaoyue0307.github.io/ropedia-academy/}}
}
```

**Method / original work:** Rafailov et al., *DPO*, NeurIPS 2023.

## Related assets
- 🚀 **Live demos:** [https://huggingface.co/spaces/cy0307/ropedia-demos](https://huggingface.co/spaces/cy0307/ropedia-demos)
- 🤗 **All models + collection:** [https://huggingface.co/cy0307](https://huggingface.co/cy0307)
- 📚 **Course & all labs:** [https://chaoyue0307.github.io/ropedia-academy/](https://chaoyue0307.github.io/ropedia-academy/) · [Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs)
- 💻 **Source / notebooks:** [github.com/ChaoYue0307/ropedia-academy](https://github.com/ChaoYue0307/ropedia-academy)
- 🔗 **Relates to tracks:** A · D

---
*Documented placeholder in the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) collection — train it on a GPU to publish the real model. Contributions welcome on [GitHub](https://github.com/ChaoYue0307/ropedia-academy).*
