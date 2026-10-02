/* Build55 CAD Core 2: uniform similarity transforms for persistent CAD entities. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const finite = Number.isFinite;
  const EPS = 1e-10;
  const point = (m,p)=>({x:m.a*p.x+m.c*p.y+m.tx,y:m.b*p.x+m.d*p.y+m.ty});
  const det = m=>m.a*m.d-m.b*m.c;
  const scaleOf = m=>Math.hypot(m.a,m.b);
  const identity = ()=>({a:1,b:0,c:0,d:1,tx:0,ty:0});
  function multiply(A,B){return{a:A.a*B.a+A.c*B.b,b:A.b*B.a+A.d*B.b,c:A.a*B.c+A.c*B.d,d:A.b*B.c+A.d*B.d,tx:A.a*B.tx+A.c*B.ty+A.tx,ty:A.b*B.tx+A.d*B.ty+A.ty};}
  const translate=(dx,dy)=>({a:1,b:0,c:0,d:1,tx:dx,ty:dy});
  function around(base,M){return multiply(translate(base.x,base.y),multiply(M,translate(-base.x,-base.y)));}
  function rotate(base,degrees){const r=degrees*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return around(base,{a:c,b:s,c:-s,d:c,tx:0,ty:0});}
  function scale(base,factor){if(!(factor>EPS))return null;return around(base,{a:factor,b:0,c:0,d:factor,tx:0,ty:0});}
  function mirror(a,b){const dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy);if(!(n>EPS))return null;const ux=dx/n,uy=dy/n;return around(a,{a:2*ux*ux-1,b:2*ux*uy,c:2*ux*uy,d:2*uy*uy-1,tx:0,ty:0});}
  function align(s1,s2,t1,t2,{scale:allowScale=false}={}){const su={x:s2.x-s1.x,y:s2.y-s1.y},tu={x:t2.x-t1.x,y:t2.y-t1.y},sl=Math.hypot(su.x,su.y),tl=Math.hypot(tu.x,tu.y);if(!(sl>EPS&&tl>EPS))return null;const a1=Math.atan2(su.y,su.x),a2=Math.atan2(tu.y,tu.x),r=a2-a1,f=allowScale?tl/sl:1,c=Math.cos(r)*f,s=Math.sin(r)*f;return multiply(translate(t1.x,t1.y),multiply({a:c,b:s,c:-s,d:c,tx:0,ty:0},translate(-s1.x,-s1.y)));}
  function validMatrix(m){if(!m||![m.a,m.b,m.c,m.d,m.tx,m.ty].every(finite))return false;const sx=Math.hypot(m.a,m.b),sy=Math.hypot(m.c,m.d);return sx>EPS&&sy>EPS&&Math.abs(sx-sy)<=1e-8*Math.max(sx,sy)&&Math.abs(m.a*m.c+m.b*m.d)<=1e-8*sx*sy;}
  function transformedAngle(m,degrees){const r=degrees*Math.PI/180,v={x:Math.cos(r),y:Math.sin(r)},q={x:m.a*v.x+m.c*v.y,y:m.b*v.x+m.d*v.y};return Math.atan2(q.y,q.x)*180/Math.PI;}
  function arc(o,m){const s=scaleOf(m),sign=Math.sign(det(m))||1;return{...o,center:point(m,o.center),radius:o.radius*s,startAngle:transformedAngle(m,o.startAngle||0),sweep:(o.sweep||0)*sign};}
  function dimension(o,m){const p1=point(m,o.p1),p2=point(m,o.p2),dx=o.p2.x-o.p1.x,dy=o.p2.y-o.p1.y,len=Math.hypot(dx,dy);let offset=Number(o.offset)||0;if(len>EPS){const nx=-dy/len,ny=dx/len,d1={x:o.p1.x+nx*offset,y:o.p1.y+ny*offset},td1=point(m,d1),ndx=p2.x-p1.x,ndy=p2.y-p1.y,nlen=Math.hypot(ndx,ndy);if(nlen>EPS)offset=(td1.x-p1.x)*(-ndy/nlen)+(td1.y-p1.y)*(ndx/nlen);}const out={...o,p1,p2,offset};if(Array.isArray(o.segments))out.segments=o.segments.map(s=>({a:point(m,s.a),b:point(m,s.b)}));return out;}
  function transform(o,m){if(!validMatrix(m)||!o)return null;const s=scaleOf(m),sign=Math.sign(det(m))||1;
    if(root.cadPolyline?.is(o))return root.cadPolyline.transform(o,m);
    if(o.type==='cadLine')return{...o,a:point(m,o.a),b:point(m,o.b)};
    if(o.type==='cadCircle')return{...o,center:point(m,o.center),radius:o.radius*s};
    if(o.type==='cadArc')return arc(o,m);
    if(o.type==='cadText')return{...o,point:point(m,o.point),height:(Number(o.height)||180)*s,rotation:transformedAngle(m,Number(o.rotation)||0),mirrored:sign<0?!Boolean(o.mirrored):Boolean(o.mirrored)};
    if(o.type==='cadDimension')return dimension(o,m);
    if(o.type==='cadHatch')return{...o,points:(o.points||[]).map(p=>point(m,p)),sourceBoundaryId:null};
    return null;
  }
  function supports(o){return Boolean(o&&(root.cadPolyline?.is(o)||['cadLine','cadCircle','cadArc','cadText','cadDimension','cadHatch'].includes(o.type)));}
  root.cadTransformOperations=Object.freeze({identity,multiply,translate,rotate,scale,mirror,align,point,det,scaleOf,validMatrix,transform,supports});
})();
