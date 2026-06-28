"""Generate a comprehensive, visual model card (README.md) for every bundle in
models/. Reads each bundle's metrics.json / results.json + embeds its figures.
Run before uploading:  python scripts/gen_model_cards.py
"""
import os, glob, json

ROPEDIA = "https://chaoyue0307.github.io/ropedia-academy/"
REPO = "ChaoYue0307/ropedia-academy"

# bundle folder -> the lab notebook it came from (for the Colab link)
NOTEBOOK = {"nanogpt-shakespeare": "LM_nanogpt_pretrain"}

META = {
    "A_smplify_fit": dict(title="SMPLify body fit", task="3D human pose by 2D-keypoint reprojection", data="synthetic 2D keypoints", track="A · Human modeling", tags=["pose-estimation"], summary="An articulated body fit to 2D keypoints by reprojection optimization with a pose prior — the SMPLify recipe."),
    "A_motion_diffusion": dict(title="Motion diffusion (DDPM)", task="human-motion generation", data="synthetic 2D motion trajectories", track="A · Human modeling", tags=["diffusion"], summary="A denoising-diffusion model that generates motion trajectories — the MDM recipe, trained from scratch, sampled from EMA weights."),
    "A_pose_heatmap": dict(title="2D pose estimation (heatmap regression)", task="2D keypoint detection", data="synthetic articulated arm", track="A · Human modeling", tags=["keypoint-detection"], summary="A fully-convolutional net that predicts per-joint heatmaps, decoded to coordinates by soft-argmax. Best-checkpoint by PCK."),
    "A_rotation_6d": dict(title="6D vs Euler rotation regression", task="3D rotation regression", data="random SO(3) rotations", track="A · Human modeling", tags=["rotation"], summary="Shows the continuous 6D rotation representation is far easier for a network to regress than Euler angles."),
    "B_deepsdf_shape": dict(title="Neural SDF (DeepSDF-style)", task="implicit 3D shape", data="analytic torus samples", track="B · 3D & rendering", tags=["implicit-neural-representation"], summary="An MLP signed-distance field with an eikonal regularizer; the surface is its zero level set (marching cubes)."),
    "B_gaussian_splatting_2d": dict(title="2D Gaussian Splatting", task="differentiable image fitting", data="procedural target image", track="B · 3D & rendering", tags=["gaussian-splatting"], summary="Reconstructs an image with anisotropic 2D Gaussians (with densification) — the 2D analogue of 3D Gaussian Splatting."),
    "B_hashgrid_instngp": dict(title="Multiresolution hash grid (Instant-NGP)", task="differentiable image fitting", data="procedural target image", track="B · 3D & rendering", tags=["instant-ngp"], summary="A multiresolution hash-grid feature encoding + tiny MLP — the trick that made NeRF ~1000× faster."),
    "B_icp_registration": dict(title="ICP point-cloud registration", task="rigid point-cloud alignment", data="synthetic 3D clouds", track="B · 3D & rendering", tags=["registration"], summary="Recovers a rigid transform between two point clouds with Iterative Closest Point (nearest-neighbour + Kabsch)."),
    "B_mae_pretrain": dict(title="Masked Autoencoder (MAE)", task="self-supervised pretraining", data="synthetic images", track="B · 3D & rendering", tags=["self-supervised"], summary="Masks most image patches and reconstructs them — the MAE / VideoMAE pretraining objective."),
    "C_action_anticipation_lstm": dict(title="Action anticipation (LSTM)", task="next-action prediction", data="synthetic action grammar", track="C · Egocentric vision", tags=["sequence-modeling"], summary="An LSTM that anticipates the next action from a sequence, well above chance. Best-checkpoint by top-1."),
    "C_simclr_pretrain": dict(title="SimCLR self-supervised pretraining", task="contrastive representation learning", data="synthetic shapes", track="C · Egocentric vision", tags=["contrastive", "self-supervised"], summary="Contrastive (NT-Xent) pretraining with a large batch; a linear probe on the frozen features beats a random encoder."),
    "D_world_model": dict(title="World model + planning (CEM)", task="model-based control", data="2D point-mass environment", track="D · Scene & world models", tags=["reinforcement-learning"], summary="Learns environment dynamics, then plans with the Cross-Entropy Method to reach a goal inside imagination."),
    "D_tsdf_fusion": dict(title="TSDF fusion → mesh", task="dense 3D reconstruction", data="multi-view synthetic depth", track="D · Scene & world models", tags=["reconstruction"], summary="Fuses multi-view depth into a truncated SDF volume and extracts a mesh with marching cubes."),
    "D_semantic_mapping": dict(title="Bayesian semantic mapping", task="occupancy + semantic mapping", data="2D grid world", track="D · Scene & world models", tags=["mapping"], summary="Fuses noisy observations into an occupancy (log-odds) + semantic-label map that converges to ground truth."),
    "AG_reinforce_gridworld": dict(title="REINFORCE / actor-critic", task="reinforcement learning", data="gridworld navigation", track="AG · Agents & RL", tags=["reinforcement-learning"], summary="A policy-gradient agent with a value baseline + entropy bonus that learns to reach the goal."),
    "AG_behavior_cloning": dict(title="Behavior cloning (imitation)", task="imitation learning", data="expert gridworld demos", track="AG · Agents & RL", tags=["imitation-learning"], summary="A policy trained by supervised imitation of expert demonstrations; 100% rollout success."),
    "AG_agent_harness": dict(title="Agent + tool-use harness", task="agent evaluation", data="tool-use task suite", track="AG · Agents & RL", tags=["agent"], summary="A reusable harness: a tool registry, a tool-using agent loop, a task suite, and a scorer."),
    "LM_distillation": dict(title="Knowledge distillation", task="model compression", data="two-spiral classification", track="LM · Language & models", tags=["knowledge-distillation"], summary="A small student trained on a teacher's soft predictions beats one trained on only a few hard labels."),
    "nanogpt-shakespeare": dict(title="nanoGPT — Tiny Shakespeare", task="text-generation", data="Tiny Shakespeare (~1 MB)", track="LM · Language & models", tags=["text-generation", "gpt"], summary="A character-level GPT (decoder-only transformer) trained from scratch; best-checkpoint by validation loss.", pipeline="text-generation"),
}

