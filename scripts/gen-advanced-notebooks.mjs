// Builds the "Advanced labs" — heavy, real-repo GPU pipelines (training,
// fine-tuning, and inference) for all four tracks. Unlike the verified Training
// labs, these clone official research repos, download large checkpoints/datasets,
// and REQUIRE a GPU, so they are authored to each project's documented recipe and
// are NOT pre-executed here. Two per track.
//
//   node scripts/gen-advanced-notebooks.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "notebooks", "advanced");
const REPO = "ChaoYue0307/ropedia-academy";
fs.mkdirSync(OUT, { recursive: true });

const md = (s) => ({ kind: "md", src: s });
const code = (s) => ({ kind: "code", src: s });
const banner = (what, gpu, time, repo, url) =>
  `> 🔥 **Advanced / heavy lab.** ${what}\n>\n> **Runtime → Change runtime type → ${gpu} required.** Est. **${time}** including downloads. Built on the official **[${repo}](${url})** and authored to its documented recipe — **not pre-executed here** (needs a GPU + large downloads). If a step fails, see *Troubleshooting* at the bottom; pin versions as noted.`;

// ===========================================================================
// TRACK A — Human modeling & motion
// ===========================================================================
const mdm = {
  file: "A_mdm_text_to_motion.ipynb", title: "MDM — text-to-motion", track: "A", tag: "Generate",
  what: "Generate 3D human motion from a text prompt with the Motion Diffusion Model.",
  cells: [
    md(`# 🔥 Advanced · MDM — text-to-motion\n\n${banner("Type a sentence, get an animated 3D human motion.", "T4 GPU", "15–25 min", "GuyTevet/motion-diffusion-model", "https://github.com/GuyTevet/motion-diffusion-model")}\n\nMaps to lesson **A7 (motion diffusion)** — this is the real, pretrained version of the toy DDPM you trained from scratch.`),
    code(`!nvidia-smi -L`),
    md(`## 1 · Clone + install`),
    code(`%cd /content
!git clone https://github.com/GuyTevet/motion-diffusion-model.git
%cd motion-diffusion-model
!pip install -q git+https://github.com/openai/CLIP.git
!pip install -q "smplx[all]" chumpy blobfile spacy ftfy matplotlib
!python -m spacy download en_core_web_sm`),
    md(`## 2 · Download body files, GloVe, evaluators, and a pretrained HumanML3D model\nThese helper scripts pull the SMPL files and the \`humanml_trans_enc_512\` checkpoint.`),
    code(`!bash prepare/download_smpl_files.sh
!bash prepare/download_glove.sh
!bash prepare/download_t2m_evaluators.sh
!bash prepare/download_pretrained_models.sh`),
    md(`## 3 · Generate motion from YOUR prompt`),
    code(`!python -m sample.generate \\
  --model_path ./save/humanml_trans_enc_512/model000200000.pt \\
  --num_repetitions 2 \\
  --text_prompt "a person walks forward, stops, and waves with the right hand"`),
    md(`## 4 · Watch the result`),
    code(`import glob
from IPython.display import Video, display
vids = sorted(glob.glob("save/humanml_trans_enc_512/**/*.mp4", recursive=True))
print(vids[:5])
if vids: display(Video(vids[0], embed=True))`),
    md(`## Troubleshooting & next steps\n- **chumpy / numpy**: chumpy needs an older NumPy — if import fails, \`pip install "numpy<1.24" chumpy\`.\n- **download scripts fail**: they use \`gdown\`; rerun, or download the model manually and place it under \`save/\`.\n- **Train your own** instead of using the checkpoint: \`python -m train.train_mdm --save_dir save/my_run --dataset humanml\` (needs the HumanML3D dataset; multi-hour on a GPU).`),
  ],
};

