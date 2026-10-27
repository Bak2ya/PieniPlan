/* DIMASSOC controls future creation only; explicit explosion uses the existing
 * native vector presentation, never a raster or screen-space tessellation. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},capability='cad.dimension.creation.v1',clone=o=>JSON.parse(JSON.stringify(o));
 function validate(value){if(!Number.isInteger(value)||value<0||value>2)throw Error('invalid-dimassoc');return value;}
 function mode(settings){return validate(settings?.cadDimassoc96??2);}
 function explode(o,uid){if(o?.type!=='cadDimension'||o.readonly)throw Error('select-dimensions');const picture=M.cadDimensionStyles.presentation(o),scene=picture?[picture]:M.cadDimensionStyles.scene(o,{force:true});if(!scene?.length)throw Error('invalid-dimension');const items=scene.flatMap(q=>M.cadBlocks.is(q)?M.cadBlocks.explode(q,uid):[clone(q)]);if(items.length>100000||items.some(q=>q.readonly||!['cadLine','cadArc','cadCircle','cadEllipse','cadPolyline','cadText','cadHatch','cadPoint'].includes(q.type)))throw Error('dimension-presentation-not-explodable');
  return items.map(o=>{const q=clone(o);q.id=uid(q.type);for(const k of ['blockOwnerId','association','dxf','dxfPresentation','dimText96'])delete q[k];if(q.type==='cadHatch'){delete q.sourceBoundaryIds;delete q.boundarySourceGroups95;}if(M.cadPolyline.is(q))q.vertices=q.vertices.map(v=>({...v,id:uid('cadVertex'),...(v.outgoing?{outgoing:{...v.outgoing,id:uid('cadEdge')}}:{})}));return q;});
 }
 function prepare(o,value){validate(value);const q=clone(o);if(value!==2)delete q.association;return q;}
 M.cadDimensionCreation=Object.freeze({capability,validate,mode,prepare,explode});
})();
