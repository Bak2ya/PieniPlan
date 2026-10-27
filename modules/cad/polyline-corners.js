/* Native polyline corner orchestration over the existing exact LINE/ARC solver.
 * Source objects remain immutable; returned plans publish once through shared history. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},clone=o=>JSON.parse(JSON.stringify(o)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),mid=e=>e.type==='cadArc'?M.geometryQuery.pointAt(e,e.startAngle+e.sweep/2):({x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2});
 function prepared(o,p1,p2){const P=M.cadPolyline;if(!P.is(o)||o.curveFit)return[];const es=P.get(o).edges,h1=P.nearest(o,p1),h2=P.nearest(o,p2);if(!h1||!h2||h1.edgeId===h2.edgeId)return[];const i=es.findIndex(e=>e.edgeId===h1.edgeId),j=es.findIndex(e=>e.edgeId===h2.edgeId),n=es.length,out=[];
  for(const [a,b]of [[i,j],[j,i]]){if(a+1===b||o.closed&&(a+1)%n===b){const v=o.vertices[b];out.push({object:o,p1,p2,score:distance(p1,v)+distance(p2,v),bridged:false});}
   if(!(a+2===b||o.closed&&n>2&&(a+2)%n===b))continue;const prev=es[a],next=es[b];if(prev.type!=='cadLine'||next.type!=='cadLine')continue;
   const intersections=M.geometryQuery.intersections({...prev,mode:'line'},{...next,mode:'line'});if(intersections.length!==1)continue;const q=intersections[0],t0=M.geometryQuery.parameter(prev,q),t1=M.geometryQuery.parameter(next,q);if(t0<=1e-8||t1>=1-1e-8)continue;
   const copy=clone(o),incoming=copy.vertices[a].outgoing,start=(a+1)%copy.vertices.length,removed=(a+2)%copy.vertices.length,corner=copy.vertices[start],wa=(prev.startWidth||0)+((prev.endWidth||0)-(prev.startWidth||0))*t0,wb=(next.startWidth||0)+((next.endWidth||0)-(next.startWidth||0))*t1;if(wa<0||wb<0)continue;
   incoming.endWidth=wa;Object.assign(corner,{x:q.x,y:q.y,outgoing:{...copy.vertices[b].outgoing,startWidth:wb}});copy.vertices.splice(removed,1);try{P.validate(copy);}catch{continue;}
   const fresh=P.get(copy).edges,first=fresh.find(e=>e.edgeId===h1.edgeId),second=fresh.find(e=>e.edgeId===h2.edgeId);if(!first||!second)continue;
   out.push({object:copy,p1:mid(first),p2:mid(second),score:distance(p1,q)+distance(p2,q),bridged:true});
  }
  if(!o.closed&&n>1&&new Set([i,j]).has(0)&&new Set([i,j]).has(n-1)&&es[0].type==='cadLine'&&es.at(-1).type==='cadLine'){
   const first=es[0],last=es.at(-1),hits=M.geometryQuery.intersections({...last,mode:'line'},{...first,mode:'line'});if(hits.length===1){const q=hits[0],ta=M.geometryQuery.parameter(first,q),tb=M.geometryQuery.parameter(last,q),wa=(first.startWidth||0)+((first.endWidth||0)-(first.startWidth||0))*ta,wb=(last.startWidth||0)+((last.endWidth||0)-(last.startWidth||0))*tb;if(ta<1-1e-8&&tb>1e-8&&wa>=0&&wb>=0){const closed=clone(o);closed.closed=true;closed.vertices.pop();Object.assign(closed.vertices[0],q);closed.vertices[0].outgoing.startWidth=wa;closed.vertices.at(-1).outgoing.endWidth=wb;try{P.validate(closed);const es2=P.get(closed).edges,pick0=i===0?p1:p2,pick1=i===0?p2:p1;out.push({object:closed,p1:mid(es2[0]),p2:mid(es2.at(-1)),score:distance(pick0,o.vertices[0])+distance(pick1,o.vertices.at(-1)),bridged:true,closedEndpoints:true});}catch{}}}
  }return out.sort((a,b)=>a.score-b.score);
 }
 function appearance(o){return Object.fromEntries(['cadLayer','layer','color','linetype','lineweight','linetypeScale','transparency'].filter(k=>Object.hasOwn(o,k)).map(k=>[k,o[k]]));}
 function corner(o,p1,p2,value,{kind='FILLET',distance2=value,angle=null,trim=true}={}){if(!Number.isFinite(value)||value<0||!Number.isFinite(distance2)||distance2<0)return null;const P=M.cadPolyline;
  for(const pair of prepared(o,p1,p2)){const source=pair.object;
   if(value===0&&(kind==='FILLET'||distance2===0||kind==='CHAMFER'&&angle===0)){const es=P.get(source).edges,a=P.nearest(source,pair.p1),b=P.nearest(source,pair.p2);if(!a||!b||es.find(e=>e.edgeId===a.edgeId)?.type!=='cadLine'||es.find(e=>e.edgeId===b.edgeId)?.type!=='cadLine')continue;if(!trim)return{before:[],after:[],noChange:true};return pair.bridged?{before:[o],after:[source],topology:'cadPolyline',kind,sharp:true}:{before:[o],after:[o],noChange:true};}
   const plan=kind==='CHAMFER'?P.chamferAt(source,pair.p1,pair.p2,value,{distance2,angle}):P.filletAt(source,pair.p1,pair.p2,value);if(!plan)continue;
   if(trim)return{...plan,before:[o],bridged:pair.bridged};
   const g=kind==='FILLET'?plan.fillet:null;if(g)return{before:[],after:[{id:'__corner_new_arc__',type:'cadArc',center:{...g.center},radius:g.radius,startAngle:g.startAngle,sweep:g.sweep,...appearance(o)}],kind:'FILLET NOTRIM'};
   const after=plan.after[0],edge=P.get(after).edges.find(e=>String(e.edgeId).startsWith('__chamfer_new_'));if(!edge)continue;return{before:[],after:[{id:'__corner_new_line__',type:'cadLine',a:{...edge.a},b:{...edge.b},...appearance(o)}],kind:'CHAMFER NOTRIM'};
  }return null;
 }
 function all(o,value,options={}){const P=M.cadPolyline;if(!P.is(o)||o.curveFit)return null;const original=P.get(o).edges,n=original.length,pairs=[],modern=options.kind!=='CHAMFER'&&options.polyArc!==0;
  // Preserve the established replacement of a single intervening arc first.
  // Other modern LINE/ARC joints reuse the same exact pair solver afterwards.
  for(let i=0;i<n;i++)if(original[i].type==='cadLine'&&(i+2<n||o.closed)&&original[(i+1)%n].type==='cadArc'&&original[(i+2)%n].type==='cadLine')pairs.push([original[i].edgeId,original[(i+2)%n].edgeId]);
  for(let i=0;i<n;i++){const j=i+1;if(j>=n&&!o.closed)continue;const a=original[i],b=original[j%n];if(a.type==='cadLine'&&b.type==='cadLine'||modern&&['cadLine','cadArc'].includes(a.type)&&['cadLine','cadArc'].includes(b.type))pairs.push([a.edgeId,b.edgeId]);}

  let current=o,changed=0,skipped=0;const additions=[];for(const [id0,id1]of pairs){const es=P.get(current).edges,a=es.find(e=>e.edgeId===id0),b=es.find(e=>e.edgeId===id1);if(!a||!b){skipped++;continue;}const plan=corner(current,mid(a),mid(b),value,options);if(!plan||plan.noChange){skipped++;continue;}if(options.trim===false){for(const q of plan.after)additions.push({...q,id:q.id+changed});}else{current=plan.after[0];for(const v of current.vertices){if(/^__(fillet|chamfer)_new_/.test(v.id))v.id+='step'+changed;if(v.outgoing&&/^__(fillet|chamfer)_new_/.test(v.outgoing.id))v.outgoing.id+='step'+changed;}}changed++;}
  return changed?{before:options.trim===false?[]:[o],after:options.trim===false?additions:[current],topology:options.trim===false?undefined:'cadPolyline',kind:(options.kind||'FILLET')+' POLYLINE',changed,skipped}:{before:[],after:[],noChange:true,changed:0,skipped};
 }
 // Different owners: virtual straight subedges go through the same exact pair
 // solver. A trimmed chain can only be joined at a free terminal; modifying an
 // interior junction would create a branch or reshape an unselected curve.
 function pair(a,pa,b,pb,value,{kind='FILLET',distance2=value,angle=null,trim=true,layer=null}={}){
  const P=M.cadPolyline,G=M.geometryQuery,J=M.cadJoin,eps=G.tolerance.model;
  if(!a||!b||a.id===b.id||!J||!Number.isFinite(value)||value<0||!Number.isFinite(distance2)||distance2<0)return null;
  function part(o,p){
   if(!P.is(o))return['cadLine','cadRay','cadXline',...(!trim&&kind!=='CHAMFER'?['cadArc','cadCircle','cadEllipse']:[])].includes(o.type)?{owner:o,leaf:o,poly:false}:null;
   if(o.curveFit)return null;const es=P.get(o).edges,hit=P.nearest(o,p),index=hit&&es.findIndex(e=>e.edgeId===hit.edgeId),e=es[index];
   if(!e||e.type!=='cadLine'&&!(!trim&&kind!=='CHAMFER'&&e.type==='cadArc'))return null;
   return{owner:o,poly:true,leaf:{...clone(e),...appearance(o),id:o.id},edge:e,index,terminal:!o.closed&&(index===0||index===es.length-1),canStart:index===0,canEnd:index===es.length-1};
  }
  try{
   const x=part(a,pa),y=part(b,pb);if(!x||!y||!x.poly&&!y.poly)return null;
   const solve=kind==='CHAMFER'?M.cadLinearOperations.chamfer:M.cadLinearOperations.fillet,plan=solve(x.leaf,pa,y.leaf,pb,value,{distance2,angle,trim,layer});if(!plan)return null;
   if(!trim)return plan;
   if([x,y].some(q=>q.poly?!q.terminal:q.owner.type!=='cadLine'))return null;
   const connector=plan.after.find(e=>e.id!==a.id&&e.id!==b.id),contact=(q,first)=>!q?null:q.type==='cadLine'?(first?q.a:q.b):G.pointAt(q,q.startAngle+(first?0:q.sweep));
   function project(q,point){
    const leaf=plan.after.find(e=>e.id===q.owner.id)||q.leaf;
    if(!q.poly)return{object:J.poly(leaf),width:0};
    const atStart=q.canStart&&(!q.canEnd||distance(leaf.b,q.leaf.b)<=eps&&(!point||distance(point,leaf.a)<=distance(point,leaf.b))),fixed=atStart?'b':'a',free=atStart?'a':'b';if(leaf.type!=='cadLine'||distance(leaf[fixed],q.leaf[fixed])>eps)return null;
    const o=clone(q.owner),vertex=atStart?o.vertices[0]:o.vertices.at(-1),outgoing=o.vertices[q.index].outgoing,t=G.parameter(q.edge,leaf[free]),s=q.edge.startWidth||0,e=q.edge.endWidth||0,w=s+(e-s)*t;
    if(!Number.isFinite(w)||w<0||w>1e7)return null;vertex.x=leaf[free].x;vertex.y=leaf[free].y;
    const key=atStart?'startWidth':'endWidth';if(w)outgoing[key]=w;else delete outgoing[key];P.validate(o);return{object:o,width:w};
   }
   const px=project(x,contact(connector,true)),py=project(y,contact(connector,false));if(!px?.object||!py?.object)return null;
   let current=x.poly?px.object:py.object,other=x.poly?py.object:px.object;
   // IDs are scoped to the old owners. Only collisions in a consumed namespace
   // need fresh JOIN identities; the surviving chain never gets renumbered.
   let serial=0;function disjoint(q,base){const copy=clone(q),vertices=new Set(base.vertices.map(v=>v.id)),edges=new Set(base.vertices.flatMap(v=>v.outgoing?[v.outgoing.id]:[])),reserved=new Set([...vertices,...edges,...copy.vertices.flatMap(v=>[v.id,...(v.outgoing?[v.outgoing.id]:[])])]);const fresh=type=>{let id;do{id=`__join_new_${type}_corner_${serial++}__`;}while(reserved.has(id));reserved.add(id);return id;};for(const v of copy.vertices){if(vertices.has(v.id))v.id=fresh('cadVertex');vertices.add(v.id);if(v.outgoing){if(edges.has(v.outgoing.id))v.outgoing.id=fresh('cadEdge');edges.add(v.outgoing.id);}}return P.validate(copy);}
   if(connector){let id='__mixed_corner_connector__';while([a.id,b.id].includes(id))id+='_';let link=J.poly({...connector,id});if(!link)return null;const outgoing=link.vertices[0].outgoing;for(const [key,w]of [['startWidth',px.width],['endWidth',py.width]])if(w)outgoing[key]=w;else delete outgoing[key];link=disjoint(link,current);const joined=J.pair(current,link);if(!joined)return null;current=joined.after[0];}
   other=disjoint(other,current);const joined=J.pair(current,other);if(!joined)return null;current=joined.after[0];P.validate(current);
   return{before:[a,b],after:[current],topology:'cadPolyline',kind:kind+' MIXED POLYLINE',survivorOwnerId:current.id,retiredOwnerIds:[a.id,b.id].filter(id=>id!==current.id)};
  }catch{return null;}
 }
 M.cadPolylineCorners=Object.freeze({prepared,corner,all,pair});
})();
