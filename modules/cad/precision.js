/* CAD-only running/one-shot snaps and acquired-point tracking. No model writes. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const kinds=['endpoint','midpoint','center','intersection','perpendicular','tangent','nearest','extension','geometricCenter','quadrant','node'];
  const aliases={END:'endpoint',ENDPOINT:'endpoint',MID:'midpoint',MIDPOINT:'midpoint',CEN:'center',CENTER:'center',INT:'intersection',INTERSECTION:'intersection',PER:'perpendicular',PERPENDICULAR:'perpendicular',TAN:'tangent',TANGENT:'tangent',NEA:'nearest',NEAREST:'nearest',EXT:'extension',EXTENSION:'extension',GCE:'geometricCenter',GCEN:'geometricCenter',QUA:'quadrant',NOD:'node',NONE:'none'};
  const defaults=['endpoint','midpoint','center','intersection','perpendicular'];
  const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function centroid(o){
    if(root.cadEllipse?.is(o)&&root.cadEllipse.full(o))return{...o.center};
    if(o?.type==='cadCircle')return{...o.center};
    if(o?.type!=='cadPolyline'||!o.closed||o.vertices.length<3||o.curveFit)return null;
    // Translate before integration to avoid loss of significance at survey coordinates.
    const origin=o.vertices[0];let edges;try{edges=root.cadPolyline.get(o).edges;}catch{return null;}let area=0,mx=0,my=0;
    for(const e of edges){if(e.type==='cadLine'){const a={x:e.a.x-origin.x,y:e.a.y-origin.y},b={x:e.b.x-origin.x,y:e.b.y-origin.y},c=a.x*b.y-b.x*a.y;area+=c/2;mx+=(a.x+b.x)*c/6;my+=(a.y+b.y)*c/6;}
      else{const x=e.center.x-origin.x,y=e.center.y-origin.y,r=e.radius,a=e.startAngle*Math.PI/180,b=a+e.sweep*Math.PI/180;
        area+=(r*x*(Math.sin(b)-Math.sin(a))-r*y*(Math.cos(b)-Math.cos(a))+r*r*(b-a))/2;
        const fx=t=>r*x*x*Math.sin(t)+x*r*r*(t+Math.sin(2*t)/2)+r*r*r*(Math.sin(t)-Math.sin(t)**3/3),fy=t=>-r*y*y*Math.cos(t)+y*r*r*(t-Math.sin(2*t)/2)+r*r*r*(-Math.cos(t)+Math.cos(t)**3/3);
        mx+=(fx(b)-fx(a))/2;my+=(fy(b)-fy(a))/2;}}
    return Math.abs(area)>1e-10?{x:origin.x+mx/area,y:origin.y+my/area}:null;
  }
  function tangent(o,base){if(root.cadBezier?.is(o))return root.cadBezier.tangent(o,base);
    if(root.cadEllipse?.is(o))return root.cadEllipse.tangent(o,base);
    if(!finite(base)||!['cadCircle','cadArc'].includes(o?.type)||!(o.radius>0))return[];
    const x=base.x-o.center.x,y=base.y-o.center.y,ds=x*x+y*y,r=o.radius;
    if(ds<=r*r+1e-10)return[];
    const k=r*r/ds,s=r*Math.sqrt(ds-r*r)/ds;
    return[-1,1].map(sign=>({x:o.center.x+k*x-sign*s*y,y:o.center.y+k*y+sign*s*x})).filter(p=>o.type!=='cadArc'||root.geometryQuery.onArc(o,p));
  }
  function candidates(pointer,owners,{base=null,modes=defaults,nearest=root.geometryQuery.projectNearest}={}){
    const enabled=new Set(modes),out=[],add=(q,kind,o)=>{if(finite(q))out.push({...q,kind,objectId:o.id,ownerId:o.id,source:'cad'});};
    for(const o of owners){
      const parts=root.cadPolylineWidth?.isAffine(o)?root.cadPolylineWidth.affineEdges(o):root.cadHatchCurves?.is(o)?root.cadHatchCurves.loops(o).flat():root.cadPolyline?.is(o)?root.cadPolyline.get(o).edges:root.cadBlocks?.is(o)?root.cadBlocks.expand(o):null;
      if(parts){for(const p of candidates(pointer,parts,{base,modes:modes.filter(k=>k!=='geometricCenter'),nearest}))out.push({...p,objectId:o.id,ownerId:o.id});if(enabled.has('geometricCenter'))add(centroid(o),'geometricCenter',o);continue;}

      if(root.cadEllipse?.is(o)){const e=root.cadEllipse;if(enabled.has('center'))add(o.center,'center',o);if(!e.full(o)){if(enabled.has('endpoint'))for(const t of [0,1])add(e.at(o,t),'endpoint',o);if(enabled.has('midpoint'))add(e.at(o,.5),'midpoint',o);}if(enabled.has('quadrant'))for(const t of [0,Math.PI/2,Math.PI,Math.PI*1.5])if(e.contains(o,t))add(e.point(o,t),'quadrant',o);}
      if(enabled.has('nearest')){const q=nearest(o,pointer);if(q)add(q.point,'nearest',o);}
      if(enabled.has('tangent'))for(const p of tangent(o,base))add(p,'tangent',o);
      if(enabled.has('geometricCenter'))add(centroid(o),'geometricCenter',o);
      if(enabled.has('node')&&o.type==='cadPoint')add(o.point,'node',o);
      if(enabled.has('quadrant')&&['cadCircle','cadArc'].includes(o.type))for(const angle of [0,90,180,270]){const p=root.geometryQuery.pointAt(o,angle);if(o.type==='cadCircle'||root.geometryQuery.onArc(o,p))add(p,'quadrant',o);}
    }
    return out;
  }
  function create(storage=globalThis.localStorage,onAcquire=()=>{}){
    let settings={modes:[...defaults],tracking:false,dynamic:false,grid:false,gridSpacing:100,polarAngle:90,polarAdditional:[],polarRelative:false},oneShot=null,acquired=[],hover=null;
    try{const q=JSON.parse(storage?.getItem('pieniplan-cad-precision-v1')||'null');if(q){settings.modes=Array.isArray(q.modes)?[...new Set(q.modes.filter(k=>kinds.includes(k)))]:settings.modes;if(Number.isFinite(q.gridSpacing)&&q.gridSpacing>0)settings.gridSpacing=q.gridSpacing;for(const k of ['tracking','dynamic','grid','polarRelative'])if(typeof q[k]==='boolean')settings[k]=q[k];if([5,10,15,18,22.5,30,45,90].includes(q.polarAngle))settings.polarAngle=q.polarAngle;if(Array.isArray(q.polarAdditional))settings.polarAdditional=[...new Set(q.polarAdditional.filter(n=>Number.isFinite(n)&&n>=0&&n<360))].slice(0,32);}}catch{}
    const save=()=>{try{storage?.setItem('pieniplan-cad-precision-v1',JSON.stringify(settings));}catch{}};
    function configure(patch){if(patch.modes)settings.modes=[...new Set(patch.modes.filter(k=>kinds.includes(k)))];if(Number.isFinite(patch.gridSpacing)&&patch.gridSpacing>0)settings.gridSpacing=patch.gridSpacing;for(const k of ['tracking','dynamic','grid','polarRelative'])if(typeof patch[k]==='boolean')settings[k]=patch[k];if([5,10,15,18,22.5,30,45,90].includes(patch.polarAngle))settings.polarAngle=patch.polarAngle;if(Array.isArray(patch.polarAdditional))settings.polarAdditional=[...new Set(patch.polarAdditional.filter(n=>Number.isFinite(n)&&n>=0&&n<360))].slice(0,32);save();return status();}
    function status(){return{...settings,modes:[...settings.modes],polarAdditional:[...settings.polarAdditional],oneShot,acquired:acquired.map(q=>({...q}))};}
    function polarDirection(angle,{base=0,previous=null,tolerance=7}={}){
      if(!Number.isFinite(angle)||!Number.isFinite(base))return null;
      const delta=(a,b)=>((a-b+540)%360+360)%360-180,basis=settings.polarRelative&&Number.isFinite(previous)?previous:base;
      const candidates=[basis+Math.round(delta(angle,basis)/settings.polarAngle)*settings.polarAngle,...settings.polarAdditional.map(a=>base+a)];
      candidates.sort((a,b)=>Math.abs(delta(angle,a))-Math.abs(delta(angle,b)));
      return Math.abs(delta(angle,candidates[0]))<=tolerance?candidates[0]:null;
    }
    function arm(kind){const k=kinds.includes(kind)||kind==='none'?kind:aliases[String(kind).toUpperCase()];if(!k)return false;oneShot=k;return true;}
    function consume(){oneShot=null;}
    function clear(){oneShot=null;acquired=[];hover=null;}
    function acquire(q,now=performance.now()){
      if(!(settings.tracking||oneShot==='extension'||settings.modes.includes('extension'))||!q||!['endpoint','midpoint','center','intersection','geometricCenter'].includes(q.kind)){hover=null;return false;}
      const key=[q.objectId,q.kind,q.x,q.y].join(':');if(hover?.key!==key){hover={key,since:now,toggled:false};setTimeout(()=>{if(hover?.key!==key)return;if(acquire(q,now+351))onAcquire();},360);return false;}
      if(now-hover.since<350||hover.toggled)return false;hover.toggled=true;const existing=acquired.findIndex(a=>distance(a,q)<1e-7);if(existing>=0){acquired.splice(existing,1);return true;}
      acquired.push({...q});if(acquired.length>7)acquired.shift();return true;
    }
    function track(p,tolerance,{objectById=()=>null,allowed=()=>true}={}){
      acquired=acquired.filter(q=>(q.objectIds||[q.objectId].filter(Boolean)).every(allowed));const out=[],xs=[],ys=[];
      if(settings.tracking)for(const a of acquired){if(Math.abs(p.x-a.x)<=tolerance){xs.push(a);out.push({x:a.x,y:p.y,kind:'tracking',anchor:a,guide:{kind:'vertical',a,b:{x:a.x,y:p.y}}});}if(Math.abs(p.y-a.y)<=tolerance){ys.push(a);out.push({x:p.x,y:a.y,kind:'tracking',anchor:a,guide:{kind:'horizontal',a,b:{x:p.x,y:a.y}}});}}
      for(const x of xs)for(const y of ys)out.push({x:x.x,y:y.y,kind:'tracking',guides:[{kind:'vertical',a:x,b:{x:x.x,y:y.y}},{kind:'horizontal',a:y,b:{x:x.x,y:y.y}}]});
      if((oneShot==='extension'||!oneShot&&settings.modes.includes('extension')))for(const a of acquired){const o=objectById(a.objectId);if(!o)continue;const supports=root.cadPolyline?.is(o)?root.cadPolyline.get(o).edges.filter(e=>[e.type==='cadArc'?root.geometryQuery.pointAt(e,e.startAngle):e.a,e.type==='cadArc'?root.geometryQuery.pointAt(e,e.startAngle+e.sweep):e.b].some(p=>finite(p)&&distance(p,a)<1e-6)):[o];for(const e of supports){if(e.a&&e.b){const q=root.geometryQuery.projectNearest({...e,mode:'line'},p);if(q&&q.distance<=tolerance&&(q.t<0||q.t>1))out.push({...q.point,kind:'extension',objectId:o.id,guide:{kind:'parallel',a,b:q.point}});}else if(e.type==='cadArc'&&a.kind==='endpoint'){const q=root.geometryQuery.projectNearest({...e,type:'cadCircle'},p);if(q&&q.distance<=tolerance&&!root.geometryQuery.onArc(e,q.point))out.push({...q.point,kind:'extension',objectId:o.id,guide:{kind:'parallel',a,b:q.point}});}}}
      return out;
    }
    return Object.freeze({status,configure,polarDirection,arm,consume,clear,acquire,track,kinds,resolve:s=>aliases[String(s).toUpperCase()]||null,enabled:kind=>oneShot?oneShot===kind:settings.modes.includes(kind)});
  }
  root.cadPrecision=Object.freeze({kinds,defaults,aliases,centroid,tangent,candidates,create});
})();