const fourd = {
  file: "A_4dhumans_mesh.ipynb", title: "4D-Humans (HMR 2.0) — mesh from video", track: "A", tag: "Inference",
  what: "Recover an animated 3D SMPL body from your own image or video.",
  cells: [
    md(`# 🔥 Advanced · 4D-Humans (HMR 2.0)\n\n${banner("Reconstruct & track a 3D human mesh from your own photos/video.", "T4 GPU", "10–20 min", "shubham-goel/4D-Humans", "https://github.com/shubham-goel/4D-Humans")}\n\nMaps to lessons **A2–A4 (pose & human mesh recovery)** — the learned, single-shot counterpart to the SMPLify optimization lab.`),
    code(`!nvidia-smi -L`),
    md(`## 1 · Install (HMR 2.0 + Detectron2 for person detection)`),
    code(`%cd /content
!git clone https://github.com/shubham-goel/4D-Humans.git
%cd 4D-Humans
!pip install -q -e .[all]
!pip install -q git+https://github.com/facebookresearch/detectron2.git`),
    md(`## 2 · Run on images\nUpload your own photos into \`example_data/images/\` (the repo ships a few). Checkpoints auto-download on first run.`),
    code(`!python demo.py \\
  --img_folder example_data/images \\
  --out_folder demo_out \\
  --batch_size=48 --side_view --save_mesh`),
    md(`## 3 · Show the overlaid meshes`),
    code(`import glob, matplotlib.pyplot as plt, matplotlib.image as mpimg
imgs = sorted(glob.glob("demo_out/*.png"))[:4]
fig, ax = plt.subplots(1, len(imgs), figsize=(4*len(imgs), 4))
for a, p in zip(ax if len(imgs) > 1 else [ax], imgs):
    a.imshow(mpimg.imread(p)); a.axis("off")
plt.show()`),
    md(`## Video tracking & next steps\n- **Whole video** (per-person tracks over time): \`python track.py video.source=your_video.mp4\` (uses PHALP).\n- Exported \`.obj\` meshes are under \`demo_out/\`.\n- **Fine-tune / train**: see the repo's training docs (needs the human-mesh datasets; heavy).`),
  ],
};

// ===========================================================================
// TRACK B — 3D reconstruction & neural rendering
// ===========================================================================
const gs3d = {
  file: "B_gaussian_splatting_3d.ipynb", title: "3D Gaussian Splatting — your photos", track: "B", tag: "Train",
  what: "Turn a set of your own photos into a real 3D Gaussian-Splatting scene (CUDA rasterizer).",
  cells: [
    md(`# 🔥 Advanced · 3D Gaussian Splatting (official)\n\n${banner("Your photos → COLMAP poses → trained 3D Gaussians (real CUDA rasterizer).", "T4 GPU", "25–45 min (CUDA build + COLMAP)", "graphdeco-inria/gaussian-splatting", "https://github.com/graphdeco-inria/gaussian-splatting")}\n\nMaps to lesson **B7 (3D Gaussian Splatting)** — the real 3D version of the 2D-splatting lab you trained from scratch.`),
    code(`!nvidia-smi`),
    md(`## 1 · Clone (with submodules) and build the CUDA rasterizer`),
    code(`%cd /content
!git clone --recursive https://github.com/graphdeco-inria/gaussian-splatting
%cd gaussian-splatting
!pip install -q plyfile tqdm
!pip install -q submodules/diff-gaussian-rasterization
!pip install -q submodules/simple-knn`),
    md(`## 2 · Your photos → camera poses with COLMAP\nUpload 20–200 photos of **one** object/scene (good overlap, static scene) into \`data/scene/input/\`, then:`),
    code(`!apt-get -qq install -y colmap
!python convert.py -s data/scene`),
    md(`## 3 · Train the Gaussians`),
    code(`!python train.py -s data/scene -m output/scene --iterations 7000 --test_iterations 7000 30000`),
    md(`## 4 · Render novel views\nThe interactive SIBR viewer needs a desktop GPU, so render images here instead (or download \`output/scene/point_cloud/.../point_cloud.ply\` and drop it into a web viewer such as antimatter15/splat).`),
    code(`!python render.py -m output/scene
import glob, matplotlib.pyplot as plt, matplotlib.image as mpimg
imgs = sorted(glob.glob("output/scene/train/ours_7000/renders/*.png"))[:3]
fig, ax = plt.subplots(1, max(1, len(imgs)), figsize=(4*max(1,len(imgs)), 4))
for a, p in zip(ax if len(imgs) > 1 else [ax], imgs):
    a.imshow(mpimg.imread(p)); a.axis("off")
plt.show()`),
    md(`## Troubleshooting & next steps\n- **CUDA build errors**: make sure the GPU runtime is on *before* the \`pip install submodules/...\` step; the build targets the runtime's CUDA.\n- **Easier alternative**: \`pip install nerfstudio && ns-train splatfacto\` (the next lab) or the pip-installable **gsplat** rasterizer — no manual CUDA build.\n- View/share the \`.ply\` in the browser; train longer (30k iters) for sharper results.`),
  ],
};

