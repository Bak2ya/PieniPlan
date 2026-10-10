/* Read-only reference primitives for the common SVG/PDF scene. */
(() => {
  'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rad=a=>a*Math.PI/180,P=p=>`${p.x},${-p.y}`;
  function point(ref,p){const a=rad(Number(ref.rotation)||0),scale=Number(ref.scale)||1,origin=ref.origin||{x:0,y:0};return{x:origin.x+scale*(p.x*Math.cos(a)-p.y*Math.sin(a)),y:origin.y+scale*(p.x*Math.sin(a)+p.y*Math.cos(a))};}
  function bounds(ref){const b=ref.clip||ref.bounds||{minx:0,miny:0,maxx:ref.width,maxy:ref.height};if(!b||![b.minx,b.miny,b.maxx,b.maxy].every(Number.isFinite))return null;const pts=[{x:b.minx,y:b.miny},{x:b.maxx,y:b.miny},{x:b.maxx,y:b.maxy},{x:b.minx,y:b.maxy}].map(p=>point(ref,p));return{minx:Math.min(...pts.map(p=>p.x)),miny:Math.min(...pts.map(p=>p.y)),maxx:Math.max(...pts.map(p=>p.x)),maxy:Math.max(...pts.map(p=>p.y))};}
  function primitives(entities,{weight=1,color='#596779',visibleLayers=null}={}){
    const out=[],stroke=`stroke="${esc(color)}" stroke-width="${weight}" stroke-linecap="round"`,line=(a,b)=>`<line x1="${a.x}" y1="${-a.y}" x2="${b.x}" y2="${-b.y}" ${stroke}/>`;
    for(const e of entities||[]){if(visibleLayers&&!visibleLayers.has(e.layer||'0'))continue;
      if(e.type==='line')out.push(line({x:e.x1,y:e.y1},{x:e.x2,y:e.y2}));
      else if(e.type==='polyline'&&e.points?.length)out.push(`<${e.closed?'polygon':'polyline'} points="${e.points.map(q=>P({x:q[0],y:q[1]})).join(' ')}" fill="none" ${stroke}/>`);
      else if(e.type==='circle')out.push(`<circle cx="${e.cx}" cy="${-e.cy}" r="${e.r}" fill="none" ${stroke}/>`);
      else if(e.type==='arc'){const start=Number(e.startAngle)||0,sweep=Number(e.sweep)||0,at=t=>({x:e.cx+Math.cos(rad(t))*e.r,y:e.cy+Math.sin(rad(t))*e.r}),a=at(start),b=at(start+sweep);out.push(`<path d="M ${P(a)} A ${e.r} ${e.r} 0 ${Math.abs(sweep)>180?1:0} ${sweep<0?1:0} ${P(b)}" fill="none" ${stroke}/>`);}
      else if(e.type==='text')out.push(`<text x="${e.x}" y="${-e.y}" font-family="PieniPlanOutputSans" xml:space="preserve" font-size="${e.height||180}" fill="${esc(color)}" transform="rotate(${-Number(e.rotation||0)} ${e.x} ${-e.y})">${esc(e.text)}</text>`);
    }return out.join('');
  }
  function markup(ref,{id,opacity,scale,asset,entities}={}){
    const ownScale=Number(ref.scale)||1,clip=ref.clip,clipId='r'+String(id||ref.id).replace(/[^\w-]/g,'_'),defs=clip?`<defs><clipPath id="${clipId}"><rect x="${clip.minx}" y="${-clip.maxy}" width="${clip.maxx-clip.minx}" height="${clip.maxy-clip.miny}"/></clipPath></defs>`:'',content=ref.type==='image'||ref.type==='pdf'?`<image x="0" y="${-ref.height}" width="${ref.width}" height="${ref.height}" preserveAspectRatio="none" href="${esc(asset?.dataUrl||ref.dataUrl||'')}"/>`:primitives(entities||ref.entities,{weight:.18*scale/ownScale,visibleLayers:ref.visibleLayers});
    return `<g data-reference-id="${esc(ref.id)}" opacity="${Math.max(0,Math.min(1,opacity??ref.opacity??1))}" transform="translate(${ref.origin?.x||0} ${-(ref.origin?.y||0)}) rotate(${-Number(ref.rotation||0)}) scale(${ownScale})">${defs}<g${clip?` clip-path="url(#${clipId})"`:''}>${content}</g></g>`;
  }
  root.referenceScene=Object.freeze({point,bounds,primitives,markup});
})();
