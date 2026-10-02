// js/sections/services.js

import { panel } from "../dom.js";

export function initServices() {
  const acc = panel.querySelector(".acc");
  if (!acc) return;
  const cols = [...acc.children];
  const fine = matchMedia("(hover: hover) and (min-width: 721px)");
  const set = c => {
    cols.forEach(x => x.classList.toggle("on", x === c));
    acc.classList.toggle("has-on", !!c);
  };
  const toggle = c => set(c.classList.contains("on") ? null : c);

  // Mobile: ghost-click guard ? ignore any tap that fires within 400ms of the last one.
  let lastTap = 0;

  // Attach both hover + click unconditionally.
  // fine.matches is checked INSIDE the handlers so that switching between
  // desktop and mobile (DevTools emulation, resized window) always works.
  cols.forEach(c => {
    c.addEventListener("mouseenter", () => { if (fine.matches) set(c); });
    c.addEventListener("click", () => {
      if (fine.matches) { set(c); return; }
      const now = performance.now();
      if (now - lastTap < 400) return;    // ghost-click guard
      lastTap = now;
      toggle(c);
    });
    c.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (fine.matches) set(c); else toggle(c);
      }
    });
  });

  acc.addEventListener("mouseleave", () => { if (fine.matches) set(null); });
}
/* connect page: big lines slide behind their masks as you scroll; giant name fits the width; Dhaka clock */