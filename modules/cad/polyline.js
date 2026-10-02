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

 // P3.2 EXTEND terminal policy:
 // - only open owners can extend; clicking an interior edge does not choose a distant endpoint;
 // - the first/last terminal edge may be LINE or ARC; owner/vertex/edge identity is preserved;
 // - ARC extension stays on the same circle and signed traversal direction, with bulge recomputed;
 // - cutters are read-only boundaries and may include primitive or Polyline owners.
 const EXTEND_EPS=1e-8;
 const norm360=a=>((a%360)+360)%360;
 const pointDistance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function extensionSupport(o,p){validate(o);if(o.closed)return null;const cached=get(o),edges=cached.edges;if(!edges.length)return null;const hit=nearest(o,p);if(!hit)return null;const i=edges.findIndex(e=>e.edgeId===hit.edgeId);if(i<0)return null;let side=null;if(edges.length===1)side=pointDistance(p,o.vertices[0])<=pointDistance(p,o.vertices.at(-1))?'start':'end';else if(i===0)side='start';else if(i===edges.length-1)side='end';else return null;const e=side==='start'?edges[0]:edges.at(-1);if(e.type==='cadLine'){const fixed=side==='start'?e.b:e.a,terminal=side==='start'?e.a:e.b;return{side,edge:e,queryKind:'ray',query:{type:'cadLine',a:{...fixed},b:{...terminal},mode:'ray'},terminal:{...terminal}};}if(e.type==='cadArc'){return{side,edge:e,queryKind:'circle',query:{type:'cadCircle',center:{...e.center},radius:e.radius},terminal:side==='start'?root.geometryQuery.pointAt(e,e.startAngle):root.geometryQuery.pointAt(e,e.startAngle+e.sweep)};}return null;}
 function extendTerminal(o,p,cutters){const support=extensionSupport(o,p);if(!support||!Array.isArray(cutters))return null;const e=support.edge,side=support.side,candidates=[];if(e.type==='cadLine'){const len=pointDistance(support.query.a,support.query.b);if(!(len>EXTEND_EPS))return null;for(const cutter of cutters){if(!cutter||cutter.id===o.id)continue;for(const q of root.geometryQuery.intersections(support.query,cutter)){const t=root.geometryQuery.parameter(support.query,q),extra=(t-1)*len;if(extra>EXTEND_EPS)candidates.push({point:{x:q.x,y:q.y},distance:extra});}}}
  else{const sign=Math.sign(e.sweep)||1,oldAngle=side==='start'?e.startAngle:e.startAngle+e.sweep;for(const cutter of cutters){if(!cutter||cutter.id===o.id)continue;for(const q of root.geometryQuery.intersections(support.query,cutter)){const angle=Math.atan2(q.y-e.center.y,q.x-e.center.x)*180/Math.PI,delta=side==='end'?(sign>0?norm360(angle-oldAngle):norm360(oldAngle-angle)):(sign>0?norm360(oldAngle-angle):norm360(angle-oldAngle));if(delta<=EXTEND_EPS)continue;const total=Math.abs(e.sweep)+delta;if(!(total<360-1e-7))continue;candidates.push({point:{x:q.x,y:q.y},distance:e.radius*delta*Math.PI/180,delta,angle});}}}
  if(!candidates.length)return null;candidates.sort((a,b)=>a.distance-b.distance);const best=candidates[0],out=clone(o),oldTerminal={...support.terminal},previewGeometry=[];if(e.type==='cadLine'){if(side==='start'){out.vertices[0].x=best.point.x;out.vertices[0].y=best.point.y;}else{out.vertices.at(-1).x=best.point.x;out.vertices.at(-1).y=best.point.y;}previewGeometry.push({type:'cadLine',a:oldTerminal,b:{...best.point}});}
  else{const sign=Math.sign(e.sweep)||1,total=Math.abs(e.sweep)+best.delta,newSweep=sign*total,bulge=Math.tan(newSweep*Math.PI/180/4);if(!Number.isFinite(bulge))return null;if(side==='start'){out.vertices[0].x=best.point.x;out.vertices[0].y=best.point.y;out.vertices[0].outgoing.bulge=bulge;previewGeometry.push({type:'cadArc',center:{...e.center},radius:e.radius,startAngle:best.angle,sweep:sign*best.delta});}else{out.vertices.at(-1).x=best.point.x;out.vertices.at(-1).y=best.point.y;out.vertices.at(-2).outgoing.bulge=bulge;previewGeometry.push({type:'cadArc',center:{...e.center},radius:e.radius,startAngle:e.startAngle+e.sweep,sweep:sign*best.delta});}}
  validate(out);return{kind:'extend',topology:'cadPolyline',targetId:o.id,before:o,after:[out],a:oldTerminal,b:{...best.point},cuts:[],endpoint:side,edgeId:e.edgeId,previewGeometry};}

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

 // P3.3 TRIM topology policy:
 // - the clicked analytic edge is the local trim domain; other owner edges are not silently consumed;
 // - only intersections strictly inside that edge are trim boundaries; the edge endpoints bound the terminal intervals;
 // - removing an interval may split an open owner into two owners, while a closed owner becomes one open owner;
 // - retained topology follows BREAK identity rules so untouched vertex/edge IDs survive and only new cut boundaries get fresh IDs.
 function trimAt(o,p,cutters){validate(o);if(!Array.isArray(cutters))return null;const hit=nearest(o,p);if(!hit)return null;const edges=get(o).edges,index=edges.findIndex(e=>e.edgeId===hit.edgeId);if(index<0)return null;const e=edges[index],length=e.type==='cadLine'?pointDistance(e.a,e.b):Math.abs(e.sweep)*Math.PI/180*e.radius;if(!(length>BREAK_EPS))return null;const modelTol=root.geometryQuery?.tolerance?.model||1e-7,paramTol=Math.min(.1,Math.max(BREAK_EPS,modelTol/length)),ts=[];
  for(const cutter of cutters){if(!cutter||cutter.id===o.id)continue;for(const q of root.geometryQuery.intersections(e,cutter)){const t=Math.max(0,Math.min(1,parameter(e,q)));if(!(t>paramTol&&t<1-paramTol))continue;if(!ts.some(v=>Math.abs(v-t)<=paramTol))ts.push(t);}}
  if(!ts.length)return null;ts.sort((a,b)=>a-b);const cuts=[0,...ts,1],clickT=Math.max(0,Math.min(1,Number(hit.parameter)||0));let slot=cuts.length-2;for(let i=0;i<cuts.length-1;i++){if(clickT<=cuts[i+1]+paramTol){slot=i;break;}}const lo=cuts[slot],hi=cuts[slot+1];if(!(hi-lo>paramTol))return null;
  const start=index+lo,end=index+hi,N=edges.length,fresh=breakFreshFactory(),edgeUses=new Map(),after=[];
  if(!o.closed){const ranges=[];if(start>BREAK_EPS)ranges.push([0,start]);if(N-end>BREAK_EPS)ranges.push([end,N]);for(let i=0;i<ranges.length;i++){const ownerId=i===0?o.id:fresh('cadPolyline'),piece=buildBreakPiece(o,ranges[i][0],ranges[i][1],ownerId,fresh,edgeUses);if(piece)after.push(piece);}}
  else{const piece=buildBreakPiece(o,end,start+N,o.id,fresh,edgeUses);if(piece)after.push(piece);}
  const removed=[edgeFragment(e,lo,hi)],a=edgePoint(e,lo),b=edgePoint(e,hi),cutPoints=[...(lo>paramTol?[a]:[]),...(hi<1-paramTol?[b]:[])];
  return{kind:'trim',topology:'cadPolyline',targetId:o.id,before:o,after,removed,previewGeometry:removed,a,b,cuts:cutPoints,edgeId:e.edgeId,t0:lo,t1:hi};
 }


 // P3.4 JOIN topology policy:
 // - primitive LINE JOIN remains owned by cadLinearOperations; this helper joins two distinct open cadPolyline owners only;
 // - only one coincident endpoint pair within model tolerance is accepted. JOIN never bridges a visible gap, guesses an interior attachment, or silently closes a loop;
 // - the first/source owner survives. Its coincident terminal vertex survives as the shared junction; the second owner's coincident terminal vertex is retired;
 // - every retained edge ID and every non-retired vertex ID survives, including ARC bulges. Reversal changes traversal/bulge sign but not identity;
 // - owner-level metadata must match so JOIN cannot silently discard layer/appearance/provenance data.
 const JOIN_META_EXCLUDE=new Set(['id','type','closed','vertices']);
 function joinMetadataEqual(a,b){const keys=new Set([...Object.keys(a||{}),...Object.keys(b||{})].filter(k=>!JOIN_META_EXCLUDE.has(k)));for(const k of keys){const av=a?.[k]??null,bv=b?.[k]??null;if(JSON.stringify(av)!==JSON.stringify(bv))return false;}return true;}
 function joinOpen(a,b){if(!is(a)||!is(b))return null;validate(a);validate(b);if(a.id===b.id||a.closed||b.closed||!joinMetadataEqual(a,b))return null;const tol=Math.max(BREAK_EPS,root.geometryQuery?.tolerance?.model||1e-7),ae=[['start',a.vertices[0]],['end',a.vertices.at(-1)]],be=[['start',b.vertices[0]],['end',b.vertices.at(-1)]],matches=[];
  for(const [as,av] of ae)for(const [bs,bv] of be)if(pointDistance(av,bv)<=tol)matches.push({aSide:as,bSide:bs,a:av,b:bv});
  if(matches.length!==1)return null;const match=matches[0],source=match.aSide==='start'?reverse(a):clone(a),target=match.bSide==='end'?reverse(b):clone(b),farA=source.vertices[0],farB=target.vertices.at(-1);
  // A loop requires an explicit Close/Open contract; do not create an open owner whose remote endpoints are already coincident.
  if(pointDistance(farA,farB)<=tol)return null;
  const shared=source.vertices.at(-1),incoming=target.vertices[0];if(!incoming.outgoing)return null;shared.outgoing={id:incoming.outgoing.id,bulge:incoming.outgoing.bulge};const vertices=[...source.vertices,...target.vertices.slice(1).map(v=>clone(v))];const out=clone(source);out.id=a.id;out.closed=false;out.vertices=vertices;validate(out);
  return{kind:'JOIN',topology:'cadPolyline',before:[a,b],after:[out],junction:{x:shared.x,y:shared.y},survivorOwnerId:a.id,retiredOwnerId:b.id,survivorVertexId:shared.id,retiredVertexId:incoming.id,sourceReversed:match.aSide==='start',targetReversed:match.bSide==='end'};
 }

 // P3.5 OFFSET topology policy:
 // - OFFSET creates a new Polyline owner; the source owner and all of its persistent IDs remain untouched;
 // - one side click chooses a signed left/right offset relative to owner traversal and that side is applied consistently to every LINE/ARC edge;
 // - LINE edges remain parallel, ARC edges remain concentric with the same signed traversal, and adjacent offset supports are trimmed/extended to their analytic intersection;
 // - open and closed owners are accepted when every adjacent support has one unambiguous local junction. Degenerate/collapsed ARC radii and unresolved joins are rejected rather than approximated;
 // - every new owner/vertex/edge receives fresh identity at commit. PPRJ schema/capability remain unchanged.
 const OFFSET_EPS=Math.max(BREAK_EPS,root.geometryQuery?.tolerance?.model||1e-7),OFFSET_ANGLE_EPS=1e-8;
 const offsetFreshFactory=()=>{let n=0;return kind=>`__offset_new_${kind}_${n++}__`;};
 const offsetNorm=a=>((a%360)+360)%360;
 function offsetEdgeSideSign(e,p){const hit=root.geometryQuery.projectNearest(e,p);if(!hit)return 0;const q=hit.point;let tx,ty;if(e.type==='cadLine'){const dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,len=Math.hypot(dx,dy);if(!(len>OFFSET_EPS))return 0;tx=dx/len;ty=dy/len;}else if(e.type==='cadArc'){const angle=Math.atan2(q.y-e.center.y,q.x-e.center.x),sign=Math.sign(e.sweep)||1;tx=-Math.sin(angle)*sign;ty=Math.cos(angle)*sign;}else return 0;const lx=-ty,ly=tx,dot=(p.x-q.x)*lx+(p.y-q.y)*ly;return Math.abs(dot)<=OFFSET_EPS?0:Math.sign(dot);}
 function offsetSupport(e,signedDistance){if(e.type==='cadLine'){const dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,len=Math.hypot(dx,dy);if(!(len>OFFSET_EPS))return null;const nx=-dy/len,ny=dx/len,a={x:e.a.x+nx*signedDistance,y:e.a.y+ny*signedDistance},b={x:e.b.x+nx*signedDistance,y:e.b.y+ny*signedDistance};return{kind:'line',source:e,support:{type:'cadLine',a,b,mode:'line'},start:a,end:b};}
  if(e.type==='cadArc'){const sign=Math.sign(e.sweep)||1,radius=e.radius-sign*signedDistance;if(!(radius>OFFSET_EPS))return null;const start=root.geometryQuery.pointAt({center:e.center,radius},e.startAngle),end=root.geometryQuery.pointAt({center:e.center,radius},e.startAngle+e.sweep);return{kind:'arc',source:e,support:{type:'cadCircle',center:{...e.center},radius},start,end};}return null;}
 function offsetJoinPoint(prev,next,original){const a=prev.end,b=next.start,tol=Math.max(OFFSET_EPS,1e-7);if(pointDistance(a,b)<=tol*8)return{x:(a.x+b.x)/2,y:(a.y+b.y)/2};const hits=root.geometryQuery.intersections(prev.support,next.support,tol);if(!hits.length)return null;hits.sort((p,q)=>pointDistance(p,original)-pointDistance(q,original));return{x:hits[0].x,y:hits[0].y};}
 function offsetArcBulge(source,support,a,b){const sa=Math.atan2(a.y-support.support.center.y,a.x-support.support.center.x)*180/Math.PI,ea=Math.atan2(b.y-support.support.center.y,b.x-support.support.center.x)*180/Math.PI,sign=Math.sign(source.sweep)||1,delta=sign>0?offsetNorm(ea-sa):offsetNorm(sa-ea);if(!(delta>OFFSET_ANGLE_EPS&&delta<360-OFFSET_ANGLE_EPS))return null;const sweep=sign*delta,bulge=Math.tan(sweep*Math.PI/180/4);return Number.isFinite(bulge)?bulge:null;}
 function offset(o,distance,sidePoint){if(!is(o)||!(Number(distance)>OFFSET_EPS)||!sidePoint||![sidePoint.x,sidePoint.y].every(finite))return null;validate(o);const edges=get(o).edges;if(!edges.length)return null;const hit=nearest(o,sidePoint);if(!hit)return null;const clicked=edges.find(e=>e.edgeId===hit.edgeId);if(!clicked)return null;const sideSign=offsetEdgeSideSign(clicked,sidePoint);if(!sideSign)return null;const signedDistance=sideSign*Number(distance),supports=edges.map(e=>offsetSupport(e,signedDistance));if(supports.some(x=>!x))return null;const points=[];
  if(o.closed){for(let i=0;i<o.vertices.length;i++){const p=offsetJoinPoint(supports[(i-1+supports.length)%supports.length],supports[i],o.vertices[i]);if(!p)return null;points.push(p);}}
  else{points.push({...supports[0].start});for(let i=1;i<o.vertices.length-1;i++){const p=offsetJoinPoint(supports[i-1],supports[i],o.vertices[i]);if(!p)return null;points.push(p);}points.push({...supports.at(-1).end});}
  const fresh=offsetFreshFactory(),vertices=points.map(p=>({id:fresh('cadVertex'),x:p.x,y:p.y})),edgeCount=edges.length;for(let i=0;i<edgeCount;i++){const a=points[i],b=points[(i+1)%points.length];if(pointDistance(a,b)<=OFFSET_EPS)return null;let bulge=0;if(edges[i].type==='cadArc'){bulge=offsetArcBulge(edges[i],supports[i],a,b);if(bulge===null)return null;}vertices[i].outgoing={id:fresh('cadEdge'),bulge};}
  if(!o.closed)delete vertices.at(-1).outgoing;const out=clone(o);out.id=fresh('cadPolyline');out.vertices=vertices;validate(out);return{kind:'OFFSET',topology:'cadPolyline',before:[],after:[out],sourceId:o.id,distance:Number(distance),side:sideSign>0?'left':'right'};}

 // P3.6/P3.7 FILLET topology policy:
 // - FILLET operates on two adjacent analytic edges of the same cadPolyline owner. Primitive LINE↔LINE FILLET remains owned by cadLinearOperations;
 // - LINE↔LINE, LINE↔ARC and ARC↔ARC corners use exact tangent-locus intersections. The source ARC circles are never linearized or approximated;
 // - the two picks identify the exact adjacent edges, so the command never guesses a remote corner and never crosses owner boundaries;
 // - the owner survives. Both original edge IDs survive on their retained fragments; the shared corner vertex ID survives at the incoming tangent point;
 // - one fresh vertex and one fresh ARC edge are inserted for the fillet. Open/closed topology and owner metadata are preserved;
 // - ambiguous/non-local tangent solutions, oversize radii and degenerate loci fail closed rather than choosing an arbitrary result.
 const FILLET_EPS=Math.max(BREAK_EPS,root.geometryQuery?.tolerance?.model||1e-7),FILLET_ANGLE_EPS=1e-8;
 const filletFreshFactory=()=>{let n=0;return kind=>`__fillet_new_${kind}_${n++}__`;};
 function filletPair(o,p1,p2){const edges=get(o).edges,h1=nearest(o,p1),h2=nearest(o,p2);if(!h1||!h2||h1.edgeId===h2.edgeId)return null;const i=edges.findIndex(e=>e.edgeId===h1.edgeId),j=edges.findIndex(e=>e.edgeId===h2.edgeId);if(i<0||j<0)return null;const N=edges.length;if(!N)return null;
  if(!o.closed){if(i+1===j)return{prevIndex:i,nextIndex:j,cornerIndex:j,prev:edges[i],next:edges[j]};if(j+1===i)return{prevIndex:j,nextIndex:i,cornerIndex:i,prev:edges[j],next:edges[i]};return null;}
  if((i+1)%N===j)return{prevIndex:i,nextIndex:j,cornerIndex:j,prev:edges[i],next:edges[j]};if((j+1)%N===i)return{prevIndex:j,nextIndex:i,cornerIndex:i,prev:edges[j],next:edges[i]};return null;}
 const edgeLength=e=>e.type==='cadLine'?pointDistance(e.a,e.b):Math.abs(e.sweep)*Math.PI/180*e.radius;
 function filletOffsetLoci(e,r){if(e.type==='cadLine'){const dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,len=Math.hypot(dx,dy);if(!(len>FILLET_EPS))return[];const nx=-dy/len,ny=dx/len;return[-1,1].map(sign=>({type:'cadLine',mode:'line',a:{x:e.a.x+nx*r*sign,y:e.a.y+ny*r*sign},b:{x:e.b.x+nx*r*sign,y:e.b.y+ny*r*sign}}));}
  if(e.type==='cadArc'){const radii=[e.radius+r,Math.abs(e.radius-r)].filter(v=>v>FILLET_EPS),uniq=[];for(const radius of radii)if(!uniq.some(v=>Math.abs(v-radius)<=FILLET_EPS))uniq.push(radius);return uniq.map(radius=>({type:'cadCircle',center:{...e.center},radius}));}return[];}
 function filletTangencies(e,center,r){if(e.type==='cadLine'){const hit=root.geometryQuery.projectNearest({...e,mode:'line'},center);if(!hit||Math.abs(hit.distance-r)>Math.max(FILLET_EPS*20,r*1e-7))return[];return[{point:{...hit.point},t:parameter(e,hit.point)}];}
  if(e.type==='cadArc'){const dx=center.x-e.center.x,dy=center.y-e.center.y,d=Math.hypot(dx,dy);if(!(d>FILLET_EPS))return[];const ux=dx/d,uy=dy/d,out=[];for(const sign of[1,-1]){const point={x:e.center.x+ux*e.radius*sign,y:e.center.y+uy*e.radius*sign};if(Math.abs(pointDistance(center,point)-r)>Math.max(FILLET_EPS*20,r*1e-7))continue;if(!root.geometryQuery.onArc(e,point,Math.max(FILLET_EPS*20,e.radius*1e-9)))continue;const t=parameter(e,point);if(!out.some(v=>pointDistance(v.point,point)<=FILLET_EPS*10))out.push({point,t});}return out;}return[];}
 function filletEdgeTangent(e,p){if(e.type==='cadLine'){const dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,len=Math.hypot(dx,dy);return len>FILLET_EPS?{x:dx/len,y:dy/len}:null;}if(e.type==='cadArc'){const a=Math.atan2(p.y-e.center.y,p.x-e.center.x),sign=Math.sign(e.sweep)||1;return{x:-Math.sin(a)*sign,y:Math.cos(a)*sign};}return null;}
 function filletArcSweep(center,a,b,prev,next){const ta=filletEdgeTangent(prev,a),tb=filletEdgeTangent(next,b);if(!ta||!tb)return null;const aa=Math.atan2(a.y-center.y,a.x-center.x),ba=Math.atan2(b.y-center.y,b.x-center.x),startAngle=aa*180/Math.PI,endAngle=ba*180/Math.PI;let best=null;
  for(const sign of[1,-1]){const tsa={x:-Math.sin(aa)*sign,y:Math.cos(aa)*sign},tsb={x:-Math.sin(ba)*sign,y:Math.cos(ba)*sign},da=tsa.x*ta.x+tsa.y*ta.y,db=tsb.x*tb.x+tsb.y*tb.y;if(da<1-1e-6||db<1-1e-6)continue;const mag=sign>0?norm360(endAngle-startAngle):norm360(startAngle-endAngle),sweep=sign*mag;if(!(Math.abs(sweep)>FILLET_ANGLE_EPS&&Math.abs(sweep)<180+1e-6))continue;const candidate={startAngle,sweep,alignment:da+db};if(!best||candidate.alignment>best.alignment)best=candidate;}return best;}
 function filletCandidate(prev,next,corner,r){const lociA=filletOffsetLoci(prev,r),lociB=filletOffsetLoci(next,r),candidates=[],tol=Math.max(FILLET_EPS*20,r*1e-8);for(const la of lociA)for(const lb of lociB)for(const center of root.geometryQuery.intersections(la,lb,tol)){for(const pa of filletTangencies(prev,center,r))for(const pb of filletTangencies(next,center,r)){const tPrev=pa.t,tNext=pb.t;if(!(tPrev>FILLET_EPS&&tPrev<1-FILLET_EPS&&tNext>FILLET_EPS&&tNext<1-FILLET_EPS))continue;const arc=filletArcSweep(center,pa.point,pb.point,prev,next);if(!arc)continue;const trimPrev=edgeLength(prev)*(1-tPrev),trimNext=edgeLength(next)*tNext;if(!(trimPrev>FILLET_EPS&&trimNext>FILLET_EPS))continue;const score=trimPrev+trimNext+pointDistance(center,corner)*1e-6;candidates.push({center:{x:center.x,y:center.y},a:pa.point,b:pb.point,tPrev,tNext,trimPrev,trimNext,...arc,score});}}
  if(!candidates.length)return null;candidates.sort((x,y)=>x.score-y.score);if(candidates.length>1&&Math.abs(candidates[1].score-candidates[0].score)<=Math.max(FILLET_EPS*50,candidates[0].score*1e-9)&&pointDistance(candidates[0].center,candidates[1].center)>FILLET_EPS*50)return null;return candidates[0];}
 function filletRetainedBulge(e,t0,t1){if(e.type!=='cadArc')return 0;const sweep=e.sweep*(t1-t0),bulge=Math.tan(sweep*Math.PI/180/4);return Number.isFinite(bulge)?bulge:null;}
 function filletAt(o,p1,p2,radius){if(!is(o)||!(Number(radius)>FILLET_EPS)||!p1||!p2)return null;validate(o);const pair=filletPair(o,p1,p2);if(!pair)return null;const corner=o.vertices[pair.cornerIndex],solution=filletCandidate(pair.prev,pair.next,corner,Number(radius));if(!solution)return null;const filletBulge=Math.tan(solution.sweep*Math.PI/180/4),prevBulge=filletRetainedBulge(pair.prev,0,solution.tPrev),nextBulge=filletRetainedBulge(pair.next,solution.tNext,1);if(!Number.isFinite(filletBulge)||prevBulge===null||nextBulge===null)return null;
  const out=clone(o),fresh=filletFreshFactory(),count=out.vertices.length,prevVertexIndex=(pair.cornerIndex-1+count)%count,oldCorner=out.vertices[pair.cornerIndex],nextEdgeId=oldCorner.outgoing?.id;if(!nextEdgeId)return null;const prevOutgoing=out.vertices[prevVertexIndex]?.outgoing;if(!prevOutgoing||prevOutgoing.id!==pair.prev.edgeId)return null;prevOutgoing.bulge=prevBulge;oldCorner.x=solution.a.x;oldCorner.y=solution.a.y;oldCorner.outgoing={id:fresh('cadEdge'),bulge:filletBulge};const inserted={id:fresh('cadVertex'),x:solution.b.x,y:solution.b.y,outgoing:{id:nextEdgeId,bulge:nextBulge}};out.vertices.splice(pair.cornerIndex+1,0,inserted);validate(out);
  return{kind:'FILLET',topology:'cadPolyline',before:[o],after:[out],ownerId:o.id,cornerVertexId:corner.id,retainedEdgeIds:[pair.prev.edgeId,pair.next.edgeId],filletEdgeId:oldCorner.outgoing.id,filletVertexId:inserted.id,radius:Number(radius),removed:[edgeFragment(pair.prev,solution.tPrev,1),edgeFragment(pair.next,0,solution.tNext)],fillet:{center:solution.center,radius:Number(radius),startAngle:solution.startAngle,sweep:solution.sweep},sourceTypes:[pair.prev.type,pair.next.type]};}


 // Build55 CHAMFER: equal-distance line-line corner cut. It preserves the owner and
 // the two retained source edge identities, adding only the straight bevel edge/vertex.
 const chamferFreshFactory=()=>{let n=0;return kind=>`__chamfer_new_${kind}_${n++}__`;};
 function chamferAt(o,p1,p2,distanceValue){if(!is(o)||!(Number(distanceValue)>FILLET_EPS)||!p1||!p2)return null;validate(o);const pair=filletPair(o,p1,p2);if(!pair||pair.prev.type!=='cadLine'||pair.next.type!=='cadLine')return null;const corner=o.vertices[pair.cornerIndex],d0=Number(distanceValue),lp=pointDistance(pair.prev.a,pair.prev.b),ln=pointDistance(pair.next.a,pair.next.b);if(d0>=lp-FILLET_EPS||d0>=ln-FILLET_EPS)return null;const tPrev=1-d0/lp,tNext=d0/ln,a={x:pair.prev.a.x+(pair.prev.b.x-pair.prev.a.x)*tPrev,y:pair.prev.a.y+(pair.prev.b.y-pair.prev.a.y)*tPrev},b={x:pair.next.a.x+(pair.next.b.x-pair.next.a.x)*tNext,y:pair.next.a.y+(pair.next.b.y-pair.next.a.y)*tNext};if(!a||!b||pointDistance(a,b)<=FILLET_EPS)return null;const out=clone(o),fresh=chamferFreshFactory(),count=out.vertices.length,prevVertexIndex=(pair.cornerIndex-1+count)%count,oldCorner=out.vertices[pair.cornerIndex],nextEdgeId=oldCorner.outgoing?.id,prevOutgoing=out.vertices[prevVertexIndex]?.outgoing;if(!nextEdgeId||!prevOutgoing||prevOutgoing.id!==pair.prev.edgeId)return null;prevOutgoing.bulge=0;oldCorner.x=a.x;oldCorner.y=a.y;oldCorner.outgoing={id:fresh('cadEdge'),bulge:0};const inserted={id:fresh('cadVertex'),x:b.x,y:b.y,outgoing:{id:nextEdgeId,bulge:0}};out.vertices.splice(pair.cornerIndex+1,0,inserted);validate(out);return{kind:'CHAMFER',topology:'cadPolyline',before:[o],after:[out],ownerId:o.id,cornerVertexId:corner.id,retainedEdgeIds:[pair.prev.edgeId,pair.next.edgeId],chamferEdgeId:oldCorner.outgoing.id,chamferVertexId:inserted.id,distance:d0,removed:[edgeFragment(pair.prev,tPrev,1),edgeFragment(pair.next,0,tNext)]};}

 // P3.7 explicit Polyline Close/Open topology policy:
 // - this is a direct owner-level action, separate from JOIN. JOIN still never auto-closes a loop;
 // - Close adds one straight last→first edge with fresh identity and preserves every existing vertex/edge ID;
 // - Open removes only that stored closing edge (last→first) and preserves the remaining traversal/identity;
 // - coincident open endpoints fail closed because adding a zero-length closing edge would violate the persistent topology contract.
 const topologyFreshFactory=()=>{let n=0;return kind=>`__topology_new_${kind}_${n++}__`;};
 function setClosed(o,closed){if(!is(o))return null;validate(o);closed=Boolean(closed);if(o.closed===closed)return null;const out=clone(o),fresh=topologyFreshFactory();if(closed){const first=out.vertices[0],last=out.vertices.at(-1);if(pointDistance(first,last)<=FILLET_EPS)return null;last.outgoing={id:fresh('cadEdge'),bulge:0};out.closed=true;validate(out);return{kind:'POLYLINE_CLOSE',topology:'cadPolyline',before:[o],after:[out],ownerId:o.id,edgeId:last.outgoing.id};}
  const closing=get(o).edges.at(-1),last=out.vertices.at(-1);if(!closing||!last?.outgoing)return null;delete last.outgoing;out.closed=false;validate(out);return{kind:'POLYLINE_OPEN',topology:'cadPolyline',before:[o],after:[out],ownerId:o.id,removed:[closing],edgeId:closing.edgeId};}

 root.cadPolyline=Object.freeze({is,capability,validate,get,candidates,nearest,parameter,reverse,transform,deriveEdge,extensionSupport,extendTerminal,breakBetween,trimAt,joinOpen,offset,filletAt,chamferAt,setClosed,invalidate,clear,retain,snapPoints,get stats(){return{decodes,revisions:serial,owners:byId.size};}});
})();
