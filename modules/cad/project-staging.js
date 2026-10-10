/* Validation only: preserves PPRJ/legacy/Plan meanings; no live-state mutation. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const supportedTypes=new Set(['cadLine','cadCircle','cadArc','cadText','cadPolyline','cadDimension','cadHatch','cadLeader','line','wall','door','window','dimension','space','stair','component']);
  function validate(raw){
    const bad=why=>{throw new Error('invalid-project:'+why);};
    if(raw?.format!=='PieniPlan'||!raw.drawing||typeof raw.drawing!=='object'||Array.isArray(raw.drawing))bad('drawing');
    if(raw.schemaVersion!=null&&(!Number.isInteger(raw.schemaVersion)||raw.schemaVersion<1||raw.schemaVersion>7))bad('unsupported-schema');
    const caps=raw.requiredCapabilities??[],allowedCaps=new Set([root.cadPolyline?.capability,'cad.annotation.v1','cad.annotation.v2','reference.pdf.v1'].filter(Boolean));
    if(!Array.isArray(caps)||caps.some(c=>!allowedCaps.has(c)))bad('unsupported-capability');
    const d=raw.drawing,vertexIds=new Set(),edgeIds=new Set(),annotationV2=(raw.schemaVersion??1)>=7&&caps.includes('cad.annotation.v2');
    for(const key of ['objects','references','drawingRegions','floors','sheets','cadLayerDefinitions','cadLayerVisibility','cadRegionLayerVisibility','planLayerVisibility','recognitionHistory'])if(d[key]!=null&&!Array.isArray(d[key]))bad(key);
    const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
    for(const key of ['objects','references','drawingRegions','floors']){
      const ids=new Set();for(const o of d[key]||[]){if(!o||typeof o!=='object'||Array.isArray(o))bad(key+'-record');if(o.id){if(ids.has(o.id))bad('duplicate-'+key+'-id');ids.add(o.id);}}
    }
    for(const f of d.floors||[])if(f.viewAlignment!=null&&(!root.floorAlignment?.valid(f.viewAlignment)||f.viewAlignment.referenceFloorId&&!((d.floors||[]).some(r=>r.id===f.viewAlignment.referenceFloorId&&r.id!==f.id&&r.buildingId===f.buildingId))))bad('floor-view-alignment');
    for(const sheet of d.sheets||[]){if(sheet.range!=null){try{if(!root.sheetLayout)bad('sheet-layout-unavailable');root.sheetLayout.layout(sheet.range,sheet);}catch{bad('sheet-layout');}}}
    for(const o of d.objects||[]){
      if(!supportedTypes.has(o.type))bad('unsupported-object-type:'+String(o.type));
      if(o.type==='cadPolyline'){
        if((raw.schemaVersion??1)<5||!caps.includes(root.cadPolyline?.capability))bad('polyline-capability-required');
        root.cadPolyline.validate(o);
        for(const v of o.vertices){if(vertexIds.has(v.id))bad('duplicate-vertex-id');vertexIds.add(v.id);if(v.outgoing){if(edgeIds.has(v.outgoing.id))bad('duplicate-edge-id');edgeIds.add(v.outgoing.id);}}
      }
      for(const key of ['constraints','attachments'])if(o[key]!=null&&(typeof o[key]!=='object'||Array.isArray(o[key])))bad(key);
      for(const k of ['a','b','center','point','p1','p2','seed','labelPoint','vertex','ray1','ray2','leaderAnchor'])if(o[k]!=null&&!point(o[k]))bad('point');
      if(o.polygon!=null&&(!Array.isArray(o.polygon)||!o.polygon.every(point)))bad('polygon');
      if(['cadLine','line','wall'].includes(o.type)&&(!point(o.a)||!point(o.b)))bad('line');
      if(['cadCircle','cadArc'].includes(o.type)&&(!point(o.center)||!Number.isFinite(o.radius)||o.radius<=0))bad('circle');
      if(o.type==='cadArc'&&(!Number.isFinite(o.startAngle)||!Number.isFinite(o.sweep)))bad('arc');
      if(o.type==='cadText'){if(o.alignment!=null&&!['left','center','right'].includes(o.alignment))bad('text-alignment');if(!point(o.point)||typeof o.text!=='string')bad('text');if(o.width!=null&&(!Number.isFinite(o.width)||o.width<0))bad('text-width');if((o.mtext===true||o.text.includes('\n'))&&!annotationV2)bad('annotation-v2-capability-required');}
      if(o.type==='cadDimension'){
        const kind=o.kind||'aligned';
        if(kind==='aligned'){if(!point(o.p1)||!point(o.p2)||!Number.isFinite(o.offset))bad('cad-dimension');}
        else if(kind==='radius'||kind==='diameter'){if(!annotationV2)bad('annotation-v2-capability-required');if(!point(o.center)||!Number.isFinite(o.radius)||o.radius<=0||!point(o.labelPoint))bad('cad-radial-dimension');}
        else if(kind==='angular'){if(!annotationV2)bad('annotation-v2-capability-required');if(!point(o.vertex)||!point(o.ray1)||!point(o.ray2)||!Number.isFinite(o.radius)||o.radius<=0)bad('cad-angular-dimension');}
        else bad('cad-dimension-kind');
        if(!Array.isArray(o.segments)||!o.segments.every(seg=>point(seg?.a)&&point(seg?.b)))bad('cad-dimension-segments');
      }
      if(o.type==='cadHatch'){if(!Array.isArray(o.points)||o.points.length<3||!o.points.every(point))bad('cad-hatch');if(o.angle!=null&&!Number.isFinite(o.angle))bad('cad-hatch-angle');}
      if(o.type==='cadLeader'){if(!annotationV2)bad('annotation-v2-capability-required');if(!Array.isArray(o.points)||o.points.length<2||!o.points.every(point)||typeof o.text!=='string')bad('cad-leader');if(o.height!=null&&(!Number.isFinite(o.height)||o.height<=0))bad('cad-leader-height');if(o.width!=null&&(!Number.isFinite(o.width)||o.width<0))bad('cad-leader-width');}
      if(o.type==='stair'&&o.upDirection!=null){if(![1,-1].includes(o.upDirection)||!Number.isInteger(o.treadCount)||o.treadCount<2||o.treadCount>256||!o.polygon||o.polygon.length!==4||!root.planStair?.frame(o))bad('stair-properties');}
      if(o.type==='component'){
        if(!point(o.point)||typeof o.assetId!=='string'||!o.assetId.trim())bad('component');
        for(const k of ['rotation','scaleX','scaleY'])if(o[k]!=null&&!Number.isFinite(o[k]))bad('component-transform');
      }
    }
    for(const r of d.references||[]){
      if(!['image','dxf','pdf','linkedCadRegion'].includes(r.type))bad('reference-type');
      if(r.origin!=null&&!point(r.origin))bad('reference-origin');
      if(r.scale!=null&&(!Number.isFinite(r.scale)||r.scale<=0))bad('reference-scale');
      if(r.clip!=null&&(!Number.isFinite(r.clip.minx)||!Number.isFinite(r.clip.miny)||!Number.isFinite(r.clip.maxx)||!Number.isFinite(r.clip.maxy)||r.clip.minx>=r.clip.maxx||r.clip.miny>=r.clip.maxy))bad('reference-clip');
      if(r.type==='dxf'&&r.entities!=null&&!Array.isArray(r.entities))bad('reference-entities');
      if(r.type==='pdf'){if((raw.schemaVersion??1)<7||!caps.includes('reference.pdf.v1'))bad('pdf-reference-capability-required');if(typeof r.dataUrl!=='string'||!r.dataUrl.startsWith('data:application/pdf'))bad('reference-pdf');if(!Number.isFinite(r.width)||r.width<=0||!Number.isFinite(r.height)||r.height<=0)bad('reference-pdf-size');}
    }
    for(const key of ['cadLayerVisibility','cadRegionLayerVisibility','planLayerVisibility'])for(const pair of d[key]||[])if(!Array.isArray(pair)||pair.length!==2)bad(key);
    if(d.camera&&(!Number.isFinite(d.camera.cx)||!Number.isFinite(d.camera.cy)||!Number.isFinite(d.camera.zoom)||d.camera.zoom<=0))bad('camera');
    return raw;
  }
  root.projectStaging=Object.freeze({validate});
})();
