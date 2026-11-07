/* PPRJ9 dated reference ownership and immutable, content-addressed CAD sources.
 * CAD authoring remains live. Plan backgrounds are explicit version snapshots. */
(() => {
  'use strict';
  const M = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const capability = 'plan.backgrounds.v1', schema = 9, clone = x => JSON.parse(JSON.stringify(x));
  const fail = code => { throw Error('plan-backgrounds:' + code); };
  const enabled = s => s?.drawingModel?.backgrounds?.version === 1;
  const binding = (s, id = s.activeFloorId) => s.drawingModel?.backgrounds?.bindings?.[id] || null;
  const hash = value => M.planDrawings.hash(value);
  const verified = new WeakMap(), resources = new Map(); let currentContext = null;
  const id = value => typeof value === 'string' && value.length > 0 && value.length <= 255 && !['__proto__', 'prototype', 'constructor'].includes(value) && !/[\x00-\x1f]/.test(value);
  const frozen = (value, seen = new WeakSet()) => { if (value && typeof value === 'object' && !seen.has(value)) { seen.add(value); Object.freeze(value); for (const item of Object.values(value)) frozen(item, seen); } return value; };
  function serialize(ref) {
    const base = { id: ref.id, type: ref.type, name: ref.name, visible: ref.visible !== false, opacity: Number(ref.opacity ?? .5), scale: Number(ref.scale ?? 1), origin: ref.origin ? { ...ref.origin } : { x: 0, y: 0 }, floorId: ref.floorId || null, sourceUnit: ref.sourceUnit || null, sourceMeta: ref.sourceMeta ? clone(ref.sourceMeta) : null, sourceState: ref.sourceState || null, clip: ref.clip ? { ...ref.clip } : null };
    if (['image', 'pdf'].includes(ref.type)) return { ...base, width: ref.width, height: ref.height, dataUrl: ref.dataUrl || null, ...(ref.type === 'pdf' ? { page: 1 } : {}) };
    if (ref.type === 'dxf') return { ...base, entities: clone(ref.entities || []), bounds: ref.bounds || null, mainBounds: ref.mainBounds || null, outlierCount: ref.outlierCount || 0, sourceUnitSpecified: Boolean(ref.sourceUnitSpecified), layers: [...(ref.layers || [])], visibleLayers: [...(ref.visibleLayers || [])] };
    if (ref.type === 'linkedCadRegion') return { ...base, regionId: ref.regionId, layers: [...(ref.layers || [])], visibleLayers: [...(ref.visibleLayers || [])] };
    fail('reference-type');
  }
  function copyReference(ref) {
    const data = serialize(ref); return { ...ref, ...clone(data), ...(['dxf', 'linkedCadRegion'].includes(ref.type) ? { visibleLayers: new Set(data.visibleLayers) } : {}) };
  }
  const copyModel = m => m?.backgrounds ? { ...clone({ ...m, backgrounds: undefined }), backgrounds: { ...clone({ ...m.backgrounds, documents: undefined }), documents: { ...m.backgrounds.documents } } } : clone(m);
  const tokenModel = m => m?.backgrounds ? { ...m, backgrounds: { ...m.backgrounds, documents: Object.keys(m.backgrounds.documents).sort() } } : m;
  function bodyKey(ref) { return hash({ type: ref.type, dataUrl: ref.dataUrl || null, entities: ref.entities || null, width: ref.width ?? null, height: ref.height ?? null, layers: ref.layers || null }); }
  function remember(refs) { for (const ref of refs || []) if (ref.type !== 'linkedCadRegion') resources.set(bodyKey(ref), ref); }
  function restoreReferences(list, current = []) {
    remember(current); return list.map(raw => {
      const native = resources.get(bodyKey(raw)); if (raw.type === 'image' && !native?.image || raw.type === 'dxf' && !native?.pathsByLayer) fail('missing-reference-resource');
      return copyReference({ ...(native || {}), ...raw, ...(['dxf', 'linkedCadRegion'].includes(raw.type) ? { visibleLayers: new Set(raw.visibleLayers || []) } : {}) });
    });
  }
  function references(s, drawingId = s.activeFloorId) { const b = binding(s, drawingId); if (!b) return []; const ids = new Set(b.referenceIds); return (s.references || []).filter(r => ids.has(r.id)); }
  function fingerprint(s, b) { const byId = new Map((s.references || []).map(r => [r.id, r])); return hash({ documentId: b.documentId, region: b.region, references: b.referenceIds.map(id => { const r = byId.get(id); if (!r) fail('missing-reference'); return serialize(r); }) }); }
  function document(s, { objects, requiredCapabilities = [] } = {}) {
    const selected = objects || (s.objects || []).filter(o => (o.type.startsWith('cad') && !o.planRole && !o.floorId) || o.type === 'line' && !o.floorId);
    const settings = Object.fromEntries(Object.entries(s.toolSettings || {}).filter(([key]) => key.startsWith('cad') || ['dimensionStyleName', 'textStyleName'].includes(key)));
    const layers = s.cadLayerDefinitions instanceof Map ? [...s.cadLayerDefinitions.values()] : s.cadLayerDefinitions || [];
    return clone({ version: 1, requiredCapabilities: requiredCapabilities.filter(c => c !== capability && c !== 'plan.versions.v1' && c !== 'plan.drawings.v1'), drawing: { objects: selected, blockDefinitions: s.blockDefinitions || [], dimensionStyles: s.dimensionStyles || [], textStyles: s.textStyles || [], dxfArchive: s.dxfArchive || null, cadLayerDefinitions: layers, cadLayerVisibility: [...(s.cadLayerVisibility || [])], cadRegionLayerVisibility: [...(s.cadRegionLayerVisibility || [])].map(([k, v]) => [k, v instanceof Map ? [...v] : v]), toolSettings: settings, unitSystem: s.unitSystem || 'metric' } });
  }
  function checkDocument(doc, key) {
    if (verified.has(doc)) { if (verified.get(doc) !== key) fail('document-hash'); return; }
    if (doc?.version !== 1 || Object.keys(doc).some(k => !['version', 'requiredCapabilities', 'drawing'].includes(k)) || !Array.isArray(doc.requiredCapabilities) || hash(doc) !== key) fail('document-hash');
    if (Object.keys(doc.drawing || {}).some(k => !['objects','blockDefinitions','dimensionStyles','textStyles','dxfArchive','cadLayerDefinitions','cadLayerVisibility','cadRegionLayerVisibility','toolSettings','unitSystem'].includes(k)) || Object.keys(doc.drawing?.toolSettings || {}).some(k => !k.startsWith('cad') && !['dimensionStyleName','textStyleName'].includes(k))) fail('document-fields');
    if (!Array.isArray(doc.drawing?.objects) || doc.drawing.objects.some(o => o.floorId || o.planRole || !o.type.startsWith('cad') && o.type !== 'line')) fail('document-owner');
    if (M.projectStaging) M.projectStaging.validate({ format: 'PieniPlan', schemaVersion: 7, requiredCapabilities: doc.requiredCapabilities, drawing: doc.drawing });
    frozen(doc); verified.set(doc, key);
  }
  function insertDocument(model, doc) { const key = hash(doc); checkDocument(doc, key); model.documents[key] ||= doc; return key; }
  function selectedRefs(s, floor) { return (s.references || []).filter(r => r.type === 'linkedCadRegion' ? floor.sourceRegionId && r.regionId === floor.sourceRegionId : !r.floorId || r.floorId === floor.id); }
  function enable(s, { uid, source = document(s), now = new Date().toISOString(), origin = 'captured-current' } = {}) {
    M.planVersions.validate(s); if (enabled(s)) return s; if (typeof uid !== 'function') fail('allocator');
    const next = { ...s, drawingModel: copyModel(s.drawingModel), references: (s.references || []).map(copyReference) }, store = { version: 1, documents: {}, bindings: {} }, used = new Set([...(s.references || []).map(r => r.id), ...s.objects.map(o => o.id), ...s.floors.map(f => f.id), ...s.buildings.map(b => b.id)]);
    next.drawingModel.backgrounds = store; const key = insertDocument(store, source), original = (s.references || []);
    for (const floor of s.floors) {
      const ids = []; for (const ref of selectedRefs({ ...s, references: original }, floor)) {
        if (ref.floorId === floor.id) ids.push(ref.id);
        else { const value = uid('reference'); if (!id(value) || used.has(value)) fail('id-collision'); used.add(value); next.references.push({ ...copyReference(ref), id: value, floorId: floor.id }); ids.push(value); }
      }
      store.bindings[floor.id] = { documentId: key, region: clone((s.drawingRegions || []).find(r => r.id === floor.sourceRegionId) || null), referenceIds: ids, sealedFingerprint: null, capturedAt: now, origin };
    }
    remember(next.references); return sync(next);
  }
  function fork(s, next, sourceId, targetId, uid) {
    if (!enabled(s)) return;
    const source = binding(s, sourceId), store = next.drawingModel.backgrounds, ids = [];
    next.references = (s.references || []).map(copyReference);
    for (const ref of references(s, sourceId)) { const value = uid('reference'); next.references.push({ ...copyReference(ref), id: value, floorId: targetId }); ids.push(value); }
    store.bindings[targetId] = { ...clone(source), referenceIds: ids, sealedFingerprint: null, origin: 'inherited' };
    remember(next.references);
  }
  function addEmpty(s, drawingId, key) { if (!enabled(s)) return; const store = s.drawingModel.backgrounds, documentId = insertDocument(store, document({})); store.bindings[drawingId] = { documentId, referenceIds: [], region: null, sealedFingerprint: null, capturedAt: new Date().toISOString(), origin: 'empty' }; }
  function refresh(s, drawingId, { source = document(s), now = new Date().toISOString() } = {}) {
    if (!enabled(s) || M.planVersions.readonly(s, drawingId)) fail('readonly'); const next = { ...s, drawingModel: copyModel(s.drawingModel) }, b = binding(next, drawingId), floor = s.floors.find(f => f.id === drawingId);
    b.documentId = insertDocument(next.drawingModel.backgrounds, source); b.region = clone((s.drawingRegions || []).find(r => r.id === floor.sourceRegionId) || null); b.capturedAt = now; b.origin = 'captured-current'; return sync(next);
  }
  function sync(s) {
    if (!enabled(s)) return s;
    const next = { ...s, drawingModel: copyModel(s.drawingModel) }, store = next.drawingModel.backgrounds, ids = new Set((s.references || []).map(r => r.id));
    for (const v of next.drawingModel.versions) {
      const b = store.bindings[v.drawingId]; if (!b) fail('binding-coverage');
      if (!b.sealedFingerprint) { b.referenceIds = b.referenceIds.filter(id => ids.has(id));
        if (s.toolset !== 'cad') for (const r of s.references || []) if (r.floorId === v.drawingId && !b.referenceIds.includes(r.id) && !Object.values(store.bindings).some(other => other !== b && other.referenceIds.includes(r.id))) b.referenceIds.push(r.id);
      }
      const digest = fingerprint(next, b); if (b.sealedFingerprint && b.sealedFingerprint !== digest) fail('sealed-reference-change');
      if (v.sealedFingerprint) b.sealedFingerprint ||= digest;
    }
    remember(s.references); validate(next); return next;
  }
  function validate(s) {
    if (!enabled(s)) fail('version'); const store = s.drawingModel.backgrounds;
    if (Object.keys(store).some(k => !['version', 'documents', 'bindings'].includes(k)) || !store.documents || !store.bindings) fail('store');
    for (const [key, doc] of Object.entries(store.documents)) checkDocument(doc, key);
    const owners = new Map(), refs = new Map((s.references || []).map(r => [r.id, r]));
    if (refs.size !== (s.references || []).length || Object.keys(store.bindings).length !== s.drawingModel.versions.length) fail('reference-ids');
    for (const v of s.drawingModel.versions) {
      const b = store.bindings[v.drawingId];
      if (!b || Object.keys(b).some(k => !['documentId', 'region', 'referenceIds', 'sealedFingerprint', 'capturedAt', 'origin'].includes(k)) || !Object.hasOwn(store.documents, b.documentId) || !Array.isArray(b.referenceIds) || new Set(b.referenceIds).size !== b.referenceIds.length || !['captured-current', 'inherited', 'empty'].includes(b.origin) || !Number.isFinite(Date.parse(b.capturedAt))) fail('binding');
      if (b.region && (!id(b.region.id) || !['minx', 'miny', 'maxx', 'maxy'].every(k => Number.isFinite(b.region[k])) || b.region.minx >= b.region.maxx || b.region.miny >= b.region.maxy)) fail('region');
      for (const key of b.referenceIds) { const ref = refs.get(key); if (!id(key) || !ref || owners.has(key) || ref.floorId !== v.drawingId) fail('reference-owner'); if (ref.type === 'linkedCadRegion' && ref.regionId !== b.region?.id) fail('missing-region'); serialize(ref); owners.set(key, v.drawingId); }
      if (b.sealedFingerprint !== null && b.sealedFingerprint !== fingerprint(s, b) || v.sealedFingerprint && !b.sealedFingerprint) fail('sealed-reference-change');
    }
    return s;
  }
  function run(s, drawingId, ports, callback) {
    const b = binding(s, drawingId); if (!b) return callback();
    if (currentContext?.state === s && currentContext.drawingId === drawingId) return callback();
    const doc = s.drawingModel.backgrounds.documents[b.documentId], old = {}, keys = ['blockDefinitions','dimensionStyles','textStyles','dxfArchive','cadLayerDefinitions','cadLayerVisibility','cadRegionLayerVisibility','toolSettings','drawingRegions','activeFloorId','activeBuildingId','unitSystem'], context = currentContext, layers = ports.getLayers?.();
    for (const key of keys) old[key] = s[key];
    try {
      for (const key of ['blockDefinitions','dimensionStyles','textStyles','dxfArchive']) s[key] = doc.drawing[key];
      s.cadLayerDefinitions = doc.drawing.cadLayerDefinitions; s.cadLayerVisibility = new Map(doc.drawing.cadLayerVisibility);
      s.cadRegionLayerVisibility = new Map(doc.drawing.cadRegionLayerVisibility.map(([id, pairs]) => [id, new Map(pairs)]));
      s.toolSettings = { ...old.toolSettings, ...doc.drawing.toolSettings };
      s.unitSystem = doc.drawing.unitSystem;
      s.drawingRegions = b.region ? [...(old.drawingRegions || []).filter(r => r.id !== b.region.id), b.region] : old.drawingRegions;
      s.activeFloorId = drawingId; s.activeBuildingId = s.floors.find(f => f.id === drawingId)?.buildingId || old.activeBuildingId;
      currentContext = { state: s, drawingId, documentId: b.documentId, document: doc };
      ports.setLayers?.(ports.createLayers(doc.drawing.cadLayerDefinitions));
      const result = callback(); if (result && typeof result.then === 'function') fail('async-read-context'); return result;
    } finally { for (const key of keys) s[key] = old[key]; currentContext = context; ports.setLayers?.(layers); }
  }
  M.planBackgrounds = Object.freeze({ capability, schema, enabled, binding, serialize, copyReference, copyModel, tokenModel, remember, restoreReferences, references, fingerprint, document, enable, fork, addEmpty, refresh, sync, validate, run, context: () => currentContext });
})();
