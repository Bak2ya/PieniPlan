(() => {
  'use strict';

  const root = window.PieniPlanModules = window.PieniPlanModules || {};

  const catalog = Object.freeze([
    ...[['O','OFFSET'],['F','FILLET'],['BR','BREAK'],['J','JOIN']].map(([id,name])=>({id,name,aliases:[id,name],cadOnly:true})),
    { id: 'MA', name: 'MATCHPROP', aliases: ['MA','MATCHPROP'], cadOnly:true },
    { id: 'ST', name: 'STAIR', aliases: ['ST','STAIR'], planOnly:true },
    { id: 'L', name: 'LINE', aliases: ['L', 'LINE'] },
    { id: 'PL', name: 'PLINE', aliases: ['PL', 'PLINE', 'POLYLINE'], cadOnly: true },
    { id: 'REC', name: 'RECTANGLE', aliases: ['REC', 'RECTANG', 'RECTANGLE'], cadOnly: true },
    { id: 'C', name: 'CIRCLE', aliases: ['C', 'CIRCLE'], cadOnly: true },
    { id: 'A', name: 'ARC', aliases: ['A', 'ARC'], cadOnly: true },
    { id: 'TR', name: 'TRIM', aliases: ['TR', 'TRIM'] },
    { id: 'EX', name: 'EXTEND', aliases: ['EX', 'EXTEND'] },
    { id: 'E', name: 'ERASE', aliases: ['E', 'ERASE'] },
    { id: 'DI', name: 'DIST', aliases: ['DI', 'DIST'] },
    { id: 'T', name: 'TEXT', aliases: ['T','TEXT'], cadOnly:true },
    { id: 'MT', name: 'MTEXT', aliases: ['MT','MTEXT'], cadOnly:true },
    { id: 'LE', name: 'LEADER', aliases: ['LE','LEADER','CALLOUT'], cadOnly:true },
    { id: 'DLI', name: 'DIMALIGNED', aliases: ['DLI','DIM','DIMALIGNED'], cadOnly:true },
    { id: 'DRA', name: 'DIMRADIUS', aliases: ['DRA','DIMRADIUS'], cadOnly:true },
    { id: 'DDI', name: 'DIMDIAMETER', aliases: ['DDI','DIMDIAMETER'], cadOnly:true },
    { id: 'DAN', name: 'DIMANGULAR', aliases: ['DAN','DIMANGULAR'], cadOnly:true },
    { id: 'DCO', name: 'DIMCONTINUE', aliases: ['DCO','DIMCONTINUE'], cadOnly:true },
    { id: 'DBA', name: 'DIMBASELINE', aliases: ['DBA','DIMBASELINE'], cadOnly:true },
    { id: 'H', name: 'HATCH', aliases: ['H','HATCH'], cadOnly:true },
    { id: 'SHEET', name: 'SHEET', aliases: ['SHEET','PLOT','PRINT'], cadOnly:true },
    { id: 'M', name: 'MOVE', aliases: ['M', 'MOVE'] },
    { id: 'CO', name: 'COPY', aliases: ['CO', 'COPY'] },
    { id: 'RO', name: 'ROTATE', aliases: ['RO', 'ROTATE'], cadOnly: true },
    { id: 'RR', name: 'REGIONROTATE', aliases: ['RR', 'REGIONROTATE'], cadOnly: true },
    { id: 'MI', name: 'MIRROR', aliases: ['MI', 'MIRROR'], cadOnly: true },
    { id: 'SC', name: 'SCALE', aliases: ['SC', 'SCALE'], cadOnly: true },
    { id: 'CH', name: 'CHAMFER', aliases: ['CH', 'CHAMFER'], cadOnly: true },
    { id: 'AR', name: 'ARRAY', aliases: ['AR', 'ARRAY'], cadOnly: true },
    { id: 'AL', name: 'ALIGN', aliases: ['AL', 'ALIGN'], cadOnly: true },
    { id: 'SELPREV', name: 'SELECTPREVIOUS', aliases: ['SELPREV', 'SELECTPREVIOUS'], cadOnly: true },
    { id: 'SELLAST', name: 'SELECTLAST', aliases: ['SELLAST', 'SELECTLAST'], cadOnly: true },
    { id: 'SIMILAR', name: 'SELECTSIMILAR', aliases: ['SIMILAR', 'SELECTSIMILAR'], cadOnly: true },
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
      .map((command,index)=>({command,index,exact:command.aliases.some(alias=>alias===q)}))
      .sort((a,b)=>Number(b.exact)-Number(a.exact)||a.index-b.index)
      .slice(0, limit)
      .map(item=>item.command);
  }

  root.commandCore = Object.freeze({ catalog, normalize, matches });
})();
