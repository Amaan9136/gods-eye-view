import { getActiveCoastalRegion } from '../config/coastalRegion.js';

const MARINE_API_BASE = 'https://marine-api.open-meteo.com/v1/marine';
const MOCK_LABEL = 'SAMPLE DATA (offline fallback)';
const LIVE_LABEL = 'Open-Meteo Marine · LIVE';

function mockReading(point) {
  return {
    id: point.id,
    label: point.label,
    longitude: point.longitude,
    latitude: point.latitude,
    waveHeightMeters: 1.2,
    seaSurfaceTempC: 28.5,
    swellPeriodSeconds: 8,
    source: MOCK_LABEL,
    isMock: true,
  };
}

async function fetchPoint(point, { signal } = {}) {
  const params = new URLSearchParams({
    latitude: String(point.latitude),
    longitude: String(point.longitude),
    hourly: 'wave_height,sea_surface_temperature,swell_wave_period',
    timezone: 'auto',
    forecast_days: '1',
  });
  const response = await fetch(`${MARINE_API_BASE}?${params.toString()}`, {
    signal,
  });
  if (!response.ok) throw new Error(`Marine API HTTP ${response.status}`);
  const body = await response.json();
  const hourly = body?.hourly;
  if (!hourly?.time?.length) throw new Error('Marine API returned no data');
  const now = Date.now();
  let index = 0;
  let best = Infinity;
  hourly.time.forEach((iso, i) => {
    const diff = Math.abs(Date.parse(iso) - now);
    if (diff < best) {
      best = diff;
      index = i;
    }
  });
  return {
    id: point.id,
    label: point.label,
    longitude: point.longitude,
    latitude: point.latitude,
    waveHeightMeters: hourly.wave_height?.[index] ?? null,
    seaSurfaceTempC: hourly.sea_surface_temperature?.[index] ?? null,
    swellPeriodSeconds: hourly.swell_wave_period?.[index] ?? null,
    source: LIVE_LABEL,
    isMock: false,
  };
}

/**
 * Fetch a coastal-conditions snapshot for the active region's sample points.
 * Free, keyless Open-Meteo Marine API; any point that fails (offline demo,
 * rate limit, coverage gap) falls back to clearly labeled sample data so the
 * layer never blocks the build or the demo.
 */
export async function getMarineSnapshot({ signal } = {}) {
  const region = getActiveCoastalRegion();
  const points = region.marineSamplePoints || [];
  const readings = await Promise.all(
    points.map((point) =>
      fetchPoint(point, { signal }).catch(() => mockReading(point)),
    ),
  );
  return { region: region.id, readings, fetchedAt: Date.now() };
}
