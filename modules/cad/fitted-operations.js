/* Exact polynomial spline editing. Cuts use de Casteljau, never plotted vertices.
 * A detached result stores a non-rational knot vector and its actual control frame.
 * Original fitted owners are not migrated until an explicit edit requires it. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},EPS=1e-8,copy=o=>JSON.parse(JSON.stringify(o)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),B=()=>M.cadBezier,P=()=>M.cadPolyline;
 const is=o=>P().is(o)&&o.curveFit?.kind==='spline';
 function fragment(e,a,b){const q=B().fragment(e,a,b),sw=e.startWidth||0,ew=e.endWidth||0;return{...q,startWidth:sw+(ew-sw)*a,endWidth:sw+(ew-sw)*b,spanDuration:(e.spanDuration||1)*(b-a)};}
 function fromSpans(o,spans,{id=o.id,used=new Set()}={}){
  if(!spans.length||spans.length>3000||spans.some(e=>e.type!=='cadBezier'))return null;
  const degree=spans[0].controls.length-1;if(![2,3].includes(degree)||spans.some(e=>e.controls.length!==degree+1))return null;
  const controls=[],knots=Array(degree+1).fill(0),widths=[];let t=0,seq=0;
  for(const [i,e]of spans.entries()){
   if(i&&dist(spans[i-1].controls.at(-1),e.controls[0])>1e-6)return null;
   controls.push(...e.controls.slice(i?1:0).map(p=>({x:p.x,y:p.y})));
   for(let j=0;j<degree;j++)widths.push({startWidth:(e.startWidth||0)+((e.endWidth||0)-(e.startWidth||0))*j/degree,endWidth:(e.startWidth||0)+((e.endWidth||0)-(e.startWidth||0))*(j+1)/degree});
   t+=e.spanDuration||1;knots.push(...Array(i===spans.length-1?degree+1:degree).fill(t));
  }
  const vertices=controls.map((p,i)=>{const old=o.vertices.find(v=>!used.has(v.id)&&dist(v,p)<1e-8),vertexId=old?.id||'__fit_new_cadVertex_'+id+'_'+seq+++'__';used.add(vertexId);const v={...p,id:vertexId};if(i<controls.length-1){const w=widths[i];v.outgoing={id:'__fit_new_cadEdge_'+id+'_'+i+'__',bulge:0,...(w.startWidth?{startWidth:w.startWidth}:{}),...(w.endWidth?{endWidth:w.endWidth}:{})};}return v;});
  const q={...copy(o),id,closed:false,vertices,curveFit:{kind:'spline',degree,knots}};
  try{P().validate(q);const es=P().get(q).edges;if(!es.length||es.every(e=>e.controls.every(p=>dist(p,e.controls[0])<EPS)))return null;}catch{return null;}
  return q;
 }
 function refineAt(o,p){if(!is(o))return null;const es=P().get(o).edges,hit=position(o,p);if(!hit||hit.t<EPS||hit.t>1-EPS)return null;const e=es[hit.index],spans=[...es.slice(0,hit.index),fragment(e,0,hit.t),fragment(e,hit.t,1),...es.slice(hit.index+1)],q=fromSpans(o,spans);if(!q)return null;if(o.closed){q.closed=true;q.vertices.at(-1).outgoing={id:'__fit_new_cadEdge_close__',bulge:0};try{P().validate(q);}catch{return null;}}return{before:[o],after:[q],topology:'cadPolyline',kind:'REFINE SPLINE',point:hit.point};}
 function position(o,p){let best=null;for(const [i,e]of P().get(o).edges.entries()){const q=B().nearest(e,p);if(!best||q.distance<best.distance)best={...q,pos:i+q.t,index:i};}return best;}
 function slice(es,from,to){const out=[],n=es.length;if(!(to-from>EPS)||to-from>n+EPS)return out;let pos=from;while(pos<to-EPS){const i=Math.floor(pos+EPS),t0=Math.max(0,pos-i),t1=Math.min(1,to-i),e=es[((i%n)+n)%n];if(t1-t0>EPS)out.push(fragment(e,t0,t1));pos=i+1;}return out;}
 function planRanges(o,ranges,removed=[]){const es=P().get(o).edges,used=new Set(),after=[];for(const [i,[from,to]]of ranges.entries()){const q=fromSpans(o,slice(es,from,to),{id:i?('__break_new_cadPolyline_'+i+'__'):o.id,used});if(!q)return null;after.push(q);}return{kind:'BREAK',topology:'cadPolyline',before:[o],after,removed};}
 function breakBetween(o,p1,p2){if(!is(o))return null;const a=position(o,p1),b=position(o,p2),n=P().get(o).edges.length;if(!a||!b)return null;
  if(o.closed){let end=b.pos;if(Math.abs(end-a.pos)<EPS)return planRanges(o,[[a.pos,a.pos+n]],[]);if(end<=a.pos)end+=n;return planRanges(o,[[end,a.pos+n]],slice(P().get(o).edges,a.pos,end));}
  const lo=Math.min(a.pos,b.pos),hi=Math.max(a.pos,b.pos),ranges=[];if(lo>EPS)ranges.push([0,lo]);if(hi<n-EPS)ranges.push([hi,n]);if(Math.abs(hi-lo)<EPS&&ranges.length!==2)return null;return planRanges(o,ranges,slice(P().get(o).edges,lo,hi));
 }
 function trim(o,p,cutters){if(!is(o))return null;const es=P().get(o).edges,n=es.length,hit=position(o,p),cuts=[];let work=0;if(!hit)return null;
  for(const [i,e]of es.entries())for(const cutter of cutters){if(cutter.id===o.id)continue;if(++work>200000)return null;for(const q of M.geometryQuery.intersections(e,cutter)){for(const t of [0,1,...B().stationary(e,q)])if(dist(B().at(e,t),q)<1e-6){const value=i+t;if(!cuts.some(v=>Math.abs(v-value)<EPS))cuts.push(value);}}}
  cuts.sort((a,b)=>a-b);
  if(o.closed){if(cuts.length<2)return null;let i=cuts.findLastIndex(v=>v<=hit.pos+EPS);if(i<0)i=cuts.length-1;const a=cuts[i],b=cuts[(i+1)%cuts.length]+(i===cuts.length-1?n:0);const q=planRanges(o,[[b,a+n]],slice(es,a,b));return q&&{...q,kind:'trim',before:o};}
  const bounds=[0,...cuts.filter(v=>v>EPS&&v<n-EPS),n];if(bounds.length<3)return null;const i=bounds.findIndex((v,i)=>i<bounds.length-1&&hit.pos>=v-EPS&&hit.pos<=bounds[i+1]+EPS);if(i<0)return null;const ranges=[];if(bounds[i]>EPS)ranges.push([0,bounds[i]]);if(bounds[i+1]<n-EPS)ranges.push([bounds[i+1],n]);const q=planRanges(o,ranges,slice(es,bounds[i],bounds[i+1]));return q&&{...q,kind:'trim',before:o};
 }
 function reverseSpans(es){return es.slice().reverse().map(e=>({...e,controls:e.controls.slice().reverse(),startWidth:e.endWidth||0,endWidth:e.startWidth||0}));}
 function terminal(es,start){const q=start?reverseSpans(es):es,e=q.at(-1),a=e.controls.at(-1),d=B().derivative(e,1),length=Math.hypot(d.x,d.y);return length>EPS?{point:a,unit:{x:d.x/length,y:d.y/length},speed:length,duration:e.spanDuration||1}:null;}
 function lineSpan(a,b,degree,width,duration){return{type:'cadBezier',controls:Array.from({length:degree+1},(_,i)=>({x:a.x+(b.x-a.x)*i/degree,y:a.y+(b.y-a.y)*i/degree})),startWidth:width||0,endWidth:width||0,spanDuration:duration};}
 function extend(o,p,cutters){if(!is(o)||o.closed)return null;const es=P().get(o).edges,a=es[0].controls[0],b=es.at(-1).controls.at(-1),start=dist(p,a)<=dist(p,b),t=terminal(es,start);if(!t)return null;const ray={type:'cadLine',a:t.point,b:{x:t.point.x+t.unit.x,y:t.point.y+t.unit.y},mode:'ray'},hits=cutters.filter(c=>c.id!==o.id).flatMap(c=>M.geometryQuery.intersections(ray,c)).map(q=>({q,t:M.geometryQuery.parameter(ray,q)})).filter(q=>q.t>EPS).sort((a,b)=>a.t-b.t);if(!hits.length)return null;const length=hits[0].t,oriented=start?reverseSpans(es):es,last=oriented.at(-1),added=lineSpan(t.point,hits[0].q,o.curveFit.degree,last.endWidth,length/t.speed*t.duration),next=[...oriented,added],after=fromSpans(o,start?reverseSpans(next):next);return after?{kind:'extend',topology:'cadPolyline',before:o,after:[after],removed:[],a:t.point,b:hits[0].q}:null;}
 function spanLength(e,from=0,to=1){const speed=t=>{const d=B().derivative(e,t);return Math.hypot(d.x,d.y);},simpson=(a,b,x,y,z)=>(b-a)*(x+4*y+z)/6;
  function go(a,b,x,y,z,old,tol,depth){const m=(a+b)/2,l=speed((a+m)/2),r=speed((m+b)/2),left=simpson(a,m,x,l,y),right=simpson(m,b,y,r,z),error=left+right-old;if(depth>=20||Math.abs(error)<=15*tol)return left+right+error/15;return go(a,m,x,l,y,left,tol/2,depth+1)+go(m,b,y,r,z,right,tol/2,depth+1);}
  const x=speed(from),y=speed((from+to)/2),z=speed(to),rough=simpson(from,to,x,y,z);return go(from,to,x,y,z,rough,Math.max(1e-8,rough*1e-11),0);
 }
 const length=o=>is(o)?P().get(o).edges.reduce((s,e)=>s+spanLength(e),0):null;
 function lengthen(o,p,mode,value){if(!is(o)||o.closed||!Number.isFinite(value)||['angleDelta','angleTotal'].includes(mode))return null;const es=P().get(o).edges,total=length(o),desired=mode==='delta'?total+value:mode==='percent'?total*value/100:['total','dynamic'].includes(mode)?value:null;if(!(desired>EPS)||Math.abs(desired-total)<EPS)return null;
  const start=dist(p,es[0].controls[0])<=dist(p,es.at(-1).controls.at(-1)),oriented=start?reverseSpans(es):es;let next=[];
  if(desired>total){const t=terminal(es,start);if(!t)return null;const added=desired-total,b={x:t.point.x+t.unit.x*added,y:t.point.y+t.unit.y*added};next=[...oriented,lineSpan(t.point,b,o.curveFit.degree,oriented.at(-1).endWidth,added/t.speed*t.duration)];}
  else{let rest=desired;for(const e of oriented){const n=spanLength(e);if(rest>=n-EPS){next.push(e);rest-=n;if(rest<EPS)break;}else{let lo=0,hi=1;for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(spanLength(e,0,mid)<rest)lo=mid;else hi=mid;}next.push(fragment(e,0,(lo+hi)/2));break;}}}
  const after=fromSpans(o,start?reverseSpans(next):next);return after?{kind:'LENGTHEN',topology:'cadPolyline',before:[o],after:[after]}:null;
 }
 function dynamicLengthen(o,source,p){if(!is(o)||o.closed)return null;const es=P().get(o).edges,start=dist(source,es[0].controls[0])<=dist(source,es.at(-1).controls.at(-1)),t=terminal(es,start);if(!t)return null;const extension=(p.x-t.point.x)*t.unit.x+(p.y-t.point.y)*t.unit.y,total=length(o);if(extension>EPS)return lengthen(o,source,'total',total+extension);const hit=position(o,p);if(!hit)return null;const before=es.slice(0,hit.index).reduce((n,e)=>n+spanLength(e),0)+spanLength(es[hit.index],0,hit.t);return lengthen(o,source,'total',start?total-before:before);}
 M.cadFittedOperations=Object.freeze({is,fragment,fromSpans,refineAt,position,slice,breakBetween,trim,extend,spanLength,length,lengthen,dynamicLengthen});
})();
