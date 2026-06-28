<p align="center">
  <a href="https://chaoyue0307.github.io/ropedia-academy/">
    <img src="public/og.png" alt="Ropedia Academy — learn embodied spatial AI: egocentric vision, 3D reconstruction, human motion, world models" width="880">
  </a>
</p>

<h1 align="center">Ropedia Academy</h1>

<p align="center">
  <a href="https://chaoyue0307.github.io/ropedia-academy/"><b>🌐 Live site</b></a> ·
  4 tracks · 36 bilingual lessons · live 3D demos · spaced repetition
</p>

An interactive, bilingual (中文 / English) course on embodied & spatial AI — four
connected tracks covering **human modeling & motion**, **3D/4D reconstruction &
neural rendering**, **egocentric vision & interaction**, and **scene
reconstruction & world models**. Read lessons, play with live interactive demos
(including real-time 3D), run the code in Colab, self-test, and review with
spaced repetition. Runs entirely in the browser — no account required.

![tracks](https://img.shields.io/badge/tracks-4-6a5ef0) ![lessons](https://img.shields.io/badge/lessons-36-1d9e75) ![mode-中%2FEN-blue](https://img.shields.io/badge/中%2FEN-bilingual-378add)

## Features

- **4 tracks · 36 lessons**, each with a bilingual explanation, key terms, key
  papers, external links, cross-track links, and self-check questions.
- **An interactive demo in every lesson** — real-time **three.js 3D** (Gaussian
  splatting, a raymarched NeRF volume, an articulated SMPL body) plus explorable
  diagrams (triangulation, bundle adjustment, rotation continuity, hash grids,
  TSDF fusion, SLAM loop closure, reference frames, world-model rollouts, …).
- **Math & code** — KaTeX formulas and a runnable Python/PyTorch snippet per
  lesson, each with one-click **Open in Colab**; its real output (printed values
  + figure) shows inline behind a *predict-it, then reveal* toggle.
- **Bilingual reading** (中文 / English / 双语) and **hover-to-define** glossary
  tooltips on foundational terms.
- **Self-graded checks & quiz mode**, **spaced repetition** (SM-2) with a 7-day
  forecast, a cross-track **concept map**, progress tracking, and a ⌘K palette.
- **Light / dark theme**, mobile-friendly, **local-first** (no account required).

## Training labs

Beyond the per-lesson snippets, [`notebooks/training/`](notebooks/training/) holds
**twenty-three real, multi-cell Colab notebooks you can actually train** — split into
clear blocks (data · model · train · compare) so you can step through and watch
each stage:

| Track | From scratch (PyTorch) | Foundation model |
|---|---|---|
| **A · Human** | SMPLify body fit · motion diffusion (DDPM) · 2D pose (heatmap) · 6D vs Euler rotation | — |
| **B · 3D / rendering** | NeRF (`tiny_nerf`) · neural SDF · 2D Gaussian Splatting · hash grid (Instant-NGP) · ICP registration · MAE pretraining | — |
| **C · Egocentric** | action anticipation (LSTM) · SimCLR self-supervised pretraining | CLIP probe · fine-tune VideoMAE · DINOv2 features |
| **D · Scene / world** | world model + planning (MPC) · TSDF fusion → mesh · Bayesian semantic mapping | — |
| **LM · Language** | a GPT from scratch (nanoGPT) · knowledge distillation | — |
| **AG · Agents & RL** | REINFORCE policy gradient · behavior cloning · agent + tool-use harness | — |

The twenty self-contained PyTorch labs are **verified to train** (each was run
to confirm loss drops / PSNR climbs / metrics beat chance); the three foundation
labs follow the official APIs and run on a Colab GPU. Every lab records its
checkpoint + loss/eval history + figures to a downloadable `outputs/<lab>/`, and an
optional cell **publishes the run to the Hugging Face Hub** (a model repo with a
metrics-and-plot model card) so you can gather them into a Collection. Open them from the dashboard's **Training labs** section, or see
[`notebooks/training/README.md`](notebooks/training/README.md) for one-click Colab
badges. Set **Runtime → T4 GPU** first.

### Advanced labs (heavy · real repos · GPU)

[`notebooks/advanced/`](notebooks/advanced/) adds **twenty-two heavy GPU pipelines** on
real research repos for when you want the production tools, not a teaching toy:

| Track | Advanced pipelines |
|---|---|
| **A · Human** | MDM text-to-motion · 4D-Humans (HMR 2.0) mesh-from-video |
| **B · 3D / rendering** | 3D Gaussian Splatting (CUDA) · Nerfstudio nerfacto |
| **C · Egocentric** | VideoMAE fine-tune on EPIC/Ego4D · SAM 2 video segmentation · Whisper ASR fine-tune |
| **D · Scene / world** | SplaTAM (Gaussian SLAM) · DreamerV3 world model |
| **LM · Language & multimodal** | QLoRA · DPO · VLM fine-tune · Video-LM · RAG · LLM eval · Unsloth · RLHF (PPO) · Stable Diffusion LoRA · ControlNet · vLLM serving |
| **AG · Agents & RL** | LLM agent (tool use / ReAct) · Habitat embodied navigation |

The verified self-contained labs were each run to confirm real results; the
advanced labs follow each project's official recipe and run on a Colab GPU (some
need gated data), so they are flagged as **not pre-executed**. Every lab records
its checkpoints / loss-eval history / outputs to a downloadable folder, **every lab
cross-links to its related tracks** (chips + filters + an in-notebook note), and the
**Labs** tab closes with a **Future explore directions** board — open cross-track
projects that combine the labs.

These clone official repos, download multi-GB checkpoints/datasets, and **require a
GPU** — they're authored to each project's documented recipe and are **not
pre-executed** (expect to pin a version or two). See the dashboard's **Advanced
labs · GPU** section or [`notebooks/advanced/README.md`](notebooks/advanced/README.md).

## Run & deploy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

Pushing to `main` auto-builds and deploys to **GitHub Pages** via the included
GitHub Actions workflow (`.github/workflows/deploy.yml`) — that's what serves the
live site above. It's a static SPA, so `dist/` can also be hosted on any static
host (Netlify, Vercel, Cloudflare Pages).
