/* CAD-only running/one-shot snaps and acquired-point tracking. No model writes. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const kinds=['endpoint','midpoint','center','intersection','perpendicular','tangent','nearest','extension','geometricCenter','quadrant','node','insertion'];
  const aliases={END:'endpoint',ENDPOINT:'endpoint',MID:'midpoint',MIDPOINT:'midpoint',CEN:'center',CENTER:'center',INT:'intersection',INTERSECTION:'intersection',PER:'perpendicular',PERPENDICULAR:'perpendicular',TAN:'tangent',TANGENT:'tangent',NEA:'nearest',NEAREST:'nearest',EXT:'extension',EXTENSION:'extension',GCE:'geometricCenter',GCEN:'geometricCenter',QUA:'quadrant',NOD:'node',NODE:'node',INS:'insertion',INSERTION:'insertion',NONE:'none'};
  const defaults=['endpoint','midpoint','center','intersection','perpendicular'];
  const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function centroid(o){
    if(root.cadEllipse?.is(o)&&root.cadEllipse.full(o))return{...o.center};
    if(o?.type==='cadCircle')return{...o.center};
    if(o?.type!=='cadPolyline'||!o.closed||o.vertices.length<2)return null;
    // Translate before integration to avoid loss of significance at survey coordinates.
    const origin=o.vertices[0];let edges;try{edges=root.cadPolyline.get(o).edges;}catch{return null;}let area=0,mx=0,my=0;
    for(const e of edges){if(e.type==='cadLine'){const a={x:e.a.x-origin.x,y:e.a.y-origin.y},b={x:e.b.x-origin.x,y:e.b.y-origin.y},c=a.x*b.y-b.x*a.y;area+=c/2;mx+=(b.y-a.y)*(a.x*a.x+a.x*b.x+b.x*b.x)/6;my-=(b.x-a.x)*(a.y*a.y+a.y*b.y+b.y*b.y)/6;}
      else if(root.cadBezier?.is(e)){const x=root.cadBezier.coefficients(e,'x'),y=root.cadBezier.coefficients(e,'y');x[0]-=origin.x;y[0]-=origin.y;const derivative=a=>a.slice(1).map((v,i)=>v*(i+1)),mul=(a,b)=>{const q=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)q[i+j]+=a[i]*b[j];return q;},integral=a=>a.reduce((n,v,i)=>n+v/(i+1),0),dx=derivative(x),dy=derivative(y);area+=(integral(mul(x,dy))-integral(mul(y,dx)))/2;mx+=integral(mul(mul(x,x),dy))/2;my-=integral(mul(mul(y,y),dx))/2;}
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
      if(enabled.has('insertion')&&root.cadBlocks?.is(o))add({x:o.matrix.tx,y:o.matrix.ty},'insertion',o);
      if(parts){for(const p of candidates(pointer,parts,{base,modes:root.cadPolyline?.is(o)?modes.filter(k=>k!=='geometricCenter'):modes,nearest}))out.push({...p,objectId:o.id,ownerId:o.id});if(enabled.has('geometricCenter'))add(centroid(o),'geometricCenter',o);continue;}

      if(root.cadEllipse?.is(o)){const e=root.cadEllipse;if(enabled.has('center'))add(o.center,'center',o);if(!e.full(o)){if(enabled.has('endpoint'))for(const t of [0,1])add(e.at(o,t),'endpoint',o);if(enabled.has('midpoint'))add(e.at(o,.5),'midpoint',o);}if(enabled.has('quadrant'))for(const t of [0,Math.PI/2,Math.PI,Math.PI*1.5])if(e.contains(o,t))add(e.point(o,t),'quadrant',o);}
      if(enabled.has('nearest')){const q=nearest(o,pointer);if(q)add(q.point,'nearest',o);}
      if(enabled.has('tangent'))for(const p of tangent(o,base))add(p,'tangent',o);
      if(enabled.has('geometricCenter'))add(centroid(o),'geometricCenter',o);
      for(const q of specialPoints(o))if(enabled.has(q.kind))add(q,q.kind,o);
      if(enabled.has('quadrant')&&['cadCircle','cadArc'].includes(o.type))for(const angle of [0,90,180,270]){const p=root.geometryQuery.pointAt(o,angle);if(o.type==='cadCircle'||root.geometryQuery.onArc(o,p))add(p,'quadrant',o);}
    }
    return out;
  }
  function specialPoints(o){const out=[],add=(p,kind)=>{if(finite(p)&&!out.some(q=>q.kind===kind&&distance(p,q)<1e-7))out.push({...p,kind,objectId:o.id,ownerId:o.id,source:'cad'});};if(o.type==='cadPoint')add(o.point,'node');if(o.type==='cadText')add(o.point,'insertion');if(root.cadBlocks?.is(o))add({x:o.matrix.tx,y:o.matrix.ty},'insertion');if(o.type==='cadDimension'){for(const key of ['p1','p2','vertex','ray1','ray2','center','labelPoint'])add(o[key],'node');const g=root.cadDimensionStyles?.geometry?.(o)||root.cadAnnotation2?.geometry?.(o);add(g?.labelPoint,'node');}return out;}
  function endpoints(e){if(e.a&&e.b)return[e.a,e.b];if(root.cadBezier?.is(e))return[e.controls[0],e.controls.at(-1)];if(root.cadEllipse?.is(e))return root.cadEllipse.full(e)?null:[root.cadEllipse.at(e,0),root.cadEllipse.at(e,1)];if(e.type==='cadArc')return[root.geometryQuery.pointAt(e,e.startAngle),root.geometryQuery.pointAt(e,e.startAngle+e.sweep)];return null;}
  function extensionSupports(o){const parts=root.cadPolylineWidth?.isAffine(o)?root.cadPolylineWidth.affineEdges(o):root.cadPolyline?.is(o)?root.cadPolyline.get(o).edges:root.cadBlocks?.is(o)?root.cadBlocks.expand(o):root.cadHatchCurves?.is(o)?root.cadHatchCurves.loops(o).flat():null;return parts?parts.flatMap(extensionSupports):[o];}
  function extensionPoint(e,a,p,tolerance){const ends=endpoints(e);if(!ends)return null;const start=distance(a,ends[0])<=distance(a,ends[1]),norm=(v,period)=>(v%period+period)%period;
    if(root.cadBezier?.is(e)){const d=root.cadBezier.derivative(e,start?0:1),n=Math.hypot(d.x,d.y);if(n<1e-10)return null;const sign=start?-1:1,b={x:a.x+d.x/n*sign,y:a.y+d.y/n*sign},q=root.geometryQuery.projectNearest({a,b,mode:'ray'},p);return q&&q.distance<=tolerance&&q.t>1e-8?{...q.point,guide:{kind:'extension',a,b:q.point}}:null;}
    if(e.a&&e.b){const q=root.geometryQuery.projectNearest({...e,mode:'line'},p);return q&&q.distance<=tolerance&&(start?q.t<0:q.t>1)?{...q.point,guide:{kind:'extension',a,b:q.point}}:null;}
    if(root.cadEllipse?.is(e)){const E=root.cadEllipse,full={...e,startParam:0,sweepParam:Math.PI*2},q=E.nearest(full,p);if(!q||q.distance>tolerance||E.contains(e,E.parameter(e,q.point)))return null;const direction=(start?-1:1)*Math.sign(e.sweepParam),origin=start?e.startParam:e.startParam+e.sweepParam,delta=norm((E.parameter(e,q.point)-origin)*direction,Math.PI*2);return{...q.point,guide:{kind:'extension',a,b:q.point,curve:{...e,startParam:origin,sweepParam:direction*delta}}};}
    if(e.type==='cadArc'){const G=root.geometryQuery,q=G.projectNearest({...e,type:'cadCircle'},p);if(!q||q.distance>tolerance||G.onArc(e,q.point))return null;const direction=(start?-1:1)*Math.sign(e.sweep),origin=start?e.startAngle:e.startAngle+e.sweep,angle=Math.atan2(q.point.y-e.center.y,q.point.x-e.center.x)*180/Math.PI,delta=norm((angle-origin)*direction,360);return{...q.point,guide:{kind:'extension',a,b:q.point,curve:{...e,startAngle:origin,sweep:direction*delta}}};}return null;
  }
  function create(storage=globalThis.localStorage,onAcquire=()=>{}){
    let settings={modes:[...defaults],tracking:false,dynamic:false,grid:false,gridSpacing:100,polarAngle:90,polarAdditional:[],polarRelative:false,trackingPolar:false,shiftAcquire:false,additionalEnabled:false},oneShot=null,acquired=[],hover=null;
    try{const q=JSON.parse(storage?.getItem('pieniplan-cad-precision-v1')||'null');if(q){settings.modes=Array.isArray(q.modes)?[...new Set(q.modes.filter(k=>kinds.includes(k)))]:settings.modes;if(Number.isFinite(q.gridSpacing)&&q.gridSpacing>0)settings.gridSpacing=q.gridSpacing;for(const k of ['tracking','dynamic','grid','polarRelative','trackingPolar','shiftAcquire','additionalEnabled'])if(typeof q[k]==='boolean')settings[k]=q[k];if(Number.isFinite(q.polarAngle)&&q.polarAngle>0&&q.polarAngle<=360)settings.polarAngle=q.polarAngle;if(q.additionalEnabled===undefined&&q.polarAdditional?.length)settings.additionalEnabled=true;if(Array.isArray(q.polarAdditional))settings.polarAdditional=[...new Set(q.polarAdditional.filter(n=>Number.isFinite(n)&&n>=0&&n<360))].slice(0,32);}}catch{}
    const save=()=>{try{storage?.setItem('pieniplan-cad-precision-v1',JSON.stringify(settings));}catch{}};
    function configure(patch){if(patch.modes)settings.modes=[...new Set(patch.modes.filter(k=>kinds.includes(k)))];if(Number.isFinite(patch.gridSpacing)&&patch.gridSpacing>0)settings.gridSpacing=patch.gridSpacing;for(const k of ['tracking','dynamic','grid','polarRelative','trackingPolar','shiftAcquire','additionalEnabled'])if(typeof patch[k]==='boolean')settings[k]=patch[k];if(Number.isFinite(patch.polarAngle)&&patch.polarAngle>0&&patch.polarAngle<=360)settings.polarAngle=patch.polarAngle;if(patch.additionalEnabled===undefined&&Array.isArray(patch.polarAdditional))settings.additionalEnabled=true;if(Array.isArray(patch.polarAdditional))settings.polarAdditional=[...new Set(patch.polarAdditional.filter(n=>Number.isFinite(n)&&n>=0&&n<360))].slice(0,32);save();return status();}
    function status(){return{...settings,modes:[...settings.modes],polarAdditional:[...settings.polarAdditional],oneShot,acquired:acquired.map(q=>({...q}))};}
    function polarDirection(angle,{base=0,previous=null,tolerance=7}={}){
      if(!Number.isFinite(angle)||!Number.isFinite(base))return null;
      const delta=(a,b)=>((a-b+540)%360+360)%360-180,basis=settings.polarRelative&&Number.isFinite(previous)?previous:base;
      const candidates=[basis+Math.round(delta(angle,basis)/settings.polarAngle)*settings.polarAngle,...(settings.additionalEnabled?settings.polarAdditional:[]).map(a=>base+a)];
      candidates.sort((a,b)=>Math.abs(delta(angle,a))-Math.abs(delta(angle,b)));
      return Math.abs(delta(angle,candidates[0]))<=tolerance?candidates[0]:null;
    }
    function arm(kind){const k=kinds.includes(kind)||kind==='none'?kind:aliases[String(kind).toUpperCase()];if(!k)return false;oneShot=k;return true;}
    function consume(){oneShot=null;}
    function clear(){oneShot=null;acquired=[];hover=null;}
    function acquire(q,now=performance.now(),{shift=false}={}){
      if(settings.shiftAcquire&&!shift){hover=null;return false;}
      if(!(settings.tracking||oneShot==='extension'||settings.modes.includes('extension'))||!q||!['endpoint','midpoint','center','intersection','geometricCenter'].includes(q.kind)){hover=null;return false;}
      const key=[q.objectId,q.kind,q.x,q.y].join(':');if(hover?.key!==key){hover={key,since:now,toggled:false};if(!settings.shiftAcquire){setTimeout(()=>{if(hover?.key!==key)return;if(acquire(q,now+351,{shift}))onAcquire();},360);return false;}}
      if(!settings.shiftAcquire&&now-hover.since<350||hover.toggled)return false;hover.toggled=true;const existing=acquired.findIndex(a=>distance(a,q)<1e-7);if(existing>=0){acquired.splice(existing,1);return true;}
      acquired.push({...q});if(acquired.length>7)acquired.shift();return true;
    }
    function track(p,tolerance,{objectById=()=>null,allowed=()=>true,baseAngle=0,previous=null}={}){
      acquired=acquired.filter(q=>(q.objectIds||[q.objectId].filter(Boolean)).every(allowed));const out=[],xs=[],ys=[];
      if(settings.tracking&&settings.trackingPolar){
        const rays=[];
        for(const a of acquired){const dx=p.x-a.x,dy=p.y-a.y,angle=polarDirection(Math.atan2(dy,dx)*180/Math.PI,{base:baseAngle,previous,tolerance:180});if(angle===null)continue;const r=angle*Math.PI/180,u={x:Math.cos(r),y:Math.sin(r)},along=dx*u.x+dy*u.y,error=Math.abs(dx*u.y-dy*u.x);if(along<0||error>tolerance)continue;const q={x:a.x+along*u.x,y:a.y+along*u.y},guide={kind:'parallel',a,b:q,angle};rays.push({a,u,guide});out.push({...q,kind:'tracking',anchor:a,guide});}
        for(let i=0;i<rays.length;i++)for(let j=i+1;j<rays.length;j++){const x=rays[i],y=rays[j],den=x.u.x*y.u.y-x.u.y*y.u.x;if(Math.abs(den)<1e-10)continue;const dx=y.a.x-x.a.x,dy=y.a.y-x.a.y,t=(dx*y.u.y-dy*y.u.x)/den,v=(dx*x.u.y-dy*x.u.x)/den,q={x:x.a.x+t*x.u.x,y:x.a.y+t*x.u.y};if(t>=-1e-9&&v>=-1e-9&&distance(p,q)<=tolerance)out.push({...q,kind:'tracking',guides:[{...x.guide,b:q},{...y.guide,b:q}]});}
      }
      if(settings.tracking&&!settings.trackingPolar)for(const a of acquired){if(Math.abs(p.x-a.x)<=tolerance){xs.push(a);out.push({x:a.x,y:p.y,kind:'tracking',anchor:a,guide:{kind:'vertical',a,b:{x:a.x,y:p.y}}});}if(Math.abs(p.y-a.y)<=tolerance){ys.push(a);out.push({x:p.x,y:a.y,kind:'tracking',anchor:a,guide:{kind:'horizontal',a,b:{x:p.x,y:a.y}}});}}
      for(const x of xs)for(const y of ys)out.push({x:x.x,y:y.y,kind:'tracking',guides:[{kind:'vertical',a:x,b:{x:x.x,y:y.y}},{kind:'horizontal',a:y,b:{x:x.x,y:y.y}}]});
      if((oneShot==='extension'||!oneShot&&settings.modes.includes('extension')))for(const a of acquired){if(a.kind!=='endpoint')continue;const o=objectById(a.objectId);if(!o)continue;for(const e of extensionSupports(o)){const ends=endpoints(e);if(!ends||!ends.some(q=>distance(q,a)<1e-6))continue;const q=extensionPoint(e,a,p,tolerance);if(q)out.push({...q,kind:'extension',objectId:o.id});}}
      return out;
    }
    return Object.freeze({status,configure,polarDirection,polarMode:()=>Number(settings.polarRelative)+2*Number(settings.trackingPolar)+4*Number(settings.additionalEnabled)+8*Number(settings.shiftAcquire),setPolarMode:n=>Number.isInteger(n)&&n>=0&&n<=15?configure({polarRelative:!!(n&1),trackingPolar:!!(n&2),additionalEnabled:!!(n&4),shiftAcquire:!!(n&8)}):false,arm,consume,clear,acquire,track,kinds,resolve:s=>aliases[String(s).toUpperCase()]||null,enabled:kind=>oneShot?oneShot===kind:settings.modes.includes(kind)});
  }
  root.cadPrecision=Object.freeze({kinds,defaults,aliases,centroid,tangent,specialPoints,endpoints,extensionPoint,extensionSupports,candidates,create});
})();
