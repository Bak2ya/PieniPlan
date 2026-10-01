(() => {
  'use strict';

  const root = window.PieniPlanModules = window.PieniPlanModules || {};

  const catalog = Object.freeze([
    ...[['O','OFFSET'],['F','FILLET'],['BR','BREAK'],['J','JOIN']].map(([id,name])=>({id,name,aliases:[id,name],cadOnly:true})),
    { id: 'MA', name: 'MATCHPROP', aliases: ['MA','MATCHPROP'], cadOnly:true },
    { id: 'L', name: 'LINE', aliases: ['L', 'LINE'] },
    { id: 'PL', name: 'PLINE', aliases: ['PL', 'PLINE', 'POLYLINE'], cadOnly: true },
    { id: 'TR', name: 'TRIM', aliases: ['TR', 'TRIM'] },
    { id: 'EX', name: 'EXTEND', aliases: ['EX', 'EXTEND'] },
    { id: 'E', name: 'ERASE', aliases: ['E', 'ERASE'] },
    { id: 'DI', name: 'DIST', aliases: ['DI', 'DIST'] },
    { id: 'M', name: 'MOVE', aliases: ['M', 'MOVE'], planOnly: true },
    { id: 'CO', name: 'COPY', aliases: ['CO', 'COPY'], planOnly: true },
    { id: 'RO', name: 'ROTATE', aliases: ['RO', 'ROTATE'], cadOnly: true },
    { id: 'CR', name: 'CURVERECONSTRUCT', aliases: ['CR', 'CURVERECONSTRUCT', 'RECONSTRUCT'] },
    { id: 'Z', name: 'ZOOM', aliases: ['Z', 'ZOOM'] },
    { id: 'U', name: 'UNDO', aliases: ['U', 'UNDO'] },
    { id: 'REDO', name: 'REDO', aliases: ['REDO'] },
    { id: 'S', name: 'STRETCH', aliases: ['S', 'STRETCH'] },
    { id: 'WALL', name: 'WALL', aliases: ['WALL'] },
    { id: 'DOOR', name: 'DOOR', aliases: ['DOOR'] },
    { id: 'WINDOW', name: 'WINDOW', aliases: ['WINDOW'] }
  ]);

  function normalize(raw) {
    return String(raw || '').trim().toUpperCase();
  }

  function matches(query, { plan = false, limit = 6 } = {}) {
    const q = normalize(query);
    if (!q) return [];
    return catalog
      .filter(command => !(command.planOnly && !plan) && !(command.cadOnly && plan))
      .filter(command => command.aliases.some(alias => alias.startsWith(q)))
      .slice(0, limit);
  }

  root.commandCore = Object.freeze({ catalog, normalize, matches });
})();
