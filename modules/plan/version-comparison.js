/* Read-only comparison of persistent object roots and normalized drawing data.
 * Representation equality is not a topology/physical-clash determination. */
(() => {
  'use strict';
  const M = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const fail = code => { throw Error('plan-comparison:' + code); };
  const geometryFields = {
    wall: 'a b geometry center radius startAngle sweep thickness', line: 'a b geometry center radius startAngle sweep',
    space: 'polygon', door: 'wallId t width doorType hinge swing swingSide swingDirection slideDirection doubleLeafSplit doorModel93',
    window: 'wallId t width', stair: 'polygon stairType treadCount upDirection',
    component: 'point width height rotation scaleX scaleY mirrorX mirrorY assetId assetVersion componentDefinition',
    cadLine: 'a b', cadCircle: 'center radius', cadArc: 'center radius startAngle sweep',
    cadPolyline: 'vertices closed curveFit', cadText: 'point height width rotation text mtext alignment verticalAlignment lineSpacing textStyle textOverrides'
  };
  const referenceFields = new Set(['wallId', 'wallIds', 'objectId', 'objectIds', 'ownerId', 'sourceObjectId', 'sourceObjectIds', 'recognitionSourceIds', 'vertexId', 'edgeId', 'fromVertexId', 'toVertexId']);
  function normalize(value, ids, key = '') {
    if (key === 'dxf' || key === 'rawGroups' || key === 'componentDefinition') return value;
    if (typeof value === 'string') return referenceFields.has(key) && ids.has(value) ? ids.get(value) : value;
    if (Array.isArray(value)) return value.map(v => normalize(v, ids, key));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([k]) => !['id','floorId'].includes(k)).map(([k,v]) => [k,normalize(v,ids,k)]));
    return value;
  }
  function index(s, drawingId) {
    const V = M.planVersions, v = V.row(s, drawingId), own = V.objects(s, drawingId), roots = new Map(own.map(o => [o.id,v.origins[o.id].rootObjectId]));
    for (const o of own) for (const [n,v] of (o.vertices || []).entries()) { roots.set(v.id,roots.get(o.id) + ':vertex:' + n); if (v.outgoing) roots.set(v.outgoing.id,roots.get(o.id) + ':edge:' + n); }
    const geometry = (o, seen = new Set()) => {
      const fields = geometryFields[o.type];
      if (!fields || o.affine || o.type === 'cadText' && (o.dxf || /[\\{}]/.test(o.text || '')) || seen.has(o.id)) return null;
      const data = normalize(Object.fromEntries(['type', ...fields.split(' ')].filter(k => Object.hasOwn(o,k)).map(k => [k,o[k]])),roots);
      if(o.type==='wall')data.openings=own.filter(x=>['door','window'].includes(x.type)&&x.wallId===o.id).map(x=>normalize(Object.fromEntries(['type',...geometryFields[x.type].split(' ')].filter(k=>Object.hasOwn(x,k)).map(k=>[k,x[k]])),roots));
      // An opening's accepted host geometry participates even if the host layer
      // is hidden or filtered out of the comparison display.
      if (o.wallId) { const wall = own.find(w => w.id === o.wallId); if (!wall) return null; const next = new Set(seen); next.add(o.id); data.host = geometry(wall,next); if (!data.host) return null; }
      return data;
    };
    return new Map(own.map(o => [roots.get(o.id), { object: o, rootObjectId: roots.get(o.id), layerId: v.assignments[o.id],
      technical: M.planDrawings.canonical(normalize(M.planDrawings.cleanTechnical(o),roots)), geometry: geometry(o) }]));
  }
  function compare(s, beforeId, afterId, { layerIds = null } = {}) {
    const V = M.planVersions; V.validate(s); const a = V.row(s,beforeId), b = V.row(s,afterId);
    if (!a || !b || a.levelId !== b.levelId || a.drawingId === b.drawingId) fail('same-level-distinct-versions-required');
    const layers = new Map([...a.layers,...b.layers].map(l => [l.id,l]));
    if (layerIds !== null && (!Array.isArray(layerIds) || layerIds.some(id => !layers.has(id)))) fail('layer');
    const chosen = layerIds === null ? null : new Set(layerIds), before = index(s,beforeId), after = index(s,afterId), items = [];
    const frame = id => { const f = s.floors.find(f => f.id === id), t = M.floorAlignment?.normalize(f?.viewAlignment) || f?.viewAlignment || {x:0,y:0,rotation:0}; return {x:t.x,y:t.y,rotation:t.rotation}; };
    const sameFrame = M.planDrawings.canonical(frame(beforeId)) === M.planDrawings.canonical(frame(afterId));
    for (const root of new Set([...before.keys(),...after.keys()])) {
      const left = before.get(root), right = after.get(root); if (chosen && !chosen.has(left?.layerId) && !chosen.has(right?.layerId)) continue;
      const geometry = !left || !right ? 'not-paired' : !left.geometry || !right.geometry || !sameFrame ? 'unverified' : M.planDrawings.canonical(left.geometry) === M.planDrawings.canonical(right.geometry) ? 'same-representation' : 'different-representation';
      const status = !left ? 'added' : !right ? 'removed' : geometry === 'unverified' ? 'unverified' : geometry === 'same-representation' && left.technical === right.technical && left.layerId === right.layerId ? 'same' : 'modified';
      items.push({ rootObjectId: root, beforeId: left?.object.id || null, afterId: right?.object.id || null, beforeLayerId: left?.layerId || null, afterLayerId: right?.layerId || null, status, geometry });
    }
    const background = M.planBackgrounds, left = background?.binding(s,beforeId), right = background?.binding(s,afterId);
    // Different reference instance IDs alone do not mean the files or their
    // placement changed. Native file/render parity remains outside this test.
    const source = id => { const binding = background.binding(s,id); return M.planDrawings.hash({ documentId: binding.documentId, region: binding.region, references: background.references(s,id).map(r => { const {id,floorId,...data} = background.serialize(r); return data; }) }); };
    return { beforeId, afterId, items, counts: Object.fromEntries(['added','removed','modified','same','unverified'].map(k => [k,items.filter(i => i.status === k).length])),
      layers: [...layers.values()].map(({id,name,group}) => ({id,name,group})), sameFrame,
      background: !left || !right ? 'unverified' : source(beforeId) === source(afterId) ? 'same-source-data' : 'different-source-data',
      method: 'root-identity-and-normalized-data', geometryMethod: 'bounded-representation-with-hosts; not topological equality or collision analysis' };
  }
  M.planVersionComparison = Object.freeze({compare});
})();
