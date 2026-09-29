const mounts = {
  blackBox: mountBlackBox("sketch-blackbox"),
  idea: mountIdea("sketch-idea"),
  pseudo: mountPseudo("sketch-pseudo"),
  flow: mountFlow("sketch-flow"),
  state: mountState("sketch-state"),
  interaction: mountInteraction("sketch-interaction"),
  mechanic: mountMechanic("sketch-mechanic"),
  risk: mountRisks("sketch-risk"),
  recap: mountRecap("sketch-recap"),
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sketch]");
  if (!button) return;
  const sketch = mounts[button.dataset.sketch];
  if (sketch && typeof sketch.handle === "function") sketch.handle(button.dataset.action);
});

const navLinks = [...document.querySelectorAll(".section-nav a")];
const linkById = new Map(navLinks.map((link) => [link.getAttribute("href").slice(1), link]));

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.remove("is-current"));
  const current = linkById.get(visible.target.id);
  if (current) {
    current.classList.add("is-current");
    current.setAttribute("aria-current", "true");
  }
  navLinks.forEach((link) => {
    if (link !== current) link.removeAttribute("aria-current");
  });
}, { rootMargin: "-45% 0px -45% 0px", threshold: [0.1, 0.25, 0.5] });

document.querySelectorAll(".lecture-section").forEach((section) => {
  sectionObserver.observe(section);
});

const sketchObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const sketch = entry.target._sketch;
    if (!sketch) return;
    if (entry.isIntersecting) sketch.loop();
    else sketch.noLoop();
  });
}, { rootMargin: "160px 0px" });

function watchSketches() {
  Object.values(mounts).forEach((sketch) => {
    if (!sketch.canvas) return;
    const parent = sketch.canvas.parentElement;
    parent._sketch = sketch;
    sketchObserver.observe(parent);
  });
}

if (document.readyState === "complete") watchSketches();
else window.addEventListener("load", watchSketches);
