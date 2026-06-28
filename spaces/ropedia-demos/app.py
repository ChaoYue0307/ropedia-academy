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
from PIL import Image
from huggingface_hub import hf_hub_download

USER = "cy0307"
def repo(slug): return f"{USER}/ropedia-{slug}"
def dl(slug, fn): return hf_hub_download(repo(slug), fn)

ERR = {}  # slug -> load error (for graceful messages)

def _msg_fig(text):
    fig, ax = plt.subplots(figsize=(5, 2.4)); ax.text(0.5, 0.5, text, ha="center", va="center", wrap=True, fontsize=11, color="#8a8aa0")
    ax.axis("off"); return fig

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
    if MOT is None: return _msg_fig("Motion model not available — train/upload it (a-motion-diffusion).")
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

# ───────────────────── CartPole policy (REINFORCE / actor-critic) ─────────────────────
POL = None
try:
    POL = nn.Sequential(nn.Linear(4, 64), nn.Tanh(), nn.Linear(64, 2))
    POL.load_state_dict(torch.load(dl("ag-reinforce-gridworld", "policy.pt"), map_location="cpu")); POL.eval()
except Exception as e:
    ERR["policy"] = str(e)

# CartPole-v1 dynamics (Gymnasium constants) — reimplemented so the demo needs no gym install
def _cartpole_step(s, a):
    g, mc, mp, l, fmag, tau = 9.8, 1.0, 0.1, 0.5, 10.0, 0.02
    x, xd, th, thd = s; tm = mc + mp; pml = mp * l
    f = fmag if a == 1 else -fmag
    ct, st_ = math.cos(th), math.sin(th)
    tmp = (f + pml * thd * thd * st_) / tm
    thacc = (g * st_ - ct * tmp) / (l * (4 / 3 - mp * ct * ct / tm))
    xacc = tmp - pml * thacc * ct / tm
    return np.array([x + tau * xd, xd + tau * xacc, th + tau * thd, thd + tau * thacc])

@torch.no_grad()
def policy_fn(seed):
    if POL is None: return _msg_fig("Policy not available — train/upload it (ag-reinforce-gridworld).")
    rng = np.random.default_rng(int(seed))
    s = rng.uniform(-0.05, 0.05, 4); xs, ths = [], []
    for _ in range(500):
        xs.append(float(s[0])); ths.append(float(s[2]))
        a = int(POL(torch.tensor(s, dtype=torch.float32)).argmax())
        s = _cartpole_step(s, a)
        if abs(s[0]) > 2.4 or abs(s[2]) > 12 * math.pi / 180: break
    steps = len(xs)
    fig, ax = plt.subplots(1, 2, figsize=(8.5, 3.4))
    cx, th = xs[-1], ths[-1]                                   # left: cart-pole at the last frame
    ax[0].set_xlim(-2.6, 2.6); ax[0].set_ylim(-0.4, 1.4)
    ax[0].plot([-2.4, 2.4], [0, 0], "k-", lw=1)
    ax[0].add_patch(plt.Rectangle((cx - 0.25, -0.1), 0.5, 0.2, color="C0"))
    ax[0].plot([cx, cx + math.sin(th)], [0, math.cos(th)], "C3-", lw=4)
    ax[0].set_title("cart-pole (last frame)"); ax[0].set_aspect("equal"); ax[0].axis("off")
    ax[1].plot(np.degrees(ths), c="C0"); ax[1].axhline(12, ls="--", c="C7"); ax[1].axhline(-12, ls="--", c="C7")
    ax[1].set_xlabel("step"); ax[1].set_ylabel("pole angle (°)"); ax[1].grid(alpha=.3)
    ax[1].set_title(f"balanced {steps} / 500 steps")
    plt.tight_layout(); return fig

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
    if WM is None: return _msg_fig("World model not available — train/upload it (d-world-model).")
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
    "a-smplify-fit", "a-motion-diffusion", "a-pose-heatmap", "a-rotation-6d",
    "b-deepsdf-shape", "b-gaussian-splatting-2d", "b-hashgrid-instngp", "b-icp-registration", "b-mae-pretrain",
    "c-action-anticipation-lstm", "c-simclr-pretrain", "d-world-model", "d-tsdf-fusion", "d-semantic-mapping",
    "ag-reinforce-gridworld", "ag-behavior-cloning", "ag-agent-harness", "nanogpt-shakespeare", "lm-distillation",
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
    """Never raises — always returns (image_or_None, status_markdown, metrics_str)."""
    base = f"https://huggingface.co/{repo(slug)}"
    title = slug.replace("-", " ").title()
    img, metrics, status = None, "", ""
    try: img = Image.open(dl(slug, "figure.png")).convert("RGB")   # load in-memory (avoids cache-path errors)
    except Exception: img = None
    try:
        metrics = json.dumps(json.load(open(dl(slug, "metrics.json"))), indent=2)[:1500]
        status = "✅ **Trained**"
    except Exception:
        try:
            dl(slug, "metrics.todo.json")
            status = ("🚧 **Placeholder — not trained yet.** Open this lab's notebook in Colab, "
                      "**Run all**, then publish; this entry fills in automatically.")
        except Exception:
            status = "⚠️ **Not published yet** — run `python scripts/upload_all_to_hf.py` to create this repo."
    md = f"### {title}\n{status}\n\n[Open the repo ↗]({base})"
    return img, md, metrics

