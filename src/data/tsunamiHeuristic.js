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
 * Client-side, non-authoritative heuristic only: magnitude + shallow depth +
 * proximity to a coastline point. This is NOT a tsunami warning system. Any
 * "elevated" or "watch" result must be paired in the UI with a pointer to
 * INCOIS (https://tsunami.incois.gov.in) or PTWC (https://ptwc.weather.gov)
 * for authoritative confirmation.
 */
export function assessTsunamiHeuristic(
  quake,
  coastPoint,
  { watchDistanceKm = 300, alertDistanceKm = 120 } = {},
) {
  if (!quake || typeof quake.mag !== 'number') {
    return { level: 'none', reason: 'No usable magnitude' };
  }
  const magnitude = quake.mag;
  const depthKm = typeof quake.depthKm === 'number' ? quake.depthKm : null;
  const distanceKm = coastPoint
    ? haversineKm(quake.lat, quake.lon, coastPoint.latitude, coastPoint.longitude)
    : null;

  if (magnitude < 6.0) {
    return { level: 'none', reason: 'Below heuristic magnitude floor (6.0)', distanceKm };
  }
  const isShallow = depthKm == null || depthKm <= 70;
  if (!isShallow) {
    return { level: 'none', reason: 'Deep-focus quake, low heuristic tsunami risk', distanceKm };
  }
  if (distanceKm != null && distanceKm <= alertDistanceKm && magnitude >= 6.5) {
    return {
      level: 'watch',
      reason: `M${magnitude.toFixed(1)}, shallow, ${Math.round(distanceKm)}km from coast — verify with INCOIS/PTWC`,
      distanceKm,
    };
  }
  if (distanceKm != null && distanceKm <= watchDistanceKm && magnitude >= 7.0) {
    return {
      level: 'watch',
      reason: `M${magnitude.toFixed(1)}, shallow, ${Math.round(distanceKm)}km from coast — verify with INCOIS/PTWC`,
      distanceKm,
    };
  }
  return { level: 'none', reason: 'Below heuristic thresholds', distanceKm };
}
