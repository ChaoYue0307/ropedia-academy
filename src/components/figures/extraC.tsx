import { useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

// ── C1 · Egocentric signals: ego-motion + manipulation prior ─────────────────
export function EgoSignals() {
  const zh = useStore((s) => s.lang) === "zh";
  const [motion, setMotion] = useState(14);
  const fx = 20, fy = 12, fw = 320, fh = 150;
  const cx = fx + fw / 2, cy = fy + fh * 0.78;
  return (
    <FigureFrame
      title={{ en: "What makes egocentric different", zh: "第一人称的不同之处" }}
      caption={{
        en: "The head-worn camera moves WITH the actor, so global motion (arrows) is a cue to where the wearer is looking, not just nuisance — and hands & manipulated objects dominate the centre-bottom (the hot region). Increase head motion to see the ego-motion grow.",
        zh: "头戴相机随行动者一起移动，所以全局运动（箭头）是「佩戴者在看哪里」的线索，而非单纯干扰——且手与被操作物体集中在中下部（高亮区）。增大头部运动，观察自我运动变大。",
      }}
      onReset={() => setMotion(14)}
    >
      <svg viewBox="0 0 360 178" className="w-full">
        <rect x={fx} y={fy} width={fw} height={fh} rx={8} fill="currentColor" className="text-stone-100 dark:text-white/5" stroke="#cbd5e1" />
        {/* manipulation hot region */}
        <ellipse cx={cx} cy={cy} rx={86} ry={48} fill="#6a5ef0" fillOpacity={0.22} />
        <ellipse cx={cx} cy={cy} rx={46} ry={26} fill="#6a5ef0" fillOpacity={0.3} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#6a5ef0">{zh ? "手 + 物体" : "hands + objects"}</text>
        {/* ego-motion arrows */}
        {[0, 1, 2, 3].map((i) => {
          const ax = fx + 40 + i * 75, ay = fy + 30;
          return <line key={i} x1={ax} y1={ay} x2={ax + motion} y2={ay + motion * 0.5} stroke="#e0598b" strokeWidth={2} markerEnd="url(#ah)" />;
        })}
        <defs><marker id="ah" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#e0598b" /></marker></defs>
        <text x={fx + 6} y={fy + 18} fontSize="9" fill="#e0598b">{zh ? `自我运动 |v| = ${motion}` : `ego-motion |v| = ${motion}`}</text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "头部运动" : "head motion"} value={motion} min={0} max={28} onChange={setMotion} />
      </div>
    </FigureFrame>
  );
}

// ── C2 · The long tail + why splits matter ───────────────────────────────────
const FREQ = Array.from({ length: 16 }, (_, i) => Math.round(95 * Math.exp(-i * 0.34)) + 2);
export function LongTail() {
  const zh = useStore((s) => s.lang) === "zh";
  const [thr, setThr] = useState(10);
  const [byPart, setByPart] = useState(true);
  const maxF = FREQ[0], BW = 18, X0 = 22, BASE = 130;
  return (
    <FigureFrame
      title={{ en: "Long-tailed actions & honest splits", zh: "长尾动作与诚实划分" }}
      caption={{
        en: "Egocentric action labels (verb, noun) are long-tailed: a few frequent actions, a long rare tail (amber). And the split decides what you measure — holding out whole participants/kitchens tests real generalization; a random split leaks the same scenes into train & test.",
        zh: "第一人称动作标签（动词，名词）呈长尾：少数高频动作，一条长长的稀有尾巴（琥珀色）。划分决定你衡量什么——留出整个参与者/厨房才能考验真正的泛化；随机划分会把相同场景泄漏到训练与测试。",
      }}
      onReset={() => { setThr(10); setByPart(true); }}
    >
      <svg viewBox="0 0 360 158" className="w-full">
        <line x1={X0 - 4} y1={BASE} x2={338} y2={BASE} stroke="#cbd5e1" strokeWidth={1} />
        {FREQ.map((f, i) => {
          const h = (f / maxF) * 104, rare = f < thr;
          return <rect key={i} x={X0 + i * BW} y={BASE - h} width={BW - 4} height={h} rx={2} fill={rare ? "#f59e0b" : "#6a5ef0"} />;
        })}
        <text x={X0} y={16} fontSize="9" fill="#6a5ef0">{zh ? "高频" : "frequent"}</text>
        <text x={300} y={120} fontSize="9" fill="#f59e0b">{zh ? "稀有尾巴" : "rare tail"}</text>
        <text x={X0} y={150} fontSize="9" fill="#9ca3af">{zh ? "动作（按频率排序）" : "actions (by frequency)"}</text>
      </svg>
      <div className="mt-3 space-y-2">
        <Slider label={zh ? "稀有阈值" : "rare threshold"} value={thr} min={2} max={40} onChange={setThr} hint={zh ? "低于此频率的动作算作「稀有」（琥珀色尾巴）。" : "The frequency cutoff below which an action counts as ‘rare’ (the amber tail)."} />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink/60 dark:text-stone-400">{zh ? "划分" : "split"}</span>
          <button onClick={() => setByPart(true)} className={"rounded-md px-2.5 py-1 text-xs font-medium transition " + (byPart ? "bg-emerald-600 text-white" : "border border-stone-200 text-ink/60 dark:border-white/10 dark:text-stone-400")}>{zh ? "留出参与者" : "held-out participant"}</button>
          <button onClick={() => setByPart(false)} className={"rounded-md px-2.5 py-1 text-xs font-medium transition " + (!byPart ? "bg-red-500 text-white" : "border border-stone-200 text-ink/60 dark:border-white/10 dark:text-stone-400")}>{zh ? "随机" : "random"}</button>
          <span className={"ml-auto text-xs font-semibold " + (byPart ? "text-emerald-600" : "text-red-500")}>{byPart ? (zh ? "✓ 无泄漏" : "✓ no leakage") : (zh ? "✗ 场景泄漏" : "✗ scene leakage")}</span>
        </div>
      </div>
    </FigureFrame>
  );
}

