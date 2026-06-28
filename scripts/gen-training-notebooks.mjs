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

// A standard "Save artifacts" pair of cells: writes the checkpoint, the full
// loss/eval history (JSON) and the final figure to outputs/<id>/, then zips it.
function saveCells(id, saveLines) {
  return [
    md(`## Save artifacts — checkpoint · metrics · figure\nEverything is written to **outputs/${id}/** — the model checkpoint, the full loss/eval history as JSON, and the final figure — then zipped. Colab sessions are ephemeral, so the last lines show how to download the zip or copy it to Google Drive.`),
    code([
      `import os, json, torch, shutil`,
      `run = "outputs/${id}"; os.makedirs(run, exist_ok=True)`,
      ...saveLines,
      `try:`,
      `    fig.savefig(f"{run}/figure.png", dpi=120, bbox_inches="tight")`,
      `except Exception: pass`,
      `shutil.make_archive(run, "zip", run)`,
      `print("saved to", run, "->", sorted(os.listdir(run)))`,
      `# keep it past the session:  from google.colab import files; files.download(f"{run}.zip")`,
      `# or mount Drive:  from google.colab import drive; drive.mount('/content/drive')  # then shutil.copytree(run, "/content/drive/MyDrive/"+run)`,
    ].join("\n")),
    md(`## (Optional) Publish to the Hugging Face Hub\nUpload this run as a **model repo** — the checkpoint, \`metrics.json\` (full loss/eval history) and the results figure, embedded in an auto-generated model card. Do it for each lab, then group them into a **Collection** on your HF profile (Profile → New collection), or with the commented \`add_collection_item\` call below. It needs a **write token**, so it only runs once you sign in.`),
    code(`# (optional) publish this run as a Hugging Face model repo — checkpoint + metrics + plot
!pip -q install huggingface_hub
from huggingface_hub import HfApi, notebook_login
import os
notebook_login()   # paste a WRITE token from https://huggingface.co/settings/tokens
api = HfApi(); user = api.whoami()["name"]
lab = os.path.basename(run); repo_id = f"{user}/ropedia-" + lab.lower().replace("_", "-")
fig = "\\n![results](figure.png)\\n" if os.path.exists(f"{run}/figure.png") else ""
open(f"{run}/README.md", "w").write("---\\ntags: [ropedia-academy, education]\\n---\\n# " + lab + "\\n\\nTrained in **Ropedia Academy** (educational lab). Checkpoint, full loss/eval history (metrics.json) and the results figure are included." + fig)
api.create_repo(repo_id, repo_type="model", exist_ok=True)
api.upload_folder(folder_path=run, repo_id=repo_id, commit_message="Upload from Ropedia Academy")
print("uploaded ->", "https://huggingface.co/" + repo_id)
# group everything into one Collection (run once, after a few uploads):
# from huggingface_hub import create_collection, add_collection_item
# col = create_collection("Ropedia Academy - trained models", namespace=user, exists_ok=True)
# add_collection_item(col.slug, item_id=repo_id, item_type="model")`),
  ];
}

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
    fit = (model(p) - gt.clamp(-0.1, 0.1)).abs().mean()
    # eikonal regularizer: a true distance field has gradient norm 1 everywhere
    pe = ((torch.rand(2048, 3, device=device) * 2 - 1) * 1.1).requires_grad_(True)
    g = torch.autograd.grad(model(pe).sum(), pe, create_graph=True)[0]
    eik = ((g.norm(dim=-1) - 1) ** 2).mean()
    loss = fit + 0.1 * eik
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        hist.append((step, round(fit.item(), 4))); print(f"step {step:5d}  L1 {fit.item():.4f}  eikonal {eik.item():.3f}")`),

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
    code(`import math, copy
