/* Explicit association edits. Existing saved anchors are never migrated on read. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},clone=o=>JSON.parse(JSON.stringify(o)),finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 function slots(o){if(o?.type!=='cadDimension')return[];return o.kind==='arcLength'?['arc']:o.kind==='ordinate'?['feature']:['linear','aligned'].includes(o.kind||'aligned')?['p1','p2']:o.kind==='angular'?['vertex','ray1','ray2']:['radius','diameter'].includes(o.kind)?['radial']:[];}
 function linked(o,slot,byId){const a=o.association?.anchors?.[slot];return Boolean(a&&(o.association.version===2||o.association.status==='current')&&M.cadDimensionAssociation.resolve(a,byId));}
 function assign(q,anchors,lost={}){delete q.association;const r=M.cadDimensionPartial.relation(q,anchors,lost);if(r)q.association=r;return q;}
 function prepare(o,byId){const q=clone(o),anchors={},lost=clone(o.association?.lost||{});for(const [slot,a]of Object.entries(o.association?.anchors||{}))if(linked(o,slot,byId))anchors[slot]=clone(a);else lost[slot]=clone(a);return assign(q,anchors,lost);}
 function finish(q,byId){for(const [slot,a]of Object.entries(q.association?.anchors||{})){const value=M.cadDimensionAssociation.resolve(a,byId);if(!value)throw Error('invalid-dimension-anchor');if(slot==='arc')Object.assign(q,value.arc);else if(slot==='radial')Object.assign(q,value);else q[slot]=value.point;}const g=M.cadAnnotation2.geometry(q);if(!g?.segments?.length)throw Error('no-valid-result');q.segments=g.segments;delete q.dxfPresentation;if(q.association)q=M.cadDimensionAssociation.regenerate(q,byId);M.cadDimensionAssociation.validate(q);return q;}
 function edit(o,slot,point,anchor,byId){if(!slots(o).includes(slot))throw Error('unsupported-dimension');const q=prepare(o,byId),anchors=q.association?.anchors||{},lost=q.association?.lost||{};delete anchors[slot];delete lost[slot];
  if(slot==='arc'){const value=anchor?.kind==='arc96'&&M.cadDimensionAssociation.resolve(anchor,byId);if(!value?.arc)throw Error('unsupported-geometry');Object.assign(q,value.arc);}
  else if(slot==='radial'){const value=anchor?.kind==='radial'&&M.cadDimensionAssociation.resolve(anchor,byId);if(!value)throw Error('unsupported-geometry');Object.assign(q,value);}
  else{if(!finite(point))throw Error('invalid-coordinate');q[slot]={x:point.x,y:point.y};}
  if(anchor)anchors[slot]=clone(anchor);assign(q,anchors,lost);return finish(q,byId);
 }
 function disassociate(o){const q=clone(o);delete q.association;return q;}
 function source(o,source,pick,byId){if(!source||source.readonly||source.floorId||source.planRole)throw Error('unsupported-geometry');
  if(o.kind==='arcLength'){const a=M.cadArcLength.anchor(source,pick);if(!a)throw Error('unsupported-geometry');return edit(o,'arc',null,a,byId);}
  if(['radius','diameter'].includes(o.kind))return edit(o,'radial',null,{kind:'radial',sourceId:source.id},byId);
  if(o.kind==='angular'){if(!['cadCircle','cadArc'].includes(source.type))throw Error('unsupported-geometry');return edit(o,'vertex',source.center,{kind:'point',sourceId:source.id,key:'center'},byId);}
  if(!['linear','aligned'].includes(o.kind||'aligned'))throw Error('unsupported-dimension');let ends;
  if(source.type==='cadLine')ends=[source.a,source.b];
  else if(source.type==='cadArc')ends=[M.geometryQuery.pointAt(source,source.startAngle),M.geometryQuery.pointAt(source,source.startAngle+source.sweep)];
  else if(M.cadEllipse.is(source)&&!M.cadEllipse.full(source))ends=[M.cadEllipse.at(source,0),M.cadEllipse.at(source,1)];
  else if(M.cadPolyline.is(source)){
   const edges=M.cadPolyline.get(source).edges,ranked=edges.map(e=>({e,d:M.geometryQuery.projectNearest(e,pick)?.distance??Infinity})).sort((a,b)=>a.d-b.d);if(!ranked.length||ranked[1]&&Math.abs(ranked[0].d-ranked[1].d)<1e-7)throw Error('ambiguous-dimension-edge');const e=ranked[0].e,at=t=>M.cadBezier.is(e)?M.cadBezier.at(e,t):e.a?{...(t?e.b:e.a)}:M.geometryQuery.pointAt(e,e.startAngle+e.sweep*t);ends=[at(0),at(1)];
   const q=prepare(o,byId),anchors=q.association?.anchors||{};for(let i=0;i<2;i++){const a=M.cadDimensionAssociation.capture(ends[i],{objectId:source.id,kind:'endpoint',edgeId:e.edgeId,...(!source.curveFit?{vertexId:i?e.toVertexId:e.fromVertexId}:{})},byId);if(!a)throw Error('invalid-dimension-anchor');q['p'+(i+1)]={...ends[i]};anchors['p'+(i+1)]=a;}assign(q,anchors);return finish(q,byId);
  }else throw Error('unsupported-geometry');
  const q=prepare(o,byId),anchors=q.association?.anchors||{};for(let i=0;i<2;i++){q['p'+(i+1)]={...ends[i]};const a=M.cadDimensionAssociation.capture(ends[i],{objectId:source.id,kind:'endpoint'},byId);if(!a)throw Error('invalid-dimension-anchor');anchors['p'+(i+1)]=a;}assign(q,anchors);return finish(q,byId);
 }
 M.cadDimensionManagement=Object.freeze({slots,linked,edit,source,disassociate});
})();
