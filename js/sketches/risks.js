/* Section VIII — four risks, one system. */

function mountRisks(hostId) {
  const host = document.getElementById(hostId);
  const W = 520;
  const H = 380;
  const copy = {
    technical: {
      status: "Technical risk: can we make the sensors and software work?",
      caption: "Highlight: sensors and software",
    },
    interaction: {
      status: "Interaction risk: will a participant understand what to do?",
      caption: "Highlight: the participant’s path into the work",
    },
    experience: {
      status: "Experience risk: is the result actually interesting?",
      caption: "Highlight: what the participant receives",
    },
    production: {
      status: "Production risk: can we build this in the time and resources we have?",
      caption: "Highlight: time and materials",
    },
  };

  return new p5((p) => {
    let risk = "";

    p.setup = function setup() {
      sizeHost(p, host);
      p.frameRate(30);
      p.textFont("sans-serif");
    };

    p.windowResized = function windowResized() {
      sizeHost(p, host);
    };

    p.handle = function handle(action) {
      if (!copy[action]) return;
      risk = risk === action ? "" : action;
      document.querySelectorAll('[data-sketch="risk"][data-press="toggle"]').forEach((btn) => {
        btn.setAttribute("aria-pressed", btn.dataset.action === risk ? "true" : "false");
      });
      LectureUI.setStatus(
        "status-risk",
        risk ? copy[risk].status : "Choose a risk to see which part of the system it asks about."
      );
    };

    p.draw = function draw() {
      beginFrame(p, W, H);
      const nodes = [
        { id: "interaction", x: 70, y: 150, label: "Participant" },
        { id: "technical", x: 190, y: 150, label: "Sensors" },
        { id: "technical", x: 310, y: 150, label: "Software" },
        { id: "experience", x: 440, y: 150, label: "Projection" },
      ];
      arrow(p, 112, 150, 145, 150, LectureDraw.line);
      arrow(p, 232, 150, 265, 150, LectureDraw.line);
      arrow(p, 352, 150, 395, 150, LectureDraw.line);
      nodes.forEach((node) => {
        const on = risk === node.id;
        chip(p, node.label, node.x, node.y, 96, 52, {
          fill: on ? "#3d3424" : LectureDraw.panel,
          stroke: on ? LectureDraw.amber : LectureDraw.line,
          weight: on ? 2.5 : 1.5,
          size: 13,
        });
      });

      const timeOn = risk === "production";
      p.noStroke();
      p.fill(LectureDraw.muted);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);
      p.text("Time and materials", 260, 230);
      p.stroke(timeOn ? LectureDraw.amber : LectureDraw.line);
      p.strokeWeight(timeOn ? 2.5 : 1.5);
      p.fill(timeOn ? "#3d3424" : LectureDraw.deep);
      p.rect(70, 248, 380, 28, 8);
      p.noStroke();
      p.fill(timeOn ? LectureDraw.amber : LectureDraw.teal);
      p.rect(78, 256, timeOn ? 250 : 160, 12, 4);
      p.fill(LectureDraw.ink);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(12);
      p.text(timeOn ? "Is there enough left?" : "Budget of time", 86, 262);

      if (risk === "interaction") {
        p.fill(LectureDraw.coral);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(22);
        p.text("?", 70, 104);
        p.textSize(12);
        p.text("What do I do?", 70, 86);
      }
      if (risk === "experience") {
        p.fill(LectureDraw.amber);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(12);
        p.text("Is this interesting?", 440, 96);
      }

      caption(p, risk ? copy[risk].caption : "One system. Four places it can fail.", W, H);
      endFrame(p);
    };
  }, host);
}
