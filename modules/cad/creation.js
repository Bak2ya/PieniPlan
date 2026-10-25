/* Exact 2D construction helpers; canonical millimetres/degrees, no model writes. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},rad=n=>n*Math.PI/180;
 const dist=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y),finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 function circle3(a,b,c){if(![a,b,c].every(finite))return null;const bx=b.x-a.x,by=b.y-a.y,cx=c.x-a.x,cy=c.y-a.y,d=2*(bx*cy-by*cx);if(Math.abs(d)<1e-12*Math.max(1,dist(a,b)*dist(a,c)))return null;const u=(cy*(bx*bx+by*by)-by*(cx*cx+cy*cy))/d,v=(bx*(cx*cx+cy*cy)-cx*(bx*bx+by*by))/d;return{center:{x:a.x+u,y:a.y+v},radius:Math.hypot(u,v)};}
 function arc3(start,end,through){const g=circle3(start,through,end);if(!g)return null;const angle=p=>Math.atan2(p.y-g.center.y,p.x-g.center.x)*180/Math.PI,a=angle(start),b=angle(end),m=angle(through),ccw=((b-a)%360+360)%360,mid=((m-a)%360+360)%360;return{...g,startAngle:a,sweep:mid<ccw?ccw:ccw-360};}
 function arcCenter(start,center,end,angle=null){const radius=dist(center,start);if(!(radius>1e-8))return null;const startAngle=Math.atan2(start.y-center.y,start.x-center.x)*180/Math.PI,sweep=angle??((Math.atan2(end.y-center.y,end.x-center.x)*180/Math.PI-startAngle)%360+360)%360;if(!Number.isFinite(sweep)||Math.abs(sweep)<1e-8||Math.abs(sweep)>=360-1e-8)return null;return{center:{...center},radius,startAngle,sweep};}
 function arcEndAngle(start,end,sweep){
  if(!finite(start)||!finite(end)||!Number.isFinite(sweep)||Math.abs(sweep)<1e-7||Math.abs(sweep)>=360-1e-7)return null;
  const dx=end.x-start.x,dy=end.y-start.y,chord=Math.hypot(dx,dy);if(chord<1e-8)return null;
  const h=chord/(2*Math.tan(rad(sweep)/2)),center={x:start.x+dx/2-dy/chord*h,y:start.y+dy/2+dx/chord*h};
  return arcCenter(start,center,null,sweep);
 }
 function arcEndRadius(start,end,radius){const chord=dist(start,end),r=Math.abs(radius);if(!(r>1e-8)||chord<1e-8||chord>2*r*(1+1e-12))return null;const minor=2*Math.asin(Math.min(1,chord/(2*r)))*180/Math.PI;return arcEndAngle(start,end,radius<0?360-minor:minor);}
 function arcTangent(start,end,direction){
  if(!finite(start)||!finite(end)||!Number.isFinite(direction))return null;const dx=end.x-start.x,dy=end.y-start.y,tx=Math.cos(rad(direction)),ty=Math.sin(rad(direction)),cross=tx*dy-ty*dx,n=dx*dx+dy*dy;
  if(n<1e-16||Math.abs(cross)<1e-12*Math.sqrt(n))return null;
  const signedRadius=n/(2*cross),center={x:start.x-ty*signedRadius,y:start.y+tx*signedRadius},a=Math.atan2(start.y-center.y,start.x-center.x)*180/Math.PI,b=Math.atan2(end.y-center.y,end.x-center.x)*180/Math.PI;
  const sweep=signedRadius>0?((b-a)%360+360)%360:-((a-b)%360+360)%360;return arcCenter(start,center,null,sweep);
 }
 function arcCenterChord(start,center,chord){const r=dist(start,center);if(!(r>1e-8)||!Number.isFinite(chord)||Math.abs(chord)<1e-8||Math.abs(chord)>2*r*(1+1e-12))return null;const a=2*Math.asin(Math.min(1,Math.abs(chord)/(2*r)))*180/Math.PI;return arcCenter(start,center,null,chord<0?360-a:a);}
 function rectangle(first,opposite,{rotation=0,fillet=0,chamfer=[0,0],width=0}={}){
  if(!finite(first)||!finite(opposite)||![rotation,fillet,width,...chamfer].every(Number.isFinite)||fillet<0||width<0||chamfer.some(n=>n<0))return null;
  const a=rad(rotation),c=Math.cos(a),s=Math.sin(a),dx=opposite.x-first.x,dy=opposite.y-first.y,x=dx*c+dy*s,y=-dx*s+dy*c,L=Math.abs(x),H=Math.abs(y),sx=Math.sign(x),sy=Math.sign(y);
  if(L<1e-8||H<1e-8)return null;const map=p=>({x:first.x+sx*p.x*c-sy*p.y*s,y:first.y+sx*p.x*s+sy*p.y*c,bulge:(p.bulge||0)*sx*sy,...(width?{startWidth:width,endWidth:width}:{})});
  const compact=points=>points.filter((p,i)=>dist(p,points[(i+1)%points.length])>1e-8).map(map);
  if(fillet>0){if(2*fillet>Math.min(L,H)+1e-8)return null;const r=Math.min(fillet,L/2,H/2),b=Math.tan(Math.PI/8);return compact([{x:r,y:0},{x:L-r,y:0,bulge:b},{x:L,y:r},{x:L,y:H-r,bulge:b},{x:L-r,y:H},{x:r,y:H,bulge:b},{x:0,y:H-r},{x:0,y:r,bulge:b}]);}
  const [u,v]=chamfer;if(u||v){if(u+v>Math.min(L,H)+1e-8)return null;return compact([{x:v,y:0},{x:L-u,y:0},{x:L,y:v},{x:L,y:H-u},{x:L-v,y:H},{x:u,y:H},{x:0,y:H-v},{x:0,y:u}]);}
  return[{x:0,y:0},{x:L,y:0},{x:L,y:H},{x:0,y:H}].map(map);
 }
 function polygon(count,center,radius,angle=0,circumscribed=false){if(!Number.isInteger(count)||count<3||count>1024||!finite(center)||!(radius>1e-8))return null;const r=radius/(circumscribed?Math.cos(Math.PI/count):1),a=rad(angle)+(circumscribed?Math.PI/count:0);return Array.from({length:count},(_,i)=>({x:center.x+r*Math.cos(a+i*2*Math.PI/count),y:center.y+r*Math.sin(a+i*2*Math.PI/count)}));}
 function polygonEdge(count,a,b){if(!Number.isInteger(count)||count<3||count>1024||!finite(a)||!finite(b)||dist(a,b)<1e-8)return null;const points=[{...a},{...b}];let dx=b.x-a.x,dy=b.y-a.y;const c=Math.cos(2*Math.PI/count),s=Math.sin(2*Math.PI/count);for(let i=2;i<count;i++){[dx,dy]=[c*dx-s*dy,s*dx+c*dy];points.push({x:points.at(-1).x+dx,y:points.at(-1).y+dy});}return points;}
 function tangentLines(a,b,r,pickA,pickB){if(a?.type!=='cadLine'||b?.type!=='cadLine'||!(r>1e-8))return null;const la=dist(a.a,a.b),lb=dist(b.a,b.b);if(!la||!lb)return null;const u={x:(a.b.x-a.a.x)/la,y:(a.b.y-a.a.y)/la},v={x:(b.b.x-b.a.x)/lb,y:(b.b.y-b.a.y)/lb},den=u.x*v.y-u.y*v.x;if(Math.abs(den)<1e-10)return null;const out=[];for(const sa of [-1,1])for(const sb of [-1,1]){const aa={x:a.a.x-u.y*r*sa,y:a.a.y+u.x*r*sa},bb={x:b.a.x-v.y*r*sb,y:b.a.y+v.x*r*sb},t=((bb.x-aa.x)*v.y-(bb.y-aa.y)*v.x)/den,center={x:aa.x+u.x*t,y:aa.y+u.y*t},ta={x:center.x+u.y*r*sa,y:center.y-u.x*r*sa},tb={x:center.x+v.y*r*sb,y:center.y-v.x*r*sb};out.push({center,radius:r,score:dist(ta,pickA)+dist(tb,pickB)});}out.sort((a,b)=>a.score-b.score);return out[0];}
 function tangentPair(a,b,r,pickA,pickB){
  const G=root.geometryQuery,allowed=o=>['cadLine','cadCircle','cadArc'].includes(o?.type);if(!allowed(a)||!allowed(b)||a.id&&a.id===b.id||!(r>1e-8))return null;
  const loci=o=>{if(o.type==='cadLine'){const len=dist(o.a,o.b);if(len<1e-9)return[];const nx=-(o.b.y-o.a.y)/len,ny=(o.b.x-o.a.x)/len;return[-1,1].map(sign=>({a:{x:o.a.x+nx*r*sign,y:o.a.y+ny*r*sign},b:{x:o.b.x+nx*r*sign,y:o.b.y+ny*r*sign},mode:'line'}));}return[o.radius+r,Math.abs(o.radius-r)].filter((n,i,a)=>n>1e-8&&a.indexOf(n)===i).map(radius=>({type:'cadCircle',center:o.center,radius}));};
  const touch=(o,c)=>{if(o.type==='cadLine')return G.projectNearest({...o,mode:'line'},c)?.point;const d=dist(c,o.center);if(d<1e-8)return null;const k=(d*d+o.radius*o.radius-r*r)/(2*d*o.radius),q={x:o.center.x+(c.x-o.center.x)/d*o.radius*Math.sign(k),y:o.center.y+(c.y-o.center.y)/d*o.radius*Math.sign(k)};return G.onArc(o,q)?q:null;};
  const out=[];for(const x of loci(a))for(const y of loci(b))for(const center of G.intersections(x,y)){const ta=touch(a,center),tb=touch(b,center);if(!ta||!tb||Math.abs(dist(ta,center)-r)>1e-6||Math.abs(dist(tb,center)-r)>1e-6)continue;out.push({center:{x:center.x,y:center.y},radius:r,tangentA:ta,tangentB:tb,score:dist(ta,pickA)+dist(tb,pickB)});}return out.sort((a,b)=>a.score-b.score)[0]||null;
 }
 root.cadCreation=Object.freeze({circle3,arc3,arcCenter,arcEndAngle,arcEndRadius,arcTangent,arcCenterChord,rectangle,polygon,polygonEdge,tangentLines,tangentPair});
})();