const nerfstudio = {
  file: "B_nerfstudio_nerfacto.ipynb", title: "Nerfstudio nerfacto — your video", track: "B", tag: "Train",
  what: "Train a high-quality NeRF (or Gaussian splat) on your own phone video with Nerfstudio.",
  cells: [
    md(`# 🔥 Advanced · Nerfstudio (nerfacto)\n\n${banner("Your phone video → posed frames → a trained nerfacto NeRF.", "T4 GPU", "15–30 min", "nerfstudio", "https://docs.nerf.studio/")}\n\nMaps to lessons **B5–B7** — the production-grade counterpart to the from-scratch tiny-NeRF lab. Swap \`nerfacto\` for \`splatfacto\` to train Gaussians instead.`),
    code(`!nvidia-smi`),
    md(`## 1 · Install`),
    code(`!pip install -q nerfstudio
!pip install -q git+https://github.com/NVlabs/tiny-cuda-nn/#subdirectory=bindings/torch
!apt-get -qq install -y colmap ffmpeg`),
    md(`## 2 · Process your capture (extracts frames + estimates poses)\nUpload a short, slow phone video as \`my_capture.mp4\`.`),
    code(`!ns-process-data video --data my_capture.mp4 --output-dir data/mine --num-frames-target 150`),
    md(`## 3 · Train\n(\`--viewer.quit-on-train-completion True\` so the cell returns; drop it to open the web viewer via a tunnel.)`),
    code(`!ns-train nerfacto --data data/mine --max-num-iterations 15000 --viewer.quit-on-train-completion True`),
    md(`## 4 · Export a mesh / point cloud\nFind the run dir under \`outputs/\` and export:`),
    code(`import glob
cfg = sorted(glob.glob("outputs/**/config.yml", recursive=True))[-1]
print("config:", cfg)
!ns-export pointcloud --load-config "{cfg}" --output-dir exports/pcd --num-points 1000000 --remove-outliers True --normal-method open3d`),
    md(`## Next steps\n- **Gaussian Splatting**: replace \`nerfacto\` with \`splatfacto\` (and \`ns-export gaussian-splat\`).\n- Render a smooth camera path with \`ns-render\`.\n- The web viewer streams over a Colab tunnel — see the Nerfstudio Colab docs.`),
  ],
};

