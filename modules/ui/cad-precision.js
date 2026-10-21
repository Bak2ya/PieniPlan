/* Progressive CAD precision controls, using native form controls and dialog. */
(() => {
  'use strict';const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  function create(port){
    const host=port.host,dynamic=document.createElement('div');dynamic.className='cad-dynamic-input';dynamic.hidden=true;dynamic.setAttribute('role','group');
    const length=document.createElement('input'),angle=document.createElement('input');length.type=angle.type='text';length.inputMode=angle.inputMode='decimal';
    for(const [input,key]of [[length,'context.length'],[angle,'context.angle']]){const label=document.createElement('label');label.textContent=port.t(key);input.dataset.labelKey=key;input.setAttribute('aria-label',port.t(key));label.append(input);dynamic.append(label);}host.append(dynamic);
    let dialog=null,current=null;
    function submit(){if(!current)return;const result=port.submit(length.value,angle.value);if(result!==false&&result?.ok!==false){length.value='';angle.value='';port.focus();}else length.setAttribute('aria-invalid','true');}
    dynamic.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();submit();}else if(e.key==='Escape'){e.preventDefault();port.focus();}});
    dynamic.addEventListener('pointerdown',e=>e.stopPropagation());
    function update(){for(const input of [length,angle]){const key=input.dataset.labelKey;input.parentNode.firstChild.textContent=port.t(key);input.setAttribute('aria-label',port.t(key));}dynamic.setAttribute('aria-label',port.t('cadPrecision.dynamic'));const p=port.view();current=p;dynamic.hidden=!p;if(!p)return;const point=port.toScreen(p.point);dynamic.style.left=Math.max(8,Math.min(host.clientWidth-250,point.x+16))+'px';dynamic.style.top=Math.max(8,Math.min(host.clientHeight-65,point.y+20))+'px';if(!dynamic.contains(document.activeElement)){length.removeAttribute('aria-invalid');length.value=String(Math.round(p.length*1000)/1000)+'mm';angle.value=String(Math.round(p.angle*1000)/1000);}}
    function focus(){update();if(dynamic.hidden)return false;length.focus();length.select();return true;}
    function open(){
      dialog?.remove();dialog=document.createElement('dialog');dialog.className='cad-precision-dialog';dialog.setAttribute('aria-label',port.t('cadPrecision.settings'));
      const title=document.createElement('h3');title.textContent=port.t('cadPrecision.settings');dialog.append(title);
      const field=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=port.t('cadPrecision.running');field.append(legend);
      const settings=port.settings();for(const kind of port.kinds){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=settings.modes.includes(kind);input.dataset.snapKind=kind;input.addEventListener('change',()=>port.configure({modes:[...field.querySelectorAll('input:checked')].map(x=>x.dataset.snapKind)}));label.append(input,document.createTextNode(port.t('snap.'+kind)));field.append(label);}dialog.append(field);
      for(const [key,labelKey]of [['tracking','cadPrecision.tracking'],['dynamic','cadPrecision.dynamic'],['grid','cadPrecision.grid']]){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=!!settings[key];input.addEventListener('change',()=>port.configure({[key]:input.checked}));label.append(input,document.createTextNode(port.t(labelKey)));dialog.append(label);}
      const polar=document.createElement('label');polar.textContent=port.t('cadPrecision.polarAngle');const select=document.createElement('select');for(const n of[5,10,15,18,22.5,30,45,90]){const option=document.createElement('option');option.value=String(n);option.textContent=n+'°';select.append(option);}select.value=String(settings.polarAngle);select.onchange=()=>port.configure({polarAngle:Number(select.value)});polar.append(select);dialog.append(polar);
      const grid=document.createElement('label');grid.textContent=port.t('cadPrecision.gridSpacing');const input=document.createElement('input');input.type='number';input.min='0.001';input.value=String(settings.gridSpacing);input.onchange=()=>{const n=Number(input.value);if(n>0&&Number.isFinite(n))port.configure({gridSpacing:n});else input.value=String(port.settings().gridSpacing);};grid.append(input);dialog.append(grid);
      const hint=document.createElement('p');hint.textContent=port.t('cadPrecision.hint');dialog.append(hint);const close=document.createElement('button');close.textContent=port.t('settings.close');close.onclick=()=>dialog.close();dialog.append(close);dialog.addEventListener('close',()=>{port.focus();dialog.remove();dialog=null;});host.append(dialog);dialog.showModal();
    }
    return Object.freeze({update,focus,open,close:()=>dialog?.close()});
  }
  root.cadPrecisionUI=Object.freeze({create});
})();
