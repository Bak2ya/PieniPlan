/* Drawing dimension variables use existing DIMSTYLE history, never personal preferences. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ids=Object.freeze(['DIMAUNIT','DIMADEC','DIMAZIN']);
 function install(registry,p){for(const id of ids)registry.register({id,aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){const token=p.token(),identity=p.identity(),old=p.get(id);p.prompt(id,old);return{view:()=>({phase:'value',id,value:old}),describe:()=>({phase:'value',id,input:['integer']}),input(e){const text=String(e.text??'').trim(),value=e.type==='enter'?old:e.type==='text'&&/^-?\d+$/.test(text)?Number(text):NaN;try{M.cadDimensionAngular.setting(id,value);}catch{return{ok:false,code:'invalid-number'};}return{ok:true,commit:true,value};},commit(value){if(!p.current(token)||p.identity()!==identity||p.get(id)!==old)throw Error('stale-context');return value===old?true:p.set(id,value);},cancel:p.clear,finalize:p.clear};}});}
 M.nativeDimensionAngular=Object.freeze({ids,install});
})();
