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

// A "Compute · storage · time" table + the full-scale pipeline command, spliced
// near the top of each advanced lab so requirements are visible before running.
function computeCell(c) {
  return md(`## Compute · storage · time\n\n| Resource | Demo (this notebook, free Colab T4) | Full / production run |\n|---|---|---|\n| **GPU** | ${c.demoGpu} | ${c.fullGpu} |\n| **Storage** | ${c.storageDemo} | ${c.storageFull} |\n| **Time** | ${c.timeDemo} | ${c.timeFull} |\n\n**Full pipeline (scale-up):** ${c.full}\n\n> Rough estimates — real numbers depend on hardware, data size and library versions.`);
}

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
// LANGUAGE & MULTIMODAL MODELS — LLM / VLM / Video-LM
// ===========================================================================
const qlora = {
  file: "LM_qlora_finetune_llm.ipynb", title: "QLoRA — fine-tune an LLM", track: "LM", tag: "Fine-tune",
  what: "Instruction-tune a small LLM on your own data with 4-bit QLoRA (LoRA + bitsandbytes).",
  cells: [
    md(`# 🔥 Advanced · QLoRA — fine-tune an LLM\n\n${banner("Fine-tune a pretrained instruct LLM on your data, cheaply, with 4-bit QLoRA.", "T4 GPU", "20–40 min", "TRL + PEFT + bitsandbytes", "https://github.com/huggingface/trl")}\n\nThe practical counterpart to the from-scratch **nanoGPT** lab: instead of pretraining, you adapt a pretrained model by training tiny LoRA adapters on top of a 4-bit-quantized base — fits on a free T4.`),
    code(`!nvidia-smi -L
!pip install -q -U transformers datasets accelerate peft trl bitsandbytes`),
    md(`## 1 · Load a small instruct model in 4-bit`),
    code(`import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
base = "Qwen/Qwen2.5-0.5B-Instruct"   # swap for Llama-3.2-1B-Instruct, etc.
bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                         bnb_4bit_compute_dtype=torch.bfloat16, bnb_4bit_use_double_quant=True)
tok = AutoTokenizer.from_pretrained(base)
model = AutoModelForCausalLM.from_pretrained(base, quantization_config=bnb, device_map="auto")`),
    md(`## 2 · Data — a small instruction dataset\nReplace with your own \`{"text": "...chat-formatted..."}\` records to teach your task.`),
    code(`from datasets import load_dataset
ds = load_dataset("mlabonne/guanaco-llama2-1k", split="train")   # ~1k chat samples, 'text' field
print(ds, "\\n---\\n", ds[0]["text"][:300])`),
    md(`## 3 · Attach LoRA adapters and train (TRL SFTTrainer)`),
    code(`from trl import SFTConfig, SFTTrainer
from peft import LoraConfig
peft_cfg = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05, bias="none",
                      task_type="CAUSAL_LM", target_modules="all-linear")
args = SFTConfig(output_dir="qlora-out", per_device_train_batch_size=2, gradient_accumulation_steps=4,
                 max_steps=200, learning_rate=2e-4, logging_steps=20, bf16=True,
                 max_seq_length=512, dataset_text_field="text", report_to="none")
trainer = SFTTrainer(model=model, args=args, train_dataset=ds, peft_config=peft_cfg, processing_class=tok)
trainer.train()`),
    md(`## 4 · Try it, then save the adapter`),
    code(`def chat(msg, n=200):
    ids = tok.apply_chat_template([{"role": "user", "content": msg}], add_generation_prompt=True, return_tensors="pt").to(model.device)
    out = model.generate(ids, max_new_tokens=n, do_sample=True, temperature=0.7)
    print(tok.decode(out[0][ids.shape[1]:], skip_special_tokens=True))
chat("Explain LoRA fine-tuning in one paragraph.")
trainer.save_model("qlora-adapter")   # tiny — just the adapters`),
    md(`## Troubleshooting & next steps\n- **TRL API drift**: newer TRL uses \`SFTConfig\`/\`processing_class\`; older uses \`tokenizer=\` and \`dataset_text_field\` on the trainer. Match your installed version (\`pip show trl\`).\n- Merge adapters for deployment: \`model.merge_and_unload()\`.\n- Then **align** the model with preferences → the DPO lab. For a much faster path, try **Unsloth**.`),
  ],
};

const dpo = {
  file: "LM_dpo_alignment.ipynb", title: "DPO — align an LLM with preferences", track: "LM", tag: "Align",
  what: "Align an LLM to preferred answers with Direct Preference Optimization.",
  cells: [
    md(`# 🔥 Advanced · DPO — preference alignment\n\n${banner("Teach an LLM which answers people prefer, using chosen/rejected pairs (DPO — the RLHF-free recipe).", "T4 GPU", "20–40 min", "TRL DPOTrainer", "https://huggingface.co/docs/trl/dpo_trainer")}\n\nRun this *after* SFT (the QLoRA lab) — alignment is the second stage of the modern LLM pipeline.`),
    code(`!nvidia-smi -L
!pip install -q -U transformers datasets accelerate peft trl bitsandbytes`),
    md(`## 1 · Load the (SFT) model in 4-bit`),
    code(`import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
base = "Qwen/Qwen2.5-0.5B-Instruct"
bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype=torch.bfloat16)
tok = AutoTokenizer.from_pretrained(base)
model = AutoModelForCausalLM.from_pretrained(base, quantization_config=bnb, device_map="auto")`),
    md(`## 2 · Preference data — prompt + chosen + rejected`),
    code(`from datasets import load_dataset
ds = load_dataset("trl-lib/ultrafeedback_binarized", split="train[:2000]")
print(ds.column_names)`),
    md(`## 3 · Train with DPO (LoRA adapters, no separate reward model)`),
    code(`from trl import DPOConfig, DPOTrainer
from peft import LoraConfig
args = DPOConfig(output_dir="dpo-out", per_device_train_batch_size=2, gradient_accumulation_steps=4,
                 max_steps=200, learning_rate=5e-6, logging_steps=20, bf16=True, beta=0.1, report_to="none")
trainer = DPOTrainer(model=model, args=args, train_dataset=ds, processing_class=tok,
                     peft_config=LoraConfig(r=16, lora_alpha=32, task_type="CAUSAL_LM", target_modules="all-linear"))
trainer.train()`),
    md(`## 4 · Inspect\nWatch \`rewards/chosen\` rise above \`rewards/rejected\` and the \`rewards/accuracies\` climb in the logs — that's the model learning the preference. Save:`),
    code(`trainer.save_model("dpo-adapter")`),
    md(`## Notes & next steps\n- DPO needs an SFT'd base; using a raw base model gives weak results.\n- Variants: **IPO**, **KTO**, **ORPO** (one-stage) — all in TRL.\n- Lower \`beta\` = trust the data more; raise it = stay closer to the reference model.`),
  ],
};

