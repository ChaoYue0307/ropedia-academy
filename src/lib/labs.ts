import type { Bilingual } from "./types";

// Single catalog of every runnable training notebook, surfaced on the Labs page
// and (as a teaser) the dashboard. `level` and `track` drive the filter tags.
//  - level: "scratch"  = self-contained PyTorch, verified to train
//           "foundation" = applies a pretrained model on a Colab GPU
//           "advanced"   = heavy real-repo pipeline (GPU, not pre-executed)
export type LabLevel = "scratch" | "foundation" | "advanced";
export type LabTrack = "A" | "B" | "C" | "D" | "LM";

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

const T = (en: string, zh: string): Bilingual => ({ en, zh });

export const LABS: Lab[] = [
  // ── Track A · Human ───────────────────────────────────────────────
  { file: "A_smplify_fit.ipynb", dir: "training", track: "A", level: "scratch", title: T("Fit a body (SMPLify)", "拟合人体（SMPLify）"), action: T("Optimize", "优化") },
  { file: "A_motion_diffusion.ipynb", dir: "training", track: "A", level: "scratch", title: T("Motion diffusion model", "运动扩散模型"), action: T("Train", "训练") },
  { file: "A_pose_heatmap.ipynb", dir: "training", track: "A", level: "scratch", title: T("2D pose (heatmap regression)", "2D 姿态（热图回归）"), action: T("Train", "训练") },
  { file: "A_rotation_6d.ipynb", dir: "training", track: "A", level: "scratch", title: T("6D vs Euler rotation", "6D vs 欧拉角旋转"), action: T("Train", "训练") },
  { file: "A_mdm_text_to_motion.ipynb", dir: "advanced", track: "A", level: "advanced", title: T("MDM — text-to-motion", "MDM — 文本生成动作"), action: T("Generate", "生成"), note: "GuyTevet/motion-diffusion-model" },
  { file: "A_4dhumans_mesh.ipynb", dir: "advanced", track: "A", level: "advanced", title: T("4D-Humans — mesh from video", "4D-Humans — 视频重建人体"), action: T("Inference", "推理"), note: "shubham-goel/4D-Humans" },
  // ── Track B · 3D / rendering ──────────────────────────────────────
  { file: "B_nerf_from_scratch.ipynb", dir: "training", track: "B", level: "scratch", title: T("Train a NeRF from scratch", "从零训练 NeRF"), action: T("Train", "训练") },
  { file: "B_deepsdf_shape.ipynb", dir: "training", track: "B", level: "scratch", title: T("Neural SDF (DeepSDF-style)", "神经 SDF（DeepSDF）"), action: T("Train", "训练") },
  { file: "B_gaussian_splatting_2d.ipynb", dir: "training", track: "B", level: "scratch", title: T("2D Gaussian Splatting", "2D 高斯泼溅"), action: T("Train", "训练") },
  { file: "B_hashgrid_instngp.ipynb", dir: "training", track: "B", level: "scratch", title: T("Multiresolution hash grid (Instant-NGP)", "多分辨率哈希网格（Instant-NGP）"), action: T("Train", "训练") },
  { file: "B_icp_registration.ipynb", dir: "training", track: "B", level: "scratch", title: T("ICP point-cloud registration", "ICP 点云配准"), action: T("Optimize", "优化") },
  { file: "B_gaussian_splatting_3d.ipynb", dir: "advanced", track: "B", level: "advanced", title: T("3D Gaussian Splatting", "3D 高斯泼溅"), action: T("Train", "训练"), note: "graphdeco-inria/gaussian-splatting" },
  { file: "B_nerfstudio_nerfacto.ipynb", dir: "advanced", track: "B", level: "advanced", title: T("Nerfstudio nerfacto", "Nerfstudio nerfacto"), action: T("Train", "训练"), note: "nerfstudio" },
  // ── Track C · Egocentric ──────────────────────────────────────────
  { file: "CD_clip_zeroshot_probe.ipynb", dir: "training", track: "C", level: "foundation", title: T("CLIP: zero-shot vs. probe", "CLIP：零样本 vs. 探针"), action: T("Fine-tune", "微调") },
  { file: "C_videomae_finetune.ipynb", dir: "training", track: "C", level: "foundation", title: T("Fine-tune VideoMAE", "微调 VideoMAE"), action: T("Fine-tune", "微调") },
  { file: "C_dinov2_features_probe.ipynb", dir: "training", track: "C", level: "foundation", title: T("DINOv2 features + probe", "DINOv2 特征 + 探针"), action: T("Fine-tune", "微调") },
  { file: "C_action_anticipation_lstm.ipynb", dir: "training", track: "C", level: "scratch", title: T("Action anticipation (LSTM)", "动作预判（LSTM）"), action: T("Train", "训练") },
  { file: "C_videomae_egocentric.ipynb", dir: "advanced", track: "C", level: "advanced", title: T("VideoMAE on EPIC/Ego4D", "VideoMAE 第一视角微调"), action: T("Fine-tune", "微调"), note: "EPIC-Kitchens / Ego4D" },
  { file: "C_sam2_video_segmentation.ipynb", dir: "advanced", track: "C", level: "advanced", title: T("SAM 2 — video segmentation", "SAM 2 — 视频分割"), action: T("Inference", "推理"), note: "facebookresearch/sam2" },
  // ── Track D · Scene / world ───────────────────────────────────────
  { file: "D_world_model.ipynb", dir: "training", track: "D", level: "scratch", title: T("World model + planning", "世界模型 + 规划"), action: T("Train", "训练") },
  { file: "D_tsdf_fusion.ipynb", dir: "training", track: "D", level: "scratch", title: T("TSDF fusion → mesh", "TSDF 融合 → 网格"), action: T("Reconstruct", "重建") },
  { file: "D_semantic_mapping.ipynb", dir: "training", track: "D", level: "scratch", title: T("Bayesian semantic mapping", "贝叶斯语义建图"), action: T("Fuse", "融合") },
  { file: "D_splatam_slam.ipynb", dir: "advanced", track: "D", level: "advanced", title: T("SplaTAM — Gaussian SLAM", "SplaTAM — 高斯 SLAM"), action: T("Reconstruct", "重建"), note: "spla-tam/SplaTAM" },
  { file: "D_dreamerv3_world_model.ipynb", dir: "advanced", track: "D", level: "advanced", title: T("DreamerV3 — world model", "DreamerV3 — 世界模型"), action: T("Train", "训练"), note: "danijar/dreamerv3" },
  // ── LM · Language & multimodal ────────────────────────────────────
  { file: "LM_nanogpt_pretrain.ipynb", dir: "training", track: "LM", level: "scratch", title: T("Train a GPT from scratch (nanoGPT)", "从零训练 GPT（nanoGPT）"), action: T("Pretrain", "预训练"), links: ["A", "B", "C", "D"] },
  { file: "LM_qlora_finetune_llm.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("QLoRA — fine-tune an LLM", "QLoRA — 微调大语言模型"), action: T("Fine-tune", "微调"), note: "TRL + PEFT", links: ["A", "B", "C", "D"] },
  { file: "LM_dpo_alignment.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("DPO — align an LLM", "DPO — 偏好对齐"), action: T("Align", "对齐"), note: "TRL DPOTrainer", links: ["A", "D"] },
  { file: "LM_vlm_finetune.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("Fine-tune a VLM", "微调视觉语言模型"), action: T("Fine-tune", "微调"), note: "TRL + SmolVLM", links: ["C", "D"] },
  { file: "LM_videolm_qwen2vl.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("Video-LM (Qwen2-VL)", "视频语言模型（Qwen2-VL）"), action: T("Video QA", "视频问答"), note: "QwenLM/Qwen2-VL", links: ["A", "C"] },
  { file: "LM_rag_pipeline.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("RAG — retrieval-augmented generation", "RAG — 检索增强生成"), action: T("Retrieve + Generate", "检索 + 生成"), note: "sentence-transformers + FAISS", links: ["C", "D"] },
  { file: "LM_eval_harness.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("Evaluate an LLM (lm-eval-harness)", "评测大模型（lm-eval-harness）"), action: T("Evaluate", "评测"), note: "EleutherAI/lm-evaluation-harness", links: ["A", "B", "C", "D"] },
  { file: "LM_unsloth_finetune.ipynb", dir: "advanced", track: "LM", level: "advanced", title: T("Unsloth — fast LLM fine-tune", "Unsloth — 快速微调大模型"), action: T("Fine-tune (fast)", "快速微调"), note: "unslothai/unsloth", links: ["A", "B", "C", "D"] },
];

export const TRACK_LABEL: Record<LabTrack, Bilingual> = {
  A: T("A · Human", "A · 人体"),
  B: T("B · 3D / rendering", "B · 三维 / 渲染"),
  C: T("C · Egocentric", "C · 第一视角"),
  D: T("D · Scene / world", "D · 场景 / 世界"),
  LM: T("LM · Language", "LM · 语言"),
};
export const TRACK_ACCENT: Record<LabTrack, string> = {
  A: "#e0796b", B: "#5a8bd6", C: "#5aa86a", D: "#a878d0", LM: "#6366f1",
};
export const LEVEL_LABEL: Record<LabLevel, Bilingual> = {
  scratch: T("From scratch · verified", "从零 · 已验证"),
  foundation: T("Foundation model", "基础模型"),
  advanced: T("Advanced · GPU", "进阶 · GPU"),
};
