/* Workspace menus delegate existing history and panel owners. No drawing data. */
(() => {
  'use strict';
  const root=window.PieniPlanModules=window.PieniPlanModules||{};
  function create({t,historyItems,navigateHistory,panelStatus,setPanel,closeOtherMenus,interactionBusy}){
    const $=id=>document.getElementById(id),top=document.querySelector('.topbar');
    let menu=null,anchor=null,timer=0;
    const read=(k,d)=>{try{return localStorage.getItem(k)??d;}catch(_){return d;}};
    let topPinned=read('pieniplan-toolbar-pinned','true')!=='false';
    function close({restore=false}={}){menu?.remove();menu=null;if(anchor)anchor.setAttribute('aria-expanded','false');if(restore&&anchor?.isConnected)anchor.focus({preventScroll:true});anchor=null;}
    function open(button,title){close();closeOtherMenus?.();anchor=button;menu=document.createElement('div');menu.className='floor-action-menu workspace-action-menu';menu.setAttribute('role','menu');menu.setAttribute('aria-label',title);const label=document.createElement('div');label.className='workspace-action-heading';label.textContent=title;menu.append(label);document.body.append(menu);anchor?.setAttribute('aria-expanded','true');return menu;}
    function position(button){const box=button.getBoundingClientRect(),rect=menu.getBoundingClientRect();menu.style.left=Math.max(6,Math.min(box.left,innerWidth-rect.width-6))+'px';menu.style.top=Math.max(6,Math.min(box.bottom+5,innerHeight-rect.height-6))+'px';menu.querySelector('button:not([disabled])')?.focus({preventScroll:true});}
    function item(text,action,{checked=null,disabled=false}={}){const b=document.createElement('button');b.type='button';b.setAttribute('role',checked===null?'menuitem':'menuitemcheckbox');b.textContent=text;b.disabled=disabled;if(checked!==null)b.setAttribute('aria-checked',String(checked));b.addEventListener('click',()=>{close();action();});menu.append(b);return b;}
    function showHistory(direction,button){const witness=historyItems(direction),rows=witness.entries;open(button,t('history97.'+direction));if(!rows.length)item(t('history97.empty'),()=>{},{disabled:true});rows.forEach((row,i)=>{const b=item((i+1)+' · '+row.label,()=>navigateHistory(direction,i+1,witness));b.dataset.historyCount=String(i+1);const mark=()=>{for(const x of menu?.querySelectorAll('[data-history-count]')||[])x.classList.toggle('history-included',Number(x.dataset.historyCount)<=i+1);};b.addEventListener('pointerenter',mark);b.addEventListener('focus',mark);});position(button);}
    function showPanels(button,toolButton=null){const status=panelStatus();open(button,t('workspace97.panels'));if(toolButton)item(t('workspace97.tools'),()=>toolButton.click());
      for(const area of ['top','bottom','right']){
        const value=status[area],pinned=area==='top'?topPinned:value.pinned;
        item(t('workspace97.'+area)+' · '+t(value.open?'workspace97.collapse':'workspace97.expand'),()=>setPanel(area,{open:!value.open}),{checked:value.open});
        item(t('workspace97.'+area)+' · '+t('workspace97.pin'),()=>{if(area==='top'){topPinned=!topPinned;try{localStorage.setItem('pieniplan-toolbar-pinned',String(topPinned));}catch(_){}if(topPinned)setPanel('top',{open:true});else scheduleTopClose();}else setPanel(area,{pinned:!pinned});},{checked:pinned});
      }
      item(t('workspace97.expandAll'),()=>{for(const area of ['top','bottom','right'])setPanel(area,{open:true});});
      item(t('workspace97.collapseAll'),()=>{for(const area of ['top','bottom','right'])setPanel(area,{open:false});});position(button);
    }
    for(const direction of ['undo','redo']){const button=$(direction+'Btn');button.setAttribute('aria-haspopup','menu');button.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();showHistory(direction,button);});button.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='F10'&&e.shiftKey){e.preventDefault();e.stopPropagation();showHistory(direction,button);}});}
    // Explicit menu key also works for keyboard/touch context-menu users. Existing
    // fit and history menus keep priority; category options remain a menu action.
    const panelContext=e=>{if(e.target.closest('input,textarea,[contenteditable="true"],#undoBtn,#redoBtn,#viewMenuBtn'))return;e.preventDefault();e.stopPropagation();const target=e.target.closest('button')||$('toolbarExpandBtn'),split=e.target.closest('.tool-category-split');showPanels(target,split?.querySelector('.tool-category-menu'));};top.addEventListener('contextmenu',panelContext,true);$('expandedToolRail').addEventListener('contextmenu',panelContext,true);
    $('toolbarExpandBtn').addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='F10'&&e.shiftKey){e.preventDefault();e.stopPropagation();showPanels(e.currentTarget);}});
    function scheduleTopClose(){clearTimeout(timer);if(topPinned)return;timer=setTimeout(()=>{const expanded=$('expandedToolRail');if(!menu&&!top.matches(':hover')&&!expanded?.matches(':hover')&&!top.contains(document.activeElement)&&!expanded?.contains(document.activeElement)&&!interactionBusy?.())setPanel('top',{open:false});},360);}
    top.addEventListener('pointerleave',scheduleTopClose);$('expandedToolRail').addEventListener('pointerleave',scheduleTopClose);
    document.addEventListener('pointerdown',e=>{if(menu&&!menu.contains(e.target)&&!anchor?.contains(e.target))close();});
    document.addEventListener('keydown',e=>{if(!menu)return;if(e.key==='Enter'||e.key===' '){e.stopImmediatePropagation();return;}const buttons=[...menu.querySelectorAll('button:not([disabled])')];if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close({restore:true});return;}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();const i=buttons.indexOf(document.activeElement),n=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[n]?.focus();}},true);
    window.addEventListener('resize',()=>close());
    return{close,showHistory,showPanels,status:()=>({topPinned,menuOpen:Boolean(menu)})};
  }
  root.workspaceActions={create};
})();
