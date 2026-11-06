/* Plan PPKG2 authoring exchange. No FacilityManager operational data or claim of
 * an already compatible external consumer. Legacy PPKG1 has a separate codec. */
(() => {
  'use strict';
  const M = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {}, clone = v => JSON.parse(JSON.stringify(v));
  const fail = code => { throw Error('plan-version-package:' + code); };
  const schema = 2, format = 'PieniPlanPlanPackage';
  const capabilities = ['plan.versions.v1', 'plan.nature-style.v1', 'plan.components.v2', 'plan.door.mechanism.v1', 'cad.annotation.v2'];
  function revision(pkg) {
    return M.planDrawings.hash({ packageId: pkg.packageId, buildings: pkg.buildings, drawingModel: pkg.drawingModel, planObjectStyles: pkg.planObjectStyles || {} });
  }
  function toState(pkg) {
    const buildings = [], floors = [], objects = [];
    for (const b of pkg.buildings) {
      buildings.push({ id: b.id, name: b.name, order: b.order });
      for (const f of b.drawings) { const { objects: owned, ...floor } = f; floors.push({ ...clone(floor), buildingId: b.id }); objects.push(...owned.map(o => ({ ...clone(o), floorId: f.id }))); }
    }
    return { projectId: pkg.packageId, buildings, floors, objects, drawingModel: clone(pkg.drawingModel), activeFloorId: pkg.activeDrawingId || floors.find(f => pkg.drawingModel.versions.find(v => v.drawingId === f.id)?.current)?.id || floors[0]?.id || null };
  }
  function validate(pkg) {
    if (pkg?.format !== format || pkg.schemaVersion !== schema || typeof pkg.packageId !== 'string' || !pkg.packageId || !Array.isArray(pkg.buildings) || !pkg.buildings.length) fail('format');
    if (Object.keys(pkg).some(k => !['format', 'fileType', 'schemaVersion', 'requiredCapabilities', 'packageId', 'packageRevision', 'createdAt', 'app', 'buildings', 'drawingModel', 'scope', 'omissions', 'planObjectStyles', 'activeDrawingId'].includes(k))) fail('field');
    if (!Array.isArray(pkg.requiredCapabilities) || !pkg.requiredCapabilities.includes('plan.versions.v1') || pkg.requiredCapabilities.some(c => !capabilities.includes(c))) fail('capability');
    if (pkg.drawingModel?.version !== 2 || pkg.drawingModel.packageId !== pkg.packageId || !pkg.scope || pkg.scope.kind !== 'full' || pkg.scope.completePackage !== true || pkg.scope.authoritativeDeletion !== false) fail('scope');
    for (const b of pkg.buildings) {
      if (!Array.isArray(b.drawings) || Object.keys(b).some(k => !['id', 'name', 'order', 'drawings'].includes(k))) fail('building');
      for (const f of b.drawings) {
        if (!Array.isArray(f.objects)) fail('objects');
        for (const o of f.objects) { if (!M.planPackageExchange.isPlan(o)) fail('non-plan-owner'); if (M.planDrawings.canonical(o) !== M.planDrawings.canonical(M.planDrawings.projectElement(o))) fail('non-authoring-object-field'); }
      }
    }
    if (typeof pkg.createdAt !== 'string' || !Number.isFinite(Date.parse(pkg.createdAt))) fail('timestamp');
    const state = toState(pkg); M.planVersions.validate(state); if (!state.floors.some(f => f.id === state.activeFloorId)) fail('active-drawing');
    if (M.projectStaging) M.projectStaging.validate({ format: 'PieniPlan', schemaVersion: 8, requiredCapabilities: [...new Set([...pkg.requiredCapabilities, M.cadPolyline?.capability, M.cadPolylineWidth?.capability, M.cadPolylineFit?.capability].filter(Boolean))], drawing: { ...state, toolSettings: { planObjectStyles: pkg.planObjectStyles || {} } } });
    if (pkg.packageRevision !== revision(pkg)) fail('revision');
    return pkg;
  }
  function make(s, { kind = 'full', app = {}, styles = {}, now = new Date().toISOString() } = {}) {
    M.planVersions.validate(s); if (kind !== 'full') fail('full-history-scope-required');
    const versions = s.drawingModel.versions;
    const buildings = s.buildings.map(b => ({ id: b.id, name: b.name, order: b.order || 0, drawings: s.floors.filter(f => f.buildingId === b.id).map(f => ({
      id: f.id, name: f.name, order: f.order || 0, ...(f.viewAlignment ? { viewAlignment: clone(f.viewAlignment) } : {}),
      objects: M.planVersions.objects(s, f.id).map(o => M.planDrawings.projectElement(o))
    })) }));
    const drawingModel = clone(s.drawingModel);
    // Original authoring reference/RAW archives remain in PPRJ. Public Plan
    // exchange contains the actual semantic geometry and version relationships.
    delete drawingModel.legacy;
    for (const v of drawingModel.versions) {
      const owned = buildings.flatMap(b => b.drawings).find(f => f.id === v.drawingId).objects;
      const state = { ...s, objects: [...s.objects.filter(o => o.floorId !== v.drawingId), ...owned] };
      // Opaque native data cannot silently be removed from a sealed content hash.
      if (M.planVersions.content(state, v) !== s.drawingModel.records[v.drawingId].fingerprint) fail('opaque-plan-owner-requires-project');
    }
    const requiredCapabilities = ['plan.versions.v1', ...(s.objects.some(o => o.planNature || o.planGeometry) ? ['plan.nature-style.v1'] : []),
      ...(s.objects.some(o => o.componentDefinition) ? ['plan.components.v2'] : []), ...(s.objects.some(o => o.doorModel93) ? ['plan.door.mechanism.v1'] : []), 'cad.annotation.v2'];
    const pkg = { format, fileType: 'pieniplan-plan-package', schemaVersion: schema, requiredCapabilities, packageId: drawingModel.packageId,
      createdAt: now, app: clone(app), buildings, drawingModel, scope: { kind: 'full', completePackage: true, authoritativeDeletion: false }, activeDrawingId: s.activeFloorId || s.floors[0]?.id || null,
      omissions: ['Original CAD RAW/reference archives are retained in PPRJ, not included in Plan exchange.', 'FacilityManager operational data is outside PieniPlan.'],
      planObjectStyles: M.planDrawings.cleanTechnical(styles) };
    if (versions.length !== buildings.reduce((n, b) => n + b.drawings.length, 0)) fail('drawing-coverage');
    pkg.packageRevision = revision(pkg); return validate(pkg);
  }
  M.planVersionPackage = Object.freeze({ schema, format, revision, validate, make, toState });
})();
