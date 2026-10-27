/* Crossing masks are transient queries. Owners, fitted metadata and block
 * definitions stay canonical; an invalid touched owner rejects the whole plan. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),copy=o=>JSON.parse(JSON.stringify(o));
 function polygon(r){if(Array.isArray(r))return r.map(p=>({...p}));if(!r||![r.minx,r.miny,r.maxx,r.maxy].every(Number.isFinite))return null;return[{x:r.minx,y:r.miny},{x:r.maxx,y:r.miny},{x:r.maxx,y:r.maxy},{x:r.minx,y:r.maxy}];}
 function controls(o){const hs=M.cadGrips.handles(o);if(M.cadPolyline.is(o))return hs.filter(h=>h.kind==='vertex');if(['cadLine','cadXline','cadRay'].includes(o.type))return hs.filter(h=>h.key==='a'||h.key==='b');if(o.type==='cadArc')return hs.filter(h=>h.kind==='arcEndpoint');if(o.type==='cadDimension')return hs.filter(h=>['dimensionAnchor','dimensionCenter','dimensionLabel','dimensionDatum','arcDimensionLocation','arcDimensionStart','arcDimensionEnd'].includes(h.kind));if(o.type==='cadLeader')return hs.filter(h=>h.kind==='leaderVertex');if(o.type==='cadHatch'){const boundary=hs.filter(h=>h.kind==='hatchBoundary'&&(/^(v:\d+|center|joint:\d+|control:\d+:\d+|ellipse:\d+:center)$/.test(h.nestedKey)));return boundary.length?boundary:hs.filter(h=>h.key==='hatchControl');}return hs.filter(h=>h.kind==='move');}
 function candidates(objects,region,{geometry=M.geometryQuery.create(),crossing=true}={}){const ps=polygon(region);if(!ps||!M.cadSelectionShapes.simple(ps))return[];return objects.filter(o=>M.cadSelectionShapes.matches(o,ps,crossing?'CP':'WP',{geometry})).map(o=>o.id);}
 function plan(objects,selection,delta){if(!finite(delta)||Math.hypot(delta.x,delta.y)<1e-12)return null;const whole=new Set(selection?.wholeIds||[]),regions=selection?.regions||[{points:polygon(selection),ids:objects.map(o=>o.id)}],matrix=M.cadTransformOperations.translate(delta.x,delta.y),before=[],after=[];
  for(const o of objects){let q=null;const masks=regions.filter(r=>r.ids.includes(o.id)).map(r=>polygon(r.points)).filter(Boolean),inside=p=>masks.some(ps=>M.cadSelectionShapes.inside(p,ps));
   if(whole.has(o.id))q=M.cadTransformOperations.transform(copy(o),matrix);
   else{if(!masks.length)continue;const hs=controls(o),hot=hs.filter(h=>inside(h.point));if(!hot.length)continue;
    if(hot.length===hs.length&&!(o.type==='cadHatch'&&o.boundaryCurves?.some(b=>b.type==='cadBoundaryLoop'))||hot.some(h=>h.kind==='move'))q=M.cadTransformOperations.transform(copy(o),matrix);
    else{const base=hot[0].point,target={x:base.x+delta.x,y:base.y+delta.y};q=M.cadGrips.plan([o],hot,{base,target})?.after[0];}
   }
   if(!q)return null;before.push(o);after.push(q);
  }
  return after.length?{kind:'STRETCH',before,after,copy:false,delta:{...delta}}:null;
 }
 M.cadStretch=Object.freeze({polygon,controls,candidates,plan});
})();
