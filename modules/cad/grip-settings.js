/* Personal grip preferences are separate from project geometry and history. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function create(storage=globalThis.localStorage){const defaults={limit:100,multifunctional:3},valid=(key,v)=>Number.isInteger(v)&&v>=0&&v<=(key==='limit'?32767:3);let current={...defaults};try{const q=JSON.parse(storage?.getItem('pieniplan-grips-v1')||'null');for(const key of Object.keys(defaults))if(valid(key,q?.[key]))current[key]=q[key];}catch{}return{get:()=>({...current}),set(key,value){if(!Object.hasOwn(defaults,key)||!valid(key,value))throw Error('invalid-grip-setting');current={...current,[key]:value};try{storage?.setItem('pieniplan-grips-v1',JSON.stringify(current));}catch{}return true;}};}
 M.cadGripSettings=Object.freeze({create});
})();
