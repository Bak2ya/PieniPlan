/* One semantic stair owns its footprint. Treads and arrow are derived vectors, never walls. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y}),mul=(a,n)=>({x:a.x*n,y:a.y*n});
 function frame(o){const p=o?.polygon;if(!p||p.length!==4)return null;const w={x:p[1].x-p[0].x,y:p[1].y-p[0].y},l={x:p[3].x-p[0].x,y:p[3].y-p[0].y},width=Math.hypot(w.x,w.y),length=Math.hypot(l.x,l.y);if(width<1e-6||length<1e-6)return null;return{origin:p[0],u:mul(w,1/width),v:mul(l,1/length),width,length,rotation:Math.atan2(w.y,w.x)*180/Math.PI};}
 function footprint(origin,width,length,rotation=0){if(![origin.x,origin.y,width,length,rotation].every(Number.isFinite)||width<=0||length<=0)throw new Error('invalid-stair-size');const a=rotation*Math.PI/180,u={x:Math.cos(a),y:Math.sin(a)},v={x:-u.y,y:u.x};return[origin,add(origin,mul(u,width)),add(add(origin,mul(u,width)),mul(v,length)),add(origin,mul(v,length))].map(p=>({...p}));}
 const capability='plan.stair.direction.v1',labelCapability='plan.stair.label-size.v1',directionDefaults=()=>({version:1,arrowSense:'up',showLabel:true});
 function rectangular(o){const f=frame(o),p=o?.polygon;return Boolean(f&&p.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y))&&Math.abs(f.u.x*f.v.x+f.u.y*f.v.y)<1e-8&&Math.hypot(p[2].x-(p[1].x+p[3].x-p[0].x),p[2].y-(p[1].y+p[3].y-p[0].y))<=1e-7*Math.max(1,f.width,f.length));}
 function validate(o){
  if(Object.hasOwn(o||{},'label106')){const a=o.label106;if(o.type!=='stair'||!a||Object.keys(a).some(k=>!['version','mode','height'].includes(k))||a.version!==1||!['auto','manual'].includes(a.mode)||!rectangular(o)||a.mode==='manual'&&(!Number.isFinite(a.height)||a.height<=0||a.height>100000)||a.mode==='auto'&&Object.hasOwn(a,'height'))throw Error('invalid-stair-label');}
  if(!Object.hasOwn(o||{},'direction102'))return o;
  const d=o.direction102,f=frame(o),p=o.polygon;
  if(o.type!=='stair'||!d||Object.keys(d).some(k=>!['version','arrowSense','showLabel'].includes(k))||d.version!==1||!['up','down'].includes(d.arrowSense)||typeof d.showLabel!=='boolean'||!f||!p.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y))||Math.abs(f.u.x*f.v.x+f.u.y*f.v.y)>1e-8||Math.hypot(p[2].x-(p[1].x+p[3].x-p[0].x),p[2].y-(p[1].y+p[3].y-p[0].y))>1e-7*Math.max(1,f.width,f.length)||![1,-1].includes(o.upDirection??1))throw Error('invalid-stair-direction');
  return o;
 }
 function rotate(o,degrees){const f=frame(o);if(!f||!Number.isFinite(degrees))throw Error('unsupported-stair-footprint');const center=add(add(f.origin,mul(f.u,f.width/2)),mul(f.v,f.length/2)),a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a);const next={...o,polygon:o.polygon.map(p=>({x:center.x+(p.x-center.x)*c-(p.y-center.y)*s,y:center.y+(p.x-center.x)*s+(p.y-center.y)*c}))};validate(next);return next;}
 function edit(o,patch){
  const f=frame(o);if(!f)throw new Error('unsupported-stair-footprint');const width=patch.width??f.width,length=patch.length??f.length,count=patch.treadCount??o.treadCount??12;
  if(!Number.isInteger(count)||count<2||count>256||![1,-1].includes(patch.upDirection??o.upDirection??1)||![width,length].every(n=>Number.isFinite(n)&&n>0))throw new Error('invalid-stair-properties');
  let polygon=o.polygon.map(p=>({...p}));
  if(['width','length','rotation'].some(k=>Object.hasOwn(patch,k))){
   if(!rectangular(o))throw Error('unsupported-stair-footprint');
   let u=f.u,v=f.v;if(Object.hasOwn(patch,'rotation')){if(!Number.isFinite(patch.rotation))throw Error('invalid-stair-properties');const a=patch.rotation*Math.PI/180,hand=f.u.x*f.v.y-f.u.y*f.v.x<0?-1:1;u={x:Math.cos(a),y:Math.sin(a)};v={x:-u.y*hand,y:u.x*hand};}
   polygon=[f.origin,add(f.origin,mul(u,width)),add(add(f.origin,mul(u,width)),mul(v,length)),add(f.origin,mul(v,length))].map(p=>({...p}));
  }
  if(Object.hasOwn(patch,'x')||Object.hasOwn(patch,'y')){const x=patch.x??f.origin.x,y=patch.y??f.origin.y;if(![x,y].every(Number.isFinite))throw Error('invalid-stair-properties');polygon=polygon.map(p=>({x:p.x+x-f.origin.x,y:p.y+y-f.origin.y}));}
  const next={...o,polygon,treadCount:count,upDirection:patch.upDirection??o.upDirection??1,...(Object.hasOwn(patch,'direction102')?{direction102:{...patch.direction102}}:{}),...(Object.hasOwn(patch,'label106')?{label106:{...patch.label106}}:{})};validate(next);return next;
 }

 function handles(o){if(!rectangular(o))return[];return o.polygon.flatMap((p,i,all)=>[{id:'stair-corner:'+i,point:{...p}},{id:'stair-edge:'+i,point:{x:(p.x+all[(i+1)%4].x)/2,y:(p.y+all[(i+1)%4].y)/2}}]);}
 function resize(o,handle,point){
  if(!rectangular(o)||!Number.isFinite(point?.x)||!Number.isFinite(point?.y))throw Error('unsupported-stair-footprint');
  const match=/^stair-(corner|edge):([0-3])$/.exec(handle);if(!match)throw Error('invalid-stair-handle');
  const f=frame(o),i=Number(match[2]),edge=match[1]==='edge',x=(point.x-f.origin.x)*f.u.x+(point.y-f.origin.y)*f.u.y,y=(point.x-f.origin.x)*f.v.x+(point.y-f.origin.y)*f.v.y;
  let x0=0,x1=f.width,y0=0,y1=f.length;
  if(edge?i===3:i===0||i===3)x0=Math.min(x,x1-10);
  if(edge?i===1:i===1||i===2)x1=Math.max(x,x0+10);
  if(edge?i===0:i===0||i===1)y0=Math.min(y,y1-10);
  if(edge?i===2:i===2||i===3)y1=Math.max(y,y0+10);
  const pt=(x,y)=>add(add(f.origin,mul(f.u,x)),mul(f.v,y)),next={...o,polygon:[pt(x0,y0),pt(x1,y0),pt(x1,y1),pt(x0,y1)]};validate(next);return next;
 }

 function segments(o){validate(o);const f=frame(o);if(!f)return(o?.polygon||[]).map((a,i,p)=>({a,b:p[(i+1)%p.length]}));const result=o.polygon.map((a,i,p)=>({a,b:p[(i+1)%p.length]})),n=Math.max(2,Math.min(256,Number(o.treadCount)||12));const pt=(x,y)=>add(add(f.origin,mul(f.u,x)),mul(f.v,y));for(let i=1;i<n;i++)result.push({a:pt(0,f.length*i/n),b:pt(f.width,f.length*i/n)});const reverse=(o.upDirection===-1?-1:1)*(o.direction102?.arrowSense==='down'?-1:1)<0,from=pt(f.width/2,f.length*(reverse?.82:.18)),to=pt(f.width/2,f.length*(reverse?.18:.82)),head=Math.min(f.width*.16,f.length*.08),direction=reverse?-1:1;result.push({a:from,b:to},{a:to,b:add(add(to,mul(f.v,-head*direction)),mul(f.u,head*.6))},{a:to,b:add(add(to,mul(f.v,-head*direction)),mul(f.u,-head*.6))});return result;}
 function annotation(o){validate(o);if(!o.direction102?.showLabel)return null;const f=frame(o),direction=(o.upDirection===-1?-1:1)*(o.direction102.arrowSense==='down'?-1:1),count=Math.max(2,Math.min(256,Number(o.treadCount)||12)),step=f.length/count,slot=Math.max(0,Math.min(count-1,Math.floor(count*(direction>0?.82:.18)))),point=add(add(f.origin,mul(f.u,f.width*.78)),mul(f.v,(slot+.5)*step)),automaticHeight=Math.min(180,f.width*.12,f.length*.04,step*.65),height=o.label106?.mode==='manual'?o.label106.height:automaticHeight;return{text:o.direction102.arrowSense==='down'?'DN':'UP',point,height,automaticHeight,warning:height>Math.min(f.width*.22/.65,step*.8)?'label-overlap':null,rotation:f.rotation};}
 root.planStair=Object.freeze({capability,labelCapability,directionDefaults,validate,frame,footprint,edit,rotate,rectangular,handles,resize,segments,annotation});
})();
