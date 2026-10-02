// js/templates.js
// HTML template strings for each section.
// Pure markup ? reads only from data.js.

import { PHOTO, PH_A, PH_B, GH, WK, WK_MAIN, WK_CS, SVC } from "./data.js";

export const svcHTML = () => `<section class="sv">
  <div class="sv-top"><h2>Stack</h2><span>DEV/5</span></div>
  <div class="acc">${SVC.map(([t, l, d, sh], i) => `
    <div class="col" role="button" aria-label="${t.replace("|", " ")}" style="--i:${i}">
      <b class="n">00-${i + 1}</b>
      <h3 class="t"><i>//</i>${t.replace("|", "<br>")}</h3>
      <div class="ex"><div class="ex-b"><ul>${l.map((x, k) => `<li><span style="--k:${k}">/ ${x}</span></li>`).join("")}</ul>
        <div class="shot"><svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${sh}</svg></div></div>
        <p>${d}</p></div>
    </div>`).join("")}
  </div></section>`;

export const HOME = `<section class="hm">
  <h1 class="hm-h"><span>Software</span> <span>Engineer</span></h1>
  <div class="hm-stage">
    <div class="hm-card">
      <img class="hm-photo" src="${PHOTO}" alt="Portrait of Zahid">
      <ul class="hm-list"><li>/ Web development</li><li>/ App design (UX/UI)</li><li>/ Security</li></ul>
    </div>
    <div class="hm-based"><span>Based</span><span>in</span><span>Bangladesh</span></div>
    <p class="hm-intro">I'm a software engineer and CSE student, who builds fast, clean web experiences and is learning security</p>
  </div>
</section>`;

export const wkModal = (p, wkLiveData) => {
  const src = `<a class="wk-ic gh" href="${GH}${p.repo}" target="_blank" rel="noopener" aria-label="Source on GitHub" title="Source"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .321.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>`, x = `<button class="wk-ic x" type="button" data-x aria-label="Close" title="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4"/><path d="m10 6-6 6 6 6"/></svg></button>`, c = WK_CS[p.repo];
  const aside = `<aside class="wk-cs" aria-label="About"><div class="sb">${p.sub}</div><p>${c.brief}</p><div class="wk-chips">${c.stack.map(t => `<span>${t}</span>`).join("")}</div></aside>`;
  if (p.term) return `<div class="wk-md-in"><div class="wk-lv-bar"><h2 id="wk-t">${p.t}</h2><span class="wk-url">~/terminal</span>${src}${x}</div><div class="wk-split"><div class="wk-main"><div class="wk-tm" role="application" aria-label="Terminal"><div class="wk-tm-out" aria-live="polite"></div><label class="wk-tm-in"><span>zahid@os:~$</span><input type="text" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Type a command, try help"></label></div></div>${aside}</div></div>`;
  const L = wkLiveData[p.repo];
  return `<div class="wk-md-in"><div class="wk-lv-bar"><h2 id="wk-t">${p.t}</h2><span class="wk-url">${L.url}</span>${src}${x}</div><div class="wk-split"><div class="wk-main">${L.pages.length > 1 ? `<div class="wk-lv-tabs">${L.pages.map((g, k) => `<button type="button" data-pg="${k}"${k ? "" : ' class="on"'}>${g.name}</button>`).join("")}</div>` : ""}<iframe class="wk-frame" title="${p.t} live view" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"></iframe></div>${aside}</div></div>`;
};

export const PANELS = {
  about: aboutHTML(),
  services: svcHTML(),
  connect: `<section class="cx">
    <div class="hero">
      <div class="mask"><div class="mi eyebrow">Let’s start the conversation</div></div>
      <div class="mask"><div class="mi big">Great design</div></div>
      <div class="mask"><div class="mi spaced">Starts with</div></div>
      <div class="mask"><div class="mi big">Great collaboration</div></div>
    </div>
    <form class="cform" autocomplete="on">
      <input name="name" placeholder="YOUR NAME*" required autocomplete="name" aria-label="Your name">
      <input name="phone" type="tel" placeholder="PHONE*" required autocomplete="tel" aria-label="Phone">
      <input name="email" type="email" placeholder="YOUR EMAIL*" required autocomplete="email" aria-label="Your email">
      <textarea name="msg" placeholder="HOW CAN I HELP YOU" aria-label="How can I help you"></textarea>
      <button class="cbtn ul" type="submit">Discuss the project<span class="ar">↗</span></button>
    </form>
    <div class="info">
      <div>
        <a class="big2" href="tel:+8800000000000">+880 1X XXX XXXXX</a>
        <a class="big2" href="mailto:your-email@example.com">your-email@example.com</a>
      </div>
      <div class="soc">
        <a class="ul" href="https://www.instagram.com/__lost.from_light.__/" target="_blank" rel="noopener">Instagram<span class="ar">↗</span></a>
        <a class="ul" href="https://t.me/" target="_blank" rel="noopener">Telegram<span class="ar">↗</span></a>
        <a class="ul" href="https://www.facebook.com/Sunless.101894" target="_blank" rel="noopener">Facebook<span class="ar">↗</span></a>
      </div>
      <div class="row2">
        <nav class="lk" aria-label="Site links"><a href="#about" data-go="about">About me</a><a href="#services" data-go="services">Stack</a><a href="#works" data-go="works">Works</a></nav>
        <div class="addr">Address:<br>Dhaka, Bangladesh</div>
      </div>
      <div class="row3">
        <a class="bk" href="https://github.com/" target="_blank" rel="noopener"><i class="l">[</i> GitHub <i class="r">]</i></a>
        <a class="bk" href="https://linkedin.com/" target="_blank" rel="noopener"><i class="l">[</i> LinkedIn <i class="r">]</i></a>
        <a class="bk" href="https://x.com/" target="_blank" rel="noopener"><i class="l">[</i> X <i class="r">]</i></a>
      </div>
    </div>
    <div class="mask gmask"><div class="mi"><span class="giant" id="giant">ZAHID.OS</span></div></div>
    <div class="row4"><span>Dhaka, Bangladesh: (GMT+6) <span id="clock">--:--</span></span><span>Development - CSE</span>
      <small>2026 All Right Reserved. Zahid. Any Reproduction, Distribution, Or Use Of The Materials Without Permission Is Prohibited.</small></div>
  </section>`,
};

