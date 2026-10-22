/* Exact path descriptors shared by readonly Plan references and vector output.
 * Paths use SVG's flipped Y; transforms are explicit and never model mutations. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function edge(e){if(root.cadBezier?.is(e))return root.cadBezier.svgPath(e);if(e.type==='cadLine')return`M ${e.a.x} ${-e.a.y} L ${e.b.x} ${-e.b.y}`;if(root.cadEllipse?.is(e))return root.cadEllipse.svgPath(e);return root.cadEllipse.svgPath({type:'cadEllipse',center:e.center,major:{x:e.radius,y:0},ratio:1,startParam:(e.startAngle||0)*Math.PI/180,sweepParam:(e.type==='cadCircle'?360:e.sweep)*Math.PI/180});}
 function parts(o,tol=.02){if(root.cadPolylineWidth?.isAffine(o))return parts(o.original,tol).map(p=>({...p,matrix:o.matrix}));if(root.cadPolyline?.is(o))return[...root.cadPolylineWidth.paths(o,tol).map(d=>({d,fill:true})),...root.cadPolyline.get(o).edges.map(e=>({d:edge(e),fill:false}))];if(root.cadHatchCurves?.is(o))return[{d:root.cadHatchCurves.svgPath(o),fill:true,rule:'evenodd',opacity:Number.isFinite(o.opacity)?o.opacity:.14}];if(root.cadEllipse?.is(o)||['cadCircle','cadArc','cadLine'].includes(o.type))return[{d:edge(o),fill:false}];return[];}
 function markup(o,{weight=1,color='#596779'}={}){return parts(o).map(p=>{const m=p.matrix,transform=m?` transform="matrix(${m.a} ${-m.b} ${-m.c} ${m.d} ${m.tx} ${-m.ty})"`:'';return`<path d="${p.d}"${transform} fill="${p.fill?color:'none'}"${p.rule?` fill-rule="${p.rule}"`:''}${p.opacity!=null?` fill-opacity="${p.opacity}"`:''} stroke="${p.fill?'none':color}" stroke-width="${weight}"/>`;}).join('');}
 root.cadPathScene=Object.freeze({edge,parts,markup});
})();
