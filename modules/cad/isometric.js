/* 2D drafting aids only: projected unit axes and canonical planar ellipses. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},rad=v=>v*Math.PI/180,planes=['left','top','right'];
 const axes=plane=>({left:[90,150],top:[30,150],right:[30,90]})[plane]||null;
 function basis(plane){const a=axes(plane);if(!a)throw Error('invalid-isoplane');return a.map(v=>({x:Math.cos(rad(v)),y:Math.sin(rad(v))}));}
 function coordinates(p,plane){const[a,b]=basis(plane),det=a.x*b.y-a.y*b.x;return{x:(p.x*b.y-p.y*b.x)/det,y:(a.x*p.y-a.y*p.x)/det};}
 function point(p,plane){const[a,b]=basis(plane);return{x:a.x*p.x+b.x*p.y,y:a.y*p.x+b.y*p.y};}
 function grid(p,step,plane){if(!(step>0)||![p.x,p.y,step].every(Number.isFinite))throw Error('invalid-grid');const [a,b]=basis(plane),det=a.x*b.y-a.y*b.x,u=Math.round((p.x*b.y-p.y*b.x)/det/step)*step,v=Math.round((a.x*p.y-a.y*p.x)/det/step)*step;return{x:a.x*u+b.x*v,y:a.y*u+b.y*v};}
 function ortho(base,p,plane){const v={x:p.x-base.x,y:p.y-base.y};return basis(plane).map(a=>{const n=v.x*a.x+v.y*a.y,q={x:base.x+a.x*n,y:base.y+a.y*n};return{q,d:Math.hypot(q.x-p.x,q.y-p.y)};}).sort((a,b)=>a.d-b.d)[0].q;}
 function direction(value,plane,tolerance=7){const candidates=axes(plane);if(!candidates)return null;let best=null;for(const a of candidates)for(const v of [a,a+180]){const difference=Math.abs(((value-v+540)%360+360)%360-180);if(difference<=tolerance&&(!best||difference<best.d))best={angle:v,d:difference};}return best?.angle??null;}
 function circle(center,radius,plane,frame={angle:0,handedness:1}){if(!(radius>1e-8)||!Number.isFinite(radius))return null;const [u,v]=basis(plane),xx=u.x*u.x+v.x*v.x,yy=u.y*u.y+v.y*v.y,xy=u.x*u.y+v.x*v.y,theta=.5*Math.atan2(2*xy,xx-yy),angle=rad(frame.angle)+theta*(frame.handedness||1),major=radius*Math.sqrt(1.5);return M.cadEllipse.create(center,{x:Math.cos(angle)*major,y:Math.sin(angle)*major},radius*Math.sqrt(.5));}
 M.cadIsometric=Object.freeze({planes,axes,basis,coordinates,point,grid,ortho,direction,circle,next:plane=>planes[(planes.indexOf(plane)+1)%planes.length]});
})();
