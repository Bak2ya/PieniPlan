/* Sparse drawing defaults for fresh CAD objects. Never reinterpret hatch opacity. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},key='cadTransparencyDefaults98',capability='cad.transparency.defaults.v1',ids=['CETRANSPARENCY','HPTRANSPARENCY'],types=new Set(['cadLine','cadXline','cadRay','cadCircle','cadArc','cadEllipse','cadPolyline','cadText','cadDimension','cadLeader','cadHatch','cadPoint','cadInsert']);
 const slot=id=>{if(!ids.includes(id))throw Error('invalid-appearance-variable');return id==='CETRANSPARENCY'?'current':'hatch';},defaultValue=id=>id==='CETRANSPARENCY'?null:'CURRENT';
 function validateValue(id,value){slot(id);if(value===null||value==='BYBLOCK'||id==='HPTRANSPARENCY'&&value==='CURRENT')return value;if(!Number.isInteger(value)||value<0||value>90)throw Error('invalid-creation-transparency');return value;}
 function parse(id,input){const raw=String(input??'').trim(),s=raw.toUpperCase().replace(/\s+/g,' ');slot(id);if(s==='BYLAYER'||id==='CETRANSPARENCY'&&s==='-1')return null;if(s==='BYBLOCK'||id==='CETRANSPARENCY'&&s==='-2')return'BYBLOCK';if(id==='HPTRANSPARENCY'&&['.','USE CURRENT','CURRENT'].includes(s))return'CURRENT';if(!/^\+?\d+$/.test(raw))throw Error('invalid-creation-transparency');return validateValue(id,Number(raw));}
 function format(id,value){validateValue(id,value);return value===null?'ByLayer':value==='BYBLOCK'?'ByBlock':value==='CURRENT'?'Use current':String(value);}
 function validate(q){if(!q||q.version!==1||Object.keys(q).some(k=>!['version','current','hatch'].includes(k)))throw Error('invalid-creation-appearance');for(const id of ids)if(Object.hasOwn(q,slot(id)))validateValue(id,q[slot(id)]);return q;}
 function value(settings,id){const q=settings?.[key];if(q)validate(q);const field=slot(id);return q&&Object.hasOwn(q,field)?q[field]:defaultValue(id);}
 function change(settings,id,next){validateValue(id,next);if(value(settings,id)===next)return settings;const q={version:1,...settings?.[key]},field=slot(id);q[field]=next;return{...settings,[key]:q};}
 function apply(o,settings,{mode='cad'}={}){if(mode!=='cad'||!settings?.[key]||!types.has(o?.type)||o.floorId||o.planGeometry||o.planRole||o.readonly||Object.hasOwn(o,'transparency98'))return o;const current=value(settings,'CETRANSPARENCY'),hatch=o.type==='cadHatch'?value(settings,'HPTRANSPARENCY'):'CURRENT',v=hatch==='CURRENT'?current:hatch;return v===null?o:{...o,transparency98:v};}
 const required=settings=>settings!=null&&Object.hasOwn(settings,key);
 M.cadCreationAppearance=Object.freeze({key,capability,ids,slot,defaultValue,validateValue,parse,format,validate,value,change,apply,required});
})();
