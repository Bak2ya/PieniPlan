/* Immutable 2D ByLayer normalization; block definitions retain shared identity. */
(() => {
 'use strict';
 const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},fields=[[1,'color'],[2,'linetype'],[4,'lineweight'],[128,'transparency98']],key='pieniplan-cad-setbylayer-mode';
 const validMask=n=>Number.isInteger(n)&&n>=0&&n<=255;
 const eligible=o=>Boolean(o&&String(o.type).startsWith('cad')&&o.type!=='cadDxfRecord'&&!o.readonly&&!o.planRole);
 function preferences(storage=globalThis.localStorage){return Object.freeze({get(){try{const raw=storage?.getItem(key);if(raw!==null&&raw!==undefined){const n=Number(raw);if(validMask(n)&&String(n)===raw.trim())return n;}}catch{}return 255;},set(n){if(!validMask(n))throw Error('invalid-setbylayer-mode');if(!storage)throw Error('preferences-unavailable');storage.setItem(key,String(n));return n;}});}
 function normalize(o,mask,{byBlock=Boolean(mask&32)}={}){
  if(!validMask(mask))throw Error('invalid-setbylayer-mode');if(!eligible(o))return o;
  let q=o;for(const[bit,k]of fields){if(!(mask&bit))continue;const v=o[k],token=k==='color'&&[-2,0].includes(v)?'BYBLOCK':k==='color'&&[-1,256].includes(v)?'BYLAYER':typeof v==='string'?v.toUpperCase():v;if(token==='BYBLOCK'&&!byBlock)continue;
   const colorMetadata=k==='color'&&(Object.hasOwn(o,'colorIndex')||Object.hasOwn(o,'adaptiveColor')||Object.hasOwn(o,'colorSource100'));
   if(v==null||token==='BYLAYER'){if(!colorMetadata||o.colorSource100?.kind==='inherit'&&o.colorSource100.value===256&&!Object.hasOwn(o,'colorIndex')&&!Object.hasOwn(o,'adaptiveColor'))continue;}if(q===o)q={...o};q[k]=null;if(k==='color'){if(M.cadNativeColor)q=M.cadNativeColor.edit(q,{color:null});else{delete q.colorIndex;delete q.adaptiveColor;delete q.colorSource100;}}
  }
  if(q!==o){delete q.dxfPresentation;if(JSON.stringify(q)===JSON.stringify(o))return o;}return q;
 }
 function plan(objects,definitions,ids,mask,{byBlock=Boolean(mask&32),includeBlocks=Boolean(mask&64),allowed=eligible,memberAllowed=eligible}={}){
  if(!validMask(mask)||!Array.isArray(objects)||!Array.isArray(definitions))throw Error('invalid-setbylayer-input');
  const selected=new Set(ids),byName=new Map(definitions.map(d=>[d.name.toUpperCase(),d])),visited=new Set(),changedDefinitions=new Map();let changedObjects=0,changedMembers=0,skipped=0;
  function visit(name){const k=String(name||'').toUpperCase();if(visited.has(k))return;visited.add(k);const d=byName.get(k);if(!d||d.readonly||d.isXref||d.externalReference){skipped++;return;}
   let changed=false;const members=d.objects.map(o=>{if(!eligible(o)||!memberAllowed(o,d)){skipped++;return o;}if(o.type==='cadInsert')visit(o.blockName);const q=normalize(o,mask,{byBlock});if(q!==o){changed=true;changedMembers++;}return q;});if(changed)changedDefinitions.set(k,{...d,objects:members});
  }
  const after=objects.map(o=>{if(!selected.has(o.id))return o;selected.delete(o.id);if(!eligible(o)||!allowed(o)){skipped++;return o;}if(includeBlocks&&o.type==='cadInsert')visit(o.blockName);const q=normalize(o,mask,{byBlock});if(q!==o)changedObjects++;return q;});skipped+=selected.size;
  const defs=changedDefinitions.size?definitions.map(d=>changedDefinitions.get(d.name.toUpperCase())||d):definitions;
  return{objects:changedObjects?after:objects,definitions:defs,changedObjects,changedMembers,changedBlocks:changedDefinitions.size,skipped,noChange:!changedObjects&&!changedDefinitions.size};
 }
 M.cadSetByLayer=Object.freeze({fields,validMask,eligible,preferences,normalize,plan});
})();
