/* DIMTEDIT uses one selected owner, transient preview and one atomic publication. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ids=['DIMTEDIT','DIMEDIT'],clone=o=>JSON.parse(JSON.stringify(o)),options=['LEFT','RIGHT','CENTER','HOME','ANGLE'],aliases={L:'LEFT',R:'RIGHT',C:'CENTER',H:'HOME',A:'ANGLE'};
 const keyword=(id,phase,k)=>id==='DIMTEDIT'&&phase==='location'&&(options.includes(k)||Object.hasOwn(aliases,k))||id==='DIMEDIT'&&phase==='option'&&['H','HOME','N','NEW','R','ROTATE','O','OBLIQUE'].includes(k);
 function install(registry,p){registry.register({id:'DIMTEDIT',available:c=>c.mode==='cad',historyOwner:'cad-change-set',create(){
  const d={phase:'select',token:p.token(),before:null,pointer:null},live=()=>p.current(d.token),show=()=>p.prompt('DIMTEDIT',d),allowed=id=>M.cadDimensionTextEdit.eligible(p.byId(id))&&p.allowed(id);
  function current(){if(!live()||!d.before||!allowed(d.before.id)||JSON.stringify(p.byId(d.before.id))!==JSON.stringify(d.before)||JSON.stringify(M.cadDimensionStyles.style(d.before))!==d.styleSignature)throw Error('stale-context');return p.byId(d.before.id);}
  function select(ns){if(ns.length!==1||!allowed(ns[0]))return{ok:false,code:'unsupported-geometry'};d.before=clone(p.byId(ns[0]));d.styleSignature=JSON.stringify(M.cadDimensionStyles.style(d.before));d.phase='location';p.select(ns);show();return{ok:true};}
  function result(q){current();return{ok:true,commit:true,value:q};}
  function location(e){const base=M.cadDimensionStyles.geometry(d.before).labelPoint,point=e.type==='point'?p.resolve(e.point,base):e.type==='text'?p.parse(e.text,{base,direction:d.pointer?{x:d.pointer.x-base.x,y:d.pointer.y-base.y}:null})?.point:null;return M.cadDimensionTextEdit.locate(d.before,point);}
  const close=()=>{p.preview(null);p.clear();};show();const pre=[...p.selected()];if(pre.length===1)select(pre);
  return{view:()=>d,describe:()=>({phase:d.phase,selectionMode:d.phase==='select'?'single':undefined,...(d.phase==='location'?{pointBase:M.cadDimensionStyles.geometry(d.before).labelPoint,pointInputRole:'dimension-text-location',actions:options.map(id=>({id,labelKey:'cad101.dimtext.'+(id==='ANGLE'?'angleOption':id.toLowerCase())}))}:{}),input:d.phase==='angle'?['angle']:['point','coordinate','keyword']}),
   preview(e){try{current();if(d.phase!=='location')return{ok:true};d.pointer={...e.point};const after=location({type:'point',point:e.point});p.preview({after:[after],removed:[d.before]});return{ok:true};}catch(error){p.preview(null);return{ok:false,code:error.message};}},
   input(e){if(!live())return{ok:false,code:'stale-context'};const raw=String(e.type==='keyword'?e.value:e.text??'').trim(),k=raw.toUpperCase(),option=aliases[k]||k;
    if(d.phase==='select'){if(e.type==='point')return select([p.pick(e.point)?.id]);if(e.type==='object')return select([e.objectId]);if(e.type==='selection')return select([...new Set(e.ids||[])]);return{ok:false,code:'selection-required'};}
    try{current();if(d.phase==='angle'){if(e.type==='enter')return{ok:true,commit:true,value:d.before};const a=M.cadUnits.parseAngle(raw);if(!a.ok)throw Error('invalid-number');return result(M.cadDimensionTextEdit.angle(d.before,a.degrees,{worldAngle:p.worldAngle}));}
     if(option==='ANGLE'){d.phase='angle';p.preview(null);show();return{ok:true};}if(option==='HOME')return result(M.cadDimensionTextEdit.home(d.before));if(['LEFT','RIGHT','CENTER'].includes(option))return result(M.cadDimensionTextEdit.justify(d.before,option));if(e.type==='enter')return{ok:true,commit:true,value:d.before};return result(location(e));
    }catch(error){return{ok:false,code:error.message};}
   },commit(after){const before=current();if(JSON.stringify(before)===JSON.stringify(after))return true;return p.commit('DIMTEDIT',[{before,after,index:p.index(before.id)}]);},cancel:close,finalize:close
  };
 }});
 registry.register({id:'DIMEDIT',available:c=>c.mode==='cad',historyOwner:'cad-change-set',create(){
  const d={phase:'option',option:'HOME',token:p.token(),pending:new Map(),before:null,value:null,closed:false,ticket:null},live=()=>!d.closed&&p.current(d.token),show=()=>p.prompt('DIMEDIT',d),eligible=id=>d.option==='NEW'?p.byId(id)?.type==='cadDimension'&&M.nativeTextEdit.eligible(p.byId(id)):M.cadDimensionTextEdit.eligible(p.byId(id)),allowed=id=>eligible(id)&&p.allowed(id);
  function snapshot(o){return{owner:clone(o),style:JSON.stringify(M.cadDimensionStyles.style(o))};}
  function add(ns,remove=false){if(!live())return{ok:false,code:'stale-context'};const next=new Map(d.pending);for(const id of new Set(ns)){if(remove)next.delete(id);else if(eligible(id)){if(!allowed(id))return{ok:false,code:'target-not-modifiable'};next.set(id,snapshot(p.byId(id)));}}d.pending=next;p.select([...next.keys()]);show();return{ok:true};}
  function check(){if(!live())throw Error('stale-context');for(const[id,b]of d.pending)if(!allowed(id)||JSON.stringify(p.byId(id))!==JSON.stringify(b.owner)||JSON.stringify(M.cadDimensionStyles.style(b.owner))!==b.style)throw Error('stale-context');}
  function finish(){check();if(!d.pending.size)throw Error('selection-required');const changes=[];for(const[id,b]of d.pending){const before=p.byId(id),after=d.option==='HOME'?M.cadDimensionTextEdit.home(before,{resetRotation:true}):d.option==='ROTATE'?M.cadDimensionTextEdit.angle(before,d.value,{worldAngle:p.worldAngle}):M.nativeTextEdit.edit(before,d.value);if(after&&JSON.stringify(after)!==JSON.stringify(before))changes.push({before,after,index:p.index(id)});}return{ok:true,commit:true,value:changes};}
  function selecting(){d.phase='select';const pre=[...p.selected()];const added=add(pre);if(!added.ok)return added;return d.pending.size?finish():{ok:true};}
  function openNew(){d.phase='editing';const ticket={};d.ticket=ticket;show();try{if(p.openNew({accept:text=>p.deliver({type:'templateText',text,ticket}),cancel:()=>p.deliver({type:'templateCancel',ticket})})===false)throw Error('editor-unavailable');return{ok:true};}catch(error){d.ticket=null;d.phase='option';show();return{ok:false,code:error.message};}}
  function close(){d.closed=true;d.ticket=null;p.closeNew?.();p.preview(null);p.clear();}
  show();return{view:()=>d,describe:()=>({phase:d.phase,count:d.pending.size,input:d.phase==='angle'?['angle']:['point','selection','keyword'],actions:d.phase==='option'?['HOME','NEW','ROTATE'].map(id=>({id,labelKey:'cad101.dimedit.'+id.toLowerCase()})):[]}),
   input(e){if(!live())return{ok:false,code:'stale-context'};const raw=String(e.type==='keyword'?e.value:e.text??'').trim(),k=raw.toUpperCase();try{
    if(d.phase==='option'){const option=e.type==='enter'?'HOME':({H:'HOME',N:'NEW',R:'ROTATE',O:'OBLIQUE'})[k]||k;if(!['HOME','NEW','ROTATE'].includes(option))return{ok:false,code:'unsupported-option'};d.option=option;if(option==='HOME')return selecting();if(option==='NEW')return openNew();d.phase='angle';show();return{ok:true};}
    if(d.phase==='angle'){if(e.type==='enter')d.value=0;else{const a=M.cadUnits.parseAngle(raw);if(!a.ok)throw Error('invalid-number');d.value=a.degrees;}return selecting();}
    if(d.phase==='editing'){if(e.ticket!==d.ticket||!['templateText','templateCancel'].includes(e.type))return{ok:false,code:'editor-open'};if(e.type==='templateCancel')return{ok:true,commit:true,value:[]};if(typeof e.text!=='string'||e.text.length>100000||e.text.includes('\0'))throw Error('invalid-input');d.value=e.text;d.ticket=null;return selecting();}
    if(e.type==='enter')return finish();if(e.type==='selection')return add(e.ids||[],e.remove);if(e.type==='object')return add([e.objectId],e.remove);if(e.type==='point')return add([p.pick(e.point)?.id],e.shift);return{ok:false,code:'selection-required'};
   }catch(error){return{ok:false,code:error.message};}},
   commit(changes){check();for(const c of changes)if(JSON.stringify(p.byId(c.before.id))!==JSON.stringify(c.before))throw Error('stale-context');return changes.length?p.commit('DIMEDIT',changes):true;},cancel:close,finalize:close
  };
 }});}
 M.nativeDimensionTextEdit=Object.freeze({ids,keyword,install});
})();
