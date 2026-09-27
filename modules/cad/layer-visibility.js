(() => {
  'use strict';

  const root = window.PieniPlanModules = window.PieniPlanModules || {};

  const keyOf = (layer) => String(layer || '0');

  function globalVisible(globalMap, layer) {
    return globalMap.get(keyOf(layer)) !== false;
  }

  function regionMap(regionMaps, regionId, { create = false } = {}) {
    if (!regionId) return null;
    let map = regionMaps.get(regionId);
    if (!map && create) {
      map = new Map();
      regionMaps.set(regionId, map);
    }
    return map || null;
  }

  function regionVisible(regionMaps, regionId, layer) {
    if (!regionId) return true;
    return regionMap(regionMaps, regionId)?.get(keyOf(layer)) !== false;
  }

  function effectiveVisible(globalMap, regionMaps, regionId, layer) {
    return globalVisible(globalMap, layer) && (!regionId || regionVisible(regionMaps, regionId, layer));
  }

  function inheritedOff(globalMap, regionId, layer) {
    return Boolean(regionId) && !globalVisible(globalMap, layer);
  }

  function knownLayers(globalMap, objects, isCadSourceObject) {
    const keys = new Set(globalMap.keys());
    for (const object of objects || []) {
      if (isCadSourceObject(object)) keys.add(keyOf(object.cadLayer));
    }
    return [...keys];
  }


  function scopedToggleValue(globalMap, regionMaps, regionId, layer) {
    return regionId ? regionVisible(regionMaps, regionId, layer) : globalVisible(globalMap, layer);
  }

  function isSoloScoped(globalMap, regionMaps, regionId, layers, targetLayer) {
    const target = keyOf(targetLayer);
    return layers.every(layer => scopedToggleValue(globalMap, regionMaps, regionId, layer) === (keyOf(layer) === target));
  }

  function hasHiddenScoped(globalMap, regionMaps, regionId, layers) {
    return layers.some(layer => !scopedToggleValue(globalMap, regionMaps, regionId, layer));
  }

  function setScoped(globalMap, regionMaps, regionId, layer, visible) {
    const key = keyOf(layer);
    const next = Boolean(visible);
    if (regionId) {
      if (inheritedOff(globalMap, regionId, key)) return false;
      const map = regionMap(regionMaps, regionId, { create: true });
      if ((map.get(key) !== false) === next) return false;
      map.set(key, next);
      return true;
    }
    if (globalVisible(globalMap, key) === next) return false;
    globalMap.set(key, next);
    return true;
  }

  function soloScoped(globalMap, regionMaps, regionId, layers, targetLayer) {
    const target = keyOf(targetLayer);
    if (regionId && inheritedOff(globalMap, regionId, target)) return false;
    if (regionId) {
      const map = regionMap(regionMaps, regionId, { create: true });
      const already = layers.every(layer => (map.get(keyOf(layer)) !== false) === (keyOf(layer) === target));
      if (already) return false;
      for (const layer of layers) map.set(keyOf(layer), keyOf(layer) === target);
      return true;
    }
    const already = layers.every(layer => globalVisible(globalMap, layer) === (keyOf(layer) === target));
    if (already) return false;
    for (const layer of layers) globalMap.set(keyOf(layer), keyOf(layer) === target);
    return true;
  }

  function showAllScoped(globalMap, regionMaps, regionId, layers) {
    if (regionId) {
      const map = regionMap(regionMaps, regionId, { create: true });
      if (!layers.some(layer => map.get(keyOf(layer)) === false)) return false;
      for (const layer of layers) map.set(keyOf(layer), true);
      return true;
    }
    if (!layers.some(layer => !globalVisible(globalMap, layer))) return false;
    for (const layer of layers) globalMap.set(keyOf(layer), true);
    return true;
  }

  function serialize(regionMaps) {
    return [...regionMaps].map(([regionId, map]) => [regionId, [...map]]);
  }

  function deserialize(raw) {
    const outer = new Map();
    if (!Array.isArray(raw)) return outer;
    for (const entry of raw) {
      if (!Array.isArray(entry) || entry.length < 2 || !Array.isArray(entry[1])) continue;
      outer.set(String(entry[0]), new Map(entry[1].map(([layer, visible]) => [keyOf(layer), visible !== false])));
    }
    return outer;
  }

  root.cadLayerVisibility = Object.freeze({
    globalVisible,
    regionMap,
    regionVisible,
    effectiveVisible,
    inheritedOff,
    knownLayers,
    scopedToggleValue,
    isSoloScoped,
    hasHiddenScoped,
    setScoped,
    soloScoped,
    showAllScoped,
    serialize,
    deserialize
  });
})();
