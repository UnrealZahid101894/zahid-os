// js/projects.js — full index. Curated projects from WK + every public
// repo from the GitHub API. Crosshair cursor, tag filter, no lines.

import { WK } from "./data.js";
import { initCursor } from "./cursor.js";

const GH_USER = "UnrealZahid101894";
const GH_ROOT = `https://github.com/${GH_USER}/`;
const API_URL = `https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`;
const CACHE_KEY = "zahidos_repos_v2";

const listEl     = document.getElementById("pk-list");
const filterEl   = document.getElementById("pk-filter");
const countEl    = document.getElementById("pk-count");

let activeTag = null;
let items = [];

/* ── fetch github repos, cached for the session ── */
async function getRepos() {
  try {
    const c = sessionStorage.getItem(CACHE_KEY);
    if (c) return JSON.parse(c);
  } catch(_) {}
  try {
    const r = await fetch(API_URL);
    if (!r.ok) return [];
    const d = await r.json();
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch(_) {}
    return d;
  } catch(_) { return []; }
}

/* ── helpers ── */
const pretty = s => s.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const LANG = { JavaScript:"JS", TypeScript:"TS", Python:"PY", HTML:"HTML", CSS:"CSS",
               Java:"JAVA", "C++":"C++", "C#":"C#", C:"C", Shell:"SH", Go:"GO",
               Rust:"RS", PHP:"PHP", Ruby:"RB", Vue:"VUE", Svelte:"SVELTE" };
const langBadge = l => LANG[l] || (l ? l.slice(0, 3).toUpperCase() : "—");

/* ── merge curated + github into one list ── */
function merge(curated, repos) {
  const curatedNames = new Set(curated.map(p => p.repo.toLowerCase()));
  const head = curated.map(p => ({
    title: p.t,
    sub:   p.sub || "",
    tags:  p.tag || [],
    href:  GH_ROOT + p.repo,
    img:   p.img || null,
    sh:    p.sh  || null,
    badge: null
  }));
  const tail = repos
    .filter(r => !r.fork && !curatedNames.has(r.name.toLowerCase()))
    .map(r => ({
      title: pretty(r.name),
      sub:   r.description || "",
      tags:  r.language ? [r.language] : [],
      href:  r.html_url,
      img:   null,
      sh:    null,
      badge: langBadge(r.language)
    }));
  return [...head, ...tail];
}

/* ── tag counts ── */
function allTags(arr) {
  const m = new Map();
  arr.forEach(i => i.tags.forEach(t => m.set(t, (m.get(t) || 0) + 1)));
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/* ── filter row ── */
function renderFilter() {
  const tags = allTags(items);
  const rows = [["All", items.length, null], ...tags.map(([t, n]) => [t, n, t])];
  filterEl.innerHTML = rows.map(([label, n, key]) => {
    const on = activeTag === key;
    return `<button type="button" class="pk-f${on ? " on" : ""}" data-tag="${key ?? ""}" aria-pressed="${on}">
      <span>${label}</span><sup>${String(n).padStart(2, "0")}</sup>
    </button>`;
  }).join("");
  filterEl.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => {
      const v = b.dataset.tag || null;
      activeTag = (activeTag === v) ? null : v;
      renderFilter();
      renderList();
    });
  });
}

/* ── one row's thumbnail ── */
function thumb(it) {
  if (it.img) return `<img src="${it.img}" alt="" loading="lazy" decoding="async">`;
  if (it.sh)  return `<svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${it.sh}</svg>`;
  return `<span class="pk-th-badge">${it.badge || "—"}</span>`;
}

/* ── the list ── */
function renderList() {
  const shown = items.filter(i => !activeTag || i.tags.includes(activeTag));
  if (!shown.length) {
    listEl.innerHTML = `<li class="pk-empty">nothing matches that filter</li>`;
    countEl.textContent = "00 / " + String(items.length).padStart(2, "0");
    return;
  }
  listEl.innerHTML = shown.map((it, i) => {
    const n = String(i + 1).padStart(2, "0");
    const tags = it.tags.map(t => `<span>${t}</span>`).join("");
    const sub  = it.sub ? `<span class="pk-s">${it.sub}</span>` : "";
    return `<li class="pk-i" style="animation-delay:${(i * 40).toFixed(0)}ms">
      <a class="pk-row" href="${it.href}" target="_blank" rel="noopener">
        <span class="pk-n">${n}</span>
        <span class="pk-th">${thumb(it)}</span>
        <span class="pk-mid"><span class="pk-t">${it.title}</span>${sub}</span>
        <span class="pk-tags">${tags}</span>
        <span class="pk-go" aria-hidden="true">↗</span>
      </a>
    </li>`;
  }).join("");
  countEl.textContent = String(shown.length).padStart(2, "0") + " / " + String(items.length).padStart(2, "0");
}

/* ── boot ── */
(async () => {
  initCursor();
  requestAnimationFrame(() => document.body.classList.add("ready"));

  const repos = await getRepos();
  items = merge(WK, repos);
  renderFilter();
  renderList();
})();

/* ── back button: prefer history.back() so the works section keeps its scroll ── */
const back = document.querySelector(".pk-back");
if (back) back.addEventListener("click", (e) => {
  if (document.referrer && document.referrer.indexOf(location.hostname) !== -1) {
    e.preventDefault();
    history.back();
  }
});