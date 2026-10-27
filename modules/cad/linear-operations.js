/* Bounded native CAD operations on existing persistent entity types. */
(() => {
 const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},G=root.geometryQuery,E=G.tolerance.model;
 const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),unit=(a,b)=>{const n=d(a,b);return n>E?{x:(b.x-a.x)/n,y:(b.y-a.y)/n}:null;},add=(p,u,n)=>({x:p.x+u.x*n,y:p.y+u.y*n});
 function offset(e,distance,side){
  if(!(distance>E))return null;
  if(e.type==='cadLine'){const u=unit(e.a,e.b);if(!u)return null;const q=G.projectNearest({...e,mode:'line'},side).point,v={x:-u.y,y:u.x},sign=(side.x-q.x)*v.x+(side.y-q.y)*v.y;if(Math.abs(sign)<=E)return null;const n=Math.sign(sign)*distance;return{before:[],after:[{...e,a:add(e.a,v,n),b:add(e.b,v,n)}]};}
  if(e.type==='cadCircle'||e.type==='cadArc'){const sign=d(side,e.center)-e.radius;if(Math.abs(sign)<=E)return null;const radius=e.radius+Math.sign(sign)*distance;if(radius<=E)return null;return{before:[],after:[{...e,radius}]};}return null;
 }
 function breakLine(e,p1,p2){if(e.type!=='cadLine')return null;const t1=G.projectNearest(e,p1).t,t2=G.projectNearest(e,p2).t,lo=Math.min(t1,t2),hi=Math.max(t1,t2);if((hi-lo)*d(e.a,e.b)<=E){if(lo<=0||lo>=1)return null;const point=G.projectNearest(e,p1).point;return{before:[e],after:[{...e,b:{...point}},{...e,a:{...point}}],removed:[]};}const a=G.projectNearest(e,p1).point,b=G.projectNearest(e,p2).point,from=t1<t2?a:b,to=t1<t2?b:a,after=[];if(lo>0)after.push({...e,b:from});if(hi<1)after.push({...e,a:to});return{before:[e],after,removed:[{type:'cadLine',a:from,b:to}]};}
 function join(a,b){
  if(a.type!=='cadLine'||b.type!=='cadLine'||a.id===b.id)return null;
  // Joining unlike styles/layers would silently lose ownership/appearance.
  if(['cadLayer','color','linetype','lineweight','drawOrder'].some(k=>(a[k]??null)!==(b[k]??null)))return null;
  const u=unit(a.a,a.b);if(!u)return null;
  if([b.a,b.b].some(p=>G.projectNearest({...a,mode:'line'},p).distance>E))return null;
  const t=[G.parameter(a,b.a),G.parameter(a,b.b)].sort((x,y)=>x-y),tol=E/d(a.a,a.b);if(t[0]>1+tol||t[1]<-tol)return null;
  const pts=[a.a,a.b,b.a,b.b].sort((p,q)=>G.parameter(a,p)-G.parameter(a,q));return{before:[a,b],after:[{...a,a:{...pts[0]},b:{...pts[3]}}]};
 }
 function filletTrim(o,p,pick){
  if(['cadRay','cadXline'].includes(o.type))return root.cadConstructionCorners?.trim(o,p,pick)||null;
  if(o.type==='cadCircle')return o;
  if(o.type==='cadLine'){const t=G.parameter(o,p),tp=G.parameter(o,pick);if(Math.abs(t-tp)<1e-10)return d(p,o.a)<=E||d(p,o.b)<=E?o:null;const key=tp<t?'b':'a';if(d(o[key],p)<=E)return o;const q={...o,[key]:{...p}};return d(q.a,q.b)>E?q:null;}
  if(root.cadEllipse?.is(o)){const C=root.cadEllipse,T=C.TAU;if(C.full(o))return o;const norm=n=>(n%T+T)%T,sign=Math.sign(o.sweepParam),angle=C.parameter(o,p),t=norm((angle-o.startParam)*sign),width=Math.abs(o.sweepParam),tol=1e-9;if(t<tol||T-t<tol||Math.abs(t-width)<tol)return o;if(t<width){const tp=norm((C.parameter(o,C.nearest(o,pick).point)-o.startParam)*sign);if(Math.abs(tp-t)<tol)return null;return tp<t?{...o,sweepParam:sign*t}:{...o,startParam:o.startParam+sign*t,sweepParam:sign*(width-t)};}const endCost=t-width,startCost=T-t;if(Math.abs(endCost-startCost)<tol)return null;return endCost<startCost?{...o,sweepParam:sign*t}:{...o,startParam:angle,sweepParam:sign*(width+startCost)};}
  if(o.type!=='cadArc')return null;const norm=n=>(n%360+360)%360,sign=Math.sign(o.sweep),angle=Math.atan2(p.y-o.center.y,p.x-o.center.x)*180/Math.PI,t=norm((angle-o.startAngle)*sign),width=Math.abs(o.sweep),tol=1e-7;
  if(t<tol||360-t<tol||Math.abs(t-width)<tol)return o;
  if(t<width){const pickAngle=Math.atan2(pick.y-o.center.y,pick.x-o.center.x)*180/Math.PI,tp=norm((pickAngle-o.startAngle)*sign);if(Math.abs(tp-t)<tol)return null;return tp<t?{...o,sweep:sign*t}:{...o,startAngle:o.startAngle+sign*t,sweep:sign*(width-t)};}
  const endCost=t-width,startCost=360-t;if(Math.abs(endCost-startCost)<tol)return null;
  return endCost<startCost?{...o,sweep:sign*t}:{...o,startAngle:angle,sweep:sign*(width+startCost)};
 }
 function filletSweep(center,a,b,sourceA,sourceB){const direction=(o,p,enter)=>{if(!o||o.type==='cadCircle'||root.cadEllipse?.is(o)&&root.cadEllipse.full(o))return null;let v;if(root.cadFittedOperations?.is(o)){if(o.closed)return null;const es=root.cadPolyline.get(o).edges,atEnd=d(es.at(-1).controls.at(-1),p)<d(es[0].controls[0],p),dv=root.cadBezier.derivative(atEnd?es.at(-1):es[0],atEnd?1:0),len=Math.hypot(dv.x,dv.y),sign=atEnd?1:-1;if(len<E)return null;v={x:dv.x/len*sign,y:dv.y/len*sign};}else if(o.type==='cadRay'){v=unit(o.b,o.a);}else if(o.type==='cadLine'){const far=d(o.a,p)<d(o.b,p)?o.b:o.a;v=unit(far,p);}else if(root.cadEllipse?.is(o)){const C=root.cadEllipse,atEnd=d(C.at(o,1),p)<d(C.at(o,0),p),t=C.parameter(o,p),dv=root.cadConicFillet.derivative(o,t),len=Math.hypot(dv.x,dv.y),sign=Math.sign(o.sweepParam)*(atEnd?1:-1);v={x:dv.x/len*sign,y:dv.y/len*sign};}else if(o.type==='cadArc'){const atEnd=d(G.pointAt(o,o.startAngle+o.sweep),p)<d(G.pointAt(o,o.startAngle),p),sign=Math.sign(o.sweep)*(atEnd?1:-1),rx=(p.x-o.center.x)/o.radius,ry=(p.y-o.center.y)/o.radius;v={x:-ry*sign,y:rx*sign};}return !v?null:enter?v:{x:-v.x,y:-v.y};},startAngle=Math.atan2(a.y-center.y,a.x-center.x)*180/Math.PI,endAngle=Math.atan2(b.y-center.y,b.x-center.x)*180/Math.PI,ccw=((endAngle-startAngle)%360+360)%360,ta=direction(sourceA,a,true),tb=direction(sourceB,b,false);
  for(const sweep of [ccw,ccw-360]){if(Math.abs(sweep)<1e-8||Math.abs(sweep)>180+1e-7)continue;const sign=Math.sign(sweep),tangent=p=>{const r=d(center,p);return{x:-(p.y-center.y)/r*sign,y:(p.x-center.x)/r*sign};},x=tangent(a),y=tangent(b);if(ta&&x.x*ta.x+x.y*ta.y<1-1e-6||tb&&y.x*tb.x+y.y*tb.y<1-1e-6)continue;return{startAngle,sweep};}return null;
 }
 function sharpCurves(a,pa,b,pb,{trim=true}={}){const support=o=>root.cadEllipse?.is(o)?{...o,startParam:0,sweepParam:root.cadEllipse.TAU}:o.type==='cadArc'?{...o,type:'cadCircle'}:o.type==='cadLine'?{...o,mode:'line'}:o,candidates=G.intersections(support(a),support(b)).sort((p,q)=>d(p,pa)+d(p,pb)-d(q,pa)-d(q,pb));if(!candidates.length)return null;if(!trim)return{before:[],after:[],noChange:true};
  for(const point of candidates){const before=[],after=[];let valid=true;for(const[o,pick]of [[a,pa],[b,pb]]){const q=filletTrim(o,point,pick);if(!q){valid=false;break;}if(q!==o){before.push(o);after.push(q);}}if(valid)return after.length?{before,after}:{before:[],after:[],noChange:true};}return null;
 }
 function parallelFillet(a,pa,b,pb,{trim,layer}){const u=unit(a.a,a.b),v=unit(b.a,b.b);if(!u||!v||Math.abs(u.x*v.y-u.y*v.x)>1e-10)return null;const contactA=d(a.a,pa)<d(a.b,pa)?a.a:a.b,contactB=G.projectNearest({...b,mode:'line'},contactA)?.point,radius=contactB&&d(contactA,contactB)/2;if(!(radius>E))return null;const center={x:(contactA.x+contactB.x)/2,y:(contactA.y+contactB.y)/2},sourceB=trim?filletTrim(b,contactB,pb):b;if(!sourceB)return null;const arc=filletSweep(center,contactA,contactB,a,trim?sourceB:null);if(!arc)return null;
  return{before:trim&&sourceB!==b?[b]:[],after:[...(trim&&sourceB!==b?[sourceB]:[]),{type:'cadArc',cadLayer:(a.cadLayer||'0')===(b.cadLayer||'0')?(a.cadLayer||'0'):(layer||a.cadLayer||'0'),color:a.color??null,linetype:a.linetype??null,lineweight:a.lineweight??null,center,radius,...arc}]};
 }
 function fillet(a,pa,b,pb,radius,{trim=true,layer=null}={}){
  if(!Number.isFinite(radius)||radius<0||a.id===b.id)return null;
  if(root.cadSplineFillet?.is(a)||root.cadSplineFillet?.is(b))return root.cadSplineFillet.fillet(a,pa,b,pb,radius,{trim,layer});
  if([a,b].some(o=>['cadRay','cadXline'].includes(o.type)))return root.cadConstructionCorners?.fillet(a,pa,b,pb,radius,{trim,layer})||null;
  if(a.type!=='cadLine'||b.type!=='cadLine'){
   if(![a,b].every(o=>['cadLine','cadArc','cadCircle','cadEllipse'].includes(o.type)))return null;if(radius<=E)return sharpCurves(a,pa,b,pb,{trim});const candidates=root.cadEllipse?.is(a)||root.cadEllipse?.is(b)?root.cadConicFillet?.candidates(a,b,radius,pa,pb,{extend:trim})||[]:root.cadCreation?.tangentPair(a,b,radius,pa,pb,{extendArcs:true,all:true})||[];
   for(const q of candidates){const sourceA=trim?filletTrim(a,q.tangentA,pa):a,sourceB=trim?filletTrim(b,q.tangentB,pb):b;if(!sourceA||!sourceB)continue;const arc=filletSweep(q.center,q.tangentA,q.tangentB,trim?sourceA:null,trim?sourceB:null);if(!arc)continue;const before=[],after=[];if(trim)for(const[o,result]of [[a,sourceA],[b,sourceB]])if(result!==o){before.push(o);after.push(result);}
    after.push({type:'cadArc',cadLayer:(a.cadLayer||'0')===(b.cadLayer||'0')?(a.cadLayer||'0'):(layer||a.cadLayer||'0'),color:a.color??null,linetype:a.linetype??null,lineweight:a.lineweight??null,center:q.center,radius,...arc});return{before,after};
   }return null;
  }

  if(a.type!=='cadLine'||b.type!=='cadLine'||a.id===b.id||!(radius>=0))return null;
  const hits=G.intersections({...a,mode:'line'},{...b,mode:'line'});if(hits.length!==1)return parallelFillet(a,pa,b,pb,{trim,layer});const origin=hits[0];
  const side=(e,p)=>{const t=G.parameter(e,origin),tp=G.parameter(e,p),end=tp>=t?'b':'a',far=e[end],u=unit(origin,far);return u?{far,u,move:end==='a'?'b':'a'}:null;};
  const x=side(a,pa),y=side(b,pb);if(!x||!y)return null;const dot=Math.max(-1,Math.min(1,x.u.x*y.u.x+x.u.y*y.u.y)),angle=Math.acos(dot);if(angle<1e-8||Math.PI-angle<1e-8)return null;
  if(radius<=E)return !trim||d(a[x.move],origin)<=E&&d(b[y.move],origin)<=E?{before:[],after:[],noChange:true}:{before:[a,b],after:[{...a,[x.move]:{x:origin.x,y:origin.y}},{...b,[y.move]:{x:origin.x,y:origin.y}}]};
  const length=radius/Math.tan(angle/2);if(length>=d(origin,x.far)-E||length>=d(origin,y.far)-E)return null;
  const bis=unit({x:0,y:0},{x:x.u.x+y.u.x,y:x.u.y+y.u.y}),center=add(origin,bis,radius/Math.sin(angle/2)),p=add(origin,x.u,length),q=add(origin,y.u,length),startAngle=Math.atan2(p.y-center.y,p.x-center.x)*180/Math.PI,end=Math.atan2(q.y-center.y,q.x-center.x)*180/Math.PI,sweep=((end-startAngle+540)%360)-180;
  return{before:trim?[a,b]:[],after:[...(trim?[{...a,[x.move]:p},{...b,[y.move]:q}]:[]),{type:'cadArc',cadLayer:(a.cadLayer||'0')===(b.cadLayer||'0')?(a.cadLayer||'0'):(layer||a.cadLayer||'0'),color:a.color??null,linetype:a.linetype??null,lineweight:a.lineweight??null,center,radius,startAngle,sweep}]};
 }

 function chamfer(a,pa,b,pb,distance,{distance2=distance,angle=null,trim=true,layer=null}={}){
  if(distance===0&&angle===0){distance2=0;angle=null;}
  if([a,b].some(o=>['cadRay','cadXline'].includes(o.type)))return root.cadConstructionCorners?.chamfer(a,pa,b,pb,distance,{distance2,angle,trim,layer})||null;
  if(a.type!=='cadLine'||b.type!=='cadLine'||a.id===b.id||!(distance>=0)||!(distance2>=0))return null;
  const hits=G.intersections({...a,mode:'line'},{...b,mode:'line'});if(hits.length!==1)return null;const origin=hits[0];
  const side=(e,p)=>{const t=G.parameter(e,origin),tp=G.parameter(e,p),end=tp>=t?'b':'a',far=e[end],u=unit(origin,far);return u?{far,u,move:end==='a'?'b':'a'}:null;};
  const x=side(a,pa),y=side(b,pb);if(!x||!y)return null;if(angle!==null){const theta=Math.acos(Math.max(-1,Math.min(1,x.u.x*y.u.x+x.u.y*y.u.y))),alpha=angle*Math.PI/180;if(!(alpha>1e-8&&theta+alpha<Math.PI-1e-8))return null;distance2=distance*Math.sin(alpha)/Math.sin(theta+alpha);}if(distance>=d(origin,x.far)-E||distance2>=d(origin,y.far)-E)return null;
  const p=add(origin,x.u,distance),q=add(origin,y.u,distance2);if(d(p,q)<=E)return !trim||d(a[x.move],p)<=E&&d(b[y.move],q)<=E?{before:[],after:[],noChange:true}:{before:[a,b],after:[{...a,[x.move]:p},{...b,[y.move]:q}]};
  return{before:trim?[a,b]:[],after:[...(trim?[{...a,[x.move]:p},{...b,[y.move]:q}]:[]),{type:'cadLine',cadLayer:(a.cadLayer||'0')===(b.cadLayer||'0')?(a.cadLayer||'0'):(layer||a.cadLayer||'0'),color:a.color??null,linetype:a.linetype??null,lineweight:a.lineweight??null,drawOrder:a.drawOrder??null,a:p,b:q}]};
 }
 root.cadLinearOperations=Object.freeze({offset,breakLine,join,fillet,chamfer,trimAtContact:filletTrim,sweepAtContacts:filletSweep});
})();
