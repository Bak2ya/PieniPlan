/* Derived, spatially indexed stair input candidates. Reuse the CAD projection,
 * extension and priority engines; no geometry or persistent constraints written. */
(() => {
  'use strict'; const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},cache=new WeakMap();
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),box=(p,r)=>({minx:p.x-r,maxx:p.x+r,miny:p.y-r,maxy:p.y+r});
  function index(source){
    if(cache.has(source))return cache.get(source);
    const segments=(source.segments||[]).filter(s=>s.a&&s.b&&distance(s.a,s.b)>1e-9).map((s,i)=>({o:{type:'cadLine',id:s.objectId||'stair-segment-'+i,a:s.a,b:s.b,cadLayer:s.layer},b:{minx:Math.min(s.a.x,s.b.x),maxx:Math.max(s.a.x,s.b.x),miny:Math.min(s.a.y,s.b.y),maxy:Math.max(s.a.y,s.b.y)}}));
    const anchors=segments.flatMap(({o})=>[{...o.a,kind:'endpoint'},{...o.b,kind:'endpoint'},{x:(o.a.x+o.b.x)/2,y:(o.a.y+o.b.y)/2,kind:'midpoint'}].map(p=>({p:{...p,objectId:o.id},b:box(p,0)})));
    const value={segments:M.cadSpatialTree.create(segments),anchors:M.cadSpatialTree.create(anchors)};cache.set(source,value);return value;
  }
  function candidates(pointer,{indices=[],base=null,angles=[0],threshold,span=Infinity,allowed=()=>true}={}){
    if(!Number.isFinite(threshold)||threshold<=0)return[];
    const out=[],seen=new Set(),add=q=>{if(!q||!Number.isFinite(q.x)||!Number.isFinite(q.y)||distance(q,pointer)>threshold||!allowed(q))return;const key=[q.kind,q.x,q.y,q.objectId].join('|');if(!seen.has(key)){seen.add(key);out.push({...q,source:'stair'});}};
    const axes=[...new Set([0,...angles].filter(Number.isFinite).map(a=>((a%180)+180)%180))].flatMap(a=>[a,a+90]).map(a=>({x:Math.cos(a*Math.PI/180),y:Math.sin(a*Math.PI/180)}));
    for(const source of indices.filter(Boolean)){
      const trees=index(source),near=trees.segments.query(box(pointer,threshold)),extensions=trees.segments.query(box(pointer,Math.max(threshold,Math.min(span,threshold*16))));
      for(const {o}of near){for(const q of [o.a,o.b])add({...q,kind:'endpoint',objectId:o.id});add({x:(o.a.x+o.b.x)/2,y:(o.a.y+o.b.y)/2,kind:'midpoint',objectId:o.id});
        for(const q of M.cadPrecision.candidates(pointer,[o],{modes:['nearest']}))add(q);
        if(base)for(const q of M.geometryQuery.projectPerpendicular(o,base))add({...q,kind:'perpendicular',objectId:o.id,guide:{kind:'perpendicular',a:base,b:q}});
      }
      if(base){
        for(const axis of axes){const normal={x:-axis.y,y:axis.x},value=pointer.x*normal.x+pointer.y*normal.y;
          const projected=trees.anchors.queryByBounds(b=>{const p=[{x:b.minx,y:b.miny},{x:b.minx,y:b.maxy},{x:b.maxx,y:b.miny},{x:b.maxx,y:b.maxy}].map(p=>p.x*normal.x+p.y*normal.y);return Math.min(...p)<=value+threshold&&Math.max(...p)>=value-threshold;}).map(x=>x.p).filter(p=>distance(p,pointer)<=span).sort((a,b)=>distance(a,pointer)-distance(b,pointer)).slice(0,64);
          for(const anchor of [base,...projected]){const along=(pointer.x-anchor.x)*axis.x+(pointer.y-anchor.y)*axis.y,q={x:anchor.x+along*axis.x,y:anchor.y+along*axis.y};if(distance(anchor,q)>threshold)add({...q,kind:'tracking',objectId:anchor.objectId,anchor,guide:{kind:'parallel',a:anchor,b:q}});}
        }
        const extensionOwners=new Map([...extensions,...trees.segments.query(box(base,threshold))].map(x=>[x.o,x.o]));
        for(const o of extensionOwners.values())for(const anchor of [o.a,o.b]){const q=M.cadPrecision.extensionPoint(o,anchor,pointer,threshold);if(q)add({...q,kind:'extension',objectId:o.id});}
      }
    }
    return out;
  }
  function support(pointer,{indices=[],objectId=null,threshold}={}){
    let best=null;
    for(const source of indices.filter(Boolean))for(const {o}of index(source).segments.query(box(pointer,threshold))){
      if(objectId&&o.id!==objectId)continue;const projection=M.geometryQuery.projectNearest(o,pointer);
      if(projection&&projection.distance<=threshold&&(!best||projection.distance<best.projection.distance))best={o,projection};
    }
    return best;
  }
  M.planStairSnap=Object.freeze({candidates,support});
})();
