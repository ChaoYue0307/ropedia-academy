---
title: nanoGPT Tiny Shakespeare
emoji: 📜
colorFrom: indigo
colorTo: purple
sdk: gradio
app_file: app.py
pinned: false
license: mit
models:
- cy0307/ropedia-nanogpt-shakespeare
tags:
- ropedia-academy
- nanogpt
---

# nanoGPT — Tiny Shakespeare (Ropedia Academy)

Interactive demo of a tiny character-level GPT trained **from scratch** in
[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/). Type a prompt;
it continues in Shakespeare's style. Educational model (~0.8M params) — flavour, not coherence.

- **Model:** [cy0307/ropedia-nanogpt-shakespeare](https://huggingface.co/cy0307/ropedia-nanogpt-shakespeare)
- **Train it yourself:** the nanoGPT lab in the [Ropedia Academy Labs tab](https://chaoyue0307.github.io/ropedia-academy/labs)

## Deploy this Space
Create a new **Gradio** Space on Hugging Face, then upload these three files
(`app.py`, `requirements.txt`, `README.md`) — or from your machine:

```bash
hf auth login
hf upload cy0307/nanogpt-demo spaces/nanogpt-demo . --repo-type=space
```
