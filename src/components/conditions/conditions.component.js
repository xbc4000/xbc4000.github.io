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
            'width:clamp(220px, 19vw, 440px)',
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
        headerLeft.innerHTML = '◆ CONDITIONS';
        headerLeft.style.color = HCC_CYAN;
        var headerRight = document.createElement('span');
        headerRight.id = 'hcc-cond-status';
        headerRight.style.color = HCC_CYAN_BRIGHT;
        headerRight.textContent = '...';
        header.appendChild(headerLeft);
        header.appendChild(headerRight);

        // Body — compact single-row layout
        var body = document.createElement('div');
        body.style.cssText = 'padding:8px 14px 10px;font-size:10px;';

        // Location row
        var locEl = document.createElement('div');
        locEl.style.cssText = 'font-size:11px;font-weight:700;color:' + HCC_CYAN_BRIGHT + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:6px;';
        locEl.textContent = '— · —';

        // Temp + condition inline row
        var tempRow = document.createElement('div');
        tempRow.style.cssText = 'display:flex;align-items:baseline;gap:8px;margin-bottom:6px;';
        var tempEl = document.createElement('div');
        tempEl.style.cssText = 'font-size:22px;font-weight:700;line-height:1;color:' + HCC_CYAN_BRIGHT + ';text-shadow:0 0 10px rgba(0,212,255,0.7);';
        tempEl.textContent = '—°';
        var condEl = document.createElement('div');
        condEl.style.cssText = 'font-size:10px;color:' + HCC_CYAN + ';letter-spacing:1px;font-weight:600;opacity:0.85;';
        condEl.textContent = '—';
        var glyphEl = document.createElement('span');
        glyphEl.style.cssText = 'font-size:14px;color:' + HCC_AMBER + ';margin-left:auto;';
        glyphEl.textContent = '·';
        tempRow.appendChild(tempEl);
        tempRow.appendChild(condEl);
        tempRow.appendChild(glyphEl);

        // Feels + HI/LO compact row
        var feelsEl = document.createElement('div');
        feelsEl.style.cssText = 'font-size:9px;color:' + HCC_CYAN + ';opacity:0.6;letter-spacing:1px;margin-bottom:6px;';
        feelsEl.textContent = 'FEELS —';

        // Stats row — all inline
        var statsRow = document.createElement('div');
        statsRow.style.cssText = 'display:flex;gap:10px;font-size:9px;color:' + HCC_CYAN + ';opacity:0.7;letter-spacing:1px;flex-wrap:wrap;';

        function statSpan(label, valId) {
            var s = document.createElement('span');
            s.innerHTML = '<span style="opacity:0.6">' + label + '</span> <span id="' + valId + '" style="color:' + HCC_CYAN_BRIGHT + ';font-weight:700">—</span>';
            return s;
        }
        statsRow.appendChild(statSpan('HI', 'hcc-cond-hi'));
        statsRow.appendChild(statSpan('LO', 'hcc-cond-lo'));
        statsRow.appendChild(statSpan('WIND', 'hcc-cond-wind'));
        statsRow.appendChild(statSpan('HUM', 'hcc-cond-humid'));

        // Hidden elements for sunrise/sunset (still populated by fetch)
        var sunupHidden = document.createElement('span');
        sunupHidden.id = 'hcc-cond-sunup';
        sunupHidden.style.display = 'none';
        var sundnHidden = document.createElement('span');
        sundnHidden.id = 'hcc-cond-sundn';
        sundnHidden.style.display = 'none';

        body.appendChild(locEl);
        body.appendChild(tempRow);
        body.appendChild(feelsEl);
        body.appendChild(statsRow);
        body.appendChild(sunupHidden);
        body.appendChild(sundnHidden);

        card.appendChild(header);
        card.appendChild(body);
        document.body.appendChild(card);

        // IP element (hidden, still populated)
        var ipEl = { textContent: '' };

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
