
// Component for rendering navigation links within tabs
class Links extends Component {
  /**
   * Initialise the Links component
   */
  constructor() {
    super();
  }

  /**
   * Generates icon HTML for a link
   * @param {Object} link - Link object containing icon properties
   * @returns {string} HTML string for the icon or empty string
   */
  static getIcon(link) {
    const defaultColor = CONFIG.palette.base;

    return link.icon
      ? `<i class="ti ti-${link.icon} link-icon"
            style="color: ${link.icon_color ?? defaultColor}"></i>`
      : "";
  }

  /**
   * Generates HTML for all links in a specific tab
   * @param {string} tabName - Name of the tab to render links for
   * @param {Array} tabs - Array of tab objects
   * @returns {string} HTML string containing all links
   */
  static getAll(tabName, tabs) {
    const { categories } = tabs.find((f) => f.name === tabName);

    return `
      ${categories
        .map(({ name, links }) => {
          // Each <li> gets a slug ID so the bottom nav buttons can scroll
          // it into view. All categories are visible at once (multi-column
          // wrapped grid) — no pagination, no waste of space.
          const slug = name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
          return `
          <li id="cat-${slug}">
            <h1>${name}</h1>
              <div class="links-wrapper">
              ${links
              .map(
                (link) => `
                  <div class="link-info">
                    <a href="${link.url}" target="_blank">
                      ${Links.getIcon(link)}
                      ${link.name ? `<p class="link-name">${link.name}</p>` : ""}
                    </a>
                </div>`,
              )
              .join("")}
            </div>
          </li>`;
        })
        .join("")}
    `;
  }

  /**
   * Generates the bottom tab switcher — one button per top-level tab.
   * Click switches which <ul> is active (the existing [active] attribute
   * mechanism in the original Catppuccin design). Each button shows the
   * tab name in uppercase with the first link icon of the first category
   * as a glyph hint.
   */
  static getTabSwitcher(tabs) {
    return `
      <nav class="tab-switcher">
        ${tabs
          .map(({ name, categories }, idx) => {
            const firstLink = (categories && categories[0] && categories[0].links && categories[0].links[0]) || {};
            const iconName = firstLink.icon || 'circle';
            const iconColor = firstLink.icon_color || CONFIG.palette.text;
            const label = name.toUpperCase();
            const activeClass = idx === 0 ? ' active' : '';
            return `
              <button class="tab-switch-btn${activeClass}" data-tab="${name}" title="${label}">
                <i class="ti ti-${iconName} tab-switch-icon" style="color:${iconColor}"></i>
                <span class="tab-switch-label">${label}</span>
              </button>`;
          })
          .join("")}
      </nav>
    `;
  }
}

/**
 * Component for rendering tab categories with background styling
 */
class Category extends Component {
  /**
   * Initialise the Category component
   */
  constructor() {
    super();
  }

  /**
   * Generates background style attribute for category
   * @param {string} url - Background image URL
   * @returns {string} CSS style attribute string
   */
  static getBackgroundStyle(url) {
    // Background is applied to the <ul> but only visible through the
    // .banner div (left 30%). We no longer set it here — the .banner
    // element gets it via a data attribute + CSS instead.
    return `data-bg="${url}"`;
  }

  /**
   * Generates HTML for all tab categories
   * @param {Array} tabs - Array of tab objects
   * @returns {string} HTML string containing all categories
   */
  static getAll(tabs) {
    return `
      ${tabs
        .map(({ name, background_url }, index) => {
          return `<ul class="${name.replace(/\s+/g, '-')}" ${index == 0 ? "active" : ""}>
            <div class="banner" style="background-image:url(${background_url});background-size:cover;background-position:center;background-repeat:no-repeat;"></div>
            <div class="links">${Links.getAll(name, tabs)}</div>
          </ul>`;
        })
        .join("")}
      ${Links.getTabSwitcher(tabs)}
    `;
  }
}

/**
 * Main tabs component for displaying categorised links and navigation
 */
class Tabs extends Component {
  // CSS selector references for DOM elements
  refs = {};

  /**
   * Initialise the tabs component with configuration
   */
  constructor() {
    super();
    this.tabs = CONFIG.tabs;
  }

