(() => {
  let worker=null,seq=0;
  const pending=new Map();
  function settle(id,ok,value){const p=pending.get(id);if(!p)return;pending.delete(id);p.cleanup();ok?p.resolve(value):p.reject(value);}
  function ensureWorker(){
    if(worker)return worker;
    const current=new Worker('workers/dxf-worker.js');worker=current;
    current.onmessage=e=>{
      if(worker!==current)return;
      const {id,ok,result,error,progress}=e.data||{},p=pending.get(id);if(!p)return;
      if(progress){try{p.onProgress?.(progress);}catch(err){settle(id,false,err);}return;}
      settle(id,Boolean(ok),ok?result:new Error(error||'DXF analysis failed.'));
    };
    current.onerror=e=>{if(worker!==current)return;dispose(new Error(e.message||'DXF Worker error'));};
    return current;
  }
  function parseAndAnalyze(text,onProgress,{signal}={}){
    return new Promise((resolve,reject)=>{
      if(signal?.aborted){reject(new DOMException('Import cancelled.','AbortError'));return;}
      const id=++seq,abort=()=>{settle(id,false,new DOMException('Import cancelled.','AbortError'));if(!pending.size&&worker){worker.terminate();worker=null;}};
      pending.set(id,{resolve,reject,onProgress,cleanup:()=>signal?.removeEventListener('abort',abort)});
      signal?.addEventListener('abort',abort,{once:true});
      try{ensureWorker().postMessage({id,type:'parseAndAnalyze',text,lang:document.documentElement.lang||'en'});}catch(err){settle(id,false,err);}
    });
  }
  function dispose(reason=new DOMException('Drawing task closed.','AbortError')){
    worker?.terminate();worker=null;for(const id of [...pending.keys()])settle(id,false,reason);
  }
  window.PieniPlanDXF={parseAndAnalyze,dispose};
})();
