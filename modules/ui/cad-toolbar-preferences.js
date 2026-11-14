/* Personal visibility is separate from command availability and document data. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},key='pieniplan-cad-toolbar-v1',copy=q=>JSON.parse(JSON.stringify(q));
 function validate(q){if(!q||q.version!==1||Object.keys(q).some(k=>!['version','visibility'].includes(k))||!q.visibility||Array.isArray(q.visibility)||Object.entries(q.visibility).some(([k,v])=>!k||k.length>100||['__proto__','constructor','prototype'].includes(k)||typeof v!=='boolean'))throw Error('toolbar-profile-version');return copy(q);}
 function create({storage,features,onChange=()=>{}}){
  if(storage===undefined)try{storage=globalThis.localStorage;}catch{storage=null;}let value={version:1,visibility:{}},blocked=storage?false:'storage';try{const raw=storage?.getItem(key);if(raw)value=validate(JSON.parse(raw));}catch{blocked=true;}
  const extraTools=new Set('SELECTPREVIOUS SELECTLAST SELECTSIMILAR PROPERTIES BATCHPROPERTIES UCS ISODRAFT ZOOM ARRAYEDIT OOPS EXPLODE MATCHPROP REGIONROTATE DIMORDINATE DIMARC DIMJOGGED DIMTEDIT DIMEDIT DIMREASSOCIATE DIMDISASSOCIATE DIMREGEN DIMSTYLE TEXTEDIT STYLE LAYER LAYERFILTER SETBYLAYER BLOCK INSERT BEDIT BLOCKS WBLOCK OSNAP SHEET SHEETMANAGER'.split(' '));
  const rows=category=>features.rows(category).filter(r=>r.executable&&(r.primary||extraTools.has(r.command))),defaultVisible=r=>Boolean(r.executable&&(r.primary||['BLOCK','DIMSTYLE','OSNAP'].includes(r.command))),visible=r=>r.executable&&(value.visibility[r.id]??defaultVisible(r));
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
  const notice=D.createElement('p');notice.className='settings-section-copy';notice.hidden=true;notice.setAttribute('role','status');container.append(notice);
  function change(action){try{action();notice.hidden=true;}catch{notice.textContent=t('personal106.saveFailed');notice.hidden=false;}refresh();}
  const reset=D.createElement('button');reset.type='button';reset.className='small-button';reset.textContent=t('personal105.defaults');reset.onclick=()=>change(()=>preferences.reset());container.append(reset);
  const groups=[];
  const remembered=render.openGroups||new Set();
  for(const cat of categories){const items=preferences.rows(cat.id);if(!items.length)continue;
   const group=D.createElement('section'),head=D.createElement('div'),toggle=D.createElement('button'),state=D.createElement('label'),all=D.createElement('input'),count=D.createElement('span'),list=D.createElement('div');
   group.className='personal-tool-group106';head.className='personal-tool-head106';toggle.type='button';toggle.className='personal-tool-toggle106';toggle.textContent=t(cat.labelKey);toggle.dataset.toolGroup=cat.id;list.id='personal-tool-list106-'+cat.id;list.className='personal-tool-list106';list.hidden=!remembered.has(cat.id);toggle.setAttribute('aria-controls',list.id);toggle.setAttribute('aria-expanded',String(!list.hidden));
   toggle.onclick=()=>{list.hidden=!list.hidden;toggle.setAttribute('aria-expanded',String(!list.hidden));if(list.hidden)remembered.delete(cat.id);else remembered.add(cat.id);};
   state.className='personal-tool-state106';all.type='checkbox';all.setAttribute('aria-label',t(cat.labelKey)+' · '+t('personal105.all'));all.onchange=()=>change(()=>preferences.group(cat.id,all.checked));state.append(count,all);head.append(toggle,state);group.append(head,list);const inputs=[];
   for(const r of items){const label=D.createElement('label');label.className='settings-check-row';const input=D.createElement('input');input.type='checkbox';input.dataset.featureId=r.id;const text=D.createElement('span');text.textContent=(r.labelKey?t(r.labelKey):M.cadFeatureStatus.text(r.label,language))+(r.status==='normal'?'':' · '+M.cadFeatureStatus.text(M.cadFeatureStatus.states[r.status],language));input.onchange=()=>change(()=>preferences.set(r.id,input.checked));label.append(input,text);list.append(label);inputs.push({input,r});}
   container.append(group);groups.push({all,inputs,count});
  }
  render.openGroups=remembered;
  function refresh(){for(const g of groups){for(const q of g.inputs)q.input.checked=preferences.visible(q.r);const n=g.inputs.filter(q=>q.input.checked).length;g.all.checked=n===g.inputs.length;g.all.indeterminate=n>0&&n<g.inputs.length;g.count.textContent=t('personal106.count',{shown:n,total:g.inputs.length})+(g.all.indeterminate?' · '+t('personal106.partial'):'');}}
  refresh();return{refresh};
 }
 M.cadToolbarPreferences=Object.freeze({key,validate,create,render});
})();
