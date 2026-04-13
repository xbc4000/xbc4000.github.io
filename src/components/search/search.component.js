// Search component for handling search functionality with multiple engines
class Search extends Component {
  // References to DOM elements for the search component
  refs = {
    search: '#search',
    input: '#search input[type="text"]',
    engines: '.search-engines',
    close: '.close',
    suggestions: '.search-suggestions',
    clearHistory: '.clear-history'
  };

  /**
   * Initialise the search component with configured engines
   */
  constructor() {
    super();

    this.engines = CONFIG.search.engines;
    this.suggestions = [];
    this.selectedSuggestion = -1;
    this.suggestionsEnabled = false; // Feature flag to disable suggestions
  }

  /**
   * Define the style for the search component using the current palette
   * @returns {string} CSS styles for the search component
   */
  style() {
    const h = CONFIG.hcc || {};
    const cyan = h.cyan || '#00b7ff';
    const cyanBright = h.cyanBright || '#00d4ff';
    const cyanGlow = h.cyanGlow || '#0ffff4';
    return `
      #search {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(2,4,8,0.85);
          backdrop-filter: blur(8px);
          z-index: 10000;
          visibility: hidden;
          opacity: 0;
          transition: opacity .25s ease, visibility .25s ease;
      }
      #search.active {
          visibility: visible;
          opacity: 1;
      }

      #search div {
          position: relative;
          width: clamp(320px, 40vw, 700px);
      }

      #search input {
          border: 0;
          outline: 0;
          width: 100%;
          padding: 14px 40px 14px 0;
          background: none;
          font: 500 clamp(16px, 1.4vw, 22px) 'JetBrains Mono', 'Fira Code', monospace;
          letter-spacing: 2px;
          color: ${cyanBright};
          border-bottom: 2px solid rgba(0,183,255,0.4);
          caret-color: ${cyanGlow};
          text-shadow: 0 0 6px rgba(0,212,255,0.4);
      }
      #search input::placeholder {
          color: rgba(0,183,255,0.35);
          letter-spacing: 4px;
          text-transform: uppercase;
      }
      #search input:focus {
          border-bottom-color: ${cyanBright};
          box-shadow: 0 2px 20px rgba(0,183,255,0.2);
      }
      #search input::selection {
          background: rgba(0,183,255,0.3);
          color: #fff;
      }

      #search .close {
          background: 0;
          border: 0;
          outline: 0;
          color: ${cyan};
          position: absolute;
          right: 0;
          top: 14px;
          cursor: pointer;
          font-size: 18px;
          opacity: 0.6;
          transition: opacity .2s, color .2s, text-shadow .2s;
      }
      #search .close:hover {
          opacity: 1;
          color: ${cyanBright};
          text-shadow: 0 0 8px ${cyanGlow};
      }

      .search-engines {
          list-style: none;
          display: flex;
          padding: 0;
          margin: 12px 0 0 0;
          gap: 16px;
      }
      .search-engines li p {
          cursor: pointer;
          font: 600 11px 'JetBrains Mono', monospace;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(0,183,255,0.4);
          transition: color .2s, text-shadow .2s;
      }
      .search-engines li.active p {
          color: ${cyanBright};
          text-shadow: 0 0 6px rgba(0,212,255,0.5);
      }

      .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 100;
          background: rgba(2,8,16,0.9);
          border: 1px solid rgba(0,183,255,0.3);
          display: none;
          scrollbar-width: thin;
          scrollbar-color: ${cyan} transparent;
      }
      .search-suggestions.active { display: block; }

      .search-suggestion {
          padding: 10px 14px;
          cursor: pointer;
          color: ${cyan};
          border-bottom: 1px solid rgba(0,183,255,0.15);
          font: 13px 'JetBrains Mono', monospace;
          transition: background .2s, color .2s;
      }
      .search-suggestion:last-child { border-bottom: none; }
      .search-suggestion:hover,
      .search-suggestion.selected {
          background: rgba(0,183,255,0.12);
          color: ${cyanBright};
      }
      .search-suggestion .url {
          color: rgba(0,183,255,0.4);
          font-size: 11px;
          margin-top: 3px;
      }
      .search-suggestion .title {
          font-weight: 600;
          margin-bottom: 2px;
      }

      .clear-history {
          background: none;
          border: 0;
          outline: 0;
          color: rgba(0,183,255,0.4);
          position: absolute;
          right: 30px;
          top: 14px;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          transition: color .2s;
          display: none;
      }
      .clear-history:hover { color: #ff6680; }
      .clear-history.visible { display: block; }
    `;
  }

