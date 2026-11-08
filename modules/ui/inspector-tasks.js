/* Session-only inspector task tabs. No drawing, camera or personal settings. */
(() => {
  'use strict';
  const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  function create(p){
    const panel=document.getElementById('workspaceInspector'),tabs=panel.querySelector('.inspector-tabs'),body=panel.querySelector('.inspector-body'),items=new Map();let lastBase=p.current()||'primary';
    function refresh(){tabs.style.setProperty('--inspector-tab-count',String([...tabs.querySelectorAll('.inspector-tab')].filter(b=>!b.hidden).length));}
    function sync(id){if(!items.has(id))lastBase=id;for(const [key,item]of items)item.slot.classList.toggle('active',key===id);refresh();}
    function close(id){const item=items.get(id);if(!item)return false;const active=p.current()===id;items.delete(id);item.slot.remove();item.node.remove();item.closed?.();refresh();if(active){const target=[...tabs.querySelectorAll('.inspector-tab')].find(b=>b.dataset.tab===lastBase&&!b.hidden)?.dataset.tab||'primary';p.select(target);}return true;}
    function open(id,{label,node,closed}={}){
      if(!/^[a-z][a-z0-9-]*$/.test(id))throw Error('invalid-inspector-task');
      if(!items.has(id)){
        const slot=document.createElement('div');slot.className='inspector-task-tab';
        const button=document.createElement('button');button.type='button';button.className='inspector-tab';button.dataset.tab=id;button.id='inspector-task-tab-'+id;button.role='tab';button.textContent=label;button.onclick=()=>p.select(id);
        node.classList.add('inspector-panel');node.dataset.panel=id;node.id='inspector-task-panel-'+id;node.setAttribute('role','tabpanel');node.setAttribute('aria-labelledby',button.id);button.setAttribute('aria-controls',node.id);
        const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='inspector-task-close';dismiss.setAttribute('aria-label',p.closeLabel(label));dismiss.innerHTML='<span aria-hidden="true">×</span>';dismiss.onclick=e=>{e.stopPropagation();close(id);};
        slot.append(button,dismiss);tabs.append(slot);body.append(node);items.set(id,{slot,node,closed});
      }
      p.select(id);refresh();return items.get(id).node;
    }
    refresh();return Object.freeze({open,close,refresh,sync,has:id=>items.has(id)});
  }
  M.inspectorTasks=Object.freeze({create});
})();
