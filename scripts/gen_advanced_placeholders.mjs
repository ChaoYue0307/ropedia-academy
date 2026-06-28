// Creates documented PLACEHOLDER model repos for the advanced (GPU-heavy, can't-run-
// in-sandbox) labs: a comprehensive README (like the trained ones) but with a
// 🚧 status banner, a TODO checklist, and "results: TODO" — to be filled in by
// running the notebook on a GPU. Writes models/<id>/{README.md, metrics.todo.json}.
//   node scripts/gen_advanced_placeholders.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = "ChaoYue0307/ropedia-academy";
const ROPEDIA = "https://chaoyue0307.github.io/ropedia-academy/";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const L = (...t) => t.join(", ");
const ADV = [
  { id: "A_mdm_text_to_motion", title: "MDM — text-to-motion", task: "human-motion generation from text", repo: "GuyTevet/motion-diffusion-model", url: "https://github.com/GuyTevet/motion-diffusion-model", track: "A · Human modeling", links: ["LM", "AG"], summary: "Generate 3D human motion from a text prompt with the Motion Diffusion Model." },
  { id: "A_4dhumans_mesh", title: "4D-Humans (HMR 2.0) — mesh from video", task: "3D human mesh recovery", repo: "shubham-goel/4D-Humans", url: "https://github.com/shubham-goel/4D-Humans", track: "A · Human modeling", links: ["C", "D"], summary: "Recover and track an animated 3D SMPL body from your own image or video." },
  { id: "B_gaussian_splatting_3d", title: "3D Gaussian Splatting", task: "3D scene reconstruction (photos → splats)", repo: "graphdeco-inria/gaussian-splatting", url: "https://github.com/graphdeco-inria/gaussian-splatting", track: "B · 3D & rendering", links: ["D"], summary: "Turn a set of your own photos into a real 3D Gaussian-Splatting scene (CUDA rasterizer + COLMAP)." },
  { id: "B_nerfstudio_nerfacto", title: "Nerfstudio nerfacto", task: "NeRF / Gaussian scene from video", repo: "nerfstudio-project/nerfstudio", url: "https://docs.nerf.studio/", track: "B · 3D & rendering", links: ["D"], summary: "Train a high-quality NeRF (or Gaussian splat) on your own phone video with Nerfstudio." },
  { id: "C_videomae_egocentric", title: "VideoMAE — egocentric fine-tune", task: "egocentric action recognition", repo: "EPIC-Kitchens / Ego4D (🤗 transformers)", url: "https://huggingface.co/docs/transformers/en/tasks/video_classification", track: "C · Egocentric vision", links: ["A", "D"], summary: "Fine-tune the VideoMAE video transformer for first-person action recognition." },
  { id: "C_sam2_video_segmentation", title: "SAM 2 — video segmentation", task: "promptable video object segmentation", repo: "facebookresearch/sam2", url: "https://github.com/facebookresearch/sam2", track: "C · Egocentric vision", links: ["A", "D"], summary: "Click an object on frame 0; SAM 2 tracks its mask through the whole clip." },
  { id: "C_whisper_finetune", title: "Whisper — fine-tune ASR", task: "speech-to-text", repo: "openai/whisper (🤗 transformers)", url: "https://huggingface.co/blog/fine-tune-whisper", track: "C · Egocentric vision", links: ["LM"], pipeline: "automatic-speech-recognition", summary: "Fine-tune the Whisper speech-to-text foundation model (e.g. on egocentric narration)." },
  { id: "D_splatam_slam", title: "SplaTAM — Gaussian-Splatting SLAM", task: "dense neural SLAM (RGB-D → map + trajectory)", repo: "spla-tam/SplaTAM", url: "https://github.com/spla-tam/SplaTAM", track: "D · Scene & world models", links: ["B"], summary: "Recover the camera trajectory and a dense 3D Gaussian map jointly (SLAM)." },
  { id: "D_dreamerv3_world_model", title: "DreamerV3 — world-model RL", task: "model-based reinforcement learning", repo: "danijar/dreamerv3", url: "https://github.com/danijar/dreamerv3", track: "D · Scene & world models", links: ["AG"], summary: "Learn a latent world model from pixels and train an agent inside imagination." },
  { id: "LM_qlora_finetune_llm", title: "QLoRA — fine-tune an LLM", task: "instruction fine-tuning (4-bit LoRA)", repo: "huggingface/trl + peft", url: "https://github.com/huggingface/trl", track: "LM · Language & multimodal", links: ["A", "B", "C", "D"], pipeline: "text-generation", summary: "Instruction-tune a small LLM on your own data cheaply with 4-bit QLoRA." },
  { id: "LM_dpo_alignment", title: "DPO — align an LLM", task: "preference alignment", repo: "huggingface/trl", url: "https://huggingface.co/docs/trl/dpo_trainer", track: "LM · Language & multimodal", links: ["A", "D"], pipeline: "text-generation", summary: "Align an LLM to preferred answers with Direct Preference Optimization." },
  { id: "LM_vlm_finetune", title: "Fine-tune a VLM (vision-language)", task: "image question answering", repo: "huggingface/trl + SmolVLM", url: "https://huggingface.co/docs/trl/en/sft_trainer", track: "LM · Language & multimodal", links: ["C", "D"], pipeline: "image-text-to-text", summary: "LoRA-fine-tune a vision-language model on image Q&A." },
  { id: "LM_videolm_qwen2vl", title: "Video-LM (Qwen2-VL)", task: "video question answering", repo: "QwenLM/Qwen2-VL", url: "https://github.com/QwenLM/Qwen2-VL", track: "LM · Language & multimodal", links: ["A", "C"], pipeline: "video-text-to-text", summary: "Reason over video with a video-language model; plus a LoRA fine-tune sketch." },
  { id: "LM_rag_pipeline", title: "RAG — retrieval-augmented generation", task: "grounded generation over a corpus", repo: "sentence-transformers + FAISS", url: "https://github.com/facebookresearch/faiss", track: "LM · Language & multimodal", links: ["C", "D"], summary: "Embed a corpus, retrieve with FAISS, and ground an LLM's answer in it." },
  { id: "LM_eval_harness", title: "Evaluate an LLM (lm-eval-harness)", task: "LLM benchmarking", repo: "EleutherAI/lm-evaluation-harness", url: "https://github.com/EleutherAI/lm-evaluation-harness", track: "LM · Language & multimodal", links: ["A", "B", "C", "D"], summary: "Benchmark an LLM on standard tasks (ARC, HellaSwag, MMLU, …)." },
  { id: "LM_unsloth_finetune", title: "Unsloth — fast LLM fine-tune", task: "fast LoRA fine-tune + GGUF export", repo: "unslothai/unsloth", url: "https://github.com/unslothai/unsloth", track: "LM · Language & multimodal", links: ["A", "B", "C", "D"], pipeline: "text-generation", summary: "Fine-tune an LLM ~2× faster / lighter with Unsloth, then export GGUF." },
  { id: "LM_rlhf_ppo", title: "RLHF — PPO fine-tuning", task: "RL fine-tuning against a reward model", repo: "huggingface/trl (PPOTrainer)", url: "https://huggingface.co/docs/trl/ppo_trainer", track: "LM · Language & multimodal", links: ["A", "D"], pipeline: "text-generation", summary: "Optimize an LLM with PPO against a reward model — the classic RLHF recipe." },
  { id: "LM_stable_diffusion_lora", title: "Stable Diffusion — LoRA / DreamBooth", task: "text-to-image fine-tuning", repo: "huggingface/diffusers", url: "https://huggingface.co/docs/diffusers/training/dreambooth", track: "LM · Language & multimodal", links: ["A", "B"], pipeline: "text-to-image", summary: "Teach Stable Diffusion a new concept with LoRA / DreamBooth, then generate." },
  { id: "LM_controlnet", title: "ControlNet — conditional diffusion", task: "structure-conditioned image generation", repo: "huggingface/diffusers", url: "https://huggingface.co/docs/diffusers/using-diffusers/controlnet", track: "LM · Language & multimodal", links: ["A", "B"], pipeline: "text-to-image", summary: "Steer Stable Diffusion with a structure map (edges / pose / depth)." },
  { id: "LM_vllm_serving", title: "Serve an LLM (vLLM)", task: "fast LLM serving / deployment", repo: "vllm-project/vllm", url: "https://github.com/vllm-project/vllm", track: "LM · Language & multimodal", links: ["A", "B", "C", "D"], pipeline: "text-generation", summary: "Deploy a (fine-tuned) LLM for fast, batched, OpenAI-compatible serving." },
  { id: "AG_llm_agent_tooluse", title: "LLM agent — tool use (ReAct)", task: "tool-using LLM agent", repo: "huggingface/transformers (function calling)", url: "https://huggingface.co/docs/transformers/main/en/chat_extras", track: "AG · Agents & RL", links: ["C", "D", "LM"], summary: "An LLM that reasons and calls tools in a loop (ReAct) to solve tasks." },
  { id: "AG_habitat_navigation", title: "Habitat — embodied navigation", task: "embodied RL navigation", repo: "facebookresearch/habitat-lab", url: "https://github.com/facebookresearch/habitat-lab", track: "AG · Agents & RL", links: ["D"], summary: "Train a PointGoal navigation agent in the Habitat 3D simulator." },
  // GPU/foundation labs in notebooks/training/ that aren't CPU-trained here → placeholders too
  { id: "B_nerf_from_scratch", dir: "training", title: "NeRF from scratch (tiny_nerf)", task: "neural radiance field", repo: "self-contained PyTorch (bmild tiny_nerf data)", url: "https://github.com/bmild/nerf", track: "B · 3D & rendering", links: ["D"], summary: "Train a NeRF from scratch — runs on the GPU in minutes (too slow to CPU-train here)." },
  { id: "CD_clip_zeroshot_probe", dir: "training", title: "CLIP: zero-shot vs. probe", task: "vision-language probing", repo: "open_clip", url: "https://github.com/mlfoundations/open_clip", track: "C · Egocentric vision", links: ["D", "LM"], summary: "CLIP zero-shot classification + a trained linear probe on frozen features." },
  { id: "C_videomae_finetune", dir: "training", title: "Fine-tune VideoMAE", task: "video action recognition", repo: "MCG-NJU/VideoMAE (🤗 transformers)", url: "https://huggingface.co/MCG-NJU/videomae-base", track: "C · Egocentric vision", links: ["A", "D"], summary: "Fine-tune the VideoMAE video transformer on a small action dataset." },
  { id: "C_dinov2_features_probe", dir: "training", title: "DINOv2 features + probe", task: "self-supervised features", repo: "facebookresearch/dinov2", url: "https://github.com/facebookresearch/dinov2", track: "C · Egocentric vision", links: ["B", "D"], summary: "DINOv2 patch-feature PCA (objects emerge) + a linear probe on CLS features." },
];

