/* GIS browser token model. Tokens never leave this closure except as request headers. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},clientId='209960266387-i2b1427uh9lb35n1n7mg6ipb1urotodo.apps.googleusercontent.com',scopes=['https://www.googleapis.com/auth/drive.file','https://www.googleapis.com/auth/drive.appdata'];let loading;
 function load(){if(globalThis.google?.accounts?.oauth2)return Promise.resolve();if(loading)return loading;loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=()=>{if(globalThis.google?.accounts?.oauth2)resolve();else{loading=null;script.remove();reject(Error('auth-library'));}};script.onerror=()=>{loading=null;script.remove();reject(Error('network'));};document.head.append(script);});return loading;}
 function create({oauth=()=>globalThis.google?.accounts?.oauth2,clock=()=>Date.now(),changed=()=>{}}={}){
  let token=null,expires=0,epoch=0,status='disconnected',pending=null,granted=[];
  const publish=next=>{status=next;changed(snapshot());},snapshot=()=>({status:token&&clock()>=expires?'expired':status,scopes:granted.slice(),generation:epoch});
  function clear(next){epoch++;token=null;expires=0;granted=[];if(pending){pending.reject(Error('auth-cancelled'));pending=null;}publish(next);}
  function connect(){if(pending)return Promise.reject(Error('auth-pending'));const api=oauth();if(!api)return Promise.reject(Error('auth-library'));const generation=++epoch;token=null;expires=0;publish('requesting');return new Promise((resolve,reject)=>{pending={reject};const fail=code=>{if(generation!==epoch)return;pending=null;token=null;expires=0;publish(code==='network'?'network':code==='insufficient'?'insufficient':code==='auth-cancelled'?'cancelled':'auth-error');reject(Error(code));};try{const client=api.initTokenClient({client_id:clientId,scope:scopes.join(' '),include_granted_scopes:true,prompt:'select_account',callback:response=>{if(generation!==epoch)return;if(response?.error||!response?.access_token){fail(response?.error==='access_denied'?'auth-cancelled':'auth-error');return;}const ttl=Number(response.expires_in);if(!Number.isFinite(ttl)||ttl<=0){fail('auth-error');return;}if(!api.hasGrantedAllScopes(response,...scopes)){fail('insufficient');return;}token=response.access_token;expires=clock()+Math.max(0,ttl*1000-30000);granted=scopes.slice();pending=null;publish('connected');resolve(snapshot());},error_callback:e=>fail(e?.type==='popup_closed'?'auth-cancelled':e?.type==='popup_failed_to_open'?'popup-blocked':'auth-error')});client.requestAccessToken({prompt:'select_account'});}catch{fail('auth-error');}});}
  function authorization(){if(!token||clock()>=expires){token=null;expires=0;publish('expired');throw Error('auth-required');}return{header:'Bearer '+token,generation:epoch};}
  function assertCurrent(generation){if(generation!==epoch)throw Error('auth-changed');}
  function invalidate(){clear('expired');}
  function disconnect(){clear('disconnected');}
  function revoke(){const value=token;disconnect();if(!value)return Promise.reject(Error('auth-required'));return new Promise((resolve,reject)=>{try{oauth().revoke(value,result=>result?.successful?resolve():reject(Error('revoke-failed')));}catch{reject(Error('revoke-failed'));}});}
  return Object.freeze({connect,authorization,assertCurrent,invalidate,disconnect,revoke,snapshot});
 }
 M.googleDriveAuth=Object.freeze({clientId,scopes,load,create});
})();
