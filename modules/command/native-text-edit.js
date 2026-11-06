/* Native content-only TEXTEDIT. Drafts are transient; accepted edits share one inverse. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ids=['TEXTEDIT','TEXTEDITMODE'],key='pieniplan-textedit-mode-v1',clone=o=>JSON.parse(JSON.stringify(o));
 const eligible=o=>Boolean(o&&['cadText','cadDimension'].includes(o.type)&&!o.floorId&&!o.planRole&&!o.blockOwnerId);
 const content=o=>o.type==='cadDimension'?o.textOverride??'<>':o.text??'';
 function edit(o,text){if(!eligible(o)||typeof text!=='string')throw Error('target-not-modifiable');if(text===content(o)||o.type==='cadDimension'&&!o.textOverride&&['','<>'].includes(text))return null;const after=clone(o);if(o.type==='cadDimension'){after.textOverride=text;delete after.dxfPresentation;}else after.text=text;return after;}
 function preferences(storage=globalThis.localStorage){let mode=0;function load(){try{const q=JSON.parse(storage.getItem(key));mode=q?.version===1&&[0,1].includes(q.mode)?q.mode:0;}catch{mode=0;}return mode;}load();return Object.freeze({get:()=>mode,load,set(value){if(!Number.isInteger(value)||![0,1].includes(value))throw Error('invalid-number');if(value===mode)return true;storage.setItem(key,JSON.stringify({version:1,mode:value}));mode=value;return true;}});}
 const keyword=(id,phase,k)=>id==='TEXTEDIT'&&(phase==='select'&&['U','UNDO','M','MODE'].includes(k)||phase==='mode'&&['S','SINGLE','M','MULTIPLE'].includes(k));
 function install(registry,p){
  registry.register({id:'TEXTEDITMODE',available:c=>c.mode==='cad',historyOwner:'personal-preference',create(){const d={phase:'mode',mode:p.mode()};p.prompt('TEXTEDITMODE',d);return{view:()=>d,describe:()=>({phase:d.phase}),input(e){const q=String(e.text??e.value??'').trim();if(e.type==='enter')return{ok:true,commit:true,value:d.mode};return /^[01]$/.test(q)?{ok:true,commit:true,value:Number(q)}:{ok:false,code:'invalid-number'};},commit:p.setMode,cancel:p.clear,finalize:p.clear};}});
  registry.register({id:'TEXTEDIT',aliases:['TEDIT','DDEDIT'],available:c=>c.mode==='cad',historyOwner:'document-content-group',create(){
   const d={phase:'select',mode:p.mode(),token:p.token(),history:null,base:p.history(),edits:[],closed:false,ticket:null};
   const live=()=>!d.closed&&p.current(d.token),historyLive=()=>p.history()===(d.history||d.base),show=()=>p.prompt('TEXTEDIT',d),allowed=id=>eligible(p.byId(id))&&p.allowed(id);
   function select(ids){if(ids.length!==1||!allowed(ids[0]))return{ok:false,code:'target-not-modifiable'};const before=clone(p.byId(ids[0])),ticket={before};d.ticket=ticket;d.phase='editing';p.select([before.id]);show();const opened=p.open(before,{accept:text=>p.deliver({type:'editorText',text,ticket}),cancel:()=>p.deliver({type:'editorCancel',ticket})});if(opened===false){d.ticket=null;d.phase='select';show();return{ok:false,code:'editor-unavailable'};}return{ok:true};}
   const close=()=>{d.closed=true;d.ticket=null;p.close();p.clear();};
   show();const pre=[...p.selected()];if(pre.length===1&&allowed(pre[0]))select(pre);
   return{view:()=>d,describe:()=>({phase:d.phase,selectionMode:d.phase==='select'?'single':undefined,actions:d.phase==='select'?[{id:'UNDO',labelKey:'cad100.textedit.undo'},{id:'MODE',labelKey:'cad100.textedit.mode'}]:d.phase==='mode'?[{id:'SINGLE',labelKey:'cad100.textedit.single'},{id:'MULTIPLE',labelKey:'cad100.textedit.multiple'}]:[]}),
    input(e){if(!live())return{ok:false,code:'stale-context'};const k=String(e.text??e.value??'').trim().toUpperCase();
     if(d.phase==='editing'){
      if(!['editorText','editorCancel'].includes(e.type)||e.ticket!==d.ticket)return{ok:false,code:'editor-open'};
      const before=d.ticket.before,current=p.byId(before.id);if(!historyLive()||!allowed(before.id)||JSON.stringify(current)!==JSON.stringify(before))return{ok:false,code:'stale-context'};
      if(e.type==='editorText'){const after=edit(before,e.text);if(after){d.history=p.apply(current,after,d.history);d.edits.push({before,after:clone(p.byId(before.id))});d.token=p.token();}}
      d.ticket=null;d.phase='select';if(d.mode===1)return{ok:true,commit:true};show();return{ok:true};
     }
     if(d.phase==='mode'){const mode=e.type==='enter'?d.mode:['S','SINGLE'].includes(k)?1:['M','MULTIPLE'].includes(k)?0:null;if(mode===null)return{ok:false,code:'invalid-keyword'};p.setMode(mode);d.mode=mode;d.phase='select';show();return{ok:true};}
     if(['M','MODE'].includes(k)){d.phase='mode';show();return{ok:true};}
     if(['U','UNDO'].includes(k)){const last=d.edits.at(-1);if(!last)return{ok:false,code:'nothing-to-undo'};if(!historyLive()||!allowed(last.after.id)||JSON.stringify(p.byId(last.after.id))!==JSON.stringify(last.after))return{ok:false,code:'stale-context'};d.history=p.apply(p.byId(last.after.id),last.before,d.history);d.edits.pop();d.token=p.token();p.select([last.before.id]);show();return{ok:true};}
     if(e.type==='enter'||e.type==='text'&&!k)return{ok:true,commit:true};
     if(e.type==='selection')return select([...new Set(e.ids||[])]);if(e.type==='object')return select([e.objectId]);if(e.type==='point')return select([p.pick(e.point)?.id]);return{ok:false,code:'selection-required'};
    },commit:()=>true,cancel:close,finalize:close
   };
  }});
 }
 M.nativeTextEdit=Object.freeze({ids,key,eligible,content,edit,preferences,keyword,install});
})();
