/* Detached native CAD editing, repeat and command-owned Undo. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ops=root.cadLinearOperations;
 const definitions=[['O','OFFSET'],['F','FILLET'],['CH','CHAMFER'],['BR','BREAK'],['J','JOIN']];
 const keys=['T','THROUGH','D','DISTANCE','R','RADIUS','M','MULTIPLE','U','UNDO','F','FIRST','TRIM','NOTRIM','N','NO','Y','YES','L','LAYER','E','ERASE','S','SOURCE','C','CURRENT','A','ANGLE','P','POLYLINE','METHOD','CLOSE'];
 function install(registry,port){
  let settings={offset:100,fillet:0,chamfer:0,chamfer2:0,chamferAngle:45,chamferMethod:'distance',trim:true,offsetLayer:'source',offsetErase:false};try{Object.assign(settings,JSON.parse(localStorage.getItem('pieniplan-cad-modify-settings-v1')||'{}'));}catch{}
  const save=()=>{try{localStorage.setItem('pieniplan-cad-modify-settings-v1',JSON.stringify(settings));}catch{}};
  for(const [id,alias] of definitions)registry.register({id,aliases:[alias],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){
   const draft={token:port.token(),phase:id==='O'?'distance':'source',distance:id==='O'?settings.offset:id==='F'?settings.fillet:settings.chamfer,distance2:settings.chamfer2,angle:settings.chamferMethod==='angle'?settings.chamferAngle:null,trim:settings.trim,through:false,offsetLayer:settings.offsetLayer,offsetErase:Boolean(settings.offsetErase),multiple:false,source:null,sourcePoint:null,first:null,lastPointer:null,plan:null,history:[]};
   const prompt=()=>port.prompt(id,draft.phase,draft),clearPreview=()=>{draft.plan=null;port.preview(null);};
   const sourceReset=()=>{draft.source=null;draft.sourcePoint=null;draft.first=null;draft.phase='source';port.source(null);clearPreview();prompt();};
   const getPoint=e=>{if(e.type==='point')return port.resolve(e.point,draft.first||draft.sourcePoint);if(e.type==='text'){const p=port.parsePoint(e.text,{base:draft.first||draft.sourcePoint,direction:draft.lastPointer&&draft.first?{x:draft.lastPointer.x-draft.first.x,y:draft.lastPointer.y-draft.first.y}:null});return p.ok?p.point:null;}return null;};
   function compute(e){draft.failure=null;const p=getPoint(e),source=draft.source;if(!p||!source)return null;
    if(id==='O'){const n=draft.through?(root.cadPolyline?.is(source)?root.cadPolyline.nearest(source,p):root.geometryQuery.projectNearest(source,p)):null,distance=draft.through?n?.distance:draft.distance;const plan=root.cadPolyline?.is(source)?root.cadPolyline.offset(source,distance,p):ops.offset(source,distance,p);if(plan){if(draft.offsetLayer==='current')for(const o of plan.after)o.cadLayer=port.layer();if(draft.offsetErase){plan.before=[source];for(const o of plan.after)o.id='__offset_new_owner__';}}return plan;}
    if(id==='BR')return root.cadPolyline?.is(source)?root.cadPolyline.breakBetween(source,draft.first,p):['cadCircle','cadArc','cadEllipse'].includes(source.type)?root.cadCurveOperations.breakBetween(source,draft.first,p):ops.breakLine(source,draft.first,p);
    const target=port.pick(e.point||p);if(!target||!port.allowed(target.id))return null;
    if(id==='J')return root.cadJoin?root.cadJoin.pair(source,target):root.cadPolyline?.is(source)?root.cadPolyline.joinOpen(source,target):['cadArc','cadEllipse'].includes(source.type)?root.cadCurveOperations.join(source,target):ops.join(source,target);
    if(root.cadPolyline?.is(source)){if(target.id!==source.id)return null;return root.cadPolylineCorners.corner(source,draft.sourcePoint,e.point||p,e.shift?0:draft.distance,{kind:id==='CH'?'CHAMFER':'FILLET',distance2:e.shift?0:draft.distance2,angle:draft.angle,trim:draft.trim});}

    return id==='CH'?e.shift?ops.fillet(source,draft.sourcePoint,target,e.point||p,0,{trim:draft.trim}):ops.chamfer(source,draft.sourcePoint,target,e.point||p,draft.distance,{distance2:e.shift?0:draft.distance2,angle:draft.angle,trim:draft.trim,layer:port.layer()}):ops.fillet(source,draft.sourcePoint,target,e.point||p,e.shift?0:draft.distance,{trim:draft.trim});
   }
   function apply(plan){if(plan?.noChange){if(draft.multiple)sourceReset();else port.finish();return{ok:true,code:'no-change'};}if(!plan)return{ok:false,code:'no-valid-result'};if(id==='O'||id==='J'||draft.multiple){if(!port.commit(id,plan))return{ok:false,code:'no-valid-result'};draft.history.push(port.historyMark());draft.token=port.token();sourceReset();return{ok:true,code:'applied-repeat'};}return{ok:true,commit:true,value:plan};}
   prompt();return{view:()=>draft,describe:()=>({phase:draft.phase,actions:[...(id==='O'?[['T','through'],['D','distance'],['L','layer'],['E','erase']]:id==='F'?[['R','radius'],['P','polyline'],['TRIM','trim'],['M','multiple']]:id==='CH'?[['D','distance'],['A','angle'],['E','method'],['P','polyline'],['TRIM','trim'],['M','multiple']]:id==='BR'?[['F','first']]:id==='J'&&draft.source&&['cadArc','cadEllipse'].includes(draft.source.type)?[['C','close']]:[]),['U','undo']].map(([value,key])=>({id:value,labelKey:'cadEdit.'+key,active:value==='M'&&draft.multiple||value==='TRIM'&&draft.trim,enabled:value==='U'?draft.history.length>0:value==='F'?Boolean(draft.source):true}))}),
    preview(e){draft.lastPointer=e.point;if(!port.current(draft.token)){clearPreview();return{ok:false,code:'stale-context'};}if(draft.phase==='polyline'){const o=port.pick(e.point);draft.plan=o&&port.allowed(o.id)&&root.cadPolyline.is(o)?root.cadPolylineCorners.all(o,draft.distance,{kind:id==='CH'?'CHAMFER':'FILLET',distance2:draft.distance2,angle:draft.angle,trim:draft.trim}):null;}else draft.plan=['result','second'].includes(draft.phase)?compute({...e,type:'point'}):null;port.preview(draft.plan);return{ok:true};},
    input(e){if(!port.current(draft.token)){clearPreview();return{ok:false,code:'stale-context'};}
     const key=e.type==='keyword'?String(e.value).toUpperCase():e.type==='text'?String(e.text).trim().toUpperCase():'';
     if(['U','UNDO'].includes(key)){const h=draft.history.at(-1);if(!h||!port.undoOwn(h))return{ok:false,code:'nothing-to-back'};draft.history.pop();draft.token=port.token();sourceReset();return{ok:true};}
     if(id==='J'&&draft.source&&['C','CLOSE'].includes(key))return apply(root.cadJoin?.close(draft.source));
     if(e.type==='enter'&&draft.phase!=='distance'){port.finish();return{ok:true};}
     if(id==='O'&&draft.phase==='offsetLayer'){if(!['S','SOURCE','C','CURRENT'].includes(key))return{ok:false,code:'invalid-keyword'};draft.offsetLayer=['C','CURRENT'].includes(key)?'current':'source';settings.offsetLayer=draft.offsetLayer;save();sourceReset();return{ok:true};}
     if(id==='O'&&draft.phase==='offsetErase'){if(!['Y','YES','N','NO'].includes(key))return{ok:false,code:'invalid-keyword'};draft.offsetErase=['Y','YES'].includes(key);settings.offsetErase=draft.offsetErase;save();sourceReset();return{ok:true};}
     if(id==='O'&&['L','LAYER','E','ERASE'].includes(key)){draft.phase=key.startsWith('L')?'offsetLayer':'offsetErase';prompt();return{ok:true};}
     if(id==='O'&&['T','THROUGH'].includes(key)){draft.through=true;sourceReset();return{ok:true};}
     if(['M','MULTIPLE'].includes(key)&&['F','CH'].includes(id)){draft.multiple=!draft.multiple;prompt();return{ok:true};}
     if(draft.phase==='trimChoice'){if(!['T','TRIM','Y','YES','N','NO','NOTRIM'].includes(key))return{ok:false,code:'invalid-keyword'};draft.trim=['T','TRIM','Y','YES'].includes(key);settings.trim=draft.trim;save();sourceReset();return{ok:true};}
     if(['TRIM','T'].includes(key)&&['F','CH'].includes(id)){draft.phase='trimChoice';prompt();return{ok:true};}
     if(id==='CH'&&draft.phase==='methodChoice'){if(!['D','DISTANCE','A','ANGLE'].includes(key))return{ok:false,code:'invalid-keyword'};settings.chamferMethod=key.startsWith('A')?'angle':'distance';draft.angle=key.startsWith('A')?settings.chamferAngle:null;save();sourceReset();return{ok:true};}if(id==='CH'&&['E','METHOD'].includes(key)){draft.phase='methodChoice';prompt();return{ok:true};}
     if(['D','DISTANCE','R','RADIUS'].includes(key)&&['O','F','CH'].includes(id)){draft.phase='distance';draft.through=false;if(id==='CH'){draft.angle=null;settings.chamferMethod='distance';}prompt();return{ok:true};}
     if(id==='BR'&&['F','FIRST'].includes(key)&&draft.source){draft.phase='first';prompt();return{ok:true};}
     if(['F','CH'].includes(id)&&['P','POLYLINE'].includes(key)){draft.phase='polyline';prompt();return{ok:true};}
     if(['F','CH'].includes(id)&&draft.phase==='polyline'){const o=e.type==='point'?port.pick(e.point):null;if(!o||!port.allowed(o.id)||!root.cadPolyline?.is(o))return{ok:false,code:'unsupported-geometry'};return apply(root.cadPolylineCorners.all(o,draft.distance,{kind:id==='CH'?'CHAMFER':'FILLET',distance2:draft.distance2,angle:draft.angle,trim:draft.trim}));}
     if(id==='CH'&&['A','ANGLE'].includes(key)){draft.phase='angleDistance';prompt();return{ok:true};}
     if(draft.phase==='angleDistance'){const v=port.parseLength(e.text);if(!v?.ok||v.mm<0)return{ok:false,code:'invalid-distance'};draft.distance=v.mm;draft.phase='angleValue';prompt();return{ok:true};}
     if(draft.phase==='angleValue'){const a=Number(e.text);if(!(a>0&&a<180))return{ok:false,code:'invalid-angle'};draft.angle=a;settings.chamferAngle=a;settings.chamferMethod='angle';settings.chamfer=draft.distance;save();sourceReset();return{ok:true};}
     if(draft.phase==='distance'||draft.phase==='distance2'||draft.phase==='source'&&['F','CH'].includes(id)&&key&&!keys.includes(key)){
      const v=e.type==='enter'?{ok:true,mm:draft.distance}:e.type==='text'?port.parseLength(e.text):null;
      if(v?.ok){if(!Number.isFinite(v.mm)||v.mm<(id==='O'?1e-8:0))return{ok:false,code:'invalid-distance'};if(draft.phase==='distance2'){draft.distance2=v.mm;settings.chamfer2=v.mm;save();sourceReset();return{ok:true};}draft.distance=v.mm;settings[id==='O'?'offset':id==='F'?'fillet':'chamfer']=v.mm;
       if(id==='CH'&&draft.phase==='distance'){draft.phase='distance2';prompt();return{ok:true};}if(id==='CH'){draft.distance2=v.mm;settings.chamfer2=v.mm;}save();sourceReset();return{ok:true};}
      if(draft.phase!=='source')return{ok:false,code:'invalid-distance'};
     }
     if(draft.phase==='source'){const obj=e.type==='point'?port.pick(e.point):null;if(!obj||!port.allowed(obj.id))return{ok:false,code:'target-not-modifiable'};
      const supported=id==='O'?(['cadLine','cadCircle','cadArc'].includes(obj.type)||root.cadPolyline?.is(obj)):id==='BR'?(['cadLine','cadCircle','cadArc','cadEllipse'].includes(obj.type)||root.cadPolyline?.is(obj)):id==='J'?(['cadLine','cadArc','cadEllipse'].includes(obj.type)||root.cadPolyline?.is(obj)&&!obj.closed):(obj.type==='cadLine'||root.cadPolyline?.is(obj)||id==='F'&&['cadCircle','cadArc'].includes(obj.type));
      if(!supported)return{ok:false,code:'unsupported-geometry'};draft.source=obj;draft.sourcePoint=e.point;port.source(obj.id);draft.phase=['J','F','CH'].includes(id)?'second':'result';if(id==='BR')draft.first=(root.cadPolyline?.is(obj)?root.cadPolyline.nearest(obj,e.point):root.geometryQuery.projectNearest(obj,e.point))?.point;prompt();return{ok:true};}
     if(draft.phase==='first'){const p=getPoint(e);if(!p)return{ok:false,code:'invalid-coordinate'};draft.first=(root.cadPolyline?.is(draft.source)?root.cadPolyline.nearest(draft.source,p):root.geometryQuery.projectNearest(draft.source,p))?.point;if(!draft.first)return{ok:false,code:'no-valid-result'};draft.phase='result';prompt();return{ok:true};}
     if(id==='BR'&&key==='@')return apply(root.cadPolyline?.is(draft.source)?root.cadPolyline.breakBetween(draft.source,draft.first,draft.first):['cadCircle','cadArc','cadEllipse'].includes(draft.source?.type)?root.cadCurveOperations.breakBetween(draft.source,draft.first,draft.first):ops.breakLine(draft.source,draft.first,draft.first));
     const plan=compute(e);if(!plan){clearPreview();return{ok:false,code:draft.failure||'no-valid-result'};}draft.plan=plan;port.preview(plan);return apply(plan);
    },commit(plan){if(!port.current(draft.token))throw Error('stale-context');return port.commit(id,plan);},cancel:()=>port.clear(),finalize:()=>port.clear()
   };
  }});
 }
 root.nativeModifyCommands=Object.freeze({install,ids:definitions.map(d=>d[0]),keyword:(id,phase,key)=>definitions.some(d=>d[0]===id)&&keys.includes(key),resolve:raw=>definitions.find(d=>d.includes(String(raw).toUpperCase()))?.[0]||null});
})();
