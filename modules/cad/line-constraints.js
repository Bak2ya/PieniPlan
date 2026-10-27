/* Deferred two-dimensional LINE snaps. Draft references only; owners stay untouched. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},G=()=>M.geometryQuery;
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),point=p=>({x:p.x,y:p.y}),finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),circle=o=>['cadCircle','cadArc'].includes(o?.type),linear=o=>o?.a&&o?.b;
 function pick(owner,p,{kind='tangent',allowed=()=>true,leaves=null}={}){
  const out=[];function visit(o,path,parentReference=null){if(!allowed(o))return;const parts=o.type==='cadDxfRecord'?o.preview:M.cadBlocks?.is(o)?leaves?.(o)||M.cadBlocks.expand(o):M.cadPolylineWidth?.isAffine(o)?M.cadPolylineWidth.affineEdges(o):M.cadPolyline?.is(o)?M.cadPolyline.get(o).edges:null;
   const reference=M.cadBlockReferences?.info(o)||parentReference;if(parts){for(const child of parts){if(o.type==='cadDxfRecord')M.cadBlockReferences?.note(child,[...(reference?.layers||[o.cadLayer||'0']),child.cadLayer||o.cadLayer||'0'],Boolean(reference?.invisible||o.dxfInvisible||child.dxfInvisible));visit(child,path+'/'+(child.edgeId||child.id),reference);}return;}
   if(kind==='tangent'?!circle(o):!(circle(o)||linear(o)||M.cadEllipse?.is(o)||M.cadBezier?.is(o)))return;
   const q=G().projectNearest(o,p);if(!q)return;out.push({kind,object:o,point:point(q.point),ownerId:owner.id,key:path,distance:q.distance,...(reference?{referenceLayers:reference.layers,referenceInvisible:reference.invisible}:{})});
  }visit(owner,String(owner.id));return out.sort((a,b)=>a.distance-b.distance)[0]||null;
 }
 function on(o,p){if(circle(o))return o.type!=='cadArc'||G().onArc(o,p);if(linear(o)){const t=G().parameter(o,p);return(o.mode==='line'||t>=-1e-8)&&(o.mode==='line'||o.mode==='ray'||t<=1+1e-8);}return true;}
 function solve(first,second){
  const results=[],a=first,b=second;if(!a||!b)return results;
  function add(p,q){if(!finite(p)||!finite(q)||distance(p,q)<1e-8||a.object&&!on(a.object,p)||b.object&&!on(b.object,q))return;
   const d={x:q.x-p.x,y:q.y-p.y},len=Math.hypot(d.x,d.y),valid=(c,x)=>{if(!c.object)return true;const o=c.object;if(circle(o)){const r={x:x.x-o.center.x,y:x.y-o.center.y},dot=r.x*d.x+r.y*d.y,cross=r.x*d.y-r.y*d.x;return Math.abs(c.kind==='tangent'?dot:cross)<=1e-7*Math.max(1,o.radius*len); }if(linear(o))return c.kind==='perpendicular'&&Math.abs((o.b.x-o.a.x)*d.x+(o.b.y-o.a.y)*d.y)<=1e-7*Math.max(1,distance(o.a,o.b)*len);return true;};
   if(!valid(a,p)||!valid(b,q))return;if(results.some(x=>distance(x.a,p)<1e-7&&distance(x.b,q)<1e-7))return;results.push({a:point(p),b:point(q),score:distance(p,a.point)+distance(q,b.point)});
  }
  if(!a.object&&!b.object){add(a.point,b.point);return results;}
  if(!a.object){for(const x of solve(b,a))results.push({a:x.b,b:x.a,score:x.score});return results;}
  const A=a.object,B=b.object;
  if(!B){const pts=a.kind==='tangent'?M.cadPrecision.tangent(A,b.point):G().projectPerpendicular(A,b.point);for(const p of pts)add(p,b.point);}
  else if(circle(A)&&circle(B)&&a.kind==='tangent'&&b.kind==='tangent'){
   const dx=B.center.x-A.center.x,dy=B.center.y-A.center.y,d=Math.hypot(dx,dy);if(d>1e-10)for(const sa of [-1,1])for(const sb of [-1,1]){const k=(sa*A.radius-sb*B.radius)/d;if(Math.abs(k)>1+1e-12)continue;const h=Math.sqrt(Math.max(0,1-k*k));for(const side of [-1,1]){const nx=k*dx/d-side*h*dy/d,ny=k*dy/d+side*h*dx/d;add({x:A.center.x+sa*A.radius*nx,y:A.center.y+sa*A.radius*ny},{x:B.center.x+sb*B.radius*nx,y:B.center.y+sb*B.radius*ny});}}
  }else if(circle(A)&&circle(B)&&a.kind==='perpendicular'&&b.kind==='perpendicular'){
   const d=distance(A.center,B.center);if(d>1e-10)for(const sa of [-1,1])for(const sb of [-1,1])add({x:A.center.x+sa*A.radius*(B.center.x-A.center.x)/d,y:A.center.y+sa*A.radius*(B.center.y-A.center.y)/d},{x:B.center.x+sb*B.radius*(B.center.x-A.center.x)/d,y:B.center.y+sb*B.radius*(B.center.y-A.center.y)/d});
  }else if(circle(A)&&circle(B)&&a.kind==='tangent'&&b.kind==='perpendicular'){
   for(const p of M.cadPrecision.tangent(A,B.center)){const d=distance(p,B.center);for(const s of [-1,1])add(p,{x:B.center.x+s*B.radius*(p.x-B.center.x)/d,y:B.center.y+s*B.radius*(p.y-B.center.y)/d});}
  }else if(circle(A)&&linear(B)&&b.kind==='perpendicular'){
   const dx=B.b.x-B.a.x,dy=B.b.y-B.a.y,n=Math.hypot(dx,dy);if(n>1e-10)for(const s of [-1,1]){const ux=a.kind==='tangent'?dx/n:-dy/n,uy=a.kind==='tangent'?dy/n:dx/n,p={x:A.center.x+s*A.radius*ux,y:A.center.y+s*A.radius*uy};for(const q of G().projectPerpendicular(B,p))add(p,q);}
  }else if(linear(A)&&linear(B)&&a.kind==='perpendicular'&&b.kind==='perpendicular'){
   const dx=A.b.x-A.a.x,dy=A.b.y-A.a.y,n=Math.hypot(dx,dy),ex=B.b.x-B.a.x,ey=B.b.y-B.a.y;if(n>1e-10&&Math.abs(dx*ey-dy*ex)<=1e-9*n*distance(B.a,B.b)){const t=((a.point.x-A.a.x)*dx+(a.point.y-A.a.y)*dy+(b.point.x-A.a.x)*dx+(b.point.y-A.a.y)*dy)/(2*n*n),p={x:A.a.x+t*dx,y:A.a.y+t*dy};for(const q of G().projectPerpendicular(B,p))add(p,q);}
  }else if(!(linear(A)&&linear(B))){for(const x of solveReversed(a,b))add(x.a,x.b);}
  return results.sort((x,y)=>x.score-y.score);
 }
 function solveReversed(a,b){const A=a.object,B=b.object;if(circle(A)&&circle(B)&&a.kind==='perpendicular'&&b.kind==='tangent'||linear(A)&&circle(B))return solve(b,a).map(x=>({a:x.b,b:x.a}));return[];}
 M.cadLineConstraints=Object.freeze({pick,solve});
})();
