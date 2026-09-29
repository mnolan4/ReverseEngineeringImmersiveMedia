/* Section II — the same projection scene, before and after the missing answers. */

function mountIdea(hostId) {
  const host = document.getElementById(hostId);
  const W = 520;
  const H = 380;

  return new p5((p) => {
    const answers = { who: null, camera: false, change: false, reset: false };
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
      if (action === "clear") {
        answers.who = null;
        answers.camera = false;
        answers.change = false;
        answers.reset = false;
      } else if (action === "one" || action === "many") {
        answers.who = answers.who === action ? null : action;
      } else if (action === "camera" || action === "change" || action === "reset") {
        answers[action] = !answers[action];
      } else {
        return;
      }
      document.querySelectorAll('[data-sketch="idea"][data-press="toggle"]').forEach((btn) => {
        const on = btn.dataset.action === "one" || btn.dataset.action === "many"
          ? answers.who === btn.dataset.action
          : Boolean(answers[btn.dataset.action]);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      LectureUI.setStatus("status-idea", statusText());
    };

    function statusText() {
      const bits = [];
      if (answers.who === "one") bits.push("one visitor");
      if (answers.who === "many") bits.push("many visitors");
      if (answers.camera) bits.push("a camera detects movement");
      if (answers.change) bits.push("movement transforms the projection");
      if (answers.reset) bits.push("an empty room resets the system");
      if (!bits.length) return "The scene is still a vague idea. Answer a question to add a label.";
      return `The system so far: ${bits.join("; ")}.`;
    }

    p.draw = function draw() {
      const now = p.millis();
      anim += Math.min(50, now - last);
      last = now;
      const t = anim / 1000;
      beginFrame(p, W, H);

      const roomX = 36;
      const roomY = 48;
      const roomW = 448;
      const roomH = 250;
      p.noStroke();
      p.fill(LectureDraw.deep);
      p.rect(roomX, roomY, roomW, roomH, 12);
      p.fill("#2a3a52");
      p.rect(roomX + 14, roomY + roomH - 28, roomW - 28, 8, 4);

      const cycle = (t % 8) / 8;
      const roomEmpty = answers.reset && cycle > 0.62;
      const presence = roomEmpty ? 0 : 1;
      const count = answers.who === "many" ? 3 : 1;
      const baseX = 150 + Math.sin(t * 1.3) * 36;

      const screenX = 390;
      const screenY = 78;
      const screenW = 72;
      const screenH = 150;
      let hueShift = (Math.sin(t * 0.7) + 1) / 2;
      if (answers.change && !roomEmpty) hueShift = (baseX - 110) / 120;
      const screenColor = roomEmpty
        ? p.color("#243044")
        : p.lerpColor(p.color("#1f6f78"), p.color("#e2a04a"), p.constrain(hueShift, 0, 1));

      p.fill(screenColor);
      p.rect(screenX, screenY, screenW, screenH, 6);
      if (answers.change && !roomEmpty) {
        for (let i = 0; i < 8; i += 1) {
          const px = screenX + 12 + ((baseX / 8 + i * 9) % (screenW - 20));
          const py = screenY + 18 + i * 15;
          p.fill(withAlpha(p, LectureDraw.ink, 180));
          p.circle(px, py, 6);
        }
      }

      if (answers.camera) {
        cameraIcon(p, 70, 78, LectureDraw.teal);
        p.noFill();
        p.stroke(withAlpha(p, LectureDraw.teal, 140));
        p.strokeWeight(1.5);
        p.triangle(82, 78, baseX - 10, 200, baseX + 30, 210);
        p.noStroke();
        chip(p, "Camera", 78, 108, 72, 22, { size: 11, fill: "#1d3a3c", stroke: LectureDraw.teal });
      }

      for (let i = 0; i < count; i += 1) {
        const x = baseX + (i - (count - 1) / 2) * 42;
        person(p, x, 268, {
          alpha: 40 + presence * 215,
          walk: roomEmpty ? 0 : t * 4 + i,
          color: LectureDraw.ink,
        });
      }

      if (answers.who) {
        chip(p, answers.who === "one" ? "One visitor" : "Many visitors", 168, 70, 118, 24, {
          size: 12,
          fill: "#1d3a3c",
          stroke: LectureDraw.teal,
        });
      }

      if (answers.change) {
        chip(p, roomEmpty ? "Image waits" : "Image follows movement", 360, 70, 150, 24, {
          size: 11,
          fill: "#3d3424",
          stroke: LectureDraw.amber,
        });
      }

      if (answers.reset) {
        chip(p, roomEmpty ? "Empty room → reset" : "Reset when empty", 200, 318, 160, 26, {
          size: 12,
          fill: roomEmpty ? "#3d3424" : LectureDraw.panel,
          stroke: LectureDraw.amber,
        });
      }

      const answered = answers.who || answers.camera || answers.change || answers.reset;
      caption(p, answered ? "Same scene, with the missing answers filled in" : "Vague idea — labels appear as you answer", W, H);
      endFrame(p);
    };
  }, host);
}
