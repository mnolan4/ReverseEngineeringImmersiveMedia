/* Section X — one token through the five questions, then the build sequence. */

function mountRecap(hostId) {
  const host = document.getElementById(hostId);
  const W = 520;
  const H = 380;
  const questions = [
    { title: "Pseudo-code", ask: "What are the rules?" },
    { title: "Flow", ask: "Where does the information go?" },
    { title: "State", ask: "How does the system change?" },
    { title: "Interaction", ask: "What happens between participant and system?" },
    { title: "Core mechanic", ask: "What is the smallest thing to test?" },
  ];
  const sequence = ["Reverse engineer", "Prototype", "Learn", "Build"];

  return new p5((p) => {
    let clock = 0;
    let last = 0;
    let announced = -1;
    const stepMs = LectureDraw.reduced ? 200 : 1600;

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
      if (action !== "replay") return;
      clock = 0;
      announced = -1;
    };

    p.draw = function draw() {
      const now = p.millis();
      clock += Math.min(50, now - last);
      last = now;
      const total = questions.length * stepMs + 2200;
      if (clock > total) clock = 0;
      const qIndex = Math.min(questions.length - 1, Math.floor(clock / stepMs));
      const showingSequence = clock > questions.length * stepMs;

      if (showingSequence && announced !== 99) {
        announced = 99;
        LectureUI.setStatus(
          "status-recap",
          "Reverse engineer, then prototype, then learn, then build."
        );
      } else if (!showingSequence && announced !== qIndex) {
        announced = qIndex;
        const q = questions[qIndex];
        LectureUI.setStatus("status-recap", `${q.title}: ${q.ask}`);
      }

      beginFrame(p, W, H);
      const y = 120;
      questions.forEach((q, i) => {
        const x = 52 + i * 104;
        const reached = showingSequence || i <= qIndex;
        chip(p, q.title, x, y, 96, 48, {
          size: 11,
          fill: reached ? "#1d3a3c" : LectureDraw.panel,
          stroke: i === qIndex && !showingSequence ? LectureDraw.amber : LectureDraw.teal,
          weight: i === qIndex && !showingSequence ? 2.5 : 1.5,
        });
        if (i < questions.length - 1) {
          p.stroke(LectureDraw.line);
          p.strokeWeight(1.5);
          p.line(x + 50, y, x + 54, y);
        }
      });

      if (!showingSequence) {
        const local = (clock % stepMs) / stepMs;
        const from = 52 + qIndex * 104;
        const to = qIndex < questions.length - 1 ? from + 104 : from;
        const x = LectureDraw.reduced ? to : from + (to - from) * Math.min(1, local * 1.4);
        p.noStroke();
        p.fill(LectureDraw.amber);
        p.circle(x, y - 42, 14);
        p.fill(LectureDraw.ink);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        const ask = questions[qIndex].ask;
        p.text(ask, W / 2, 210);
      } else {
        sequence.forEach((label, i) => {
          const x = 80 + i * 120;
          chip(p, label, x, 230, 108, 36, {
            size: 12,
            fill: "#3d3424",
            stroke: LectureDraw.amber,
          });
          if (i < sequence.length - 1) {
            p.fill(LectureDraw.amber);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.text("→", x + 60, 230);
          }
        });
      }

      caption(p, "Explain the system before anyone builds it", W, H);
      endFrame(p);
    };
  }, host);
}