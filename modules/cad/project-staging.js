/* Validation only: preserves PPRJ/legacy/Plan meanings; no live-state mutation. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const supportedTypes=new Set(['cadLine','cadCircle','cadArc','cadText','cadPolyline','cadDimension','cadHatch','line','wall','door','window','dimension','space','stair','component']);
  function validate(raw){
    const bad=why=>{throw new Error('invalid-project:'+why);};
    if(raw?.format!=='PieniPlan'||!raw.drawing||typeof raw.drawing!=='object'||Array.isArray(raw.drawing))bad('drawing');
    if(raw.schemaVersion!=null&&(!Number.isInteger(raw.schemaVersion)||raw.schemaVersion<1||raw.schemaVersion>6))bad('unsupported-schema');
    const caps=raw.requiredCapabilities??[];
    if(!Array.isArray(caps)||caps.some(c=>![root.cadPolyline?.capability,'cad.annotation.v1'].includes(c)))bad('unsupported-capability');
    const d=raw.drawing,vertexIds=new Set(),edgeIds=new Set();
    for(const key of ['objects','references','drawingRegions','floors','sheets','cadLayerDefinitions','cadLayerVisibility','cadRegionLayerVisibility','planLayerVisibility','recognitionHistory'])if(d[key]!=null&&!Array.isArray(d[key]))bad(key);
    const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
    for(const key of ['objects','references','drawingRegions','floors']){
      const ids=new Set();for(const o of d[key]||[]){if(!o||typeof o!=='object'||Array.isArray(o))bad(key+'-record');if(o.id){if(ids.has(o.id))bad('duplicate-'+key+'-id');ids.add(o.id);}}
    }
    for(const o of d.objects||[]){
      if(!supportedTypes.has(o.type))bad('unsupported-object-type:'+String(o.type));
      if(o.type==='cadPolyline'){
        if((raw.schemaVersion??1)<5||!caps.includes(root.cadPolyline?.capability))bad('polyline-capability-required');
        root.cadPolyline.validate(o);
        for(const v of o.vertices){if(vertexIds.has(v.id))bad('duplicate-vertex-id');vertexIds.add(v.id);if(v.outgoing){if(edgeIds.has(v.outgoing.id))bad('duplicate-edge-id');edgeIds.add(v.outgoing.id);}}
      }
      for(const key of ['constraints','attachments'])if(o[key]!=null&&(typeof o[key]!=='object'||Array.isArray(o[key])))bad(key);
      for(const k of ['a','b','center','point','p1','p2','seed'])if(o[k]!=null&&!point(o[k]))bad('point');
      if(o.polygon!=null&&(!Array.isArray(o.polygon)||!o.polygon.every(point)))bad('polygon');
      if(['cadLine','line','wall'].includes(o.type)&&(!point(o.a)||!point(o.b)))bad('line');
      if(['cadCircle','cadArc'].includes(o.type)&&(!point(o.center)||!Number.isFinite(o.radius)||o.radius<=0))bad('circle');
      if(o.type==='cadArc'&&(!Number.isFinite(o.startAngle)||!Number.isFinite(o.sweep)))bad('arc');
      if(o.type==='cadText'&&!point(o.point))bad('text');
      if(o.type==='cadDimension'&&(!point(o.p1)||!point(o.p2)||!Number.isFinite(o.offset)))bad('cad-dimension');
      if(o.type==='cadHatch'&&(!Array.isArray(o.points)||o.points.length<3||!o.points.every(point)))bad('cad-hatch');
      if(o.type==='component'){
        if(!point(o.point)||typeof o.assetId!=='string'||!o.assetId.trim())bad('component');
        for(const k of ['rotation','scaleX','scaleY'])if(o[k]!=null&&!Number.isFinite(o[k]))bad('component-transform');
      }
    }
    for(const r of d.references||[]){
      if(!['image','dxf','linkedCadRegion'].includes(r.type))bad('reference-type');
      if(r.origin!=null&&!point(r.origin))bad('reference-origin');
      if(r.scale!=null&&(!Number.isFinite(r.scale)||r.scale<=0))bad('reference-scale');
      if(r.type==='dxf'&&r.entities!=null&&!Array.isArray(r.entities))bad('reference-entities');
    }
    for(const key of ['cadLayerVisibility','cadRegionLayerVisibility','planLayerVisibility'])for(const pair of d[key]||[])if(!Array.isArray(pair)||pair.length!==2)bad(key);
    if(d.camera&&(!Number.isFinite(d.camera.cx)||!Number.isFinite(d.camera.cy)||!Number.isFinite(d.camera.zoom)||d.camera.zoom<=0))bad('camera');
    return raw;
  }
  root.projectStaging=Object.freeze({validate});
})();
