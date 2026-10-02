// js/sections/home.js
// Home section: fitted heading + drop-in animation.

import { reduce } from "../theme.js";
import { panel } from "../dom.js";

export function fitHome() {
  const h = panel.querySelector(".hm-h"); if (!h) return;
  const W = h.parentElement.clientWidth, two = matchMedia("(max-width: 720px)").matches, sp = [...h.children];
  h.classList.toggle("two", two);
  const fit = (el, w) => { el.style.fontSize = "100px"; el.style.fontSize = (100 * w / el.getBoundingClientRect().width) + "px"; };
  if (two) { h.style.fontSize = ""; sp.forEach(x => fit(x, W)); }
  else { sp.forEach(x => x.style.fontSize = ""); fit(h, W); }
}
addEventListener("resize", fitHome);

/* services page: hovering (or tapping) a column grows it and shrinks the rest; leaving resets to equal */

export function initHomeDrop() {
  const h = panel.querySelector(".hm-h"); if (!h) return;
  h.setAttribute("aria-label", h.textContent.trim().replace(/\s+/g, " "));
  [...h.children].forEach(sp => { sp.setAttribute("aria-hidden", "true"); sp.innerHTML = [...sp.textContent].map(c => `<span class="hl">${c}</span>`).join(""); });
  if (reduce) return;
  const L = [...h.querySelectorAll(".hl")], jit = L.map((_, i) => ((i * 37) % 11) / 11), ease = v => 1 - Math.pow(1 - v, 4), cl = v => Math.max(0, Math.min(1, v));
  h.style.clipPath = "inset(-4% -3% -8% -3%)"; L.forEach(e => e.style.transform = "translate3d(0,-135%,0)");
  let d = [], started = false;
  const meas = () => { const r = h.getBoundingClientRect(), c = r.left + r.width / 2, xs = L.map(e => { const b = e.getBoundingClientRect(); return Math.abs(b.left + b.width / 2 - c); }), m = Math.max(...xs) || 1; d = xs.map(x => x / m); };
  const run = () => { meas(); const t0 = performance.now(), TOTAL = 2000;
    const tick = now => { const cp = cl((now - t0) / TOTAL);
      L.forEach((e, i) => { const lp = ease(cl((cp - d[i] * .5 - jit[i] * .07) / .43)); e.style.transform = lp >= 1 ? "" : `translate3d(0,${(-(1 - lp) * 135).toFixed(2)}%,0)`; });
      if (cp < 1) requestAnimationFrame(tick); else h.style.clipPath = "none"; };
    requestAnimationFrame(tick); };
  const start = () => { if (started) return; started = true; setTimeout(run, 380); };
  const ld = document.getElementById("ld");
  if (!ld) start(); else { const mo = new MutationObserver(() => { if (!ld.isConnected || ld.classList.contains("out")) { mo.disconnect(); start(); } });
    mo.observe(ld, { attributes: true, attributeFilter: ["class"] }); setTimeout(start, 9000); }
}
/* ---------- ONE PAGE: sections are stacked; the nav scrolls to them and text animates in as you arrive ---------- */
/* home hero: file tree that draws itself in as the user scrolls.
   Each row reads --q (0 → 1) and grows its trunk, elbow and label
   with a stagger, so the whole tree blooms downward from the root. */