/* Reassociation publishes each accepted point, but owns one narrow Undo group.
 * Esc only clears the prompt; accepted points remain, as native DIMREASSOCIATE. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ids=['DIMREASSOCIATE','DIMDISASSOCIATE','DIMREGEN'];
 function keyword(id,phase,text,view){return id==='DIMREASSOCIATE'&&(phase==='select'&&['D','DISASSOCIATED'].includes(text)||phase==='anchor'&&view?.sourceOption!==false&&['S','SELECT'].includes(text));}
 function install(registry,p){for(const id of ids)registry.register({id,aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){
  const B=M.cadDimensionManagement,d={phase:'select',ids:[],index:0,slotIndex:0,token:p.token(),mark:null,marker:null,sourceOption:false},pending=new Set();let filtered=0;
  const valid=n=>{const o=p.byId(n);return Boolean(B.slots(o).length&&p.allowed(n)&&(id!=='DIMDISASSOCIATE'||o.association));},show=()=>p.prompt(id,d),done=()=>({ok:true,commit:true}),live=()=>p.current(d.token),obj=()=>p.byId(d.ids[d.index]);
  function add(ns,remove=false){for(const n of ns){if(remove)pending.delete(n);else if(valid(n))pending.add(n);else filtered++;}p.select([...pending]);show();return{ok:true};}
  function marker(){const o=obj(),slot=B.slots(o)[d.slotIndex];d.dimensionId=o?.id;d.slot=slot;d.marker=o&&(slot==='radial'?o.center:slot==='arc'?M.cadArcLength.at(o.center,o.radius,o.startAngle):o[slot]);d.boxed=o&&B.linked(o,slot,p.byId);d.sourceOption=Boolean(o&&(slot==='p1'||slot==='vertex'));p.preview(null);show();}
  function advance(skipAll=false){if(skipAll||++d.slotIndex>=B.slots(obj()).length){d.index++;d.slotIndex=0;}if(d.index>=d.ids.length)return done();d.phase='anchor';marker();return{ok:true};}
  function publish(after){const before=obj();if(!before||!p.allowed(before.id))throw Error('target-not-modifiable');const result=p.commit(id,[{before,after,index:p.index(before.id)}],d.mark);d.mark=result.mark;d.token=p.token();return result;}
  function start(){d.ids=[...pending].filter(valid);if(!d.ids.length)return{ok:false,code:'selection-required'};if(id==='DIMDISASSOCIATE')return done();d.phase='anchor';marker();return{ok:true};}
  function target(e,preview=false){if(d.phase==='source'||d.slot==='radial'||d.slot==='arc'){if(e.type!=='point')throw Error('selection-required');const source=p.pick(e.point);if(!source||!p.inspect(source.id))throw Error('unsupported-geometry');return B.source(obj(),source,e.point,p.byId);}
   const point=e.type==='point'?p.resolve(e.point,d.marker):e.type==='text'?p.parse(e.text,{base:d.marker,direction:d.marker&&d.pointer?{x:d.pointer.x-d.marker.x,y:d.pointer.y-d.marker.y}:null})?.point:null;if(!point)throw Error('invalid-coordinate');const anchor=e.type==='point'?p.capture(point):null;return B.edit(obj(),d.slot,point,anchor,p.byId);
  }
  if(id==='DIMREGEN')return{immediate:true,commit(){const changes=[];let skipped=0;for(const o of p.candidates()){if(o.type!=='cadDimension'||(o.association?.status!=='current'&&o.association?.version!==2))continue;if(!p.allowed(o.id)){skipped++;continue;}const after=M.cadDimensionAssociation.regenerate(o,p.byId);if(JSON.stringify(o)!==JSON.stringify(after))changes.push({before:o,after,index:p.index(o.id)});}if(changes.length)p.commit(id,changes,null);p.report(id,changes.length,skipped);return true;},cancel:p.clear,finalize:p.clear};
  add(p.selected());if(pending.size)start();
  return{view:()=>d,describe:()=>({phase:d.phase,pointBase:id==='DIMREASSOCIATE'&&d.phase==='anchor'&&d.slot!=='radial'&&d.slot!=='arc'?d.marker:undefined,count:pending.size,input:['point','coordinate','selection','keyword'],actions:id==='DIMREASSOCIATE'&&d.phase==='select'?[{id:'DISASSOCIATED',labelKey:'cad96.dimLink.disassociated'}]:d.phase==='anchor'&&d.sourceOption?[{id:'SELECT',labelKey:'cad96.dimLink.source'}]:[]}),
   preview(e){if(!live())return{ok:false,code:'stale-context'};if(!['anchor','source'].includes(d.phase))return{ok:true};d.pointer=e.point;try{p.preview({after:[target({type:'point',point:e.point},true)],removed:[obj()]});}catch{p.preview(null);}return{ok:true};},
   input(e){if(!live())return{ok:false,code:'stale-context'};const text=String(e.type==='keyword'?e.value:e.text||'').trim().toUpperCase();
    if(d.phase==='select'){
     if(e.type==='selection')return add(e.ids,e.remove);if(e.type==='object')return add([e.objectId],e.remove);if(e.type==='point')return add([p.pick(e.point)?.id],Boolean(e.shift));
     if(id==='DIMREASSOCIATE'&&['D','DISASSOCIATED'].includes(text))return add(p.candidates().filter(o=>B.slots(o).length&&B.slots(o).some(s=>!B.linked(o,s,p.byId))).map(o=>o.id));
     if(e.type==='enter')return start();return{ok:false,code:'selection-required'};
    }
    if(e.type==='enter')return advance();
    if(d.phase==='anchor'&&d.sourceOption&&['S','SELECT'].includes(text)){d.phase='source';p.preview(null);show();return{ok:true};}
    try{const after=target(e);publish(after);return advance(d.phase==='source'&&['linear','aligned'].includes(after.kind||'aligned'));}catch(error){return{ok:false,code:error.message};}
   },commit(){if(!live())throw Error('stale-context');if(id==='DIMDISASSOCIATE'){const changes=d.ids.filter(valid).map(n=>({before:p.byId(n),after:B.disassociate(p.byId(n)),index:p.index(n)}));if(changes.length)p.commit(id,changes,null);p.report(id,changes.length,filtered);}else p.report(id,d.ids.length,filtered);return true;},cancel:p.clear,finalize:p.clear,
   get immediate(){return id==='DIMDISASSOCIATE'&&d.ids.length>0;}
  };
 }});}
 M.nativeDimensionAssociation=Object.freeze({ids,keyword,install});
})();
