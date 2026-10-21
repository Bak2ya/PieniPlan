/* Build58 Final Feature Fill: native Rectangle / Circle / standalone Arc authoring. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const core=root.commandFoundation;
  const finite=core.finitePoint;
  const clone=p=>({x:Number(p.x),y:Number(p.y)});
  const same=(a,b)=>finite(a)&&finite(b)&&Math.hypot(a.x-b.x,a.y-b.y)<1e-8;
  const ids=['REC','C','A','POL','EL'];

  function install(registry,port){
    const available=ctx=>ctx.mode==='cad'||ctx.mode==='plan';
    registry.register({id:'REC',aliases:['RECTANG','RECTANGLE'],available,transactional:false,historyOwner:'cad-change-set',create(){
      const draft={phase:'first',first:null,pointer:null,width:null,height:null,rotation:0,token:port.contextToken()};
      const resolvePoint=e=>{
        if(e.type==='point'&&finite(e.point))return port.resolvePoint(e.point,{base:draft.first,shift:Boolean(e.shift),typed:false}).point;
        if(e.type==='text'){const q=port.parsePoint(String(e.text||''),{base:draft.first,direction:draft.first&&draft.pointer?{x:draft.pointer.x-draft.first.x,y:draft.pointer.y-draft.first.y}:null});return q?.ok?q.point:null;}
        return null;
      };
      const local=p=>{const a=draft.rotation*Math.PI/180,dx=p.x-draft.first.x,dy=p.y-draft.first.y;return{x:dx*Math.cos(a)+dy*Math.sin(a),y:-dx*Math.sin(a)+dy*Math.cos(a)};};
      const world=p=>{const a=draft.rotation*Math.PI/180;return{x:draft.first.x+p.x*Math.cos(a)-p.y*Math.sin(a),y:draft.first.y+p.x*Math.sin(a)+p.y*Math.cos(a)};};
      const dimensioned=p=>{const q=local(p);return draft.width&&draft.height?world({x:Math.sign(q.x||1)*draft.width,y:Math.sign(q.y||1)*draft.height}):p;};
      const corners=p=>{const q=local(p);return[{...draft.first},world({x:q.x,y:0}),world(q),world({x:0,y:q.y})];};
      const notify=()=>port.preview(draft.rotation&&draft.first?{kind:'polygon',points:corners(draft.pointer)}:{kind:'rectangle',phase:draft.phase,first:draft.first&&clone(draft.first),pointer:draft.pointer&&clone(draft.pointer)});
      port.prompt('REC',draft.phase);
      return{describe:()=>({phase:draft.phase,promptKey:draft.phase==='first'?'command.rectangleFirst':'command.rectangleOpposite',input:['point','coordinate'],actions:draft.first?[{id:'D',labelKey:'cadDraw.dimensions'},{id:'R',labelKey:'cad87.rotation'}]:[]}),view:()=>draft,
        preview(e){if(draft.phase==='opposite'&&finite(e.point)){draft.pointer=clone(dimensioned(port.resolvePoint(e.point,{base:draft.first,shift:Boolean(e.shift),typed:false}).point));notify();}return{ok:true};},
        input(e){const text=e.type==='keyword'?String(e.value):e.type==='text'?String(e.text).toUpperCase():'';
          if(draft.first&&['R','ROTATION'].includes(text)){draft.phase='rectangleAngle';port.prompt('REC',draft.phase);return{ok:true};}if(draft.phase==='rectangleAngle'){const n=e.type==='text'?Number(e.text):NaN;if(!Number.isFinite(n))return{ok:false,code:'invalid-number'};draft.rotation=n;draft.phase='opposite';port.prompt('REC','opposite');return{ok:true};}if(draft.first&&['D','DIMENSIONS'].includes(text)){draft.phase='width';port.prompt('REC','width');return{ok:true};}
          if(['width','height'].includes(draft.phase)){const n=e.type==='text'?port.parseLength(e.text):null;if(!n?.ok||n.mm<=0)return{ok:false,code:'invalid-distance'};draft[draft.phase]=n.mm;draft.phase=draft.phase==='width'?'height':'opposite';port.prompt('REC',draft.phase);return{ok:true};}
          let p=resolvePoint(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(draft.phase==='first'){draft.first=clone(p);draft.pointer=clone(p);draft.phase='opposite';notify();port.prompt('REC',draft.phase);return{ok:true};}p=dimensioned(p);if(same(draft.first,p)||Math.abs(local(p).x)<1e-8||Math.abs(local(p).y)<1e-8)return{ok:false,code:'zero-size'};return{ok:true,commit:true,value:{a:clone(draft.first),b:clone(p),points:draft.rotation?corners(p):null,token:draft.token}};},
        commit(value){if(!port.contextCurrent(value?.token,{geometry:true,layer:true,reference:false,region:true})){const err=new Error('stale-context');err.code='stale-context';throw err;}return value.points?port.commitPolyline(value.points,true):port.commitRectangle(value.a,value.b);},
        cancel:()=>port.clearPreview(),finalize:()=>port.clearPreview()};
    }});

    registry.register({id:'C',aliases:['CIRCLE'],available,transactional:false,historyOwner:'cad-change-set',create(){
      const draft={phase:'center',center:null,pointer:null,diameter:false,method:null,points:[],tangent:[],token:port.contextToken()};
      const notify=()=>port.preview({kind:'circle',phase:draft.phase,center:draft.center&&clone(draft.center),pointer:draft.pointer&&clone(draft.pointer)});
      port.prompt('C',draft.phase);
      return{describe:()=>({phase:draft.phase,promptKey:draft.phase==='center'?'command.circleCenter':'command.circleRadius',input:['point','coordinate','length'],actions:draft.phase==='center'?[{id:'2P',labelKey:'cad87.twoPoint'},{id:'3P',labelKey:'cad87.threePoint'},{id:'TTR',labelKey:'cad87.ttr'}]:draft.center?[{id:'D',labelKey:'cadDraw.diameter',active:draft.diameter},{id:'R',labelKey:'cadDraw.radius',active:!draft.diameter}]:[]}),view:()=>draft,
        preview(e){if(draft.phase==='points'&&finite(e.point)){const pts=[...draft.points,e.point],g=pts.length===2?{center:{x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2},radius:Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y)/2}:pts.length===3?root.cadCreation.circle3(...pts):null;if(g)port.preview({kind:'circle',center:g.center,pointer:{x:g.center.x+g.radius,y:g.center.y}});}if(draft.phase==='radius'&&finite(e.point)){draft.pointer=clone(port.resolvePoint(e.point,{base:draft.center,shift:false,typed:false}).point);notify();}return{ok:true};},
        input(e){const key=e.type==='keyword'?String(e.value).toUpperCase():e.type==='text'?String(e.text).toUpperCase():'';if(draft.phase==='center'&&['2P','3P','TTR'].includes(key)){draft.method=key;draft.phase=key==='TTR'?'tangent1':'points';port.prompt('C',draft.phase);return{ok:true};}
        if(draft.phase==='points'){const p=e.type==='point'?port.resolvePoint(e.point,{base:draft.points.at(-1)||null}).point:e.type==='text'?port.parsePoint(e.text,{base:draft.points.at(-1)||null})?.point:null;if(!p)return{ok:false,code:'invalid-coordinate'};if(draft.points.length&&same(p,draft.points.at(-1)))return{ok:false,code:'zero-length'};const pts=[...draft.points,clone(p)],needed=draft.method==='2P'?2:3;if(pts.length===needed){const geometry=needed===2?{center:{x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2},radius:Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y)/2}:root.cadCreation.circle3(...pts);if(!geometry)return{ok:false,code:'invalid-arc'};return{ok:true,commit:true,value:{...geometry,token:draft.token}};}draft.points=pts;port.prompt('C','points');return{ok:true};}
        if(['tangent1','tangent2'].includes(draft.phase)){const o=e.type==='point'?port.pick(e.point):null;if(!['cadLine','cadCircle','cadArc'].includes(o?.type)||!port.allowed(o.id)||draft.tangent.some(t=>t.object.id===o.id))return{ok:false,code:'unsupported-geometry'};draft.tangent.push({object:o,point:clone(e.point)});draft.phase=draft.tangent.length===1?'tangent2':'tangentRadius';port.prompt('C',draft.phase);return{ok:true};}
        if(draft.phase==='tangentRadius'){const r=e.type==='text'?port.parseLength(e.text)?.mm:null;if(!(r>1e-8))return{ok:false,code:'invalid-distance'};const [a,b]=draft.tangent,geometry=root.cadCreation.tangentPair(a.object,b.object,r,a.point,b.point);return geometry?{ok:true,commit:true,value:{...geometry,token:draft.token}}:{ok:false,code:'no-valid-result'};}
        if(draft.phase==='radius'&&['D','DIAMETER','R','RADIUS'].includes(key)){draft.diameter=key.startsWith('D');port.prompt('C',draft.diameter?'diameter':'radius');return{ok:true};}if(draft.phase==='center'){
          let p=null;if(e.type==='point'&&finite(e.point))p=port.resolvePoint(e.point,{base:null,shift:false,typed:false}).point;else if(e.type==='text'){const q=port.parsePoint(String(e.text||''),{base:null});if(q?.ok)p=q.point;}if(!p)return{ok:false,code:'invalid-coordinate'};draft.center=clone(p);draft.pointer=clone(p);draft.phase='radius';notify();port.prompt('C',draft.phase);return{ok:true};
        }
        let radius=null;if(e.type==='point'&&finite(e.point)){const p=port.resolvePoint(e.point,{base:draft.center,shift:false,typed:false}).point;radius=Math.hypot(p.x-draft.center.x,p.y-draft.center.y);}else if(e.type==='text'){
          const raw=String(e.text||'').trim();if(/[,@<]/.test(raw)){const q=port.parsePoint(raw,{base:draft.center,direction:draft.pointer?{x:draft.pointer.x-draft.center.x,y:draft.pointer.y-draft.center.y}:null});if(q?.ok)radius=Math.hypot(q.point.x-draft.center.x,q.point.y-draft.center.y);}else{const q=port.parseLength(raw);if(q?.ok)radius=q.mm/(draft.diameter?2:1);}
        }
        if(!(radius>1e-8))return{ok:false,code:'invalid-distance'};return{ok:true,commit:true,value:{center:clone(draft.center),radius,token:draft.token}};},
        commit(value){if(!port.contextCurrent(value?.token,{geometry:true,layer:true,reference:false,region:true})){const err=new Error('stale-context');err.code='stale-context';throw err;}return port.commitCircle(value.center,value.radius);},
        cancel:()=>port.clearPreview(),finalize:()=>port.clearPreview()};
    }});

    registry.register({id:'A',aliases:['ARC'],available:ctx=>ctx.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){
      const draft={phase:'start',start:null,through:null,pointer:null,center:null,centerFirst:false,angle:false,token:port.contextToken()};
      const base=()=>draft.center||draft.through||draft.start||null;
      const resolvePoint=e=>{
        if(e.type==='point'&&finite(e.point))return port.resolvePoint(e.point,{base:base(),shift:Boolean(e.shift),typed:false}).point;
        if(e.type==='text'){const q=port.parsePoint(String(e.text||''),{base:base(),direction:base()&&draft.pointer?{x:draft.pointer.x-base().x,y:draft.pointer.y-base().y}:null});return q?.ok?q.point:null;}
        return null;
      };
      const notify=()=>{if(draft.center&&draft.start&&draft.pointer){const g=root.cadCreation.arcCenter(draft.start,draft.center,draft.pointer);if(g)port.preview({kind:'arcGeometry',geometry:g});return;}port.preview({kind:'arc',phase:draft.phase,start:draft.start&&clone(draft.start),through:draft.through&&clone(draft.through),pointer:draft.pointer&&clone(draft.pointer)});};
      port.prompt('A',draft.phase);
      return{describe:()=>({phase:draft.phase,promptKey:draft.phase==='start'?'command.arcStart':draft.phase==='through'?'command.arcThrough':'command.arcEnd',input:['point','coordinate'],actions:['start','through'].includes(draft.phase)?[{id:'C',labelKey:'cad87.center'}]:draft.phase==='centerEnd'?[{id:'A',labelKey:'context.angle'}]:[]}),view:()=>draft,
        preview(e){if(finite(e.point)&&draft.phase!=='start'){draft.pointer=clone(port.resolvePoint(e.point,{base:base(),shift:Boolean(e.shift),typed:false}).point);notify();}return{ok:true};},
        input(e){const key=String(e.type==='keyword'?e.value:e.text||'').toUpperCase();if(['start','through'].includes(draft.phase)&&['C','CENTER'].includes(key)){draft.centerFirst=draft.phase==='start';draft.phase='centerPick';port.prompt('A','centerPick');return{ok:true};}if(draft.phase==='centerEnd'&&['A','ANGLE'].includes(key)){draft.phase='centerAngle';port.prompt('A','centerAngle');return{ok:true};}if(draft.phase==='centerAngle'){const n=e.type==='text'?Number(e.text):NaN,g=Number.isFinite(n)&&root.cadCreation.arcCenter(draft.start,draft.center,null,n);return g?{ok:true,commit:true,value:{geometry:g,token:draft.token}}:{ok:false,code:'invalid-arc'};}const p=resolvePoint(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(draft.phase==='centerPick'){draft.center=clone(p);draft.phase=draft.centerFirst?'centerStart':'centerEnd';port.prompt('A',draft.phase);return{ok:true};}if(draft.phase==='centerStart'){if(same(p,draft.center))return{ok:false,code:'zero-length'};draft.start=clone(p);draft.phase='centerEnd';port.prompt('A',draft.phase);return{ok:true};}if(draft.phase==='centerEnd'){const g=root.cadCreation.arcCenter(draft.start,draft.center,p);return g?{ok:true,commit:true,value:{geometry:g,token:draft.token}}:{ok:false,code:'invalid-arc'};}if(draft.phase==='start'){draft.start=clone(p);draft.pointer=clone(p);draft.phase='through';notify();port.prompt('A',draft.phase);return{ok:true};}if(draft.phase==='through'){if(same(draft.start,p))return{ok:false,code:'zero-length'};draft.through=clone(p);draft.pointer=clone(p);draft.phase='end';notify();port.prompt('A',draft.phase);return{ok:true};}if(same(draft.start,p)||same(draft.through,p))return{ok:false,code:'invalid-arc'};const geometry=port.arcFromThreePoints(draft.start,p,draft.through);if(!geometry)return{ok:false,code:'invalid-arc'};return{ok:true,commit:true,value:{geometry,token:draft.token}};},
        commit(value){if(!port.contextCurrent(value?.token,{geometry:true,layer:true,reference:false,region:true})){const err=new Error('stale-context');err.code='stale-context';throw err;}return port.commitArc(value.geometry);},
        cancel:()=>port.clearPreview(),finalize:()=>port.clearPreview()};
    }});
    registry.register({id:'POL',aliases:['POLYGON'],available:ctx=>ctx.mode==='cad',transactional:false,historyOwner:'cad-change-set',create(){
      const draft={phase:'sides',count:4,center:null,first:null,pointer:null,circumscribed:false,token:port.contextToken()};
      const show=()=>port.prompt('POL',draft.phase),point=e=>e.type==='point'?port.resolvePoint(e.point,{base:draft.center||draft.first}).point:e.type==='text'?port.parsePoint(e.text,{base:draft.center||draft.first})?.point:null;
      function geometry(p,number=null){if(draft.first)return root.cadCreation.polygonEdge(draft.count,draft.first,p);const r=number??Math.hypot(p.x-draft.center.x,p.y-draft.center.y),angle=number!==null?(-90+(draft.circumscribed?0:180/draft.count)):Math.atan2(p.y-draft.center.y,p.x-draft.center.x)*180/Math.PI;return root.cadCreation.polygon(draft.count,draft.center,r,angle,draft.circumscribed);}
      show();return{view:()=>draft,describe:()=>({phase:draft.phase,actions:draft.phase==='center'?[{id:'E',labelKey:'cad87.edge'}]:draft.phase==='method'?[{id:'I',labelKey:'cad87.inscribed'},{id:'C',labelKey:'cad87.circumscribed'}]:[]}),preview(e){draft.pointer=e.point;if(['radius','edgeEnd'].includes(draft.phase)&&finite(e.point)){const points=geometry(e.point);if(points)port.preview({kind:'polygon',points});}return{ok:true};},input(e){const key=String(e.type==='keyword'?e.value:e.text||'').toUpperCase();if(draft.phase==='sides'){const n=e.type==='enter'?4:Number(e.text);if(!Number.isInteger(n)||n<3||n>1024)return{ok:false,code:'invalid-number'};draft.count=n;draft.phase='center';show();return{ok:true};}if(draft.phase==='center'&&['E','EDGE'].includes(key)){draft.phase='edgeStart';show();return{ok:true};}if(draft.phase==='method'){if(e.type!=='enter'&&!['I','INSCRIBED','C','CIRCUMSCRIBED'].includes(key))return{ok:false,code:'invalid-keyword'};draft.circumscribed=key.startsWith('C');draft.phase='radius';show();return{ok:true};}let p=null,n=null;if(draft.phase==='radius'&&e.type==='text'&&!/[,<@]/.test(e.text))n=port.parseLength(e.text)?.mm;else p=point(e);if(draft.phase==='center'&&p){draft.center=clone(p);draft.phase='method';show();return{ok:true};}if(draft.phase==='edgeStart'&&p){draft.first=clone(p);draft.phase='edgeEnd';show();return{ok:true};}if(['radius','edgeEnd'].includes(draft.phase)&&(p||n>0)){const points=geometry(p,n);return points?{ok:true,commit:true,value:{points,token:draft.token}}:{ok:false,code:'invalid-distance'};}return{ok:false,code:'invalid-coordinate'};},commit(v){if(!port.contextCurrent(v.token,{geometry:true,layer:true,region:true}))throw Error('stale-context');return port.commitPolyline(v.points,true);},cancel:()=>port.clearPreview(),finalize:()=>port.clearPreview()};
    }});

    root.nativeEllipseCommand.install(registry,port);
  }

  const aliasMap=new Map([['EL','EL'],['ELLIPSE','EL'],['REC','REC'],['RECTANG','REC'],['RECTANGLE','REC'],['C','C'],['CIRCLE','C'],['A','A'],['ARC','A'],['POL','POL'],['POLYGON','POL']]);
  root.nativeDrawCommands=Object.freeze({install,ids,keyword:(id,phase,key)=>id==='EL'&&root.nativeEllipseCommand.keyword(phase,key)||id==='REC'&&phase!=='first'&&['D','DIMENSIONS','R','ROTATION'].includes(key)||id==='C'&&(['radius'].includes(phase)&&['D','DIAMETER','R','RADIUS'].includes(key)||phase==='center'&&['2P','3P','TTR'].includes(key))||id==='A'&&(['start','through'].includes(phase)&&['C','CENTER'].includes(key)||phase==='centerEnd'&&['A','ANGLE'].includes(key))||id==='POL'&&(['center'].includes(phase)&&['E','EDGE'].includes(key)||phase==='method'&&['I','INSCRIBED','C','CIRCUMSCRIBED'].includes(key)),resolve:raw=>aliasMap.get(String(raw||'').trim().toUpperCase())||null});
})();
