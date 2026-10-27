/* PieniPlan Build26 P1: first native CAD command vertical slice. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const core = root.commandFoundation;
  function install(registry, port) {
    registry.register({
      id:'L', aliases:['LINE'], available:ctx=>ctx.mode==='cad', transactional:false, historyOwner:'cad-change-set',
      create(){
        const draft={phase:'start',start:null,current:null,constraint:null,token:port.contextToken(),lastPointer:null};
        const resolvePointer=(point,shift=false)=>port.resolvePoint(point,{base:draft.start,shift,typed:false});
        const segment=resolved=>root.cadLineConstraints?.solve(draft.constraint||{kind:'point',point:draft.start},resolved.constraint||{kind:'point',point:resolved.point})[0]||null;
        const resolveText=text=>{
          const raw=String(text??'').trim();
          const parsed=(port.parsePoint||core.parseInput)(raw,{expect:'point',base:draft.start,direction:draft.start&&draft.lastPointer?{x:draft.lastPointer.x-draft.start.x,y:draft.lastPointer.y-draft.start.y}:null});
          return parsed.ok&&parsed.kind==='point'?parsed:null;
        };
        return {
          describe:()=>({phase:draft.phase,pointBase:draft.start,promptKey:draft.phase==='start'?'command.lineFirst':draft.constraint?'command.lineDeferredNext':'command.lineNext',input:['point','coordinate']}),
          view:()=>draft,
          preview({point,shift=false}){if(draft.phase!=='end'||!core.finitePoint(point))return{ok:true};draft.lastPointer={...point};const resolved=resolvePointer(point,shift);if(draft.constraint||resolved.constraint){const q=segment(resolved);draft.current=q?{...q.b}:null;port.preview(q?.a||null,q?.b||null,resolved);return{ok:true,resolved,valid:Boolean(q)};}draft.current={...resolved.point};port.preview(draft.start,draft.current,resolved);return{ok:true,resolved};},
          input(event){
            let resolved=null;
            if(event.type==='point'&&core.finitePoint(event.point)){draft.lastPointer={...event.point};resolved=resolvePointer(event.point,Boolean(event.shift));}
            else if(event.type==='text'){
              const parsed=event.parsed?.ok&&event.parsed.kind==='point'?event.parsed:resolveText(event.text);if(!parsed)return{ok:false,code:'invalid-coordinate'};
              resolved={point:{...parsed.point},source:'typed'};
            }else return{ok:false,code:'invalid-point'};
            if(draft.phase==='start'){draft.constraint=resolved.constraint||null;draft.start={...resolved.point};draft.current={...resolved.point};draft.phase='end';port.preview(draft.start,draft.current,resolved);port.prompt(draft.constraint?'command.lineDeferredNext':'command.lineNext');return{ok:true};}
            if(draft.constraint||resolved.constraint){const q=segment(resolved);if(!q)return{ok:false,code:'no-valid-result'};draft.current={...q.b};return{ok:true,commit:true,value:{a:q.a,b:q.b,token:draft.token}};}
            draft.current={...resolved.point};if(Math.hypot(draft.current.x-draft.start.x,draft.current.y-draft.start.y)<1e-8)return{ok:false,code:'zero-length'};
            return{ok:true,commit:true,value:{a:{...draft.start},b:{...draft.current},token:draft.token}};
          },
          commit(value){
            if(!port.contextCurrent(value?.token,{geometry:true,layer:true,reference:false,region:true})){const err=new Error('stale-context');err.code='stale-context';throw err;}
            return port.commitLine(value.a,value.b);
          },
          cancel(reason){port.clearPreview(reason);},
          finalize(reason){port.clearPreview(reason);}
        };
      }
    });
  }
  root.nativeLineCommand=Object.freeze({install});
})();