// ── C5 · Hand detection: side + own-hand bottom-edge prior ───────────────────
export function HandPrior() {
  const zh = useStore((s) => s.lang) === "zh";
  const [hx, setHx] = useState(206);
  const [hy, setHy] = useState(34);
  const fx = 20, fy = 12, fw = 320, fh = 150, bw = 56, bh = 40;
  const side = hx + bw / 2 < fx + fw / 2 ? (zh ? "左" : "left") : (zh ? "右" : "right");
  const own = hy + bh > fy + fh * 0.8;
  return (
    <FigureFrame
      title={{ en: "Hands: side & ownership prior", zh: "手：左右与归属先验" }}
      caption={{
        en: "Finding hands is the egocentric anchor. Side (left/right) follows from horizontal position; ownership uses a strong first-person prior — the wearer's own hands enter from the bottom edge. Move the box across the frame.",
        zh: "找到手是第一人称的锚点。左右由水平位置决定；归属则用一个强第一人称先验——佩戴者自己的手从底边进入。把框在画面中移动。",
      }}
      onReset={() => { setHx(206); setHy(34); }}
    >
      <svg viewBox="0 0 360 178" className="w-full">
        <rect x={fx} y={fy} width={fw} height={fh} rx={8} fill="currentColor" className="text-stone-100 dark:text-white/5" stroke="#cbd5e1" />
        <rect x={fx} y={fy + fh * 0.8} width={fw} height={fh * 0.2} fill="#1d9e75" fillOpacity={0.12} />
        <text x={fx + 6} y={fy + fh - 7} fontSize="8.5" fill="#1d9e75">{zh ? "自有手进入区（底边）" : "own-hand entry zone"}</text>
        <line x1={fx + fw / 2} y1={fy} x2={fx + fw / 2} y2={fy + fh} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 3" />
        <rect x={hx} y={hy} width={bw} height={bh} rx={6} fill="none" stroke={own ? "#1d9e75" : "#ef4444"} strokeWidth={2.5} />
        <text x={hx + bw / 2} y={hy + bh / 2 + 3} textAnchor="middle" fontSize="9" fill={own ? "#1d9e75" : "#ef4444"}>{side} · {own ? (zh ? "自己" : "own") : (zh ? "他人" : "other")}</text>
      </svg>
      <div className="mt-3 space-y-2">
        <Slider label={zh ? "手框 x" : "box x"} value={hx} min={fx} max={fx + fw - bw} onChange={setHx} hint={zh ? "手框的水平位置——在画面中线的左侧还是右侧（决定左/右手）。" : "Horizontal position of the hand box — left vs right of the frame's centre (which decides the side)."} />
        <Slider label={zh ? "手框 y" : "box y"} value={hy} min={fy} max={fy + fh - bh} onChange={setHy} hint={zh ? "手框的竖直位置——从底边进入意味着是佩戴者自己的手。" : "Vertical position of the hand box — entering from the bottom edge means it's the wearer's own hand."} />
      </div>
    </FigureFrame>
  );
}

