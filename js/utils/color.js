// js/utils/color.js
// OKLab color math. Pure. No DOM, no globals.

/* Blend in OKLab (perceptual space) so dark-to-light shifts look even instead of muddy grey. */
export const lin = v => (v /= 255) <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
export const gam = v => 255 * (v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055);
export const toLab = ([r, g, b]) => {
  r = lin(r); g = lin(g); b = lin(b);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b),
        m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b),
        s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return [.2104542553 * l + .793617785 * m - .0040720468 * s,
          1.9779984951 * l - 2.428592205 * m + .4505937099 * s,
          .0259040371 * l + .7827717662 * m - .808675766 * s];
};
export const fromLab = ([L, a, b]) => {
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3,
        m = (L - .1055613458 * a - .0638541728 * b) ** 3,
        s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s,
          -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s,
          -.0041960863 * l - .7034186147 * m + 1.707614701 * s]
    .map(v => Math.round(gam(Math.min(1, Math.max(0, v)))));
};

export const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
export const lum = c => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
export const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
// Somewhere between dark and light, text has to swap sides. This keeps it readable there.
export const readable = (c, bg, min) => {
  if (ratio(c, bg) >= min) return c;
  const w = [245,245,240], k = [12,12,12];
  return ratio(w, bg) > ratio(k, bg) ? w : k;
};
export const css = c => `rgb(${c})`;