const vlm = {
  file: "LM_vlm_finetune.ipynb", title: "Fine-tune a VLM (vision-language)", track: "LM", tag: "Fine-tune",
  what: "LoRA-fine-tune a vision-language model on image question-answering.",
  cells: [
    md(`# 🔥 Advanced · Fine-tune a VLM\n\n${banner("Adapt a vision-language model (SmolVLM) to answer questions about images.", "T4 GPU", "30–60 min", "TRL + SmolVLM", "https://huggingface.co/docs/trl/en/sft_trainer#vision-language-models")}\n\nA VLM = a vision encoder feeding image tokens into an LLM (track-C/D themes: grounding language in pixels). Here we LoRA-fine-tune one on a VQA dataset.`),
    code(`!nvidia-smi -L
!pip install -q -U transformers datasets accelerate peft trl bitsandbytes`),
    md(`## 1 · Load SmolVLM + processor (4-bit)`),
    code(`import torch
from transformers import AutoProcessor, AutoModelForVision2Seq, BitsAndBytesConfig
ckpt = "HuggingFaceTB/SmolVLM-Instruct"
bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype=torch.bfloat16)
processor = AutoProcessor.from_pretrained(ckpt)
model = AutoModelForVision2Seq.from_pretrained(ckpt, quantization_config=bnb, device_map="auto")`),
    md(`## 2 · A small image-QA dataset`),
    code(`from datasets import load_dataset
ds = load_dataset("HuggingFaceM4/ChartQA", split="train[:500]")
print(ds, "\\n", ds[0].keys())`),
    md(`## 3 · Collator — build chat messages with the image, then train`),
    code(`from trl import SFTConfig, SFTTrainer
from peft import LoraConfig
def collate(examples):
    texts, images = [], []
    for ex in examples:
        msg = [{"role": "user", "content": [{"type": "image"}, {"type": "text", "text": ex["query"]}]},
               {"role": "assistant", "content": [{"type": "text", "text": ex["label"][0]}]}]
        texts.append(processor.apply_chat_template(msg, tokenize=False))
        images.append([ex["image"]])
    batch = processor(text=texts, images=images, return_tensors="pt", padding=True)
    labels = batch["input_ids"].clone(); labels[labels == processor.tokenizer.pad_token_id] = -100
    batch["labels"] = labels
    return batch
args = SFTConfig(output_dir="vlm-out", per_device_train_batch_size=2, gradient_accumulation_steps=4,
                 max_steps=200, learning_rate=2e-4, logging_steps=20, bf16=True,
                 remove_unused_columns=False, dataset_kwargs={"skip_prepare_dataset": True}, report_to="none")
trainer = SFTTrainer(model=model, args=args, train_dataset=ds, data_collator=collate,
                     peft_config=LoraConfig(r=8, lora_alpha=16, task_type="CAUSAL_LM", target_modules="all-linear"))
trainer.train()`),
    md(`## 4 · Ask the fine-tuned model about a chart`),
    code(`msg = [{"role": "user", "content": [{"type": "image"}, {"type": "text", "text": "What is the highest value in this chart?"}]}]
prompt = processor.apply_chat_template(msg, add_generation_prompt=True)
inp = processor(text=prompt, images=[ds[0]["image"]], return_tensors="pt").to(model.device)
out = model.generate(**inp, max_new_tokens=64)
print(processor.decode(out[0], skip_special_tokens=True))`),
    md(`## Troubleshooting & next steps\n- VLM collators are model-specific — SmolVLM/Idefics3, PaliGemma, Qwen2-VL each differ; follow the matching TRL example.\n- Image-token handling changes across \`transformers\` versions; pin if generation misaligns.\n- Bigger options: **Qwen2-VL-2B**, **PaliGemma-3B**, **LLaVA-1.6**.`),
  ],
};

const videolm = {
  file: "LM_videolm_qwen2vl.ipynb", title: "Video-LM — Qwen2-VL on video", track: "LM", tag: "Inference + LoRA",
  what: "Ask a video-language model questions about a clip; plus how to LoRA-fine-tune it.",
  cells: [
    md(`# 🔥 Advanced · Video-LM (Qwen2-VL)\n\n${banner("Reason over a video with a video-language model (frames → tokens → LLM).", "T4 GPU", "15–30 min (2B model)", "Qwen2-VL", "https://github.com/QwenLM/Qwen2-VL")}\n\nDirectly relevant to **egocentric video understanding** (track C): natural-language Q&A over first-person clips.`),
    code(`!nvidia-smi -L
!pip install -q -U "transformers>=4.45" accelerate "qwen-vl-utils[decord]"`),
    md(`## 1 · Load Qwen2-VL-2B-Instruct`),
    code(`import torch
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
ckpt = "Qwen/Qwen2-VL-2B-Instruct"
model = Qwen2VLForConditionalGeneration.from_pretrained(ckpt, torch_dtype=torch.bfloat16, device_map="auto")
processor = AutoProcessor.from_pretrained(ckpt)`),
    md(`## 2 · Ask a question about your video\nUpload \`clip.mp4\` (e.g. an egocentric cooking clip).`),
    code(`from qwen_vl_utils import process_vision_info
messages = [{"role": "user", "content": [
    {"type": "video", "video": "clip.mp4", "max_pixels": 360*420, "fps": 1.0},
    {"type": "text", "text": "What is the person doing, step by step?"}]}]
text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
image_inputs, video_inputs = process_vision_info(messages)
inp = processor(text=[text], images=image_inputs, videos=video_inputs, padding=True, return_tensors="pt").to(model.device)
out = model.generate(**inp, max_new_tokens=256)
trimmed = [o[len(i):] for i, o in zip(inp.input_ids, out)]
print(processor.batch_decode(trimmed, skip_special_tokens=True)[0])`),
    md(`## 3 · Fine-tune on video instructions (LoRA) — sketch\nWrap the model with PEFT LoRA and train on a video-instruction dataset (e.g. \`lmms-lab/VideoChatGPT\`), using a collator that runs \`process_vision_info\` per sample — same SFT loop as the VLM lab, with video inputs.`),
    code(`from peft import LoraConfig, get_peft_model
model = get_peft_model(model, LoraConfig(r=8, lora_alpha=16, target_modules="all-linear", task_type="CAUSAL_LM"))
model.print_trainable_parameters()
# then: build a Dataset of {video, question, answer}, a collator calling process_vision_info,
# and a transformers/TRL Trainer exactly like the VLM lab. (Heavy — needs the video dataset.)`),
    md(`## Notes & next steps\n- **Frames/fps & max_pixels** trade quality vs. memory — lower them if you OOM on a T4.\n- Other video-LMs: **Video-LLaVA**, **VideoLLaMA-2**, **LLaVA-NeXT-Video**.\n- Pair with the **VideoMAE** and **SAM 2** labs for a full egocentric-video stack.`),
  ],
};

const rag = {
  file: "LM_rag_pipeline.ipynb", title: "RAG — retrieval-augmented generation", track: "LM", tag: "Retrieve + Generate",
  what: "Index a corpus with embeddings + FAISS, retrieve, and ground an LLM's answer in it.",
  cells: [
    md(`# 🔥 Advanced · RAG — retrieval-augmented generation\n\n${banner("Ground an LLM's answers in your own documents: embed → index → retrieve → generate.", "T4 GPU", "10–15 min", "sentence-transformers + FAISS", "https://github.com/facebookresearch/faiss")}\n\nRAG gives an LLM fresh, private, or citable knowledge without retraining it.`),
    code(`!nvidia-smi -L
!pip install -q -U sentence-transformers faiss-cpu transformers accelerate`),
    md(`## 1 · A small corpus (swap in your own documents)`),
    code(`docs = [
    "NeRF represents a scene as an MLP mapping (x,y,z,view) to colour and density, rendered by volume integration.",
    "3D Gaussian Splatting represents a scene as many anisotropic Gaussians, rasterized differentiably for real-time rendering.",
    "SMPL is a parametric human body model controlled by shape (beta) and pose (theta) parameters.",
    "SLAM jointly estimates the camera trajectory and a map of the environment from sensor data.",
    "A world model learns environment dynamics so an agent can plan by imagining future states.",
    "VideoMAE is a self-supervised video transformer pretrained by masking and reconstructing spatiotemporal patches.",
]`),
    md(`## 2 · Embed the corpus and build a FAISS index`),
    code(`import faiss
from sentence_transformers import SentenceTransformer
embedder = SentenceTransformer("BAAI/bge-small-en-v1.5")
emb = embedder.encode(docs, normalize_embeddings=True)
index = faiss.IndexFlatIP(emb.shape[1]); index.add(emb)
print("indexed", index.ntotal, "documents")`),
    md(`## 3 · Retrieve the most relevant passages`),
    code(`def retrieve(q, k=3):
    qe = embedder.encode([q], normalize_embeddings=True)
    scores, idx = index.search(qe, k)
    return [docs[i] for i in idx[0]]
print(retrieve("How are 3D scenes rendered in real time?"))`),
    md(`## 4 · Generate an answer grounded in the retrieved context`),
    code(`from transformers import pipeline
llm = pipeline("text-generation", model="Qwen/Qwen2.5-0.5B-Instruct", torch_dtype="auto", device_map="auto")
def answer(q):
    ctx = "\\n".join(f"[{i+1}] {c}" for i, c in enumerate(retrieve(q)))
    msgs = [{"role": "system", "content": "Answer using ONLY the context, and cite the [n] you used."},
            {"role": "user", "content": f"Context:\\n{ctx}\\n\\nQuestion: {q}"}]
    print(llm(msgs, max_new_tokens=200)[0]["generated_text"][-1]["content"])
answer("How does Gaussian Splatting render scenes, and how is it different from NeRF?")`),
    md(`## Next steps\n- **Chunk** long docs, add a **reranker** (e.g. bge-reranker), and store vectors in **Chroma / Qdrant / pgvector**.\n- Return **citations** with the answer; evaluate retrieval (recall@k) and answer faithfulness.\n- Combine with a fine-tuned LLM (QLoRA lab) for a domain assistant.`),
  ],
};

