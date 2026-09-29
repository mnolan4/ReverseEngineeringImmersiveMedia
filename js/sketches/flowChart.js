/* Section IV — input, process, output, then the installation diagram. */

function mountFlow(hostId) {
  const host = document.getElementById(hostId);
  const W = 520;
  const H = 380;
  const paths = [
    ["Camera", "Detect", "Projection"],
    ["Microphone", "Measure", "Sound"],
    ["Position", "Calculate", "Image"],
    ["Motion sensor", "Compare", "Lighting"],
    ["Audio level", "Classify", "Animation"],
    ["Time", "Generate", "Haptic feedback"],
  ];

  return new p5((p) => {
    let view = "simple";
    let anim = 0;
    let last = 0;

    p.setup = function setup() {
      sizeHost(p, host);
      p.frameRate(30);
      p.textFont("sans-serif");
      last = p.millis();
    };

    p.windowResized = function windowResized() {
      sizeHost(p, host);
    };

    p.handle = function handle(action) {
      if (action !== "simple" && action !== "install") return;
      view = action;
      LectureUI.pressOnly("flow", view);
      LectureUI.setStatus(
        "status-flow",
        view === "simple"
          ? "A token carries one example from an input, through a process, to an output."
          : "Body tracking sits in the middle. The projection cannot move until tracking does."
      );
    };

    p.draw = function draw() {
      const now = p.millis();
      anim += Math.min(50, now - last);
      last = now;
      beginFrame(p, W, H);
      if (view === "simple") drawSimple();
      else drawInstall();
      endFrame(p);
    };

    function drawSimple() {
      const span = LectureDraw.reduced ? 1 : 2400;
      const travel = (anim % span) / span;
      const index = Math.floor(anim / span) % paths.length;
      const [input, process, output] = paths[index];
      const nodes = [
        { x: 90, y: 170, label: input, title: "INPUT" },
        { x: 260, y: 170, label: process, title: "PROCESS" },
        { x: 430, y: 170, label: output, title: "OUTPUT" },
      ];
      arrow(p, 155, 170, 195, 170, LectureDraw.line);
      arrow(p, 325, 170, 365, 170, LectureDraw.line);
      const dotX = travel < 0.5 ? 155 + (195 - 155) * (travel / 0.5) : 325 + (365 - 325) * ((travel - 0.5) / 0.5);
      nodes.forEach((node) => {
        p.fill(LectureDraw.muted);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(12);
        p.text(node.title, node.x, 118);
        chip(p, node.label, node.x, node.y, 120, 56, { size: 14 });
      });
      p.fill(LectureDraw.amber);
      p.circle(dotX, 170, 10);
      caption(p, "INPUT  →  PROCESS  →  OUTPUT", W, H);
    }

    function drawInstall() {
      const nodes = {
        camera: { x: 78, y: 78, label: "Camera" },
        tracking: { x: 230, y: 78, label: "Body\ntracking" },
        engine: { x: 230, y: 210, label: "Game\nengine" },
        projection: { x: 410, y: 210, label: "Projection" },
        mic: { x: 78, y: 300, label: "Microphone" },
        audio: { x: 230, y: 300, label: "Audio\nanalysis" },
      };
      arrow(p, 128, 78, 175, 78, LectureDraw.line);
      arrow(p, 230, 112, 230, 168, LectureDraw.line);
      arrow(p, 285, 210, 350, 210, LectureDraw.line);
      arrow(p, 128, 300, 175, 300, LectureDraw.line);
      arrow(p, 230, 266, 230, 248, LectureDraw.line);

      const pulse = LectureDraw.reduced ? 1 : 0.55 + 0.45 * Math.sin(anim / 280);
      chip(p, nodes.tracking.label, nodes.tracking.x, nodes.tracking.y, 108, 52, {
        stroke: LectureDraw.amber,
        fill: "#3d3424",
        weight: 2 + pulse,
        size: 13,
      });
      p.fill(LectureDraw.amber);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(11);
      p.text("Bottleneck", nodes.tracking.x, 36);

      ["camera", "engine", "projection", "mic", "audio"].forEach((key) => {
        const node = nodes[key];
        chip(p, node.label, node.x, node.y, key === "projection" || key === "mic" ? 112 : 100, 48, { size: 13 });
      });

      const t = LectureDraw.reduced ? 0.35 : (anim % 2800) / 2800;
      travelingDot(p, [
        { x: 128, y: 78 },
        { x: 176, y: 78 },
        { x: 230, y: 112 },
        { x: 230, y: 176 },
        { x: 290, y: 210 },
        { x: 350, y: 210 },
      ], t, LectureDraw.teal);
      travelingDot(p, [
        { x: 128, y: 300 },
        { x: 176, y: 300 },
        { x: 230, y: 270 },
        { x: 230, y: 244 },
      ], (t + 0.35) % 1, LectureDraw.blue);

      caption(p, "Both paths meet at the game engine", W, H);
    }
  }, host);
}