// ===========================================================================
// TRACK C — Egocentric vision & interaction
// ===========================================================================
const videomaeEpic = {
  file: "C_videomae_egocentric.ipynb", title: "VideoMAE — fine-tune on egocentric data", track: "C", tag: "Fine-tune",
  what: "Fine-tune VideoMAE for egocentric action recognition, with full evaluation.",
  cells: [
    md(`# 🔥 Advanced · VideoMAE on egocentric video\n\n${banner("Fine-tune the VideoMAE video transformer for first-person action recognition, with a confusion-matrix evaluation.", "T4 GPU", "30–60 min", "transformers / VideoMAE", "https://huggingface.co/docs/transformers/en/tasks/video_classification")}\n\nMaps to lessons **C3–C4, C9**. Uses a small UCF subset out of the box and shows exactly how to point it at **EPIC-Kitchens-100 / Ego4D**.`),
    code(`!nvidia-smi -L
!pip -q install "transformers>=4.41" evaluate pytorchvideo av scikit-learn`),
    md(`## 1 · Data\nA ready-made UCF101 subset for the demo. **For egocentric**: arrange EPIC-Kitchens / Ego4D clips as \`root/{train,val}/{action}/clip.mp4\` and point \`root\` at it — everything below is unchanged.`),
    code(`import os, tarfile
from huggingface_hub import hf_hub_download
arch = hf_hub_download(repo_id="sayakpaul/ucf101-subset", filename="UCF101_subset.tar.gz", repo_type="dataset")
if not os.path.exists("UCF101_subset"):
    with tarfile.open(arch) as t: t.extractall(".")
root = "UCF101_subset"   # <-- swap for your EPIC-Kitchens / Ego4D folder
labels = sorted({p.split("_")[1] for p in os.listdir(f"{root}/train")})
label2id = {l: i for i, l in enumerate(labels)}; id2label = {i: l for l, i in label2id.items()}
print(len(labels), "classes")`),
    md(`## 2 · Model + processor`),
    code(`from transformers import VideoMAEImageProcessor, VideoMAEForVideoClassification
ckpt = "MCG-NJU/videomae-base"
proc = VideoMAEImageProcessor.from_pretrained(ckpt)
model = VideoMAEForVideoClassification.from_pretrained(ckpt, label2id=label2id, id2label=id2label, ignore_mismatched_sizes=True)
nf = model.config.num_frames`),
    md(`## 3 · Pipelines (pytorchvideo) + Trainer`),
    code(`import pytorchvideo.data, torch, numpy as np, evaluate
from pytorchvideo.transforms import ApplyTransformToKey, Normalize, UniformTemporalSubsample
from pytorchvideo.data import make_clip_sampler
from torchvision.transforms import Compose, Lambda, Resize, RandomCrop, CenterCrop
from transformers import TrainingArguments, Trainer
size = proc.size.get("shortest_edge", proc.size.get("height", 224)); dur = nf / 25
def tf(train):
    crop = RandomCrop(size) if train else CenterCrop(size)
    return ApplyTransformToKey("video", Compose([UniformTemporalSubsample(nf), Lambda(lambda x: x/255.0), Normalize(proc.image_mean, proc.image_std), Resize(size), crop]))
def ds(split, train):
    return pytorchvideo.data.Ucf101(os.path.join(root, split), make_clip_sampler("random" if train else "uniform", dur), decode_audio=False, transform=tf(train))
acc = evaluate.load("accuracy")
def collate(b): return {"pixel_values": torch.stack([e["video"].permute(1,0,2,3) for e in b]), "labels": torch.tensor([label2id[e["label"]] for e in b])}
args = TrainingArguments("vmae-ego", per_device_train_batch_size=4, per_device_eval_batch_size=4, learning_rate=5e-5,
    max_steps=600, eval_strategy="steps", eval_steps=200, logging_steps=25, warmup_ratio=0.1,
    fp16=True, remove_unused_columns=False, report_to="none")
trainer = Trainer(model, args, train_dataset=ds("train", True), eval_dataset=ds("val", False), data_collator=collate,
    compute_metrics=lambda p: acc.compute(predictions=np.argmax(p.predictions,1), references=p.label_ids))
trainer.train()`),
    md(`## 4 · Evaluate — confusion matrix`),
    code(`import itertools, numpy as np, matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix
ys, ps = [], []
for b in [collate(list(itertools.islice(iter(ds("val", False)), 4))) for _ in range(8)]:
    with torch.no_grad():
        ps += model(b["pixel_values"].to(model.device)).logits.argmax(-1).cpu().tolist()
    ys += b["labels"].tolist()
cm = confusion_matrix(ys, ps, labels=list(range(len(labels))))
plt.imshow(cm); plt.title("confusion matrix"); plt.xlabel("pred"); plt.ylabel("true"); plt.colorbar(); plt.show()`),
    md(`## Next steps\n- **EPIC-Kitchens-100 / Ego4D**: register, download, arrange as folders above; raise \`max_steps\` and classes.\n- \`trainer.push_to_hub()\` to save the model. Compare with the frozen-feature baseline (lesson C9).`),
  ],
};