const lmeval = {
  file: "LM_eval_harness.ipynb", title: "Evaluate an LLM (lm-eval-harness)", track: "LM", tag: "Evaluate",
  what: "Benchmark an LLM on standard tasks (ARC, HellaSwag, ...) with EleutherAI's harness.",
  cells: [
    md(`# 🔥 Advanced · LLM evaluation — lm-eval-harness\n\n${banner("Score an LLM on standard benchmarks with the de-facto evaluation harness.", "T4 GPU", "10–30 min (task-dependent)", "EleutherAI/lm-evaluation-harness", "https://github.com/EleutherAI/lm-evaluation-harness")}\n\nUse it to quantify a base model vs. your QLoRA / DPO fine-tune.`),
    code(`!nvidia-smi -L
!pip install -q lm-eval`),
    md(`## 1 · Run a few tasks (limited for speed)`),
    code(`!lm_eval --model hf \\
  --model_args pretrained=Qwen/Qwen2.5-0.5B-Instruct,dtype=bfloat16 \\
  --tasks arc_easy,hellaswag \\
  --device cuda:0 --batch_size auto --limit 100 \\
  --output_path results`),
    md(`## 2 · Read the scores`),
    code(`import json, glob
f = sorted(glob.glob("results/**/*.json", recursive=True))[-1]
res = json.load(open(f))["results"]
for task, m in res.items():
    print(task, {k: round(v, 4) for k, v in m.items() if isinstance(v, float)})`),
    md(`## Next steps\n- Drop \`--limit\` and add tasks: \`mmlu\`, \`gsm8k\`, \`truthfulqa\`, \`winogrande\`.\n- Few-shot: \`--num_fewshot 5\`. Evaluate a fine-tune by pointing \`pretrained=\` at your merged model.\n- Compare base vs. fine-tuned to measure your SFT/DPO gains.`),
  ],
};

const unsloth = {
  file: "LM_unsloth_finetune.ipynb", title: "Unsloth — fast LLM fine-tune", track: "LM", tag: "Fine-tune (fast)",
  what: "Fine-tune an LLM ~2x faster with less memory via Unsloth, then export GGUF.",
  cells: [
    md(`# 🔥 Advanced · Unsloth — fast fine-tuning\n\n${banner("The same QLoRA SFT, ~2x faster and lighter via Unsloth's fused kernels — then export GGUF for llama.cpp / Ollama.", "T4 GPU", "15–30 min", "unslothai/unsloth", "https://github.com/unslothai/unsloth")}\n\nA faster path than the plain QLoRA lab when the free T4 is tight.`),
    code(`!nvidia-smi -L
!pip install -q unsloth`),
    md(`## 1 · Load a 4-bit model and attach LoRA (Unsloth)`),
    code(`from unsloth import FastLanguageModel
model, tok = FastLanguageModel.from_pretrained("unsloth/Qwen2.5-0.5B-Instruct", max_seq_length=2048, load_in_4bit=True)
model = FastLanguageModel.get_peft_model(model, r=16, lora_alpha=16, lora_dropout=0,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"])`),
    md(`## 2 · Data`),
    code(`from datasets import load_dataset
ds = load_dataset("mlabonne/guanaco-llama2-1k", split="train")`),
    md(`## 3 · Train (TRL SFTTrainer on the Unsloth model)`),
    code(`from trl import SFTConfig, SFTTrainer
trainer = SFTTrainer(model=model, train_dataset=ds, processing_class=tok,
    args=SFTConfig(per_device_train_batch_size=2, gradient_accumulation_steps=4, max_steps=60,
        learning_rate=2e-4, logging_steps=10, bf16=True, max_seq_length=2048,
        dataset_text_field="text", output_dir="unsloth-out", report_to="none"))
trainer.train()`),
    md(`## 4 · Generate, then save (LoRA · merged · GGUF)`),
    code(`FastLanguageModel.for_inference(model)
ids = tok.apply_chat_template([{"role": "user", "content": "Explain QLoRA simply."}], add_generation_prompt=True, return_tensors="pt").to(model.device)
print(tok.decode(model.generate(ids, max_new_tokens=160)[0][ids.shape[1]:], skip_special_tokens=True))
model.save_pretrained("unsloth-lora"); tok.save_pretrained("unsloth-lora")
# merged 16-bit:  model.save_pretrained_merged("unsloth-merged", tok, save_method="merged_16bit")
# GGUF for llama.cpp / Ollama:  model.save_pretrained_gguf("unsloth-gguf", tok, quantization_method="q4_k_m")`),
    md(`## Notes & next steps\n- Unsloth ships official Colab notebooks per model — match its pinned versions if install hiccups.\n- Export **GGUF**, then run locally with **llama.cpp** or **Ollama**.\n- Score the result with the lm-eval-harness lab.`),
  ],
};

const rlhf = {
  file: "LM_rlhf_ppo.ipynb", title: "RLHF — PPO fine-tuning", track: "LM", tag: "RL fine-tune",
  what: "Optimize an LLM against a reward model with PPO (the RL stage of RLHF).",
  cells: [
    md(`# 🔥 Advanced · RLHF with PPO\n\n${banner("Fine-tune an LLM with reinforcement learning against a reward model — the classic RLHF recipe.", "T4 GPU", "20–40 min", "TRL PPOTrainer", "https://huggingface.co/docs/trl/ppo_trainer")}\n\nThe scaled-up cousin of the REINFORCE lab (track AG): here the policy is a language model and the reward comes from a learned model. DPO (other lab) is the RL-free alternative.`),
    code(`!nvidia-smi -L
!pip install -q "trl<0.12" transformers datasets`),
    md(`## 1 · Policy (with a value head) + a reward model\nClassic demo: steer GPT-2 toward **positive sentiment**, scored by a sentiment classifier.`),
    code(`import torch
from trl import PPOConfig, PPOTrainer, AutoModelForCausalLMWithValueHead
from transformers import AutoTokenizer, pipeline
base = "lvwerra/gpt2-imdb"
tok = AutoTokenizer.from_pretrained(base); tok.pad_token = tok.eos_token
model = AutoModelForCausalLMWithValueHead.from_pretrained(base)
ref = AutoModelForCausalLMWithValueHead.from_pretrained(base)
reward_fn = pipeline("sentiment-analysis", model="lvwerra/distilbert-imdb", device=0 if torch.cuda.is_available() else -1)`),
    md(`## 2 · PPO loop — generate, score, update`),
    code(`from datasets import load_dataset
ds = load_dataset("imdb", split="train").shuffle(seed=0).select(range(200))
ppo = PPOTrainer(PPOConfig(batch_size=16, mini_batch_size=4, learning_rate=1.4e-5), model, ref, tok)
gen_kw = dict(max_new_tokens=24, do_sample=True, top_k=0, top_p=1.0, pad_token_id=tok.eos_token_id)
for batch in [ds[i:i+16] for i in range(0, 64, 16)]:
    queries = [tok(t[:40], return_tensors="pt").input_ids[0] for t in batch["text"]]
    responses = [ppo.generate(q, **gen_kw).squeeze()[len(q):] for q in queries]
    texts = [tok.decode(r) for r in responses]
    rewards = [torch.tensor(s["score"] if s["label"] == "POSITIVE" else 1 - s["score"]) for s in reward_fn(texts)]
    stats = ppo.step(queries, responses, rewards)
    print("mean reward:", round(float(torch.stack(rewards).mean()), 3))`),
    md(`## Troubleshooting & next steps\n- **TRL version**: the PPO API changed across releases; pin (\`trl<0.12\`) to match this script, or follow the example for your installed version.\n- Train a **reward model** from preference data first, then PPO against it → full RLHF.\n- Compare with **DPO** (simpler, no reward model / rollouts) — the other LM lab.`),
  ],
};

