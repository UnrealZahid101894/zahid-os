// js/sections/works.js

import { reduce } from "../theme.js";
import { sY } from "../utils/scroll.js";
import { panel } from "../dom.js";
import { getOpenProject } from "../works/index.js";
export function initSel() {
  const sc = panel.querySelector(".sw-scene");
  if (!sc) return;
  const namesCol = sc.querySelector(".sw-names");
  const mediaCol = sc.querySelector(".sw-media");
  const names    = [...sc.querySelectorAll(".sw-name")];
  const slides   = [...sc.querySelectorAll(".sw-slide")];
  const dets     = [...sc.querySelectorAll(".sw-det")];
  const N        = names.length;
  if (!N || !namesCol || !mediaCol) return;

  const isNarrow = () => innerWidth < 901;

  /* continuous position: 0 = project 0, 1 = project 1, ...
     `target` jumps, `pos` eases toward it. */
  let pos = 0, target = 0, vel = 0, raf = 0, active = -1;

  function setActive(i) {
    if (i === active) return;
    active = i;
    names .forEach((el, k) => el.classList.toggle("on", k === i));
    dets  .forEach((el, k) => el.classList.toggle("on", k === i));
    slides.forEach((el, k) => el.classList.toggle("on", k === i));
  }

  function layout(p) {
    for (let i = 0; i < slides.length; i++) {
      const d = i - p;
      const a = Math.abs(d);
      const s = slides[i];
      if (a > 2.4) {
        s.style.opacity = "0";
        s.style.pointerEvents = "none";
        continue;
      }
      /* horizontal slides fan up/down — prev above, next below */
      const ty = d * 52;
      const sc2 = 1 - Math.min(0.22, a * 0.18);
      const op = Math.max(0, 1 - a * 0.5);
      s.style.transform = `translate3d(0, ${ty}%, 0) scale(${sc2})`;
      s.style.opacity = op.toFixed(3);
      s.style.zIndex = String(Math.max(1, 12 - Math.round(a * 4)));
      s.style.pointerEvents = a < 0.5 ? "auto" : "none";
      s.style.filter = a < 0.5 ? "none" : "grayscale(100%) brightness(.85)";
    }
  }

  function tick() {
    raf = 0;

    /* carry leftover velocity from wheel flicks */
    if (Math.abs(vel) > 0.0015) {
      target += vel;
      vel *= 0.86;
      target = Math.max(0, Math.min(N - 1, target));
    } else if (!dragging) {
      /* momentum is dead and the user isn't dragging:
         snap the target to the nearest project, always. */
      vel = 0;
      const snapped = Math.max(0, Math.min(N - 1, Math.round(target)));
      if (snapped !== target) {
        target = snapped;
      }
    }

    /* ease pos toward target */
    const delta = target - pos;
    if (Math.abs(delta) < 0.0008) {
      pos = target;
      layout(pos);
      setActive(Math.round(pos));
      return;
    }
    pos += delta * 0.18;
    layout(pos);
    setActive(Math.round(pos));
    raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  /* ── wheel: only on names column and media box ── */
  function onWheel(e) {
    if (isNarrow()) return;
    e.preventDefault();
    const d = Math.max(-120, Math.min(120, e.deltaY)) / 120;   // -1 .. 1
    /* move half a project per tick, let the snap settle it */
    target += d * 0.5;
    target = Math.max(0, Math.min(N - 1, target));
    vel = d * 0.04;
    kick();
  }
  namesCol.addEventListener("wheel", onWheel, { passive: false });
  mediaCol.addEventListener("wheel", onWheel, { passive: false });

  /* ── hover names: jump to that project ── */
  names.forEach((n) => {
    n.addEventListener("mouseenter", () => {
      if (isNarrow()) return;
      target = +n.dataset.i;
      vel = 0;
      kick();
    });
    n.addEventListener("click", () => {
      target = +n.dataset.i;
      vel = 0;
      kick();
    });
  });

  /* ── drag on media: scrub through projects ── */
  let dragging = false, dragY = 0, dragStart = 0;
  mediaCol.addEventListener("pointerdown", (e) => {
    if (isNarrow()) return;
    dragging = true;
    dragY = e.clientY;
    dragStart = target;
    vel = 0;
    try { mediaCol.setPointerCapture(e.pointerId); } catch(_) {}
  });
  mediaCol.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = e.clientY - dragY;
    target = Math.max(0, Math.min(N - 1, dragStart - dy / 90));
    kick();
  });
  const endDrag = () => { dragging = false; vel = 0; };
  mediaCol.addEventListener("pointerup", endDrag);
  mediaCol.addEventListener("pointercancel", endDrag);
  mediaCol.addEventListener("pointerleave", () => { if (dragging) endDrag(); });

  /* ── keyboard on names column ── */
  namesCol.setAttribute("tabindex", "0");
  namesCol.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      target = Math.min(N - 1, Math.round(target) + 1); vel = 0; kick();
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      target = Math.max(0, Math.round(target) - 1); vel = 0; kick();
    }
  });

  /* resize: recompute narrow state */
  addEventListener("resize", () => {
    if (isNarrow()) {
      slides.forEach(s => { s.style.transform = ""; s.style.filter = ""; });
    } else {
      layout(pos);
    }
  });

  /* initial paint */
  layout(0);
  setActive(0);
}
