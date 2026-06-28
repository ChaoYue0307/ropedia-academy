---
license: mit
library_name: pytorch
pipeline_tag: text-generation
tags:
- ropedia-academy
- educational
- text-generation
- gpt
---

# nanoGPT — Tiny Shakespeare

A character-level GPT (decoder-only transformer) trained from scratch; best-checkpoint by validation loss.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score.

| | |
|---|---|
| **Task** | text-generation |
| **Data** | Tiny Shakespeare (~1 MB) |
| **Track** | LM · Language & models |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/LM_nanogpt_pretrain.ipynb) |

## Results

| metric | value |
|---|---|
| history_step_train_val (final) | 1.903 |
| final_train | 1.782 |
| final_val | 1.903 |
| steps | 3000 |
| params | 816705 |
| train_seconds | 354 |
| config.block_size | 64 |
| config.n_embd | 128 |
| config.n_head | 4 |
| config.n_layer | 4 |
| config.vocab | 65 |


![loss](loss.png)

## Sample output

```

Where?

WARWIS:
Skee, every, this much:
If your merrean and the doed. God,
When at restainot me that not are to Wast: if sto-leak
No stroy moth prosh horn of too desdo
Link of the ellone; this ever: the way that wan sake!
And juked, no be earry, his brade, 'Tis recoppinten
But commicking: is and sprages for pritter's the ease?

ISINIUS:

ESCAptizen, pasy grounder
Giver serens!' Let if my the that quan,
And parious earty:
not ugnhopain I would yet, that wint which shall with like
You have timed but his breing in the kneem
And encled aign and abond years was 'twonds:
Stre you nop to hear upard:
```

## How to use

```python
import torch
state = torch.load("model.pt", map_location="cpu")   # some labs save pose.pt / gaussians.pt / transform.pt
# Rebuild the model class from the Ropedia Academy notebook (linked above), then:
# model.load_state_dict(state)
```

## Files

- `config.json`
- `loss.png`
- `metrics.json`
- `model.pt`
- `sample.txt`


## Reproduce / train your own

Open the [lab notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/LM_nanogpt_pretrain.ipynb) → **Runtime → GPU → Run all**, then its *Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection.*
