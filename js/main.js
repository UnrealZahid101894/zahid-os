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
  if (label) btn.addEventListener("mouseenter", () => scramble(label));
  btn.addEventListener("focus", () => { if (btn.matches(":focus-visible") && label) scramble(label); });
  btn.addEventListener("click", () => {
    if (btn.dataset.run === "home") go(null);
    else go(btn.dataset.run);
    if (matchMedia("(hover: none)").matches && label) scramble(label);
  });
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
