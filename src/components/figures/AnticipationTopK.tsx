import { useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";
import type { Bilingual } from "../../lib/types";
import { pick } from "../../lib/i18n";

interface Scenario {
  context: Bilingual;
  actions: { name: Bilingual; p: number }[];
  trueIdx: number;
}

const SCENARIOS: Scenario[] = [
  {
    context: { en: "After: take pan", zh: "在「拿锅」之后" },
    actions: [
      { name: { en: "add oil", zh: "加油" }, p: 0.38 },
      { name: { en: "crack egg", zh: "打蛋" }, p: 0.27 },
      { name: { en: "turn on stove", zh: "开火" }, p: 0.18 },
      { name: { en: "add salt", zh: "加盐" }, p: 0.1 },
      { name: { en: "wash pan", zh: "洗锅" }, p: 0.07 },
    ],
    trueIdx: 1,
  },
  {
    context: { en: "After: open fridge", zh: "在「开冰箱」之后" },
    actions: [
      { name: { en: "take milk", zh: "拿牛奶" }, p: 0.33 },
      { name: { en: "take egg", zh: "拿鸡蛋" }, p: 0.3 },
      { name: { en: "take butter", zh: "拿黄油" }, p: 0.2 },
      { name: { en: "close fridge", zh: "关冰箱" }, p: 0.1 },
      { name: { en: "take jam", zh: "拿果酱" }, p: 0.07 },
    ],
    trueIdx: 2,
  },
  {
    context: { en: "After: pick up knife", zh: "在「拿起刀」之后" },
    actions: [
      { name: { en: "chop onion", zh: "切洋葱" }, p: 0.38 },
      { name: { en: "cut bread", zh: "切面包" }, p: 0.25 },
      { name: { en: "spread butter", zh: "抹黄油" }, p: 0.18 },
      { name: { en: "peel apple", zh: "削苹果" }, p: 0.12 },
      { name: { en: "wash knife", zh: "洗刀" }, p: 0.07 },
    ],
    trueIdx: 1,
  },
  {
    context: { en: "After: turn on tap", zh: "在「打开水龙头」之后" },
    actions: [
      { name: { en: "fill kettle", zh: "接满水壶" }, p: 0.34 },
      { name: { en: "wash hands", zh: "洗手" }, p: 0.28 },
      { name: { en: "rinse cup", zh: "冲洗杯子" }, p: 0.2 },
      { name: { en: "fill a pot", zh: "接满锅" }, p: 0.11 },
      { name: { en: "wash veg", zh: "洗菜" }, p: 0.07 },
    ],
    trueIdx: 3,
  },
  {
    context: { en: "After: open laptop", zh: "在「打开笔记本」之后" },
    actions: [
      { name: { en: "check email", zh: "查看邮件" }, p: 0.4 },
      { name: { en: "open browser", zh: "打开浏览器" }, p: 0.26 },
      { name: { en: "join a call", zh: "加入通话" }, p: 0.18 },
      { name: { en: "play music", zh: "播放音乐" }, p: 0.1 },
      { name: { en: "shut it down", zh: "关机" }, p: 0.06 },
    ],
    trueIdx: 2,
  },
];

export function AnticipationTopK() {
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [k, setK] = useState(3);
  const [si, setSi] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const sc = SCENARIOS[si];

  const top1 = sc.trueIdx === 0;
  const topK = sc.trueIdx < k;

  return (
    <FigureFrame
      title={{ en: "Action anticipation: top-k", zh: "动作预判：top-k" }}
      caption={{
        en: "The future is multi-modal — several next actions are plausible. Top-1 punishes a well-calibrated model for not reading minds; top-k rewards covering the plausible set. Raise k until the true action is covered.",
        zh: "未来是多模态的——好几个下一动作都说得通。Top-1 会因模型不会读心而惩罚它；top-k 奖励覆盖合理集合。增大 k 直到覆盖真实动作。",
      }}
      onReset={() => {
        setK(3);
        setRevealed(false);
      }}
    >
      <div className="mb-2 text-xs font-medium text-ink/60 dark:text-stone-400">{pick(sc.context, mode)}</div>
      <div className="space-y-1.5">
        {sc.actions.map((a, i) => {
          const inTopK = i < k;
          const isTrue = i === sc.trueIdx;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-20 shrink-0 text-right text-xs text-ink/70 dark:text-stone-300">{pick(a.name, mode)}</div>
              <div className="relative h-5 flex-1 overflow-hidden rounded bg-stone-100 dark:bg-white/5">
                <div
                  className={"h-full rounded transition-all " + (inTopK ? "" : "opacity-40")}
                  style={{ width: `${a.p * 180}%`, backgroundColor: inTopK ? "#6a5ef0" : "#b9b4d8" }}
                />
                {revealed && isTrue && (
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    ✓ {zh ? "真实" : "true"}
                  </span>
                )}
              </div>
              <div className="w-9 shrink-0 text-right font-mono text-[11px] text-ink/50 dark:text-stone-500">{(a.p * 100).toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 space-y-2.5">
        <Slider label={zh ? "k 值" : "k"} value={k} min={1} max={5} onChange={(v) => setK(Math.round(v))} hint={zh ? "若真实动作落在概率最高的前 k 个预测内即算「正确」。k 越大，越能覆盖合理的下一动作。" : "Counts the model correct if the true action is in its top-k predictions. Larger k covers more of the plausible next actions."} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRevealed(true)}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700"
          >
            {zh ? "揭示真实动作" : "reveal true action"}
          </button>
          <button
            onClick={() => { setSi((si + 1) % SCENARIOS.length); setRevealed(false); }}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-ink/70 transition hover:border-brand-300 dark:border-white/10 dark:text-stone-300"
          >
            {zh ? "换一个场景" : "next scenario"}
          </button>
          {revealed && (
            <span className="ml-auto text-xs font-medium">
              <span className={top1 ? "text-emerald-600" : "text-red-500"}>top-1 {top1 ? "✓" : "✗"}</span>
              <span className="mx-1.5 text-stone-300">·</span>
              <span className={topK ? "text-emerald-600" : "text-red-500"}>top-{k} {topK ? "✓" : "✗"}</span>
            </span>
          )}
        </div>
      </div>
    </FigureFrame>
  );
}
