/* One CAD disclosure surface for both Compact and Expanded. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function render({container,features,category,language,t,activate,restoreFocus,position,activeTool=null,iconFor=()=>null,bindingFor=row=>({aliases:row.aliases||[],shortcut:''})}){
  const S=M.cadFeatureStatus,L=p=>S.text(p,language),D=container.ownerDocument;
  container.replaceChildren();container.classList.add('cad-feature-menu');container.setAttribute('role','menu');container.setAttribute('aria-label',t('category.'+category));
  const label=row=>row.labelKey?t(row.labelKey):L(row.label),rows=features.rows(category);
  let variables=null;
  for(const row of rows){let parent=container;if(Object.hasOwn(S.variableLabels,row.command||'')){
    if(!variables){variables=D.createElement('details');variables.className='cad-feature-variables';const summary=D.createElement('summary');summary.textContent=L(['치수 표기·맞춤 설정','Dimension format / fit settings']);variables.append(summary);container.append(variables);variables.addEventListener('toggle',()=>position?.());}parent=variables;
   }
   const wrap=D.createElement('div');wrap.className='cad-feature-row';wrap.dataset.feature=row.id;const button=D.createElement('button');button.type='button';button.className='tool-item cad-feature-command'+(row.tool&&row.tool===activeTool?' active':'');button.setAttribute('role','menuitem');if(row.tool&&row.tool===activeTool)button.setAttribute('aria-current','true');button.disabled=!row.executable;button.dataset.featureState=row.status;
   if(row.command)button.dataset.command=row.command;if(row.tool)button.dataset.bindingTool=row.tool;
   const icon=iconFor(row);if(icon){const span=D.createElement('span');span.className='ui-icon icon-'+icon;span.setAttribute('aria-hidden','true');button.append(span);}const name=D.createElement('span');name.className='cad-feature-name';name.textContent=label(row);button.append(name);
   if(row.status!=='normal'){const badge=D.createElement('span');badge.className='cad-feature-state '+row.status;badge.textContent=L(S.states[row.status]);button.append(badge);}
   const binding=bindingFor(row),aliases=[...new Set(binding.aliases||[])],shortAlias=aliases.find(a=>a!==row.command),note=shortAlias||row.note||'';if(note){const span=D.createElement('span');span.className='tool-item-note cad-feature-shortcut';span.textContent=note;button.append(span);}if(binding.shortcut)button.dataset.shortcut=binding.shortcut;
   const description=[row.command?aliases.join(' / ')||row.command:'',binding.shortcuts?.join(' / ')||binding.shortcut,L(row.support),L(row.limits),...(row.options||[]).map(o=>L(o.label)+' · '+L(S.states[o.status])+' — '+L(o.scope))].filter(Boolean).join('\n');button.title=description;button.setAttribute('aria-label',label(row)+(row.status==='normal'?'':' · '+L(S.states[row.status])));
   button.addEventListener('click',()=>{if(!row.executable)return;container.hidden=true;activate(row);});wrap.append(button);
   const info=D.createElement('button');info.type='button';info.className='cad-feature-info';info.textContent='…';info.setAttribute('role','menuitem');info.setAttribute('aria-label',label(row)+' · '+L(['지원 범위와 제한','Support and limitations']));info.setAttribute('aria-expanded','false');
   const copy=D.createElement('div');copy.className='cad-feature-description';copy.hidden=true;copy.id='cad-feature-description-'+row.id.replace(/[^a-z0-9-]/gi,'-');copy.textContent=description;info.setAttribute('aria-controls',copy.id);button.setAttribute('aria-describedby',copy.id);
   info.addEventListener('click',()=>{copy.hidden=!copy.hidden;info.setAttribute('aria-expanded',String(!copy.hidden));position?.();});wrap.append(info,copy);parent.append(wrap);
  }
  // A menu's keyboard scope is local; drawing shortcuts never receive these keys.
  container.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();container.hidden=true;restoreFocus?.();return;}if(['Enter',' '].includes(e.key)){e.stopPropagation();return;}if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
   const nodes=[...container.querySelectorAll('button:not([disabled]),summary')].filter(n=>!n.closest('details:not([open])')||n.tagName==='SUMMARY');if(!nodes.length)return;e.preventDefault();e.stopImmediatePropagation();const i=nodes.indexOf(D.activeElement),index=e.key==='Home'?0:e.key==='End'?nodes.length-1:(i+(e.key==='ArrowDown'?1:-1)+nodes.length)%nodes.length;nodes[index]?.focus({preventScroll:false});};
  return rows;
 }
 function clear(container){container.classList.remove('cad-feature-menu');container.removeAttribute('role');container.removeAttribute('aria-label');container.onkeydown=null;}
 M.cadFeatureMenu=Object.freeze({render,clear});
})();
