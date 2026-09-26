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
 * call site out of the UI layer, a missing control layer gets a stand-in
 * here. Most call sites treat these as method-bearing objects
 * (`flightsLayer.stopTracking?.()`, and a few WITHOUT the `?.` guard, e.g.
 * `cctvLayer.focusCamera(id)` and `radioLayer.getUIState()`), so property
 * access returns a no-op function for those. A couple of call sites instead
 * read a *data* property and branch on its truthiness
 * (`this.services.localAdsbLayer?.receiver` in applicationShell.js, then
 * `if (receiver) new LocalSdrControls({ receiver })`, whose constructor
 * calls `receiver.getState()`) — for those, returning a function made the
 * property truthy and broke that branch with "receiver.getState is not a
 * function". DATA_PROPERTIES lists the known cases that must read as
 * `undefined` instead.
 */
const STUB_DATA_PROPERTIES = new Set(['receiver', 'feeds']);
function noopControlLayerStub() {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === 'symbol' || STUB_DATA_PROPERTIES.has(prop))
          return undefined;
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