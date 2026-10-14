/* PieniPlan / DWG2DXF local DXF handoff protocol v1.
 * Both GitHub Pages apps must run in the same browser profile AND same origin.
 * Do not treat sourceApp/ID as authentication; any script on this origin can access
 * IndexedDB. Never execute content provided by a handoff record.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PieniPlanDxfHandoff=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const PROTOCOL='dwg2dxf-pieniplan', VERSION=1;
  const DB_NAME='pieniplan-dxf-handoff', STORE_NAME='transfers', DB_VERSION=1;
  const QUERY_PARAM='dxfHandoff', TTL_MS=30*60*1000;
  const MAX_BYTES=128*1024*1024;
  const UUID_V4=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  function failure(reason){const e=new Error(reason);e.code=reason;return e;}
  function isValidId(id){return typeof id==='string'&&UUID_V4.test(id);}
  function cleanFilename(s){
    if(typeof s!=='string')throw failure('INVALID_FILENAME');
    const x=s.split(/[\\/]/).pop().replace(/[\x00-\x1f\x7f]/g,'').trim();
    if(!x||x.length>240||!x.toLowerCase().endsWith('.dxf'))throw failure('INVALID_FILENAME');
    return x;
  }
  function validate(record,now=Date.now()){
    if(!record||typeof record!=='object'||record.protocol!==PROTOCOL||record.version!==VERSION)throw failure('UNSUPPORTED_PROTOCOL');
    if(!isValidId(record.id)||record.sourceApp!=='DWG2DXF')throw failure('INVALID_SENDER');
    const createdAt=record.createdAt,expiresAt=record.expiresAt;
    if(!Number.isSafeInteger(createdAt)||!Number.isSafeInteger(expiresAt)||createdAt>now+120000||expiresAt<=createdAt||expiresAt-createdAt>TTL_MS||expiresAt<=now)throw failure('EXPIRED');
    const filename=cleanFilename(record.convertedFileName);
    if(typeof record.originalFileName!=='string'||record.originalFileName.length>240)throw failure('INVALID_FILENAME');
    const data=record.dxfData;
    if(!(data instanceof ArrayBuffer)&&!(typeof Blob!=='undefined'&&data instanceof Blob))throw failure('INVALID_PAYLOAD');
    const byteLength=data instanceof ArrayBuffer?data.byteLength:data.size;
    if(byteLength<8||byteLength>MAX_BYTES)throw failure('INVALID_SIZE');
    const val=record.validation;
    if(val!=null&&(typeof val!=='object'||Array.isArray(val)||typeof val.needsReview!=='boolean'||(val.differences!=null&&(!Array.isArray(val.differences)||val.differences.length>50||val.differences.some(s=>typeof s!=='string'||s.length>300)))))throw failure('INVALID_VALIDATION');
    return {filename,byteLength,validation:val||null};
  }
  function openDb(){
    return new Promise((resolve,reject)=>{
      if(typeof indexedDB==='undefined')return reject(failure('STORAGE_UNAVAILABLE'));
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME,{keyPath:'id'});};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||failure('STORAGE_UNAVAILABLE'));
      req.onblocked=()=>reject(failure('STORAGE_BLOCKED'));
    });
  }
  async function read(id){
    if(!isValidId(id))throw failure('INVALID_ID');
    const db=await openDb();
    try{return await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE_NAME,'readonly');
      const req=tx.objectStore(STORE_NAME).get(id);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error||failure('READ_FAILED'));
      tx.onabort=()=>reject(tx.error||failure('READ_FAILED'));
    });}finally{db.close();}
  }
  async function remove(id){
    if(!isValidId(id))throw failure('INVALID_ID');
    const db=await openDb();
    try{return await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error||failure('DELETE_FAILED'));
      tx.onabort=()=>reject(tx.error||failure('DELETE_FAILED'));
    });}finally{db.close();}
  }
  async function purgeExpired(now=Date.now()){
    const db=await openDb();let count=0;
    try{await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE_NAME,'readwrite');
      const req=tx.objectStore(STORE_NAME).openCursor();
      req.onsuccess=()=>{
        const cursor=req.result;if(!cursor)return;
        const x=cursor.value;
        if(!x||!Number.isFinite(x.expiresAt)||x.expiresAt<=now){cursor.delete();count++;}
        cursor.continue();
      };
      tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||failure('PURGE_FAILED'));
      tx.onabort=()=>reject(tx.error||failure('PURGE_FAILED'));
    });return count;}finally{db.close();}
  }
  async function toFile(record){
    const meta=validate(record),bytes=record.dxfData;
    const file=new File([bytes],meta.filename,{type:'application/dxf',lastModified:record.createdAt});
    return {file,validation:meta.validation};
  }
  return Object.freeze({PROTOCOL,VERSION,DB_NAME,DB_VERSION,STORE_NAME,QUERY_PARAM,TTL_MS,MAX_BYTES,isValidId,validate,openDb,read,remove,purgeExpired,toFile});
});
