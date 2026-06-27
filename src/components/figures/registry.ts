import { lazy, type ComponentType } from "react";
import { PinholeProjection } from "./PinholeProjection";
import { NerfRay } from "./NerfRay";
import { TsdfFusion } from "./TsdfFusion";
import { SlamLoop } from "./SlamLoop";
import { TubeMasking } from "./TubeMasking";
import { AnticipationTopK } from "./AnticipationTopK";
import { SdfField } from "./SdfField";
import { SmplBody } from "./SmplBody";
import { SceneGraphDemo } from "./SceneGraphDemo";
import { GazeTimeline } from "./GazeTimeline";
import { PoseHeatmap, MotionSequence, ParametricHand, RotationContinuity, MotionDiffusion, ContactScene, SmplifyPrior } from "./extraA";
import { Triangulation, BundleAdjust, HashGrid, Deformation4D, NerfFloaters } from "./extraB";
import { EgoSignals, LongTail, HandPrior, ActiveObject, ActionGrammar, BaselineMetric } from "./extraC";
import { PnpTracking, SemanticFusion, MapParadigms, ReferenceFrames, WorldModelRollout, Pipeline } from "./extraD";

// 3D viewers are lazy-loaded so three.js ships in a separate chunk, fetched
// only when a lesson with a 3D demo is opened.
const GaussianSplat3D = lazy(() => import("./three/GaussianSplat3D"));
const SmplBody3D = lazy(() => import("./three/SmplBody3D"));
const NerfVolume3D = lazy(() => import("./three/NerfVolume3D"));

// Maps a lesson id to interactive demo components rendered in that lesson.
// Every one of the 36 lessons now has at least one hands-on figure.
export const lessonFigures: Record<string, ComponentType[]> = {
  // Track A — Human Modeling
  A1: [SmplBody],
  A2: [PoseHeatmap],
  A3: [MotionSequence],
  A4: [SmplBody3D],
  A5: [ParametricHand],
  A6: [RotationContinuity],
  A7: [MotionDiffusion],
  A8: [ContactScene],
  A9: [SmplifyPrior],
  // Track B — 3D / Neural Rendering
  B1: [PinholeProjection],
  B2: [Triangulation],
  B3: [BundleAdjust],
  B4: [SdfField],
  B5: [NerfRay, NerfVolume3D],
  B6: [HashGrid],
  B7: [GaussianSplat3D],
  B8: [Deformation4D],
  B9: [NerfFloaters],
  // Track C — Egocentric Vision
  C1: [EgoSignals],
  C2: [LongTail],
  C3: [TubeMasking],
  C4: [AnticipationTopK],
  C5: [HandPrior],
  C6: [ActiveObject],
  C7: [GazeTimeline],
  C8: [ActionGrammar],
  C9: [BaselineMetric],
  // Track D — Scene & World Models
  D1: [SlamLoop],
  D2: [PnpTracking],
  D3: [TsdfFusion],
  D4: [SemanticFusion],
  D5: [SceneGraphDemo],
  D6: [MapParadigms],
  D7: [ReferenceFrames],
  D8: [WorldModelRollout],
  D9: [Pipeline],
};
