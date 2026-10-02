/* Bounded native CAD operations on existing persistent entity types. */
(() => {
 const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},G=root.geometryQuery,E=G.tolerance.model;
 const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),unit=(a,b)=>{const n=d(a,b);return n>E?{x:(b.x-a.x)/n,y:(b.y-a.y)/n}:null;},add=(p,u,n)=>({x:p.x+u.x*n,y:p.y+u.y*n});
 function offset(e,distance,side){
  if(!(distance>E))return null;
  if(e.type==='cadLine'){const u=unit(e.a,e.b);if(!u)return null;const q=G.projectNearest({...e,mode:'line'},side).point,v={x:-u.y,y:u.x},sign=(side.x-q.x)*v.x+(side.y-q.y)*v.y;if(Math.abs(sign)<=E)return null;const n=Math.sign(sign)*distance;return{before:[],after:[{...e,a:add(e.a,v,n),b:add(e.b,v,n)}]};}
  if(e.type==='cadCircle'||e.type==='cadArc'){const sign=d(side,e.center)-e.radius;if(Math.abs(sign)<=E)return null;const radius=e.radius+Math.sign(sign)*distance;if(radius<=E)return null;return{before:[],after:[{...e,radius}]};}return null;
 }
 function breakLine(e,p1,p2){if(e.type!=='cadLine')return null;const t1=G.projectNearest(e,p1).t,t2=G.projectNearest(e,p2).t,lo=Math.min(t1,t2),hi=Math.max(t1,t2);if((hi-lo)*d(e.a,e.b)<=E)return null;const a=G.projectNearest(e,p1).point,b=G.projectNearest(e,p2).point,from=t1<t2?a:b,to=t1<t2?b:a,after=[];if(lo>0)after.push({...e,b:from});if(hi<1)after.push({...e,a:to});return{before:[e],after,removed:[{type:'cadLine',a:from,b:to}]};}
 function join(a,b){
  if(a.type!=='cadLine'||b.type!=='cadLine'||a.id===b.id)return null;
  // Joining unlike styles/layers would silently lose ownership/appearance.
  if(['cadLayer','color','linetype','lineweight','drawOrder'].some(k=>(a[k]??null)!==(b[k]??null)))return null;
  const u=unit(a.a,a.b);if(!u)return null;
  if([b.a,b.b].some(p=>G.projectNearest({...a,mode:'line'},p).distance>E))return null;
  const t=[G.parameter(a,b.a),G.parameter(a,b.b)].sort((x,y)=>x-y),tol=E/d(a.a,a.b);if(t[0]>1+tol||t[1]<-tol)return null;
  const pts=[a.a,a.b,b.a,b.b].sort((p,q)=>G.parameter(a,p)-G.parameter(a,q));return{before:[a,b],after:[{...a,a:{...pts[0]},b:{...pts[3]}}]};
 }
 function fillet(a,pa,b,pb,radius){
  if(a.type!=='cadLine'||b.type!=='cadLine'||a.id===b.id||!(radius>E))return null;
  const hits=G.intersections({...a,mode:'line'},{...b,mode:'line'});if(hits.length!==1)return null;const origin=hits[0];
  const side=(e,p)=>{const t=G.parameter(e,origin),tp=G.parameter(e,p),end=tp>=t?'b':'a',far=e[end],u=unit(origin,far);return u?{far,u,move:end==='a'?'b':'a'}:null;};
  const x=side(a,pa),y=side(b,pb);if(!x||!y)return null;const dot=Math.max(-1,Math.min(1,x.u.x*y.u.x+x.u.y*y.u.y)),angle=Math.acos(dot);if(angle<1e-8||Math.PI-angle<1e-8)return null;
  const length=radius/Math.tan(angle/2);if(length>=d(origin,x.far)-E||length>=d(origin,y.far)-E)return null;
  const bis=unit({x:0,y:0},{x:x.u.x+y.u.x,y:x.u.y+y.u.y}),center=add(origin,bis,radius/Math.sin(angle/2)),p=add(origin,x.u,length),q=add(origin,y.u,length),startAngle=Math.atan2(p.y-center.y,p.x-center.x)*180/Math.PI,end=Math.atan2(q.y-center.y,q.x-center.x)*180/Math.PI,sweep=((end-startAngle+540)%360)-180;
  return{before:[a,b],after:[{...a,[x.move]:p},{...b,[y.move]:q},{type:'cadArc',cadLayer:a.cadLayer||'0',color:a.color??null,linetype:a.linetype??null,lineweight:a.lineweight??null,center,radius,startAngle,sweep}]};
 }

 function chamfer(a,pa,b,pb,distance){
  if(a.type!=='cadLine'||b.type!=='cadLine'||a.id===b.id||!(distance>E))return null;
  if(['cadLayer','color','linetype','lineweight','drawOrder'].some(k=>(a[k]??null)!==(b[k]??null)))return null;
  const hits=G.intersections({...a,mode:'line'},{...b,mode:'line'});if(hits.length!==1)return null;const origin=hits[0];
  const side=(e,p)=>{const t=G.parameter(e,origin),tp=G.parameter(e,p),end=tp>=t?'b':'a',far=e[end],u=unit(origin,far);return u?{far,u,move:end==='a'?'b':'a'}:null;};
  const x=side(a,pa),y=side(b,pb);if(!x||!y||distance>=d(origin,x.far)-E||distance>=d(origin,y.far)-E)return null;
  const p=add(origin,x.u,distance),q=add(origin,y.u,distance);if(d(p,q)<=E)return null;
  return{before:[a,b],after:[{...a,[x.move]:p},{...b,[y.move]:q},{type:'cadLine',cadLayer:a.cadLayer||'0',color:a.color??null,linetype:a.linetype??null,lineweight:a.lineweight??null,drawOrder:a.drawOrder??null,a:p,b:q}]};
 }
 root.cadLinearOperations=Object.freeze({offset,breakLine,join,fillet,chamfer});
})();
