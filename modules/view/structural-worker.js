/* Dedicated optional analysis worker. No document state, network, or mutation commands. */
importScripts('floor-alignment.js','structural-alignment.js');
self.onmessage=e=>{const {id,op,data}=e.data||{};try{const C=self.PieniPlanModules.structuralAlignment;let result;if(op==='extract')result=data.map(C.extract);else if(op==='automatic')result=C.automatic(data.source,data.target,data.options);else throw Error('unsupported-analysis-operation');self.postMessage({id,result});}catch(error){self.postMessage({id,error:String(error.message||error)});}};
