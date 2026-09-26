import { listCoastalRegions } from '../config/coastalRegion.js';
import { COASTAL_STORIES } from './coastalStories.js';

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * New coastal-intelligence capabilities, written as plain, testable
 * functions rather than wired directly into src/voice/gevActions.js. That
 * file is a single ~4,500-line action runner with its own auto-generated
 * tool-schema conventions (see server/providers/openai/toolDescriptions.js,
 * $position-annotated parameters); bolting new cases onto it blind, with no
 * way to run the app here, risks silently breaking existing voice tools.
 * These functions are the real, callable logic — wiring each into a new
 * voice tool is 3 small, mechanical additions (see README "Adding a new
 * voice tool").
 */

/** Nearest known port/marine sample point to a coordinate, across every registered region. */
export function findNearestPort(longitude, latitude) {
  let best = null;
  let bestDistanceKm = Infinity;
  for (const region of listCoastalRegions()) {
    for (const point of region.marineSamplePoints || []) {
      const distanceKm = haversineKm(latitude, longitude, point.latitude, point.longitude);
      if (distanceKm < bestDistanceKm) {
        bestDistanceKm = distanceKm;
        best = { ...point, regionId: region.id, regionLabel: region.label, distanceKm };
      }
    }
  }
  return best;
}

/** Coastal Stories (see src/data/coastalStories.js) within radiusKm of a coordinate. */
export function findNearbyCoastalStories(longitude, latitude, radiusKm = 500) {
  return COASTAL_STORIES.map((story) => ({
    ...story,
    distanceKm: haversineKm(latitude, longitude, story.latitude, story.longitude),
  }))
    .filter((story) => story.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Plain-language risk briefing from already-computed signals. Pass the
 * output of computeCoastalRiskIndex() (src/data/coastalRiskIndex.js) and,
 * optionally, assessTsunamiHeuristic() (src/data/tsunamiHeuristic.js).
 * Pure string formatting — no fetches, safe to call from the HUD or a
 * voice tool handler.
 */
export function buildCoastalRiskBriefing({
  regionLabel = 'this coastline',
  riskIndex,
  tsunami,
} = {}) {
  if (!riskIndex) return `No coastal risk data available yet for ${regionLabel}.`;
  const bandPhrase = {
    low: 'low',
    moderate: 'moderate',
    elevated: 'elevated',
    severe: 'severe',
  }[riskIndex.band] || riskIndex.band;

  const lines = [
    `Coastal Risk Index for ${regionLabel}: ${riskIndex.score}/100 (${bandPhrase}).`,
  ];
  if (riskIndex.factors?.length) {
    lines.push(`Contributing factors: ${riskIndex.factors.join('; ')}.`);
  } else {
    lines.push('No active contributing factors detected.');
  }
  if (tsunami?.level === 'watch') {
    lines.push(
      `Tsunami heuristic: WATCH — ${tsunami.reason}. This is a local heuristic, not an official warning; verify with INCOIS (tsunami.incois.gov.in) or PTWC (ptwc.weather.gov).`,
    );
  }
  return lines.join(' ');
}
