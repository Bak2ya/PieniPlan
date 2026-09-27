(() => {
  'use strict';

  const root = window.PieniPlanModules = window.PieniPlanModules || {};
  const rad = degrees => degrees * Math.PI / 180;
  const normalizeAngle = angle => ((angle % 360) + 360) % 360;

  function rotatePoint(point, base, deltaDeg) {
    const angle = rad(deltaDeg), c = Math.cos(angle), s = Math.sin(angle);
    const dx = point.x - base.x, dy = point.y - base.y;
    return { x: base.x + dx * c - dy * s, y: base.y + dx * s + dy * c };
  }

  function previewDelta(rotation) {
    if (!rotation || rotation.phase !== 'target' || !rotation.base || !Number.isFinite(rotation.referenceAngle) || !Number.isFinite(rotation.targetAngle)) return 0;
    let delta = rotation.targetAngle - rotation.referenceAngle;
    while (delta > 180) delta -= 360;
    while (delta <= -180) delta += 360;
    return delta;
  }

  function rotateCadObject(object, base, deltaDeg) {
    if ((object.type === 'cadLine' || object.type === 'line') && object.a && object.b) {
      object.a = rotatePoint(object.a, base, deltaDeg);
      object.b = rotatePoint(object.b, base, deltaDeg);
    } else if ((object.type === 'cadCircle' || object.type === 'cadArc') && object.center) {
      object.center = rotatePoint(object.center, base, deltaDeg);
      if (object.type === 'cadArc') object.startAngle = normalizeAngle((Number(object.startAngle) || 0) + deltaDeg);
    } else if (object.type === 'cadText' && object.point) {
      object.point = rotatePoint(object.point, base, deltaDeg);
      object.rotation = normalizeAngle((Number(object.rotation) || 0) + deltaDeg);
    }
    return object;
  }

  function rotatedRectBounds(region, base, deltaDeg) {
    const corners = [
      { x: region.minx, y: region.miny },
      { x: region.maxx, y: region.miny },
      { x: region.maxx, y: region.maxy },
      { x: region.minx, y: region.maxy }
    ].map(point => rotatePoint(point, base, deltaDeg));
    return corners.reduce((bounds, point) => ({
      minx: Math.min(bounds.minx, point.x),
      miny: Math.min(bounds.miny, point.y),
      maxx: Math.max(bounds.maxx, point.x),
      maxy: Math.max(bounds.maxy, point.y)
    }), { minx: Infinity, miny: Infinity, maxx: -Infinity, maxy: -Infinity });
  }

  root.cadRegionTransform = Object.freeze({ rotatePoint, previewDelta, rotateCadObject, rotatedRectBounds });
})();
