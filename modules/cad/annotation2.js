/* Pure Annotation v2 geometry helpers. World units are canonical mm; angles are degrees. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const EPS=1e-9;
  const dist=(a,b)=>Math.hypot((b?.x||0)-(a?.x||0),(b?.y||0)-(a?.y||0));
  const pointAt=(c,r,a)=>({x:c.x+Math.cos(a*Math.PI/180)*r,y:c.y+Math.sin(a*Math.PI/180)*r});
  const angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
  const norm=a=>(a%360+360)%360;
  const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
  function aligned(o){
    if(!point(o?.p1)||!point(o?.p2)||!Number.isFinite(o?.offset))return null;
    const dx=o.p2.x-o.p1.x,dy=o.p2.y-o.p1.y,len=Math.hypot(dx,dy);if(len<EPS)return null;
    const nx=-dy/len,ny=dx/len,d1={x:o.p1.x+nx*o.offset,y:o.p1.y+ny*o.offset},d2={x:o.p2.x+nx*o.offset,y:o.p2.y+ny*o.offset};
    return{kind:'aligned',p1:{...o.p1},p2:{...o.p2},d1,d2,len,labelPoint:{x:(d1.x+d2.x)/2,y:(d1.y+d2.y)/2},segments:[{a:{...o.p1},b:d1},{a:{...o.p2},b:d2},{a:d1,b:d2}]};
  }
  function linear(o){
    if(!point(o?.p1)||!point(o?.p2)||!Number.isFinite(o.offset)||!Number.isFinite(o.dimensionAngle))return null;
    const a=o.dimensionAngle*Math.PI/180,u={x:Math.cos(a),y:Math.sin(a)},n={x:-u.y,y:u.x},q={x:o.p1.x+n.x*o.offset,y:o.p1.y+n.y*o.offset},project=p=>{const t=(p.x-q.x)*u.x+(p.y-q.y)*u.y;return{x:q.x+u.x*t,y:q.y+u.y*t};},d1=project(o.p1),d2=project(o.p2),len=dist(d1,d2);if(len<EPS)return null;
    return{kind:'linear',p1:{...o.p1},p2:{...o.p2},d1,d2,len,labelPoint:{x:(d1.x+d2.x)/2,y:(d1.y+d2.y)/2},segments:[{a:{...o.p1},b:d1},{a:{...o.p2},b:d2},{a:d1,b:d2}]};
  }
  function radial(o){
    if(!point(o?.center)||!Number.isFinite(o?.radius)||o.radius<=0)return null;
    const r=o.radius,label=point(o.labelPoint)?{...o.labelPoint}:pointAt(o.center,r,0),a=angle(o.center,label),edge=pointAt(o.center,r,a),diameter=o.kind==='diameter';
    const start=diameter?pointAt(o.center,r,a+180):{...o.center},end=label;
    return{kind:diameter?'diameter':'radius',center:{...o.center},radius:r,edge,start,end,labelPoint:label,value:diameter?r*2:r,segments:[{a:start,b:end}]};
  }
  function angular(o){
    if(!point(o?.vertex)||!point(o?.ray1)||!point(o?.ray2))return null;
    const a1=angle(o.vertex,o.ray1),a2=angle(o.vertex,o.ray2);let sweep=norm(a2-a1);if(sweep>180)sweep-=360;const value=Math.abs(sweep);if(value<EPS)return null;
    const radius=Math.max(1,Number(o.radius)||Math.min(dist(o.vertex,o.ray1),dist(o.vertex,o.ray2))*.72||500),endAngle=a1+sweep,mid=a1+sweep/2;
    const s=pointAt(o.vertex,radius,a1),e=pointAt(o.vertex,radius,endAngle),labelPoint=point(o.labelPoint)?{...o.labelPoint}:pointAt(o.vertex,radius*1.12,mid);
    const segments=[{a:{...o.vertex},b:s},{a:{...o.vertex},b:e}],n=Math.max(4,Math.ceil(Math.abs(sweep)/12));let prev=s;for(let i=1;i<=n;i++){const q=pointAt(o.vertex,radius,a1+sweep*i/n);segments.push({a:prev,b:q});prev=q;}return{kind:'angular',vertex:{...o.vertex},ray1:{...o.ray1},ray2:{...o.ray2},radius,startAngle:a1,sweep,value,start:s,end:e,labelPoint,segments};
  }
  function geometry(o){const kind=o?.kind||'aligned';if(kind==='linear')return linear(o);if(kind==='radius'||kind==='diameter')return radial(o);if(kind==='angular')return angular(o);return aligned(o);}
  function segments(o){const g=geometry(o);if(!g)return[];return g.segments||[];}
  root.cadAnnotation2=Object.freeze({geometry,aligned,linear,radial,angular,segments,pointAt,angle,norm});
})();
