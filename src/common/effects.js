// =============================================================================
// HCC cyberpunk background effects — neural particle field + hex data rain
// =============================================================================
// Mirrors the canonical HCC style from `homelab-network/config/pihole-theme.js`
// (Pi-hole sidebar particles + data rain) so the startpage feels like the
// same product as the rest of the homelab.
//
// Two layers, both pointer-events:none, z-index 9997 (under the body::before
// scanline grid + body::after moving line at 9998-9999):
//
//   1) Particles — neural-network nodes drawn on a canvas
//      - 4-layer concentric draw (wide halo / outer ring / core / hot center)
//      - NO shadowBlur — sharper, no blur on resize, matches Pi-hole style
//      - Pairs within CONNECTION_DIST get a fading connection line
//      - All cyan, no magenta sparks (HCC palette is cyan-dominant)
//
//   2) Data rain — vertical hex-char streams in absolutely-positioned <div>s
//      - writing-mode: vertical-lr so text reads top-down
//      - Pure CSS @keyframes animation (top: -20% → 120%)
//      - Hex chars + a few box-drawing glyphs, JetBrains Mono
//      - One column every ~60px across the full viewport width
//
// Self-installs on DOMContentLoaded. Pauses on visibilitychange so a hidden
// tab doesn't burn cycles. Both layers reflow on window resize.
// =============================================================================

