# Coastal Intelligence

AI-powered coastal risk and monitoring platform for India's west coast, built for **Singularity 2026 (AJIET Mangaluru)** — track "AI for Coastal Intelligence."

Coastal Intelligence is a fork of [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view) (Bilawal Sidhu / Halfpixel, MIT licensed) narrowed to coastal/ocean risk data and re-pointed at Mangaluru's coastline by default. It keeps the CesiumJS 3D globe, camera/cockpit system, and voice-control architecture, and swaps out the general-purpose "spy satellite simulator" layer set for a coastal-focused one.

## What's live vs. what's mocked

Be explicit about this with judges — don't overclaim:

| Layer | Status | Source |
|---|---|---|
| Vessel tracking | **Live** | AISStream (requires a free `AISSTREAM_API_KEY`) |
| Wind | **Live** | NOAA GFS, keyless |
| Weather radar / satellite / lightning | **Live** | Existing weather providers, keyless |
| Cyclones | **Live** | NOAA NHC/CPHC advisories, keyless |
| Earthquakes | **Live** | USGS, keyless |
| Coastal conditions (wave height, sea surface temp) | **Live, with labeled sample fallback** | Open-Meteo Marine API, keyless. If a point's request fails (offline, rate limit, coverage), that point is clearly labeled "SAMPLE DATA (offline fallback)" instead of blocking the layer. |
| Tsunami-risk heuristic | **Heuristic, not authoritative** | Computed client-side from the earthquake feed (magnitude + depth + distance to a coast point). Always paired with a pointer to [INCOIS](https://tsunami.incois.gov.in) / [PTWC](https://ptwc.weather.gov) for real confirmation. |
| Coastal Risk Index | **Heuristic, computed client-side** | Combines cyclone proximity, wind speed, wave height, and the tsunami heuristic into a single 0–100 score. No new backend. |
| Directions/routing | **Live** | Existing OSRM-based module, reframed for port-to-shore / evacuation-style routing |

Everything else from the original God's Eye View catalog (flights, military tracking, CCTV, radio, road traffic, transit, satellites, bikeshare, ALPR, installations, FIRMS wildfire, fire perimeters, submarine cables, rocket launches, local ADS-B) is **present in the codebase but not constructed by the app** — see "What we deliberately did not delete" below.

## What we deliberately did not delete

This codebase is not a loose pile of files — it's a tightly validated system: a single layer catalog (`src/app/constructCatalog.js`) that must have an exact 1:1 match between constructed layers and their serialization metadata, plus a 4,000+ line voice-agent action file (`src/voice/gevActions.js`) that imports a few specific symbols by name from otherwise-unrelated layer modules (CCTV, radio, military classification).

Ripping out ~15 non-coastal subsystems by deleting files, done blind and unverified in a single pass, is exactly the kind of change that looks done but silently breaks the build in a spot nobody checks before a demo. So instead:

- **The one real control point was edited**: `src/app/constructCatalog.js` now only *constructs* the coastal layer set (vessels, wind, weather ×3, cyclones, earthquakes, directions, plus the new marine layer). Everything else's code is still on disk, but it is never registered, never fetches data, and never shows up in the UI.
- **`src/app/catalog.js`** was patched so the small set of UI code paths that reference the now-absent layers (world-jump suspend/resume, tracking stop, etc.) get a harmless no-op stand-in instead of crashing.
- **Nothing was physically deleted** in this pass. If you want the dead files gone for a cleaner repo (not required for the demo to work), the safe removals are: `src/layers/{alpr,localAdsb,submarineCables,bikeshare,traffic,transit,firms,perimeters,rocketLaunches}/`, `src/data/{alprCameras,bikeshare,fireAnchors,firmsHeatmap,flowTiles,telegeographySubmarineCables,traffic,transit,militaryInstallations,militaryRegistry}.js`, and the Nepal "Bhote Koshi 2026" demo (`src/data/bhoteKoshi*.js`, `src/scenes/nepalEvidencePack.js`, `src/scenes/packs/nepal.js`). **Do not** delete `src/layers/cctv/`, `src/data/radioCountry.js`, or `src/data/tr3bRegistry.js` without first removing their imports from `src/voice/gevActions.js` — that file still references them directly.

## New coastal-specific code

- `src/config/coastalRegion.js` — default region (Mangaluru) plus Kochi/Goa presets and marine sample points. Change `ACTIVE_COASTAL_REGION_ID` to switch coastlines everywhere at once (camera start position, marine layer sample points).
- `src/data/marineConditions.js` + `src/layers/marine/index.js` — the new Coastal Conditions layer (wave height / sea surface temperature) via Open-Meteo Marine, with labeled mock fallback.
- `src/data/tsunamiHeuristic.js` — `assessTsunamiHeuristic(quake, coastPoint)`, a magnitude + depth + proximity heuristic. Not wired into the earthquake layer's rendering in this pass (that file is intricate — see below); call it directly from HUD/voice code with a quake record (`{ lat, lon, mag, depthKm }` — matches `src/layers/earthquakes/records.js`) and a coast point from `coastalRegion.js`.
- `src/data/coastalRiskIndex.js` — `computeCoastalRiskIndex({ cycloneDistanceKm, cycloneCategory, windSpeedKmh, waveHeightMeters, tsunamiLevel })` returns `{ score, band, factors }`. Pure function, no fetches — feed it whatever you already have from the cyclone/wind/marine layers when you wire it into the HUD.
- `src/camera.js` — the startup fly-in now flies to the active coastal region instead of Austin, TX.

## Submarine / underwater "dive mode" — an honest assessment

The brief asked for a vehicle that can fly *and* submerge to "explore inside the sea." Cesium has **no default bathymetry, no seafloor terrain, and no free source of underwater 3D content** — there's nothing to render down there without commissioning custom data, which isn't a free/keyless/24-hour option. Framing this to judges as "explore the real seafloor" would be over-claiming.

What's realistic, and is included: `src/diveMode.js` exports `createDiveMode(viewer)`, giving you `enter()` / `exit()` / `toggle()`. It disables camera collision detection and applies a blue fog/tint so the cockpit camera can drop below sea level and visually read as "submersible." It is **not wired to a cockpit button or keybinding** in this pass — call `diveMode.toggle()` from wherever the cockpit's existing control-scheme handler lives (e.g. alongside the other mode toggles in `src/cockpitUtilityLayout.js` / `src/cockpitVisionPolicy.js`) to expose it in the UI. Pitch it to judges as "submersible piloting mode for inspecting vessel positions and coastal conditions from below the surface," not literal seafloor exploration.

## Setup

```bash
npm ci
cp .env.example .env   # fill in AISSTREAM_API_KEY for live vessels; everything else coastal-relevant is keyless
npm run dev
```

No paid APIs are required for the demo. Vessel tracking needs a free AISStream key; every other coastal layer kept in this build (wind, weather, cyclones, earthquakes, marine conditions) is keyless.

## Hackathon pitch (one paragraph)

Coastal Intelligence fuses live vessel traffic, cyclone advisories, wind and wave conditions, and a tsunami-risk heuristic derived from real-time seismic data into a single 3D operating picture of India's west coast, centered on Mangaluru — giving fisheries, port authorities, and coastal communities one glanceable Coastal Risk Index instead of five disconnected feeds, with a voice-controlled interface so it stays usable hands-free during an actual weather event.
