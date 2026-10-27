/* Isolated DXF drawing subsets. Source owners and common WCS coordinates never change. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},clone=v=>JSON.parse(JSON.stringify(v)),key=v=>String(v||'').toUpperCase();
 function subset(document,{ids=null,blockName=null,base={x:0,y:0}}={}){
  if(!Number.isFinite(base?.x)||!Number.isFinite(base?.y))throw Error('invalid-block-base');
  const D=root.architecturalDxf,get=(r,c)=>D.first(r||[],c),defs=new Map((document.blockDefinitions||[]).map(d=>[key(d.name),d])),preserved=new Map((document.archive?.preservedBlocks||[]).map(d=>[key(d.name||get(d.rawHeader,2)),d])),usedRaw=new Set(),used=new Set(),styles=new Set(['STANDARD']),texts=new Set(['STANDARD']),layers=new Set(['0']),types=new Set(['CONTINUOUS','BYLAYER','BYBLOCK']),apps=new Set();
  let objects;if(blockName){const d=defs.get(key(blockName));if(!d)throw Error('missing-block-definition');objects=[{id:'__wblock_root96',type:'cadInsert',blockName:d.name,matrix:root.cadBlocks.matrix(),cadLayer:'0'}];}
  else{const wanted=ids==null?null:new Set(ids);objects=(document.objects||[]).filter(o=>!wanted||wanted.has(o.id));if(wanted&&objects.length!==wanted.size)throw Error('stale-block-export-selection');}
  if(!objects.length)throw Error('empty-block-export');objects=clone(objects);
  function scanRaw(raw){for(const [c,v]of raw){if(c===1001)apps.add(key(v));if(c===7)texts.add(key(v));if(c===8)layers.add(key(v));if(c===6)types.add(key(v));}if(['INSERT','DIMENSION'].includes(get(raw,0))&&get(raw,2))visit(get(raw,2));}
  function scan(scope){for(const o of scope){layers.add(key(o.cadLayer||'0'));types.add(key(o.linetype||'BYLAYER'));if(o.textStyle)texts.add(key(o.textStyle));if(o.styleName)styles.add(key(o.styleName));const raw=o.dxf?.raw||o.rawGroups||[];scanRaw(raw);for(const name of [o.blockName,o.presentationBlock])if(name)visit(name);}}
  function visit(name){const k=key(name);if(used.has(k)||usedRaw.has(k))return;const d=defs.get(k);if(!d){const raw=preserved.get(k);if(!raw)throw Error('missing-block-definition');usedRaw.add(k);for(const r of raw.rawRecords||[])scanRaw(r);return;}used.add(k);scan(d.objects);}
  scan(objects);let changed=true;while(changed){changed=false;for(const d of document.dimensionStyles||[])if(styles.has(key(d.name))){if(d.textStyle)texts.add(key(d.textStyle));for(const name of [d.arrowBlock,d.arrowBlock1,d.arrowBlock2])if(name&&!used.has(key(name))){visit(name);changed=true;}}}
  const definitions=clone([...used].map(k=>defs.get(k))),all=[...objects,...definitions.flatMap(d=>d.objects)];
  // Detach only exported copies whose associative boundaries are outside their scope.
  for(const scope of [objects,...definitions.map(d=>d.objects)]){const available=new Set(scope.map(o=>o.id));for(const o of scope){if(o.association&&Object.values(o.association.anchors||{}).some(a=>!available.has(a.sourceId)))delete o.association;const links=o.boundarySourceGroups95?.flat()||o.sourceBoundaryIds;if(links?.some(id=>!available.has(id))){delete o.boundarySourceGroups95;delete o.sourceBoundaryIds;delete o.sourceBoundaryId;}}}
  const dimensionStyles=clone((document.dimensionStyles||[]).filter(d=>styles.has(key(d.name)))),textStyles=clone((document.textStyles||[]).filter(d=>texts.has(key(d.name)))),layerDefinitions=clone((document.layerDefinitions||[]).filter(d=>layers.has(key(d.name))));
  for(const l of layerDefinitions)if(l.linetype)types.add(key(l.linetype));
  const rawDefinitions=clone([...usedRaw].map(k=>preserved.get(k))),source=document.archive,sections=[],seeds=[...all.map(o=>o.dxf?.raw||o.rawGroups||[]),...definitions.flatMap(d=>[d.dxfHeader||[],d.dxfEnd||[]]),...rawDefinitions.flatMap(d=>[d.rawHeader||[],d.rawEnd||[],...(d.rawRecords||[])]),...dimensionStyles.map(d=>d.dxf?.raw||[]),...textStyles.map(d=>d.dxf?.raw||[])];
  for(const section of source?.sections||[]){if(section.name==='CLASSES'){sections.push(clone(section));continue;}if(section.name!=='TABLES')continue;const out=[];let table=null;for(const r of D.records(section.pairs)){const type=get(r,0);if(type==='TABLE'){table=get(r,2);out.push(clone(r));continue;}if(type==='ENDTAB'){out.push(clone(r));table=null;continue;}const name=key(get(r,2)),keep=table==='LAYER'?layers.has(name):table==='LTYPE'?types.has(name):table==='STYLE'?texts.has(name):table==='DIMSTYLE'?styles.has(name):table==='APPID'?apps.has(name):table==='BLOCK_RECORD'?used.has(name)||usedRaw.has(name)||name==='*MODEL_SPACE':false;if(keep){out.push(clone(r));seeds.push(r);}}sections.push({name:'TABLES',pairs:out.flat()});}
  // Follow outward extension/resource references, never an entity's top-level owner
  // to the drawing root dictionary. A subset must not include unrelated geometry.
  const objectRecords=D.records(source?.sections?.find(s=>s.name==='OBJECTS')?.pairs||[]),objectMap=new Map(objectRecords.map(r=>[key(get(r,5)),r])),needed=new Set(),queue=[];
  function refs(r){let depth=0;for(const[c,v]of r){if(c===102)depth+=String(v).startsWith('{')?1:v==='}'?-1:0;if((c>=331&&c<=369||c>=390&&c<=399||c===1005||c===330&&depth>0)&&objectMap.has(key(v))&&!needed.has(key(v))){needed.add(key(v));queue.push(objectMap.get(key(v)));}}}
  seeds.forEach(refs);for(let i=0;i<queue.length;i++)refs(queue[i]);if(queue.length)sections.push({name:'OBJECTS',pairs:clone(queue.flat())});
  const archive={version:source?.version||'AC1021',unitCode:source?.unitCode??4,unitFactor:source?.unitFactor||1,sections,preservedBlocks:rawDefinitions,hatchHandles95:source?.hatchHandles95||[]};
  root.cadBlocks.validate(definitions,objects);
  return{objects,blockDefinitions:definitions,dimensionStyles,textStyles,layerDefinitions,archive,currentLayer:'0',dimassoc:document.dimassoc??2,ucs:null,isoplane:'off',insertionBase:clone(base),linetypeScale:document.linetypeScale??1,polylineWidth:document.polylineWidth??0};
 }
 root.cadBlockExport=Object.freeze({subset});
})();
