import type { Track } from "../types";

export const trackC: Track = {
  id: "C",
  title: { en: "Egocentric Vision & Interaction", zh: "第一人称视觉与交互" },
  subtitle: { en: "Seeing the world from inside the action", zh: "从动作内部看世界" },
  blurb: {
    en: "Wearable, first-person video: how to recognize what the camera-wearer is doing, where they look, and how their hands act on objects — the perceptual front-end of an embodied agent.",
    zh: "可穿戴的第一人称视频：如何识别相机佩戴者在做什么、看向哪里、双手如何操作物体——具身智能体的感知前端。",
  },
  focus: {
    en: "Egocentric action and intention understanding, hand–object interaction, gaze / attention modeling, and task-structure modeling.",
    zh: "第一人称动作与意图理解、手–物交互、注视 / 注意力建模，以及任务结构建模。",
  },
  background: {
    en: "Experience in video understanding, action recognition, or egocentric vision.",
    zh: "视频理解、动作识别或第一人称视觉方面的经验。",
  },
  accent: "#6a5ef0",
  lessons: [
    {
      id: "C1",
      trackId: "C",
      index: 1,
      title: { en: "What is egocentric vision?", zh: "什么是第一人称视觉？" },
      summary: {
        en: "First-person video shifts the camera into the actor's head — new constraints, new opportunities.",
        zh: "第一人称视频把相机搬进了行动者的头部——新的约束，也是新的机会。",
      },
      body: {
        en: "**Egocentric** (first-person) vision studies video captured by a camera worn on the body — usually the head. It contrasts with the **exocentric** (third-person) view most datasets use. The shift is not cosmetic: it changes the statistics of the data and the questions worth asking.\n\nThree properties define the egocentric setting:\n\n- **The camera moves with the actor.** There is heavy motion blur and constant viewpoint change; there is no fixed background to subtract. But camera motion now *encodes* the wearer's head movement and attention.\n- **Hands and objects dominate the frame.** The most informative pixels are near the center-bottom, where manipulation happens. Faces and full bodies are rare; hands are everywhere.\n- **Intent is latent but recoverable.** Because you see what the actor sees, gaze, reaching, and the sequence of grasped objects reveal *goals*, not just appearances.\n\nWhy it matters: egocentric video is the native input modality for AR glasses, wearable assistants, and humanoid/robot learning-from-demonstration. It is the bridge from passive recognition to **embodied** understanding — the through-line of this whole curriculum.",
        zh: "**第一人称（egocentric）视觉**研究由佩戴在身体（通常是头部）上的相机拍摄的视频，与大多数数据集采用的**第三人称（exocentric）**视角相对。这个转变不是表面文章：它改变了数据的统计特性，也改变了值得提出的问题。\n\n三条性质定义了第一人称设定：\n\n- **相机随行动者移动。** 存在大量运动模糊和持续的视角变化，没有固定背景可供扣除。但相机运动如今**编码**了佩戴者的头部运动与注意力。\n- **手与物体占据画面。** 信息量最大的像素集中在画面中下部，即操作发生的地方。人脸和全身少见，手则无处不在。\n- **意图是隐含但可恢复的。** 因为你看到行动者所看到的，注视、伸手、依次抓取的物体序列揭示了**目标**，而不仅是外观。\n\n为什么重要：第一人称视频是 AR 眼镜、可穿戴助手、人形/机器人示范学习的原生输入模态。它是从被动识别走向**具身**理解的桥梁——也是本课程贯穿始终的主线。",
      },
      keyTerms: [
        { term: "Egocentric / exocentric", def: { en: "First-person (head-worn) vs third-person (external) camera viewpoint.", zh: "第一人称（头戴）与第三人称（外部）相机视角。" } },
        { term: "Embodiment", def: { en: "Perception tied to an agent that acts; the camera is part of a body with goals.", zh: "与会行动的智能体绑定的感知；相机是有目标的身体的一部分。" } },
      ],
      checks: [
        {
          id: "C1-q1",
          prompt: { en: "Name two ways camera motion is *helpful* in egocentric video rather than just a nuisance.", zh: "举出第一人称视频中相机运动**有益**（而非仅是干扰）的两种方式。" },
          answer: {
            en: "(1) Head motion is a proxy for **attention/gaze direction** — where the head turns is roughly where the wearer attends. (2) The motion field encodes **ego-motion** (self-movement), which downstream stages reuse for SLAM/pose and for separating self-motion from object motion.",
            zh: "(1) 头部运动是**注意力/注视方向**的代理——头转向哪里，佩戴者大致就注意哪里。(2) 运动场编码了**自我运动（ego-motion）**，下游阶段可复用它做 SLAM/位姿，并把自我运动与物体运动区分开。",
          },
        },
        {
          id: "C1-q2",
          prompt: { en: "Why do third-person action models often transfer poorly to egocentric data?", zh: "为什么第三人称动作模型常常难以迁移到第一人称数据？" },
          answer: {
            en: "Their priors assume a visible full body and a roughly static background; egocentric video has neither. The discriminative signal moves to hands, manipulated objects, and short-horizon motion near the frame center, so features tuned for body pose and scene context underperform.",
            zh: "它们的先验假设可见的全身与大致静态的背景；第一人称视频两者皆无。判别信号转移到了手、被操作物体以及画面中心附近的短时程运动，因此为身体姿态和场景上下文调好的特征会表现不佳。",
          },
        },
        {
          id: "C1-q3",
          prompt: { en: "The most informative pixels cluster center-bottom (hands/manipulation). What does this imply for model and data design?", zh: "信息量最大的像素聚集在中下部（手/操作）。这对模型与数据设计意味着什么？" },
          answer: {
            en: "Spend capacity where the signal is: spatial attention or cropping toward the hand region, and augmentations that don't crop hands out of frame. Background-heavy global pooling wastes capacity on irrelevant scene; a head focused on the manipulation zone (e.g. via the active object) is more sample-efficient.",
            zh: "把容量花在信号所在之处：朝手部区域的空间注意力或裁剪，以及不会把手裁出画面的数据增强。偏重背景的全局池化把容量浪费在无关场景上；聚焦操作区（如借助活动物体）的头部更省样本。",
          },
          hint: { en: "If you know where the action is in the frame, where should the model look?", zh: "若你知道动作在画面里的位置，模型该往哪看？" },
        },
        {
          id: "C1-q4",
          prompt: { en: "Why is the egocentric viewpoint uniquely suited to recovering an actor's *goals*, not just their actions?", zh: "为什么第一人称视角尤其适合恢复行动者的*目标*，而不仅是动作？" },
          answer: {
            en: "You see roughly what the actor sees, so attention-revealing cues are directly observable: gaze fixations, reach direction, and the ordered sequence of grasped objects all expose the plan before it completes. A third-person camera sees the body but not the actor's foveated attention, so intent must be inferred far more indirectly.",
            zh: "你看到的大致就是行动者看到的，因此揭示注意力的线索可直接观测：注视、伸手方向、依次抓取的物体序列，都在计划完成前暴露它。第三人称相机看到身体，却看不到行动者的中央凹注意力，故意图须更间接地推断。",
          },
          hint: { en: "You're seeing through (almost) the actor's own eyes — what does that reveal?", zh: "你（几乎）是透过行动者自己的眼睛在看——这揭示了什么？" },
        },
      ],
      links: ["C5", "C7", "A1"],
      papers: [{ title: "Ego4D: Around the World in 3,000 Hours of Egocentric Video", year: 2022 }],
    },
    {
      id: "C2",
      trackId: "C",
      index: 2,
      title: { en: "Key datasets: Ego4D, EPIC-Kitchens, EGTEA", zh: "关键数据集：Ego4D、EPIC-Kitchens、EGTEA" },
      summary: {
        en: "The benchmarks define the field — know what each measures and what it leaves out.",
        zh: "基准定义了领域——要清楚每个数据集衡量什么、又遗漏了什么。",
      },
      body: {
        en: "Progress in egocentric vision is benchmark-driven. Four datasets anchor most work:\n\n- **EPIC-Kitchens** — tens of hours of unscripted cooking, densely annotated with **verb + noun** action segments (e.g. *cut onion*). It popularized the action = (verb, noun) decomposition and the action-anticipation task.\n- **EGTEA Gaze+** — meal-preparation video with synchronized **eye-tracking**, making it the go-to for gaze-conditioned recognition.\n- **Ego4D** — a massive (3,000+ hour) multi-site collection spanning many activities, defined not by one task but by a suite of **benchmarks**: episodic memory, hands-and-objects, audio-visual diarization, social, and forecasting.\n- **Xperience-10M** (Ropedia) — a large-scale (10M-scale) egocentric collection distributed via the open **HOMIE toolkit** (a public sample plus gated full data). Its signature is unusually rich *per-frame* annotation: synchronized **RGB, depth, camera trajectory, and hand + body pose, plus natural-language captions**, inspectable in Rerun. That density of geometry + pose + language in one source makes it a natural bridge across tracks — egocentric perception (C), human modeling (A), and 3D/world reconstruction (B, D) from the same episodes.\n\nReading a dataset critically means asking three questions: *What is the label space?* (closed verb/noun vocab vs open) *What biases does collection introduce?* (kitchens over-represent manipulation; staged capture under-represents the messy long tail) *What does the split test?* (held-out participants and held-out kitchens test generalization far harder than random splits). The same scene appearing in train and test inflates numbers — always check whether the split is by environment.",
        zh: "第一人称视觉的进展由基准驱动。四个数据集支撑了大多数工作：\n\n- **EPIC-Kitchens** —— 数十小时无脚本的烹饪视频，密集标注了 **动词 + 名词** 的动作片段（如 *切洋葱*）。它推广了「动作 =（动词，名词）」的分解，以及动作预判（anticipation）任务。\n- **EGTEA Gaze+** —— 备餐视频，同步了**眼动追踪**，是注视条件识别的首选。\n- **Ego4D** —— 超大规模（3000+ 小时）的多地点采集，涵盖众多活动；它不是由单一任务、而是由一**套基准**定义：情景记忆、手与物体、视听说话人分离、社交、预测。\n- **Xperience-10M**（Ropedia）—— 大规模（千万级 10M）第一人称采集，经开放的 **HOMIE 工具包**分发（含公开样本与受控的完整数据）。它的标志是异常丰富的*逐帧*标注：同步的 **RGB、深度、相机轨迹、手部 + 身体姿态，以及自然语言描述**，可在 Rerun 中查看。几何 + 姿态 + 语言在同一来源中的这种密度，使它天然成为跨赛道的桥梁——同一批 episode 可同时服务第一人称感知（C）、人体建模（A）、以及三维/世界重建（B、D）。\n\n批判性地读一个数据集，要问三个问题：*标签空间是什么？*（封闭的动词/名词词表 vs 开放）*采集引入了哪些偏置？*（厨房过度代表了操作；摆拍采集低估了真实世界凌乱的长尾）*划分测试的是什么？*（留出参与者、留出厨房比随机划分更难地考验泛化）。同一场景同时出现在训练和测试会虚高指标——务必检查是否按环境划分。",
      },
      keyTerms: [
        { term: "Verb–noun action", def: { en: "Decomposing an action label into a verb (cut) and noun (onion); the dominant EPIC scheme.", zh: "把动作标签分解为动词（切）和名词（洋葱）；EPIC 的主流方案。" } },
        { term: "Anticipation", def: { en: "Predicting an action τ seconds before it starts, from only the preceding video.", zh: "仅凭之前的视频，在动作开始前 τ 秒预测它。" } },
        { term: "Multimodal annotation (Xperience-10M)", def: { en: "Per-frame RGB + depth + trajectory + hand/body pose + captions in one source.", zh: "同一来源中逐帧的 RGB + 深度 + 轨迹 + 手/身体姿态 + 文字描述。" } },
      ],
      checks: [
        {
          id: "C2-q3",
          prompt: { en: "Xperience-10M ships synchronized RGB, depth, hand/body pose, and captions per frame. Why is that multimodal density valuable across *all four* tracks, not just egocentric action?", zh: "Xperience-10M 逐帧提供同步的 RGB、深度、手/身体姿态与文字描述。为什么这种多模态密度对*全部四条*赛道（而不只是第一人称动作）都有价值？" },
          answer: {
            en: "One source supplies the supervision each track needs: RGB+captions for egocentric perception (C), hand/body pose for human mesh recovery (A), depth+camera trajectory for 3D/4D reconstruction and SLAM (B, D), and language for open-vocabulary semantics. Co-registered modalities let a model learn cross-track relationships (e.g. how a hand action and the 3D scene co-evolve) that separate, unaligned datasets cannot.",
            zh: "同一来源提供了每条赛道所需的监督：RGB+描述用于第一人称感知（C）、手/身体姿态用于人体网格恢复（A）、深度+相机轨迹用于三维/四维重建与 SLAM（B、D）、语言用于开放词汇语义。共配准的模态让模型学到分散、未对齐的数据集无法提供的跨赛道关系（如手部动作与 3D 场景如何协同演化）。",
          },
        },
        {
          id: "C2-q1",
          prompt: { en: "Why is a participant-held-out (or kitchen-held-out) split more meaningful than a random frame split?", zh: "为什么按参与者（或厨房）留出的划分，比随机帧划分更有意义？" },
          answer: {
            en: "Random splits leak the same environment, lighting, and even the same object instances into both train and test, so a model can memorize appearance instead of learning the action. Holding out whole participants/kitchens forces generalization to unseen scenes and hands — the property you actually care about for a wearable assistant.",
            zh: "随机划分会把相同的环境、光照甚至相同的物体实例泄漏到训练和测试两侧，模型可以记住外观而非学会动作。留出整个参与者/厨房，迫使模型泛化到未见的场景与手——这才是可穿戴助手真正需要的性质。",
          },
        },
        {
          id: "C2-q2",
          prompt: { en: "Ego4D defines benchmarks rather than a single task. Why is that a strength?", zh: "Ego4D 定义的是一套基准而非单一任务。为什么这是优势？" },
          answer: {
            en: "A single task narrows research to one metric and one failure mode. A benchmark suite over shared raw video lets the same data drive memory, manipulation, social, and forecasting research, encourages representations that transfer across tasks, and reflects that a real wearable agent must do many things at once.",
            zh: "单一任务把研究收窄到一个指标和一种失败模式。在共享原始视频上的一套基准，让同一份数据驱动记忆、操作、社交与预测的研究，鼓励能跨任务迁移的表示，也反映了真实可穿戴智能体必须同时做很多事。",
          },
        },
        {
          id: "C2-q4",
          prompt: { en: "EPIC labels actions with a closed (verb, noun) vocabulary. What does that miss, and how do free-form language captions (as in Xperience-10M) help?", zh: "EPIC 用封闭的（动词，名词）词表标注动作。这会遗漏什么？自由形式的语言描述（如 Xperience-10M）如何弥补？" },
          answer: {
            en: "A fixed vocabulary can't name actions/objects outside its list (novel tools, fine distinctions, multi-step descriptions) and forces every event into a rigid slot. Free-form captions support open-vocabulary recognition, compositional and rare descriptions, and grounding to language models — at the cost of noisier, harder-to-score supervision.",
            zh: "固定词表无法命名其列表之外的动作/物体（新工具、细微区分、多步描述），并迫使每个事件塞进一个僵硬的槽。自由形式描述支持开放词汇识别、组合式与罕见描述、以及与语言模型的接地——代价是更含噪、更难评分的监督。",
          },
          hint: { en: "What can't you label if the word isn't in your fixed verb/noun list?", zh: "若某个词不在你固定的动词/名词列表里，你就无法标注什么？" },
        },
      ],
      links: ["C4", "C7", "D8"],
      papers: [
        { title: "Scaling Egocentric Vision: The EPIC-KITCHENS Dataset", year: 2018 },
        { title: "Ego4D: Around the World in 3,000 Hours of Egocentric Video", year: 2022 },
        { title: "Xperience-10M — large-scale multimodal egocentric dataset (Ropedia / HOMIE toolkit)" },
      ],
    },
    {
      id: "C3",
      trackId: "C",
      index: 3,
      title: { en: "Video understanding backbones: SlowFast & VideoMAE", zh: "视频理解骨干：SlowFast 与 VideoMAE" },
      summary: {
        en: "How a network turns a clip into features — two paradigms: hand-designed two-stream and self-supervised masking.",
        zh: "网络如何把视频片段变成特征——两种范式：手工设计的双流，与自监督的掩码重建。",
      },
      body: {
        en: "A backbone maps a clip $X \\in \\mathbb{R}^{T\\times H\\times W\\times 3}$ to a feature that downstream heads read. Two influential designs:\n\n**SlowFast** uses two pathways. A *slow* pathway samples few frames at high spatial detail (captures appearance/semantics); a *fast* pathway samples many frames at low channel capacity (captures motion). Lateral connections fuse them. The insight: spatial semantics and temporal motion change at different rates, so give each its own frame rate. This is an architectural prior — efficient, but fixed.\n\n**VideoMAE** instead *learns* the prior by self-supervision. Mask a very high fraction (~90%) of spatio-temporal patches (**tube masking**) and train a ViT to reconstruct them. Because video is temporally redundant, only aggressive masking makes the pretext task hard enough to force semantic representations. The result pretrains well on unlabeled video, then fine-tunes for recognition.\n\nThe shift from SlowFast to VideoMAE mirrors the field's broader move from **hand-designed inductive bias** to **self-supervised pretraining on scale** — the same arc you see with masked-image and masked-language models.",
        zh: "骨干网络把一个片段 $X \\in \\mathbb{R}^{T\\times H\\times W\\times 3}$ 映射成下游头部读取的特征。两种有影响力的设计：\n\n**SlowFast** 用两条通路。*慢*通路以高空间细节采样少量帧（捕捉外观/语义）；*快*通路以低通道容量采样大量帧（捕捉运动）。横向连接将二者融合。洞见在于：空间语义与时间运动以不同速率变化，因此各给一个帧率。这是一种架构先验——高效，但固定。\n\n**VideoMAE** 则用自监督来**学习**这种先验。掩盖极高比例（约 90%）的时空块（**管状掩码 tube masking**），训练一个 ViT 去重建它们。因为视频在时间上高度冗余，只有激进的掩码才能让这个预训练任务足够难，从而逼出语义表示。其结果是：先在无标注视频上做预训练，再微调用于识别。\n\n从 SlowFast 到 VideoMAE 的转变，映射了整个领域从**手工设计归纳偏置**走向**大规模自监督预训练**的大趋势——与掩码图像、掩码语言模型看到的是同一条弧线。",
      },
      keyTerms: [
        { term: "Two-stream / SlowFast", def: { en: "Separate pathways for slow appearance and fast motion, fused by lateral links.", zh: "为慢速外观与快速运动分设通路，经横向连接融合。" } },
        { term: "Tube masking", def: { en: "Masking the same spatial patch across time, so reconstruction can't cheat via neighboring frames.", zh: "在时间上掩盖同一空间块，使重建无法靠相邻帧作弊。" } },
      ],
      checks: [
        {
          id: "C3-q1",
          prompt: { en: "VideoMAE masks ~90% of patches but image MAE masks ~75%. Why does video need a higher ratio?", zh: "VideoMAE 掩盖约 90% 的块，而图像 MAE 约 75%。为什么视频需要更高的比例？" },
          answer: {
            en: "Video is highly redundant across time — adjacent frames are nearly identical. With moderate masking the model can reconstruct a patch by copying from a neighboring frame, making the task trivial and the features weak. A ~90% ratio (plus tube masking) removes that shortcut and forces genuine spatio-temporal understanding.",
            zh: "视频在时间上高度冗余——相邻帧几乎相同。中等掩码下，模型可以从相邻帧复制来重建某个块，使任务变得平凡、特征薄弱。约 90% 的比例（加上管状掩码）消除了这条捷径，逼出真正的时空理解。",
          },
        },
        {
          id: "C3-q2",
          prompt: { en: "Give one reason a hand-designed backbone (SlowFast) might still be preferred over VideoMAE in practice.", zh: "举出一个实践中仍可能偏好手工骨干（SlowFast）而非 VideoMAE 的理由。" },
          answer: {
            en: "When labeled data is scarce and unlabeled pretraining data or compute is unavailable, the strong built-in motion/appearance prior of SlowFast gives good results with far less data and no expensive pretraining stage. Inductive bias substitutes for scale.",
            zh: "当标注数据稀缺、又没有无标注预训练数据或算力时，SlowFast 内建的强运动/外观先验能用更少的数据、且无需昂贵的预训练阶段就取得不错的结果。归纳偏置替代了规模。",
          },
        },
        {
          id: "C3-q3",
          prompt: { en: "Why does SlowFast use two pathways at different frame rates instead of one fast high-resolution pathway?", zh: "为什么 SlowFast 用两条不同帧率的通路，而非一条快速高分辨率通路？" },
          answer: {
            en: "Appearance/semantics change slowly across frames (redundant), so a few high-detail frames suffice; motion changes fast and needs many frames but little channel capacity. Matching each pathway's sampling to the rate of the signal it captures is far more efficient than running everything at high spatial AND temporal resolution, which would be hugely expensive for little gain.",
            zh: "外观/语义跨帧变化缓慢（冗余），故少量高细节帧即足够；运动变化快、需要许多帧但只需少量通道容量。让每条通路的采样匹配它所捕捉信号的速率，远比把一切都以高空间且高时间分辨率运行高效——后者代价巨大却收益甚微。",
          },
          hint: { en: "Does what an object looks like change as fast as how it moves?", zh: "一个物体的外观，变化得和它的运动一样快吗？" },
        },
        {
          id: "C3-q4",
          prompt: { en: "The shift from SlowFast to VideoMAE mirrors a broader trend in deep learning. Name it and give the image/language parallel.", zh: "从 SlowFast 到 VideoMAE 的转变映射了深度学习的一个更大趋势。说出它，并给出图像/语言的对应。" },
          answer: {
            en: "Hand-designed inductive bias → self-supervised pretraining at scale. SlowFast bakes in a motion/appearance prior; VideoMAE learns the prior from masses of unlabeled video by masked reconstruction — the same arc as MAE for images and masked-language-model pretraining (BERT/GPT) for text. As data and compute grow, learned priors overtake hand-built ones.",
            zh: "手工设计的归纳偏置 → 大规模自监督预训练。SlowFast 把运动/外观先验写死；VideoMAE 通过掩码重建从海量无标注视频中学到先验——与图像的 MAE、文本的掩码语言模型预训练（BERT/GPT）是同一条弧线。随着数据与算力增长，学到的先验超越手工搭建的。",
          },
          hint: { en: "Think MAE for images and BERT for text — what replaced hand-built features there?", zh: "想想图像的 MAE 与文本的 BERT——那里是什么取代了手工特征？" },
        },
      ],
      links: ["C4", "B7", "A3"],
      papers: [
        { title: "SlowFast Networks for Video Recognition", year: 2019 },
        { title: "VideoMAE: Masked Autoencoders are Data-Efficient Learners for Self-Supervised Video Pre-Training", year: 2022 },
      ],
    },
    {
      id: "C4",
      trackId: "C",
      index: 4,
      title: { en: "Action recognition & anticipation", zh: "动作识别与预判" },
      summary: {
        en: "Recognizing what is happening now vs forecasting what happens next — and why anticipation is harder.",
        zh: "识别此刻在发生什么 vs 预测接下来会发生什么——以及为什么预判更难。",
      },
      body: {
        en: "**Recognition** answers \"what action is in this segment?\" Given clip features, a head predicts a label — in EPIC, a (verb, noun) pair. **Anticipation** answers \"what action will start $\\tau$ seconds from now?\" using *only* the video before the action begins. Anticipation is strictly harder: the evidence is incomplete and the future is multi-modal — several actions are plausible.\n\nThree ideas make anticipation work:\n\n- **Model uncertainty, don't guess one future.** Output a distribution over next actions; evaluate with top-k. A model that hedges sensibly beats one that commits wrongly.\n- **Exploit structure.** Activities follow scripts (*take pan → add oil → ...*). Sequence models and learned action grammars supply a strong prior over what comes next.\n- **Anchor on hands and objects.** Reaching toward the knife predicts *cut* before the cut. The hand trajectory and the next-grasped object are the most predictive cues — which is exactly why later lessons model hands and gaze explicitly.\n\nThis lesson is the hinge of Track C: recognition is the *present*, anticipation is the *near future*, and both feed the intention modeling of Lesson 8.",
        zh: "**识别**回答「这个片段里是什么动作？」给定片段特征，一个头部预测标签——在 EPIC 中是（动词，名词）对。**预判（anticipation）**回答「从现在起 $\\tau$ 秒后会开始什么动作？」，且**只**使用动作开始前的视频。预判严格更难：证据不完整，而未来是多模态的——几种动作都说得通。\n\n三个想法让预判奏效：\n\n- **建模不确定性，别只猜一个未来。** 输出对下一动作的分布，用 top-k 评估。明智地下注的模型，胜过笃定但猜错的模型。\n- **利用结构。** 活动遵循脚本（*拿锅 → 加油 → …*）。序列模型与学到的动作语法，为接下来会发生什么提供强先验。\n- **锚定在手与物体上。** 伸向刀，在切之前就预示了*切*。手的轨迹与下一个被抓取的物体是最具预测力的线索——这正是后续课程要显式建模手与注视的原因。\n\n本课是 Track C 的枢纽：识别是*现在*，预判是*近未来*，两者都汇入第 8 课的意图建模。",
      },
      keyTerms: [
        { term: "Top-k anticipation", def: { en: "Scoring a model correct if the true next action is in its top-k predictions, acknowledging future multi-modality.", zh: "若真实的下一动作在模型 top-k 预测内即记为正确，承认未来的多模态性。" } },
        { term: "Action grammar / script", def: { en: "Learned regularities in action order that constrain plausible futures.", zh: "动作顺序中学到的规律，约束了可能的未来。" } },
      ],
      checks: [
        {
          id: "C4-q1",
          prompt: { en: "Why is top-1 accuracy a poor metric for anticipation specifically?", zh: "为什么 top-1 准确率尤其不适合作为预判的指标？" },
          answer: {
            en: "The future is genuinely multi-modal: after 'take pan' both 'add oil' and 'add egg' are reasonable. Top-1 punishes a well-calibrated model for not reading the actor's mind. Top-k (or distributional metrics) rewards covering the plausible set, which is the realistic goal.",
            zh: "未来本质上是多模态的：「拿锅」之后，「加油」和「加蛋」都合理。Top-1 会因模型没有读心而惩罚一个校准良好的模型。Top-k（或分布型指标）奖励覆盖合理集合，这才是现实目标。",
          },
        },
        {
          id: "C4-q2",
          prompt: { en: "Which egocentric cue is most predictive of the *next* action, and why?", zh: "哪种第一人称线索对*下一个*动作最具预测力，为什么？" },
          answer: {
            en: "The hand's reaching trajectory toward an object (often preceded by gaze landing on it). Manipulation is goal-directed, so the body commits to the next object before the action label is observable — reaching and pre-grasp are the earliest visible evidence of intent.",
            zh: "手伸向某物体的轨迹（通常先有注视落在它上面）。操作是目标导向的，因此身体在动作标签可见之前就已对下一个物体「下注」——伸手与预抓取是意图最早的可见证据。",
          },
        },
        {
          id: "C4-q3",
          prompt: { en: "Anticipation uses only the video *before* the action starts. Why is that strictly harder than recognition, beyond just having less footage?", zh: "预判只用动作开始*之前*的视频。除了片段更短之外，为什么这严格地比识别更难？" },
          answer: {
            en: "Recognition sees the defining evidence (the cut happening); anticipation must extrapolate from pre-action cues to an event that hasn't occurred and is genuinely multi-modal — several futures are valid. So it's not just less data: it's predicting a distribution over an uncertain future rather than classifying observed evidence.",
            zh: "识别看到了决定性证据（正在切）；预判必须从动作前的线索外推到一个尚未发生且本质多模态的事件——多个未来都成立。所以这不仅是数据更少，而是预测一个不确定未来的分布，而非对已观测证据分类。",
          },
          hint: { en: "The moment that defines the action label hasn't happened yet — what must the model do instead?", zh: "定义动作标签的那一刻还没发生——模型只能改为做什么？" },
        },
        {
          id: "C4-q4",
          prompt: { en: "Exploiting an action grammar (scripts) helps anticipation. What's the accompanying risk?", zh: "利用动作语法（脚本）有助于预判。随之而来的风险是什么？" },
          answer: {
            en: "A learned script is a prior over typical orderings; it boosts accuracy on routine sequences but biases the model toward the common path, so it mispredicts when the actor deviates (skips a step, improvises, does it out of order). The prior must be strong enough to help yet not so rigid it ignores the actual evidence.",
            zh: "学到的脚本是对典型顺序的先验；它在常规序列上提升准确率，却使模型偏向常见路径，因此当行动者偏离（跳步、即兴、乱序）时会预测错误。先验须强到有用、又不能僵硬到无视实际证据。",
          },
          hint: { en: "Scripts help until someone does the steps in an unusual order.", zh: "脚本一直有用，直到有人以不寻常的顺序做这些步骤。" },
        },
      ],
      links: ["C7", "C8", "C6"],
      papers: [{ title: "What Would You Expect? Anticipating Egocentric Actions (RU-LSTM)", year: 2019 }],
    },
    {
      id: "C5",
      trackId: "C",
      index: 5,
      title: { en: "Hand detection & segmentation", zh: "手部检测与分割" },
      summary: {
        en: "Hands are the egocentric anchor — find them, separate left/right, own/other, and their pixels.",
        zh: "手是第一人称的锚点——找到它们，区分左右、自己/他人，以及它们的像素。",
      },
      body: {
        en: "If one signal defines egocentric video, it is **hands**. Locating them is the substrate for interaction, gaze, and action models. The task has several rungs:\n\n- **Detection** — bounding boxes for each visible hand.\n- **Side & ownership** — left vs right, and *my* hands vs another person's (crucial in social/instructional video).\n- **Segmentation** — per-pixel masks, needed to reason about contact and occlusion of objects.\n\nWhy hands are hard here: extreme and frequent self-occlusion (a fist hides its own fingers), motion blur during fast manipulation, and truncation at the frame edge as hands enter/leave view. The first-person viewpoint helps too — own hands appear from a consistent direction (bottom of frame, forearm leading in), a strong geometric prior detectors can exploit.\n\nHand masks are not the goal; they are the **input** to the next lesson. Knowing *where* the hand is and *which pixels* it owns is the precondition for asking *what it is touching* — the hand–object interaction problem.",
        zh: "若有一个信号定义第一人称视频，那就是**手**。定位手是交互、注视和动作模型的基底。这个任务有几个层级：\n\n- **检测** —— 每只可见的手的边界框。\n- **左右与归属** —— 左手 vs 右手，以及*我的*手 vs 他人的手（在社交/教学视频中至关重要）。\n- **分割** —— 逐像素掩码，用于推理与物体的接触和遮挡。\n\n手在这里为何困难：极端且频繁的自遮挡（握拳遮住自己的手指）、快速操作时的运动模糊、以及手进出视野时在画面边缘的截断。第一人称视角也有帮助——自己的手以一致方向出现（画面底部、前臂先入），这是检测器可利用的强几何先验。\n\n手部掩码不是终点，而是下一课的**输入**。知道手在*哪里*、占有*哪些像素*，是追问它*在触碰什么*的前提——也就是手–物交互问题。",
      },
      keyTerms: [
        { term: "Hand ownership", def: { en: "Distinguishing the camera-wearer's own hands from other people's hands in frame.", zh: "区分相机佩戴者自己的手与画面中他人的手。" } },
        { term: "Self-occlusion", def: { en: "Parts of the hand hidden by the hand itself, the dominant failure mode in manipulation.", zh: "手的部分被手自身遮挡，是操作中最主要的失败模式。" } },
      ],
      checks: [
        {
          id: "C5-q1",
          prompt: { en: "What first-person geometric prior helps detect the wearer's own hands?", zh: "哪个第一人称几何先验有助于检测佩戴者自己的手？" },
          answer: {
            en: "Own hands almost always enter from the bottom edge with the forearm leading inward toward the frame center, at a roughly consistent scale and orientation. Detectors can use this strong positional/orientation prior to disambiguate own vs other hands and to handle edge truncation.",
            zh: "自己的手几乎总是从画面底部进入，前臂朝画面中心方向引入，且尺度和朝向大致一致。检测器可利用这一强位置/朝向先验来区分自己 vs 他人的手，并处理边缘截断。",
          },
        },
        {
          id: "C5-q2",
          prompt: { en: "Why is pixel segmentation (not just a box) needed for the next stage?", zh: "为什么下一阶段需要像素分割（而不只是框）？" },
          answer: {
            en: "Reasoning about contact and grasp requires knowing exactly which pixels are hand vs object vs background at the boundary. A box overlaps both hand and object and can't express occlusion order; a mask can, which is what hand–object interaction modeling consumes.",
            zh: "推理接触与抓取需要在边界处准确知道哪些像素是手、是物体、是背景。框会同时覆盖手和物体，无法表达遮挡顺序；掩码可以，而这正是手–物交互建模所需的输入。",
          },
        },
        {
          id: "C5-q3",
          prompt: { en: "Self-occlusion is called the dominant failure mode. Why does it specifically wreck hand pose/contact estimation, and what mitigates it?", zh: "自遮挡被称为最主要的失败模式。为什么它尤其破坏手部姿态/接触估计？什么能缓解它？" },
          answer: {
            en: "A gripping hand hides its own fingers and the contact region from the camera, so the very pixels that determine pose and grasp are missing in that frame. Mitigations: temporal context (fingers visible in nearby frames), a learned hand prior / MANO mesh that fills in plausible articulation, and depth or multi-view when available.",
            zh: "握持的手把自己的手指和接触区域对相机遮住，于是决定姿态与抓取的那些像素在该帧恰好缺失。缓解：时间上下文（手指在邻近帧可见）、学到的手部先验/MANO 网格来补全合理的关节构型，以及在可得时用深度或多视图。",
          },
          hint: { en: "When a hand makes a fist, where did the fingers go for the camera?", zh: "当手握成拳，对相机来说手指去哪了？" },
        },
        {
          id: "C5-q4",
          prompt: { en: "Why does distinguishing the wearer's own hands from another person's matter for learning from demonstration?", zh: "为什么区分佩戴者自己的手与他人的手，对从示范中学习很重要？" },
          answer: {
            en: "In social/instructional video both the teacher's and the learner's hands appear. To imitate, the agent must know which hands are executing the demonstrated skill versus its own; mixing them corrupts the action label and the grasp it tries to copy. Ownership disentangles 'what I'm being shown' from 'what I'm doing'.",
            zh: "在社交/教学视频里，老师与学习者的手都会出现。要模仿，智能体必须知道哪只手在执行被示范的技能、哪只是自己的；混淆会污染动作标签与它试图复制的抓取。归属把「别人在示范什么」与「我在做什么」解耦。",
          },
          hint: { en: "If two people's hands are in frame, whose action are you trying to copy?", zh: "若画面里有两个人的手，你在试图复制谁的动作？" },
        },
      ],
      links: ["C6", "C1", "A6"],
      papers: [{ title: "Understanding Human Hands in Contact at Internet Scale (100DOH)", year: 2020 }],
    },
    {
      id: "C6",
      trackId: "C",
      index: 6,
      title: { en: "Hand–object interaction modeling", zh: "手–物交互建模" },
      summary: {
        en: "Contact, grasp, and manipulation: the unit of egocentric activity is the hand acting on an object.",
        zh: "接触、抓取与操作：第一人称活动的基本单元，是手作用于物体。",
      },
      body: {
        en: "Egocentric activity is mostly **hands manipulating objects**, so a model of *hand–object interaction* (HOI) is the natural core representation. It answers three coupled questions:\n\n- **Contact** — is the hand touching an object, and where? Contact state segments a continuous video into *interaction* episodes.\n- **Grasp & object state** — how is it held, and is the object changing (open/closed, full/empty, whole/cut)?\n- **Active object** — among many objects in view, *which* is being acted on right now?\n\nThe \"active object\" idea is powerful: it filters the cluttered scene down to the one object that matters, sharpening recognition and anticipation alike. Modeling improves when hand and object are reasoned about **jointly** — the grasp constrains plausible objects, and the object constrains plausible grasps, so joint inference beats two independent detectors.\n\nHOI is also where 2D perception starts demanding 3D: contact and grasp are fundamentally about geometry and physical plausibility. That tension motivates Track A's hand-mesh recovery and Track B's 3D reconstruction — the same scene, now needing shape, not just pixels.",
        zh: "第一人称活动大多是**手在操作物体**，因此*手–物交互（HOI）*模型是自然的核心表示。它回答三个耦合的问题：\n\n- **接触** —— 手是否在触碰某物体，触碰在哪？接触状态把连续视频切分为*交互*片段。\n- **抓取与物体状态** —— 怎么握的，物体是否在改变（开/合、满/空、整/切）？\n- **活动物体（active object）** —— 视野中众多物体里，此刻*哪一个*正被作用？\n\n「活动物体」的想法很有力：它把杂乱场景过滤为唯一重要的那个物体，同时锐化识别与预判。当手与物体被**联合**推理时建模会更好——抓取约束了可能的物体，物体约束了可能的抓取，因此联合推断胜过两个独立检测器。\n\nHOI 也是 2D 感知开始索要 3D 的地方：接触与抓取本质上关乎几何与物理合理性。这一张力推动了 Track A 的手部网格恢复与 Track B 的三维重建——同一个场景，如今需要的是形状，而不只是像素。",
      },
      keyTerms: [
        { term: "Active object", def: { en: "The single object currently being manipulated, selected from all visible objects.", zh: "当前正被操作的那个物体，从所有可见物体中选出。" } },
        { term: "Contact state", def: { en: "A binary/temporal signal of hand-object touch that segments interactions.", zh: "手–物接触的二值/时序信号，用以切分交互。" } },
      ],
      checks: [
        {
          id: "C6-q1",
          prompt: { en: "Why does jointly inferring hand grasp and object identity beat two separate detectors?", zh: "为什么联合推断手的抓取与物体身份，优于两个独立检测器？" },
          answer: {
            en: "Grasp and object are mutually constraining: a pinch grasp implies a small object, a wrap grasp a handle, etc. Joint inference lets each disambiguate the other (especially under occlusion), whereas independent detectors can output a physically inconsistent pair (e.g. a power grasp on a needle).",
            zh: "抓取与物体相互约束：捏取暗示小物体，环握暗示把手等。联合推断让二者相互消歧（尤其在遮挡下），而独立检测器可能输出物理上不一致的组合（例如对一根针用力握）。",
          },
        },
        {
          id: "C6-q2",
          prompt: { en: "How does the 'active object' concept reduce the difficulty of action recognition?", zh: "「活动物体」概念如何降低动作识别的难度？" },
          answer: {
            en: "It collapses a cluttered multi-object scene to the one object under manipulation, giving the recognition head a clean, relevant region instead of the whole frame. This cuts background distractors and ties the (verb, noun) prediction to the actually-involved noun.",
            zh: "它把杂乱的多物体场景收缩为正被操作的那一个物体，给识别头部一个干净、相关的区域，而非整帧。这削减了背景干扰，并把（动词，名词）预测绑定到真正涉及的名词上。",
          },
        },
        {
          id: "C6-q3",
          prompt: { en: "Contact state segments a continuous video into interaction episodes. Why is that a useful temporal primitive?", zh: "接触状态把连续视频切分为交互片段。为什么这是一个有用的时间基元？" },
          answer: {
            en: "Contact onset/offset gives natural, semantically meaningful boundaries for when a manipulation begins and ends, turning an undifferentiated video stream into discrete action units. Those units anchor recognition (classify within an episode) and anticipation (predict the next episode), and align with how activities are actually structured.",
            zh: "接触的开始/结束给出了操作何时起止的自然、语义上有意义的边界，把无区分的视频流变成离散的动作单元。这些单元为识别（在一个片段内分类）和预判（预测下一个片段）提供锚点，并与活动的真实结构对齐。",
          },
          hint: { en: "What naturally marks the start and end of 'an action'?", zh: "什么天然地标记了「一个动作」的开始与结束？" },
        },
        {
          id: "C6-q4",
          prompt: { en: "Why is hand–object interaction where 2D perception 'starts demanding 3D'?", zh: "为什么手–物交互是 2D 感知「开始索要 3D」的地方？" },
          answer: {
            en: "Contact and grasp are physical-geometric: whether surfaces actually touch, and whether a configuration is feasible, can't be decided from a 2D overlap (a hand in front of an object looks like a hand on it). You need 3D shape and pose — motivating Track A's hand-mesh recovery and Track B's reconstruction to bring geometry to the same scene.",
            zh: "接触与抓取是物理几何的：表面是否真的接触、某构型是否可行，无法从 2D 重叠判定（手在物体前面看起来就像手在物体上）。你需要 3D 形状与姿态——这推动了 Track A 的手部网格恢复与 Track B 的重建，为同一场景带来几何。",
          },
          hint: { en: "In 2D, does a hand touching a cup look different from a hand just in front of it?", zh: "在 2D 里，手碰到杯子和手只是在杯子前面，看起来有区别吗？" },
        },
      ],
      links: ["C4", "A6", "B4"],
      papers: [{ title: "Understanding Human Hands in Contact at Internet Scale (100DOH)", year: 2020 }],
    },
    {
      id: "C7",
      trackId: "C",
      index: 7,
      title: { en: "Gaze & attention modeling", zh: "注视与注意力建模" },
      summary: {
        en: "Where the eyes go, intention follows — gaze is a near-direct readout of attention.",
        zh: "眼睛看向哪里，意图就在哪里——注视几乎是注意力的直接读数。",
      },
      body: {
        en: "In first-person video, **gaze** (the 2D point of regard, from an eye tracker or predicted from the frame) is an unusually clean signal: humans look at what they are about to manipulate, typically *before* they reach. Gaze leads action.\n\nTwo uses:\n\n- **As supervision/attention.** Gaze tells a recognition model *where* to attend, focusing features on the foveated region and suppressing background. EGTEA's synchronized eye-tracking made this concrete.\n- **As an intention probe.** A saccade landing on the knife is early evidence of *cut*; gaze sequences trace the plan before the hands execute it. This makes gaze one of the strongest anticipation cues (Lesson 4).\n\nMechanistically, gaze and hands are coordinated through **eye–hand coordination**: gaze anchors a target, the hand is guided there, contact follows. A model that fuses gaze + hand + object recovers the micro-structure of intention. Predicting gaze itself (saliency in egocentric video) is a useful auxiliary task even when no eye tracker is available — the head-motion and scene cues approximate it.",
        zh: "在第一人称视频中，**注视（gaze）**（注视点的 2D 位置，来自眼动仪或从画面预测）是一个异常干净的信号：人会看着自己即将操作的东西，通常*在伸手之前*。注视领先于动作。\n\n两种用途：\n\n- **作为监督/注意力。** 注视告诉识别模型该*往哪看*，把特征聚焦到中央凹区域并抑制背景。EGTEA 的同步眼动追踪让这一点变得具体。\n- **作为意图探针。** 一次扫视落在刀上，是*切*的早期证据；注视序列在双手执行之前就勾勒出计划。这使注视成为最强的预判线索之一（第 4 课）。\n\n机制上，注视与手通过**眼–手协调**配合：注视锚定目标，手被引导过去，接触随之发生。融合注视 + 手 + 物体的模型，恢复了意图的微观结构。即便没有眼动仪，预测注视本身（第一人称视频中的显著性）也是有用的辅助任务——头部运动与场景线索可近似它。",
      },
      keyTerms: [
        { term: "Point of regard / gaze", def: { en: "The 2D location the eye fixates in the frame; foveated attention.", zh: "眼睛在画面中注视的 2D 位置；中央凹注意力。" } },
        { term: "Eye–hand coordination", def: { en: "Gaze anchors a target slightly before the hand moves to it.", zh: "注视在手移动到目标之前略微锚定该目标。" } },
      ],
      checks: [
        {
          id: "C7-q1",
          prompt: { en: "Why does gaze typically *lead* the corresponding hand action in time?", zh: "为什么注视在时间上通常*领先*于相应的手部动作？" },
          answer: {
            en: "Motor planning is target-driven: the visual system fixates the goal to gather the spatial information needed to guide the reach, so the eye lands on the object a fraction of a second before the hand commits. This lead time is exactly what makes gaze a powerful anticipation cue.",
            zh: "运动规划是目标驱动的：视觉系统先注视目标，以获取引导伸手所需的空间信息，因此眼睛在手「下注」前零点几秒就落到物体上。这段领先时间正是注视成为强预判线索的原因。",
          },
        },
        {
          id: "C7-q2",
          prompt: { en: "No eye tracker is available. How can you still get a useful gaze/attention signal?", zh: "没有眼动仪时，如何仍获得有用的注视/注意力信号？" },
          answer: {
            en: "Predict egocentric saliency from the frame plus head-motion: the scene center, the just-grasped object, and the direction of head turn approximate the fixation. Training a gaze-prediction head on datasets that do have eye tracking (e.g. EGTEA) transfers a reasonable prior to trackerless video.",
            zh: "用画面加头部运动预测第一人称显著性：画面中心、刚抓取的物体、头部转动方向可近似注视点。在确有眼动数据的数据集（如 EGTEA）上训练注视预测头部，可把合理先验迁移到无眼动仪的视频。",
          },
        },
        {
          id: "C7-q3",
          prompt: { en: "Beyond anticipation, how does gaze concretely improve an action *recognition* model?", zh: "除预判外，注视如何具体改进动作*识别*模型？" },
          answer: {
            en: "Gaze is a supervised attention signal: it tells the model which region is foveated/relevant, so features concentrate on the manipulated object and background distractors are suppressed. This is especially valuable in cluttered egocentric frames where most pixels are irrelevant — the model attends like the human did.",
            zh: "注视是一个有监督的注意力信号：它告诉模型哪个区域被中央凹注视/相关，于是特征集中到被操作物体上，背景干扰被抑制。在大多数像素都无关的杂乱第一人称画面里这尤其有价值——模型像人一样去注意。",
          },
          hint: { en: "Gaze is a label for 'where to look' — what does that do to features?", zh: "注视是「该往哪看」的标签——这对特征有何作用？" },
        },
        {
          id: "C7-q4",
          prompt: { en: "Why does fusing gaze + hand + object recover intention better than any one signal alone?", zh: "为什么融合注视 + 手 + 物体，比任一单独信号更能恢复意图？" },
          answer: {
            en: "They form the eye–hand coordination chain: gaze anchors the target first, the hand is guided there, contact follows. Each disambiguates the others — gaze picks the active object among many, the hand confirms commitment, the object constrains the action — so together they reconstruct the micro-structure of the plan that any single cue would leave ambiguous.",
            zh: "它们构成眼–手协调链：注视先锚定目标，手被引导过去，接触随之发生。每个信号都为其他消歧——注视在众多物体中选出活动物体，手确认「下注」，物体约束动作——故合在一起能重建任一单一线索都会留下歧义的计划微观结构。",
          },
          hint: { en: "Gaze, reach, and grasp happen in a coordinated sequence — what does each add?", zh: "注视、伸手与抓取按协调的顺序发生——各自添加了什么？" },
        },
      ],
      links: ["C4", "C8", "D7"],
      papers: [{ title: "In the Eye of the Beholder: Gaze and Actions in First Person Video (EGTEA)", year: 2018 }],
    },
    {
      id: "C8",
      trackId: "C",
      index: 8,
      title: { en: "Task structure & intention modeling", zh: "任务结构与意图建模" },
      summary: {
        en: "Lift moments into goals — actions compose into tasks with hierarchy and order.",
        zh: "把瞬间提升为目标——动作组合成有层级与顺序的任务。",
      },
      body: {
        en: "Recognition and anticipation operate on short windows. **Intention modeling** lifts those moments into the *goal* that organizes them. Making coffee is not a bag of actions; it is a partially-ordered plan: grind, then brew, then pour — with sub-goals and reorderable steps.\n\nKey representations:\n\n- **Hierarchy.** Long activities decompose into sub-activities into atomic actions (a tree). The same grind-step appears in many recipes; sharing structure across tasks improves data efficiency.\n- **Temporal order & dependencies.** A graph of *what must precede what* encodes preconditions (can't pour before brewing). This is a learned **action grammar**.\n- **Goal inference.** Given the actions so far, infer the latent goal — which then sharply constrains the future, closing the loop with anticipation (Lesson 4) and gaze (Lesson 7).\n\nThis is where Track C reaches toward the rest of the curriculum: intentions are about an agent pursuing goals in a structured world, the same abstraction that **world models** (Track D) formalize. Procedure understanding is the cognitive layer above perception.",
        zh: "识别与预判作用于短窗口。**意图建模**把这些瞬间提升为组织它们的*目标*。冲咖啡不是一袋动作，而是一个偏序计划：先磨，再萃，再倒——带有子目标和可重排的步骤。\n\n关键表示：\n\n- **层级。** 长活动分解为子活动再到原子动作（一棵树）。同一个「磨」步骤出现在许多配方里；跨任务共享结构提升数据效率。\n- **时间顺序与依赖。** 一张*何者须先于何者*的图编码了前置条件（萃取前不能倒）。这是一种学到的**动作语法**。\n- **目标推断。** 给定至今的动作，推断潜在目标——它随即强烈约束未来，与预判（第 4 课）和注视（第 7 课）闭环。\n\n这正是 Track C 伸向课程其余部分之处：意图关乎一个在结构化世界中追求目标的智能体，与**世界模型**（Track D）所形式化的是同一抽象。流程理解是感知之上的认知层。",
      },
      keyTerms: [
        { term: "Action grammar", def: { en: "Learned precedence/dependency structure constraining valid action sequences.", zh: "学到的先后/依赖结构，约束有效的动作序列。" } },
        { term: "Goal inference", def: { en: "Estimating the latent objective from observed partial behavior.", zh: "从观察到的部分行为估计潜在目标。" } },
      ],
      checks: [
        {
          id: "C8-q1",
          prompt: { en: "How does inferring the latent goal improve action anticipation?", zh: "推断潜在目标如何改进动作预判？" },
          answer: {
            en: "The goal is a strong prior over the remaining plan: once you know the actor is 'making coffee', the distribution over next actions collapses onto the steps of that procedure and their valid orderings. It turns open-ended forecasting into constrained sequence completion.",
            zh: "目标是对剩余计划的强先验：一旦知道行动者在「冲咖啡」，下一动作的分布就收缩到该流程的步骤及其有效顺序上。它把开放式预测变成了受约束的序列补全。",
          },
        },
        {
          id: "C8-q2",
          prompt: { en: "Why represent a task as a partial order rather than a fixed sequence?", zh: "为什么把任务表示为偏序而非固定序列？" },
          answer: {
            en: "Many steps are interchangeable in order (add sugar before or after milk) while a few have hard dependencies. A partial order captures exactly the real constraints without over-committing to one valid path, so the model accepts all correct executions and only flags true violations.",
            zh: "许多步骤顺序可互换（先加糖或先加奶皆可），而少数有硬依赖。偏序恰好捕捉真实约束，而不过度承诺某一条有效路径，因此模型接受所有正确执行，只标记真正的违规。",
          },
        },
        {
          id: "C8-q3",
          prompt: { en: "Why does a hierarchical task representation (activity → sub-activity → atomic action) improve data efficiency?", zh: "为什么层级化的任务表示（活动 → 子活动 → 原子动作）提升数据效率？" },
          answer: {
            en: "Sub-routines recur across tasks — the same 'grind' or 'pour' step appears in many recipes. A hierarchy lets the model learn each reusable building block once and recompose it, so it generalizes to new tasks built from familiar sub-activities instead of needing examples of every full activity end-to-end.",
            zh: "子例程在任务间复现——同一个「磨」或「倒」的步骤出现在许多配方里。层级让模型把每个可复用的构件学一次再重组，于是它能泛化到由熟悉子活动组成的新任务，而无需每个完整活动的端到端样本。",
          },
          hint: { en: "How many recipes share the exact 'pour water' step?", zh: "有多少配方共享完全相同的「倒水」步骤？" },
        },
        {
          id: "C8-q4",
          prompt: { en: "Intention modeling is said to reach toward Track D's world models. What abstraction do they share?", zh: "意图建模据说伸向 Track D 的世界模型。它们共享什么抽象？" },
          answer: {
            en: "Both model an agent pursuing goals in a structured world with state, dynamics, and constraints. Intention modeling infers the latent goal and valid action orderings from behavior; world models formalize how the world evolves under actions. Procedure understanding is the cognitive layer above perception that connects 'what is happening' to 'what the agent is trying to achieve' — the bridge to planning.",
            zh: "两者都建模一个在带有状态、动态与约束的结构化世界中追求目标的智能体。意图建模从行为推断潜在目标与有效动作顺序；世界模型形式化世界在动作下如何演化。流程理解是感知之上的认知层，把「正在发生什么」与「智能体想达成什么」连接起来——通向规划的桥梁。",
          },
          hint: { en: "Both describe an agent with goals acting in a world with rules.", zh: "两者都描述一个有目标的智能体在有规则的世界中行动。" },
        },
      ],
      links: ["C4", "D8", "D9"],
      papers: [{ title: "Ego4D Long-Term Action Anticipation & Procedure Understanding", year: 2022 }],
    },
    {
      id: "C9",
      trackId: "C",
      index: 9,
      title: { en: "Paper deep-dive & reproducing a model", zh: "论文精读与复现一个模型" },
      summary: {
        en: "Consolidate the track: read one paper deeply and reproduce a small, honest baseline.",
        zh: "巩固整条赛道：深读一篇论文，复现一个小而诚实的基线。",
      },
      body: {
        en: "Close the track by reproducing one concrete result — pick a project and build the simplest honest version:\n\n**① Action recognition on EPIC-Kitchens-100.** Grab labels from `epic-kitchens/epic-kitchens-100-annotations` plus a few participants' RGB frames. Extract clip features with a pretrained backbone (SlowFast via PySlowFast, or VideoMAE), train a small head to predict the (verb, noun) pair, and report top-1/top-5 for verb / noun / action with the official metric on held-out kitchens.\n\n**② Action anticipation — RU-LSTM.** Clone `fpv-iplab/rulstm`, run its EPIC pipeline, reproduce the top-5 anticipation score at τ = 1 s, then ablate the rolling-vs-unrolling LSTM to see what it actually buys.\n\n**③ Hand–object interaction.** Run the 100DOH detector (`ddshan/hand_object_detector`) on your own head-cam clips; overlay hand boxes, left/right side, and contact state, and note where it breaks.\n\nWhatever you choose, **deep-dive the paper behind it**: write down the exact input/output, the loss, the baseline it beats and by how much, and the one ablation that isolates the key idea. **Deliverable:** a metric you trust on a held-out split + a notebook you can drop a new idea into — the bridge from *learning the field* to *doing the field*.",
        zh: "以复现一个具体结果来收尾本赛道——挑一个项目，搭最简单、诚实的版本：\n\n**① EPIC-Kitchens-100 动作识别。** 从 `epic-kitchens/epic-kitchens-100-annotations` 取标注，加上几位参与者的 RGB 帧。用预训练骨干（PySlowFast 的 SlowFast，或 VideoMAE）抽片段特征，训练一个小头部预测（动词，名词）对，在留出厨房上用官方指标报告动词/名词/动作的 top-1/top-5。\n\n**② 动作预判——RU-LSTM。** 克隆 `fpv-iplab/rulstm`，跑通其 EPIC 流程，复现 τ = 1 秒时的 top-5 预判分数，再消融 rolling 与 unrolling LSTM，看它究竟带来多少增益。\n\n**③ 手–物交互。** 在你自己的头戴相机片段上运行 100DOH 检测器（`ddshan/hand_object_detector`）；叠加手框、左右手、接触状态，记录它在哪里失效。\n\n无论选哪个，都**精读其背后的论文**：写下确切的输入/输出、损失、它击败的基线及领先多少、以及分离关键想法的那个消融。**交付物：** 一个你在留出划分上信得过的指标 + 一个能塞进新想法的 notebook——这是从*学习领域*走向*从事领域*的桥梁。",
      },
      keyTerms: [
        { term: "Honest baseline", def: { en: "The simplest pipeline that yields a trustworthy, reproducible number you can build on.", zh: "能给出可信、可复现数字、并可在其上扩展的最简流水线。" } },
        { term: "Ablation", def: { en: "Removing one component to measure its contribution and isolate the key idea.", zh: "移除一个组件以衡量其贡献、分离关键想法。" } },
      ],
      checks: [
        {
          id: "C9-q1",
          prompt: { en: "Why start by reproducing a simple baseline instead of the state of the art?", zh: "为什么先复现简单基线，而不是最先进方法？" },
          answer: {
            en: "A simple baseline is fast to get correct, exposes the data/metric/harness clearly, and gives a trustworthy reference point. SOTA reproductions are brittle (many undocumented tricks) and obscure which component matters. You can only attribute your own improvement if you control a baseline you fully understand.",
            zh: "简单基线能快速做对，清晰暴露数据/指标/脚手架，并提供可信的参考点。SOTA 复现脆弱（许多未记录的技巧），且掩盖了哪个组件重要。只有掌控一个你完全理解的基线，才能把改进归因于你自己的想法。",
          },
        },
        {
          id: "C9-q2",
          prompt: { en: "You reproduce a paper and get a number 5 points below its reported score. List two principled first checks.", zh: "你复现一篇论文，得到的数字比其报告低 5 个点。列出两个有原则的首要检查。" },
          answer: {
            en: "(1) Confirm the evaluation matches exactly — same split, same metric definition, same pre/post-processing; mismatches here explain most gaps. (2) Confirm the inputs match — same backbone weights, frame sampling, and normalization. Only after data+metric+inputs align should you suspect the model code itself.",
            zh: "(1) 确认评估完全一致——相同划分、相同指标定义、相同前/后处理；这里的不一致解释了大多数差距。(2) 确认输入一致——相同骨干权重、抽帧、归一化。只有在数据+指标+输入对齐之后，才该怀疑模型代码本身。",
          },
        },
        {
          id: "C9-q3",
          prompt: { en: "Why is the one decisive ablation often more informative than the paper's headline accuracy number?", zh: "为什么那个决定性的消融，往往比论文的标题准确率数字更有信息量？" },
          answer: {
            en: "The headline number says the system works; the ablation says *why* — it isolates the contribution of the key idea by removing it and showing the drop. That causal attribution is what transfers: you learn which component to keep, reuse, or improve, whereas a single aggregate score tells you nothing about what's load-bearing.",
            zh: "标题数字说明系统有效；消融说明*为什么*——它通过移除关键想法并展示下降，分离出该想法的贡献。这种因果归因才可迁移：你学到该保留、复用或改进哪个组件，而单一的总分对什么在承重只字未提。",
          },
          hint: { en: "One tells you it works; the other tells you which part makes it work.", zh: "一个告诉你它有效；另一个告诉你哪一部分使它有效。" },
        },
        {
          id: "C9-q4",
          prompt: { en: "Why is a trustworthy held-out number — not matching SOTA — the real deliverable of a reproduction?", zh: "为什么可信的留出数字——而非追平 SOTA——才是复现的真正交付物？" },
          answer: {
            en: "A number you can trust on a proper held-out split is the measurement instrument for everything you do next: only against a controlled, understood baseline can you tell whether your new idea actually helped. Chasing SOTA without that foundation gives a fragile number you can't build on or attribute improvements to.",
            zh: "在恰当留出划分上你信得过的数字，是你之后一切工作的测量仪器：只有对着一个受控、被理解的基线，你才能判断新想法是否真的有用。没有这个基础去追 SOTA，得到的是一个脆弱、无法在其上扩展、也无法归因改进的数字。",
          },
          hint: { en: "What lets you prove your next idea actually improved things?", zh: "是什么让你能证明你的下一个想法确实带来了改进？" },
        },
      ],
      links: ["C3", "C4", "B9"],
      papers: [],
    },
  ],
};
