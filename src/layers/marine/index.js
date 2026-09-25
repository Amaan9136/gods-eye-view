import * as Cesium from 'cesium';
import { getMarineSnapshot } from '../../data/marineConditions.js';

function waveColor(heightMeters) {
  if (heightMeters == null) return Cesium.Color.GRAY;
  if (heightMeters < 1) return Cesium.Color.fromCssColorString('#22c1c3');
  if (heightMeters < 2) return Cesium.Color.fromCssColorString('#f4d03f');
  return Cesium.Color.fromCssColorString('#e74c3c');
}

/**
 * Coastal & ocean conditions layer (wave height, sea surface temperature).
 * Mirrors the minimal layer contract used by wind/cyclones: init/enable/
 * disable/update, one CustomDataSource, no shared overlay-host dependency.
 */
export function createMarineLayer({ getSnapshot = getMarineSnapshot } = {}) {
  let _viewer = null;
  let _dataSource = null;
  let _enabled = false;
  let _request = null;
  let _lastUpdate = null;
  let _lastError = null;

  const layer = {
    id: 'marine-conditions',
    name: 'Coastal Conditions (Waves/SST)',
    icon: '🌊',
    source: 'Open-Meteo Marine',
    updateInterval: 15 * 60 * 1000,

    init(viewer) {
      if (_viewer) throw new Error('Marine layer is already initialized');
      _viewer = viewer;
      _dataSource = new Cesium.CustomDataSource('marine-conditions');
      _dataSource.show = false;
      viewer.dataSources.add(_dataSource);
    },

    enable() {
      _enabled = true;
      if (_dataSource) _dataSource.show = true;
    },

    disable() {
      _request?.abort?.();
      _request = null;
      _enabled = false;
      if (_dataSource) {
        _dataSource.entities.removeAll();
        _dataSource.show = false;
      }
    },

    async update() {
      if (!_enabled || !_dataSource) return false;
      const controller = new AbortController();
      _request = controller;
      try {
        const snapshot = await getSnapshot({ signal: controller.signal });
        if (controller.signal.aborted || _request !== controller || !_enabled)
          return false;
        _dataSource.entities.removeAll();
        for (const reading of snapshot.readings) {
          _dataSource.entities.add({
            id: `marine-${reading.id}`,
            position: Cesium.Cartesian3.fromDegrees(
              reading.longitude,
              reading.latitude,
            ),
            point: {
              pixelSize: 12,
              color: waveColor(reading.waveHeightMeters),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 1,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
            label: {
              text: `${reading.label}\n${
                reading.waveHeightMeters != null
                  ? reading.waveHeightMeters.toFixed(1) + 'm swell'
                  : 'no data'
              } · ${
                reading.seaSurfaceTempC != null
                  ? reading.seaSurfaceTempC.toFixed(1) + '°C'
                  : ''
              }${reading.isMock ? ' (sample)' : ''}`,
              font: '12px sans-serif',
              fillColor: Cesium.Color.WHITE,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.TOP,
              pixelOffset: new Cesium.Cartesian2(0, 14),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
            properties: reading,
          });
        }
        _lastUpdate = Date.now();
        _lastError = null;
        return true;
      } catch (error) {
        if (controller.signal.aborted) return false;
        _lastError = error?.message || 'Marine data unavailable';
        return false;
      }
    },

    getStatus() {
      return {
        enabled: _enabled,
        lastUpdate: _lastUpdate,
        error: _lastError,
        count: _dataSource?.entities.values.length || 0,
      };
    },

    destroy() {
      _request?.abort?.();
      if (_dataSource && _viewer && !_viewer.isDestroyed()) {
        _viewer.dataSources.remove(_dataSource, true);
      }
      _dataSource = null;
      _viewer = null;
    },
  };

  return layer;
}
