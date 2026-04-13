// =============================================================================
// HCC Ollama Status — live AI inference status from PER730XD
// =============================================================================
// Fetches Ollama API directly (http://10.10.10.2:11434) every 10s and
// renders a fixed bottom-right card with service health, loaded models,
// GPU VRAM, and temperature. Only mounts on LAN.
// =============================================================================

(function () {
    'use strict';

    var HCC_CYAN        = '#00B7FF';
    var HCC_CYAN_BRIGHT = '#00D4FF';
    var HCC_MAGENTA     = '#FF00B2';
    var HCC_AMBER       = '#FFB347';
    var HCC_GREEN       = '#00FF88';
    var HCC_PURPLE      = '#B986F2';
    var HCC_RED         = '#FF2244';
    var HCC_MUTED       = 'rgba(180,200,220,0.45)';

    var OLLAMA_URL   = 'http://10.10.10.2:11434';
    var EXPORTER_URL = 'http://10.10.10.2:9401';
    var POLL_MS      = 10000;
    var Z            = 9995;

    function isLanOrigin() {
        var h = window.location.hostname || '';
        return /\.home$/i.test(h)
            || h === 'localhost'
            || /^10\./.test(h)
            || /^192\.168\./.test(h)
            || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(h);
    }

    function fmtBytes(b) {
        if (!b) return '0';
        var gb = b / 1073741824;
        if (gb >= 1) return gb.toFixed(1) + 'G';
        return (b / 1048576).toFixed(0) + 'M';
    }

    var card, headerStatus, modelCountEl, loadedCountEl, gpuEl, vramEl, tempEl, modelsListEl;

    function init() {
        card = document.createElement('div');
        card.id = 'hcc-ollama';
        card.style.cssText = [
            'position:fixed',
            'bottom:clamp(12px, 1.5vw, 24px)',
            'right:clamp(12px, 1.5vw, 24px)',
            'width:clamp(200px, 16vw, 340px)',
            'pointer-events:auto',
            'z-index:' + Z,
            'font-family:"JetBrains Mono","Fira Code",monospace',
            'color:' + HCC_CYAN_BRIGHT,
            'background:linear-gradient(180deg, rgba(2,8,16,0.82) 0%, rgba(2,4,8,0.7) 100%)',
            'border:1px solid rgba(255,0,178,0.55)',
            'box-shadow:0 0 22px rgba(255,0,178,0.18), 0 0 50px rgba(255,0,178,0.06), inset 0 0 24px rgba(255,0,178,0.04)',
            'text-shadow:0 0 4px rgba(0,212,255,0.45)',
            'backdrop-filter:blur(3px)',
            'clip-path:polygon(10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px),0 10px)',
            'opacity:1',
            'transition:opacity 0.4s ease',
            'padding:0'
        ].join(';');

        // Header
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 14px 6px 14px;border-bottom:1px solid rgba(255,0,178,0.25);';

        var title = document.createElement('span');
        title.style.cssText = 'font-size:clamp(0.6rem,0.8vw,0.75rem);font-weight:800;letter-spacing:3px;color:' + HCC_MAGENTA + ';';
        title.textContent = '\u25C6 OLLAMA';

        headerStatus = document.createElement('span');
        headerStatus.style.cssText = 'font-size:clamp(0.55rem,0.65vw,0.65rem);font-weight:700;letter-spacing:2px;';
        setStatus('INIT', HCC_AMBER);

        header.appendChild(title);
        header.appendChild(headerStatus);
        card.appendChild(header);

        // Body
        var body = document.createElement('div');
        body.style.cssText = 'padding:8px 14px 10px 14px;font-size:clamp(0.6rem,0.72vw,0.72rem);';

        // Stats grid
        var statsGrid = document.createElement('div');
        statsGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin-bottom:8px;';

        modelCountEl = makeStat('\u25C7 MODELS', '---', HCC_CYAN);
        loadedCountEl = makeStat('\u26A1 LOADED', '---', HCC_MAGENTA);
        gpuEl = makeStat('\uD83C\uDFAE GPU', '---', HCC_CYAN);
        vramEl = makeStat('\uD83D\uDCBE VRAM', '---', HCC_PURPLE);

        statsGrid.appendChild(modelCountEl.wrap);
        statsGrid.appendChild(loadedCountEl.wrap);
        statsGrid.appendChild(gpuEl.wrap);
        statsGrid.appendChild(vramEl.wrap);
        body.appendChild(statsGrid);

        // Temp + power row
        tempEl = document.createElement('div');
        tempEl.style.cssText = 'font-size:clamp(0.55rem,0.6vw,0.62rem);color:' + HCC_MUTED + ';margin-bottom:6px;';
        tempEl.textContent = '';
        body.appendChild(tempEl);

        // Models list
        modelsListEl = document.createElement('div');
        modelsListEl.style.cssText = 'border-top:1px solid rgba(255,0,178,0.15);padding-top:6px;';
        body.appendChild(modelsListEl);

        card.appendChild(body);
        document.body.appendChild(card);

        refresh();
        setInterval(refresh, POLL_MS);
    }

    function makeStat(label, value, color) {
        var wrap = document.createElement('div');
        var lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:clamp(0.5rem,0.55vw,0.55rem);color:' + HCC_MUTED + ';letter-spacing:1px;margin-bottom:1px;';
        lbl.textContent = label;
        var val = document.createElement('div');
        val.style.cssText = 'font-size:clamp(0.7rem,0.85vw,0.85rem);font-weight:800;color:' + color + ';letter-spacing:1px;';
        val.textContent = value;
        wrap.appendChild(lbl);
        wrap.appendChild(val);
        return { wrap: wrap, val: val };
    }

    function setStatus(text, color) {
        if (!headerStatus) return;
        headerStatus.textContent = text;
        headerStatus.style.color = color;
        headerStatus.style.textShadow = '0 0 8px ' + color;
    }

    function refresh() {
        setStatus('FETCH', HCC_AMBER);
        Promise.all([
            fetchJson(OLLAMA_URL + '/api/version'),
            fetchJson(OLLAMA_URL + '/api/tags'),
            fetchJson(OLLAMA_URL + '/api/ps'),
            fetchText(EXPORTER_URL + '/metrics')
        ]).then(function (results) {
            var version = results[0];
            var tags    = results[1];
            var ps      = results[2];
            var metrics = results[3];

            if (!version) {
                setStatus('DOWN', HCC_RED);
                modelCountEl.val.textContent = '---';
                loadedCountEl.val.textContent = '---';
                gpuEl.val.textContent = '---';
                vramEl.val.textContent = '---';
                tempEl.textContent = '';
                modelsListEl.innerHTML = '<div style="color:' + HCC_RED + ';font-size:0.6rem;">OLLAMA UNREACHABLE</div>';
                return;
            }

            setStatus('LIVE', HCC_GREEN);

            var models = tags ? (tags.models || []) : [];
            var loaded = ps ? (ps.models || []) : [];

            modelCountEl.val.textContent = models.length;
            loadedCountEl.val.textContent = loaded.length;

            // Parse GPU metrics from exporter
            var gpu = parseGpu(metrics);
            gpuEl.val.textContent = gpu.gpuUtil !== undefined ? gpu.gpuUtil + '%' : '---';
            gpuEl.val.style.color = gpu.gpuUtil > 70 ? HCC_AMBER : HCC_CYAN;
            vramEl.val.textContent = gpu.vramPercent !== undefined ? gpu.vramPercent.toFixed(1) + '%' : '---';
            vramEl.val.style.color = gpu.vramPercent > 80 ? HCC_RED : HCC_PURPLE;

            var tempParts = [];
            if (gpu.temp !== undefined) tempParts.push(gpu.temp + '\u00B0C');
            if (gpu.power !== undefined) tempParts.push(gpu.power.toFixed(0) + 'W');
            if (gpu.fan !== undefined) tempParts.push('FAN ' + gpu.fan + '%');
            tempEl.textContent = tempParts.join(' \u00B7 ');

            // Models list
            var html = '';
            if (loaded.length > 0) {
                loaded.forEach(function (m) {
                    var vram = fmtBytes(m.size_vram || 0);
                    html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">';
                    html += '<span style="color:' + HCC_MAGENTA + ';font-size:0.6rem;">\u25CF</span>';
                    html += '<span style="color:' + HCC_CYAN_BRIGHT + ';font-size:0.62rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(m.name) + '</span>';
                    html += '<span style="color:' + HCC_MUTED + ';font-size:0.55rem;margin-left:auto;">' + vram + '</span>';
                    html += '</div>';
                });
            } else {
                html = '<div style="color:' + HCC_MUTED + ';font-size:0.58rem;letter-spacing:1px;">IDLE \u2014 NO MODELS LOADED</div>';
            }
            modelsListEl.innerHTML = html;

        }).catch(function (err) {
            console.warn('[hcc-ollama]', err);
            setStatus('ERR', HCC_RED);
        });
    }

    function fetchJson(url) {
        return fetch(url, { signal: AbortSignal.timeout(5000) })
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    }

    function fetchText(url) {
        return fetch(url, { signal: AbortSignal.timeout(5000) })
            .then(function (r) { return r.ok ? r.text() : null; })
            .catch(function () { return null; });
    }

    function parseGpu(text) {
        var m = {};
        if (!text) return m;
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.charAt(0) === '#') continue;
            if (line.indexOf('nvidia_gpu_temperature_celsius') === 0) m.temp = parseVal(line);
            else if (line.indexOf('nvidia_gpu_utilization_percent') === 0) m.gpuUtil = parseVal(line);
            else if (line.indexOf('nvidia_gpu_memory_used_percent') === 0) m.vramPercent = parseVal(line);
            else if (line.indexOf('nvidia_gpu_power_draw_watts') === 0) m.power = parseVal(line);
            else if (line.indexOf('nvidia_gpu_fan_speed_percent') === 0) m.fan = parseVal(line);
        }
        return m;
    }

    function parseVal(line) {
        var parts = line.split(/\s+/);
        return parseFloat(parts[parts.length - 1]);
    }

    function esc(s) {
        return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
