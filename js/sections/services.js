// js/sections/services.js

import { panel } from "../dom.js";

export function initServices() {
  const acc = panel.querySelector(".acc"), cols = [...acc.children], fine = matchMedia("(hover: hover) and (min-width: 721px)");
  const set = c => { cols.forEach(x => x.classList.toggle("on", x === c)); acc.classList.toggle("has-on", !!c); };
  cols.forEach(c => {
    c.addEventListener("mouseenter", () => { if (fine.matches) set(c); });
    c.addEventListener("focus", () => set(c));
    c.addEventListener("click", () => set(!fine.matches && c.classList.contains("on") ? null : c));
    c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(c); } });
  });
  acc.addEventListener("mouseleave", () => { if (fine.matches) set(null); });
  acc.addEventListener("focusout", e => { if (!acc.contains(e.relatedTarget)) set(null); });
}
/* connect page: big lines slide behind their masks as you scroll; giant name fits the width; Dhaka clock */