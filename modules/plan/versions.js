/* Independent dated Plan drawings. Object instances and persistent spaces are
 * different identities; dates never advance a drawing's application state. */
(() => {
  'use strict';
  const M = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const capability = 'plan.versions.v1', schema = 8, copy = x => JSON.parse(JSON.stringify(x));
  const modelCopy = m => M.planBackgrounds?.copyModel(m) || copy(m);
  const domainCopy = s => ({ ...s, objects: (s.objects || []).map(o => o.floorId ? copy(o) : o), floors: copy(s.floors || []), buildings: copy(s.buildings || []), drawingModel: s.drawingModel ? modelCopy(s.drawingModel) : null, ...(s.references ? { references: M.planBackgrounds ? s.references.map(M.planBackgrounds.copyReference) : s.references } : {}) });
  const fail = code => { throw Error('plan-versions:' + code); };
  const id = s => typeof s === 'string' && s.length > 0 && s.length <= 255 && !/[\x00-\x1f]/.test(s) && !['__proto__', 'prototype', 'constructor'].includes(s);
  const groups = Object.freeze([
    { id: 'architecture', ko: '건축·공간', en: 'Architecture / spaces' },
    { id: 'fire', ko: '소방', en: 'Fire protection' },
    { id: 'electrical', ko: '전기·조명', en: 'Electrical / lighting' },
    { id: 'communication', ko: '통신·보안', en: 'Communications / security' },
    { id: 'mechanical', ko: '기계·설비', en: 'Mechanical / equipment' },
    { id: 'custom', ko: '사용자 지정', en: 'Custom' }
  ]);
  const enabled = s => s?.drawingModel?.version === 2;
  const row = (s, drawingId = s.activeFloorId) => s.drawingModel?.versions?.find(v => v.drawingId === drawingId) || null;
  const objects = (s, drawingId) => (s.objects || []).filter(o => o.floorId === drawingId);
  function date(value, required = false) {
    if (value === null || value === undefined || value === '') { if (required) fail('date-required'); return null; }
    if (typeof value !== 'string' || value.startsWith('0000-') || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail('date');
    const d = new Date(value + 'T00:00:00.000Z');
    if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== value) fail('date');
    return value;
  }
  const timestamp = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT/.test(value) && Number.isFinite(Date.parse(value));
  const readonly = (s, drawingId = s.activeFloorId) => Boolean(row(s, drawingId)?.sealedFingerprint);
  const status = v => v.planned ? 'planned' : v.current ? 'current' : v.sealedFingerprint ? 'past' : 'draft';
  function defaultLayer(o, discipline = 'architectural') {
    const group = ['wall', 'door', 'window', 'stair', 'space'].includes(o.type) ? 'architecture' : ({ fire: 'fire', electrical: 'electrical', lighting: 'electrical', communication: 'communication', security: 'communication', mechanical: 'mechanical' })[discipline] || 'architecture';
    const names = { wall: '벽', door: '문', window: '창', stair: '계단', space: '공간', dimension: '치수', line: '기초 형상', cadText: '문자', component: '구성품' };
    const item = names[o.type] ? o.type : 'other';
    return { id: group + ':' + item, group, name: names[o.type] || '기타 객체', visible: true, locked: false };
  }
  const layerId = (s, o) => row(s, o.floorId)?.assignments?.[o.id] || defaultLayer(o).id;
  const layer = (s, o) => row(s, o.floorId)?.layers?.find(l => l.id === layerId(s, o)) || null;
  const visible = (s, o) => !enabled(s) || layer(s, o)?.visible !== false;
  const editable = (s, o) => !enabled(s) || !readonly(s, o.floorId) && layer(s, o)?.locked !== true && visible(s, o);
  const fields = new Set(['wallId', 'wallIds', 'objectId', 'objectIds', 'ownerId', 'sourceObjectId', 'sourceObjectIds', 'recognitionSourceIds', 'vertexId', 'edgeId', 'fromVertexId', 'toVertexId']);
  const foreignBodies = new Set(['dxf', 'rawGroups', 'componentDefinition']);
  function references(o) {
    const result = new Set();
    const visit = (v, key = '') => {
      if (foreignBodies.has(key)) return;
      if (typeof v === 'string' && fields.has(key)) result.add(v);
      else if (Array.isArray(v)) v.forEach(x => visit(x, key));
      else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => visit(x, k));
    };
    visit(o); return [...result];
  }
  function remap(value, ids, key = '', path = []) {
    if (foreignBodies.has(key)) return value == null ? value : copy(value);
    const ownedId = key === 'id' && (path.length === 1 || path[0] === 'vertices' && (path.length === 3 || path.length === 4 && path[2] === 'outgoing'));
    if (typeof value === 'string') return (ownedId || fields.has(key)) && ids.has(value) ? ids.get(value) : value;
    if (Array.isArray(value)) return value.map((v, i) => remap(v, ids, key, [...path, i]));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, remap(v, ids, k, [...path, k])]));
    return value;
  }
  function content(s, v) {
    return M.planDrawings.hash({ objects: objects(s, v.drawingId).map(o => M.planDrawings.cleanTechnical(o)),
      assignments: v.assignments, origins: v.origins, layers: v.layers.map(({ id, group, name }) => ({ id, group, name })),
      retiredSpaces: Object.entries(s.drawingModel.spaceRegistry || {}).flatMap(([uuid, entry]) => Object.values(entry.instances).filter(i => i.drawingId === v.drawingId && i.excluded).map(i => ({ uuid, rootObjectId: entry.rootObjectId, ...i }))).sort((a, b) => a.snapshot.id < b.snapshot.id ? -1 : a.snapshot.id > b.snapshot.id ? 1 : 0),
      lineage: (s.drawingModel.lineage || []).filter(i => i.drawingId === v.drawingId) });
  }
  function initializeRow(s, floor, levelId, now) {
    const layers = [], assignments = {}, origins = {};
    const oldVisibility=new Map(s.planLayerVisibility||[]),legacyType={wall:'walls',door:'doors',window:'windows',space:'spaces',stair:'stairs',dimension:'dimensions'};
    for (const o of objects(s, floor.id)) {
      const l = defaultLayer(o, floor.discipline);
      if(oldVisibility.get(o.layerId||legacyType[o.type]||'drawing')===false){l.id+=':legacy-hidden';l.name+=' · 숨김';l.visible=false;}
      if (!layers.some(x => x.id === l.id)) layers.push(l);
      assignments[o.id] = l.id; origins[o.id] = { rootObjectId: o.id, sourceObjectId: null };
    }
    return { drawingId: floor.id, levelId, name: floor.name, description: '', modifiedDate: null, appliedDate: null,
      planned: false, current: true, sourceDrawingId: null, sourceFingerprint: null, createdAt: now, updatedAt: now,
      layers, assignments, origins, excluded: [], activeLayerId: layers[0]?.id || null, activeLayerExplicit: false, sealedFingerprint: null };
  }
  function upgrade(s, { now = new Date().toISOString() } = {}) {
    if (enabled(s)) { validate(s); return domainCopy(s); }
    if (!timestamp(now)) fail('timestamp');
    if (s.drawingModel && s.drawingModel.version !== 1) fail('unsupported-legacy-version');
    if ((s.floors || []).some(f => f.baseDrawingId)) fail('legacy-derived-requires-materialization');
    const next = domainCopy(s), old = next.drawingModel || null;
    next.drawingModel = { version: 2, packageId: old?.packageId || s.projectId, levels: [], versions: [], records: {}, lineage: [], spaceRegistry: {}, legacy: old };
    if (!id(next.drawingModel.packageId)) fail('package-id');
    for (const floor of next.floors || []) {
      const levelId = floor.levelId || floor.id;
      if (!next.drawingModel.levels.some(l => l.id === levelId)) next.drawingModel.levels.push({ id: levelId, buildingId: floor.buildingId, name: floor.name, order: floor.order || 0 });
      const v = initializeRow(next, floor, levelId, now);
      if (next.drawingModel.versions.some(x => x.levelId === levelId && x.current)) v.current = false;
      next.drawingModel.versions.push(v);
    }
    next.drawingModel = sync(next, { now }); validate(next); return next;
  }
  function sync(s, { now = new Date().toISOString() } = {}) {
    if (!enabled(s)) fail('not-enabled');
    const m = modelCopy(s.drawingModel), next = { ...s, drawingModel: m };
    if (!m.spaceRegistry || typeof m.spaceRegistry !== 'object' || Array.isArray(m.spaceRegistry)) fail('space-registry');
    const present = new Set((s.objects || []).filter(o => o.type === 'space' && o.floorId).map(o => o.id));
    for (const entry of Object.values(m.spaceRegistry)) for (const item of Object.values(entry.instances)) if (!present.has(item.snapshot.id)) item.excluded = true;
    for (const v of m.versions) {
      const ids = new Set(objects(s, v.drawingId).map(o => o.id));
      if (v.sealedFingerprint) { if (content(s, v) !== v.sealedFingerprint) fail('sealed-content-change'); }
      else {
        for (const o of objects(s, v.drawingId)) if (!Object.hasOwn(v.assignments, o.id)) {
          let l = v.activeLayerExplicit ? v.layers.find(l => l.id === v.activeLayerId && !l.locked && l.visible) : null;
          if (v.activeLayerExplicit && !l) fail('layer-not-editable');
          if (!l) { const fallback = defaultLayer(o); l = v.layers.find(l => l.id === fallback.id); if (!l) v.layers.push(l = fallback); }
          if (l.locked || !l.visible) fail('layer-not-editable');
          v.assignments[o.id] = l.id; if (!v.activeLayerExplicit) v.activeLayerId = l.id; if (!Object.hasOwn(v.origins, o.id)) v.origins[o.id] = { rootObjectId: o.id, sourceObjectId: null };
        }
        for (const id of Object.keys(v.assignments)) if (!ids.has(id)) { delete v.assignments[id]; delete v.origins[id]; }
      }
      for (const o of objects(s, v.drawingId).filter(o => o.type === 'space')) {
        if (!id(o.spaceUuid)) fail('space-identity'); const origin = v.origins[o.id];
        const entry = Object.hasOwn(m.spaceRegistry, o.spaceUuid) ? m.spaceRegistry[o.spaceUuid] : (m.spaceRegistry[o.spaceUuid] = { rootObjectId: origin.rootObjectId, instances: {} });
        const old = entry.instances[o.id]; if (old?.excluded || old && old.drawingId !== v.drawingId) fail('space-instance-reuse');
        if (entry.rootObjectId !== origin.rootObjectId) fail('space-origin-conflict');
        entry.instances[o.id] = { drawingId: v.drawingId, excluded: false, sourceObjectId: origin.sourceObjectId, snapshot: M.planDrawings.cleanTechnical(copy(o)) };
      }
      if (v.sourceDrawingId) { const inherited = new Set(Object.values(v.origins).map(o => o.sourceObjectId).filter(Boolean)); v.excluded = objects(s, v.sourceDrawingId).filter(o => !inherited.has(o.id)).map(o => o.id); }
      const fingerprint = content(next, v), old = Object.hasOwn(m.records, v.drawingId) ? m.records[v.drawingId] : null, elements = Object.fromEntries(objects(s, v.drawingId).map(o => [o.id, M.planDrawings.elementHash(o)]));
      if (!old || old.fingerprint !== fingerprint) v.updatedAt = now;
      m.records[v.drawingId] = { revision: old ? old.revision + Number(old.fingerprint !== fingerprint) : 1, fingerprint, elements,
        spaces: Object.fromEntries(objects(s, v.drawingId).filter(o => o.type === 'space').map(o => [o.spaceUuid, o.id])) };
    }
    return m.backgrounds ? M.planBackgrounds.sync(next).drawingModel : m;
  }
  function inheritance(s, sourceId, requested) {
    validate(s); const v = row(s, sourceId); if (!v) fail('source');
    const own = objects(s, sourceId), byId = new Map(own.map(o => [o.id, o])), chosen = new Set(requested || v.layers.map(l => l.id));
    for (const k of chosen) if (!v.layers.some(l => l.id === k)) fail('layer');
    const included = new Set(own.filter(o => chosen.has(v.assignments[o.id])).map(o => o.id)), reasons = [];
    const queue = [...included];
    for (let i = 0; i < queue.length; i++) for (const ref of references(byId.get(queue[i]))) {
      if (byId.has(ref) && !included.has(ref)) { included.add(ref); queue.push(ref); reasons.push({ objectId: queue[i], requiredObjectId: ref, layerId: v.assignments[ref] }); }
    }
    for (const o of own) if (included.has(o.id)) {
      for (const wallId of [o.wallId, ...(o.wallIds || []), o.constraints?.reference?.wallId, ...Object.values(o.attachments || {}).map(a => a?.wallId)].filter(Boolean)) {
        if (!byId.has(wallId) || byId.get(wallId).type !== 'wall') fail('missing-host-wall');
      }
    }
    return { objects: own.filter(o => included.has(o.id)), layers: v.layers.filter(l => chosen.has(l.id) || own.some(o => included.has(o.id) && v.assignments[o.id] === l.id)), reasons,
      counts: v.layers.map(l => ({ ...copy(l), count: own.filter(o => v.assignments[o.id] === l.id).length })) };
  }
  function fork(s, options, { uid, now = new Date().toISOString() } = {}) {
    validate(s); if (typeof uid !== 'function' || !timestamp(now)) fail('creation-context');
    const source = row(s, options.sourceDrawingId), name = String(options.name || '').trim();
    if (!source || !name || name.length > 255 || typeof options.description !== 'string' || options.description.length > 100000 || typeof options.planned !== 'boolean') fail('creation-fields');
    if (options.levelId && options.levelId !== source.levelId || options.sourceFingerprint && options.sourceFingerprint !== s.drawingModel.records[source.drawingId]?.fingerprint) fail('stale-source');
    const modifiedDate = date(options.modifiedDate, true), appliedDate = date(options.appliedDate), selected = inheritance(s, source.drawingId, options.layerIds);
    const next = domainCopy(s), used = new Set([s.projectId, s.drawingModel.packageId, ...(s.references || []).map(r => r.id), ...s.buildings.map(b => b.id), ...s.drawingModel.levels.map(l => l.id), ...s.floors.map(f => f.id), ...Object.values(s.drawingModel.spaceRegistry || {}).flatMap(e => Object.keys(e.instances)), ...s.objects.flatMap(o => [o.id, ...(o.vertices || []).flatMap(v => [v.id, v.outgoing?.id].filter(Boolean))])]);
    const fresh = type => { const result = uid(type); if (!id(result) || used.has(result)) fail('id-collision'); used.add(result); return result; };
    const drawingId = fresh('drawing'), ids = new Map();
    for (const o of selected.objects) { ids.set(o.id, fresh(o.type)); for (const v of o.vertices || []) { ids.set(v.id, fresh('vertex')); if (v.outgoing) ids.set(v.outgoing.id, fresh('edge')); } }
    const clones = selected.objects.map(o => ({ ...remap(o, ids), floorId: drawingId }));
    const originalFloor = next.floors.find(f => f.id === source.drawingId), floor = { ...copy(originalFloor), id: drawingId, name, order: next.floors.length };
    for (const k of ['baseDrawingId', 'baseRevision', 'baseFingerprint', 'baseView']) delete floor[k];
    const layers = copy(selected.layers).map(l => ({ ...l, locked: false })), v = { drawingId, levelId: source.levelId, name, description: options.description, modifiedDate, appliedDate,
      planned: options.planned, current: false, sourceDrawingId: source.drawingId, sourceFingerprint: next.drawingModel.records[source.drawingId].fingerprint,
      createdAt: now, updatedAt: now, layers, assignments: {}, origins: {}, excluded: objects(s, source.drawingId).filter(o => !ids.has(o.id)).map(o => o.id), activeLayerId: layers[0]?.id || null, activeLayerExplicit: false, sealedFingerprint: null };
    for (const o of selected.objects) { const instanceId = ids.get(o.id); v.assignments[instanceId] = source.assignments[o.id]; v.origins[instanceId] = { rootObjectId: source.origins[o.id]?.rootObjectId || o.id, sourceObjectId: o.id }; }
    const parent = row(next, source.drawingId); parent.sealedFingerprint ||= content(next, parent);
    next.floors.push(floor); next.objects.push(...clones); next.drawingModel.versions.push(v); next.activeFloorId = drawingId; next.activeBuildingId = floor.buildingId;
    M.planBackgrounds?.fork(s, next, source.drawingId, drawingId, fresh);
    next.drawingModel = sync(next, { now }); validate(next); return { state: next, drawingId, reasons: selected.reasons };
  }
  function apply(s, drawingId, { now = new Date().toISOString() } = {}) {
    validate(s); const next = domainCopy(s), v = row(next, drawingId); if (!v || !timestamp(now)) fail('apply');
    for (const other of next.drawingModel.versions.filter(x => x.levelId === v.levelId)) { other.current = false; if (other.drawingId !== drawingId) other.sealedFingerprint ||= content(next, other); }
    v.current = true; v.planned = false; v.sealedFingerprint ||= content(next, v); v.updatedAt = now;
    next.drawingModel = sync(next, { now }); validate(next); return next;
  }
  function setLayer(s, drawingId, layerId, patch) {
    validate(s); const next = domainCopy(s), v = row(next, drawingId), l = v?.layers.find(l => l.id === layerId);
    if (!l || Object.keys(patch).some(k => !['visible', 'locked'].includes(k)) || Object.values(patch).some(v => typeof v !== 'boolean')) fail('layer-state');
    Object.assign(l, patch); validate(next); return next;
  }
  function addLayer(s, drawingId, { id: layerId, name, group }) {
    validate(s); if (readonly(s, drawingId)) fail('readonly'); const next = domainCopy(s), v = row(next, drawingId);
    if (!v || !id(layerId) || v.layers.some(l => l.id === layerId) || typeof name !== 'string' || !name.trim() || name.length > 255 || !groups.some(g => g.id === group)) fail('new-layer');
    v.layers.push({ id: layerId, name: name.trim(), group, visible: true, locked: false }); v.activeLayerId = layerId; v.activeLayerExplicit = true;
    next.drawingModel = sync(next); validate(next); return next;
  }
  function setActiveLayer(s, drawingId, layerId) {
    validate(s); if (readonly(s, drawingId)) fail('readonly'); const next = domainCopy(s), v = row(next, drawingId), l = v?.layers.find(l => l.id === layerId);
    if (!l || l.locked || !l.visible) fail('layer-not-editable'); v.activeLayerId = layerId; v.activeLayerExplicit = true; validate(next); return next;
  }
  function assign(s, drawingId, objectIds, layerId) {
    validate(s); if (readonly(s, drawingId)) fail('readonly'); const next = domainCopy(s), v = row(next, drawingId), l = v?.layers.find(l => l.id === layerId);
    if (!l || l.locked || !l.visible || !objectIds.length || new Set(objectIds).size !== objectIds.length) fail('layer-assignment');
    for (const oid of objectIds) { const o = s.objects.find(o => o.id === oid && o.floorId === drawingId); if (!o || !editable(s, o)) fail('layer-assignment'); v.assignments[oid] = layerId; }
    next.drawingModel = sync(next); validate(next); return next;
  }
  function addLevel(s, { buildingId, name, drawingName = name }, { uid, now = new Date().toISOString() } = {}) {
    validate(s); if (typeof uid !== 'function' || !timestamp(now) || !s.buildings.some(b => b.id === buildingId) || typeof name !== 'string' || !name.trim() || name.length > 255 || typeof drawingName !== 'string' || !drawingName.trim() || drawingName.length > 255) fail('new-level');
    const next = domainCopy(s), used = new Set([...s.buildings.map(b => b.id), ...s.floors.map(f => f.id), ...s.drawingModel.levels.map(l => l.id), ...s.objects.map(o => o.id)]);
    const fresh = type => { const value = uid(type); if (!id(value) || used.has(value)) fail('id-collision'); used.add(value); return value; };
    const levelId = fresh('level'), drawingId = fresh('drawing');
    const floor = { id: drawingId, buildingId, name: drawingName.trim(), discipline: 'architectural', sourceRegionId: null, order: next.floors.filter(f => f.buildingId === buildingId).length };
    next.drawingModel.levels.push({ id: levelId, buildingId, name: name.trim(), order: next.drawingModel.levels.filter(l => l.buildingId === buildingId).length });
    next.floors.push(floor); next.drawingModel.versions.push(initializeRow(next, floor, levelId, now)); next.activeFloorId = drawingId; next.activeBuildingId = buildingId;
    M.planBackgrounds?.addEmpty(next, drawingId);
    next.drawingModel = sync(next, { now }); validate(next); return next;
  }
  function addBuilding(s, { id: buildingId, name }) {
    validate(s); if (!id(buildingId) || [...s.buildings, ...s.floors, ...s.objects, ...s.drawingModel.levels].some(x => x.id === buildingId) || typeof name !== 'string' || !name.trim() || name.length > 255) fail('new-building');
    const next = domainCopy(s); next.buildings.push({ id: buildingId, name: name.trim(), order: next.buildings.length }); validate(next); return next;
  }
  function renameLayer(s, drawingId, layerId, name) {
    validate(s); if (readonly(s, drawingId)) fail('readonly'); const next = domainCopy(s), l = row(next, drawingId)?.layers.find(l => l.id === layerId);
    if (!l || typeof name !== 'string' || !name.trim() || name.length > 255) fail('layer-name'); l.name = name.trim(); next.drawingModel = sync(next); validate(next); return next;
  }
  function recordLineage(s, { drawingId, kind, parents, children }, { now = new Date().toISOString() } = {}) {
    validate(s); const v = row(s, drawingId); if (!v || readonly(s, drawingId)) fail('readonly');
    if (!timestamp(now) || !['split', 'merge'].includes(kind) || !Array.isArray(parents) || !Array.isArray(children) || [...parents, ...children].some(x => !id(x)) || new Set([...parents, ...children]).size !== parents.length + children.length || kind === 'split' && (parents.length !== 1 || children.length < 2) || kind === 'merge' && (parents.length < 2 || children.length !== 1)) fail('lineage-request');
    const ancestry = [drawingId]; let cursor = v;
    while (cursor.sourceDrawingId) { ancestry.push(cursor.sourceDrawingId); cursor = row(s, cursor.sourceDrawingId); }
    const parentInstances = parents.map(uuid => {
      const entry = s.drawingModel.spaceRegistry[uuid], found = ancestry.map(id => Object.values(entry?.instances || {}).find(i => i.drawingId === id)).find(Boolean);
      if (!found) fail('lineage-parent'); return { spaceUuid: uuid, drawingId: found.drawingId, objectId: found.snapshot.id };
    });
    const childInstances = children.map(uuid => {
      const o = objects(s, drawingId).find(o => o.type === 'space' && o.spaceUuid === uuid);
      if (!o || v.origins[o.id].sourceObjectId !== null || v.origins[o.id].rootObjectId !== o.id) fail('lineage-child');
      if (!editable(s, o)) fail('layer-not-editable');
      return { spaceUuid: uuid, drawingId, objectId: o.id };
    });
    for (const item of parentInstances) { const o = s.objects.find(o => o.id === item.objectId); if (o?.floorId === drawingId && !editable(s, o)) fail('layer-not-editable'); }
    const next = domainCopy(s), remove = new Set(parentInstances.filter(i => i.drawingId === drawingId).map(i => i.objectId));
    next.objects = next.objects.filter(o => !remove.has(o.id));
    next.drawingModel.lineage.push({ drawingId, kind, parents: copy(parents), children: copy(children), parentInstances, childInstances, createdAt: now });
    next.drawingModel = sync(next, { now }); validate(next); return next;
  }
  function validateSpaceLedger(s, m) {
    const registry = m.spaceRegistry, instances = new Map(), roots = new Map(), liveById = new Map((s.objects || []).map(o => [o.id, o]));
    if (!registry || typeof registry !== 'object' || Array.isArray(registry)) fail('space-registry');
    for (const [uuid, entry] of Object.entries(registry)) {
      if (!id(uuid) || !id(entry?.rootObjectId) || !entry.instances || typeof entry.instances !== 'object' || Array.isArray(entry.instances) || !Object.keys(entry.instances).length || Object.keys(entry).some(k => !['rootObjectId', 'instances'].includes(k))) fail('space-registry-entry');
      if (roots.has(entry.rootObjectId) && roots.get(entry.rootObjectId) !== uuid) fail('space-root-reuse'); roots.set(entry.rootObjectId, uuid);
      for (const [instanceId, item] of Object.entries(entry.instances)) {
        const o = item?.snapshot, v = row(s, item?.drawingId), live = liveById.get(instanceId);
        if (!id(instanceId) || instances.has(instanceId) || !v || typeof item.excluded !== 'boolean' || Object.keys(item).some(k => !['drawingId', 'excluded', 'sourceObjectId', 'snapshot'].includes(k)) || item.sourceObjectId !== null && !id(item.sourceObjectId) || o?.type !== 'space' || o.id !== instanceId || o.spaceUuid !== uuid || o.floorId !== item.drawingId || !Array.isArray(o.polygon) || o.polygon.length < 3 || !o.polygon.every(p => Number.isFinite(p?.x) && Number.isFinite(p?.y)) || M.planDrawings.canonical(o) !== M.planDrawings.canonical(M.planDrawings.cleanTechnical(o))) fail('space-registry-instance');
        if (item.excluded ? Boolean(live) : !live || live.type !== 'space' || M.planDrawings.canonical(M.planDrawings.cleanTechnical(live)) !== M.planDrawings.canonical(o) || v.origins[instanceId]?.rootObjectId !== entry.rootObjectId || v.origins[instanceId]?.sourceObjectId !== item.sourceObjectId) fail('space-registry-content');
        if (item.sourceObjectId === null && entry.rootObjectId !== instanceId) fail('space-registry-origin');
        instances.set(instanceId, { ...item, uuid, rootObjectId: entry.rootObjectId });
      }
    }
    for (const o of s.objects || []) if (o.type === 'space' && o.floorId && !instances.has(o.id)) fail('space-registry-missing');
    for (const item of instances.values()) if (item.sourceObjectId) {
      const source = instances.get(item.sourceObjectId), parent = row(s, item.drawingId)?.sourceDrawingId;
      if (!source || source.drawingId !== parent || source.uuid !== item.uuid || source.rootObjectId !== item.rootObjectId) fail('space-registry-source');
    }
    const childrenSeen = new Set(), edges = new Map();
    for (const item of m.lineage) {
      const v = row(s, item?.drawingId);
      if (!v || Object.keys(item).some(k => !['drawingId', 'kind', 'parents', 'children', 'parentInstances', 'childInstances', 'createdAt'].includes(k)) || !timestamp(item.createdAt) || !['split', 'merge'].includes(item.kind) || !Array.isArray(item.parents) || !Array.isArray(item.children) || new Set([...item.parents, ...item.children]).size !== item.parents.length + item.children.length || item.kind === 'split' && (item.parents.length !== 1 || item.children.length < 2) || item.kind === 'merge' && (item.parents.length < 2 || item.children.length !== 1) || !Array.isArray(item.parentInstances) || item.parentInstances.length !== item.parents.length || !Array.isArray(item.childInstances) || item.childInstances.length !== item.children.length) fail('lineage-record');
      const ancestry = new Set([v.drawingId]); let parent = v; while (parent.sourceDrawingId) { ancestry.add(parent.sourceDrawingId); parent = row(s, parent.sourceDrawingId); }
      for (const [list, ids, child] of [[item.parentInstances, item.parents, false], [item.childInstances, item.children, true]]) list.forEach((link, i) => {
        const known = instances.get(link?.objectId);
        if (!known || link.spaceUuid !== ids[i] || known.uuid !== link.spaceUuid || known.drawingId !== link.drawingId || Object.keys(link).some(k => !['spaceUuid', 'drawingId', 'objectId'].includes(k)) || child && (link.drawingId !== item.drawingId || known.sourceObjectId !== null || childrenSeen.has(link.spaceUuid)) || !child && (!ancestry.has(link.drawingId) || link.drawingId === item.drawingId && !known.excluded)) fail('lineage-instance');
        if (child) childrenSeen.add(link.spaceUuid);
      });
      for (const parent of item.parents) { const children = edges.get(parent) || new Set(); item.children.forEach(c => children.add(c)); edges.set(parent, children); }
    }
    const visiting = new Set(), visited = new Set();
    const visit = uuid => { if (visiting.has(uuid)) fail('lineage-cycle'); if (visited.has(uuid)) return; visiting.add(uuid); for (const child of edges.get(uuid) || []) visit(child); visiting.delete(uuid); visited.add(uuid); };
    edges.forEach((_, uuid) => visit(uuid));
  }
  function validate(s) {
    if (!enabled(s)) fail('version'); const m = s.drawingModel;
    if (Object.keys(m).some(k => !['version', 'packageId', 'levels', 'versions', 'records', 'lineage', 'spaceRegistry', 'legacy', 'backgrounds'].includes(k))) fail('model-fields');
    if (!id(m.packageId) || !Array.isArray(m.levels) || !Array.isArray(m.versions) || !Array.isArray(m.lineage) || !m.records || typeof m.records !== 'object') fail('model');
    const unique = (list, key) => { const set = new Set(); for (const o of list) { if (!id(o[key]) || set.has(o[key])) fail('duplicate-' + key); set.add(o[key]); } return set; };
    const buildings = unique(s.buildings || [], 'id'), floors = unique(s.floors || [], 'id'), levels = unique(m.levels, 'id'), instances = unique(s.objects || [], 'id'), drawings = unique(m.versions, 'drawingId');
    if (floors.size !== drawings.size || [...floors].some(f => !drawings.has(f))) fail('drawing-coverage');
    for (const level of m.levels) if (!buildings.has(level.buildingId) || typeof level.name !== 'string' || !level.name.trim()) fail('level');
    const persistent = new Map();
    for (const v of m.versions) {
      if (Object.keys(v).some(k => !['drawingId', 'levelId', 'name', 'description', 'modifiedDate', 'appliedDate', 'planned', 'current', 'sourceDrawingId', 'sourceFingerprint', 'createdAt', 'updatedAt', 'layers', 'assignments', 'origins', 'excluded', 'activeLayerId', 'activeLayerExplicit', 'sealedFingerprint'].includes(k))) fail('version-field');
      const floor = s.floors.find(f => f.id === v.drawingId), level = m.levels.find(l => l.id === v.levelId);
      if (!levels.has(v.levelId) || floor.name !== v.name || floor.buildingId !== level.buildingId || typeof v.name !== 'string' || !v.name.trim() || v.name.length > 255 || typeof v.description !== 'string' || typeof v.planned !== 'boolean' || typeof v.current !== 'boolean' || !timestamp(v.createdAt) || !timestamp(v.updatedAt)) fail('version-fields');
      date(v.modifiedDate); date(v.appliedDate);
      if (v.current && v.planned || m.versions.filter(x => x.levelId === v.levelId && x.current).length > 1) fail('current-state');
      if (!Array.isArray(v.layers) || !v.assignments || !v.origins || !Array.isArray(v.excluded)) fail('version-objects');
      const layerIds = unique(v.layers, 'id');
      for (const l of v.layers) if (!groups.some(g => g.id === l.group) || typeof l.name !== 'string' || !l.name.trim() || typeof l.visible !== 'boolean' || typeof l.locked !== 'boolean') fail('layer');
      if (typeof v.activeLayerExplicit !== 'boolean' || v.activeLayerId !== null && !layerIds.has(v.activeLayerId)) fail('active-layer');
      const own = objects(s, v.drawingId), ownIds = new Set(own.map(o => o.id)), spaces = new Set(), roots = new Set();
      if (Object.keys(v.assignments).some(k => !ownIds.has(k)) || Object.keys(v.origins).some(k => !ownIds.has(k))) fail('foreign-assignment');
      for (const o of own) {
        if (!layerIds.has(v.assignments[o.id]) || !id(v.origins[o.id]?.rootObjectId) || v.origins[o.id].sourceObjectId !== null && !id(v.origins[o.id].sourceObjectId)) fail('object-lineage');
        const origin = v.origins[o.id];
        if (roots.has(origin.rootObjectId)) fail('duplicate-object-origin'); roots.add(origin.rootObjectId);
        if (origin.sourceObjectId === null && origin.rootObjectId !== o.id) fail('new-object-origin');
        if (o.type === 'space') {
          if (!id(o.spaceUuid) || spaces.has(o.spaceUuid)) fail('space-identity'); spaces.add(o.spaceUuid);
          const root = persistent.get(o.spaceUuid); if (root && root !== v.origins[o.id].rootObjectId) fail('space-origin-conflict'); persistent.set(o.spaceUuid, v.origins[o.id].rootObjectId);
        }
        for (const host of [o.wallId, ...(o.wallIds || []), o.constraints?.reference?.wallId, ...Object.values(o.attachments || {}).map(a => a?.wallId)].filter(Boolean)) if (!own.some(x => x.id === host && x.type === 'wall')) {
          // A deleted boundary can leave an explicitly invalid draft space for
          // correction. Preserve it, but never accept another version's host.
          if (o.type === 'space' && o.invalid === true && !instances.has(host) && (o.wallIds || []).includes(host)) continue;
          fail('cross-version-host');
        }
      }
      if (v.sourceDrawingId) {
        const parent = row(s, v.sourceDrawingId); if (!parent || parent.levelId !== v.levelId || parent.sealedFingerprint !== v.sourceFingerprint || !/^[a-f0-9]{64}$/.test(v.sourceFingerprint || '')) fail('source-version');
        const parentObjects = new Map(objects(s, parent.drawingId).map(o => [o.id, o])), inherited = new Set();
        for (const origin of Object.values(v.origins)) if (origin.sourceObjectId) { if (!parentObjects.has(origin.sourceObjectId) || parent.origins[origin.sourceObjectId].rootObjectId !== origin.rootObjectId) fail('source-object-lineage'); inherited.add(origin.sourceObjectId); }
        if (new Set(v.excluded).size !== v.excluded.length || v.excluded.some(id => !parentObjects.has(id) || inherited.has(id)) || [...parentObjects.keys()].some(id => !inherited.has(id) && !v.excluded.includes(id))) fail('source-partition');
        const visited = new Set([v.drawingId]); let item = parent;
        while (item) { if (visited.has(item.drawingId)) fail('source-cycle'); visited.add(item.drawingId); item = item.sourceDrawingId ? row(s, item.sourceDrawingId) : null; }
      }
      const fingerprint = content(s, v);
      const record = m.records[v.drawingId], expected = Object.fromEntries(own.map(o => [o.id, M.planDrawings.elementHash(o)])), expectedSpaces = Object.fromEntries(own.filter(o => o.type === 'space').map(o => [o.spaceUuid, o.id]));
      if (!record || !Number.isSafeInteger(record.revision) || record.revision < 1 || record.fingerprint !== fingerprint || M.planDrawings.canonical(record.elements) !== M.planDrawings.canonical(expected) || M.planDrawings.canonical(record.spaces) !== M.planDrawings.canonical(expectedSpaces)) fail('stale-content');
      if (v.sealedFingerprint !== null && v.sealedFingerprint !== fingerprint) fail('sealed-content-change');
    }
    for (const o of s.objects || []) if (o.floorId && !drawings.has(o.floorId)) fail('foreign-object-owner');
    validateSpaceLedger(s, m);
    if (m.backgrounds) { if (!M.planBackgrounds) fail('background-module-required'); M.planBackgrounds.validate(s); }
    return s;
  }
  M.planVersions = Object.freeze({ capability, schema, groups, enabled, row, objects, date, status, readonly, layerId, layer, visible, editable, references, content, upgrade, sync, inheritance, fork, apply, setLayer, addLayer, setActiveLayer, assign, addLevel, addBuilding, renameLayer, recordLineage, validate, initialRow:initializeRow, remapOwner:remap });
})();
