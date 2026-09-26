(() => {
  'use strict';

  const VERSION = '0.15.0';
  const BUILD = 18;
  const INTERNAL_UNIT = 'mm';
  const i18n = window.PieniPlanI18n;
  const t = (key, vars) => i18n.t(key, vars);
  i18n.apply(document);

  const $ = (id) => document.getElementById(id);
  const canvas = $('drawingCanvas');
  const host = $('canvasHost');
  const ctx = canvas.getContext('2d');

  const dom = {
    appShell: $('appShell'), contextBar: $('contextBar'), startScreen: $('startScreen'), startPlanBtn: $('startPlanBtn'), startCadBtn: $('startCadBtn'), startSampleBtn: $('startSampleBtn'), documentStatus: $('documentStatus'), mobileViewerBadge: $('mobileViewerBadge'),
    continueWorkBtn: $('continueWorkBtn'), continueWorkDetail: $('continueWorkDetail'), backBtn: $('backBtn'), homeBtn: $('homeBtn'), appearanceBtn: $('appearanceBtn'), startAppearanceBtn: $('startAppearanceBtn'), appearanceMenu: $('appearanceMenu'), documentTitle: $('documentTitle'), documentDirtyDot: $('documentDirtyDot'),
    viewMenuBtn: $('viewMenuBtn'), fileMenuBtn: $('fileMenuBtn'), settingsMenuBtn: $('settingsMenuBtn'), viewMenu: $('viewMenu'), fileMenu: $('fileMenu'), settingsMenu: $('settingsMenu'),
    viewFitAction: $('viewFitAction'), viewAllAction: $('viewAllAction'), fileNewAction: $('fileNewAction'), fileOpenProjectAction: $('fileOpenProjectAction'), fileSaveProjectAction: $('fileSaveProjectAction'), fileDownloadProjectAction: $('fileDownloadProjectAction'), fileOpenDxfAction: $('fileOpenDxfAction'), fileExportDxfAction: $('fileExportDxfAction'), helpBtn: $('helpBtn'), aboutBtn: $('aboutBtn'), helpBackdrop: $('helpBackdrop'), aboutBackdrop: $('aboutBackdrop'), helpCloseBtn: $('helpCloseBtn'), aboutCloseBtn: $('aboutCloseBtn'), helpContent: $('helpContent'), aboutVersion: $('aboutVersion'),
    planToolsBtn: $('planToolsBtn'), cadToolsBtn: $('cadToolsBtn'), toolRail: $('toolRail'), toolPopover: $('toolPopover'),
    newBtn: $('newBtn'), openProjectBtn: $('openProjectBtn'), saveProjectBtn: $('saveProjectBtn'), projectFileInput: $('projectFileInput'), openRefBtn: $('openRefBtn'), emptyOpenBtn: $('emptyOpenBtn'), addReferenceBtn: $('addReferenceBtn'),
    openDxfBtn: $('openDxfBtn'), dxfEditFileInput: $('dxfEditFileInput'), referenceFileInput: $('referenceFileInput'),
    fitBtn: $('fitBtn'), fullExtentsBtn: $('fullExtentsBtn'), undoBtn: $('undoBtn'), redoBtn: $('redoBtn'), exportDxfBtn: $('exportDxfBtn'),
    contextToolName: $('contextToolName'), contextFields: $('contextFields'), contextHint: $('contextHint'),
    emptyState: $('emptyState'), emptyKicker: $('emptyKicker'), emptyTitle: $('emptyTitle'), emptyCopy: $('emptyCopy'), emptyPrimaryBtn: $('emptyPrimaryBtn'),
    primaryInspectorTab: $('primaryInspectorTab'), primaryPanelTitle: $('primaryPanelTitle'), primaryPanelSubtitle: $('primaryPanelSubtitle'), primaryControls: $('primaryControls'), primaryList: $('primaryList'), mappingSettingsBtn: $('mappingSettingsBtn'),
    referenceList: $('referenceList'), propertiesPanel: $('propertiesPanel'),
    statusX: $('statusX'), statusY: $('statusY'), statusUnits: $('statusUnits'), statusAxis: $('statusAxis'), statusZoom: $('statusZoom'),
    gridToggle: $('gridToggle'), snapToggle: $('snapToggle'), orthoToggle: $('orthoToggle'), polarToggle: $('polarToggle'),
    progressToast: $('progressToast'), progressTitle: $('progressTitle'), progressBar: $('progressBar'), progressDetail: $('progressDetail'),
    canvasHud: $('canvasHud'), commandBar: $('commandBar'), commandInput: $('commandInput'), commandStatus: $('commandStatus'),
    dialogBackdrop: $('dialogBackdrop'), dialogTitle: $('dialogTitle'), dialogCopy: $('dialogCopy'), dialogInput: $('dialogInput'), dialogCancelBtn: $('dialogCancelBtn'), dialogApplyBtn: $('dialogApplyBtn'),
    confirmBackdrop: $('confirmBackdrop'), confirmTitle: $('confirmTitle'), confirmCopy: $('confirmCopy'), confirmCancelBtn: $('confirmCancelBtn'), confirmApplyBtn: $('confirmApplyBtn'),
    exportSaveBackdrop: $('exportSaveBackdrop'), exportSaveTitle: $('exportSaveTitle'), exportSaveCopy: $('exportSaveCopy'), exportSaveName: $('exportSaveName'), exportSaveCancelBtn: $('exportSaveCancelBtn'), exportSaveApplyBtn: $('exportSaveApplyBtn'), startVersion: $('startVersion'),
    mappingBackdrop: $('mappingBackdrop'), recognitionBackdrop: $('recognitionBackdrop'), recognitionTitle: $('recognitionTitle'), recognitionCopy: $('recognitionCopy'), recognitionStats: $('recognitionStats'), recognitionBreakdown: $('recognitionBreakdown'), recognitionCreateWalls: $('recognitionCreateWalls'), recognitionCreateSpaces: $('recognitionCreateSpaces'), recognitionCreateDoors: $('recognitionCreateDoors'), recognitionCreateStairs: $('recognitionCreateStairs'), recognitionCancelBtn: $('recognitionCancelBtn'), recognitionApplyBtn: $('recognitionApplyBtn'), wallRepresentation: $('wallRepresentation'), wallLayerInput: $('wallLayerInput'), doorLayerInput: $('doorLayerInput'), windowLayerInput: $('windowLayerInput'), dimensionLayerInput: $('dimensionLayerInput'), mappingCancelBtn: $('mappingCancelBtn'), mappingApplyBtn: $('mappingApplyBtn'),
    uiTooltip: $('uiTooltip')
  };

  const planLayers = [
    { id: 'drawing', nameKey: 'layer.drawing', visible: true },
    { id: 'walls', nameKey: 'layer.walls', visible: true },
    { id: 'doors', nameKey: 'layer.doors', visible: true },
    { id: 'windows', nameKey: 'layer.windows', visible: true },
    { id: 'spaces', nameKey: 'layer.spaces', visible: true },
    { id: 'dimensions', nameKey: 'layer.dimensions', visible: true },
    { id: 'stairs', nameKey: 'layer.stairs', visible: true }
  ];

  const planToolCatalog = {
    select: [
      { id: 'select', labelKey: 'tool.select', ready: true },
      { id: 'constraint', labelKey: 'tool.constraint', ready: true, tooltipKey: 'tooltip.constraintTool' },
      { id: 'measure', labelKey: 'tool.measure', ready: true, note: 'DI' }
    ],
    draw: [
      { id: 'line', labelKey: 'tool.line', ready: true, note: 'L' },
      // Curved boundaries remain available as a second drawing primitive. The user-facing
      // model is still one Plan line/boundary concept; `wall` is only the legacy internal
      // tool id used by the existing three-point arc implementation.
      { id: 'wall', labelKey: 'tool.arcLine', ready: true }
    ],
    architecture: [
      { id: 'door', labelKey: 'tool.door', ready: true },
      { id: 'window', labelKey: 'tool.window', ready: true },
      { id: 'space', labelKey: 'tool.space', ready: true, tooltipKey: 'tooltip.defineSpace' }
    ],
    modify: [
      { id: 'move', labelKey: 'tool.move', ready: true, note: 'M' },
      { id: 'copy', labelKey: 'tool.copy', ready: true, note: 'CO' },
      { id: 'trim', labelKey: 'tool.trim', ready: true, note: 'TR' },
      { id: 'extend', labelKey: 'tool.extend', ready: true, note: 'EX' },
      { id: 'delete', labelKey: 'tool.delete', ready: true, note: 'E' }
    ]
  };

  const planCategories = [
    { id: 'select', labelKey: 'category.select', icon: 'select' },
    { id: 'draw', labelKey: 'category.draw', icon: 'draw' },
    { id: 'architecture', labelKey: 'category.elements', icon: 'architecture' },
    { id: 'modify', labelKey: 'category.modify', icon: 'modify' }
  ];

  // Photoshop-style grouped rail: a normal click repeats the group's last-used tool;
  // long-press, right-click, or the corner marker opens the full group.
  const toolCategoryMemory = { plan: Object.create(null), cad: Object.create(null) };
  const toolIconFallback = { select:'select', constraint:'vector', region:'vector', line:'line', wall:'wall', door:'door', window:'window', space:'space', measure:'dimension', move:'modify', copy:'modify', trim:'modify', extend:'modify', delete:'modify' };

  const wallTypeCatalog = [
    { id:'straight', labelKey:'wallType.straight' },
    { id:'arc', labelKey:'wallType.arc' }
  ];

  const doorTypeCatalog = [
    { id:'hingedSingle', labelKey:'doorType.hingedSingle' },
    { id:'hingedDouble', labelKey:'doorType.hingedDouble' },
    { id:'slidingSingle', labelKey:'doorType.slidingSingle' },
    { id:'slidingDouble', labelKey:'doorType.slidingDouble' },
    { id:'pocket', labelKey:'doorType.pocket' }
  ];

  const constraintCatalog = [
    { id: 'coincident', labelKey: 'constraintTool.coincident', noteKey: 'constraintTool.coincidentNote' },
    { id: 'horizontal', labelKey: 'constraintTool.horizontal' },
    { id: 'vertical', labelKey: 'constraintTool.vertical' },
    { id: 'parallel', labelKey: 'constraintTool.parallel' },
    { id: 'perpendicular', labelKey: 'constraintTool.perpendicular' },
    { id: 'angle', labelKey: 'constraintTool.angle' },
    { id: 'length', labelKey: 'constraintTool.length' },
    { id: 'fixed', labelKey: 'constraintTool.fixed' },
    { separator: true },
    { id: 'baseAxis', labelKey: 'constraintTool.baseAxis' },
    { id: 'clearBaseAxis', labelKey: 'constraintTool.clearBaseAxis' }
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
      { id: 'trim', labelKey: 'tool.trim', ready: true, note: 'TR' },
      { id: 'extend', labelKey: 'tool.extend', ready: true, note: 'EX' },
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
    drawReferenceAngle: null,
    previewEnd: null,
    previewOpening: null,
    measureStart: null,
    calibration: null,
    grid: true,
    snap: true,
    ortho: false,
    polar: false,
    shiftDown: false,
    ctrlDown: false,
    spaceDown: false,
    spaceGesture: null,
    pan: null,
    nextId: 1,
    history: [],
    future: [],
    toolSettings: { wallThickness: 150, wallType:'straight', doorWidth: 900, doorType:'hingedSingle', windowWidth: 1200 },
    cadMapping: null,
    mappingPendingAction: null,
    pendingToolAfterMapping: null,
    commandPending: null,
    sourceDxfName: null,
    sourceDxfMainBounds: null,
    sourceDxfFullBounds: null,
    sourceDxfOutlierCount: 0,
    sourceDxfFingerprint: null,
    sourceDxfSize: 0,
    sourceDxfLastModified: 0,
    projectFileName: null,
    projectFileHandle: null,
    projectLocalKey: null,
    browserSavedMeta: null,
    dirty: false,
    objectSnapIndex: null,
    snapIndicator: null,
    trimPreview: null,
    drawingRegions: [],
    selectedRegionId: null,
    regionDrag: null,
    selectionDrag: null,
    selectedObjectIds: new Set(),
    editableLabels: [],
    layerFilter: '',
    layerRevealRequested: false,
    baseAxisAngle: 0,
    baseAxisWallId: null,
    lastCommand: null,
    view: 'start',
    workspaceVisited: false,
    theme: 'system',
    viewerPointers: new Map(),
    viewerGesture: null,
    constraintMode: null,
    constraintPicks: [],
    constraintHover: null,
    pointerAffordance: null,
    wallRecognitionPreview: null,
    recognitionHistory: [],
    arcDraft: null,
    inspectorSplit: 0.64,
    floors: [{id:'floor_1',name:'1F',sourceRegionId:null}],
    activeFloorId: 'floor_1',
    cadRenderRevision: 0,
    floorMenuEl: null,
    confirmAction: null,
    pendingDxfExport: null
  };

  const linkedCadRenderCache = new WeakMap();
  let planObjectCache = { revision:-1, count:-1, floorId:null, objects:[] };
  function getPlanObjects(){const revision=state.cadRenderRevision||0,count=state.objects.length,floorId=state.activeFloorId;if(planObjectCache.revision===revision&&planObjectCache.count===count&&planObjectCache.floorId===floorId)return planObjectCache.objects;const objects=state.objects.filter(o=>(isSemanticObject(o)||o.type==='line')&&objectOnActiveFloor(o));planObjectCache={revision,count,floorId,objects};return objects;}

  const THEME_STORAGE_KEY = 'pieniplan-theme';
  const INSPECTOR_SPLIT_STORAGE_KEY = 'pieniplan-cad-manager-split';
  const ROUTE_MARKER = 'pieniplan';
  const LOCAL_PROJECT_DB = 'PieniPlanProjects';
  const LOCAL_PROJECT_STORE = 'projects';
  const LOCAL_PROJECT_KEY = 'last-project';
  const LOCAL_PROJECT_META_KEY = 'pieniplan-local-project-meta';
  const SHORTCUTS = Object.freeze({
    undo: 'Ctrl/Cmd+Z', redo: 'Ctrl/Cmd+Shift+Z', select: 'Space', pan: 'Hold Space + drag',
    delete: 'Delete / Backspace', cancel: 'Esc', grid: 'F7', snap: 'F3', ortho: 'F8', polar: 'F10',
    line: 'L', erase: 'E', distance: 'DI', zoom: 'Z', trim:'TR', extend:'EX'
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

  function safeReadInspectorSplit() {
    try {
      const value = Number(localStorage.getItem(INSPECTOR_SPLIT_STORAGE_KEY));
      return Number.isFinite(value) ? clamp(value, .28, .78) : .64;
    } catch (_) { return .64; }
  }
  function persistInspectorSplit(value){
    state.inspectorSplit=clamp(Number(value)||.64,.28,.78);
    try{localStorage.setItem(INSPECTOR_SPLIT_STORAGE_KEY,String(state.inspectorSplit));}catch(_){}
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
    return state.projectFileName || state.sourceDxfName || t('document.new');
  }

  function updateDocumentStatus() {
    const name=currentDocumentName();
    if (dom.documentStatus) { dom.documentStatus.textContent = name; dom.documentStatus.classList.toggle('dirty', state.dirty); }
    if (dom.documentTitle) dom.documentTitle.textContent=name.replace(/\.pieniplan$/i,'');
    if (dom.documentDirtyDot) dom.documentDirtyDot.hidden=!state.dirty;
    if (dom.fullExtentsBtn) dom.fullExtentsBtn.hidden = !(state.toolset === 'cad' && state.sourceDxfOutlierCount > 0);
  }

  function markDirty(value = true) {
    state.dirty = value;
    updateDocumentStatus();
  }

  function activeFloor(){return state.floors.find(f=>f.id===state.activeFloorId)||state.floors[0]||null;}
  function ensureFloorModel(){
    if(!Array.isArray(state.floors)||!state.floors.length)state.floors=[{id:'floor_1',name:'1F',sourceRegionId:null}];
    if(!state.floors.some(f=>f.id===state.activeFloorId))state.activeFloorId=state.floors[0].id;
    const floorId=state.activeFloorId;
    for(const o of state.objects)if(isSemanticObject(o)&&!o.floorId)o.floorId=floorId;
  }
  function objectOnActiveFloor(o){return !o?.floorId||o.floorId===state.activeFloorId;}
  function semanticObjectsOnActiveFloor(){ensureFloorModel();return getPlanObjects().filter(isSemanticObject);}
  function addFloor(){ensureFloorModel();pushHistory();let n=1,name;const names=new Set(state.floors.map(f=>f.name));do{name=`${n++}F`;}while(names.has(name));const floor={id:`floor_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name,sourceRegionId:null};state.floors.push(floor);state.activeFloorId=floor.id;clearMultiSelection();markDirty(true);updateAll();switchInspector('primary');}
  function commitFloorRename(floor,value){const name=String(value||'').trim();if(!name||name===floor.name){renderPlanFloorPanel();return;}pushHistory();floor.name=name;markDirty(true);updateAll();}
  function showAppConfirm({title,copy,confirmLabel,onConfirm,danger=true}){state.confirmAction=typeof onConfirm==='function'?onConfirm:null;dom.confirmTitle.textContent=title;dom.confirmCopy.textContent=copy;dom.confirmApplyBtn.textContent=confirmLabel;dom.confirmApplyBtn.classList.toggle('danger',danger);dom.confirmBackdrop.hidden=false;dom.confirmApplyBtn.focus();}
  function hideAppConfirm(){dom.confirmBackdrop.hidden=true;state.confirmAction=null;}
  function deleteFloor(floor){ensureFloorModel();if(state.floors.length<=1){setCommandStatus(t('floor.keepOne'),'error');return;}showAppConfirm({title:t('floor.deleteTitle',{name:floor.name}),copy:t('floor.deleteConfirm',{name:floor.name}),confirmLabel:t('floor.deleteAction',{name:floor.name}),onConfirm:()=>{pushHistory();state.objects=state.objects.filter(o=>!o.floorId||o.floorId!==floor.id);state.floors=state.floors.filter(f=>f.id!==floor.id);state.activeFloorId=state.floors[0].id;clearMultiSelection();markDirty(true);rebuildObjectSnapIndex();updateAll();}});}
  function setActiveFloor(id){if(!state.floors.some(f=>f.id===id))return;state.activeFloorId=id;clearMultiSelection();const f=activeFloor();if(f?.sourceRegionId){const r=state.drawingRegions.find(x=>x.id===f.sourceRegionId);if(r)fitBounds(r);}updateAll();}

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

  function closeTopMenus(except=null){for(const m of [dom.viewMenu,dom.fileMenu,dom.settingsMenu])if(m&&m!==except)m.hidden=true;}
  function positionTopMenu(menu,owner){if(!menu||!owner)return;const r=owner.getBoundingClientRect();menu.hidden=false;const b=menu.getBoundingClientRect(),margin=8;let left=Math.min(window.innerWidth-b.width-margin,Math.max(margin,r.right-b.width));let top=r.bottom+6;if(top+b.height>window.innerHeight-margin)top=r.top-b.height-6;menu.style.left=`${Math.round(left)}px`;menu.style.top=`${Math.round(Math.max(margin,top))}px`;}
  function toggleTopMenu(menu,owner){const opening=menu.hidden;closeTopMenus(opening?menu:null);if(opening)positionTopMenu(menu,owner);else menu.hidden=true;}
  function helpHtml(section){const ko=i18n.language==='ko';const data={
    intro:ko?`<h2>PieniPlan 사용 안내</h2><p>PieniPlan은 하나의 실제 좌표계에서 <strong>Plan Mode</strong>와 <strong>CAD Mode</strong>를 오가며 작업하는 웹 평면도 편집기입니다.</p><h3>두 모드의 역할</h3><ul><li><strong>Plan Mode</strong>: 복잡한 CAD 표현을 층별 연결선과 문·창·공간·계단 같은 의미 요소로 단순화해 빠르게 읽고 수정합니다.</li><li><strong>CAD Mode</strong>: 원본 DXF의 실제 geometry와 layer를 확인하고 정밀하게 수정합니다.</li></ul><p>Plan Mode는 출력 용지(A4/A3)에 종속되지 않습니다. 실제 치수와 공간 구조를 보존하고, 인쇄 레이아웃은 연동 제품에서 별도로 정하는 방향입니다.</p>`:`<h2>PieniPlan User Guide</h2><p>PieniPlan is a web floor-plan editor with <strong>Plan Mode</strong> and <strong>CAD Mode</strong> sharing one real-world coordinate system.</p><h3>Two modes</h3><ul><li><strong>Plan Mode</strong>: simplifies CAD detail into connected plan lines with semantic doors, windows, spaces and stairs.</li><li><strong>CAD Mode</strong>: inspects and edits original DXF geometry and layers.</li></ul>`,
    plan:ko?`<h2>Plan Mode</h2><p>건물의 층별 평면을 구조화하는 모드입니다. 오른쪽 <strong>층</strong> 탭에서 현재 층을 바꾸고, <strong>팔레트</strong>에서 문·창·공간 같은 요소를 배치합니다. Plan Mode에서는 사용자에게 선과 벽을 별도 객체로 나누지 않습니다. <kbd>L</kbd> 또는 <strong>그리기 → 선</strong>으로 만든 선이 평면 경계가 되고, 문·창·공간 관계와 필요한 속성을 그 선에 연결합니다. 곡선 경계도 <strong>그리기 → 곡선</strong>에서 만들 수 있습니다.</p><h3>도구와 명령</h3><p>왼쪽 도구막대는 <strong>선택 · 그리기 · 요소 · 수정</strong>으로 묶습니다. 거리는 선택 그룹에, 이동·복사·잘라내기·연장은 수정 그룹에 둡니다. Plan Mode에서도 <kbd>L</kbd>, <kbd>TR</kbd>, <kbd>EX</kbd>, <kbd>E</kbd>, <kbd>DI</kbd>, Undo/Redo 같은 공통 명령을 사용할 수 있으며 원본 DXF가 아니라 현재 층의 Plan 모델만 편집합니다. 도구별 길이·각도 입력은 캔버스 왼쪽 위의 floating HUD에 표시되어 작업 중 캔버스 높이가 바뀌지 않습니다.</p><h3>Shift와 접합</h3><ul><li>기존 직선의 끝점을 <kbd>Shift</kbd>와 함께 끌면 현재 각도를 그대로 유지한 채 길이만 바뀝니다.</li><li>기존 선에서 새 선을 시작하고 <kbd>Shift</kbd>를 누르면 기존 선을 기준으로 45° 단위 방향에 스냅합니다.</li><li>독립적인 새 선은 기준축 기준 45° 단위를 사용합니다.</li><li>끝점↔끝점 접합은 같은 Junction으로 유지합니다. 선 끝이 다른 선의 중간에 붙는 T 접합은 Point-on-Edge 제약으로 유지되어 host의 고정 비율에 묶이지 않고 선 위를 미끄러지며, 가능한 경우 branch의 기존 방향을 유지합니다.</li></ul><h3>참조 도면 스냅</h3><p>Plan Mode의 기본 SNAP은 Plan 객체만 대상으로 합니다. <kbd>Ctrl</kbd>을 누르는 동안에만 뒤쪽 CAD/참조 도면의 끝점·중간점·교점을 임시 스냅 후보로 포함합니다. <kbd>Ctrl+Shift</kbd>는 참조 스냅과 각도 제약을 함께 사용합니다.</p><h3>문 직접 조작</h3><p>선택한 문은 가운데 점을 끌어 host 선을 따라 위치를 옮깁니다. 여닫이문 몸체를 선에 수직으로 끌면 열림 방향을, 선을 따라 끌면 경첩 방향을 반전합니다. 벽이 기울어져 있어도 화면 X/Y가 아니라 host 선의 로컬 축을 사용합니다.</p><h3>CAD 구조 인식</h3><ul><li>여러 평행 제도선을 하나의 Wall Band로 해석한 뒤 Plan 경계선으로 단순화</li><li>작은 끝점/코너 오차를 제한적으로 연결</li><li>문 개구부와 여닫이 호를 문 후보로 인식하고, DXF에서 짧은 선분으로 분해된 여닫이 호도 보수적으로 복원</li><li>반복 계단선을 하나의 계단 의미 객체로 축약</li><li>분절된 원호/곡선은 가능한 경우 하나의 의미 곡선으로 복원</li><li>T자/끝점/L자 접합은 실제 교점까지 정규화하되 단순 X자 교차는 자동 분절하지 않음</li><li>짧은 overrun과 명확한 누락 구간만 보수적으로 정리</li></ul><h3>편집</h3><p>클릭 선택과 Window/Crossing 드래그 다중 선택을 지원합니다. TRIM에서는 마우스로 가리킨 삭제 예정 구간을 빨간 overlay로 먼저 보여줍니다. SNAP은 배치 보조이고 Constraint는 지속 관계입니다. 수평/수직/평행/직각/길이/각도/기준축 제약을 사용할 수 있습니다.</p><p><strong>재인식</strong>은 현재 층에 1:1로 연결된 CAD 영역의 <strong>자동 인식 레이어를 다시 생성</strong>합니다. 체크 해제한 자동 인식 종류는 기존 결과도 제거하며, 직접 만든 객체와 수동으로 수정한 인식 객체는 유지합니다. 다른 CAD 영역의 결과를 같은 층에 누적하지 않습니다.</p>`:`<h2>Plan Mode</h2><p>Plan Mode uses connected plan lines as the floor-plan boundary model and attaches semantic elements such as doors, windows and spaces. LINE, MOVE, COPY, TRIM, EXTEND, ERASE and DIST edit the Plan model without modifying raw DXF. A floating context HUD appears over the canvas without resizing it.</p><p><strong>Shift</strong> preserves an existing line's exact angle during endpoint edits. When drawing from an existing line, Shift snaps to 45° increments relative to that line; independent lines use the base axis. Endpoint-to-endpoint joins keep a persistent junction. Endpoint-to-segment T joins use a point-on-edge constraint so the attachment can slide along its host instead of staying at a fixed percentage. Hold Ctrl to temporarily snap to CAD/reference endpoints, midpoints and intersections; Shift remains the angle modifier.</p><p>For hinged doors, drag the center handle to move along the host line, drag across the host line to flip swing, and drag along the host line to flip the hinge side.</p><p><strong>Re-recognize</strong> rebuilds the automatic recognition layer for the linked CAD region. Unchecked automatic object types are removed, while user-created and manually changed objects are preserved.</p>`,
    cad:ko?`<h2>CAD Mode</h2><p>DXF 원본의 geometry/layer를 직접 확인·수정합니다. 참조 DXF를 Plan Mode에서 보고 다시 CAD Mode로 돌아갈 때는 불필요한 변환 설정 창을 띄우지 않습니다.</p><h3>현재 주요 명령</h3><ul><li>LINE (L)</li><li>TRIM (TR) / EXTEND (EX), Shift로 반대 명령 임시 사용</li><li>ERASE (E), DIST (DI), ZOOM (Z), EXTENTS (E)</li><li>F3 SNAP, F7 GRID, F8 ORTHO, F10 POLAR</li></ul><p>Plan에서 새로 만든 의미 객체를 CAD/DXF로 변환할 때만 CAD 표현 설정이 필요할 수 있습니다.</p>`:`<h2>CAD Mode</h2><p>Work directly with DXF geometry and layers. Returning from a referenced CAD drawing does not require mapping settings; mapping is for Plan-to-CAD conversion.</p>`,
    files:ko?`<h2>파일과 프로젝트</h2><ul><li><strong>새 도면</strong>: 현재 작업을 초기화합니다.</li><li><strong>프로젝트 열기/저장</strong>: .pieniplan 작업 상태에 층, Plan/CAD 객체, 레이어, 참조, 카메라와 인식 이력을 저장합니다. 직접 파일 쓰기를 지원하는 브라우저에서는 처음 선택한 프로젝트 파일을 이후 저장에서 갱신합니다. 지원하지 않는 브라우저에서는 다운로드하지 않고 이 브라우저의 로컬 프로젝트 저장소에 저장합니다.</li><li><strong>프로젝트 파일 다운로드</strong>: 다른 기기나 브라우저로 옮길 수 있는 .pieniplan 파일이 필요할 때 명시적으로 다운로드합니다.</li><li><strong>DXF 열기</strong>: CAD Mode에서 편집 가능한 DXF를 엽니다.</li><li><strong>DXF 내보내기</strong>: 현재 도면을 DXF로 생성합니다. 지원 브라우저에서는 운영체제의 저장 창에서 위치와 파일명을 직접 정하며, 지원하지 않는 브라우저에서는 파일명을 먼저 확인한 뒤 브라우저 다운로드 위치를 사용한다고 안내합니다.</li></ul><p>원본 DXF는 자동으로 덮어쓰지 않습니다.</p>`:`<h2>Files & projects</h2><p>.pieniplan stores the editable project state. Browsers with direct file access update the chosen project file in place. Other browsers save the working project in browser-local storage without silently downloading a file. Use Download Project File when you explicitly need a portable .pieniplan file. DXF export is separate and never silently overwrites the source DXF. When the browser supports a native Save As picker, you choose the location and file name; otherwise PieniPlan asks for the file name and clearly explains that the browser controls the download location.</p>`,
    shortcuts:ko?`<h2>단축키</h2><table class="help-shortcuts"><tr><td><kbd>Ctrl/Cmd+Z</kbd></td><td>실행 취소</td></tr><tr><td><kbd>Ctrl/Cmd+Shift+Z</kbd></td><td>다시 실행</td></tr><tr><td><kbd>Ctrl/Cmd+S</kbd></td><td>프로젝트 저장</td></tr><tr><td><kbd>Delete</kbd></td><td>선택 객체 삭제</td></tr><tr><td><kbd>Esc</kbd></td><td>현재 작업 취소 / 선택 해제</td></tr><tr><td><kbd>F3</kbd></td><td>SNAP</td></tr><tr><td><kbd>F7</kbd></td><td>GRID</td></tr><tr><td><kbd>F8</kbd></td><td>ORTHO</td></tr><tr><td><kbd>F10</kbd></td><td>POLAR</td></tr><tr><td><kbd>Shift</kbd></td><td>Plan: 기존 선 각도 유지 / 새 선 45° 스냅 · CAD: ORTHO 임시 반전</td></tr><tr><td><kbd>Ctrl</kbd></td><td>Plan: 누르는 동안 뒤쪽 CAD/참조 도면 스냅 허용</td></tr><tr><td><kbd>L</kbd></td><td>LINE</td></tr><tr><td><kbd>TR</kbd> / <kbd>EX</kbd></td><td>TRIM / EXTEND</td></tr><tr><td><kbd>Enter</kbd></td><td>빈 커맨드에서 마지막 명령 반복 / 진행 중 단계 확정</td></tr><tr><td><kbd>S</kbd></td><td>STRETCH 예약(현재 미지원) · 저장은 Ctrl/Cmd+S</td></tr></table>`:`<h2>Shortcuts</h2><table class="help-shortcuts"><tr><td><kbd>Ctrl/Cmd+Z</kbd></td><td>Undo</td></tr><tr><td><kbd>Ctrl/Cmd+Shift+Z</kbd></td><td>Redo</td></tr><tr><td><kbd>Ctrl/Cmd+S</kbd></td><td>Save project</td></tr><tr><td><kbd>F3/F7/F8/F10</kbd></td><td>SNAP / GRID / ORTHO / POLAR</td></tr><tr><td><kbd>Shift</kbd></td><td>Plan: preserve an edited line angle / 45° draw snap · CAD: temporary ORTHO inversion</td></tr><tr><td><kbd>Ctrl</kbd></td><td>Plan: temporarily include CAD/reference geometry in SNAP</td></tr><tr><td><kbd>Enter</kbd></td><td>Repeat the last command when idle / confirm the current command step</td></tr><tr><td><kbd>S</kbd></td><td>Reserved for STRETCH (not implemented yet); save with Ctrl/Cmd+S</td></tr></table>`,
    trouble:ko?`<h2>문제 해결</h2><h3>Plan 인식이 이상할 때</h3><p>관련 없는 CAD 레이어를 숨기고 도면 영역을 좁힌 뒤 재인식하세요. 자동 인식은 원본 CAD를 수정하지 않습니다.</p><h3>문자가 너무 작거나 클 때</h3><p>CAD TEXT/MTEXT는 DXF의 문자 높이와 실제 도면 scale을 따릅니다. 너무 축소된 화면에서는 성능을 위해 작은 문자를 생략할 수 있습니다.</p><h3>저장되지 않은 변경</h3><p>상단 파일명 옆 점이 보이면 마지막 프로젝트 저장 상태와 현재 작업이 다릅니다.</p>`:`<h2>Troubleshooting</h2><p>Hide unrelated CAD layers and re-run recognition on a smaller drawing region if architectural recognition produces poor candidates.</p>`};return data[section]||data.intro;}
  function openHelp(section='intro'){closeTopMenus();dom.helpBackdrop.hidden=false;document.querySelectorAll('.help-nav-item').forEach(b=>b.classList.toggle('active',b.dataset.helpSection===section));dom.helpContent.innerHTML=helpHtml(section);}
  function openAbout(){closeTopMenus();dom.aboutVersion.textContent=`Version ${VERSION} · Build ${BUILD}`;dom.aboutBackdrop.hidden=false;}

  function hasCurrentWork() {
    return state.workspaceVisited || state.objects.length > 0 || state.references.length > 0 || Boolean(state.sourceDxfName);
  }

  function updateContinueCard() {
    const current = hasCurrentWork();
    const local = !current && state.browserSavedMeta;
    const show = current || Boolean(local);
    dom.continueWorkBtn.hidden = !show;
    if (!show) return;
    if(local){dom.continueWorkDetail.textContent=t('start.continueLocalDetail',{name:local.name||'PieniPlan.pieniplan'});return;}
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
  function isSemanticObject(o) { return ['wall','door','window','dimension','space','stair'].includes(o?.type); }
  function isCadObject(o) { return ['cadLine','cadCircle','cadArc','cadText'].includes(o?.type); }
  function isArcWall(w){ return w?.type==='wall' && w.geometry==='arc' && w.center && Number.isFinite(w.radius) && Number.isFinite(w.startAngle) && Number.isFinite(w.sweep); }
  function hasSemanticObjects() { return state.objects.some(isSemanticObject); }
  function makeStableUuid() { return globalThis.crypto?.randomUUID?.() || `space-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`; }
  function ensureWallConstraints(wall){
    if(!wall||wall.type!=='wall') return null;
    wall.constraints=wall.constraints||{};
    if(!('orientation' in wall.constraints)) wall.constraints.orientation=null;
    if(!('fixedAngle' in wall.constraints)) wall.constraints.fixedAngle=null;
    if(!('fixedLength' in wall.constraints)) wall.constraints.fixedLength=null;
    if(!('fixed' in wall.constraints)) wall.constraints.fixed=false;
    if(!('reference' in wall.constraints)) wall.constraints.reference=null;
    wall.constraints.endpointLocks=wall.constraints.endpointLocks||{a:false,b:false};
    return wall.constraints;
  }
  function isSelectedId(id){return state.selectedObjectId===id||state.selectedObjectIds.has(id);}
  function isSelectionPreviewId(id){return Boolean(state.selectionDrag?.previewIds?.has(id));}
  function clearMultiSelection(){state.selectedObjectIds.clear();state.selectedObjectId=null;}
  function selectOnly(id){state.selectedObjectId=id||null;state.selectedObjectIds.clear();if(id)state.selectedObjectIds.add(id);}
  function selectionIds(){const ids=new Set(state.selectedObjectIds);if(state.selectedObjectId)ids.add(state.selectedObjectId);return ids;}
  function visibleSelectableObjects(){
    if(state.toolset==='plan')return getPlanObjects();
    return state.objects.filter(o=>{if(o.type!=='space'&&(isCadObject(o)||isSemanticObject(o)||o.type==='line')&&!cadLayerVisible(cadLayerForObject(o)))return false;return true;});
  }
  function objectFullyInsideRect(o,r){const b=objectBoundsWorld(o);return b&&b.minx>=r.minx&&b.maxx<=r.maxx&&b.miny>=r.miny&&b.maxy<=r.maxy;}
  function applySelectionSet(ids,mode='replace'){const next=new Set(state.selectedObjectIds);if(mode==='replace'){next.clear();for(const id of ids)next.add(id);}else if(mode==='add'){for(const id of ids)next.add(id);}else if(mode==='toggle'){for(const id of ids){if(next.has(id))next.delete(id);else next.add(id);}}state.selectedObjectIds=next;state.selectedObjectId=next.size===1?[...next][0]:null;state.selectedReferenceId=null;state.selectedRegionId=null;if(state.toolset==='cad'&&next.size===1)state.layerRevealRequested=true;}
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
  function closestUndirectedAngle(target,current){let best=target,bestD=Infinity;for(let k=-2;k<=2;k++){const cand=target+k*180,d=Math.abs(angleDelta(cand,current));if(d<bestD){bestD=d;best=cand;}}return normalizeAngle(best);}
  function wallConstraintAngle(wall){const c=ensureWallConstraints(wall);if(!c)return null;const current=angleDeg(wall.a,wall.b);if(c.reference?.wallId){const ref=state.objects.find(o=>o.id===c.reference.wallId&&o.type==='wall');if(ref){const base=angleDeg(ref.a,ref.b)+(c.reference.type==='perpendicular'?90:0);return closestUndirectedAngle(base,current);}}if(c.orientation)return closestUndirectedAngle(axisConstraintAngle(c.orientation),current);if(Number.isFinite(c.fixedAngle))return axisConstraintAngle('angle',c.fixedAngle);return null;}
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
    if(!wall||wall.type!=='wall'||isArcWall(wall))return;
    pushHistory();
    state.baseAxisAngle=angleDeg(wall.a,wall.b);
    state.baseAxisWallId=wall.id;
    for(const w of state.objects.filter(o=>o.type==='wall'&&o.id!==wall.id)){if(ensureWallConstraints(w).orientation==='parallel'||ensureWallConstraints(w).orientation==='perpendicular'||Number.isFinite(ensureWallConstraints(w).fixedAngle))enforceWallConstraints(w);}
    markDirty(true);rebuildObjectSnapIndex();updateAll();
  }
  function clearBaseAxis(){pushHistory();state.baseAxisAngle=0;state.baseAxisWallId=null;for(const w of state.objects.filter(o=>o.type==='wall'))enforceWallConstraints(w);markDirty(true);rebuildObjectSnapIndex();updateAll();}
  function setWallConstraint(wall,type,value=null){
    if(!wall||wall.type!=='wall'||isArcWall(wall))return false;
    const c=ensureWallConstraints(wall),directional=['horizontal','vertical','parallel','perpendicular','angle'].includes(type);
    if(directional){const existingDirection=Boolean(c.orientation||c.reference||Number.isFinite(c.fixedAngle));if((c.fixed||existingDirection)&&!confirm(t('confirm.replaceAngleConstraint')))return false;}
    if(type==='length'&&c.fixed&&!confirm(t('confirm.replaceFixedPosition')))return false;
    pushHistory();
    if(directional&&c.fixed){c.fixed=false;delete c.fixedA;delete c.fixedB;}
    if(type==='horizontal'||type==='vertical'||type==='parallel'||type==='perpendicular'){c.orientation=type;c.fixedAngle=null;c.reference=null;}
    else if(type==='angle'){c.orientation=null;c.reference=null;c.fixedAngle=Number(value)||0;}
    else if(type==='length'){if(c.fixed){c.fixed=false;delete c.fixedA;delete c.fixedB;}c.fixedLength=Math.max(.001,Number(value)||distance(wall.a,wall.b));}
    else if(type==='fixed'){if(c.fixed)return true;c.fixed=true;c.fixedA={...wall.a};c.fixedB={...wall.b};}
    enforceWallConstraints(wall);syncDependentsOfWall(wall.id);refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();return true;
  }
  function clearWallGeometricConstraints(wall){
    if(!wall||wall.type!=='wall')return;pushHistory();const c=ensureWallConstraints(wall);c.orientation=null;c.reference=null;c.fixedAngle=null;c.fixedLength=null;c.fixed=false;c.endpointLocks={a:false,b:false};delete c.fixedA;delete c.fixedB;wall.attachments={};markDirty(true);rebuildObjectSnapIndex();updateAll();
  }
  function selectedWalls(){return [...selectionIds()].map(id=>state.objects.find(o=>o.id===id)).filter(o=>o?.type==='wall'&&!isArcWall(o));}
  function setWallRelation(referenceWall,targetWall,type){
    if(!referenceWall||!targetWall||isArcWall(referenceWall)||isArcWall(targetWall)||referenceWall.id===targetWall.id)return false;
    const rc=ensureWallConstraints(referenceWall),tc=ensureWallConstraints(targetWall);
    if(rc.reference?.wallId===targetWall.id){alert(t('alert.constraintCycle'));return false;}
    const existingDirection=Boolean(tc.orientation||tc.reference||Number.isFinite(tc.fixedAngle));
    if((tc.fixed||existingDirection)&&!confirm(t('confirm.replaceAngleConstraint')))return false;
    pushHistory();if(tc.fixed){tc.fixed=false;delete tc.fixedA;delete tc.fixedB;}tc.reference={wallId:referenceWall.id,type};tc.orientation=null;tc.fixedAngle=null;enforceWallConstraints(targetWall);syncDependentsOfWall(targetWall.id);refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();return true;
  }
  function setWallLengthConstraintFromInput(wall,value){
    if(!wall||wall.type!=='wall'||isArcWall(wall)||!Number.isFinite(value)||value<=0)return false;const c=ensureWallConstraints(wall);
    if(c.fixed&&!confirm(t('confirm.replaceFixedPosition')))return false;
    pushHistory();if(c.fixed){c.fixed=false;delete c.fixedA;delete c.fixedB;}c.fixedLength=value;const angle=wallConstraintAngle(wall)??angleDeg(wall.a,wall.b),anchor=constrainedEndpointAnchor(wall,'a');setWallAngleAndLength(wall,angle,value,anchor);enforceWallConstraints(wall,{changed:anchor==='a'?'b':'a'});syncDependentsOfWall(wall.id);refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();return true;
  }
  function setWallAngleConstraintFromInput(wall,absoluteAngle){
    if(!wall||wall.type!=='wall'||isArcWall(wall)||!Number.isFinite(absoluteAngle))return false;const c=ensureWallConstraints(wall);
    const hasOther=Boolean(c.fixed||c.orientation||c.reference);
    if(hasOther&&!confirm(t('confirm.replaceAngleConstraint')))return false;
    pushHistory();if(c.fixed){c.fixed=false;delete c.fixedA;delete c.fixedB;}c.orientation=null;c.reference=null;c.fixedAngle=angleDelta(absoluteAngle,baseAxisAngle());const len=Number.isFinite(c.fixedLength)?c.fixedLength:distance(wall.a,wall.b),anchor=constrainedEndpointAnchor(wall,'a');setWallAngleAndLength(wall,absoluteAngle,len,anchor);enforceWallConstraints(wall,{changed:anchor==='a'?'b':'a'});syncDependentsOfWall(wall.id);refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();return true;
  }
  function removeWallConstraint(wall,kind,endpoint=null){
    if(!wall||wall.type!=='wall')return;const c=ensureWallConstraints(wall);pushHistory();
    if(kind==='orientation')c.orientation=null;else if(kind==='reference')c.reference=null;else if(kind==='angle')c.fixedAngle=null;else if(kind==='length')c.fixedLength=null;else if(kind==='fixed'){c.fixed=false;delete c.fixedA;delete c.fixedB;}else if(kind==='attachment'&&endpoint&&wall.attachments)delete wall.attachments[endpoint];
    enforceWallConstraints(wall);syncDependentsOfWall(wall.id);refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();
  }
  function constraintPickAt(p,{needPoint=false,exclude=null}={}){
    const tol=11/state.camera.zoom;let bestPoint=null,bestPointD=tol;
    for(const wall of getPlanObjects()){if(wall.type!=='wall')continue;for(const ep of ['a','b']){if(exclude&&exclude.wallId===wall.id&&exclude.endpoint===ep)continue;const d=distance(p,wall[ep]);if(d<bestPointD){bestPointD=d;bestPoint={kind:'point',wallId:wall.id,endpoint:ep,point:{...wall[ep]}};}}}
    if(bestPoint||needPoint)return bestPoint;
    let bestLine=null,bestLineD=tol;for(const wall of getPlanObjects()){if(wall.type!=='wall')continue;const pr=wallProjectPoint(p,wall);if(pr.distance<bestLineD){bestLineD=pr.distance;bestLine={kind:'line',wallId:wall.id,t:pr.t,point:{...pr.point}};}}
    return bestLine;
  }
  function applyCoincidentPicks(first,second){
    if(!first||first.kind!=='point'||!second||first.wallId===second.wallId&&second.kind==='line')return false;const wall=state.objects.find(o=>o.id===first.wallId&&o.type==='wall');if(!wall)return false;
    const candidate=second.kind==='point'?{kind:'coincident',wallId:second.wallId,targetEndpoint:second.endpoint,t:second.endpoint==='a'?0:1,point:{...second.point}}:{kind:'pointOnLine',wallId:second.wallId,t:second.t,point:{...second.point}};
    return applyEndpointConstraint(wall,first.endpoint,candidate);
  }
  function clearConstraintInteraction(){state.constraintMode=null;state.constraintPicks=[];state.constraintHover=null;}
  function constraintModeLabel(mode){const key={coincident:'constraintTool.coincident',horizontal:'constraintTool.horizontal',vertical:'constraintTool.vertical',parallel:'constraintTool.parallel',perpendicular:'constraintTool.perpendicular',angle:'constraintTool.angle',length:'constraintTool.length',fixed:'constraintTool.fixed',baseAxis:'constraintTool.baseAxis'}[mode];return key?t(key):t('tool.constraint');}
  function beginConstraintMode(mode){state.activeTool='constraint';state.constraintMode=mode;state.constraintPicks=[];state.constraintHover=null;host.dataset.tool='constraint';dom.toolPopover.hidden=true;renderToolRail();updateContextBar();renderProperties();render();}
  function applyConstraintCommand(mode){
    const walls=selectedWalls();
    if(mode==='clearBaseAxis'){clearBaseAxis();return;}
    if(mode==='parallel'||mode==='perpendicular'){if(walls.length===2){setWallRelation(walls[0],walls[1],mode);setTool('select','plan');return;}beginConstraintMode(mode);return;}
    if(mode==='coincident'){beginConstraintMode(mode);return;}
    if(mode==='baseAxis'){if(walls.length===1){setBaseAxisFromWall(walls[0]);setTool('select','plan');return;}beginConstraintMode(mode);return;}
    if(['horizontal','vertical','angle','length','fixed'].includes(mode)){if(walls.length===1){const wall=walls[0];if(mode==='angle'){const current=angleDeg(wall.a,wall.b),raw=prompt(t('prompt.constraintAbsoluteAngle'),String(Math.round(current*100)/100));if(raw!==null&&Number.isFinite(Number(raw)))setWallAngleConstraintFromInput(wall,Number(raw));}else if(mode==='length'){const raw=prompt(t('prompt.constraintLength'),String(Math.round(distance(wall.a,wall.b)*100)/100));if(raw!==null&&Number(raw)>0)setWallLengthConstraintFromInput(wall,Number(raw));}else setWallConstraint(wall,mode);setTool('select','plan');return;}beginConstraintMode(mode);}
  }
  function openPlanConstraintPalette(button){
    state.activeTool='constraint';host.dataset.tool='constraint';renderToolRail();updateContextBar();dom.toolPopover.innerHTML=`<div class="tool-popover-title">${escapeHtml(t('tool.constraint'))}</div>`;
    for(const item of constraintCatalog){if(item.separator){const d=document.createElement('div');d.className='tool-popover-divider';dom.toolPopover.appendChild(d);continue;}const b=document.createElement('button');b.className=`tool-item ${state.constraintMode===item.id?'active':''}`;b.innerHTML=`<span>${escapeHtml(t(item.labelKey))}</span><span class="tool-item-note">${item.noteKey?escapeHtml(t(item.noteKey)):''}</span>`;b.addEventListener('click',()=>applyConstraintCommand(item.id));dom.toolPopover.appendChild(b);}const top=Math.min(button.offsetTop,Math.max(8,host.clientHeight-310));dom.toolPopover.style.top=`${top}px`;dom.toolPopover.hidden=false;render();
  }
  function handleConstraintCanvasClick(p){
    const mode=state.constraintMode;if(!mode)return false;
    if(mode==='coincident'){
      if(!state.constraintPicks.length){const first=constraintPickAt(p,{needPoint:true});if(first){state.constraintPicks=[first];updateContextBar();render();}return true;}
      const second=constraintPickAt(p,{exclude:state.constraintPicks[0]});if(second&&applyCoincidentPicks(state.constraintPicks[0],second)){clearConstraintInteraction();setTool('select','plan');}return true;
    }
    const wallPick=constraintPickAt(p,{needPoint:false});const wall=wallPick&&state.objects.find(o=>o.id===wallPick.wallId&&o.type==='wall');if(!wall)return true;
    if(mode==='parallel'||mode==='perpendicular'){
      if(!state.constraintPicks.length){state.constraintPicks=[{kind:'wall',wallId:wall.id}];selectOnly(wall.id);updateContextBar();render();return true;}
      const ref=state.objects.find(o=>o.id===state.constraintPicks[0].wallId&&o.type==='wall');if(ref&&wall.id!==ref.id&&setWallRelation(ref,wall,mode)){clearConstraintInteraction();selectOnly(wall.id);setTool('select','plan');}return true;
    }
    if(mode==='baseAxis'){setBaseAxisFromWall(wall);clearConstraintInteraction();selectOnly(wall.id);setTool('select','plan');return true;}
    if(mode==='angle'){const current=angleDeg(wall.a,wall.b),raw=prompt(t('prompt.constraintAbsoluteAngle'),String(Math.round(current*100)/100));if(raw!==null&&Number.isFinite(Number(raw)))setWallAngleConstraintFromInput(wall,Number(raw));}
    else if(mode==='length'){const raw=prompt(t('prompt.constraintLength'),String(Math.round(distance(wall.a,wall.b)*100)/100));if(raw!==null&&Number(raw)>0)setWallLengthConstraintFromInput(wall,Number(raw));}
    else setWallConstraint(wall,mode);
    clearConstraintInteraction();selectOnly(wall.id);setTool('select','plan');return true;
  }
  function updateConstraintHover(p){if(state.activeTool!=='constraint'||!state.constraintMode){state.constraintHover=null;return;}state.constraintHover=state.constraintMode==='coincident'?constraintPickAt(p,{needPoint:!state.constraintPicks.length,exclude:state.constraintPicks[0]||null}):constraintPickAt(p,{needPoint:false});}
  function drawConstraintInteraction(){if(state.activeTool!=='constraint'||!state.constraintMode)return;const styles=getComputedStyle(document.documentElement),accent=styles.getPropertyValue('--accent').trim();ctx.save();ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.lineWidth=2;const drawPick=pick=>{if(!pick)return;if(pick.kind==='line'||pick.kind==='wall'){const wall=state.objects.find(o=>o.id===pick.wallId&&o.type==='wall');if(wall){const a=toScreenCss(wall.a),b=toScreenCss(wall.b);ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}else{const q=toScreenCss(pick.point);ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(q.x,q.y,6,0,Math.PI*2);ctx.fill();}};state.constraintPicks.forEach(drawPick);drawPick(state.constraintHover);ctx.restore();}
  function endpointConstraintCandidate(point,selfWallId){
    const threshold=Math.max(20,12/state.camera.zoom);let endpoint=null,endpointD=threshold;
    for(const wall of getPlanObjects()){if(wall.type!=='wall'||wall.id===selfWallId)continue;for(const ep of['a','b']){const d=distance(point,wall[ep]);if(d<endpointD){endpointD=d;endpoint={kind:'coincident',wallId:wall.id,targetEndpoint:ep,t:ep==='a'?0:1,point:{...wall[ep]}};}}}
    if(endpoint)return endpoint;
    let line=null,lineD=threshold;
    for(const wall of getPlanObjects()){if(wall.type!=='wall'||wall.id===selfWallId)continue;const pr=wallProjectPoint(point,wall);if(pr.distance<lineD){lineD=pr.distance;line={kind:'pointOnLine',wallId:wall.id,t:pr.t,point:{...pr.point}};}}
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
  function deltaCcw(a,b){return((b-a)%360+360)%360;}
  function wallLength(wall){return isArcWall(wall)?Math.abs(rad(wall.sweep))*wall.radius:distance(wall.a,wall.b);}
  function wallPointAt(wall,t){
    const tt=clamp(Number(t)||0,0,1);
    if(isArcWall(wall)){const a=rad(wall.startAngle+wall.sweep*tt);return{x:wall.center.x+Math.cos(a)*wall.radius,y:wall.center.y+Math.sin(a)*wall.radius};}
    return{x:wall.a.x+(wall.b.x-wall.a.x)*tt,y:wall.a.y+(wall.b.y-wall.a.y)*tt};
  }
  function wallTangentAt(wall,t){
    if(isArcWall(wall)){const a=rad(wall.startAngle+wall.sweep*clamp(t,0,1)),sign=wall.sweep>=0?1:-1;return{ux:-Math.sin(a)*sign,uy:Math.cos(a)*sign};}
    const dx=wall.b.x-wall.a.x,dy=wall.b.y-wall.a.y,len=Math.max(.000001,Math.hypot(dx,dy));return{ux:dx/len,uy:dy/len};
  }
  function wallProjectPoint(p,wall){
    if(!isArcWall(wall))return projectPointToSegment(p,wall.a,wall.b);
    const angle=normalizeAngle(deg(Math.atan2(p.y-wall.center.y,p.x-wall.center.x))),start=normalizeAngle(wall.startAngle),sweep=wall.sweep;
    let progress=sweep>=0?deltaCcw(start,angle)/Math.max(.000001,sweep):deltaCcw(angle,start)/Math.max(.000001,-sweep);
    if(progress>=0&&progress<=1){const point=wallPointAt(wall,progress);return{t:progress,point,distance:distance(p,point)};}
    const da=distance(p,wall.a),db=distance(p,wall.b);return da<=db?{t:0,point:{...wall.a},distance:da}:{t:1,point:{...wall.b},distance:db};
  }
  function circleFromThreePoints(a,b,c){
    const d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));if(Math.abs(d)<1e-7)return null;
    const aa=a.x*a.x+a.y*a.y,bb=b.x*b.x+b.y*b.y,cc=c.x*c.x+c.y*c.y;
    const center={x:(aa*(b.y-c.y)+bb*(c.y-a.y)+cc*(a.y-b.y))/d,y:(aa*(c.x-b.x)+bb*(a.x-c.x)+cc*(b.x-a.x))/d};
    const radius=distance(center,a);if(!Number.isFinite(radius)||radius<1)return null;
    const start=normalizeAngle(deg(Math.atan2(a.y-center.y,a.x-center.x))),end=normalizeAngle(deg(Math.atan2(b.y-center.y,b.x-center.x))),mid=normalizeAngle(deg(Math.atan2(c.y-center.y,c.x-center.x))),ccw=deltaCcw(start,end),midCcw=deltaCcw(start,mid);
    let sweep=midCcw<=ccw+1e-6?ccw:ccw-360;if(Math.abs(sweep)<.01||Math.abs(sweep)>359.99)return null;
    return{center,radius,startAngle:start,sweep};
  }
  function applyArcFromControl(wall,control){const g=circleFromThreePoints(wall.a,wall.b,control);if(!g)return false;Object.assign(wall,g,{geometry:'arc'});return true;}
  function arcControlPoint(wall){return wallPointAt(wall,.5);}
  function signedDistanceToWall(p,wall){const pr=wallProjectPoint(p,wall),tan=wallTangentAt(wall,pr.t),nx=-tan.uy,ny=tan.ux;return(p.x-pr.point.x)*nx+(p.y-pr.point.y)*ny;}
  function polygonArea(poly){let a=0;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];a+=p.x*q.y-q.x*p.y;}return a/2;}
  function polygonCentroid(poly){let a=0,cx=0,cy=0;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],cross=p.x*q.y-q.x*p.y;a+=cross;cx+=(p.x+q.x)*cross;cy+=(p.y+q.y)*cross;}a*=.5;if(Math.abs(a)<1e-9)return poly[0]||{x:0,y:0};return{x:cx/(6*a),y:cy/(6*a)};}
  function pointInPolygon(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];const hit=((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/((b.y-a.y)||1e-12)+a.x);if(hit)inside=!inside;}return inside;}
  function segmentIntersection(a,b,c,d){const r={x:b.x-a.x,y:b.y-a.y},s={x:d.x-c.x,y:d.y-c.y};const cross=(u,v)=>u.x*v.y-u.y*v.x,den=cross(r,s);if(Math.abs(den)<1e-9)return null;const ca={x:c.x-a.x,y:c.y-a.y},t0=cross(ca,s)/den,u0=cross(ca,r)/den;if(t0<-1e-8||t0>1+1e-8||u0<-1e-8||u0>1+1e-8)return null;return{t:clamp(t0,0,1),u:clamp(u0,0,1),point:{x:a.x+r.x*t0,y:a.y+r.y*t0}};}

  function infiniteLineSegmentIntersection(a,b,c,d){
    const r={x:b.x-a.x,y:b.y-a.y},q={x:d.x-c.x,y:d.y-c.y};
    const cross=(u,v)=>u.x*v.y-u.y*v.x,den=cross(r,q);if(Math.abs(den)<1e-10)return null;
    const ca={x:c.x-a.x,y:c.y-a.y},t=cross(ca,q)/den,u=cross(ca,r)/den;
    if(u<-1e-8||u>1+1e-8)return null;
    return{t,u:clamp(u,0,1),point:{x:a.x+r.x*t,y:a.y+r.y*t}};
  }

  function infiniteLineIntersection(a,b,c,d){
    const r={x:b.x-a.x,y:b.y-a.y},q={x:d.x-c.x,y:d.y-c.y},cross=(u,v)=>u.x*v.y-u.y*v.x,den=cross(r,q);if(Math.abs(den)<1e-10)return null;const ca={x:c.x-a.x,y:c.y-a.y},t=cross(ca,q)/den,u=cross(ca,r)/den;return{t,u,point:{x:a.x+r.x*t,y:a.y+r.y*t}};
  }
  function sampleWallSegments(wall,{maxAngle=10,maxLength=350}={}){
    if(!isArcWall(wall))return[{a:{...wall.a},b:{...wall.b},t0:0,t1:1,wallId:wall.id}];
    const n=Math.max(4,Math.ceil(Math.max(Math.abs(wall.sweep)/maxAngle,wallLength(wall)/maxLength))),out=[];
    let prev=wallPointAt(wall,0);
    for(let i=1;i<=n;i++){const t=i/n,p=wallPointAt(wall,t);out.push({a:prev,b:p,t0:(i-1)/n,t1:t,wallId:wall.id});prev=p;}
    return out;
  }
  function lineAxis(line){
    const dx=line.b.x-line.a.x,dy=line.b.y-line.a.y,len=Math.max(1e-9,Math.hypot(dx,dy));let ux=dx/len,uy=dy/len;
    if(ux<0||(Math.abs(ux)<1e-9&&uy<0)){ux=-ux;uy=-uy;}
    const nx=-uy,ny=ux,project=p=>p.x*ux+p.y*uy,offset=p=>p.x*nx+p.y*ny;
    return{ux,uy,nx,ny,len,angle:((deg(Math.atan2(uy,ux))%180)+180)%180,project,offset};
  }
  function orientedRectFromAxes(u,n,minU,maxU,minN,maxN){return[
    {x:u.x*minU+n.x*minN,y:u.y*minU+n.y*minN},{x:u.x*maxU+n.x*minN,y:u.y*maxU+n.y*minN},
    {x:u.x*maxU+n.x*maxN,y:u.y*maxU+n.y*maxN},{x:u.x*minU+n.x*maxN,y:u.y*minU+n.y*maxN}
  ];}
  function rectFromPoints(a,b){return{minx:Math.min(a.x,b.x),miny:Math.min(a.y,b.y),maxx:Math.max(a.x,b.x),maxy:Math.max(a.y,b.y)};}
  function pointInRect(p,r){return p.x>=r.minx&&p.x<=r.maxx&&p.y>=r.miny&&p.y<=r.maxy;}
  function boundsOverlap(a,b){return !(a.maxx<b.minx||a.minx>b.maxx||a.maxy<b.miny||a.miny>b.maxy);}
  function objectBoundsWorld(o){if(o.a&&o.b)return rectFromPoints(o.a,o.b);if(o.type==='cadCircle'||o.type==='cadArc')return{minx:o.center.x-o.radius,miny:o.center.y-o.radius,maxx:o.center.x+o.radius,maxy:o.center.y+o.radius};if(o.point)return{minx:o.point.x,miny:o.point.y,maxx:o.point.x,maxy:o.point.y};if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);return g?rectFromPoints(g.p1,g.p2):null;}if((o.type==='space'||o.type==='stair')&&o.polygon?.length){return o.polygon.reduce((b,p)=>({minx:Math.min(b.minx,p.x),miny:Math.min(b.miny,p.y),maxx:Math.max(b.maxx,p.x),maxy:Math.max(b.maxy,p.y)}),{minx:Infinity,miny:Infinity,maxx:-Infinity,maxy:-Infinity});}return null;}
  function objectTouchesRegion(o,region){const b=objectBoundsWorld(o);return b?boundsOverlap(b,region):false;}
  function segmentIntersectsRect(a,b,r){if(pointInRect(a,r)||pointInRect(b,r))return true;const p1={x:r.minx,y:r.miny},p2={x:r.maxx,y:r.miny},p3={x:r.maxx,y:r.maxy},p4={x:r.minx,y:r.maxy};return Boolean(segmentIntersection(a,b,p1,p2)||segmentIntersection(a,b,p2,p3)||segmentIntersection(a,b,p3,p4)||segmentIntersection(a,b,p4,p1));}
  function objectCrossesRect(o,r){if(o.a&&o.b)return segmentIntersectsRect(o.a,o.b,r);if(o.type==='cadCircle'||o.type==='cadArc'){const b=objectBoundsWorld(o);return b?boundsOverlap(b,r):false;}if(o.point)return pointInRect(o.point,r);if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);return g?segmentIntersectsRect(g.p1,g.p2,r):false;}if(o.type==='dimension'){const g=dimensionGeometry(o);return g?segmentIntersectsRect(g.d1,g.d2,r):false;}const b=objectBoundsWorld(o);return b?boundsOverlap(b,r):false;}
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

  function canvasPointerMetrics() {
    const rect = canvas.getBoundingClientRect();
    const { w, h } = cssCanvasSize();
    return {
      rect, w, h,
      scaleX: rect.width > 0 ? w / rect.width : 1,
      scaleY: rect.height > 0 ? h / rect.height : 1
    };
  }

  function clientToCanvasCss(clientX, clientY) {
    const m = canvasPointerMetrics();
    return {
      x: (clientX - m.rect.left) * m.scaleX,
      y: (clientY - m.rect.top) * m.scaleY
    };
  }

  function fromPointerEvent(e) {
    return clientToCanvasCss(e.clientX, e.clientY);
  }

  function referenceLocalToWorld(ref, p) { return { x: ref.origin.x + p.x * ref.scale, y: ref.origin.y + p.y * ref.scale }; }
  function referenceWorldToLocal(ref, p) { return { x: (p.x - ref.origin.x) / ref.scale, y: (p.y - ref.origin.y) / ref.scale }; }

  function resizeCanvas() {
    const r = host.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const pixelW = Math.max(1, Math.round(r.width * dpr));
    const pixelH = Math.max(1, Math.round(r.height * dpr));
    const changed = canvas.width !== pixelW || canvas.height !== pixelH || Number(canvas.dataset.dpr || 0) !== dpr;
    if (changed) {
      canvas.width = pixelW;
      canvas.height = pixelH;
      canvas.dataset.dpr = String(dpr);
    }
    // CSS owns the visual size. Keeping it at 100% avoids stale explicit pixel sizes
    // when the inspector/context layout changes without a window resize.
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  let canvasResizeRaf = 0;
  const canvasResizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
    cancelAnimationFrame(canvasResizeRaf);
    canvasResizeRaf = requestAnimationFrame(resizeCanvas);
  }) : null;
  canvasResizeObserver?.observe(host);

  function render() {
    const { w, h } = cssCanvasSize();
    state.editableLabels = [];
    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h);
    for (const ref of state.references) if (ref.visible) drawReference(ref);
    if (state.toolset === 'plan') drawPlanWorkspace(); else drawCadWorkspace();
    drawDrawingRegions();
    drawWallRecognitionPreview();
    drawSelectionDrag();
    drawPreview();
    drawTrimPreview();
    drawCalibrationPreview();
    drawOpeningPreview();
    drawSnapIndicator();
    drawConstraintInteraction();
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

  function getLinkedCadRenderCache(ref,region){
    const sig=`${region.id}:${region.minx}:${region.miny}:${region.maxx}:${region.maxy}`,prev=linkedCadRenderCache.get(ref);
    if(prev&&prev.revision===state.cadRenderRevision&&prev.sig===sig)return prev;
    const layers=new Map(),snapSegments=[],entry=layer=>{if(!layers.has(layer))layers.set(layer,{path:new Path2D(),texts:[]});return layers.get(layer);};
    for(const obj of state.objects){if(!isCadObject(obj)&&obj.type!=='line')continue;if(!objectTouchesRegion(obj,region))continue;const layer=obj.cadLayer||'0',data=entry(layer),path=data.path;
      if(obj.type==='cadLine'||obj.type==='line'){path.moveTo(obj.a.x,obj.a.y);path.lineTo(obj.b.x,obj.b.y);snapSegments.push({a:{...obj.a},b:{...obj.b},layer,id:obj.id});}
      else if(obj.type==='cadCircle'){path.moveTo(obj.center.x+obj.radius,obj.center.y);path.arc(obj.center.x,obj.center.y,obj.radius,0,Math.PI*2);}
      else if(obj.type==='cadArc'){const a0=rad(obj.startAngle||0),a1=rad((obj.startAngle||0)+(obj.sweep||0));path.moveTo(obj.center.x+Math.cos(a0)*obj.radius,obj.center.y+Math.sin(a0)*obj.radius);path.arc(obj.center.x,obj.center.y,obj.radius,a0,a1,(obj.sweep||0)<0);}
      else if(obj.type==='cadText')data.texts.push({point:{...obj.point},text:obj.text||'',height:obj.height||180,rotation:obj.rotation||0});
    }
    const cache={revision:state.cadRenderRevision,sig,layers,snapIndex:buildSegmentSnapIndex(snapSegments)};linkedCadRenderCache.set(ref,cache);return cache;
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
      const color=getComputedStyle(document.documentElement).getPropertyValue('--cad-muted').trim()||'#8a8f98',cache=getLinkedCadRenderCache(ref,region),{w,h}=cssCanvasSize();
      ctx.strokeStyle=color;ctx.fillStyle=color;ctx.save();const a=toScreenCss({x:region.minx,y:region.miny}),b=toScreenCss({x:region.maxx,y:region.maxy});ctx.beginPath();ctx.rect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(a.x-b.x),Math.abs(a.y-b.y));ctx.clip();
      ctx.save();ctx.translate(w/2-state.camera.cx*state.camera.zoom,h/2+state.camera.cy*state.camera.zoom);ctx.scale(state.camera.zoom,-state.camera.zoom);ctx.lineWidth=1/Math.max(state.camera.zoom,.000001);for(const [layer,data] of cache.layers){if(ref.visibleLayers&&!ref.visibleLayers.has(layer))continue;ctx.stroke(data.path);}ctx.restore();
      for(const [layer,data] of cache.layers){if(ref.visibleLayers&&!ref.visibleLayers.has(layer))continue;for(const e of data.texts){const rawFontPx=Math.max(1,(Number(e.height)||180)*state.camera.zoom);if(rawFontPx<2)continue;const fontPx=state.toolset==='plan'?Math.max(8,rawFontPx):rawFontPx,sp=toScreenCss(e.point);ctx.save();ctx.translate(sp.x,sp.y);ctx.rotate(-rad(Number(e.rotation)||0));ctx.font=`${Math.min(fontPx,900)}px system-ui`;ctx.fillStyle=color;ctx.textBaseline='alphabetic';ctx.fillText(e.text||'',0,0);ctx.restore();}}
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
      for (const e of ref.textEntities) {
        if (visibleLayers && !visibleLayers.has(e.layer || '0')) continue;
        const rawFontPx=Math.max(1,(Number(e.height)||180)*state.camera.zoom*ref.scale);
        if(rawFontPx<2)continue;const fontPx=state.toolset==='plan'?Math.max(8,rawFontPx):rawFontPx;
        const sp=toScreenCss(referenceLocalToWorld(ref,{x:e.x,y:e.y}));
        ctx.save();ctx.translate(sp.x,sp.y);ctx.rotate(-rad(Number(e.rotation)||0));ctx.font=`${Math.min(fontPx,900)}px system-ui`;ctx.fillStyle=color;ctx.textBaseline='alphabetic';ctx.fillText(e.text||'',0,0);ctx.restore();
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
    const styles = getComputedStyle(document.documentElement),muted=styles.getPropertyValue('--cad-muted').trim(),line=styles.getPropertyValue('--line').trim(),wall=styles.getPropertyValue('--wall').trim(),dim=styles.getPropertyValue('--dimension').trim(),sel=styles.getPropertyValue('--selection').trim(),hover=styles.getPropertyValue('--hover').trim(),hasLinkedCadReference=state.references.some(r=>r.visible&&r.type==='linkedCadRegion'),planObjects=getPlanObjects();
    if(!hasLinkedCadReference) for (const obj of state.objects) {if (!isCadObject(obj)) continue;if (!cadLayerVisible(obj.cadLayer)) continue;const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id);drawCadObject(obj, selected ? sel : preview ? hover : muted, selected ? 2 : preview ? 1.8 : 1);}
    if(layerVisible('spaces')) for(const obj of planObjects) if(obj.type==='space') drawSpacePlan(obj);
    if(layerVisible('stairs')) for(const obj of planObjects) if(obj.type==='stair') drawStairPlan(obj);
    if(layerVisible('walls')) for(const obj of planObjects) if(obj.type==='wall') drawWallPlan(obj, isSelectedId(obj.id) ? sel : wall);
    for (const obj of planObjects) {if(obj.type==='door'&&layerVisible('doors'))drawOpeningPlan(obj,'door',isSelectedId(obj.id)?sel:styles.getPropertyValue('--door').trim());else if(obj.type==='window'&&layerVisible('windows'))drawOpeningPlan(obj,'window',isSelectedId(obj.id)?sel:styles.getPropertyValue('--window').trim());else if(obj.type==='dimension'&&layerVisible('dimensions'))drawDimension(obj,isSelectedId(obj.id)?sel:dim);else if(obj.type==='line'&&layerVisible('drawing'))drawLineObject(obj,isSelectedId(obj.id)?sel:line);}
  }

  function drawSpacePlan(obj){if(!obj.polygon?.length)return;const styles=getComputedStyle(document.documentElement),selected=isSelectedId(obj.id),stroke=selected?styles.getPropertyValue('--selection').trim():(obj.invalid?'#b45309':styles.getPropertyValue('--accent').trim());ctx.save();ctx.fillStyle=stroke;ctx.globalAlpha=obj.invalid?.06:.08;ctx.beginPath();obj.polygon.forEach((p,i)=>{const q=toScreenCss(p);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);});ctx.closePath();ctx.fill();ctx.globalAlpha=.75;ctx.strokeStyle=stroke;ctx.lineWidth=selected?2:1;ctx.setLineDash(obj.invalid?[5,4]:[]);ctx.stroke();ctx.setLineDash([]);const c=toScreenCss(polygonCentroid(obj.polygon));const label=obj.invalid?t('space.invalid'):t('space.area',{area:formatNumber(obj.areaM2||Math.abs(polygonArea(obj.polygon))/1e6,2)});ctx.font='11px system-ui';ctx.fillStyle=stroke;ctx.globalAlpha=.95;ctx.fillText(label,c.x+6,c.y-6);ctx.restore();}


  function drawStairPlan(obj){if(!obj.polygon?.length)return;const styles=getComputedStyle(document.documentElement),selected=isSelectedId(obj.id),stroke=selected?styles.getPropertyValue('--selection').trim():styles.getPropertyValue('--text-2').trim();const b=objectBoundsWorld(obj),c=b?{x:(b.minx+b.maxx)/2,y:(b.miny+b.maxy)/2}:polygonCentroid(obj.polygon);ctx.save();ctx.strokeStyle=stroke;ctx.fillStyle=stroke;ctx.lineWidth=selected?2:1;ctx.globalAlpha=.72;ctx.setLineDash([5,4]);ctx.beginPath();obj.polygon.forEach((p,i)=>{const q=toScreenCss(p);if(!i)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);});ctx.closePath();ctx.stroke();ctx.setLineDash([]);const sp=toScreenCss(c);ctx.globalAlpha=.95;ctx.font='600 12px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t('value.stair'),sp.x,sp.y);ctx.restore();}
  function drawDrawingRegions(){if(state.toolset!=='cad')return;const styles=getComputedStyle(document.documentElement),color=styles.getPropertyValue('--accent').trim();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.setLineDash([6,5]);ctx.lineWidth=1.2;for(const region of state.drawingRegions){const a=toScreenCss({x:region.minx,y:region.miny}),b=toScreenCss({x:region.maxx,y:region.maxy});const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(a.x-b.x),h=Math.abs(a.y-b.y);ctx.globalAlpha=region.id===state.selectedRegionId?.95:.5;ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);ctx.font='11px system-ui';ctx.fillText(region.name||t('region.unnamed'),x+6,y+15);ctx.setLineDash([6,5]);}if(state.regionDrag){const r=rectFromPoints(state.regionDrag.start,state.regionDrag.current);const a=toScreenCss({x:r.minx,y:r.miny}),b=toScreenCss({x:r.maxx,y:r.maxy});ctx.globalAlpha=.85;ctx.strokeRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(a.x-b.x),Math.abs(a.y-b.y));}ctx.restore();}

  function drawSnapIndicator(){const s=state.snapIndicator;if(!state.snap||!s||isCompactViewer())return;const p=toScreenCss(s),styles=getComputedStyle(document.documentElement),isRef=s.source==='reference',color=isRef?(styles.getPropertyValue('--dimension').trim()||styles.getPropertyValue('--accent').trim()):styles.getPropertyValue('--accent').trim();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=styles.getPropertyValue('--canvas').trim();ctx.lineWidth=1.4;if(isRef){ctx.beginPath();ctx.moveTo(p.x,p.y-5);ctx.lineTo(p.x+5,p.y);ctx.lineTo(p.x,p.y+5);ctx.lineTo(p.x-5,p.y);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.font='600 9px system-ui';ctx.fillText('REF',p.x+8,p.y-7);}else if(s.kind==='wall'){ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();ctx.stroke();}else{ctx.beginPath();ctx.rect(p.x-4,p.y-4,8,8);ctx.fill();ctx.stroke();}ctx.restore();}

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

  function cadArcPointAt(obj,t){const a=rad((obj.startAngle||0)+(obj.sweep||0)*clamp(t,0,1));return{x:obj.center.x+Math.cos(a)*obj.radius,y:obj.center.y+Math.sin(a)*obj.radius};}
  function projectPointToCadArc(p,obj){const start=normalizeAngle(obj.startAngle||0),sweep=Number(obj.sweep)||0,angle=normalizeAngle(deg(Math.atan2(p.y-obj.center.y,p.x-obj.center.x)));let progress=sweep>=0?deltaCcw(start,angle)/Math.max(.000001,sweep):deltaCcw(angle,start)/Math.max(.000001,-sweep);if(progress>=0&&progress<=1){const point=cadArcPointAt(obj,progress);return{t:progress,point,distance:distance(p,point)};}const a=cadArcPointAt(obj,0),b=cadArcPointAt(obj,1),da=distance(p,a),db=distance(p,b);return da<=db?{t:0,point:a,distance:da}:{t:1,point:b,distance:db};}
  function drawModelText(obj,color,worldScale=1){const height=Math.max(1,Number(obj.height)||180),px=height*state.camera.zoom*worldScale;if(px<2)return;const p=toScreenCss(obj.point);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-rad(Number(obj.rotation)||0));ctx.fillStyle=color;ctx.font=`${Math.min(px,900)}px system-ui`;ctx.textBaseline='alphabetic';ctx.fillText(obj.text||'',0,0);ctx.restore();}

  function drawCadObject(obj, color, width = 1.2) {
    if(!objectInViewport(obj))return;const selected=isSelectedId(obj.id);ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;
    if(obj.type==='cadLine'){const a=toScreenCss(obj.a),b=toScreenCss(obj.b);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();drawSelectionHandles(obj,[a,b]);}
    else if(obj.type==='cadCircle'){const c=toScreenCss(obj.center);ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.5,obj.radius*state.camera.zoom),0,Math.PI*2);ctx.stroke();if(selected)drawSelectionHandles(obj,[c]);}
    else if(obj.type==='cadArc'){const c=toScreenCss(obj.center),start=-rad((obj.startAngle||0)+(obj.sweep||0)),end=-rad(obj.startAngle||0);ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.5,obj.radius*state.camera.zoom),start,end,obj.sweep>=0);ctx.stroke();if(selected)drawSelectionHandles(obj,[toScreenCss(cadArcPointAt(obj,0)),toScreenCss(cadArcPointAt(obj,1))]);}
    else if(obj.type==='cadText'){ctx.restore();drawModelText(obj,color,1);return;}ctx.restore();
  }

  function wallVector(wall) {
    if(isArcWall(wall)){const tan=wallTangentAt(wall,.5),len=Math.max(.000001,wallLength(wall));return{dx:tan.ux*len,dy:tan.uy*len,len,ux:tan.ux,uy:tan.uy,nx:-tan.uy,ny:tan.ux};}
    const dx = wall.b.x - wall.a.x, dy = wall.b.y - wall.a.y;
    const len = Math.max(.000001, Math.hypot(dx, dy));
    return { dx, dy, len, ux: dx / len, uy: dy / len, nx: -dy / len, ny: dx / len };
  }

  function wallEndpointConnected(wall, endpointName) {
    const p = wall[endpointName];
    const tol = Math.max(2, (wall.thickness || 150) * .12);
    for (const other of state.objects) {
      if (other === wall || other.type !== 'wall') continue;
      if (wall.floorId && other.floorId && wall.floorId !== other.floorId) continue;
      if (distance(p, other.a) <= tol || distance(p, other.b) <= tol) return true;
      const pr = wallProjectPoint(p, other);
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

  function wallVisibleSegments(wall,{extendConnectedEnds=true}={}) {
    const gaps=wallOpeningIntervals(wall),spans=[];let t0=0;
    for(const[ga,gb]of gaps){if(ga>t0)spans.push([t0,ga]);t0=Math.max(t0,gb);}if(t0<1)spans.push([t0,1]);
    if(isArcWall(wall))return spans.map(([a,b])=>({kind:'arc',t0:a,t1:b}));
    const v=wallVector(wall),h=(wall.thickness||150)/2;
    return spans.map(([a,b])=>{let p1=wallPointAt(wall,a),p2=wallPointAt(wall,b);if(extendConnectedEnds&&a<=1e-9&&wallEndpointConnected(wall,'a'))p1={x:p1.x-v.ux*h,y:p1.y-v.uy*h};if(extendConnectedEnds&&b>=1-1e-9&&wallEndpointConnected(wall,'b'))p2={x:p2.x+v.ux*h,y:p2.y+v.uy*h};return{kind:'line',a:p1,b:p2,t0:a,t1:b};});
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
  function drawWallEditLabels(wall){
    if(!isSelectedId(wall.id)||selectionIds().size!==1||state.toolset!=='plan')return;
    const mid=wallPointAt(wall,.5),tan=wallTangentAt(wall,.5),nx=-tan.uy,ny=tan.ux,off=Math.max(230,(wall.thickness||150)*1.3),base=toScreenCss({x:mid.x+nx*off,y:mid.y+ny*off}),len=wallLength(wall);
    drawEditablePill(`${formatNumber(len,1)} mm`,{x:base.x-46,y:base.y},wall.id,'wallLength',len,{accent:true});
    if(isArcWall(wall)){drawEditablePill(`R ${formatNumber(wall.radius,1)}`,{x:base.x+52,y:base.y},wall.id,'wallRadius',wall.radius,{accent:true});}
    else{const ang=angleDeg(wall.a,wall.b);drawEditablePill(`${formatNumber(ang,1)}°`,{x:base.x+48,y:base.y},wall.id,'wallAngle',ang,{accent:true});}
  }
  function drawWallPlan(obj, color) {
    const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview;
    const styles=getComputedStyle(document.documentElement),stroke=selected?styles.getPropertyValue('--selection').trim():preview?styles.getPropertyValue('--hover').trim():hovered?styles.getPropertyValue('--hover').trim():color;
    ctx.save();ctx.strokeStyle=stroke;ctx.lineWidth=selected?3:preview||hovered?2.6:2.2;ctx.lineCap='round';ctx.lineJoin='round';
    for(const seg of wallVisibleSegments(obj,{extendConnectedEnds:false})){
      if(seg.kind==='line'){const a=toScreenCss(seg.a),b=toScreenCss(seg.b);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      else{const steps=Math.max(4,Math.ceil(Math.abs(obj.sweep)*(seg.t1-seg.t0)/7));ctx.beginPath();for(let i=0;i<=steps;i++){const p=toScreenCss(wallPointAt(obj,seg.t0+(seg.t1-seg.t0)*i/steps));if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();}
    }
    ctx.lineWidth=1;const handles=[toScreenCss(obj.a),toScreenCss(obj.b)];if(isArcWall(obj))handles.push(toScreenCss(arcControlPoint(obj)));drawSelectionHandles(obj,handles);ctx.restore();
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
    const h=(obj.thickness||150)/2,out=[];
    if(!isArcWall(obj)){
      const v=wallVector(obj);for(const seg of wallVisibleSegments(obj)){if(seg.kind!=='line')continue;for(const sign of[-1,1])out.push([{x:seg.a.x+v.nx*h*sign,y:seg.a.y+v.ny*h*sign},{x:seg.b.x+v.nx*h*sign,y:seg.b.y+v.ny*h*sign}]);}return out;
    }
    for(const seg of wallVisibleSegments(obj)){
      if(seg.kind!=='arc')continue;const steps=Math.max(4,Math.ceil(Math.abs(obj.sweep)*(seg.t1-seg.t0)/7));
      for(const sign of[-1,1]){let prev=null;for(let i=0;i<=steps;i++){const t=seg.t0+(seg.t1-seg.t0)*i/steps,base=wallPointAt(obj,t),tan=wallTangentAt(obj,t),nx=-tan.uy,ny=tan.ux,p={x:base.x+nx*h*sign,y:base.y+ny*h*sign};if(prev)out.push([prev,p]);prev=p;}}
    }
    return out;
  }
  function drawWallCad(obj, color) {
    const mapping=state.cadMapping||defaultCadMapping(),layer=mapping.wallLayer||'WALL';if(!cadLayerVisible(layer))return;const mode=mapping.wallRepresentation||'outline';
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=isSelectedId(obj.id)?2:isSelectionPreviewId(obj.id)?1.8:1.2;
    if(mode==='outline'||mode==='both')for(const[wa,wb]of wallOutlineVisibleWorld(obj)){const a=toScreenCss(wa),b=toScreenCss(wb);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    if(mode==='centerline'||mode==='both'){if(mode==='both')ctx.setLineDash([5,4]);for(const seg of sampleWallSegments(obj,{maxAngle:7,maxLength:350})){const a=toScreenCss(seg.a),b=toScreenCss(seg.b);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}ctx.setLineDash([]);}
    if(isSelectedId(obj.id)){const hs=[toScreenCss(obj.a),toScreenCss(obj.b)];if(isArcWall(obj))hs.push(toScreenCss(arcControlPoint(obj)));drawSelectionHandles(obj,hs);}ctx.restore();
  }
  function openingGeometry(obj) {
    const wall=state.objects.find(o=>o.id===obj.wallId&&o.type==='wall');if(!wall)return null;
    const total=Math.max(.000001,wallLength(wall)),t=clamp(obj.t??.5,0,1),c=wallPointAt(wall,t),tan=wallTangentAt(wall,t),ux=tan.ux,uy=tan.uy,nx=-uy,ny=ux,width=Math.min(obj.width||900,total*.9),halfT=(width/total)/2;
    const p1=wallPointAt(wall,clamp(t-halfT,0,1)),p2=wallPointAt(wall,clamp(t+halfT,0,1));
    return{wall,center:c,p1,p2,ux,uy,nx,ny,width,t1:clamp(t-halfT,0,1),t2:clamp(t+halfT,0,1)};
  }
  function drawOpeningPlan(obj, kind, color) {
    const g=openingGeometry(obj);if(!g)return;const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview;
    const styles=getComputedStyle(document.documentElement),stroke=selected?styles.getPropertyValue('--selection').trim():preview?styles.getPropertyValue('--hover').trim():hovered?styles.getPropertyValue('--hover').trim():color;
    ctx.save();ctx.strokeStyle=stroke;ctx.fillStyle=stroke;ctx.lineWidth=1.8;const wallHalf=(g.wall.thickness||150)/2;
    const jamb=p=>{const a=toScreenCss({x:p.x+g.nx*wallHalf,y:p.y+g.ny*wallHalf}),b=toScreenCss({x:p.x-g.nx*wallHalf,y:p.y-g.ny*wallHalf});ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();};jamb(g.p1);jamb(g.p2);
    if(kind==='door'){
      const type=obj.doorType||'hingedSingle',dir=obj.slideDirection===-1?-1:1;
      if(type==='hingedSingle')drawHingedLeaf(obj,g,stroke,0,1);
      else if(type==='hingedDouble'){drawHingedLeaf({...obj,hinge:'start'},g,stroke,0,.5);drawHingedLeaf({...obj,hinge:'end',swing:obj.swing},g,stroke,.5,1);}
      else if(type==='slidingSingle'||type==='pocket'){
        const off=(type==='pocket'?0.22:0.72)*wallHalf*dir,panelLen=g.width*.82,shift=dir*g.width*.34,center=wallPointAt(g.wall,clamp((obj.t??.5)+shift/Math.max(wallLength(g.wall),1),0,1)),tg=wallTangentAt(g.wall,obj.t??.5),a={x:center.x-tg.ux*panelLen/2+g.nx*off,y:center.y-tg.uy*panelLen/2+g.ny*off},b={x:center.x+tg.ux*panelLen/2+g.nx*off,y:center.y+tg.uy*panelLen/2+g.ny*off};drawWorldLine(a,b,2);if(type==='pocket'){ctx.setLineDash([4,3]);drawWorldLine(g.p1,g.p2,1);ctx.setLineDash([]);}
      }else if(type==='slidingDouble'){
        const off=.68*wallHalf*dir,tg=wallTangentAt(g.wall,obj.t??.5),half=g.width*.45;for(const sign of[-1,1]){const c={x:g.center.x+tg.ux*sign*g.width*.22+g.nx*off,y:g.center.y+tg.uy*sign*g.width*.22+g.ny*off};drawWorldLine({x:c.x-tg.ux*half/2,y:c.y-tg.uy*half/2},{x:c.x+tg.ux*half/2,y:c.y+tg.uy*half/2},2);}}
    }else for(const off of[-wallHalf*.34,0,wallHalf*.34])drawWorldLine({x:g.p1.x+g.nx*off,y:g.p1.y+g.ny*off},{x:g.p2.x+g.nx*off,y:g.p2.y+g.ny*off},1.4);
    if(selected)drawOpeningHandles(obj,g);ctx.restore();
  }
  function drawWorldLine(a,b,width=1.5){const sa=toScreenCss(a),sb=toScreenCss(b);ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(sa.x,sa.y);ctx.lineTo(sb.x,sb.y);ctx.stroke();}
  function drawHingedLeaf(obj,g,color,t0=0,t1=1){
    const pA=t0===0?g.p1:wallPointAt(g.wall,g.t1+(g.t2-g.t1)*t0),pB=t1===1?g.p2:wallPointAt(g.wall,g.t1+(g.t2-g.t1)*t1),hingeEnd=obj.hinge==='end',hinge=hingeEnd?pB:pA,other=hingeEnd?pA:pB,width=distance(hinge,other),tan={x:(other.x-hinge.x)/Math.max(width,1e-9),y:(other.y-hinge.y)/Math.max(width,1e-9)},swing=obj.swing===-1?-1:1,open=rotate90(tan,swing),leaf={x:hinge.x+open.x*width,y:hinge.y+open.y*width};drawWorldLine(hinge,leaf,2);const a0=Math.atan2(tan.y,tan.x),a1=a0+swing*Math.PI/2;ctx.globalAlpha=.62;ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<=16;i++){const a=a0+(a1-a0)*i/16,p=toScreenCss({x:hinge.x+Math.cos(a)*width,y:hinge.y+Math.sin(a)*width});if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();ctx.globalAlpha=1;
  }
  function drawOpeningCad(obj, kind, color) {
    const g=openingGeometry(obj);if(!g)return;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=isSelectedId(obj.id)?2:isSelectionPreviewId(obj.id)?1.8:1.2;
    if(kind==='door'){const type=obj.doorType||'hingedSingle';if(type==='hingedSingle'||type==='hingedDouble')drawOpeningPlan(obj,kind,color);else drawOpeningPlan(obj,kind,color);}
    else{const off=Math.min(50,(g.wall.thickness||150)*.35);for(const sign of[-1,1])drawWorldLine({x:g.p1.x+g.nx*off*sign,y:g.p1.y+g.ny*off*sign},{x:g.p2.x+g.nx*off*sign,y:g.p2.y+g.ny*off*sign},1.2);}ctx.restore();
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
    if(state.activeTool==='line'||state.activeTool==='wall'){start=state.drawStart;end=state.previewEnd;if(state.activeTool==='wall')width=state.toolset==='plan'?2:Math.max(2,currentWallThickness()*state.camera.zoom);}else if(state.activeTool==='measure'){start=state.measureStart;end=state.previewEnd;color=getComputedStyle(document.documentElement).getPropertyValue('--dimension').trim();}
    if(!start||!end)return;if(state.activeTool==='measure'){drawDimension({p1:start,p2:end,offset:Math.max(250,Math.min(600,distance(start,end)*.08))},color);return;}
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=.72;ctx.lineCap='butt';
    if(state.activeTool==='wall'&&state.toolSettings.wallType==='arc'&&state.arcDraft?.a&&state.arcDraft?.b){const g=circleFromThreePoints(state.arcDraft.a,state.arcDraft.b,end);if(g){const tmp={...g,a:state.arcDraft.a,b:state.arcDraft.b,geometry:'arc'};const steps=Math.max(8,Math.ceil(Math.abs(g.sweep)/6));ctx.beginPath();for(let i=0;i<=steps;i++){const p=toScreenCss(wallPointAt(tmp,i/steps));if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();const bp=toScreenCss(end);ctx.font='11px system-ui';ctx.fillStyle=color;ctx.fillText(`R ${formatNumber(g.radius,1)} mm · ${formatNumber(wallLength(tmp),1)} mm`,bp.x+8,bp.y-8);ctx.restore();return;}}
    const a=toScreenCss(start),b=toScreenCss(end);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.font='11px system-ui';ctx.fillStyle=color;ctx.fillText(`${formatNumber(distance(start,end),1)} mm · ${formatNumber(angleDeg(start,end),1)}°`,b.x+8,b.y-8);ctx.restore();
  }
  function drawOpeningPreview() {
    const p=state.previewOpening;if(!p||!['door','window'].includes(state.activeTool))return;const temp={id:'preview',type:state.activeTool,wallId:p.wall.id,t:p.t,width:currentOpeningWidth(),hinge:'start',swing:1,doorType:state.toolSettings.doorType||'hingedSingle',slideDirection:1};const styles=getComputedStyle(document.documentElement),color=state.activeTool==='door'?styles.getPropertyValue('--door').trim():styles.getPropertyValue('--window').trim();ctx.save();ctx.globalAlpha=.65;drawOpeningPlan(temp,state.activeTool,color);ctx.restore();
  }

  function drawTrimPreview(){
    const p=state.trimPreview;if(!p||state.toolset!=='plan'||state.activeTool!=='trim'||state.shiftDown)return;
    const styles=getComputedStyle(document.documentElement),danger=styles.getPropertyValue('--danger').trim()||'#F85149';
    ctx.save();ctx.strokeStyle=danger;ctx.fillStyle=danger;ctx.globalAlpha=.82;ctx.lineCap='round';ctx.lineWidth=5;
    const a=toScreenCss(p.a),b=toScreenCss(p.b);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    ctx.globalAlpha=.95;ctx.lineWidth=1.5;for(const q of p.cuts||[]){const sp=toScreenCss(q);ctx.beginPath();ctx.arc(sp.x,sp.y,4,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }

  function drawCalibrationPreview(){const c=state.calibration;if(!c?.p1)return;const p2=c.p2||state.previewEnd;if(!p2)return;const a=toScreenCss(c.p1),b=toScreenCss(p2);ctx.save();ctx.strokeStyle='#ffb55a';ctx.fillStyle='#ffb55a';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);for(const p of[a,b]){ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();}ctx.restore();}

  function applyNumericLabelEdit(label,value){if(!label||!Number.isFinite(value))return;const obj=state.objects.find(o=>o.id===label.objectId);if(!obj)return;if(label.kind==='openingWidth'&&(obj.type==='door'||obj.type==='window')){if(value<=0)return;pushHistory();obj.width=value;markDirty(true);rebuildObjectSnapIndex();updateAll();return;}if(label.kind==='wallLength'&&obj.type==='wall'){if(isArcWall(obj)){if(value<=0)return;pushHistory();const sweepRad=Math.max(.000001,Math.abs(rad(obj.sweep))),r=value/sweepRad;obj.radius=r;obj.a=wallPointAt({...obj,radius:r},0);obj.b=wallPointAt({...obj,radius:r},1);markDirty(true);rebuildObjectSnapIndex();refreshSpaces();updateAll();return;}setWallLengthConstraintFromInput(obj,value);return;}if(label.kind==='wallRadius'&&obj.type==='wall'&&isArcWall(obj)){if(value<=0)return;pushHistory();obj.radius=value;obj.a=wallPointAt({...obj,radius:value},0);obj.b=wallPointAt({...obj,radius:value},1);markDirty(true);rebuildObjectSnapIndex();refreshSpaces();updateAll();return;}if(label.kind==='wallAngle'&&obj.type==='wall'){setWallAngleConstraintFromInput(obj,value);return;}if(label.kind==='dimensionLength'&&obj.type==='dimension'){const g=dimensionGeometry(obj);if(!g?.associated||value<=0)return;const span=Math.abs((obj.t2??1)-(obj.t1??0));if(span<1e-6)return;setWallLengthConstraintFromInput(g.wall,value/span);}}
  function beginCanvasNumberEdit(label){host.querySelector('.canvas-number-editor')?.remove();const input=document.createElement('input');input.className='canvas-number-editor';input.type='number';input.step='0.01';input.value=String(Math.round(Number(label.value)*100)/100);input.style.left=`${Math.max(4,label.rect.x)}px`;input.style.top=`${Math.max(4,label.rect.y-5)}px`;input.style.width=`${Math.max(92,label.rect.w+24)}px`;let cancelled=false,committed=false;const commit=()=>{if(committed||cancelled)return;committed=true;const value=Number(input.value);input.remove();applyNumericLabelEdit(label,value);};input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}else if(e.key==='Escape'){e.preventDefault();cancelled=true;input.remove();host.focus();}});input.addEventListener('blur',commit);host.appendChild(input);input.focus();input.select();}
  function onCanvasDoubleClick(e){if(isCompactViewer())return;const s=fromPointerEvent(e),label=hitEditableLabel(s);if(!label)return;e.preventDefault();e.stopPropagation();beginCanvasNumberEdit(label);}

  function currentWallThickness(){const input=document.querySelector('[data-context="thickness"]');const n=Number(input?.value);if(Number.isFinite(n)&&n>0)state.toolSettings.wallThickness=n;return state.toolSettings.wallThickness;}
  function currentOpeningWidth(){const input=document.querySelector('[data-context="width"]');const n=Number(input?.value);const key=state.activeTool==='window'?'windowWidth':'doorWidth';if(Number.isFinite(n)&&n>0)state.toolSettings[key]=n;return state.toolSettings[key];}

  function updateContextBar(){
    const contextTools=new Set(['line','wall','door','window','constraint']);const shouldShow=Boolean(state.calibration)||contextTools.has(state.activeTool);
    dom.contextBar.hidden=!shouldShow;
    if(!shouldShow){dom.contextFields.innerHTML='';return;}
    const keys={select:'context.select',constraint:'context.constraint',line:'context.line',wall:'context.wall',door:'context.door',window:'context.window',space:'context.space',region:'context.region',measure:'context.measure',trim:'tool.trim',extend:'tool.extend',delete:'context.delete'};
    dom.contextToolName.textContent=state.activeTool==='constraint'&&state.constraintMode?`${t('context.constraint')} · ${constraintModeLabel(state.constraintMode)}`:(state.toolset==='plan'&&state.activeTool==='wall'?t('tool.arcLine'):t(keys[state.activeTool]||`tool.${state.activeTool}`));
    dom.contextFields.innerHTML='';
    let hint=t('hint.select');
    if(state.calibration){dom.contextToolName.textContent=t('context.calibration');dom.contextHint.textContent=state.calibration.p1?t('hint.calibrationSecond'):t('hint.calibrationFirst');return;}
    if(state.activeTool==='line'||state.activeTool==='wall'){
      dom.contextFields.appendChild(contextNumberField(t('context.length'),'length','','mm'));
      dom.contextFields.appendChild(contextNumberField(t('context.angle'),'angle','','°'));
      if(state.activeTool==='wall'&&state.toolset==='cad')dom.contextFields.appendChild(contextNumberField(t('context.thickness'),'thickness',String(state.toolSettings.wallThickness),'mm'));
      hint=(state.activeTool==='wall'&&state.toolSettings.wallType==='arc'&&state.arcDraft)?t('hint.arcWallCurve'):(state.drawStart?t('hint.segmentEnd'):t('hint.segmentStart'));
    }else if(state.activeTool==='door'||state.activeTool==='window'){
      const value=state.activeTool==='door'?state.toolSettings.doorWidth:state.toolSettings.windowWidth;
      dom.contextFields.appendChild(contextNumberField(t('context.width'),'width',String(value),'mm'));
      hint=t('hint.opening');
    }else if(state.activeTool==='measure')hint=state.measureStart?t('hint.measureSecond'):t('hint.measureFirst');
    else if(state.activeTool==='constraint'){
      if(!state.constraintMode)hint=t('hint.constraintChoose');
      else if(state.constraintMode==='coincident')hint=state.constraintPicks.length?t('hint.constraintCoincidentSecond'):t('hint.constraintCoincidentFirst');
      else if(state.constraintMode==='parallel'||state.constraintMode==='perpendicular')hint=state.constraintPicks.length?t('hint.constraintSecondWall'):t('hint.constraintFirstWall');
      else hint=t('hint.constraintWall');
    }else if(state.activeTool==='trim')hint=t('hint.trim');
    else if(state.activeTool==='extend')hint=t('hint.extend');
    else if(state.activeTool==='delete')hint=t('hint.delete');
    else if(state.activeTool==='region')hint=t('hint.region');
    dom.contextHint.textContent=hint;
  }

  function contextNumberField(label,key,value,unit){const wrap=document.createElement('div');wrap.className='context-field';const lab=document.createElement('label');lab.textContent=label;const input=document.createElement('input');input.type='number';input.step='0.01';input.value=value;input.dataset.context=key;const u=document.createElement('span');u.className='context-unit';u.textContent=unit;
    input.addEventListener('input',()=>{if(key==='thickness'){const n=Number(input.value);if(Number.isFinite(n)&&n>0)state.toolSettings.wallThickness=n;}if(key==='width'){const n=Number(input.value);if(Number.isFinite(n)&&n>0){if(state.activeTool==='door')state.toolSettings.doorWidth=n;else if(state.activeTool==='window')state.toolSettings.windowWidth=n;}render();}});
    input.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&(state.activeTool==='line'||state.activeTool==='wall')&&state.drawStart){e.preventDefault();commitNumericSegment();}});wrap.append(lab,input,u);return wrap;}

  function commitNumericSegment(){if(!state.drawStart)return;const lengthInput=document.querySelector('[data-context="length"]');const angleInput=document.querySelector('[data-context="angle"]');const explicitLength=String(lengthInput?.value||'').trim()!=='';const explicitAngle=String(angleInput?.value||'').trim()!=='';let len=Number(lengthInput?.value),ang=Number(angleInput?.value);if(!Number.isFinite(len)||len<=0)len=state.previewEnd?distance(state.drawStart,state.previewEnd):NaN;if(!Number.isFinite(ang))ang=state.previewEnd?angleDeg(state.drawStart,state.previewEnd):0;if(!Number.isFinite(len)||len<=0)return;const end={x:state.drawStart.x+Math.cos(rad(ang))*len,y:state.drawStart.y+Math.sin(rad(ang))*len};const obj=commitSegment(state.drawStart,end,state.activeTool);if(obj?.type==='wall'){const c=ensureWallConstraints(obj);if(explicitLength)c.fixedLength=len;if(explicitAngle)c.fixedAngle=angleDelta(ang,baseAxisAngle());enforceWallConstraints(obj);syncDependentsOfWall(obj.id);updateAll();}}

  function categoryRepresentative(cat,catalog){const items=(catalog[cat.id]||[]).filter(x=>x.ready);if(!items.length)return null;const active=items.find(x=>x.id===state.activeTool);if(active){toolCategoryMemory[state.toolset][cat.id]=active.id;return active;}const remembered=items.find(x=>x.id===toolCategoryMemory[state.toolset][cat.id]);return remembered||items[0];}
  function activateRepresentative(item,category,button){if(!item?.ready)return;if(state.toolset==='plan'&&item.id==='constraint'){setTool('constraint',category);openPlanConstraintPalette(button);return;}if(state.toolset==='plan'&&item.id==='wall'){state.toolSettings.wallType='arc';setTool('wall',category);return;}setTool(item.id,category);}
  function renderToolRail(){
    dom.toolRail.innerHTML='';const categories=state.toolset==='plan'?planCategories:cadCategories,catalog=state.toolset==='plan'?planToolCatalog:cadToolCatalog;
    for(const cat of categories){const items=catalog[cat.id]||[],active=items.some(x=>x.id===state.activeTool),rep=categoryRepresentative(cat,catalog),icon=(state.toolset==='plan'&&rep?.id==='wall')?'vector':(toolIconFallback[rep?.id]||cat.icon),label=(state.toolset==='plan'&&cat.id==='architecture')?t(cat.labelKey):(rep?t(rep.labelKey):t(cat.labelKey));const b=document.createElement('button');b.className=`tool-category grouped ${active?'active':''}`;b.dataset.category=cat.id;b.dataset.categoryKey=cat.labelKey;b.dataset.representative=rep?.id||'';b.innerHTML=`<span class="tool-icon ui-icon icon-${icon}" aria-hidden="true"></span><span class="tool-text">${escapeHtml(label)}</span>`;b.setAttribute('aria-label',`${label} · ${t(cat.labelKey)}`);
      let holdTimer=null,longOpened=false;const open=()=>{longOpened=true;openToolCategory(cat.id,b,catalog);};b.addEventListener('pointerdown',()=>{longOpened=false;holdTimer=setTimeout(open,420);});b.addEventListener('pointerup',()=>{if(holdTimer)clearTimeout(holdTimer);});b.addEventListener('pointerleave',()=>{if(holdTimer)clearTimeout(holdTimer);});b.addEventListener('contextmenu',e=>{e.preventDefault();open();});b.addEventListener('click',e=>{if(longOpened)return;const corner=e.offsetX>=b.clientWidth-18&&e.offsetY>=b.clientHeight-18;if(corner){openToolCategory(cat.id,b,catalog);return;}activateRepresentative(rep,cat.id,b);});dom.toolRail.appendChild(b);}
  }
  function openToolCategory(category,button,catalog){state.activeCategory=category;renderToolRail();const items=catalog[category]||[];dom.toolPopover.innerHTML=`<div class="tool-popover-title">${escapeHtml(t(button.dataset.categoryKey))}</div>`;for(const item of items){const b=document.createElement('button');b.className=`tool-item ${state.activeTool===item.id?'active':''}`;b.disabled=!item.ready;const note=item.ready?(item.note||''):t('tool.planned');b.innerHTML=`<span>${escapeHtml(t(item.labelKey))}</span><span class="tool-item-note">${escapeHtml(note)}</span>`;if(item.ready&&item.note)b.dataset.shortcut=item.note;b.addEventListener('click',()=>{if(!item.ready)return;if(state.toolset==='plan'&&item.id==='constraint')openPlanConstraintPalette(button);else if(state.toolset==='plan'&&item.id==='wall'){state.toolSettings.wallType='arc';setTool('wall',category);}else if(state.toolset==='plan'&&item.id==='door')openPlanDoorPalette(button);else setTool(item.id,category);});dom.toolPopover.appendChild(b);}const top=Math.min(button.offsetTop,Math.max(8,host.clientHeight-250));dom.toolPopover.style.top=`${top}px`;dom.toolPopover.hidden=false;}

  function openPlanTypePalette(button,catalog,selected,onPick,title){dom.toolPopover.innerHTML=`<div class="tool-popover-title">${escapeHtml(title)}</div>`;for(const item of catalog){const b=document.createElement('button');b.className=`tool-item ${selected===item.id?'active':''}`;b.innerHTML=`<span>${escapeHtml(t(item.labelKey))}</span>`;b.addEventListener('click',()=>{onPick(item.id);dom.toolPopover.hidden=true;});dom.toolPopover.appendChild(b);}const top=Math.min(button.offsetTop,Math.max(8,host.clientHeight-220));dom.toolPopover.style.top=`${top}px`;dom.toolPopover.hidden=false;}
  function openPlanWallPalette(button){openPlanTypePalette(button,wallTypeCatalog,state.toolSettings.wallType,id=>{state.toolSettings.wallType=id;setTool('wall','plan');},t('tool.wall'));}
  function openPlanDoorPalette(button){openPlanTypePalette(button,doorTypeCatalog,state.toolSettings.doorType,id=>{state.toolSettings.doorType=id;setTool('door','plan');},t('tool.door'));}
  function ensureActiveCadLayerVisible(){const layer=state.activeCadLayer||'0';if(!cadLayerVisible(layer)){state.cadLayerVisibility.set(layer,true);renderPrimaryPanel();}}


  function visibleCadLines(excludeId=null){return state.objects.filter(o=>o.type==='cadLine'&&o.id!==excludeId&&cadLayerVisible(o.cadLayer||'0'));}
  function trimCadLineAtClick(target,click){
    if(!target||target.type!=='cadLine')return false;const hits=[];for(const other of visibleCadLines(target.id)){const x=segmentIntersection(target.a,target.b,other.a,other.b);if(x&&x.t>1e-6&&x.t<1-1e-6)hits.push(x.t);}if(!hits.length)return false;
    const pr=projectPointToSegment(click,target.a,target.b),cuts=[0,...[...new Set(hits.map(v=>Math.round(v*1e7)/1e7))].sort((a,b)=>a-b),1];let k=0;for(let i=0;i<cuts.length-1;i++)if(pr.t>=cuts[i]-1e-8&&pr.t<=cuts[i+1]+1e-8){k=i;break;}const t0=cuts[k],t1=cuts[k+1],point=t=>({x:target.a.x+(target.b.x-target.a.x)*t,y:target.a.y+(target.b.y-target.a.y)*t});pushHistory();
    if(t0<=1e-8)target.a=point(t1);else if(t1>=1-1e-8)target.b=point(t0);else{const oldB={...target.b};target.b=point(t0);state.objects.push({id:uid('cadLine'),type:'cadLine',cadLayer:target.cadLayer||'0',layerId:'drawing',a:point(t1),b:oldB});}markDirty(true);rebuildObjectSnapIndex();updateAll();return true;
  }
  function extendCadLineAtClick(target,click){
    if(!target||target.type!=='cadLine')return false;const da=distance(click,target.a),db=distance(click,target.b),extendA=da<=db,candidates=[];for(const other of visibleCadLines(target.id)){const x=infiniteLineSegmentIntersection(target.a,target.b,other.a,other.b);if(!x)continue;if(extendA&&x.t<-.00001)candidates.push(x);if(!extendA&&x.t>1.00001)candidates.push(x);}if(!candidates.length)return false;candidates.sort((x,y)=>extendA?y.t-x.t:x.t-y.t);const hit=candidates[0];pushHistory();if(extendA)target.a={...hit.point};else target.b={...hit.point};markDirty(true);rebuildObjectSnapIndex();updateAll();return true;
  }
  function planLinearObjects(excludeId=null){return state.objects.filter(o=>o.id!==excludeId&&objectOnActiveFloor(o)&&(o.type==='line'||(o.type==='wall'&&!isArcWall(o))));}
  function linearEnds(o){return o&&(o.type==='line'||(o.type==='wall'&&!isArcWall(o)))?[o.a,o.b]:null;}
  function remapWallDependentsAfterTrim(wall,{mode,t0,t1,newWall=null}){const remove=[];for(const dep of state.objects){if(dep.wallId!==wall.id)continue;if(dep.type==='door'||dep.type==='window'){const ot=Number(dep.t??.5);if(mode==='head'){if(ot<t1){remove.push(dep.id);continue;}dep.t=(ot-t1)/Math.max(1e-9,1-t1);}else if(mode==='tail'){if(ot>t0){remove.push(dep.id);continue;}dep.t=ot/Math.max(1e-9,t0);}else{if(ot<t0)dep.t=ot/Math.max(1e-9,t0);else if(ot>t1&&newWall){dep.wallId=newWall.id;dep.t=(ot-t1)/Math.max(1e-9,1-t1);}else remove.push(dep.id);}}else if(dep.type==='dimension'){const a=Number(dep.t1??0),b=Number(dep.t2??1),lo=Math.min(a,b),hi=Math.max(a,b);if(mode==='head'){if(hi<t1){remove.push(dep.id);continue;}dep.t1=(a-t1)/Math.max(1e-9,1-t1);dep.t2=(b-t1)/Math.max(1e-9,1-t1);}else if(mode==='tail'){if(lo>t0){remove.push(dep.id);continue;}dep.t1=a/Math.max(1e-9,t0);dep.t2=b/Math.max(1e-9,t0);}else if(hi<=t0){dep.t1=a/Math.max(1e-9,t0);dep.t2=b/Math.max(1e-9,t0);}else if(lo>=t1&&newWall){dep.wallId=newWall.id;dep.t1=(a-t1)/Math.max(1e-9,1-t1);dep.t2=(b-t1)/Math.max(1e-9,1-t1);}else remove.push(dep.id);}}if(remove.length)state.objects=state.objects.filter(o=>!remove.includes(o.id));}
  function computePlanTrimSegment(target,click){
    const ends=linearEnds(target);if(!ends)return null;const hits=[];for(const other of planLinearObjects(target.id)){const oe=linearEnds(other);if(!oe)continue;const x=segmentIntersection(ends[0],ends[1],oe[0],oe[1]);if(x&&x.t>1e-6&&x.t<1-1e-6)hits.push(x.t);}if(!hits.length)return null;
    const pr=projectPointToSegment(click,ends[0],ends[1]),cuts=[0,...[...new Set(hits.map(v=>Math.round(v*1e7)/1e7))].sort((a,b)=>a-b),1];let k=0;for(let i=0;i<cuts.length-1;i++)if(pr.t>=cuts[i]-1e-8&&pr.t<=cuts[i+1]+1e-8){k=i;break;}
    const t0=cuts[k],t1=cuts[k+1],a=ends[0],b=ends[1],point=t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});return{targetId:target.id,t0,t1,a:point(t0),b:point(t1),cuts:[...(t0>1e-8?[point(t0)]:[]),...(t1<1-1e-8?[point(t1)]:[])]};
  }
  function updatePlanTrimPreview(raw){
    state.trimPreview=null;if(state.toolset!=='plan'||state.activeTool!=='trim'||state.shiftDown)return;const obj=hitObject(raw);if(!obj||(obj.type!=='line'&&!(obj.type==='wall'&&!isArcWall(obj))))return;state.trimPreview=computePlanTrimSegment(obj,raw);
  }

  function trimPlanLinearAtClick(target,click){const preview=computePlanTrimSegment(target,click);if(!preview)return false;const {t0,t1}=preview,oldA={...target.a},oldB={...target.b},point=t=>({x:oldA.x+(oldB.x-oldA.x)*t,y:oldA.y+(oldB.y-oldA.y)*t});pushHistory();if(target.type==='line'){if(t0<=1e-8)target.a=point(t1);else if(t1>=1-1e-8)target.b=point(t0);else{target.b=point(t0);state.objects.push({...structuredClone(target),id:uid('line'),a:point(t1),b:oldB,floorId:target.floorId||state.activeFloorId});}}else{target.attachments=target.attachments||{};const oldAttach=structuredClone(target.attachments||{}),oldConstraints=structuredClone(target.constraints||{});if(t0<=1e-8){target.a=point(t1);delete target.attachments.a;remapWallDependentsAfterTrim(target,{mode:'head',t0,t1});}else if(t1>=1-1e-8){target.b=point(t0);delete target.attachments.b;remapWallDependentsAfterTrim(target,{mode:'tail',t0,t1});}else{target.b=point(t0);delete target.attachments.b;const newWall={...structuredClone(target),id:uid('wall'),a:point(t1),b:oldB,attachments:{},constraints:{...oldConstraints,fixedLength:null}};if(oldAttach.b)newWall.attachments.b=oldAttach.b;state.objects.push(newWall);remapWallDependentsAfterTrim(target,{mode:'middle',t0,t1,newWall});}}markDirty(true);refreshSpaces();rebuildObjectSnapIndex();updateAll();return true;}
  function extendPlanLinearAtClick(target,click){const ends=linearEnds(target);if(!ends)return false;const da=distance(click,ends[0]),db=distance(click,ends[1]),extendA=da<=db,candidates=[];for(const other of planLinearObjects(target.id)){const oe=linearEnds(other);if(!oe)continue;const x=infiniteLineSegmentIntersection(ends[0],ends[1],oe[0],oe[1]);if(!x)continue;if(extendA&&x.t<-.00001)candidates.push(x);if(!extendA&&x.t>1.00001)candidates.push(x);}if(!candidates.length)return false;candidates.sort((x,y)=>extendA?y.t-x.t:x.t-y.t);const hit=candidates[0];pushHistory();if(extendA)target.a={...hit.point};else target.b={...hit.point};if(target.type==='wall'){target.attachments=target.attachments||{};delete target.attachments[extendA?'a':'b'];attachWallEndpoint(target,extendA?'a':'b');syncDependentsOfWall(target.id);}markDirty(true);refreshSpaces();rebuildObjectSnapIndex();updateAll();return true;}
  function applyTrimExtendAtPoint(raw,mode){const obj=hitObject(raw);if(!obj)return false;const actual=state.shiftDown?(mode==='trim'?'extend':'trim'):mode;let ok=false;if(state.toolset==='cad'&&obj.type==='cadLine')ok=actual==='trim'?trimCadLineAtClick(obj,raw):extendCadLineAtClick(obj,raw);else if(state.toolset==='plan'&&(obj.type==='line'||(obj.type==='wall'&&!isArcWall(obj))))ok=actual==='trim'?trimPlanLinearAtClick(obj,raw):extendPlanLinearAtClick(obj,raw);setCommandStatus(ok?t(actual==='trim'?'command.trimApplied':'command.extendApplied'):t(actual==='trim'?'command.trimNoBoundary':'command.extendNoBoundary'),ok?'strong':'error');return ok;}
  function setTool(tool,category=null){
    if(state.toolset==='cad'&&['wall','door','window'].includes(tool)&&!state.cadMapping){state.pendingToolAfterMapping={tool,category:category||'architecture'};openMappingDialog('tool');return;}
    state.activeTool=tool;{const catalog=state.toolset==='plan'?planToolCatalog:cadToolCatalog;for(const [group,items] of Object.entries(catalog))if(items.some(item=>item.id===tool)){toolCategoryMemory[state.toolset][group]=tool;break;}}if(state.toolset==='cad'&&['line','trim','extend'].includes(tool))ensureActiveCadLayerVisible();if(tool!=='constraint')clearConstraintInteraction();if(category&&category!=='plan')state.activeCategory=category;state.drawStart=null;state.drawReferenceAngle=null;state.arcDraft=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;state.calibration=null;state.regionDrag=null;state.wallRecognitionPreview=null;state.snapIndicator=null;state.trimPreview=null;host.dataset.tool=tool;dom.toolPopover.hidden=true;renderToolRail();updateContextBar();renderProperties();render();
  }

  function openCategory(category,button){openToolCategory(category,button,cadToolCatalog);}

  function switchToolset(next,{skipMapping=false,historyMode='push'}={}){
    if(next==='cad'&&!skipMapping&&hasSemanticObjects()&&!state.cadMapping&&!state.sourceDxfName&&!state.objects.some(isCadObject)){openMappingDialog('switch-cad');return;}
    const sameWorkspace=next===state.toolset&&state.view==='workspace';
    const changed=next!==state.toolset;
    state.toolset=next;dom.appShell.classList.toggle('plan-tools',next==='plan');dom.appShell.classList.toggle('cad-tools',next==='cad');dom.planToolsBtn.classList.toggle('active',next==='plan');dom.cadToolsBtn.classList.toggle('active',next==='cad');dom.commandBar.hidden=false;
    if(changed){state.activeCategory='select';state.activeTool='select';clearConstraintInteraction();state.drawStart=null;state.drawReferenceAngle=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;state.trimPreview=null;host.dataset.tool='select';dom.toolPopover.hidden=true;}
    updateEmptyState();renderToolRail();renderPrimaryPanel();renderProperties();updateContextBar();render();showWorkspace({historyMode:sameWorkspace?'none':historyMode});
  }

  function updateEmptyState(){const plan=state.toolset==='plan',compact=isCompactViewer();dom.emptyKicker.textContent=plan?'Plan Mode':'CAD Mode';dom.emptyTitle.textContent=t(plan?'empty.planTitle':'empty.cadTitle');dom.emptyCopy.textContent=t(compact?'empty.viewerCopy':plan?'empty.planCopy':'empty.cadCopy');dom.emptyPrimaryBtn.hidden=compact;dom.emptyPrimaryBtn.textContent=t(plan?'empty.planPrimary':'empty.cadPrimary');dom.emptyOpenBtn.textContent=t(compact?(plan?'empty.planViewerOpen':'empty.cadViewerOpen'):plan?'empty.planSecondary':'empty.cadSecondary');dom.primaryInspectorTab.textContent=t(plan?'tab.floors':'tab.layers');document.querySelector('.inspector-tab[data-tab="reference"]').textContent=t(plan?'tab.palette':'tab.reference');dom.primaryPanelTitle.textContent=t(plan?'panel.floors':'panel.cadLayers');dom.primaryPanelSubtitle.textContent=t(plan?'panel.floorsSub':'panel.cadLayersSub');const refTitle=document.querySelector('[data-panel="reference"] .panel-title'),refSub=document.querySelector('[data-panel="reference"] .panel-subtitle');if(refTitle)refTitle.textContent=t(plan?'panel.palette':'panel.references');if(refSub)refSub.textContent=t(plan?'panel.paletteSub':'panel.referencesSub');if(dom.addReferenceBtn)dom.addReferenceBtn.hidden=plan;if(dom.mappingSettingsBtn)dom.mappingSettingsBtn.hidden=plan||!hasSemanticObjects();}

  function defaultCadMapping(){return{wallRepresentation:'outline',wallLayer:'WALL',doorLayer:'DOOR',windowLayer:'WINDOW',dimensionLayer:'DIM'};}
  function openMappingDialog(action){const m=state.cadMapping||defaultCadMapping();state.mappingPendingAction=action;dom.wallRepresentation.value=m.wallRepresentation;dom.wallLayerInput.value=m.wallLayer;dom.doorLayerInput.value=m.doorLayer;dom.windowLayerInput.value=m.windowLayer;dom.dimensionLayerInput.value=m.dimensionLayer;dom.mappingBackdrop.hidden=false;setTimeout(()=>dom.wallRepresentation.focus(),0);}
  function applyMapping(){markDirty(true);state.cadMapping={wallRepresentation:dom.wallRepresentation.value,wallLayer:(dom.wallLayerInput.value||'WALL').trim(),doorLayer:(dom.doorLayerInput.value||'DOOR').trim(),windowLayer:(dom.windowLayerInput.value||'WINDOW').trim(),dimensionLayer:(dom.dimensionLayerInput.value||'DIM').trim()};for(const name of Object.values({w:state.cadMapping.wallLayer,d:state.cadMapping.doorLayer,wi:state.cadMapping.windowLayer,di:state.cadMapping.dimensionLayer}))if(!state.cadLayerVisibility.has(name))state.cadLayerVisibility.set(name,true);const action=state.mappingPendingAction;state.mappingPendingAction=null;dom.mappingBackdrop.hidden=true;renderPrimaryPanel();renderProperties();render();if(action==='switch-cad')switchToolset('cad',{skipMapping:true});else if(action==='export')void exportDxfNow();else if(action==='tool'){const p=state.pendingToolAfterMapping;state.pendingToolAfterMapping=null;if(p)setTool(p.tool,p.category);}}
  function cancelMapping(){const action=state.mappingPendingAction;state.mappingPendingAction=null;state.pendingToolAfterMapping=null;dom.mappingBackdrop.hidden=true;if(action==='switch-cad'){dom.planToolsBtn.classList.add('active');dom.cadToolsBtn.classList.remove('active');}}

  function historySnapshot(){return JSON.stringify({objects:state.objects,drawingRegions:state.drawingRegions,cadLayerVisibility:[...state.cadLayerVisibility],activeCadLayer:state.activeCadLayer,baseAxisAngle:state.baseAxisAngle,baseAxisWallId:state.baseAxisWallId,dirty:state.dirty,floors:state.floors,activeFloorId:state.activeFloorId});}
  function restoreHistorySnapshot(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed)){state.objects=parsed;state.drawingRegions=[];}else{state.objects=parsed.objects||[];state.drawingRegions=parsed.drawingRegions||[];if(Array.isArray(parsed.cadLayerVisibility))state.cadLayerVisibility=new Map(parsed.cadLayerVisibility);if(parsed.activeCadLayer)state.activeCadLayer=parsed.activeCadLayer;state.baseAxisAngle=Number(parsed.baseAxisAngle)||0;state.baseAxisWallId=parsed.baseAxisWallId||null;if('dirty' in parsed)state.dirty=Boolean(parsed.dirty);if(Array.isArray(parsed.floors)&&parsed.floors.length)state.floors=parsed.floors;if(parsed.activeFloorId)state.activeFloorId=parsed.activeFloorId;ensureFloorModel();}state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectedRegionId=null;refreshSpaces();rebuildObjectSnapIndex();}
  function pushHistory(){state.history.push(historySnapshot());if(state.history.length>60)state.history.shift();state.future=[];updateUndoRedo();}
  function undo(){if(!state.history.length)return;state.future.push(historySnapshot());restoreHistorySnapshot(state.history.pop());updateAll();}
  function redo(){if(!state.future.length)return;state.history.push(historySnapshot());restoreHistorySnapshot(state.future.pop());updateAll();}
  function updateUndoRedo(){dom.undoBtn.disabled=!state.history.length;dom.redoBtn.disabled=!state.future.length;}

  function commitSegment(a,b,type){
    if(distance(a,b)<.001)return null;
    pushHistory();
    let obj;
    const semanticPlanEdge=state.toolset==='plan'&&(type==='line'||type==='wall');
    if(semanticPlanEdge){
      // Plan Mode exposes one drawing primitive: a semantic floor-plan edge. Internally it
      // remains a wall-compatible object so rooms, openings, topology and DXF export share
      // one geometry model instead of diverging Line vs Wall behavior.
      obj={id:uid('wall'),type:'wall',planRole:'boundary',layerId:'walls',a:{...a},b:{...b},thickness:currentWallThickness(),geometry:'straight',attachments:{},floorId:state.activeFloorId};
    }else if(type==='wall'){
      obj={id:uid('wall'),type:'wall',layerId:'walls',a:{...a},b:{...b},thickness:currentWallThickness(),geometry:'straight',attachments:{},floorId:state.activeFloorId};
    }else{
      obj={id:uid('cadLine'),type:state.toolset==='cad'?'cadLine':'line',cadLayer:state.activeCadLayer||'0',layerId:'drawing',a:{...a},b:{...b}};
      if(obj.type==='cadLine')state.cadLayerVisibility.set(obj.cadLayer,true);else obj.floorId=state.activeFloorId;
    }
    state.objects.push(obj);
    if(obj.type==='wall'){
      repairPersistentPlanJunctions(obj.floorId||state.activeFloorId);
      refreshSpaces();
    }
    state.selectedObjectId=obj.id;state.selectedObjectIds=new Set([obj.id]);state.drawStart={...obj.b};state.drawReferenceAngle=obj.type==='wall'&&!isArcWall(obj)?angleDeg(obj.a,obj.b):null;state.previewEnd={...obj.b};markDirty(true);rebuildObjectSnapIndex();updateAll();return obj;
  }
  function commitMeasurement(a,b){const len=distance(a,b);if(len<.001)return;let obj=null;if(state.toolset==='plan'){let best=null,bestScore=Infinity;for(const wall of getPlanObjects().filter(o=>o.type==='wall')){const p1=wallProjectPoint(a,wall),p2=wallProjectPoint(b,wall),tol=Math.max((wall.thickness||150),18/state.camera.zoom);if(p1.distance<=tol&&p2.distance<=tol){const score=p1.distance+p2.distance;if(score<bestScore){bestScore=score;best={wall,t1:p1.t,t2:p2.t,p1:p1.point,p2:p2.point};}}}if(!best){alert(t('alert.dimensionNeedsWall'));state.measureStart=null;state.previewEnd=null;updateContextBar();render();return;}const attachedLen=distance(best.p1,best.p2);obj={id:uid('dimension'),type:'dimension',layerId:'dimensions',wallId:best.wall.id,t1:best.t1,t2:best.t2,offset:Math.max(250,Math.min(600,attachedLen*.08))};}else obj={id:uid('dimension'),type:'dimension',layerId:'dimensions',p1:{...a},p2:{...b},offset:Math.max(250,Math.min(600,len*.08))};pushHistory();state.objects.push(obj);state.selectedObjectId=obj.id;state.measureStart=null;state.previewEnd=null;markDirty(true);rebuildObjectSnapIndex();updateAll();}

  function nearestWallProjection(p){let best=null,bestD=Infinity;for(const wall of getPlanObjects().filter(o=>o.type==='wall')){const pr=wallProjectPoint(p,wall),threshold=Math.max((wall.thickness||150)/2,18/state.camera.zoom);if(pr.distance<threshold&&pr.distance<bestD){bestD=pr.distance;best={wall,t:pr.t,point:pr.point,distance:pr.distance};}}return best;}
  function projectPointToSegment(p,a,b){const vx=b.x-a.x,vy=b.y-a.y,wx=p.x-a.x,wy=p.y-a.y,c2=vx*vx+vy*vy;if(!c2)return{t:0,point:{...a},distance:distance(p,a)};const tt=clamp((wx*vx+wy*vy)/c2,0,1);const q={x:a.x+tt*vx,y:a.y+tt*vy};return{t:tt,point:q,distance:distance(p,q)};}

  function findWallAttachment(point,selfWallId){let best=null,bestD=Math.max(20,10/state.camera.zoom);for(const wall of getPlanObjects()){if(wall.type!=='wall'||wall.id===selfWallId)continue;const pr=wallProjectPoint(point,wall);if(pr.distance<bestD){bestD=pr.distance;best={wallId:wall.id,t:pr.t};}}return best;}
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
  function solvePointOnEdgeAttachment(wall,endpoint,target){
    if(!wall||!target||!['a','b'].includes(endpoint))return false;
    const att=wall.attachments?.[endpoint];if(!att)return false;
    const other=endpoint==='a'?'b':'a',anchor=wall[other],current=wall[endpoint];
    let point=null,t=null;
    if(!isArcWall(wall)&&!isArcWall(target)&&distance(anchor,current)>1e-7){
      // Fusion-like point-on-edge: the endpoint is constrained to lie somewhere on the host,
      // not at a permanently stored host percentage. Preserve the branch's current direction
      // whenever its infinite line still meets the host segment.
      const hit=infiniteLineSegmentIntersection(anchor,current,target.a,target.b);
      if(hit){point=hit.point;t=hit.u;}
    }
    if(!point){const pr=wallProjectPoint(current,target);point=pr.point;t=pr.t;}
    wall[endpoint]={...point};att.t=clamp(Number(t)||0,0,1);att.kind='pointOnLine';att.targetEndpoint=null;return true;
  }
  function enforceWallAttachments(wall){if(!wall?.attachments)return;for(const endpoint of['a','b']){const att=wall.attachments[endpoint],target=att&&state.objects.find(o=>o.id===att.wallId&&o.type==='wall');if(!target)continue;if(att.kind==='coincident'&&att.targetEndpoint&&target[att.targetEndpoint]){wall[endpoint]={...target[att.targetEndpoint]};att.t=att.targetEndpoint==='a'?0:1;}else solvePointOnEdgeAttachment(wall,endpoint,target);}}
  function attachTouchingWallEndpoints(wall){if(!wall||wall.type!=='wall')return false;let changed=false;for(const endpoint of['a','b'])changed=attachWallEndpoint(wall,endpoint)||changed;return changed;}
  function repairPersistentPlanJunctions(floorId=null){
    const walls=state.objects.filter(o=>o.type==='wall'&&!isArcWall(o)&&(!floorId||o.floorId===floorId));
    let changed=false;
    const validIds=new Set(walls.map(w=>w.id));
    // Drop stale cross-floor/removed references, but preserve valid explicit constraints.
    for(const wall of walls){
      wall.attachments=wall.attachments||{};
      for(const ep of ['a','b']){
        const att=wall.attachments[ep],target=att&&state.objects.find(o=>o.id===att.wallId&&o.type==='wall');
        if(att&&(!target||!validIds.has(target.id)||(wall.floorId&&target.floorId&&wall.floorId!==target.floorId))){delete wall.attachments[ep];changed=true;}
      }
    }
    // Endpoint↔endpoint L/corner joins are directed deterministically to avoid attachment cycles.
    for(let i=0;i<walls.length;i++)for(let j=i+1;j<walls.length;j++){
      const a=walls[i],b=walls[j],tol=Math.max(6,Math.min(30,Math.max(a.thickness||150,b.thickness||150)*.10));
      for(const ea of ['a','b'])for(const eb of ['a','b']){
        if(distance(a[ea],b[eb])>tol)continue;
        const child=a.id.localeCompare(b.id)>0?a:b,parent=child===a?b:a,cep=child===a?ea:eb,pep=child===a?eb:ea;
        if(child.attachments?.[cep])continue;
        child[cep]={...parent[pep]};child.attachments[cep]={wallId:parent.id,t:pep==='a'?0:1,kind:'coincident',targetEndpoint:pep,autoJunction:true};changed=true;
      }
    }
    // T joins: terminal endpoint belongs to the continuous host wall and follows it persistently.
    for(const branch of walls)for(const ep of ['a','b']){
      if(branch.attachments?.[ep])continue;
      const p=branch[ep];let best=null,bestD=Infinity;
      for(const hostWall of walls){if(hostWall===branch)continue;const pr=wallProjectPoint(p,hostWall),tol=Math.max(6,Math.min(30,Math.max(branch.thickness||150,hostWall.thickness||150)*.10));if(pr.t<=.002||pr.t>=.998||pr.distance>tol||pr.distance>=bestD)continue;bestD=pr.distance;best={wall:hostWall,pr};}
      if(best){branch[ep]={...best.pr.point};branch.attachments[ep]={wallId:best.wall.id,t:best.pr.t,kind:'pointOnLine',targetEndpoint:null,autoJunction:true};changed=true;}
    }
    return changed;
  }
  function migrateLegacyPlanLinesToEdges(){
    let changed=false;
    for(const o of state.objects){
      if(o.type!=='line'||!o.floorId)continue;
      o.type='wall';o.id=o.id||uid('wall');o.planRole=o.planRole||'boundary';o.layerId='walls';o.thickness=Number(o.thickness)||state.toolSettings.wallThickness||150;o.geometry='straight';o.attachments=o.attachments||{};changed=true;
    }
    if(changed)for(const floor of state.floors||[])repairPersistentPlanJunctions(floor.id);
    return changed;
  }
  function syncDependentsOfWall(parentId,visited=new Set()){if(visited.has(parentId))return;visited.add(parentId);const parent=state.objects.find(o=>o.id===parentId&&o.type==='wall');if(!parent)return;for(const wall of getPlanObjects()){if(wall.type!=='wall'||wall.id===parentId)continue;let changed=false;for(const endpoint of['a','b']){const att=wall.attachments?.[endpoint];if(att?.wallId===parentId){if(att.kind==='coincident'&&att.targetEndpoint&&parent[att.targetEndpoint]){wall[endpoint]={...parent[att.targetEndpoint]};att.t=att.targetEndpoint==='a'?0:1;}else solvePointOnEdgeAttachment(wall,endpoint,parent);changed=true;}}const c=ensureWallConstraints(wall);if(c.reference?.wallId===parentId){enforceWallConstraints(wall);changed=true;}if(changed)syncDependentsOfWall(wall.id,visited);}refreshSpaces();}

  function detectClosedWallFaces(){
    const walls=getPlanObjects().filter(o=>o.type==='wall');if(walls.length<3)return[];
    const segments=[];for(const w of walls)for(const seg of sampleWallSegments(w,{maxAngle:8,maxLength:280}))segments.push({id:`${w.id}:${seg.t0}`,wallId:w.id,a:seg.a,b:seg.b});
    return detectFacesFromSegments(segments,{minArea:10000,ignoreInteriorCrossings:true});
  }
  function detectFacesFromSegments(segments,{minArea=10000,maxArea=Infinity,snapTol=3,ignoreInteriorCrossings=false}={}){
    if(!segments?.length)return[];const splits=new Map(segments.map(seg=>[seg.id,new Set([0,1])]));
    for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){const x=segmentIntersection(segments[i].a,segments[i].b,segments[j].a,segments[j].b);if(!x)continue;if(ignoreInteriorCrossings){const e=.012,meaningful=x.t<=e||x.t>=1-e||x.u<=e||x.u>=1-e;if(!meaningful)continue;}splits.get(segments[i].id).add(x.t);splits.get(segments[j].id).add(x.u);}
    const tol=Math.max(.5,snapTol),keyOf=p=>`${Math.round(p.x/tol)},${Math.round(p.y/tol)}`,nodes=new Map(),adj=new Map(),edgeWall=new Map();
    const nodeFor=p=>{const k=keyOf(p);if(!nodes.has(k))nodes.set(k,{x:Math.round(p.x/tol)*tol,y:Math.round(p.y/tol)*tol});if(!adj.has(k))adj.set(k,new Set());return k;};
    for(const seg of segments){const ts=[...splits.get(seg.id)].sort((a,b)=>a-b);for(let i=1;i<ts.length;i++){if(ts[i]-ts[i-1]<1e-8)continue;const p1={x:seg.a.x+(seg.b.x-seg.a.x)*ts[i-1],y:seg.a.y+(seg.b.y-seg.a.y)*ts[i-1]},p2={x:seg.a.x+(seg.b.x-seg.a.x)*ts[i],y:seg.a.y+(seg.b.y-seg.a.y)*ts[i]},a=nodeFor(p1),b=nodeFor(p2);if(a===b)continue;adj.get(a).add(b);adj.get(b).add(a);edgeWall.set([a,b].sort().join('|'),seg.wallId||seg.id);}}
    for(const[k,set]of adj){const p0=nodes.get(k);adj.set(k,[...set].sort((ka,kb)=>{const a=nodes.get(ka),b=nodes.get(kb);return Math.atan2(a.y-p0.y,a.x-p0.x)-Math.atan2(b.y-p0.y,b.x-p0.x);}));}
    const visited=new Set(),faces=[];for(const[u,neighbors]of adj)for(const v0 of neighbors){const start=`${u}>${v0}`;if(visited.has(start))continue;let a=u,b=v0,poly=[],wallIds=new Set(),guard=0,closed=false;while(guard++<4000){const dir=`${a}>${b}`;if(visited.has(dir)&&dir!==start)break;visited.add(dir);poly.push(nodes.get(a));wallIds.add(edgeWall.get([a,b].sort().join('|')));const list=adj.get(b)||[],idx=list.indexOf(a);if(idx<0||!list.length)break;const c=list[(idx-1+list.length)%list.length];a=b;b=c;if(`${a}>${b}`===start){closed=true;break;}}if(!closed||poly.length<3)continue;const area=polygonArea(poly);if(area>minArea&&area<maxArea)faces.push({polygon:poly,area,wallIds:[...wallIds].filter(Boolean)});}
    const unique=[];for(const f of faces.sort((a,b)=>a.area-b.area)){const c=polygonCentroid(f.polygon);if(unique.some(u=>Math.abs(u.area-f.area)/Math.max(f.area,1)<.015&&distance(c,polygonCentroid(u.polygon))<20))continue;unique.push(f);}return unique;
  }
  function faceAtPoint(p){return detectClosedWallFaces().find(f=>pointInPolygon(p,f.polygon))||null;}
  function refreshSpaces(){const spaces=state.objects.filter(o=>o.type==='space');if(!spaces.length)return;const faces=detectClosedWallFaces();for(const space of spaces){const face=faces.find(f=>pointInPolygon(space.seed||polygonCentroid(space.polygon||[]),f.polygon));if(face){space.polygon=face.polygon.map(p=>({...p}));space.wallIds=[...face.wallIds];space.areaM2=face.area/1e6;space.invalid=false;}else space.invalid=true;}}
  function commitSpace(p){const face=faceAtPoint(p);if(!face){alert(t('alert.noClosedSpace'));return;}const existing=state.objects.find(o=>o.type==='space'&&o.polygon?.length&&pointInPolygon(p,o.polygon));if(existing){state.selectedObjectId=existing.id;renderProperties();render();return;}pushHistory();const obj={id:uid('space'),type:'space',layerId:'spaces',spaceUuid:makeStableUuid(),seed:{...p},polygon:face.polygon.map(q=>({...q})),wallIds:[...face.wallIds],areaM2:face.area/1e6,invalid:false};state.objects.push(obj);state.selectedObjectId=obj.id;markDirty(true);updateAll();}
  function commitOpening(kind,projection){if(!projection){alert(t('alert.noWallForOpening'));return;}pushHistory();const width=kind==='door'?state.toolSettings.doorWidth:state.toolSettings.windowWidth,obj={id:uid(kind),type:kind,layerId:kind==='door'?'doors':'windows',wallId:projection.wall.id,t:projection.t,width};if(kind==='door'){obj.doorType=state.toolSettings.doorType||'hingedSingle';obj.hinge='start';obj.swing=1;obj.slideDirection=1;}state.objects.push(obj);state.selectedObjectId=obj.id;state.selectedObjectIds=new Set([obj.id]);markDirty(true);rebuildObjectSnapIndex();updateAll();}
  function collectObjectSnapPoints(){const pts=[];for(const o of state.objects){if(o.a)pts.push({x:o.a.x,y:o.a.y,objectId:o.id,kind:'endpoint'});if(o.b)pts.push({x:o.b.x,y:o.b.y,objectId:o.id,kind:'endpoint'});if(o.center)pts.push({x:o.center.x,y:o.center.y,objectId:o.id,kind:'center'});if(o.type==='cadArc'){for(const t of[0,1]){const ap=cadArcPointAt(o,t);pts.push({...ap,objectId:o.id,kind:'endpoint'});}}if(o.point)pts.push({x:o.point.x,y:o.point.y,objectId:o.id,kind:'point'});if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);if(g){pts.push({...g.p1,objectId:o.id,kind:'opening'},{...g.p2,objectId:o.id,kind:'opening'},{...g.center,objectId:o.id,kind:'center'});}}if(o.type==='dimension'){const g=dimensionGeometry(o);if(g)pts.push({...g.p1,objectId:o.id,kind:'dimension'},{...g.p2,objectId:o.id,kind:'dimension'});}}return pts;}
  function rebuildObjectSnapIndex(){state.cadRenderRevision=(state.cadRenderRevision||0)+1;const pts=collectObjectSnapPoints();if(!pts.length){state.objectSnapIndex=null;return;}const cellW=1000,cellH=1000,cells=new Map();for(const q of pts){const gx=Math.floor(q.x/cellW),gy=Math.floor(q.y/cellH),k=`${gx},${gy}`;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(q);}state.objectSnapIndex={minx:0,miny:0,cellW,cellH,cells};}
  function queryObjectSnapIndex(p,threshold,test){const idx=state.objectSnapIndex;if(!idx)return;const gx=Math.floor((p.x-idx.minx)/idx.cellW),gy=Math.floor((p.y-idx.miny)/idx.cellH),rx=Math.max(1,Math.ceil(threshold/idx.cellW)),ry=Math.max(1,Math.ceil(threshold/idx.cellH));for(let dx=-rx;dx<=rx;dx++)for(let dy=-ry;dy<=ry;dy++){const bucket=idx.cells.get(`${gx+dx},${gy+dy}`);if(bucket)for(const q of bucket)test(q);}}

  function nearestSnap(p,excludeObjectId=null){
    state.snapIndicator=null;
    if(!state.snap)return p;
    const threshold=10/state.camera.zoom;let best=null,bestD=threshold,bestPriority=-1;
    const snapPriority=kind=>kind==='intersection'?4:kind==='endpoint'?3:kind==='wall'?2:kind==='midpoint'?1:0;
    const test=(q,kind=q.kind||'endpoint',source='plan')=>{if(excludeObjectId&&q.objectId===excludeObjectId)return;const d=distance(p,q),priority=snapPriority(kind);if(d<bestD-1e-7||(Math.abs(d-bestD)<=1e-7&&priority>bestPriority)){bestD=d;bestPriority=priority;best={x:q.x,y:q.y,kind,objectId:q.objectId||null,source};}};
    if(state.objectSnapIndex)queryObjectSnapIndex(p,threshold,q=>{const o=q.objectId&&state.objects.find(x=>x.id===q.objectId);if(state.toolset==='plan'&&o&&(!objectOnActiveFloor(o)||isCadObject(o)||(o.type==='line'&&!o.floorId)))return;test(q,q.kind,'plan');});else for(const o of state.objects){if(state.toolset==='plan'&&(!objectOnActiveFloor(o)||isCadObject(o)||(o.type==='line'&&!o.floorId)))continue;if(o.a)test({...o.a,objectId:o.id},'endpoint','plan');if(o.b)test({...o.b,objectId:o.id},'endpoint','plan');}
    const wantsWallProjection=state.activeTool==='wall'||(state.dragEdit&&state.objects.find(o=>o.id===state.dragEdit.objectId)?.type==='wall'&&['a','b'].includes(state.dragEdit.mode));
    if(wantsWallProjection){for(const wall of getPlanObjects()){if(wall.type!=='wall'||wall.id===excludeObjectId)continue;const pr=wallProjectPoint(p,wall);if(pr.distance<bestD)test({...pr.point,objectId:wall.id},'wall','plan');}}
    // In Plan Mode the CAD/reference drawing is only a tracing aid. It participates in SNAP
    // while Control is held; Shift remains reserved for angle tracking. CAD Mode keeps the
    // traditional always-available reference snap behavior.
    const allowReferenceSnap=state.toolset!=='plan'||state.ctrlDown;
    if(allowReferenceSnap){for(const ref of state.references){if(!ref.visible)continue;
      if(ref.type==='dxf'&&ref.snapIndex){const local=referenceWorldToLocal(ref,p),lt=threshold/Math.max(.000001,ref.scale),visible=layer=>!ref.visibleLayers||ref.visibleLayers.has(layer);queryReferenceSnapIndex(ref.snapIndex,local,lt,visible,(q,kind)=>{const w=referenceLocalToWorld(ref,q);test({...w,objectId:null},kind,'reference');});}
      else if(ref.type==='linkedCadRegion'){const region=state.drawingRegions.find(r=>r.id===ref.regionId);if(!region)continue;const idx=getLinkedCadRenderCache(ref,region).snapIndex,visible=layer=>!ref.visibleLayers||ref.visibleLayers.has(layer);queryReferenceSnapIndex(idx,p,threshold,visible,(q,kind)=>test({...q,objectId:null},kind,'reference'));}
    }}
    if(best){state.snapIndicator=best;return{x:best.x,y:best.y};}
    return p;
  }
  function effectiveOrtho(){return state.toolset==='plan'?Boolean(state.ortho):(Boolean(state.ortho)!==Boolean(state.shiftDown));}
  function snapDirectionToStep(start,p,base,step=45){const dx=p.x-start.x,dy=p.y-start.y,len=Math.hypot(dx,dy);if(len<1e-9)return p;const ang=angleDeg(start,p),relative=angleDelta(ang,base),snapped=Math.round(relative/step)*step,a=rad(base+snapped);return{x:start.x+Math.cos(a)*len,y:start.y+Math.sin(a)*len};}
  function constrainTracking(start,p){
    if(!start)return p;
    const base=baseAxisAngle(),dx=p.x-start.x,dy=p.y-start.y,len=Math.hypot(dx,dy);if(len<1e-9)return p;
    // In Plan Mode Shift is a deliberate angle lock, not a temporary ORTHO toggle.
    // When a new edge starts from an existing edge, 45° increments are local to that edge.
    if(state.toolset==='plan'&&state.activeTool==='line'&&state.shiftDown){
      const reference=Number.isFinite(state.drawReferenceAngle)?state.drawReferenceAngle:base;
      return snapDirectionToStep(start,p,reference,45);
    }
    if(effectiveOrtho()){
      const a=rad(base),ux=Math.cos(a),uy=Math.sin(a),vx=-uy,vy=ux,du=dx*ux+dy*uy,dv=dx*vx+dy*vy;
      return Math.abs(du)>=Math.abs(dv)?{x:start.x+ux*du,y:start.y+uy*du}:{x:start.x+vx*dv,y:start.y+vy*dv};
    }
    if(state.polar){
      const ang=angleDeg(start,p),relative=angleDelta(ang,base),step=45,snapped=Math.round(relative/step)*step,diff=Math.abs(angleDelta(relative,snapped));
      if(diff<=7){const a=rad(base+snapped);return{x:start.x+Math.cos(a)*len,y:start.y+Math.sin(a)*len};}
    }
    return p;
  }
  function constrainOrtho(start,p){return constrainTracking(start,p);}
  function constrainEndpointToOriginalAngle(src,endpoint,p){
    if(!src?.a||!src?.b||!['a','b'].includes(endpoint))return p;
    const anchor=endpoint==='a'?src.b:src.a,target=endpoint==='a'?src.a:src.b,dx=target.x-anchor.x,dy=target.y-anchor.y,len=Math.hypot(dx,dy);if(len<1e-9)return p;const ux=dx/len,uy=dy/len,dot=(p.x-anchor.x)*ux+(p.y-anchor.y)*uy;return{x:anchor.x+ux*dot,y:anchor.y+uy*dot};
  }
  function planDrawReferenceAt(raw,point){
    if(state.toolset!=='plan')return null;let wall=null;
    const snapId=state.snapIndicator?.objectId;if(snapId)wall=state.objects.find(o=>o.id===snapId&&o.type==='wall');
    if(!wall){let bestD=10/state.camera.zoom;for(const w of getPlanObjects().filter(o=>o.type==='wall')){const pr=wallProjectPoint(raw,w);if(pr.distance<bestD){bestD=pr.distance;wall=w;point={...pr.point};}}}
    if(!wall)return{point,angle:null};const pr=wallProjectPoint(point,wall),tan=wallTangentAt(wall,pr.t);return{point:{...pr.point},angle:deg(Math.atan2(tan.uy,tan.ux))};
  }

  function hitHandle(p,obj){const tol=9/state.camera.zoom;if(!obj)return null;if((obj.type==='wall'||obj.type==='line'||obj.type==='cadLine')&&obj.a&&obj.b){if(distance(p,obj.a)<=tol)return'a';if(distance(p,obj.b)<=tol)return'b';if(obj.type==='wall'&&isArcWall(obj)&&distance(p,arcControlPoint(obj))<=tol)return'arcControl';}if(obj.type==='door'||obj.type==='window'){const g=openingGeometry(obj);if(g){if(distance(p,g.p1)<=tol)return'p1';if(distance(p,g.p2)<=tol)return'p2';if(distance(p,g.center)<=tol)return'center';}}if(obj.type==='dimension'){const g=dimensionGeometry(obj);if(g){if(!g.associated){if(distance(p,g.p1)<=tol)return'p1';if(distance(p,g.p2)<=tol)return'p2';}const c={x:(g.d1.x+g.d2.x)/2,y:(g.d1.y+g.d2.y)/2};if(distance(p,c)<=tol)return'offset';}}return null;}
  function objectBodyDistance(p,o){if(o.type==='door'){const g=openingGeometry(o);if(!g)return Infinity;const type=o.doorType||'hingedSingle';if(type.startsWith('hinged')){const d=doorGeometry(o);return d?Math.min(pointSegmentDistance(p,g.p1,g.p2),pointSegmentDistance(p,d.hinge,d.leafEnd)):pointSegmentDistance(p,g.p1,g.p2);}return pointSegmentDistance(p,g.p1,g.p2);}if(o.type==='window'){const g=openingGeometry(o);return g?pointSegmentDistance(p,g.p1,g.p2):Infinity;}if(o.type==='dimension'){const g=dimensionGeometry(o);return g?pointSegmentDistance(p,g.d1,g.d2):Infinity;}if(o.type==='space')return o.polygon?.length&&pointInPolygon(p,o.polygon)?0:Infinity;if(o.type==='stair')return o.polygon?.length&&pointInPolygon(p,o.polygon)?0:Infinity;if(o.type==='cadCircle')return Math.abs(distance(p,o.center)-o.radius);if(o.type==='cadArc')return projectPointToCadArc(p,o).distance;if(o.type==='wall'&&isArcWall(o)){const d=wallProjectPoint(p,o).distance;return state.toolset==='plan'?d:Math.max(0,d-(o.thickness||150)/2);}if(o.a&&o.b){let d=pointSegmentDistance(p,o.a,o.b);if(o.type==='wall'&&state.toolset!=='plan')d=Math.max(0,d-(o.thickness||150)/2);return d;}return Infinity;}
  function hitObject(p){const tolerance=9/state.camera.zoom;let best=null,bestD=Infinity,spaceHit=null,objects=state.toolset==='plan'?getPlanObjects():state.objects;for(let i=objects.length-1;i>=0;i--){const o=objects[i];if(state.toolset==='cad'&&o.type!=='space'&&(isCadObject(o)||isSemanticObject(o)||o.type==='line')&&!cadLayerVisible(cadLayerForObject(o)))continue;if(o.type==='space'){if(!spaceHit&&objectBodyDistance(p,o)===0)spaceHit=o;continue;}const d=objectBodyDistance(p,o);if(d<tolerance&&d<bestD){best=o;bestD=d;}}return best||spaceHit;}
  function pointSegmentDistance(p,a,b){return projectPointToSegment(p,a,b).distance;}

  function beginObjectDrag(e,p,obj,forcedMode=null){if(obj?.type==='space')return;const handle=hitHandle(p,obj);const mode=forcedMode||handle||'body';state.dragEdit={pointerId:e.pointerId,objectId:obj.id,mode,start:{...p},snapshot:JSON.parse(JSON.stringify(obj)),historyPushed:false};canvas.setPointerCapture?.(e.pointerId);host.dataset.drag='true';}
  function beginCopyDrag(e,p,obj){
    if(!obj||obj.type==='space')return false;pushHistory();const copy=JSON.parse(JSON.stringify(obj));copy.id=uid(obj.type);delete copy.recognizedFromCad;delete copy.sourceRegionId;delete copy.recognitionSourceIds;delete copy.recognitionConfidence;delete copy.recognitionBaselineSignature;delete copy.recognitionDetached;if(copy.type==='wall')copy.attachments={};state.objects.push(copy);state.selectedObjectId=copy.id;state.selectedObjectIds=new Set([copy.id]);state.dragEdit={pointerId:e.pointerId,objectId:copy.id,mode:(copy.type==='door'||copy.type==='window')?'center':'body',start:{...p},snapshot:JSON.parse(JSON.stringify(copy)),historyPushed:true,copyCreated:true};canvas.setPointerCapture?.(e.pointerId);host.dataset.drag='true';markDirty(true);rebuildObjectSnapIndex();renderPrimaryPanel();renderProperties();render();return true;
  }
  function ensureDragHistory(){if(state.dragEdit&&!state.dragEdit.historyPushed){pushHistory();state.dragEdit.historyPushed=true;}}
  function moveChildrenWithWall(wallId,dx,dy){/* openings are parametric on the wall and move with it automatically */}
  function applyObjectDrag(p){const d=state.dragEdit;if(!d)return;const obj=state.objects.find(o=>o.id===d.objectId);if(!obj)return;const src=d.snapshot,delta={x:p.x-d.start.x,y:p.y-d.start.y};ensureDragHistory();
    if((obj.type==='wall'||obj.type==='line'||obj.type==='cadLine')&&src.a&&src.b){
      if(obj.type==='wall'&&isArcWall(src)&&d.mode==='arcControl'){obj.a={...src.a};obj.b={...src.b};applyArcFromControl(obj,p);}
      else if(d.mode==='a'){const q=(state.toolset==='plan'&&state.shiftDown&&!isArcWall(src))?constrainEndpointToOriginalAngle(src,'a',p):p;obj.a={...q};if(obj.type==='wall'&&isArcWall(src)){const control=wallPointAt(src,.5);applyArcFromControl(obj,control);}}
      else if(d.mode==='b'){const q=(state.toolset==='plan'&&state.shiftDown&&!isArcWall(src))?constrainEndpointToOriginalAngle(src,'b',p):p;obj.b={...q};if(obj.type==='wall'&&isArcWall(src)){const control=wallPointAt(src,.5);applyArcFromControl(obj,control);}}
      else{obj.a={x:src.a.x+delta.x,y:src.a.y+delta.y};obj.b={x:src.b.x+delta.x,y:src.b.y+delta.y};if(obj.type==='wall'&&isArcWall(src)){obj.center={x:src.center.x+delta.x,y:src.center.y+delta.y};}}
      if(obj.type==='wall'){
        // SNAP is only a placement aid. Persistent endpoint relationships live in attachments/constraints.
        // If an endpoint is already constrained to another wall, dragging keeps that explicit relationship.
        if(src.attachments)obj.attachments=JSON.parse(JSON.stringify(src.attachments));
        if(d.mode==='body'&&obj.attachments){
          for(const endpoint of['a','b']){
            const att=obj.attachments?.[endpoint],parent=att&&state.objects.find(o=>o.id===att.wallId&&o.type==='wall');
            if(!parent)continue;
            const desired={x:src[endpoint].x+delta.x,y:src[endpoint].y+delta.y};
            if(att.kind==='coincident'&&att.targetEndpoint&&parent[att.targetEndpoint]){
              // Moving a joined Plan line moves the shared corner node too. The neighboring
              // line stretches/rotates through that endpoint instead of visually detaching.
              parent[att.targetEndpoint]={...desired};
              enforceWallConstraints(parent,{changed:att.targetEndpoint});
              att.t=att.targetEndpoint==='a'?0:1;
              obj[endpoint]={...parent[att.targetEndpoint]};
              syncDependentsOfWall(parent.id);
            }else{const pr=wallProjectPoint(desired,parent);att.t=pr.t;obj[endpoint]={...pr.point};}
          }
        }else if((d.mode==='a'||d.mode==='b')&&obj.attachments?.[d.mode]){
          const att=obj.attachments[d.mode],parent=state.objects.find(o=>o.id===att.wallId&&o.type==='wall');
          if(parent){
            if(att.kind==='coincident'&&att.targetEndpoint&&parent[att.targetEndpoint]){
              // A shared corner is one persistent junction. Dragging either side's endpoint
              // moves the common node instead of visually pulling the two walls apart.
              const q=(state.toolset==='plan'&&state.shiftDown&&!isArcWall(src))?constrainEndpointToOriginalAngle(src,d.mode,p):p;
              parent[att.targetEndpoint]={...q};att.t=att.targetEndpoint==='a'?0:1;obj[d.mode]={...q};syncDependentsOfWall(parent.id);
            }else{
              const requested=(state.toolset==='plan'&&state.shiftDown&&!isArcWall(src))?constrainEndpointToOriginalAngle(src,d.mode,p):p;
              const pr=wallProjectPoint(requested,parent);att.t=pr.t;obj[d.mode]={...pr.point};
            }
          }
        }
        enforceWallConstraints(obj,{changed:d.mode==='a'?'a':d.mode==='b'?'b':'body'});
        syncDependentsOfWall(obj.id);refreshSpaces();
      }
    }
    else if(obj.type==='door'||obj.type==='window'){
      const wall=state.objects.find(o=>o.id===obj.wallId&&o.type==='wall');if(wall){const pr=wallProjectPoint(p,wall);
        if(d.mode==='center'){obj.t=pr.t;}
        else if(d.mode==='body'&&obj.type==='door'){
          const tg=wallTangentAt(wall,src.t??.5),dx=p.x-d.start.x,dy=p.y-d.start.y,along=dx*tg.ux+dy*tg.uy,across=dx*(-tg.uy)+dy*tg.ux,threshold=14/state.camera.zoom;
          if(!d.gestureResolved&&Math.max(Math.abs(along),Math.abs(across))>=threshold){
            const type=src.doorType||'hingedSingle';
            if(type.startsWith('hinged')){
              if(Math.abs(across)>Math.abs(along)){obj.swing=src.swing===-1?1:-1;d.gestureResolved='swing';}
              else{obj.hinge=src.hinge==='end'?'start':'end';d.gestureResolved='hinge';}
            }else if(Math.abs(along)>=Math.abs(across)){obj.slideDirection=src.slideDirection===-1?1:-1;d.gestureResolved='slide';}
          }
        }
        else if(d.mode==='body'){obj.t=pr.t;}
        else if(d.mode==='p1'||d.mode==='p2'){const g0=openingGeometry(src);if(g0){const opposite=d.mode==='p1'?g0.p2:g0.p1,pp=wallProjectPoint(p,wall),po=wallProjectPoint(opposite,wall),len=wallLength(wall);obj.t=clamp((pp.t+po.t)/2,0,1);obj.width=Math.max(100,Math.abs(pp.t-po.t)*len);}}
      }
    }
    else if(obj.type==='dimension'){const g0=dimensionGeometry(src);if(g0){if(g0.associated){const base={x:(g0.p1.x+g0.p2.x)/2,y:(g0.p1.y+g0.p2.y)/2};obj.offset=(p.x-base.x)*g0.nx+(p.y-base.y)*g0.ny;}else if(d.mode==='p1')obj.p1={...p};else if(d.mode==='p2')obj.p2={...p};else if(d.mode==='offset'){const base={x:(obj.p1.x+obj.p2.x)/2,y:(obj.p1.y+obj.p2.y)/2},v={x:obj.p2.x-obj.p1.x,y:obj.p2.y-obj.p1.y},len=Math.max(.000001,Math.hypot(v.x,v.y)),nx=-v.y/len,ny=v.x/len;obj.offset=(p.x-base.x)*nx+(p.y-base.y)*ny;}else{obj.p1={x:g0.p1.x+delta.x,y:g0.p1.y+delta.y};obj.p2={x:g0.p2.x+delta.x,y:g0.p2.y+delta.y};}}}
    markDirty(true);rebuildObjectSnapIndex();renderProperties();render();}


  function updatePointerAffordance(p){state.pointerAffordance=null;if(state.activeTool!=='select'||state.dragEdit||isCompactViewer()){delete host.dataset.affordance;return;}const selected=state.objects.find(o=>o.id===state.selectedObjectId);if(selected&&selectionIds().size===1){const h=hitHandle(p,selected);if(h){if((selected.type==='wall'||selected.type==='line'||selected.type==='cadLine')&&(h==='a'||h==='b'))state.pointerAffordance='endpoint';else if(selected.type==='wall'&&h==='arcControl')state.pointerAffordance='offset';else if((selected.type==='door'||selected.type==='window')&&(h==='p1'||h==='p2'))state.pointerAffordance='resize';else if(selected.type==='dimension'&&h==='offset')state.pointerAffordance='offset';else state.pointerAffordance='move';}}if(!state.pointerAffordance&&hitObject(p))state.pointerAffordance='move';if(state.pointerAffordance)host.dataset.affordance=state.pointerAffordance;else delete host.dataset.affordance;}
  function updateHover(p){if(state.activeTool!=='select'||state.dragEdit||isCompactViewer()||(state.toolset==='cad'&&state.objects.length>5000)){state.hoveredObjectId=null;host.dataset.hover='false';updatePointerAffordance(p);return;}const o=hitObject(p);state.hoveredObjectId=o?.id||null;host.dataset.hover=state.hoveredObjectId?'true':'false';updatePointerAffordance(p);}

  function beginViewerPointer(e,s){state.viewerPointers.set(e.pointerId,s);canvas.setPointerCapture?.(e.pointerId);if(state.viewerPointers.size===1){state.pan={pointerId:e.pointerId,startScreen:s,startCamera:{...state.camera}};host.dataset.pan='true';}else if(state.viewerPointers.size===2){const pts=[...state.viewerPointers.values()],c={x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2},dist=Math.max(1,Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y));state.viewerGesture={startDistance:dist,startCenter:c,startCamera:{...state.camera},startZoom:state.camera.zoom,worldAtCenter:screenCssToWorld(c)};state.pan=null;}}
  function moveViewerPointer(e,s){if(!state.viewerPointers.has(e.pointerId))return false;state.viewerPointers.set(e.pointerId,s);if(state.viewerPointers.size>=2&&state.viewerGesture){const pts=[...state.viewerPointers.values()].slice(0,2),c={x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2},dist=Math.max(1,Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y)),g=state.viewerGesture;state.camera.zoom=clamp(g.startZoom*(dist/g.startDistance),.002,8);const after=screenCssToWorld(c);state.camera.cx+=g.worldAtCenter.x-after.x;state.camera.cy+=g.worldAtCenter.y-after.y;render();return true;}if(state.pan&&state.pan.pointerId===e.pointerId){const dx=(s.x-state.pan.startScreen.x)/state.camera.zoom,dy=(s.y-state.pan.startScreen.y)/state.camera.zoom;state.camera.cx=state.pan.startCamera.cx-dx;state.camera.cy=state.pan.startCamera.cy+dy;render();return true;}return true;}
  function endViewerPointer(e){state.viewerPointers.delete(e.pointerId);if(state.viewerPointers.size<2)state.viewerGesture=null;if(!state.viewerPointers.size){state.pan=null;host.dataset.pan='false';}try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}return true;}

  function onPointerMove(e){if(state.toolset==='plan')state.ctrlDown=Boolean(e.ctrlKey);const s=fromPointerEvent(e);let p=screenCssToWorld(s);state.cursorWorld=p;dom.statusX.textContent=`X ${formatNumber(p.x,1)}`;dom.statusY.textContent=`Y ${formatNumber(p.y,1)}`;
    if(isCompactViewer()&&moveViewerPointer(e,s))return;
    if(state.regionDrag&&state.regionDrag.pointerId===e.pointerId){state.regionDrag.current={...p};render();return;}
    if(state.selectionDrag&&state.selectionDrag.pointerId===e.pointerId){state.selectionDrag.current={...p};updateSelectionDragPreview();render();return;}
    if(state.pan){const dx=(s.x-state.pan.startScreen.x)/state.camera.zoom,dy=(s.y-state.pan.startScreen.y)/state.camera.zoom;state.camera.cx=state.pan.startCamera.cx-dx;state.camera.cy=state.pan.startCamera.cy+dy;render();return;}
    if(state.dragEdit){const dragged=state.objects.find(o=>o.id===state.dragEdit.objectId);applyObjectDrag((dragged?.type==='door'||dragged?.type==='window')?p:nearestSnap(p,state.dragEdit.objectId));return;}
    if(state.activeTool==='constraint')updateConstraintHover(p);else updateHover(p);
    if(state.activeTool==='trim')updatePlanTrimPreview(p);else state.trimPreview=null;
    if(state.activeTool==='door'||state.activeTool==='window')state.previewOpening=nearestWallProjection(p);else state.previewOpening=null;
    const start=state.drawStart||state.measureStart||state.calibration?.p1;if(start)p=constrainOrtho(start,nearestSnap(p));else p=nearestSnap(p);state.previewEnd=p;render();}

  function onPointerDown(e){host.focus();hideContextMenu();if(state.toolset==='plan')state.ctrlDown=Boolean(e.ctrlKey);const s=fromPointerEvent(e);if(isCompactViewer()){if(e.button===0||e.pointerType==='touch'){e.preventDefault();beginViewerPointer(e,s);}return;}const panGesture=e.button===1||(e.button===0&&state.spaceDown);if(panGesture){e.preventDefault();if(state.spaceGesture)state.spaceGesture.used=true;state.pan={pointerId:e.pointerId,startScreen:s,startCamera:{...state.camera}};host.dataset.pan='true';canvas.setPointerCapture?.(e.pointerId);return;}const ctrlSnapClick=state.toolset==='plan'&&e.ctrlKey&&['line','wall','measure','move','copy','trim','extend'].includes(state.activeTool);if(e.button!==0&&!(ctrlSnapClick&&e.button===2))return;if(ctrlSnapClick)e.preventDefault();const editableLabel=hitEditableLabel(s);if(editableLabel)return;let raw=screenCssToWorld(s),p=nearestSnap(raw);
    if(state.activeTool==='region'&&state.toolset==='cad'){state.regionDrag={pointerId:e.pointerId,start:{...raw},current:{...raw}};canvas.setPointerCapture?.(e.pointerId);render();return;}
    if(state.activeTool==='constraint'&&state.toolset==='plan'){handleConstraintCanvasClick(raw);return;}
    if(state.calibration){if(!state.calibration.p1){state.calibration.p1=p;state.previewEnd=p;updateContextBar();render();}else{state.calibration.p2=p;openCalibrationDialog();}return;}
    if(state.activeTool==='select'){const selected=state.objects.find(o=>o.id===state.selectedObjectId);if(selected&&hitHandle(raw,selected)){beginObjectDrag(e,raw,selected);return;}const obj=hitObject(raw);if(obj){applyObjectClickSelection(obj,e);if(!(e.shiftKey||e.ctrlKey||e.metaKey)&&state.selectedObjectIds.size<=1)beginObjectDrag(e,raw,obj);renderPrimaryPanel();renderProperties();render();return;}if(state.toolset==='cad'||state.toolset==='plan'){const mode=e.shiftKey?'add':(e.ctrlKey||e.metaKey?'toggle':'replace');state.selectionDrag={pointerId:e.pointerId,start:{...raw},current:{...raw},mode,previewIds:new Set()};canvas.setPointerCapture?.(e.pointerId);if(mode==='replace'){state.selectedObjectIds.clear();state.selectedObjectId=null;}state.selectedReferenceId=null;state.selectedRegionId=null;renderPrimaryPanel();renderProperties();render();return;}applyObjectClickSelection(null,e);renderPrimaryPanel();renderProperties();render();return;}
    if(state.activeTool==='move'||state.activeTool==='copy'){const obj=hitObject(raw);if(!obj||obj.type==='space')return;state.selectedObjectId=obj.id;state.selectedObjectIds=new Set([obj.id]);state.selectedReferenceId=null;state.selectedRegionId=null;if(state.activeTool==='copy'){beginCopyDrag(e,raw,obj);}else beginObjectDrag(e,raw,obj,(obj.type==='door'||obj.type==='window')?'center':'body');renderPrimaryPanel();renderProperties();render();return;}
    if(state.activeTool==='delete'){const obj=hitObject(raw);if(obj)deleteObjectById(obj.id);return;}
    if(state.activeTool==='trim'||state.activeTool==='extend'){applyTrimExtendAtPoint(raw,state.activeTool);state.trimPreview=null;render();return;}
    if(state.activeTool==='line'||state.activeTool==='wall'){
      if(state.activeTool==='wall'&&state.toolset==='plan'&&state.toolSettings.wallType==='arc'){
        if(!state.drawStart){state.drawStart=p;state.previewEnd=p;state.arcDraft=null;updateContextBar();render();return;}
        if(!state.arcDraft){state.arcDraft={a:{...state.drawStart},b:{...constrainOrtho(state.drawStart,p)}};state.previewEnd=p;updateContextBar();render();return;}
        const g=circleFromThreePoints(state.arcDraft.a,state.arcDraft.b,p);if(g){pushHistory();const obj={id:uid('wall'),type:'wall',planRole:'boundary',layerId:'walls',a:{...state.arcDraft.a},b:{...state.arcDraft.b},thickness:currentWallThickness(),geometry:'arc',...g,attachments:{},floorId:state.activeFloorId};state.objects.push(obj);state.selectedObjectId=obj.id;state.selectedObjectIds=new Set([obj.id]);state.drawStart=null;state.drawReferenceAngle=null;state.arcDraft=null;state.previewEnd=null;markDirty(true);rebuildObjectSnapIndex();refreshSpaces();updateAll();}return;
      }
      if(!state.drawStart){
        if(state.toolset==='plan'&&state.activeTool==='line'){const ref=planDrawReferenceAt(raw,p);p=ref.point;state.drawReferenceAngle=ref.angle;}
        state.drawStart=p;state.previewEnd=p;updateContextBar();render();
      }else commitSegment(state.drawStart,constrainOrtho(state.drawStart,p),state.activeTool);return;
    }
    if(state.activeTool==='measure'){if(!state.measureStart){state.measureStart=p;state.previewEnd=p;updateContextBar();render();}else commitMeasurement(state.measureStart,constrainOrtho(state.measureStart,p));return;}
    if(state.activeTool==='space'&&state.toolset==='plan'){commitSpace(raw);return;}
    if(state.activeTool==='door'||state.activeTool==='window'){commitOpening(state.activeTool,nearestWallProjection(raw));return;}
  }
  function onPointerUp(e){if(isCompactViewer()&&state.viewerPointers.has(e.pointerId)){endViewerPointer(e);return;}if(state.regionDrag&&state.regionDrag.pointerId===e.pointerId){const drag=state.regionDrag;state.regionDrag=null;try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}const r=rectFromPoints(drag.start,drag.current);if((r.maxx-r.minx)>20&&(r.maxy-r.miny)>20){const name=prompt(t('region.namePrompt'),t('region.defaultName',{n:state.drawingRegions.length+1}));if(name!==null){pushHistory();const region={id:uid('region'),name:(name||t('region.defaultName',{n:state.drawingRegions.length+1})).trim(),...r};state.drawingRegions.push(region);state.selectedRegionId=region.id;markDirty(true);updateAll();}}setTool('select','select');return;}if(state.selectionDrag&&state.selectionDrag.pointerId===e.pointerId){const drag=state.selectionDrag,candidates=[...(drag.previewIds||new Set())];state.selectionDrag=null;try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}applySelectionSet(candidates,drag.mode);renderPrimaryPanel();renderProperties();render();return;}if(state.dragEdit){const drag=state.dragEdit,hadChange=drag.historyPushed,obj=state.objects.find(o=>o.id===drag.objectId);state.dragEdit=null;host.dataset.drag='false';try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}if(hadChange&&obj?.type==='wall'){syncDependentsOfWall(obj.id);refreshSpaces();}if(hadChange){rebuildObjectSnapIndex();updateAll();}return;}if(!state.pan)return;state.pan=null;host.dataset.pan='false';try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){} }
  function onWheel(e){e.preventDefault();const s=fromPointerEvent(e),before=screenCssToWorld(s),factor=Math.exp(-e.deltaY*.0014);state.camera.zoom=clamp(state.camera.zoom*factor,.002,8);const after=screenCssToWorld(s);state.camera.cx+=before.x-after.x;state.camera.cy+=before.y-after.y;render();}

  function deleteObjectById(id){const target=state.objects.find(o=>o.id===id);if(!target)return;pushHistory();const childIds=target.type==='wall'?new Set(state.objects.filter(o=>(o.type==='door'||o.type==='window'||o.type==='dimension')&&o.wallId===id).map(o=>o.id)):new Set();state.objects=state.objects.filter(o=>o.id!==id&&!childIds.has(o.id));if(target.type==='wall'){for(const wall of getPlanObjects().filter(o=>o.type==='wall')){for(const endpoint of['a','b'])if(wall.attachments?.[endpoint]?.wallId===id)delete wall.attachments[endpoint];const c=ensureWallConstraints(wall);if(c.reference?.wallId===id)c.reference=null;}if(state.baseAxisWallId===id){state.baseAxisWallId=null;state.baseAxisAngle=0;}refreshSpaces();}state.selectedObjectId=null;state.selectedObjectIds.delete(id);for(const childId of childIds)state.selectedObjectIds.delete(childId);markDirty(true);rebuildObjectSnapIndex();updateAll();}
  function deleteSelectedObjects(){const ids=selectionIds();if(!ids.size)return;pushHistory();const remove=new Set(ids);for(const id of ids){const target=state.objects.find(o=>o.id===id);if(target?.type==='wall')for(const o of state.objects)if((o.type==='door'||o.type==='window'||o.type==='dimension')&&o.wallId===id)remove.add(o.id);}state.objects=state.objects.filter(o=>!remove.has(o.id));for(const wall of getPlanObjects().filter(o=>o.type==='wall')){for(const endpoint of['a','b'])if(remove.has(wall.attachments?.[endpoint]?.wallId))delete wall.attachments[endpoint];const c=ensureWallConstraints(wall);if(remove.has(c.reference?.wallId))c.reference=null;}if(remove.has(state.baseAxisWallId)){state.baseAxisWallId=null;state.baseAxisAngle=0;}clearMultiSelection();refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();}

  function referenceBounds(ref,{main=false}={}){if(ref.type==='linkedCadRegion'){const r=state.drawingRegions.find(x=>x.id===ref.regionId);return r||{minx:0,miny:0,maxx:1000,maxy:1000};}if(ref.type==='image'){const a=referenceLocalToWorld(ref,{x:0,y:0}),b=referenceLocalToWorld(ref,{x:ref.width,y:ref.height});return{minx:Math.min(a.x,b.x),miny:Math.min(a.y,b.y),maxx:Math.max(a.x,b.x),maxy:Math.max(a.y,b.y)};}const b=(main&&ref.mainBounds)||ref.bounds,a=referenceLocalToWorld(ref,{x:b.minx,y:b.miny}),c=referenceLocalToWorld(ref,{x:b.maxx,y:b.maxy});return{minx:Math.min(a.x,c.x),miny:Math.min(a.y,c.y),maxx:Math.max(a.x,c.x),maxy:Math.max(a.y,c.y)};}
  function allBounds({full=false}={}){let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;const add=p=>{if(!p)return;minx=Math.min(minx,p.x);miny=Math.min(miny,p.y);maxx=Math.max(maxx,p.x);maxy=Math.max(maxy,p.y);};for(const r of state.references){const b=referenceBounds(r,{main:!full});add({x:b.minx,y:b.miny});add({x:b.maxx,y:b.maxy});}if(state.sourceDxfName&&state.objects.length&&state.sourceDxfMainBounds&&!full){const b=state.sourceDxfMainBounds;add({x:b.minx,y:b.miny});add({x:b.maxx,y:b.maxy});}else for(const o of state.objects){if(state.toolset==='plan'&&isSemanticObject(o)&&!objectOnActiveFloor(o))continue;if(o.a)add(o.a);if(o.b)add(o.b);if(o.center){add({x:o.center.x-o.radius,y:o.center.y-o.radius});add({x:o.center.x+o.radius,y:o.center.y+o.radius});}if(o.point)add(o.point);const g=(o.type==='door'||o.type==='window')?openingGeometry(o):null;if(g){add(g.p1);add(g.p2);}if(o.type==='dimension'){const d=dimensionGeometry(o);if(d){add(d.p1);add(d.p2);add(d.d1);add(d.d2);}}}return Number.isFinite(minx)?{minx,miny,maxx,maxy}:null;}
  function fitAll(){const b=allBounds({full:false});if(!b){state.camera={cx:0,cy:0,zoom:.12};render();return;}fitBounds(b);}
  function fitBounds(b){const{w,h}=cssCanvasSize(),bw=Math.max(100,b.maxx-b.minx),bh=Math.max(100,b.maxy-b.miny);state.camera.cx=(b.minx+b.maxx)/2;state.camera.cy=(b.miny+b.maxy)/2;state.camera.zoom=clamp(Math.min((w-90)/bw,(h-90)/bh),.002,8);render();}
  function fitReference(ref){fitBounds(referenceBounds(ref,{main:true}));}

  function fitReferenceFull(ref){fitBounds(referenceBounds(ref,{main:false}));}
  function fitFullExtents(){const b=allBounds({full:true});if(b)fitBounds(b);}
  function scaleBounds(b,factor){return b?{minx:b.minx*factor,miny:b.miny*factor,maxx:b.maxx*factor,maxy:b.maxy*factor}:null;}

  async function openReferenceFile(file){if(!file)return;const lower=file.name.toLowerCase();try{if(lower.endsWith('.dxf'))await addDxfReference(file);else if(file.type.startsWith('image/'))await addImageReference(file);else alert(t('alert.unsupportedReference'));}finally{dom.referenceFileInput.value='';}}
  async function addDxfReference(file){showProgress(t('progress.readingDxf'),0,file.name);const text=await file.text();const parsed=await window.PieniPlanDXF.parseAndAnalyze(text,p=>showProgress(p.stage||t('progress.readingDxf'),p.ratio||0,p.detail||''));const factor=unitFactorToMm(parsed.unit),entities=parsed.entities.map(e=>normalizeEntityToMm(e,factor)),b=boundsEntities(entities),main=scaleBounds(parsed.analysis?.mainBounds,factor);const ref={id:uid('ref'),type:'dxf',name:file.name,visible:true,opacity:.48,scale:1,origin:{x:0,y:0},entities,bounds:b,mainBounds:main||b,outlierCount:parsed.analysis?.outlierCount||0,sourceUnit:parsed.unit?.label||'unspecified',sourceUnitSpecified:parsed.unit?.metersPerUnit!=null,layers:parsed.layers||[],visibleLayers:new Set(parsed.layers||[]),pathsByLayer:buildDxfPaths(entities),textEntities:entities.filter(e=>e.type==='text'),snapIndex:buildSnapIndex(entities,b)};state.references.push(ref);state.selectedReferenceId=ref.id;markDirty(true);hideProgress();updateAll();switchInspector('reference');fitReference(ref);}
  async function addImageReference(file){const dataUrl=await readDataUrl(file),image=await loadImage(dataUrl);const ref={id:uid('ref'),type:'image',name:file.name,visible:true,opacity:.55,scale:1,origin:{x:0,y:0},image,width:image.naturalWidth,height:image.naturalHeight,sourceUnit:'px',dataUrl};state.references.push(ref);state.selectedReferenceId=ref.id;markDirty(true);updateAll();switchInspector('reference');fitReference(ref);}

  async function openEditableDxf(file){
    if(!file)return;
    try{
      if((state.dirty||state.objects.length||state.references.length)&&!confirm(t('confirm.newDrawing')))return;
      state.objects=[];state.references=[];state.drawingRegions=[];state.selectedRegionId=null;state.wallRecognitionPreview=null;state.recognitionHistory=[];state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectionDrag=null;state.selectedReferenceId=null;state.layerFilter='';state.layerRevealRequested=false;state.baseAxisAngle=0;state.baseAxisWallId=null;state.history=[];state.future=[];state.nextId=1;state.cadMapping=null;state.cadLayerVisibility=new Map([['0',true]]);state.activeCadLayer='0';state.projectFileName=null;state.projectFileHandle=null;
      showProgress(t('progress.importingDxf'),0,file.name);
      const text=await file.text();
      const parsed=await window.PieniPlanDXF.parseAndAnalyze(text,p=>showProgress(p.stage||t('progress.importingDxf'),p.ratio||0,p.detail||''));
      const factor=unitFactorToMm(parsed.unit),entities=parsed.entities.map(e=>normalizeEntityToMm(e,factor)),editable=[];
      for(const e of entities){
        const layer=e.layer||'0';state.cadLayerVisibility.set(layer,true);
        if(e.type==='line')editable.push({id:uid('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.x1,y:e.y1},b:{x:e.x2,y:e.y2},source:'DXF'});
        else if(e.type==='polyline'&&e.points?.length>1){for(let i=1;i<e.points.length;i++)editable.push({id:uid('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.points[i-1][0],y:e.points[i-1][1]},b:{x:e.points[i][0],y:e.points[i][1]},source:'DXF'});if(e.closed)editable.push({id:uid('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.points.at(-1)[0],y:e.points.at(-1)[1]},b:{x:e.points[0][0],y:e.points[0][1]},source:'DXF'});}
        else if(e.type==='circle')editable.push({id:uid('cadCircle'),type:'cadCircle',cadLayer:layer,center:{x:e.cx,y:e.cy},radius:e.r,source:'DXF'});
        else if(e.type==='arc')editable.push({id:uid('cadArc'),type:'cadArc',cadLayer:layer,center:{x:e.cx,y:e.cy},radius:e.r,startAngle:e.startAngle||0,sweep:e.sweep||0,sourceType:e.sourceType||'ARC',source:'DXF'});
        else if(e.type==='text')editable.push({id:uid('cadText'),type:'cadText',cadLayer:layer,point:{x:e.x,y:e.y},text:e.text||'',height:e.height||180,rotation:e.rotation||0,sourceType:e.sourceType||'TEXT',source:'DXF'});
      }
      if(!editable.some(o=>o.type==='cadLine'||o.type==='cadCircle'||o.type==='cadArc'))alert(t('alert.dxfNoEditableEntities'));
      state.objects=editable;state.projectFileName=null;state.projectFileHandle=null;state.sourceDxfName=file.name;state.sourceDxfFingerprint=await sha256Hex(text);state.sourceDxfSize=file.size||text.length;state.sourceDxfLastModified=file.lastModified||0;state.sourceDxfFullBounds=boundsEntities(entities);state.sourceDxfMainBounds=scaleBounds(parsed.analysis?.mainBounds,factor)||state.sourceDxfFullBounds;state.sourceDxfOutlierCount=parsed.analysis?.outlierCount||0;state.activeCadLayer=(parsed.layers||[])[0]||'0';state.dirty=false;rebuildObjectSnapIndex();hideProgress();switchToolset('cad',{skipMapping:true});updateAll();fitAll();
    }catch(err){hideProgress();console.error(err);alert(err.message||String(err));}
    finally{dom.dxfEditFileInput.value='';}
  }

  function normalizeEntityToMm(e,factor){const out={...e};if(e.type==='line'){out.x1=e.x1*factor;out.y1=e.y1*factor;out.x2=e.x2*factor;out.y2=e.y2*factor;}else if(e.type==='polyline')out.points=(e.points||[]).map(p=>[p[0]*factor,p[1]*factor]);else if(e.type==='circle'||e.type==='arc'){out.cx=e.cx*factor;out.cy=e.cy*factor;out.r=e.r*factor;}else if(e.type==='text'){out.x=e.x*factor;out.y=e.y*factor;out.height=(e.height||180)*factor;}return out;}
  function buildDxfPaths(entities){const paths=new Map(),get=layer=>{const key=layer||'0';if(!paths.has(key))paths.set(key,new Path2D());return paths.get(key);};for(const e of entities){const path=get(e.layer);if(e.type==='line'){path.moveTo(e.x1,e.y1);path.lineTo(e.x2,e.y2);}else if(e.type==='polyline'&&e.points?.length){path.moveTo(e.points[0][0],e.points[0][1]);for(let i=1;i<e.points.length;i++)path.lineTo(e.points[i][0],e.points[i][1]);if(e.closed)path.closePath();}else if(e.type==='circle'&&e.r>0){path.moveTo(e.cx+e.r,e.cy);path.arc(e.cx,e.cy,e.r,0,Math.PI*2);}else if(e.type==='arc'&&e.r>0){const a0=rad(e.startAngle||0),a1=rad((e.startAngle||0)+(e.sweep||0));path.moveTo(e.cx+Math.cos(a0)*e.r,e.cy+Math.sin(a0)*e.r);path.arc(e.cx,e.cy,e.r,a0,a1,(e.sweep||0)<0);}}return paths;}
  function buildSegmentSnapIndex(segments){
    const cellW=1000,cellH=1000,cells=new Map(),segmentCells=new Map(),clean=[];
    const addPoint=(p,layer='0',kind='endpoint')=>{if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y))return;const gx=Math.floor(p.x/cellW),gy=Math.floor(p.y/cellH),key=`${gx},${gy}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push({x:p.x,y:p.y,layer,kind});};
    const addSeg=seg=>{if(!seg?.a||!seg?.b||distance(seg.a,seg.b)<1e-9)return;const item={...seg,index:clean.length};clean.push(item);addPoint(item.a,item.layer,'endpoint');addPoint(item.b,item.layer,'endpoint');addPoint({x:(item.a.x+item.b.x)/2,y:(item.a.y+item.b.y)/2},item.layer,'midpoint');const minx=Math.min(item.a.x,item.b.x),maxx=Math.max(item.a.x,item.b.x),miny=Math.min(item.a.y,item.b.y),maxy=Math.max(item.a.y,item.b.y);for(let gx=Math.floor(minx/cellW);gx<=Math.floor(maxx/cellW);gx++)for(let gy=Math.floor(miny/cellH);gy<=Math.floor(maxy/cellH);gy++){const key=`${gx},${gy}`;if(!segmentCells.has(key))segmentCells.set(key,[]);segmentCells.get(key).push(item);}};
    for(const seg of segments||[])addSeg(seg);return{minx:0,miny:0,cellW,cellH,cells,segmentCells,segments:clean};
  }
  function buildSnapIndex(entities,bounds){
    const segments=[],extra=[];let seq=0;const seg=(a,b,layer='0')=>segments.push({a,b,layer,id:`s${++seq}`});
    for(const e of entities){const layer=e.layer||'0';if(e.type==='line')seg({x:e.x1,y:e.y1},{x:e.x2,y:e.y2},layer);else if(e.type==='polyline'){const pts=e.points||[];for(let i=1;i<pts.length;i++)seg({x:pts[i-1][0],y:pts[i-1][1]},{x:pts[i][0],y:pts[i][1]},layer);}else if(e.type==='circle'){extra.push({x:e.cx-e.r,y:e.cy,layer,kind:'quadrant'},{x:e.cx+e.r,y:e.cy,layer,kind:'quadrant'},{x:e.cx,y:e.cy-e.r,layer,kind:'quadrant'},{x:e.cx,y:e.cy+e.r,layer,kind:'quadrant'});}else if(e.type==='arc'){const a0=rad(e.startAngle||0),a1=rad((e.startAngle||0)+(e.sweep||0));extra.push({x:e.cx+Math.cos(a0)*e.r,y:e.cy+Math.sin(a0)*e.r,layer,kind:'endpoint'},{x:e.cx+Math.cos(a1)*e.r,y:e.cy+Math.sin(a1)*e.r,layer,kind:'endpoint'});}}
    const idx=buildSegmentSnapIndex(segments);for(const q of extra){const gx=Math.floor(q.x/idx.cellW),gy=Math.floor(q.y/idx.cellH),key=`${gx},${gy}`;if(!idx.cells.has(key))idx.cells.set(key,[]);idx.cells.get(key).push(q);}return idx;
  }
  function queryReferenceSnapIndex(idx,p,threshold,visibleLayer,test){
    if(!idx)return;const gx=Math.floor(p.x/idx.cellW),gy=Math.floor(p.y/idx.cellH),rx=Math.max(1,Math.ceil(threshold/idx.cellW)),ry=Math.max(1,Math.ceil(threshold/idx.cellH)),segments=new Map();
    for(let dx=-rx;dx<=rx;dx++)for(let dy=-ry;dy<=ry;dy++){const key=`${gx+dx},${gy+dy}`;for(const q of idx.cells.get(key)||[]){if(visibleLayer&&!visibleLayer(q.layer||'0'))continue;if(distance(p,q)<=threshold)test(q,q.kind||'endpoint');}for(const seg of idx.segmentCells?.get(key)||[]){if(visibleLayer&&!visibleLayer(seg.layer||'0'))continue;segments.set(seg.index,seg);}}
    const list=[...segments.values()];for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const x=segmentIntersection(list[i].a,list[i].b,list[j].a,list[j].b);if(x&&distance(p,x.point)<=threshold)test({...x.point,layer:list[i].layer},'intersection');}
  }
  function boundsEntities(entities){let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;const add=(x,y)=>{if(Number.isFinite(x)&&Number.isFinite(y)){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);}};for(const e of entities){if(e.type==='line'){add(e.x1,e.y1);add(e.x2,e.y2);}else if(e.type==='polyline')for(const p of e.points||[])add(p[0],p[1]);else if(e.type==='circle'||e.type==='arc'){add(e.cx-e.r,e.cy-e.r);add(e.cx+e.r,e.cy+e.r);}else if(e.type==='text')add(e.x,e.y);}return Number.isFinite(minx)?{minx,miny,maxx,maxy}:{minx:0,miny:0,maxx:1000,maxy:1000};}
  function readDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});}
  function loadImage(src){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=rej;img.src=src;});}


  async function sha256Hex(text){
    try{const bytes=new TextEncoder().encode(text),hash=await crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');}catch(_){return null;}
  }
  function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
  function normalizeDxfFilename(name){let clean=sanitizeFilename(String(name||'PieniPlan').trim());if(!/\.dxf$/i.test(clean))clean+=`.dxf`;return clean;}
  function dxfFilePickerTypes(){return[{description:'DXF Drawing',accept:{'application/dxf':['.dxf'],'text/plain':['.dxf']}}];}
  async function writeDxfToHandle(handle,blob,name){const writable=await handle.createWritable();await writable.write(blob);await writable.close();const savedName=handle.name||name;setCommandStatus(t('exportDxf.saved',{name:savedName}),'strong');return savedName;}
  function closeDxfFallbackSaveDialog(){if(dom.exportSaveBackdrop)dom.exportSaveBackdrop.hidden=true;state.pendingDxfExport=null;}
  function openDxfFallbackSaveDialog(blob,name){state.pendingDxfExport={blob,name:normalizeDxfFilename(name)};if(!dom.exportSaveBackdrop){downloadBlob(blob,state.pendingDxfExport.name);setCommandStatus(t('exportDxf.downloadedFallback',{name:state.pendingDxfExport.name}),'strong');state.pendingDxfExport=null;return;}dom.exportSaveName.value=state.pendingDxfExport.name;dom.exportSaveBackdrop.hidden=false;setTimeout(()=>{dom.exportSaveName.focus();dom.exportSaveName.select();},0);}
  function applyDxfFallbackSave(){const pending=state.pendingDxfExport;if(!pending)return closeDxfFallbackSaveDialog();const name=normalizeDxfFilename(dom.exportSaveName?.value||pending.name);downloadBlob(pending.blob,name);closeDxfFallbackSaveDialog();setCommandStatus(t('exportDxf.downloadedFallback',{name}),'strong');}
  async function saveDxfBlob(blob,name){const suggested=normalizeDxfFilename(name);if(typeof window.showSaveFilePicker==='function'){try{const handle=await window.showSaveFilePicker({suggestedName:suggested,types:dxfFilePickerTypes(),excludeAcceptAllOption:false});if(!handle)return false;await writeDxfToHandle(handle,blob,suggested);return true;}catch(err){if(err?.name==='AbortError')return false;console.warn('DXF Save As picker unavailable; using browser download fallback.',err);}}openDxfFallbackSaveDialog(blob,suggested);return null;}
  function serializeReference(ref){
    const base={id:ref.id,type:ref.type,name:ref.name,visible:ref.visible!==false,opacity:Number(ref.opacity??.5),scale:Number(ref.scale??1),origin:ref.origin?{...ref.origin}:{x:0,y:0},sourceUnit:ref.sourceUnit||null};
    if(ref.type==='image')return{...base,width:ref.width,height:ref.height,dataUrl:ref.dataUrl||null};
    if(ref.type==='dxf')return{...base,entities:ref.entities||[],bounds:ref.bounds||null,mainBounds:ref.mainBounds||null,outlierCount:ref.outlierCount||0,sourceUnitSpecified:Boolean(ref.sourceUnitSpecified),layers:ref.layers||[],visibleLayers:[...(ref.visibleLayers||[]) ]};
    if(ref.type==='linkedCadRegion')return{...base,regionId:ref.regionId,layers:ref.layers||[],visibleLayers:[...(ref.visibleLayers||[]) ]};
    return base;
  }
  async function hydrateReference(raw){
    const ref={...raw,origin:raw.origin?{...raw.origin}:{x:0,y:0}};
    if(ref.type==='image'){
      if(!ref.dataUrl)return null;
      try{ref.image=await loadImage(ref.dataUrl);ref.width=ref.width||ref.image.naturalWidth;ref.height=ref.height||ref.image.naturalHeight;}catch(_){return null;}
    }else if(ref.type==='dxf'){
      ref.entities=Array.isArray(ref.entities)?ref.entities:[];ref.layers=Array.isArray(ref.layers)?ref.layers:[];ref.visibleLayers=new Set(Array.isArray(raw.visibleLayers)?raw.visibleLayers:ref.layers);ref.pathsByLayer=buildDxfPaths(ref.entities);ref.textEntities=ref.entities.filter(e=>e.type==='text');ref.bounds=ref.bounds||boundsEntities(ref.entities);ref.mainBounds=ref.mainBounds||ref.bounds;ref.snapIndex=buildSnapIndex(ref.entities,ref.bounds);
    }else if(ref.type==='linkedCadRegion'){
      ref.layers=Array.isArray(ref.layers)?ref.layers:[];ref.visibleLayers=new Set(Array.isArray(raw.visibleLayers)?raw.visibleLayers:ref.layers);
    }
    return ref;
  }
  function makeProjectPayload(){
    return{
      format:'PieniPlan',schemaVersion:2,app:{version:VERSION,build:BUILD},savedAt:new Date().toISOString(),
      sourceDxf:{name:state.sourceDxfName||null,fingerprint:state.sourceDxfFingerprint||null,size:state.sourceDxfSize||0,lastModified:state.sourceDxfLastModified||0,mainBounds:state.sourceDxfMainBounds||null,fullBounds:state.sourceDxfFullBounds||null,outlierCount:state.sourceDxfOutlierCount||0},
      drawing:{objects:state.objects,drawingRegions:state.drawingRegions,references:state.references.map(serializeReference),cadLayerVisibility:[...state.cadLayerVisibility],activeCadLayer:state.activeCadLayer,cadMapping:state.cadMapping,baseAxisAngle:state.baseAxisAngle,baseAxisWallId:state.baseAxisWallId,camera:state.camera,toolset:state.toolset,toolSettings:state.toolSettings,planLayerVisibility:planLayers.map(l=>[l.id,l.visible!==false]),recognitionHistory:state.recognitionHistory,floors:state.floors,activeFloorId:state.activeFloorId,nextId:state.nextId}
    };
  }
  function projectBaseName(){const raw=state.sourceDxfName||state.projectFileName||'PieniPlan';return sanitizeFilename(String(raw).replace(/\.(dxf|pieniplan)$/i,''));}
  function projectFilePickerTypes(){return[{description:'PieniPlan Project',accept:{'application/json':['.pieniplan']}}];}
  function readBrowserSavedMeta(){try{const raw=localStorage.getItem(LOCAL_PROJECT_META_KEY);return raw?JSON.parse(raw):null;}catch(_){return null;}}
  function writeBrowserSavedMeta(meta){state.browserSavedMeta=meta||null;try{if(meta)localStorage.setItem(LOCAL_PROJECT_META_KEY,JSON.stringify(meta));else localStorage.removeItem(LOCAL_PROJECT_META_KEY);}catch(_){}updateContinueCard();}
  function openLocalProjectDb(){return new Promise((resolve,reject)=>{if(!('indexedDB' in window))return reject(new Error('IndexedDB unavailable'));const req=indexedDB.open(LOCAL_PROJECT_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(LOCAL_PROJECT_STORE))db.createObjectStore(LOCAL_PROJECT_STORE,{keyPath:'key'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB open failed'));});}
  async function saveProjectToBrowserStore(json,name){const db=await openLocalProjectDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction(LOCAL_PROJECT_STORE,'readwrite');tx.objectStore(LOCAL_PROJECT_STORE).put({key:LOCAL_PROJECT_KEY,name,json,savedAt:new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('IndexedDB write failed'));tx.onabort=()=>reject(tx.error||new Error('IndexedDB write aborted'));});}finally{db.close();}state.projectFileHandle=null;state.projectLocalKey=LOCAL_PROJECT_KEY;state.projectFileName=name;const meta={name,savedAt:new Date().toISOString()};writeBrowserSavedMeta(meta);markDirty(false);setCommandStatus(t('project.savedLocal',{name}),'strong');}
  async function readBrowserStoredProject(){const db=await openLocalProjectDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(LOCAL_PROJECT_STORE,'readonly'),req=tx.objectStore(LOCAL_PROJECT_STORE).get(LOCAL_PROJECT_KEY);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error||new Error('IndexedDB read failed'));});}finally{db.close();}}
  async function writeProjectToHandle(handle,json,name){const writable=await handle.createWritable();await writable.write(json);await writable.close();state.projectFileHandle=handle;state.projectLocalKey=null;state.projectFileName=handle.name||name;markDirty(false);setCommandStatus(t('project.saved',{name:state.projectFileName}),'strong');}
  async function saveProjectFile({saveAs=false}={}){
    try{
      const payload=makeProjectPayload(),json=JSON.stringify(payload,null,2),name=`${projectBaseName()}.pieniplan`;
      if(!saveAs&&state.projectFileHandle?.createWritable){await writeProjectToHandle(state.projectFileHandle,json,name);return;}
      if(!saveAs&&state.projectLocalKey){await saveProjectToBrowserStore(json,state.projectFileName||name);return;}
      if(typeof window.showSaveFilePicker==='function'){
        const handle=await window.showSaveFilePicker({suggestedName:name,types:projectFilePickerTypes(),excludeAcceptAllOption:false});await writeProjectToHandle(handle,json,name);return;
      }
      await saveProjectToBrowserStore(json,name);
    }catch(err){if(err?.name==='AbortError')return;console.error(err);alert(t('project.saveFailed',{message:String(err?.message||err)}));}
  }
  function downloadProjectFile(){try{const payload=makeProjectPayload(),json=JSON.stringify(payload,null,2),name=`${projectBaseName()}.pieniplan`;downloadBlob(new Blob([json],{type:'application/json;charset=utf-8'}),name);setCommandStatus(t('project.downloaded',{name}),'strong');}catch(err){console.error(err);alert(t('project.saveFailed',{message:String(err?.message||err)}));}}
  async function chooseAndOpenProjectFile(){
    if(typeof window.showOpenFilePicker==='function'){
      try{const [handle]=await window.showOpenFilePicker({types:projectFilePickerTypes(),multiple:false,excludeAcceptAllOption:false});if(!handle)return;const file=await handle.getFile();await openProjectFile(file,{handle});return;}catch(err){if(err?.name==='AbortError')return;console.warn('File System Access open failed; falling back to file input.',err);}
    }
    dom.projectFileInput.click();
  }
  async function openBrowserSavedProject(){try{const record=await readBrowserStoredProject();if(!record?.json)throw new Error('No browser-saved project');const file=new File([record.json],record.name||'PieniPlan.pieniplan',{type:'application/json'});await openProjectFile(file,{localKey:LOCAL_PROJECT_KEY,skipConfirm:true,restoredLocal:true});}catch(err){console.error(err);writeBrowserSavedMeta(null);alert(t('project.openFailed',{message:String(err?.message||err)}));}}
  async function openProjectFile(file,{handle=null,localKey=null,skipConfirm=false,restoredLocal=false}={}){
    if(!file)return;
    try{
      if(!skipConfirm&&(state.dirty||state.objects.length||state.references.length)&&!confirm(t('confirm.openProject')))return;
      const raw=JSON.parse(await file.text());if(raw?.format!=='PieniPlan'||!raw.drawing)throw new Error(t('project.invalid'));
      const d=raw.drawing,refs=[];for(const rr of d.references||[]){const ref=await hydrateReference(rr);if(ref)refs.push(ref);}
      state.objects=Array.isArray(d.objects)?d.objects:[];state.drawingRegions=Array.isArray(d.drawingRegions)?d.drawingRegions:[];state.references=refs;state.cadLayerVisibility=new Map(Array.isArray(d.cadLayerVisibility)?d.cadLayerVisibility:[['0',true]]);state.activeCadLayer=d.activeCadLayer||'0';state.cadMapping=d.cadMapping||null;state.baseAxisAngle=Number(d.baseAxisAngle)||0;state.baseAxisWallId=d.baseAxisWallId||null;state.camera=d.camera&&Number.isFinite(d.camera.zoom)?{...d.camera}:{cx:0,cy:0,zoom:.12};state.toolSettings={...state.toolSettings,...(d.toolSettings||{})};state.recognitionHistory=Array.isArray(d.recognitionHistory)?d.recognitionHistory:[];state.floors=Array.isArray(d.floors)&&d.floors.length?d.floors:[{id:'floor_1',name:'1F',sourceRegionId:null}];state.activeFloorId=d.activeFloorId||state.floors[0].id;ensureFloorModel();const legacyEdgeChanged=migrateLegacyPlanLinesToEdges();repairDefaultFloorNamesFromRegions();const floorIsolationChanged=repairFloorRegionIsolation();let junctionRepairChanged=false;for(const floor of state.floors)junctionRepairChanged=repairPersistentPlanJunctions(floor.id)||junctionRepairChanged;state.nextId=Math.max(Number(d.nextId)||1,state.objects.length+state.references.length+state.drawingRegions.length+1);
      if(Array.isArray(d.planLayerVisibility)){const vis=new Map(d.planLayerVisibility);for(const l of planLayers)l.visible=vis.get(l.id)!==false;}
      const src=raw.sourceDxf||{};state.sourceDxfName=src.name||null;state.sourceDxfFingerprint=src.fingerprint||null;state.sourceDxfSize=Number(src.size)||0;state.sourceDxfLastModified=Number(src.lastModified)||0;state.sourceDxfMainBounds=src.mainBounds||null;state.sourceDxfFullBounds=src.fullBounds||null;state.sourceDxfOutlierCount=Number(src.outlierCount)||0;state.projectFileName=file.name;state.projectFileHandle=handle;state.projectLocalKey=localKey;
      state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectedReferenceId=null;state.selectedRegionId=null;state.wallRecognitionPreview=null;state.history=[];state.future=[];state.layerFilter='';state.layerRevealRequested=false;state.dirty=Boolean(floorIsolationChanged||legacyEdgeChanged||junctionRepairChanged);rebuildObjectSnapIndex();refreshSpaces();switchToolset(d.toolset==='cad'?'cad':'plan',{skipMapping:true});updateAll();setCommandStatus(restoredLocal?t('project.restoredLocal',{name:file.name}):t('project.opened',{name:file.name}),'strong');
    }catch(err){console.error(err);alert(t('project.openFailed',{message:String(err?.message||err)}));}
  }
  function showProgress(title,ratio,detail){dom.progressToast.hidden=false;dom.progressTitle.textContent=title;dom.progressBar.style.width=`${clamp(ratio,0,1)*100}%`;dom.progressDetail.textContent=detail;}
  function hideProgress(){dom.progressToast.hidden=true;}

  function beginCalibration(refId){const ref=state.references.find(r=>r.id===refId);if(!ref)return;state.selectedReferenceId=refId;state.calibration={refId,p1:null,p2:null};state.drawStart=null;state.drawReferenceAngle=null;state.measureStart=null;state.previewEnd=null;updateContextBar();render();}
  function openCalibrationDialog(){const c=state.calibration;if(!c?.p1||!c?.p2)return;const measured=distance(c.p1,c.p2);dom.dialogTitle.textContent=t('dialog.calibrate');dom.dialogCopy.textContent=t('dialog.calibrationCopy',{distance:formatNumber(measured,2)});dom.dialogInput.value=String(Math.round(measured*100)/100);dom.dialogBackdrop.hidden=false;setTimeout(()=>{dom.dialogInput.focus();dom.dialogInput.select();},0);}
  function applyCalibration(){const actual=Number(dom.dialogInput.value),c=state.calibration;if(!c||!Number.isFinite(actual)||actual<=0)return;const ref=state.references.find(r=>r.id===c.refId);if(!ref)return;const current=distance(c.p1,c.p2);if(current<=0)return;const localAnchor=referenceWorldToLocal(ref,c.p1),newScale=ref.scale*(actual/current);ref.scale=newScale;ref.origin={x:c.p1.x-localAnchor.x*newScale,y:c.p1.y-localAnchor.y*newScale};state.calibration=null;dom.dialogBackdrop.hidden=true;state.previewEnd=null;markDirty(true);updateAll();}

  function visibleCadLayers(region=null){const layers=new Set();for(const o of state.objects){if(!(isCadObject(o)||o.type==='line'))continue;const layer=o.cadLayer||'0';if(!cadLayerVisible(layer))continue;if(region&&!objectTouchesRegion(o,region))continue;layers.add(layer);}return layers;}
  function regionObjectCount(region){return state.objects.filter(o=>(isCadObject(o)||o.type==='line')&&cadLayerVisible(o.cadLayer||'0')&&objectTouchesRegion(o,region)).length;}
  function normalizeFullWidthAscii(value){return String(value||'').replace(/[！-～]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0xFEE0)).replace(/　/g,' ');}
  function suggestedFloorNameFromRegion(region){const compact=normalizeFullWidthAscii(region?.name||'').trim().replace(/\s+/g,'');if(!compact)return null;let m=compact.match(/^B(\d+)F?$/i);if(m)return`B${Number(m[1])}F`;m=compact.match(/^(\d+)F$/i);if(m)return`${Number(m[1])}F`;m=compact.match(/^지하(\d+)층$/);if(m)return`B${Number(m[1])}F`;m=compact.match(/^(\d+)층$/);if(m)return`${Number(m[1])}F`;return null;}
  function maybeAdoptFloorNameFromRegion(floor,region){if(!floor||floor.sourceRegionId)return;const suggested=suggestedFloorNameFromRegion(region);if(!suggested||!/^\d+F$/i.test(String(floor.name||'')))return;const used=new Set(state.floors.filter(f=>f.id!==floor.id).map(f=>String(f.name||'').toUpperCase()));if(!used.has(suggested.toUpperCase()))floor.name=suggested;}

  function repairDefaultFloorNamesFromRegions(){
    if(state.floors.length!==1)return;const floor=state.floors[0];if(String(floor.name||'').toUpperCase()!=='1F'||!floor.sourceRegionId)return;const region=state.drawingRegions.find(r=>r.id===floor.sourceRegionId),suggested=suggestedFloorNameFromRegion(region);if(suggested&&suggested!=='1F')floor.name=suggested;
  }

  function uniqueFloorName(base='Floor'){
    const used=new Set(state.floors.map(f=>String(f.name||'').toUpperCase()));let name=base||'Floor';if(!used.has(String(name).toUpperCase()))return name;let n=2;while(used.has(`${name} ${n}`.toUpperCase()))n++;return `${name} ${n}`;
  }
  function floorHasPlanObjects(floorId){return state.objects.some(o=>o.floorId===floorId&&(isSemanticObject(o)||o.type==='line'));}
  function ensureFloorForRegion(region,{preferActiveUnbound=true}={}){
    ensureFloorModel();if(!region)return activeFloor();let floor=state.floors.find(f=>f.sourceRegionId===region.id);if(floor){state.activeFloorId=floor.id;return floor;}
    const suggested=suggestedFloorNameFromRegion(region);
    if(suggested){const byName=state.floors.find(f=>String(f.name||'').toUpperCase()===suggested.toUpperCase()&&(!f.sourceRegionId||f.sourceRegionId===region.id));if(byName){byName.sourceRegionId=region.id;state.activeFloorId=byName.id;return byName;}}
    const current=activeFloor();if(preferActiveUnbound&&current&&!current.sourceRegionId&&!floorHasPlanObjects(current.id)){maybeAdoptFloorNameFromRegion(current,region);current.sourceRegionId=region.id;state.activeFloorId=current.id;return current;}
    const name=uniqueFloorName(suggested||region.name||`${state.floors.length+1}F`),created={id:`floor_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name,sourceRegionId:region.id};state.floors.push(created);state.activeFloorId=created.id;return created;
  }
  function repairFloorRegionIsolation(){
    ensureFloorModel();const recognized=state.objects.filter(o=>isSemanticObject(o)&&o.recognizedFromCad&&o.sourceRegionId);if(!recognized.length)return false;let changed=false;const regionIds=[...new Set(recognized.map(o=>o.sourceRegionId))];
    // Prefer explicit floor-name ↔ region-name matches before trusting a stale sourceRegionId.
    for(const regionId of regionIds){const region=state.drawingRegions.find(r=>r.id===regionId),suggested=suggestedFloorNameFromRegion(region);if(!suggested)continue;const byName=state.floors.find(f=>String(f.name||'').toUpperCase()===suggested.toUpperCase());if(byName&&byName.sourceRegionId!==regionId){byName.sourceRegionId=regionId;changed=true;}}
    for(const regionId of regionIds){const region=state.drawingRegions.find(r=>r.id===regionId);if(!region)continue;const suggested=suggestedFloorNameFromRegion(region);let floor=state.floors.find(f=>f.sourceRegionId===regionId);
      if(!floor&&suggested)floor=state.floors.find(f=>String(f.name||'').toUpperCase()===suggested.toUpperCase());
      if(!floor){floor={id:`floor_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name:uniqueFloorName(suggested||region.name||'Floor'),sourceRegionId:regionId};state.floors.push(floor);changed=true;}
      if(floor.sourceRegionId!==regionId){floor.sourceRegionId=regionId;changed=true;}
      for(const o of recognized){if(o.sourceRegionId===regionId&&o.floorId!==floor.id){o.floorId=floor.id;changed=true;}}
    }
    return changed;
  }

  function openRegionInPlan(region){let ref=state.references.find(r=>r.type==='linkedCadRegion'&&r.regionId===region.id);if(!ref){const layers=visibleCadLayers(region);ref={id:uid('ref'),type:'linkedCadRegion',regionId:region.id,name:`${region.name} · CAD`,visible:true,opacity:.48,layers:[...layers],visibleLayers:new Set(layers)};state.references.push(ref);}else ref.visible=true;const floor=ensureFloorForRegion(region);state.activeFloorId=floor.id;state.selectedReferenceId=ref.id;markDirty(true);switchToolset('plan',{skipMapping:true});switchInspector('primary');fitBounds(region);updateAll();}
  async function exportRegionDxf(region){const visible=visibleCadLayers();let entities='',layers=new Set(['0']);for(const o of state.objects){if(!(isCadObject(o)||o.type==='line')||!objectTouchesRegion(o,region))continue;const layer=o.cadLayer||'0';if(!visible.has(layer))continue;layers.add(layer);if(o.type==='cadLine'||o.type==='line'){const clipped=clipLineToRect(o.a,o.b,region);if(clipped)entities+=dxfLine(layer,clipped[0],clipped[1]);}else if(o.type==='cadCircle')entities+=dxfCircle(layer,o.center,o.radius);else if(o.type==='cadArc')entities+=dxfArc(layer,o.center,o.radius,o.startAngle||0,(o.startAngle||0)+(o.sweep||0));else if(o.type==='cadText'&&pointInRect(o.point,region))entities+=dxfText(layer,o.point,o.text||'',o.height||180,o.rotation||0);}let layerTable=dxfPair(0,'TABLE')+dxfPair(2,'LAYER')+dxfPair(70,layers.size);for(const name of layers)layerTable+=dxfPair(0,'LAYER')+dxfPair(2,sanitizeLayer(name))+dxfPair(70,0)+dxfPair(62,7)+dxfPair(6,'CONTINUOUS');layerTable+=dxfPair(0,'ENDTAB');const dxf=dxfPair(0,'SECTION')+dxfPair(2,'HEADER')+dxfPair(9,'$ACADVER')+dxfPair(1,'AC1009')+dxfPair(9,'$INSUNITS')+dxfPair(70,4)+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'TABLES')+layerTable+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'ENTITIES')+entities+dxfPair(0,'ENDSEC')+dxfPair(0,'EOF');const blob=new Blob([dxf],{type:'application/dxf;charset=utf-8'});await saveDxfBlob(blob,`${sanitizeFilename(region.name||'region')}_PieniPlan.dxf`);}
  function downloadTextFile(text,filename,type='text/plain;charset=utf-8'){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function sanitizeFilename(name){return String(name||'PieniPlan').replace(/[\/:*?"<>|]+/g,'_').trim()||'PieniPlan';}
  function deleteRegion(regionId){pushHistory();state.drawingRegions=state.drawingRegions.filter(r=>r.id!==regionId);state.references=state.references.filter(r=>!(r.type==='linkedCadRegion'&&r.regionId===regionId));if(state.selectedRegionId===regionId)state.selectedRegionId=null;markDirty(true);updateAll();}


  function renameRegion(region){
    if(!region)return;
    const next=prompt(t('region.renamePrompt'),region.name||t('region.unnamed'));
    if(next===null)return;
    const name=String(next).trim();
    if(!name||name===region.name)return;
    pushHistory();
    region.name=name;
    markDirty(true);
    renderPrimaryPanel();
    renderReferences();
    render();
  }

  function positionContextMenuAtElement(button){
    contextMenu.hidden=false;
    contextMenu.style.left='0px';
    contextMenu.style.top='0px';
    const anchor=button.getBoundingClientRect();
    const rect=contextMenu.getBoundingClientRect();
    const margin=8;
    const left=Math.max(margin,Math.min(window.innerWidth-rect.width-margin,anchor.right-rect.width));
    const top=Math.max(margin,Math.min(window.innerHeight-rect.height-margin,anchor.bottom+5));
    contextMenu.style.left=`${Math.round(left)}px`;
    contextMenu.style.top=`${Math.round(top)}px`;
  }

  function showRegionActionMenu(region,button){
    hideContextMenu();
    addContextMenuItem(t('action.fit'),()=>{state.selectedRegionId=region.id;fitBounds(region);renderPrimaryPanel();render();});
    addContextMenuItem(t('action.rename'),()=>renameRegion(region));
    addContextMenuDivider();
    addContextMenuItem(t('action.openInPlanReference'),()=>openRegionInPlan(region));
    addContextMenuItem(t('action.openInPlanRecognizeWalls'),()=>beginWallRecognition(region));
    addContextMenuItem(t('action.exportRegionDxf'),()=>exportRegionDxf(region));
    addContextMenuDivider();
    addContextMenuItem(t('action.delete'),()=>deleteRegion(region.id),{danger:true});
    positionContextMenuAtElement(button);
  }

  function wallRecognitionSourceLines(region){
    const result=[];for(const o of state.objects){if(!(o.type==='cadLine'||o.type==='line'))continue;const layer=o.cadLayer||'0';if(!cadLayerVisible(layer))continue;const clipped=clipLineToRect(o.a,o.b,region);if(!clipped)continue;const len=distance(clipped[0],clipped[1]);if(len<120)continue;let angle=angleDeg(clipped[0],clipped[1])%180;if(angle<0)angle+=180;result.push({id:o.id,layer,a:clipped[0],b:clipped[1],length:len,angle});}return result;
  }
  function wallRecognitionSourceArcs(region){
    const result=[];for(const o of state.objects){if(o.type!=='cadArc')continue;const layer=o.cadLayer||'0';if(!cadLayerVisible(layer)||!objectTouchesRegion(o,region))continue;const r=Number(o.radius)||0,sweep=Number(o.sweep)||0;if(r<120||Math.abs(sweep)<6)continue;result.push({id:o.id,layer,center:{...o.center},radius:r,startAngle:Number(o.startAngle)||0,sweep,sourceType:o.sourceType||'ARC'});}return result;
  }

  function angleDiff180(a,b){let d=Math.abs(a-b)%180;if(d>90)d=180-d;return d;}

  function pairWallCandidate(a,b){
    if(angleDiff180(a.angle,b.angle)>2.4)return null;const ax=lineAxis(a),bx=lineAxis(b);let ux=ax.ux,uy=ax.uy;if(ux*bx.ux+uy*bx.uy<0){/* canonical lineAxis normally prevents this */}
    const nx=-uy,ny=ux,proj=p=>p.x*ux+p.y*uy,off=p=>p.x*nx+p.y*ny,a0=Math.min(proj(a.a),proj(a.b)),a1=Math.max(proj(a.a),proj(a.b)),b0=Math.min(proj(b.a),proj(b.b)),b1=Math.max(proj(b.a),proj(b.b)),lo=Math.max(a0,b0),hi=Math.min(a1,b1),overlap=hi-lo;if(overlap<280)return null;
    const oa=(off(a.a)+off(a.b))/2,ob=(off(b.a)+off(b.b))/2,thickness=Math.abs(ob-oa);if(thickness<55||thickness>560)return null;const shorter=Math.min(a.length,b.length),overlapRatio=overlap/Math.max(shorter,1);if(overlapRatio<.26)return null;const centerOff=(oa+ob)/2,p1={x:ux*lo+nx*centerOff,y:uy*lo+ny*centerOff},p2={x:ux*hi+nx*centerOff,y:uy*hi+ny*centerOff},preferred=thickness>=80&&thickness<=360?1:.68,score=overlapRatio*2+Math.min(overlap/4500,1)+preferred-angleDiff180(a.angle,b.angle)/8;
    return{a:p1,b:p2,thickness,score,overlap,overlapRatio,sourceIds:[a.id,b.id],sourceLayers:[a.layer,b.layer],angle:ax.angle,geometry:'straight'};
  }

  function detectStairCandidates(lines,region){
    const buckets=new Map();for(const line of lines){if(line.length<220||line.length>6500)continue;const key=Math.round(line.angle/3)*3;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(line);}const candidates=[],used=new Set();
    for(const bucket of buckets.values()){
      if(bucket.length<5)continue;const axis=lineAxis(bucket[0]),items=bucket.map(line=>{const u0=Math.min(axis.project(line.a),axis.project(line.b)),u1=Math.max(axis.project(line.a),axis.project(line.b)),n=(axis.offset(line.a)+axis.offset(line.b))/2;return{line,u0,u1,n,centerU:(u0+u1)/2};}).sort((a,b)=>a.n-b.n),adj=new Map(items.map((_,i)=>[i,new Set()]));
      for(let i=0;i<items.length;i++){for(let j=i+1;j<Math.min(items.length,i+18);j++){const dn=items[j].n-items[i].n;if(dn>520)break;if(dn<90)continue;const lo=Math.max(items[i].u0,items[j].u0),hi=Math.min(items[i].u1,items[j].u1),overlap=Math.max(0,hi-lo),shorter=Math.min(items[i].line.length,items[j].line.length),ratio=overlap/Math.max(shorter,1),lr=Math.min(items[i].line.length,items[j].line.length)/Math.max(items[i].line.length,items[j].line.length);if(ratio>.52&&lr>.48){adj.get(i).add(j);adj.get(j).add(i);}}}
      const seen=new Set();for(let i=0;i<items.length;i++){if(seen.has(i))continue;const q=[i],component=[];seen.add(i);while(q.length){const k=q.pop();component.push(items[k]);for(const n of adj.get(k))if(!seen.has(n)){seen.add(n);q.push(n);}}if(component.length<5)continue;const minU=Math.min(...component.map(x=>x.u0)),maxU=Math.max(...component.map(x=>x.u1)),minN=Math.min(...component.map(x=>x.n)),maxN=Math.max(...component.map(x=>x.n));if(maxN-minN<360||maxN-minN>8000||maxU-minU<350)continue;const ids=component.map(x=>x.line.id),key=ids.slice().sort().join('|');if(used.has(key))continue;used.add(key);candidates.push({id:`stairCandidate${candidates.length+1}`,polygon:orientedRectFromAxes({x:axis.ux,y:axis.uy},{x:axis.nx,y:axis.ny},minU,maxU,minN,maxN),axis:{ux:axis.ux,uy:axis.uy,nx:axis.nx,ny:axis.ny},axisBounds:{minU,maxU,minN,maxN},treadCount:component.length,sourceIds:ids,confidence:Math.min(.98,.55+component.length*.035)});}}
    return candidates.slice(0,50);
  }

  function clusterCommonWallThicknesses(pairs){
    const bins=new Map();for(const p of pairs){const k=Math.round(p.thickness/10)*10,b=bins.get(k)||{value:k,weight:0,count:0};b.weight+=Math.max(1,p.overlap)*Math.max(.4,p.overlapRatio);b.count++;bins.set(k,b);}const sorted=[...bins.values()].sort((a,b)=>b.weight-a.weight),chosen=[];for(const b of sorted){if(chosen.some(c=>Math.abs(c.value-b.value)<25))continue;chosen.push(b);if(chosen.length>=7)break;}return chosen.sort((a,b)=>a.value-b.value);
  }
  function dominantArchitecturalAxes(lines){
    const bins=new Map();for(const l of lines){if(l.length<450)continue;const k=Math.round(l.angle)%180,b=bins.get(k)||{angle:k,weight:0};b.weight+=Math.min(l.length,16000);bins.set(k,b);}const ordered=[...bins.values()].sort((a,b)=>b.weight-a.weight),axes=[];for(const b of ordered){if(axes.some(a=>angleDiff180(a.angle,b.angle)<4))continue;axes.push(b);if(axes.length>=6)break;}return axes;
  }
  function snapWallCandidateToAxis(w,axes){
    if(w.geometry==='arc'||!axes.length)return w;const current=angleDeg(w.a,w.b)%180;let best=null,bestD=Infinity;for(const a of axes){const d=angleDiff180(current,a.angle);if(d<bestD){bestD=d;best=a.angle;}}if(best==null||bestD>4)return w;const m=wallMidPoint(w),len=distance(w.a,w.b),r=rad(best),ux=Math.cos(r),uy=Math.sin(r);return{...w,a:{x:m.x-ux*len/2,y:m.y-uy*len/2},b:{x:m.x+ux*len/2,y:m.y+uy*len/2},angle:best};
  }
  function median(values){const a=values.filter(Number.isFinite).slice().sort((x,y)=>x-y);if(!a.length)return 0;const i=Math.floor(a.length/2);return a.length%2?a[i]:(a[i-1]+a[i])/2;}
  function projectionOverlapRatio(a,b,axis){const a0=Math.min(axis.project(a.a),axis.project(a.b)),a1=Math.max(axis.project(a.a),axis.project(a.b)),b0=Math.min(axis.project(b.a),axis.project(b.b)),b1=Math.max(axis.project(b.a),axis.project(b.b)),overlap=Math.max(0,Math.min(a1,b1)-Math.max(a0,b0));return overlap/Math.max(1,Math.min(a1-a0,b1-b0));}
  function collapseArchitecturalWallBundles(walls){
    const ordered=walls.slice().sort((a,b)=>distance(b.a,b.b)-distance(a.a,a.b)),used=new Set(),out=[];
    for(let i=0;i<ordered.length;i++){
      if(used.has(i))continue;const seed=ordered[i],axis=lineAxis(seed),cluster=[seed];used.add(i);
      for(let j=i+1;j<ordered.length;j++){if(used.has(j))continue;const c=ordered[j];if(angleDiff180(axis.angle,lineAxis(c).angle)>2.5)continue;const overlap=projectionOverlapRatio(seed,c,axis);if(overlap<.34)continue;const normal=Math.abs(axis.offset(wallMidPoint(seed))-axis.offset(wallMidPoint(c))),limit=Math.max(165,1.2*Math.max(seed.thickness||150,c.thickness||150));if(normal>limit)continue;cluster.push(c);used.add(j);}
      if(cluster.length===1){out.push(seed);continue;}
      const weights=cluster.map(c=>Math.max(1,distance(c.a,c.b))*Math.max(.7,c.score||1)),sum=weights.reduce((a,b)=>a+b,0),offsets=cluster.map(c=>axis.offset(wallMidPoint(c))),off=offsets.reduce((s,v,k)=>s+v*weights[k],0)/sum,lo=Math.min(...cluster.flatMap(c=>[axis.project(c.a),axis.project(c.b)])),hi=Math.max(...cluster.flatMap(c=>[axis.project(c.a),axis.project(c.b)])),baseThickness=median(cluster.map(c=>c.thickness||150)),spread=Math.max(...offsets)-Math.min(...offsets),thickness=Math.max(baseThickness,spread+baseThickness),sourceIds=[...new Set(cluster.flatMap(c=>c.sourceIds||[]))],sourceLayers=[...new Set(cluster.flatMap(c=>c.sourceLayers||[]))];
      out.push({id:seed.id,a:{x:axis.ux*lo+axis.nx*off,y:axis.uy*lo+axis.ny*off},b:{x:axis.ux*hi+axis.nx*off,y:axis.uy*hi+axis.ny*off},thickness:clamp(thickness,60,520),score:Math.max(...cluster.map(c=>c.score||0))+.12*Math.min(4,cluster.length-1),sourceIds,sourceLayers,geometry:'straight',bundleSize:cluster.length,confidence:clamp(.58+.06*Math.min(cluster.length,5),.58,.92)});
    }
    return out;
  }
  function mergeCollinearArchitecturalRuns(walls){
    const groups=[];for(const w of walls){const ax=lineAxis(w),mid=wallMidPoint(w);let g=groups.find(g=>angleDiff180(g.axis.angle,ax.angle)<=1.8&&Math.abs(g.axis.offset(mid)-g.offset)<=Math.max(95,.55*Math.max(g.thickness,w.thickness||150)));if(!g){g={axis:ax,offset:ax.offset(mid),thickness:w.thickness||150,walls:[]};groups.push(g);}g.walls.push(w);const n=g.walls.length;g.offset=(g.offset*(n-1)+ax.offset(mid))/n;g.thickness=Math.max(g.thickness,w.thickness||150);}
    const out=[];for(const g of groups){const ax=g.axis,items=g.walls.map(w=>({w,lo:Math.min(ax.project(w.a),ax.project(w.b)),hi:Math.max(ax.project(w.a),ax.project(w.b))})).sort((a,b)=>a.lo-b.lo);let cur=null;for(const it of items){const gapLimit=Math.max(1150,Math.min(1700,(it.w.thickness||150)*6));if(!cur||it.lo-cur.hi>gapLimit){if(cur)out.push(finalizeRun(cur,ax));cur={lo:it.lo,hi:it.hi,offset:ax.offset(wallMidPoint(it.w)),weights:Math.max(1,it.hi-it.lo),thickness:it.w.thickness||150,score:it.w.score||0,sources:new Set(it.w.sourceIds||[]),layers:new Set(it.w.sourceLayers||[]),bundleSize:it.w.bundleSize||1};}else{const weight=Math.max(1,it.hi-it.lo),tot=cur.weights+weight,off=ax.offset(wallMidPoint(it.w));cur.hi=Math.max(cur.hi,it.hi);cur.offset=(cur.offset*cur.weights+off*weight)/tot;cur.weights=tot;cur.thickness=Math.max(cur.thickness,it.w.thickness||150);cur.score=Math.max(cur.score,it.w.score||0);cur.bundleSize=Math.max(cur.bundleSize,it.w.bundleSize||1);for(const id of it.w.sourceIds||[])cur.sources.add(id);for(const l of it.w.sourceLayers||[])cur.layers.add(l);}}if(cur)out.push(finalizeRun(cur,ax));}
    return out;
  }
  function finalizeRun(cur,ax){return{id:`wallCandidate_${Math.random().toString(36).slice(2,9)}`,a:{x:ax.ux*cur.lo+ax.nx*cur.offset,y:ax.uy*cur.lo+ax.ny*cur.offset},b:{x:ax.ux*cur.hi+ax.nx*cur.offset,y:ax.uy*cur.hi+ax.ny*cur.offset},thickness:clamp(cur.thickness,60,520),score:cur.score,sourceIds:[...cur.sources],sourceLayers:[...cur.layers],geometry:'straight',bundleSize:cur.bundleSize,confidence:clamp(.62+Math.min(.28,(cur.score||0)*.08)+Math.min(.08,(cur.bundleSize-1)*.03),.58,.97)};}

  function mergeArchitecturalWallBands(pairs,thicknessClusters,sourceLines=[]){
    const accepted=pairs.filter(p=>{const near=thicknessClusters.some(c=>Math.abs(c.value-p.thickness)<=32);return near||p.score>=2.2;}).slice(0,6500),groups=new Map();
    for(const p of accepted){const ax=lineAxis(p),mid=wallMidPoint(p),off=ax.offset(mid),angleKey=Math.round(ax.angle/2)*2,offKey=Math.round(off/80)*80,thickKey=Math.round(p.thickness/20)*20,key=`${angleKey}|${offKey}|${thickKey}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push({...p,ax,off});}
    const merged=[];for(const list of groups.values()){if(!list.length)continue;const base=list.reduce((a,b)=>a.overlap>=b.overlap?a:b),ax=base.ax;const intervals=list.map(p=>({lo:Math.min(ax.project(p.a),ax.project(p.b)),hi:Math.max(ax.project(p.a),ax.project(p.b)),off:p.off,thickness:p.thickness,score:p.score,sourceIds:p.sourceIds,sourceLayers:p.sourceLayers})).sort((a,b)=>a.lo-b.lo);let cur=null;for(const it of intervals){if(!cur||it.lo-cur.hi>1450){if(cur)merged.push(finalizeMergedBand(cur,ax));cur={...it,weights:Math.max(1,it.hi-it.lo),sources:new Set(it.sourceIds),layers:new Set(it.sourceLayers||[])};}else{const w=Math.max(1,it.hi-it.lo),tot=cur.weights+w;cur.hi=Math.max(cur.hi,it.hi);cur.off=(cur.off*cur.weights+it.off*w)/tot;cur.thickness=(cur.thickness*cur.weights+it.thickness*w)/tot;cur.score=Math.max(cur.score,it.score);cur.weights=tot;for(const id of it.sourceIds)cur.sources.add(id);for(const l of it.sourceLayers||[])cur.layers.add(l);}}if(cur)merged.push(finalizeMergedBand(cur,ax));}
    const axes=dominantArchitecturalAxes(sourceLines),snapped=merged.map(w=>snapWallCandidateToAxis(w,axes)),bundled=collapseArchitecturalWallBundles(snapped),runs=mergeCollinearArchitecturalRuns(bundled),cleaned=cleanupArchitecturalWallTopology(runs,sourceLines);return cleaned.filter(w=>distance(w.a,w.b)>=250).slice(0,300);
  }
  function wallMidPoint(w){return{x:(w.a.x+w.b.x)/2,y:(w.a.y+w.b.y)/2};}
  function finalizeMergedBand(cur,ax){return{id:`wallCandidate_${Math.random().toString(36).slice(2,9)}`,a:{x:ax.ux*cur.lo+ax.nx*cur.off,y:ax.uy*cur.lo+ax.ny*cur.off},b:{x:ax.ux*cur.hi+ax.nx*cur.off,y:ax.uy*cur.hi+ax.ny*cur.off},thickness:Math.max(60,Math.min(520,cur.thickness)),score:cur.score,sourceIds:[...cur.sources],sourceLayers:[...(cur.layers||[])],geometry:'straight',confidence:clamp(.52+(cur.score||0)*.1,.5,.9)};}
  function snapArchitecturalWallCorners(walls){
    const out=walls.map(w=>w.geometry==='arc'?w:{...w,a:{...w.a},b:{...w.b}});for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){const a=out[i],b=out[j];if(a.geometry==='arc'||b.geometry==='arc')continue;const aa=lineAxis(a),bb=lineAxis(b);if(angleDiff180(aa.angle,bb.angle)<15)continue;const x=infiniteLineIntersection(a.a,a.b,b.a,b.b);if(!x)continue;const pa=[a.a,a.b].sort((p,q)=>distance(p,x.point)-distance(q,x.point))[0],pb=[b.a,b.b].sort((p,q)=>distance(p,x.point)-distance(q,x.point))[0],da=distance(pa,x.point),db=distance(pb,x.point);if(da<=430&&db<=430){if(distance(a.a,x.point)<=distance(a.b,x.point))a.a={...x.point};else a.b={...x.point};if(distance(b.a,x.point)<=distance(b.b,x.point))b.a={...x.point};else b.b={...x.point};}}
    return out.filter(w=>w.geometry==='arc'||distance(w.a,w.b)>=250);
  }

  function snapArchitecturalEndpointsToWalls(walls){
    const out=walls.map(w=>w.geometry==='arc'?w:{...w,a:{...w.a},b:{...w.b}}),straight=out.filter(w=>w.geometry!=='arc');
    for(let pass=0;pass<2;pass++)for(const w of straight)for(const ep of['a','b']){let best=null,bestD=Infinity;for(const other of straight){if(other===w)continue;if(angleDiff180(lineAxis(w).angle,lineAxis(other).angle)<12)continue;const pr=projectPointToSegment(w[ep],other.a,other.b),tol=Math.max(90,Math.min(260,.75*Math.max(w.thickness||150,other.thickness||150)));if(pr.distance<=tol&&pr.distance<bestD){bestD=pr.distance;best=pr.point;}}if(best)w[ep]={...best};}
    return out;
  }

  function recoverArchitecturalWallEdgeExtensions(walls,sourceLines=[]){
    const out=walls.map(w=>w.geometry==='arc'?w:{...w,a:{...w.a},b:{...w.b}}),straight=out.filter(w=>w.geometry!=='arc');
    for(const w of straight){
      const ax=lineAxis(w),mid=wallMidPoint(w),centerOff=ax.offset(mid),th=Math.max(60,Number(w.thickness)||150),half=th/2,joinTol=Math.max(150,Math.min(360,th*1.45)),maxExt=Math.max(700,Math.min(1400,th*6));
      let lo=Math.min(ax.project(w.a),ax.project(w.b)),hi=Math.max(ax.project(w.a),ax.project(w.b)),bestLo=lo,bestHi=hi;
      for(const line of sourceLines){if(angleDiff180(ax.angle,line.angle)>2.6)continue;const lmid={x:(line.a.x+line.b.x)/2,y:(line.a.y+line.b.y)/2},off=ax.offset(lmid),edgeDelta=Math.min(Math.abs(off-(centerOff-half)),Math.abs(off-(centerOff+half)));if(edgeDelta>Math.max(48,th*.34))continue;const l0=Math.min(ax.project(line.a),ax.project(line.b)),l1=Math.max(ax.project(line.a),ax.project(line.b));
        if(l0<lo-80&&l1>=lo-joinTol&&lo-l0<=maxExt)bestLo=Math.min(bestLo,l0);
        if(l1>hi+80&&l0<=hi+joinTol&&l1-hi<=maxExt)bestHi=Math.max(bestHi,l1);
      }
      if(bestLo<lo||bestHi>hi){const off=centerOff;w.a={x:ax.ux*bestLo+ax.nx*off,y:ax.uy*bestLo+ax.ny*off};w.b={x:ax.ux*bestHi+ax.nx*off,y:ax.uy*bestHi+ax.ny*off};w.edgeRecovered=true;}
    }
    return out;
  }

  function trimArchitecturalWallOverruns(walls){
    const out=walls.map(w=>w.geometry==='arc'?w:{...w,a:{...w.a},b:{...w.b}}),straight=out.filter(w=>w.geometry!=='arc');
    for(const w of straight){
      const len=distance(w.a,w.b);if(len<320)continue;let cutA=null,cutB=null;
      for(const other of straight){if(other===w)continue;const angle=angleDiff180(lineAxis(w).angle,lineAxis(other).angle);if(angle<14)continue;const hit=segmentIntersection(w.a,w.b,other.a,other.b);if(!hit||hit.t<=1e-5||hit.t>=1-1e-5||hit.u<=.035||hit.u>=.965)continue;const otherLen=distance(other.a,other.b);if(otherLen<Math.max(320,(other.thickness||150)*2))continue;const aTail=hit.t*len,bTail=(1-hit.t)*len,limit=Math.max(210,Math.min(520,Math.max(w.thickness||150,other.thickness||150)*2.35)),ratioLimit=.30;
        if(aTail<=limit&&aTail/len<=ratioLimit&&(!cutA||aTail<cutA.tail))cutA={tail:aTail,point:hit.point};
        if(bTail<=limit&&bTail/len<=ratioLimit&&(!cutB||bTail<cutB.tail))cutB={tail:bTail,point:hit.point};
      }
      const na=cutA?cutA.point:w.a,nb=cutB?cutB.point:w.b;if(distance(na,nb)>=250){if(cutA){w.a={...na};w.trimmedOverrunA=true;}if(cutB){w.b={...nb};w.trimmedOverrunB=true;}}
    }
    return out.filter(w=>w.geometry==='arc'||distance(w.a,w.b)>=250);
  }

  function nearestWallEndpointForIntersection(w,parameter){const len=Math.max(.000001,distance(w.a,w.b)),da=Math.abs(parameter)*len,db=Math.abs(1-parameter)*len;return da<=db?{endpoint:'a',distance:da}:{endpoint:'b',distance:db};}
  function solveArchitecturalWallJunctions(walls){
    const out=walls.map(w=>w.geometry==='arc'?w:{...w,a:{...w.a},b:{...w.b}}),straight=out.filter(w=>w.geometry!=='arc');
    for(let pass=0;pass<2;pass++)for(let i=0;i<straight.length;i++)for(let j=i+1;j<straight.length;j++){
      const a=straight[i],b=straight[j],angle=angleDiff180(lineAxis(a).angle,lineAxis(b).angle);if(angle<14)continue;const hit=infiniteLineIntersection(a.a,a.b,b.a,b.b);if(!hit)continue;
      const ea=nearestWallEndpointForIntersection(a,hit.t),eb=nearestWallEndpointForIntersection(b,hit.u),tolA=Math.max(190,Math.min(650,(a.thickness||150)*3)),tolB=Math.max(190,Math.min(650,(b.thickness||150)*3));
      const lenA=distance(a.a,a.b),lenB=distance(b.a,b.b),interiorA=hit.t>.06&&hit.t<.94&&ea.distance>Math.max(220,(a.thickness||150)*1.5),interiorB=hit.u>.06&&hit.u<.94&&eb.distance>Math.max(220,(b.thickness||150)*1.5);
      // T-junction / short overrun: keep the host continuous and snap only the branch endpoint.
      if(interiorA&&eb.distance<=tolB){b[eb.endpoint]={...hit.point};continue;}
      if(interiorB&&ea.distance<=tolA){a[ea.endpoint]={...hit.point};continue;}
      // L-corner or two nearly meeting ends: extend/trim both endpoints to the true intersection.
      if(!interiorA&&!interiorB&&ea.distance<=tolA&&eb.distance<=tolB){a[ea.endpoint]={...hit.point};b[eb.endpoint]={...hit.point};}
      // Pure interior X crossing deliberately remains untouched.
    }
    return out.filter(w=>w.geometry==='arc'||distance(w.a,w.b)>=250);
  }
  // Final endpoint pass: Plan Mode renders semantic wall centerlines exactly to their model endpoints,
  // so L/T joins must share the real line-line intersection instead of merely landing near a host wall.
  // Pure interior X crossings remain untouched.
  function normalizeArchitecturalJunctionEndpoints(walls){
    const out=walls.map(w=>w.geometry==='arc'?w:{...w,a:{...w.a},b:{...w.b}}),straight=out.filter(w=>w.geometry!=='arc');
    for(let pass=0;pass<2;pass++){
      let changed=false;
      for(const w of straight)for(const ep of ['a','b']){
        const p=w[ep],wa=lineAxis(w);let best=null,bestMove=Infinity;
        for(const other of straight){
          if(other===w)continue;const oa=lineAxis(other),angle=angleDiff180(wa.angle,oa.angle);if(angle<12)continue;
          const hit=infiniteLineIntersection(w.a,w.b,other.a,other.b);if(!hit)continue;
          const th=Math.max(w.thickness||150,other.thickness||150),tol=Math.max(85,Math.min(280,th*1.18)),move=distance(p,hit.point);if(move>tol||move>=bestMove)continue;
          const otherLen=Math.max(1,distance(other.a,other.b)),pad=Math.min(.12,tol/otherLen);
          // The other wall must actually reach this junction (or miss it only by the same small endpoint tolerance).
          if(hit.u < -pad || hit.u > 1+pad)continue;
          // Do not turn an interior/interior X crossing into a junction. This pass moves only a terminal endpoint.
          const selfLen=Math.max(1,distance(w.a,w.b)),selfPad=Math.min(.12,tol/selfLen);
          if(ep==='a'&&hit.t>selfPad)continue;
          if(ep==='b'&&hit.t<1-selfPad)continue;
          best={point:hit.point};bestMove=move;
        }
        if(best&&bestMove>.25){w[ep]={...best.point};changed=true;}
      }
      if(!changed)break;
    }
    return out.filter(w=>w.geometry==='arc'||distance(w.a,w.b)>=250);
  }

  function healArchitecturalEndpointGaps(walls){
    const out=walls.map(w=>w.geometry==='arc'?w:{...w,a:{...w.a},b:{...w.b}}),straight=out.filter(w=>w.geometry!=='arc');
    for(let pass=0;pass<3;pass++){
      let changed=false;
      for(const w of straight)for(const ep of['a','b']){const p=w[ep],wa=lineAxis(w);let best=null,bestScore=Infinity;
        for(const other of straight){if(other===w)continue;const oa=lineAxis(other),angle=angleDiff180(wa.angle,oa.angle),th=Math.max(w.thickness||150,other.thickness||150);
          if(angle>=12){const hit=infiniteLineIntersection(w.a,w.b,other.a,other.b);if(!hit)continue;const d=distance(p,hit.point),tol=Math.max(120,Math.min(420,th*2.15)),pad=tol/Math.max(1,distance(other.a,other.b));if(d>tol||hit.u<-pad||hit.u>1+pad)continue;const score=d+(hit.u<0||hit.u>1?55:0);if(score<bestScore){bestScore=score;best={kind:'junction',point:hit.point};}}
          else if(angle<=3.2){const off=Math.abs(wa.offset(wallMidPoint(w))-wa.offset(wallMidPoint(other))),offTol=Math.max(36,Math.min(95,th*.34));if(off>offTol)continue;for(const oep of['a','b']){const q=other[oep],gap=distance(p,q),gapTol=Math.max(90,Math.min(330,th*1.45));if(gap>gapTol)continue;const score=gap+off*1.8;if(score<bestScore){bestScore=score;best={kind:'collinear',other,otherEndpoint:oep,point:{x:(p.x+q.x)/2,y:(p.y+q.y)/2}};}}}
        }
        if(best){if(distance(w[ep],best.point)>.5){w[ep]={...best.point};changed=true;}if(best.kind==='collinear'&&distance(best.other[best.otherEndpoint],best.point)>.5){best.other[best.otherEndpoint]={...best.point};changed=true;}}
      }
      if(!changed)break;
    }
    return out.filter(w=>w.geometry==='arc'||distance(w.a,w.b)>=250);
  }
  function cleanupArchitecturalWallTopology(walls,sourceLines=[]){
    const recovered=recoverArchitecturalWallEdgeExtensions(walls,sourceLines),cornered=snapArchitecturalWallCorners(recovered),connected=snapArchitecturalEndpointsToWalls(cornered),junctioned=solveArchitecturalWallJunctions(connected),runs=mergeCollinearArchitecturalRuns(junctioned),trimmed=trimArchitecturalWallOverruns(runs),healed=healArchitecturalEndpointGaps(trimmed),merged=mergeCollinearArchitecturalRuns(healed),resnapped=snapArchitecturalEndpointsToWalls(merged),finalized=solveArchitecturalWallJunctions(resnapped),finalTrim=trimArchitecturalWallOverruns(finalized),exact=normalizeArchitecturalJunctionEndpoints(finalTrim),cleanEnd=trimArchitecturalWallOverruns(exact);return cleanEnd.filter(w=>w.geometry==='arc'||distance(w.a,w.b)>=250);
  }

  function arcAnglesComparable(a,b){return Math.sign(a.sweep||1)===Math.sign(b.sweep||1)&&Math.abs(angleDelta(a.startAngle||0,b.startAngle||0))<=9&&Math.abs(Math.abs(a.sweep||0)-Math.abs(b.sweep||0))<=16;}
  function detectArcWallCandidates(arcs){
    const raw=[];for(let i=0;i<arcs.length;i++)for(let j=i+1;j<arcs.length;j++){const a=arcs[i],b=arcs[j];if(!arcAnglesComparable(a,b))continue;const dc=distance(a.center,b.center),rMin=Math.min(a.radius,b.radius);if(dc>Math.max(65,rMin*.025))continue;const thickness=Math.abs(a.radius-b.radius);if(thickness<55||thickness>560)continue;const center={x:(a.center.x+b.center.x)/2,y:(a.center.y+b.center.y)/2},radius=(a.radius+b.radius)/2,sweep=Math.sign(a.sweep||1)*Math.min(Math.abs(a.sweep),Math.abs(b.sweep)),startAngle=a.startAngle,aa=rad(startAngle),ab=rad(startAngle+sweep),p1={x:center.x+Math.cos(aa)*radius,y:center.y+Math.sin(aa)*radius},p2={x:center.x+Math.cos(ab)*radius,y:center.y+Math.sin(ab)*radius},score=2.2+Math.min(Math.abs(sweep)/90,1)+Math.max(0,1-dc/120);raw.push({id:`arcWallCandidate_${raw.length+1}`,geometry:'arc',center,radius,startAngle,sweep,a:p1,b:p2,thickness,score,sourceIds:[a.id,b.id],sourceLayers:[a.layer,b.layer],confidence:clamp(.72+score*.05,.72,.96)});}
    const kept=[];for(const c of raw.sort((a,b)=>b.score-a.score)){const dup=kept.find(k=>distance(k.center,c.center)<90&&Math.abs(k.radius-c.radius)<Math.max(100,.8*Math.max(k.thickness,c.thickness))&&Math.abs(angleDelta(k.startAngle,c.startAngle))<8&&Math.abs(Math.abs(k.sweep)-Math.abs(c.sweep))<12);if(dup){const radii=[dup.radius,c.radius],spread=Math.abs(dup.radius-c.radius);dup.radius=(dup.radius+c.radius)/2;dup.thickness=clamp(Math.max(dup.thickness,c.thickness,spread+Math.min(dup.thickness,c.thickness)),60,520);dup.sourceIds=[...new Set([...(dup.sourceIds||[]),...(c.sourceIds||[])])];dup.sourceLayers=[...new Set([...(dup.sourceLayers||[]),...(c.sourceLayers||[])])];const a0=rad(dup.startAngle),a1=rad(dup.startAngle+dup.sweep);dup.a={x:dup.center.x+Math.cos(a0)*dup.radius,y:dup.center.y+Math.sin(a0)*dup.radius};dup.b={x:dup.center.x+Math.cos(a1)*dup.radius,y:dup.center.y+Math.sin(a1)*dup.radius};continue;}kept.push(c);}return kept.slice(0,80);
  }
  function circleThrough3Points(a,b,c){
    const d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));if(Math.abs(d)<1e-7)return null;
    const aa=a.x*a.x+a.y*a.y,bb=b.x*b.x+b.y*b.y,cc=c.x*c.x+c.y*c.y;
    const center={x:(aa*(b.y-c.y)+bb*(c.y-a.y)+cc*(a.y-b.y))/d,y:(aa*(c.x-b.x)+bb*(a.x-c.x)+cc*(b.x-a.x))/d};
    return{center,radius:distance(center,a)};
  }
  function detectSegmentedArcCandidates(lines){
    const eligible=lines.filter(l=>l.length>=60&&l.length<=2200),byLayer=new Map();for(const l of eligible){if(!byLayer.has(l.layer))byLayer.set(l.layer,[]);byLayer.get(l.layer).push(l);}const out=[];
    for(const bucket of byLayer.values()){
      const unused=new Set(bucket.map(l=>l.id)),lookup=new Map(bucket.map(l=>[l.id,l])),tol=28;
      const near=(p,q)=>distance(p,q)<=tol;
      while(unused.size){const seed=lookup.get(unused.values().next().value);unused.delete(seed.id);const chain=[seed];let end={...seed.b};let extended=true;
        while(extended&&chain.length<90){extended=false;let best=null,bestD=Infinity,flip=false;for(const id of unused){const l=lookup.get(id);for(const [pt,f] of [[l.a,false],[l.b,true]]){const d=distance(end,pt);if(d<bestD&&d<=tol){best=l;bestD=d;flip=f;}}}if(best){unused.delete(best.id);const item=flip?{...best,a:{...best.b},b:{...best.a}}:best;chain.push(item);end={...item.b};extended=true;}}
        if(chain.length<4)continue;const pts=[{...chain[0].a},...chain.map(l=>({...l.b}))],first=pts[0],mid=pts[Math.floor(pts.length/2)],last=pts.at(-1),fit=circleThrough3Points(first,mid,last);if(!fit||fit.radius<300||fit.radius>120000)continue;
        const residuals=pts.map(q=>Math.abs(distance(q,fit.center)-fit.radius)),maxResidual=Math.max(...residuals),allowed=Math.max(24,fit.radius*.006);if(maxResidual>allowed)continue;
        const angles=pts.map(q=>deg(Math.atan2(q.y-fit.center.y,q.x-fit.center.x))),unwrapped=[angles[0]];let total=0,consistent=0,lastSign=0;for(let i=1;i<angles.length;i++){let d=angleDelta(angles[i],angles[i-1]);if(Math.abs(d)>50){consistent=-99;break;}const sign=Math.sign(d);if(sign&&(!lastSign||sign===lastSign))consistent++;else if(sign)consistent-=2;if(sign)lastSign=sign;total+=d;unwrapped.push(unwrapped.at(-1)+d);}if(consistent<chain.length-2||Math.abs(total)<18||Math.abs(total)>220)continue;
        const thickness=150,startAngle=angles[0],sweep=total,a={...first},b={...last};out.push({id:`segArcCandidate_${out.length+1}`,geometry:'arc',center:fit.center,radius:fit.radius,startAngle,sweep,a,b,thickness,score:2.35,sourceIds:chain.map(l=>l.id),sourceLayers:[chain[0].layer],confidence:clamp(.74-maxResidual/Math.max(allowed*5,1)+Math.min(.12,chain.length*.01),.58,.94),segmentedSource:true});
      }
    }
    return out.slice(0,80);
  }

  function candidateWallLength(w){return w.geometry==='arc'?Math.abs(rad(w.sweep))*w.radius:distance(w.a,w.b);}
  function candidateWallPointAt(w,t){if(w.geometry==='arc'){const a=rad(w.startAngle+w.sweep*clamp(t,0,1));return{x:w.center.x+Math.cos(a)*w.radius,y:w.center.y+Math.sin(a)*w.radius};}return{x:w.a.x+(w.b.x-w.a.x)*t,y:w.a.y+(w.b.y-w.a.y)*t};}
  function candidateWallProjectPoint(p,w){if(w.geometry!=='arc')return projectPointToSegment(p,w.a,w.b);const angle=normalizeAngle(deg(Math.atan2(p.y-w.center.y,p.x-w.center.x))),start=normalizeAngle(w.startAngle),sweep=w.sweep;let progress=sweep>=0?deltaCcw(start,angle)/Math.max(.000001,sweep):deltaCcw(angle,start)/Math.max(.000001,-sweep);if(progress>=0&&progress<=1){const point=candidateWallPointAt(w,progress);return{t:progress,point,distance:distance(p,point)};}const da=distance(p,w.a),db=distance(p,w.b);return da<=db?{t:0,point:{...w.a},distance:da}:{t:1,point:{...w.b},distance:db};}
  function sampleCandidateWallSegments(w){if(w.geometry!=='arc')return[{id:`${w.id}:0`,wallId:w.id,a:w.a,b:w.b}];const n=Math.max(6,Math.ceil(Math.max(Math.abs(w.sweep)/8,candidateWallLength(w)/320))),out=[];let prev=candidateWallPointAt(w,0);for(let i=1;i<=n;i++){const cur=candidateWallPointAt(w,i/n);out.push({id:`${w.id}:${i-1}`,wallId:w.id,a:prev,b:cur});prev=cur;}return out;}

  function detectDoorCandidates(region,walls,arcWallSourceIds=new Set()){
    const candidates=[];for(const o of state.objects){if(o.type!=='cadArc'||arcWallSourceIds.has(o.id)||!cadLayerVisible(o.cadLayer||'0')||!objectTouchesRegion(o,region))continue;const sweep=Math.abs(Number(o.sweep)||0),r=Number(o.radius)||0;if(sweep<55||sweep>125||r<450||r>1800)continue;let best=null,bestD=Infinity;for(const w of walls){const pr=candidateWallProjectPoint(o.center,w),limit=Math.max(360,(w.thickness||150)*1.8);if(pr.distance<limit&&pr.distance<bestD){bestD=pr.distance;best={w,pr};}}if(!best)continue;candidates.push({id:`doorCandidate_${candidates.length+1}`,wallCandidateId:best.w.id,t:best.pr.t,width:r,doorType:'hingedSingle',hinge:'start',swing:1,sourceIds:[o.id],confidence:Math.max(.55,1-bestD/800)});}const out=[];for(const c of candidates.sort((a,b)=>b.confidence-a.confidence)){if(out.some(x=>x.wallCandidateId===c.wallCandidateId&&Math.abs(x.t-c.t)<.05))continue;out.push(c);}return out.slice(0,120);
  }
  function detectSegmentedDoorCandidates(segmentedArcs,walls){
    const candidates=[];for(const arc of segmentedArcs||[]){const sweep=Math.abs(Number(arc.sweep)||0),r=Number(arc.radius)||0;if(sweep<52||sweep>132||r<420||r>1900)continue;let best=null,bestD=Infinity;for(const w of walls){if(w.geometry==='arc'&&Math.abs((w.radius||0)-r)<120)continue;const pr=candidateWallProjectPoint(arc.center,w),limit=Math.max(320,(w.thickness||150)*1.9);if(pr.distance<limit&&pr.distance<bestD){bestD=pr.distance;best={w,pr};}}if(!best)continue;const conf=clamp((arc.confidence||.65)+.16-bestD/2400,.55,.96);candidates.push({id:`segDoorCandidate_${candidates.length+1}`,wallCandidateId:best.w.id,t:best.pr.t,width:r,doorType:'hingedSingle',hinge:'start',swing:arc.sweep>=0?1:-1,sourceIds:[...(arc.sourceIds||[])],segmentedSource:true,confidence:conf});}
    const out=[];for(const c of candidates.sort((a,b)=>b.confidence-a.confidence)){if(out.some(x=>x.wallCandidateId===c.wallCandidateId&&Math.abs(x.t-c.t)<.055))continue;out.push(c);}return out.slice(0,160);
  }

  function detectWallCandidates(region){
    const lines=wallRecognitionSourceLines(region),arcs=wallRecognitionSourceArcs(region),stairs=detectStairCandidates(lines,region),stairIds=new Set(stairs.flatMap(s=>s.sourceIds)),segmentedAll=detectSegmentedArcCandidates(lines.filter(l=>!stairIds.has(l.id))),segAllIds=new Set(segmentedAll.flatMap(a=>a.sourceIds||[])),structural=lines.filter(l=>l.length>=280&&!stairIds.has(l.id)&&!segAllIds.has(l.id)),bins=new Map();for(const line of structural){const key=Math.round(line.angle/2)*2;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(line);}const pairs=[];
    for(const bucket of bins.values()){
      if(bucket.length<2)continue;const axis=lineAxis(bucket[0]),prepared=bucket.map(line=>({...line,offset:(axis.offset(line.a)+axis.offset(line.b))/2})).sort((a,b)=>a.offset-b.offset);for(let i=0;i<prepared.length;i++){let checked=0;for(let j=i+1;j<prepared.length&&checked<22;j++){const delta=prepared[j].offset-prepared[i].offset;if(delta>600)break;if(delta<50)continue;checked++;const cand=pairWallCandidate(prepared[i],prepared[j]);if(cand)pairs.push(cand);if(pairs.length>18000)break;}if(pairs.length>18000)break;}if(pairs.length>18000)break;}
    const thicknessClusters=clusterCommonWallThicknesses(pairs),straightWalls=mergeArchitecturalWallBands(pairs.sort((a,b)=>b.score-a.score),thicknessClusters,structural),arcWalls=detectArcWallCandidates(arcs),provisionalWalls=[...straightWalls,...arcWalls],segmentedDoors=detectSegmentedDoorCandidates(segmentedAll,provisionalWalls),doorSegIds=new Set(segmentedDoors.flatMap(d=>d.sourceIds||[])),segmentedArcs=segmentedAll.filter(a=>!(a.sourceIds||[]).some(id=>doorSegIds.has(id))),walls=[...straightWalls,...arcWalls,...segmentedArcs],arcWallSourceIds=new Set(arcWalls.flatMap(w=>w.sourceIds||[])),segments=walls.flatMap(sampleCandidateWallSegments),regionArea=Math.max(1,(region.maxx-region.minx)*(region.maxy-region.miny)),faces=detectFacesFromSegments(segments,{minArea:1_000_000,maxArea:regionArea*.82,snapTol:14}).filter(f=>f.area<600_000_000),spaces=faces.map((f,i)=>({id:`spaceCandidate_${i+1}`,...f,confidence:clamp(.68+Math.min(.24,(f.wallIds?.length||0)*.03),.68,.92)})),arcDoors=detectDoorCandidates(region,walls,arcWallSourceIds),doors=[];
    for(const c of [...arcDoors,...segmentedDoors].sort((a,b)=>b.confidence-a.confidence)){if(doors.some(x=>x.wallCandidateId===c.wallCandidateId&&Math.abs(x.t-c.t)<.055))continue;doors.push(c);if(doors.length>=160)break;}
    return{lines,arcs,segmentedArcs,segmentedDoors,structural,pairs,walls,candidates:walls,spaces,doors,stairs,thicknessClusters,truncated:pairs.length>=18000,safetyExceeded:walls.length>=280};
  }

  function candidateWallTangentAt(w,t){
    if(w.geometry==='arc'){const a=rad(w.startAngle+w.sweep*clamp(t,0,1)),sign=w.sweep>=0?1:-1;return{ux:-Math.sin(a)*sign,uy:Math.cos(a)*sign};}
    const dx=w.b.x-w.a.x,dy=w.b.y-w.a.y,len=Math.max(.000001,Math.hypot(dx,dy));return{ux:dx/len,uy:dy/len};
  }
  function candidateSignature(c){
    if(c.geometry==='arc')return `A:${Math.round(c.center.x/10)}:${Math.round(c.center.y/10)}:${Math.round(c.radius/10)}:${Math.round(c.startAngle)}:${Math.round(c.sweep)}:${Math.round((c.thickness||0)/5)}`;
    if(c.a&&c.b){const pts=[c.a,c.b].sort((p,q)=>p.x===q.x?p.y-q.y:p.x-q.x);return `L:${pts.map(p=>`${Math.round(p.x/10)}:${Math.round(p.y/10)}`).join(':')}:${Math.round((c.thickness||0)/5)}`;}
    if(c.polygon?.length)return `P:${c.polygon.length}:${Math.round((c.area||0)/10000)}`;
    return String(c.id||'candidate');
  }
  function drawWallRecognitionPreview(){
    const p=state.wallRecognitionPreview;if(!p)return;const styles=getComputedStyle(document.documentElement),accent=styles.getPropertyValue('--accent').trim()||'#3478F6',success=styles.getPropertyValue('--success').trim()||'#22c55e',door=styles.getPropertyValue('--door').trim()||'#f59e0b';ctx.save();
    ctx.fillStyle=success;ctx.strokeStyle=success;for(const space of p.spaces||[]){ctx.globalAlpha=.07;ctx.beginPath();space.polygon.forEach((q,i)=>{const s=toScreenCss(q);if(!i)ctx.moveTo(s.x,s.y);else ctx.lineTo(s.x,s.y);});ctx.closePath();ctx.fill();ctx.globalAlpha=.32;ctx.lineWidth=1;ctx.stroke();}
    ctx.strokeStyle=accent;ctx.globalAlpha=.48;ctx.lineCap='square';for(const wall of p.walls||p.candidates||[]){ctx.lineWidth=Math.max(2,(wall.thickness||150)*state.camera.zoom);const segs=sampleCandidateWallSegments(wall);ctx.beginPath();for(const seg of segs){const a=toScreenCss(seg.a),b=toScreenCss(seg.b);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();}
    ctx.strokeStyle=door;ctx.globalAlpha=.72;ctx.lineWidth=1.8;for(const d of p.doors||[]){const w=(p.walls||[]).find(x=>x.id===d.wallCandidateId);if(!w)continue;const c=candidateWallPointAt(w,d.t),tg=candidateWallTangentAt(w,d.t),nx=-tg.uy,ny=tg.ux,h={x:c.x-tg.ux*d.width/2,y:c.y-tg.uy*d.width/2},leaf={x:h.x+nx*d.width,y:h.y+ny*d.width};drawWorldLine(h,leaf,1.8);}
    ctx.strokeStyle=success;ctx.globalAlpha=.65;ctx.setLineDash([6,4]);for(const st of p.stairs||[]){ctx.beginPath();st.polygon.forEach((q,i)=>{const s=toScreenCss(q);if(!i)ctx.moveTo(s.x,s.y);else ctx.lineTo(s.x,s.y);});ctx.closePath();ctx.stroke();}ctx.setLineDash([]);ctx.restore();
  }

  function beginWallRecognition(region){
    if(!region)return;const result=detectWallCandidates(region);if(!result.walls.length&&!result.spaces.length&&!result.stairs.length){alert(t('recognition.none'));return;}state.selectedRegionId=region.id;state.wallRecognitionPreview={regionId:region.id,...result};dom.recognitionTitle.textContent=t('recognition.title');dom.recognitionCopy.textContent=t('recognition.copy',{name:region.name});dom.recognitionStats.textContent=t('recognition.stats',{walls:result.walls.length.toLocaleString(),lines:result.lines.length.toLocaleString()})+(result.truncated?` · ${t('recognition.truncated')}`:'');
    if(dom.recognitionBreakdown)dom.recognitionBreakdown.innerHTML=[['recognition.wallsCount',result.walls.length],['recognition.spacesCount',result.spaces.length],['recognition.doorsCount',result.doors.length],['recognition.stairsCount',result.stairs.length]].map(([k,n])=>`<span class="recognition-chip">${escapeHtml(t(k,{count:n.toLocaleString()}))}</span>`).join('');const previous=[...(state.recognitionHistory||[])].reverse().find(h=>h.regionId===region.id)?.applied||null;dom.recognitionCreateWalls.checked=previous?.walls??true;dom.recognitionCreateSpaces.checked=previous?.spaces??true;dom.recognitionCreateDoors.checked=previous?.doors??true;dom.recognitionCreateStairs.checked=previous?.stairs??true;dom.recognitionApplyBtn.disabled=result.safetyExceeded;dom.recognitionBackdrop.hidden=false;render();
  }
  function cancelWallRecognition(){state.wallRecognitionPreview=null;dom.recognitionBackdrop.hidden=true;dom.recognitionApplyBtn.disabled=false;render();}
  function findWallCandidateDuplicateExisting(c,regionId=null,floorId=null){
    const eligible=w=>(!regionId||w.sourceRegionId===regionId||(!w.sourceRegionId&&(!floorId||w.floorId===floorId)))&&(!floorId||!w.floorId||w.floorId===floorId);
    if(c.geometry==='arc'){for(const w of state.objects){if(!isArcWall(w)||!eligible(w))continue;if(distance(w.center,c.center)>100)continue;if(Math.abs(w.radius-c.radius)>Math.max(100,(w.thickness+c.thickness)/2))continue;if(Math.abs(angleDelta(w.startAngle,c.startAngle))<8&&Math.abs(Math.abs(w.sweep)-Math.abs(c.sweep))<12)return w;}return null;}
    const ang=angleDeg(c.a,c.b)%180,mid=wallMidPoint(c),len=distance(c.a,c.b);for(const w of state.objects){if(w.type!=='wall'||isArcWall(w)||!eligible(w))continue;const wa=angleDeg(w.a,w.b)%180;if(angleDiff180(ang,wa)>1.5)continue;const wmid=wallMidPoint(w);if(distance(mid,wmid)>Math.max(100,(c.thickness+w.thickness)/2))continue;const ratio=Math.min(len,distance(w.a,w.b))/Math.max(len,distance(w.a,w.b),1);if(ratio>.78)return w;}return null;
  }
  function wallCandidateDuplicatesExisting(c,regionId=null,floorId=null){return Boolean(findWallCandidateDuplicateExisting(c,regionId,floorId));}


  function recognitionBaselineWallSignatures(regionId){const set=new Set();for(const h of state.recognitionHistory||[]){if(h.regionId!==regionId)continue;for(const sig of h.accepted?.walls||[])set.add(sig);}return set;}
  function recognizedWallSourceMatch(candidate,regionId){const ids=new Set(candidate.sourceIds||[]);if(!ids.size)return null;let best=null,bestScore=0,bestGeom=Infinity;for(const w of state.objects){if(w.type!=='wall'||!w.recognizedFromCad||w.sourceRegionId!==regionId)continue;if((candidate.geometry==='arc')!==isArcWall(w))continue;const wids=w.recognitionSourceIds||[];if(!wids.length)continue;let hit=0;for(const id of wids)if(ids.has(id))hit++;if(!hit)continue;const score=hit/Math.max(1,Math.min(ids.size,wids.length)),geom=candidate.geometry==='arc'?distance(candidate.center,w.center)+Math.abs((candidate.radius||0)-(w.radius||0)):(distance(wallMidPoint(candidate),wallMidPoint(w))+angleDiff180(angleDeg(candidate.a,candidate.b),angleDeg(w.a,w.b))*120+Math.abs(distance(candidate.a,candidate.b)-distance(w.a,w.b))*.08);if(score>bestScore+1e-6||(Math.abs(score-bestScore)<=1e-6&&geom<bestGeom)){best=w;bestScore=score;bestGeom=geom;}}return bestScore>=.45?best:null;}
  function refreshRecognizedWallFromCandidate(w,c){w.a={...c.a};w.b={...c.b};w.thickness=Math.round(c.thickness/5)*5;w.geometry=c.geometry==='arc'?'arc':'straight';w.recognitionSourceIds=[...(c.sourceIds||[])];w.recognitionConfidence=c.confidence||null;if(c.geometry==='arc'){w.center={...c.center};w.radius=c.radius;w.startAngle=c.startAngle;w.sweep=c.sweep;}else{delete w.center;delete w.radius;delete w.startAngle;delete w.sweep;}return w;}
  function sourceIdOverlapRatio(a,b){const aa=new Set(a||[]),bb=new Set(b||[]);if(!aa.size||!bb.size)return 0;let hit=0;for(const id of aa)if(bb.has(id))hit++;return hit/Math.max(1,Math.min(aa.size,bb.size));}
  function polygonRecognitionSignature(poly){if(!poly?.length)return'none';const c=polygonCentroid(poly),area=Math.abs(polygonArea(poly));return`${poly.length}:${Math.round(c.x/10)}:${Math.round(c.y/10)}:${Math.round(area/10000)}`;}
  function recognitionObjectSignature(o){
    if(!o)return'none';
    if(o.type==='wall')return candidateSignature(o);
    if(o.type==='door')return`D:${[...(o.recognitionSourceIds||[])].sort().join(',')}:${Math.round((o.t??.5)*1000)}:${Math.round((o.width||0)/5)}:${o.doorType||'hingedSingle'}:${o.hinge||'start'}:${o.swing===-1?-1:1}:${o.slideDirection===-1?-1:1}`;
    if(o.type==='stair')return`S:${[...(o.recognitionSourceIds||[])].sort().join(',')}:${Number(o.treadCount)||0}:${polygonRecognitionSignature(o.polygon)}`;
    if(o.type==='space')return`P:${polygonRecognitionSignature(o.polygon)}`;
    return`${o.type||'object'}:${o.id||''}`;
  }
  function stampRecognitionBaseline(o){o.recognitionBaselineSignature=recognitionObjectSignature(o);return o;}
  function doorCandidateEquivalentToObject(o,c){if(!o||!c)return false;if(sourceIdOverlapRatio(o.recognitionSourceIds,c.sourceIds)<.5)return false;const widthTol=Math.max(30,Math.max(Number(o.width)||0,Number(c.width)||0)*.08);return Math.abs((o.t??.5)-(c.t??.5))<=.03&&Math.abs((Number(o.width)||0)-(Number(c.width)||0))<=widthTol&&(o.doorType||'hingedSingle')===(c.doorType||'hingedSingle')&&(o.hinge||'start')===(c.hinge||'start')&&(o.swing===-1?-1:1)===(c.swing===-1?-1:1);}
  function matchingDoorCandidateForObject(o,preview){let best=null,bestScore=0;for(const c of preview?.doors||[]){const score=sourceIdOverlapRatio(o.recognitionSourceIds,c.sourceIds);if(score>bestScore){best=c;bestScore=score;}}return bestScore>=.5?best:null;}
  function recognizedObjectIsAutoOwned(o,regionId,preview,wallBaselines){
    if(!o?.recognizedFromCad||o.sourceRegionId!==regionId||o.recognitionDetached)return false;
    if(o.recognitionBaselineSignature)return recognitionObjectSignature(o)===o.recognitionBaselineSignature;
    if(o.type==='wall')return wallBaselines.has(candidateSignature(o));
    if(o.type==='door'){if(!(o.recognitionSourceIds||[]).length)return false;const c=matchingDoorCandidateForObject(o,preview);return c?doorCandidateEquivalentToObject(o,c):true;}
    if(o.type==='stair'||o.type==='space')return true;
    return false;
  }
  function findExistingDoorForCandidate(c,wallId,floorId,regionId){return state.objects.find(o=>o.type==='door'&&(!floorId||o.floorId===floorId)&&(!regionId||!o.sourceRegionId||o.sourceRegionId===regionId)&&((o.wallId===wallId&&Math.abs((o.t??.5)-(c.t??.5))<.045&&Math.abs((o.width||0)-(c.width||0))<Math.max(60,(c.width||0)*.12))||sourceIdOverlapRatio(o.recognitionSourceIds,c.sourceIds)>=.65))||null;}


  function applyWallRecognition(){
    const p=state.wallRecognitionPreview,region=state.drawingRegions.find(r=>r.id===p?.regionId);if(!p||!region)return cancelWallRecognition();if(p.safetyExceeded){alert(t('recognition.safetyExceeded'));return;}
    pushHistory();
    const floor=ensureFloorForRegion(region);state.activeFloorId=floor.id;
    const createWalls=dom.recognitionCreateWalls?.checked!==false,createDoors=dom.recognitionCreateDoors?.checked!==false,createStairs=dom.recognitionCreateStairs?.checked!==false,createSpaces=dom.recognitionCreateSpaces?.checked!==false;
    const wallBaselines=recognitionBaselineWallSignatures(region.id),regionRecognized=state.objects.filter(o=>isSemanticObject(o)&&o.recognizedFromCad&&o.sourceRegionId===region.id&&(!o.floorId||o.floorId===floor.id));
    const autoOwnedIds=new Set(regionRecognized.filter(o=>recognizedObjectIsAutoOwned(o,region.id,p,wallBaselines)).map(o=>o.id));
    const protectedWallIds=new Set();
    for(const o of state.objects){if(!o?.wallId)continue;if(!autoOwnedIds.has(o.id))protectedWallIds.add(o.wallId);}

    // Re-recognition is a rebuild of this CAD region's automatic layer: stale automatic
    // doors/stairs/spaces are removed first. User-created or manually changed objects stay.
    state.objects=state.objects.filter(o=>!(autoOwnedIds.has(o.id)&&o.type!=='wall'));

    const wallMap=new Map(),usedWallIds=new Set(),oldAutoWallIds=new Set(regionRecognized.filter(o=>o.type==='wall'&&autoOwnedIds.has(o.id)).map(o=>o.id));
    const mapExistingWall=(c)=>{const matched=recognizedWallSourceMatch(c,region.id)||findWallCandidateDuplicateExisting(c,region.id,floor.id);if(matched){matched.floorId=floor.id;wallMap.set(c.id,matched.id);usedWallIds.add(matched.id);}return matched;};

    if(createWalls){
      for(const c of p.walls){
        const matched=mapExistingWall(c);
        if(matched){if(autoOwnedIds.has(matched.id)){refreshRecognizedWallFromCandidate(matched,c);matched.recognizedFromCad=true;matched.sourceRegionId=region.id;matched.floorId=floor.id;stampRecognitionBaseline(matched);}continue;}
        const w={id:uid('wall'),type:'wall',layerId:'walls',a:{...c.a},b:{...c.b},thickness:Math.round(c.thickness/5)*5,geometry:c.geometry==='arc'?'arc':'straight',attachments:{},recognizedFromCad:true,sourceRegionId:region.id,recognitionSourceIds:[...(c.sourceIds||[])],recognitionConfidence:c.confidence||null,floorId:floor.id};
        if(c.geometry==='arc'){w.center={...c.center};w.radius=c.radius;w.startAngle=c.startAngle;w.sweep=c.sweep;}
        stampRecognitionBaseline(w);state.objects.push(w);wallMap.set(c.id,w.id);usedWallIds.add(w.id);
      }
    }else{
      // Even with automatic walls disabled, preserve mapping to manually retained/user walls
      // so a user can keep those walls without creating duplicate geometry.
      for(const c of p.walls){const matched=recognizedWallSourceMatch(c,region.id)||findWallCandidateDuplicateExisting(c,region.id,floor.id);if(matched&&!autoOwnedIds.has(matched.id)){wallMap.set(c.id,matched.id);usedWallIds.add(matched.id);}}
    }

    const removeWallIds=new Set();for(const id of oldAutoWallIds)if(!usedWallIds.has(id)&&!protectedWallIds.has(id))removeWallIds.add(id);
    if(removeWallIds.size)state.objects=state.objects.filter(o=>!removeWallIds.has(o.id));

    if(createDoors){for(const c of p.doors||[]){const wallId=wallMap.get(c.wallCandidateId);if(!wallId)continue;if(findExistingDoorForCandidate(c,wallId,floor.id,region.id))continue;const o={id:uid('door'),type:'door',layerId:'doors',wallId,t:c.t,width:c.width,doorType:c.doorType||'hingedSingle',hinge:c.hinge||'start',swing:c.swing||1,slideDirection:1,recognizedFromCad:true,sourceRegionId:region.id,recognitionSourceIds:[...(c.sourceIds||[])],recognitionConfidence:c.confidence||null,floorId:floor.id};stampRecognitionBaseline(o);state.objects.push(o);}}
    if(createStairs){for(const c of p.stairs||[]){const o={id:uid('stair'),type:'stair',layerId:'stairs',stairType:'straight',polygon:c.polygon.map(q=>({...q})),axis:{...c.axis},axisBounds:{...c.axisBounds},treadCount:c.treadCount,recognizedFromCad:true,sourceRegionId:region.id,recognitionSourceIds:[...(c.sourceIds||[])],recognitionConfidence:c.confidence||null,floorId:floor.id};stampRecognitionBaseline(o);state.objects.push(o);}}
    if(createSpaces){for(const c of p.spaces||[]){const wallIds=(c.wallIds||[]).map(id=>wallMap.get(id)).filter(Boolean);const o={id:uid('space'),type:'space',layerId:'spaces',spaceUuid:makeStableUuid(),seed:polygonCentroid(c.polygon),polygon:c.polygon.map(q=>({...q})),wallIds,areaM2:c.area/1e6,invalid:false,recognizedFromCad:true,sourceRegionId:region.id,recognitionConfidence:c.confidence||null,floorId:floor.id};stampRecognitionBaseline(o);state.objects.push(o);}}

    repairPersistentPlanJunctions(floor.id);
    state.recognitionHistory.push({at:new Date().toISOString(),regionId:region.id,sourceLines:p.lines.length,sourceArcs:p.arcs?.length||0,walls:p.walls.length,spaces:p.spaces.length,doors:p.doors.length,stairs:p.stairs.length,thicknesses:p.thicknessClusters.map(x=>x.value),applied:{walls:createWalls,spaces:createSpaces,doors:createDoors,stairs:createStairs},accepted:{walls:createWalls?p.walls.map(candidateSignature):[],spaces:createSpaces?p.spaces.map(candidateSignature):[],doors:createDoors?p.doors.map(candidateSignature):[],stairs:createStairs?p.stairs.map(candidateSignature):[]}});
    state.wallRecognitionPreview=null;dom.recognitionBackdrop.hidden=true;dom.recognitionApplyBtn.disabled=false;markDirty(true);rebuildObjectSnapIndex();openRegionInPlan(region);renderPrimaryPanel();renderProperties();render();
  }


  function renderPrimaryPanel(){if(state.toolset==='plan')renderPlanFloorPanel();else renderCadLayersPanel();}
  function closeFloorActionMenu(){if(state.floorMenuEl){state.floorMenuEl.remove();state.floorMenuEl=null;}}
  function beginInlineFloorRename(floor,row){closeFloorActionMenu();const nameEl=row.querySelector('.floor-name'),wrap=nameEl?.parentElement;if(!wrap)return;const input=document.createElement('input');input.className='floor-inline-rename';input.value=floor.name;wrap.replaceChildren(input);const finish=commit=>{if(commit)commitFloorRename(floor,input.value);else renderPlanFloorPanel();};input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();finish(true);}else if(e.key==='Escape'){e.preventDefault();finish(false);}});input.addEventListener('blur',()=>finish(true),{once:true});setTimeout(()=>{input.focus();input.select();},0);}
  function showFloorActionMenu(floor,owner,row){closeFloorActionMenu();const menu=document.createElement('div');menu.className='floor-action-menu';const add=(label,run,cls='')=>{const b=document.createElement('button');b.textContent=label;if(cls)b.className=cls;b.addEventListener('click',e=>{e.stopPropagation();closeFloorActionMenu();run();});menu.appendChild(b);};add(t('action.rename'),()=>beginInlineFloorRename(floor,row));add(t('action.delete'),()=>deleteFloor(floor),'danger');document.body.appendChild(menu);state.floorMenuEl=menu;const r=owner.getBoundingClientRect(),m=menu.getBoundingClientRect(),margin=8;let left=Math.min(window.innerWidth-m.width-margin,Math.max(margin,r.right-m.width)),top=r.bottom+5;if(top+m.height>window.innerHeight-margin)top=r.top-m.height-5;menu.style.left=`${Math.round(left)}px`;menu.style.top=`${Math.round(Math.max(margin,top))}px`;}
  function renderPlanFloorPanel(){ensureFloorModel();closeFloorActionMenu();dom.primaryControls.hidden=false;dom.primaryControls.innerHTML='';dom.primaryList.className='panel-list';dom.primaryList.innerHTML='';const toolbar=document.createElement('div');toolbar.className='floor-toolbar';const add=document.createElement('button');add.className='small-button';add.textContent=t('floor.add');add.addEventListener('click',addFloor);toolbar.append(add);dom.primaryControls.append(toolbar);const list=document.createElement('div');list.className='floor-list';for(const floor of state.floors){const row=document.createElement('div');row.className=`floor-row ${floor.id===state.activeFloorId?'active':''}`;const count=state.objects.filter(o=>o.floorId===floor.id&&(isSemanticObject(o)||o.type==='line')).length;row.innerHTML=`<div><div class="floor-name">${escapeHtml(floor.name)}</div><div class="floor-meta">${escapeHtml(t('floor.objects',{count}))}</div></div><button class="mini-action" aria-label="${escapeHtml(t('action.more'))}">•••</button>`;row.addEventListener('dblclick',e=>{if(!e.target.closest('button'))beginInlineFloorRename(floor,row);});row.addEventListener('click',e=>{if(!e.target.closest('button')&&!e.target.closest('input'))setActiveFloor(floor.id);});row.querySelector('button').addEventListener('click',e=>{e.stopPropagation();showFloorActionMenu(floor,e.currentTarget,row);});list.append(row);}dom.primaryList.append(list);const floor=activeFloor();const ref=document.createElement('div');ref.className='floor-reference-section';const region=floor?.sourceRegionId?state.drawingRegions.find(r=>r.id===floor.sourceRegionId):null;ref.innerHTML=`<div class="section-heading">${escapeHtml(t('floor.reference'))}</div><div class="section-copy">${escapeHtml(region?region.name:t('floor.noReference'))}</div>`;const actions=document.createElement('div');actions.className='plan-reference-row';const re=document.createElement('button');re.className='small-button';re.textContent=t('floor.reRecognize');re.disabled=!region;re.addEventListener('click',()=>region&&beginWallRecognition(region));const cad=document.createElement('button');cad.className='small-button';cad.textContent=t('floor.editCad');cad.disabled=!state.sourceDxfName&&!state.objects.some(isCadObject);cad.addEventListener('click',()=>switchToolset('cad',{skipMapping:true}));actions.append(re,cad);ref.append(actions);dom.primaryList.append(ref);}
  function summaryRow(icon,title,meta){const row=document.createElement('div');row.className='list-row';row.innerHTML=`<div class="object-swatch"><span class="ui-icon icon-${icon}" aria-hidden="true"></span></div><div class="row-main"><div class="row-title">${escapeHtml(title)}</div><div class="row-meta">${escapeHtml(meta)}</div></div><span></span>`;return row;}
  function scrollLayerRowInsideList(row){if(!row||!dom.primaryList)return;const list=dom.primaryList,top=row.offsetTop,bottom=top+row.offsetHeight,viewTop=list.scrollTop,viewBottom=viewTop+list.clientHeight;if(top<viewTop)list.scrollTop=Math.max(0,top-4);else if(bottom>viewBottom)list.scrollTop=Math.max(0,bottom-list.clientHeight+4);}
  function configureCadManagerSplitter(splitter,layersSection){
    const apply=()=>{layersSection.style.flexBasis=`${(state.inspectorSplit*100).toFixed(2)}%`;};
    apply();
    splitter.tabIndex=0;splitter.setAttribute('role','separator');splitter.setAttribute('aria-orientation','horizontal');splitter.setAttribute('aria-label',t('panel.resizeManagers'));
    let dragging=false,pointerId=null,containerRect=null;
    const move=e=>{if(!dragging||e.pointerId!==pointerId)return;const h=Math.max(1,containerRect.height-9),ratio=(e.clientY-containerRect.top)/h;state.inspectorSplit=clamp(ratio,.28,.78);apply();};
    const end=e=>{if(!dragging||e.pointerId!==pointerId)return;dragging=false;splitter.classList.remove('dragging');try{splitter.releasePointerCapture?.(pointerId);}catch(_){}persistInspectorSplit(state.inspectorSplit);pointerId=null;};
    splitter.addEventListener('pointerdown',e=>{e.preventDefault();dragging=true;pointerId=e.pointerId;containerRect=dom.primaryList.getBoundingClientRect();splitter.classList.add('dragging');splitter.setPointerCapture?.(pointerId);});
    splitter.addEventListener('pointermove',move);splitter.addEventListener('pointerup',end);splitter.addEventListener('pointercancel',end);
    splitter.addEventListener('dblclick',()=>{persistInspectorSplit(.64);apply();});
    splitter.addEventListener('keydown',e=>{if(e.key!=='ArrowUp'&&e.key!=='ArrowDown'&&e.key!=='Home')return;e.preventDefault();if(e.key==='Home')persistInspectorSplit(.64);else persistInspectorSplit(state.inspectorSplit+(e.key==='ArrowDown'?.04:-.04));apply();});
  }
  function renderCadLayersPanel(){
    const oldLayerList=dom.primaryList.querySelector('.cad-layer-list');
    const oldRegionList=dom.primaryList.querySelector('.cad-region-list');
    const previousLayerScroll=oldLayerList?.scrollTop||0;
    const previousRegionScroll=oldRegionList?.scrollTop||0;
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
    dom.primaryList.className='panel-list cad-primary-layout';

    const layersSection=document.createElement('section');
    layersSection.className='cad-manager-section cad-layer-manager';
    layersSection.style.flexBasis=`${(state.inspectorSplit*100).toFixed(2)}%`;
    const layerList=document.createElement('div');
    layerList.className='cad-layer-list';
    layersSection.appendChild(layerList);

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
      layerList.appendChild(empty);
    }else{
      for(const[layer,count]of entries){
        if(filter&&!layer.toLocaleLowerCase().includes(filter)&&!selectedLayers.has(layer))continue;
        shown++;
        if(!state.cadLayerVisibility.has(layer))state.cadLayerVisibility.set(layer,true);
        const visible=cadLayerVisible(layer),row=document.createElement('div');
        const filterForced=Boolean(filter&&selectedLayers.has(layer)&&!layer.toLocaleLowerCase().includes(filter));
        row.className=`list-row cad-layer-row ${selectedLayers.has(layer)?'selected':''} ${filterForced?'filter-forced':''}`.trim();
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
        layerList.appendChild(row);
      }
      if(!shown){
        const empty=document.createElement('div');
        empty.className='section-copy';
        empty.textContent=t('panel.noLayerMatches');
        layerList.appendChild(empty);
      }
    }

    const regionSection=document.createElement('section');
    regionSection.className='cad-manager-section cad-region-manager';
    const regionHeader=document.createElement('div');
    regionHeader.className='cad-section-header';
    const regionHeading=document.createElement('div');
    regionHeading.className='section-heading';
    regionHeading.textContent=t('region.section');
    const add=document.createElement('button');
    add.className='mini-action region-compact-add';
    add.textContent=t('action.defineRegionShort');
    add.addEventListener('click',()=>setTool('region','select'));
    regionHeader.append(regionHeading,add);
    const regionList=document.createElement('div');
    regionList.className='cad-region-list';

    if(!state.drawingRegions.length){
      const empty=document.createElement('div');
      empty.className='section-copy region-empty-copy';
      empty.textContent=t('region.noneCompact');
      regionList.appendChild(empty);
    }
    for(const region of state.drawingRegions){
      const row=document.createElement('div');
      row.className=`region-row compact ${state.selectedRegionId===region.id?'selected':''}`;
      row.dataset.region=region.id;
      const main=document.createElement('button');
      main.className='region-main compact';
      main.innerHTML=`<strong title="${escapeHtml(region.name)}">${escapeHtml(region.name)}</strong><span>${escapeHtml(t('region.entities',{count:regionObjectCount(region).toLocaleString()}))}</span>`;
      main.addEventListener('click',()=>{state.selectedRegionId=region.id;renderCadLayersPanel();render();});
      main.addEventListener('dblclick',e=>{e.preventDefault();renameRegion(region);});
      const more=document.createElement('button');
      more.className='region-more';
      more.type='button';
      more.setAttribute('aria-label',t('action.more'));
      more.textContent='⋯';
      more.addEventListener('click',e=>{e.stopPropagation();showRegionActionMenu(region,more);});
      row.append(main,more);
      regionList.appendChild(row);
    }
    regionSection.append(regionHeader,regionList);
    const splitter=document.createElement('div');splitter.className='cad-manager-splitter';configureCadManagerSplitter(splitter,layersSection);
    dom.primaryList.append(layersSection,splitter,regionSection);

    requestAnimationFrame(()=>{
      regionList.scrollTop=previousRegionScroll;
      layerList.scrollTop=previousLayerScroll;
      if(selectedLayer){
        const row=layerList.querySelector(`[data-layer="${CSS.escape(selectedLayer)}"]`);
        if(row&&state.layerRevealRequested){
          const target=row.offsetTop-(layerList.clientHeight-row.offsetHeight)/2;
          layerList.scrollTop=Math.max(0,Math.min(target,layerList.scrollHeight-layerList.clientHeight));
          state.layerRevealRequested=false;
        }
      }
    });
  }

  function cadLayerForObject(obj){const m=state.cadMapping||defaultCadMapping();if(obj.type==='wall')return m.wallLayer;if(obj.type==='door')return m.doorLayer;if(obj.type==='window')return m.windowLayer;if(obj.type==='dimension')return m.dimensionLayer;return obj.cadLayer||'0';}

  function renderReferences(){dom.referenceList.innerHTML='';if(state.toolset==='plan'){renderPlanPalette();return;}if(!state.references.length){dom.referenceList.innerHTML=`<div class="section-copy">${escapeHtml(t('panel.noReferences'))}</div>`;return;}for(const r of state.references){const row=document.createElement('div');row.className=`list-row ${state.selectedReferenceId===r.id?'selected':''}`;const eye=document.createElement('button');eye.className='eye-button';configureVisibilityButton(eye,r.visible,'reference');eye.addEventListener('click',e=>{e.stopPropagation();r.visible=!r.visible;markDirty(true);renderReferences();render();});const main=document.createElement('div');main.className='row-main';let meta='';if(r.type==='dxf')meta=`${t('panel.entities',{count:r.entities.length.toLocaleString()})} · ${r.sourceUnitSpecified?r.sourceUnit:t('panel.unitUnspecified')}${r.outlierCount?` · ${t('document.outliers',{count:r.outlierCount.toLocaleString()})}`:''}`;else if(r.type==='linkedCadRegion'){const region=state.drawingRegions.find(x=>x.id===r.regionId);meta=region?t('region.linkedReference',{name:region.name,layers:r.visibleLayers?.size||0}):t('region.missing');}else meta=`${r.width}×${r.height}px`;main.innerHTML=`<div class="row-title">${escapeHtml(r.name)}</div><div class="row-meta">${escapeHtml(meta)}</div>`;const actions=document.createElement('div');actions.className='row-actions';if(r.type!=='linkedCadRegion'){const calibrate=document.createElement('button');calibrate.className='mini-action';calibrate.textContent=t('action.scale');calibrate.dataset.tooltipTitle=t('action.scale');calibrate.dataset.tooltipKey='tooltip.scaleReference';calibrate.addEventListener('click',e=>{e.stopPropagation();beginCalibration(r.id);});actions.append(calibrate);}else{const refresh=document.createElement('button');refresh.className='mini-action';refresh.textContent=t('action.refreshLayers');refresh.addEventListener('click',e=>{e.stopPropagation();const region=state.drawingRegions.find(x=>x.id===r.regionId),layers=visibleCadLayers(region||null);r.layers=[...layers];r.visibleLayers=new Set(layers);markDirty(true);renderReferences();render();});actions.append(refresh);}const fit=document.createElement('button');fit.className='mini-action';fit.textContent=t('action.fit');fit.addEventListener('click',e=>{e.stopPropagation();fitReference(r);});actions.append(fit);if(r.type==='dxf'&&r.outlierCount>0){const full=document.createElement('button');full.className='mini-action';full.textContent=t('action.fitAllEntities');full.addEventListener('click',e=>{e.stopPropagation();fitReferenceFull(r);});actions.append(full);}row.addEventListener('click',()=>{state.selectedReferenceId=r.id;state.selectedObjectId=null;renderReferences();renderProperties();});row.append(eye,main,actions);dom.referenceList.appendChild(row);const control=document.createElement('div');control.className='panel-section';control.innerHTML=`<div class="property-row"><div class="property-label">${escapeHtml(t('panel.opacity'))}</div><div class="property-value"><input type="range" min="0.05" max="1" step="0.05" value="${r.opacity}"></div></div>`;control.querySelector('input').addEventListener('input',e=>{r.opacity=Number(e.target.value);markDirty(true);render();});dom.referenceList.appendChild(control);if(r.type==='dxf'||r.type==='linkedCadRegion')renderReferenceLayerControls(r);}}

  function renderReferenceLayerControls(ref){const section=document.createElement('div');section.className='panel-section';const heading=document.createElement('div');heading.className='section-heading';heading.textContent=t('panel.dxfLayers',{count:ref.layers.length});section.appendChild(heading);const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px;margin:8px 0;';const all=document.createElement('button');all.className='mini-action';all.textContent=t('action.all');const none=document.createElement('button');none.className='mini-action';none.textContent=t('action.none');all.addEventListener('click',()=>{ref.visibleLayers=new Set(ref.layers);renderReferences();render();});none.addEventListener('click',()=>{ref.visibleLayers=new Set();renderReferences();render();});actions.append(all,none);section.appendChild(actions);const list=document.createElement('div');list.style.cssText='display:grid;gap:5px;max-height:220px;overflow:auto;';for(const layer of ref.layers){const label=document.createElement('label');label.style.cssText='display:grid;grid-template-columns:auto minmax(0,1fr);gap:7px;align-items:center;font-size:9.5px;color:var(--text-2);';const cb=document.createElement('input');cb.type='checkbox';cb.checked=ref.visibleLayers.has(layer);cb.addEventListener('change',()=>{cb.checked?ref.visibleLayers.add(layer):ref.visibleLayers.delete(layer);render();});const text=document.createElement('span');text.textContent=layer;text.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';label.append(cb,text);list.appendChild(label);}section.appendChild(list);dom.referenceList.appendChild(section);}
  function iconMarkup(name){return`<span class="ui-icon icon-${name}" aria-hidden="true"></span>`;}
  function renderPlanPalette(){dom.referenceList.innerHTML='';const grid=document.createElement('div');grid.className='palette-grid';const items=[['door','door','tool.door'],['window','window','tool.window'],['space','space','tool.space']];for(const [tool,icon,key] of items){const b=document.createElement('button');b.className='palette-item';b.innerHTML=`<span class="ui-icon icon-${icon}" aria-hidden="true"></span><span>${escapeHtml(t(key))}</span>`;b.addEventListener('click',()=>{if(tool==='door'){const rail=dom.toolRail.querySelector('.tool-category[data-category="architecture"]');if(rail)openPlanDoorPalette(rail);else setTool('door','architecture');}else setTool(tool,'architecture');});grid.append(b);}dom.referenceList.append(grid);const floor=activeFloor(),region=floor?.sourceRegionId?state.drawingRegions.find(r=>r.id===floor.sourceRegionId):null;if(region){const ref=state.references.find(r=>r.type==='linkedCadRegion'&&r.regionId===region.id);const section=document.createElement('div');section.className='floor-reference-section';section.innerHTML=`<div class="section-heading">${escapeHtml(t('panel.referenceOpacity'))}</div>`;const range=document.createElement('input');range.type='range';range.min='.05';range.max='1';range.step='.05';range.value=String(ref?.opacity??.35);range.addEventListener('input',()=>{if(ref){ref.opacity=Number(range.value);markDirty(true);render();}});section.append(range);dom.referenceList.append(section);}}

  function configureVisibilityButton(button,visible,kind){const showKey=kind==='reference'?'tooltip.showReference':'tooltip.showLayer',hideKey=kind==='reference'?'tooltip.hideReference':'tooltip.hideLayer';button.innerHTML=iconMarkup(visible?'eye':'eye-off');button.setAttribute('aria-label',t(visible?hideKey:showKey));button.dataset.tooltipTitleKey=visible?hideKey:showKey;delete button.dataset.tooltipKey;delete button.dataset.shortcut;}

  function localizedObjectType(type){if(state.toolset==='plan'&&type==='wall')return t('value.planEdge');const key=type==='cadLine'?'value.cadLine':`value.${type}`;return t(key);}
  function localizedToolName(tool){const keys={select:'tool.select',constraint:'tool.constraint',line:'tool.line',wall:'tool.wall',door:'tool.door',window:'tool.window',space:'tool.space',region:'tool.region',measure:'tool.measure',trim:'tool.trim',extend:'tool.extend',delete:'tool.delete'};return t(keys[tool]||`tool.${tool}`);}
  function wallConstraintSummary(wall){const c=ensureWallConstraints(wall),parts=[];if(c.reference)parts.push(t(`constraint.${c.reference.type}`));if(c.orientation)parts.push(t(`constraint.${c.orientation}`));if(Number.isFinite(c.fixedAngle))parts.push(t('constraint.fixedAngleValue',{value:formatNumber(c.fixedAngle,1)}));if(Number.isFinite(c.fixedLength))parts.push(t('constraint.fixedLengthValue',{value:formatNumber(c.fixedLength,1)}));if(c.fixed)parts.push(t('constraint.fixed'));for(const ep of['a','b']){const att=wall.attachments?.[ep];if(att)parts.push(t(att.kind==='coincident'?'constraint.endpointCoincident':'constraint.pointOnLine',{endpoint:ep.toUpperCase()}));}return parts.length?parts.join(' · '):t('constraint.none');}
  function renderProperties(){dom.propertiesPanel.innerHTML='';const ids=selectionIds();if(ids.size>1){propertyText(t('property.selection'),t('value.objectsSelected',{count:ids.size}));if(state.toolset==='cad'){const layers=new Set([...ids].map(id=>state.objects.find(o=>o.id===id)).filter(Boolean).filter(o=>o.type!=='space').map(cadLayerForObject));propertyText(t('property.layers'),layers.size?`${layers.size}`:'—');}return;}const onlyId=ids.size===1?[...ids][0]:state.selectedObjectId,obj=state.objects.find(o=>o.id===onlyId);if(obj){state.selectedObjectId=obj.id;propertyText(t('property.type'),localizedObjectType(obj.type));
      if(state.toolset==='cad'&&obj.type!=='space'){const layer=cadLayerForObject(obj);propertyText(t('property.layer'),layer);propertyActions([{label:cadLayerVisible(layer)?t('action.hideLayer'):t('action.showLayer'),run:()=>setCadLayerVisibilityUndoable(layer,!cadLayerVisible(layer))},{label:t('action.soloLayer'),run:()=>soloLayer(layer)},{label:t('action.showInLayers'),run:()=>{state.layerRevealRequested=true;switchInspector('primary');renderCadLayersPanel();}}]);}
      if(((obj.type==='wall'&&!isArcWall(obj))||obj.type==='line'||obj.type==='cadLine')&&obj.a&&obj.b){propertyNumber(t('property.length'),distance(obj.a,obj.b),v=>{if(v>0){if(obj.type==='wall'){setWallLengthConstraintFromInput(obj,v);return;}pushHistory();const ang=rad(angleDeg(obj.a,obj.b));obj.b={x:obj.a.x+Math.cos(ang)*v,y:obj.a.y+Math.sin(ang)*v};markDirty(true);rebuildObjectSnapIndex();updateAll();}},'mm');propertyNumber(t('property.angle'),angleDeg(obj.a,obj.b),v=>{if(Number.isFinite(v)){if(obj.type==='wall'){setWallAngleConstraintFromInput(obj,v);return;}pushHistory();const len=distance(obj.a,obj.b),a=rad(v);obj.b={x:obj.a.x+Math.cos(a)*len,y:obj.a.y+Math.sin(a)*len};markDirty(true);rebuildObjectSnapIndex();updateAll();}},'°');propertyText(t('property.start'),`${formatNumber(obj.a.x,1)}, ${formatNumber(obj.a.y,1)}`);propertyText(t('property.end'),`${formatNumber(obj.b.x,1)}, ${formatNumber(obj.b.y,1)}`);}
      if(obj.type==='wall'){
        propertyText(t(state.toolset==='plan'?'property.edgeType':'property.wallType'),t(state.toolset==='plan'?(isArcWall(obj)?'edgeType.arc':'edgeType.straight'):(isArcWall(obj)?'wallType.arc':'wallType.straight')));
        if(isArcWall(obj)){propertyText(t('property.length'),`${formatNumber(wallLength(obj),2)} mm`);propertyText(t('property.radius'),`${formatNumber(obj.radius,2)} mm`);}
        propertyNumber(t('property.thickness'),obj.thickness,v=>{if(v>0){pushHistory();obj.thickness=v;markDirty(true);updateAll();}},'mm');
        const connected=Boolean(obj.attachments?.a||obj.attachments?.b),c=ensureWallConstraints(obj);propertyText(t('property.joint'),connected?t('value.connected'):t('value.free'));propertyText(t('property.baseAxis'),`${formatNumber(baseAxisAngle(),1)}°${state.baseAxisWallId===obj.id?` · ${t('value.thisWall')}`:''}`);
        const items=[];
        if(c.reference){const ref=state.objects.find(o=>o.id===c.reference.wallId);items.push({label:`${t(`constraint.${c.reference.type}`)} · ${t('constraint.referenceWall',{name:ref?.id||c.reference.wallId})}`,run:()=>removeWallConstraint(obj,'reference')});}
        if(c.orientation)items.push({label:t(`constraint.${c.orientation}`),run:()=>removeWallConstraint(obj,'orientation')});
        if(Number.isFinite(c.fixedAngle))items.push({label:t('constraint.fixedAngleValue',{value:formatNumber(angleDeg(obj.a,obj.b),1)}),run:()=>removeWallConstraint(obj,'angle')});
        if(Number.isFinite(c.fixedLength))items.push({label:t('constraint.fixedLengthValue',{value:formatNumber(c.fixedLength,1)}),run:()=>removeWallConstraint(obj,'length')});
        if(c.fixed)items.push({label:t('constraint.fixed'),run:()=>removeWallConstraint(obj,'fixed')});
        for(const ep of ['a','b']){const att=obj.attachments?.[ep];if(att)items.push({label:`${ep.toUpperCase()} · ${t(att.kind==='coincident'?'constraint.endpointCoincident':'constraint.pointOnLine')}`,run:()=>removeWallConstraint(obj,'attachment',ep)});}
        if(state.baseAxisWallId===obj.id)items.push({label:t('constraint.baseAxis'),run:clearBaseAxis});
        propertyConstraintList(items);
      }
      if(obj.type==='door'||obj.type==='window'){propertyNumber(t('property.width'),obj.width,v=>{if(v>0){pushHistory();obj.width=v;markDirty(true);rebuildObjectSnapIndex();updateAll();}},'mm');if(obj.type==='door'){const dt=obj.doorType||'hingedSingle';propertyText(t('property.doorType'),t(`doorType.${dt}`));if(dt.startsWith('hinged')){propertyText(t('property.openingSide'),`${obj.hinge==='end'?t('value.hingeEnd'):t('value.hingeStart')} · ${obj.swing===-1?t('value.swingReverse'):t('value.swingNormal')}`);propertyActions([{label:t('action.flipHinge'),run:()=>{pushHistory();obj.hinge=obj.hinge==='end'?'start':'end';markDirty(true);updateAll();}},{label:t('action.flipSwing'),run:()=>{pushHistory();obj.swing=obj.swing===-1?1:-1;markDirty(true);updateAll();}}]);}else propertyActions([{label:t('action.flipSlide'),run:()=>{pushHistory();obj.slideDirection=obj.slideDirection===-1?1:-1;markDirty(true);updateAll();}}]);}}
      if(obj.type==='dimension'){const g=dimensionGeometry(obj);if(g){if(g.associated)propertyNumber(t('property.length'),g.len,v=>applyNumericLabelEdit({objectId:obj.id,kind:'dimensionLength'},v),'mm');else propertyText(t('property.length'),`${formatNumber(g.len,2)} mm`);if(g.associated)propertyText(t('property.association'),t('value.wallLinked'));propertyNumber(t('property.offset'),g.offset,v=>{pushHistory();obj.offset=v;markDirty(true);updateAll();},'mm');}}
      if(obj.type==='space'){propertyText(t('property.area'),`${formatNumber(obj.areaM2||Math.abs(polygonArea(obj.polygon||[]))/1e6,2)} m²`);propertyText(t('property.spaceId'),obj.spaceUuid||'—');propertyText(t('property.boundaryWalls'),String(obj.wallIds?.length||0));if(obj.invalid)propertyText(t('property.status'),t('space.invalid'));}
      if(obj.type==='stair'){propertyText(t('property.treads'),String(obj.treadCount||'—'));propertyText(t('property.status'),obj.recognizedFromCad?t('value.recognizedFromCad'):t('value.free'));}
      if(obj.type==='cadCircle')propertyText(t('property.length'),`R ${formatNumber(obj.radius,2)} mm`);if(obj.source)propertyText(t('property.source'),obj.source);return;}
    const ref=state.references.find(r=>r.id===state.selectedReferenceId);if(ref){propertyText(t('property.reference'),ref.name);propertyText(t('property.type'),ref.type==='dxf'?'DXF':ref.type==='linkedCadRegion'?t('value.linkedCadReference'):t('value.image'));if(ref.type==='linkedCadRegion'){const region=state.drawingRegions.find(x=>x.id===ref.regionId);if(region)propertyText(t('property.region'),region.name);propertyText(t('property.layers'),String(ref.visibleLayers?.size||0));}else{propertyText(t('property.scale'),`${formatNumber(ref.scale,6)}×`);propertyText(t('property.origin'),`${formatNumber(ref.origin.x,1)}, ${formatNumber(ref.origin.y,1)}`);}propertyText(t('property.opacity'),`${Math.round(ref.opacity*100)}%`);return;}
    if(state.toolset==='plan'){ensureFloorModel();propertyText(t('property.floor'),activeFloor()?.name||'—');propertyText(t('property.document'),currentDocumentName());propertyText(t('property.units'),INTERNAL_UNIT);return;}propertyText(t('property.version'),`v${VERSION} · Build ${BUILD}`);propertyText(t('property.document'),currentDocumentName());propertyText(t('property.toolset'),t('value.cadTools'));propertyText(t('property.units'),INTERNAL_UNIT);propertyText(t('property.tool'),localizedToolName(state.activeTool));propertyText(t('property.baseAxis'),`${formatNumber(baseAxisAngle(),1)}°`);if(state.cadMapping)propertyText(t('property.mapping'),mappingSummary());}
  function propertyActions(items){const actions=document.createElement('div');actions.className='property-actions';for(const item of items){const b=document.createElement('button');b.className='property-action';b.textContent=item.label;b.addEventListener('click',item.run);actions.appendChild(b);}dom.propertiesPanel.appendChild(actions);}
  function propertyConstraintList(items){const section=document.createElement('div');section.className='constraint-property-section';const heading=document.createElement('div');heading.className='section-heading';heading.textContent=t('property.constraints');section.appendChild(heading);if(!items.length){const empty=document.createElement('div');empty.className='section-copy';empty.textContent=t('constraint.none');section.appendChild(empty);}for(const item of items){const row=document.createElement('div');row.className='constraint-property-row';const text=document.createElement('span');text.textContent=item.label;const remove=document.createElement('button');remove.className='constraint-remove';remove.textContent=t('action.removeConstraint');remove.addEventListener('click',item.run);row.append(text,remove);section.appendChild(row);}dom.propertiesPanel.appendChild(section);}

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
  function updateAll(){ensureFloorModel();updateUndoRedo();updateEmptyState();updateContextBar();updateDocumentStatus();updateCompactViewerState();updateAxisStatus();renderToolRail();renderPrimaryPanel();renderReferences();renderProperties();render();}

  function resetProject(){if(state.dirty&&!confirm(t('confirm.newDrawing')))return;state.references=[];state.objects=[];state.drawingRegions=[];state.selectedRegionId=null;state.wallRecognitionPreview=null;state.selectedReferenceId=null;state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectionDrag=null;state.hoveredObjectId=null;state.layerFilter='';state.baseAxisAngle=0;state.baseAxisWallId=null;state.history=[];state.future=[];state.nextId=1;state.camera={cx:0,cy:0,zoom:.12};state.cadMapping=null;state.cadLayerVisibility=new Map([['0',true]]);state.activeCadLayer='0';state.sourceDxfName=null;state.sourceDxfFingerprint=null;state.sourceDxfSize=0;state.sourceDxfLastModified=0;state.sourceDxfMainBounds=null;state.sourceDxfFullBounds=null;state.sourceDxfOutlierCount=0;state.projectFileName=null;state.projectFileHandle=null;state.projectLocalKey=null;state.recognitionHistory=[];state.floors=[{id:'floor_1',name:'1F',sourceRegionId:null}];state.activeFloorId='floor_1';state.dirty=false;rebuildObjectSnapIndex();setTool('select',state.toolset==='plan'?'plan':'select');updateAll();}

  function createSample(){if(state.dirty&&!confirm(t('confirm.newDrawing')))return;state.references=[];state.objects=[];state.drawingRegions=[];state.selectedRegionId=null;state.wallRecognitionPreview=null;state.selectedObjectIds.clear();state.selectionDrag=null;state.layerFilter='';state.baseAxisAngle=0;state.baseAxisWallId=null;state.history=[];state.future=[];state.nextId=1;const wall=(a,b,th=150)=>{const o={id:uid('wall'),type:'wall',layerId:'walls',a,b,thickness:th,geometry:'straight',attachments:{}};state.objects.push(o);return o;};const outer=[wall({x:0,y:0},{x:8000,y:0},180),wall({x:8000,y:0},{x:8000,y:6000},180),wall({x:8000,y:6000},{x:0,y:6000},180),wall({x:0,y:6000},{x:0,y:0},180)];const innerV=wall({x:4200,y:0},{x:4200,y:6000},150),innerH=wall({x:0,y:3100},{x:4200,y:3100},150);attachWallEndpoint(innerV,'a');attachWallEndpoint(innerV,'b');attachWallEndpoint(innerH,'a');attachWallEndpoint(innerH,'b');state.objects.push({id:uid('door'),type:'door',layerId:'doors',wallId:innerV.id,t:.48,width:900,doorType:'hingedSingle',hinge:'start',swing:1,slideDirection:1},{id:uid('window'),type:'window',layerId:'windows',wallId:outer[2].id,t:.7,width:1600},{id:uid('window'),type:'window',layerId:'windows',wallId:outer[0].id,t:.25,width:1200},{id:uid('dimension'),type:'dimension',layerId:'dimensions',wallId:outer[0].id,t1:0,t2:1,offset:-650},{id:uid('cadLine'),type:'cadLine',cadLayer:'AXIS',a:{x:4200,y:-900},b:{x:4200,y:6900},source:'sample DXF'});state.cadLayerVisibility=new Map([['0',true],['AXIS',true]]);state.cadMapping=null;state.sourceDxfName=null;state.sourceDxfMainBounds=null;state.sourceDxfFullBounds=null;state.sourceDxfOutlierCount=0;state.projectFileName=null;state.projectFileHandle=null;state.projectLocalKey=null;state.dirty=false;state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectedReferenceId=null;rebuildObjectSnapIndex();switchToolset('plan',{skipMapping:true});updateAll();fitAll();}

  function runCommand(raw){const command=String(raw||'').trim().toUpperCase();if(!command){if(state.commandPending){setCommandStatus(t('command.finished'),'strong');state.commandPending=null;return;}if(state.lastCommand){return runCommand(state.lastCommand);}setCommandStatus(t('command.noPrevious'),'strong');dom.commandInput.focus();return;}
    if(state.commandPending==='zoom'){if(command==='E'||command==='EXTENTS'){fitAll();setCommandStatus(t('command.zoomExtents'),'strong');state.commandPending=null;return;}setCommandStatus(t('command.unknown',{command}),'error');return;}
    const plan=state.toolset==='plan';
    if(command==='L'||command==='LINE'){state.lastCommand='L';setTool('line','draw');setCommandStatus(t('command.line'),'strong');}
    else if(command==='TR'||command==='TRIM'){state.lastCommand='TR';setTool('trim','modify');setCommandStatus(t('command.trim'),'strong');}
    else if(command==='EX'||command==='EXTEND'){state.lastCommand='EX';setTool('extend','modify');setCommandStatus(t('command.extend'),'strong');}
    else if(command==='E'||command==='ERASE'){state.lastCommand='E';if(selectionIds().size){deleteSelectedObjects();setCommandStatus('ERASE','strong');}else{setTool('delete','modify');setCommandStatus(t('command.erase'),'strong');}}
    else if(command==='DI'||command==='DIST'){state.lastCommand='DI';setTool('measure',plan?'select':'dimension');setCommandStatus(t('command.distance'),'strong');}
    else if((command==='M'||command==='MOVE')&&plan){state.lastCommand='M';setTool('move','modify');setCommandStatus(t('command.move'),'strong');}
    else if((command==='CO'||command==='COPY')&&plan){state.lastCommand='CO';setTool('copy','modify');setCommandStatus(t('command.copy'),'strong');}
    else if(command==='Z'||command==='ZOOM'){state.lastCommand='Z';state.commandPending='zoom';setCommandStatus(t('command.zoom'),'strong');}
    else if(command==='U'||command==='UNDO'){state.lastCommand='U';undo();setCommandStatus(t('command.undo'),'strong');}
    else if(command==='REDO'){state.lastCommand='REDO';redo();setCommandStatus(t('command.redo'),'strong');}
    else if(command==='S'||command==='STRETCH'){setCommandStatus(t('command.stretchNotReady'),'error');}
    else if(command==='WALL'){state.lastCommand=plan?'L':'WALL';setTool(plan?'line':'wall',plan?'draw':'architecture');if(plan||state.cadMapping)setCommandStatus(plan?t('command.line'):'WALL','strong');}
    else if(command==='DOOR'){state.lastCommand='DOOR';setTool('door','architecture');if(plan||state.cadMapping)setCommandStatus('DOOR','strong');}
    else if(command==='WINDOW'){state.lastCommand='WINDOW';setTool('window','architecture');if(plan||state.cadMapping)setCommandStatus('WINDOW','strong');}
    else setCommandStatus(t('command.unknown',{command}),'error');}

  function finishContinuousCommand(){if(state.activeTool==='line'){state.drawStart=null;state.drawReferenceAngle=null;state.previewEnd=null;setTool('select','select');setCommandStatus(t('command.finished'),'strong');return true;}return false;}
  function setCommandStatus(text,kind=''){dom.commandStatus.className=`command-status ${kind}`.trim();dom.commandStatus.textContent=text;dom.commandStatus.classList.toggle('visible',Boolean(kind)||text!==t('command.ready'));}

  function dxfPair(code,value){return`${code}\n${value}\n`;}
  function sanitizeLayer(name){return String(name||'0').replace(/[<>\\/:;?*|=",]/g,'_').slice(0,255)||'0';}
  function dxfLine(layer,a,b){return dxfPair(0,'LINE')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,a.x.toFixed(4))+dxfPair(20,a.y.toFixed(4))+dxfPair(30,'0')+dxfPair(11,b.x.toFixed(4))+dxfPair(21,b.y.toFixed(4))+dxfPair(31,'0');}
  function dxfCircle(layer,c,r){return dxfPair(0,'CIRCLE')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,c.x.toFixed(4))+dxfPair(20,c.y.toFixed(4))+dxfPair(30,'0')+dxfPair(40,r.toFixed(4));}
  function dxfArc(layer,c,r,startDeg,endDeg){return dxfPair(0,'ARC')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,c.x.toFixed(4))+dxfPair(20,c.y.toFixed(4))+dxfPair(30,'0')+dxfPair(40,r.toFixed(4))+dxfPair(50,startDeg.toFixed(6))+dxfPair(51,endDeg.toFixed(6));}
  function dxfText(layer,p,text,height=180,rotation=0){return dxfPair(0,'TEXT')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,p.x.toFixed(4))+dxfPair(20,p.y.toFixed(4))+dxfPair(30,'0')+dxfPair(40,Number(height||180).toFixed(2))+dxfPair(50,Number(rotation||0).toFixed(4))+dxfPair(1,String(text).replace(/[\r\n]/g,' '));}
  function dxfDoorEntities(obj,layer){
    const g=openingGeometry(obj);if(!g)return'';const type=obj.doorType||'hingedSingle',swing=obj.swing===-1?-1:1,dir=obj.slideDirection===-1?-1:1;let out='';
    const emitLeaf=(hinge,other)=>{const width=Math.max(1,distance(hinge,other)),closed={x:(other.x-hinge.x)/width,y:(other.y-hinge.y)/width},open=rotate90(closed,swing),leaf={x:hinge.x+open.x*width,y:hinge.y+open.y*width};out+=dxfLine(layer,hinge,leaf);let a0=(Math.atan2(closed.y,closed.x)*180/Math.PI+360)%360,a1=(a0+swing*90+360)%360;if(swing<0)[a0,a1]=[a1,a0];out+=dxfArc(layer,hinge,width,a0,a1);};
    if(type==='hingedSingle'){const hinge=obj.hinge==='end'?g.p2:g.p1,other=obj.hinge==='end'?g.p1:g.p2;emitLeaf(hinge,other);}
    else if(type==='hingedDouble'){const mid=wallPointAt(g.wall,(g.t1+g.t2)/2);emitLeaf(g.p1,mid);emitLeaf(g.p2,mid);}
    else if(type==='slidingSingle'||type==='pocket'){const wallHalf=(g.wall.thickness||150)/2,off=(type==='pocket'?.22:.72)*wallHalf*dir,panelLen=g.width*.82,shift=dir*g.width*.34,center=wallPointAt(g.wall,clamp((obj.t??.5)+shift/Math.max(wallLength(g.wall),1),0,1)),tg=wallTangentAt(g.wall,obj.t??.5),a={x:center.x-tg.ux*panelLen/2+g.nx*off,y:center.y-tg.uy*panelLen/2+g.ny*off},b={x:center.x+tg.ux*panelLen/2+g.nx*off,y:center.y+tg.uy*panelLen/2+g.ny*off};out+=dxfLine(layer,a,b);if(type==='pocket')out+=dxfLine(layer,g.p1,g.p2);}
    else if(type==='slidingDouble'){const wallHalf=(g.wall.thickness||150)/2,off=.68*wallHalf*dir,tg=wallTangentAt(g.wall,obj.t??.5),half=g.width*.45;for(const sign of[-1,1]){const c={x:g.center.x+tg.ux*sign*g.width*.22+g.nx*off,y:g.center.y+tg.uy*sign*g.width*.22+g.ny*off};out+=dxfLine(layer,{x:c.x-tg.ux*half/2,y:c.y-tg.uy*half/2},{x:c.x+tg.ux*half/2,y:c.y+tg.uy*half/2});}}
    return out;
  }
  function exportDxf(){if(hasSemanticObjects()&&!state.cadMapping){openMappingDialog('export');return;}void exportDxfNow();}
  async function exportDxfNow(){const m=state.cadMapping||defaultCadMapping();let entities='';const layers=new Set(['0']);for(const o of state.objects){if(o.type==='cadLine'||o.type==='line'){const layer=o.cadLayer||'0';layers.add(layer);entities+=dxfLine(layer,o.a,o.b);}else if(o.type==='cadCircle'){const layer=o.cadLayer||'0';layers.add(layer);entities+=dxfCircle(layer,o.center,o.radius);}else if(o.type==='cadArc'){const layer=o.cadLayer||'0';layers.add(layer);entities+=dxfArc(layer,o.center,o.radius,o.startAngle||0,(o.startAngle||0)+(o.sweep||0));}else if(o.type==='cadText'){const layer=o.cadLayer||'0';layers.add(layer);entities+=dxfText(layer,o.point,o.text||'',o.height||180,o.rotation||0);}else if(o.type==='wall'){layers.add(m.wallLayer);if(m.wallRepresentation==='outline'||m.wallRepresentation==='both')for(const[a,b]of wallOutlineVisibleWorld(o))entities+=dxfLine(m.wallLayer,a,b);if(m.wallRepresentation==='centerline'||m.wallRepresentation==='both'){if(isArcWall(o)){let a0=normalizeAngle(o.startAngle||0),a1=normalizeAngle((o.startAngle||0)+(o.sweep||0));if((o.sweep||0)<0)[a0,a1]=[a1,a0];entities+=dxfArc(m.wallLayer,o.center,o.radius,a0,a1);}else entities+=dxfLine(m.wallLayer,o.a,o.b);}}else if(o.type==='door'){layers.add(m.doorLayer);entities+=dxfDoorEntities(o,m.doorLayer);}else if(o.type==='window'){/* emitted below */}else if(o.type==='dimension'){const g=dimensionGeometry(o);if(g){layers.add(m.dimensionLayer);entities+=dxfLine(m.dimensionLayer,g.d1,g.d2);entities+=dxfLine(m.dimensionLayer,g.p1,g.d1);entities+=dxfLine(m.dimensionLayer,g.p2,g.d2);entities+=dxfText(m.dimensionLayer,{x:(g.d1.x+g.d2.x)/2,y:(g.d1.y+g.d2.y)/2},`${formatNumber(g.len,1)} mm`,140);}}}
    // windows are added in a separate pass to keep the main loop readable after semantic conversion.
    for(const o of state.objects){if(o.type!=='window')continue;const g=openingGeometry(o);if(!g)continue;layers.add(m.windowLayer);const off=Math.min(50,(g.wall.thickness||150)*.35);for(const sign of[-1,1])entities+=dxfLine(m.windowLayer,{x:g.p1.x+g.nx*off*sign,y:g.p1.y+g.ny*off*sign},{x:g.p2.x+g.nx*off*sign,y:g.p2.y+g.ny*off*sign});}
    let layerTable=dxfPair(0,'TABLE')+dxfPair(2,'LAYER')+dxfPair(70,layers.size);for(const name of layers){layerTable+=dxfPair(0,'LAYER')+dxfPair(2,sanitizeLayer(name))+dxfPair(70,0)+dxfPair(62,7)+dxfPair(6,'CONTINUOUS');}layerTable+=dxfPair(0,'ENDTAB');
    const dxf=dxfPair(0,'SECTION')+dxfPair(2,'HEADER')+dxfPair(9,'$ACADVER')+dxfPair(1,'AC1009')+dxfPair(9,'$INSUNITS')+dxfPair(70,4)+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'TABLES')+layerTable+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'ENTITIES')+entities+dxfPair(0,'ENDSEC')+dxfPair(0,'EOF');
    const blob=new Blob([dxf],{type:'application/dxf;charset=utf-8'}),name=state.sourceDxfName?state.sourceDxfName.replace(/\.dxf$/i,'')+'_PieniPlan.dxf':`PieniPlan_v${VERSION}_Build${BUILD}.dxf`;await saveDxfBlob(blob,name);}

  const contextMenu=document.createElement('div');contextMenu.className='canvas-context-menu';contextMenu.hidden=true;document.body.appendChild(contextMenu);
  function hideContextMenu(){contextMenu.hidden=true;contextMenu.innerHTML='';}
  function addContextMenuItem(label,run,{danger=false,disabled=false}={}){const b=document.createElement('button');b.className=`context-menu-item ${danger?'danger':''}`;b.textContent=label;b.disabled=disabled;b.addEventListener('click',()=>{hideContextMenu();run();});contextMenu.appendChild(b);}
  function addContextMenuDivider(){const d=document.createElement('div');d.className='context-menu-divider';contextMenu.appendChild(d);}
  function duplicateObject(obj){if(!obj||obj.type==='space')return;pushHistory();const copy=JSON.parse(JSON.stringify(obj));copy.id=uid(obj.type);delete copy.recognizedFromCad;delete copy.sourceRegionId;delete copy.recognitionSourceIds;delete copy.recognitionConfidence;delete copy.recognitionBaselineSignature;delete copy.recognitionDetached;if(copy.type==='door'||copy.type==='window'){copy.t=clamp((copy.t??.5)+.08,0,1);}else if(copy.type==='dimension'){copy.offset=(copy.offset||0)+120;}else if(copy.a&&copy.b){copy.a.x+=200;copy.b.x+=200;if(copy.type==='wall')copy.attachments={};}else if(copy.type==='cadCircle')copy.center.x+=200;else if(copy.point)copy.point.x+=200;state.objects.push(copy);state.selectedObjectId=copy.id;markDirty(true);rebuildObjectSnapIndex();updateAll();}
  function showCanvasContextMenu(e){if(isCompactViewer())return;const ctrlSnapGesture=state.toolset==='plan'&&e.ctrlKey&&['line','wall','measure','move','copy','trim','extend'].includes(state.activeTool);e.preventDefault();if(ctrlSnapGesture)return;hideTooltip();const raw=screenCssToWorld(fromPointerEvent(e)),obj=hitObject(raw);if(obj){state.selectedObjectId=obj.id;state.selectedReferenceId=null;state.selectedRegionId=null;renderPrimaryPanel();renderProperties();render();addContextMenuItem(t('action.properties'),()=>switchInspector('properties'));if(obj.type==='door'){addContextMenuDivider();const dt=obj.doorType||'hingedSingle';if(dt.startsWith('hinged')){addContextMenuItem(t('action.flipHinge'),()=>{pushHistory();obj.hinge=obj.hinge==='end'?'start':'end';markDirty(true);updateAll();});addContextMenuItem(t('action.flipSwing'),()=>{pushHistory();obj.swing=obj.swing===-1?1:-1;markDirty(true);updateAll();});}else addContextMenuItem(t('action.flipSlide'),()=>{pushHistory();obj.slideDirection=obj.slideDirection===-1?1:-1;markDirty(true);updateAll();});}if(obj.type==='wall'){addContextMenuDivider();const connected=Boolean(obj.attachments?.a||obj.attachments?.b);addContextMenuItem(connected?t('action.detachJoint'):t('action.attachJoint'),()=>{pushHistory();if(connected)detachWallConnections(obj);else if(!attachTouchingWallEndpoints(obj)){state.history.pop();alert(t('alert.noJointNearby'));return;}markDirty(true);updateAll();});}
      if(state.toolset==='cad'&&obj.type!=='space'){const layer=cadLayerForObject(obj);addContextMenuDivider();addContextMenuItem(cadLayerVisible(layer)?t('action.hideLayer'):t('action.showLayer'),()=>setCadLayerVisibilityUndoable(layer,!cadLayerVisible(layer)));addContextMenuItem(t('action.soloLayer'),()=>soloLayer(layer));addContextMenuItem(t('action.showInLayers'),()=>{state.layerRevealRequested=true;switchInspector('primary');renderCadLayersPanel();});}
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
  function cancelTransient(){const wasDrawing=state.activeTool==='line'||state.activeTool==='trim'||state.activeTool==='extend'||state.activeTool==='move'||state.activeTool==='copy';state.drawStart=null;state.drawReferenceAngle=null;state.arcDraft=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;state.calibration=null;state.regionDrag=null;state.wallRecognitionPreview=null;state.selectionDrag=null;state.snapIndicator=null;state.trimPreview=null;state.commandPending=null;clearConstraintInteraction();if(state.activeTool==='constraint'||wasDrawing)state.activeTool='select';host.dataset.tool=state.activeTool;dom.toolPopover.hidden=true;dom.dialogBackdrop.hidden=true;dom.recognitionBackdrop.hidden=true;setCommandStatus(t('command.cancelled'));renderToolRail();updateContextBar();renderProperties();render();}

  dom.startPlanBtn.addEventListener('click',()=>switchToolset('plan',{skipMapping:true}));
  dom.startCadBtn.addEventListener('click',()=>switchToolset('cad',{skipMapping:true}));
  dom.startSampleBtn.addEventListener('click',createSample);
  dom.continueWorkBtn.addEventListener('click',async()=>{if(hasCurrentWork())switchToolset(state.toolset,{skipMapping:true});else if(state.browserSavedMeta)await openBrowserSavedProject();});
  dom.backBtn.addEventListener('click',()=>history.back());
  dom.homeBtn.addEventListener('click',()=>showStartScreen());
  dom.planToolsBtn.addEventListener('click',()=>switchToolset('plan'));
  dom.cadToolsBtn.addEventListener('click',()=>switchToolset('cad'));
  dom.appearanceBtn.addEventListener('click',e=>{e.stopPropagation();toggleAppearanceMenu(dom.appearanceBtn);});
  dom.startAppearanceBtn.addEventListener('click',e=>{e.stopPropagation();toggleAppearanceMenu(dom.startAppearanceBtn);});
  dom.viewMenuBtn?.addEventListener('click',e=>{e.stopPropagation();toggleTopMenu(dom.viewMenu,dom.viewMenuBtn);});
  dom.fileMenuBtn?.addEventListener('click',e=>{e.stopPropagation();toggleTopMenu(dom.fileMenu,dom.fileMenuBtn);});
  dom.settingsMenuBtn?.addEventListener('click',e=>{e.stopPropagation();toggleTopMenu(dom.settingsMenu,dom.settingsMenuBtn);});
  dom.viewFitAction?.addEventListener('click',()=>{closeTopMenus();fitAll();});
  dom.viewAllAction?.addEventListener('click',()=>{closeTopMenus();fitFullExtents();});
  dom.fileNewAction?.addEventListener('click',()=>{closeTopMenus();resetProject();});
  dom.fileOpenProjectAction?.addEventListener('click',()=>{closeTopMenus();chooseAndOpenProjectFile();});
  dom.fileSaveProjectAction?.addEventListener('click',()=>{closeTopMenus();saveProjectFile();});
  dom.fileDownloadProjectAction?.addEventListener('click',()=>{closeTopMenus();downloadProjectFile();});
  dom.fileOpenDxfAction?.addEventListener('click',()=>{closeTopMenus();dom.dxfEditFileInput.click();});
  dom.fileExportDxfAction?.addEventListener('click',()=>{closeTopMenus();exportDxf();});
  dom.helpBtn?.addEventListener('click',()=>openHelp());dom.aboutBtn?.addEventListener('click',openAbout);
  dom.helpCloseBtn?.addEventListener('click',()=>dom.helpBackdrop.hidden=true);dom.aboutCloseBtn?.addEventListener('click',()=>dom.aboutBackdrop.hidden=true);
  dom.helpBackdrop?.addEventListener('click',e=>{if(e.target===dom.helpBackdrop)dom.helpBackdrop.hidden=true;});dom.aboutBackdrop?.addEventListener('click',e=>{if(e.target===dom.aboutBackdrop)dom.aboutBackdrop.hidden=true;});
  document.querySelectorAll('.help-nav-item').forEach(b=>b.addEventListener('click',()=>openHelp(b.dataset.helpSection)));
  document.addEventListener('click',e=>{if(!e.target.closest('.top-menu')&&!e.target.closest('#viewMenuBtn')&&!e.target.closest('#fileMenuBtn')&&!e.target.closest('#settingsMenuBtn'))closeTopMenus();});
    document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{applyTheme(button.dataset.themeChoice);dom.appearanceMenu.hidden=true;if(dom.settingsMenu)dom.settingsMenu.hidden=true;}));
  document.querySelectorAll('.inspector-tab').forEach(b=>b.addEventListener('click',()=>switchInspector(b.dataset.tab)));

  dom.openProjectBtn.addEventListener('click',chooseAndOpenProjectFile);
  dom.projectFileInput.addEventListener('change',async()=>{const file=dom.projectFileInput.files?.[0];if(file)await openProjectFile(file);dom.projectFileInput.value='';});
  dom.saveProjectBtn.addEventListener('click',saveProjectFile);
  dom.openRefBtn.addEventListener('click',()=>dom.referenceFileInput.click());dom.emptyOpenBtn.addEventListener('click',()=>state.toolset==='cad'?dom.dxfEditFileInput.click():dom.referenceFileInput.click());dom.addReferenceBtn.addEventListener('click',()=>dom.referenceFileInput.click());
  dom.referenceFileInput.addEventListener('change',()=>openReferenceFile(dom.referenceFileInput.files?.[0]));
  dom.openDxfBtn.addEventListener('click',()=>dom.dxfEditFileInput.click());dom.dxfEditFileInput.addEventListener('change',()=>openEditableDxf(dom.dxfEditFileInput.files?.[0]));
  dom.fitBtn.addEventListener('click',fitAll);dom.fullExtentsBtn?.addEventListener('click',fitFullExtents);dom.newBtn.addEventListener('click',resetProject);dom.undoBtn.addEventListener('click',undo);dom.redoBtn.addEventListener('click',redo);dom.exportDxfBtn.addEventListener('click',exportDxf);
  dom.emptyPrimaryBtn.addEventListener('click',()=>setTool('line','draw'));
  dom.mappingSettingsBtn.addEventListener('click',()=>openMappingDialog('settings'));dom.mappingApplyBtn.addEventListener('click',applyMapping);dom.mappingCancelBtn.addEventListener('click',cancelMapping);dom.recognitionApplyBtn.addEventListener('click',applyWallRecognition);dom.recognitionCancelBtn.addEventListener('click',cancelWallRecognition);
  dom.gridToggle.addEventListener('click',()=>{state.grid=!state.grid;dom.gridToggle.classList.toggle('active',state.grid);render();});dom.snapToggle.addEventListener('click',()=>{state.snap=!state.snap;dom.snapToggle.classList.toggle('active',state.snap);});dom.orthoToggle.addEventListener('click',()=>{state.ortho=!state.ortho;dom.orthoToggle.classList.toggle('active',state.ortho);render();});dom.polarToggle.addEventListener('click',()=>{state.polar=!state.polar;dom.polarToggle.classList.toggle('active',state.polar);render();});
  dom.dialogCancelBtn.addEventListener('click',()=>{dom.dialogBackdrop.hidden=true;state.calibration=null;state.previewEnd=null;updateAll();});dom.dialogApplyBtn.addEventListener('click',applyCalibration);dom.dialogInput.addEventListener('keydown',e=>{if(e.key==='Enter')applyCalibration();if(e.key==='Escape')dom.dialogCancelBtn.click();});
  dom.confirmCancelBtn.addEventListener('click',hideAppConfirm);dom.confirmApplyBtn.addEventListener('click',()=>{const fn=state.confirmAction;hideAppConfirm();if(fn)fn();});dom.confirmBackdrop.addEventListener('pointerdown',e=>{if(e.target===dom.confirmBackdrop)hideAppConfirm();});
  dom.exportSaveCancelBtn?.addEventListener('click',closeDxfFallbackSaveDialog);dom.exportSaveApplyBtn?.addEventListener('click',applyDxfFallbackSave);dom.exportSaveBackdrop?.addEventListener('pointerdown',e=>{if(e.target===dom.exportSaveBackdrop)closeDxfFallbackSaveDialog();});dom.exportSaveName?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyDxfFallbackSave();}else if(e.key==='Escape'){e.preventDefault();closeDxfFallbackSaveDialog();}});
  dom.commandInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const raw=dom.commandInput.value;dom.commandInput.value='';runCommand(raw);}else if(e.key==='Escape'){e.preventDefault();dom.commandInput.value='';cancelTransient();host.focus();}});

  canvas.addEventListener('pointermove',onPointerMove);canvas.addEventListener('pointerdown',onPointerDown);canvas.addEventListener('pointerup',onPointerUp);canvas.addEventListener('pointercancel',onPointerUp);canvas.addEventListener('dblclick',onCanvasDoubleClick);canvas.addEventListener('wheel',onWheel,{passive:false});canvas.addEventListener('contextmenu',showCanvasContextMenu);
  host.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});host.addEventListener('drop',e=>{e.preventDefault();const file=e.dataTransfer.files?.[0];if(file)openReferenceFile(file);});
  window.addEventListener('resize',()=>{updateCompactViewerState();resizeCanvas();});
  window.addEventListener('popstate',e=>applyRoute(e.state));
  window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change',()=>{if(state.theme==='system'){updateThemeMeta();render();}});
  window.addEventListener('keydown',e=>{
    if(state.view!=='workspace'){if(e.key==='Escape')dom.appearanceMenu.hidden=true;return;}
    if(e.key==='Shift'&&!isTyping()){state.shiftDown=true;render();}
    if(e.key==='Control'&&!isTyping()){state.ctrlDown=true;render();}
    if(e.code==='Space'&&!isTyping()&&canvasShortcutContext()){if(!state.spaceDown)state.spaceGesture={used:false,started:performance.now()};state.spaceDown=true;e.preventDefault();}
    if(!isTyping()&&e.key==='F3'){e.preventDefault();state.snap=!state.snap;dom.snapToggle.classList.toggle('active',state.snap);render();}
    if(!isTyping()&&e.key==='F7'){e.preventDefault();state.grid=!state.grid;dom.gridToggle.classList.toggle('active',state.grid);render();}
    if(!isTyping()&&e.key==='F8'){e.preventDefault();state.ortho=!state.ortho;dom.orthoToggle.classList.toggle('active',state.ortho);render();}
    if(!isTyping()&&e.key==='F10'){e.preventDefault();state.polar=!state.polar;dom.polarToggle.classList.toggle('active',state.polar);render();}
    if(!isTyping()&&e.key==='Enter'){e.preventDefault();if(state.activeTool==='line'&&state.drawStart)finishContinuousCommand();else runCommand('');}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveProjectFile();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!isTyping()){e.preventDefault();e.shiftKey?redo():undo();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'&&!isTyping()){e.preventDefault();redo();}
    if(e.key==='Escape'){if(dom.exportSaveBackdrop&&!dom.exportSaveBackdrop.hidden){closeDxfFallbackSaveDialog();return;}if(!dom.confirmBackdrop.hidden){hideAppConfirm();return;}hideTooltip();hideContextMenu();closeFloorActionMenu();if(state.selectionDrag){state.selectionDrag=null;render();}else if(state.activeTool==='constraint'){cancelTransient();}else if(state.activeTool==='select'&&selectionIds().size){clearMultiSelection();renderPrimaryPanel();renderProperties();render();}else cancelTransient();}
    if((e.key==='Delete'||e.key==='Backspace')&&!isTyping()&&selectionIds().size){e.preventDefault();deleteSelectedObjects();}
    if(!isTyping()&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&/^[a-zA-Z]$/.test(e.key)){e.preventDefault();dom.commandInput.focus();dom.commandInput.value=e.key.toUpperCase();}
  });
  window.addEventListener('keyup',e=>{if(e.key==='Shift'){state.shiftDown=false;render();}if(e.key==='Control'){state.ctrlDown=false;state.snapIndicator=null;render();}if(e.code==='Space'){const gesture=state.spaceGesture;state.spaceDown=false;state.spaceGesture=null;if(!state.pan)host.dataset.pan='false';if(gesture&&!gesture.used&&(performance.now()-gesture.started)<420&&state.view==='workspace'&&state.toolset==='plan'&&!isTyping()&&canvasShortcutContext())setTool('select','plan');}});
  window.addEventListener('beforeunload',e=>{if(state.dirty){e.preventDefault();e.returnValue='';}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.tool-rail')&&!e.target.closest('.tool-popover'))dom.toolPopover.hidden=true;if(!e.target.closest('#appearanceMenu')&&!e.target.closest('#appearanceBtn')&&!e.target.closest('#startAppearanceBtn'))dom.appearanceMenu.hidden=true;if(!e.target.closest('.canvas-context-menu'))hideContextMenu();if(!e.target.closest('.floor-action-menu')&&!e.target.closest('.floor-row .mini-action'))closeFloorActionMenu();});

  applyShortcutMetadata(dom.gridToggle,'grid','tooltip.grid');applyShortcutMetadata(dom.snapToggle,'snap','tooltip.snap');applyShortcutMetadata(dom.orthoToggle,'ortho','tooltip.ortho');applyShortcutMetadata(dom.polarToggle,'polar','tooltip.polar');
  if(window.__PIENIPLAN_TEST_HOOK__){Object.assign(window.__PIENIPLAN_TEST_HOOK__,{state,commitSegment,applyObjectDrag,syncDependentsOfWall,planDrawReferenceAt,detectWallCandidates,beginWallRecognition,applyWallRecognition,cancelWallRecognition,render,updateAll,fitAll,fitBounds,switchToolset,setTool,rebuildObjectSnapIndex,renderCadLayersPanel,saveProjectFile,downloadProjectFile,makeProjectPayload,dxfDoorEntities,constrainTracking,applyTrimExtendAtPoint,ensureFloorModel,ensureFloorForRegion,repairFloorRegionIsolation,setActiveFloor,addFloor,renderPlanFloorPanel,getPlanObjects,detectClosedWallFaces,getLinkedCadRenderCache,runCommand,trimArchitecturalWallOverruns,solveArchitecturalWallJunctions,healArchitecturalEndpointGaps,normalizeArchitecturalJunctionEndpoints,cleanupArchitecturalWallTopology,repairPersistentPlanJunctions,migrateLegacyPlanLinesToEdges,solvePointOnEdgeAttachment,computePlanTrimSegment,updatePlanTrimPreview,buildSegmentSnapIndex,queryReferenceSnapIndex,nearestSnap,snapDirectionToStep,constrainEndpointToOriginalAngle,detectSegmentedDoorCandidates,toScreenCss,screenCssToWorld,clientToCanvasCss,hitObject,objectBodyDistance,wallVisibleSegments,suggestedFloorNameFromRegion,repairDefaultFloorNamesFromRegions,recognitionBaselineWallSignatures,recognizedWallSourceMatch,recognitionObjectSignature,recognizedObjectIsAutoOwned,saveDxfBlob,exportDxfNow,exportRegionDxf});}

  dom.dialogBackdrop.hidden=true;dom.mappingBackdrop.hidden=true;dom.recognitionBackdrop.hidden=true;dom.confirmBackdrop.hidden=true;if(dom.exportSaveBackdrop)dom.exportSaveBackdrop.hidden=true;dom.commandBar.hidden=false;i18n.apply(document);state.browserSavedMeta=readBrowserSavedMeta();state.inspectorSplit=safeReadInspectorSplit();state.theme=safeReadTheme();applyTheme(state.theme,{persist:false});installTooltips();updateEmptyState();renderToolRail();updateAll();if(dom.aboutVersion)dom.aboutVersion.textContent=`Version ${VERSION} · Build ${BUILD}`;if(dom.startVersion)dom.startVersion.textContent=`PieniPlan v${VERSION} · Build ${BUILD}`;setCommandStatus(t('command.ready'));updateContinueCard();history.replaceState({[ROUTE_MARKER]:true,view:'start',toolset:state.toolset},'',location.href);showStartScreen({historyMode:'none'});setTimeout(resizeCanvas,0);console.info(`PieniPlan v${VERSION} · Build ${BUILD}`);
})();
