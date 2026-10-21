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
    const entries=[...catalog,...toggles],byId=new Map(entries.map(c=>[c.id,c]));let values=Object.create(null);
    const cadDefaults={T:['DT','TEXT'],MT:['T','MT','MTEXT'],CH:['CHA','CHAMFER'],DIMLINEAR:['DLI','DIMLINEAR'],DLI:['DAL','DIM','DIMALIGNED']};
    const defaults=(c,mode='cad')=>mode==='cad'?(cadDefaults[c.id]||c.aliases):c.aliases;
    const aliases=(c,mode='cad')=>(values[c.id]?.aliases??defaults(c,mode)).filter(alias=>{const canonical=entries.find(o=>overlap(scope(o),mode)&&o.name===alias);if(canonical)return canonical===c;const personal=entries.find(o=>overlap(scope(o),mode)&&values[o.id]?.aliases?.includes(alias));return !personal||personal===c;});
    const shortcut=c=>values[c.id]?.shortcut??c.shortcut??'';
    function set(id,patch,{persist=true}={}){
      const c=byId.get(id);if(!c)throw Error('command');
      const old=values[id]||{},next={...old};
      if(Object.hasOwn(patch,'aliases')){if(toggles.includes(c))throw Error('command');next.aliases=[...new Set(String(patch.aliases).split(/[ ,;]+/).map(s=>s.trim().toUpperCase()).filter(Boolean))];if(next.aliases.some(a=>! /^[A-Z][A-Z0-9_-]{0,31}$/.test(a)))throw Error('alias');}
      if(Object.hasOwn(patch,'shortcut'))next.shortcut=chord(patch.shortcut);
      for(const other of entries){if(other===c||!overlap(scope(c),scope(other)))continue;
        const names=new Set([other.name,...(values[other.id]?.aliases||[])]);
        if(next.aliases?.some(a=>names.has(a)))throw Error('conflict:'+other.name);
        if(next.shortcut&&next.shortcut===shortcut(other))throw Error('conflict:'+other.name);
      }
      // Canonical names can never be shadowed, even if a legacy alias was removed.
      if(next.aliases?.some(a=>entries.some(o=>o!==c&&overlap(scope(c),scope(o))&&o.name===a)))throw Error('conflict');
      values[id]=next;if(persist)save();return true;
    }
    function save(){try{storage?.setItem(key,JSON.stringify(values));}catch{}}
    function load(){values=Object.create(null);let raw={};try{raw=JSON.parse(storage?.getItem(key)||'{}');}catch{}for(const [id,v]of Object.entries(raw||{})){if(!v||typeof v!=='object')continue;const patch={...(Array.isArray(v.aliases)?{aliases:v.aliases.join(',')}: {})};if(typeof v.shortcut==='string'){try{patch.shortcut=chord(v.shortcut);}catch{/* Ignore only an invalid binding; keep this command's valid aliases. */}}try{set(id,patch,{persist:false});}catch{}}return values;}
    function reset(which){
      const previous=values;values={...values};for(const c of entries)if(scope(c)===which)delete values[c.id];
      try{for(const c of entries)for(const other of entries){if(c===other||!overlap(scope(c),scope(other)))continue;if(shortcut(c)&&shortcut(c)===shortcut(other)||(values[c.id]?.aliases||[]).some(a=>[other.name,...(values[other.id]?.aliases||[])].includes(a)))throw Error('conflict:'+other.name);}}
      catch(error){values=previous;throw error;}save();
    }
    function resolve(raw,mode){const q=String(raw||'').trim().toUpperCase();return entries.find(c=>!toggles.includes(c)&&overlap(scope(c),mode)&&c.name===q)||entries.find(c=>!toggles.includes(c)&&overlap(scope(c),mode)&&values[c.id]?.aliases?.includes(q))||entries.find(c=>!toggles.includes(c)&&overlap(scope(c),mode)&&!values[c.id]?.aliases&&defaults(c,mode).includes(q));}
    function match(raw,mode){const q=String(raw||'').toUpperCase();return entries.filter(c=>!toggles.includes(c)&&overlap(scope(c),mode)&&[c.name,...aliases(c,mode)].some(a=>a.startsWith(q))).sort((a,b)=>Number([b.name,...aliases(b,mode)].includes(q))-Number([a.name,...aliases(a,mode)].includes(q))).slice(0,6).map(c=>({...c,aliases:[...new Set([c.name,...aliases(c,mode)])]}));}
    function forEvent(e,mode){let q;try{q=chord([e.ctrlKey?'CTRL':'',e.metaKey?'META':'',e.altKey?'ALT':'',e.shiftKey?'SHIFT':'',e.code?.startsWith('Key')?e.code.slice(3):e.code?.startsWith('Digit')?e.code.slice(5):e.key].filter(Boolean).join('+'));}catch{return null;}if(!q)return null;return entries.find(c=>overlap(scope(c),mode)&&shortcut(c)===q)||null;}
    load();return Object.freeze({entries,scope,aliases,shortcut,set,reset,resolve,match,forEvent,load,key});
  }
  root.commandPreferences=Object.freeze({create,chord,overlap});
})();
