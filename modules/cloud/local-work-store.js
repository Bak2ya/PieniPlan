/* Separate IndexedDB, leaving the existing project/recovery databases untouched. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function create({indexedDB}={}){if(indexedDB===undefined)try{indexedDB=globalThis.indexedDB;}catch{indexedDB=null;}
  function open(){return new Promise((resolve,reject)=>{if(!indexedDB)return reject(Error('local-storage-unavailable'));const q=indexedDB.open('pieniplan-drive-work-v1',1);q.onupgradeneeded=()=>q.result.createObjectStore('records',{keyPath:'key'});q.onerror=()=>reject(Error('local-storage-unavailable'));q.onblocked=()=>reject(Error('local-storage-blocked'));q.onsuccess=()=>resolve(q.result);});}
  async function transaction(mode,op){const db=await open();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('records',mode);let result;op(tx.objectStore('records'),value=>{result=value;});tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(Error('local-storage-failed'));});}finally{db.close();}}
  const get=key=>transaction('readonly',(s,done)=>{const q=s.get(key);q.onsuccess=()=>done(q.result?.value??null);});
  const put=(key,value)=>transaction('readwrite',s=>s.put({key,value}));
  const list=prefix=>transaction('readonly',(s,done)=>{const q=s.getAll();q.onsuccess=()=>done(q.result.filter(r=>r.key.startsWith(prefix)).map(r=>({key:r.key,value:r.value})));});
  return Object.freeze({get,put,list});
 }
 M.localWorkStore=Object.freeze({create});
})();
