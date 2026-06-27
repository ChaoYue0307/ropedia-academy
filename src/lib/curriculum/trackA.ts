import type { Track } from "../types";

export const trackA: Track = {
  id: "A",
  title: { en: "Human Modeling & Motion Understanding", zh: "人体建模与运动理解" },
  subtitle: { en: "From pixels to a posed, moving body", zh: "从像素到有姿态、会运动的身体" },
  blurb: {
    en: "Parametric body models, pose estimation, mesh recovery, and motion priors — how to recover and generate the 3D human that egocentric and scene models must reason about.",
    zh: "参数化人体模型、姿态估计、网格恢复与运动先验——如何恢复并生成第一人称与场景模型必须推理的三维人体。",
  },
  focus: {
    en: "Human / hand / face modeling, motion and deformation priors, human–object interaction, and affordance modeling.",
    zh: "人体 / 手 / 面部建模、运动与形变先验、人–物交互，以及可供性建模。",
  },
  background: {
    en: "Experience in human pose / shape estimation, SMPL-type models, motion capture, or motion generation.",
    zh: "人体姿态 / 形状估计、SMPL 类模型、动作捕捉或运动生成方面的经验。",
  },
  accent: "#e0598b",
  lessons: [
    {
      id: "A1",
      trackId: "A",
      index: 1,
      title: { en: "Parametric body models (SMPL)", zh: "参数化人体模型（SMPL）" },
      summary: {
        en: "A low-dimensional knob set that generates any human body mesh — shape plus pose.",
        zh: "一组低维旋钮，生成任意人体网格——形状加姿态。",
      },
      body: {
        en: "**SMPL** represents the human body as a function $M(\\beta, \\theta)$ that outputs a mesh (~6890 vertices) from two small parameter vectors: **shape** $\\beta$ (~10 PCA coefficients over body proportions) and **pose** $\\theta$ (~24 joint rotations). It works by deforming a template mesh: shape blendshapes adjust the neutral body, then **linear blend skinning** rotates vertices with the skeleton, and pose-dependent corrective blendshapes fix skinning artifacts.\n\nWhy this matters: it turns the impossible problem of \"predict 20k mesh coordinates\" into \"predict ~80 numbers\", giving every downstream task a compact, differentiable, anatomically-valid output space. SMPL-X extends it with hands (MANO) and face (FLAME). This parametric prior is the backbone of mesh recovery (Lesson 4) and human–scene interaction (Lesson 8).",
        zh: "**SMPL** 把人体表示为一个函数 $M(\\beta, \\theta)$，从两个小参数向量输出网格（约 6890 个顶点）：**形状** $\\beta$（约 10 个关于身体比例的 PCA 系数）和**姿态** $\\theta$（约 24 个关节旋转）。它通过形变模板网格工作：形状混合形变调整中性身体，然后**线性混合蒙皮（LBS）**随骨架旋转顶点，姿态相关的校正混合形变修正蒙皮伪影。\n\n为何重要：它把「预测两万个网格坐标」这一不可能问题，变成「预测约 80 个数」，给每个下游任务一个紧凑、可微、解剖学上有效的输出空间。SMPL-X 用手（MANO）和脸（FLAME）扩展了它。这个参数先验是网格恢复（第 4 课）与人–场景交互（第 8 课）的支柱。",
      },
      keyTerms: [
        { term: "Shape β / pose θ", def: { en: "Disentangled identity (proportions) vs articulation (joint rotations).", zh: "解耦的身份（比例）与关节运动（关节旋转）。" } },
        { term: "Linear blend skinning", def: { en: "Deforming a mesh by blending bone transforms per vertex.", zh: "通过逐顶点混合骨骼变换来形变网格。" } },
      ],
      checks: [
        {
          id: "A1-q1",
          prompt: { en: "Why predict SMPL parameters instead of raw mesh vertices directly?", zh: "为什么预测 SMPL 参数，而不是直接预测原始网格顶点？" },
          answer: {
            en: "Raw vertices are ~20k correlated numbers with no built-in anatomy — predictions can be non-human. SMPL's ~80 parameters are a compact, differentiable space where every point is a valid body, dramatically shrinking the output dimensionality and acting as a strong prior that regularizes the estimate.",
            zh: "原始顶点是约两万个相关数字，且没有内建解剖结构——预测可能不像人。SMPL 的约 80 个参数是一个紧凑、可微的空间，其中每一点都是有效身体，大幅缩小输出维度，并作为强先验对估计正则化。",
          },
        },
        {
          id: "A1-q2",
          prompt: { en: "What problem do pose-dependent corrective blendshapes solve?", zh: "姿态相关的校正混合形变解决了什么问题？" },
          answer: {
            en: "Plain linear blend skinning produces artifacts at bent joints (the 'candy-wrapper' collapse at elbows/knees). Corrective blendshapes, conditioned on pose, add learned deformations that restore realistic volume and surface shape where skinning alone fails.",
            zh: "单纯的线性混合蒙皮在弯曲关节处产生伪影（肘/膝的「糖纸」塌陷）。以姿态为条件的校正混合形变加入学到的形变，在蒙皮失效处恢复真实的体积与表面形状。",
          },
        },
      ],
      links: ["A4", "A5", "C6"],
      papers: [{ title: "SMPL: A Skinned Multi-Person Linear Model", year: 2015 }],
    },
    {
      id: "A2",
      trackId: "A",
      index: 2,
      title: { en: "2D & 3D pose estimation", zh: "二维与三维姿态估计" },
      summary: {
        en: "Find the skeleton: heatmap keypoints in 2D, then lift or regress to 3D joints.",
        zh: "找到骨架：二维用热图关键点，再抬升或回归到三维关节。",
      },
      body: {
        en: "**Pose estimation** locates body joints. In 2D, the dominant approach predicts a **heatmap** per keypoint — a spatial probability map whose argmax is the joint — which is easier to learn than regressing coordinates directly and naturally handles uncertainty. Top-down methods detect a person then estimate joints; bottom-up methods find all joints then group them.\n\nGoing to **3D** is ill-posed from a single image (depth ambiguity). Two strategies: **lifting** (predict 3D joints from 2D keypoints, leaning on learned body priors) and **direct 3D regression** from pixels. Both benefit from temporal context in video, which resolves much of the depth ambiguity through motion. Joint locations are a lightweight representation; the next lessons enrich them into full meshes and motion sequences.",
        zh: "**姿态估计**定位身体关节。在 2D 中，主流方法为每个关键点预测一张**热图**——一张空间概率图，其 argmax 即关节——这比直接回归坐标更易学习，并天然处理不确定性。自顶向下方法先检测人再估计关节；自底向上方法先找出所有关节再分组。\n\n走向 **3D** 从单张图像看是病态的（深度歧义）。两种策略：**抬升（lifting）**（从 2D 关键点预测 3D 关节，依赖学到的身体先验）与从像素**直接 3D 回归**。两者都受益于视频中的时间上下文，运动可消解大部分深度歧义。关节位置是一种轻量表示；后续课程把它们丰富为完整网格与运动序列。",
      },
      keyTerms: [
        { term: "Heatmap regression", def: { en: "Predicting a per-keypoint spatial probability map instead of raw coordinates.", zh: "为每个关键点预测空间概率图，而非原始坐标。" } },
        { term: "Lifting", def: { en: "Inferring 3D joints from detected 2D keypoints using body priors.", zh: "借助身体先验，从检测到的 2D 关键点推断 3D 关节。" } },
      ],
      checks: [
        {
          id: "A2-q1",
          prompt: { en: "Why are heatmaps usually preferred over directly regressing (x, y) coordinates?", zh: "为什么热图通常优于直接回归 (x, y) 坐标？" },
          answer: {
            en: "Heatmaps preserve spatial structure and are fully convolutional, so the loss is dense and well-localized; they also represent uncertainty and multi-modality (two plausible elbow locations) that a single coordinate cannot. Direct coordinate regression collapses this to one point and trains less stably.",
            zh: "热图保留空间结构且全卷积，损失稠密且定位良好；它们还能表示单个坐标无法表达的不确定性与多模态（两个可能的肘部位置）。直接坐标回归把这压成一个点，训练也更不稳定。",
          },
        },
        {
          id: "A2-q2",
          prompt: { en: "Single-image 3D pose is ambiguous. How does video help?", zh: "单张图像的 3D 姿态有歧义。视频如何帮助？" },
          answer: {
            en: "Motion over time constrains depth: parallax, the physical consistency of limb lengths across frames, and dynamics rule out 3D interpretations that flicker or violate bone-length constancy. Temporal models exploit this to produce smoother, less ambiguous 3D trajectories than per-frame estimates.",
            zh: "随时间的运动约束了深度：视差、跨帧肢体长度的物理一致性、以及动力学，排除了那些闪烁或违反骨长恒定的 3D 解释。时序模型利用这点，产出比逐帧估计更平滑、更少歧义的 3D 轨迹。",
          },
        },
      ],
      links: ["A1", "A4", "A6"],
      papers: [{ title: "Stacked Hourglass Networks for Human Pose Estimation", year: 2016 }],
    },
    {
      id: "A3",
      trackId: "A",
      index: 3,
      title: { en: "Temporal motion backbones", zh: "时序运动骨干" },
      summary: {
        en: "Encode how a body moves over time — the motion analogue of an image backbone.",
        zh: "编码身体如何随时间运动——图像骨干在运动上的对应物。",
      },
      body: {
        en: "Static pose is a snapshot; **motion** is the signal. A temporal backbone encodes a sequence of poses (or features) into a representation of *movement*. Architectures mirror video understanding (Track C, Lesson 3): temporal convolutions, RNNs, and increasingly transformers over time.\n\nThe representation choice matters as much as the architecture. Joints can be encoded as positions, velocities, or as a **graph** (skeleton edges), which spatio-temporal graph networks exploit. Rotation-based encodings respect that the body is articulated. As in video, the trend is from hand-built temporal filters toward self-supervised pretraining on large unlabeled motion corpora. A good motion representation is the shared substrate for recognition, prediction, and generation — the next lesson and Lesson 7.",
        zh: "静态姿态是快照；**运动**才是信号。时序骨干把一串姿态（或特征）编码为对*运动*的表示。架构与视频理解（Track C 第 3 课）呼应：时间卷积、RNN，以及越来越多的时间维 transformer。\n\n表示的选择与架构同样重要。关节可编码为位置、速度，或编码为一张**图**（骨架边），时空图网络可加以利用。基于旋转的编码尊重身体是关节连接的事实。与视频一样，趋势是从手工时间滤波器走向在大规模无标注运动语料上的自监督预训练。好的运动表示是识别、预测与生成的共享基底——即下一课与第 7 课。",
      },
      keyTerms: [
        { term: "Spatio-temporal graph", def: { en: "Modeling the skeleton as a graph evolving over time (ST-GCN family).", zh: "把骨架建模为随时间演化的图（ST-GCN 系列）。" } },
        { term: "Motion representation", def: { en: "How movement is encoded: positions, velocities, or joint rotations.", zh: "运动如何被编码：位置、速度或关节旋转。" } },
      ],
      checks: [
        {
          id: "A3-q1",
          prompt: { en: "Why might a graph (skeleton) representation beat a flat vector of joint coordinates?", zh: "为什么图（骨架）表示可能优于关节坐标的扁平向量？" },
          answer: {
            en: "The skeleton has known connectivity; a graph network shares weights along anatomically meaningful edges and propagates information between connected joints, encoding the body's kinematic structure as an inductive bias. A flat vector discards this topology and must relearn which joints are linked.",
            zh: "骨架有已知的连通性；图网络沿解剖学上有意义的边共享权重，并在相连关节间传播信息，把身体的运动学结构编码为归纳偏置。扁平向量丢弃了这一拓扑，必须重新学习哪些关节相连。",
          },
        },
        {
          id: "A3-q2",
          prompt: { en: "Give one reason velocity features can help over raw positions.", zh: "举出一个速度特征相比原始位置更有帮助的理由。" },
          answer: {
            en: "Velocities are translation-invariant and directly expose dynamics — the same action performed at a different location yields identical velocity patterns, so the model generalizes across positions and focuses on movement rather than absolute placement.",
            zh: "速度对平移不变，并直接暴露动力学——在不同位置执行的同一动作产生相同的速度模式，因此模型跨位置泛化，关注运动本身而非绝对位置。",
          },
        },
      ],
      links: ["A7", "C3", "A2"],
      papers: [{ title: "Spatial Temporal Graph Convolutional Networks (ST-GCN)", year: 2018 }],
    },
    {
      id: "A4",
      trackId: "A",
      index: 4,
      title: { en: "3D human mesh recovery", zh: "三维人体网格恢复" },
      summary: {
        en: "Regress SMPL parameters from an image — a full posed body, not just joints.",
        zh: "从图像回归 SMPL 参数——一具完整有姿态的身体，而非只有关节。",
      },
      body: {
        en: "**Human Mesh Recovery (HMR)** predicts SMPL's $(\\beta, \\theta)$ and a camera from a single image, yielding a full 3D body mesh. Because paired image-to-3D ground truth is scarce, the breakthrough was a **reprojection loss**: render the predicted 3D joints back to 2D and match abundant 2D keypoint annotations, supervising 3D indirectly. An adversarial prior keeps poses plausible.\n\nThe design pattern — *regress parameters of a model, supervise via differentiable reprojection* — recurs throughout 3D vision (it is exactly how Track B fits cameras and how SLAM closes the loop). Modern HMR adds temporal smoothing, transformer encoders, and contact/penetration constraints with the scene (Lesson 8). The output mesh is what egocentric HOI (Track C) and human–scene reasoning consume.",
        zh: "**人体网格恢复（HMR）**从单张图像预测 SMPL 的 $(\\beta, \\theta)$ 和相机，得到完整的 3D 身体网格。由于配对的图像到 3D 真值稀缺，突破在于**重投影损失**：把预测的 3D 关节渲染回 2D，去匹配大量的 2D 关键点标注，从而间接监督 3D。一个对抗先验保持姿态合理。\n\n这一设计范式——*回归一个模型的参数，经可微重投影监督*——在 3D 视觉中反复出现（Track B 拟合相机、SLAM 闭环正是如此）。现代 HMR 加入时间平滑、transformer 编码器，以及与场景的接触/穿插约束（第 8 课）。输出网格正是第一人称 HOI（Track C）与人–场景推理所消费的。",
      },
      keyTerms: [
        { term: "Reprojection loss", def: { en: "Supervising 3D by rendering it to 2D and matching 2D labels.", zh: "把 3D 渲染到 2D 并匹配 2D 标注，以此监督 3D。" } },
        { term: "Adversarial pose prior", def: { en: "A discriminator that pushes predicted poses to look like real human poses.", zh: "一个判别器，推动预测姿态看起来像真实人体姿态。" } },
      ],
      checks: [
        {
          id: "A4-q1",
          prompt: { en: "How does a reprojection loss let you train 3D mesh recovery without 3D labels?", zh: "重投影损失如何让你在没有 3D 标注的情况下训练 3D 网格恢复？" },
          answer: {
            en: "You predict the 3D mesh and camera, project the 3D joints into the image, and penalize the distance to annotated 2D keypoints (which are plentiful). The network must produce a 3D body that, when viewed through the camera, explains the 2D evidence — so abundant 2D supervision constrains the 3D output.",
            zh: "你预测 3D 网格和相机，把 3D 关节投影到图像，并惩罚其与标注 2D 关键点（数量充足）的距离。网络必须产出这样一具 3D 身体：经相机观察时能解释 2D 证据——于是充足的 2D 监督约束了 3D 输出。",
          },
        },
        {
          id: "A4-q2",
          prompt: { en: "Reprojection alone is under-constrained. Why add a pose prior?", zh: "仅靠重投影是欠约束的。为什么要加姿态先验？" },
          answer: {
            en: "Many different 3D poses project to the same 2D keypoints (depth/rotation ambiguity), including anatomically impossible ones. A prior (adversarial or statistical) restricts solutions to the manifold of realistic human poses, picking the plausible 3D explanation among the infinitely many that fit the 2D.",
            zh: "许多不同的 3D 姿态投影到相同的 2D 关键点（深度/旋转歧义），包括解剖学上不可能的。先验（对抗或统计）把解限制在真实人体姿态的流形上，在无穷多个符合 2D 的解中挑出合理的 3D 解释。",
          },
        },
      ],
      links: ["A1", "B3", "A8"],
      papers: [{ title: "End-to-end Recovery of Human Shape and Pose (HMR)", year: 2018 }],
    },
    {
      id: "A5",
      trackId: "A",
      index: 5,
      title: { en: "Hand & face models (MANO, FLAME)", zh: "手部与面部模型（MANO、FLAME）" },
      summary: {
        en: "The same parametric recipe, applied to the most expressive parts of the body.",
        zh: "同一套参数化配方，用于身体最具表现力的部位。",
      },
      body: {
        en: "Hands and faces carry disproportionate meaning (grasp, expression) but are small and highly articulated, so they get dedicated parametric models built like SMPL. **MANO** models the hand with shape + pose (joint rotations) over a template mesh; **FLAME** models the face/head with identity, expression, and jaw/neck pose. Together with SMPL they compose into **SMPL-X**, a single expressive full-body model.\n\nFor egocentric vision this is essential: Track C's hand–object interaction needs not just a hand box but a 3D hand mesh to reason about contact and grasp geometry. The lesson is conceptual reuse — once you understand SMPL, MANO and FLAME are the same idea specialized, and fitting them uses the same reprojection machinery as Lesson 4.",
        zh: "手和脸承载了不成比例的意义（抓取、表情），却小而高度关节化，因此有按 SMPL 方式构建的专用参数模型。**MANO** 以模板网格上的形状 + 姿态（关节旋转）建模手；**FLAME** 以身份、表情、下颌/颈部姿态建模面部/头部。它们与 SMPL 一起组合成 **SMPL-X**，一个统一的、富表现力的全身模型。\n\n对第一人称视觉这至关重要：Track C 的手–物交互不仅需要手框，更需要 3D 手部网格来推理接触与抓取几何。本课的要义是概念复用——一旦理解 SMPL，MANO 和 FLAME 就是同一想法的特化，拟合它们用的是与第 4 课相同的重投影机制。",
      },
      keyTerms: [
        { term: "MANO / FLAME", def: { en: "Parametric hand and face models, the SMPL recipe specialized.", zh: "参数化手部与面部模型，SMPL 配方的特化。" } },
        { term: "SMPL-X", def: { en: "Unified body + hands + face expressive model.", zh: "统一的身体 + 手 + 脸的表现力模型。" } },
      ],
      checks: [
        {
          id: "A5-q1",
          prompt: { en: "Why give hands and faces separate models instead of denser SMPL vertices?", zh: "为什么给手和脸单独建模，而不是用更密的 SMPL 顶点？" },
          answer: {
            en: "Hands and faces have far higher articulation and finer geometry per unit area than the torso. Dedicated models allocate parameters (pose DOF, expression bases) where the relevant variation actually lives, capturing grasp and expression that a uniformly-dense body mesh would under-parameterize.",
            zh: "手和脸单位面积的关节自由度与几何精细度远高于躯干。专用模型把参数（姿态自由度、表情基）分配到相关变化真正所在之处，捕捉到均匀加密的身体网格会欠参数化的抓取与表情。",
          },
        },
        {
          id: "A5-q2",
          prompt: { en: "Why does egocentric HOI need a 3D hand mesh, not just a 2D hand box?", zh: "为什么第一人称 HOI 需要 3D 手部网格，而不只是 2D 手框？" },
          answer: {
            en: "Contact and grasp are 3D geometric relations — which finger surfaces touch which part of the object, and whether the configuration is physically plausible. A 2D box can't express surface contact or penetration; a 3D mesh lets you compute proximity, contact points, and grasp type.",
            zh: "接触与抓取是 3D 几何关系——哪些手指表面触碰物体的哪个部位，以及该构型是否物理合理。2D 框无法表达表面接触或穿插；3D 网格让你能计算邻近度、接触点和抓取类型。",
          },
        },
      ],
      links: ["A1", "C5", "C6"],
      papers: [{ title: "Embodied Hands: Modeling and Capturing Hands and Bodies Together (MANO)", year: 2017 }],
    },
    {
      id: "A6",
      trackId: "A",
      index: 6,
      title: { en: "Rotations & motion representations", zh: "旋转与运动表示" },
      summary: {
        en: "How you encode a rotation silently decides whether your network can learn it.",
        zh: "你如何编码旋转，悄悄决定了你的网络能否学会它。",
      },
      body: {
        en: "Articulated motion is a sequence of **rotations**, and their parameterization is a subtle, high-leverage choice. Euler angles suffer gimbal lock and discontinuities; quaternions have a double-cover sign ambiguity. A key result: any representation of 3D rotation with $\\le 4$ dimensions is **discontinuous**, which networks learn poorly. The fix is a **6D rotation** representation (the first two columns of the rotation matrix, re-orthogonalized), which is continuous and trains far better.\n\nThis is a recurring lesson in geometric deep learning: match the representation to the manifold. The same care applies to translations, velocities, and the choice of coordinate frame (local vs global) — and reappears in Track B's camera poses and Track D's reference frames for spatial reasoning.",
        zh: "关节运动是一串**旋转**，其参数化是一个微妙却高杠杆的选择。欧拉角有万向锁与不连续；四元数有双重覆盖的符号歧义。一个关键结论：任何维度 $\\le 4$ 的 3D 旋转表示都是**不连续的**，网络很难学好。解决办法是 **6D 旋转**表示（旋转矩阵的前两列，再正交化），它连续且训练效果好得多。\n\n这是几何深度学习中反复出现的一课：让表示匹配流形。同样的讲究适用于平移、速度，以及坐标系的选择（局部 vs 全局）——并在 Track B 的相机位姿、Track D 用于空间推理的参照系中再次出现。",
      },
      keyTerms: [
        { term: "6D rotation", def: { en: "A continuous rotation parameterization that networks learn reliably.", zh: "一种连续的旋转参数化，网络可可靠学习。" } },
        { term: "Gimbal lock", def: { en: "Loss of a rotational DOF in Euler-angle representations.", zh: "欧拉角表示中旋转自由度的丢失。" } },
      ],
      checks: [
        {
          id: "A6-q1",
          prompt: { en: "Why do networks struggle to regress rotations as quaternions or Euler angles?", zh: "为什么网络难以以四元数或欧拉角回归旋转？" },
          answer: {
            en: "These low-dimensional encodings are discontinuous on the rotation manifold: small changes in rotation can require large jumps in the parameters (or sign flips). A network outputting a smooth function can't represent that discontinuity well, causing large errors near the seams. A continuous 6D encoding removes the discontinuity.",
            zh: "这些低维编码在旋转流形上不连续：旋转的微小变化可能要求参数的大跳变（或符号翻转）。输出平滑函数的网络无法很好表示该不连续，在接缝附近造成大误差。连续的 6D 编码消除了不连续。",
          },
        },
        {
          id: "A6-q2",
          prompt: { en: "Why might a local (parent-relative) joint frame be preferable to a global one?", zh: "为什么局部（相对父节点）关节坐标系可能优于全局坐标系？" },
          answer: {
            en: "Local frames express each joint's rotation relative to its parent, matching the kinematic chain and making the same gesture invariant to overall body orientation/position. This decouples articulation from global placement, which generalizes better and composes naturally along the skeleton.",
            zh: "局部坐标系把每个关节的旋转表示为相对其父节点的，符合运动学链，使同一手势对整体身体朝向/位置不变。这把关节运动与全局位置解耦，泛化更好，并沿骨架自然组合。",
          },
        },
      ],
      links: ["A3", "B3", "D7"],
      papers: [{ title: "On the Continuity of Rotation Representations in Neural Networks", year: 2019 }],
    },
    {
      id: "A7",
      trackId: "A",
      index: 7,
      title: { en: "Motion priors & generation", zh: "运动先验与生成" },
      summary: {
        en: "Learn what human motion looks like, then sample, denoise, or complete it.",
        zh: "学习人类运动长什么样，然后采样、去噪或补全它。",
      },
      body: {
        en: "A **motion prior** is a learned distribution over plausible human movement. It serves two roles: as a *regularizer* (snap noisy estimates onto realistic motion — used in mesh recovery and mocap cleanup) and as a *generator* (synthesize new motion, optionally conditioned on text, music, or a goal).\n\nThe modeling arc mirrors generative AI broadly: VAEs gave smooth latent motion spaces; **diffusion models** now dominate motion generation, denoising a noisy sequence into a coherent one, conditioned on prompts. The hard parts are physical plausibility (no foot-skating or ground penetration) and long-horizon coherence. Motion generation closes Track A's loop: from *recovering* the human (Lessons 1–6) to *modeling and producing* human behavior — the generative counterpart that Track D's world models also reach toward.",
        zh: "**运动先验**是对合理人类运动的学到的分布。它有两个角色：作为*正则项*（把含噪估计吸附到真实运动上——用于网格恢复与动捕清洗）和作为*生成器*（合成新运动，可按文本、音乐或目标为条件）。\n\n建模弧线整体上呼应生成式 AI：VAE 提供平滑的潜在运动空间；**扩散模型**如今主导运动生成，把含噪序列去噪为连贯序列，并以提示为条件。难点在物理合理性（无脚滑或穿地）与长时程连贯。运动生成闭合了 Track A：从*恢复*人体（第 1–6 课）到*建模并产出*人类行为——这一生成对应物，也是 Track D 世界模型所伸向的。",
      },
      keyTerms: [
        { term: "Motion prior", def: { en: "A learned distribution that scores/generates plausible movement.", zh: "对合理运动打分/生成的学到的分布。" } },
        { term: "Motion diffusion", def: { en: "Generating motion by iteratively denoising a sequence, optionally conditioned.", zh: "通过迭代去噪一段序列来生成运动，可加条件。" } },
      ],
      checks: [
        {
          id: "A7-q1",
          prompt: { en: "Name the two distinct jobs a motion prior does, with an example of each.", zh: "说出运动先验承担的两项不同工作，各举一例。" },
          answer: {
            en: "(1) Regularization: clean up a noisy per-frame mesh-recovery estimate so the motion looks human (no jitter/impossible poses). (2) Generation: sample brand-new motion, e.g. text-to-motion ('a person sits then waves'). Same learned distribution, used to constrain estimates or to synthesize.",
            zh: "(1) 正则化：清理含噪的逐帧网格恢复估计，使运动像人（无抖动/不可能姿态）。(2) 生成：采样全新运动，如文本到运动（「一个人坐下然后挥手」）。同一个学到的分布，既用于约束估计，也用于合成。",
          },
        },
        {
          id: "A7-q2",
          prompt: { en: "Why is physical plausibility (e.g. no foot-skating) hard for pure data-driven generators?", zh: "为什么纯数据驱动的生成器难以保证物理合理性（如无脚滑）？" },
          answer: {
            en: "Generators match the data distribution in pose space but don't enforce contact dynamics; small per-frame errors integrate into visible artifacts like feet sliding on the floor. Fixing it needs explicit contact/physics constraints or losses, because plausibility is a global physical property the per-frame likelihood doesn't capture.",
            zh: "生成器在姿态空间匹配数据分布，但不强制接触动力学；逐帧的小误差累积成可见伪影，如脚在地面滑动。修复需要显式的接触/物理约束或损失，因为合理性是逐帧似然不捕捉的全局物理性质。",
          },
        },
      ],
      links: ["A3", "A8", "D8"],
      papers: [{ title: "Human Motion Diffusion Model (MDM)", year: 2022 }],
    },
    {
      id: "A8",
      trackId: "A",
      index: 8,
      title: { en: "Human–scene & human–object interaction", zh: "人–场景与人–物交互" },
      summary: {
        en: "Bodies don't float — model contact, support, and affordance with the environment.",
        zh: "身体不会悬浮——建模与环境的接触、支撑与可供性。",
      },
      body: {
        en: "A recovered body must be *consistent with its surroundings*: feet on the floor, hips on the chair, hand on the cup. **Human–scene interaction** adds contact and **non-penetration** constraints between the body mesh and the 3D scene, which both correct pose estimates (the scene disambiguates depth) and enable reasoning about **affordances** — where a body *can* sit, reach, or grasp.\n\nThis is the meeting point of Track A and Tracks B/D: you need the human (this track) *and* the scene geometry (3D reconstruction) in one coordinate frame. Contact is a powerful, almost-free supervisory signal — physics says bodies and objects can't interpenetrate and must be supported — and it foreshadows the embodied agent that perceives a scene and acts within its constraints.",
        zh: "恢复出的身体必须*与其周围一致*：脚在地面、臀在椅上、手在杯上。**人–场景交互**在身体网格与 3D 场景之间加入接触与**非穿插**约束，既校正姿态估计（场景消解深度），又支持对**可供性（affordance）**的推理——身体*能*在哪里坐、够、抓。\n\n这是 Track A 与 Track B/D 的交汇点：你需要把人（本赛道）*和*场景几何（三维重建）放在同一坐标系里。接触是强大且近乎免费的监督信号——物理规定身体与物体不能互相穿插且须被支撑——它也预示了那个感知场景并在其约束内行动的具身智能体。",
      },
      keyTerms: [
        { term: "Non-penetration", def: { en: "A constraint that body and scene meshes may not overlap in 3D.", zh: "身体与场景网格在 3D 中不得重叠的约束。" } },
        { term: "Affordance", def: { en: "What the environment allows an agent to do (sit-able, grasp-able).", zh: "环境允许智能体做的事（可坐、可抓）。" } },
      ],
      checks: [
        {
          id: "A8-q1",
          prompt: { en: "How can scene geometry improve a single-image 3D pose estimate?", zh: "场景几何如何改进单张图像的 3D 姿态估计？" },
          answer: {
            en: "The scene resolves depth ambiguity: requiring feet to contact the known floor plane and the body not to penetrate furniture fixes the body's distance and orientation that the image alone leaves ambiguous. Contact and support act as geometric constraints that pin down the otherwise under-determined 3D placement.",
            zh: "场景消解深度歧义：要求脚接触已知地面、身体不穿插家具，能确定图像本身留下歧义的身体距离与朝向。接触与支撑作为几何约束，固定了原本欠定的 3D 摆放。",
          },
        },
        {
          id: "A8-q2",
          prompt: { en: "Why is contact a nearly 'free' supervision signal?", zh: "为什么接触是近乎「免费」的监督信号？" },
          answer: {
            en: "It comes from physics, not annotation: bodies must be supported and cannot interpenetrate objects. These laws hold for every frame without labeling, so you can enforce them as losses/constraints on unlabeled data, gaining 3D supervision for free from physical plausibility.",
            zh: "它来自物理而非标注：身体必须被支撑，且不能与物体互相穿插。这些规律对每一帧都成立而无需标注，因此可作为损失/约束施加在无标注数据上，从物理合理性中免费获得 3D 监督。",
          },
        },
      ],
      links: ["A4", "B8", "D6"],
      papers: [{ title: "Resolving 3D Human Pose Ambiguities with 3D Scene Constraints (PROX)", year: 2019 }],
    },
    {
      id: "A9",
      trackId: "A",
      index: 9,
      title: { en: "Paper deep-dive & reproduction", zh: "论文精读与复现" },
      summary: {
        en: "Consolidate: deeply read a mesh-recovery paper and reproduce a minimal fit.",
        zh: "巩固：深读一篇网格恢复论文，复现一个最小拟合。",
      },
      body: {
        en: "Turn the track into a working mesh — pick a project:\n\n**① Fit SMPL to a clip (SMPLify).** Get 2D keypoints from OpenPose or MediaPipe, then optimize SMPL's $(\\beta, \\theta)$ to minimize reprojection + a pose prior (reference: SMPLify / SMPLify-X). Overlay the posed mesh on the video — and watch depth-flips and foot-skating appear when you down-weight the prior.\n\n**② Run a learned mesh-recovery model.** Use 4D-Humans / HMR 2.0 (`shubham-goel/4D-Humans`) or VIBE (`mkocabas/VIBE`) on a short video; inspect tracking, jitter, and ground penetration frame by frame.\n\n**③ Text-to-motion.** Run the Motion Diffusion Model (`GuyTevet/motion-diffusion-model`), generate motion from a few prompts, and probe foot-skating and prompt adherence.\n\n**Deep-dive** your chosen paper: reconstruct each loss term (reprojection, pose prior, contact/temporal) and explain what breaks without it. **Deliverable:** a posed SMPL mesh (or generated motion) you can scrub frame-by-frame, plus a written list of its failure modes and which term would fix each.",
        zh: "把本赛道变成一具可运行的网格——挑一个项目：\n\n**① 把 SMPL 拟合到一段视频（SMPLify）。** 用 OpenPose 或 MediaPipe 取 2D 关键点，再优化 SMPL 的 $(\\beta, \\theta)$ 以最小化重投影 + 姿态先验（参考：SMPLify / SMPLify-X）。把姿态网格叠加到视频上——当你调低先验权重时，观察深度翻转与脚滑如何出现。\n\n**② 运行学到的网格恢复模型。** 在一小段视频上用 4D-Humans / HMR 2.0（`shubham-goel/4D-Humans`）或 VIBE（`mkocabas/VIBE`）；逐帧检查跟踪、抖动与穿地。\n\n**③ 文本到运动。** 运行运动扩散模型（`GuyTevet/motion-diffusion-model`），用若干提示生成运动，探查脚滑与提示遵循度。\n\n**精读**你所选的论文：重建每个损失项（重投影、姿态先验、接触/时间），解释缺了它会坏什么。**交付物：** 一具你能逐帧检查的姿态 SMPL 网格（或生成的运动），加上一份失败模式清单及每个该由哪一项修复。",
      },
      keyTerms: [
        { term: "SMPLify", def: { en: "Optimization-based fitting of SMPL to 2D keypoints.", zh: "基于优化把 SMPL 拟合到 2D 关键点。" } },
        { term: "Failure-mode analysis", def: { en: "Cataloguing how/why a model breaks to guide fixes.", zh: "编目模型如何/为何失效，以指导修复。" } },
      ],
      checks: [
        {
          id: "A9-q1",
          prompt: { en: "Your fitted SMPL looks right in the image but is flipped in depth. Which loss term is likely too weak?", zh: "你拟合的 SMPL 在图像里看着对，但深度上翻转了。最可能是哪一项损失太弱？" },
          answer: {
            en: "The pose/depth prior (and any temporal or scene-contact term). Reprojection alone is depth-ambiguous, so a front/back-flipped pose can fit the 2D keypoints equally well. Strengthening the prior — or adding temporal consistency / ground contact — breaks the symmetry toward the physically correct solution.",
            zh: "姿态/深度先验（以及任何时间或场景接触项）。仅重投影是深度歧义的，因此前后翻转的姿态能同样好地拟合 2D 关键点。加强先验——或加入时间一致性/地面接触——可打破对称，偏向物理正确的解。",
          },
        },
        {
          id: "A9-q2",
          prompt: { en: "Why prefer optimization-based SMPLify for a one-off clip over training a regressor?", zh: "为什么对一次性的小片段，偏好基于优化的 SMPLify 而非训练回归器？" },
          answer: {
            en: "Optimization needs no training data or GPU training loop — it directly minimizes reprojection + prior on that clip, is easy to inspect term-by-term, and is ideal for a small reproduction. A regressor pays off only when you need fast inference at scale across many inputs.",
            zh: "优化无需训练数据或 GPU 训练循环——它直接在该片段上最小化重投影 + 先验，逐项易于检查，非常适合小规模复现。回归器只有在需要跨大量输入做快速、规模化推理时才划算。",
          },
        },
      ],
      links: ["A4", "C9", "B9"],
      papers: [{ title: "Keep it SMPL: Automatic Estimation of 3D Human Pose and Shape (SMPLify)", year: 2016 }],
    },
  ],
};
