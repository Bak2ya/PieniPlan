/* Browser facade over the pure codec. Parse/export work stays off the UI thread. */
(() => {
 'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},url=new URL('architectural-worker.js',document.currentScript.src);
 function run(operation,input,{signal=null}={}){return new Promise((resolve,reject)=>{if(signal?.aborted){reject(new DOMException('Cancelled','AbortError'));return;}const worker=new Worker(url),finish=(error,result)=>{worker.terminate();signal?.removeEventListener('abort',cancel);error?reject(error):resolve(result);},cancel=()=>finish(new DOMException('Cancelled','AbortError'));worker.onmessage=({data})=>finish(data.ok?null:new Error(data.error),data.result);worker.onerror=event=>finish(new Error(event.message||'dxf-worker-failed'));signal?.addEventListener('abort',cancel,{once:true});worker.postMessage({operation,input},input instanceof ArrayBuffer?[input]:[]);});}
 root.architecturalDxfBridge=Object.freeze({parse:(input,options)=>run('parse',input,options),write:(input,options)=>run('write',input,options)});
})();
