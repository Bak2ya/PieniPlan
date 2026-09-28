/* CAD-only appearance values; object null means ByLayer. No Plan ownership. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 const keys=['color','linetype','lineweight'];
 function validate(patch,{layer=false}={}){
  const out={};for(const [key,v] of Object.entries(patch)){
   if(key==='color'){if(v!==null&&!/^#[0-9a-f]{6}$/i.test(v))throw new Error('invalid-color');out[key]=v;}
   else if(key==='linetype'){if(![null,'CONTINUOUS','DASHED','CENTER'].includes(v))throw new Error('invalid-linetype');out[key]=v;}
   else if(key==='lineweight'){if(![null,'DEFAULT',0.13,0.18,0.25,0.35,0.5,0.7,1].includes(v))throw new Error('invalid-lineweight');out[key]=v;}
   else if(layer&&['locked','printable'].includes(key)){if(typeof v!=='boolean')throw new Error('invalid-layer-flag');out[key]=v;}
   else throw new Error('unsupported-cad-property');
  }return out;
 }
 function common(objects,key){const values=objects.map(o=>o[key]??null);return values.every(v=>v===values[0])?{mixed:false,value:values[0]}:{mixed:true,value:null};}
 function effective(obj,layer){return Object.fromEntries(keys.map(k=>[k,obj[k]??layer?.[k]??null]));}
 root.cadProperties=Object.freeze({keys,validate,common,effective});
})();
