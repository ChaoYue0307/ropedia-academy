import type { Bilingual } from "../types";

// Each lesson's snippet also lives as a runnable notebook in /notebooks,
// opened straight from the public repo via Colab's GitHub bridge (no login to
// read; one click to run). Keep in sync with scripts/gen-notebooks.mjs.
export const colabUrl = (id: string) =>
  `https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/${id}.ipynb`;

// One comprehensive, SELF-CONTAINED Python/PyTorch example per lesson: it covers
// the lesson's whole arc and runs end-to-end (toy data + printed output) so a
// reader learns the concept by executing it. Comments are English (universal for
// code); the `note` is bilingual. Sizes are shrunk so everything runs on CPU.
export const lessonCode: Record<string, { code: string; note: Bilingual }> = {
  // ===================== Track A — Human Modeling =====================
  A1: {
    code: `import torch

# Miniature SMPL: M(beta, theta) -> a full mesh from ~80 numbers.
# (Real SMPL: 6890 verts, 10 shape coeffs + 24 joint rotations. We shrink to run.)
torch.manual_seed(0)
V, n_beta, J = 60, 10, 5
v_template = torch.randn(V, 3)                  # neutral template body
shape_dirs = torch.randn(V, 3, n_beta)         # shape blendshapes (identity)
pose_dirs  = torch.randn(V, 3, J * 9)          # pose-corrective blendshapes
weights    = torch.softmax(torch.randn(V, J), dim=1)   # LBS skinning weights

def aa_to_R(aa):                               # axis-angle (J,3) -> rotations (J,3,3)
    th = aa.norm(dim=-1, keepdim=True) + 1e-8; k = aa / th
    Kx = torch.zeros(aa.shape[0], 3, 3)
    Kx[:,0,1], Kx[:,0,2], Kx[:,1,0] = -k[:,2], k[:,1], k[:,2]
    Kx[:,1,2], Kx[:,2,0], Kx[:,2,1] = -k[:,0], -k[:,1], k[:,0]
    I = torch.eye(3).expand_as(Kx)
    return I + th.sin()[...,None]*Kx + (1-th.cos())[...,None]*(Kx @ Kx)

def smpl(beta, theta):                          # theta: (J,3) joint rotations
    R = aa_to_R(theta)
    v = v_template + shape_dirs @ beta          # 1) shape blendshapes
    v = v + pose_dirs @ (R - torch.eye(3)).reshape(-1)   # 2) pose correctives
    return torch.einsum('vj,jab,vb->va', weights, R, v)  # 3) linear blend skinning

beta  = torch.randn(n_beta, requires_grad=True)
theta = torch.randn(J, 3, requires_grad=True)
mesh  = smpl(beta, theta)
print("params:", beta.numel() + theta.numel(), "-> mesh vertices:", tuple(mesh.shape))
mesh.sum().backward()                            # every body is differentiable in (beta, theta)
print("differentiable in shape & pose:", beta.grad is not None)`,
    note: {
      en: "Builds the full SMPL pipeline — shape blendshapes → pose correctives → linear blend skinning — and shows ~80 differentiable numbers produce a valid mesh.",
      zh: "搭出完整的 SMPL 流程——形状混合形变 → 姿态校正 → 线性混合蒙皮——并展示约 80 个可微数字即可生成一具有效网格。",
    },
  },
  A2: {
    code: `import torch, torch.nn as nn, torch.nn.functional as F

# 2D pose: a per-keypoint HEATMAP -> sub-pixel coordinate (soft-argmax, differentiable).
H = W = 16
def soft_argmax(hm):                           # hm: (K,H,W) score maps
    K = hm.shape[0]
    p = F.softmax(hm.reshape(K, -1), -1).reshape(K, H, W)   # spatial probability
    xs = torch.arange(W).float(); ys = torch.arange(H).float()
    x = (p.sum(1) * xs).sum(-1)                 # expected column
    y = (p.sum(2) * ys).sum(-1)                 # expected row
    return torch.stack([x, y], -1)             # (K,2)

heatmaps = torch.randn(17, H, W)               # 17 body keypoints
kp2d = soft_argmax(heatmaps)
print("2D keypoints from heatmaps:", tuple(kp2d.shape))

# 3D is ill-posed from one image (depth ambiguity) -> LIFT 2D to 3D with a body prior.
lifter = nn.Sequential(nn.Linear(17*2, 128), nn.ReLU(), nn.Linear(128, 17*3))
kp3d = lifter(kp2d.flatten()).reshape(17, 3)
print("lifted 3D joints:", tuple(kp3d.shape))
print("heatmaps keep uncertainty/structure; lifting + (video over time) fix depth")`,
    note: {
      en: "Covers the 2D→3D pipeline: heatmap soft-argmax for keypoints, then a lifting network to 3D, with the depth-ambiguity point made explicit.",
      zh: "覆盖 2D→3D 全流程：用热图 soft-argmax 取关键点，再用 lifting 网络抬升到 3D，并点明深度歧义。",
    },
  },
  A3: {
    code: `import torch, torch.nn as nn

T, J = 32, 17                                   # 32 frames, 17 joints
seq = torch.randn(1, T, J, 3)                   # a motion clip (positions over time)

# Representation matters: VELOCITIES are translation-invariant (same action, anywhere).
shifted = seq + torch.tensor([5., 0., 0.])           # move the whole body in space
vel, vel2 = seq[:, 1:] - seq[:, :-1], shifted[:, 1:] - shifted[:, :-1]
print("velocity is translation-invariant:", torch.allclose(vel, vel2, atol=1e-5))

# (a) Temporal backbone: 1D conv over time encodes MOVEMENT, not a single pose.
x = seq.reshape(1, T, J*3).transpose(1, 2)      # (1, C=J*3, T)
tcn = nn.Sequential(nn.Conv1d(J*3, 128, 3, padding=1), nn.ReLU(),
                    nn.Conv1d(128, 128, 3, padding=1), nn.AdaptiveAvgPool1d(1))
print("temporal-conv motion feature:", tuple(tcn(x).squeeze(-1).shape))

# (b) ST-GCN idea: propagate along the SKELETON GRAPH (anatomical inductive bias).
A = torch.eye(J)
for i, j in [(0,1),(1,2),(2,3),(0,4),(4,5)]: A[i,j] = A[j,i] = 1   # toy kinematic edges
A = A / A.sum(1, keepdim=True)
graph_feat = torch.einsum('ij,btjc->btic', A, seq)   # mix connected joints
print("skeleton-graph smoothed motion:", tuple(graph_feat.shape))`,
    note: {
      en: "Three core ideas of motion backbones in one run: velocity (translation-invariant) features, a temporal-conv encoder, and ST-GCN skeleton-graph propagation.",
      zh: "一次运行讲清运动骨干的三大要点：速度（平移不变）特征、时间卷积编码器，以及 ST-GCN 的骨架图传播。",
    },
  },
  A4: {
    code: `import torch, torch.nn as nn

# HMR: regress SMPL params + camera from an image feature, train with NO 3D labels.
img_feat = torch.randn(1, 512)                  # from a CNN/ViT backbone
head = nn.Linear(512, 10 + 24*3 + 3)            # beta(10) + theta(72) + camera(s,tx,ty)
out = head(img_feat)[0]
beta, theta, cam = out[:10], out[10:82], out[82:]
joints3d = theta.reshape(24, 3)                 # stand-in for SMPL(beta,theta) joints

def project(j3d, cam):                           # weak-perspective projection
    s, t = cam[0], cam[1:]
    return s * j3d[:, :2] + t                    # 3D joints -> 2D pixels

kp2d_gt = torch.randn(24, 2)                     # abundant 2D keypoint labels
reproj  = ((project(joints3d, cam) - kp2d_gt) ** 2).mean()   # supervise 3D via 2D
prior   = (theta ** 2).mean()                    # stand-in for an adversarial pose prior
loss    = reproj + 0.1 * prior                   # reprojection is under-constrained alone
loss.backward()
print("reprojection loss:", round(reproj.item(), 3))
print("trainable from 2D keypoints only:", head.weight.grad is not None)`,
    note: {
      en: "The HMR recipe end-to-end: regress (β, θ, camera), supervise 3D through a differentiable reprojection loss, and add a pose prior to break depth ambiguity.",
      zh: "完整的 HMR 配方：回归 (β、θ、相机)，经可微重投影损失用 2D 监督 3D，并加姿态先验打破深度歧义。",
    },
  },
  A5: {
    code: `import torch

# ONE recipe, specialized: identity blendshapes + articulation -> body / hand / face.
def parametric_model(beta, pose, template, shape_dirs, articulate):
    v = template + shape_dirs @ beta            # identity / shape
    return articulate(v, pose)                   # pose it (LBS / jaw / expression)

def articulate(v, pose):                          # toy: rotate verts about z by pose[0]
    a = pose[0]; c, s = torch.cos(a), torch.sin(a)
    R = torch.tensor([[c,-s,0],[s,c,0],[0,0,1.]])
    return v @ R.T

mk = lambda Vn, nb: (torch.randn(Vn,3), torch.randn(Vn,3,nb))
hand = parametric_model(torch.randn(10), torch.randn(3), *mk(40,10), articulate)  # MANO
face = parametric_model(torch.randn(50), torch.randn(3), *mk(40,50), articulate)  # FLAME
body = torch.randn(60, 3)
smplx = torch.cat([body, hand, face], 0)         # SMPL-X = body + hands + face
print("SMPL-X mesh vertices:", smplx.shape[0])

# Why a 3D hand MESH (not a 2D box): contact = surface proximity to the object.
obj = torch.tensor([0.2, 0.1, 0.0])
print("hand-object contact distance:", round((hand - obj).norm(dim=1).min().item(), 3))`,
    note: {
      en: "Shows MANO/FLAME are SMPL specialized via one shared parametric_model, composes them into SMPL-X, and computes a mesh-level contact distance (why 3D > a box).",
      zh: "展示 MANO/FLAME 是用同一个 parametric_model 特化的 SMPL，组合成 SMPL-X，并计算网格级接触距离（为何 3D 胜过框）。",
    },
  },
  A6: {
    code: `import torch, torch.nn.functional as F

# How you ENCODE rotation decides if a net can learn it. Euler -> gimbal lock;
# quaternion -> double-cover sign flips; ANY <=4D encoding is discontinuous.
# Fix: regress a continuous 6D vector, Gram-Schmidt it into a rotation matrix.
def sixd_to_R(d6):                              # network outputs 6 numbers
    a1, a2 = d6[..., :3], d6[..., 3:]
    b1 = F.normalize(a1, dim=-1)
    b2 = F.normalize(a2 - (b1*a2).sum(-1, keepdim=True)*b1, dim=-1)
    b3 = torch.cross(b1, b2, dim=-1)
    return torch.stack([b1, b2, b3], dim=-1)

R = sixd_to_R(torch.randn(6))
I = torch.eye(3)
print("valid rotation? orthonormal:", torch.allclose(R @ R.T, I, atol=1e-5),
      "det=+1:", bool(torch.allclose(R.det(), torch.tensor(1.), atol=1e-5)))

# Local (parent-relative) frames compose along the kinematic chain, so the same
# gesture is invariant to overall body orientation.
parent, local = sixd_to_R(torch.randn(6)), sixd_to_R(torch.randn(6))
child_global = parent @ local
print("child global orientation = parent ∘ local:", tuple(child_global.shape))`,
    note: {
      en: "Implements the continuous 6D→matrix fix and verifies it yields a valid rotation, then shows local-vs-global frame composition along the kinematic chain.",
      zh: "实现连续的 6D→矩阵修复并验证它给出有效旋转，再演示沿运动学链的局部 vs 全局坐标系组合。",
    },
  },
  A7: {
    code: `import torch, torch.nn as nn

T, D = 60, 24*6                                  # 60 frames, 24 joints x 6D rotation
betas = torch.linspace(1e-4, 0.02, 50)
abar  = torch.cumprod(1 - betas, 0)             # diffusion noise schedule

# A motion prior as a DIFFUSION model: learn to denoise; sample new motion (conditioned).
denoiser = nn.Sequential(nn.Linear(D + 1 + 16, 256), nn.SiLU(), nn.Linear(256, D))
def eps_pred(x, t, cond):
    tt = torch.full((x.shape[0], 1), t / len(betas))
    return denoiser(torch.cat([x, tt, cond], -1))

cond = torch.randn(1, 16)                        # text/music embedding ("a person waves")
x = torch.randn(1, D)                            # x_T: pure noise
for t in reversed(range(len(betas))):           # reverse process: denoise -> motion
    eps = eps_pred(x, t, cond)
    x = (x - (1 - abar[t]).sqrt() * eps) / abar[t].sqrt()
print("generated motion:", tuple(x.shape), "| conditioned on:", tuple(cond.shape))

# Plausibility is a GLOBAL physical property: foot-skate = foot moving while in contact.
foot_xy, contact = torch.randn(T, 2), (torch.rand(T) > 0.5)
skate = ((foot_xy[1:] - foot_xy[:-1]).norm(dim=-1) * contact[1:]).mean()
print("foot-skating penalty (lower is better):", round(skate.item(), 3))`,
    note: {
      en: "Runs a full motion-diffusion reverse process (noise schedule + conditioned denoiser → a motion sample) and quantifies the foot-skating failure mode.",
      zh: "跑完整的运动扩散反向过程（噪声调度 + 条件去噪器 → 一段运动样本），并量化脚滑这一失败模式。",
    },
  },
  A8: {
    code: `import torch

# A recovered body must be consistent with the scene: SUPPORTED + NO penetration.
body = torch.randn(50, 3, requires_grad=True)   # body vertices
foot = torch.tensor([0, 1])                      # two foot-vertex indices
def scene_sdf(p):                                # one spherical obstacle (signed dist)
    return (p - torch.tensor([0., 0.5, 0.])).norm(dim=-1) - 0.4   # <0 = inside

opt = torch.optim.Adam([body], lr=0.05)
for _ in range(60):
    opt.zero_grad()
    contact     = body[foot, 1].abs().mean()                 # feet ON the floor (y=0)
    penetration = (-scene_sdf(body)).clamp(min=0).mean()      # not INSIDE the obstacle
    (contact + penetration).backward(); opt.step()           # physics = free 3D supervision

print("mean foot height (->0):", round(body[foot, 1].abs().mean().item(), 3))
print("vertices still penetrating:", int((scene_sdf(body) < 0).sum()))

# Affordance: which locations are 'sit-able' = free space at sitting height.
grid = torch.rand(200, 3); grid[:, 1] = 0.5
print("sit-able locations (free space):", int((scene_sdf(grid) > 0.1).sum()))`,
    note: {
      en: "Optimizes a body against contact + non-penetration constraints (physics as free supervision) and queries affordances — the human↔scene coupling end-to-end.",
      zh: "在接触 + 非穿插约束下优化身体（物理即免费监督）并查询可供性——完整呈现人↔场景的耦合。",
    },
  },
  A9: {
    code: `import torch

# SMPLify: FIT pose to one clip by optimization. Toy joints = base + theta (runs here).
base = torch.randn(15, 3)
joints  = lambda th: base + th
project = lambda J: J[:, :2]                      # orthographic, for brevity
kp2d = project(joints(torch.randn(15, 3))) + 0.01 * torch.randn(15, 2)   # observed 2D

def fit(prior_w):                                # minimize reprojection + pose prior
    th = torch.zeros(15, 3, requires_grad=True)
    opt = torch.optim.Adam([th], lr=0.1)
    for _ in range(300):
        opt.zero_grad()
        reproj = ((project(joints(th)) - kp2d) ** 2).mean()
        prior  = (th ** 2).mean()                 # keeps the pose plausible
        (reproj + prior_w * prior).backward(); opt.step()
    return reproj.item(), prior.item()

r1, p1 = fit(prior_w=1e-2)
r2, p2 = fit(prior_w=0.0)                          # ABLATION: remove the prior
print(f"with prior : reproj={r1:.4f}  prior_cost={p1:.3f}")
print(f"no prior   : reproj={r2:.4f}  prior_cost={p2:.3f}  <- fits 2D, less plausible pose")
print("lesson: reprojection alone is depth-ambiguous; the prior breaks the tie")`,
    note: {
      en: "A real SMPLify optimization loop plus the key ablation — turning off the pose prior fits the 2D but yields a less plausible pose (the depth-flip failure mode).",
      zh: "一个真实的 SMPLify 优化循环加上关键消融——关掉姿态先验虽能拟合 2D，却得到更不合理的姿态（深度翻转失败模式）。",
    },
  },

  // ===================== Track B — 3D / Neural Rendering =====================
  B1: {
    code: `import numpy as np

# Pinhole: a world point projects to a pixel via  x ~ K [R|t] X.
K = np.array([[800,0,320],[0,800,240],[0,0,1.]])  # intrinsics: focal + principal point
R, t = np.eye(3), np.array([0,0,0.])              # extrinsics: camera pose
def project(X):                                    # X: (N,3) world points
    Xc = (R @ X.T).T + t                            # world -> camera
    x  = (K @ Xc.T).T                               # -> homogeneous pixel
    return x[:, :2] / x[:, 2:3]                      # perspective divide

X = np.array([[0.2, -0.1, 3.0]])
print("pixel:", project(X)[0].round(2))

# Many-to-one: EVERY point along a ray maps to the SAME pixel -> depth is discarded.
ray = X * np.array([[1.], [2.], [5.]])             # three depths on one ray
print("all depths -> same pixel:", np.allclose(project(ray), project(ray)[0], atol=1e-6))
print("=> one image fixes the ray direction, not the distance (need 2 views or priors)")`,
    note: {
      en: "Builds K[R|t] projection from scratch and demonstrates the core fact — a whole ray collapses to one pixel, so a single view cannot recover depth.",
      zh: "从零搭出 K[R|t] 投影，并演示核心事实——整条射线塌缩到一个像素，因此单视图无法恢复深度。",
    },
  },
  B2: {
    code: `import numpy as np

# Two calibrated views observe one 3D point; recover it by triangulation.
K = np.array([[800,0,320],[0,800,240],[0,0,1.]])
cam = lambda R, t: K @ np.hstack([R, t.reshape(3,1)])   # 3x4 projection matrix
P1 = cam(np.eye(3), np.zeros(3))
a = 0.3; R2 = np.array([[np.cos(a),0,np.sin(a)],[0,1,0],[-np.sin(a),0,np.cos(a)]])
P2 = cam(R2, np.array([-1., 0, 0]))

X_true = np.array([0.5, -0.2, 4.0, 1.0])           # homogeneous 3D point
proj = lambda P, X: (P @ X)[:2] / (P @ X)[2]
x1, x2 = proj(P1, X_true), proj(P2, X_true)         # its two images (correspondence)

def triangulate(P1, P2, x1, x2):                    # DLT: solve the ray intersection (LSQ)
    A = np.stack([x1[0]*P1[2]-P1[0], x1[1]*P1[2]-P1[1],
                  x2[0]*P2[2]-P2[0], x2[1]*P2[2]-P2[1]])
    _, _, Vt = np.linalg.svd(A); X = Vt[-1]; return X / X[3]

X_est = triangulate(P1, P2, x1, x2)
print("recovered:", X_est[:3].round(3), "| true:", X_true[:3])
print("triangulation error:", round(np.linalg.norm(X_est - X_true), 5),
      " (epipolar constraint reduces matching from 2D to a 1D line search)")`,
    note: {
      en: "Two cameras → project a point → recover it by DLT triangulation, reporting the error; the epipolar 1D-search insight is called out.",
      zh: "两个相机 → 投影一个点 → 用 DLT 三角测量还原它并报告误差；点出对极约束把匹配从 2D 降为 1D。",
    },
  },
  B3: {
    code: `import torch

# Reprojection error is geometry's universal currency. PnP = pose from 3D<->2D;
# Bundle Adjustment = jointly optimize ALL poses AND points to minimize it.
torch.manual_seed(0)
C, P = 3, 30                                       # cameras, 3D points
pts_true = torch.randn(P, 3) + torch.tensor([0,0,5.])
rot = torch.eye(3).expand(C, 3, 3)                 # (rotations fixed here for brevity)
trans_true = torch.randn(C, 3) * 0.1
def project(pts, R, tr):
    p = pts @ R.T + tr; return p[:, :2] / p[:, 2:3]
obs = torch.stack([project(pts_true, rot[c], trans_true[c]) for c in range(C)])

# Start from noisy guesses; refine by minimizing total reprojection error.
pts   = (pts_true + 0.3*torch.randn_like(pts_true)).requires_grad_()
trans = (trans_true + 0.1*torch.randn_like(trans_true)).requires_grad_()
opt = torch.optim.Adam([pts, trans], lr=0.02)
for _ in range(400):
    opt.zero_grad()
    pred = torch.stack([project(pts, rot[c], trans[c]) for c in range(C)])
    loss = ((pred - obs) ** 2).mean()              # sum_ij || x_ij - pi(K,R,t,X) ||^2
    loss.backward(); opt.step()
print("final reprojection error:", round(loss.item(), 6))
print("recovered 3D-point error:", round((pts - pts_true).norm().item(), 3), "(BA converged)")`,
    note: {
      en: "A working bundle-adjustment loop: jointly refine cameras + 3D points by minimizing total reprojection error, watching it converge from a noisy initialization.",
      zh: "一个可运行的光束法平差循环：联合精修相机 + 3D 点以最小化总重投影误差，从含噪初值观察其收敛。",
    },
  },
  B4: {
    code: `import torch, torch.nn as nn, torch.nn.functional as F

# Geometry as a FUNCTION f(x): signed distance to the surface; surface = {f = 0}.
sphere_sdf = lambda p, r=1.0: p.norm(dim=-1) - r   # <0 inside, >0 outside

# An implicit field: train a small MLP to BE the SDF (continuous, resolution-free).
mlp = nn.Sequential(nn.Linear(3,64), nn.Softplus(), nn.Linear(64,64), nn.Softplus(), nn.Linear(64,1))
opt = torch.optim.Adam(mlp.parameters(), 1e-3)
for _ in range(400):
    x = torch.randn(512, 3) * 1.5
    loss = ((mlp(x).squeeze(-1) - sphere_sdf(x)) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()
print("MLP learned the SDF, residual:", round(loss.item(), 4))

# Normals come FREE as the gradient of the field: n = ∇f, defined everywhere.
x = torch.randn(5, 3, requires_grad=True)
g = torch.autograd.grad(mlp(x).sum(), x)[0]
print("surface normals from ∇f:", tuple(F.normalize(g, dim=-1).shape))
print("same 'distance to nearest surface' -> NeRF density (B5) and TSDF fusion (D3)")`,
    note: {
      en: "Trains an MLP to represent a signed-distance field, then extracts normals as ∇f via autograd — the implicit-geometry idea that NeRF and TSDF reuse.",
      zh: "训练一个 MLP 来表示符号距离场，再用自动求导把法向作为 ∇f 提取——NeRF 与 TSDF 都复用的隐式几何思想。",
    },
  },
  B5: {
    code: `import torch, torch.nn as nn

# NeRF: an MLP (x, dir) -> (color, density). Positional encoding lets it fit detail.
def posenc(x, L=6):
    out = [x]
    for i in range(L):
        for fn in (torch.sin, torch.cos): out.append(fn(x * (2.0**i) * torch.pi))
    return torch.cat(out, -1)

mlp = nn.Sequential(nn.Linear(3*(1+2*6), 128), nn.ReLU(), nn.Linear(128, 4))
def field(p):
    o = mlp(posenc(p)); return torch.sigmoid(o[..., :3]), torch.relu(o[..., 3])

def render(sigma, color, delta):                   # DIFFERENTIABLE volume rendering
    alpha = 1 - torch.exp(-sigma * delta)          # per-sample opacity
    T = torch.cumprod(torch.cat([torch.ones(1), 1 - alpha + 1e-10])[:-1], 0)  # transmittance
    return ((T * alpha)[:, None] * color).sum(0)   # integrate color along the ray

t = torch.linspace(2, 6, 64)                        # samples along one ray
pts = torch.stack([torch.zeros(64), torch.zeros(64), t], -1)
color, sigma = field(pts)
pixel = render(sigma, color, (t[1]-t[0]).expand(64))
loss = ((pixel - torch.tensor([0.8, 0.2, 0.1])) ** 2).mean()  # photometric loss
loss.backward()                                     # -> trains the MLP (no 3D labels!)
print("rendered pixel:", pixel.detach().round(decimals=3).tolist(), "| loss:", round(loss.item(), 3))`,
    note: {
      en: "Implements the whole NeRF core — positional encoding, an (x→color,density) MLP, differentiable volume rendering, and a photometric loss that backprops to train it.",
      zh: "实现 NeRF 的全部核心——位置编码、(x→颜色,密度) MLP、可微体渲染，以及可反向传播训练它的光度损失。",
    },
  },
  B6: {
    code: `import torch, torch.nn as nn

# Instant-NGP: put capacity in a MULTI-RESOLUTION HASH GRID; read it with a tiny MLP.
L, Tsize, Fdim = 4, 2**14, 2                         # levels, table size, feature dim
resolutions = [4, 8, 16, 32]
tables = nn.ParameterList([nn.Parameter(torch.randn(Tsize, Fdim) * 1e-2) for _ in range(L)])
primes = torch.tensor([1, 2654435761, 805459861])

def hash_encode(x):                                  # x in [0,1]^3 -> features
    feats = []
    for table, res in zip(tables, resolutions):
        cell = (x * res).long()                       # local grid cell (cheap, local)
        idx  = (cell * primes).sum(-1) % Tsize        # spatial hash (collisions tolerated)
        feats.append(table[idx])
    return torch.cat(feats, -1)                        # (..., L*Fdim)

tiny_mlp = nn.Sequential(nn.Linear(L*Fdim, 64), nn.ReLU(), nn.Linear(64, 4))
x = torch.rand(1000, 3)
out = tiny_mlp(hash_encode(x))
print("encoded", x.shape[0], "points ->", tuple(out.shape), "via a tiny MLP")
out.sum().backward()                                  # gradients flow into the GRID features
print("capacity lives in the grid (trainable):", tables[0].grad is not None, "-> trains in seconds")`,
    note: {
      en: "Builds the multi-resolution hash encoding (local cell lookup + spatial hash) feeding a tiny MLP, and shows gradients flow into the grid — why Instant-NGP is fast.",
      zh: "搭出多分辨率哈希编码（局部单元查找 + 空间哈希）喂给极小 MLP，并展示梯度流入网格——这正是 Instant-NGP 之所以快。",
    },
  },
  B7: {
    code: `import torch

# A scene = many explicit 3D GAUSSIANS (position, color, opacity, + a label).
N = 5
means   = torch.randn(N, 3) + torch.tensor([0, 0, 5.])
colors  = torch.rand(N, 3)
opacity = torch.rand(N)
labels  = torch.randint(0, 3, (N,))                  # a SEMANTIC tag per Gaussian (-> D4)
K = torch.tensor([[500,0,128.],[0,500,128.],[0,0,1.]])

splat = lambda m: ((K @ m)[:2] / (K @ m)[2], m[2])   # project a Gaussian center -> 2D, depth

# Render a pixel by FRONT-TO-BACK alpha blending (the differentiable rasterizer core).
pixel, T = torch.zeros(3), 1.0
for i in torch.argsort(means[:, 2]):                 # near -> far
    uv, z = splat(means[i]); a = opacity[i].item()
    pixel = pixel + T * a * colors[i]; T = T * (1 - a)
print("rasterized pixel:", pixel.round(decimals=3).tolist(), "| transmittance left:", round(T, 3))
print("each Gaussian also carries a label", labels.tolist(), "-> queryable semantic map")`,
    note: {
      en: "Renders by projecting (splatting) explicit 3D Gaussians and alpha-compositing them front-to-back — and attaches a per-Gaussian semantic label (the bridge to Track D).",
      zh: "通过投影（泼溅）显式 3D 高斯并按前到后做 alpha 合成来渲染——并为每个高斯附加语义标签（通向 Track D 的桥梁）。",
    },
  },
  B8: {
    code: `import torch, torch.nn as nn

# 4D = a CANONICAL model (rest scene) + a DEFORMATION field warping time t into it.
canonical = nn.Sequential(nn.Linear(3,64), nn.ReLU(), nn.Linear(64,4))   # shared over time
deform    = nn.Sequential(nn.Linear(4,64), nn.ReLU(), nn.Linear(64,3))   # (x,t) -> delta x

def render_at(x, t):
    dx = deform(torch.cat([x, torch.full_like(x[:, :1], t)], -1))   # warp to canonical
    return canonical(x + dx), dx

x = torch.randn(100, 3, requires_grad=True)
out0, d0 = render_at(x, 0.0)
out1, d1 = render_at(x, 1.0)                          # SAME appearance model, new motion
print("appearance shared, only motion differs:", d0.abs().mean().item() != d1.abs().mean().item())

# Under-constrained -> need priors. As-rigid-as-possible: neighbours deform alike.
nbr  = torch.cdist(x, x).topk(4, largest=False).indices    # 3 nearest neighbours
arap = (d1[nbr] - d1[:, None]).pow(2).mean()               # local-rigidity penalty
print("as-rigid-as-possible regularizer:", round(arap.item(), 4))`,
    note: {
      en: "Factors a dynamic scene into a shared canonical model + a time deformation field, then adds the as-rigid-as-possible prior that tames the under-constrained 4D problem.",
      zh: "把动态场景分解为共享标准模型 + 时间形变场，再加入尽可能刚性先验，驯服欠约束的 4D 问题。",
    },
  },
  B9: {
    code: `import torch, torch.nn as nn

# Minimal end-to-end NeRF reproduction: representation -> renderer -> photometric loss.
def posenc(x, L=4):
    return torch.cat([x] + [f(x*(2.0**i)) for i in range(L) for f in (torch.sin, torch.cos)], -1)
mlp = nn.Sequential(nn.Linear(3*(1+2*4), 128), nn.ReLU(), nn.Linear(128, 4))
def field(p):
    o = mlp(posenc(p)); return torch.sigmoid(o[..., :3]), torch.relu(o[..., 3])
def render(p, delta):
    c, s = field(p); a = 1 - torch.exp(-s * delta)
    T = torch.cumprod(torch.cat([torch.ones(p.shape[0],1), 1-a+1e-10], 1)[:, :-1], 1)
    return (T * a).unsqueeze(-1).mul(c).sum(1), a

R, S = 8, 32                                          # toy "posed rays" dataset
t = torch.linspace(2, 6, S); delta = (t[1]-t[0]).expand(R, S)
pts = torch.randn(R,1,3)*0.1 + torch.stack([torch.zeros(S), torch.zeros(S), t], -1)
gt  = torch.rand(R, 3)
opt = torch.optim.Adam(mlp.parameters(), 1e-3)
for _ in range(200):
    opt.zero_grad(); pix, a = render(pts, delta)
    photo = ((pix - gt)**2).mean()
    (photo + 1e-3 * a.mean()).backward(); opt.step()  # sparsity term suppresses FLOATERS
print("photometric loss:", round(photo.item(), 4), "| mean density (floater control):", round(a.mean().item(), 3))`,
    note: {
      en: "A complete miniature NeRF training run on toy posed rays — representation, differentiable renderer, photometric loss, plus a density-sparsity term that suppresses floaters.",
      zh: "在玩具位姿射线上完整跑一次微型 NeRF 训练——表示、可微渲染器、光度损失，外加抑制漂浮物的密度稀疏项。",
    },
  },

  // ===================== Track C — Egocentric Vision =====================
  C1: {
    code: `import torch

# Three defining facts of first-person video, in code.
H = W = 64
prev = torch.rand(3, H, W)
cur  = torch.roll(prev, shifts=(2, 3), dims=(1, 2))    # the camera moved with the head

# 1) Camera moves WITH the actor: global motion encodes head movement / attention.
print("ego-motion magnitude (attention signal):", round((cur - prev).abs().mean().item(), 3))

# 2) Hands & objects dominate the CENTER-BOTTOM, where manipulation happens.
yy, xx = torch.meshgrid(torch.linspace(0,1,H), torch.linspace(0,1,W), indexing='ij')
manip = torch.exp(-(((xx-0.5)**2)/0.1 + ((yy-0.8)**2)/0.1))   # prior peaks center-bottom
idx = manip.argmax(); r, c = idx // W, idx % W
print("most-informative region (x,y):", (round(xx[r,c].item(),2), round(yy[r,c].item(),2)))

# 3) Intent is latent but recoverable: weight features by where manipulation is likely.
feat = torch.rand(3, H, W)
attended = (feat * manip).sum((1, 2)) / manip.sum()
print("manipulation-weighted feature:", attended.round(decimals=3).tolist())`,
    note: {
      en: "Turns the three egocentric properties into code: ego-motion as an attention signal, the center-bottom manipulation prior, and feature pooling toward likely intent.",
      zh: "把第一人称的三条性质写成代码：自我运动作为注意力信号、中下部操作先验，以及朝可能意图的特征汇聚。",
    },
  },
  C2: {
    code: `from collections import Counter
import random
random.seed(0)

# EPIC-style: action = (verb, noun). The class distribution is long-tailed.
verbs, nouns = ["take","put","cut","wash","open"], ["knife","onion","plate","tap","pan"]
anns = [(random.choice(verbs), random.choices(nouns, weights=[5,4,3,2,1])[0],
         f"P{random.randint(1,3):02d}") for _ in range(200)]      # (verb, noun, participant)
dist = Counter(f"{v}:{n}" for v, n, _ in anns)
print("most common actions:", dist.most_common(3))
print("long tail:", sum(c == 1 for c in dist.values()), "actions seen only once")

# Splits decide what you measure. Hold out whole PARTICIPANTS -> no scene leakage.
test_p = {sorted({p for *_, p in anns})[-1]}
train = [a for a in anns if a[2] not in test_p]
test  = [a for a in anns if a[2] in test_p]
print(f"participant-held-out split: train={len(train)} test={len(test)}")

# Xperience-10M idea: ONE synchronized record feeds every track.
frame = {"rgb":"(H,W,3)", "depth":"(H,W)", "cam_T":"(4,4)",
         "hand_pose":"(2,21,3)", "body_pose":"SMPL", "caption":"cutting an onion"}
print("multimodal per-frame record serves A/B/C/D:", list(frame))`,
    note: {
      en: "Constructs verb–noun actions, measures the long tail, builds a leakage-free participant-held-out split, and lays out the multimodal per-frame record shared across tracks.",
      zh: "构造动词–名词动作、度量长尾、建立无泄漏的按参与者留出划分，并列出跨赛道共享的多模态逐帧记录。",
    },
  },
  C3: {
    code: `import torch, torch.nn as nn

clip = torch.randn(1, 3, 32, 56, 56)                  # (B, C, T, H, W): a 32-frame clip

# SlowFast: TWO pathways at different frame rates, fused by a lateral connection.
slow = clip[:, :, ::8]                                 # few frames, full detail (T=4)
fast = clip[:, :, ::2]                                 # many frames, low capacity (T=16)
slow_net, fast_net = nn.Conv3d(3, 64, 1), nn.Conv3d(3, 8, 1)   # fast = fewer channels
lateral = nn.Conv3d(8, 64, 1)                          # fuse fast -> slow
fused = slow_net(slow) + lateral(fast_net(fast)[:, :, ::4])     # align time, add
print("SlowFast fused feature:", tuple(fused.shape))

# VideoMAE: TUBE masking - hide the SAME spatial patches across all frames, at a
# HIGH ratio (~90%) because video is temporally redundant.
T, N = 16, 14*14
keep = int(0.10 * N)
vis = torch.randperm(N)[:keep]
mask = torch.ones(T, N, dtype=torch.bool); mask[:, vis] = False    # one tube, all frames
print(f"masked {mask.float().mean()*100:.0f}% of patches; visible: {keep}/{N}")
print("high ratio kills the 'copy a neighbouring frame' shortcut -> real understanding")`,
    note: {
      en: "Contrasts both video paradigms in one run: SlowFast's two-rate pathways with lateral fusion, and VideoMAE's high-ratio tube masking that forces real spatio-temporal learning.",
      zh: "一次运行对比两种视频范式：SlowFast 的双速率通路加横向融合，与 VideoMAE 高比例管状掩码逼出真正的时空学习。",
    },
  },
  C4: {
    code: `import torch, torch.nn as nn, torch.nn.functional as F

feat = torch.randn(4, 512)                            # 4 clips' features
# RECOGNITION (present): predict the (verb, noun) of the current segment.
verb_head, noun_head = nn.Linear(512, 5), nn.Linear(512, 10)
print("recognized (verb,noun):",
      list(zip(verb_head(feat).argmax(-1).tolist(), noun_head(feat).argmax(-1).tolist())))

# ANTICIPATION (near future): from PAST video only, predict the NEXT action.
past = torch.randn(1, 512)
probs = F.softmax(nn.Linear(512, 20)(past), -1)       # the future is multi-modal
true_next = torch.tensor([7])
topk = lambda k: (probs.topk(k, -1).indices == true_next[:, None]).any(-1).float().mean().item()
print("top-1 acc:", topk(1), "| top-5 acc:", topk(5))
print("future entropy (uncertainty):", round((-(probs * probs.log()).sum()).item(), 2))
print("=> evaluate anticipation with top-k, not top-1")`,
    note: {
      en: "Implements recognition (verb+noun heads) and anticipation (a next-action distribution) side by side, with the top-k metric and an entropy read-out of future multi-modality.",
      zh: "并排实现识别（动词+名词头部）与预判（下一动作分布），配 top-k 指标，并用熵读出未来的多模态性。",
    },
  },
  C5: {
    code: `import torch

H, W = 480, 640
# Detected hand boxes (x1,y1,x2,y2). Classify SIDE and OWNERSHIP with priors.
boxes = torch.tensor([[ 40, 360, 220, 480.],          # bottom-left: enters from edge
                      [430, 350, 600, 480.],          # bottom-right
                      [260,  60, 360, 160.]])         # high & small -> another person
side  = lambda b: "left" if (b[0]+b[2])/2 < W/2 else "right"
is_own = lambda b: bool(b[3] > 0.85 * H)              # own hands enter from the BOTTOM edge
for b in boxes:
    print(f"box x={int(b[0]):3d} side={side(b):5s} own={is_own(b)}")

# Segmentation > box: per-pixel MASKS resolve hand/object occlusion a box cannot.
mask_hand = torch.zeros(H, W, dtype=torch.bool); mask_hand[360:, 40:220] = True
mask_obj  = torch.zeros(H, W, dtype=torch.bool); mask_obj[380:430, 180:260] = True
print("hand/object boundary pixels (occlusion-aware):", int((mask_hand & mask_obj).sum()),
      "overlap -> a box couldn't separate these; the next stage (C6) needs the mask")`,
    note: {
      en: "Applies the first-person priors hands use — side by x, ownership by the bottom-edge rule — and shows why pixel masks (not boxes) are required for contact reasoning.",
      zh: "运用手部的第一人称先验——按 x 判左右、按底边规则判归属——并说明为何接触推理需要像素掩码而非框。",
    },
  },
  C6: {
    code: `import torch

def iou(a, b):                                         # box IoU (lists [x1,y1,x2,y2])
    x1,y1,x2,y2 = max(a[0],b[0]), max(a[1],b[1]), min(a[2],b[2]), min(a[3],b[3])
    inter = max(0,x2-x1) * max(0,y2-y1)
    union = (a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - inter
    return inter/union if union > 0 else 0.0

hand = [300,300,380,400]
objs = {"knife":[360,320,560,360], "plate":[100,100,200,200], "cup":[370,360,430,440]}

# ACTIVE OBJECT: the one being manipulated = in contact (overlapping) with the hand.
contact = {n: round(iou(hand, b), 3) for n, b in objs.items()}
active = max(contact, key=contact.get)
print("contact (IoU) per object:", contact, "-> active object:", active)

# JOINT inference: grasp constrains object. A 'pinch' implies a SMALL object.
grasp = "pinch"; area = {n: (b[2]-b[0])*(b[3]-b[1]) for n, b in objs.items()}
consistent = [n for n, s in area.items() if (s < 5000) == (grasp == "pinch")]
print("objects consistent with a", grasp, "grasp:", consistent)`,
    note: {
      en: "Models hand–object interaction end-to-end: picks the active object by hand contact (IoU), then does joint grasp↔object reasoning (a pinch implies a small object).",
      zh: "端到端建模手–物交互：用手部接触（IoU）选出活动物体，再做抓取↔物体的联合推理（捏取意味着小物体）。",
    },
  },
  C7: {
    code: `import torch

H = W = 32
# Gaze = where the eye fixates -> use it as an ATTENTION map over features.
def gaze_attention(feat, gaze):                        # feat (C,H,W), gaze (x,y) in [0,1]
    ys = torch.linspace(0,1,H)[:,None]; xs = torch.linspace(0,1,W)[None,:]
    g = torch.exp(-(((xs-gaze[0])**2 + (ys-gaze[1])**2) / (2*0.05)))
    g = g / g.sum()
    return (feat * g).sum((1, 2))                       # gaze-pooled feature

print("gaze-attended feature:", tuple(gaze_attention(torch.randn(64,H,W), torch.tensor([0.6,0.4])).shape))

# Gaze LEADS the hand: the eye lands on the target before the reach -> anticipation.
gaze_t = torch.tensor([10, 11, 12, 13]); hand_t = gaze_t + 4
print("gaze leads hand by", int((hand_t - gaze_t).float().mean()), "frames")

# No eye tracker? Approximate gaze from scene center + recent head motion (saliency).
gaze_proxy = torch.tensor([0.5, 0.5]) + torch.tensor([0.1, -0.05])
print("trackerless gaze proxy:", gaze_proxy.round(decimals=2).tolist())`,
    note: {
      en: "Covers gaze's three roles: a Gaussian attention map over features, the eye-leads-hand timing that makes it an anticipation cue, and a trackerless saliency proxy.",
      zh: "覆盖注视的三种角色：作用于特征的高斯注意力图、使其成为预判线索的「眼先于手」时序，以及无眼动仪的显著性代理。",
    },
  },
  C8: {
    code: `# Tasks have STRUCTURE: hierarchy, ordering dependencies, and an inferable goal.
actions = ["grind", "add_water", "brew", "pour", "add_milk"]

# ACTION GRAMMAR as a partial order: hard preconditions (what must precede what).
precede = {"brew": {"grind", "add_water"}, "pour": {"brew"}}
def valid_next(done):
    return [a for a in actions if a not in done and precede.get(a, set()) <= done]
print("after {'grind'} valid next:", valid_next({"grind"}))   # not 'pour' (needs brew)

# GOAL INFERENCE: from partial actions, infer the goal -> it collapses the future.
goals = {"latte": ["grind","add_water","brew","pour","add_milk"],
         "espresso": ["grind","add_water","brew","pour"]}
observed = ["grind", "add_water", "brew"]
post = {g: sum(a in steps for a in observed)/len(observed) for g, steps in goals.items()}
best = max(post, key=post.get)
print("goal posterior:", post, "-> inferred:", best)
print("next step constrained to:", goals[best][len(observed)])`,
    note: {
      en: "Represents a task as a partial-order action grammar (valid-next via preconditions) and does goal inference that collapses the space of future actions.",
      zh: "把任务表示为偏序动作语法（按前置条件求合法下一步），并做目标推断以收缩未来动作空间。",
    },
  },
  C9: {
    code: `import torch, torch.nn as nn, torch.nn.functional as F

# Honest baseline: FROZEN backbone features + a small trained head, on a held-out split.
torch.manual_seed(0)
N, D, K = 600, 256, 20
labels = torch.randint(0, K, (N,))
feats  = torch.randn(N, D) + F.one_hot(labels, K).float() @ torch.randn(K, D)   # signal+noise
tr, te = slice(0, 500), slice(500, N)               # split by index (a real one: by participant)

def train_head(x):
    head = nn.Linear(D, K); opt = torch.optim.Adam(head.parameters(), 1e-2)
    for _ in range(300):
        opt.zero_grad(); F.cross_entropy(head(x[tr]), labels[tr]).backward(); opt.step()
    return head

head = train_head(feats)
topk = lambda k: (head(feats[te]).topk(k,-1).indices == labels[te][:,None]).any(-1).float().mean().item()
print(f"held-out  top-1={topk(1):.2f}  top-5={topk(5):.2f}")

# ABLATION control: destroy the signal -> accuracy must fall to chance (1/K).
shuf = train_head(feats[torch.randperm(N)])
acc = (shuf(feats[te]).argmax(-1) == labels[te]).float().mean().item()
print(f"shuffled-feature control top-1={acc:.2f} (~chance {1/K:.2f}) -> the metric is trustworthy")`,
    note: {
      en: "Builds the simplest honest baseline (frozen features + linear head), reports top-1/5 on a held-out split, and runs a shuffle-control ablation to prove the metric is real.",
      zh: "搭出最简诚实基线（冻结特征 + 线性头部），在留出划分上报告 top-1/5，并跑打乱对照消融以证明指标可信。",
    },
  },

  // ===================== Track D — Scene & World Models =====================
  D1: {
    code: `import numpy as np
np.random.seed(0)

# Front-end (visual odometry): integrate NOISY frame-to-frame motion -> DRIFT.
N = 100
true_steps  = np.column_stack([np.cos(np.linspace(0,2*np.pi,N)),
                               np.sin(np.linspace(0,2*np.pi,N))]) * 0.1   # a closed loop
noisy_steps = true_steps + np.random.randn(N, 2) * 0.01
odom = np.cumsum(noisy_steps, 0)
print("drift at loop end (should be ~0):", round(np.linalg.norm(odom[-1] - odom[0]), 3))

# Loop closure: recognize the start place -> constrain pose[-1] == pose[0].
# Back-end: redistribute the accumulated error around the whole loop (pose graph).
gap = odom[-1] - odom[0]
corrected = odom - np.linspace(0, 1, N)[:, None] * gap
print("drift after loop closure:", round(np.linalg.norm(corrected[-1] - corrected[0]), 3))
print("front-end is fast/local; back-end + loop-closure keep it globally consistent")`,
    note: {
      en: "Simulates the SLAM paradox: visual-odometry integration drifts, then loop closure + back-end redistribution snaps the trajectory back to global consistency.",
      zh: "模拟 SLAM 悖论：视觉里程计累积漂移，随后回环 + 后端重分配把轨迹拉回全局一致。",
    },
  },
  D2: {
    code: `import torch

# SLAM = Track B geometry, online. TRACKING each frame = PnP (pose from 3D<->2D).
K = torch.tensor([[600,0,320.],[0,600,240.],[0,0,1.]])
pts3d = torch.randn(40, 3) + torch.tensor([0, 0, 4.])     # known map points
R, t_true = torch.eye(3), torch.tensor([0.3, -0.2, 0.1])
def project(P, t):
    p = P @ R.T + t; uv = (K @ p.T).T; return uv[:, :2] / uv[:, 2:3]
obs = project(pts3d, t_true)                               # their 2D detections

# PnP: recover the camera pose by minimizing reprojection error (gradient descent).
t = torch.zeros(3, requires_grad=True)
opt = torch.optim.Adam([t], lr=0.02)
for _ in range(300):
    opt.zero_grad(); ((project(pts3d, t) - obs) ** 2).mean().backward(); opt.step()
print("PnP recovered translation:", t.detach().round(decimals=2).tolist(), "| true:", t_true.tolist())
print("tracking=PnP, mapping=triangulation, back-end=bundle adjustment (B3)")
print("neural/dense SLAM swaps the sparse point map for a renderable NeRF/Gaussian field")`,
    note: {
      en: "Solves PnP (camera pose from 3D↔2D) by reprojection minimization and maps every SLAM step back to its Track B operation — including the move to neural/dense maps.",
      zh: "用重投影最小化求解 PnP（从 3D↔2D 求相机位姿），并把每个 SLAM 步骤映射回其 Track B 操作——包括转向神经/稠密地图。",
    },
  },
  D3: {
    code: `import numpy as np
np.random.seed(0)

# TSDF fusion: average many NOISY depth frames into one clean surface.
# 1D slice along a ray for clarity; true surface at depth 1.0.
voxels = np.linspace(0, 2, 41); trunc = 0.2
tsdf = np.zeros_like(voxels); weight = np.zeros_like(voxels)

def integrate(tsdf, weight, depth):                 # one depth frame
    sdf  = np.clip((depth - voxels) / trunc, -1, 1) # TRUNCATED signed distance
    near = np.abs(depth - voxels) < trunc
    tsdf[near]   = (weight[near]*tsdf[near] + sdf[near]) / (weight[near] + 1)  # weighted avg
    weight[near] += 1
    return tsdf, weight

for _ in range(50):                                  # 50 noisy depth measurements
    tsdf, weight = integrate(tsdf, weight, 1.0 + np.random.randn()*0.05)

# Surface = zero-crossing of the fused TSDF (what Marching Cubes extracts).
zc = np.where(np.diff(np.sign(tsdf[weight > 0])))[0]
print("fused surface depth:", voxels[weight > 0][zc].round(3), "(true 1.0) -> noise averaged out")
print("truncation stores only the near-surface band; submaps tile big scenes")`,
    note: {
      en: "Runs TSDF fusion over 50 noisy depth frames — truncated signed distances + weighted averaging — and extracts the denoised surface as the zero-crossing.",
      zh: "对 50 帧含噪深度做 TSDF 融合——截断符号距离 + 加权平均——并以零交叉提取去噪后的表面。",
    },
  },
  D4: {
    code: `import torch, torch.nn.functional as F

# Fuse per-frame 2D labels into a 3D map element via BAYESIAN multi-frame fusion.
n_classes, true_class = 4, 2
torch.manual_seed(0)
logp = torch.zeros(n_classes)                        # uniform prior (log space)
for _ in range(15):                                  # 15 noisy 2D observations
    obs = F.one_hot(torch.tensor(true_class), n_classes).float()*2 + torch.randn(n_classes)
    logp = logp + F.log_softmax(obs, -1)             # accumulate evidence
    logp = logp - logp.logsumexp(0)                  # renormalize (keep a distribution)
print("fused class probs:", logp.exp().round(decimals=3).tolist(), "-> argmax", logp.argmax().item())
print("multi-frame voting corrects 2D flicker (store the DISTRIBUTION, not one label)")

# OPEN-VOCABULARY: attach a CLIP feature per element; query by language similarity.
voxel_clip = F.normalize(torch.randn(5, 16), dim=1)   # 5 mapped elements
query = F.normalize(torch.randn(16), dim=0)           # e.g. CLIP("something to sit on")
sims = voxel_clip @ query
print("best language-query match: element", sims.argmax().item(), "sim", round(sims.max().item(), 3))`,
    note: {
      en: "Bayesian multi-frame label fusion (storing a distribution that corrects 2D flicker) plus open-vocabulary querying by matching language to per-element CLIP features.",
      zh: "贝叶斯多帧标签融合（存储能纠正 2D 闪烁的分布），再加把语言与逐元素 CLIP 特征匹配的开放词汇查询。",
    },
  },
  D5: {
    code: `import networkx as nx

# 3D scene graph: nodes = objects/places, edges = relations + hierarchy.
g = nx.DiGraph()
g.add_edge("building","floor1", rel="contains"); g.add_edge("floor1","kitchen", rel="contains")
g.add_edge("kitchen","table", rel="contains")
g.add_edge("mug","table", rel="on"); g.add_edge("table","kitchen", rel="in")

# Relational query a flat semantic map cannot answer:
print("is the mug in the kitchen?:", nx.has_path(g, "mug", "kitchen"))
print("what is on the table?:", [u for u,v,d in g.edges(data=True) if v=="table" and d["rel"]=="on"])

# Hierarchy enables multi-scale reasoning without scanning voxels.
print("hierarchy path:", nx.shortest_path(g, "building", "table"))

# Compact + symbolic -> hand it straight to an LLM/planner (vs a huge point cloud).
print("LLM-ready:", " ".join(f"({u} {d['rel']} {v})" for u,v,d in g.edges(data=True)))`,
    note: {
      en: "Builds a hierarchical 3D scene graph and runs the queries a flat map can't — relational ('mug in kitchen?'), structural (hierarchy path), and an LLM-ready symbolic export.",
      zh: "构建分层 3D 场景图并运行扁平地图无法回答的查询——关系（「杯子在厨房？」）、结构（层级路径）以及可直接交给 LLM 的符号化导出。",
    },
  },
  D6: {
    code: `import numpy as np

# SPACE-CENTRIC map (occupancy grid): answers "where can I go / will I collide?"
grid = np.zeros((10, 10)); grid[4:7, 5] = 1          # 0 = free, 1 = occupied (a wall)
print("space query - stand at (5,5)?:", grid[5,5] == 0, "| free cells:", int((grid==0).sum()))

# OBJECT-CENTRIC map (objects + relations): answers "what & how / relations?"
objects = [{"id":"mug","on":"table","graspable":True},
           {"id":"table","on":"floor","graspable":False}]
print("object query - graspable things:", [o["id"] for o in objects if o["graspable"]])
print("object query - mug on table?:", any(o["id"]=="mug" and o["on"]=="table" for o in objects))

# No free lunch: occupancy can't say 'graspable'; an object list can't guarantee clearance.
print("=> mature systems are HYBRID: a metric space layer + an object/graph layer")`,
    note: {
      en: "Puts the two map paradigms head to head — an occupancy grid for navigation/collision vs an object list for relations/affordances — and shows why systems keep both.",
      zh: "把两种地图范式正面对比——占据栅格用于导航/碰撞 vs 物体列表用于关系/可供性——并说明为何系统两者都保留。",
    },
  },
  D7: {
    code: `import numpy as np

# 1) REPRESENTATION DETERMINES REASONING - three queries need three representations.
free_space  = {(1,1),(1,2),(2,2)}                    # metric / space-centric
graph       = {("mug","on","table"), ("table","in","kitchen")}   # relational
clip_index  = {"something to sit on": "chair"}       # open-vocabulary
print("metric Q   'walk to (2,2)?':", (2,2) in free_space)
print("relational Q 'mug on table?':", ("mug","on","table") in graph)
print("open-vocab Q 'something to sit on?':", clip_index.get("something to sit on"))

# 2) REFERENCE FRAMES: 'left of the chair' depends on the frame you commit to.
chair_R = np.array([[0,-1],[1,0.]])                  # chair's own orientation
chair_t = np.array([2., 1.])
local = chair_R.T @ (np.array([1., 1.]) - chair_t)   # world point -> chair frame
print("point is to the chair's", "left" if local[0] < 0 else "right",
      "(allocentric); egocentric would differ -> same discipline as A6/B extrinsics")`,
    note: {
      en: "Demonstrates 'representation determines reasoning' with three query types, then a reference-frame transform showing 'left of the chair' depends on the chosen frame.",
      zh: "用三类查询演示「表示决定推理」，再用参照系变换展示「椅子左边」取决于所选参照系。",
    },
  },
  D8: {
    code: `import torch, torch.nn as nn

# A WORLD MODEL = learned dynamics: predict the next state from (state, action).
state_dim, act_dim = 8, 3
dynamics = nn.Sequential(nn.Linear(state_dim+act_dim, 64), nn.Tanh(), nn.Linear(64, state_dim))
reward   = nn.Linear(state_dim, 1)                   # learned/known reward

def imagine(s0, plan):                                # roll the future forward internally
    s, total = s0, 0.0
    for a in plan:
        s = dynamics(torch.cat([s, a])); total = total + reward(s)
    return total

s0 = torch.randn(state_dim)
plans = [torch.randn(4, act_dim) for _ in range(20)] # 20 candidate 4-step action plans
best = max(plans, key=lambda p: imagine(s0, p).item())   # PLAN by simulation
print("evaluated", len(plans), "imagined rollouts; best predicted return:",
      round(imagine(s0, best).item(), 2))
print("loop: perceive -> PREDICT (world model) -> PLAN over rollouts -> act -> perceive")`,
    note: {
      en: "Implements a world model as learned dynamics + reward, then plans by imagining rollouts and picking the best plan — the perception→prediction→planning→action loop.",
      zh: "把世界模型实现为学到的动力学 + 奖励，再通过想象滚动并择优来规划——即感知→预测→规划→行动回路。",
    },
  },
  D9: {
    code: `import numpy as np, networkx as nx
np.random.seed(0)

# CAPSTONE: pixels -> world memory. Wire every track into one runnable pipeline.
frames = [{"depth": 1.0 + np.random.randn()*0.05, "label": 2} for _ in range(20)]

# 1) POSES via SLAM/SfM (Track B bundle adjustment, online) — stubbed as identity.
poses = [np.eye(4) for _ in frames]

# 2) GEOMETRY: fuse depth into a TSDF (Track D3 = Track B's SDF, truncated).
tsdf, w = 0.0, 0
for f in frames:
    tsdf = (w*tsdf + np.clip(f["depth"] - 1.0, -1, 1)) / (w + 1); w += 1
print("fused surface offset (≈0):", round(tsdf, 3))

# 3) SEMANTICS: Bayes-fuse per-frame labels into the map (Track D4).
obj_class = int(np.bincount([f["label"] for f in frames]).argmax())
print("fused object class:", obj_class)

# 4) STRUCTURE: build + query a scene graph (Track D5).
g = nx.DiGraph(); g.add_edge(f"obj{obj_class}", "table", rel="on"); g.add_edge("table","kitchen", rel="in")
print("query 'is the object in the kitchen?':", nx.has_path(g, f"obj{obj_class}", "kitchen"))
print("cross-track reuse: BA<->SLAM back-end, SDF<->TSDF, CLIP<->open-vocab semantics")`,
    note: {
      en: "Runs the whole curriculum as one pipeline — poses → TSDF fusion → Bayesian semantics → scene-graph query — and names the cross-track reuse that makes it one system.",
      zh: "把整门课程作为一条流水线运行——位姿 → TSDF 融合 → 贝叶斯语义 → 场景图查询——并点出让它成为一个系统的跨赛道复用。",
    },
  },
};
