/* Existing registry/session lifecycle; preview plans contain detached results only. */
(() => {
 const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ops=root.cadLinearOperations;
 const definitions=[['O','OFFSET'],['F','FILLET'],['CH','CHAMFER'],['BR','BREAK'],['J','JOIN']];
 function install(registry,port){for(const [id,alias] of definitions)registry.register({id,aliases:[alias],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){
  const draft={token:port.token(),phase:['O','F','CH'].includes(id)?'distance':'source',distance:null,source:null,sourcePoint:null,first:null,lastPointer:null,plan:null};
  const prompt=()=>port.prompt(id,draft.phase);
  const getPoint=e=>{if(e.type==='point')return port.resolve(e.point,draft.first||draft.sourcePoint);if(e.type==='text'){const p=port.parsePoint(e.text,{base:draft.first||draft.sourcePoint,direction:draft.lastPointer&&draft.first?{x:draft.lastPointer.x-draft.first.x,y:draft.lastPointer.y-draft.first.y}:null});return p.ok?p.point:null;}return null;};
  function compute(e){const p=getPoint(e);if(!p)return null;if(id==='O')return root.cadPolyline?.is(draft.source)?root.cadPolyline.offset(draft.source,draft.distance,p):ops.offset(draft.source,draft.distance,p);if(id==='BR')return root.cadPolyline?.is(draft.source)?root.cadPolyline.breakBetween(draft.source,draft.first,p):ops.breakLine(draft.source,draft.first,p);const target=port.pick(e.point||p);if(!target||!port.allowed(target.id))return null;if(id==='J')return root.cadPolyline?.is(draft.source)?root.cadPolyline.joinOpen(draft.source,target):ops.join(draft.source,target);if(id==='CH'){if(root.cadPolyline?.is(draft.source))return target.id===draft.source.id?root.cadPolyline.chamferAt(draft.source,draft.sourcePoint,e.point||p,draft.distance):null;return ops.chamfer(draft.source,draft.sourcePoint,target,e.point||p,draft.distance);}if(root.cadPolyline?.is(draft.source))return target.id===draft.source.id?root.cadPolyline.filletAt(draft.source,draft.sourcePoint,e.point||p,draft.distance):null;return ops.fillet(draft.source,draft.sourcePoint,target,e.point||p,draft.distance);}
  prompt();return{view:()=>draft,describe:()=>({phase:draft.phase}),
   preview(e){draft.lastPointer=e.point;if(!port.current(draft.token)){draft.plan=null;port.preview(null);return{ok:false,code:'stale-context'};}draft.plan=['result','second'].includes(draft.phase)?compute({...e,type:'point'}):null;port.preview(draft.plan);return{ok:true};},
   input(e){if(!port.current(draft.token)){port.preview(null);return{ok:false,code:'stale-context'};}
    if(draft.phase==='distance'){const v=e.type==='text'?port.parseLength(e.text):null;if(!v?.ok||!(v.mm>0))return{ok:false,code:'invalid-distance'};draft.distance=v.mm;draft.phase='source';prompt();return{ok:true};}
    if(draft.phase==='source'){const obj=e.type==='point'?port.pick(e.point):null;if(!obj||!port.allowed(obj.id))return{ok:false,code:'target-not-modifiable'};
     const supported=id==='O'?(['cadLine','cadCircle','cadArc'].includes(obj.type)||Boolean(root.cadPolyline?.is(obj))):id==='BR'?(obj.type==='cadLine'||Boolean(root.cadPolyline?.is(obj))):id==='J'?(obj.type==='cadLine'||Boolean(root.cadPolyline?.is(obj)&&!obj.closed)):(['F','CH'].includes(id)?(obj.type==='cadLine'||Boolean(root.cadPolyline?.is(obj))):obj.type==='cadLine');
     if(!supported)return{ok:false,code:'unsupported-geometry'};draft.source=obj;draft.sourcePoint=e.point;port.source?.(obj.id);draft.phase=id==='BR'?'first':['J','F','CH'].includes(id)?'second':'result';prompt();return{ok:true};}
    if(draft.phase==='first'){const p=getPoint(e);if(!p)return{ok:false,code:'invalid-coordinate'};draft.first=(root.cadPolyline?.is(draft.source)?root.cadPolyline.nearest(draft.source,p):root.geometryQuery.projectNearest(draft.source,p))?.point;if(!draft.first)return{ok:false,code:'no-valid-result'};draft.phase='result';prompt();return{ok:true};}
    const plan=compute(e);if(!plan){port.preview(null);return{ok:false,code:'no-valid-result'};}draft.plan=plan;port.preview(plan);return{ok:true,commit:true,value:plan};
   },commit(plan){if(!port.current(draft.token))throw Error('stale-context');return port.commit(id,plan);},cancel:()=>port.clear(),finalize:()=>port.clear()
  };
 }});}
 root.nativeModifyCommands=Object.freeze({install,ids:definitions.map(d=>d[0]),resolve:raw=>definitions.find(d=>d.includes(String(raw).toUpperCase()))?.[0]||null});
})();
