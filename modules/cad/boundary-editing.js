/* Virtual cutting edges are query operands, never persistent replacements. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function supports(o){if(root.cadBlocks?.is(o))return root.cadBlocks.expand(o).flatMap(supports);if(root.cadPolylineWidth?.isAffine(o))return root.cadPolylineWidth.affineEdges(o).flatMap(supports);if(root.cadPolyline?.is(o))return root.cadPolyline.get(o).edges.flatMap(supports);if(root.cadHatchCurves?.is(o))return root.cadHatchCurves.loops(o).flat().flatMap(supports);if(o.type==='cadLine'||o.type==='cadRay'||o.type==='cadXline')return[{...o,mode:'line'}];if(o.type==='cadArc')return[{...o,type:'cadCircle'}];if(root.cadEllipse?.is(o))return[{...o,startParam:0,sweepParam:Math.PI*2}];return[o];}
 function fenceHits(objects,points,geometry=root.geometryQuery.create()){const edges=points.slice(1).map((p,i)=>({type:'cadLine',a:points[i],b:p})),out=[];for(const o of objects){const hits=edges.flatMap(e=>geometry.intersections(o,e));if(!hits.length)continue;out.push({object:o,point:{x:hits[0].x,y:hits[0].y},intersections:hits.length});}return out;}
 root.cadBoundaryEditing=Object.freeze({supports,fenceHits});
})();
