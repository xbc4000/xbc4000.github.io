
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
          return `
          <li>
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
    return `style="background-image: url(${url}); background-repeat: no-repeat; background-size: contain;"`;
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
          return `<ul class="${name}" ${Category.getBackgroundStyle(background_url)} ${index == 0 ? "active" : ""}>
            <div class="banner"></div>
            <div class="links">${Links.getAll(name, tabs)}</div>
          </ul>`;
        })
        .join("")}
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
    return [
      this.getIconResource('material'),
      this.resources.icons.tabler,
      this.getFontResource('roboto'),
      this.getFontResource('raleway'),
      this.getLibraryResource('awoo'),
    ];
  }

  /**
   * Generates component CSS styles — HCC cyberpunk aesthetic
   * @returns {string} CSS styles for the tabs component
   */
  style() {
    const h = (CONFIG.hcc || { cyan: "#00b7ff", cyanBright: "#00d4ff", cyanDark: "#0088bb", magenta: "#ff6680", amber: "#ffb347", green: "#00ff88", purple: "#b666ff" });
    return `
      /* Load JetBrains Mono so the cyberpunk look is consistent on
         machines that don't have it installed locally. Must be the
         first rule in the stylesheet for @import to apply. */
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

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
          width: 92%;
          max-width: 1280px;
          height: 520px;
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

      /* Corner bracket accents on panel */
      #panels::before,
      #panels::after {
          content: "";
          position: absolute;
          width: 24px;
          height: 24px;
          border: 2px solid ${h.cyanBright};
          pointer-events: none;
          filter: drop-shadow(0 0 8px rgba(0,212,255,0.6));
      }
      #panels::before {
          top: 4px;
          left: 4px;
          border-right: none;
          border-bottom: none;
      }
      #panels::after {
          bottom: 4px;
          right: 4px;
          border-left: none;
          border-top: none;
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
          width: 70%;
          height: 100%;
          background: rgba(10, 21, 32, 0.85);
          padding: 3em 4%;
          flex-wrap: wrap;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ${h.cyan} #0a1520;
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
          font: 500 14px 'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Consolas', monospace;
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
          border-color: ${h.cyanBright};
          background: linear-gradient(135deg, #0a1a28 0%, #102030 100%);
          box-shadow:
            0 0 20px rgba(0,183,255,0.5),
            0 0 40px rgba(0,183,255,0.2),
            inset 0 0 20px rgba(0,183,255,0.1);
          text-shadow: 0 0 8px rgba(0,212,255,0.8);
          transform: translateX(3px);
      }

      .categories ul .links a:hover::before {
          width: 4px;
          box-shadow: 0 0 16px var(--flavour), 0 0 30px var(--flavour);
      }

      /* Tab label on the left (vertical rail) */
      .categories ul::after {
          content: attr(class);
          position: absolute;
          display: flex;
          text-transform: uppercase;
          overflow-wrap: break-word;
          width: 40px;
          height: 320px;
          padding: 1em .5em;
          margin: auto;
          left: calc(15% - 50px);
          bottom: 0;
          top: 0;
          background: linear-gradient(to top, #0a1520 0%, rgba(10,21,32,0.3) 100%);
          border: 1px solid var(--flavour);
          border-left: 3px solid var(--flavour);
          box-shadow:
            0 0 20px rgba(0,183,255,0.4),
            inset 0 0 30px rgba(0,183,255,0.08);
          color: var(--flavour);
          letter-spacing: 4px;
          font: 700 22px 'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Consolas', monospace;
          text-align: center;
          flex-wrap: wrap;
          word-break: break-all;
          align-items: center;
          justify-content: center;
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
          opacity: 0.9;
          font-size: 11px;
          margin-bottom: .9em;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Consolas', monospace;
          text-shadow: 0 0 8px rgba(0,212,255,0.6);
          border-bottom: 1px solid rgba(0,212,255,0.3);
          padding-bottom: .3em;
          position: relative;
      }

      .categories .links li h1::before {
          content: "◆ ";
          color: ${h.cyanBright};
          opacity: 0.8;
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
  }
}
