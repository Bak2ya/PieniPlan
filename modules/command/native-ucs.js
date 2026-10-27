/* UCS planar options run in an isolated draft, with one atomic application commit. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
 const tokens={W:'world',WORLD:'world',P:'previous',PREVIOUS:'previous',Z:'rotate',O:'originOnly',ORIGIN:'originOnly',OB:'object',OBJECT:'object',V:'view',VIEW:'view',NA:'named',NAMED:'named',S:'saveName',SAVE:'saveName',R:'restoreName',RESTORE:'restoreName',D:'deleteName',DELETE:'deleteName',RENAME:'renameFrom','?':'list',LIST:'list'};
 function install(registry,p){registry.register({id:'UCS',aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-coordinate-frame',create(){
  const before=p.snapshot(),model=M.cadUcs.create(before.profile,before.previous),d={phase:'option',origin:null,xPoint:null,pointer:null,name:null,token:p.token(),preview:null},text=e=>String(e.type==='keyword'?e.value:e.text||'').trim(),show=()=>p.prompt(d.phase,d),finish=(readOnly=false)=>({ok:true,commit:true,value:{before,after:{profile:model.value(),previous:model.history()},token:d.token,readOnly}});
  function point(e){if(e.type==='point')return p.resolve(e.point,d.origin);if(e.type==='text')return p.parse(e.text,{base:d.origin,direction:d.origin&&d.pointer?{x:d.pointer.x-d.origin.x,y:d.pointer.y-d.origin.y}:null})?.point||null;return null;}
  function preview(q){try{d.preview=!q?null:d.origin&&d.xPoint?M.cadUcs.fromPoints(d.origin,d.xPoint,q,model.current().handedness):d.origin?M.cadUcs.fromPoints(d.origin,q,null,model.current().handedness):{...model.current(),origin:q};}catch{d.preview=null;}p.preview(d.preview);}
  show();return{view:()=>d,describe:()=>({phase:d.phase,pointBase:['option','originOnly'].includes(d.phase)?null:['xPoint','yPoint'].includes(d.phase)?d.origin:undefined,input:['point','coordinate','keyword'],actions:d.phase==='option'?['WORLD','PREVIOUS','OBJECT','Z','ORIGIN','NAMED'].map(id=>({id,labelKey:'cad96.ucs.'+id})):d.phase==='named'?['SAVE','RESTORE','DELETE','RENAME','LIST'].map(id=>({id,labelKey:'cad96.ucs.'+id})):[]}),
   preview(e){if(!p.current(d.token))return{ok:false,code:'stale-context'};if(!['option','originOnly','xPoint','yPoint','object'].includes(d.phase))return{ok:true};d.pointer=e.point;if(d.phase==='object'){d.preview=p.objectFrame(e.point,model.current());p.preview(d.preview);return{ok:true};}preview(p.resolve(e.point,d.origin));return{ok:true};},
   input(e){if(!p.current(d.token))return{ok:false,code:'stale-context'};const raw=text(e),key=raw.toUpperCase();
    if(['option','named'].includes(d.phase)){
     const option=e.type==='enter'?(d.phase==='option'?'world':'restoreName'):tokens[key];
     if(option){if(option==='world'){model.world();return finish();}if(option==='previous'){if(!model.previous())return{ok:false,code:'nothing-to-back'};return finish();}if(option==='view'){model.apply({...model.current(),angle:p.viewAngle(),handedness:1});return finish();}if(option==='list'){p.list(model.value());return finish(true);}d.phase=option;show();return{ok:true};}
     if(['X','Y','ZA','ZAXIS','F','FACE'].includes(key))return{ok:false,code:'planar-only'};
     if(d.phase==='named')return{ok:false,code:'invalid-keyword'};
    }
    if(d.phase==='rotate'){const n=e.type==='enter'?90:e.type==='text'?(M.cadUnits?.parseAngle?M.cadUnits.parseAngle(raw).degrees:Number(raw)):NaN;if(!Number.isFinite(n)||!raw&&e.type!=='enter')return{ok:false,code:'invalid-number'};model.rotate(n);return finish();}
    if(['saveName','restoreName','deleteName','renameFrom','renameTo'].includes(d.phase)){
     if(!raw)return{ok:false,code:'ucs-name-required'};
     try{if(d.phase==='saveName'){if(model.value().named.some(q=>q.name.toUpperCase()===key)){d.name=raw;d.phase='replace';show();return{ok:true};}model.save(raw);}else if(d.phase==='restoreName')model.restore(raw);else if(d.phase==='deleteName')model.remove(raw);else if(d.phase==='renameFrom'){if(!model.value().named.some(q=>q.name.toUpperCase()===key))return{ok:false,code:'missing-ucs-name'};d.name=raw;d.phase='renameTo';show();return{ok:true};}else model.rename(d.name,raw);return finish();}catch(error){return{ok:false,code:error.message};}
    }
    if(d.phase==='replace'){if(e.type==='enter'||['N','NO'].includes(key))return finish(true);if(!['Y','YES'].includes(key))return{ok:false,code:'invalid-keyword'};model.save(d.name,{replace:true});return finish();}
    if(e.type==='enter'&&d.phase==='xPoint'){model.origin(d.origin);return finish();}
    if(e.type==='enter'&&d.phase==='yPoint'){model.apply(M.cadUcs.fromPoints(d.origin,d.xPoint,null,model.current().handedness));return finish();}
    if(d.phase==='object'){if(e.type!=='point')return{ok:false,code:'selection-required'};const f=p.objectFrame(e.point,model.current());if(!f)return{ok:false,code:'unsupported-geometry'};model.apply(f);return finish();}
    const q=point(e);if(!q)return{ok:false,code:'invalid-coordinate'};
    if(d.phase==='originOnly'){model.origin(q);return finish();}
    if(d.phase==='option'){d.origin=q;d.phase='xPoint';p.preview({...model.current(),origin:q});show();return{ok:true};}
    if(d.phase==='xPoint'){let f;try{f=M.cadUcs.fromPoints(d.origin,q,null,model.current().handedness);}catch{return{ok:false,code:'invalid-ucs-axis'};}d.xPoint=q;d.phase='yPoint';d.preview=f;p.preview(f);show();return{ok:true};}
    if(d.phase==='yPoint'){try{model.apply(M.cadUcs.fromPoints(d.origin,d.xPoint,q,model.current().handedness));return finish();}catch(error){return{ok:false,code:error.message};}}
    return{ok:false,code:'invalid-input'};
   },commit:v=>{if(!p.current(v.token))throw Error('stale-context');return v.readOnly?true:p.commit(v);},cancel:()=>p.clear(),finalize:()=>p.clear()};
 }});}
 M.nativeUcsCommand=Object.freeze({install});
})();
