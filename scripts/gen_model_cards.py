"""Generate a comprehensive, professional model card (README.md) for every trained
bundle in models/. Each card includes: base model, training objective, dataset +
source, training config, evaluation results, inference example, limitations,
failure cases, license, citation, and reproducibility commands — plus rich
frontmatter (tags / pipeline_tag) for Hugging Face discoverability.

Run before uploading:  python scripts/gen_model_cards.py
"""
import os, glob, json

ROPEDIA = "https://chaoyue0307.github.io/ropedia-academy/"
REPO = "ChaoYue0307/ropedia-academy"
HF_USER = "cy0307"
SPACE = f"https://huggingface.co/spaces/{HF_USER}/ropedia-demos"
PROFILE = f"https://huggingface.co/{HF_USER}"

# bundle folder -> the lab notebook it came from (for the Colab link)
NOTEBOOK = {"nanogpt-shakespeare": "LM_nanogpt_pretrain"}

META = {
    "A_smplify_fit": dict(title="SMPLify body fit", task="3D human pose by 2D-keypoint reprojection", data="synthetic 2D keypoints", track="A · Human modeling", tags=["pose-estimation"], summary="An articulated body fit to 2D keypoints by reprojection optimization with a pose prior — the SMPLify recipe."),
    "A_motion_diffusion": dict(title="Motion diffusion (DDPM)", task="human-motion generation", data="synthetic 2D motion trajectories", track="A · Human modeling", tags=["diffusion"], summary="A denoising-diffusion model that generates motion trajectories — the MDM recipe, trained from scratch, sampled from EMA weights."),
    "A_pose_heatmap": dict(title="2D pose estimation (heatmap regression)", task="2D keypoint detection", data="synthetic articulated arm", track="A · Human modeling", tags=["keypoint-detection"], summary="A fully-convolutional net that predicts per-joint heatmaps, decoded to coordinates by soft-argmax. Best-checkpoint by PCK."),
    "A_rotation_6d": dict(title="6D vs Euler rotation regression", task="3D rotation regression", data="random SO(3) rotations", track="A · Human modeling", tags=["rotation"], summary="Shows the continuous 6D rotation representation is far easier for a network to regress than Euler angles."),
    "B_deepsdf_shape": dict(title="Neural SDF (DeepSDF-style)", task="implicit 3D shape", data="analytic torus samples", track="B · 3D & rendering", tags=["implicit-neural-representation"], summary="An MLP signed-distance field with an eikonal regularizer; the surface is its zero level set (marching cubes)."),
    "B_gaussian_splatting_2d": dict(title="2D Gaussian Splatting", task="differentiable image fitting", data="real photograph", track="B · 3D & rendering", tags=["gaussian-splatting"], summary="Reconstructs a real photograph with anisotropic 2D Gaussians (with densification) — the 2D analogue of 3D Gaussian Splatting."),
    "B_hashgrid_instngp": dict(title="Multiresolution hash grid (Instant-NGP)", task="differentiable image fitting", data="real photograph", track="B · 3D & rendering", tags=["instant-ngp"], summary="A multiresolution hash-grid feature encoding + tiny MLP that fits a real photograph to high PSNR — the trick that made NeRF ~1000× faster."),
    "B_icp_registration": dict(title="ICP point-cloud registration", task="rigid point-cloud alignment", data="synthetic 3D clouds", track="B · 3D & rendering", tags=["registration"], summary="Recovers a rigid transform between two point clouds with Iterative Closest Point (nearest-neighbour + Kabsch)."),
    "B_mae_pretrain": dict(title="Masked Autoencoder (MAE)", task="self-supervised pretraining", data="real handwritten digits (sklearn)", track="B · 3D & rendering", tags=["self-supervised"], summary="Masks half the image patches and reconstructs them on real handwritten digits — the MAE / VideoMAE pretraining objective; reports held-out reconstruction error."),
    "C_action_anticipation_lstm": dict(title="Action anticipation (LSTM)", task="next-action prediction", data="synthetic action grammar", track="C · Egocentric vision", tags=["sequence-modeling"], summary="An LSTM that anticipates the next action from a sequence, well above chance. Best-checkpoint by top-1."),
    "C_simclr_pretrain": dict(title="SimCLR self-supervised pretraining", task="contrastive representation learning", data="real handwritten digits (sklearn)", track="C · Egocentric vision", tags=["contrastive", "self-supervised"], summary="Contrastive (NT-Xent) pretraining on real handwritten digits with a large batch; a few-shot linear probe on the frozen features beats a random encoder on held-out digits."),
    "D_world_model": dict(title="World model + planning (CEM)", task="model-based control", data="2D point-mass environment", track="D · Scene & world models", tags=["reinforcement-learning"], summary="Learns environment dynamics, then plans with the Cross-Entropy Method to reach a goal inside imagination."),
    "D_tsdf_fusion": dict(title="TSDF fusion → mesh", task="dense 3D reconstruction", data="multi-view synthetic depth", track="D · Scene & world models", tags=["reconstruction"], summary="Fuses multi-view depth into a truncated SDF volume and extracts a mesh with marching cubes."),
    "D_semantic_mapping": dict(title="Bayesian semantic mapping", task="occupancy + semantic mapping", data="2D grid world", track="D · Scene & world models", tags=["mapping"], summary="Fuses noisy observations into an occupancy (log-odds) + semantic-label map that converges to ground truth."),
    "AG_reinforce_gridworld": dict(title="REINFORCE / actor-critic (CartPole)", task="reinforcement learning", data="Gymnasium CartPole-v1", track="AG · Agents & RL", tags=["reinforcement-learning"], summary="A policy-gradient agent with a value baseline + entropy bonus that solves the Gymnasium CartPole-v1 benchmark (greedy return near the 500 maximum).", pipeline="reinforcement-learning"),
    "AG_behavior_cloning": dict(title="Behavior cloning (imitation)", task="imitation learning", data="expert gridworld demos", track="AG · Agents & RL", tags=["imitation-learning"], summary="A policy trained by supervised imitation of expert demonstrations; 100% rollout success."),
    "AG_agent_harness": dict(title="Agent + tool-use harness", task="agent evaluation", data="tool-use task suite", track="AG · Agents & RL", tags=["agent"], summary="A reusable harness: a tool registry, a tool-using agent loop, a task suite, and a scorer."),
    "LM_distillation": dict(title="Knowledge distillation", task="model compression", data="real handwritten digits (sklearn)", track="LM · Language & models", tags=["knowledge-distillation"], summary="On real handwritten digits, a small student trained on a teacher's soft predictions over all data nearly matches the teacher and beats one trained on only a few hard labels."),
    "nanogpt-shakespeare": dict(title="nanoGPT — Tiny Shakespeare", task="text-generation", data="Tiny Shakespeare (~1 MB)", track="LM · Language & models", tags=["text-generation", "gpt"], summary="A character-level GPT (decoder-only transformer) trained from scratch; best-checkpoint by validation loss.", pipeline="text-generation"),
}

