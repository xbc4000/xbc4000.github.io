// User configuration for the startpage - update the palette, location, and your preferred tabs, categories, and links

// Define preferred palette for light and dark mode
// Available themes: latte, frappe, mocha, macchiato
const preferredLightTheme = latte;
const preferredDarkTheme = mocha;

let palette = initThemeSystem(preferredLightTheme, preferredDarkTheme);

// HCC cyberpunk cyan palette — overrides Catppuccin for the startpage
const hcc = {
  cyan: "#00b7ff",
  cyanBright: "#00d4ff",
  cyanDark: "#0088bb",
  cyanGlow: "#0ffff4",
  magenta: "#ff6680",
  amber: "#ffb347",
  green: "#00ff88",
  purple: "#b666ff",
};

const default_configuration = {
  overrideStorage: true,
  temperature: {
    location: "Owensound, Canada",
    scale: "C",
  },
  clock: {
    format: "k:i p",
    icon_color: hcc.cyanBright,
  },
  additionalClocks: [
    {
      label: "ON",
      timezone: "Canada/Toronto",
      format: "h:i",
      icon_color: hcc.cyanBright,
    },
  ],
  search: {
    engines: {
      p: ["https://www.perplexity.ai/search/?q=", "PerplexityAI"],
      d: ["https://duckduckgo.com/?q=", "DuckDuckGo"],
      g: ["https://google.com/search?q=", "Google"],
    },
    default: "p",
  },
  keybindings: {
    "s": "search-bar",
  },
  disabled: [],
  localIcons: true,
  localFonts: true,
  fastlink: "https://www.perplexity.ai",
  openLastVisitedTab: true,
  tabs: [
    {
      name: "HOMELAB",
      background_url: "src/img/banners/banner_07.gif",
      categories: [
        {
          name: "infrastructure",
          links: [
            { name: "router",    url: "http://router.home",      icon: "router",       icon_color: hcc.cyan },
            { name: "pi-hole",   url: "http://pi.hole/admin",    icon: "shield-check", icon_color: hcc.cyanBright },
            { name: "portainer", url: "https://portainer.home",  icon: "box-multiple", icon_color: hcc.cyan },
            { name: "caddy",     url: "http://10.40.40.2:9442",  icon: "lock",         icon_color: hcc.cyanDark },
            { name: "hcc",       url: "https://hcc.home",        icon: "layout-dashboard", icon_color: hcc.cyanBright },
            { name: "grafana",   url: "https://grafana.home",    icon: "chart-area",   icon_color: hcc.amber },
          ],
        },
        {
          name: "pi-hole admin",
          links: [
            { name: "dashboard", url: "http://pi.hole/admin",                 icon: "layout-dashboard", icon_color: hcc.cyanBright },
            { name: "queries",   url: "http://pi.hole/admin/queries",         icon: "list",             icon_color: hcc.cyan },
            { name: "network",   url: "http://pi.hole/admin/network",         icon: "network",          icon_color: hcc.cyan },
            { name: "groups",    url: "http://pi.hole/admin/groups",          icon: "users-group",      icon_color: hcc.amber },
            { name: "domains",   url: "http://pi.hole/admin/groups-domains",  icon: "world",            icon_color: hcc.amber },
            { name: "adlists",   url: "http://pi.hole/admin/groups-lists",    icon: "list-details",     icon_color: hcc.magenta },
            { name: "dns",       url: "http://pi.hole/admin/settings-dns",    icon: "world-www",        icon_color: hcc.cyanDark },
            { name: "dhcp",      url: "http://pi.hole/admin/settings-dhcp",   icon: "settings-2",       icon_color: hcc.cyanDark },
          ],
        },
        {
          name: "servers",
          links: [
            { name: "per730xd",  url: "https://idrac1.home",           icon: "server-2",        icon_color: hcc.cyan },
            { name: "per630",    url: "https://idrac2.home",           icon: "server-2",        icon_color: hcc.cyan },
            { name: "vconsole 1",url: "https://idrac1.home/restgui/start.html#/console",  icon: "device-tv",       icon_color: hcc.cyanBright },
            { name: "vconsole 2",url: "https://idrac2.home/restgui/start.html#/console",  icon: "device-tv",       icon_color: hcc.cyanBright },
            { name: "amp panel", url: "http://amp.home:8080",          icon: "device-gamepad-2",icon_color: hcc.green },
          ],
        },
        {
          name: "per730xd ctrl",
          links: [
            { name: "power",   url: "https://idrac1.home/restgui/start.html#/power",   icon: "bolt",           icon_color: hcc.amber },
            { name: "storage", url: "https://idrac1.home/restgui/start.html#/storage", icon: "database",       icon_color: hcc.purple },
            { name: "bios",    url: "https://idrac1.home/restgui/start.html#/bios",    icon: "cpu",            icon_color: hcc.cyan },
            { name: "health",  url: "https://idrac1.home/restgui/start.html#/health",  icon: "heart-rate-monitor", icon_color: hcc.green },
            { name: "logs",    url: "https://idrac1.home/restgui/start.html#/logs",    icon: "file-text",      icon_color: hcc.cyanDark },
            { name: "network", url: "https://idrac1.home/restgui/start.html#/network", icon: "network",        icon_color: hcc.cyanDark },
          ],
        },
        {
          name: "per630 ctrl",
          links: [
            { name: "power",   url: "https://idrac2.home/restgui/start.html#/power",   icon: "bolt",           icon_color: hcc.amber },
            { name: "storage", url: "https://idrac2.home/restgui/start.html#/storage", icon: "database",       icon_color: hcc.purple },
            { name: "bios",    url: "https://idrac2.home/restgui/start.html#/bios",    icon: "cpu",            icon_color: hcc.cyan },
            { name: "health",  url: "https://idrac2.home/restgui/start.html#/health",  icon: "heart-rate-monitor", icon_color: hcc.green },
            { name: "logs",    url: "https://idrac2.home/restgui/start.html#/logs",    icon: "file-text",      icon_color: hcc.cyanDark },
            { name: "network", url: "https://idrac2.home/restgui/start.html#/network", icon: "network",        icon_color: hcc.cyanDark },
          ],
        },
        {
          name: "grafana boards",
          links: [
            { name: "grafana home",   url: "https://grafana.home",                             icon: "chart-area",    icon_color: hcc.amber },
            { name: "idrac command",  url: "https://grafana.home/d/idrac-dual-command-center", icon: "cpu",           icon_color: hcc.cyan },
            { name: "mikrotik",       url: "https://grafana.home/d/mikrotik-mktxp",            icon: "router",        icon_color: hcc.cyanBright },
            { name: "rpi stack",      url: "https://grafana.home/d/rpi-unified",               icon: "device-imac",   icon_color: hcc.green },
            { name: "logs",           url: "https://grafana.home/d/homelab-log-intelligence",  icon: "file-text",     icon_color: hcc.cyanDark },
            { name: "scrape health",  url: "https://grafana.home/d/prometheus-health",         icon: "activity",      icon_color: hcc.magenta },
          ],
        },
        {
          name: "hcc",
          links: [
            { name: "dashboard",      url: "https://hcc.home",      icon: "layout-dashboard", icon_color: hcc.cyanBright },
            { name: "spotify bridge", url: "https://bridge.home",   icon: "brand-spotify",    icon_color: hcc.green },
          ],
        },
        {
          name: "monitoring",
          links: [
            { name: "prometheus",     url: "http://10.40.40.2:9090",          icon: "activity",     icon_color: hcc.magenta },
            { name: "loki",           url: "http://10.40.40.2:3100",          icon: "file-text",    icon_color: hcc.cyan },
            { name: "influxdb",       url: "http://10.40.40.2:8086",          icon: "database",     icon_color: hcc.purple },
            { name: "node exporter",  url: "http://10.40.40.2:9100/metrics",  icon: "chart-line",   icon_color: hcc.cyanDark },
            { name: "snmp exporter",  url: "http://10.40.40.2:9116/metrics",  icon: "wifi",         icon_color: hcc.cyanDark },
            { name: "mktxp",          url: "http://10.40.40.2:49090/metrics", icon: "router",       icon_color: hcc.cyanDark },
            { name: "idrac exporter", url: "http://10.40.40.2:9348/metrics",  icon: "cpu",          icon_color: hcc.cyanDark },
            { name: "pihole exporter",url: "http://10.40.40.2:9617/metrics",  icon: "shield-check", icon_color: hcc.cyanDark },
          ],
        },
        {
          name: "network / docs",
          links: [
            { name: "ap1 map2nd",   url: "http://ap1.home",                    icon: "access-point", icon_color: hcc.cyan },
            { name: "ap2 wap2nd",   url: "http://ap2.home",                    icon: "access-point", icon_color: hcc.cyan },
            { name: "winbox dl",    url: "https://mt.lv/winbox",               icon: "terminal-2",   icon_color: hcc.magenta },
            { name: "mikrotik docs",url: "https://help.mikrotik.com/docs/",    icon: "book",         icon_color: hcc.amber },
            { name: "mikrotik wiki",url: "https://wiki.mikrotik.com/wiki/",    icon: "book-2",       icon_color: hcc.amber },
          ],
        },
        {
          name: "repos",
          links: [
            { name: "homelab-network",      url: "https://github.com/xbc4000/homelab-network",                icon: "brand-github", icon_color: hcc.cyanBright },
            { name: "hcc-dashboard",        url: "https://github.com/xbc4000/hcc-dashboard",                  icon: "brand-github", icon_color: hcc.cyanBright },
            { name: "hcc-spotify-bridge",   url: "https://github.com/xbc4000/hcc-spotify-bridge",             icon: "brand-github", icon_color: hcc.cyanBright },
            { name: "startpage",            url: "https://github.com/xbc4000/xbc4000.github.io",              icon: "brand-github", icon_color: hcc.cyanBright },
            { name: "nvidia secureboot",    url: "https://github.com/xbc4000/install-nvidia-secureboot-fedora", icon: "brand-github", icon_color: hcc.cyanBright },
          ],
        },
      ],
    },
    {
      name: "dev",
      background_url: "src/img/banners/banner_07.gif",
      categories: [
        {
          name: "development",
          links: [
            {
              name: "github",
              url: "https://github.com",
              icon: "brand-github",
              icon_color: hcc.cyanBright,
            },
            {
              name: "neptune",
              url: "https://ui.neptune.ai",
              icon: "circle-triangle",
              icon_color: hcc.amber,
            },
            {
              name: "stackoverflow",
              url: "https://stackoverflow.com",
              icon: "brand-stackoverflow",
              icon_color: hcc.magenta,
            },
          ],
        },
        {
          name: "challenges",
          links: [
            {
              name: "kaggle",
              url: "https://www.kaggle.com",
              icon: "brain",
              icon_color: hcc.cyan,
            },
            {
              name: "leetcode",
              url: "https://leetcode.com",
              icon: "code-plus",
              icon_color: hcc.amber,
            },
            {
              name: "exercism",
              url: "https://exercism.org",
              icon: "code-minus",
              icon_color: hcc.magenta,
            },
            {
              name: "aoc",
              url: "https://adventofcode.com",
              icon: "brand-linktree",
              icon_color: hcc.cyanBright,
            },
          ],
        },
        {
          name: "resources",
          links: [
            {
              name: "dou",
              url: "https://dou.ua",
              icon: "brand-prisma",
              icon_color: hcc.cyan,
            },
            {
              name: "hackernews",
              url: "https://news.ycombinator.com",
              icon: "brand-redhat",
              icon_color: hcc.amber,
            },
            {
              name: "uber engineering",
              url: "https://www.uber.com/en-GB/blog/london/engineering",
              icon: "brand-uber",
              icon_color: hcc.magenta,
            },
            {
              name: "netflix tech blog",
              url: "https://netflixtechblog.com",
              icon: "brand-netflix",
              icon_color: hcc.cyanBright,
            },
          ],
        },
      ],
    },
    {
      name: "chill",
      background_url: "src/img/banners/banner_08.gif",
      categories: [
        {
          name: "social media",
          links: [
            {
              name: "telegram",
              url: "https://web.telegram.org",
              icon: "brand-telegram",
              icon_color: hcc.cyan,
            },
            {
              name: "facebook",
              url: "https://www.facebook.com",
              icon: "brand-facebook",
              icon_color: hcc.cyanBright,
            },
            {
              name: "reddit",
              url: "https://www.reddit.com/r/unixporn",
              icon: "brand-reddit",
              icon_color: hcc.magenta,
            },
          ],
        },
        {
          name: "gaming",
          links: [
            {
              name: "IGN",
              url: "https://www.ign.com/account/playlist/library",
              icon: "device-gamepad",
              icon_color: hcc.cyan,
            },
            {
              name: "steam",
              url: "https://store.steampowered.com",
              icon: "brand-steam",
              icon_color: hcc.cyanBright,
            },
            {
              name: "epicgames",
              url: "https://store.epicgames.com",
              icon: "brand-fortnite",
              icon_color: hcc.magenta,
            },
            {
              name: "nintendo",
              url: "https://store.nintendo.co.uk",
              icon: "device-nintendo",
              icon_color: hcc.amber,
            },
          ],
        },
        {
          name: "video",
          links: [
            {
              name: "anilist",
              url: "https://anilist.co/home",
              icon: "brand-funimation",
              icon_color: hcc.cyan,
            },
            {
              name: "youtube",
              url: "https://www.youtube.com",
              icon: "brand-youtube",
              icon_color: hcc.magenta,
            },
            {
              name: "patreon",
              url: "https://www.patreon.com",
              icon: "brand-patreon",
              icon_color: hcc.amber,
            },
            {
              name: "kyivstar",
              url: "https://tv.kyivstar.ua",
              icon: "star-filled",
              icon_color: hcc.cyanBright,
            },
          ],
        },
      ],
    },
  ],
};

const CONFIG = new Config(default_configuration, palette);

// Expose HCC palette so tabs.component.js can pull the cyberpunk colors
CONFIG.hcc = hcc;

const root = document.querySelector(":root");
root.style.setProperty("--bg", "#020408");
root.style.setProperty("--accent", hcc.cyan);
