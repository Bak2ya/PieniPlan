/* Detached CAD grip plans. Vertex/edge identities and polyline bulges survive. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const clone=o=>JSON.parse(JSON.stringify(o)),mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  function handles(o){
    const out=[],add=(key,point,kind='vertex',indices=[])=>out.push({objectId:o.id,key,point:{...point},kind,indices});
    if(o.type==='cadLine'){add('a',o.a);add('b',o.b);add('mid',mid(o.a,o.b),'move');}
    else if(root.cadPolyline.is(o)&&o.vertices.length<=500){
      o.vertices.forEach((v,i)=>add('v:'+i,v,'vertex',[i]));
      if(!o.curveFit)for(let i=0;i<o.vertices.length-(o.closed?0:1);i++){const j=(i+1)%o.vertices.length;if(Math.abs(o.vertices[i].outgoing?.bulge||0)<1e-10)add('e:'+i,mid(o.vertices[i],o.vertices[j]),'edge',[i,j]);else{const e=root.cadPolyline.get(o).edges[i];add('arcMid:'+i,root.geometryQuery.pointAt(e,e.startAngle+e.sweep/2),'bulge',[i,j]);}}
    }else if(root.cadEllipse?.is(o)){const e=root.cadEllipse;add('center',o.center,'move');for(const [key,t]of [['ellipseMajor',0],['ellipseMinor',Math.PI/2]])add(key,e.point(o,t),'ellipseAxis');if(!e.full(o)){add('ellipseStart',e.at(o,0),'ellipseEnd');add('ellipseEnd',e.at(o,1),'ellipseEnd');}
    }else if(['cadCircle','cadArc'].includes(o.type)){
      add('center',o.center,'move');if(o.type==='cadArc'){add('arcStart',root.geometryQuery.pointAt(o,o.startAngle),'arcEndpoint');add('arcEnd',root.geometryQuery.pointAt(o,o.startAngle+o.sweep),'arcEndpoint');add('arcMid',root.geometryQuery.pointAt(o,o.startAngle+o.sweep/2),'arcMidpoint');}if(o.type==='cadCircle')for(const a of [0,90,180,270])add('radius:'+a,root.geometryQuery.pointAt(o,a),'radius');
    }else if(o.type==='cadInsert')add('insert',{x:o.matrix.tx,y:o.matrix.ty},'move');
    else if(['cadText','cadPoint'].includes(o.type)&&o.point)add('point',o.point,'move');
    return out;
  }
  function stretch(o,hot,delta,target){
    if(hot.some(h=>h.kind==='move'))return root.cadTransformOperations.transform(o,root.cadTransformOperations.translate(delta.x,delta.y));
    const q=clone(o);
    if(q.type==='cadLine'){for(const k of ['a','b'])if(hot.some(h=>h.key===k))q[k]={x:q[k].x+delta.x,y:q[k].y+delta.y};if(Math.hypot(q.b.x-q.a.x,q.b.y-q.a.y)<1e-8)return null;}
    else if(root.cadPolyline.is(q)){if(hot.some(h=>h.kind==='bulge')){if(hot.length!==1)return null;const [i,j]=hot[0].indices,g=root.cadCreation.arc3(q.vertices[i],q.vertices[j],target);if(!g)return null;q.vertices[i].outgoing.bulge=Math.tan(g.sweep*Math.PI/720);try{return root.cadPolyline.validate(q);}catch{return null;}}const indices=new Set(hot.flatMap(h=>h.indices));q.vertices.forEach((v,i)=>{if(indices.has(i)){v.x+=delta.x;v.y+=delta.y;}});try{root.cadPolyline.validate(q);}catch{return null;}}
    else if(root.cadEllipse?.is(q)&&hot.length===1){const e=root.cadEllipse,h=hot[0];if(h.kind==='ellipseAxis'){const a=Math.hypot(q.major.x,q.major.y),b=a*q.ratio;if(h.key==='ellipseMajor'){const axis={x:target.x-q.center.x,y:target.y-q.center.y},g=e.create(q.center,axis,b,q.startParam,q.sweepParam);if(!g)return null;Object.assign(q,g);}else{const g=e.create(q.center,q.major,Math.hypot(target.x-q.center.x,target.y-q.center.y),q.startParam,q.sweepParam);if(!g)return null;Object.assign(q,g);}}else if(h.kind==='ellipseEnd'){const t=e.parameter(q,target),end=q.startParam+q.sweepParam,sign=Math.sign(q.sweepParam),norm=n=>(n%e.TAU+e.TAU)%e.TAU;if(h.key==='ellipseStart'){q.startParam=t;q.sweepParam=sign*norm((end-t)*sign);}else q.sweepParam=sign*norm((t-q.startParam)*sign);if(Math.abs(q.sweepParam)<1e-9)return null;}else return null;}
    else if(q.type==='cadCircle'&&hot.length===1&&hot[0].kind==='radius'){q.radius=Math.hypot(target.x-q.center.x,target.y-q.center.y);if(q.radius<1e-8)return null;}
    else if(q.type==='cadArc'&&hot.length===1){const h=hot[0],G=root.geometryQuery,start=h.key==='arcStart'?target:G.pointAt(q,q.startAngle),end=h.key==='arcEnd'?target:G.pointAt(q,q.startAngle+q.sweep),through=h.key==='arcMid'?target:G.pointAt(q,q.startAngle+q.sweep/2),g=root.cadCreation.arc3(start,end,through);if(!g)return null;Object.assign(q,g);}
    else return null;
    return q;
  }
  function plan(objects,hot,{base,target,mode='stretch',copy=false,value=null,referenceLength=1}){
    if(!base||!target)return null;
    const delta={x:target.x-base.x,y:target.y-base.y};let matrix=null;
    if(mode==='move')matrix=root.cadTransformOperations.translate(delta.x,delta.y);
    if(mode==='rotate')matrix=root.cadTransformOperations.rotate(base,value??Math.atan2(delta.y,delta.x)*180/Math.PI);
    if(mode==='scale')matrix=root.cadTransformOperations.scale(base,value??Math.hypot(delta.x,delta.y)/referenceLength);
    if(mode==='mirror')matrix=root.cadTransformOperations.mirror(base,target);
    if(mode!=='stretch'&&!matrix)return null;
    const before=[],after=[];
    for(const o of objects){const h=hot.filter(h=>h.objectId===o.id);if(!h.length)continue;const q=matrix?root.cadTransformOperations.transform(o,matrix):stretch(o,h,delta,target);if(!q)return null;before.push(o);after.push(q);}
    return after.length?{before,after,copy}:null;
  }
  root.cadGrips=Object.freeze({handles,plan,modes:['stretch','move','rotate','scale','mirror']});
})();
