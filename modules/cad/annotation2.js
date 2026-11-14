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
  const obliqueKey='oblique104',obliqueCapability='cad.dimension.oblique.v1';
  const obliqueBase=o=>(o.kind||'aligned')==='linear'?o.dimensionAngle:angle(o.p1,o.p2);
  function obliqueRelative(value){if(!Number.isFinite(value))throw Error('invalid-dimension-oblique-angle');const n=(value%180+180)%180;return n===0||Math.abs(n-90)<1e-10?90:n;}
  function validateOblique(o){if(o?.type!=='cadDimension'||!['linear','aligned'].includes(o.kind||'aligned')||!point(o.p1)||!point(o.p2)||!Number.isFinite(o.offset))throw Error('invalid-dimension-oblique-owner');const v=o[obliqueKey];if(!v||v.version!==1||Object.keys(v).some(k=>!['version','angle'].includes(k))||!Number.isFinite(v.angle)||v.angle<=0||v.angle>=180)throw Error('invalid-dimension-oblique');return true;}
  function obliqueGeometry(o,g){if(!Object.hasOwn(o,obliqueKey))return g;try{validateOblique(o.type==null?{...o,type:'cadDimension'}:o);}catch{return null;}if(!g)return null;const a=obliqueBase(o)*Math.PI/180,b=(obliqueBase(o)+o[obliqueKey].angle)*Math.PI/180,n={x:-Math.sin(a),y:Math.cos(a)},v={x:Math.cos(b),y:Math.sin(b)},den=v.x*n.x+v.y*n.y;if(Math.abs(den)<EPS)return null;const parameter=p=>(o.offset-(p.x-o.p1.x)*n.x-(p.y-o.p1.y)*n.y)/den,project=p=>{const t=parameter(p);return{x:p.x+v.x*t,y:p.y+v.y*t};},d1=project(o.p1),d2=project(o.p2);if(!point(d1)||!point(d2)||dist(d1,d2)<EPS)return null;return{...g,d1,d2,extensionDirections:[o.p1,o.p2].map(p=>{const sign=Math.sign(parameter(p))||Math.sign(o.offset)||1;return{x:v.x*sign,y:v.y*sign};}),labelPoint:{x:(d1.x+d2.x)/2,y:(d1.y+d2.y)/2},segments:[{a:{...o.p1},b:d1},{a:{...o.p2},b:d2},{a:d1,b:d2}]};}
  function nativeObliqueNeedsOverride(o){const values=(o.dxf?.raw||[]).filter(p=>p[0]===52);return values.length>1||values.some(p=>String(p[1]).trim()===''||!Number.isFinite(Number(p[1]))||obliqueRelative(Number(p[1]))!==90);}
  function setOblique(o,worldAngle){if(!['linear','aligned'].includes(o?.kind||'aligned')||o.type!=='cadDimension'||o.floorId||o.planRole||!Number.isFinite(worldAngle)||!Number.isFinite(obliqueBase(o)))throw Error('unsupported-dimension-oblique');const value=obliqueRelative(worldAngle-obliqueBase(o)),nativeReset=nativeObliqueNeedsOverride(o);if(value===90&&!Object.hasOwn(o,obliqueKey)&&!nativeReset||o[obliqueKey]?.angle===value)return o;const q=JSON.parse(JSON.stringify(o));if(value===90&&!nativeReset)delete q[obliqueKey];else q[obliqueKey]={version:1,angle:value};delete q.dxfPresentation;return q;}
  const transformOblique=(o,m)=>{if(!Object.hasOwn(o,obliqueKey))return o;validateOblique(o);return m.a*m.d-m.b*m.c<0?{...o,[obliqueKey]:{version:1,angle:180-o[obliqueKey].angle}}:o;};
  function aligned(o){
    if(!point(o?.p1)||!point(o?.p2)||!Number.isFinite(o?.offset))return null;
    const dx=o.p2.x-o.p1.x,dy=o.p2.y-o.p1.y,len=Math.hypot(dx,dy);if(len<EPS)return null;
    const nx=-dy/len,ny=dx/len,d1={x:o.p1.x+nx*o.offset,y:o.p1.y+ny*o.offset},d2={x:o.p2.x+nx*o.offset,y:o.p2.y+ny*o.offset};
    return obliqueGeometry(o,{kind:'aligned',p1:{...o.p1},p2:{...o.p2},d1,d2,len,labelPoint:{x:(d1.x+d2.x)/2,y:(d1.y+d2.y)/2},segments:[{a:{...o.p1},b:d1},{a:{...o.p2},b:d2},{a:d1,b:d2}]});
  }
  function linear(o){
    if(!point(o?.p1)||!point(o?.p2)||!Number.isFinite(o.offset)||!Number.isFinite(o.dimensionAngle))return null;
    const a=o.dimensionAngle*Math.PI/180,u={x:Math.cos(a),y:Math.sin(a)},n={x:-u.y,y:u.x},q={x:o.p1.x+n.x*o.offset,y:o.p1.y+n.y*o.offset},project=p=>{const t=(p.x-q.x)*u.x+(p.y-q.y)*u.y;return{x:q.x+u.x*t,y:q.y+u.y*t};},d1=project(o.p1),d2=project(o.p2),len=dist(d1,d2);if(len<EPS)return null;
    return obliqueGeometry(o,{kind:'linear',p1:{...o.p1},p2:{...o.p2},d1,d2,len,labelPoint:{x:(d1.x+d2.x)/2,y:(d1.y+d2.y)/2},segments:[{a:{...o.p1},b:d1},{a:{...o.p2},b:d2},{a:d1,b:d2}]});
  }
  function radial(o){
    if(!point(o?.center)||!Number.isFinite(o?.radius)||o.radius<=0)return null;
    const r=o.radius,label=point(o.labelPoint)?{...o.labelPoint}:pointAt(o.center,r,0),a=o.radialDirection105?root.cadRadialPlacement.validateDirection(o):angle(o.center,label),edge=pointAt(o.center,r,a),diameter=o.kind==='diameter';
    const start=diameter?pointAt(o.center,r,a+180):{...o.center},u={x:Math.cos(a*Math.PI/180),y:Math.sin(a*Math.PI/180)},projection=(label.x-o.center.x)*u.x+(label.y-o.center.y)*u.y,collinear=Math.abs((label.x-o.center.x)*u.y-(label.y-o.center.y)*u.x)<1e-8*Math.max(1,r,Math.hypot(label.x-o.center.x,label.y-o.center.y)),end=o.radialDirection105&&!(collinear&&projection>r)?edge:label;
    const g={kind:diameter?'diameter':'radius',center:{...o.center},radius:r,edge,start,end,labelPoint:label,value:diameter?r*2:r,segments:[{a:start,b:end}]};if(o.radialDirection105&&!diameter){const projected=(label.x-o.center.x)*Math.cos(a*Math.PI/180)+(label.y-o.center.y)*Math.sin(a*Math.PI/180);g.arrowMarkers=[[edge,pointAt(edge,1,a+(projected>r?0:180))]];}return o.radialOptions99?root.cadRadialPlacement.geometry(o,g):g;
  }
  function angular(o){
    if(o?.angularPlacement98){const g=root.cadAngularPlacement.geometry(o);return g?{...g,segments:root.cadAngularPlacement.segments(o)}:null;}
    if(!point(o?.vertex)||!point(o?.ray1)||!point(o?.ray2))return null;
    const a1=angle(o.vertex,o.ray1),a2=angle(o.vertex,o.ray2);let sweep=norm(a2-a1);if(sweep>180)sweep-=360;const value=Math.abs(sweep);if(value<EPS)return null;
    const radius=Math.max(1,Number(o.radius)||Math.min(dist(o.vertex,o.ray1),dist(o.vertex,o.ray2))*.72||500),endAngle=a1+sweep,mid=a1+sweep/2;
    const s=pointAt(o.vertex,radius,a1),e=pointAt(o.vertex,radius,endAngle),labelPoint=point(o.labelPoint)?{...o.labelPoint}:pointAt(o.vertex,radius*1.12,mid);
    const segments=[{a:{...o.vertex},b:s},{a:{...o.vertex},b:e}],n=Math.max(4,Math.ceil(Math.abs(sweep)/12));let prev=s;for(let i=1;i<=n;i++){const q=pointAt(o.vertex,radius,a1+sweep*i/n);segments.push({a:prev,b:q});prev=q;}return{kind:'angular',vertex:{...o.vertex},ray1:{...o.ray1},ray2:{...o.ray2},radius,startAngle:a1,sweep,value,start:s,end:e,labelPoint,segments};
  }
  function geometry(o){const kind=o?.kind||'aligned',g=kind==='joggedRadius'?root.cadJoggedRadius?.geometry(o):kind==='arcLength'?root.cadArcLength?.geometry(o):kind==='ordinate'?root.cadOrdinate?.geometry(o):kind==='linear'?linear(o):kind==='radius'||kind==='diameter'?radial(o):kind==='angular'?angular(o):aligned(o);return root.cadDimensionText?.geometry(o,g)||g;}
  function segments(o){const g=geometry(o);if(!g)return[];return g.segments||[];}
  root.cadAnnotation2=Object.freeze({geometry,aligned,linear,radial,angular,segments,pointAt,angle,norm});
  root.cadDimensionOblique=Object.freeze({key:obliqueKey,capability:obliqueCapability,baseAngle:obliqueBase,relative:obliqueRelative,validateOwner:validateOblique,set:setOblique,transform:transformOblique,unmodeledNative:o=>!Object.hasOwn(o,obliqueKey)&&nativeObliqueNeedsOverride(o),required:objects=>objects.some(o=>Object.hasOwn(o,obliqueKey))});
})();
