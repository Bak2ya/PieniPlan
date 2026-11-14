/* Personal visibility is separate from command availability and document data. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},key='pieniplan-cad-toolbar-v1',copy=q=>JSON.parse(JSON.stringify(q));
 function validate(q){if(!q||q.version!==1||Object.keys(q).some(k=>!['version','visibility'].includes(k))||!q.visibility||Array.isArray(q.visibility)||Object.entries(q.visibility).some(([k,v])=>!k||k.length>100||['__proto__','constructor','prototype'].includes(k)||typeof v!=='boolean'))throw Error('toolbar-profile-version');return copy(q);}
 function create({storage,features,onChange=()=>{}}){
  if(storage===undefined)try{storage=globalThis.localStorage;}catch{storage=null;}let value={version:1,visibility:{}},blocked=storage?false:'storage';try{const raw=storage?.getItem(key);if(raw)value=validate(JSON.parse(raw));}catch{blocked=true;}
  const rows=category=>features.rows(category),defaultVisible=r=>Boolean(r.executable&&(r.primary||['BLOCK','DIMSTYLE','OSNAP'].includes(r.command))),visible=r=>r.executable&&(value.visibility[r.id]??defaultVisible(r));
  function apply(q,{persist=true}={}){const next=validate(q);if(blocked)throw Error('toolbar-profile-version');if(persist)storage?.setItem(key,JSON.stringify(next));value=next;onChange();return copy(value);}
  function prepare(q){const next=validate(q),known=new Set(Object.keys(M.cadFeatureStatus.groups).flatMap(cat=>rows(cat)).map(r=>r.id));next.visibility={...Object.fromEntries(Object.entries(value.visibility).filter(([id])=>!known.has(id))),...next.visibility};return next;}
  function set(id,show){if(typeof show!=='boolean')throw Error('toolbar-profile-value');return apply({version:1,visibility:{...value.visibility,[id]:show}});}
  function group(category,show){const visibility={...value.visibility};for(const r of rows(category))if(r.executable)visibility[r.id]=Boolean(show);return apply({version:1,visibility});}
  function reset(){const visibility={...value.visibility};for(const category of Object.keys(M.cadFeatureStatus.groups))for(const r of rows(category))delete visibility[r.id];return apply({version:1,visibility});}
  return Object.freeze({key,rows,visible,defaultVisible,set,group,reset,validate,prepare,apply,export:()=>{if(blocked)throw Error('toolbar-profile-version');return copy(value);},blocked:()=>Boolean(blocked),blockedReason:()=>blocked});
 }
 function render({container,preferences,categories,t,language}){
  const D=container.ownerDocument,heading=D.createElement('h3');heading.textContent=t('personal105.tools');container.append(heading);
  if(preferences.blocked()){const warning=D.createElement('p');warning.textContent=t(preferences.blockedReason()==='storage'?'personal105.storage':'personal105.future');container.append(warning);return;}
  const reset=D.createElement('button');reset.type='button';reset.className='small-button';reset.textContent=t('personal105.defaults');reset.onclick=()=>{preferences.reset();refresh();};container.append(reset);
  const groups=[];
  for(const cat of categories){const details=D.createElement('details'),summary=D.createElement('summary'),all=D.createElement('input'),name=D.createElement('span');all.type='checkbox';all.setAttribute('aria-label',t(cat.labelKey)+' · '+t('personal105.all'));name.textContent=t(cat.labelKey);summary.append(name,all);details.append(summary);const inputs=[];all.onclick=e=>e.stopPropagation();all.onchange=()=>{preferences.group(cat.id,all.checked);refresh();};
   for(const r of preferences.rows(cat.id)){const label=D.createElement('label');label.className='settings-check-row';const input=D.createElement('input');input.type='checkbox';input.dataset.featureId=r.id;input.disabled=!r.executable;const text=D.createElement('span');text.textContent=(r.labelKey?t(r.labelKey):M.cadFeatureStatus.text(r.label,language))+(r.status==='normal'?'':' · '+M.cadFeatureStatus.text(M.cadFeatureStatus.states[r.status],language));input.onchange=()=>{preferences.set(r.id,input.checked);refresh();};label.append(input,text);details.append(label);inputs.push({input,r});}
   container.append(details);groups.push({all,inputs});
  }
  function refresh(){for(const g of groups){for(const q of g.inputs)q.input.checked=preferences.visible(q.r);const enabled=g.inputs.filter(q=>!q.input.disabled),n=enabled.filter(q=>q.input.checked).length;g.all.checked=enabled.length>0&&n===enabled.length;g.all.indeterminate=n>0&&n<enabled.length;}}
  refresh();return{refresh};
 }
 M.cadToolbarPreferences=Object.freeze({key,validate,create,render});
})();