DATA = {
    "nanogpt-shakespeare": dict(name="Tiny Shakespeare", kind="real (public-domain text)", stats="1,115,394 characters (~1.1 MB); 65-character vocabulary", split="90% train / 10% val", source="https://github.com/karpathy/char-rnn (data/tinyshakespeare)"),
    "A_smplify_fit": dict(name="Synthetic 2D keypoints", kind="synthetic — procedural, generated in the notebook", stats="1 articulated skeleton (12 joints) → 12 projected 2D keypoints + Gaussian noise", split="single instance (per-image optimization)", source="procedural"),
    "A_motion_diffusion": dict(name="Synthetic motion trajectories", kind="synthetic — procedural", stats="4,096 looping 2D trajectories, 32 timesteps × 2 = 64-D each (varied radius/phase/noise)", split="train only (generative model)", source="procedural"),
    "A_pose_heatmap": dict(name="Synthetic 3-joint arm", kind="synthetic — procedural", stats="48×48 grayscale images, 3 joints; fresh 16-image batches per step (effectively unlimited)", split="fresh train + held-out eval batches", source="procedural"),
    "A_rotation_6d": dict(name="Random SO(3) rotations", kind="synthetic — procedural", stats="uniform rotations via random quaternions; input = rotation applied to 8 fixed 3D points (24-D); 256/batch", split="generative (infinite)", source="procedural"),
    "B_deepsdf_shape": dict(name="Analytic torus SDF", kind="synthetic — procedural", stats="4,096 samples/step (½ uniform in [-1.1,1.1]³, ½ near-surface); SD targets clamped to ±0.1", split="generative (infinite)", source="procedural (analytic torus)"),
    "B_gaussian_splatting_2d": dict(name="Real photograph (astronaut)", kind="real — public-domain image", stats="1 RGB photo resized to 64×64; ~500 Gaussians (densified to ~650)", split="single image (overfit)", source="scikit-image data.astronaut() (NASA, public domain)"),
    "B_hashgrid_instngp": dict(name="Real photograph (astronaut)", kind="real — public-domain image", stats="1 RGB photo resized to 96×96; 8-level hash grid (2^14 entries/level)", split="single image (overfit)", source="scikit-image data.astronaut() (NASA, public domain)"),
    "B_icp_registration": dict(name="Synthetic point clouds", kind="synthetic — procedural", stats="two linked rings (~800 points, 3-D); target = source under a known rigid transform + 0.01 noise", split="1 source/target pair", source="procedural"),
    "B_mae_pretrain": dict(name="Handwritten digits (UCI / scikit-learn)", kind="real — public dataset", stats="1,797 real 8×8 grayscale digit images; 16 patches of 2×2, 50% masked; 128/batch", split="1,257 train / 540 test (held-out reconstruction)", source="scikit-learn load_digits (UCI Optical Recognition of Handwritten Digits)"),
    "C_action_anticipation_lstm": dict(name="Synthetic action grammar", kind="synthetic — procedural", stats="length-12 sequences over 6 verbs (take/wash/cut/cook/pour/place) from a Markov matrix; 128/batch", split="fresh train + 512 eval", source="procedural"),
    "C_simclr_pretrain": dict(name="Handwritten digits (UCI / scikit-learn)", kind="real — public dataset", stats="1,797 real 8×8 digit images, 10 classes; 256/batch contrastive (unlabeled); probe = 100 labelled / 540 test", split="1,257 train / 540 test; few-shot linear probe", source="scikit-learn load_digits (UCI Optical Recognition of Handwritten Digits)"),
    "D_world_model": dict(name="2D point-mass rollouts", kind="synthetic — procedural env", stats="60,000 transitions (3,000 random starts × 20 steps); state 4-D [x,y,vx,vy], action 2-D", split="train only", source="procedural env"),
    "D_tsdf_fusion": dict(name="Synthetic depth views", kind="synthetic — procedural", stats="1 scene (two spheres); 6 orthographic depth maps fused into a 64³ TSDF grid", split="single scene", source="procedural"),
    "D_semantic_mapping": dict(name="2D grid world", kind="synthetic — procedural", stats="32×32 cells, 4 semantic classes; ~60 noisy observations/step (p_occ=0.8, p_label=0.7)", split="single map", source="procedural"),
    "AG_reinforce_gridworld": dict(name="Gymnasium CartPole-v1", kind="standard RL benchmark environment (no fixed dataset)", stats="4-D continuous state, 2 discrete actions; reward +1/step, episode cap 500; agent learns from its own rollouts", split="online RL; greedy eval over 20 episodes", source="Gymnasium (Farama Foundation) CartPole-v1"),
    "AG_behavior_cloning": dict(name="Expert gridworld demos", kind="synthetic — procedural", stats="~2,000 (state → expert action) pairs on a 6×6 grid (greedy expert)", split="train; eval = rollout success from every cell", source="procedural"),
    "AG_agent_harness": dict(name="Tool-use task suite", kind="synthetic — procedural", stats="5 graded tasks (arithmetic + string ops) with ground-truth answers", split="eval suite", source="procedural"),
    "LM_distillation": dict(name="Handwritten digits (UCI / scikit-learn)", kind="real — public dataset", stats="1,797 real 8×8 digit images (64-D), 10 classes; the plain student sees only 100 labels, the distilled one learns from the teacher's soft targets over all 1,257", split="1,257 train / 540 test", source="scikit-learn load_digits (UCI Optical Recognition of Handwritten Digits)"),
}

