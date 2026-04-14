#!/usr/bin/env python3
"""
Regenerates docs/architecture.png — the startpage's widget-to-source map.

Mirrors the cyberpunk style of homelab-network/topology.png. Run with:

    python3 scripts/generate-architecture.py
"""

import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "docs", "architecture.png")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

BG          = (3, 6, 16)
BG_CARD     = (10, 14, 24)
CYAN        = (0, 183, 255)
CYAN_BRIGHT = (0, 212, 255)
MAGENTA     = (255, 0, 178)
ORANGE      = (255, 153, 0)
GREEN       = (0, 255, 136)
PURPLE      = (185, 134, 242)
GOLD        = (255, 215, 0)
SPOTIFY     = (29, 185, 84)
TEXT        = (153, 170, 208)
TEXT_BRIGHT = (208, 221, 240)
TEXT_MUTED  = (85, 102, 136)

FONT_CANDIDATES = [
    "/run/host/fonts/google-noto/NotoSansMono-SemiCondensedMedium.ttf",
    "/run/host/fonts/google-noto/NotoSansMono-SemiCondensedBold.ttf",
    "/usr/share/fonts/google-noto/NotoSansMono-SemiCondensedMedium.ttf",
    "/usr/share/fonts/google-noto/NotoSansMono-SemiCondensedBold.ttf",
    "/usr/share/fonts/gnu-free/FreeMono.ttf",
    "/usr/share/fonts/gnu-free/FreeMonoBold.ttf",
]

def _find_font(bold=False):
    needle = "Bold" if bold else "Medium"
    for p in FONT_CANDIDATES:
        if needle in p and os.path.exists(p):
            return p
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            return p
    return None

def font(size, bold=False):
    p = _find_font(bold=bold)
    return ImageFont.truetype(p, size) if p else ImageFont.load_default()


def box(d, x, y, w, h, color, title, lines):
    d.rectangle([x, y, x + w, y + h], outline=color, width=2)
    d.rectangle([x + 1, y + 1, x + w - 1, y + 24], fill=BG_CARD)
    d.text((x + 10, y + 5), title, font=font(12, bold=True), fill=color)
    for i, line in enumerate(lines):
        d.text((x + 10, y + 32 + i * 16), line, font=font(11), fill=TEXT)