const sam2 = {
  file: "C_sam2_video_segmentation.ipynb", title: "SAM 2 — promptable video segmentation", track: "C", tag: "Inference",
  what: "Segment and track hands/objects through an egocentric clip with one click using SAM 2.",
  cells: [
    md(`# 🔥 Advanced · SAM 2 — segment & track in video\n\n${banner("Click an object on the first frame; SAM 2 tracks its mask through the whole clip.", "T4 GPU", "10–20 min", "facebookresearch/sam2", "https://github.com/facebookresearch/sam2")}\n\nMaps to lessons **C5–C6 (hands & hand-object interaction)** — a foundation segmenter for first-person video.`),
    code(`!nvidia-smi -L`),
    md(`## 1 · Install + checkpoint`),
    code(`%cd /content
!git clone https://github.com/facebookresearch/sam2.git
%cd sam2
!pip install -q -e .
!mkdir -p checkpoints
!wget -q -O checkpoints/sam2.1_hiera_large.pt https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_large.pt`),
    md(`## 2 · Extract frames from your egocentric clip\nUpload \`clip.mp4\`; SAM 2's video predictor reads a folder of JPEG frames.`),
    code(`import os
os.makedirs("frames", exist_ok=True)
!ffmpeg -hide_banner -loglevel error -i clip.mp4 -q:v 2 -start_number 0 frames/%05d.jpg
print("frames:", len(os.listdir("frames")))`),
    md(`## 3 · Click once, then propagate through the video`),
    code(`import torch, numpy as np
from sam2.build_sam import build_sam2_video_predictor
predictor = build_sam2_video_predictor("configs/sam2.1/sam2.1_hiera_l.yaml", "checkpoints/sam2.1_hiera_large.pt", device="cuda")
state = predictor.init_state(video_path="frames")
# a positive click near the object/hand on frame 0 (edit x,y to your clip):
predictor.add_new_points_or_box(state, frame_idx=0, obj_id=1,
    points=np.array([[320, 240]], dtype=np.float32), labels=np.array([1], np.int32))
video_masks = {}
for frame_idx, obj_ids, mask_logits in predictor.propagate_in_video(state):
    video_masks[frame_idx] = (mask_logits[0] > 0).cpu().numpy()
print("segmented frames:", len(video_masks))`),
    md(`## 4 · Overlay the tracked mask`),
    code(`import matplotlib.pyplot as plt, matplotlib.image as mpimg
show = sorted(video_masks)[:: max(1, len(video_masks)//4)][:4]
fig, ax = plt.subplots(1, len(show), figsize=(4*len(show), 4))
for a, fi in zip(ax, show):
    a.imshow(mpimg.imread(f"frames/{fi:05d}.jpg")); a.imshow(video_masks[fi].squeeze(), alpha=0.5); a.axis("off"); a.set_title(f"frame {fi}")
plt.show()`),
    md(`## Next steps\n- Single images: use \`SAM2ImagePredictor\`.\n- Add multiple \`obj_id\`s (both hands + the object) and box prompts.\n- Feed masks downstream for hand-object interaction analysis (lesson C6).`),
  ],
};

// ===========================================================================
// TRACK D — Scene reconstruction & world models
// ===========================================================================
const splatam = {
  file: "D_splatam_slam.ipynb", title: "SplaTAM — Gaussian-Splatting SLAM", track: "D", tag: "Reconstruct",
  what: "Run dense neural SLAM: recover the camera trajectory and a Gaussian map from RGB-D.",
  cells: [
    md(`# 🔥 Advanced · SplaTAM (Gaussian-Splatting SLAM)\n\n${banner("RGB-D video → camera trajectory + a dense 3D Gaussian map, jointly (SLAM).", "T4 GPU", "30–60 min", "spla-tam/SplaTAM", "https://github.com/spla-tam/SplaTAM")}\n\nMaps to lessons **D1–D3 (SLAM, pose, fusion)** — tracking and mapping in one differentiable loop.`),
    code(`!nvidia-smi`),
    md(`## 1 · Clone + install (includes the Gaussian rasterizer)`),
    code(`%cd /content
!git clone https://github.com/spla-tam/SplaTAM.git
%cd SplaTAM
!pip install -q -r requirements.txt`),
    md(`## 2 · Download the Replica demo scene`),
    code(`!bash bash_scripts/download_replica.sh`),
    md(`## 3 · Run SplaTAM (tracking + mapping)`),
    code(`!python scripts/splatam.py configs/replica/splatam.py`),
    md(`## 4 · Results\nCamera-trajectory error (ATE) is printed; rendered maps and the trajectory are saved under \`experiments/\`. Evaluate/visualize:`),
    code(`!python scripts/eval_novel_view.py configs/replica/splatam.py || echo "see experiments/ for outputs"`),
    md(`## Troubleshooting & next steps\n- **Your own capture**: provide RGB-D (e.g. an iPhone LiDAR scan or RealSense) and add a config under \`configs/\`.\n- **No depth?** Try a monocular neural-SLAM repo (e.g. NICE-SLAM / GO-SLAM) instead.\n- Memory: lower the map resolution / number of Gaussians in the config.`),
  ],
};

