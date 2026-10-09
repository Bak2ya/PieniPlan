/* Optional schema7 view metadata. Geometry remains in its original local mm frame. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const identity=Object.freeze({version:1,x:0,y:0,rotation:0});
  const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
  function valid(t){return t&&t.version===1&&finite(t)&&Number.isFinite(t.rotation)&&(!Object.hasOwn(t,'scale')||t.scale===1);}
  function normalize(t){return valid(t)?t:identity;}
  function point(p,t){t=normalize(t);const a=t.rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return{x:t.x+p.x*c-p.y*s,y:t.y+p.x*s+p.y*c};}
  function inverse(p,t){t=normalize(t);const a=t.rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=p.x-t.x,y=p.y-t.y;return{x:x*c+y*s,y:-x*s+y*c};}
  function manual(source,target,{referenceTransform=null,referenceFloorId=null,rotation=0}={}){
    if(!Array.isArray(source)||!Array.isArray(target)||!source[0]||!target[0]||!source.every(finite)||!target.every(finite))throw new Error('alignment-points');
    const q=target.map(p=>point(p,referenceTransform));let angle=Number.isFinite(rotation)?rotation:0;
    if(source.length>1&&target.length>1){const a=source[0],b=source[1],c=q[0],d=q[1];if(Math.hypot(b.x-a.x,b.y-a.y)<1e-6||Math.hypot(d.x-c.x,d.y-c.y)<1e-6)throw new Error('alignment-points-too-close');angle=(Math.atan2(d.y-c.y,d.x-c.x)-Math.atan2(b.y-a.y,b.x-a.x))*180/Math.PI;}
    const rotated=point(source[0],{...identity,rotation:angle});
    return{version:1,x:q[0].x-rotated.x,y:q[0].y-rotated.y,rotation:angle,referenceFloorId,method:'manual'};
  }
  // Bounded deterministic endpoint registration. No scale fitting and no auto commit.
  function automatic(source,target,{referenceTransform=null,referenceFloorId=null,tolerance=60,maxPoints=40,maxCandidates=1200}={}){
    const unique=list=>{const seen=new Set(),pts=[];for(const o of list||[]){for(const p of [o.a,o.b,...(o.vertices||[])]){if(!finite(p))continue;const key=`${Math.round(p.x/tolerance)},${Math.round(p.y/tolerance)}`;if(!seen.has(key)){seen.add(key);pts.push({x:p.x,y:p.y});}}}return pts.sort((a,b)=>a.x-b.x||a.y-b.y).slice(0,maxPoints);};
    const a=unique(source),b=unique(target).map(p=>point(p,referenceTransform));if(a.length<2||b.length<2)return{candidate:null,confidence:0,reason:'insufficient-geometry'};
    const candidates=[],score=t=>{let hits=0,sum=0;const used=new Set();for(const p of a){const q=point(p,t);let nearest=-1,dist=tolerance;for(let i=0;i<b.length;i++){if(used.has(i))continue;const d=Math.hypot(q.x-b[i].x,q.y-b[i].y);if(d<dist){nearest=i;dist=d;}}if(nearest>=0){used.add(nearest);hits++;sum+=dist*dist;}}return{hits,rms:hits?Math.sqrt(sum/hits):Infinity,confidence:hits/Math.max(a.length,b.length)};};
    outer:for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const len=Math.hypot(a[j].x-a[i].x,a[j].y-a[i].y);if(len<tolerance*2)continue;for(let k=0;k<b.length;k++)for(let l=0;l<b.length;l++){if(k===l||Math.abs(Math.hypot(b[l].x-b[k].x,b[l].y-b[k].y)-len)>tolerance)continue;const t=manual([a[i],a[j]],[b[k],b[l]],{referenceFloorId}),s=score(t);candidates.push({...s,candidate:{...t,method:'automatic'}});if(candidates.length>=maxCandidates)break outer;}}
    candidates.sort((x,y)=>y.hits-x.hits||x.rms-y.rms||Math.abs(x.candidate.rotation)-Math.abs(y.candidate.rotation)||x.candidate.x-y.candidate.x||x.candidate.y-y.candidate.y);
    const best=candidates[0];if(!best)return{candidate:null,confidence:0,reason:'no-rigid-match'};
    const ambiguous=candidates.some(c=>c!==best&&c.hits===best.hits&&Math.abs(c.rms-best.rms)<tolerance*.05&&(Math.hypot(c.candidate.x-best.candidate.x,c.candidate.y-best.candidate.y)>tolerance||Math.abs(c.candidate.rotation-best.candidate.rotation)>1));
    return{...best,ambiguous,confidence:ambiguous?Math.min(.49,best.confidence):best.confidence,sourcePoints:a.length,targetPoints:b.length,candidates:candidates.length};
  }
  root.floorAlignment=Object.freeze({identity,valid,normalize,point,inverse,manual,automatic});
})();
