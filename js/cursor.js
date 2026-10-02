// js/cursor.js
// Crosshair cursor: full-page hairlines + a target that locks onto clickable elements.
// Mouse only ? bails out entirely on touch devices.

export function initCursor() {
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
}
