import { lazy, type ComponentType } from "react";
import { NerfRay } from "./NerfRay";
import { AnticipationTopK } from "./AnticipationTopK";
import { PoseHeatmap } from "./extraA";
import { LongTail, HandPrior, ActionGrammar, BaselineMetric } from "./extraC";
import { MapParadigms, Pipeline } from "./extraD";

// 3D viewers are lazy-loaded so three.js ships in a separate chunk, fetched
// only when a lesson with a 3D demo is opened.
const GaussianSplat3D = lazy(() => import("./three/GaussianSplat3D"));
const SmplBody3D = lazy(() => import("./three/SmplBody3D"));
const NerfVolume3D = lazy(() => import("./three/NerfVolume3D"));
const EgoView3D = lazy(() => import("./three/EgoView3D"));
const Pinhole3D = lazy(() => import("./three/Geometry3D").then((m) => ({ default: m.Pinhole3D })));
const Triangulation3D = lazy(() => import("./three/Geometry3D").then((m) => ({ default: m.Triangulation3D })));
const ReferenceFrames3D = lazy(() => import("./three/Geometry3D").then((m) => ({ default: m.ReferenceFrames3D })));
const RotationContinuity3D = lazy(() => import("./three/Geometry3D").then((m) => ({ default: m.RotationContinuity3D })));
const SdfField3D = lazy(() => import("./three/Geometry3D").then((m) => ({ default: m.SdfField3D })));
const TubeMasking3D = lazy(() => import("./three/Geometry3D").then((m) => ({ default: m.TubeMasking3D })));
const TsdfFusion3D = lazy(() => import("./three/Geometry3D").then((m) => ({ default: m.TsdfFusion3D })));
const SmplShape3D = lazy(() => import("./three/Human3D").then((m) => ({ default: m.SmplShape3D })));
const MotionSeq3D = lazy(() => import("./three/Human3D").then((m) => ({ default: m.MotionSeq3D })));
const Hand3D = lazy(() => import("./three/Human3D").then((m) => ({ default: m.Hand3D })));
const ContactScene3D = lazy(() => import("./three/Human3D").then((m) => ({ default: m.ContactScene3D })));
const SmplifyPrior3D = lazy(() => import("./three/Human3D").then((m) => ({ default: m.SmplifyPrior3D })));
const BundleAdjust3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.BundleAdjust3D })));
const Pnp3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.Pnp3D })));
const HashGrid3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.HashGrid3D })));
const Deform3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.Deform3D })));
const Floaters3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.Floaters3D })));
const SlamLoop3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.SlamLoop3D })));
const SemanticFusion3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.SemanticFusion3D })));
const WorldRollout3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.WorldRollout3D })));
const ActiveObject3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.ActiveObject3D })));
const MotionDiffusion3D = lazy(() => import("./three/Human3D").then((m) => ({ default: m.MotionDiffusion3D })));
const GazeScanpath3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.GazeScanpath3D })));
const SceneGraph3D = lazy(() => import("./three/Scene3D").then((m) => ({ default: m.SceneGraph3D })));

// Maps a lesson id to interactive demo components rendered in that lesson.
// Every one of the 36 lessons now has at least one hands-on figure.
export const lessonFigures: Record<string, ComponentType[]> = {
  // Track A — Human Modeling
  A1: [SmplShape3D],
  A2: [PoseHeatmap],
  A3: [MotionSeq3D],
  A4: [SmplBody3D],
  A5: [Hand3D],
  A6: [RotationContinuity3D],
  A7: [MotionDiffusion3D],
  A8: [ContactScene3D],
  A9: [SmplifyPrior3D],
  // Track B — 3D / Neural Rendering
  B1: [Pinhole3D],
  B2: [Triangulation3D],
  B3: [BundleAdjust3D],
  B4: [SdfField3D],
  B5: [NerfRay, NerfVolume3D],
  B6: [HashGrid3D],
  B7: [GaussianSplat3D],
  B8: [Deform3D],
  B9: [Floaters3D],
  // Track C — Egocentric Vision
  C1: [EgoView3D],
  C2: [LongTail],
  C3: [TubeMasking3D],
  C4: [AnticipationTopK],
  C5: [HandPrior],
  C6: [ActiveObject3D],
  C7: [GazeScanpath3D],
  C8: [ActionGrammar],
  C9: [BaselineMetric],
  // Track D — Scene & World Models
  D1: [SlamLoop3D],
  D2: [Pnp3D],
  D3: [TsdfFusion3D],
  D4: [SemanticFusion3D],
  D5: [SceneGraph3D],
  D6: [MapParadigms],
  D7: [ReferenceFrames3D],
  D8: [WorldRollout3D],
  D9: [Pipeline],
};
