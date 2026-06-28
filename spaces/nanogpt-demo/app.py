"""Gradio demo for the nanoGPT (Tiny Shakespeare) model trained in Ropedia Academy.
Loads cy0307/ropedia-nanogpt-shakespeare from the Hub and generates text.
The model class below matches the training architecture exactly.
"""
import json
import torch
import torch.nn as nn
from torch.nn import functional as F
import gradio as gr
from huggingface_hub import hf_hub_download

REPO = "cy0307/ropedia-nanogpt-shakespeare"
DEV = "cuda" if torch.cuda.is_available() else "cpu"

cfg = json.load(open(hf_hub_download(REPO, "config.json")))
BS, NE, NH, NL, V = cfg["block_size"], cfg["n_embd"], cfg["n_head"], cfg["n_layer"], cfg["vocab"]
stoi = cfg["stoi"]
itos = {i: c for c, i in stoi.items()}
encode = lambda s: [stoi[c] for c in s if c in stoi]
decode = lambda l: "".join(itos[i] for i in l)


class Head(nn.Module):
    def __init__(self, hs):
        super().__init__()
        self.k = nn.Linear(NE, hs, bias=False); self.q = nn.Linear(NE, hs, bias=False); self.v = nn.Linear(NE, hs, bias=False)
        self.register_buffer("t", torch.tril(torch.ones(BS, BS))); self.d = nn.Dropout(0.0)
    def forward(self, x):
        B, T, C = x.shape; k, q = self.k(x), self.q(x)
        a = (q @ k.transpose(-2, -1)) * k.shape[-1] ** -0.5
        a = a.masked_fill(self.t[:T, :T] == 0, float("-inf"))
        return self.d(F.softmax(a, -1)) @ self.v(x)


class MHA(nn.Module):
    def __init__(self, nh, hs):
        super().__init__(); self.h = nn.ModuleList([Head(hs) for _ in range(nh)]); self.p = nn.Linear(NE, NE); self.d = nn.Dropout(0.0)
    def forward(self, x):
        return self.d(self.p(torch.cat([h(x) for h in self.h], -1)))


class Block(nn.Module):
    def __init__(self):
        super().__init__(); self.sa = MHA(NH, NE // NH)
        self.ff = nn.Sequential(nn.Linear(NE, 4 * NE), nn.GELU(), nn.Linear(4 * NE, NE), nn.Dropout(0.0))
        self.l1 = nn.LayerNorm(NE); self.l2 = nn.LayerNorm(NE)
    def forward(self, x):
        x = x + self.sa(self.l1(x)); return x + self.ff(self.l2(x))


class GPT(nn.Module):
    def __init__(self):
        super().__init__(); self.tok = nn.Embedding(V, NE); self.pos = nn.Embedding(BS, NE)
        self.b = nn.Sequential(*[Block() for _ in range(NL)]); self.ln = nn.LayerNorm(NE); self.hd = nn.Linear(NE, V)
    def forward(self, idx):
        B, T = idx.shape
        return self.hd(self.ln(self.b(self.tok(idx) + self.pos(torch.arange(T, device=idx.device)))))
    @torch.no_grad()
    def generate(self, idx, n, temp):
        for _ in range(n):
            logits = self(idx[:, -BS:])[:, -1, :] / max(temp, 1e-3)
            idx = torch.cat([idx, torch.multinomial(F.softmax(logits, -1), 1)], 1)
        return idx


model = GPT().to(DEV)
model.load_state_dict(torch.load(hf_hub_download(REPO, "model.pt"), map_location=DEV))
model.eval()


def run(prompt, n_tokens, temperature):
    ctx = torch.tensor([encode(prompt) or [0]], dtype=torch.long, device=DEV)
    return decode(model.generate(ctx, int(n_tokens), float(temperature))[0].tolist())


demo = gr.Interface(
    fn=run,
    inputs=[
        gr.Textbox(label="Prompt", value="ROMEO:"),
        gr.Slider(50, 800, value=300, step=10, label="Tokens to generate"),
        gr.Slider(0.1, 1.5, value=0.8, step=0.05, label="Temperature"),
    ],
    outputs=gr.Textbox(label="Generated text", lines=14),
    title="nanoGPT — Tiny Shakespeare (Ropedia Academy)",
    description=(
        "A tiny character-level GPT trained **from scratch** in "
        "[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/). "
        "It's an educational model (~0.8M params) — it produces Shakespeare-flavoured characters, not coherent prose."
    ),
    examples=[["ROMEO:", 300, 0.8], ["To be, or not to be", 300, 0.7], ["KING:", 400, 1.0]],
)

if __name__ == "__main__":
    demo.launch()
