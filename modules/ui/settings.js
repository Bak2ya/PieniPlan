/* Settings presentation owns navigation/rows/focus; persistence remains with each
 * existing preference or document owner. No migration or broad reset occurs. */
(() => {
  'use strict'; const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  function create(port){
    const $=id=>document.getElementById(id), content=document.querySelector('.settings-content');
    const general=document.querySelector('[data-settings-panel="general"]');
    for(const page of ['environment','workspace']){const old=document.querySelector(`[data-settings-panel="${page}"]`);for(const section of [...old.querySelectorAll(':scope > .settings-section')])general.append(section);old.remove();}
    // Personal appearance/workspace first, then future-project defaults, recovery
    // and explicit import. Reordering presentation does not touch stored values.
    for(const selector of ['#settingsThemeChoices','#settingsLanguage','#settingsTextSize','#settingsSnapSensitivity','[name="inspectorOpenMethod"]','#settingsDefaultUnit','#settingsRecoveryEnabled','#settingsImportProject']){const section=general.querySelector(selector)?.closest('.settings-section');if(section)general.append(section);}
    const scrolls=new Map();let page='general',previousFocus=null;
    function row(label,description,control){const r=document.createElement('div');r.className='settings-row';const text=document.createElement('div');text.className='settings-row-label';if(label)text.append(label);if(description)text.append(description);const op=document.createElement('div');op.className='settings-operation';op.append(control);r.append(text,op);return r;}
    for(const section of general.querySelectorAll(':scope > .settings-section')){
      const select=section.querySelector(':scope > select'),title=section.querySelector(':scope > .settings-section-title'),desc=section.querySelector(':scope > .settings-section-copy');
      if(select){const label=document.createElement('label');label.htmlFor=select.id;label.textContent=title.textContent;if(title.dataset.i18n)label.dataset.i18n=title.dataset.i18n;title.remove();section.append(row(label,desc,select));}
      else if(section.querySelector('#settingsThemeChoices')){const label=section.querySelector('.settings-section-title');section.append(row(label,null,$('settingsThemeChoices')));}
    }
    // State choices keep the original radio nodes, listeners and preference keys.
    for(const group of general.querySelectorAll('.workspace-choice-group')){
      const legend=group.querySelector('legend'),label=document.createElement('span');label.textContent=legend.textContent;label.dataset.i18n=legend.dataset.i18n;
      group.setAttribute('aria-label',legend.textContent);group.dataset.i18nAria=legend.dataset.i18n;legend.remove();group.classList.add('settings-state-choice');
      for(const option of group.querySelectorAll('label')){const input=option.querySelector('input'),span=option.querySelector('span'),kind=input.name==='inspectorOpenMethod'?'Open':'Close',value=input.value==='hover'?'Hover':input.value==='auto'?'Auto':'Click';span.dataset.i18n='settings.panel'+kind+value+'Short';span.textContent=port.t(span.dataset.i18n);}
      const parent=group.parentElement;parent.append(row(label,null,group));
    }
    for(const [id,buttonId]of [['settingsRecoveryEnabled','settingsOpenRecovery'],['settingsImportPlan','settingsImportProject']]){
      const input=$(id),old=input.closest('label'),section=old.closest('.settings-section'),strong=old.querySelector('strong'),copy=old.querySelector('small')||section.querySelector(':scope > .settings-section-copy');
      const label=document.createElement('label');label.htmlFor=id;label.dataset.i18n=strong.dataset.i18n;label.textContent=strong.textContent;
      if(copy)copy.classList.add('settings-section-copy');section.insertBefore(row(label,copy,input),old);old.remove();
      const button=$(buttonId),status=id==='settingsRecoveryEnabled'?$('settingsRecoveryMeta'):null,aux=document.createElement('div');aux.className='settings-row settings-auxiliary';
      const text=document.createElement('div');text.className='settings-section-copy';if(status)text.append(status);const op=document.createElement('div');op.className='settings-operation';op.append(button);aux.append(text,op);section.append(aux);
    }
    const cad=document.querySelector('[data-settings-panel="cad"]');
    function renderPrecision(){
      const focus=document.activeElement;if(cad.contains(focus))return;
      cad.replaceChildren();const heading=document.createElement('div');heading.className='settings-page-title';heading.textContent='CAD Mode';cad.append(heading);
      const section=document.createElement('section');section.className='settings-section';const title=document.createElement('h3');title.textContent=port.t('cadPrecision.settings');section.append(title);
      const copy=document.createElement('p');copy.className='settings-section-copy';copy.textContent=port.t('settings87.cadCopy');section.append(copy);
      const s=port.precision.status(),snaps=document.createElement('fieldset');snaps.className='settings-snap-grid';const legend=document.createElement('legend');legend.textContent=port.t('cadPrecision.running');snaps.append(legend);
      for(const kind of port.precision.kinds){const label=document.createElement('label');label.className='settings-check-row';const input=document.createElement('input');input.type='checkbox';input.dataset.precision=kind;input.checked=s.modes.includes(kind);input.onchange=()=>port.configure({modes:[...snaps.querySelectorAll('input:checked')].map(el=>el.dataset.precision)});label.append(input,document.createTextNode(port.t('snap.'+kind)));snaps.append(label);}section.append(snaps);
      for(const [key,labelKey]of [['tracking','cadPrecision.tracking'],['trackingPolar','cad94.trackingPolar'],['shiftAcquire','cad94.shiftAcquire'],['additionalEnabled','cad94.additionalEnabled'],['dynamic','cadPrecision.dynamic'],['grid','cadPrecision.grid']]){const label=document.createElement('label'),input=document.createElement('input');label.textContent=port.t(labelKey);input.type='checkbox';input.checked=s[key];input.id='settingsCad-'+key;label.htmlFor=input.id;input.onchange=()=>port.configure({[key]:input.checked});section.append(row(label,null,input));}
      for(const key of ['polarAngle','gridSpacing']){const label=document.createElement('label');label.textContent=port.t('cadPrecision.'+key);label.htmlFor='settingsCad-'+key;let input;if(key==='polarAngle'){input=document.createElement('select');input.className='select-input';for(const n of [5,10,15,18,22.5,30,45,90]){const o=document.createElement('option');o.value=n;o.textContent=n+'°';input.append(o);}}else{input=document.createElement('input');input.type='number';input.min='.001';input.className='text-input settings-number';}input.id=label.htmlFor;input.value=s[key];input.onchange=()=>{const n=Number(input.value);if(n>0&&Number.isFinite(n))port.configure({[key]:n});else input.value=port.precision.status()[key];};section.append(row(label,null,input));}
      const additional=document.createElement('input');additional.type='text';additional.className='text-input';additional.id='settingsPolarAdditional';additional.value=s.polarAdditional.join(', ');additional.setAttribute('aria-label',port.t('cad87.additionalAngles'));additional.onchange=()=>{const raw=additional.value.trim(),values=raw?raw.split(/[,; ]+/).map(Number):[];if(values.length>32||values.some(n=>!Number.isFinite(n)||n<0||n>=360)){additional.setAttribute('aria-invalid','true');return;}additional.removeAttribute('aria-invalid');port.configure({polarAdditional:values,additionalEnabled:port.precision.status().additionalEnabled});};const additionalLabel=document.createElement('label');additionalLabel.htmlFor=additional.id;additionalLabel.textContent=port.t('cad87.additionalAngles');section.append(row(additionalLabel,null,additional));
      cad.append(section);
    }
    function rememberScroll(){scrolls.set(page,content.scrollTop);}
    function changePage(next){next=['environment','workspace'].includes(next)?'general':next;if(!$('settingsBackdrop').hidden)rememberScroll();page=next;if(page==='cad')renderPrecision();queueMicrotask(()=>{content.scrollTop=scrolls.get(page)||0;});return page;}
    function opened(){if(!$('settingsBackdrop').hidden)return;previousFocus=document.activeElement;queueMicrotask(()=>$('settingsCloseIcon').focus({preventScroll:true}));}
    function closed(){if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});previousFocus=null;}
    $('settingsBackdrop').addEventListener('keydown',e=>{
      e.stopPropagation();if(e.key==='Escape'){e.preventDefault();port.close();return;}
      if(e.key!=='Tab')return;const els=[...$('settingsBackdrop').querySelectorAll('button,input,select,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length),i=els.indexOf(document.activeElement);if(!els.length)return;if(e.shiftKey&&(i<=0)){e.preventDefault();els.at(-1).focus();}else if(!e.shiftKey&&(i<0||i===els.length-1)){e.preventDefault();els[0].focus();}
    });
    return {changePage,opened,closed,rememberScroll,renderPrecision,row};
  }
  root.settingsUI=Object.freeze({create});
})();
