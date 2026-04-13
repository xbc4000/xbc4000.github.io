// =============================================================================
// HCC Jarvis — radar sweep + real homelab telemetry panel
// =============================================================================
// Mid-left fixed panel that gives the page that command-center vibe with:
//
//   - A spinning radar canvas (concentric rings, sweeping cone, pulsing
//     blips that mark each measured probe target's last RTT)
//   - A live telemetry list of REAL data:
//       BRIDGE   — RTT to /bridge/health (same-origin via Caddy proxy)
//       FPS      — measured via requestAnimationFrame deltas
//       HEAP     — performance.memory.usedJSHeapSize (Chrome-only)
//       CORES    — navigator.hardwareConcurrency
//       LANG     — navigator.language
//       ONLINE   — navigator.onLine
//
// Probes the bridge every 5s. Updates FPS continuously. No fake data —
// any unavailable signal shows "—" instead of a placeholder.
// =============================================================================

(function () {
    'use strict';

    var HCC_CYAN        = '#00B7FF';
    var HCC_CYAN_BRIGHT = '#00D4FF';
    var HCC_MAGENTA     = '#FF6680';
    var HCC_AMBER       = '#FFB347';

    var Z = 9996;

    function isLanOrigin() {
        var h = window.location.hostname || '';
        return /\.home$/i.test(h) || h === 'localhost'
            || /^10\./.test(h) || /^192\.168\./.test(h)
            || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(h);
    }

    function init() {
        var card = document.createElement('div');
        card.id = 'hcc-jarvis';
        card.style.cssText = [
            'position:fixed',
            'left:clamp(12px, 1.5vw, 24px)',
            'top:clamp(180px, 14vw, 216px)',
            'width:clamp(280px, 31vw, 600px)',
            'pointer-events:auto',
            'z-index:' + Z,
            'font-family:"JetBrains Mono","Fira Code",monospace',
            'color:' + HCC_CYAN_BRIGHT,
            'background:linear-gradient(180deg, rgba(2,8,16,0.82) 0%, rgba(2,4,8,0.7) 100%)',
            'border:1px solid rgba(0,183,255,0.55)',
            'box-shadow:0 0 22px rgba(0,183,255,0.22), 0 0 50px rgba(0,183,255,0.08), inset 0 0 24px rgba(0,183,255,0.05)',
            'text-shadow:0 0 4px rgba(0,212,255,0.45)',
            'backdrop-filter:blur(3px)',
            'clip-path:polygon(10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px),0 10px)'
        ].join(';');

        // Header
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
        headerLeft.innerHTML = '◆ JARVIS';
        headerLeft.style.color = HCC_CYAN;
        var headerRight = document.createElement('span');
        headerRight.id = 'hcc-jarvis-status';
        headerRight.textContent = 'TELEMETRY';
        headerRight.style.color = HCC_CYAN_BRIGHT;
        header.appendChild(headerLeft);
        header.appendChild(headerRight);

        // Body — radar on the left, telemetry grid on the right
        var body = document.createElement('div');
        body.style.cssText = 'padding:12px 14px;display:flex;align-items:center;gap:14px';

        // Radar canvas (smaller — was 252px, now 140px)
        var canvas = document.createElement('canvas');
        canvas.id = 'hcc-jarvis-radar';
        canvas.width = 280;   // 140 css × 2 dpr
        canvas.height = 280;
        canvas.style.cssText = [
            'display:block',
            'flex-shrink:0',
            'width:140px',
            'height:140px'
        ].join(';');

        // Telemetry list — single column, fits right of radar
        var list = document.createElement('div');
        list.style.cssText = [
            'flex:1',
            'display:grid',
            'grid-template-columns:1fr',
            'gap:4px',
            'font-size:9px',
            'letter-spacing:1px',
            'color:' + HCC_CYAN
        ].join(';');

        function statCell(label, valId) {
            var w = document.createElement('div');
            w.style.cssText = 'display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dashed rgba(0,183,255,0.18);padding-bottom:3px';
            var l = document.createElement('span');
            l.style.opacity = '0.55';
            l.textContent = label;
            var v = document.createElement('span');
            v.id = valId;
            v.style.cssText = 'color:' + HCC_CYAN_BRIGHT + ';font-weight:700;text-shadow:0 0 4px rgba(0,212,255,0.5)';
            v.textContent = '—';
            w.appendChild(l);
            w.appendChild(v);
            return w;
        }

        list.appendChild(statCell('BRIDGE', 'hcc-j-bridge'));
        list.appendChild(statCell('FPS',    'hcc-j-fps'));
        list.appendChild(statCell('HEAP',   'hcc-j-heap'));
        list.appendChild(statCell('CORES',  'hcc-j-cores'));
        list.appendChild(statCell('LANG',   'hcc-j-lang'));
        list.appendChild(statCell('NET',    'hcc-j-net'));

        body.appendChild(canvas);
        body.appendChild(list);
        card.appendChild(header);
        card.appendChild(body);
        document.body.appendChild(card);

        // ── Radar drawing ────────────────────────────────────────────
        var ctx = canvas.getContext('2d');
        ctx.scale(2, 2); // dpr
        var W = 140, H = 140;
        var cx = W / 2, cy = H / 2;
        var R = 62;

        // Permanent blips for probe targets, set to alpha=0 until first ack
        var blips = [
            { angle: 0.4,  dist: 0.55, color: HCC_CYAN_BRIGHT, alpha: 0, label: 'BRIDGE' },
            { angle: 1.7,  dist: 0.78, color: HCC_AMBER,       alpha: 0, label: 'GRAFANA' },
            { angle: 2.9,  dist: 0.65, color: HCC_MAGENTA,     alpha: 0, label: 'PORTAINER' },
            { angle: 4.1,  dist: 0.85, color: HCC_CYAN,        alpha: 0, label: 'HCC' },
            { angle: 5.3,  dist: 0.45, color: HCC_AMBER,       alpha: 0, label: 'PI-HOLE' }
        ];

        var sweepAngle = 0;

        function drawRadar() {
            ctx.clearRect(0, 0, W, H);

            // Concentric rings
            ctx.strokeStyle = 'rgba(0,183,255,0.25)';
            ctx.lineWidth = 1;
            for (var i = 1; i <= 4; i++) {
                ctx.beginPath();
                ctx.arc(cx, cy, (R * i) / 4, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Cross hairs
            ctx.beginPath();
            ctx.moveTo(cx - R, cy);
            ctx.lineTo(cx + R, cy);
            ctx.moveTo(cx, cy - R);
            ctx.lineTo(cx, cy + R);
            ctx.stroke();

            // Sweep cone
            var sweepWidth = 0.5;
            var grad = ctx.createConicGradient
                ? ctx.createConicGradient(sweepAngle - sweepWidth, cx, cy)
                : null;
            if (grad) {
                grad.addColorStop(0,    'rgba(0,212,255,0.0)');
                grad.addColorStop(0.05, 'rgba(0,212,255,0.45)');
                grad.addColorStop(0.10, 'rgba(0,212,255,0.0)');
                grad.addColorStop(1,    'rgba(0,212,255,0.0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(cx, cy, R, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Fallback for browsers without conic gradient
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(sweepAngle);
                ctx.fillStyle = 'rgba(0,212,255,0.18)';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, R, -sweepWidth, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // Sweep line
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(sweepAngle);
            ctx.strokeStyle = 'rgba(0,220,255,0.95)';
            ctx.shadowColor = HCC_CYAN_BRIGHT;
            ctx.shadowBlur = 8;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(R, 0);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();

            // Blips
            blips.forEach(function (b) {
                if (b.alpha <= 0) return;
                var bx = cx + Math.cos(b.angle) * R * b.dist;
                var by = cy + Math.sin(b.angle) * R * b.dist;

                // Light up the blip when the sweep passes over
                var diff = Math.abs(((sweepAngle - b.angle + Math.PI * 2) % (Math.PI * 2)));
                if (diff < 0.15 || diff > Math.PI * 2 - 0.15) {
                    b.alpha = 1;
                }

                ctx.fillStyle = b.color;
                ctx.shadowColor = b.color;
                ctx.shadowBlur = 10 * b.alpha;
                ctx.globalAlpha = b.alpha;
                ctx.beginPath();
                ctx.arc(bx, by, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;

                // Slow fade
                b.alpha = Math.max(0.15, b.alpha - 0.005);
            });

            // Outer ring
            ctx.strokeStyle = 'rgba(0,183,255,0.55)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.stroke();

            sweepAngle += 0.04;
            if (sweepAngle > Math.PI * 2) sweepAngle -= Math.PI * 2;
        }

        // ── FPS counter (real measurement) ──────────────────────────
        var fpsLast = performance.now();
        var fpsFrames = 0;
        var fpsValue = 0;
        function tickFps(now) {
            fpsFrames++;
            if (now - fpsLast >= 1000) {
                fpsValue = Math.round((fpsFrames * 1000) / (now - fpsLast));
                fpsFrames = 0;
                fpsLast = now;
                document.getElementById('hcc-j-fps').textContent = fpsValue;
            }
        }

        function frame(now) {
            drawRadar();
            tickFps(now);
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);

        // ── Static telemetry ────────────────────────────────────────
        document.getElementById('hcc-j-cores').textContent = navigator.hardwareConcurrency || '—';
        document.getElementById('hcc-j-lang').textContent  = (navigator.language || '—').toUpperCase();

        function updateNet() {
            var v = navigator.onLine ? 'UP' : 'DOWN';
            var el = document.getElementById('hcc-j-net');
            el.textContent = v;
            el.style.color = navigator.onLine ? HCC_CYAN_BRIGHT : HCC_MAGENTA;
        }
        updateNet();
        window.addEventListener('online', updateNet);
        window.addEventListener('offline', updateNet);

        // ── Heap (Chrome only) ──────────────────────────────────────
        function updateHeap() {
            var m = performance && performance.memory;
            var el = document.getElementById('hcc-j-heap');
            if (m && m.usedJSHeapSize) {
                el.textContent = Math.round(m.usedJSHeapSize / 1048576) + 'MB';
            } else {
                el.textContent = '—';
            }
        }
        updateHeap();
        setInterval(updateHeap, 2000);

        // ── Bridge probe ────────────────────────────────────────────
        function probeBridge() {
            if (!isLanOrigin()) {
                document.getElementById('hcc-j-bridge').textContent = 'OFF-LAN';
                document.getElementById('hcc-j-bridge').style.color = HCC_AMBER;
                return;
            }
            var t0 = performance.now();
            var ac = new AbortController();
            var timer = setTimeout(function () { ac.abort(); }, 2500);
            // No cache: 'no-store' — query-string cache buster keeps
            // requests CORS-simple and avoids preflight.
            fetch('/bridge/health?_=' + Date.now(), {
                signal: ac.signal
            }).then(function (r) {
                clearTimeout(timer);
                var rtt = Math.round(performance.now() - t0);
                var el = document.getElementById('hcc-j-bridge');
                el.textContent = rtt + 'ms';
                el.style.color = r.ok ? HCC_CYAN_BRIGHT : HCC_AMBER;
                // Light up the BRIDGE blip
                blips[0].alpha = 1;
            }).catch(function () {
                clearTimeout(timer);
                var el = document.getElementById('hcc-j-bridge');
                el.textContent = 'DOWN';
                el.style.color = HCC_MAGENTA;
            });
        }
        probeBridge();
        setInterval(probeBridge, 5000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
