---
title: Ropedia Academy Models
emoji: 🧪
colorFrom: indigo
colorTo: green
sdk: gradio
app_file: app.py
pinned: false
license: mit
short_description: Real-model demos for embodied & spatial AI — LLM chat, diffusion, RL, world models
models:
  - HuggingFaceTB/SmolLM2-360M-Instruct
  - cy0307/ropedia-nanogpt-shakespeare
  - cy0307/ropedia-c-simclr-pretrain
  - cy0307/ropedia-b-mae-pretrain
  - cy0307/ropedia-lm-distillation
  - cy0307/ropedia-ag-reinforce-gridworld
  - cy0307/ropedia-d-world-model
tags:
- ropedia-academy
- embodied-ai
- llm
- diffusion
- reinforcement-learning
- educational
---

# Ropedia Academy · Models

One Space, many demos from [Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/) —
each tab is backed by a **real** model that fits its task:

- **💬 Language model** — a real small instruct LLM (**SmolLM2-360M-Instruct**) answers your prompt
- **🎨 Diffusion (DDPM)** — a real class-conditional diffusion model **generates handwritten digits** on demand
- **🔮 Action anticipation** — the LLM predicts the next action in-context
- **🎮 CartPole policy** — a REINFORCE / actor-critic agent solving Gymnasium **CartPole-v1**
- **🌍 World model** — model-based planning with CEM
- **🛠️ Tool-use agent** — a real ReAct loop: the LLM reasons, real tools execute (and fix its arithmetic)
- **🖼️ Gallery** — every trained model's result figure + metrics

## Hardware
Runs on **free CPU** (the LLM/DDPM are small; first LLM call loads the model and is slow).
For snappy generation, set the Space hardware to **ZeroGPU** and add `spaces` to `requirements.txt` —
the code already guards GPU sections with `@spaces.GPU`, so it just works.

## Deploy
```bash
hf upload cy0307/ropedia-demos spaces/ropedia-demos . --repo-type=space
```
