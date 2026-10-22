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
 function intersections(o,q){let ts=[];const x=coefficients(o,'x'),y=coefficients(o,'y');if(q.a&&q.b){const dx=q.b.x-q.a.x,dy=q.b.y-q.a.y,a=add(x.map(n=>n*dy),y.map(n=>-n*dx));a[0]+=q.a.y*dx-q.a.x*dy;ts=roots(a);return ts.map(t=>at(o,t)).filter(p=>{const t=root.geometryQuery.parameter(q,p);return q.mode==='line'||t>=-1e-9&&(q.mode==='ray'||t<=1+1e-9);});}
  if(root.cadEllipse.is(q)||['cadCircle','cadArc'].includes(q.type)){const e=root.cadEllipse.is(q)?q:{type:'cadEllipse',center:q.center,major:{x:q.radius,y:0},ratio:1,startParam:(q.startAngle||0)*Math.PI/180,sweepParam:(q.type==='cadCircle'?360:q.sweep)*Math.PI/180},controls=o.controls.map(p=>root.cadEllipse.local(e,p)),l={controls},a=coefficients(l,'x'),b=coefficients(l,'y'),c=add(mul(a,a),mul(b,b));c[0]-=1;ts=roots(c);return ts.map(t=>at(o,t)).filter(p=>root.cadEllipse.contains(e,root.cadEllipse.parameter(e,p)));}
  // Exact Bezier/Bezier intersections are not yet offered by editing commands.
  return[];
 }
 function tangent(o,p){if(!p)return[];const x=coefficients(o,'x'),y=coefficients(o,'y'),dx=x.slice(1).map((n,i)=>n*(i+1)),dy=y.slice(1).map((n,i)=>n*(i+1));x[0]-=p.x;y[0]-=p.y;return roots(add(mul(x,dy),mul(y,dx).map(n=>-n))).map(t=>at(o,t));}
 function svgPath(o){const p=o.controls,xy=p=>`${p.x} ${-p.y}`;return`M ${xy(p[0])} ${p.length===3?'Q':'C'} ${p.slice(1).map(xy).join(' ')}`;}
 root.cadBezier=Object.freeze({is,at,derivative,coefficients,roots,stationary,nearest,bounds,intersections,tangent,svgPath});
})();
