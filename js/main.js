import { lin, gam, toLab, fromLab, mix, lum, ratio, readable, css } from "./utils/color.js";
import { paint, setTime, reduce, getT } from "./theme.js";
import { scramble } from "./scramble.js";
import { initLoader } from "./loader.js";
import { PHOTO, PH_A, PH_B, GH, WK, WK_MAIN, WK_CS, SVC } from "./data.js";
import { svcHTML, HOME, wkModal, PANELS, aboutHTML, selHTML } from "./templates.js";

/* ---------- theme: palettes at four times of day, blended between them ---------- */
/* ---------- nav: brackets open and the label scrambles into place on hover ---------- */
/* ---------- content: clicking a nav item swaps the text below the name ---------- */






let _wkL = null, _wkLPromise = null;
const wkLive = () => _wkL;
const loadWkLive = () => {
  if (_wkL) return Promise.resolve(_wkL);
  if (_wkLPromise) return _wkLPromise;
  _wkLPromise = fetch("data/wk-live.json", { cache: "force-cache" })
    .then(r => r.json())
    .then(d => { _wkL = d; return d; });
  return _wkLPromise;
};
function wkTerm(root, p, quit) {
  const out = root.querySelector(".wk-tm-out"), inp = root.querySelector("input"), url = GH + p.repo + ".git", dir = p.repo;
  const steps = [["# 1. Get the guide onto your machine"], ["cmd", "git clone " + url], ["cmd", "cd " + dir], [""], ["# 2. Read it without leaving the terminal"], ["cmd", "less README.md"], ["# (space = next page, / = search, q = quit)"], [""], ["# 3. Practice somewhere safe, then try what you read"], ["cmd", "mkdir sandbox && cd sandbox"], ["cmd", "pwd && ls -la"], [""], ["# Click any command to copy it. Type help below."]];
  const add = (t, c) => { const d = document.createElement("div"); d.className = "ln" + (c ? " " + c : ""); if (c === "cmd") { d.tabIndex = 0; d.dataset.c = t; d.textContent = "$ " + t; } else d.textContent = t; out.append(d); out.scrollTop = out.scrollHeight; return d; };
  const play = () => { let k = 0; const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; const tick = () => { if (!out.isConnected || k >= steps.length) return; const st = steps[k++]; st[0] === "cmd" ? add(st[1], "cmd") : add(st[0], st[0][0] === "#" ? "cm" : ""); reduce ? tick() : setTimeout(tick, 240); }; tick(); };
  const run = v => {
    add("zahid@os:~$ " + v, "pr"); const [c] = v.trim().split(/\s+/);
    const map = { help: () => ["help   show this list", "steps  replay the walkthrough", "about  what this project is", "ls     list files", "pwd    print working directory", "whoami who is this", "clear  wipe the screen", "exit   close the terminal"].forEach(l => add(l)), steps: () => { out.textContent = ""; play(); }, about: () => add(p.d), ls: () => add("README.md"), pwd: () => add("/home/zahid/" + dir), whoami: () => add("zahid"), clear: () => { out.textContent = ""; }, exit: () => quit() };
    if (c) (map[c] || (() => add("command not found: " + c + "  (type help)", "er")))();
  };
  out.addEventListener("click", e => { const d = e.target.closest(".cmd"); if (d && navigator.clipboard) navigator.clipboard.writeText(d.dataset.c).then(() => { d.classList.add("ok"); setTimeout(() => d.classList.remove("ok"), 900); }, () => {}); });
  inp.addEventListener("keydown", e => { if (e.key === "Enter") { run(inp.value); inp.value = ""; } });
  root.addEventListener("click", () => { if (!getSelection().toString()) inp.focus({ preventScroll: true }); });
  play(); setTimeout(() => inp.focus({ preventScroll: true }), 50);
}
/* project popup: opened from the sideways cards (Esc, backdrop or the return button to leave) */
let openProject = () => {};
function initWorks() {
  const md = document.createElement("div");
  md.className = "wk-md"; md.setAttribute("role", "dialog"); md.setAttribute("aria-modal", "true"); md.setAttribute("aria-labelledby", "wk-t"); md.setAttribute("aria-hidden", "true");
  document.body.append(md);
  let opener = null;
  const isOpen = () => md.classList.contains("open");
  const open = async (i, from) => {
    const p = WK[i]; opener = from || null; md.className = "wk-md " + (p.term ? "term" : "live");
    if (!p.term) await loadWkLive();
    md.innerHTML = wkModal(p); md.scrollTop = 0;
    const fr = md.querySelector(".wk-frame");
    if (fr) { const pg = wkLive()[p.repo].pages; fr.srcdoc = pg[0].html; md.querySelectorAll("[data-pg]").forEach(b => b.addEventListener("click", () => { md.querySelectorAll("[data-pg]").forEach(z => z.classList.toggle("on", z === b)); fr.srcdoc = pg[+b.dataset.pg].html; })); }
    md.classList.add("open"); md.setAttribute("aria-hidden", "false"); document.documentElement.style.overflow = "hidden"; document.documentElement.classList.add("wk-open");
    if (p.term) wkTerm(md.querySelector(".wk-tm"), p, close); else md.querySelector(".wk-ic.x").focus({ preventScroll: true });
  };
  const close = () => {
    md.classList.remove("open"); document.documentElement.classList.remove("wk-open"); const f = md.querySelector(".wk-frame"); if (f) setTimeout(() => { if (!isOpen()) f.srcdoc = ""; }, 450); md.setAttribute("aria-hidden", "true"); document.documentElement.style.overflow = "";
    if (opener) opener.focus({ preventScroll: true });
  };
  openProject = open;
  md.addEventListener("click", e => { if (e.target === md || e.target.closest("[data-x]")) close(); });
  const key = e => {
    if (!isOpen()) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    const f = [...md.querySelectorAll("a, button, input")], a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  };
  document.addEventListener("keydown", key);
  return () => { document.removeEventListener("keydown", key); md.remove(); document.documentElement.style.overflow = ""; document.documentElement.classList.remove("wk-open"); };
}
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
function initAbTitle() {
  panel.querySelectorAll(".ab-t").forEach(t => {
  const L = [...t.querySelectorAll(".ac")], ease = v => 1 - Math.pow(1 - v, 4), jit = L.map((_, i) => ((i * 37) % 11) / 11); let d = [], sd = [], tk = false, tp = 0, cp = 0, raf = 0;
  const meas = () => { L.forEach(e => e.style.transform = ""); const c = t.clientWidth / 2, xs = L.map(e => Math.abs(e.offsetLeft + e.offsetWidth / 2 - c)), m = Math.max(...xs) || 1; d = xs.map(x => x / m); sd = L.map(e => e.offsetLeft + e.offsetWidth / 2 < c ? -1 : 1); draw(); };
  const draw = () => L.forEach((e, i) => { if (e.classList.contains("sp")) return;
    const lp = ease(Math.max(0, Math.min(1, (cp - d[i] * .5 - jit[i] * .07) / .43)));
    e.style.transform = lp >= 1 ? "" : `translate3d(0,${(-(1 - lp) * 135).toFixed(2)}%,0)`; });
  const step = () => { raf = 0; cp += (tp - cp) * (reduce ? 1 : .09); if (Math.abs(tp - cp) < .0008) cp = tp; draw(); if (cp !== tp) raf = requestAnimationFrame(step); };
  const upd = () => { tk = false; const r = t.getBoundingClientRect(), vh = innerHeight; tp = reduce ? 1 : Math.max(0, Math.min(1, (vh * .94 - (r.top + scrollY - sY())) / (vh * .6))); if (!raf) raf = requestAnimationFrame(step); };
  const req = () => { if (!tk) { tk = true; requestAnimationFrame(upd); } };
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", () => { meas(); req(); });
  document.fonts.ready.then(() => { meas(); req(); }); meas(); upd();
  });
}
let abF = 0;
function abPhys(cs, W, H, dt) {
  const n = 3, h = dt / n, drag = Math.pow(.992, dt), fr = Math.pow(.9, dt), N = cs.length, live = c => c.on === 1 && c.dl <= 0, cl = (v, m) => v > m ? m : v < -m ? -m : v;
  const ext = c => { const k = Math.abs(Math.cos(c.r)), m = Math.abs(Math.sin(c.r)); c.ew = c.hw * k + c.hh * m; c.eh = c.hw * m + c.hh * k; };   // box size follows its tilt
  const bounds = c => {
    const fl = H - 4 - c.eh - c.by, ce = c.eh - c.by, lx = 4 + c.ew - c.bx, rx = W - 4 - c.ew - c.bx;
    if (c.y > fl) { c.y = fl; c.t = 1; c.vy = c.vy > 7 ? -c.vy * .1 : 0; c.vr *= .7; c.vx *= .92; }
    if (c.y < ce) { c.y = ce; c.vy = Math.abs(c.vy) * .2; }
    if (c.x < lx) { c.x = lx; c.vx = Math.abs(c.vx) * .3; } else if (c.x > rx) { c.x = rx; c.vx = -Math.abs(c.vx) * .3; }
  };
  const wake = (o, m, k) => { o.on = 1; o.q = 0; o.dl = 0; o.vx = m.vx * k; o.vy = m.vy * k * .5; o.vr = (Math.random() - .5) * .04; };   // knocked loose by something moving
  for (const c of cs) { c.t = 0; if (c.on !== 1) continue; if (c.dl > 0) c.dl -= dt * 16.667; else { c.vx = cl(c.vx * drag, 60); c.vy = Math.max(-14, cl(c.vy, 60)); c.vr = cl(c.vr * drag, .07); } }
  for (let s = 0; s < n; s++) {
    for (const c of cs) { ext(c); if (live(c)) { c.vy = Math.max(-14, c.vy + h * .8); c.x += c.vx * h; c.y += c.vy * h; c.r += c.vr * h; } }
    for (let it = 0; it < 2; it++) {
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const a = cs[i], b = cs[j], ma = live(a), mb = live(b); if (!ma && !mb) continue;
        const dx = a.bx + a.x - b.bx - b.x, px = a.ew + b.ew - Math.abs(dx); if (px <= 0) continue;
        const dy = a.by + a.y - b.by - b.y, py = a.eh + b.eh - Math.abs(dy); if (py <= 0) continue;
        const wa = ma ? (mb ? .5 : 1) : 0, wb = mb ? (ma ? .5 : 1) : 0;
        if (py <= px) {                                               // one sits on the other
          const sy = dy > 0 ? 1 : -1; a.y += sy * py * wa; b.y -= sy * py * wb;
          const top = sy > 0 ? b : a, bot = sy > 0 ? a : b;
          if (live(top) && top.vy > (live(bot) ? bot.vy : 0)) {
            if (!live(bot) && bot.on !== 1 && top.vy > 5) { wake(bot, top, .3); bot.vy = top.vy * .3; }   // a hard landing knocks the one underneath loose
            const bv = live(bot) ? bot.vy : 0, rel = top.vy - bv;
            top.vy = bv + (rel > 7 ? -rel * .07 : 0); top.t = 1;
            if (px < top.ew) top.vx += (top.bx + top.x > bot.bx + bot.x ? 1 : -1) * .35 * dt; else top.vx *= .9;   // less than half supported: slides off
          }
        } else {                                                      // side by side
          const sx = dx > 0 ? 1 : -1, rel = (a.vx - b.vx) * sx; a.x += sx * px * wa; b.x -= sx * px * wb;
          if (rel < 0) {
            if (ma && mb) { const j2 = -1.35 * rel / 2; a.vx += j2 * sx; b.vx -= j2 * sx; }                  // two moving boxes swap momentum
            else { const m = ma ? a : b, o = ma ? b : a;
              if (-rel > 3 && o.on !== 1) { wake(o, m, .55); m.vx *= .35; } else m.vx *= -.25; }             // hit something at rest: knock it or bounce
          }
        }
      }
      for (const c of cs) if (live(c)) bounds(c);
    }
  }
  for (const c of cs) { if (!live(c)) continue;
    const tg = Math.round((c.r - c.tilt) / 6.2832) * 6.2832 + c.tilt, moved = Math.abs(c.x - c.lx) + Math.abs(c.y - c.ly); c.lx = c.x; c.ly = c.y;
    if (c.t) { c.vr *= Math.pow(.88, dt); c.r += (tg - c.r) * Math.min(1, .07 * dt); c.vx *= fr; }    // a touching letter loses its spin and slowly rights itself
    if (c.t && moved < .16 && Math.abs(c.vr) < .004 && Math.abs(tg - c.r) < .01) { if (++c.q > 18) { c.on = 2; c.vx = c.vy = c.vr = 0; } } else c.q = 0; }
  if (++abF % 4 === 0) for (const c of cs) { if (c.on !== 2) continue;                              // a sleeper with nothing under it wakes up
    const cy = c.by + c.y; let ok = c.y >= H - 4 - c.eh - c.by - 2;
    for (let k = 0; k < N && !ok; k++) { const o = cs[k]; if (o === c) continue; const oy = o.by + o.y;
      if (oy > cy && Math.abs(c.bx + c.x - o.bx - o.x) < c.ew + o.ew - 3 && Math.abs(oy - o.eh - cy - c.eh) < 3) ok = true; }
    if (!ok) { c.on = 1; c.q = 0; } }
}
/* about: the cursor is a stick. Letters it hits get knocked off, tumble, fall and pile up on the floor. */
function initAbout() {
  const blk = panel.querySelector(".ab-b"), scn = panel.querySelector(".ab-scene"), els = [...blk.querySelectorAll(".ab-c")];
  let cs = [], W, H, R, raf, back = false, locked = false, dropped = false, ly = 0, ptr = null, prev = null, svx = 0, svy = 0, burst = null, t0 = performance.now();
  const measure = () => { els.forEach(e => e.style.transform = ""); const b = blk.getBoundingClientRect(); W = b.width; H = b.height; R = Math.max(45, Math.min(95, W * .05));
    cs = els.map(e => { const r = e.getBoundingClientRect(); return { e, bx: r.left - b.left + r.width / 2, by: r.top - b.top + r.height / 2, h: r.height, hw: r.width * .46, hh: r.height * .41, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, on: 0, dl: 0, t: 0, q: 0, lx: 0, ly: 0, tilt: (Math.random() - .5) * .08 }; }); };
  const sd = (x, y, a, b, c, d) => { const dx = c - a, dy = d - b, l = dx * dx + dy * dy; let t = l ? ((x - a) * dx + (y - b) * dy) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - (a + t * dx), y - (b + t * dy)); };
  const cl = v => Math.max(-60, Math.min(60, v));
  const hit = (px, py, qx, qy, vx, vy, rad, boost) => {
    if (locked) return; const s = Math.hypot(vx, vy), ux = s ? vx / s : 0, uy = s ? vy / s : 0;
    for (const c of cs) {
      const d = sd(c.bx + c.x, c.by + c.y, px, py, qx, qy); if (d > rad) continue;
      const f = 1 - .6 * d / rad, k = Math.min(s, 120) * f, rx = c.bx + c.x - qx, ry = c.by + c.y - qy;
      back = false; c.on = 1; c.dl = 0; c.q = 0;
      // a bat, not a spring: the letter is pushed the way the cursor is moving, up to the cursor's own speed, and nothing else.
      // No upward kick, no push away from the cursor: gravity does the rest, so it falls sideways / down like an object would.
      if (boost) { c.vx = cl(c.vx + rx * .09 * f); c.vy = cl(c.vy + ry * .05 * f); }     // click = a soft shove outward
      else { const want = k * .75, along = c.vx * ux + c.vy * uy;
        if (along < want) { c.vx = cl(c.vx + ux * (want - along) * .7); c.vy = cl(c.vy + uy * (want - along) * .7); } }
      c.vr += (((rx * uy - ry * ux) / Math.max(20, Math.hypot(rx, ry)) * k * .0035) + (Math.random() - .5) * .03) * f;   // spin = how far off-centre it was struck
    }
  };
  // the cursor is a solid disc. It is swept along its path in small steps and every letter (a rotated box) is pushed out of it, so nothing can slip through,
  // however slow or fast the mouse moves. The letter also takes the cursor's speed and a spin from where it was struck.
  const sweep = (px, py, qx, qy, vx, vy) => {
    if (locked) return; const rc = Math.max(20, Math.min(32, W * .022)), n = Math.max(1, Math.ceil(Math.hypot(qx - px, qy - py) / (rc * .5)));
    for (let k = 1; k <= n; k++) { const x = px + (qx - px) * k / n, y = py + (qy - py) * k / n;
      for (const c of cs) {
        const dx = x - (c.bx + c.x), dy = y - (c.by + c.y); if (dx * dx + dy * dy > (c.hw + c.hh + rc) ** 2) continue;
        const co = Math.cos(c.r), si = Math.sin(c.r), lx = dx * co + dy * si, ly = -dx * si + dy * co, hw = c.hw * 1.1, hh = c.hh * 1.1,
              ox = lx - Math.max(-hw, Math.min(hw, lx)), oy = ly - Math.max(-hh, Math.min(hh, ly)), d = Math.hypot(ox, oy);
        let nx, ny, pen;
        if (d > .001) { if (d >= rc) continue; nx = ox / d; ny = oy / d; pen = rc - d; }
        else { const ex = hw - Math.abs(lx), ey = hh - Math.abs(ly); if (ex < ey) { nx = lx < 0 ? -1 : 1; ny = 0; pen = ex + rc; } else { nx = 0; ny = ly < 0 ? -1 : 1; pen = ey + rc; } }
        const wx = nx * co - ny * si, wy = nx * si + ny * co, push = Math.min(pen, rc * 1.5);   // w = from letter towards cursor
        back = false; c.on = 1; c.dl = 0; c.q = 0; c.x -= wx * push; c.y -= wy * push * (wy > 0 ? .5 : 1);
        const into = -(vx * wx + vy * wy), along = -(c.vx * wx + c.vy * wy);                     // how fast the cursor drives into it / how fast it already moves away
        if (along < into) { const a = (into - along) * .9; c.vx = cl(c.vx - wx * a); c.vy = cl(c.vy - wy * a * (wy > 0 ? .25 : 1)); }
        c.vr = Math.max(-.07, Math.min(.07, c.vr + (((-dx * vy + dy * vx) / Math.max(20, Math.hypot(dx, dy))) * .0035 + (Math.random() - .5) * .01)));
      } }
  };
  const pos = e => { const b = blk.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  blk.addEventListener("pointermove", e => { ptr = pos(e); });
  blk.addEventListener("pointerdown", e => { ptr = burst = pos(e); });
  blk.addEventListener("pointerleave", () => { ptr = prev = null; svx = svy = 0; });
  let vis = true; if (window.IntersectionObserver) new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(blk);
  const tick = now => {
    raf = requestAnimationFrame(tick);
    if (!vis || (!ptr && !burst && !back && cs.every(c => c.on !== 1))) { t0 = now; return; }   // nothing to simulate: no work this frame
    const dt = Math.min(2.5, Math.max(.4, (now - t0) / 16.667)); t0 = now;
    if (burst) { hit(burst[0], burst[1], burst[0], burst[1], 0, 0, R * 1.6, true); burst = null; }
    if (ptr) {
      if (prev) { svx += ((ptr[0] - prev[0]) / dt - svx) * .7; svy += ((ptr[1] - prev[1]) / dt - svy) * .7;
      }
      sweep((prev || ptr)[0], (prev || ptr)[1], ptr[0], ptr[1], svx, svy);
      prev = [ptr[0], ptr[1]];
    }
    let busy = false;
    if (back) {
      const ez = Math.pow(.86, dt);
      for (const c of cs) { if (!c.on) continue; c.dl = 0; c.x *= ez; c.y *= ez; c.r *= ez; c.vx = c.vy = c.vr = 0; busy = true;
        if (Math.abs(c.x) + Math.abs(c.y) + Math.abs(c.r) < .3) { c.x = c.y = c.r = 0; c.on = 0; c.e.style.transform = ""; continue; }
        c.e.style.transform = `translate3d(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px,0) rotate(${c.r.toFixed(3)}rad)`; }
    } else {
      abPhys(cs, W, H, dt);
      for (const c of cs) if (c.on) c.e.style.transform = `translate3d(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px,0) rotate(${c.r.toFixed(3)}rad)`;
    }
    if (back && !busy) back = false;
  };
  // one "scroll" = 40% of the screen. After the lock the text stays put for one scroll so it can be read, then gravity comes back:
  // every letter is let go with a tiny random delay, a little spread and some tumble
  const READ = .4;
  const release = () => { blk.classList.add("pop"); cs.forEach(c => { if (c.on) return; c.on = 1; c.dl = Math.random() * 240; c.vx = (c.bx - W / 2) / W * 5 + (Math.random() - .5) * 2.4; c.vy = 0; c.vr = (Math.random() - .5) * .016; }); };
  const onScroll = () => { const y = scrollY, go = scn.getBoundingClientRect().top <= -READ * innerHeight;
    if (y < ly - 2 && !go) { locked = true; back = true; dropped = false; blk.classList.remove("pop"); } else if (y > ly + 2) locked = false;   // back above the trigger point: letters go home
    ly = y;
    if (!dropped && !locked && go) { dropped = true; back = false; release(); } };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", measure); measure(); tick(performance.now());
  if (document.fonts) document.fonts.ready.then(measure);
  return () => { cancelAnimationFrame(raf); removeEventListener("resize", measure); removeEventListener("scroll", onScroll); };
}
panel.addEventListener("click", e => { const a = e.target.closest("[data-go]"); if (a) { e.preventDefault(); go(a.dataset.go); } });