const sdlora = {
  file: "LM_stable_diffusion_lora.ipynb", title: "Stable Diffusion — LoRA / DreamBooth", track: "LM", tag: "Fine-tune",
  what: "Teach Stable Diffusion a new concept with LoRA / DreamBooth, then generate.",
  cells: [
    md(`# 🔥 Advanced · Stable Diffusion LoRA / DreamBooth\n\n${banner("Fine-tune a text-to-image diffusion model on a handful of your own images, then generate new ones.", "T4 GPU", "20–40 min", "diffusers (DreamBooth LoRA)", "https://huggingface.co/docs/diffusers/training/dreambooth")}\n\nA generative foundation model; the image counterpart to the LLM fine-tuning labs.`),
    code(`!nvidia-smi -L
!pip install -q diffusers accelerate transformers peft bitsandbytes
!git clone https://github.com/huggingface/diffusers; %cd diffusers/examples/dreambooth
!pip install -q -r requirements.txt`),
    md(`## 1 · A few instance images\nPut 5–10 photos of your subject in \`data/instance/\` (e.g. a specific object or person).`),
    md(`## 2 · Train a LoRA adapter (DreamBooth)`),
    code(`!accelerate launch train_dreambooth_lora.py \\
  --pretrained_model_name_or_path="runwayml/stable-diffusion-v1-5" \\
  --instance_data_dir="data/instance" \\
  --instance_prompt="a photo of sks object" \\
  --resolution=512 --train_batch_size=1 --gradient_accumulation_steps=1 \\
  --learning_rate=1e-4 --lr_scheduler="constant" --max_train_steps=400 \\
  --output_dir="sks-lora"`),
    md(`## 3 · Generate with the learned concept`),
    code(`import torch
from diffusers import StableDiffusionPipeline
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16).to("cuda")
pipe.load_lora_weights("sks-lora")
img = pipe("a photo of sks object on the moon, cinematic", num_inference_steps=30).images[0]
img.save("out.png"); img`),
    md(`## Troubleshooting & next steps\n- Use **prior-preservation** + class images to avoid overfitting; tune steps/LR.\n- For style (not subject) use plain **LoRA** text-to-image training.\n- Add structural control with **ControlNet** (the next lab); export to a fast runtime (LCM / SDXL-Turbo).`),
  ],
};

const controlnet = {
  file: "LM_controlnet.ipynb", title: "ControlNet — conditional diffusion", track: "LM", tag: "Inference",
  what: "Steer Stable Diffusion with a structural condition (edges / pose / depth).",
  cells: [
    md(`# 🔥 Advanced · ControlNet\n\n${banner("Generate images that follow a structure map (Canny edges, pose, depth) with ControlNet.", "T4 GPU", "10–20 min", "diffusers ControlNet", "https://huggingface.co/docs/diffusers/using-diffusers/controlnet")}\n\nConditional control over a diffusion foundation model — links to track B (geometry/structure) and to pose (track A).`),
    code(`!nvidia-smi -L
!pip install -q diffusers accelerate transformers opencv-python controlnet_aux`),
    md(`## 1 · Build a control image (Canny edges of your input)`),
    code(`import cv2, numpy as np
from PIL import Image
img = np.array(Image.open("input.jpg").convert("RGB"))
edges = cv2.Canny(img, 100, 200)
control = Image.fromarray(np.stack([edges] * 3, -1))
control.save("control.png")`),
    md(`## 2 · Generate following that structure`),
    code(`import torch
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
cn = ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-canny", torch_dtype=torch.float16)
pipe = StableDiffusionControlNetPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", controlnet=cn, torch_dtype=torch.float16).to("cuda")
out = pipe("a photorealistic robot, studio lighting", image=control, num_inference_steps=30).images[0]
out.save("controlled.png"); out`),
    md(`## Next steps\n- Swap the conditioner for **OpenPose** (links to the pose lab, track A) or **depth/normal** maps (track B).\n- Train your own ControlNet to condition on a new modality; combine with the LoRA lab.`),
  ],
};

const whisper = {
  file: "C_whisper_finetune.ipynb", title: "Whisper — fine-tune ASR", track: "C", tag: "Fine-tune",
  what: "Fine-tune the Whisper speech-to-text foundation model on a small dataset.",
  cells: [
    md(`# 🔥 Advanced · Whisper (speech-to-text)\n\n${banner("Fine-tune OpenAI's Whisper on a small ASR dataset — audio is the other half of egocentric video.", "T4 GPU", "30–60 min", "transformers / Whisper", "https://huggingface.co/blog/fine-tune-whisper")}\n\nEgocentric clips carry narration & sound; Whisper transcribes it (track C).`),
    code(`!nvidia-smi -L
!pip install -q "transformers>=4.41" datasets accelerate evaluate jiwer librosa soundfile`),
    md(`## 1 · A small speech dataset`),
    code(`from datasets import load_dataset, Audio
ds = load_dataset("PolyAI/minds14", "en-US", split="train[:200]")
ds = ds.cast_column("audio", Audio(sampling_rate=16000))`),
    md(`## 2 · Processor + model`),
    code(`from transformers import WhisperProcessor, WhisperForConditionalGeneration
ck = "openai/whisper-tiny"
proc = WhisperProcessor.from_pretrained(ck, language="english", task="transcribe")
model = WhisperForConditionalGeneration.from_pretrained(ck)
def prep(b):
    a = b["audio"]
    b["input_features"] = proc(a["array"], sampling_rate=16000).input_features[0]
    b["labels"] = proc(text=b["transcription"]).input_ids
    return b
ds = ds.map(prep, remove_columns=ds.column_names)`),
    md(`## 3 · Train`),
    code(`import torch
from transformers import Seq2SeqTrainer, Seq2SeqTrainingArguments
def collate(feats):
    inp = proc.feature_extractor.pad([{"input_features": f["input_features"]} for f in feats], return_tensors="pt")
    lab = proc.tokenizer.pad([{"input_ids": f["labels"]} for f in feats], return_tensors="pt")
    labels = lab["input_ids"].masked_fill(lab.attention_mask.ne(1), -100)
    inp["labels"] = labels; return inp
args = Seq2SeqTrainingArguments(output_dir="whisper-ft", per_device_train_batch_size=8, learning_rate=1e-5,
    max_steps=300, fp16=torch.cuda.is_available(), logging_steps=25, report_to="none")
Seq2SeqTrainer(model=model, args=args, train_dataset=ds, data_collator=collate, processing_class=proc).train()`),
    md(`## Next steps\n- Evaluate **WER** with \`evaluate.load("wer")\` on a held-out split.\n- Fine-tune on **egocentric narration** (Ego4D) and feed transcripts to the Video-LM lab.`),
  ],
};

const llmagent = {
  file: "AG_llm_agent_tooluse.ipynb", title: "LLM agent — tool use (ReAct)", track: "AG", tag: "Agent",
  what: "An LLM that reasons and calls tools in a loop (the real version of the agent-harness lab).",
  cells: [
    md(`# 🔥 Advanced · LLM agent with tool use\n\n${banner("An LLM decides which tool to call, observes the result, and iterates (ReAct) to solve tasks.", "T4 GPU", "10–20 min", "transformers (function-calling)", "https://huggingface.co/docs/transformers/main/en/chat_extras")}\n\nThe LLM-powered version of the self-contained **agent harness** (track AG) — drop it into that harness to score it.`),
    code(`!nvidia-smi -L
!pip install -q "transformers>=4.45" accelerate`),
    md(`## 1 · Tools the model may call`),
    code(`import math
def calculator(expression: str):
    """Evaluate an arithmetic expression."""
    return eval(expression, {"__builtins__": {}}, {"sqrt": math.sqrt})
def word_length(word: str):
    """Return the number of letters in a word."""
    return len(word)
tools = [calculator, word_length]`),
    md(`## 2 · A tool-calling chat model (ReAct loop)`),
    code(`import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
ck = "Qwen/Qwen2.5-1.5B-Instruct"
tok = AutoTokenizer.from_pretrained(ck)
model = AutoModelForCausalLM.from_pretrained(ck, torch_dtype="auto", device_map="auto")
msgs = [{"role": "user", "content": "What is sqrt(144) plus the number of letters in 'robotics'?"}]
text = tok.apply_chat_template(msgs, tools=tools, add_generation_prompt=True, tokenize=False)
out = model.generate(**tok(text, return_tensors="pt").to(model.device), max_new_tokens=256)
print(tok.decode(out[0], skip_special_tokens=True))`),
    md(`## 3 · Execute the tool call(s) and feed results back\nParse the model's tool call, run the Python function, append the result as a \`tool\` message, and generate again until it answers. (The chat template handles the tool-call format.)`),
    code(`# Minimal loop sketch: parse tool_calls from the model output, run the matching
# Python function, append {"role": "tool", "content": str(result)} and re-generate.
# Plug this agent into AG_agent_harness.evaluate(...) to score it on the task suite.`),
    md(`## Next steps\n- Use a framework — **LangGraph**, **smolagents**, or **transformers** agents — for robust parsing, memory and multi-step planning.\n- Add retrieval (the RAG lab) as a tool; give it environment actions for an embodied agent (track D).`),
  ],
};

