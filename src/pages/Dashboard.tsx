import { Link } from "react-router-dom";
import { useStore, useCompletedSet } from "../lib/store";
import { tracks, totalLessons, getLesson, trackProgress } from "../lib/curriculum";
import { isDue } from "../lib/srs";
import { t, pick } from "../lib/i18n";
import { BiInline } from "../components/BiText";
import { ProgressRing } from "../components/ProgressRing";
import { MasteryHeatmap } from "../components/MasteryHeatmap";

export function Dashboard() {
  const mode = useStore((s) => s.lang);
  const completed = useCompletedSet();
  const lastLessonId = useStore((s) => s.lastLessonId);
  const srs = useStore((s) => s.srs);
  const reviewing = useStore((s) => s.reviewing);

  const overall = completed.size / totalLessons;
  const dueCount = reviewing.filter((id) => isDue(srs[id])).length;
  const last = lastLessonId ? getLesson(lastLessonId) : undefined;
  const firstUnseen = tracks[0].lessons.find((l) => !completed.has(l.id)) ?? tracks[0].lessons[0];
  const accent = Object.fromEntries(tracks.map((tr) => [tr.id, tr.accent])) as Record<string, string>;

  return (
    <div className="space-y-8">
      <header className="pt-1">
        <Link to="/overview" className="group block overflow-hidden rounded-2xl border border-stone-200/60 shadow-card transition hover:shadow-card-hover dark:border-white/[0.06]">
          <img
            src={`${import.meta.env.BASE_URL}og.png`}
            alt={`${t("appName", mode)} — ${t("tagline", mode)}`}
            width={1200}
            height={630}
            className="block w-full"
          />
        </Link>
        <h1 className="sr-only">{t("appName", mode)}</h1>
      </header>

      {completed.size === 0 && (
        <div className="rounded-2xl border border-brand-200/60 bg-brand-50/40 p-4 dark:border-brand-400/15 dark:bg-brand-500/[0.06]">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-200">
            {mode === "zh" ? "怎么学" : "How it works"}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {[
              { en: "Read a bilingual lesson with live interactive demos", zh: "阅读双语课程，配实时交互演示" },
              { en: "Self-check with reveal-answer questions", zh: "用「揭晓答案」的自检题检验理解" },
              { en: "Add checks to spaced repetition to remember", zh: "把检验题加入间隔重复以记牢" },
              { en: "See how it all links on the concept map", zh: "在概念图上看一切如何关联" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-[13px] leading-snug text-ink/70 dark:text-stone-300">{pick(step, mode)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-brand-200/40 pt-2.5 text-xs text-ink/50 dark:border-brand-400/10 dark:text-stone-400">
            {mode === "zh" ? "提示：按 ⌘K 随时跳转到任意课程或术语。" : "Tip — press ⌘K to jump to any lesson or term."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200/70 bg-white/80 p-5 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-ink/40 dark:text-stone-500">
                {t("overallProgress", mode)}
              </div>
              <div className="mt-1 text-2xl font-bold text-ink dark:text-stone-50">
                {completed.size}
                <span className="text-base font-medium text-ink/40 dark:text-stone-500">
                  {" "}/ {totalLessons}
                </span>
              </div>
              <div className="text-xs text-ink/40 dark:text-stone-500">{t("lessonsDone", mode)}</div>
            </div>
            <ProgressRing value={overall} size={56} stroke={5} />
          </div>
        </div>

        <Link
          to={last ? `/lesson/${last.lesson.id}` : `/lesson/${firstUnseen.id}`}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 shadow-glow transition hover:-translate-y-0.5"
        >
          <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="text-xs font-medium uppercase tracking-wide text-brand-100/90">
            {last ? t("resume", mode) : t("startHere", mode)}
          </div>
          <div className="mt-1 line-clamp-2 text-[15px] font-semibold text-white">
            <BiInline value={(last?.lesson ?? firstUnseen).title} mode={mode} />
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white group-hover:gap-2">
            {t("continue", mode)} <span className="transition-all">→</span>
          </div>
        </Link>

        <Link
          to="/review"
          className="rounded-2xl border border-stone-200/70 bg-white/80 p-5 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-white/[0.07] dark:bg-white/[0.04]"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-ink/40 dark:text-stone-500">
            {t("dueToday", mode)}
          </div>
          <div className="mt-1 text-2xl font-bold text-ink dark:text-stone-50">
            {dueCount}
            <span className="text-base font-medium text-ink/40 dark:text-stone-500"> {t("cards", mode)}</span>
          </div>
          <div className="mt-3 text-sm font-medium text-brand-600 dark:text-brand-300">
            {dueCount > 0 ? `${t("reviewNow", mode)} →` : ""}
          </div>
        </Link>
      </div>

      <MasteryHeatmap />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 dark:text-stone-500">
            {t("navTracks", mode)}
          </h2>
          <Link to="/overview" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">
            {t("researchDirections", mode)} →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tracks.map((track) => {
            const p = trackProgress(track.id, completed);
            return (
              <Link
                key={track.id}
                to={`/track/${track.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-stone-200/70 bg-white/80 p-4 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-white/[0.07] dark:bg-white/[0.04]"
              >
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg font-bold text-white transition group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${track.accent}, ${track.accent}c0)`,
                    boxShadow: `0 8px 20px -8px ${track.accent}`,
                  }}
                >
                  {track.id}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-ink dark:text-stone-100">
                    {pick(track.title, mode)}
                  </div>
                  <div className="truncate text-xs text-ink/45 dark:text-stone-500">
                    {pick(track.subtitle, mode)}
                  </div>
                </div>
                <ProgressRing value={p} size={40} stroke={4} color={track.accent} />
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 dark:text-stone-500">
            {t("trainingLabs", mode)}
          </h2>
          <a
            href={`${LABS_REPO}/tree/main/notebooks/training`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300"
          >
            {t("allLabs", mode)} →
          </a>
        </div>
        <p className="mb-3 text-xs text-ink/45 dark:text-stone-500">{t("trainingLabsDesc", mode)}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {LABS.map((lab) => (
            <a
              key={lab.file}
              href={COLAB + lab.file}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-white/80 p-4 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-white/[0.07] dark:bg-white/[0.04]"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-base font-bold text-white transition group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${accent[lab.track]}, ${accent[lab.track]}c0)`,
                  boxShadow: `0 8px 20px -8px ${accent[lab.track]}`,
                }}
              >
                {lab.track}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold text-ink dark:text-stone-100">{pick(lab.title, mode)}</div>
                <div className="truncate text-xs text-ink/45 dark:text-stone-500">{t("openInColab", mode)}</div>
              </div>
              <span
                className={
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                  (lab.foundation
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                    : "bg-stone-100 text-ink/55 dark:bg-white/10 dark:text-stone-300")
                }
              >
                {pick(lab.foundation ? { en: "Foundation", zh: "基础模型" } : { en: "PyTorch", zh: "PyTorch" }, mode)}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 dark:text-stone-500">
            {t("advancedLabs", mode)}
          </h2>
          <a
            href={`${LABS_REPO}/tree/main/notebooks/advanced`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300"
          >
            {t("allLabs", mode)} →
          </a>
        </div>
        <p className="mb-3 text-xs text-ink/45 dark:text-stone-500">{t("advancedLabsDesc", mode)}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ADV_LABS.map((lab) => (
            <a
              key={lab.file}
              href={ADV_COLAB + lab.file}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-amber-300/50 bg-amber-50/40 p-4 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-amber-400/15 dark:bg-amber-500/[0.05]"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-base font-bold text-white transition group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${accent[lab.track]}, ${accent[lab.track]}c0)`,
                  boxShadow: `0 8px 20px -8px ${accent[lab.track]}`,
                }}
              >
                {lab.track}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold text-ink dark:text-stone-100">{pick(lab.title, mode)}</div>
                <div className="truncate text-xs text-ink/45 dark:text-stone-500">{lab.repo}</div>
              </div>
              <span className="shrink-0 rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                {pick(lab.tag, mode)}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

const LABS_REPO = "https://github.com/ChaoYue0307/ropedia-academy";
const COLAB = "https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/training/";
const LABS = [
  { file: "A_smplify_fit.ipynb", track: "A", title: { en: "Fit a body (SMPLify)", zh: "拟合人体（SMPLify）" }, foundation: false },
  { file: "A_motion_diffusion.ipynb", track: "A", title: { en: "Motion diffusion model", zh: "运动扩散模型" }, foundation: false },
  { file: "B_nerf_from_scratch.ipynb", track: "B", title: { en: "Train a NeRF from scratch", zh: "从零训练 NeRF" }, foundation: false },
  { file: "B_deepsdf_shape.ipynb", track: "B", title: { en: "Neural SDF (DeepSDF-style)", zh: "神经 SDF（DeepSDF）" }, foundation: false },
  { file: "B_gaussian_splatting_2d.ipynb", track: "B", title: { en: "2D Gaussian Splatting", zh: "2D 高斯泼溅" }, foundation: false },
  { file: "CD_clip_zeroshot_probe.ipynb", track: "C", title: { en: "CLIP: zero-shot vs. probe", zh: "CLIP：零样本 vs. 探针" }, foundation: true },
  { file: "C_videomae_finetune.ipynb", track: "C", title: { en: "Fine-tune VideoMAE", zh: "微调 VideoMAE" }, foundation: true },
  { file: "C_dinov2_features_probe.ipynb", track: "C", title: { en: "DINOv2 features + probe", zh: "DINOv2 特征 + 探针" }, foundation: true },
  { file: "D_world_model.ipynb", track: "D", title: { en: "World model + planning", zh: "世界模型 + 规划" }, foundation: false },
];

const ADV_COLAB = "https://colab.research.google.com/github/ChaoYue0307/ropedia-academy/blob/main/notebooks/advanced/";
const ADV_LABS = [
  { file: "A_mdm_text_to_motion.ipynb", track: "A", title: { en: "MDM — text-to-motion", zh: "MDM — 文本生成动作" }, tag: { en: "Generate", zh: "生成" }, repo: "GuyTevet/motion-diffusion-model" },
  { file: "A_4dhumans_mesh.ipynb", track: "A", title: { en: "4D-Humans — mesh from video", zh: "4D-Humans — 视频重建人体" }, tag: { en: "Inference", zh: "推理" }, repo: "shubham-goel/4D-Humans" },
  { file: "B_gaussian_splatting_3d.ipynb", track: "B", title: { en: "3D Gaussian Splatting", zh: "3D 高斯泼溅" }, tag: { en: "Train", zh: "训练" }, repo: "graphdeco-inria/gaussian-splatting" },
  { file: "B_nerfstudio_nerfacto.ipynb", track: "B", title: { en: "Nerfstudio nerfacto", zh: "Nerfstudio nerfacto" }, tag: { en: "Train", zh: "训练" }, repo: "nerfstudio" },
  { file: "C_videomae_egocentric.ipynb", track: "C", title: { en: "VideoMAE — egocentric fine-tune", zh: "VideoMAE — 第一视角微调" }, tag: { en: "Fine-tune", zh: "微调" }, repo: "EPIC-Kitchens / Ego4D" },
  { file: "C_sam2_video_segmentation.ipynb", track: "C", title: { en: "SAM 2 — video segmentation", zh: "SAM 2 — 视频分割" }, tag: { en: "Inference", zh: "推理" }, repo: "facebookresearch/sam2" },
  { file: "D_splatam_slam.ipynb", track: "D", title: { en: "SplaTAM — Gaussian SLAM", zh: "SplaTAM — 高斯 SLAM" }, tag: { en: "Reconstruct", zh: "重建" }, repo: "spla-tam/SplaTAM" },
  { file: "D_dreamerv3_world_model.ipynb", track: "D", title: { en: "DreamerV3 — world model", zh: "DreamerV3 — 世界模型" }, tag: { en: "Train", zh: "训练" }, repo: "danijar/dreamerv3" },
];