// ── C6 · Active object = closest in-contact object to the hand ────────────────
const OBJS = [
  { name: { en: "plate", zh: "盘子" }, x: 70, y: 60 },
  { name: { en: "knife", zh: "刀" }, x: 180, y: 120 },
  { name: { en: "cup", zh: "杯子" }, x: 285, y: 70 },
];
export function ActiveObject() {
  const zh = useStore((s) => s.lang) === "zh";
  const [hx, setHx] = useState(180);
  const hy = 120;
  const d = OBJS.map((o) => Math.hypot(o.x - hx, o.y - hy));
  const active = d.indexOf(Math.min(...d));
  const contact = d[active] < 60;
  return (
    <FigureFrame
      title={{ en: "The active object", zh: "活动物体" }}
      caption={{
        en: "Among many objects in view, only one is being acted on. The ‘active object’ = the one closest to (in contact with) the hand — it filters a cluttered scene to the single noun that matters for recognition. Slide the hand.",
        zh: "视野中众多物体里，只有一个正被作用。「活动物体」= 离手最近（接触）的那一个——它把杂乱场景过滤为对识别真正重要的那个名词。滑动手。",
      }}
      onReset={() => setHx(180)}
    >
      <svg viewBox="0 0 360 178" className="w-full">
        {OBJS.map((o, i) => (
          <g key={i}>
            {i === active && contact && <line x1={hx} y1={hy} x2={o.x} y2={o.y} stroke="#f59e0b" strokeWidth={1.6} strokeDasharray="3 3" />}
            <circle cx={o.x} cy={o.y} r={20} fill={i === active && contact ? "#f59e0b" : "#94a3b8"} fillOpacity={0.85} />
            <text x={o.x} y={o.y + 4} textAnchor="middle" fontSize="9" fill="#fff">{zh ? o.name.zh : o.name.en}</text>
          </g>
        ))}
        <circle cx={hx} cy={hy} r={13} fill="#e0598b" />
        <text x={hx} y={hy + 26} textAnchor="middle" fontSize="9" fontWeight="600" fill="#e0598b">{zh ? "手" : "hand"}</text>
        <text x={20} y={22} fontSize="10" fontWeight="600" fill={contact ? "#f59e0b" : "#9ca3af"}>
          {contact ? (zh ? `活动物体：${OBJS[active].name.zh}` : `active: ${OBJS[active].name.en}`) : (zh ? "无接触" : "no contact")}
        </text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "手 x" : "hand x"} value={hx} min={40} max={320} onChange={setHx} />
      </div>
    </FigureFrame>
  );
}

// ── C8 · Task structure: action grammar + goal inference ─────────────────────
const ACTS = [
  { id: "grind", en: "grind", zh: "磨豆", needs: [] as string[] },
  { id: "water", en: "add water", zh: "加水", needs: [] },
  { id: "brew", en: "brew", zh: "萃取", needs: ["grind", "water"] },
  { id: "pour", en: "pour", zh: "倒出", needs: ["brew"] },
  { id: "milk", en: "add milk", zh: "加奶", needs: [] },
];
const GOALS = { latte: ["grind", "water", "brew", "pour", "milk"], espresso: ["grind", "water", "brew", "pour"] };
export function ActionGrammar() {
  const zh = useStore((s) => s.lang) === "zh";
  const [done, setDone] = useState<string[]>(["grind"]);
  const toggle = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  const valid = ACTS.filter((a) => !done.includes(a.id) && a.needs.every((n) => done.includes(n)));
  const score = (steps: string[]) => done.filter((d) => steps.includes(d)).length / Math.max(1, done.length);
  const post = { latte: score(GOALS.latte), espresso: score(GOALS.espresso) };
  return (
    <FigureFrame
      title={{ en: "Action grammar & goal inference", zh: "动作语法与目标推断" }}
      caption={{
        en: "Tasks follow a partial order: an action unlocks only once its preconditions are done (brew needs grind + water). Tap actions as ‘done’ — valid next steps light up, and the inferred goal sharpens, which is what makes anticipation tractable.",
        zh: "任务遵循偏序：一个动作只有在其前置完成后才解锁（萃取需要磨豆 + 加水）。点选「已完成」的动作——合法的下一步会高亮，推断出的目标随之收敛，这正是预判可行的原因。",
      }}
      onReset={() => setDone(["grind"])}
    >
      <div className="flex flex-wrap gap-2">
        {ACTS.map((a) => {
          const isDone = done.includes(a.id), isNext = valid.some((v) => v.id === a.id);
          return (
            <button key={a.id} onClick={() => toggle(a.id)}
              className={"rounded-lg px-3 py-1.5 text-xs font-medium transition " +
                (isDone ? "bg-emerald-600 text-white" : isNext ? "border-2 border-amber-400 text-amber-600 dark:text-amber-300" : "border border-stone-200 text-ink/50 dark:border-white/10 dark:text-stone-500")}>
              {zh ? a.zh : a.en}{isDone ? " ✓" : isNext ? " →" : ""}
            </button>
          );
        })}
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="text-xs font-medium text-ink/60 dark:text-stone-400">{zh ? "目标后验" : "goal posterior"}</div>
        {(["latte", "espresso"] as const).map((g) => (
          <div key={g} className="flex items-center gap-2">
            <div className="w-16 text-right text-xs text-ink/70 dark:text-stone-300">{g === "latte" ? (zh ? "拿铁" : "latte") : (zh ? "浓缩" : "espresso")}</div>
            <div className="h-4 flex-1 overflow-hidden rounded bg-stone-100 dark:bg-white/5">
              <div className="h-full rounded bg-brand-500 transition-all" style={{ width: `${post[g] * 100}%` }} />
            </div>
            <div className="w-9 text-right font-mono text-[11px] text-ink/50 dark:text-stone-500">{Math.round(post[g] * 100)}%</div>
          </div>
        ))}
      </div>
    </FigureFrame>
  );
}

