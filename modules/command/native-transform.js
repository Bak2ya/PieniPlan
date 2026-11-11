/* Build55 CAD Core 2: common selection-first transform command lifecycle. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const transforms=['M','CO','RO','MI','SC','S','AR','AL'],ids=[...transforms,'ARRAYEDIT'];
  function install(registry,port){
    const cad=ctx=>ctx.mode==='cad';
    let copyMode='multiple';
    for(const id of transforms)registry.register({id,aliases:{M:['MOVE'],CO:['COPY'],RO:['ROTATE'],MI:['MIRROR'],SC:['SCALE'],S:['STRETCH'],AR:['ARRAY'],AL:['ALIGN']}[id],available:cad,transactional:false,historyOwner:'cad-change-set',create(){
      const selected=port.preselected().filter(port.allowed),draft={id,token:port.token(),ids:new Set(selected),phase:selected.length?firstPhase(id):'select',base:null,p1:null,p2:null,p3:null,p4:null,rectStart:null,rect:null,lastPoint:null,plan:null,columns:null,rows:null,dx:null,dy:null,arrayType:null,center:null,items:null,fillAngle:null,copy:false,reference:null,refPoint:null,history:[]};
      draft.stretch={wholeIds:[...selected],regions:[]};draft.crossing=false;
      draft.copyMode=port.copyMode?.()||copyMode;draft.arrayCount=null;draft.arrayFit=false;draft.newLengthStart=null;draft.polarAnchor=null;
      function firstPhase(k){return({M:'base',CO:'base',S:'base',RO:'base',MI:'axis1',SC:'base',AR:'arrayType',AL:'source1'})[k]||'select';}
      const prompt=()=>port.prompt(id,draft.phase,draft.ids.size,draft);
      const pick=e=>e.type==='point'?port.pick(e.point):null;
      const commandOrigin=()=>port.origin?.()||{x:0,y:0};
      const displacement=e=>{if(e.type==='text')return port.parseDisplacement?port.parseDisplacement(e.text):port.parsePoint(e.text,{base:{x:0,y:0}})?.point;if(e.type==='point'){const o=commandOrigin();return{x:e.point.x-o.x,y:e.point.y-o.y};}return null;};
      const displacementPlan=e=>{const d=displacement(e);return d&&(id==='S'?port.planStretch(draft.stretch,d):port.planMatrix(draft.ids,root.cadTransformOperations.translate(d.x,d.y),{copy:id==='CO'}));};
      const pointBase=()=>draft.phase==='displacement'?commandOrigin():draft.phase==='arrayCellCorner'?draft.cellFirst:draft.phase==='polarAnchor'?draft.center:draft.phase==='pathAnchor'?draft.arrayPath.start:draft.phase==='newLength1'?null:draft.phase==='newLength2'?draft.newLengthStart:(draft.phase==='referenceEnd'?draft.refPoint:null)||draft.base||draft.p1||draft.rectStart||null;
      const resolved=e=>{const base=pointBase();if(e.type==='point'){if(id==='S'&&['select','window1','window2'].includes(draft.phase))return e.point;return port.resolve(e.point,base);}if(e.type==='text'){if(['RO','SC'].includes(id)&&draft.phase==='reference'&&String(e.text).trim()==='@'&&draft.base)return{...draft.base};const q=port.parsePoint(e.text,{base,direction:base&&draft.lastPoint?{x:draft.lastPoint.x-base.x,y:draft.lastPoint.y-base.y}:null});return q?.ok?q.point:null;}return null;};
      function ensureSelection(){if(!draft.ids.size)return false;draft.phase=firstPhase(id);port.select(draft.ids);prompt();if(['arrayType','columns'].includes(draft.phase))port.focus();return true;}
      function planForPoint(p){if(!p)return null;if(id==='M'||id==='CO'){if(!draft.base)return null;return port.planMatrix(draft.ids,root.cadTransformOperations.translate(p.x-draft.base.x,p.y-draft.base.y),{copy:id==='CO'});}if(id==='RO'){if(!draft.base)return null;const a=Math.atan2(p.y-draft.base.y,p.x-draft.base.x)*180/Math.PI;return port.planMatrix(draft.ids,root.cadTransformOperations.rotate(draft.base,a-(draft.reference??port.axisAngle?.()??0)),{copy:draft.copy});}if(id==='MI'){if(!draft.p1)return null;const m=root.cadTransformOperations.mirror(draft.p1,p);return m?port.planMatrix(draft.ids,m,{copy:true}):null;}if(id==='S'){if(!draft.base)return null;return port.planStretch(draft.stretch,{x:p.x-draft.base.x,y:p.y-draft.base.y});}return null;}
      const angleNumber=e=>e.type==='text'?(root.cadUnits?.parseAngle?root.cadUnits.parseAngle(e.text).degrees:inputNumber(e)):NaN,absoluteAngle=n=>port.angleToWorld?.(n)??((port.axisAngle?.()??0)+n*(port.angleSign?.()??1));
      function rotationPlan(e){if(e.type==='text'&&!/[,@<#*]/.test(e.text)){const n=angleNumber(e);if(!Number.isFinite(n))return null;const delta=draft.reference===null?n*(port.angleSign?.()??1):absoluteAngle(n)-draft.reference;return port.planMatrix(draft.ids,root.cadTransformOperations.rotate(draft.base,delta),{copy:draft.copy});}return planForPoint(resolved(e));}
      function scaleInputPlan(e){const coordinate=e.type==='point'||e.type==='text'&&/[,@<#*]/.test(e.text),n=e.type==='text'&&!coordinate?(draft.reference?port.parseLength(e.text)?.mm:inputNumber(e)):null;return scalePlan(coordinate?resolved(e):null,n);}
      const arrayCount=(n,min=1)=>Number.isSafeInteger(n)&&n>=min&&n<=100000;
      const arraySpacing=e=>{if(e.type!=='text')return NaN;const q=port.parseLength?.(e.text);return port.parseLength?q?.ok?q.mm:NaN:inputNumber(e);};
      function editable(plan,recipe){
        if(!plan||!draft.editable)return plan;
        const T=root.cadTransformOperations;
        if(plan.after.length>T.arrayLimit)return null;
        try{T.validateArrayRecipe(recipe);}catch{return null;}
        return {...plan,editableArray:recipe};
      }
      function rectangularPlan(dx,dy){
        const params={columns:draft.columns,rows:draft.rows,dx,dy},plan=port.planArray(draft.ids,params);
        return draft.editable?editable(plan,{type:'rectangular',frame:port.frame(),...params}):plan;
      }
      function arrayCellPlan(e){const p=resolved(e);if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!draft.cellFirst)return null;const delta={x:p.x-draft.cellFirst.x,y:p.y-draft.cellFirst.y},v=port.arrayVector?port.arrayVector(delta):delta;return v&&Number.isFinite(v.x)&&Number.isFinite(v.y)?rectangularPlan(v.x,v.y):null;}
      function polarPlan(angle){
        if(!Number.isFinite(angle)||Math.abs(angle)<1e-9)return null;
        const signed=angle*(port.angleSign?.()??1);
        const angularInput=draft.phase==='polarStep'?{spacing:signed}:{angle:signed};
        const params={center:draft.center,items:draft.items,...angularInput,...(draft.polarAnchor?{anchor:draft.polarAnchor}:{})};
        return editable(port.planPolarArray(draft.ids,params),{type:'polar',handedness:port.angleSign?.()??1,...params});
      }
      const polarDefault=()=>draft.phase==='polarStep'?360/draft.items:360;
      function pathPlan(event){
        if(event.type!=='text'||!port.pathAllowed(draft.pathId))return null;
        const value=draft.pathMethod==='measure'?arraySpacing(event):inputNumber(event);
        if(!Number.isFinite(value))return null;
        const params={anchor:draft.pathAnchor,method:draft.pathMethod,value,align:draft.pathAlign};
        return editable(port.planPathArray(draft.ids,draft.arrayPath,params),{
          type:'path',...params,anchor:draft.pathAnchorIsDefault?null:params.anchor,
          guideId:draft.pathId,pick:draft.pathPick,reverse:draft.arrayPath.direction<0
        });
      }
      function inputNumber(e){if(e.type!=='text')return null;const n=Number(String(e.text).trim());return Number.isFinite(n)?n:null;}
      function copyPlan(point){
        if(!draft.base||!point)return null;
        const dx=point.x-draft.base.x,dy=point.y-draft.base.y;
        if(Math.hypot(dx,dy)<1e-8)return null;
        const count=draft.arrayCount||2,step=draft.arrayFit?1/(count-1):1;
        if(count*draft.ids.size>100000)return null;
        if(count===2)return port.planMatrix(draft.ids,root.cadTransformOperations.translate(dx,dy),{copy:true});
        const plans=Array.from({length:count-1},(_,i)=>port.planMatrix(draft.ids,root.cadTransformOperations.translate(dx*step*(i+1),dy*step*(i+1)),{copy:true}));
        if(plans.some(p=>!p||p.after.length!==p.before.length))return null;
        return {kind:'ARRAY',before:plans[0].before,after:plans.flatMap(p=>p.after),copy:true,copyGroupSize:plans[0].before.length,copyPlacements:plans.map(p=>p.matrix)};
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
        if(id==='AR'&&draft.phase==='arrayType')return[{id:'R',labelKey:'cadTransform.rectangular'},{id:'P',labelKey:'cadTransform.polar'},...(port.planPathArray?[{id:'PA',labelKey:'cadTransform.path'}]:[])];
        if(id==='AR'&&['polarAngle','polarStep'].includes(draft.phase))return [
          {id:'B',labelKey:'cadTransform.polarKeepOrientation',active:Boolean(draft.polarAnchor)},
          {id:'R',labelKey:'cadTransform.polarRotateItems',active:!draft.polarAnchor},
          draft.phase==='polarAngle'?{id:'I',labelKey:'cadTransform.polarInterval'}:{id:'F',labelKey:'cadTransform.polarFill'}
        ];
        if(id==='AR'&&draft.phase==='pathSpacing')return [
          {id:'D',labelKey:'cadTransform.pathDivide',active:draft.pathMethod==='divide'},
          {id:'M',labelKey:'cadTransform.pathMeasure',active:draft.pathMethod==='measure'},
          {id:'A',labelKey:'cadTransform.pathAlign',active:draft.pathAlign}
        ];
        if(id==='S'&&draft.phase==='select')return[{id:'C',labelKey:'cadEdit.crossing'},{id:'CP',labelKey:'cad87.crossingPolygon'}];
        if(['M','S'].includes(id)&&draft.phase==='base')return[{id:'D',labelKey:'cad96.stretch.displacement'}];
        if(['RO','SC'].includes(id)&&draft.phase==='target')return[{id:'R',labelKey:'cadTransform.reference'},{id:'C',labelKey:'tool.copy',active:draft.copy},...(id==='SC'&&draft.reference?[{id:'P',labelKey:'cad91.points'}]:[])];
        if(id!=='CO')return[];
        if(draft.phase==='base')return[{id:'D',labelKey:'cad96.stretch.displacement'},{id:'MO',labelKey:'cad91.copyMode'},{id:'M',labelKey:'cad91.multiple'}];
        if(draft.phase==='copyMode')return[{id:'S',labelKey:'cad91.single',active:draft.copyMode==='single'},{id:'M',labelKey:'cad91.multiple',active:draft.copyMode==='multiple'}];
        if(draft.phase==='target')return[{id:'A',labelKey:'tool.array'},...(draft.history.length?[{id:'U',labelKey:'cadEdit.undo'}]:[])];
        return draft.phase==='copyArrayTarget'?[{id:'F',labelKey:'cad91.fit',active:draft.arrayFit}]:[];
      }
      prompt();if(selected.length)port.select(draft.ids);if(['arrayType','columns'].includes(draft.phase))port.focus();
      return{view:()=>draft,describe:()=>({phase:draft.phase,pointBase:['base','axis1','axis2','target','source1','source2','target1','target2','window1','window2','displacement','reference','referenceEnd','copyArrayTarget','newLength1','newLength2','polarCenter','polarAnchor','pathAnchor','columnSpacing','rowSpacing','arrayCellCorner'].includes(draft.phase)?pointBase():undefined,...(id==='AR'&&['columnSpacing','rowSpacing','arrayCellCorner'].includes(draft.phase)?{input:['distance','point']}:{}),...(draft.phase==='displacement'?{input:['point']}:{}),count:draft.ids.size,actions:actions()}),preview(e){e={...e,type:e.type||'point'};if(!port.current(draft.token)){port.preview(null);return{ok:false,code:'stale-context'};}if(id==='MI'&&draft.phase==='eraseSource'){port.preview(draft.plan);return{ok:true};}draft.lastPoint=e.point||null;let plan=null;if(draft.phase==='displacement')plan=displacementPlan(e);else if(id==='AR'&&draft.phase==='pathSpacing')plan=pathPlan(e);else if(id==='AR'&&draft.phase==='arrayCellCorner')plan=arrayCellPlan(e);else if(id==='AR'&&draft.phase==='rowSpacing'&&e.type==='text'){const dy=arraySpacing(e);if(Number.isFinite(dy)&&(draft.rows===1||Math.abs(dy)>=1e-9))plan=rectangularPlan(draft.dx,dy);}else if(id==='AR'&&['polarAngle','polarStep'].includes(draft.phase)){const angle=e.type==='text'?angleNumber(e):e.type==='point'?polarDefault():NaN;plan=polarPlan(angle);}else if(id==='RO'&&draft.phase==='target')plan=rotationPlan(e);else if(id==='SC'&&draft.phase==='target')plan=scaleInputPlan(e);else if(id==='SC'&&draft.phase==='newLength2'&&draft.newLengthStart){const p=resolved(e);plan=p&&scalePlan(null,Math.hypot(p.x-draft.newLengthStart.x,p.y-draft.newLengthStart.y));}else if(id==='CO'&&['target','copyArrayTarget'].includes(draft.phase))plan=copyPlan(resolved(e));else if(['target','axis2'].includes(draft.phase))plan=planForPoint(resolved(e));else if(id==='S'&&draft.phase==='target')plan=planForPoint(resolved(e));draft.plan=plan;port.preview(plan);return{ok:true};},input(e){if(!port.current(draft.token)){port.preview(null);return{ok:false,code:'stale-context'};}
        const keyword=e.type==='keyword'?String(e.value).toUpperCase():e.type==='text'?String(e.text).trim().toUpperCase():'';
        if(id==='CO'&&draft.phase==='base'&&['M','MULTIPLE','MO','MODE','O'].includes(keyword)){if(['MO','MODE','O'].includes(keyword)){draft.phase='copyMode';prompt();return{ok:true};}draft.copyMode='multiple';draft.phase='base';prompt();return{ok:true};}
        if(id==='CO'&&draft.phase==='copyMode'){const mode=['S','SINGLE'].includes(keyword)?'single':['M','MULTIPLE'].includes(keyword)?'multiple':e.type==='enter'?draft.copyMode:null;if(!mode)return{ok:false,code:'invalid-keyword'};copyMode=mode;port.setCopyMode?.(mode);draft.copyMode=mode;draft.phase='base';prompt();return{ok:true};}
        if(id==='CO'&&draft.phase==='target'&&['A','ARRAY'].includes(keyword)){draft.phase='copyArrayCount';prompt();port.focus();return{ok:true};}
        if(id==='CO'&&draft.phase==='copyArrayCount'){const n=inputNumber(e);if(!Number.isInteger(n)||n<2||n>1000)return{ok:false,code:'invalid-number'};draft.arrayCount=n;draft.phase='copyArrayTarget';prompt();return{ok:true};}
        if(id==='CO'&&draft.phase==='copyArrayTarget'){if(['F','FIT'].includes(keyword)){draft.arrayFit=true;prompt();return{ok:true};}const p=resolved(e);return p?copyAt(p):{ok:false,code:'invalid-coordinate'};}
        if(['M','CO','S'].includes(id)&&e.type==='enter'&&draft.phase==='base'){if(id==='S'){draft.base=commandOrigin();draft.phase='target';}else draft.phase='displacement';prompt();return{ok:true};}
        if(['M','CO','S'].includes(id)&&e.type==='enter'&&draft.phase==='target'){if(id==='CO'&&draft.history.length){port.finish();return{ok:true};}const origin=commandOrigin(),point={x:draft.base.x*2-origin.x,y:draft.base.y*2-origin.y};if(id==='CO')return copyAt(point);const plan=planForPoint(point);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}
        if(id==='CO'&&['U','UNDO'].includes(keyword)){const mark=draft.history.at(-1);if(!mark||!port.undoOwn(mark))return{ok:false,code:'nothing-to-back'};draft.history.pop();draft.token=port.token();port.preview(null);prompt();return{ok:true};}
        if(['RO','SC'].includes(id)&&draft.base&&['C','COPY'].includes(keyword)){draft.copy=!draft.copy;prompt();return{ok:true};}
        if(['RO','SC'].includes(id)&&draft.base&&['R','REFERENCE'].includes(keyword)){draft.phase='reference';draft.reference=null;draft.refPoint=null;prompt();return{ok:true};}
        if(id==='SC'&&draft.reference&&draft.phase==='target'&&['P','POINTS'].includes(keyword)){draft.phase='newLength1';draft.newLengthStart=null;prompt();return{ok:true};}
        if(id==='SC'&&['newLength1','newLength2'].includes(draft.phase)){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(!draft.newLengthStart){draft.newLengthStart=p;draft.phase='newLength2';prompt();return{ok:true};}const n=Math.hypot(p.x-draft.newLengthStart.x,p.y-draft.newLengthStart.y),plan=scalePlan(null,n);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'invalid-number'};}
        if(['RO','SC'].includes(id)&&['reference','referenceEnd'].includes(draft.phase)){
          const n=e.type==='text'&&!/[,@<]/.test(e.text)?(id==='SC'?port.parseLength(e.text)?.mm:angleNumber(e)):null;
          if(Number.isFinite(n)){if(id==='SC'&&n<=0)return{ok:false,code:'invalid-number'};draft.reference=id==='RO'?absoluteAngle(n):n;draft.phase='target';prompt();return{ok:true};}
          const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(!draft.refPoint){draft.refPoint=p;draft.phase='referenceEnd';prompt();return{ok:true};}const dx=p.x-draft.refPoint.x,dy=p.y-draft.refPoint.y;if(Math.hypot(dx,dy)<1e-8)return{ok:false,code:'invalid-coordinate'};draft.reference=id==='RO'?Math.atan2(dy,dx)*180/Math.PI:Math.hypot(dx,dy);draft.phase='target';prompt();return{ok:true};
        }
        if(['M','CO','S'].includes(id)&&draft.phase==='base'&&['D','DISPLACEMENT'].includes(keyword)){draft.phase='displacement';prompt();return{ok:true};}
        if(['M','CO','S'].includes(id)&&draft.phase==='displacement'){const p=displacement(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(id==='CO'){draft.base=commandOrigin();return copyAt({x:draft.base.x+p.x,y:draft.base.y+p.y});}const plan=id==='S'?port.planStretch(draft.stretch,p):port.planMatrix(draft.ids,root.cadTransformOperations.translate(p.x,p.y));return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}
        if(draft.phase==='select'){
          if(id==='S'&&['C','CROSSING','CP','CPOLYGON'].includes(keyword)){if(['CP','CPOLYGON'].includes(keyword)){port.selectionShape?.('CP');return{ok:true};}draft.crossing=true;draft.phase='window1';prompt();return{ok:true};}
          if(e.type==='selection'){const ids=(e.ids||[]).filter(port.allowed);for(const objectId of ids){if(e.remove)draft.ids.delete(objectId);else draft.ids.add(objectId);}
            if(id==='S'){if(e.remove){draft.stretch.wholeIds=draft.stretch.wholeIds.filter(x=>!ids.includes(x));for(const r of draft.stretch.regions)r.ids=r.ids.filter(x=>!ids.includes(x));}else if(e.crossing&&e.points)draft.stretch.regions.push({ids,points:e.points.map(p=>({...p}))});else draft.stretch.wholeIds=[...new Set([...draft.stretch.wholeIds,...ids])];}
            port.select(draft.ids);prompt();return{ok:true};}
          if(e.type==='enter')return ensureSelection()?{ok:true}:{ok:false,code:'selection-required'};
          const o=pick(e);if(!o&&id==='S'){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};draft.rectStart=p;draft.crossing=null;draft.remove=Boolean(e.shift);draft.phase='window2';prompt();return{ok:true};}
          if(!o||!port.allowed(o.id))return{ok:false,code:'target-not-modifiable'};if(e.shift){draft.ids.delete(o.id);if(id==='S'){draft.stretch.wholeIds=draft.stretch.wholeIds.filter(x=>x!==o.id);for(const r of draft.stretch.regions)r.ids=r.ids.filter(x=>x!==o.id);}}else{draft.ids.add(o.id);if(id==='S'&&!draft.stretch.wholeIds.includes(o.id))draft.stretch.wholeIds.push(o.id);}port.select(draft.ids);prompt();return{ok:true};}

        if(id==='S'&&draft.phase==='window1'){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};draft.rectStart=p;draft.phase='window2';prompt();return{ok:true};}
        if(id==='S'&&draft.phase==='window2'){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};draft.rect=port.rect(draft.rectStart,p);const crossing=draft.crossing??(p.x<draft.rectStart.x),points=root.cadStretch.polygon(draft.rect),ids=port.stretchCandidates(draft.rect,{crossing});if(draft.remove){for(const x of ids)draft.ids.delete(x);draft.stretch.wholeIds=draft.stretch.wholeIds.filter(x=>!ids.includes(x));for(const r of draft.stretch.regions)r.ids=r.ids.filter(x=>!ids.includes(x));}else{for(const x of ids)draft.ids.add(x);if(crossing)draft.stretch.regions.push({ids,points});else draft.stretch.wholeIds=[...new Set([...draft.stretch.wholeIds,...ids])];}port.select(draft.ids);draft.phase='select';draft.rectStart=null;draft.remove=false;prompt();return{ok:true};}
        if(id==='AR'&&draft.phase==='arrayType'){
          if(port.planArrayRevision&&['AS','ASSOCIATIVE'].includes(keyword)){
            draft.editable=!draft.editable;prompt();return {ok:true};
          }
          if(port.planPathArray&&['PA','PATH'].includes(keyword)){
            draft.arrayType='path';draft.phase='pathGuide';prompt();return {ok:true};
          }
          if(!['text','keyword','enter'].includes(e.type))return{ok:false,code:'invalid-keyword'};
          const text=e.type==='enter'?'R':keyword;
          if(['R','RECT','RECTANGULAR',''].includes(text)){draft.arrayType='rectangular';draft.phase='columns';prompt();port.focus();return{ok:true};}
          if(['P','POLAR'].includes(text)){draft.arrayType='polar';draft.phase='polarCenter';prompt();return{ok:true};}
          const legacyColumns=Number(text);
          if(arrayCount(legacyColumns)){draft.arrayType='rectangular';draft.columns=legacyColumns;draft.phase='rows';prompt();port.focus();return{ok:true};}
          return{ok:false,code:'invalid-keyword'};
        }
        if(id==='AR'&&draft.phase==='pathGuide'){
          const owner=pick(e);
          if(!owner||draft.ids.has(owner.id)||!port.pathAllowed(owner.id))return {ok:false,code:'unsupported-geometry'};
          const path=root.cadTransformOperations.prepareArrayPath(owner,e.point);
          if(!path)return {ok:false,code:'unsupported-geometry'};
          draft.arrayPath=path;draft.pathId=owner.id;draft.pathMethod='divide';draft.pathAlign=false;
          draft.pathPick={x:e.point.x,y:e.point.y};
          draft.phase='pathAnchor';prompt();port.focus();
          return {ok:true};
        }
        if(id==='AR'&&draft.phase==='pathAnchor'){
          const point=e.type==='enter'?draft.arrayPath.start:resolved(e);
          if(!point)return {ok:false,code:'invalid-coordinate'};
          draft.pathAnchor={...point};draft.pathAnchorIsDefault=e.type==='enter';
          draft.phase='pathSpacing';prompt();port.focus();
          return {ok:true};
        }
        if(id==='AR'&&draft.phase==='pathSpacing'){
          if(['D','DIVIDE','M','MEASURE','A','ALIGN','R','REVERSE','B','BASE','BASEPOINT'].includes(keyword)){
            if(keyword==='A'||keyword==='ALIGN')draft.pathAlign=!draft.pathAlign;
            else if(keyword==='R'||keyword==='REVERSE'){
              draft.arrayPath=draft.arrayPath.reverse();
              if(draft.pathAnchorIsDefault)draft.pathAnchor={...draft.arrayPath.start};
            }else if(['B','BASE','BASEPOINT'].includes(keyword))draft.phase='pathAnchor';
            else draft.pathMethod=keyword==='M'||keyword==='MEASURE'?'measure':'divide';
            draft.plan=null;port.preview(null);prompt();port.focus();return {ok:true};
          }
          const plan=pathPlan(e);
          return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};
        }
        if(id==='AR'&&draft.phase==='polarCenter'){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};draft.center=p;draft.phase='polarItems';prompt();port.focus();return{ok:true};}
        if(id==='AR'&&['polarAngle','polarStep'].includes(draft.phase)&&['B','BASE','BASEPOINT','R','ROTATEITEMS','I','INTERVAL','F','FILL'].includes(keyword)){
          if(['I','INTERVAL','F','FILL'].includes(keyword)){
            draft.phase=['I','INTERVAL'].includes(keyword)?'polarStep':'polarAngle';
            draft.plan=polarPlan(polarDefault());port.preview(draft.plan);prompt();port.focus();
            return {ok:true};
          }
          if(['R','ROTATEITEMS'].includes(keyword)){
            draft.polarAnchor=null;draft.plan=polarPlan(polarDefault());port.preview(draft.plan);
          }else{
            draft.polarReturn=draft.phase;draft.phase='polarAnchor';draft.plan=null;port.preview(null);
          }
          prompt();port.focus();return {ok:true};
        }
        if(id==='AR'&&draft.phase==='polarAnchor'){
          const p=resolved(e);
          if(!p||Math.hypot(p.x-draft.center.x,p.y-draft.center.y)<=1e-7)return {ok:false,code:'invalid-coordinate'};
          draft.polarAnchor={...p};draft.phase=draft.polarReturn;draft.plan=polarPlan(polarDefault());
          port.preview(draft.plan);prompt();port.focus();return {ok:true};
        }
        if(id==='AL'&&draft.phase==='source2'&&e.type==='enter'){const matrix=root.cadTransformOperations.translate(draft.p3.x-draft.p1.x,draft.p3.y-draft.p1.y),plan=port.planMatrix(draft.ids,matrix);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}
        if(['base','axis1','source1','source2','target1','target2'].includes(draft.phase)){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(draft.phase==='base'){draft.base=p;draft.phase='target';if(id==='SC'||id==='RO')port.focus();}else if(draft.phase==='axis1'){draft.p1=p;draft.phase='axis2';}else if(draft.phase==='source1'){draft.p1=p;draft.phase='target1';}else if(draft.phase==='target1'){draft.p3=p;draft.phase='source2';}else if(draft.phase==='source2'){draft.p2=p;draft.phase='target2';}else if(draft.phase==='target2'){draft.p4=p;draft.phase='alignScale';port.focus();}prompt();return{ok:true};}
        if(id==='RO'&&draft.phase==='target'){const plan=rotationPlan(e);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:e.type==='text'&&!/[,@<#*]/.test(e.text)?'invalid-number':'invalid-coordinate'};}
        if(id==='SC'&&draft.phase==='target'){const plan=scaleInputPlan(e);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'invalid-number'};}
        if(id==='MI'&&draft.phase==='eraseSource'){
          const text=e.type==='enter'?'N':e.type==='text'?String(e.text).trim().toUpperCase():null;
          const erase=['Y','YES'].includes(text),keep=['N','NO',''].includes(text);
          if(!erase&&!keep)return{ok:false,code:'mirror-choice-required'};
          const matrix=root.cadTransformOperations.mirror(draft.p1,draft.p2),plan=matrix&&port.planMatrix(draft.ids,matrix,{copy:!erase});
          return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};
        }
        if(['target','axis2'].includes(draft.phase)){const p=resolved(e);if(!p)return{ok:false,code:'invalid-coordinate'};if(id==='CO')return copyAt(p);const plan=planForPoint(p);if(!plan)return{ok:false,code:'no-valid-result'};if(id==='MI'){draft.p2={...p};draft.plan=plan;draft.phase='eraseSource';port.preview(plan);prompt();port.focus();return{ok:true};}return{ok:true,commit:true,value:plan};}
        if(id==='AR'&&['columnSpacing','rowSpacing','arrayCellCorner'].includes(draft.phase)){
          if(draft.phase==='arrayCellCorner'){const plan=arrayCellPlan(e);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}
          if(e.type==='point'||e.type==='text'&&/[,<@#*]/.test(e.text||'')){const p=resolved(e);if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return{ok:false,code:'invalid-coordinate'};draft.cellFirst={...p};draft.phase='arrayCellCorner';draft.plan=null;port.preview(null);prompt();port.focus();return{ok:true};}
          const n=arraySpacing(e),count=draft.phase==='columnSpacing'?draft.columns:draft.rows;if(!Number.isFinite(n)||count>1&&Math.abs(n)<1e-9)return{ok:false,code:'invalid-number'};
          if(draft.phase==='columnSpacing'){draft.dx=n;draft.phase='rowSpacing';prompt();port.focus();return{ok:true};}
          const plan=rectangularPlan(draft.dx,n);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};
        }
        if(id==='AR'){const angular=['polarAngle','polarStep'].includes(draft.phase),n=angular?(e.type==='enter'?polarDefault():angleNumber(e)):inputNumber(e);if(!Number.isFinite(n))return{ok:false,code:'invalid-number'};if(draft.phase==='columns'){if(!arrayCount(n))return{ok:false,code:'invalid-number'};draft.columns=n;draft.phase='rows';}else if(draft.phase==='rows'){if(!arrayCount(n)||n===1&&draft.columns===1)return{ok:false,code:'invalid-number'};draft.rows=n;draft.phase='columnSpacing';}else if(draft.phase==='columnSpacing'){draft.dx=n;draft.phase='rowSpacing';}else if(draft.phase==='rowSpacing'){draft.dy=n;const plan=rectangularPlan(draft.dx,draft.dy);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}else if(draft.phase==='polarItems'){if(!arrayCount(n,2))return{ok:false,code:'invalid-number'};draft.items=n;draft.phase='polarAngle';}else if(angular){draft.fillAngle=n;if(Math.abs(n)<1e-9)return{ok:false,code:'invalid-number'};const plan=polarPlan(n);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}else return{ok:false,code:'input-not-supported'};prompt();port.focus();return{ok:true};}
        if(id==='AL'&&draft.phase==='alignScale'){const text=e.type==='enter'?'N':String(e.text||'').trim().toUpperCase(),yes=['Y','YES','1','TRUE'].includes(text),no=['N','NO','0','FALSE',''].includes(text);if(!yes&&!no)return{ok:false,code:'invalid-keyword'};const m=root.cadTransformOperations.align(draft.p1,draft.p2,draft.p3,draft.p4,{scale:yes}),plan=m&&port.planMatrix(draft.ids,m);return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};}
        return{ok:false,code:'input-not-supported'};
      },commit(plan){if(!port.current(draft.token))throw Error('stale-context');return port.commit(id,plan);},cancel:()=>port.clear(),finalize:()=>port.clear()};
    }});
    if(port.planArrayRevision)installArrayEdit(registry,port,cad);
  }
  function installArrayEdit(registry,port,cad){
    const fields={rectangular:{C:'columns',R:'rows',X:'dx',Y:'dy'},polar:{N:'items',F:'angle',I:'spacing'},path:{D:'divide',M:'measure'}};
    registry.register({id:'ARRAYEDIT',available:cad,transactional:false,historyOwner:'cad-change-set',create(){
      const token=port.token(),originalSelection=port.preselected(),draft={phase:'arrayEditPick',target:null,recipe:null,field:null,itemIds:new Set()};
      function prompt(){port.prompt('ARRAYEDIT',draft.phase,0,draft);if(draft.target)port.focus();}
      function select(ids){
        const targets=new Map();
        for(const id of ids){const key=port.arrayKey(id);if(key)targets.set(key,id);}
        if(targets.size!==1)return false;
        const group=port.arrayMembers(targets.values().next().value);
        if(!group.length)return false;
        draft.group=new Map(group.map(o=>[o.id,o.array104.slot]));
        draft.cells=new Map();
        for(const o of group){const slot=o.array104.slot;if(!draft.cells.has(slot))draft.cells.set(slot,[]);draft.cells.get(slot).push(o.id);}
        draft.itemIds=new Set(ids.filter(id=>draft.group.has(id)).flatMap(id=>draft.cells.get(draft.group.get(id))));
        draft.target=group[0].id;draft.originalRecipe=group[0].array104.recipe;draft.recipe={...draft.originalRecipe};draft.phase='arrayEditOption';
        port.select(group.map(o=>o.id));return true;
      }
      select(originalSelection);prompt();
      function revision(recipe=draft.recipe,options){return port.planArrayRevision(draft.target,recipe,options);}
      const itemOptions=()=>({action:draft.itemAction,items:[...draft.itemIds],replacement:draft.replacement});
      function replacementPoint(event){
        if(event.point&&(!event.type||event.type==='point'))return port.resolve(event.point,null);
        const q=event.type==='text'?port.parsePoint(event.text,{base:null}):null;
        return q?.ok?q.point:null;
      }
      function nextRecipe(event){
        if(event.type!=='text')return null;
        const field=draft.field,recipe={...draft.recipe};
        let value;
        if(['dx','dy','measure'].includes(field)){const q=port.parseLength(event.text);value=q?.ok?q.mm:NaN;}
        else if(['angle','spacing'].includes(field)){
          const q=root.cadUnits.parseAngle(event.text);value=q?.ok?q.degrees*recipe.handedness:NaN;
          if(field==='angle')delete recipe.spacing;else delete recipe.angle;
        }else value=Number(String(event.text).trim());
        if(!Number.isFinite(value))return null;
        if(['divide','measure'].includes(field)){recipe.method=field;recipe.value=value;}else recipe[field]=value;
        return recipe;
      }
      return {view:()=>draft,describe:()=>({phase:draft.phase,...(['arrayReplaceBase','arrayReplaceTarget'].includes(draft.phase)?{pointBase:null}:{})}),
        preview(event){
          if(draft.phase==='arrayEditItems'){
            port.preview(port.current(token)?revision(draft.recipe,itemOptions()):null);
            return {ok:true};
          }
          if(draft.phase.startsWith('arrayReplace')){
            const point=draft.phase==='arrayReplaceTarget'&&replacementPoint(event);
            const options={...itemOptions(),replacement:{...draft.replacement,target:point}};
            port.preview(point&&port.current(token)?revision(draft.recipe,options):null);return {ok:true};
          }
          const recipe=draft.phase==='arrayEditValue'?nextRecipe(event):draft.recipe;
          port.preview(port.current(token)&&draft.target&&recipe?revision(recipe):null);return {ok:true};
        },
        input(event){
          if(!port.current(token))return {ok:false,code:'stale-context'};
          if(!draft.target){
            const id=event.type==='point'?port.pick(event.point)?.id:null;
            const ids=event.type==='selection'?event.ids:id?[id]:[];
            if(!select(ids||[]))return {ok:false,code:'selection-required'};
            prompt();return {ok:true};
          }
          if(draft.phase==='arrayReplaceObjects'){
            if(event.type==='enter'){
              if(!draft.replaceIds.size)return {ok:false,code:'selection-required'};
              draft.replacement={ids:[...draft.replaceIds]};draft.phase='arrayReplaceBase';prompt();return {ok:true};
            }
            const ids=event.type==='selection'?(event.ids||[]):event.type==='point'?[port.pick(event.point)?.id]:[];
            const eligible=ids.filter(id=>!draft.group.has(id)&&port.allowed(id));
            if(!eligible.length)return {ok:false,code:'selection-required'};
            for(const id of eligible){if(event.remove||event.shift)draft.replaceIds.delete(id);else draft.replaceIds.add(id);}
            port.select([...draft.replaceIds]);prompt();return {ok:true};
          }
          if(['arrayReplaceBase','arrayReplaceTarget'].includes(draft.phase)){
            const point=replacementPoint(event);
            if(!point)return {ok:false,code:'invalid-coordinate'};
            if(draft.phase==='arrayReplaceBase'){
              draft.replacement.base=point;draft.phase='arrayReplaceTarget';prompt();return {ok:true};
            }
            const options={...itemOptions(),replacement:{...draft.replacement,target:point}},plan=revision(draft.recipe,options);
            if(!plan)return {ok:false,code:'no-valid-result'};
            draft.replacement.target=point;draft.phase='arrayEditItems';port.select([...draft.itemIds]);port.preview(plan);prompt();return {ok:true};
          }
          if(draft.phase==='arrayEditItems'){
            if(event.type==='enter'){
              const plan=revision(draft.recipe,itemOptions());
              return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};
            }
            const ids=event.type==='selection'?(event.ids||[]):event.type==='point'?[port.pick(event.point)?.id]:[];
            const matched=ids.filter(id=>draft.group.has(id));
            if(!matched.length)return {ok:false,code:'selection-required'};
            for(const id of matched)for(const ownerId of draft.cells.get(draft.group.get(id))){
              if(event.remove||event.shift)draft.itemIds.delete(ownerId);else draft.itemIds.add(ownerId);
            }
            const plan=revision(draft.recipe,itemOptions());
            port.select([...draft.itemIds]);port.preview(plan);prompt();return {ok:true};
          }
          if(draft.phase==='arrayEditValue'){
            const recipe=nextRecipe(event),plan=recipe&&revision(recipe);
            if(!plan){port.preview(null);return {ok:false,code:'no-valid-result'};}
            draft.recipe=recipe;draft.phase='arrayEditOption';port.preview(plan);prompt();return {ok:true};
          }
          const key=String(event.value??event.text??'').trim().toUpperCase();
          if(key==='REPLACE'){
            if(JSON.stringify(draft.recipe)!==JSON.stringify(draft.originalRecipe))return {ok:false,code:'array-pending-values'};
            draft.itemAction='replace';draft.replaceIds=new Set();draft.phase='arrayReplaceObjects';
            port.select([]);port.preview(null);prompt();return {ok:true};
          }
          if(['RESET','SEPARATE','REMOVE'].includes(key)){
            if(JSON.stringify(draft.recipe)!==JSON.stringify(draft.originalRecipe))return {ok:false,code:'array-pending-values'};
            draft.itemAction=key.toLowerCase();draft.phase='arrayEditItems';
            port.select([...draft.itemIds]);port.preview(revision(draft.recipe,itemOptions()));
            prompt();return {ok:true};
          }
          if(key==='RESTORE'){
            const recipe={...draft.recipe};delete recipe.excluded;
            const plan=revision(recipe);
            if(!plan)return {ok:false,code:'no-valid-result'};
            draft.recipe=recipe;port.preview(plan);prompt();return {ok:true};
          }
          if(key==='S'||key==='SOURCE'){
            if(JSON.stringify(draft.recipe)!==JSON.stringify(draft.originalRecipe))return {ok:false,code:'array-pending-values'};
            const sources=port.arraySources(draft.target);
            if(!sources.length)return {ok:false,code:'selection-required'};
            port.finish();port.select(sources.map(o=>o.id));return {ok:true};
          }
          if(key==='U'||key==='UNGROUP'||event.type==='enter'){
            const plan=revision(draft.recipe,{detach:key==='U'||key==='UNGROUP'});
            return plan?{ok:true,commit:true,value:plan}:{ok:false,code:'no-valid-result'};
          }
          if(draft.recipe.type==='path'&&['A','R'].includes(key)){
            const field=key==='A'?'align':'reverse',recipe={...draft.recipe,[field]:!draft.recipe[field]},plan=revision(recipe);
            if(!plan)return {ok:false,code:'no-valid-result'};
            draft.recipe=recipe;port.preview(plan);prompt();return {ok:true};
          }
          const field=fields[draft.recipe.type][key];
          if(!field)return {ok:false,code:'invalid-keyword'};
          draft.field=field;draft.phase='arrayEditValue';prompt();return {ok:true};
        },
        commit(plan){if(!port.current(token))throw Error('stale-context');return port.commit('ARRAYEDIT',plan);},
        cancel(){if(draft.target&&port.current(token))port.select(originalSelection.filter(port.allowed));port.clear();},finalize:()=>port.clear()};
    }});
  }
  const aliasMap=new Map([['M','M'],['MOVE','M'],['CO','CO'],['COPY','CO'],['RO','RO'],['ROTATE','RO'],['MI','MI'],['MIRROR','MI'],['SC','SC'],['SCALE','SC'],['S','S'],['STRETCH','S'],['AR','AR'],['ARRAY','AR'],['AL','AL'],['ALIGN','AL']]);
  function keyword(id,phase,key){
    if(id==='AR'&&phase==='arrayType'&&['R','RECT','RECTANGULAR','P','POLAR','PA','PATH','AS','ASSOCIATIVE'].includes(key))return true;
    if(id==='ARRAYEDIT'&&phase==='arrayEditOption'&&['A','C','D','F','I','M','N','R','S','SOURCE','U','UNGROUP','X','Y','RESET','SEPARATE','REMOVE','RESTORE','REPLACE'].includes(key))return true;
    if(id==='AR'&&phase==='pathSpacing'&&['D','DIVIDE','M','MEASURE','A','ALIGN','R','REVERSE','B','BASE','BASEPOINT'].includes(key))return true;
    if(id==='AR'&&['polarAngle','polarStep'].includes(phase)&&['B','BASE','BASEPOINT','R','ROTATEITEMS','I','INTERVAL','F','FILL'].includes(key))return true;
    if(id==='S'&&phase==='select'&&['C','CROSSING','CP','CPOLYGON'].includes(key))return true;
    if(['M','CO','S'].includes(id)&&phase==='base'&&['D','DISPLACEMENT'].includes(key))return true;
    if(['RO','SC'].includes(id)&&['target','reference','referenceEnd'].includes(phase)&&['R','REFERENCE','C','COPY'].includes(key))return true;
    if(id==='CO')return (phase==='base'&&['MO','MODE','O','M','MULTIPLE'].includes(key))||(phase==='copyMode'&&['S','SINGLE','M','MULTIPLE'].includes(key))||(phase==='target'&&['A','ARRAY','U','UNDO'].includes(key))||(phase==='copyArrayTarget'&&['F','FIT'].includes(key));
    return id==='SC'&&phase==='target'&&['P','POINTS'].includes(key);
  }
  root.nativeTransformCommands=Object.freeze({install,ids,keyword,resolve:raw=>aliasMap.get(String(raw||'').trim().toUpperCase())||null});
})();
