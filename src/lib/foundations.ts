import type { Bilingual } from "./types";

// Foundational terms used throughout the curriculum but assumed-known (mesh, MLP,
// voxel, ...). Each has a beginner-friendly bilingual definition. `aka` lists
// extra surface forms (plurals, abbreviations) so inline tooltips match them too.
// Shown in the Glossary "Foundations" section and as hover tooltips in lessons.
export interface Foundation {
  term: string;
  def: Bilingual;
  aka?: string[];
}

export const foundations: Foundation[] = [
  {
    term: "mesh",
    aka: ["meshes", "template mesh"],
    def: {
      en: "A 3D surface stored as vertices joined into triangles — how shapes like a body or object are represented.",
      zh: "以顶点连成三角形存储的 3D 表面——人体、物体等形状的表示方式。",
    },
  },
  {
    term: "vertex",
    aka: ["vertices"],
    def: {
      en: "A single 3D point; a mesh is a set of vertices connected into faces.",
      zh: "单个 3D 点；网格就是连成面的一组顶点。",
    },
  },
  {
    term: "voxel",
    aka: ["voxels"],
    def: {
      en: "A 3D pixel — a small cube cell in a grid that tiles space (used by TSDF and occupancy maps).",
      zh: "三维像素——平铺空间的网格中的小立方体单元（TSDF 与占据地图所用）。",
    },
  },
  {
    term: "tensor",
    aka: ["tensors"],
    def: {
      en: "A multi-dimensional array of numbers — the basic data object in PyTorch (a vector is 1-D, a matrix 2-D).",
      zh: "多维数字数组——PyTorch 的基本数据对象（向量是一维、矩阵是二维）。",
    },
  },
  {
    term: "MLP",
    aka: ["MLPs", "multilayer perceptron"],
    def: {
      en: "Multilayer perceptron: the simplest neural network — stacked linear layers with nonlinearities between them.",
      zh: "多层感知机：最简单的神经网络——线性层叠加，层间加非线性。",
    },
  },
  {
    term: "neural network",
    aka: ["neural networks", "network"],
    def: {
      en: "A function with many learnable weights, trained by gradient descent to map inputs to outputs.",
      zh: "带大量可学习权重的函数，用梯度下降训练以把输入映射到输出。",
    },
  },
  {
    term: "backbone",
    aka: ["backbones"],
    def: {
      en: "The main feature-extracting network (e.g. a CNN or transformer), reused across tasks with small heads on top.",
      zh: "主要的特征提取网络（如 CNN 或 transformer），可跨任务复用，上面接小头部。",
    },
  },
  {
    term: "gradient",
    aka: ["gradients", "gradient descent"],
    def: {
      en: "The direction and rate a loss changes with respect to each parameter; training steps downhill along it.",
      zh: "损失相对每个参数变化的方向与速率；训练沿其下坡前进。",
    },
  },
  {
    term: "backpropagation",
    aka: ["backprop"],
    def: {
      en: "The algorithm that computes the loss gradient for every weight via the chain rule, enabling training.",
      zh: "用链式法则为每个权重计算损失梯度的算法，使训练成为可能。",
    },
  },
  {
    term: "differentiable",
    def: {
      en: "Smooth enough to have gradients everywhere, so it can be trained end-to-end with backpropagation.",
      zh: "处处可求梯度（足够光滑），因此可用反向传播端到端训练。",
    },
  },
  {
    term: "loss",
    aka: ["loss function", "photometric loss"],
    def: {
      en: "A single number measuring how wrong a prediction is; training minimizes it.",
      zh: "衡量预测有多错的一个数；训练就是最小化它。",
    },
  },
  {
    term: "regularization",
    aka: ["regularizer", "regularize", "regularizes"],
    def: {
      en: "An extra term or constraint that keeps a solution simple or plausible, preventing degenerate/overfit answers.",
      zh: "额外的项或约束，使解保持简单或合理，避免退化/过拟合。",
    },
  },
  {
    term: "prior",
    aka: ["priors"],
    def: {
      en: "Knowledge assumed before seeing the data; it constrains an under-determined problem to plausible solutions.",
      zh: "在看到数据前假定的知识；把欠定问题约束到合理的解。",
    },
  },
  {
    term: "inductive bias",
    def: {
      en: "Assumptions built into a model or architecture that shape what it can learn (e.g. convolutions assume locality).",
      zh: "内建于模型或架构中的假设，塑造它能学到什么（如卷积假设局部性）。",
    },
  },
  {
    term: "manifold",
    def: {
      en: "A lower-dimensional curved surface, embedded in a high-dimensional space, on which the valid data lives.",
      zh: "嵌入在高维空间中的低维弯曲曲面，有效数据正落在其上。",
    },
  },
  {
    term: "ray",
    aka: ["rays"],
    def: {
      en: "A half-line from the camera through a pixel into the scene; rendering integrates color/density along it.",
      zh: "从相机经像素射入场景的半直线；渲染沿它积分颜色/密度。",
    },
  },
  {
    term: "pixel",
    aka: ["pixels"],
    def: {
      en: "One picture element — a single colored dot in an image.",
      zh: "图像中的一个像素——一个有颜色的小点。",
    },
  },
  {
    term: "depth map",
    aka: ["depth maps"],
    def: {
      en: "An image where each pixel stores distance to the camera instead of color (e.g. from an RGB-D sensor).",
      zh: "每个像素存储到相机的距离而非颜色的图像（如来自 RGB-D 传感器）。",
    },
  },
  {
    term: "point cloud",
    aka: ["point clouds"],
    def: {
      en: "A set of 3D points (often from a depth sensor) with no connectivity between them, unlike a mesh.",
      zh: "一组 3D 点（常来自深度传感器），点间无连接，区别于网格。",
    },
  },
  {
    term: "blendshape",
    aka: ["blendshapes", "blend shapes"],
    def: {
      en: "A stored shape offset added to a template mesh to deform it (SMPL uses shape and pose blendshapes).",
      zh: "加到模板网格上以使其形变的、存储好的形状偏移（SMPL 用形状与姿态混合形变）。",
    },
  },
  {
    term: "latent",
    aka: ["latent space", "latents", "latent code"],
    def: {
      en: "A learned compact code that captures the essential factors of the data (its 'latent space').",
      zh: "学到的紧凑编码，捕捉数据的本质因素（其「潜在空间」）。",
    },
  },
  {
    term: "embedding",
    aka: ["embeddings"],
    def: {
      en: "A vector that represents an item (word, image, object) so that similar items end up close together.",
      zh: "表示某物（词、图像、物体）的向量，使相似者彼此靠近。",
    },
  },
  {
    term: "transformer",
    aka: ["transformers", "ViT"],
    def: {
      en: "A neural architecture built on attention; now dominant for language, images (ViT), and video.",
      zh: "基于注意力的神经网络架构；如今主导语言、图像（ViT）与视频。",
    },
  },
  {
    term: "attention",
    def: {
      en: "A mechanism that lets a model weigh which inputs matter most when producing each output.",
      zh: "一种机制，让模型在产生每个输出时权衡哪些输入最重要。",
    },
  },
  {
    term: "convolution",
    aka: ["convolutions", "convolutional", "CNN", "temporal convolution"],
    def: {
      en: "A sliding filter that detects the same local pattern everywhere in an image/sequence; the core of CNNs.",
      zh: "在图像/序列各处检测同一局部模式的滑动滤波器；CNN 的核心。",
    },
  },
  {
    term: "RNN",
    aka: ["recurrent"],
    def: {
      en: "Recurrent neural network: processes a sequence step by step, carrying a hidden state forward.",
      zh: "循环神经网络：逐步处理序列，向前携带隐藏状态。",
    },
  },
  {
    term: "softmax",
    def: {
      en: "Turns a vector of raw scores into a probability distribution that is positive and sums to 1.",
      zh: "把一组原始分数变成正的、且和为 1 的概率分布。",
    },
  },
  {
    term: "argmax",
    aka: ["soft-argmax"],
    def: {
      en: "The index of the largest value in a vector (e.g. the most likely class or keypoint location).",
      zh: "向量中最大值所在的索引（如最可能的类别或关键点位置）。",
    },
  },
  {
    term: "VAE",
    def: {
      en: "Variational autoencoder: learns a smooth, samplable latent space by encoding then reconstructing data.",
      zh: "变分自编码器：通过编码再重建数据，学到平滑、可采样的潜在空间。",
    },
  },
  {
    term: "diffusion",
    aka: ["denoising"],
    def: {
      en: "A generative method that learns to reverse a noising process, turning random noise into a sample step by step.",
      zh: "一种生成方法：学习逆转加噪过程，逐步把随机噪声变成样本。",
    },
  },
  {
    term: "self-supervised",
    aka: ["self-supervision", "self-supervised learning"],
    def: {
      en: "Learning from unlabeled data by inventing a pretext task (e.g. reconstruct masked-out parts).",
      zh: "通过自造的前置任务（如重建被掩盖的部分）从无标注数据中学习。",
    },
  },
  {
    term: "ablation",
    aka: ["ablate"],
    def: {
      en: "Removing one component of a system to measure how much it contributes — how you isolate the key idea.",
      zh: "移除系统的某个组件以衡量其贡献——借此分离出关键想法。",
    },
  },
  {
    term: "PCA",
    def: {
      en: "Principal component analysis: finds the few directions along which the data varies the most.",
      zh: "主成分分析：找出数据变化最大的少数几个方向。",
    },
  },
  {
    term: "SVD",
    def: {
      en: "Singular value decomposition: a matrix factorization used to solve least-squares and find null spaces.",
      zh: "奇异值分解：一种矩阵分解，用于求最小二乘解与零空间。",
    },
  },
  {
    term: "least squares",
    def: {
      en: "Finding the solution that minimizes the sum of squared errors — the workhorse fit for noisy measurements.",
      zh: "求使误差平方和最小的解——对含噪测量的主力拟合方法。",
    },
  },
  {
    term: "homogeneous coordinates",
    def: {
      en: "Appending a 1 to a point so that translation and projection become a single matrix multiplication.",
      zh: "给点末尾加一个 1，使平移与投影变成一次矩阵乘法。",
    },
  },
  {
    term: "quaternion",
    aka: ["quaternions"],
    def: {
      en: "A 4-number encoding of a 3D rotation — no gimbal lock, but it has a double-cover sign ambiguity.",
      zh: "用 4 个数编码 3D 旋转——无万向锁，但有双重覆盖的符号歧义。",
    },
  },
  {
    term: "Euler angles",
    aka: ["Euler angle"],
    def: {
      en: "Representing a rotation as three sequential angles (roll/pitch/yaw); simple but suffers gimbal lock.",
      zh: "用三个连续角度（滚转/俯仰/偏航）表示旋转；简单但有万向锁。",
    },
  },
  {
    term: "rasterization",
    aka: ["rasterize", "rasterizer", "rasterizes"],
    def: {
      en: "Drawing primitives (triangles, Gaussians) directly onto the pixel grid — fast and GPU-friendly.",
      zh: "把基元（三角形、高斯）直接画到像素网格上——快速且对 GPU 友好。",
    },
  },
  {
    term: "alpha compositing",
    aka: ["alpha blending", "alpha-blend", "alpha-blending"],
    def: {
      en: "Blending colors front-to-back, each weighted by its opacity (alpha), to accumulate a final pixel.",
      zh: "按各自的不透明度（alpha）从前到后混合颜色，累积出最终像素。",
    },
  },
  {
    term: "keyframe",
    aka: ["keyframes"],
    def: {
      en: "A selected reference frame that a SLAM/SfM system keeps, maps, and optimizes against (instead of every frame).",
      zh: "SLAM/SfM 系统保留、据以建图与优化的选定参考帧（而非每一帧）。",
    },
  },
  {
    term: "odometry",
    def: {
      en: "Estimating motion incrementally frame-to-frame; accurate locally but it drifts over time.",
      zh: "逐帧增量地估计运动；局部准确，但随时间漂移。",
    },
  },
  {
    term: "occlusion",
    aka: ["occluded", "occlusions"],
    def: {
      en: "When one object (or part) hides another from the camera's view — a major source of error.",
      zh: "一个物体（或部分）在相机视角中遮挡另一个——误差的主要来源。",
    },
  },
  {
    term: "saliency",
    aka: ["salient"],
    def: {
      en: "A map of how visually important each region is — i.e. what is likely to draw attention.",
      zh: "标示每个区域视觉重要性的图——即什么可能吸引注意。",
    },
  },
  {
    term: "foveated",
    aka: ["fovea", "foveation"],
    def: {
      en: "Concentrated at the gaze center (the eye's fovea), like the sharp central region of human vision.",
      zh: "集中在注视中心（眼睛的中央凹），如人眼锐利的中央区域。",
    },
  },
];

// Flat map from every surface form (term + aka) to its bilingual definition,
// used by the inline-tooltip rehype plugin.
export const foundationDefs: Record<string, Bilingual> = (() => {
  const m: Record<string, Bilingual> = {};
  for (const f of foundations) {
    m[f.term] = f.def;
    for (const a of f.aka ?? []) m[a] = f.def;
  }
  return m;
})();