const habitat = {
  file: "AG_habitat_navigation.ipynb", title: "Habitat — embodied navigation", track: "AG", tag: "Embodied RL",
  what: "Train/run a navigation agent in the Habitat 3D simulator.",
  cells: [
    md(`# 🔥 Advanced · Habitat embodied navigation\n\n${banner("Put an agent in a photorealistic 3D house and learn PointGoal navigation.", "T4 GPU", "heavy — sim install + training", "facebookresearch/habitat-lab", "https://github.com/facebookresearch/habitat-lab")}\n\nWhere agents (track AG) meet scene reconstruction & world models (track D): act inside a reconstructed 3D world.`),
    code(`!nvidia-smi`),
    md(`## 1 · Install Habitat-Sim + Habitat-Lab (headless)`),
    code(`!pip install -q habitat-sim --extra-index-url https://dl.fbaipublicfiles.com/habitat/habitat-sim/whl/cu121
!git clone --branch stable https://github.com/facebookresearch/habitat-lab.git
%cd habitat-lab
!pip install -q -e habitat-lab`),
    md(`## 2 · Download a test scene (Habitat test assets)`),
    code(`!python -m habitat_sim.utils.datasets_download --uids habitat_test_scenes --data-path data/`),
    md(`## 3 · Train a PointGoal navigation agent (DD-PPO)`),
    code(`!python -u habitat-baselines/habitat_baselines/run.py \\
  --config-name=pointnav/ppo_pointnav_example.yaml \\
  habitat_baselines.total_num_steps=20000`),
    md(`## Troubleshooting & next steps\n- Habitat is **install-heavy**; match the \`habitat-sim\` wheel to the runtime CUDA, run headless (EGL).\n- Swap in **ObjectNav** / **ImageNav**; feed the agent a learned world model (DreamerV3 lab) or map (SLAM lab, track D).`),
  ],
};

const vllm = {
  file: "LM_vllm_serving.ipynb", title: "Serve an LLM (vLLM / Ollama)", track: "LM", tag: "Serve",
  what: "Deploy a fine-tuned LLM for fast inference and query it via an API.",
  cells: [
    md(`# 🔥 Advanced · Serve an LLM (vLLM)\n\n${banner("Take a (fine-tuned) model to fast, batched, OpenAI-compatible serving.", "T4 GPU", "10–15 min", "vLLM", "https://github.com/vllm-project/vllm")}\n\nThe deployment end of the LM lifecycle — after QLoRA/DPO/Unsloth, serve it.`),
    code(`!nvidia-smi -L
!pip install -q vllm`),
    md(`## 1 · Start an OpenAI-compatible server (background)`),
    code(`import subprocess, time
srv = subprocess.Popen(["python", "-m", "vllm.entrypoints.openai.api_server",
                        "--model", "Qwen/Qwen2.5-0.5B-Instruct", "--max-model-len", "2048"])
time.sleep(60)  # wait for weights to load`),
    md(`## 2 · Query it like the OpenAI API`),
    code(`from openai import OpenAI
client = OpenAI(base_url="http://localhost:8000/v1", api_key="none")
r = client.chat.completions.create(model="Qwen/Qwen2.5-0.5B-Instruct",
    messages=[{"role": "user", "content": "Give me three tips for fine-tuning an LLM."}])
print(r.choices[0].message.content)`),
    md(`## Next steps\n- Serve your **LoRA adapter** (\`--enable-lora\`) or a merged model; benchmark throughput.\n- For laptops, export **GGUF** (Unsloth lab) and run with **Ollama** / **llama.cpp** instead.\n- Add **speculative decoding** / quantization (AWQ/GPTQ) for more speed.`),
  ],
};

// ===========================================================================
const labs = [mdm, fourd, gs3d, nerfstudio, videomaeEpic, sam2, splatam, dreamer, qlora, dpo, vlm, videolm, rag, lmeval, unsloth, rlhf, sdlora, controlnet, whisper, llmagent, habitat, vllm];

