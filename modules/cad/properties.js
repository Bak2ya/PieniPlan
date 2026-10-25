/* CAD-only appearance values; object null means ByLayer. No Plan ownership. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 const keys=['color','linetype','lineweight'];
 let typeNames=()=>['CONTINUOUS','DASHED','CENTER'];
 const configure=fn=>{typeNames=fn;},linetypes=()=>[...new Set(['CONTINUOUS','DASHED','CENTER',...typeNames()])];
 const lineweights=[0,.05,.09,.13,.15,.18,.2,.25,.3,.35,.4,.5,.53,.6,.7,.8,.9,1,1.06,1.2,1.4,1.58,2,2.11];
 const normalized=v=>typeof v==='string'&&['BYLAYER','BYBLOCK'].includes(v.toUpperCase())?v.toUpperCase()==='BYLAYER'?null:'BYBLOCK':v;
 function validate(patch,{layer=false}={}){
  const out={};for(const [key,raw] of Object.entries(patch)){let v=normalized(raw);
   if(layer&&v==='BYBLOCK')throw Error('invalid-layer-inheritance');
   if(key==='color'){if(typeof v==='string'&&/^#[0-9a-f]{3}$/i.test(v))v='#'+[...v.slice(1)].map(c=>c+c).join('');if(v!==null&&v!=='BYBLOCK'&&!/^#[0-9a-f]{6}$/i.test(v))throw new Error('invalid-color');out[key]=v;}
   else if(key==='linetype'){if(v!==null&&v!=='BYBLOCK'&&!linetypes().some(n=>n.toUpperCase()===String(v).toUpperCase()))throw new Error('invalid-linetype');out[key]=typeof v==='string'&&v!=='BYBLOCK'?linetypes().find(n=>n.toUpperCase()===v.toUpperCase())||v:v;}
   else if(key==='lineweight'){if(![null,'BYBLOCK','DEFAULT',...lineweights].includes(v))throw new Error('invalid-lineweight');out[key]=v;}
   else if(!layer&&key==='linetypeScale'){if(!Number.isFinite(v)||v<=0||v>1e9)throw Error('invalid-linetype-scale');out[key]=v;}
   else if(!layer&&key==='linetypeGeneration'){if(typeof v!=='boolean')throw Error('invalid-linetype-generation');out[key]=v;}
   else if(layer&&['locked','printable','frozen'].includes(key)){if(typeof v!=='boolean')throw new Error('invalid-layer-flag');out[key]=v;}
   else throw new Error('unsupported-cad-property');
  }return out;
 }
 function common(objects,key){const values=objects.map(o=>normalized(o[key])??null);return values.every(v=>v===values[0])?{mixed:false,value:values[0]}:{mixed:true,value:null};}
 function effective(obj,layer,parent={}){return Object.fromEntries(keys.map(k=>{const v=normalized(obj[k]);return[k,v==='BYBLOCK'?parent[k]??null:v??layer?.[k]??null];}));}
 root.cadProperties=Object.freeze({keys,lineweights,validate,common,effective,configure,linetypes});
})();
