/* Local safety storage completes before an optional bound-document cloud save. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function create({identity,localSave,cloud}){
  return Object.freeze({async save(options={}){const id=identity(),ok=await localSave(options);if(!ok)return false;if(!options.saveAs&&id===identity())await cloud()?.afterLocalSave(id);return true;}});
 }
 M.documentSave=Object.freeze({create});
})();
