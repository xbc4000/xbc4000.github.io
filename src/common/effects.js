// =============================================================================
// HCC cyberpunk background effects — digital rain + drifting particles
// =============================================================================
// Vanilla single-canvas implementation. Sits behind the scanline overlay
// (z-index 9997 vs 9998-9999 for ::before/::after) and above the body
// background. No deps, no build step. Self-installs on DOMContentLoaded.
//
// Two layers, one canvas:
//   1) Digital rain — falling katakana/digits in cyan, classic Matrix vibe
//      but tuned to the HCC palette and slow enough that it doesn't fight
//      the foreground content
//   2) Particles — small glowing dots drifting on a sine pulse, mostly cyan
//      with rare magenta sparks
//
// Frame budget: ~30 fps cap, requestAnimationFrame, devicePixelRatio aware.
// =============================================================================

(function () {
    'use strict';

    // HCC palette (mirrors userconfig.js `hcc` object — kept inline so this
    // file is self-contained and loads order doesn't matter)
    var HCC = {
        cyan:        '#00b7ff',
        cyanBright:  '#00d4ff',
        cyanDark:    '#0088bb',
        cyanGlow:    '#0ffff4',
        magenta:     '#ff6680',
        amber:       '#ffb347'
    };

    // Frame target
    var TARGET_FPS = 30;
    var FRAME_MS   = 1000 / TARGET_FPS;

    // Glyphs for the rain (katakana + digits + a few symbols)
    var GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789∆◊∑∂';

    function init() {
        // Insert canvas before <tabs-list> so it's behind everything content
        var canvas = document.createElement('canvas');
        canvas.id = 'hcc-effects';
        canvas.style.cssText = [
            'position: fixed',
            'top: 0',
            'left: 0',
            'width: 100%',
            'height: 100%',
            'z-index: 9997',
            'pointer-events: none',
            'opacity: 0.85'
        ].join(';');
        document.body.insertBefore(canvas, document.body.firstChild);

        var ctx = canvas.getContext('2d', { alpha: true });
        var W = 0, H = 0, DPR = 1;

        var columns = [];   // rain state
        var particles = []; // particle state

        function resize() {
            DPR = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width  = Math.floor(W * DPR);
            canvas.height = Math.floor(H * DPR);
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            initRain();
            initParticles();
        }

        // ── Digital rain ─────────────────────────────────────────────
        var FONT_SIZE = 16;

        function initRain() {
            var cols = Math.floor(W / FONT_SIZE);
            columns = new Array(cols);
            for (var i = 0; i < cols; i++) {
                columns[i] = {
                    y:        Math.random() * H,
                    speed:    0.6 + Math.random() * 1.4,
                    glyph:    GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
                    bright:   Math.random()
                };
            }
        }

        function drawRain() {
            // Trail fade — semi-transparent dark wash leaves a fading tail
            ctx.fillStyle = 'rgba(2, 4, 8, 0.08)';
            ctx.fillRect(0, 0, W, H);

            ctx.font = FONT_SIZE + 'px monospace';
            ctx.textBaseline = 'top';

            for (var i = 0; i < columns.length; i++) {
                var col = columns[i];

                // Occasionally swap the glyph mid-fall for that flickering feel
                if (Math.random() < 0.04) {
                    col.glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                }

                // Bright leading character with cyan glow
                var alpha = 0.4 + col.bright * 0.6;
                ctx.fillStyle = 'rgba(15, 255, 244, ' + alpha + ')';
                ctx.shadowColor = HCC.cyanGlow;
                ctx.shadowBlur = 6;
                ctx.fillText(col.glyph, i * FONT_SIZE, col.y);
                ctx.shadowBlur = 0;

                col.y += col.speed * FONT_SIZE * 0.18;

                // Wrap when off screen, with random reset offset
                if (col.y > H + FONT_SIZE) {
                    col.y      = -Math.random() * H * 0.5;
                    col.speed  = 0.6 + Math.random() * 1.4;
                    col.bright = Math.random();
                }
            }
        }

        // ── Particles ────────────────────────────────────────────────
        function initParticles() {
            // Density scales with viewport area, capped so mobile doesn't melt
            var count = Math.min(120, Math.floor((W * H) / 20000));
            particles = new Array(count);
            for (var i = 0; i < count; i++) {
                particles[i] = {
                    x:    Math.random() * W,
                    y:    Math.random() * H,
                    vx:   (Math.random() - 0.5) * 0.25,
                    vy:   (Math.random() - 0.5) * 0.25,
                    r:    0.6 + Math.random() * 1.6,
                    hue:  Math.random() < 0.88 ? HCC.cyanBright : HCC.magenta,
                    life: Math.random() * Math.PI * 2
                };
            }
        }

        function drawParticles() {
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];

                p.x += p.vx;
                p.y += p.vy;
                p.life += 0.03;

                // Bounce off edges
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;

                // Pulse alpha so they breathe
                var a = 0.35 + 0.45 * (Math.sin(p.life) * 0.5 + 0.5);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle  = p.hue;
                ctx.shadowColor = p.hue;
                ctx.shadowBlur  = 14;
                ctx.globalAlpha = a;
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur  = 0;
        }

        // ── Loop ────────────────────────────────────────────────────
        var lastFrame = 0;
        function frame(t) {
            if (t - lastFrame >= FRAME_MS) {
                drawRain();
                drawParticles();
                lastFrame = t;
            }
            requestAnimationFrame(frame);
        }

        // Throttle on tab hide so we don't burn cycles in the background
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                lastFrame = 0;
            }
        });

        window.addEventListener('resize', resize);
        resize();
        requestAnimationFrame(frame);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
