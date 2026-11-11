# Lineup

Personalized surf recommendations grounded in live marine forecasts, local break characteristics, surfer experience, and board choice.

## Run locally

Requires Node.js 18+ for checks/tests and Python 3 for the local server. There are no npm dependencies to install.

```sh
git clone https://github.com/upayannm/lineup.git
cd lineup
npm run dev
```

Open http://localhost:8765. Use an HTTP server rather than opening index.html directly because the app uses JavaScript modules.

```sh
npm run check
npm test
```

## Features

- La Jolla Shores, Huntington State Beach, and Malibu Surfrider
- Hourly forecast selection for the next 48 hours, displayed in Pacific time
- Beginner, intermediate, and advanced profiles with three example boards
- Live offshore wave/swell height, mean swell period/direction, wind, and NOAA tide predictions
- Explanations of recommendation limits and links to official beach and water-quality information
- Fifteen-minute browser-session cache and refresh; missing or stale required data prevents a recommendation

## Project layout

- `dist/index.html`: responsive interface and methodology
- `dist/live.js`: forecast fetching, state, and rendering
- `dist/model.js`: spot catalog, timestamp matching, and recommendation rules
- `tests/model.test.mjs`: checks for missing data, stale data, night, wind, period, tide, and profile limits

The `dist` directory is the authored, buildless application source. No compilation step is required. Deploy that directory to a static host that serves JavaScript modules with the appropriate MIME type.

## Data sources

Marine and weather forecasts: [Open-Meteo](https://open-meteo.com/en/docs/marine-weather-api), with model attribution and licensing in the app. Tides: [NOAA CO-OPS](https://api.tidesandcurrents.noaa.gov/api/dev), using reference stations La Jolla (9410230), Los Angeles (9410660), and Santa Monica (9410840).

The prototype calls public APIs directly from the browser and stores no API keys. Open-Meteo's free endpoint is for noncommercial use; commercial deployment requires an appropriate provider plan. If adopting a paid API key, keep it behind a server-side proxy, not in browser JavaScript.

## Limits

This is an experimental decision-support prototype, not a validated surf-safety service. Offshore significant wave height is not breaking-wave height. Mean swell period is not peak or energy period. Tide predictions at nearby stations do not measure clearance over the break.

Recommendation thresholds and board advice are explicit heuristics, not universal safety limits. Surf-zone bathymetry, swell shadowing, sandbar changes, current hazards, closures, water quality, and crowds are not automatically resolved. Validate recommendations with local surf coaches and observations before relying on them for real sessions.

The app defaults to a 75 kg example rider; volume, shape, fitness, and individual ability require further personalization. No analytics, user accounts, or backend are included.

## Worldwide beach search

Search beach names and coastal towns using Photon/OpenStreetMap, or enter latitude, longitude for an unindexed beach. Results distinguish actual beach features from places and exclude businesses. Search is submitted explicitly and cached in memory to limit use of the public Photon service; use a dedicated geocoder for production traffic.

Searched locations show offshore marine and wind forecasts in the location’s time zone. They do not receive personalized suitability, board-fit, bottom-type, or tide-window claims. Tide predictions remain available only for curated SoCal spots. Use the map link to verify the exact point. Marine cells more than 35 km from the selected point are withheld; this distance filter is not proof of coastal location or surfability.

- `dist/world.js`: search and worldwide forecast interface, request cancellation, caching and partial-data handling
- `dist/search-model.js`: result filtering, coordinate validation, HTML escaping, and marine-grid distance checks
- `tests/search.test.mjs`: search normalization, escaping, coordinate and distance validation

Search attribution: [Photon by komoot](https://photon.komoot.io) and [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Public service availability is not guaranteed. No location permission is requested; only the query/coordinates the visitor submits are sent to providers.
