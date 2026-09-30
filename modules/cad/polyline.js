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
 function deriveEdge(a,b,bulge=0){if(!a||!b||![a.x,a.y,b.x,b.y,bulge].every(finite)||Math.hypot(b.x-a.x,b.y-a.y)<=0)bad('preview-edge');return edge({id:'__preview_v0__',x:a.x,y:a.y,outgoing:{id:'__preview_e__',bulge:Number(bulge)||0}},{id:'__preview_v1__',x:b.x,y:b.y},'__preview_owner__');}
 function snapPoints(o){const out=o.vertices.map(v=>({x:v.x,y:v.y,objectId:o.id,ownerId:o.id,vertexId:v.id,kind:'endpoint',vertex:true}));for(const e of get(o).edges){const point=e.type==='cadLine'?{x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2}:root.geometryQuery.pointAt(e,e.startAngle+e.sweep/2);out.push({...point,objectId:o.id,ownerId:o.id,edgeId:e.edgeId,kind:'midpoint'});if(e.type==='cadArc')out.push({...e.center,objectId:o.id,ownerId:o.id,edgeId:e.edgeId,kind:'center'});}return out;}

 // P3.1 BREAK topology policy:
 // - existing untouched vertex/edge IDs survive;
 // - a split edge keeps its original ID on the first retained fragment, later fragments get fresh placeholders;
 // - the first retained owner in traversal order keeps the owner ID, additional owners get fresh placeholders;
 // - BREAK results are open polylines; closed owners remove the forward path from first pick to second pick.
 const BREAK_EPS=1e-8;
 const clone=o=>JSON.parse(JSON.stringify(o));
 function breakFreshFactory(){let n=0;return kind=>`__break_new_${kind}_${n++}__`;}
 function edgePoint(e,t){t=Math.max(0,Math.min(1,Number(t)||0));if(e.type==='cadLine')return{x:e.a.x+(e.b.x-e.a.x)*t,y:e.a.y+(e.b.y-e.a.y)*t};return root.geometryQuery.pointAt(e,e.startAngle+e.sweep*t);}
 function edgeFragment(e,t0,t1){const a=edgePoint(e,t0),b=edgePoint(e,t1);if(e.type==='cadLine')return{type:'cadLine',a,b,ownerId:e.ownerId,edgeId:e.edgeId};return{type:'cadArc',center:{...e.center},radius:e.radius,startAngle:e.startAngle+e.sweep*t0,sweep:e.sweep*(t1-t0),ownerId:e.ownerId,edgeId:e.edgeId};}
 function locateBreak(o,p){const hit=nearest(o,p);if(!hit)return null;const edges=get(o).edges,i=edges.findIndex(e=>e.edgeId===hit.edgeId);if(i<0)return null;let t=Math.max(0,Math.min(1,Number(hit.parameter)||0));if(t<BREAK_EPS)t=0;else if(1-t<BREAK_EPS)t=1;let pos=i+t;if(o.closed&&Math.abs(pos-edges.length)<BREAK_EPS)pos=0;return{pos,point:{...hit.point},edgeIndex:i,t};}
 function fragmentsForRange(o,start,end){const edges=get(o).edges,N=edges.length,out=[];if(!(end-start>BREAK_EPS))return out;const first=Math.floor(start),last=Math.ceil(end-BREAK_EPS);for(let k=first;k<last;k++){const t0=Math.max(start,k)-k,t1=Math.min(end,k+1)-k;if(t1-t0<=BREAK_EPS)continue;const index=((k%N)+N)%N;out.push({absIndex:k,index,t0:Math.max(0,t0),t1:Math.min(1,t1),edge:edges[index]});}return out;}
 function buildBreakPiece(o,start,end,ownerId,fresh,edgeUses){const frags=fragmentsForRange(o,start,end);if(!frags.length)return null;const N=get(o).edges.length,vertices=[];let current=null;
  const sourceVertex=(absEdge,atEnd=false)=>{const raw=absEdge+(atEnd?1:0),vi=o.closed?((raw%o.vertices.length)+o.vertices.length)%o.vertices.length:raw,v=o.vertices[vi];return{id:v.id,x:v.x,y:v.y};};
  for(let fi=0;fi<frags.length;fi++){const f=frags[fi],source=o.vertices[f.index],origBulge=Number(source.outgoing?.bulge)||0;
   if(!current){current=f.t0<=BREAK_EPS?sourceVertex(f.absIndex,false):{id:fresh('cadVertex'),...edgePoint(f.edge,f.t0)};vertices.push(current);}
   const endVertex=f.t1>=1-BREAK_EPS?sourceVertex(f.absIndex,true):{id:fresh('cadVertex'),...edgePoint(f.edge,f.t1)};
   const used=edgeUses.get(f.index)||0,edgeId=used===0?source.outgoing.id:fresh('cadEdge');edgeUses.set(f.index,used+1);
   const sweep=f.edge.type==='cadArc'?f.edge.sweep*(f.t1-f.t0):0,bulge=f.edge.type==='cadArc'?Math.tan(sweep*Math.PI/180/4):origBulge*0;
   current.outgoing={id:edgeId,bulge:Number.isFinite(bulge)?bulge:0};vertices.push(endVertex);current=endVertex;
  }
  const out=clone(o);out.id=ownerId;out.closed=false;out.vertices=vertices;return validate(out);
 }
 function breakBetween(o,p1,p2){validate(o);const a=locateBreak(o,p1),b=locateBreak(o,p2);if(!a||!b)return null;const N=get(o).edges.length;if(!N)return null;const fresh=breakFreshFactory(),edgeUses=new Map(),after=[],removed=[];
  if(!o.closed){let lo=Math.min(a.pos,b.pos),hi=Math.max(a.pos,b.pos);if(hi-lo<=BREAK_EPS)return null;const ranges=[];if(lo>BREAK_EPS)ranges.push([0,lo]);if(N-hi>BREAK_EPS)ranges.push([hi,N]);for(const f of fragmentsForRange(o,lo,hi))removed.push(edgeFragment(f.edge,f.t0,f.t1));for(let i=0;i<ranges.length;i++){const ownerId=i===0?o.id:fresh('cadPolyline'),piece=buildBreakPiece(o,ranges[i][0],ranges[i][1],ownerId,fresh,edgeUses);if(piece)after.push(piece);}}
  else{let start=a.pos,end=b.pos;if(Math.abs(start-end)<=BREAK_EPS)return null;if(end<=start)end+=N;for(const f of fragmentsForRange(o,start,end))removed.push(edgeFragment(f.edge,f.t0,f.t1));const keepStart=end,keepEnd=start+N,piece=buildBreakPiece(o,keepStart,keepEnd,o.id,fresh,edgeUses);if(piece)after.push(piece);}
  return{kind:'BREAK',topology:'cadPolyline',before:[o],after,removed};
 }
 root.cadPolyline=Object.freeze({is,capability,validate,get,candidates,nearest,parameter,reverse,transform,deriveEdge,breakBetween,invalidate,clear,retain,snapPoints,get stats(){return{decodes,revisions:serial,owners:byId.size};}});
})();
