/* Input and advisory geometry only. No document mutation or permanent constraints. */
(() => {
 'use strict';
 const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 const radius=Object.freeze({low:6,normal:10,high:16});
 const rank=Object.freeze({endpoint:7,intersection:6,midpoint:5,center:4,perpendicular:3,wall:2,nearest:1,grid:0});
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function choose(pointer,candidates,zoom,pixels=10){
  const z=Math.max(1e-9,zoom),items=candidates.map(q=>({q,d:dist(pointer,q)*z})).filter(x=>Number.isFinite(x.d)&&x.d<=pixels);
  if(!items.length)return null;
  let near=Infinity;for(const item of items)near=Math.min(near,item.d);
  let best=null;for(const item of items){if(item.d>near+2)continue;if(!best||(rank[item.q.kind]||0)>(rank[best.q.kind]||0)||(rank[item.q.kind]||0)===(rank[best.q.kind]||0)&&(item.d<best.d||item.d===best.d&&String(item.q.objectId||item.q.source||'').localeCompare(String(best.q.objectId||best.q.source||''))<0))best=item;}return best.q;
 }
 function guides(point,anchors,{base=null,angle=null,tolerance=10}={}){
  const out=[];
  for(const q of anchors||[]){
   if(dist(point,q)<=tolerance)out.push({kind:'coincident',a:q,b:point,score:dist(point,q)});
   if(Math.abs(q.x-point.x)<=tolerance&&Math.abs(q.y-point.y)>tolerance)out.push({kind:q.kind==='midpoint'?'midpoint':'vertical',a:q,b:{x:q.x,y:point.y},score:Math.abs(q.x-point.x)});
   if(Math.abs(q.y-point.y)<=tolerance&&Math.abs(q.x-point.x)>tolerance)out.push({kind:q.kind==='midpoint'?'midpoint':'horizontal',a:q,b:{x:point.x,y:q.y},score:Math.abs(q.y-point.y)});
  }
  if(base&&Number.isFinite(angle))for(const [kind,a]of [['parallel',angle],['perpendicular',angle+90]]){const r=a*Math.PI/180,u={x:Math.cos(r),y:Math.sin(r)},d={x:point.x-base.x,y:point.y-base.y},along=d.x*u.x+d.y*u.y,error=Math.abs(d.x*u.y-d.y*u.x);if(error<=tolerance&&Math.abs(along)>tolerance)out.push({kind,a:base,b:{x:base.x+along*u.x,y:base.y+along*u.y},score:error});}
  const seen=new Set();return out.sort((a,b)=>a.score-b.score).filter(g=>{if(seen.has(g.kind))return false;seen.add(g.kind);return true;}).slice(0,2);
 }
 root.precision=Object.freeze({radius,rank,choose,guides});
})();
