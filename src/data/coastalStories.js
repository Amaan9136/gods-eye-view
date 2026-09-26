/**
 * Coastal Stories: short, narrated context for real coastal hazard events,
 * in the spirit of the original project's Bhote Koshi 2026 (Nepal) incident
 * pack — but implemented as a lightweight, self-contained camera fly-to +
 * text panel instead of hooking into the cinematic shot/tileset "director"
 * system that pack uses (src/scenes/, src/director/). That system expects
 * authored shot choreography and specific tileset credentials that don't
 * exist for these events, so replicating it fully would either be fake or
 * require paid/unavailable assets. This gives the same narrative value
 * (fly there, read what happened, see today's live layers on top of it)
 * without that dependency.
 *
 * Sources are public reporting; treat the summaries as scene-setting
 * context for a demo, not as an authoritative hazard record.
 */
export const COASTAL_STORIES = Object.freeze([
  Object.freeze({
    id: 'indian-ocean-tsunami-2004-india',
    title: '26 December 2004 — Indian Ocean tsunami, Indian coast',
    longitude: 80.27,
    latitude: 13.08,
    cameraHeightMeters: 20000,
    dateLabel: '26 Dec 2004',
    summary:
      'A magnitude ~9.1 undersea earthquake off Sumatra sent tsunami waves across the Indian Ocean; along India\'s Tamil Nadu, Andhra Pradesh, Kerala, Puducherry, and the Andaman & Nicobar Islands, the waves caused mass casualties and destroyed coastal fishing settlements, with almost no warning system in place at the time. It is the direct reason India joined the Indian Ocean Tsunami Warning System and INCOIS now runs India\'s tsunami advisory service.',
    relatedRegionId: 'chennai',
  }),
  Object.freeze({
    id: 'cyclone-fani-2019-odisha',
    title: '3 May 2019 — Cyclone Fani landfall, Odisha coast',
    longitude: 85.83,
    latitude: 19.8,
    cameraHeightMeters: 20000,
    dateLabel: '3 May 2019',
    summary:
      'Cyclone Fani made landfall near Puri, Odisha as an extremely severe cyclonic storm. India\'s early-warning and mass-evacuation response — moving over a million people ahead of landfall — is widely cited as a model for cyclone preparedness, in sharp contrast to the far higher death tolls of comparable-strength cyclones elsewhere without that infrastructure.',
    relatedRegionId: 'puri',
  }),
  Object.freeze({
    id: 'kerala-floods-2018-coast',
    title: 'August 2018 — Kerala floods, backwaters and coast',
    longitude: 76.27,
    latitude: 9.93,
    cameraHeightMeters: 20000,
    dateLabel: 'Aug 2018',
    summary:
      'Unusually intense monsoon rainfall caused Kerala\'s dams to reach capacity and release water simultaneously, flooding the backwaters and coastal lowlands around Kochi and Alappuzha. It is a reminder that coastal risk in this region is not only cyclones and tsunamis — inland rainfall and dam management directly determine coastal flood severity.',
    relatedRegionId: 'kochi',
  }),
]);

export function getCoastalStory(id) {
  return COASTAL_STORIES.find((story) => story.id === id) || null;
}
