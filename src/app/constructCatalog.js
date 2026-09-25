import { createWeatherClock } from '../layers/weather/clock.js';
import { createWeatherLayer } from '../layers/weather/index.js';
import { createCyclonesLayer } from '../layers/cyclones/index.js';
import { createWindLayer } from '../layers/wind/index.js';
import { createMarineLayer } from '../layers/marine/index.js';
import { createLayerCatalog } from './catalog.js';
import { LAYER_STATE_REGISTRY } from '../data/layerState.js';
import { createApplicationVessels } from './layers/aisLiveVessels.js';
import { createApplicationDirections } from './layers/directions.js';
import { createApplicationEarthquakes } from './layers/earthquakes.js';

const SOURCE_METHODS = Object.freeze({
  vessels: ['getSnapshot'],
  wind: ['getSnapshot'],
  weather: ['getSnapshot'],
  cyclones: ['getSnapshot'],
  earthquakes: ['getSnapshot'],
});

/**
 * Coastal Intelligence keeps only the layers relevant to coastal/ocean risk
 * monitoring. Everything else from the original catalog (flights, military,
 * CCTV, radio, traffic, transit, satellites, bikeshare, ALPR, installations,
 * FIRMS, fire perimeters, submarine cables, launches, local ADS-B) is left
 * un-constructed here rather than deleted outright: several of those modules
 * are still imported by name elsewhere (e.g. the voice action runner), so
 * removing the files themselves is a separate, larger cleanup pass. This
 * allow-list is the single point that controls what actually runs.
 */
const COASTAL_LAYER_IDS = Object.freeze([
  'ais-live-vessels',
  'directions',
  'earthquakes',
  'weather-cyclones',
  'weather-lightning',
  'weather-radar',
  'weather-satellite',
  'wind',
]);

const MARINE_LAYER_METADATA = Object.freeze({
  id: 'marine-conditions',
  token: '3',
  disposition: 'enabled-only',
});

/** Hardware-local layers are registered like any other but never enter share links. */
export const LOCAL_ONLY_LAYER_METADATA = Object.freeze([]);

/** Serialization metadata for every layer the application catalog constructs. */
export const APPLICATION_LAYER_METADATA = Object.freeze([
  ...LAYER_STATE_REGISTRY.filter((entry) => COASTAL_LAYER_IDS.includes(entry.id)),
  MARINE_LAYER_METADATA,
  ...LOCAL_ONLY_LAYER_METADATA,
]);

/** Construct the current catalog without choosing any source provider.
 * Scene engines remain page-owned; layers have this app's lifetime.
 * The manager owns layer destruction, while abort releases the weather
 * clock even if startup fails.
 */
export function createApplicationCatalog({
  surface,
  sources,
  signal,
  metadata = APPLICATION_LAYER_METADATA,
  vesselOptions,
  resolveAsset,
}) {
  if (!signal?.addEventListener)
    throw new TypeError('An application lifetime signal is required');
  signal.throwIfAborted();
  if (!surface?.groundFloor || !surface?.terrain)
    throw new TypeError('Application surface services are required');

  for (const [name, methods] of Object.entries(SOURCE_METHODS)) {
    if (
      methods.some((method) => typeof sources?.[name]?.[method] !== 'function')
    )
      throw new TypeError(`Invalid catalog source: ${name}`);
  }
  const weatherClock = createWeatherClock();
  const dispose = () => {
    signal.removeEventListener('abort', dispose);
    weatherClock.destroy();
  };
  signal.addEventListener('abort', dispose, { once: true });
  try {
    const vessels = createApplicationVessels({
      source: sources.vessels,
      options: vesselOptions,
    });
    const catalog = createLayerCatalog(
      [
        createApplicationEarthquakes({ source: sources.earthquakes }),
        createApplicationDirections(),
        vessels,
        createMarineLayer(),
        createWindLayer({ feed: sources.wind, clock: weatherClock }),
        createWeatherLayer({
          feed: sources.weather,
          id: 'weather-radar',
          clock: weatherClock,
        }),
        createWeatherLayer({
          feed: sources.weather,
          id: 'weather-satellite',
          clock: weatherClock,
        }),
        createWeatherLayer({
          feed: sources.weather,
          id: 'weather-lightning',
          clock: weatherClock,
        }),
        createCyclonesLayer({ feed: sources.cyclones }),
      ],
      metadata,
    );
    return Object.freeze({
      ...catalog,
      surface,
      weatherClock,
    });
  } catch (error) {
    dispose();
    throw error;
  }
}
