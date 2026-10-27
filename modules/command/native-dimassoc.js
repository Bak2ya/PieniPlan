/* Drawing variable, distinct from personal grip preferences and DIMSTYLE. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function install(registry,p){registry.register({id:'DIMASSOC',aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-dimassoc-setting',create(){const token=p.token(),old=p.get();p.prompt(old);return{view:()=>({phase:'dimassoc',value:old}),describe:()=>({phase:'dimassoc',input:['integer']}),input(e){const raw=String(e.text||'').trim(),value=e.type==='enter'?old:e.type==='text'&&/^[012]$/.test(raw)?Number(raw):NaN;return Number.isInteger(value)?{ok:true,commit:true,value}:{ok:false,code:'invalid-number'};},commit(value){if(!p.current(token)||p.get()!==old)throw Error('stale-context');return p.set(value);},cancel:p.clear,finalize:p.clear};}});}
 M.nativeDimassoc=Object.freeze({install});
})();