const SPACE = "https://huggingface.co/spaces/cy0307/ropedia-demos";
const PROFILE = "https://huggingface.co/cy0307";

// Per-lab professional fields: base model (+ HF id), objective, dataset+source,
// the exact metric the lab reports, and the original-method citation.
const PROF = {
  A_mdm_text_to_motion: { base: "Pretrained MDM checkpoint (or train from scratch)", obj: "DDPM denoising of motion sequences conditioned on text (CLIP) embeddings.", data: "HumanML3D — text↔motion pairs (~14k motions).", metric: "FID · R-precision@1/2/3 · Diversity", cite: "Tevet et al., *MDM*, ICLR 2023 (arXiv:2209.14916)." },
  A_4dhumans_mesh: { base: "HMR 2.0 / 4D-Humans (ViT-based, pretrained)", obj: "Regress SMPL pose+shape from image crops; track across video.", data: "Inference: your image/video. Training: H36M, 3DPW, COCO, InstaVariety.", metric: "PA-MPJPE / MPJPE (mm) · PCK", cite: "Goel et al., *Humans in 4D*, ICCV 2023." },
  B_gaussian_splatting_3d: { base: "From scratch — per-scene optimization", obj: "Photometric loss over differentiably-rasterized 3D Gaussians (+ densification).", data: "Your photos + COLMAP camera poses.", metric: "PSNR · SSIM · LPIPS (held-out views)", cite: "Kerbl et al., *3D Gaussian Splatting*, SIGGRAPH 2023." },
  B_nerfstudio_nerfacto: { base: "From scratch — per-scene (nerfacto / splatfacto)", obj: "Volumetric photometric loss with proposal sampling + hash encoding.", data: "Your phone video / image set.", metric: "PSNR · SSIM · LPIPS", cite: "Tancik et al., *Nerfstudio*, SIGGRAPH 2023." },
  C_videomae_egocentric: { base: "MCG-NJU/videomae-base (Kinetics-pretrained)", bm: "MCG-NJU/videomae-base", obj: "Supervised video-clip classification (fine-tune the pretrained ViT).", data: "EPIC-Kitchens-100 / Ego4D (demo: UCF101 subset).", metric: "top-1 / top-5 accuracy", cite: "Tong et al., *VideoMAE*, NeurIPS 2022." },
  C_sam2_video_segmentation: { base: "facebook/sam2-hiera-large (pretrained)", bm: "facebook/sam2-hiera-large", obj: "Promptable mask prediction + memory propagation across frames (inference).", data: "Your video + click/box prompts. Benchmark: DAVIS 2017 / SA-V.", metric: "J&F mean (region IoU + boundary F)", cite: "Ravi et al., *SAM 2*, 2024." },
  C_whisper_finetune: { base: "openai/whisper-tiny|base|large-v3 (pretrained)", bm: "openai/whisper-tiny", obj: "Seq2seq cross-entropy — transcribe audio to text.", data: "PolyAI/minds14 (demo); Common Voice / LibriSpeech (full).", metric: "WER (word error rate)", cite: "Radford et al., *Whisper*, 2022." },
  D_splatam_slam: { base: "From scratch — per-sequence", obj: "Joint camera tracking + Gaussian-map optimization (photometric + depth).", data: "Replica / TUM-RGBD / your RGB-D stream.", metric: "ATE RMSE (cm) · PSNR/SSIM/LPIPS", cite: "Keetha et al., *SplaTAM*, CVPR 2024." },
  D_dreamerv3_world_model: { base: "From scratch", obj: "Learn a latent world model; train an actor-critic inside imagination.", data: "Online env interaction (Crafter / DMC / Atari).", metric: "mean evaluation-episode return", cite: "Hafner et al., *DreamerV3*, 2023 (arXiv:2301.04104)." },
  LM_qlora_finetune_llm: { base: "Qwen/Qwen2.5-0.5B-Instruct in 4-bit (swap any base)", bm: "Qwen/Qwen2.5-0.5B-Instruct", obj: "Supervised instruction fine-tuning of LoRA adapters on a 4-bit base.", data: "mlabonne/guanaco-llama2-1k (or your own chat data).", metric: "held-out perplexity", cite: "Dettmers et al., *QLoRA*, NeurIPS 2023; Hu et al., *LoRA*, 2021." },
  LM_dpo_alignment: { base: "An SFT'd LLM (e.g. Qwen2.5-0.5B-Instruct, 4-bit)", bm: "Qwen/Qwen2.5-0.5B-Instruct", obj: "Direct Preference Optimization on chosen/rejected pairs (no reward model).", data: "trl-lib/ultrafeedback_binarized.", metric: "preference accuracy (eval_rewards/accuracies)", cite: "Rafailov et al., *DPO*, NeurIPS 2023." },
  LM_vlm_finetune: { base: "SmolVLM / Qwen2-VL (pretrained VLM)", bm: "HuggingFaceTB/SmolVLM-Instruct", obj: "Supervised fine-tuning for image-grounded question answering.", data: "HuggingFaceM4/ChartQA (or your VQA data).", metric: "held-out loss · VQA accuracy", cite: "Marafioti et al., *SmolVLM*, 2024; Wang et al., *Qwen2-VL*, 2024." },
  LM_videolm_qwen2vl: { base: "Qwen/Qwen2-VL-2B|7B-Instruct (pretrained)", bm: "Qwen/Qwen2-VL-2B-Instruct", obj: "Video-grounded next-token prediction (inference; optional LoRA SFT).", data: "Your clip (inference); video-instruction data for LoRA.", metric: "Video-MME / MVBench / EgoSchema accuracy", cite: "Wang et al., *Qwen2-VL*, 2024." },
  LM_rag_pipeline: { base: "BAAI/bge-small-en-v1.5 (embed) + Qwen2.5-0.5B-Instruct (gen)", bm: "BAAI/bge-small-en-v1.5", obj: "Embed → FAISS retrieve → ground the LLM's answer in retrieved passages.", data: "Your document corpus (demo: 6 docs).", metric: "retrieval recall@k", cite: "Lewis et al., *RAG*, NeurIPS 2020." },
  LM_eval_harness: { base: "Any LLM under test", obj: "Standardized benchmarking (log-likelihood / generation scoring).", data: "ARC, HellaSwag, MMLU, GSM8K, … (downloaded by the harness).", metric: "per-benchmark accuracy", cite: "Gao et al., *lm-evaluation-harness*, EleutherAI." },
  LM_unsloth_finetune: { base: "Unsloth 4-bit base (Llama / Qwen / Mistral …)", obj: "Fast LoRA SFT (~2× faster, less VRAM); GGUF export for serving.", data: "mlabonne/guanaco-llama2-1k (or your data).", metric: "held-out perplexity", cite: "Unsloth (Han et al.); Dettmers et al., *QLoRA*, 2023." },
  LM_rlhf_ppo: { base: "An SFT LLM + a reward model (demo: GPT-2 sentiment)", bm: "lvwerra/gpt2-imdb", obj: "PPO — maximize reward-model score with a KL penalty to the reference.", data: "Prompt set (demo: IMDB).", metric: "mean reward (+ KL-to-reference)", cite: "Ouyang et al., *InstructGPT*, 2022; Schulman et al., *PPO*, 2017." },
  LM_stable_diffusion_lora: { base: "runwayml/stable-diffusion-v1-5 (or SDXL)", bm: "runwayml/stable-diffusion-v1-5", obj: "LoRA / DreamBooth fine-tuning of the diffusion UNet on new concepts.", data: "Your subject/style images (a few–dozens).", metric: "FID · CLIP score (+ CLIP-I/DINO for subjects)", cite: "Rombach et al., *Latent Diffusion*, CVPR 2022; Hu et al., *LoRA*, 2021." },
  LM_controlnet: { base: "SD 1.5 / SDXL + a ControlNet (pretrained)", bm: "lllyasviel/sd-controlnet-canny", obj: "Structure-conditioned generation (edges / depth / pose) — inference.", data: "Your condition maps + prompts.", metric: "condition fidelity (edge IoU / depth err) · CLIP score", cite: "Zhang et al., *ControlNet*, ICCV 2023." },
  LM_vllm_serving: { base: "Any (fine-tuned) LLM you serve", obj: "High-throughput batched inference (PagedAttention) — no training.", data: "n/a (serving).", metric: "throughput (tok/s) · latency", cite: "Kwon et al., *vLLM / PagedAttention*, SOSP 2023." },
  AG_llm_agent_tooluse: { base: "Qwen/Qwen2.5-1.5B-Instruct (tool-calling)", bm: "Qwen/Qwen2.5-1.5B-Instruct", obj: "ReAct loop — the LLM reasons, calls tools, observes, and iterates.", data: "Task suite (the self-contained AG_agent_harness).", metric: "task success rate", cite: "Yao et al., *ReAct*, ICLR 2023; Schick et al., *Toolformer*, 2023." },
  AG_habitat_navigation: { base: "From scratch (DD-PPO policy)", obj: "On-policy RL (DD-PPO) for PointGoal navigation from sensors.", data: "HM3D / MP3D / Gibson scenes (+ Habitat test assets).", metric: "Success rate · SPL", cite: "Wijmans et al., *DD-PPO*, ICLR 2020; Savva et al., *Habitat*, ICCV 2019." },
  B_nerf_from_scratch: { base: "From scratch", obj: "Volume-rendering photometric loss through a positional-encoded MLP.", data: "tiny_nerf (bmild) — a single Lego scene (106 views).", metric: "PSNR (held-out views)", cite: "Mildenhall et al., *NeRF*, ECCV 2020." },
  CD_clip_zeroshot_probe: { base: "open_clip ViT-B/32 (pretrained)", obj: "Zero-shot classification via text prompts + a trained linear probe on frozen features.", data: "CIFAR-10 (probe / eval).", metric: "zero-shot accuracy · linear-probe accuracy", cite: "Radford et al., *CLIP*, ICML 2021." },
  C_videomae_finetune: { base: "MCG-NJU/videomae-base (Kinetics-pretrained)", bm: "MCG-NJU/videomae-base", obj: "Supervised video-clip classification (fine-tune).", data: "A small action dataset (UCF101 subset).", metric: "top-1 accuracy", cite: "Tong et al., *VideoMAE*, NeurIPS 2022." },
  C_dinov2_features_probe: { base: "facebook/dinov2 ViT (self-supervised, pretrained)", bm: "facebook/dinov2-base", obj: "Use frozen DINOv2 features: PCA of patch tokens + a linear probe on CLS.", data: "CIFAR-10 (probe / eval).", metric: "linear-probe accuracy", cite: "Oquab et al., *DINOv2*, 2023." },
};

