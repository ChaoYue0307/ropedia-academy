// Builds the "Training labs" — real, multi-cell Colab notebooks you can actually
// train, not the toy single-cell lesson snippets. Three are self-contained
// PyTorch pipelines (verified to train on CPU with small configs); two are
// foundation-model pipelines (CLIP, VideoMAE) that run on a Colab GPU.
//
//   node scripts/gen-training-notebooks.mjs
//
// Each lab is an ordered list of cells: { md } markdown or { code } code.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "notebooks", "training");
const REPO = "ChaoYue0307/ropedia-academy";
fs.mkdirSync(OUT, { recursive: true });

const md = (s) => ({ kind: "md", src: s });
const code = (s) => ({ kind: "code", src: s });

// ---------------------------------------------------------------------------
// LAB 1 — NeRF from scratch on the classic tiny_nerf data (Track B)
// ---------------------------------------------------------------------------
const nerf = {
  file: "B_nerf_from_scratch.ipynb",
  title: "Train a NeRF from scratch (tiny_nerf)",
  track: "B · 3D & Neural Rendering",
  tag: "PyTorch",
  what: "a NeRF MLP via photometric loss (PSNR climbs)",
  cells: [
    md(`# Train a NeRF from scratch — \`tiny_nerf\`\n\n**Track B · 3D & Neural Rendering** · maps to lessons B5 (NeRF) and B9 (reproduction).\n\nThis is a *complete, real* NeRF: a positional-encoded MLP maps \`(x,y,z) → (rgb, σ)\`, rendered by volume integration along camera rays and trained by a photometric loss against 106 posed photos. Pure PyTorch — no external rendering library.\n\n> **Runtime → Change runtime type → T4 GPU** (it runs on CPU too, just slowly). On a T4, ~3k steps (a few minutes) reaches a sharp render.`),
    code(`import os, time, numpy as np, torch, torch.nn as nn, matplotlib.pyplot as plt, urllib.request
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS  = int(os.environ.get("STEPS", 3000))   # raise for a sharper result
print("device:", device, "| steps:", STEPS)`),
    md(`## 1 · Data — 106 posed photos of a Lego scene (~12 MB)\nEach image comes with its camera-to-world pose; one view is held out for testing.`),
    code(`if not os.path.exists("tiny_nerf_data.npz"):
    urllib.request.urlretrieve("https://bmild.github.io/nerf/tiny_nerf_data.npz", "tiny_nerf_data.npz")
d = np.load("tiny_nerf_data.npz")
images = torch.tensor(d["images"], dtype=torch.float32)
poses  = torch.tensor(d["poses"],  dtype=torch.float32)
focal  = float(d["focal"]); H, W = images.shape[1], images.shape[2]
testimg, testpose = images[101].to(device), poses[101].to(device)
images, poses = images[:100].to(device), poses[:100].to(device)
print("images", tuple(images.shape), "| focal", round(focal, 1))
plt.imshow(images[0].cpu()); plt.title("one training view"); plt.axis("off"); plt.show()`),
    md(`## 2 · Model — positional encoding + a small MLP\nThe encoding lifts each 3D point into sines/cosines at several frequencies so the MLP can represent sharp detail.`),
    code(`def posenc(x, L=6):
    out = [x]
    for i in range(L):
        for fn in (torch.sin, torch.cos):
            out.append(fn(2.0 ** i * x))
    return torch.cat(out, -1)

class NeRF(nn.Module):
    def __init__(self, L=6, Wd=128):
        super().__init__()
        din = 3 * (1 + 2 * L)
        self.L = L
        self.net = nn.Sequential(
            nn.Linear(din, Wd), nn.ReLU(),
            nn.Linear(Wd, Wd), nn.ReLU(),
            nn.Linear(Wd, Wd), nn.ReLU(),
            nn.Linear(Wd, 4))
    def forward(self, x):
        return self.net(posenc(x, self.L))

def get_rays(H, W, focal, c2w):
    i, j = torch.meshgrid(torch.arange(W, device=device, dtype=torch.float32),
                          torch.arange(H, device=device, dtype=torch.float32), indexing="xy")
    dirs = torch.stack([(i - W * 0.5) / focal, -(j - H * 0.5) / focal, -torch.ones_like(i)], -1)
    rays_d = (dirs[..., None, :] * c2w[:3, :3]).sum(-1)
    rays_o = c2w[:3, -1].expand(rays_d.shape)
    return rays_o, rays_d

def render(model, rays_o, rays_d, near=2.0, far=6.0, N=64):
    t = torch.linspace(near, far, N, device=device)
    z = t.expand(list(rays_d.shape[:-1]) + [N]).clone()
    z = z + torch.rand_like(z) * (far - near) / N           # stratified sampling
    pts = rays_o[..., None, :] + rays_d[..., None, :] * z[..., :, None]
    raw = model(pts)
    rgb, sigma = torch.sigmoid(raw[..., :3]), torch.relu(raw[..., 3])
    dists = torch.cat([z[..., 1:] - z[..., :-1], torch.full_like(z[..., :1], 1e10)], -1)
    alpha = 1.0 - torch.exp(-sigma * dists)
    T = torch.cumprod(torch.cat([torch.ones_like(alpha[..., :1]), 1.0 - alpha + 1e-10], -1), -1)[..., :-1]
    return (alpha * T)[..., None].mul(rgb).sum(-2)`),
    md(`## 3 · Train — watch the PSNR climb\nOne random view per step: render it, compare to the photo, backprop. PSNR (higher = sharper) is logged.`),
    code(`model = NeRF().to(device)
opt = torch.optim.Adam(model.parameters(), 5e-4)
psnrs = []; t0 = time.time()
for step in range(STEPS + 1):
    k = np.random.randint(images.shape[0])
    ro, rd = get_rays(H, W, focal, poses[k])
    rgb = render(model, ro, rd)
    loss = ((rgb - images[k]) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        psnr = (-10.0 * torch.log10(loss)).item()
        psnrs.append((step, psnr))
        print(f"step {step:5d}  loss {loss.item():.4f}  PSNR {psnr:5.2f} dB")
print("trained in", round(time.time() - t0, 1), "s")`),
    md(`## 4 · Compare — held-out view vs. ground truth + the PSNR curve`),
    code(`with torch.no_grad():
    ro, rd = get_rays(H, W, focal, testpose)
    pred = render(model, ro, rd).clamp(0, 1).cpu()
fig, ax = plt.subplots(1, 3, figsize=(11, 3.6))
ax[0].imshow(testimg.cpu()); ax[0].set_title("ground truth"); ax[0].axis("off")
ax[1].imshow(pred);          ax[1].set_title("NeRF render");  ax[1].axis("off")
ax[2].plot(*zip(*psnrs), "-o"); ax[2].set_title("PSNR ↑"); ax[2].set_xlabel("step"); ax[2].grid(alpha=.3)
plt.tight_layout(); plt.show()`),
    md(`### Where to go next\n- Add view-dependence (feed ray direction) and a coarse+fine sampler → the original NeRF.\n- Swap the MLP for a hash grid → **Instant-NGP** speed.\n- For real scenes from your own phone photos, use **[Nerfstudio](https://docs.nerf.studio/)** (\`ns-train nerfacto\`) or **[3D Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting)**.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 2 — DeepSDF-style neural signed-distance field (Track B)
// ---------------------------------------------------------------------------
const sdf = {
  file: "B_deepsdf_shape.ipynb",
  title: "Train a neural SDF (DeepSDF-style)",
  track: "B · 3D & Neural Rendering",
  tag: "PyTorch",
  what: "an MLP signed-distance field + marching-cubes surface",
  cells: [
    md(`# Train a neural signed-distance field — DeepSDF-style\n\n**Track B · 3D & Neural Rendering** · maps to lesson B4 (implicit surfaces).\n\nWe fit an MLP \`f(x,y,z) → signed distance\` to a target shape, then extract the surface as the zero level set with marching cubes. Pure PyTorch; the target here is analytic (a torus) so the notebook is fully self-contained — swap in your own point samples to fit any mesh.\n\n> CPU is fine for this lab; a GPU makes it instant.`),
    code(`import os, torch, torch.nn as nn, numpy as np, matplotlib.pyplot as plt
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 2000))
print("device:", device, "| steps:", STEPS)`),
    md(`## 1 · Target shape — the true SDF of a torus\nNegative inside, zero on the surface, positive outside.`),
    code(`def torus_sdf(p, R=0.6, r=0.22):
    xz = torch.linalg.norm(p[..., [0, 2]], dim=-1) - R
    q = torch.stack([xz, p[..., 1]], dim=-1)
    return torch.linalg.norm(q, dim=-1) - r

def sample(n):
    # half uniform in the box, half concentrated near the surface so the
    # zero-crossing is well supervised
    nu = n // 2
    pu = (torch.rand(nu, 3, device=device) * 2 - 1) * 1.1
    a = torch.rand(n - nu, device=device) * 2 * np.pi
    b = torch.rand(n - nu, device=device) * 2 * np.pi
    R, r = 0.6, 0.22
    ps = torch.stack([(R + r * torch.cos(b)) * torch.cos(a),
                      r * torch.sin(b),
                      (R + r * torch.cos(b)) * torch.sin(a)], -1)
    ps = ps + 0.05 * torch.randn(n - nu, 3, device=device)
    p = torch.cat([pu, ps])
    return p, torus_sdf(p)`),
    md(`## 2 · Model — a positional-encoded MLP regressing distance`),
    code(`def enc(x, L=4):
    out = [x]
    for i in range(L):
        for fn in (torch.sin, torch.cos):
            out.append(fn(2.0 ** i * x))
    return torch.cat(out, -1)

class SDF(nn.Module):
    def __init__(self, L=4, Wd=256):
        super().__init__(); self.L = L; din = 3 * (1 + 2 * L)
        self.net = nn.Sequential(
            nn.Linear(din, Wd), nn.Softplus(beta=100),
            nn.Linear(Wd, Wd), nn.Softplus(beta=100),
            nn.Linear(Wd, Wd), nn.Softplus(beta=100),
            nn.Linear(Wd, 1))
    def forward(self, x):
        return self.net(enc(x, self.L)).squeeze(-1)`),
    md(`## 3 · Train — regress the (target-clamped) distance, the DeepSDF loss\nWe clamp the *target* to ±0.1 to focus capacity near the surface. Note we do **not** clamp the prediction — clamping it would zero out gradients whenever the output drifts past ±0.1 and the model would never learn.`),
    code(`model = SDF().to(device); opt = torch.optim.Adam(model.parameters(), 1e-3)
hist = []
for step in range(STEPS + 1):
    p, gt = sample(4096)
    pred = model(p)
    loss = (pred - gt.clamp(-0.1, 0.1)).abs().mean()
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        hist.append((step, loss.item())); print(f"step {step:5d}  L1 {loss.item():.4f}")`),
    md(`## 4 · Extract & compare the surface (marching cubes)`),
    code(`from skimage import measure
res = 96
g = torch.linspace(-1.1, 1.1, res, device=device)
gx, gy, gz = torch.meshgrid(g, g, g, indexing="ij")
grid = torch.stack([gx, gy, gz], -1).reshape(-1, 3)
with torch.no_grad():
    vol = torch.cat([model(grid[i:i+50000]) for i in range(0, grid.shape[0], 50000)]).reshape(res, res, res).cpu().numpy()
verts, faces, _, _ = measure.marching_cubes(vol, level=0.0)
fig = plt.figure(figsize=(9, 4))
ax1 = fig.add_subplot(121, projection="3d")
ax1.plot_trisurf(verts[:, 0], verts[:, 1], verts[:, 2], triangles=faces, cmap="viridis", lw=0)
ax1.set_title("learned surface (f=0)"); ax1.set_axis_off()
ax2 = fig.add_subplot(122); ax2.plot(*zip(*hist), "-o"); ax2.set_title("training L1 ↓"); ax2.set_xlabel("step"); ax2.grid(alpha=.3)
plt.tight_layout(); plt.show()`),
    md(`### Where to go next\n- Replace \`torus_sdf\` with on/near-surface samples from your own mesh (e.g. via \`trimesh\`) to fit arbitrary shapes.\n- Add an **eikonal** term \`(||∇f|| − 1)²\` for a metric SDF → **IGR / SIREN / NeuS**.\n- Condition the MLP on a per-shape latent code → the full **DeepSDF** auto-decoder.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 3 — SMPLify-style reprojection fit (Track A)
// ---------------------------------------------------------------------------
const smplify = {
  file: "A_smplify_fit.ipynb",
  title: "Fit a body by reprojection (SMPLify mechanics)",
  track: "A · Human Modeling",
  tag: "PyTorch",
  what: "pose by reprojection optimization (+ how to use real SMPL)",
  cells: [
    md(`# Fit a posed skeleton to 2D keypoints — SMPLify mechanics\n\n**Track A · Human Modeling** · maps to lessons A4 (HMR) and A9 (SMPLify).\n\nSMPLify recovers a 3D body by *optimizing* its pose so that the projected joints match detected 2D keypoints, regularized by a pose prior. Here we use a small articulated skeleton with forward kinematics so the notebook is self-contained — the optimization loop is exactly the one used for real SMPL. The last section shows how to swap in the real SMPL body with \`smplx\`.\n\n> CPU is fine.`),
    code(`import os, torch, numpy as np, matplotlib.pyplot as plt
torch.manual_seed(0)
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 400))`),
    md(`## 1 · A tiny articulated skeleton + forward kinematics\nA root plus a kinematic tree (spine, two arms, two legs). Each joint has a rotation about z; FK gives 3D joint positions, then a weak-perspective camera projects to 2D.`),
    code(`# parent of each joint (-1 = root) and the bone offset from its parent
parents = [-1, 0, 1, 2, 1, 4, 1, 6, 0, 8, 0, 10]
offsets = torch.tensor([
    [0,0,0],[0,.5,0],[0,.4,0],[0,.35,0],[-.3,0,0],[-.35,0,0],
    [.3,0,0],[.35,0,0],[-.15,-.1,0],[0,-.7,0],[.15,-.1,0],[0,-.7,0]], dtype=torch.float32)

def fk(angles, root):
    R = lambda a: torch.stack([torch.stack([torch.cos(a),-torch.sin(a),torch.zeros_like(a)]),
                               torch.stack([torch.sin(a), torch.cos(a),torch.zeros_like(a)]),
                               torch.stack([torch.zeros_like(a),torch.zeros_like(a),torch.ones_like(a)])])
    glob = [None]*len(parents); pos = [None]*len(parents)
    for j,p in enumerate(parents):
        Rj = R(angles[j])
        if p==-1: glob[j]=Rj; pos[j]=root
        else:     glob[j]=glob[p]@Rj; pos[j]=pos[p]+ (glob[p]@offsets[j])
    return torch.stack(pos)

def project(P):                       # weak-perspective: drop z, scale
    return P[:, :2] * 1.0`),
    md(`## 2 · Make a target observation (the "detected" 2D keypoints)\nPose the skeleton with a known pose, project, and add noise — this stands in for an off-the-shelf 2D keypoint detector.`),
    code(`true_ang = torch.zeros(len(parents)); true_ang[4]=-0.9; true_ang[6]=0.9; true_ang[2]=0.3; true_ang[9]=0.2
true_root = torch.tensor([0.,0.,0.])
target2d = project(fk(true_ang, true_root)) + 0.01*torch.randn(len(parents),2)
target2d = target2d.to(device)`),
    md(`## 3 · Optimize pose to match — reprojection loss + pose prior\nStart from a rest pose and let Adam recover the angles. The prior keeps the solution plausible (small deviations), exactly as in SMPLify.`),
    code(`ang  = torch.zeros(len(parents), device=device, requires_grad=True)
root = torch.zeros(3, device=device, requires_grad=True)
opt  = torch.optim.Adam([ang, root], 0.05)
off  = offsets.to(device)
hist = []
for step in range(STEPS + 1):
    pred2d = project(fk(ang, root))
    reproj = ((pred2d - target2d) ** 2).mean()
    prior  = 0.001 * (ang ** 2).mean()          # pose prior
    loss = reproj + prior
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        hist.append((step, reproj.item())); print(f"step {step:4d}  reproj {reproj.item():.5f}")`),
    md(`## 4 · Compare — before vs. fitted vs. target`),
    code(`def draw(ax, P2, title, c):
    P2 = P2.detach().cpu()
    for j,p in enumerate(parents):
        if p!=-1: ax.plot([P2[j,0],P2[p,0]],[P2[j,1],P2[p,1]], c+"-", lw=2)
    ax.scatter(P2[:,0],P2[:,1], c=c, s=20); ax.set_title(title); ax.set_aspect("equal"); ax.axis("off")
fig, ax = plt.subplots(1, 3, figsize=(11, 4))
draw(ax[0], project(fk(torch.zeros(len(parents),device=device), torch.zeros(3,device=device))), "initial", "C7")
draw(ax[1], project(fk(ang, root)), "fitted", "C0")
ax[2].scatter(target2d.cpu()[:,0], target2d.cpu()[:,1], c="C3", s=20); ax[2].set_title("target 2D"); ax[2].set_aspect("equal"); ax[2].axis("off")
plt.tight_layout(); plt.show()`),
    md(`### Fitting the *real* SMPL body\nThe loop above is identical for SMPL — only the forward model changes. Install the parametric body and optimize \`(β, θ, global)\` against your 2D keypoints:\n\n\`\`\`python\n!pip install smplx\nimport smplx\nbody = smplx.create("models", model_type="smpl")  # register + download at smpl-x.is.tue.mpg.de\nout = body(betas=beta, body_pose=theta, global_orient=go)\njoints2d = camera(out.joints)        # project, then minimize ||joints2d - keypoints|| + priors\n\`\`\`\nFor a learned single-shot regressor instead of per-image optimization, see **[4D-Humans / HMR 2.0](https://github.com/shubham-goel/4D-Humans)** and **[VIBE](https://github.com/mkocabas/VIBE)**.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 4 — CLIP zero-shot + linear probe (Track C/D, foundation model)
// ---------------------------------------------------------------------------
const clip = {
  file: "CD_clip_zeroshot_probe.ipynb",
  title: "CLIP: zero-shot vs. trained linear probe",
  track: "C/D · Foundation model",
  tag: "Foundation",
  what: "a linear probe on frozen CLIP features vs. zero-shot",
  cells: [
    md(`# CLIP — zero-shot classification vs. a trained linear probe\n\n**Foundation model** · supports lessons C4 (recognition) and D4 (open-vocabulary semantics).\n\nCLIP is a pretrained vision-language model. We'll (1) use it **zero-shot** — classify images by comparing them to text prompts, no training — then (2) **train a linear probe** on its frozen image features and compare. This is the canonical way to *apply* a foundation model: freeze the backbone, train a small head.\n\n> **Runtime → T4 GPU** recommended. This notebook is meant to run on Colab (it downloads CLIP weights + a small dataset).`),
    code(`!pip -q install open_clip_torch
import torch, open_clip, random, numpy as np, torch.nn as nn
from torchvision import datasets
device = "cuda" if torch.cuda.is_available() else "cpu"
model, _, preprocess = open_clip.create_model_and_transforms("ViT-B-32", pretrained="laion2b_s34b_b79k")
model = model.to(device).eval(); tokenizer = open_clip.get_tokenizer("ViT-B-32")
print("CLIP ready on", device)`),
    md(`## 1 · A small labeled image set (CIFAR-10 test split)`),
    code(`classes = ["airplane","automobile","bird","cat","deer","dog","frog","horse","ship","truck"]
test = datasets.CIFAR10(".", train=False, download=True)
random.seed(0); idxs = random.sample(range(len(test)), 800)`),
    md(`## 2 · Zero-shot — no training\nEncode each class as "a photo of a {class}", encode each image, pick the nearest text.`),
    code(`text = tokenizer([f"a photo of a {c}" for c in classes]).to(device)
with torch.no_grad():
    tf = model.encode_text(text); tf = tf / tf.norm(dim=-1, keepdim=True)
feats, labels, zs_correct = [], [], 0
with torch.no_grad():
    for i in idxs:
        img, lab = test[i]
        f = model.encode_image(preprocess(img).unsqueeze(0).to(device))
        f = f / f.norm(dim=-1, keepdim=True)
        feats.append(f.cpu()); labels.append(lab)
        zs_correct += int((f @ tf.T).argmax().item() == lab)
zs_acc = zs_correct / len(idxs)
print(f"zero-shot accuracy: {zs_acc:.3f}")`),
    md(`## 3 · Linear probe — train a head on frozen features\nFeatures are already extracted (the backbone never updates). We only train a 10-way linear layer.`),
    code(`X = torch.cat(feats); y = torch.tensor(labels)
ntr = 600
Xtr, ytr, Xte, yte = X[:ntr], y[:ntr], X[ntr:], y[ntr:]
clf = nn.Linear(X.shape[1], 10)
opt = torch.optim.Adam(clf.parameters(), 1e-3)
for epoch in range(400):
    opt.zero_grad(); loss = nn.functional.cross_entropy(clf(Xtr), ytr); loss.backward(); opt.step()
probe_acc = (clf(Xte).argmax(-1) == yte).float().mean().item()
print(f"linear-probe accuracy: {probe_acc:.3f}")`),
    md(`## 4 · Compare`),
    code(`import matplotlib.pyplot as plt
plt.bar(["zero-shot", "linear probe"], [zs_acc, probe_acc], color=["C7", "C0"])
plt.ylabel("accuracy"); plt.ylim(0, 1); plt.title("CLIP: applying a foundation model")
for i, v in enumerate([zs_acc, probe_acc]): plt.text(i, v + .02, f"{v:.2f}", ha="center")
plt.show()`),
    md(`### Where to go next\n- Swap prompts ("a blurry photo of a {c}", ensembles) to boost zero-shot.\n- Use CLIP features for **open-vocabulary** segmentation/detection → **OpenScene / LERF** (lesson D4).\n- For frozen-feature *video* recognition, the next lab fine-tunes **VideoMAE**.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 5 — VideoMAE fine-tuning for action recognition (Track C, foundation)
// ---------------------------------------------------------------------------
const videomae = {
  file: "C_videomae_finetune.ipynb",
  title: "Fine-tune VideoMAE for action recognition",
  track: "C · Egocentric Vision (foundation)",
  tag: "Foundation",
  what: "fine-tune VideoMAE for action recognition",
  cells: [
    md(`# Fine-tune VideoMAE for action recognition\n\n**Foundation model** · maps to lessons C3 (video backbones) and C9 (reproduction).\n\nVideoMAE is a self-supervised video transformer. We fine-tune the pretrained \`videomae-base\` on a small **UCF101 subset** with the 🤗 \`transformers\` Trainer — the same recipe transfers directly to egocentric datasets (EPIC-Kitchens, Ego4D).\n\n> **This is the heaviest lab — Runtime → T4 GPU is required** (~20–30 min). It is authored to the official HuggingFace recipe and is meant to be run on Colab; it is not pre-executed here. If an install resolves to an incompatible version, pin as noted in the last cell.`),
    code(`!pip -q install "transformers>=4.41" "evaluate" "pytorchvideo" "av"
import torch, pytorchvideo, evaluate, numpy as np
from huggingface_hub import hf_hub_download
import os, tarfile
print("GPU:", torch.cuda.is_available())`),
    md(`## 1 · Data — a small UCF101 subset (10 classes)`),
    code(`archive = hf_hub_download(repo_id="sayakpaul/ucf101-subset", filename="UCF101_subset.tar.gz", repo_type="dataset")
if not os.path.exists("UCF101_subset"):
    with tarfile.open(archive) as t: t.extractall(".")
root = "UCF101_subset"
labels = sorted({p.split("_")[1] for p in os.listdir(f"{root}/train")})
label2id = {l: i for i, l in enumerate(labels)}; id2label = {i: l for l, i in label2id.items()}
print(len(labels), "classes:", labels)`),
    md(`## 2 · Model + processor (pretrained VideoMAE)`),
    code(`from transformers import VideoMAEImageProcessor, VideoMAEForVideoClassification
ckpt = "MCG-NJU/videomae-base"
processor = VideoMAEImageProcessor.from_pretrained(ckpt)
model = VideoMAEForVideoClassification.from_pretrained(
    ckpt, label2id=label2id, id2label=id2label, ignore_mismatched_sizes=True)
num_frames = model.config.num_frames`),
    md(`## 3 · Frame sampling + augmentation (pytorchvideo)`),
    code(`from pytorchvideo.data import Ucf101, make_clip_sampler
from pytorchvideo.transforms import ApplyTransformToKey, Normalize, UniformTemporalSubsample
from torchvision.transforms import Compose, Lambda, Resize, RandomCrop, CenterCrop
import pytorchvideo.data

mean, std = processor.image_mean, processor.image_std
size = processor.size["shortest_edge"] if "shortest_edge" in processor.size else processor.size["height"]
clip_dur = num_frames / 25

def tf(train):
    crop = RandomCrop(size) if train else CenterCrop(size)
    return ApplyTransformToKey("video", Compose([
        UniformTemporalSubsample(num_frames), Lambda(lambda x: x / 255.0),
        Normalize(mean, std), Resize(size), crop]))

def ds(split, train):
    return pytorchvideo.data.Ucf101(
        data_path=os.path.join(root, split),
        clip_sampler=make_clip_sampler("random" if train else "uniform", clip_dur),
        decode_audio=False, transform=tf(train))

train_ds, val_ds = ds("train", True), ds("val", False)`),
    md(`## 4 · Train with the 🤗 Trainer`),
    code(`from transformers import TrainingArguments, Trainer
metric = evaluate.load("accuracy")
def collate(ex):
    return {"pixel_values": torch.stack([e["video"].permute(1,0,2,3) for e in ex]),
            "labels": torch.tensor([label2id[e["label"]] for e in ex])}
def metrics(p):
    return metric.compute(predictions=np.argmax(p.predictions, 1), references=p.label_ids)

args = TrainingArguments("videomae-ucf101", per_device_train_batch_size=4, per_device_eval_batch_size=4,
    learning_rate=5e-5, max_steps=300, eval_strategy="steps", eval_steps=100, logging_steps=20,
    warmup_ratio=0.1, fp16=torch.cuda.is_available(), remove_unused_columns=False, report_to="none")
trainer = Trainer(model, args, train_dataset=train_ds, eval_dataset=val_ds,
                  data_collator=collate, compute_metrics=metrics)
trainer.train()`),
    md(`## 5 · Evaluate & predict one clip`),
    code(`print(trainer.evaluate())
import itertools
batch = collate(list(itertools.islice(iter(val_ds), 4)))
with torch.no_grad():
    logits = model(batch["pixel_values"].to(model.device)).logits
for pred, gt in zip(logits.argmax(-1).tolist(), batch["labels"].tolist()):
    print("pred:", id2label[pred], "| true:", id2label[gt])`),
    md(`### Notes & next steps\n- **Version pins** if something breaks: \`transformers==4.44.2\`, \`pytorchvideo==0.1.5\`, \`av==12.3.0\`.\n- Raise \`max_steps\` and add more classes for real accuracy.\n- Point \`data_path\` at **EPIC-Kitchens-100** / **Ego4D** clips to fine-tune for *egocentric* action recognition (lesson C9). Compare against the frozen-feature baseline from lesson C9's notebook.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 6 — Motion diffusion model from scratch (Track A)
// ---------------------------------------------------------------------------
const motion = {
  file: "A_motion_diffusion.ipynb",
  title: "Train a motion diffusion model",
  track: "A · Human Modeling",
  tag: "PyTorch",
  what: "a DDPM that generates motion trajectories (ε-prediction)",
  cells: [
    md(`# Train a motion diffusion model from scratch\n\n**Track A · Human Modeling** · maps to lesson A7 (motion diffusion).\n\nA real **DDPM**: we corrupt motion trajectories with noise over many steps, train an MLP to predict that noise, then *reverse* the process to generate brand-new motions. Same recipe as the **Human Motion Diffusion Model (MDM)** — here on 2D trajectories so it is self-contained and trains in a minute.\n\n> CPU is fine; a GPU makes it instant.`),
    code(`import os, math, torch, torch.nn as nn, matplotlib.pyplot as plt
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 4000)); T_LEN = 32
print("device:", device, "| steps:", STEPS)`),
    md(`## 1 · Data — looping 2D motion trajectories (varied radius, phase, noise)`),
    code(`def make_motion(n):
    t = torch.linspace(0, 2 * math.pi, T_LEN)
    rx = 0.3 + 0.6 * torch.rand(n, 1); ry = 0.3 + 0.6 * torch.rand(n, 1); ph = 2 * math.pi * torch.rand(n, 1)
    x = rx * torch.cos(t + ph); y = ry * torch.sin(t + ph)
    return torch.stack([x, y], -1).reshape(n, -1)          # (n, T_LEN*2)
data = make_motion(4096).to(device); D = data.shape[1]
fig, ax = plt.subplots(1, 5, figsize=(11, 2.4))
for i in range(5):
    m = data[i].reshape(T_LEN, 2).cpu(); ax[i].plot(m[:, 0], m[:, 1]); ax[i].set_aspect("equal"); ax[i].axis("off")
fig.suptitle("real motions"); plt.show()`),
    md(`## 2 · Diffusion schedule + a time-conditioned denoiser`),
    code(`Tdiff = 200
betas = torch.linspace(1e-4, 0.02, Tdiff, device=device)
alphas = 1 - betas; acp = torch.cumprod(alphas, 0)

def q_sample(x0, t, noise):
    return acp[t].sqrt()[:, None] * x0 + (1 - acp[t]).sqrt()[:, None] * noise

class Denoiser(nn.Module):
    def __init__(self, D, H=256):
        super().__init__()
        self.tef = nn.Sequential(nn.Linear(1, H), nn.SiLU(), nn.Linear(H, H))
        self.net = nn.Sequential(nn.Linear(D + H, H), nn.SiLU(), nn.Linear(H, H), nn.SiLU(), nn.Linear(H, D))
    def forward(self, x, t):
        te = self.tef(t[:, None].float() / Tdiff)
        return self.net(torch.cat([x, te], -1))`),
    md(`## 3 · Train — predict the added noise`),
    code(`model = Denoiser(D).to(device); opt = torch.optim.Adam(model.parameters(), 2e-4); hist = []
for step in range(STEPS + 1):
    x0 = data[torch.randint(0, data.shape[0], (256,), device=device)]
    t = torch.randint(0, Tdiff, (256,), device=device); noise = torch.randn_like(x0)
    loss = ((model(q_sample(x0, t, noise), t) - noise) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        hist.append((step, loss.item())); print(f"step {step:5d}  loss {loss.item():.4f}")`),
    md(`## 4 · Sample — reverse diffusion makes new motions`),
    code(`@torch.no_grad()
def sample(n):
    x = torch.randn(n, D, device=device)
    for ti in reversed(range(Tdiff)):
        t = torch.full((n,), ti, device=device, dtype=torch.long)
        eps = model(x, t)
        mean = (x - betas[ti] / (1 - acp[ti]).sqrt() * eps) / alphas[ti].sqrt()
        x = mean + (betas[ti].sqrt() * torch.randn_like(x) if ti > 0 else 0)
    return x
gen = sample(5).reshape(5, T_LEN, 2).cpu()`),
    md(`## 5 · Compare — generated motions + the training curve`),
    code(`fig, ax = plt.subplots(1, 6, figsize=(13, 2.4))
for i in range(5):
    ax[i].plot(gen[i, :, 0], gen[i, :, 1], "C1"); ax[i].set_aspect("equal"); ax[i].axis("off"); ax[i].set_title("gen")
ax[5].plot(*zip(*hist), "-o"); ax[5].set_title("loss ↓"); ax[5].set_xlabel("step"); ax[5].grid(alpha=.3)
plt.tight_layout(); plt.show()`),
    md(`### Where to go next\n- Replace 2D trajectories with **SMPL joint-angle sequences** to generate real human motion.\n- Add **text conditioning** (a sentence embedding into the denoiser) → **[MDM](https://github.com/GuyTevet/motion-diffusion-model)** (text-to-motion).\n- Swap the MLP for a transformer denoiser for longer, higher-quality sequences.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 7 — 2D Gaussian Splatting: fit an image (Track B)
// ---------------------------------------------------------------------------
const gsplat = {
  file: "B_gaussian_splatting_2d.ipynb",
  title: "2D Gaussian Splatting — fit an image",
  track: "B · 3D & Neural Rendering",
  tag: "PyTorch",
  what: "N anisotropic 2D Gaussians optimized to reconstruct an image",
  cells: [
    md(`# 2D Gaussian Splatting — represent an image with Gaussians\n\n**Track B · 3D & Neural Rendering** · maps to lesson B7 (3D Gaussian Splatting).\n\n3D Gaussian Splatting represents a scene as millions of coloured Gaussians, rendered differentiably and optimized to match photos. Here is the same idea in **2D**: optimize \`N\` anisotropic Gaussians (position · scale · rotation · colour · opacity) so their splat reconstructs a target image. Everything (including the gradient through the renderer) is plain PyTorch.\n\n> CPU works; a GPU lets you raise \`N\` for crisp detail.`),
    code(`import os, math, torch, matplotlib.pyplot as plt
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 800)); N = int(os.environ.get("NGAUSS", 500)); H = W = 64
print("device:", device, "| steps:", STEPS, "| gaussians:", N)`),
    md(`## 1 · Target image (procedural, self-contained)`),
    code(`ys = torch.linspace(0, 1, H, device=device); xs = torch.linspace(0, 1, W, device=device)
YY, XX = torch.meshgrid(ys, xs, indexing="ij"); coords = torch.stack([XX, YY], -1)   # (H,W,2)
target = 0.15 + 0.2 * YY[..., None].repeat(1, 1, 3)                                   # soft gradient
for cx, cy, r, col in [(.3,.35,.16,(.95,.35,.35)), (.68,.4,.2,(.25,.5,.95)), (.5,.72,.17,(.35,.85,.45))]:
    g = torch.exp(-(((XX-cx)**2 + (YY-cy)**2) / (2*r*r)))
    target = target + g[..., None] * torch.tensor(col, device=device)
target = target.clamp(0, 1)
plt.imshow(target.cpu()); plt.title("target"); plt.axis("off"); plt.show()`),
    md(`## 2 · The Gaussians — learnable position, scale, rotation, colour, opacity`),
    code(`pos  = torch.rand(N, 2, device=device, requires_grad=True)
logs = torch.full((N, 2), math.log(0.06), device=device, requires_grad=True)
rot  = torch.zeros(N, device=device, requires_grad=True)
col  = torch.randn(N, 3, device=device, requires_grad=True)
op   = torch.zeros(N, device=device, requires_grad=True)

def render():
    s = torch.exp(logs); c, si = torch.cos(rot), torch.sin(rot)
    d = coords[:, :, None, :] - pos[None, None, :, :]            # (H,W,N,2)
    dx = d[..., 0] * c + d[..., 1] * si
    dy = -d[..., 0] * si + d[..., 1] * c                         # delta in each Gaussian's frame
    e = torch.exp(-0.5 * ((dx / s[:, 0]) ** 2 + (dy / s[:, 1]) ** 2))   # (H,W,N)
    a = torch.sigmoid(op) * e
    color = torch.sigmoid(col)
    return ((a[..., None] * color[None, None]).sum(2) / (a.sum(2, keepdim=True) + 1e-6)).clamp(0, 1)`),
    md(`## 3 · Optimize — minimise reconstruction error`),
    code(`opt = torch.optim.Adam([pos, logs, rot, col, op], 0.02); hist = []
for step in range(STEPS + 1):
    img = render(); loss = ((img - target) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        psnr = (-10 * torch.log10(loss)).item(); hist.append((step, psnr)); print(f"step {step:4d}  PSNR {psnr:5.2f} dB")`),
    md(`## 4 · Compare — target vs. splatted reconstruction + Gaussian centres`),
    code(`with torch.no_grad(): img = render().cpu()
fig, ax = plt.subplots(1, 3, figsize=(11, 3.6))
ax[0].imshow(target.cpu()); ax[0].set_title("target"); ax[0].axis("off")
ax[1].imshow(img);          ax[1].set_title("reconstruction"); ax[1].axis("off")
ax[2].plot(*zip(*hist), "-o"); ax[2].set_title("PSNR ↑"); ax[2].set_xlabel("step"); ax[2].grid(alpha=.3)
plt.tight_layout(); plt.show()`),
    md(`### Where to go next\n- Add/prune Gaussians by gradient magnitude (densification) — the trick that makes real 3DGS sharp.\n- Lift to **3D**: Gaussians in space, splatted through a camera with depth-ordered alpha compositing → **[3D Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting)**.\n- For real captures, use **[Nerfstudio splatfacto](https://docs.nerf.studio/)** on your own phone photos.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 8 — DINOv2 features: PCA segmentation + linear probe (Track C, foundation)
// ---------------------------------------------------------------------------
const dinov2 = {
  file: "C_dinov2_features_probe.ipynb",
  title: "DINOv2 features: PCA segmentation + probe",
  track: "C · Egocentric Vision (foundation)",
  tag: "Foundation",
  what: "patch-feature PCA (objects emerge) + a linear probe on CLS features",
  cells: [
    md(`# DINOv2 — emergent segmentation + a linear probe\n\n**Foundation model** · supports lessons C3 (backbones) and C5/C6 (hands & interaction).\n\nDINOv2 is a self-supervised vision backbone whose features are so structured that objects pop out with **no labels**. We'll (1) run **PCA on its patch tokens** to visualise that, then (2) train a **linear probe** on its CLS feature for classification — the standard way to reuse a frozen foundation backbone.\n\n> **Runtime → T4 GPU** recommended. Meant to run on Colab (downloads DINOv2 weights + data); not pre-executed here.`),
    code(`!pip -q install transformers
import torch, requests, numpy as np, matplotlib.pyplot as plt
from PIL import Image
from transformers import AutoImageProcessor, AutoModel
device = "cuda" if torch.cuda.is_available() else "cpu"
proc = AutoImageProcessor.from_pretrained("facebook/dinov2-small")
dino = AutoModel.from_pretrained("facebook/dinov2-small").to(device).eval()
print("DINOv2 ready on", device)`),
    md(`## 1 · Patch-feature PCA — objects emerge without labels`),
    code(`url = "http://images.cocodataset.org/val2017/000000039769.jpg"   # two cats
img = Image.open(requests.get(url, stream=True).raw).convert("RGB")
inp = proc(images=img, return_tensors="pt").to(device)
with torch.no_grad():
    tokens = dino(**inp).last_hidden_state[0, 1:]               # drop CLS -> (num_patches, dim)
g = int(tokens.shape[0] ** 0.5)
U, S, V = torch.pca_lowrank(tokens, q=3)
pca = (tokens @ V[:, :3]); pca = (pca - pca.min(0).values) / (pca.max(0).values - pca.min(0).values + 1e-6)
fig, ax = plt.subplots(1, 2, figsize=(8, 4))
ax[0].imshow(img); ax[0].set_title("input"); ax[0].axis("off")
ax[1].imshow(pca.reshape(g, g, 3).cpu()); ax[1].set_title("DINOv2 patch PCA (no labels)"); ax[1].axis("off")
plt.show()`),
    md(`## 2 · Linear probe on CLS features (CIFAR-10)`),
    code(`from torchvision import datasets
import torch.nn as nn, random
test = datasets.CIFAR10(".", train=False, download=True); random.seed(0)
idxs = random.sample(range(len(test)), 800); feats, labels = [], []
with torch.no_grad():
    for i in idxs:
        im, lab = test[i]
        x = proc(images=im, return_tensors="pt").to(device)
        feats.append(dino(**x).pooler_output.cpu()); labels.append(lab)
X = torch.cat(feats); y = torch.tensor(labels)
clf = nn.Linear(X.shape[1], 10); opt = torch.optim.Adam(clf.parameters(), 1e-3)
for e in range(400):
    opt.zero_grad(); nn.functional.cross_entropy(clf(X[:600]), y[:600]).backward(); opt.step()
print("linear-probe accuracy:", (clf(X[600:]).argmax(-1) == y[600:]).float().mean().item())`),
    md(`### Where to go next\n- Run the PCA on **egocentric frames** (EPIC-Kitchens / Ego4D) — hands and manipulated objects separate cleanly.\n- Use patch features for open-vocabulary segmentation, or as inputs to a hand/object detector (lessons C5–C6).\n- Compare this probe with the **CLIP** probe lab — different pretraining, different features.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 9 — Learn a world model + plan by imagination (Track D)
// ---------------------------------------------------------------------------
const worldmodel = {
  file: "D_world_model.ipynb",
  title: "Learn a world model + plan",
  track: "D · Scene & World Models",
  tag: "PyTorch",
  what: "a learned dynamics model used for planning (model-predictive control)",
  cells: [
    md(`# Learn a world model, then plan by imagination\n\n**Track D · Scene & World Models** · maps to lesson D8 (world models).\n\nA world model *learns the dynamics* of an environment so an agent can plan inside its imagination. Here: collect random experience in a 2D point-mass world, **train a dynamics model** \`f(state, action) → next state\`, then **plan** by rolling that model forward and picking the action sequence that reaches the goal (model-predictive control). Self-contained.\n\n> CPU is fine.`),
    code(`import os, torch, torch.nn as nn, matplotlib.pyplot as plt
torch.manual_seed(0)
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 1500))`),
    md(`## 1 · Environment — a 2D point mass\nState = [x, y, vx, vy]; action = [ax, ay] (a push). Goal = the origin.`),
    code(`DT, FR = 0.1, 0.1
goal = torch.tensor([0.0, 0.0], device=device)
def step_env(s, a):
    a = a.clamp(-1, 1)
    x, y, vx, vy = s[..., 0], s[..., 1], s[..., 2], s[..., 3]
    vx = vx * (1 - FR) + a[..., 0] * DT; vy = vy * (1 - FR) + a[..., 1] * DT
    return torch.stack([x + vx * DT, y + vy * DT, vx, vy], -1)
def reward(s): return -torch.linalg.norm(s[..., :2] - goal, dim=-1)`),
    md(`## 2 · Collect random experience`),
    code(`s = torch.cat([torch.rand(3000, 2, device=device) * 4 - 2, torch.zeros(3000, 2, device=device)], -1)
S, A, S2 = [], [], []
for _ in range(20):
    a = torch.rand(s.shape[0], 2, device=device) * 2 - 1
    s2 = step_env(s, a); S.append(s); A.append(a); S2.append(s2); s = s2
S, A, S2 = torch.cat(S), torch.cat(A), torch.cat(S2)
print("transitions:", S.shape[0])`),
    md(`## 3 · Train the dynamics model  f(s,a) → Δs`),
    code(`class Dyn(nn.Module):
    def __init__(self, H=256):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(6, H), nn.SiLU(), nn.Linear(H, H), nn.SiLU(), nn.Linear(H, 4))
    def forward(self, s, a): return self.net(torch.cat([s, a], -1))
model = Dyn().to(device); opt = torch.optim.Adam(model.parameters(), 1e-3)
inp = torch.cat([S, A], -1); tgt = S2 - S; hist = []
for step in range(STEPS + 1):
    idx = torch.randint(0, S.shape[0], (512,), device=device)
    loss = ((model(S[idx], A[idx]) - tgt[idx]) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        hist.append((step, loss.item())); print(f"step {step:5d}  dyn MSE {loss.item():.5f}")`),
    md(`## 4 · Plan inside the model (random-shooting MPC)\nAt each step, imagine many random action sequences *with the learned model*, keep the first action of the best one, execute it in the real environment, repeat.`),
    code(`@torch.no_grad()
def plan(s0, horizon=15, K=1000):
    acts = torch.rand(K, horizon, 2, device=device) * 2 - 1
    s = s0.repeat(K, 1); total = torch.zeros(K, device=device)
    for h in range(horizon):
        s = s + model(s, acts[:, h]); total = total + reward(s)
    return acts[total.argmax(), 0]

def run(policy, n=40):
    s = torch.tensor([1.8, -1.6, 0.0, 0.0], device=device); traj = [s[:2].clone()]
    for _ in range(n):
        s = step_env(s, policy(s)); traj.append(s[:2].clone())
    return torch.stack(traj).cpu()
traj_plan = run(lambda s: plan(s))
traj_rand = run(lambda s: torch.rand(2, device=device) * 2 - 1)
print(f"final distance to goal — planner {traj_plan[-1].norm():.3f}  vs random {traj_rand[-1].norm():.3f}")`),
    md(`## 5 · Compare — planning in imagination reaches the goal`),
    code(`fig, ax = plt.subplots(1, 2, figsize=(9, 4))
ax[0].plot(traj_rand[:, 0], traj_rand[:, 1], "C7-o", ms=3, label="random")
ax[0].plot(traj_plan[:, 0], traj_plan[:, 1], "C0-o", ms=3, label="planned")
ax[0].scatter([0], [0], c="C3", s=80, marker="*", label="goal"); ax[0].legend(); ax[0].set_aspect("equal"); ax[0].set_title("trajectories")
ax[1].plot(*zip(*hist), "-o"); ax[1].set_title("dynamics MSE ↓"); ax[1].set_xlabel("step"); ax[1].grid(alpha=.3)
plt.tight_layout(); plt.show()`),
    md(`### Where to go next\n- Replace random shooting with **CEM** or learn a policy/value (actor-critic) inside the model → **Dreamer**.\n- Learn the dynamics in a **latent** space from pixels (encoder + recurrent state) → the full world-model recipe.\n- Swap the toy env for a Gym/MuJoCo task and the same loop scales up.`),
  ],
};

// ---------------------------------------------------------------------------
const labs = [smplify, motion, nerf, sdf, gsplat, clip, videomae, dinov2, worldmodel];

function toNotebook(lab) {
  const cells = lab.cells.map((c) =>
    c.kind === "md"
      ? { cell_type: "markdown", metadata: {}, source: splitLines(c.src) }
      : { cell_type: "code", metadata: {}, execution_count: null, outputs: [], source: splitLines(c.src) }
  );
  return {
    nbformat: 4,
    nbformat_minor: 4,
    metadata: {
      kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
      language_info: { name: "python" },
      colab: { provenance: [], toc_visible: true },
    },
    cells,
  };
}
// keep trailing newlines per nbformat convention (every line but the last ends in \n)
function splitLines(s) {
  const lines = s.split("\n");
  return lines.map((l, i) => (i < lines.length - 1 ? l + "\n" : l));
}

for (const lab of labs) {
  fs.writeFileSync(path.join(OUT, lab.file), JSON.stringify(toNotebook(lab), null, 1));
  console.log("wrote", lab.file, `(${lab.cells.length} cells)`);
}

// README index with Colab badges
const badge = (f) =>
  `[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/${REPO}/blob/main/notebooks/training/${f})`;
const readme = `# Training labs

Real, multi-cell notebooks you can **actually train** in Colab — split into clear blocks (data · model · train · compare) so you can run them step by step and see each stage. Open **Runtime → Change runtime type → T4 GPU** first.

Two kinds:
- **Self-contained PyTorch** — train from scratch on bundled/synthetic data, no fragile installs (verified to train).
- **Foundation-model pipelines** — apply/fine-tune a pretrained model (CLIP, VideoMAE).

| Lab | Track | Kind | What you train | Open |
|---|---|---|---|---|
${labs.map((l) => `| ${l.title} | ${l.track} | ${l.tag} | ${l.what} | ${badge(l.file)} |`).join("\n")}

> The self-contained **PyTorch** labs are verified to train (loss decreases) on CPU with small configs; raise \`STEPS\` for sharper results. The **Foundation** labs follow the official APIs and are meant to run on a Colab GPU (they download weights/data), so they are not pre-executed here.
`;
fs.writeFileSync(path.join(OUT, "README.md"), readme);
console.log("wrote README.md");
