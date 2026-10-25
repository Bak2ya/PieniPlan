/* Minimal Plan exchange. Authoring archives and facility business data stay outside. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {}, D = root.planDrawings;
  const clone = value => JSON.parse(JSON.stringify(value)), fail = code => { throw Error('plan-package:' + code); };
  const planTypes = new Set(['wall', 'door', 'window', 'dimension', 'space', 'stair', 'component', 'line']);
  const isPlan = o => planTypes.has(o.type) || o.planNature || o.planRole === 'annotation' && o.type === 'cadText' || o.planRole === 'geometry';
  const floorKeys = ['id', 'name', 'order', 'discipline', 'sourceProjectId', 'sourceRegionId', 'sourceDrawingId', 'levelId', 'baseDrawingId', 'baseRevision', 'baseFingerprint', 'baseView', 'viewAlignment', 'sourceReferenceFingerprint', 'referenceSourcesOmitted', 'externalSourceRegionId'];
  const select = (o, keys) => Object.fromEntries(keys.filter(k => Object.hasOwn(o, k)).map(k => [k, clone(o[k])]));
  const digest = v => /^[a-f0-9]{64}$/.test(v || '');
  function finiteData(value, depth = 0) {
    if (depth > 40) fail('depth');
    if (typeof value === 'number' && !Number.isFinite(value)) fail('nonfinite');
    if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key) || D.nonDrawing(key)) fail('non-drawing-field');
      finiteData(item, depth + 1);
    }
  }
  function toState(pkg, { receipt = false } = {}) {
    const buildings = [], floors = [], objects = [];
    for (const building of pkg.buildings) {
      buildings.push(select(building, ['id', 'name', 'order']));
      for (const drawing of building.drawings) {
        const floor = { ...select(drawing, floorKeys), buildingId: building.id };if(!pkg.drawingModel)floor.sourceRegionId=null;
        floors.push(floor); objects.push(...drawing.objects.map(o => ({ ...clone(o), floorId: floor.id })));
      }
    }
    const state = { buildings, floors, objects, drawingModel: pkg.drawingModel ? clone(pkg.drawingModel) : null };
    if (receipt && state.drawingModel) for (const r of Object.values(state.drawingModel.records)) if (!r.deleted) {
      r.baseline = { revision: r.revision, fingerprint: r.fingerprint, elements: clone(r.elements) };
      r.delta = { fromRevision: r.revision, added: [], modified: [], deleted: [] };
    }
    if (receipt && state.drawingModel) state.drawingModel.exchangeScope = { ...(state.drawingModel.exchangeScope || {}), completePackage: pkg.scope.completePackage };
    return state;
  }
  function contentRevision(pkg) {
    // Receipt baselines, timestamps and app versions are not drawing content.
    return D.hash({ packageId: pkg.packageId, buildings: pkg.buildings, levels: pkg.drawingModel?.levels || [],
      records: Object.fromEntries(Object.entries(pkg.drawingModel?.records || {}).map(([id, r]) => [id, select(r, ['revision', 'fingerprint', 'deleted'])])),
      lineage: pkg.drawingModel?.lineage || [], retiredSpaceUuids: pkg.drawingModel?.retiredSpaceUuids || [],
      origins: pkg.drawingModel?.exchangeScope?.origins || {}, scope: pkg.scope, styles: pkg.planObjectStyles || {} });
  }
  function validate(pkg) {
    if (pkg?.format !== 'PieniPlanPlanPackage' || pkg.schemaVersion !== 1 || typeof pkg.packageId !== 'string' || !pkg.packageId || !Array.isArray(pkg.buildings) || !pkg.buildings.length) fail('format');
    if (!Array.isArray(pkg.requiredCapabilities || []) || (pkg.requiredCapabilities || []).some(c => ![D.capability, root.planNature?.capability,'plan.components.v2','plan.door.mechanism.v1'].includes(c))) fail('unsupported-capability');
    finiteData(pkg); root.planNature?.validateStyles(pkg.planObjectStyles);
    const extended = pkg.requiredCapabilities?.includes(D.capability);
    if (Boolean(pkg.drawingModel) !== Boolean(extended) || !extended && (pkg.scope || pkg.packageRevision)) fail('missing-capability');
    const ids = { buildings: new Set(), drawings: new Set(), elements: new Set(), spaces: new Set() };
    const add = (kind, id) => { if (typeof id !== 'string' || !id || id.length > 255 || ['__proto__', 'constructor', 'prototype'].includes(id) || /[\x00-\x1f]/.test(id) || ids[kind].has(id)) fail('duplicate-' + kind); ids[kind].add(id); };
    for (const b of pkg.buildings) {
      add('buildings', b.id); if (!Array.isArray(b.drawings) || !b.drawings.length) fail('drawings');
      if (extended && Object.keys(b).some(k => !['id', 'name', 'order', 'drawings'].includes(k))) fail('building-field');
      for (const f of b.drawings) {
        add('drawings', f.id); if (!Array.isArray(f.objects)) fail('objects');
        if (extended && Object.keys(f).some(k => ![...floorKeys, 'objects'].includes(k))) fail('drawing-field');
        if (!extended && ['levelId', 'baseDrawingId', 'baseRevision', 'baseFingerprint', 'baseView'].some(k => Object.hasOwn(f, k))) fail('missing-capability');
        for (const o of f.objects) {
          add('elements', o.id); if (!isPlan(o) || o.floorId && o.floorId !== f.id) fail('element-owner');
          if (extended && D.canonical(D.projectElement(o)) !== D.canonical(o)) fail('authoring-field');
          if(o.componentDefinition&&!pkg.requiredCapabilities?.includes('plan.components.v2')||o.doorModel93&&!pkg.requiredCapabilities?.includes('plan.door.mechanism.v1'))fail('missing-element-capability');
          if (o.type === 'space' && o.spaceUuid) add('spaces', o.spaceUuid);
          if (o.planNature || root.planNature?.isGeometry(o)) {
            if (!pkg.requiredCapabilities?.includes(root.planNature.capability)) fail('missing-nature-capability');
            root.planNature.validateObject(o);
          }
        }
      }
    }
    if (extended) {
      if (Object.keys(pkg).some(k => !['format', 'fileType', 'schemaVersion', 'requiredCapabilities', 'packageId', 'packageRevision', 'createdAt', 'app', 'buildings', 'drawingModel', 'scope', 'omissions', 'planObjectStyles'].includes(k))) fail('package-field');
      const s = pkg.scope;
      if (!s || !['full', 'building', 'drawing', 'discipline', 'merged'].includes(s.kind) || typeof s.completePackage !== 'boolean' || s.authoritativeDeletion !== false || !Array.isArray(s.requestedDrawingIds) || !Array.isArray(s.includedDrawingIds) || new Set(s.includedDrawingIds).size !== ids.drawings.size || s.includedDrawingIds.some(id => !ids.drawings.has(id)) || s.requestedDrawingIds.some(id => !ids.drawings.has(id)) || Object.keys(s).some(k => !['kind', 'completePackage', 'authoritativeDeletion', 'requestedDrawingIds', 'includedDrawingIds'].includes(k))) fail('scope');
      if (pkg.drawingModel.packageId !== pkg.packageId) fail('package-identity');
      D.validate(toState(pkg));
      if (!digest(pkg.packageRevision) || pkg.packageRevision !== contentRevision(pkg)) fail('package-revision');
    }
    // The document validator checks actual semantic geometry before publication,
    // including legacy packages. Fingerprints alone do not validate a drawing.
    if (root.projectStaging) {
      const state = toState(pkg), caps = [...(pkg.requiredCapabilities || []), root.cadPolyline?.capability, root.cadPolylineFit?.capability, root.cadPolylineWidth?.capability, 'cad.annotation.v2'].filter(Boolean);
      root.projectStaging.validate({ format: 'PieniPlan', schemaVersion: 7, requiredCapabilities: [...new Set(caps)], drawing: { ...state, toolSettings: { planObjectStyles: pkg.planObjectStyles || {} } } });
    }
    return pkg;
  }
  function make(state, { kind = 'full', buildingId, drawingId, discipline, buildingName, app = {}, styles = {}, now = new Date().toISOString() } = {}) {
    if (!D.enabled(state)) fail('model-required');
    const source = { ...state, drawingModel: D.sync(state) }; D.validate(source);
    let requested = source.floors.filter(f => kind === 'full' || kind === 'building' && f.buildingId === buildingId || kind === 'drawing' && f.id === drawingId || kind === 'discipline' && f.discipline === discipline).map(f => f.id);
    if (!requested.length) fail('empty-scope');
    const closure = new Set(D.dependencyClosure(source, requested)), floors = clone(source.floors.filter(f => closure.has(f.id))), omittedFields = new Set(), omittedObjects = [];
    for(const floor of floors){const refs=(source.references||[]).filter(r=>r.floorId===floor.id||r.type==='linkedCadRegion'&&r.regionId===floor.sourceRegionId);if(floor.sourceRegionId){floor.externalSourceRegionId=floor.sourceRegionId;floor.sourceRegionId=null;floor.referenceSourcesOmitted=true;}if(refs.length)floor.referenceSourcesOmitted=true;}
    const objects = source.objects.filter(o => closure.has(o.floorId)).flatMap(o => {
      if (!isPlan(o)) { omittedObjects.push(o.id); return []; }
      const item = D.projectElement(o); Object.keys(o).filter(k => !Object.hasOwn(item, k)).forEach(k => omittedFields.add(k)); return [item];
    });
    const buildings = source.buildings.filter(b => floors.some(f => f.buildingId === b.id)).map(b => ({ ...select(b, ['id', 'name', 'order']), ...(source.buildings.length === 1 && buildingName ? { name: buildingName } : {}) }));
    const model = clone(source.drawingModel), levels = new Set(floors.map(f => f.levelId).filter(Boolean));
    model.levels = model.levels.filter(l => levels.has(l.id));
    model.records = Object.fromEntries(Object.entries(model.records).filter(([id, r]) => closure.has(id) || r.deleted && floors.some(f => f.baseDrawingId === id)));
    model.lineage = model.lineage.filter(item => closure.has(item.drawingId));
    model.spaceOrigins = Object.fromEntries(Object.entries(model.spaceOrigins || {}).filter(([, id]) => closure.has(id) || model.retiredDrawingIds.includes(id)));
    // A received partial workspace cannot claim to be the original complete package.
    const completePackage = kind === 'full' && model.exchangeScope?.completePackage !== false;
    const projected = { buildings, floors, objects, drawingModel: model };
    projected.drawingModel = D.sync(projected); D.validate(projected);
    const pkg = { format: 'PieniPlanPlanPackage', fileType: 'pieniplan-plan-package', schemaVersion: 1, requiredCapabilities: [D.capability], packageId: model.packageId, createdAt: now, app,
      buildings: buildings.map(b => ({ ...b, drawings: floors.filter(f => f.buildingId === b.id).map(f => ({ ...select(f, floorKeys), objects: objects.filter(o => o.floorId === f.id) })) })),
      drawingModel: projected.drawingModel, scope: { kind, completePackage, authoritativeDeletion: false, requestedDrawingIds: requested, includedDrawingIds: floors.map(f => f.id) },
      omissions: { externalSources: (source.references || []).filter(r => closure.has(r.floorId)).map(r => ({ id: r.id, type: r.type })), rawCadArchive: Boolean(source.dxfArchive || source.sourceDxfName), authoringFieldNames: [...omittedFields].sort(), nonPlanElementIds: omittedObjects } };
    if (objects.some(o => root.planNature?.isGeometry(o)) || Object.keys(styles).length) { pkg.requiredCapabilities.push(root.planNature.capability); pkg.planObjectStyles = clone(styles); }
    if(objects.some(o=>o.componentDefinition))pkg.requiredCapabilities.push('plan.components.v2');
    if(objects.some(o=>o.doorModel93))pkg.requiredCapabilities.push('plan.door.mechanism.v1');
    pkg.packageRevision = contentRevision(pkg); return validate(pkg);
  }
  function upgrade(pkg) {
    validate(pkg); if (pkg.drawingModel) return clone(pkg);
    const state = toState(pkg); state.drawingModel = D.create(pkg.packageId);
    for (const o of state.objects) if (o.type === 'space' && !o.spaceUuid) o.spaceUuid = 'space-' + D.hash([pkg.packageId, o.id]).slice(0, 32);
    state.drawingModel = D.sync(state, { initialize: true });
    return make(state, { app: pkg.app, styles: pkg.planObjectStyles, now: pkg.createdAt });
  }
  function originsFor(pkg) {
    const origins = pkg.drawingModel?.exchangeScope?.origins || {};
    return Object.fromEntries(toState(pkg).floors.map(f => {
      const fingerprint = pkg.drawingModel.records[f.id].fingerprint, origin = clone(origins[f.id] || { packageId: pkg.packageId, drawingId: f.id, fingerprint, localFingerprint: fingerprint });
      if (origin.localFingerprint !== fingerprint) origin.fingerprint = fingerprint;
      origin.localFingerprint = fingerprint; return [f.id, origin];
    }));
  }
  function merge(packages, { packageId } = {}) {
    if (!Array.isArray(packages) || !packages.length) fail('empty-merge');
    const inputs = packages.map(upgrade), out = { buildings: [], floors: [], objects: [], drawingModel: D.create(packageId || 'ppkg-merged-' + D.hash(inputs.map(p => p.packageId).sort()).slice(0, 24)) }, origins = {}, styles = {}, buildingOrigins = new Map(), levelOrigins = new Map();
    const occupied = new Set(), allocate = (id, pkg, kind) => {
      let next = id; if (occupied.has(next)) next = kind + '-' + D.hash([pkg.packageId, id]).slice(0, 28);
      let i = 2, base = next; while (occupied.has(next)) next = base + '-' + i++;
      occupied.add(next); return next;
    };
    for (const pkg of inputs) {
      const incoming = toState(pkg), incomingOrigins = originsFor(pkg), floorMap = new Map(), elementMap = new Map(), spaceMap = new Map(), buildingMap = new Map(), levelMap = new Map(), added = [];
      for (const [key, value] of Object.entries(pkg.planObjectStyles || {})) { if (styles[key] && D.canonical(styles[key]) !== D.canonical(value)) fail('style-conflict:' + key); styles[key] = clone(value); }
      for (const f of incoming.floors) {
        const origin = incomingOrigins[f.id], found = Object.entries(origins).find(([, item]) => item.packageId === origin.packageId && item.drawingId === origin.drawingId);
        if (found) {
          const [id, item] = found;
          if (item.fingerprint !== origin.fingerprint || item.localFingerprint !== out.drawingModel.records[id]?.fingerprint) fail('drawing-conflict:' + origin.drawingId);
          floorMap.set(f.id, id);
        } else { floorMap.set(f.id, allocate(f.id, pkg, 'drawing')); added.push(f); }
      }
      // Entire graph IDs are allocated before any references are rewritten.
      for (const b of incoming.buildings) {
        const key = pkg.packageId + '\n' + b.id, found = buildingOrigins.get(key);
        if (found) { if (out.buildings.find(x => x.id === found).name !== b.name) fail('building-conflict:' + b.id); buildingMap.set(b.id, found); }
        else if (added.some(f => f.buildingId === b.id)) { const id = allocate(b.id, pkg, 'building'); buildingMap.set(b.id, id); buildingOrigins.set(key, id); out.buildings.push({ ...clone(b), id, order: out.buildings.length }); }
      }
      for (const l of incoming.drawingModel.levels) {
        const key = pkg.packageId + '\n' + l.id, found = levelOrigins.get(key);
        if (found) { if (out.drawingModel.levels.find(x => x.id === found).name !== l.name) fail('level-conflict:' + l.id); levelMap.set(l.id, found); }
        else if (added.some(f => f.levelId === l.id)) { const id = allocate(l.id, pkg, 'level'); levelMap.set(l.id, id); levelOrigins.set(key, id); out.drawingModel.levels.push({ ...clone(l), id, buildingId: buildingMap.get(l.buildingId) }); }
      }
      const adding = new Set(added.map(f => f.id)), items = incoming.objects.filter(o => adding.has(o.floorId));
      for (const o of items) { elementMap.set(o.id, allocate(o.id, pkg, 'element')); if (o.spaceUuid) spaceMap.set(o.spaceUuid, allocate(o.spaceUuid, pkg, 'space')); }
      for (const o of items) for (const vertex of o.vertices || []) { if (vertex.id && !elementMap.has(vertex.id)) elementMap.set(vertex.id, allocate(vertex.id, pkg, 'vertex')); if (vertex.outgoing?.id && !elementMap.has(vertex.outgoing.id)) elementMap.set(vertex.outgoing.id, allocate(vertex.outgoing.id, pkg, 'edge')); }
      for (const uuid of incoming.drawingModel.retiredSpaceUuids) if (!spaceMap.has(uuid)) spaceMap.set(uuid, allocate(uuid, pkg, 'space'));
      for (const id of [...incoming.drawingModel.retiredDrawingIds, ...incoming.drawingModel.unresolvedReferenceIds]) if (!floorMap.has(id)) floorMap.set(id, allocate(id, pkg, 'drawing'));
      const rewrite = (value, key) => {
        // Definition identities/geometry are not placed element identities.
        if(key==='componentDefinition')return clone(value);
        if (Array.isArray(value)) return value.map(v => rewrite(v, key));
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewrite(v, k)]));
        if (typeof value !== 'string') return value;
        if (['floorId', 'baseDrawingId', 'referenceFloorId', 'drawingId'].includes(key)) return floorMap.get(value) || value;
        if (key === 'levelId') return levelMap.get(value) || value;
        if (['spaceUuid', 'parents', 'children'].includes(key)) return spaceMap.get(value) || value;
        if (['wallId', 'wallIds', 'objectId', 'objectIds', 'sourceObjectId', 'sourceObjectIds', 'anchorObjectId', 'ownerId', 'id'].includes(key)) return elementMap.get(value) || value;
        return value;
      };
      for (const o of items) out.objects.push(rewrite(o));
      for (const f of added) {
        const floor = { ...rewrite(f), id: floorMap.get(f.id), buildingId: buildingMap.get(f.buildingId) };
        out.floors.push(floor); origins[floor.id] = clone(incomingOrigins[f.id]);
      }
      out.drawingModel.retiredSpaceUuids = [...new Set([...out.drawingModel.retiredSpaceUuids, ...incoming.drawingModel.retiredSpaceUuids.map(id => spaceMap.get(id))])];
      out.drawingModel.retiredDrawingIds = [...new Set([...out.drawingModel.retiredDrawingIds, ...incoming.drawingModel.retiredDrawingIds.map(id => floorMap.get(id))])];
      out.drawingModel.unresolvedReferenceIds = [...new Set([...out.drawingModel.unresolvedReferenceIds, ...incoming.drawingModel.unresolvedReferenceIds.map(id => floorMap.get(id)), ...incoming.drawingModel.retiredDrawingIds.map(id => floorMap.get(id))])];
      out.drawingModel.lineage.push(...incoming.drawingModel.lineage.filter(x => adding.has(x.drawingId)).map(x => rewrite(x)));
      for (const [uuid, id] of Object.entries(incoming.drawingModel.spaceOrigins || {})) if (adding.has(id) || incoming.drawingModel.retiredDrawingIds.includes(id)) out.drawingModel.spaceOrigins[spaceMap.get(uuid) || uuid] = floorMap.get(id) || id;
      // Preserve incoming revision counters. Remapped content has a new local fingerprint.
      out.drawingModel = D.sync(out);
      for (const f of added) {
        const id = floorMap.get(f.id), r = out.drawingModel.records[id], original = incoming.drawingModel.records[f.id];
        r.revision = original.revision; r.baseline = { revision: r.revision, fingerprint: r.fingerprint, elements: clone(r.elements) }; r.delta = { fromRevision: r.revision, added: [], modified: [], deleted: [] };
      }
      // Keep an accepted, current base current after a namespace change. Changed stays unreviewed.
      for (const f of added) {
        const floor = out.floors.find(x => x.id === floorMap.get(f.id));
        if (f.baseDrawingId && D.referenceStatus(incoming, f) === 'current') { const r = out.drawingModel.records[floor.baseDrawingId]; floor.baseRevision = r.revision; floor.baseFingerprint = r.fingerprint; }
      }
      out.drawingModel = D.sync(out);
      for (const f of added) { const id = floorMap.get(f.id); origins[id].localFingerprint = out.drawingModel.records[id].fingerprint; }
    }
    out.drawingModel.exchangeScope = { completePackage: false, origins };
    D.validate(out);
    const pkg = make(out, { styles }); pkg.scope.kind = 'merged'; pkg.scope.completePackage = false; pkg.packageRevision = contentRevision(pkg); return validate(pkg);
  }
  root.planPackageExchange = Object.freeze({ validate, make, toState, contentRevision, upgrade, merge, isPlan });
})();
