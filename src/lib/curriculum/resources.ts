import type { ResourceLink } from "../types";

const W = (slug: string, label: string): ResourceLink => ({ kind: "wiki", label, url: `https://en.wikipedia.org/wiki/${slug}` });

// Curated, stable external resources per lesson. Papers stay in the track files
// (rendered as scholar links); these add encyclopedic, dataset, model & code links.
export const lessonResources: Record<string, ResourceLink[]> = {
  // ---- Track C: Egocentric Vision ----
  C1: [W("Egocentric_vision", "Egocentric vision"), { kind: "dataset", label: "Ego4D dataset", url: "https://ego4d-data.org/" }],
  C2: [
    { kind: "dataset", label: "Ego4D", url: "https://ego4d-data.org/" },
    { kind: "dataset", label: "EPIC-Kitchens", url: "https://epic-kitchens.github.io/" },
    { kind: "dataset", label: "EGTEA Gaze+", url: "https://cbs.ic.gatech.edu/fpv/" },
    { kind: "code", label: "Xperience-10M · HOMIE toolkit", url: "https://github.com/Ropedia/HOMIE-toolkit" },
  ],
  C3: [
    W("Activity_recognition", "Action recognition"),
    { kind: "code", label: "SlowFast (code)", url: "https://github.com/facebookresearch/SlowFast" },
    { kind: "code", label: "VideoMAE (code)", url: "https://github.com/MCG-NJU/VideoMAE" },
  ],
  C4: [W("Activity_recognition", "Activity recognition"), { kind: "dataset", label: "EPIC-Kitchens anticipation", url: "https://epic-kitchens.github.io/" }],
  C5: [{ kind: "code", label: "100 Days of Hands (100DOH)", url: "https://github.com/ddshan/hand_object_detector" }],
  C6: [W("Affordance", "Affordance"), { kind: "code", label: "Hand-Object detector", url: "https://github.com/ddshan/hand_object_detector" }],
  C7: [W("Eye_tracking", "Eye tracking"), { kind: "dataset", label: "EGTEA Gaze+", url: "https://cbs.ic.gatech.edu/fpv/" }],
  C8: [W("Activity_recognition", "Procedure understanding"), { kind: "dataset", label: "Ego4D forecasting", url: "https://ego4d-data.org/docs/benchmarks/forecasting/" }],
  C9: [{ kind: "code", label: "Ego4D code & baselines", url: "https://github.com/EGO4D" }],

  // ---- Track A: Human Modeling ----
  A1: [W("Skeletal_animation", "Linear blend skinning"), { kind: "model", label: "SMPL model", url: "https://smpl.is.tue.mpg.de/" }],
  A2: [W("Articulated_body_pose_estimation", "Pose estimation"), { kind: "code", label: "OpenPose", url: "https://github.com/CMU-Perceptual-Computing-Lab/openpose" }],
  A3: [{ kind: "code", label: "ST-GCN (skeleton action)", url: "https://github.com/yysijie/st-gcn" }],
  A4: [{ kind: "code", label: "HMR (mesh recovery)", url: "https://github.com/akanazawa/hmr" }, { kind: "model", label: "SMPL-X", url: "https://smpl-x.is.tue.mpg.de/" }],
  A5: [{ kind: "model", label: "MANO (hands)", url: "https://mano.is.tue.mpg.de/" }, { kind: "model", label: "FLAME (face)", url: "https://flame.is.tue.mpg.de/" }],
  A6: [W("Quaternions_and_spatial_rotation", "Rotation representations"), W("Gimbal_lock", "Gimbal lock")],
  A7: [W("Diffusion_model", "Diffusion models"), { kind: "code", label: "Motion Diffusion Model", url: "https://github.com/GuyTevet/motion-diffusion-model" }],
  A8: [W("Affordance", "Affordance"), { kind: "dataset", label: "PROX (human-scene)", url: "https://prox.is.tue.mpg.de/" }],
  A9: [{ kind: "code", label: "SMPLify", url: "https://smplify.is.tue.mpg.de/" }],

  // ---- Track B: 3D / Neural Rendering ----
  B1: [W("Pinhole_camera_model", "Pinhole camera model"), W("Camera_resectioning", "Camera calibration")],
  B2: [W("Epipolar_geometry", "Epipolar geometry"), W("Triangulation_(computer_vision)", "Triangulation")],
  B3: [W("Bundle_adjustment", "Bundle adjustment"), W("Structure_from_motion", "Structure from motion"), { kind: "code", label: "COLMAP (SfM)", url: "https://github.com/colmap/colmap" }],
  B4: [W("Signed_distance_function", "Signed distance function"), W("Marching_cubes", "Marching cubes")],
  B5: [W("Neural_radiance_field", "Neural radiance field"), { kind: "web", label: "NeRF project page", url: "https://www.matthewtancik.com/nerf" }],
  B6: [{ kind: "code", label: "Instant-NGP (NVIDIA)", url: "https://github.com/NVlabs/instant-ngp" }],
  B7: [W("Gaussian_splatting", "Gaussian splatting"), { kind: "code", label: "3DGS (INRIA)", url: "https://github.com/graphdeco-inria/gaussian-splatting" }],
  B8: [{ kind: "web", label: "D-NeRF project", url: "https://www.albertpumarola.com/research/D-NeRF/index.html" }],
  B9: [{ kind: "code", label: "Nerfstudio", url: "https://github.com/nerfstudio-project/nerfstudio" }],

  // ---- Track D: Scene Reconstruction & World Modeling ----
  D1: [W("Simultaneous_localization_and_mapping", "SLAM"), { kind: "code", label: "ORB-SLAM2", url: "https://github.com/raulmur/ORB_SLAM2" }],
  D2: [{ kind: "code", label: "NICE-SLAM (neural)", url: "https://github.com/cvg/nice-slam" }],
  D3: [W("Marching_cubes", "Marching cubes"), { kind: "code", label: "Open3D (TSDF)", url: "https://github.com/isl-org/Open3D" }],
  D4: [{ kind: "code", label: "OpenScene (open-vocab 3D)", url: "https://github.com/pengsongyou/openscene" }, { kind: "code", label: "CLIP", url: "https://github.com/openai/CLIP" }],
  D5: [W("Scene_graph", "Scene graph"), { kind: "code", label: "Hydra (3D scene graphs)", url: "https://github.com/MIT-SPARK/Hydra" }],
  D6: [W("Occupancy_grid_mapping", "Occupancy mapping")],
  D7: [W("Spatial_cognition", "Spatial reasoning"), W("Frame_of_reference", "Reference frames")],
  D8: [{ kind: "web", label: "World Models (Ha & Schmidhuber)", url: "https://worldmodels.github.io/" }],
  D9: [{ kind: "code", label: "Nerfstudio", url: "https://github.com/nerfstudio-project/nerfstudio" }, { kind: "code", label: "Hydra scene graphs", url: "https://github.com/MIT-SPARK/Hydra" }],
};
