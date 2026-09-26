# Coastal Intelligence (Coastal Eye)

AI-powered coastal risk and monitoring platform for **planet Earth** — a fork of [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view) (Bilawal Sidhu, MIT licensed) narrowed from a general-purpose live-tracking globe to coastal/ocean risk data.

## How this differs from the original God's Eye View

| | Original God's Eye View | Coastal Intelligence |
|---|---|---|
| Framing | General-purpose "spy satellite simulator" — flights, military tracking, CCTV, radio, traffic, transit, satellites, bikeshare, ALPR, FIRMS wildfire, submarine cables, rocket launches, etc. | Coastal/ocean risk only: vessels, wind, weather (radar/satellite/lightning), cyclones, earthquakes, plus a new marine-conditions layer |
| Default view | Austin, TX | Mangaluru, Karnataka (config-driven; Kochi, Goa, Chennai, Puri, Miami, Rotterdam, Jakarta, Sydney also included as presets) |
| Layer construction | `src/app/constructCatalog.js` builds ~20 layers | Same file now builds only the coastal set + the new marine layer (see "What was changed" below) |
| Risk synthesis | None | New Coastal Risk Index combining cyclone proximity + wind + wave height + a tsunami heuristic, computed client-side from data already being fetched |
| Historical context | Bhote Koshi 2026 (Nepal flood) cinematic incident pack | Coastal Stories: lightweight fly-to + narrative panels for the 2004 Indian Ocean tsunami, Cyclone Fani (2019), and the 2018 Kerala floods |
| Underwater mode | None | Dive Mode: cosmetic submersible camera toggle (see caveats below) |
| Branding | "God's Eye View" throughout UI/voice/package metadata | "Coastal Intelligence" throughout |

## What's live vs. what's mocked

| Layer | Status | Source |
|---|---|---|
| Vessel tracking | **Live** | AISStream (free `AISSTREAM_API_KEY`) |
| Wind | **Live** | NOAA GFS, keyless |
| Weather radar / satellite / lightning | **Live** | Existing weather providers, keyless |
| Cyclones | **Live** | NOAA NHC/CPHC advisories, keyless |
| Earthquakes | **Live** | USGS, keyless |
| Coastal conditions (wave height, sea surface temp) | **Live, with labeled sample fallback** | Open-Meteo Marine API, keyless. A point that fails to fetch (offline, rate limit, coverage gap) is labeled "SAMPLE DATA (offline fallback)" instead of blocking the layer. |
| Tsunami-risk heuristic | **Heuristic, not authoritative** | Client-side, from the earthquake feed's magnitude/depth/location. Always paired with a pointer to INCOIS/PTWC for real confirmation. |
| Coastal Risk Index | **Heuristic, computed client-side** | Combines cyclone proximity, wind speed, wave height, tsunami heuristic → 0–100 score. No new backend. |
| Coastal Stories | **Static, hand-written summaries** | Public-reporting context for 3 real events; not a live feed. |
| Directions/routing | **Live** | Existing OSRM-based module |

Everything the original had that isn't coastal (flights, military, CCTV, radio, traffic, transit, satellites, bikeshare, ALPR, installations, FIRMS, fire perimeters, submarine cables, launches, local ADS-B) is **still on disk, untouched, but not constructed by the app** — nothing was deleted.

## How to access what's new

- **Default region on load**: just open the app — camera flies to Mangaluru automatically (`src/camera.js` → `flyToAustin`, now config-driven despite the old name; call-site compatibility is why the name stayed).
- **Switch region**: edit `ACTIVE_COASTAL_REGION_ID` in `src/config/coastalRegion.js`, or call `flyToCoastalRegion(viewer, getCoastalRegion('kochi'))` from `src/camera.js` at runtime (e.g. wire it to a dropdown — not yet wired to a UI control in this pass).
- **Coastal Conditions (marine) layer**: it's now a normal catalog layer (`marine-conditions`) — it should already appear in whatever "Data Layers" panel/menu lists the other layers (wind, cyclones, etc.), toggle it on the same way. If the panel doesn't auto-discover new layer ids, call `catalog.get('marine-conditions').enable()` directly.
- **Tsunami heuristic**: not auto-wired into the earthquake layer's rendering (that module is intricate — see "What we deliberately did not touch"). Call it yourself: `assessTsunamiHeuristic(quakeRecord, coastPoint)` from `src/data/tsunamiHeuristic.js`, where `quakeRecord` is `{ lat, lon, mag, depthKm }` (matches `src/layers/earthquakes/records.js`) and `coastPoint` is any point from a region's `marineSamplePoints`.
- **Coastal Risk Index**: `computeCoastalRiskIndex({ cycloneDistanceKm, cycloneCategory, windSpeedKmh, waveHeightMeters, tsunamiLevel })` from `src/data/coastalRiskIndex.js`. Not rendered as a HUD badge yet — feed it real numbers from the cyclone/wind/marine layers and render `{ score, band, factors }` wherever you want the badge.
- **Coastal Stories**: `import { COASTAL_STORIES } from './src/data/coastalStories.js'`, then `flyToCoastalStory(viewer, story)` from `src/camera.js` to fly there and get back `{ title, dateLabel, summary }` for a text panel. `findNearbyCoastalStories(lon, lat, radiusKm)` in `src/data/coastalTools.js` finds ones near wherever the camera currently is.
- **Nearest port / risk briefing text**: `findNearestPort(lon, lat)` and `buildCoastalRiskBriefing({ regionLabel, riskIndex, tsunami })`, both in `src/data/coastalTools.js` — plain functions, call them from the HUD or wire them as voice tools (see below).
- **Dive Mode**: `import { createDiveMode } from './src/diveMode.js'; const dive = createDiveMode(viewer); dive.toggle();` — not bound to a cockpit button yet; wire it alongside the existing mode toggles in the cockpit UI to expose it.

