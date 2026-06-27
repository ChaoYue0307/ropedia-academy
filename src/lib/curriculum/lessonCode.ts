import type { Bilingual } from "../types";

// Each lesson's snippet also lives as a runnable notebook in /notebooks,
// opened straight from the public repo via Colab's GitHub bridge (no login to
// read; one click to run). Keep in sync with scripts/gen-notebooks.mjs.
export const colabUrl = (id: string) =>
  `https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/${id}.ipynb`;

// One comprehensive, SELF-CONTAINED Python example per lesson: it covers the
// lesson's whole arc, runs end-to-end on toy data, AND visualizes the result
// with matplotlib/networkx (plots render inline in Colab) — so a reader learns
// the concept by executing and SEEING it. Comments are English (universal for
// code); the `note` is bilingual. Sizes are shrunk to run on CPU.
export const lessonCode: Record<string, { code: string; note: Bilingual }> = {
  // ===================== Track A — Human Modeling =====================
  A1: {
    code: `import torch, matplotlib.pyplot as plt

# Miniature SMPL: M(beta, theta) -> a full mesh from ~80 numbers.
# (Real SMPL: 6890 verts, 10 shape coeffs + 24 joint rotations. We shrink to run.)
torch.manual_seed(0)
V, n_beta, J = 200, 10, 5
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

theta = torch.randn(J, 3)
print("params per body:", n_beta + J*3, "-> mesh vertices:", V)

# Visualize: SAME pose, two different shape betas -> two different bodies.
fig = plt.figure(figsize=(7, 3.5))
for i, name in enumerate(["shape beta A", "shape beta B"]):
    m = smpl(torch.randn(n_beta), theta).detach().numpy()
    ax = fig.add_subplot(1, 2, i+1, projection='3d'); ax.set_title(name)
    ax.scatter(m[:,0], m[:,2], m[:,1], s=6, c=m[:,1], cmap='viridis'); ax.set_axis_off()
plt.suptitle("~80 differentiable numbers -> a full body mesh"); plt.show()`,
    note: {
      en: "Builds the full SMPL pipeline (shape blendshapes → pose correctives → LBS) and renders two bodies in 3D to show how shape β reshapes the mesh.",
      zh: "搭出完整的 SMPL 流程（形状混合形变 → 姿态校正 → 线性混合蒙皮），并在 3D 中渲染两具身体，展示形状 β 如何重塑网格。",
    },
  },
  A2: {
    code: `import torch, torch.nn as nn, torch.nn.functional as F, matplotlib.pyplot as plt

H = W = 32
# 2D pose: a per-keypoint HEATMAP -> sub-pixel coordinate (soft-argmax).
def soft_argmax(hm):                           # hm: (K,H,W) score maps
    K = hm.shape[0]
    p = F.softmax(hm.reshape(K, -1), -1).reshape(K, H, W)
    xs, ys = torch.arange(W).float(), torch.arange(H).float()
    return torch.stack([(p.sum(1)*xs).sum(-1), (p.sum(2)*ys).sum(-1)], -1)

# Synthesize 12 keypoint heatmaps as Gaussian blobs at known locations.
gt = torch.rand(12, 2) * torch.tensor([W-1., H-1.])
yy, xx = torch.meshgrid(torch.arange(H).float(), torch.arange(W).float(), indexing='ij')
heatmaps = torch.stack([-(((xx-gx)**2 + (yy-gy)**2)/8) for gx, gy in gt])
kp2d = soft_argmax(heatmaps)

# 3D is ill-posed from one image -> LIFT 2D to 3D with a learned body prior.
lifter = nn.Sequential(nn.Linear(12*2, 128), nn.ReLU(), nn.Linear(128, 12*3))
kp3d = lifter(kp2d.flatten()).reshape(12, 3)
print("2D keypoints:", tuple(kp2d.shape), "-> lifted 3D:", tuple(kp3d.shape))

# Visualize: one heatmap + its soft-argmax, and all recovered 2D keypoints.
fig, ax = plt.subplots(1, 2, figsize=(7, 3.5))
ax[0].imshow(F.softmax(heatmaps[0].flatten(),0).reshape(H,W), cmap='hot')
ax[0].scatter(*kp2d[0], c='cyan', marker='x', s=80); ax[0].set_title("heatmap + soft-argmax")
ax[1].scatter(*kp2d.T.detach()); ax[1].invert_yaxis(); ax[1].set_title("recovered 2D keypoints")
plt.show()`,
    note: {
      en: "Shows the 2D→3D arc and plots a real keypoint heatmap with its soft-argmax overlaid, plus the recovered 2D skeleton.",
      zh: "展示 2D→3D 全流程，并画出真实的关键点热图与叠加其上的 soft-argmax，以及恢复出的 2D 骨架。",
    },
  },
  A3: {
    code: `import torch, torch.nn as nn, matplotlib.pyplot as plt

T, J = 64, 17                                   # 64 frames, 17 joints
t = torch.linspace(0, 4*3.14159, T)
seq = torch.stack([torch.sin(t + j) for j in range(J)], 1)[None, :, :, None] * torch.ones(1,T,J,3)

# Representation matters: VELOCITIES are translation-invariant (same action, anywhere).
shifted = seq + torch.tensor([5., 0., 0.])
vel, vel2 = seq[:,1:]-seq[:,:-1], shifted[:,1:]-shifted[:,:-1]
print("velocity is translation-invariant:", torch.allclose(vel, vel2, atol=1e-5))

# A temporal backbone (1D conv over time) encodes MOVEMENT, not a single pose.
x = seq.reshape(1, T, J*3).transpose(1, 2)
tcn = nn.Sequential(nn.Conv1d(J*3, 64, 3, padding=1), nn.ReLU(), nn.AdaptiveAvgPool1d(1))
print("temporal-conv motion feature:", tuple(tcn(x).squeeze(-1).shape))

# Visualize: a joint's position vs its velocity over time.
plt.figure(figsize=(6, 3))
plt.plot(seq[0,:,5,0], label="joint position x")
plt.plot(range(1,T), vel[0,:,5,0], label="velocity (Δ)")
plt.title("motion is a sequence; velocity exposes the dynamics")
plt.xlabel("frame"); plt.legend(); plt.show()`,
    note: {
      en: "Encodes a motion sequence with a temporal backbone and plots joint position vs translation-invariant velocity over time.",
      zh: "用时序骨干编码运动序列，并画出关节位置与平移不变的速度随时间的曲线。",
    },
  },
  A4: {
    code: `import torch, torch.nn as nn, matplotlib.pyplot as plt

# HMR: regress SMPL params + camera from an image feature, train with NO 3D labels.
img_feat = torch.randn(1, 512)
head = nn.Linear(512, 10 + 24*3 + 3)            # beta(10) + theta(72) + camera(s,tx,ty)
out = head(img_feat)[0]
theta, cam = out[10:82], out[82:]
joints3d = theta.reshape(24, 3)                 # stand-in for SMPL(beta,theta) joints

def project(j3d, cam):                           # weak-perspective projection
    return cam[0] * j3d[:, :2] + cam[1:]         # 3D joints -> 2D pixels

kp2d_gt = torch.randn(24, 2)                     # abundant 2D keypoint labels
hist = []
opt = torch.optim.Adam(head.parameters(), 1e-2)
for _ in range(150):                            # supervise 3D THROUGH 2D reprojection
    opt.zero_grad()
    o = head(img_feat)[0]; j = o[10:82].reshape(24,3); c = o[82:]
    loss = ((project(j, c) - kp2d_gt)**2).mean() + 0.1*(o[10:82]**2).mean()  # + pose prior
    loss.backward(); opt.step(); hist.append(loss.item())
print("trained from 2D keypoints only; final loss:", round(hist[-1], 3))

# Visualize: reprojected 3D joints converging onto the 2D labels.
fig, ax = plt.subplots(1, 2, figsize=(7, 3.3))
ax[0].plot(hist); ax[0].set_title("reprojection loss"); ax[0].set_xlabel("iter")
o = head(img_feat)[0]; proj = project(o[10:82].reshape(24,3), o[82:]).detach()
ax[1].scatter(*kp2d_gt.T, c='g', label='2D labels')
ax[1].scatter(*proj.T, c='r', marker='x', label='reprojected 3D')
ax[1].legend(); ax[1].invert_yaxis(); ax[1].set_title("3D fits the 2D evidence"); plt.show()`,
    note: {
      en: "Trains HMR by reprojection (3D supervised through 2D) and visualizes the loss curve plus reprojected joints landing on the 2D labels.",
      zh: "用重投影训练 HMR（经 2D 监督 3D），并可视化损失曲线，以及重投影关节落到 2D 标注上的过程。",
    },
  },
  A5: {
    code: `import torch, matplotlib.pyplot as plt

# ONE recipe, specialized: identity blendshapes + articulation -> body / hand / face.
def parametric_model(beta, pose, template, shape_dirs):
    v = template + shape_dirs @ beta            # identity / shape
    a = pose[0]; c, s = torch.cos(a), torch.sin(a)
    R = torch.tensor([[c,-s,0],[s,c,0],[0,0,1.]])
    return v @ R.T                               # articulate

mk = lambda Vn, nb: (torch.randn(Vn,3)*0.3, torch.randn(Vn,3,nb))
hand = parametric_model(torch.randn(10), torch.randn(3), *mk(120,10)) + torch.tensor([1.,0,0])  # MANO
face = parametric_model(torch.randn(50), torch.randn(3), *mk(120,50)) + torch.tensor([-1.,1,0]) # FLAME
body = torch.randn(300, 3) * 0.6
smplx = torch.cat([body, hand, face], 0)         # SMPL-X = body + hands + face
obj = torch.tensor([1.3, 0.1, 0.0])
print("SMPL-X verts:", smplx.shape[0], "| hand-object contact dist:",
      round((hand - obj).norm(dim=1).min().item(), 3))

# Visualize the composed SMPL-X parts (why a 3D mesh, not a box, gives contact).
fig = plt.figure(figsize=(5, 4)); ax = fig.add_subplot(projection='3d')
for m, c, l in [(body,'gray','body'),(hand,'r','hand (MANO)'),(face,'b','face (FLAME)')]:
    m = m.numpy(); ax.scatter(m[:,0], m[:,2], m[:,1], s=5, c=c, label=l)
ax.scatter(obj[0], obj[2], obj[1], c='k', marker='*', s=160, label='object')
ax.legend(); ax.set_axis_off(); plt.title("SMPL-X = body + hands + face"); plt.show()`,
    note: {
      en: "Composes MANO + FLAME + body into SMPL-X via one shared recipe and renders the parts in 3D with the object contact point.",
      zh: "用同一套配方把 MANO + FLAME + 身体组合成 SMPL-X，并在 3D 中渲染各部位与物体接触点。",
    },
  },
  A6: {
    code: `import torch, torch.nn.functional as F, matplotlib.pyplot as plt

# How you ENCODE rotation decides if a net can learn it. Euler -> gimbal lock;
# quaternion -> double cover; ANY <=4D encoding is discontinuous.
# Fix: regress a continuous 6D vector, Gram-Schmidt -> a valid rotation matrix.
def sixd_to_R(d6):
    a1, a2 = d6[..., :3], d6[..., 3:]
    b1 = F.normalize(a1, dim=-1)
    b2 = F.normalize(a2 - (b1*a2).sum(-1, keepdim=True)*b1, dim=-1)
    return torch.stack([b1, b2, torch.cross(b1, b2, dim=-1)], dim=-1)

R = sixd_to_R(torch.randn(6))
print("orthonormal:", torch.allclose(R @ R.T, torch.eye(3), atol=1e-5),
      "| det=+1:", bool(torch.allclose(R.det(), torch.tensor(1.), atol=1e-5)))

# Visualize: the 6D vector decodes to a valid orthonormal frame (rotated x/y/z axes).
fig = plt.figure(figsize=(4.5, 4.5)); ax = fig.add_subplot(projection='3d')
for i, c in enumerate(['r','g','b']):
    ax.quiver(0,0,0, *R[:,i], color=c, label=f"axis {['x','y','z'][i]}")
ax.set_xlim(-1,1); ax.set_ylim(-1,1); ax.set_zlim(-1,1); ax.legend()
plt.title("continuous 6D -> valid orthonormal rotation frame"); plt.show()`,
    note: {
      en: "Implements the continuous 6D→matrix fix, verifies the result is a valid rotation, and draws the decoded orthonormal frame in 3D.",
      zh: "实现连续的 6D→矩阵修复，验证结果是有效旋转，并在 3D 中画出解码得到的正交标架。",
    },
  },
  A7: {
    code: `import torch, torch.nn as nn, matplotlib.pyplot as plt

D = 24*6                                          # 24 joints x 6D rotation
betas = torch.linspace(1e-4, 0.02, 50)
abar  = torch.cumprod(1 - betas, 0)              # diffusion noise schedule

# A motion prior as a DIFFUSION model: denoise random noise -> a motion sample.
denoiser = nn.Sequential(nn.Linear(D + 1 + 16, 256), nn.SiLU(), nn.Linear(256, D))
cond = torch.randn(1, 16)                        # text/music embedding
x = torch.randn(1, D); traj = []
for step in reversed(range(len(betas))):         # reverse process
    tt = torch.full((1,1), step/len(betas))
    eps = denoiser(torch.cat([x, tt, cond], -1))
    x = (x - (1-abar[step]).sqrt()*eps) / abar[step].sqrt()
    traj.append(x.detach().norm().item())
print("generated motion:", tuple(x.shape), "conditioned on", tuple(cond.shape))

# Plausibility is a GLOBAL property: foot-skate = foot moving while in contact.
T = 60; foot = torch.cumsum(torch.randn(T,2)*0.05, 0); contact = (torch.rand(T) > 0.5)
skate = ((foot[1:]-foot[:-1]).norm(dim=-1) * contact[1:]).mean()

fig, ax = plt.subplots(1, 2, figsize=(7.5, 3.2))
ax[0].plot(traj); ax[0].set_title("diffusion: noise -> motion"); ax[0].set_xlabel("denoise step")
ax[1].plot(foot[:,0], foot[:,1], '-o', ms=3); m = contact.numpy()
ax[1].scatter(foot[m,0], foot[m,1], c='r', label='in contact (should be still)')
ax[1].set_title(f"foot-skate penalty = {skate:.2f}"); ax[1].legend(); plt.show()`,
    note: {
      en: "Runs a full motion-diffusion reverse process and plots the denoising trajectory plus a foot-path with contact frames flagged (the foot-skate failure).",
      zh: "跑完整的运动扩散反向过程，画出去噪轨迹，以及标出接触帧的脚部路径（脚滑失败模式）。",
    },
  },
  A8: {
    code: `import torch, numpy as np, matplotlib.pyplot as plt

# A recovered body must be consistent with the scene: SUPPORTED + NO penetration.
body = (torch.randn(120, 3)*0.3 + torch.tensor([0,0.5,0.])).requires_grad_()
scene_sdf = lambda p: (p - torch.tensor([0.,0.5,0.])).norm(dim=-1) - 0.4   # obstacle

before = body.detach().clone()
opt = torch.optim.Adam([body], lr=0.05)
for _ in range(120):
    opt.zero_grad()
    contact = body[:5, 1].abs().mean()                       # some verts ON the floor
    penetration = (-scene_sdf(body)).clamp(min=0).mean()      # not INSIDE the obstacle
    (contact + penetration).backward(); opt.step()           # physics = free supervision
print("vertices still penetrating:", int((scene_sdf(body) < 0).sum()))

# Visualize before vs after: body pushed out of the obstacle and onto the floor.
fig = plt.figure(figsize=(7, 3.5))
u, v = np.mgrid[0:2*np.pi:16j, 0:np.pi:8j]
sx, sy, sz = 0.4*np.cos(u)*np.sin(v), 0.5+0.4*np.sin(u)*np.sin(v), 0.4*np.cos(v)
for i, (pts, name) in enumerate([(before,'before'),(body.detach(),'after constraints')]):
    ax = fig.add_subplot(1,2,i+1, projection='3d'); p = pts.numpy()
    ax.plot_wireframe(sx, sz, sy, color='r', alpha=0.3)
    ax.scatter(p[:,0], p[:,2], p[:,1], s=5); ax.set_title(name); ax.set_axis_off()
plt.suptitle("contact + non-penetration optimization"); plt.show()`,
    note: {
      en: "Optimizes a body against contact + non-penetration and shows before/after 3D plots of it being pushed onto the floor and out of the obstacle.",
      zh: "在接触 + 非穿插约束下优化身体，并用前后 3D 图展示它被推到地面、挤出障碍物之外。",
    },
  },
  A9: {
    code: `import torch, matplotlib.pyplot as plt

# SMPLify: FIT pose to one clip by optimization. Toy joints = base + theta (runs here).
base = torch.randn(15, 3)
joints  = lambda th: base + th
project = lambda J: J[:, :2]
kp2d = project(joints(torch.randn(15, 3))) + 0.01*torch.randn(15, 2)   # observed 2D

def fit(prior_w):                                # minimize reprojection + pose prior
    th = torch.zeros(15, 3, requires_grad=True); opt = torch.optim.Adam([th], lr=0.1); hist = []
    for _ in range(300):
        opt.zero_grad()
        reproj = ((project(joints(th)) - kp2d)**2).mean()
        (reproj + prior_w*(th**2).mean()).backward(); opt.step(); hist.append(reproj.item())
    return hist
h_prior, h_none = fit(1e-2), fit(0.0)            # ABLATION: with vs without the prior
print(f"final reproj  with prior={h_prior[-1]:.4f}  no prior={h_none[-1]:.4f}")

# Visualize the optimization: reprojection error vs iteration for both.
plt.figure(figsize=(6, 3))
plt.plot(h_prior, label="with pose prior"); plt.plot(h_none, label="no prior")
plt.yscale('log'); plt.xlabel("iteration"); plt.ylabel("reprojection error")
plt.title("SMPLify: the prior breaks depth ties"); plt.legend(); plt.show()`,
    note: {
      en: "Runs a real SMPLify optimization with an ablation and plots reprojection-vs-iteration for fits with and without the pose prior.",
      zh: "运行真实的 SMPLify 优化并做消融，画出有/无姿态先验时重投影随迭代的曲线。",
    },
  },

  // ===================== Track B — 3D / Neural Rendering =====================
  B1: {
    code: `import numpy as np, matplotlib.pyplot as plt

# Pinhole: a world point projects to a pixel via  x ~ K [R|t] X.
K = np.array([[800,0,320],[0,800,240],[0,0,1.]])  # intrinsics: focal + principal point
R, t = np.eye(3), np.array([0,0,0.])              # extrinsics: camera pose
def project(X):                                    # X: (N,3) world points
    x = (K @ ((R @ X.T).T + t).T).T
    return x[:, :2] / x[:, 2:3]                      # perspective divide

# Many points along ONE ray (varying depth) -> they all map to the SAME pixel.
ray = np.array([[0.2,-0.1,3.0]]) * np.linspace(1, 3, 6)[:, None]
uv = project(ray)
print("all 6 depths -> same pixel:", np.allclose(uv, uv[0], atol=1e-6))

fig, ax = plt.subplots(1, 2, figsize=(7.5, 3.3))
ax[0].plot(ray[:,2], ray[:,0], 'o-'); ax[0].set_xlabel("depth Z"); ax[0].set_ylabel("world X")
ax[0].set_title("a ray of 3D points (varying depth)")
ax[1].scatter(uv[:,0], uv[:,1], s=np.linspace(200,30,6), c='r')
ax[1].set_xlim(0,640); ax[1].set_ylim(480,0); ax[1].set_title("...collapse to ONE pixel (depth lost)")
plt.show()`,
    note: {
      en: "Implements K[R|t] projection and plots a ray of 3D points all collapsing to one pixel — the depth-loss fact, made visual.",
      zh: "实现 K[R|t] 投影，并画出一条射线上的 3D 点全部塌缩到一个像素——把深度丢失这一事实可视化。",
    },
  },
  B2: {
    code: `import numpy as np, matplotlib.pyplot as plt

# Two calibrated views observe one 3D point; recover it by triangulation.
K = np.array([[800,0,320],[0,800,240],[0,0,1.]])
cam = lambda R, t: K @ np.hstack([R, t.reshape(3,1)])
P1 = cam(np.eye(3), np.zeros(3))
a = 0.4; R2 = np.array([[np.cos(a),0,np.sin(a)],[0,1,0],[-np.sin(a),0,np.cos(a)]])
C2 = np.array([1.5, 0, 0.]); P2 = cam(R2, -R2 @ C2)
X = np.array([0.5, -0.2, 4.0, 1.0])
proj = lambda P, X: (P @ X)[:2] / (P @ X)[2]

def triangulate(P1, P2, x1, x2):                  # DLT least squares
    A = np.stack([x1[0]*P1[2]-P1[0], x1[1]*P1[2]-P1[1], x2[0]*P2[2]-P2[0], x2[1]*P2[2]-P2[1]])
    _, _, Vt = np.linalg.svd(A); Xe = Vt[-1]; return Xe/Xe[3]
X_est = triangulate(P1, P2, proj(P1,X), proj(P2,X))
print("triangulation error:", round(np.linalg.norm(X_est - X), 5))

# Visualize: two camera centers, their rays, and the recovered intersection point.
fig = plt.figure(figsize=(5,4)); ax = fig.add_subplot(projection='3d')
for C in (np.zeros(3), C2):
    ax.plot(*np.stack([C, X[:3]]).T, 'k--', alpha=0.5); ax.scatter(*C, c='b', s=40)
ax.scatter(*X[:3], c='g', s=90, label='true'); ax.scatter(*X_est[:3], c='r', marker='x', s=90, label='triangulated')
ax.legend(); plt.title("two rays intersect at the 3D point"); plt.show()`,
    note: {
      en: "Triangulates a 3D point from two views via DLT and draws the camera centers, viewing rays, and their recovered intersection in 3D.",
      zh: "用 DLT 从两个视图三角测量一个 3D 点，并在 3D 中画出相机中心、视线及其恢复出的交点。",
    },
  },
  B3: {
    code: `import torch, matplotlib.pyplot as plt

# Bundle Adjustment: jointly optimize ALL poses AND points to minimize reprojection.
torch.manual_seed(0)
C, P = 3, 30
pts_true = torch.randn(P, 3) + torch.tensor([0,0,5.])
rot = torch.eye(3).expand(C, 3, 3); trans_true = torch.randn(C, 3) * 0.1
project = lambda pts, R, tr: (pts @ R.T + tr)[:, :2] / (pts @ R.T + tr)[:, 2:3]
obs = torch.stack([project(pts_true, rot[c], trans_true[c]) for c in range(C)])

pts   = (pts_true + 0.3*torch.randn_like(pts_true)).requires_grad_()
trans = (trans_true + 0.1*torch.randn_like(trans_true)).requires_grad_()
start = pts.detach().clone()
opt = torch.optim.Adam([pts, trans], lr=0.02); hist = []
for _ in range(400):
    opt.zero_grad()
    loss = ((torch.stack([project(pts, rot[c], trans[c]) for c in range(C)]) - obs)**2).mean()
    loss.backward(); opt.step(); hist.append(loss.item())
print("final reprojection error:", round(hist[-1], 6))

fig = plt.figure(figsize=(7.5, 3.3))
ax = fig.add_subplot(1,2,1); ax.plot(hist); ax.set_yscale('log')
ax.set_title("BA convergence"); ax.set_xlabel("iter"); ax.set_ylabel("reproj error")
ax = fig.add_subplot(1,2,2, projection='3d')
ax.scatter(*pts_true.T, c='g', s=20, label='true'); ax.scatter(*start.T.numpy(), c='r', marker='x', s=20, label='init')
ax.scatter(*pts.detach().T, c='b', s=20, label='refined'); ax.legend(); ax.set_title("3D points")
plt.show()`,
    note: {
      en: "A converging bundle-adjustment loop, visualized two ways: the reprojection-error curve and the 3D points moving from noisy init to the true positions.",
      zh: "一个收敛的光束法平差循环，用两种方式可视化：重投影误差曲线，以及 3D 点从含噪初值移动到真实位置。",
    },
  },
  B4: {
    code: `import torch, torch.nn as nn, matplotlib.pyplot as plt

# Geometry as a FUNCTION f(x): signed distance; surface = {f = 0}.
sphere_sdf = lambda p, r=1.0: p.norm(dim=-1) - r
mlp = nn.Sequential(nn.Linear(3,64), nn.Softplus(), nn.Linear(64,64), nn.Softplus(), nn.Linear(64,1))
opt = torch.optim.Adam(mlp.parameters(), 1e-3)
for _ in range(600):                              # train an MLP to BE the SDF
    x = torch.randn(512, 3) * 1.5
    loss = ((mlp(x).squeeze(-1) - sphere_sdf(x))**2).mean()
    opt.zero_grad(); loss.backward(); opt.step()
print("MLP learned the SDF, residual:", round(loss.item(), 4))

# Visualize a 2D slice of the LEARNED field; the black contour is the surface f=0.
g = torch.stack(torch.meshgrid(torch.linspace(-1.6,1.6,90), torch.linspace(-1.6,1.6,90),
                               indexing='ij'), -1)
grid3 = torch.cat([g, torch.zeros(90,90,1)], -1).reshape(-1,3)
field = mlp(grid3).detach().reshape(90,90)
plt.figure(figsize=(4.5,4))
plt.contourf(field, levels=20, cmap='RdBu'); plt.colorbar()
plt.contour(field, levels=[0], colors='k', linewidths=2)
plt.title("learned SDF slice (black contour = surface, f=0)"); plt.show()`,
    note: {
      en: "Trains an MLP to represent a signed-distance field and visualizes a 2D slice with the zero-level-set surface drawn as a contour.",
      zh: "训练 MLP 来表示符号距离场，并可视化一个 2D 切片，把零等值面表面画成等高线。",
    },
  },
  B5: {
    code: `import torch, torch.nn as nn, matplotlib.pyplot as plt

# NeRF: an MLP (x) -> (color, density). Positional encoding lets it fit detail.
def posenc(x, L=6):
    out = [x]
    for i in range(L):
        for fn in (torch.sin, torch.cos): out.append(fn(x * (2.0**i) * 3.14159))
    return torch.cat(out, -1)
mlp = nn.Sequential(nn.Linear(3*(1+2*6), 128), nn.ReLU(), nn.Linear(128, 4))
field = lambda p: (torch.sigmoid(mlp(posenc(p))[..., :3]), torch.relu(mlp(posenc(p))[..., 3]))

t = torch.linspace(2, 6, 64)                       # samples along one ray
pts = torch.stack([torch.zeros(64), torch.zeros(64), t], -1)
color, sigma = field(pts)
delta = (t[1]-t[0]).expand(64)
alpha = 1 - torch.exp(-sigma * delta)              # per-sample opacity
Tr = torch.cumprod(torch.cat([torch.ones(1), 1-alpha+1e-10])[:-1], 0)  # transmittance
w = Tr * alpha                                      # sample weights
pixel = (w[:, None] * color).sum(0)                # integrate color along the ray
print("rendered pixel RGB:", pixel.detach().round(decimals=3).tolist())

# Visualize the volume-rendering integral: density, weights, and the output color.
fig, ax = plt.subplots(1, 2, figsize=(7.5, 3.2))
ax[0].plot(t, sigma.detach(), label="density σ"); ax[0].plot(t, w.detach(), label="weight w")
ax[0].set_xlabel("t along ray"); ax[0].legend(); ax[0].set_title("what the ray integrates")
ax[1].imshow(pixel.detach().clamp(0,1).reshape(1,1,3)); ax[1].axis('off'); ax[1].set_title("rendered pixel")
plt.show()`,
    note: {
      en: "Implements NeRF's positional encoding + differentiable volume rendering and plots the density/weights along the ray with the resulting pixel color.",
      zh: "实现 NeRF 的位置编码 + 可微体渲染，画出沿射线的密度/权重曲线，以及最终得到的像素颜色。",
    },
  },
  B6: {
    code: `import torch, torch.nn as nn, matplotlib.pyplot as plt

# Instant-NGP: capacity lives in a MULTI-RESOLUTION HASH GRID; a tiny MLP reads it.
L, Tsize, Fdim = 4, 2**14, 2
resolutions = [4, 8, 16, 32]
tables = nn.ParameterList([nn.Parameter(torch.randn(Tsize, Fdim)) for _ in range(L)])
primes = torch.tensor([1, 2654435761, 805459861])
def hash_encode(x):                                # x in [0,1]^3 -> features
    feats = []
    for table, res in zip(tables, resolutions):
        cell = (x * res).long()                     # local grid cell (cheap, local)
        idx  = (cell * primes).sum(-1) % Tsize      # spatial hash (collisions tolerated)
        feats.append(table[idx])
    return torch.cat(feats, -1)
print("feature dim per point:", L*Fdim, "(read by a tiny MLP)")

# Visualize one feature channel of EACH resolution level over a 2D slice -> the
# blocky multi-resolution structure that makes training fast.
gx = torch.stack(torch.meshgrid(torch.linspace(0,1,96), torch.linspace(0,1,96),
                                indexing='ij'), -1)
g3 = torch.cat([gx, torch.zeros(96,96,1)], -1).reshape(-1,3)
fig, ax = plt.subplots(1, L, figsize=(11, 3))
for lvl in range(L):
    cell = (g3 * resolutions[lvl]).long()
    idx = (cell * primes).sum(-1) % Tsize
    ax[lvl].imshow(tables[lvl][idx][:,0].detach().reshape(96,96), cmap='viridis')
    ax[lvl].set_title(f"res {resolutions[lvl]}"); ax[lvl].axis('off')
plt.suptitle("multi-resolution hash features (coarse -> fine)"); plt.show()`,
    note: {
      en: "Builds the multi-resolution hash encoding and visualizes each level's feature field over a slice — the coarse→fine grid structure behind Instant-NGP's speed.",
      zh: "搭出多分辨率哈希编码，并把每个层级的特征场在切片上可视化——这正是 Instant-NGP 提速背后的由粗到细网格结构。",
    },
  },
  B7: {
    code: `import torch, matplotlib.pyplot as plt
from matplotlib.patches import Ellipse

# A scene = many explicit 3D GAUSSIANS (position, scale, color, opacity, + a label).
torch.manual_seed(1); N = 12
means   = torch.rand(N, 3) * torch.tensor([4.,4.,3.]) + torch.tensor([-2,-2,4.])
scales  = torch.rand(N) * 30 + 8
colors  = torch.rand(N, 3); opacity = torch.rand(N)*0.6 + 0.4
K = torch.tensor([[400,0,128.],[0,400,128.],[0,0,1.]])
uv = torch.stack([(K @ m)[:2] / (K @ m)[2] for m in means])      # splat centers -> 2D

# Render by FRONT-TO-BACK alpha blending (the rasterizer core).
pixel, Tr = torch.zeros(3), 1.0
for i in torch.argsort(means[:,2]):
    a = opacity[i].item(); pixel = pixel + Tr*a*colors[i]; Tr = Tr*(1-a)
print("rasterized center pixel:", pixel.round(decimals=2).tolist())

# Visualize the splatted 2D Gaussians (size ~ scale, alpha ~ opacity).
fig, ax = plt.subplots(figsize=(4.5,4.5))
for i in torch.argsort(-means[:,2]):                              # far -> near
    ax.add_patch(Ellipse(uv[i].tolist(), scales[i].item(), scales[i].item()*0.7,
                 color=colors[i].tolist(), alpha=opacity[i].item()))
ax.set_xlim(0,256); ax.set_ylim(256,0); ax.set_title("3D Gaussians splatted to 2D"); plt.show()`,
    note: {
      en: "Splats explicit 3D Gaussians to 2D and renders them as alpha-blended ellipses (size~scale, alpha~opacity) — the rasterizer that makes 3DGS real-time.",
      zh: "把显式 3D 高斯泼溅到 2D，并以 alpha 混合的椭圆渲染（大小~尺度，透明度~不透明度）——这正是让 3DGS 实时的光栅化器。",
    },
  },
  B8: {
    code: `import torch, torch.nn as nn, matplotlib.pyplot as plt

# 4D = a CANONICAL model (rest scene) + a DEFORMATION field warping time t into it.
canonical = nn.Sequential(nn.Linear(3,64), nn.ReLU(), nn.Linear(64,4))   # shared over time
deform    = nn.Sequential(nn.Linear(4,64), nn.Tanh(), nn.Linear(64,3))   # (x,t) -> delta x
def render_at(x, t):
    dx = deform(torch.cat([x, torch.full_like(x[:, :1], t)], -1))
    return canonical(x + dx), dx

# A grid of points; SAME canonical model, motion grows with time.
g = torch.stack(torch.meshgrid(torch.linspace(-1,1,12), torch.linspace(-1,1,12),
                               indexing='ij'), -1).reshape(-1,3)
g = torch.cat([g[:,:2], torch.zeros(len(g),1)], -1).requires_grad_()
_, d1 = render_at(g, 1.0)
print("appearance shared across time; only the deformation field varies")

fig, ax = plt.subplots(1, 2, figsize=(8, 3.6))
xn, dn = g.detach().numpy(), d1.detach().numpy()
ax[0].quiver(xn[:,0], xn[:,1], dn[:,0], dn[:,1], angles='xy'); ax[0].set_title("deformation field at t=1")
nbr = torch.cdist(g, g).topk(4, largest=False).indices            # as-rigid-as-possible
arap = (d1[nbr] - d1[:, None]).pow(2).mean(-1).mean(-1).detach()
sc = ax[1].scatter(xn[:,0], xn[:,1], c=arap, cmap='plasma'); plt.colorbar(sc, ax=ax[1])
ax[1].set_title("local-rigidity (ARAP) penalty"); plt.show()`,
    note: {
      en: "Factors a dynamic scene into a canonical model + deformation field, drawing the deformation as a quiver field and the as-rigid-as-possible penalty as a heatmap.",
      zh: "把动态场景分解为标准模型 + 形变场，用箭头场画出形变，用热图画出尽可能刚性（ARAP）惩罚。",
    },
  },
  B9: {
    code: `import torch, torch.nn as nn, matplotlib.pyplot as plt

# Minimal end-to-end NeRF: representation -> renderer -> photometric loss.
def posenc(x, L=4):
    return torch.cat([x] + [f(x*(2.0**i)) for i in range(L) for f in (torch.sin, torch.cos)], -1)
mlp = nn.Sequential(nn.Linear(3*(1+2*4), 128), nn.ReLU(), nn.Linear(128, 4))
def render(p, delta):
    o = mlp(posenc(p)); c, s = torch.sigmoid(o[..., :3]), torch.relu(o[..., 3])
    a = 1 - torch.exp(-s * delta)
    Tr = torch.cumprod(torch.cat([torch.ones(p.shape[0],1), 1-a+1e-10], 1)[:, :-1], 1)
    return (Tr*a).unsqueeze(-1).mul(c).sum(1), a

R, S = 16, 32                                      # toy "posed rays" dataset
t = torch.linspace(2,6,S); delta = (t[1]-t[0]).expand(R,S)
pts = torch.randn(R,1,3)*0.1 + torch.stack([torch.zeros(S),torch.zeros(S),t], -1)
gt  = torch.rand(R, 3)
opt = torch.optim.Adam(mlp.parameters(), 5e-3); hist = []
for _ in range(300):
    opt.zero_grad(); pix, a = render(pts, delta)
    photo = ((pix - gt)**2).mean()
    (photo + 1e-3*a.mean()).backward(); opt.step(); hist.append(photo.item())
print("final photometric loss:", round(hist[-1], 4))

fig, ax = plt.subplots(1, 2, figsize=(7.5, 3.2))
ax[0].plot(hist); ax[0].set_yscale('log'); ax[0].set_title("photometric loss"); ax[0].set_xlabel("iter")
pix, _ = render(pts, delta)
ax[1].imshow(torch.stack([gt, pix.detach().clamp(0,1)]).reshape(2, R, 3))
ax[1].set_yticks([0,1]); ax[1].set_yticklabels(['target','rendered']); ax[1].set_title("pixels")
plt.show()`,
    note: {
      en: "A complete miniature NeRF training run, visualized by the photometric-loss curve and a target-vs-rendered pixel strip (with a floater-suppressing sparsity term).",
      zh: "完整的微型 NeRF 训练，用光度损失曲线和「目标 vs 渲染」像素条可视化（含抑制漂浮物的稀疏项）。",
    },
  },

  // ===================== Track C — Egocentric Vision =====================
  C1: {
    code: `import torch, matplotlib.pyplot as plt

H = W = 64
prev = torch.rand(3, H, W)
cur  = torch.roll(prev, shifts=(2, 3), dims=(1, 2))    # the camera moved with the head
print("ego-motion magnitude (attention signal):", round((cur - prev).abs().mean().item(), 3))

# Hands & objects dominate the CENTER-BOTTOM, where manipulation happens.
yy, xx = torch.meshgrid(torch.linspace(0,1,H), torch.linspace(0,1,W), indexing='ij')
manip = torch.exp(-(((xx-0.5)**2)/0.1 + ((yy-0.8)**2)/0.1))   # prior peaks center-bottom

# Visualize the two defining signals: inter-frame motion and the manipulation prior.
fig, ax = plt.subplots(1, 2, figsize=(7.5, 3.3))
ax[0].imshow((cur-prev).abs().mean(0)); ax[0].set_title("inter-frame motion (ego-motion)")
ax[1].imshow(manip, cmap='hot'); ax[1].set_title("manipulation prior (center-bottom)")
for a in ax: a.axis('off')
plt.show()`,
    note: {
      en: "Visualizes two defining egocentric signals as heatmaps: the inter-frame ego-motion field and the center-bottom manipulation prior.",
      zh: "把两种定义第一人称的信号画成热图：帧间自我运动场，以及中下部的操作先验。",
    },
  },
  C2: {
    code: `from collections import Counter
import random, matplotlib.pyplot as plt
random.seed(0)

# EPIC-style: action = (verb, noun). The class distribution is long-tailed.
verbs, nouns = ["take","put","cut","wash","open"], ["knife","onion","plate","tap","pan"]
anns = [(random.choice(verbs), random.choices(nouns, weights=[5,4,3,2,1])[0],
         f"P{random.randint(1,3):02d}") for _ in range(300)]
dist = Counter(f"{v}:{n}" for v, n, _ in anns)
print("most common:", dist.most_common(3), "| singletons:", sum(c==1 for c in dist.values()))

# Hold out whole PARTICIPANTS -> no scene leakage (vs a random split).
test_p = {sorted({p for *_, p in anns})[-1]}
train = [a for a in anns if a[2] not in test_p]; test = [a for a in anns if a[2] in test_p]
print(f"participant-held-out split: train={len(train)} test={len(test)}")

# Visualize the long-tailed action frequency (a few common, a long rare tail).
items = dist.most_common()
plt.figure(figsize=(7, 3))
plt.bar(range(len(items)), [c for _, c in items])
plt.title("action frequency: the long tail of egocentric data")
plt.xlabel("action (ranked)"); plt.ylabel("count"); plt.show()`,
    note: {
      en: "Builds verb–noun actions with a leakage-free participant split and plots the long-tailed action-frequency distribution that defines egocentric benchmarks.",
      zh: "构造动词–名词动作与无泄漏的按参与者划分，并画出定义第一人称基准的长尾动作频率分布。",
    },
  },
  C3: {
    code: `import torch, torch.nn as nn, matplotlib.pyplot as plt

clip = torch.randn(1, 3, 32, 56, 56)                  # (B, C, T, H, W): a 32-frame clip
# SlowFast: TWO pathways at different frame rates, fused by a lateral connection.
slow, fast = clip[:, :, ::8], clip[:, :, ::2]         # few hi-detail vs many lo-capacity
slow_net, fast_net, lateral = nn.Conv3d(3,64,1), nn.Conv3d(3,8,1), nn.Conv3d(8,64,1)
fused = slow_net(slow) + lateral(fast_net(fast)[:, :, ::4])
print("SlowFast fused feature:", tuple(fused.shape))

# VideoMAE: TUBE masking - hide the SAME patches across all frames, at ~90%.
T, side = 16, 14
N = side*side; keep = int(0.10 * N)
vis = torch.randperm(N)[:keep]
mask = torch.ones(T, N, dtype=torch.bool); mask[:, vis] = False
print(f"masked {mask.float().mean()*100:.0f}% of patches (kills the copy-neighbour shortcut)")

# Visualize: the tube mask (one frame's grid) and the slow/fast frame sampling.
fig, ax = plt.subplots(1, 2, figsize=(7.5, 3.3))
ax[0].imshow(mask[0].reshape(side, side), cmap='gray'); ax[0].set_title("tube mask (one frame, ~90%)")
ax[0].axis('off')
ax[1].eventplot([torch.arange(0,32,8).tolist(), torch.arange(0,32,2).tolist()], colors=['b','r'])
ax[1].set_yticks([0,1]); ax[1].set_yticklabels(['slow','fast']); ax[1].set_title("SlowFast sampling")
plt.show()`,
    note: {
      en: "Runs both video paradigms and visualizes them: the VideoMAE tube mask as a patch grid and the SlowFast two-rate frame sampling as an event plot.",
      zh: "运行两种视频范式并可视化：把 VideoMAE 管状掩码画成块网格，把 SlowFast 双速率抽帧画成事件图。",
    },
  },
  C4: {
    code: `import torch, torch.nn as nn, torch.nn.functional as F, matplotlib.pyplot as plt

# RECOGNITION (present): predict (verb, noun) of the current segment.
feat = torch.randn(1, 512)
print("recognized (verb,noun):", (nn.Linear(512,5)(feat).argmax(-1).item(),
                                  nn.Linear(512,10)(feat).argmax(-1).item()))

# ANTICIPATION (near future): predict the NEXT action distribution from past video.
probs = F.softmax(nn.Linear(512, 20)(feat), -1)[0]    # the future is multi-modal
true_next = 7
top5 = probs.topk(5).indices.tolist()
print("top-5 predicted next actions:", top5, "| true in top-5:", true_next in top5)

# Visualize the next-action distribution: top-5 highlighted, the true one outlined.
plt.figure(figsize=(7, 3))
bars = plt.bar(range(20), probs.detach())
for i in top5: bars[i].set_color('orange')
bars[true_next].set_edgecolor('k'); bars[true_next].set_linewidth(2.5)
plt.title("anticipation: distribution over next actions (top-5 orange, true outlined)")
plt.xlabel("action class"); plt.ylabel("probability"); plt.show()`,
    note: {
      en: "Implements recognition and anticipation, then plots the next-action probability distribution with the top-5 set and the ground-truth action highlighted.",
      zh: "实现识别与预判，并画出下一动作的概率分布，高亮 top-5 集合与真实动作。",
    },
  },
  C5: {
    code: `import torch, matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

H, W = 480, 640
# Hand boxes (x1,y1,x2,y2): classify SIDE (by x) and OWNERSHIP (bottom-edge prior).
boxes = torch.tensor([[ 40, 360, 220, 480.], [430, 350, 600, 480.], [260, 60, 360, 160.]])
side  = lambda b: "left" if (b[0]+b[2])/2 < W/2 else "right"
is_own = lambda b: bool(b[3] > 0.85 * H)              # own hands enter from the BOTTOM
for b in boxes: print(f"x={int(b[0]):3d} side={side(b):5s} own={is_own(b)}")

# Per-pixel masks (not boxes) resolve hand/object occlusion for the next stage (C6).
mask = torch.zeros(H, W); mask[360:, 40:220] = 1; mask[380:430, 180:260] = 2

# Visualize: the frame with masks + boxes (green = own hand, red = other).
fig, ax = plt.subplots(figsize=(5.2, 4)); ax.imshow(mask, cmap='tab10', alpha=0.4)
for b in boxes:
    ax.add_patch(Rectangle((b[0],b[1]), b[2]-b[0], b[3]-b[1], fill=False,
                 ec='lime' if is_own(b) else 'red', lw=2))
    ax.text(b[0], b[1]-6, f"{side(b)}/{'own' if is_own(b) else 'other'}", color='k', fontsize=8)
ax.set_xlim(0,W); ax.set_ylim(H,0); ax.set_title("hand boxes (green=own) + segmentation masks")
plt.show()`,
    note: {
      en: "Applies the first-person hand priors (side, ownership) and draws the frame with hand boxes and segmentation masks overlaid.",
      zh: "运用第一人称手部先验（左右、归属），并把手框与分割掩码叠加画到画面上。",
    },
  },
  C6: {
    code: `import torch, matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

def iou(a, b):
    x1,y1,x2,y2 = max(a[0],b[0]), max(a[1],b[1]), min(a[2],b[2]), min(a[3],b[3])
    inter = max(0,x2-x1)*max(0,y2-y1)
    return inter / ((a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - inter + 1e-9)

hand = [300,300,380,400]
objs = {"knife":[360,320,560,360], "plate":[100,100,200,200], "cup":[360,360,440,450]}
contact = {n: round(iou(hand, b), 3) for n, b in objs.items()}
active = max(contact, key=contact.get)
print("contact (IoU):", contact, "-> active object:", active)

# Visualize: hand (blue), objects (gray), active object highlighted (orange).
fig, ax = plt.subplots(figsize=(5.2, 4))
ax.add_patch(Rectangle((hand[0],hand[1]), hand[2]-hand[0], hand[3]-hand[1], fill=False, ec='blue', lw=2))
ax.text(hand[0], hand[1]-6, "hand", color='blue')
for n, b in objs.items():
    col = 'orange' if n == active else 'gray'
    ax.add_patch(Rectangle((b[0],b[1]), b[2]-b[0], b[3]-b[1], fill=False, ec=col, lw=2))
    ax.text(b[0], b[1]-6, f"{n} ({contact[n]})", color=col)
ax.set_xlim(0,640); ax.set_ylim(480,0); ax.set_title(f"active object = {active}"); plt.show()`,
    note: {
      en: "Selects the active object by hand-contact IoU and draws the scene with the hand, all objects, and the manipulated object highlighted.",
      zh: "用手部接触 IoU 选出活动物体，并画出含手、所有物体、以及被操作物体高亮的场景。",
    },
  },
  C7: {
    code: `import torch, matplotlib.pyplot as plt

H = W = 32
# Gaze = where the eye fixates -> a Gaussian ATTENTION map over features.
gaze = torch.tensor([0.65, 0.4])
ys, xs = torch.linspace(0,1,H)[:,None], torch.linspace(0,1,W)[None,:]
g = torch.exp(-(((xs-gaze[0])**2 + (ys-gaze[1])**2) / (2*0.04))); g = g / g.sum()
feat = torch.randn(64, H, W)
pooled = (feat * g).sum((1, 2))                       # gaze-pooled feature
print("gaze-attended feature:", tuple(pooled.shape))

# Gaze LEADS the hand: fixation lands on the target before the reach -> anticipation.
gaze_t = torch.arange(10, 14); hand_t = gaze_t + 4
print("gaze leads hand by", int((hand_t - gaze_t).float().mean()), "frames")

# Visualize the gaze attention map with the fixation point + the lead-time timeline.
fig, ax = plt.subplots(1, 2, figsize=(8, 3.3))
ax[0].imshow(g, cmap='hot', extent=[0,1,1,0]); ax[0].scatter(*gaze, c='cyan', marker='x', s=120)
ax[0].set_title("gaze attention map")
ax[1].eventplot([gaze_t.tolist(), hand_t.tolist()], colors=['b','r'])
ax[1].set_yticks([0,1]); ax[1].set_yticklabels(['gaze','hand']); ax[1].set_title("gaze leads the hand")
plt.show()`,
    note: {
      en: "Visualizes gaze as a Gaussian attention heatmap with the fixation point, plus a timeline showing gaze leads the hand (the anticipation cue).",
      zh: "把注视可视化为带注视点的高斯注意力热图，并用时间线展示注视领先于手（预判线索）。",
    },
  },
  C8: {
    code: `import networkx as nx, matplotlib.pyplot as plt

# Tasks have STRUCTURE: an action grammar (partial order) + an inferable goal.
actions = ["grind", "add_water", "brew", "pour", "add_milk"]
precede = {"brew": {"grind","add_water"}, "pour": {"brew"}}
valid_next = lambda done: [a for a in actions if a not in done and precede.get(a,set()) <= done]
print("after {'grind'} valid next:", valid_next({"grind"}))

# GOAL INFERENCE collapses the future onto a known procedure.
goals = {"latte": ["grind","add_water","brew","pour","add_milk"],
         "espresso": ["grind","add_water","brew","pour"]}
observed = ["grind","add_water","brew"]
post = {g: sum(a in s for a in observed)/len(observed) for g, s in goals.items()}
print("goal posterior:", post, "-> inferred:", max(post, key=post.get))

# Visualize the action grammar (precedence DAG) and the goal posterior.
G = nx.DiGraph()
for a, deps in precede.items():
    for d in deps: G.add_edge(d, a)
fig, ax = plt.subplots(1, 2, figsize=(9, 3.3))
nx.draw(G, nx.spring_layout(G, seed=1), with_labels=True, ax=ax[0],
        node_color='lightblue', node_size=1500, font_size=8)
ax[0].set_title("action grammar (preconditions)")
ax[1].bar(post.keys(), post.values()); ax[1].set_title("inferred goal posterior"); plt.show()`,
    note: {
      en: "Models the task as a partial-order action grammar and goal inference, drawing the precedence graph and the goal posterior bar chart.",
      zh: "把任务建模为偏序动作语法与目标推断，画出先后关系图与目标后验柱状图。",
    },
  },
  C9: {
    code: `import torch, torch.nn as nn, torch.nn.functional as F, matplotlib.pyplot as plt

# Honest baseline: FROZEN features + a small head; report top-k on a held-out split.
torch.manual_seed(0); N, D, K = 600, 256, 20
labels = torch.randint(0, K, (N,))
feats  = torch.randn(N, D) + F.one_hot(labels, K).float() @ torch.randn(K, D)   # signal+noise
tr, te = slice(0,500), slice(500,N)
def train_head(x):
    head = nn.Linear(D, K); opt = torch.optim.Adam(head.parameters(), 1e-2)
    for _ in range(300):
        opt.zero_grad(); F.cross_entropy(head(x[tr]), labels[tr]).backward(); opt.step()
    return head
head = train_head(feats)
topk = lambda k: (head(feats[te]).topk(k,-1).indices == labels[te][:,None]).any(-1).float().mean().item()
shuf = train_head(feats[torch.randperm(N)])           # ABLATION control: destroy signal
acc_ctrl = (shuf(feats[te]).argmax(-1) == labels[te]).float().mean().item()
print(f"top-1={topk(1):.2f} top-5={topk(5):.2f} | shuffled control={acc_ctrl:.2f} (~chance {1/K:.2f})")

# Visualize: baseline metrics vs the shuffle control vs chance.
plt.figure(figsize=(5, 3))
plt.bar(["baseline\\ntop-1","baseline\\ntop-5","shuffled\\ntop-1"], [topk(1), topk(5), acc_ctrl])
plt.axhline(1/K, ls='--', c='r', label='chance'); plt.ylim(0,1)
plt.title("honest baseline vs shuffle control"); plt.legend(); plt.show()`,
    note: {
      en: "Trains a frozen-feature baseline with a shuffle-control ablation and plots top-1/top-5 against the control and chance to prove the metric is real.",
      zh: "训练冻结特征基线并做打乱对照消融，画出 top-1/top-5 与对照、随机水平的对比，证明指标可信。",
    },
  },

  // ===================== Track D — Scene & World Models =====================
  D1: {
    code: `import numpy as np, matplotlib.pyplot as plt
np.random.seed(0)

# Front-end (visual odometry): integrate NOISY frame-to-frame motion -> DRIFT.
N = 120
true_steps  = np.column_stack([np.cos(np.linspace(0,2*np.pi,N)),
                               np.sin(np.linspace(0,2*np.pi,N))]) * 0.1   # a closed loop
odom = np.cumsum(true_steps + np.random.randn(N,2)*0.012, 0)
print("drift at loop end:", round(np.linalg.norm(odom[-1]-odom[0]), 3))

# Loop closure + back-end: redistribute the accumulated error around the loop.
corrected = odom - np.linspace(0,1,N)[:,None] * (odom[-1]-odom[0])
print("drift after loop closure:", round(np.linalg.norm(corrected[-1]-corrected[0]), 3))

# Visualize the drifted vs corrected trajectory (loop closure snaps it shut).
plt.figure(figsize=(4.5, 4.5))
plt.plot(odom[:,0], odom[:,1], 'r-', label='odometry (drifts)')
plt.plot(corrected[:,0], corrected[:,1], 'b-', label='after loop closure')
plt.scatter(*odom[0], c='k', zorder=3, label='start/end')
plt.axis('equal'); plt.legend(); plt.title("SLAM: drift vs loop-closure correction"); plt.show()`,
    note: {
      en: "Simulates the SLAM paradox and plots the drifting odometry trajectory against the loop-closure-corrected one snapping the loop shut.",
      zh: "模拟 SLAM 悖论，并画出漂移的里程计轨迹与回环校正后闭合的轨迹对比。",
    },
  },
  D2: {
    code: `import torch, matplotlib.pyplot as plt

# SLAM = Track B geometry, online. TRACKING each frame = PnP (pose from 3D<->2D).
K = torch.tensor([[600,0,320.],[0,600,240.],[0,0,1.]])
pts3d = torch.randn(40, 3) + torch.tensor([0,0,4.])
R, t_true = torch.eye(3), torch.tensor([0.3,-0.2,0.1])
def project(P, t):
    p = P @ R.T + t; uv = (K @ p.T).T; return uv[:, :2] / uv[:, 2:3]
obs = project(pts3d, t_true)

t = torch.zeros(3, requires_grad=True); opt = torch.optim.Adam([t], lr=0.02); hist = []
for _ in range(300):                              # PnP by reprojection minimization
    opt.zero_grad(); loss = ((project(pts3d, t) - obs)**2).mean()
    loss.backward(); opt.step(); hist.append(loss.item())
print("recovered translation:", t.detach().round(decimals=2).tolist(), "| true:", t_true.tolist())

# Visualize PnP convergence and the predicted vs observed 2D projections.
fig, ax = plt.subplots(1, 2, figsize=(7.5, 3.3))
ax[0].plot(hist); ax[0].set_yscale('log'); ax[0].set_title("PnP convergence"); ax[0].set_xlabel("iter")
ax[1].scatter(*obs.T, c='g', s=12, label='observed'); ax[1].scatter(*project(pts3d, t).detach().T, c='r', marker='x', s=12, label='reprojected')
ax[1].legend(); ax[1].invert_yaxis(); ax[1].set_title("tracking = PnP (B geometry, online)"); plt.show()`,
    note: {
      en: "Solves PnP by reprojection minimization and visualizes the convergence curve plus reprojected points landing on the observed detections.",
      zh: "用重投影最小化求解 PnP，并可视化收敛曲线，以及重投影点落到观测检测上。",
    },
  },
  D3: {
    code: `import numpy as np, matplotlib.pyplot as plt
np.random.seed(0)

# TSDF fusion: average many NOISY depth frames into one clean surface.
voxels = np.linspace(0, 2, 81); trunc = 0.2
tsdf = np.zeros_like(voxels); weight = np.zeros_like(voxels)
snapshots = []
for i in range(50):                               # 50 noisy depth measurements
    depth = 1.0 + np.random.randn()*0.05
    sdf = np.clip((depth - voxels)/trunc, -1, 1)  # TRUNCATED signed distance
    near = np.abs(depth - voxels) < trunc
    tsdf[near] = (weight[near]*tsdf[near] + sdf[near]) / (weight[near]+1)   # weighted avg
    weight[near] += 1
    if i in (0, 4, 49): snapshots.append((i+1, tsdf.copy()))

zc = np.where(np.diff(np.sign(tsdf[weight>0])))[0]
print("fused surface depth:", voxels[weight>0][zc].round(3), "(true 1.0)")

# Visualize the TSDF converging to a clean zero-crossing as frames accumulate.
plt.figure(figsize=(6, 3.3))
for n, snap in snapshots:
    plt.plot(voxels[weight>0], snap[weight>0], '-o', ms=2, label=f"{n} frame(s)")
plt.axhline(0, c='gray', ls='--'); plt.axvline(1.0, c='g', ls=':', label='true surface')
plt.title("TSDF fusion: noise averages out to a clean surface")
plt.xlabel("depth"); plt.ylabel("TSDF"); plt.legend(fontsize=8); plt.show()`,
    note: {
      en: "Runs TSDF fusion over 50 noisy depth frames and plots the truncated field sharpening to a clean zero-crossing (the surface) as frames accumulate.",
      zh: "对 50 帧含噪深度做 TSDF 融合，并画出随帧累积、截断场收敛到干净零交叉（表面）的过程。",
    },
  },
  D4: {
    code: `import torch, torch.nn.functional as F, matplotlib.pyplot as plt

# Fuse per-frame 2D labels into a 3D element via BAYESIAN multi-frame fusion.
n_classes, true_class = 4, 2; torch.manual_seed(0)
logp = torch.zeros(n_classes); history = []
for _ in range(15):                              # 15 noisy 2D observations
    obs = F.one_hot(torch.tensor(true_class), n_classes).float()*2 + torch.randn(n_classes)
    logp = logp + F.log_softmax(obs, -1); logp = logp - logp.logsumexp(0)   # renormalize
    history.append(logp.exp().tolist())
print("fused posterior:", [round(p,3) for p in logp.exp().tolist()], "-> argmax", logp.argmax().item())

# Open-vocabulary: match a language query to per-element CLIP features.
voxel_clip = F.normalize(torch.randn(5, 16), dim=1); query = F.normalize(torch.randn(16), dim=0)
print("language-query best match: element", (voxel_clip @ query).argmax().item())

# Visualize the posterior over classes sharpening as evidence accumulates.
import numpy as np; H = np.array(history)
plt.figure(figsize=(6, 3.3))
for c in range(n_classes): plt.plot(H[:, c], label=f"class {c}" + (" (true)" if c==true_class else ""))
plt.title("Bayesian label fusion: multi-frame voting sharpens the belief")
plt.xlabel("frame"); plt.ylabel("P(class)"); plt.legend(fontsize=8); plt.show()`,
    note: {
      en: "Runs Bayesian multi-frame label fusion (with open-vocabulary CLIP matching) and plots the per-class posterior sharpening toward the true class over frames.",
      zh: "运行贝叶斯多帧标签融合（含开放词汇 CLIP 匹配），并画出逐帧各类别后验向真实类别收敛。",
    },
  },
  D5: {
    code: `import networkx as nx, matplotlib.pyplot as plt

# 3D scene graph: nodes = objects/places, edges = relations + hierarchy.
g = nx.DiGraph()
g.add_edge("building","floor1", rel="has"); g.add_edge("floor1","kitchen", rel="has")
g.add_edge("kitchen","table", rel="has"); g.add_edge("mug","table", rel="on")
g.add_edge("table","kitchen", rel="in"); g.add_edge("kettle","table", rel="on")

# Relational queries a flat semantic map cannot answer:
print("is the mug in the kitchen?:", nx.has_path(g, "mug", "kitchen"))
print("what is on the table?:", [u for u,v,d in g.edges(data=True) if v=="table" and d["rel"]=="on"])

# Visualize the graph with relation labels (compact + symbolic -> LLM-ready).
pos = nx.spring_layout(g, seed=3)
plt.figure(figsize=(5.5, 4.5))
nx.draw(g, pos, with_labels=True, node_color='lightgreen', node_size=1500, font_size=8, arrows=True)
nx.draw_networkx_edge_labels(g, pos, font_size=8,
    edge_labels={(u,v): d['rel'] for u,v,d in g.edges(data=True)})
plt.title("3D scene graph: objects (nodes) + relations (edges)"); plt.show()`,
    note: {
      en: "Builds a hierarchical 3D scene graph, runs relational queries, and draws the nodes-and-relations graph an LLM/planner can consume.",
      zh: "构建分层 3D 场景图，运行关系查询，并画出 LLM/规划器可消费的「节点 + 关系」图。",
    },
  },
  D6: {
    code: `import numpy as np, matplotlib.pyplot as plt

# SPACE-CENTRIC map (occupancy grid): answers "where can I go / collide?"
grid = np.zeros((12, 12)); grid[4:9, 6] = 1; grid[8, 3:7] = 1   # an L-shaped wall
print("stand at (5,5)?:", grid[5,5]==0, "| free cells:", int((grid==0).sum()))

# OBJECT-CENTRIC map (objects + relations): answers "what & how / relations?"
objects = [{"id":"mug","on":"table","graspable":True}, {"id":"table","on":"floor","graspable":False}]
print("graspable:", [o["id"] for o in objects if o["graspable"]])

# Visualize the two paradigms side by side: a metric grid vs an object/relation list.
fig, ax = plt.subplots(1, 2, figsize=(8, 3.6))
ax[0].imshow(grid, cmap='gray_r'); ax[0].set_title("space-centric: occupancy grid"); ax[0].set_xticks([]); ax[0].set_yticks([])
ax[1].axis('off'); ax[1].set_title("object-centric: relations")
txt = "\\n".join(f"{o['id']}  --on-->  {o['on']}   graspable={o['graspable']}" for o in objects)
ax[1].text(0.05, 0.6, txt, fontsize=10, family='monospace')
plt.suptitle("no free lunch -> mature systems keep BOTH"); plt.show()`,
    note: {
      en: "Contrasts the two map paradigms visually: an occupancy grid (navigation/collision) beside an object/relation list (manipulation/language).",
      zh: "把两种地图范式可视化对比：占据栅格（导航/碰撞）与物体/关系列表（操作/语言）并排呈现。",
    },
  },
  D7: {
    code: `import numpy as np, matplotlib.pyplot as plt

# REFERENCE FRAMES: 'left of the chair' depends on the frame you commit to.
chair_t = np.array([2., 1.]); theta = np.deg2rad(90)          # chair faces +y
chair_R = np.array([[np.cos(theta),-np.sin(theta)],[np.sin(theta),np.cos(theta)]])
point = np.array([1.2, 1.3])
local = chair_R.T @ (point - chair_t)                          # world -> chair frame
print("in the chair's frame the point is to its", "left" if local[0] < 0 else "right")

# Visualize: the same point is 'left'/'right' only relative to the chair's frame.
plt.figure(figsize=(4.6, 4.6))
plt.scatter(*chair_t, c='brown', s=200, marker='s', label='chair')
plt.quiver(*chair_t, *chair_R[:,0], color='orange', scale=6, label="chair's right")
plt.quiver(*chair_t, *chair_R[:,1], color='green', scale=6, label="chair's front")
plt.scatter(*point, c='b', s=80, label='point')
plt.legend(fontsize=8); plt.axis('equal'); plt.grid(alpha=0.3)
plt.title(f"'left of the chair' needs a reference frame"); plt.show()`,
    note: {
      en: "Demonstrates reference frames: transforms a point into the chair's frame and plots the frame axes so 'left of the chair' becomes unambiguous.",
      zh: "演示参照系：把一个点变换到椅子的参照系，并画出参照系坐标轴，使「椅子左边」不再有歧义。",
    },
  },
  D8: {
    code: `import torch, torch.nn as nn, matplotlib.pyplot as plt

# A WORLD MODEL = learned dynamics: predict next state from (state, action).
state_dim, act_dim = 8, 3
dynamics = nn.Sequential(nn.Linear(state_dim+act_dim, 64), nn.Tanh(), nn.Linear(64, state_dim))
reward   = nn.Linear(state_dim, 1)
def imagine(s0, plan):                            # roll the future forward internally
    s, total = s0, 0.0
    for a in plan: s = dynamics(torch.cat([s, a])); total = total + reward(s)
    return total

s0 = torch.randn(state_dim)
plans = [torch.randn(4, act_dim) for _ in range(24)]   # candidate 4-step action plans
returns = [imagine(s0, p).item() for p in plans]       # PLAN by simulation
best = int(torch.tensor(returns).argmax())
print("best imagined return:", round(returns[best], 2), "among", len(plans), "rollouts")

# Visualize predicted return per imagined plan (the agent picks the orange one).
plt.figure(figsize=(6.5, 3))
bars = plt.bar(range(len(plans)), returns); bars[best].set_color('orange')
plt.title("world model: predicted return of each imagined plan (best = orange)")
plt.xlabel("candidate plan"); plt.ylabel("imagined return"); plt.show()`,
    note: {
      en: "Implements a world model (learned dynamics + reward) and plots the predicted return of many imagined rollouts, highlighting the plan it would choose.",
      zh: "实现世界模型（学到的动力学 + 奖励），画出众多想象滚动的预测回报，并高亮它会选择的方案。",
    },
  },
  D9: {
    code: `import numpy as np, networkx as nx, matplotlib.pyplot as plt
np.random.seed(0)

# CAPSTONE: pixels -> world memory. Wire every track into one runnable pipeline.
frames = [{"depth": 1.0 + np.random.randn()*0.05, "label": 2} for _ in range(20)]
poses = [np.eye(4) for _ in frames]                    # 1) SLAM/SfM poses (B3/D2)
tsdf, w, hist = 0.0, 0, []                              # 2) TSDF fusion (D3)
for f in frames:
    tsdf = (w*tsdf + np.clip(f["depth"]-1.0, -1, 1))/(w+1); w += 1; hist.append(tsdf)
obj = int(np.bincount([f["label"] for f in frames]).argmax())   # 3) semantics (D4)
g = nx.DiGraph(); g.add_edge(f"obj{obj}", "table", rel="on"); g.add_edge("table","kitchen", rel="in")
print("object in kitchen?:", nx.has_path(g, f"obj{obj}", "kitchen"))   # 4) scene graph (D5)

# Visualize the pipeline: geometry fusion converging + the resulting scene graph.
fig, ax = plt.subplots(1, 2, figsize=(8.5, 3.5))
ax[0].plot(hist); ax[0].axhline(0, c='g', ls='--'); ax[0].set_title("D3: TSDF fuses to the surface")
ax[0].set_xlabel("frame"); ax[0].set_ylabel("fused offset")
nx.draw(g, nx.spring_layout(g, seed=1), with_labels=True, ax=ax[1], node_color='lightgreen', node_size=1400, font_size=8)
ax[1].set_title("D5: queryable scene graph")
plt.suptitle("pixels -> poses -> TSDF -> semantics -> scene graph"); plt.show()`,
    note: {
      en: "Runs the whole curriculum as one pipeline and visualizes it end to end: TSDF geometry fusion converging beside the resulting queryable scene graph.",
      zh: "把整门课程作为一条流水线运行，并端到端可视化：TSDF 几何融合收敛，旁边是由此得到的可查询场景图。",
    },
  },
};
