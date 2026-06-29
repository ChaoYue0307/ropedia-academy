// Emits notebooks/colab_train_and_publish.ipynb — a one-notebook Colab flow that
// trains the GPU-worthy labs (NeRF, etc.), then publishes EVERY models/ bundle
// (the committed CPU-trained ones + whatever you train here) to your HF account
// and a single Collection. node scripts/gen-colab-master.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const md = (s) => ({ cell_type: "markdown", metadata: {}, source: lines(s) });
const code = (s) => ({ cell_type: "code", metadata: {}, execution_count: null, outputs: [], source: lines(s) });
const lines = (s) => s.split("\n").map((l, i, a) => (i < a.length - 1 ? l + "\n" : l));

const cells = [
  md(`# Train the GPU labs on Colab → publish everything to Hugging Face\n\nRun this on a **GPU runtime** (Runtime → Change runtime type → **T4 GPU**). It:\n1. clones Ropedia Academy (which already ships the CPU-trained bundles in \`models/\`),\n2. trains the labs that benefit from a GPU here (NeRF; add more below),\n3. publishes **all** bundles to your account and one **Collection** — one write token covers every repo.\n\n> Get a write token at https://huggingface.co/settings/tokens (role: Write).`),
  code(`!git clone -q https://github.com/ChaoYue0307/ropedia-academy.git\n%cd ropedia-academy\n!pip -q install huggingface_hub\nimport torch\nprint("GPU available:", torch.cuda.is_available())\nfrom huggingface_hub import notebook_login\nnotebook_login()   # paste your WRITE token (one token covers all repos)`),
  md(`## 1 · Train the GPU-worthy labs\nEach call runs that lab's own (verified) code on the GPU and writes \`outputs/<lab>/\`. NeRF is included; uncomment others as you like.`),
  code(`import os, json, shutil\n\ndef run_lab(nb, steps):\n    os.environ["STEPS"] = str(steps)\n    cells = [c for c in json.load(open(nb))["cells"] if c["cell_type"] == "code"]\n    src = "\\n".join("".join(c["source"]) for c in cells if "notebook_login" not in "".join(c["source"]))\n    src = "\\n".join(l for l in src.split("\\n") if not l.strip().startswith(("!", "%")))\n    exec(src, {"__name__": "__main__"})\n    print("trained:", nb)\n\n# sharper GPU runs — these overwrite the lighter CPU-trained bundles in models/\nrun_lab("notebooks/training/B_nerf_from_scratch.ipynb", 5000)\nrun_lab("notebooks/training/B_hashgrid_instngp.ipynb", 5000)\nrun_lab("notebooks/training/A_motion_diffusion.ipynb", 8000)\nrun_lab("notebooks/training/B_mae_pretrain.ipynb", 4000)\nrun_lab("notebooks/training/C_simclr_pretrain.ipynb", 3000)\n# add any others you want sharper, e.g.:\n# run_lab("notebooks/training/B_deepsdf_shape.ipynb", 4000)\n\nos.makedirs("models", exist_ok=True)\nfor d in os.listdir("outputs"):\n    p = os.path.join("outputs", d)\n    if os.path.isdir(p):\n        shutil.copytree(p, os.path.join("models", d), dirs_exist_ok=True)\nprint("bundles ready:", sorted(os.listdir("models")))`),
  md(`## 2 · Publish everything to your account + one Collection\nUploads every \`models/<lab>/\` to \`<you>/<lab>\` (public by default) and gathers them into the *Ropedia Academy — trained models* collection.`),
  code(`!python scripts/gen_model_cards.py     # rich, visual README per model\n!python scripts/upload_all_to_hf.py     # publish all + build the collection\n# options:  --private   --org <name>   --no-collection`),
  md(`## Foundation fine-tunes (QLoRA · VideoMAE · DINOv2 · Whisper · SD-LoRA · …)\nThose need their own installs / datasets, so run them from the **Labs** tab one at a time: open the lab → **Run all** → its *Publish to the Hugging Face Hub* cell. They'll land in the same account and you can add them to the collection too.`),
];

const nb = {
  nbformat: 4,
  nbformat_minor: 4,
  metadata: {
    kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
    language_info: { name: "python" },
    colab: { provenance: [], toc_visible: true },
    accelerator: "GPU",
  },
  cells,
};
const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "notebooks", "colab_train_and_publish.ipynb");
fs.writeFileSync(out, JSON.stringify(nb, null, 1));
console.log("wrote", out, `(${cells.length} cells)`);
