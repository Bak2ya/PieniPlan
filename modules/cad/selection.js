/* PieniPlan Build26 P1: selection set owner, document remains external. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  function create({getIds,setIds,policy}){
    const normalize=ids=>new Set([...ids].filter(id=>policy(id,'select').allowed));
    function apply(ids,mode='replace'){
      const current=new Set(getIds());const incoming=normalize(ids);
      if(mode==='replace')return setIds(incoming);
      if(mode==='add'){for(const id of incoming)current.add(id);return setIds(current);}
      if(mode==='toggle'){for(const id of incoming)current.has(id)?current.delete(id):current.add(id);return setIds(current);}
      return setIds(current);
    }
    function prune(){return setIds(normalize(getIds()));}
    return Object.freeze({apply,prune,clear:()=>setIds(new Set())});
  }
  root.cadSelection = Object.freeze({create});
})();
