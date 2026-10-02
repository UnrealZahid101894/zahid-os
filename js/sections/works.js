// js/sections/works.js

import { reduce } from "../theme.js";
import { sY } from "../utils/scroll.js";
import { panel } from "../dom.js";
import { getOpenProject } from "../works/index.js";

export function initSel() {
  const sc = panel.querySelector(".sw-scene"), pin = sc.querySelector(".sw-pin"), tr = sc.querySelector(".sw-track"),
        svg = sc.querySelector(".sw-ln"), path = svg.querySelector("path"), intro = sc.querySelector(".sw-in"),
        cards = [...sc.querySelectorAll(".sw-ch")], stops = [...sc.querySelectorAll(".sw-ch, .sw-end")];
  sc.querySelectorAll(".sw-h .mk > span").forEach(sp => { sp.setAttribute("aria-hidden", "true"); sp.innerHTML = [...sp.textContent].map((c, i) => `<span class="sl" style="--i:${i}">${c}</span>`).join(""); });
  const SL = [...sc.querySelectorAll(".sw-h .sl")]; let hRun = 0, hPlayed = false;
  const hDrop = () => { hPlayed = true; cancelAnimationFrame(hRun); const t0 = performance.now();
    const tick = now => { const t = (now - t0) / 1000; let more = false;
      SL.forEach((e, i) => { const lp = 1 - Math.pow(1 - Math.max(0, Math.min(1, (t - i * .07) / 1.2)), 4); if (lp < 1) more = true;
        e.style.transform = lp >= 1 ? "none" : `translate3d(0,${(-(1 - lp) * 135).toFixed(2)}%,0) rotate(${((1 - lp) * -7).toFixed(2)}deg)`; });
      if (more) hRun = requestAnimationFrame(tick); };
    hRun = requestAnimationFrame(tick); };
  const hReset = () => { hPlayed = false; cancelAnimationFrame(hRun); SL.forEach(e => e.style.transform = "translate3d(0,-135%,0)"); };
  if (reduce) SL.forEach(e => e.style.transform = "none");
  let dx = 0, tk = false;
  const cl = v => Math.max(0, Math.min(1, v)), ez = t => 1 - Math.pow(1 - t, 3);
  const setQ = (root, q) => root.querySelectorAll("[data-k]").forEach(el => el.style.setProperty("--q", reduce ? 1 : ez(cl(q * 1.7 - el.dataset.k * .25)).toFixed(3)));
  const upd = () => {
    tk = false; const top = sc.getBoundingClientRect().top + scrollY - sY(), vw = pin.clientWidth, p = dx ? cl(-top / dx) : 0, hq = reduce ? 1 : cl((innerHeight * .85 - top) / (innerHeight * .45));
    tr.style.transform = `translate3d(${(-p * dx).toFixed(1)}px,0,0)`;
    if (!reduce) { if (!hPlayed && top < innerHeight * .62) hDrop(); else if (hPlayed && top > innerHeight * .98) hReset(); }
    setQ(intro, hq); stops.forEach(c => setQ(c, Math.min(hq, cl((vw * .94 - c.getBoundingClientRect().left) / (vw * .3)))));
  };
  /* thin connector line that runs through the cards, edge to edge, like a circuit trace */
  const trace = () => {
    const tb = tr.getBoundingClientRect(), w = tr.scrollWidth, h = tr.clientHeight, P = cards.map(c => { const r = c.querySelector(".sw-pl").getBoundingClientRect(); return { l: r.left - tb.left, r: r.right - tb.left, m: (r.top + r.bottom) / 2 - tb.top }; });
    svg.setAttribute("width", w); svg.setAttribute("height", h); svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    if (!P.length) { path.setAttribute("d", ""); return; }
    let d = `M ${(P[0].l - innerWidth * .035).toFixed(1)} ${P[0].m.toFixed(1)} H ${P[0].l.toFixed(1)}`;
    P.forEach((a, i) => { const n = P[i + 1]; if (n) { const g = Math.min(80, (n.l - a.r) * .35); d += ` M ${a.r.toFixed(1)} ${a.m.toFixed(1)} H ${(a.r + g).toFixed(1)} L ${(n.l - g).toFixed(1)} ${n.m.toFixed(1)} H ${n.l.toFixed(1)}`; } else d += ` M ${a.r.toFixed(1)} ${a.m.toFixed(1)} H ${(a.r + innerWidth * .06).toFixed(1)}`; });
    path.setAttribute("d", d);
  };
  const meas = () => { tr.style.transform = ""; dx = Math.max(0, tr.scrollWidth - pin.clientWidth); sc.style.height = (pin.clientHeight + dx) + "px"; trace(); upd(); };
  const open = c => getOpenProject()(+c.dataset.i, c);
  cards.forEach(c => { c.addEventListener("click", () => open(c)); c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(c); } }); });
  addEventListener("scroll", () => { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener("resize", meas); meas();
  if (document.fonts) document.fonts.ready.then(meas);
}
/* home heading: after the loader lifts, the letters drop in through the top edge on their own, centre first (same motion as the About title) */