# Base model — all 19 are trained from scratch (random init); overridable.
BASE_DEFAULT = "Trained **from scratch** (random initialization) — no pretrained base model."
BASE = {}

OBJECTIVE = {
    "A_smplify_fit": "Minimize 2D-keypoint **reprojection error** + a pose prior, optimizing the body's joint angles & root (the SMPLify recipe).",
    "A_motion_diffusion": "**DDPM** denoising objective (predict the added noise) over motion trajectories; sample from an EMA of the weights.",
    "A_pose_heatmap": "Per-joint **Gaussian heatmap regression** (MSE), decoded to coordinates by soft-argmax; best checkpoint by PCK.",
    "A_rotation_6d": "Regress 3D rotations under a **geodesic loss**, comparing the continuous **6D** parameterization against Euler angles.",
    "B_deepsdf_shape": "Regress a **signed distance field** (clamped L1) with an **eikonal** gradient regularizer; surface = zero level set.",
    "B_gaussian_splatting_2d": "**Photometric L2** between the splatted render and the target image, with gradient-based **densification**.",
    "B_hashgrid_instngp": "**Photometric L2** image fitting through a multiresolution **hash-grid** encoding + a tiny MLP.",
    "B_icp_registration": "**Iterative Closest Point**: nearest-neighbour correspondences + Kabsch rigid solve, minimizing point-to-point RMSE.",
    "B_mae_pretrain": "**Masked patch reconstruction** (MSE on masked tokens) — self-supervised pretraining.",
    "C_action_anticipation_lstm": "**Next-action classification** (cross-entropy) over sequences; best checkpoint by top-1 accuracy.",
    "C_simclr_pretrain": "**NT-Xent contrastive loss** on two augmented views; a frozen linear probe measures the learned features.",
    "D_world_model": "Supervised **one-step dynamics** prediction (MSE); planning by the **Cross-Entropy Method (CEM)**.",
    "D_tsdf_fusion": "**TSDF integration** of multi-view depth (no gradient training); mesh via marching cubes.",
    "D_semantic_mapping": "**Bayesian** log-odds occupancy + per-cell semantic-label counting (no gradient training).",
    "AG_reinforce_gridworld": "**REINFORCE** policy gradient with a **value baseline** + entropy bonus (actor-critic).",
    "AG_behavior_cloning": "**Supervised imitation** — cross-entropy of the expert's actions (behavior cloning).",
    "AG_agent_harness": "No training — a tool-use agent **loop + scorer** (an evaluation harness).",
    "LM_distillation": "**Knowledge distillation** — KL between student and teacher softened logits at temperature T.",
    "nanogpt-shakespeare": "**Autoregressive next-token prediction** (cross-entropy); best checkpoint by validation loss.",
}

