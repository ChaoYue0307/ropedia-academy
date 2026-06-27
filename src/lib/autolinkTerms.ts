// Central term -> URL map. The Markdown renderer auto-links the FIRST mention of
// each entry per block (skipping code, math, and existing links). Keys are
// matched case-sensitively with non-alphanumeric boundaries, so "clip" won't
// match the model "CLIP" and "SDF" won't match inside "TSDF".
export const autolinkTerms: Record<string, string> = {
  // datasets
  "Ego4D": "https://ego4d-data.org/",
  "EPIC-Kitchens-100": "https://epic-kitchens.github.io/",
  "EPIC-Kitchens": "https://epic-kitchens.github.io/",
  "EGTEA": "https://cbs.ic.gatech.edu/fpv/",
  "Xperience-10M": "https://github.com/Ropedia/HOMIE-toolkit",
  "HOMIE toolkit": "https://github.com/Ropedia/HOMIE-toolkit",
  "Replica": "https://github.com/facebookresearch/Replica-Dataset",
  "PROX": "https://prox.is.tue.mpg.de/",

  // models / parametric
  "SMPL-X": "https://smpl-x.is.tue.mpg.de/",
  "SMPL": "https://smpl.is.tue.mpg.de/",
  "MANO": "https://mano.is.tue.mpg.de/",
  "FLAME": "https://flame.is.tue.mpg.de/",
  "SMPLify": "https://smplify.is.tue.mpg.de/",
  "HMR": "https://github.com/akanazawa/hmr",
  "4D-Humans": "https://github.com/shubham-goel/4D-Humans",
  "VIBE": "https://github.com/mkocabas/VIBE",
  "ST-GCN": "https://github.com/yysijie/st-gcn",
  "OpenPose": "https://github.com/CMU-Perceptual-Computing-Lab/openpose",
  "MediaPipe": "https://github.com/google/mediapipe",
  "Motion Diffusion Model": "https://github.com/GuyTevet/motion-diffusion-model",
  "MDM": "https://github.com/GuyTevet/motion-diffusion-model",

  // video / egocentric
  "SlowFast": "https://github.com/facebookresearch/SlowFast",
  "VideoMAE": "https://github.com/MCG-NJU/VideoMAE",
  "RU-LSTM": "https://github.com/fpv-iplab/rulstm",
  "100DOH": "https://github.com/ddshan/hand_object_detector",

  // 3D / rendering
  "3D Gaussian Splatting": "https://en.wikipedia.org/wiki/Gaussian_splatting",
  "Gaussian Splatting": "https://en.wikipedia.org/wiki/Gaussian_splatting",
  "Gaussian splatting": "https://en.wikipedia.org/wiki/Gaussian_splatting",
  "3DGS": "https://github.com/graphdeco-inria/gaussian-splatting",
  "NeRF": "https://en.wikipedia.org/wiki/Neural_radiance_field",
  "Instant-NGP": "https://github.com/NVlabs/instant-ngp",
  "instant-ngp": "https://github.com/NVlabs/instant-ngp",
  "Nerfstudio": "https://github.com/nerfstudio-project/nerfstudio",
  "COLMAP": "https://github.com/colmap/colmap",

  // SLAM / scene / world
  "ORB-SLAM": "https://github.com/raulmur/ORB_SLAM2",
  "NICE-SLAM": "https://github.com/cvg/nice-slam",
  "SplaTAM": "https://github.com/spla-tam/SplaTAM",
  "Hydra": "https://github.com/MIT-SPARK/Hydra",
  "Kimera": "https://github.com/MIT-SPARK/Kimera",
  "Open3D": "https://github.com/isl-org/Open3D",
  "OpenScene": "https://github.com/pengsongyou/openscene",
  "LERF": "https://www.lerf.io/",
  "CLIP": "https://github.com/openai/CLIP",
  "World Models": "https://worldmodels.github.io/",

  // concepts (Wikipedia)
  "bundle adjustment": "https://en.wikipedia.org/wiki/Bundle_adjustment",
  "structure-from-motion": "https://en.wikipedia.org/wiki/Structure_from_motion",
  "Structure-from-Motion": "https://en.wikipedia.org/wiki/Structure_from_motion",
  "signed distance function": "https://en.wikipedia.org/wiki/Signed_distance_function",
  "Signed Distance Function": "https://en.wikipedia.org/wiki/Signed_distance_function",
  "Marching Cubes": "https://en.wikipedia.org/wiki/Marching_cubes",
  "marching cubes": "https://en.wikipedia.org/wiki/Marching_cubes",
  "epipolar": "https://en.wikipedia.org/wiki/Epipolar_geometry",
  "pinhole": "https://en.wikipedia.org/wiki/Pinhole_camera_model",
  "PnP": "https://en.wikipedia.org/wiki/Perspective-n-Point",
  "optical flow": "https://en.wikipedia.org/wiki/Optical_flow",
  "gimbal lock": "https://en.wikipedia.org/wiki/Gimbal_lock",
  "diffusion model": "https://en.wikipedia.org/wiki/Diffusion_model",
  "scene graphs": "https://en.wikipedia.org/wiki/Scene_graph",
  "scene graph": "https://en.wikipedia.org/wiki/Scene_graph",
  "occupancy grid": "https://en.wikipedia.org/wiki/Occupancy_grid_mapping",
  "SLAM": "https://en.wikipedia.org/wiki/Simultaneous_localization_and_mapping",
  "TSDF": "https://en.wikipedia.org/wiki/Signed_distance_function",
  "world models": "https://worldmodels.github.io/",
  "world model": "https://worldmodels.github.io/",
};