const dreamer = {
  file: "D_dreamerv3_world_model.ipynb", title: "DreamerV3 — world-model RL", track: "D", tag: "Train",
  what: "Train a world model + agent that learns from imagined rollouts (DreamerV3).",
  cells: [
    md(`# 🔥 Advanced · DreamerV3 (world-model RL)\n\n${banner("Learn a latent world model from pixels and train an agent inside it ('learning in imagination').", "T4 GPU", "1–3 h for visible progress", "danijar/dreamerv3", "https://github.com/danijar/dreamerv3")}\n\nMaps to lesson **D8 (world models)** — the real, scalable version of the toy world-model + planning lab.`),
    code(`!nvidia-smi`),
    md(`## 1 · Install\nDreamerV3 is JAX-based. Install the package (or clone the repo for the latest configs).`),
    code(`%cd /content
!git clone https://github.com/danijar/dreamerv3.git
%cd dreamerv3
!pip install -q -r requirements.txt
!pip install -q "jax[cuda12]" -f https://storage.googleapis.com/jax-releases/jax_cuda_releases.html`),
    md(`## 2 · Train on a task (Crafter — a fast, open-ended benchmark)`),
    code(`!python dreamerv3/main.py \\
  --logdir ./logdir/crafter_run \\
  --configs crafter \\
  --run.steps 1e5`),
    md(`## 3 · Inspect what the world model "imagines"\nDreamer logs open-loop video predictions (true vs. imagined frames) and metrics to \`logdir\`. View them with TensorBoard:`),
    code(`%load_ext tensorboard
%tensorboard --logdir ./logdir`),
    md(`## Troubleshooting & next steps\n- **JAX/GPU**: match the \`jax[cuda12]\` wheel to the runtime's CUDA; if it errors, use the version pinned in the repo's README.\n- **Other tasks**: \`--configs dmc_vision\` (DeepMind Control from pixels), \`atari\`, etc.\n- Flags shift between releases — check \`python dreamerv3/main.py --help\`.\n- Lighter, fully-runnable alternative: the self-contained **world model + planning** lab in \`notebooks/training/\`.`),
  ],
};

// ===========================================================================
const labs = [mdm, fourd, gs3d, nerfstudio, videomaeEpic, sam2, splatam, dreamer];

function splitLines(s) {
  const lines = s.split("\n");
  return lines.map((l, i) => (i < lines.length - 1 ? l + "\n" : l));
}
function toNotebook(lab) {
  const cells = lab.cells.map((c) =>
    c.kind === "md"
      ? { cell_type: "markdown", metadata: {}, source: splitLines(c.src) }
      : { cell_type: "code", metadata: {}, execution_count: null, outputs: [], source: splitLines(c.src) }
  );
  return {
    nbformat: 4, nbformat_minor: 4,
    metadata: {
      kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
      language_info: { name: "python" },
      colab: { provenance: [], toc_visible: true },
      accelerator: "GPU",
    },
    cells,
  };
}
for (const lab of labs) {
  fs.writeFileSync(path.join(OUT, lab.file), JSON.stringify(toNotebook(lab), null, 1));
  console.log("wrote", lab.file, `(${lab.cells.length} cells)`);
}

const badge = (f) =>
  `[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/${REPO}/blob/main/notebooks/advanced/${f})`;
const trackName = { A: "A · Human", B: "B · 3D / rendering", C: "C · Egocentric", D: "D · Scene / world" };
const readme = `# Advanced labs · heavy GPU pipelines

Real research-repo pipelines — **training, fine-tuning, and inference on actual foundation models** — two per track. Unlike the [Training labs](../training/), these clone official repos, download large checkpoints/datasets, and **require a GPU**.

> ⚠️ **Read me.** These are authored to each project's **official recipe** and are **not pre-executed here** (they need a GPU + multi-GB downloads, and some need gated data). Treat them as ready-to-run scaffolds: open in Colab, set **Runtime → GPU**, and expect to pin a version or two. Each notebook has a *Troubleshooting* section. For pipelines verified end-to-end, use the [Training labs](../training/).

| Lab | Track | Kind | Open |
|---|---|---|---|
${labs.map((l) => `| ${l.title} | ${trackName[l.track]} | ${l.tag} | ${badge(l.file)} |`).join("\n")}

Each maps to a lesson and to its lighter, verified counterpart in \`notebooks/training/\`.
`;
fs.writeFileSync(path.join(OUT, "README.md"), readme);
console.log("wrote README.md");
