/* Drawing-only appearance prompts; existing CAD history owns setting publication. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ids=['CETRANSPARENCY','HPTRANSPARENCY'];
 function install(registry,p){for(const id of ids)registry.register({id,aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){const C=M.cadCreationAppearance,token=p.token(),before=JSON.stringify(p.settings()?.[C.key]??null),old=C.value(p.settings(),id);p.prompt(id,C.format(id,old));return{view:()=>({phase:'value',value:old}),describe:()=>({phase:'value',input:['value','keyword'],actions:[]}),input(e){if(!p.current(token))return{ok:false,code:'stale-context'};try{const value=e.type==='enter'?old:e.type==='text'||e.type==='keyword'?C.parse(id,e.text??e.value):(()=>{throw Error();})();return{ok:true,commit:true,value};}catch{return{ok:false,code:'invalid-number'};}},commit(value){if(!p.current(token)||JSON.stringify(p.settings()?.[C.key]??null)!==before)throw Error('stale-context');return p.set(id,value);},cancel:p.clear,finalize:p.clear};}});}
 M.nativeCreationAppearance=Object.freeze({ids,install});
})();