// Production-grade evaluation: a concrete held-out metric per lab (runnable where a
// standard automatable metric exists; the canonical metric + how-to otherwise).
const EVAL = {
  C_videomae_egocentric: [
    md(`## Evaluate — top-1 / top-5 accuracy on the held-out split`),
    code(`import numpy as np
pred = trainer.predict(ds("val", False))
logits, labels = pred.predictions, pred.label_ids
top1 = float((logits.argmax(-1) == labels).mean())
top5 = float(np.mean([l in row.argsort()[-5:] for row, l in zip(logits, labels)]))
print(f"held-out  top-1 {top1:.3f}  |  top-5 {top5:.3f}")`),
  ],
  LM_qlora_finetune_llm: [
    md(`## Evaluate — held-out perplexity (lower = better)\nPerplexity on a slice the model never trained on. For a fair before/after, also run this *before* \`trainer.train()\` and compare.`),
    code(`import math, torch
from datasets import load_dataset
ev = load_dataset("mlabonne/guanaco-llama2-1k", split="train[-100:]")
model.eval(); losses = []
for t in ev["text"]:
    ids = tok(t, return_tensors="pt", truncation=True, max_length=512).input_ids.to(model.device)
    with torch.no_grad(): losses.append(model(ids, labels=ids).loss.item())
print("held-out perplexity:", round(math.exp(sum(losses) / len(losses)), 2))`),
  ],
  LM_unsloth_finetune: [
    md(`## Evaluate — held-out perplexity (lower = better)`),
    code(`import math, torch
from datasets import load_dataset
ev = load_dataset("mlabonne/guanaco-llama2-1k", split="train[-100:]")
model.eval(); losses = []
for t in ev["text"]:
    ids = tok(t, return_tensors="pt", truncation=True, max_length=512).input_ids.to(model.device)
    with torch.no_grad(): losses.append(model(ids, labels=ids).loss.item())
print("held-out perplexity:", round(math.exp(sum(losses) / len(losses)), 2))`),
  ],
  LM_dpo_alignment: [
    md(`## Evaluate — preference accuracy on a held-out split\nHow often the aligned model scores the *chosen* answer above the *rejected* one (1.0 = always).`),
    code(`from datasets import load_dataset
ev = load_dataset("trl-lib/ultrafeedback_binarized", split="train[2000:2300]")
m = trainer.evaluate(eval_dataset=ev)
print({k: round(v, 4) for k, v in m.items() if "reward" in k or "accurac" in k})   # eval_rewards/accuracies`),
  ],
  LM_vlm_finetune: [
    md(`## Evaluate — held-out loss (lower = better)\nRun on a ChartQA slice held out from training; for task accuracy, generate answers and exact-match against the gold labels.`),
    code(`from datasets import load_dataset
ev = load_dataset("HuggingFaceM4/ChartQA", split="train[500:600]")
print(trainer.evaluate(eval_dataset=ev))`),
  ],
  C_whisper_finetune: [
    md(`## Evaluate — Word Error Rate (WER) on a held-out split (lower = better)`),
    code(`import evaluate, torch
from datasets import load_dataset, Audio
wer = evaluate.load("wer")
model.to("cuda" if torch.cuda.is_available() else "cpu").eval()
ev = load_dataset("PolyAI/minds14", "en-US", split="train[200:260]").cast_column("audio", Audio(sampling_rate=16000))
preds, refs = [], []
for b in ev:
    feat = proc(b["audio"]["array"], sampling_rate=16000, return_tensors="pt").input_features.to(model.device)
    with torch.no_grad(): ids = model.generate(feat, language="en", task="transcribe", max_new_tokens=128)
    preds.append(proc.batch_decode(ids, skip_special_tokens=True)[0]); refs.append(b["transcription"])
print("WER:", round(100 * wer.compute(predictions=preds, references=refs), 1), "%")`),
  ],
  LM_rag_pipeline: [
    md(`## Evaluate — retrieval recall@k on labelled queries\nDoes the right passage come back in the top-k? (Retrieval quality caps the whole pipeline.)`),
    code(`queries = [("How are 3D scenes rendered in real time?", 1), ("What parameters control the SMPL body?", 2),
           ("What does SLAM estimate?", 3), ("How does a world model help an agent plan?", 4)]
def recall_at_k(k=3):
    hits = 0
    for q, gold in queries:
        qe = embedder.encode([q], normalize_embeddings=True); _, idx = index.search(qe, k)
        hits += int(gold in idx[0])
    return hits / len(queries)
print("recall@1:", recall_at_k(1), "| recall@3:", recall_at_k(3))`),
  ],
  LM_vllm_serving: [
    md(`## Evaluate — serving throughput (tokens / second)`),
    code(`import time
prompts = ["Summarise reinforcement learning in one sentence."] * 8
t0 = time.time(); ntok = 0
for p in prompts:
    r = client.chat.completions.create(model="Qwen/Qwen2.5-0.5B-Instruct",
        messages=[{"role": "user", "content": p}], max_tokens=128)
    ntok += r.usage.completion_tokens
dt = time.time() - t0
print(f"generated {ntok} tokens in {dt:.1f}s -> {ntok / dt:.1f} tok/s (sequential; concurrent batching is much faster)")`),
  ],
  B_gaussian_splatting_3d: [
    md(`## Evaluate — PSNR / SSIM / LPIPS on held-out views\n3DGS holds out every 8th image as a test view; render and score them:`),
    code(`!python render.py -m output/<your-scene>           # render train + held-out test views
!python metrics.py -m output/<your-scene>          # prints SSIM, PSNR, LPIPS over the test split`),
  ],
  B_nerfstudio_nerfacto: [
    md(`## Evaluate — PSNR / SSIM / LPIPS on eval views`),
    code(`!ns-eval --load-config outputs/<scene>/nerfacto/<run>/config.yml --output-path eval_results.json
import json; print(json.load(open("eval_results.json"))["results"])`),
  ],
  // ── metric-definition notes for the generation / inference / heavy-RL labs ──
  A_mdm_text_to_motion: [md(`## Evaluate — FID · R-precision · diversity\nMDM is scored against the **HumanML3D** test set with the repo's evaluator: \`python -m eval.eval_humanml --model_path save/run/model000XXXXXX.pt\` → **FID** (realism), **R-precision@1/2/3** (text↔motion match), **Diversity**, **Multimodality**. Quick sanity check without the full evaluator: generate several motions for one prompt and confirm their pairwise diversity isn't ~0 (mode collapse).`)],
  A_4dhumans_mesh: [md(`## Evaluate — pose accuracy\nHuman-mesh recovery is scored with **PA-MPJPE / MPJPE** (mm) and **PCK** on benchmarks like **3DPW** / **Human3.6M** (use the repo's eval config). Qualitatively, overlay the predicted SMPL mesh on the input frames and check joint alignment + temporal stability.`)],
  C_sam2_video_segmentation: [md(`## Evaluate — segmentation quality (J&F)\nVideo object segmentation is scored by the **J&F** mean — region IoU (**J**) + boundary accuracy (**F**) — on **DAVIS 2017** / **SA-V**. With ground-truth masks, compute per-frame IoU (\`evaluate.load("mean_iou")\`); without GT, inspect mask stability across the propagated frames.`)],
  D_splatam_slam: [md(`## Evaluate — tracking + mapping\nSplaTAM reports **ATE RMSE** (camera-trajectory error, cm) and rendering **PSNR / SSIM / LPIPS**; both print at the end of \`splatam.py\` and are saved under the run's \`eval/\` folder. Compare ATE RMSE to the dataset's published numbers (e.g. Replica).`)],
  D_dreamerv3_world_model: [md(`## Evaluate — mean episode return\nThe metric is **mean evaluation-episode return** vs environment steps (DreamerV3 logs \`eval/return\` to the logdir / TensorBoard). Average the return over several eval episodes with the trained agent and compare to the task's reported score.`)],
  LM_videolm_qwen2vl: [md(`## Evaluate — video-understanding benchmarks\nVideo-LMs are scored on **Video-MME**, **MVBench**, **EgoSchema** (multiple-choice video-QA accuracy). For numbers, run **lmms-eval** on one suite; for a quick check, ask several questions about a known clip and verify the answers.`)],
  LM_stable_diffusion_lora: [md(`## Evaluate — image quality & prompt alignment\nText-to-image is scored with **FID** (realism vs a reference set) and **CLIP score** (prompt alignment): \`pip install torchmetrics[image]\` → \`CLIPScore\`. For subject/DreamBooth LoRAs, also report **CLIP-I / DINO** subject similarity. Qualitatively, generate a fixed prompt grid before vs after training.`)],
  LM_controlnet: [md(`## Evaluate — condition fidelity\nControlNet is judged by how well the output respects the control signal: re-extract the condition (Canny / depth / pose) from the *generated* image and compare to the input condition (edge IoU, depth error), plus a **CLIP score** for prompt alignment.`)],
  AG_habitat_navigation: [md(`## Evaluate — Success rate & SPL\nNavigation is scored by **Success rate** and **SPL** (Success weighted by Path Length). Run the baseline in eval mode — \`... run.py --config-name=pointnav/ppo_pointnav_example.yaml habitat_baselines.evaluate=True\` — to print Success/SPL over the validation episodes.`)],
  AG_llm_agent_tooluse: [md(`## Evaluate — task success rate\nScore the agent by plugging it into the self-contained **\`AG_agent_harness\`** task suite (\`harness.evaluate(agent)\`) and reporting the **fraction of tasks solved** with correct final answers — the honest, comparable way to evaluate an agent (and its prompts / tools).`)],
  LM_rlhf_ppo: [md(`## Evaluate — mean reward (+ KL guard)\nRLHF is judged by the **mean reward** of the policy's outputs under the reward model on a held-out prompt set (should rise over training), plus a **KL-to-reference** check so it doesn't drift / reward-hack. Sample completions for fixed prompts before vs after and compare scores.`)],
};
for (const lab of labs) {
  const id = lab.file.replace(/\.ipynb$/, "");
  if (EVAL[id]) lab.cells.splice(lab.cells.length - 1, 0, ...EVAL[id]);
}

// Every advanced repo writes its own artifacts (checkpoints, logs, renders) to a
// run/output directory; add a uniform reminder that Colab is ephemeral.
const PERSIST = md(`## Save & persist your results\nThis pipeline writes its checkpoints, metrics/logs and outputs to the run/output directory shown above (e.g. \`output/\`, \`outputs/\`, \`logdir/\`, \`experiments/\`, or the trainer's \`output_dir\`). **Colab sessions are ephemeral** — to keep them, either mount Drive and copy the folder (\`from google.colab import drive; drive.mount('/content/drive')\`) or zip + download it (\`import shutil; shutil.make_archive('run','zip','OUTPUT_DIR')\` then \`from google.colab import files; files.download('run.zip')\`). The 🤗 Trainer labs also support \`trainer.push_to_hub()\`. To publish any output folder as a **model repo** (then group repos into a **Collection** on your profile): \`from huggingface_hub import HfApi; HfApi().upload_folder(folder_path="OUTPUT_DIR", repo_id="<you>/<lab>")\`.`);
for (const lab of labs) lab.cells.splice(lab.cells.length - 1, 0, PERSIST);