  /**
   * Returns CSS import dependencies for this component
   * @returns {string[]} Array of CSS file paths
   */
  imports() {
    // Only tabler icons needed — every other import was upstream Catppuccin
    // CSS (roboto, raleway, awoo, material icons) that loads asynchronously
    // into the shadow DOM. On a cold cache those <link> tags race against
    // the inline <style>, and when awoo.min.css finally loads it overrides
    // the HCC cyberpunk styles, causing the panel to flash then go black.
    // On second refresh the CSS is cached so the race is invisible.
    //
    // Our inline style() is the complete and only stylesheet for the tabs
    // component — stripping the external imports eliminates the race.
    return [
      this.resources.icons.tabler,
    ];
  }

  /**
   * Generates component CSS styles — HCC cyberpunk aesthetic
   * @returns {string} CSS styles for the tabs component
   */
  style() {
    const h = (CONFIG.hcc || { cyan: "#00b7ff", cyanBright: "#00d4ff", cyanDark: "#0088bb", magenta: "#ff6680", amber: "#ffb347", green: "#00ff88", purple: "#b666ff" });
    return `
      /* JetBrains Mono is the preferred display font but we don't @import
         it from Google Fonts anymore — that @import was render-blocking
         for the entire injected stylesheet, causing the cyberpunk styles
         to not apply until Google Fonts responded, which made the page
         render half-broken on a cold load and required a second refresh.
         The font stack falls back to Fira Code, Roboto Mono, Consolas,
         monospace — any of those produce a serviceable cyberpunk look. */

      /* ── HCC backdrop ──────────────────────────────────────────── */
      html, body {
          background: #020408 !important;
          color: ${h.cyan};
      }

      /* Full-viewport scanline + vignette overlay */
      body::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9998;
          background:
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,183,255,0.04) 2px, rgba(0,183,255,0.04) 3px),
            repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(0,183,255,0.02) 60px, rgba(0,183,255,0.02) 61px),
            radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%);
      }

      /* Moving scan line */
      body::after {
          content: "";
          position: fixed;
          left: 0;
          right: 0;
          height: 4px;
          top: 0;
          background: linear-gradient(90deg, transparent 10%, rgba(0,183,255,0.45) 30%, ${h.cyanBright} 50%, rgba(0,183,255,0.45) 70%, transparent 90%);
          box-shadow: 0 0 18px rgba(0,183,255,0.6), 0 0 40px rgba(0,183,255,0.3);
          animation: hccScanVert 6s linear infinite;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.6;
      }
      @keyframes hccScanVert {
          0%   { top: -4px; }
          100% { top: 100%; }
      }

      status-bar {
          bottom: -70px;
          height: 32px;
          background: #0a1520;
          border: 1px solid rgba(0,183,255,0.3);
          border-radius: 0;
          box-shadow: 0 0 20px rgba(0,183,255,0.2), inset 0 0 30px rgba(0,183,255,0.05);
          color: ${h.cyan};
      }

      #panels, #panels ul,
      #panels .links {
          position: absolute;
      }

      .nav {
          color: ${h.cyanBright};
          font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Consolas', monospace;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(0,183,255,0.8);
      }

      #panels {
          width: 88%;
          max-width: 1500px;
          height: 60vh;
          min-height: 540px;
          max-height: 760px;
          right: 0;
          left: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          background: #0a1520;
          border: 1px solid rgba(0,183,255,0.35);
          box-shadow:
            0 0 40px rgba(0,183,255,0.25),
            inset 0 0 80px rgba(0,183,255,0.05),
            0 10px 40px rgba(0,0,0,0.5);
          clip-path: polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px));
      }

      /* Spinning reactor ring accents at top-left and bottom-right.
         Two concentric rings: outer spins CW, inner pulse-glows. */
      #panels::before,
      #panels::after {
          content: "";
          position: absolute;
          width: 36px;
          height: 36px;
          border: 2px solid ${h.cyanBright};
          border-radius: 50%;
          border-top-color: transparent;
          border-bottom-color: transparent;
          pointer-events: none;
          filter: drop-shadow(0 0 8px rgba(0,212,255,0.6));
          animation: hccReactorSpin 4s linear infinite;
      }
      #panels::before {
          top: -18px;
          left: -18px;
      }
      #panels::after {
          bottom: -18px;
          right: -18px;
          animation-direction: reverse;
      }
      @keyframes hccReactorSpin {
          0%   { transform: rotate(0deg);   }
          100% { transform: rotate(360deg); }
      }

      .categories {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
      }

      .categories ul {
          --panelbg: transparent;
          --flavour: ${h.cyan};
          width: 100%;
          height: 100%;
          right: 100%;
          background:
            linear-gradient(135deg, rgba(0,183,255,0.03) 0%, transparent 50%, rgba(0,183,255,0.05) 100%),
            #020408;
          transition: all .6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* ── Top-level tab switcher (bottom of panel) ──────────────── */
      /* Lives inside the panel along the bottom edge — full width
         horizontal row of clickable buttons, one per top-level tab
         (HOMELAB / DEV / CHILL etc). Click toggles which <ul> has the
         [active] attribute, swapping the entire visible category set. */
      .banner {
          /* Decorative image — small, right-aligned within the left
             gutter so it sits fully inside the panel border lines. */
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 72%;
          width: 18%;
          aspect-ratio: 3 / 4;
          max-height: calc(100% - 64px - 48px);
          z-index: 0;
          pointer-events: none;
          border: 1px solid rgba(0,183,255,0.35);
          box-shadow: 0 0 14px rgba(0,183,255,0.2), inset 0 0 20px rgba(0,0,0,0.4);
          clip-path: polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px));
      }
      .tab-switcher {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 64px;
          display: flex;
          flex-direction: row;
          align-items: stretch;
          padding: 0;
          background: linear-gradient(180deg, #0b1722 0%, #0d1926 100%);
          border-top: 1px solid rgba(0,183,255,0.45);
          box-shadow: 0 -8px 24px rgba(0,183,255,0.12), inset 0 0 30px rgba(0,183,255,0.04);
          z-index: 10;
      }
      .tab-switch-btn {
          all: unset;
          cursor: pointer;
          flex: 1 1 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 0 24px;
          background: transparent;
          border: none;
          border-right: 1px solid rgba(0,183,255,0.18);
          color: ${h.cyan};
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 14px;
          letter-spacing: 4px;
          font-weight: 700;
          text-transform: uppercase;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, text-shadow 0.2s;
          white-space: nowrap;
      }
      .tab-switch-btn:last-child { border-right: none; }
      .tab-switch-btn:hover {
          background: rgba(0,183,255,0.12);
          color: ${h.cyanBright};
          box-shadow: inset 0 -2px 0 ${h.cyanBright}, inset 0 0 24px rgba(0,212,255,0.1);
          text-shadow: 0 0 6px rgba(0,212,255,0.5);
      }
      .tab-switch-btn.active {
          background: rgba(0,183,255,0.22);
          color: ${h.cyanBright};
          box-shadow: inset 0 -4px 0 ${h.cyanBright}, inset 0 0 28px rgba(0,212,255,0.18);
          text-shadow: 0 0 10px rgba(0,212,255,0.8);
      }
      .tab-switch-icon {
          font-size: 22px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 6px currentColor);
      }
      .tab-switch-label {
          font-size: 14px;
      }

      .categories ul:nth-child(1) { --flavour: ${h.cyanBright}; }
      .categories ul:nth-child(2) { --flavour: ${h.amber}; }
      .categories ul:nth-child(3) { --flavour: ${h.magenta}; }
      .categories ul:nth-child(4) { --flavour: ${h.green}; }
      .categories ul:nth-child(5) { --flavour: ${h.purple}; }

      .categories ul .links {
          box-shadow: inset -2px 0 var(--flavour), inset -3px 0 rgba(0,183,255,0.15);
      }

      .categories ul[active] {
          right: 0;
          z-index: 1;
      }

      .categories .links {
          right: 0;
          top: 0;
          width: 70%;
          height: calc(100% - 64px);  /* leave room for the bottom tab switcher */
          box-sizing: border-box;     /* padding included in height, not added to it */
          background: rgba(10, 21, 32, 0.85);
          padding: 2em 3% 1.4em;
          z-index: 2;  /* above .banner (0) so links aren't hidden by the image */
          /* CSS grid auto-fit — categories flow into as many columns as
             fit (~220px each), with rows wrapping for overflow. The whole
             container scrolls vertically if it overflows; overscroll-
             behavior:contain stops wheel events from bleeding to the
             page or the rss feeds widget. */
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          grid-auto-rows: min-content;
          gap: 1.6em 1.8em;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: ${h.cyan} #0a1520;
      }
      .categories .links > li {
          display: block;
          width: 100%;
      }

      .categories .links::-webkit-scrollbar {
          width: 8px;
      }
      .categories .links::-webkit-scrollbar-track {
          background: #0a1520;
      }
      .categories .links::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${h.cyan}, ${h.cyanDark});
          box-shadow: 0 0 8px rgba(0,183,255,0.6);
      }

      .categories .links li {
          list-style: none;
      }

      .categories ul .links a {
          color: ${h.cyan};
          text-decoration: none;
          font: 500 16px 'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Consolas', monospace;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all .18s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          padding: .5em .85em;
          background: linear-gradient(135deg, #061018 0%, #0a1520 100%);
          border: 1px solid rgba(0,183,255,0.25);
          border-left: 2px solid var(--flavour);
          box-shadow:
            0 0 0 rgba(0,183,255,0.4),
            inset 0 0 12px rgba(0,183,255,0.05);
          margin-bottom: .6em;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
          position: relative;
      }

      .categories ul .links a::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--flavour);
          box-shadow: 0 0 8px var(--flavour);
          transition: all .2s;
      }

      .categories .link-info {
          display: inline-flex;
      }

      .categories .link-info:not(:last-child) { margin-right: .5em; }

      .categories ul .links a:hover {
          color: ${h.cyanBright};
          border-color: var(--flavour);
          background: linear-gradient(135deg, #0a1a28 0%, #142838 100%);
          box-shadow:
            0 0 24px var(--flavour),
            0 0 48px rgba(0,183,255,0.25),
            inset 0 0 24px rgba(0,212,255,0.12);
          text-shadow: 0 0 10px var(--flavour), 0 0 18px rgba(0,212,255,0.5);
          transform: translateX(4px) translateY(-1px);
      }

      .categories ul .links a:hover::before {
          width: 5px;
          box-shadow: 0 0 18px var(--flavour), 0 0 36px var(--flavour);
      }

      /* Sweep highlight on hover — diagonal gradient that slides across */
      .categories ul .links a::after {
          content: "";
          position: absolute;
          top: 0;
          left: -80%;
          width: 60%;
          height: 100%;
          background: linear-gradient(105deg, transparent 30%, rgba(0,212,255,0.18) 50%, transparent 70%);
          pointer-events: none;
          transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .categories ul .links a:hover::after {
          left: 130%;
      }

      /* Tab label on the left (vertical rail) */
      .categories ul::after {
          content: attr(class);
          position: absolute;
          display: none;  /* hidden by default — only [active] tab shows its label */
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
          /* writing-mode stacks chars vertically, text-orientation keeps
             each letter upright instead of sideways */
          writing-mode: vertical-rl;
          text-orientation: upright;
          width: 48px;
          height: 320px;
          padding: 1em 0;
          margin: auto;
          left: calc(15% - 54px);
          bottom: 0;
          top: 0;
          background: linear-gradient(to top, #0a1520 0%, rgba(10,21,32,0.3) 100%);
          border: 1px solid var(--flavour);
          border-left: 3px solid var(--flavour);
          box-shadow:
            0 0 20px rgba(0,183,255,0.4),
            inset 0 0 30px rgba(0,183,255,0.08);
          color: var(--flavour);
          letter-spacing: 8px;
          font: 700 20px 'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Consolas', monospace;
          text-align: center;
          text-shadow: 0 0 10px var(--flavour), 0 0 20px rgba(0,183,255,0.4);
          clip-path: polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
      }

      .categories .links li:not(:last-child) {
          border-bottom: 1px dashed rgba(0,183,255,0.2);
          padding: 0 0 .6em 0;
          margin-bottom: 1.2em;
      }

      .categories .links li h1 {
          color: ${h.cyanBright};
          opacity: 0.95;
          font-size: 12px;
          margin-bottom: 1em;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Consolas', monospace;
          text-shadow: 0 0 10px var(--flavour), 0 0 20px rgba(0,212,255,0.4);
          border-bottom: 1px solid var(--flavour);
          padding: .2em 0 .4em .4em;
          position: relative;
          background: linear-gradient(90deg, rgba(0,183,255,0.08) 0%, transparent 100%);
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
      }

      .categories .links li h1::before {
          content: "◆ ";
          color: var(--flavour);
          opacity: 1;
          text-shadow: 0 0 8px var(--flavour);
      }
      .categories .links li h1::after {
          content: "";
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background: var(--flavour);
          box-shadow: 0 0 8px var(--flavour);
          border-radius: 50%;
          animation: hccBlink 2s ease-in-out infinite;
      }
      @keyframes hccBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
      }

      .categories .link-icon {
          font-size: 20px;
          color: ${h.cyan};
          filter: drop-shadow(0 0 4px currentColor);
      }

      .categories .link-icon + .link-name {
          margin-left: 10px;
      }

      .categories .links-wrapper {
          display: flex;
          flex-wrap: wrap;
      }

      .ti {
          animation: fadeInAnimation ease .5s;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          height: 22px;
          width: 22px;
      }

      @keyframes fadeInAnimation {
          0% {
              opacity: 0;
              filter: blur(3px) drop-shadow(0 0 0 currentColor);
          }
          100% {
              opacity: 1;
              filter: blur(0) drop-shadow(0 0 4px currentColor);
          }
      }

      /* Subtle pulse on active tab label */
      .categories ul[active]::after {
          display: flex;  /* override the default display:none */
          animation: hccPulse 2.5s ease-in-out infinite;
      }
      @keyframes hccPulse {
          0%, 100% {
              box-shadow:
                0 0 20px rgba(0,183,255,0.4),
                inset 0 0 30px rgba(0,183,255,0.08);
          }
          50% {
              box-shadow:
                0 0 35px rgba(0,183,255,0.7),
                0 0 55px rgba(0,183,255,0.3),
                inset 0 0 40px rgba(0,183,255,0.15);
          }
      }
    `;
  }

