// js/main.js
// Entry point. Wires all modules together.
//
// Responsibilities:
//   - Renders the section panels
//   - Sets up navigation (buttons, hash, home logo)
//   - Runs the scroll orchestration (reveal, header hide/show, nav highlight)
//   - Kicks off every init function once at boot

import { lin, gam, toLab, fromLab, mix, lum, ratio, readable, css } from "./utils/color.js";
import { panel } from "./dom.js";
import { sY, setScrollY } from "./utils/scroll.js";
import { paint, setTime, reduce, getT } from "./theme.js";
import { scramble } from "./scramble.js";
import { initLoader } from "./loader.js";
import { PHOTO, PH_A, PH_B, GH, WK, WK_MAIN, WK_CS, SVC } from "./data.js";
import { svcHTML, HOME, wkModal, PANELS, aboutHTML, selHTML } from "./templates.js";
import { initWorks, getOpenProject } from "./works/index.js";
import { fitHome, initHomeDrop } from "./sections/home.js";
import { initServices } from "./sections/services.js";
import { initConnect } from "./sections/connect.js";
import { initSel } from "./sections/works.js";
import { initCursor } from "./cursor.js";
import { initMobileNav } from "./mobile-nav.js";
import { initAbTitle, abPhys, initAbout, initCurtain } from "./sections/about.js";

/* home: the giant heading is fitted to the page width (one line on desktop, two fitted lines on phones) */
const SECS = [["home", HOME], ["about", PANELS.about], ["works", selHTML()], ["services", PANELS.services], ["connect", PANELS.connect]];
panel.setAttribute("aria-live", "off");
panel.innerHTML = SECS.map(([k, h]) => `<div class="pg" id="s-${k}">${h}</div>`).join("");
document.body.classList.add("one");
const hdr = document.querySelector("header"), navs = [...document.querySelectorAll(".nav")], sec = k => document.getElementById("s-" + (k || "home"));
let SM = null;   // legacy smooth-scroll engine (unused)

/* ── smooth scroll position ──
   Every scroll-driven animation reads its position through sY() (see
   js/utils/scroll.js). On desktop raw scrollY is fine. On mobile a flick
   delivers 100–300 px jumps per frame, which jitters the letter physics,
   the About curtain, the sideways works track and the letter-drop reveals.
   We lerp the value so animations glide instead of snapping. `window.scrollY`
   is still the raw number for the header hide/show and the reveal
   observers, which need to react instantly. */
let smoothY = window.scrollY;
let targetY = window.scrollY;
let scrollRaf = 0;
const LERP      = 0.38;    // 0 = never moves, 1 = instant
const LERP_FAST = 0.62;    // aggressive when the gap is large (fast flick)
const SNAP_PX   = 0.5;    // below this, snap and stop

