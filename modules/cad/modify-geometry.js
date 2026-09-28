/* Pure LINE TRIM/EXTEND planner. The host owns policy, IDs, preview and history. */
(() => {
 const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},G=root.geometryQuery,eps=G.tolerance.model;
 const length=e=>Math.hypot(e.b.x-e.a.x,e.b.y-e.a.y),at=(e,t)=>({x:e.a.x+(e.b.x-e.a.x)*t,y:e.a.y+(e.b.y-e.a.y)*t});
 function plan(mode,target,point,cutters){
  if(target?.type!=='cadLine'||length(target)<=eps)return null;
  const domain=mode==='extend'?{...target,mode:'line'}:target,ts=[];
  for(const cutter of cutters){if(cutter.id===target.id)continue;for(const p of G.intersections(domain,cutter)){const t=G.parameter(target,p);if(!ts.some(v=>Math.abs(v-t)*length(target)<=eps))ts.push(t);}}
  if(mode==='extend'){
   const start=Math.hypot(point.x-target.a.x,point.y-target.a.y)<=Math.hypot(point.x-target.b.x,point.y-target.b.y),list=ts.filter(t=>start?t<-eps/length(target):t>1+eps/length(target)).sort((a,b)=>start?b-a:a-b);if(!list.length)return null;
   const endpoint=start?'a':'b',to=at(target,list[0]),after={...target,[endpoint]:to};return{kind:mode,targetId:target.id,before:target,after:[after],a:{...target[endpoint]},b:to,cuts:[],endpoint};
  }
  if(mode!=='trim')return null;
  const cuts=[0,...ts.filter(t=>t>eps/length(target)&&t<1-eps/length(target)).sort((a,b)=>a-b),1];if(cuts.length===2)return null;
  const t=G.projectNearest(target,point).t;let i=cuts.findIndex((v,i)=>i<cuts.length-1&&t<=cuts[i+1]);if(i<0)i=cuts.length-2;
  const lo=cuts[i],hi=cuts[i+1],after=[];if(lo>0)after.push({...target,b:at(target,lo)});if(hi<1)after.push({...target,a:at(target,hi)});
  return{kind:mode,targetId:target.id,before:target,after,t0:lo,t1:hi,a:at(target,lo),b:at(target,hi),cuts:[...(lo>0?[at(target,lo)]:[]),...(hi<1?[at(target,hi)]:[])]};
 }
 root.cadModifyGeometry=Object.freeze({plan});
})();
