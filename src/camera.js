import * as Cesium from 'cesium';
import { getActiveCoastalRegion } from './config/coastalRegion.js';

/**
 * Camera presets for notable locations.
 * Coastal Intelligence default: fly to the active coastal region on load.
 */
export const CAMERA_PRESETS = {
  austin: {
    destination: Cesium.Cartesian3.fromDegrees(-97.7431, 30.2672, 800),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-35),
      roll: 0.0,
    },
  },
  sf: {
    destination: Cesium.Cartesian3.fromDegrees(-122.4194, 37.7749, 1000),
    orientation: {
      heading: Cesium.Math.toRadians(30),
      pitch: Cesium.Math.toRadians(-30),
      roll: 0.0,
    },
  },
  nyc: {
    destination: Cesium.Cartesian3.fromDegrees(-73.9857, 40.7484, 1200),
    orientation: {
      heading: Cesium.Math.toRadians(-20),
      pitch: Cesium.Math.toRadians(-30),
      roll: 0.0,
    },
  },
};

/**
 * Fly the camera to a preset location with a smooth animation.
 */
export function flyToPreset(viewer, presetName, duration = 3.0) {
  const preset = CAMERA_PRESETS[presetName];
  if (!preset) return;

  viewer.camera.flyTo({
    destination: preset.destination,
    orientation: preset.orientation,
    duration,
    easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
  });
}

/**
 * Set camera to the active coastal region on load with a cinematic fly-in.
 * Kept as `flyToAustin` for call-site compatibility; the destination is
 * config-driven via src/config/coastalRegion.js, not hardcoded to Austin.
 * @returns {Function} Cancels the pending or active startup flight.
 */
export function flyToAustin(viewer) {
  const region = getActiveCoastalRegion();
  const { longitude, latitude } = region.center;
  // Start from a high altitude, then fly down
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 25000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0,
    },
  });

  // Cinematic fly-in after a brief pause
  const timer = setTimeout(() => {
    if (viewer.isDestroyed()) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 600),
      orientation: {
        heading: Cesium.Math.toRadians(15),
        pitch: Cesium.Math.toRadians(-30),
        roll: 0.0,
      },
      duration: 4.0,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
    });
  }, 500);
  return () => {
    clearTimeout(timer);
    if (!viewer.isDestroyed()) viewer.camera.cancelFlight();
  };
}

/**
 * Fly to any registered coastal region preset (see src/config/coastalRegion.js).
 * Used by the region switcher — this is how the app stays planet-wide instead
 * of hardcoded to one city: every region uses the same flight, just different
 * coordinates.
 */
export function flyToCoastalRegion(viewer, region, { durationSec = 3.5 } = {}) {
  if (!region) return;
  const { longitude, latitude } = region.center;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      region.cameraHeightMeters || 45000,
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-55),
      roll: 0.0,
    },
    duration: durationSec,
    easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
  });
}

/**
 * Fly to a Coastal Story location (see src/data/coastalStories.js). Returns
 * the story's summary text so a caller can show it in the HUD/voice reply —
 * this module only owns the camera move, not any UI rendering.
 */
export function flyToCoastalStory(viewer, story, { durationSec = 3.5 } = {}) {
  if (!story) return null;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      story.longitude,
      story.latitude,
      story.cameraHeightMeters || 20000,
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0.0,
    },
    duration: durationSec,
    easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
  });
  return { title: story.title, dateLabel: story.dateLabel, summary: story.summary };
}