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
| history_step_train_val (final) | 1.842 |
| final_train | 1.779 |
| best_val | 1.814 |
| steps | 4000 |
| params | 816705 |
| train_seconds | 505 |
| config.block_size | 64 |
| config.n_embd | 128 |
| config.n_head | 4 |
| config.n_layer | 4 |
| config.vocab | 65 |


![figure](figure.png)

## Sample output

```

Ciegvate tumpot of Bad'ers
We narvervy sures toak hasing more,
This hous mad the dide to to the for for hard with to
IsSeet if love true;
Mught and how fath quear uppose? City hat.
My and main thou but staltany; him comblead.

LEUMIEN:
Charth eyet not, bath brans yoer
Where shat? I'll at har comen mort, thou gene.

FROMOK:
I shall even Romen of joysed
You kind indswaul'd with thou bakeng, with mell.

DUCIO:
My shall stalk you fall hear:
Mant shall In in brothere'y! prancer, best worde houm's afd it.

UCIIO!

GLINIUS:
Rell w, it?

Go ELIA:
Where.

HED VOLLOONT:
More, now he now of nather'd nev
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
- `figure.png`
- `metrics.json`
- `model.pt`
- `sample.txt`


## Reproduce / train your own

Open the [lab notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/LM_nanogpt_pretrain.ipynb) → **Runtime → GPU → Run all**, then its *Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection.*
