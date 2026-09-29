/* Section VI — participant and system, one message at a time. */

function mountInteraction(hostId) {
  const host = document.getElementById(hostId);
  const W = 520;
  const H = 380;
  const beats = [
    {
      loop: 0,
      from: "participant",
      message: "Enters the room",
      participant: "Steps in",
      system: "Waiting",
      pose: "door",
      screen: "dim",
      status: "Action: the participant enters the room.",
    },
    {
      loop: 1,
      from: "participant",
      message: "Detects participant",
      participant: "In the room",
      system: "Notices them",
      pose: "door",
      screen: "dim",
      status: "Response: the system detects the participant.",
    },
    {
      loop: 2,
      from: "system",
      message: "Activates visuals",
      participant: "Sees the change",
      system: "Turns the image on",
      pose: "door",
      screen: "on",
      status: "Perception: the participant sees the projection change.",
    },
    {
      loop: 3,
      from: "participant",
      message: "Moves left",
      participant: "Moves left",
      system: "Watching",
      pose: "left",
      screen: "on",
      status: "New action: the participant moves.",
    },
    {
      loop: 1,
      from: "participant",
      message: "Detects movement",
      participant: "Has moved",
      system: "Reads the movement",
      pose: "left",
      screen: "on",
      status: "Response: the system detects the movement.",
    },
    {
      loop: 2,
      from: "system",
      message: "Changes projection",
      participant: "Sees particles move",
      system: "Shifts the image",
      pose: "left",
      screen: "changed",
      status: "Perception: the participant sees the particles move.",
    },
  ];

  return new p5((p) => {
    let index = 0;
    let playing = false;
    let clock = 0;
    let arrowT = 1;
    let dragStart = null;
    let last = 0;

    p.setup = function setup() {
      sizeHost(p, host);
      p.frameRate(30);
      p.textFont("sans-serif");
      last = p.millis();
      publish();
    };

    p.windowResized = function windowResized() {
      sizeHost(p, host);
    };

    p.handle = function handle(action) {
      if (action === "step") {
        playing = false;
        advance();
        setPlayLabel(false);
      } else if (action === "play") {
        playing = !playing;
        setPlayLabel(playing);
      } else if (action === "reset") {
        playing = false;
        index = 0;
        arrowT = 1;
        setPlayLabel(false);
        publish();
      }
    };

    p.mousePressed = function mousePressed() {
      if (p.mouseX < 0 || p.mouseY < 0 || p.mouseX > p.width || p.mouseY > p.height) return;
      dragStart = p.mouseX;
    };

    p.mouseReleased = function mouseReleased() {
      if (dragStart == null) return;
      const dx = p.mouseX - dragStart;
      dragStart = null;
      if (Math.abs(dx) < 24) return;
      playing = false;
      setPlayLabel(false);
      if (dx > 0) advance();
      else {
        index = (index - 1 + beats.length) % beats.length;
        arrowT = 0;
        publish();
      }
    };

    function setPlayLabel(on) {
      const btn = document.querySelector('[data-sketch="interaction"][data-action="play"]');
      if (!btn) return;
      btn.textContent = on ? "Pause" : "Play";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }

    function advance() {
      index = (index + 1) % beats.length;
      arrowT = 0;
      publish();
    }

    function publish() {
      const beat = beats[index];
      LectureUI.setStatus("status-interaction", `${beat.status} You can also drag across the canvas.`);
      document.querySelectorAll("[data-loop]").forEach((el) => {
        el.classList.toggle("is-here", Number(el.dataset.loop) === beat.loop);
      });
    }

    p.draw = function draw() {
      const now = p.millis();
      const dt = Math.min(50, now - last);
      last = now;
      arrowT = Math.min(1, arrowT + dt / (LectureDraw.reduced ? 80 : 450));
      if (playing) {
        clock += dt;
        if (clock > (LectureDraw.reduced ? 500 : 1800)) {
          clock = 0;
          advance();
        }
      }

      const beat = beats[index];
      beginFrame(p, W, H);
      card(90, 150, "PARTICIPANT", beat.participant);
      card(400, 150, "SYSTEM", beat.system);

      const px = beat.pose === "left" ? 70 : 110;
      person(p, px, 268, { walk: beat.pose === "left" ? 1 : 0 });
      const screenColor = beat.screen === "dim" ? "#243044" : beat.screen === "changed" ? "#e2a04a" : "#1f6f78";
      p.noStroke();
      p.fill(screenColor);
      p.rect(365, 196, 76, 78, 6);
      if (beat.screen === "changed") {
        p.fill(LectureDraw.ink);
        for (let i = 0; i < 4; i += 1) p.circle(382 + (i % 2) * 20, 218 + Math.floor(i / 2) * 24, 7);
      }

      const fromX = beat.from === "participant" ? 160 : 330;
      const toX = beat.from === "participant" ? 330 : 160;
      const y = 118;
      const tip = fromX + (toX - fromX) * arrowT;
      p.stroke(LectureDraw.line);
      p.strokeWeight(1.5);
      p.line(fromX, y, toX, y);
      if (arrowT > 0.05) arrow(p, fromX, y, tip, y, LectureDraw.amber);
      p.noStroke();
      p.fill(LectureDraw.ink);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.textSize(13);
      p.text(beat.message, 260, y - 10);

      caption(p, "The message in the middle is the current exchange", W, H);
      endFrame(p);
    };

    function card(x, y, title, body) {
      p.noStroke();
      p.fill(LectureDraw.muted);
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(12);
      p.text(title, x, 36);
      chip(p, body, x, y, 150, 44, { size: 13 });
    }
  }, host);
}
