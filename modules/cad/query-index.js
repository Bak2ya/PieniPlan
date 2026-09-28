/* Reuse the segment grid; only non-linear CAD bodies need supplementary bounds.
 * Rectangle queries exceeding the grid budget fall back to a cheap bounds scan.
 */
(() => {
 const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function create(objects,segmentIndex,query,getById){
  const extra=[];
  objects.forEach((o,i)=>{if(!(o.a&&o.b)){const b=query.bounds(o);if(b)extra.push({o,b,order:i+1});}});
  function candidates(rect){
   const idx=segmentIndex,out=new Map(),x0=Math.floor(rect.minx/idx.cellW),x1=Math.floor(rect.maxx/idx.cellW),y0=Math.floor(rect.miny/idx.cellH),y1=Math.floor(rect.maxy/idx.cellH);
   if((x1-x0+1)*(y1-y0+1)<=4096){for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(const s of idx.segmentCells?.get(`${x},${y}`)||[]){const o=getById(s.objectId);if(o)out.set(o.id,{o,order:s.objectOrder});}}
   else for(let i=0;i<objects.length;i++){const o=objects[i];if(o.a&&o.b){const b={minx:Math.min(o.a.x,o.b.x),maxx:Math.max(o.a.x,o.b.x),miny:Math.min(o.a.y,o.b.y),maxy:Math.max(o.a.y,o.b.y)};if(root.geometryQuery.overlap(b,rect))out.set(o.id,{o,order:i+1});}}
   for(const item of extra)if(root.geometryQuery.overlap(item.b,rect))out.set(item.o.id,item);
   return [...out.values()].filter(({o})=>root.geometryQuery.overlap(o.a&&o.b?{minx:Math.min(o.a.x,o.b.x),maxx:Math.max(o.a.x,o.b.x),miny:Math.min(o.a.y,o.b.y),maxy:Math.max(o.a.y,o.b.y)}:query.bounds(o),rect)).sort((a,b)=>(Number(a.o.drawOrder)||0)-(Number(b.o.drawOrder)||0)||a.order-b.order).map(item=>item.o);
  }
  // Slab broad phase over occupied cells, never precise geometry over the whole document.
  function rayBox(ray,b){let lo=0,hi=Infinity;for(const axis of ['x','y']){const d=ray.b[axis]-ray.a[axis],v=ray.a[axis],min=b['min'+axis],max=b['max'+axis];if(Math.abs(d)<1e-12){if(v<min||v>max)return false;}else{const t0=(min-v)/d,t1=(max-v)/d;lo=Math.max(lo,Math.min(t0,t1));hi=Math.min(hi,Math.max(t0,t1));if(hi<lo)return false;}}return true;}
  function rayCandidates(ray){const out=new Map(),idx=segmentIndex;for(const [key,segs] of idx.segmentCells||[]){const [x,y]=key.split(',').map(Number),b={minx:x*idx.cellW,maxx:(x+1)*idx.cellW,miny:y*idx.cellH,maxy:(y+1)*idx.cellH};if(rayBox(ray,b))for(const s of segs){const o=getById(s.objectId);if(o)out.set(o.id,o);}}for(const {o,b} of extra)if(rayBox(ray,b))out.set(o.id,o);return[...out.values()].filter(o=>rayBox(ray,query.bounds(o)));}
  return Object.freeze({candidates,rayCandidates});
 }
 root.cadQueryIndex=Object.freeze({create});
})();