(function () {
    'use strict';

    var Z = 9997;
    var HCC_CYAN        = '#00B7FF';
    var HCC_CYAN_BRIGHT = '#00D4FF';

    // Per-particle hue palette. Each entry is the rgb triplet used for the
    // halo/ring/core/center layers, plus a "hot" highlight for the center.
    // Halo and ring are dimmed by alpha; core uses the brighter triplet.
    var HUE_CYAN = {
        halo: '0, 183, 255',
        ring: '0, 183, 255',
        core: '0, 220, 255',
        hot:  '200, 245, 255',
        line: '0, 200, 255'
    };
    var HUE_MAGENTA = {
        halo: '255, 102, 128',
        ring: '255, 102, 128',
        core: '255, 130, 170',
        hot:  '255, 220, 235',
        line: '255, 102, 128'
    };
    var HUE_AMBER = {
        halo: '255, 179, 71',
        ring: '255, 179, 71',
        core: '255, 200, 110',
        hot:  '255, 240, 210',
        line: '255, 179, 71'
    };

    // ── Particle field ──────────────────────────────────────────────────
    // Density target: ~1 particle per 22000 px², capped 40-180 to keep
    // both 13" laptops and ultrawides reasonable.
    function buildParticles() {
        var canvas = document.createElement('canvas');
        canvas.id = 'hcc-particles';
        canvas.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'pointer-events:none',
            'z-index:' + Z
        ].join(';');
        document.body.insertBefore(canvas, document.body.firstChild);

        var ctx = canvas.getContext('2d');
        var particles = [];
        var W = 0, H = 0, DPR = 1;
        var CONNECTION_DIST = 140;

        function resize() {
            DPR = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width  = Math.floor(W * DPR);
            canvas.height = Math.floor(H * DPR);
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

            var target = Math.max(40, Math.min(180, Math.floor((W * H) / 22000)));
            // Add or trim to target. Each particle gets a fixed color picked
            // once: mostly cyan with rare magenta + amber accents so the
            // overall field still reads as cyan but has occasional pops.
            while (particles.length < target) {
                var roll = Math.random();
                var hue;
                if (roll < 0.82) {
                    hue = HUE_CYAN;     // 82% — base
                } else if (roll < 0.94) {
                    hue = HUE_MAGENTA;  // 12% — sparks
                } else {
                    hue = HUE_AMBER;    //  6% — rare warm accent
                }
                particles.push({
                    x:     Math.random() * W,
                    y:     Math.random() * H,
                    vx:    (Math.random() - 0.5) * 0.3,
                    vy:    (Math.random() - 0.5) * 0.2,
                    r:     Math.random() * 2 + 1.2,
                    pulse: Math.random() * Math.PI * 2,
                    hue:   hue
                });
            }
            if (particles.length > target) particles.length = target;
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x     += p.vx;
                p.y     += p.vy;
                p.pulse += 0.02;

                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;

                var glow = 0.7 + Math.sin(p.pulse) * 0.3;
                var h = p.hue;

                // Wide glow halo
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + h.halo + ', ' + (glow * 0.08) + ')';
                ctx.fill();

                // Outer glow ring
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + h.ring + ', ' + (glow * 0.25) + ')';
                ctx.fill();

                // Core dot — solid bright
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + h.core + ', ' + glow + ')';
                ctx.fill();

                // Hot center highlight
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + h.hot + ', ' + glow + ')';
                ctx.fill();

                // Connection lines to nearby particles. Line color blends
                // toward the warmer particle so cyan↔magenta links read as
                // a soft transition, not a hard cyan stamp.
                for (var j = i + 1; j < particles.length; j++) {
                    var p2 = particles[j];
                    var dx = p.x - p2.x;
                    var dy = p.y - p2.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        var alpha = 0.55 * (1 - dist / CONNECTION_DIST);
                        // Pick the line color from whichever endpoint isn't
                        // pure cyan, so accents pop on their own connections
                        var lineHue = (p.hue !== HUE_CYAN) ? p.hue.line
                                    : (p2.hue !== HUE_CYAN) ? p2.hue.line
                                    : HUE_CYAN.line;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = 'rgba(' + lineHue + ', ' + alpha + ')';
                        ctx.lineWidth = 1.2;
                        ctx.stroke();
                    }
                }
            }

            rafId = requestAnimationFrame(draw);
        }

        var rafId = 0;
        function start() { if (!rafId) rafId = requestAnimationFrame(draw); }
        function stop()  { cancelAnimationFrame(rafId); rafId = 0; }

        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stop(); else start();
        });

        resize();
        start();
    }

    // ── Hex data rain ───────────────────────────────────────────────────
    // Two narrow edge strips (left + right) — frames the viewport like
    // the Pi-hole sidebar pattern. Center is left clear so foreground
    // content is unobstructed.
    function buildDataRain() {
        // Inject keyframe once
        if (!document.getElementById('hcc-rain-keyframe')) {
            var s = document.createElement('style');
            s.id = 'hcc-rain-keyframe';
            s.textContent = '@keyframes hccRainFall{0%{top:-20%}100%{top:120%}}';
            document.head.appendChild(s);
        }

        var HEX = '0123456789ABCDEF>|.:[]{}◆◇●○';
        var STRIP_WIDTH  = 110; // px each side
        var COL_SPACING  = 14;  // px between columns inside a strip

        // Match particle color distribution. Each entry: text fill rgb +
        // text-shadow glow rgb (slightly brighter / lighter for the bloom).
        var RAIN_HUES = [
            { fill: '0, 183, 255',   glow: '0, 183, 255'   }, // cyan
            { fill: '0, 183, 255',   glow: '0, 183, 255'   }, // cyan (8x)
            { fill: '0, 183, 255',   glow: '0, 183, 255'   },
            { fill: '0, 183, 255',   glow: '0, 183, 255'   },
            { fill: '0, 183, 255',   glow: '0, 183, 255'   },
            { fill: '0, 183, 255',   glow: '0, 183, 255'   },
            { fill: '0, 183, 255',   glow: '0, 183, 255'   },
            { fill: '0, 183, 255',   glow: '0, 183, 255'   },
            { fill: '255, 102, 128', glow: '255, 102, 128' }, // magenta (1x)
            { fill: '255, 179, 71',  glow: '255, 179, 71'  }  // amber (1x)
        ];

        // Build one edge strip — `side` is "left" or "right"
        function buildStrip(side) {
            var strip = document.createElement('div');
            strip.id = 'hcc-data-rain-' + side;
            var sideCss = (side === 'left' ? 'left:0' : 'right:0');
            strip.style.cssText = [
                'position:fixed',
                'top:0',
                sideCss,
                'width:' + STRIP_WIDTH + 'px',
                'height:100%',
                'pointer-events:none',
                'z-index:' + Z,
                'overflow:hidden',
                'opacity:0.55'
            ].join(';');
            document.body.insertBefore(strip, document.body.firstChild);
            return strip;
        }

        var leftStrip  = buildStrip('left');
        var rightStrip = buildStrip('right');

        function fillStrip(strip) {
            strip.innerHTML = '';
            var cols = Math.max(4, Math.floor(STRIP_WIDTH / COL_SPACING));

            for (var i = 0; i < cols; i++) {
                var col = document.createElement('div');
                var xPos = 4 + i * COL_SPACING;

                // Pick a color from the weighted palette
                var hue = RAIN_HUES[Math.floor(Math.random() * RAIN_HUES.length)];

                col.style.cssText = [
                    'position:absolute',
                    'top:-100%',
                    'left:' + xPos + 'px',
                    'font-family:"JetBrains Mono","Fira Code",monospace',
                    'font-size:11px',
                    'color:rgb(' + hue.fill + ')',
                    'line-height:13px',
                    'white-space:pre',
                    'writing-mode:vertical-lr',
                    'text-orientation:mixed',
                    'letter-spacing:3px',
                    'text-shadow:0 0 5px rgba(' + hue.glow + ',0.6)'
                ].join(';');

                // Random hex string per column (80-130 chars so it spans
                // taller viewports without wrap)
                var len = 80 + Math.floor(Math.random() * 50);
                var str = '';
                for (var j = 0; j < len; j++) {
                    str += HEX[Math.floor(Math.random() * HEX.length)];
                }
                col.textContent = str;

                var duration = 20 + Math.random() * 22;
                var delay    = -Math.random() * duration; // negative = mid-flight start
                col.style.animation = 'hccRainFall ' + duration + 's linear ' + delay + 's infinite';

                strip.appendChild(col);
            }
        }

        function rebuild() {
            fillStrip(leftStrip);
            fillStrip(rightStrip);
        }

        rebuild();
        var resizeT = 0;
        window.addEventListener('resize', function () {
            clearTimeout(resizeT);
            resizeT = setTimeout(rebuild, 250);
        });
    }

    // ── HUD corner brackets ─────────────────────────────────────────────
    // Four L-shaped marks pinned to the viewport corners. Pure CSS borders
    // on absolutely-positioned divs — no canvas, no JS animation.
    function buildHudBrackets() {
        if (document.getElementById('hcc-hud-brackets')) return;

        var wrap = document.createElement('div');
        wrap.id = 'hcc-hud-brackets';
        wrap.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'pointer-events:none',
            'z-index:' + (Z + 1)
        ].join(';');

        // bracket size + offset from edge
        var SIZE   = 28;
        var INSET  = 14;
        var BORDER = '2px solid ' + HCC_CYAN_BRIGHT;
        var GLOW   = '0 0 8px rgba(0,212,255,0.6), 0 0 16px rgba(0,212,255,0.3)';

        var corners = [
            // top-left
            { top: INSET, left: INSET, borderTop: BORDER, borderLeft: BORDER },
            // top-right
            { top: INSET, right: INSET, borderTop: BORDER, borderRight: BORDER },
            // bottom-left
            { bottom: INSET, left: INSET, borderBottom: BORDER, borderLeft: BORDER },
            // bottom-right
            { bottom: INSET, right: INSET, borderBottom: BORDER, borderRight: BORDER }
        ];

        corners.forEach(function (c) {
            var b = document.createElement('div');
            var css = [
                'position:absolute',
                'width:' + SIZE + 'px',
                'height:' + SIZE + 'px',
                'box-shadow:' + GLOW
            ];
            for (var k in c) {
                if (c.hasOwnProperty(k)) {
                    var prop = k.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); });
                    css.push(prop + ':' + (typeof c[k] === 'number' ? c[k] + 'px' : c[k]));
                }
            }
            b.style.cssText = css.join(';');
            wrap.appendChild(b);
        });

        document.body.insertBefore(wrap, document.body.firstChild);
    }

    // ── HUD top-center system readout ───────────────────────────────────
    // Live, real browser + LAN signals. No fake "system nominal" theatre.
    // Segments: pulse dot · live clock · LAN reachability (probes
    // bridge.home/health every 10s) · navigator.connection effective type ·
    // viewport WxH · page uptime since load.
    function buildHudReadout() {
        if (document.getElementById('hcc-hud-readout')) return;

        // Inject pulse keyframe once
        if (!document.getElementById('hcc-hud-pulse-style')) {
            var s = document.createElement('style');
            s.id = 'hcc-hud-pulse-style';
            s.textContent = [
                '@keyframes hccPulse{',
                '0%,100%{opacity:1;box-shadow:0 0 6px rgba(0,212,255,0.8),0 0 12px rgba(0,212,255,0.5)}',
                '50%{opacity:0.4;box-shadow:0 0 3px rgba(0,212,255,0.4)}',
                '}'
            ].join('');
            document.head.appendChild(s);
        }

        var bar = document.createElement('div');
        bar.id = 'hcc-hud-readout';
        bar.style.cssText = [
            'position:fixed',
            'top:18px',
            'left:50%',
            'transform:translateX(-50%)',
            'pointer-events:none',
            'z-index:' + (Z + 1),
            'display:flex',
            'align-items:center',
            'gap:10px',
            'padding:6px 18px',
            'font-family:"JetBrains Mono","Fira Code",monospace',
            'font-size:11px',
            'letter-spacing:2px',
            'color:' + HCC_CYAN_BRIGHT,
            'background:rgba(2,4,8,0.55)',
            'border:1px solid rgba(0,183,255,0.35)',
            'box-shadow:0 0 14px rgba(0,183,255,0.18), inset 0 0 18px rgba(0,183,255,0.05)',
            'text-shadow:0 0 4px rgba(0,212,255,0.6)',
            'backdrop-filter:blur(2px)'
        ].join(';');

        function makeSep() {
            var sep = document.createElement('span');
            sep.textContent = '│';
            sep.style.opacity = '0.4';
            return sep;
        }
        function makeSeg(id) {
            var s = document.createElement('span');
            if (id) s.id = id;
            return s;
        }

        var pulse = document.createElement('span');
        pulse.style.cssText = [
            'display:inline-block',
            'width:8px',
            'height:8px',
            'border-radius:50%',
            'background:' + HCC_CYAN_BRIGHT,
            'animation:hccPulse 1.6s ease-in-out infinite'
        ].join(';');

        var clockSeg = makeSeg('hcc-hud-clock');
        var lanSeg   = makeSeg('hcc-hud-lan');
        var netSeg   = makeSeg('hcc-hud-net');
        var viewSeg  = makeSeg('hcc-hud-view');
        var upSeg    = makeSeg('hcc-hud-up');

        bar.appendChild(pulse);
        bar.appendChild(clockSeg);
        bar.appendChild(makeSep());
        bar.appendChild(lanSeg);
        bar.appendChild(makeSep());
        bar.appendChild(netSeg);
        bar.appendChild(makeSep());
        bar.appendChild(viewSeg);
        bar.appendChild(makeSep());
        bar.appendChild(upSeg);

        document.body.insertBefore(bar, document.body.firstChild);

        // ── Live data updaters ───────────────────────────────────────
        function pad(n) { return n < 10 ? '0' + n : '' + n; }
        var loadedAt = Date.now();

        function fmtUptime(ms) {
            var s = Math.floor(ms / 1000);
            var h = Math.floor(s / 3600);
            var m = Math.floor((s % 3600) / 60);
            var ss = s % 60;
            return (h > 0 ? pad(h) + ':' : '') + pad(m) + ':' + pad(ss);
        }

        function tickFast() {
            // Clock
            var d = new Date();
            var tzMin = -d.getTimezoneOffset();
            var tzSign = tzMin >= 0 ? '+' : '-';
            var tzH = pad(Math.floor(Math.abs(tzMin) / 60));
            clockSeg.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' UTC' + tzSign + tzH;

            // Uptime (since page load, real)
            upSeg.textContent = 'UP ' + fmtUptime(Date.now() - loadedAt);

            // Viewport — recompute every tick (cheap, also catches resize)
            viewSeg.textContent = 'VIEW ' + window.innerWidth + '×' + window.innerHeight + (window.devicePixelRatio > 1 ? '@' + window.devicePixelRatio + 'x' : '');

            // Network type — navigator.connection if exposed
            var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (conn && conn.effectiveType) {
                var down = conn.downlink ? ' ' + conn.downlink + 'Mb' : '';
                netSeg.textContent = 'NET ' + conn.effectiveType.toUpperCase() + down;
            } else if (navigator.onLine === false) {
                netSeg.textContent = 'NET OFFLINE';
            } else {
                netSeg.textContent = 'NET ?';
            }
        }
        tickFast();
        setInterval(tickFast, 1000);

        // ── LAN reachability probe ───────────────────────────────────
        // fetch + mode:'no-cors' resolves with an opaque response when
        // the host actually answered (TCP+TLS handshake completed) and
        // rejects when the request couldn't reach anything. We don't
        // read the body — only the resolve/reject distinction matters.
        function setLan(state, color) {
            lanSeg.textContent = 'LAN ' + state;
            lanSeg.style.color = color;
            lanSeg.style.textShadow = '0 0 4px ' + color;
        }
        setLan('PROBING', 'rgba(255,179,71,0.95)');

        function probeLan() {
            // AbortController gives us a real timeout — fetch's default
            // timeout is "the OS's whim" which is too long for a HUD.
            var ac = new AbortController();
            var t = setTimeout(function () { ac.abort(); }, 2500);

            fetch('https://bridge.home/health?_=' + Date.now(), {
                mode: 'no-cors',
                cache: 'no-store',
                signal: ac.signal
            }).then(function () {
                clearTimeout(t);
                setLan('ONLINE', 'rgba(0,220,255,0.95)');
            }).catch(function () {
                clearTimeout(t);
                setLan('OFFLINE', 'rgba(255,102,128,0.95)');
            });
        }
        probeLan();
        setInterval(probeLan, 10000);
    }

    function init() {
        buildParticles();
        buildDataRain();
        buildHudBrackets();
        buildHudReadout();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
