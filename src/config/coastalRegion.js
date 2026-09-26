/**
 * Coastal Intelligence is a planet-wide coastal/ocean risk platform, not a
 * single-city tool. This file just lists a handful of starter regions —
 * Mangaluru is the default
 * but the same vessel/wind/weather/cyclone/earthquake/marine layers work
 * anywhere on Earth. Add a region here, or fly anywhere with the existing
 * place-search / fly-to-location feature — nothing else is India-specific.
 */
export const COASTAL_REGIONS = Object.freeze({
  mangaluru: Object.freeze({
    id: 'mangaluru',
    label: 'Mangaluru, Karnataka, India',
    center: Object.freeze({ longitude: 74.84, latitude: 12.87 }),
    cameraHeightMeters: 45000,
    boundingBox: Object.freeze({ west: 73.6, south: 11.7, east: 76.0, north: 14.6 }),
    marineSamplePoints: Object.freeze([
      Object.freeze({ id: 'new-mangalore-port', label: 'New Mangalore Port', longitude: 74.805, latitude: 12.925 }),
      Object.freeze({ id: 'malpe', label: 'Malpe Harbour', longitude: 74.703, latitude: 13.35 }),
      Object.freeze({ id: 'mulki', label: 'Mulki Coast', longitude: 74.79, latitude: 13.09 }),
      Object.freeze({ id: 'someshwara', label: 'Someshwara Beach', longitude: 74.83, latitude: 12.79 }),
    ]),
  }),
  kochi: Object.freeze({
    id: 'kochi',
    label: 'Kochi, Kerala, India',
    center: Object.freeze({ longitude: 76.27, latitude: 9.93 }),
    cameraHeightMeters: 45000,
    boundingBox: Object.freeze({ west: 75.7, south: 8.9, east: 77.2, north: 10.6 }),
    marineSamplePoints: Object.freeze([
      Object.freeze({ id: 'kochi-port', label: 'Kochi Port', longitude: 76.24, latitude: 9.95 }),
      Object.freeze({ id: 'alappuzha', label: 'Alappuzha Coast', longitude: 76.31, latitude: 9.49 }),
    ]),
  }),
  goa: Object.freeze({
    id: 'goa',
    label: 'Goa, India',
    center: Object.freeze({ longitude: 73.9, latitude: 15.45 }),
    cameraHeightMeters: 45000,
    boundingBox: Object.freeze({ west: 73.5, south: 14.9, east: 74.3, north: 15.9 }),
    marineSamplePoints: Object.freeze([
      Object.freeze({ id: 'mormugao-port', label: 'Mormugao Port', longitude: 73.79, latitude: 15.42 }),
      Object.freeze({ id: 'calangute', label: 'Calangute Beach', longitude: 73.76, latitude: 15.55 }),
    ]),
  }),
  chennai: Object.freeze({
    id: 'chennai',
    label: 'Chennai, Tamil Nadu, India',
    center: Object.freeze({ longitude: 80.27, latitude: 13.08 }),
    cameraHeightMeters: 45000,
    boundingBox: Object.freeze({ west: 79.7, south: 12.5, east: 80.6, north: 13.6 }),
    marineSamplePoints: Object.freeze([
      Object.freeze({ id: 'chennai-port', label: 'Chennai Port', longitude: 80.29, latitude: 13.1 }),
      Object.freeze({ id: 'marina-beach', label: 'Marina Beach', longitude: 80.28, latitude: 13.05 }),
    ]),
  }),
  puri: Object.freeze({
    id: 'puri',
    label: 'Puri, Odisha, India',
    center: Object.freeze({ longitude: 85.83, latitude: 19.8 }),
    cameraHeightMeters: 45000,
    boundingBox: Object.freeze({ west: 85.3, south: 19.3, east: 86.5, north: 20.3 }),
    marineSamplePoints: Object.freeze([
      Object.freeze({ id: 'puri-beach', label: 'Puri Beach', longitude: 85.83, latitude: 19.8 }),
      Object.freeze({ id: 'paradip-port', label: 'Paradip Port', longitude: 86.61, latitude: 20.27 }),
    ]),
  }),
  miami: Object.freeze({
    id: 'miami',
    label: 'Miami, Florida, USA',
    center: Object.freeze({ longitude: -80.19, latitude: 25.76 }),
    cameraHeightMeters: 45000,
    boundingBox: Object.freeze({ west: -80.6, south: 25.3, east: -79.9, north: 26.2 }),
    marineSamplePoints: Object.freeze([
      Object.freeze({ id: 'port-miami', label: 'PortMiami', longitude: -80.17, latitude: 25.77 }),
      Object.freeze({ id: 'south-beach', label: 'South Beach', longitude: -80.13, latitude: 25.78 }),
    ]),
  }),
  rotterdam: Object.freeze({
    id: 'rotterdam',
    label: 'Rotterdam, Netherlands',
    center: Object.freeze({ longitude: 4.48, latitude: 51.92 }),
    cameraHeightMeters: 45000,
    boundingBox: Object.freeze({ west: 3.9, south: 51.7, east: 4.7, north: 52.1 }),
    marineSamplePoints: Object.freeze([
      Object.freeze({ id: 'port-of-rotterdam', label: 'Port of Rotterdam', longitude: 4.14, latitude: 51.95 }),
      Object.freeze({ id: 'hoek-van-holland', label: 'Hoek van Holland', longitude: 4.12, latitude: 51.98 }),
    ]),
  }),
  jakarta: Object.freeze({
    id: 'jakarta',
    label: 'Jakarta Bay, Indonesia',
    center: Object.freeze({ longitude: 106.85, latitude: -6.1 }),
    cameraHeightMeters: 45000,
    boundingBox: Object.freeze({ west: 106.3, south: -6.5, east: 107.2, north: -5.7 }),
    marineSamplePoints: Object.freeze([
      Object.freeze({ id: 'tanjung-priok', label: 'Tanjung Priok Port', longitude: 106.88, latitude: -6.1 }),
    ]),
  }),
  sydney: Object.freeze({
    id: 'sydney',
    label: 'Sydney, Australia',
    center: Object.freeze({ longitude: 151.21, latitude: -33.87 }),
    cameraHeightMeters: 45000,
    boundingBox: Object.freeze({ west: 150.9, south: -34.1, east: 151.4, north: -33.6 }),
    marineSamplePoints: Object.freeze([
      Object.freeze({ id: 'port-botany', label: 'Port Botany', longitude: 151.22, latitude: -33.97 }),
      Object.freeze({ id: 'bondi-beach', label: 'Bondi Beach', longitude: 151.27, latitude: -33.89 }),
    ]),
  }),
});

/** Default demo region — change this to change the whole app's starting focus. */
export const ACTIVE_COASTAL_REGION_ID = 'mangaluru';

export function getActiveCoastalRegion() {
  return COASTAL_REGIONS[ACTIVE_COASTAL_REGION_ID] || COASTAL_REGIONS.mangaluru;
}

export function getCoastalRegion(id) {
  return COASTAL_REGIONS[id] || null;
}

export function listCoastalRegions() {
  return Object.values(COASTAL_REGIONS);
}
