/* LENGTHEN and PEDIT reuse existing owners, change sets, parser and selection. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},G=root.geometryQuery,copy=o=>JSON.parse(JSON.stringify(o));
 const ids=['LEN','PE'],keys=['DE','DELTA','P','PERCENT','T','TOTAL','DY','DYNAMIC','C','CLOSE','O','OPEN','R','REVERSE','J','JOIN','V','VERTEX','U','UNDO','Y','YES','N','NO','A','ANGLE'];
 const edgeLength=e=>e.type==='cadLine'?Math.hypot(e.b.x-e.a.x,e.b.y-e.a.y):e.type==='cadArc'?e.radius*Math.abs(e.sweep)*Math.PI/180:NaN;
 function polylineLength(o){if(o.closed||o.curveFit)return null;try{const n=root.cadPolyline.get(o).edges.reduce((sum,e)=>sum+edgeLength(e),0);return Number.isFinite(n)?n:null;}catch{return null;}}
 function lengthenPolyline(o,p,mode,value){
  const P=root.cadPolyline,total=polylineLength(o);if(total===null||!Number.isFinite(value))return null;
  const desired=mode==='delta'?total+value:mode==='percent'?total*value/100:mode==='total'||mode==='dynamic'?value:null;
  if(!(desired>1e-8)||Math.abs(desired-total)<1e-9)return null;
  const vertices=o.vertices,atStart=Math.hypot(p.x-vertices[0].x,p.y-vertices[0].y)<=Math.hypot(p.x-vertices.at(-1).x,p.y-vertices.at(-1).y),edges=P.get(o).edges;
  if(desired<total){
   const cut=atStart?total-desired:desired;let accumulated=0,q=null;
   for(const edge of edges){const n=edgeLength(edge);if(cut<=accumulated+n+1e-9){const t=Math.max(0,Math.min(1,(cut-accumulated)/n));q=edge.type==='cadLine'?{x:edge.a.x+(edge.b.x-edge.a.x)*t,y:edge.a.y+(edge.b.y-edge.a.y)*t}:G.pointAt(edge,edge.startAngle+edge.sweep*t);break;}accumulated+=n;}
   if(!q)return null;const plan=P.breakBetween(o,atStart?vertices[0]:vertices.at(-1),q);if(plan?.after.length!==1)return null;
   const out=plan.after[0],v=atStart?out.vertices[0]:out.vertices.at(-1);v.id=atStart?vertices[0].id:vertices.at(-1).id;P.validate(out);return{...plan,kind:'LENGTHEN',topology:'cadPolyline'};
  }
  const q=copy(o),edge=atStart?edges[0]:edges.at(-1),oldLength=edgeLength(edge),newLength=oldLength+desired-total,moving=atStart?q.vertices[0]:q.vertices.at(-1),fixed=atStart?q.vertices[1]:q.vertices.at(-2);
  if(edge.type==='cadLine'){const dx=moving.x-fixed.x,dy=moving.y-fixed.y;moving.x=fixed.x+dx*newLength/oldLength;moving.y=fixed.y+dy*newLength/oldLength;}
  else{const sweep=Math.sign(edge.sweep)*newLength/edge.radius*180/Math.PI;if(Math.abs(sweep)>=360-1e-8)return null;const angle=atStart?edge.startAngle+edge.sweep-sweep:edge.startAngle+sweep,pos=G.pointAt(edge,angle);moving.x=pos.x;moving.y=pos.y;(atStart?q.vertices[0]:q.vertices.at(-2)).outgoing.bulge=Math.tan(sweep*Math.PI/720);}
  P.validate(q);return{before:[o],after:[q],topology:'cadPolyline',kind:'LENGTHEN'};
 }
 function lengthen(o,p,mode,value){if(root.cadEllipse?.is(o))return root.cadEllipseOperations.lengthen(o,p,mode,value);
  if(root.cadPolyline?.is(o))return lengthenPolyline(o,p,mode,value);
  if(!['cadLine','cadArc','cadEllipse'].includes(o.type))return null;const q=copy(o),arc=o.type==='cadArc',start=arc?G.pointAt(o,o.startAngle):o.a,end=arc?G.pointAt(o,o.startAngle+o.sweep):o.b,atStart=Math.hypot(p.x-start.x,p.y-start.y)<=Math.hypot(p.x-end.x,p.y-end.y),old=arc?o.radius*Math.abs(o.sweep)*Math.PI/180:Math.hypot(end.x-start.x,end.y-start.y);
  const size=mode==='angleDelta'&&arc?old+o.radius*value*Math.PI/180:mode==='angleTotal'&&arc?o.radius*value*Math.PI/180:mode==='dynamic'?value:mode==='delta'?old+value:mode==='percent'?old*value/100:mode==='total'?value:null;if(!(size>1e-8))return null;
  if(arc){const sweep=Math.sign(o.sweep)*size/o.radius*180/Math.PI;if(Math.abs(sweep)>=360-1e-8)return null;q.sweep=sweep;if(atStart)q.startAngle=o.startAngle+o.sweep-sweep;}
  else{const fixed=atStart?end:start,moving=atStart?start:end;q[atStart?'a':'b']={x:fixed.x+(moving.x-fixed.x)*size/old,y:fixed.y+(moving.y-fixed.y)*size/old};}
  return{before:[o],after:[q]};
 }
 function dynamicPlan(o,sourcePoint,p){if(root.cadEllipse?.is(o))return root.cadEllipseOperations.dynamicLengthen(o,sourcePoint,p);
  if(root.cadPolyline?.is(o)){const total=polylineLength(o);if(total===null)return null;const edges=root.cadPolyline.get(o).edges,vs=o.vertices,atStart=Math.hypot(sourcePoint.x-vs[0].x,sourcePoint.y-vs[0].y)<=Math.hypot(sourcePoint.x-vs.at(-1).x,sourcePoint.y-vs.at(-1).y),e=atStart?edges[0]:edges.at(-1),moving=atStart?vs[0]:vs.at(-1),fixed=atStart?vs[1]:vs.at(-2);let n;
   if(e.type==='cadLine'){const q=G.projectNearest({...e,mode:'line'},p)?.point;if(!q||(q.x-fixed.x)*(moving.x-fixed.x)+(q.y-fixed.y)*(moving.y-fixed.y)<=0)return null;n=Math.hypot(q.x-fixed.x,q.y-fixed.y);}
   else{const a=Math.atan2(p.y-e.center.y,p.x-e.center.x)*180/Math.PI,sign=Math.sign(e.sweep),base=atStart?e.startAngle+e.sweep:e.startAngle,mag=(((atStart?base-a:a-base)*sign)%360+360)%360;if(mag<1e-8)return null;n=e.radius*mag*Math.PI/180;}
   return lengthenPolyline(o,sourcePoint,'total',total-edgeLength(e)+n);
  }
  if(!o||!p)return null;const start=o.type==='cadLine'?o.a:G.pointAt(o,o.startAngle),end=o.type==='cadLine'?o.b:G.pointAt(o,o.startAngle+o.sweep),atStart=Math.hypot(sourcePoint.x-start.x,sourcePoint.y-start.y)<=Math.hypot(sourcePoint.x-end.x,sourcePoint.y-end.y),fixed=atStart?end:start;
  if(o.type==='cadLine'){const q=G.projectNearest({...o,mode:'line'},p),old=atStart?start:end,dot=(q.point.x-fixed.x)*(old.x-fixed.x)+(q.point.y-fixed.y)*(old.y-fixed.y);return dot>0?lengthen(o,sourcePoint,'total',Math.hypot(q.point.x-fixed.x,q.point.y-fixed.y)):null;}
  const a=Math.atan2(p.y-o.center.y,p.x-o.center.x)*180/Math.PI,sign=Math.sign(o.sweep),base=atStart?o.startAngle+o.sweep:o.startAngle,sweep=((atStart?base-a:a-base)*sign%360+360)%360;return lengthen(o,sourcePoint,'angleTotal',sweep);
 }
 function install(registry,port){for(const id of ids)registry.register({id,aliases:[id==='LEN'?'LENGTHEN':'PEDIT'],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){if(id==='PE'&&root.nativePedit)return root.nativePedit.create(port);
  const d={phase:'source',token:port.token(),source:null,mode:null,value:null,pointer:null,sourcePoint:null,angle:false,history:[]};const prompt=()=>port.prompt(id,d.phase,d),refresh=()=>{d.token=port.token();port.preview(null);prompt();};
  function apply(plan){if(!plan||!port.commit(id,plan))return{ok:false,code:'no-valid-result'};d.history.push(port.historyMark());d.source=d.source&&port.byId(d.source.id);refresh();return{ok:true};}
  function asPoly(o){if(root.cadPolyline.is(o))return o;if(!['cadLine','cadArc','cadEllipse'].includes(o.type))return null;const arc=o.type==='cadArc',a=arc?G.pointAt(o,o.startAngle):o.a,b=arc?G.pointAt(o,o.startAngle+o.sweep):o.b,bulge=arc?Math.tan(o.sweep*Math.PI/180/4):0;if(!Number.isFinite(bulge)||arc&&Math.abs(o.sweep)>=360-1e-8)return null;const q={...copy(o),type:'cadPolyline',closed:false,vertices:[{...a,id:port.uid('cadVertex'),outgoing:{id:port.uid('cadEdge'),bulge}},{...b,id:port.uid('cadVertex')}]};for(const key of ['a','b','center','radius','startAngle','sweep'])delete q[key];return root.cadPolyline.validate(q);}

  prompt();return{view:()=>d,describe:()=>({phase:d.phase,actions:(id==='LEN'?[['DE','delta'],['P','percent'],['T','total'],['DY','dynamic']]:d.phase==='convert'?[['Y','convertYes'],['N','convertNo']]:d.source?[['C','close'],['O','open'],['R','reverse'],['J','join'],['V','vertex']]:[]).concat([['U','undo']]).map(([id,key])=>({id,labelKey:'cadAdvanced.'+key,enabled:id==='U'?d.history.length>0:id==='C'?!d.source?.closed:id==='O'?Boolean(d.source?.closed):id==='J'?!d.source?.closed:true}))}),
   preview(e){d.pointer=e.point;if(id==='LEN'&&d.phase==='dynamicEnd'){port.preview(dynamicPlan(d.source,d.sourcePoint,e.point));return{ok:true};}if(!port.current(d.token))return{ok:false,code:'stale-context'};if(id==='LEN'&&d.mode&&d.phase==='source'){const o=port.pick(e.point),plan=o&&port.allowed(o.id)?lengthen(o,e.point,d.mode,d.value):null;port.preview(plan);}return{ok:true};},
   input(e){if(!port.current(d.token))return{ok:false,code:'stale-context'};const k=e.type==='keyword'?String(e.value).toUpperCase():String(e.text||'').trim().toUpperCase();
    if(e.type==='enter'&&d.phase!=='convert'){port.finish();return{ok:true};}
    if(['U','UNDO'].includes(k)){const h=d.history.at(-1);if(!h||!port.undoOwn(h))return{ok:false,code:'nothing-to-back'};d.history.pop();d.source=d.source&&port.byId(d.source.id);refresh();return{ok:true};}
    if(id==='LEN'){
     if(d.phase==='value'&&['A','ANGLE'].includes(k)&&['delta','total'].includes(d.mode)){d.angle=true;prompt();return{ok:true};}
     const mode={DE:'delta',DELTA:'delta',P:'percent',PERCENT:'percent',T:'total',TOTAL:'total',DY:'dynamic',DYNAMIC:'dynamic'}[k];if(mode){d.mode=mode;d.angle=false;d.phase=mode==='dynamic'?'source':'value';prompt();return{ok:true};}
     if(d.phase==='value'){const v=d.mode==='percent'||d.angle?Number(e.text):port.parseLength(e.text)?.mm;if(!Number.isFinite(v)||(d.mode!=='delta'&&v<=0))return{ok:false,code:'invalid-distance'};d.value=v;if(d.angle)d.mode=d.mode==='delta'?'angleDelta':'angleTotal';d.phase='source';prompt();return{ok:true};}
     if(d.phase==='dynamicEnd'){const p=e.type==='point'?port.resolve(e.point,d.sourcePoint):e.type==='text'?port.parsePoint(e.text,{base:d.sourcePoint})?.point:null;if(!p)return{ok:false,code:'invalid-coordinate'};const plan=dynamicPlan(d.source,d.sourcePoint,p);const result=apply(plan);if(result.ok){d.source=null;d.phase='source';prompt();}return result;}
     const o=e.type==='point'?port.pick(e.point):null;if(!o||!port.allowed(o.id))return{ok:false,code:'target-not-modifiable'};if(!d.mode){if(!['cadLine','cadArc','cadEllipse'].includes(o.type)&&!(root.cadPolyline.is(o)&&polylineLength(o)!==null))return{ok:false,code:'unsupported-geometry'};const length=root.cadPolyline.is(o)?polylineLength(o):o.type==='cadLine'?Math.hypot(o.b.x-o.a.x,o.b.y-o.a.y):o.type==='cadEllipse'?root.cadEllipseOperations.arcLength(o):o.radius*Math.abs(o.sweep)*Math.PI/180;port.measure(length,o.type==='cadArc'?Math.abs(o.sweep):null);return{ok:true};}if(d.mode==='dynamic'){if(!['cadLine','cadArc','cadEllipse'].includes(o.type)&&!(root.cadPolyline.is(o)&&polylineLength(o)!==null))return{ok:false,code:'unsupported-geometry'};d.source=o;d.sourcePoint=e.point;d.phase='dynamicEnd';prompt();return{ok:true};}return apply(lengthen(o,e.point,d.mode,d.value));
    }
    if(d.phase==='source'){const o=e.type==='point'?port.pick(e.point):null;if(!o||!port.allowed(o.id)||!asPoly(o))return{ok:false,code:'unsupported-geometry'};d.source=o;port.select([o.id]);d.phase=root.cadPolyline.is(o)?'options':'convert';prompt();return{ok:true};}
    if(d.phase==='convert'){if(['N','NO'].includes(k)){port.finish();return{ok:true};}if(e.type!=='enter'&&!['Y','YES'].includes(k))return{ok:false,code:'invalid-keyword'};const result=apply({before:[d.source],after:[asPoly(d.source)],topology:'cadPolyline'});if(result.ok)d.phase='options';prompt();return result;}
    if(d.phase==='join'){const target=e.type==='point'?port.pick(e.point):null;if(!target||!port.allowed(target.id))return{ok:false,code:'target-not-modifiable'};const b=asPoly(target);const plan=b&&root.cadPolyline.joinOpen(d.source,b);if(!plan)return{ok:false,code:'no-valid-result'};plan.before=[d.source,target];const result=apply(plan);d.phase='options';prompt();return result;}
    let plan=null;if(['C','CLOSE','O','OPEN'].includes(k))plan=root.cadPolyline.setClosed(d.source,k.startsWith('C'));else if(['R','REVERSE'].includes(k))plan={before:[d.source],after:[root.cadPolyline.reverse(d.source)],topology:'cadPolyline'};else if(['J','JOIN'].includes(k)){d.phase='join';prompt();return{ok:true};}else if(['V','VERTEX'].includes(k)){port.select([d.source.id]);port.finish();port.gripHint();return{ok:true};}return apply(plan);
   },commit:plan=>port.commit(id,plan),cancel:()=>port.clear(),finalize:()=>port.clear()
  };
 }});}
 root.nativeEditCommands=Object.freeze({install,ids,lengthen,dynamicPlan,keyword:(id,phase,k)=>ids.includes(id)&&(keys.includes(k)||id==='PE'&&root.nativePedit?.keyword(k)),resolve:raw=>({LEN:'LEN',LENGTHEN:'LEN',PE:'PE',PEDIT:'PE'})[String(raw).toUpperCase()]||null});
})();
