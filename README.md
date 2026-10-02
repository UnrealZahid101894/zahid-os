\# zahid.os



A personal portfolio built as a single-page "operating system."



Features a time-of-day theme engine that interpolates between nine palettes

in OKLab color space, a crosshair cursor that locks onto clickable elements,

a dial-driven time control, and a modal project viewer that loads live

previews on demand.



\## Stack



Plain HTML, CSS, and ES modules. No build step.



\## Structure



&#x20;   index.html          entry

&#x20;   css/                styles (split by section)

&#x20;   js/                 ES modules, one per feature

&#x20;   data/               wk-live.json (fetched on demand)

&#x20;   assets/             images



\## Local development



Any static server works — `fetch()` won't work from `file://`.



&#x20;   python3 -m http.server 8000



Then open http://localhost:8000



\## Deployment



Fully static. Deploys to GitHub Pages, Vercel, Netlify, or Cloudflare

Pages with no configuration.



\## License



MIT — see LICENSE.

