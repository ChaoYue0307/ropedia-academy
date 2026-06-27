import { useState } from "react";
import { FigureFrame } from "./FigureFrame";
import { useStore } from "../../lib/store";
import type { Bilingual } from "../../lib/types";
import { pick } from "../../lib/i18n";

interface Node { id: string; label: Bilingual; x: number; y: number }
interface Edge { a: string; b: string; rel: Bilingual }

const NODES: Node[] = [
  { id: "table", label: { en: "table", zh: "桌子" }, x: 180, y: 118 },
  { id: "mug", label: { en: "mug", zh: "杯子" }, x: 138, y: 86 },
  { id: "book", label: { en: "book", zh: "书" }, x: 216, y: 88 },
  { id: "lamp", label: { en: "lamp", zh: "台灯" }, x: 180, y: 52 },
  { id: "chair", label: { en: "chair", zh: "椅子" }, x: 280, y: 132 },
  { id: "floor", label: { en: "floor", zh: "地板" }, x: 180, y: 185 },
];
const EDGES: Edge[] = [
  { a: "mug", b: "table", rel: { en: "on", zh: "在…上" } },
  { a: "book", b: "table", rel: { en: "on", zh: "在…上" } },
  { a: "lamp", b: "table", rel: { en: "on", zh: "在…上" } },
  { a: "chair", b: "table", rel: { en: "next to", zh: "在…旁" } },
  { a: "table", b: "floor", rel: { en: "on", zh: "在…上" } },
];

export function SceneGraphDemo() {
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [graph, setGraph] = useState(true);
  const [sel, setSel] = useState<string | null>(null);
  const byId = (id: string) => NODES.find((n) => n.id === id)!;
  const edgeActive = (e: Edge) => !sel || e.a === sel || e.b === sel;

  return (
    <FigureFrame
      title={{ en: "Flat map → scene graph", zh: "扁平地图 → 场景图" }}
      caption={{
        en: "A flat semantic map only lists what exists. A scene graph adds nodes (objects) + edges (relations) and hierarchy — now you can answer 'is the mug on the table?' and hand a compact, language-ready structure to a planner or LLM. Toggle the view; click a node to trace its relations.",
        zh: "扁平语义地图只列出有什么。场景图加入节点（物体）+ 边（关系）与层级——于是你能回答「杯子在桌上吗？」，并把紧凑、面向语言的结构交给规划器或 LLM。切换视图；点击节点追踪其关系。",
      }}
      onReset={() => {
        setGraph(true);
        setSel(null);
      }}
    >
      <svg viewBox="0 0 360 215" className="w-full">
        {graph && (
          <rect x={70} y={28} width={250} height={172} rx={14} fill="none" stroke="#6a5ef0" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
        )}
        {graph && (
          <text x={78} y={42} fontSize="9" fill="#6a5ef0" opacity={0.8}>
            {zh ? "房间" : "room"}
          </text>
        )}
        {graph &&
          EDGES.map((e, i) => {
            const a = byId(e.a);
            const b = byId(e.b);
            const active = edgeActive(e);
            return (
              <g key={i} opacity={active ? 1 : 0.18}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#9b95c9" strokeWidth={1.4} />
                <rect x={(a.x + b.x) / 2 - 15} y={(a.y + b.y) / 2 - 7} width={30} height={13} rx={6} fill="currentColor" className="text-white dark:text-[#1b1a24]" />
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 3} textAnchor="middle" fontSize="8" fill="#6a5ef0">
                  {pick(e.rel, mode)}
                </text>
              </g>
            );
          })}
        {NODES.map((n) => {
          const active = !sel || sel === n.id || EDGES.some((e) => (e.a === sel && e.b === n.id) || (e.b === sel && e.a === n.id));
          return (
            <g key={n.id} onClick={() => setSel(sel === n.id ? null : n.id)} style={{ cursor: "pointer" }} opacity={active ? 1 : 0.3}>
              <circle cx={n.x} cy={n.y} r={16} fill={sel === n.id ? "#6a5ef0" : "currentColor"} className={sel === n.id ? "" : "text-white dark:text-[#23222e]"} stroke="#6a5ef0" strokeWidth={1.5} />
              <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="9" fontWeight="500" fill={sel === n.id ? "#fff" : "#6a5ef0"}>
                {pick(n.label, mode)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex rounded-lg border border-stone-200 p-0.5 text-xs dark:border-white/10">
        {[
          { v: false, l: zh ? "扁平地图" : "flat map" },
          { v: true, l: zh ? "场景图" : "scene graph" },
        ].map((o) => (
          <button
            key={String(o.v)}
            onClick={() => { setGraph(o.v); setSel(null); }}
            className={"flex-1 rounded-md px-2 py-1 font-medium transition " + (graph === o.v ? "bg-brand-600 text-white" : "text-ink/60 dark:text-stone-400")}
          >
            {o.l}
          </button>
        ))}
      </div>
    </FigureFrame>
  );
}
