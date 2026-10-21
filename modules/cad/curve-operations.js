/* Exact circular TRIM / EXTEND / BREAK / JOIN. Retains source metadata and
 * canonical ARC/CIRCLE geometry, with no sampled-polyline replacements. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},G=root.geometryQuery,E=1e-7,norm=n=>(n%360+360)%360,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const angle=(o,p)=>Math.atan2(p.y-o.center.y,p.x-o.center.x)*180/Math.PI;
 const arc=(o,start,sweep)=>({...o,type:'cadArc',startAngle:start,sweep});
 function param(o,p){return norm((angle(o,p)-o.startAngle)*Math.sign(o.sweep))/Math.abs(o.sweep);}
 function trim(o,p,cutters){if(!['cadCircle','cadArc'].includes(o?.type))return null;const hits=cutters.flatMap(c=>G.create().intersections(o,c));if(!hits.length)return null;
  if(o.type==='cadCircle'){const cuts=[...new Set(hits.map(q=>Math.round(norm(angle(o,q))*1e9)/1e9))].sort((a,b)=>a-b);if(cuts.length<2)return null;const t=norm(angle(o,p));let i=cuts.findLastIndex(a=>a<=t);if(i<0)i=cuts.length-1;const from=cuts[i],to=cuts[(i+1)%cuts.length],sweep=norm(from-to);if(sweep<1e-8)return null;return{kind:'trim',before:o,after:[arc(o,to,sweep)],removed:[arc(o,from,360-sweep)]};}
  const cuts=[0,...hits.map(q=>param(o,q)).filter(t=>t>1e-9&&t<1-1e-9),1].sort((a,b)=>a-b);if(cuts.length<3)return null;const t=param(o,G.projectNearest(o,p).point);let i=cuts.findIndex((v,i)=>i<cuts.length-1&&t>=v-1e-10&&t<=cuts[i+1]+1e-10);if(i<0)return null;const a=cuts[i],b=cuts[i+1],after=[];if(a>1e-9)after.push(arc(o,o.startAngle,o.sweep*a));if(b<1-1e-9)after.push(arc(o,o.startAngle+o.sweep*b,o.sweep*(1-b)));return{kind:'trim',before:o,after,removed:[arc(o,o.startAngle+o.sweep*a,o.sweep*(b-a))]};
 }
 function extend(o,p,cutters){if(o?.type!=='cadArc')return null;const sign=Math.sign(o.sweep),start=G.pointAt(o,o.startAngle),end=G.pointAt(o,o.startAngle+o.sweep),atStart=dist(p,start)<dist(p,end),origin=atStart?o.startAngle:o.startAngle+o.sweep,direction=atStart?-sign:sign;
  const circle={...o,type:'cadCircle'},options=cutters.flatMap(c=>G.create().intersections(circle,c)).map(q=>({q,delta:norm((angle(o,q)-origin)*direction)})).filter(v=>v.delta>1e-8&&Math.abs(o.sweep)+v.delta<360-1e-8).sort((a,b)=>a.delta-b.delta);if(!options.length)return null;const delta=options[0].delta,after=arc(o,atStart?o.startAngle-sign*delta:o.startAngle,o.sweep+sign*delta);return{kind:'extend',before:o,after:[after],removed:[]};
 }
 function breakBetween(o,p1,p2){if(!['cadCircle','cadArc'].includes(o?.type))return null;
  if(o.type==='cadCircle'){const a=norm(angle(o,p1)),b=norm(angle(o,p2)),sweep=norm(a-b);if(sweep<1e-8)return null;return{before:[o],after:[arc(o,b,sweep)],removed:[arc(o,a,360-sweep)]};}
  const a=Math.min(param(o,G.projectNearest(o,p1).point),param(o,G.projectNearest(o,p2).point)),b=Math.max(param(o,G.projectNearest(o,p1).point),param(o,G.projectNearest(o,p2).point)),after=[];if(a>1e-9)after.push(arc(o,o.startAngle,o.sweep*a));if(b<1-1e-9)after.push(arc(o,o.startAngle+o.sweep*b,o.sweep*(1-b)));if(!after.length)return null;return{before:[o],after,removed:b-a>1e-9?[arc(o,o.startAngle+o.sweep*a,o.sweep*(b-a))]:[]};
 }
 function join(a,b){if(a?.type!=='cadArc'||b?.type!=='cadArc'||a.id===b.id||dist(a.center,b.center)>E||Math.abs(a.radius-b.radius)>E||Math.sign(a.sweep)!==Math.sign(b.sweep))return null;
  if(['cadLayer','color','linetype','lineweight','drawOrder','linetypeScale','transparency'].some(k=>(a[k]??null)!==(b[k]??null)))return null;const sweep=a.sweep+b.sweep;if(Math.abs(sweep)>360+1e-8)return null;let start;if(dist(G.pointAt(a,a.startAngle+a.sweep),G.pointAt(b,b.startAngle))<E)start=a.startAngle;else if(dist(G.pointAt(b,b.startAngle+b.sweep),G.pointAt(a,a.startAngle))<E)start=b.startAngle;else return null;let after=arc(a,start,sweep);if(Math.abs(Math.abs(sweep)-360)<1e-8){after={...a,type:'cadCircle'};delete after.startAngle;delete after.sweep;}return{before:[a,b],after:[after]};
 }
 root.cadCurveOperations=Object.freeze({trim,extend,breakBetween,join});
})();
