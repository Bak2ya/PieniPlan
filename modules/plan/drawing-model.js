/* Drawing identity/ownership and technical revisions. No facility business state. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const capability = 'plan.drawings.v1', copy = o => JSON.parse(JSON.stringify(o));
  const fail = code => { throw Error('drawing-model:' + code); };
  const own = (o, k) => Object.hasOwn(o, k);
  const validId = id => typeof id === 'string' && id.length > 0 && id.length <= 255 && !/[\x00-\x1f]/.test(id) && !['__proto__', 'constructor', 'prototype'].includes(id);
  const elementFields = new Set(('id type floorId layerId cadLayer planRole planGeometry planNature a b center radius startAngle sweep point p1 p2 polygon points seed width height thickness depth rotation scaleX scaleY wallType geometry constraints attachments wallId wallIds t t1 t2 offset axis axisBounds mirrorX mirrorY hinge swing swingSide swingDirection doorType elementKind fireProtection fireRating slideDirection doubleLeafSplit openingDirection name text mtext alignment verticalAlignment lineSpacing textStyle textOverrides spaceUuid spaceType areaM2 areaMode invalid managedAreaM2 managedAreaSource manualAreaM2 sourceRegionId sourceObjectIds recognitionSourceIds recognitionBaselineSignature recognitionConfidence recognizedFromCad recognitionReviewState stairType treadCount upDirection assetId assetVersion componentDefinition doorModel93 color strokeColor fillColor lineStyle lineWidth lineWeight lineweight linetype opacity planLineAppearance vertices closed curveFit').split(' '));
  const nonDrawing = key => /^(?:passwords?|credentials?|auth(?:entication|orization)?|accessTokens?|secretKeys?|encryptionKeys?|facilityData|facilityAssets|assetMaintenance|departmentAssignments|repairHistory|constructionCosts|inspectionHistory|userAccounts|faci)$/i.test(key);
  function cleanTechnical(value) {
    if (Array.isArray(value)) return value.map(cleanTechnical);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => !nonDrawing(key)).map(([key, item]) => [key, cleanTechnical(item)]));
    return value;
  }
  function projectElement(element) {
    return Object.fromEntries(Object.entries(element).filter(([key]) => elementFields.has(key)).map(([key, value]) => [key, cleanTechnical(value)]));
  }
  const elementHash = element => hash(projectElement(element));
  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(v => canonical(v) ?? 'null').join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
    return JSON.stringify(value);
  }
  // SHA-256 is a content identifier, never an authentication or approval decision.
  const K = [], H = [];
  for (let n = 2; K.length < 64; n++) {
    let prime = true; for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (!prime) continue;
    if (H.length < 8) H.push((Math.sqrt(n) % 1 * 4294967296) >>> 0);
    K.push((Math.cbrt(n) % 1 * 4294967296) >>> 0);
  }
  const rotr = (n, b) => n >>> b | n << (32 - b);
  function hashText(text) {
    const bytes = new TextEncoder().encode(text), size = Math.ceil((bytes.length + 9) / 64) * 64, data = new Uint8Array(size), view = new DataView(data.buffer), h = H.slice(), w = new Uint32Array(64);
    data.set(bytes); data[bytes.length] = 128;
    view.setUint32(size - 8, Math.floor(bytes.length * 8 / 4294967296)); view.setUint32(size - 4, bytes.length * 8 >>> 0);
    for (let offset = 0; offset < size; offset += 64) {
      for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4);
      for (let i = 16; i < 64; i++) { const x = w[i - 15], y = w[i - 2]; w[i] = ((rotr(x, 7) ^ rotr(x, 18) ^ x >>> 3) + w[i - 16] + (rotr(y, 17) ^ rotr(y, 19) ^ y >>> 10) + w[i - 7]) >>> 0; }
      let [a, b, c, d, e, f, g, z] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (z + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + (e & f ^ ~e & g) + K[i] + w[i]) >>> 0, t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + (a & b ^ a & c ^ b & c)) >>> 0;
        z = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      [a, b, c, d, e, f, g, z].forEach((v, i) => h[i] = (h[i] + v) >>> 0);
    }
    return h.map(v => v.toString(16).padStart(8, '0')).join('');
  }
  const hash = value => hashText(canonical(value));
  const enabled = state => state.drawingModel?.version === 1;
  function create(packageId) {
    if (typeof packageId !== 'string' || !packageId) fail('package-id');
    return { version: 1, packageId, levels: [], records: {}, spaceOrigins: {}, retiredSpaceUuids: [], retiredDrawingIds: [], lineage: [], unresolvedReferenceIds: [] };
  }
  const record = (state, id) => state.drawingModel?.records?.[id] || null;
  const owned = (state, id) => (state.objects || []).filter(o => o.floorId === id);
  function metadata(floor) {
    return Object.fromEntries(['id', 'buildingId', 'name', 'discipline', 'levelId', 'sourceRegionId', 'baseDrawingId', 'baseRevision', 'baseFingerprint', 'baseView', 'viewAlignment', 'sourceReferenceFingerprint', 'referenceSourcesOmitted', 'externalSourceRegionId'].filter(k => own(floor, k)).map(k => [k, floor[k]]));
  }
  function sync(state, { initialize = false } = {}) {
    if (!enabled(state)) return null;
    const model = copy(state.drawingModel), ids = new Set(state.floors.map(f => f.id));
    model.spaceOrigins ||= {};
    for (const [id, r] of Object.entries(model.records)) for (const uuid of Object.keys(r.spaces || {})) model.spaceOrigins[uuid] ||= id;
    for (const o of state.objects) if (o.type === 'space' && o.spaceUuid) {
      if (model.spaceOrigins[o.spaceUuid] && model.spaceOrigins[o.spaceUuid] !== o.floorId) fail('space-owner-change');
      model.spaceOrigins[o.spaceUuid] = o.floorId;
    }
    const allSpaces = new Set(state.objects.filter(o => o.type === 'space').map(o => o.spaceUuid).filter(Boolean));
    for (const floor of state.floors) {
      if (!validId(floor.id)) fail('drawing-id');
      const objects = owned(state, floor.id), elements = Object.fromEntries(objects.map(o => [o.id, elementHash(o)])), spaces = Object.fromEntries(objects.filter(o => o.type === 'space' && o.spaceUuid).map(o => [o.spaceUuid, o.id]));
      const fingerprint = hash({ metadata: metadata(floor), elements }), old = model.records[floor.id], revision = old ? old.revision + (old.fingerprint === fingerprint && !old.deleted ? 0 : 1) : 1;
      const baseline = old?.baseline || (initialize ? { revision, fingerprint, elements: copy(elements) } : { revision: 0, fingerprint: null, elements: {} });
      const before = baseline.elements || {}, delta = { fromRevision: baseline.revision, added: Object.keys(elements).filter(id => !own(before, id)), modified: Object.keys(elements).filter(id => own(before, id) && elements[id] !== before[id]), deleted: Object.keys(before).filter(id => !own(elements, id)) };
      if (old?.spaces) for (const uuid of Object.keys(old.spaces)) if (!allSpaces.has(uuid) && !model.retiredSpaceUuids.includes(uuid)) model.retiredSpaceUuids.push(uuid);
      model.records[floor.id] = { revision, fingerprint, elements, spaces, baseline, delta };
    }
    for (const [id, r] of Object.entries(model.records)) if (!ids.has(id) && !r.deleted) {
      model.records[id] = { ...r, deleted: true, revision: r.revision + 1 };
      if (!model.retiredDrawingIds.includes(id)) model.retiredDrawingIds.push(id);
      for (const uuid of Object.keys(r.spaces || {})) if (!allSpaces.has(uuid) && !model.retiredSpaceUuids.includes(uuid)) model.retiredSpaceUuids.push(uuid);
    }
    return model;
  }
  function chain(state, drawingId, { visibleOnly = false } = {}) {
    const list = [], seen = new Set([drawingId]); let floor = state.floors.find(f => f.id === drawingId), opacity = 1, layers = null, printable = true;
    while (floor?.baseDrawingId) {
      if (seen.has(floor.baseDrawingId)) fail('reference-cycle');
      seen.add(floor.baseDrawingId);
      if (visibleOnly && floor.baseView?.visible === false) break;
      opacity *= floor.baseView?.opacity ?? .35;
      if (floor.baseView?.layers) layers = layers ? layers.filter(id => floor.baseView.layers.includes(id)) : floor.baseView.layers.slice();
      printable = printable && floor.baseView?.print !== false;
      const next = state.floors.find(f => f.id === floor.baseDrawingId);
      if (!next) break;
      list.push({ floor: next, opacity, settings: { ...(floor.baseView || {}), print: printable, ...(layers ? { layers: layers.slice() } : {}) } }); floor = next;
    }
    return list;
  }
  function referenceStatus(state, floor) {
    if (!floor?.baseDrawingId) return 'independent';
    if (!state.floors.some(f => f.id === floor.baseDrawingId)) return 'missing';
    const base = record(state, floor.baseDrawingId);
    if (!base || base.revision !== floor.baseRevision || base.fingerprint !== floor.baseFingerprint) return 'changed';
    return chain(state, floor.id).some(({ floor: item }) => item.baseDrawingId && (!state.floors.some(f => f.id === item.baseDrawingId) || record(state, item.baseDrawingId)?.revision !== item.baseRevision || record(state, item.baseDrawingId)?.fingerprint !== item.baseFingerprint)) ? 'changed' : 'current';
  }
  function validate(state) {
    if (state.drawingModel != null && state.drawingModel.version !== 1) fail('unsupported-version');
    if (!enabled(state)) return state;
    const m = state.drawingModel;
    const allowed = ['version', 'packageId', 'levels', 'records', 'spaceOrigins', 'retiredSpaceUuids', 'retiredDrawingIds', 'lineage', 'unresolvedReferenceIds', 'exchangeScope'];
    if (Object.keys(m).some(k => !allowed.includes(k)) || typeof m.packageId !== 'string' || !m.packageId || !Array.isArray(m.levels) || !m.records || typeof m.records !== 'object' || Array.isArray(m.records)) fail('model');
    if (m.exchangeScope) {
      const e = m.exchangeScope;
      if (Object.keys(e).some(k => !['completePackage', 'origins'].includes(k)) || typeof e.completePackage !== 'boolean' || e.origins && (typeof e.origins !== 'object' || Array.isArray(e.origins) || Object.entries(e.origins).some(([id, o]) => !validId(id) || !o || Object.keys(o).some(k => !['packageId', 'drawingId', 'fingerprint', 'localFingerprint'].includes(k)) || !validId(o.packageId) || !validId(o.drawingId) || !/^[a-f0-9]{64}$/.test(o.fingerprint || '') || !/^[a-f0-9]{64}$/.test(o.localFingerprint || '')))) fail('exchange-origin');
    }
    const idSet = (list, why) => { const set = new Set(); for (const o of list) { if (!validId(o?.id) || set.has(o.id)) fail(why); set.add(o.id); } return set; };
    const buildings = idSet(state.buildings || [], 'building-ids'), drawings = idSet(state.floors || [], 'drawing-ids'), levels = idSet(m.levels, 'level-ids');
    if (m.spaceOrigins && (typeof m.spaceOrigins !== 'object' || Array.isArray(m.spaceOrigins) || Object.entries(m.spaceOrigins).some(([uuid, id]) => !validId(uuid) || !validId(id) || !drawings.has(id) && !m.retiredDrawingIds.includes(id)))) fail('space-origin');
    idSet(state.objects || [], 'element-ids');
    for (const key of ['retiredSpaceUuids', 'retiredDrawingIds', 'unresolvedReferenceIds']) if (!Array.isArray(m[key]) || m[key].some(id => typeof id !== 'string' || !id) || new Set(m[key]).size !== m[key].length) fail(key);
    for (const level of m.levels) if (!buildings.has(level.buildingId) || typeof level.name !== 'string' || !level.name.trim() || Object.keys(level).some(k => !['id', 'buildingId', 'name', 'order'].includes(k))) fail('level');
    for (const floor of state.floors) {
      if (floor.sourceReferenceFingerprint != null && !/^[a-f0-9]{64}$/.test(floor.sourceReferenceFingerprint) || floor.referenceSourcesOmitted != null && typeof floor.referenceSourcesOmitted !== 'boolean') fail('source-fingerprint');
      if (!buildings.has(floor.buildingId) || floor.levelId && !levels.has(floor.levelId) || floor.levelId && m.levels.find(l => l.id === floor.levelId).buildingId !== floor.buildingId) fail('drawing-level');
      if (floor.discipline != null && (typeof floor.discipline !== 'string' || !floor.discipline.trim() || floor.discipline.length > 128)) fail('discipline');
      if (m.retiredDrawingIds.includes(floor.id)) fail('reused-drawing-id');
      if (floor.baseDrawingId) {
        if (!drawings.has(floor.baseDrawingId) && !m.records[floor.baseDrawingId]?.deleted && !m.unresolvedReferenceIds.includes(floor.baseDrawingId)) fail('missing-base');
        if (!Number.isSafeInteger(floor.baseRevision) || floor.baseRevision < 1 || !/^[a-f0-9]{64}$/.test(floor.baseFingerprint || '')) fail('base-revision');
        const view = floor.baseView || {};
        if (Object.keys(view).some(k => !['visible', 'opacity', 'print', 'layers'].includes(k)) || view.visible != null && typeof view.visible !== 'boolean' || view.print != null && typeof view.print !== 'boolean' || view.opacity != null && (!Number.isFinite(view.opacity) || view.opacity < 0 || view.opacity > 1) || view.layers != null && (!Array.isArray(view.layers) || view.layers.some(l => typeof l !== 'string'))) fail('base-view');
      }
      chain(state, floor.id);
    }
    const spaces = new Set();
    for (const obj of state.objects || []) {
      if (obj.floorId && !drawings.has(obj.floorId)) fail('element-owner');
      if (obj.type === 'space') {
        if (typeof obj.spaceUuid !== 'string' || !obj.spaceUuid || spaces.has(obj.spaceUuid) || m.retiredSpaceUuids.includes(obj.spaceUuid) || m.spaceOrigins?.[obj.spaceUuid] && m.spaceOrigins[obj.spaceUuid] !== obj.floorId) fail('space-identity');
        spaces.add(obj.spaceUuid);
      }
    }
    const digest = v => /^[a-f0-9]{64}$/.test(v), signatureMap = map => map && typeof map === 'object' && !Array.isArray(map) && Object.entries(map).every(([id, value]) => id && digest(value));
    for (const [id, r] of Object.entries(m.records)) {
      if (!drawings.has(id) && !r.deleted || !Number.isSafeInteger(r.revision) || r.revision < 1 || !digest(r.fingerprint) || !signatureMap(r.elements) || !r.baseline || !Number.isSafeInteger(r.baseline.revision) || r.baseline.revision < 0 || r.baseline.fingerprint != null && !digest(r.baseline.fingerprint) || !signatureMap(r.baseline.elements)) fail('revision-record');
      if (Object.keys(r).some(k => !['revision', 'fingerprint', 'elements', 'spaces', 'baseline', 'delta', 'deleted'].includes(k)) || Object.keys(r.baseline).some(k => !['revision', 'fingerprint', 'elements'].includes(k)) || !r.spaces || typeof r.spaces !== 'object' || Array.isArray(r.spaces) || Object.entries(r.spaces).some(([uuid, element]) => !uuid || !validId(element)) || !r.delta || !Number.isSafeInteger(r.delta.fromRevision) || r.delta.fromRevision < 0 || Object.keys(r.delta).some(k => !['fromRevision', 'added', 'modified', 'deleted'].includes(k)) || ['added', 'modified', 'deleted'].some(k => !Array.isArray(r.delta[k]) || r.delta[k].some(id => !validId(id)))) fail('revision-fields');
    }
    for (const floor of state.floors) {
      const r = m.records[floor.id], objects = owned(state, floor.id), elements = Object.fromEntries(objects.map(o => [o.id, elementHash(o)]));
      if (!r || r.deleted || canonical(r.elements) !== canonical(elements) || r.fingerprint !== hash({ metadata: metadata(floor), elements })) fail('stale-drawing-content');
      const expectedSpaces = Object.fromEntries(objects.filter(o => o.type === 'space' && o.spaceUuid).map(o => [o.spaceUuid, o.id]));
      if (canonical(expectedSpaces) !== canonical(r.spaces)) fail('space-owner-record');
    }
    if (!Array.isArray(m.lineage)) fail('lineage');
    for (const item of m.lineage) {
      if (Object.keys(item).some(k => !['kind', 'drawingId', 'parents', 'children', 'revision'].includes(k))) fail('lineage-fields');
      if (!['split', 'merge'].includes(item.kind) || !drawings.has(item.drawingId) && !m.retiredDrawingIds.includes(item.drawingId) || !Number.isSafeInteger(item.revision) || item.revision < 1 || !Array.isArray(item.parents) || !Array.isArray(item.children) || !item.parents.length || !item.children.length || new Set([...item.parents, ...item.children]).size !== item.parents.length + item.children.length || item.parents.some(id => !spaces.has(id) && !m.retiredSpaceUuids.includes(id)) || item.children.some(id => !spaces.has(id) && !m.retiredSpaceUuids.includes(id)) || item.kind === 'split' && (item.parents.length !== 1 || item.children.length < 2) || item.kind === 'merge' && (item.parents.length < 2 || item.children.length !== 1)) fail('lineage-record');
    }
    return state;
  }
  function derive(state, baseId, { id, name, discipline = 'fire', levelId = undefined, baseView = {} }) {
    if (!enabled(state)) fail('not-enabled');
    const base = state.floors.find(f => f.id === baseId), rev = record(state, baseId);
    if (!base || !rev || !id || state.floors.some(f => f.id === id) || !name?.trim()) fail('derive');
    const floor = { id, name: name.trim(), buildingId: base.buildingId, order: state.floors.filter(f => f.buildingId === base.buildingId).length, sourceRegionId: null, discipline, levelId: levelId === undefined ? base.levelId || null : levelId, baseDrawingId: base.id, baseRevision: rev.revision, baseFingerprint: rev.fingerprint, baseView: { visible: true, opacity: .35, print: true, ...baseView }, ...(base.viewAlignment ? { viewAlignment: copy(base.viewAlignment) } : {}) };
    const next = { ...state, floors: [...state.floors, floor] }; next.drawingModel = sync(next); validate(next);
    return { floor, floors: next.floors, drawingModel: next.drawingModel };
  }
  function acknowledge(state, floorId) {
    const floor = state.floors.find(f => f.id === floorId), base = floor && record(state, floor.baseDrawingId);
    if (!floor || !base || referenceStatus(state, floor) === 'missing') fail('missing-base');
    const floors = state.floors.map(f => f.id === floorId ? { ...f, baseRevision: base.revision, baseFingerprint: base.fingerprint } : f), next = { ...state, floors };
    next.drawingModel = sync(next); validate(next); return { floors, drawingModel: next.drawingModel };
  }
  function dependencyClosure(state, requestedIds) {
    const set = new Set(), active = new Set();
    function add(id) {
      if (active.has(id)) fail('reference-cycle'); if (set.has(id)) return;
      const floor = state.floors.find(f => f.id === id); if (!floor) return;
      active.add(id);
      if (floor.baseDrawingId) add(floor.baseDrawingId);
      if (floor.viewAlignment?.referenceFloorId) add(floor.viewAlignment.referenceFloorId);
      active.delete(id); set.add(id);
    }
    requestedIds.forEach(add); return [...set];
  }
  function recordLineage(state, { drawingId, kind, parents, children }) {
    if (!enabled(state) || !['split', 'merge'].includes(kind) || !state.floors.some(f => f.id === drawingId)) fail('lineage-request');
    const spaces = state.objects.filter(o => o.type === 'space' && o.floorId === drawingId), current = new Set(spaces.map(o => o.spaceUuid));
    if (children.some(id => !current.has(id)) || parents.some(id => !current.has(id) && (!state.drawingModel.retiredSpaceUuids.includes(id) || state.drawingModel.spaceOrigins?.[id] !== drawingId))) fail('lineage-owner');
    const model = copy(state.drawingModel), objects = state.objects.filter(o => o.type !== 'space' || !parents.includes(o.spaceUuid));
    const next = { ...state, objects, drawingModel: model }; next.drawingModel = sync(next);
    const item = { kind, drawingId, parents: parents.slice(), children: children.slice(), revision: record(next, drawingId).revision };
    if (next.drawingModel.lineage.some(x => canonical({ ...x, revision: 0 }) === canonical({ ...item, revision: 0 }))) fail('duplicate-lineage');
    next.drawingModel.lineage.push(item); validate(next); return { objects, drawingModel: next.drawingModel };
  }
  root.planDrawings = Object.freeze({ capability, canonical, hashText, hash, elementHash, projectElement, nonDrawing, enabled, create, record, owned, metadata, sync, chain, referenceStatus, validate, derive, acknowledge, dependencyClosure, recordLineage });
})();
