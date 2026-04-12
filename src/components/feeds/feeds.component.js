// =============================================================================
// HCC Tech Feeds — live tech / linux / homelab news from CORS-open sources
// =============================================================================
// Bottom-right widget that aggregates real news items from sources tied to
// the user's actual stack:
//
//   - r/selfhosted   (Reddit JSON, CORS-open)
//   - r/homelab      (Reddit JSON, CORS-open)
//   - r/linux        (Reddit JSON, CORS-open)
//   - r/mikrotik     (Reddit JSON, CORS-open)
//   - Hacker News    (Algolia API, CORS-open)
//
// All sources are queried directly — no scraping, no proxy, no API key.
// Refreshed every 5 minutes. Hover an item to see source + age, click to
// open. Keyboard-accessible.
// =============================================================================

(function () {
    'use strict';

    var HCC_CYAN        = '#00B7FF';
    var HCC_CYAN_BRIGHT = '#00D4FF';
    var HCC_MAGENTA     = '#FF6680';
    var HCC_AMBER       = '#FFB347';

    var POLL_MS = 5 * 60 * 1000;  // 5 minutes
    var Z       = 9996;

    // Sources — each returns Promise<Array<{title, url, source, ts}>>
    var SOURCES = [
        { name: 'r/selfhosted',    tag: 'selfhost', color: HCC_CYAN_BRIGHT,
          fetch: function () { return reddit('selfhosted'); } },
        { name: 'r/homelab',       tag: 'homelab',  color: HCC_CYAN,
          fetch: function () { return reddit('homelab'); } },
        { name: 'r/linux',         tag: 'linux',    color: HCC_AMBER,
          fetch: function () { return reddit('linux'); } },
        { name: 'r/mikrotik',      tag: 'mikrotik', color: HCC_AMBER,
          fetch: function () { return reddit('mikrotik'); } },
        { name: 'r/docker',        tag: 'docker',   color: HCC_CYAN,
          fetch: function () { return reddit('docker'); } },
        { name: 'r/grafana',       tag: 'grafana',  color: HCC_AMBER,
          fetch: function () { return reddit('grafana'); } },
        { name: 'r/pihole',        tag: 'pihole',   color: HCC_CYAN_BRIGHT,
          fetch: function () { return reddit('pihole'); } },
        { name: 'r/raspberry_pi',  tag: 'rpi',      color: HCC_MAGENTA,
          fetch: function () { return reddit('raspberry_pi'); } },
        { name: 'HN',              tag: 'hn',       color: HCC_MAGENTA,
          fetch: function () { return hackerNews(); } }
    ];

    function reddit(sub) {
        return fetch('https://www.reddit.com/r/' + sub + '/.json?limit=8&raw_json=1', {
            cache: 'no-store'
        }).then(function (r) {
            if (!r.ok) throw new Error('reddit ' + r.status);
            return r.json();
        }).then(function (j) {
            var posts = (j && j.data && j.data.children) || [];
            return posts.map(function (p) {
                var d = p.data || {};
                return {
                    title:  d.title || '(untitled)',
                    url:    'https://www.reddit.com' + (d.permalink || ''),
                    source: 'r/' + sub,
                    ts:     (d.created_utc || 0) * 1000
                };
            });
        });
    }

    function hackerNews() {
        return fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=10', {
            cache: 'no-store'
        }).then(function (r) {
            if (!r.ok) throw new Error('hn ' + r.status);
            return r.json();
        }).then(function (j) {
            var hits = (j && j.hits) || [];
            return hits.map(function (h) {
                return {
                    title:  h.title || '(untitled)',
                    url:    h.url || ('https://news.ycombinator.com/item?id=' + h.objectID),
                    source: 'HN',
                    ts:     h.created_at_i ? h.created_at_i * 1000 : 0
                };
            });
        });
    }

    function fmtAge(ts) {
        if (!ts) return '?';
        var dt = Date.now() - ts;
        var s = Math.floor(dt / 1000);
        if (s < 60) return s + 's';
        var m = Math.floor(s / 60);
        if (m < 60) return m + 'm';
        var h = Math.floor(m / 60);
        if (h < 24) return h + 'h';
        var d = Math.floor(h / 24);
        return d + 'd';
    }

    function init() {
        var card = document.createElement('div');
        card.id = 'hcc-feeds';
        card.style.cssText = [
            'position:fixed',
            'bottom:60px',
            'left:24px',
            'right:24px',
            'height:62px',
            'pointer-events:auto',
            'z-index:' + Z,
            'font-family:"JetBrains Mono","Fira Code",monospace',
            'color:' + HCC_CYAN_BRIGHT,
            'background:linear-gradient(180deg, rgba(2,8,16,0.82) 0%, rgba(2,4,8,0.7) 100%)',
            'border:1px solid rgba(0,183,255,0.55)',
            'box-shadow:0 0 22px rgba(0,183,255,0.22), 0 0 50px rgba(0,183,255,0.08), inset 0 0 24px rgba(0,183,255,0.05)',
            'text-shadow:0 0 4px rgba(0,212,255,0.45)',
            'backdrop-filter:blur(3px)',
            'clip-path:polygon(10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px),0 10px)',
            'display:flex',
            'flex-direction:row'
        ].join(';');

        // Compact header rail on the left edge — single-line label + status
        var header = document.createElement('div');
        header.style.cssText = [
            'flex-shrink:0',
            'background:rgba(0,183,255,0.08)',
            'border-right:1px solid rgba(0,183,255,0.35)',
            'display:flex',
            'flex-direction:column',
            'align-items:flex-start',
            'justify-content:center',
            'gap:3px',
            'padding:0 18px',
            'font-size:11px',
            'letter-spacing:2px'
        ].join(';');
        var headerLeft = document.createElement('span');
        headerLeft.innerHTML = '◆ FEEDS';
        headerLeft.style.cssText = 'color:' + HCC_CYAN + ';font-weight:700';
        var headerRight = document.createElement('span');
        headerRight.id = 'hcc-feeds-status';
        headerRight.textContent = '...';
        headerRight.style.cssText = [
            'color:' + HCC_CYAN_BRIGHT,
            'font-size:9px',
            'opacity:0.75'
        ].join(';');
        header.appendChild(headerLeft);
        header.appendChild(headerRight);

        // Body — horizontal-scrolling row of single-line list items
        var list = document.createElement('div');
        list.id = 'hcc-feeds-list';
        list.style.cssText = [
            'overflow-x:auto',
            'overflow-y:hidden',
            'overscroll-behavior:contain',
            'flex:1',
            'display:flex',
            'flex-direction:row',
            'align-items:center',
            'gap:0',
            'padding:0',
            'scrollbar-width:thin',
            'scrollbar-color:' + HCC_CYAN + ' transparent'
        ].join(';');

        // Single-line list item style — like the original list view but
        // arranged horizontally. Each item is one row: tag · age · title.
        var sbStyle = document.createElement('style');
        sbStyle.textContent = [
            '#hcc-feeds-list::-webkit-scrollbar{height:6px}',
            '#hcc-feeds-list::-webkit-scrollbar-track{background:transparent}',
            '#hcc-feeds-list::-webkit-scrollbar-thumb{background:' + HCC_CYAN + ';box-shadow:0 0 6px rgba(0,183,255,0.5)}',
            '.hcc-feed-item{display:inline-flex;flex-shrink:0;align-items:center;gap:10px;height:62px;padding:0 18px;text-decoration:none;color:' + HCC_CYAN_BRIGHT + ';border-right:1px solid rgba(0,183,255,0.15);transition:background 0.2s}',
            '.hcc-feed-item:hover{background:rgba(0,183,255,0.1)}',
            '.hcc-feed-item-tag{padding:2px 8px;border:1px solid currentColor;font-weight:700;font-size:9px;letter-spacing:1px;flex-shrink:0}',
            '.hcc-feed-item-age{font-size:9px;letter-spacing:1px;opacity:0.6;flex-shrink:0;color:' + HCC_CYAN + '}',
            '.hcc-feed-item-title{font-size:12px;color:' + HCC_CYAN_BRIGHT + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:380px;font-weight:500}'
        ].join('\n');
        document.head.appendChild(sbStyle);

        card.appendChild(header);
        card.appendChild(list);
        document.body.appendChild(card);

        // ── Fetch + render ────────────────────────────────────────
        function setStatus(text, color) {
            headerRight.textContent = text;
            headerRight.style.color = color;
        }

        function render(items) {
            // Sort by ts desc
            items.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
            // Cap at 60 — list is scrollable so this is fine
            items = items.slice(0, 60);

            list.innerHTML = '';
            items.forEach(function (item) {
                var src = SOURCES.find(function (s) { return s.name === item.source || s.tag === item.source.replace('r/', '').toLowerCase(); });
                var color = src ? src.color : HCC_CYAN;

                var a = document.createElement('a');
                a.href = item.url;
                a.target = '_blank';
                a.rel = 'noopener';
                a.className = 'hcc-feed-item';

                var tag = document.createElement('span');
                tag.className = 'hcc-feed-item-tag';
                tag.textContent = item.source;
                tag.style.color = color;

                var age = document.createElement('span');
                age.className = 'hcc-feed-item-age';
                age.textContent = fmtAge(item.ts);

                var title = document.createElement('span');
                title.className = 'hcc-feed-item-title';
                title.textContent = item.title;

                a.appendChild(tag);
                a.appendChild(age);
                a.appendChild(title);
                list.appendChild(a);
            });
        }

        function poll() {
            setStatus('FETCHING', HCC_AMBER);

            // Fire all sources in parallel; tolerate individual failures.
            var promises = SOURCES.map(function (s) {
                return s.fetch().catch(function (e) {
                    console.warn('[hcc-feeds] ' + s.name + ' failed:', e);
                    return [];
                });
            });

            Promise.all(promises).then(function (results) {
                var all = [];
                results.forEach(function (arr) { all = all.concat(arr); });
                if (all.length === 0) {
                    setStatus('ALL FAILED', HCC_MAGENTA);
                    return;
                }
                render(all);
                var nFailed = results.filter(function (r) { return r.length === 0; }).length;
                if (nFailed === 0) {
                    setStatus(all.length + ' ITEMS', HCC_CYAN_BRIGHT);
                } else {
                    setStatus(all.length + ' ITEMS · ' + nFailed + ' DOWN', HCC_AMBER);
                }
            });
        }

        poll();
        setInterval(poll, POLL_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
