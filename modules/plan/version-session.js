/* Atomic dated-drawing publication and mutation authorization. View state and
 * personal settings are deliberately outside this ownership boundary. */
(() => {
  'use strict';
  const M = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const keys = ['objects', 'floors', 'buildings', 'drawingModel', 'activeFloorId', 'activeBuildingId'];
  const copy = x => JSON.parse(JSON.stringify(x));
  class EditDenied extends Error { constructor(code) { super('plan-versions:' + code); this.name = 'PlanVersionEditDenied'; } }
  function create(p) {
    const V = M.planVersions, D = M.planDrawings;
    let accepted = null, pending = null, publishing = false;
    const capture = s => ({ projectId: s.projectId, objects: s.objects.map(o => o.floorId ? copy(o) : o), floors: copy(s.floors), buildings: copy(s.buildings), drawingModel: copy(s.drawingModel), activeFloorId: s.activeFloorId, activeBuildingId: s.activeBuildingId });
    const write = value => { const s = p.state(); for (const k of keys) s[k] = value[k]; };
    function adopt() {
      const s = p.state(); if (V.enabled(s)) { V.validate(s); accepted = capture(s); } else accepted = null;
      pending = null;
    }
    function token() {
      const s = p.state(); return { projectId: s.projectId, drawingId: s.activeFloorId, model: D.hash(s.drawingModel), epoch: p.epoch() };
    }
    function current(t) {
      const s = p.state(); return Boolean(t && t.projectId === s.projectId && t.drawingId === s.activeFloorId && t.epoch === p.epoch() && t.model === D.hash(s.drawingModel));
    }
    function reason(ids = [], { creation = false } = {}) {
      const s = p.state(); if (!V.enabled(s)) return null;
      if (V.readonly(s)) return 'readonly';
      const v = V.row(s), active = v?.layers.find(l => l.id === v.activeLayerId);
      if (creation && v?.activeLayerExplicit && (!active || !active.visible || active.locked)) return 'layer-not-editable';
      const selected = new Set(ids);
      for (const id of selected) { const o = s.objects.find(o => o.id === id); if (!o || o.floorId !== s.activeFloorId || !V.editable(s, o)) return 'locked-or-foreign-object'; }
      // A host edit can move its dependent openings, spaces or junctions. Refuse
      // before mutation if any affected owner is on a protected layer.
      let more = true;
      while (more) { more = false; for (const o of V.objects(s, s.activeFloorId)) if (!selected.has(o.id) && V.references(o).some(id => selected.has(id))) {
        if (!V.editable(s, o)) return 'locked-dependent'; selected.add(o.id); more = true;
      } }
      return null;
    }
    function beforeEdit(ids = [], options = {}) {
      const code = reason(ids, options); if (code) throw new EditDenied(code);
      if (V.enabled(p.state()) && !pending) pending = p.captureHistory?.(); return true;
    }
    function protectedChanges(s) {
      if (!accepted || accepted.projectId !== s.projectId) return;
      const next = new Map(s.objects.map(o => [o.id, o]));
      for (const o of accepted.objects) if (o.floorId && !V.editable(accepted, o)) {
        const oldVersion = V.row(accepted, o.floorId), nextVersion = V.row(s, o.floorId);
        if (D.canonical(next.get(o.id)) !== D.canonical(o) || nextVersion?.assignments[o.id] !== oldVersion.assignments[o.id] || D.canonical(nextVersion?.origins[o.id]) !== D.canonical(oldVersion.origins[o.id])) throw new EditDenied('protected-object-change');
      }
      for (const v of accepted.drawingModel.versions) if (v.sealedFingerprint) {
        const version = V.row(s, v.drawingId);
        if (!version) throw new EditDenied('historical-drawing-removal');
        if (version.sealedFingerprint !== v.sealedFingerprint || V.content(s, version) !== v.sealedFingerprint) throw new EditDenied('historical-model-change');
      }
    }
    function synchronize() {
      const s = p.state(); if (!V.enabled(s)) { accepted = pending = null; return null; }
      if (!accepted || accepted.projectId !== s.projectId) { s.drawingModel = V.sync(s); adopt(); return s.drawingModel; }
      try {
        protectedChanges(s); const model = V.sync(s); V.validate({ ...s, drawingModel: model }); s.drawingModel = model;
        accepted = capture(s); pending = null; return model;
      } catch (error) {
        const view = { drawing: s.activeFloorId, building: s.activeBuildingId };
        write(capture(accepted));
        if (s.floors.some(f => f.id === view.drawing)) { s.activeFloorId = view.drawing; s.activeBuildingId = s.floors.find(f => f.id === view.drawing).buildingId; }
        if (pending) p.restoreHistory?.(pending); pending = null;
        p.rejected?.(error); throw error;
      }
    }
    function publish(make, { expected = token(), label = '' } = {}) {
      if (publishing || !current(expected)) throw Error('plan-versions:stale-context');
      const s = p.state(), before = capture(s), history = p.captureHistory?.(), undo = p.snapshot();
      const result = make({ ...s, ...capture(s) }), next = result?.state || result;
      V.validate(next); p.validate?.(next);
      if (!current(expected)) throw Error('plan-versions:stale-context');
      publishing = true;
      try {
        write(next); p.rebuild(); p.append(undo, label); p.changed(); adopt();
      } catch (error) {
        write(before); if (history) p.restoreHistory?.(history);
        try { p.rebuild(); } catch (recovery) { error.recoveryError = recovery; }
        adopt(); throw error;
      } finally { publishing = false; }
      return result;
    }
    return Object.freeze({ adopt, token, current, reason, beforeEdit, synchronize, publish, get publishing() { return publishing; } });
  }
  M.planVersionSession = Object.freeze({ create, EditDenied });
})();
