/* Build55 CAD Core 2: common selection-first transform command lifecycle. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const ids=['M','CO','RO','MI','SC','S','AR','AL'];
  function install(registry,port){
    const cad=ctx=>ctx.mode==='cad';
    let copyMode='multiple';
    for(const id of ids)registry.register({id,aliases:{M:['MOVE'],CO:['COPY'],RO:['ROTATE'],MI:['MIRROR'],SC:['SCALE'],S:['STRETCH'],AR:['ARRAY'],AL:['ALIGN']}[id],available:cad,transactional:false,historyOwner:'cad-change-set',create(){
      const selected=port.preselected().filter(port.allowed),draft={id,token:port.token(),ids:new Set(id==='S'?[]:selected),phase:id==='S'?'window1':selected.length?firstPhase(id):'select',base:null,p1:null,p2:null,p3:null,p4:null,rectStart:null,rect:null,lastPoint:null,plan:null,columns:null,rows:null,dx:null,dy:null,arrayType:null,center:null,items:null,fillAngle:null,copy:false,reference:null,refPoint:null,history:[]};
      draft.copyMode=port.copyMode?.()||copyMode;draft.arrayCount=null;draft.arrayFit=false;draft.newLengthStart=null;
      function firstPhase(k){return({M:'base',CO:'base',RO:'base',MI:'axis1',SC:'base',AR:'arrayType',AL:'source1'})[k]||'select';}
      const prompt=()=>port.prompt(id,draft.phase,draft.ids.size,draft);
      const pick=e=>e.type==='point'?port.pick(e.point):null;
      const resolved=e=>{if(e.type==='point')return port.resolve(e.point,(draft.phase==='referenceEnd'?draft.refPoint:draft.phase==='newLength2'?draft.newLengthStart:null)||draft.base||draft.p1||null);if(e.type==='text'){const q=port.parsePoint(e.text,{base:(draft.phase==='referenceEnd'?draft.refPoint:draft.phase==='newLength2'?draft.newLengthStart:null)||draft.base||draft.p1||null,direction:draft.base&&draft.lastPoint?{x:draft.lastPoint.x-draft.base.x,y:draft.lastPoint.y-draft.base.y}:null});return q?.ok?q.point:null;}return null;};
      function ensureSelection(){if(!draft.ids.size)return false;draft.phase=firstPhase(id);port.select(draft.ids);prompt();if(['arrayType','columns'].includes(draft.phase))port.focus();return true;}
      function planForPoint(p){if(!p)return null;if(id==='M'||id==='CO'){if(!draft.base)return null;return port.planMatrix(draft.ids,root.cadTransformOperations.translate(p.x-draft.base.x,p.y-draft.base.y),{copy:id==='CO'});}if(id==='RO'){if(!draft.base)return null;const a=Math.atan2(p.y-draft.base.y,p.x-draft.base.x)*180/Math.PI;return port.planMatrix(draft.ids,root.cadTransformOperations.rotate(draft.base,a-(draft.reference||0)),{copy:draft.copy});}if(id==='MI'){if(!draft.p1)return null;const m=root.cadTransformOperations.mirror(draft.p1,p);return m?port.planMatrix(draft.ids,m,{copy:true}):null;}if(id==='S'){if(!draft.base)return null;return port.planStretch(draft.rect,{x:p.x-draft.base.x,y:p.y-draft.base.y});}return null;}
      function inputNumber(e){if(e.type!=='text')return null;const n=Number(String(e.text).trim());return Number.isFinite(n)?n:null;}
      function copyPlan(point){
        if(!draft.base||!point)return null;
        const dx=point.x-draft.base.x,dy=point.y-draft.base.y;
        if(Math.hypot(dx,dy)<1e-8)return null;
        const count=draft.arrayCount||2,step=draft.arrayFit?1/(count-1):1;
        if(count*draft.ids.size>100000)return null;
        if(count===2)return port.planMatrix(draft.ids,root.cadTransformOperations.translate(dx,dy),{copy:true});
        const plans=Array.from({length:count-1},(_,i)=>port.planMatrix(draft.ids,root.cadTransformOperations.translate(dx*step*(i+1),dy*step*(i+1)),{copy:true}));
        return plans.every(Boolean)?{kind:'ARRAY',before:plans[0].before,after:plans.flatMap(p=>p.after),copy:true}:null;
      }
      function copyAt(point){
        const plan=copyPlan(point);
        if(!plan)return{ok:false,code:'no-valid-result'};
        if(draft.copyMode==='single')return{ok:true,commit:true,value:plan};
        if(!port.commit(id,plan))return{ok:false,code:'no-valid-result'};
        draft.history.push(port.historyMark());draft.token=port.token();draft.phase='target';draft.arrayCount=null;draft.arrayFit=false;port.preview(null);prompt();return{ok:true,code:'applied-repeat'};
      }
      function scalePlan(point,number=null){const n=number??(point&&Math.hypot(point.x-draft.base.x,point.y-draft.base.y));if(!(n>0))return null;const matrix=root.cadTransformOperations.scale(draft.base,n/(draft.reference||1));return matrix&&port.planMatrix(draft.ids,matrix,{copy:draft.copy});}
      function actions(){
        if(['RO','SC'].includes(id)&&draft.phase==='target')return[{id:'R',labelKey:'cadTransform.reference'},{id:'C',labelKey:'tool.copy',active:draft.copy},...(id==='SC'&&draft.reference?[{id:'P',labelKey:'cad91.points'}]:[])];
        if(id!=='CO')return[];
        if(draft.phase==='base')return[{id:'MO',labelKey:'cad91.copyMode'},{id:'M',labelKey:'cad91.multiple'}];
        if(draft.phase==='copyMode')return[{id:'S',labelKey:'cad91.single',active:draft.copyMode==='single'},{id:'M',labelKey:'cad91.multiple',active:draft.copyMode==='multiple'}];
        if(draft.phase==='target')return[{id:'A',labelKey:'tool.array'},...(draft.history.length?[{id:'U',labelKey:'cadEdit.undo'}]:[])];
        return draft.phase==='copyArrayTarget'?[{id:'F',labelKey:'cad91.fit',active:draft.arrayFit}]:[];
      }
      prompt();if(selected.length)port.select(draft.ids);if(['arrayType','columns'].includes(draft.phase))port.focus();
      return{view:()=>draft,describe:()=>({phase:draft.phase,count:draft.ids.size,actions:actions()}),preview(e){e={...e,type:e.type||'point'};if(!port.current(draft.token))return{ok:false,code:'stale-context'};if(id==='MI'&&draft.phase==='eraseSource'){port.preview(draft.plan);return{ok:true};}draft.lastPoint=e.point||null;let plan=null;if(id==='SC'&&draft.phase==='target')plan=scalePlan(resolved(e));else if(id==='SC'&&draft.phase==='newLength2'&&draft.newLengthStart){const p=resolved(e);plan=p&&scalePlan(null,Math.hypot(p.x-draft.newLengthStart.x,p.y-draft.newLengthStart.y));}else if(id==='CO'&&['target','copyArrayTarget'].includes(draft.phase))plan=copyPlan(resolved(e));else if(['target','axis2'].includes(draft.phase))plan=planForPoint(resolved(e));else if(id==='S'&&draft.phase==='target')plan=planForPoint(resolved(e));draft.plan=plan;port.preview(plan);return{ok:true};},input(e){if(!port.current(draft.token))return{ok:false,code:'stale-context'};
        const keyword=e.type==='keyword'?String(e.value).toUpperCase():e.type==='text'?String(e.text).trim().toUpperCase():'';
        if(id==='CO'&&draft.phase==='base'&&['M','MULTIPLE','MO','MODE','O'].includes(keyword)){if(['MO','MODE','O'].includes(keyword)){draft.phase='copyMode';prompt();return{ok:true};}draft.copyMode='multiple';draft.phase='base';prompt();return{ok:true};}
        if(id==='CO'&&draft.phase==='copyMode'){const mode=['S','SINGLE'].includes(keyword)?'single':['M','MULTIPLE'].includes(keyword)?'multiple':e.type==='enter'?draft.copyMode:null;if(!mode)return{ok:false,code:'invalid-keyword'};copyMode=mode;port.setCopyMode?.(mode);draft.copyMode=mode;draft.phase='base';prompt();return{ok:true};}
        if(id==='CO'&&draft.phase==='target'&&['A','ARRAY'].includes(keyword)){draft.phase='copyArrayCount';prompt();port.focus();return{ok:true};}
        if(id==='CO'&&draft.phase==='copyArrayCount'){const n=inputNumber(e);if(!Number.isInteger(n)||n<2||n>1000)return{ok:false,code:'invalid-number'};draft.arrayCount=n;draft.phase='copyArrayTarget';prompt();return{ok:true};}
        if(id==='CO'&&draft.phase==='copyArrayTarget'){if(['F','FIT'].includes(keyword)){draft.arrayFit=true;prompt();return{ok:true};}const p=resolved(e);return p?copyAt(p):{ok:false,code:'invalid-coordinate'};}
        if(['M','CO'].includes(id)&&e.type==='enter'&&draft.phase==='base'){draft.base={x:0,y:0};draft.phase='target';prompt();return{ok:true};}
        if(['M','CO'].includes(id)&&e.type==='enter'&&draft.phase==='target'){if(id==='CO'&&draft.history.length){port.finish();return{ok:true};}const point={x:draft.base.x*2,y:draft.base.y*2};if(id==='CO')return copyAt(point);const plan=planForPoint(point);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}
        if(id==='CO'&&['U','UNDO'].includes(keyword)){const mark=draft.history.at(-1);if(!mark||!port.undoOwn(mark))return{ok:false,code:'nothing-to-back'};draft.history.pop();draft.token=port.token();port.preview(null);prompt();return{ok:true};}
        if(['RO','SC'].includes(id)&&draft.base&&['C','COPY'].includes(keyword)){draft.copy=!draft.copy;prompt();return{ok:true};}
        if(['RO','SC'].includes(id)&&draft.base&&['R','REFERENCE'].includes(keyword)){draft.phase='reference';draft.reference=null;draft.refPoint=null;prompt();return{ok:true};}
        if(id==='SC'&&draft.reference&&draft.phase==='target'&&['P','POINTS'].includes(keyword)){draft.phase='newLength1';draft.newLengthStart=null;prompt();return{ok:true};}
        if(id==='SC'&&['newLength1','newLength2'].includes(draft.phase)){const p=e.type==='point'?port.resolve(e.point,draft.newLengthStart):e.type==='text'?port.parsePoint(e.text,{base:draft.newLengthStart})?.point:null;if(!p)return{ok:false,code:'invalid-coordinate'};if(!draft.newLengthStart){draft.newLengthStart=p;draft.phase='newLength2';prompt();return{ok:true};}const n=Math.hypot(p.x-draft.newLengthStart.x,p.y-draft.newLengthStart.y),plan=scalePlan(null,n);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'invalid-number'};}
        if(['RO','SC'].includes(id)&&['reference','referenceEnd'].includes(draft.phase)){
          const n=e.type==='text'&&!/[,@<]/.test(e.text)?(id==='SC'?port.parseLength(e.text)?.mm:Number(e.text)):null;
          if(Number.isFinite(n)){if(id==='SC'&&n<=0)return{ok:false,code:'invalid-number'};draft.reference=n;draft.phase='target';prompt();return{ok:true};}
          const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(!draft.refPoint){draft.refPoint=p;draft.phase='referenceEnd';prompt();return{ok:true};}const dx=p.x-draft.refPoint.x,dy=p.y-draft.refPoint.y;if(Math.hypot(dx,dy)<1e-8)return{ok:false,code:'invalid-coordinate'};draft.reference=id==='RO'?Math.atan2(dy,dx)*180/Math.PI:Math.hypot(dx,dy);draft.phase='target';prompt();return{ok:true};
        }
        if(['M','CO'].includes(id)&&draft.phase==='base'&&['D','DISPLACEMENT'].includes(keyword)){draft.phase='displacement';prompt();return{ok:true};}
        if(['M','CO'].includes(id)&&draft.phase==='displacement'){const p=e.type==='text'?port.parsePoint(e.text,{base:{x:0,y:0}})?.point:e.type==='point'?e.point:null;if(!p)return{ok:false,code:'invalid-coordinate'};if(id==='CO'){draft.base={x:0,y:0};return copyAt(p);}const plan=port.planMatrix(draft.ids,root.cadTransformOperations.translate(p.x,p.y));return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}
        if(draft.phase==='select'){if(e.type==='selection'){for(const objectId of e.ids||[]){if(!port.allowed(objectId))continue;if(e.remove)draft.ids.delete(objectId);else draft.ids.add(objectId);}port.select(draft.ids);prompt();return{ok:true};}if(e.type==='enter')return ensureSelection()?{ok:true}:{ok:false,code:'selection-required'};const o=pick(e);if(!o||!port.allowed(o.id))return{ok:false,code:'target-not-modifiable'};if(e.shift)draft.ids.delete(o.id);else draft.ids.add(o.id);port.select(draft.ids);prompt();return{ok:true};}
        if(id==='S'&&draft.phase==='window1'){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};draft.rectStart=p;draft.phase='window2';prompt();return{ok:true};}
        if(id==='S'&&draft.phase==='window2'){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};draft.rect=port.rect(draft.rectStart,p);draft.ids=new Set(port.stretchCandidates(draft.rect));if(!draft.ids.size)return{ok:false,code:'selection-required'};port.select(draft.ids);draft.phase='base';prompt();return{ok:true};}
        if(id==='AR'&&draft.phase==='arrayType'){const text=e.type==='enter'?'R':String(e.text||'').trim().toUpperCase();if(['R','RECT','RECTANGULAR',''].includes(text)){draft.arrayType='rectangular';draft.phase='columns';prompt();port.focus();return{ok:true};}if(['P','POLAR'].includes(text)){draft.arrayType='polar';draft.phase='polarCenter';prompt();return{ok:true};}const legacyColumns=Number(text);if(Number.isFinite(legacyColumns)){draft.arrayType='rectangular';draft.columns=Math.max(1,Math.round(legacyColumns));draft.phase='rows';prompt();port.focus();return{ok:true};}return{ok:false,code:'invalid-keyword'};}
        if(id==='AR'&&draft.phase==='polarCenter'){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};draft.center=p;draft.phase='polarItems';prompt();port.focus();return{ok:true};}
        if(id==='AL'&&draft.phase==='source2'&&e.type==='enter'){const matrix=root.cadTransformOperations.translate(draft.p3.x-draft.p1.x,draft.p3.y-draft.p1.y),plan=port.planMatrix(draft.ids,matrix);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}
        if(['base','axis1','source1','source2','target1','target2'].includes(draft.phase)){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(draft.phase==='base'){draft.base=p;draft.phase='target';if(id==='SC'||id==='RO')port.focus();}else if(draft.phase==='axis1'){draft.p1=p;draft.phase='axis2';}else if(draft.phase==='source1'){draft.p1=p;draft.phase='target1';}else if(draft.phase==='target1'){draft.p3=p;draft.phase='source2';}else if(draft.phase==='source2'){draft.p2=p;draft.phase='target2';}else if(draft.phase==='target2'){draft.p4=p;draft.phase='alignScale';port.focus();}prompt();return{ok:true};}
        if(id==='RO'&&draft.phase==='target'&&e.type==='text'){const n=inputNumber(e);if(n===null)return{ok:false,code:'invalid-number'};const plan=port.planMatrix(draft.ids,root.cadTransformOperations.rotate(draft.base,n-(draft.reference||0)),{copy:draft.copy});return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}
        if(id==='SC'&&draft.phase==='target'){const n=e.type==='text'?(draft.reference?port.parseLength(e.text)?.mm:inputNumber(e)):null,p=e.type==='point'?resolved(e):null,plan=scalePlan(p,n);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'invalid-number'};}
        if(id==='MI'&&draft.phase==='eraseSource'){
          const text=e.type==='enter'?'N':e.type==='text'?String(e.text).trim().toUpperCase():null;
          const erase=['Y','YES'].includes(text),keep=['N','NO',''].includes(text);
          if(!erase&&!keep)return{ok:false,code:'mirror-choice-required'};
          const matrix=root.cadTransformOperations.mirror(draft.p1,draft.p2),plan=matrix&&port.planMatrix(draft.ids,matrix,{copy:!erase});
          return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};
        }
        if(['target','axis2'].includes(draft.phase)){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(id==='CO')return copyAt(p);const plan=planForPoint(p);if(!plan)return{ok:false,code:'no-valid-result'};if(id==='MI'){draft.p2={...p};draft.plan=plan;draft.phase='eraseSource';port.preview(plan);prompt();port.focus();return{ok:true};}return{ok:true,commit:true,value:plan};}
        if(id==='AR'){const n=(draft.phase==='polarAngle'&&e.type==='enter')?360:inputNumber(e);if(n===null)return{ok:false,code:'invalid-number'};if(draft.phase==='columns'){draft.columns=Math.max(1,Math.round(n));draft.phase='rows';}else if(draft.phase==='rows'){draft.rows=Math.max(1,Math.round(n));draft.phase='columnSpacing';}else if(draft.phase==='columnSpacing'){draft.dx=n;draft.phase='rowSpacing';}else if(draft.phase==='rowSpacing'){draft.dy=n;const plan=port.planArray(draft.ids,{columns:draft.columns,rows:draft.rows,dx:draft.dx,dy:draft.dy});return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}else if(draft.phase==='polarItems'){draft.items=Math.max(2,Math.round(n));draft.phase='polarAngle';}else if(draft.phase==='polarAngle'){draft.fillAngle=n;if(Math.abs(n)<1e-9)return{ok:false,code:'invalid-number'};const plan=port.planPolarArray(draft.ids,{center:draft.center,items:draft.items,angle:n});return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}else return{ok:false,code:'input-not-supported'};prompt();port.focus();return{ok:true};}
        if(id==='AL'&&draft.phase==='alignScale'){const text=e.type==='enter'?'N':String(e.text||'').trim().toUpperCase(),yes=['Y','YES','1','TRUE'].includes(text),no=['N','NO','0','FALSE',''].includes(text);if(!yes&&!no)return{ok:false,code:'invalid-keyword'};const m=root.cadTransformOperations.align(draft.p1,draft.p2,draft.p3,draft.p4,{scale:yes}),plan=m&&port.planMatrix(draft.ids,m);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}
        return{ok:false,code:'input-not-supported'};
      },commit(plan){if(!port.current(draft.token))throw Error('stale-context');return port.commit(id,plan);},cancel:()=>port.clear(),finalize:()=>port.clear()};
    }});
  }
  const aliasMap=new Map([['M','M'],['MOVE','M'],['CO','CO'],['COPY','CO'],['RO','RO'],['ROTATE','RO'],['MI','MI'],['MIRROR','MI'],['SC','SC'],['SCALE','SC'],['S','S'],['STRETCH','S'],['AR','AR'],['ARRAY','AR'],['AL','AL'],['ALIGN','AL']]);
  function keyword(id,phase,key){
    if(['M','CO'].includes(id)&&phase==='base'&&['D','DISPLACEMENT'].includes(key))return true;
    if(['RO','SC'].includes(id)&&['target','reference','referenceEnd'].includes(phase)&&['R','REFERENCE','C','COPY'].includes(key))return true;
    if(id==='CO')return (phase==='base'&&['MO','MODE','O','M','MULTIPLE'].includes(key))||(phase==='copyMode'&&['S','SINGLE','M','MULTIPLE'].includes(key))||(phase==='target'&&['A','ARRAY','U','UNDO'].includes(key))||(phase==='copyArrayTarget'&&['F','FIT'].includes(key));
    return id==='SC'&&phase==='target'&&['P','POINTS'].includes(key);
  }
  root.nativeTransformCommands=Object.freeze({install,ids,keyword,resolve:raw=>aliasMap.get(String(raw||'').trim().toUpperCase())||null});
})();
