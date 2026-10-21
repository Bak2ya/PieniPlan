/* CAD-only running/one-shot snaps and acquired-point tracking. No model writes. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const kinds=['endpoint','midpoint','center','intersection','perpendicular','tangent','nearest','extension','geometricCenter','quadrant','node'];
  const aliases={END:'endpoint',ENDPOINT:'endpoint',MID:'midpoint',MIDPOINT:'midpoint',CEN:'center',CENTER:'center',INT:'intersection',INTERSECTION:'intersection',PER:'perpendicular',PERPENDICULAR:'perpendicular',TAN:'tangent',TANGENT:'tangent',NEA:'nearest',NEAREST:'nearest',EXT:'extension',EXTENSION:'extension',GCE:'geometricCenter',GCEN:'geometricCenter',QUA:'quadrant',NOD:'node',NONE:'none'};
  const defaults=['endpoint','midpoint','center','intersection','perpendicular'];
  const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function centroid(o){
    if(o?.type!=='cadPolyline'||!o.closed||o.vertices.length<3||o.vertices.some(v=>Math.abs(v.outgoing?.bulge||0)>1e-10))return null;
    let twice=0,x=0,y=0;for(let i=0;i<o.vertices.length;i++){const a=o.vertices[i],b=o.vertices[(i+1)%o.vertices.length],c=a.x*b.y-b.x*a.y;twice+=c;x+=(a.x+b.x)*c;y+=(a.y+b.y)*c;}
    return Math.abs(twice)>1e-10?{x:x/(3*twice),y:y/(3*twice)}:null;
  }
  function tangent(o,base){
    if(!finite(base)||!['cadCircle','cadArc'].includes(o?.type)||!(o.radius>0))return[];
    const x=base.x-o.center.x,y=base.y-o.center.y,ds=x*x+y*y,r=o.radius;
    if(ds<=r*r+1e-10)return[];
    const k=r*r/ds,s=r*Math.sqrt(ds-r*r)/ds;
    return[-1,1].map(sign=>({x:o.center.x+k*x-sign*s*y,y:o.center.y+k*y+sign*s*x})).filter(p=>o.type!=='cadArc'||root.geometryQuery.onArc(o,p));
  }
  function candidates(pointer,owners,{base=null,modes=defaults,nearest=root.geometryQuery.projectNearest}={}){
    const enabled=new Set(modes),out=[],add=(q,kind,o)=>{if(finite(q))out.push({...q,kind,objectId:o.id,ownerId:o.id,source:'cad'});};
    for(const o of owners){
      if(enabled.has('nearest')){const q=nearest(o,pointer);if(q)add(q.point,'nearest',o);}
      if(enabled.has('tangent'))for(const p of tangent(o,base))add(p,'tangent',o);
      if(enabled.has('geometricCenter'))add(centroid(o),'geometricCenter',o);
      if(enabled.has('node')&&o.type==='cadPoint')add(o.point,'node',o);
      if(enabled.has('quadrant')&&['cadCircle','cadArc'].includes(o.type))for(const angle of [0,90,180,270]){const p=root.geometryQuery.pointAt(o,angle);if(o.type==='cadCircle'||root.geometryQuery.onArc(o,p))add(p,'quadrant',o);}
    }
    return out;
  }
  function create(storage=globalThis.localStorage,onAcquire=()=>{}){
    let settings={modes:[...defaults],tracking:false,dynamic:false,grid:false,gridSpacing:100,polarAngle:90},oneShot=null,acquired=[],hover=null;
    try{const q=JSON.parse(storage?.getItem('pieniplan-cad-precision-v1')||'null');if(q){settings.modes=Array.isArray(q.modes)?[...new Set(q.modes.filter(k=>kinds.includes(k)))]:settings.modes;if(Number.isFinite(q.gridSpacing)&&q.gridSpacing>0)settings.gridSpacing=q.gridSpacing;for(const k of ['tracking','dynamic','grid'])if(typeof q[k]==='boolean')settings[k]=q[k];if([5,10,15,18,22.5,30,45,90].includes(q.polarAngle))settings.polarAngle=q.polarAngle;}}catch{}
    const save=()=>{try{storage?.setItem('pieniplan-cad-precision-v1',JSON.stringify(settings));}catch{}};
    function configure(patch){if(patch.modes)settings.modes=[...new Set(patch.modes.filter(k=>kinds.includes(k)))];if(Number.isFinite(patch.gridSpacing)&&patch.gridSpacing>0)settings.gridSpacing=patch.gridSpacing;for(const k of ['tracking','dynamic','grid'])if(typeof patch[k]==='boolean')settings[k]=patch[k];if([5,10,15,18,22.5,30,45,90].includes(patch.polarAngle))settings.polarAngle=patch.polarAngle;save();return status();}
    function status(){return{...settings,modes:[...settings.modes],oneShot,acquired:acquired.map(q=>({...q}))};}
    function arm(kind){const k=kinds.includes(kind)||kind==='none'?kind:aliases[String(kind).toUpperCase()];if(!k)return false;oneShot=k;return true;}
    function consume(){oneShot=null;}
    function clear(){oneShot=null;acquired=[];hover=null;}
    function acquire(q,now=performance.now()){
      if(!(settings.tracking||oneShot==='extension'||settings.modes.includes('extension'))||!q||!['endpoint','midpoint','center','intersection','geometricCenter'].includes(q.kind)){hover=null;return false;}
      const key=[q.objectId,q.kind,q.x,q.y].join(':');if(hover?.key!==key){hover={key,since:now};setTimeout(()=>{if(hover?.key!==key)return;if(acquire(q,now+351))onAcquire();},360);return false;}
      if(now-hover.since<350||acquired.some(a=>distance(a,q)<1e-7))return false;
      acquired.push({...q});if(acquired.length>7)acquired.shift();return true;
    }
    function track(p,tolerance,{objectById=()=>null,allowed=()=>true}={}){
      acquired=acquired.filter(q=>(q.objectIds||[q.objectId].filter(Boolean)).every(allowed));const out=[],xs=[],ys=[];
      if(settings.tracking)for(const a of acquired){if(Math.abs(p.x-a.x)<=tolerance){xs.push(a);out.push({x:a.x,y:p.y,kind:'tracking',anchor:a,guide:{kind:'vertical',a,b:{x:a.x,y:p.y}}});}if(Math.abs(p.y-a.y)<=tolerance){ys.push(a);out.push({x:p.x,y:a.y,kind:'tracking',anchor:a,guide:{kind:'horizontal',a,b:{x:p.x,y:a.y}}});}}
      for(const x of xs)for(const y of ys)out.push({x:x.x,y:y.y,kind:'tracking',guides:[{kind:'vertical',a:x,b:{x:x.x,y:y.y}},{kind:'horizontal',a:y,b:{x:x.x,y:y.y}}]});
      if((oneShot==='extension'||!oneShot&&settings.modes.includes('extension')))for(const a of acquired){const o=objectById(a.objectId);if(!o?.a||!o?.b)continue;const q=root.geometryQuery.projectNearest({...o,mode:'line'},p);if(q&&q.distance<=tolerance&&(q.t<0||q.t>1))out.push({...q.point,kind:'extension',objectId:o.id,guide:{kind:'parallel',a,b:q.point}});}
      return out;
    }
    return Object.freeze({status,configure,arm,consume,clear,acquire,track,kinds,resolve:s=>aliases[String(s).toUpperCase()]||null,enabled:kind=>oneShot?oneShot===kind:settings.modes.includes(kind)});
  }
  root.cadPrecision=Object.freeze({kinds,defaults,aliases,centroid,tangent,candidates,create});
})();
