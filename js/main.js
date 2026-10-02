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
import { initAbTitle, abPhys, initAbout, initCurtain } from "./sections/about.js";

/* ---------- theme: palettes at four times of day, blended between them ---------- */
/* ---------- nav: brackets open and the label scrambles into place on hover ---------- */
/* ---------- content: clicking a nav item swaps the text below the name ---------- */






let cleanup = null;
/* home: the giant heading is fitted to the page width (one line on desktop, two fitted lines on phones) */
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
hh(); initHomeDrop(panel); fitHome(panel); initServices(panel); initConnect(panel); initAbout(); initCurtain(); initAbTitle(); initSel(panel); initWorks();
document.fonts.ready.then(() => { hh(); fitHome(panel); if (fromHash()) sec(fromHash()).scrollIntoView({ behavior: "auto", block: "start" }); onScrollAll(); });
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