### Adding a new voice tool

`src/voice/gevActions.js` is one large action-runner function with its own tool-schema conventions in `server/providers/openai/toolDescriptions.js` (`$position`-ordered parameters). I did not hand-edit that 4,500-line file blind — no way to test it here, and a mistake there breaks every existing voice tool, not just a new one. To add `findNearestPort` / `buildCoastalRiskBriefing` / `findNearbyCoastalStories` as real voice tools: add a case to the runner in `gevActions.js` that calls the function from `coastalTools.js`, add a matching entry to `ACTION_DESCRIPTIONS` in `toolDescriptions.js`, and register the tool name wherever the runner's dispatch table lists valid action names. This is mechanical but should be done with the app actually running so you can verify the new tool round-trips correctly.

## What we deliberately did not touch (and did not delete)

Nothing in this project has been deleted. The catalog is strictly validated — `src/app/constructCatalog.js` requires an exact 1:1 match between constructed layers and their serialization metadata — and a few files (`src/voice/gevActions.js`, `src/overlays/worldOverlayAllocation.worker.mjs`) import specific symbols by name from otherwise-unrelated layer modules (CCTV, radio, military classification). Deleting those modules without also hand-editing every reference is exactly the kind of change that looks done but silently breaks the build in a spot nobody checks before a demo — so instead:

- **`src/app/constructCatalog.js`** is the one real control point: it only *constructs* the coastal layer set. Everything else's code is still on disk but never registered, never fetches data, never shows up in the UI.
- **`src/app/catalog.js`** was patched so the UI code paths that reference the now-absent layers (world-jump, tracking-stop, the local SDR radio receiver panel, etc.) get a safe stand-in instead of crashing. See the fix note below — an earlier version of this stand-in had a real bug.

## Fixed: `receiver.getState is not a function`

This was a real bug in the previous pass, in `src/app/catalog.js`. The stand-in for a removed control layer (e.g. `localAdsbLayer`) was a `Proxy` that returned a *function* for any property access, including data properties. `src/ui/applicationShell.js` does:

```js
const receiver = this.services.localAdsbLayer?.receiver;
if (receiver) {
  this._localSdrControls = new LocalSdrControls({ receiver, ... }); // constructor calls receiver.getState()
}
```

Because `.receiver` resolved to a function (truthy), `if (receiver)` passed, and the SDR-controls constructor then called `.getState()` on that function — which doesn't have one. Fixed by having the stand-in return `undefined` for the couple of known data properties (`receiver`, `feeds`) while still returning a no-op function for method calls elsewhere in the codebase that call these stand-ins directly without `?.` (e.g. `radioLayer.getUIState()`, `cctvLayer.focusCamera(id)`). See the comment on `noopControlLayerStub` in `src/app/catalog.js` for the full reasoning.

## Fixed: cockpit "flight" mode was completely unreachable

The cockpit HUD (`src/ui/cockpit*.js`) — the "spaceship"-style free-look flying view — only ever activates by locking onto a **tracked aircraft entity** supplied by the flights/military layers. Since those layers are no longer constructed, `readAircraftInfo()` in `src/ui/cockpitTrackingController.js` always returned `null`, so pressing `C` did nothing — for any entity, not just aircraft. That's a real regression, not a pre-existing limitation.

Fixed by making `readAircraftInfo()` fall back to a minimal synthetic info object for **any** currently-tracked Cesium entity when no aircraft-layer data exists — the rest of the cockpit camera math (`cockpitCamera.js`) already drives position generically off `this.trackedEntity.position`, and already no-ops safely on a non-finite heading (`normalizeHeading()` returns 0 for `NaN`), so this didn't require touching the camera math itself. Practically: **double-click a tracked vessel, then press `C`** to enter cockpit view riding it; toggle Dive Mode (see below) to take it under the surface. One caveat I couldn't verify without running the app: `src/layers/vessels/selection.js` has a comment stating vessels never explicitly set `viewer.trackedEntity` themselves — double-click-to-track is expected to come from Cesium's own default handler, which the app doesn't appear to override, but confirm this actually fires for a vessel before relying on it.



Cesium has no default bathymetry, no seafloor terrain, and no free source of underwater 3D content — there's nothing to render down there without commissioning custom data, which isn't a free/keyless/24-hour option. `src/diveMode.js` gives a **cosmetic submersible mode** instead: the cockpit camera can drop below sea level (collision detection off) with a blue fog/tint. Pitch it as "submersible piloting mode for inspecting vessel positions and coastal conditions from below the surface," not literal seafloor exploration.

## Setup

```bash
npm ci
cp .env.example .env   # fill in AISSTREAM_API_KEY for live vessels; every other coastal layer kept here is keyless
npm run dev
```

No paid APIs are required for the demo.

## Hackathon pitch (one paragraph)

Coastal Intelligence fuses live vessel traffic, cyclone advisories, wind and wave conditions, and a tsunami-risk heuristic derived from real-time seismic data into a single 3D operating picture of any coastline on Earth — demoed on Mangaluru's, with real Indian coastal-hazard context (the 2004 tsunami, Cyclone Fani, the 2018 Kerala floods) built in — giving fisheries, port authorities, and coastal communities one glanceable Coastal Risk Index instead of five disconnected feeds, with a voice-controlled interface so it stays usable hands-free during an actual weather event.