CONFIG = {
    "A_smplify_fit": "Adam (lr 0.05), 400 optimization steps over body pose (joint angles + root). `STEPS` env-overridable.",
    "A_motion_diffusion": "DDPM; Adam (lr 2e-4), 4000 steps, sequence length 32; EMA of weights for sampling. `STEPS` env-overridable.",
    "A_pose_heatmap": "Adam (lr 1e-3), 1500 steps; 48×48 input, 3 joints; heatmap MSE + soft-argmax; best checkpoint by PCK.",
    "A_rotation_6d": "Adam (lr 1e-3), 3000 steps; geodesic rotation loss; two heads (6D vs Euler) compared.",
    "B_deepsdf_shape": "Adam (lr 1e-3), 2000 steps; SD targets clamped to ±0.1 + eikonal regularizer; near-surface sampling.",
    "B_gaussian_splatting_2d": "Adam (lr 0.02), 800 steps; 500 Gaussians, gradient-based densification (→ ~650); 64×64 target.",
    "B_hashgrid_instngp": "Adam (lr 1e-2), 1500 steps; 8-level hash grid (2¹⁴ entries × 2 feats/level) + 2-layer MLP; 96×96.",
    "B_icp_registration": "Iterative Closest Point — nearest-neighbour correspondences + Kabsch SVD per iteration (no SGD).",
    "B_mae_pretrain": "Adam (lr 1e-3), 1200 steps, batch 128; 16 patches of 2×2, 50% masked; 2-layer transformer enc/dec.",
    "C_action_anticipation_lstm": "Adam (lr 3e-3), 1500 steps; LSTM over length-12 sequences, 6-verb vocab; best by top-1.",
    "C_simclr_pretrain": "Adam (lr 1e-3, cosine), 1000 steps, batch 256; NT-Xent τ=0.5; linear probe Adam (lr 1e-2, 100 labels).",
    "D_world_model": "Adam (lr 1e-3), 1500 steps for the dynamics model; planning by Cross-Entropy Method (CEM).",
    "D_tsdf_fusion": "No training — TSDF integration of 6 depth views into a 64³ grid; marching cubes for the mesh.",
    "D_semantic_mapping": "No gradient training — Bayesian log-odds occupancy + label counting over ~300 observation rounds.",
    "AG_reinforce_gridworld": "Actor-critic; Adam (lr 3e-3), 600 episodes, γ=0.99, entropy 0.01, value baseline. `EPISODES` env-overridable.",
    "AG_behavior_cloning": "Adam (lr 3e-3), 800 steps; cross-entropy on ~2k expert (state→action) pairs; 6×6 grid.",
    "AG_agent_harness": "No training — a tool registry + ReAct-style loop + scorer over a 5-task suite.",
    "LM_distillation": "Teacher: Adam (lr 2e-3), 800 steps. Student: Adam (lr 3e-3), 1500 steps; KL distillation at T=4 (loss ×16).",
    "nanogpt-shakespeare": "AdamW (lr 3e-4, weight-decay 0.1), 3000 steps; char-level decoder-only transformer; best by val loss.",
}

