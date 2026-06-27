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

// 3D viewers are lazy-loaded so three.js ships in a separate chunk, fetched
// only when a lesson with a 3D demo is opened.
const GaussianSplat3D = lazy(() => import("./three/GaussianSplat3D"));
const SmplBody3D = lazy(() => import("./three/SmplBody3D"));
const NerfVolume3D = lazy(() => import("./three/NerfVolume3D"));

// Maps a lesson id to interactive demo components rendered in that lesson.
export const lessonFigures: Record<string, ComponentType[]> = {
  A1: [SmplBody],
  A4: [SmplBody3D],
  C3: [TubeMasking],
  C4: [AnticipationTopK],
  C7: [GazeTimeline],
  B1: [PinholeProjection],
  B4: [SdfField],
  B5: [NerfRay, NerfVolume3D],
  B7: [GaussianSplat3D],
  D1: [SlamLoop],
  D3: [TsdfFusion],
  D5: [SceneGraphDemo],
};