export function aboutHTML() {
  const L = [["CODE", 0], ["IS NOT JUST", 1], ["SYNTAX, BUT", 1], ["A TOOL FOR LOGIC", 0], ["AND SECURITY.", 0]];
  const ln = L.map(([t, d]) => `<span class="ln${d ? " d" : ""}" aria-hidden="true">` + t.split(" ").map(w => `<span class="w">` + [...w].map(c => `<span class="ab-c">${c}</span>`).join("") + `</span>`).join(" ") + `</span>`).join("");
  const CUR = `<div class="ab-cur"><div class="ab-pgs">
    <div class="ab-pg ab-pg1"><h3 class="ab-q" data-rl>It’s not just a degree. It’s a way of thinking.</h3>
      <p class="ab-p p1" data-rl>My work is part of my lifestyle. As a CSE student I am constantly watching how systems are built, how they break, and how people find ways around them.</p>
      <span class="ab-lb l2" data-rl>My philosophy ↘</span>
      <p class="ab-p p2" data-rl>I value clarity, logic and security, in code and in life. I lean towards conscious minimalism: keep only what makes sense and works. I like simple interfaces with deep reasoning behind them.</p></div>
    <div class="ab-pg ab-pg2"><div class="ab-phs"><figure class="ab-im im1" data-q><img src="${PH_A}" alt="Portrait of Zahid, black and white" decoding="async"></figure><figure class="ab-im im2" data-q><img src="${PH_B}" alt="Portrait of Zahid at night" decoding="async"></figure></div>
      <a class="ab-lk" href="#connect" data-go="connect" data-q>Let’s connect <i aria-hidden="true">↗</i></a>
      <span class="ab-lb l3" data-rl>My lifestyle ↘</span>
      <p class="ab-p p3" data-rl>I look for good systems everywhere: in the forms of nature, in the details of architecture, in the way a city runs, and even in the simple things of everyday life. It’s not just a hobby, it’s a way of seeing the world.</p>
      <p class="ab-p p4" data-rl>Every project for me is more than a task. It’s a story I help tell through code. I believe a good product is not just about features and speed, but about the way it feels to use.</p></div></div></div>`;
  return `<section class="ab"><h2 class="ab-t" aria-label="About me">${[..."About me"].map(c => c === " " ? '<span class="ac sp" aria-hidden="true"></span>' : `<span class="ac" aria-hidden="true">${c}</span>`).join("")}</h2><div class="ab-scene"><div class="ab-b"><div class="ab-r"><b>2/5</b><span>For me</span><b>CSE/2</b></div><h3 class="ab-h" aria-label="Code is not just syntax, but a tool for logic and security.">${ln}</h3>${CUR}</div></div></section>`;
}
/* about: letters are boxes. They fall, land on the floor or on each other, and stack; a box that is less than half supported slides off. */

export function selHTML() {
  const cards = WK_MAIN.map((p, i) => `<article class="sw-ch" data-i="${i}" tabindex="0" role="button" aria-haspopup="dialog" aria-label="Open ${p.t}"><div class="sw-fr"><div class="sw-pl" data-k="0"><svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${p.sh}</svg><span class="tg">${p.tag[0] || "Project"}</span></div></div><div class="sw-tx"><div class="sw-nm mk" data-k="1"><h3>${p.t}</h3></div><div class="sw-ft" data-k="2"><span>0${i + 1} / 0${WK_MAIN.length}</span><span>Visit <i aria-hidden="true">↗</i></span></div></div></article>`).join("");
  return `<section class="sw"><div class="sw-scene"><div class="sw-pin"><div class="sw-r"><b>3/5</b><span>Recent work</span><b>0${WK_MAIN.length} PROJECTS</b></div>
    <div class="sw-track"><svg class="sw-ln" aria-hidden="true"><path d=""/></svg>
    <div class="sw-in"><span class="sw-kb" data-k="0">Keep scrolling</span><h2 class="sw-h" aria-label="Recent work"><span class="mk" data-k="1"><span>Recent</span></span><span class="mk" data-k="2"><span>Work</span></span></h2><p data-k="3">Things I built, from late-night experiments to a product for a friend’s startup. Click a card to open it.</p><a class="sw-go" href="https://github.com/UnrealZahid101894?tab=repositories" target="_blank" rel="noopener" data-k="4">Explore more <i aria-hidden="true">↗</i></a></div>
    ${cards}
    <a class="sw-end" href="https://github.com/UnrealZahid101894?tab=repositories" target="_blank" rel="noopener"><span class="mk" data-k="0"><span>Full</span></span><span class="mk" data-k="1"><span>list</span></span><em data-k="2">All projects <i aria-hidden="true">↗</i></em></a></div></div></div></section>`;
}
