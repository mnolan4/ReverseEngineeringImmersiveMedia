/* Section V — states stay put until an event moves the system. */

function mountState(hostId) {
  const host = document.getElementById(hostId);
  const W = 520;
  const H = 400;
  const order = ["idle", "attract", "active", "complete", "reset"];
  const labels = {
    idle: "IDLE",
    attract: "ATTRACT",
    active: "ACTIVE",
    complete: "COMPLETE",
    reset: "RESET",
  };
  const hints = {
    enter: "Enter is the path from IDLE to ATTRACT.",
    approach: "Approach is the path from ATTRACT to ACTIVE.",
    finish: "Finishing is the path from ACTIVE to COMPLETE.",
    leave: "Leave is the path from COMPLETE to RESET.",
    walkaway: "Walking away starts a countdown only during ACTIVE.",
  };

  return new p5((p) => {
    let state = "idle";
    let personX = 40;
    let personAlpha = 0;
    let hint = "";
    let hintUntil = 0;
    let countdown = 0;
    let counting = false;
    let resetClock = 0;
    let anim = 0;
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
      if (counting && action !== "enter" && action !== "nothing") {
        hint = "The system is waiting to see if anyone comes back.";
        hintUntil = p.millis() + 2400;
        publish();
        return;
      }
      if (action === "nothing") {
        hint = counting
          ? "Doing nothing is why the countdown is running. It keeps going."
          : `Nothing changed. The system stays in ${labels[state]}.`;
        hintUntil = p.millis() + 2400;
        publish();
        return;
      }
      if (action === "enter" && counting) {
        counting = false;
        countdown = 0;
        hint = "Someone is here again. The system stays ACTIVE.";
        hintUntil = p.millis() + 2400;
        publish();
        return;
      }
      const allowed = {
        enter: state === "idle",
        approach: state === "attract",
        finish: state === "active" && !counting,
        leave: state === "complete",
        walkaway: state === "active" && !counting,
      };
      if (!allowed[action]) {
        hint = hints[action] || "";
        hintUntil = p.millis() + 2600;
        publish();
        return;
      }
      hint = "";
      if (action === "enter") state = "attract";
      else if (action === "approach") state = "active";
      else if (action === "finish") state = "complete";
      else if (action === "leave") {
        state = "reset";
        resetClock = 0;
      } else if (action === "walkaway") {
        counting = true;
        countdown = 0;
      }
      publish();
    };

    function publish() {
      const base = {
        idle: "State: IDLE. The room is empty and waiting.",
        attract: "State: ATTRACT. Someone is at the edge of the experience.",
        active: "State: ACTIVE. The interaction is underway.",
        complete: "State: COMPLETE. The interaction has finished.",
        reset: "State: RESET. The system is clearing itself, then it returns to idle.",
      }[state];
      const extra = counting ? " Nobody has been detected. 10 seconds, shown faster, then reset." : "";
      const hintText = hint && p.millis() < hintUntil ? ` ${hint}` : "";
      LectureUI.setStatus("status-state", `${base}${extra}${hintText}`);
    }

    p.draw = function draw() {
      const now = p.millis();
      const dt = Math.min(50, now - last);
      last = now;
      anim += dt;
      if (hint && now > hintUntil) {
        hint = "";
        publish();
      }
      if (counting) {
        countdown += dt;
        const limit = LectureDraw.reduced ? 700 : 3200;
        if (countdown >= limit) {
          counting = false;
          countdown = 0;
          state = "reset";
          resetClock = 0;
          publish();
        }
      }
      if (state === "reset") {
        resetClock += dt;
        if (resetClock > 1200) {
          state = "idle";
          resetClock = 0;
          publish();
        }
      }

      const targets = {
        idle: { x: 300, alpha: 0 },
        attract: { x: 300, alpha: 255 },
        active: { x: 360, alpha: 255 },
        complete: { x: 360, alpha: 255 },
        reset: { x: 300, alpha: 0 },
      };
      const target = counting ? { x: 250, alpha: 0 } : targets[state];
      personX = approach(personX, target.x, 0.14);
      personAlpha = approach(personAlpha, target.alpha, 0.14);

      beginFrame(p, W, H);
      order.forEach((name, index) => {
        const y = 48 + index * 62;
        const on = name === state || (counting && name === "active");
        chip(p, labels[name], 78, y, 112, 40, {
          fill: on ? "#3d3424" : LectureDraw.panel,
          stroke: on ? LectureDraw.amber : LectureDraw.line,
          weight: on ? 2.5 : 1.5,
        });
        if (index < order.length - 1) {
          arrow(p, 78, y + 22, 78, y + 40, LectureDraw.line);
        }
      });
      p.noStroke();
      p.fill(LectureDraw.muted);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(11);
      p.text("detected", 142, 78);
      p.text("approaches", 142, 140);
      p.text("completed", 142, 202);
      p.text("leaves", 142, 264);
      p.text("back to idle", 142, 326);

      p.fill(LectureDraw.deep);
      p.rect(230, 36, 260, 250, 12);
      p.fill("#2c3c54");
      p.rect(248, 250, 224, 8, 4);
      const screen = {
        idle: "#243044",
        attract: "#245e66",
        active: "#e2a04a",
        complete: "#8fbf7f",
        reset: "#3d4c66",
      }[state];
      p.fill(screen);
      p.rect(400, 70, 64, 120, 6);
      if (state === "active" || counting) {
        p.fill(LectureDraw.ink);
        const bob = Math.sin(anim / 200) * 8;
        for (let i = 0; i < 4; i += 1) p.circle(418 + i * 12, 120 + bob, 6);
      }
      if (state === "complete") {
        p.fill(LectureDraw.deep);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(18);
        p.text("Done", 432, 130);
      }
      person(p, personX, 258, { alpha: personAlpha, walk: personAlpha > 200 ? anim / 140 : 0 });

      if (counting) {
        const limit = LectureDraw.reduced ? 700 : 3200;
        const remain = Math.max(0, Math.ceil(10 * (1 - countdown / limit)));
        p.fill("#3d3424");
        p.stroke(LectureDraw.amber);
        p.strokeWeight(1.5);
        p.rect(246, 292, 228, 36, 8);
        p.noStroke();
        p.fill(LectureDraw.amber);
        p.rect(254, 314, 212 * (1 - countdown / limit), 6, 3);
        p.fill(LectureDraw.ink);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(12);
        p.text(`${remain}s with nobody here`, 360, 304);
      }

      caption(p, "Boxes are states. Events on the arrows cause change.", W, H);
      endFrame(p);
    };
  }, host);
}
