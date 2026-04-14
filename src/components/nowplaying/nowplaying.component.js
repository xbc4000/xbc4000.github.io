// =============================================================================
// HCC Now Playing — live Spotify Connect status from hcc-spotify-bridge
// =============================================================================
// Fetches https://bridge.home/status every 3s and renders a fixed bottom-left
// card with the current track, artist, album, progress bar, volume, and play
// state. All real data — no fake placeholder track when nothing is playing,
// the card just shows IDLE.
//
// Only mounts when the page is loaded from a .home origin (or any RFC1918
// host) — there's no point fetching from outside the LAN.
// =============================================================================

(function () {
    'use strict';

    var HCC_CYAN        = '#00B7FF';
    var HCC_CYAN_BRIGHT = '#00D4FF';
    var HCC_MAGENTA     = '#FF6680';
    var HCC_AMBER       = '#FFB347';

    // Same-origin proxy on Caddy: startpage.home/bridge/* → bridge container.
    // Falls back to direct https://bridge.home for non-startpage origins
    // (rare — really only the public github.io copy, which can't reach the
    // LAN anyway).
    var BRIDGE_URL = (function () {
        var h = window.location.hostname || '';
        if (/(^|\.)home$/i.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(h) || h === 'localhost') {
            return '/bridge/status';
        }
        return 'https://bridge.home/status';
    })();
    var POLL_MS    = 3000;
    var Z          = 9996;

    function isLanOrigin() {
        var h = window.location.hostname || '';
        return /\.home$/i.test(h)
            || h === 'localhost'
            || /^10\./.test(h)
            || /^192\.168\./.test(h)
            || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(h);
    }

    function fmtMs(ms) {
        if (!ms || ms < 0) ms = 0;
        var s = Math.floor(ms / 1000);
        var m = Math.floor(s / 60);
        var ss = s % 60;
        return m + ':' + (ss < 10 ? '0' + ss : ss);
    }

    function init() {
        // Always mount the card — even off-LAN it's useful to show
        // "BRIDGE UNREACHABLE" so the user knows the widget exists.
        // The fetch loop will hit BRIDGE_URL (same-origin proxy on
        // .home, direct https://bridge.home on github.io) and
        // gracefully degrade if neither path works.

        // ── Card container ────────────────────────────────────────
        var card = document.createElement('div');
        card.id = 'hcc-nowplaying';
        card.style.cssText = [
            'position:fixed',
            'top:clamp(60px, 5.5vw, 78px)',
            'left:clamp(12px, 1.5vw, 24px)',
            'width:clamp(220px, 19vw, 440px)',
            'height:clamp(170px, 20vh, 230px)',
            'overflow:hidden',
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
            'opacity:1',
            'transition:opacity 0.4s ease'
        ].join(';');

        // Header strip
        var header = document.createElement('div');
        header.style.cssText = [
            'display:flex',
            'align-items:center',
            'justify-content:space-between',
            'padding:8px 14px',
            'background:rgba(0,183,255,0.08)',
            'border-bottom:1px solid rgba(0,183,255,0.35)',
            'font-size:10px',
            'letter-spacing:2px'
        ].join(';');
        var headerLeft = document.createElement('span');
        headerLeft.innerHTML = '◆ NOW PLAYING';
        headerLeft.style.color = HCC_CYAN;
        var headerRight = document.createElement('span');
        headerRight.id = 'hcc-np-state';
        headerRight.style.color = HCC_CYAN_BRIGHT;
        headerRight.textContent = '...';
        header.appendChild(headerLeft);
        header.appendChild(headerRight);

        // Body
        var body = document.createElement('div');
        body.style.cssText = 'padding:14px 16px 12px 16px;';

        var trackEl = document.createElement('div');
        trackEl.id = 'hcc-np-track';
        trackEl.style.cssText = [
            'font-size:18px',
            'font-weight:700',
            'letter-spacing:0.5px',
            'color:' + HCC_CYAN_BRIGHT,
            'text-shadow:0 0 6px rgba(0,212,255,0.6)',
            'white-space:nowrap',
            'overflow:hidden',
            'text-overflow:ellipsis',
            'margin-bottom:5px'
        ].join(';');
        trackEl.textContent = '—';

        var artistEl = document.createElement('div');
        artistEl.id = 'hcc-np-artist';
        artistEl.style.cssText = [
            'font-size:14px',
            'letter-spacing:1px',
            'color:' + HCC_CYAN,
            'opacity:0.85',
            'white-space:nowrap',
            'overflow:hidden',
            'text-overflow:ellipsis',
            'margin-bottom:3px'
        ].join(';');
        artistEl.textContent = '—';

        var albumEl = document.createElement('div');
        albumEl.id = 'hcc-np-album';
        albumEl.style.cssText = [
            'font-size:12px',
            'letter-spacing:1px',
            'color:' + HCC_CYAN,
            'opacity:0.55',
            'white-space:nowrap',
            'overflow:hidden',
            'text-overflow:ellipsis',
            'margin-bottom:12px'
        ].join(';');
        albumEl.textContent = '—';

        // Progress bar
        var progWrap = document.createElement('div');
        progWrap.style.cssText = [
            'height:3px',
            'background:rgba(0,183,255,0.15)',
            'box-shadow:inset 0 0 4px rgba(0,0,0,0.6)',
            'margin-bottom:6px',
            'position:relative'
        ].join(';');
        var progBar = document.createElement('div');
        progBar.id = 'hcc-np-prog';
        progBar.style.cssText = [
            'height:100%',
            'width:0%',
            'background:linear-gradient(90deg, ' + HCC_CYAN + ' 0%, ' + HCC_CYAN_BRIGHT + ' 100%)',
            'box-shadow:0 0 8px rgba(0,212,255,0.7)',
            'transition:width 0.5s linear'
        ].join(';');
        progWrap.appendChild(progBar);

        // Time + volume row
        var meta = document.createElement('div');
        meta.style.cssText = [
            'display:flex',
            'align-items:center',
            'justify-content:space-between',
            'font-size:10px',
            'letter-spacing:1px',
            'color:' + HCC_CYAN,
            'opacity:0.75'
        ].join(';');
        var timeEl = document.createElement('span');
        timeEl.id = 'hcc-np-time';
        timeEl.textContent = '0:00 / 0:00';
        var volEl = document.createElement('span');
        volEl.id = 'hcc-np-vol';
        volEl.textContent = 'VOL —';
        meta.appendChild(timeEl);
        meta.appendChild(volEl);

        body.appendChild(trackEl);
        body.appendChild(artistEl);
        body.appendChild(albumEl);
        body.appendChild(progWrap);
        body.appendChild(meta);

        card.appendChild(header);
        card.appendChild(body);
        document.body.appendChild(card);

        // ── Poller ────────────────────────────────────────────────
        var lastFetchAt = 0;
        var lastPosition = 0;
        var lastUpdatedAt = 0;
        var lastDuration = 0;
        var isPlaying = false;

        function setOpacity(o) { card.style.opacity = String(o); }

        function render(s) {
            // s = { state: { event, track, artist, album, position_ms, duration_ms, volume, playing }, ... }
            var st = (s && s.state) || {};
            var st_event = st.event || 'idle';
            var track = st.track || null;
            var artist = st.artist || '';
            var album = st.album || '';
            var posMs = st.position_ms || 0;
            var durMs = st.duration_ms || 0;
            var vol = st.volume;
            isPlaying = !!st.playing;

            lastPosition = posMs;
            lastDuration = durMs;
            lastUpdatedAt = Date.now();

            if (track) {
                trackEl.textContent = track;
                artistEl.textContent = artist;
                albumEl.textContent = album;
            } else {
                trackEl.textContent = 'IDLE';
                artistEl.textContent = '—';
                albumEl.textContent = 'NAD-AVR · awaiting client';
            }

            // Header state — color the state pill
            var label = st_event.toUpperCase();
            headerRight.textContent = label;
            if (isPlaying) {
                headerRight.style.color = HCC_CYAN_BRIGHT;
            } else if (label === 'PAUSED' || label === 'STOPPED') {
                headerRight.style.color = HCC_AMBER;
            } else {
                headerRight.style.color = HCC_CYAN;
                headerRight.style.opacity = '0.5';
            }

            volEl.textContent = (typeof vol === 'number' ? 'VOL ' + vol : 'VOL —');

            updateProgress();
            setOpacity(1);
        }

        function updateProgress() {
            // Extrapolate position between polls so the bar moves smoothly
            var now = Date.now();
            var pos = lastPosition;
            if (isPlaying && lastUpdatedAt > 0) {
                pos = lastPosition + (now - lastUpdatedAt);
            }
            if (lastDuration > 0) {
                if (pos > lastDuration) pos = lastDuration;
                var pct = (pos / lastDuration) * 100;
                progBar.style.width = pct.toFixed(2) + '%';
                timeEl.textContent = fmtMs(pos) + ' / ' + fmtMs(lastDuration);
            } else {
                progBar.style.width = '0%';
                timeEl.textContent = '0:00 / 0:00';
            }
        }

        // 4Hz progress extrapolation, 3s status fetch
        setInterval(updateProgress, 250);

        function poll() {
            var ac = new AbortController();
            var t = setTimeout(function () { ac.abort(); }, 2500);
            // Note: no `cache: 'no-store'` — that adds a Cache-Control
            // header which triggers a CORS preflight on cross-origin
            // fetches. Cache-busting via query string instead.
            fetch(BRIDGE_URL + (BRIDGE_URL.indexOf('?') > -1 ? '&' : '?') + '_=' + Date.now(), {
                signal: ac.signal
            }).then(function (r) {
                clearTimeout(t);
                if (!r.ok) throw new Error('http ' + r.status);
                return r.json();
            }).then(function (j) {
                lastFetchAt = Date.now();
                render(j);
            }).catch(function () {
                clearTimeout(t);
                // On failure, dim the card and mark state UNREACHABLE.
                // Only hide entirely after multiple failures.
                headerRight.textContent = 'UNREACHABLE';
                headerRight.style.color = HCC_MAGENTA;
                headerRight.style.opacity = '1';
                setOpacity(0.5);
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