function card(a) {
  const p = PROF[a.id] || {};
  const colab = `https://colab.research.google.com/github/${REPO}/blob/main/notebooks/${a.dir || "advanced"}/${a.id}.ipynb`;
  const tags = ["ropedia-academy", "advanced", "gpu", "todo", "embodied-ai", ...a.links.map((t) => "track-" + t.toLowerCase())];
  let fm = "---\nlicense: mit\n";
  if (a.pipeline) fm += `pipeline_tag: ${a.pipeline}\n`;
  if (p.bm) fm += `base_model: ${p.bm}\n`;
  fm += "tags:\n" + tags.map((t) => `- ${t}\n`).join("") + "---\n\n";
  const body =
`# ${a.title}  🚧 not trained yet

> ${a.summary}

**Status — documented recipe (placeholder).** A production-grade pipeline from **[Ropedia Academy](${ROPEDIA})** for an advanced, GPU-heavy task. Everything below — base model, objective, dataset, config, the exact evaluation — is specified; the **weights / metrics / figures** land here automatically when you run the notebook on a GPU (one click below). Try the trained models live in the **[Ropedia demos Space](${SPACE})**.

## At a glance

| | |
|---|---|
| **Base model** | ${p.base || "see notebook"} |
| **Task** | ${a.task} |
| **Training objective** | ${p.obj || "see notebook"} |
| **Track** | ${a.track} |
| **Built on** | [${a.repo}](${a.url}) |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](${colab}) |
| **Compute / storage / time** | GPU required — see the *Compute · storage · time* table in the notebook |

## Dataset
- **Source:** ${p.data || "see the notebook's data cell"}

## Training config
GPU-scale — the notebook ships a **demo** profile (free Colab T4) and a **full** profile, with an exact *Compute · storage · time* table. Hyperparameters (optimizer, steps, batch, LoRA rank, …) are in the training cell.

## Evaluation results
⏳ **Pending** — run the notebook on a GPU to fill this in. This lab reports **${p.metric || "its standard task metric"}** on a held-out split (see its *Evaluate* cell).

## Inference example
No weights are published yet. After a GPU run, load the checkpoint/adapter the notebook saves (it also has a ready inference cell). Base model: **${p.base || "see notebook"}**.

## How to fill this repo
1. Open the [notebook in Colab](${colab}) → **Runtime → GPU → Run all** (runs the real pipeline).
2. Run its **Publish to the Hugging Face Hub** step (or \`HfApi().upload_folder(...)\`) — the checkpoint + \`metrics.json\` + figures replace this placeholder.

- [ ] Train / run on a GPU · [ ] upload weights · [ ] add \`metrics.json\` · [ ] add figures · [ ] swap in the real results card

## Limitations
Not yet trained — no numbers to report. The pipeline is **GPU-heavy** (see the compute table); on free Colab use the demo-scale settings. This is an educational, reproducible recipe, not a tuned production release.

## License
Code: **MIT** (this repository). The **base model** ([${a.repo}](${a.url})) and **dataset** are each under their own licenses — check the upstream source before redistribution.

## Citation
\`\`\`bibtex
@misc{ropedia_academy,
  title  = {Ropedia Academy: an interactive course on embodied & spatial AI},
  author = {Ropedia Academy},
  year   = {2026},
  howpublished = {\\url{${ROPEDIA}}}
}
\`\`\`
${p.cite ? `\n**Method / original work:** ${p.cite}\n` : ""}
## Related assets
- 🚀 **Live demos:** [${SPACE}](${SPACE})
- 🤗 **All models + collection:** [${PROFILE}](${PROFILE})
- 📚 **Course & all labs:** [${ROPEDIA}](${ROPEDIA}) · [Labs tab](${ROPEDIA}labs)
- 💻 **Source / notebooks:** [github.com/${REPO}](https://github.com/${REPO})
- 🔗 **Relates to tracks:** ${a.links.join(" · ")}

---
*Documented placeholder in the [Ropedia Academy](${ROPEDIA}) collection — train it on a GPU to publish the real model. Contributions welcome on [GitHub](https://github.com/${REPO}).*
`;
  return fm + body;
}

let n = 0;
for (const a of ADV) {
  const dir = path.join(root, "models", a.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "README.md"), card(a));
  fs.writeFileSync(path.join(dir, "metrics.todo.json"), JSON.stringify({ status: "placeholder", trained: false, todo: ["train on GPU", "upload checkpoint", "add metrics.json", "add figures"] }, null, 2));
  n++;
}
console.log(`wrote ${n} advanced placeholder bundles into models/`);