// Cross-reference each language/multimodal lab back to the embodied tracks A–D.
const LINK_NOTES = {
  LM_qlora_finetune_llm: "The same QLoRA recipe fine-tunes the foundation backbones used across the course:\n- **A · Human** human-motion / pose models · **B · 3D** vision backbones · **C · Egocentric** VideoMAE / CLIP / DINOv2 · **D · Scene / world** VLMs for open-vocabulary scenes.",
  LM_unsloth_finetune: "Same reach as QLoRA, just faster — adapt any course backbone:\n- **A · Human** · **B · 3D** · **C · Egocentric** · **D · Scene / world**.",
  LM_eval_harness: "Honest evaluation (lesson C9) applies to every track:\n- **A / B / C / D** — always score against a baseline and report failure modes, not just one number.",
  LM_dpo_alignment: "Preference alignment generalises beyond text:\n- **A · Human** align a motion generator (MDM) to preferred motions · **D · Scene / world** preference / RL-style alignment for agents and world-model planning.",
  LM_vlm_finetune: "Grounding language in pixels feeds two tracks:\n- **C · Egocentric** first-person visual question answering · **D · Scene / world** open-vocabulary scene understanding (OpenScene / LERF use vision-language features).",
  LM_videolm_qwen2vl: "Video-language reasoning maps to:\n- **C · Egocentric** first-person video Q&A and action understanding · **A · Human** describing / parsing human actions in video.",
  LM_rag_pipeline: "Retrieval gives models external memory:\n- **D · Scene / world** query a scene / world memory (open-vocabulary map lookups) · **C · Egocentric** retrieve the relevant clips from long egocentric video.",
  LM_rlhf_ppo: "RL fine-tuning generalises:\n- **A · Human** align a motion generator (MDM) to preferred motions · **D · Scene / world** RL alignment for agents and world-model planning.",
  LM_stable_diffusion_lora: "Generative image models feed the visual tracks:\n- **A · Human** generate humans / avatars · **B · 3D** synthesize textures & assets for scenes.",
  LM_controlnet: "Structural control links to geometry:\n- **A · Human** pose-conditioned generation · **B · 3D** depth / edge / normal control.",
  AG_llm_agent_tooluse: "An LLM agent ties the stack together:\n- **C · Egocentric** an assistant that reasons over what you see · **D · Scene / world** an embodied agent that acts · **LM** the policy is a language model.",
  AG_habitat_navigation: "Embodied agents live in reconstructed worlds:\n- **D · Scene / world** act inside a 3D scene / map (SLAM, world models) · learned with RL (track AG).",
  LM_vllm_serving: "Deployment serves any fine-tuned model:\n- **A / B / C / D** ship the foundation models you trained across every track.",
  A_mdm_text_to_motion: "Generative motion connects out:\n- **LM** the same diffusion recipe as image/text generation · **AG** motion priors for agent policies.",
  A_4dhumans_mesh: "Human mesh recovery feeds:\n- **C · Egocentric** people seen in first-person video · **D · Scene / world** humans placed inside reconstructed scenes.",
  B_gaussian_splatting_3d: "Gaussian scenes are the map substrate for **D · Scene / world** (SLAM, world models).",
  B_nerfstudio_nerfacto: "These reconstructions become the **D · Scene / world** scene representation an agent reasons over.",
  C_videomae_egocentric: "Egocentric action models relate to:\n- **A · Human** human motion / activity · **D · Scene / world** what happens where in a scene.",
  C_sam2_video_segmentation: "Masks feed:\n- **A · Human** hand / person parsing · **D · Scene / world** object-level semantic mapping.",
  D_splatam_slam: "Dense SLAM builds directly on **B · 3D** Gaussian-Splatting / NeRF geometry.",
  D_dreamerv3_world_model: "World models are the engine of **AG · Agents & RL** model-based agents.",
  C_whisper_finetune: "Speech transcripts feed **LM** video-language models (egocentric narration, track C).",
};
for (const lab of labs) {
  const id = lab.file.replace(/\.ipynb$/, "");
  if (LINK_NOTES[id]) lab.cells.splice(lab.cells.length - 1, 0, md(`## How this links to tracks A–D\n${LINK_NOTES[id]}`));
}