  /**
   * Generates HTML template for the tabs component
   * @returns {string} HTML template with panels and categories
   */
  template() {
    return `
      <div id="links" class="-">

        <div id="panels">
          <div class="categories">
            ${Category.getAll(this.tabs)}
            <search-bar></search-bar>
          </div>
          <status-bar class="!-"></status-bar>
        </div>
      </div>
    `;
  }

  /**
   * Component lifecycle callback when element is connected to DOM
   */
  connectedCallback() {
    this.render();
    requestAnimationFrame(() => {
      this.bindTabSwitcher();
      this.addPanelRainBorders();
    });
  }

  /**
   * Adds thin hex-text rain strips along the left and right inner
   * edges of the #panels container. Each strip has 2-3 columns of
   * falling hex chars. Pure DOM + CSS animation, no canvas.
   */
  addPanelRainBorders() {
    const root = this.shadowRoot || this;
    const panels = root.querySelector('#panels');
    if (!panels || panels.querySelector('.panel-rain')) return;

    const HEX = '0123456789ABCDEF>|.:[]{}◆◇●○';
    const COLS = 2;

    ['left', 'right'].forEach((side) => {
      const strip = document.createElement('div');
      strip.className = 'panel-rain panel-rain-' + side;
      strip.style.cssText = [
        'position:absolute',
        'top:0',
        side + ':0',
        'width:24px',
        'height:100%',
        'pointer-events:none',
        'z-index:3',
        'overflow:hidden',
        'opacity:0.45'
      ].join(';');

      for (let i = 0; i < COLS; i++) {
        const col = document.createElement('div');
        col.style.cssText = [
          'position:absolute',
          'top:-100%',
          'left:' + (4 + i * 10) + 'px',
          'font-family:"JetBrains Mono","Fira Code",monospace',
          'font-size:9px',
          'color:#00B7FF',
          'line-height:11px',
          'white-space:pre',
          'writing-mode:vertical-lr',
          'text-orientation:mixed',
          'letter-spacing:3px',
          'text-shadow:0 0 4px rgba(0,183,255,0.5)'
        ].join(';');

        let str = '';
        for (let j = 0; j < 80; j++) {
          str += HEX[Math.floor(Math.random() * HEX.length)];
        }
        col.textContent = str;

        const dur = 18 + Math.random() * 16;
        const delay = -Math.random() * dur;
        col.style.animation = 'hccPanelRain ' + dur + 's linear ' + delay + 's infinite';
        strip.appendChild(col);
      }
      panels.appendChild(strip);
    });

    // Inject keyframe if not present
    if (!root.querySelector('#panel-rain-style')) {
      const s = document.createElement('style');
      s.id = 'panel-rain-style';
      s.textContent = '@keyframes hccPanelRain{0%{top:-20%}100%{top:120%}}';
      (this.shadowRoot || document.head).appendChild(s);
    }
  }

  /**
   * Hooks up click handlers on .tab-switch-btn elements to switch which
   * top-level tab is active. Each click toggles the [active] attribute
   * on the matching <ul class="<tabname>"> — the existing Catppuccin
   * tab switching mechanism. The button itself gets .active for visual
   * feedback.
   */
  bindTabSwitcher() {
    const root = this.shadowRoot || this;
    const buttons = root.querySelectorAll('.tab-switch-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = btn.getAttribute('data-tab');
        if (!tabName) return;
        // Toggle [active] on every top-level <ul> in the categories container
        const allTabs = root.querySelectorAll('.categories > ul');
        allTabs.forEach((ul) => ul.removeAttribute('active'));
        const targetUl = root.querySelector('.categories > ul.' + tabName.replace(/\s+/g, '-'));
        if (targetUl) targetUl.setAttribute('active', '');
        // Toggle .active on every nav button
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
}
