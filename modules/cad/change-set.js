/* Bounded CAD object deltas. No Plan model, UI, persistence or history ownership. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const clone=v=>v==null?null:JSON.parse(JSON.stringify(v));
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const fail=code=>{const e=new Error(code);e.code=code;throw e;};
  function create(label,changes){
    const seen=new Set(),ops=[];
    for(const c of changes){
      const id=c.before?.id||c.after?.id;
      if(!id||seen.has(id)||c.before&&c.after&&c.before.id!==c.after.id)fail('invalid-change-set');
      seen.add(id);if(equal(c.before??null,c.after??null))continue;
      if(!Number.isInteger(c.index)||c.index<0)fail('invalid-object-position');
      ops.push({id,index:c.index,before:clone(c.before),after:clone(c.after)});
    }
    return {kind:'cad-change-set',version:1,label:String(label),ops};
  }
  // Explicit command-owned grouping of existing-owner edits only. Creation,
  // deletion and auxiliary history payloads require their own ownership contract.
  function composeEdits(label,entries){
    const owners=new Map();
    for(const e of entries){
      if(e?.kind!=='cad-change-set'||e.version!==1||Object.keys(e).some(k=>!['kind','version','label','ops'].includes(k))||!Array.isArray(e.ops))fail('invalid-edit-history-group');
      const seen=new Set();for(const op of e.ops){if(!op.before||!op.after||op.id!==op.before.id||op.id!==op.after.id||seen.has(op.id)||!Number.isInteger(op.index)||op.index<0)fail('invalid-edit-history-group');seen.add(op.id);const old=owners.get(op.id);if(old){if(!equal(old.after,op.before)||old.index!==op.index)fail('stale-edit-history-group');old.after=op.after;}else owners.set(op.id,{before:op.before,after:op.after,index:op.index});}
    }
    return create(label,[...owners.values()]);
  }
  // Preflight ALL targets and materialize replacements before touching the array.
  // A shallow array copy makes rollback safe; unchanged geometry is never cloned.
  function apply(entry,objects,{inverse=false}={}){
    if(entry?.kind!=='cad-change-set'||entry.version!==1)fail('invalid-change-set');
    const byId=new Map(objects.map((o,i)=>[o.id,{o,i}])),updates=[],remove=new Set(),add=[];
    for(const op of entry.ops){
      const before=inverse?op.after:op.before,after=inverse?op.before:op.after,current=byId.get(op.id);
      if(before?!current||!equal(current.o,before):Boolean(current))fail('stale-change-set');
      const copy=clone(after);
      if(before&&after)updates.push({i:current.i,value:copy});
      else if(before)remove.add(op.id);
      else add.push({index:op.index,value:copy});
    }
    let next=objects.slice();
    if(remove.size||add.length){
      for(const u of updates)next[u.i]=u.value;
      if(remove.size)next=next.filter(o=>!remove.has(o.id));
      for(const a of add.sort((a,b)=>a.index-b.index))next.splice(Math.min(a.index,next.length),0,a.value);
    }else for(const u of updates)next[u.i]=u.value;
    return next;
  }
  // Resource handles are session-only. Geometry ownership must remain immutable;
  // entries retain/release handles, placements carry only transform/display data.
  // This API is deliberately not wired to legacy mutable Reference placement yet.
  function createResourcePool(){
    const resources=new Map();let serial=0;
    return Object.freeze({
      retain(payload){const id=++serial;resources.set(id,{payload,count:1});return id;},
      acquire(id){const r=resources.get(id);if(!r)fail('missing-reference-resource');r.count++;return id;},
      get(id){return resources.get(id)?.payload||null;},
      release(id){const r=resources.get(id);if(r&&--r.count===0)resources.delete(id);},
      clear(){resources.clear();},get size(){return resources.size;}
    });
  }
  root.cadChangeSet=Object.freeze({create,composeEdits,apply,clone,createResourcePool});
})();
