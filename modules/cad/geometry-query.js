/* Pure CAD geometry queries. World units are canonical mm; angles are degrees.
 * Lines default to finite segments; mode:'ray'/'line' is explicit per operand.
 * Coincident curves have no discrete intersections. Text uses injected renderer metrics.
 */
(() => {
 'use strict';
 const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 const poly=e=>root.cadPolyline?.is(e);
 const EPS=1e-9, MODEL=1e-7, rad=a=>a*Math.PI/180, norm=a=>(a%360+360)%360;
 const tolerance=Object.freeze({numeric:EPS,model:MODEL,clickPixels:9,snapPixels:10,world:(pixels,zoom)=>pixels/Math.max(EPS,zoom)});
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),cross=(a,b)=>a.x*b.y-a.y*b.x,sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y}),at=(e,t)=>({x:e.a.x+(e.b.x-e.a.x)*t,y:e.a.y+(e.b.y-e.a.y)*t});
 const line=e=>!!(e?.a&&e?.b),curve=e=>e?.type==='cadCircle'||e?.type==='cadArc',arc=e=>e?.type==='cadArc';
 const pointAt=(e,a)=>({x:e.center.x+e.radius*Math.cos(rad(a)),y:e.center.y+e.radius*Math.sin(rad(a))});
 function onArc(e,p,tol=MODEL){if(!arc(e)||Math.abs(e.sweep||0)>=360)return true;const a=Math.atan2(p.y-e.center.y,p.x-e.center.x)*180/Math.PI,s=e.sweep||0,d=s>=0?norm(a-(e.startAngle||0)):norm((e.startAngle||0)-a),t=tol/Math.max(EPS,e.radius)*180/Math.PI;return d<=Math.abs(s)+t||360-d<=t;}
 function parameter(e,p){const d=sub(e.b,e.a),l=d.x*d.x+d.y*d.y;return l?((p.x-e.a.x)*d.x+(p.y-e.a.y)*d.y)/l:0;}
 function inLine(e,p,tol){const t=parameter(e,p),eps=tol/Math.max(EPS,dist(e.a,e.b));return e.mode==='line'||(t>=-eps&&(e.mode==='ray'||t<=1+eps));}
 function segments(e){if(line(e))return[e];if(Array.isArray(e?.segments))return e.segments;if(e?.points?.length)return e.points.slice(1).map((p,i)=>({a:e.points[i],b:p})).concat(e.closed?[{a:e.points.at(-1),b:e.points[0]}]:[]);return[];}
 function intersections(a,b,tol=MODEL,scope=null){
  if(poly(a)||poly(b)){
   if(!poly(a))return intersections(b,a,tol,scope);
   if(a===b){const edges=root.cadPolyline.candidates(a,scope),out=[];for(const e of edges)for(const f of root.cadPolyline.candidates(a,create().bounds(e))){if(e.edgeId>=f.edgeId)continue;for(const p of intersections(e,f,tol)){if(scope&&!pointIn(p,scope,tol))continue;if([e.fromVertexId,e.toVertexId].some(id=>id===f.fromVertexId||id===f.toVertexId)&&[projectNearest(e,p),projectNearest(f,p)].every(q=>q&&q.distance<=tol)&&[root.cadPolyline.parameter(e,p),root.cadPolyline.parameter(f,p)].every(t=>t<=tol||t>=1-tol))continue;const refs=[e,f].map(edge=>({ownerId:a.id,edgeId:edge.edgeId,parameter:root.cadPolyline.parameter(edge,p)}));const existing=out.find(q=>dist(q,p)<=tol);if(existing)existing.entities.push(...refs);else out.push({...p,point:{...p},...refs[0],entities:refs});}}return out;}

   const q=create(),rect=scope||((b.mode==='line'||b.mode==='ray')?root.cadPolyline.get(a).bounds:q.bounds(b)),out=[];
   for(const edge of root.cadPolyline.candidates(a,rect))for(const p of intersections(edge,b,tol,scope)){
    const ref={ownerId:a.id,edgeId:edge.edgeId,parameter:root.cadPolyline.parameter(edge,p)},refs=[ref,...(p.entities||[])],existing=out.find(v=>dist(v,p)<=tol);
    if(existing)existing.entities.push(...refs);else out.push({x:p.x,y:p.y,point:{x:p.x,y:p.y},...ref,entities:refs});
   }return out;
  }
  const sa=segments(a),sb=segments(b);if(!line(a)&&sa.length)return unique(sa.flatMap(s=>intersections(s,b,tol)),tol);if(!line(b)&&sb.length)return unique(sb.flatMap(s=>intersections(a,s,tol)),tol);
  let pts=[];
  if(line(a)&&line(b)){
   const u=sub(a.b,a.a),v=sub(b.b,b.a),den=cross(u,v),w=sub(b.a,a.a),la=dist(a.a,a.b),lb=dist(b.a,b.b);
   if(la<=EPS||lb<=EPS)return[];
   if(Math.abs(den)<=EPS*la*lb){if(Math.abs(cross(w,u))/la<=tol){pts=unique([a.a,a.b,b.a,b.b].filter(p=>inLine(a,p,tol)&&inLine(b,p,tol)),tol);if(pts.length>1)pts=[];}}
   else pts=[at(a,cross(w,v)/den)];
  }else if(line(a)&&curve(b)){
   const u=sub(a.b,a.a),len=Math.hypot(u.x,u.y);if(len<=EPS)return[];
   const t=parameter(a,b.center),q=at(a,t),d=dist(q,b.center),r=b.radius;if(d>r+tol)return[];
   const dt=Math.sqrt(Math.max(0,(r-d)*(r+d)))/len;pts=Math.abs(d-r)<=tol?[q]:[at(a,t-dt),at(a,t+dt)];
  }else if(curve(a)&&line(b))return intersections(b,a,tol);
  else if(curve(a)&&curve(b)){
   const d=dist(a.center,b.center),r=a.radius,s=b.radius;if(d<=EPS)return[];if(d>r+s+tol||d<Math.abs(r-s)-tol)return[];
   const x=(d*d+(r-s)*(r+s))/(2*d),h=Math.sqrt(Math.max(0,(r-x)*(r+x))),ux=(b.center.x-a.center.x)/d,uy=(b.center.y-a.center.y)/d,q={x:a.center.x+x*ux,y:a.center.y+x*uy};
   pts=h<=tol||Math.abs(d-r-s)<=tol||Math.abs(d-Math.abs(r-s))<=tol?[q]:[{x:q.x-h*uy,y:q.y+h*ux},{x:q.x+h*uy,y:q.y-h*ux}];
  }
  return unique(pts.filter(p=>(!line(a)||inLine(a,p,tol))&&(!line(b)||inLine(b,p,tol))&&onArc(a,p,tol)&&onArc(b,p,tol)),tol);
 }
 function unique(pts,tol){const out=[];for(const p of pts)if(Number.isFinite(p.x)&&Number.isFinite(p.y)&&!out.some(q=>dist(p,q)<=tol))out.push(p);return out;}
 function projectNearest(e,p){
  if(poly(e))return root.cadPolyline.nearest(e,p);
  if(line(e)){let t=parameter(e,p);if(e.mode!=='line')t=Math.max(0,t);if(!e.mode||e.mode==='segment')t=Math.min(1,t);const point=at(e,t);return{point,t,distance:dist(point,p)};}
  if(curve(e)){const a=Math.atan2(p.y-e.center.y,p.x-e.center.x)*180/Math.PI,q=pointAt(e,a),ends=arc(e)?[pointAt(e,e.startAngle||0),pointAt(e,(e.startAngle||0)+(e.sweep||0))]:[];const points=onArc(e,q)?[q]:ends;return points.map(point=>({point,distance:dist(point,p)})).sort((a,b)=>a.distance-b.distance)[0]||null;}
  return segments(e).map(s=>projectNearest(s,p)).sort((a,b)=>a.distance-b.distance)[0]||null;
 }
 function projectPerpendicular(e,base,rect=null){if(poly(e))return unique(root.cadPolyline.candidates(e,rect).flatMap(edge=>projectPerpendicular(edge,base).map(p=>({...p,point:{...p},ownerId:e.id,edgeId:edge.edgeId,parameter:root.cadPolyline.parameter(edge,p)}))),MODEL);if(line(e)){const p=at(e,parameter(e,base));return inLine(e,p,MODEL)?[p]:[];}if(curve(e)){if(dist(base,e.center)<=EPS)return[];const a=Math.atan2(base.y-e.center.y,base.x-e.center.x)*180/Math.PI;return[pointAt(e,a),pointAt(e,a+180)].filter(p=>onArc(e,p));}return unique(segments(e).flatMap(s=>projectPerpendicular(s,base)),MODEL);}
 const rectPoints=r=>[{x:r.minx,y:r.miny},{x:r.maxx,y:r.miny},{x:r.maxx,y:r.maxy},{x:r.minx,y:r.maxy}];
 const pointIn=(p,r,t=0)=>p.x>=r.minx-t&&p.x<=r.maxx+t&&p.y>=r.miny-t&&p.y<=r.maxy+t;
 const overlap=(a,b)=>a&&b&&a.minx<=b.maxx&&a.maxx>=b.minx&&a.miny<=b.maxy&&a.maxy>=b.miny;
 const box=pts=>pts.length?pts.reduce((b,p)=>({minx:Math.min(b.minx,p.x),maxx:Math.max(b.maxx,p.x),miny:Math.min(b.miny,p.y),maxy:Math.max(b.maxy,p.y)}),{minx:Infinity,miny:Infinity,maxx:-Infinity,maxy:-Infinity}):null;
 function create({textLayout=()=>null}={}){
  function textPolygon(e){const l=textLayout(e);if(!l||l.hidden)return[];const a=rad(e.rotation||0),c=Math.cos(a),s=Math.sin(a);return rectPoints(l).map(p=>({x:e.point.x+p.x*c-p.y*s,y:e.point.y+p.x*s+p.y*c}));}
  function bounds(e){if(poly(e))return root.cadPolyline.get(e).bounds;if(e.type==='cadText')return box(textPolygon(e));if(line(e))return box([e.a,e.b]);if(curve(e)){if(!arc(e))return{minx:e.center.x-e.radius,miny:e.center.y-e.radius,maxx:e.center.x+e.radius,maxy:e.center.y+e.radius};const pts=[pointAt(e,e.startAngle||0),pointAt(e,(e.startAngle||0)+(e.sweep||0))];for(const a of[0,90,180,270]){const p=pointAt(e,a);if(onArc(e,p))pts.push(p);}return box(pts);}const ss=segments(e);if(ss.length)return box(ss.flatMap(s=>[s.a,s.b]));return box(e.points||[]);}
  function hitDistance(e,p){if(e.type==='cadText'){const l=textLayout(e);if(!l||l.hidden)return Infinity;const a=rad(-(e.rotation||0)),dx=p.x-e.point.x,dy=p.y-e.point.y,x=dx*Math.cos(a)-dy*Math.sin(a),y=dx*Math.sin(a)+dy*Math.cos(a);return Math.hypot(Math.max(l.minx-x,0,x-l.maxx),Math.max(l.miny-y,0,y-l.maxy));}return projectNearest(e,p)?.distance??Infinity;}
  function insideWindow(e,r){const b=bounds(e);return!!b&&pointIn({x:b.minx,y:b.miny},r)&&pointIn({x:b.maxx,y:b.maxy},r);}
  function crossesWindow(e,r){if(poly(e))return root.cadPolyline.candidates(e,r).some(edge=>crossesWindow(edge,r));const b=bounds(e);if(!overlap(b,r))return false;if(insideWindow(e,r))return true;const corners=rectPoints(r),edges=corners.map((p,i)=>({a:p,b:corners[(i+1)%4]}));if(e.type==='cadText'){const poly=textPolygon(e);if(poly.some(p=>pointIn(p,r)))return true;if(corners.some(p=>hitDistance(e,p)===0))return true;return poly.some((p,i)=>edges.some(edge=>intersections({a:p,b:poly[(i+1)%4]},edge).length));}if(line(e))return pointIn(e.a,r)||pointIn(e.b,r)||edges.some(edge=>intersections(e,edge).length);if(curve(e))return edges.some(edge=>intersections(e,edge).length>0);return segments(e).some(s=>crossesWindow(s,r));}
  return Object.freeze({bounds,hitDistance,insideWindow,crossesWindow,projectNearest,projectPerpendicular,intersections,textPolygon});
 }
 root.geometryQuery=Object.freeze({create,tolerance,intersections,projectNearest,projectPerpendicular,parameter,pointAt,onArc,overlap});
})();
