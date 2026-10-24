/* Virtual cutting edges are query operands, never persistent replacements. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function supports(o){if(root.cadBlocks?.is(o))return root.cadBlocks.expand(o).flatMap(supports);if(root.cadPolylineWidth?.isAffine(o))return root.cadPolylineWidth.affineEdges(o).flatMap(supports);if(root.cadPolyline?.is(o))return root.cadPolyline.get(o).edges.flatMap(supports);if(root.cadHatchCurves?.is(o))return root.cadHatchCurves.loops(o).flat().flatMap(supports);if(o.type==='cadLine'||o.type==='cadRay'||o.type==='cadXline')return[{...o,mode:'line'}];if(o.type==='cadArc')return[{...o,type:'cadCircle'}];if(root.cadEllipse?.is(o))return[{...o,startParam:0,sweepParam:Math.PI*2}];return[o];}
 function fenceHits(objects,points,geometry=root.geometryQuery.create()){const edges=points.slice(1).map((p,i)=>({type:'cadLine',a:points[i],b:p})),out=[];for(const o of objects){const hits=[];for(const edge of edges){const found=geometry.intersections(o,edge).sort((p,q)=>root.geometryQuery.parameter(edge,p)-root.geometryQuery.parameter(edge,q));for(const p of found)if(!hits.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<1e-7))hits.push({x:p.x,y:p.y});}if(!hits.length)continue;out.push({object:o,point:hits[0],points:hits,intersections:hits.length});}return out;}
 function modify(mode,target,points,cutters,{single=false}={}){
  let fragments=[target],changed=0,serial=0;const removed=[];
  for(const point of points){const index=fragments.findIndex(o=>root.geometryQuery.projectNearest(o,point)?.distance<=1e-6);if(index<0)continue;const source=fragments[index];
   const plan=source.type==='cadLine'?root.cadModifyGeometry.plan(mode,source,point,cutters):root.cadPolyline.is(source)?mode==='trim'?root.cadPolyline.trimAt(source,point,cutters):root.cadPolyline.extendTerminal(source,point,cutters):root.cadCurveOperations[mode](source,point,cutters);
   if(!plan)continue;changed++;removed.push(...(plan.removed||[]));const after=plan.after.map((o,i)=>({...o,id:i===0?source.id:'__boundary_new_owner_'+serial+++'__'}));fragments.splice(index,1,...after);if(single||mode==='extend')break;
  }
  return changed?{kind:mode,before:[target],after:fragments,removed,topology:root.cadPolyline.is(target)?'cadPolyline':undefined,intervals:changed}:null;
 }
 root.cadBoundaryEditing=Object.freeze({supports,fenceHits,modify});
})();
