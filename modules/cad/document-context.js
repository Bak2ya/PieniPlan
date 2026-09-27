/* PieniPlan Build26 P1: derived CAD object index, revisions and purpose policy. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  function create({ getState, classify, inWorkScope, layerVisible, layerLocked, planOverlayVisible }) {
    let byId = new Map();
    let documentId = `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    let geometryRevision = 0, layerRevision = 0, referenceRevision = 0;
    function rebuild() {
      const next = new Map();
      for (const obj of getState().objects || []) {
        if (!obj?.id) continue;
        if (next.has(obj.id)) throw new Error(`duplicate-object-id:${obj.id}`);
        next.set(obj.id, obj);
      }
      byId = next;
      return byId;
    }
    function resetDocument(id = null) {
      documentId = id || `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
      geometryRevision = layerRevision = referenceRevision = 0;
      rebuild();
    }
    function touchGeometry(){ geometryRevision++; }
    function touchLayer(){ layerRevision++; }
    function touchReference(){ referenceRevision++; }
    function token(){ const s=getState(); return Object.freeze({documentId,geometryRevision,layerRevision,referenceRevision,regionId:s.cadWorkRegionId||null,mode:s.toolset}); }
    function isCurrent(t,{geometry=true,layer=true,reference=false,region=true}={}){
      if(!t||t.documentId!==documentId)return false;
      if(geometry&&t.geometryRevision!==geometryRevision)return false;
      if(layer&&t.layerRevision!==layerRevision)return false;
      if(reference&&t.referenceRevision!==referenceRevision)return false;
      if(region&&t.regionId!==(getState().cadWorkRegionId||null))return false;
      return true;
    }
    function getById(id){ return byId.get(id) || null; }
    function policy(id,purpose='select'){
      const obj=getById(id);if(!obj)return{allowed:false,reason:'missing-object',sourceKind:'unknown',layer:null,locked:false,visible:false,inWorkScope:false};
      const sourceKind=classify(obj), layer=obj.cadLayer||null;
      if(sourceKind==='cad-source'){
        const scope=Boolean(inWorkScope(obj)), visible=scope&&Boolean(layerVisible(layer||'0')), locked=Boolean(layerLocked(layer||'0'));
        if(purpose==='region-rotate-source')return{allowed:scope,reason:scope?null:'outside-work-scope',sourceKind,layer,locked,visible,inWorkScope:scope};
        if(purpose==='render')return{allowed:visible,reason:visible?null:scope?'hidden-layer':'outside-work-scope',sourceKind,layer,locked,visible,inWorkScope:scope};
        if(!scope)return{allowed:false,reason:'outside-work-scope',sourceKind,layer,locked,visible:false,inWorkScope:false};
        if(!visible)return{allowed:false,reason:'hidden-layer',sourceKind,layer,locked,visible:false,inWorkScope:true};
        if(purpose==='modify'&&locked)return{allowed:false,reason:'locked-layer',sourceKind,layer,locked,visible:true,inWorkScope:true};
        return{allowed:true,reason:null,sourceKind,layer,locked,visible:true,inWorkScope:true};
      }
      if(sourceKind==='plan-overlay'){
        const visible=Boolean(planOverlayVisible(obj));
        const allowed=visible&&(purpose==='render'||purpose==='inspect'||purpose==='select');
        return{allowed,reason:allowed?null:purpose==='modify'?'plan-overlay-readonly':purpose==='snap'?'plan-overlay-snap-disabled':'plan-overlay-hidden',sourceKind,layer:null,locked:true,visible,inWorkScope:visible};
      }
      return{allowed:false,reason:'unsupported-source',sourceKind,layer,locked:true,visible:false,inWorkScope:false};
    }
    rebuild();
    return Object.freeze({ rebuild, resetDocument, touchGeometry, touchLayer, touchReference, token, isCurrent, getById, policy,
      get size(){return byId.size;}, get documentId(){return documentId;}, get geometryRevision(){return geometryRevision;}, get layerRevision(){return layerRevision;}, get referenceRevision(){return referenceRevision;} });
  }
  root.cadDocumentContext = Object.freeze({ create });
})();
