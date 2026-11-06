/* Architectural 2D linear/aligned creation helpers. Saved legacy owners stay unchanged. */
(() => {
 'use strict';
 const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},capability='cad.dimension.linear-options.v1',key='linearOptions99',eps=1e-8,
  copy=q=>JSON.parse(JSON.stringify(q)),point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),norm=t=>(t%1+1)%1,
  at=(c,r,a)=>({x:c.x+r*Math.cos(a*Math.PI/180),y:c.y+r*Math.sin(a*Math.PI/180)}),param=(c,p)=>norm(Math.atan2(p.y-c.y,p.x-c.x)/(2*Math.PI));
 function validate(v){if(!v||v.version!==1||Object.keys(v).some(k=>!['version','textAngle','circleSource'].includes(k))||!Object.hasOwn(v,'textAngle')&&!Object.hasOwn(v,'circleSource')||Object.hasOwn(v,'textAngle')&&!Number.isFinite(v.textAngle)||Object.hasOwn(v,'circleSource')&&v.circleSource!==true)throw Error('invalid-linear-options');return v;}
 function validateOwner(o){if(o?.type!=='cadDimension'||!['linear','aligned'].includes(o.kind||'aligned')||o.floorId||o.planRole)throw Error('invalid-linear-options-owner');validate(o[key]);return true;}
 const required=(objects=[])=>objects.some(o=>Object.hasOwn(o,key));
 function circlePoints(circle,axis,linear){if(!point(circle?.center)||!(circle.radius>eps)||!Number.isFinite(axis))return null;const first=linear?axis+180:axis,t1=norm(first/360),t2=norm((first+180)/360),p1=at(circle.center,circle.radius,t1*360),p2=at(circle.center,circle.radius,t2*360);return{p1,p2,anchors:{p1:{kind:'geometry96',sourceId:circle.sourceId,feature:'parameter',value:t1},p2:{kind:'geometry96',sourceId:circle.sourceId,feature:'parameter',value:t2}}};}
 function source(owner,p,{linear=false,localVector=p=>p,worldAngle=a=>a}={}){
  if(!owner||owner.readonly||owner.floorId||owner.planRole||!point(p)||typeof owner.id!=='string'||!owner.id)return null;
  const poly=M.cadPolyline.is(owner);let edge=owner;
  if(poly){if(owner.curveFit)return null;const ranked=M.cadPolyline.get(owner).edges.map(e=>({e,d:M.geometryQuery.projectNearest(e,p)?.distance??Infinity})).filter(q=>Number.isFinite(q.d)).sort((a,b)=>a.d-b.d);if(!ranked.length||ranked[1]&&Math.abs(ranked[0].d-ranked[1].d)<eps)return null;edge=ranked[0].e;}
  if(!['cadLine','cadArc','cadCircle'].includes(edge.type))return null;
  if(edge.type==='cadCircle'){if(poly||!point(edge.center)||!Number.isFinite(edge.radius)||edge.radius<=eps||distance(edge.center,p)<=eps)return null;const delta=localVector({x:p.x-edge.center.x,y:p.y-edge.center.y}),axis=linear?worldAngle(Math.abs(delta.x)>Math.abs(delta.y)?90:0):Math.atan2(p.y-edge.center.y,p.x-edge.center.x)*180/Math.PI,circle={sourceId:owner.id,center:{...edge.center},radius:edge.radius,axis};return{...circlePoints(circle,axis,linear),circle,axis};}
  const p1=edge.type==='cadLine'?edge.a:M.geometryQuery.pointAt(edge,edge.startAngle),p2=edge.type==='cadLine'?edge.b:M.geometryQuery.pointAt(edge,edge.startAngle+edge.sweep);if(!point(p1)||!point(p2)||distance(p1,p2)<eps)return null;
  let anchors;if(poly){if(typeof edge.fromVertexId!=='string'||typeof edge.toVertexId!=='string')return null;anchors={p1:{kind:'vertex',sourceId:owner.id,vertexId:edge.fromVertexId},p2:{kind:'vertex',sourceId:owner.id,vertexId:edge.toVertexId}};}else anchors={p1:{kind:'point',sourceId:owner.id,key:edge.type==='cadLine'?'a':'start'},p2:{kind:'point',sourceId:owner.id,key:edge.type==='cadLine'?'b':'end'}};
  const start=poly?owner.vertices.find(v=>v.id===edge.fromVertexId):p1,end=poly?owner.vertices.find(v=>v.id===edge.toVertexId):p2;if(!point(start)||!point(end))return null;return{p1:{x:start.x,y:start.y},p2:{x:end.x,y:end.y},anchors,...(poly?{edgeId:edge.edgeId}:{})};
 }
 function draft(d,p,{localVector=p=>p,worldAngle=a=>a,manualText=false}={}){
  const linear=d.kind==='linear'||d.kind==='linearDim';if(!['linear','aligned','linearDim','alignedDim'].includes(d.kind)||!point(p))return null;
  const circle=d.circle&&circlePoints(d.circle,linear?(d.dimensionAngle??d.circle.axis):d.circle.axis,linear),p1=circle?.p1||d.p1,p2=circle?.p2||d.p2;if(!point(p1)||!point(p2)||distance(p1,p2)<eps)return null;
  const dx=p2.x-p1.x,dy=p2.y-p1.y,local=localVector({x:p.x-(p1.x+p2.x)/2,y:p.y-(p1.y+p2.y)/2});let angle=linear?(d.dimensionAngle??d.circle?.axis??worldAngle(Math.abs(local.x)>Math.abs(local.y)?90:0)):Math.atan2(dy,dx)*180/Math.PI;
  if(linear&&d.dimensionAngle==null&&!d.circle&&Math.abs(dx*Math.cos(angle*Math.PI/180)+dy*Math.sin(angle*Math.PI/180))<1e-7)angle+=90;
  if(!Number.isFinite(angle))return null;const nx=-Math.sin(angle*Math.PI/180),ny=Math.cos(angle*Math.PI/180),out={kind:linear?'linear':'aligned',p1:{...p1},p2:{...p2},offset:(p.x-p1.x)*nx+(p.y-p1.y)*ny,...(linear?{dimensionAngle:angle}:{}),...(manualText?{dimText96:{version:1,point:{...p},leader:false}}:{})};
  if(d.textOverride!=null)out.textOverride=d.textOverride;if(d.textAngle!=null||d.circle){out[key]={version:1,...(d.textAngle!=null?{textAngle:d.textAngle}:{}),...(d.circle?{circleSource:true}:{})};try{validate(out[key]);}catch{return null;}}
  return M.cadAnnotation2.geometry({type:'cadDimension',...out})?.segments?.length?out:null;
 }
 function anchors(d,o){const linear=d.kind==='linear'||d.kind==='linearDim';return d.circle?circlePoints(d.circle,linear?(o.dimensionAngle??d.circle.axis):d.circle.axis,linear).anchors:copy(d.anchors||{});}
 function rotation(o,fallback=0){return o.dimText96?.rotation??o[key]?.textAngle??fallback;}
 function transform(o,m){if(!Object.hasOwn(o,key))return o;validateOwner(o);if(!Object.hasOwn(o[key],'textAngle'))return o;const a=o[key].textAngle*Math.PI/180,x=m.a*Math.cos(a)+m.c*Math.sin(a),y=m.b*Math.cos(a)+m.d*Math.sin(a);if(!Number.isFinite(x)||!Number.isFinite(y)||Math.hypot(x,y)<eps)return null;return{...o,[key]:{...o[key],textAngle:Math.atan2(y,x)*180/Math.PI}};}
 function circleTransform(o,touched,byId){
  if(!o[key]?.circleSource||o.association?.version!==2)return o;let q=o;
  for(const [slot,a]of Object.entries(o.association.anchors||{})){
   if(!['p1','p2'].includes(slot)||a.kind!=='geometry96'||a.feature!=='parameter'||a.edgeId||a.direction||a.topology||!touched.has(a.sourceId))continue;
   const source=byId(a.sourceId),p=q[slot],tol=Math.max(1e-7,Number.EPSILON*128*Math.max(1,Math.abs(p?.x||0),Math.abs(p?.y||0),Math.abs(source?.center?.x||0),Math.abs(source?.center?.y||0),source?.radius||0));
   if(source?.type!=='cadCircle'||!point(p)||!point(source.center)||!Number.isFinite(source.radius)||source.radius<=eps||Math.abs(distance(p,source.center)-source.radius)>tol){q=M.cadDimensionPartial.release(q,[slot]);continue;}
   const value=param(source.center,p);if(value===a.value)continue;if(q===o)q=copy(o);q.association.anchors[slot]={...q.association.anchors[slot],value};
  }
  return q;
 }
 M.cadLinearPlacement=Object.freeze({capability,key,validate,validateOwner,required,circlePoints,source,draft,anchors,rotation,transform,circleTransform});
})();
