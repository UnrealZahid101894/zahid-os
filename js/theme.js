// js/theme.js
// Palette engine: interpolation, paint, dial controls.
// Depends on color utils. Owns the mutable time-of-day value T.

import { lin, gam, toLab, fromLab, mix, lum, ratio, readable, css } from "./utils/color.js";

export const K = [
  { t: 0,    bg: [0,0,0],       fg: [238,233,224], ac: [201,169,110] }, // black + ivory + champagne gold
  { t: 3,    bg: [44,12,20],    fg: [236,214,190], ac: [214,150,120] }, // bordeaux + rose gold
  { t: 6,    bg: [158,102,92],  fg: [250,240,232], ac: [255,214,170] }, // dusty clay
  { t: 9,    bg: [230,220,203], fg: [32,25,20],    ac: [112,110,106] }, // champagne + warm graphite
  { t: 12,   bg: [255,255,255], fg: [10,10,10],    ac: [118,118,116] }, // white + ink + graphite (no gold)
  { t: 15,   bg: [214,209,200], fg: [28,28,26],    ac: [86,96,80]    }, // warm stone + sage
  { t: 17,   bg: [104,124,110], fg: [245,245,240], ac: [230,215,170] }, // sage
  { t: 19.5, bg: [8,38,30],     fg: [232,224,200], ac: [201,169,110] }, // emerald + gold
  { t: 22,   bg: [10,16,38],    fg: [226,228,238], ac: [170,180,220] }, // midnight navy + silver blue
];


K.forEach(k => { k.lbg = toLab(k.bg); k.lfg = toLab(k.fg); k.lac = toLab(k.ac); });

/* Smooth curve through the palettes (Catmull-Rom, looping): no corners, no stops at the palettes. */
export const N = K.length;
export const at = n => K[((n % N) + N) % N];
export const tAt = n => at(n).t + 24 * Math.floor(n / N);
export function curve(key, i, u) {
  const p0 = at(i - 1)[key], p1 = at(i)[key], p2 = at(i + 1)[key], p3 = at(i + 2)[key];
  return p1.map((_, c) => .5 * (2 * p1[c] + (p2[c] - p0[c]) * u
    + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u * u
    + (3 * p1[c] - p0[c] - 3 * p2[c] + p3[c]) * u * u * u));
}



/* Every color glides toward its target, so even a fast drag changes the theme gently. */
export const shown = {}, tgt = {}; let easing = false, last = 0;
export function ease(now) {
  const dt = Math.min(((now || 0) - last) / 1000, .1) || 1 / 60; last = now || 0;
  const k = 1 - Math.pow(1 - .07, dt * 60);   // same speed at 60Hz or 120Hz
  const root = document.documentElement.style; let moving = false;
  for (const n of ["bg", "fg", "ac", "dim"]) {
    const s = shown[n] || (shown[n] = [...tgt[n]]);
    for (let i = 0; i < 3; i++) {
      const d = tgt[n][i] - s[i];
      if (reduce || Math.abs(d) < .4) s[i] = tgt[n][i]; else { s[i] += d * k; moving = true; }
    }
    root.setProperty("--" + n, css(s.map(Math.round)));
  }
  easing = moving;
  if (moving) requestAnimationFrame(ease);
}

export function paint(t) {
  let i = 0; while (i + 1 < N && at(i + 1).t <= t) i++;
  const u = (t - at(i).t) / (tAt(i + 1) - at(i).t);
  const bg = fromLab(curve("lbg", i, u));
  const fg = readable(fromLab(curve("lfg", i, u)), bg, 4.5);
  const ac = readable(fromLab(curve("lac", i, u)), bg, 3.5);
  tgt.bg = bg; tgt.fg = fg; tgt.ac = ac; tgt.dim = fg;
  for (const k of [.4, .3, .22, .14, .08]) { const c = mix(fg, bg, k); if (ratio(c, bg) >= 4.5) { tgt.dim = c; break; } }
  if (!easing) { easing = true; requestAnimationFrame(ease); }
  // dial
  const ang = (t - 12) / 24 * 2 * Math.PI;
  const knob = document.getElementById("knob");
  knob.setAttribute("cx", 50 + 29 * Math.sin(ang));   // orbit sits inside the ring
  knob.setAttribute("cy", 50 - 29 * Math.cos(ang));
  const dl = document.getElementById("dial"), hh = Math.floor(t) % 24, mm = Math.floor((t % 1) * 60);
  dl.setAttribute("aria-valuenow", t.toFixed(2));
  dl.setAttribute("aria-valuetext", ((hh % 12) || 12) + ":" + String(mm).padStart(2, "0") + (hh < 12 ? " AM" : " PM"));
}

export const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
export let T = 11, raf;   // every load rests at off-white (11:00). The loader laps the whole day and returns here (see loader script).
export function setTime(target, animate) {
  cancelAnimationFrame(raf);
  target = ((target % 24) + 24) % 24;
  if (!animate || reduce) { T = target; paint(T); return; }
  let d = target - T; if (d > 12) d -= 24; if (d < -12) d += 24;   // take the short way round
  const from = T, t0 = performance.now();
  (function step(now) {
    const p = Math.min((now - t0) / 700, 1), e = 1 - (1 - p) ** 3;
    T = ((from + d * e) % 24 + 24) % 24; paint(T);
    if (p < 1) raf = requestAnimationFrame(step);
  })(t0);
}


/* ---------- dial: drag or use arrow keys ---------- */
export const dial = document.getElementById("dial");
export function fromPointer(e) {
  const r = dial.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  const deg = Math.atan2(dx, -dy) * 180 / Math.PI;      // 0 = top = noon
  setTime(12 + deg / 360 * 24, false);
}
dial.addEventListener("pointerdown", e => { dial.setPointerCapture(e.pointerId); fromPointer(e); });
dial.addEventListener("pointermove", e => { if (dial.hasPointerCapture(e.pointerId)) fromPointer(e); });
dial.addEventListener("keydown", e => {
  if (e.key === "ArrowRight" || e.key === "ArrowUp") { setTime(T + .5, false); e.preventDefault(); }
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setTime(T - .5, false); e.preventDefault(); }
});

// Getter for the mutable T value (modules can't export live bindings)
export function getT() { return T; }