model = Denoiser(D).to(device); opt = torch.optim.Adam(model.parameters(), 2e-4); hist = []
ema = copy.deepcopy(model)
for p in ema.parameters(): p.requires_grad_(False)
for step in range(STEPS + 1):
    for g in opt.param_groups: g["lr"] = 2e-4 * (0.1 + 0.45 * (1 + math.cos(math.pi * step / max(1, STEPS))))
    x0 = data[torch.randint(0, data.shape[0], (256,), device=device)]
    t = torch.randint(0, Tdiff, (256,), device=device); noise = torch.randn_like(x0)
    loss = ((model(q_sample(x0, t, noise), t) - noise) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()
    with torch.no_grad():                                            # EMA of weights → smoother samples
        for pe, pm in zip(ema.parameters(), model.parameters()): pe.mul_(0.999).add_(pm, alpha=0.001)
    if step % max(1, STEPS // 10) == 0:
        hist.append((step, round(loss.item(), 4))); print(f"step {step:5d}  loss {loss.item():.4f}")
model.load_state_dict(ema.state_dict())                             # sample/save from the EMA weights`),
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
def densify():                                       # clone Gaussians where the image error is high
    global pos, logs, rot, col, op, opt
    with torch.no_grad():
        if pos.grad is None or pos.shape[0] > 2500: return
        g = pos.grad.norm(dim=1); m = g > (g.mean() + g.std())
        if int(m.sum()) == 0: return
        npos = torch.cat([pos, pos[m] + 0.01 * torch.randn(int(m.sum()), 2, device=device)])
        nlogs = torch.cat([logs, logs[m] - 0.3]); nrot = torch.cat([rot, rot[m]])
        ncol = torch.cat([col, col[m]]); nop = torch.cat([op, op[m]])
    pos = npos.detach().requires_grad_(True); logs = nlogs.detach().requires_grad_(True)
    rot = nrot.detach().requires_grad_(True); col = ncol.detach().requires_grad_(True); op = nop.detach().requires_grad_(True)
    opt = torch.optim.Adam([pos, logs, rot, col, op], 0.02)
for step in range(STEPS + 1):
    img = render(); loss = ((img - target) ** 2).mean()
    opt.zero_grad(); loss.backward()
    if step > 0 and step % max(1, STEPS // 5) == 0:
        densify()
    else:
        opt.step()
    if step % max(1, STEPS // 10) == 0:
        psnr = (-10 * torch.log10(loss)).item(); hist.append((step, round(psnr, 2))); print(f"step {step:4d}  N {pos.shape[0]:4d}  PSNR {psnr:5.2f} dB")`),
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
probe_acc = (clf(X[600:]).argmax(-1) == y[600:]).float().mean().item()
print("linear-probe accuracy:", probe_acc)`),
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
def plan(s0, horizon=15, K=400, iters=4, elite=40):
    # Cross-Entropy Method: refit a Gaussian over action sequences toward the elites
    mu = torch.zeros(horizon, 2, device=device); std = torch.ones(horizon, 2, device=device)
    for _ in range(iters):
        acts = (mu + std * torch.randn(K, horizon, 2, device=device)).clamp(-1, 1)
        s = s0.repeat(K, 1); total = torch.zeros(K, device=device)
        for h in range(horizon):
            s = s + model(s, acts[:, h]); total = total + reward(s)
        idx = total.topk(elite).indices
        mu = acts[idx].mean(0); std = acts[idx].std(0) + 1e-3
    return mu[0]

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
// LAB 10 — Train a GPT from scratch (nanoGPT-style language model)
// ---------------------------------------------------------------------------
const nanogpt = {
  file: "LM_nanogpt_pretrain.ipynb",
  title: "Train a tiny GPT from scratch (nanoGPT)",
  track: "LM · Language models",
  tag: "PyTorch",
  what: "a character-level GPT (decoder-only transformer) by next-token prediction",
  cells: [
    md(`# Train a GPT from scratch — nanoGPT\n\n**Language models** · the engine behind every LLM, VLM and Video-LM.\n\nWe build a small **decoder-only transformer** (token + positional embeddings → causal self-attention blocks → next-token head) and train it character-by-character on Shakespeare. This is exactly the GPT recipe, just tiny — so it trains in a minute and you can read what it learns.\n\n> CPU is fine; a GPU is faster. The fine-tuning of *pretrained* LLMs/VLMs lives in the Advanced labs.`),
    code(`import os, urllib.request, torch, torch.nn as nn
from torch.nn import functional as F
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 3000))
block_size, n_embd, n_head, n_layer, batch_size, dropout = 64, 128, 4, 4, 32, 0.1
print("device:", device, "| steps:", STEPS)`),
    md(`## 1 · Data — Tiny Shakespeare, tokenised by character`),
    code(`if not os.path.exists("input.txt"):
    urllib.request.urlretrieve("https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt", "input.txt")
text = open("input.txt").read()
chars = sorted(set(text)); vocab = len(chars)
stoi = {c: i for i, c in enumerate(chars)}; itos = {i: c for c, i in stoi.items()}
encode = lambda s: [stoi[c] for c in s]
decode = lambda l: "".join(itos[i] for i in l)
data = torch.tensor(encode(text), dtype=torch.long)
n = int(0.9 * len(data)); train_data, val_data = data[:n], data[n:]
def get_batch(split):
    d = train_data if split == "train" else val_data
    ix = torch.randint(len(d) - block_size, (batch_size,))
    x = torch.stack([d[i:i+block_size] for i in ix]); y = torch.stack([d[i+1:i+block_size+1] for i in ix])
    return x.to(device), y.to(device)
print("vocab:", vocab, "chars |  corpus:", len(text), "chars")`),
    md(`## 2 · Model — causal self-attention transformer`),
    code(`class Head(nn.Module):
    def __init__(self, hs):
        super().__init__()
        self.k = nn.Linear(n_embd, hs, bias=False); self.q = nn.Linear(n_embd, hs, bias=False); self.v = nn.Linear(n_embd, hs, bias=False)
        self.register_buffer("tril", torch.tril(torch.ones(block_size, block_size))); self.drop = nn.Dropout(dropout)
    def forward(self, x):
        B, T, C = x.shape; k, q = self.k(x), self.q(x)
        att = (q @ k.transpose(-2, -1)) * k.shape[-1] ** -0.5
        att = att.masked_fill(self.tril[:T, :T] == 0, float("-inf"))
        att = self.drop(F.softmax(att, -1))
        return att @ self.v(x)
class MHA(nn.Module):
    def __init__(self, nh, hs):
        super().__init__(); self.heads = nn.ModuleList([Head(hs) for _ in range(nh)])
        self.proj = nn.Linear(n_embd, n_embd); self.drop = nn.Dropout(dropout)
    def forward(self, x): return self.drop(self.proj(torch.cat([h(x) for h in self.heads], -1)))
class Block(nn.Module):
    def __init__(self):
        super().__init__(); self.sa = MHA(n_head, n_embd // n_head)
        self.ff = nn.Sequential(nn.Linear(n_embd, 4*n_embd), nn.GELU(), nn.Linear(4*n_embd, n_embd), nn.Dropout(dropout))
        self.l1 = nn.LayerNorm(n_embd); self.l2 = nn.LayerNorm(n_embd)
    def forward(self, x): x = x + self.sa(self.l1(x)); return x + self.ff(self.l2(x))
class GPT(nn.Module):
    def __init__(self):
        super().__init__(); self.tok = nn.Embedding(vocab, n_embd); self.pos = nn.Embedding(block_size, n_embd)
        self.blocks = nn.Sequential(*[Block() for _ in range(n_layer)]); self.lnf = nn.LayerNorm(n_embd); self.head = nn.Linear(n_embd, vocab)
    def forward(self, idx, targets=None):
        B, T = idx.shape
        x = self.tok(idx) + self.pos(torch.arange(T, device=device))
        logits = self.head(self.lnf(self.blocks(x)))
        loss = None if targets is None else F.cross_entropy(logits.view(-1, vocab), targets.view(-1))
        return logits, loss
    @torch.no_grad()
    def generate(self, idx, n_new):
        for _ in range(n_new):
            logits, _ = self(idx[:, -block_size:])
            idx = torch.cat([idx, torch.multinomial(F.softmax(logits[:, -1, :], -1), 1)], 1)
        return idx`),
    md(`## 3 · Train — next-token cross-entropy (watch train & val fall)`),
    code(`import math
model = GPT().to(device)
opt = torch.optim.AdamW(model.parameters(), 3e-4, weight_decay=0.1)   # decoupled weight decay
warm = max(10, STEPS // 50)
def lr_at(s):                                                         # warmup → cosine decay
    if s < warm: return 3e-4 * s / warm
    r = (s - warm) / max(1, STEPS - warm); return 3e-4 * (0.1 + 0.45 * (1 + math.cos(math.pi * r)))
print("parameters:", round(sum(p.numel() for p in model.parameters()) / 1e6, 2), "M")
hist = []; best_val = float("inf"); best_state = None
for step in range(STEPS + 1):
    for g in opt.param_groups: g["lr"] = lr_at(step)
    xb, yb = get_batch("train"); _, loss = model(xb, yb)
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 20) == 0:
        model.eval()
        with torch.no_grad(): _, vl = model(*get_batch("val"))
        model.train(); hist.append((step, round(loss.item(), 3), round(vl.item(), 3)))
        if vl.item() < best_val:                                     # keep the BEST checkpoint
            best_val = vl.item(); best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
        print(f"step {step:5d}  train {loss.item():.3f}  val {vl.item():.3f}  (best {best_val:.3f})")
if best_state: model.load_state_dict(best_state)                     # restore best before saving/sampling
print("restored best val:", round(best_val, 3))`),
    md(`## 4 · Generate — sample text from the trained model`),
    code(`ctx = torch.zeros((1, 1), dtype=torch.long, device=device)
print(decode(model.generate(ctx, 500)[0].tolist()))`),
    md(`## How this links to tracks A–D\nThis transformer is the shared engine across the whole course:\n- **A · Human** — motion is a sequence; the same architecture powers MDM (text-to-motion).\n- **B · 3D** — transformers also tokenise points / shapes / views.\n- **C · Egocentric** — VideoMAE is exactly this transformer applied to video patches.\n- **D · Scene / world** — world models predict the next latent state with a sequence model.`),
    md(`### Where to go next\n- Swap the character tokenizer for **BPE** (tiktoken) and scale width/depth/data → GPT-2 and beyond.\n- Don't pretrain from zero for real tasks — **fine-tune a pretrained LLM** efficiently with **QLoRA** (see the Advanced labs), then align it with **DPO**.\n- The same transformer, fed image/video tokens, becomes a **VLM / Video-LM** (Advanced labs).`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 11 — 2D pose estimation by heatmap regression (Track A)
// ---------------------------------------------------------------------------
const pose = {
  file: "A_pose_heatmap.ipynb", title: "2D pose estimation (heatmap regression)", track: "A · Human Modeling", tag: "PyTorch",
  what: "a CNN that predicts per-joint heatmaps, decoded to coordinates by soft-argmax",
  cells: [
    md(`# 2D pose estimation — heatmap regression\n\n**Track A · Human Modeling** · maps to lesson A2 (2D→3D pose).\n\nThe standard way to find joints: a CNN predicts one **heatmap per joint** (a blob at the joint), and **soft-argmax** turns each heatmap into a coordinate. We train it on a synthetic articulated arm so it is fully self-contained.\n\n> CPU is fine.`),
    code(`import os, torch, torch.nn as nn, matplotlib.pyplot as plt
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 1500)); H = W = 48; K = 3
ys, xs = torch.meshgrid(torch.arange(H, dtype=torch.float32), torch.arange(W, dtype=torch.float32), indexing="ij")
ys, xs = ys.to(device), xs.to(device)`),
    md(`## 1 · Synthetic data — a 3-joint arm (base · elbow · hand)`),
    code(`def make_batch(n):                                       # vectorised: a 3-joint arm
    bx = W * 0.5 + torch.randn(n, 1, device=device) * 3
    by = H * 0.85 + torch.randn(n, 1, device=device) * 1.5
    a1 = -1.57 + (torch.rand(n, 1, device=device) - 0.5) * 1.4
    ex = bx + 14 * torch.cos(a1); ey = by + 14 * torch.sin(a1)
    a2 = a1 + (torch.rand(n, 1, device=device) - 0.5) * 1.6
    hx = ex + 12 * torch.cos(a2); hy = ey + 12 * torch.sin(a2)
    cx = torch.cat([bx, ex, hx], 1); cy = torch.cat([by, ey, hy], 1)        # (n,K)
    co = torch.stack([cx, cy], -1)                                          # (n,K,2)
    d2 = (xs[None, None] - cx[..., None, None]) ** 2 + (ys[None, None] - cy[..., None, None]) ** 2
    hms = torch.exp(-d2 / (2 * 2.0 ** 2))                                   # (n,K,H,W) target heatmaps
    imgs = hms.sum(1, keepdim=True).clamp(0, 1) + 0.03 * torch.randn(n, 1, H, W, device=device)
    return imgs, hms, co
xb, hb, cb = make_batch(4)
plt.imshow(xb[0, 0].cpu()); plt.title("input (joint blobs + noise)"); plt.axis("off"); plt.show()`),
    md(`## 2 · Model — a small fully-convolutional net (keeps resolution)`),
    code(`class PoseNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1), nn.ReLU(), nn.Conv2d(32, 32, 3, padding=1), nn.ReLU(),
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.Conv2d(64, K, 3, padding=1))
    def forward(self, x): return self.net(x)
def soft_argmax(hm):                          # differentiable coordinate decoder
    B, Kk, h, w = hm.shape
    p = torch.softmax(hm.reshape(B, Kk, -1), -1).reshape(B, Kk, h, w)
    return torch.stack([(p * xs).sum((-1, -2)), (p * ys).sum((-1, -2))], -1)
def coords_from(hm):                          # hard peak location -> (B,K,2) as (x,y), for PCK
    B, Kk, h, w = hm.shape
    idx = hm.reshape(B, Kk, -1).argmax(-1)
    return torch.stack([idx % w, idx // w], -1).float()`),
    md(`## 3 · Train — MSE on the heatmaps`),
    code(`import math
model = PoseNet().to(device); opt = torch.optim.Adam(model.parameters(), 1e-3)
hist = []; best = 0.0; best_state = None; thr = 0.1 * (H ** 2 + W ** 2) ** 0.5
for step in range(STEPS + 1):
    for g in opt.param_groups: g["lr"] = 1e-3 * (0.1 + 0.45 * (1 + math.cos(math.pi * step / max(1, STEPS))))
    x, hm, co = make_batch(16)
    loss = ((model(x) - hm) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        xv, hmv, cov = make_batch(64)                              # PCK on a fresh batch
        with torch.no_grad():
            pck = ((coords_from(model(xv)) - cov).norm(dim=-1) < thr).float().mean().item()
        if pck > best: best = pck; best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
        hist.append((step, round(pck, 3))); print(f"step {step:4d}  loss {loss.item():.4f}  PCK@0.1 {pck:.3f}  (best {best:.3f})")
if best_state: model.load_state_dict(best_state)`),
    md(`## 4 · Compare — predicted joints vs. ground truth`),
    code(`x, hm, co = make_batch(1)
with torch.no_grad(): pr = model(x); pj = coords_from(pr)[0].cpu()
fig, ax = plt.subplots(1, 2, figsize=(7, 3.6))
ax[0].imshow(x[0, 0].cpu()); ax[0].scatter(co[0, :, 0].cpu(), co[0, :, 1].cpu(), c="lime", s=40, label="truth")
ax[0].scatter(pj[:, 0], pj[:, 1], c="red", marker="x", s=40, label="pred"); ax[0].legend(); ax[0].set_title("joints"); ax[0].axis("off")
ax[1].imshow(pr[0].sum(0).cpu()); ax[1].set_title("predicted heatmaps"); ax[1].axis("off")
plt.show()`),
    md(`### Where to go next\n- Add a U-Net / stacked-hourglass and real images (MPII, COCO).\n- **Lift** these 2D joints to 3D with a small lifter network (lesson A2), or fit SMPL to them (the SMPLify lab).`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 12 — 6D vs Euler rotation regression (Track A)
// ---------------------------------------------------------------------------
const rot6d = {
  file: "A_rotation_6d.ipynb", title: "6D vs Euler rotation regression", track: "A · Human Modeling", tag: "PyTorch",
  what: "two nets regress rotations — showing the 6D representation beats Euler angles",
  cells: [
    md(`# Why 6D rotations beat Euler angles\n\n**Track A · Human Modeling** · maps to lesson A6 (rotation continuity).\n\nEuler angles (and quaternions) are **discontinuous** as a network output, which hurts learning. The **6D** representation (Zhou et al. 2019) is continuous. We train identical nets to regress random rotations with each parametrisation and compare the geodesic error.\n\n> CPU is fine.`),
    code(`import os, torch, torch.nn as nn, matplotlib.pyplot as plt
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 3000))
def rand_rot(n):
    q = torch.randn(n, 4, device=device); q = q / q.norm(dim=1, keepdim=True)
    w, x, y, z = q.unbind(1)
    return torch.stack([1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w),
                        2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w),
                        2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)], 1).view(n, 3, 3)
pts = torch.randn(8, 3, device=device)
def geo(A, B):
    tr = (A.transpose(1, 2) @ B).diagonal(dim1=1, dim2=2).sum(1)
    return torch.acos(((tr - 1) / 2).clamp(-1 + 1e-6, 1 - 1e-6))`),
    md(`## 1 · The two output heads`),
    code(`def sixd_to_R(d):
    a1, a2 = d[:, :3], d[:, 3:]
    b1 = a1 / a1.norm(dim=1, keepdim=True)
    a2 = a2 - (b1 * a2).sum(1, keepdim=True) * b1; b2 = a2 / a2.norm(dim=1, keepdim=True)
    b3 = torch.cross(b1, b2, dim=1)
    return torch.stack([b1, b2, b3], 2)
def euler_to_R(e):
    cx, cy, cz = torch.cos(e).unbind(1); sx, sy, sz = torch.sin(e).unbind(1)
    return torch.stack([cy*cz, cz*sx*sy-cx*sz, sx*sz+cx*cz*sy,
                        cy*sz, cx*cz+sx*sy*sz, cx*sy*sz-cz*sx,
                        -sy, cy*sx, cx*cy], 1).view(-1, 3, 3)
def make_net(out):
    return nn.Sequential(nn.Linear(24, 128), nn.ReLU(), nn.Linear(128, 128), nn.ReLU(), nn.Linear(128, out)).to(device)`),
    md(`## 2 · Train both (same data, same budget)`),
    code(`def train(out, to_R):
    net = make_net(out); opt = torch.optim.Adam(net.parameters(), 1e-3); h = []
    for step in range(STEPS + 1):
        R = rand_rot(256); x = (R @ pts.T).transpose(1, 2).reshape(256, -1)
        loss = geo(to_R(net(x)), R).mean()
        opt.zero_grad(); loss.backward(); opt.step()
        if step % max(1, STEPS // 10) == 0: h.append((step, loss.item()))
    return net, h
torch.manual_seed(0); _, h6 = train(6, sixd_to_R)
torch.manual_seed(0); m_e, hE = train(3, euler_to_R)
torch.manual_seed(0); m6, _ = train(6, sixd_to_R)
print(f"final mean geodesic error (rad) — 6D {h6[-1][1]:.3f}  vs  Euler {hE[-1][1]:.3f}")`),
    md(`## 3 · Compare — 6D converges lower`),
    code(`import math
fig, ax = plt.subplots(figsize=(6, 3.6))
ax.plot(*zip(*h6), label="6D (continuous)"); ax.plot(*zip(*hE), label="Euler (discontinuous)")
ax.set_xlabel("step"); ax.set_ylabel("geodesic error (rad)"); ax.legend(); ax.grid(alpha=.3); ax.set_title("rotation representation matters")
plt.show()`),
    md(`### Where to go next\n- Use 6D outputs anywhere a network predicts rotation: body pose (SMPL θ), camera pose, hand pose.\n- Read Zhou et al., *On the Continuity of Rotation Representations* (CVPR 2019).`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 13 — Multiresolution hash-grid (Instant-NGP idea), image fit (Track B)
// ---------------------------------------------------------------------------
const hashgrid = {
  file: "B_hashgrid_instngp.ipynb", title: "Multiresolution hash grid (Instant-NGP)", track: "B · 3D & Neural Rendering", tag: "PyTorch",
  what: "a multiresolution hash-grid encoding + tiny MLP fitting an image (the Instant-NGP trick)",
  cells: [
    md(`# Multiresolution hash grid — the Instant-NGP trick\n\n**Track B · 3D & Neural Rendering** · maps to lesson B6 (hash grids).\n\nInstant-NGP made NeRF ~1000× faster by replacing a big MLP with a **multiresolution hash grid** of trainable features + a tiny MLP. Here we fit a 2D image with it (the paper's gigapixel demo) so it trains in seconds.\n\n> CPU is fine; PSNR climbs fast.`),
    code(`import os, math, torch, torch.nn as nn, matplotlib.pyplot as plt
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 1500)); H = W = 96
L, T, Fdim = 8, 1 << 14, 2                      # levels, hash-table size, features/level
res = [int(round(8 * 1.5 ** l)) for l in range(L)]
primes = torch.tensor([1, 2654435761], device=device)`),
    md(`## 1 · Target image (procedural, self-contained)`),
    code(`ys = torch.linspace(0, 1, H, device=device); xs = torch.linspace(0, 1, W, device=device)
YY, XX = torch.meshgrid(ys, xs, indexing="ij")
target = torch.stack([0.5 + 0.5 * torch.sin(12 * XX) * torch.cos(9 * YY),
                      0.5 + 0.5 * torch.sin(7 * (XX + YY)),
                      0.5 + 0.5 * torch.cos(10 * YY)], -1).clamp(0, 1)
coords = torch.stack([XX, YY], -1).reshape(-1, 2)
plt.imshow(target.cpu()); plt.title("target"); plt.axis("off"); plt.show()`),
    md(`## 2 · The hash-grid encoding (bilinear, per level)`),
    code(`tables = nn.Parameter((torch.rand(L, T, Fdim, device=device) * 2 - 1) * 1e-4)
def encode(c):                                  # c (N,2) in [0,1]
    out = []
    for l in range(L):
        p = c * (res[l] - 1)
        x0 = p[:, 0].floor().long(); y0 = p[:, 1].floor().long(); x1 = x0 + 1; y1 = y0 + 1
        wx = (p[:, 0] - x0).unsqueeze(1); wy = (p[:, 1] - y0).unsqueeze(1)
        def f(ix, iy): return tables[l][((ix * primes[0]) ^ (iy * primes[1])) % T]
        c0 = f(x0, y0) * (1 - wx) + f(x1, y0) * wx
        c1 = f(x0, y1) * (1 - wx) + f(x1, y1) * wx
        out.append(c0 * (1 - wy) + c1 * wy)
    return torch.cat(out, -1)
mlp = nn.Sequential(nn.Linear(L * Fdim, 64), nn.ReLU(), nn.Linear(64, 64), nn.ReLU(), nn.Linear(64, 3)).to(device)`),
    md(`## 3 · Train — fit the image`),
    code(`opt = torch.optim.Adam([tables, *mlp.parameters()], 1e-2); tgt = target.reshape(-1, 3); hist = []
for step in range(STEPS + 1):
    rgb = torch.sigmoid(mlp(encode(coords)))
    loss = ((rgb - tgt) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        psnr = (-10 * torch.log10(loss)).item(); hist.append((step, psnr)); print(f"step {step:4d}  PSNR {psnr:5.2f} dB")`),
    md(`## 4 · Compare — reconstruction vs. target`),
    code(`with torch.no_grad(): img = torch.sigmoid(mlp(encode(coords))).reshape(H, W, 3).cpu()
fig, ax = plt.subplots(1, 3, figsize=(11, 3.6))
ax[0].imshow(target.cpu()); ax[0].set_title("target"); ax[0].axis("off")
ax[1].imshow(img.clamp(0, 1)); ax[1].set_title("hash-grid fit"); ax[1].axis("off")
ax[2].plot(*zip(*hist), "-o"); ax[2].set_title("PSNR ↑"); ax[2].set_xlabel("step"); ax[2].grid(alpha=.3)
plt.tight_layout(); plt.show()`),
    md(`### Where to go next\n- Feed this encoding into a NeRF (3D coords) → **Instant-NGP** speed for the from-scratch NeRF lab.\n- Add per-level learning-rate / weight decay; the real implementation uses a CUDA kernel (tiny-cuda-nn).`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 14 — ICP point-cloud registration (Track B)
// ---------------------------------------------------------------------------
const icp = {
  file: "B_icp_registration.ipynb", title: "ICP point-cloud registration", track: "B · 3D & Neural Rendering", tag: "PyTorch",
  what: "align two point clouds with Iterative Closest Point (nearest-neighbour + Kabsch)",
  cells: [
    md(`# ICP — align two point clouds\n\n**Track B · 3D & Neural Rendering** (also lessons D1–D3) · the core of registration & SLAM front-ends.\n\n**Iterative Closest Point**: match each source point to its nearest target point, solve the best rigid transform (Kabsch/SVD), apply, repeat. We recover a known transform from noisy data.\n\n> CPU is fine.`),
    code(`import os, math, torch, matplotlib.pyplot as plt
device = "cuda" if torch.cuda.is_available() else "cpu"
ITERS = int(os.environ.get("STEPS", 30))
# a 3D shape (two linked rings)
t = torch.linspace(0, 2 * math.pi, 400, device=device)
src = torch.cat([torch.stack([torch.cos(t), torch.sin(t), 0 * t], 1),
                 torch.stack([1 + torch.cos(t), 0 * t, torch.sin(t)], 1)], 0)`),
    md(`## 1 · Make a target = rigidly-moved, noisy copy`),
    code(`def Rz(a): return torch.tensor([[math.cos(a), -math.sin(a), 0], [math.sin(a), math.cos(a), 0], [0, 0, 1]], device=device)
R_true = Rz(0.7) @ torch.tensor([[1., 0, 0], [0, math.cos(0.4), -math.sin(0.4)], [0, math.sin(0.4), math.cos(0.4)]], device=device)
t_true = torch.tensor([0.6, -0.4, 0.3], device=device)
tgt = (R_true @ src.T).T + t_true + 0.01 * torch.randn_like(src)`),
    md(`## 2 · ICP — nearest neighbours + Kabsch, iterated`),
    code(`def kabsch(P, Q):
    pc, qc = P.mean(0), Q.mean(0)
    U, S, Vt = torch.linalg.svd((P - pc).T @ (Q - qc))
    d = torch.sign(torch.det(Vt.T @ U.T))
    R = Vt.T @ torch.diag(torch.tensor([1., 1., d], device=device)) @ U.T
    return R, qc - R @ pc
P = src.clone(); hist = []
for it in range(ITERS + 1):
    idx = torch.cdist(P, tgt).argmin(1); Q = tgt[idx]
    R, tt = kabsch(P, Q); P = (R @ P.T).T + tt
    rmse = (P - Q).norm(dim=1).mean().item(); hist.append((it, rmse))
    if it % max(1, ITERS // 10) == 0: print(f"iter {it:3d}  RMSE {rmse:.4f}")`),
    md(`## 3 · Compare — before vs. after alignment`),
    code(`fig = plt.figure(figsize=(10, 4))
for i, (Pp, ttl) in enumerate([(src, "before"), (P, "after ICP")]):
    ax = fig.add_subplot(1, 2, i + 1, projection="3d")
    ax.scatter(*tgt.cpu().T, s=3, c="C0", label="target"); ax.scatter(*Pp.detach().cpu().T, s=3, c="C3", label="source")
    ax.set_title(ttl); ax.legend(); ax.set_axis_off()
plt.tight_layout(); plt.show()`),
    md(`### Where to go next\n- Add point-to-plane ICP, outlier rejection, and a coarse global init (FPFH / RANSAC).\n- ICP is the registration step in TSDF fusion and dense SLAM (next labs in track D).`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 15 — Action anticipation with an LSTM (Track C)
// ---------------------------------------------------------------------------
const anticip = {
  file: "C_action_anticipation_lstm.ipynb", title: "Action anticipation (LSTM)", track: "C · Egocentric Vision", tag: "PyTorch",
  what: "an LSTM that anticipates the next action from a sequence (top-k accuracy)",
  cells: [
    md(`# Anticipate the next action — an LSTM\n\n**Track C · Egocentric Vision** · maps to lesson C4 (recognition & anticipation).\n\nAnticipation = predict what happens **next**. We generate action sequences from a hidden grammar (a Markov process over a verb vocabulary) and train an LSTM to predict the next action — then measure top-1/top-2 accuracy against the chance baseline.\n\n> CPU is fine.`),
    code(`import os, torch, torch.nn as nn, matplotlib.pyplot as plt
torch.manual_seed(0)
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 1500)); V, Lseq = 6, 12
verbs = ["take", "wash", "cut", "cook", "pour", "place"]
trans = torch.rand(V, V) + torch.eye(V) * 2.0; trans = trans / trans.sum(1, keepdim=True)   # structured grammar`),
    md(`## 1 · Generate sequences from the hidden grammar`),
    code(`def batch(n):
    seqs = torch.zeros(n, Lseq, dtype=torch.long)
    for b in range(n):
        s = torch.randint(0, V, (1,)).item()
        for i in range(Lseq):
            seqs[b, i] = s; s = torch.multinomial(trans[s], 1).item()
    return seqs.to(device)
print("example:", [verbs[i] for i in batch(1)[0].tolist()])`),
    md(`## 2 · Model — embedding + LSTM + next-token head`),
    code(`class Antic(nn.Module):
    def __init__(self):
        super().__init__(); self.emb = nn.Embedding(V, 32); self.lstm = nn.LSTM(32, 64, batch_first=True); self.head = nn.Linear(64, V)
    def forward(self, x): return self.head(self.lstm(self.emb(x))[0])
model = Antic().to(device); opt = torch.optim.Adam(model.parameters(), 3e-3)`),
    md(`## 3 · Train — predict token t+1 from tokens ≤ t`),
    code(`import math
hist = []; best = 0.0; best_state = None
for step in range(STEPS + 1):
    for g in opt.param_groups: g["lr"] = 3e-3 * (0.1 + 0.45 * (1 + math.cos(math.pi * step / max(1, STEPS))))
    x = batch(128); logits = model(x[:, :-1])
    loss = nn.functional.cross_entropy(logits.reshape(-1, V), x[:, 1:].reshape(-1))
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        with torch.no_grad():
            xv = batch(512); lg = model(xv[:, :-1]); tgt = xv[:, 1:]
            top1 = (lg.argmax(-1) == tgt).float().mean().item()
            top2 = (lg.topk(2, -1).indices == tgt.unsqueeze(-1)).any(-1).float().mean().item()
        if top1 > best: best = top1; best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
        hist.append((step, round(top1, 3))); print(f"step {step:4d}  top-1 {top1:.3f}  top-2 {top2:.3f}  (chance {1/V:.3f})")
if best_state: model.load_state_dict(best_state)`),
    md(`## 4 · Compare — accuracy vs. chance`),
    code(`fig, ax = plt.subplots(figsize=(6, 3.6))
ax.plot(*zip(*hist), "-o", label="top-1"); ax.axhline(1 / V, ls="--", c="C7", label="chance")
ax.set_xlabel("step"); ax.set_ylabel("next-action accuracy"); ax.legend(); ax.grid(alpha=.3); ax.set_title("the model learned the grammar")
plt.show()`),
    md(`### Where to go next\n- Feed real video features (from the VideoMAE / CLIP labs) instead of action IDs.\n- Predict actions further ahead (anticipation horizon), or the time-to-next-action.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 16 — TSDF fusion → mesh (Track D)
// ---------------------------------------------------------------------------
const tsdf = {
  file: "D_tsdf_fusion.ipynb", title: "TSDF fusion → mesh", track: "D · Scene & World Models", tag: "PyTorch",
  what: "fuse multi-view depth into a truncated SDF volume and extract a mesh (marching cubes)",
  cells: [
    md(`# TSDF fusion — depth maps → a 3D mesh\n\n**Track D · Scene & World Models** · maps to lesson D3 (TSDF fusion).\n\nDense reconstruction integrates many depth images into a **Truncated Signed Distance** volume; the surface is its zero level set. We simulate depth from six viewpoints of a shape, fuse, and run marching cubes.\n\n> CPU is fine.`),
    code(`import os, numpy as np, matplotlib.pyplot as plt
R = int(os.environ.get("STEPS", 64)); tau = 3.0 / R * 4   # grid res, truncation
g = np.linspace(-1, 1, R)
X, Y, Z = np.meshgrid(g, g, g, indexing="ij")`),
    md(`## 1 · The scene (two spheres) and its occupancy`),
    code(`def sdf(x, y, z):
    d1 = np.sqrt((x + .25) ** 2 + y ** 2 + z ** 2) - 0.55
    d2 = np.sqrt((x - .45) ** 2 + (y - .2) ** 2 + z ** 2) - 0.4
    return np.minimum(d1, d2)
occ = sdf(X, Y, Z) < 0
print("occupied voxels:", int(occ.sum()))`),
    md(`## 2 · Simulate 6 orthographic depth views and fuse into a TSDF`),
    code(`tsdf = np.zeros((R, R, R)); wsum = np.zeros((R, R, R))
axes = [(0, 1), (0, -1), (1, 1), (1, -1), (2, 1), (2, -1)]   # (axis, direction)
coord = [X, Y, Z]
for ax, sign in axes:
    o = occ if sign > 0 else occ[tuple(slice(None, None, -1) if i == ax else slice(None) for i in range(3))]
    c = coord[ax] if sign > 0 else coord[ax][tuple(slice(None, None, -1) if i == ax else slice(None) for i in range(3))]
    # nearest surface coordinate seen by this view, per (u,v) column along 'ax'
    first = np.argmax(o, axis=ax); seen = o.any(axis=ax)
    surf = np.take_along_axis(c, np.expand_dims(first, ax), axis=ax)            # (.. surface coord ..)
    raw = c - surf                                                              # +ve in front of surface, -ve behind
    w = (np.abs(raw) < tau) & np.expand_dims(seen, ax)
    raw = np.clip(raw, -tau, tau)
    if sign < 0:  # undo the flip
        raw = raw[tuple(slice(None, None, -1) if i == ax else slice(None) for i in range(3))]
        w = w[tuple(slice(None, None, -1) if i == ax else slice(None) for i in range(3))]
    tsdf += np.where(w, raw, 0.0); wsum += w
vol = np.where(wsum > 0, tsdf / np.maximum(wsum, 1), tau)
print("TSDF range:", round(float(vol.min()), 3), "to", round(float(vol.max()), 3))`),
    md(`## 3 · Extract the surface (marching cubes)`),
    code(`from skimage import measure
verts, faces, _, _ = measure.marching_cubes(vol, level=0.0)
fig = plt.figure(figsize=(5, 5)); ax = fig.add_subplot(111, projection="3d")
ax.plot_trisurf(verts[:, 0], verts[:, 1], verts[:, 2], triangles=faces, cmap="viridis", lw=0)
ax.set_title(f"fused mesh — {verts.shape[0]} verts"); ax.set_axis_off(); plt.show()`),
    md(`### Where to go next\n- Use real RGB-D (a phone LiDAR scan, RealSense) with true camera poses; weight by depth confidence.\n- Stream it online with pose tracking → dense **SLAM** (the SplaTAM advanced lab).`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 17 — Bayesian semantic mapping (Track D)
// ---------------------------------------------------------------------------
const semmap = {
  file: "D_semantic_mapping.ipynb", title: "Bayesian semantic mapping", track: "D · Scene & World Models", tag: "PyTorch",
  what: "fuse noisy per-cell observations into an occupancy + semantic-label map over time",
  cells: [
    md(`# Bayesian semantic mapping\n\n**Track D · Scene & World Models** · maps to lesson D4 (Bayesian label fusion).\n\nA map is built from many **noisy** observations. We fuse them the principled way: **log-odds** for occupancy and **count-based posteriors** for the semantic class, and watch the map converge to the truth.\n\n> CPU is fine.`),
    code(`import os, numpy as np, matplotlib.pyplot as plt
rng = np.random.default_rng(0)
Gh, Gw, Kc = 32, 32, 4
STEPS = int(os.environ.get("STEPS", 300))
gt_label = rng.integers(0, Kc, size=(Gh, Gw))
gt_occ = (rng.random((Gh, Gw)) < 0.45)`),
    md(`## 1 · Sensor model — observations are right with prob. p`),
    code(`p_occ, p_lab = 0.8, 0.7
logodds = np.zeros((Gh, Gw)); counts = np.ones((Gh, Gw, Kc))   # Dirichlet prior
def observe():
    ys = rng.integers(0, Gh, 60); xs = rng.integers(0, Gw, 60)   # a sensor footprint
    for y, x in zip(ys, xs):
        z_occ = gt_occ[y, x] if rng.random() < p_occ else not gt_occ[y, x]
        logodds[y, x] += (1.84 if z_occ else -1.84)             # log(p/(1-p))
        z_lab = gt_label[y, x] if rng.random() < p_lab else rng.integers(0, Kc)
        counts[y, x, z_lab] += 1`),
    md(`## 2 · Fuse over time, tracking accuracy`),
    code(`hist = []
for step in range(STEPS + 1):
    observe()
    if step % max(1, STEPS // 10) == 0:
        occ_acc = ((logodds > 0) == gt_occ).mean()
        lab_acc = (counts.argmax(-1) == gt_label).mean()
        hist.append((step, round(float(occ_acc), 3), round(float(lab_acc), 3)))
        print(f"step {step:4d}  occupancy acc {occ_acc:.3f}  label acc {lab_acc:.3f}")`),
    md(`## 3 · Compare — recovered maps vs. ground truth`),
    code(`fig, ax = plt.subplots(2, 2, figsize=(7, 7))
ax[0, 0].imshow(gt_occ); ax[0, 0].set_title("true occupancy"); ax[0, 1].imshow(logodds > 0); ax[0, 1].set_title("estimated")
ax[1, 0].imshow(gt_label, cmap="tab10"); ax[1, 0].set_title("true labels"); ax[1, 1].imshow(counts.argmax(-1), cmap="tab10"); ax[1, 1].set_title("estimated")
for a in ax.ravel(): a.axis("off")
plt.tight_layout(); plt.show()`),
    md(`### Where to go next\n- Replace random footprints with a moving camera frustum and real per-pixel class probabilities (e.g. from the CLIP / DINOv2 labs) → **open-vocabulary mapping**.\n- Add a 3D voxel grid and fuse into the TSDF for a semantic 3D map.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 18 — REINFORCE policy gradient on a gridworld (Agents & RL)
// ---------------------------------------------------------------------------
const reinforce = {
  file: "AG_reinforce_gridworld.ipynb", title: "REINFORCE policy gradient", track: "AG · Agents & RL", tag: "PyTorch",
  what: "train an agent to reach a goal with the REINFORCE policy-gradient algorithm",
  cells: [
    md(`# REINFORCE — learn a policy by trial and error\n\n**Agents & RL** · the simplest policy-gradient method (the root of PPO, used in RLHF).\n\nAn agent explores a gridworld; we reward reaching the goal and push up the probability of actions that led to high return. Self-contained — no gym needed.\n\n> CPU is fine.`),
    code(`import os, torch, torch.nn as nn, matplotlib.pyplot as plt
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 600)); N = 5; GOAL = (N - 1, N - 1); GAMMA = 0.95`),
    md(`## 1 · The environment (a ${"N×N"} gridworld)`),
    code(`MOVES = [(-1, 0), (1, 0), (0, -1), (0, 1)]
def step(pos, a):
    x = min(max(pos[0] + MOVES[a][0], 0), N - 1); y = min(max(pos[1] + MOVES[a][1], 0), N - 1)
    done = (x, y) == GOAL
    return (x, y), (5.0 if done else -0.1), done
def feat(pos):
    v = torch.zeros(2 * N, device=device); v[pos[0]] = 1.0; v[N + pos[1]] = 1.0; return v`),
    md(`## 2 · Policy network + REINFORCE update`),
    code(`policy = nn.Sequential(nn.Linear(2 * N, 64), nn.ReLU(), nn.Linear(64, 4)).to(device)
value = nn.Sequential(nn.Linear(2 * N, 64), nn.ReLU(), nn.Linear(64, 1)).to(device)   # critic baseline
opt = torch.optim.Adam(list(policy.parameters()) + list(value.parameters()), 2e-3)
def episode():
    pos = (torch.randint(0, N, (1,)).item(), torch.randint(0, N, (1,)).item())
    states, logps, ents, rews = [], [], [], []
    for _ in range(40):
        if pos == GOAL: break
        f = feat(pos); d = torch.distributions.Categorical(logits=policy(f)); a = d.sample()
        states.append(f); logps.append(d.log_prob(a)); ents.append(d.entropy())
        pos, r, done = step(pos, a.item()); rews.append(r)
        if done: break
    return states, logps, ents, rews`),
    md(`## 3 · Train — push up high-return actions`),
    code(`hist = []
for step_i in range(STEPS + 1):
    batch_loss, rets = [], []
    for _ in range(16):
        states, logps, ents, rews = episode()
        if not logps: continue
        G = 0; returns = []
        for r in reversed(rews): G = r + GAMMA * G; returns.insert(0, G)
        returns = torch.tensor(returns, device=device)
        V = value(torch.stack(states)).squeeze(-1)                 # state-value baseline
        adv = (returns - V).detach(); adv = (adv - adv.mean()) / (adv.std(unbiased=False) + 1e-6)
        pg = -(torch.stack(logps) * adv).sum()                     # policy gradient with advantage
        vloss = ((V - returns) ** 2).mean()                        # critic regression
        ent = -0.01 * torch.stack(ents).sum()                      # entropy bonus (exploration)
        batch_loss.append(pg + 0.5 * vloss + ent); rets.append(sum(rews))
    loss = torch.stack(batch_loss).mean(); opt.zero_grad(); loss.backward()
    torch.nn.utils.clip_grad_norm_(list(policy.parameters()) + list(value.parameters()), 1.0); opt.step()
    if step_i % max(1, STEPS // 10) == 0:
        ar = sum(rets) / len(rets); hist.append((step_i, round(ar, 2))); print(f"step {step_i:4d}  avg return {ar:6.2f}")`),
    md(`## 4 · Compare — return climbs as the policy learns`),
    code(`fig, ax = plt.subplots(figsize=(6, 3.6))
ax.plot(*zip(*hist), "-o"); ax.set_xlabel("update"); ax.set_ylabel("avg episode return"); ax.grid(alpha=.3); ax.set_title("REINFORCE learns to reach the goal")
plt.show()`),
    md(`### Where to go next\n- Add a value baseline → **Actor-Critic**, then clipped updates → **PPO** (the algorithm behind RLHF).\n- Swap the gridworld for a Gym/MuJoCo task; learn from pixels with a world model (track D).`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 19 — Behavior cloning / imitation learning (Agents & RL)
// ---------------------------------------------------------------------------
const bc = {
  file: "AG_behavior_cloning.ipynb", title: "Behavior cloning (imitation)", track: "AG · Agents & RL", tag: "PyTorch",
  what: "learn a policy by supervised imitation of expert demonstrations",
  cells: [
    md(`# Behavior cloning — imitate an expert\n\n**Agents & RL** · the simplest imitation-learning recipe (how many robot/driving policies start).\n\nWe collect (state → expert action) demonstrations and train a network to copy them — pure supervised learning — then roll out the learned policy and measure success.\n\n> CPU is fine.`),
    code(`import os, torch, torch.nn as nn, matplotlib.pyplot as plt
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 800)); N = 6; GOAL = (N - 1, N - 1)
MOVES = [(-1, 0), (1, 0), (0, -1), (0, 1)]
def feat(p): v = torch.zeros(2 * N); v[p[0]] = 1.0; v[N + p[1]] = 1.0; return v
def expert(p):                                   # greedy: reduce Manhattan distance to goal
    if p[0] < GOAL[0]: return 1
    if p[1] < GOAL[1]: return 3
    return 0`),
    md(`## 1 · Collect demonstrations from the expert`),
    code(`X, Y = [], []
for _ in range(2000):
    p = (torch.randint(0, N, (1,)).item(), torch.randint(0, N, (1,)).item())
    if p == GOAL: continue
    X.append(feat(p)); Y.append(expert(p))
X = torch.stack(X).to(device); Y = torch.tensor(Y, device=device)
print("demonstrations:", X.shape[0])`),
    md(`## 2 · Train the policy to copy the expert`),
    code(`policy = nn.Sequential(nn.Linear(2 * N, 64), nn.ReLU(), nn.Linear(64, 4)).to(device)
opt = torch.optim.Adam(policy.parameters(), 3e-3); hist = []
for step in range(STEPS + 1):
    loss = nn.functional.cross_entropy(policy(X), Y)
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0:
        acc = (policy(X).argmax(1) == Y).float().mean().item(); hist.append((step, round(acc, 3))); print(f"step {step:4d}  imitation acc {acc:.3f}")`),
    md(`## 3 · Roll out the learned policy — does it reach the goal?`),
    code(`@torch.no_grad()
def rollout(p):
    for _ in range(2 * N):
        if p == GOAL: return True
        a = policy(feat(p).to(device)).argmax().item()
        p = (min(max(p[0] + MOVES[a][0], 0), N - 1), min(max(p[1] + MOVES[a][1], 0), N - 1))
    return p == GOAL
succ = sum(rollout((i // N, i % N)) for i in range(N * N) if (i // N, i % N) != GOAL) / (N * N - 1)
print(f"success rate from every start cell: {succ:.3f}")`),
    md(`## 4 · Compare — imitation accuracy over training`),
    code(`fig, ax = plt.subplots(figsize=(6, 3.6))
ax.plot(*zip(*hist), "-o"); ax.set_xlabel("step"); ax.set_ylabel("imitation accuracy"); ax.grid(alpha=.3); ax.set_title(f"behavior cloning — rollout success {succ:.0%}")
plt.show()`),
    md(`### Where to go next\n- BC suffers from **distribution shift**; fix it with **DAgger** (query the expert on the policy's own states).\n- Imitate from images with a CNN encoder; combine with RL fine-tuning (track AG).`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 20 — Agent + tool-use harness (Agents & RL)
// ---------------------------------------------------------------------------
const agentharness = {
  file: "AG_agent_harness.ipynb", title: "Agent + tool-use harness", track: "AG · Agents & RL", tag: "PyTorch",
  what: "a reusable harness: tools, a tool-using agent loop, a task suite, and scoring",
  cells: [
    md(`# Design an agent + evaluation harness\n\n**Agents & RL** · harness design — the scaffolding every agent project needs.\n\nWe build the reusable pieces: a **tool** registry, a **reasoning loop** that picks and calls tools, a **task suite**, and an **evaluator** that runs the agent over the suite and scores it. The agent here is rule-based so it is self-contained and verifiable — swap in an LLM policy and the harness is unchanged.\n\n> CPU is fine. No LLM/network needed.`),
    code(`import os, re, json, math, matplotlib.pyplot as plt`),
    md(`## 1 · Tools (a registry the agent can call)`),
    code(`TOOLS = {
    "calc": lambda expr: eval(expr, {"__builtins__": {}}, {"sqrt": math.sqrt}),
    "len":  lambda s: len(s),
    "rev":  lambda s: s[::-1],
}`),
    md(`## 2 · A tool-using agent (a ReAct-style loop)\nParse the task, decide which tool to call, return the answer. (Replace this function body with an LLM call and the rest of the harness is identical.)`),
    code(`def agent(task):
    log = []
    m = re.match(r"compute (.+)", task)
    if m: tool, arg = "calc", m.group(1)
    elif task.startswith("length of "): tool, arg = "len", task[len("length of "):]
    elif task.startswith("reverse "): tool, arg = "rev", task[len("reverse "):]
    else: return None, [("noop", task)]
    log.append(("call", tool, arg)); out = TOOLS[tool](arg); log.append(("obs", out))
    return out, log`),
    md(`## 3 · A task suite with ground-truth answers`),
    code(`SUITE = [
    {"task": "compute 2*(3+4)", "answer": 14},
    {"task": "compute sqrt(144)", "answer": 12.0},
    {"task": "length of robotics", "answer": 8},
    {"task": "reverse agent", "answer": "tnega"},
    {"task": "compute 10*10-1", "answer": 99},
]`),
    md(`## 4 · The evaluator — run the agent over the suite and score`),
    code(`def evaluate(agent_fn, suite):
    results = []
    for t in suite:
        try: pred, log = agent_fn(t["task"])
        except Exception as e: pred, log = f"error:{e}", []
        ok = (pred == t["answer"])
        results.append({"task": t["task"], "pred": pred, "gold": t["answer"], "ok": bool(ok), "trace": log})
    acc = sum(r["ok"] for r in results) / len(results)
    return acc, results
acc, results = evaluate(agent, SUITE)
print(f"success rate: {acc:.2f}\\n")
for r in results: print(("PASS" if r["ok"] else "FAIL"), "|", r["task"], "->", r["pred"])`),
    md(`## 5 · Report`),
    code(`fig, ax = plt.subplots(figsize=(6, 3))
ax.barh([r["task"] for r in results], [1 if r["ok"] else 0 for r in results], color=["#5aa86a" if r["ok"] else "#e0796b" for r in results])
ax.set_xlim(0, 1); ax.set_title(f"agent harness — {acc:.0%} pass"); ax.set_xticks([])
plt.tight_layout(); plt.show()`),
    md(`### Where to go next\n- Replace \`agent()\` with an **LLM** that emits tool calls (function calling / ReAct) — see the advanced *LLM agent* lab.\n- Add multi-step planning, memory, and a larger graded suite; log full traces for failure analysis (lesson C9).`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 21 — SimCLR self-supervised pretraining (foundation-model recipe)
// ---------------------------------------------------------------------------
const simclr = {
  file: "C_simclr_pretrain.ipynb", title: "SimCLR self-supervised pretraining", track: "C · Egocentric Vision", tag: "PyTorch",
  what: "contrastive self-supervised pretraining on real handwritten digits, then a linear probe (how CLIP/DINO are made)",
  cells: [
    md(`# SimCLR — learn features with no labels\n\n**Foundation-model recipe** (supports track C and the lesson on self-supervision).\n\nSelf-supervised contrastive learning is how backbones like SimCLR/DINO/CLIP are pretrained: pull two augmentations of the same image together, push different images apart (**NT-Xent**). We pretrain on **real handwritten digits with no labels**, then freeze the encoder and train a small **linear probe** on a handful of labels — beating a random-init encoder on held-out test digits.\n\n> Real data: scikit-learn \`load_digits\` (1,797 real 8×8 images, 10 classes). CPU is fine.`),
    code(`import os, math, torch, torch.nn as nn, torch.nn.functional as F, matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 1000)); torch.manual_seed(0)`),
    md(`## 1 · Real handwritten digits — pretrain unlabeled, hold out a test split`),
    code(`d = load_digits()
X = torch.tensor(d.images / 16.0, dtype=torch.float32).unsqueeze(1)   # (1797,1,8,8) in [0,1]
y = torch.tensor(d.target, dtype=torch.long)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
Xtr, Xte = Xtr.to(device), Xte.to(device)
print("train", tuple(Xtr.shape), "test", tuple(Xte.shape), "classes", int(y.max()) + 1)
plt.imshow(torch.cat([Xtr[i, 0].cpu() for i in range(10)], 1), cmap="gray"); plt.title("real handwritten digits"); plt.axis("off"); plt.show()`),
    md(`## 2 · Encoder + projection head; NT-Xent contrastive loss`),
    code(`def make_enc():
    return nn.Sequential(nn.Conv2d(1, 32, 3, 1, 1), nn.ReLU(), nn.MaxPool2d(2),                       # 8 -> 4
                         nn.Conv2d(32, 64, 3, 1, 1), nn.ReLU(), nn.AdaptiveAvgPool2d(1), nn.Flatten()).to(device)  # -> 64-d
enc = make_enc(); proj = nn.Sequential(nn.Linear(64, 64), nn.ReLU(), nn.Linear(64, 32)).to(device)
def augment(x):                                       # label-preserving views (no flips — digits aren't flip-invariant)
    x = x + 0.12 * torch.randn_like(x)
    x = x * (0.7 + 0.6 * torch.rand(x.shape[0], 1, 1, 1, device=x.device))
    x = torch.roll(x, shifts=(int(torch.randint(-1, 2, (1,))), int(torch.randint(-1, 2, (1,)))), dims=(-2, -1))
    return x.clamp(0, 1)
def nt_xent(z, tau=0.5):
    z = F.normalize(z, dim=1); B = z.shape[0] // 2
    sim = z @ z.T / tau; sim.fill_diagonal_(-9e9)
    targets = (torch.arange(2 * B, device=device) + B) % (2 * B)
    return F.cross_entropy(sim, targets)`),
    md(`## 3 · Pretrain — contrastive, no labels`),
    code(`opt = torch.optim.Adam([*enc.parameters(), *proj.parameters()], 1e-3); hist = []
B = 256                                              # contrastive learning loves a big batch
for step in range(STEPS + 1):
    for g in opt.param_groups: g["lr"] = 1e-3 * (0.1 + 0.45 * (1 + math.cos(math.pi * step / max(1, STEPS))))
    idx = torch.randint(0, Xtr.shape[0], (B,)); x = Xtr[idx]
    z = proj(torch.cat([enc(augment(x)), enc(augment(x))], 0)); loss = nt_xent(z)
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0: hist.append((step, round(loss.item(), 3))); print(f"step {step:4d}  NT-Xent {loss.item():.3f}")`),
    md(`## 4 · Linear probe — SimCLR features vs. a random encoder (few-shot, real labels)`),
    code(`def probe(encoder, ntr=100):                      # only 100 labels: where self-supervision wins
    encoder.eval(); idx = torch.randperm(Xtr.shape[0])[:ntr]
    with torch.no_grad(): ftr = encoder(Xtr[idx]); fte = encoder(Xte)
    clf = nn.Linear(ftr.shape[1], 10).to(device); o = torch.optim.Adam(clf.parameters(), 1e-2)
    for _ in range(400): o.zero_grad(); F.cross_entropy(clf(ftr), ytr[idx].to(device)).backward(); o.step()
    return (clf(fte).argmax(1).cpu() == yte).float().mean().item()
simclr_acc = probe(enc); rand_acc = probe(make_enc())
print(f"linear-probe accuracy on real test digits — SimCLR {simclr_acc:.3f}  vs  random encoder {rand_acc:.3f}")
fig, ax = plt.subplots(figsize=(5, 3.4)); ax.bar(["random", "SimCLR"], [rand_acc, simclr_acc], color=["C7", "C0"])
ax.set_ylim(0, 1); ax.set_ylabel("probe accuracy"); ax.set_title("self-supervision learns useful features"); plt.show()`),
    md(`### Where to go next\n- This is the recipe behind **SimCLR / MoCo / DINO**; CLIP adds text as the other view.\n- Pretrain on real (unlabeled) egocentric frames, then probe/fine-tune for actions (track C).`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 22 — Masked Autoencoder pretraining (foundation-model recipe)
// ---------------------------------------------------------------------------
const mae = {
  file: "B_mae_pretrain.ipynb", title: "Masked Autoencoder (MAE) pretraining", track: "B · 3D & Neural Rendering", tag: "PyTorch",
  what: "mask image patches and reconstruct them on real handwritten digits — the MAE / VideoMAE pretraining objective",
  cells: [
    md(`# Masked Autoencoder — reconstruct what's hidden\n\n**Foundation-model recipe** (the objective behind **MAE** and **VideoMAE**, lesson C3).\n\nHide half of an image's patches and train an encoder–decoder to reconstruct them. The model must learn structure to fill the gaps — a powerful self-supervised signal — and we report the reconstruction error on a **held-out test split**.\n\n> Real data: scikit-learn \`load_digits\` (1,797 real 8×8 images). CPU is fine.`),
    code(`import os, torch, torch.nn as nn, matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 1200)); S, P = 8, 2; NP = (S // P) ** 2; MASK = 0.5; torch.manual_seed(0)`),
    md(`## 1 · Real digit images + patchify (16 patches of 2×2)`),
    code(`d = load_digits()
X = torch.tensor(d.images / 16.0, dtype=torch.float32).unsqueeze(1)   # (1797,1,8,8)
Xtr, Xte = train_test_split(X, test_size=0.3, random_state=0)
Xtr, Xte = Xtr.to(device), Xte.to(device)
print("train", tuple(Xtr.shape), "test", tuple(Xte.shape), "| patches/img", NP, "masked", int(MASK * NP))
def patchify(x): return x.unfold(2, P, P).unfold(3, P, P).reshape(x.shape[0], NP, P * P)
def unpatchify(p):
    g = S // P
    return p.reshape(p.shape[0], g, g, P, P).permute(0, 1, 3, 2, 4).reshape(p.shape[0], 1, S, S)`),
    md(`## 2 · Encoder–decoder over patch tokens`),
    code(`class MAE(nn.Module):
    def __init__(self, dim=64):
        super().__init__(); self.emb = nn.Linear(P * P, dim); self.pos = nn.Parameter(torch.randn(1, NP, dim))
        self.enc = nn.TransformerEncoder(nn.TransformerEncoderLayer(dim, 4, 128, batch_first=True), 2)
        self.dec = nn.Sequential(nn.Linear(dim, dim), nn.ReLU(), nn.Linear(dim, P * P))
    def forward(self, patches, mask):
        tok = self.emb(patches) + self.pos
        tok = tok * (~mask).unsqueeze(-1)                       # zero out masked tokens
        return self.dec(self.enc(tok))
model = MAE().to(device); opt = torch.optim.Adam(model.parameters(), 1e-3)`),
    md(`## 3 · Pretrain — reconstruct the masked patches`),
    code(`hist = []
for step in range(STEPS + 1):
    idx = torch.randint(0, Xtr.shape[0], (128,)); p = patchify(Xtr[idx])
    mask = torch.rand(p.shape[0], NP, device=device) < MASK
    pred = model(p, mask); loss = (((pred - p) ** 2) * mask.unsqueeze(-1)).sum() / mask.sum() / (P * P)
    opt.zero_grad(); loss.backward(); opt.step()
    if step % max(1, STEPS // 10) == 0: hist.append((step, round(loss.item(), 4))); print(f"step {step:4d}  masked recon MSE {loss.item():.4f}")`),
    md(`## 4 · Held-out reconstruction error + a qualitative example`),
    code(`with torch.no_grad():
    pte = patchify(Xte); m = torch.rand(Xte.shape[0], NP, device=device) < MASK
    test_mse = ((((model(pte, m) - pte) ** 2) * m.unsqueeze(-1)).sum() / m.sum() / (P * P)).item()
print(f"held-out masked-reconstruction MSE: {test_mse:.4f}")
x = Xte[:1]; p = patchify(x); mask = torch.rand(1, NP, device=device) < MASK
with torch.no_grad(): pred = model(p, mask)
masked_in = unpatchify(p * (~mask).unsqueeze(-1)); recon = unpatchify(torch.where(mask.unsqueeze(-1), pred, p))
fig, ax = plt.subplots(1, 4, figsize=(11, 3))
for a, im, ttl in zip(ax, [x, masked_in, unpatchify(pred), recon], ["input", "masked", "decoded", "filled-in"]):
    a.imshow(im[0, 0].cpu().clamp(0, 1), cmap="gray"); a.set_title(ttl); a.axis("off")
plt.show()`),
    md(`### Where to go next\n- Extend masking across time → **VideoMAE** (tube masking, lesson C3).\n- After pretraining, keep the encoder and fine-tune it for a downstream task.`),
  ],
};

// ---------------------------------------------------------------------------
// LAB 23 — Knowledge distillation (model compression)
// ---------------------------------------------------------------------------
const distill = {
  file: "LM_distillation.ipynb", title: "Knowledge distillation", track: "LM · Language models", tag: "PyTorch",
  what: "train a small student to match a large teacher's soft predictions on real handwritten digits",
  cells: [
    md(`# Knowledge distillation — small student, big teacher\n\n**Model compression** (applies to every track's foundation models).\n\nA small **student** learns from a larger **teacher**'s *soft* probabilities (richer than hard labels). On **real handwritten digits**, the distilled student — trained on the teacher's soft targets over all (unlabeled) data — nearly matches the teacher and beats an identical student trained on only a few hard labels.\n\n> Real data: scikit-learn \`load_digits\` (1,797 real 8×8 images, 10 classes). CPU is fine.`),
    code(`import os, math, torch, torch.nn as nn, torch.nn.functional as F, matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
device = "cuda" if torch.cuda.is_available() else "cpu"
STEPS = int(os.environ.get("STEPS", 1500)); torch.manual_seed(0)`),
    md(`## 1 · Real handwritten digits (10-class), held-out test split`),
    code(`d = load_digits()
X = torch.tensor(d.data / 16.0, dtype=torch.float32); Y = torch.tensor(d.target, dtype=torch.long)
Xtr, Xte, Ytr, Yte = train_test_split(X, Y, test_size=0.3, stratify=Y, random_state=0)
Xtr, Xte, Ytr, Yte = Xtr.to(device), Xte.to(device), Ytr.to(device), Yte.to(device)
print("train", tuple(Xtr.shape), "test", tuple(Xte.shape), "classes", int(Y.max()) + 1)`),
    md(`## 2 · Train a big teacher on the full labelled training set`),
    code(`teacher = nn.Sequential(nn.Linear(64, 256), nn.ReLU(), nn.Linear(256, 256), nn.ReLU(), nn.Linear(256, 10)).to(device)
o = torch.optim.Adam(teacher.parameters(), 2e-3)
for _ in range(800): o.zero_grad(); F.cross_entropy(teacher(Xtr), Ytr).backward(); o.step()
teacher_acc = (teacher(Xte).argmax(1) == Yte).float().mean().item(); print(f"teacher test acc {teacher_acc:.3f}")`),
    md(`## 3 · A tiny student: a few hard labels vs. distillation over all data\nThe student only sees **100 labels**. Distillation instead trains it on the teacher's *soft* predictions across **all** training data — transferring "dark knowledge" the hard labels don't carry.`),
    code(`def small(): return nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Linear(32, 10)).to(device)
nlab = 100; Xs, Ys = Xtr[:nlab], Ytr[:nlab]
with torch.no_grad(): soft = F.softmax(teacher(Xtr) / 4.0, 1)        # teacher's dark knowledge over ALL data
def train_student(distill):
    s = small(); o = torch.optim.Adam(s.parameters(), 3e-3); h = []
    for step in range(STEPS + 1):
        loss = (16.0 * F.kl_div(F.log_softmax(s(Xtr) / 4.0, 1), soft, reduction="batchmean")
                if distill else F.cross_entropy(s(Xs), Ys))
        o.zero_grad(); loss.backward(); o.step()
        if step % max(1, STEPS // 10) == 0: h.append((step, (s(Xte).argmax(1) == Yte).float().mean().item()))
    return s, h
_, h_plain = train_student(False); _, h_distill = train_student(True)
print(f"student test acc — {nlab} labels {h_plain[-1][1]:.3f}  vs  distilled (teacher over all data) {h_distill[-1][1]:.3f}")`),
    md(`## 4 · Compare`),
    code(`fig, ax = plt.subplots(figsize=(6, 3.6))
ax.plot(*zip(*h_plain), label=f"{nlab} labels"); ax.plot(*zip(*h_distill), label="distilled (all data)")
ax.axhline(teacher_acc, ls="--", c="C7", label="teacher"); ax.set_xlabel("step"); ax.set_ylabel("student test acc"); ax.legend(); ax.grid(alpha=.3)
plt.show()`),
    md(`### Where to go next\n- Distill a large fine-tuned LLM into a small one for cheap deployment; combine with **quantization** (the serving lab).\n- Feature/attention distillation transfers more than just logits.`),
  ],
};

// ---------------------------------------------------------------------------
const labs = [smplify, motion, pose, rot6d, nerf, sdf, gsplat, hashgrid, icp, mae, clip, simclr, videomae, dinov2, anticip, worldmodel, tsdf, semmap, reinforce, bc, agentharness, nanogpt, distill];

// Per-lab artifact saving (checkpoint + metrics), spliced before the last cell.
const SAVE = {
  A_smplify_fit: [`torch.save({"angles": ang.detach().cpu(), "root": root.detach().cpu()}, f"{run}/pose.pt")`, `json.dump({"reproj": hist}, open(f"{run}/metrics.json", "w"), indent=2)`],
  A_motion_diffusion: [`torch.save(model.state_dict(), f"{run}/denoiser.pt")`, `json.dump({"loss": hist}, open(f"{run}/metrics.json", "w"), indent=2)`],
  B_nerf_from_scratch: [`torch.save(model.state_dict(), f"{run}/nerf.pt")`, `json.dump({"psnr": psnrs}, open(f"{run}/metrics.json", "w"), indent=2)`],
  B_deepsdf_shape: [`torch.save(model.state_dict(), f"{run}/sdf.pt")`, `json.dump({"l1": hist}, open(f"{run}/metrics.json", "w"), indent=2)`],
  B_gaussian_splatting_2d: [`torch.save({k: v.detach().cpu() for k, v in {"pos": pos, "logs": logs, "rot": rot, "col": col, "op": op}.items()}, f"{run}/gaussians.pt")`, `json.dump({"psnr": hist}, open(f"{run}/metrics.json", "w"), indent=2)`],
  CD_clip_zeroshot_probe: [`torch.save(clf.state_dict(), f"{run}/probe.pt")`, `json.dump({"zero_shot": zs_acc, "linear_probe": probe_acc}, open(f"{run}/metrics.json", "w"), indent=2)`],
  C_dinov2_features_probe: [`torch.save(clf.state_dict(), f"{run}/probe.pt")`, `json.dump({"linear_probe": float(probe_acc)}, open(f"{run}/metrics.json", "w"), indent=2)`],
  D_world_model: [`torch.save(model.state_dict(), f"{run}/dynamics.pt")`, `json.dump({"dyn_mse": hist, "final_dist": {"planner": float(traj_plan[-1].norm()), "random": float(traj_rand[-1].norm())}}, open(f"{run}/metrics.json", "w"), indent=2)`],
  LM_nanogpt_pretrain: [`torch.save(model.state_dict(), f"{run}/gpt.pt")`, `json.dump({"loss": hist}, open(f"{run}/metrics.json", "w"), indent=2)`, `open(f"{run}/sample.txt", "w").write(decode(model.generate(torch.zeros((1, 1), dtype=torch.long, device=device), 500)[0].tolist()))`],
  A_pose_heatmap: [`torch.save(model.state_dict(), f"{run}/pose.pt")`, `json.dump({"pck": hist}, open(f"{run}/metrics.json", "w"), indent=2)`],
  A_rotation_6d: [`torch.save(m6.state_dict(), f"{run}/rot6d.pt")`, `json.dump({"geo_6d": h6, "geo_euler": hE}, open(f"{run}/metrics.json", "w"), indent=2)`],
  B_hashgrid_instngp: [`torch.save({"tables": tables.detach().cpu(), "mlp": mlp.state_dict()}, f"{run}/hashgrid.pt")`, `json.dump({"psnr": hist}, open(f"{run}/metrics.json", "w"), indent=2)`],
  B_icp_registration: [`torch.save({"R": R.detach().cpu(), "t": tt.detach().cpu()}, f"{run}/transform.pt")`, `json.dump({"rmse": hist}, open(f"{run}/metrics.json", "w"), indent=2)`],
  C_action_anticipation_lstm: [`torch.save(model.state_dict(), f"{run}/lstm.pt")`, `json.dump({"top1": hist}, open(f"{run}/metrics.json", "w"), indent=2)`],
  D_tsdf_fusion: [`torch.save({"verts": torch.tensor(verts.copy()), "faces": torch.tensor(faces.copy())}, f"{run}/mesh.pt")`, `json.dump({"verts": int(verts.shape[0]), "faces": int(faces.shape[0])}, open(f"{run}/metrics.json", "w"), indent=2)`],
  D_semantic_mapping: [`json.dump({"history": hist}, open(f"{run}/metrics.json", "w"), indent=2)`, `np.save(f"{run}/occ.npy", (logodds > 0)); np.save(f"{run}/labels.npy", counts.argmax(-1))`],
  AG_reinforce_gridworld: [`torch.save(policy.state_dict(), f"{run}/policy.pt")`, `json.dump({"return": hist}, open(f"{run}/metrics.json", "w"), indent=2)`],
  AG_behavior_cloning: [`torch.save(policy.state_dict(), f"{run}/policy.pt")`, `json.dump({"imitation_acc": hist, "rollout_success": succ}, open(f"{run}/metrics.json", "w"), indent=2)`],
  AG_agent_harness: [`json.dump({"success_rate": acc, "results": [{"task": r["task"], "pred": str(r["pred"]), "ok": r["ok"]} for r in results]}, open(f"{run}/results.json", "w"), indent=2)`],
  C_simclr_pretrain: [`torch.save(enc.state_dict(), f"{run}/encoder.pt")`, `json.dump({"nt_xent": hist, "probe_simclr": simclr_acc, "probe_random": rand_acc}, open(f"{run}/metrics.json", "w"), indent=2)`],
  B_mae_pretrain: [`torch.save(model.state_dict(), f"{run}/mae.pt")`, `json.dump({"recon_mse": hist, "test_recon_mse": test_mse}, open(f"{run}/metrics.json", "w"), indent=2)`],
  LM_distillation: [`torch.save(teacher.state_dict(), f"{run}/teacher.pt")`, `json.dump({"teacher": teacher_acc, "student_plain": h_plain, "student_distill": h_distill}, open(f"{run}/metrics.json", "w"), indent=2)`],
};
const VIDEOMAE_NOTE = md(`## Save & persist\nThe 🤗 Trainer already writes checkpoints, \`trainer_state.json\` (the full loss/eval history) and logs to its \`output_dir\` ("videomae-ucf101"). Also call \`trainer.save_model("videomae-final")\` (and optionally \`trainer.push_to_hub()\`). Colab is ephemeral, so zip + download the folder or mount Google Drive to keep it.`);
for (const lab of labs) {
  const id = lab.file.replace(/\.ipynb$/, "");
  if (SAVE[id]) lab.cells.splice(lab.cells.length - 1, 0, ...saveCells(id, SAVE[id]));
  else if (id === "C_videomae_finetune") lab.cells.splice(lab.cells.length - 1, 0, VIDEOMAE_NOTE);
}

// Cross-reference each lab back to the other embodied tracks (mirrors the catalog links).
const LINK_NOTES_TRAIN = {
  A_smplify_fit: "Recovered bodies show up in **C · Egocentric** first-person video.",
  A_motion_diffusion: "Same diffusion idea as **LM** generation; supplies motion priors for **AG** agents.",
  A_pose_heatmap: "2D joints from first-person views feed **C · Egocentric** understanding.",
  A_rotation_6d: "Continuous rotations are used for **B · 3D** camera pose and poses in **D**.",
  B_nerf_from_scratch: "A trained NeRF is the **D · Scene / world** scene representation.",
  B_deepsdf_shape: "Implicit surfaces are a **D · Scene / world** map substrate.",
  B_gaussian_splatting_2d: "Lifts to the 3D Gaussian maps used in **D · Scene / world** SLAM.",
  B_hashgrid_instngp: "Speeds up the NeRF / scene models used in **D · Scene / world**.",
  B_icp_registration: "Registration is the front-end of **D · Scene / world** SLAM & fusion.",
  B_mae_pretrain: "The MAE objective underlies **C** VideoMAE and pretraining for **D** perception.",
  CD_clip_zeroshot_probe: "CLIP features power **D** open-vocabulary mapping and link vision to **LM**.",
  C_videomae_finetune: "Video features describe **A** human action and **D** scene activity.",
  C_dinov2_features_probe: "Dense features feed **B** geometry and **D** mapping.",
  C_action_anticipation_lstm: "Anticipation supports **D** planning and **AG** agents.",
  C_simclr_pretrain: "Self-supervision pretrains backbones for **B** and **D** vision tasks.",
  D_world_model: "World models are the core of **AG · Agents & RL**.",
  D_tsdf_fusion: "Fuses **B · 3D** geometry into a scene map.",
  D_semantic_mapping: "Combines **C** perception with **LM** open-vocabulary labels.",
  LM_distillation: "Compresses the foundation models from **A / B / C / D** for deployment.",
  AG_reinforce_gridworld: "Policy gradients scale up to **D · Scene / world** embodied control.",
  AG_behavior_cloning: "Imitation learns **A** human-like skills and **D** embodied policies.",
  AG_agent_harness: "The harness scores **LM** agents on **C** egocentric-assistant and **D** embodied tasks.",
};
for (const lab of labs) {
  const id = lab.file.replace(/\.ipynb$/, "");
  if (LINK_NOTES_TRAIN[id]) lab.cells.splice(lab.cells.length - 1, 0, md(`## How this links to tracks A–D\n${LINK_NOTES_TRAIN[id]}`));
}

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
