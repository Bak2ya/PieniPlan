/* Geometry, meaning and project appearance are independent authorities. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const capability='plan.nature-style.v1';
  const isGeometry=o=>Boolean(o?.floorId&&o.planGeometry===true&&['cadCircle','cadPolyline'].includes(o.type));
  const isColumn=o=>isGeometry(o)&&o.planNature==='column';
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const fail=code=>{throw Error(code);};
  function polygon(points,tolerance=root.geometryQuery.tolerance.model){
    if(points.length<3||points.length>4096)fail('outline');
    const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
    const on=(p,a,b)=>Math.abs(cross(a,b,p))<=tolerance*Math.max(1,distance(a,b))&&p.x>=Math.min(a.x,b.x)-tolerance&&p.x<=Math.max(a.x,b.x)+tolerance&&p.y>=Math.min(a.y,b.y)-tolerance&&p.y<=Math.max(a.y,b.y)+tolerance;
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length];
      if(![a.x,a.y].every(Number.isFinite)||distance(a,b)<=tolerance)fail('duplicate');
      for(let j=i+1;j<points.length;j++){
        if(distance(a,points[j])<=tolerance)fail('duplicate');
        const c=points[j],d=points[(j+1)%points.length];
        if(j===i+1||i===0&&j===points.length-1){
          // Collinear reversal overlaps even though the two edges share a vertex.
          const shared=j===i+1?b:a,other=j===i+1?d:c,first=j===i+1?a:b;
          if(on(other,first,shared)||on(first,shared,other))fail('overlap');
          continue;
        }
        if(on(a,c,d)||on(b,c,d)||on(c,a,b)||on(d,a,b)||cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)fail('intersection');
      }
    }
    // Translation avoids catastrophic cancellation at georeferenced origins.
    const origin=points[0];let area=0;for(let i=1;i<points.length-1;i++)area+=cross(origin,points[i],points[i+1]);
    if(Math.abs(area)<=tolerance*tolerance)fail('outline');
    return points;
  }
  function contour(objects,tolerance=root.geometryQuery.tolerance.model){
    if(!objects.length||objects.length>4096)fail('outline');
    if(objects.length===1){const o=objects[0];
      if(o.type==='cadCircle'){if(!o.center||![o.center.x,o.center.y,o.radius].every(Number.isFinite)||o.radius<=tolerance)fail('outline');return{kind:'circle',center:{...o.center},radius:o.radius};}
      if(o.type==='cadPolyline'){
        root.cadPolyline.validate(o);if(!o.closed)fail('open');
        if(o.vertices.some(v=>v.outgoing?.bulge))fail('curves');
        return{kind:'polygon',points:polygon(o.vertices.map(v=>({x:v.x,y:v.y})),tolerance)};
      }
    }
    if(objects.some(o=>!['line','wall','cadLine'].includes(o.type)||o.geometry==='arc'||o.center||!o.a||!o.b))fail('curves');
    const nodes=[],edges=[],find=p=>{const matches=[];for(let i=0;i<nodes.length;i++)if(distance(nodes[i].point,p)<=tolerance)matches.push(i);if(matches.length>1)fail('ambiguous');if(matches.length)return matches[0];nodes.push({point:{x:p.x,y:p.y},edges:[]});return nodes.length-1;};
    for(const o of objects){const a=find(o.a),b=find(o.b);if(a===b)fail('duplicate');if(edges.some(e=>e.a===a&&e.b===b||e.a===b&&e.b===a))fail('duplicate');const index=edges.length;edges.push({a,b});nodes[a].edges.push(index);nodes[b].edges.push(index);}
    if(nodes.some(n=>n.edges.length>2))fail('branch');
    if(nodes.some(n=>n.edges.length!==2))fail('open');
    const used=new Set(),points=[];let node=0;
    do{points.push(nodes[node].point);const next=nodes[node].edges.find(i=>!used.has(i));if(next===undefined)fail('outline');used.add(next);const e=edges[next];node=e.a===node?e.b:e.a;}while(node!==0&&points.length<=edges.length);
    if(used.size!==edges.length)fail('multiple');
    return{kind:'polygon',points:polygon(points,tolerance)};
  }
  const categories=['wall','door','fireDoor','fireShutter','window','column'];
  function category(o){return isColumn(o)?'column':o?.type==='door'?(o.doorType==='fireShutter'||o.fireProtection==='fireShutter'?'fireShutter':o.doorType==='fireDoor'||o.fireProtection==='fireDoor'?'fireDoor':'door'):['wall','window'].includes(o?.type)?o.type:null;}
  function validateStyles(raw){
    if(raw==null)return;
    if(typeof raw!=='object'||Array.isArray(raw))fail('styles');
    for(const [key,s]of Object.entries(raw))if(!categories.includes(key)||!s||Object.keys(s).some(k=>!['color','pattern'].includes(k))||s.color!=null&&!/^#[\da-f]{6}$/i.test(s.color)||s.pattern!=null&&!['solid','dotted','dashed'].includes(s.pattern))fail('styles');
  }
  function validateObject(o){
    if(o.planNature!=null&&o.planNature!=='column')fail('nature');
    if(o.planGeometry===true&&!isGeometry(o))fail('geometry');
    if(o.planNature==='column'){if(!isGeometry(o))fail('column-geometry');contour([o]);}
  }
  root.planNature=Object.freeze({capability,isGeometry,isColumn,polygon,contour,categories,category,validateStyles,validateObject});
})();
