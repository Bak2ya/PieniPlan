/* Fence / polygon selection uses exact curve intersections and interval tests.
 * Selection is a query on parent owners; no explode, reshape or document writes. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},G=root.geometryQuery;
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),line=(a,b)=>({type:'cadLine',a,b});
 function onBoundary(p,polygon){return polygon.some((a,i)=>G.projectNearest(line(a,polygon[(i+1)%polygon.length]),p)?.distance<1e-7);}
 function inside(p,polygon){if(onBoundary(p,polygon))return true;let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)hit=!hit;}return hit;}
 function simple(p){if(p.length<3)return false;let area=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if(distance(a,b)<1e-8)return false;area+=a.x*b.y-b.x*a.y;for(let j=i+2;j<p.length;j++){if(i===0&&j===p.length-1)continue;if(G.intersections(line(a,b),line(p[j],p[(j+1)%p.length])).length)return false;}}return Math.abs(area)>1e-8;}
 function primitives(o,geometry){if(root.cadPolyline?.is(o))return root.cadPolyline.get(o).edges;if(root.cadBlocks?.is(o))return root.cadBlocks.expand(o).flatMap(q=>primitives(q,geometry));if(o.type==='cadDxfRecord')return(o.preview||[]).flatMap(q=>primitives(q,geometry));if(o.type==='cadText'){const p=geometry.textPolygon(o);return p.map((a,i)=>line(a,p[(i+1)%p.length]));}if(['cadHatch','cadLeader'].includes(o.type)){const loops=o.loops?.length?o.loops:[o.points||[]];return loops.flatMap(p=>p.slice(0,p.length-(o.closed===false?1:0)).map((a,i)=>line(a,p[(i+1)%p.length])));}if(o.type==='cadDimension'&&root.cadDimensionStyles)return root.cadDimensionStyles.scene(o).flatMap(q=>primitives(q,geometry));return[o];}
 function curvePoint(o,t){return o.a?{x:o.a.x+(o.b.x-o.a.x)*t,y:o.a.y+(o.b.y-o.a.y)*t}:G.pointAt(o,(o.startAngle||0)+(o.type==='cadCircle'?360:o.sweep)*t);}
 function parameter(o,p){if(o.a)return G.parameter(o,p);const a=Math.atan2(p.y-o.center.y,p.x-o.center.x)*180/Math.PI,s=o.type==='cadCircle'?360:o.sweep;return(((s>=0?a-(o.startAngle||0):(o.startAngle||0)-a)%360+360)%360)/Math.abs(s);}
 function matches(o,points,mode,{geometry=G.create()}={}){
  if(points.length<(mode==='F'?2:3))return false;const polygon=mode!=='F',edges=points.slice(0,points.length-(polygon?0:1)).map((a,i)=>line(a,points[(i+1)%points.length]));
  const pieces=primitives(o,geometry);if(!pieces.length)return false;let anyInside=false,anyOutside=false,touched=false;
  for(const q of pieces){const hits=edges.flatMap(e=>geometry.intersections(q,e));if(hits.length)touched=true;if(!polygon&&(hits.length||q.point&&edges.some(e=>G.projectNearest(e,q.point)?.distance<1e-7)||q.a&&q.b&&edges.some(e=>[q.a,q.b].some(p=>G.projectNearest(e,p)?.distance<1e-7)||[e.a,e.b].some(p=>G.projectNearest(q,p)?.distance<1e-7))))return true;
   if(!polygon)continue;if(q.point){if(inside(q.point,points))anyInside=true;else anyOutside=true;continue;}
   if(q.a&&q.b||['cadCircle','cadArc'].includes(q.type)){if(q.mode==='line'||q.mode==='ray'){if(mode==='WP')return false;continue;}const cuts=[0,...hits.map(p=>parameter(q,p)).filter(t=>t>1e-9&&t<1-1e-9),1].sort((a,b)=>a-b);for(let i=1;i<cuts.length;i++){if(cuts[i]-cuts[i-1]<1e-10)continue;const p=curvePoint(q,(cuts[i]+cuts[i-1])/2);if(inside(p,points))anyInside=true;else anyOutside=true;}for(const t of [0,1])if(inside(curvePoint(q,t),points))anyInside=true;}
   else{const b=geometry.bounds(q);if(!b){anyOutside=true;continue;}const p=[{x:b.minx,y:b.miny},{x:b.maxx,y:b.miny},{x:b.maxx,y:b.maxy},{x:b.minx,y:b.maxy}];if(p.every(x=>inside(x,points)))anyInside=true;else anyOutside=true;}
  }
  if(mode==='F')return false;if(mode==='WP')return anyInside&&!anyOutside;
  return touched||anyInside||(['cadHatch','cadText'].includes(o.type)&&points.some(p=>geometry.hitDistance(o,p)===0));
 }
 root.cadSelectionShapes=Object.freeze({inside,simple,matches});
})();
