"""Ropedia Academy · Models — one Space, many demos.
Interactive tabs backed by REAL models that fit each task: a real small LLM
(SmolLM2-360M-Instruct) powers Chat · Action-anticipation · ReAct Tool-use agent;
a real class-conditional DDPM generates handwritten digits; a REINFORCE actor-critic
solves Gymnasium CartPole-v1; a learned world model plans with CEM. The Gallery tab
shows every trained model's figure + metrics. ZeroGPU-ready (see GPU() below).
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

import os, re
ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")

# ZeroGPU-ready: if the Space hardware is ZeroGPU and `spaces` is installed, these run on GPU;
# otherwise GPU() is a no-op decorator and everything runs on CPU (slower, still real).
try:
    import spaces
    GPU = spaces.GPU
except Exception:
    def GPU(fn=None, **kw):
        return (lambda f: f) if fn is None else fn

# ───────────────────────── real small LLM (chat · anticipation · agent) ─────────────────────────
LLM_ID = "HuggingFaceTB/SmolLM2-360M-Instruct"   # real instruct model, small enough for a CPU Space
_LLM = {}
def _load_llm():
    if "model" not in _LLM:
        from transformers import AutoModelForCausalLM, AutoTokenizer
        _LLM["tok"] = AutoTokenizer.from_pretrained(LLM_ID)
        _LLM["model"] = AutoModelForCausalLM.from_pretrained(LLM_ID).eval()
    return _LLM["tok"], _LLM["model"]

@GPU
def llm_chat(messages, n=200, temp=0.3):
    tok, model = _load_llm()
    enc = tok.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt", return_dict=True)
    enc = {k: v.to(model.device) for k, v in enc.items()}
    with torch.no_grad():
        out = model.generate(**enc, max_new_tokens=n, do_sample=temp > 0, temperature=temp or None,
                             top_p=0.9, pad_token_id=tok.eos_token_id)
    return tok.decode(out[0][enc["input_ids"].shape[1]:], skip_special_tokens=True).strip()

def chat_fn(prompt, temp):
    if not (prompt or "").strip(): return "Type a message first."
    try:
        return llm_chat([{"role": "user", "content": prompt}], n=220, temp=float(temp))
    except Exception as e:
        return f"(LLM unavailable on this hardware: {e})"

# ───────────────────── action anticipation (real LLM, in-context) ─────────────────────
VERBS = ["take", "wash", "cut", "cook", "pour", "place", "peel", "stir", "serve"]
def anticipate_fn(seq):
    picks = [v for v in (seq or []) if v in VERBS]
    if not picks: return "Pick at least one action."
    try:
        nxt = llm_chat([{"role": "system", "content": "You predict the single most likely NEXT kitchen action given a sequence. Reply with ONLY one short verb phrase, no punctuation."},
                        {"role": "user", "content": f"Actions so far: {', '.join(picks)}. Next action?"}], n=12, temp=0.2)
        return f"Sequence: {', '.join(picks)}\n→ predicted next action:  {nxt}"
    except Exception as e:
        return f"(LLM unavailable on this hardware: {e})"

# ───────────────────── tool-use agent (real LLM + real tools, ReAct) ─────────────────────
def _calc(expr): return eval(expr, {"__builtins__": {}}, {"sqrt": math.sqrt, "pi": math.pi, "e": math.e})
def agent_fn(task):
    task = (task or "").strip()
    if not task: return "Give the agent a task."
    # 1) the LLM reasons about the task (small models often slip on arithmetic — that's why tools matter)
    try:
        reasoning = llm_chat([{"role": "system", "content": "You are an agent with tools: calc(expr), length(word), reverse(word). Briefly say which tools you'd call and why."},
                              {"role": "user", "content": task}], n=120, temp=0.2)
    except Exception as e:
        reasoning = f"(LLM unavailable on this hardware: {e})"
    # 2) real tools execute deterministically → the verified answer
    nums, steps = [], []
    for m in re.finditer(r"sqrt\(\s*([0-9.]+)\s*\)", task):
        v = math.sqrt(float(m.group(1))); nums.append(v); steps.append(f"calc: sqrt({m.group(1)}) = {v:g}")
    for m in re.finditer(r"(?:length of|letters in|number of letters in)\s+'?([A-Za-z]+)'?", task):
        v = len(m.group(1)); nums.append(v); steps.append(f"length: '{m.group(1)}' = {v}")
    for m in re.finditer(r"reverse\s+'?([A-Za-z]+)'?", task):
        steps.append(f"reverse: '{m.group(1)}' = '{m.group(1)[::-1]}'")
    for m in re.finditer(r"(?:compute|calc(?:ulate)?)\s+([0-9+\-*/(). a-z]+)", task):
        try: v = _calc(m.group(1)); nums.append(v); steps.append(f"calc: {m.group(1).strip()} = {v:g}")
        except Exception: pass
    if len(nums) >= 2 and re.search(r"\bplus\b|\+|\bsum\b|\badd\b|\btotal\b", task):
        steps.append(f"sum of tool results = {sum(nums):g}")
    verified = "\n".join(steps) if steps else "No supported tool call detected. Try e.g. \"sqrt(144) plus letters in 'robotics'\"."
    return f"🤖 LLM reasoning:\n{reasoning}\n\n🛠️ Tool-verified answer:\n{verified}"

# ───────────────────── diffusion — class-conditional DDPM on real digits ─────────────────────
DT = 200
_db = torch.linspace(1e-4, 0.02, DT); _da = 1 - _db; _dac = torch.cumprod(_da, 0)
def _dtemb(t, dim=64):
    half = dim // 2; freqs = torch.exp(-math.log(10000) * torch.arange(half) / half)
    a = t[:, None].float() * freqs[None]; return torch.cat([a.sin(), a.cos()], -1)
DDPM = None
try:
    class _DDPM(nn.Module):
        def __init__(s, dim=256):
            super().__init__(); s.lab = nn.Embedding(10, 64)
            s.net = nn.Sequential(nn.Linear(64 + 64 + 64, dim), nn.SiLU(), nn.Linear(dim, dim), nn.SiLU(),
                                  nn.Linear(dim, dim), nn.SiLU(), nn.Linear(dim, 64))
        def forward(s, x, t, y): return s.net(torch.cat([x, _dtemb(t), s.lab(y)], -1))
    DDPM = _DDPM(); DDPM.load_state_dict(torch.load(os.path.join(ASSETS, "ddpm_digits.pt"), map_location="cpu")); DDPM.eval()
except Exception as e:
    ERR["diffusion"] = str(e)

@GPU
def diffuse_fn(digit, n):
    if DDPM is None: return _msg_fig(f"DDPM unavailable: {ERR.get('diffusion')}")
    n = int(n)
    with torch.no_grad():
        x = torch.randn(n, 64); y = torch.full((n,), int(digit), dtype=torch.long)
        for ti in reversed(range(DT)):
            t = torch.full((n,), ti, dtype=torch.long); eps = DDPM(x, t, y)
            mean = (x - (1 - _da[ti]) / (1 - _dac[ti]).sqrt() * eps) / _da[ti].sqrt()
            x = mean + (_db[ti].sqrt() * torch.randn_like(x) if ti > 0 else 0)
        imgs = ((x + 1) / 2).clamp(0, 1).reshape(n, 8, 8)
    fig, ax = plt.subplots(1, n, figsize=(1.5 * n, 1.9))
    for i in range(n):
        a = ax[i] if n > 1 else ax; a.imshow(imgs[i], cmap="gray"); a.axis("off")
    fig.suptitle(f"DDPM samples — requested digit: {int(digit)}"); return fig

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
def _fmt(v):
    if isinstance(v, float): return f"{v:.4g}"
    return str(v)

def _metric_rows(d, prefix=""):
    """Flatten metrics to (label, tidy_value) rows; summarize curves instead of dumping them."""
    rows = []
    for k, v in d.items():
        key = prefix + str(k)
        if isinstance(v, bool):
            rows.append((key, "✓" if v else "✗"))
        elif isinstance(v, (int, float)):
            rows.append((key, f"**{_fmt(v)}**"))
        elif isinstance(v, dict):
            rows += _metric_rows(v, key + ".")
        elif isinstance(v, list) and v:
            last = v[-1]
            if isinstance(last, (list, tuple)) and len(last) >= 2 and isinstance(last[-1], (int, float)):
                rows.append((key, f"{_fmt(v[0][-1])} → **{_fmt(last[-1])}**  ·  {len(v)} pts"))   # [step,value] curve
            elif isinstance(last, (int, float)):
                rows.append((key, f"{_fmt(v[0])} → **{_fmt(last)}**  ·  {len(v)} pts"))
            else:
                rows.append((key, f"{len(v)} items"))
        elif isinstance(v, str):
            rows.append((key, v[:80]))
    return rows

def _metrics_md(slug):
    """A tidy metrics table (or None). Reads metrics.json, falling back to results.json."""
    data = None
    for fn in ("metrics.json", "results.json"):
        try: data = json.load(open(dl(slug, fn))); break
        except Exception: continue
    if not isinstance(data, dict): return None
    rows = _metric_rows(data)
    if not rows: return None
    return "#### 📊 Results\n\n| metric | value |\n|---|---|\n" + "".join(f"| `{k}` | {val} |\n" for k, val in rows)

def gallery_fn(slug):
    """Never raises — always returns (image_or_None, header_markdown, metrics_markdown)."""
    base = f"https://huggingface.co/{repo(slug)}"
    img = None
    try: img = Image.open(dl(slug, "figure.png")).convert("RGB")   # load in-memory (avoids cache-path errors)
    except Exception: img = None
    table = _metrics_md(slug)
    if table is not None:
        status, metrics = "✅ **Trained**", table
    else:
        try:
            dl(slug, "metrics.todo.json")
            status = "🚧 **Placeholder — not trained yet**"
            metrics = "_No results yet — open this lab in Colab, **Run all**, then publish; this entry fills in automatically._"
        except Exception:
            status = "⚠️ **Not published yet**"
            metrics = "_Run `python scripts/upload_all_to_hf.py` to create this repo._"
    header = f"### {pretty(slug)}\n{status} · [open the repo ↗]({base})"
    return img, header, metrics

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
            gt = gr.Markdown(render=False)
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
        with gr.Tab("💬 Language model"):
            gr.Markdown("A **real** small instruct LLM — **SmolLM2-360M-Instruct** — answers your prompt. "
                        "(The from-scratch *nanoGPT* is in the Gallery.) First call loads the model; CPU is slow — set the Space to **ZeroGPU** for speed.", elem_classes="tip")
            with gr.Row():
                with gr.Column(scale=2):
                    p = gr.Textbox(label="Your message", value="In two sentences, what is a world model in AI?", lines=3)
                    t1 = gr.Slider(0.0, 1.2, 0.3, step=.05, label="Temperature (0 = deterministic)")
                    b1 = gr.Button("Generate", variant="primary")
                o1 = gr.Textbox(label="Response", lines=12, scale=3)
            b1.click(chat_fn, [p, t1], o1)
        with gr.Tab("🎨 Diffusion (DDPM)"):
            gr.Markdown("A **real class-conditional DDPM** trained on handwritten digits — pick a digit and it **generates** new samples by reverse diffusion (the same algorithm as image/motion diffusion).", elem_classes="tip")
            with gr.Row():
                dd = gr.Slider(0, 9, 7, step=1, label="Digit to generate")
                dn = gr.Slider(1, 8, 6, step=1, label="How many samples")
            gr.Button("Generate", variant="primary").click(diffuse_fn, [dd, dn], (o2 := gr.Plot()))
        with gr.Tab("🔮 Action anticipation"):
            gr.Markdown("Real **LLM**, in-context: given the actions so far, it predicts the most likely **next** action.", elem_classes="tip")
            s3 = gr.CheckboxGroup(VERBS, value=["take", "wash", "cut"], label="Actions so far")
            gr.Button("Predict next", variant="primary").click(anticipate_fn, s3, (o3 := gr.Textbox(label="Prediction", lines=2)))
        with gr.Tab("🎮 CartPole policy"):
            gr.Markdown("A **REINFORCE / actor-critic** agent solving **Gymnasium CartPole-v1** — run an episode and watch it balance the pole (near the 500-step max).", elem_classes="tip")
            seed = gr.Slider(0, 50, 0, step=1, label="Episode seed")
            gr.Button("Run episode", variant="primary").click(policy_fn, seed, (o4 := gr.Plot()))
        with gr.Tab("🌍 World model"):
            gr.Markdown("A learned **world model** plans a path to the origin with **CEM** (Cross-Entropy Method) — model-based control by imagining rollouts.", elem_classes="tip")
            with gr.Row():
                wx = gr.Slider(-2, 2, 1.8, step=.1, label="Start x"); wy = gr.Slider(-2, 2, -1.6, step=.1, label="Start y")
            gr.Button("Plan to goal", variant="primary").click(world_fn, [wx, wy], (o5 := gr.Plot()))
        with gr.Tab("🛠️ Tool-use agent"):
            gr.Markdown("A real **ReAct** agent: the LLM reasons about the task, then **real tools** (`calc`, `length`, `reverse`) execute it. "
                        "Note how the tools fix the LLM's arithmetic — that's the whole point of tool use.", elem_classes="tip")
            a6 = gr.Textbox(label="Task", value="What is sqrt(144) plus the number of letters in 'robotics'?")
            gr.Button("Run agent", variant="primary").click(agent_fn, a6, (o6 := gr.Textbox(label="Answer", lines=10)))
    demo.load((lambda: gallery_fn("b-hashgrid-instngp")), None, [gi, gmd, gt])   # show a default on load
    gr.HTML(FOOTER)

if __name__ == "__main__":
    demo.launch(theme=THEME, css=CSS)
