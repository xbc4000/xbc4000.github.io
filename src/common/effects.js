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
            // Add or trim to target
            while (particles.length < target) {
                particles.push({
                    x:     Math.random() * W,
                    y:     Math.random() * H,
                    vx:    (Math.random() - 0.5) * 0.3,
                    vy:    (Math.random() - 0.5) * 0.2,
                    r:     Math.random() * 2 + 1.2,
                    pulse: Math.random() * Math.PI * 2
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

                // Wide glow halo
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 183, 255, ' + (glow * 0.08) + ')';
                ctx.fill();

                // Outer glow ring
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 183, 255, ' + (glow * 0.25) + ')';
                ctx.fill();

                // Core dot — solid bright
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 220, 255, ' + glow + ')';
                ctx.fill();

                // Hot white center
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(200, 245, 255, ' + glow + ')';
                ctx.fill();

                // Connection lines to nearby particles
                for (var j = i + 1; j < particles.length; j++) {
                    var p2 = particles[j];
                    var dx = p.x - p2.x;
                    var dy = p.y - p2.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        var alpha = 0.6 * (1 - dist / CONNECTION_DIST);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = 'rgba(0, 200, 255, ' + alpha + ')';
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
    // Mirrors pihole-theme.js sidebar rain but spread across the full
    // viewport instead of one narrow strip. CSS keyframe handles the fall.
    function buildDataRain() {
        var container = document.createElement('div');
        container.id = 'hcc-data-rain';
        container.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'pointer-events:none',
            'z-index:' + Z,
            'overflow:hidden',
            'opacity:0.5'
        ].join(';');
        document.body.insertBefore(container, document.body.firstChild);

        // Inject keyframe once
        if (!document.getElementById('hcc-rain-keyframe')) {
            var s = document.createElement('style');
            s.id = 'hcc-rain-keyframe';
            s.textContent = '@keyframes hccRainFall{0%{top:-20%}100%{top:120%}}';
            document.head.appendChild(s);
        }

        var HEX = '0123456789ABCDEF>|.:[]{}◆◇●○';
        var COL_SPACING = 60;   // ~px between columns

        function rebuild() {
            container.innerHTML = '';
            var W = window.innerWidth;
            var cols = Math.max(8, Math.floor(W / COL_SPACING));

            for (var i = 0; i < cols; i++) {
                var col = document.createElement('div');
                // Slight horizontal jitter so columns don't look like a strict grid
                var xPos = (i + 0.5) * (W / cols) + (Math.random() - 0.5) * 12;

                col.style.cssText = [
                    'position:absolute',
                    'top:-100%',
                    'left:' + xPos + 'px',
                    'font-family:"JetBrains Mono","Fira Code",monospace',
                    'font-size:12px',
                    'color:' + HCC_CYAN,
                    'line-height:14px',
                    'white-space:pre',
                    'writing-mode:vertical-lr',
                    'text-orientation:mixed',
                    'letter-spacing:3px',
                    'text-shadow:0 0 6px rgba(0,183,255,0.55)'
                ].join(';');

                // Random hex string per column (60-100 chars)
                var len = 60 + Math.floor(Math.random() * 40);
                var str = '';
                for (var j = 0; j < len; j++) {
                    str += HEX[Math.floor(Math.random() * HEX.length)];
                }
                col.textContent = str;

                var duration = 18 + Math.random() * 22;
                var delay    = -Math.random() * duration; // negative delay = mid-flight start
                col.style.animation = 'hccRainFall ' + duration + 's linear ' + delay + 's infinite';

                container.appendChild(col);
            }
        }

        rebuild();
        var resizeT = 0;
        window.addEventListener('resize', function () {
            clearTimeout(resizeT);
            resizeT = setTimeout(rebuild, 250);
        });
    }

    function init() {
        buildParticles();
        buildDataRain();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
