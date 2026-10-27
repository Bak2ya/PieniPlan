/* Repeating exact XLINE/RAY authoring; existing geometry remains read-only. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},rad=a=>a*Math.PI/180;
 function create(id,p){
  const d={id,phase:'base',base:null,constraint:null,pointer:null,angle:0,reference:null,offset:null,vertex:null,firstRay:null,token:p.token(),history:[]};
  const prompts={base:['기준점 또는 [수평(H)/수직(V)/각도(A)/이등분(B)/간격(O)]','Point or [Hor/Ver/Ang/Bisect/Offset]'],direction:['같은 기준점의 통과점 지정 · Enter 종료 / U 되돌리기','Through point from same base · Enter to finish / U to undo'],point:['통과점 지정 · Enter 종료 / U 되돌리기','Specify through point · Enter to finish / U to undo'],angle:['각도 또는 참조(R) 입력','Enter angle or Reference'],angleReference:['기준 직선 선택','Select reference line'],relativeAngle:['기준선과의 상대 각도 입력','Enter angle relative to reference line'],bisectVertex:['각의 꼭짓점 지정','Specify angle vertex'],bisectFirst:['각의 첫 번째 변 위의 점 지정','Point on first angle leg'],bisectSecond:['각의 두 번째 변 위의 점 지정','Point on second angle leg'],offsetValue:['간격 또는 통과(T) 입력','Offset distance or Through'],offsetObject:['평행 기준 직선 선택','Select line to offset'],offsetSide:['배치 방향점 지정','Specify side to offset'],offsetThrough:['통과점 지정','Specify through point']};
  const show=()=>{const q=prompts[d.phase];p.prompt(id,...(id==='RAY'&&d.phase==='base'?['반직선의 기준점 지정','Specify ray base point']:q));};
  const key=e=>String(e.type==='keyword'?e.value:e.text||'').trim().toUpperCase();
  const pointBase=()=>['offsetThrough','offsetSide'].includes(d.phase)?d.reference?.a||null:['bisectFirst','bisectSecond'].includes(d.phase)?d.vertex:d.phase==='direction'?d.base:null;
  const getPoint=e=>e.type==='point'?p.resolve(e.point,pointBase()):e.type==='text'?p.parse(e.text,pointBase(),d.pointer)?.point:null;
  function support(o,q){if(M.cadPolyline?.is(o)){const hit=M.cadPolyline.nearest(o,q);return M.cadPolyline.get(o).edges.find(e=>e.edgeId===hit?.edgeId&&e.type==='cadLine')||null;}return['cadLine','cadXline','cadRay'].includes(o?.type)?o:null;}
  function geometry(q,constraint=null){if(!q)return null;let a,b;
   if(d.phase==='direction'){if(d.constraint){const pair=M.cadLineConstraints.solve(d.constraint,constraint||{kind:'point',point:q})[0];if(!pair)return null;a=pair.a;b=pair.b;}else{a=d.base;b=q;}}
   else if(d.phase==='point'){a=q;b={x:q.x+Math.cos(rad(d.angle)),y:q.y+Math.sin(rad(d.angle))};}
   else if(d.phase==='bisectSecond'){const a1=Math.atan2(d.firstRay.y-d.vertex.y,d.firstRay.x-d.vertex.x),a2=Math.atan2(q.y-d.vertex.y,q.x-d.vertex.x);if(Math.hypot(q.x-d.vertex.x,q.y-d.vertex.y)<1e-8)return null;let delta=(a2-a1)%(2*Math.PI);if(delta<0)delta+=2*Math.PI;const angle=a1+delta/2;a=d.vertex;b={x:a.x+Math.cos(angle),y:a.y+Math.sin(angle)};}
   else if(['offsetSide','offsetThrough'].includes(d.phase)){const o=d.reference,dx=o.b.x-o.a.x,dy=o.b.y-o.a.y,len=Math.hypot(dx,dy);if(len<1e-8)return null;const nx=-dy/len,ny=dx/len,signed=(q.x-o.a.x)*nx+(q.y-o.a.y)*ny,amount=d.phase==='offsetThrough'?signed:Math.sign(signed)*d.offset;if(Math.abs(amount)<1e-8)return null;a={x:o.a.x+nx*amount,y:o.a.y+ny*amount};b={x:a.x+dx,y:a.y+dy};}
   return a&&b&&Math.hypot(b.x-a.x,b.y-a.y)>1e-8?{base:{...a},pointer:{...b}}:null;
  }
  show();return{view:()=>d,describe:()=>({phase:d.phase,pointBase:['base','direction','point','bisectVertex','bisectFirst','bisectSecond','offsetThrough','offsetSide'].includes(d.phase)?pointBase():undefined,actions:id==='XLINE'&&d.phase==='base'?[['H','cad91.horizontal'],['V','cad91.vertical'],['A','context.angle'],['B','cad91.bisect'],['O','cad91.offset']].map(([id,labelKey])=>({id,labelKey})):d.history.length?[{id:'U',labelKey:'cadEdit.undo'}]:[]}),
   preview(e){e={...e,type:e.type||'point'};const q=getPoint(e);d.pointer=q;const g=geometry(q,e.type==='point'?p.constraint?.():null);p.preview(g?[{id:'__xline_preview__',type:id==='XLINE'?'cadXline':'cadRay',a:g.base,b:g.pointer,mode:id==='XLINE'?'line':'ray',cadLayer:p.layer()}]:[]);return{ok:true};},
   input(e){if(!p.current(d.token))return{ok:false,code:'stale-context'};const k=key(e);
    if(e.type==='enter'){p.finish?.();return{ok:true};}
    if(['U','UNDO'].includes(k)){const mark=d.history.at(-1);if(!mark||!p.undoOwn?.(mark))return{ok:false,code:'nothing-to-back'};d.history.pop();d.token=p.token();p.preview([]);show();return{ok:true};}
    if(id==='XLINE'&&d.phase==='base'&&['H','HOR','HORIZONTAL','V','VER','VERTICAL','A','ANG','ANGLE','B','BISECT','O','OFFSET'].includes(k)){d.phase=k.startsWith('H')||k.startsWith('V')?'point':k.startsWith('A')?'angle':k.startsWith('B')?'bisectVertex':'offsetValue';d.angle=p.angleToWorld?.(k.startsWith('V')?90:0)??(k.startsWith('V')?90:0);show();return{ok:true};}
    if(d.phase==='angle'&&['R','REFERENCE'].includes(k)){d.phase='angleReference';show();return{ok:true};}
    if(['angle','relativeAngle'].includes(d.phase)){const n=e.type==='text'?(M.cadUnits?.parseAngle?M.cadUnits.parseAngle(e.text).degrees:Number(e.text)):NaN;if(!Number.isFinite(n))return{ok:false,code:'invalid-number'};d.angle=d.phase==='relativeAngle'?Math.atan2(d.reference.b.y-d.reference.a.y,d.reference.b.x-d.reference.a.x)*180/Math.PI+n*(p.angleSign?.()??1):(p.angleToWorld?.(n)??n);d.phase='point';show();return{ok:true};}
    if(d.phase==='offsetValue'){if(['T','THROUGH'].includes(k)){d.offset=null;d.phase='offsetObject';show();return{ok:true};}const n=e.type==='text'?p.parseLength(e.text)?.mm:NaN;if(!(n>0))return{ok:false,code:'invalid-distance'};d.offset=n;d.phase='offsetObject';show();return{ok:true};}
    if(['offsetObject','angleReference'].includes(d.phase)){const o=e.type==='point'?p.pick(e.point):null,q=o&&support(o,e.point);if(!q||!(p.inspect?.(o.id)??p.allowed(o.id)))return{ok:false,code:'unsupported-geometry'};d.reference=q;d.phase=d.phase==='angleReference'?'relativeAngle':d.offset===null?'offsetThrough':'offsetSide';show();return{ok:true};}
    const q=getPoint(e);if(!q)return{ok:false,code:'invalid-coordinate'};
    if(d.phase==='base'){d.constraint=e.type==='point'?p.constraint?.()||null:null;d.base={...q};d.phase='direction';show();return{ok:true};}
    if(d.phase==='bisectVertex'){d.vertex={...q};d.base={...q};d.phase='bisectFirst';show();return{ok:true};}
    if(d.phase==='bisectFirst'){if(Math.hypot(q.x-d.vertex.x,q.y-d.vertex.y)<1e-8)return{ok:false,code:'zero-length'};d.firstRay={...q};d.phase='bisectSecond';show();return{ok:true};}
    const g=geometry(q,e.type==='point'?p.constraint?.():null);if(!g||!p.commit(id,{...d,...g}))return{ok:false,code:'no-valid-result'};d.history.push(p.historyMark?.());d.token=p.token();p.preview([]);if(['offsetSide','offsetThrough'].includes(d.phase))d.phase='offsetObject';show();return{ok:true,code:'applied-repeat'};
   },commit:v=>p.commit(id,v),cancel:()=>p.clear(),finalize:()=>p.clear()};
 }
 const baseKeywords=['H','HOR','HORIZONTAL','V','VER','VERTICAL','A','ANG','ANGLE','B','BISECT','O','OFFSET'];
 M.nativeConstructionLines=Object.freeze({create,keyword:(id,phase,k)=>['XLINE','RAY'].includes(id)&&(['U','UNDO'].includes(k)||id==='XLINE'&&(phase==='base'&&baseKeywords.includes(k)||phase==='angle'&&['R','REFERENCE'].includes(k)||phase==='offsetValue'&&['T','THROUGH'].includes(k)))});
})();
