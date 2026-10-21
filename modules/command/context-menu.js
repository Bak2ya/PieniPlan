(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const VISIBILITY = new Set(['auto','show','hide']);
  const PRIORITY = new Set(['default','high','normal','low']);

  function sanitizeOverride(value) {
    if (!value || typeof value !== 'object') return null;
    const visibility = VISIBILITY.has(value.visibility) ? value.visibility : 'auto';
    const priority = PRIORITY.has(value.priority) ? value.priority : 'default';
    const order=Number.isInteger(value.order)&&value.order>=0&&value.order<=5000?value.order:null;
    if (visibility === 'auto' && priority === 'default' && order===null) return null;
    return Object.freeze({ visibility, priority, ...(order===null?{}:{order}) });
  }

  function sanitizeOverrides(raw) {
    const out = Object.create(null);
    if (!raw || typeof raw !== 'object') return out;
    for (const [key, value] of Object.entries(raw)) {
      const clean = sanitizeOverride(value);
      if (clean) out[String(key)] = clean;
    }
    return out;
  }

  function preference(command, overrides) {
    const override = overrides?.[command.key] || null;
    return {
      visibility: override?.visibility || 'auto',
      priority: override?.priority || 'default', order:override?.order??null
    };
  }

  function isVisible(command, context, overrides) {
    if (!command || command.available === false) return false;
    if (typeof command.available === 'function' && !command.available(context)) return false;
    const pref = preference(command, overrides);
    if (pref.visibility === 'hide') return false;
    if (pref.visibility === 'show') return true;
    return Boolean(typeof command.recommended === 'function' ? command.recommended(context) : command.recommended);
  }

  function score(command, overrides) {
    const base = Number.isFinite(command.basePriority) ? command.basePriority : 50;
    const pref = preference(command, overrides);
    if (pref.priority === 'high') return 1000 + base;
    if (pref.priority === 'normal') return 50;
    if (pref.priority === 'low') return -1000 + base;
    return base;
  }

  function sort(commands, overrides) {
    return [...commands].sort((a,b) => ((preference(a,overrides).order??5001)-(preference(b,overrides).order??5001)) || score(b, overrides) - score(a, overrides) || String(a.label || a.key).localeCompare(String(b.label || b.key)));
  }

  root.contextMenu = Object.freeze({ sanitizeOverride, sanitizeOverrides, preference, isVisible, score, sort });
})();
