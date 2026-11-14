/* Confirmed Plan selection owns only its temporary inspector changes.
 * Manual choices and persistent preferences always belong to the user. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function create(p){
  let seen=null,owner=null,scope=null;
  function release(){owner=null;p.hold(false);}
  function update({key,ids,eligible,busy=false}){
   if(busy)return;
   if(scope!==key){if(owner){const saved=owner;release();if(p.current()==='properties')p.select(p.exists(saved.tab)?saved.tab:'primary');if(!saved.open)p.close();}else release();seen=null;scope=key;}
   const signature=JSON.stringify([...ids].sort());
   if(signature===seen)return;seen=signature;
   if(!eligible||!ids.length){
    if(owner){const saved=owner;release();if(p.current()==='properties')p.select(p.exists(saved.tab)?saved.tab:'primary');if(!saved.open)p.close();}
    return;
   }
   if(!owner)owner={tab:p.current(),open:p.visible()};
   p.hold(true);p.select('properties');p.reveal();
  }
  function manual(){release();}
  return Object.freeze({update,manual,active:()=>Boolean(owner)});
 }
 M.selectionInspector=Object.freeze({create});
})();
