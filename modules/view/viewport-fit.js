/* Transient viewport intent. No document, object, preference or command ownership. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const kinds = ['main', 'extents', 'window', 'selection', 'work'];
  const valid = b => b && ['minx', 'miny', 'maxx', 'maxy'].every(k => Number.isFinite(b[k])) && b.minx <= b.maxx && b.miny <= b.maxy;
  function union(bounds) {
    let result = null;
    for (const b of bounds) if (valid(b)) result = result ? { minx: Math.min(result.minx,b.minx), miny: Math.min(result.miny,b.miny), maxx: Math.max(result.maxx,b.maxx), maxy: Math.max(result.maxy,b.maxy) } : {minx:b.minx,miny:b.miny,maxx:b.maxx,maxy:b.maxy};
    return result;
  }
  function create({ resolve, apply, getCamera, setCamera, changed = () => {} }) {
    let intent = null, size = null, choice = 'main', previous = [];
    const clone = value => JSON.parse(JSON.stringify(value));
    function remember() {
      const c = clone(getCamera());
      if (JSON.stringify(previous.at(-1)) !== JSON.stringify(c)) previous.push(c);
      previous = previous.slice(-10);
    }
    function manual(reason = 'manual', { record = true } = {}) {
      if (record) remember();
      intent = null;
      changed({ mode: 'manual', choice, reason });
    }
    function fit(mode = choice, target = {}) {
      if (!kinds.includes(mode)) return false;
      const next = { mode, ...clone(target) }, range = resolve(next);
      if (!valid(range)) { manual('invalid-target', { record: false }); return false; }
      remember(); choice = mode; intent = next;
      apply(range); changed({ mode, choice, target: clone(next) });
      return true;
    }
    function resize(next) {
      if (![next.width, next.height, next.dpr ?? 1].every(n => Number.isFinite(n) && n > 0)) return false;
      const different = size && (Math.abs(size.width - next.width) > .25 || Math.abs(size.height - next.height) > .25);
      size = { ...next };
      if (!different || !intent) return false;
      const range = resolve(intent);
      if (!valid(range)) { manual('invalid-target', { record: false }); return false; }
      apply(range); return true;
    }
    function validateTarget() {
      if (intent && !valid(resolve(intent))) manual('invalid-target', { record: false });
    }
    function back() {
      let old = previous.pop();
      while (old && JSON.stringify(old) === JSON.stringify(getCamera())) old = previous.pop();
      if (!old) return false;
      manual('previous', { record: false }); setCamera(old); return true;
    }
    function reset(reason = 'document-change') { intent = null; choice = 'main'; previous = []; changed({ mode: 'manual', choice, reason }); }
    return { fit, resize, manual, validateTarget, back, reset,
      status: () => ({ mode: intent?.mode || 'manual', choice, target: intent && clone(intent), size: size && { ...size }, previousCount: previous.length }) };
  }
  root.viewportFit = Object.freeze({ create, union, valid, kinds });
})();
