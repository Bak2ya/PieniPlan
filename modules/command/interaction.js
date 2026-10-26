/* Personal CAD input preferences. Never stored in a drawing or copied to Plan. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ids=['SELECTIONCYCLING','POLARMODE'];
 function create(storage=globalThis.localStorage){
  let value={timeSensitive:false,rightClickDuration:250,selectionCycling:1};
  function clean(p){const q={...value};if(typeof p?.timeSensitive==='boolean')q.timeSensitive=p.timeSensitive;if(Number.isInteger(p?.rightClickDuration)&&p.rightClickDuration>=100&&p.rightClickDuration<=2000)q.rightClickDuration=p.rightClickDuration;if(Number.isInteger(p?.selectionCycling)&&Math.abs(p.selectionCycling)<=2)q.selectionCycling=p.selectionCycling;return q;}
  try{value=clean(JSON.parse(storage?.getItem('pieniplan-cad-interaction-v1')||'null'));}catch{}
  return Object.freeze({status:()=>({...value}),configure(p){value=clean(p);try{storage?.setItem('pieniplan-cad-interaction-v1',JSON.stringify(value));}catch{}return{...value};},rightClick(duration,{shift=false}={}){return value.timeSensitive&&!shift&&Number.isFinite(duration)&&duration>=0&&duration<value.rightClickDuration?'enter':'menu';}});
 }
 function install(registry,p){for(const id of ids)registry.register({id,aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'personal-preference',create(){const d={phase:'value',value:p.get(id)};p.prompt(id,d.value);return{view:()=>d,describe:()=>({phase:'value',input:['text','enter'],actions:[]}),input(e){if(e.type==='enter')return{ok:true,commit:true,value:d.value};const n=Number(e.text);if(!String(e.text||'').trim()||!Number.isInteger(n)||(id==='SELECTIONCYCLING'?Math.abs(n)>2:n<0||n>15))return{ok:false,code:'invalid-input'};return{ok:true,commit:true,value:n};},commit:n=>p.set(id,n),cancel(){},finalize(){p.clear();}};}});}
 M.cadInteraction=Object.freeze({create,install,ids});
})();
