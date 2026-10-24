/* Derived polynomial spans. Persistent control frames remain on the polyline.
 * Geometry queries use polynomial roots; plotting never becomes model data. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 const is=o=>o?.type==='cadBezier',mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
 function at(o,t){let p=o.controls;while(p.length>1)p=p.slice(1).map((q,i)=>mix(p[i],q,t));return p[0];}
 function derivative(o,t){const n=o.controls.length-1;return at({controls:o.controls.slice(1).map((p,i)=>({x:n*(p.x-o.controls[i].x),y:n*(p.y-o.controls[i].y)}))},t);}
 function coefficients(o,k){const base=o.controls[0][k],p=o.controls.map(p=>p[k]-base);return p.length===3?[base,2*p[1],-2*p[1]+p[2]]:[base,3*p[1],3*(-2*p[1]+p[2]),3*p[1]-3*p[2]+p[3]];}
 const roots=a=>root.cadEllipse.roots(a).filter(t=>t>=-1e-9&&t<=1+1e-9).map(t=>Math.max(0,Math.min(1,t)));
 const add=(a,b)=>Array.from({length:Math.max(a.length,b.length)},(_,i)=>(a[i]||0)+(b[i]||0));
 const mul=(a,b)=>{const out=Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>out[i+j]+=x*y));return out;};
 function stationary(o,p){const x=coefficients(o,'x'),y=coefficients(o,'y'),dx=x.slice(1).map((n,i)=>n*(i+1)),dy=y.slice(1).map((n,i)=>n*(i+1));x[0]-=p.x;y[0]-=p.y;return roots(add(mul(x,dx),mul(y,dy)));}
 function nearest(o,p){return[0,1,...stationary(o,p)].map(t=>({point:at(o,t),t,parameter:t})).map(q=>({...q,distance:Math.hypot(q.point.x-p.x,q.point.y-p.y)})).sort((a,b)=>a.distance-b.distance)[0];}
 function bounds(o){const ts=[0,1];for(const k of ['x','y'])ts.push(...roots(coefficients(o,k).slice(1).map((v,i)=>v*(i+1))));const ps=ts.map(t=>at(o,t));return{minx:Math.min(...ps.map(p=>p.x)),maxx:Math.max(...ps.map(p=>p.x)),miny:Math.min(...ps.map(p=>p.y)),maxy:Math.max(...ps.map(p=>p.y))};}
 function split(o,t=.5){const left=[],right=[];let row=o.controls.map(p=>({...p}));left.push(row[0]);right.push(row.at(-1));while(row.length>1){row=row.slice(1).map((p,i)=>mix(row[i],p,t));left.push(row[0]);right.push(row.at(-1));}return[{...o,controls:left},{...o,controls:right.reverse()}];}
 function fragment(o,t0,t1){if(t0===0&&t1===1)return{...o,controls:o.controls.map(p=>({...p}))};const part=t1<1?split(o,t1)[0]:o;return t0>0?split(part,t0/t1)[1]:part;}
 // Convex-hull interval isolation and polynomial Newton refinement; no display
 // tessellation enters the result. Coincident supports have no discrete roots.
 function pair(o,q,{tolerance=1e-7,budget=60000}={}){
  const all=[...o.controls,...q.controls],origin=all[0],scale=Math.max(1,...all.flatMap(p=>[Math.abs(p.x-origin.x),Math.abs(p.y-origin.y)])),local=e=>({...e,controls:e.controls.map(p=>({x:(p.x-origin.x)/scale,y:(p.y-origin.y)/scale}))}),a=local(o),b=local(q),tol=Math.max(2e-14,tolerance/scale),distance=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y);
  const same=(x,y)=>x.length===y.length&&x.every((p,i)=>distance(p,y[i])<tol);
  if(same(a.controls,b.controls)||same(a.controls,b.controls.slice().reverse()))return{points:[],status:'coincident',visits:0};
  const linear=e=>{const p=e.controls[0],r=e.controls.at(-1),dx=r.x-p.x,dy=r.y-p.y,len=Math.hypot(dx,dy);return len>tol&&e.controls.every(v=>Math.abs((v.x-p.x)*dy-(v.y-p.y)*dx)<=tol*len);};
  if(linear(a)&&linear(b)){const x={a:a.controls[0],b:a.controls.at(-1)},y={a:b.controls[0],b:b.controls.at(-1)},hits=root.geometryQuery.intersections(x,y,tol);return{points:hits.map(p=>({x:origin.x+p.x*scale,y:origin.y+p.y*scale})),status:'ok',visits:0};}
  const box=e=>({minx:Math.min(...e.controls.map(p=>p.x)),maxx:Math.max(...e.controls.map(p=>p.x)),miny:Math.min(...e.controls.map(p=>p.y)),maxy:Math.max(...e.controls.map(p=>p.y))}),size=r=>Math.max(r.maxx-r.minx,r.maxy-r.miny),overlap=(r,s)=>r.minx<=s.maxx+tol&&r.maxx>=s.minx-tol&&r.miny<=s.maxy+tol&&r.maxy>=s.miny-tol;
  const out=[],stack=[{a,b,t0:0,t1:1,u0:0,u1:1,depth:0}];let visits=0;
  function refine(t,u){for(let i=0;i<80;i++){const p=at(a,t),r=at(b,u),v=derivative(a,t),w=derivative(b,u),fx=p.x-r.x,fy=p.y-r.y,den=v.y*w.x-v.x*w.y;
    if(Math.abs(den)<1e-20)break;const dt=(fx*w.y-fy*w.x)/den,du=(v.y*fx-v.x*fy)/den;if(!Number.isFinite(dt+du))break;const nt=Math.max(0,Math.min(1,t+dt)),nu=Math.max(0,Math.min(1,u+du));if(Math.abs(nt-t)+Math.abs(nu-u)<2e-15){t=nt;u=nu;break;}t=nt;u=nu;}
   const p=at(a,t),r=at(b,u);if(distance(p,r)>tol*2)return;
   if(out.some(v=>Math.abs(v.t-t)<2e-7&&Math.abs(v.u-u)<2e-7||distance(v.local,p)<=tol*4))return;
   out.push({t,u,local:p,x:origin.x+(p.x+r.x)*scale/2,y:origin.y+(p.y+r.y)*scale/2});
  }
  while(stack.length){if(++visits>budget)return{points:[],status:'budget-exceeded',visits};const v=stack.pop(),ba=box(v.a),bb=box(v.b);if(!overlap(ba,bb))continue;
   if(v.depth>=64||Math.max(v.t1-v.t0,v.u1-v.u0)<1e-5||Math.max(size(ba),size(bb))<tol*8){refine((v.t0+v.t1)/2,(v.u0+v.u1)/2);continue;}
   if(size(ba)*(v.t1-v.t0)>=size(bb)*(v.u1-v.u0)){const [l,r]=split(v.a),m=(v.t0+v.t1)/2;stack.push({...v,a:r,t0:m,depth:v.depth+1},{...v,a:l,t1:m,depth:v.depth+1});}
   else{const [l,r]=split(v.b),m=(v.u0+v.u1)/2;stack.push({...v,b:r,u0:m,depth:v.depth+1},{...v,b:l,u1:m,depth:v.depth+1});}
  }
  // Shared endpoints can sit on a singular tangency and require no iteration.
  for(const t of[0,1])for(const u of[0,1])if(distance(at(a,t),at(b,u))<=tol*2)refine(t,u);
  return{points:out.sort((p,q)=>p.t-q.t).map(({x,y,t,u})=>({x,y,bezierParameters:[t,u]})),status:'ok',visits};
 }
 function intersections(o,q,tolerance=1e-7){if(is(q))return pair(o,q,{tolerance}).points;let ts=[];const x=coefficients(o,'x'),y=coefficients(o,'y');if(q.a&&q.b){const dx=q.b.x-q.a.x,dy=q.b.y-q.a.y,a=add(x.map(n=>n*dy),y.map(n=>-n*dx));a[0]+=q.a.y*dx-q.a.x*dy;ts=roots(a);return ts.map(t=>at(o,t)).filter(p=>{const t=root.geometryQuery.parameter(q,p);return q.mode==='line'||t>=-1e-9&&(q.mode==='ray'||t<=1+1e-9);});}
  if(root.cadEllipse.is(q)||['cadCircle','cadArc'].includes(q.type)){const e=root.cadEllipse.is(q)?q:{type:'cadEllipse',center:q.center,major:{x:q.radius,y:0},ratio:1,startParam:(q.startAngle||0)*Math.PI/180,sweepParam:(q.type==='cadCircle'?360:q.sweep)*Math.PI/180},controls=o.controls.map(p=>root.cadEllipse.local(e,p)),l={controls},a=coefficients(l,'x'),b=coefficients(l,'y'),c=add(mul(a,a),mul(b,b));c[0]-=1;ts=roots(c);return ts.map(t=>at(o,t)).filter(p=>root.cadEllipse.contains(e,root.cadEllipse.parameter(e,p)));}
  return[];
 }
 function tangent(o,p){if(!p)return[];const x=coefficients(o,'x'),y=coefficients(o,'y'),dx=x.slice(1).map((n,i)=>n*(i+1)),dy=y.slice(1).map((n,i)=>n*(i+1));x[0]-=p.x;y[0]-=p.y;return roots(add(mul(x,dy),mul(y,dx).map(n=>-n))).map(t=>at(o,t));}
 function svgPath(o){const p=o.controls,xy=p=>`${p.x} ${-p.y}`;return`M ${xy(p[0])} ${p.length===3?'Q':'C'} ${p.slice(1).map(xy).join(' ')}`;}
 root.cadBezier=Object.freeze({is,at,derivative,coefficients,roots,stationary,nearest,bounds,intersections,pair,split,fragment,tangent,svgPath});
})();
