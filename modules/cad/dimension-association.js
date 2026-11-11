/* PPRJ geometry relations and bounded, ownership-checked native DIMASSOC exchange. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {}, capability = 'cad.dimension.association.v1';
  const pointCapability='cad.dimension.point-source.v1',pointKeys=['point','insertion'];
  const pointSourcesRequired=(objects,archive=null)=>archive?.dimensionAssociations104?.pointSources===true||objects.some(o=>Object.values({...o.association?.anchors,...o.association?.lost}).some(a=>a.kind==='point'&&pointKeys.includes(a.key)));
  const clone = o => JSON.parse(JSON.stringify(o)), distance = (a, b) => a && b ? Math.hypot(a.x - b.x, a.y - b.y) : Infinity;
  function validate(o) {
    if(root.cadAngularAssociation?.grouped(o))return root.cadAngularAssociation.validate(o);
    const r = o.association; if (!r) return;
    const slots = ['jogged','arc','feature','p1', 'p2', 'vertex', 'ray1', 'ray2', 'radial'];if(r.version===2){if(o.type!=='cadDimension'||!root.cadDimensionPartial)throw Error('invalid-partial-dimension-association');root.cadDimensionPartial.validate(o);}
    if (r.version!==2&&(o.type !== 'cadDimension' || r.version !== 1 || !['current', 'detached'].includes(r.status) || Object.keys(r).some(k => !['version', 'status', 'anchors'].includes(k)) || !r.anchors || typeof r.anchors !== 'object' || Array.isArray(r.anchors) || !Object.keys(r.anchors).length)) throw Error('invalid-dimension-association');
    for (const [slot, a] of Object.entries({...r.anchors,...(r.version===2?r.lost:{})})) {
      if (slot==='arc'&&o.kind!=='arcLength'||slot==='feature'&&o.kind!=='ordinate'||!slots.includes(slot) || !a || typeof a.sourceId !== 'string' || !a.sourceId || a.sourceId === o.id || (slot === 'radial') !== (a.kind === 'radial') || slot === 'radial' && !['radius', 'diameter'].includes(o.kind) || ['p1', 'p2'].includes(slot) && !['linear', 'aligned'].includes(o.kind || 'aligned') || ['vertex', 'ray1', 'ray2'].includes(slot) && o.kind !== 'angular') throw Error('invalid-dimension-anchor');
      if(root.cadRadialPlacement?.extended(a)){if(r.version!==2||!o.radialOptions99||slot!=='radial')throw Error('invalid-radial-source-owner');root.cadRadialPlacement.validateOwner(o);root.cadRadialPlacement.validateAnchor(a);continue;}if(slot==='jogged'){if(r.version!==2||o.kind!=='joggedRadius'||!root.cadJoggedRadius)throw Error('invalid-jogged-anchor');root.cadJoggedRadius.validateAnchor(a);continue;}if(slot==='arc'){if(!root.cadArcLength||a.kind!=='arc96')throw Error('invalid-arc-dimension-anchor');root.cadArcLength.validateAnchor(a);continue;}if(a.kind==='geometry96'){if(!root.cadDimensionReferences)throw Error('unsupported-dimension-subedge');root.cadDimensionReferences.validate(a);continue;}
      if(a.kind==='angularPoint99'){if(r.version!==2||o.kind!=='angular'||o.angularPlacement98?.method!=='points')throw Error('invalid-angular-point-owner');root.cadAngularSource.validatePoint(a);if(root.cadAngularSource.pointDependencies(a).includes(o.id))throw Error('invalid-angular-point-self-reference');continue;}
      if(!['vertex','point','radial'].includes(a.kind)||Object.keys(a).some(k=>!['sourceId','kind','vertexId','key'].includes(k))||a.kind==='vertex'&&(typeof a.vertexId!=='string'||!a.vertexId)||a.kind==='point'&&!['a','b','start','end','center','midpoint',...pointKeys].includes(a.key))throw Error('invalid-dimension-anchor');
    }
  }

  function resolve(anchor, byId) {
    if(root.cadRadialPlacement?.extended(anchor))return root.cadRadialPlacement.resolve(anchor,byId);
    if(anchor.kind==='angularPoint99')return root.cadAngularSource.pointValue(anchor,byId);
    if(anchor.kind==='angular98')return root.cadAngularSource.value(anchor,byId);
    if(anchor.kind==='jogged98')return root.cadJoggedRadius?.resolve(anchor,byId)||null;
    if(anchor.kind==='arc96')return root.cadArcLength?.resolve(anchor,byId)||null;
    if(anchor.kind==='geometry96')return root.cadDimensionReferences?.resolve(anchor,byId)||null;
    const o = byId(anchor.sourceId); if (!o || o.readonly || o.floorId || o.planRole || !['cadLine', 'cadArc', 'cadCircle', 'cadEllipse', 'cadPolyline','cadPoint','cadInsert'].includes(o.type)) return null;
    if (anchor.kind === 'radial') return ['cadCircle', 'cadArc'].includes(o.type) ? { center: { ...o.center }, radius: o.radius } : null;
    if (anchor.kind === 'vertex') { if (!root.cadPolyline.is(o)) return null; const v = o.vertices.find(v => v.id === anchor.vertexId); if (!v || o.curveFit && (o.closed || v !== o.vertices[0] && v !== o.vertices.at(-1))) return null; return { point: { x: v.x, y: v.y } }; }
    const key = anchor.key;
    if(key==='point')return o.type==='cadPoint'&&Number.isFinite(o.point?.x)&&Number.isFinite(o.point?.y)?{point:{...o.point}}:null;
    if(key==='insertion')return o.type==='cadInsert'&&root.cadBlocks.matrixValid(o.matrix)?{point:{x:o.matrix.tx,y:o.matrix.ty}}:null;
    if (key === 'center') return o.center ? { point: { ...o.center } } : null;
    if (o.type === 'cadLine') return { point: key === 'midpoint' ? { x: (o.a.x + o.b.x) / 2, y: (o.a.y + o.b.y) / 2 } : key === 'a' || key === 'b' ? { ...o[key] } : null };
    if (o.type === 'cadArc' && ['start', 'end', 'midpoint'].includes(key)) return { point: root.geometryQuery.pointAt(o, o.startAngle + o.sweep * (key === 'start' ? 0 : key === 'end' ? 1 : .5)) };
    if (root.cadEllipse.is(o) && !root.cadEllipse.full(o) && ['start', 'end'].includes(key)) return { point: root.cadEllipse.at(o, key === 'start' ? 0 : 1) };
    return null;
  }
  function capture(point, snap, byId) {
    if (!snap?.objectId) return null;
    const o = byId(snap.objectId); if (!o || o.floorId || o.planRole || o.readonly) return null;
    if(snap.kind==='node'&&o.type==='cadPoint'||snap.kind==='insertion'&&o.type==='cadInsert'){
      if(snap.subentityId&&snap.subentityId!==o.id)return null;
      const a={sourceId:o.id,kind:'point',key:o.type==='cadPoint'?'point':'insertion'};
      return distance(resolve(a,byId)?.point,point)<1e-6?a:null;
    }
    const anchors = [];
    if(['endpoint','midpoint','center'].includes(snap.kind)){
      if (root.cadPolyline.is(o)) {if(snap.kind==='endpoint')for(const v of o.vertices)if(!snap.vertexId||v.id===snap.vertexId)anchors.push({sourceId:o.id,kind:'vertex',vertexId:v.id});}
      else for (const key of ['a', 'b', 'start', 'end', 'center', 'midpoint']) anchors.push({ sourceId: o.id, kind: 'point', key });
      const legacy=anchors.find(a => distance(resolve(a, byId)?.point, point) < 1e-6);if(legacy)return legacy;
    }
    return root.cadDimensionReferences?.capture(point,snap,byId)||null;
  }

  function detached(o) {if(o.association?.version===2)return root.cadDimensionPartial.release(o,Object.keys(o.association.anchors));return o.association ? { ...o, association: { ...clone(o.association), status: 'detached' } } : o; }
  function copiedWitnessMatches(o,slot,value) {
    if(!value)return false;
    if(slot==='angularSource')return Object.entries(value).every(([field,p])=>distance(p,o[field])<1e-6);
    if(!['radial','arc','jogged'].includes(slot))return distance(value.point,o[slot])<1e-6;
    const source=slot==='arc'?value.arc:value;
    if(!(distance(source.center,o.center)<1e-6&&Math.abs(source.radius-o.radius)<1e-6))return false;
    const span=slot==='arc'?source:source.sourceArc;
    const owner=slot==='arc'?o:slot==='jogged'?o.sourceArc:o.radialOptions99?.sourceArc;
    if(!span)return slot!=='jogged'||!owner;
    if(!owner)return false;
    const angle=((owner.startAngle-span.startAngle)%360+540)%360-180;
    return Math.abs(angle)<1e-7&&Math.abs(owner.sweep-span.sweep)<1e-7;
  }
  function copiedReference(a,{before,after}) {
    const P=root.cadPolyline,anchor={...a,sourceId:after.id};
    const vertex=id=>after.vertices?.[before.vertices?.findIndex(v=>v.id===id)]?.id;
    if(a.kind==='vertex'){
      anchor.vertexId=vertex(a.vertexId);
      if(!anchor.vertexId)return null;
    }
    if(a.edgeId){
      if(!P.is(before)||!P.is(after))return null;
      const index=P.get(before).edges.findIndex(e=>e.edgeId===a.edgeId),edge=P.get(after).edges[index];
      if(!edge)return null;
      anchor.edgeId=edge.edgeId;
      if(a.topology){
        anchor.topology=root.cadDimensionReferences.topology(after);
        if(!anchor.topology)return null;
      }
      if(a.direction){
        anchor.direction=a.direction.map(vertex);
        if(anchor.direction.some(id=>!id))return null;
      }
    }
    return anchor;
  }
  function copiedAngular(a,slot,copy,sourceCopy) {
    const S=root.cadAngularSource,group=a.kind==='angular98'?a:a.source,owners=new Map();
    const remap=ref=>{
      const pair=sourceCopy(ref.sourceId);
      if(!pair)return null;
      owners.set(pair.after.id,pair.after);
      return copiedReference(ref,pair);
    };
    const first=remap(group.first),second=group.second&&remap(group.second);
    if(!first||group.second&&!second)return null;
    const byId=id=>owners.get(id);
    let next={...group,first,...(second?{second}:{}),sourceId:first.sourceId};
    if(group.method==='circle'&&(a.kind==='angular98'||a.field==='ray1')){
      const point=copy[slot==='angularSource'?'ray1':slot],center=byId(first.sourceId).center;
      if(!point||!center)return null;
      const ray1=a.opposite?{x:2*center.x-point.x,y:2*center.y-point.y}:point;
      next=S.explicitCircle(next,{ray1},byId);
      if(!next)return null;
    }
    return {anchor:a.kind==='angular98'?next:{...a,sourceId:next.sourceId,source:next},byId};
  }
  function restoreCopied(original,copy,sourceCopy) {
    const r=original?.association;
    if(!r||r.status==='detached')return copy;
    const angular=root.cadAngularAssociation,grouped=angular?.grouped(copy),anchors={};
    const beforeById=id=>sourceCopy(id)?.before;
    for(const [slot,a] of Object.entries(r.anchors)){
      if(!copiedWitnessMatches(original,slot,resolve(a,beforeById)))continue;
      let anchor,byId;
      if(a.kind==='angular98'||a.kind==='angularPoint99'){
        const mapped=copiedAngular(a,slot,copy,sourceCopy);
        if(!mapped)continue;
        ({anchor,byId}=mapped);
      }else{
        const pair=sourceCopy(a.sourceId);
        if(!pair)continue;
        anchor=copiedReference(a,pair);
        if(!anchor)continue;
        byId=id=>id===pair.after.id?pair.after:null;
        if(a.kind==='geometry96'&&['quadrant','parameter'].includes(a.feature)
            &&!copiedWitnessMatches(copy,slot,resolve(anchor,byId))){
          const {sourceId,edgeId}=anchor,point=copy[slot],snap={objectId:sourceId,edgeId};
          const references=root.cadDimensionReferences;
          // World quadrants and circle parameters may rotate even when the circle itself is unchanged.
          anchor=(a.feature==='quadrant'&&references.capture(point,{...snap,kind:'quadrant'},byId))
            ||references.capture(point,{...snap,kind:'nearest'},byId);
        }
      }
      if(!anchor||!copiedWitnessMatches(copy,slot,resolve(anchor,byId)))continue;
      anchors[slot]=anchor;
    }
    const slots=Object.keys(anchors);
    if(!slots.length)return copy;
    if(r.version===1)return slots.length===Object.keys(r.anchors).length?{...copy,association:{...r,anchors}}:copy;
    const lost={...copy.association?.lost};
    for(const slot of slots)delete lost[slot];
    const association=grouped?angular.relation(copy,anchors,lost):root.cadDimensionPartial.relation(copy,anchors,lost);
    return {...copy,association};
  }
  function regenerate(o, byId) {
    if(o.association?.version===2)return root.cadDimensionPartial.regenerate(o,byId);
    if (o.association?.status !== 'current') return o;
    let q = clone(o);
    for (const [slot, anchor] of Object.entries(o.association.anchors)) {
      const value = resolve(anchor, byId); if (!value || slot !== 'radial' && slot!=='arc' && !value.point) return detached(o);
      if(slot==='arc')Object.assign(q,value.arc);else if (slot === 'radial') Object.assign(q,q.radialOptions99?root.cadRadialPlacement.merge(q,value):value); else q[slot] = value.point;
    }
    const g = root.cadAnnotation2.geometry(q); if (!g?.segments?.length) return detached(o);
    q.segments = g.segments; if (JSON.stringify(q) === JSON.stringify(o)) return o;
    delete q.dxfPresentation; return q;
  }
  function augment(objects, changes, {defer=()=>false}={}) {
    const touched = new Map(changes.map(c => [(c.before || c.after).id, c])), next = new Map(objects.map(o => [o.id, o]));
    const indexes=new Map(changes.map((c,i)=>[(c.before||c.after).id,i]));
    let positions=null;
    for (const c of changes) { if (c.before) next.delete(c.before.id); if (c.after) next.set(c.after.id, c.after); }
    const result = changes.slice();
    // Only new, explicitly transformed selected-circle dimensions reparameterize their
    // jointly edited source. Legacy owners and source-only edits keep existing rules.
    for(let i=0;i<result.length;i++){const c=result[i],o=c.after;if(!o?.linearOptions99?.circleSource)continue;const after=root.cadLinearPlacement.circleTransform(o,touched,id=>next.get(id));if(after!==o){const adjusted={...c,after};result[i]=adjusted;touched.set(o.id,adjusted);next.set(o.id,after);}}
    for (const o of next.values()) {
      if (root.cadAngularAssociation?.grouped(o)||o.type !== 'cadDimension' || (o.association?.status !== 'current'&&o.association?.version!==2) || defer(o) && !touched.has(o.id)) continue;
      const explicit = touched.get(o.id), sourceTouched = sourceIds(o).some(id=>touched.has(id));
      let after = o;
      if (explicit && !sourceTouched) {
        const proposed = regenerate(o, id => next.get(id)), fields = Object.keys(o.association.anchors).flatMap(slot => slot==='jogged'?['center','radius','sourceArc']:slot==='arc'?['center','radius','startAngle','sweep']:slot === 'radial' ? ['center', 'radius'] : [slot]);
        if(o.association.version===2){const released=Object.entries(o.association.anchors).filter(([slot,a])=>{const v=resolve(a,id=>next.get(id));return v&&(slot==='jogged'?['center','radius','sourceArc'].some(k=>JSON.stringify(o[k])!==JSON.stringify(v[k])):slot==='arc'?['center','radius','startAngle','sweep'].some(k=>JSON.stringify(o[k])!==JSON.stringify(v.arc[k])):slot==='radial'?['center','radius'].some(k=>JSON.stringify(o[k])!==JSON.stringify(v[k])):JSON.stringify(o[slot])!==JSON.stringify(v.point));}).map(([slot])=>slot);after=root.cadDimensionPartial.regenerate(released.length?root.cadDimensionPartial.release(o,released):o,id=>next.get(id));}else if (fields.some(key => JSON.stringify(o[key]) !== JSON.stringify(proposed[key]))) after = detached(o);
      } else if (sourceTouched) after = regenerate(o, id => next.get(id));
      if (after === o) continue;
      if (explicit) result[indexes.get(o.id)] = { ...explicit, after };
      else {
        positions??=new Map(objects.map((owner,index)=>[owner.id,index]));
        result.push({ before: o, after, index: positions.get(o.id) });
      }
    }
    return root.cadAngularAssociation?root.cadAngularAssociation.augment(objects,result,{defer}):result;
  }
  const dependencies=a=>a.kind==='angularPoint99'?root.cadAngularSource.pointDependencies(a):a.kind==='angular98'?root.cadAngularSource.dependencies(a):[a.sourceId],sourceIds=(o,{lost=false}={})=>[...new Set(Object.values({...o.association?.anchors,...(lost?o.association?.lost:{})}).flatMap(dependencies))];
  const nativeDxf=(()=>{
    const nativeCapability='cad.dimension.native-association.v1',nearestCapability='cad.dimension.native-nearest.v1',key=v=>String(v??'').toUpperCase(),hex=v=>typeof v==='string'&&/^[0-9A-F]+$/i.test(v);
    function curveParameter(source,p){
      const tau=2*Math.PI,norm=t=>(t%tau+tau)%tau;let angle,start,sweep;
      if(source?.type==='cadCircle')return norm(Math.atan2(p.y-source.center.y,p.x-source.center.x));
      if(source?.type==='cadArc'){angle=Math.atan2(p.y-source.center.y,p.x-source.center.x);start=norm((source.startAngle+(source.sweep<0?source.sweep:0))*Math.PI/180);sweep=Math.abs(source.sweep)*Math.PI/180;}
      else if(source?.type==='cadEllipse'){angle=root.cadEllipse.parameter(source,p);start=root.cadEllipse.full(source)?0:norm(source.startParam+(source.sweepParam<0?source.sweepParam:0));sweep=Math.abs(source.sweepParam);}
      else return null;
      const value=start+norm(angle-start);return value<=start+sweep+1e-9?value:null;
    }
    const get=(r,c,d=null)=>r.find(p=>p[0]===c)?.[1]??d;
    function one(r,c,d=undefined){const q=r.filter(p=>p[0]===c);if(q.length>1)throw Error('ambiguous-native-dimension-field');return q.length?q[0][1]:d;}
    function owner(r){let depth=0;for(const[c,v]of r){if(c===102)depth+=String(v).startsWith('{')?1:v==='}'?-1:0;else if(c===330&&!depth)return key(v);}return null;}
    function extension(r){let active=false;const ids=[];for(const[c,v]of r){if(c===102)active=v==='{ACAD_XDICTIONARY';else if(c===360&&active)ids.push(key(v));}if(ids.length>1)throw Error('ambiguous-native-dimension-dictionary');return ids[0]||null;}
    function index(records){const map=new Map();for(const r of records){const h=key(get(r,5));if(!h)continue;map.set(h,map.has(h)?null:r);}return map;}
    function dictionaryEntry(dict){const hits=[];for(let i=0;i<dict.length;i++)if(dict[i][0]===3&&key(dict[i][1])==='ACAD_DIMASSOC'){
      if(![350,360].includes(dict[i+1]?.[0]))throw Error('invalid-native-dimension-entry');hits.push({at:i,handle:key(dict[i+1][1])});
    }if(hits.length>1)throw Error('ambiguous-native-dimension-entry');return hits[0]||null;}
    function owned(map,dimension,dictHandle,assocHandle){
      const dict=map.get(key(dictHandle)),record=map.get(key(assocHandle)),at=record?.findIndex(p=>p[0]===100&&p[1]==='AcDbDimAssoc')??-1;
      if(!dict||get(dict,0)!=='DICTIONARY'||owner(dict)!==key(dimension)||!record||get(record,0)!=='DIMASSOC'||at<0
          ||owner(record.slice(0,at))!==key(dictHandle)||key(one(record.slice(at+1).filter(p=>p[0]!==1),330))!==key(dimension)
          ||dictionaryEntry(dict)?.handle!==key(assocHandle))throw Error('invalid-native-dimension-owner');
      return {dict,record,at};
    }
    function packet(record,at){
      const body=record.slice(at+1),numeric=(r,c,d)=>{
        const v=one(r,c,d);if(v===undefined||typeof v==='string'&&!v.trim()||!Number.isFinite(Number(v)))throw Error('invalid-native-dimension-number');return Number(v);
      };
      const flags=numeric(body,90),space=numeric(body,70,0),rotated=numeric(body,71,0);
      if(![1,2,3].includes(flags)||space!==0||rotated!==0)throw Error('unsupported-native-dimension-reference-mode');
      const starts=body.map((p,j)=>p[0]===1?j:-1).filter(j=>j>=0);
      if(![2,4].includes(starts.length)||starts.some(j=>body[j][1]!=='AcDbOsnapPointRef'))throw Error('unsupported-native-dimension-reference-layout');
      if(body.slice(0,starts[0]).some(p=>![330,90,70,71].includes(p[0])))throw Error('unmodeled-native-dimension-data');
      const blocks=starts.map((start,n)=>{
        const b=body.slice(start+1,starts[n+1]??body.length),type=numeric(b,72),active=Boolean(flags&(1<<n));
        if(b.some(p=>![72,331,73,91,301,40,10,20,30,332,74,92,302,75].includes(p[0]))||new Set(b.map(p=>p[0])).size!==b.length)throw Error('unmodeled-native-dimension-reference-data');
        if([73,91,74,92,75].some(c=>numeric(b,c,0)!==0)||!['','0'].includes(key(one(b,301,'')))||!['','0'].includes(key(one(b,302,'')))||!['','0'].includes(key(one(b,332,''))))throw Error('unsupported-native-dimension-subentity');
        if(!active&&(type!==0||!['','0'].includes(key(one(b,331,'')))))throw Error('unmodeled-inactive-native-dimension-reference');
        if(active&&(![1,2,3,4,5,7,10].includes(type)||!hex(one(b,331))||key(one(b,331))==='0'))throw Error('unsupported-native-dimension-reference');
        const point={x:numeric(b,10),y:numeric(b,20)};if(numeric(b,30,0)!==0)throw Error('nonplanar-native-dimension-reference');const parameter=numeric(b,40,type===10?undefined:0);
        return {active,type,handle:key(one(b,331,'')),point,parameter};
      });
      return blocks;
    }
    function validateProvenance(value,records=null){
      if(!value||value.version!==1||Object.keys(value).some(k=>!['version','managed','pointSources','nearestSources'].includes(k))||['pointSources','nearestSources'].some(k=>Object.hasOwn(value,k)&&value[k]!==true)||!Array.isArray(value.managed)||!value.managed.length||value.managed.length>100000
          ||value.managed.some(a=>!Array.isArray(a)||a.length!==3||a.some(h=>!hex(h))))throw Error('invalid-native-dimension-provenance');
      for(let i=0;i<3;i++)if(new Set(value.managed.map(a=>key(a[i]))).size!==value.managed.length)throw Error('ambiguous-native-dimension-provenance');
      if(records){const map=index(records);let points=false,nearest=false;for(const[d,h,a]of value.managed){const q=owned(map,d,h,a),blocks=packet(q.record,q.at);if(blocks.some(b=>b.active&&[4,7].includes(b.type)))points=true;if(blocks.some(b=>b.active&&b.type===10))nearest=true;}if(points!==Boolean(value.pointSources))throw Error('native-dimension-point-source-provenance-mismatch');if(nearest!==Boolean(value.nearestSources))throw Error('native-dimension-nearest-source-provenance-mismatch');}
      return value;
    }
    function anchor(source,type,p,byId,parameter){
      if(!source||source.readonly||source.floorId||source.planRole||!['cadLine','cadArc','cadCircle','cadEllipse','cadPoint','cadInsert'].includes(source.type))return null;
      const base={sourceId:source.id},options=[];
      if(type===1){
        const keys=source.type==='cadLine'?['a','b']:source.type==='cadArc'||source.type==='cadEllipse'&&!root.cadEllipse.full(source)?['start','end']:[];
        for(const k of keys)options.push({...base,kind:'point',key:k});
      }else if(type===2)options.push({...base,kind:'geometry96',feature:'midpoint'});
      else if(type===3)options.push({...base,kind:'point',key:'center'});
      else if(type===5)for(let value=0;value<4;value++)options.push({...base,kind:'geometry96',feature:'quadrant',value});
      else if(type===4&&source.type==='cadPoint')options.push({...base,kind:'point',key:'point'});
      else if(type===7&&source.type==='cadInsert')options.push({...base,kind:'point',key:'insertion'});
      else if(type===10){const expected=curveParameter(source,p);if(expected==null||!Number.isFinite(parameter)||Math.abs(expected-parameter)>1e-8)return null;const a=root.cadDimensionReferences.capture(p,{kind:'nearest',objectId:source.id},byId);if(a)options.push(a);}
      const matches=options.filter(a=>{try{return distance(resolve(a,byId)?.point,p)<1e-6;}catch{return false;}});
      return matches.length===1?matches[0]:null;
    }
    function references(o,byId){
      if(o.type!=='cadDimension'||!['linear','aligned'].includes(o.kind||'aligned')||o.association?.status==='detached'||!o.association)return null;
      const result=[];
      for(const slot of ['p1','p2']){
        const a=o.association.anchors[slot],source=a&&byId(a.sourceId);let type;
        if(a?.kind==='point')type=({center:3,midpoint:2,point:4,insertion:7})[a.key]??1;
        else if(a?.kind==='geometry96'&&!a.edgeId)type=({center:3,midpoint:2,quadrant:5})[a.feature]??(a.feature==='parameter'?([0,1].includes(a.value)&&source?.type!=='cadCircle'&&!(source?.type==='cadEllipse'&&root.cadEllipse.full(source))?1:['cadCircle','cadArc','cadEllipse'].includes(source?.type)?10:null):null);
        let value;try{value=a&&resolve(a,byId);}catch{}
        const point=o[slot],nearestParameter=type===10?curveParameter(source,point):null,captured=value?.point&&distance(value.point,point)<1e-6&&anchor(source,type,point,byId,nearestParameter);
        if(!captured){result.push(null);continue;}
        let parameter=0;
        if(type===10)parameter=nearestParameter;
        else if(source.type==='cadLine')parameter=captured.key==='b'?1:type===2?.5:0;
        else if(['cadArc','cadCircle'].includes(source.type))parameter=Math.atan2(point.y-source.center.y,point.x-source.center.x);
        else if(source.type==='cadEllipse')parameter=root.cadEllipse.parameter(source,point);
        result.push({source,type,point,parameter:Number.isFinite(parameter)?parameter:0});
      }
      return result.some(Boolean)?result:null;
    }
    function read(objects,records,f=1){
      if(!Number.isFinite(f)||f<=0)throw Error('invalid-native-dimension-unit-factor');
      const map=index(records),handles=new Map(),byId=new Map(objects.map(o=>[o.id,o])),managed=[],warnings=[];let points=false,nearest=false;
      for(const o of objects){const h=key(get(o.dxf?.raw||o.rawGroups||[],5));if(h)handles.set(h,handles.has(h)?null:o);}
      for(let i=0;i<objects.length;i++){
        const o=objects[i],raw=o.dxf?.raw||[];
        if(o.type!=='cadDimension'||!['linear','aligned'].includes(o.kind||'aligned')||Number(get(raw,67,0)))continue;
        try{
          const dh=extension(raw);if(!dh)continue;
          const dict=map.get(dh);if(!dict||get(dict,0)!=='DICTIONARY')continue;
          const entry=dictionaryEntry(dict);if(!entry)continue;
          const h=key(one(raw,5)),q=owned(map,h,dh,entry.handle),blocks=packet(q.record,q.at);
          const anchors={};
          for(const[n,b]of blocks.entries()){
            if(!b.active)continue;
            const {type}=b,source=handles.get(b.handle),slot=['p1','p2'][n],p={x:b.point.x*f,y:b.point.y*f};
            if(![p.x,p.y].every(Number.isFinite)||distance(p,o[slot])>=1e-6)throw Error('stale-native-dimension-witness');
            if(source&&(owner(source.dxf?.raw||[])!==owner(raw)||Number(get(source.dxf?.raw||[],67,0))))throw Error('foreign-native-dimension-source-scope');
            const a=anchor(source,type,p,id=>byId.get(id),b.parameter);if(!a)throw Error('unavailable-native-dimension-source');anchors[slot]=a;
          }
          const after={...o,association:root.cadDimensionPartial.relation(o,anchors)};validate(after);
          after.dxf={...o.dxf,signature:root.architecturalDxf.signature(after)};objects[i]=after;byId.set(o.id,after);managed.push([h,dh,entry.handle]);
          if(blocks.some(b=>b.active&&[4,7].includes(b.type)))points=true;
          if(blocks.some(b=>b.active&&b.type===10))nearest=true;
        }catch(error){warnings.push('Native DIMASSOC retained without activation: '+o.id+' '+error.message);}
      }
      return {warnings,...(managed.length?{provenance:{version:1,managed,...(points?{pointSources:true}:{}),...(nearest?{nearestSources:true}:{})}}:{})};
    }
    function write(objects,records,{f=1,fresh,handle,provenance=null}={}){
      if(!Number.isFinite(f)||f<=0)throw Error('invalid-native-dimension-unit-factor');
      if(provenance)validateProvenance(provenance,records);
      const map=index(records),byId=new Map(objects.map(o=>[o.id,o])),originals=new Map(),extensions=new Map(),reactors=new Map(),known=new Set(),warnings=[],exported=new Set();
      for(const o of objects){const r=o.dxf?.raw;if(!r||o.dxf.ownerId&&o.dxf.ownerId!==o.id)continue;const h=key(get(r,5));if(h)originals.set(h,originals.has(h)?null:o);}
      const retained=new Map();
      function removeEntry(q){const entry=dictionaryEntry(q.dict);q.dict.splice(entry.at,2);records.splice(records.indexOf(q.record),1);map.delete(key(get(q.record,5)));}
      for(const tuple of provenance?.managed||[]){
        const [h,dh,ah]=tuple.map(key),q=owned(map,h,dh,ah),o=originals.get(h);known.add(ah);
        if(originals.has(h)&&!o)throw Error('ambiguous-native-dimension-owner');
        if(!o||!references(o,id=>byId.get(id))){
          removeEntry(q);
          if(!o){if(q.dict.some(p=>p[0]===3||p[0]>=1000))throw Error('native-dimension-deleted-owner-has-foreign-dictionary');records.splice(records.indexOf(q.dict),1);map.delete(dh);}
        }else retained.set(o.id,{...q,handle:ah});
      }
      const addReactor=(id,h)=>{if(!reactors.has(id))reactors.set(id,new Set());reactors.get(id).add(h);};
      for(const o of objects){
        const refs=references(o,id=>byId.get(id));if(!refs)continue;
        const dimensionHandle=handle(o),r=o.dxf?.raw||[],own=(!o.dxf?.ownerId||o.dxf.ownerId===o.id),dh=own&&extension(r);
        let old=retained.get(o.id),dict=old?.dict;
        if(!dict&&dh){dict=map.get(dh);if(!dict||get(dict,0)!=='DICTIONARY'||owner(dict)!==key(dimensionHandle))throw Error('invalid-native-dimension-dictionary-owner');if(dictionaryEntry(dict)){warnings.push('Unmanaged native DIMASSOC retained; PPRJ reassociation not exported: '+o.id);continue;}}
        if(!records.some(r=>get(r,0)==='DICTIONARY'&&(!owner(r)||owner(r)==='0')))records.unshift([[0,'DICTIONARY'],[5,fresh()],[330,'0'],[100,'AcDbDictionary'],[280,0],[281,1]]);
        if(!dict){dict=[[0,'DICTIONARY'],[5,fresh()],[330,dimensionHandle],[100,'AcDbDictionary'],[280,1],[281,1]];records.push(dict);map.set(key(get(dict,5)),dict);}
        const dictHandle=get(dict,5),associationHandle=old?.handle||fresh(),flags=refs.reduce((n,r,i)=>n+(r?1<<i:0),0),body=[[100,'AcDbDimAssoc'],[330,dimensionHandle],[90,flags],[70,0],[71,0]];
        for(const [i,ref]of refs.entries()){
          const p=ref?.point||o[['p1','p2'][i]];
          body.push([1,'AcDbOsnapPointRef'],[72,ref?.type||0],[331,ref?handle(ref.source):'0'],[73,0],[91,0],[40,ref?.parameter||0],[10,p.x/f],[20,p.y/f],[30,0],[332,'0'],[74,0],[92,0],[75,0]);
          if(ref)addReactor(ref.source.id,associationHandle);
        }
        const prefix=old?clone(old.record.slice(0,old.at)):[[0,'DIMASSOC'],[5,associationHandle],[102,'{ACAD_REACTORS'],[330,dimensionHandle],[102,'}'],[330,dictHandle]];
        const record=[...prefix,...body];
        if(old)records[records.indexOf(old.record)]=record;
        else{records.push(record);dict.push([3,'ACAD_DIMASSOC'],[360,associationHandle]);}
        extensions.set(o.id,dictHandle);addReactor(o.id,associationHandle);known.add(associationHandle);exported.add(o.id);
        if(refs.some((r,i)=>!r&&o.association.anchors[['p1','p2'][i]]))warnings.push('Unsupported native DIMASSOC point omitted; full relation remains in PPRJ: '+o.id);
      }
      return {extensions,reactors,known,warnings,exported};
    }
    return Object.freeze({capability:nativeCapability,nearestCapability,read,write,references,validateProvenance});
  })();
  root.cadDimensionAssociation = Object.freeze({ capability, pointCapability, pointSourcesRequired, validate, capture, resolve, regenerate, augment, detached, restoreCopied, dependencies, sourceIds, nativeDxf });
})();
