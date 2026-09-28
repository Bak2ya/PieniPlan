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

  // Region maps are true overrides: missing=inherited, true=force on, false=force off.
  function regionOverride(regionMaps, regionId, layer) {
    if (!regionId) return null;
    const map = regionMap(regionMaps, regionId);
    const key = keyOf(layer);
    return map?.has(key) ? Boolean(map.get(key)) : null;
  }

  // Kept as a local-state accessor for existing host/test code.
  function regionVisible(regionMaps, regionId, layer) {
    const override = regionOverride(regionMaps, regionId, layer);
    return override == null ? true : override;
  }

  function effectiveVisible(globalMap, regionMaps, regionId, layer) {
    const override = regionOverride(regionMaps, regionId, layer);
    return override == null ? globalVisible(globalMap, layer) : override;
  }

  function hasOverride(regionMaps, regionId, layer) {
    return regionOverride(regionMaps, regionId, layer) != null;
  }

  // Historical helper retained for compatibility; it now means an inherited global-off state,
  // never a reason to disable the regional toggle.
  function inheritedOff(globalMap, regionId, layer, regionMaps = null) {
    return Boolean(regionId) && (!regionMaps || !hasOverride(regionMaps, regionId, layer)) && !globalVisible(globalMap, layer);
  }

  function knownLayers(globalMap, objects, isCadSourceObject) {
    const keys = new Set(globalMap.keys());
    for (const object of objects || []) if (isCadSourceObject(object)) keys.add(keyOf(object.cadLayer || object.layer || object.sourceLayer));
    return [...keys];
  }

  function scopedToggleValue(globalMap, regionMaps, regionId, layer) {
    return regionId ? effectiveVisible(globalMap, regionMaps, regionId, layer) : globalVisible(globalMap, layer);
  }

  function isSoloScoped(globalMap, regionMaps, regionId, layers, targetLayer) {
    const target = keyOf(targetLayer);
    return layers.every(layer => scopedToggleValue(globalMap, regionMaps, regionId, layer) === (keyOf(layer) === target));
  }

  function hasHiddenScoped(globalMap, regionMaps, regionId, layers) {
    return layers.some(layer => !scopedToggleValue(globalMap, regionMaps, regionId, layer));
  }

  function setScoped(globalMap, regionMaps, regionId, layer, visible) {
    const key = keyOf(layer), next = Boolean(visible);
    if (regionId) {
      const map = regionMap(regionMaps, regionId, { create: true });
      const previous = effectiveVisible(globalMap, regionMaps, regionId, key);
      const existing = map.has(key) ? Boolean(map.get(key)) : null;
      if (existing === next && previous === next) return false;
      map.set(key, next);
      return true;
    }
    if (globalVisible(globalMap, key) === next) return false;
    globalMap.set(key, next);
    return true;
  }

  function clearOverride(regionMaps, regionId, layer) {
    const map = regionMap(regionMaps, regionId); if (!map) return false;
    const removed = map.delete(keyOf(layer));
    if (!map.size) regionMaps.delete(regionId);
    return removed;
  }

  function soloScoped(globalMap, regionMaps, regionId, layers, targetLayer) {
    const target = keyOf(targetLayer);
    if (isSoloScoped(globalMap, regionMaps, regionId, layers, target)) return false;
    if (regionId) {
      const map = regionMap(regionMaps, regionId, { create: true });
      for (const layer of layers) map.set(keyOf(layer), keyOf(layer) === target);
      return true;
    }
    for (const layer of layers) globalMap.set(keyOf(layer), keyOf(layer) === target);
    return true;
  }

  function showAllScoped(globalMap, regionMaps, regionId, layers) {
    if (!hasHiddenScoped(globalMap, regionMaps, regionId, layers)) return false;
    if (regionId) {
      const map = regionMap(regionMaps, regionId, { create: true });
      for (const layer of layers) map.set(keyOf(layer), true);
      return true;
    }
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
      const map = new Map();
      for (const pair of entry[1]) {
        if (!Array.isArray(pair) || pair.length < 2) continue;
        map.set(keyOf(pair[0]), Boolean(pair[1]));
      }
      if (map.size) outer.set(String(entry[0]), map);
    }
    return outer;
  }

  root.cadLayerVisibility = Object.freeze({
    globalVisible, regionMap, regionOverride, regionVisible, effectiveVisible, hasOverride, inheritedOff,
    knownLayers, scopedToggleValue, isSoloScoped, hasHiddenScoped, setScoped, clearOverride,
    soloScoped, showAllScoped, serialize, deserialize
  });
})();
