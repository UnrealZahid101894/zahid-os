import { lin, gam, toLab, fromLab, mix, lum, ratio, readable, css } from "./utils/color.js";
import { sY, setScrollY } from "./utils/scroll.js";
import { paint, setTime, reduce, getT } from "./theme.js";
import { scramble } from "./scramble.js";
import { initLoader } from "./loader.js";
import { PHOTO, PH_A, PH_B, GH, WK, WK_MAIN, WK_CS, SVC } from "./data.js";
import { svcHTML, HOME, wkModal, PANELS, aboutHTML, selHTML } from "./templates.js";
import { initWorks, getOpenProject } from "./works/index.js";
import { initAbTitle, abPhys, initAbout, initCurtain } from "./sections/about.js";

/* ---------- theme: palettes at four times of day, blended between them ---------- */
/* ---------- nav: brackets open and the label scrambles into place on hover ---------- */
/* ---------- content: clicking a nav item swaps the text below the name ---------- */






const panel = document.getElementById("panel");
let cleanup = null;
/* home: the giant heading is fitted to the page width (one line on desktop, two fitted lines on phones) */
function fitHome() {
  const h = panel.querySelector(".hm-h"); if (!h) return;
  const W = h.parentElement.clientWidth, two = matchMedia("(max-width: 720px)").matches, sp = [...h.children];
  h.classList.toggle("two", two);
  const fit = (el, w) => { el.style.fontSize = "100px"; el.style.fontSize = (100 * w / el.getBoundingClientRect().width) + "px"; };
  if (two) { h.style.fontSize = ""; sp.forEach(x => fit(x, W)); }
  else { sp.forEach(x => x.style.fontSize = ""); fit(h, W); }
}
addEventListener("resize", fitHome);

