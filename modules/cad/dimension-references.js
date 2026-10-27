/* Exact owned-curve dimension anchors. Derived fitted span indices are valid
 * only together with their topology witness; no nearest-edge rebinding on load. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},capability='cad.dimension.subedge.v1',distance=(a,b)=>a&&b?Math.hypot(a.x-b.x,a.y-b.y):Infinity,finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),norm=(a,p)=>(a%p+p)%p;
 function topology(o){if(!o.curveFit)return undefined;return JSON.stringify([o.closed,o.curveFit,o.vertices.map(v=>v.id),M.cadPolyline.get(o).edges.map(e=>[e.type,e.frameIndex])]);}
 function edges(o){if(M.cadPolyline.is(o))return M.cadPolyline.get(o).edges;return['cadLine','cadArc','cadCircle','cadEllipse'].includes(o.type)?[o]:[];}
 function at(e,t){if(M.cadBezier?.is(e))return M.cadBezier.at(e,t);if(M.cadEllipse?.is(e))return M.cadEllipse.at(e,t);if(e.a&&e.b)return{x:e.a.x+(e.b.x-e.a.x)*t,y:e.a.y+(e.b.y-e.a.y)*t};return M.geometryQuery.pointAt(e,(e.startAngle||0)+(e.type==='cadCircle'?360:e.sweep)*t);}
 function parameter(e,p){if(M.cadBezier?.is(e))return M.cadBezier.nearest(e,p).t;if(M.cadEllipse?.is(e))return M.cadEllipse.progress(e,p);if(e.a&&e.b)return M.geometryQuery.parameter(e,p);const angle=Math.atan2(p.y-e.center.y,p.x-e.center.x)*180/Math.PI,sign=e.type==='cadCircle'?1:Math.sign(e.sweep),sweep=e.type==='cadCircle'?360:Math.abs(e.sweep);if(distance(p,at(e,1))<1e-7&&e.type!=='cadCircle')return 1;return norm((angle-(e.startAngle||0))*sign,360)/sweep;}
 function validate(a){const keys=['kind','sourceId','feature','value','edgeId','topology','direction'];if(!a||a.kind!=='geometry96'||typeof a.sourceId!=='string'||!a.sourceId||!['midpoint','parameter','quadrant','center'].includes(a.feature)||Object.keys(a).some(k=>!keys.includes(k))||a.edgeId!==undefined&&(typeof a.edgeId!=='string'||!a.edgeId)||a.topology!==undefined&&(typeof a.topology!=='string'||!a.topology||a.topology.length>400000)||a.direction!==undefined&&(!Array.isArray(a.direction)||a.direction.length!==2||a.direction.some(v=>typeof v!=='string'||!v)||a.direction[0]===a.direction[1]||!a.edgeId||a.feature!=='parameter'))throw Error('invalid-dimension-subedge-anchor');
  if(a.feature==='parameter'&&(!Number.isFinite(a.value)||a.value<0||a.value>1)||a.feature==='quadrant'&&(!Number.isInteger(a.value)||a.value<0||a.value>3)||['midpoint','center'].includes(a.feature)&&a.value!==undefined||a.topology!==undefined&&!a.edgeId||a.topology&&a.direction||a.feature==='parameter'&&a.edgeId&&!a.topology&&!a.direction)throw Error('invalid-dimension-subedge-parameter');return a;
 }
 function resolve(a,byId){validate(a);const o=byId(a.sourceId);if(!o||o.readonly||o.floorId||o.planRole)return null;const poly=M.cadPolyline.is(o);if(poly!==Boolean(a.edgeId)||a.topology!==topology(o))return null;const es=edges(o).filter(e=>!poly||e.edgeId===a.edgeId);if(es.length!==1)return null;const e=es[0];let point;
  if(a.feature==='center')point=e.center;
  else if(a.feature==='midpoint'){if(e.type==='cadCircle'||M.cadEllipse?.is(e)&&M.cadEllipse.full(e))return null;point=at(e,.5);}
  else if(a.feature==='parameter'){let t=a.value;if(a.direction){if(e.fromVertexId===a.direction[0]&&e.toVertexId===a.direction[1]){}else if(e.fromVertexId===a.direction[1]&&e.toVertexId===a.direction[0])t=1-t;else return null;}point=at(e,t);}
  else if(a.feature==='quadrant'){if(M.cadEllipse?.is(e)){const t=a.value*Math.PI/2;if(!M.cadEllipse.contains(e,t))return null;point=M.cadEllipse.point(e,t);}else if(['cadCircle','cadArc'].includes(e.type)){point=M.geometryQuery.pointAt(e,a.value*90);if(!M.geometryQuery.onArc(e,point))return null;}else return null;}
  return finite(point)?{point:{x:point.x,y:point.y}}:null;
 }
 function capture(point,snap,byId){if(!finite(point)||!snap?.objectId||!['endpoint','midpoint','nearest','quadrant','center'].includes(snap.kind))return null;const o=byId(snap.objectId);if(!o||o.readonly||o.floorId||o.planRole)return null;const poly=M.cadPolyline.is(o),es=edges(o),witness=topology(o),matches=[];
  for(const e of es){if(snap.edgeId&&poly&&snap.edgeId!==e.edgeId)continue;const base={kind:'geometry96',sourceId:o.id,...(poly?{edgeId:e.edgeId}:{}),...(witness?{topology:witness}:{})},options=[];
   if(snap.kind==='midpoint')options.push({...base,feature:'midpoint'});
   if(snap.kind==='center')options.push({...base,feature:'center'});
   if(snap.kind==='quadrant')for(let value=0;value<4;value++)options.push({...base,feature:'quadrant',value});
   if(['endpoint','nearest'].includes(snap.kind)){if(snap.kind==='endpoint')for(const value of[0,1])options.push({...base,feature:'parameter',value});else{const value=parameter(e,point);if(Number.isFinite(value)&&value>=-1e-9&&value<=1+1e-9)options.push({...base,feature:'parameter',value:Math.max(0,Math.min(1,value))});}}
   for(const a of options){if(poly&&!o.curveFit&&a.feature==='parameter')a.direction=[e.fromVertexId,e.toVertexId];if(distance(resolve(a,byId)?.point,point)<1e-6)matches.push(a);}
  }
  return matches.length===1?matches[0]:null;
 }
 M.cadDimensionReferences=Object.freeze({capability,validate,resolve,capture,topology});
})();