/* about, part 2: the curtain. s = how far the scene has scrolled. Curtain falls over the block from 130vh to 200vh, then every line of text on it
   rises out of its own mask in turn (200vh to 345vh). Lines are measured from the real layout, so they re-split on resize and when fonts load. */
function initCurtain() {
  const scn = panel.querySelector(".ab-scene"), cur = scn.querySelector(".ab-cur"), pgs = cur.querySelector(".ab-pgs"),
        els1 = [...cur.querySelectorAll(".ab-pg1 [data-rl]")], els2 = [...cur.querySelectorAll(".ab-pg2 [data-rl]")],
        ims = [...cur.querySelectorAll(".ab-pg2 .ab-im")], lks = [...cur.querySelectorAll(".ab-pg2 .ab-lk")];
  let g1 = [], g2 = [], tk = false;
  /* curtain: its own eased progress (frame-rate independent), so the drop glides even when the wheel steps */
  let cc = 0, ct = 0, craf2 = 0, lt = 0;
  const eio = c => .5 - .5 * Math.cos(Math.PI * c);   // gentle sine in/out: no dead zone at the start, no sudden rush in the middle
  const under = [...cur.parentNode.children].filter(e => e !== cur && e.matches(".ab-r, .ab-h"));   // the headline + its fallen letters sit under the curtain
  const paintCur = () => { const e = eio(cc);
    under.forEach(u => u.style.visibility = cc >= .999 ? "hidden" : "");   // once the curtain has landed they are removed from view, so nothing can peek past its edges
    cur.style.transform = cc >= 1 ? "none" : `translate3d(0,calc(${(-(1 - e) * 100).toFixed(3)}% - ${((1 - e) * 90).toFixed(1)}px),0)`;
    cur.style.setProperty("--rad", ((1 - e) * Math.min(64, innerWidth * .05)).toFixed(1) + "px"); };
  const cloop = now => { const dt = Math.min(.05, (now - lt) / 1000 || .016); lt = now;
    cc += (ct - cc) * (1 - Math.exp(-dt * 7.5)); if (Math.abs(ct - cc) < .0005) { cc = ct; craf2 = 0; } else craf2 = requestAnimationFrame(cloop); paintCur(); };
  const cl = v => Math.max(0, Math.min(1, v)), sm = v => v * v * (3 - 2 * v);
  const splitEl = (el, out) => {
    const txt = el.dataset.t || (el.dataset.t = el.textContent.trim().replace(/\s+/g, " "));
    el.textContent = "";
    txt.split(" ").forEach((w, i, a) => { const sp = document.createElement("span"); sp.className = "rw"; sp.textContent = w; el.append(sp); if (i < a.length - 1) el.append(" "); });
    const rows = []; let last = null;
    [...el.children].forEach(w => { const t = w.offsetTop; if (last === null || Math.abs(t - last) > 3) { rows.push([]); last = t; } rows[rows.length - 1].push(w.textContent); });
    el.textContent = "";
    rows.forEach(r => { const a = document.createElement("span"), b = document.createElement("span"); a.className = "rl"; b.className = "rli"; b.textContent = r.join(" "); a.append(b); el.append(a); out.push(b); });
  };
  const split = () => { g1 = []; g2 = []; els1.forEach(el => splitEl(el, g1)); els2.forEach(el => splitEl(el, g2)); g2 = [...ims, ...g2, ...lks]; upd(); };
  const setQ = (arr, r) => { const N = arr.length, w = 2.2, t = r * (N - 1 + w); arr.forEach((l, i) => l.style.setProperty("--q", reduce ? 1 : sm(cl((t - i) / w)).toFixed(3))); };
  const upd = () => {
    tk = false; const vh = innerHeight, s = sY() - (scn.getBoundingClientRect().top + scrollY);
    const c = reduce ? (s > .8 * vh ? 1 : 0) : cl((s - .8 * vh) / (.8 * vh)); ct = c;
    if (reduce) { cc = c; paintCur(); } else if (!craf2) { lt = performance.now(); craf2 = requestAnimationFrame(cloop); }
    const pn = reduce ? (s > 3.5 * vh ? 1 : 0) : sm(cl((s - 3.1 * vh) / (.85 * vh)));
    pgs.style.transform = pn ? `translate3d(0,${(-pn * 50).toFixed(3)}%,0)` : "none";
    setQ(g1, reduce ? 1 : cl((s - 1.65 * vh) / (1.05 * vh))); setQ(g2, reduce ? 1 : cl((s - 3.75 * vh) / vh));
  };
  const req = () => { if (!tk) { tk = true; requestAnimationFrame(upd); } };
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", split);
  split(); if (document.fonts) document.fonts.ready.then(split);
  return () => { removeEventListener("scroll", req); removeEventListener("resize", split); };
}

/* recent work, sideways: the scene is as tall as the horizontal distance, so vertical scroll slides the track left. Each card reveals by its screen position; clicking one opens the same project popup as the list below. */
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
  const open = c => openProject(+c.dataset.i, c);
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
let sY = () => scrollY;   // smoothed (fractional) scroll position; every scroll-scrubbed effect reads this
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
