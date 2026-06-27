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

// ===========================================================================
const labs = [mdm, fourd, gs3d, nerfstudio, videomaeEpic, sam2, splatam, dreamer, qlora, dpo, vlm, videolm];

// Every advanced repo writes its own artifacts (checkpoints, logs, renders) to a
// run/output directory; add a uniform reminder that Colab is ephemeral.
const PERSIST = md(`## Save & persist your results\nThis pipeline writes its checkpoints, metrics/logs and outputs to the run/output directory shown above (e.g. \`output/\`, \`outputs/\`, \`logdir/\`, \`experiments/\`, or the trainer's \`output_dir\`). **Colab sessions are ephemeral** — to keep them, either mount Drive and copy the folder (\`from google.colab import drive; drive.mount('/content/drive')\`) or zip + download it (\`import shutil; shutil.make_archive('run','zip','OUTPUT_DIR')\` then \`from google.colab import files; files.download('run.zip')\`). The 🤗 Trainer labs also support \`trainer.push_to_hub()\`.`);
for (const lab of labs) lab.cells.splice(lab.cells.length - 1, 0, PERSIST);

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
const trackName = { A: "A · Human", B: "B · 3D / rendering", C: "C · Egocentric", D: "D · Scene / world", LM: "LM · Language & multimodal" };
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