TRAINED = {  # the 19 repos with real weights ("deployed"); everything else is a placeholder
    "nanogpt-shakespeare", "a-smplify-fit", "a-motion-diffusion", "a-pose-heatmap", "a-rotation-6d",
    "b-deepsdf-shape", "b-gaussian-splatting-2d", "b-hashgrid-instngp", "b-icp-registration", "b-mae-pretrain",
    "c-action-anticipation-lstm", "c-simclr-pretrain", "d-world-model", "d-tsdf-fusion", "d-semantic-mapping",
    "ag-reinforce-gridworld", "ag-behavior-cloning", "ag-agent-harness", "lm-distillation",
}
_NAME_OVERRIDE = {"ag-reinforce-gridworld": "REINFORCE · CartPole", "nanogpt-shakespeare": "nanoGPT · Shakespeare"}
def pretty(slug): return _NAME_OVERRIDE.get(slug, slug.replace("-", " ").title())
N_TRAINED = len(TRAINED); N_PH = len(GALLERY) - N_TRAINED

# ───────────────────── UI ─────────────────────
BRAND = gr.themes.Color(  # Ropedia Academy palette (matches the site's tailwind `brand`)
    c50="#eef0ff", c100="#e0e3ff", c200="#c6ccff", c300="#a3a8ff", c400="#827ef9",
    c500="#6a5ef0", c600="#5a44d6", c700="#4c37b0", c800="#3f308d", c900="#372d71", c950="#221a43",
    name="ropebrand",
)
THEME = gr.themes.Soft(
    primary_hue=BRAND, secondary_hue=BRAND, neutral_hue="slate",
    font=[gr.themes.GoogleFont("Inter"), "system-ui", "sans-serif"],
    radius_size="lg",
)
CSS = """
.gradio-container {max-width: 1040px !important; margin: 0 auto !important;}
#hdr {background: linear-gradient(135deg,#8b80ff 0%,#5a44d6 55%,#4c37b0 100%); color:#fff;
      border-radius:18px; padding:22px 26px; margin-bottom:10px;
      box-shadow:0 18px 44px -18px rgba(76,55,176,.75);}
#hdr h1 {font-size:1.7rem; font-weight:800; margin:0 0 5px; color:#fff; letter-spacing:-.01em;}
#hdr p {opacity:.93; margin:0; font-size:.93rem; line-height:1.5;}
#hdr a {color:#67e8f9; font-weight:700; text-decoration:none;}
#hdr a:hover {text-decoration:underline;}
.tab-nav button {font-weight:600 !important;}
.tip {font-size:.92rem; opacity:.8; margin:2px 0 10px;}
#gstat {font-weight:800; font-size:1.05rem; margin:4px 0 2px;}
#modelgrid {display:grid !important; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)) !important; gap:8px !important; margin-top:8px;}
#modelgrid button {width:100% !important; justify-content:flex-start !important; font-weight:500 !important; text-align:left; border-radius:12px !important;}
"""
LOGO = """<svg width="46" height="46" viewBox="0 0 64 64" style="flex:none;filter:drop-shadow(0 6px 14px rgba(0,0,0,.25))" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="rl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b80ff"/><stop offset="1" stop-color="#4c37b0"/></linearGradient></defs>
  <rect width="64" height="64" rx="15" fill="url(#rl)"/>
  <path d="M22 49 V15 H33 a9.5 9.5 0 0 1 0 19 H22 M27.5 34 L41 49" fill="none" stroke="#fff" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="41" cy="49" r="4.2" fill="#67e8f9"/>
</svg>"""
HEADER = f"""<div id="hdr"><div style="display:flex;align-items:center;gap:15px;">
  {LOGO}
  <div>
    <h1>Ropedia Academy · Models</h1>
    <p>Interactive demos of models trained <b>from scratch</b> in
    <a href="https://chaoyue0307.github.io/ropedia-academy/" target="_blank">Ropedia Academy</a> —
    loaded live from <a href="https://huggingface.co/cy0307" target="_blank">cy0307/ropedia-*</a>.
    Small educational models — the value is the method, not a leaderboard.</p>
  </div>
</div></div>"""
FOOTER = ('<p style="text-align:center;opacity:.6;font-size:.85rem;margin-top:14px;">'
          'Part of <a href="https://chaoyue0307.github.io/ropedia-academy/" target="_blank">Ropedia Academy</a>'
          ' · models &amp; collection on <a href="https://huggingface.co/cy0307" target="_blank">Hugging Face 🤗</a></p>')

