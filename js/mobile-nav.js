// js/mobile-nav.js
// On mobile the nav becomes a fixed bottom bar. The header is also fixed
// (and hides itself on scroll), which would create a containing block that
// breaks the nav's own position: fixed. So we relocate the nav to be a
// sibling of the header on mobile, and put it back on desktop.

const MQ = matchMedia("(max-width: 720px)");

export function initMobileNav() {
  const header = document.querySelector("header");
  const nav = document.querySelector("nav");
  if (!header || !nav) return;

  const place = () => {
    if (MQ.matches) {
      if (nav.parentElement !== document.body) document.body.append(nav);
    } else {
      // Insert BEFORE the dial to keep the original order: logo | nav | dial
      const dial = header.querySelector("#dial");
      if (nav.parentElement !== header || nav.nextElementSibling !== dial) {
        if (dial) header.insertBefore(nav, dial);
        else header.append(nav);
      }
    }
  };

  place();
  MQ.addEventListener("change", place);
}