  /**
   * Import required fonts and icons for the search display
   * @returns {Array<string>} Array of resource imports
   */
  imports() {
    return [];
  }

  /**
   * Render the search overlay template
   * @returns {string} HTML template for the search component
   */
  template() {
    return `
        <div id="search">
          <div>
            <input type="text" spellcheck="false" placeholder="search perplexity...">
            <button class="close">✕</button>
            <button class="clear-history" title="Clear search history">×</button>
            <ul class="search-engines"></ul>
            <div class="search-suggestions"></div>
          </div>
        </div>
    `;
  }

  /**
   * Load available search engines into the interface
   * @returns {void}
   */
  loadEngines() {
    for (var key in this.engines)
      this.refs.engines.innerHTML += `<li><p title="${this.engines[key][1]}">!${key}</p></li>`;
  }

  /**
   * Activate the search overlay
   * @returns {void}
   */
  activate() {
    this.refs.search.classList.add('active');
    this.refs.input.scrollIntoView();
    setTimeout(() => this.refs.input.focus(), 100);
  }

  /**
   * Deactivate the search overlay
   * @returns {void}
   */
  deactivate() {
    this.refs.search.classList.remove('active');
  }

  /**
   * Check if the input is a valid URL
   * @param {string} input - The input string to check
   * @returns {boolean} True if the input is a valid URL
   */
  isValidUrl(input) {
    // Check for common URL patterns
    const urlPatterns = [
      // Domain with TLD (e.g., google.com, github.com)
      /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/,
      // Full URLs with protocol
      /^https?:\/\/.+/,
      // URLs with www prefix
      /^www\..+/,
      // IP addresses
      /^(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?$/,
      // localhost with optional port
      /^localhost(:\d+)?(\/.*)?$/
    ];

    return urlPatterns.some(pattern => pattern.test(input.trim()));
  }

  /**
   * Format URL for navigation
   * @param {string} url - The URL to format
   * @returns {string} Properly formatted URL with protocol
   */
  formatUrl(url) {
    url = url.trim();

    // If it already has a protocol, use as is
    if (/^https?:\/\//.test(url)) {
      return url;
    }

    // If it starts with www, add https
    if (/^www\./.test(url)) {
      return `https://${url}`;
    }

    // If it's localhost or IP, use http by default
    if (/^localhost/.test(url) || /^(\d{1,3}\.){3}\d{1,3}/.test(url)) {
      return `http://${url}`;
    }

    // For domain names, add https
    return `https://${url}`;
  }

  /**
   * Search local history for matching entries
   * @param {string} query - The search query
   * @returns {Array} Array of matching history entries
   */
  searchHistory(query) {
    if (!query || query.length < 2) {
      return [];
    }

    return this.searchLocalHistory(query);
  }

  /**
   * Search local history stored in localStorage
   * @param {string} query - The search query
   * @returns {Array} Array of matching entries
   */
  searchLocalHistory(query) {
    try {
      const localHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
      const queryLower = query.toLowerCase();

      return localHistory
        .filter(item =>
          item.url.toLowerCase().includes(queryLower) ||
          (item.title && item.title.toLowerCase().includes(queryLower))
        )
        .slice(0, 8);
    } catch (error) {
      return [];
    }
  }

  /**
   * Save a URL to local history
   * @param {string} url - The URL to save
   * @param {string} title - The page title (optional)
   * @returns {void}
   */
  saveToLocalHistory(url, title = '') {
    // Don't save to history if suggestions are disabled
    if (!this.suggestionsEnabled) {
      return;
    }

    try {
      const localHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
      const newEntry = { url, title: title || url, timestamp: Date.now() };

      // Remove if already exists
      const filtered = localHistory.filter(item => item.url !== url);

      // Add to beginning and limit to 50 entries
      filtered.unshift(newEntry);
      const limited = filtered.slice(0, 50);

      localStorage.setItem('search_history', JSON.stringify(limited));
    } catch (error) {
      console.log('Could not save to local history');
    }
  }

  /**
   * Clear all local history
   * @returns {void}
   */
  clearLocalHistory() {
    try {
      localStorage.removeItem('search_history');
      console.log('Local search history cleared');
      this.hideSuggestions();
      this.updateClearHistoryButton();
    } catch (error) {
      console.log('Could not clear local history');
    }
  }

  /**
   * Update the visibility of the clear history button
   * @returns {void}
   */
  updateClearHistoryButton() {
    // Only show clear history button if suggestions are enabled
    if (!this.suggestionsEnabled) {
      this.refs.clearHistory.classList.remove('visible');
      return;
    }

    try {
      const history = JSON.parse(localStorage.getItem('search_history') || '[]');
      if (history.length > 0) {
        this.refs.clearHistory.classList.add('visible');
      } else {
        this.refs.clearHistory.classList.remove('visible');
      }
    } catch (error) {
      this.refs.clearHistory.classList.remove('visible');
    }
  }

  /**
   * Display search suggestions
   * @param {Array} suggestions - Array of suggestion objects
   * @returns {void}
   */
  displaySuggestions(suggestions) {
    // Feature disabled - early return
    if (!this.suggestionsEnabled) {
      return;
    }

    this.suggestions = suggestions;
    this.selectedSuggestion = -1;

    if (suggestions.length === 0) {
      this.refs.suggestions.classList.remove('active');
      return;
    }

    const suggestionsHtml = suggestions.map((suggestion, index) => {
      const title = suggestion.title || suggestion.url;
      const displayUrl = suggestion.url.replace(/^https?:\/\//, '');

      return `
        <div class="search-suggestion" data-index="${index}" data-url="${suggestion.url}">
          <div class="title">${this.escapeHtml(title)}</div>
          <div class="url">${this.escapeHtml(displayUrl)}</div>
        </div>
      `;
    }).join('');

    this.refs.suggestions.innerHTML = suggestionsHtml;
    this.refs.suggestions.classList.add('active');
    this.updateClearHistoryButton();

    // Add click event listeners to suggestions
    this.refs.suggestions.querySelectorAll('.search-suggestion').forEach((suggestion, index) => {
      suggestion.addEventListener('click', () => {
        this.selectSuggestion(index);
      });
    });
  }

  /**
   * Select a suggestion by index
   * @param {number} index - The index of the suggestion to select
   * @returns {void}
   */
  selectSuggestion(index) {
    if (index >= 0 && index < this.suggestions.length) {
      const suggestion = this.suggestions[index];
      this.saveToLocalHistory(suggestion.url, suggestion.title);
      window.location = suggestion.url;
    }
  }

  /**
   * Highlight a suggestion
   * @param {number} index - The index of the suggestion to highlight
   * @returns {void}
   */
  highlightSuggestion(index) {
    // Remove previous selection
    this.refs.suggestions.querySelectorAll('.search-suggestion').forEach(el => {
      el.classList.remove('selected');
    });

    if (index >= 0 && index < this.suggestions.length) {
      this.selectedSuggestion = index;
      const suggestion = this.refs.suggestions.children[index];
      if (suggestion) {
        suggestion.classList.add('selected');
        // Update input with the URL
        this.refs.input.value = this.suggestions[index].url.replace(/^https?:\/\//, '');
      }
    } else {
      this.selectedSuggestion = -1;
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Hide suggestions
   * @returns {void}
   */
  hideSuggestions() {
    this.refs.suggestions.classList.remove('active');
    this.suggestions = [];
    this.selectedSuggestion = -1;
  }

  /**
   * Handle search input and engine selection
   * @param {KeyboardEvent} event - The keyboard event from user input
   * @returns {void}
   */
  handleSearch(event) {
    const { target, key } = event;

    let args = target.value.split(' ');
    let prefix = args[0];

    // Get default engine from config, fallback to 'd' if not specified
    const defaultEngineKey = CONFIG.search.default || 'd';
    let defaultEngine = this.engines[defaultEngineKey]?.[0] || this.engines['d'][0];
    let engine = defaultEngine;

    // Handle special keys first
    if (key === 'ArrowDown') {
      event.preventDefault();
      if (this.suggestions.length > 0) {
        this.highlightSuggestion(Math.min(this.selectedSuggestion + 1, this.suggestions.length - 1));
      }
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      if (this.suggestions.length > 0) {
        this.highlightSuggestion(Math.max(this.selectedSuggestion - 1, -1));
      }
      return;
    }

    if (key === 'Escape') {
      this.hideSuggestions();
      this.deactivate();
      return;
    }

    // Clear history with Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === 'Delete') {
      event.preventDefault();
      this.clearLocalHistory();
      this.hideSuggestions();
      return;
    }

    // Highlight active engine based on prefix
    this.refs.engines.childNodes.forEach(engine => {
      if (prefix === engine.firstChild.innerHTML)
        engine.classList.add('active');
      else
        engine.classList.remove('active');
    });

    // Handle Enter key for search execution
    if (key === 'Enter') {
      // If a suggestion is selected, use it
      if (this.selectedSuggestion >= 0 && this.selectedSuggestion < this.suggestions.length) {
        this.selectSuggestion(this.selectedSuggestion);
        return;
      }

      const fullInput = target.value.trim();

      // Check if input is a URL first
      if (this.isValidUrl(fullInput)) {
        // Navigate directly to the URL
        const formattedUrl = this.formatUrl(fullInput);
        this.saveToLocalHistory(formattedUrl);
        window.location = formattedUrl;
        return;
      }

      // Check for engine prefix (e.g., !g for Google)
      if (prefix.indexOf('!') === 0) {
        engine = this.engines[prefix.substr(1)][0];
        args = args.slice(1);
      }

      // Navigate to search results
      window.location = engine + encodeURI(args.join(' '));
      return;
    }

    // For other keys, search history for suggestions
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Enter' && key !== 'Escape') {
      // Only search for suggestions if feature is enabled
      if (this.suggestionsEnabled) {
        const results = this.searchHistory(target.value);
        this.displaySuggestions(results);
      }
    }
  }

  /**
   * Set up event listeners for search interactions
   * @returns {void}
   */
  setEvents() {
    this.refs.search.onkeyup = (e) => this.handleSearch(e);
    this.refs.search.onkeydown = (e) => {
      // Prevent default behavior for arrow keys to avoid moving cursor
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    };
    this.refs.close.onclick = () => {
      this.hideSuggestions();
      this.deactivate();
    };
    this.refs.clearHistory.onclick = () => {
      this.clearLocalHistory();
    };

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.refs.search.contains(e.target)) {
        this.hideSuggestions();
      }
    });

    // Handle input blur
    this.refs.input.addEventListener('blur', () => {
      // Delay hiding suggestions to allow for click events
      setTimeout(() => {
        this.hideSuggestions();
      }, 150);
    });
  }

  /**
   * Initialise the search component when connected to DOM
   * @returns {void}
   */
  connectedCallback() {
    this.render();
    this.loadEngines();
    this.setEvents();
    this.initializeLocalHistory();
    this.updateClearHistoryButton();
  }

  /**
   * Initialize local history with some sample data if empty
   * @returns {void}
   */
  initializeLocalHistory() {
    try {
      const existingHistory = localStorage.getItem('search_history');
      if (!existingHistory) {
        const sampleHistory = [
          { url: 'https://github.com', title: 'GitHub', timestamp: Date.now() - 86400000 },
          { url: 'https://stackoverflow.com', title: 'Stack Overflow', timestamp: Date.now() - 172800000 },
          { url: 'https://developer.mozilla.org', title: 'MDN Web Docs', timestamp: Date.now() - 259200000 },
          { url: 'https://www.google.com', title: 'Google', timestamp: Date.now() - 345600000 },
          { url: 'https://news.ycombinator.com', title: 'Hacker News', timestamp: Date.now() - 432000000 }
        ];
        localStorage.setItem('search_history', JSON.stringify(sampleHistory));
      }
    } catch (error) {
      console.log('Could not initialize local history');
    }
  }
}