USAGE = """## How to use

```python
import torch
state = torch.load("model.pt", map_location="cpu")   # some labs save pose.pt / gaussians.pt / transform.pt
# Rebuild the model class from the Ropedia Academy notebook (linked above), then:
# model.load_state_dict(state)
```
"""


def finals(d, prefix=""):
    """Flatten metrics to {label: final_scalar}."""
    out = {}
    for k, v in d.items():
        if isinstance(v, bool):
            out[prefix + k] = v
        elif isinstance(v, (int, float)):
            out[prefix + k] = v
        elif isinstance(v, dict):
            out.update(finals(v, prefix + k + "."))
        elif isinstance(v, list) and v:
            last = v[-1]
            if isinstance(last, (int, float)):
                out[prefix + k + " (final)"] = last
            elif isinstance(last, (list, tuple)) and last and isinstance(last[-1], (int, float)):
                out[prefix + k + " (final)"] = last[-1]
    return out


def card(folder):
    name = os.path.basename(folder)
    meta = META.get(name, dict(title=name, task="—", data="—", track="—", tags=[], summary="A model trained in Ropedia Academy."))
    metrics = {}
    for fn in ("metrics.json", "results.json"):
        p = os.path.join(folder, fn)
        if os.path.exists(p):
            try: metrics.update(json.load(open(p)))
            except Exception: pass
    fin = finals(metrics)
    nb = NOTEBOOK.get(name, name)
    colab = f"https://colab.research.google.com/github/{REPO}/blob/main/notebooks/training/{nb}.ipynb"

    fm = "---\nlicense: mit\nlibrary_name: pytorch\n"
    if meta.get("pipeline"):
        fm += f"pipeline_tag: {meta['pipeline']}\n"
    tags = ["ropedia-academy", "educational"] + meta.get("tags", [])
    fm += "tags:\n" + "".join(f"- {t}\n" for t in tags) + "---\n\n"

    b = [f"# {meta['title']}\n", meta["summary"] + "\n"]
    b.append(f"Trained from scratch in **[Ropedia Academy]({ROPEDIA})** — an interactive, bilingual course on embodied & spatial AI. "
             "**Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score.\n")
    b.append("| | |\n|---|---|\n"
             f"| **Task** | {meta['task']} |\n| **Data** | {meta['data']} |\n| **Track** | {meta['track']} |\n"
             f"| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)]({colab}) |\n")

    if fin:
        b.append("## Results\n")
        b.append("| metric | value |\n|---|---|\n" + "".join(
            f"| {k} | {round(v, 4) if isinstance(v, float) else v} |\n" for k, v in fin.items()) + "")
    pngs = sorted(os.path.basename(p) for p in glob.glob(os.path.join(folder, "*.png")))
    if pngs:
        b.append("\n" + "\n".join(f"![{os.path.splitext(p)[0]}]({p})" for p in pngs) + "\n")

    sp = os.path.join(folder, "sample.txt")
    if os.path.exists(sp):
        b.append("## Sample output\n\n```\n" + open(sp).read()[:600].rstrip() + "\n```\n")

    b.append(USAGE)
    files = sorted(os.path.basename(p) for p in glob.glob(os.path.join(folder, "*")) if os.path.basename(p) != "README.md")
    b.append("## Files\n\n" + "".join(f"- `{f}`\n" for f in files) + "\n")
    b.append(f"## Reproduce / train your own\n\nOpen the [lab notebook in Colab]({colab}) → **Runtime → GPU → Run all**, then its "
             f"*Publish to the Hugging Face Hub* cell. Browse every lab in the [Ropedia Academy Labs tab]({ROPEDIA}labs).\n")
    b.append(f"\n---\n*Part of the [Ropedia Academy]({ROPEDIA}) trained-model collection.*\n")

    open(os.path.join(folder, "README.md"), "w").write(fm + "\n".join(b))
    return name


if __name__ == "__main__":
    for folder in sorted(glob.glob("models/*")):
        if not os.path.isdir(folder):
            continue
        if os.path.exists(os.path.join(folder, "metrics.todo.json")):
            print("skip (placeholder) ->", os.path.basename(folder)); continue
        print("card ->", card(folder))
