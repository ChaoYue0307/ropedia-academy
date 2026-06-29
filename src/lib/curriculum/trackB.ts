import type { Track } from "../types";

export const trackB: Track = {
  id: "B",
  title: { en: "3D/4D Reconstruction & Neural Rendering", zh: "三维/四维重建与神经渲染" },
  subtitle: { en: "From images to geometry you can render", zh: "从图像到可渲染的几何" },
  blurb: {
    en: "Camera geometry, structure-from-motion, implicit surfaces, NeRF, Gaussian Splatting, and dynamic scenes — the geometric core that SLAM and world models are built on.",
    zh: "相机几何、运动恢复结构、隐式曲面、NeRF、高斯泼溅与动态场景——SLAM 与世界模型赖以构建的几何内核。",
  },
  focus: {
    en: "Multi-view and dynamic scene reconstruction, NeRF / Gaussian Splatting, and novel-view synthesis.",
    zh: "多视图与动态场景重建、NeRF / 高斯泼溅，以及新视角合成。",
  },
  background: {
    en: "Experience in 3D reconstruction or neural rendering; familiarity with camera calibration and bundle adjustment (BA).",
    zh: "三维重建或神经渲染方面的经验；熟悉相机标定与光束法平差（BA）。",
  },
  accent: "#1d9e75",
  lessons: [
    {
      id: "B1",
      trackId: "B",
      index: 1,
      title: { en: "Camera geometry & projection", zh: "相机几何与投影" },
      summary: {
        en: "The pinhole model: how a 3D point becomes a pixel, and why that map is invertible only up to scale.",
        zh: "针孔模型：一个 3D 点如何变成像素，以及为何该映射仅在尺度意义下可逆。",
      },
      body: {
        en: "Everything in 3D vision rests on the **pinhole camera**. A world point $X$ projects to a pixel via $x \\sim K [R \\,|\\, t]\\, X$, where **intrinsics** $K$ encode focal length and principal point, and **extrinsics** $[R|t]$ encode the camera's pose. Projection is a many-to-one map: an entire ray of 3D points maps to one pixel, so depth is lost. This single fact — *projection discards depth* — is the source of nearly every hard problem in the track.\n\nRecovering 3D therefore means *inverting projection using multiple views or priors*. Calibration estimates $K$; pose estimation finds $[R|t]$. Homogeneous coordinates make the algebra linear. Master this and the rest of Track B is bookkeeping on top of one equation.",
        zh: "3D 视觉的一切都建立在**针孔相机**之上。世界点 $X$ 经 $x \\sim K [R \\,|\\, t]\\, X$ 投影为像素，其中**内参** $K$ 编码焦距与主点，**外参** $[R|t]$ 编码相机位姿。投影是多对一映射：一整条 3D 点构成的射线映到一个像素，因此深度丢失。这一事实——*投影丢弃深度*——几乎是本赛道所有难题的根源。\n\n因此恢复 3D 意味着*用多视图或先验来反演投影*。标定估计 $K$；位姿估计求 $[R|t]$。齐次坐标使代数线性化。掌握这点，Track B 其余内容不过是建立在一个方程之上的记账。",
      },
      keyTerms: [
        { term: "Intrinsics / extrinsics", def: { en: "K (focal, principal point) vs [R|t] (camera pose in the world).", zh: "K（焦距、主点）与 [R|t]（相机在世界中的位姿）。" } },
        { term: "Projection ambiguity", def: { en: "A pixel corresponds to a ray, not a point — depth is unknown.", zh: "一个像素对应一条射线而非一个点——深度未知。" } },
      ],
      checks: [
        {
          id: "B1-q1",
          prompt: { en: "Why can't you recover a 3D point from a single calibrated image, even with perfect intrinsics?", zh: "为什么即使内参完美，也无法从单张已标定图像恢复一个 3D 点？" },
          answer: {
            en: "Projection maps every point along a viewing ray to the same pixel, so one image fixes the ray direction but not the distance along it. Depth is fundamentally unobservable from one view; you need a second view (triangulation), known scene priors, or motion to pin down where on the ray the point lies.",
            zh: "投影把一条视线上的所有点映到同一像素，因此单张图像确定了射线方向，但不确定沿射线的距离。深度从单视图根本不可观测；你需要第二个视图（三角测量）、已知场景先验或运动，才能确定点落在射线上的哪里。",
          },
        },
        {
          id: "B1-q2",
          prompt: { en: "What is the role of homogeneous coordinates in the projection equation?", zh: "齐次坐标在投影方程中的作用是什么？" },
          answer: {
            en: "They turn the nonlinear perspective division into a linear matrix multiply (up to a scale factor), so rotation, translation, and projection compose as one matrix and standard linear algebra (least squares, SVD) applies. The '~' (equality up to scale) captures the depth/scale freedom cleanly.",
            zh: "它们把非线性的透视除法变成线性矩阵乘法（在一个尺度因子意义下），于是旋转、平移、投影组合为一个矩阵，标准线性代数（最小二乘、SVD）即可应用。「~」（在尺度意义下相等）干净地刻画了深度/尺度的自由度。",
          },
        },
        {
          id: "B1-q3",
          prompt: { en: "What is the difference between intrinsics K and extrinsics [R|t], and why separate them?", zh: "内参 K 与外参 [R|t] 有何区别？为什么把它们分开？" },
          answer: {
            en: "Intrinsics K describe the camera itself — focal length and principal point — and stay fixed if you only move the camera. Extrinsics [R|t] describe where the camera is and how it's oriented in the world, changing every time it moves. Separating them lets you calibrate K once and re-estimate pose per frame, keeping the optimization variables physically meaningful.",
            zh: "内参 K 描述相机本身——焦距与主点——只移动相机时它保持不变。外参 [R|t] 描述相机在世界中的位置与朝向，每次移动都改变。把它们分开，使你能一次标定 K、逐帧重估位姿，并让优化变量具有物理意义。",
          },
          hint: { en: "Which one changes when you walk the camera across the room, and which when you swap the lens?", zh: "把相机搬到房间另一头时哪个变？换镜头时哪个变？" },
        },
        {
          id: "B1-q4",
          prompt: { en: "'Projection discards depth' is called the source of the track's hard problems. Name two consequences.", zh: "「投影丢弃深度」被称为本赛道难题的根源。举出两个后果。" },
          answer: {
            en: "(1) Single-view 3D is impossible, so you need triangulation from multiple views (Lesson 2). (2) Reconstruction has an inherent scale ambiguity — without metric cues you can't tell a big scene far away from a small one nearby — which propagates into SfM/SLAM and must be fixed with a known length, stereo baseline, or sensor. Depth/occlusion reasoning in rendering also stems from this.",
            zh: "(1) 单视图 3D 不可能，故需多视图三角测量（第 2 课）。(2) 重建存在固有的尺度歧义——没有度量线索就分不清远处的大场景与近处的小场景——它传播进 SfM/SLAM，须用已知长度、立体基线或传感器修正。渲染中的深度/遮挡推理也源于此。",
          },
          hint: { en: "Think why you need two views, and why a reconstruction's absolute size is unknown.", zh: "想想为什么需要两个视图，以及为什么重建的绝对尺寸是未知的。" },
        },
      ],
      links: ["B2", "B3", "D2"],
      papers: [{ title: "Multiple View Geometry in Computer Vision (Hartley & Zisserman)", year: 2003 }],
    },
    {
      id: "B2",
      trackId: "B",
      index: 2,
      title: { en: "Multi-view geometry & triangulation", zh: "多视图几何与三角测量" },
      summary: {
        en: "Two views constrain each other along epipolar lines; their intersection recovers depth.",
        zh: "两个视图沿对极线相互约束；它们的交会恢复深度。",
      },
      body: {
        en: "With two calibrated views, geometry returns. The **epipolar constraint** $x'^\\top F x = 0$ says a point in one image must lie on a line in the other — reducing 2D correspondence search to 1D. Given a correspondence and both camera poses, **triangulation** intersects the two viewing rays to recover the 3D point. In practice the rays don't meet exactly (noise), so you solve a small least-squares problem for the closest point.\n\nThis is the workhorse of reconstruction: matching + triangulation turns pixels into a 3D point cloud. The same epipolar idea underlies stereo depth and the data association inside SLAM. Note the recurring theme — more views convert the under-determined single-view problem into a solvable one.",
        zh: "有了两个已标定视图，几何回归。**对极约束** $x'^\\top F x = 0$ 表明一图中的点必落在另一图的一条直线上——把 2D 对应搜索降为 1D。给定一对对应与两相机位姿，**三角测量**让两条视线相交以恢复 3D 点。实际中射线因噪声不精确相交，故解一个小的最小二乘问题求最近点。\n\n这是重建的主力：匹配 + 三角测量把像素变成 3D 点云。同样的对极思想支撑立体深度，以及 SLAM 内部的数据关联。注意反复出现的主题——更多视图把欠定的单视图问题转化为可解问题。",
      },
      keyTerms: [
        { term: "Epipolar constraint", def: { en: "A point's match in the other view lies on a known line (via F/E).", zh: "某点在另一视图中的匹配落在一条已知直线上（经 F/E）。" } },
        { term: "Triangulation", def: { en: "Intersecting two+ rays to recover a 3D point.", zh: "让两条以上射线相交以恢复 3D 点。" } },
      ],
      checks: [
        {
          id: "B2-q1",
          prompt: { en: "How does the epipolar constraint make correspondence search cheaper?", zh: "对极约束如何让对应搜索更省力？" },
          answer: {
            en: "Without it you'd search the whole second image (2D) for each point's match. The epipolar constraint guarantees the match lies on a single known line, reducing the search to 1D along that line — far fewer candidates and far fewer false matches.",
            zh: "没有它，你得在整张第二图像（2D）中为每个点搜匹配。对极约束保证匹配落在唯一已知直线上，把搜索降为沿该线的 1D——候选更少，错误匹配也大幅减少。",
          },
        },
        {
          id: "B2-q2",
          prompt: { en: "Why is triangulation solved as least squares rather than an exact ray intersection?", zh: "为什么三角测量按最小二乘求解，而非精确的射线相交？" },
          answer: {
            en: "Measured pixels and estimated poses are noisy, so the two back-projected rays are skew and never meet exactly in 3D. Least squares finds the point minimizing total reprojection (or ray) error — the most consistent 3D location given imperfect inputs.",
            zh: "测得的像素与估计的位姿都有噪声，因此两条反投影射线是异面的，在 3D 中从不精确相交。最小二乘求使总重投影（或射线）误差最小的点——在不完美输入下最一致的 3D 位置。",
          },
        },
        {
          id: "B2-q3",
          prompt: { en: "Why does a wider baseline between two views give more accurate depth, and what's the cost?", zh: "为什么两视图间更宽的基线能给出更准的深度？代价是什么？" },
          answer: {
            en: "A wider baseline makes the two viewing rays intersect at a sharper angle, so a given pixel-localization error translates into a smaller depth error — depth precision improves with the triangulation angle. The cost is correspondence: wider baselines mean larger appearance changes, more occlusion, and harder, less reliable matching.",
            zh: "更宽的基线使两条视线以更锐的角度相交，于是给定的像素定位误差转化为更小的深度误差——深度精度随三角测量角度提升。代价在对应：更宽的基线意味着更大的外观变化、更多遮挡、更难且更不可靠的匹配。",
          },
          hint: { en: "Picture two nearly parallel rays vs two rays meeting at a wide angle — which pins depth better?", zh: "想象两条近乎平行的射线 vs 以大角度相交的两条射线——哪个更能确定深度？" },
        },
        {
          id: "B2-q4",
          prompt: { en: "Given poses, triangulation is easy algebra. So what is actually the hard part of multi-view reconstruction?", zh: "给定位姿，三角测量只是简单代数。那么多视图重建真正难的部分是什么？" },
          answer: {
            en: "Correspondence — reliably matching which pixel in one image is the same scene point in another. Textureless regions (a blank wall), repetitive patterns (windows), occlusion, and lighting changes all break matching, and a single wrong match produces a grossly wrong 3D point. The geometry is solved; robust data association is the bottleneck.",
            zh: "对应——可靠地匹配一图中的某像素与另一图中的同一场景点。无纹理区域（白墙）、重复图案（窗户）、遮挡与光照变化都会破坏匹配，而单个错误匹配会产生严重错误的 3D 点。几何已解决；稳健的数据关联才是瓶颈。",
          },
          hint: { en: "What happens when you try to triangulate points on a blank white wall?", zh: "当你试图对一面空白白墙上的点做三角测量时会发生什么？" },
        },
      ],
      links: ["B1", "B3", "D2"],
      papers: [{ title: "Multiple View Geometry in Computer Vision (Hartley & Zisserman)", year: 2003 }],
    },
    {
      id: "B3",
      trackId: "B",
      index: 3,
      title: { en: "Camera pose: PnP & bundle adjustment", zh: "相机位姿：PnP 与光束法平差" },
      summary: {
        en: "Localize cameras and refine everything jointly by minimizing reprojection error.",
        zh: "定位相机，并通过最小化重投影误差联合精修一切。",
      },
      body: {
        en: "**PnP** (Perspective-n-Point) recovers a camera's pose $[R|t]$ from known 3D points and their 2D projections — the localization step. **Bundle adjustment (BA)** is the global refinement: jointly optimize all camera poses *and* all 3D points to minimize the total **reprojection error** $\\sum_{ij} \\| x_{ij} - \\pi(K_i, R_i, t_i, X_j)\\|^2$. It's a large sparse nonlinear least-squares problem solved with Levenberg–Marquardt.\n\nBA is the beating heart of **Structure-from-Motion** and the back-end of SLAM (Track D). The conceptual pattern is exactly Track A's mesh recovery: parameterize the unknowns, render predictions through the camera, minimize the gap to observations. Reprojection error is the universal currency of geometric vision.",
        zh: "**PnP**（Perspective-n-Point）从已知 3D 点及其 2D 投影恢复相机位姿 $[R|t]$——即定位步骤。**光束法平差（BA）**是全局精修：联合优化所有相机位姿*和*所有 3D 点，以最小化总**重投影误差** $\\sum_{ij} \\| x_{ij} - \\pi(K_i, R_i, t_i, X_j)\\|^2$。这是一个大型稀疏非线性最小二乘问题，用 Levenberg–Marquardt 求解。\n\nBA 是**运动恢复结构（SfM）**的跳动心脏，也是 SLAM（Track D）的后端。其概念范式恰是 Track A 的网格恢复：参数化未知量，经相机渲染预测，最小化与观测的差距。重投影误差是几何视觉的通用货币。",
      },
      keyTerms: [
        { term: "PnP", def: { en: "Recovering camera pose from known 3D↔2D correspondences.", zh: "从已知 3D↔2D 对应恢复相机位姿。" } },
        { term: "Bundle adjustment", def: { en: "Joint nonlinear least squares over all poses and points.", zh: "对所有位姿与点的联合非线性最小二乘。" } },
      ],
      checks: [
        {
          id: "B3-q1",
          prompt: { en: "What exactly does bundle adjustment minimize, and over which variables?", zh: "光束法平差究竟最小化什么，对哪些变量？" },
          answer: {
            en: "It minimizes total reprojection error — the sum of squared distances between observed 2D feature locations and the projections of the estimated 3D points — jointly over all camera poses (and often intrinsics) and all 3D point positions. Everything is refined together so the whole reconstruction is globally consistent.",
            zh: "它最小化总重投影误差——观测到的 2D 特征位置与估计 3D 点投影之间距离平方之和——并对所有相机位姿（常含内参）与所有 3D 点位置联合优化。一切被一起精修，使整个重建全局一致。",
          },
        },
        {
          id: "B3-q2",
          prompt: { en: "Why is the BA problem sparse, and why does that matter?", zh: "为什么 BA 问题是稀疏的，这为何重要？" },
          answer: {
            en: "Each 3D point is seen by only a few cameras, so most point–camera pairs have no observation; the Jacobian/Hessian is mostly zeros. Exploiting this sparsity (e.g. the Schur complement) makes solving thousands of cameras and millions of points tractable — dense solving would be hopelessly expensive.",
            zh: "每个 3D 点只被少数相机看到，因此大多数点–相机对没有观测；雅可比/海森矩阵大部分为零。利用这种稀疏性（如 Schur 补）使求解上千相机、数百万点变得可行——稠密求解将昂贵到无望。",
          },
        },
        {
          id: "B3-q3",
          prompt: { en: "PnP and bundle adjustment both deal with camera pose. What's the division of labor?", zh: "PnP 与光束法平差都涉及相机位姿。它们如何分工？" },
          answer: {
            en: "PnP localizes a single new camera given already-known 3D points and their 2D projections — a fast, local bootstrap step. BA then refines everything jointly: all poses and all 3D points together, for global consistency. SfM pipelines use PnP to register each new image, then BA to clean up accumulated drift.",
            zh: "PnP 在已知 3D 点及其 2D 投影的情况下定位单个新相机——一个快速、局部的引导步骤。BA 随后联合精修一切：所有位姿与所有 3D 点一起，以求全局一致。SfM 流水线用 PnP 注册每张新图，再用 BA 清理累积漂移。",
          },
          hint: { en: "Which one registers one new camera quickly, and which one polishes the whole map?", zh: "哪个快速注册一个新相机，哪个打磨整张地图？" },
        },
        {
          id: "B3-q4",
          prompt: { en: "BA is a nonlinear least-squares problem solved with Levenberg–Marquardt. Why does it need a good initialization?", zh: "BA 是用 Levenberg–Marquardt 求解的非线性最小二乘问题。为什么它需要良好的初始化？" },
          answer: {
            en: "The reprojection objective is non-convex with many local minima; LM is a local optimizer that only descends from where it starts. A poor initial guess (bad poses/points) can settle into a wrong minimum. Incremental SfM and PnP provide a close-enough starting estimate so BA refines toward the correct global structure.",
            zh: "重投影目标非凸、有许多局部极小；LM 是局部优化器，只从起点下降。糟糕的初值（坏位姿/点）会落入错误的极小。增量式 SfM 与 PnP 提供足够接近的初始估计，使 BA 朝正确的全局结构精修。",
          },
          hint: { en: "LM only goes downhill from where it starts — what if it starts in the wrong valley?", zh: "LM 只从起点往下走——若它从错误的山谷出发会怎样？" },
        },
      ],
      links: ["B2", "A4", "D2"],
      papers: [{ title: "Building Rome in a Day (large-scale SfM)", year: 2009 }],
    },
    {
      id: "B4",
      trackId: "B",
      index: 4,
      title: { en: "Implicit representations & SDF", zh: "隐式表示与 SDF" },
      summary: {
        en: "Represent a surface as the zero level-set of a function, not a mesh of vertices.",
        zh: "把曲面表示为一个函数的零等值面，而非顶点网格。",
      },
      body: {
        en: "Instead of storing geometry explicitly (vertices, voxels), an **implicit representation** stores a *function*. A **Signed Distance Function** $f(x)$ returns the signed distance from any 3D point to the nearest surface (negative inside, positive outside); the surface is the **zero level-set** $\\{x : f(x)=0\\}$. Parameterize $f$ with an MLP and you get a continuous, resolution-free surface with smooth gradients (normals are $\\nabla f$).\n\nThis idea is foundational and recurs: NeRF (next lesson) uses an implicit *density/color* field; Track D's **TSDF** is a truncated SDF used for fusing depth maps into a dense map. The deep point — a neural network *is* a geometry representation — unlocks the rest of neural rendering. Same 'signed distance' concept, two uses: shape in Track B, mapping in Track D.",
        zh: "与其显式存储几何（顶点、体素），**隐式表示**存储一个*函数*。**符号距离函数（SDF）** $f(x)$ 返回任意 3D 点到最近曲面的有符号距离（内部为负，外部为正）；曲面即**零等值面** $\\{x : f(x)=0\\}$。用 MLP 参数化 $f$，便得到连续、无分辨率限制、梯度平滑的曲面（法向为 $\\nabla f$）。\n\n这一想法是基础且反复出现的：NeRF（下一课）使用隐式的*密度/颜色*场；Track D 的 **TSDF** 是用于把深度图融合进稠密地图的截断 SDF。深刻之处——一个神经网络*就是*一种几何表示——开启了神经渲染的其余部分。同一个「符号距离」概念，两种用途：Track B 的形状，Track D 的建图。",
      },
      keyTerms: [
        { term: "SDF / level-set", def: { en: "Surface = where a signed-distance function equals zero.", zh: "曲面 = 符号距离函数等于零之处。" } },
        { term: "Implicit field", def: { en: "Geometry stored as a function (often an MLP), not explicit primitives.", zh: "几何以函数（常为 MLP）存储，而非显式基元。" } },
      ],
      checks: [
        {
          id: "B4-q1",
          prompt: { en: "Give two advantages of an implicit SDF over an explicit triangle mesh.", zh: "举出隐式 SDF 相比显式三角网格的两个优点。" },
          answer: {
            en: "(1) Resolution-free & continuous: you can query any point at any precision without fixing a vertex budget. (2) Smooth, well-defined normals/gradients everywhere ($\\nabla f$), and trivial inside/outside tests and boolean operations. It's also naturally differentiable for learning.",
            zh: "(1) 无分辨率限制且连续：可在任意精度查询任意点，无需固定顶点预算。(2) 处处有平滑、良定义的法向/梯度（$\\nabla f$），内外测试与布尔运算也简单。它对学习也天然可微。",
          },
        },
        {
          id: "B4-q2",
          prompt: { en: "How is Track D's TSDF related to the SDF here?", zh: "Track D 的 TSDF 与这里的 SDF 有何关系？" },
          answer: {
            en: "TSDF is the engineering version: a Signed Distance Function truncated to a thin band near the surface (clamped to ±1 far away). The same 'distance to nearest surface' concept is used for NeRF-style geometry in Track B and for fusing many noisy depth maps into one dense map in Track D.",
            zh: "TSDF 是工程化版本：把符号距离函数在表面附近截断为一个薄带（远处钳为 ±1）。同一个「到最近曲面的距离」概念，在 Track B 用于 NeRF 式几何，在 Track D 用于把许多含噪深度图融合成一张稠密地图。",
          },
        },
        {
          id: "B4-q3",
          prompt: { en: "Why is 'a neural network is a geometry representation' a paradigm shift? What does storing a function buy and cost?", zh: "为什么「神经网络就是一种几何表示」是范式转变？存储一个函数有何收益与代价？" },
          answer: {
            en: "Instead of an array of explicit primitives (vertices/voxels) at fixed resolution, the geometry lives in the weights of a continuous function you can query anywhere at any precision and differentiate end-to-end. The buy: compactness, continuity, resolution-freedom. The cost: querying needs a network evaluation (slow), and the shape is implicit — harder to edit or directly rasterize than explicit primitives.",
            zh: "几何不再是固定分辨率的显式基元数组（顶点/体素），而是驻留在一个连续函数的权重里，可在任意精度处处查询并端到端可微。收益：紧凑、连续、无分辨率限制。代价：查询需要一次网络求值（慢），且形状是隐式的——比显式基元更难编辑或直接光栅化。",
          },
          hint: { en: "Compare a list of vertices to a function f(x) you must evaluate to learn anything about the shape.", zh: "把一份顶点列表，与一个你必须求值才能了解形状的函数 f(x) 作比较。" },
        },
        {
          id: "B4-q4",
          prompt: { en: "The surface is the zero level-set of f. How do you turn that into an explicit surface or render it, and why is ∇f useful?", zh: "曲面是 f 的零等值面。你如何把它变成显式曲面或渲染它？∇f 为何有用？" },
          answer: {
            en: "Extract a mesh with marching cubes (sample f on a grid, polygonize the f=0 crossing), or render directly with sphere tracing. ∇f gives the surface normal (for shading) and, because f is a distance, its magnitude tells you how far the nearest surface is — so sphere tracing can safely step by |f| toward the surface without overshooting.",
            zh: "用 marching cubes 提取网格（在网格上采样 f，对 f=0 的穿越多边形化），或用球体追踪直接渲染。∇f 给出表面法向（用于着色），且因为 f 是距离，其大小告诉你最近曲面有多远——故球体追踪可安全地以 |f| 朝曲面步进而不越过。",
          },
          hint: { en: "If f tells you the distance to the nearest surface, how big a step can you safely take toward it?", zh: "若 f 告诉你到最近曲面的距离，你能安全地朝它迈多大一步？" },
        },
      ],
      links: ["B5", "D3", "A1"],
      papers: [{ title: "DeepSDF: Learning Continuous Signed Distance Functions for Shape Representation", year: 2019 }],
    },
    {
      id: "B5",
      trackId: "B",
      index: 5,
      title: { en: "NeRF & volume rendering", zh: "NeRF 与体渲染" },
      summary: {
        en: "Fit a scene as a radiance field and render novel views by integrating color along rays.",
        zh: "把场景拟合为辐射场，通过沿射线积分颜色来渲染新视角。",
      },
      body: {
        en: "**NeRF** represents a scene as a function $(x, d) \\to (c, \\sigma)$: given a 3D position and view direction, an MLP returns color $c$ and volume density $\\sigma$. To render a pixel, you march a ray and **integrate**: $C = \\int T(t)\\,\\sigma(t)\\,c(t)\\,dt$, where $T$ is accumulated transmittance. Crucially this rendering is **differentiable**, so you train the MLP by minimizing the difference between rendered and real pixels across many posed images — no 3D supervision needed.\n\nTwo tricks make it work: **positional encoding** (mapping inputs through high-frequency sinusoids so the MLP can represent sharp detail) and view-dependence (for specularities). NeRF reframed reconstruction as *optimizing a renderer*, and unleashed the neural-rendering wave that Gaussian Splatting (Lesson 7) later made real-time.",
        zh: "**NeRF** 把场景表示为函数 $(x, d) \\to (c, \\sigma)$：给定 3D 位置与视线方向，一个 MLP 返回颜色 $c$ 与体密度 $\\sigma$。渲染一个像素时，沿射线行进并**积分**：$C = \\int T(t)\\,\\sigma(t)\\,c(t)\\,dt$，其中 $T$ 是累积透射率。关键在于该渲染是**可微的**，故可通过最小化多张已知位姿图像上渲染像素与真实像素之差来训练 MLP——无需 3D 监督。\n\n两个技巧使其奏效：**位置编码**（把输入经高频正弦映射，使 MLP 能表示锐利细节）与视线相关性（用于高光）。NeRF 把重建重新表述为*优化一个渲染器*，并掀起了神经渲染浪潮，后被高斯泼溅（第 7 课）做到实时。",
      },
      keyTerms: [
        { term: "Radiance field", def: { en: "A function from (position, direction) to color and density.", zh: "从（位置，方向）到颜色与密度的函数。" } },
        { term: "Differentiable volume rendering", def: { en: "Integrating color/density along rays in a way you can backprop through.", zh: "沿射线积分颜色/密度，且可反向传播。" } },
      ],
      checks: [
        {
          id: "B5-q1",
          prompt: { en: "NeRF has no 3D ground truth. What signal trains the MLP?", zh: "NeRF 没有 3D 真值。什么信号训练了这个 MLP？" },
          answer: {
            en: "Photometric reconstruction loss: render each training pixel by integrating the field along its ray and compare to the real pixel color. Because rendering is differentiable, gradients flow back to the MLP, forcing the density/color field to be consistent with all the posed 2D images — multi-view consistency is the supervision.",
            zh: "光度重建损失：通过沿射线积分场来渲染每个训练像素，并与真实像素颜色比较。因渲染可微，梯度回流到 MLP，迫使密度/颜色场与所有已知位姿的 2D 图像一致——多视图一致性即监督。",
          },
        },
        {
          id: "B5-q2",
          prompt: { en: "Why is positional encoding necessary?", zh: "为什么需要位置编码？" },
          answer: {
            en: "Plain MLPs are biased toward low-frequency functions and produce blurry results. Mapping coordinates through high-frequency sinusoids lets the network represent sharp, high-frequency detail (edges, textures), dramatically improving reconstruction fidelity.",
            zh: "普通 MLP 偏向低频函数，产出模糊结果。把坐标经高频正弦映射，使网络能表示锐利的高频细节（边缘、纹理），大幅提升重建保真度。",
          },
        },
        {
          id: "B5-q3",
          prompt: { en: "In the volume rendering integral, what does transmittance T(t) represent, and why does it make occlusion come out right?", zh: "在体渲染积分中，透射率 T(t) 代表什么？它为何让遮挡得到正确处理？" },
          answer: {
            en: "T(t) is the probability the ray travels from the camera to depth t without being absorbed — it starts at 1 and decays through dense matter. Weighting each sample's color by T·σ means once the ray hits an opaque surface, T collapses toward 0 and everything behind contributes almost nothing — so nearer opaque surfaces correctly occlude farther ones.",
            zh: "T(t) 是射线从相机到达深度 t 而未被吸收的概率——从 1 开始，穿过稠密物质时衰减。用 T·σ 给每个采样的颜色加权意味着：一旦射线撞上不透明表面，T 坍缩趋近 0，其后的一切几乎不贡献——于是较近的不透明表面正确遮挡较远的。",
          },
          hint: { en: "What's the chance the ray reaches a given point without being blocked first?", zh: "射线在未被先挡住的情况下到达某点的概率是多少？" },
        },
        {
          id: "B5-q4",
          prompt: { en: "NeRF 'reframed reconstruction as optimizing a renderer.' How is this the same pattern as bundle adjustment and HMR?", zh: "NeRF「把重建重新表述为优化一个渲染器」。这与光束法平差和 HMR 是同一范式吗？" },
          answer: {
            en: "All three are analysis-by-synthesis: parameterize the unknowns (3D points+poses for BA; SMPL β,θ for HMR; a radiance field for NeRF), pass them through a differentiable forward model (projection / camera / volume renderer), and minimize the gap to the observed pixels/keypoints. Reprojection/photometric error is the shared currency; differentiability is what makes all three trainable by gradient descent.",
            zh: "三者都是分析–合成：参数化未知量（BA 是 3D 点+位姿；HMR 是 SMPL β、θ；NeRF 是辐射场），让它们通过一个可微前向模型（投影/相机/体渲染器），并最小化与观测像素/关键点的差距。重投影/光度误差是共享货币；可微性使三者都能由梯度下降训练。",
          },
          hint: { en: "Predict parameters → render through a forward model → match observations. Where have you seen this?", zh: "预测参数 → 经前向模型渲染 → 匹配观测。你在哪里见过这个？" },
        },
      ],
      links: ["B4", "B6", "B7"],
      papers: [{ title: "NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis", year: 2020 }],
    },
    {
      id: "B6",
      trackId: "B",
      index: 6,
      title: { en: "Making NeRF fast: hash grids", zh: "让 NeRF 变快：哈希网格" },
      summary: {
        en: "Move capacity from a big MLP into a learned spatial feature grid — seconds, not days.",
        zh: "把容量从大 MLP 转移到可学习的空间特征网格——以秒计，而非以天计。",
      },
      body: {
        en: "Original NeRF trains for hours/days because a large MLP must encode the whole scene. **Instant-NGP** fixes this with a **multi-resolution hash grid**: store learnable feature vectors at grid corners across several resolutions, hash to index them, and feed the interpolated features to a *tiny* MLP. Most capacity now lives in the explicit, directly-indexed grid, so each query is cheap and training drops to seconds.\n\nThe general lesson generalizes well beyond NeRF: **explicit, locally-indexed features train far faster than a monolithic MLP that must be evaluated everywhere.** Hash collisions are tolerated because the small MLP disambiguates and gradients concentrate where the scene actually has content. This efficiency insight is exactly what Gaussian Splatting takes to its conclusion.",
        zh: "原始 NeRF 训练数小时/数天，因为一个大 MLP 必须编码整个场景。**Instant-NGP** 用**多分辨率哈希网格**解决：在若干分辨率的网格角点存储可学习特征向量，用哈希索引它们，并把插值后的特征喂给一个*极小*的 MLP。如今大部分容量驻留在显式、可直接索引的网格中，故每次查询便宜，训练降到以秒计。\n\n这一普适教训远超 NeRF：**显式、局部索引的特征，比必须处处求值的单体 MLP 训练快得多。** 哈希冲突可被容忍，因为小 MLP 会消歧，且梯度集中在场景真正有内容之处。这一效率洞见，正是高斯泼溅推向极致的东西。",
      },
      keyTerms: [
        { term: "Multi-resolution hash grid", def: { en: "Learnable features at grid corners across scales, indexed via hashing.", zh: "跨尺度网格角点的可学习特征，经哈希索引。" } },
        { term: "Explicit vs implicit capacity", def: { en: "Storing scene info in a grid is faster to query than in MLP weights.", zh: "把场景信息存网格中，查询比存在 MLP 权重里更快。" } },
      ],
      checks: [
        {
          id: "B6-q1",
          prompt: { en: "Why does moving capacity from the MLP to a feature grid speed up training so much?", zh: "为什么把容量从 MLP 转移到特征网格能大幅加速训练？" },
          answer: {
            en: "A monolithic MLP must encode the entire scene in its weights, so every query runs a large network and every gradient update touches all of it. A grid stores info locally and is directly indexed: a query reads only nearby cells and a tiny MLP, so updates are local and cheap — far less computation per ray and faster convergence.",
            zh: "单体 MLP 必须把整个场景编码进权重，故每次查询都跑一个大网络，每次梯度更新都触及它全部。网格在本地存储信息且可直接索引：一次查询只读取附近单元和一个极小 MLP，更新局部而便宜——每条射线计算量小得多，收敛更快。",
          },
        },
        {
          id: "B6-q2",
          prompt: { en: "Hash collisions map different locations to the same feature. Why isn't this catastrophic?", zh: "哈希冲突把不同位置映到同一特征。为什么这不是灾难？" },
          answer: {
            en: "Collisions are resolved by the small MLP and by the multi-resolution structure (other levels disambiguate), and gradients naturally concentrate on occupied regions, so colliding empty space barely matters. The net effect is a controlled, graceful approximation rather than a hard error.",
            zh: "冲突由小 MLP 和多分辨率结构（其他层级消歧）解决，且梯度自然集中在被占据区域，因此与空白空间冲突几乎无关紧要。净效果是受控、优雅的近似，而非硬性错误。",
          },
        },
        {
          id: "B6-q3",
          prompt: { en: "Instant-NGP uses a multi-resolution hash grid. Why multiple resolutions instead of one fine grid?", zh: "Instant-NGP 用多分辨率哈希网格。为什么用多分辨率而非一个精细网格？" },
          answer: {
            en: "Coarse levels capture smooth, large-scale structure with few parameters and help disambiguate hash collisions; fine levels add sharp local detail. A single fine grid would need enormous memory to cover the volume densely and would lack large-scale context. Combining scales gives detail where needed and global structure cheaply.",
            zh: "粗层级用很少参数捕捉平滑的大尺度结构，并帮助消解哈希冲突；细层级加入锐利的局部细节。单个精细网格需要巨大内存才能稠密覆盖整个体积，且缺乏大尺度上下文。组合多个尺度，既在需要处给出细节，又廉价地提供全局结构。",
          },
          hint: { en: "What does the coarse level give you that a single ultra-fine grid can't (cheaply)?", zh: "粗层级提供了单个超精细网格（廉价地）给不了的什么？" },
        },
        {
          id: "B6-q4",
          prompt: { en: "How does the lesson of hash grids — explicit local features beat a monolithic MLP — foreshadow Gaussian Splatting?", zh: "哈希网格的教训——显式局部特征胜过单体 MLP——如何预示了高斯泼溅？" },
          answer: {
            en: "Both push capacity out of a global MLP into explicit, locally-indexed primitives that are cheap to query and update. Instant-NGP uses grid features + a tiny MLP; 3DGS goes all the way to fully explicit Gaussians with essentially no MLP, rasterized directly. Same insight — local explicit representation = speed — taken to its conclusion.",
            zh: "两者都把容量从全局 MLP 推向显式、局部索引、查询与更新便宜的基元。Instant-NGP 用网格特征 + 极小 MLP；3DGS 一路走到完全显式的高斯、几乎无 MLP、直接光栅化。同一洞见——局部显式表示=速度——被推向极致。",
          },
          hint: { en: "Where does 3DGS store its scene capacity — in network weights or in primitives?", zh: "3DGS 把场景容量存在哪——网络权重还是基元里？" },
        },
      ],
      links: ["B5", "B7", "D3"],
      papers: [{ title: "Instant Neural Graphics Primitives with a Multiresolution Hash Encoding", year: 2022 }],
    },
    {
      id: "B7",
      trackId: "B",
      index: 7,
      title: { en: "3D Gaussian Splatting", zh: "三维高斯泼溅" },
      summary: {
        en: "Represent the scene as millions of colored 3D Gaussians and rasterize them — real-time, high quality.",
        zh: "把场景表示为数百万个有色 3D 高斯并光栅化——实时、高质量。",
      },
      body: {
        en: "**3D Gaussian Splatting (3DGS)** abandons ray-marching an implicit field for an *explicit* set of 3D **Gaussians**, each with position, covariance (shape), color, and opacity. Rendering **splats** (projects) each Gaussian to the image and alpha-blends them via a fast differentiable rasterizer. Because rasterization is far cheaper than dense volume integration, 3DGS renders in **real time** while matching or beating NeRF quality, and it trains quickly.\n\nIt is the synthesis of the track's themes: explicit primitives (like point clouds), differentiable rendering (like NeRF), and optimization of a representation against images (like BA). Gaussians are also editable and easy to fuse with semantics — which is why Track D's semantic mapping increasingly rides on Gaussian representations.",
        zh: "**三维高斯泼溅（3DGS）**放弃对隐式场的射线行进，转而用一组*显式*的 3D **高斯**，每个带位置、协方差（形状）、颜色与不透明度。渲染时把每个高斯**泼溅**（投影）到图像，并经一个快速可微光栅化器做 alpha 混合。因光栅化远比稠密体积分便宜，3DGS 可**实时**渲染，质量却匹敌甚至超过 NeRF，且训练快。\n\n它是本赛道主题的综合：显式基元（像点云）、可微渲染（像 NeRF）、以及把表示对着图像优化（像 BA）。高斯还可编辑，且易与语义融合——这正是 Track D 的语义建图越来越依托高斯表示的原因。",
      },
      keyTerms: [
        { term: "Splatting", def: { en: "Projecting and alpha-blending 3D Gaussians into the image via rasterization.", zh: "经光栅化把 3D 高斯投影并 alpha 混合到图像。" } },
        { term: "Explicit primitive", def: { en: "Scene as concrete, editable elements (Gaussians) vs an MLP field.", zh: "场景作为具体、可编辑的元素（高斯），而非 MLP 场。" } },
      ],
      checks: [
        {
          id: "B7-q1",
          prompt: { en: "Why is 3DGS real-time when NeRF generally isn't?", zh: "为什么 3DGS 能实时，而 NeRF 一般不能？" },
          answer: {
            en: "NeRF queries an MLP at many sample points along every ray (dense volume integration) — hundreds of network evals per pixel. 3DGS rasterizes a finite set of explicit Gaussians and alpha-blends them, leveraging the GPU graphics pipeline. Far less per-pixel computation yields real-time rendering.",
            zh: "NeRF 沿每条射线在许多采样点查询 MLP（稠密体积分）——每像素数百次网络求值。3DGS 光栅化有限个显式高斯并做 alpha 混合，利用 GPU 图形管线。每像素计算量小得多，因而实时渲染。",
          },
        },
        {
          id: "B7-q2",
          prompt: { en: "Why are Gaussians convenient for adding semantics (relevant to Track D)?", zh: "为什么高斯便于附加语义（与 Track D 相关）？" },
          answer: {
            en: "Each Gaussian is an explicit, addressable element, so you can attach extra attributes (a semantic feature or label) per Gaussian and optimize them like color. This gives a queryable semantic 3D map directly, without baking semantics into an opaque MLP — exactly what semantic Gaussian mapping exploits.",
            zh: "每个高斯是显式、可寻址的元素，因此可为每个高斯附加额外属性（语义特征或标签）并像颜色一样优化。这直接得到可查询的语义 3D 地图，而无需把语义烘进不透明的 MLP——正是语义高斯建图所利用的。",
          },
        },
        {
          id: "B7-q3",
          prompt: { en: "3DGS is called a synthesis of the track's themes. Which three lineages does it combine?", zh: "3DGS 被称为本赛道主题的综合。它融合了哪三条脉络？" },
          answer: {
            en: "(1) Explicit primitives, like point clouds — the scene is concrete elements you can address and edit. (2) Differentiable rendering, like NeRF — the rasterizer passes gradients so the representation is learned from images. (3) Optimizing a representation against observations, like bundle adjustment — Gaussians are refined to minimize the image error.",
            zh: "(1) 显式基元，像点云——场景是可寻址、可编辑的具体元素。(2) 可微渲染，像 NeRF——光栅化器传递梯度，使表示从图像中学到。(3) 把表示对着观测优化，像光束法平差——高斯被精修以最小化图像误差。",
          },
          hint: { en: "Think point clouds, NeRF, and BA — one idea from each.", zh: "想想点云、NeRF 与 BA——各取一个想法。" },
        },
        {
          id: "B7-q4",
          prompt: { en: "3DGS starts with few Gaussians and adaptively densifies. Why not fix the Gaussian count up front?", zh: "3DGS 从少量高斯开始并自适应稠密化。为什么不预先固定高斯数量？" },
          answer: {
            en: "You don't know in advance where the scene needs detail. Adaptive densification adds Gaussians where reconstruction error / gradient is high (fine textures, edges) and prunes where they're wasted (empty or over-covered regions), allocating capacity to match the scene's actual complexity — better quality at lower total count than a uniform fixed budget.",
            zh: "你事先不知道场景哪里需要细节。自适应稠密化在重建误差/梯度高处（精细纹理、边缘）增加高斯，在浪费处（空白或过度覆盖区域）剪除，使容量分配匹配场景实际复杂度——在更低的总数下获得比均匀固定预算更好的质量。",
          },
          hint: { en: "Do you know before training which parts of the scene have the finest detail?", zh: "训练前你知道场景哪些部位细节最精细吗？" },
        },
      ],
      links: ["B5", "B6", "D4"],
      papers: [{ title: "3D Gaussian Splatting for Real-Time Radiance Field Rendering", year: 2023 }],
    },
    {
      id: "B8",
      trackId: "B",
      index: 8,
      title: { en: "Dynamic & 4D reconstruction", zh: "动态与四维重建" },
      summary: {
        en: "Add time: reconstruct scenes that move by modeling deformation over a canonical space.",
        zh: "加入时间：通过在标准空间上建模形变，重建会运动的场景。",
      },
      body: {
        en: "Real scenes move, so reconstruction must become **4D** (3D + time). The dominant recipe: learn a **canonical** space (the scene at rest) plus a **deformation field** that warps each timestamp into it. Rendering at time $t$ first deforms, then renders the canonical model — so appearance is shared across time and only motion is time-varying. This applies to both NeRF and Gaussian variants.\n\nThe core challenge is the under-constraint: many (geometry, motion) pairs explain the same video, so you need priors — smoothness, rigidity where appropriate, and as-rigid-as-possible deformation. 4D reconstruction connects the whole curriculum: it needs Track A's articulated human priors for people, and it produces the time-varying geometry that Track D's world models simulate. Egocentric video, being inherently dynamic and moving-camera, is a natural and hard testbed.",
        zh: "真实场景会动，因此重建须升至 **4D**（3D + 时间）。主流配方：学习一个**标准（canonical）**空间（静止时的场景）加一个**形变场**，把每个时间戳扭曲到其中。在时刻 $t$ 渲染时先形变、再渲染标准模型——于是外观跨时间共享，只有运动随时间变化。这适用于 NeRF 与高斯两类变体。\n\n核心挑战是欠约束：许多（几何，运动）组合都能解释同一视频，故需先验——平滑、适当处的刚性、以及尽可能刚性的形变。4D 重建连接整门课程：它需要 Track A 的关节化人体先验来处理人，并产出 Track D 世界模型所模拟的随时间变化的几何。第一人称视频本质上动态且相机移动，是天然而困难的试验场。",
      },
      keyTerms: [
        { term: "Canonical + deformation", def: { en: "A rest-state model plus a field that warps time t into it.", zh: "一个静止态模型加一个把时刻 t 扭曲进它的场。" } },
        { term: "4D reconstruction", def: { en: "Recovering time-varying 3D geometry from video.", zh: "从视频恢复随时间变化的 3D 几何。" } },
      ],
      checks: [
        {
          id: "B8-q1",
          prompt: { en: "Why factor a dynamic scene into a canonical model plus a deformation field?", zh: "为什么把动态场景分解为标准模型加形变场？" },
          answer: {
            en: "Appearance and geometry are largely constant over time; only motion changes. Sharing one canonical model across all frames concentrates the data on a single consistent reconstruction and isolates the time-varying part into the deformation field, which is far more data-efficient and better-constrained than reconstructing each frame independently.",
            zh: "外观与几何在时间上大体不变，只有运动在变。让所有帧共享一个标准模型，把数据集中到单一一致的重建上，并把随时间变化的部分隔离进形变场，这比独立重建每一帧的数据效率高得多、约束也更好。",
          },
        },
        {
          id: "B8-q2",
          prompt: { en: "4D reconstruction is under-constrained. Name one prior that helps and why.", zh: "4D 重建欠约束。举出一个有帮助的先验并说明原因。" },
          answer: {
            en: "As-rigid-as-possible / local rigidity: real surfaces mostly move rigidly in small neighborhoods, so penalizing non-rigid local deformation rules out the many wobbly solutions that fit the pixels but imply impossible physical motion, selecting the physically plausible geometry+motion split.",
            zh: "尽可能刚性/局部刚性：真实表面在小邻域内大多刚性运动，因此惩罚非刚性的局部形变，可排除许多虽拟合像素却意味着不可能物理运动的「抖动」解，选出物理合理的几何+运动分解。",
          },
        },
        {
          id: "B8-q3",
          prompt: { en: "When does the canonical + deformation factorization break down?", zh: "标准 + 形变的分解何时会失效？" },
          answer: {
            en: "When content can't be explained as a warp of one rest state: topology changes (a mouth opening, things merging/splitting), objects appearing or disappearing, or motion so large the deformation field becomes ambiguous. A fixed canonical space has no slot for content that wasn't there at rest, so such scenes need multiple canonicals, time-varying topology, or per-segment models.",
            zh: "当内容无法被解释为对单一静止态的扭曲时：拓扑变化（嘴张开、物体合并/分裂）、物体出现或消失，或运动大到形变场变得歧义。固定的标准空间没有位置容纳静止时不存在的内容，故此类场景需要多个标准空间、随时间变化的拓扑，或分段模型。",
          },
          hint: { en: "What if an object enters the scene that simply wasn't present in the rest state?", zh: "若有个物体进入场景，而它在静止态里根本不存在，会怎样？" },
        },
        {
          id: "B8-q4",
          prompt: { en: "How does 4D reconstruction tie Track A and Track D together?", zh: "4D 重建如何把 Track A 与 Track D 联系起来？" },
          answer: {
            en: "For the people in a dynamic scene, 4D reconstruction leans on Track A's articulated human priors (SMPL/motion) to constrain how bodies deform. Its output — time-varying 3D geometry — is exactly the kind of moving world state Track D's world models learn to simulate and predict. So it consumes human priors and produces world dynamics.",
            zh: "对动态场景中的人，4D 重建依靠 Track A 的关节化人体先验（SMPL/运动）来约束身体如何形变。其输出——随时间变化的 3D 几何——正是 Track D 世界模型学习去模拟与预测的那种运动世界状态。因此它消费人体先验、产出世界动态。",
          },
          hint: { en: "Who provides the body priors, and who simulates the resulting moving geometry?", zh: "谁提供身体先验，谁又模拟由此产生的运动几何？" },
        },
      ],
      links: ["B7", "A7", "D8"],
      papers: [{ title: "D-NeRF: Neural Radiance Fields for Dynamic Scenes", year: 2021 }],
    },
    {
      id: "B9",
      trackId: "B",
      index: 9,
      title: { en: "Paper deep-dive & reproduction", zh: "论文精读与复现" },
      summary: {
        en: "Consolidate: read NeRF or 3DGS deeply and render a small scene yourself.",
        zh: "巩固：深读 NeRF 或 3DGS，并亲手渲染一个小场景。",
      },
      body: {
        en: "Render something real — pick a project:\n\n**① NeRF / Gaussian Splatting with Nerfstudio.** Capture ~60–150 photos of an object (or use a sample scene like Mip-NeRF 360 `garden`). Run `ns-process-data images` (COLMAP) to get poses, then `ns-train nerfacto` — or `ns-train splatfacto` for 3DGS — and orbit it in the live viewer.\n\n**② Official 3D Gaussian Splatting.** Train INRIA's `graphdeco-inria/gaussian-splatting` on the same capture and compare quality and speed against nerfacto.\n\n**③ Instant-NGP.** Reproduce seconds-scale training on a small scene with `NVlabs/instant-ngp`.\n\n**Deep-dive** NeRF or 3DGS end-to-end: representation → differentiable renderer → photometric loss → the tricks (positional encoding / hierarchical sampling / adaptive densification). **Deliverable:** a rendered novel-view orbit + a diagnosis of any artifacts — floaters (add views or density regularization), blur or ghosting (pose error → re-run COLMAP).",
        zh: "渲染出真实的东西——挑一个项目：\n\n**① 用 Nerfstudio 跑 NeRF / 高斯泼溅。** 拍约 60–150 张物体照片（或用 Mip-NeRF 360 的 `garden` 样例场景）。运行 `ns-process-data images`（COLMAP）求位姿，再 `ns-train nerfacto`——3DGS 则用 `ns-train splatfacto`——在实时查看器里环绕观察。\n\n**② 官方 3D 高斯泼溅。** 在同一组拍摄上训练 INRIA 的 `graphdeco-inria/gaussian-splatting`，与 nerfacto 比较质量与速度。\n\n**③ Instant-NGP。** 用 `NVlabs/instant-ngp` 在小场景上复现以秒计的训练。\n\n**精读** NeRF 或 3DGS 的端到端：表示 → 可微渲染器 → 光度损失 → 工程技巧（位置编码 / 分层采样 / 自适应稠密化）。**交付物：** 一段渲染的新视角环绕 + 对任何伪影的诊断——漂浮物（加视角或密度正则）、模糊或重影（位姿误差 → 重跑 COLMAP）。",
      },
      keyTerms: [
        { term: "Floaters", def: { en: "Spurious semi-transparent blobs from under-constrained density.", zh: "由欠约束密度产生的虚假半透明团块。" } },
        { term: "Adaptive densification", def: { en: "Adding Gaussians where reconstruction error is high (3DGS).", zh: "在重建误差高处增加高斯（3DGS）。" } },
      ],
      checks: [
        {
          id: "B9-q1",
          prompt: { en: "Your reconstruction has 'floaters' (semi-transparent blobs in empty space). Likely cause and fix?", zh: "你的重建出现「漂浮物」（空中半透明团块）。可能成因与修复？" },
          answer: {
            en: "Cause: density is under-constrained where few rays observe that region (too few/poorly-distributed views), so the optimizer parks spurious density there to fit a handful of pixels. Fixes: more/better-distributed views, density/opacity regularization (sparsity), or pruning low-contribution density.",
            zh: "成因：在很少射线观测的区域密度欠约束（视角太少/分布差），优化器把虚假密度停在那里以拟合少数像素。修复：更多/分布更好的视角、密度/不透明度正则（稀疏化），或剪除低贡献密度。",
          },
        },
        {
          id: "B9-q2",
          prompt: { en: "Why verify camera poses before blaming the NeRF model for blur?", zh: "为什么在把模糊归咎于 NeRF 模型前，要先核验相机位姿？" },
          answer: {
            en: "NeRF/3DGS assume accurate poses; even small pose errors make multi-view rays inconsistent, so the model averages conflicting observations into blur/ghosting. Bad poses mimic model failure. Checking/refining poses (or running BA) first isolates whether the problem is the geometry pipeline or the renderer.",
            zh: "NeRF/3DGS 假设位姿准确；即便小的位姿误差也会使多视图射线不一致，模型把冲突观测平均成模糊/重影。坏位姿伪装成模型失败。先检查/精修位姿（或跑 BA），可分离问题出在几何流水线还是渲染器。",
          },
        },
        {
          id: "B9-q3",
          prompt: { en: "Floaters and blur are both artifacts. How do their root causes differ, and why does telling them apart matter?", zh: "漂浮物与模糊都是伪影。它们的根因有何不同？区分它们为何重要？" },
          answer: {
            en: "Floaters are a coverage/regularization problem — under-observed regions let the optimizer park spurious density; fix with more views or density sparsity. Blur/ghosting is usually a calibration problem — inaccurate camera poses make multi-view rays disagree and average out; fix by re-running COLMAP/BA. Same symptom class, opposite fixes, so misdiagnosing wastes effort on the wrong knob.",
            zh: "漂浮物是覆盖/正则问题——观测不足的区域让优化器停放虚假密度；用更多视角或密度稀疏化修复。模糊/重影通常是标定问题——相机位姿不准使多视图射线不一致而被平均；用重跑 COLMAP/BA 修复。同类症状、相反修法，故误诊会把精力浪费在错误的旋钮上。",
          },
          hint: { en: "One is 'not enough views saw this spot,' the other is 'the cameras are mis-located.'", zh: "一个是「看到此处的视角不够」，另一个是「相机位置不准」。" },
        },
        {
          id: "B9-q4",
          prompt: { en: "Why is reproducing a result (COLMAP poses → nerfacto) a better learning exercise than reading the paper alone?", zh: "为什么复现一个结果（COLMAP 位姿 → nerfacto）比只读论文更好地学习？" },
          answer: {
            en: "The paper presents the clean method; reproduction forces you through the real pipeline — capturing enough well-distributed views, getting poses right, and confronting the actual failure modes (floaters, blur, pose drift). Diagnosing those artifacts teaches the cause–effect links between each component and the output that equations alone never surface.",
            zh: "论文呈现干净的方法；复现迫使你走完真实流水线——拍到足够且分布良好的视角、把位姿弄对，并直面真实的失败模式（漂浮物、模糊、位姿漂移）。诊断这些伪影，教会你各组件与输出之间的因果联系，而这是仅靠公式永远无法揭示的。",
          },
          hint: { en: "What do you learn from artifacts that you can't learn from the equations?", zh: "从伪影中你能学到什么是公式给不了的？" },
        },
      ],
      links: ["B5", "B7", "D9"],
      papers: [],
    },
  ],
};
