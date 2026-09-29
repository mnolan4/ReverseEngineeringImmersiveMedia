/* Section III — pseudo-code running in a room, then made observable. */

function mountPseudo(hostId) {
  const host = document.getElementById(hostId);
  const W = 520;
  const H = 380;
  const roomSteps = [
    { line: 0, x: 70, alpha: 50, projection: "dim", note: "Waiting for a participant." },
    { line: 1, x: 150, alpha: 255, projection: "dim", note: "A participant enters the space." },
    { line: 2, x: 210, alpha: 255, projection: "on", note: "The experience activates." },
    { line: 3, x: 230, alpha: 255, projection: "on", note: "They are still in the space." },
    { line: 4, x: 280, alpha: 255, projection: "on", note: "The system detects movement." },
    { line: 5, x: 300, alpha: 255, projection: "changed", note: "The projected image changes." },
    { line: 6, x: 120, alpha: 180, projection: "changed", note: "The participant leaves." },
    { line: 7, x: 70, alpha: 40, projection: "dim", note: "The system resets." },
  ];

  return new p5((p) => {
    let mode = "room";
    let step = 0;
    let playing = false;
    let playClock = 0;
    let shownX = 70;
    let direction = 0;
    let personX = 260;
    let timer = 0;
    let last = 0;
    let anim = 0;

    p.setup = function setup() {
      sizeHost(p, host);
      p.frameRate(30);
      p.textFont("sans-serif");
      last = p.millis();
      LectureUI.highlightLines("pseudo-room-lines", 0);
    };

    p.windowResized = function windowResized() {
      sizeHost(p, host);
    };

    p.handle = function handle(action) {
      if (action === "room" || action === "observe" || action === "direction") {
        mode = action;
        playing = false;
        resetPlayButton();
        LectureUI.pressOnly("pseudo", mode);
        LectureUI.showPanels("pseudo", mode);
        publishStatus();
        return;
      }
      if (mode !== "room" && (action === "play" || action === "step" || action === "reset")) return;
      if (action === "play") {
        playing = !playing;
        const playBtn = document.querySelector('[data-sketch="pseudo"][data-action="play"]');
        if (playBtn) {
          playBtn.textContent = playing ? "Pause" : "Play";
          playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
        }
      } else if (action === "step") {
        playing = false;
        playClock = 0;
        step = (step + 1) % roomSteps.length;
        resetPlayButton();
      } else if (action === "reset") {
        playing = false;
        playClock = 0;
        step = 0;
        resetPlayButton();
      } else if (action === "left" || action === "right") {
        direction = action === "left" ? -1 : 1;
        document.querySelectorAll('[data-sketch="pseudo"][data-action="left"], [data-sketch="pseudo"][data-action="right"]').forEach((btn) => {
          btn.setAttribute("aria-pressed", btn.dataset.action === action ? "true" : "false");
        });
      }
      publishStatus();
    };

    function resetPlayButton() {
      const playBtn = document.querySelector('[data-sketch="pseudo"][data-action="play"]');
      if (!playBtn) return;
      playBtn.textContent = "Play";
      playBtn.setAttribute("aria-pressed", "false");
    }

    function publishStatus() {
      if (mode === "room") {
        LectureUI.highlightLines("pseudo-room-lines", roomSteps[step].line);
        LectureUI.setStatus("status-pseudo", roomSteps[step].note);
      } else if (mode === "observe") {
        LectureUI.setStatus(
          "status-pseudo",
          "“Interested” is not something the system can check. Time in the area is."
        );
      } else if (direction === 0) {
        LectureUI.highlightLines("pseudo-direction-lines", -1);
        LectureUI.setStatus("status-pseudo", "Choose left or right. The particles should follow.");
      } else {
        LectureUI.highlightLines("pseudo-direction-lines", direction < 0 ? [0, 1] : [2, 3]);
        LectureUI.setStatus(
          "status-pseudo",
          direction < 0
            ? "Participant moves left, so the particles move left."
            : "Participant moves right, so the particles move right."
        );
      }
    }

    p.draw = function draw() {
      const now = p.millis();
      const dt = Math.min(50, now - last);
      last = now;
      anim += dt;
      if (mode === "room" && playing) {
        playClock += dt;
        const interval = LectureDraw.reduced ? 400 : 1400;
        if (playClock >= interval) {
          playClock = 0;
          step = (step + 1) % roomSteps.length;
          publishStatus();
        }
      }
      if (mode === "observe") timer = (timer + dt) % 4000;
      if (mode === "direction" && direction !== 0) {
        personX = p.constrain(personX + direction * dt * 0.08, 120, 400);
      }

      beginFrame(p, W, H);
      if (mode === "room") drawRoom();
      else if (mode === "observe") drawObserve();
      else drawDirection();
      endFrame(p);
    };

    function drawFloor(x, y, w) {
      p.noStroke();
      p.fill(LectureDraw.deep);
      p.rect(x, y, w, 168, 12);
      p.fill("#2c3c54");
      p.rect(x + 16, y + 132, w - 32, 8, 4);
    }

    function drawRoom() {
      const current = roomSteps[step];
      shownX = approach(shownX, current.x, 0.12);
      drawFloor(36, 70, 448);
      const screenColor = current.projection === "dim"
        ? "#243044"
        : current.projection === "changed"
          ? "#e2a04a"
          : "#1f6f78";
      p.fill(screenColor);
      p.rect(390, 96, 72, 108, 6);
      if (current.projection === "changed") {
        p.fill(LectureDraw.ink);
        for (let i = 0; i < 5; i += 1) p.circle(412, 116 + i * 16, 7);
      }
      person(p, shownX, 200, { alpha: current.alpha, walk: playing ? anim / 120 : 0 });
      p.fill(LectureDraw.ink);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(13);
      p.text("Room", 52, 84);
      caption(p, "The highlighted line is what the room is doing", W, H);
    }

    function drawObserve() {
      drawFloor(16, 36, 236);
      drawFloor(268, 36, 236);
      p.fill(LectureDraw.ink);
      p.textSize(13);
      p.textAlign(p.CENTER, p.TOP);
      p.text("IF interested", 134, 48);
      p.text("IF here for 20 seconds", 386, 48);

      person(p, 110, 168, { color: LectureDraw.ink });
      p.fill(LectureDraw.coral);
      p.textSize(28);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("?", 150, 150);
      p.textSize(12);
      p.fill(LectureDraw.muted);
      p.text("The system cannot\nknow this", 134, 250);

      const seconds = Math.floor((timer / 4000) * 21);
      const revealed = seconds >= 20;
      person(p, 360, 168, { color: LectureDraw.ink });
      p.noFill();
      p.stroke(LectureDraw.teal);
      p.strokeWeight(1.5);
      p.rect(320, 150, 80, 54, 8);
      p.noStroke();
      p.fill(revealed ? LectureDraw.amber : LectureDraw.teal);
      p.rect(320, 150, 80 * Math.min(1, seconds / 20), 8, 4);
      p.fill(LectureDraw.ink);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(13);
      p.text(revealed ? "Content revealed" : `${seconds} / 20 seconds`, 386, 178);
      p.fill(LectureDraw.muted);
      p.textSize(12);
      p.text("20 seconds, shown faster", 386, 250);
      caption(p, "Replace an abstract idea with something observable", W, H);
    }

    function drawDirection() {
      drawFloor(40, 78, 440);
      p.fill("#1f6f78");
      p.rect(300, 100, 150, 90, 6);
      const spread = direction === 0 ? 0 : direction;
      for (let i = 0; i < 6; i += 1) {
        const px = 340 + i * 18 + spread * (10 + i * 3);
        p.fill(LectureDraw.amber);
        p.circle(p.constrain(px, 312, 438), 145, 8);
      }
      person(p, personX, 200, { walk: direction ? anim / 100 : 0 });
      caption(p, direction === 0 ? "Waiting for a direction" : "Particles follow the observable movement", W, H);
    }
  }, host);
}
