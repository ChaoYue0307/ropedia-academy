import type { Bilingual } from "../types";

// The recurring principles that thread all four tracks. Most methods in the
// curriculum are variations on a handful of these ideas — naming them lets a
// learner compress dozens of techniques into a few transferable patterns.
export interface BigIdea {
  id: string;
  icon: string; // single SVG path, 24x24
  name: Bilingual;
  blurb: Bilingual;
  lessons: string[]; // lesson ids where this idea recurs
}

export const bigIdeas: BigIdea[] = [
  {
    id: "analysis-by-synthesis",
    icon: "M12 3v18M3 12h18M5 5l14 14",
    name: { en: "Analysis by synthesis", zh: "分析–合成" },
    blurb: {
      en: "Parameterize the unknowns, push them through a differentiable forward model (a renderer/projection), and minimize the gap to the observed pixels. Reprojection / photometric error is the universal currency, and differentiability is what makes it trainable.",
      zh: "参数化未知量，让它们通过一个可微的前向模型（渲染器/投影），并最小化与观测像素的差距。重投影/光度误差是通用货币，可微性使其可训练。",
    },
    lessons: ["A4", "B3", "B5", "D2"],
  },
  {
    id: "implicit-surfaces",
    icon: "M3 12c4-6 14-6 18 0M3 12c4 6 14 6 18 0",
    name: { en: "Implicit surfaces & level-sets", zh: "隐式曲面与等值面" },
    blurb: {
      en: "Store geometry as a function, not a list of primitives: a surface is the zero level-set of a signed-distance field. The same idea powers learned shapes, NeRF density fields, and TSDF fusion for mapping.",
      zh: "把几何存为一个函数，而非一串基元：曲面是符号距离场的零等值面。同一想法支撑了学到的形状、NeRF 密度场，以及用于建图的 TSDF 融合。",
    },
    lessons: ["B4", "B5", "D3"],
  },
  {
    id: "multi-frame-fusion",
    icon: "M4 7h16M4 12h16M4 17h16",
    name: { en: "Redundancy denoises (multi-frame fusion)", zh: "冗余去噪（多帧融合）" },
    blurb: {
      en: "Many noisy observations of the same thing, fused, cancel independent per-frame error while the truth reinforces. It cleans depth (TSDF), semantic labels (3D label fusion), and 3D from video — the same trick on different signals.",
      zh: "对同一事物的众多含噪观测，融合后逐帧的独立误差相消，而真值被强化。它清理深度（TSDF）、语义标签（3D 标签融合）与来自视频的 3D——同一招用在不同信号上。",
    },
    lessons: ["A2", "B8", "D3", "D4"],
  },
  {
    id: "representation-reasoning",
    icon: "M4 6h6v6H4zM14 12h6v6h-6zM10 9h4M14 15H7v-3",
    name: { en: "Representation determines reasoning", zh: "表示决定推理" },
    blurb: {
      en: "What you can infer is bounded by how you represent the scene. Choosing voxels vs objects vs a relational graph is choosing which questions — reach, contact, 'on', language — you can even ask.",
      zh: "你能推断什么，受限于你如何表示场景。选体素、物体还是关系图，就是在选你究竟能提出哪些问题——能否够到、接触、「在…上」、语言。",
    },
    lessons: ["B4", "D5", "D6", "D7"],
  },
  {
    id: "bias-to-scale",
    icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
    name: { en: "Hand-designed bias → learned at scale", zh: "手工偏置 → 大规模学习" },
    blurb: {
      en: "The field repeatedly replaces hand-built inductive bias with self-supervised pretraining as data and compute grow — two-stream → masked video, fixed motion filters → learned motion priors, big MLPs → indexed feature grids.",
      zh: "随着数据与算力增长，领域反复用自监督预训练替换手工归纳偏置——双流 → 掩码视频、固定运动滤波器 → 学到的运动先验、大 MLP → 可索引的特征网格。",
    },
    lessons: ["A3", "C3", "B6"],
  },
  {
    id: "error-accumulation",
    icon: "M3 3v18h18M7 14l3-4 3 3 5-7",
    name: { en: "Error accumulation & drift", zh: "误差累积与漂移" },
    blurb: {
      en: "Composing incremental estimates — or predicting from your own predictions — lets small per-step errors grow without bound. Loop closure, priors, hierarchy, or re-observation are what pull the estimate back to truth.",
      zh: "把增量估计相乘累加——或从自己的预测再去预测——会让逐步的小误差无界增长。回环、先验、层级结构或重新观测，才能把估计拉回真值。",
    },
    lessons: ["D1", "A7", "D8"],
  },
  {
    id: "uncertainty-multimodality",
    icon: "M4 18c4 0 4-12 8-12s4 12 8 12",
    name: { en: "Model uncertainty, don't guess one answer", zh: "建模不确定性，别只猜一个" },
    blurb: {
      en: "When several answers are plausible, output a distribution, not a point. Heatmaps over keypoints, top-k over next actions, diffusion over motion, and per-voxel label distributions all keep ambiguity alive until evidence resolves it.",
      zh: "当多个答案都说得通时，输出一个分布而非一个点。关键点的热图、下一动作的 top-k、运动的扩散、逐体素的标签分布，都让歧义存活到证据消解它为止。",
    },
    lessons: ["A2", "C4", "A7", "D4"],
  },
];

export const bigIdeaById: Record<string, BigIdea> = Object.fromEntries(
  bigIdeas.map((i) => [i.id, i]),
);

// lesson id → big-idea ids that recur in it (derived from each idea's lesson list)
export const ideasForLesson: Record<string, string[]> = (() => {
  const m: Record<string, string[]> = {};
  for (const idea of bigIdeas) for (const l of idea.lessons) (m[l] ??= []).push(idea.id);
  return m;
})();
