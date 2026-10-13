// js/sections/works.js

import { reduce } from "../theme.js";
import { sY } from "../utils/scroll.js";
import { panel } from "../dom.js";
import { getOpenProject } from "../works/index.js";
export function initSel() {
  const sc = panel.querySelector(".sw-scene");
  if (!sc) return;
  const pin    = sc.querySelector(".sw-pin");
  const names  = [...sc.querySelectorAll(".sw-name")];
  const slides = [...sc.querySelectorAll(".sw-slide")];
  const dets   = [...sc.querySelectorAll(".sw-det")];
  const bar    = sc.querySelector(".sw-prog-bar");
  const N      = names.length;
  if (!N) return;

  const isNarrow = () => innerWidth < 721;
  const sizeScene = () => {
    if (isNarrow()) { sc.style.height = "auto"; }
    else { sc.style.height = (N * 90) + "vh"; }   // 90vh per project: comfortable pace
  };
  sizeScene();

  let active = -1;
  let tk = false;
  const cl = v => Math.max(0, Math.min(1, v));

  function layout(activeIdx) {
    for (let i = 0; i < slides.length; i++) {
      const d = i - activeIdx;
      const s = slides[i];
      if (d === 0) {
        s.style.transform = "translate3d(0,0,0) scale(1)";
        s.style.opacity   = "1";
        s.style.zIndex    = "3";
        s.style.filter    = "none";
      } else if (d === -1) {
        // previous: peeked above, faded
        s.style.transform = "translate3d(0,-52%,0) scale(.82)";
        s.style.opacity   = ".28";
        s.style.zIndex    = "2";
        s.style.filter    = "grayscale(100%)";
      } else if (d === 1) {
        // next: peeked below, faded
        s.style.transform = "translate3d(0,52%,0) scale(.82)";
        s.style.opacity   = ".28";
        s.style.zIndex    = "2";
        s.style.filter    = "grayscale(100%)";
      } else if (d < -1) {
        s.style.transform = "translate3d(0,-82%,0) scale(.68)";
        s.style.opacity   = ".08";
        s.style.zIndex    = "1";
        s.style.filter    = "grayscale(100%)";
      } else {
        s.style.transform = "translate3d(0,82%,0) scale(.68)";
        s.style.opacity   = ".08";
        s.style.zIndex    = "1";
        s.style.filter    = "grayscale(100%)";
      }
    }
  }

  function setActive(i) {
    if (i === active) return;
    active = i;
    names .forEach((el, k) => el.classList.toggle("on", k === i));
    dets  .forEach((el, k) => el.classList.toggle("on", k === i));
    slides.forEach((el, k) => el.classList.toggle("on", k === i));
    if (!isNarrow()) layout(i);
  }

  function upd() {
    tk = false;
    if (isNarrow()) {
      if (bar) bar.style.transform = "scaleX(1)";
      return;
    }
    const rect  = sc.getBoundingClientRect();
    const total = sc.offsetHeight - innerHeight;
    if (total <= 0) return;
    const p = cl(-rect.top / total);
    const i = Math.min(N - 1, Math.max(0, Math.floor(p * N)));
    setActive(i);
    if (bar) bar.style.transform = `scaleX(${p.toFixed(3)})`;
  }
  const req = () => { if (!tk) { tk = true; requestAnimationFrame(upd); } };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", () => { sizeScene(); req(); });

  names.forEach(n => n.addEventListener("click", () => {
    const i = +n.dataset.i;
    if (isNarrow()) {
      setActive(i);
      const slide = slides[i];
      if (slide) slide.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const target = sc.offsetTop + (i + 0.5) * (sc.offsetHeight - innerHeight) / N;
    scrollTo({ top: target, behavior: "smooth" });
  }));

  // initial paint
  layout(0);
  setActive(0);
  upd();
}
