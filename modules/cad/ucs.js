/* Planar input coordinate frames. Stored geometry always remains in common WCS/mm. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},capability='cad.ucs.v1',copy=x=>JSON.parse(JSON.stringify(x)),finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),rad=n=>n*Math.PI/180;
 const world=()=>({origin:{x:0,y:0},angle:0,handedness:1}),angle=n=>{const q=((n%360)+360)%360;return Math.abs(q)<1e-10||Math.abs(q-360)<1e-10?0:q;};
 function frame(q){if(!q||!finite(q.origin)||!Number.isFinite(q.angle)||![undefined,1,-1].includes(q.handedness)||Object.keys(q).some(k=>!['origin','angle','handedness'].includes(k))||Object.keys(q.origin).some(k=>!['x','y'].includes(k)))throw Error('invalid-ucs-frame');return{origin:{x:q.origin.x,y:q.origin.y},angle:angle(q.angle),handedness:q.handedness??1};}
 function name(value){if(typeof value!=='string'||!value.trim()||value.length>128||/[\x00-\x1f<>/\\":;?*|=]/.test(value)||['WORLD','PREVIOUS','*WORLD*'].includes(value.trim().toUpperCase()))throw Error('invalid-ucs-name');return value.trim();}
 function validate(value){if(value==null)return{version:1,current:world(),named:[]};if(value.version!==1||!Array.isArray(value.named)||value.named.length>256||Object.keys(value).some(k=>!['version','current','named'].includes(k)))throw Error('invalid-ucs-library');const seen=new Set(),current=frame(value.current),named=value.named.map(q=>{if(!q||Object.keys(q).some(k=>!['name','frame'].includes(k)))throw Error('invalid-ucs-definition');const n=name(q.name),key=n.toUpperCase();if(seen.has(key))throw Error('duplicate-ucs-name');seen.add(key);return{name:n,frame:frame(q.frame)};});return{version:1,current,named};}
 function vector(q,p){const f=frame(q),c=Math.cos(rad(f.angle)),s=Math.sin(rad(f.angle));return{x:c*p.x-f.handedness*s*p.y,y:s*p.x+f.handedness*c*p.y};}
 function localVector(q,p){const f=frame(q),c=Math.cos(rad(f.angle)),s=Math.sin(rad(f.angle));return{x:c*p.x+s*p.y,y:f.handedness*(-s*p.x+c*p.y)};}
 function toWorld(q,p){const f=frame(q),v=vector(f,p);return{x:f.origin.x+v.x,y:f.origin.y+v.y};}
 function toLocal(q,p){const f=frame(q);return localVector(f,{x:p.x-f.origin.x,y:p.y-f.origin.y});}
 function fromPoints(origin,xPoint,yPoint=null,handedness=1){if(!finite(origin)||!finite(xPoint)||Math.hypot(xPoint.x-origin.x,xPoint.y-origin.y)<1e-8)throw Error('invalid-ucs-axis');const x=xPoint.x-origin.x,y=xPoint.y-origin.y;if(yPoint){if(!finite(yPoint))throw Error('invalid-ucs-axis');const cross=x*(yPoint.y-origin.y)-y*(yPoint.x-origin.x);if(Math.abs(cross)<1e-8*Math.max(1,Math.hypot(x,y)*Math.hypot(yPoint.x-origin.x,yPoint.y-origin.y)))throw Error('collinear-ucs-points');handedness=Math.sign(cross);}return frame({origin,angle:Math.atan2(y,x)*180/Math.PI,handedness});}
 function create(value=null,history=[]){if(!Array.isArray(history)||history.length>10)throw Error('invalid-ucs-history');let library=validate(value),previous=history.map(frame);
  function apply(next,{remember=true}={}){next=frame(next);if(JSON.stringify(next)===JSON.stringify(library.current))return false;if(remember){previous.unshift(copy(library.current));previous=previous.slice(0,10);}library={...library,current:next};return true;}
  function restore(n){const q=library.named.find(q=>q.name.toUpperCase()===String(n).toUpperCase());if(!q)throw Error('missing-ucs-name');return apply(q.frame);}
  function save(n,{replace=false}={}){n=name(n);const old=library.named.find(q=>q.name.toUpperCase()===n.toUpperCase());if(old&&!replace)throw Error('ucs-name-exists');if(!old&&library.named.length>=256)throw Error('ucs-definition-budget');library={...library,named:old?library.named.map(q=>q===old?{name:q.name,frame:copy(library.current)}:q):[...library.named,{name:n,frame:copy(library.current)}]};return true;}
  function remove(n){const index=library.named.findIndex(q=>q.name.toUpperCase()===String(n).toUpperCase());if(index<0)throw Error('missing-ucs-name');library={...library,named:library.named.filter((_,i)=>i!==index)};return true;}
  return Object.freeze({value:()=>copy(library),current:()=>copy(library.current),history:()=>copy(previous),apply,world:()=>apply(world()),origin:p=>apply({...library.current,origin:p}),rotate:n=>{if(!Number.isFinite(n))throw Error('invalid-ucs-angle');return apply({...library.current,angle:library.current.angle+library.current.handedness*n});},previous:()=>{if(!previous.length)return false;const q=previous.shift();return apply(q,{remember:false});},save,restore,remove,rename(from,to){to=name(to);const old=library.named.find(q=>q.name.toUpperCase()===String(from).toUpperCase());if(!old)throw Error('missing-ucs-name');if(library.named.some(q=>q!==old&&q.name.toUpperCase()===to.toUpperCase()))throw Error('ucs-name-exists');library={...library,named:library.named.map(q=>q===old?{...q,name:to}:q)};return true;},load:q=>{library=validate(q);previous=[];},toWorld:p=>toWorld(library.current,p),toLocal:p=>toLocal(library.current,p),vector:p=>vector(library.current,p),localVector:p=>localVector(library.current,p)});
 }
 function objectFrame(o,p,current=world(),{allowed=()=>true}={}){if(!o||!finite(p)||!allowed(o)||o.type==='cadXline')return null;
  if(M.cadBlocks?.is(o)){const m=o.matrix;return frame({origin:{x:m.tx,y:m.ty},angle:Math.atan2(m.b,m.a)*180/Math.PI,handedness:Math.sign(m.a*m.d-m.b*m.c)});}
  const parts=o.type==='cadDxfRecord'?o.preview:M.cadPolylineWidth?.isAffine(o)?M.cadPolylineWidth.affineEdges(o):M.cadPolyline?.is(o)?M.cadPolyline.get(o).edges:M.cadHatchCurves?.is(o)?M.cadHatchCurves.loops(o).flat():null;
  if(parts){const child=parts.filter(allowed).map(q=>({q,n:M.geometryQuery.projectNearest(q,p)})).filter(x=>x.n).sort((a,b)=>a.n.distance-b.n.distance)[0]?.q;return child?objectFrame(child,p,current,{allowed}):null;}
  if(o.type==='cadPoint')return frame({...current,origin:o.point});
  if(o.type==='cadText'){if(o.affine){const q=objectFrame(o.affine.original,p,current,{allowed}),m=o.affine.matrix,v=vector(q,{x:1,y:0});return frame({origin:M.cadBlocks.point(m,q.origin),angle:Math.atan2(m.b*v.x+m.d*v.y,m.a*v.x+m.c*v.y)*180/Math.PI,handedness:Math.sign(m.a*m.d-m.b*m.c)*q.handedness});}return frame({origin:o.point,angle:o.rotation||0,handedness:1});}
  if(o.type==='cadDimension'&&finite(o.p1)&&finite(o.p2))return objectFrame({type:'cadLine',a:o.p1,b:o.p2},p,current);
  if(o.type==='cadLeader'&&o.points?.length>1)return objectFrame({type:'cadLine',a:o.points[0],b:o.points[1]},p,current);
  const ends=M.cadPrecision?.endpoints(o);if(ends){const start=Math.hypot(p.x-ends[0].x,p.y-ends[0].y)<=Math.hypot(p.x-ends[1].x,p.y-ends[1].y),origin=ends[start?0:1];let v;
   if(o.a&&o.b)v={x:(o.b.x-o.a.x)*(start?1:-1),y:(o.b.y-o.a.y)*(start?1:-1)};
   else if(M.cadBezier?.is(o)){v=M.cadBezier.derivative(o,start?0:1);if(!start)v={x:-v.x,y:-v.y};}
   else if(M.cadEllipse?.is(o)){const t=o.startParam+(start?0:o.sweepParam),minor=M.cadEllipse.minor(o),sign=Math.sign(o.sweepParam)*(start?1:-1);v={x:sign*(-o.major.x*Math.sin(t)+minor.x*Math.cos(t)),y:sign*(-o.major.y*Math.sin(t)+minor.y*Math.cos(t))};}
   else if(o.type==='cadArc'){const sign=Math.sign(o.sweep)*(start?1:-1);v={x:-sign*(origin.y-o.center.y),y:sign*(origin.x-o.center.x)};}
   return v&&Math.hypot(v.x,v.y)>1e-10?fromPoints(origin,{x:origin.x+v.x,y:origin.y+v.y},null,current.handedness):null;
  }
  if(M.cadEllipse?.is(o))return fromPoints(o.center,{x:o.center.x+o.major.x,y:o.center.y+o.major.y},null,current.handedness);
  if(o.type==='cadCircle'){const n=Math.hypot(p.x-o.center.x,p.y-o.center.y);return n>1e-9?fromPoints(o.center,p,null,current.handedness):frame({...current,origin:o.center});}return null;
 }
 M.cadUcs=Object.freeze({capability,world,frame,name,validate,vector,localVector,toWorld,toLocal,fromPoints,objectFrame,create});
})();
