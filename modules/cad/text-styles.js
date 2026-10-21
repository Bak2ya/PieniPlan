/* Named document text styles. No personal settings or OS font enumeration.
 * Managed styles use the bundled Noto font; unknown source fonts stay preserved. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};let source=()=>[];
 const defaults=(name='Standard')=>({name,font:'PieniPlanOutputSans.ttf',height:0,widthFactor:1,oblique:0,managed:true});
 const validName=n=>typeof n==='string'&&n.trim()===n&&n.length>0&&n.length<=255&&!/[\x00-\x1f<>/\\":;?*=|]/.test(n);
 function validate(list){if(!Array.isArray(list)||list.length>10000)throw Error('invalid-text-styles');const names=new Set();for(const s of list){if(!validName(s.managed?s.name:s.name?.replaceAll('|','_'))||names.has(s.name.toUpperCase())||typeof s.font!=='string'||!Number.isFinite(s.height)||s.height<0||s.height>1e7||!Number.isFinite(s.widthFactor)||s.widthFactor<.1||s.widthFactor>10||!Number.isFinite(s.oblique)||Math.abs(s.oblique)>85||s.managed!==true&&s.managed!==false||s.managed&&s.font!=='PieniPlanOutputSans.ttf')throw Error('invalid-text-style');names.add(s.name.toUpperCase());}return list;}
 const configure=get=>{source=get;},find=name=>(source()||[]).find(s=>s.name.toUpperCase()===String(name||'Standard').toUpperCase());
 function style(o){if(o?.planRole==='annotation')return null;const s=find(o?.textStyle);return s?.managed?s:null;}
 function view(o){return o;}
 function appearance(o){const s=style(o);return{widthFactor:s?.widthFactor||1,skew:s?Math.tan(s.oblique*Math.PI/180):0,font:s?'PieniPlanOutputSans, sans-serif':'system-ui'};}
 function bounds(o,b){const a=appearance(o);if(a.widthFactor===1&&!a.skew)return b;const xs=[b.minx*a.widthFactor+b.miny*a.skew,b.minx*a.widthFactor+b.maxy*a.skew,b.maxx*a.widthFactor+b.miny*a.skew,b.maxx*a.widthFactor+b.maxy*a.skew];return{...b,minx:Math.min(...xs),maxx:Math.max(...xs)};}
 function svgTransform(o){const a=appearance(o);return a.widthFactor===1&&!a.skew?'':`translate(${o.point.x} ${-o.point.y}) matrix(${a.widthFactor} 0 ${-a.skew} 1 0 0) translate(${-o.point.x} ${o.point.y})`;}
 root.cadTextStyles=Object.freeze({capability:'cad.textstyle.v1',defaults,validName,validate,configure,find,style,view,appearance,bounds,svgTransform});
})();
