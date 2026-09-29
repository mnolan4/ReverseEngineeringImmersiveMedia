/* Shared drawing helpers for the lecture sketches. Coordinates are logical
   pixels inside beginFrame / endFrame, so every diagram scales together. */

const LectureDraw = {
  bg: "#172033",
  ink: "#f4efe6",
  muted: "#9aa3b5",
  amber: "#e2a04a",
  teal: "#6ec8c4",
  coral: "#e07a5f",
  green: "#8fbf7f",
  blue: "#8eb4d4",
  panel: "#243044",
  line: "#3d4c66",
  deep: "#101722",
  reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

const LectureUI = {
  setStatus(id, text) {
    const el = document.getElementById(id);
    if (el && el.textContent !== text) el.textContent = text;
  },

  highlightLines(listId, index) {
    const list = document.getElementById(listId);
    if (!list) return;
    const active = Array.isArray(index) ? index : [index];
    [...list.children].forEach((li, i) => {
      li.classList.toggle("is-active", active.includes(i));
    });
  },

  showPanels(group, value) {
    document.querySelectorAll(`[data-panel-group="${group}"]`).forEach((el) => {
      el.hidden = el.dataset.panel !== value;
    });
  },

  pressOnly(sketch, action) {
    document.querySelectorAll(`[data-sketch="${sketch}"][data-press="exclusive"]`).forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.action === action ? "true" : "false");
    });
  },
};

function beginFrame(p, logicalW, logicalH) {
  p.background(LectureDraw.bg);
  const scale = Math.min(p.width / logicalW, p.height / logicalH);
  p.push();
  p.translate((p.width - logicalW * scale) / 2, (p.height - logicalH * scale) / 2);
  p.scale(scale);
  return scale;
}

function endFrame(p) {
  p.pop();
}

function sizeHost(p, host) {
  const w = Math.max(280, host.clientWidth || 480);
  const h = Math.max(300, Math.round(Math.min(440, w * 0.74)));
  if (!host.dataset.canvasReady) {
    p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    p.createCanvas(w, h);
    host.dataset.canvasReady = "1";
  } else if (p.width !== w || p.height !== h) {
    p.resizeCanvas(w, h);
  }
}

function withAlpha(p, hex, alpha) {
  const color = p.color(hex);
  color.setAlpha(alpha);
  return color;
}

function approach(current, target, amount) {
  if (LectureDraw.reduced) return target;
  return current + (target - current) * amount;
}

function arrow(p, x1, y1, x2, y2, color) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  p.push();
  p.stroke(color);
  p.strokeWeight(1.75);
  p.line(x1, y1, x2, y2);
  p.translate(x2, y2);
  p.rotate(angle);
  p.noStroke();
  p.fill(color);
  p.triangle(0, 0, -9, -4.5, -9, 4.5);
  p.pop();
}

function chip(p, label, x, y, w, h, opts = {}) {
  p.push();
  p.rectMode(p.CENTER);
  p.stroke(opts.stroke || LectureDraw.line);
  p.strokeWeight(opts.weight || 1.5);
  p.fill(opts.fill || LectureDraw.panel);
  p.rect(x, y, w, h, opts.radius == null ? 8 : opts.radius);
  p.noStroke();
  p.fill(opts.text || LectureDraw.ink);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(opts.size || 13);
  p.textLeading((opts.size || 13) + 3);
  p.text(label, x, y);
  p.pop();
}

function caption(p, text, logicalW, logicalH) {
  p.push();
  p.noStroke();
  p.fill(LectureDraw.muted);
  p.textAlign(p.CENTER, p.BOTTOM);
  p.textSize(12);
  p.text(text, logicalW / 2, logicalH - 8);
  p.pop();
}

function person(p, x, y, opts = {}) {
  const color = opts.color || LectureDraw.ink;
  const alpha = opts.alpha == null ? 255 : opts.alpha;
  const sc = opts.scale || 1;
  const swing = opts.walk ? Math.sin(opts.walk) * 5 : 0;
  p.push();
  p.translate(x, y);
  p.scale(sc);
  p.noStroke();
  p.fill(withAlpha(p, color, alpha));
  p.circle(0, -50, 14);
  p.rectMode(p.CENTER);
  p.rect(0, -30, 12, 20, 6);
  p.rect(-5, -8 + swing, 5, 20, 3);
  p.rect(5, -8 - swing, 5, 20, 3);
  p.pop();
}

function cameraIcon(p, x, y, color) {
  p.push();
  p.translate(x, y);
  p.noStroke();
  p.fill(color || LectureDraw.teal);
  p.rectMode(p.CENTER);
  p.rect(0, 0, 22, 14, 3);
  p.rect(-6, -9, 8, 5, 2);
  p.fill(LectureDraw.bg);
  p.circle(4, 0, 7);
  p.pop();
}

function polylinePoint(points, t) {
  const lengths = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    lengths.push(len);
    total += len;
  }
  if (total === 0) return points[0];
  let dist = ((t % 1) + 1) % 1 * total;
  for (let i = 0; i < lengths.length; i += 1) {
    if (dist <= lengths[i] || i === lengths.length - 1) {
      const u = lengths[i] === 0 ? 0 : dist / lengths[i];
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * u,
        y: points[i].y + (points[i + 1].y - points[i].y) * u,
      };
    }
    dist -= lengths[i];
  }
  return points[points.length - 1];
}

function travelingDot(p, points, t, color) {
  const pt = polylinePoint(points, t);
  p.push();
  p.noStroke();
  p.fill(color);
  p.circle(pt.x, pt.y, 8);
  p.pop();
}
