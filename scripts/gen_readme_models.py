"""Generate the models index table in README.md (between the MODELS-INDEX markers)
from the bundles in models/. Keeps the README's 45-model table in sync with the
cards. Run:  python scripts/gen_readme_models.py   (CI fails if it changes anything)
"""
import os, sys, glob, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_model_cards as gmc   # reuse META + finals() + repo constants

REPO = "ChaoYue0307/ropedia-academy"
HF_USER = "cy0307"
START, END = "<!-- MODELS-INDEX:START -->", "<!-- MODELS-INDEX:END -->"
GROUPS = [("A", "A · Human modeling & motion"), ("B", "B · 3D / 4D & neural rendering"),
          ("C", "C · Egocentric vision"), ("D", "D · Scene & world models"),
          ("LM", "LM · Language & multimodal"), ("AG", "AG · Agents & RL")]
PRIORITY = ["greedy_eval", "success_rate", "rollout_success", "probe_simclr", "zero_shot",
            "linear_probe", "top1", "pck", "student_distill", "best_val", "test_recon_mse",
            "psnr", "rmse", "final_dist", "history", "geo_6d", "reproj", "dyn_mse", "l1",
            "recon_mse", "return", "loss", "verts"]
NICE = {"greedy_eval": "greedy return", "probe_simclr": "probe acc", "student_distill": "distilled acc",
        "test_recon_mse": "test MSE", "psnr": "PSNR", "top1": "top-1", "pck": "PCK",
        "rmse": "RMSE", "success_rate": "success", "rollout_success": "rollout",
        "geo_6d": "geodesic err", "reproj": "reproj err", "recon_mse": "recon MSE",
        "return": "return", "loss": "final loss", "zero_shot": "zero-shot acc", "linear_probe": "probe acc",
        "best_val": "val loss", "final_dist": "goal dist", "history": "map acc", "dyn_mse": "dyn MSE",
        "l1": "L1 err", "verts": "mesh verts"}


def slug(folder): return "ropedia-" + folder.lower().replace("_", "-")


def nb_url(folder):
    nbid = gmc.NOTEBOOK.get(folder, folder)
    for d in ("training", "advanced"):
        if os.path.exists(f"notebooks/{d}/{nbid}.ipynb"):
            return f"https://colab.research.google.com/github/{REPO}/blob/main/notebooks/{d}/{nbid}.ipynb"
    return None


def title_track(folder):
    p = os.path.join("models", folder, "README.md")
    title, track = folder, "—"
    if os.path.exists(p):
        txt = open(p).read()
        m = re.search(r"^#\s+(.+)$", txt, re.M)
        if m: title = re.split(r"\s+🚧", m.group(1))[0].strip()
        m = re.search(r"\|\s*\*\*Track\*\*\s*\|\s*(.+?)\s*\|", txt)
        if m: track = m.group(1).strip()
    return title, track


def headline(folder):
    metrics = {}
    for fn in ("metrics.json", "results.json"):
        p = os.path.join("models", folder, fn)
        if os.path.exists(p):
            try: metrics.update(json.load(open(p)))
            except Exception: pass
    if not metrics: return None
    fin = gmc.finals(metrics)
    for pr in PRIORITY:
        for k, v in fin.items():
            if k.split(" ")[0] == pr:
                val = f"{v:.3g}" if isinstance(v, float) else str(v)
                return f"{NICE.get(pr, pr)} {val}"
    for k, v in fin.items():
        return f"{k.split(' ')[0]} {v:.3g}" if isinstance(v, float) else f"{k.split(' ')[0]} {v}"
    return None


def group_of(track):
    tok = track.split("·")[0].split(" ")[0].strip().upper()
    return tok if tok in {g for g, _ in GROUPS} else "AG"


def main():
    rows = {g: [] for g, _ in GROUPS}
    folders = sorted(os.path.basename(f) for f in glob.glob("models/*") if os.path.isdir(f))
    n_tr = n_ph = 0
    for f in folders:
        placeholder = os.path.exists(os.path.join("models", f, "metrics.todo.json"))
        title, track = title_track(f)
        hf = f"https://huggingface.co/{HF_USER}/{slug(f)}"
        colab = nb_url(f)
        links = f"[🤗]({hf})" + (f" · [▶]({colab})" if colab else "")
        if placeholder:
            status, result = "🚧 placeholder", "_pending (GPU)_"; n_ph += 1
        else:
            status, result = "✅ trained", (headline(f) or "—"); n_tr += 1
        rows[group_of(track)].append((title, status, result, links))
    out = [f"_{n_tr} trained · {n_ph} documented placeholders · {n_tr + n_ph} repos total — one click trains a placeholder into a real model._\n"]
    for g, label in GROUPS:
        if not rows[g]: continue
        out.append(f"\n**{label}**\n")
        out.append("| Model | Status | Headline result | Links |\n|---|---|---|---|")
        for title, status, result, links in sorted(rows[g]):
            out.append(f"| {title} | {status} | {result} | {links} |")
        out.append("")
    table = "\n".join(out)

    readme = open("README.md").read()
    if START in readme and END in readme:
        readme = re.sub(re.escape(START) + r".*?" + re.escape(END), f"{START}\n{table}\n{END}", readme, flags=re.S)
    else:
        raise SystemExit("MODELS-INDEX markers not found in README.md")
    open("README.md", "w").write(readme)
    print(f"README models index updated: {n_tr} trained + {n_ph} placeholders")


if __name__ == "__main__":
    main()
