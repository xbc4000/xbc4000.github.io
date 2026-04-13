// =============================================================================
// HCC Conditions — real location + weather + sun + IP info
// =============================================================================
// Top-right card with all real data, no fake placeholders:
//
//   - Location: bigdatacloud.net free endpoints
//       /data/reverse-geocode-client → city, region, country, lat/lon
//       /data/client-ip               → public IP
//     CORS-open + key-less + actually accepts cross-origin requests
//     (ipapi.co is Pi-hole-blocked; ipwho.is returns 403 to any
//      request that has an Origin header — useless from a browser).
//
//   - Weather:  api.open-meteo.com → current temp, apparent temp,
//                                     humidity, wind, condition,
//                                     today's high/low, sunrise, sunset
//                                     (CORS-open, no key, no signup)
//
// Refreshes location once on load (it doesn't change), weather every
// 10 minutes. All graceful fallbacks — if a fetch fails the card shows
// the partial data it has + an error tag in the header.
// =============================================================================

(function () {
    'use strict';

    var HCC_CYAN        = '#00B7FF';
    var HCC_CYAN_BRIGHT = '#00D4FF';
    var HCC_MAGENTA     = '#FF6680';
    var HCC_AMBER       = '#FFB347';

    var Z = 9996;
    var WEATHER_POLL_MS = 10 * 60 * 1000; // 10 min

    // Open-Meteo WMO weather codes → short label + emoji-free glyph
    var WMO = {
        0:  ['CLEAR',          '◯'],
        1:  ['MOSTLY CLEAR',   '◔'],
        2:  ['PARTLY CLOUDY',  '◑'],
        3:  ['OVERCAST',       '●'],
        45: ['FOG',            '≡'],
        48: ['ICY FOG',        '≡'],
        51: ['LIGHT DRIZZLE',  '⋮'],
        53: ['DRIZZLE',        '⋮⋮'],
        55: ['HEAVY DRIZZLE',  '⋮⋮⋮'],
        56: ['ICY DRIZZLE',    '❅'],
        57: ['HEAVY ICY DRIZZLE','❅'],
        61: ['LIGHT RAIN',     '╱'],
        63: ['RAIN',           '╱╱'],
        65: ['HEAVY RAIN',     '╱╱╱'],
        66: ['ICY RAIN',       '❅'],
        67: ['HEAVY ICY RAIN', '❅'],
        71: ['LIGHT SNOW',     '❄'],
        73: ['SNOW',           '❄❄'],
        75: ['HEAVY SNOW',     '❄❄❄'],
        77: ['SNOW GRAINS',    '·'],
        80: ['LIGHT SHOWERS',  '╱'],
        81: ['SHOWERS',        '╱╱'],
        82: ['VIOLENT SHOWERS','╱╱╱'],
        85: ['SNOW SHOWERS',   '❄'],
        86: ['HEAVY SNOW SHOWERS','❄❄'],
        95: ['THUNDERSTORM',   '⚡'],
        96: ['HAIL STORM',     '⚡❅'],
        99: ['HEAVY HAIL STORM','⚡❅❅']
    };

    function wmoLabel(code) {
        var v = WMO[code];
        return v ? v[0] : 'CODE ' + code;
    }
    function wmoGlyph(code) {
        var v = WMO[code];
        return v ? v[1] : '?';
    }

    function init() {
        // ── Card ─────────────────────────────────────────────────────
        var card = document.createElement('div');
        card.id = 'hcc-conditions';
        card.style.cssText = [
            'position:fixed',
            'top:clamp(60px, 5.5vw, 78px)',
            'right:clamp(12px, 1.5vw, 24px)',
            'width:clamp(260px, 22vw, 540px)',
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
            'min-height:338px'
        ].join(';');

        // Header
        var header = document.createElement('div');
        header.style.cssText = [
            'display:flex',
            'align-items:center',
            'justify-content:space-between',
            'padding:11px 18px',
            'background:rgba(0,183,255,0.08)',
            'border-bottom:1px solid rgba(0,183,255,0.35)',
            'font-size:11px',
            'letter-spacing:2px'
        ].join(';');
        var headerLeft = document.createElement('span');
        headerLeft.innerHTML = '◆ CONDITIONS';
        headerLeft.style.color = HCC_CYAN;
        var headerRight = document.createElement('span');
        headerRight.id = 'hcc-cond-status';
        headerRight.style.color = HCC_CYAN_BRIGHT;
        headerRight.textContent = '...';
        header.appendChild(headerLeft);
        header.appendChild(headerRight);

        // Body
        var body = document.createElement('div');
        body.style.cssText = 'padding:18px 22px 16px;';

        // Location row (city, region · country)
        var locEl = document.createElement('div');
        locEl.style.cssText = [
            'font-size:16px',
            'font-weight:700',
            'color:' + HCC_CYAN_BRIGHT,
            'text-shadow:0 0 6px rgba(0,212,255,0.6)',
            'margin-bottom:2px',
            'white-space:nowrap',
            'overflow:hidden',
            'text-overflow:ellipsis'
        ].join(';');
        locEl.textContent = '— · —';

        var ipEl = document.createElement('div');
        ipEl.style.cssText = [
            'font-size:11px',
            'color:' + HCC_CYAN,
            'opacity:0.6',
            'letter-spacing:1px',
            'margin-bottom:18px',
            'white-space:nowrap',
            'overflow:hidden',
            'text-overflow:ellipsis'
        ].join(';');
        ipEl.textContent = 'IP —';

        // Big temp + condition row
        var bigRow = document.createElement('div');
        bigRow.style.cssText = [
            'display:flex',
            'align-items:center',
            'gap:14px',
            'margin-bottom:14px'
        ].join(';');
        var tempEl = document.createElement('div');
        tempEl.style.cssText = [
            'font-size:clamp(36px, 3.3vw, 64px)',
            'font-weight:700',
            'line-height:1',
            'color:' + HCC_CYAN_BRIGHT,
            'text-shadow:0 0 14px rgba(0,212,255,0.7)'
        ].join(';');
        tempEl.textContent = '—°';
        var condCol = document.createElement('div');
        condCol.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:3px';
        var glyphEl = document.createElement('div');
        glyphEl.style.cssText = [
            'font-size:24px',
            'color:' + HCC_AMBER,
            'text-shadow:0 0 8px rgba(255,179,71,0.5)'
        ].join(';');
        glyphEl.textContent = '·';
        var condEl = document.createElement('div');
        condEl.style.cssText = [
            'font-size:13px',
            'color:' + HCC_CYAN,
            'letter-spacing:1px',
            'opacity:0.85',
            'font-weight:600'
        ].join(';');
        condEl.textContent = '—';
        var feelsEl = document.createElement('div');
        feelsEl.style.cssText = [
            'font-size:11px',
            'color:' + HCC_CYAN,
            'opacity:0.6',
            'letter-spacing:1px'
        ].join(';');
        feelsEl.textContent = 'FEELS —';
        condCol.appendChild(glyphEl);
        condCol.appendChild(condEl);
        condCol.appendChild(feelsEl);
        bigRow.appendChild(tempEl);
        bigRow.appendChild(condCol);

        // Stat grid: HI / LO / WIND / HUMID
        var grid = document.createElement('div');
        grid.style.cssText = [
            'display:grid',
            'grid-template-columns:1fr 1fr',
            'gap:8px 18px',
            'font-size:12px',
            'letter-spacing:1px',
            'color:' + HCC_CYAN,
            'margin-bottom:12px'
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

        grid.appendChild(statCell('HI',     'hcc-cond-hi'));
        grid.appendChild(statCell('LO',     'hcc-cond-lo'));
        grid.appendChild(statCell('WIND',   'hcc-cond-wind'));
        grid.appendChild(statCell('HUMID',  'hcc-cond-humid'));
        grid.appendChild(statCell('SUNUP',  'hcc-cond-sunup'));
        grid.appendChild(statCell('SUNDN',  'hcc-cond-sundn'));

        body.appendChild(locEl);
        body.appendChild(ipEl);
        body.appendChild(bigRow);
        body.appendChild(grid);

        card.appendChild(header);
        card.appendChild(body);
        document.body.appendChild(card);

        function setStatus(text, color) {
            headerRight.textContent = text;
            headerRight.style.color = color;
        }

        function pad(n) { return n < 10 ? '0' + n : '' + n; }
        function fmtTime(iso) {
            if (!iso) return '—';
            try {
                var d = new Date(iso);
                return pad(d.getHours()) + ':' + pad(d.getMinutes());
            } catch (e) { return '—'; }
        }

        // ── Location fetch (once) ────────────────────────────────────
        // bigdatacloud.net reverse-geocode-client shape:
        //   { latitude, longitude, countryName, countryCode,
        //     principalSubdivision, city, locality, ... }
        // and client-ip shape: { ipString, ipType }
        // No `cache:` option here — even on a same-origin endpoint,
        // setting cache: 'no-store' adds a Cache-Control request header
        // that triggers CORS preflight, which some servers reject. Use
        // a query-string cache buster instead.
        var locationData = null;
        function fetchLocation() {
            var geoP = fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?_=' + Date.now())
                .then(function (r) {
                    if (!r.ok) throw new Error('bdc-geo ' + r.status);
                    return r.json();
                });
            var ipP = fetch('https://api.bigdatacloud.net/data/client-ip?_=' + Date.now())
                .then(function (r) {
                    if (!r.ok) throw new Error('bdc-ip ' + r.status);
                    return r.json();
                })
                .catch(function () { return { ipString: '' }; });

            return Promise.all([geoP, ipP]).then(function (arr) {
                var g = arr[0] || {};
                var ip = arr[1] || {};
                locationData = {
                    latitude:  g.latitude,
                    longitude: g.longitude,
                    city:      g.city || g.locality || '?',
                    region:    g.principalSubdivision || '',
                    country:   g.countryCode || g.countryName || '',
                    ip:        ip.ipString || ''
                };
                var loc = locationData;
                locEl.textContent = loc.city
                    + (loc.region ? ', ' + loc.region : '')
                    + (loc.country ? '  ·  ' + loc.country : '');
                ipEl.textContent = loc.ip ? 'IP ' + loc.ip : '';
                return locationData;
            });
        }

        // ── Weather fetch ────────────────────────────────────────────
        function fetchWeather() {
            if (!locationData || locationData.latitude == null || locationData.longitude == null) {
                throw new Error('no coordinates yet');
            }
            var url = 'https://api.open-meteo.com/v1/forecast' +
                '?latitude=' + locationData.latitude +
                '&longitude=' + locationData.longitude +
                '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m' +
                '&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset' +
                '&timezone=auto' +
                '&temperature_unit=fahrenheit' +
                '&wind_speed_unit=mph' +
                '&forecast_days=1';

            // Same gotcha as ipwho.is — don't set cache: 'no-store'
            // because it triggers a CORS preflight. Cache buster in URL.
            return fetch(url + '&_=' + Date.now())
                .then(function (r) {
                    if (!r.ok) throw new Error('open-meteo ' + r.status);
                    return r.json();
                })
                .then(function (j) {
                    var c = j.current || {};
                    var d = j.daily || {};
                    var t = Math.round(c.temperature_2m);
                    var feel = Math.round(c.apparent_temperature);
                    var hi = Math.round((d.temperature_2m_max || [])[0]);
                    var lo = Math.round((d.temperature_2m_min || [])[0]);
                    var hum = Math.round(c.relative_humidity_2m);
                    var wind = Math.round(c.wind_speed_10m);
                    var code = c.weather_code;

                    tempEl.textContent = (isFinite(t) ? t : '—') + '°';
                    feelsEl.textContent = 'FEELS ' + (isFinite(feel) ? feel + '°' : '—');
                    condEl.textContent = wmoLabel(code);
                    glyphEl.textContent = wmoGlyph(code);
                    document.getElementById('hcc-cond-hi').textContent    = isFinite(hi) ? hi + '°' : '—';
                    document.getElementById('hcc-cond-lo').textContent    = isFinite(lo) ? lo + '°' : '—';
                    document.getElementById('hcc-cond-wind').textContent  = isFinite(wind) ? wind + ' mph' : '—';
                    document.getElementById('hcc-cond-humid').textContent = isFinite(hum) ? hum + '%' : '—';
                    document.getElementById('hcc-cond-sunup').textContent = fmtTime((d.sunrise || [])[0]);
                    document.getElementById('hcc-cond-sundn').textContent = fmtTime((d.sunset || [])[0]);

                    setStatus('LIVE', HCC_CYAN_BRIGHT);
                });
        }

        function refresh() {
            setStatus('FETCHING', HCC_AMBER);
            (locationData ? Promise.resolve() : fetchLocation())
                .then(fetchWeather)
                .catch(function (e) {
                    console.warn('[hcc-conditions]', e);
                    setStatus('ERR', HCC_MAGENTA);
                });
        }

        refresh();
        setInterval(refresh, WEATHER_POLL_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
