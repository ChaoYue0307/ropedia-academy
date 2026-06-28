import type { Bilingual } from "./types";

// Single catalog of every runnable training notebook, surfaced on the Labs page
// and (as a teaser) the dashboard. `level` and `track` drive the filter tags.
//  - level: "scratch"  = self-contained PyTorch, verified to train
//           "foundation" = applies a pretrained model on a Colab GPU
//           "advanced"   = heavy real-repo pipeline (GPU, not pre-executed)
export type LabLevel = "scratch" | "foundation" | "advanced";
export type LabTrack = "A" | "B" | "C" | "D" | "LM" | "AG";

export interface Lab {
  file: string;
  dir: "training" | "advanced";
  track: LabTrack;
  level: LabLevel;
  title: Bilingual;
  action: Bilingual; // what you do: Train / Fine-tune / Generate / ...
  note?: string; // repo or dataset hint
  links?: LabTrack[]; // related embodied tracks (used for the LM labs)
}

const REPO = "ChaoYue0307/ropedia-academy";
export const colabHref = (lab: Lab) =>
  `https://colab.research.google.com/github/${REPO}/blob/main/notebooks/${lab.dir}/${lab.file}`;
export const githubDir = (dir: "training" | "advanced") =>
  `https://github.com/${REPO}/tree/main/notebooks/${dir}`;

// Published Hugging Face model repos (cy0307/ropedia-<slug>); nanoGPT uses a nicer slug.
export const HF_USER = "cy0307";
export const hfSlug = (lab: Lab) =>
  "ropedia-" + (lab.file === "LM_nanogpt_pretrain.ipynb"
    ? "nanogpt-shakespeare"
    : lab.file.replace(/\.ipynb$/, "").toLowerCase().replace(/_/g, "-"));
export const hfUrl = (lab: Lab) => `https://huggingface.co/${HF_USER}/${hfSlug(lab)}`;
export const hfProfile = `https://huggingface.co/${HF_USER}`;
export const hfSpace = `https://huggingface.co/spaces/${HF_USER}/ropedia-demos`;

const T = (en: string, zh: string): Bilingual => ({ en, zh });

