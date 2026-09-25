/**
 * Coastal Risk Index: a single 0-100 client-side score combining already-
 * fetched layer data. No backend, no new fetches — callers pass in whatever
 * they already have from the cyclone, wind, wave, and earthquake layers.
 *
 * Expected shape of `signals` (all optional; missing fields just contribute
 * 0 to that factor):
 *   cycloneDistanceKm   number  distance to nearest active cyclone track/eye
 *   cycloneCategory     number  0-5 (Saffir-Simpson-style), or null
 *   windSpeedKmh        number  sustained wind speed at/near the region
 *   waveHeightMeters    number  significant wave height at/near the coast
 *   tsunamiLevel        'none' | 'watch'   from assessTsunamiHeuristic()
 *
 * This is a heuristic communication aid for a hackathon demo, not a
 * validated hazard model — label it as such in the UI.
 */
export function computeCoastalRiskIndex(signals = {}) {
  const {
    cycloneDistanceKm = null,
    cycloneCategory = null,
    windSpeedKmh = null,
    waveHeightMeters = null,
    tsunamiLevel = 'none',
  } = signals;

  let score = 0;
  const factors = [];

  if (cycloneDistanceKm != null) {
    const proximity = Math.max(0, 1 - cycloneDistanceKm / 800);
    const categoryWeight = 1 + (cycloneCategory ?? 1) * 0.3;
    const contribution = Math.round(proximity * 35 * categoryWeight);
    if (contribution > 0) {
      score += contribution;
      factors.push(`cyclone ${Math.round(cycloneDistanceKm)}km away (+${contribution})`);
    }
  }

  if (windSpeedKmh != null) {
    const contribution = Math.round(Math.min(1, windSpeedKmh / 120) * 25);
    if (contribution > 0) {
      score += contribution;
      factors.push(`wind ${Math.round(windSpeedKmh)}km/h (+${contribution})`);
    }
  }

  if (waveHeightMeters != null) {
    const contribution = Math.round(Math.min(1, waveHeightMeters / 5) * 20);
    if (contribution > 0) {
      score += contribution;
      factors.push(`waves ${waveHeightMeters.toFixed(1)}m (+${contribution})`);
    }
  }

  if (tsunamiLevel === 'watch') {
    score += 20;
    factors.push('tsunami heuristic watch (+20 — verify with INCOIS/PTWC)');
  }

  score = Math.max(0, Math.min(100, score));

  let band = 'low';
  if (score >= 66) band = 'severe';
  else if (score >= 40) band = 'elevated';
  else if (score >= 15) band = 'moderate';

  return { score, band, factors };
}

export const COASTAL_RISK_BAND_COLORS = Object.freeze({
  low: '#2ecc71',
  moderate: '#f4d03f',
  elevated: '#e67e22',
  severe: '#e74c3c',
});