with gr.Blocks(title="Ropedia Academy · Models") as demo:
    gr.HTML(HEADER)
    with gr.Tabs():
        with gr.Tab("🖼️ Gallery"):
            gr.HTML(f"<div id='gstat'>Models — ✅ {N_TRAINED} deployed · 🚧 {N_PH} placeholders &nbsp;(of {len(GALLERY)})</div>")
            gr.Markdown("Click a model to view its result + metrics below. ✅ trained · 🚧 placeholder (train on Colab to fill).", elem_classes="tip")
            # detail components defined first (so clicks can target them) but rendered lower
            gi = gr.Image(show_label=False, render=False)
            gmd = gr.Markdown(render=False)
            gt = gr.Code(label="metrics.json", language="json", render=False)
            with gr.Row(elem_id="modelgrid"):                       # the clickable grid — at the top
                for _slug in GALLERY:
                    _badge = "✅" if _slug in TRAINED else "🚧"
                    gr.Button(f"{_badge} {pretty(_slug)}", size="sm").click(
                        (lambda s=_slug: gallery_fn(s)), None, [gi, gmd, gt])
            gr.Markdown("---")
            with gr.Row():                                          # detail — below the grid
                gi.render()
                with gr.Column():
                    gmd.render()
                    gt.render()
        with gr.Tab("✍️ nanoGPT"):
            gr.Markdown("Character-level **GPT** on Tiny Shakespeare — type a prompt, it continues in the Bard's style.", elem_classes="tip")
            with gr.Row():
                with gr.Column(scale=2):
                    p = gr.Textbox(label="Prompt", value="ROMEO:")
                    with gr.Row():
                        n1 = gr.Slider(50, 600, 250, step=10, label="Tokens")
                        t1 = gr.Slider(0.1, 1.5, 0.8, step=.05, label="Temperature")
                    b1 = gr.Button("Generate", variant="primary")
                o1 = gr.Textbox(label="Generated text", lines=12, scale=3)
            b1.click(nanogpt_fn, [p, n1, t1], o1)
        with gr.Tab("🕺 Motion diffusion"):
            gr.Markdown("A **DDPM** that samples new 2D motion trajectories.", elem_classes="tip")
            n2 = gr.Slider(1, 6, 4, step=1, label="How many motions")
            gr.Button("Sample motions", variant="primary").click(motion_fn, n2, (o2 := gr.Plot()))
        with gr.Tab("🔮 Action anticipation"):
            gr.Markdown("An **LSTM** predicts the next action from the sequence so far.", elem_classes="tip")
            s3 = gr.CheckboxGroup(VERBS, value=["take", "wash"], label="Actions so far")
            gr.Button("Predict next", variant="primary").click(antic_fn, s3, (o3 := gr.Textbox(label="Prediction")))
        with gr.Tab("🎮 CartPole policy"):
            gr.Markdown("A **REINFORCE / actor-critic** agent solving **Gymnasium CartPole-v1** — run an episode and watch it balance the pole (near the 500-step max).", elem_classes="tip")
            seed = gr.Slider(0, 50, 0, step=1, label="Episode seed")
            gr.Button("Run episode", variant="primary").click(policy_fn, seed, (o4 := gr.Plot()))
        with gr.Tab("🌍 World model"):
            gr.Markdown("A learned **world model** plans a path to the origin with **CEM**.", elem_classes="tip")
            with gr.Row():
                wx = gr.Slider(-2, 2, 1.8, step=.1, label="Start x"); wy = gr.Slider(-2, 2, -1.6, step=.1, label="Start y")
            gr.Button("Plan to goal", variant="primary").click(world_fn, [wx, wy], (o5 := gr.Plot()))
        with gr.Tab("🛠️ Tool-use agent"):
            gr.Markdown("A tool-using agent: `compute 2*(3+4)`, `length of robotics`, `reverse agent`.", elem_classes="tip")
            a6 = gr.Textbox(label="Task", value="compute sqrt(144)+2")
            gr.Button("Run agent", variant="primary").click(agent_fn, a6, (o6 := gr.Textbox(label="Answer")))
    demo.load((lambda: gallery_fn("b-hashgrid-instngp")), None, [gi, gmd, gt])   # show a default on load
    gr.HTML(FOOTER)

if __name__ == "__main__":
    demo.launch(theme=THEME, css=CSS)
