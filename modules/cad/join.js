/* Native JOIN rules. PEDIT Join intentionally keeps its separate frame/decurve
 * contract. Primary/source owner appearance wins on an explicit JOIN. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},copy=o=>JSON.parse(JSON.stringify(o)),EPS=1e-6,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),norm=(n,t=360)=>(n%t+t)%t;
 function poly(o){if(M.cadPolyline.is(o))return o.curveFit?.kind==='arc'?M.cadPolylineFit.permanentArcs(o):o;if(!['cadLine','cadArc'].includes(o.type))return null;const ps=o.type==='cadLine'?[o.a,o.b]:[M.geometryQuery.pointAt(o,o.startAngle),M.geometryQuery.pointAt(o,o.startAngle+o.sweep)],q={...copy(o),type:'cadPolyline',closed:false,vertices:ps.map((p,i)=>({id:'__join_new_cadVertex_'+o.id+'_'+i+'__',...p,...(!i?{outgoing:{id:'__join_new_cadEdge_'+o.id+'__',bulge:o.type==='cadArc'?Math.tan(o.sweep*Math.PI/720):0}}:{})}))};for(const k of ['a','b','center','radius','startAngle','sweep','mode'])delete q[k];return q;}
 function inherit(a,b){return{...copy(a),id:b.id,type:b.type,closed:b.closed,vertices:copy(b.vertices)};}
 function close(o){if(o.type==='cadArc'){const q={...copy(o),type:'cadCircle'};delete q.startAngle;delete q.sweep;return{before:[o],after:[q]};}if(M.cadEllipse.is(o)&&!M.cadEllipse.full(o))return{before:[o],after:[{...copy(o),sweepParam:Math.PI*2}]};return null;}
 // Cut the periodic parameter space at the source start. If geometry reaches
 // that cut from behind, keep that part of the source's connected component.
 // Disjoint targets still fill the forward gap in source order.
 function conicSpan(spans,period,tolerance){
  const origin=spans[0].start;
  const ranges=[];
  for(const {start,length} of spans){
   const offset=norm(start-origin,period);
   const end=offset+length;
   ranges.push([offset,Math.min(end,period)]);
   if(end>period)ranges.push([0,end-period]);
  }
  ranges.sort((a,b)=>a[0]-b[0]);
  const merged=[];
  for(const range of ranges){
   const previous=merged.at(-1);
   if(previous&&range[0]<=previous[1]+tolerance)previous[1]=Math.max(previous[1],range[1]);
   else merged.push(range);
  }
  const last=merged.at(-1);
  if(merged.length===1&&last[1]>=period-tolerance)return {start:origin,length:period};
  if(last[1]>=period-tolerance){
   return {start:origin+last[0]-period,length:period-last[0]+merged.at(-2)[1]};
  }
  return {start:origin,length:last[1]};
 }
 function conicMember(source,target){
  if(source.type!==target.type||dist(source.center,target.center)>EPS)return null;
  if(source.type==='cadArc'){
   const length=Math.abs(target.sweep);
   if(Math.abs(source.radius-target.radius)>EPS||!(length>0&&length<360))return null;
   return {start:target.startAngle+Math.min(target.sweep,0),length};
  }
  const E=M.cadEllipse;
  if(E.full(target))return null;
  const a=Math.hypot(source.major.x,source.major.y);
  const ux=source.major.x/a,uy=source.major.y/a;
  const local=v=>({x:(v.x*ux+v.y*uy)/a,y:(-v.x*uy+v.y*ux)/(a*source.ratio)});
  const u=local(target.major),v=local(E.minor(target));
  if(![u.x*u.x+u.y*u.y-1,v.x*v.x+v.y*v.y-1,u.x*v.x+u.y*v.y].every(n=>Math.abs(n)<1e-9))return null;
  return {start:target.startParam+Math.min(target.sweepParam,0)+Math.atan2(u.y,u.x),length:Math.abs(target.sweepParam)};
 }
 function conicJoin(source,targets){
  const ellipse=M.cadEllipse.is(source);
  const origin=conicMember(source,source);
  if(!origin)return null;
  const spans=[origin],before=[source];
  for(const target of targets){
   const span=conicMember(source,target);
   if(span){spans.push(span);before.push(target);}
  }
  if(before.length===1)return null;
  const period=ellipse?M.cadEllipse.TAU:360;
  const {start,length}=conicSpan(spans,period,ellipse?1e-9:EPS);
  if(!ellipse&&length===period)return {...close(source),before};
  const after=ellipse?{...copy(source),startParam:start,sweepParam:length}
   :{...copy(source),startAngle:start,sweep:length};
  return {before,after:[after]};
 }
 function lineJoin(source,targets){
  const G=M.geometryQuery;
  const len=dist(source.a,source.b);
  if(len<EPS)return null;
  const axis={...source,mode:'line'};
  const before=[source];
  let first=source.a,last=source.b,min=0,max=1;
  for(const target of targets){
   if(target.type!=='cadLine'||[target.a,target.b].some(p=>G.projectNearest(axis,p).distance>EPS))continue;
   before.push(target);
   for(const point of [target.a,target.b]){
    const parameter=G.parameter(source,point);
    if(parameter<min){min=parameter;first=point;}
    if(parameter>max){max=parameter;last=point;}
   }
  }
  return before.length>1?{before,after:[{...copy(source),a:{...first},b:{...last}}]}:null;
 }
 function spline(a,b){const P=M.cadPolyline,aa=poly(a),bb=poly(b);if(!aa||!bb||aa.closed||bb.closed)return null;let es=P.get(aa).edges,bs=P.get(bb).edges;if([...es,...bs].some(e=>!['cadLine','cadBezier'].includes(e.type)))return null;const degree=Math.max(2,...[...es,...bs].map(e=>e.controls?.length-1||1));
  const convert=e=>{let ps=e.type==='cadLine'?Array.from({length:degree+1},(_,i)=>({x:e.a.x+(e.b.x-e.a.x)*i/degree,y:e.a.y+(e.b.y-e.a.y)*i/degree})):copy(e.controls);if(ps.length===3&&degree===3)ps=[ps[0],{x:(ps[0].x+2*ps[1].x)/3,y:(ps[0].y+2*ps[1].y)/3},{x:(2*ps[1].x+ps[2].x)/3,y:(2*ps[1].y+ps[2].y)/3},ps[2]];return{...e,type:'cadBezier',controls:ps};},reverse=list=>list.slice().reverse().map(e=>({...e,controls:e.controls.slice().reverse(),startWidth:e.endWidth||0,endWidth:e.startWidth||0}));es=es.map(convert);bs=bs.map(convert);
  const ends=q=>[q[0].controls[0],q.at(-1).controls.at(-1)],x=ends(es),y=ends(bs),matches=[];for(let i=0;i<2;i++)for(let j=0;j<2;j++)if(dist(x[i],y[j])<EPS)matches.push([i,j]);if(!matches.length||matches.length>2)return null;matches.sort((a,b)=>b[0]-a[0]||a[1]-b[1]);const [i,j]=matches[0];if(i===0)es=reverse(es);if(j===1)bs=reverse(bs);const spans=[...es,...bs],template={...aa,vertices:[...aa.vertices,...bb.vertices]},after=M.cadFittedOperations.fromSpans(template,spans);if(!after)return null;const loop=dist(spans[0].controls[0],spans.at(-1).controls.at(-1))<EPS;if(loop){after.closed=true;after.vertices.at(-1).outgoing={id:'__join_new_cadEdge_close__',bulge:0};P.validate(after);}return{before:[a,b],after:[after],topology:'cadPolyline',kind:'JOIN SPLINE'};
 }
 function pair(a,b){if(!a||!b||a.id===b.id||a.closed||b.closed||a.readonly||b.readonly)return null;
  if(M.cadFittedOperations.is(a))return spline(a,b);
  if(a.type==='cadLine')return lineJoin(a,[b]);
  if(a.type==='cadArc'||M.cadEllipse.is(a))return conicJoin(a,[b]);
  if(M.cadPolyline.is(a)){const aa=poly(a),bb=poly(b);if(!aa||!bb||bb.curveFit?.kind==='spline')return null;const target=inherit(aa,bb),q=M.cadPolyline.joinOpen(aa,target);if(q)return{...q,before:[a,b]};let tail=copy(target);if(dist(aa.vertices.at(-1),tail.vertices.at(-1))<EPS)tail=M.cadPolyline.reverse(tail);if(dist(aa.vertices.at(-1),tail.vertices[0])>=EPS||dist(aa.vertices[0],tail.vertices.at(-1))>=EPS)return null;const vertices=copy(aa.vertices);vertices.at(-1).outgoing=copy(tail.vertices[0].outgoing);vertices.push(...copy(tail.vertices.slice(1,-1)));const after={...copy(aa),closed:true,vertices};try{M.cadPolyline.validate(after);}catch{return null;}return{before:[a,b],after:[after],topology:'cadPolyline',kind:'JOIN CLOSED POLYLINE'};}
  return null;
 }
 function canJoin(o){return Boolean(o&&!o.readonly&&!o.closed&&(
  o.type==='cadLine'||o.type==='cadArc'||M.cadEllipse.is(o)&&!M.cadEllipse.full(o)||M.cadPolyline.is(o)));}
 function batch(source,targets){
  if(!canJoin(source))return null;
  const unique=new Map();
  for(const target of targets)if(canJoin(target)&&target.id!==source.id)unique.set(target.id,target);
  const remaining=[...unique.values()];
  if(source.type==='cadLine')return lineJoin(source,remaining);
  if(source.type==='cadArc'||M.cadEllipse.is(source))return conicJoin(source,remaining);
  let merged=source;
  const before=[source];
  // Retry only when an accepted join can make a previously isolated endpoint reachable.
  for(let i=0;i<remaining.length;){
   const plan=pair(merged,remaining[i]);
   if(!plan){i++;continue;}
   before.push(remaining.splice(i,1)[0]);
   merged=plan.after[0];
   i=0;
  }
  return before.length>1?{before,after:[merged],...(M.cadPolyline.is(merged)?{topology:'cadPolyline'}:{})}:null;
 }
 M.cadJoin=Object.freeze({pair,batch,canJoin,close,spline,poly});
})();
