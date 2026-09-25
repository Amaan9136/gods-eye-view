const CONTROL_LAYER_IDS = Object.freeze({
  trafficLayer: 'traffic',
  flightsLayer: 'flights',
  militaryFlightsLayer: 'military',
  satellitesLayer: 'satellites',
  cctvLayer: 'cctv',
  radioLayer: 'radio',
  bikeshareLayer: 'bikeshare',
  transitLayer: 'transit',
  aisLiveVesselsLayer: 'ais-live-vessels',
  militaryAwarenessLayer: 'military-awareness',
  militaryInstallationsLayer: 'military-installations',
  rocketLaunchesLayer: 'rocket-launches',
  localAdsbLayer: 'local-adsb',
});

/**
 * Coastal Intelligence only constructs a subset of the original layers (see
 * src/app/constructCatalog.js). Rather than rip every `servicesX.stopTracking?.()`
 * call site out of the UI layer, a missing control layer gets a harmless
 * no-op stand-in here: any method call on it resolves to undefined instead
 * of throwing "Cannot read properties of undefined".
 */
function noopControlLayerStub() {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === 'then' || typeof prop === 'symbol') return undefined;
        return () => undefined;
      },
    },
  );
}

/** Capture the ordered application instances and their serialization metadata. */
export function createLayerCatalog(layers, metadata) {
  if (!Array.isArray(layers) || !Array.isArray(metadata))
    throw new TypeError(
      'Layer instances and serialization metadata are required',
    );
  const byId = new Map();
  for (const layer of layers) {
    if (typeof layer?.id !== 'string' || !layer.id || byId.has(layer.id))
      throw new TypeError(`Invalid or duplicate catalog layer: ${layer?.id}`);
    byId.set(layer.id, layer);
  }
  const ids = new Set();
  for (const entry of metadata) {
    if (!byId.has(entry?.id) || ids.has(entry.id))
      throw new TypeError(
        `Unmatched or duplicate catalog metadata: ${entry?.id}`,
      );
    ids.add(entry.id);
  }
  if (ids.size !== byId.size)
    throw new TypeError('Catalog metadata is incomplete');
  return Object.freeze({
    layers: Object.freeze([...layers]),
    metadata: Object.freeze(
      metadata.map((entry) => Object.freeze({ ...entry })),
    ),
    get: (id) => byId.get(id),
  });
}

/** Bind the current control surface to the exact instances registered by the app. */
export function catalogControlServices(catalog) {
  if (!catalog?.get)
    throw new TypeError('An application layer catalog is required');
  return Object.fromEntries(
    Object.entries(CONTROL_LAYER_IDS).map(([role, id]) => {
      const layer = catalog.get(id) || noopControlLayerStub();
      return [role, layer];
    }),
  );
}