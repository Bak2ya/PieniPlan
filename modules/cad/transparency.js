/* Optional CAD appearance only. Percent transparency is independent of legacy hatch opacity. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},key='transparency98',capability='cad.transparency.v1';
 const normalized=v=>v==null||typeof v==='string'&&v.toUpperCase()==='BYLAYER'?null:typeof v==='string'&&v.toUpperCase()==='BYBLOCK'?'BYBLOCK':v;
 function validate(value,{layer=false,imported=false}={}){const v=normalized(value);if(v===null)return null;if(v==='BYBLOCK'&&!layer)return v;if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>(imported?100:90))throw Error('invalid-cad-transparency');return v;}
 function effective(o,layer={},parent={}){const v=normalized(o?.[key]);return typeof v==='number'?v:v==='BYBLOCK'?typeof parent[key]==='number'?parent[key]:0:typeof layer?.[key]==='number'?layer[key]:0;}
 const alpha=(o,layer,parent)=>1-effective(o,layer,parent)/100;
 function decode(raw){const n=Number(raw);if(!Number.isInteger(n)||n<0||n>0x02ffffff)return undefined;if(n===0x01000000)return'BYBLOCK';if((n>>>24)===2&&(n&0x00ffff00)===0)return (255-(n&255))*100/255;return undefined;}
 function encode(value){const v=validate(value,{imported:true});return v===null?null:v==='BYBLOCK'?0x01000000:0x02000000|Math.floor(255*(1-v/100)+1e-9);}
 function entityPairs(o){if(!Object.hasOwn(o,key))return null;const value=encode(o[key]);return value===null?[]:[[440,value]];}
 function fromEntity(raw){const pair=raw.find(p=>p[0]===440),v=pair?decode(pair[1]):undefined;return v===undefined?{}:{[key]:v};}
 function fromLayer(raw){let inside=false;for(const[c,v]of raw){if(c===1001)inside=v==='AcCmTransparency';else if(inside&&c===1071){const value=decode(v);return typeof value==='number'?{[key]:value}:{};}}return{};}
 function layerData(layer,raw=[]){const out=[];let inside=false;for(const p of raw){if(p[0]===1001)inside=p[1]==='AcCmTransparency';if(p[0]>=1000&&!inside)out.push(p);}if(Object.hasOwn(layer,key)){const value=validate(layer[key],{layer:true,imported:true});if(value!==null)out.push([1001,'AcCmTransparency'],[1071,encode(value)]);}else for(let i=0;i<raw.length;i++){if(raw[i][0]===1001&&raw[i][1]==='AcCmTransparency'){out.push(raw[i]);for(let j=i+1;j<raw.length&&raw[j][0]>=1000&&raw[j][0]!==1001;j++)out.push(raw[j]);}}
 return out;}
 function required(objects=[],layers=[]){return [...objects,...(layers instanceof Map?layers.values():layers)].some(o=>o?.[key]!=null);}
 function validateDocument(d,caps){const objects=[...(d.objects||[]),...(d.blockDefinitions||[]).flatMap(b=>b.objects||[])],layers=d.cadLayerDefinitions||[];if(required(objects,layers)&&!caps.includes(capability))throw Error('transparency-capability-required');for(const o of objects)if(Object.hasOwn(o,key)){if(!String(o.type).startsWith('cad'))throw Error('transparency-cad-only');validate(o[key],{imported:true});}for(const l of layers)if(Object.hasOwn(l,key))validate(l[key],{layer:true,imported:true});}
 root.cadTransparency=Object.freeze({key,capability,normalized,validate,effective,alpha,decode,encode,entityPairs,fromEntity,fromLayer,layerData,required,validateDocument});
})();
