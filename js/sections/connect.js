// js/sections/connect.js

import { reduce } from "../theme.js";
import { panel } from "../dom.js";
import { sY } from "../utils/scroll.js";

export function initConnect() {
  const masks = [...panel.querySelectorAll(".mask")], g = panel.querySelector("#giant"),
        clock = panel.querySelector("#clock"), form = panel.querySelector("form"); let ticking = false;
  const LT = masks.map(m => { const mi = m.querySelector("#giant") || m.firstElementChild, txt = mi.textContent.trim(); mi.setAttribute("aria-label", txt);   // the giant name keeps its own span: fit() sizes it
    mi.innerHTML = txt.split(" ").map(w => `<span class="cw" aria-hidden="true">${[...w].map(ch => `<span class="cl">${ch}</span>`).join("")}</span>`).join(" ");
    const L = [...mi.querySelectorAll(".cl")]; return { m, L, d: L.map(() => 0), s: L.map(() => 1), tp: 0, cp: 0 }; });
  let craf = 0; const eq = v => 1 - Math.pow(1 - v, 4);
  const cdraw = () => LT.forEach(o => o.L.forEach((e, i) => { const lp = eq(Math.max(0, Math.min(1, (o.cp - o.d[i] * .5 - ((i * 37) % 11) / 11 * .07) / .43)));
    e.style.transform = lp >= 1 ? "" : `translate3d(0,${(-(1 - lp) * 135).toFixed(2)}%,0)`; }));   // same as the About heading: letters drop in from the top edge, centre first
  const cstep = () => { craf = 0; let more = false;
    LT.forEach(o => { o.cp += (o.tp - o.cp) * (reduce ? 1 : .09); if (Math.abs(o.tp - o.cp) < .0008) o.cp = o.tp; else more = true; });
    cdraw(); if (more) craf = requestAnimationFrame(cstep); };
  const cmeas = () => { LT.forEach(o => { o.L.forEach(e => e.style.transform = ""); const rs = o.L.map(e => e.getBoundingClientRect()),
      c = (Math.min(...rs.map(r => r.left)) + Math.max(...rs.map(r => r.right))) / 2, xs = rs.map(r => Math.abs(r.left + r.width / 2 - c)), mx = Math.max(...xs) || 1;
    o.d = xs.map(x => x / mx); o.s = rs.map(r => r.left + r.width / 2 < c ? -1 : 1); }); cdraw(); };   // centre letters first, the sides follow (as on About)
  const fit = () => {
    g.style.fontSize = "100px";
    const w = g.getBoundingClientRect().width;
    // Use the parent's clientWidth as the available space.
    // Multiply by .96 for a small safety margin so the right edge never clips.
    const avail = g.parentElement.clientWidth * .96;
    const size = Math.min(100 * avail / w, innerHeight * .55);
    g.style.fontSize = size + "px";
  };
  const tick = () => { ticking = false; const vh = innerHeight;
    LT.forEach(o => { const r = o.m.getBoundingClientRect(); o.tp = reduce ? 1 : Math.max(0, Math.min(1, (vh * .94 - (r.top + scrollY - sY())) / (vh * .6))); });
    if (!craf) craf = requestAnimationFrame(cstep); };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } };
  const onResize = () => { fit(); cmeas(); req(); };
  const time = () => { clock.textContent = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Dhaka" }).format(new Date()); };
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", onResize);
  const iv = setInterval(time, 15000); time(); fit(); cmeas(); tick();
  if (document.fonts) document.fonts.ready.then(onResize);
  form.addEventListener("submit", e => { e.preventDefault(); const d = new FormData(form);
    location.href = "mailto:your-email@example.com?subject=" + encodeURIComponent("Project inquiry from " + d.get("name")) +
      "&body=" + encodeURIComponent(`Name: ${d.get("name")}\nPhone: ${d.get("phone")}\nEmail: ${d.get("email")}\n\n${d.get("msg")}`); });
  return () => { removeEventListener("scroll", req); removeEventListener("resize", onResize); clearInterval(iv); cancelAnimationFrame(craf); };
}

/* about heading: scrubbed by scroll. Letters drop in through the top edge, centre ones first and the sides following; scrolling back up reverses it. */