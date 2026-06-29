// Real prerequisites per lesson — what you should understand FIRST, including
// cross-track dependencies. Drives the "Builds on" chips (replacing the naive
// "previous lesson in the same track"). Order matters: most important first.
// Lessons absent here (or with an empty list) are entry points with no prereq.
export const lessonPrereqs: Record<string, string[]> = {
  // Track A
  // A1 — entry point (parametric body models)
  A2: ["A1"],
  A3: ["A2"],
  A4: ["A1", "A2", "B1"], // mesh recovery needs SMPL + 2D pose + projection
  A5: ["A1"], // MANO/FLAME = the SMPL recipe specialized
  A6: ["A1", "A3"], // rotations underlie articulation & motion
  A7: ["A3", "A6"], // motion priors build on temporal + rotation encodings
  A8: ["A4", "B4"], // human–scene needs a recovered body + scene geometry
  A9: ["A4", "A7"], // capstone synthesizes recovery + priors

  // Track B
  // B1 — entry point (camera geometry)
  B2: ["B1"],
  B3: ["B1", "B2"], // PnP/BA need projection + triangulation
  B4: ["B1"], // implicit surfaces (some geometry background)
  B5: ["B4"], // NeRF = implicit field + differentiable rendering
  B6: ["B5"], // hash grids speed up NeRF
  B7: ["B5", "B6"], // 3DGS contrasts with NeRF/Instant-NGP
  B8: ["B5", "B7"], // 4D adds time to NeRF/Gaussian
  B9: ["B5", "B7"], // capstone: reproduce NeRF or 3DGS

  // Track C
  // C1 — entry point (what is egocentric vision)
  C2: ["C1"],
  C3: ["C1"], // video backbones (general video understanding)
  C4: ["C2", "C3"], // recognition/anticipation need benchmarks + backbones
  C5: ["C1"], // hand detection
  C6: ["C5", "A5"], // HOI needs hands (+ 3D hand mesh from A5)
  C7: ["C1", "C4"], // gaze ties to anticipation
  C8: ["C4", "C7"], // intention builds on anticipation + gaze
  C9: ["C3", "C4"], // capstone: reproduce a recognition/anticipation model

  // Track D
  // D1 — entry point (SLAM paradox)
  D2: ["D1", "B3"], // SLAM reuses PnP/BA
  D3: ["B4", "D2"], // TSDF fusion = truncated SDF + posed depth
  D4: ["D3"], // semantics fused onto the geometric map
  D5: ["D4"], // scene graphs add relations atop semantics
  D6: ["D3", "D5"], // object- vs space-centric contrasts both
  D7: ["D5", "D6", "A6"], // spatial reasoning needs structure + frames
  D8: ["D7", "C8"], // world models close the agent loop
  D9: ["D8", "B9", "C9"], // capstone synthesizes the whole curriculum
};
