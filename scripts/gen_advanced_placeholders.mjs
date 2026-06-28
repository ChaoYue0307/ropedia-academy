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
];

function card(a) {
  const colab = `https://colab.research.google.com/github/${REPO}/blob/main/notebooks/advanced/${a.id}.ipynb`;
  const tags = ["ropedia-academy", "advanced", "todo", ...a.links.map((t) => "track-" + t.toLowerCase())];
  let fm = "---\nlicense: mit\n";
  if (a.pipeline) fm += `pipeline_tag: ${a.pipeline}\n`;
  fm += "tags:\n" + tags.map((t) => `- ${t}\n`).join("") + "---\n\n";
  const body =
`# ${a.title}  🚧 placeholder

> **Status — not trained yet.** This is a *documented placeholder* for an advanced, GPU-heavy pipeline from **[Ropedia Academy](${ROPEDIA})**. The checkpoint, metrics and plots are **TODO** — train it on a GPU (link below) and the weights + a full results card land here.

${a.summary}

| | |
|---|---|
| **Task** | ${a.task} |
| **Built on** | [${a.repo}](${a.url}) |
| **Track** | ${a.track} |
| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](${colab}) |
| **Compute / storage / time** | see the *Compute · storage · time* table inside the notebook (GPU required) |

## How to fill this repo
1. Open the [notebook in Colab](${colab}) → **Runtime → GPU → Run all** (trains/runs the real pipeline).
2. Run its **Publish to the Hugging Face Hub** step (or \`HfApi().upload_folder(...)\`) to push the checkpoint + metrics + plots here, replacing this placeholder.

## TODO
- [ ] Train / run on a GPU (see the notebook)
- [ ] Upload the checkpoint / adapter weights
- [ ] Add \`metrics.json\` (loss / eval history)
- [ ] Add result figures & sample outputs
- [ ] Replace this placeholder card with the real results

## Results
_TODO — add final metrics and plots after training. (Placeholder.)_

## Links to tracks A–D
Relates to: **${a.links.join(" · ")}** — see the *How this links to tracks A–D* note in the notebook.

---
*Placeholder in the [Ropedia Academy](${ROPEDIA}) trained-model collection. Browse all labs in the [Labs tab](${ROPEDIA}labs).*
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
