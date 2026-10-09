/* Shared physical paper/range mapping for preview and print. All lengths are mm. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const papers=Object.freeze({A4:[210,297],A3:[297,420],A2:[420,594],A1:[594,841],A0:[841,1189]});
  function rect(r){if(!r||![r.minx,r.miny,r.maxx,r.maxy].every(Number.isFinite)||r.maxx<=r.minx||r.maxy<=r.miny)throw new Error('output-range');return{minx:r.minx,miny:r.miny,maxx:r.maxx,maxy:r.maxy};}
  function paper(options={}){const [a,b]=papers[options.paper]||papers.A3;return options.orientation==='portrait'?{width:a,height:b}:{width:b,height:a};}
  function printable(options={}){const p=paper(options),m=options.margins||{top:10,right:10,bottom:10,left:10};if(!['top','right','bottom','left'].every(k=>Number.isFinite(m[k])&&m[k]>=0))throw new Error('page-margins');const w=p.width-m.left-m.right,h=p.height-m.top-m.bottom;if(w<=0||h<=0)throw new Error('page-margins-too-large');return{...p,x:m.left,y:m.top,w,h,margins:{...m}};}
  function expand(r,aspect){r=rect(r);if(!Number.isFinite(aspect)||aspect<=0)throw new Error('range-aspect');const w=r.maxx-r.minx,h=r.maxy-r.miny,cx=(r.minx+r.maxx)/2,cy=(r.miny+r.maxy)/2,nw=Math.max(w,h*aspect),nh=Math.max(h,w/aspect);return{minx:cx-nw/2,maxx:cx+nw/2,miny:cy-nh/2,maxy:cy+nh/2};}
  function drag(a,b,aspect=null){let dx=b.x-a.x,dy=b.y-a.y;if(aspect){const w=Math.max(Math.abs(dx),Math.abs(dy)*aspect),h=w/aspect;dx=(dx<0?-1:1)*w;dy=(dy<0?-1:1)*h;}return{minx:Math.min(a.x,a.x+dx),maxx:Math.max(a.x,a.x+dx),miny:Math.min(a.y,a.y+dy),maxy:Math.max(a.y,a.y+dy)};}
  function layout(range,options={}){const r=rect(range),p=printable(options),rw=r.maxx-r.minx,rh=r.maxy-r.miny,fitScale=Math.max(rw/p.w,rh/p.h),scale=options.sizeMode==='fixed'?Number(options.scale):fitScale;if(!Number.isFinite(scale)||scale<=0)throw new Error('sheet-scale');return{paper:p,range:r,scale,fitScale,fits:rw<=p.w*scale+1e-7&&rh<=p.h*scale+1e-7,center:{x:(r.minx+r.maxx)/2,y:(r.miny+r.maxy)/2},modelW:p.w*scale,modelH:p.h*scale};}
  root.sheetLayout=Object.freeze({papers,paper,printable,rect,expand,drag,layout});
})();