# Per-metric one-liners so "Evaluation results" reads honestly.
METRIC_HELP = {
    "probe_simclr": "linear-probe accuracy on held-out digits using SimCLR features (higher = better)",
    "probe_random": "same probe on an untrained encoder — the baseline SimCLR must beat",
    "test_recon_mse": "held-out masked-patch reconstruction MSE (lower = better)",
    "teacher": "teacher test accuracy on held-out digits",
    "greedy_eval": "mean return of the greedy policy over 20 CartPole episodes (max 500)",
    "rollout_success": "fraction of start states from which the policy reaches the goal",
    "success_rate": "fraction of agent tasks solved with the correct final answer",
}

LIMIT_DEFAULT = ("**Educational scale.** Trained quickly on CPU on small or synthetic data, so absolute numbers are "
                 "not competitive with production systems — the value is the *method* and a reproducible pipeline. "
                 "No large-scale data, no hyperparameter sweep, and no multi-seed variance is reported. **Not for production use.**")
LIMIT = {
    "B_gaussian_splatting_2d": "Overfits a **single image** — it does not generalize to other images; quality is capped by the Gaussian count.",
    "B_hashgrid_instngp": "Overfits a **single image**; hash collisions limit the highest-frequency detail; PSNR is generous on smooth images.",
    "C_simclr_pretrain": "Features are learned on **8×8 digits** — they will not transfer to natural images; needs a large batch to work.",
    "B_mae_pretrain": "Tiny model on **8×8 digits** → blurry reconstructions; not a general visual encoder.",
    "LM_distillation": "On **8×8 digits**; the gain shrinks if the task is easy or the student is large; sensitive to temperature.",
    "AG_reinforce_gridworld": "Solves **CartPole only** — not a general control policy; on-policy and high-variance.",
    "nanogpt-shakespeare": "Character-level and tiny → no long-range coherence; it imitates Shakespearean *style*, not meaning.",
    "D_world_model": "Single 2D point-mass; one-step model errors compound over long horizons.",
}

FAIL = {
    "A_smplify_fit": "Sensitive to initialization & 2D-keypoint noise; can settle into a flipped or locally-optimal pose without a strong prior.",
    "A_motion_diffusion": "Too few sampling steps or no EMA → jittery/averaged motions; mode collapse with too little data.",
    "A_pose_heatmap": "Soft-argmax drifts when joints overlap or leave the frame; the low-resolution heatmap caps precision.",
    "A_rotation_6d": "The Euler baseline fails near gimbal lock / the ±180° wrap (a representation discontinuity) — exactly what 6D fixes.",
    "B_deepsdf_shape": "Clamping the *prediction* (not just the target) zeroes gradients (saturation); a too-high-frequency encoding overfits noise.",
    "B_gaussian_splatting_2d": "Without densification, large flat regions stay blurry; over-large σ washes the image out.",
    "B_hashgrid_instngp": "Hash collisions cause speckle at the finest levels; fitting succeeds on one image but says nothing about others.",
    "B_icp_registration": "Converges to the wrong alignment under a large initial rotation or low overlap (needs a coarse/global init).",
    "B_mae_pretrain": "A high mask ratio with only 16 patches removes too much context → over-smoothed fills.",
    "C_action_anticipation_lstm": "Falls back to the most-likely next token under distribution shift; can't anticipate rare transitions.",
    "C_simclr_pretrain": "Wrong augmentations (e.g. horizontal flips on digits) destroy the signal; collapses with too-weak/too-strong augmentation.",
    "D_world_model": "CEM plans poorly when the learned model is queried off-distribution; errors compound over the horizon.",
    "D_tsdf_fusion": "Sparse views leave holes; a bad truncation distance breaks or over-smooths the surface (marching-cubes arrays need `.copy()`).",
    "D_semantic_mapping": "Mis-set sensor probabilities make the map over/under-confident; dynamic objects smear across cells.",
    "AG_reinforce_gridworld": "High-variance gradients; a length-1 episode gives a NaN advantage (std 0) — fixed with `unbiased=False` + grad clipping; stalls without the entropy bonus.",
    "AG_behavior_cloning": "Compounding error / distribution shift once it leaves the expert's states (no recovery) — needs DAgger to fix.",
    "AG_agent_harness": "Only as strong as the task suite & scorer; brittle tool-call parsing; doesn't probe long-horizon planning.",
    "LM_distillation": "No benefit if the task is too easy or the student is already big enough; a wrong temperature washes out or over-sharpens the soft targets.",
    "nanogpt-shakespeare": "Repetition, invented words, and no factual grounding — a small char-LM memorizes style, not content.",
}

