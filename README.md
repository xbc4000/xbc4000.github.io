# HCC Startpage

> Cyberpunk command center for the homelab. Lives at
> [xbc4000.github.io](https://xbc4000.github.io).

A personal browser homepage / new-tab dashboard for navigating my homelab. The
look is a custom HCC ("Homelab Command Center") cyberpunk theme — cyan/magenta/
amber accents, scanline overlay, neural-network particle field, vertical hex
data rain, HUD corner brackets, and a top-center status readout that shows
**real** browser + LAN signals (no fake "system nominal" theatre).

## What's on it

- **HOMELAB tab** — direct links to every internal service: Pi-hole, Portainer,
  Grafana dashboards (deep links to each board by UID), HCC Dashboard, router
  admin, mktxp metrics, and more. All routed through the local Caddy reverse
  proxy at `*.home`.
- **Other tabs** — search shortcuts, common dev/tooling links, etc. (configured
  per-user in `userconfig.js`)
- **Search overlay** — press `s` to summon a multi-engine search bar
  (`!g` Google, `!d` DuckDuckGo, `!p` Perplexity, etc.)
- **Weather widget** — keyless via Open-Meteo, no API key required
- **Clock widget** — 12/24-hour, multiple timezones via IANA names
- **Live HUD readout** — pulse dot, real clock with TZ offset, LAN reachability
  probe (fetches `bridge.home/health` every 10s), `navigator.connection` type +
  downlink, viewport WxH@DPR, page uptime since DOMContentLoaded

## Configure

Everything user-facing is in [`userconfig.js`](userconfig.js). It controls:

- Theme palette overrides (the HCC cyan palette is at the top of the file)
- Tab structure, categories, links
- Search engines and default
- Weather location
- Clock format and additional timezones

The original [`userconfig.example.js`](userconfig.example.js) from the upstream
project is preserved as a reference for the base config schema.

## Run locally

It's a static site — no build step. Open `index.html` in a browser, or:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Deployed via GitHub Pages straight from `main`.

## Project layout

```
index.html              — entry point, loads scripts in order
userconfig.js           — your personal config (live)
userconfig.example.js   — original schema reference
src/
├── common/             — palette, utils, storage, theme, components, effects
│   ├── effects.js      — HCC particles + rain + HUD chrome
│   ├── palette.js      — Catppuccin palette objects (kept as a base)
│   └── ...
├── components/         — tabs, weather, clock, statusbar, search
├── css/                — stylesheets, font CSS
├── fonts/              — local font files (avoid Google Fonts CDN)
└── img/                — banners, favicon
docs/                   — clock format reference
```

## Credits & inspiration

This project started as a personal fork of
[**pivoshenko/catppuccin-startpage**](https://github.com/pivoshenko/catppuccin-startpage),
which is itself based on [b-coimbra/dawn](https://github.com/b-coimbra/dawn).
The original codebase, file layout, and component pattern are all from there
and the original MIT copyright is preserved in [`LICENSE`](LICENSE).

The color sensibility started from
[**Catppuccin**](https://catppuccin.com/palette) — the palette is still loaded
as a base in [`src/common/palette.js`](src/common/palette.js), even though the
HCC theme overrides it with cyan/magenta/amber.

What's been added on top in this fork (and is what made me want to rebrand):

- HCC cyberpunk theme — full visual overhaul of the tabs, sidebar, links,
  hover states, scanlines, and HUD
- HOMELAB tab with deep links to every homelab service
- `src/common/effects.js` — neural particle field, hex data rain, HUD corner
  brackets, live status readout
- Weather swap from OpenWeatherMap → Open-Meteo (no API key, no signup)
- Local font bundling so the site never hits Google Fonts CDN

Treat it as inspired-by rather than a fork at this point — the look is its own
thing now, but standing on the original's shoulders for the framework.

## License

[MIT](LICENSE) — both the original Catppuccin Startpage codebase and the HCC
modifications.
