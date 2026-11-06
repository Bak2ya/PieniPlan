/* Personal command bindings. Canonical command names and protected native keys survive. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},key='pieniplan-command-preferences-v1';
  const scope=c=>c.cadOnly?'cad':c.planOnly?'plan':'common';
  const overlap=(a,b)=>a==='common'||b==='common'||a===b;
  function chord(raw){
    const text=String(raw??'');if(text==='')return'';
    const parts=text.trim().split('+').map(s=>s.trim()).filter(Boolean);if(!parts.length)throw Error('reserved');
    const base=parts.pop().toUpperCase(),mods=new Set(parts.map(s=>s.toUpperCase()));
    if([...mods].some(m=>!['CTRL','ALT','SHIFT','META'].includes(m))||!/^(?:[A-Z0-9]|F(?:[1-9]|1[0-2]))$/.test(base))throw Error('reserved');
    // F3/F7/F8/F10 belong to existing toggles; all browser/OS chords stay native.
    if(/^F/.test(base)){if(['F1','F4','F5','F6'].includes(base)||mods.size)throw Error('reserved');}
    else if(!mods.has('ALT')||!mods.has('SHIFT')||mods.has('CTRL')||mods.has('META'))throw Error('reserved');
    return[...['CTRL','META','ALT','SHIFT'].filter(m=>mods.has(m)),base].join('+');
  }
  function create(catalog,storage=globalThis.localStorage){
    const toggles=[['GRID','F7','grid'],['SNAP','F3','snap'],['ORTHO','F8','ortho'],['POLAR','F10','polar'],['OSNAPTRACK','F11','tracking'],['DYNINPUT','F12','dynamic'],['GRIDSNAP','F9','gridSnap'],['HISTORY','F2','commandHistory']].map(([id,shortcut,tool])=>({id,name:id,aliases:[],shortcut,tool,...(['tracking','dynamic','gridSnap'].includes(tool)?{cadOnly:true}:{})}));
    const entries=[...catalog,...toggles],byId=new Map(entries.map(c=>[c.id,c])),pgpTickets=new WeakMap();let values=Object.create(null),revision=0,restoring=false;
    const cadDefaults={T:['DT','TEXT'],MT:['T','MT','MTEXT'],CH:['CHA','CHAMFER'],DIMLINEAR:['DLI','DIMLINEAR'],DLI:['DAL','DIM','DIMALIGNED']};
    const defaults=(c,mode='cad')=>mode==='cad'?(cadDefaults[c.id]||c.aliases):c.aliases;
    const aliases=(c,mode='cad')=>(values[c.id]?.aliases??defaults(c,mode)).filter(alias=>{const canonical=entries.find(o=>overlap(scope(o),mode)&&o.name===alias);if(canonical)return canonical===c;const personal=entries.find(o=>overlap(scope(o),mode)&&values[o.id]?.aliases?.includes(alias));return !personal||personal===c;});
    const shortcut=c=>values[c.id]?.shortcut??c.shortcut??'';
    // A newly introduced CAD canonical name may mask an old common alias only
    // in CAD. Loading that profile must retain its other aliases, chord and Plan
    // meaning. Canonical-first resolve still owns every actual dispatch.
    const aliasConflict=(c,alias,other)=>(values[other.id]?.aliases||[]).includes(alias)&&['cad','plan'].some(mode=>overlap(scope(c),mode)&&overlap(scope(other),mode)&&!entries.some(owner=>owner.name===alias&&overlap(scope(owner),mode)));
    function set(id,patch,{persist=true}={}){
      const c=byId.get(id);if(!c)throw Error('command');
      const old=values[id]||{},next={...old};
      if(Object.hasOwn(patch,'aliases')){if(toggles.includes(c))throw Error('command');next.aliases=[...new Set(String(patch.aliases).split(/[ ,;]+/).map(s=>s.trim().toUpperCase()).filter(Boolean))];if(next.aliases.some(a=>a.length>32||! /^-?[A-Z][A-Z0-9_-]*$/.test(a)))throw Error('alias');}
      if(Object.hasOwn(patch,'shortcut'))next.shortcut=chord(patch.shortcut);
      for(const other of entries){if(other===c||!overlap(scope(c),scope(other)))continue;
        if(next.aliases?.some(a=>aliasConflict(c,a,other)))throw Error('conflict:'+other.name);
        if(next.shortcut&&next.shortcut===shortcut(other))throw Error('conflict:'+other.name);
      }
      // Canonical names can never be shadowed, even if a legacy alias was removed.
      if(!restoring&&Object.hasOwn(patch,'aliases')&&next.aliases?.some(a=>entries.some(o=>o!==c&&overlap(scope(c),scope(o))&&o.name===a)))throw Error('conflict');
      values[id]=next;if(persist){revision++;save();}return true;
    }
    function save(){try{storage?.setItem(key,JSON.stringify(values));}catch{}}
    function load(){revision++;values=Object.create(null);let raw={};try{raw=JSON.parse(storage?.getItem(key)||'{}');}catch{}restoring=true;try{for(const [id,v]of Object.entries(raw||{})){if(!v||typeof v!=='object')continue;const patch={...(Array.isArray(v.aliases)?{aliases:v.aliases.join(',')}: {})};if(typeof v.shortcut==='string'){try{patch.shortcut=chord(v.shortcut);}catch{/* Ignore only an invalid binding; keep this command's valid aliases. */}}try{set(id,patch,{persist:false});}catch{}}}finally{restoring=false;}return values;}
    function reset(which){
      const previous=values;values={...values};for(const c of entries)if(scope(c)===which)delete values[c.id];
      try{for(const c of entries)for(const other of entries){if(c===other||!overlap(scope(c),scope(other)))continue;if(shortcut(c)&&shortcut(c)===shortcut(other)||(values[c.id]?.aliases||[]).some(a=>aliasConflict(c,a,other)))throw Error('conflict:'+other.name);}}
      catch(error){values=previous;throw error;}revision++;save();
    }
    function resolve(raw,mode){const q=String(raw||'').trim().toUpperCase();return entries.find(c=>!toggles.includes(c)&&overlap(scope(c),mode)&&c.name===q)||entries.find(c=>!toggles.includes(c)&&overlap(scope(c),mode)&&values[c.id]?.aliases?.includes(q))||entries.find(c=>!toggles.includes(c)&&overlap(scope(c),mode)&&!values[c.id]?.aliases&&defaults(c,mode).includes(q));}
    function match(raw,mode){const q=String(raw||'').toUpperCase();return entries.filter(c=>!toggles.includes(c)&&overlap(scope(c),mode)&&[c.name,...aliases(c,mode)].some(a=>a.startsWith(q))).sort((a,b)=>Number([b.name,...aliases(b,mode)].includes(q))-Number([a.name,...aliases(a,mode)].includes(q))).slice(0,6).map(c=>({...c,aliases:[...new Set([c.name,...aliases(c,mode)])]}));}
    function forEvent(e,mode){let q;try{q=chord([e.ctrlKey?'CTRL':'',e.metaKey?'META':'',e.altKey?'ALT':'',e.shiftKey?'SHIFT':'',e.code?.startsWith('Key')?e.code.slice(3):e.code?.startsWith('Digit')?e.code.slice(5):e.key].filter(Boolean).join('+'));}catch{return null;}if(!q)return null;return entries.find(c=>overlap(scope(c),mode)&&shortcut(c)===q)||null;}
    function validate(id,patch){const old=values;values={...values};try{return set(id,patch,{persist:false});}finally{values=old;}}
    function preparePgp(text){const parsed=root.commandPgp.parse(text),previous=values,before=JSON.stringify(values),originalAliases=new Map(entries.map(c=>[c.id,aliases(c,'cad')])),accepted=[],skipped=parsed.issues.filter(r=>r.reason!=='duplicate'),conflicts=[],reassigned=[];
      for(const row of parsed.entries){const c=entries.find(c=>!toggles.includes(c)&&c.name===row.command);if(!c||scope(c)==='plan'){skipped.push({...row,reason:c?'plan-command':'unsupported-command'});continue;}accepted.push({...row,id:c.id});const old=resolve(row.alias,'cad');if(old&&old.id!==c.id)reassigned.push({alias:row.alias,from:old.name,to:c.name});}
      const incoming=new Map(accepted.map(r=>[r.alias,r])),targets=new Set(accepted.map(r=>r.id));let after,changes=[],common=[];
      values=JSON.parse(before);try{
        for(const c of entries)if(scope(c)!=='plan'&&values[c.id]?.aliases)values[c.id]={...values[c.id],aliases:values[c.id].aliases.filter(a=>!incoming.has(a)||incoming.get(a).id===c.id)};
        for(const id of targets){const c=byId.get(id),next=[...new Set([...originalAliases.get(id).filter(a=>!incoming.has(a)||incoming.get(a).id===id),...accepted.filter(r=>r.id===id).map(r=>r.alias)])];try{if(JSON.stringify(next)!==JSON.stringify(originalAliases.get(id)))set(id,{aliases:next.join(',')},{persist:false});}catch(e){conflicts.push({command:c.name,reason:e.message});}}
        after=JSON.parse(JSON.stringify(values));changes=entries.filter(c=>!toggles.includes(c)&&scope(c)!=='plan'&&JSON.stringify(originalAliases.get(c.id))!==JSON.stringify(aliases(c,'cad'))).map(c=>({id:c.id,command:c.name,before:originalAliases.get(c.id),after:aliases(c,'cad')}));common=entries.filter(c=>scope(c)==='common'&&JSON.stringify(previous[c.id])!==JSON.stringify(after[c.id])).map(c=>c.name);
      }finally{values=previous;}
      const report=Object.freeze({accepted,skipped,duplicates:parsed.issues.filter(r=>r.reason==='duplicate'),conflicts,reassigned,changes,common});pgpTickets.set(report,{before,after,revision,blocked:conflicts.length>0,changed:changes.length});return report;
    }
    function applyPgp(report){const ticket=pgpTickets.get(report);if(!ticket||ticket.revision!==revision||ticket.before!==JSON.stringify(values))throw Error('stale-pgp-preview');pgpTickets.delete(report);if(ticket.blocked)throw Error('pgp-conflict');if(!ticket.changed)return{changed:0};if(!storage?.setItem)throw Error('pgp-storage-unavailable');storage.setItem(key,JSON.stringify(ticket.after));values=ticket.after;revision++;return{changed:ticket.changed};}
    function exportPgp(){const rows=[];for(const c of entries)if(!toggles.includes(c)&&scope(c)!=='plan')for(const alias of aliases(c,'cad'))if(alias!==c.name&&resolve(alias,'cad')?.id===c.id)rows.push({alias,command:c.name});return root.commandPgp.stringify(rows);}
    load();return Object.freeze({entries,scope,aliases,shortcut,set,validate,reset,resolve,match,forEvent,load,key,preparePgp,applyPgp,exportPgp});
  }
  root.commandPreferences=Object.freeze({create,chord,overlap});
})();