CITE = {
    "A_smplify_fit": "Bogo et al., *Keep it SMPL (SMPLify)*, ECCV 2016.",
    "A_motion_diffusion": "Tevet et al., *Human Motion Diffusion Model (MDM)*, ICLR 2023 (arXiv:2209.14916); Ho et al., *DDPM*, NeurIPS 2020.",
    "A_pose_heatmap": "Newell et al., *Stacked Hourglass*, ECCV 2016; Sun et al., *HRNet*, CVPR 2019.",
    "A_rotation_6d": "Zhou et al., *On the Continuity of Rotation Representations in Neural Networks*, CVPR 2019.",
    "B_deepsdf_shape": "Park et al., *DeepSDF*, CVPR 2019; Gropp et al., *Implicit Geometric Regularization (eikonal)*, ICML 2020.",
    "B_gaussian_splatting_2d": "Kerbl et al., *3D Gaussian Splatting for Real-Time Radiance Field Rendering*, SIGGRAPH 2023.",
    "B_hashgrid_instngp": "Müller et al., *Instant Neural Graphics Primitives (Instant-NGP)*, SIGGRAPH 2022.",
    "B_icp_registration": "Besl & McKay, *A Method for Registration of 3-D Shapes (ICP)*, 1992; Arun et al. (Kabsch), 1987.",
    "B_mae_pretrain": "He et al., *Masked Autoencoders Are Scalable Vision Learners (MAE)*, CVPR 2022; Tong et al., *VideoMAE*, NeurIPS 2022.",
    "C_action_anticipation_lstm": "Hochreiter & Schmidhuber, *Long Short-Term Memory*, 1997; Furnari & Farinella, *RU-LSTM*, ICCV 2019.",
    "C_simclr_pretrain": "Chen et al., *A Simple Framework for Contrastive Learning (SimCLR)*, ICML 2020.",
    "D_world_model": "Ha & Schmidhuber, *World Models*, NeurIPS 2018; Rubinstein, *The Cross-Entropy Method*, 1999.",
    "D_tsdf_fusion": "Curless & Levoy, *A Volumetric Method (TSDF)*, SIGGRAPH 1996; Lorensen & Cline, *Marching Cubes*, 1987.",
    "D_semantic_mapping": "Moravec & Elfes, *High-Resolution Maps from Wide-Angle Sonar (occupancy grids)*, 1985; McCormac et al., *SemanticFusion*, ICRA 2017.",
    "AG_reinforce_gridworld": "Williams, *REINFORCE*, 1992; Sutton et al., *Policy Gradient Methods*, NeurIPS 1999; Brockman et al., *OpenAI Gym*, 2016.",
    "AG_behavior_cloning": "Pomerleau, *ALVINN*, 1988; Ross et al., *DAgger*, AISTATS 2011.",
    "AG_agent_harness": "Yao et al., *ReAct*, ICLR 2023; Schick et al., *Toolformer*, 2023.",
    "LM_distillation": "Hinton, Vinyals & Dean, *Distilling the Knowledge in a Neural Network*, NeurIPS-W 2015.",
    "nanogpt-shakespeare": "Vaswani et al., *Attention Is All You Need*, NeurIPS 2017; Karpathy, *nanoGPT*.",
}

# Tailored inference snippets for flagship repos; others get a generic one built from the checkpoint file.
INFER = {
    "C_simclr_pretrain": """import torch, torch.nn as nn
enc = nn.Sequential(nn.Conv2d(1,32,3,1,1), nn.ReLU(), nn.MaxPool2d(2),
                    nn.Conv2d(32,64,3,1,1), nn.ReLU(), nn.AdaptiveAvgPool2d(1), nn.Flatten())
enc.load_state_dict(torch.load("encoder.pt", map_location="cpu")); enc.eval()
# images: (N,1,8,8) float in [0,1]  ->  features = enc(images)   # (N, 64)""",
    "LM_distillation": """import torch, torch.nn as nn
teacher = nn.Sequential(nn.Linear(64,256), nn.ReLU(), nn.Linear(256,256), nn.ReLU(), nn.Linear(256,10))
teacher.load_state_dict(torch.load("teacher.pt", map_location="cpu")); teacher.eval()
# x: flattened 8x8 digit /16.0, shape (N,64)  ->  logits = teacher(x); pred = logits.argmax(-1)""",
    "AG_reinforce_gridworld": """import torch, torch.nn as nn
policy = nn.Sequential(nn.Linear(4,64), nn.Tanh(), nn.Linear(64,2))
policy.load_state_dict(torch.load("policy.pt", map_location="cpu")); policy.eval()
# CartPole state s = [x, x_dot, theta, theta_dot]
# action = int(policy(torch.tensor(s, dtype=torch.float32)).argmax())   # 0 = push left, 1 = push right""",
    "B_gaussian_splatting_2d": """import torch
g = torch.load("gaussians.pt", map_location="cpu")   # dict: pos, logs, rot, col, op
# Re-create render() from the notebook (see "Reproduce") and call it on these tensors
# to reconstruct the fitted image.""",
    "nanogpt-shakespeare": """import torch
sd = torch.load("gpt.pt", map_location="cpu")   # decoder-only transformer weights
# Rebuild the GPT class + char vocab from the notebook (see "Reproduce"), then:
# model.load_state_dict(sd); model.eval()
# print(decode(model.generate(torch.zeros((1,1), dtype=torch.long), 500)[0].tolist()))
# (A pre-generated sample is included as sample.txt.)""",
}


