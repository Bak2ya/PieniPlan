/* Planar drafting plane selection; one history entry, no geometric owner edits. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},options={L:'left',LEFT:'left',T:'top',TOP:'top',R:'right',RIGHT:'right',O:'off',OFF:'off',ORTHOGRAPHIC:'off',ON:'left'};
 function install(registry,p){registry.register({id:'ISODRAFT',aliases:['ISOPLANE'],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-drafting-change',create(){const token=p.token(),before=p.plane();p.prompt();return{view:()=>({phase:'isoplane'}),describe:()=>({phase:'isoplane',input:['keyword'],actions:['LEFT','TOP','RIGHT','OFF'].map(id=>({id,labelKey:'cad96.iso.'+id}))}),input(e){const text=String(e.type==='keyword'?e.value:e.text||'').trim().toUpperCase(),plane=e.type==='enter'?'off':options[text];return plane?{ok:true,commit:true,value:{before,after:plane,token}}:{ok:false,code:'invalid-keyword'};},commit(v){if(!p.current(v.token)||p.plane()!==v.before)throw Error('stale-context');return p.commit(v.after);},cancel:p.clear,finalize:p.clear};}});}
 M.nativeIsometricCommand=Object.freeze({install});
})();
