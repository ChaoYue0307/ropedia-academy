import type { Bilingual } from "../types";

// 2–3 concrete learning outcomes per lesson — "by the end you can…".
// Shown at the top of each lesson to orient the reader and anchor the checks.
export const lessonObjectives: Record<string, Bilingual[]> = {
  // ── Track A — Human Modeling & Motion ──────────────────────────────────────
  A1: [
    { en: "Explain why predicting ~80 SMPL parameters beats regressing ~6890 vertices.", zh: "解释为什么预测约 80 个 SMPL 参数胜过回归约 6890 个顶点。" },
    { en: "Describe how shape β and pose θ disentangle identity from articulation.", zh: "描述形状 β 与姿态 θ 如何把身份与关节运动解耦。" },
    { en: "State what pose-dependent corrective blendshapes fix.", zh: "说出姿态相关的校正混合形变修正了什么。" },
  ],
  A2: [
    { en: "Explain why heatmaps are preferred over direct coordinate regression.", zh: "解释为什么热图优于直接坐标回归。" },
    { en: "Describe how video resolves single-image depth ambiguity.", zh: "描述视频如何消解单张图像的深度歧义。" },
    { en: "Contrast top-down vs bottom-up pose estimation.", zh: "对比自顶向下与自底向上的姿态估计。" },
  ],
  A3: [
    { en: "Justify a skeleton-graph representation over a flat joint vector.", zh: "论证骨架图表示相比扁平关节向量的优势。" },
    { en: "Explain why velocity features help over absolute positions.", zh: "解释速度特征相比绝对位置为何有帮助。" },
    { en: "Recognize the shift toward self-supervised motion pretraining.", zh: "认识向自监督运动预训练的转变。" },
  ],
  A4: [
    { en: "Explain how a reprojection loss trains 3D recovery without 3D labels.", zh: "解释重投影损失如何在无 3D 标注下训练 3D 恢复。" },
    { en: "Justify why an adversarial/statistical pose prior is needed.", zh: "论证为什么需要对抗/统计姿态先验。" },
    { en: "Identify the scale–depth ambiguity from joint camera estimation.", zh: "识别联合相机估计带来的尺度–深度歧义。" },
  ],
  A5: [
    { en: "Explain why hands and faces get dedicated parametric models.", zh: "解释为什么手与脸有专用的参数化模型。" },
    { en: "Describe what SMPL-X unifies and why one coordinate frame matters.", zh: "描述 SMPL-X 统一了什么，以及单一坐标系为何重要。" },
    { en: "Recognize the shared SMPL recipe reused in MANO/FLAME.", zh: "识别 MANO/FLAME 复用的共享 SMPL 配方。" },
  ],
  A6: [
    { en: "Explain why ≤4D rotation encodings are discontinuous and hard to learn.", zh: "解释为什么 ≤4D 旋转编码不连续、难以学习。" },
    { en: "Describe how a 6D representation recovers a valid rotation.", zh: "描述 6D 表示如何恢复一个有效旋转。" },
    { en: "Justify local (parent-relative) joint frames.", zh: "论证局部（相对父节点）关节坐标系。" },
  ],
  A7: [
    { en: "Distinguish the regularizer vs generator roles of a motion prior.", zh: "区分运动先验的正则项与生成器两种角色。" },
    { en: "Explain why diffusion suits multimodal motion generation.", zh: "解释扩散为何适合多模态运动生成。" },
    { en: "Explain why physical plausibility (no foot-skating) is hard.", zh: "解释为什么物理合理性（无脚滑）很难。" },
  ],
  A8: [
    { en: "Explain how scene contact disambiguates a 3D pose estimate.", zh: "解释场景接触如何消解 3D 姿态估计的歧义。" },
    { en: "Describe why contact is a nearly-free supervision signal.", zh: "描述为什么接触是近乎免费的监督信号。" },
    { en: "Define affordance and how geometry yields it.", zh: "定义可供性，以及几何如何产生它。" },
  ],
  A9: [
    { en: "Diagnose a depth-flip to the loss term that is too weak.", zh: "把深度翻转诊断到太弱的那个损失项。" },
    { en: "Justify optimization (SMPLify) vs a regressor for a one-off clip.", zh: "为一次性片段论证优化（SMPLify）与回归器的取舍。" },
    { en: "Use term-by-term ablation to understand a loss.", zh: "用逐项消融来理解一个损失。" },
  ],

  // ── Track B — 3D/4D Reconstruction & Neural Rendering ──────────────────────
  B1: [
    { en: "Explain why a single calibrated image can't recover a 3D point.", zh: "解释为什么单张已标定图像无法恢复一个 3D 点。" },
    { en: "State the role of homogeneous coordinates in projection.", zh: "说出齐次坐标在投影中的作用。" },
    { en: "Distinguish intrinsics K from extrinsics [R|t].", zh: "区分内参 K 与外参 [R|t]。" },
  ],
  B2: [
    { en: "Explain how the epipolar constraint reduces matching to 1D.", zh: "解释对极约束如何把匹配降为 1D。" },
    { en: "Justify why triangulation is solved as least squares.", zh: "论证为什么三角测量按最小二乘求解。" },
    { en: "Explain why correspondence, not geometry, is the bottleneck.", zh: "解释为什么瓶颈是对应而非几何。" },
  ],
  B3: [
    { en: "State exactly what bundle adjustment minimizes and over what.", zh: "说出光束法平差究竟最小化什么、对哪些变量。" },
    { en: "Explain why BA is sparse and why that matters.", zh: "解释为什么 BA 是稀疏的，以及这为何重要。" },
    { en: "Describe the PnP vs BA division of labor.", zh: "描述 PnP 与 BA 的分工。" },
  ],
  B4: [
    { en: "Give two advantages of an implicit SDF over a triangle mesh.", zh: "举出隐式 SDF 相比三角网格的两个优点。" },
    { en: "Relate Track D's TSDF to the SDF concept.", zh: "把 Track D 的 TSDF 与 SDF 概念联系起来。" },
    { en: "Explain how the zero level-set and ∇f give a surface and normals.", zh: "解释零等值面与 ∇f 如何给出表面与法向。" },
  ],
  B5: [
    { en: "Explain what photometric signal trains a NeRF without 3D labels.", zh: "解释什么光度信号在无 3D 标注下训练 NeRF。" },
    { en: "Justify why positional encoding is necessary.", zh: "论证为什么需要位置编码。" },
    { en: "Describe what transmittance T does for occlusion.", zh: "描述透射率 T 对遮挡的作用。" },
  ],
  B6: [
    { en: "Explain why a feature grid trains far faster than a monolithic MLP.", zh: "解释为什么特征网格比单体 MLP 训练快得多。" },
    { en: "Explain why hash collisions aren't catastrophic.", zh: "解释为什么哈希冲突不是灾难。" },
    { en: "Justify the multi-resolution design.", zh: "论证多分辨率设计。" },
  ],
  B7: [
    { en: "Explain why 3DGS renders in real time when NeRF usually doesn't.", zh: "解释为什么 3DGS 能实时渲染，而 NeRF 通常不能。" },
    { en: "Describe why explicit Gaussians ease adding semantics.", zh: "描述为什么显式高斯便于附加语义。" },
    { en: "Identify the three lineages 3DGS synthesizes.", zh: "指出 3DGS 综合的三条脉络。" },
  ],
  B8: [
    { en: "Explain why a canonical model + deformation field beats per-frame fits.", zh: "解释为什么标准模型 + 形变场胜过逐帧拟合。" },
    { en: "Name a prior that constrains under-determined 4D reconstruction.", zh: "说出一个约束欠定 4D 重建的先验。" },
    { en: "Identify when the canonical+deformation factorization breaks.", zh: "识别标准+形变分解何时失效。" },
  ],
  B9: [
    { en: "Diagnose floaters to under-observed density (not the model).", zh: "把漂浮物诊断为观测不足的密度（而非模型）。" },
    { en: "Explain why bad camera poses masquerade as model failure.", zh: "解释为什么坏相机位姿会伪装成模型失败。" },
    { en: "Tell floaters and blur apart by root cause.", zh: "按根因区分漂浮物与模糊。" },
  ],

  // ── Track C — Egocentric Vision & Interaction ──────────────────────────────
  C1: [
    { en: "Name two ways camera motion is a signal, not just nuisance.", zh: "说出相机运动是信号（而非干扰）的两种方式。" },
    { en: "Explain why third-person action models transfer poorly here.", zh: "解释为什么第三人称动作模型在这里迁移得差。" },
    { en: "Explain why egocentric video uniquely reveals goals.", zh: "解释为什么第一人称视频尤其能揭示目标。" },
  ],
  C2: [
    { en: "Explain why a participant/kitchen-held-out split is more meaningful.", zh: "解释为什么按参与者/厨房留出的划分更有意义。" },
    { en: "Say why Ego4D defines a benchmark suite, not one task.", zh: "说出 Ego4D 为何定义一套基准而非单一任务。" },
    { en: "Value multimodal, co-registered annotation across tracks.", zh: "理解跨赛道、共配准的多模态标注的价值。" },
  ],
  C3: [
    { en: "Explain why video MAE needs a higher masking ratio than image MAE.", zh: "解释为什么视频 MAE 需要比图像 MAE 更高的掩码比例。" },
    { en: "Justify SlowFast's two pathways at different frame rates.", zh: "论证 SlowFast 两条不同帧率的通路。" },
    { en: "Recognize the hand-designed-bias → learned-at-scale arc.", zh: "认识「手工偏置 → 大规模学习」的弧线。" },
  ],
  C4: [
    { en: "Explain why top-1 is a poor metric for anticipation.", zh: "解释为什么 top-1 不适合作为预判指标。" },
    { en: "Identify the most predictive egocentric cue for the next action.", zh: "指出对下一动作最具预测力的第一人称线索。" },
    { en: "Explain why anticipation is strictly harder than recognition.", zh: "解释为什么预判严格地比识别更难。" },
  ],
  C5: [
    { en: "Name the first-person prior that helps detect the wearer's hands.", zh: "说出有助于检测佩戴者手部的第一人称先验。" },
    { en: "Explain why segmentation (not a box) is needed downstream.", zh: "解释为什么下游需要分割（而非框）。" },
    { en: "Explain why self-occlusion is the dominant failure mode.", zh: "解释为什么自遮挡是最主要的失败模式。" },
  ],
  C6: [
    { en: "Explain why jointly inferring grasp and object beats two detectors.", zh: "解释为什么联合推断抓取与物体胜过两个检测器。" },
    { en: "Describe how the 'active object' simplifies recognition.", zh: "描述「活动物体」如何简化识别。" },
    { en: "Explain why HOI is where 2D perception starts demanding 3D.", zh: "解释为什么 HOI 是 2D 感知开始索要 3D 之处。" },
  ],
  C7: [
    { en: "Explain why gaze leads the corresponding hand action in time.", zh: "解释为什么注视在时间上领先于相应的手部动作。" },
    { en: "Get a useful gaze/attention signal without an eye tracker.", zh: "在没有眼动仪时获得有用的注视/注意力信号。" },
    { en: "Describe how fusing gaze+hand+object recovers intention.", zh: "描述融合注视+手+物体如何恢复意图。" },
  ],
  C8: [
    { en: "Explain how inferring the latent goal improves anticipation.", zh: "解释推断潜在目标如何改进预判。" },
    { en: "Justify a partial order over a fixed action sequence.", zh: "论证偏序相比固定动作序列的优势。" },
    { en: "Explain why hierarchy improves data efficiency.", zh: "解释为什么层级提升数据效率。" },
  ],
  C9: [
    { en: "Justify reproducing a simple baseline before the state of the art.", zh: "论证先复现简单基线再做最先进方法。" },
    { en: "List principled first checks for a reproduction gap.", zh: "列出针对复现差距的有原则的首要检查。" },
    { en: "Explain why a trusted held-out number is the real deliverable.", zh: "解释为什么可信的留出数字才是真正的交付物。" },
  ],

  // ── Track D — Scene Reconstruction & World Modeling ────────────────────────
  D1: [
    { en: "Explain why visual odometry alone inevitably drifts.", zh: "解释为什么仅有视觉里程计必然漂移。" },
    { en: "State what loop closure adds to the optimization.", zh: "说出回环检测给优化加入了什么。" },
    { en: "Justify the fast front-end / slow back-end split.", zh: "论证快前端/慢后端的分工。" },
  ],
  D2: [
    { en: "Map each SLAM step to its Track B operation.", zh: "把每个 SLAM 步骤对应到其 Track B 操作。" },
    { en: "Say what a renderable (neural) map gains.", zh: "说出可渲染（神经）地图带来的收益。" },
    { en: "Contrast sparse-feature vs dense/neural SLAM.", zh: "对比稀疏特征与稠密/神经 SLAM。" },
  ],
  D3: [
    { en: "Explain how TSDF fusion denoises depth (multi-frame fusion).", zh: "解释 TSDF 融合如何对深度去噪（多帧融合）。" },
    { en: "Justify truncating the SDF to a band.", zh: "论证把 SDF 截断到一个带。" },
    { en: "Explain why large scenes are tiled into submaps.", zh: "解释为什么大场景被切成子地图。" },
  ],
  D4: [
    { en: "Explain why a class distribution beats a single label per element.", zh: "解释为什么每个元素存类别分布胜过单一标签。" },
    { en: "Say what CLIP features (open-vocabulary) unlock.", zh: "说出 CLIP 特征（开放词汇）解锁了什么。" },
    { en: "Connect 3D semantic fusion to multi-frame denoising.", zh: "把 3D 语义融合与多帧去噪联系起来。" },
  ],
  D5: [
    { en: "State what a scene graph expresses that a flat map can't.", zh: "说出场景图能表达而扁平地图不能的东西。" },
    { en: "Explain why a graph suits an LLM-based planner.", zh: "解释为什么图适合基于 LLM 的规划器。" },
    { en: "Justify hierarchical organization for queries.", zh: "为查询论证层级化组织。" },
  ],
  D6: [
    { en: "Pick the right representation for navigation vs manipulation.", zh: "为导航与操作各选对的表示。" },
    { en: "Explain why mature systems are hybrid.", zh: "解释为什么成熟系统是混合的。" },
    { en: "Name a question each representation answers poorly.", zh: "各说出每种表示答得差的一个问题。" },
  ],
  D7: [
    { en: "Explain 'representation determines reasoning' with examples.", zh: "用例子解释「表示决定推理」。" },
    { en: "Say why a spatial reasoner must commit to a reference frame.", zh: "说出为什么空间推理器必须确定参照系。" },
    { en: "Explain why an LLM consumes a scene graph, not a point cloud.", zh: "解释为什么 LLM 消费场景图而非点云。" },
  ],
  D8: [
    { en: "State what a world model adds over a map and why it enables planning.", zh: "说出世界模型相比地图增加了什么、为何支持规划。" },
    { en: "Place each track in the perception–prediction–planning–action loop.", zh: "把每条赛道放进感知–预测–规划–行动回路。" },
    { en: "Explain why long rollouts degrade (error accumulation).", zh: "解释为什么长滚动会退化（误差累积）。" },
  ],
  D9: [
    { en: "Name three cross-track connections that unify the curriculum.", zh: "说出三处统一整门课程的跨赛道连接。" },
    { en: "Outline a minimal pipeline from video to a queryable scene graph.", zh: "勾勒从视频到可查询场景图的最小流水线。" },
    { en: "Explain why a trusted metric precedes scaling.", zh: "解释为什么可信指标先于扩展规模。" },
  ],
};
