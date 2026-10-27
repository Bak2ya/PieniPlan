/* Coordinate syntax conversion only. Parsing units and command meaning stays with the host. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function parse(raw,options,{frame,parseWorld}){let text=String(raw??'').trim();if(text.startsWith('*'))return parseWorld(text.slice(1),options);if(text.startsWith('#'))text=text.slice(1);
  if(!/[,<]/.test(text))return parseWorld(text,options);
  const U=M.cadUcs,base=options.base&&U.toLocal(frame,options.base),direction=options.direction&&U.localVector(frame,options.direction),q=parseWorld(text,{...options,base,direction});return q?.ok&&q.kind==='point'?{...q,point:U.toWorld(frame,q.point)}:q;
 }
 M.cadUcsInput=Object.freeze({parse});
})();
