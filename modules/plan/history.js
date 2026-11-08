/* Read-only history projections. A date and a sealed shape are not proof that
 * an alternative was ever applied. Never turn unknown legacy history into fact. */
(() => {
  'use strict';
  const M = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  function rows(s, { buildingId, levelId } = {}) {
    const levels = new Map((s.drawingModel?.levels || []).filter(l => (!buildingId || l.buildingId === buildingId) && (!levelId || l.id === levelId)).map(l => [l.id, l]));
    return (s.drawingModel?.versions || []).filter(v => levels.has(v.levelId)).map(v => ({ version: v, level: levels.get(v.levelId) })).sort((a, b) => {
      const av = a.version, bv = b.version;
      return (bv.appliedDate || bv.modifiedDate || '').localeCompare(av.appliedDate || av.modifiedDate || '') || bv.createdAt.localeCompare(av.createdAt) || av.drawingId.localeCompare(bv.drawingId);
    });
  }
  function atDate(s, buildingId, date) {
    M.planVersions.date(date, true);
    return (s.drawingModel?.levels || []).filter(l => l.buildingId === buildingId).map(level => {
      const versions = rows(s, { levelId: level.id }).map(r => r.version), journal = s.drawingModel.applicationHistory102 || [];
      const documented = new Set(journal.map(e => e.drawingId)), actual = versions.filter(v => v.current && !v.planned);
      const events = journal.map((e, index) => ({ ...e, index, version: versions.find(v => v.drawingId === e.drawingId) })).filter(e => e.version && !e.version.planned);
      for (const v of actual) if (!documented.has(v.drawingId)) events.push({ drawingId: v.drawingId, appliedDate: v.appliedDate, index: -1, version: v });
      const unknown = versions.filter(v => !v.planned && !v.current && !documented.has(v.drawingId) && (!v.appliedDate || v.appliedDate <= date));
      const current = events.filter(e => e.appliedDate && e.appliedDate <= date).sort((a, b) => b.appliedDate.localeCompare(a.appliedDate) || b.index - a.index)[0]?.version || null;
      // The legacy model seals source/unused alternatives too. Such records
      // cannot be promoted into an applied version merely by sorting dates.
      const ambiguous = unknown.some(v => !current || !v.appliedDate || v.appliedDate >= current.appliedDate);
      const unverified = ambiguous || events.some(e => !e.appliedDate);
      return { level, version: unverified ? null : current, state: unverified ? 'unverified' : current ? 'known' : 'no-record', candidates: unknown.map(v => v.drawingId) };
    });
  }
  function selected(s, levelId) {
    const versions = rows(s, { levelId }).map(r => r.version);
    return versions.find(v => v.drawingId === s.activeFloorId) || versions.find(v => v.current && !v.planned) || versions[0] || null;
  }
  M.planHistory = Object.freeze({ rows, atDate, selected });
})();
