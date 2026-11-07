/* Explicit, bounded materialization of old baseDrawingId overlays. Original
 * drawing metadata and pre-conversion Plan owners remain archived in PPRJ.
 * Different registrations and missing sources stay in the old reader safely. */
(() => {
  'use strict';
  const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},copy=x=>JSON.parse(JSON.stringify(x));
  const fail=code=>{throw Error('plan-legacy:'+code);};
  const needs=s=>!M.planVersions.enabled(s)&&(s.floors||[]).some(f=>f.baseDrawingId);
  const legacyLayer=o=>o.layerId||({wall:'walls',door:'doors',window:'windows',space:'spaces',stair:'stairs',dimension:'dimensions'}[o.type]||'drawing');
  const frame=f=>{const t=M.floorAlignment.normalize(f?.viewAlignment);return{x:t.x,y:t.y,rotation:t.rotation};};
  function convert(s,{uid,now=new Date().toISOString()}={}){
    const V=M.planVersions,D=M.planDrawings;
    if(!needs(s))return V.upgrade(s,{now});
    if(typeof uid!=='function')fail('allocator');D.validate(s);
    const roots=s.floors.filter(f=>!f.baseDrawingId);if(!roots.length)fail('missing-base');
    const rootIds=new Set(roots.map(f=>f.id)),next=V.upgrade({...s,floors:copy(roots),objects:s.objects.filter(o=>!o.floorId||rootIds.has(o.floorId))},{now});
    const used=new Set([s.projectId,...s.buildings.map(b=>b.id),...s.floors.map(f=>f.id),...(s.references||[]).map(r=>r.id),...(s.drawingModel?.levels||[]).map(l=>l.id),...s.objects.flatMap(o=>[o.id,...(o.vertices||[]).flatMap(v=>[v.id,v.outgoing?.id].filter(Boolean))])]);
    const fresh=type=>{const value=uid(type);if(typeof value!=='string'||!value||value.length>255||['__proto__','constructor','prototype'].includes(value)||/[\x00-\x1f]/.test(value)||used.has(value))fail('id-collision');used.add(value);return value;};
    const originals=new Map(s.floors.map(f=>[f.id,f])),pending=s.floors.filter(f=>f.baseDrawingId);let created=0;
    next.references=M.planBackgrounds?(s.references||[]).map(M.planBackgrounds.copyReference):copy(s.references||[]);
    while(pending.length){let advanced=false;
      for(let i=0;i<pending.length;i++){
        const old=pending[i],parent=V.row(next,old.baseDrawingId);if(!parent)continue;
        const source=next.floors.find(f=>f.id===parent.drawingId),originalSource=originals.get(parent.drawingId);
        if(old.buildingId!==source.buildingId||old.levelId&&originalSource.levelId&&old.levelId!==originalSource.levelId)fail('different-physical-level');
        if(D.canonical(frame(old))!==D.canonical(frame(originalSource)))fail('different-registration');
        const floor=copy(old);for(const k of ['baseDrawingId','baseRevision','baseFingerprint','baseView'])delete floor[k];
        // A former overlay had no CAD source of its own. Preserve the effective
        // base range without reassigning the live CAD authoring document.
        if(!floor.sourceRegionId)floor.sourceRegionId=source.sourceRegionId||null;
        next.floors.push(floor);const originalOwners=s.objects.filter(o=>o.floorId===old.id).map(copy),inherited=V.objects(next,parent.drawingId),ids=new Map();
        for(const o of inherited){ids.set(o.id,fresh(o.type));for(const vertex of o.vertices||[]){ids.set(vertex.id,fresh('vertex'));if(vertex.outgoing)ids.set(vertex.outgoing.id,fresh('edge'));}}
        const clones=inherited.map(o=>({...V.remapOwner(o,ids),floorId:old.id}));
        const local=originalOwners.map(o=>V.remapOwner(o,ids));next.objects.push(...clones,...local);
        const row=V.initialRow(next,floor,parent.levelId,now);row.current=false;row.sourceDrawingId=parent.drawingId;row.description='기존 파생 도면을 독립 도면으로 전환 · 업무상 날짜 미지정';
        const inheritedLayerMap=new Map();
        for(const layer of parent.layers){const id='legacy:'+D.hash({drawingId:old.id,layerId:layer.id}).slice(0,32);inheritedLayerMap.set(layer.id,id);row.layers.push({...copy(layer),id,name:source.name+' · '+layer.name,locked:false});}
        for(const o of inherited){const instance=ids.get(o.id),layerId=inheritedLayerMap.get(parent.assignments[o.id]);row.assignments[instance]=layerId;row.origins[instance]={rootObjectId:parent.origins[o.id].rootObjectId,sourceObjectId:o.id};}
        // Preserve every layer's existence. Old hidden/filtered base content is
        // kept in an independently revealable semantic layer, never deleted.
        const shown=new Set(inherited.filter(o=>old.baseView?.visible!==false&&(!old.baseView?.layers||old.baseView.layers.includes(legacyLayer(o)))&&V.visible(next,o)).map(o=>parent.assignments[o.id]));
        for(const l of row.layers)if([...inheritedLayerMap.values()].includes(l.id))l.visible=shown.has([...inheritedLayerMap.entries()].find(([,id])=>id===l.id)[0]);
        // Remove default assignments created for the clone set before source
        // layer assignment, retaining defaults that own original objects use.
        const assigned=new Set(Object.values(row.assignments));row.layers=row.layers.filter(l=>assigned.has(l.id));row.activeLayerId=row.layers.find(l=>l.visible)?.id||row.layers[0]?.id||null;
        parent.sealedFingerprint||=V.content(next,parent);row.sourceFingerprint=parent.sealedFingerprint;
        next.drawingModel.versions.push(row);
        for(const ref of next.references.filter(r=>r.floorId===parent.drawingId&&r.type!=='linkedCadRegion'))next.references.push({...M.planBackgrounds.copyReference(ref),id:fresh('reference'),floorId:old.id});
        next.drawingModel=V.sync(next,{now});V.validate(next);created+=clones.length;
        pending.splice(i--,1);advanced=true;
      }
      if(!advanced)fail('missing-or-cyclic-base');
    }
    next.floors.sort((a,b)=>s.floors.findIndex(f=>f.id===a.id)-s.floors.findIndex(f=>f.id===b.id));
    next.activeFloorId=s.activeFloorId;next.activeBuildingId=s.activeBuildingId;
    next.drawingModel.legacy={format:'PieniPlanLegacyConversion',version:1,convertedAt:now,drawingModel:copy(s.drawingModel),floors:copy(s.floors),originalPlanOwners:s.objects.filter(o=>o.floorId).map(copy),materializedOwnerCount:created,referenceViews:(s.references||[]).map(M.planBackgrounds.serialize)};
    V.validate(next);return next;
  }
  M.planLegacyVersions=Object.freeze({needs,convert});
})();
