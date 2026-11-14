/* Append-only settings snapshots in appDataFolder. Applying is always explicit. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function create({client,store,auth,profile,uid=()=>crypto.randomUUID()}){
  let account=null,selected=null,busy=false;
  async function setAccount(q){const old=account;account=q;selected=null;if(old&&old.key!==q?.key){const key='settings:'+old.key+':pending',task=await store.get(key);if(task?.session){delete task.session;await store.put(key,task);}}}
  const list=()=>client.list({kind:'settings',space:'appDataFolder'});
  async function read(file,choices){const generation=auth.snapshot().generation,text=await client.text(file.id);auth.assertCurrent(generation);const value=M.settingsProfile.validate(JSON.parse(text)),ticket=profile.prepare(value,choices);return{file,value,ticket};}
  function apply(prepared){profile.apply(prepared.ticket);selected=prepared.file.id;}
  async function save(choices){if(!account)throw Error('auth-required');if(busy)throw Error('sync-busy');busy=true;const generation=auth.snapshot().generation,key=account.key;
   try{const value=profile.exportSelected(choices),text=JSON.stringify(value),hash=await M.driveWorkspace.digest(text),fingerprint=await M.driveWorkspace.digest(JSON.stringify(value.categories)),localKey='settings:'+key+':pending';let task=await store.get(localKey);if(!task||task.fingerprint!==fingerprint){task={id:await client.reserve('appDataFolder'),hash,fingerprint,text,operation:uid(),parent:selected||''};await store.put(localKey,task);}auth.assertCurrent(generation);const result=await client.createFile({id:task.id,name:'PieniPlan-settings-'+new Date().toISOString()+'.json',mimeType:'application/json',parents:['appDataFolder'],appProperties:{pieniApp:'PieniPlan',kind:'settings',operation:task.operation,hash:task.hash,contract:'settings-profile-1',family:'settings-v1',parent:task.parent,categories:Object.keys(value.categories).join(','),device:String(globalThis.navigator?.userAgentData?.platform||globalThis.navigator?.platform||'').slice(0,80)}},new Blob([task.text],{type:'application/json'}),{session:task.session,saveSession:async session=>{auth.assertCurrent(generation);task.session=session;await store.put(localKey,task);}});auth.assertCurrent(generation);const confirmed=await client.text(result.id);if(await M.driveWorkspace.digest(confirmed)!==task.hash)throw Error('upload-unconfirmed');await store.put('settings:'+key+':saved:'+result.id,{...task,session:null});await store.put(localKey,null);selected=result.id;return result;}finally{busy=false;}
  }
  return Object.freeze({setAccount,list,read,apply,save});
 }
 M.driveSettings=Object.freeze({create});
})();
