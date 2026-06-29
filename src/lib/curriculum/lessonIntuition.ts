import type { Bilingual } from "../types";

// A plain-language, analogy-first "intuition" per lesson — for readers with no
// background. Shown as an "In plain words" callout above the rigorous body, so
// the technical depth stays intact while newcomers get the gist in seconds.
export const lessonIntuition: Record<string, Bilingual> = {
  // ── Track A — Human Modeling ──────────────────────────────────────────────
  A1: {
    en: "Think of a video-game character creator: a few sliders for body shape, a few for joint angles, and out comes a whole 3D person. **SMPL** is exactly that — about 80 numbers instead of hand-placing ~7,000 surface points. That tiny set of dials is what lets a computer guess someone's body from a single photo.",
    zh: "把它想成游戏里的「捏人」系统：几个滑杆调体型，几个调关节角度，就生成一个完整的 3D 人。**SMPL** 正是如此——用约 80 个数字，而不是手动摆放约 7000 个表面点。正是这一小组「旋钮」，让计算机能从一张照片猜出人的身体。",
  },
  A2: {
    en: "Rather than guess the exact pixel of an elbow, the model paints a **heatmap** — a blurry glow that's brightest where the elbow probably is. The bright spot is the answer; the blur honestly shows the uncertainty. Turning a flat photo into real 3D is guesswork (you can't see depth), which is why video and body knowledge help fill the gap.",
    zh: "模型不会直接猜肘部的精确像素，而是画一张**热图**——一团模糊的光，最亮处就是肘部最可能的位置。亮点是答案，模糊则诚实地表达了不确定性。把平面照片变成真正的 3D 是在猜（你看不到深度），所以视频和身体常识能帮上忙。",
  },
  A3: {
    en: "A single photo is a freeze-frame; an action lives in the *change* between frames. So the model reads a short clip, not one image — like reading a sentence instead of a single word. A handy trick: track how fast joints move (velocity), since a wave looks the same whether you do it here or across the room.",
    zh: "单张照片是定格；动作存在于帧与帧之间的*变化*里。所以模型读的是一小段视频，而不是一张图——就像读一句话而非一个字。一个实用技巧：跟踪关节移动的速度，因为同一个挥手，在这里做还是在房间另一头做，看起来都一样。",
  },
  A4: {
    en: "We want a full 3D body from one photo, but almost no one has labeled 3D data. The clever fix: predict a 3D body, 'photograph' it with a virtual camera, and check that the result lines up with the easy-to-get 2D dots on the real photo. A 'does this look human?' check stops it from folding into impossible poses.",
    zh: "我们想从一张照片得到完整的 3D 身体，但几乎没人有标注好的 3D 数据。巧办法：预测一个 3D 身体，用虚拟相机给它「拍照」，再检查结果是否与真实照片上容易获得的 2D 标点对得上。一个「这像人吗？」的检查，能防止它扭成不可能的姿势。",
  },
  A5: {
    en: "Hands and faces say a lot (a grip, a smile) but are small and fiddly, so they get their own slider-sets — **MANO** for hands, **FLAME** for faces — built the same way as the body. Snap all three together and you have one expressive digital human. You need a real 3D hand (not just a box) to tell whether fingers are actually touching a cup.",
    zh: "手和脸传达很多信息（一个握法、一个微笑），却又小又精细，所以它们有各自的「滑杆组」——手用 **MANO**，脸用 **FLAME**——做法和身体一样。把三者拼在一起，就是一个富表现力的数字人。要判断手指是否真的碰到杯子，需要真正的 3D 手部网格，而不只是一个框。",
  },
  A6: {
    en: "How you *write down* a turn secretly decides whether a network can learn it. Compass angles jump from 359° back to 0° — a tiny real turn, a huge number jump — and that jump trips up the math. The fix is a smoother way to record rotations (six numbers) with no sudden jumps.",
    zh: "你**如何记录**一个旋转，悄悄决定了网络能否学会它。罗盘角度会从 359° 跳回 0°——真实只转了一点点，数字却猛跳一下——这种跳变会把计算搞乱。解决办法是用一种更平滑的方式记录旋转（六个数字），没有突然的跳变。",
  },
  A7: {
    en: "First teach a model what natural human movement looks like. Then it can do two jobs: clean up jittery motion-capture, or invent brand-new motion from a prompt like 'a person waves.' Modern versions start from random static and 'sculpt' it into smooth motion step by step — the hard part is keeping feet from sliding.",
    zh: "先教模型「自然的人类动作长什么样」。然后它能做两件事：清理抖动的动作捕捉，或根据「一个人挥手」这样的提示生成全新动作。现代做法从随机噪声出发，一步步把它「雕」成流畅的运动——难点是别让脚打滑。",
  },
  A8: {
    en: "People don't float — feet rest on floors, hips on chairs. Telling the model 'a body can't sink through furniture and must be supported' is basically free physics-based supervision, and it fixes depth mistakes a single photo can't. It also reveals **affordances**: where a body *can* sit, reach, or grab.",
    zh: "人不会悬浮——脚踩地、臀坐椅。告诉模型「身体不能穿过家具、必须被支撑」，几乎是免费的物理监督，还能修正单张照片无法确定的深度错误。它也揭示了**可供性**：身体*能*在哪里坐、够、抓。",
  },
  A9: {
    en: "Put it together: take a real clip and fit a 3D body by nudging the shape/pose dials until it lines up with the 2D dots — plus a 'stay human' rule. Then study where it breaks (a leg flips backward, feet slide) and figure out which rule would fix each. Learning by debugging is the goal.",
    zh: "把它们串起来：拿一段真实视频，通过微调体型/姿态「旋钮」让 3D 身体对齐 2D 标点——再加一条「保持像人」的规则。然后研究它在哪里出错（腿向后翻、脚打滑），弄清每个问题该由哪条规则修复。通过调试来学习，正是目的所在。",
  },

  // ── Track B — 3D & Neural Rendering ───────────────────────────────────────
  B1: {
    en: "A camera flattens the 3D world onto a flat picture and, in doing so, throws away distance — every point along one line-of-sight lands on the same pixel. That one fact ('depth is lost') is the root of nearly every hard problem in 3D vision: to get 3D back you need more views or extra assumptions.",
    zh: "相机把 3D 世界压成一张平面图，过程中丢掉了距离——同一条视线上的每个点都落在同一个像素上。这一事实（「深度丢失」）几乎是 3D 视觉所有难题的根源：要把 3D 找回来，你需要更多视角或额外假设。",
  },
  B2: {
    en: "Close one eye and the world looks flat; open both and depth pops back. Two cameras work the same way: each sees the point along a line, and where the two lines cross is its 3D position. The farther apart the cameras, the more precisely you can pin the distance.",
    zh: "闭上一只眼，世界变平；睁开双眼，深度回来了。两台相机同理：各自沿一条线看到那个点，两条线相交处就是它的 3D 位置。相机离得越远，能把距离定得越准。",
  },
  B3: {
    en: "Given a 3D map, 'where's the camera?' is solvable. **Bundle adjustment** then polishes everything at once — every camera and every 3D point — by sliding them until the picture they'd produce matches the real photos. 'How far off are the photos?' (reprojection error) is the universal scorecard of 3D vision.",
    zh: "有了 3D 地图，「相机在哪？」是可解的。**光束法平差**随后把一切一起打磨——每台相机、每个 3D 点——不断微调，直到它们生成的画面与真实照片相符。「与照片差多少？」（重投影误差）是 3D 视觉通用的计分板。",
  },
  B4: {
    en: "Instead of listing a shape's surface as thousands of points, store a *function* that answers: 'how far am I from the surface, and am I inside or out?' The surface is simply everywhere that answer is zero. It's smooth, infinitely detailed, and it's the same idea NeRF and 3D mapping reuse.",
    zh: "与其把一个形状的表面列成成千上万个点，不如存一个*函数*，它回答：「我离表面多远，在里面还是外面？」表面就是这个答案为零的所有地方。它平滑、可无限细化，而且 NeRF 和 3D 建图都复用了同一个想法。",
  },
  B5: {
    en: "Imagine a magic fog where every point in space has a color and a thickness. To make a picture, shoot a ray through the fog and add up what you hit. Because that adding-up is differentiable, you can train the fog to reproduce a set of photos — then view the scene from brand-new angles, no 3D scanner needed.",
    zh: "想象一团魔法雾，空间中每个点都有颜色和厚度。要生成画面，就射一条光线穿过雾，把沿途遇到的累加起来。因为这种累加是可微的，你能训练这团雾去还原一组照片——然后从全新角度观看场景，无需 3D 扫描仪。",
  },
  B6: {
    en: "Original NeRF crams a whole scene into one big brain (slow). **Instant-NGP** instead jots notes into a fast grid of cubbyholes and keeps the brain tiny — like switching from memorizing a book to using its index. Training drops from days to seconds.",
    zh: "原始 NeRF 把整个场景塞进一个大「脑子」（很慢）。**Instant-NGP** 改为把笔记写进一张快速的「格子储物柜」，让脑子保持很小——就像从背整本书改为查它的索引。训练从数天降到数秒。",
  },
  B7: {
    en: "Picture a scene built from millions of soft, colored blobs (**3D Gaussians**) instead of fog you slowly march through. To render, you just smear each blob onto the screen and blend them — something graphics cards do blazingly fast. Same photo quality as NeRF, but in real time.",
    zh: "把场景想成由数百万个柔软的彩色「团块」（**3D 高斯**）构成，而不是要一步步穿行的雾。渲染时，只需把每个团块抹到屏幕上再混合——这正是显卡极快擅长的事。画质媲美 NeRF，却能实时。",
  },
  B8: {
    en: "A moving scene = one 'rest pose' model + a recipe for how each moment bends away from it. Sharing one model across all frames (only the bending changes) is far more efficient than rebuilding every frame from scratch. The catch: many bendings explain the same video, so you add gentle 'things move rigidly' rules.",
    zh: "一个运动的场景 = 一个「静止态」模型 + 一份「每个时刻如何由它形变而来」的配方。让所有帧共享一个模型（只有形变在变），比逐帧从头重建高效得多。难点是：许多种形变都能解释同一段视频，所以要加入温和的「物体大体刚性运动」规则。",
  },
  B9: {
    en: "Actually reconstruct something: snap ~100 photos, recover where the camera was for each, and train a NeRF or Gaussian model you can orbit around. Then diagnose the artifacts — floating blobs (too few views) or blur (wrong camera positions) — and learn which fix each one needs.",
    zh: "真正重建点东西：拍约 100 张照片，求出每张拍摄时相机的位置，训练一个能环绕观看的 NeRF 或高斯模型。然后诊断瑕疵——漂浮的团块（视角太少）或模糊（相机位置不对）——并搞清每种该如何修复。",
  },

  // ── Track C — Egocentric Vision ───────────────────────────────────────────
  C1: {
    en: "Most cameras watch you from across the room; an **egocentric** camera sits on your head and sees what you see. That flips the rules: the camera shakes with you (so that motion is a cue to where *you* are looking — signal, not noise), your hands fill the bottom of the frame, and what you look at and reach for reveals your goals.",
    zh: "大多数相机在房间对面看着你；**第一人称**相机戴在你头上，看你所看。这颠覆了规则：相机随你晃动（所以这种运动是「你在看哪里」的线索——是信号，而非噪声），你的手占满画面下方，而你看向、伸手去拿的东西，泄露了你的目标。",
  },
  C2: {
    en: "Progress here is set by benchmarks. **EPIC-Kitchens** labels cooking as (verb, noun) like 'cut onion'; **Ego4D** is a huge buffet of tasks; **Xperience-10M** packs synced video + depth + body pose + captions. The lesson every beginner must learn: test on unseen kitchens/people, or the model just memorizes the room.",
    zh: "这里的进展由基准决定。**EPIC-Kitchens** 把烹饪标成（动词，名词），如「切洋葱」；**Ego4D** 是一桌任务大餐；**Xperience-10M** 打包了同步的视频 + 深度 + 身体姿态 + 文字描述。每个新手必学的一课：在没见过的厨房/人身上测试，否则模型只是背下了房间。",
  },
  C3: {
    en: "Two recipes for turning a clip into useful features. **SlowFast** watches with two eyes — a slow one for detail, a fast one for motion. **VideoMAE** instead hides ~90% of the video and learns by filling in the blanks, no labels needed — the same 'learn by masking' trick behind modern language models.",
    zh: "把视频变成有用特征的两种配方。**SlowFast** 用两只眼睛看——一只慢的看细节，一只快的看运动。**VideoMAE** 则遮住约 90% 的视频，靠填空来学习，无需标注——正是现代语言模型背后「靠遮挡来学习」的同一招。",
  },
  C4: {
    en: "Recognizing what's happening now is one thing; guessing what happens *next* is much harder, because the future is genuinely open (after 'grab pan,' both 'add oil' and 'crack egg' are fair). So you score the top few guesses, lean on the usual order of steps, and watch the hands — reaching for the knife gives away 'cut' before it happens.",
    zh: "识别此刻在发生什么是一回事；猜*接下来*会发生什么难得多，因为未来是真正开放的（「拿锅」之后，「加油」和「打蛋」都说得通）。所以你给「最可能的前几个」打分、依靠步骤的惯常顺序、并盯着手——伸向刀，在动作发生前就泄露了「切」。",
  },
  C5: {
    en: "In first-person video, hands are the anchor for everything. First find them, tell left from right, and — crucially — tell *your own* hands (which slide in from the bottom edge) from someone else's. A precise pixel mask, not just a box, is what lets you later ask 'is this hand touching that object?'",
    zh: "在第一人称视频里，手是一切的锚点。先找到手、分清左右，并且——关键是——分清*你自己*的手（从底边滑入）和别人的手。一张精确的像素掩码（而不只是框），才能让你之后追问「这只手碰到那个物体了吗？」",
  },
  C6: {
    en: "Most of what you do is hands working on one object at a time. So the key question is 'which object, right now?' — the one the hand is touching. Spotting that **active object** cuts a cluttered scene down to the one thing that matters; grip and object are best guessed together (a pinch implies something small).",
    zh: "你做的大多数事，都是手一次作用于一个物体。所以关键问题是「此刻是哪个物体？」——手正在碰的那个。识别这个**活动物体**，能把杂乱场景收缩成唯一重要的那件东西；抓握方式和物体最好一起猜（捏取意味着小东西）。",
  },
  C7: {
    en: "Your eyes give away your plan: you look at the cup a moment before you reach for it. So gaze is both a spotlight (telling the model where to focus) and a crystal ball (an early hint of the next action). Even without an eye-tracker, the scene center and head turns roughly say where you're looking.",
    zh: "你的眼睛会泄露计划：你在伸手去拿杯子前，会先看它一眼。所以注视既是聚光灯（告诉模型该聚焦哪里），也是水晶球（下一动作的早期暗示）。即便没有眼动仪，画面中心和头部转动也大致说明你在看哪。",
  },
  C8: {
    en: "Zoom out from single moments to the *goal* that ties them together. 'Making coffee' is a recipe with an order — you can't pour before brewing — and once a model guesses the goal, the next steps become easy to predict. It's the thinking layer that sits above raw perception.",
    zh: "从单个瞬间拉远，看到把它们串起来的*目标*。「冲咖啡」是有顺序的流程——萃取前不能倒——一旦模型猜到目标，接下来的步骤就容易预测了。这是位于纯感知之上的「思考」层。",
  },
  C9: {
    en: "Reproduce one real result simply and honestly: take features from a pretrained network, train a small classifier, and report scores on held-out kitchens. The key sanity check — shuffle the labels and accuracy must crash to random — proves your number is real before you build on it.",
    zh: "简单而诚实地复现一个真实结果：取一个预训练网络的特征，训练一个小分类器，在留出的厨房上报告分数。关键的合理性检查——把标签打乱后准确率必须跌到随机水平——能在你继续往上搭之前，证明你的数字是真的。",
  },

  // ── Track D — Scene & World Models ────────────────────────────────────────
  D1: {
    en: "A robot in a new room faces a chicken-and-egg problem: to know where it is, it needs a map; to build the map, it needs to know where it is. **SLAM** solves both at once. Its enemy is **drift** — tiny errors piling up — which it fixes by recognizing a place it's seen before and snapping the map back into line.",
    zh: "进入新房间的机器人面临一个鸡生蛋问题：要知道自己在哪，需要地图；要建地图，又需要知道自己在哪。**SLAM** 同时解决两者。它的大敌是**漂移**——微小误差不断累积——它通过认出之前见过的地点、把地图「咔」地拉回一致来修复。",
  },
  D2: {
    en: "SLAM isn't new math — it's the camera geometry from the 3D track, just running live. Tracking the camera each frame is the same 'find the pose' step; adding map points is triangulation; keeping it all consistent is bundle adjustment. Learn the geometry once and you get both offline reconstruction and live SLAM.",
    zh: "SLAM 不是新数学——它就是 3D 赛道里的相机几何，只是在实时运行。逐帧跟踪相机就是同一个「求位姿」步骤；新增地图点是三角测量；保持一致是光束法平差。几何学一次，离线重建和实时 SLAM 你就都会了。",
  },
  D3: {
    en: "Single depth scans are noisy. The trick: let many scans 'vote' on how far each little cube of space is from the surface, then average them — the noise cancels and the true surface emerges crisp. It's the same 'average many noisy looks' idea you'll keep seeing.",
    zh: "单次深度扫描有噪声。诀窍是：让许多次扫描对「每个小立方体离表面多远」投票，再取平均——噪声相互抵消，真实表面清晰浮现。这正是你会反复看到的「把许多次含噪观测平均起来」的同一想法。",
  },
  D4: {
    en: "A plain 3D map knows shapes but not *what things are*. So run object recognition on each frame and let many frames vote on each spot's label in 3D — flickery 2D mistakes wash out. Attach language features (CLIP) and you can even ask the map 'where's something to sit on?'",
    zh: "普通的 3D 地图知道形状，却不知道*东西是什么*。于是对每帧做物体识别，让许多帧为 3D 中每个位置的标签投票——闪烁的 2D 错误被冲刷掉。再附上语言特征（CLIP），你甚至能问地图「哪里有能坐的东西？」",
  },
  D5: {
    en: "Turn the dense map into a tidy diagram: objects are dots, relationships ('mug on table,' 'table in kitchen') are arrows, nested room by room. Now 'is the mug in the kitchen?' is a quick lookup, not a scan of every voxel — and it's something you can hand straight to a planner or an LLM.",
    zh: "把稠密地图变成一张整洁的图：物体是点，关系（「杯子在桌上」「桌子在厨房」）是箭头，按房间逐层嵌套。这样「杯子在厨房吗？」是一次快速查询，而非扫描每个体素——而且这东西可以直接交给规划器或 LLM。",
  },
  D6: {
    en: "Two ways to remember a place. A *space* map (a grid of free/blocked cells) is great for 'where can I walk without bumping into things?' An *object* map (the diagram above) is great for 'what's here and how do they relate?' Neither does both well, so real systems keep both.",
    zh: "记住一个地方的两种方式。*空间*地图（空/占的格子网格）擅长「我能往哪走而不撞到东西？」*物体*地图（上面那张图）擅长「这里有什么、彼此什么关系？」两者都无法兼顾，所以真实系统两者都保留。",
  },
  D7: {
    en: "What you can ask depends on how you stored the world — and 'left of the chair' is meaningless until you pick a viewpoint (the chair's? yours?). Robust spatial reasoning has to commit to a reference frame — the same care about coordinates that runs through the whole course.",
    zh: "你能问什么，取决于你如何存储这个世界——而「椅子左边」在你选定一个视角之前是无意义的（椅子的？还是你的？）。鲁棒的空间推理必须确定一个参照系——这正是贯穿整门课程的、对坐标的同一种讲究。",
  },
  D8: {
    en: "A map remembers the past; a **world model** imagines the future. Ask it 'what if I do this?' and it predicts what happens — so an agent can rehearse several plans in its head and pick the best, instead of trial-and-error in the real world. This is where perception turns into action.",
    zh: "地图记住过去；**世界模型**想象未来。问它「如果我这样做会怎样？」，它就预测结果——于是智能体能在脑中预演几套方案、择优而行，而不必在真实世界里试错。这正是感知化为行动之处。",
  },
  D9: {
    en: "Wire the whole course into one pipeline: photos → camera positions → a fused 3D surface → labels → a queryable scene graph you can ask questions of. The point isn't any single method — it's seeing that geometry, semantics, and language all snap together into one system: pixels turned into memory.",
    zh: "把整门课程接成一条流水线：照片 → 相机位置 → 融合的 3D 表面 → 标签 → 一张可提问的场景图。重点不是任何单一方法——而是看到几何、语义与语言如何咬合成一个系统：像素被变成了记忆。",
  },
};
