/**
 * WeatherForecastClient provides weather data for the startpage.
 *
 * Uses Open-Meteo (https://open-meteo.com) instead of OpenWeatherMap.
 * Open-Meteo is free, requires no API key, and suits static sites where
 * any hardcoded key is publicly visible in the served JS bundle.
 *
 * Two requests per weather refresh:
 *   1. Geocoding API to turn the configured location name into lat/lon
 *   2. Forecast API to get the current temperature and weather code
 */
class WeatherForecastClient {
  /**
   * Create a new WeatherForecastClient instance
   * @param {string} location - The location to fetch weather data for
   */
  constructor(location) {
    this.location = location;
    this.geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
  }

  /**
   * Map WMO weather code → condition string matching weather.component.js forecasts
   * Condition strings must be one of: clear, clouds, mist, drizzle, rain, snow, thunderstorm
   * @param {number} code - WMO weather interpretation code
   * @returns {string} Normalised condition string
   */
  mapWeatherCode(code) {
    if (code === 0) return "clear";
    if (code >= 1 && code <= 3) return "clouds";
    if (code === 45 || code === 48) return "mist";
    if (code >= 51 && code <= 57) return "drizzle";
    if (code >= 61 && code <= 67) return "rain";
    if (code >= 71 && code <= 77) return "snow";
    if (code >= 80 && code <= 82) return "rain";
    if (code >= 85 && code <= 86) return "snow";
    if (code >= 95 && code <= 99) return "thunderstorm";
    return "clouds";
  }

  /**
   * Fetch and return the current weather for the configured location
   * @returns {Promise<{temperature: number, condition: string}>} Weather data with temperature and condition
   */
  async getWeather() {
    try {
      const geoRes = await fetch(this.geocodeUrl);
      const geoJson = await geoRes.json();

      if (!geoJson.results || geoJson.results.length === 0) {
        console.warn("Weather API: geocoding returned no results for", this.location);
        return;
      }

      const { latitude, longitude } = geoJson.results[0];
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`;

      const weatherRes = await fetch(forecastUrl);
      const weatherJson = await weatherRes.json();
      const current = weatherJson.current_weather;

      return {
        temperature: Math.round(current.temperature),
        condition: this.mapWeatherCode(current.weathercode),
      };
    } catch (err) {
      console.warn("Weather API returned an error:", err);
    }
  }
}