function scrollStep() {
  scrollRaf = 0;
  const gap = targetY - smoothY;
  const k = Math.abs(gap) > 180 ? LERP_FAST : LERP;
  smoothY += gap * k;
  if (Math.abs(targetY - smoothY) < SNAP_PX) smoothY = targetY;
  else scrollRaf = requestAnimationFrame(scrollStep);
}
addEventListener("scroll", () => {
  const h = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  targetY = Math.max(0, Math.min(window.scrollY, h));   // clamp over/under-scroll
  if (!scrollRaf) scrollRaf = requestAnimationFrame(scrollStep);
}, { passive: true });
addEventListener("resize", () => {
  targetY = window.scrollY;
  if (Math.abs(targetY - smoothY) > 500) smoothY = targetY;
}, { passive: true });
setScrollY(() => smoothY);
function go(key) {
  try { history.replaceState(null, "", key ? "#" + key : location.pathname + location.search); } catch (e) {}
  const el = sec(key);
  if (SM) SM(el.getBoundingClientRect().top + scrollY); else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
const fromHash = () => { const h = location.hash.slice(1); return SECS.some(([k]) => k === h) ? h : null; };
addEventListener("hashchange", () => go(fromHash()));
navs.forEach(btn => {
  const label = btn.querySelector(".t");
  if (label) btn.addEventListener("mouseenter", () => scramble(label));
  btn.addEventListener("focus", () => { if (btn.matches(":focus-visible") && label) scramble(label); });
  btn.addEventListener("click", () => {
    if (btn.dataset.run === "home") go(null);
    else go(btn.dataset.run);
    if (matchMedia("(hover: none)").matches && label) scramble(label);
  });
});
/* footer social buttons: same scramble on hover/focus as the nav */
panel.querySelectorAll(".bk .t").forEach(el => {
  const a = el.closest(".bk");
  if (!a) return;
  a.addEventListener("mouseenter", () => scramble(el));
  a.addEventListener("focus", () => { if (a.matches(":focus-visible")) scramble(el); });
});
document.getElementById("home").addEventListener("click", () => go(null));

/* reveal targets: .rc wipes text up out of a mask, .rv fades + rises. Checked on scroll (no observer, so clip-paths can't hide them from it). */
const RC = [".sv-top h2", ".wk-lab", ".wk-list li"],
      RV = [".hm-card", ".hm-based", ".hm-intro", ".sv-top span", ".wk-th", ".wk-caps", ".wk-more"];
RC.forEach(q => panel.querySelectorAll(q).forEach((el, i) => { el.classList.add("rc"); if (q === ".wk-list li") el.style.setProperty("--rd", i * .08 + "s"); }));
RV.forEach((q, n) => panel.querySelectorAll(q).forEach(el => { el.classList.add("rv"); el.style.setProperty("--rd", (n % 3) * .12 + "s"); }));
/* stagger groups: siblings cascade in rather than appearing at once */
const STAGGER = [
  [".cx .hero .mask", 0.10],   // connect hero lines
  [".cx .cform > *",   0.06],  // form fields
  [".cx .info > div",  0.09],  // info blocks
];
STAGGER.forEach(([sel, step]) => {
  panel.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add("rv");
    el.style.setProperty("--rd", (i * step).toFixed(3) + "s");
  });
});

/* parallax: subtle vertical drift as elements cross the viewport.
   Only desktop, only when motion is not reduced. */
const PX = [
  { sel: ".hm-h",     amt: 0.10 },   // hero heading rises slower than the page
  { sel: ".hm-photo", amt: 0.06 },   // portrait drifts gently
];
const pxEls = [];
PX.forEach(({ sel, amt }) => panel.querySelectorAll(sel).forEach(el => {
  el.setAttribute("data-px", "");
  pxEls.push({ el, amt });
}));
let pxPending = false;
function pxUpdate() {
  pxPending = false;
  if (reduce || innerWidth < 721 || !pxEls.length) return;
  const vh = innerHeight;
  for (const { el, amt } of pxEls) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -120 || r.top > vh + 120) continue;
    const p = (vh - r.top) / (vh + r.height);     // 0 above, 1 below
    const y = (p - 0.5) * 100 * amt;
    el.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
  }
}
addEventListener("scroll", () => { if (!pxPending) { pxPending = true; requestAnimationFrame(pxUpdate); } }, { passive: true });
addEventListener("resize", () => { if (!pxPending) { pxPending = true; requestAnimationFrame(pxUpdate); } }, { passive: true });
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
  const atTop = y < 40;
  navs.forEach(b => {
    const isHome = b.dataset.run === "home";
    const active = atTop ? isHome : (b.dataset.run === cur);
    b.setAttribute("aria-current", String(active));
  });
}
const reqAll = () => { if (!tk2) { tk2 = true; requestAnimationFrame(onScrollAll); } };
addEventListener("scroll", reqAll, { passive: true }); addEventListener("resize", () => { hh(); reqAll(); });
hdr.addEventListener("focusin", () => hdr.classList.remove("away"));
addEventListener("pointermove", e => { if (e.clientY < 40) hdr.classList.remove("away"); }, { passive: true });

setTime(11, false);
hh();
initHomeDrop(panel);
fitHome(panel);
initServices(panel);
initConnect(panel);
initAbout();
initCurtain();
initAbTitle();
initSel(panel);
initWorks();
initCursor();
initMobileNav();
initLoader();
initCursor();
initLoader();
document.fonts.ready.then(() => { hh(); fitHome(panel); if (fromHash()) sec(fromHash()).scrollIntoView({ behavior: "auto", block: "start" }); onScrollAll(); });
onScrollAll();
