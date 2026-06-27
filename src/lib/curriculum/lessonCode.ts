import type { Bilingual } from "../types";

// Each lesson's snippet also lives as a runnable notebook in /notebooks,
// opened straight from the public repo via Colab's GitHub bridge (no login to
// read; one click to run). Keep in sync with scripts/gen-notebooks.mjs.
export const colabUrl = (id: string) =>
  `https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/${id}.ipynb`;

// A focused Python/PyTorch snippet per lesson — the core idea as code.
// Comments are English (universal for code); the `note` is bilingual.
export const lessonCode: Record<string, { code: string; note: Bilingual }> = {
  // ===================== Track A — Human Modeling =====================
  A1: {
    code: `import torch

V = 6890
# Learned bases (loaded from the SMPL model file)
v_template = torch.randn(V, 3)
shape_dirs = torch.randn(V, 3, 10)          # 10 shape PCA components

# Predict just ~10 shape coefficients -> a full body shape
beta = torch.randn(10)
v_shaped = v_template + torch.einsum('vij,j->vi', shape_dirs, beta)
print(v_shaped.shape)   # (6890, 3) -- a valid mesh from 10 numbers
# pose theta (24 joint rotations) then poses it via linear blend skinning`,
    note: {
      en: "SMPL turns ~80 numbers (shape β + pose θ) into a full mesh — here β alone shapes 6890 vertices.",
      zh: "SMPL 把约 80 个数（形状 β + 姿态 θ）变成完整网格——这里仅 β 就塑造了 6890 个顶点。",
    },
  },
  A2: {
    code: `import torch, torch.nn.functional as F

# heatmap (H,W) per keypoint -> sub-pixel coordinate, differentiably
def soft_argmax(heatmap):
    H, W = heatmap.shape
    p = F.softmax(heatmap.flatten(), 0).view(H, W)
    xs = torch.arange(W).float(); ys = torch.arange(H).float()
    x = (p.sum(0) * xs).sum()      # expected column
    y = (p.sum(1) * ys).sum()      # expected row
    return torch.stack([x, y])     # gradients flow -> trainable`,
    note: {
      en: "Heatmaps beat raw-coordinate regression; soft-argmax turns one into a differentiable keypoint.",
      zh: "热图优于直接回归坐标；soft-argmax 把热图变成可微的关键点。",
    },
  },
  A3: {
    code: `import torch, torch.nn as nn

# encode a pose SEQUENCE, not one frame: temporal convolutions over time
T, J = 32, 24 * 3                  # 32 frames, 24 joints (xyz)
seq = torch.randn(1, J, T)         # (batch, channels=joints, time)
net = nn.Sequential(
    nn.Conv1d(J, 128, 3, padding=1), nn.ReLU(),
    nn.Conv1d(128, 128, 3, padding=1), nn.ReLU(),
    nn.AdaptiveAvgPool1d(1))
motion_feat = net(seq).squeeze(-1)  # (1,128): what the body is DOING`,
    note: {
      en: "Static pose is a snapshot; a temporal backbone encodes the movement itself.",
      zh: "静态姿态是快照；时序骨干编码运动本身。",
    },
  },
  A4: {
    code: `import torch

# train 3D mesh recovery with only 2D labels, via a reprojection loss
def project(X, K):                  # X: (N,3) camera-space points
    x = (K @ X.T).T
    return x[:, :2] / x[:, 2:3]     # perspective divide -> pixels

joints3d = model(image)            # predicted SMPL joints (N,3)
loss = ((project(joints3d, K) - keypoints2d) ** 2).sum()
loss.backward()                    # abundant 2D supervision shapes the 3D`,
    note: {
      en: "Reprojection loss: render predicted 3D back to 2D and match plentiful 2D keypoints.",
      zh: "重投影损失：把预测的 3D 投影回 2D，匹配大量的 2D 关键点。",
    },
  },
  A5: {
    code: `import torch

# MANO (hands) and FLAME (face) reuse the SMPL recipe -- same code, new bases
def parametric_model(beta, theta, template, shape_dirs, skin):
    v = template + torch.einsum('vij,j->vi', shape_dirs, beta)  # identity
    return skin(v, theta)                                        # articulate

hand = parametric_model(beta_h, theta_h, MANO.template, MANO.shape_dirs, lbs)
face = parametric_model(beta_f, theta_f, FLAME.template, FLAME.shape_dirs, lbs)
# learn SMPL once; MANO / FLAME are the same idea specialized`,
    note: {
      en: "Hands (MANO) and face (FLAME) are the SMPL recipe specialized — same code path.",
      zh: "手（MANO）与脸（FLAME）是 SMPL 配方的特化——同一套代码路径。",
    },
  },
  A6: {
    code: `import torch, torch.nn.functional as F

# networks regress rotations poorly in <=4 dims (discontinuous);
# predict 6D and Gram-Schmidt it into a valid rotation matrix
def sixd_to_matrix(d6):            # d6: (...,6)
    a1, a2 = d6[..., :3], d6[..., 3:]
    b1 = F.normalize(a1, dim=-1)
    b2 = F.normalize(a2 - (b1 * a2).sum(-1, keepdim=True) * b1, dim=-1)
    b3 = torch.cross(b1, b2, dim=-1)
    return torch.stack([b1, b2, b3], dim=-1)   # (...,3,3) rotation`,
    note: {
      en: "A continuous 6D rotation (then Gram-Schmidt) is what a network should regress.",
      zh: "连续的 6D 旋转（再 Gram-Schmidt）才是网络应回归的。",
    },
  },
  A7: {
    code: `import torch

# generate motion by iteratively denoising -- one reverse diffusion step
def p_sample(model, x_t, t, a, a_bar):
    eps = model(x_t, t)                                  # predicted noise
    mean = a[t].rsqrt() * (x_t - (1 - a[t]) / (1 - a_bar[t]).sqrt() * eps)
    noise = (t > 0) * (1 - a[t]).sqrt() * torch.randn_like(x_t)
    return mean + noise
# x_T = noise (T, J) -> repeat p_sample -> a coherent motion sequence`,
    note: {
      en: "Motion diffusion denoises random noise into a coherent, controllable motion sequence.",
      zh: "运动扩散把随机噪声去噪为连贯、可控的运动序列。",
    },
  },
  A8: {
    code: `import torch

# bodies must be supported and must not interpenetrate the scene
def contact_penetration_loss(verts, floor_y, scene_sdf):
    feet = verts[FOOT_IDX]
    contact = (feet[:, 1] - floor_y).clamp(min=0).mean()   # feet on floor
    penetration = (-scene_sdf(verts)).clamp(min=0).mean()  # inside scene
    return contact + penetration
# physics gives 3D supervision for free -- no labels required`,
    note: {
      en: "Contact + non-penetration constraints are free physical supervision from the scene.",
      zh: "接触 + 非穿插约束，是来自场景的免费物理监督。",
    },
  },
  A9: {
    code: `import torch

# fit SMPL to one clip by OPTIMIZING its parameters (no training data)
beta = torch.zeros(10, requires_grad=True)
theta = torch.zeros(72, requires_grad=True)
opt = torch.optim.Adam([beta, theta], lr=0.05)
for step in range(200):
    opt.zero_grad()
    joints3d = smpl(beta, theta)
    loss = reprojection(joints3d, kp2d, K) + pose_prior(theta)
    loss.backward(); opt.step()        # gradient descent fits the body`,
    note: {
      en: "SMPLify = directly optimize β,θ to match 2D keypoints plus a pose prior.",
      zh: "SMPLify = 直接优化 β,θ 以匹配 2D 关键点加姿态先验。",
    },
  },

  // ===================== Track B — 3D / Neural Rendering =====================
  B1: {
    code: `import numpy as np

# a 3D point -> a pixel:  x ~ K [R|t] X
K = np.array([[800, 0, 320], [0, 800, 240], [0, 0, 1.]])
R, t = np.eye(3), np.array([0, 0, 0.])
X = np.array([0.2, -0.1, 3.0])         # world point
uv = K @ (R @ X + t)
uv = uv[:2] / uv[2]                     # perspective divide -> pixel
print(uv)   # every point on the ray X*s maps here: depth is discarded`,
    note: {
      en: "Projection x ~ K[R|t]X is many-to-one: a whole ray maps to one pixel, so depth is lost.",
      zh: "投影 x ~ K[R|t]X 是多对一：整条射线映到一个像素，深度因此丢失。",
    },
  },
  B2: {
    code: `import numpy as np

# recover a 3D point from its pixels in two views (intersect the rays)
def triangulate(P1, P2, x1, x2):       # P: 3x4 cameras, x: (u, v)
    A = np.stack([
        x1[0] * P1[2] - P1[0], x1[1] * P1[2] - P1[1],
        x2[0] * P2[2] - P2[0], x2[1] * P2[2] - P2[1]])
    _, _, Vt = np.linalg.svd(A)
    X = Vt[-1]
    return X[:3] / X[3]                 # homogeneous -> 3D`,
    note: {
      en: "Two views + one correspondence intersect to recover the 3D point (linear triangulation).",
      zh: "两个视图 + 一对对应交会，恢复出 3D 点（线性三角测量）。",
    },
  },
  B3: {
    code: `import torch

# bundle adjustment jointly refines ALL cameras and points
poses = torch.zeros(C, 6, requires_grad=True)    # camera params
points = torch.randn(P, 3, requires_grad=True)   # 3D points
opt = torch.optim.Adam([poses, points], lr=1e-2)
for _ in range(100):
    opt.zero_grad()
    pred = project(points, poses, K)             # (obs, 2)
    loss = ((pred - observed_uv) ** 2).sum()     # total reprojection error
    loss.backward(); opt.step()`,
    note: {
      en: "BA = one big least-squares over all poses + points, minimizing reprojection error.",
      zh: "BA = 对所有位姿 + 点的一个大型最小二乘，最小化重投影误差。",
    },
  },
  B4: {
    code: `import torch
import torch.nn.functional as F

# geometry as a function: signed distance; surface = zero level-set
def sphere_sdf(p, c, r):
    return (p - c).norm(dim=-1) - r            # <0 inside, 0 on surface

p = torch.randn(1000, 3, requires_grad=True)
d = sphere_sdf(p, torch.zeros(3), 1.0)
normal = torch.autograd.grad(d.sum(), p)[0]    # the gradient is the normal
normal = F.normalize(normal, dim=-1)`,
    note: {
      en: "An SDF stores geometry as a function; the surface is {f=0} and ∇f gives normals.",
      zh: "SDF 把几何存为函数；曲面是 {f=0}，∇f 给出法向。",
    },
  },
  B5: {
    code: `import torch

# integrate color along a ray: front-to-back alpha compositing
def render(sigma, color, delta):       # samples along one ray
    alpha = 1 - torch.exp(-sigma * delta)          # per-sample opacity
    T = torch.cumprod(1 - alpha + 1e-10, 0)        # accumulated transmittance
    T = torch.cat([torch.ones(1), T[:-1]])
    w = T * alpha                                  # sample weights
    return (w[:, None] * color).sum(0)            # final pixel color`,
    note: {
      en: "Differentiable volume rendering = a weighted sum along the ray; gradients train the MLP from photos.",
      zh: "可微体渲染 = 沿射线的加权和；梯度从照片训练 MLP。",
    },
  },
  B6: {
    code: `import torch

# Instant-NGP: features live in hashed grids; a tiny MLP reads them
def hash_encode(x, tables, resolutions):     # x in [0,1]^3
    feats = []
    for table, res in zip(tables, resolutions):
        c = (x * res).long()                          # grid cell
        idx = ((c[..., 0] * 2654435761) ^ (c[..., 1] * 805459861)
               ^ c[..., 2]) % table.shape[0]          # spatial hash
        feats.append(table[idx])                      # learnable feature
    return torch.cat(feats, -1)                       # -> small MLP`,
    note: {
      en: "Moving capacity into a hashed feature grid (not a big MLP) trains NeRF in seconds.",
      zh: "把容量移入哈希特征网格（而非大 MLP），让 NeRF 以秒计训练。",
    },
  },
  B7: {
    code: `import torch

# a scene = many 3D Gaussians; "splat" = project each to the image
def project_gaussian(mu, cov3d, K, R, t):
    p = R @ mu + t                              # camera space
    J = projection_jacobian(p, K)              # affine approximation
    cov2d = J @ R @ cov3d @ R.T @ J.T          # 2D covariance
    uv = (K @ p)[:2] / p[2]                     # 2D mean
    return uv, cov2d   # then rasterize + alpha-blend front-to-back`,
    note: {
      en: "3DGS projects each 3D Gaussian to a 2D splat and rasterizes — why it renders in real time.",
      zh: "3DGS 把每个 3D 高斯投影为 2D 泼溅并光栅化——因此能实时渲染。",
    },
  },
  B8: {
    code: `import torch

# a dynamic scene = a static canonical model + a time deformation field
def render_at_time(x, t, deform_mlp, canonical, view_dir):
    dx = deform_mlp(torch.cat([x, t.expand_as(x[..., :1])], -1))
    x_canonical = x + dx               # warp the time-t point into rest pose
    return canonical(x_canonical, view_dir)   # appearance shared over time`,
    note: {
      en: "4D reconstruction shares one canonical model across time; only the deformation is time-varying.",
      zh: "四维重建让所有时刻共享一个标准模型，只有形变随时间变化。",
    },
  },
  B9: {
    code: `import torch

# one NeRF training step: render rays, compare to real pixels, backprop
opt = torch.optim.Adam(nerf.parameters(), lr=5e-4)
for rays, gt_rgb in loader:                  # posed pixels
    pts, dirs, delta = sample_along_rays(rays)
    sigma, color = nerf(pts, dirs)
    pred = render(sigma, color, delta)        # volume rendering (B5)
    loss = ((pred - gt_rgb) ** 2).mean()      # photometric loss
    opt.zero_grad(); loss.backward(); opt.step()`,
    note: {
      en: "NeRF training is just a photometric loss flowing back through differentiable rendering.",
      zh: "NeRF 训练不过是光度损失经可微渲染反向传播。",
    },
  },

  // ===================== Track C — Egocentric Vision =====================
  C1: {
    code: `import torch

# in first-person video the CAMERA moves with the actor: motion is huge
def ego_motion(frame_prev, frame_cur):    # (3,H,W) tensors in [0,1]
    return (frame_cur - frame_prev).abs().mean()   # crude global motion

# big head motion is signal (where the wearer attends), not just noise`,
    note: {
      en: "The head-worn camera moves with the actor — that motion encodes attention, not just nuisance.",
      zh: "头戴相机随行动者移动——这运动编码了注意力，而非纯干扰。",
    },
  },
  C2: {
    code: `from collections import Counter

# EPIC actions = (verb, noun); the class distribution is long-tailed
anns = [("cut", "onion"), ("take", "knife"), ("cut", "onion"), ("wash", "plate")]
actions = [f"{v}:{n}" for v, n in anns]
print(Counter(actions).most_common())   # a few frequent, a long rare tail
# evaluate on held-out PARTICIPANTS/kitchens, never a random frame split`,
    note: {
      en: "Action = (verb, noun); distributions are long-tailed and splits must hold out whole kitchens.",
      zh: "动作 =（动词，名词）；分布长尾，划分须留出整个厨房。",
    },
  },
  C3: {
    code: `import torch

# tube masking: hide the SAME spatial patches across ALL frames
T, N = 16, 14 * 14                # frames, spatial patches per frame
keep = int(0.1 * N)              # keep ~10% (mask ~90%)
vis = torch.randperm(N)[:keep]   # one mask, shared over time
mask = torch.ones(T, N, dtype=torch.bool)
mask[:, vis] = False
# can't copy a patch from a neighbouring frame -> must learn real structure`,
    note: {
      en: "VideoMAE's tube masking hides patches across time, so ~90% masking forces real understanding.",
      zh: "VideoMAE 的管状掩码跨时间隐藏块，约 90% 的掩码逼出真正的理解。",
    },
  },
  C4: {
    code: `import torch

# the future is multi-modal: score top-k, not top-1
def topk_correct(logits, target, k=5):
    topk = logits.topk(k, dim=-1).indices
    return (topk == target[:, None]).any(-1).float().mean()

probs = torch.softmax(model(video_before_action), -1)
print(topk_correct(probs, true_next_action, k=5))`,
    note: {
      en: "Anticipation is multi-modal — reward covering the plausible set with a top-k metric.",
      zh: "预判是多模态的——用 top-k 指标奖励覆盖合理集合。",
    },
  },
  C5: {
    code: `# the wearer's own hands enter from the bottom edge -- a strong prior
def is_own_hand(box, H):           # box = (x1, y1, x2, y2)
    return box[3] > 0.8 * H         # bottom of box near the frame bottom

def side(box, W):                  # left vs right by horizontal position
    return "left" if (box[0] + box[2]) / 2 < W / 2 else "right"`,
    note: {
      en: "First-person geometry: own hands enter from the bottom — a strong prior for detection.",
      zh: "第一人称几何：自己的手从底部进入——检测的强先验。",
    },
  },
  C6: {
    code: `import torch

# the ONE object being manipulated = closest to the hand and in contact
def active_object(hand_box, obj_boxes):
    hc = box_center(hand_box)
    d = torch.stack([(hc - box_center(o)).norm() for o in obj_boxes])
    i = int(d.argmin())
    in_contact = iou(hand_box, obj_boxes[i]) > 0.1
    return i, in_contact          # collapses a cluttered scene to 1 object`,
    note: {
      en: "The 'active object' filters a cluttered scene down to the one thing the hand is acting on.",
      zh: "「活动物体」把杂乱场景过滤为手正在作用的唯一物体。",
    },
  },
  C7: {
    code: `import torch

# gaze tells the model WHERE to look: weight features by a gaze gaussian
def gaze_pool(feat, gaze_xy, sigma=0.1):     # feat (C,H,W), gaze in [0,1]^2
    H, W = feat.shape[1:]
    ys = torch.linspace(0, 1, H)[:, None]
    xs = torch.linspace(0, 1, W)[None, :]
    g = torch.exp(-(((xs - gaze_xy[0]) ** 2 + (ys - gaze_xy[1]) ** 2)) / (2 * sigma ** 2))
    g = g / g.sum()
    return (feat * g).sum((1, 2))            # gaze-weighted feature`,
    note: {
      en: "Gaze is an attention map: pool features around the fixation the wearer is about to act on.",
      zh: "注视即注意力图：在佩戴者将要操作的注视点周围汇聚特征。",
    },
  },
  C8: {
    code: `import torch

# tasks follow scripts: a learned transition prior over the next action
trans = torch.zeros(A, A)            # trans[i, j] = P(next=j | cur=i)
for prev, nxt in transitions:        # count from data
    trans[prev, nxt] += 1
trans = trans / trans.sum(-1, keepdim=True)
next_dist = trans[current_action]    # a strong prior for anticipation`,
    note: {
      en: "An action grammar (transition prior) sharply constrains what comes next.",
      zh: "动作语法（转移先验）强烈约束接下来会发生什么。",
    },
  },
  C9: {
    code: `import torch, torch.nn as nn

# honest baseline: frozen backbone features + a small trained head
feats = backbone(clips).detach()          # (N, D) precomputed, frozen
head = nn.Linear(feats.shape[1], n_verbs)
opt = torch.optim.Adam(head.parameters(), 1e-3)
for _ in range(epochs):
    loss = nn.functional.cross_entropy(head(feats), verb_labels)
    opt.zero_grad(); loss.backward(); opt.step()
# a number you trust -- then swap in your own idea`,
    note: {
      en: "A frozen backbone + a small head is the simplest honest baseline you can extend.",
      zh: "冻结骨干 + 一个小头部，是你能扩展的最简诚实基线。",
    },
  },

  // ===================== Track D — Scene & World Models =====================
  D1: {
    code: `import numpy as np

# odometry drifts; loop closure redistributes the gap around the loop
poses = np.cumsum(rel_motions, axis=0)         # integrate -> drift
gap = poses[-1] - poses[0]                      # should be ~0 for a loop
n = len(poses)
corrected = poses - np.linspace(0, 1, n)[:, None] * gap   # close the loop`,
    note: {
      en: "Loop closure spreads the accumulated drift gap back over the whole trajectory.",
      zh: "回环把累积的漂移闭合误差，沿整条轨迹重新分配。",
    },
  },
  D2: {
    code: `import cv2

# track the camera each frame: pose from known 3D map points <-> 2D
ok, rvec, tvec = cv2.solvePnP(points3d, points2d, K, None)
R, _ = cv2.Rodrigues(rvec)         # camera rotation
# this is Track B geometry (PnP), now run online inside SLAM`,
    note: {
      en: "SLAM tracking is PnP — the same Track B geometry, run online frame by frame.",
      zh: "SLAM 跟踪就是 PnP——同样的 Track B 几何，逐帧在线运行。",
    },
  },
  D3: {
    code: `# fuse many noisy depth frames into one surface (weighted running mean)
def integrate(tsdf, w, sdf_new, trunc):
    sdf_new = max(-1.0, min(1.0, sdf_new / trunc))   # truncate near surface
    tsdf = (w * tsdf + sdf_new) / (w + 1)            # weighted average
    return tsdf, w + 1                                # noise cancels over frames
# surface = zero-crossing of the fused TSDF (Marching Cubes)`,
    note: {
      en: "TSDF fusion = a weighted average of signed distances; independent noise cancels across frames.",
      zh: "TSDF 融合 = 符号距离的加权平均；独立噪声跨帧相消。",
    },
  },
  D4: {
    code: `import torch

# fuse 2D segmentation into 3D: accumulate class log-probabilities per voxel
def fuse_label(logp_voxel, logp_obs):
    logp = logp_voxel + logp_obs                 # Bayesian update (in log)
    return logp - logp.logsumexp(0)              # renormalize
# multi-view voting corrects 2D errors that flicker frame to frame`,
    note: {
      en: "Bayesian multi-view voting fuses per-frame 2D labels into robust 3D semantics.",
      zh: "贝叶斯多视角投票，把逐帧 2D 标签融合成鲁棒的 3D 语义。",
    },
  },
  D5: {
    code: `import networkx as nx

# objects = nodes, relations = edges; query structure, not pixels
g = nx.DiGraph()
g.add_edge("mug", "table", rel="on")
g.add_edge("table", "kitchen", rel="in")
# "is the mug in the kitchen?"  ->  graph reachability
print(nx.has_path(g, "mug", "kitchen"))   # True`,
    note: {
      en: "A scene graph makes relations and hierarchy queryable — hand it to a planner or an LLM.",
      zh: "场景图让关系与层级可查询——可直接交给规划器或 LLM。",
    },
  },
  D6: {
    code: `import numpy as np

# space-centric map: each cell's occupancy as a log-odds you can update
grid = np.zeros((H, W))                 # log-odds, 0 = unknown
def update(grid, cell, hit):            # hit=True if measured occupied
    grid[cell] += 0.85 if hit else -0.4   # accumulate evidence
    return grid                          # >0 occupied, <0 free
# great for navigation/collision; objects need a separate (graph) map`,
    note: {
      en: "Space-centric (occupancy) maps answer 'where can I go'; object-centric maps answer 'what & how'.",
      zh: "空间中心（占据）地图回答「我能去哪」；物体中心地图回答「是什么、怎么做」。",
    },
  },
  D7: {
    code: `import numpy as np

# "left of the chair" depends on the frame -- convert ego <-> world
def world_to_ego(p_world, cam_R, cam_t):
    return cam_R.T @ (p_world - cam_t)      # into the camera's frame

def ego_to_world(p_ego, cam_R, cam_t):
    return cam_R @ p_ego + cam_t            # back to the world frame`,
    note: {
      en: "Spatial reasoning must commit to a reference frame; conversions are the same rotation discipline as Track A/B.",
      zh: "空间推理须确定参照系；坐标转换与 Track A/B 是同一套旋转纪律。",
    },
  },
  D8: {
    code: `# a world model PREDICTS the future, so you can plan by imagining
def imagine(state, plan, dynamics, reward):
    total = 0.0
    for action in plan:                  # roll the future forward
        state = dynamics(state, action)  # learned transition
        total += reward(state)
    return total

best = max(candidate_plans, key=lambda p: imagine(s0, p, dynamics, reward))`,
    note: {
      en: "A world model is learned dynamics — plan by imagining rollouts and picking the best.",
      zh: "世界模型即学到的动力学——通过想象滚动并择优来规划。",
    },
  },
  D9: {
    code: `# pixels -> world memory: wire the tracks into one pipeline
poses  = run_slam(rgbd_frames)                    # B3 / D2  geometry
tsdf   = tsdf_fuse(rgbd_frames, poses)            # D3       geometry fusion
labels = bayes_fuse(segment(rgbd_frames), poses)  # D4       semantics
graph  = build_scene_graph(tsdf, labels)          # D5       structure
print(graph.query("is the mug on the table?"))    # spatial reasoning`,
    note: {
      en: "The capstone wires SLAM → TSDF fusion → semantic fusion → scene graph into one queryable system.",
      zh: "终极项目把 SLAM → TSDF 融合 → 语义融合 → 场景图，串成一个可查询的系统。",
    },
  },
};
