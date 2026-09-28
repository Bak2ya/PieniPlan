/* P1/P2 candidate: vertices/outgoing bulge are the sole persistent authority.
 * Identity is owner + vertex/edge ID. Document validation enforces unique IDs
 * within each namespace. Geometry edits replace vertices or call invalidate().
 */
(() => {
 const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 const capability='cad.polyline.lineArc.v1',is=e=>e?.type==='cadPolyline',finite=Number.isFinite,id=v=>typeof v==='string'&&v.length>0;
 const bad=why=>{throw new Error('invalid-polyline:'+why);};
 function edge(a,b,ownerId){const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),bulge=a.outgoing.bulge,meta={ownerId,edgeId:a.outgoing.id,fromVertexId:a.id,toVertexId:b.id};
  if(!bulge)return{type:'cadLine',a:{x:a.x,y:a.y},b:{x:b.x,y:b.y},...meta};
  const offset=len*(1/bulge-bulge)/4,center={x:(a.x+b.x)/2-dy/len*offset,y:(a.y+b.y)/2+dx/len*offset},radius=Math.hypot(len/2,offset),startAngle=Math.atan2(a.y-center.y,a.x-center.x)*180/Math.PI,sweep=4*Math.atan(bulge)*180/Math.PI;
  if(![center.x,center.y,radius,startAngle,sweep].every(finite)||radius<=0||Math.abs(sweep)>=360)bad('unrepresentable-arc');
  return{type:'cadArc',center,radius,startAngle,sweep,...meta};
 }
 function validate(o){
  if(!is(o)||!id(o.id)||typeof o.closed!=='boolean'||!Array.isArray(o.vertices)||o.vertices.length<(o.closed?3:2))bad('owner');
  for(const key of ['a','b','point','polygon','segments','points','center','radius','startAngle','sweep','derived','cache'])if(Object.hasOwn(o,key))bad('duplicate-authority');
  const vertices=new Set(),edges=new Set();
  o.vertices.forEach((v,i)=>{if(!v||Object.keys(v).some(k=>!['id','x','y','outgoing'].includes(k))||!id(v.id)||vertices.has(v.id)||!finite(v.x)||!finite(v.y))bad('vertex');vertices.add(v.id);
   const last=i===o.vertices.length-1;if(last&&!o.closed){if(Object.hasOwn(v,'outgoing'))bad('open-last-edge');return;}
   const e=v.outgoing;if(!e||!id(e.id)||edges.has(e.id)||!finite(e.bulge)||Object.keys(e).some(k=>!['id','bulge'].includes(k)))bad('edge');edges.add(e.id);
   const next=o.vertices[(i+1)%o.vertices.length];if(!next||!finite(next.x)||!finite(next.y)||!Number.isFinite(Math.hypot(next.x-v.x,next.y-v.y))||!(Math.hypot(next.x-v.x,next.y-v.y)>0))bad('zero-length-edge');edge(v,next,o.id);
  });return o;
 }
 let owners=new WeakMap(),byId=new Map(),serial=0,decodes=0;
 function invalidate(o){owners.delete(o);byId.delete(o.id);}
 function retain(objects){const ids=new Set(objects.filter(is).map(o=>o.id));for(const key of byId.keys())if(!ids.has(key))byId.delete(key);}
 function clear(){owners=new WeakMap();byId.clear();}
 function get(o){let known=owners.get(o);if(known&&known.vertices===o.vertices&&known.closed===o.closed)return known.entry;
  validate(o);const signature=JSON.stringify([o.closed,o.vertices]),old=byId.get(o.id);let entry;
  if(old?.signature===signature)entry=old;else{
   const q=root.geometryQuery.create(),edges=[];for(let i=0;i<o.vertices.length-(o.closed?0:1);i++){const e=edge(o.vertices[i],o.vertices[(i+1)%o.vertices.length],o.id);for(const key of ['a','b','center'])if(e[key])Object.freeze(e[key]);edges.push(Object.freeze(e));}
   const index=root.cadSpatialTree.create(edges.map(e=>({e,b:q.bounds(e)})));entry=Object.freeze({signature,revision:++serial,edges:Object.freeze(edges),index,bounds:index.bounds});byId.set(o.id,entry);decodes++;
  }owners.set(o,{vertices:o.vertices,closed:o.closed,entry});return entry;
 }
 function candidates(o,rect){const c=get(o);return rect?c.index.query(rect).map(x=>x.e):c.edges;}
 function nearest(o,p){return get(o).index.nearest(p,({e})=>{const hit=root.geometryQuery.projectNearest(e,p);return hit?{...hit,ownerId:o.id,edgeId:e.edgeId,parameter:parameter(e,hit.point)}:null;});}
 function parameter(e,p){if(e.type==='cadLine')return root.geometryQuery.parameter(e,p);const angle=Math.atan2(p.y-e.center.y,p.x-e.center.x)*180/Math.PI,delta=e.sweep>=0?angle-e.startAngle:e.startAngle-angle;return Math.max(0,Math.min(1,((delta%360+360)%360)/Math.abs(e.sweep)));}
 function reverse(o){validate(o);const n=o.vertices.length,vertices=o.vertices.slice().reverse().map((v,i)=>{const original=n-1-i,previous=o.vertices[(original-1+n)%n],out={id:v.id,x:v.x,y:v.y};if(i<n-1||o.closed)out.outgoing={id:previous.outgoing.id,bulge:-previous.outgoing.bulge};return out;});return validate({...o,vertices});}
 // Similarity only; helper contract, not a user-facing Modify command.
 function transform(o,{a,b,c,d,tx=0,ty=0}){validate(o);const sx=Math.hypot(a,b),sy=Math.hypot(c,d),det=a*d-b*c;if(![a,b,c,d,tx,ty].every(finite)||!sx||!sy||Math.abs(sx-sy)>1e-10*Math.max(sx,sy)||Math.abs(a*c+b*d)>1e-10*sx*sy)bad('unsupported-transform');return validate({...o,vertices:o.vertices.map(v=>({id:v.id,x:a*v.x+c*v.y+tx,y:b*v.x+d*v.y+ty,...(v.outgoing?{outgoing:{id:v.outgoing.id,bulge:v.outgoing.bulge*Math.sign(det)}}:{})}))});}
 function snapPoints(o){const out=o.vertices.map(v=>({x:v.x,y:v.y,objectId:o.id,ownerId:o.id,vertexId:v.id,kind:'endpoint',vertex:true}));for(const e of get(o).edges){const point=e.type==='cadLine'?{x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2}:root.geometryQuery.pointAt(e,e.startAngle+e.sweep/2);out.push({...point,objectId:o.id,ownerId:o.id,edgeId:e.edgeId,kind:'midpoint'});if(e.type==='cadArc')out.push({...e.center,objectId:o.id,ownerId:o.id,edgeId:e.edgeId,kind:'center'});}return out;}
 root.cadPolyline=Object.freeze({is,capability,validate,get,candidates,nearest,parameter,reverse,transform,invalidate,clear,retain,snapPoints,get stats(){return{decodes,revisions:serial,owners:byId.size};}});
})();