def data_license(d):
    s = (d or {}).get("source", "").lower()
    if "scikit-learn" in s or "sklearn" in s:
        return "Handwritten-digits data: UCI ML Repository via scikit-learn — CC BY 4.0."
    if "astronaut" in s or "scikit-image" in s:
        return "Image: *astronaut* test image (NASA) — public domain, shipped with scikit-image."
    if "char-rnn" in s or "shakespeare" in s:
        return "Text: Tiny Shakespeare — public domain."
    if "gymnasium" in s:
        return "Environment: Gymnasium (Farama Foundation) — MIT license."
    return "Data: generated procedurally in the notebook — no external dataset."


def finals(d, prefix=""):
    """Flatten metrics to {label: final_scalar}."""
    out = {}
    for k, v in d.items():
        if k == "seeds":   # rendered separately as a Robustness section
            continue
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


def ckpt_file(folder):
    for ext in ("*.pt", "*.npy", "*.npz"):
        hits = sorted(glob.glob(os.path.join(folder, ext)))
        if hits:
            return os.path.basename(hits[0])
    return "model.pt"


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
    d = DATA.get(name)
    ck = ckpt_file(folder)

    # ── frontmatter (discoverability) ──
    fm = "---\nlicense: mit\nlibrary_name: pytorch\n"
    if meta.get("pipeline"):
        fm += f"pipeline_tag: {meta['pipeline']}\n"
    tags = ["ropedia-academy", "educational", "embodied-ai", "from-scratch", "reproducible"] + meta.get("tags", [])
    fm += "tags:\n" + "".join(f"- {t}\n" for t in dict.fromkeys(tags)) + "---\n\n"

    b = [f"# {meta['title']}\n", "> " + meta["summary"] + "\n"]
    b.append(f"Trained from scratch in **[Ropedia Academy]({ROPEDIA})** — an interactive, bilingual course on embodied & spatial AI. "
             "**Educational model:** small and quick to train; the value is the *method* and a reproducible pipeline, not a leaderboard score. "
             f"Try it live in the **[Ropedia demos Space]({SPACE})**.\n")

    # ── at a glance ──
    b.append("## At a glance\n")
    b.append("| | |\n|---|---|\n"
             f"| **Base model** | {BASE.get(name, BASE_DEFAULT)} |\n"
             f"| **Task** | {meta['task']} |\n"
             f"| **Training objective** | {OBJECTIVE.get(name, '—')} |\n"
             f"| **Track** | {meta['track']} |\n"
             f"| **Notebook** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)]({colab}) |\n")

    # ── dataset ──
    if d:
        b.append("## Dataset\n")
        b.append(f"- **Name:** {d['name']}\n- **Type:** {d['kind']}\n- **Size / stats:** {d['stats']}\n"
                 f"- **Split:** {d['split']}\n- **Source:** {d['source']}\n")

    # ── training config ──
    b.append("## Training config\n")
    b.append(CONFIG.get(name, "See the notebook for the exact optimizer, steps and hyperparameters.") + "\n")

    # ── evaluation results ──
    if fin:
        b.append("## Evaluation results\n")
        rows = "".join(
            f"| `{k}` | {round(v, 4) if isinstance(v, float) else v} | {METRIC_HELP.get(k.split(' ')[0], '')} |\n"
            for k, v in fin.items())
        b.append("| metric | value | meaning |\n|---|---|---|\n" + rows)
    pngs = sorted(os.path.basename(p) for p in glob.glob(os.path.join(folder, "*.png")) if os.path.basename(p) != "seeds.png")
    if pngs:
        b.append("\n" + "\n".join(f"![{os.path.splitext(p)[0]}]({p})" for p in pngs) + "\n")

    seeds = metrics.get("seeds")
    if isinstance(seeds, dict):
        n = seeds.get("n", "?")
        b.append(f"## Robustness (mean ± std over {n} seeds)\n")
        b.append("Single-run numbers above are one seed; this is the distribution over independent re-trains "
                 "(honest variance — no cherry-picking).\n\n")
        rows = "".join(f"| `{k}` | {v['mean']:.4g} ± {v['std']:.2g} |\n"
                       for k, v in seeds.items() if isinstance(v, dict) and "mean" in v)
        b.append("| metric | mean ± std |\n|---|---|\n" + rows)
        if os.path.exists(os.path.join(folder, "seeds.png")):
            b.append("\n![seeds](seeds.png)\n")

    sp = os.path.join(folder, "sample.txt")
    if os.path.exists(sp):
        b.append("## Sample output\n\n```\n" + open(sp).read()[:600].rstrip() + "\n```\n")

    # ── inference example ──
    snippet = INFER.get(name) or (
        f'import torch\nstate = torch.load("{ck}", map_location="cpu")   # this repo\'s checkpoint\n'
        f'# Rebuild the exact module from the lab notebook (see "Reproduce"), then:\n'
        f'# model.load_state_dict(state); model.eval()')
    b.append("## Inference example\n\n```python\n" + snippet + "\n```\n")

    # ── limitations & failure cases ──
    b.append("## Limitations\n")
    b.append(LIMIT_DEFAULT + (("\n\n" + LIMIT[name]) if name in LIMIT else "") + "\n")
    b.append("## Failure cases\n")
    b.append(FAIL.get(name, "Small-scale model — expect degraded behaviour off the training distribution.") + "\n")

    # ── reproducibility ──
    b.append("## Reproduce / train your own\n")
    b.append("**One click:** open the notebook in Colab → **Runtime → GPU → Run all**, then run its *Publish to the Hugging Face Hub* cell.\n\n"
             "[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](" + colab + ")\n\n"
             "**From a shell:**\n```bash\n"
             f"git clone https://github.com/{REPO}.git && cd ropedia-academy\n"
             "pip install torch numpy matplotlib scikit-learn scikit-image gymnasium\n"
             f"jupyter nbconvert --to notebook --execute notebooks/training/{nb}.ipynb --output run.ipynb\n"
             "# optional: override training length, e.g.  STEPS=2000  (or EPISODES=600)  before running\n"
             "```\n")

    # ── files ──
    files = sorted(os.path.basename(p) for p in glob.glob(os.path.join(folder, "*")) if os.path.basename(p) != "README.md")
    b.append("## Files\n\n" + "".join(f"- `{f}`\n" for f in files) + "\n")

    # ── license ──
    b.append("## License\n")
    b.append("Code & weights: **MIT** (this repository) — educational use encouraged.  \n" + data_license(d) + "\n")

    # ── citation ──
    b.append("## Citation\n")
    b.append("If you use this model or the course materials, please cite:\n\n```bibtex\n"
             "@misc{ropedia_academy,\n  title  = {Ropedia Academy: an interactive course on embodied & spatial AI},\n"
             "  author = {Ropedia Academy},\n  year   = {2026},\n  howpublished = {\\url{" + ROPEDIA + "}}\n}\n```\n")
    if name in CITE:
        b.append("\n**Method / original work:** " + CITE[name] + "\n")

    # ── related assets ──
    b.append("## Related assets\n")
    b.append(f"- 🚀 **Live demos:** [{SPACE}]({SPACE})\n"
             f"- 🤗 **All trained models + collection:** [{PROFILE}]({PROFILE})\n"
             f"- 📚 **Course & all labs:** [{ROPEDIA}]({ROPEDIA}) · [Labs tab]({ROPEDIA}labs)\n"
             f"- 💻 **Source / notebooks:** [github.com/{REPO}](https://github.com/{REPO})\n")

    b.append(f"\n---\n*Part of the [Ropedia Academy]({ROPEDIA}) trained-model collection. "
             "Contributions & issues welcome on [GitHub](https://github.com/" + REPO + ").*\n")

    open(os.path.join(folder, "README.md"), "w").write(fm + "\n".join(b))
    return name


if __name__ == "__main__":
    for folder in sorted(glob.glob("models/*")):
        if not os.path.isdir(folder):
            continue
        if os.path.exists(os.path.join(folder, "metrics.todo.json")):
            print("skip (placeholder) ->", os.path.basename(folder)); continue
        print("card ->", card(folder))