// ── C9 · Honest baseline: top-k vs a shuffle control ─────────────────────────
export function BaselineMetric() {
  const zh = useStore((s) => s.lang) === "zh";
  const [sig, setSig] = useState(0.6);
  const K = 10, chance = 1 / K;
  const top1 = chance + sig * (0.92 - chance);
  const top5 = 0.5 + sig * 0.48;
  const ctrl = chance + (Math.sin(sig * 7) * 0.02); // stays ~chance regardless of signal
  const bars = [
    { l: { en: "top-1", zh: "top-1" }, v: top1, c: "#6a5ef0" },
    { l: { en: "top-5", zh: "top-5" }, v: top5, c: "#1d9e75" },
    { l: { en: "shuffled", zh: "打乱对照" }, v: ctrl, c: "#ef4444" },
  ];
  const BASE = 120, X0 = 96, BW = 66;
  return (
    <FigureFrame
      title={{ en: "Honest baseline + control", zh: "诚实基线 + 对照" }}
      caption={{
        en: "Before chasing SOTA, build a baseline you trust: frozen features + a small head, reported as top-1/top-5 on a held-out split. The key sanity check is a shuffle control — destroy the signal and accuracy must fall to chance (dashed). Vary the signal strength.",
        zh: "追求 SOTA 之前，先建一个你信得过的基线：冻结特征 + 小头部，在留出划分上报告 top-1/top-5。关键的合理性检查是打乱对照——破坏信号后准确率必须跌到随机水平（虚线）。调节信号强度。",
      }}
      onReset={() => setSig(0.6)}
    >
      <svg viewBox="0 0 360 150" className="w-full">
        <line x1={40} y1={BASE} x2={330} y2={BASE} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={40} y1={BASE - chance * 96} x2={320} y2={BASE - chance * 96} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" />
        <text x={44} y={BASE - chance * 96 - 4} fontSize="8" fill="#ef4444">{zh ? "随机水平" : "chance"}</text>
        {bars.map((b, i) => {
          const h = b.v * 96, x = X0 + i * BW;
          return (
            <g key={i}>
              <rect x={x} y={BASE - h} width={42} height={h} rx={3} fill={b.c} />
              <text x={x + 21} y={BASE - h - 5} textAnchor="middle" fontSize="9" fontWeight="600" fill={b.c}>{(b.v * 100).toFixed(0)}%</text>
              <text x={x + 21} y={BASE + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">{zh ? b.l.zh : b.l.en}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "信号强度" : "signal strength"} value={sig} min={0} max={1} step={0.02} onChange={setSig} format={(v) => `${Math.round(v * 100)}%`} hint={zh ? "特征携带的真实信号量。无论如何，打乱对照都应停留在随机水平。" : "How much real signal the features carry. No matter what, the shuffle control must stay at chance."} />
      </div>
    </FigureFrame>
  );
}
