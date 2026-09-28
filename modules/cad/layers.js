/* PieniPlan Build26 P1: real CAD layer definitions, separate from visibility. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const defaults=name=>({name:String(name||'0'),color:null,linetype:'CONTINUOUS',lineweight:'DEFAULT',locked:false,printable:true});
  function normalize(raw){const out=new Map();for(const item of raw||[]){const v=Array.isArray(item)?item[1]:item;if(!v)continue;const name=String(v.name??(Array.isArray(item)?item[0]:'0')).trim()||'0';out.set(name,{...defaults(name),...v,name,locked:Boolean(v.locked),printable:v.printable!==false});}if(!out.has('0'))out.set('0',defaults('0'));return out;}
  function synthesize(existing, objects=[], visibility=new Map()){
    const out=normalize(existing instanceof Map?[...existing]:existing);
    for(const [name] of visibility||[])if(!out.has(name))out.set(name,defaults(name));
    for(const obj of objects||[]){const name=obj?.cadLayer||obj?.layer||obj?.sourceLayer;if(name&&!out.has(name))out.set(name,defaults(name));}
    if(!out.has('0'))out.set('0',defaults('0'));return out;
  }
  function serialize(map){return[...map.values()].map(v=>({...v}));}
  function create(store){const map=store||new Map();return Object.freeze({
    map,get:name=>map.get(name)||null,has:name=>map.has(name),names:()=>[...map.keys()],values:()=>[...map.values()],
    ensure(name){name=String(name||'0').trim()||'0';if(!map.has(name))map.set(name,defaults(name));return map.get(name);},
    create(name){name=String(name||'').trim();if(!name||map.has(name))return null;const d=defaults(name);map.set(name,d);return d;},
    remove(name){if(name==='0')return false;return map.delete(name);},
    rename(from,to){to=String(to||'').trim();if(!map.has(from)||!to||map.has(to))return false;const d={...map.get(from),name:to};map.delete(from);map.set(to,d);return d;},
    setLocked(name,locked){const d=this.ensure(name);d.locked=Boolean(locked);return d;},
    serialize:()=>serialize(map)
  });}
  root.cadLayers = Object.freeze({ defaults, normalize, synthesize, serialize, create });
})();
