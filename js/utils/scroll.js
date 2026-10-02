// js/utils/scroll.js
// Shared scroll position. The smooth-scroll engine in main.js calls
// setScrollY() to plug in a smoothed implementation; everyone else
// just calls sY() to get the current value.

let _impl = () => window.scrollY;
export function sY() { return _impl(); }
export function setScrollY(fn) { _impl = fn; }
