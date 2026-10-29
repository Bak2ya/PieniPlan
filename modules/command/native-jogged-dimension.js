/* Detached DIMJOGGED creation; the existing CAD change set owns publication/history. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},ids=['DIMJOGGED','DIMJOGANG'],options=['T','TEXT','M','MTEXT','A','ANGLE'];
 const keyword=(id,phase,k)=>id==='DIMJOGGED'&&(['text','textAngle','mtext'].includes(phase)||phase==='location'&&options.includes(k));
 function install(registry,p){registry.register({id:'DIMJOGANG',aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){const token=p.token(),old=p.getJogAngle(),identity=p.angleIdentity();p.anglePrompt(old);return{view:()=>({phase:'value',value:old}),describe:()=>({phase:'value',input:['angle']}),input(e){const value=e.type==='enter'?old:e.type==='text'?M.cadUnits.parseAngle(e.text)?.degrees:NaN;try{M.cadJoggedRadius.validateAngle(value);}catch{return{ok:false,code:'invalid-number'};}return{ok:true,commit:true,value};},commit(value){if(!p.current(token)||p.angleIdentity()!==identity)throw Error('stale-context');return p.setJogAngle(value);},cancel:p.clear,finalize:p.clear};}});registry.register({id:'DIMJOGGED',aliases:[],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){
  const d={phase:'source',token:p.token(),source:null,anchor:null},live=()=>!d.closed&&p.current(d.token),base=()=>d.phase==='origin'||d.phase==='location'?d.source?.center:d.phase==='jog'?d.origin:undefined,show=()=>p.prompt(d),read=e=>e.type==='point'?p.resolve(e.point,base()):e.type==='text'?p.parse(e.text,{base:base(),direction:d.pointer&&base()?{x:d.pointer.x-base().x,y:d.pointer.y-base().y}:null})?.point:null;
  const data=(location,jog)=>{const extra={...(d.textOverride!=null?{textOverride:d.textOverride}:{}),...(d.textAngle!=null?{textAngle:d.textAngle}:{})},o=M.cadJoggedRadius.draft(d.source,d.origin,location,jog,extra);if(!o)return null;const association=M.cadDimensionPartial.relation(o,d.anchor?{jogged:d.anchor}:{});if(association)o.association=association;return o;};
  const draft=q=>{if(d.phase==='jog')return data(d.location,q);if(d.phase!=='location')return null;const o=M.cadJoggedRadius.draft(d.source,d.origin,q,d.origin);return o?data(q,{x:(d.origin.x+o.chordPoint.x)/2,y:(d.origin.y+o.chordPoint.y)/2}):null;};show();
  return{view:()=>d,describe:()=>({phase:d.phase,pointBase:base(),input:['point','coordinate','keyword'],actions:d.phase==='location'?[{id:'TEXT',labelKey:'cad96.ordinate.text'},{id:'MTEXT',labelKey:'cad98.jog.mtext'},{id:'ANGLE',labelKey:'cad96.ordinate.angle'}]:[]}),
   preview(e){if(!live())return{ok:false,code:'stale-context'};d.pointer=e.point;const q=read({type:'point',point:e.point});p.preview(q?draft(q):null);return{ok:true};},
   input(e){if(!live())return{ok:false,code:'stale-context'};const raw=String(e.type==='keyword'?e.value:e.text||'').trim(),k=raw.toUpperCase();
    if(d.phase==='source'){if(e.type!=='point')return{ok:false,code:'selection-required'};const o=p.pick(e.point),source=o&&p.inspect(o.id)&&M.cadJoggedRadius.source(o,e.point);if(!source)return{ok:false,code:'unsupported-geometry'};d.source=source;d.anchor=M.cadJoggedRadius.anchor(o,e.point);d.phase='origin';show();return{ok:true};}
    if(d.phase==='mtext')return{ok:false,code:'invalid-input'};
    if(d.phase==='text'){if(!['text','enter'].includes(e.type)||String(e.text??'').length>100000||String(e.text??'').includes('\0'))return{ok:false,code:'invalid-input'};if(e.type==='text')d.textOverride=String(e.text);d.phase='location';show();return{ok:true};}
    if(d.phase==='textAngle'){if(e.type==='enter'){d.phase='location';show();return{ok:true};}const a=M.cadUnits.parseAngle(raw);if(!a.ok)return{ok:false,code:'invalid-number'};d.textAngle=p.worldAngle(a.degrees);d.phase='location';show();return{ok:true};}
    if(d.phase==='location'&&options.includes(k)){d.phase=k==='A'||k==='ANGLE'?'textAngle':k==='M'||k==='MTEXT'?'mtext':'text';p.preview(null);show();if(d.phase==='mtext')p.editText(d.textOverride??'<>',d.pointer||d.origin,value=>{if(!live())return;if(value!=null)d.textOverride=value;d.phase='location';show();});return{ok:true};}
    const q=read(e);if(!q)return{ok:false,code:'invalid-coordinate'};
    if(d.phase==='origin'){d.origin={...q};d.phase='location';show();return{ok:true};}
    if(d.phase==='location'){if(!draft(q))return{ok:false,code:'no-valid-result'};d.location={...q};d.phase='jog';p.preview(null);show();return{ok:true};}
    if(d.phase==='jog'){const o=data(d.location,q);return o?{ok:true,commit:true,value:o}:{ok:false,code:'no-valid-result'};}
    return{ok:false,code:'invalid-input'};
   },commit(o){if(!live())throw Error('stale-context');return p.commit(o);},cancel:()=>{d.closed=true;p.clear();},finalize:()=>{d.closed=true;p.clear();}};
 }});}
 M.nativeJoggedDimension=Object.freeze({ids,keyword,install});
})();
