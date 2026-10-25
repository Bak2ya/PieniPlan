/* Validation only: preserves PPRJ/legacy/Plan meanings; no live-state mutation. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const supportedTypes=new Set(['cadEllipse','cadDxfRecord','cadPoint','cadInsert','cadXline','cadRay','cadLine','cadCircle','cadArc','cadText','cadPolyline','cadDimension','cadHatch','cadLeader','line','wall','door','window','dimension','space','stair','component']);
  function validate(raw){
    const bad=why=>{throw new Error('invalid-project:'+why);};
    if(raw?.format!=='PieniPlan'||!raw.drawing||typeof raw.drawing!=='object'||Array.isArray(raw.drawing))bad('drawing');
    if(raw.schemaVersion!=null&&(!Number.isInteger(raw.schemaVersion)||raw.schemaVersion<1||raw.schemaVersion>7))bad('unsupported-schema');
    const caps=raw.requiredCapabilities??[],allowedCaps=new Set(['plan.components.v2','plan.door.mechanism.v1','cad.layer.freeze.v1','cad.hatch.pattern.v1','cad.layerFilter.tree.v1','cad.stroke.v1','cad.polyline.closed2.v1',root.planDrawings?.capability,root.planNature?.capability,root.cadPolyline?.capability,root.cadPolylineFit?.capability,root.cadHatchCurves?.capability,root.cadHatchCurves?.multiSplineCapability,root.cadDimensionAssociation?.capability,root.cadPolylineWidth?.capability,root.cadEllipse?.capability,root.cadTextStyles?.capability,root.cadTextStyles?.overrideCapability,'cad.annotation.v1','cad.annotation.v2','reference.pdf.v1','cad.block.v1','cad.construction.v1','cad.dxf.roundtrip.v1','cad.dimstyle.v1','sheet.architectural.v1','building.structure.v1','plan.recognition.review.v1'].filter(Boolean));
    if(!Array.isArray(caps)||caps.some(c=>!allowedCaps.has(c)))bad('unsupported-capability');
    const d=raw.drawing;if(((d.cadLayerDefinitions||[]).some(l=>l.frozen===true)||(d.toolSettings?.cadLayerFilters92||[]).some(f=>(f.rows||[]).some(r=>r.frozen!=null)))&&!caps.includes('cad.layer.freeze.v1'))bad('layer-freeze-capability');for(const l of d.cadLayerDefinitions||[])if(l.frozen!=null&&typeof l.frozen!=='boolean')bad('layer-freeze-value');if(d.toolSettings?.cadLayerFilters92){root.cadPropertyWorkflows?.validateFilters(d.toolSettings.cadLayerFilters92);if(d.toolSettings.cadLayerFilters92.some(f=>f.parentId)&&!caps.includes('cad.layerFilter.tree.v1'))bad('layer-filter-tree-capability');}if(d.toolSettings?.cadLinetypeScale93!=null&&(!root.cadStroke?.positive(d.toolSettings.cadLinetypeScale93)||!caps.includes('cad.stroke.v1')))bad('stroke-scale-capability');if(d.toolSettings?.cadPlinegen93!=null&&![0,1].includes(d.toolSettings.cadPlinegen93))bad('plinegen-setting');root.planNature?.validateStyles(d.toolSettings?.planObjectStyles);if(Object.keys(d.toolSettings?.planObjectStyles||{}).length&&!caps.includes(root.planNature?.capability))bad('plan-style-capability');const vertexIds=new Set(),edgeIds=new Set(),annotationV2=(raw.schemaVersion??1)>=7&&caps.includes('cad.annotation.v2');
    for(const key of ['objects','references','drawingRegions','floors','sheets','cadLayerDefinitions','cadLayerVisibility','cadRegionLayerVisibility','planLayerVisibility','recognitionHistory','blockDefinitions','dimensionStyles','textStyles'])if(d[key]!=null&&!Array.isArray(d[key]))bad(key);
    if(d.drawingModel!=null){if(!caps.includes(root.planDrawings?.capability)||!root.planDrawings)bad('drawing-model-capability');root.planDrawings.validate({buildings:d.buildings||[],floors:d.floors||[],objects:d.objects||[],drawingModel:d.drawingModel});}else if((d.floors||[]).some(f=>f.baseDrawingId))bad('drawing-model-required');
    for(const o of d.objects||[])if(o.recognitionExactBaseline!=null&&(!caps.includes('plan.recognition.review.v1')||typeof o.recognitionExactBaseline!=='string'||o.recognitionExactBaseline.length>100000))bad('recognition-review-capability');
    const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
    for(const key of ['objects','references','drawingRegions','floors','sheets']){
      const ids=new Set();for(const o of d[key]||[]){if(!o||typeof o!=='object'||Array.isArray(o))bad(key+'-record');if(o.id){if(ids.has(o.id))bad('duplicate-'+key+'-id');ids.add(o.id);}}
    }
    if(d.buildings!=null&&!Array.isArray(d.buildings))bad('buildings');for(const b of d.buildings||[])if(b.structuralReferences!=null){if(b.structuralReferences?.length&&!caps.includes('building.structure.v1'))bad('structure-capability-required');try{root.structuralAlignment.validateReferences(b.structuralReferences);for(const r of b.structuralReferences)for(const binding of r.bindings){const floor=(d.floors||[]).find(f=>f.id===binding.floorId);if(floor&&floor.buildingId!==b.id)bad('common-reference-building');}}catch{bad('common-structure-reference');}}
    for(const f of d.floors||[])if(f.viewAlignment!=null&&(!root.floorAlignment?.valid(f.viewAlignment)||f.viewAlignment.referenceFloorId&&!((d.floors||[]).some(r=>r.id===f.viewAlignment.referenceFloorId&&r.id!==f.id&&r.buildingId===f.buildingId))))bad('floor-view-alignment');
    for(const sheet of d.sheets||[]){if(sheet.titleBlock||sheet.drawingNumber!=null||sheet.revision!=null){if(!caps.includes('sheet.architectural.v1'))bad('sheet-capability-required');root.architecturalSheet.validate(sheet,d.blockDefinitions||[]);}if(sheet.range!=null){try{if(!root.sheetLayout)bad('sheet-layout-unavailable');root.sheetLayout.layout(sheet.range,sheet);}catch{bad('sheet-layout');}}}
    if(d.textStyles?.length){if(!caps.includes(root.cadTextStyles?.capability))bad('text-style-capability-required');root.cadTextStyles.validate(d.textStyles);}
    const definitions=d.blockDefinitions||[],styles=d.dimensionStyles||[];
    if(styles.length){if(!caps.includes('cad.dimstyle.v1'))bad('dimstyle-capability-required');root.cadDimensionStyles.validate(styles);}
    if(d.dxfArchive!=null){if(!caps.includes('cad.dxf.roundtrip.v1')||typeof d.dxfArchive!=='object'||!Array.isArray(d.dxfArchive.sections)||!Number.isFinite(d.dxfArchive.unitFactor)||d.dxfArchive.unitFactor<=0)bad('dxf-archive');}

    if(!raw.__blockMembers&&(definitions.length||(d.objects||[]).some(o=>o.type==='cadInsert'))){if(!caps.includes('cad.block.v1'))bad('block-capability-required');root.cadBlocks.validate(definitions,d.objects||[]);}
    if(!raw.__blockMembers)for(const definition of definitions)validate({...raw,drawing:{objects:definition.objects,blockDefinitions:definitions,dimensionStyles:styles},__blockMembers:true});
    for(const o of d.objects||[]){
      if(o.doorModel93){if(!caps.includes('plan.door.mechanism.v1')||!root.doorMechanisms)bad('door-mechanism-capability');root.doorMechanisms.validate(o);if(!Number.isFinite(o.width)||o.width<=0||!Number.isFinite(o.t)||o.t<0||o.t>1||typeof o.wallId!=='string')bad('door-mechanism-placement');const wall=(d.objects||[]).find(w=>w.id===o.wallId);if(wall&&(wall.geometry==='arc'||wall.center||!wall.a||!wall.b||o.width>Math.hypot(wall.b.x-wall.a.x,wall.b.y-wall.a.y)))bad('door-mechanism-host');}
      if(['folding','pocketDouble','bypass'].includes(o.doorType)&&!o.doorModel93)bad('door-mechanism-required');
      if(o.assetVersion===2&&!o.componentDefinition)bad('component-definition-required');
      if(o.componentDefinition){if(!caps.includes('plan.components.v2')||!root.componentLibrary||o.type!=='component'||o.assetId!==o.componentDefinition.id||o.assetVersion!==2)bad('component-definition-capability');root.componentLibrary.validateDefinition(o.componentDefinition);}
      if(o.patternSource93!=null){if(o.patternSource93==='dxf'&&!caps.includes('cad.hatch.pattern.v1'))bad('hatch-pattern-capability');if(!root.cadHatchPatterns)bad('hatch-pattern-engine');root.cadHatchPatterns.validate(o,{budget:false});}
      if(Object.hasOwn(o,'linetypeScale')||Object.hasOwn(o,'linetypeGeneration')){if(!caps.includes('cad.stroke.v1')||!root.cadStroke)bad('stroke-capability-required');root.cadStroke.validate(o);}
      if(o.planGeometry||o.planNature){if(!caps.includes(root.planNature?.capability)||!root.planNature)bad('plan-nature-capability');root.planNature.validateObject(o);}
      if(raw.__blockMembers&&(!o.type.startsWith('cad')||o.planRole||o.floorId))bad('non-cad-block-member');
      if(o.type==='cadEllipse'){if(!caps.includes(root.cadEllipse?.capability))bad('ellipse-capability-required');root.cadEllipse.validate(o);}
      if(o.type==='cadPoint'&&(!caps.includes('cad.dxf.roundtrip.v1')||!point(o.point)))bad('cad-point');
      if(o.type==='cadDxfRecord'){if(!caps.includes('cad.dxf.roundtrip.v1')||o.readonly!==true||typeof o.recordType!=='string'||!Array.isArray(o.rawGroups)||!o.rawGroups.length||!o.rawGroups.every(p=>Array.isArray(p)&&p.length===2&&Number.isInteger(p[0])&&p[0]>=0&&p[0]<=1071&&typeof p[1]==='string')||!Array.isArray(o.preview))bad('preserved-dxf-record');for(const q of o.preview)if(!q.type?.startsWith('cad')||q.type==='cadInsert'||q.type==='cadDxfRecord')bad('preserved-preview-type');validate({...raw,drawing:{objects:o.preview,dimensionStyles:styles},__blockMembers:true});}
      if(o.type==='cadInsert'&&!root.cadBlocks.matrixValid(o.matrix))bad('block-transform');
      if(['cadXline','cadRay'].includes(o.type)&&(!caps.includes('cad.construction.v1')||!point(o.a)||!point(o.b)||Math.hypot(o.b.x-o.a.x,o.b.y-o.a.y)<1e-9||o.mode!==(o.type==='cadXline'?'line':'ray')))bad('construction-line');
      if(!supportedTypes.has(o.type))bad('unsupported-object-type:'+String(o.type));
      if(o.type==='cadPolyline'){
        if((raw.schemaVersion??1)<5||!caps.includes(root.cadPolyline?.capability))bad('polyline-capability-required');
        root.cadPolyline.validate(o);if(o.closed&&o.vertices.length===2&&!caps.includes('cad.polyline.closed2.v1'))bad('closed2-capability-required');if(o.curveFit){if(!caps.includes(root.cadPolylineFit?.capability))bad('polyline-fit-capability-required');root.cadPolyline.get(o);}if(o.vertices.some(v=>v.outgoing&&(Object.hasOwn(v.outgoing,'startWidth')||Object.hasOwn(v.outgoing,'endWidth')))&&!caps.includes(root.cadPolylineWidth?.capability))bad('polyline-width-capability-required');
        for(const v of o.vertices){if(vertexIds.has(v.id))bad('duplicate-vertex-id');vertexIds.add(v.id);if(v.outgoing){if(edgeIds.has(v.outgoing.id))bad('duplicate-edge-id');edgeIds.add(v.outgoing.id);}}
      }
      for(const key of ['constraints','attachments'])if(o[key]!=null&&(typeof o[key]!=='object'||Array.isArray(o[key])))bad(key);
      for(const k of ['a','b','center','point','p1','p2','seed','labelPoint','vertex','ray1','ray2','leaderAnchor'])if(o[k]!=null&&!point(o[k]))bad('point');
      if(o.polygon!=null&&(!Array.isArray(o.polygon)||!o.polygon.every(point)))bad('polygon');
      if(['cadLine','line','wall'].includes(o.type)&&(!point(o.a)||!point(o.b)))bad('line');
      if(['cadCircle','cadArc'].includes(o.type)&&(!point(o.center)||!Number.isFinite(o.radius)||o.radius<=0))bad('circle');
      if(o.type==='cadArc'&&(!Number.isFinite(o.startAngle)||!Number.isFinite(o.sweep)))bad('arc');
      if(o.type==='cadText'){if(o.textOverrides){if(!caps.includes(root.cadTextStyles?.overrideCapability))bad('text-override-capability-required');root.cadTextStyles.validateOverrides(o);}if(o.alignment!=null&&!['left','center','right'].includes(o.alignment))bad('text-alignment');if(!point(o.point)||typeof o.text!=='string')bad('text');if(o.width!=null&&(!Number.isFinite(o.width)||o.width<0))bad('text-width');if((o.mtext===true||o.text.includes('\n'))&&!annotationV2)bad('annotation-v2-capability-required');}
      if(o.association){if(!caps.includes(root.cadDimensionAssociation?.capability))bad('dimension-association-capability-required');root.cadDimensionAssociation.validate(o);}
      if(o.type==='cadDimension'){
        const kind=o.kind||'aligned';
        if(kind==='aligned'||kind==='linear'){if(kind==='linear'&&(!caps.includes('cad.dimstyle.v1')||!Number.isFinite(o.dimensionAngle)))bad('cad-linear-dimension');if(!point(o.p1)||!point(o.p2)||!Number.isFinite(o.offset))bad('cad-dimension');}
        else if(kind==='radius'||kind==='diameter'){if(!annotationV2)bad('annotation-v2-capability-required');if(!point(o.center)||!Number.isFinite(o.radius)||o.radius<=0||!point(o.labelPoint))bad('cad-radial-dimension');}
        else if(kind==='angular'){if(!annotationV2)bad('annotation-v2-capability-required');if(!point(o.vertex)||!point(o.ray1)||!point(o.ray2)||!Number.isFinite(o.radius)||o.radius<=0)bad('cad-angular-dimension');}
        else bad('cad-dimension-kind');
        if(o.styleName!=null&&(!caps.includes('cad.dimstyle.v1')||typeof o.styleName!=='string'||!styles.some(d=>d.name.toUpperCase()===o.styleName.toUpperCase())))bad('dimension-style-reference');
        if(!Array.isArray(o.segments)||!o.segments.every(seg=>point(seg?.a)&&point(seg?.b)))bad('cad-dimension-segments');
      }
      if(o.type==='cadHatch'&&o.boundaryCurves){if(!caps.includes(root.cadHatchCurves?.capability))bad('hatch-curve-capability-required');if(root.cadHatchCurves.multipleSplines(o)&&!caps.includes(root.cadHatchCurves.multiSplineCapability))bad('hatch-multispline-capability-required');root.cadHatchCurves.validate(o);if(root.cadPolyline.requiresClosed2([o])&&!caps.includes('cad.polyline.closed2.v1'))bad('closed2-capability-required');}
      else if(o.type==='cadHatch'){if(o.hatchPatternTransform&&!root.cadBlocks.matrixValid(o.hatchPatternTransform))bad('hatch-pattern-transform');if(!Array.isArray(o.points)||o.points.length<3||!o.points.every(point))bad('cad-hatch');if(o.angle!=null&&!Number.isFinite(o.angle))bad('cad-hatch-angle');if(o.loops!=null&&(!Array.isArray(o.loops)||!o.loops.length||!o.loops.every(l=>Array.isArray(l)&&l.length>=3&&l.every(point))))bad('hatch-loops');}
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
