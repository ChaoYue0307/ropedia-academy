"""Ropedia Academy · Models — one Space, many demos.
Interactive tabs (nanoGPT, motion diffusion, action anticipation, gridworld policy,
world-model planning, tool-use agent) load their checkpoints from cy0307/ropedia-*;
a Gallery tab shows every model's result figure + metrics. Each model architecture
matches its training notebook so the saved state_dict loads cleanly.
"""
import json, math
import torch, torch.nn as nn
from torch.nn import functional as F
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import gradio as gr
from huggingface_hub import hf_hub_download

USER = "cy0307"
def repo(slug): return f"{USER}/ropedia-{slug}"
def dl(slug, fn): return hf_hub_download(repo(slug), fn)

ERR = {}  # slug -> load error (for graceful messages)

# ───────────────────────── nanoGPT (text) ─────────────────────────
GPT = None; gpt_cfg = None; gpt_enc = gpt_dec = None
try:
    gpt_cfg = json.load(open(dl("nanogpt-shakespeare", "config.json")))
    BS, NE, NH, NL, V = (gpt_cfg[k] for k in ("block_size", "n_embd", "n_head", "n_layer", "vocab"))
    stoi = gpt_cfg["stoi"]; itos = {i: c for c, i in stoi.items()}
    gpt_enc = lambda s: [stoi[c] for c in s if c in stoi]; gpt_dec = lambda l: "".join(itos[i] for i in l)

    class _Head(nn.Module):
        def __init__(s, hs):
            super().__init__(); s.k = nn.Linear(NE, hs, bias=False); s.q = nn.Linear(NE, hs, bias=False); s.v = nn.Linear(NE, hs, bias=False)
            s.register_buffer("t", torch.tril(torch.ones(BS, BS))); s.d = nn.Dropout(0.0)
        def forward(s, x):
            B, T, C = x.shape; k, q = s.k(x), s.q(x)
            a = (q @ k.transpose(-2, -1)) * k.shape[-1] ** -0.5
            return s.d(F.softmax(a.masked_fill(s.t[:T, :T] == 0, float("-inf")), -1)) @ s.v(x)
    class _MHA(nn.Module):
        def __init__(s, nh, hs): super().__init__(); s.h = nn.ModuleList([_Head(hs) for _ in range(nh)]); s.p = nn.Linear(NE, NE); s.d = nn.Dropout(0.0)
        def forward(s, x): return s.d(s.p(torch.cat([h(x) for h in s.h], -1)))
    class _Block(nn.Module):
        def __init__(s): super().__init__(); s.sa = _MHA(NH, NE // NH); s.ff = nn.Sequential(nn.Linear(NE, 4 * NE), nn.GELU(), nn.Linear(4 * NE, NE), nn.Dropout(0.0)); s.l1 = nn.LayerNorm(NE); s.l2 = nn.LayerNorm(NE)
        def forward(s, x): x = x + s.sa(s.l1(x)); return x + s.ff(s.l2(x))
    class _GPT(nn.Module):
        def __init__(s): super().__init__(); s.tok = nn.Embedding(V, NE); s.pos = nn.Embedding(BS, NE); s.b = nn.Sequential(*[_Block() for _ in range(NL)]); s.ln = nn.LayerNorm(NE); s.hd = nn.Linear(NE, V)
        def forward(s, idx):
            B, T = idx.shape; return s.hd(s.ln(s.b(s.tok(idx) + s.pos(torch.arange(T)))))
        @torch.no_grad()
        def gen(s, idx, n, temp):
            for _ in range(n):
                lo = s(idx[:, -BS:])[:, -1, :] / max(temp, 1e-3); idx = torch.cat([idx, torch.multinomial(F.softmax(lo, -1), 1)], 1)
            return idx
    GPT = _GPT(); GPT.load_state_dict(torch.load(dl("nanogpt-shakespeare", "model.pt"), map_location="cpu")); GPT.eval()
except Exception as e:
    ERR["nanogpt"] = str(e)

def nanogpt_fn(prompt, n, temp):
    if GPT is None: return f"(model unavailable: {ERR.get('nanogpt')})"
    ctx = torch.tensor([gpt_enc(prompt) or [0]], dtype=torch.long)
    return gpt_dec(GPT.gen(ctx, int(n), float(temp))[0].tolist())

# ───────────────────── motion diffusion (generate) ─────────────────────
T_LEN, D_MOT, TDIFF, H_MOT = 32, 64, 200, 256
betas = torch.linspace(1e-4, 0.02, TDIFF); alphas = 1 - betas; acp = torch.cumprod(alphas, 0)
MOT = None
try:
    class _Denoiser(nn.Module):
        def __init__(s, D, H=H_MOT):
            super().__init__(); s.tef = nn.Sequential(nn.Linear(1, H), nn.SiLU(), nn.Linear(H, H))
            s.net = nn.Sequential(nn.Linear(D + H, H), nn.SiLU(), nn.Linear(H, H), nn.SiLU(), nn.Linear(H, D))
        def forward(s, x, t): return s.net(torch.cat([x, s.tef(t[:, None].float() / TDIFF)], -1))
    MOT = _Denoiser(D_MOT); MOT.load_state_dict(torch.load(dl("a-motion-diffusion", "denoiser.pt"), map_location="cpu")); MOT.eval()
except Exception as e:
    ERR["motion"] = str(e)

@torch.no_grad()
def motion_fn(n):
    if MOT is None: return None
    n = int(n); x = torch.randn(n, D_MOT)
    for ti in reversed(range(TDIFF)):
        t = torch.full((n,), ti, dtype=torch.long); eps = MOT(x, t)
        mean = (x - betas[ti] / (1 - acp[ti]).sqrt() * eps) / alphas[ti].sqrt()
        x = mean + (betas[ti].sqrt() * torch.randn_like(x) if ti > 0 else 0)
    g = x.reshape(n, T_LEN, 2)
    fig, ax = plt.subplots(1, n, figsize=(2.2 * n, 2.4))
    for i in range(n):
        a = ax[i] if n > 1 else ax; a.plot(g[i, :, 0], g[i, :, 1], "C1"); a.set_aspect("equal"); a.axis("off")
    fig.suptitle("generated motions"); return fig

# ───────────────────── action anticipation ─────────────────────
VERBS = ["take", "wash", "cut", "cook", "pour", "place"]; NV = len(VERBS)
ANT = None
try:
    class _Antic(nn.Module):
        def __init__(s): super().__init__(); s.emb = nn.Embedding(NV, 32); s.lstm = nn.LSTM(32, 64, batch_first=True); s.head = nn.Linear(64, NV)
        def forward(s, x): return s.head(s.lstm(s.emb(x))[0])
    ANT = _Antic(); ANT.load_state_dict(torch.load(dl("c-action-anticipation-lstm", "lstm.pt"), map_location="cpu")); ANT.eval()
except Exception as e:
    ERR["antic"] = str(e)

@torch.no_grad()
def antic_fn(seq):
    if ANT is None: return f"(model unavailable: {ERR.get('antic')})"
    idx = [VERBS.index(v) for v in seq if v in VERBS]
    if not idx: return "pick at least one action"
    logits = ANT(torch.tensor([idx]))[0, -1]
    p = F.softmax(logits, -1); top = torch.topk(p, 3)
    return "next action — " + ", ".join(f"{VERBS[i]} ({p[i]:.0%})" for i in top.indices.tolist())

# ───────────────────── gridworld policy (REINFORCE) ─────────────────────
N, MOVES = 5, [(-1, 0), (1, 0), (0, -1), (0, 1)]; GOAL = (N - 1, N - 1)
def feat(p): v = torch.zeros(2 * N); v[p[0]] = 1.0; v[N + p[1]] = 1.0; return v
POL = None
try:
    POL = nn.Sequential(nn.Linear(2 * N, 64), nn.ReLU(), nn.Linear(64, 4))
    POL.load_state_dict(torch.load(dl("ag-reinforce-gridworld", "policy.pt"), map_location="cpu")); POL.eval()
except Exception as e:
    ERR["policy"] = str(e)

@torch.no_grad()
def policy_fn(sx, sy):
    if POL is None: return None
    p = (int(sx), int(sy)); path = [p]
    for _ in range(2 * N + 2):
        if p == GOAL: break
        a = POL(feat(p)).argmax().item()
        p = (min(max(p[0] + MOVES[a][0], 0), N - 1), min(max(p[1] + MOVES[a][1], 0), N - 1)); path.append(p)
    xs = [q[0] for q in path]; ys = [q[1] for q in path]
    fig, ax = plt.subplots(figsize=(3.6, 3.6))
    ax.plot(xs, ys, "-o", c="C0"); ax.scatter([GOAL[0]], [GOAL[1]], c="C3", s=120, marker="*", label="goal")
    ax.scatter([sx], [sy], c="C2", s=60, label="start"); ax.set_xlim(-.5, N - .5); ax.set_ylim(-.5, N - .5)
    ax.set_xticks(range(N)); ax.set_yticks(range(N)); ax.grid(alpha=.3); ax.legend(); ax.set_title("learned policy path")
    return fig

# ───────────────────── world model (CEM planning) ─────────────────────
DT, FR = 0.1, 0.1; WGOAL = torch.tensor([0., 0.])
def step_env(s, a):
    a = a.clamp(-1, 1); x, y, vx, vy = s[..., 0], s[..., 1], s[..., 2], s[..., 3]
    vx = vx * (1 - FR) + a[..., 0] * DT; vy = vy * (1 - FR) + a[..., 1] * DT
    return torch.stack([x + vx * DT, y + vy * DT, vx, vy], -1)
WM = None
try:
    class _Dyn(nn.Module):
        def __init__(s, Hd=256): super().__init__(); s.net = nn.Sequential(nn.Linear(6, Hd), nn.SiLU(), nn.Linear(Hd, Hd), nn.SiLU(), nn.Linear(Hd, 4))
        def forward(s, st, a): return s.net(torch.cat([st, a], -1))
    WM = _Dyn(); WM.load_state_dict(torch.load(dl("d-world-model", "dynamics.pt"), map_location="cpu")); WM.eval()
except Exception as e:
    ERR["world"] = str(e)

@torch.no_grad()
def world_fn(sx, sy):
    if WM is None: return None
    def plan(s0, H=15, K=400, it=4, el=40):
        mu = torch.zeros(H, 2); std = torch.ones(H, 2)
        for _ in range(it):
            acts = (mu + std * torch.randn(K, H, 2)).clamp(-1, 1); s = s0.repeat(K, 1); tot = torch.zeros(K)
            for h in range(H):
                s = s + WM(s, acts[:, h]); tot = tot - torch.linalg.norm(s[..., :2] - WGOAL, dim=-1)
            idx = tot.topk(el).indices; mu = acts[idx].mean(0); std = acts[idx].std(0) + 1e-3
        return mu[0]
    s = torch.tensor([float(sx), float(sy), 0., 0.]); traj = [s[:2].clone()]
    for _ in range(40):
        s = step_env(s, plan(s)); traj.append(s[:2].clone())
    tr = torch.stack(traj)
    fig, ax = plt.subplots(figsize=(3.6, 3.6))
    ax.plot(tr[:, 0], tr[:, 1], "-o", c="C0", ms=3); ax.scatter([0], [0], c="C3", s=120, marker="*", label="goal")
    ax.scatter([sx], [sy], c="C2", s=60, label="start"); ax.legend(); ax.set_aspect("equal"); ax.grid(alpha=.3); ax.set_title("planned trajectory (CEM)")
    return fig

# ───────────────────── tool-use agent (no model) ─────────────────────
import re
TOOLS = {"calc": lambda e: eval(e, {"__builtins__": {}}, {"sqrt": math.sqrt}), "len": len, "rev": lambda s: s[::-1]}
def agent_fn(task):
    try:
        m = re.match(r"compute (.+)", task)
        if m: return f"calc({m.group(1)}) = {TOOLS['calc'](m.group(1))}"
        if task.startswith("length of "): return f"len = {TOOLS['len'](task[10:])}"
        if task.startswith("reverse "): return f"reversed = {TOOLS['rev'](task[8:])}"
        return "I can: 'compute 2*(3+4)', 'length of robotics', 'reverse agent'"
    except Exception as e:
        return f"error: {e}"

# ───────────────────── gallery ─────────────────────
GALLERY = [  # all 45 repos — trained ones show figures; placeholders light up once filled
    "nanogpt-shakespeare", "a-smplify-fit", "a-motion-diffusion", "a-pose-heatmap", "a-rotation-6d",
    "b-deepsdf-shape", "b-gaussian-splatting-2d", "b-hashgrid-instngp", "b-icp-registration", "b-mae-pretrain",
    "c-action-anticipation-lstm", "c-simclr-pretrain", "d-world-model", "d-tsdf-fusion", "d-semantic-mapping",
    "ag-reinforce-gridworld", "ag-behavior-cloning", "ag-agent-harness", "lm-distillation",
    # advanced / GPU labs (placeholders until you train them on Colab)
    "a-mdm-text-to-motion", "a-4dhumans-mesh", "b-gaussian-splatting-3d", "b-nerfstudio-nerfacto",
    "c-videomae-egocentric", "c-sam2-video-segmentation", "c-whisper-finetune", "d-splatam-slam",
    "d-dreamerv3-world-model", "lm-qlora-finetune-llm", "lm-dpo-alignment", "lm-vlm-finetune",
    "lm-videolm-qwen2vl", "lm-rag-pipeline", "lm-eval-harness", "lm-unsloth-finetune", "lm-rlhf-ppo",
    "lm-stable-diffusion-lora", "lm-controlnet", "lm-vllm-serving", "ag-llm-agent-tooluse",
    "ag-habitat-navigation", "b-nerf-from-scratch", "cd-clip-zeroshot-probe", "c-videomae-finetune",
    "c-dinov2-features-probe",
]
def gallery_fn(slug):
    img, info = None, ""
    try: img = dl(slug, "figure.png")
    except Exception: pass
    try: info = json.dumps(json.load(open(dl(slug, "metrics.json"))), indent=2)[:1200]
    except Exception: pass
    if img is None and not info:  # likely a placeholder, or just not trained yet
        try:
            dl(slug, "metrics.todo.json")
            info = "🚧 Not trained yet — open this lab's notebook in Colab, Run all, and publish.\nThen this entry lights up automatically with its results figure + metrics."
        except Exception:
            info = "(no results found in this repo)"
    return img, info, f"https://huggingface.co/{repo(slug)}"

# ───────────────────── UI ─────────────────────
with gr.Blocks(title="Ropedia Academy · Models") as demo:
    gr.Markdown("# Ropedia Academy · Models\nInteractive demos of models trained from scratch in "
                "[Ropedia Academy](https://chaoyue0307.github.io/ropedia-academy/). All loaded from `cy0307/ropedia-*`.")
    with gr.Tab("nanoGPT (text)"):
        p = gr.Textbox(label="Prompt", value="ROMEO:"); n1 = gr.Slider(50, 600, 250, step=10, label="tokens"); t1 = gr.Slider(0.1, 1.5, 0.8, step=.05, label="temperature")
        o1 = gr.Textbox(label="Generated", lines=12); gr.Button("Generate").click(nanogpt_fn, [p, n1, t1], o1)
    with gr.Tab("Motion diffusion"):
        n2 = gr.Slider(1, 6, 4, step=1, label="how many motions"); o2 = gr.Plot(); gr.Button("Sample motions").click(motion_fn, n2, o2)
    with gr.Tab("Action anticipation"):
        s3 = gr.CheckboxGroup(VERBS, value=["take", "wash"], label="action so far"); o3 = gr.Textbox(label="prediction")
        gr.Button("Predict next").click(antic_fn, s3, o3)
    with gr.Tab("Gridworld policy"):
        sx = gr.Slider(0, N - 1, 0, step=1, label="start x"); sy = gr.Slider(0, N - 1, 0, step=1, label="start y"); o4 = gr.Plot()
        gr.Button("Run policy").click(policy_fn, [sx, sy], o4)
    with gr.Tab("World model (plan)"):
        wx = gr.Slider(-2, 2, 1.8, step=.1, label="start x"); wy = gr.Slider(-2, 2, -1.6, step=.1, label="start y"); o5 = gr.Plot()
        gr.Button("Plan to goal").click(world_fn, [wx, wy], o5)
    with gr.Tab("Tool-use agent"):
        a6 = gr.Textbox(label="task", value="compute sqrt(144)+2"); o6 = gr.Textbox(label="answer")
        gr.Button("Run agent").click(agent_fn, a6, o6)
    with gr.Tab("Gallery (all models)"):
        g = gr.Dropdown(GALLERY, value="b-hashgrid-instngp", label="model")
        gi = gr.Image(label="result"); gt = gr.Code(label="metrics.json"); gl = gr.Textbox(label="repo")
        g.change(gallery_fn, g, [gi, gt, gl]); gr.Button("Load").click(gallery_fn, g, [gi, gt, gl])

if __name__ == "__main__":
    demo.launch()
