/* Local filter-dialog drafts and owned layer-transfer tickets; no document publication. */
(() => {
'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
const copy=q=>JSON.parse(JSON.stringify(q)),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),upper=s=>s.toUpperCase();
function create(W,filters,{layers,nonce}={}){
 if(typeof layers!=='function'||typeof nonce!=='string'||nonce.length<8||nonce.length>128)throw Error('invalid-layer-draft-context');
 const original=W.validateFilters(filters);let list=copy(original),serial=0,closed=false;const tickets=new Map(),live=()=>{if(closed)throw Error('closed-layer-filter-draft');},catalog=()=>{const map=new Map();for(const name of layers()){if(typeof name!=='string'||!name||name.length>255)throw Error('invalid-source-layer');if(!map.has(upper(name)))map.set(upper(name),name);}return map;},replace=(items,f)=>W.validateFilters(items.some(x=>x.id===f.id)?items.map(x=>x.id===f.id?copy(f):x):[...items,copy(f)]);
 function begin(names){live();const map=catalog();if(!Array.isArray(names)||!names.length||names.length>10000)throw Error('invalid-drag-layers');const canonical=[...new Set(names.map(n=>{if(typeof n!=='string'||!map.has(upper(n)))throw Error('unknown-drag-layer');return upper(n);} ))].map(k=>map.get(k));tickets.clear();const ticket=String(++serial);tickets.set(ticket,canonical);return JSON.stringify({type:'pieniplan-layer-drag',nonce,ticket});}
 function inspect(text,targetId,{filterDraft=null}={}){
  live();if(typeof text!=='string'||text.length>512)throw Error('foreign-layer-drag');let payload;try{payload=JSON.parse(text);}catch{throw Error('foreign-layer-drag');}
  if(!payload||Array.isArray(payload)||Object.keys(payload).some(k=>!['type','nonce','ticket'].includes(k))||payload.type!=='pieniplan-layer-drag'||payload.nonce!==nonce||typeof payload.ticket!=='string'||!tickets.has(payload.ticket))throw Error('foreign-layer-drag');
  const map=catalog(),source=tickets.get(payload.ticket);if(source.some(n=>!map.has(upper(n))))throw Error('stale-drag-layer');
  const staged=filterDraft?replace(list,filterDraft):copy(list),target=staged.find(f=>f.id===targetId);if(!target||target.kind!=='group')throw Error('invalid-drop-group');
  const after=W.groupMembers(target,source.map(n=>map.get(upper(n))),'add'),next=replace(staged,after);return{ticket:payload.ticket,targetId,changed:!eq(next,list),filters:next};
 }
 function drop(text,targetId,options){const q=inspect(text,targetId,options);list=q.filters;tickets.delete(q.ticket);return{changed:q.changed,targetId,filters:copy(list)};}
 function stage(filter){live();list=replace(list,filter);return copy(list);}
 return Object.freeze({begin,inspect,drop,stage,end(){tickets.clear();},cancel(){closed=true;tickets.clear();},snapshot(){live();return copy(list);},get changed(){live();return !eq(list,original);}});
}
M.cadLayerFilterDraft=Object.freeze({mime:'application/x-pieniplan-layer-filter-v1',create:(filters,options)=>create(M.cadPropertyWorkflows,filters,options)});
})();
