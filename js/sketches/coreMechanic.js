/* Section VII — the same motion, finished technology or a prototype. */

function mountMechanic(hostId) {
  const host = document.getElementById(hostId);
  const slider = document.getElementById("mechanic-pos");
  const W = 520;
  const H = 380;

  return new p5((p) => {
    let view = "finished";
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
      if (action !== "finished" && action !== "prototype") return;
      view = action;
      LectureUI.pressOnly("mechanic", view);
      LectureUI.setStatus(
        "status-mechanic",
        view === "finished"
          ? "Finished version: body tracking, a game engine, then projection. The motion is the same."
          : "Prototype: a mouse moves a cube. It tests the interaction, not the final technology."
      );
    };

    p.mouseDragged = function mouseDragged() {
      if (p.mouseX < 0 || p.mouseY < 0 || p.mouseX > p.width || p.mouseY > p.height) return;
      const amount = p.constrain((p.mouseX / p.width - 0.08) / 0.84, 0, 1);
      slider.value = String(Math.round(amount * 100));
    };

    function amount() {
      return Number(slider.value) / 100;
    }

    p.draw = function draw() {
      const now = p.millis();
      last = now;
      const x = 70 + amount() * 380;
      const bodyX = 70 + amount() * 150;
      beginFrame(p, W, H);
      p.stroke(LectureDraw.line);
      p.strokeWeight(1.5);
      p.line(50, 250, 470, 250);
      p.noStroke();

      if (view === "finished") {
        person(p, bodyX, 250, { color: LectureDraw.ink });
        chip(p, "Body tracking", 130, 70, 120, 36, { size: 13, stroke: LectureDraw.teal });
        chip(p, "Unity", 260, 70, 100, 36, { size: 13 });
        chip(p, "Projection", 400, 70, 110, 36, { size: 13, stroke: LectureDraw.amber });
        arrow(p, 192, 70, 208, 70, LectureDraw.line);
        arrow(p, 312, 70, 342, 70, LectureDraw.line);
        p.fill("#1f6f78");
        p.rect(360, 120, 130, 80, 8);
        p.fill(LectureDraw.amber);
        const shapeX = 372 + amount() * 90;
        p.rect(shapeX, 142, 22, 36, 4);
        p.fill(LectureDraw.muted);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(12);
        p.text("The body and the shape share one position", 260, 300);
      } else {
        p.fill(LectureDraw.ink);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.textSize(13);
        p.text("Mouse", x, 188);
        p.stroke(LectureDraw.amber);
        p.strokeWeight(2);
        p.line(x, 192, x, 214);
        p.noStroke();
        p.fill(LectureDraw.amber);
        p.rectMode(p.CENTER);
        p.rect(x, 232, 36, 36, 4);
        p.rectMode(p.CORNER);
        chip(p, "Mouse  →  Unity cube", 260, 78, 180, 36, {
          size: 14,
          fill: "#3d3424",
          stroke: LectureDraw.amber,
        });
        p.fill(LectureDraw.muted);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(12);
        p.text("Drag in the canvas or use the position slider", 260, 300);
      }

      caption(p, "Same mechanic: position in, position out", W, H);
      endFrame(p);
    };
  }, host);
}
