// js/loader.js
// Boot sequence: a single dial sweep, INITIALIZING -> READY, handoff to header dial.
// Uses paint() and getT() from theme.js so it can color-ride the sweep.

import { paint, getT } from "./theme.js";

export function initLoader() {

  const ld = document.getElementById("ld"); if (!ld) return;
  const root = document.documentElement, still = matchMedia("(prefers-reduced-motion: reduce)").matches,
        dial = ld.querySelector(".ld-dial"), orbit = ld.querySelector(".ld-orbit"), bg = ld.querySelector(".ld-bg"), st = ld.querySelector(".ld-s"), sr = ld.querySelector(".ld-sr");
  let spun = still, ready = false, going = false;
  root.style.overflow = "hidden";
  const exit = () => {
    tint(home());   // whatever the lap managed (background tab, slow frame), leave on the exact palette the page rests on
    ld.classList.add("out");   // the home heading waits for this class before it drops in
    const done = () => { ld.remove(); root.style.overflow = ""; };
    const hd = document.getElementById("dial");
    if (still || !hd) { ld.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: "linear", fill: "forwards" }).onfinish = done; return; }
    const a = dial.getBoundingClientRect(), b = hd.getBoundingClientRect(),
          to = `translate3d(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px,0) scale(${b.width / a.width})`;
    st.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 110, easing: "linear", fill: "forwards" });
    bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 60, easing: "linear", fill: "forwards" });
    dial.animate([{ transform: "translate3d(0,0,0) scale(1)", opacity: 1 }, { opacity: 1, offset: .7 }, { transform: to, opacity: 0 }], { duration: 270, easing: "cubic-bezier(.7,0,.2,1)", fill: "both" }).onfinish = done;   // settles into the header dial
  };
  const settle = () => {
    if (going || !spun || !ready) return; going = true;
    ld.classList.add("rdy"); sr.textContent = "System ready";
    setTimeout(exit, still ? 280 : 110);
  };
  const A = still || !orbit.getAnimations ? null : orbit.getAnimations()[0];   // the CSS sweep as a Web Animation: read-only here
  const sweepMs = A && A.effect ? A.effect.getComputedTiming().endTime : 1400;
  if (still) ld.classList.add("rdy");   // reduced motion: no sweep, no colour lap, straight to the ready state
  else { orbit.addEventListener("animationend", () => { spun = true; settle(); }, { once: true }); setTimeout(() => { spun = true; settle(); }, sweepMs + 900); }
  /* Colours. The sweep is one lap of the 24h theme dial (11:00 -> 11:00, clockwise = forward in time), so the knob and the palette move together:
     off-white -> white -> stone -> sage -> emerald -> navy -> black -> bordeaux -> clay -> champagne -> off-white. paint(t), K and ease() are the
     page's own (theme script below): no second palette, no second blend. The page underneath reads the same --bg/--fg/--ac/--dim, so when the
     loader lifts there is nothing to match. progress is the eased value, so the colours follow the knob's pace exactly. */
  const home = () => getT(), born = performance.now();
  const tint = t => paint(t);
  const lap = now => {
    const raw = A && A.effect ? A.effect.getComputedTiming().progress : (now - born) / sweepMs,
          p = Math.min(1, Math.max(0, raw || 0));
    tint((home() + 24 * p) % 24);   // p = 1 lands exactly on home(), the palette the page rests on
    if (p < 1 && !going) requestAnimationFrame(lap);
  };
  if (!still) requestAnimationFrame(lap);
  const fonts = Promise.race([Promise.all([document.fonts.load('800 80px "Barlow Condensed"'), document.fonts.load('400 14px "Spline Sans Mono"')]), new Promise(r => setTimeout(r, 1500))]).catch(() => {});
  Promise.all([fonts, new Promise(r => document.readyState === "complete" ? r() : addEventListener("load", r, { once: true }))]).then(() => { ready = true; settle(); });
  setTimeout(() => { ready = true; settle(); }, 4000);   // never trap anyone behind the loader
}
