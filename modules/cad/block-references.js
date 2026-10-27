/* Derived subentity reference data. Never copied into project owners or DXF.
 * Keep geometry, visibility ancestry and off-geometry snap origins independent. */
(() => {
 'use strict';
 const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},B=()=>M.cadBlocks;
 let generation=0,metadata=new WeakMap(),pointCache=new WeakMap(),indexes=new WeakMap(),retained=new Map(),cost=0;
 const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 function clear(){generation++;metadata=new WeakMap();pointCache=new WeakMap();indexes=new WeakMap();retained=new Map();cost=0;}
 function note(o,layers,invisible=false){metadata.set(o,Object.freeze({layers:Object.freeze([...new Set(layers)]),invisible:Boolean(invisible)}));}
 const info=o=>metadata.get(o)||null;
 function visible(o,layerVisible=()=>true){const q=info(o)||(!o.type&&Array.isArray(o.referenceLayers)?{layers:o.referenceLayers,invisible:o.referenceInvisible}:null);return !o.dxfInvisible&&!q?.invisible&&(!q||q.layers.every(layerVisible));}
 function query(instance,rect,bounds){const leaves=B().expand(instance);if(!rect)return leaves;let cache=indexes.get(leaves);if(!cache){cache=new Map();indexes.set(leaves,cache);}let index=cache.get(bounds);if(!index){index=M.cadSpatialTree.create(leaves.map(o=>({o,b:bounds(o)})).filter(x=>x.b&&Object.values(x.b).every(Number.isFinite)));cache.set(bounds,index);}return index.query(rect).map(x=>x.o);}
 function points(instance,leafPoints,{revision=0,rect=null}={}){
  B().get(instance.blockName); // Resolve a changed library before checking our generation.
  const sig=JSON.stringify([instance.matrix,instance.cadLayer,instance.dxfInvisible]),styles=M.cadDimensionStyles?.library?.();
  let entry=pointCache.get(instance);
  if(!entry||entry.generation!==generation||entry.sig!==sig||entry.styles!==styles||entry.revision!==revision||entry.leafPoints!==leafPoints){
   const items=[],seen=[],identity={a:1,b:0,c:0,d:1,tx:0,ty:0};let visited=0;
   function walk(o,m,parentLayer,path,ancestors=[],invisible=false,dimensionText=false){
    if(++visited>100000)throw Error('block-reference-budget');
    const layer=(o.cadLayer||'0')==='0'?(parentLayer||'0'):o.cadLayer,layers=[...ancestors,layer],hidden=invisible||Boolean(o.dxfInvisible);
    const emit=(p,kind)=>{const q=B().point(m,p);if(finite(q))items.push({...q,kind,objectId:instance.id,ownerId:instance.id,subentityId:path,source:'cad',referenceLayers:[...new Set(layers)],referenceInvisible:hidden});};
    if(B().is(o)){
     const name=String(o.blockName).toUpperCase(),d=B().get(name);if(!d)throw Error('missing-block-definition:'+name);if(seen.includes(name)||seen.length>=32)throw Error('cyclic-or-deep-block');
     const combined=B().multiply(m,o.matrix);emit({x:o.matrix.tx,y:o.matrix.ty},'insertion');seen.push(name);
     for(const child of d.objects)walk(child,combined,layer,path+'/'+child.id,layers,hidden,dimensionText);
     seen.pop();return;
    }
    for(const q of leafPoints(o))if(finite(q))emit(q,q.kind);
    if(dimensionText&&o.type==='cadText')emit(o.point,'node');
    if(o.type==='cadDimension'){
     const picture=M.cadDimensionStyles?.presentation?.(o);
     if(picture)walk(picture,m,layer,path+'/presentation',layers,hidden,true);
    }
   }
   walk(instance,identity,null,instance.id);
   entry={generation,sig,styles,revision,leafPoints,items,index:null};
   if(retained.has(instance)){cost-=retained.get(instance);retained.delete(instance);}
   pointCache.set(instance,entry);retained.set(instance,items.length);cost+=items.length;
   while(cost>200000&&retained.size){const [old,n]=retained.entries().next().value;retained.delete(old);pointCache.delete(old);cost-=n;}
  }
  if(!rect)return entry.items;
  if(!entry.index)entry.index=M.cadSpatialTree.create(entry.items.map(q=>({q,b:{minx:q.x,maxx:q.x,miny:q.y,maxy:q.y}})));
  return entry.index.query(rect).map(x=>x.q);
 }
 function intersections(owners,rect,{bounds,intersect,allowed=()=>true}={}){
  const items=[];for(const owner of owners)for(const leaf of B().is(owner)?query(owner,rect,bounds):[owner]){if(!allowed(leaf))continue;const b=bounds(leaf);if(b&&Object.values(b).every(Number.isFinite)&&M.cadSpatialTree.overlap(b,rect))items.push({leaf,owner,b,index:items.length});}
  const tree=M.cadSpatialTree.create(items),out=[];
  function add(points,a,b=a){const aa=info(a.leaf),bb=info(b.leaf),layers=[...new Set([...(aa?.layers||[]),...(bb?.layers||[])])];for(const p of points)if(finite(p)&&p.x>=rect.minx&&p.x<=rect.maxx&&p.y>=rect.miny&&p.y<=rect.maxy)out.push({...p,kind:'intersection',objectIds:[...new Set([a.owner.id,b.owner.id])],referenceLayers:layers,referenceInvisible:Boolean(aa?.invisible||bb?.invisible)});}
  for(const a of items){if(M.cadPolyline?.is(a.leaf))add(intersect(a.leaf,a.leaf,undefined,rect),a);for(const b of tree.query(a.b))if(b.index>a.index)add(intersect(a.leaf,b.leaf,undefined,rect),a,b);}
  return out;
 }
 M.cadBlockReferences=Object.freeze({clear,note,info,visible,query,points,intersections});
})();
