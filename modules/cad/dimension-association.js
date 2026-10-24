/* PPRJ geometry relations. Native external DIMASSOC records are a separate contract. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {}, capability = 'cad.dimension.association.v1';
  const clone = o => JSON.parse(JSON.stringify(o)), distance = (a, b) => a && b ? Math.hypot(a.x - b.x, a.y - b.y) : Infinity;
  function validate(o) {
    const r = o.association; if (!r) return;
    const slots = ['p1', 'p2', 'vertex', 'ray1', 'ray2', 'radial'];
    if (o.type !== 'cadDimension' || r.version !== 1 || !['current', 'detached'].includes(r.status) || Object.keys(r).some(k => !['version', 'status', 'anchors'].includes(k)) || !r.anchors || typeof r.anchors !== 'object' || Array.isArray(r.anchors) || !Object.keys(r.anchors).length) throw Error('invalid-dimension-association');
    for (const [slot, a] of Object.entries(r.anchors)) {
      if (!slots.includes(slot) || !a || typeof a.sourceId !== 'string' || !a.sourceId || a.sourceId === o.id || !['vertex', 'point', 'radial'].includes(a.kind) || Object.keys(a).some(k => !['sourceId', 'kind', 'vertexId', 'key'].includes(k)) || a.kind === 'vertex' && (typeof a.vertexId !== 'string' || !a.vertexId) || a.kind === 'point' && !['a', 'b', 'start', 'end', 'center', 'midpoint'].includes(a.key) || (slot === 'radial') !== (a.kind === 'radial') || slot === 'radial' && !['radius', 'diameter'].includes(o.kind) || ['p1', 'p2'].includes(slot) && !['linear', 'aligned'].includes(o.kind || 'aligned') || ['vertex', 'ray1', 'ray2'].includes(slot) && o.kind !== 'angular') throw Error('invalid-dimension-anchor');
    }
  }
  function resolve(anchor, byId) {
    const o = byId(anchor.sourceId); if (!o || o.readonly || o.floorId || o.planRole || !['cadLine', 'cadArc', 'cadCircle', 'cadEllipse', 'cadPolyline'].includes(o.type)) return null;
    if (anchor.kind === 'radial') return ['cadCircle', 'cadArc'].includes(o.type) ? { center: { ...o.center }, radius: o.radius } : null;
    if (anchor.kind === 'vertex') { if (!root.cadPolyline.is(o)) return null; const v = o.vertices.find(v => v.id === anchor.vertexId); if (!v || o.curveFit && (o.closed || v !== o.vertices[0] && v !== o.vertices.at(-1))) return null; return { point: { x: v.x, y: v.y } }; }
    const key = anchor.key;
    if (key === 'center') return o.center ? { point: { ...o.center } } : null;
    if (o.type === 'cadLine') return { point: key === 'midpoint' ? { x: (o.a.x + o.b.x) / 2, y: (o.a.y + o.b.y) / 2 } : key === 'a' || key === 'b' ? { ...o[key] } : null };
    if (o.type === 'cadArc' && ['start', 'end', 'midpoint'].includes(key)) return { point: root.geometryQuery.pointAt(o, o.startAngle + o.sweep * (key === 'start' ? 0 : key === 'end' ? 1 : .5)) };
    if (root.cadEllipse.is(o) && !root.cadEllipse.full(o) && ['start', 'end'].includes(key)) return { point: root.cadEllipse.at(o, key === 'start' ? 0 : 1) };
    return null;
  }
  function capture(point, snap, byId) {
    if (!snap?.objectId || !['endpoint', 'midpoint', 'center'].includes(snap.kind)) return null;
    const o = byId(snap.objectId); if (!o || o.floorId || o.planRole) return null;
    const anchors = [];
    if (root.cadPolyline.is(o)) for (const v of o.vertices) anchors.push({ sourceId: o.id, kind: 'vertex', vertexId: v.id });
    else for (const key of ['a', 'b', 'start', 'end', 'center', 'midpoint']) anchors.push({ sourceId: o.id, kind: 'point', key });
    return anchors.find(a => distance(resolve(a, byId)?.point, point) < 1e-6) || null;
  }
  function detached(o) { return o.association ? { ...o, association: { ...clone(o.association), status: 'detached' } } : o; }
  function regenerate(o, byId) {
    if (o.association?.status !== 'current') return o;
    let q = clone(o);
    for (const [slot, anchor] of Object.entries(o.association.anchors)) {
      const value = resolve(anchor, byId); if (!value || slot !== 'radial' && !value.point) return detached(o);
      if (slot === 'radial') Object.assign(q, value); else q[slot] = value.point;
    }
    const g = root.cadAnnotation2.geometry(q); if (!g?.segments?.length) return detached(o);
    q.segments = g.segments; if (JSON.stringify(q) === JSON.stringify(o)) return o;
    delete q.dxfPresentation; return q;
  }
  function augment(objects, changes) {
    const touched = new Map(changes.map(c => [(c.before || c.after).id, c])), next = new Map(objects.map(o => [o.id, o]));
    for (const c of changes) { if (c.before) next.delete(c.before.id); if (c.after) next.set(c.after.id, c.after); }
    const result = changes.slice();
    for (const o of next.values()) {
      if (o.type !== 'cadDimension' || o.association?.status !== 'current') continue;
      const explicit = touched.get(o.id), sourceTouched = Object.values(o.association.anchors).some(a => touched.has(a.sourceId));
      let after = o;
      if (explicit && !sourceTouched) {
        const proposed = regenerate(o, id => next.get(id)), fields = Object.keys(o.association.anchors).flatMap(slot => slot === 'radial' ? ['center', 'radius'] : [slot]);
        if (fields.some(key => JSON.stringify(o[key]) !== JSON.stringify(proposed[key]))) after = detached(o);
      } else if (sourceTouched) after = regenerate(o, id => next.get(id));
      if (after === o) continue;
      if (explicit) result[result.indexOf(explicit)] = { ...explicit, after };
      else result.push({ before: o, after, index: objects.indexOf(o) });
    }
    return result;
  }
  root.cadDimensionAssociation = Object.freeze({ capability, validate, capture, resolve, regenerate, augment, detached });
})();