/* services page: hovering (or tapping) a column grows it and shrinks the rest; leaving resets to equal */
function initServices() {
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
function initConnect() {
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
  const fit = () => { g.style.fontSize = "100px"; const w = g.getBoundingClientRect().width;
    g.style.fontSize = Math.min(100 * g.parentElement.clientWidth / w, innerHeight * .55) + "px"; };
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
function initSel() {
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
function initHomeDrop() {
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
const SECS = [["home", HOME], ["about", PANELS.about], ["works", selHTML()], ["services", PANELS.services], ["connect", PANELS.connect]];
panel.setAttribute("aria-live", "off");
panel.innerHTML = SECS.map(([k, h]) => `<div class="pg" id="s-${k}">${h}</div>`).join("");
document.body.classList.add("one");
const hdr = document.querySelector("header"), navs = [...document.querySelectorAll(".nav")], sec = k => document.getElementById("s-" + (k || "home"));
let SM = null;   // smooth-scroll engine, set below
function go(key) {
  try { history.replaceState(null, "", key ? "#" + key : location.pathname + location.search); } catch (e) {}
  const el = sec(key);
  if (SM) SM(el.getBoundingClientRect().top + scrollY); else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
const fromHash = () => { const h = location.hash.slice(1); return SECS.some(([k]) => k === h) ? h : null; };
addEventListener("hashchange", () => go(fromHash()));
navs.forEach(btn => {
  const label = btn.querySelector(".t");
  btn.addEventListener("mouseenter", () => scramble(label));
  btn.addEventListener("focus", () => { if (btn.matches(":focus-visible")) scramble(label); });
  btn.addEventListener("click", () => { go(btn.dataset.run); if (matchMedia("(hover: none)").matches) scramble(label); });
});
document.getElementById("home").addEventListener("click", () => go(null));

/* reveal targets: .rc wipes text up out of a mask, .rv fades + rises. Checked on scroll (no observer, so clip-paths can't hide them from it). */
const RC = [".sv-top h2", ".wk-lab", ".wk-list li"],
      RV = [".hm-card", ".hm-based", ".hm-intro", ".sv-top span", ".wk-th", ".wk-caps", ".wk-more"];
RC.forEach(q => panel.querySelectorAll(q).forEach((el, i) => { el.classList.add("rc"); if (q === ".wk-list li") el.style.setProperty("--rd", i * .08 + "s"); }));
RV.forEach((q, n) => panel.querySelectorAll(q).forEach(el => { el.classList.add("rv"); el.style.setProperty("--rd", (n % 3) * .12 + "s"); }));
let pend = [...panel.querySelectorAll(".rc, .rv, .acc")], ly2 = 0, tk2 = false;
const hh = () => document.body.style.setProperty("--hh", hdr.offsetHeight + "px");
function onScrollAll() {
  tk2 = false; const y = scrollY, vh = innerHeight;
  if (y > 140 && y > ly2 + 4) hdr.classList.add("away"); else if (y < ly2 - 4 || y <= 140) hdr.classList.remove("away");
  ly2 = y;
  const ab = document.querySelector(".ab-b");   // over the dark About block the nav flips to light text
  if (ab) { const r = ab.getBoundingClientRect(), m = hdr.offsetHeight * .5; hdr.classList.toggle("inv", r.top <= m && r.bottom >= m); }
  pend = pend.filter(el => { if (reduce || el.getBoundingClientRect().top < vh * .9) { el.classList.add("in"); return false; } return true; });
  let cur = null; for (const [k] of SECS) if (sec(k).getBoundingClientRect().top <= vh * .4) cur = k;
  navs.forEach(b => b.setAttribute("aria-current", String(b.dataset.run === cur && cur !== "home")));
}
const reqAll = () => { if (!tk2) { tk2 = true; requestAnimationFrame(onScrollAll); } };
addEventListener("scroll", reqAll, { passive: true }); addEventListener("resize", () => { hh(); reqAll(); });
hdr.addEventListener("focusin", () => hdr.classList.remove("away"));
addEventListener("pointermove", e => { if (e.clientY < 40) hdr.classList.remove("away"); }, { passive: true });

setTime(11, false);
hh(); initHomeDrop(); fitHome(); initServices(); initConnect(); initAbout(); initCurtain(); initAbTitle(); initSel(); initWorks();
document.fonts.ready.then(() => { hh(); fitHome(); if (fromHash()) sec(fromHash()).scrollIntoView({ behavior: "auto", block: "start" }); onScrollAll(); });
onScrollAll();

/* ---------- crosshair cursor: positions are written straight to transforms inside one rAF, so it tracks the mouse with no lag ---------- */
(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const root = document.documentElement, cx = document.createElement("div");
  cx.id = "cx"; cx.setAttribute("aria-hidden", "true");
  cx.innerHTML = '<i class="h"></i><i class="v"></i><div class="c"><span class="p"></span><span class="b"></span><span class="lb"></span></div>';
  document.body.appendChild(cx);
  const H = cx.querySelector(".h"), V = cx.querySelector(".v"), C = cx.querySelector(".c"), L = cx.querySelector(".lb");
  const HOT = 'a, button, [role="button"], [role="slider"], [data-go], [data-run], .col, summary, label', TXT = "input, textarea, select";
  let x = -99, y = -99, raf = 0, pr = 0, cur = null;
  const word = el => el.dataset.cursor || (el.matches('#dial, [role="slider"]') ? "Drag" : el.matches(".col") ? "Expand" : el.matches('a[href^="http"]') ? "Open" : "Go");
  const paint = () => { raf = 0;
    H.style.transform = `translate3d(0,${y}px,0)`; V.style.transform = `translate3d(${x}px,0,0)`; C.style.transform = `translate3d(${x}px,${y}px,0)`; };
  const probe = t => {
    const tx = t && t.closest && t.closest(TXT), hot = !tx && t && t.closest ? t.closest(HOT) : null;
    cx.classList.toggle("tx", !!tx); cx.classList.toggle("inv", !!(t && t.closest && t.closest(".ab-b, .wk-tm")));
    if (hot !== cur) { cur = hot; cx.classList.toggle("hot", !!cur); if (cur) L.textContent = word(cur); }
  };
  addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(paint);
    if (!cx.classList.contains("on")) { root.classList.add("cc"); paint(); cx.classList.add("on"); }
    probe(e.target);
  }, { passive: true });
  addEventListener("scroll", () => { if (!pr) pr = requestAnimationFrame(() => { pr = 0; if (cx.classList.contains("on")) probe(document.elementFromPoint(x, y)); }); }, { passive: true });
  document.addEventListener("pointerdown", () => cx.classList.add("dn"));
  addEventListener("pointerup", () => cx.classList.remove("dn"));
  root.addEventListener("mouseleave", () => cx.classList.remove("on"));
  root.addEventListener("mouseenter", () => { if (root.classList.contains("cc")) cx.classList.add("on"); });
})();

initLoader();
