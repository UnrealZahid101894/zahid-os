# SFX

Custom audio files for UI interactions. Nothing here is required —
the site works silently without them. Drop a file in and it plays.

## Folder map

    assets/sfx/
      ui/         Buttons, links, nav
        hover.mp3
        click.mp3
        toggle.mp3        (optional — used when data-sfx="toggle")
      crumble/    About section letter physics
        crumble-1.mp3
        crumble-2.mp3
        crumble-3.mp3
        crumble-4.mp3
      works/      Project modal
        open.mp3
        close.mp3
      loader/     Boot sequence
        tick.mp3
        ready.mp3

## File format

- `.mp3` — recommended (smallest, universal)
- `.wav` — fine for very short sounds
- `.ogg` — smallest, but Safari support is patchy

Keep UI sounds short: **40–150 ms**. Anything over 300 ms feels laggy.

## Per-element override

Add `data-sfx` to any element to route it to a different sound:

    <button data-sfx="toggle">…</button>
    <a data-sfx="open">Open project</a>

Hover can be overridden separately:

    <li data-sfx-hover="soft">…</li>

## Wiring

The audio module reads from this folder. It is not currently
connected to the site — see `js/main.js` for where `initSfx()`
would be called if you decide to enable sounds later.