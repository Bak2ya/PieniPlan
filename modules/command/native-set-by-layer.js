/* Native selection -> optional Settings -> ByBlock -> blocks confirmation. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ids=['SETBYLAYER','SETBYLAYERMODE'];
 const keyword=(id,phase,k)=>id==='SETBYLAYER'&&(phase==='select'&&['S','SETTINGS'].includes(k)||['byBlock','blocks'].includes(phase)&&['Y','YES','N','NO'].includes(k));
 function install(registry,p){
  registry.register({id:'SETBYLAYERMODE',aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'personal-preference',create(){const d={phase:'mode',value:p.mode()};p.prompt('SETBYLAYERMODE',d);return{view:()=>d,describe:()=>({phase:'mode',input:['text','enter']}),input(e){const raw=String(e.text??e.value??'').trim();if(e.type==='enter')return{ok:true,commit:true,value:d.value};if(!/^\d{1,3}$/.test(raw)||!M.cadSetByLayer.validMask(Number(raw)))return{ok:false,code:'invalid-number'};return{ok:true,commit:true,value:Number(raw)};},commit:p.setMode,cancel:p.clear,finalize:p.clear};}});
  registry.register({id:'SETBYLAYER',aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'document-appearance-group',create(){
   const d={phase:'select',ids:new Set(),mode:p.mode(),token:p.token(),closed:false,filtered:0};let editor=0;
   const live=()=>!d.closed&&p.current(d.token),show=()=>p.prompt('SETBYLAYER',d),valid=id=>M.cadSetByLayer.eligible(p.byId(id))&&p.allowed(id);
   function selection(ids,remove=false){for(const id of new Set(ids)){if(remove)d.ids.delete(id);else if(valid(id))d.ids.add(id);else d.filtered++;}p.select([...d.ids]);show();return{ok:true};}
   function confirm(){if(!d.ids.size)return{ok:false,code:'selection-required'};d.phase='byBlock';d.mode=p.mode();show();return{ok:true};}
   for(const id of p.selected())if(valid(id))d.ids.add(id);else d.filtered++;if(d.ids.size)confirm();else show();
   return{view:()=>d,describe:()=>({phase:d.phase,selectionMode:d.phase==='select'?'multiple':undefined,input:['selection','point','keyword','enter'],actions:d.phase==='select'?[{id:'SETTINGS',labelKey:'cad92.settings'}]:d.phase==='byBlock'||d.phase==='blocks'?[{id:'YES',labelKey:'cad89.yes'},{id:'NO',labelKey:'cad89.no'}]:[]}),
    input(e){if(!live())return{ok:false,code:'stale-context'};const k=String(e.type==='keyword'?e.value:e.text??'').trim().toUpperCase();
     if(d.phase==='settings')return{ok:false,code:'editor-open'};
     if(d.phase==='select'){
      if(['S','SETTINGS'].includes(k)){const ticket=++editor;p.settings(()=>{if(!live()||ticket!==editor)return;d.mode=p.mode();show();});return{ok:true};}
      if(e.type==='selection')return selection(e.ids,e.remove);if(e.type==='object')return selection([e.objectId],e.remove);if(e.type==='point')return selection([p.pick(e.point)?.id],Boolean(e.shift));if(e.type==='enter')return confirm();return{ok:false,code:'selection-required'};
     }
     const bit=d.phase==='byBlock'?32:64,yes=e.type==='enter'?Boolean(d.mode&bit):['Y','YES'].includes(k)?true:['N','NO'].includes(k)?false:null;if(yes===null)return{ok:false,code:'invalid-keyword'};d.mode=yes?d.mode|bit:d.mode&~bit;
     if(d.phase==='byBlock'){d.phase='blocks';show();return{ok:true};}return{ok:true,commit:true,value:{ids:[...d.ids],mode:d.mode,token:d.token,filtered:d.filtered}};
    },commit(value){if(!live()||value.token!==d.token)throw Error('stale-context');return p.apply(value);},cancel(){d.closed=true;editor++;p.clear();},finalize(){d.closed=true;editor++;p.clear();}
   };
  }});
 }
 M.nativeSetByLayer=Object.freeze({ids,keyword,install});
})();
