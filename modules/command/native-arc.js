/* Exact planar ARC prompt families; no sampled replacement of canonical curves. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},pointAngle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
 function install(registry,p){registry.register({id:'A',aliases:['ARC'],available:c=>c.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){
  const d={phase:'start',start:null,through:null,end:null,center:null,centerFirst:false,pointer:null,tangent:null,token:p.contextToken()},G=()=>M.cadCreation;
  const show=()=>p.prompt('A',d.phase,d),key=e=>String(e.type==='keyword'?e.value:e.text||'').trim().toUpperCase();
  const base=()=>['centerEnd','centerAngle','centerChord'].includes(d.phase)?d.center:d.start||d.center;
  const point=e=>e.type==='point'?p.resolvePoint(e.point,{base:base(),shift:!!e.shift}).point:e.type==='text'?p.parsePoint(e.text,{base:base(),direction:base()&&d.pointer?{x:d.pointer.x-base().x,y:d.pointer.y-base().y}:null})?.point:null;
  const number=e=>e.type==='text'&&String(e.text).trim()!==''?Number(e.text):NaN;
  function geometry(e){const q=point(e),n=number(e);
   if(d.phase==='end')return q&&G().arc3(d.start,q,d.through);
   if(d.phase==='centerEnd'){const g=q&&G().arcCenter(d.start,d.center,q);return g&&p.clockwise?.()?{...g,sweep:g.sweep-360}:g;}
   if(d.phase==='centerAngle')return G().arcCenter(d.start,d.center,null,Number.isFinite(n)?n:q?((pointAngle(d.center,q)-pointAngle(d.center,d.start))%360+360)%360:NaN);
   if(d.phase==='centerChord'){const g=G().arcCenterChord(d.start,d.center,e.type==='text'?p.parseLength(e.text)?.mm:q?Math.hypot(q.x-d.start.x,q.y-d.start.y):NaN);return g&&p.clockwise?.()?{...g,sweep:-g.sweep}:g;}
   if(d.phase==='endCenter'||d.phase==='endMethod'){if(!q)return null;const g=G().arcCenter(d.start,q,d.end);return g&&p.clockwise?.()?{...g,sweep:g.sweep-360}:g;}
   if(d.phase==='endAngle')return G().arcEndAngle(d.start,d.end,Number.isFinite(n)?n:q?pointAngle(d.start,q):NaN);
   if(d.phase==='endRadius'){const g=G().arcEndRadius(d.start,d.end,e.type==='text'?p.parseLength(e.text)?.mm:q?Math.hypot(q.x-d.start.x,q.y-d.start.y):NaN);return g&&p.clockwise?.()?G().arcEndAngle(d.start,d.end,-Math.abs(g.sweep)):g;}
   if(d.phase==='endDirection')return G().arcTangent(d.start,d.end,Number.isFinite(n)?n:q?pointAngle(d.start,q):NaN);
   if(d.phase==='tangentEnd')return q&&G().arcTangent(d.start,q,d.tangent);return null;
  }
  show();return{view:()=>d,describe:()=>({phase:d.phase,input:['point','coordinate','length','angle','keyword'],actions:d.phase==='start'?[{id:'C',labelKey:'cad87.center'}]:d.phase==='through'?[{id:'C',labelKey:'cad87.center'},{id:'E',labelKey:'cad91.end'}]:d.phase==='centerEnd'?[{id:'A',labelKey:'context.angle'},{id:'L',labelKey:'cad91.chord'}]:d.phase==='endMethod'?[{id:'C',labelKey:'cad87.center'},{id:'A',labelKey:'context.angle'},{id:'D',labelKey:'cad91.direction'},{id:'R',labelKey:'cadDraw.radius'}]:[]}),
   preview(e){e={...e,type:e.type||'point'};const q=point(e);if(q)d.pointer={...q};const g=geometry(e);p.preview(g?{kind:'arcGeometry',geometry:g}:d.start&&q?{kind:'arc',start:d.start,through:d.through,pointer:q}:null);return{ok:true};},
   input(e){const k=key(e);
    if(d.phase==='start'&&e.type==='enter'){const c=p.continuation?.();if(!c)return{ok:false,code:'base-required'};d.start={...c.point};d.tangent=c.tangent;d.phase='tangentEnd';show();return{ok:true};}
    if(['start','through'].includes(d.phase)&&['C','CENTER'].includes(k)){d.centerFirst=d.phase==='start';d.phase='centerPick';show();return{ok:true};}
    if(d.phase==='through'&&['E','END'].includes(k)){d.phase='endPick';show();return{ok:true};}
    if(d.phase==='centerEnd'&&['A','ANGLE','L','LENGTH'].includes(k)){d.phase=k.startsWith('A')?'centerAngle':'centerChord';show();return{ok:true};}
    if(d.phase==='endMethod'&&['C','CENTER','A','ANGLE','D','DIRECTION','R','RADIUS'].includes(k)){d.phase=({C:'endCenter',CENTER:'endCenter',A:'endAngle',ANGLE:'endAngle',D:'endDirection',DIRECTION:'endDirection',R:'endRadius',RADIUS:'endRadius'})[k];show();return{ok:true};}
    if(['end','centerEnd','centerAngle','centerChord','endMethod','endCenter','endAngle','endDirection','endRadius','tangentEnd'].includes(d.phase)){const g=geometry(e);return g?{ok:true,commit:true,value:{geometry:g,token:d.token}}:{ok:false,code:'invalid-arc'};}
    const q=point(e);if(!q)return{ok:false,code:'invalid-coordinate'};d.pointer={...q};
    if(d.phase==='start'){d.start={...q};d.phase='through';}
    else if(d.phase==='centerPick'){if(d.start&&Math.hypot(q.x-d.start.x,q.y-d.start.y)<1e-8)return{ok:false,code:'zero-length'};d.center={...q};d.phase=d.centerFirst?'centerStart':'centerEnd';}
    else if(d.phase==='centerStart'){if(Math.hypot(q.x-d.center.x,q.y-d.center.y)<1e-8)return{ok:false,code:'zero-length'};d.start={...q};d.phase='centerEnd';}
    else if(d.phase==='through'){if(Math.hypot(q.x-d.start.x,q.y-d.start.y)<1e-8)return{ok:false,code:'zero-length'};d.through={...q};d.phase='end';}
    else if(d.phase==='endPick'){if(Math.hypot(q.x-d.start.x,q.y-d.start.y)<1e-8)return{ok:false,code:'zero-length'};d.end={...q};d.phase='endMethod';}show();return{ok:true};
   },commit(v){if(!p.contextCurrent(v.token,{geometry:true,layer:true,reference:false,region:true}))throw Error('stale-context');return p.commitArc(v.geometry);},cancel:()=>p.clearPreview(),finalize:()=>p.clearPreview()};
 }});}
 M.nativeArcCommand=Object.freeze({install,keyword:(phase,k)=>phase==='start'&&['C','CENTER'].includes(k)||phase==='through'&&['C','CENTER','E','END'].includes(k)||phase==='centerEnd'&&['A','ANGLE','L','LENGTH'].includes(k)||phase==='endMethod'&&['C','CENTER','A','ANGLE','D','DIRECTION','R','RADIUS'].includes(k)});
})();
