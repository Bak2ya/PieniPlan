/* Grouped exact-source relations for explicitly authored angular dimensions. */
(() => {
 'use strict';
 const M=globalThis.PieniPlanModules,A=M.cadAngularPlacement,S=M.cadAngularSource,
  
  clone=q=>JSON.parse(JSON.stringify(q)),equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
  grouped=o=>o.kind==='angular'&&['lines','arc','circle'].includes(o.angularPlacement98?.method),
  fields=a=>a.method==='circle'?['vertex','ray1']:['vertex','ray1','ray2'];
 function slots(o){return grouped(o)?o.angularPlacement98.method==='circle'?['angularSource','ray2']:['angularSource']:M.cadDimensionPartial.slots(o);}
 function relation(o,anchors={},lost={}){
  if(!grouped(o))return M.cadDimensionPartial.relation(o,anchors,lost);
  anchors=clone(anchors);lost=clone(lost);if(!Object.keys(anchors).length&&!Object.keys(lost).length)return null;
  return{version:2,status:!Object.keys(anchors).length?'detached':slots(o).every(s=>anchors[s])?'current':'partial',anchors,...(Object.keys(lost).length?{lost}:{})};
 }
 function dependencies(anchor){return anchor.kind==='angularPoint99'?S.pointDependencies(anchor):anchor.kind==='angular98'?S.dependencies(anchor):[anchor.sourceId];}
 function sourceIds(o,{lost=false}={}){return[...new Set(Object.values({...o.association?.anchors,...(lost?o.association?.lost:{})}).flatMap(dependencies))];}
 function validate(o){
  if(!grouped(o))return M.cadDimensionAssociation.validate(o);
  A.validate(o.angularPlacement98);const r=o.association;if(!r)return;
  if(r.version!==2||Object.keys(r).some(k=>!['version','status','anchors','lost'].includes(k))||!r.anchors||typeof r.anchors!=='object'||Array.isArray(r.anchors)||r.lost!==undefined&&(!r.lost||typeof r.lost!=='object'||Array.isArray(r.lost)||!Object.keys(r.lost).length))throw Error('invalid-angular-association');
  const active=Object.keys(r.anchors),lost=Object.keys(r.lost||{});
  if(!active.length&&!lost.length||active.some(k=>lost.includes(k))||[...active,...lost].some(k=>!slots(o).includes(k))||relation(o,r.anchors,r.lost).status!==r.status)throw Error('invalid-angular-association');
  for(const [slot,a]of Object.entries({...r.anchors,...r.lost})){
   if(slot==='angularSource'){S.validate(a);if(a.method!==o.angularPlacement98.method||dependencies(a).includes(o.id))throw Error('invalid-angular-source');}
   else{const probe={...o,angularPlacement98:undefined,association:{version:2,status:'partial',anchors:{ray2:a}}};M.cadDimensionAssociation.validate(probe);}
  }
 }
 function resolve(a,byId){return a.kind==='angular98'?S.value(a,byId):M.cadDimensionAssociation.resolve(a,byId);}
 function release(o,which){if(!grouped(o))return M.cadDimensionPartial.release(o,which);const q=clone(o),a=q.association.anchors,lost=q.association.lost||{};for(const slot of which)if(a[slot]){lost[slot]=a[slot];delete a[slot];}q.association=relation(q,a,lost);return q;}
 function geometry(o){return o.angularPlacement98?A.geometry(o):M.cadAnnotation2.geometry(o);}
 function cache(o){const g=geometry(o);if(!g)return null;const segments=[...g.extensions];for(const arc of g.dimensionArcs){const n=Math.max(4,Math.ceil(Math.abs(arc.sweep)/12));for(let i=0;i<n;i++)segments.push({a:M.cadAnnotation2.pointAt(arc.center,arc.radius,arc.startAngle+arc.sweep*i/n),b:M.cadAnnotation2.pointAt(arc.center,arc.radius,arc.startAngle+arc.sweep*(i+1)/n)});}return segments;}
 function regenerate(o,byId){
  if(!grouped(o))return M.cadDimensionAssociation.regenerate(o,byId);
  if(o.association?.version!==2||!Object.keys(o.association.anchors).length)return o;
  let q=clone(o);const anchors=q.association.anchors,lost=q.association.lost||{},changed=[];
  for(const [slot,a]of Object.entries(anchors)){
   const v=resolve(a,byId);if(!v){lost[slot]=a;delete anchors[slot];continue;}
   const ks=slot==='angularSource'?fields(a):[slot];for(const k of ks)q[k]=clone(slot==='angularSource'?v[k]:v.point);
   if(ks.some(k=>!equal(o[k],q[k])))changed.push({slot,ks});
  }
  let segments=cache(q);
  if(!segments){for(const {slot,ks}of changed){for(const k of ks)q[k]=clone(o[k]);lost[slot]=anchors[slot];delete anchors[slot];}segments=cache(q);if(!segments)return release(o,Object.keys(o.association.anchors));}
  q.association=relation(q,anchors,lost);q.segments=segments;if(changed.some(({ks})=>ks.some(k=>!equal(o[k],q[k]))))delete q.dxfPresentation;
  return equal(o,q)?o:q;
 }
 function augment(objects,changes,options={}){
  const touched=new Map(changes.map(c=>[(c.after||c.before).id,c])),next=new Map(objects.map(o=>[o.id,o]));
  const indexes=new Map(changes.map((c,i)=>[(c.after||c.before).id,i]));let positions=null;
  for(const c of changes){if(c.before)next.delete(c.before.id);if(c.after)next.set(c.after.id,c.after);}
  const result=changes.slice();
  const byId=id=>next.get(id);
  for(const original of next.values()){
   if(!grouped(original)||original.association?.version!==2||!Object.keys(original.association.anchors).length||options.defer?.(original)&&!touched.has(original.id))continue;
   const explicit=touched.get(original.id),sourceTouched=sourceIds(original).some(id=>touched.has(id));if(!explicit&&!sourceTouched)continue;let o=original;
   if(explicit){const lost=[];let anchors=null;for(const [slot,a]of Object.entries(o.association.anchors)){
    const v=resolve(a,byId),ks=slot==='angularSource'?fields(a):[slot],anchorTouched=dependencies(a).some(id=>touched.has(id));
    if(slot==='angularSource'&&a.method==='circle'&&anchorTouched){const adjusted=S.explicitCircle(a,o,byId);if(!adjusted)lost.push(slot);else if(!equal(adjusted,a)){anchors=anchors||clone(o.association.anchors);anchors[slot]=adjusted;}}
    else if(!anchorTouched&&v&&ks.some(k=>!equal(o[k],slot==='angularSource'?v[k]:v.point)))lost.push(slot);
   }if(anchors)o={...o,association:relation(o,anchors,o.association.lost)};if(lost.length)o=release(o,lost);}
   const after=regenerate(o,byId);if(equal(after,original))continue;
   if(explicit)result[indexes.get(original.id)]={...explicit,after};else{
    positions??=new Map(objects.map((owner,index)=>[owner.id,index]));
    result.push({before:original,after,index:positions.get(original.id)});
   }
  }
  return result;
 }
 function editSource(o,anchor,byId){
  if(!grouped(o)||anchor.method!==o.angularPlacement98.method)throw Error('unsupported-angular-source');
  S.validate(anchor);const q=clone(o),anchors=clone(o.association?.anchors||{}),lost=clone(o.association?.lost||{});anchors.angularSource=clone(anchor);delete lost.angularSource;
  q.association=relation(q,anchors,lost);validate(q);const after=regenerate(q,byId);if(!after.association.anchors.angularSource)throw Error('invalid-angular-source');return after;
 }
 function remap(o,idMap){if(!o.association)return clone(o);const q=clone(o);for(const a of Object.values({...q.association.anchors,...q.association.lost})){if(a.kind==='angular98'||a.kind==='angularPoint99'){const group=a.kind==='angular98'?a:a.source;for(const ref of [group.first,group.second].filter(Boolean))if(idMap.has(ref.sourceId))ref.sourceId=idMap.get(ref.sourceId);group.sourceId=group.first.sourceId;a.sourceId=group.sourceId;}else if(idMap.has(a.sourceId))a.sourceId=idMap.get(a.sourceId);}return q;}
 function edit(o,slot,point,anchor,byId){
  if(!grouped(o))return M.cadDimensionManagement.edit(o,slot,point,anchor,byId);
  if(slot!=='ray2'||o.angularPlacement98.method!=='circle'||!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))throw Error('unsupported-angular-point');
  const q=clone(o),anchors=clone(q.association?.anchors||{}),lost=clone(q.association?.lost||{});q.ray2={x:point.x,y:point.y};delete anchors.ray2;delete lost.ray2;if(anchor)anchors.ray2=clone(anchor);q.association=relation(q,anchors,lost);if(!q.association)delete q.association;
  validate(q);if(!cache(q))throw Error('no-valid-result');const after=regenerate(q,byId);if(anchor&&!after.association?.anchors?.ray2)throw Error('invalid-dimension-anchor');after.segments=cache(after);delete after.dxfPresentation;return after;
 }
 function source(o,owner,pick,byId){
  if(!grouped(o))return M.cadDimensionManagement.source(o,owner,pick,byId);
  const hit=A.source(owner,pick),ref=hit&&S.capture(owner,hit.edgeId||null),anchor=ref&&S.curve(ref,hit.point,byId);if(!anchor||anchor.method!==o.angularPlacement98.method)throw Error('unsupported-angular-source');return editSource(o,anchor,byId);
 }
 function pairSource(o,first,second,byId){if(o.angularPlacement98?.method!=='lines')throw Error('unsupported-angular-source');const anchor=S.pair(first,second,byId);if(!anchor)throw Error('unsupported-angular-source');return editSource(o,anchor,byId);}
 M.cadAngularAssociation=Object.freeze({grouped,slots,relation,validate,resolve,dependencies,sourceIds,release,regenerate,augment,cache,editSource,remap,edit,source,pairSource});
})();
