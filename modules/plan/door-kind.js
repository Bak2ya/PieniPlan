/* Opening mechanism and fire performance are independent. Legacy names remain
 * readable without mutating historical objects merely to render them. */
(() => {
  'use strict';
  const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const capability='plan.door.shutter.v1';
  const mechanism=o=>o?.doorType==='fireDoor'?'hingedSingle':o?.doorType==='fireShutter'?'shutter':o?.doorType||'hingedSingle';
  const protection=o=>o?.doorType==='fireDoor'?'fireDoor':o?.doorType==='fireShutter'?'fireShutter':o?.fireProtection||null;
  function patch(o,value){
    const type=mechanism(o),fire=value==='fireDoor'||value==='fireShutter'?value:null;
    if(type==='shutter'?fire==='fireDoor':fire==='fireShutter')throw Error('door-fire-mechanism');
    return {doorType:type,elementKind:type==='shutter'?'shutter':'door',fireProtection:fire,fireRating:o.fireRating||null};
  }
  M.doorKind=Object.freeze({capability,mechanism,protection,patch,required:objects=>objects.some(o=>o.type==='door'&&o.doorType==='shutter')});
})();
