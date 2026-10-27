/* Intersections of two exact ellipse normal-offset loci. Bounding boxes use
 * analytic coordinate extrema and curvature cusps, never display chords. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},T=2*Math.PI,norm=t=>(t%T+T)%T,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function locus(e,r,sign){const E=M.cadEllipse,a=Math.hypot(e.major.x,e.major.y),b=a*e.ratio,minor=E.minor(e),critical=[Math.atan2(minor.x,e.major.x),Math.atan2(minor.x,e.major.x)+Math.PI,Math.atan2(minor.y,e.major.y),Math.atan2(minor.y,e.major.y)+Math.PI];
  if(sign<0&&a!==b){const q=(Math.pow(r*a*b,2/3)-b*b)/(a*a-b*b);if(q>=0&&q<=1){const t=Math.asin(Math.sqrt(q));critical.push(t,Math.PI-t,Math.PI+t,T-t);}}
  function at(t){const p=E.point(e,t),v={x:-e.major.x*Math.sin(t)+minor.x*Math.cos(t),y:-e.major.y*Math.sin(t)+minor.y*Math.cos(t)},speed=Math.hypot(v.x,v.y),k=a*b/(speed**3),factor=1+sign*r*k;return{point:{x:p.x+sign*r*v.y/speed,y:p.y-sign*r*v.x/speed},contact:p,derivative:{x:v.x*factor,y:v.y*factor}};}
  function box(lo,hi){const ts=[lo,hi];for(const raw of critical){const t=norm(raw),k=Math.ceil((lo-t)/T),q=t+k*T;if(q>=lo-1e-14&&q<=hi+1e-14)ts.push(q);}const ps=ts.map(t=>at(t).point);return{minx:Math.min(...ps.map(p=>p.x)),maxx:Math.max(...ps.map(p=>p.x)),miny:Math.min(...ps.map(p=>p.y)),maxy:Math.max(...ps.map(p=>p.y))};}
  return{at,box};
 }
 function sameSupport(a,b,eps){const metric=e=>{const v=M.cadEllipse.minor(e);return[e.major.x**2+v.x**2,e.major.y**2+v.y**2,e.major.x*e.major.y+v.x*v.y];},x=metric(a),y=metric(b);return dist(a.center,b.center)<eps&&x.every((v,i)=>Math.abs(v-y[i])<eps*Math.max(1,Math.abs(v),Math.abs(y[i])));}
 function solve(a,b,r,pa,pb,{extend=false,budget=60000,tolerance=1e-7}={}){
  const E=M.cadEllipse;if(!E.is(a)||!E.is(b)||a.id&&a.id===b.id||!(r>1e-8)||!Number.isInteger(budget)||budget<1)return{status:'unsupported',candidates:[],visits:0};E.validate(a);E.validate(b);
  if(a.ratio===1||b.ratio===1){const circular=e=>({id:e.id,type:'cadCircle',center:e.center,radius:Math.hypot(e.major.x,e.major.y)}),qa=a.ratio===1?circular(a):a,qb=b.ratio===1?circular(b):b,list=a.ratio===1&&b.ratio===1?M.cadCreation.tangentPair(qa,qb,r,pa,pb,{extendArcs:extend,all:true})||[]:M.cadConicFillet.candidates(qa,qb,r,pa,pb,{extend});return{status:'ok',visits:0,candidates:list.filter(q=>extend||E.contains(a,E.parameter(a,q.tangentA))&&E.contains(b,E.parameter(b,q.tangentB)))};}
  const origin=a.center,size=Math.max(1,r,Math.hypot(a.major.x,a.major.y),Math.hypot(b.major.x,b.major.y),dist(a.center,b.center)),local=e=>({...e,center:{x:(e.center.x-origin.x)/size,y:(e.center.y-origin.y)/size},major:{x:e.major.x/size,y:e.major.y/size}}),x=local(a),y=local(b),radius=r/size,eps=Math.max(2e-14,tolerance/size),range=e=>extend?[0,T]:e.sweepParam>0?[norm(e.startParam),norm(e.startParam)+e.sweepParam]:[norm(e.startParam)+e.sweepParam,norm(e.startParam)],rangeA=range(x),rangeB=range(y),out=[];
  if(sameSupport(x,y,eps))return{status:'coincident',candidates:[],visits:0};let visits=0;
  const round=2e-14,overlap=(a,b)=>a.minx<=b.maxx+round&&a.maxx>=b.minx-round&&a.miny<=b.maxy+round&&a.maxy>=b.miny-round,sizeOf=b=>Math.max(b.maxx-b.minx,b.maxy-b.miny),world=p=>({x:origin.x+p.x*size,y:origin.y+p.y*size});
  for(const sa of [-1,1])for(const sb of [-1,1]){const A=locus(x,radius,sa),B=locus(y,radius,sb),node=(lo,hi,L)=>({lo,hi,box:L.box(lo,hi)}),stack=[{a:node(...rangeA,A),b:node(...rangeB,B),depth:0}];
   function split(cell){const splitA=sizeOf(cell.a.box)>=sizeOf(cell.b.box),s=splitA?cell.a:cell.b,L=splitA?A:B,mid=(s.lo+s.hi)/2;if(mid===s.lo||mid===s.hi)return false;for(const half of [node(s.lo,mid,L),node(mid,s.hi,L)])stack.push({a:splitA?half:cell.a,b:splitA?cell.b:half,depth:cell.depth+1});return true;}
   while(stack.length){if(++visits>budget)return{status:'budget',candidates:[],visits};const cell=stack.pop();if(!overlap(cell.a.box,cell.b.box))continue;let t=(cell.a.lo+cell.a.hi)/2,u=(cell.b.lo+cell.b.hi)/2;
    const small=Math.max(sizeOf(cell.a.box),sizeOf(cell.b.box))<=eps*8;
    if(small||cell.depth>=82){for(let i=0;i<35;i++){const p=A.at(t),q=B.at(u),fx=p.point.x-q.point.x,fy=p.point.y-q.point.y,v=p.derivative,w=q.derivative,den=v.y*w.x-v.x*w.y;if(Math.abs(den)<1e-22)break;const dt=(fx*w.y-fy*w.x)/den,du=(v.y*fx-v.x*fy)/den,nt=Math.max(cell.a.lo,Math.min(cell.a.hi,t+dt)),nu=Math.max(cell.b.lo,Math.min(cell.b.hi,u+du));if(Math.abs(nt-t)+Math.abs(nu-u)<1e-15){t=nt;u=nu;break;}t=nt;u=nu;}
     const p=A.at(t),q=B.at(u);if(dist(p.point,q.point)>eps){if(cell.depth>=82||!split(cell))return{status:'unresolved',reason:'residual-depth',residual:dist(p.point,q.point)*size,boxes:[sizeOf(cell.a.box)*size,sizeOf(cell.b.box)*size],parameters:[cell.a.lo,cell.a.hi,cell.b.lo,cell.b.hi],candidates:[],visits};continue;}const center=world({x:(p.point.x+q.point.x)/2,y:(p.point.y+q.point.y)/2}),tangentA=world(p.contact),tangentB=world(q.contact);if(dist(tangentA,tangentB)<1e-7)continue;if(Math.abs(dist(center,tangentA)-r)>1e-6||Math.abs(dist(center,tangentB)-r)>1e-6)return{status:'unresolved',candidates:[],visits};if(!out.some(v=>dist(v.center,center)<1e-6&&dist(v.tangentA,tangentA)<1e-6&&dist(v.tangentB,tangentB)<1e-6))out.push({center,radius:r,tangentA,tangentB,ellipseParameterA:t,ellipseParameterB:u,score:dist(tangentA,pa)+dist(tangentB,pb)});continue;
    }
    if(!split(cell))return{status:'unresolved',candidates:[],visits};
   }
  }return{status:'ok',visits,candidates:out.sort((a,b)=>a.score-b.score)};
 }
 M.cadConicPairFillet=Object.freeze({locus,solve});
})();