// Compute / storage / time guidance per advanced lab (rough, hardware-dependent).
const COMPUTE = {
  A_mdm_text_to_motion: { demoGpu: "T4 16 GB — generate from a pretrained checkpoint", fullGpu: "1× A100 40 GB (or V100 32 GB) to train from scratch", storageDemo: "~3 GB (SMPL + GloVe + 1 checkpoint)", storageFull: "HumanML3D ~4 GB + checkpoints ~1 GB; ~20 GB disk", timeDemo: "~1–2 min / sample", timeFull: "~1–2 days for ~500k steps", full: "`python -m train.train_mdm --dataset humanml --save_dir save/run --num_steps 500000` (single GPU)." },
  A_4dhumans_mesh: { demoGpu: "T4 16 GB (~6 GB used) — inference / tracking", fullGpu: "4–8× A100 40 GB to retrain HMR 2.0", storageDemo: "checkpoints ~1 GB + your video", storageFull: "training sets (H36M, MPI-INF-3DHP, COCO, InstaVariety…) ~ hundreds of GB", timeDemo: "a few FPS per video", timeFull: "~2–4 days on 8× A100", full: "use the repo's training configs with multi-GPU DDP (`torchrun` / Lightning)." },
  B_gaussian_splatting_3d: { demoGpu: "T4 16 GB — small scene, 7k iters", fullGpu: "1× RTX 3090/4090 or A100 24–40 GB — large scenes, 30k iters", storageDemo: "photos + COLMAP + .ply ~ 1–3 GB", storageFull: "~5–20 GB / scene; .ply 50–400 MB", timeDemo: "7k iters ~ 7–15 min (+ COLMAP minutes)", timeFull: "30k iters ~ 30–60 min / scene on a 3090/A100", full: "`python train.py -s data/scene -m out --iterations 30000` (COLMAP cost grows with photo count)." },
  B_nerfstudio_nerfacto: { demoGpu: "T4 16 GB", fullGpu: "1× RTX 3090/4090 / A100 ≥ 24 GB", storageDemo: "video/images + outputs ~ 1–5 GB", storageFull: "~10 GB / scene", timeDemo: "15k iters ~ 10–20 min", timeFull: "30k iters ~ 20–30 min (splatfacto similar)", full: "`ns-train nerfacto --data data/mine --max-num-iterations 30000` (or `splatfacto`)." },
  C_videomae_egocentric: { demoGpu: "T4 16 GB — videomae-base, small subset, fp16", fullGpu: "4–8× A100 40 GB for EPIC-100 / Ego4D", storageDemo: "UCF subset ~ 1 GB", storageFull: "EPIC-Kitchens-100 ~ 0.5–1 TB (RGB frames); Ego4D multi-TB", timeDemo: "300–600 steps ~ 20–40 min", timeFull: "full fine-tune ~ 1–3 days on 4–8× A100", full: "`torchrun --nproc_per_node=8 train.py …` over the full frame dataset, many epochs." },
  C_sam2_video_segmentation: { demoGpu: "T4 16 GB (hiera-large ~ 4–6 GB) — inference", fullGpu: "same; A100 for long / high-res video", storageDemo: "checkpoint ~ 0.9 GB + frames", storageFull: "scales with clip length / resolution", timeDemo: "~ a few FPS propagation on T4", timeFull: "real-time on A100; batch many clips", full: "inference only; to fine-tune SAM 2 use the repo's (multi-GPU) training code." },
  D_splatam_slam: { demoGpu: "RTX 3090/4090 or A100 ≥ 24 GB (12–16 GB for small)", fullGpu: "1× A100 40 GB for long sequences", storageDemo: "Replica scene ~ 2–5 GB + outputs", storageFull: "~10–20 GB / sequence (maps + renders)", timeDemo: "1 Replica scene ~ 1–2 h", timeFull: "~ 2–4 h / sequence (longer for real captures)", full: "`python scripts/splatam.py configs/<dataset>/splatam.py` per sequence." },
  D_dreamerv3_world_model: { demoGpu: "1× T4 / 24 GB — Crafter, partial budget", fullGpu: "1× A100 40 GB", storageDemo: "replay buffer + logs ~ few GB", storageFull: "replay buffer 10–50 GB (pixel envs) + logs", timeDemo: "~ hours for 1e5 steps", timeFull: "~ 1–3 days for 1e6–5e6 steps", full: "`python dreamerv3/main.py --configs <task> --run.steps 5e6 --logdir …`." },
  LM_qlora_finetune_llm: { demoGpu: "T4 16 GB — 0.5B–7B in 4-bit", fullGpu: "A100 40/80 GB; 70B ≈ 2× 48 GB or offload", storageDemo: "base (4-bit) 0.5–4 GB + adapter ~ tens of MB", storageFull: "70B 4-bit ~ 35–40 GB; 50–150 GB disk", timeDemo: "200 steps / 1k samples ~ 10–30 min", timeFull: "full dataset (100k+) ~ several hours–1 day", full: "`accelerate launch --multi_gpu sft.py …` over the full dataset; raise rank/seq-len." },
  LM_dpo_alignment: { demoGpu: "T4 16 GB — small model", fullGpu: "A100 40/80 GB (policy + reference)", storageDemo: "model + preference subset", storageFull: "UltraFeedback ~ GBs; 50–100 GB disk", timeDemo: "200 steps ~ 15–30 min", timeFull: "full set ~ several hours (≈1.5–2× SFT)", full: "`accelerate launch dpo.py …` on full preference data after SFT." },
  LM_vlm_finetune: { demoGpu: "T4 16 GB — SmolVLM 2B, 4-bit", fullGpu: "A100 40 GB — Qwen2-VL-7B / PaliGemma", storageDemo: "ChartQA subset ~ 1 GB + model", storageFull: "VQA datasets 10–100 GB; 50–150 GB disk", timeDemo: "200 steps ~ 30–60 min", timeFull: "full dataset ~ hours–1 day", full: "`accelerate launch --multi_gpu vlm_sft.py …`; larger backbone, full VQA." },
  LM_videolm_qwen2vl: { demoGpu: "T4 16 GB — Qwen2-VL-2B inference, low fps/res", fullGpu: "A100 40 GB — 2B fine-tune / 7B inference", storageDemo: "model ~ 4 GB + a clip", storageFull: "video-instruction datasets 100 GB+; ~200 GB disk", timeDemo: "inference seconds–min / clip", timeFull: "LoRA fine-tune ~ hours–1 day", full: "LoRA SFT over a video-instruction dataset (multi-GPU)." },
  LM_rag_pipeline: { demoGpu: "T4 16 GB (or CPU for a small corpus)", fullGpu: "1× 24 GB for a larger generator", storageDemo: "tiny", storageFull: "FAISS index ≈ 1.5 KB × #vectors (1M docs ≈ 1.5 GB)", timeDemo: "index instantly; query ~ ms", timeFull: "indexing thousands of docs/s on GPU", full: "swap FAISS for a vector DB (Qdrant / pgvector), add a reranker, batch-ingest." },
  LM_eval_harness: { demoGpu: "matches the model (T4 for ≤ 7B)", fullGpu: "A100 for 13–70B", storageDemo: "task data + model", storageFull: "benchmark suites a few–tens of GB", timeDemo: "`--limit 100`, 2 tasks ~ 5–15 min", timeFull: "full MMLU + GSM8K + … ~ 1–4 h (model-dependent)", full: "drop `--limit`, add tasks, `--num_fewshot`, batch on multi-GPU (`accelerate`)." },
  LM_unsloth_finetune: { demoGpu: "T4 16 GB — up to ~8B 4-bit (≈2× faster)", fullGpu: "A100 40/80 GB for bigger models / longer ctx", storageDemo: "base + adapter; GGUF export ~ 0.3–4 GB", storageFull: "as QLoRA; 50–150 GB", timeDemo: "60 steps ~ 5–15 min", timeFull: "full dataset ~ a few hours", full: "raise max_steps / full dataset; export merged or GGUF for serving." },
  LM_rlhf_ppo: { demoGpu: "T4 16 GB — GPT-2 sentiment demo", fullGpu: "multi-GPU 40–80 GB (policy + ref + reward + value for 7B)", storageDemo: "small", storageFull: "3–4 model copies + rollout logs; 100 GB+", timeDemo: "~ tens of minutes", timeFull: "7B RLHF ~ days on 8× A100", full: "train a reward model, then `accelerate launch ppo.py …` on full prompts (DPO is a cheaper alternative)." },
  LM_stable_diffusion_lora: { demoGpu: "T4 16 GB — SD 1.5 LoRA / DreamBooth", fullGpu: "RTX 4090 / A100 ≥ 24 GB for SDXL", storageDemo: "SD 1.5 ~ 4–5 GB + LoRA ~ tens of MB", storageFull: "SDXL ~ 14 GB; datasets; 30–60 GB disk", timeDemo: "400–1500 steps ~ 15–40 min", timeFull: "SDXL LoRA ~ 1–3 h; full fine-tune longer", full: "`accelerate launch train_dreambooth_lora_sdxl.py …`; add prior preservation." },
  LM_controlnet: { demoGpu: "T4 16 GB — SD 1.5 + ControlNet inference", fullGpu: "24 GB for SDXL ControlNet; multi-GPU to train one", storageDemo: "SD + ControlNet ~ 6–10 GB", storageFull: "to train a new ControlNet: paired dataset 10–100 GB", timeDemo: "~ 5–30 s / image (T4)", timeFull: "training a ControlNet ~ days on multi-GPU", full: "to train: `accelerate launch train_controlnet.py …` on (condition, image) pairs." },
  C_whisper_finetune: { demoGpu: "T4 16 GB — whisper-tiny / base", fullGpu: "A100 40 GB — whisper-large-v3", storageDemo: "MINDS-14 subset ~ 0.5 GB + model", storageFull: "Common Voice / LibriSpeech 10–60 GB; large-v3 ~ 3 GB", timeDemo: "300 steps ~ 30–60 min", timeFull: "large-v3 full ~ 1–3 days multi-GPU", full: "`accelerate launch run_speech_recognition_seq2seq.py …` on the full corpus." },
  AG_llm_agent_tooluse: { demoGpu: "T4 16 GB — 1.5B model inference", fullGpu: "24 GB for a 7–14B agent", storageDemo: "model ~ 3 GB", storageFull: "models 14–30 GB; tool / state stores small", timeDemo: "seconds–min / task (multiple LLM calls)", timeFull: "depends on steps / tools; serve via vLLM for throughput", full: "wrap in LangGraph / smolagents; serve the LLM with vLLM (serving lab)." },
  AG_habitat_navigation: { demoGpu: "1× T4 / 24 GB — small budget (10–50M steps)", fullGpu: "many GPUs — DD-PPO scales to 8–64", storageDemo: "Habitat test scenes ~ small", storageFull: "HM3D ~ tens of GB, MP3D ~ 15 GB, Gibson; 50–150 GB disk", timeDemo: "10–50M steps ~ hours–1 day on 1 GPU", timeFull: "PointNav SOTA = 2.5B steps, days on 64 GPUs", full: "multi-node DD-PPO (`torchrun` / SLURM), full scene dataset, billions of steps." },
  LM_vllm_serving: { demoGpu: "T4 16 GB — ≤ 7B (0.5B trivial)", fullGpu: "A100 / H100 80 GB; 70B ≈ 2–4× 80 GB (or 4-bit)", storageDemo: "model 0.5–4 GB", storageFull: "70B fp16 ~ 140 GB (4-bit ~ 35 GB); size disk to model", timeDemo: "startup ~ 1 min; query ~ ms", timeFull: "batched throughput thousands of tok/s on A100", full: "`vllm serve <model> --tensor-parallel-size N`; add `--enable-lora`, AWQ/GPTQ quantization." },
};
for (const lab of labs) {
  const id = lab.file.replace(/\.ipynb$/, "");
  if (COMPUTE[id]) lab.cells.splice(1, 0, computeCell(COMPUTE[id]));   // right after the banner
}

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
const trackName = { A: "A · Human", B: "B · 3D / rendering", C: "C · Egocentric", D: "D · Scene / world", LM: "LM · Language & multimodal", AG: "AG · Agents & RL" };
const readme = `# Advanced labs · heavy GPU pipelines

Real research-repo pipelines — **training, fine-tuning, and inference on actual foundation models** — two per track. Unlike the [Training labs](../training/), these clone official repos, download large checkpoints/datasets, and **require a GPU**.

> ⚠️ **Read me.** These are authored to each project's **official recipe** and are **not pre-executed here** (they need a GPU + multi-GB downloads, and some need gated data). Treat them as ready-to-run scaffolds: open in Colab, set **Runtime → GPU**, and expect to pin a version or two. Each notebook has a *Troubleshooting* section. For pipelines verified end-to-end, use the [Training labs](../training/).

Every lab includes a **Compute · storage · time** table near the top — which / how
many GPUs, VRAM, dataset & checkpoint/disk sizes, and time estimates (per unit and
for a full run) — plus the **full-scale pipeline** command and a *How this links to
tracks A–D* note.

| Lab | Track | Kind | Open |
|---|---|---|---|
${labs.map((l) => `| ${l.title} | ${trackName[l.track]} | ${l.tag} | ${badge(l.file)} |`).join("\n")}

Each maps to a lesson and to its lighter, verified counterpart in \`notebooks/training/\`.
`;
fs.writeFileSync(path.join(OUT, "README.md"), readme);
console.log("wrote README.md");
