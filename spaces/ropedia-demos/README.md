---
title: Ropedia Academy Models
emoji: 🧪
colorFrom: indigo
colorTo: green
sdk: gradio
app_file: app.py
pinned: false
license: mit
tags:
- ropedia-academy
---

# Ropedia Academy · Models

One Space, many demos — interactive showcases of models trained from scratch in
[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/), all loaded from
`cy0307/ropedia-*`:

- **nanoGPT** — generate Shakespeare-style text
- **Motion diffusion** — sample motion trajectories
- **Action anticipation** — predict the next action
- **Gridworld policy** — pick a start, watch the agent reach the goal
- **World model** — plan a trajectory with CEM
- **Tool-use agent** — type a task, the agent calls tools
- **Gallery** — every model's result figure + metrics

## Deploy
```bash
hf upload cy0307/ropedia-demos spaces/ropedia-demos . --repo-type=space
```
(or New Space → Gradio → upload these files). Free CPU hardware is fine — the models are tiny.
