/* CAD PLINE grammar. Plan's endpoint/control convenience remains in native-polyline. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},copy=v=>JSON.parse(JSON.stringify(v)),angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
 const keywords=['L','LINE','A','ARC','U','UNDO','B','BACK','C','CLOSE','W','WIDTH','H','HALFWIDTH','CE','ANGLE','D','DIRECTION','R','RADIUS','S','SECOND','SECONDPT','LENGTH'];
 function create(p){
  const d={cadNative:true,phase:'start',mode:'line',points:[],pointer:null,arcEnd:null,widthStart:0,widthEnd:0,widthFactor:1,center:null,second:null,arcAngle:null,arcRadius:null,direction:null,token:p.contextToken()};
  const initialWidth=p.initialWidth?.()??0;if(Number.isFinite(initialWidth)&&initialWidth>=0&&initialWidth<=1e7)d.widthStart=d.widthEnd=initialWidth;
  const current=()=>d.points.at(-1)||null,G=()=>M.cadCreation;
  function tangent(){if(d.points.length>1){const a=d.points.at(-2),b=current();return angle(a,b)+2*Math.atan(a.bulge||0)*180/Math.PI;}return d.direction??p.continuation?.()?.tangent??0;}
  function base(){return d.phase==='arcCenterEnd'||d.phase==='arcCenterAngle'||d.phase==='arcCenterLength'?d.center:current();}
  function point(e){if(e.type==='point')return p.resolvePoint(e.point,{base:base(),shift:!!e.shift}).point;if(e.type==='text'){const a=base();return p.parsePoint(e.text,{base:a,direction:a&&d.pointer?{x:d.pointer.x-a.x,y:d.pointer.y-a.y}:null})?.point;}return null;}
  const number=e=>e.type==='text'&&String(e.text).trim()!==''?Number(e.text):NaN,length=e=>e.type==='text'?p.parseLength(e.text)?.mm:null;
  function arcFor(q){const a=current();if(!a||!q)return null;
   if(d.phase==='arcSecondEnd')return G().arc3(a,q,d.second);
   if(d.phase==='arcCenterEnd'){const g=G().arcCenter(a,d.center,q);return g&&p.clockwise?.()?{...g,sweep:g.sweep-360}:g;}
   if(d.phase==='arcAngleEnd')return G().arcEndAngle(a,q,d.arcAngle);
   if(d.phase==='arcRadiusEnd'){const g=G().arcEndRadius(a,q,d.arcRadius);return g&&p.clockwise?.()?G().arcEndAngle(a,q,-Math.abs(g.sweep)):g;}
   return G().arcTangent(a,q,(d.phase==='arcDirectionEnd'?d.direction:tangent())+(p.clockwise?.()?180:0));
  }
  function segment(q){if(!current()||!q||Math.hypot(q.x-current().x,q.y-current().y)<1e-8)return null;
   const g=d.mode==='arc'?arcFor(q):null;if(d.mode==='arc'&&!g)return null;
   return{point:{x:q.x,y:q.y},bulge:g?Math.tan(g.sweep*Math.PI/720):0,startWidth:d.widthStart,endWidth:d.widthEnd};
  }
  function nextPhase(){d.phase=d.points.length?'next':'start';d.center=d.second=d.arcAngle=d.arcRadius=d.direction=null;}
  function directionalArc(q,n=null){const a=current();if(!a||n===null&&(!q||Math.hypot(q.x-a.x,q.y-a.y)<1e-8))return null;const phi=(n===null?angle(a,q):n)*Math.PI/180,chord=2*Math.abs(d.arcRadius*Math.sin(d.arcAngle*Math.PI/360));return G().arcEndAngle(a,{x:a.x+chord*Math.cos(phi),y:a.y+chord*Math.sin(phi)},d.arcAngle);}
  function geometrySegment(g){if(!g)return null;const a=(g.startAngle+g.sweep)*Math.PI/180;return{point:{x:g.center.x+g.radius*Math.cos(a),y:g.center.y+g.radius*Math.sin(a)},bulge:Math.tan(g.sweep*Math.PI/720),startWidth:d.widthStart,endWidth:d.widthEnd};}
  function show(){const view={...d,points:copy(d.points),pointer:d.pointer&&{...d.pointer}};let s=null;if(d.pointer&&d.points.length){if(['next','arcAngleEnd','arcCenterEnd','arcDirectionEnd','arcRadiusEnd','arcSecondEnd'].includes(d.phase))s=segment(d.pointer);else if(d.phase==='arcAngleCenter')s=geometrySegment(G().arcCenter(current(),d.pointer,null,d.arcAngle));else if(d.phase==='arcChordDirection')s=geometrySegment(directionalArc(d.pointer));}if(s){view.previewPoints=copy(d.points);Object.assign(view.previewPoints.at(-1),{bulge:s.bulge,startWidth:s.startWidth,endWidth:s.endWidth});view.previewPoints.push(s.point);}p.preview(view);p.prompt('cad91.pl.'+d.phase);}
  function add(q){const s=segment(q);if(!s)return{ok:false,code:'invalid-arc'};Object.assign(current(),{bulge:s.bulge,startWidth:s.startWidth,endWidth:s.endWidth});d.points.push(s.point);d.widthStart=d.widthEnd;nextPhase();show();return{ok:true};}
  function addGeometry(g){if(!g)return{ok:false,code:'invalid-arc'};const a=(g.startAngle+g.sweep)*Math.PI/180,q={x:g.center.x+g.radius*Math.cos(a),y:g.center.y+g.radius*Math.sin(a)};if(Math.hypot(q.x-current().x,q.y-current().y)<1e-8)return{ok:false,code:'invalid-arc'};Object.assign(current(),{bulge:Math.tan(g.sweep*Math.PI/720),startWidth:d.widthStart,endWidth:d.widthEnd});d.points.push(q);d.widthStart=d.widthEnd;nextPhase();show();return{ok:true};}
  function finish(closed=false){if(d.points.length<2)return{ok:false,code:'polyline-too-short'};const points=copy(d.points);if(closed){const s=segment(points[0]);if(!s)return{ok:false,code:'invalid-arc'};Object.assign(points.at(-1),{bulge:s.bulge,startWidth:s.startWidth,endWidth:s.endWidth});}return{ok:true,commit:true,value:{points,closed,token:d.token,defaultWidth:d.widthEnd}};}
  show();return{view:()=>copy(d),describe:()=>({phase:d.phase,input:['point','coordinate','length','keyword'],actions:['arcAngleEnd','arcRadiusEnd'].includes(d.phase)?(d.phase==='arcAngleEnd'?[{id:'CE',labelKey:'cad87.center'},{id:'R',labelKey:'cadDraw.radius'}]:[{id:'A',labelKey:'context.angle'}]):d.points.length?[{id:'L',labelKey:'polyline.line',active:d.mode==='line'},{id:'A',labelKey:'polyline.arc',active:d.mode==='arc'},{id:'W',labelKey:'cad91.width'},{id:'H',labelKey:'cad91.halfwidth'},{id:'U',labelKey:'polyline.back'},...(d.mode==='line'?[{id:'LENGTH',labelKey:'cad91.length'}]:[{id:'CE',labelKey:'cad87.center'},{id:'D',labelKey:'cad91.direction'},{id:'R',labelKey:'cadDraw.radius'},{id:'S',labelKey:'cad91.second'}]),{id:'C',labelKey:'polyline.close',enabled:d.points.length>=2}]:[]}),
   preview(e){e={...e,type:e.type||'point'};const q=point(e);if(q){d.pointer={...q};show();}return{ok:true};},
   input(e){const k=String(e.type==='keyword'?e.value:e.text||'').trim().toUpperCase();
    if(e.type==='keyword'&&k==='FINISH'||e.type==='enter'){
     if(d.phase==='start'){const c=p.continuation?.();if(!c)return{ok:false,code:'base-required'};d.points.push({...c.point});d.direction=c.tangent;nextPhase();show();return{ok:true};}
     if(['widthStart','widthEnd'].includes(d.phase)){const n=d.phase==='widthStart'?d.widthStart:d.widthStart;d[d.phase]=n;d.phase=d.phase==='widthStart'?'widthEnd':'next';show();return{ok:true};}
     if(d.phase!=='next')return{ok:false,code:'input-required'};return finish(false);
    }
    if(['U','UNDO','B','BACK'].includes(k)){if(d.phase!=='next'&&d.phase!=='start'){nextPhase();show();return{ok:true};}if(!d.points.length)return{ok:false,code:'nothing-to-back'};d.points.pop();if(current()){delete current().bulge;delete current().startWidth;delete current().endWidth;}nextPhase();show();return{ok:true};}
    if(['widthStart','widthEnd'].includes(d.phase)){const n=length(e);if(!(n>=0&&n*d.widthFactor<=1e7))return{ok:false,code:'invalid-distance'};if(d.phase==='widthStart'){d.widthStart=n*d.widthFactor;d.widthEnd=d.widthStart;d.phase='widthEnd';}else{d.widthEnd=n*d.widthFactor;d.phase='next';}show();return{ok:true};}
    if(d.phase==='arcAngleEnd'&&['CE','CENTER','R','RADIUS'].includes(k)){d.phase=k.startsWith('R')?'arcAngleRadius':'arcAngleCenter';show();return{ok:true};}
    if(d.phase==='arcRadiusEnd'&&['A','ANGLE'].includes(k)){d.phase='arcRadiusAngle';show();return{ok:true};}
    if(d.phase==='arcAngleCenter'){const center=point(e),g=center&&G().arcCenter(current(),center,null,d.arcAngle);return addGeometry(g);}
    if(d.phase==='arcAngleRadius'){const n=length(e);if(!(n>1e-8))return{ok:false,code:'invalid-distance'};d.arcRadius=n;d.phase='arcChordDirection';show();return{ok:true};}
    if(d.phase==='arcRadiusAngle'){const n=number(e);if(!Number.isFinite(n)||Math.abs(n)<1e-7||Math.abs(n)>=360-1e-7)return{ok:false,code:'invalid-number'};d.arcAngle=n;d.phase='arcChordDirection';show();return{ok:true};}
    if(d.phase==='arcChordDirection'){const n=number(e);return addGeometry(directionalArc(Number.isFinite(n)?null:point(e),Number.isFinite(n)?n:null));}
    if(d.phase==='length'){const n=length(e);if(!(n>0))return{ok:false,code:'invalid-distance'};const a=tangent()*Math.PI/180,q={x:current().x+n*Math.cos(a),y:current().y+n*Math.sin(a)};return add(q);}
    if(d.phase==='arcAngle'){const n=number(e);if(!Number.isFinite(n)||Math.abs(n)<1e-7||Math.abs(n)>=360-1e-7)return{ok:false,code:'invalid-number'};d.arcAngle=n;d.phase='arcAngleEnd';show();return{ok:true};}
    if(d.phase==='arcRadius'){const n=length(e);if(!Number.isFinite(n)||Math.abs(n)<1e-8)return{ok:false,code:'invalid-distance'};d.arcRadius=n;d.phase='arcRadiusEnd';show();return{ok:true};}
    if(d.phase==='arcDirection'){const n=number(e),q=Number.isFinite(n)?null:point(e);if(!Number.isFinite(n)&&(!q||Math.hypot(q.x-current().x,q.y-current().y)<1e-8))return{ok:false,code:'invalid-number'};d.direction=Number.isFinite(n)?n:angle(current(),q);d.phase='arcDirectionEnd';show();return{ok:true};}
    if(d.phase==='arcCenterAngle'||d.phase==='arcCenterLength'){const n=d.phase==='arcCenterAngle'?number(e):length(e);let g=d.phase==='arcCenterAngle'?G().arcCenter(current(),d.center,null,n):G().arcCenterChord(current(),d.center,n);if(g&&d.phase==='arcCenterLength'&&p.clockwise?.())g={...g,sweep:-g.sweep};return addGeometry(g);}
    if(d.phase==='arcCenterEnd'&&['A','ANGLE','L','LENGTH'].includes(k)){d.phase=k.startsWith('A')?'arcCenterAngle':'arcCenterLength';show();return{ok:true};}
    if(d.phase==='next'&&d.points.length){
     if(['C','CLOSE'].includes(k))return finish(true);
     if(['W','WIDTH','H','HALFWIDTH'].includes(k)){d.widthFactor=k.startsWith('H')?2:1;d.phase='widthStart';show();return{ok:true};}
     if(['L','LINE'].includes(k)&&d.mode==='arc'){d.mode='line';nextPhase();show();return{ok:true};}
     if(['L','LENGTH'].includes(k)&&d.mode==='line'){d.phase='length';show();return{ok:true};}
     if(['A','ARC'].includes(k)&&d.mode==='line'){d.mode='arc';nextPhase();show();return{ok:true};}
     if(d.mode==='arc'&&['A','ANGLE','CE','CENTER','D','DIRECTION','R','RADIUS','S','SECOND','SECONDPT'].includes(k)){d.phase=({A:'arcAngle',ANGLE:'arcAngle',CE:'arcCenter',CENTER:'arcCenter',D:'arcDirection',DIRECTION:'arcDirection',R:'arcRadius',RADIUS:'arcRadius',S:'arcSecond',SECOND:'arcSecond',SECONDPT:'arcSecond'})[k];show();return{ok:true};}
    }
    const q=point(e);if(!q)return{ok:false,code:'invalid-coordinate'};d.pointer={...q};
    if(d.phase==='start'){d.points.push({x:q.x,y:q.y});d.phase='next';show();return{ok:true};}
    if(d.phase==='arcCenter'||d.phase==='arcSecond'){if(Math.hypot(q.x-current().x,q.y-current().y)<1e-8)return{ok:false,code:'zero-length'};if(d.phase==='arcCenter'){d.center={...q};d.phase='arcCenterEnd';}else{d.second={...q};d.phase='arcSecondEnd';}show();return{ok:true};}
    return add(q);
   },commit(v){if(!p.contextCurrent(v.token,{geometry:true,layer:true,reference:false,region:true}))throw Error('stale-context');return p.commitPolyline(v.points,v.closed,{defaultWidth:v.defaultWidth});},cancel:()=>p.clearPreview(),finalize:()=>p.clearPreview()};
 }
 M.nativeCadPolyline=Object.freeze({create,keyword:k=>keywords.includes(k)});
})();