export const LABS: Lab[] = [
  // ── Track A · Human ───────────────────────────────────────────────
  { file: "A_smplify_fit.ipynb", dir: "training", track: "A", level: "scratch", title: T("Fit a body (SMPLify)", "拟合人体（SMPLify）"), action: T("Optimize", "优化"), links: ["C"] },
  { file: "A_motion_diffusion.ipynb", dir: "training", track: "A", level: "scratch", title: T("Motion diffusion model", "运动扩散模型"), action: T("Train", "训练"), links: ["LM", "AG"] },
  { file: "A_pose_heatmap.ipynb", dir: "training", track: "A", level: "scratch", title: T("2D pose (heatmap regression)", "2D 姿态（热图回归）"), action: T("Train", "训练"), links: ["C"] },
  { file: "A_rotation_6d.ipynb", dir: "training", track: "A", level: "scratch", title: T("6D vs Euler rotation", "6D vs 欧拉角旋转"), action: T("Train", "训练"), links: ["B", "D"] },
  { file: "A_mdm_text_to_motion.ipynb", dir: "advanced", track: "A", level: "advanced", title: T("MDM — text-to-motion", "MDM — 文本生成动作"), action: T("Generate", "生成"), note: "GuyTevet/motion-diffusion-model", links: ["LM", "AG"] },
  { file: "A_4dhumans_mesh.ipynb", dir: "advanced", track: "A", level: "advanced", title: T("4D-Humans — mesh from video", "4D-Humans — 视频重建人体"), action: T("Inference", "推理"), note: "shubham-goel/4D-Humans", links: ["C", "D"] },
  // ── Track B · 3D / rendering ──────────────────────────────────────
  { file: "B_nerf_from_scratch.ipynb", dir: "training", track: "B", level: "scratch", title: T("Train a NeRF from scratch", "从零训练 NeRF"), action: T("Train", "训练"), links: ["D"] },
  { file: "B_deepsdf_shape.ipynb", dir: "training", track: "B", level: "scratch", title: T("Neural SDF (DeepSDF-style)", "神经 SDF（DeepSDF）"), action: T("Train", "训练"), links: ["D"] },
  { file: "B_gaussian_splatting_2d.ipynb", dir: "training", track: "B", level: "scratch", title: T("2D Gaussian Splatting", "2D 高斯泼溅"), action: T("Train", "训练"), links: ["D"] },
  { file: "B_hashgrid_instngp.ipynb", dir: "training", track: "B", level: "scratch", title: T("Multiresolution hash grid (Instant-NGP)", "多分辨率哈希网格（Instant-NGP）"), action: T("Train", "训练"), links: ["D"] },
  { file: "B_icp_registration.ipynb", dir: "training", track: "B", level: "scratch", title: T("ICP point-cloud registration", "ICP 点云配准"), action: T("Optimize", "优化"), links: ["D"] },
  { file: "B_mae_pretrain.ipynb", dir: "training", track: "B", level: "scratch", title: T("Masked Autoencoder (MAE) pretraining", "掩码自编码（MAE）预训练"), action: T("Pretrain", "预训练"), links: ["C", "D"] },
  { file: "B_gaussian_splatting_3d.ipynb", dir: "advanced", track: "B", level: "advanced", title: T("3D Gaussian Splatting", "3D 高斯泼溅"), action: T("Train", "训练"), note: "graphdeco-inria/gaussian-splatting", links: ["D"] },
  { file: "B_nerfstudio_nerfacto.ipynb", dir: "advanced", track: "B", level: "advanced", title: T("Nerfstudio nerfacto", "Nerfstudio nerfacto"), action: T("Train", "训练"), note: "nerfstudio", links: ["D"] },
  // ── Track C · Egocentric ──────────────────────────────────────────
  { file: "CD_clip_zeroshot_probe.ipynb", dir: "training", track: "C", level: "foundation", title: T("CLIP: zero-shot vs. probe", "CLIP：零样本 vs. 探针"), action: T("Fine-tune", "微调"), links: ["D", "LM"] },
  { file: "C_videomae_finetune.ipynb", dir: "training", track: "C", level: "foundation", title: T("Fine-tune VideoMAE", "微调 VideoMAE"), action: T("Fine-tune", "微调"), links: ["A", "D"] },
  { file: "C_dinov2_features_probe.ipynb", dir: "training", track: "C", level: "foundation", title: T("DINOv2 features + probe", "DINOv2 特征 + 探针"), action: T("Fine-tune", "微调"), links: ["B", "D"] },
  { file: "C_action_anticipation_lstm.ipynb", dir: "training", track: "C", level: "scratch", title: T("Action anticipation (LSTM)", "动作预判（LSTM）"), action: T("Train", "训练"), links: ["D", "AG"] },
  { file: "C_simclr_pretrain.ipynb", dir: "training", track: "C", level: "scratch", title: T("SimCLR self-supervised pretraining", "SimCLR 自监督预训练"), action: T("Pretrain", "预训练"), links: ["B", "D"] },
  { file: "C_videomae_egocentric.ipynb", dir: "advanced", track: "C", level: "advanced", title: T("VideoMAE on EPIC/Ego4D", "VideoMAE 第一视角微调"), action: T("Fine-tune", "微调"), note: "EPIC-Kitchens / Ego4D", links: ["A", "D"] },
  { file: "C_sam2_video_segmentation.ipynb", dir: "advanced", track: "C", level: "advanced", title: T("SAM 2 — video segmentation", "SAM 2 — 视频分割"), action: T("Inference", "推理"), note: "facebookresearch/sam2", links: ["A", "D"] },
  // ── Track D · Scene / world ───────────────────────────────────────
  { file: "D_world_model.ipynb", dir: "training", track: "D", level: "scratch", title: T("World model + planning", "世界模型 + 规划"), action: T("Train", "训练"), links: ["AG"] },
  { file: "D_tsdf_fusion.ipynb", dir: "training", track: "D", level: "scratch", title: T("TSDF fusion → mesh", "TSDF 融合 → 网格"), action: T("Reconstruct", "重建"), links: ["B"] },
  { file: "D_semantic_mapping.ipynb", dir: "training", track: "D", level: "scratch", title: T("Bayesian semantic mapping", "贝叶斯语义建图"), action: T("Fuse", "融合"), links: ["C", "LM"] },
  { file: "D_splatam_slam.ipynb", dir: "advanced", track: "D", level: "advanced", title: T("SplaTAM — Gaussian SLAM", "SplaTAM — 高斯 SLAM"), action: T("Reconstruct", "重建"), note: "spla-tam/SplaTAM", links: ["B"] },
  { file: "D_dreamerv3_world_model.ipynb", dir: "advanced", track: "D", level: "advanced", title: T("DreamerV3 — world model", "DreamerV3 — 世界模型"), action: T("Train", "训练"), note: "danijar/dreamerv3", links: ["AG"] },
  // ── LM · Language & multimodal ────────────────────────────────────
  { file: "LM_nanogpt_pretrain.ipynb", dir: "training", track: "LM", level: "scratch", title: T("Train a GPT from scratch (nanoGPT)", "从零训练 GPT（nanoGPT）"), action: T("Pretrain", "预训练"), links: ["A", "B", "C", "D"] },
  { file: "LM_distillation.ipynb", dir: "training", track: "LM", level: "scratch", title: T("Knowledge distillation", "知识蒸馏"), action: T("Distill", "蒸馏"), links: ["A", "B", "C", "D"] },
  // — Agents & RL —
  { file: "AG_reinforce_gridworld.ipynb", dir: "training", track: "AG", level: "scratch", title: T("REINFORCE policy gradient", "REINFORCE 策略梯度"), action: T("Train", "训练"), links: ["D"] },
  { file: "AG_behavior_cloning.ipynb", dir: "training", track: "AG", level: "scratch", title: T("Behavior cloning (imitation)", "行为克隆（模仿学习）"), action: T("Train", "训练"), links: ["A", "D"] },
  { file: "AG_agent_harness.ipynb", dir: "training", track: "AG", level: "scratch", title: T("Agent + tool-use harness", "智能体 + 工具调用框架"), action: T("Harness", "框架"), links: ["C", "D", "LM"] },
  { file: "LM_qlora_finetune_llm.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("QLoRA — fine-tune an LLM", "QLoRA — 微调大语言模型"), action: T("Fine-tune", "微调"), note: "TRL + PEFT", links: ["A", "B", "C", "D"] },
  { file: "LM_dpo_alignment.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("DPO — align an LLM", "DPO — 偏好对齐"), action: T("Align", "对齐"), note: "TRL DPOTrainer", links: ["A", "D"] },
  { file: "LM_vlm_finetune.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("Fine-tune a VLM", "微调视觉语言模型"), action: T("Fine-tune", "微调"), note: "TRL + SmolVLM", links: ["C", "D"] },
  { file: "LM_videolm_qwen2vl.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("Video-LM (Qwen2-VL)", "视频语言模型（Qwen2-VL）"), action: T("Video QA", "视频问答"), note: "QwenLM/Qwen2-VL", links: ["A", "C"] },
  { file: "LM_rag_pipeline.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("RAG — retrieval-augmented generation", "RAG — 检索增强生成"), action: T("Retrieve + Generate", "检索 + 生成"), note: "sentence-transformers + FAISS", links: ["C", "D"] },
  { file: "LM_eval_harness.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("Evaluate an LLM (lm-eval-harness)", "评测大模型（lm-eval-harness）"), action: T("Evaluate", "评测"), note: "EleutherAI/lm-evaluation-harness", links: ["A", "B", "C", "D"] },
  { file: "LM_unsloth_finetune.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("Unsloth — fast LLM fine-tune", "Unsloth — 快速微调大模型"), action: T("Fine-tune (fast)", "快速微调"), note: "unslothai/unsloth", links: ["A", "B", "C", "D"] },
  { file: "LM_rlhf_ppo.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("RLHF — PPO fine-tuning", "RLHF — PPO 微调"), action: T("RL fine-tune", "强化微调"), note: "TRL PPOTrainer", links: ["A", "D"] },
  { file: "LM_stable_diffusion_lora.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("Stable Diffusion — LoRA / DreamBooth", "Stable Diffusion — LoRA / DreamBooth"), action: T("Fine-tune", "微调"), note: "diffusers", links: ["A", "B"] },
  { file: "LM_controlnet.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("ControlNet — conditional diffusion", "ControlNet — 条件扩散"), action: T("Generate", "生成"), note: "diffusers", links: ["A", "B"] },
  { file: "LM_vllm_serving.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("Serve an LLM (vLLM)", "部署大模型（vLLM）"), action: T("Serve", "部署"), note: "vLLM", links: ["A", "B", "C", "D"] },
  { file: "C_whisper_finetune.ipynb", dir: "advanced", track: "C", level: "advanced", title: T("Whisper — fine-tune ASR", "Whisper — 微调语音识别"), action: T("Fine-tune", "微调"), note: "transformers / Whisper", links: ["LM"] },
  { file: "AG_llm_agent_tooluse.ipynb", dir: "advanced", track: "AG", level: "advanced", title: T("LLM agent — tool use (ReAct)", "LLM 智能体 — 工具调用（ReAct）"), action: T("Agent", "智能体"), note: "transformers", links: ["C", "D", "LM"] },
  { file: "AG_habitat_navigation.ipynb", dir: "advanced", track: "AG", level: "advanced", title: T("Habitat — embodied navigation", "Habitat — 具身导航"), action: T("Embodied RL", "具身强化"), note: "habitat-lab", links: ["D"] },
];

export const TRACK_LABEL: Record<LabTrack, Bilingual> = {
  A: T("A · Human", "A · 人体"),
  B: T("B · 3D / rendering", "B · 三维 / 渲染"),
  C: T("C · Egocentric", "C · 第一视角"),
  D: T("D · Scene / world", "D · 场景 / 世界"),
  LM: T("LM · Language", "LM · 语言"),
  AG: T("AG · Agents & RL", "AG · 智能体 & 强化学习"),
};
export const TRACK_ACCENT: Record<LabTrack, string> = {
  A: "#e0796b", B: "#5a8bd6", C: "#5aa86a", D: "#a878d0", LM: "#6366f1", AG: "#0ea5a0",
};
export const LEVEL_LABEL: Record<LabLevel, Bilingual> = {
  scratch: T("From scratch · verified", "从零 · 已验证"),
  foundation: T("Foundation model", "基础模型"),
  advanced: T("Advanced · GPU", "进阶 · GPU"),
};

// Future explore directions — open projects that combine labs across tracks.
export interface FutureDirection {
  title: Bilingual;
  desc: Bilingual;
  links: LabTrack[];
}
export const FUTURE: FutureDirection[] = [
  {
    title: T("Unified embodied agent", "统一具身智能体"),
    desc: T("Chain SAM 2 + SLAM + a world model + an LLM agent into one loop that sees (egocentric), maps the scene, plans, and acts.",
            "把 SAM 2 + SLAM + 世界模型 + LLM 智能体串成一个闭环：第一视角感知、建图、规划、行动。"),
    links: ["C", "D", "AG", "LM"],
  },
  {
    title: T("4D human + scene capture", "4D 人体 + 场景捕捉"),
    desc: T("Jointly reconstruct the moving human (4D-Humans) and the scene (Gaussian Splatting) from a single video → editable 4D.",
            "从单段视频同时重建运动人体（4D-Humans）与场景（高斯泼溅）→ 可编辑的 4D。"),
    links: ["A", "B"],
  },
  {
    title: T("Open-vocabulary 3D scene graphs", "开放词表 3D 场景图"),
    desc: T("Fuse CLIP / DINOv2 features into a 3D map and scene graph you query in natural language (RAG over a scene).",
            "把 CLIP / DINOv2 特征融合进 3D 地图与场景图，用自然语言查询（对场景做 RAG）。"),
    links: ["C", "D", "LM"],
  },
  {
    title: T("Text-to-3D / text-to-4D", "文本生成 3D / 4D"),
    desc: T("Use diffusion priors (Stable Diffusion / ControlNet) to generate 3D Gaussians and motion from a prompt.",
            "用扩散先验（Stable Diffusion / ControlNet）从提示词生成 3D 高斯与运动。"),
    links: ["A", "B", "LM"],
  },
  {
    title: T("Egocentric video-language foundation model", "第一视角视频-语言基础模型"),
    desc: T("Pretrain (MAE / contrastive) on Ego4D, align to language, and serve it as a first-person assistant.",
            "在 Ego4D 上做（MAE / 对比）预训练，与语言对齐，作为第一视角助手部署。"),
    links: ["C", "LM"],
  },
  {
    title: T("World-model planning from pixels", "从像素学习世界模型并规划"),
    desc: T("Learn a latent world model of a reconstructed scene (Dreamer) and plan / act inside the imagination.",
            "对重建场景学习潜在世界模型（Dreamer），在想象中规划与行动。"),
    links: ["D", "AG", "B"],
  },
  {
    title: T("Diffusion policy for manipulation", "用于操作的扩散策略"),
    desc: T("Generate robot action sequences with a diffusion model — the motion-diffusion recipe applied to control.",
            "用扩散模型生成机器人动作序列——把运动扩散用于控制。"),
    links: ["A", "AG"],
  },
  {
    title: T("Sim-to-real embodied learning", "仿真到现实的具身学习"),
    desc: T("Train in Habitat, transfer to the real world, and close the loop with a learned world model.",
            "在 Habitat 中训练，迁移到真实世界，用学到的世界模型闭环。"),
    links: ["AG", "D"],
  },
  {
    title: T("On-device & self-improving loop", "端侧与自我改进闭环"),
    desc: T("Distill + quantize + serve (vLLM / Ollama); let an agent generate data and improve itself with DPO / RLHF.",
            "蒸馏 + 量化 + 部署（vLLM / Ollama）；让智能体自产数据，用 DPO / RLHF 自我改进。"),
    links: ["LM", "AG"],
  },
  {
    title: T("One model across modalities", "跨模态统一模型"),
    desc: T("A single transformer over pose, 3D, video, and language tokens — toward a unified embodied foundation model.",
            "一个 Transformer 统一处理姿态、3D、视频与语言 token——迈向统一的具身基础模型。"),
    links: ["A", "B", "C", "D", "LM"],
  },
];
