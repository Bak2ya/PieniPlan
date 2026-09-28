/* Source -> target set -> Enter, with a single bounded history entry. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function install(registry,port){registry.register({id:'MA',aliases:['MATCHPROP'],available:ctx=>ctx.mode==='cad',historyOwner:'cad-change-set',
  create(){const draft={source:null,targets:new Set(),token:port.token()};port.prompt('cadProperty.pickSource');return{
   view:()=>draft,describe:()=>({phase:draft.source?'targets':'source'}),
   input(event){if(event.type==='text'&&!String(event.text||'').trim()){return draft.source&&draft.targets.size?{ok:true,commit:true}:{ok:false,code:'target-required'};}
    const id=event.objectId;if(!id)return{ok:false,code:'missing-object'};
    if(!draft.source){if(!port.allowed(id,'inspect'))return{ok:false,code:'target-not-modifiable'};draft.source=id;port.prompt('cadProperty.pickTargets');return{ok:true};}
    if(id===draft.source||!port.allowed(id,'modify'))return{ok:false,code:'target-not-modifiable'};
    if(draft.targets.has(id))draft.targets.delete(id);else draft.targets.add(id);port.select(draft.targets);return{ok:true};
   },
   commit(){if(!port.current(draft.token))throw new Error('stale-context');return port.apply(draft.source,draft.targets);},
   cancel:()=>port.clear(),finalize:()=>port.clear()
  };}
 });}
 root.nativeMatchprop=Object.freeze({install});
})();
