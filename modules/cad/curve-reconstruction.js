/* Pure semi-automatic curve reconstruction helpers. The host owns policy/history/UI. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const EPS = 1e-8;
  const deg = r => r * 180 / Math.PI;
  const rad = d => d * Math.PI / 180;
  const dist = (a,b) => Math.hypot((a?.x||0)-(b?.x||0),(a?.y||0)-(b?.y||0));
  const norm360 = a => ((a % 360) + 360) % 360;

  function solve3(m,b){
    const a=m.map((row,i)=>[...row,b[i]]);
    for(let c=0;c<3;c++){
      let p=c;for(let r=c+1;r<3;r++)if(Math.abs(a[r][c])>Math.abs(a[p][c]))p=r;
      if(Math.abs(a[p][c])<EPS)return null;
      if(p!==c)[a[p],a[c]]=[a[c],a[p]];
      const q=a[c][c];for(let k=c;k<4;k++)a[c][k]/=q;
      for(let r=0;r<3;r++){if(r===c)continue;const f=a[r][c];for(let k=c;k<4;k++)a[r][k]-=f*a[c][k];}
    }
    return[a[0][3],a[1][3],a[2][3]];
  }

  function circleFit(points){
    if(!Array.isArray(points)||points.length<3)return null;
    let sx=0,sy=0;for(const p of points){sx+=p.x;sy+=p.y;}const mx=sx/points.length,my=sy/points.length;
    let sxx=0,sxy=0,syy=0,sxz=0,syz=0,sz=0;
    for(const p of points){const x=p.x-mx,y=p.y-my,z=x*x+y*y;sxx+=x*x;sxy+=x*y;syy+=y*y;sxz+=x*z;syz+=y*z;sz+=z;}
    const n=points.length,sol=solve3([[sxx,sxy,sx*0],[sxy,syy,sy*0],[0,0,n]],[-sxz,-syz,-sz]);
    // The centered system has zero first moments. Keep the explicit 3x3 form so the
    // solver remains deterministic and easy to test.
    if(!sol)return null;
    const A=sol[0],B=sol[1],C=sol[2],cx=mx-A/2,cy=my-B/2,r2=(A*A+B*B)/4-C;
    if(!(r2>EPS)||!Number.isFinite(r2))return null;
    const center={x:cx,y:cy},radius=Math.sqrt(r2);if(!Number.isFinite(radius))return null;
    const residuals=points.map(p=>Math.abs(dist(p,center)-radius));
    const maxResidual=Math.max(...residuals),rmsResidual=Math.sqrt(residuals.reduce((s,v)=>s+v*v,0)/residuals.length);
    return{center,radius,maxResidual,rmsResidual,residuals};
  }

  function samplePrimitive(seg){
    if(!seg)return[];
    if(Array.isArray(seg.segments))return seg.segments.flatMap(samplePrimitive);
    if(seg.kind==='line'||seg.type==='cadLine'||(seg.a&&seg.b&&!seg.center)){
      const a=seg.a,b=seg.b;if(!a||!b||dist(a,b)<EPS)return[];
      // Chord interiors are not points on the original circle. For segmented-arc
      // reconstruction only the LINE endpoints are valid circle-fit samples.
      return[{...a},{...b}];
    }
    if(seg.kind==='arc'||seg.type==='cadArc'||(seg.center&&Number.isFinite(seg.radius)&&Number.isFinite(seg.sweep))){
      const sweep=Number(seg.sweep)||0,n=Math.max(4,Math.min(18,Math.ceil(Math.abs(sweep)/12)+1)),out=[];
      for(let i=0;i<=n;i++){const a=rad((Number(seg.startAngle)||0)+sweep*i/n);out.push({x:seg.center.x+Math.cos(a)*seg.radius,y:seg.center.y+Math.sin(a)*seg.radius});}
      return out;
    }
    return[];
  }

  function coverAngles(points,center){
    const vals=points.map(p=>norm360(deg(Math.atan2(p.y-center.y,p.x-center.x)))).sort((a,b)=>a-b);if(vals.length<2)return null;
    let gap=-1,gapIndex=0;for(let i=0;i<vals.length;i++){const a=vals[i],b=i===vals.length-1?vals[0]+360:vals[i+1],g=b-a;if(g>gap){gap=g;gapIndex=i;}}
    const start=vals[(gapIndex+1)%vals.length],sweep=360-gap;if(!(sweep>EPS&&sweep<359.5))return null;
    return{startAngle:start,sweep};
  }

  function primitiveHasArc(seg){if(!seg)return false;if(Array.isArray(seg.segments))return seg.segments.some(primitiveHasArc);return seg.kind==='arc'||seg.type==='cadArc'||Boolean(seg.center&&Number.isFinite(seg.radius)&&Number.isFinite(seg.sweep));}

  function uniquePoints(points){const out=[];for(const p of points||[]){if(!out.some(q=>dist(p,q)<=1e-6))out.push(p);}return out;}

  function fitPieces(pieces,{minPieces=2,minSweep=6,maxSweep=330,minRadius=40,maxRadius=1e7}={}){
    const usable=(pieces||[]).filter(Boolean),allLine=!usable.some(primitiveHasArc),points=uniquePoints(usable.flatMap(samplePrimitive));if(usable.length<minPieces||(allLine&&usable.length<3)||points.length<3)return null;
    const fit=circleFit(points);if(!fit||fit.radius<minRadius||fit.radius>maxRadius)return null;
    const cover=coverAngles(points,fit.center);if(!cover||cover.sweep<minSweep||cover.sweep>maxSweep)return null;
    const allowedResidual=Math.max(6,Math.min(90,fit.radius*.006));
    if(fit.maxResidual>allowedResidual)return null;
    const a0=rad(cover.startAngle),a1=rad(cover.startAngle+cover.sweep);
    return{center:fit.center,radius:fit.radius,startAngle:cover.startAngle,sweep:cover.sweep,a:{x:fit.center.x+Math.cos(a0)*fit.radius,y:fit.center.y+Math.sin(a0)*fit.radius},b:{x:fit.center.x+Math.cos(a1)*fit.radius,y:fit.center.y+Math.sin(a1)*fit.radius},maxResidual:fit.maxResidual,rmsResidual:fit.rmsResidual,allowedResidual,pieceCount:usable.length,pointCount:points.length,sourceIds:usable.map(p=>p.id).filter(Boolean)};
  }

  function angleInsideExpanded(angle,start,sweep,pad=28){
    const a=norm360(angle),s=norm360(start),d=norm360(a-s);return d<=sweep+pad||norm360(s-a)<=pad;
  }

  function suggestMore(fit,pieces,{includedIds=new Set(),excludedIds=new Set(),limit=12}={}){
    if(!fit)return[];const out=[];
    for(const piece of pieces||[]){if(!piece?.id||includedIds.has(piece.id)||excludedIds.has(piece.id))continue;const pts=samplePrimitive(piece);if(!pts.length)continue;const residuals=pts.map(p=>Math.abs(dist(p,fit.center)-fit.radius)),maxResidual=Math.max(...residuals),mid=pts[Math.floor(pts.length/2)],angle=deg(Math.atan2(mid.y-fit.center.y,mid.x-fit.center.x));if(maxResidual>fit.allowedResidual*1.8||!angleInsideExpanded(angle,fit.startAngle,fit.sweep,35))continue;const score=maxResidual+Math.abs(dist(mid,fit.center)-fit.radius)*.4;out.push({piece,score,maxResidual});}
    return out.sort((a,b)=>a.score-b.score).slice(0,limit).map(x=>x.piece);
  }

  root.curveReconstruction=Object.freeze({fitPieces,suggestMore,samplePrimitive,circleFit});
})();
