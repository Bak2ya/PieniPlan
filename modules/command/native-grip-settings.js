/* Native-named personal preferences; successful Enter never writes document geometry. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ids=['GRIPOBJLIMIT','GRIPMULTIFUNCTIONAL'];
 function install(registry,p){for(const id of ids)registry.register({id,aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'personal-settings',create(){const key=id==='GRIPOBJLIMIT'?'limit':'multifunctional',old=p.get()[key];p.prompt(id,old);return{view:()=>({phase:'gripSetting'}),describe:()=>({phase:'gripSetting',input:['integer']}),input(e){const value=e.type==='enter'?old:e.type==='text'&&/^\d+$/.test(e.text.trim())?Number(e.text):NaN;if(!Number.isInteger(value)||value<0||value>(key==='limit'?32767:3))return{ok:false,code:'invalid-grip-setting'};return{ok:true,commit:true,value};},commit(value){p.set(key,value);return true;},cancel:p.clear,finalize:p.clear};}});}
 M.nativeGripSettings=Object.freeze({install,ids});
})();
