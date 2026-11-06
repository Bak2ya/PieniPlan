/* Optional native primary dimension formats. Drawing geometry remains canonical mm. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},capability='cad.dimension.primary-units.v1';
 function validate(q,{base=null}={}){
  if(!q||Array.isArray(q)||q.version!==1||Object.keys(q).some(k=>!['version','format','fraction'].includes(k)))throw Error('invalid-primary-units');
  const n={version:1,fraction:0,...base,...q};
  if(!Number.isInteger(n.format)||n.format<1||n.format>5||!Number.isInteger(n.fraction)||n.fraction<0||n.fraction>2)throw Error('invalid-primary-units-value');return n;
 }
 function merge(a,b){if(!a&&!b)return null;const q={...a,...b};if(!Object.hasOwn(q,'format')&&!Object.hasOwn(q,'fraction'))throw Error('empty-primary-override');const full=validate(q,{base:{version:1,format:2}});return Object.hasOwn(q,'format')?full:q;}
 const required=(objects=[],styles=[])=>styles.some(s=>s.primaryUnits100!=null)||objects.some(o=>o.styleOverrides?.primaryUnits100!=null);
 function validateStyle(d){if(d.primaryUnits100==null)return true;const p=validate(d.primaryUnits100);if([3,4].includes(p.format)&&!['in','ft-in'].includes(d.units))throw Error('primary-feet-requires-inches');return true;}
 function validateDocument(objects=[],styles=[],caps=null){
  if(required(objects,styles)&&caps&&!caps.includes(capability))throw Error('primary-units-capability-required');
  for(const s of styles)validateStyle(s);
  for(const o of objects)if(o.styleOverrides?.primaryUnits100!=null){const base=styles.find(s=>s.name.toUpperCase()===String(o.styleName).toUpperCase());if(o.type!=='cadDimension'||!base)throw Error('primary-units-owner-style');validateStyle({...base,...o.styleOverrides,primaryUnits100:validate(merge(base.primaryUnits100,o.styleOverrides.primaryUnits100),{base:{version:1,format:base.units==='ft-in'?3:2}})});}
  return true;
 }
 function text(value,q,{precision=0,zeros=0,separator='.'}={}){
  const p=validate(q);if(!Number.isFinite(value)||!Number.isInteger(precision)||precision<0||precision>8)throw Error('invalid-primary-value');
  let format=p.format;if(p.fraction===2&&[4,5].includes(format))format+=2;
  const s=M.cadDimensionNotation.nativeNumber(value,format,precision,zeros,separator);
  return p.fraction===1&&[4,5].includes(p.format)?s.replace(/\\S(\d+)\/(\d+);/g,'\\S$1#$2;'):s;
 }
 function dxfPairs(q,{sparse=false}={}){return [[277,'format'],[276,'fraction']].filter(([,k])=>!sparse||Object.hasOwn(q,k)).map(([code,k])=>[code,k==='fraction'?q.fraction??0:q.format]);}
 function nativeValues(pairs,{overrides=false}={}){
  const m=new Map();if(!overrides){for(const[c,v]of pairs)if(!m.has(c))m.set(c,v);return m;}
  let acad=false,inside=false;for(let i=0;i<pairs.length;i++){const[c,v]=pairs[i];if(c===1001){acad=v==='ACAD';inside=false;}if(acad&&c===1000&&v==='DSTYLE')inside=true;else if(inside&&c===1002&&v==='}')inside=false;else if(inside&&c===1070&&pairs[i+1])m.set(Number(v),pairs[++i][1]);}return m;
 }
 function fromDxf(pairs,{base=null,overrides=false}={}){
  const m=nativeValues(pairs,{overrides}),q={version:1};if(m.has(277))q.format=Number(m.get(277));if(m.has(276))q.fraction=Number(m.get(276));if(Object.keys(q).length===1)return null;
  if(!overrides&&q.format===2&&(q.fraction??0)===0)return null; // Avoid new capability on ordinary legacy decimal imports.
  try{validate(q,{base});return q;}catch{return null;} // Unsupported desktop6 stays raw; it is not alternate6.
 }
 M.cadPrimaryUnits=Object.freeze({capability,validate,merge,required,validateStyle,validateDocument,text,dxfPairs,nativeValues,fromDxf});
})();
