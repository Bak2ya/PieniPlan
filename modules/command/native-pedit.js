/* PEDIT options share existing polyline topology, history and geometry owners. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},copy=o=>JSON.parse(JSON.stringify(o));
 const keys=['LTYPEGEN','LT','ON','OFF','M','MULTIPLE','W','WIDTH','F','FIT','S','SPLINE','D','DECURVE','E','EDIT','V','VERTEX','C','CLOSE','O','OPEN','R','REVERSE','J','JOIN','U','UNDO','Y','YES','N','NO','P','PREVIOUS','NEXT','X','EXIT','I','INSERT','MOVE','DELETE','L','LINE','A','ARC','T','TANGENT','Q','QUADRATIC','CUBIC','B','BREAK','STRAIGHTEN','G','GO','JT','JOINTYPE','EX','EXTEND','ADD','BOTH','REGEN'];
 function create(port){const P=root.cadPolyline,G=root.geometryQuery,d={phase:'source',token:port.token(),sources:[],source:null,multiple:false,history:[],vertex:0,startWidth:0,pointer:null,jointype:'add',markVertex:0};
  let joinDraft=null;
  const sync=()=>{d.sources=d.sources.map(o=>port.byId(o.id)).filter(Boolean);d.source=d.sources[0]||null;},prompt=()=>{if(d.source&&d.vertex>=(d.source.vertices?.length||0))d.vertex=Math.max(0,(d.source.vertices?.length||0)-1);port.prompt('PE',d.phase,{...d,messageKey:'cad89.pe.'+d.phase});},refresh=()=>{sync();d.token=port.token();joinDraft=null;port.preview(null);port.select(d.sources.map(o=>o.id));prompt();};
  function asPoly(o){
   if(P.is(o))return o;
   if(!['cadLine','cadArc'].includes(o?.type))return null;
   const arc=o.type==='cadArc';
   if(arc&&Math.abs(o.sweep)>=360-1e-8)return null;
   const a=arc?G.pointAt(o,o.startAngle):o.a,b=arc?G.pointAt(o,o.startAngle+o.sweep):o.b;
   if(!a||!b||![a.x,a.y,b.x,b.y].every(Number.isFinite)||Math.hypot(b.x-a.x,b.y-a.y)===0)return null;
   const vertices=[
    {...a,id:'__join_new_cadVertex_'+o.id+'_start__',outgoing:{id:'__join_new_cadEdge_'+o.id+'_original__',bulge:arc?Math.tan(o.sweep*Math.PI/720):0}},
    {...b,id:'__join_new_cadVertex_'+o.id+'_end__'}
   ];
   const q={...copy(o),type:'cadPolyline',closed:false,vertices};
   for(const k of ['a','b','center','radius','startAngle','sweep'])delete q[k];
   return P.validate(q);
  }
  function apply(plan,next=d.phase,{restoreJoinSelection=false}={}){
   if(plan?.before?.length&&plan.before.length===plan.after?.length&&JSON.stringify(plan.before)===JSON.stringify(plan.after)){
    d.phase=next;refresh();return{ok:true};
   }
   if(!plan||!port.commit('PE',plan))return{ok:false,code:'no-valid-result'};
   d.history.push({mark:port.historyMark(),sources:restoreJoinSelection?d.sources.slice():null});
   d.phase=next;refresh();return{ok:true};
  }
  function joinPlan(owners,{fuzz=0,jointype='add',multiple=false}={}){
   const parts=owners.map(asPoly);
   const endpoints=o=>[o.vertices[0],o.vertices.at(-1)];
   const index=root.cadSpatialTree.create(parts.flatMap((o,i)=>!o||o.closed||o.curveFit?.knots?[]:
    endpoints(o).map(({x,y})=>({i,b:{minx:x,miny:y,maxx:x,maxy:y}}))));
   const tolerance=Math.max(fuzz,G.tolerance.model);
   const visited=new Set(),before=[],after=[];
   for(let i=0;i<(multiple?parts.length:1);i++){
    let merged=parts[i];
    if(visited.has(i)||!merged||merged.closed||merged.curveFit?.knots)continue;
    visited.add(i);
    const chain=[owners[i]];
    while(true){
     const candidates=new Set();
     for(const {x,y} of endpoints(merged)){
      for(const {i:target} of index.query({minx:x-tolerance,miny:y-tolerance,maxx:x+tolerance,maxy:y+tolerance})){
       if(!visited.has(target))candidates.add(target);
      }
     }
     let joined=false;
     for(const target of [...candidates].sort((a,b)=>a-b)){
      const plan=P.joinOpen(merged,parts[target],{fuzz,jointype,inheritProperties:true});
      if(!plan)continue;
      merged=plan.after[0];visited.add(target);chain.push(owners[target]);joined=true;
      break;
     }
     if(!joined)break;
    }
    if(chain.length>1){before.push(...chain);after.push(merged);}
   }
   return after.length?{before,after,topology:'cadPolyline'}:null;
  }
  function joinFuzzDistance(e){
   if(e.type==='enter')return 0;
   const distance=e.type==='text'?port.parseLength(e.text):null;
   return distance?.ok&&Number.isFinite(distance.mm)&&distance.mm>=0?distance.mm:null;
  }
  function planJoinFuzz(fuzz){
   if(!d.sources.every(o=>port.allowed(o.id)))return null;
   if(joinDraft?.fuzz!==fuzz||joinDraft?.jointype!==d.jointype){
    joinDraft={fuzz,jointype:d.jointype,plan:joinPlan(d.sources,{fuzz,jointype:d.jointype,multiple:true})};
   }
   return joinDraft.plan;
  }
  function previewJoin(e){
   if(d.phase==='joinFuzz'){
    const fuzz=joinFuzzDistance(e);
    port.preview(fuzz===null?null:planJoinFuzz(fuzz));
   }else{
    const target=e.point&&port.pick(e.point);
    port.preview(target&&target.id!==d.source.id&&port.allowed(target.id)&&port.allowed(d.source.id)
     ?joinPlan([d.source,target]):null);
   }
   return {ok:true};
  }
  function all(fn){const plans=d.sources.map(fn);if(!plans.length||plans.some(p=>!p))return null;return{before:plans.flatMap(p=>p.before),after:plans.flatMap(p=>p.after),topology:'cadPolyline'};}
  function point(e){const base=d.source?.vertices?.[d.vertex];if(e.type==='point')return e.point&&port.resolve(e.point,base);if(e.type==='text'){const q=port.parsePoint(e.text,{base});return q?.ok?q.point:null;}return null;}
  const numericAngle=e=>e.type==='text'?(root.cadUnits?.parseAngle?root.cadUnits.parseAngle(e.text).degrees:Number(e.text)):NaN;
  function bulgePlan(n){return Number.isFinite(n)&&Math.abs(n)<360&&Math.abs(n)>=1e-8?P.segment(d.source,d.vertex,Math.tan(n*(port.angleSign?.()??1)*Math.PI/720)):null;}
  function tangentPlan(e){
   const vertex=d.source.vertices[d.vertex];
   const numeric=numericAngle(e);
   const target=Number.isFinite(numeric)?null:point({...e,type:e.type||'point'});
   if(target&&Math.hypot(target.x-vertex.x,target.y-vertex.y)<1e-8)return {code:'invalid-angle'};
   const angle=target?Math.atan2(target.y-vertex.y,target.x-vertex.x)*180/Math.PI
    :Number.isFinite(numeric)?(port.angleToWorld?.(numeric)??numeric):NaN;
   if(!Number.isFinite(angle))return {code:'invalid-angle'};
   const after=copy(d.source);
   after.vertices[d.vertex].tangent=angle;
   try{
    P.validate(after);
    if(after.curveFit?.kind==='arc')root.cadPolylineFit.derive(after);
   }catch{return {code:'no-valid-result'};}
   return {plan:{before:[d.source],after:[after],topology:'cadPolyline'}};
  }
  const choosingRange=()=>d.phase==='breakVertices'||d.phase==='straightenVertices';
  function rangePlan(){
   return d.phase==='breakVertices'?P.breakVertices(d.source,d.markVertex,d.vertex)
    :P.straighten(d.source,d.markVertex,d.vertex,{direction:d.walkDirection||1});
  }
  function moveVertexMarker(direction){
   d.walkDirection=direction;
   const count=d.source.vertices.length;
   const next=d.vertex+direction;
   d.vertex=d.source.closed?(next+count)%count:Math.max(0,Math.min(count-1,next));
  }
  function prepend(p){const o=d.source;if(!p||o.closed)return null;const q=copy(o),first=q.vertices[0],w=first.outgoing?.startWidth||0;q.vertices.unshift({id:'__vertexedit_new_cadVertex_prepend__',x:p.x,y:p.y,outgoing:{id:'__vertexedit_new_cadEdge_prepend__',bulge:0,...(w?{startWidth:w,endWidth:w}:{})}});if(q.curveFit?.knots)delete q.curveFit.knots;try{P.validate(q);if(q.curveFit)root.cadPolylineFit.derive(q);}catch{return null;}return{before:[o],after:[q],topology:'cadPolyline'};}
  const actions=()=>d.phase==='source'?[['M','multiple']]:d.phase==='convert'?[['Y','yes'],['N','no']]:d.phase==='vertex'?[['N','next'],['P','previous'],['MOVE','move'],['I','insert'],['DELETE','delete'],['L','line'],['A','arc'],['T','tangent'],['B','break'],['S','straighten'],['REGEN','regen'],['W','segmentWidth'],['X','exit']]:['breakVertices','straightenVertices'].includes(d.phase)?[['N','next'],['P','previous'],['G','go'],['X','exit']]:d.phase==='joinFuzz'?[['JT','jointype']]:d.phase==='joinType'?[['EX','extend'],['ADD','add'],['BOTH','both']]:d.phase==='options'?[['L','ltypegen'],['C','close'],['O','open'],['R','reverse'],['J','join'],['W','width'],['F','fit'],['S','spline'],['D','decurve'],...(!d.multiple?[['E','vertex']]:[])]:[];
  prompt();return{view:()=>d,describe:()=>({phase:d.phase,pointBase:['moveVertex','insertVertex','prependVertex94','arcMidVertex94','tangent'].includes(d.phase)?d.source?.vertices[d.vertex]:undefined,actions:[...actions(),['U','undo']].map(([id,k])=>({id,labelKey:'cad89.'+k,enabled:id==='U'?d.history.length>0:id==='C'?d.sources.some(o=>!o.closed):id==='O'?d.sources.some(o=>o.closed):true}))}),
   preview(e){if(!port.current(d.token)){port.preview(null);return{ok:false,code:'stale-context'};}if(choosingRange())return{ok:true};if(d.phase==='join'||d.phase==='joinFuzz')return previewJoin(e);if(d.phase==='tangent'){port.preview(tangentPlan(e).plan??null);return{ok:true};}if(d.phase==='bulge'){port.preview(bulgePlan(numericAngle(e)));return{ok:true};}if(['width','widthEnd'].includes(d.phase)){const v=e.type==='text'&&String(e.text||'').trim()!==''?port.parseLength(e.text):null,plan=v?.ok&&v.mm>=0?(d.phase==='width'?all(o=>root.cadPolylineWidth.set(o,v.mm)):root.cadPolylineWidth.set(d.source,d.startWidth,v.mm,d.vertex)):null;port.preview(plan);return{ok:true};}if(!['moveVertex','insertVertex','prependVertex94','arcMidVertex94'].includes(d.phase)){port.preview(null);return{ok:true};}e={...e,type:e.type||'point'};const q=point(e);d.pointer=q;if(!q||![q.x,q.y].every(Number.isFinite)){port.preview(null);return{ok:true};}if(d.phase==='moveVertex')port.preview(P.moveVertex(d.source,d.vertex,q));else if(d.phase==='insertVertex')port.preview(P.insertVertex(d.source,d.vertex,q,{reshape:true}));else if(d.phase==='arcMidVertex94'){const b=d.source.vertices[(d.vertex+1)%d.source.vertices.length],g=b&&root.cadCreation.arc3(d.source.vertices[d.vertex],b,q);port.preview(g?P.segment(d.source,d.vertex,Math.tan(g.sweep*Math.PI/720)):null);}else if(d.phase==='prependVertex94')port.preview(prepend(q));return{ok:true};},
   input(e){if(!port.current(d.token)){port.preview(null);return{ok:false,code:'stale-context'};}
    if(e.type==='vertexAction'&&d.phase==='source'){const o=port.byId(e.objectId),index=o?.vertices?.findIndex(v=>v.id===e.vertexId);if(!P.is(o)||!port.allowed(o.id)||index<0)return{ok:false,code:'target-not-modifiable'};d.sources=[o];d.source=o;d.vertex=index;d.phase='vertex';port.select([o.id]);if(e.action==='remove')return apply(P.deleteVertex(o,index,{straighten:true}),'vertex');if(e.action==='line')return apply(P.segment(o,index,0),'vertex');d.phase=e.action==='add'?'insertVertex':e.action==='arc'?'arcMidVertex94':e.action==='extendStart'?'prependVertex94':'moveVertex';prompt();return{ok:true};}
const k=String(e.type==='keyword'?e.value:e.text||'').trim().toUpperCase();
    if(e.type==='selection'&&['source','multiple'].includes(d.phase)){
     const ids=[...new Set(e.ids||[])];
     if(d.phase==='source'&&(e.remove||ids.length!==1))return{ok:false,code:'unsupported-geometry'};
     if(e.remove){
      const removed=new Set(ids);
      d.sources=d.sources.filter(o=>!removed.has(o.id));
     }else{
      const picked=ids.map(port.byId).filter(o=>o&&port.allowed(o.id)&&asPoly(o));
      if(!picked.length)return{ok:false,code:'unsupported-geometry'};
      const existing=new Set(d.sources.map(o=>o.id));
      d.sources.push(...picked.filter(o=>!existing.has(o.id)));
     }
     d.source=d.sources[0]||null;
     if(d.phase==='source')d.phase=P.is(d.source)?'options':'convert';
     port.select(d.sources.map(o=>o.id));prompt();return{ok:true};
    }
    if(['U','UNDO'].includes(k)){
     const h=d.history.at(-1);
     if(!h||!port.undoOwn(h.mark))return{ok:false,code:'nothing-to-back'};
     d.history.pop();
     if(h.sources)d.sources=h.sources;
     d.phase=d.sources.length?'options':'source';refresh();return{ok:true};
    }
    if(d.phase==='source'&&['M','MULTIPLE'].includes(k)){d.multiple=true;d.phase='multiple';prompt();return{ok:true};}
    if(['source','multiple'].includes(d.phase)){if(e.type==='enter'){if(!d.sources.length){port.finish();return{ok:true};}d.phase=d.sources.some(o=>!P.is(o))?'convert':'options';prompt();return{ok:true};}const o=e.type==='point'?port.pick(e.point):null;if(!o||!port.allowed(o.id)||!asPoly(o))return{ok:false,code:'unsupported-geometry'};if(e.shift)d.sources=d.sources.filter(q=>q.id!==o.id);else if(!d.sources.some(q=>q.id===o.id))d.sources.push(o);d.source=d.sources[0]||null;port.select(d.sources.map(o=>o.id));if(!d.multiple)d.phase=P.is(o)?'options':'convert';prompt();return{ok:true};}
    if(d.phase==='convert'){if(['N','NO'].includes(k)){port.finish();return{ok:true};}if(e.type!=='enter'&&!['Y','YES'].includes(k))return{ok:false,code:'invalid-keyword'};const sources=d.sources.filter(o=>!P.is(o)),after=sources.map(asPoly);return apply({before:sources,after,topology:'cadPolyline'},'options');}
    if(d.phase==='ltypegen'){const value=['Y','YES','1','ON'].includes(k)?true:['N','NO','0','OFF'].includes(k)?false:e.type==='enter'?Boolean(d.source.linetypeGeneration):null;if(value===null)return{ok:false,code:'invalid-keyword'};return apply(all(o=>({before:[o],after:[{...o,linetypeGeneration:value}]})),'options');}
    if(d.phase==='options'&&['L','LT','LTYPEGEN'].includes(k)){d.phase='ltypegen';prompt();return{ok:true};}
    if(d.phase==='width'||d.phase==='segmentWidth'||d.phase==='widthEnd'){const v=port.parseLength(e.text);if(!v?.ok||v.mm<0)return{ok:false,code:'invalid-distance'};if(d.phase==='segmentWidth'){d.startWidth=v.mm;d.phase='widthEnd';prompt();return{ok:true};}return apply(d.phase==='width'?all(o=>root.cadPolylineWidth.set(o,v.mm)):root.cadPolylineWidth.set(d.source,d.startWidth,v.mm,d.vertex),d.phase==='width'?'options':'vertex');}
    if(d.phase==='splineDegree'){const degree=['Q','QUADRATIC','2'].includes(k)?2:e.type==='enter'||['C','CUBIC','3'].includes(k)?3:null;if(!degree)return{ok:false,code:'invalid-keyword'};return apply(all(o=>root.cadPolylineFit.set(o,'spline',degree)),'options');}
    if(d.phase==='joinFuzz'&&['J','JT','JOINTYPE'].includes(k)){d.phase='joinType';joinDraft=null;port.preview(null);prompt();return{ok:true};}
    if(d.phase==='joinType'){const type={EX:'extend',EXTEND:'extend',A:'add',ADD:'add',B:'both',BOTH:'both'}[k];if(!type)return{ok:false,code:'invalid-keyword'};d.jointype=type;d.phase='joinFuzz';prompt();return{ok:true};}
    if(d.phase==='joinFuzz'){
     if(d.sources.some(o=>o.curveFit?.knots))return{ok:false,code:'exact-spline-use-join'};
     const fuzz=joinFuzzDistance(e);
     if(fuzz===null){port.preview(null);return{ok:false,code:'invalid-distance'};}
     if(!d.sources.every(o=>port.allowed(o.id))){port.preview(null);return{ok:false,code:'target-not-modifiable'};}
     const plan=planJoinFuzz(fuzz);
     if(!plan)port.preview(null);
     return apply(plan,'options',{restoreJoinSelection:true});
    }
    if(d.phase==='join'){
     port.preview(null);
     if(e.type==='enter'){d.phase='options';prompt();return{ok:true};}
     if(e.type==='selection'&&e.remove)return{ok:true};
     if(!port.allowed(d.source.id))return{ok:false,code:'target-not-modifiable'};
     if(e.type==='selection'){
      const targets=[...new Set(e.ids||[])].filter(id=>id!==d.source.id&&port.allowed(id)).map(port.byId).filter(Boolean);
      if(targets.length&&targets.every(o=>o.curveFit?.knots))return{ok:false,code:'exact-spline-use-join'};
      return apply(joinPlan([d.source,...targets]),'join');
     }
     const target=e.type==='point'?port.pick(e.point):null;
     if(!target||!port.allowed(target.id))return{ok:false,code:'target-not-modifiable'};
     if(target.curveFit?.knots)return{ok:false,code:'exact-spline-use-join'};
     return apply(target.id===d.source.id?null:joinPlan([d.source,target]),'join');
    }
    if(d.phase==='moveVertex'){const p=point(e);return p?apply(P.moveVertex(d.source,d.vertex,p),'vertex'):{ok:false,code:'invalid-coordinate'};}
    if(d.phase==='insertVertex'){const p=point(e);return p?apply(P.insertVertex(d.source,d.vertex,p,{reshape:true}),'vertex'):{ok:false,code:'invalid-coordinate'};}
    if(d.phase==='prependVertex94'){const p=point(e);return p?apply(prepend(p),'vertex'):{ok:false,code:'invalid-coordinate'};}
    if(d.phase==='arcMidVertex94'){const p=point(e),b=d.source.vertices[(d.vertex+1)%d.source.vertices.length],g=p&&b&&root.cadCreation.arc3(d.source.vertices[d.vertex],b,p);return g?apply(P.segment(d.source,d.vertex,Math.tan(g.sweep*Math.PI/720)),'vertex'):{ok:false,code:'invalid-arc'};}

    if(d.phase==='bulge'){
     const angle=numericAngle(e);
     if(!Number.isFinite(angle)||Math.abs(angle)>=360||Math.abs(angle)<1e-8)return {ok:false,code:'invalid-angle'};
     return apply(bulgePlan(angle),'vertex');
    }
    if(d.phase==='tangent'){
     const {plan,code}=tangentPlan(e);
     if(!plan){port.preview(null);return {ok:false,code};}
     return apply(plan,'vertex');
    }
    if(choosingRange()){
     if(['X','EXIT'].includes(k)){d.phase='vertex';port.preview(null);prompt();return{ok:true};}
     if(e.type==='enter'||['N','NEXT','P','PREVIOUS'].includes(k)){
      moveVertexMarker(k.startsWith('P')?-1:1);
      port.preview(rangePlan());prompt();return{ok:true};
     }
     if(['G','GO'].includes(k))return apply(rangePlan(),'vertex');
     return {ok:false,code:'invalid-keyword'};
    }
    if(d.phase==='vertex'){if(['X','EXIT'].includes(k)){d.phase='options';prompt();return{ok:true};}if(e.type==='enter'||['N','NEXT','P','PREVIOUS'].includes(k)){moveVertexMarker(k.startsWith('P')?-1:1);port.select([d.source.id]);prompt();return{ok:true};}if(['B','BREAK','S','STRAIGHTEN'].includes(k)){d.markVertex=d.vertex;d.walkDirection=1;d.phase=k.startsWith('B')?'breakVertices':'straightenVertices';port.preview(rangePlan());prompt();return{ok:true};}if(['R','REGEN'].includes(k)){P.invalidate(d.source);P.get(d.source);refresh();return{ok:true};}if(['W','WIDTH'].includes(k)){d.phase='segmentWidth';prompt();return{ok:true};}if(k==='MOVE'||k==='I'||k==='INSERT'||k==='A'||k==='ARC'||k==='T'||k==='TANGENT'){d.phase=k==='MOVE'?'moveVertex':k==='I'||k==='INSERT'?'insertVertex':k==='T'||k==='TANGENT'?'tangent':'bulge';prompt();return{ok:true};}if(['L','LINE'].includes(k))return apply(P.segment(d.source,d.vertex,0));if(k==='DELETE')return apply(P.deleteVertex(d.source,d.vertex,{straighten:true}));return{ok:false,code:'invalid-keyword'};}
    if(e.type==='enter'){port.finish();return{ok:true};}
    if(['J','JOIN'].includes(k)&&d.sources.some(o=>o.curveFit?.knots))return{ok:false,code:'exact-spline-use-join'};
    if(['W','WIDTH','J','JOIN','E','EDIT','V','VERTEX','S','SPLINE'].includes(k)){d.phase=k.startsWith('W')?'width':k.startsWith('J')?d.multiple?'joinFuzz':'join':k.startsWith('S')?'splineDegree':'vertex';d.vertex=0;prompt();return{ok:true};}
    if(['F','FIT','D','DECURVE'].includes(k))return apply(all(o=>root.cadPolylineFit.set(o,k.startsWith('F')?'arc':'decurve')),'options');
    if(['R','REVERSE'].includes(k))return apply(all(o=>({before:[o],after:[P.reverse(o)]})),'options');
    if(['C','CLOSE','O','OPEN'].includes(k)){const close=k.startsWith('C');return apply(all(o=>o.closed===close?{before:[o],after:[o]}:P.setClosed(o,close)),'options');}
    return{ok:false,code:'invalid-keyword'};
   },commit:plan=>port.commit('PE',plan),cancel:()=>port.clear(),finalize:()=>port.clear()
  };
 }
 root.nativePedit=Object.freeze({create,keyword:k=>keys.includes(k)});
})();
