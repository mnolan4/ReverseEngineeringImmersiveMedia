/* Section I — a behavior model, not the original code. */

function mountBlackBox(hostId) {
  const host = document.getElementById(hostId);
  const W = 520;
  const H = 380;

  return new p5((p) => {
    let mode = "model";
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
      if (action !== "code" && action !== "model") return;
      mode = action;
      LectureUI.pressOnly("blackBox", mode);
      LectureUI.setStatus(
        "status-blackbox",
        mode === "model"
          ? "Rules inside the box are a model of the experience, not its source code."
          : "The original code is not the goal. We still need a model of what the experience does."
      );
    };

    p.draw = function draw() {
      const now = p.millis();
      anim += Math.min(50, now - last);
      last = now;
      beginFrame(p, W, H);

      const travel = LectureDraw.reduced ? 0.5 : (anim % 1800) / 1800;
      drawLane(70, 120, 168, 120, travel, "Visitor");
      drawLane(70, 272, 168, 272, (travel + 0.45) % 1, "Sensor");
      drawLane(352, 120, 450, 120, travel, "Projection", true);
      drawLane(352, 272, 450, 272, (travel + 0.45) % 1, "Sound", true);

      p.push();
      p.stroke(mode === "model" ? LectureDraw.teal : LectureDraw.line);
      p.strokeWeight(2);
      p.fill(LectureDraw.deep);
      p.rectMode(p.CENTER);
      p.rect(260, 185, 184, 210, 14);
      p.pop();

      p.fill(LectureDraw.muted);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);
      p.text("EXPERIENCE", 260, 100);

      if (mode === "model") {
        const rules = [
          "If someone enters, start",
          "If they move, change the image",
          "If they leave, reset",
        ];
        rules.forEach((rule, i) => {
          chip(p, rule, 260, 150 + i * 42, 160, 32, {
            fill: "#1d3a3c",
            stroke: LectureDraw.teal,
            size: 11,
          });
        });
      } else {
        p.fill(LectureDraw.muted);
        p.textFont("monospace");
        p.textSize(11);
        p.textAlign(p.CENTER, p.CENTER);
        const junk = ["0xA91F  ??  void", "fn(????) { ... }", "class Hidden {}", "return ???;", "/* unreadable */"];
        junk.forEach((line, i) => p.text(line, 260, 138 + i * 22));
        p.textFont("sans-serif");
        p.fill(LectureDraw.coral);
        p.textSize(12);
        p.text("Not the goal", 260, 258);
      }

      caption(
        p,
        mode === "model" ? "A model of how the experience behaves" : "Original code stays out of reach",
        W,
        H
      );
      endFrame(p);
    };

    function drawLane(x1, y1, x2, y2, t, label, outbound) {
      arrow(p, x1, y1, x2, y2, LectureDraw.line);
      const dotX = x1 + (x2 - x1) * t;
      p.noStroke();
      p.fill(outbound ? LectureDraw.amber : LectureDraw.teal);
      p.circle(dotX, y1, 9);
      p.fill(LectureDraw.ink);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.textSize(13);
      p.text(label, outbound ? x2 : x1, y1 - 16);
    }
  }, host);
}
