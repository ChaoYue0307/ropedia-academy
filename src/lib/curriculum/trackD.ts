import type { Track } from "../types";

export const trackD: Track = {
  id: "D",
  title: { en: "Scene Reconstruction & World Modeling", zh: "场景重建与世界模型" },
  subtitle: { en: "From a map to a model you can reason and act in", zh: "从一张地图到可推理、可行动的模型" },
  blurb: {
    en: "Dense SLAM, TSDF fusion, semantic and open-vocabulary mapping, 3D scene graphs, spatial reasoning, and world models — the agent's persistent understanding of its environment.",
    zh: "稠密 SLAM、TSDF 融合、语义与开放词汇建图、3D 场景图、空间推理与世界模型——智能体对其环境的持久理解。",
  },
  focus: {
    en: "Long-term consistent 3D / 4D scene mapping, scene graphs, object- and space-centric representations, and spatial reasoning.",
    zh: "长期一致的三维 / 四维场景建图、场景图、物体中心与空间中心表示，以及空间推理。",
  },
  background: {
    en: "Experience in large-scale mapping, semantic reconstruction, or agent world models.",
    zh: "大规模建图、语义重建或智能体世界模型方面的经验。",
  },
  accent: "#378add",
  lessons: [
    {
      id: "D1",
      trackId: "D",
      index: 1,
      title: { en: "Dense SLAM: the core paradox", zh: "稠密 SLAM：核心悖论" },
      summary: {
        en: "Localize using a map you are simultaneously building from your own localization — a chicken-and-egg solved by structure.",
        zh: "用一张你正凭自身定位同时构建的地图来定位——一个被结构化求解的鸡生蛋问题。",
      },
      body: {
        en: "**SLAM** (Simultaneous Localization And Mapping) faces a paradox: to know where you are you need a map, but to build the map you need to know where you are. It's solved by joint estimation over a structured pipeline:\n\n- **Front-end** — fast, local: track features/photometry frame-to-frame to estimate incremental motion (visual odometry) and associate observations.\n- **Back-end** — slow, global: optimize the accumulated poses and map to stay consistent (pose-graph / bundle adjustment).\n- **Loop closure** — recognize a previously-seen place and add a constraint that cancels accumulated **drift**, snapping the trajectory back into global consistency.\n\nThis front/back/loop decomposition is the architecture of essentially every SLAM system. Drift is the central enemy: small per-frame errors integrate without bound, and only global optimization plus loop closure tames it. SLAM is where Track B's geometry becomes a *running, persistent* estimate — the substrate the rest of Track D enriches with semantics and structure.",
        zh: "**SLAM**（同时定位与建图）面临一个悖论：要知道你在哪需要地图，但要建地图又需要知道你在哪。它由结构化流水线上的联合估计来求解：\n\n- **前端** —— 快、局部：逐帧跟踪特征/光度以估计增量运动（视觉里程计）并关联观测。\n- **后端** —— 慢、全局：优化累积的位姿与地图以保持一致（位姿图/光束法平差）。\n- **回环检测** —— 识别先前见过的地点，加入一个抵消累积**漂移**的约束，把轨迹拉回全局一致。\n\n这种前端/后端/回环的分解，几乎是每个 SLAM 系统的架构。漂移是核心大敌：逐帧小误差无界累积，只有全局优化加回环能驯服它。SLAM 是 Track B 的几何变成一个*运行中、持久*估计之处——也是 Track D 其余部分以语义与结构加以丰富的基底。",
      },
      keyTerms: [
        { term: "Drift", def: { en: "Unbounded accumulation of small incremental pose errors over time.", zh: "随时间无界累积的逐帧位姿小误差。" } },
        { term: "Loop closure", def: { en: "Recognizing a revisited place to add a global constraint that cancels drift.", zh: "识别重访地点以加入抵消漂移的全局约束。" } },
      ],
      checks: [
        {
          id: "D1-q1",
          prompt: { en: "Why does a front-end alone (visual odometry) inevitably drift?", zh: "为什么仅有前端（视觉里程计）必然漂移？" },
          answer: {
            en: "It estimates motion incrementally, frame-to-frame, and composes those estimates. Each step has small errors that accumulate without any global correction, so the trajectory slowly diverges from truth. Only a global back-end and loop closures, which add constraints linking distant times, can cancel this accumulation.",
            zh: "它逐帧增量估计运动并把这些估计相乘累加。每一步都有小误差，在没有全局校正下累积，于是轨迹缓慢偏离真值。只有全局后端与回环——加入连接远隔时刻的约束——才能抵消这种累积。",
          },
        },
        {
          id: "D1-q2",
          prompt: { en: "What does loop closure actually add to the optimization?", zh: "回环检测到底给优化加入了什么？" },
          answer: {
            en: "A constraint asserting that two poses (now and a much earlier visit to the same place) observe the same scene, so they must be geometrically consistent. Adding this edge to the pose graph forces the back-end to redistribute accumulated error around the whole loop, snapping the map back into global consistency.",
            zh: "一个约束，断言两个位姿（现在与很早一次对同一地点的访问）观测了同一场景，故必须几何一致。把这条边加入位姿图，迫使后端把累积误差沿整个回环重新分配，把地图拉回全局一致。",
          },
        },
        {
          id: "D1-q3",
          prompt: { en: "Why split SLAM into a fast local front-end and a slow global back-end?", zh: "为什么把 SLAM 分成快速局部的前端与缓慢全局的后端？" },
          answer: {
            en: "They have conflicting requirements. Tracking must run at frame rate to not lose the camera, so it stays local and cheap. Global consistency needs expensive optimization over many poses/points, too slow to do every frame. Separating them lets the front-end keep up in real time while the back-end refines in the background and periodically corrects the front-end's drift.",
            zh: "它们要求相互冲突。跟踪必须以帧率运行以免丢失相机，故保持局部而便宜。全局一致需要对许多位姿/点做昂贵优化，逐帧太慢。把它们分开，让前端实时跟上，后端在后台精修并周期性校正前端的漂移。",
          },
          hint: { en: "One must keep up with the camera every frame; the other can take its time. Why not both at once?", zh: "一个必须每帧跟上相机；另一个可以慢慢来。为什么不合二为一？" },
        },
        {
          id: "D1-q4",
          prompt: { en: "Loop closure depends on recognizing a revisited place. Why is that hard, and what happens if you get it wrong?", zh: "回环依赖识别重访的地点。为什么这很难？弄错了会怎样？" },
          answer: {
            en: "Perceptual aliasing: different places can look nearly identical (two similar corridors), and the same place looks different under new viewpoint/lighting. A false loop closure asserts a wrong constraint and the back-end warps the whole map to satisfy it — often catastrophically. So place recognition must be conservative; a wrong closure is worse than a missed one.",
            zh: "感知混叠：不同地点可能看起来几乎相同（两条相似走廊），而同一地点在新视角/光照下又显得不同。错误的回环断言一个错误约束，后端会扭曲整张地图去满足它——常是灾难性的。因此地点识别必须保守；错误的闭环比漏掉一个更糟。",
          },
          hint: { en: "Two identical-looking corridors — what if the system thinks they're the same place?", zh: "两条看起来一模一样的走廊——若系统以为它们是同一地点会怎样？" },
        },
      ],
      links: ["D2", "B3", "B2"],
      papers: [{ title: "ORB-SLAM: A Versatile and Accurate Monocular SLAM System", year: 2015 }],
    },
    {
      id: "D2",
      trackId: "D",
      index: 2,
      title: { en: "SLAM reuses Track B's geometry", zh: "SLAM 复用 Track B 的几何" },
      summary: {
        en: "PnP, triangulation, and bundle adjustment — the same kernel, now running online.",
        zh: "PnP、三角测量、光束法平差——同一个内核，如今在线运行。",
      },
      body: {
        en: "SLAM is not new geometry; it's Track B made **online and incremental**. Tracking the camera each frame is **PnP** (pose from 3D map points and their 2D detections). Adding new map points is **triangulation** across keyframes. Keeping it all consistent is **bundle adjustment** (here, a windowed or pose-graph variant for speed). The shared geometric kernel is exactly why Tracks B and D belong together.\n\nThe modern twist is **neural / dense SLAM**, which replaces sparse feature maps with learned dense representations — and increasingly with the implicit fields and Gaussians from Track B (e.g. NeRF-SLAM, Gaussian-SLAM). Now the 'map' is a renderable 3D model optimized live. The lesson: master classical geometry once, and both offline reconstruction and online SLAM are the same toolkit deployed under different time budgets.",
        zh: "SLAM 不是新几何，而是 Track B 的**在线、增量**版。每帧跟踪相机即 **PnP**（从 3D 地图点及其 2D 检测求位姿）。新增地图点即跨关键帧的**三角测量**。保持一切一致即**光束法平差**（这里为求快用窗口化或位姿图变体）。共享的几何内核，正是 Track B 与 D 同属一体的原因。\n\n现代转折是**神经/稠密 SLAM**，它用学到的稠密表示替代稀疏特征地图——并越来越多采用 Track B 的隐式场与高斯（如 NeRF-SLAM、Gaussian-SLAM）。此时「地图」是一个实时优化的可渲染 3D 模型。要义是：把经典几何学一次，离线重建与在线 SLAM 便是同一工具箱在不同时间预算下的部署。",
      },
      keyTerms: [
        { term: "Visual odometry", def: { en: "Frame-to-frame pose estimation via PnP/feature tracking.", zh: "经 PnP/特征跟踪的逐帧位姿估计。" } },
        { term: "Neural / dense SLAM", def: { en: "SLAM whose map is a learned dense field (NeRF/Gaussian), optimized live.", zh: "地图为学到的稠密场（NeRF/高斯）、实时优化的 SLAM。" } },
      ],
      checks: [
        {
          id: "D2-q1",
          prompt: { en: "Map each SLAM step to its Track B operation: tracking, mapping, consistency.", zh: "把每个 SLAM 步骤对应到其 Track B 操作：跟踪、建图、一致性。" },
          answer: {
            en: "Tracking the camera each frame = PnP (pose from known 3D points ↔ 2D observations). Mapping new geometry = triangulation across keyframes. Keeping poses+points consistent = bundle adjustment (windowed/pose-graph online). SLAM is these three classical operations run incrementally under a time budget.",
            zh: "每帧跟踪相机 = PnP（从已知 3D 点 ↔ 2D 观测求位姿）。建新几何 = 跨关键帧三角测量。保持位姿+点一致 = 光束法平差（在线窗口化/位姿图）。SLAM 就是这三个经典操作在时间预算下增量运行。",
          },
        },
        {
          id: "D2-q2",
          prompt: { en: "What does a neural/Gaussian SLAM gain by making the map a renderable field?", zh: "神经/高斯 SLAM 把地图做成可渲染场，得到了什么？" },
          answer: {
            en: "A dense, photometric, gap-filling map you can render from novel views — enabling dense tracking against the model, hole-free reconstruction, and direct downstream use (e.g. semantics, simulation). It unifies localization and high-fidelity reconstruction in one live-optimized representation instead of a sparse landmark cloud.",
            zh: "一张稠密、光度、可补洞的地图，可从新视角渲染——支持对模型的稠密跟踪、无洞重建，以及直接的下游用途（如语义、模拟）。它把定位与高保真重建统一进一个实时优化的表示，而非稀疏地标点云。",
          },
        },
        {
          id: "D2-q3",
          prompt: { en: "Classical sparse-feature SLAM vs neural/dense SLAM — what's the core trade-off?", zh: "经典稀疏特征 SLAM vs 神经/稠密 SLAM——核心权衡是什么？" },
          answer: {
            en: "Sparse SLAM tracks a few robust feature landmarks: fast, robust, low-memory, but the map is a holey point cloud with no surfaces. Neural/dense SLAM optimizes a full photometric field (NeRF/Gaussian): a complete, renderable, gap-filled map useful downstream, but heavier, GPU-hungry, and historically less robust to fast motion. Coverage and fidelity vs speed and robustness.",
            zh: "稀疏 SLAM 跟踪少数鲁棒的特征地标：快、鲁棒、低内存，但地图是带洞的点云、无表面。神经/稠密 SLAM 优化完整的光度场（NeRF/高斯）：完整、可渲染、补洞的地图，下游有用，但更重、吃 GPU、且历来对快速运动更不鲁棒。覆盖与保真 vs 速度与鲁棒。",
          },
          hint: { en: "A handful of robust landmarks vs a full dense surface — what does each cost and give?", zh: "一把鲁棒的地标 vs 一整张稠密表面——各自的代价与收益是什么？" },
        },
        {
          id: "D2-q4",
          prompt: { en: "If SLAM is 'the same toolkit as offline SfM under a different time budget,' what concretely must change to run online?", zh: "若 SLAM 是「与离线 SfM 同一工具箱、只是时间预算不同」，在线运行具体须改什么？" },
          answer: {
            en: "You can't re-optimize all frames every step. So: select sparse keyframes instead of using every frame, run windowed/local BA (or a pose graph) rather than global BA each step, do place recognition + loop closure to inject occasional global corrections, and bound memory via marginalization or submaps. Same math, restructured to meet a real-time, bounded-compute budget.",
            zh: "你无法每一步都重优化所有帧。于是：选稀疏关键帧而非用每一帧、跑窗口化/局部 BA（或位姿图）而非每步全局 BA、用地点识别+回环注入偶发的全局校正、并经边缘化或子地图界定内存。同一套数学，被重构以满足实时、有界算力的预算。",
          },
          hint: { en: "You can't run global bundle adjustment over every frame in real time — what do you do instead?", zh: "你无法实时对每一帧跑全局光束法平差——那你改怎么做？" },
        },
      ],
      links: ["B3", "B5", "D3"],
      papers: [{ title: "iMAP: Implicit Mapping and Positioning in Real-Time", year: 2021 }],
    },
    {
      id: "D3",
      trackId: "D",
      index: 3,
      title: { en: "TSDF fusion & submaps", zh: "TSDF 融合与子地图" },
      summary: {
        en: "Fuse many noisy depth maps into one clean surface via truncated signed distances and weighted averaging.",
        zh: "经截断符号距离与加权平均，把许多含噪深度图融合成一张干净表面。",
      },
      body: {
        en: "How do you turn a stream of noisy depth maps into a single coherent surface? **TSDF fusion.** A **TSDF** is the SDF of Track B (Lesson 4), *truncated* to a thin band near the surface (clamped to ±1 far away). Store it in a voxel grid; for each new depth frame, update each near-surface voxel by **weighted averaging** its signed distance. The surface is the zero level-set, extracted with **Marching Cubes**.\n\nTruncation buys three things: storage (only store near surfaces), **robust denoising** (averaging in the band cancels per-frame noise — multi-frame fusion is the recurring trick), and easy surface extraction. For large scenes you tile the world into **submaps** that are independently consistent and later aligned, bounding drift and memory. TSDF fusion is the geometric backbone onto which the next lesson grafts *semantics*.",
        zh: "如何把一串含噪深度图变成单一连贯的表面？**TSDF 融合。** **TSDF** 是 Track B（第 4 课）的 SDF，被*截断*到表面附近的薄带（远处钳为 ±1）。把它存进体素网格；对每个新深度帧，用**加权平均**更新每个近表面体素的符号距离。表面是零等值面，用 **Marching Cubes** 提取。\n\n截断买来三样东西：存储（只存近表面）、**鲁棒去噪**（在带内平均抵消逐帧噪声——多帧融合是反复出现的技巧）、以及易于的表面提取。对大场景，把世界切成**子地图（submap）**，各自独立一致、之后对齐，从而界定漂移与内存。TSDF 融合是几何主干，下一课在其上嫁接*语义*。",
      },
      keyTerms: [
        { term: "TSDF fusion", def: { en: "Weighted-averaging truncated signed distances across depth frames.", zh: "跨深度帧对截断符号距离做加权平均。" } },
        { term: "Submap", def: { en: "A locally-consistent map tile, aligned to others to bound drift/memory.", zh: "局部一致的地图块，与他者对齐以界定漂移/内存。" } },
      ],
      checks: [
        {
          id: "D3-q1",
          prompt: { en: "How does TSDF fusion denoise depth, and which recurring idea is this?", zh: "TSDF 融合如何对深度去噪，这是哪个反复出现的想法？" },
          answer: {
            en: "Each voxel's signed distance is a weighted average over many frames that observe it; independent per-frame noise cancels while the true surface reinforces. This is the same 'multi-frame fusion denoising' idea that recurs in semantic mapping (next lesson) — redundancy across observations corrects single-frame error.",
            zh: "每个体素的符号距离是观测它的众多帧上的加权平均；独立的逐帧噪声相消，而真实表面被强化。这与语义建图（下一课）中反复出现的「多帧融合去噪」是同一想法——观测间的冗余纠正单帧误差。",
          },
        },
        {
          id: "D3-q2",
          prompt: { en: "Why truncate the SDF instead of storing full distances everywhere?", zh: "为什么截断 SDF，而不是处处存储完整距离？" },
          answer: {
            en: "Only the thin band near the surface matters for extracting geometry and fusing depth; far-away distances are irrelevant and would waste memory and computation. Truncating to a band stores just the useful region, makes fusion local and cheap, and still pins the zero level-set exactly.",
            zh: "只有表面附近的薄带对提取几何和融合深度重要；远处距离无关，存储它们会浪费内存与计算。截断到一个带只存有用区域，使融合局部而便宜，且仍精确确定零等值面。",
          },
        },
        {
          id: "D3-q3",
          prompt: { en: "Why tile a large scene into submaps instead of one global TSDF grid?", zh: "为什么把大场景切成子地图，而非一张全局 TSDF 网格？" },
          answer: {
            en: "A single grid covering a whole building wastes memory on empty space and, worse, can't be corrected after loop closure — if the trajectory shifts, every baked voxel is wrong. Submaps are each locally consistent and rigidly attached to a keyframe pose; when the back-end updates poses (loop closure), you just move the submaps, bounding both memory and the cost of staying drift-consistent.",
            zh: "覆盖整栋楼的单一网格在空白空间浪费内存，更糟的是回环后无法校正——若轨迹移动，每个已烘焙的体素都错了。子地图各自局部一致并刚性附着到某关键帧位姿；当后端更新位姿（回环）时，你只需移动子地图，从而界定内存与保持漂移一致的代价。",
          },
          hint: { en: "After a loop closure shifts the trajectory, can you re-bend one giant baked grid?", zh: "当回环使轨迹移动后，你能把一张已烘焙的巨大网格重新弯折吗？" },
        },
        {
          id: "D3-q4",
          prompt: { en: "In TSDF fusion each voxel keeps a weight, not just a distance. What is that weight for?", zh: "TSDF 融合中每个体素保留一个权重，而非只有距离。这个权重做什么用？" },
          answer: {
            en: "It accumulates confidence: each new measurement updates the running average in proportion to its reliability (depth is noisier far away or at grazing angles), so trustworthy observations count more. Weights also let you down-weight or forget old/uncertain data and handle dynamic content — the average isn't naive, it's confidence-weighted.",
            zh: "它累积置信度：每个新测量按其可靠性（深度在远处或掠射角更含噪）成比例更新滑动平均，于是可信观测占更大权重。权重还让你能降权或遗忘旧/不确定的数据并处理动态内容——这个平均不是朴素的，而是置信度加权的。",
          },
          hint: { en: "Is a depth reading from 5 m away as trustworthy as one from 0.5 m?", zh: "5 米外的深度读数和 0.5 米处的一样可信吗？" },
        },
      ],
      links: ["B4", "D2", "D4"],
      papers: [{ title: "KinectFusion: Real-Time Dense Surface Mapping and Tracking", year: 2011 }],
    },
    {
      id: "D4",
      trackId: "D",
      index: 4,
      title: { en: "Semantic & open-vocabulary mapping", zh: "语义与开放词汇建图" },
      summary: {
        en: "Fuse 2D semantics into the 3D map; with CLIP features the map answers language queries.",
        zh: "把 2D 语义融合进 3D 地图；有了 CLIP 特征，地图能回答语言查询。",
      },
      body: {
        en: "A geometric map knows *shape*; a **semantic map** also knows *what things are*. The recipe reuses TSDF's trick: run 2D segmentation per frame, then **fuse the labels into 3D** by storing, per voxel/point/Gaussian, a **class probability distribution** updated by multi-frame Bayesian fusion. Because 3D fusion pools many views, it corrects 2D errors that flicker frame-to-frame — *the same multi-frame denoising idea, now on semantics.* Store distributions (not a single label) so uncertainty survives until evidence resolves it.\n\nThe 2022–23 leap is **open-vocabulary** semantics: instead of a fixed label set, attach **CLIP features** to map elements. Now the map supports *language queries* ('the mug', 'something to sit on') for arbitrary concepts — the convergence of mapping with large vision-language models. Semantic Gaussian maps make this queryable and real-time. But a flat semantic map still lacks *relations* ('mug on the table') — the gap the next lesson fills with scene graphs.",
        zh: "几何地图知道*形状*；**语义地图**还知道*东西是什么*。配方复用 TSDF 的技巧：逐帧跑 2D 分割，然后把标签**融合进 3D**——为每个体素/点/高斯存一个**类别概率分布**，经多帧贝叶斯融合更新。因为 3D 融合汇聚多视角，它纠正逐帧闪烁的 2D 错误——*同一个多帧去噪想法，如今用在语义上。* 存分布（而非单一标签），让不确定性保留到证据消解它。\n\n2022–23 的飞跃是**开放词汇**语义：不再用固定标签集，而给地图元素附加 **CLIP 特征**。如今地图支持对任意概念的*语言查询*（「那个杯子」「能坐的东西」）——建图与大型视觉-语言模型的合流。语义高斯地图让它可查询且实时。但扁平语义地图仍缺*关系*（「杯子在桌上」）——这正是下一课用场景图填补的缺口。",
      },
      keyTerms: [
        { term: "Open-vocabulary mapping", def: { en: "Attaching CLIP-style features so the map answers arbitrary language queries.", zh: "附加 CLIP 式特征，使地图能回答任意语言查询。" } },
        { term: "Bayesian label fusion", def: { en: "Updating per-element class probabilities across frames.", zh: "跨帧更新每个元素的类别概率。" } },
      ],
      checks: [
        {
          id: "D4-q1",
          prompt: { en: "Why store a class probability distribution per map element instead of a single label?", zh: "为什么为每个地图元素存类别概率分布，而非单一标签？" },
          answer: {
            en: "Single labels can't be fused or revised: an early wrong guess is locked in. A distribution supports multi-frame Bayesian fusion — each view updates the belief, uncertainty is preserved until evidence resolves it, and conflicting observations are combined rather than overwritten, yielding far more robust 3D semantics.",
            zh: "单一标签无法融合或修正：早期的错误猜测被锁死。分布支持多帧贝叶斯融合——每个视角更新信念，不确定性保留到证据消解，冲突的观测被合并而非覆盖，产出鲁棒得多的 3D 语义。",
          },
        },
        {
          id: "D4-q2",
          prompt: { en: "What does using CLIP features (open-vocabulary) unlock over a fixed label set?", zh: "使用 CLIP 特征（开放词汇）相比固定标签集，解锁了什么？" },
          answer: {
            en: "Queries for arbitrary concepts not in any training label set — 'a mug', 'something to sit on', 'the red thing' — by matching language to the map's CLIP features. It turns the map into a language-addressable index of the scene, bridging 3D geometry and natural language / LLMs.",
            zh: "可查询任何训练标签集里没有的概念——「一个杯子」「能坐的东西」「红色的那个」——靠把语言与地图的 CLIP 特征匹配。它把地图变成场景的语言可寻址索引，连接 3D 几何与自然语言/LLM。",
          },
        },
        {
          id: "D4-q3",
          prompt: { en: "How does fusing semantics into 3D fix 2D segmentation errors that flicker frame-to-frame?", zh: "把语义融合进 3D，如何修正逐帧闪烁的 2D 分割错误？" },
          answer: {
            en: "Each 3D element pools predictions from many views; an occasional wrong or flickering 2D label is outvoted by the majority of correct observations through Bayesian fusion. It's the exact multi-frame denoising of TSDF fusion (D3) applied to labels instead of geometry — redundancy across views corrects single-frame error.",
            zh: "每个 3D 元素汇聚来自多个视角的预测；偶发的错误或闪烁的 2D 标签会被多数正确观测经贝叶斯融合压过。这正是 TSDF 融合（D3）的多帧去噪，只是用在标签而非几何上——视角间的冗余纠正单帧误差。",
          },
          hint: { en: "One bad frame vs twenty good views all voting on the same voxel — who wins?", zh: "一个坏帧 vs 二十个好视角，都为同一体素投票——谁赢？" },
        },
        {
          id: "D4-q4",
          prompt: { en: "A flat semantic map has 'mug' and 'table' labels. Why can't it answer 'is the mug on the table?'", zh: "扁平语义地图有「杯子」和「桌子」标签。为什么它回答不了「杯子在桌上吗？」" },
          answer: {
            en: "Labels mark what is where, but the relation 'on' is an edge between two entities, which a flat per-element map doesn't store. You'd have to recompute geometry every query and you have no notion of object instances/relations. Encoding relations explicitly is exactly what the next lesson's scene graph adds.",
            zh: "标签标记了什么在哪，但「在…上」这个关系是两个实体间的一条边，扁平的逐元素地图并不存储它。你得在每次查询时重算几何，且没有物体实例/关系的概念。显式编码关系，正是下一课场景图所添加的。",
          },
          hint: { en: "'On' is a relationship between two things — does a per-voxel label store relationships?", zh: "「在…上」是两个事物之间的关系——逐体素标签会存储关系吗？" },
        },
      ],
      links: ["D3", "B7", "D5"],
      papers: [{ title: "OpenScene / LERF: Open-Vocabulary 3D Scene Understanding", year: 2023 }],
    },
    {
      id: "D5",
      trackId: "D",
      index: 5,
      title: { en: "3D scene graphs", zh: "三维场景图" },
      summary: {
        en: "Upgrade the flat map to nodes (objects) + edges (relations), organized hierarchically.",
        zh: "把扁平地图升级为节点（物体）+ 边（关系），并分层组织。",
      },
      body: {
        en: "A semantic map lists *what* is present but not how things *relate*. A **3D scene graph** makes structure explicit: **nodes** are objects (and places), **edges** are relations ('on', 'next to', 'inside'). Crucially it is **hierarchical** — objects belong to rooms, rooms to floors, floors to a building — so you can reason at the right level of abstraction and query 'is the mug in the kitchen?' without scanning every voxel.\n\nThis is the leap from a *pixel/voxel* representation to a *symbolic, relational* one. It compresses a dense map into a compact graph that is directly consumable by planners and language models — you can hand a scene graph to an LLM far more easily than a point cloud. Scene graphs are the hinge between geometric mapping and the spatial *reasoning* of the next lesson: relations are what reasoning operates on.",
        zh: "语义地图列出*有什么*，但不说事物如何*关联*。**3D 场景图**把结构显式化：**节点**是物体（与地点），**边**是关系（「在…上」「在…旁」「在…内」）。关键在于它是**分层的**——物体属于房间，房间属于楼层，楼层属于建筑——因此你能在恰当的抽象层级推理，查询「杯子在厨房吗？」而无需扫描每个体素。\n\n这是从*像素/体素*表示到*符号、关系*表示的飞跃。它把稠密地图压缩成一张紧凑图，可被规划器与语言模型直接消费——把场景图交给 LLM 远比交点云容易。场景图是几何建图与下一课空间*推理*之间的枢纽：关系正是推理所作用的对象。",
      },
      keyTerms: [
        { term: "Scene graph", def: { en: "Objects as nodes, relations as edges; an explicit relational scene model.", zh: "物体为节点，关系为边；显式的关系式场景模型。" } },
        { term: "Hierarchical organization", def: { en: "Objects → rooms → floors → building, for multi-scale reasoning.", zh: "物体 → 房间 → 楼层 → 建筑，用于多尺度推理。" } },
      ],
      checks: [
        {
          id: "D5-q1",
          prompt: { en: "What can a scene graph express that a flat semantic map cannot?", zh: "场景图能表达而扁平语义地图不能的是什么？" },
          answer: {
            en: "Relations between entities — 'the mug is on the table', 'the chair is next to the desk' — and hierarchy (this object is in this room on this floor). A flat map only says which labels exist where; the graph encodes the relational and structural organization that reasoning and planning need.",
            zh: "实体间的关系——「杯子在桌上」「椅子在桌旁」——以及层级（该物体在该房间该楼层）。扁平地图只说哪些标签在哪；图编码了推理与规划所需的关系与结构组织。",
          },
        },
        {
          id: "D5-q2",
          prompt: { en: "Why is a scene graph more convenient than a point cloud for an LLM-based planner?", zh: "为什么对基于 LLM 的规划器，场景图比点云更方便？" },
          answer: {
            en: "It's compact, symbolic, and relational — close to language. An LLM can read 'mug on table in kitchen' directly and reason about it, whereas a raw point cloud is huge, unstructured, and not natively interpretable. The graph is the right interface between geometric perception and symbolic/language reasoning.",
            zh: "它紧凑、符号化、关系化——接近语言。LLM 能直接读「厨房桌上的杯子」并据此推理，而原始点云庞大、无结构、并非天然可解释。图是几何感知与符号/语言推理之间恰当的接口。",
          },
        },
        {
          id: "D5-q3",
          prompt: { en: "Why is the hierarchy (object → room → floor → building) important, not just the object–relation edges?", zh: "为什么层级（物体 → 房间 → 楼层 → 建筑）很重要，而不只是物体–关系的边？" },
          answer: {
            en: "Hierarchy lets you reason and query at the right level of abstraction: 'is the mug in the kitchen?' is answered by traversing object→room links, without scanning millions of voxels. It also scales — you plan over rooms/floors for long-range navigation and drop to objects only where needed — matching the multi-scale structure of real environments.",
            zh: "层级让你在恰当的抽象层级推理与查询：「杯子在厨房吗？」靠遍历物体→房间的链接即可回答，无需扫描数百万体素。它也可扩展——长程导航在房间/楼层层面规划，只在需要处下降到物体——契合真实环境的多尺度结构。",
          },
          hint: { en: "To check if the mug is in the kitchen, would you rather scan voxels or follow one link?", zh: "要检查杯子在不在厨房，你愿意扫描体素，还是只跟一条链接？" },
        },
        {
          id: "D5-q4",
          prompt: { en: "Going from a voxel map to a symbolic scene graph is a big abstraction. What's the price?", zh: "从体素地图走到符号场景图是一次大抽象。代价是什么？" },
          answer: {
            en: "You gain compactness, relations, and planner/LLM-readability; you lose precise sub-object geometry and free-space detail, and you become dependent on correct object detection and relation extraction. A wrong node/edge silently corrupts all downstream reasoning. The graph is only as good as the perception that builds it — which is why systems keep a geometric layer alongside it.",
            zh: "你获得紧凑性、关系与对规划器/LLM 的可读性；你失去精确的子物体几何与自由空间细节，并变得依赖正确的物体检测与关系抽取。一个错误的节点/边会悄悄污染所有下游推理。图的好坏只取决于构建它的感知——这正是系统在其旁保留几何层的原因。",
          },
          hint: { en: "If a detector mislabels a node, what happens to every query that uses it?", zh: "若检测器给一个节点贴错标签，用到它的每个查询会怎样？" },
        },
      ],
      links: ["D4", "D6", "D7"],
      papers: [{ title: "3D Scene Graph: A Structure for Unified Semantics, 3D Space, and Camera", year: 2019 }],
    },
    {
      id: "D6",
      trackId: "D",
      index: 6,
      title: { en: "Object-centric vs space-centric", zh: "物体中心 vs 空间中心" },
      summary: {
        en: "Two ways to carve a scene — around things or around space — each with distinct strengths.",
        zh: "划分场景的两种方式——围绕物体或围绕空间——各有所长。",
      },
      body: {
        en: "Representations split along a fundamental axis. **Space-centric** maps (voxels, TSDF, occupancy grids, NeRF fields) tile *space itself* — great for navigation, collision, and free-space queries, but they don't 'know' about objects. **Object-centric** maps (scene graphs, object databases) organize around *things* — great for manipulation, relational reasoning, and language, but they abstract away precise free space.\n\nThe trade-off is real and there's no free lunch: dense space models give geometric completeness at high cost and low abstraction; object models give compact, queryable structure but depend on detection and lose sub-object geometry. Mature systems are **hybrid** — a metric space layer for where-can-I-go, an object/graph layer for what-and-how. Knowing which representation a task needs is a core design skill; it directly shapes what reasoning (next lesson) is even possible.",
        zh: "表示沿一条根本轴分裂。**空间中心**地图（体素、TSDF、占据栅格、NeRF 场）平铺*空间本身*——擅长导航、碰撞、自由空间查询，但它们不「知道」物体。**物体中心**地图（场景图、物体数据库）围绕*事物*组织——擅长操作、关系推理与语言，但抽象掉了精确的自由空间。\n\n这一权衡是真实的，没有免费午餐：稠密空间模型以高代价、低抽象给出几何完整性；物体模型给出紧凑、可查询的结构，却依赖检测并丢失子物体几何。成熟系统是**混合**的——一个度量空间层回答我能去哪，一个物体/图层回答是什么、怎么做。知道任务需要哪种表示是核心设计技能；它直接塑造了下一课的推理是否可能。",
      },
      keyTerms: [
        { term: "Space-centric", def: { en: "Tiling space (voxels/TSDF/occupancy) — geometry & navigation.", zh: "平铺空间（体素/TSDF/占据）——几何与导航。" } },
        { term: "Object-centric", def: { en: "Organizing around objects (graphs/DB) — relations & language.", zh: "围绕物体组织（图/数据库）——关系与语言。" } },
      ],
      checks: [
        {
          id: "D6-q1",
          prompt: { en: "A robot must navigate around furniture without hitting it. Which representation, and why?", zh: "机器人须绕过家具而不撞到。用哪种表示，为什么？" },
          answer: {
            en: "Space-centric (occupancy/TSDF): collision-free navigation needs to know which space is free vs occupied at metric precision everywhere, including gaps and partial obstacles. An object graph abstracts away exact free space and sub-object geometry, so it can't guarantee clearance the way a dense space map can.",
            zh: "空间中心（占据/TSDF）：无碰撞导航需要在处处以度量精度知道哪里空、哪里被占据，包括缝隙与部分障碍。物体图抽象掉了精确自由空间与子物体几何，无法像稠密空间地图那样保证间隙。",
          },
        },
        {
          id: "D6-q2",
          prompt: { en: "Why do mature systems combine both representations rather than pick one?", zh: "为什么成熟系统结合两种表示，而非二选一？" },
          answer: {
            en: "The two strengths are complementary and non-overlapping: you need metric free-space for navigation/collision and a compact relational/object layer for manipulation, reasoning, and language. No single representation does both well, so a hybrid keeps a space layer and an object/graph layer linked, querying whichever suits the task.",
            zh: "两者的长处互补且不重叠：导航/碰撞需要度量自由空间，操作、推理与语言需要紧凑的关系/物体层。没有单一表示能两者兼优，故混合系统保留相互链接的空间层与物体/图层，按任务查询合适的一个。",
          },
        },
        {
          id: "D6-q3",
          prompt: { en: "'Pick up the red mug next to the kettle.' Which representation suits this, and why?", zh: "「拿起水壶旁边的红杯子。」哪种表示适合，为什么？" },
          answer: {
            en: "Object-centric (scene graph / object database): the task is about specific objects and their relations ('next to'), and the language refers to object attributes ('red mug'). A graph gives addressable object nodes with attributes and relational edges to resolve the reference, whereas a raw voxel grid has no notion of 'the mug' to grasp.",
            zh: "物体中心（场景图/物体数据库）：任务关乎特定物体及其关系（「旁边」），语言指向物体属性（「红杯子」）。图给出带属性的可寻址物体节点与关系边来消解指代，而原始体素网格没有「那个杯子」的概念可供抓取。",
          },
          hint: { en: "The task names a specific object and a relation — what represents those directly?", zh: "任务点名了一个特定物体和一个关系——什么能直接表示它们？" },
        },
        {
          id: "D6-q4",
          prompt: { en: "Name one question each representation answers *poorly*, and connect it to 'representation determines reasoning.'", zh: "各举一个每种表示*答得差*的问题，并联系「表示决定推理」。" },
          answer: {
            en: "A space-centric grid answers 'is the mug on the table?' poorly — it has no objects or relations. An object graph answers 'is there a clear 30 cm gap here?' poorly — it abstracts away precise free space. Each representation bounds the inferences available, which is exactly why the next lesson frames reasoning as downstream of representation.",
            zh: "空间中心网格答不好「杯子在桌上吗？」——它没有物体或关系。物体图答不好「这里有 30 厘米的空隙吗？」——它抽象掉了精确自由空间。每种表示都界定了可用推断，这正是下一课把推理框定为表示之下游的原因。",
          },
          hint: { en: "What can't a voxel grid say about objects, and what can't an object graph say about gaps?", zh: "体素网格说不出物体的什么？物体图又说不出空隙的什么？" },
        },
      ],
      links: ["D3", "D5", "D7"],
      papers: [{ title: "Hydra: A Real-time Spatial Perception System for 3D Scene Graph Construction", year: 2022 }],
    },
    {
      id: "D7",
      trackId: "D",
      index: 7,
      title: { en: "Spatial reasoning", zh: "空间推理" },
      summary: {
        en: "Representation determines reasoning — and reference frames decide what a query even means.",
        zh: "表示决定推理——而参照系决定一个查询究竟意味着什么。",
      },
      body: {
        en: "With a structured map, the agent can **reason** about space — but *what* it can reason about is fixed by the representation. \"Is the cup reachable?\" needs metric geometry; \"is the cup on the table?\" needs a relational graph; \"bring me something to drink from\" needs open-vocabulary semantics. **Representation determines reasoning** — the through-line of Track D.\n\nA second subtlety: **reference frames**. \"Left of the chair\" is ambiguous — left from whose viewpoint, the speaker's or the chair's (egocentric vs allocentric, intrinsic vs relative frames)? Robust spatial reasoning must commit to a frame, which ties directly back to the rotation/coordinate care of Track A (Lesson 6) and the camera poses of Track B. The frontier is **LLM + scene graph**: feed the symbolic graph to a language model so it answers spatial questions and decomposes goals into steps grounded in the actual scene — perception meeting language-level reasoning.",
        zh: "有了结构化地图，智能体便能对空间**推理**——但它*能*推理什么，由表示固定。「杯子够得到吗？」需要度量几何；「杯子在桌上吗？」需要关系图；「给我拿能喝水的东西」需要开放词汇语义。**表示决定推理**——这是 Track D 的主线。\n\n第二个微妙处：**参照系**。「椅子左边」是有歧义的——从谁的视角看左，说话者的还是椅子的（自我中心 vs 他者中心，内在 vs 相对参照系）？鲁棒的空间推理必须确定一个参照系，这直接回到 Track A（第 6 课）的旋转/坐标讲究与 Track B 的相机位姿。前沿是 **LLM + 场景图**：把符号图喂给语言模型，让它回答空间问题，并把目标分解为落地于真实场景的步骤——感知与语言级推理的相遇。",
      },
      keyTerms: [
        { term: "Reference frame", def: { en: "Egocentric/allocentric, intrinsic/relative — the viewpoint a spatial term assumes.", zh: "自我中心/他者中心、内在/相对——一个空间词所设定的视角。" } },
        { term: "Representation→reasoning", def: { en: "What you can infer is bounded by how the scene is represented.", zh: "你能推断什么，受限于场景如何被表示。" } },
      ],
      checks: [
        {
          id: "D7-q1",
          prompt: { en: "Explain 'representation determines reasoning' with two queries needing different representations.", zh: "用两个需要不同表示的查询，解释「表示决定推理」。" },
          answer: {
            en: "'Can I walk to the door?' needs a metric/space-centric map (free space, distances). 'Is the book on the shelf?' needs a relational scene graph (objects + 'on' edges). Neither representation can answer the other's question well, so the representation you build literally bounds the set of inferences available.",
            zh: "「我能走到门口吗？」需要度量/空间中心地图（自由空间、距离）。「书在架子上吗？」需要关系场景图（物体 + 「在…上」边）。任一表示都无法很好回答另一个的问题，故你构建的表示，实实在在地界定了可用推断的集合。",
          },
        },
        {
          id: "D7-q2",
          prompt: { en: "Why must a spatial reasoner commit to a reference frame, and how does this link to Track A/B?", zh: "为什么空间推理器必须确定参照系，这如何关联到 Track A/B？" },
          answer: {
            en: "'Left of the chair' or 'in front' is undefined without a viewpoint (speaker vs object, egocentric vs allocentric); the same words denote different locations under different frames. Committing to a frame is the same coordinate/rotation discipline as Track A's local-vs-global joint frames and Track B's camera extrinsics — frames are everywhere geometry meets meaning.",
            zh: "「椅子左边」或「前面」在没有视角时未定义（说话者 vs 物体，自我 vs 他者中心）；同样的词在不同参照系下指不同位置。确定参照系，与 Track A 的局部 vs 全局关节系、Track B 的相机外参是同一套坐标/旋转纪律——凡几何遇见意义之处，皆有参照系。",
          },
        },
        {
          id: "D7-q3",
          prompt: { en: "The frontier is LLM + scene graph. Why feed a symbolic graph to a language model rather than raw perception?", zh: "前沿是 LLM + 场景图。为什么把符号图喂给语言模型，而非原始感知？" },
          answer: {
            en: "LLMs reason over symbols and text, not point clouds. A scene graph is already compact, relational, and language-like, so the model can read 'mug on table in kitchen', answer spatial questions, and decompose a goal ('make coffee') into steps grounded in the actual objects present. The graph is the interface that makes perception consumable by language-level reasoning.",
            zh: "LLM 在符号与文本上推理，而非点云。场景图本就紧凑、关系化、类语言，故模型能读「厨房桌上的杯子」、回答空间问题，并把目标（「冲咖啡」）分解为落地于实际在场物体的步骤。图是让感知可被语言级推理消费的接口。",
          },
          hint: { en: "Can an LLM read a point cloud? What form does it actually consume?", zh: "LLM 能读点云吗？它实际消费的是什么形式？" },
        },
        {
          id: "D7-q4",
          prompt: { en: "Give a concrete case where egocentric and allocentric frames give different answers, and why the agent must convert between them.", zh: "举一个自我中心与他者中心参照系给出不同答案的具体例子，并说明智能体为何必须在二者间转换。" },
          answer: {
            en: "'The cup is to my left' (egocentric, the speaker's view) can be to the right of a robot facing the speaker, or on a different side from the cup's own intrinsic 'left'. To act on a human instruction the agent must convert the speaker's egocentric frame into its own and into world/allocentric coordinates — otherwise it reaches the wrong way. Frame conversion is the bridge from language to action.",
            zh: "「杯子在我左边」（自我中心，说话者视角）对面对说话者的机器人可能是在右边，或与杯子自身内在的「左边」不同侧。要执行人类指令，智能体必须把说话者的自我中心系转换到自己的、再到世界/他者中心坐标——否则会朝错误方向伸手。参照系转换是从语言到行动的桥梁。",
          },
          hint: { en: "'On my left' from the speaker's view — is that the same side for a robot facing them?", zh: "从说话者视角的「我左边」——对面对他的机器人是同一侧吗？" },
        },
      ],
      links: ["D5", "A6", "D8"],
      papers: [{ title: "SayPlan / LLM-grounded planning over 3D scene graphs", year: 2023 }],
    },
    {
      id: "D8",
      trackId: "D",
      index: 8,
      title: { en: "World models", zh: "世界模型" },
      summary: {
        en: "Turn the map into a predictive simulator and close the perception–prediction–planning–action loop.",
        zh: "把地图变成可预测的模拟器，闭合感知–预测–规划–行动回路。",
      },
      body: {
        en: "A map is static memory; a **world model** is a *predictive simulator*. It learns the dynamics of the environment so the agent can ask 'what happens if I act?' and roll the future forward internally. This upgrades the map from a record of the past into a tool for imagining and evaluating futures — planning by simulation.\n\nThe complete agent loop is **perception → prediction → planning → action**: perceive (Tracks A–C, D's mapping) to build state, predict with the world model, plan over imagined rollouts, act, and observe — closing the loop. This reframes everything prior: egocentric perception supplies state, 3D/4D reconstruction supplies geometry, scene graphs supply structure, and the world model adds *time and consequence*. Track C's episodic memory is literally a world model's memory; A's motion generation is its human-dynamics prior. The world model is where perception becomes agency.",
        zh: "地图是静态记忆；**世界模型**是*可预测的模拟器*。它学习环境的动力学，使智能体能问「如果我这样做会怎样？」并在内部把未来向前滚动。这把地图从过去的记录，升级为想象并评估未来的工具——以模拟来规划。\n\n完整的智能体回路是**感知 → 预测 → 规划 → 行动**：感知（Track A–C、D 的建图）以构建状态，用世界模型预测，在想象的滚动上规划，行动，再观测——闭合回路。这重新框定了此前一切：第一人称感知提供状态，3D/4D 重建提供几何，场景图提供结构，世界模型加入*时间与后果*。Track C 的情景记忆字面上就是世界模型的记忆；A 的运动生成是其人类动力学先验。世界模型是感知化为能动性之处。",
      },
      keyTerms: [
        { term: "World model", def: { en: "A learned predictive simulator of environment dynamics for planning.", zh: "用于规划的、对环境动力学的可学习预测模拟器。" } },
        { term: "Perception–prediction–planning–action", def: { en: "The closed agent loop tying all tracks together.", zh: "把所有赛道串起来的闭合智能体回路。" } },
      ],
      checks: [
        {
          id: "D8-q1",
          prompt: { en: "What does a world model add over a (semantic) map, and why does it enable planning?", zh: "世界模型相比（语义）地图增加了什么，为何它支持规划？" },
          answer: {
            en: "Dynamics: it predicts how the state changes under actions, not just what is currently there. That lets the agent simulate candidate action sequences internally ('imagine' rollouts), evaluate their outcomes, and choose — planning by forward prediction rather than acting blindly in the real world.",
            zh: "动力学：它预测状态在动作下如何变化，而不只是当前有什么。这让智能体在内部模拟候选动作序列（「想象」滚动）、评估其结果并选择——以前向预测来规划，而非在真实世界里盲目行动。",
          },
        },
        {
          id: "D8-q2",
          prompt: { en: "Place each track in the perception–prediction–planning–action loop.", zh: "把每条赛道放进感知–预测–规划–行动回路。" },
          answer: {
            en: "Perception: egocentric vision (C) and human modeling (A) read the agent and actors; 3D/4D reconstruction (B) and SLAM/semantic mapping (D1–5) build geometric+semantic state. Prediction: the world model (D8), with A's motion priors. Planning: spatial reasoning over scene graphs (D5–7). Action closes back to perception. Every track is one stage of one agent.",
            zh: "感知：第一人称视觉（C）与人体建模（A）读取智能体与行动者；3D/4D 重建（B）与 SLAM/语义建图（D1–5）构建几何+语义状态。预测：世界模型（D8），辅以 A 的运动先验。规划：在场景图上的空间推理（D5–7）。行动闭环回感知。每条赛道都是同一个智能体的一个阶段。",
          },
        },
        {
          id: "D8-q3",
          prompt: { en: "Why is planning by simulating imagined rollouts better than just acting in the real world to see what happens?", zh: "为什么以模拟想象的滚动来规划，胜过直接在真实世界里行动看结果？" },
          answer: {
            en: "Real actions are slow, irreversible, and sometimes dangerous; a world model lets the agent try many candidate plans internally — cheaply and safely — and keep only the best before committing. It's the difference between thinking before acting and trial-and-error in reality, essential when mistakes are costly (a robot, a vehicle).",
            zh: "真实动作慢、不可逆、有时危险；世界模型让智能体在内部廉价而安全地尝试许多候选计划，只保留最佳者再去执行。这是「行动前思考」与「在现实中试错」之别——当错误代价高昂时（机器人、车辆）至关重要。",
          },
          hint: { en: "Would you rather test a risky plan in your head or with the real robot?", zh: "你愿意在脑中测试一个有风险的计划，还是用真实机器人？" },
        },
        {
          id: "D8-q4",
          prompt: { en: "Why do world-model predictions degrade over long rollouts, and which earlier lesson's problem is this?", zh: "为什么世界模型的预测在长滚动上退化？这是此前哪一课的问题？" },
          answer: {
            en: "The model feeds its own predictions back as input, so each step's error becomes the next step's input error and compounds, drifting off the real distribution — the same unbounded error accumulation as SLAM drift (D1) and long-horizon motion generation (A7). Long rollouts need correction signals (re-observation), uncertainty modeling, or hierarchy to stay grounded.",
            zh: "模型把自己的预测作为输入回灌，于是每一步的误差成为下一步的输入误差并复合，漂移出真实分布——与 SLAM 漂移（D1）、长时程运动生成（A7）是同一种无界误差累积。长滚动需要校正信号（重新观测）、不确定性建模或层级结构来保持落地。",
          },
          hint: { en: "When you predict from your own predictions, what happens to errors? Where did you see this before?", zh: "当你从自己的预测再去预测，误差会怎样？你之前在哪见过？" },
        },
      ],
      links: ["D7", "C8", "A7"],
      papers: [{ title: "World Models (Ha & Schmidhuber)", year: 2018 }],
    },
    {
      id: "D9",
      trackId: "D",
      index: 9,
      title: { en: "Capstone: pixels to world memory", zh: "终极项目：从像素到世界记忆" },
      summary: {
        en: "Connect the whole curriculum: build a small (semantic) SLAM or scene-graph system end to end.",
        zh: "贯通整门课程：端到端搭一个小型（语义）SLAM 或场景图系统。",
      },
      body: {
        en: "The capstone wires the whole curriculum onto one sequence — pick a depth:\n\n**① Dense / neural SLAM.** Run NICE-SLAM (`cvg/nice-slam`) or SplaTAM on a Replica or TUM-RGB-D sequence; watch the live map build, the trajectory, and how loop closure curbs drift.\n\n**② Build a semantic map yourself.** From an RGB-D sequence: get poses (SLAM or COLMAP) → fuse depth into a TSDF with Open3D (`isl-org/Open3D`) → run per-frame 2D segmentation and Bayes-fuse the labels into the voxels → extract a coloured, labelled mesh with Marching Cubes.\n\n**③ 3D scene graph.** Run Hydra (`MIT-SPARK/Hydra`) on a sequence to build an object → room → building graph, then query it.\n\n**Deep-dive** your system and name the cross-track reuse it leans on — bundle adjustment ↔ SLAM back-end, SDF ↔ TSDF, CLIP ↔ open-vocabulary semantics. **Deliverable:** a queryable semantic map or scene graph built from raw frames — *pixels turned into world memory*. That web of connections, not any single method, is the difference between a researcher and a carrier of facts. From here, extend toward whatever frontier excites you: semantic neural SLAM, drivable digital humans, or 4D generative world models.",
        zh: "终极项目把整门课程接到一段序列上——挑一个深度：\n\n**① 稠密 / 神经 SLAM。** 在 Replica 或 TUM-RGB-D 序列上运行 NICE-SLAM（`cvg/nice-slam`）或 SplaTAM；观察地图实时构建、轨迹，以及回环如何抑制漂移。\n\n**② 亲手搭一张语义地图。** 用一段 RGB-D 序列：求位姿（SLAM 或 COLMAP）→ 用 Open3D（`isl-org/Open3D`）把深度融合进 TSDF → 逐帧做 2D 分割并把标签贝叶斯融合进体素 → 用 Marching Cubes 提取有色、带标签的网格。\n\n**③ 3D 场景图。** 在序列上运行 Hydra（`MIT-SPARK/Hydra`），构建物体 → 房间 → 建筑的图，然后查询它。\n\n**精读**你的系统，并指出它依赖的跨赛道复用——光束法平差 ↔ SLAM 后端、SDF ↔ TSDF、CLIP ↔ 开放词汇语义。**交付物：** 一张由原始帧构建、可查询的语义地图或场景图——*把像素变成世界记忆*。那张连接之网，而非任何单一方法，是研究者与事实搬运工的区别。从这里出发，朝任何令你兴奋的前沿扩展：语义神经 SLAM、可驱动数字人、或 4D 生成世界模型。",
      },
      keyTerms: [
        { term: "Integration", def: { en: "Wiring modules from all tracks into one working pipeline.", zh: "把各赛道的模块接成一个可运行的流水线。" } },
        { term: "World memory", def: { en: "A persistent, queryable semantic-geometric record of a scene.", zh: "对场景的持久、可查询的语义-几何记录。" } },
      ],
      checks: [
        {
          id: "D9-q1",
          prompt: { en: "Name three cross-track connections that show the curriculum is one system, not four.", zh: "举出三处跨赛道连接，说明课程是一个系统而非四个。" },
          answer: {
            en: "(1) The SDF underlies both Track B's NeRF geometry and Track D's TSDF fusion. (2) Track B's bundle adjustment is exactly Track D's SLAM back-end. (3) Track C's episodic memory is a world model's (D8) memory; and CLIP/LLMs bring language into A's, C's, and D's frontiers. The geometric kernel and the language layer are shared everywhere.",
            zh: "(1) SDF 同时支撑 Track B 的 NeRF 几何与 Track D 的 TSDF 融合。(2) Track B 的光束法平差正是 Track D 的 SLAM 后端。(3) Track C 的情景记忆就是世界模型（D8）的记忆；CLIP/LLM 把语言带进 A、C、D 的前沿。几何内核与语言层处处共享。",
          },
        },
        {
          id: "D9-q2",
          prompt: { en: "Outline the minimal honest pipeline from egocentric video to a queryable scene graph.", zh: "勾勒从第一人称视频到可查询场景图的最小诚实流水线。" },
          answer: {
            en: "Poses via SLAM/SfM (B3, D2) → fuse depth into a TSDF/Gaussian map (D3) → run per-frame 2D segmentation and Bayes-fuse labels (with CLIP features) into the 3D map (D4) → cluster into objects and infer relations to build a scene graph (D5) → query it in language. Start with one short sequence and a trusted metric before scaling.",
            zh: "经 SLAM/SfM 求位姿（B3、D2）→ 把深度融合进 TSDF/高斯地图（D3）→ 逐帧 2D 分割并把标签（带 CLIP 特征）贝叶斯融合进 3D 地图（D4）→ 聚类成物体并推断关系以建场景图（D5）→ 用语言查询它。先用一段短序列与可信指标，再扩展。",
          },
        },
        {
          id: "D9-q3",
          prompt: { en: "Why start the capstone with a trusted metric on one short sequence before scaling up?", zh: "为什么终极项目要先在一段短序列上得到可信指标，再扩展规模？" },
          answer: {
            en: "A multi-stage pipeline (poses → fusion → semantics → graph) has many places to fail silently; without a trusted measurement on a small, inspectable case you can't tell which stage is broken. Establishing a correct, measurable baseline first — the same discipline as the B9/C9 reproductions — means scaling adds data, not undiagnosable bugs.",
            zh: "多阶段流水线（位姿 → 融合 → 语义 → 图）有许多会无声失败的地方；没有在一个小而可检查的案例上的可信测量，你无法判断哪一阶段坏了。先建立一个正确、可测量的基线——与 B9/C9 复现同样的纪律——意味着扩展只是增加数据，而非无法诊断的 bug。",
          },
          hint: { en: "A four-stage pipeline can fail silently — how do you know which stage broke if you scale first?", zh: "四阶段流水线会无声失败——若你先扩展，怎么知道是哪一阶段坏了？" },
        },
        {
          id: "D9-q4",
          prompt: { en: "The capstone says the web of cross-track connections, not any single method, distinguishes a researcher. Why?", zh: "终极项目说，区分研究者的是跨赛道连接之网，而非任何单一方法。为什么？" },
          answer: {
            en: "Specific methods date quickly, but the shared principles — reprojection / analysis-by-synthesis, the SDF, multi-frame fusion, representation→reasoning — transfer across problems and let you recognize a new method as a variant of something you already understand. Seeing the connections is what lets you adapt to and invent within a fast-moving field, rather than re-learning each method as an isolated fact.",
            zh: "具体方法很快过时，但共享原则——重投影/分析合成、SDF、多帧融合、表示决定推理——可跨问题迁移，让你把新方法识别为你已理解之物的变体。看见连接，才让你能在快速演进的领域中适应并创造，而非把每个方法当孤立的事实重新学一遍。",
          },
          hint: { en: "Methods go out of date — what doesn't?", zh: "方法会过时——什么不会？" },
        },
      ],
      links: ["D8", "B9", "C9"],
      papers: [],
    },
  ],
};
