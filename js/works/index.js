// js/works/index.js
// Project modal + terminal viewer subsystem.
// Loads wk-live.json on demand, opens the project popup, runs the terminal sim.

import { WK, GH } from "../data.js";
import { wkModal } from "../templates.js";

let _openProject = () => {};
export function getOpenProject() { return _openProject; }

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
export function wkTerm(root, p, quit) {
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
// _openProject declared at top of module as a private binding
export function initWorks() {
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
  _openProject = open;
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
