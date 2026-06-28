---
license: mit
library_name: pytorch
tags:
- ropedia-academy
- educational
- reconstruction
---

# TSDF fusion → mesh

Fuses multi-view depth into a truncated SDF volume and extracts a mesh with marching cubes.

Trained from scratch in **[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/)** — an interactive, bilingual course on embodied & spatial AI. **Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score.

| | |
|---|---|
| **Task** | dense 3D reconstruction |
| **Data** | multi-view synthetic depth |
| **Track** | D · Scene & world models |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/D_tsdf_fusion.ipynb) |

## Dataset

- **Name:** Synthetic depth views
- **Type:** synthetic — procedural
- **Size / stats:** 1 scene (two spheres); 6 orthographic depth maps fused into a 64³ TSDF grid
- **Split:** single scene
- **Source:** procedural

## Results

| metric | value |
|---|---|
| verts | 27362 |
| faces | 56058 |


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
- `mesh.pt`
- `metrics.json`


## Reproduce / train your own

Open the [lab notebook in Colab](https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/D_tsdf_fusion.ipynb) → **Runtime → GPU → Run all**, then its *Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs).


---
*Part of the [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) trained-model collection.*
