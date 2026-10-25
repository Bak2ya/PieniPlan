/* Native source -> Settings / repeat paint. Completed edits survive Esc; one Undo. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function install(registry,port){registry.register({id:'MA',aliases:['MATCHPROP'],available:ctx=>ctx.mode==='cad',historyOwner:'cad-change-set',
  create(){const draft={source:null,targets:new Set(),token:port.token(),history:null};const prompt=()=>port.prompt(draft.source?'cadProperty.pickTargets':'cadProperty.pickSource');prompt();return{
   view:()=>draft,describe:()=>({phase:draft.source?'targets':'source',selectionMode:draft.source?'multiple':'single',actions:draft.source?[{id:'S',labelKey:'cad92.settings',enabled:true}]:[]}),
   input(event){if(!port.current(draft.token))return{ok:false,code:'stale-context'};const k=String(event.text??event.value??'').trim().toUpperCase();
    if(draft.source&&['S','SETTINGS'].includes(k)){port.settings(prompt);return{ok:true};}
    if(event.type==='enter'||event.type==='text'&&!k)return draft.source?{ok:true,commit:true}:{ok:false,code:'source-required'};
    const ids=event.type==='selection'?[...new Set(event.ids||[])]:[event.objectId].filter(Boolean);if(!ids.length)return{ok:false,code:'missing-object'};
    if(!draft.source){if(ids.length!==1||!port.allowed(ids[0],'inspect'))return{ok:false,code:'source-required'};draft.source=ids[0];prompt();return{ok:true};}
    const targets=ids.filter(id=>id!==draft.source);if(!targets.length||targets.some(id=>!port.allowed(id,'modify')))return{ok:false,code:'target-not-modifiable'};
    const mark=port.apply(draft.source,targets,draft.history);if(mark){draft.history=mark;for(const id of targets)draft.targets.add(id);draft.token=port.token();port.select(draft.targets);}prompt();return{ok:true};
   },
   commit:()=>true,
   cancel:()=>port.clear(),finalize:()=>port.clear()
  };}
 });registry.register({id:'SIMILAR',aliases:['SELECTSIMILAR'],available:c=>c.mode==='cad',repeatable:true,
  create(){const d={ids:new Set(port.selected()),token:port.token()};port.prompt('cad92.similarPick');return{immediate:d.ids.size>0,view:()=>d,describe:()=>({phase:'select',actions:[{id:'S',labelKey:'cad92.settings',enabled:true}]}),
   input(e){if(!port.current(d.token))return{ok:false,code:'stale-context'};const k=String(e.text??e.value??'').trim().toUpperCase();if(['S','SETTINGS'].includes(k)){port.similarSettings();return{ok:true};}if(e.type==='enter'||e.type==='text'&&!k)return d.ids.size?{ok:true,commit:true}:{ok:false,code:'source-required'};const ids=e.type==='selection'?e.ids:[e.objectId];if(!ids?.length)return{ok:false,code:'missing-object'};for(const id of ids)if(port.allowed(id,'select'))e.remove?d.ids.delete(id):d.ids.add(id);port.select(d.ids);return{ok:true};},
   commit:()=>port.similar(d.ids),cancel:()=>port.clear(),finalize:()=>port.clear()};}
 });}
 root.nativeMatchprop=Object.freeze({install});
})();
