/* Endpoint connectivity only: finite intersections never imply graph membership.
 * Build lazily on explicit action, retain by geometry revision in the composition root. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function endpoints(o){if(root.cadPolyline?.is(o))return o.vertices.map(v=>({x:v.x,y:v.y}));if(o.type==='cadLine'||o.type==='line')return[o.a,o.b];if(o.type==='cadArc'){const at=a=>({x:o.center.x+o.radius*Math.cos(a*Math.PI/180),y:o.center.y+o.radius*Math.sin(a*Math.PI/180)});return[at(o.startAngle),at(o.startAngle+o.sweep)];}return[];}
 function create(objects,tolerance=1e-5){
  const cells=new Map(),byId=new Map(),nodes=new Map(),key=p=>`${Math.floor(p.x/tolerance)},${Math.floor(p.y/tolerance)}`;
  for(const o of objects){const pts=endpoints(o).filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y));if(!pts.length)continue;byId.set(o.id,{o,pts});for(const p of pts){const token=`${p.x},${p.y}`;let node=nodes.get(token);if(!node){node={token,p,ids:new Set()};nodes.set(token,node);const k=key(p);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(node);}node.ids.add(o.id);}}
  function connected(seeds,allowed=()=>true){const seen=new Set(),processedPoints=new Set(),queue=[...seeds];let visits=0;while(queue.length){const id=queue.pop(),entry=byId.get(id);if(seen.has(id)||!entry||!allowed(entry.o))continue;seen.add(id);for(const p of entry.pts){const token=`${p.x},${p.y}`;if(processedPoints.has(token))continue;processedPoints.add(token);const x=Math.floor(p.x/tolerance),y=Math.floor(p.y/tolerance);for(let i=x-1;i<=x+1;i++)for(let j=y-1;j<=y+1;j++)for(const item of cells.get(`${i},${j}`)||[]){visits++;if(Math.hypot(p.x-item.p.x,p.y-item.p.y)<=tolerance)for(const next of item.ids)if(!seen.has(next))queue.push(next);}}}return{ids:[...seen],visits};}
  return Object.freeze({connected,size:byId.size});
 }
 root.connectedSelection=Object.freeze({create,endpoints});
})();
