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
    location: "Owen Sound, Canada",
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
      background_url: "src/img/banners/banner_03.gif",
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
          name: "code",
          links: [
            { name: "github",        url: "https://github.com/xbc4000",                       icon: "brand-github",        icon_color: hcc.cyanBright },
            { name: "gists",         url: "https://gist.github.com/xbc4000",                  icon: "brand-github-filled", icon_color: hcc.cyan },
            { name: "stars",         url: "https://github.com/xbc4000?tab=stars",             icon: "star",                icon_color: hcc.amber },
            { name: "notifications", url: "https://github.com/notifications",                 icon: "bell",                icon_color: hcc.magenta },
            { name: "stackoverflow", url: "https://stackoverflow.com",                        icon: "brand-stackoverflow", icon_color: hcc.amber },
          ],
        },
        {
          name: "ai",
          links: [
            { name: "claude",        url: "https://claude.ai",                                icon: "robot",               icon_color: hcc.amber },
            { name: "claude code",   url: "https://docs.claude.com/en/docs/claude-code",      icon: "terminal-2",          icon_color: hcc.amber },
            { name: "anthropic api", url: "https://console.anthropic.com",                    icon: "api",                 icon_color: hcc.amber },
            { name: "perplexity",    url: "https://www.perplexity.ai",                        icon: "search",              icon_color: hcc.cyanBright },
            { name: "chatgpt",       url: "https://chat.openai.com",                          icon: "message-circle-2",    icon_color: hcc.green },
          ],
        },
        {
          name: "docs",
          links: [
            { name: "mdn",           url: "https://developer.mozilla.org",                    icon: "brand-firefox",       icon_color: hcc.amber },
            { name: "caniuse",       url: "https://caniuse.com",                              icon: "browser-check",       icon_color: hcc.cyan },
            { name: "node docs",     url: "https://nodejs.org/docs/latest/api/",              icon: "brand-nodejs",        icon_color: hcc.green },
            { name: "docker docs",   url: "https://docs.docker.com",                          icon: "brand-docker",        icon_color: hcc.cyanBright },
            { name: "caddy docs",    url: "https://caddyserver.com/docs/",                    icon: "lock",                icon_color: hcc.cyanDark },
          ],
        },
        {
          name: "linux",
          links: [
            { name: "fedora pkgs",   url: "https://packages.fedoraproject.org",               icon: "package",             icon_color: hcc.cyan },
            { name: "fedora docs",   url: "https://docs.fedoraproject.org",                   icon: "book-2",              icon_color: hcc.cyan },
            { name: "kernel.org",    url: "https://www.kernel.org",                           icon: "device-desktop",      icon_color: hcc.amber },
            { name: "arch wiki",     url: "https://wiki.archlinux.org",                       icon: "book",                icon_color: hcc.cyanBright },
            { name: "dietpi docs",   url: "https://dietpi.com/docs/",                         icon: "brand-debian",        icon_color: hcc.magenta },
          ],
        },
        {
          name: "tools",
          links: [
            { name: "regex101",      url: "https://regex101.com",                             icon: "regex",               icon_color: hcc.cyanBright },
            { name: "json viewer",   url: "https://jsonviewer.stack.hu",                      icon: "braces",              icon_color: hcc.amber },
            { name: "crontab guru",  url: "https://crontab.guru",                             icon: "clock-cog",           icon_color: hcc.cyan },
            { name: "cyberchef",     url: "https://gchq.github.io/CyberChef/",                icon: "tools",               icon_color: hcc.magenta },
            { name: "tabler icons",  url: "https://tabler.io/icons",                          icon: "icons",               icon_color: hcc.cyanBright },
          ],
        },
        {
          name: "feeds",
          links: [
            { name: "hackernews",    url: "https://news.ycombinator.com",                     icon: "flame",               icon_color: hcc.amber },
            { name: "lobsters",      url: "https://lobste.rs",                                icon: "fish",                icon_color: hcc.magenta },
            { name: "lwn",           url: "https://lwn.net",                                  icon: "rss",                 icon_color: hcc.amber },
            { name: "phoronix",      url: "https://www.phoronix.com",                         icon: "cpu",                 icon_color: hcc.cyanBright },
            { name: "ars technica",  url: "https://arstechnica.com",                          icon: "news",                icon_color: hcc.cyan },
          ],
        },
      ],
    },
    {
      name: "daily",
      background_url: "src/img/banners/banner_11.gif",
      categories: [
        {
          name: "mail",
          links: [
            { name: "gmail",         url: "https://mail.google.com",                          icon: "mail",                icon_color: hcc.magenta },
            { name: "protonmail",    url: "https://mail.proton.me",                           icon: "mail-fast",           icon_color: hcc.purple },
            { name: "outlook",       url: "https://outlook.live.com",                         icon: "mail-opened",         icon_color: hcc.cyanBright },
          ],
        },
        {
          name: "calendar",
          links: [
            { name: "google cal",    url: "https://calendar.google.com",                      icon: "calendar",            icon_color: hcc.cyanBright },
            { name: "proton cal",    url: "https://calendar.proton.me",                       icon: "calendar-event",      icon_color: hcc.purple },
          ],
        },
        {
          name: "notes",
          links: [
            { name: "obsidian sync", url: "https://app.obsidian.md",                          icon: "notebook",            icon_color: hcc.amber },
            { name: "notion",        url: "https://www.notion.so",                            icon: "file-text",           icon_color: hcc.cyan },
            { name: "simplenote",    url: "https://app.simplenote.com",                       icon: "writing",             icon_color: hcc.cyanBright },
          ],
        },
        {
          name: "todo",
          links: [
            { name: "todoist",       url: "https://todoist.com/app",                          icon: "checkbox",            icon_color: hcc.magenta },
            { name: "ticktick",      url: "https://ticktick.com/webapp",                      icon: "list-check",          icon_color: hcc.cyanBright },
          ],
        },
        {
          name: "weather",
          links: [
            { name: "open-meteo",    url: "https://open-meteo.com",                           icon: "cloud",               icon_color: hcc.cyanBright },
            { name: "weather.gov",   url: "https://weather.gov",                              icon: "cloud-storm",         icon_color: hcc.cyan },
            { name: "windy",         url: "https://www.windy.com",                            icon: "wind",                icon_color: hcc.amber },
            { name: "earth nullschool", url: "https://earth.nullschool.net",                  icon: "world-latitude",      icon_color: hcc.green },
          ],
        },
        {
          name: "finance",
          links: [
            { name: "paypal",        url: "https://www.paypal.com",                           icon: "brand-paypal",        icon_color: hcc.cyanBright },
            { name: "wise",          url: "https://wise.com",                                 icon: "currency-dollar",     icon_color: hcc.green },
            { name: "stripe",        url: "https://dashboard.stripe.com",                     icon: "credit-card",         icon_color: hcc.purple },
          ],
        },
      ],
    },
    {
      name: "news",
      background_url: "src/img/banners/banner_14.gif",
      categories: [
        {
          name: "tech",
          links: [
            { name: "the verge",     url: "https://www.theverge.com",                         icon: "rss",                 icon_color: hcc.magenta },
            { name: "ars technica",  url: "https://arstechnica.com",                          icon: "antenna-bars-5",      icon_color: hcc.amber },
            { name: "wired",         url: "https://www.wired.com",                            icon: "wifi",                icon_color: hcc.cyanBright },
            { name: "techcrunch",    url: "https://techcrunch.com",                           icon: "rocket",              icon_color: hcc.green },
            { name: "engadget",      url: "https://www.engadget.com",                         icon: "device-mobile",       icon_color: hcc.cyan },
          ],
        },
        {
          name: "linux",
          links: [
            { name: "phoronix",      url: "https://www.phoronix.com",                         icon: "cpu",                 icon_color: hcc.cyanBright },
            { name: "lwn",           url: "https://lwn.net",                                  icon: "code",                icon_color: hcc.amber },
            { name: "fedora mag",    url: "https://fedoramagazine.org",                       icon: "brand-fedora",        icon_color: hcc.cyan },
            { name: "debian news",   url: "https://www.debian.org/News/",                     icon: "brand-debian",        icon_color: hcc.magenta },
            { name: "kernel newbies",url: "https://kernelnewbies.org/LinuxChanges",           icon: "device-desktop-cog",  icon_color: hcc.amber },
          ],
        },
        {
          name: "aggregators",
          links: [
            { name: "hackernews",    url: "https://news.ycombinator.com",                     icon: "flame",               icon_color: hcc.amber },
            { name: "lobsters",      url: "https://lobste.rs",                                icon: "fish",                icon_color: hcc.magenta },
            { name: "google news",   url: "https://news.google.com",                          icon: "news",                icon_color: hcc.cyanBright },
            { name: "ground news",   url: "https://ground.news",                              icon: "balloon",             icon_color: hcc.cyan },
          ],
        },
        {
          name: "world",
          links: [
            { name: "bbc",           url: "https://www.bbc.com/news",                         icon: "news",                icon_color: hcc.magenta },
            { name: "reuters",       url: "https://www.reuters.com",                          icon: "world",               icon_color: hcc.cyan },
            { name: "al jazeera",    url: "https://www.aljazeera.com",                        icon: "broadcast",           icon_color: hcc.amber },
            { name: "guardian",      url: "https://www.theguardian.com",                      icon: "shield",              icon_color: hcc.cyanBright },
          ],
        },
        {
          name: "subreddits",
          links: [
            { name: "r/worldnews",   url: "https://www.reddit.com/r/worldnews",               icon: "brand-reddit",        icon_color: hcc.amber },
            { name: "r/news",        url: "https://www.reddit.com/r/news",                    icon: "brand-reddit",        icon_color: hcc.cyan },
            { name: "r/technology",  url: "https://www.reddit.com/r/technology",              icon: "brand-reddit",        icon_color: hcc.cyanBright },
            { name: "r/futurology",  url: "https://www.reddit.com/r/futurology",              icon: "brand-reddit",        icon_color: hcc.magenta },
          ],
        },
      ],
    },
    {
      name: "chill",
      background_url: "src/img/banners/banner_08.gif",
      categories: [
        {
          name: "music",
          links: [
            { name: "spotify",       url: "https://open.spotify.com",                         icon: "brand-spotify",       icon_color: hcc.green },
            { name: "spotify bridge",url: "https://bridge.home/",                             icon: "broadcast",           icon_color: hcc.cyanBright },
            { name: "soundcloud",    url: "https://soundcloud.com",                           icon: "brand-soundcloud",    icon_color: hcc.amber },
            { name: "bandcamp",      url: "https://bandcamp.com",                             icon: "vinyl",               icon_color: hcc.cyan },
            { name: "last.fm",       url: "https://www.last.fm",                              icon: "music",               icon_color: hcc.magenta },
          ],
        },
        {
          name: "video",
          links: [
            { name: "youtube",       url: "https://www.youtube.com",                          icon: "brand-youtube",       icon_color: hcc.magenta },
            { name: "yt music",      url: "https://music.youtube.com",                        icon: "brand-youtube-filled",icon_color: hcc.magenta },
            { name: "twitch",        url: "https://www.twitch.tv",                            icon: "brand-twitch",        icon_color: hcc.purple },
            { name: "netflix",       url: "https://www.netflix.com",                          icon: "device-tv",           icon_color: hcc.magenta },
            { name: "plex",          url: "https://app.plex.tv",                              icon: "device-tv-old",       icon_color: hcc.amber },
          ],
        },
        {
          name: "gaming",
          links: [
            { name: "steam",         url: "https://store.steampowered.com",                   icon: "brand-steam",         icon_color: hcc.cyanBright },
            { name: "steam library", url: "https://store.steampowered.com/account/games/",    icon: "books",               icon_color: hcc.cyan },
            { name: "epic games",    url: "https://store.epicgames.com",                      icon: "device-gamepad",      icon_color: hcc.purple },
            { name: "amp panel",     url: "http://amp.home:8080",                             icon: "device-gamepad-2",    icon_color: hcc.green },
            { name: "minecraft",     url: "https://www.minecraft.net",                        icon: "cube",                icon_color: hcc.green },
          ],
        },
        {
          name: "social",
          links: [
            { name: "reddit",        url: "https://www.reddit.com",                           icon: "brand-reddit",        icon_color: hcc.amber },
            { name: "discord",       url: "https://discord.com/app",                          icon: "brand-discord",       icon_color: hcc.purple },
            { name: "x",             url: "https://x.com",                                    icon: "brand-x",             icon_color: hcc.cyanBright },
            { name: "mastodon",      url: "https://mastodon.social",                          icon: "brand-mastodon",      icon_color: hcc.cyan },
            { name: "instagram",     url: "https://www.instagram.com",                        icon: "brand-instagram",     icon_color: hcc.magenta },
          ],
        },
        {
          name: "anime",
          links: [
            { name: "anilist",       url: "https://anilist.co/home",                          icon: "list",                icon_color: hcc.cyanBright },
            { name: "myanimelist",   url: "https://myanimelist.net",                          icon: "movie",               icon_color: hcc.cyanDark },
            { name: "crunchyroll",   url: "https://www.crunchyroll.com",                      icon: "brand-finder",        icon_color: hcc.amber },
            { name: "9anime",        url: "https://9animetv.to",                              icon: "play-card",           icon_color: hcc.magenta },
            { name: "manga.tv",      url: "https://mangadex.org",                             icon: "book-2",              icon_color: hcc.cyan },
          ],
        },
        {
          name: "shop",
          links: [
            { name: "amazon",        url: "https://www.amazon.com",                           icon: "shopping-cart",       icon_color: hcc.amber },
            { name: "newegg",        url: "https://www.newegg.com",                           icon: "circuit-resistor",    icon_color: hcc.amber },
            { name: "ebay",          url: "https://www.ebay.com",                             icon: "tag",                 icon_color: hcc.green },
            { name: "aliexpress",    url: "https://www.aliexpress.com",                       icon: "plane",               icon_color: hcc.magenta },
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
