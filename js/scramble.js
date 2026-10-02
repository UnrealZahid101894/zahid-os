// js/scramble.js
// Nav glyph scramble on hover/focus.

import { reduce } from "./theme.js";

export const GLYPHS = "!<>-_/[]{}=+*^?#0123456789";
export function scramble(el) {
  const text = el.dataset.text;
  cancelAnimationFrame(el._raf);
  if (reduce) { el.textContent = text; return; }
  const t0 = performance.now();
  const settle = [...text].map((_, i) => 140 + i * 60 + Math.random() * 120);   // when each letter locks in
  const end = Math.max(...settle);
  (function frame(now) {
    const t = now - t0, slot = Math.floor(t / 55);        // glyphs change ~18 times a second: lively, not flickery
    let out = "";
    for (let i = 0; i < text.length; i++) {
      out += t >= settle[i] ? text[i] : GLYPHS[(Math.imul(slot * 31 + i * 17 + 7, 2654435761) >>> 0) % GLYPHS.length];
    }
    el.textContent = out;
    if (t < end) el._raf = requestAnimationFrame(frame); else el.textContent = text;
  })(t0);
}
