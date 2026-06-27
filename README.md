<p align="center">
  <a href="https://chaoyue0307.github.io/ropedia-academy/">
    <img src="public/og.png" alt="Ropedia Academy — learn embodied spatial AI: egocentric vision, 3D reconstruction, human motion, world models" width="880">
  </a>
</p>

<h1 align="center">Ropedia Academy</h1>

<p align="center">
  <a href="https://chaoyue0307.github.io/ropedia-academy/"><b>🌐 Live site</b></a> ·
  4 tracks · 36 bilingual lessons · live 3D demos · spaced repetition
</p>

An interactive, bilingual (中文 / English) course on embodied & spatial AI — four
connected tracks covering **human modeling & motion**, **3D/4D reconstruction &
neural rendering**, **egocentric vision & interaction**, and **scene
reconstruction & world models**. Read lessons, play with live interactive demos
(including real-time 3D), run the code in Colab, self-test, and review with
spaced repetition. Runs entirely in the browser — no account required.

![tracks](https://img.shields.io/badge/tracks-4-6a5ef0) ![lessons](https://img.shields.io/badge/lessons-36-1d9e75) ![mode-中%2FEN-blue](https://img.shields.io/badge/中%2FEN-bilingual-378add)

## Features

- **4 tracks · 36 lessons**, each with a bilingual explanation, key terms, key
  papers, external links, cross-track links, and self-check questions.
- **An interactive demo in every lesson** — real-time **three.js 3D** (Gaussian
  splatting, a raymarched NeRF volume, an articulated SMPL body) plus explorable
  diagrams (triangulation, bundle adjustment, rotation continuity, hash grids,
  TSDF fusion, SLAM loop closure, reference frames, world-model rollouts, …).
- **Math & code** — KaTeX formulas and a runnable Python/PyTorch snippet per
  lesson, each with one-click **Open in Colab**; its real output (printed values
  + figure) shows inline behind a *predict-it, then reveal* toggle.
- **Bilingual reading** (中文 / English / 双语) and **hover-to-define** glossary
  tooltips on foundational terms.
- **Self-graded checks & quiz mode**, **spaced repetition** (SM-2) with a 7-day
  forecast, a cross-track **concept map**, progress tracking, and a ⌘K palette.
- **Light / dark theme**, mobile-friendly, **local-first** (no account required).

## Run & deploy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

Pushing to `main` auto-builds and deploys to **GitHub Pages** via the included
GitHub Actions workflow (`.github/workflows/deploy.yml`) — that's what serves the
live site above. It's a static SPA, so `dist/` can also be hosted on any static
host (Netlify, Vercel, Cloudflare Pages).
