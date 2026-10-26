/* Transient overlap chooser; hover previews, only acceptance changes selection. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 function create(p){let box=null,previous=null,index=0,items=[],choice=null;
  function close({focus=true}={}){if(!box)return false;box.remove();box=null;p.preview(previous);previous=null;items=[];choice=null;if(focus)p.focus();return true;}
  function move(i){if(!box||!items.length)return;index=(i+items.length)%items.length;for(const [j,b]of [...box.querySelectorAll('[role=option]')].entries()){b.setAttribute('aria-selected',String(j===index));b.tabIndex=j===index?0:-1;}p.preview(items[index].id);box.querySelectorAll('[role=option]')[index]?.focus({preventScroll:true});}
  function open(objects,event,accept){close({focus:false});if(objects.length<2)return false;items=objects.slice();choice=accept;previous=p.hovered();index=0;box=document.createElement('div');box.className='canvas-context-menu cad-selection-candidates';box.setAttribute('role','listbox');box.setAttribute('aria-label',p.t('cad94.selectionCandidates'));box.style.position='fixed';
   for(const [i,o]of items.entries()){const b=document.createElement('button');b.type='button';b.setAttribute('role','option');b.dataset.objectId=o.id;b.setAttribute('aria-selected',String(i===0));b.tabIndex=i===0?0:-1;b.textContent=p.label(o);b.onpointerenter=()=>move(i);b.onclick=()=>{const selected=items[i],fn=choice;close({focus:false});fn(selected);p.focus();};box.append(b);}
   box.onkeydown=e=>{e.stopPropagation();if(['Escape','ArrowDown','ArrowUp','Home','End','Enter',' '].includes(e.key))e.preventDefault();if(e.key==='Escape')close();else if(e.key==='ArrowDown')move(index+1);else if(e.key==='ArrowUp')move(index-1);else if(e.key==='Home')move(0);else if(e.key==='End')move(items.length-1);else if(e.key==='Enter'||e.key===' ')box.querySelectorAll('button')[index]?.click();};
   p.host.append(box);const r=box.getBoundingClientRect();box.style.left=Math.max(8,Math.min(event.clientX,window.innerWidth-r.width-8))+'px';box.style.top=Math.max(8,Math.min(event.clientY,window.innerHeight-r.height-8))+'px';move(0);return true;
  }
  document.addEventListener('pointerdown',e=>{if(box&&!box.contains(e.target))close({focus:false});},true);
  return Object.freeze({open,close,get active(){return!!box;}});
 }
 M.selectionCyclingUI=Object.freeze({create});
})();
