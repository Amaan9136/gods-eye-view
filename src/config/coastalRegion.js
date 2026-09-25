export const COASTAL_REGIONS = Object.freeze({
  mangaluru: Object.freeze({
    id: 'mangaluru',
    label: 'Mangaluru, Karnataka, India',
    center: Object.freeze({ longitude: 74.84, latitude: 12.87 }),
    cameraHeightMeters: 45000,
    boundingBox: Object.freeze({
      west: 73.6,
      south: 11.7,
      east: 76.0,
      north: 14.6,
    }),
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
    boundingBox: Object.freeze({
      west: 75.7,
      south: 8.9,
      east: 77.2,
      north: 10.6,
    }),
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
    boundingBox: Object.freeze({
      west: 73.5,
      south: 14.9,
      east: 74.3,
      north: 15.9,
    }),
    marineSamplePoints: Object.freeze([
      Object.freeze({ id: 'mormugao-port', label: 'Mormugao Port', longitude: 73.79, latitude: 15.42 }),
      Object.freeze({ id: 'calangute', label: 'Calangute Beach', longitude: 73.76, latitude: 15.55 }),
    ]),
  }),
});

export const ACTIVE_COASTAL_REGION_ID = 'mangaluru';

export function getActiveCoastalRegion() {
  return COASTAL_REGIONS[ACTIVE_COASTAL_REGION_ID] || COASTAL_REGIONS.mangaluru;
}
