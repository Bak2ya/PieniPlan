(() => {
  'use strict';

  const VERSION = '0.6.0';
  const BUILD = 7;
  const INTERNAL_UNIT = 'mm';
  const i18n = window.PieniPlanI18n;
  const t = (key, vars) => i18n.t(key, vars);
  i18n.apply(document);

  const $ = (id) => document.getElementById(id);
  const canvas = $('drawingCanvas');
  const host = $('canvasHost');
  const ctx = canvas.getContext('2d');

  const dom = {
    appShell: $('appShell'), startScreen: $('startScreen'), startPlanBtn: $('startPlanBtn'), startCadBtn: $('startCadBtn'), startSampleBtn: $('startSampleBtn'), documentStatus: $('documentStatus'), mobileViewerBadge: $('mobileViewerBadge'),
    continueWorkBtn: $('continueWorkBtn'), continueWorkDetail: $('continueWorkDetail'), backBtn: $('backBtn'), homeBtn: $('homeBtn'), appearanceBtn: $('appearanceBtn'), startAppearanceBtn: $('startAppearanceBtn'), appearanceMenu: $('appearanceMenu'),
    planToolsBtn: $('planToolsBtn'), cadToolsBtn: $('cadToolsBtn'), toolRail: $('toolRail'), toolPopover: $('toolPopover'),
    newBtn: $('newBtn'), openRefBtn: $('openRefBtn'), emptyOpenBtn: $('emptyOpenBtn'), addReferenceBtn: $('addReferenceBtn'),
    openDxfBtn: $('openDxfBtn'), dxfEditFileInput: $('dxfEditFileInput'), referenceFileInput: $('referenceFileInput'),
    fitBtn: $('fitBtn'), fullExtentsBtn: $('fullExtentsBtn'), undoBtn: $('undoBtn'), redoBtn: $('redoBtn'), exportDxfBtn: $('exportDxfBtn'),
    contextToolName: $('contextToolName'), contextFields: $('contextFields'), contextHint: $('contextHint'),
    emptyState: $('emptyState'), emptyKicker: $('emptyKicker'), emptyTitle: $('emptyTitle'), emptyCopy: $('emptyCopy'), emptyPrimaryBtn: $('emptyPrimaryBtn'),
    primaryInspectorTab: $('primaryInspectorTab'), primaryPanelTitle: $('primaryPanelTitle'), primaryPanelSubtitle: $('primaryPanelSubtitle'), primaryControls: $('primaryControls'), primaryList: $('primaryList'), mappingSettingsBtn: $('mappingSettingsBtn'),
    referenceList: $('referenceList'), propertiesPanel: $('propertiesPanel'),
    statusX: $('statusX'), statusY: $('statusY'), statusUnits: $('statusUnits'), statusAxis: $('statusAxis'), statusZoom: $('statusZoom'),
    gridToggle: $('gridToggle'), snapToggle: $('snapToggle'), orthoToggle: $('orthoToggle'),
    progressToast: $('progressToast'), progressTitle: $('progressTitle'), progressBar: $('progressBar'), progressDetail: $('progressDetail'),
    commandBar: $('commandBar'), commandInput: $('commandInput'), commandStatus: $('commandStatus'),
    dialogBackdrop: $('dialogBackdrop'), dialogTitle: $('dialogTitle'), dialogCopy: $('dialogCopy'), dialogInput: $('dialogInput'), dialogCancelBtn: $('dialogCancelBtn'), dialogApplyBtn: $('dialogApplyBtn'),
    mappingBackdrop: $('mappingBackdrop'), wallRepresentation: $('wallRepresentation'), wallLayerInput: $('wallLayerInput'), doorLayerInput: $('doorLayerInput'), windowLayerInput: $('windowLayerInput'), dimensionLayerInput: $('dimensionLayerInput'), mappingCancelBtn: $('mappingCancelBtn'), mappingApplyBtn: $('mappingApplyBtn'),
    uiTooltip: $('uiTooltip')
  };

  const planLayers = [
    { id: 'drawing', nameKey: 'layer.drawing', visible: true },
    { id: 'walls', nameKey: 'layer.walls', visible: true },
    { id: 'doors', nameKey: 'layer.doors', visible: true },
    { id: 'windows', nameKey: 'layer.windows', visible: true },
    { id: 'spaces', nameKey: 'layer.spaces', visible: true },
    { id: 'dimensions', nameKey: 'layer.dimensions', visible: true }
  ];

  const planToolCatalog = [
    { id: 'select', labelKey: 'tool.select', icon: 'select', ready: true },
    { id: 'wall', labelKey: 'tool.wall', icon: 'wall', ready: true },
    { id: 'door', labelKey: 'tool.door', icon: 'door', ready: true },
    { id: 'window', labelKey: 'tool.window', icon: 'window', ready: true },
    { id: 'space', labelKey: 'tool.space', icon: 'space', ready: true, tooltipKey: 'tooltip.defineSpace' },
    { separator: true },
    { id: 'measure', labelKey: 'tool.measure', icon: 'dimension', ready: true }
  ];

  const cadToolCatalog = {
    select: [
      { id: 'select', labelKey: 'tool.select', ready: true },
      { id: 'region', labelKey: 'tool.region', ready: true }
    ],
    draw: [
      { id: 'line', labelKey: 'tool.line', ready: true, note: 'L' },
      { id: 'polyline', labelKey: 'tool.polyline', ready: false, note: 'PL' },
      { id: 'rectangle', labelKey: 'tool.rectangle', ready: false },
      { id: 'circle', labelKey: 'tool.circle', ready: false }
    ],
    architecture: [
      { id: 'wall', labelKey: 'tool.wall', ready: true },
      { id: 'door', labelKey: 'tool.door', ready: true },
      { id: 'window', labelKey: 'tool.window', ready: true },
      { id: 'space', labelKey: 'tool.space', ready: false }
    ],
    dimension: [
      { id: 'measure', labelKey: 'tool.measure', ready: true, note: 'DI' },
      { id: 'aligned-dim', labelKey: 'tool.alignedDim', ready: false },
      { id: 'angle-dim', labelKey: 'tool.angleDim', ready: false }
    ],
    modify: [
      { id: 'move', labelKey: 'tool.move', ready: false, note: 'M' },
      { id: 'copy', labelKey: 'tool.copy', ready: false, note: 'CO' },
      { id: 'rotate', labelKey: 'tool.rotate', ready: false, note: 'RO' },
      { id: 'trim', labelKey: 'tool.trim', ready: false, note: 'TR' },
      { id: 'offset', labelKey: 'tool.offset', ready: false, note: 'O' },
      { id: 'delete', labelKey: 'tool.delete', ready: true, note: 'E' }
    ]
  };

  const cadCategories = [
    { id: 'select', labelKey: 'category.select', icon: 'select' },
    { id: 'draw', labelKey: 'category.draw', icon: 'draw' },
    { id: 'architecture', labelKey: 'category.architecture', icon: 'architecture' },
    { id: 'dimension', labelKey: 'category.dimension', icon: 'dimension' },
    { id: 'modify', labelKey: 'category.modify', icon: 'modify' }
  ];

  const state = {
    toolset: 'plan',
    camera: { cx: 0, cy: 0, zoom: 0.12 },
    cursorWorld: { x: 0, y: 0 },
    activeCategory: 'select',
    activeTool: 'select',
    activeCadLayer: '0',
    cadLayerVisibility: new Map([['0', true]]),
    references: [],
    selectedReferenceId: null,
    objects: [],
    selectedObjectId: null,
    hoveredObjectId: null,
    dragEdit: null,
    drawStart: null,
    previewEnd: null,
    previewOpening: null,
    measureStart: null,
    calibration: null,
    grid: true,
    snap: true,
    ortho: false,
    spaceDown: false,
    spaceGesture: null,
    pan: null,
    nextId: 1,
    history: [],
    future: [],
    toolSettings: { wallThickness: 150, doorWidth: 900, windowWidth: 1200 },
    cadMapping: null,
    mappingPendingAction: null,
    pendingToolAfterMapping: null,
    commandPending: null,
    sourceDxfName: null,
    sourceDxfMainBounds: null,
    sourceDxfFullBounds: null,
    sourceDxfOutlierCount: 0,
    dirty: false,
    objectSnapIndex: null,
    snapIndicator: null,
    drawingRegions: [],
    selectedRegionId: null,
    regionDrag: null,
    selectionDrag: null,
    selectedObjectIds: new Set(),
    editableLabels: [],
    layerFilter: '',
    baseAxisAngle: 0,
    baseAxisWallId: null,
    lastCommand: null,
    view: 'start',
    workspaceVisited: false,
    theme: 'system',
    viewerPointers: new Map(),
    viewerGesture: null
  };

  const THEME_STORAGE_KEY = 'pieniplan-theme';
  const ROUTE_MARKER = 'pieniplan';
  const SHORTCUTS = Object.freeze({
    undo: 'Ctrl/Cmd+Z', redo: 'Ctrl/Cmd+Shift+Z', select: 'Space', pan: 'Hold Space + drag',
    delete: 'Delete / Backspace', cancel: 'Esc', grid: 'F7', snap: 'F3', ortho: 'F8',
    line: 'L', erase: 'E', distance: 'DI', zoom: 'Z'
  });

  function applyShortcutMetadata(el, shortcutKey, tooltipKey = null, titleKey = null) {
    if (!el) return;
    const shortcut = SHORTCUTS[shortcutKey];
    if (shortcut) el.dataset.shortcut = shortcut; else delete el.dataset.shortcut;
    if (tooltipKey) el.dataset.tooltipKey = tooltipKey;
    if (titleKey) el.dataset.tooltipTitleKey = titleKey;
  }

  function safeReadTheme() {
    try {
      const value = localStorage.getItem(THEME_STORAGE_KEY);
      return ['system','light','dark','black'].includes(value) ? value : 'system';
    } catch (_) { return 'system'; }
  }

  function resolvedTheme(theme = state.theme) {
    if (theme === 'light' || theme === 'dark' || theme === 'black') return theme;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function updateThemeMeta() {
    const meta = document.querySelector('meta[name="theme-color"]');
    const resolved = resolvedTheme();
    if (meta) meta.setAttribute('content', resolved === 'light' ? '#F6F1E8' : resolved === 'black' ? '#000000' : '#0D1117');
  }

  function applyTheme(theme, { persist = true } = {}) {
    state.theme = ['system','light','dark','black'].includes(theme) ? theme : 'system';
    if (state.theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.dataset.theme = state.theme;
    document.querySelectorAll('[data-theme-choice]').forEach(button => button.classList.toggle('active', button.dataset.themeChoice === state.theme));
    if (persist) {
      try { localStorage.setItem(THEME_STORAGE_KEY, state.theme); } catch (_) {}
    }
    updateThemeMeta();
    render();
  }


  function isCompactViewer() {
    return window.matchMedia?.('(max-width: 720px)').matches === true;
  }

  function updateCompactViewerState() {
    const compact = isCompactViewer();
    document.documentElement.classList.toggle('compact-viewer', compact);
    if (dom.mobileViewerBadge) dom.mobileViewerBadge.hidden = !compact || state.view !== 'workspace';
    if (compact) {
      state.activeTool = 'select';
      state.dragEdit = null;
      state.hoveredObjectId = null;
      host.dataset.tool = 'select';
    }
  }

  function currentDocumentName() {
    return state.sourceDxfName || t('document.new');
  }

  function updateDocumentStatus() {
    if (!dom.documentStatus) return;
    const parts = [currentDocumentName()];
    if (state.dirty) parts.push(t('document.modified'));
    else if (state.sourceDxfName) parts.push(t('document.ready'));
    if (state.sourceDxfOutlierCount > 0) parts.push(t('document.outliers', { count: state.sourceDxfOutlierCount.toLocaleString() }));
    dom.documentStatus.textContent = parts.join(' · ');
    dom.documentStatus.classList.toggle('dirty', state.dirty);
    if (dom.fullExtentsBtn) dom.fullExtentsBtn.hidden = !(state.toolset === 'cad' && state.sourceDxfOutlierCount > 0);
  }

  function markDirty(value = true) {
    state.dirty = value;
    updateDocumentStatus();
  }

  function positionAppearanceMenu(owner) {
    const menu = dom.appearanceMenu;
    const rect = owner.getBoundingClientRect();
    menu.hidden = false;
    const m = menu.getBoundingClientRect();
    const margin = 10;
    let left = rect.right - m.width;
    let top = rect.bottom + 7;
    left = Math.max(margin, Math.min(window.innerWidth - m.width - margin, left));
    if (top + m.height > window.innerHeight - margin) top = rect.top - m.height - 7;
    menu.style.left = `${Math.round(left)}px`;
    menu.style.top = `${Math.round(Math.max(margin, top))}px`;
  }

  function toggleAppearanceMenu(owner) {
    if (!dom.appearanceMenu.hidden) { dom.appearanceMenu.hidden = true; return; }
    positionAppearanceMenu(owner);
  }

  function hasCurrentWork() {
    return state.workspaceVisited || state.objects.length > 0 || state.references.length > 0 || Boolean(state.sourceDxfName);
  }

  function updateContinueCard() {
    const show = hasCurrentWork();
    dom.continueWorkBtn.hidden = !show;
    if (!show) return;
    dom.continueWorkDetail.textContent = t('start.continueDetail', {
      toolset: t(state.toolset === 'plan' ? 'value.planTools' : 'value.cadTools'),
      objects: state.objects.length,
      references: state.references.length
    });
  }

  function writeRoute(view, toolset, mode = 'push') {
    const payload = { [ROUTE_MARKER]: true, view, toolset: toolset || state.toolset };
    const method = mode === 'replace' ? 'replaceState' : 'pushState';
    history[method](payload, '', location.href);
  }

  function showStartScreen({ historyMode = 'push' } = {}) {
    state.view = 'start';
    updateContinueCard();
    dom.startScreen.hidden = false;
    dom.appShell.setAttribute('aria-hidden', 'true');
    dom.appShell.inert = true;
    dom.appearanceMenu.hidden = true;
    if (historyMode !== 'none') writeRoute('start', state.toolset, historyMode);
  }

  function showWorkspace({ historyMode = 'push' } = {}) {
    state.view = 'workspace';
    state.workspaceVisited = true;
    dom.startScreen.hidden = true;
    dom.appShell.removeAttribute('aria-hidden');
    dom.appShell.inert = false;
    dom.appearanceMenu.hidden = true;
    if (historyMode !== 'none') writeRoute('workspace', state.toolset, historyMode);
    setTimeout(resizeCanvas, 0);
  }

  function applyRoute(route) {
    if (!route || !route[ROUTE_MARKER]) return;
    if (route.view === 'start') {
      showStartScreen({ historyMode: 'none' });
      return;
    }
    const toolset = route.toolset === 'cad' ? 'cad' : 'plan';
    switchToolset(toolset, { skipMapping: true, historyMode: 'none' });
  }

  function uid(prefix) { return `${prefix}-${state.nextId++}`; }
  function deg(radValue) { return radValue * 180 / Math.PI; }
  function rad(degValue) { return degValue * Math.PI / 180; }
  function distance(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
  function angleDeg(a, b) { return (deg(Math.atan2(b.y - a.y, b.x - a.x)) + 360) % 360; }
  function formatNumber(n, digits = 1) { return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—'; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  function unitFactorToMm(unit) { return unit?.metersPerUnit != null ? unit.metersPerUnit * 1000 : 1; }
  function isSemanticObject(o) { return ['wall','door','window','dimension','space'].includes(o?.type); }
  function isCadObject(o) { return ['cadLine','cadCircle','cadText'].includes(o?.type); }
  function hasSemanticObjects() { return state.objects.some(isSemanticObject); }
  function makeStableUuid() { return globalThis.crypto?.randomUUID?.() || `space-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`; }
  function ensureWallConstraints(wall){
    if(!wall||wall.type!=='wall') return null;
    wall.constraints=wall.constraints||{};
    if(!('orientation' in wall.constraints)) wall.constraints.orientation=null;
    if(!('fixedAngle' in wall.constraints)) wall.constraints.fixedAngle=null;
    if(!('fixedLength' in wall.constraints)) wall.constraints.fixedLength=null;
    if(!('fixed' in wall.constraints)) wall.constraints.fixed=false;
    wall.constraints.endpointLocks=wall.constraints.endpointLocks||{a:false,b:false};
    return wall.constraints;
  }
  function isSelectedId(id){return state.selectedObjectId===id||state.selectedObjectIds.has(id);}
  function isSelectionPreviewId(id){return Boolean(state.selectionDrag?.previewIds?.has(id));}
  function clearMultiSelection(){state.selectedObjectIds.clear();state.selectedObjectId=null;}
  function selectOnly(id){state.selectedObjectId=id||null;state.selectedObjectIds.clear();if(id)state.selectedObjectIds.add(id);}
  function selectionIds(){const ids=new Set(state.selectedObjectIds);if(state.selectedObjectId)ids.add(state.selectedObjectId);return ids;}
  function visibleSelectableObjects(){
    return state.objects.filter(o=>{
      if(state.toolset==='plan'&&isCadObject(o))return false;
      if(state.toolset==='cad'&&o.type!=='space'&&(isCadObject(o)||isSemanticObject(o)||o.type==='line')&&!cadLayerVisible(cadLayerForObject(o)))return false;
      return true;
    });
  }
  function objectFullyInsideRect(o,r){const b=objectBoundsWorld(o);return b&&b.minx>=r.minx&&b.maxx<=r.maxx&&b.miny>=r.miny&&b.maxy<=r.maxy;}
  function applySelectionSet(ids,mode='replace'){const next=new Set(state.selectedObjectIds);if(mode==='replace'){next.clear();for(const id of ids)next.add(id);}else if(mode==='add'){for(const id of ids)next.add(id);}else if(mode==='toggle'){for(const id of ids){if(next.has(id))next.delete(id);else next.add(id);}}state.selectedObjectIds=next;state.selectedObjectId=next.size===1?[...next][0]:null;state.selectedReferenceId=null;state.selectedRegionId=null;}
  function applyObjectClickSelection(obj,e){if(!obj){if(!e.shiftKey&&!e.ctrlKey&&!e.metaKey)clearMultiSelection();return;}const mode=e.shiftKey?'add':(e.ctrlKey||e.metaKey?'toggle':'replace');applySelectionSet([obj.id],mode);}
  function registerEditableLabel({objectId,kind,rect,value}){state.editableLabels.push({objectId,kind,rect,value});}
  function hitEditableLabel(screen){for(let i=state.editableLabels.length-1;i>=0;i--){const l=state.editableLabels[i],r=l.rect;if(screen.x>=r.x&&screen.x<=r.x+r.w&&screen.y>=r.y&&screen.y<=r.y+r.h)return l;}return null;}
  function baseAxisAngle(){return Number(state.baseAxisAngle)||0;}
  function normalizeAngle(a){let n=((Number(a)||0)%360+360)%360;return n;}
  function angleDelta(a,b){let d=normalizeAngle(a)-normalizeAngle(b);if(d>180)d-=360;if(d<-180)d+=360;return d;}
  function axisConstraintAngle(kind,value=null){
    if(kind==='horizontal')return 0;
    if(kind==='vertical')return 90;
    if(kind==='parallel')return baseAxisAngle();
    if(kind==='perpendicular')return baseAxisAngle()+90;
    if(kind==='angle')return baseAxisAngle()+(Number(value)||0);
    return null;
  }
  function wallConstraintAngle(wall){const c=ensureWallConstraints(wall);if(!c)return null;if(c.orientation)return axisConstraintAngle(c.orientation);if(Number.isFinite(c.fixedAngle))return axisConstraintAngle('angle',c.fixedAngle);return null;}
  function constrainedEndpointAnchor(wall,preferred='a'){
    const aAttached=Boolean(wall.attachments?.a),bAttached=Boolean(wall.attachments?.b),c=ensureWallConstraints(wall);
    if(c?.endpointLocks?.a||aAttached)return'a';
    if(c?.endpointLocks?.b||bAttached)return'b';
    return preferred==='b'?'b':'a';
  }
  function setWallAngleAndLength(wall,angle,length,anchor='a'){
    const a=rad(angle),len=Math.max(.001,length);
    if(anchor==='b')wall.a={x:wall.b.x-Math.cos(a)*len,y:wall.b.y-Math.sin(a)*len};
    else wall.b={x:wall.a.x+Math.cos(a)*len,y:wall.a.y+Math.sin(a)*len};
  }
  function enforceWallConstraints(wall,{changed='b'}={}){
    if(!wall||wall.type!=='wall')return;
    const c=ensureWallConstraints(wall);
    if(c.fixed&&c.fixedA&&c.fixedB){wall.a={...c.fixedA};wall.b={...c.fixedB};return;}
    enforceWallAttachments(wall);
    const desiredAngle=wallConstraintAngle(wall);
    const desiredLength=Number.isFinite(c.fixedLength)?c.fixedLength:distance(wall.a,wall.b);
    if(desiredAngle!=null||Number.isFinite(c.fixedLength)){
      const angle=desiredAngle!=null?desiredAngle:angleDeg(wall.a,wall.b);
      let anchor=changed==='a'?'b':'a';
      anchor=constrainedEndpointAnchor(wall,anchor);
      setWallAngleAndLength(wall,angle,desiredLength,anchor);
      enforceWallAttachments(wall);
    }
  }
  function breakWallConstraintForEdit(wall,kind){
    const c=ensureWallConstraints(wall);if(!c)return false;
    const conflicts=[];
    if(c.fixed)conflicts.push('fixed');
    if(kind==='angle'&&(c.orientation||Number.isFinite(c.fixedAngle)))conflicts.push('angle');
    if(kind==='length'&&Number.isFinite(c.fixedLength))conflicts.push('length');
    if(conflicts.length&&!confirm(t(kind==='angle'?'confirm.breakAngleConstraint':'confirm.breakLengthConstraint')))return false;
    pushHistory();
    if(conflicts.includes('fixed')){c.fixed=false;delete c.fixedA;delete c.fixedB;}
    if(kind==='angle'){c.orientation=null;c.fixedAngle=null;}
    if(kind==='length')c.fixedLength=null;
    return true;
  }
  function setBaseAxisFromWall(wall){
    if(!wall||wall.type!=='wall')return;
    pushHistory();
    state.baseAxisAngle=angleDeg(wall.a,wall.b);
    state.baseAxisWallId=wall.id;
    for(const w of state.objects.filter(o=>o.type==='wall'&&o.id!==wall.id)){if(ensureWallConstraints(w).orientation==='parallel'||ensureWallConstraints(w).orientation==='perpendicular'||Number.isFinite(ensureWallConstraints(w).fixedAngle))enforceWallConstraints(w);}
    markDirty(true);rebuildObjectSnapIndex();updateAll();
  }
  function clearBaseAxis(){pushHistory();state.baseAxisAngle=0;state.baseAxisWallId=null;for(const w of state.objects.filter(o=>o.type==='wall'))enforceWallConstraints(w);markDirty(true);rebuildObjectSnapIndex();updateAll();}
  function setWallConstraint(wall,type,value=null){
    if(!wall||wall.type!=='wall')return;
    const c=ensureWallConstraints(wall);
    pushHistory();
    if(type==='horizontal'||type==='vertical'||type==='parallel'||type==='perpendicular'){c.orientation=type;c.fixedAngle=null;}
    else if(type==='angle'){c.orientation=null;c.fixedAngle=Number(value)||0;}
    else if(type==='length')c.fixedLength=Math.max(.001,Number(value)||distance(wall.a,wall.b));
    else if(type==='fixed'){c.fixed=!c.fixed;if(c.fixed){c.fixedA={...wall.a};c.fixedB={...wall.b};}else{delete c.fixedA;delete c.fixedB;}}
    enforceWallConstraints(wall);syncDependentsOfWall(wall.id);refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();
  }
  function clearWallGeometricConstraints(wall){
    if(!wall||wall.type!=='wall')return;pushHistory();const c=ensureWallConstraints(wall);c.orientation=null;c.fixedAngle=null;c.fixedLength=null;c.fixed=false;c.endpointLocks={a:false,b:false};delete c.fixedA;delete c.fixedB;markDirty(true);updateAll();
  }
  function endpointConstraintCandidate(point,selfWallId){
    const threshold=Math.max(20,12/state.camera.zoom);let endpoint=null,endpointD=threshold;
    for(const wall of state.objects){if(wall.type!=='wall'||wall.id===selfWallId)continue;for(const ep of['a','b']){const d=distance(point,wall[ep]);if(d<endpointD){endpointD=d;endpoint={kind:'coincident',wallId:wall.id,targetEndpoint:ep,t:ep==='a'?0:1,point:{...wall[ep]}};}}}
    if(endpoint)return endpoint;
    let line=null,lineD=threshold;
    for(const wall of state.objects){if(wall.type!=='wall'||wall.id===selfWallId)continue;const pr=projectPointToSegment(point,wall.a,wall.b);if(pr.distance<lineD){lineD=pr.distance;line={kind:'pointOnLine',wallId:wall.id,t:pr.t,point:{...pr.point}};}}
    return line;
  }
  function applyEndpointConstraint(wall,endpoint,candidate){
    if(!wall||!candidate)return false;pushHistory();wall.attachments=wall.attachments||{};wall.attachments[endpoint]={wallId:candidate.wallId,t:candidate.t,kind:candidate.kind,targetEndpoint:candidate.targetEndpoint||null};wall[endpoint]={...candidate.point};markDirty(true);syncDependentsOfWall(wall.id);refreshSpaces();rebuildObjectSnapIndex();updateAll();return true;
  }
  function detachEndpointConstraint(wall,endpoint){if(!wall?.attachments?.[endpoint])return;pushHistory();delete wall.attachments[endpoint];markDirty(true);updateAll();}
  function drawConstraintBadge(text,world,dx=0,dy=0){
    const p=toScreenCss(world),styles=getComputedStyle(document.documentElement),fg=styles.getPropertyValue('--selection').trim(),bg=styles.getPropertyValue('--canvas').trim();
    ctx.save();ctx.font='9px system-ui';const w=Math.max(15,ctx.measureText(text).width+8),h=15,x=p.x+dx-w/2,y=p.y+dy-h/2;ctx.fillStyle=bg;ctx.strokeStyle=fg;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect?.(x,y,w,h,4);if(!ctx.roundRect){ctx.rect(x,y,w,h);}ctx.fill();ctx.stroke();ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x+w/2,y+h/2+.3);ctx.restore();
  }
  function drawWallConstraintHints(wall){
    if(!wall||wall.type!=='wall'||!isSelectedId(wall.id)||state.toolset!=='plan')return;
    const c=ensureWallConstraints(wall),mid=wallPointAt(wall,.5),v=wallVector(wall),off=Math.max(170,(wall.thickness||150)*1.1),base={x:mid.x+v.nx*off,y:mid.y+v.ny*off};
    const badges=[];if(c.orientation==='horizontal')badges.push('H');if(c.orientation==='vertical')badges.push('V');if(c.orientation==='parallel')badges.push('∥');if(c.orientation==='perpendicular')badges.push('⊥');if(Number.isFinite(c.fixedAngle))badges.push('∠');if(Number.isFinite(c.fixedLength))badges.push('L');if(c.fixed)badges.push('FIX');
    badges.forEach((b,i)=>drawConstraintBadge(b,base,i*24,0));
    for(const ep of['a','b']){const att=wall.attachments?.[ep];if(att)drawConstraintBadge(att.kind==='coincident'?'C':'P',wall[ep],0,ep==='a'?-18:18);if(c.endpointLocks?.[ep])drawConstraintBadge('F',wall[ep],ep==='a'?-18:18,0);}
  }
  function wallPointAt(wall,t){return{x:wall.a.x+(wall.b.x-wall.a.x)*t,y:wall.a.y+(wall.b.y-wall.a.y)*t};}
  function signedDistanceToWall(p,wall){const v=wallVector(wall);return (p.x-wall.a.x)*v.nx+(p.y-wall.a.y)*v.ny;}
  function polygonArea(poly){let a=0;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];a+=p.x*q.y-q.x*p.y;}return a/2;}
  function polygonCentroid(poly){let a=0,cx=0,cy=0;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],cross=p.x*q.y-q.x*p.y;a+=cross;cx+=(p.x+q.x)*cross;cy+=(p.y+q.y)*cross;}a*=.5;if(Math.abs(a)<1e-9)return poly[0]||{x:0,y:0};return{x:cx/(6*a),y:cy/(6*a)};}
  function pointInPolygon(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];const hit=((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/((b.y-a.y)||1e-12)+a.x);if(hit)inside=!inside;}return inside;}
  function segmentIntersection(a,b,c,d){const r={x:b.x-a.x,y:b.y-a.y},s={x:d.x-c.x,y:d.y-c.y};const cross=(u,v)=>u.x*v.y-u.y*v.x,den=cross(r,s);if(Math.abs(den)<1e-9)return null;const ca={x:c.x-a.x,y:c.y-a.y},t0=cross(ca,s)/den,u0=cross(ca,r)/den;if(t0<-1e-8||t0>1+1e-8||u0<-1e-8||u0>1+1e-8)return null;return{t:clamp(t0,0,1),u:clamp(u0,0,1),point:{x:a.x+r.x*t0,y:a.y+r.y*t0}};}
  function rectFromPoints(a,b){return{minx:Math.min(a.x,b.x),miny:Math.min(a.y,b.y),maxx:Math.max(a.x,b.x),maxy:Math.max(a.y,b.y)};}
  function pointInRect(p,r){return p.x>=r.minx&&p.x<=r.maxx&&p.y>=r.miny&&p.y<=r.maxy;}
  function boundsOverlap(a,b){return !(a.maxx<b.minx||a.minx>b.maxx||a.maxy<b.miny||a.miny>b.maxy);}
  function objectBoundsWorld(o){if(o.a&&o.b)return rectFromPoints(o.a,o.b);if(o.type==='cadCircle')return{minx:o.center.x-o.radius,miny:o.center.y-o.radius,maxx:o.center.x+o.radius,maxy:o.center.y+o.radius};if(o.point)return{minx:o.point.x,miny:o.point.y,maxx:o.point.x,maxy:o.point.y};if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);return g?rectFromPoints(g.p1,g.p2):null;}if(o.type==='space'&&o.polygon?.length){return o.polygon.reduce((b,p)=>({minx:Math.min(b.minx,p.x),miny:Math.min(b.miny,p.y),maxx:Math.max(b.maxx,p.x),maxy:Math.max(b.maxy,p.y)}),{minx:Infinity,miny:Infinity,maxx:-Infinity,maxy:-Infinity});}return null;}
  function objectTouchesRegion(o,region){const b=objectBoundsWorld(o);return b?boundsOverlap(b,region):false;}
  function segmentIntersectsRect(a,b,r){if(pointInRect(a,r)||pointInRect(b,r))return true;const p1={x:r.minx,y:r.miny},p2={x:r.maxx,y:r.miny},p3={x:r.maxx,y:r.maxy},p4={x:r.minx,y:r.maxy};return Boolean(segmentIntersection(a,b,p1,p2)||segmentIntersection(a,b,p2,p3)||segmentIntersection(a,b,p3,p4)||segmentIntersection(a,b,p4,p1));}
  function objectCrossesRect(o,r){if(o.a&&o.b)return segmentIntersectsRect(o.a,o.b,r);if(o.type==='cadCircle'){const b=objectBoundsWorld(o);return b?boundsOverlap(b,r):false;}if(o.point)return pointInRect(o.point,r);if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);return g?segmentIntersectsRect(g.p1,g.p2,r):false;}if(o.type==='dimension'){const g=dimensionGeometry(o);return g?segmentIntersectsRect(g.d1,g.d2,r):false;}const b=objectBoundsWorld(o);return b?boundsOverlap(b,r):false;}
  function selectionCandidatesForDrag(drag){if(!drag)return[];const r=rectFromPoints(drag.start,drag.current),crossing=drag.current.x<drag.start.x;return visibleSelectableObjects().filter(o=>crossing?objectCrossesRect(o,r):objectFullyInsideRect(o,r));}
  function updateSelectionDragPreview(){if(!state.selectionDrag)return;state.selectionDrag.previewIds=new Set(selectionCandidatesForDrag(state.selectionDrag).map(o=>o.id));}
  function drawSelectionDrag(){const drag=state.selectionDrag;if(!drag)return;const r=rectFromPoints(drag.start,drag.current),a=toScreenCss({x:r.minx,y:r.miny}),b=toScreenCss({x:r.maxx,y:r.maxy}),x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(a.x-b.x),h=Math.abs(a.y-b.y),crossing=drag.current.x<drag.start.x,styles=getComputedStyle(document.documentElement),color=(crossing?styles.getPropertyValue('--success'):styles.getPropertyValue('--accent')).trim();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=.12;ctx.fillRect(x,y,w,h);ctx.globalAlpha=.9;ctx.lineWidth=1.2;ctx.setLineDash(crossing?[6,4]:[]);ctx.strokeRect(x+.5,y+.5,w,h);ctx.setLineDash([]);ctx.font='10px system-ui';ctx.fillStyle=color;ctx.fillText(crossing?'Crossing':'Window',x+6,y+14);ctx.restore();}
  function clipLineToRect(a,b,r){let t0=0,t1=1,dx=b.x-a.x,dy=b.y-a.y;for(const[p,q]of[[-dx,a.x-r.minx],[dx,r.maxx-a.x],[-dy,a.y-r.miny],[dy,r.maxy-a.y]]){if(Math.abs(p)<1e-12){if(q<0)return null;continue;}const t=q/p;if(p<0){if(t>t1)return null;if(t>t0)t0=t;}else{if(t<t0)return null;if(t<t1)t1=t;}}return[{x:a.x+dx*t0,y:a.y+dy*t0},{x:a.x+dx*t1,y:a.y+dy*t1}];}

  function cssCanvasSize() {
    const dpr = Number(canvas.dataset.dpr || 1);
    return { w: canvas.width / dpr, h: canvas.height / dpr, dpr };
  }

  function toScreenCss(p) {
    const { w, h } = cssCanvasSize();
    return { x: w / 2 + (p.x - state.camera.cx) * state.camera.zoom, y: h / 2 - (p.y - state.camera.cy) * state.camera.zoom };
  }

  function screenCssToWorld(p) {
    const { w, h } = cssCanvasSize();
    return { x: state.camera.cx + (p.x - w / 2) / state.camera.zoom, y: state.camera.cy - (p.y - h / 2) / state.camera.zoom };
  }

  function fromPointerEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function referenceLocalToWorld(ref, p) { return { x: ref.origin.x + p.x * ref.scale, y: ref.origin.y + p.y * ref.scale }; }
  function referenceWorldToLocal(ref, p) { return { x: (p.x - ref.origin.x) / ref.scale, y: (p.y - ref.origin.y) / ref.scale }; }

  function resizeCanvas() {
    const r = host.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    canvas.style.width = `${r.width}px`;
    canvas.style.height = `${r.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.dataset.dpr = String(dpr);
    render();
  }

  function render() {
    const { w, h } = cssCanvasSize();
    state.editableLabels = [];
    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h);
    for (const ref of state.references) if (ref.visible) drawReference(ref);
    if (state.toolset === 'plan') drawPlanWorkspace(); else drawCadWorkspace();
    drawDrawingRegions();
    drawSelectionDrag();
    drawPreview();
    drawCalibrationPreview();
    drawOpeningPreview();
    drawSnapIndicator();
    dom.emptyState.hidden = state.references.length > 0 || state.objects.length > 0;
    dom.statusZoom.textContent = `${Math.round(state.camera.zoom / 0.12 * 100)}%`;
  }

  function drawGrid(w, h) {
    if (!state.grid) return;
    const zoom = state.camera.zoom;
    let step = 100;
    while (step * zoom < 14) step *= 2;
    while (step * zoom > 42) step /= 2;
    const major = step * 5;
    const minX = state.camera.cx - w / 2 / zoom;
    const maxX = state.camera.cx + w / 2 / zoom;
    const minY = state.camera.cy - h / 2 / zoom;
    const maxY = state.camera.cy + h / 2 / zoom;
    const styles = getComputedStyle(document.documentElement);
    const minorColor = styles.getPropertyValue('--grid-minor').trim();
    const majorColor = styles.getPropertyValue('--grid-major').trim();
    ctx.save();
    ctx.lineWidth = 1;
    for (let x = Math.floor(minX / step) * step; x <= maxX; x += step) {
      const sx = toScreenCss({ x, y: 0 }).x;
      ctx.strokeStyle = Math.abs((x / major) - Math.round(x / major)) < 1e-6 ? majorColor : minorColor;
      ctx.beginPath(); ctx.moveTo(sx + .5, 0); ctx.lineTo(sx + .5, h); ctx.stroke();
    }
    for (let y = Math.floor(minY / step) * step; y <= maxY; y += step) {
      const sy = toScreenCss({ x: 0, y }).y;
      ctx.strokeStyle = Math.abs((y / major) - Math.round(y / major)) < 1e-6 ? majorColor : minorColor;
      ctx.beginPath(); ctx.moveTo(0, sy + .5); ctx.lineTo(w, sy + .5); ctx.stroke();
    }
    ctx.restore();
  }

  function drawReference(ref) {
    ctx.save();
    ctx.globalAlpha = ref.opacity;
    if (ref.type === 'image') {
      const bl = toScreenCss(referenceLocalToWorld(ref, { x: 0, y: 0 }));
      const tr = toScreenCss(referenceLocalToWorld(ref, { x: ref.width, y: ref.height }));
      const dw = tr.x - bl.x;
      const dh = bl.y - tr.y;
      ctx.drawImage(ref.image, bl.x, bl.y - dh, dw, dh);
    } else if (ref.type === 'linkedCadRegion') {
      const region=state.drawingRegions.find(r=>r.id===ref.regionId);if(!region){ctx.restore();return;}
      const color=getComputedStyle(document.documentElement).getPropertyValue('--cad-muted').trim()||'#8a8f98';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1;ctx.save();const a=toScreenCss({x:region.minx,y:region.miny}),b=toScreenCss({x:region.maxx,y:region.maxy});ctx.beginPath();ctx.rect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(a.x-b.x),Math.abs(a.y-b.y));ctx.clip();
      const prevSelected=state.selectedObjectId;state.selectedObjectId=null;for(const obj of state.objects){if(!isCadObject(obj)&&obj.type!=='line')continue;const layer=obj.cadLayer||'0';if(ref.visibleLayers&&!ref.visibleLayers.has(layer))continue;if(!objectTouchesRegion(obj,region))continue;drawCadObject(obj,color,1);}state.selectedObjectId=prevSelected;
      ctx.restore();
    } else if (ref.type === 'dxf') {
      const visibleLayers = ref.visibleLayers;
      const color = getComputedStyle(document.documentElement).getPropertyValue('--text-2').trim() || '#9ca3af';
      const { w, h } = cssCanvasSize();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.save();
      ctx.translate(w / 2 + (ref.origin.x - state.camera.cx) * state.camera.zoom, h / 2 - (ref.origin.y - state.camera.cy) * state.camera.zoom);
      ctx.scale(state.camera.zoom * ref.scale, -state.camera.zoom * ref.scale);
      ctx.lineWidth = 1 / Math.max(.000001, state.camera.zoom * ref.scale);
      for (const [layer, path] of ref.pathsByLayer) {
        if (visibleLayers && !visibleLayers.has(layer)) continue;
        ctx.stroke(path);
      }
      ctx.restore();
      if (state.camera.zoom * ref.scale >= .018) {
        ctx.font = '10px system-ui';
        for (const e of ref.textEntities) {
          if (visibleLayers && !visibleLayers.has(e.layer || '0')) continue;
          const s = toScreenCss(referenceLocalToWorld(ref, { x:e.x, y:e.y }));
          ctx.fillText(e.text || '', s.x, s.y);
        }
      }
    }
    ctx.restore();
  }

  function layerVisible(id) { return planLayers.find(l => l.id === id)?.visible !== false; }
  function cadLayerVisible(name) { return state.cadLayerVisibility.get(name || '0') !== false; }
  function setCadLayerVisibilityUndoable(layer,visible){const key=layer||'0';if(cadLayerVisible(key)===Boolean(visible))return;pushHistory();state.cadLayerVisibility.set(key,Boolean(visible));updateAll();}
  function soloLayer(layer){const keys=[...state.cadLayerVisibility.keys()],already=keys.every(k=>cadLayerVisible(k)===(k===layer));if(already)return;pushHistory();for(const key of keys)state.cadLayerVisibility.set(key,key===layer);updateAll();}
  function showAllCadLayers(){const hidden=[...state.cadLayerVisibility].some(([,v])=>v===false);if(!hidden)return;pushHistory();for(const k of state.cadLayerVisibility.keys())state.cadLayerVisibility.set(k,true);updateAll();}

  function drawPlanWorkspace() {
    const styles = getComputedStyle(document.documentElement);
    const muted = styles.getPropertyValue('--cad-muted').trim();
    const line = styles.getPropertyValue('--line').trim();
    const wall = styles.getPropertyValue('--wall').trim();
    const dim = styles.getPropertyValue('--dimension').trim();
    const sel = styles.getPropertyValue('--selection').trim();
    const hover = styles.getPropertyValue('--hover').trim();
    const hasLinkedCadReference = state.references.some(r=>r.visible&&r.type==='linkedCadRegion');

    if(!hasLinkedCadReference) for (const obj of state.objects) {
      if (!isCadObject(obj)) continue;
      if (!cadLayerVisible(obj.cadLayer)) continue;
      const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id);
      drawCadObject(obj, selected ? sel : preview ? hover : muted, selected ? 2 : preview ? 1.8 : 1);
    }

    if(layerVisible('spaces')) for(const obj of state.objects) if(obj.type==='space') drawSpacePlan(obj);
    for (const obj of state.objects) {
      if (obj.type === 'wall' && layerVisible('walls')) drawWallPlan(obj, isSelectedId(obj.id) ? sel : wall);
    }
    for (const obj of state.objects) {
      if (obj.type === 'door' && layerVisible('doors')) drawOpeningPlan(obj, 'door', isSelectedId(obj.id) ? sel : styles.getPropertyValue('--door').trim());
      else if (obj.type === 'window' && layerVisible('windows')) drawOpeningPlan(obj, 'window', isSelectedId(obj.id) ? sel : styles.getPropertyValue('--window').trim());
      else if (obj.type === 'dimension' && layerVisible('dimensions')) drawDimension(obj, isSelectedId(obj.id) ? sel : dim);
      else if (obj.type === 'line' && layerVisible('drawing')) drawLineObject(obj, isSelectedId(obj.id) ? sel : line);
    }
  }

  function drawSpacePlan(obj){if(!obj.polygon?.length)return;const styles=getComputedStyle(document.documentElement),selected=isSelectedId(obj.id),stroke=selected?styles.getPropertyValue('--selection').trim():(obj.invalid?'#b45309':styles.getPropertyValue('--accent').trim());ctx.save();ctx.fillStyle=stroke;ctx.globalAlpha=obj.invalid?.06:.08;ctx.beginPath();obj.polygon.forEach((p,i)=>{const q=toScreenCss(p);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);});ctx.closePath();ctx.fill();ctx.globalAlpha=.75;ctx.strokeStyle=stroke;ctx.lineWidth=selected?2:1;ctx.setLineDash(obj.invalid?[5,4]:[]);ctx.stroke();ctx.setLineDash([]);const c=toScreenCss(polygonCentroid(obj.polygon));const label=obj.invalid?t('space.invalid'):t('space.area',{area:formatNumber(obj.areaM2||Math.abs(polygonArea(obj.polygon))/1e6,2)});ctx.font='11px system-ui';ctx.fillStyle=stroke;ctx.globalAlpha=.95;ctx.fillText(label,c.x+6,c.y-6);ctx.restore();}

  function drawDrawingRegions(){if(state.toolset!=='cad')return;const styles=getComputedStyle(document.documentElement),color=styles.getPropertyValue('--accent').trim();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.setLineDash([6,5]);ctx.lineWidth=1.2;for(const region of state.drawingRegions){const a=toScreenCss({x:region.minx,y:region.miny}),b=toScreenCss({x:region.maxx,y:region.maxy});const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(a.x-b.x),h=Math.abs(a.y-b.y);ctx.globalAlpha=region.id===state.selectedRegionId?.95:.5;ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);ctx.font='11px system-ui';ctx.fillText(region.name||t('region.unnamed'),x+6,y+15);ctx.setLineDash([6,5]);}if(state.regionDrag){const r=rectFromPoints(state.regionDrag.start,state.regionDrag.current);const a=toScreenCss({x:r.minx,y:r.miny}),b=toScreenCss({x:r.maxx,y:r.maxy});ctx.globalAlpha=.85;ctx.strokeRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(a.x-b.x),Math.abs(a.y-b.y));}ctx.restore();}

  function drawSnapIndicator(){const s=state.snapIndicator;if(!state.snap||!s||isCompactViewer())return;const p=toScreenCss(s),color=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();ctx.lineWidth=1.4;if(s.kind==='wall'){ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();ctx.stroke();}else{ctx.beginPath();ctx.rect(p.x-4,p.y-4,8,8);ctx.fill();ctx.stroke();}ctx.restore();}

  function drawCadWorkspace() {
    const styles=getComputedStyle(document.documentElement),line=styles.getPropertyValue('--line').trim(),sel=styles.getPropertyValue('--selection').trim(),hover=styles.getPropertyValue('--hover').trim(),dim=styles.getPropertyValue('--dimension').trim(),door=styles.getPropertyValue('--door').trim(),windowColor=styles.getPropertyValue('--window').trim();
    for(const obj of state.objects){if(!isCadObject(obj)||!cadLayerVisible(obj.cadLayer))continue;const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview;drawCadObject(obj,selected?sel:preview?hover:hovered?hover:line,selected?2:preview?1.8:hovered?1.8:1.25);}
    for(const obj of state.objects){if(obj.type==='wall'&&cadLayerVisible(cadLayerForObject(obj))){const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview;drawWallCad(obj,selected?sel:preview?hover:hovered?hover:line);}}
    for(const obj of state.objects){const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview,color=selected?sel:preview?hover:hovered?hover:null;if(obj.type==='door'&&cadLayerVisible(cadLayerForObject(obj)))drawOpeningCad(obj,'door',color||door);else if(obj.type==='window'&&cadLayerVisible(cadLayerForObject(obj)))drawOpeningCad(obj,'window',color||windowColor);else if(obj.type==='dimension'&&cadLayerVisible(cadLayerForObject(obj)))drawDimension(obj,color||dim);else if(obj.type==='line'&&cadLayerVisible(obj.cadLayer||'0'))drawLineObject(obj,color||line);}
  }

  function drawLineObject(obj, color, width = 1.4) {
    const styles=getComputedStyle(document.documentElement),selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview;
    const stroke=selected?styles.getPropertyValue('--selection').trim():preview?styles.getPropertyValue('--hover').trim():hovered?styles.getPropertyValue('--hover').trim():color;
    const a=toScreenCss(obj.a),b=toScreenCss(obj.b);ctx.save();ctx.strokeStyle=stroke;ctx.lineWidth=selected?Math.max(2,width):preview||hovered?Math.max(1.8,width):width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();drawSelectionHandles(obj,[a,b]);ctx.restore();
  }

  function objectInViewport(obj){const {w,h}=cssCanvasSize(),pad=40/state.camera.zoom,minx=state.camera.cx-w/2/state.camera.zoom-pad,maxx=state.camera.cx+w/2/state.camera.zoom+pad,miny=state.camera.cy-h/2/state.camera.zoom-pad,maxy=state.camera.cy+h/2/state.camera.zoom+pad;let b=null;if(obj.a&&obj.b)b={minx:Math.min(obj.a.x,obj.b.x),maxx:Math.max(obj.a.x,obj.b.x),miny:Math.min(obj.a.y,obj.b.y),maxy:Math.max(obj.a.y,obj.b.y)};else if(obj.center)b={minx:obj.center.x-obj.radius,maxx:obj.center.x+obj.radius,miny:obj.center.y-obj.radius,maxy:obj.center.y+obj.radius};else if(obj.point)b={minx:obj.point.x,maxx:obj.point.x,miny:obj.point.y,maxy:obj.point.y};if(!b)return true;return !(b.maxx<minx||b.minx>maxx||b.maxy<miny||b.miny>maxy);}

  function drawCadObject(obj, color, width = 1.2) {
    if(!objectInViewport(obj))return;const selected=isSelectedId(obj.id);ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;
    if(obj.type==='cadLine'){const a=toScreenCss(obj.a),b=toScreenCss(obj.b);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();drawSelectionHandles(obj,[a,b]);}
    else if(obj.type==='cadCircle'){const c=toScreenCss(obj.center);ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.5,obj.radius*state.camera.zoom),0,Math.PI*2);ctx.stroke();if(selected)drawSelectionHandles(obj,[c]);}
    else if(obj.type==='cadText'){const p=toScreenCss(obj.point);ctx.font='10px system-ui';ctx.fillText(obj.text||'',p.x,p.y);}ctx.restore();
  }

  function wallVector(wall) {
    const dx = wall.b.x - wall.a.x, dy = wall.b.y - wall.a.y;
    const len = Math.max(.000001, Math.hypot(dx, dy));
    return { dx, dy, len, ux: dx / len, uy: dy / len, nx: -dy / len, ny: dx / len };
  }

  function wallEndpointConnected(wall, endpointName) {
    const p = wall[endpointName];
    const tol = Math.max(2, (wall.thickness || 150) * .12);
    for (const other of state.objects) {
      if (other === wall || other.type !== 'wall') continue;
      if (distance(p, other.a) <= tol || distance(p, other.b) <= tol) return true;
      const pr = projectPointToSegment(p, other.a, other.b);
      if (pr.distance <= tol && pr.t > .001 && pr.t < .999) return true;
    }
    return false;
  }

  function wallCenterlineWithJoins(wall) {
    const v = wallVector(wall), h = (wall.thickness || 150) / 2;
    const extendA = wallEndpointConnected(wall, 'a') ? h : 0;
    const extendB = wallEndpointConnected(wall, 'b') ? h : 0;
    return {
      a: { x: wall.a.x - v.ux * extendA, y: wall.a.y - v.uy * extendA },
      b: { x: wall.b.x + v.ux * extendB, y: wall.b.y + v.uy * extendB },
      ...v
    };
  }

  function wallOpeningIntervals(wall) {
    const v = wallVector(wall), out = [];
    for (const o of state.objects) {
      if ((o.type !== 'door' && o.type !== 'window') || o.wallId !== wall.id) continue;
      const halfT = Math.min((o.width || 900) / Math.max(v.len, .000001) / 2, .45);
      out.push([clamp((o.t ?? .5) - halfT, 0, 1), clamp((o.t ?? .5) + halfT, 0, 1)]);
    }
    out.sort((a,b) => a[0]-b[0]);
    const merged=[];
    for(const it of out){
      const last=merged.at(-1);
      if(last && it[0] <= last[1]) last[1]=Math.max(last[1],it[1]);
      else merged.push([...it]);
    }
    return merged;
  }

  function wallVisibleSegments(wall) {
    const gaps = wallOpeningIntervals(wall), v = wallVector(wall), spans=[];
    let t0=0;
    for(const [ga,gb] of gaps){ if(ga>t0)spans.push([t0,ga]); t0=Math.max(t0,gb); }
    if(t0<1)spans.push([t0,1]);
    const h=(wall.thickness||150)/2;
    return spans.map(([a,b])=>{
      let p1={x:wall.a.x+v.dx*a,y:wall.a.y+v.dy*a}, p2={x:wall.a.x+v.dx*b,y:wall.a.y+v.dy*b};
      if(a<=1e-9 && wallEndpointConnected(wall,'a')) p1={x:p1.x-v.ux*h,y:p1.y-v.uy*h};
      if(b>=1-1e-9 && wallEndpointConnected(wall,'b')) p2={x:p2.x+v.ux*h,y:p2.y+v.uy*h};
      return [p1,p2];
    });
  }

  function dimensionGeometry(obj) {
    if(obj.wallId){const wall=state.objects.find(o=>o.id===obj.wallId&&o.type==='wall');if(wall){const p1=wallPointAt(wall,Number.isFinite(obj.t1)?obj.t1:0),p2=wallPointAt(wall,Number.isFinite(obj.t2)?obj.t2:1),v={x:p2.x-p1.x,y:p2.y-p1.y};const len=Math.max(.000001,Math.hypot(v.x,v.y)),nx=-v.y/len,ny=v.x/len,off=Number(obj.offset)||0;return{p1,p2,d1:{x:p1.x+nx*off,y:p1.y+ny*off},d2:{x:p2.x+nx*off,y:p2.y+ny*off},nx,ny,len,offset:off,associated:true,wall};}}
    if (obj.p1 && obj.p2) {
      const p1=obj.p1,p2=obj.p2, v={x:p2.x-p1.x,y:p2.y-p1.y};
      const len=Math.max(.000001,Math.hypot(v.x,v.y)), nx=-v.y/len,ny=v.x/len,off=Number(obj.offset)||0;
      return {p1,p2,d1:{x:p1.x+nx*off,y:p1.y+ny*off},d2:{x:p2.x+nx*off,y:p2.y+ny*off},nx,ny,len,offset:off,associated:false};
    }
    if (obj.a && obj.b) {
      const p1=obj.a,p2=obj.b,v={x:p2.x-p1.x,y:p2.y-p1.y},len=Math.max(.000001,Math.hypot(v.x,v.y));
      return {p1,p2,d1:p1,d2:p2,nx:-v.y/len,ny:v.x/len,len,offset:0,associated:false};
    }
    return null;
  }

  function rotate90(v, sign) { return { x: -v.y * sign, y: v.x * sign }; }

  function doorGeometry(obj) {
    const g=openingGeometry(obj); if(!g) return null;
    const hingeEnd=obj.hinge==='end';
    const hinge=hingeEnd?g.p2:g.p1, other=hingeEnd?g.p1:g.p2;
    const closed={x:(other.x-hinge.x)/g.width,y:(other.y-hinge.y)/g.width};
    const swing=obj.swing===-1?-1:1, open=rotate90(closed,swing);
    const leafEnd={x:hinge.x+open.x*g.width,y:hinge.y+open.y*g.width};
    return {...g,hinge,other,closed,open,leafEnd,swing};
  }

  function drawEditablePill(text,center,objectId,kind,value,{accent=false}={}){const styles=getComputedStyle(document.documentElement),fg=accent?styles.getPropertyValue('--selection').trim():styles.getPropertyValue('--text-2').trim(),bg=styles.getPropertyValue('--canvas').trim();ctx.save();ctx.font='11px system-ui';const tw=ctx.measureText(text).width,w=tw+12,h=20,x=center.x-w/2,y=center.y-h/2;ctx.fillStyle=bg;ctx.globalAlpha=.94;ctx.fillRect(x,y,w,h);ctx.globalAlpha=1;ctx.strokeStyle=accent?fg:styles.getPropertyValue('--border-strong').trim();ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);ctx.fillStyle=fg;ctx.textBaseline='middle';ctx.fillText(text,x+6,y+h/2+.2);ctx.restore();registerEditableLabel({objectId,kind,rect:{x,y,w,h},value});}
  function drawWallEditLabels(wall){if(!isSelectedId(wall.id)||selectionIds().size!==1||state.toolset!=='plan')return;const v=wallVector(wall),mid=wallPointAt(wall,.5),off=Math.max(230,(wall.thickness||150)*1.3),base=toScreenCss({x:mid.x+v.nx*off,y:mid.y+v.ny*off}),len=distance(wall.a,wall.b),ang=angleDeg(wall.a,wall.b);drawEditablePill(`${formatNumber(len,1)} mm`,{x:base.x-42,y:base.y},wall.id,'wallLength',len,{accent:true});drawEditablePill(`${formatNumber(ang,1)}°`,{x:base.x+48,y:base.y},wall.id,'wallAngle',ang,{accent:true});}

  function drawWallPlan(obj, color) {
    const selected=isSelectedId(obj.id), preview=isSelectionPreviewId(obj.id), hovered=obj.id===state.hoveredObjectId && !selected&&!preview;
    const styles=getComputedStyle(document.documentElement), stroke=selected?styles.getPropertyValue('--selection').trim():preview?styles.getPropertyValue('--hover').trim():hovered?styles.getPropertyValue('--hover').trim():color;
    ctx.save(); ctx.strokeStyle=stroke; ctx.lineWidth=Math.max(2,(obj.thickness||150)*state.camera.zoom); ctx.lineCap='butt'; ctx.lineJoin='miter';
    for(const [wa,wb] of wallVisibleSegments(obj)){const a=toScreenCss(wa),b=toScreenCss(wb);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    ctx.lineWidth=1; drawSelectionHandles(obj,[toScreenCss(obj.a),toScreenCss(obj.b)]); ctx.restore();
    if(selected){drawWallEditLabels(obj);drawWallConstraintHints(obj);}
  }

  function wallOutlineWorld(obj) {
    const c=wallCenterlineWithJoins(obj), h=(obj.thickness||150)/2;
    return [
      [{x:c.a.x+c.nx*h,y:c.a.y+c.ny*h},{x:c.b.x+c.nx*h,y:c.b.y+c.ny*h}],
      [{x:c.a.x-c.nx*h,y:c.a.y-c.ny*h},{x:c.b.x-c.nx*h,y:c.b.y-c.ny*h}]
    ];
  }

  function wallOutlineVisibleWorld(obj) {
    const v=wallVector(obj),h=(obj.thickness||150)/2,segments=wallVisibleSegments(obj),out=[];
    for(const [sa,sb] of segments){for(const sign of[-1,1])out.push([{x:sa.x+v.nx*h*sign,y:sa.y+v.ny*h*sign},{x:sb.x+v.nx*h*sign,y:sb.y+v.ny*h*sign}]);}
    return out;
  }

  function drawWallCad(obj, color) {
    const mapping = state.cadMapping || defaultCadMapping();
    const layer = mapping.wallLayer || 'WALL';
    if (!cadLayerVisible(layer)) return;
    const mode = mapping.wallRepresentation || 'outline';
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = isSelectedId(obj.id) ? 2 : isSelectionPreviewId(obj.id) ? 1.8 : 1.2;
    if (mode === 'outline' || mode === 'both') {
      for (const [wa,wb] of wallOutlineVisibleWorld(obj)) {
        const a=toScreenCss(wa),b=toScreenCss(wb);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
    if (mode === 'centerline' || mode === 'both') {
      const a=toScreenCss(obj.a),b=toScreenCss(obj.b); if (mode === 'both') ctx.setLineDash([5,4]);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
    }
    if (isSelectedId(obj.id)) drawSelectionHandles(obj, [toScreenCss(obj.a),toScreenCss(obj.b)]);
    ctx.restore();
  }

  function openingGeometry(obj) {
    const wall = state.objects.find(o => o.id === obj.wallId && o.type === 'wall');
    if (!wall) return null;
    const dx = wall.b.x - wall.a.x, dy = wall.b.y - wall.a.y;
    const len = Math.max(.000001, Math.hypot(dx,dy));
    const ux = dx/len, uy = dy/len;
    const t = clamp(obj.t ?? .5, 0, 1);
    const c = { x: wall.a.x + dx*t, y: wall.a.y + dy*t };
    const half = Math.min(obj.width || 900, len * .9) / 2;
    const p1 = { x:c.x-ux*half, y:c.y-uy*half };
    const p2 = { x:c.x+ux*half, y:c.y+uy*half };
    return { wall, center:c, p1, p2, ux, uy, nx:-uy, ny:ux, width:half*2 };
  }

  function drawOpeningPlan(obj, kind, color) {
    const g=openingGeometry(obj); if(!g)return;
    const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id), hovered=obj.id===state.hoveredObjectId&&!selected&&!preview;
    const styles=getComputedStyle(document.documentElement), stroke=selected?styles.getPropertyValue('--selection').trim():preview?styles.getPropertyValue('--hover').trim():hovered?styles.getPropertyValue('--hover').trim():color;
    ctx.save();ctx.strokeStyle=stroke;ctx.fillStyle=stroke;ctx.lineWidth=1.8;
    const wallHalf=(g.wall.thickness||150)/2;
    const jamb=(p)=>{const a=toScreenCss({x:p.x+g.nx*wallHalf,y:p.y+g.ny*wallHalf}),b=toScreenCss({x:p.x-g.nx*wallHalf,y:p.y-g.ny*wallHalf});ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();};
    jamb(g.p1); jamb(g.p2);
    if(kind==='door'){
      const d=doorGeometry(obj); if(d){const h=toScreenCss(d.hinge),leaf=toScreenCss(d.leafEnd);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(leaf.x,leaf.y);ctx.stroke();
        const a0=Math.atan2(d.closed.y,d.closed.x),a1=a0+d.swing*Math.PI/2;ctx.globalAlpha=.62;ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<=18;i++){const a=a0+(a1-a0)*(i/18),p=toScreenCss({x:d.hinge.x+Math.cos(a)*d.width,y:d.hinge.y+Math.sin(a)*d.width});if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();ctx.globalAlpha=1;}
    }else{
      for(const off of[-wallHalf*.34,0,wallHalf*.34]){const a=toScreenCss({x:g.p1.x+g.nx*off,y:g.p1.y+g.ny*off}),b=toScreenCss({x:g.p2.x+g.nx*off,y:g.p2.y+g.ny*off});ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    if(selected) drawOpeningHandles(obj,g);ctx.restore();
  }

  function drawOpeningCad(obj, kind, color) {
    const g=openingGeometry(obj);if(!g)return;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=isSelectedId(obj.id)?2:isSelectionPreviewId(obj.id)?1.8:1.2;
    if(kind==='door'){const d=doorGeometry(obj);if(d){const h=toScreenCss(d.hinge),leaf=toScreenCss(d.leafEnd);ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(leaf.x,leaf.y);ctx.stroke();const a0=Math.atan2(d.closed.y,d.closed.x),a1=a0+d.swing*Math.PI/2;ctx.globalAlpha=.55;ctx.beginPath();for(let i=0;i<=14;i++){const a=a0+(a1-a0)*i/14,p=toScreenCss({x:d.hinge.x+Math.cos(a)*d.width,y:d.hinge.y+Math.sin(a)*d.width});if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();ctx.globalAlpha=1;}}
    else {const off=Math.min(50,(g.wall.thickness||150)*.35);for(const sign of[-1,1]){const p1=toScreenCss({x:g.p1.x+g.nx*off*sign,y:g.p1.y+g.ny*off*sign}),p2=toScreenCss({x:g.p2.x+g.nx*off*sign,y:g.p2.y+g.ny*off*sign});ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();}}
    ctx.restore();
  }

  function drawDimension(obj, color) {
    const g=dimensionGeometry(obj); if(!g)return;
    const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview;
    const styles=getComputedStyle(document.documentElement),stroke=selected?styles.getPropertyValue('--selection').trim():preview?styles.getPropertyValue('--hover').trim():hovered?styles.getPropertyValue('--hover').trim():color;
    const p1=toScreenCss(g.p1),p2=toScreenCss(g.p2),d1=toScreenCss(g.d1),d2=toScreenCss(g.d2);
    ctx.save();ctx.strokeStyle=stroke;ctx.fillStyle=stroke;ctx.lineWidth=1.15;
    const ext=8/Math.max(.000001,state.camera.zoom);const e1=toScreenCss({x:g.d1.x+g.nx*(g.offset>=0?ext:-ext),y:g.d1.y+g.ny*(g.offset>=0?ext:-ext)}),e2=toScreenCss({x:g.d2.x+g.nx*(g.offset>=0?ext:-ext),y:g.d2.y+g.ny*(g.offset>=0?ext:-ext)});
    ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(e1.x,e1.y);ctx.moveTo(p2.x,p2.y);ctx.lineTo(e2.x,e2.y);ctx.stroke();
    ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(d1.x,d1.y);ctx.lineTo(d2.x,d2.y);ctx.stroke();
    const tick=5,ang=Math.atan2(d2.y-d1.y,d2.x-d1.x)+Math.PI/4;for(const d of[d1,d2]){ctx.beginPath();ctx.moveTo(d.x-Math.cos(ang)*tick,d.y-Math.sin(ang)*tick);ctx.lineTo(d.x+Math.cos(ang)*tick,d.y+Math.sin(ang)*tick);ctx.stroke();}
    const mx=(d1.x+d2.x)/2,my=(d1.y+d2.y)/2,text=`${formatNumber(g.len,1)} mm`;ctx.font='11px system-ui';const tw=ctx.measureText(text).width;ctx.fillStyle=styles.getPropertyValue('--canvas').trim();ctx.fillRect(mx-tw/2-5,my-10,tw+10,18);ctx.fillStyle=stroke;ctx.fillText(text,mx-tw/2,my+3);if(selected)registerEditableLabel({objectId:obj.id,kind:'dimensionLength',rect:{x:mx-tw/2-5,y:my-10,w:tw+10,h:18},value:g.len});
    if(selected)drawDimensionHandles(obj,g);ctx.restore();
  }

  function drawSelectionHandles(obj, points) {
    if(!isSelectedId(obj.id)||selectionIds().size!==1)return;const color=getComputedStyle(document.documentElement).getPropertyValue('--selection').trim();ctx.save();ctx.fillStyle=color;ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();ctx.lineWidth=1.5;
    for(const p of points){ctx.beginPath();ctx.rect(p.x-4,p.y-4,8,8);ctx.fill();ctx.stroke();}ctx.restore();
  }

  function drawOpeningHandles(obj,g){
    if(!isSelectedId(obj.id)||selectionIds().size!==1)return;const color=getComputedStyle(document.documentElement).getPropertyValue('--selection').trim();const bg=getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();ctx.save();ctx.fillStyle=color;ctx.strokeStyle=bg;ctx.lineWidth=1.5;for(const p of[toScreenCss(g.p1),toScreenCss(g.p2)]){ctx.beginPath();ctx.rect(p.x-5,p.y-5,10,10);ctx.fill();ctx.stroke();}const c=toScreenCss(g.center);ctx.beginPath();ctx.arc(c.x,c.y,5,0,Math.PI*2);ctx.fill();ctx.stroke();
    const labelWorld={x:g.center.x+g.nx*(Math.max(120,(g.wall.thickness||150)*.9)),y:g.center.y+g.ny*(Math.max(120,(g.wall.thickness||150)*.9))},lp=toScreenCss(labelWorld),text=`${formatNumber(g.width,0)} mm`;ctx.font='11px system-ui';const tw=ctx.measureText(text).width;ctx.fillStyle=bg;ctx.globalAlpha=.92;ctx.fillRect(lp.x-tw/2-5,lp.y-10,tw+10,18);ctx.globalAlpha=1;ctx.fillStyle=color;ctx.fillText(text,lp.x-tw/2,lp.y+3);registerEditableLabel({objectId:obj.id,kind:'openingWidth',rect:{x:lp.x-tw/2-5,y:lp.y-10,w:tw+10,h:18},value:g.width});ctx.restore();
  }

  function drawDimensionHandles(obj,g){
    if(selectionIds().size!==1)return;const color=getComputedStyle(document.documentElement).getPropertyValue('--selection').trim(),bg=getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();ctx.save();ctx.fillStyle=color;ctx.strokeStyle=bg;ctx.lineWidth=1.5;if(!g.associated)for(const p of[toScreenCss(g.p1),toScreenCss(g.p2)]){ctx.beginPath();ctx.arc(p.x,p.y,4.5,0,Math.PI*2);ctx.fill();ctx.stroke();}const c=toScreenCss({x:(g.d1.x+g.d2.x)/2,y:(g.d1.y+g.d2.y)/2});ctx.beginPath();ctx.moveTo(c.x,c.y-5);ctx.lineTo(c.x+5,c.y);ctx.lineTo(c.x,c.y+5);ctx.lineTo(c.x-5,c.y);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  }

  function drawPreview() {
    let start=null,end=null,color=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),width=1.5;
    if(state.activeTool==='line'||state.activeTool==='wall'){start=state.drawStart;end=state.previewEnd;if(state.activeTool==='wall')width=Math.max(2,currentWallThickness()*state.camera.zoom);}
    else if(state.activeTool==='measure'){start=state.measureStart;end=state.previewEnd;color=getComputedStyle(document.documentElement).getPropertyValue('--dimension').trim();}
    if(!start||!end)return;
    if(state.activeTool==='measure'){const tmp={p1:start,p2:end,offset:Math.max(250,Math.min(600,distance(start,end)*.08))};drawDimension(tmp,color);return;}
    const a=toScreenCss(start),b=toScreenCss(end);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=.72;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();const text=`${formatNumber(distance(start,end),1)} mm · ${formatNumber(angleDeg(start,end),1)}°`;ctx.font='11px system-ui';ctx.fillStyle=color;ctx.fillText(text,b.x+8,b.y-8);ctx.restore();
  }

  function drawOpeningPreview() {
    const p=state.previewOpening;if(!p||!['door','window'].includes(state.activeTool))return;const temp={id:'preview',type:state.activeTool,wallId:p.wall.id,t:p.t,width:currentOpeningWidth(),hinge:'start',swing:1};const styles=getComputedStyle(document.documentElement),color=state.activeTool==='door'?styles.getPropertyValue('--door').trim():styles.getPropertyValue('--window').trim();ctx.save();ctx.globalAlpha=.65;drawOpeningPlan(temp,state.activeTool,color);ctx.restore();
  }

  function drawCalibrationPreview(){const c=state.calibration;if(!c?.p1)return;const p2=c.p2||state.previewEnd;if(!p2)return;const a=toScreenCss(c.p1),b=toScreenCss(p2);ctx.save();ctx.strokeStyle='#ffb55a';ctx.fillStyle='#ffb55a';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);for(const p of[a,b]){ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();}ctx.restore();}

  function applyNumericLabelEdit(label,value){if(!label||!Number.isFinite(value))return;const obj=state.objects.find(o=>o.id===label.objectId);if(!obj)return;if(label.kind==='openingWidth'&&(obj.type==='door'||obj.type==='window')){if(value<=0)return;pushHistory();obj.width=value;markDirty(true);rebuildObjectSnapIndex();updateAll();return;}if(label.kind==='wallLength'&&obj.type==='wall'){if(value<=0||!breakWallConstraintForEdit(obj,'length'))return;const ang=angleDeg(obj.a,obj.b),anchor=constrainedEndpointAnchor(obj,'a');setWallAngleAndLength(obj,ang,value,anchor);enforceWallConstraints(obj,{changed:anchor==='a'?'b':'a'});syncDependentsOfWall(obj.id);refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();return;}if(label.kind==='wallAngle'&&obj.type==='wall'){if(!breakWallConstraintForEdit(obj,'angle'))return;const len=distance(obj.a,obj.b),anchor=constrainedEndpointAnchor(obj,'a');setWallAngleAndLength(obj,value,len,anchor);enforceWallConstraints(obj,{changed:anchor==='a'?'b':'a'});syncDependentsOfWall(obj.id);refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();return;}if(label.kind==='dimensionLength'&&obj.type==='dimension'){const g=dimensionGeometry(obj);if(!g?.associated||value<=0)return;const wall=g.wall,span=Math.abs((obj.t2??1)-(obj.t1??0));if(span<1e-6)return;if(!breakWallConstraintForEdit(wall,'length'))return;const target=value/span,ang=angleDeg(wall.a,wall.b),anchor=constrainedEndpointAnchor(wall,'a');setWallAngleAndLength(wall,ang,target,anchor);enforceWallConstraints(wall,{changed:anchor==='a'?'b':'a'});syncDependentsOfWall(wall.id);refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();}}
  function beginCanvasNumberEdit(label){host.querySelector('.canvas-number-editor')?.remove();const input=document.createElement('input');input.className='canvas-number-editor';input.type='number';input.step='0.01';input.value=String(Math.round(Number(label.value)*100)/100);input.style.left=`${Math.max(4,label.rect.x)}px`;input.style.top=`${Math.max(4,label.rect.y-5)}px`;input.style.width=`${Math.max(92,label.rect.w+24)}px`;let cancelled=false,committed=false;const commit=()=>{if(committed||cancelled)return;committed=true;const value=Number(input.value);input.remove();applyNumericLabelEdit(label,value);};input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}else if(e.key==='Escape'){e.preventDefault();cancelled=true;input.remove();host.focus();}});input.addEventListener('blur',commit);host.appendChild(input);input.focus();input.select();}
  function onCanvasDoubleClick(e){if(isCompactViewer())return;const s=fromPointerEvent(e),label=hitEditableLabel(s);if(!label)return;e.preventDefault();e.stopPropagation();beginCanvasNumberEdit(label);}

  function currentWallThickness(){const input=document.querySelector('[data-context="thickness"]');const n=Number(input?.value);if(Number.isFinite(n)&&n>0)state.toolSettings.wallThickness=n;return state.toolSettings.wallThickness;}
  function currentOpeningWidth(){const input=document.querySelector('[data-context="width"]');const n=Number(input?.value);const key=state.activeTool==='window'?'windowWidth':'doorWidth';if(Number.isFinite(n)&&n>0)state.toolSettings[key]=n;return state.toolSettings[key];}

  function updateContextBar(){
    const keys={select:'context.select',line:'context.line',wall:'context.wall',door:'context.door',window:'context.window',space:'context.space',region:'context.region',measure:'context.measure',delete:'context.delete'};
    dom.contextToolName.textContent=t(keys[state.activeTool]||`tool.${state.activeTool}`);dom.contextFields.innerHTML='';let hint=t('hint.select');
    if(state.calibration){dom.contextToolName.textContent=t('context.calibration');dom.contextHint.textContent=state.calibration.p1?t('hint.calibrationSecond'):t('hint.calibrationFirst');return;}
    if(state.activeTool==='line'||state.activeTool==='wall'){
      dom.contextFields.appendChild(contextNumberField(t('context.length'),'length','','mm'));dom.contextFields.appendChild(contextNumberField(t('context.angle'),'angle','','°'));
      if(state.activeTool==='wall')dom.contextFields.appendChild(contextNumberField(t('context.thickness'),'thickness',String(state.toolSettings.wallThickness),'mm'));
      hint=state.drawStart?t('hint.segmentEnd'):t('hint.segmentStart');
    }else if(state.activeTool==='door'||state.activeTool==='window'){
      const value=state.activeTool==='door'?state.toolSettings.doorWidth:state.toolSettings.windowWidth;dom.contextFields.appendChild(contextNumberField(t('context.width'),'width',String(value),'mm'));hint=t('hint.opening');
    }else if(state.activeTool==='measure'){hint=state.measureStart?t('hint.measureSecond'):t('hint.measureFirst');}
    else if(state.activeTool==='delete'){hint=t('hint.delete');}
    if(state.activeTool==='select'){const selected=state.objects.find(o=>o.id===state.selectedObjectId);if(selected?.type==='wall')hint=t('hint.selectedWall');else if(selected?.type==='door')hint=t('hint.selectedDoor');else if(selected?.type==='window')hint=t('hint.selectedWindow');else if(selected?.type==='dimension')hint=t('hint.selectedDimension');else if(selected?.type==='space')hint=t('hint.selectedSpace');}
    dom.contextHint.textContent=hint;
  }

  function contextNumberField(label,key,value,unit){const wrap=document.createElement('div');wrap.className='context-field';const lab=document.createElement('label');lab.textContent=label;const input=document.createElement('input');input.type='number';input.step='0.01';input.value=value;input.dataset.context=key;const u=document.createElement('span');u.className='context-unit';u.textContent=unit;
    input.addEventListener('input',()=>{if(key==='thickness'){const n=Number(input.value);if(Number.isFinite(n)&&n>0)state.toolSettings.wallThickness=n;}if(key==='width'){const n=Number(input.value);if(Number.isFinite(n)&&n>0){if(state.activeTool==='door')state.toolSettings.doorWidth=n;else if(state.activeTool==='window')state.toolSettings.windowWidth=n;}render();}});
    input.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&(state.activeTool==='line'||state.activeTool==='wall')&&state.drawStart){e.preventDefault();commitNumericSegment();}});wrap.append(lab,input,u);return wrap;}

  function commitNumericSegment(){if(!state.drawStart)return;const lengthInput=document.querySelector('[data-context="length"]');const angleInput=document.querySelector('[data-context="angle"]');let len=Number(lengthInput?.value),ang=Number(angleInput?.value);if(!Number.isFinite(len)||len<=0)len=state.previewEnd?distance(state.drawStart,state.previewEnd):NaN;if(!Number.isFinite(ang))ang=state.previewEnd?angleDeg(state.drawStart,state.previewEnd):0;if(!Number.isFinite(len)||len<=0)return;const end={x:state.drawStart.x+Math.cos(rad(ang))*len,y:state.drawStart.y+Math.sin(rad(ang))*len};commitSegment(state.drawStart,end,state.activeTool);}

  function renderToolRail(){
    dom.toolRail.innerHTML='';
    if(state.toolset==='plan'){
      for(const item of planToolCatalog){
        if(item.separator){const s=document.createElement('div');s.className='tool-separator';dom.toolRail.appendChild(s);continue;}
        const b=document.createElement('button');b.className=`tool-direct ${state.activeTool===item.id?'active':''}`;b.disabled=!item.ready;b.innerHTML=`<span class="tool-icon ui-icon icon-${item.icon}" aria-hidden="true"></span><span class="tool-text">${escapeHtml(t(item.labelKey))}</span>`;b.setAttribute('aria-label',t(item.labelKey));if(item.id==='select')applyShortcutMetadata(b,'select','tooltip.selectTool',item.labelKey);else if(item.tooltipKey){b.dataset.tooltipTitleKey=item.labelKey;b.dataset.tooltipKey=item.tooltipKey;}b.addEventListener('click',()=>{if(item.ready)setTool(item.id,'plan');});dom.toolRail.appendChild(b);
      }
    }else{
      for(const cat of cadCategories){const b=document.createElement('button');b.className=`tool-category ${state.activeCategory===cat.id?'active':''}`;b.dataset.category=cat.id;b.dataset.categoryKey=cat.labelKey;b.innerHTML=`<span class="tool-icon ui-icon icon-${cat.icon}" aria-hidden="true"></span><span class="tool-text">${escapeHtml(t(cat.labelKey))}</span>`;b.setAttribute('aria-label',t(cat.labelKey));b.addEventListener('click',()=>openCategory(cat.id,b));dom.toolRail.appendChild(b);}
    }
  }

  function setTool(tool,category=null){
    if(state.toolset==='cad'&&['wall','door','window'].includes(tool)&&!state.cadMapping){state.pendingToolAfterMapping={tool,category:category||'architecture'};openMappingDialog('tool');return;}
    state.activeTool=tool;if(category&&category!=='plan')state.activeCategory=category;state.drawStart=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;state.calibration=null;state.regionDrag=null;state.snapIndicator=null;host.dataset.tool=tool;dom.toolPopover.hidden=true;renderToolRail();updateContextBar();renderProperties();render();
  }

  function openCategory(category,button){state.activeCategory=category;renderToolRail();const items=cadToolCatalog[category]||[];dom.toolPopover.innerHTML=`<div class="tool-popover-title">${escapeHtml(t(button.dataset.categoryKey))}</div>`;for(const item of items){const b=document.createElement('button');b.className=`tool-item ${state.activeTool===item.id?'active':''}`;b.disabled=!item.ready;const note=item.ready?(item.note||''):t('tool.planned');b.innerHTML=`<span>${escapeHtml(t(item.labelKey))}</span><span class="tool-item-note">${escapeHtml(note)}</span>`;if(item.ready&&item.note)b.dataset.shortcut=item.note;b.addEventListener('click',()=>setTool(item.id,category));dom.toolPopover.appendChild(b);}const top=Math.min(button.offsetTop,Math.max(8,host.clientHeight-220));dom.toolPopover.style.top=`${top}px`;dom.toolPopover.hidden=false;}

  function switchToolset(next,{skipMapping=false,historyMode='push'}={}){
    if(next==='cad'&&!skipMapping&&hasSemanticObjects()&&!state.cadMapping){openMappingDialog('switch-cad');return;}
    const sameWorkspace=next===state.toolset&&state.view==='workspace';
    const changed=next!==state.toolset;
    state.toolset=next;dom.appShell.classList.toggle('plan-tools',next==='plan');dom.appShell.classList.toggle('cad-tools',next==='cad');dom.planToolsBtn.classList.toggle('active',next==='plan');dom.cadToolsBtn.classList.toggle('active',next==='cad');dom.commandBar.hidden=next!=='cad';
    if(changed){state.activeCategory='select';state.activeTool='select';state.drawStart=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;host.dataset.tool='select';dom.toolPopover.hidden=true;}
    updateEmptyState();renderToolRail();renderPrimaryPanel();renderProperties();updateContextBar();render();showWorkspace({historyMode:sameWorkspace?'none':historyMode});
  }

  function updateEmptyState(){const plan=state.toolset==='plan',compact=isCompactViewer();dom.emptyKicker.textContent=plan?'Plan Tools':'CAD Tools';dom.emptyTitle.textContent=t(plan?'empty.planTitle':'empty.cadTitle');dom.emptyCopy.textContent=t(compact?'empty.viewerCopy':plan?'empty.planCopy':'empty.cadCopy');dom.emptyPrimaryBtn.hidden=compact;dom.emptyPrimaryBtn.textContent=t(plan?'empty.planPrimary':'empty.cadPrimary');dom.emptyOpenBtn.textContent=t(compact?(plan?'empty.planViewerOpen':'empty.cadViewerOpen'):plan?'empty.planSecondary':'empty.cadSecondary');dom.primaryInspectorTab.textContent=t(plan?'tab.objects':'tab.layers');dom.primaryPanelTitle.textContent=t(plan?'panel.planObjects':'panel.cadLayers');dom.primaryPanelSubtitle.textContent=t(plan?'panel.planObjectsSub':'panel.cadLayersSub');}

  function defaultCadMapping(){return{wallRepresentation:'outline',wallLayer:'WALL',doorLayer:'DOOR',windowLayer:'WINDOW',dimensionLayer:'DIM'};}
  function openMappingDialog(action){const m=state.cadMapping||defaultCadMapping();state.mappingPendingAction=action;dom.wallRepresentation.value=m.wallRepresentation;dom.wallLayerInput.value=m.wallLayer;dom.doorLayerInput.value=m.doorLayer;dom.windowLayerInput.value=m.windowLayer;dom.dimensionLayerInput.value=m.dimensionLayer;dom.mappingBackdrop.hidden=false;setTimeout(()=>dom.wallRepresentation.focus(),0);}
  function applyMapping(){markDirty(true);state.cadMapping={wallRepresentation:dom.wallRepresentation.value,wallLayer:(dom.wallLayerInput.value||'WALL').trim(),doorLayer:(dom.doorLayerInput.value||'DOOR').trim(),windowLayer:(dom.windowLayerInput.value||'WINDOW').trim(),dimensionLayer:(dom.dimensionLayerInput.value||'DIM').trim()};for(const name of Object.values({w:state.cadMapping.wallLayer,d:state.cadMapping.doorLayer,wi:state.cadMapping.windowLayer,di:state.cadMapping.dimensionLayer}))if(!state.cadLayerVisibility.has(name))state.cadLayerVisibility.set(name,true);const action=state.mappingPendingAction;state.mappingPendingAction=null;dom.mappingBackdrop.hidden=true;renderPrimaryPanel();renderProperties();render();if(action==='switch-cad')switchToolset('cad',{skipMapping:true});else if(action==='export')exportDxfNow();else if(action==='tool'){const p=state.pendingToolAfterMapping;state.pendingToolAfterMapping=null;if(p)setTool(p.tool,p.category);}}
  function cancelMapping(){const action=state.mappingPendingAction;state.mappingPendingAction=null;state.pendingToolAfterMapping=null;dom.mappingBackdrop.hidden=true;if(action==='switch-cad'){dom.planToolsBtn.classList.add('active');dom.cadToolsBtn.classList.remove('active');}}

  function historySnapshot(){return JSON.stringify({objects:state.objects,drawingRegions:state.drawingRegions,cadLayerVisibility:[...state.cadLayerVisibility],activeCadLayer:state.activeCadLayer,baseAxisAngle:state.baseAxisAngle,baseAxisWallId:state.baseAxisWallId,dirty:state.dirty});}
  function restoreHistorySnapshot(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed)){state.objects=parsed;state.drawingRegions=[];}else{state.objects=parsed.objects||[];state.drawingRegions=parsed.drawingRegions||[];if(Array.isArray(parsed.cadLayerVisibility))state.cadLayerVisibility=new Map(parsed.cadLayerVisibility);if(parsed.activeCadLayer)state.activeCadLayer=parsed.activeCadLayer;state.baseAxisAngle=Number(parsed.baseAxisAngle)||0;state.baseAxisWallId=parsed.baseAxisWallId||null;if('dirty' in parsed)state.dirty=Boolean(parsed.dirty);}state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectedRegionId=null;refreshSpaces();rebuildObjectSnapIndex();}
  function pushHistory(){state.history.push(historySnapshot());if(state.history.length>60)state.history.shift();state.future=[];updateUndoRedo();}
  function undo(){if(!state.history.length)return;state.future.push(historySnapshot());restoreHistorySnapshot(state.history.pop());updateAll();}
  function redo(){if(!state.future.length)return;state.history.push(historySnapshot());restoreHistorySnapshot(state.future.pop());updateAll();}
  function updateUndoRedo(){dom.undoBtn.disabled=!state.history.length;dom.redoBtn.disabled=!state.future.length;}

  function commitSegment(a,b,type){if(distance(a,b)<.001)return;pushHistory();let obj;if(type==='wall'){obj={id:uid('wall'),type:'wall',layerId:'walls',a:{...a},b:{...b},thickness:currentWallThickness(),attachments:{}};}else{obj={id:uid('cadLine'),type:state.toolset==='cad'?'cadLine':'line',cadLayer:state.activeCadLayer||'0',layerId:'drawing',a:{...a},b:{...b}};if(obj.type==='cadLine'&&!state.cadLayerVisibility.has(obj.cadLayer))state.cadLayerVisibility.set(obj.cadLayer,true);}state.objects.push(obj);if(obj.type==='wall'){refreshSpaces();}state.selectedObjectId=obj.id;state.drawStart={...obj.b};state.previewEnd={...obj.b};markDirty(true);rebuildObjectSnapIndex();updateAll();}
  function commitMeasurement(a,b){const len=distance(a,b);if(len<.001)return;let obj=null;if(state.toolset==='plan'){let best=null,bestScore=Infinity;for(const wall of state.objects.filter(o=>o.type==='wall')){const p1=projectPointToSegment(a,wall.a,wall.b),p2=projectPointToSegment(b,wall.a,wall.b),tol=Math.max((wall.thickness||150),18/state.camera.zoom);if(p1.distance<=tol&&p2.distance<=tol){const score=p1.distance+p2.distance;if(score<bestScore){bestScore=score;best={wall,t1:p1.t,t2:p2.t,p1:p1.point,p2:p2.point};}}}if(!best){alert(t('alert.dimensionNeedsWall'));state.measureStart=null;state.previewEnd=null;updateContextBar();render();return;}const attachedLen=distance(best.p1,best.p2);obj={id:uid('dimension'),type:'dimension',layerId:'dimensions',wallId:best.wall.id,t1:best.t1,t2:best.t2,offset:Math.max(250,Math.min(600,attachedLen*.08))};}else obj={id:uid('dimension'),type:'dimension',layerId:'dimensions',p1:{...a},p2:{...b},offset:Math.max(250,Math.min(600,len*.08))};pushHistory();state.objects.push(obj);state.selectedObjectId=obj.id;state.measureStart=null;state.previewEnd=null;markDirty(true);rebuildObjectSnapIndex();updateAll();}

  function nearestWallProjection(p){let best=null,bestD=Infinity;for(const wall of state.objects.filter(o=>o.type==='wall')){const pr=projectPointToSegment(p,wall.a,wall.b);const threshold=Math.max((wall.thickness||150)/2,18/state.camera.zoom);if(pr.distance<threshold&&pr.distance<bestD){bestD=pr.distance;best={wall,t:pr.t,point:pr.point,distance:pr.distance};}}return best;}
  function projectPointToSegment(p,a,b){const vx=b.x-a.x,vy=b.y-a.y,wx=p.x-a.x,wy=p.y-a.y,c2=vx*vx+vy*vy;if(!c2)return{t:0,point:{...a},distance:distance(p,a)};const tt=clamp((wx*vx+wy*vy)/c2,0,1);const q={x:a.x+tt*vx,y:a.y+tt*vy};return{t:tt,point:q,distance:distance(p,q)};}

  function findWallAttachment(point,selfWallId){let best=null,bestD=Math.max(20,10/state.camera.zoom);for(const wall of state.objects){if(wall.type!=='wall'||wall.id===selfWallId)continue;const pr=projectPointToSegment(point,wall.a,wall.b);if(pr.distance<bestD){bestD=pr.distance;best={wallId:wall.id,t:pr.t};}}return best;}
  function attachWallEndpoint(wall,endpoint){
    if(!wall||wall.type!=='wall'||!['a','b'].includes(endpoint))return false;
    const candidate=endpointConstraintCandidate(wall[endpoint],wall.id);
    wall.attachments=wall.attachments||{};
    if(candidate){
      wall.attachments[endpoint]={wallId:candidate.wallId,t:candidate.t,kind:candidate.kind,targetEndpoint:candidate.targetEndpoint||null};
      wall[endpoint]={...candidate.point};
      return true;
    }
    delete wall.attachments[endpoint];
    return false;
  }
  function detachWallConnections(wall){if(!wall||wall.type!=='wall')return;wall.attachments={};}
  function enforceWallAttachments(wall){if(!wall?.attachments)return;for(const endpoint of['a','b']){const att=wall.attachments[endpoint],target=att&&state.objects.find(o=>o.id===att.wallId&&o.type==='wall');if(target)wall[endpoint]=wallPointAt(target,att.t);}}
  function attachTouchingWallEndpoints(wall){if(!wall||wall.type!=='wall')return false;let changed=false;for(const endpoint of['a','b'])changed=attachWallEndpoint(wall,endpoint)||changed;return changed;}
  function syncDependentsOfWall(parentId,visited=new Set()){if(visited.has(parentId))return;visited.add(parentId);const parent=state.objects.find(o=>o.id===parentId&&o.type==='wall');if(!parent)return;for(const wall of state.objects){if(wall.type!=='wall'||wall.id===parentId||!wall.attachments)continue;let changed=false;for(const endpoint of['a','b']){const att=wall.attachments?.[endpoint];if(att?.wallId===parentId){wall[endpoint]=wallPointAt(parent,att.t);changed=true;}}if(changed)syncDependentsOfWall(wall.id,visited);}refreshSpaces();}

  function detectClosedWallFaces(){
    const walls=state.objects.filter(o=>o.type==='wall');if(walls.length<3)return[];
    const splits=new Map(walls.map(w=>[w.id,new Set([0,1])]));
    for(let i=0;i<walls.length;i++)for(let j=i+1;j<walls.length;j++){const x=segmentIntersection(walls[i].a,walls[i].b,walls[j].a,walls[j].b);if(!x)continue;splits.get(walls[i].id).add(x.t);splits.get(walls[j].id).add(x.u);}
    const tol=2,keyOf=p=>`${Math.round(p.x/tol)},${Math.round(p.y/tol)}`,nodes=new Map(),adj=new Map(),edgeWall=new Map();
    const nodeFor=p=>{const k=keyOf(p);if(!nodes.has(k))nodes.set(k,{x:Math.round(p.x/tol)*tol,y:Math.round(p.y/tol)*tol});if(!adj.has(k))adj.set(k,new Set());return k;};
    for(const wall of walls){const ts=[...splits.get(wall.id)].sort((a,b)=>a-b);for(let i=1;i<ts.length;i++){if(ts[i]-ts[i-1]<1e-8)continue;const p1=wallPointAt(wall,ts[i-1]),p2=wallPointAt(wall,ts[i]),a=nodeFor(p1),b=nodeFor(p2);if(a===b)continue;adj.get(a).add(b);adj.get(b).add(a);edgeWall.set([a,b].sort().join('|'),wall.id);}}
    for(const[k,set]of adj){const p=nodes.get(k);adj.set(k,[...set].sort((ka,kb)=>{const a=nodes.get(ka),b=nodes.get(kb);return Math.atan2(a.y-p.y,a.x-p.x)-Math.atan2(b.y-p.y,b.x-p.x);}));}
    const visited=new Set(),faces=[];
    for(const[u,neighbors]of adj)for(const v0 of neighbors){const start=`${u}>${v0}`;if(visited.has(start))continue;let a=u,b=v0,poly=[],wallIds=new Set(),guard=0,closed=false;while(guard++<2000){const dir=`${a}>${b}`;if(visited.has(dir)&&dir!==start)break;visited.add(dir);poly.push(nodes.get(a));wallIds.add(edgeWall.get([a,b].sort().join('|')));const list=adj.get(b)||[],idx=list.indexOf(a);if(idx<0||!list.length)break;const c=list[(idx-1+list.length)%list.length];a=b;b=c;if(`${a}>${b}`===start){closed=true;break;}}if(!closed||poly.length<3)continue;const area=polygonArea(poly);if(area>10000)faces.push({polygon:poly,area,wallIds:[...wallIds].filter(Boolean)});}
    return faces.sort((a,b)=>a.area-b.area);
  }
  function faceAtPoint(p){return detectClosedWallFaces().find(f=>pointInPolygon(p,f.polygon))||null;}
  function refreshSpaces(){const spaces=state.objects.filter(o=>o.type==='space');if(!spaces.length)return;const faces=detectClosedWallFaces();for(const space of spaces){const face=faces.find(f=>pointInPolygon(space.seed||polygonCentroid(space.polygon||[]),f.polygon));if(face){space.polygon=face.polygon.map(p=>({...p}));space.wallIds=[...face.wallIds];space.areaM2=face.area/1e6;space.invalid=false;}else space.invalid=true;}}
  function commitSpace(p){const face=faceAtPoint(p);if(!face){alert(t('alert.noClosedSpace'));return;}const existing=state.objects.find(o=>o.type==='space'&&o.polygon?.length&&pointInPolygon(p,o.polygon));if(existing){state.selectedObjectId=existing.id;renderProperties();render();return;}pushHistory();const obj={id:uid('space'),type:'space',layerId:'spaces',spaceUuid:makeStableUuid(),seed:{...p},polygon:face.polygon.map(q=>({...q})),wallIds:[...face.wallIds],areaM2:face.area/1e6,invalid:false};state.objects.push(obj);state.selectedObjectId=obj.id;markDirty(true);updateAll();}
  function commitOpening(kind,projection){if(!projection){alert(t('alert.noWallForOpening'));return;}pushHistory();const width=kind==='door'?state.toolSettings.doorWidth:state.toolSettings.windowWidth;const obj={id:uid(kind),type:kind,layerId:kind==='door'?'doors':'windows',wallId:projection.wall.id,t:projection.t,width};if(kind==='door'){obj.hinge='start';obj.swing=1;}state.objects.push(obj);state.selectedObjectId=obj.id;markDirty(true);rebuildObjectSnapIndex();updateAll();}

  function collectObjectSnapPoints(){const pts=[];for(const o of state.objects){if(o.a)pts.push({x:o.a.x,y:o.a.y,objectId:o.id,kind:'endpoint'});if(o.b)pts.push({x:o.b.x,y:o.b.y,objectId:o.id,kind:'endpoint'});if(o.center)pts.push({x:o.center.x,y:o.center.y,objectId:o.id,kind:'center'});if(o.point)pts.push({x:o.point.x,y:o.point.y,objectId:o.id,kind:'point'});if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);if(g){pts.push({...g.p1,objectId:o.id,kind:'opening'},{...g.p2,objectId:o.id,kind:'opening'},{...g.center,objectId:o.id,kind:'center'});}}if(o.type==='dimension'){const g=dimensionGeometry(o);if(g)pts.push({...g.p1,objectId:o.id,kind:'dimension'},{...g.p2,objectId:o.id,kind:'dimension'});}}return pts;}
  function rebuildObjectSnapIndex(){const pts=collectObjectSnapPoints();if(!pts.length){state.objectSnapIndex=null;return;}const cellW=1000,cellH=1000,cells=new Map();for(const q of pts){const gx=Math.floor(q.x/cellW),gy=Math.floor(q.y/cellH),k=`${gx},${gy}`;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(q);}state.objectSnapIndex={minx:0,miny:0,cellW,cellH,cells};}
  function queryObjectSnapIndex(p,threshold,test){const idx=state.objectSnapIndex;if(!idx)return;const gx=Math.floor((p.x-idx.minx)/idx.cellW),gy=Math.floor((p.y-idx.miny)/idx.cellH),rx=Math.max(1,Math.ceil(threshold/idx.cellW)),ry=Math.max(1,Math.ceil(threshold/idx.cellH));for(let dx=-rx;dx<=rx;dx++)for(let dy=-ry;dy<=ry;dy++){const bucket=idx.cells.get(`${gx+dx},${gy+dy}`);if(bucket)for(const q of bucket)test(q);}}

  function nearestSnap(p,excludeObjectId=null){
    state.snapIndicator=null;
    if(!state.snap)return p;
    const threshold=10/state.camera.zoom;let best=null,bestD=threshold;
    const test=(q,kind=q.kind||'endpoint')=>{if(excludeObjectId&&q.objectId===excludeObjectId)return;const d=distance(p,q);if(d<bestD){bestD=d;best={x:q.x,y:q.y,kind,objectId:q.objectId||null};}};
    if(state.objectSnapIndex)queryObjectSnapIndex(p,threshold,q=>test(q,q.kind));else for(const o of state.objects){if(o.a)test({...o.a,objectId:o.id},'endpoint');if(o.b)test({...o.b,objectId:o.id},'endpoint');}
    const wantsWallProjection=state.activeTool==='wall'||(state.dragEdit&&state.objects.find(o=>o.id===state.dragEdit.objectId)?.type==='wall'&&['a','b'].includes(state.dragEdit.mode));
    if(wantsWallProjection){for(const wall of state.objects){if(wall.type!=='wall'||wall.id===excludeObjectId)continue;const pr=projectPointToSegment(p,wall.a,wall.b);if(pr.distance<bestD)test({...pr.point,objectId:wall.id},'wall');}}
    for(const ref of state.references){if(!ref.visible||ref.type!=='dxf'||!ref.snapIndex)continue;const local=referenceWorldToLocal(ref,p);const{minx,miny,cellW,cellH,cells}=ref.snapIndex;const gx=Math.floor((local.x-minx)/cellW),gy=Math.floor((local.y-miny)/cellH);const lt=threshold/Math.max(.000001,ref.scale),rx=Math.max(1,Math.ceil(lt/cellW)),ry=Math.max(1,Math.ceil(lt/cellH));for(let dx=-rx;dx<=rx;dx++)for(let dy=-ry;dy<=ry;dy++){const bucket=cells.get(`${gx+dx},${gy+dy}`);if(!bucket)continue;for(const q of bucket){if(ref.visibleLayers&&!ref.visibleLayers.has(q.layer||'0'))continue;const w=referenceLocalToWorld(ref,q);test({...w,objectId:null},'reference');}}}
    if(best){state.snapIndicator=best;return{x:best.x,y:best.y};}
    return p;
  }
  function constrainOrtho(start,p){if(!state.ortho||!start)return p;const a=rad(baseAxisAngle()),ux=Math.cos(a),uy=Math.sin(a),vx=-uy,vy=ux,dx=p.x-start.x,dy=p.y-start.y,du=dx*ux+dy*uy,dv=dx*vx+dy*vy;return Math.abs(du)>=Math.abs(dv)?{x:start.x+ux*du,y:start.y+uy*du}:{x:start.x+vx*dv,y:start.y+vy*dv};}

  function hitHandle(p,obj){const tol=9/state.camera.zoom;if(!obj)return null;if((obj.type==='wall'||obj.type==='line'||obj.type==='cadLine')&&obj.a&&obj.b){if(distance(p,obj.a)<=tol)return'a';if(distance(p,obj.b)<=tol)return'b';}
    if(obj.type==='door'||obj.type==='window'){const g=openingGeometry(obj);if(g){if(distance(p,g.p1)<=tol)return'p1';if(distance(p,g.p2)<=tol)return'p2';if(distance(p,g.center)<=tol)return'center';}}
    if(obj.type==='dimension'){const g=dimensionGeometry(obj);if(g){if(!g.associated){if(distance(p,g.p1)<=tol)return'p1';if(distance(p,g.p2)<=tol)return'p2';}const c={x:(g.d1.x+g.d2.x)/2,y:(g.d1.y+g.d2.y)/2};if(distance(p,c)<=tol)return'offset';}}
    return null;}
  function objectBodyDistance(p,o){if(o.type==='door'){const g=doorGeometry(o);return g?Math.min(pointSegmentDistance(p,g.p1,g.p2),pointSegmentDistance(p,g.hinge,g.leafEnd)):Infinity;}if(o.type==='window'){const g=openingGeometry(o);return g?pointSegmentDistance(p,g.p1,g.p2):Infinity;}if(o.type==='dimension'){const g=dimensionGeometry(o);return g?pointSegmentDistance(p,g.d1,g.d2):Infinity;}if(o.type==='space')return o.polygon?.length&&pointInPolygon(p,o.polygon)?0:Infinity;if(o.type==='cadCircle')return Math.abs(distance(p,o.center)-o.radius);if(o.a&&o.b){let d=pointSegmentDistance(p,o.a,o.b);if(o.type==='wall')d=Math.max(0,d-(o.thickness||150)/2);return d;}return Infinity;}
  function hitObject(p){const tolerance=9/state.camera.zoom;let best=null,bestD=Infinity,spaceHit=null;const semanticOnly=state.toolset==='plan';for(let i=state.objects.length-1;i>=0;i--){const o=state.objects[i];if(semanticOnly&&isCadObject(o))continue;if(state.toolset==='cad'&&o.type!=='space'&&(isCadObject(o)||isSemanticObject(o)||o.type==='line')&&!cadLayerVisible(cadLayerForObject(o)))continue;if(o.type==='space'){if(!spaceHit&&objectBodyDistance(p,o)===0)spaceHit=o;continue;}const d=objectBodyDistance(p,o);if(d<tolerance&&d<bestD){best=o;bestD=d;}}return best||spaceHit;}
  function pointSegmentDistance(p,a,b){return projectPointToSegment(p,a,b).distance;}

  function beginObjectDrag(e,p,obj){if(obj?.type==='space')return;const handle=hitHandle(p,obj);const mode=handle||'body';state.dragEdit={pointerId:e.pointerId,objectId:obj.id,mode,start:{...p},snapshot:JSON.parse(JSON.stringify(obj)),historyPushed:false};canvas.setPointerCapture?.(e.pointerId);host.dataset.drag='true';}
  function ensureDragHistory(){if(state.dragEdit&&!state.dragEdit.historyPushed){pushHistory();state.dragEdit.historyPushed=true;}}
  function moveChildrenWithWall(wallId,dx,dy){/* openings are parametric on the wall and move with it automatically */}
  function applyObjectDrag(p){const d=state.dragEdit;if(!d)return;const obj=state.objects.find(o=>o.id===d.objectId);if(!obj)return;const src=d.snapshot,delta={x:p.x-d.start.x,y:p.y-d.start.y};ensureDragHistory();
    if((obj.type==='wall'||obj.type==='line'||obj.type==='cadLine')&&src.a&&src.b){
      if(d.mode==='a')obj.a={...p};else if(d.mode==='b')obj.b={...p};else{obj.a={x:src.a.x+delta.x,y:src.a.y+delta.y};obj.b={x:src.b.x+delta.x,y:src.b.y+delta.y};}
      if(obj.type==='wall'){
        // SNAP is only a placement aid. Persistent endpoint relationships live in attachments/constraints.
        // If an endpoint is already constrained to another wall, dragging keeps that explicit relationship.
        if(src.attachments)obj.attachments=JSON.parse(JSON.stringify(src.attachments));
        if(d.mode==='body'&&obj.attachments){
          for(const endpoint of['a','b']){
            const att=obj.attachments?.[endpoint],parent=att&&state.objects.find(o=>o.id===att.wallId&&o.type==='wall');
            if(!parent)continue;
            const desired={x:src[endpoint].x+delta.x,y:src[endpoint].y+delta.y};
            if(att.kind==='coincident'&&att.targetEndpoint&&parent[att.targetEndpoint]){att.t=att.targetEndpoint==='a'?0:1;obj[endpoint]={...parent[att.targetEndpoint]};}
            else{const pr=projectPointToSegment(desired,parent.a,parent.b);att.t=pr.t;obj[endpoint]={...pr.point};}
          }
        }else if((d.mode==='a'||d.mode==='b')&&obj.attachments?.[d.mode]){
          const att=obj.attachments[d.mode],parent=state.objects.find(o=>o.id===att.wallId&&o.type==='wall');
          if(parent){
            if(att.kind==='coincident'&&att.targetEndpoint&&parent[att.targetEndpoint]){att.t=att.targetEndpoint==='a'?0:1;obj[d.mode]={...parent[att.targetEndpoint]};}
            else{const pr=projectPointToSegment(p,parent.a,parent.b);att.t=pr.t;obj[d.mode]={...pr.point};}
          }
        }
        enforceWallConstraints(obj,{changed:d.mode==='a'?'a':d.mode==='b'?'b':'body'});
        syncDependentsOfWall(obj.id);refreshSpaces();
      }
    }
    else if(obj.type==='door'||obj.type==='window'){const wall=state.objects.find(o=>o.id===obj.wallId&&o.type==='wall');if(wall){const pr=projectPointToSegment(p,wall.a,wall.b);if(d.mode==='center'||d.mode==='body'){obj.t=pr.t;if(obj.type==='door'){const signed=signedDistanceToWall(p,wall),threshold=Math.max((wall.thickness||150)*.8,45/state.camera.zoom);if(Math.abs(signed)>threshold)obj.swing=signed>=0?1:-1;}}else if(d.mode==='p1'||d.mode==='p2'){const g0=openingGeometry(src);if(g0){const opposite=d.mode==='p1'?g0.p2:g0.p1;const pp=projectPointToSegment(p,wall.a,wall.b);const po=projectPointToSegment(opposite,wall.a,wall.b);const len=distance(wall.a,wall.b);obj.t=clamp((pp.t+po.t)/2,0,1);obj.width=Math.max(100,Math.abs(pp.t-po.t)*len);}}}}
    else if(obj.type==='dimension'){const g0=dimensionGeometry(src);if(g0){if(g0.associated){const base={x:(g0.p1.x+g0.p2.x)/2,y:(g0.p1.y+g0.p2.y)/2};obj.offset=(p.x-base.x)*g0.nx+(p.y-base.y)*g0.ny;}else if(d.mode==='p1')obj.p1={...p};else if(d.mode==='p2')obj.p2={...p};else if(d.mode==='offset'){const base={x:(obj.p1.x+obj.p2.x)/2,y:(obj.p1.y+obj.p2.y)/2},v={x:obj.p2.x-obj.p1.x,y:obj.p2.y-obj.p1.y},len=Math.max(.000001,Math.hypot(v.x,v.y)),nx=-v.y/len,ny=v.x/len;obj.offset=(p.x-base.x)*nx+(p.y-base.y)*ny;}else{obj.p1={x:g0.p1.x+delta.x,y:g0.p1.y+delta.y};obj.p2={x:g0.p2.x+delta.x,y:g0.p2.y+delta.y};}}}
    markDirty(true);rebuildObjectSnapIndex();renderProperties();render();}


  function updateHover(p){if(state.activeTool!=='select'||state.dragEdit||isCompactViewer()||(state.toolset==='cad'&&state.objects.length>5000)){state.hoveredObjectId=null;host.dataset.hover='false';return;}const o=hitObject(p);state.hoveredObjectId=o?.id||null;host.dataset.hover=state.hoveredObjectId?'true':'false';}

  function beginViewerPointer(e,s){state.viewerPointers.set(e.pointerId,s);canvas.setPointerCapture?.(e.pointerId);if(state.viewerPointers.size===1){state.pan={pointerId:e.pointerId,startScreen:s,startCamera:{...state.camera}};host.dataset.pan='true';}else if(state.viewerPointers.size===2){const pts=[...state.viewerPointers.values()],c={x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2},dist=Math.max(1,Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y));state.viewerGesture={startDistance:dist,startCenter:c,startCamera:{...state.camera},startZoom:state.camera.zoom,worldAtCenter:screenCssToWorld(c)};state.pan=null;}}
  function moveViewerPointer(e,s){if(!state.viewerPointers.has(e.pointerId))return false;state.viewerPointers.set(e.pointerId,s);if(state.viewerPointers.size>=2&&state.viewerGesture){const pts=[...state.viewerPointers.values()].slice(0,2),c={x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2},dist=Math.max(1,Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y)),g=state.viewerGesture;state.camera.zoom=clamp(g.startZoom*(dist/g.startDistance),.002,8);const after=screenCssToWorld(c);state.camera.cx+=g.worldAtCenter.x-after.x;state.camera.cy+=g.worldAtCenter.y-after.y;render();return true;}if(state.pan&&state.pan.pointerId===e.pointerId){const dx=(s.x-state.pan.startScreen.x)/state.camera.zoom,dy=(s.y-state.pan.startScreen.y)/state.camera.zoom;state.camera.cx=state.pan.startCamera.cx-dx;state.camera.cy=state.pan.startCamera.cy+dy;render();return true;}return true;}
  function endViewerPointer(e){state.viewerPointers.delete(e.pointerId);if(state.viewerPointers.size<2)state.viewerGesture=null;if(!state.viewerPointers.size){state.pan=null;host.dataset.pan='false';}try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}return true;}

  function onPointerMove(e){const s=fromPointerEvent(e);let p=screenCssToWorld(s);state.cursorWorld=p;dom.statusX.textContent=`X ${formatNumber(p.x,1)}`;dom.statusY.textContent=`Y ${formatNumber(p.y,1)}`;
    if(isCompactViewer()&&moveViewerPointer(e,s))return;
    if(state.regionDrag&&state.regionDrag.pointerId===e.pointerId){state.regionDrag.current={...p};render();return;}
    if(state.selectionDrag&&state.selectionDrag.pointerId===e.pointerId){state.selectionDrag.current={...p};updateSelectionDragPreview();render();return;}
    if(state.pan){const dx=(s.x-state.pan.startScreen.x)/state.camera.zoom,dy=(s.y-state.pan.startScreen.y)/state.camera.zoom;state.camera.cx=state.pan.startCamera.cx-dx;state.camera.cy=state.pan.startCamera.cy+dy;render();return;}
    if(state.dragEdit){applyObjectDrag(nearestSnap(p,state.dragEdit.objectId));return;}
    updateHover(p);
    if(state.activeTool==='door'||state.activeTool==='window')state.previewOpening=nearestWallProjection(p);else state.previewOpening=null;
    const start=state.drawStart||state.measureStart||state.calibration?.p1;if(start)p=constrainOrtho(start,nearestSnap(p));else p=nearestSnap(p);state.previewEnd=p;render();}

  function onPointerDown(e){host.focus();hideContextMenu();const s=fromPointerEvent(e);if(isCompactViewer()){if(e.button===0||e.pointerType==='touch'){e.preventDefault();beginViewerPointer(e,s);}return;}const panGesture=e.button===1||(e.button===0&&state.spaceDown);if(panGesture){e.preventDefault();if(state.spaceGesture)state.spaceGesture.used=true;state.pan={pointerId:e.pointerId,startScreen:s,startCamera:{...state.camera}};host.dataset.pan='true';canvas.setPointerCapture?.(e.pointerId);return;}if(e.button!==0)return;const editableLabel=hitEditableLabel(s);if(editableLabel)return;let raw=screenCssToWorld(s),p=nearestSnap(raw);
    if(state.activeTool==='region'&&state.toolset==='cad'){state.regionDrag={pointerId:e.pointerId,start:{...raw},current:{...raw}};canvas.setPointerCapture?.(e.pointerId);render();return;}
    if(state.calibration){if(!state.calibration.p1){state.calibration.p1=p;state.previewEnd=p;updateContextBar();render();}else{state.calibration.p2=p;openCalibrationDialog();}return;}
    if(state.activeTool==='select'){const selected=state.objects.find(o=>o.id===state.selectedObjectId);if(selected&&hitHandle(raw,selected)){beginObjectDrag(e,raw,selected);return;}const obj=hitObject(raw);if(obj){applyObjectClickSelection(obj,e);if(!(e.shiftKey||e.ctrlKey||e.metaKey)&&state.selectedObjectIds.size<=1)beginObjectDrag(e,raw,obj);renderPrimaryPanel();renderProperties();render();return;}if(state.toolset==='cad'){const mode=e.shiftKey?'add':(e.ctrlKey||e.metaKey?'toggle':'replace');state.selectionDrag={pointerId:e.pointerId,start:{...raw},current:{...raw},mode,previewIds:new Set()};canvas.setPointerCapture?.(e.pointerId);if(mode==='replace'){state.selectedObjectIds.clear();state.selectedObjectId=null;}state.selectedReferenceId=null;state.selectedRegionId=null;renderPrimaryPanel();renderProperties();render();return;}applyObjectClickSelection(null,e);renderPrimaryPanel();renderProperties();render();return;}
    if(state.activeTool==='delete'){const obj=hitObject(raw);if(obj)deleteObjectById(obj.id);return;}
    if(state.activeTool==='line'||state.activeTool==='wall'){if(!state.drawStart){state.drawStart=p;state.previewEnd=p;updateContextBar();render();}else commitSegment(state.drawStart,constrainOrtho(state.drawStart,p),state.activeTool);return;}
    if(state.activeTool==='measure'){if(!state.measureStart){state.measureStart=p;state.previewEnd=p;updateContextBar();render();}else commitMeasurement(state.measureStart,constrainOrtho(state.measureStart,p));return;}
    if(state.activeTool==='space'&&state.toolset==='plan'){commitSpace(raw);return;}
    if(state.activeTool==='door'||state.activeTool==='window'){commitOpening(state.activeTool,nearestWallProjection(raw));return;}
  }
  function onPointerUp(e){if(isCompactViewer()&&state.viewerPointers.has(e.pointerId)){endViewerPointer(e);return;}if(state.regionDrag&&state.regionDrag.pointerId===e.pointerId){const drag=state.regionDrag;state.regionDrag=null;try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}const r=rectFromPoints(drag.start,drag.current);if((r.maxx-r.minx)>20&&(r.maxy-r.miny)>20){const name=prompt(t('region.namePrompt'),t('region.defaultName',{n:state.drawingRegions.length+1}));if(name!==null){pushHistory();const region={id:uid('region'),name:(name||t('region.defaultName',{n:state.drawingRegions.length+1})).trim(),...r};state.drawingRegions.push(region);state.selectedRegionId=region.id;markDirty(true);updateAll();}}setTool('select','select');return;}if(state.selectionDrag&&state.selectionDrag.pointerId===e.pointerId){const drag=state.selectionDrag,candidates=[...(drag.previewIds||new Set())];state.selectionDrag=null;try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}applySelectionSet(candidates,drag.mode);renderPrimaryPanel();renderProperties();render();return;}if(state.dragEdit){const drag=state.dragEdit,hadChange=drag.historyPushed,obj=state.objects.find(o=>o.id===drag.objectId);state.dragEdit=null;host.dataset.drag='false';try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}if(hadChange&&obj?.type==='wall'){syncDependentsOfWall(obj.id);refreshSpaces();}if(hadChange){rebuildObjectSnapIndex();updateAll();}return;}if(!state.pan)return;state.pan=null;host.dataset.pan='false';try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){} }
  function onWheel(e){e.preventDefault();const s=fromPointerEvent(e),before=screenCssToWorld(s),factor=Math.exp(-e.deltaY*.0014);state.camera.zoom=clamp(state.camera.zoom*factor,.002,8);const after=screenCssToWorld(s);state.camera.cx+=before.x-after.x;state.camera.cy+=before.y-after.y;render();}

  function deleteObjectById(id){const target=state.objects.find(o=>o.id===id);if(!target)return;pushHistory();const childIds=target.type==='wall'?new Set(state.objects.filter(o=>(o.type==='door'||o.type==='window'||o.type==='dimension')&&o.wallId===id).map(o=>o.id)):new Set();state.objects=state.objects.filter(o=>o.id!==id&&!childIds.has(o.id));if(target.type==='wall'){for(const wall of state.objects.filter(o=>o.type==='wall'))for(const endpoint of['a','b'])if(wall.attachments?.[endpoint]?.wallId===id)delete wall.attachments[endpoint];refreshSpaces();}state.selectedObjectId=null;state.selectedObjectIds.delete(id);for(const childId of childIds)state.selectedObjectIds.delete(childId);markDirty(true);rebuildObjectSnapIndex();updateAll();}
  function deleteSelectedObjects(){const ids=selectionIds();if(!ids.size)return;pushHistory();const remove=new Set(ids);for(const id of ids){const target=state.objects.find(o=>o.id===id);if(target?.type==='wall')for(const o of state.objects)if((o.type==='door'||o.type==='window'||o.type==='dimension')&&o.wallId===id)remove.add(o.id);}state.objects=state.objects.filter(o=>!remove.has(o.id));for(const wall of state.objects.filter(o=>o.type==='wall'))for(const endpoint of['a','b'])if(remove.has(wall.attachments?.[endpoint]?.wallId))delete wall.attachments[endpoint];clearMultiSelection();refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();}

  function referenceBounds(ref,{main=false}={}){if(ref.type==='linkedCadRegion'){const r=state.drawingRegions.find(x=>x.id===ref.regionId);return r||{minx:0,miny:0,maxx:1000,maxy:1000};}if(ref.type==='image'){const a=referenceLocalToWorld(ref,{x:0,y:0}),b=referenceLocalToWorld(ref,{x:ref.width,y:ref.height});return{minx:Math.min(a.x,b.x),miny:Math.min(a.y,b.y),maxx:Math.max(a.x,b.x),maxy:Math.max(a.y,b.y)};}const b=(main&&ref.mainBounds)||ref.bounds,a=referenceLocalToWorld(ref,{x:b.minx,y:b.miny}),c=referenceLocalToWorld(ref,{x:b.maxx,y:b.maxy});return{minx:Math.min(a.x,c.x),miny:Math.min(a.y,c.y),maxx:Math.max(a.x,c.x),maxy:Math.max(a.y,c.y)};}
  function allBounds({full=false}={}){let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;const add=p=>{if(!p)return;minx=Math.min(minx,p.x);miny=Math.min(miny,p.y);maxx=Math.max(maxx,p.x);maxy=Math.max(maxy,p.y);};for(const r of state.references){const b=referenceBounds(r,{main:!full});add({x:b.minx,y:b.miny});add({x:b.maxx,y:b.maxy});}if(state.sourceDxfName&&state.objects.length&&state.sourceDxfMainBounds&&!full){const b=state.sourceDxfMainBounds;add({x:b.minx,y:b.miny});add({x:b.maxx,y:b.maxy});}else for(const o of state.objects){if(o.a)add(o.a);if(o.b)add(o.b);if(o.center){add({x:o.center.x-o.radius,y:o.center.y-o.radius});add({x:o.center.x+o.radius,y:o.center.y+o.radius});}if(o.point)add(o.point);const g=(o.type==='door'||o.type==='window')?openingGeometry(o):null;if(g){add(g.p1);add(g.p2);}if(o.type==='dimension'){const d=dimensionGeometry(o);if(d){add(d.p1);add(d.p2);add(d.d1);add(d.d2);}}}return Number.isFinite(minx)?{minx,miny,maxx,maxy}:null;}
  function fitAll(){const b=allBounds({full:false});if(!b){state.camera={cx:0,cy:0,zoom:.12};render();return;}fitBounds(b);}
  function fitBounds(b){const{w,h}=cssCanvasSize(),bw=Math.max(100,b.maxx-b.minx),bh=Math.max(100,b.maxy-b.miny);state.camera.cx=(b.minx+b.maxx)/2;state.camera.cy=(b.miny+b.maxy)/2;state.camera.zoom=clamp(Math.min((w-90)/bw,(h-90)/bh),.002,8);render();}
  function fitReference(ref){fitBounds(referenceBounds(ref,{main:true}));}

  function fitReferenceFull(ref){fitBounds(referenceBounds(ref,{main:false}));}
  function fitFullExtents(){const b=allBounds({full:true});if(b)fitBounds(b);}
  function scaleBounds(b,factor){return b?{minx:b.minx*factor,miny:b.miny*factor,maxx:b.maxx*factor,maxy:b.maxy*factor}:null;}

  async function openReferenceFile(file){if(!file)return;const lower=file.name.toLowerCase();try{if(lower.endsWith('.dxf'))await addDxfReference(file);else if(file.type.startsWith('image/'))await addImageReference(file);else alert(t('alert.unsupportedReference'));}finally{dom.referenceFileInput.value='';}}
  async function addDxfReference(file){showProgress(t('progress.readingDxf'),0,file.name);const text=await file.text();const parsed=await window.PieniPlanDXF.parseAndAnalyze(text,p=>showProgress(p.stage||t('progress.readingDxf'),p.ratio||0,p.detail||''));const factor=unitFactorToMm(parsed.unit),entities=parsed.entities.map(e=>normalizeEntityToMm(e,factor)),b=boundsEntities(entities),main=scaleBounds(parsed.analysis?.mainBounds,factor);const ref={id:uid('ref'),type:'dxf',name:file.name,visible:true,opacity:.48,scale:1,origin:{x:0,y:0},entities,bounds:b,mainBounds:main||b,outlierCount:parsed.analysis?.outlierCount||0,sourceUnit:parsed.unit?.label||'unspecified',sourceUnitSpecified:parsed.unit?.metersPerUnit!=null,layers:parsed.layers||[],visibleLayers:new Set(parsed.layers||[]),pathsByLayer:buildDxfPaths(entities),textEntities:entities.filter(e=>e.type==='text'),snapIndex:buildSnapIndex(entities,b)};state.references.push(ref);state.selectedReferenceId=ref.id;markDirty(true);hideProgress();updateAll();switchInspector('reference');fitReference(ref);}
  async function addImageReference(file){const dataUrl=await readDataUrl(file),image=await loadImage(dataUrl);const ref={id:uid('ref'),type:'image',name:file.name,visible:true,opacity:.55,scale:1,origin:{x:0,y:0},image,width:image.naturalWidth,height:image.naturalHeight,sourceUnit:'px'};state.references.push(ref);state.selectedReferenceId=ref.id;markDirty(true);updateAll();switchInspector('reference');fitReference(ref);}

  async function openEditableDxf(file){if(!file)return;try{if((state.dirty||state.objects.length||state.references.length)&&!confirm(t('confirm.newDrawing')))return;state.objects=[];state.references=[];state.drawingRegions=[];state.selectedRegionId=null;state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectionDrag=null;state.selectedReferenceId=null;state.layerFilter='';state.baseAxisAngle=0;state.baseAxisWallId=null;state.history=[];state.future=[];state.nextId=1;state.cadMapping=null;state.cadLayerVisibility=new Map([['0',true]]);state.activeCadLayer='0';showProgress(t('progress.importingDxf'),0,file.name);const text=await file.text();const parsed=await window.PieniPlanDXF.parseAndAnalyze(text,p=>showProgress(p.stage||t('progress.importingDxf'),p.ratio||0,p.detail||''));const factor=unitFactorToMm(parsed.unit);const entities=parsed.entities.map(e=>normalizeEntityToMm(e,factor));const editable=[];for(const e of entities){const layer=e.layer||'0';state.cadLayerVisibility.set(layer,true);if(e.type==='line')editable.push({id:uid('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.x1,y:e.y1},b:{x:e.x2,y:e.y2},source:'DXF'});else if(e.type==='polyline'&&e.points?.length>1){for(let i=1;i<e.points.length;i++)editable.push({id:uid('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.points[i-1][0],y:e.points[i-1][1]},b:{x:e.points[i][0],y:e.points[i][1]},source:'DXF'});if(e.closed)editable.push({id:uid('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.points.at(-1)[0],y:e.points.at(-1)[1]},b:{x:e.points[0][0],y:e.points[0][1]},source:'DXF'});}else if(e.type==='circle')editable.push({id:uid('cadCircle'),type:'cadCircle',cadLayer:layer,center:{x:e.cx,y:e.cy},radius:e.r,source:'DXF'});else if(e.type==='text')editable.push({id:uid('cadText'),type:'cadText',cadLayer:layer,point:{x:e.x,y:e.y},text:e.text||'',source:'DXF'});}
      if(!editable.some(o=>o.type==='cadLine'||o.type==='cadCircle'))alert(t('alert.dxfNoEditableEntities'));state.objects=editable;state.sourceDxfName=file.name;state.sourceDxfFullBounds=boundsEntities(entities);state.sourceDxfMainBounds=scaleBounds(parsed.analysis?.mainBounds,factor)||state.sourceDxfFullBounds;state.sourceDxfOutlierCount=parsed.analysis?.outlierCount||0;state.activeCadLayer=(parsed.layers||[])[0]||'0';state.dirty=false;rebuildObjectSnapIndex();hideProgress();switchToolset('cad',{skipMapping:true});updateAll();fitAll();}catch(err){hideProgress();console.error(err);alert(err.message||String(err));}finally{dom.dxfEditFileInput.value='';}}

  function normalizeEntityToMm(e,factor){const out={...e};if(e.type==='line'){out.x1=e.x1*factor;out.y1=e.y1*factor;out.x2=e.x2*factor;out.y2=e.y2*factor;}else if(e.type==='polyline')out.points=(e.points||[]).map(p=>[p[0]*factor,p[1]*factor]);else if(e.type==='circle'){out.cx=e.cx*factor;out.cy=e.cy*factor;out.r=e.r*factor;}else if(e.type==='text'){out.x=e.x*factor;out.y=e.y*factor;}return out;}
  function buildDxfPaths(entities){const paths=new Map(),get=layer=>{const key=layer||'0';if(!paths.has(key))paths.set(key,new Path2D());return paths.get(key);};for(const e of entities){const path=get(e.layer);if(e.type==='line'){path.moveTo(e.x1,e.y1);path.lineTo(e.x2,e.y2);}else if(e.type==='polyline'&&e.points?.length){path.moveTo(e.points[0][0],e.points[0][1]);for(let i=1;i<e.points.length;i++)path.lineTo(e.points[i][0],e.points[i][1]);if(e.closed)path.closePath();}else if(e.type==='circle'&&e.r>0){path.moveTo(e.cx+e.r,e.cy);path.arc(e.cx,e.cy,e.r,0,Math.PI*2);}}return paths;}
  function buildSnapIndex(entities,bounds){const cellW=1000,cellH=1000,cells=new Map();const add=(x,y,layer='0')=>{if(!Number.isFinite(x)||!Number.isFinite(y))return;const gx=Math.floor(x/cellW),gy=Math.floor(y/cellH),key=`${gx},${gy}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push({x,y,layer});};for(const e of entities){if(e.type==='line'){add(e.x1,e.y1,e.layer);add(e.x2,e.y2,e.layer);}else if(e.type==='polyline')for(const p of e.points||[])add(p[0],p[1],e.layer);else if(e.type==='circle'){add(e.cx-e.r,e.cy,e.layer);add(e.cx+e.r,e.cy,e.layer);add(e.cx,e.cy-e.r,e.layer);add(e.cx,e.cy+e.r,e.layer);}}return{minx:0,miny:0,cellW,cellH,cells};}
  function boundsEntities(entities){let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;const add=(x,y)=>{if(Number.isFinite(x)&&Number.isFinite(y)){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);}};for(const e of entities){if(e.type==='line'){add(e.x1,e.y1);add(e.x2,e.y2);}else if(e.type==='polyline')for(const p of e.points||[])add(p[0],p[1]);else if(e.type==='circle'){add(e.cx-e.r,e.cy-e.r);add(e.cx+e.r,e.cy+e.r);}else if(e.type==='text')add(e.x,e.y);}return Number.isFinite(minx)?{minx,miny,maxx,maxy}:{minx:0,miny:0,maxx:1000,maxy:1000};}
  function readDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});}
  function loadImage(src){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=rej;img.src=src;});}
  function showProgress(title,ratio,detail){dom.progressToast.hidden=false;dom.progressTitle.textContent=title;dom.progressBar.style.width=`${clamp(ratio,0,1)*100}%`;dom.progressDetail.textContent=detail;}
  function hideProgress(){dom.progressToast.hidden=true;}

  function beginCalibration(refId){const ref=state.references.find(r=>r.id===refId);if(!ref)return;state.selectedReferenceId=refId;state.calibration={refId,p1:null,p2:null};state.drawStart=null;state.measureStart=null;state.previewEnd=null;updateContextBar();render();}
  function openCalibrationDialog(){const c=state.calibration;if(!c?.p1||!c?.p2)return;const measured=distance(c.p1,c.p2);dom.dialogTitle.textContent=t('dialog.calibrate');dom.dialogCopy.textContent=t('dialog.calibrationCopy',{distance:formatNumber(measured,2)});dom.dialogInput.value=String(Math.round(measured*100)/100);dom.dialogBackdrop.hidden=false;setTimeout(()=>{dom.dialogInput.focus();dom.dialogInput.select();},0);}
  function applyCalibration(){const actual=Number(dom.dialogInput.value),c=state.calibration;if(!c||!Number.isFinite(actual)||actual<=0)return;const ref=state.references.find(r=>r.id===c.refId);if(!ref)return;const current=distance(c.p1,c.p2);if(current<=0)return;const localAnchor=referenceWorldToLocal(ref,c.p1),newScale=ref.scale*(actual/current);ref.scale=newScale;ref.origin={x:c.p1.x-localAnchor.x*newScale,y:c.p1.y-localAnchor.y*newScale};state.calibration=null;dom.dialogBackdrop.hidden=true;state.previewEnd=null;markDirty(true);updateAll();}

  function visibleCadLayers(region=null){const layers=new Set();for(const o of state.objects){if(!(isCadObject(o)||o.type==='line'))continue;const layer=o.cadLayer||'0';if(!cadLayerVisible(layer))continue;if(region&&!objectTouchesRegion(o,region))continue;layers.add(layer);}return layers;}
  function regionObjectCount(region){return state.objects.filter(o=>(isCadObject(o)||o.type==='line')&&cadLayerVisible(o.cadLayer||'0')&&objectTouchesRegion(o,region)).length;}
  function openRegionInPlan(region){let ref=state.references.find(r=>r.type==='linkedCadRegion'&&r.regionId===region.id);if(!ref){const layers=visibleCadLayers(region);ref={id:uid('ref'),type:'linkedCadRegion',regionId:region.id,name:`${region.name} · CAD`,visible:true,opacity:.48,layers:[...layers],visibleLayers:new Set(layers)};state.references.push(ref);}else ref.visible=true;state.selectedReferenceId=ref.id;markDirty(true);switchToolset('plan',{skipMapping:true});switchInspector('reference');fitBounds(region);updateAll();}
  function exportRegionDxf(region){const visible=visibleCadLayers();let entities='',layers=new Set(['0']);for(const o of state.objects){if(!(isCadObject(o)||o.type==='line')||!objectTouchesRegion(o,region))continue;const layer=o.cadLayer||'0';if(!visible.has(layer))continue;layers.add(layer);if(o.type==='cadLine'||o.type==='line'){const clipped=clipLineToRect(o.a,o.b,region);if(clipped)entities+=dxfLine(layer,clipped[0],clipped[1]);}else if(o.type==='cadCircle')entities+=dxfCircle(layer,o.center,o.radius);else if(o.type==='cadText'&&pointInRect(o.point,region))entities+=dxfText(layer,o.point,o.text||'');}let layerTable=dxfPair(0,'TABLE')+dxfPair(2,'LAYER')+dxfPair(70,layers.size);for(const name of layers)layerTable+=dxfPair(0,'LAYER')+dxfPair(2,sanitizeLayer(name))+dxfPair(70,0)+dxfPair(62,7)+dxfPair(6,'CONTINUOUS');layerTable+=dxfPair(0,'ENDTAB');const dxf=dxfPair(0,'SECTION')+dxfPair(2,'HEADER')+dxfPair(9,'$ACADVER')+dxfPair(1,'AC1009')+dxfPair(9,'$INSUNITS')+dxfPair(70,4)+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'TABLES')+layerTable+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'ENTITIES')+entities+dxfPair(0,'ENDSEC')+dxfPair(0,'EOF');downloadTextFile(dxf,`${sanitizeFilename(region.name||'region')}_PieniPlan.dxf`,'application/dxf;charset=utf-8');}
  function downloadTextFile(text,filename,type='text/plain;charset=utf-8'){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function sanitizeFilename(name){return String(name||'PieniPlan').replace(/[\/:*?"<>|]+/g,'_').trim()||'PieniPlan';}
  function deleteRegion(regionId){pushHistory();state.drawingRegions=state.drawingRegions.filter(r=>r.id!==regionId);state.references=state.references.filter(r=>!(r.type==='linkedCadRegion'&&r.regionId===regionId));if(state.selectedRegionId===regionId)state.selectedRegionId=null;markDirty(true);updateAll();}

  function renderPrimaryPanel(){if(state.toolset==='plan')renderPlanObjectsPanel();else renderCadLayersPanel();}
  function renderPlanObjectsPanel(){dom.primaryControls.hidden=true;dom.primaryControls.innerHTML='';dom.primaryList.innerHTML='';const groups=[['wall','group.walls','wall'],['door','group.doors','door'],['window','group.windows','window'],['space','group.spaces','space'],['dimension','group.dimensions','dimension']];let any=false;for(const[type,key,icon]of groups){const count=state.objects.filter(o=>o.type===type).length;if(!count)continue;any=true;dom.primaryList.appendChild(summaryRow(icon,t(key),t('panel.objects',{count})));}const cadCount=state.objects.filter(isCadObject).length;if(cadCount){any=true;dom.primaryList.appendChild(summaryRow('vector',t('group.cadGeometry'),t('panel.hiddenCad',{count:cadCount})));}if(!any)dom.primaryList.innerHTML=`<div class="section-copy">${escapeHtml(t('panel.noPlanObjects'))}</div>`;}
  function summaryRow(icon,title,meta){const row=document.createElement('div');row.className='list-row';row.innerHTML=`<div class="object-swatch"><span class="ui-icon icon-${icon}" aria-hidden="true"></span></div><div class="row-main"><div class="row-title">${escapeHtml(title)}</div><div class="row-meta">${escapeHtml(meta)}</div></div><span></span>`;return row;}
  function scrollLayerRowInsideList(row){if(!row||!dom.primaryList)return;const list=dom.primaryList,top=row.offsetTop,bottom=top+row.offsetHeight,viewTop=list.scrollTop,viewBottom=viewTop+list.clientHeight;if(top<viewTop)list.scrollTop=Math.max(0,top-4);else if(bottom>viewBottom)list.scrollTop=Math.max(0,bottom-list.clientHeight+4);}
  function renderCadLayersPanel(){
    const previousScroll=dom.primaryList.scrollTop;
    dom.primaryControls.hidden=false;
    dom.primaryControls.innerHTML='';

    const search=document.createElement('input');
    search.type='search';
    search.className='layer-search';
    search.placeholder=t('panel.layerSearch');
    search.setAttribute('aria-label',t('panel.layerSearch'));
    search.value=state.layerFilter||'';
    search.addEventListener('input',()=>{state.layerFilter=search.value;renderCadLayersPanel();});
    dom.primaryControls.appendChild(search);
    dom.primaryList.innerHTML='';

    const counts=new Map();
    for(const o of state.objects){
      let layer=null;
      if(isCadObject(o)||o.type==='line')layer=o.cadLayer||'0';
      else if(isSemanticObject(o)&&o.type!=='space')layer=cadLayerForObject(o);
      if(layer)counts.set(layer,(counts.get(layer)||0)+1);
    }

    const selectedIds=selectionIds();
    const selectedObjects=[...selectedIds].map(id=>state.objects.find(o=>o.id===id)).filter(Boolean);
    const selectedLayers=new Set(selectedObjects.filter(o=>o.type!=='space').map(cadLayerForObject));
    const selectedLayer=selectedLayers.size===1?[...selectedLayers][0]:null;
    const filter=(state.layerFilter||'').trim().toLocaleLowerCase();
    const entries=[...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
    let shown=0;

    if(!counts.size){
      const empty=document.createElement('div');
      empty.className='section-copy';
      empty.textContent=t('panel.noCadLayers');
      dom.primaryList.appendChild(empty);
    }else{
      for(const[layer,count]of entries){
        if(filter&&!layer.toLocaleLowerCase().includes(filter)&&!selectedLayers.has(layer))continue;
        shown++;
        if(!state.cadLayerVisibility.has(layer))state.cadLayerVisibility.set(layer,true);
        const visible=cadLayerVisible(layer),row=document.createElement('div');
        row.className=`list-row cad-layer-row ${selectedLayers.has(layer)?'selected':''}`;
        row.dataset.layer=layer;

        const eye=document.createElement('button');
        eye.className='eye-button';
        configureVisibilityButton(eye,visible,'layer');
        eye.addEventListener('click',e=>{e.stopPropagation();setCadLayerVisibilityUndoable(layer,!visible);});

        const main=document.createElement('div');
        main.className='row-main';
        main.innerHTML=`<div class="row-title" title="${escapeHtml(layer)}">${escapeHtml(layer)}</div><div class="row-meta" title="${escapeHtml(t('panel.entities',{count}))}">${escapeHtml(String(count))}</div>`;

        const active=document.createElement('span');
        active.className='layer-active';
        active.hidden=state.activeCadLayer!==layer;
        active.title=t('panel.active');
        row.addEventListener('click',e=>{if(e.target.closest('button'))return;state.activeCadLayer=layer;renderCadLayersPanel();});
        row.append(eye,main,active);
        dom.primaryList.appendChild(row);
      }
      if(!shown){
        const empty=document.createElement('div');
        empty.className='section-copy';
        empty.textContent=t('panel.noLayerMatches');
        dom.primaryList.appendChild(empty);
      }
    }

    // Drawing Regions stay in the same panel, but below the compact layer list.
    const divider=document.createElement('div');divider.className='panel-divider';dom.primaryList.appendChild(divider);
    const heading=document.createElement('div');heading.className='section-heading';heading.textContent=t('region.section');dom.primaryList.appendChild(heading);
    const add=document.createElement('button');add.className='mini-action region-add';add.textContent=t('action.defineRegion');add.addEventListener('click',()=>setTool('region','select'));dom.primaryList.appendChild(add);
    if(!state.drawingRegions.length){const empty=document.createElement('div');empty.className='section-copy';empty.textContent=t('region.none');dom.primaryList.appendChild(empty);}
    for(const region of state.drawingRegions){
      const row=document.createElement('div');row.className=`region-row ${state.selectedRegionId===region.id?'selected':''}`;
      const main=document.createElement('button');main.className='region-main';main.innerHTML=`<strong>${escapeHtml(region.name)}</strong><span>${escapeHtml(t('region.entities',{count:regionObjectCount(region)}))}</span>`;
      main.addEventListener('click',()=>{state.selectedRegionId=region.id;fitBounds(region);renderCadLayersPanel();render();});
      const actions=document.createElement('div');actions.className='region-actions';
      const plan=document.createElement('button');plan.className='mini-action';plan.textContent=t('action.openInPlan');plan.addEventListener('click',()=>openRegionInPlan(region));
      const exp=document.createElement('button');exp.className='mini-action';exp.textContent='DXF';exp.addEventListener('click',()=>exportRegionDxf(region));
      const del=document.createElement('button');del.className='mini-action danger';del.textContent=t('action.delete');del.addEventListener('click',()=>deleteRegion(region.id));
      actions.append(plan,exp,del);row.append(main,actions);dom.primaryList.appendChild(row);
    }

    // Restore only this list's scroll position; never scroll the page/workspace.
    requestAnimationFrame(()=>{
      dom.primaryList.scrollTop=previousScroll;
      if(selectedLayer){
        const row=dom.primaryList.querySelector(`[data-layer="${CSS.escape(selectedLayer)}"]`);
        scrollLayerRowInsideList(row);
      }
    });
  }

  function cadLayerForObject(obj){const m=state.cadMapping||defaultCadMapping();if(obj.type==='wall')return m.wallLayer;if(obj.type==='door')return m.doorLayer;if(obj.type==='window')return m.windowLayer;if(obj.type==='dimension')return m.dimensionLayer;return obj.cadLayer||'0';}

  function renderReferences(){dom.referenceList.innerHTML='';if(!state.references.length){dom.referenceList.innerHTML=`<div class="section-copy">${escapeHtml(t('panel.noReferences'))}</div>`;return;}for(const r of state.references){const row=document.createElement('div');row.className=`list-row ${state.selectedReferenceId===r.id?'selected':''}`;const eye=document.createElement('button');eye.className='eye-button';configureVisibilityButton(eye,r.visible,'reference');eye.addEventListener('click',e=>{e.stopPropagation();r.visible=!r.visible;markDirty(true);renderReferences();render();});const main=document.createElement('div');main.className='row-main';let meta='';if(r.type==='dxf')meta=`${t('panel.entities',{count:r.entities.length.toLocaleString()})} · ${r.sourceUnitSpecified?r.sourceUnit:t('panel.unitUnspecified')}${r.outlierCount?` · ${t('document.outliers',{count:r.outlierCount.toLocaleString()})}`:''}`;else if(r.type==='linkedCadRegion'){const region=state.drawingRegions.find(x=>x.id===r.regionId);meta=region?t('region.linkedReference',{name:region.name,layers:r.visibleLayers?.size||0}):t('region.missing');}else meta=`${r.width}×${r.height}px`;main.innerHTML=`<div class="row-title">${escapeHtml(r.name)}</div><div class="row-meta">${escapeHtml(meta)}</div>`;const actions=document.createElement('div');actions.className='row-actions';if(r.type!=='linkedCadRegion'){const calibrate=document.createElement('button');calibrate.className='mini-action';calibrate.textContent=t('action.scale');calibrate.dataset.tooltipTitle=t('action.scale');calibrate.dataset.tooltipKey='tooltip.scaleReference';calibrate.addEventListener('click',e=>{e.stopPropagation();beginCalibration(r.id);});actions.append(calibrate);}else{const refresh=document.createElement('button');refresh.className='mini-action';refresh.textContent=t('action.refreshLayers');refresh.addEventListener('click',e=>{e.stopPropagation();const region=state.drawingRegions.find(x=>x.id===r.regionId),layers=visibleCadLayers(region||null);r.layers=[...layers];r.visibleLayers=new Set(layers);markDirty(true);renderReferences();render();});actions.append(refresh);}const fit=document.createElement('button');fit.className='mini-action';fit.textContent=t('action.fit');fit.addEventListener('click',e=>{e.stopPropagation();fitReference(r);});actions.append(fit);if(r.type==='dxf'&&r.outlierCount>0){const full=document.createElement('button');full.className='mini-action';full.textContent=t('action.fitAllEntities');full.addEventListener('click',e=>{e.stopPropagation();fitReferenceFull(r);});actions.append(full);}row.addEventListener('click',()=>{state.selectedReferenceId=r.id;state.selectedObjectId=null;renderReferences();renderProperties();});row.append(eye,main,actions);dom.referenceList.appendChild(row);const control=document.createElement('div');control.className='panel-section';control.innerHTML=`<div class="property-row"><div class="property-label">${escapeHtml(t('panel.opacity'))}</div><div class="property-value"><input type="range" min="0.05" max="1" step="0.05" value="${r.opacity}"></div></div>`;control.querySelector('input').addEventListener('input',e=>{r.opacity=Number(e.target.value);markDirty(true);render();});dom.referenceList.appendChild(control);if(r.type==='dxf'||r.type==='linkedCadRegion')renderReferenceLayerControls(r);}}

  function renderReferenceLayerControls(ref){const section=document.createElement('div');section.className='panel-section';const heading=document.createElement('div');heading.className='section-heading';heading.textContent=t('panel.dxfLayers',{count:ref.layers.length});section.appendChild(heading);const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px;margin:8px 0;';const all=document.createElement('button');all.className='mini-action';all.textContent=t('action.all');const none=document.createElement('button');none.className='mini-action';none.textContent=t('action.none');all.addEventListener('click',()=>{ref.visibleLayers=new Set(ref.layers);renderReferences();render();});none.addEventListener('click',()=>{ref.visibleLayers=new Set();renderReferences();render();});actions.append(all,none);section.appendChild(actions);const list=document.createElement('div');list.style.cssText='display:grid;gap:5px;max-height:220px;overflow:auto;';for(const layer of ref.layers){const label=document.createElement('label');label.style.cssText='display:grid;grid-template-columns:auto minmax(0,1fr);gap:7px;align-items:center;font-size:9.5px;color:var(--text-2);';const cb=document.createElement('input');cb.type='checkbox';cb.checked=ref.visibleLayers.has(layer);cb.addEventListener('change',()=>{cb.checked?ref.visibleLayers.add(layer):ref.visibleLayers.delete(layer);render();});const text=document.createElement('span');text.textContent=layer;text.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';label.append(cb,text);list.appendChild(label);}section.appendChild(list);dom.referenceList.appendChild(section);}
  function iconMarkup(name){return`<span class="ui-icon icon-${name}" aria-hidden="true"></span>`;}
  function configureVisibilityButton(button,visible,kind){const showKey=kind==='reference'?'tooltip.showReference':'tooltip.showLayer',hideKey=kind==='reference'?'tooltip.hideReference':'tooltip.hideLayer';button.innerHTML=iconMarkup(visible?'eye':'eye-off');button.setAttribute('aria-label',t(visible?hideKey:showKey));button.dataset.tooltipTitleKey=visible?hideKey:showKey;delete button.dataset.tooltipKey;delete button.dataset.shortcut;}

  function localizedObjectType(type){const key=type==='cadLine'?'value.cadLine':`value.${type}`;return t(key);}
  function localizedToolName(tool){const keys={select:'tool.select',line:'tool.line',wall:'tool.wall',door:'tool.door',window:'tool.window',space:'tool.space',region:'tool.region',measure:'tool.measure',delete:'tool.delete'};return t(keys[tool]||`tool.${tool}`);}
  function wallConstraintSummary(wall){const c=ensureWallConstraints(wall),parts=[];if(c.orientation)parts.push(t(`constraint.${c.orientation}`));if(Number.isFinite(c.fixedAngle))parts.push(t('constraint.fixedAngleValue',{value:formatNumber(c.fixedAngle,1)}));if(Number.isFinite(c.fixedLength))parts.push(t('constraint.fixedLengthValue',{value:formatNumber(c.fixedLength,1)}));if(c.fixed)parts.push(t('constraint.fixed'));for(const ep of['a','b']){const att=wall.attachments?.[ep];if(att)parts.push(t(att.kind==='coincident'?'constraint.endpointCoincident':'constraint.pointOnLine',{endpoint:ep.toUpperCase()}));}return parts.length?parts.join(' · '):t('constraint.none');}
  function renderProperties(){dom.propertiesPanel.innerHTML='';const ids=selectionIds();if(ids.size>1){propertyText(t('property.selection'),t('value.objectsSelected',{count:ids.size}));if(state.toolset==='cad'){const layers=new Set([...ids].map(id=>state.objects.find(o=>o.id===id)).filter(Boolean).filter(o=>o.type!=='space').map(cadLayerForObject));propertyText(t('property.layers'),layers.size?`${layers.size}`:'—');}return;}const onlyId=ids.size===1?[...ids][0]:state.selectedObjectId,obj=state.objects.find(o=>o.id===onlyId);if(obj){state.selectedObjectId=obj.id;propertyText(t('property.type'),localizedObjectType(obj.type));
      if(state.toolset==='cad'&&obj.type!=='space'){const layer=cadLayerForObject(obj);propertyText(t('property.layer'),layer);propertyActions([{label:cadLayerVisible(layer)?t('action.hideLayer'):t('action.showLayer'),run:()=>setCadLayerVisibilityUndoable(layer,!cadLayerVisible(layer))},{label:t('action.soloLayer'),run:()=>soloLayer(layer)},{label:t('action.showInLayers'),run:()=>{switchInspector('primary');renderCadLayersPanel();}}]);}
      if((obj.type==='wall'||obj.type==='line'||obj.type==='cadLine')&&obj.a&&obj.b){propertyNumber(t('property.length'),distance(obj.a,obj.b),v=>{if(v>0){if(obj.type==='wall'){if(!breakWallConstraintForEdit(obj,'length'))return;const ang=angleDeg(obj.a,obj.b),anchor=constrainedEndpointAnchor(obj,'a');setWallAngleAndLength(obj,ang,v,anchor);enforceWallConstraints(obj,{changed:anchor==='a'?'b':'a'});syncDependentsOfWall(obj.id);refreshSpaces();}else{pushHistory();const ang=rad(angleDeg(obj.a,obj.b));obj.b={x:obj.a.x+Math.cos(ang)*v,y:obj.a.y+Math.sin(ang)*v};}markDirty(true);rebuildObjectSnapIndex();updateAll();}},'mm');propertyNumber(t('property.angle'),angleDeg(obj.a,obj.b),v=>{if(Number.isFinite(v)){if(obj.type==='wall'){if(!breakWallConstraintForEdit(obj,'angle'))return;const len=distance(obj.a,obj.b),anchor=constrainedEndpointAnchor(obj,'a');setWallAngleAndLength(obj,v,len,anchor);enforceWallConstraints(obj,{changed:anchor==='a'?'b':'a'});syncDependentsOfWall(obj.id);refreshSpaces();}else{pushHistory();const len=distance(obj.a,obj.b),a=rad(v);obj.b={x:obj.a.x+Math.cos(a)*len,y:obj.a.y+Math.sin(a)*len};}markDirty(true);rebuildObjectSnapIndex();updateAll();}},'°');propertyText(t('property.start'),`${formatNumber(obj.a.x,1)}, ${formatNumber(obj.a.y,1)}`);propertyText(t('property.end'),`${formatNumber(obj.b.x,1)}, ${formatNumber(obj.b.y,1)}`);}
      if(obj.type==='wall'){propertyNumber(t('property.thickness'),obj.thickness,v=>{if(v>0){pushHistory();obj.thickness=v;markDirty(true);updateAll();}},'mm');const connected=Boolean(obj.attachments?.a||obj.attachments?.b),c=ensureWallConstraints(obj);propertyText(t('property.joint'),connected?t('value.connected'):t('value.free'));propertyText(t('property.constraints'),wallConstraintSummary(obj));propertyText(t('property.baseAxis'),`${formatNumber(baseAxisAngle(),1)}°${state.baseAxisWallId===obj.id?` · ${t('value.thisWall')}`:''}`);propertyActions(connected?[{label:t('action.detachJoint'),run:()=>{pushHistory();detachWallConnections(obj);markDirty(true);updateAll();}}]:[{label:t('action.attachJoint'),run:()=>{pushHistory();const ok=attachTouchingWallEndpoints(obj);if(!ok){state.history.pop();updateUndoRedo();alert(t('alert.noJointNearby'));return;}markDirty(true);updateAll();}}]);propertyActions([{label:t('action.constraintHorizontal'),run:()=>setWallConstraint(obj,'horizontal')},{label:t('action.constraintVertical'),run:()=>setWallConstraint(obj,'vertical')},{label:t('action.constraintParallel'),run:()=>setWallConstraint(obj,'parallel')},{label:t('action.constraintPerpendicular'),run:()=>setWallConstraint(obj,'perpendicular')},{label:t('action.constraintAngle'),run:()=>{const current=angleDelta(angleDeg(obj.a,obj.b),baseAxisAngle()),raw=prompt(t('prompt.constraintAngle'),String(Math.round(current*100)/100));if(raw!==null&&Number.isFinite(Number(raw)))setWallConstraint(obj,'angle',Number(raw));}},{label:t('action.constraintLength'),run:()=>setWallConstraint(obj,'length',distance(obj.a,obj.b))},{label:c.fixed?t('action.unfixPosition'):t('action.fixPosition'),run:()=>setWallConstraint(obj,'fixed')}]);propertyActions([{label:t('action.setBaseAxis'),run:()=>setBaseAxisFromWall(obj)},{label:t('action.clearBaseAxis'),run:clearBaseAxis},{label:t('action.clearConstraints'),run:()=>clearWallGeometricConstraints(obj)}]);}
      if(obj.type==='door'||obj.type==='window'){propertyNumber(t('property.width'),obj.width,v=>{if(v>0){pushHistory();obj.width=v;markDirty(true);rebuildObjectSnapIndex();updateAll();}},'mm');if(obj.type==='door'){propertyText(t('property.openingSide'),`${obj.hinge==='end'?t('value.hingeEnd'):t('value.hingeStart')} · ${obj.swing===-1?t('value.swingReverse'):t('value.swingNormal')}`);propertyActions([{label:t('action.flipHinge'),run:()=>{pushHistory();obj.hinge=obj.hinge==='end'?'start':'end';markDirty(true);updateAll();}},{label:t('action.flipSwing'),run:()=>{pushHistory();obj.swing=obj.swing===-1?1:-1;markDirty(true);updateAll();}}]);}}
      if(obj.type==='dimension'){const g=dimensionGeometry(obj);if(g){if(g.associated)propertyNumber(t('property.length'),g.len,v=>applyNumericLabelEdit({objectId:obj.id,kind:'dimensionLength'},v),'mm');else propertyText(t('property.length'),`${formatNumber(g.len,2)} mm`);if(g.associated)propertyText(t('property.association'),t('value.wallLinked'));propertyNumber(t('property.offset'),g.offset,v=>{pushHistory();obj.offset=v;markDirty(true);updateAll();},'mm');}}
      if(obj.type==='space'){propertyText(t('property.area'),`${formatNumber(obj.areaM2||Math.abs(polygonArea(obj.polygon||[]))/1e6,2)} m²`);propertyText(t('property.spaceId'),obj.spaceUuid||'—');propertyText(t('property.boundaryWalls'),String(obj.wallIds?.length||0));if(obj.invalid)propertyText(t('property.status'),t('space.invalid'));}
      if(obj.type==='cadCircle')propertyText(t('property.length'),`R ${formatNumber(obj.radius,2)} mm`);if(obj.source)propertyText(t('property.source'),obj.source);return;}
    const ref=state.references.find(r=>r.id===state.selectedReferenceId);if(ref){propertyText(t('property.reference'),ref.name);propertyText(t('property.type'),ref.type==='dxf'?'DXF':ref.type==='linkedCadRegion'?t('value.linkedCadReference'):t('value.image'));if(ref.type==='linkedCadRegion'){const region=state.drawingRegions.find(x=>x.id===ref.regionId);if(region)propertyText(t('property.region'),region.name);propertyText(t('property.layers'),String(ref.visibleLayers?.size||0));}else{propertyText(t('property.scale'),`${formatNumber(ref.scale,6)}×`);propertyText(t('property.origin'),`${formatNumber(ref.origin.x,1)}, ${formatNumber(ref.origin.y,1)}`);}propertyText(t('property.opacity'),`${Math.round(ref.opacity*100)}%`);return;}
    propertyText(t('property.version'),`v${VERSION} · Build ${BUILD}`);propertyText(t('property.document'),currentDocumentName());propertyText(t('property.toolset'),t(state.toolset==='plan'?'value.planTools':'value.cadTools'));propertyText(t('property.units'),INTERNAL_UNIT);propertyText(t('property.tool'),localizedToolName(state.activeTool));propertyText(t('property.baseAxis'),`${formatNumber(baseAxisAngle(),1)}°`);if(state.cadMapping)propertyText(t('property.mapping'),mappingSummary());}
  function propertyActions(items){const actions=document.createElement('div');actions.className='property-actions';for(const item of items){const b=document.createElement('button');b.className='property-action';b.textContent=item.label;b.addEventListener('click',item.run);actions.appendChild(b);}dom.propertiesPanel.appendChild(actions);}

  function mappingSummary(){const m=state.cadMapping;if(!m)return'—';return t('mapping.summary',{wallMode:t(`mapping.${m.wallRepresentation}`),wallLayer:m.wallLayer,doorLayer:m.doorLayer,windowLayer:m.windowLayer});}
  function propertyText(label,value){const row=document.createElement('div');row.className='property-row';row.innerHTML=`<div class="property-label">${escapeHtml(label)}</div><div class="property-value">${escapeHtml(String(value))}</div>`;dom.propertiesPanel.appendChild(row);}
  function propertyNumber(label,value,onChange,unit=''){const row=document.createElement('div');row.className='property-row';const l=document.createElement('div');l.className='property-label';l.textContent=label;const v=document.createElement('div');v.className='property-value';const input=document.createElement('input');input.type='number';input.step='0.01';input.value=String(Math.round(Number(value)*100)/100);input.addEventListener('change',()=>onChange(Number(input.value)));v.appendChild(input);if(unit){const u=document.createElement('span');u.className='property-unit';u.textContent=unit;v.appendChild(u);}row.append(l,v);dom.propertiesPanel.appendChild(row);}

  function switchInspector(tab){document.querySelectorAll('.inspector-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.inspector-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===tab));}
  function updateAxisStatus(){
    if(!dom.statusAxis)return;
    dom.statusAxis.textContent=`AXIS ${formatNumber(baseAxisAngle(),1)}°`;
    dom.statusAxis.classList.toggle('active',Boolean(state.baseAxisWallId));
    dom.statusAxis.title=state.baseAxisWallId?t('property.baseAxis'):'';
  }
  function updateAll(){updateUndoRedo();updateEmptyState();updateContextBar();updateDocumentStatus();updateCompactViewerState();updateAxisStatus();renderToolRail();renderPrimaryPanel();renderReferences();renderProperties();render();}

  function resetProject(){if(state.dirty&&!confirm(t('confirm.newDrawing')))return;state.references=[];state.objects=[];state.drawingRegions=[];state.selectedRegionId=null;state.selectedReferenceId=null;state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectionDrag=null;state.hoveredObjectId=null;state.layerFilter='';state.baseAxisAngle=0;state.baseAxisWallId=null;state.history=[];state.future=[];state.nextId=1;state.camera={cx:0,cy:0,zoom:.12};state.cadMapping=null;state.cadLayerVisibility=new Map([['0',true]]);state.activeCadLayer='0';state.sourceDxfName=null;state.sourceDxfMainBounds=null;state.sourceDxfFullBounds=null;state.sourceDxfOutlierCount=0;state.dirty=false;rebuildObjectSnapIndex();setTool('select',state.toolset==='plan'?'plan':'select');updateAll();}

  function createSample(){if(state.dirty&&!confirm(t('confirm.newDrawing')))return;state.references=[];state.objects=[];state.drawingRegions=[];state.selectedRegionId=null;state.selectedObjectIds.clear();state.selectionDrag=null;state.layerFilter='';state.baseAxisAngle=0;state.baseAxisWallId=null;state.history=[];state.future=[];state.nextId=1;const wall=(a,b,th=150)=>{const o={id:uid('wall'),type:'wall',layerId:'walls',a,b,thickness:th};state.objects.push(o);return o;};const outer=[wall({x:0,y:0},{x:8000,y:0},180),wall({x:8000,y:0},{x:8000,y:6000},180),wall({x:8000,y:6000},{x:0,y:6000},180),wall({x:0,y:6000},{x:0,y:0},180)];const innerV=wall({x:4200,y:0},{x:4200,y:6000},150),innerH=wall({x:0,y:3100},{x:4200,y:3100},150);attachWallEndpoint(innerV,'a');attachWallEndpoint(innerV,'b');attachWallEndpoint(innerH,'a');attachWallEndpoint(innerH,'b');state.objects.push({id:uid('door'),type:'door',layerId:'doors',wallId:innerV.id,t:.48,width:900,hinge:'start',swing:1},{id:uid('window'),type:'window',layerId:'windows',wallId:outer[2].id,t:.7,width:1600},{id:uid('window'),type:'window',layerId:'windows',wallId:outer[0].id,t:.25,width:1200},{id:uid('dimension'),type:'dimension',layerId:'dimensions',wallId:outer[0].id,t1:0,t2:1,offset:-650},{id:uid('cadLine'),type:'cadLine',cadLayer:'AXIS',a:{x:4200,y:-900},b:{x:4200,y:6900},source:'sample DXF'});state.cadLayerVisibility=new Map([['0',true],['AXIS',true]]);state.cadMapping=null;state.sourceDxfName=null;state.sourceDxfMainBounds=null;state.sourceDxfFullBounds=null;state.sourceDxfOutlierCount=0;state.dirty=false;state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectedReferenceId=null;rebuildObjectSnapIndex();switchToolset('plan',{skipMapping:true});updateAll();fitAll();}

  function runCommand(raw){const command=String(raw||'').trim().toUpperCase();if(!command)return;if(state.commandPending==='zoom'){if(command==='E'||command==='EXTENTS'){fitAll();setCommandStatus(t('command.zoomExtents'),'strong');state.commandPending=null;return;}setCommandStatus(t('command.unknown',{command}),'error');return;}
    if(command==='L'||command==='LINE'){setTool('line','draw');setCommandStatus(t('command.line'),'strong');}
    else if(command==='E'||command==='ERASE'){if(state.selectedObjectId){deleteObjectById(state.selectedObjectId);setCommandStatus('ERASE','strong');}else{setTool('delete','modify');setCommandStatus(t('command.erase'),'strong');}}
    else if(command==='DI'||command==='DIST'){setTool('measure','dimension');setCommandStatus(t('command.distance'),'strong');}
    else if(command==='Z'||command==='ZOOM'){state.commandPending='zoom';setCommandStatus(t('command.zoom'),'strong');}
    else if(command==='U'||command==='UNDO'){undo();setCommandStatus(t('command.undo'),'strong');}
    else if(command==='REDO'){redo();setCommandStatus(t('command.redo'),'strong');}
    else if(command==='WALL'){setTool('wall','architecture');if(state.cadMapping)setCommandStatus('WALL','strong');}
    else if(command==='DOOR'){setTool('door','architecture');if(state.cadMapping)setCommandStatus('DOOR','strong');}
    else if(command==='WINDOW'){setTool('window','architecture');if(state.cadMapping)setCommandStatus('WINDOW','strong');}
    else setCommandStatus(t('command.unknown',{command}),'error');}
  function setCommandStatus(text,kind=''){dom.commandStatus.className=`command-status ${kind}`.trim();dom.commandStatus.textContent=text;}

  function dxfPair(code,value){return`${code}\n${value}\n`;}
  function sanitizeLayer(name){return String(name||'0').replace(/[<>\\/:;?*|=",]/g,'_').slice(0,255)||'0';}
  function dxfLine(layer,a,b){return dxfPair(0,'LINE')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,a.x.toFixed(4))+dxfPair(20,a.y.toFixed(4))+dxfPair(30,'0')+dxfPair(11,b.x.toFixed(4))+dxfPair(21,b.y.toFixed(4))+dxfPair(31,'0');}
  function dxfCircle(layer,c,r){return dxfPair(0,'CIRCLE')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,c.x.toFixed(4))+dxfPair(20,c.y.toFixed(4))+dxfPair(30,'0')+dxfPair(40,r.toFixed(4));}
  function dxfArc(layer,c,r,startDeg,endDeg){return dxfPair(0,'ARC')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,c.x.toFixed(4))+dxfPair(20,c.y.toFixed(4))+dxfPair(30,'0')+dxfPair(40,r.toFixed(4))+dxfPair(50,startDeg.toFixed(6))+dxfPair(51,endDeg.toFixed(6));}
  function dxfText(layer,p,text,height=180){return dxfPair(0,'TEXT')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,p.x.toFixed(4))+dxfPair(20,p.y.toFixed(4))+dxfPair(30,'0')+dxfPair(40,height.toFixed(2))+dxfPair(1,String(text).replace(/[\r\n]/g,' '));}
  function exportDxf(){if(hasSemanticObjects()&&!state.cadMapping){openMappingDialog('export');return;}exportDxfNow();}
  function exportDxfNow(){const m=state.cadMapping||defaultCadMapping();let entities='';const layers=new Set(['0']);for(const o of state.objects){if(o.type==='cadLine'||o.type==='line'){const layer=o.cadLayer||'0';layers.add(layer);entities+=dxfLine(layer,o.a,o.b);}else if(o.type==='cadCircle'){const layer=o.cadLayer||'0';layers.add(layer);entities+=dxfCircle(layer,o.center,o.radius);}else if(o.type==='cadText'){const layer=o.cadLayer||'0';layers.add(layer);entities+=dxfText(layer,o.point,o.text||'');}else if(o.type==='wall'){layers.add(m.wallLayer);if(m.wallRepresentation==='outline'||m.wallRepresentation==='both')for(const[a,b]of wallOutlineVisibleWorld(o))entities+=dxfLine(m.wallLayer,a,b);if(m.wallRepresentation==='centerline'||m.wallRepresentation==='both')entities+=dxfLine(m.wallLayer,o.a,o.b);}else if(o.type==='door'){const d=doorGeometry(o);if(d){layers.add(m.doorLayer);entities+=dxfLine(m.doorLayer,d.hinge,d.leafEnd);let a0=(Math.atan2(d.closed.y,d.closed.x)*180/Math.PI+360)%360,a1=(a0+d.swing*90+360)%360;if(d.swing<0)[a0,a1]=[a1,a0];entities+=dxfArc(m.doorLayer,d.hinge,d.width,a0,a1);}}else if(o.type==='window'){/* emitted below */}else if(o.type==='dimension'){const g=dimensionGeometry(o);if(g){layers.add(m.dimensionLayer);entities+=dxfLine(m.dimensionLayer,g.d1,g.d2);entities+=dxfLine(m.dimensionLayer,g.p1,g.d1);entities+=dxfLine(m.dimensionLayer,g.p2,g.d2);entities+=dxfText(m.dimensionLayer,{x:(g.d1.x+g.d2.x)/2,y:(g.d1.y+g.d2.y)/2},`${formatNumber(g.len,1)} mm`,140);}}}
    // windows are added in a separate pass to keep the main loop readable after semantic conversion.
    for(const o of state.objects){if(o.type!=='window')continue;const g=openingGeometry(o);if(!g)continue;layers.add(m.windowLayer);const off=Math.min(50,(g.wall.thickness||150)*.35);for(const sign of[-1,1])entities+=dxfLine(m.windowLayer,{x:g.p1.x+g.nx*off*sign,y:g.p1.y+g.ny*off*sign},{x:g.p2.x+g.nx*off*sign,y:g.p2.y+g.ny*off*sign});}
    let layerTable=dxfPair(0,'TABLE')+dxfPair(2,'LAYER')+dxfPair(70,layers.size);for(const name of layers){layerTable+=dxfPair(0,'LAYER')+dxfPair(2,sanitizeLayer(name))+dxfPair(70,0)+dxfPair(62,7)+dxfPair(6,'CONTINUOUS');}layerTable+=dxfPair(0,'ENDTAB');
    const dxf=dxfPair(0,'SECTION')+dxfPair(2,'HEADER')+dxfPair(9,'$ACADVER')+dxfPair(1,'AC1009')+dxfPair(9,'$INSUNITS')+dxfPair(70,4)+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'TABLES')+layerTable+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'ENTITIES')+entities+dxfPair(0,'ENDSEC')+dxfPair(0,'EOF');
    const blob=new Blob([dxf],{type:'application/dxf;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=state.sourceDxfName?state.sourceDxfName.replace(/\.dxf$/i,'')+'_PieniPlan.dxf':`PieniPlan_v${VERSION}_Build${BUILD}.dxf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);markDirty(false);}

  const contextMenu=document.createElement('div');contextMenu.className='canvas-context-menu';contextMenu.hidden=true;document.body.appendChild(contextMenu);
  function hideContextMenu(){contextMenu.hidden=true;contextMenu.innerHTML='';}
  function addContextMenuItem(label,run,{danger=false,disabled=false}={}){const b=document.createElement('button');b.className=`context-menu-item ${danger?'danger':''}`;b.textContent=label;b.disabled=disabled;b.addEventListener('click',()=>{hideContextMenu();run();});contextMenu.appendChild(b);}
  function addContextMenuDivider(){const d=document.createElement('div');d.className='context-menu-divider';contextMenu.appendChild(d);}
  function duplicateObject(obj){if(!obj||obj.type==='space')return;pushHistory();const copy=JSON.parse(JSON.stringify(obj));copy.id=uid(obj.type);if(copy.type==='door'||copy.type==='window'){copy.t=clamp((copy.t??.5)+.08,0,1);}else if(copy.type==='dimension'){copy.offset=(copy.offset||0)+120;}else if(copy.a&&copy.b){copy.a.x+=200;copy.b.x+=200;if(copy.type==='wall')copy.attachments={};}else if(copy.type==='cadCircle')copy.center.x+=200;else if(copy.point)copy.point.x+=200;state.objects.push(copy);state.selectedObjectId=copy.id;markDirty(true);rebuildObjectSnapIndex();updateAll();}
  function showCanvasContextMenu(e){if(isCompactViewer())return;e.preventDefault();hideTooltip();const raw=screenCssToWorld(fromPointerEvent(e)),obj=hitObject(raw);if(obj){state.selectedObjectId=obj.id;state.selectedReferenceId=null;state.selectedRegionId=null;renderPrimaryPanel();renderProperties();render();addContextMenuItem(t('action.properties'),()=>switchInspector('properties'));if(obj.type==='door'){addContextMenuDivider();addContextMenuItem(t('action.flipHinge'),()=>{pushHistory();obj.hinge=obj.hinge==='end'?'start':'end';markDirty(true);updateAll();});addContextMenuItem(t('action.flipSwing'),()=>{pushHistory();obj.swing=obj.swing===-1?1:-1;markDirty(true);updateAll();});}if(obj.type==='wall'){addContextMenuDivider();const connected=Boolean(obj.attachments?.a||obj.attachments?.b);addContextMenuItem(connected?t('action.detachJoint'):t('action.attachJoint'),()=>{pushHistory();if(connected)detachWallConnections(obj);else if(!attachTouchingWallEndpoints(obj)){state.history.pop();alert(t('alert.noJointNearby'));return;}markDirty(true);updateAll();});}
      if(state.toolset==='cad'&&obj.type!=='space'){const layer=cadLayerForObject(obj);addContextMenuDivider();addContextMenuItem(cadLayerVisible(layer)?t('action.hideLayer'):t('action.showLayer'),()=>setCadLayerVisibilityUndoable(layer,!cadLayerVisible(layer)));addContextMenuItem(t('action.soloLayer'),()=>soloLayer(layer));addContextMenuItem(t('action.showInLayers'),()=>{switchInspector('primary');renderCadLayersPanel();});}
      if(obj.type!=='space'){addContextMenuDivider();addContextMenuItem(t('action.duplicate'),()=>duplicateObject(obj));}addContextMenuItem(t('action.delete'),()=>deleteObjectById(obj.id),{danger:true});
    }else{if(state.toolset==='cad'){addContextMenuItem(t('action.defineRegion'),()=>setTool('region','select'));addContextMenuItem(t('action.fit'),fitAll);if(state.sourceDxfOutlierCount>0)addContextMenuItem(t('action.fitAllEntities'),fitFullExtents);addContextMenuDivider();addContextMenuItem(t('action.showAllLayers'),showAllCadLayers);}else{addContextMenuItem(t('action.selectTool'),()=>setTool('select','plan'));addContextMenuItem(t('action.fit'),fitAll);}}
    if(!contextMenu.childElementCount)return;contextMenu.hidden=false;const margin=8,rect=contextMenu.getBoundingClientRect();contextMenu.style.left=`${Math.min(e.clientX,window.innerWidth-rect.width-margin)}px`;contextMenu.style.top=`${Math.min(e.clientY,window.innerHeight-rect.height-margin)}px`;
  }

  let tooltipTimer=null,tooltipOwner=null;
  function tooltipTargetFrom(node){return node instanceof Element?node.closest('[data-tooltip-key],[data-tooltip-title-key],[data-tooltip-title]'):null;}
  function hideTooltip(){clearTimeout(tooltipTimer);tooltipTimer=null;tooltipOwner=null;dom.uiTooltip.hidden=true;dom.uiTooltip.innerHTML='';}
  function showTooltip(owner){if(!owner?.isConnected)return;const title=owner.dataset.tooltipTitleKey?t(owner.dataset.tooltipTitleKey):(owner.dataset.tooltipTitle||''),copy=owner.dataset.tooltipKey?t(owner.dataset.tooltipKey):'',shortcut=owner.dataset.shortcut||'';if(!title&&!copy&&!shortcut)return;const parts=[];if(title)parts.push(`<div class="tooltip-title">${escapeHtml(title)}</div>`);if(copy)parts.push(`<div class="tooltip-copy">${escapeHtml(copy)}</div>`);if(shortcut)parts.push(`<div class="tooltip-shortcut">${escapeHtml(t('tooltip.shortcut'))} · ${escapeHtml(shortcut)}</div>`);dom.uiTooltip.innerHTML=parts.join('');dom.uiTooltip.hidden=false;const rect=owner.getBoundingClientRect(),tip=dom.uiTooltip.getBoundingClientRect(),margin=8;let left=rect.left+rect.width/2-tip.width/2;left=Math.max(margin,Math.min(window.innerWidth-tip.width-margin,left));let top=rect.top-tip.height-margin;if(top<margin)top=rect.bottom+margin;top=Math.max(margin,Math.min(window.innerHeight-tip.height-margin,top));dom.uiTooltip.style.left=`${Math.round(left)}px`;dom.uiTooltip.style.top=`${Math.round(top)}px`;}
  function scheduleTooltip(owner,delay){clearTimeout(tooltipTimer);tooltipOwner=owner;tooltipTimer=setTimeout(()=>{if(tooltipOwner===owner)showTooltip(owner);},delay);}
  function installTooltips(){document.addEventListener('pointerover',e=>{const owner=tooltipTargetFrom(e.target);if(!owner||owner.contains(e.relatedTarget))return;scheduleTooltip(owner,650);});document.addEventListener('pointerout',e=>{const owner=tooltipTargetFrom(e.target);if(!owner||owner.contains(e.relatedTarget))return;hideTooltip();});document.addEventListener('focusin',e=>{const owner=tooltipTargetFrom(e.target);if(owner)scheduleTooltip(owner,450);});document.addEventListener('focusout',e=>{const owner=tooltipTargetFrom(e.target);if(owner)hideTooltip();});document.addEventListener('pointerdown',hideTooltip,true);}

  function isTyping(){const a=document.activeElement;return a&&(['INPUT','TEXTAREA','SELECT'].includes(a.tagName)||a.isContentEditable);}
  function canvasShortcutContext(){const a=document.activeElement;return !a||a===document.body||a===host||a===canvas;}
  function cancelTransient(){state.drawStart=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;state.calibration=null;state.regionDrag=null;state.selectionDrag=null;state.snapIndicator=null;state.commandPending=null;dom.toolPopover.hidden=true;dom.dialogBackdrop.hidden=true;setCommandStatus(t('command.cancelled'));updateContextBar();render();}

  dom.startPlanBtn.addEventListener('click',()=>switchToolset('plan',{skipMapping:true}));
  dom.startCadBtn.addEventListener('click',()=>switchToolset('cad',{skipMapping:true}));
  dom.startSampleBtn.addEventListener('click',createSample);
  dom.continueWorkBtn.addEventListener('click',()=>switchToolset(state.toolset,{skipMapping:true}));
  dom.backBtn.addEventListener('click',()=>history.back());
  dom.homeBtn.addEventListener('click',()=>showStartScreen());
  dom.planToolsBtn.addEventListener('click',()=>switchToolset('plan'));
  dom.cadToolsBtn.addEventListener('click',()=>switchToolset('cad'));
  dom.appearanceBtn.addEventListener('click',e=>{e.stopPropagation();toggleAppearanceMenu(dom.appearanceBtn);});
  dom.startAppearanceBtn.addEventListener('click',e=>{e.stopPropagation();toggleAppearanceMenu(dom.startAppearanceBtn);});
  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{applyTheme(button.dataset.themeChoice);dom.appearanceMenu.hidden=true;}));
  document.querySelectorAll('.inspector-tab').forEach(b=>b.addEventListener('click',()=>switchInspector(b.dataset.tab)));

  dom.openRefBtn.addEventListener('click',()=>dom.referenceFileInput.click());dom.emptyOpenBtn.addEventListener('click',()=>state.toolset==='cad'?dom.dxfEditFileInput.click():dom.referenceFileInput.click());dom.addReferenceBtn.addEventListener('click',()=>dom.referenceFileInput.click());
  dom.referenceFileInput.addEventListener('change',()=>openReferenceFile(dom.referenceFileInput.files?.[0]));
  dom.openDxfBtn.addEventListener('click',()=>dom.dxfEditFileInput.click());dom.dxfEditFileInput.addEventListener('change',()=>openEditableDxf(dom.dxfEditFileInput.files?.[0]));
  dom.fitBtn.addEventListener('click',fitAll);dom.fullExtentsBtn?.addEventListener('click',fitFullExtents);dom.newBtn.addEventListener('click',resetProject);dom.undoBtn.addEventListener('click',undo);dom.redoBtn.addEventListener('click',redo);dom.exportDxfBtn.addEventListener('click',exportDxf);
  dom.emptyPrimaryBtn.addEventListener('click',()=>setTool(state.toolset==='plan'?'wall':'line',state.toolset==='plan'?'plan':'draw'));
  dom.mappingSettingsBtn.addEventListener('click',()=>openMappingDialog('settings'));dom.mappingApplyBtn.addEventListener('click',applyMapping);dom.mappingCancelBtn.addEventListener('click',cancelMapping);
  dom.gridToggle.addEventListener('click',()=>{state.grid=!state.grid;dom.gridToggle.classList.toggle('active',state.grid);render();});dom.snapToggle.addEventListener('click',()=>{state.snap=!state.snap;dom.snapToggle.classList.toggle('active',state.snap);});dom.orthoToggle.addEventListener('click',()=>{state.ortho=!state.ortho;dom.orthoToggle.classList.toggle('active',state.ortho);render();});
  dom.dialogCancelBtn.addEventListener('click',()=>{dom.dialogBackdrop.hidden=true;state.calibration=null;state.previewEnd=null;updateAll();});dom.dialogApplyBtn.addEventListener('click',applyCalibration);dom.dialogInput.addEventListener('keydown',e=>{if(e.key==='Enter')applyCalibration();if(e.key==='Escape')dom.dialogCancelBtn.click();});
  dom.commandInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const raw=dom.commandInput.value;dom.commandInput.value='';runCommand(raw);}else if(e.key==='Escape'){e.preventDefault();dom.commandInput.value='';cancelTransient();host.focus();}});

  canvas.addEventListener('pointermove',onPointerMove);canvas.addEventListener('pointerdown',onPointerDown);canvas.addEventListener('pointerup',onPointerUp);canvas.addEventListener('pointercancel',onPointerUp);canvas.addEventListener('dblclick',onCanvasDoubleClick);canvas.addEventListener('wheel',onWheel,{passive:false});canvas.addEventListener('contextmenu',showCanvasContextMenu);
  host.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});host.addEventListener('drop',e=>{e.preventDefault();const file=e.dataTransfer.files?.[0];if(file)openReferenceFile(file);});
  window.addEventListener('resize',()=>{updateCompactViewerState();resizeCanvas();});
  window.addEventListener('popstate',e=>applyRoute(e.state));
  window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change',()=>{if(state.theme==='system'){updateThemeMeta();render();}});
  window.addEventListener('keydown',e=>{
    if(state.view!=='workspace'){if(e.key==='Escape')dom.appearanceMenu.hidden=true;return;}
    if(e.code==='Space'&&!isTyping()&&canvasShortcutContext()){if(!state.spaceDown)state.spaceGesture={used:false,started:performance.now()};state.spaceDown=true;e.preventDefault();}
    if(!isTyping()&&e.key==='F3'){e.preventDefault();state.snap=!state.snap;dom.snapToggle.classList.toggle('active',state.snap);render();}
    if(!isTyping()&&e.key==='F7'){e.preventDefault();state.grid=!state.grid;dom.gridToggle.classList.toggle('active',state.grid);render();}
    if(!isTyping()&&e.key==='F8'){e.preventDefault();state.ortho=!state.ortho;dom.orthoToggle.classList.toggle('active',state.ortho);render();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!isTyping()){e.preventDefault();e.shiftKey?redo():undo();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'&&!isTyping()){e.preventDefault();redo();}
    if(e.key==='Escape'){hideTooltip();hideContextMenu();if(state.selectionDrag){state.selectionDrag=null;render();}else if(state.activeTool==='select'&&selectionIds().size){clearMultiSelection();renderPrimaryPanel();renderProperties();render();}else cancelTransient();}
    if((e.key==='Delete'||e.key==='Backspace')&&!isTyping()&&selectionIds().size){e.preventDefault();deleteSelectedObjects();}
    if(state.toolset==='cad'&&!isTyping()&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&/^[a-zA-Z]$/.test(e.key)){e.preventDefault();dom.commandInput.focus();dom.commandInput.value=e.key.toUpperCase();}
  });
  window.addEventListener('keyup',e=>{if(e.code==='Space'){const gesture=state.spaceGesture;state.spaceDown=false;state.spaceGesture=null;if(!state.pan)host.dataset.pan='false';if(gesture&&!gesture.used&&(performance.now()-gesture.started)<420&&state.view==='workspace'&&state.toolset==='plan'&&!isTyping()&&canvasShortcutContext())setTool('select','plan');}});
  window.addEventListener('beforeunload',e=>{if(state.dirty){e.preventDefault();e.returnValue='';}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.tool-rail')&&!e.target.closest('.tool-popover'))dom.toolPopover.hidden=true;if(!e.target.closest('#appearanceMenu')&&!e.target.closest('#appearanceBtn')&&!e.target.closest('#startAppearanceBtn'))dom.appearanceMenu.hidden=true;if(!e.target.closest('.canvas-context-menu'))hideContextMenu();});

  applyShortcutMetadata(dom.gridToggle,'grid','tooltip.grid');applyShortcutMetadata(dom.snapToggle,'snap','tooltip.snap');applyShortcutMetadata(dom.orthoToggle,'ortho','tooltip.ortho');
  dom.dialogBackdrop.hidden=true;dom.mappingBackdrop.hidden=true;dom.commandBar.hidden=true;i18n.apply(document);state.theme=safeReadTheme();applyTheme(state.theme,{persist:false});installTooltips();updateEmptyState();renderToolRail();updateAll();setCommandStatus(t('command.ready'));updateContinueCard();history.replaceState({[ROUTE_MARKER]:true,view:'start',toolset:state.toolset},'',location.href);showStartScreen({historyMode:'none'});setTimeout(resizeCanvas,0);console.info(`PieniPlan v${VERSION} · Build ${BUILD}`);
})();
