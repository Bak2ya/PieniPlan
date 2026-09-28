/* Static AABB hierarchy. Immutable derived items; no document/UI ownership. */
(() => {
 const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 const overlap=(a,b)=>a.minx<=b.maxx&&a.maxx>=b.minx&&a.miny<=b.maxy&&a.maxy>=b.miny;
 const union=(a,b)=>a?{minx:Math.min(a.minx,b.minx),miny:Math.min(a.miny,b.miny),maxx:Math.max(a.maxx,b.maxx),maxy:Math.max(a.maxy,b.maxy)}:{...b};
 const distance=(b,p)=>Math.hypot(Math.max(b.minx-p.x,0,p.x-b.maxx),Math.max(b.miny-p.y,0,p.y-b.maxy));
 function create(items){
  function build(a){if(!a.length)return null;const b=a.reduce((b,x)=>union(b,x.b),null);if(a.length<=8)return{b,items:a};const axis=b.maxx-b.minx>=b.maxy-b.miny?'x':'y';a.sort((u,v)=>(u.b['min'+axis]+u.b['max'+axis])-(v.b['min'+axis]+v.b['max'+axis]));const mid=a.length>>1;return{b,left:build(a.slice(0,mid)),right:build(a.slice(mid))};}
  const tree=build(items.slice());let visits=0;
  function query(rect){const out=[];visits=0;function walk(n){if(!n||!overlap(n.b,rect))return;visits++;if(n.items){for(const x of n.items)if(overlap(x.b,rect))out.push(x);}else{walk(n.left);walk(n.right);}}walk(tree);return out;}
  function nearest(p,project){let best=null,limit=Infinity;visits=0;function walk(n){if(!n||distance(n.b,p)>limit)return;visits++;if(n.items){for(const x of n.items){if(distance(x.b,p)>limit)continue;const q=project(x);if(q&&q.distance<limit){best=q;limit=q.distance;}}}else{const a=distance(n.left.b,p),b=distance(n.right.b,p);if(a<=b){walk(n.left);walk(n.right);}else{walk(n.right);walk(n.left);}}}walk(tree);return best;}
  return Object.freeze({query,nearest,bounds:tree?.b||null,get visits(){return visits;}});
 }
 root.cadSpatialTree=Object.freeze({create,overlap,union});
})();