def main():
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)

    # Title
    d.text((W // 2, 20), "// HCC STARTPAGE ARCHITECTURE",
           font=font(18, bold=True), fill=CYAN, anchor="mt")
    d.text((W // 2, 47),
           "vanilla shadow-DOM components  //  no build step  //  GitHub Pages + LAN Caddy",
           font=font(11), fill=TEXT_MUTED, anchor="mt")

    # ─── Top: Browser ──────────────────────────────────────────────────
    br_x, br_y, br_w, br_h = 490, 85, 300, 55
    box(d, br_x, br_y, br_w, br_h, GOLD, "▲ Browser",
        ["xbc4000.github.io  OR  startpage.home"])

    # ─── Fan-out: effects engine + widgets row 1 ───────────────────────
    # Browser → everything below via one central cyan line
    d.line([(W // 2, br_y + br_h), (W // 2, 175)], fill=GOLD, width=2)
    # Horizontal "app bus" that everything hangs off
    bus_y = 175
    d.line([(100, bus_y), (W - 100, bus_y)], fill=CYAN, width=1)

    # ─── 2×2 widget grid ───────────────────────────────────────────────
    # Top row — NOW PLAYING | CONDITIONS
    wg_y1 = 195
    wg_y2 = 365
    wg_w = 260
    wg_h = 150
    widgets_top = [
        (90,  SPOTIFY, "▲ NOW PLAYING",
         ["same-origin fetch", "/bridge/status", "via Caddy proxy",
          "localhost:3081"]),
        (W - 90 - wg_w, ORANGE, "▲ CONDITIONS",
         ["Open-Meteo (keyless)", "BigDataCloud (geo)", "temp · feels · wind",
          "HI/LO/HUMID/SUNUP"]),
    ]
    widgets_bot = [
        (90,  CYAN, "▲ JARVIS",
         ["radar canvas", "browser telemetry", "viewport · net · cores",
          "battery · memory"]),
        (W - 90 - wg_w, MAGENTA, "▲ SERINA",
         ["/ollama/status", "/ollama/serina", "GPU · VRAM · fan",
          "models · watchdog"]),
    ]
    for x, color, title, lines in widgets_top:
        d.line([(x + wg_w // 2, bus_y), (x + wg_w // 2, wg_y1)],
               fill=color, width=1)
        box(d, x, wg_y1, wg_w, wg_h, color, title, lines)
    for x, color, title, lines in widgets_bot:
        # Drop from bus, route around top widgets
        col = x + wg_w // 2
        d.line([(col, bus_y), (col, wg_y2)], fill=color, width=1)
        box(d, x, wg_y2, wg_w, wg_h, color, title, lines)

    # ─── Centre: tab panel + search overlay + feeds ────────────────────
    tab_x, tab_y, tab_w, tab_h = 430, 195, 420, 150
    box(d, tab_x, tab_y, tab_w, tab_h, CYAN_BRIGHT,
        "◆ Tab panel  (HOMELAB · DEV · DAILY · NEWS · CHILL)",
        ["5 tab configs loaded from userconfig.js",
         "each tab: banner GIF + categories + icon links",
         "bottom nav buttons toggle [active] on <ul>",
         "click-to-switch (scroll disabled)"])
    d.line([(W // 2, bus_y), (W // 2, tab_y)], fill=CYAN_BRIGHT, width=1)

    sr_x, sr_y, sr_w, sr_h = 430, 365, 420, 90
    box(d, sr_x, sr_y, sr_w, sr_h, GOLD,
        "◆ Search overlay   (press s)",
        ["p  Perplexity       d  DuckDuckGo",
         "g  Google           multi-engine chooser"])

    # Feeds below the middle column
    fd_x, fd_y, fd_w, fd_h = 90, 525, W - 180, 70
    box(d, fd_x, fd_y, fd_w, fd_h, PURPLE,
        "▲ FEEDS  (auto-refresh)",
        ["Reddit JSON  ·  9 subreddits      Hacker News Algolia",
         "multi-column grid at the bottom of the viewport"])

    # ─── Deployment footer ─────────────────────────────────────────────
    footer_y = 615
    d.rectangle([60, footer_y, W - 60, footer_y + 60], outline=CYAN, width=1)
    stats = [
        ("TABS",    "5",                 CYAN_BRIGHT),
        ("WIDGETS", "4 (2x2 grid)",      ORANGE),
        ("EFFECTS", "particles · rain",  PURPLE),
        ("DEPLOY",  "GH Pages + Caddy",  GOLD),
        ("BUILD",   "zero (static)",     GREEN),
        ("PROXY",   "/bridge  /ollama",  SPOTIFY),
    ]
    cell_w = (W - 120) // len(stats)
    for i, (label, value, color) in enumerate(stats):
        sx = 60 + i * cell_w
        d.text((sx + 20, footer_y + 12), label,
               font=font(9), fill=TEXT_MUTED)
        d.text((sx + 20, footer_y + 28), value,
               font=font(13, bold=True), fill=color)

    d.text((W // 2, 690),
           "◆ XBC SYSTEMS  //  HOMELAB COMMAND CENTER  //  HCC Startpage ◆",
           font=font(9), fill=TEXT_MUTED, anchor="mt")
    d.text((W // 2, 705),
           "[ 2026 · new tab · set as homepage ]",
           font=font(8), fill=TEXT_MUTED, anchor="mt")

    im.save(OUT)
    print(f"wrote {OUT}  ({W}x{H})")


if __name__ == "__main__":
    main()
