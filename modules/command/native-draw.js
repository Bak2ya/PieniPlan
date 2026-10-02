/* Build58 Final Feature Fill: native Rectangle / Circle / standalone Arc authoring. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const core=root.commandFoundation;
  const finite=core.finitePoint;
  const clone=p=>({x:Number(p.x),y:Number(p.y)});
  const same=(a,b)=>finite(a)&&finite(b)&&Math.hypot(a.x-b.x,a.y-b.y)<1e-8;
  const ids=['REC','C','A'];

  function install(registry,port){
    const available=ctx=>ctx.mode==='cad';
    registry.register({id:'REC',aliases:['RECTANG','RECTANGLE'],available,transactional:false,historyOwner:'cad-change-set',create(){
      const draft={phase:'first',first:null,pointer:null,token:port.contextToken()};
      const resolvePoint=e=>{
        if(e.type==='point'&&finite(e.point))return port.resolvePoint(e.point,{base:draft.first,shift:Boolean(e.shift),typed:false}).point;
        if(e.type==='text'){const q=port.parsePoint(String(e.text||''),{base:draft.first,direction:draft.first&&draft.pointer?{x:draft.pointer.x-draft.first.x,y:draft.pointer.y-draft.first.y}:null});return q?.ok?q.point:null;}
        return null;
      };
      const notify=()=>port.preview({kind:'rectangle',phase:draft.phase,first:draft.first&&clone(draft.first),pointer:draft.pointer&&clone(draft.pointer)});
      port.prompt('REC',draft.phase);
      return{describe:()=>({phase:draft.phase,promptKey:draft.phase==='first'?'command.rectangleFirst':'command.rectangleOpposite',input:['point','coordinate']}),view:()=>draft,
        preview(e){if(draft.phase==='opposite'&&finite(e.point)){draft.pointer=clone(port.resolvePoint(e.point,{base:draft.first,shift:Boolean(e.shift),typed:false}).point);notify();}return{ok:true};},
        input(e){const p=resolvePoint(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(draft.phase==='first'){draft.first=clone(p);draft.pointer=clone(p);draft.phase='opposite';notify();port.prompt('REC',draft.phase);return{ok:true};}if(same(draft.first,p)||Math.abs(p.x-draft.first.x)<1e-8||Math.abs(p.y-draft.first.y)<1e-8)return{ok:false,code:'zero-size'};return{ok:true,commit:true,value:{a:clone(draft.first),b:clone(p),token:draft.token}};},
        commit(value){if(!port.contextCurrent(value?.token,{geometry:true,layer:true,reference:false,region:true})){const err=new Error('stale-context');err.code='stale-context';throw err;}return port.commitRectangle(value.a,value.b);},
        cancel:()=>port.clearPreview(),finalize:()=>port.clearPreview()};
    }});

    registry.register({id:'C',aliases:['CIRCLE'],available,transactional:false,historyOwner:'cad-change-set',create(){
      const draft={phase:'center',center:null,pointer:null,token:port.contextToken()};
      const notify=()=>port.preview({kind:'circle',phase:draft.phase,center:draft.center&&clone(draft.center),pointer:draft.pointer&&clone(draft.pointer)});
      port.prompt('C',draft.phase);
      return{describe:()=>({phase:draft.phase,promptKey:draft.phase==='center'?'command.circleCenter':'command.circleRadius',input:['point','coordinate','length']}),view:()=>draft,
        preview(e){if(draft.phase==='radius'&&finite(e.point)){draft.pointer=clone(port.resolvePoint(e.point,{base:draft.center,shift:false,typed:false}).point);notify();}return{ok:true};},
        input(e){if(draft.phase==='center'){
          let p=null;if(e.type==='point'&&finite(e.point))p=port.resolvePoint(e.point,{base:null,shift:false,typed:false}).point;else if(e.type==='text'){const q=port.parsePoint(String(e.text||''),{base:null});if(q?.ok)p=q.point;}if(!p)return{ok:false,code:'invalid-coordinate'};draft.center=clone(p);draft.pointer=clone(p);draft.phase='radius';notify();port.prompt('C',draft.phase);return{ok:true};
        }
        let radius=null;if(e.type==='point'&&finite(e.point)){const p=port.resolvePoint(e.point,{base:draft.center,shift:false,typed:false}).point;radius=Math.hypot(p.x-draft.center.x,p.y-draft.center.y);}else if(e.type==='text'){
          const raw=String(e.text||'').trim();if(/[,@<]/.test(raw)){const q=port.parsePoint(raw,{base:draft.center,direction:draft.pointer?{x:draft.pointer.x-draft.center.x,y:draft.pointer.y-draft.center.y}:null});if(q?.ok)radius=Math.hypot(q.point.x-draft.center.x,q.point.y-draft.center.y);}else{const q=port.parseLength(raw);if(q?.ok)radius=q.mm;}
        }
        if(!(radius>1e-8))return{ok:false,code:'invalid-distance'};return{ok:true,commit:true,value:{center:clone(draft.center),radius,token:draft.token}};},
        commit(value){if(!port.contextCurrent(value?.token,{geometry:true,layer:true,reference:false,region:true})){const err=new Error('stale-context');err.code='stale-context';throw err;}return port.commitCircle(value.center,value.radius);},
        cancel:()=>port.clearPreview(),finalize:()=>port.clearPreview()};
    }});

    registry.register({id:'A',aliases:['ARC'],available,transactional:false,historyOwner:'cad-change-set',create(){
      const draft={phase:'start',start:null,through:null,pointer:null,token:port.contextToken()};
      const base=()=>draft.through||draft.start||null;
      const resolvePoint=e=>{
        if(e.type==='point'&&finite(e.point))return port.resolvePoint(e.point,{base:base(),shift:Boolean(e.shift),typed:false}).point;
        if(e.type==='text'){const q=port.parsePoint(String(e.text||''),{base:base(),direction:base()&&draft.pointer?{x:draft.pointer.x-base().x,y:draft.pointer.y-base().y}:null});return q?.ok?q.point:null;}
        return null;
      };
      const notify=()=>port.preview({kind:'arc',phase:draft.phase,start:draft.start&&clone(draft.start),through:draft.through&&clone(draft.through),pointer:draft.pointer&&clone(draft.pointer)});
      port.prompt('A',draft.phase);
      return{describe:()=>({phase:draft.phase,promptKey:draft.phase==='start'?'command.arcStart':draft.phase==='through'?'command.arcThrough':'command.arcEnd',input:['point','coordinate']}),view:()=>draft,
        preview(e){if(finite(e.point)&&draft.phase!=='start'){draft.pointer=clone(port.resolvePoint(e.point,{base:base(),shift:Boolean(e.shift),typed:false}).point);notify();}return{ok:true};},
        input(e){const p=resolvePoint(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(draft.phase==='start'){draft.start=clone(p);draft.pointer=clone(p);draft.phase='through';notify();port.prompt('A',draft.phase);return{ok:true};}if(draft.phase==='through'){if(same(draft.start,p))return{ok:false,code:'zero-length'};draft.through=clone(p);draft.pointer=clone(p);draft.phase='end';notify();port.prompt('A',draft.phase);return{ok:true};}if(same(draft.start,p)||same(draft.through,p))return{ok:false,code:'invalid-arc'};const geometry=port.arcFromThreePoints(draft.start,p,draft.through);if(!geometry)return{ok:false,code:'invalid-arc'};return{ok:true,commit:true,value:{geometry,token:draft.token}};},
        commit(value){if(!port.contextCurrent(value?.token,{geometry:true,layer:true,reference:false,region:true})){const err=new Error('stale-context');err.code='stale-context';throw err;}return port.commitArc(value.geometry);},
        cancel:()=>port.clearPreview(),finalize:()=>port.clearPreview()};
    }});
  }

  const aliasMap=new Map([['REC','REC'],['RECTANG','REC'],['RECTANGLE','REC'],['C','C'],['CIRCLE','C'],['A','A'],['ARC','A']]);
  root.nativeDrawCommands=Object.freeze({install,ids,resolve:raw=>aliasMap.get(String(raw||'').trim().toUpperCase())||null});
})();
