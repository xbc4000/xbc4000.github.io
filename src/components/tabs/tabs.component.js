
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
        .map(({ name, links }, idx) => {
          // Each <li> gets a slug ID so the nav rail can scrollIntoView() to it
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
   * Generates the left-side category nav rail — clickable icons that
   * smooth-scroll to the matching category in the .links area. Uses the
   * first link's icon as the category glyph (so it always has something
   * sensible without needing extra config).
   */
  static getCategoryNav(tabName, tabs) {
    const { categories } = tabs.find((f) => f.name === tabName);
    return `
      <nav class="category-nav">
        ${categories
          .map(({ name, links }) => {
            const slug = name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
            const firstLink = (links && links[0]) || {};
            const iconName = firstLink.icon || 'square';
            const iconColor = firstLink.icon_color || CONFIG.palette.text;
            const label = name.toUpperCase();
            return `
              <button class="cat-nav-btn" data-target="cat-${slug}" title="${label}">
                <i class="ti ti-${iconName} cat-nav-icon" style="color:${iconColor}"></i>
                <span class="cat-nav-label">${label}</span>
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
            <div class="banner">${Links.getCategoryNav(name, tabs)}</div>
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

      /* ── Category nav rail ─────────────────────────────────────── */
      /* Lives inside .banner (the left 30% of the panel). Sticky column
         of clickable category icons that smooth-scroll to each <li> in
         the right pane. */
      .banner {
          position: absolute;
          top: 0;
          left: 0;
          width: 30%;
          height: 100%;
          z-index: 2;
      }
      .category-nav {
          position: absolute;
          top: 50%;
          right: 18px;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px 8px;
          background: linear-gradient(180deg, rgba(2,8,16,0.85) 0%, rgba(2,4,8,0.7) 100%);
          border: 1px solid rgba(0,183,255,0.45);
          box-shadow:
            0 0 18px rgba(0,183,255,0.25),
            inset 0 0 18px rgba(0,183,255,0.05);
          clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
          backdrop-filter: blur(2px);
      }
      .cat-nav-btn {
          all: unset;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 12px;
          background: rgba(0,183,255,0.05);
          border: 1px solid rgba(0,183,255,0.25);
          color: ${h.cyanBright};
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          font-weight: 600;
          text-transform: uppercase;
          transition: background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
          overflow: hidden;
      }
      .cat-nav-btn:hover {
          background: rgba(0,183,255,0.18);
          border-color: ${h.cyanBright};
          box-shadow: 0 0 14px rgba(0,212,255,0.45), inset 0 0 12px rgba(0,212,255,0.1);
          transform: translateX(-3px);
      }
      .cat-nav-btn.active {
          background: rgba(0,183,255,0.22);
          border-color: ${h.cyanBright};
          box-shadow: 0 0 14px rgba(0,212,255,0.5), inset 0 0 12px rgba(0,212,255,0.15);
      }
      .cat-nav-icon {
          font-size: 18px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 4px currentColor);
      }
      .cat-nav-label {
          font-size: 10px;
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
          overscroll-behavior: contain;
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
    // Wire up the category nav rail clicks once the DOM is in place.
    // requestAnimationFrame ensures the rendered HTML is in the tree.
    requestAnimationFrame(() => this.bindCategoryNav());
  }

  /**
   * Hooks up click handlers on .cat-nav-btn elements to smooth-scroll
   * the matching <li> in the active tab's .links scroll area into view.
   */
  bindCategoryNav() {
    const buttons = this.querySelectorAll('.cat-nav-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-target');
        if (!targetId) return;
        // Find the matching <li> within the same active tab
        const ul = btn.closest('ul');
        if (!ul) return;
        const target = ul.querySelector('#' + targetId);
        if (!target) return;
        // Find the scrollable .links parent and scroll the <li> into view
        const scroller = target.closest('.links');
        if (scroller) {
          const top = target.offsetTop - 24;
          scroller.scrollTo({ top: top, behavior: 'smooth' });
        }
        // Mark active state for visual feedback
        ul.querySelectorAll('.cat-nav-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
}
