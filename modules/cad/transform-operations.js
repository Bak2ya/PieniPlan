/* Build55 CAD Core 2: uniform similarity transforms for persistent CAD entities. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const finite = Number.isFinite;
  const EPS = 1e-10;
  const point = (m,p)=>({x:m.a*p.x+m.c*p.y+m.tx,y:m.b*p.x+m.d*p.y+m.ty});
  const det = m=>m.a*m.d-m.b*m.c;
  const scaleOf = m=>Math.hypot(m.a,m.b);
  const identity = ()=>({a:1,b:0,c:0,d:1,tx:0,ty:0});
  function multiply(A,B){return{a:A.a*B.a+A.c*B.b,b:A.b*B.a+A.d*B.b,c:A.a*B.c+A.c*B.d,d:A.b*B.c+A.d*B.d,tx:A.a*B.tx+A.c*B.ty+A.tx,ty:A.b*B.tx+A.d*B.ty+A.ty};}
  const translate=(dx,dy)=>({a:1,b:0,c:0,d:1,tx:dx,ty:dy});
  function around(base,M){return multiply(translate(base.x,base.y),multiply(M,translate(-base.x,-base.y)));}
  function rotate(base,degrees){const r=degrees*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return around(base,{a:c,b:s,c:-s,d:c,tx:0,ty:0});}
  function scale(base,factor){if(!(factor>EPS))return null;return around(base,{a:factor,b:0,c:0,d:factor,tx:0,ty:0});}
  function mirror(a,b){const dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy);if(!(n>EPS))return null;const ux=dx/n,uy=dy/n;return around(a,{a:2*ux*ux-1,b:2*ux*uy,c:2*ux*uy,d:2*uy*uy-1,tx:0,ty:0});}
  function align(s1,s2,t1,t2,{scale:allowScale=false}={}){const su={x:s2.x-s1.x,y:s2.y-s1.y},tu={x:t2.x-t1.x,y:t2.y-t1.y},sl=Math.hypot(su.x,su.y),tl=Math.hypot(tu.x,tu.y);if(!(sl>EPS&&tl>EPS))return null;const a1=Math.atan2(su.y,su.x),a2=Math.atan2(tu.y,tu.x),r=a2-a1,f=allowScale?tl/sl:1,c=Math.cos(r)*f,s=Math.sin(r)*f;return multiply(translate(t1.x,t1.y),multiply({a:c,b:s,c:-s,d:c,tx:0,ty:0},translate(-s1.x,-s1.y)));}
  function validMatrix(m){if(!m||![m.a,m.b,m.c,m.d,m.tx,m.ty].every(finite))return false;const sx=Math.hypot(m.a,m.b),sy=Math.hypot(m.c,m.d);return sx>EPS&&sy>EPS&&Math.abs(sx-sy)<=1e-8*Math.max(sx,sy)&&Math.abs(m.a*m.c+m.b*m.d)<=1e-8*sx*sy;}
  function transformedAngle(m,degrees){const r=degrees*Math.PI/180,v={x:Math.cos(r),y:Math.sin(r)},q={x:m.a*v.x+m.c*v.y,y:m.b*v.x+m.d*v.y};return Math.atan2(q.y,q.x)*180/Math.PI;}
  function arc(o,m){const s=scaleOf(m),sign=Math.sign(det(m))||1;return{...o,center:point(m,o.center),radius:o.radius*s,startAngle:transformedAngle(m,o.startAngle||0),sweep:(o.sweep||0)*sign};}
  function dimension(o,m){
    const kind=o.kind||'aligned',s=scaleOf(m);let out={...o};
    if(kind==='joggedRadius')out=root.cadJoggedRadius.transform(o,m);
    else if(kind==='arcLength')out=root.cadArcLength.transform(o,m);
    else if(kind==='ordinate')out=root.cadOrdinate.transform(o,m);
    else if(kind==='linear'){const p1=point(m,o.p1),p2=point(m,o.p2),g=root.cadAnnotation2.linear(o),dimensionAngle=transformedAngle(m,o.dimensionAngle),a=dimensionAngle*Math.PI/180,d=g?point(m,g.d1):p1;out={...o,p1,p2,dimensionAngle,offset:(d.x-p1.x)*(-Math.sin(a))+(d.y-p1.y)*Math.cos(a)};}
    else if(kind==='aligned'){const p1=point(m,o.p1),p2=point(m,o.p2),dx=o.p2.x-o.p1.x,dy=o.p2.y-o.p1.y,len=Math.hypot(dx,dy);let offset=Number(o.offset)||0;if(len>EPS){const nx=-dy/len,ny=dx/len,d1={x:o.p1.x+nx*offset,y:o.p1.y+ny*offset},td1=point(m,d1),ndx=p2.x-p1.x,ndy=p2.y-p1.y,nlen=Math.hypot(ndx,ndy);if(nlen>EPS)offset=(td1.x-p1.x)*(-ndy/nlen)+(td1.y-p1.y)*(ndx/nlen);}out={...o,p1,p2,offset};}
    else if(kind==='radius'||kind==='diameter')out={...o,center:point(m,o.center),radius:o.radius*s,labelPoint:point(m,o.labelPoint)};
    else if(kind==='angular'&&o.angularPlacement98)out=root.cadAngularPlacement.transform(o,m);
    else if(kind==='angular')out={...o,vertex:point(m,o.vertex),ray1:point(m,o.ray1),ray2:point(m,o.ray2),radius:(Number(o.radius)||1)*s,labelPoint:o.labelPoint?point(m,o.labelPoint):undefined};
    if(!out)return null;if(out.radialOptions99){out=root.cadRadialPlacement.transform(out,m);if(!out)return null;}if(out.linearOptions99){out=root.cadLinearPlacement.transform(out,m);if(!out)return null;}if(out.oblique104)out=root.cadDimensionOblique.transform(out,m);out=root.cadDimensionText?.transform(out,m)||out;if(root.cadAnnotation2)out.segments=root.cadAnnotation2.segments(out);else if(Array.isArray(o.segments))out.segments=o.segments.map(seg=>({a:point(m,seg.a),b:point(m,seg.b)}));return out;
  }
  function transform(o,m){if(!validMatrix(m)||!o)return null;const s=scaleOf(m),sign=Math.sign(det(m))||1;
    if(root.cadPolyline?.is(o))return root.cadPolyline.transform(o,m);
    if(root.cadEllipse?.is(o))return root.cadEllipse.transform(o,m);
    if(o.type==='cadPoint')return{...o,point:point(m,o.point)};
    if(o.type==='cadInsert')return{...o,matrix:multiply(m,o.matrix)};
    if(['cadLine','cadRay','cadXline'].includes(o.type))return{...o,a:point(m,o.a),b:point(m,o.b)};
    if(o.type==='cadCircle')return{...o,center:point(m,o.center),radius:o.radius*s};
    if(o.type==='cadArc')return arc(o,m);
    if(o.type==='cadText')return{...o,point:point(m,o.point),leaderAnchor:o.leaderAnchor?point(m,o.leaderAnchor):undefined,height:(Number(o.height)||180)*s,width:(Number(o.width)||0)*s,rotation:transformedAngle(m,Number(o.rotation)||0),mirrored:sign<0?!Boolean(o.mirrored):Boolean(o.mirrored)};
    if(o.type==='cadDimension')return dimension(o,m);
    if(root.cadHatchCurves?.is(o)){const q=root.cadHatchCurves.transform(o,m);q.angle=transformedAngle(m,finite(o.angle)?o.angle:45);return root.cadHatchPatterns?.transformStyle(o,m,q)||q;}
    if(o.type==='cadHatch'){const q={...o,points:(o.points||[]).map(p=>point(m,p)),loops:o.loops?.map(loop=>loop.map(p=>point(m,p))),angle:transformedAngle(m,finite(o.angle)?o.angle:45),sourceBoundaryId:null};if(o.dxf?.raw||o.hatchPatternTransform){const hm=multiply(m,o.hatchPatternTransform||{a:1,b:0,c:0,d:1,tx:0,ty:0});if([hm.a-1,hm.b,hm.c,hm.d-1,hm.tx,hm.ty].every(v=>Math.abs(v)<1e-10))delete q.hatchPatternTransform;else q.hatchPatternTransform=hm;if(o.patternScale!=null)q.patternScale=o.patternScale*s;}return root.cadHatchPatterns?.transformStyle(o,m,q)||q;}
    if(o.type==='cadLeader')return{...o,points:(o.points||[]).map(p=>point(m,p)),height:(Number(o.height)||140)*s,width:(Number(o.width)||0)*s};
    return null;
  }
  function supports(o){return Boolean(o&&(root.cadPolyline?.is(o)||['cadEllipse','cadPoint','cadInsert','cadXline','cadRay','cadLine','cadCircle','cadArc','cadText','cadDimension','cadHatch','cadLeader'].includes(o.type)));}
  function materializeArray(sources,layout){
    if(!layout?.placements.length)return null;
    const after=[];
    for(const {matrix} of layout.placements)for(const source of sources){
      const copy=transform(root.cadChangeSet.clone(source),matrix);
      if(!copy)return null;
      after.push(copy);
    }
    return {kind:'ARRAY',before:sources,after,copy:true,copyGroupSize:sources.length,...layout};
  }
  function planRectangularArray(sources,frame,{columns,rows,dx,dy}){
    return materializeArray(sources,rectangularLayout(sources.length,frame,{columns,rows,dx,dy}));
  }
  function rectangularLayout(sourceCount,frame,{columns,rows,dx,dy}){
    const count=n=>Number.isSafeInteger(n)&&n>=1&&n<=100000;
    if(!count(columns)||!count(rows)||columns*rows<=1||!finite(dx)||!finite(dy))return null;
    if(columns>1&&Math.abs(dx)<1e-9||rows>1&&Math.abs(dy)<1e-9)return null;
    if(!sourceCount||sourceCount*(columns*rows-1)>100000)return null;
    const placements=[];
    for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){
      if(r===0&&c===0)continue;
      const delta=root.cadUcs.vector(frame,{x:c*dx,y:r*dy}),matrix=translate(delta.x,delta.y);
      if(!validMatrix(matrix))return null;
      placements.push({slot:r+':'+c,matrix});
    }
    return {placements,array:{columns,rows,dx,dy}};
  }
  function planPolarArray(sources,options){return materializeArray(sources,polarLayout(sources.length,options));}
  function polarLayout(sourceCount,{center=null,items=2,angle=360,spacing=null,anchor=null}={}){
    if(!Number.isSafeInteger(items)||items<2||items>100000)return null;
    const finitePoint=p=>Boolean(p&&finite(p.x)&&finite(p.y));
    angle=spacing===null?Number(angle):Number(spacing)*(items-1);
    if(!finitePoint(center)||!finite(angle)||Math.abs(angle)<1e-9)return null;
    if(anchor&&(!finitePoint(anchor)||Math.hypot(anchor.x-center.x,anchor.y-center.y)<=1e-7))return null;
    if(!sourceCount||sourceCount*(items-1)>100000)return null;
    if(spacing!==null&&Math.abs(angle)>=360-1e-7)return null;
    const step=spacing!==null?Number(spacing):Math.abs(angle)>=360-1e-7?angle/items:angle/(items-1),placements=[];
    for(let i=1;i<items;i++){
      let matrix=rotate(center,step*i);
      if(anchor){
        const next=point(matrix,anchor);
        matrix=translate(next.x-anchor.x,next.y-anchor.y);
      }
      if(!validMatrix(matrix))return null;
      placements.push({slot:String(i),matrix});
    }
    return {placements,
      array:{type:'polar',center:{...center},items,angle,...(spacing!==null?{spacing:step}:{}),...(anchor?{anchor:{...anchor}}:{})}};
  }
  function prepareArrayPath(owner,pick){
    if(!owner||!pick||!finite(pick.x)||!finite(pick.y))return null;
    const G=root.geometryQuery,P=root.cadPolyline,E=root.cadEllipse,B=root.cadBezier;
    const closed=owner.type==='cadCircle'||Boolean(P?.is(owner)&&owner.closed||E?.is(owner)&&E.full(owner));
    const edges=P?.is(owner)?P.get(owner).edges:owner?.type==='cadCircle'
      ?[{...owner,type:'cadArc',startAngle:Math.atan2(pick.y-owner.center.y,pick.x-owner.center.x)*180/Math.PI,sweep:360}]
      :[owner];
    let total=0;
    const spans=[];
    let numeric=0;
    function addSpan(edge,length,at,lengthTo=null){
      if(!(length>EPS&&finite(length)))return false;
      spans.push({edge,start:total,end:total+length,length,at,lengthTo});
      total+=length;
      return true;
    }
    function addNumeric(edge,lengthTo,evaluate){
      if(++numeric>4096)return false;
      const length=lengthTo(1);
      return addSpan(edge,length,fraction=>{
        if(fraction<=0||fraction>=1)return evaluate(fraction);
        const target=length*fraction;
        let lo=0,hi=1,t=fraction;
        const tolerance=Math.max(1e-8,length*1e-11);
        for(let i=0;i<40;i++){
          const error=lengthTo(t)-target;
          if(Math.abs(error)<=tolerance)break;
          if(error<0)lo=t;else hi=t;
          t=(lo+hi)/2;
        }
        return evaluate(t);
      },lengthTo);
    }
    for(const edge of edges){
      if(edge?.type==='cadLine'&&!['line','ray'].includes(edge.mode)){
        const dx=edge.b.x-edge.a.x,dy=edge.b.y-edge.a.y,length=Math.hypot(dx,dy);
        if(!addSpan(edge,length,t=>({
          point:{x:edge.a.x+dx*t,y:edge.a.y+dy*t},angle:Math.atan2(dy,dx)*180/Math.PI
        })))return null;
      }else if(edge?.type==='cadArc'){
        const length=edge.radius*Math.abs(edge.sweep)*Math.PI/180;
        if(!addSpan(edge,length,t=>{
          const a=edge.startAngle+edge.sweep*t;
          return {point:G.pointAt(edge,a),angle:a+Math.sign(edge.sweep)*90};
        }))return null;
      }else if(E?.is(edge)&&root.cadEllipseOperations){
        const minor=E.minor(edge),sign=Math.sign(edge.sweepParam);
        if(!addNumeric(edge,t=>root.cadEllipseOperations.arcLength(edge,edge.startParam,edge.sweepParam*t),t=>{
          const a=edge.startParam+edge.sweepParam*t;
          const dx=sign*(minor.x*Math.cos(a)-edge.major.x*Math.sin(a));
          const dy=sign*(minor.y*Math.cos(a)-edge.major.y*Math.sin(a));
          return {point:E.point(edge,a),angle:Math.atan2(dy,dx)*180/Math.PI};
        }))return null;
      }else if(B?.is(edge)&&root.cadFittedOperations){
        if(!addNumeric(edge,t=>root.cadFittedOperations.spanLength(edge,0,t),t=>{
          const d=B.derivative(edge,t);
          return {point:B.at(edge,t),angle:Math.hypot(d.x,d.y)>EPS?Math.atan2(d.y,d.x)*180/Math.PI:null};
        }))return null;
      }else return null;
    }
    if(!spans.length||!finite(total))return null;
    const distance=p=>Math.hypot(p.x-pick.x,p.y-pick.y);
    const initialDirection=!closed&&distance(spans.at(-1).at(1).point)<distance(spans[0].at(0).point)?-1:1;
    let closedOrigin=0;
    if(closed&&P?.is(owner)){
      const hit=P.nearest(owner,pick),span=hit&&spans.find(s=>s.edge.edgeId===hit.edgeId);
      if(span)closedOrigin=span.start+(span.lengthTo?span.lengthTo(hit.parameter):span.length*hit.parameter);
    }else if(closed&&E?.is(owner)){
      const hit=E.nearest(owner,pick);
      if(hit)closedOrigin=spans[0].lengthTo(Math.min(1,E.progress(owner,hit.point)));
    }
    function traversal(direction){
      const origin=closed?closedOrigin:direction>0?0:total;
      function at(travel){
        let position=origin+direction*travel;
        if(closed){
          position%=total;
          if(position<0)position+=total;
          if(position===0&&direction<0)position=total;
        }else position=Math.max(0,Math.min(total,position));
        let lo=0,hi=spans.length-1;
        while(lo<hi){
          const mid=(lo+hi)>>1;
          if(direction>0?spans[mid].end<=position:spans[mid].end<position)lo=mid+1;
          else hi=mid;
        }
        const span=spans[lo],sample=span.at(Math.max(0,Math.min(1,(position-span.start)/span.length)));
        return {point:sample.point,angle:finite(sample.angle)?sample.angle+(direction<0?180:0):null};
      }
      return {closed,direction,length:total,start:at(0).point,at,maxItems:numeric?2048:100000,reverse:()=>traversal(-direction)};
    }
    return traversal(initialDirection);
  }
  function planPathArray(sources,path,options){return materializeArray(sources,pathLayout(sources.length,path,options));}
  function pathLayout(sourceCount,path,{anchor,method='divide',value,align=false}){
    if(!sourceCount||!path||!anchor||![anchor.x,anchor.y,value].every(finite))return null;
    const tolerance=Math.min(1e-7,path.length*1e-8);
    const divide=method==='divide';
    if(divide?!Number.isSafeInteger(value)||value<2:method!=='measure'||value<=tolerance)return null;
    const step=divide?path.length/(path.closed?value:value-1):value;
    const count=divide?value:path.closed?Math.ceil((path.length-tolerance)/step):Math.floor((path.length+tolerance)/step)+1;
    if(count<2||count>path.maxItems||count*sourceCount>100000)return null;
    const first=path.at(0),placements=[];
    for(let i=0;i<count;i++){
      const sample=path.at(step*i),dx=sample.point.x-anchor.x,dy=sample.point.y-anchor.y;
      if(align&&(!finite(sample.angle)||!finite(first.angle)))return null;
      const angle=align?sample.angle-first.angle:0;
      if(Math.hypot(dx,dy)<=tolerance&&Math.abs(angle%360)<=1e-9)continue;
      const matrix=angle?multiply(translate(dx,dy),rotate(anchor,angle)):translate(dx,dy);
      if(!validMatrix(matrix))return null;
      placements.push({slot:String(i),matrix});
    }
    return placements.length?{placements,array:{type:'path',method,count,step,align}}:null;
  }
  const arrayCapability='cad.array.editable.v1',arrayReplacementCapability='cad.array.replacement.v1',arrayLimit=10000;
  const only=(o,keys)=>Boolean(o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k)));
  const plainPoint=p=>only(p,['x','y'])&&finite(p.x)&&finite(p.y);
  const arrayCount=n=>Number.isSafeInteger(n)&&n>0&&n<=arrayLimit;
  const arrayId=id=>typeof id==='string'&&id.length>0&&id.length<=256&&!id.includes('\u0000');
  const arraySlot=(slot,type)=>typeof slot==='string'&&(type==='rectangular'
    ?/^(0|[1-9]\d{0,3}):(0|[1-9]\d{0,3})$/.test(slot)&&slot!=='0:0'
    :/^(0|[1-9]\d{0,3})$/.test(slot));
  function validateArrayRecipe(r){
    let valid=false;
    if(r?.type==='rectangular'){
      valid=only(r,['type','frame','columns','rows','dx','dy','excluded','sources'])&&arrayCount(r.columns)&&arrayCount(r.rows)
        &&r.columns*r.rows>1&&r.columns*r.rows-1<=arrayLimit&&finite(r.dx)&&finite(r.dy)
        &&(r.columns===1||Math.abs(r.dx)>=1e-9)&&(r.rows===1||Math.abs(r.dy)>=1e-9);
      if(valid)root.cadUcs.frame(r.frame);
    }else if(r?.type==='polar'){
      const hasInterval=Object.hasOwn(r,'spacing'),angle=hasInterval?r.spacing:r.angle;
      valid=only(r,['type','center','items','angle','spacing','anchor','handedness','excluded','sources'])&&plainPoint(r.center)&&arrayCount(r.items)&&r.items>=2
        &&[1,-1].includes(r.handedness)
        &&finite(angle)&&Math.abs(angle)>=1e-9&&(!hasInterval||Math.abs(angle)*(r.items-1)<360-1e-7)
        &&(!hasInterval||!Object.hasOwn(r,'angle'))&&(!Object.hasOwn(r,'anchor')||plainPoint(r.anchor)&&Math.hypot(r.anchor.x-r.center.x,r.anchor.y-r.center.y)>1e-7);
    }else if(r?.type==='path'){
      valid=only(r,['type','guideId','pick','anchor','reverse','align','method','value','excluded','sources'])&&arrayId(r.guideId)
        &&plainPoint(r.pick)&&(r.anchor===null||plainPoint(r.anchor))&&typeof r.reverse==='boolean'&&typeof r.align==='boolean'
        &&(r.method==='divide'?arrayCount(r.value)&&r.value>=2:r.method==='measure'&&finite(r.value)&&r.value>0);
    }
    if(!valid)throw Error('invalid-array-recipe');
    if(Object.hasOwn(r,'sources')&&(!Array.isArray(r.sources)||!r.sources.length||r.sources.length>arrayLimit
        ||r.sources.some(id=>!arrayId(id))||new Set(r.sources).size!==r.sources.length))throw Error('invalid-array-sources');
    if(Object.hasOwn(r,'excluded')&&(!Array.isArray(r.excluded)||!r.excluded.length||r.excluded.length>arrayLimit
        ||new Set(r.excluded).size!==r.excluded.length||r.excluded.some(slot=>!arraySlot(slot,r.type)||r.type==='polar'&&slot==='0')))throw Error('invalid-array-exclusions');
    return r;
  }
  function validateArrayMember(o){
    const m=o.array104;
    if(!supports(o)||o.floorId||o.planRole||o.readonly||!only(m,['version','id','sourceId','slot','matrix','recipe','follow','lineage','replacement'])
        ||m.version!==1||!arrayId(m.id)||!arrayId(m.sourceId)||m.sourceId===o.id||typeof m.slot!=='string'
        ||Object.hasOwn(m,'follow')&&typeof m.follow!=='boolean'
        ||!only(m.matrix,['a','b','c','d','tx','ty'])||!validMatrix(m.matrix)||Math.abs(det(m.matrix)-1)>1e-8)throw Error('invalid-array-member');
    if(root.cadPolyline.is(o)&&(m.follow===true||Object.hasOwn(m,'lineage'))){
      const rows=m.lineage;
      if(!Array.isArray(rows)||rows.length!==o.vertices.length||rows.some((pair,i)=>!Array.isArray(pair)||pair.length!==2||!arrayId(pair[0])
          ||(o.vertices[i].outgoing?!arrayId(pair[1]):pair[1]!==null))||new Set(rows.map(pair=>pair[0])).size!==rows.length
          ||new Set(rows.filter(pair=>pair[1]!==null).map(pair=>pair[1])).size!==rows.filter(pair=>pair[1]!==null).length)throw Error('invalid-array-lineage');
    }else if(Object.hasOwn(m,'lineage'))throw Error('invalid-array-lineage');
    const r=validateArrayRecipe(m.recipe);
    if(Object.hasOwn(m,'replacement')&&(m.replacement!==true||m.follow!==false||!r.sources))throw Error('invalid-array-replacement');
    if(r.sources&&!m.replacement&&!r.sources.includes(m.sourceId))throw Error('invalid-array-source-owner');
    const match=m.slot.match(r.type==='rectangular'?/^(0|[1-9]\d{0,3}):(0|[1-9]\d{0,3})$/:/^(0|[1-9]\d{0,3})$/);
    if(!match||r.type==='rectangular'&&(+match[1]>=r.rows||+match[2]>=r.columns||m.slot==='0:0')
        ||r.type==='polar'&&(+match[1]<1||+match[1]>=r.items)||r.excluded?.includes(m.slot))throw Error('invalid-array-slot');
    return m;
  }
  function arrayLayout(recipe,sourceCount,guide){
    try{validateArrayRecipe(recipe);}catch{return null;}
    let layout;
    if(recipe.type==='rectangular')layout=rectangularLayout(sourceCount,recipe.frame,recipe);
    else if(recipe.type==='polar')layout=polarLayout(sourceCount,recipe);
    else{
      let path=prepareArrayPath(guide,recipe.pick);
      if(!path)return null;
      if(recipe.reverse!==(path.direction<0))path=path.reverse();
      layout=pathLayout(sourceCount,path,{...recipe,anchor:recipe.anchor??path.start});
    }
    if(layout&&recipe.excluded){const omitted=new Set(recipe.excluded);layout={...layout,placements:layout.placements.filter(p=>!omitted.has(p.slot))};}
    return layout&&layout.placements.length*sourceCount<=arrayLimit?layout:null;
  }
  function planArrayRevision(members,sources,recipe,guide){
    // Layout bounds the placement count; existing replacements can have a different group size.
    const layout=sources.length?arrayLayout(recipe,1,guide):null;
    if(!layout||!members.length)return null;
    const slots=new Map(),bySource=new Map(sources.map(o=>[o.id,o]));
    const edits=[],added=[],placements=[];
    for(const member of members){
      const m=member.array104;
      if(!slots.has(m.slot))slots.set(m.slot,new Map());
      const owners=slots.get(m.slot);
      if(owners.has(m.sourceId)||!m.replacement&&!bySource.has(m.sourceId))return null;
      owners.set(m.sourceId,member);
    }
    const total=layout.placements.reduce((n,p)=>n+(slots.get(p.slot)?.size??sources.length),0);
    if(total>arrayLimit)return null;
    for(const placement of layout.placements){
      const {slot,matrix}=placement,previous=slots.get(slot);
      slots.delete(slot);
      if(!previous){
        placements.push(placement);
        for(const source of sources){
          const after=transform(root.cadChangeSet.clone(source),matrix);
          if(!after)return null;
          added.push(after);
        }
        continue;
      }
      const existing=[],relink=[];
      for(const before of previous.values()){
        const m=before.array104,same=Object.keys(matrix).every(k=>matrix[k]===m.matrix[k]);
        const relative=same?null:multiply(matrix,root.cadBlocks.inverse(m.matrix));
        const after=same?{...before}:transform(root.cadChangeSet.clone(before),relative);
        if(!after)return null;
        if(!same&&before.type==='cadHatch')for(const key of ['sourceBoundaryId','sourceBoundaryIds','boundarySourceGroups95'])
          if(Object.hasOwn(before,key))after[key]=before[key];
        after.array104={...m,matrix,recipe};
        const change={before,after};
        existing.push(change);
        if(!same&&after.type==='cadDimension'&&after.association)relink.push(change);
      }
      if(relink.length){
        const relations=root.cadDimensionAssociation,byId=new Map(existing.map(c=>[c.before.id,c]));
        for(const change of relink)change.after=relations.restoreCopied(change.before,relations.detached(change.after),id=>byId.get(id));
      }
      edits.push(...existing);
    }
    for(const slot of slots.values())for(const before of slot.values())edits.push({before,after:null});
    return {kind:'ARRAYEDIT',before:members,after:[...edits.filter(e=>e.after).map(e=>e.after),...added],edits,
      additions:{kind:'ARRAY',copy:true,before:sources,after:added,placements,copyGroupSize:sources.length,editableArray:recipe}};
  }
  const lineageOf=o=>o.vertices.map(v=>[v.id,v.outgoing?.id??null]);
  function arrayMembership(source,{id,slot,matrix,recipe}){
    const follow=!source.array104;
    return {version:1,id,sourceId:source.id,slot,matrix,recipe,follow,...(follow&&root.cadPolyline.is(source)?{lineage:lineageOf(source)}:{})};
  }
  function restoreArrayLinks(original,copy,lookup){
    if(!original)return copy;
    if(copy.type==='cadDimension')return root.cadDimensionAssociation.restoreCopied(original,copy,lookup);
    if(!root.cadHatchCurves.is(copy))return copy;
    const groups=root.cadHatchBoundaries.groups(original);
    if(!groups)return copy;
    const mapped=groups.map(ids=>ids.map(id=>lookup(id)?.after.id));
    if(mapped.some(ids=>ids.some(id=>!id)))return copy;
    return {...copy,sourceBoundaryId:mapped[0][0],...(original.boundarySourceGroups95?{boundarySourceGroups95:mapped}:{sourceBoundaryIds:mapped.map(ids=>ids[0])})};
  }
  function markArrayOverrides(changes){
    return changes.map(c=>{
      if(c.preserveArrayLink||c.before?.array104?.follow!==true||!c.after||JSON.stringify(c.before)===JSON.stringify(c.after))return c;
      const {lineage,...membership}=c.before.array104;
      const unchangedTopology=lineage&&root.cadPolyline.is(c.after)&&c.before.vertices.length===c.after.vertices.length
        &&c.before.vertices.every((v,i)=>v.id===c.after.vertices[i].id&&v.outgoing?.id===c.after.vertices[i].outgoing?.id);
      return {...c,after:{...c.after,array104:{...membership,follow:false,...(unchangedTopology?{lineage}:{})}}};
    });
  }
  function transformArrayGroups(objects,changes,matrix){
    if(!validMatrix(matrix))return changes;
    const selected=new Map(changes.filter(c=>c.before&&c.after).map(c=>[c.before.id,c])),groups=new Map();
    for(const o of objects){
      const m=o.array104;if(!m)continue;
      if(!groups.has(m.id))groups.set(m.id,[]);groups.get(m.id).push(o);
    }
    if(!groups.size)return changes;
    const updates=new Map(),inverse=root.cadBlocks.inverse(matrix),sign=Math.sign(det(matrix)),factor=scaleOf(matrix);
    for(const members of groups.values()){
      if(members.some(o=>!selected.has(o.id)))continue;
      const old=members[0].array104.recipe,sources=old.sources||[...new Set(members.map(o=>o.array104.sourceId))];
      if(sources.some(id=>!selected.has(id))||old.type==='path'&&!selected.has(old.guideId))continue;
      const recipe={...old};
      if(old.type==='rectangular'){
        recipe.frame={origin:point(matrix,old.frame.origin),angle:transformedAngle(matrix,old.frame.angle),handedness:old.frame.handedness*sign};
        recipe.dx*=factor;recipe.dy*=factor;
      }else if(old.type==='polar'){
        recipe.center=point(matrix,old.center);recipe.handedness*=sign;
        if(old.anchor)recipe.anchor=point(matrix,old.anchor);
        if(Object.hasOwn(old,'spacing'))recipe.spacing*=sign;else recipe.angle*=sign;
      }else{
        recipe.pick=point(matrix,old.pick);if(old.anchor)recipe.anchor=point(matrix,old.anchor);
        if(old.method==='measure')recipe.value*=factor;
        // Circles have an implicit CCW traversal; their transform retains no signed sweep.
        if(sign<0&&selected.get(old.guideId).before.type==='cadCircle')recipe.reverse=!recipe.reverse;
      }
      try{validateArrayRecipe(recipe);}catch{continue;}
      for(const member of members){
        const change=selected.get(member.id),m=member.array104;
        updates.set(member.id,{...change,preserveArrayLink:true,after:{...change.after,
          array104:{...m,recipe,matrix:multiply(matrix,multiply(m.matrix,inverse))}}});
      }
      for(const id of [...sources,...members.map(o=>o.id)]){
        const c=updates.get(id)||selected.get(id);
        if(c.before.type!=='cadDimension'||!c.before.association)continue;
        const relations=root.cadDimensionAssociation;
        const after=relations.restoreCopied(c.before,relations.detached(c.after),sourceId=>{
          const owner=updates.get(sourceId)||selected.get(sourceId);
          return owner?{before:owner.before,after:owner.after}:null;
        });
        updates.set(id,{...c,after});
      }
    }
    return updates.size?changes.map(c=>updates.get(c.before?.id)||c):changes;
  }
  function copyArrayGroups(objects,originals,changes,matrix,uid){
    if(!validMatrix(matrix))return changes;
    const owners=new Map(originals.map((before,i)=>[before.id,{before,after:changes[i].after}]));
    const projected=transformArrayGroups(objects,changes.map((c,i)=>({...c,before:originals[i]})),matrix),groups=new Map();
    return projected.map(c=>{
      if(!c.preserveArrayLink||!c.before.array104)return {...c,before:null};
      const m=c.after.array104;
      if(!groups.has(m.id)){
        const recipe={...m.recipe};
        if(recipe.sources)recipe.sources=recipe.sources.map(id=>owners.get(id).after.id);
        if(recipe.type==='path')recipe.guideId=owners.get(recipe.guideId).after.id;
        groups.set(m.id,{id:uid('cadArray'),recipe});
      }
      const group=groups.get(m.id),source=owners.get(m.sourceId),member={...m,id:group.id,recipe:group.recipe,sourceId:source?.after.id??m.sourceId};
      if(m.lineage){
        const vertices=new Map(),edges=new Map();
        for(const [i,v] of (source?.before.vertices||[]).entries()){
          vertices.set(v.id,source.after.vertices[i].id);
          if(v.outgoing)edges.set(v.outgoing.id,source.after.vertices[i].outgoing?.id);
        }
        const lineage=m.lineage.map(([v,e])=>[vertices.get(v),e===null?null:edges.get(e)]);
        if(lineage.some(([v,e])=>!v||e===undefined)){delete member.lineage;member.follow=false;}
        else member.lineage=lineage;
      }
      return {...c,before:null,after:{...c.after,array104:member}};
    });
  }
  function updateArrayMember(source,member,uid){
    const m=member.array104,q=transform(root.cadChangeSet.clone(source),m.matrix);
    if(!q)return null;
    q.id=member.id;
    q.array104={...m};delete q.array104.lineage;
    if(root.cadPolyline.is(q)){
      const vertices=new Map(),edges=new Map();
      for(const [i,[vertex,edge]] of (m.lineage||[]).entries()){
        vertices.set(vertex,member.vertices[i].id);
        if(edge!==null)edges.set(edge,member.vertices[i].outgoing.id);
      }
      q.array104.lineage=lineageOf(source);
      q.vertices=q.vertices.map(v=>({...v,id:vertices.get(v.id)??uid('cadVertex'),
        ...(v.outgoing?{outgoing:{...v.outgoing,id:edges.get(v.outgoing.id)??uid('cadEdge')}}:{})}));
    }
    return q.type==='cadDimension'?root.cadDimensionAssociation.detached(q):q;
  }
  function resetArrayMembers(members,sources,ids,uid){
    const chosen=new Set(ids),slots=new Set(members.filter(o=>chosen.has(o.id)).map(o=>o.array104.slot));
    if(!slots.size)return null;
    const originals=new Map(sources.map(o=>[o.id,o])),copies=new Map(),cells=new Map(),edits=[];
    for(const o of members)if(slots.has(o.array104.slot)){
      if(!cells.has(o.array104.slot))cells.set(o.array104.slot,[]);
      cells.get(o.array104.slot).push(o);
    }
    const removed=[...cells.values()].reduce((n,cell)=>n+cell.length,0);
    if(members.length-removed+slots.size*sources.length>arrayLimit)return null;
    for(const slot of slots){
      const cell=cells.get(slot),existing=new Map(cell.filter(o=>!o.array104.replacement).map(o=>[o.array104.sourceId,o]));
      for(const before of cell)if(before.array104.replacement)edits.push({before,after:null});
      copies.set(slot,new Map());
      for(const source of sources){
        if(source.array104)return null;
        const before=existing.get(source.id),m=cell[0].array104;
        const member=before||{id:uid(source.type),array104:{version:1,id:m.id,sourceId:source.id,slot,matrix:m.matrix,recipe:m.recipe}};
        const after=updateArrayMember(source,member,uid);
        if(!after)return null;
        after.array104.follow=true;
        const change={before:before||null,after};edits.push(change);copies.get(slot).set(source.id,change);
      }
    }
    for(const c of edits){
      if(!c.after)continue;
      const m=c.after.array104,source=originals.get(m.sourceId),group=copies.get(m.slot);
      c.after=restoreArrayLinks(source,c.after,id=>{
        const before=originals.get(id),after=group.get(id)?.after;
        return before&&after?{before,after}:null;
      });
    }
    return {kind:'ARRAYEDIT',before:members,after:edits.flatMap(c=>c.after?[c.after]:[]),edits};
  }
  function planArrayReplacement(members,originals,templates,base,target,ids){
    if(!plainPoint(base)||!plainPoint(target)||!templates.length||templates.some(o=>!supports(o)||o.floorId||o.planRole||o.readonly))return null;
    const chosen=new Set(ids),slots=new Set(members.filter(o=>chosen.has(o.id)).map(o=>o.array104.slot));
    const untouched=members.filter(o=>!slots.has(o.array104.slot)).length;
    if(!slots.size||untouched+templates.length*slots.size>arrayLimit)return null;
    const recipe={...members[0].array104.recipe,sources:originals.map(o=>o.id)},anchor=translate(target.x-base.x,target.y-base.y);
    const placements=[],edits=[];
    const seen=new Set();
    for(const before of members){
      const m=before.array104;
      if(!slots.has(m.slot)){edits.push({before,after:{...before,array104:{...m,recipe}}});continue;}
      edits.push({before,after:null});
      if(seen.has(m.slot))continue;
      seen.add(m.slot);
      placements.push({slot:m.slot,matrix:m.matrix,geometryMatrix:multiply(m.matrix,anchor)});
    }
    const after=[];
    for(const p of placements)for(const template of templates){
      const o=transform(root.cadChangeSet.clone(template),p.geometryMatrix);
      if(!o)return null;
      after.push(o);
    }
    return {kind:'ARRAYEDIT',before:members,after:[...edits.flatMap(e=>e.after?[e.after]:[]),...after],edits,
      additions:{kind:'ARRAY',copy:true,before:templates,after,copyGroupSize:templates.length,placements,editableArray:recipe,replacement:true}};
  }
  function separateArrayMembers(members,ids,{remove=false}={}){
    const chosen=new Set(ids),slots=new Set(members.filter(o=>chosen.has(o.id)).map(o=>o.array104.slot));
    if(!slots.size)return null;
    const recipe={...members[0].array104.recipe};
    recipe.excluded=[...new Set([...(recipe.excluded||[]),...slots])].sort();
    try{validateArrayRecipe(recipe);}catch{return null;}
    const edits=members.map(before=>{
      if(!slots.has(before.array104.slot))return {before,after:{...before,array104:{...before.array104,recipe}}};
      if(remove)return {before,after:null};
      const {array104,...after}=before;return {before,after};
    });
    return {kind:'ARRAYEDIT',before:members,after:edits.flatMap(c=>c.after?[c.after]:[]),edits};
  }
  function augmentArraySources(objects,changes,{allowed,uid}){
    const sources=new Map(changes.filter(c=>c.before&&c.after&&!c.before.array104&&!c.after.array104&&c.after!==c.before&&supports(c.after)).map(c=>[c.after.id,c]));
    if(!sources.size||!objects.some(o=>o.array104?.follow===true&&sources.has(o.array104.sourceId)))return changes;
    for(const [id,c] of sources)if(JSON.stringify(c.before)===JSON.stringify(c.after))sources.delete(id);
    if(!sources.size)return changes;
    const edits=new Map(changes.map(c=>[(c.after||c.before).id,c])),affected=[],owners=new Map(),slots=new Map();
    for(const [index,o] of objects.entries()){
      const edit=edits.get(o.id),next=edit?edit.after:o;
      if(!next)continue;
      owners.set(o.id,next);
      const m=next.array104;
      if(!m)continue;
      const key=m.id+'\u0000'+m.slot;
      if(!slots.has(key))slots.set(key,new Map());
      slots.get(key).set(m.sourceId,o.id);
      if(m.follow!==true||edit||!sources.has(m.sourceId)||!allowed(o))continue;
      const source=sources.get(m.sourceId).after;
      const after=updateArrayMember(source,o,uid);
      if(!after)continue;
      owners.set(o.id,after);
      affected.push({source,key,change:{before:o,after,index}});
    }
    for(const [id,c] of edits)if(c.after&&!c.before)owners.set(id,c.after);
    for(const {source,key,change} of affected){
      const group=slots.get(key);
      change.after=restoreArrayLinks(source,change.after,id=>{
        const before=owners.get(id),after=owners.get(group.get(id));
        return before&&after?{before,after}:null;
      });
      if(root.cadHatchCurves.is(change.after)&&change.after.sourceBoundaryId){
        const linked=root.cadHatchBoundaries.groups(change.after).flat().map(id=>owners.get(id));
        change.after=root.cadHatchCurves.regenerate(change.after,linked);
      }
    }
    return affected.length?[...changes,...affected.map(e=>e.change)]:changes;
  }
  root.cadTransformOperations=Object.freeze({identity,multiply,translate,rotate,scale,mirror,align,point,det,scaleOf,validMatrix,transform,supports,planRectangularArray,planPolarArray,prepareArrayPath,planPathArray,arrayCapability,arrayReplacementCapability,arrayLimit,validateArrayRecipe,validateArrayMember,planArrayRevision,arrayMembership,restoreArrayLinks,markArrayOverrides,augmentArraySources,resetArrayMembers,separateArrayMembers,planArrayReplacement,transformArrayGroups,copyArrayGroups});
})();
