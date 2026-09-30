/* PieniPlan Build41 P3: native persistent Polyline authoring vertical slice. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const core = root.commandFoundation;
  const clonePoint = p => ({x:Number(p.x), y:Number(p.y)});
  const finite = p => core.finitePoint(p);
  const same = (a,b) => finite(a)&&finite(b)&&Math.hypot(a.x-b.x,a.y-b.y) < 1e-8;

  function install(registry, port) {
    registry.register({
      id:'PL', aliases:['PLINE','POLYLINE'], available:ctx=>ctx.mode==='cad', transactional:false, historyOwner:'cad-change-set',
      create(){
        const draft={phase:'start', mode:'line', points:[], arcEnd:null, pointer:null, token:port.contextToken()};
        const current=()=>draft.points.at(-1)||null;
        const view=()=>({phase:draft.phase,mode:draft.mode,points:draft.points.map(p=>({...p})),arcEnd:draft.arcEnd&&clonePoint(draft.arcEnd),pointer:draft.pointer&&clonePoint(draft.pointer)});
        const notify=()=>port.preview(view());
        const resolve=(point,shift=false)=>port.resolvePoint(point,{base:current(),shift,typed:false});
        const setMode=mode=>{draft.mode=mode==='arc'?'arc':'line';draft.arcEnd=null;draft.phase=draft.points.length?'next':'start';notify();port.prompt(draft.mode==='arc'?'command.polylineArcEnd':'command.polylineNext');return{ok:true};};
        const back=()=>{
          if(draft.arcEnd){draft.arcEnd=null;draft.phase='next';notify();port.prompt(draft.mode==='arc'?'command.polylineArcEnd':'command.polylineNext');return{ok:true};}
          if(draft.points.length>1){draft.points.pop();delete draft.points.at(-1).bulge;draft.phase='next';notify();port.prompt(draft.mode==='arc'?'command.polylineArcEnd':'command.polylineNext');return{ok:true};}
          if(draft.points.length===1){draft.points=[];draft.phase='start';notify();port.prompt('command.polylineFirst');return{ok:true};}
          return{ok:false,code:'nothing-to-back'};
        };
        const finish=(closed=false)=>{
          if(draft.arcEnd)return{ok:false,code:'arc-control-required'};
          if(draft.points.length < (closed?3:2))return{ok:false,code:'polyline-too-short'};
          const points=draft.points.map(p=>({...p}));
          if(closed)points.at(-1).bulge=0;
          return{ok:true,commit:true,value:{points,closed,token:draft.token}};
        };
        const handlePoint=(point,shift=false,typed=false)=>{
          if(!finite(point))return{ok:false,code:'invalid-point'};
          const resolved=typed?{point:clonePoint(point),source:'typed'}:resolve(point,shift), p=clonePoint(resolved.point);
          draft.pointer=p;
          if(!draft.points.length){draft.points.push(p);draft.phase='next';notify();port.prompt(draft.mode==='arc'?'command.polylineArcEnd':'command.polylineNext');return{ok:true};}
          const start=current();
          if(draft.mode==='line'){
            if(same(start,p))return{ok:false,code:'zero-length'};
            start.bulge=0;draft.points.push(p);draft.phase='next';notify();port.prompt('command.polylineNext');return{ok:true};
          }
          if(!draft.arcEnd){if(same(start,p))return{ok:false,code:'zero-length'};draft.arcEnd=p;draft.phase='arc-control';notify();port.prompt('command.polylineArcControl');return{ok:true};}
          const bulge=port.bulgeFromControl(start,draft.arcEnd,p);
          if(!Number.isFinite(bulge)||Math.abs(bulge)<1e-10)return{ok:false,code:'invalid-arc'};
          start.bulge=bulge;draft.points.push(clonePoint(draft.arcEnd));draft.arcEnd=null;draft.phase='next';notify();port.prompt('command.polylineArcEnd');return{ok:true};
        };
        return {
          describe:()=>({phase:draft.phase,promptKey:draft.phase==='start'?'command.polylineFirst':draft.phase==='arc-control'?'command.polylineArcControl':draft.mode==='arc'?'command.polylineArcEnd':'command.polylineNext',input:['point','coordinate','keyword']}),
          view,
          preview({point,shift=false}){if(!finite(point))return{ok:true};draft.pointer=clonePoint(resolve(point,shift).point);notify();return{ok:true};},
          input(event){
            if(event.type==='keyword'){
              if(event.value==='line')return setMode('line');
              if(event.value==='arc')return setMode('arc');
              if(event.value==='back')return back();
              if(event.value==='close')return finish(true);
              if(event.value==='finish')return finish(false);
              return{ok:false,code:'unknown-keyword'};
            }
            if(event.type==='point')return handlePoint(event.point,Boolean(event.shift),false);
            if(event.type==='text'){
              const raw=String(event.text??'').trim(), upper=raw.toUpperCase();
              if(['L','LINE'].includes(upper))return setMode('line');
              if(['A','ARC'].includes(upper))return setMode('arc');
              if(['B','BACK','UNDO'].includes(upper))return back();
              if(['C','CLOSE'].includes(upper))return finish(true);
              const parsed=event.parsed?.ok&&event.parsed.kind==='point'?event.parsed:port.parsePoint(raw,{base:current(),direction:current()&&draft.pointer?{x:draft.pointer.x-current().x,y:draft.pointer.y-current().y}:null});
              if(!parsed?.ok)return{ok:false,code:'invalid-coordinate'};
              return handlePoint(parsed.point,false,true);
            }
            return{ok:false,code:'invalid-input'};
          },
          commit(value){
            if(!port.contextCurrent(value?.token,{geometry:true,layer:true,reference:false,region:true})){const err=new Error('stale-context');err.code='stale-context';throw err;}
            return port.commitPolyline(value.points,value.closed);
          },
          cancel(reason){port.clearPreview(reason);},
          finalize(reason){port.clearPreview(reason);}
        };
      }
    });
  }
  root.nativePolylineCommand=Object.freeze({install});
})();
