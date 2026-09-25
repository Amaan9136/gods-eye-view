import * as Cesium from 'cesium';

const SURFACE_FOG_DENSITY = 0.0002;
const UNDERWATER_FOG_DENSITY = 0.004;
const UNDERWATER_TINT = Cesium.Color.fromCssColorString('#0a2a3a');

/**
 * Scoped "submersible" mode: the cockpit camera is allowed to drop below
 * sea level and the scene gets a blue fog/tint so it visually reads as
 * underwater. This is a cosmetic piloting mode, NOT real bathymetry or
 * seafloor content — Cesium ships neither, and there is no free/keyless
 * source for it. Pitch this as "submersible piloting mode for inspecting
 * vessel positions and coastal conditions from below the surface," not as
 * literal seafloor exploration.
 */
export function createDiveMode(viewer) {
  let active = false;
  const originalFog = viewer.scene.fog.enabled;
  const originalDensity = viewer.scene.fog.density;
  const originalGlobeColor = viewer.scene.globe.baseColor?.clone?.();

  function enter() {
    if (active) return;
    active = true;
    viewer.scene.fog.enabled = true;
    viewer.scene.fog.density = UNDERWATER_FOG_DENSITY;
    viewer.scene.globe.baseColor = UNDERWATER_TINT;
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
  }

  function exit() {
    if (!active) return;
    active = false;
    viewer.scene.fog.enabled = originalFog;
    viewer.scene.fog.density = originalDensity;
    if (originalGlobeColor) viewer.scene.globe.baseColor = originalGlobeColor;
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
  }

  return {
    isActive: () => active,
    enter,
    exit,
    toggle: () => (active ? exit() : enter()),
  };
}
