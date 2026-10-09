(() => {
  'use strict';

  const VERSION = '0.48.0';
  const BUILD = 68;
  let activeImportJob=null;
  const INTERNAL_UNIT = 'mm';
  const PROJECT_SCHEMA = 7;
  const PROJECT_CAPABILITIES = ()=>[modules.cadPolyline.capability,'cad.annotation.v2','reference.pdf.v1'];
  const i18n = window.PieniPlanI18n;
  const t = (key, vars) => i18n.t(key, vars);
  const modules = window.PieniPlanModules || {};
  const cadLayerModule = modules.cadLayerVisibility;
  const commandCore = modules.commandCore;
  const commandConsoleModule = modules.commandConsole;
  const cadRegionTransform = modules.cadRegionTransform;
  const cadLayersModule = modules.cadLayers;
  const cadContextModule = modules.cadDocumentContext;
  const cadSelectionModule = modules.cadSelection;
  const cadUnitsModule = modules.cadUnits;
  const componentLibrary = modules.componentLibrary;
  const contextMenuModule = modules.contextMenu;
  if(!contextMenuModule||!cadLayerModule||!commandCore||!commandConsoleModule||!cadRegionTransform||!cadLayersModule||!cadContextModule||!cadSelectionModule||!cadUnitsModule||!modules.cadPolyline||!modules.curveReconstruction||!modules.cadAnnotation2||!modules.cadSpatialTree||!modules.commandFoundation||!modules.build25CommandAdapters||!modules.nativeLineCommand||!modules.nativePolylineCommand||!modules.nativeDrawCommands||!modules.nativeTransformCommands||!modules.cadTransformOperations||!componentLibrary||!modules.precision||!modules.planStair||!modules.connectedSelection)throw new Error('PieniPlan core modules failed to load.');
  i18n.apply(document);

  const $ = (id) => document.getElementById(id);
  const canvas = $('drawingCanvas');
  const host = $('canvasHost');
  const ctx = canvas.getContext('2d');

  const dom = {
    appShell: $('appShell'), contextBar: $('contextBar'), startScreen: $('startScreen'), startPlanBtn: $('startPlanBtn'), startCadBtn: $('startCadBtn'), startSampleBtn: $('startSampleBtn'), startOpenProjectBtn: $('startOpenProjectBtn'), startOpenPackageBtn: $('startOpenPackageBtn'), startMergePlanBtn: $('startMergePlanBtn'), documentStatus: $('documentStatus'), mobileViewerBadge: $('mobileViewerBadge'),
    continueWorkBtn: $('continueWorkBtn'), continueWorkDetail: $('continueWorkDetail'), continueWorkAction: $('continueWorkAction'), backBtn: $('backBtn'), homeBtn: $('homeBtn'), appearanceBtn: $('appearanceBtn'), startAppearanceBtn: $('startAppearanceBtn'), appearanceMenu: $('appearanceMenu'), documentTitle: $('documentTitle'), documentDirtyDot: $('documentDirtyDot'),
    viewMenuBtn: $('viewMenuBtn'), fileMenuBtn: $('fileMenuBtn'), settingsMenuBtn: $('settingsMenuBtn'), viewMenu: $('viewMenu'), fileMenu: $('fileMenu'), settingsMenu: $('settingsMenu'), openSettingsAction: $('openSettingsAction'),
    viewFitAction: $('viewFitAction'), viewRegionAction: $('viewRegionAction'), viewAllAction: $('viewAllAction'), fileNewAction: $('fileNewAction'), fileOpenProjectAction: $('fileOpenProjectAction'), fileSaveProjectAction: $('fileSaveProjectAction'), fileDownloadProjectAction: $('fileDownloadProjectAction'), fileExportPlanPackageAction: $('fileExportPlanPackageAction'), fileImportPlanPackageAction: $('fileImportPlanPackageAction'), fileOpenDxfAction: $('fileOpenDxfAction'), fileExportDxfAction: $('fileExportDxfAction'), fileSheetPdfAction: $('fileSheetPdfAction'), helpBtn: $('helpBtn'), aboutBtn: $('aboutBtn'), helpBackdrop: $('helpBackdrop'), aboutBackdrop: $('aboutBackdrop'), helpCloseBtn: $('helpCloseBtn'), aboutCloseBtn: $('aboutCloseBtn'), helpContent: $('helpContent'), aboutVersion: $('aboutVersion'),
    planToolsBtn: $('planToolsBtn'), cadToolsBtn: $('cadToolsBtn'), toolRail: $('toolRail'), toolPopover: $('toolPopover'),
    newBtn: $('newBtn'), openProjectBtn: $('openProjectBtn'), saveProjectBtn: $('saveProjectBtn'), projectFileInput: $('projectFileInput'), planPackageFileInput: $('planPackageFileInput'), planMergeFileInput: $('planMergeFileInput'), openRefBtn: $('openRefBtn'), emptyOpenBtn: $('emptyOpenBtn'), addReferenceBtn: $('addReferenceBtn'),
    openDxfBtn: $('openDxfBtn'), dxfEditFileInput: $('dxfEditFileInput'), referenceFileInput: $('referenceFileInput'), referenceReconnectFileInput: $('referenceReconnectFileInput'), pdfReferenceLayer: $('pdfReferenceLayer'),
    fitBtn: $('fitBtn'), undoBtn: $('undoBtn'), redoBtn: $('redoBtn'), exportDxfBtn: $('exportDxfBtn'),
    contextToolName: $('contextToolName'), contextFields: $('contextFields'), contextHint: $('contextHint'),
    emptyState: $('emptyState'), emptyKicker: $('emptyKicker'), emptyTitle: $('emptyTitle'), emptyCopy: $('emptyCopy'), emptyPrimaryBtn: $('emptyPrimaryBtn'),
    primaryInspectorTab: $('primaryInspectorTab'), primaryPanelTitle: $('primaryPanelTitle'), primaryPanelSubtitle: $('primaryPanelSubtitle'), primaryControls: $('primaryControls'), primaryList: $('primaryList'), cadScopeHost: $('cadScopeHost'), mappingSettingsBtn: $('mappingSettingsBtn'), cadMappingCard: $('cadMappingCard'),
    referenceList: $('referenceList'), propertiesPanel: $('propertiesPanel'),
    statusX: $('statusX'), statusY: $('statusY'), statusUnits: $('statusUnits'), statusAxis: $('statusAxis'), statusZoom: $('statusZoom'),
    gridToggle: $('gridToggle'), snapToggle: $('snapToggle'), orthoToggle: $('orthoToggle'), polarToggle: $('polarToggle'),
    progressToast: $('progressToast'), progressTitle: $('progressTitle'), progressBar: $('progressBar'), progressDetail: $('progressDetail'),
    canvasHud: $('canvasHud'), commandBar: $('commandBar'), commandLogExpand: $('commandLogExpand'), commandLogPin: $('commandLogPin'), commandInput: $('commandInput'), commandStatus: $('commandStatus'), commandHistory: $('commandHistory'), commandSuggestions: $('commandSuggestions'),
    dialogBackdrop: $('dialogBackdrop'), dialogTitle: $('dialogTitle'), dialogCopy: $('dialogCopy'), dialogInput: $('dialogInput'), dialogScaleFloorRow: $('dialogScaleFloorRow'), dialogScaleFloor: $('dialogScaleFloor'), dialogCancelBtn: $('dialogCancelBtn'), dialogApplyBtn: $('dialogApplyBtn'),
    confirmBackdrop: $('confirmBackdrop'), confirmTitle: $('confirmTitle'), confirmCopy: $('confirmCopy'), confirmCancelBtn: $('confirmCancelBtn'), confirmSaveBtn: $('confirmSaveBtn'), confirmApplyBtn: $('confirmApplyBtn'),
    exportSaveBackdrop: $('exportSaveBackdrop'), exportSaveTitle: $('exportSaveTitle'), exportSaveCopy: $('exportSaveCopy'), exportSaveName: $('exportSaveName'), exportSaveCancelBtn: $('exportSaveCancelBtn'), exportSaveApplyBtn: $('exportSaveApplyBtn'), startVersion: $('startVersion'), planPackageBackdrop: $('planPackageBackdrop'), planPackageBuildingName: $('planPackageBuildingName'), planPackageDiscipline: $('planPackageDiscipline'), planPackageCancelBtn: $('planPackageCancelBtn'), planPackageExportBtn: $('planPackageExportBtn'), planMergeBackdrop: $('planMergeBackdrop'), planMergeList: $('planMergeList'), planMergeAddBtn: $('planMergeAddBtn'), planMergeCancelBtn: $('planMergeCancelBtn'), planMergeExportBtn: $('planMergeExportBtn'), planMergeSummary: $('planMergeSummary'),
    mappingBackdrop: $('mappingBackdrop'), recognitionBackdrop: $('recognitionBackdrop'), recognitionTitle: $('recognitionTitle'), recognitionCopy: $('recognitionCopy'), recognitionStats: $('recognitionStats'), recognitionBreakdown: $('recognitionBreakdown'), recognitionCountEls: {walls:$('recognitionWallsCount'),spaces:$('recognitionSpacesCount'),doors:$('recognitionDoorsCount'),stairs:$('recognitionStairsCount')}, recognitionCreateWalls: $('recognitionCreateWalls'), recognitionCreateSpaces: $('recognitionCreateSpaces'), recognitionCreateDoors: $('recognitionCreateDoors'), recognitionCreateStairs: $('recognitionCreateStairs'), recognitionCancelBtn: $('recognitionCancelBtn'), recognitionApplyBtn: $('recognitionApplyBtn'), wallRepresentation: $('wallRepresentation'), wallLayerInput: $('wallLayerInput'), doorLayerInput: $('doorLayerInput'), windowLayerInput: $('windowLayerInput'), dimensionLayerInput: $('dimensionLayerInput'), mappingCancelBtn: $('mappingCancelBtn'), mappingApplyBtn: $('mappingApplyBtn'),
    settingsBackdrop: $('settingsBackdrop'), settingsCloseBtn: $('settingsCloseBtn'), settingsCloseIcon: $('settingsCloseIcon'), settingsLanguage: $('settingsLanguage'), settingsDefaultUnit: $('settingsDefaultUnit'), settingsRecoveryEnabled: $('settingsRecoveryEnabled'), settingsTextSize: $('settingsTextSize'), settingsSnapSensitivity: $('settingsSnapSensitivity'), settingsOpenRecovery: $('settingsOpenRecovery'), settingsRecoveryMeta: $('settingsRecoveryMeta'), settingsContextMenuList: $('settingsContextMenuList'), settingsContextReset: $('settingsContextReset'),
    annotationTextBackdrop: $('annotationTextBackdrop'), annotationTextTitle: $('annotationTextTitle'), annotationTextCopy: $('annotationTextCopy'), annotationTextArea: $('annotationTextArea'), annotationTextHeight: $('annotationTextHeight'), annotationTextWidth: $('annotationTextWidth'), annotationTextCancelBtn: $('annotationTextCancelBtn'), annotationTextApplyBtn: $('annotationTextApplyBtn'),
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
      { id: 'stair', labelKey: 'tool.stair', ready: true, note:'ST' },
      { id: 'space', labelKey: 'tool.space', ready: true, tooltipKey: 'tooltip.defineSpace' },
      { id: 'component', labelKey: 'tool.component', ready: true }
    ],
    modify: [
      { id: 'move', labelKey: 'tool.move', ready: true, note: 'M' },
      { id: 'copy', labelKey: 'tool.copy', ready: true, note: 'CO' },
      { id: 'trim', labelKey: 'tool.trim', ready: true, note: 'TR' },
      { id: 'extend', labelKey: 'tool.extend', ready: true, note: 'EX' },
      { id: 'reconstruct', labelKey: 'tool.curveReconstruct', ready: true, note: 'CR' },
      { id: 'delete', labelKey: 'tool.delete', ready: true, note: 'E' }
    ]
  };

  const planCategories = [
    { id: 'select', labelKey: 'category.select', icon: 'select' },
    { id: 'draw', labelKey: 'category.draw', icon: 'draw' },
    { id: 'architecture', labelKey: 'category.elements', icon: 'architecture' },
    { id: 'modify', labelKey: 'category.modify', icon: 'modify' }
  ];

  // Compact split-button ribbon: the main button repeats the group's last-used tool;
  // the adjacent chevron opens the tool list without duplicating the group name.
  const toolCategoryMemory = { plan: Object.create(null), cad: Object.create(null) };
  const toolIconFallback = {"select": "select", "constraint": "vector", "region": "crop", "line": "line", "polyline": "vector", "rectangle": "rectangle", "circle": "circle", "arc": "arc", "wall": "wall", "displayLine": "line", "displayArc": "arc", "door": "door", "window": "window", "space": "space", "measure": "ruler", "move": "arrows-move", "copy": "copy", "rotate": "rotate", "mirror": "flip-horizontal", "scale": "resize", "stretch": "arrows-horizontal", "array": "layout-grid", "align": "align-left", "chamfer": "corner-up-right", "trim": "cut", "extend": "arrow-bar-to-right", "break": "arrows-split", "join": "arrows-join", "offset": "line-dashed", "fillet": "border-radius", "reconstruct": "vector-spline", "delete": "trash", "stair": "stairs", "component": "component", "text": "letter-t", "mtext": "text-wrap", "leader": "message-2", "hatch": "texture", "aligned-dim": "ruler-measure", "angle-dim": "angle", "radius-dim": "circle", "diameter-dim": "circle", "continuous-dim": "ruler-measure", "baseline-dim": "ruler-measure", "coincident": "link", "horizontal": "arrows-horizontal", "vertical": "vertical", "parallel": "line-dashed", "perpendicular": "corner-up-right", "angle": "angle", "length": "ruler", "fixed": "lock", "baseAxis": "vector", "clearBaseAxis": "vector"};

  const wallTypeCatalog = [
    { id:'straight', labelKey:'wallType.straight' },
    { id:'arc', labelKey:'wallType.arc' }
  ];

  const doorTypeCatalog = [
    { id:'hingedSingle', labelKey:'doorType.hingedSingle', group:'hinged' },
    { id:'hingedDouble', labelKey:'doorType.hingedDouble', group:'hinged' },
    { id:'doubleActingSingle', labelKey:'doorType.doubleActingSingle', group:'hinged' },
    { id:'doubleActingDouble', labelKey:'doorType.doubleActingDouble', group:'hinged' },
    { id:'slidingSingle', labelKey:'doorType.slidingSingle', group:'sliding' },
    { id:'slidingDouble', labelKey:'doorType.slidingDouble', group:'sliding' },
    { id:'pocket', labelKey:'doorType.pocket', group:'sliding' },
    { id:'fireDoor', labelKey:'doorType.fireDoor', group:'fire' },
    { id:'fireShutter', labelKey:'doorType.fireShutter', group:'fire' }
  ];

  const spaceTypeCatalog = [
    { id:'unspecified', labelKey:'spaceType.unspecified' },
    { id:'classroom', labelKey:'spaceType.classroom' },
    { id:'office', labelKey:'spaceType.office' },
    { id:'corridor', labelKey:'spaceType.corridor' },
    { id:'restroom', labelKey:'spaceType.restroom' },
    { id:'stairwell', labelKey:'spaceType.stairwell' },
    { id:'storage', labelKey:'spaceType.storage' },
    { id:'common', labelKey:'spaceType.common' },
    { id:'mechanical', labelKey:'spaceType.mechanical' },
    { id:'other', labelKey:'spaceType.other' }
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
      { id: 'polyline', labelKey: 'tool.polyline', ready: true, note: 'PL' },
      { id: 'rectangle', labelKey: 'tool.rectangle', ready: true, note: 'REC' },
      { id: 'circle', labelKey: 'tool.circle', ready: true, note: 'C' },
      { id: 'arc', labelKey: 'tool.arc', ready: true, note: 'A' }
    ],
    architecture: [
      { id: 'wall', labelKey: 'tool.wall', ready: true },
      { id: 'door', labelKey: 'tool.door', ready: true },
      { id: 'window', labelKey: 'tool.window', ready: true },
      { id: 'component', labelKey: 'tool.component', ready: true }
    ],
    dimension: [
      { id: 'measure', labelKey: 'tool.measure', ready: true, note: 'DI' },
      { id: 'aligned-dim', labelKey: 'tool.alignedDim', ready: true, note: 'DLI' },
      { id: 'radius-dim', labelKey: 'tool.radiusDim', ready: true, note: 'DRA' },
      { id: 'diameter-dim', labelKey: 'tool.diameterDim', ready: true, note: 'DDI' },
      { id: 'angle-dim', labelKey: 'tool.angleDim', ready: true, note: 'DAN' },
      { id: 'continuous-dim', labelKey: 'tool.continuousDim', ready: true, note: 'DCO' },
      { id: 'baseline-dim', labelKey: 'tool.baselineDim', ready: true, note: 'DBA' }
    ],
    annotation: [
      { id: 'text', labelKey: 'tool.text', ready: true, note: 'T' },
      { id: 'mtext', labelKey: 'tool.mtext', ready: true, note: 'MT' },
      { id: 'leader', labelKey: 'tool.leader', ready: true, note: 'LE' },
      { id: 'hatch', labelKey: 'tool.hatch', ready: true, note: 'H' }
    ],
    modify: [
      { id: 'move', labelKey: 'tool.move', ready: true, note: 'M' },
      { id: 'copy', labelKey: 'tool.copy', ready: true, note: 'CO' },
      { id: 'rotate', labelKey: 'tool.rotate', ready: true, note: 'RO' },
      { id: 'mirror', labelKey: 'tool.mirror', ready: true, note: 'MI' },
      { id: 'scale', labelKey: 'tool.scale', ready: true, note: 'SC' },
      { id: 'stretch', labelKey: 'tool.stretch', ready: true, note: 'S' },
      { id: 'array', labelKey: 'tool.array', ready: true, note: 'AR' },
      { id: 'align', labelKey: 'tool.align', ready: true, note: 'AL' },
      { id: 'chamfer', labelKey: 'tool.chamfer', ready: true, note: 'CH' },
      { id: 'trim', labelKey: 'tool.trim', ready: true, note: 'TR' },
      { id: 'extend', labelKey: 'tool.extend', ready: true, note: 'EX' },
      { id: 'break', labelKey: 'tool.break', ready: true, note: 'BR' },
      { id: 'join', labelKey: 'tool.join', ready: true, note: 'J' },
      { id: 'offset', labelKey: 'tool.offset', ready: true, note: 'O' },
      { id: 'fillet', labelKey: 'tool.fillet', ready: true, note: 'F' },
      { id: 'reconstruct', labelKey: 'tool.curveReconstruct', ready: true, note: 'CR' },
      { id: 'delete', labelKey: 'tool.delete', ready: true, note: 'E' }
    ]
  };

  const cadCategories = [
    {id:'select',labelKey:'category.select',icon:'select'},
    {id:'draw',labelKey:'category.draw',icon:'draw'},
    {id:'modify',labelKey:'category.modify',icon:'modify'},
    {id:'dimension',labelKey:'category.dimension',icon:'dimension'},
    {id:'annotation',labelKey:'category.annotation',icon:'letter-t'},
    {id:'component',labelKey:'tool.component',icon:'component'},
    {id:'architecture',labelKey:'category.planElements',icon:'architecture'}
  ];
  cadToolCatalog.component=[{id:'component',labelKey:'tool.component',ready:true}];
  cadToolCatalog.architecture=cadToolCatalog.architecture.filter(x=>x.id!=='component');


  let featureFill=null,projectionFloorOverride=null;
  const state = {
    toolset: 'plan',
    camera: { cx: 0, cy: 0, zoom: 0.12 },
    cursorWorld: { x: 0, y: 0 },
    activeCategory: 'select',
    activeTool: 'select',
    activeCadLayer: '0',
    cadLayerDefinitions: new Map([['0',cadLayersModule.defaults('0')]]),
    cadLayerVisibility: new Map([['0', true]]),
    cadRegionLayerVisibility: new Map(),
    unitSystem: 'metric',
    sheets: [],
    annotationDraft: null,
    annotationDialogDraft: null,
    referenceReconnectId: null,
    referenceClipDraft: null,
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
    toolSettings: { wallThickness: 150, wallType:'straight', doorWidth: 900, doorType:'hingedSingle', windowWidth: 1200, planDisplayMode:false, planDisplayStyle:'solid', planLineAppearance:{color:'#8e9bab',width:1.4,dashScale:1} },
    activeComponentAssetId: 'fixture.toilet',
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
    projectId: `project-${(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2))}`,
    projectFileName: null,
    projectFileHandle: null,
    projectLocalKey: null,
    sessionKind: 'normal',
    browserSavedMeta: null,
    dirty: false,
    objectSnapIndex: null,
    planSnapIndex: null,
    cadSnapIndex: null,
    snapIndicator: null,
    trimPreview: null,
    spaceGapDiagnostic: null,
    spaceHoverPreview: null,
    activeCommand: null,
    editLog: [],
    drawingRegions: [],
    selectedRegionId: null,
    cadWorkRegionId: null,
    cadPlanOverlay: false,
    cadRotate: null,
    regionDrag: null,
    selectionDrag: null,
    selectedObjectIds: new Set(),
    previousCadSelectionIds: new Set(),
    lastCadObjectId: null,
    overlapCycle: null,
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
    curveReconstruction: null,
    recognitionHistory: [],
    arcDraft: null,
    polylinePreview: null,
    cadPrimitivePreview: null,
    inspectorSplit: 0.64,
    buildings: [{id:'building_1',name:null,order:0}],
    activeBuildingId: 'building_1',
    floors: [{id:'floor_1',name:'1F',sourceRegionId:null,buildingId:'building_1',order:0}],
    activeFloorId: 'floor_1',
    cadRenderRevision: 0,
    floorMenuEl: null,
    expandedBuildingIds: new Set(['building_1']),
    expandedFloorIds: new Set(),
    buildingOrderEditing: false,
    floorOrderEditing: false,
    floorOrderEditingBuildingId: null,
    recoveryEnabled: true,
    recoveryMeta: null,
    planMergeEntries: [],
    planPackageOpenMode: 'import',
    confirmAction: null,
    confirmSecondaryAction: null,
    confirmCancelAction: null,
    pendingDxfExport: null,
    shiftGuide: null,
    spaceFaceCache: { revision:-1, floorId:null, faces:[] }
  };

  let documentWriteEpoch=0,projectLoadSequence=0;
  let sampleReturnWorkspace=null,fileSaveChain=Promise.resolve(),browserSaveChain=Promise.resolve(),recoveryWriteChain=Promise.resolve();
  let cadLayerStore=null,cadContext=null,cadSelectionService=null,cadAppearanceEnabled=false;
  let cadLayerRenameTarget=null;
  let cadQueryIndex=null,cadOperationPreview=null,cadModifySourceId=null;
  const cadTextMetrics=new Map();
  function cadTextVisualLines(obj,px,scale){
    const raw=String(obj?.text||''),paragraphs=raw.split(/\r?\n/),limitWorld=Math.max(0,Number(obj?.width)||0),limitPx=limitWorld>0?limitWorld/Math.max(scale,1e-12):0;
    if(!limitPx)return paragraphs.length?paragraphs:[''];
    ctx.save();ctx.font=`${px}px system-ui`;const lines=[];
    for(const paragraph of paragraphs){if(!paragraph){lines.push('');continue;}const words=paragraph.split(/\s+/);let line='';for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width<=limitPx||!line){line=next;continue;}lines.push(line);line=word;}if(line)lines.push(line);}ctx.restore();return lines.length?lines:[''];
  }
  function cadTextLayout(obj,{natural=false,worldScale=1}={}){
    const height=Math.max(1,Number(obj.height)||180),zoom=natural?1:state.camera.zoom*worldScale,px=natural?100:Math.min(height*zoom,900),scale=natural?height/100:1/zoom,lines=cadTextVisualLines(obj,px,scale),lineSpacing=Math.max(1,Number(obj.lineSpacing)||1.25),key=px+'|'+lines.join('\n');
    let m=cadTextMetrics.get(key);if(!m){ctx.save();ctx.font=`${px}px system-ui`;ctx.textBaseline='alphabetic';let left=0,right=0,ascent=0,descent=0;for(const line of lines){const v=ctx.measureText(line||' ');left=Math.max(left,v.actualBoundingBoxLeft||0);right=Math.max(right,v.actualBoundingBoxRight||v.width);ascent=Math.max(ascent,v.actualBoundingBoxAscent||px*.8);descent=Math.max(descent,v.actualBoundingBoxDescent||px*.2);}ctx.restore();m={left,right,ascent,descent};if(cadTextMetrics.size>2048)cadTextMetrics.clear();cadTextMetrics.set(key,m);}
    const lineAdvance=height*lineSpacing,totalHeight=(lines.length-1)*lineAdvance+(m.ascent+m.descent)*scale;return{minx:-m.left*scale,maxx:m.right*scale,miny:-m.descent*scale-(lines.length-1)*lineAdvance,maxy:m.ascent*scale,px,lines,lineAdvancePx:lineAdvance*zoom,hidden:!String(obj.text||'')||(!natural&&height*zoom<2),totalHeight};
  }
  const cadGeometry=modules.geometryQuery.create({textLayout:cadTextLayout});
  const cadBroadGeometry=modules.geometryQuery.create({textLayout:o=>cadTextLayout(o,{natural:true})});
  const hasCadAppearance=v=>Boolean(v.color||(v.linetype&&v.linetype!=='CONTINUOUS')||typeof v.lineweight==='number');
  function refreshCadAppearance(){cadAppearanceEnabled=[...state.cadLayerDefinitions.values()].some(hasCadAppearance)||state.objects.some(o=>cadSourceObject(o)&&hasCadAppearance(o));}
  function cadQueryCandidates(rect,purpose='select'){const source=cadQueryIndex?cadQueryIndex.candidates(rect):cadWorkObjects();return source.filter(o=>cadPolicy(o.id,purpose).allowed);}

  let cadLineContinuationPoint=null;
  function cadPlanOverlayVisibleForPolicy(obj){if(!state.cadPlanOverlay)return false;const floor=cadPlanFloor();if(!floor||!obj)return false;if(obj.floorId&&obj.floorId!==floor.id)return false;if(obj.type==='space'||obj.type==='component')return true;return cadLayerVisible(cadLayerForObject(obj));}
  function cadSourceKind(obj){if(cadSourceObject(obj))return'cad-source';if(obj?.type==='component')return'component';if(isSemanticObject(obj)||(obj?.type==='line'&&obj.floorId))return'plan-overlay';return'unknown';}
  function initializeCadServices({newDocument=false}={}){
    if(newDocument){documentWriteEpoch++;modules.cadPolyline.clear();}
    state.cadLayerDefinitions=cadLayersModule.synthesize(state.cadLayerDefinitions,state.objects,state.cadLayerVisibility);
    cadLayerStore=cadLayersModule.create(state.cadLayerDefinitions);
    refreshCadAppearance();
    if(!cadContext||newDocument){cadContext=cadContextModule.create({getState:()=>state,classify:cadSourceKind,inWorkScope:cadObjectInWorkScope,layerVisible:name=>cadLayerVisible(name),layerLocked:name=>Boolean(cadLayerStore.get(name)?.locked),planOverlayVisible:cadPlanOverlayVisibleForPolicy,layerForObject:cadLayerForObject});if(newDocument)cadContext.resetDocument();}
    else cadContext.rebuild();
    cadSelectionService=cadSelectionModule.create({getIds:()=>selectionIds(),setIds:setSelectionIds,policy:(id,purpose)=>state.toolset==='cad'?cadPolicy(id,purpose):({allowed:Boolean(cadContext.getById(id)),reason:null})});
    if(!cadLayerStore.has(state.activeCadLayer))state.activeCadLayer='0';
  }
  function setSelectionIds(ids){if(state.toolset==='cad')state.trimPreview=null;const next=new Set(ids||[]),current=new Set(state.selectedObjectIds||[]);if(state.toolset==='cad'&&current.size){const same=current.size===next.size&&[...current].every(id=>next.has(id));if(!same)state.previousCadSelectionIds=new Set(current);}state.selectedObjectIds=next;state.selectedObjectId=next.size===1?[...next][0]:null;state.selectedReferenceId=null;state.selectedRegionId=null;if(state.toolset==='cad'&&next.size===1){const obj=cadContext?.getById(state.selectedObjectId)||state.objects.find(o=>o.id===state.selectedObjectId);state.layerRevealRequested=Boolean(obj&&cadSourceKind(obj)==='cad-source');}else if(next.size!==1)state.layerRevealRequested=false;return next;}
  function cadLayerDefinition(name){if(!cadLayerStore)initializeCadServices();return cadLayerStore.ensure(name||'0');}
  function cadLayerLocked(name){return Boolean(cadLayerDefinition(name).locked);}
  function cadPolicy(id,purpose='select'){
    if(!cadContext)initializeCadServices();
    const obj=cadContext.getById(id);
    if(obj?.type==='component'){
      const floor=cadPlanFloor(),region=activeCadWorkRegion(),inFloor=!floor||!obj.floorId||obj.floorId===floor.id,inScope=inFloor&&(!region||objectTouchesRegion(obj,region));
      if(!inScope)return{allowed:false,reason:'out-of-scope'};
      return{allowed:true,reason:null};
    }
    return cadContext.policy(id,purpose);
  }
  function touchCadGeometry(){if(state.toolset==='cad')state.trimPreview=null;cadContext?.touchGeometry();}
  function touchCadLayer(){if(state.toolset==='cad')state.trimPreview=null;cadContext?.touchLayer();}
  function touchCadReference(){cadContext?.touchReference();}
  function cadContextToken(){if(!cadContext)initializeCadServices();return cadContext.token();}
  function cadContextTokenCurrent(token,opts){return cadContext?.isCurrent(token,opts)!==false;}
  function cadFaultMessage(code){const key={
    'stale-context':'cadFault.staleContext','missing-history-recorder':'cadFault.missingHistory','target-not-modifiable':'cadFault.notModifiable','locked-layer':'cadFault.lockedLayer','plan-overlay-readonly':'cadFault.planReadonly','missing-object':'cadFault.missingObject'
  }[code];return key?t(key):t('cadFault.generic');}

  initializeCadServices({newDocument:true});

  const commandConsole=commandConsoleModule.create({input:dom.commandInput,status:dom.commandStatus,history:dom.commandHistory,suggestions:dom.commandSuggestions,bar:dom.commandBar,expandButton:dom.commandLogExpand,pinButton:dom.commandLogPin,getPlanMode:()=>state.toolset==='plan',readyText:()=>t('command.ready')});

  const linkedCadRenderCache = new WeakMap();
  let planObjectCache = { revision:-1, count:-1, floorId:null, objects:[] };
  function getPlanObjects(){const revision=state.cadRenderRevision||0,count=state.objects.length,floorId=state.activeFloorId;if(planObjectCache.revision===revision&&planObjectCache.count===count&&planObjectCache.floorId===floorId)return planObjectCache.objects;const objects=state.objects.filter(o=>(isSemanticObject(o)||o.type==='line')&&objectOnActiveFloor(o));planObjectCache={revision,count,floorId,objects};return objects;}

  // B1: derived semantic lookup only; retain every Floor for export/inspection.
  // Object references stay live during drag; membership follows the existing revision.
  let planGeometryCache = { source:null, revision:-1, count:-1 };
  function planGeometryIndex(){
    const source=state.objects,revision=state.cadRenderRevision||0;
    if(planGeometryCache.source===source&&planGeometryCache.revision===revision&&planGeometryCache.count===source.length)return planGeometryCache;
    const walls=[],openings=[],wallsById=new Map();
    for(const obj of source){
      if(obj.type==='wall'){walls.push(obj);if(!wallsById.has(obj.id))wallsById.set(obj.id,obj);}
      else if(obj.type==='door'||obj.type==='window')openings.push(obj);
    }
    return planGeometryCache={source,revision,count:source.length,walls,openings,wallsById};
  }

  const THEME_STORAGE_KEY = 'pieniplan-theme';
  const INSPECTOR_SPLIT_STORAGE_KEY = 'pieniplan-cad-manager-split';
  const LANGUAGE_STORAGE_KEY = 'pieniplan-language';
  const DEFAULT_UNIT_STORAGE_KEY = 'pieniplan-default-unit';
  const TEXT_SIZE_STORAGE_KEY = 'pieniplan-text-size-v2';
  const LEGACY_TEXT_SIZE_STORAGE_KEY = 'pieniplan-text-size';
  const RECOVERY_ENABLED_STORAGE_KEY = 'pieniplan-recovery-enabled';
  const CONTEXT_MENU_OVERRIDES_STORAGE_KEY = 'pieniplan-context-menu-overrides-v1';
  const RECOVERY_META_KEY = 'pieniplan-recovery-meta';
  const ROUTE_MARKER = 'pieniplan';
  const LOCAL_PROJECT_DB = 'PieniPlanProjects';
  const LOCAL_PROJECT_STORE = 'projects';
  const LOCAL_PROJECT_KEY = 'last-project';
  const RECOVERY_PROJECT_KEY = 'recovery-project';
  const LOCAL_PROJECT_META_KEY = 'pieniplan-local-project-meta';
  const SHORTCUTS = Object.freeze({
    undo: 'Ctrl/Cmd+Z', redo: 'Ctrl/Cmd+Shift+Z', select: 'Space (Plan)', pan: 'Hold Space + drag',
    delete: 'Delete / Backspace', cancel: 'Esc / ⌘.', grid: 'F7', snap: 'F3', ortho: 'F8', polar: 'F10',
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

  let contextMenuOverrides = Object.create(null);
  let settingsPage = 'general';
  let settingsContextMode = 'cad';
  function safeReadContextMenuOverrides(){
    try{return contextMenuModule.sanitizeOverrides(JSON.parse(localStorage.getItem(CONTEXT_MENU_OVERRIDES_STORAGE_KEY)||'{}'));}
    catch(_){return Object.create(null);}
  }
  function persistContextMenuOverrides(){
    try{localStorage.setItem(CONTEXT_MENU_OVERRIDES_STORAGE_KEY,JSON.stringify(contextMenuOverrides));}catch(_){}
  }
  function setContextMenuOverride(key,patch){
    const current=contextMenuOverrides[key]||{};
    const clean=contextMenuModule.sanitizeOverride({...current,...patch});
    if(clean)contextMenuOverrides[key]=clean;else delete contextMenuOverrides[key];
    persistContextMenuOverrides();
  }

  function safeReadTextSize(){
    try{
      const value=localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
      if(['smaller','small','default','large'].includes(value))return value;
      // Build35 migration: its Small is the new visual Default. Preserve the user's perceived density.
      const legacy=localStorage.getItem(LEGACY_TEXT_SIZE_STORAGE_KEY);
      if(legacy==='small')return'default';
      if(legacy==='default'||legacy==='large')return'large';
      return'default';
    }catch(_){return'default';}
  }
  function applyTextSize(value,{persist=true}={}){
    const next=['smaller','small','default','large'].includes(value)?value:'default';
    state.textSize=next;
    document.documentElement.dataset.textSize=next;
    if(persist){try{localStorage.setItem(TEXT_SIZE_STORAGE_KEY,next);}catch(_){}}
    resizeCanvas();
    render();
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



  let recoveryTimer=null;
  function safeReadDefaultUnit(){try{return localStorage.getItem(DEFAULT_UNIT_STORAGE_KEY)==='imperial'?'imperial':'metric';}catch(_){return'metric';}}
  function safeReadRecoveryEnabled(){try{const v=localStorage.getItem(RECOVERY_ENABLED_STORAGE_KEY);return v===null?true:v!=='false';}catch(_){return true;}}
  function readRecoveryMeta(){try{const raw=localStorage.getItem(RECOVERY_META_KEY);return raw?JSON.parse(raw):null;}catch(_){return null;}}
  function writeRecoveryMeta(meta){state.recoveryMeta=meta||null;try{if(meta)localStorage.setItem(RECOVERY_META_KEY,JSON.stringify(meta));else localStorage.removeItem(RECOVERY_META_KEY);}catch(_){}updateSettingsRecoveryMeta();}
  function updateSettingsRecoveryMeta(){if(!dom.settingsRecoveryMeta)return;const meta=state.recoveryMeta||readRecoveryMeta();dom.settingsRecoveryMeta.textContent=meta?.savedAt?`${meta.name||'PieniPlan.pprj'} · ${new Date(meta.savedAt).toLocaleString()}`:t('settings.noRecovery');if(dom.settingsOpenRecovery)dom.settingsOpenRecovery.disabled=!meta?.savedAt;}
  function captureDocumentRevision(){return{projectId:state.projectId,epoch:documentWriteEpoch,sessionKind:state.sessionKind};}
  function documentRevisionIsCurrent(rev){return Boolean(rev&&rev.projectId===state.projectId&&rev.epoch===documentWriteEpoch&&rev.sessionKind===state.sessionKind);}
  async function saveRecoverySnapshot(){
    if(!state.recoveryEnabled||!state.dirty||state.sessionKind==='sample')return;
    const revision=captureDocumentRevision(),payload=makeProjectPayload(),json=JSON.stringify(payload),savedAt=new Date().toISOString(),name=(state.projectFileName||`${projectBaseName()}.pprj`).replace(/\.(?:pieniplan|ppln|ppkg)$/i,'.pprj');
    const task=async()=>{const db=await openLocalProjectDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction(LOCAL_PROJECT_STORE,'readwrite');tx.objectStore(LOCAL_PROJECT_STORE).put({key:RECOVERY_PROJECT_KEY,name,json,savedAt,projectId:revision.projectId,epoch:revision.epoch});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Recovery write failed'));tx.onabort=()=>reject(tx.error||new Error('Recovery write aborted'));});}finally{db.close();}writeRecoveryMeta({name,savedAt,projectId:revision.projectId,epoch:revision.epoch});};
    const run=recoveryWriteChain.then(task);recoveryWriteChain=run.catch(()=>{});try{await run;}catch(err){console.warn('Recovery snapshot failed',err);}
  }
  function scheduleRecoverySnapshot(){if(recoveryTimer)clearTimeout(recoveryTimer);if(!state.recoveryEnabled||!state.dirty||state.sessionKind==='sample')return;recoveryTimer=setTimeout(()=>{recoveryTimer=null;saveRecoverySnapshot();},1800);}
  async function clearRecoverySnapshot({projectId=null,maxEpoch=Infinity}={}){
    const task=async()=>{let deleted=false;const db=await openLocalProjectDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction(LOCAL_PROJECT_STORE,'readwrite'),store=tx.objectStore(LOCAL_PROJECT_STORE),req=store.get(RECOVERY_PROJECT_KEY);req.onsuccess=()=>{const record=req.result||null;let recordProjectId=record?.projectId||null;if(!recordProjectId&&record?.json){try{recordProjectId=JSON.parse(record.json)?.projectId||null;}catch(_){}}if(record&&(!projectId||recordProjectId===projectId)&&(!Number.isFinite(record.epoch)||record.epoch<=maxEpoch)){store.delete(RECOVERY_PROJECT_KEY);deleted=true;}};req.onerror=()=>reject(req.error||new Error('Recovery read failed'));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Recovery delete failed'));tx.onabort=()=>reject(tx.error||new Error('Recovery delete aborted'));});}finally{db.close();}if(deleted)writeRecoveryMeta(null);return deleted;};
    const run=recoveryWriteChain.then(task);recoveryWriteChain=run.catch(()=>{});try{return await run;}catch(err){console.warn('Recovery cleanup failed',err);return false;}
  }
  async function openRecoverySnapshot(){try{const db=await openLocalProjectDb();let record;try{record=await new Promise((resolve,reject)=>{const tx=db.transaction(LOCAL_PROJECT_STORE,'readonly'),req=tx.objectStore(LOCAL_PROJECT_STORE).get(RECOVERY_PROJECT_KEY);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error||new Error('Recovery read failed'));});}finally{db.close();}if(!record?.json)return updateSettingsRecoveryMeta();if(!(await requestWorkspaceReplacement()))return;const file=new File([record.json],record.name||'PieniPlan Recovery.pprj',{type:'application/json'});closeSettingsDialog();await openProjectFile(file,{skipConfirm:true,restoredLocal:true});}catch(err){console.error(err);alert(t('project.openFailed',{message:String(err?.message||err)}));}}
  function showSettingsPage(page){
    settingsPage=page==='contextMenu'?'contextMenu':'general';
    document.querySelectorAll('[data-settings-page]').forEach(button=>button.classList.toggle('active',button.dataset.settingsPage===settingsPage));
    document.querySelectorAll('[data-settings-panel]').forEach(panel=>panel.hidden=panel.dataset.settingsPanel!==settingsPage);
    if(settingsPage==='contextMenu')renderSettingsContextMenu();
  }
  function contextPreferenceOptions(select,kind,current){
    const options=kind==='visibility'
      ?[['auto','settings.contextAuto'],['show','settings.contextShow'],['hide','settings.contextHide']]
      :[['default','settings.contextDefaultPriority'],['high','settings.contextHigh'],['normal','settings.contextNormal'],['low','settings.contextLow']];
    for(const[value,key]of options){const option=document.createElement('option');option.value=value;option.textContent=t(key);option.selected=value===current;select.appendChild(option);}
  }
  function renderSettingsContextMenu(){
    if(!dom.settingsContextMenuList)return;
    document.querySelectorAll('[data-context-mode]').forEach(button=>button.classList.toggle('active',button.dataset.contextMode===settingsContextMode));
    const defs=contextCommandDefinitions(settingsContextMode,{settings:true}),groups=contextSettingsGroups(settingsContextMode),currentGroup=state.toolset===settingsContextMode?activeCategoryForTool(settingsContextMode,state.activeTool):'select';
    dom.settingsContextMenuList.innerHTML='';
    for(const group of groups){const commands=defs.filter(command=>command.group===group.id);if(!commands.length)continue;const details=document.createElement('details');details.className='settings-context-group';details.open=group.id===currentGroup;const summary=document.createElement('summary');summary.textContent=group.label;details.appendChild(summary);const rows=document.createElement('div');rows.className='settings-context-rows';for(const command of commands){const pref=contextMenuModule.preference(command,contextMenuOverrides),row=document.createElement('div');row.className='settings-context-row';row.dataset.commandKey=command.key;const label=document.createElement('div');label.className='settings-context-label';label.textContent=t(command.settingsLabelKey||command.labelKey);const visibility=document.createElement('select');visibility.className='select-input';visibility.setAttribute('aria-label',`${label.textContent} · ${t('settings.contextVisibility')}`);contextPreferenceOptions(visibility,'visibility',pref.visibility);visibility.addEventListener('change',()=>{setContextMenuOverride(command.key,{visibility:visibility.value});setCommandStatus(t('settings.saved'),'strong');});const priority=document.createElement('select');priority.className='select-input';priority.setAttribute('aria-label',`${label.textContent} · ${t('settings.contextPriority')}`);contextPreferenceOptions(priority,'priority',pref.priority);priority.addEventListener('change',()=>{setContextMenuOverride(command.key,{priority:priority.value});setCommandStatus(t('settings.saved'),'strong');});row.append(label,visibility,priority);rows.appendChild(row);}details.appendChild(rows);dom.settingsContextMenuList.appendChild(details);}
  }
  function openSettingsDialog(){
    if(!dom.settingsBackdrop)return;
    dom.settingsLanguage.value=i18n.language;
    dom.settingsDefaultUnit.value=safeReadDefaultUnit();
    const appearance=planLineAppearance();for(const [id,value] of [['settingsPlanLineColor',appearance.color],['settingsPlanLineWidth',appearance.width],['settingsPlanDashScale',appearance.dashScale]]){const input=document.getElementById(id);if(input)input.value=String(value);}
    if(dom.settingsTextSize)dom.settingsTextSize.value=state.textSize||safeReadTextSize();
    if(dom.settingsSnapSensitivity)dom.settingsSnapSensitivity.value=state.snapSensitivity||'normal';
    dom.settingsRecoveryEnabled.checked=state.recoveryEnabled;
    updateSettingsRecoveryMeta();
    showSettingsPage(settingsPage);
    dom.settingsBackdrop.hidden=false;
    closeTopMenus();
  }
  function closeSettingsDialog(){if(dom.settingsBackdrop)dom.settingsBackdrop.hidden=true;}
  function applyLanguagePreference(value){const next=i18n.setLanguage?.(value)||value;try{localStorage.setItem(LANGUAGE_STORAGE_KEY,next);}catch(_){}renderToolRail();updateEmptyState();updateAll();updateContinueCard();if(!dom.settingsBackdrop?.hidden)openSettingsDialog();}

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
    if (dom.documentTitle) dom.documentTitle.textContent=name.replace(/\.(?:pprj|ppln|pieniplan)$/i,'');
    if (dom.documentDirtyDot) dom.documentDirtyDot.hidden=!state.dirty;
  }

  function markDirty(value = true) {
    documentWriteEpoch++;state.dirty = value;
    updateDocumentStatus();
    if(value)scheduleRecoverySnapshot();
  }

  function initializeBuildingNameFromReference(){
    const floor=activeFloor(),b=activeBuilding();if(!b||!floor||b.nameSource||state.projectFileName||state.projectLocalKey||floorHasPlanObjects(floor.id)||!['Building 1','건물 1',defaultBuildingName(0)].includes(b.name))return false;
    const ref=state.references.find(r=>r.floorId===floor.id&&r.type!=='linkedCadRegion')||state.references.find(r=>r.type==='linkedCadRegion'&&r.floorId===floor.id&&r.regionId===floor.sourceRegionId);
    if(!ref)return false;let name=String(ref.type==='linkedCadRegion'?state.sourceDxfName||'':ref.name||'').replace(/\.(dxf|pdf|png|jpe?g|webp)$/i,'').replace(/_PieniPlan(?:_PieniPlan)*$/i,'').trim();if(!name)return false;pushHistory();b.name=name;b.nameSource='reference';markDirty(true);return true;
  }
  function defaultBuildingName(index=0){return index===0?t('building.defaultName'):`${t('building.defaultName').replace(/\s*1$/,'')} ${index+1}`;}
  function normalizeHierarchyOrder(){
    state.buildings.sort((a,b)=>(a.order??0)-(b.order??0));
    state.buildings.forEach((b,i)=>b.order=i);
    const buildingRank=new Map(state.buildings.map((b,i)=>[b.id,i]));
    state.floors.sort((a,b)=>(buildingRank.get(a.buildingId)??999)-(buildingRank.get(b.buildingId)??999)||((a.order??0)-(b.order??0)));
    const grouped=new Map(state.buildings.map(b=>[b.id,[]]));
    for(const floor of state.floors){if(!grouped.has(floor.buildingId))grouped.set(floor.buildingId,[]);grouped.get(floor.buildingId).push(floor);}
    for(const floors of grouped.values())floors.forEach((f,i)=>f.order=i);
  }
  function ensureBuildingModel(){
    if(!Array.isArray(state.buildings)||!state.buildings.length)state.buildings=[{id:'building_1',name:defaultBuildingName(0),order:0}];
    state.buildings=state.buildings.map((b,i)=>({id:b.id||stableId('building'),name:String(b.name||defaultBuildingName(i)),nameSource:b.nameSource||null,order:Number.isFinite(Number(b.order))?Number(b.order):i})).sort((a,b)=>a.order-b.order);
    if(!state.buildings.some(b=>b.id===state.activeBuildingId))state.activeBuildingId=state.buildings[0].id;
    return state.buildings;
  }
  function activeBuilding(){ensureBuildingModel();return state.buildings.find(b=>b.id===state.activeBuildingId)||state.buildings[0]||null;}
  function floorsForBuilding(buildingId){ensureBuildingModel();return state.floors.filter(f=>f.buildingId===buildingId).sort((a,b)=>(a.order??0)-(b.order??0));}
  function activeFloor(){return state.floors.find(f=>f.id===state.activeFloorId)||state.floors[0]||null;}
  function ensureFloorModel(){
    ensureBuildingModel();
    if(!Array.isArray(state.floors)||!state.floors.length)state.floors=[{id:'floor_1',name:'1F',sourceRegionId:null,buildingId:state.buildings[0].id,order:0}];
    const firstBuilding=state.buildings[0].id;
    for(const floor of state.floors){if(!floor.buildingId||!state.buildings.some(b=>b.id===floor.buildingId))floor.buildingId=firstBuilding;}
    normalizeHierarchyOrder();
    if(!state.floors.some(f=>f.id===state.activeFloorId))state.activeFloorId=state.floors[0].id;
    if(!state.buildings.some(b=>b.id===state.activeBuildingId)){const active=state.floors.find(f=>f.id===state.activeFloorId);state.activeBuildingId=active?.buildingId||state.buildings[0].id;}
    const floorId=state.activeFloorId;
    for(const o of state.objects)if(isSemanticObject(o)&&!o.floorId)o.floorId=floorId;
  }
  function objectOnActiveFloor(o){return !o?.floorId||o.floorId===state.activeFloorId;}
  let cadWorkObjectCacheRevision=-1,cadWorkObjectCacheSource=null,cadWorkObjectCacheLength=-1;
  const cadWorkObjectCache=new Map();
  function activeCadWorkRegion(){return state.cadWorkRegionId?state.drawingRegions.find(r=>r.id===state.cadWorkRegionId)||null:null;}
  function floorForRegion(regionId){return state.floors.find(f=>f.sourceRegionId===regionId)||state.floors.find(f=>state.references.some(r=>r.type==='linkedCadRegion'&&r.regionId===regionId&&r.floorId===f.id))||null;}
  let cadRegionMemory={projectId:null,byFloor:new Map()};
  function rememberedCadRegion(floor){if(cadRegionMemory.projectId!==state.projectId)cadRegionMemory={projectId:state.projectId,byFloor:new Map()};const remembered=cadRegionMemory.byFloor.get(floor?.id);return state.drawingRegions.find(r=>r.id===remembered&&floorForRegion(r.id)?.id===floor?.id)?.id||state.drawingRegions.find(r=>r.id===floor?.sourceRegionId)?.id||null;}
  function regionPlanExists(region){const floor=floorForRegion(region.id);return Boolean(floor&&state.objects.some(o=>isSemanticObject(o)&&o.floorId===floor.id&&(o.sourceRegionId===region.id||floor.sourceRegionId===region.id)));}
  function cadSourceObject(o){return isCadObject(o)||(o?.type==='line'&&!o.floorId);}
  function cadRegionCacheKey(region){return region?`${region.id}:${region.minx}:${region.miny}:${region.maxx}:${region.maxy}`:'__full__';}
  function cadObjectsForRegion(region=null){const rev=state.cadRenderRevision||0;if(cadWorkObjectCacheRevision!==rev||cadWorkObjectCacheSource!==state.objects||cadWorkObjectCacheLength!==state.objects.length){cadWorkObjectCacheRevision=rev;cadWorkObjectCacheSource=state.objects;cadWorkObjectCacheLength=state.objects.length;cadWorkObjectCache.clear();}const key=cadRegionCacheKey(region);if(cadWorkObjectCache.has(key))return cadWorkObjectCache.get(key);const list=state.objects.filter(o=>cadSourceObject(o)&&(!region||objectTouchesRegion(o,region)));if(list.some(o=>Number.isFinite(o.drawOrder)))list.sort((a,b)=>(a.drawOrder||0)-(b.drawOrder||0));cadWorkObjectCache.set(key,list);return list;}
  function cadWorkObjects(){return cadObjectsForRegion(activeCadWorkRegion());}
  function cadObjectInWorkScope(o){if(!cadSourceObject(o))return false;const region=activeCadWorkRegion();return !region||objectTouchesRegion(o,region);}
  function cadPlanFloor(){const region=activeCadWorkRegion();return region?floorForRegion(region.id):activeFloor();}
  function componentObjectsForCad(){const floor=cadPlanFloor(),region=activeCadWorkRegion();if(!floor)return[];return state.objects.filter(o=>o.type==='component'&&(!o.floorId||o.floorId===floor.id)&&(!region||objectTouchesRegion(o,region)));}
  function cadPlanOverlayObjects(){if(!state.cadPlanOverlay)return[];const floor=cadPlanFloor();if(!floor)return[];return state.objects.filter(o=>o.type!=='component'&&(isSemanticObject(o)||o.type==='line')&&(!o.floorId||o.floorId===floor.id));}
  function cadSelectableObjects(){if(!cadContext)initializeCadServices();const candidates=[...cadWorkObjects(),...componentObjectsForCad(),...cadPlanOverlayObjects()];return candidates.filter(o=>cadPolicy(o.id,'select').allowed);}
  function setCadWorkRegion(regionId,{fit=false}={}){const previous=viewFloor(),position=buildingCamera();cadCommandSession?.cancel('region-change');const region=regionId?state.drawingRegions.find(r=>r.id===regionId):null;state.cadWorkRegionId=region?.id||null;state.selectedRegionId=region?.id||null;const floor=region&&floorForRegion(region.id);if(floor){if(cadRegionMemory.projectId!==state.projectId)cadRegionMemory={projectId:state.projectId,byFloor:new Map()};cadRegionMemory.byFloor.set(floor.id,region.id);state.activeFloorId=floor.id;state.activeBuildingId=floor.buildingId;}state.cadRotate=null;if(state.activeTool==='region-rotate'){state.activeTool='select';state.activeCommand=null;host.dataset.tool='select';}clearMultiSelection();state.hoveredObjectId=null;state.trimPreview=null;if(!preserveFloorCamera(previous,viewFloor(),position)&&fit&&region)fitBounds(region);renderToolRail();updateContextBar();renderCadScopeControl();renderPrimaryPanel();renderReferences();renderProperties();render();}

  function renderCadScopeControl(){
    if(!dom.cadScopeHost)return;
    dom.cadScopeHost.innerHTML='';
    dom.cadScopeHost.hidden=state.toolset!=='cad';
    if(state.toolset!=='cad')return;
    const active=activeCadWorkRegion();
    const card=document.createElement('div');card.className='cad-scope-card';
    const top=document.createElement('div');top.className='cad-scope-top';
    const label=document.createElement('span');label.className='cad-scope-label';label.textContent=t('cadScope.label');
    const select=document.createElement('select');select.className='cad-scope-select';select.setAttribute('aria-label',t('cadScope.label'));
    const full=document.createElement('option');full.value='';full.textContent=t('cadScope.full');select.append(full);
    for(const region of state.drawingRegions){const option=document.createElement('option');option.value=region.id;option.textContent=(region.name||t('region.unnamed'))+(regionPlanExists(region)?' · '+t('region.hasPlan'):'');select.append(option);}
    select.value=active?.id||'';
    select.addEventListener('change',()=>setCadWorkRegion(select.value||null,{fit:Boolean(select.value)}));
    top.append(label,select);card.append(top);
    const floorSelect=document.createElement('select');floorSelect.className='cad-scope-select';floorSelect.setAttribute('aria-label',t('feature.currentFloor'));const empty=document.createElement('option');empty.value='';empty.textContent=t('feature.currentFloor');floorSelect.append(empty);for(const f of state.floors){const o=document.createElement('option');o.value=f.id;o.textContent=`${state.buildings.find(b=>b.id===f.buildingId)?.name||''} · ${f.name}`;floorSelect.append(o);}floorSelect.value=active?floorForRegion(active.id)?.id||'':'';floorSelect.onchange=()=>{if(floorSelect.value)setActiveFloor(floorSelect.value);};card.append(floorSelect);
    const meta=document.createElement('div');meta.className='cad-scope-meta';
    const count=active?cadObjectsForRegion(active).length:cadObjectsForRegion(null).length;
    meta.textContent=t('cadScope.metaObjects',{count:count.toLocaleString()});
    card.append(meta);dom.cadScopeHost.append(card);
  }
  // CAD-only composition root. Plan routes and persistent schema stay in app.
  let cadCommandSession = null;
  function cadCommands(){
    if(cadCommandSession)return cadCommandSession;
    const core=modules.commandFoundation, registry=core.createRegistry();
    const transaction=core.createTransaction({
      capture:()=>({snapshot:historySnapshot(),history:state.history.slice(),future:state.future.slice(),editLog:state.editLog.slice(),selectedObjectId:state.selectedObjectId,selectedObjectIds:new Set(state.selectedObjectIds),selectedRegionId:state.selectedRegionId}),
      restore:saved=>{restoreHistorySnapshot(saved.snapshot);state.history=saved.history;state.future=saved.future;state.editLog=saved.editLog;state.selectedObjectId=saved.selectedObjectId;state.selectedObjectIds=saved.selectedObjectIds;state.selectedRegionId=saved.selectedRegionId;rebuildObjectSnapIndex({touch:false});updateUndoRedo();},
      record:saved=>{appendHistoryEntry(saved.snapshot);}
    });
    modules.build25CommandAdapters.install(registry,{
      undo:()=>performUndo(),redo:()=>performRedo(),
      beginRotation:()=>beginCadRegionRotationLegacy()?state.cadRotate:null,
      snap:p=>nearestSnap(p),zoom:()=>state.camera.zoom,previewPoint:p=>{state.previewEnd=p;},
      prompt:(key,kind='strong')=>setCommandStatus(t(key),kind),
      previewDelta:r=>cadRegionTransform.previewDelta(r),
      validRotation:r=>{if(state.toolset!=='cad'||state.cadWorkRegionId!==r.regionId||!state.drawingRegions.some(x=>x.id===r.regionId))return false;const ids=new Set(state.objects.filter(cadSourceObject).map(o=>o.id));return [...r.objectIds].every(id=>ids.has(id));},
      commitRotation:delta=>commitCadRegionRotationLegacy(delta),
      clearRotation:(draft,reason)=>{if(state.cadRotate===draft)state.cadRotate=null;if(reason!=='finished'){state.previewEnd=null;state.snapIndicator=null;if(state.activeTool==='region-rotate'){state.activeTool='select';state.activeCommand=null;host.dataset.tool='select';}renderToolRail();updateContextBar();render();}}
    });
    modules.nativeLineCommand.install(registry,{
      contextToken:()=>cadContextToken(),contextCurrent:(token,opts)=>cadContextTokenCurrent(token,opts),
      resolvePoint:(point,{base=null,shift=false,typed=false}={})=>resolveCadPoint(point,{base,shift,typed}),
      preview:(a,b)=>{state.drawStart=a?{...a}:null;state.previewEnd=b?{...b}:null;render();},
      prompt:key=>setCommandStatus(t(key),'strong'),
      commitLine:(a,b)=>commitNativeCadLine(a,b),
      clearPreview:()=>{state.drawStart=null;state.previewEnd=null;state.snapIndicator=null;updateAll();}
    });
    modules.nativePolylineCommand.install(registry,{
      contextToken:()=>cadContextToken(),contextCurrent:(token,opts)=>cadContextTokenCurrent(token,opts),
      resolvePoint:(point,{base=null,shift=false,typed=false}={})=>resolveCadPoint(point,{base,shift,typed}),
      parsePoint:(text,{base=null,direction=null}={})=>parseCadPointText(text,{base,direction}),
      bulgeFromControl:(a,b,c)=>{const g=circleFromThreePoints(a,b,c);return g?Math.tan(rad(g.sweep)/4):NaN;},
      preview:view=>{state.polylinePreview=view;render();},
      prompt:key=>setCommandStatus(t(key),'strong'),
      commitPolyline:(points,closed)=>commitNativeCadPolyline(points,closed),
      clearPreview:()=>{state.polylinePreview=null;state.snapIndicator=null;updateAll();}
    });
    modules.nativeDrawCommands.install(registry,{
      contextToken:()=>cadContextToken(),contextCurrent:(token,opts)=>cadContextTokenCurrent(token,opts),
      resolvePoint:(point,{base=null,shift=false,typed=false}={})=>resolveCadPoint(point,{base,shift,typed}),
      parsePoint:(text,{base=null,direction=null}={})=>parseCadPointText(text,{base,direction}),
      parseLength:text=>cadUnitsModule.parseLength(text,{defaultUnit:state.unitSystem==='imperial'?'in':'mm'}),
      arcFromThreePoints:(start,end,through)=>circleFromThreePoints(start,end,through),
      preview:view=>{state.cadPrimitivePreview=view;render();},
      prompt:(id,phase)=>setCommandStatus(t(id==='REC'?(phase==='first'?'command.rectangleFirst':'command.rectangleOpposite'):id==='C'?(phase==='center'?'command.circleCenter':'command.circleRadius'):(phase==='start'?'command.arcStart':phase==='through'?'command.arcThrough':'command.arcEnd')),'strong'),
      commitRectangle:(a,b)=>commitNativeCadRectangle(a,b),
      commitCircle:(center,radius)=>commitNativeCadCircle(center,radius),
      commitArc:geometry=>commitNativeCadArc(geometry),
      clearPreview:()=>{state.cadPrimitivePreview=null;state.snapIndicator=null;updateAll();}
    });
    modules.nativeMatchprop.install(registry,{token:cadContextToken,current:cadContextTokenCurrent,
      allowed:(id,purpose)=>cadSourceKind(cadContext.getById(id))==='cad-source'&&cadPolicy(id,purpose).allowed,
      prompt:key=>setCommandStatus(t(key),'strong'),select:ids=>{setSelectionIds(ids);render();},
      apply:(source,ids)=>matchCadProperties(source,ids,{refresh:false}),clear:()=>{state.activeCommand=null;state.activeTool='select';host.dataset.tool='select';updateAll();}
    });
    modules.nativeModifyCommands.install(registry,{
      token:cadContextToken,current:cadContextTokenCurrent,allowed:id=>cadPolicy(id,'modify').allowed,
      pick:hitObject,resolve:(point,base)=>resolveCadPoint(point,{base}).point,
      parsePoint:parseCadPointText,parseLength:text=>cadUnitsModule.parseLength(text,{defaultUnit:state.unitSystem==='imperial'?'in':'mm'}),
      prompt:(id,phase)=>{const key=id==='BR'&&phase==='result'?'cadModify.breakSecond':id==='J'?(phase==='source'?'cadModify.joinSource':'cadModify.joinSecond'):id==='CH'?(phase==='source'?'cadModify.chamferSource':phase==='second'?'cadModify.chamferSecond':'cadModify.'+phase):id==='F'?(phase==='source'?'cadModify.filletSource':phase==='second'?'cadModify.filletSecond':'cadModify.'+phase):'cadModify.'+phase;setCommandStatus(id+' · '+t(key),'strong');},
      preview:plan=>{cadOperationPreview=plan?{...plan,token:cadContextToken()}:null;render();},commit:commitCadOperation,
      source:id=>{cadModifySourceId=id||null;render();},
      clear:()=>{cadOperationPreview=null;cadModifySourceId=null;state.activeCommand=null;state.activeTool='select';host.dataset.tool='select';updateAll();}
    });
    modules.nativeTransformCommands.install(registry,{
      token:cadContextToken,current:cadContextTokenCurrent,
      allowed:id=>{const o=cadContext?.getById(id)||state.objects.find(x=>x.id===id);return Boolean(o&&cadSourceKind(o)==='cad-source'&&cadPolicy(id,'modify').allowed&&modules.cadTransformOperations.supports(o));},
      preselected:()=>[...selectionIds()],pick:hitObject,resolve:(point,base)=>resolveCadPoint(point,{base}).point,parsePoint:parseCadPointText,
      rect:rectFromPoints,stretchCandidates:cadStretchCandidates,planMatrix:planCadMatrix,planArray:planCadArray,planPolarArray:planCadPolarArray,planStretch:planCadStretch,
      prompt:(id,phase,count)=>setCommandStatus(`${id} · ${t('cadTransform.'+phase,{count})}`,'strong'),
      select:ids=>{setSelectionIds(new Set(ids));render();},preview:plan=>{cadOperationPreview=plan?{...plan,token:cadContextToken()}:null;render();},
      focus:()=>queueMicrotask(()=>{if(modules.nativeTransformCommands.ids.includes(cadCommandSession?.activeId)){dom.commandInput.focus();commandConsole.hideSuggestions();}}),
      commit:(id,plan)=>commitCadTransformPlan(id,plan),
      clear:()=>{cadOperationPreview=null;state.activeCommand=null;state.activeTool='select';host.dataset.tool='select';updateAll();}
    });
    cadCommandSession=core.createSession({registry,transaction,context:()=>({mode:state.toolset,regionId:state.cadWorkRegionId,token:cadContextToken()})});
    return cadCommandSession;
  }
  function reportCadCommand(result){if(result&&!result.ok&&['selection-required','invalid-number','invalid-keyword'].includes(result.code))setCommandStatus(t('cadTransform.invalid'),'error');if(result&&!result.ok&&['invalid-distance','unsupported-geometry','no-valid-result','invalid-coordinate','zero-size','zero-length'].includes(result.code))setCommandStatus(t('cadModify.invalid'),'error');if(result&&!result.ok&&result.code==='polyline-too-short')setCommandStatus(t('polyline.needMore'),'error');if(result&&!result.ok&&result.code==='invalid-arc')setCommandStatus(t('polyline.invalidArc'),'error');if(result&&!result.ok&&result.code==='arc-control-required')setCommandStatus(t('polyline.arcPending'),'error');if(result?.code==='command-failed'){setTool('select','select');setCommandStatus(cadFaultMessage(result.errorCode||result.message), 'error');}else if(result&&!result.ok&&['stale-context','target-not-modifiable','locked-layer','missing-object','missing-history-recorder'].includes(result.code))setCommandStatus(cadFaultMessage(result.code),'error');return result;}
  function beginCadRegionRotation(){if(!activeCadWorkRegion()||state.toolset!=='cad')return false;return reportCadCommand(cadCommands().start('RR')).ok;}
  function updateCadRotatePointer(raw,{shift=false}={}){return reportCadCommand(cadCommands().preview({point:raw,shift}));}
  function commitCadRegionRotation(deltaDeg){return reportCadCommand(cadCommands().commit(deltaDeg)).ok;}
  function rotatePointAround(point,base,deltaDeg){return cadRegionTransform.rotatePoint(point,base,deltaDeg);}
  function cadRotatePreviewDelta(){return cadRegionTransform.previewDelta(state.cadRotate);}
  function beginCadRegionRotationLegacy(){const region=activeCadWorkRegion();if(!region)return false;const objects=cadWorkObjects();state.cadRotate={regionId:region.id,objectIds:new Set(objects.map(o=>o.id)),phase:'base',base:null,referencePoint:null,referenceAngle:null,targetPoint:null,targetAngle:null};clearMultiSelection();state.hoveredObjectId=null;state.trimPreview=null;setCommandStatus(t('command.rotateBase',{name:region.name||t('region.unnamed'),count:objects.length.toLocaleString()}),'strong');return true;}
  function rotateCadSourceObject(obj,base,deltaDeg){return cadRegionTransform.rotateCadObject(obj,base,deltaDeg);}
  function rotatedRegionBounds(region,base,deltaDeg){return cadRegionTransform.rotatedRectBounds(region,base,deltaDeg);}
  function commitCadRegionRotationLegacy(deltaDeg){const r=state.cadRotate,region=r&&state.drawingRegions.find(x=>x.id===r.regionId);if(!r||!region||!r.base||!Number.isFinite(deltaDeg))return false;if(Math.abs(deltaDeg)<1e-8){state.cadRotate=null;setTool('select','select');setCommandStatus(t('command.rotateNoChange'),'strong');return true;}pushHistory();const ids=r.objectIds;for(const obj of state.objects)if(ids.has(obj.id))rotateCadSourceObject(obj,r.base,deltaDeg);Object.assign(region,rotatedRegionBounds(region,r.base,deltaDeg));recordEdit('rotate-region',{regionId:region.id,angle:deltaDeg,objectCount:ids.size,base:{...r.base}});markDirty(true);rebuildObjectSnapIndex();state.cadRotate=null;setTool('select','select');renderCadScopeControl();renderPrimaryPanel();renderReferences();setCommandStatus(t('command.rotateApplied',{angle:formatNumber(deltaDeg,3),count:ids.size.toLocaleString()}),'strong');return true;}
  function setCadRotateAbsoluteAngle(targetDeg){const r=state.cadRotate;if(!r||r.phase!=='target'||!Number.isFinite(r.referenceAngle)||!Number.isFinite(targetDeg))return false;r.targetAngle=targetDeg;return commitCadRegionRotation(cadRotatePreviewDelta());}
  function semanticObjectsOnActiveFloor(){ensureFloorModel();return getPlanObjects().filter(isSemanticObject);}
  function addBuilding(){ensureFloorModel();pushHistory();let n=1,name;const names=new Set(state.buildings.map(b=>String(b.name||'').toLocaleLowerCase()));const base=i18n.language==='ko'?'건물':'Building';do{name=`${base} ${n++}`;}while(names.has(name.toLocaleLowerCase()));const building={id:`building_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name,order:state.buildings.length};state.buildings.push(building);state.activeBuildingId=building.id;state.expandedBuildingIds.add(building.id);normalizeHierarchyOrder();markDirty(true);renderPlanFloorPanel();}
  function commitBuildingRename(building,value){const target=state.buildings.find(b=>b.id===building?.id)||building,name=String(value||'').trim();if(!target||!name||name===target.name){renderPlanFloorPanel();return;}pushHistory();target.name=name;target.nameSource='user';markDirty(true);renderPlanFloorPanel();}
  function deleteBuilding(building){ensureFloorModel();if(state.buildings.length<=1){setCommandStatus(t('building.keepOne'),'error');return;}const floorIds=new Set(floorsForBuilding(building.id).map(f=>f.id));showAppConfirm({title:t('building.deleteTitle',{name:building.name}),copy:t('building.deleteConfirm',{name:building.name}),confirmLabel:t('building.deleteAction',{name:building.name}),onConfirm:()=>{pushHistory();state.objects=state.objects.filter(o=>!floorIds.has(o.floorId));state.floors=state.floors.filter(f=>f.buildingId!==building.id);state.buildings=state.buildings.filter(b=>b.id!==building.id);state.expandedBuildingIds.delete(building.id);for(const id of floorIds)state.expandedFloorIds.delete(id);const nextBuilding=state.buildings[0];state.activeBuildingId=nextBuilding.id;if(!state.floors.length){state.floors=[{id:`floor_${Date.now()}`,name:'1F',sourceRegionId:null,discipline:'architectural',buildingId:nextBuilding.id,order:0}];}state.activeFloorId=state.floors[0].id;normalizeHierarchyOrder();clearMultiSelection();markDirty(true);rebuildObjectSnapIndex();updateAll();}});}
  function addFloor(buildingId=state.activeBuildingId){ensureFloorModel();const building=state.buildings.find(b=>b.id===buildingId)||activeBuilding();pushHistory();let n=1,name;const siblingNames=new Set(floorsForBuilding(building.id).map(f=>String(f.name||'').toLocaleLowerCase()));const base=i18n.language==='ko'?'도면':'Drawing';do{name=`${base} ${n++}`;}while(siblingNames.has(name.toLocaleLowerCase()));const floor={id:`floor_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name,sourceRegionId:null,discipline:'architectural',buildingId:building.id,order:floorsForBuilding(building.id).length};state.floors.push(floor);state.activeBuildingId=building.id;state.activeFloorId=floor.id;state.expandedBuildingIds.add(building.id);normalizeHierarchyOrder();clearMultiSelection();markDirty(true);updateAll();switchInspector('primary');}
  function commitFloorRename(floor,value){const name=String(value||'').trim();if(!name||name===floor.name){renderPlanFloorPanel();return;}pushHistory();floor.name=name;markDirty(true);updateAll();}
  function showAppConfirm({title,copy,confirmLabel,onConfirm,danger=true,secondaryLabel=null,onSecondary=null,onCancel=null,focus='confirm'}){
    state.confirmAction=typeof onConfirm==='function'?onConfirm:null;state.confirmSecondaryAction=typeof onSecondary==='function'?onSecondary:null;state.confirmCancelAction=typeof onCancel==='function'?onCancel:null;
    dom.confirmTitle.textContent=title;dom.confirmCopy.textContent=copy;dom.confirmApplyBtn.textContent=confirmLabel;dom.confirmApplyBtn.classList.toggle('danger',danger);
    if(dom.confirmSaveBtn){dom.confirmSaveBtn.hidden=!secondaryLabel;dom.confirmSaveBtn.textContent=secondaryLabel||'';}
    dom.confirmBackdrop.hidden=false;
    if(focus==='cancel')dom.confirmCancelBtn.focus();else if(focus==='secondary'&&secondaryLabel)dom.confirmSaveBtn?.focus();else dom.confirmApplyBtn.focus();
  }
  function hideAppConfirm({cancel=false}={}){const cancelFn=cancel?state.confirmCancelAction:null;dom.confirmBackdrop.hidden=true;state.confirmAction=null;state.confirmSecondaryAction=null;state.confirmCancelAction=null;if(dom.confirmSaveBtn)dom.confirmSaveBtn.hidden=true;if(cancelFn)cancelFn();}
  function deleteFloor(floor){ensureFloorModel();if(state.floors.length<=1){setCommandStatus(t('floor.keepOne'),'error');return;}showAppConfirm({title:t('floor.deleteTitle',{name:floor.name}),copy:t('floor.deleteConfirm',{name:floor.name}),confirmLabel:t('floor.deleteAction',{name:floor.name}),onConfirm:()=>{pushHistory();state.objects=state.objects.filter(o=>!o.floorId||o.floorId!==floor.id);state.floors=state.floors.filter(f=>f.id!==floor.id);for(const f of state.floors)if(f.viewAlignment?.referenceFloorId===floor.id)f.viewAlignment={...f.viewAlignment,referenceFloorId:null};state.expandedFloorIds.delete(floor.id);const fallback=state.floors.find(f=>f.buildingId===floor.buildingId)||state.floors[0];state.activeFloorId=fallback.id;state.activeBuildingId=fallback.buildingId;normalizeHierarchyOrder();clearMultiSelection();markDirty(true);rebuildObjectSnapIndex();updateAll();}});}
  function setActiveFloor(id){const previous=viewFloor(),position=buildingCamera();const floor=state.floors.find(f=>f.id===id);if(!floor)return;if(id!==state.activeFloorId){cancelImportJob();featureFill?.discardTransient();cancelTransient();}state.activeFloorId=id;state.activeBuildingId=floor.buildingId;if(state.toolset==='cad'){cadCommandSession?.cancel('floor-change');state.cadWorkRegionId=rememberedCadRegion(floor);state.selectedRegionId=state.cadWorkRegionId;state.trimPreview=null;}const preserved=preserveFloorCamera(previous,floor,position);clearSpaceGapDiagnostic({silent:true});clearMultiSelection();rebuildObjectSnapIndex({touch:false,scope:'plan'});const f=activeFloor();if(!preserved&&f?.sourceRegionId){const r=state.drawingRegions.find(x=>x.id===f.sourceRegionId);if(r)fitBounds(r);}updateAll();}

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
    plan:ko?`<h2>Plan Mode</h2><p>건물의 Plan 도면과 공간을 구조화하는 모드입니다. 오른쪽 <strong>구획</strong> 탭에서 현재 도면을 바꾸고, 왼쪽 <strong>요소</strong> 도구에서 문·창·공간을 배치합니다. 각 <strong>도면</strong>을 펼치면 연결된 CAD/이미지/DXF 참조 도면의 표시와 불투명도를 바로 조절할 수 있고, 선택한 참조의 속성에서 기준 치수를 다룹니다. DXF 레이어 표시는 CAD Mode에서 관리합니다. Plan Mode에서는 사용자에게 선과 벽을 별도 객체로 나누지 않습니다. <kbd>L</kbd> 또는 <strong>그리기 → 선</strong>으로 만든 선이 평면 경계가 되고, 문·창·공간 관계와 필요한 속성을 그 선에 연결합니다. 곡선 경계도 <strong>그리기 → 곡선</strong>에서 만들 수 있습니다.</p><h3>도구와 명령</h3><p>왼쪽 도구막대는 <strong>선택 · 그리기 · 요소 · 수정</strong>으로 묶습니다. 거리는 선택 그룹에, 이동·복사·잘라내기·연장은 수정 그룹에 둡니다. Plan Mode에서도 <kbd>L</kbd>, <kbd>TR</kbd>, <kbd>EX</kbd>, <kbd>E</kbd>, <kbd>DI</kbd>, Undo/Redo 같은 공통 명령을 사용할 수 있으며 원본 DXF가 아니라 현재 층의 Plan 모델만 편집합니다. 도구별 길이·각도 입력은 캔버스 왼쪽 위의 floating HUD에 표시되어 작업 중 캔버스 높이가 바뀌지 않습니다.</p><h3>Shift와 접합</h3><ul><li>Plan Mode에서 <kbd>Shift</kbd>는 기하 제약 전용입니다. TR/EX를 서로 바꾸는 용도로 사용하지 않습니다.</li><li>그리기와 끝점 편집에서는 도면의 GLOBAL 0/45/90/…°와 연결선 기준 REF 0/45/90/…° 후보를 동시에 사용하고, 기존 선의 현재 각도도 후보에 포함합니다.</li><li>선 전체를 이동할 때는 GLOBAL 수평·수직 또는 연결선의 평행·수직 방향 중 포인터 이동에 가장 가까운 축으로 제한할 수 있습니다.</li><li>선 몸통을 끌면 선택한 선만 강체 이동하고 기존 Wall-to-Wall 접합은 해제됩니다. 접합 자체를 편집하려면 끝점 핸들을 끕니다.</li><li>끝점↔끝점 접합은 끝점 편집에서 같은 Junction으로 유지합니다. 선 끝이 다른 선의 중간에 붙는 T 접합은 Point-on-Edge 제약으로 유지되어 host의 고정 비율에 묶이지 않고 선 위를 미끄러지며, 가능한 경우 branch의 기존 방향을 유지합니다.</li></ul><h3>참조 도면 스냅</h3><p>Plan Mode의 기본 SNAP은 Plan 객체만 대상으로 합니다. <kbd>Ctrl</kbd>을 누르는 동안에만 뒤쪽 CAD/참조 도면의 끝점·중간점·교점을 임시 스냅 후보로 포함합니다. <kbd>Ctrl+Shift</kbd>는 참조 스냅과 각도 제약을 함께 사용합니다.</p><h3>문 직접 조작</h3><p>문틀/개구부 span 전체를 끌면 host 선을 따라 위치를 옮깁니다. 가운데 점은 위치 이동 affordance로 남습니다. 여닫이문의 문짝/개폐호 stroke 근처에서만 방향 gesture가 동작하며, host에 수직인 gesture는 열림 방향을, host를 따르는 gesture는 경첩 방향을 반전합니다. 개폐 부채꼴 내부는 넓게 선택할 수 있지만 그 안을 끌었다고 방향이 바뀌지는 않습니다. 방화셔터는 hinge/swing gesture를 사용하지 않습니다.</p><h3>CAD 구조 인식</h3><ul><li>여러 평행 제도선을 하나의 Wall Band로 해석한 뒤 Plan 경계선으로 단순화</li><li>작은 끝점/코너 오차를 제한적으로 연결</li><li>문 개구부와 여닫이 호를 문 후보로 인식하고, DXF에서 짧은 선분으로 분해된 여닫이 호도 보수적으로 복원</li><li>반복 계단선을 하나의 계단 의미 객체로 축약</li><li>분절된 원호/곡선은 가능한 경우 하나의 의미 곡선으로 복원</li><li>T자/끝점/L자 접합은 실제 교점까지 정규화하되 단순 X자 교차는 자동 분절하지 않음</li><li>짧은 overrun과 명확한 누락 구간만 보수적으로 정리</li></ul><h3>편집</h3><p>클릭 선택과 Window/Crossing 드래그 다중 선택을 지원합니다. TRIM에서는 마우스로 가리킨 삭제 예정 구간을 빨간 overlay로 먼저 보여줍니다. SNAP은 배치 보조이고 Constraint는 지속 관계입니다. 수평/수직/평행/직각/길이/각도/기준축 제약을 사용할 수 있습니다.</p><p><strong>재인식</strong>은 현재 층에 1:1로 연결된 CAD 영역의 <strong>자동 인식 레이어를 다시 생성</strong>합니다. 체크 해제한 자동 인식 종류는 기존 결과도 제거하며, 직접 만든 객체와 수동으로 수정한 인식 객체는 유지합니다. 다른 CAD 영역의 결과를 같은 층에 누적하지 않습니다.</p>`:`<h2>Plan Mode</h2><p>Plan Mode uses connected plan lines as the floor-plan boundary model and attaches semantic elements such as doors, windows and spaces. LINE, MOVE, COPY, TRIM, EXTEND, ERASE and DIST edit the Plan model without modifying raw DXF. A floating context HUD appears over the canvas without resizing it.</p><p>In Plan Mode, <strong>Shift</strong> is reserved for geometry constraints. Drawing and endpoint edits evaluate global 45° candidates together with 45° candidates relative to connected/reference lines, while whole-line movement can lock to global horizontal/vertical or connected-line parallel/perpendicular axes. Shift does not swap TRIM and EXTEND in Plan Mode. Dragging a line body rigidly moves only that line and detaches wall-to-wall joins; drag an endpoint handle to edit a junction. Endpoint-to-endpoint joins keep a persistent junction during endpoint editing. Endpoint-to-segment T joins use a point-on-edge constraint so the attachment can slide along its host instead of staying at a fixed percentage. Hold Ctrl to temporarily snap to CAD/reference endpoints, midpoints and intersections; Shift remains the angle modifier.</p><p>For doors, drag anywhere on the frame/opening span to move along the host line. Hinge/swing gestures are limited to the leaf or swing-arc strokes; the swing-sector interior remains selectable without becoming a flip gesture zone. Fire Door and Fire Shutter are semantic elements; current FD/FS markers are application labels rather than statutory symbols.</p><p><strong>Re-recognize</strong> rebuilds the automatic recognition layer for the linked CAD region. Unchecked automatic object types are removed, while user-created and manually changed objects are preserved.</p>`,
    cad:ko?`<h2>CAD Mode</h2><p>DXF 원본의 geometry/layer를 직접 확인·수정합니다. 참조 DXF를 Plan Mode에서 보고 다시 CAD Mode로 돌아갈 때는 불필요한 변환 설정 창을 띄우지 않습니다.</p><h3>현재 주요 명령</h3><ul><li>LINE (L) / PLINE (PL)</li><li>TRIM (TR) / EXTEND (EX), Shift로 반대 명령 임시 사용</li><li>BREAK (BR) / JOIN (J) / OFFSET (O) / FILLET (F)</li><li>선택한 PLINE 속성/우클릭에서 열기·닫기</li><li>특정 작업 범위에서 ROTATE (RO)</li><li>ERASE (E), DIST (DI), ZOOM (Z), EXTENTS (E)</li><li>F3 SNAP, F7 GRID, F8 ORTHO, F10 POLAR</li></ul><p>Plan에서 새로 만든 의미 객체를 CAD/DXF로 변환할 때만 CAD 표현 설정이 필요할 수 있습니다.</p>`:`<h2>CAD Mode</h2><p>Work directly with DXF geometry and layers. Returning from a referenced CAD drawing does not require mapping settings; mapping is for Plan-to-CAD conversion.</p><h3>Current core commands</h3><ul><li>LINE (L) / PLINE (PL)</li><li>TRIM (TR) / EXTEND (EX), with Shift for the temporary opposite command</li><li>BREAK (BR) / JOIN (J) / OFFSET (O) / FILLET (F)</li><li>Open/Close selected PLINE from Properties/context menu</li><li>ROTATE (RO) in scoped workflows</li><li>ERASE (E), DIST (DI), ZOOM (Z), EXTENTS (E)</li><li>F3 SNAP, F7 GRID, F8 ORTHO, F10 POLAR</li></ul>`,
    files:ko?`<h2>파일과 프로젝트</h2><ul><li><strong>새 도면</strong>: 현재 작업을 초기화합니다.</li><li><strong>프로젝트 열기/저장</strong>: .pprj 작업 상태에 층, Plan/CAD 객체, 공간 이름/유형, 레이어, 참조, 카메라와 인식 이력을 저장합니다. 기존 .ppln/.pieniplan 파일도 계속 열 수 있으며 다음 휴대용 저장은 .pprj를 사용합니다. 쓰기 권한을 가진 파일 핸들로 연 프로젝트는 이후 저장에서 그 파일을 갱신합니다. 그 외에는 다운로드하지 않고 이 브라우저의 로컬 프로젝트 저장소에 저장합니다.</li><li><strong>프로젝트 내보내기 (PPRJ)</strong>: 다른 기기나 브라우저로 옮길 수 있는 .pprj 파일을 명시적으로 만듭니다.</li><li><strong>플랜 내보내기/가져오기 (PPKG)</strong>: CAD 원본과 참조 파일을 제외한 Plan 의미 도면만 패키지로 교환합니다.</li><li><strong>DXF 열기</strong>: CAD Mode에서 편집 가능한 DXF를 엽니다.</li><li><strong>DXF 내보내기</strong>: 현재 도면을 DXF로 생성합니다. 지원 브라우저에서는 운영체제의 저장 창에서 위치와 파일명을 직접 정하며, 지원하지 않는 브라우저에서는 파일명을 먼저 확인한 뒤 브라우저 다운로드 위치를 사용한다고 안내합니다.</li></ul><p>원본 DXF는 자동으로 덮어쓰지 않습니다.</p>`:`<h2>Files & projects</h2><p>.pprj stores the editable project state; legacy .ppln/.pieniplan files remain readable. Projects opened with a writable file handle update that file in place. Otherwise Save uses browser-local storage without silently downloading a file. Use Export Project (PPRJ) when you explicitly need a portable project file. Plan-only exchange uses PPKG. DXF export is separate and never silently overwrites the source DXF. When the browser supports a native Save As picker, you choose the location and file name; otherwise PieniPlan asks for the file name and clearly explains that the browser controls the download location.</p>`,
    shortcuts:ko?`<h2>단축키</h2><table class="help-shortcuts"><tr><td><kbd>Ctrl/Cmd+Z</kbd></td><td>실행 취소</td></tr><tr><td><kbd>Ctrl/Cmd+Shift+Z</kbd></td><td>다시 실행</td></tr><tr><td><kbd>Ctrl/Cmd+S</kbd></td><td>프로젝트 저장</td></tr><tr><td><kbd>Delete</kbd></td><td>선택 객체 삭제</td></tr><tr><td><kbd>Esc</kbd> / <kbd>⌘.</kbd></td><td>CAD 현재 명령 취소 / 선택 복귀 (⌘.는 macOS 보조키)</td></tr><tr><td><kbd>F3</kbd></td><td>SNAP</td></tr><tr><td><kbd>F7</kbd></td><td>GRID</td></tr><tr><td><kbd>F8</kbd></td><td>ORTHO</td></tr><tr><td><kbd>F10</kbd></td><td>POLAR</td></tr><tr><td><kbd>Shift</kbd></td><td>Plan: GLOBAL+REF 45° 기하 제약 / 선 이동축 제한 · CAD: ORTHO 임시 반전</td></tr><tr><td><kbd>Ctrl</kbd></td><td>Plan: 누르는 동안 뒤쪽 CAD/참조 도면 스냅 허용</td></tr><tr><td><kbd>L / PL / REC / C / A</kbd></td><td>LINE / PLINE / RECTANGLE / CIRCLE / ARC</td></tr><tr><td><kbd>TR</kbd> / <kbd>EX</kbd></td><td>TRIM / EXTEND</td></tr><tr><td><kbd>J</kbd></td><td>JOIN</td></tr><tr><td><kbd>O</kbd> / <kbd>F</kbd></td><td>OFFSET / FILLET</td></tr><tr><td><kbd>Space</kbd></td><td>Plan: 선택 복귀 · CAD: Enter와 동일 · 길게 눌러 드래그: Pan</td></tr><tr><td><kbd>Enter</kbd></td><td>빈 커맨드에서 마지막 명령 반복 / 진행 중 단계 확정</td></tr><tr><td><kbd>S</kbd></td><td>CAD: STRETCH · Plan: 직접 편집 도구 사용 · 저장은 Ctrl/Cmd+S</td></tr></table>`:`<h2>Shortcuts</h2><table class="help-shortcuts"><tr><td><kbd>Ctrl/Cmd+Z</kbd></td><td>Undo</td></tr><tr><td><kbd>Ctrl/Cmd+Shift+Z</kbd></td><td>Redo</td></tr><tr><td><kbd>Ctrl/Cmd+S</kbd></td><td>Save project</td></tr><tr><td><kbd>Esc</kbd> / <kbd>⌘.</kbd></td><td>Cancel the active CAD command and return to Select (⌘. is the macOS fallback).</td></tr><tr><td><kbd>F3/F7/F8/F10</kbd></td><td>SNAP / GRID / ORTHO / POLAR</td></tr><tr><td><kbd>Shift</kbd></td><td>Plan: GLOBAL+REF 45° geometry constraints / constrained line movement · CAD: temporary ORTHO inversion</td></tr><tr><td><kbd>Ctrl</kbd></td><td>Plan: temporarily include CAD/reference geometry in SNAP</td></tr><tr><td><kbd>L / PL / REC / C / A</kbd></td><td>LINE / PLINE / RECTANGLE / CIRCLE / ARC</td></tr><tr><td><kbd>TR</kbd> / <kbd>EX</kbd></td><td>TRIM / EXTEND</td></tr><tr><td><kbd>J</kbd></td><td>JOIN</td></tr><tr><td><kbd>O</kbd> / <kbd>F</kbd></td><td>OFFSET / FILLET</td></tr><tr><td><kbd>Space</kbd></td><td>Plan: return to Select · CAD: same as Enter · hold and drag: Pan</td></tr><tr><td><kbd>Enter</kbd></td><td>Repeat the last command when idle / confirm the current command step</td></tr><tr><td><kbd>S</kbd></td><td>CAD: STRETCH · Plan: use direct editing tools · save with Ctrl/Cmd+S</td></tr></table>`,
    trouble:ko?`<h2>문제 해결</h2><h3>Plan 인식이 이상할 때</h3><p>관련 없는 CAD 레이어를 숨기고 도면 영역을 좁힌 뒤 재인식하세요. 자동 인식은 원본 CAD를 수정하지 않습니다.</p><h3>문자가 너무 작거나 클 때</h3><p>CAD TEXT/MTEXT는 DXF의 문자 높이와 실제 도면 scale을 따릅니다. 너무 축소된 화면에서는 성능을 위해 작은 문자를 생략할 수 있습니다.</p><h3>저장되지 않은 변경</h3><p>상단 파일명 옆 점이 보이면 마지막 프로젝트 저장 상태와 현재 작업이 다릅니다.</p>`:`<h2>Troubleshooting</h2><p>Hide unrelated CAD layers and re-run recognition on a smaller drawing region if architectural recognition produces poor candidates.</p>`};return data[section]||data.intro;}
  function openHelp(section='intro'){closeTopMenus();dom.helpBackdrop.hidden=false;document.querySelectorAll('.help-nav-item').forEach(b=>b.classList.toggle('active',b.dataset.helpSection===section));dom.helpContent.innerHTML=helpHtml(section);}
  function openAbout(){closeTopMenus();dom.aboutVersion.textContent=`Version ${VERSION} · Build ${BUILD}`;dom.aboutBackdrop.hidden=false;}

  function hasLiveCurrentWork(snapshot=state) {
    return Boolean(snapshot.workspaceVisited||snapshot.objects?.length||snapshot.references?.length||snapshot.drawingRegions?.length||snapshot.sourceDxfName||snapshot.projectFileName||snapshot.projectLocalKey);
  }
  function hasReplaceableWorkspace(snapshot=state){
    return Boolean(snapshot.objects?.length||snapshot.references?.length||snapshot.drawingRegions?.length||snapshot.sourceDxfName||snapshot.projectFileName||snapshot.projectLocalKey||snapshot.dirty);
  }
  function hasCurrentWork() {
    if(state.sessionKind==='sample')return Boolean(sampleReturnWorkspace&&hasLiveCurrentWork(sampleReturnWorkspace.state));
    return hasLiveCurrentWork();
  }
  function cloneStateForSampleReturn(){
    const saved={...state};
    for(const key of ['selectedObjectIds','previousCadSelectionIds','expandedBuildingIds','expandedFloorIds','viewerPointers','cadLayerVisibility','cadRegionLayerVisibility'])if(state[key] instanceof Set)saved[key]=new Set(state[key]);else if(state[key] instanceof Map)saved[key]=new Map(state[key]);
    saved.camera=state.camera?{...state.camera}:state.camera;saved.toolSettings=state.toolSettings?{...state.toolSettings}:state.toolSettings;saved.spaceFaceCache=state.spaceFaceCache?{...state.spaceFaceCache}:state.spaceFaceCache;
    return{state:saved,planLayerVisibility:planLayers.map(l=>l.visible!==false)};
  }
  function captureSampleReturnWorkspace(){if(state.sessionKind!=='sample'&&hasLiveCurrentWork())sampleReturnWorkspace=cloneStateForSampleReturn();}
  function restoreSampleReturnWorkspace({openWorkspace=false}={}){
    if(!sampleReturnWorkspace)return false;
    const saved=sampleReturnWorkspace,globals={theme:state.theme,textSize:state.textSize,recoveryEnabled:state.recoveryEnabled,recoveryMeta:state.recoveryMeta,browserSavedMeta:state.browserSavedMeta,inspectorSplit:state.inspectorSplit};
    Object.assign(state,saved.state);Object.assign(state,globals);state.sessionKind='normal';sampleReturnWorkspace=null;planLayers.forEach((l,i)=>l.visible=saved.planLayerVisibility[i]!==false);
    documentWriteEpoch++;projectLoadSequence++;initializeCadServices({newDocument:false});rebuildObjectSnapIndex({touch:false});refreshSpaces();if(state.dirty)scheduleRecoverySnapshot();updateAll();updateContinueCard();if(openWorkspace)switchToolset(state.toolset,{skipMapping:true});return true;
  }
  function workspaceProtectionInfo(){
    if(state.sessionKind==='sample'&&sampleReturnWorkspace&&hasReplaceableWorkspace(sampleReturnWorkspace.state)){const saved=sampleReturnWorkspace.state;return{dirty:Boolean(saved.dirty),name:saved.projectFileName||saved.sourceDxfName||t('document.new'),sampleReturn:true};}
    if(state.sessionKind!=='sample'&&hasReplaceableWorkspace())return{dirty:Boolean(state.dirty),name:state.projectFileName||state.sourceDxfName||t('document.new'),sampleReturn:false};
    if(state.browserSavedMeta)return{dirty:false,name:state.browserSavedMeta.name||'PieniPlan.pprj',sampleReturn:false,browserOnly:true};
    return null;
  }
  async function requestWorkspaceReplacement(){
    const info=workspaceProtectionInfo();if(!info)return true;
    const choice=await new Promise(resolve=>showAppConfirm({title:t('workspace.replaceTitle'),copy:t(info.dirty?'workspace.replaceDirtyCopy':'workspace.replaceCleanCopy',{name:info.name}),confirmLabel:t(info.dirty?'workspace.discardAndContinue':'workspace.replaceContinue'),secondaryLabel:info.dirty?t('workspace.saveAndContinue'):null,danger:info.dirty,onConfirm:()=>resolve('discard'),onSecondary:info.dirty?()=>resolve('save'):null,onCancel:()=>resolve('cancel'),focus:'cancel'}));
    if(choice==='cancel')return false;
    if(info.sampleReturn)restoreSampleReturnWorkspace({openWorkspace:false});
    if(choice==='save'){const saved=await saveProjectFile();if(!saved)return false;}
    return true;
  }

  function updateContinueCard() {
    const current = hasCurrentWork();
    const currentState=state.sessionKind==='sample'&&sampleReturnWorkspace?sampleReturnWorkspace.state:state;
    const local = !current && state.browserSavedMeta;
    const available = current || Boolean(local);
    const browserSaved = Boolean(local || currentState.projectLocalKey === LOCAL_PROJECT_KEY);
    dom.continueWorkBtn.hidden = false;
    dom.continueWorkBtn.disabled = !available;
    dom.continueWorkBtn.dataset.empty = available ? 'false' : 'true';
    if(!available){
      dom.continueWorkDetail.textContent=t('start.continueEmpty');
      dom.continueWorkAction.textContent='';
      return;
    }
    const name = local?.name || currentState.projectFileName || currentState.sourceDxfName || `${projectBaseName()}.pprj`;
    dom.continueWorkDetail.textContent = name;
    dom.continueWorkAction.textContent = t(browserSaved ? 'start.continueBrowserAction' : 'start.continueAction');
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
  function stableId(prefix='id'){return `${prefix}-${globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}`;}
  function deg(radValue) { return radValue * 180 / Math.PI; }
  function rad(degValue) { return degValue * Math.PI / 180; }
  function distance(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
  function angleDeg(a, b) { return (deg(Math.atan2(b.y - a.y, b.x - a.x)) + 360) % 360; }
  function formatNumber(n, digits = 1) { return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—'; }
  function recordEdit(action, details={}) { const entry={at:new Date().toISOString(),action,...details}; state.editLog.push(entry); if(state.editLog.length>100)state.editLog.splice(0,state.editLog.length-100); return entry; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  function unitFactorToMm(unit) { return unit?.metersPerUnit != null ? unit.metersPerUnit * 1000 : 1; }
  function isSemanticObject(o) { return ['wall','door','window','dimension','space','stair','component'].includes(o?.type); }
  function isCadObject(o) { return ['cadLine','cadCircle','cadArc','cadText','cadPolyline','cadDimension','cadHatch','cadLeader'].includes(o?.type); }
  function isArcWall(w){ return w?.type==='wall' && w.geometry==='arc' && w.center && Number.isFinite(w.radius) && Number.isFinite(w.startAngle) && Number.isFinite(w.sweep); }
  function hasSemanticObjects() { return state.objects.some(isSemanticObject); }
  function makeStableUuid() { return globalThis.crypto?.randomUUID?.() || `space-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`; }
  function spaceDefaultName(index){return t('space.defaultName',{index});}
  function nextSpaceName(floorId){
    const used=new Set(state.objects.filter(o=>o.type==='space'&&(!floorId||o.floorId===floorId)).map(o=>String(o.name||'').trim()).filter(Boolean));
    let i=1;while(used.has(spaceDefaultName(i))||used.has(`Space ${i}`)||used.has(`공간 ${i}`))i++;return spaceDefaultName(i);
  }
  function ensureSpaceMetadata(){
    let changed=false;ensureFloorModel();
    for(const floor of state.floors){
      const spaces=state.objects.filter(o=>o.type==='space'&&((o.floorId||state.activeFloorId)===floor.id));
      const used=new Set(spaces.map(o=>String(o.name||'').trim()).filter(Boolean));
      let n=1;
      for(const space of spaces){
        if(!space.floorId){space.floorId=floor.id;changed=true;}
        if(!space.spaceUuid){space.spaceUuid=makeStableUuid();changed=true;}
        if(!space.spaceType){space.spaceType='unspecified';changed=true;}
        const legacy=Number(space.manualAreaM2),managed=Number(space.managedAreaM2);
        if((!Number.isFinite(managed)||managed<=0)&&Number.isFinite(legacy)&&legacy>0){space.managedAreaM2=legacy;space.managedAreaSource=space.managedAreaSource||'user';changed=true;}
        if(space.managedAreaM2!=null&&(!Number.isFinite(Number(space.managedAreaM2))||Number(space.managedAreaM2)<=0)){space.managedAreaM2=null;space.managedAreaSource=null;changed=true;}
        // Keep legacy keys as a compatibility mirror, but managedAreaM2 is the canonical manual/official candidate.
        const hasManaged=Number.isFinite(Number(space.managedAreaM2))&&Number(space.managedAreaM2)>0;
        if(space.areaMode!==(hasManaged?'manual':'calculated')){space.areaMode=hasManaged?'manual':'calculated';changed=true;}
        if(hasManaged&&space.manualAreaM2!==Number(space.managedAreaM2)){space.manualAreaM2=Number(space.managedAreaM2);changed=true;}
        if(!hasManaged&&space.manualAreaM2!=null){space.manualAreaM2=null;changed=true;}
        if(!String(space.name||'').trim()){
          while(used.has(spaceDefaultName(n))||used.has(`Space ${n}`)||used.has(`공간 ${n}`))n++;
          space.name=spaceDefaultName(n++);used.add(space.name);changed=true;
        }
      }
    }
    for(const space of state.objects.filter(o=>o.type==='space'&&!o.floorId)){
      space.floorId=state.activeFloorId||state.floors[0]?.id||'floor_1';space.spaceUuid=space.spaceUuid||makeStableUuid();space.spaceType=space.spaceType||'unspecified';
      const legacy=Number(space.manualAreaM2);space.managedAreaM2=Number.isFinite(Number(space.managedAreaM2))&&Number(space.managedAreaM2)>0?Number(space.managedAreaM2):(Number.isFinite(legacy)&&legacy>0?legacy:null);space.managedAreaSource=space.managedAreaM2?space.managedAreaSource||'user':null;space.areaMode=space.managedAreaM2?'manual':'calculated';space.manualAreaM2=space.managedAreaM2;space.name=space.name||nextSpaceName(space.floorId);changed=true;
    }
    return changed;
  }
  function markSpaceUserEdited(space){if(space?.recognizedFromCad)space.recognitionDetached=true;}
  function calculatedSpaceAreaM2(space){const fromGeometry=Math.abs(polygonArea(space?.polygon||[]))/1e6;return Number.isFinite(Number(space?.areaM2))&&Number(space.areaM2)>=0?Number(space.areaM2):fromGeometry;}
  function usesManualSpaceArea(space){return Number.isFinite(Number(space?.managedAreaM2))&&Number(space.managedAreaM2)>0;}
  function displaySpaceAreaM2(space){return usesManualSpaceArea(space)?Number(space.managedAreaM2):calculatedSpaceAreaM2(space);}
  function setSpaceManualArea(space,value){const area=Number(value);if(!space||!Number.isFinite(area)||area<=0)return false;pushHistory();space.managedAreaM2=area;space.managedAreaSource='user';space.areaMode='manual';space.manualAreaM2=area;markSpaceUserEdited(space);recordEdit('space-managed-area',{spaceId:space.id,value:area});markDirty(true);updateAll();return true;}
  function setSpaceCalculatedArea(space){if(!space)return;pushHistory();space.managedAreaM2=null;space.managedAreaSource=null;space.areaMode='calculated';space.manualAreaM2=null;markSpaceUserEdited(space);recordEdit('space-managed-area-clear',{spaceId:space.id});markDirty(true);updateAll();}
  function isHingedDoorType(type){return ['hingedSingle','hingedDouble','doubleActingSingle','doubleActingDouble','fireDoor'].includes(type||'hingedSingle');}
  function isFireShutterDoorType(type){return type==='fireShutter';}
  function isDoubleActingDoorType(type){return type==='doubleActingSingle'||type==='doubleActingDouble';}
  function isDoubleLeafDoorType(type){return type==='hingedDouble'||type==='doubleActingDouble';}
  function doorSwingSide(obj){if(obj?.swingSide===-1||obj?.swingSide===1)return obj.swingSide;const legacy=obj?.swing===-1?-1:1;return obj?.hinge==='end'?-legacy:legacy;}
  function syncLegacyDoorSwing(obj){if(!obj)return;const side=doorSwingSide(obj);obj.swingSide=side;obj.swing=obj.hinge==='end'?-side:side;}
  function flipDoorHingePreserveSide(obj){if(!obj||!isHingedDoorType(obj.doorType)||isDoubleLeafDoorType(obj.doorType))return;const side=doorSwingSide(obj);obj.hinge=obj.hinge==='end'?'start':'end';obj.swingSide=side;syncLegacyDoorSwing(obj);}
  function flipDoorSwingSide(obj){if(!obj||!isHingedDoorType(obj.doorType))return;obj.swingSide=-doorSwingSide(obj);syncLegacyDoorSwing(obj);}
  function ensureDoorMetadata(){let changed=false;for(const o of state.objects){if(o.type!=='door')continue;const type=o.doorType||'hingedSingle';if(type==='fireDoor'){if(o.fireProtection!=='fireDoor'){o.fireProtection='fireDoor';changed=true;}if(o.elementKind!=='door'){o.elementKind='door';changed=true;}}else if(type==='fireShutter'){if(o.fireProtection!=='fireShutter'){o.fireProtection='fireShutter';changed=true;}if(o.elementKind!=='fireShutter'){o.elementKind='fireShutter';changed=true;}}if(isHingedDoorType(type)){if(o.swingSide!==-1&&o.swingSide!==1){o.swingSide=doorSwingSide(o);changed=true;}syncLegacyDoorSwing(o);}}return changed;}
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
  function clearMultiSelection(){setSelectionIds(new Set());}
  function selectOnly(id){setSelectionIds(id?new Set([id]):new Set());}
  function selectionIds(){const ids=new Set(state.selectedObjectIds);if(state.selectedObjectId)ids.add(state.selectedObjectId);return ids;}
  function visibleSelectableObjects(){
    if(state.toolset==='plan')return getPlanObjects();
    return cadSelectableObjects();
  }
  function objectFullyInsideRect(o,r){if(state.toolset==='cad'&&cadSourceObject(o))return cadGeometry.insideWindow(o,r);const b=objectBoundsWorld(o);return b&&b.minx>=r.minx&&b.maxx<=r.maxx&&b.miny>=r.miny&&b.maxy<=r.maxy;}
  function applySelectionSet(ids,mode='replace'){if(state.toolset==='cad'){if(!cadSelectionService)initializeCadServices();cadSelectionService.apply(ids,mode);return;}const next=new Set(state.selectedObjectIds);if(mode==='replace'){next.clear();for(const id of ids)next.add(id);}else if(mode==='add'){for(const id of ids)next.add(id);}else if(mode==='toggle'){for(const id of ids){if(next.has(id))next.delete(id);else next.add(id);}}setSelectionIds(next);}
  function applyObjectClickSelection(obj,e){const plan=state.toolset==='plan',toggle=Boolean(e.ctrlKey||e.metaKey);if(!obj){if(plan?!toggle:(!e.shiftKey&&!toggle))clearMultiSelection();return;}const mode=plan?(toggle?'toggle':'replace'):(e.shiftKey?'add':(toggle?'toggle':'replace'));applySelectionSet([obj.id],mode);}
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
    state.activeTool='constraint';host.dataset.tool='constraint';updateContextBar();dom.toolPopover.innerHTML='';
    for(const item of constraintCatalog){if(item.separator){const d=document.createElement('div');d.className='tool-popover-divider';dom.toolPopover.appendChild(d);continue;}const b=document.createElement('button');b.className=`tool-item ${state.constraintMode===item.id?'active':''}`;b.innerHTML=`<span class="ui-icon icon-${state.toolset==='plan'&&item.id==='wall'?'arc':toolIconFallback[item.id]||'draw'}" aria-hidden="true"></span><span>${escapeHtml(t(item.labelKey))}</span><span class="tool-item-note">${item.noteKey?escapeHtml(t(item.noteKey)):''}</span>`;b.addEventListener('click',()=>applyConstraintCommand(item.id));dom.toolPopover.appendChild(b);}positionToolPopover(button);renderToolRail();render();
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
  function objectBoundsWorld(o){if(o.type==='component')return componentLibrary.bounds(o);if(modules.cadPolyline.is(o)||['cadDimension','cadHatch','cadLeader'].includes(o.type))return cadGeometry.bounds(o);if(o.a&&o.b)return rectFromPoints(o.a,o.b);if(o.type==='cadCircle'||o.type==='cadArc')return{minx:o.center.x-o.radius,miny:o.center.y-o.radius,maxx:o.center.x+o.radius,maxy:o.center.y+o.radius};if(o.point)return{minx:o.point.x,miny:o.point.y,maxx:o.point.x,maxy:o.point.y};if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);return g?rectFromPoints(g.p1,g.p2):null;}if((o.type==='space'||o.type==='stair')&&o.polygon?.length){return o.polygon.reduce((b,p)=>({minx:Math.min(b.minx,p.x),miny:Math.min(b.miny,p.y),maxx:Math.max(b.maxx,p.x),maxy:Math.max(b.maxy,p.y)}),{minx:Infinity,miny:Infinity,maxx:-Infinity,maxy:-Infinity});}return null;}
  function objectTouchesRegion(o,region){const b=objectBoundsWorld(o);return b?boundsOverlap(b,region):false;}
  function segmentIntersectsRect(a,b,r){if(pointInRect(a,r)||pointInRect(b,r))return true;const p1={x:r.minx,y:r.miny},p2={x:r.maxx,y:r.miny},p3={x:r.maxx,y:r.maxy},p4={x:r.minx,y:r.maxy};return Boolean(segmentIntersection(a,b,p1,p2)||segmentIntersection(a,b,p2,p3)||segmentIntersection(a,b,p3,p4)||segmentIntersection(a,b,p4,p1));}
  function objectCrossesRect(o,r){if(state.toolset==='cad'&&cadSourceObject(o))return cadGeometry.crossesWindow(o,r);if(o.type==='component'){const b=objectBoundsWorld(o);return b?boundsOverlap(b,r):false;}if(o.a&&o.b)return segmentIntersectsRect(o.a,o.b,r);if(o.type==='cadCircle'||o.type==='cadArc'){const b=objectBoundsWorld(o);return b?boundsOverlap(b,r):false;}if(o.point)return pointInRect(o.point,r);if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);return g?segmentIntersectsRect(g.p1,g.p2,r):false;}if(o.type==='dimension'){const g=dimensionGeometry(o);return g?segmentIntersectsRect(g.d1,g.d2,r):false;}const b=objectBoundsWorld(o);return b?boundsOverlap(b,r):false;}
  function selectionCandidatesForDrag(drag){if(!drag)return[];const frame=projectionFrame();if(!frame?.rotation){const r=rectFromPoints(drag.start,drag.current),crossing=drag.current.x<drag.start.x;return (state.toolset==='cad'?[...cadQueryCandidates(r),...componentObjectsForCad(),...(state.cadPlanOverlay?cadPlanOverlayObjects().filter(o=>cadPolicy(o.id,'select').allowed):[])]:visibleSelectableObjects()).filter(o=>crossing?objectCrossesRect(o,r):objectFullyInsideRect(o,r));}
    const F=modules.floorAlignment,T=modules.cadTransformOperations,a=F.point(drag.start,frame),b=F.point(drag.current,frame),r=rectFromPoints(a,b),crossing=b.x<a.x,local=rangePolygon(r).map(q=>F.inverse(q,frame)),query={minx:Math.min(...local.map(q=>q.x)),maxx:Math.max(...local.map(q=>q.x)),miny:Math.min(...local.map(q=>q.y)),maxy:Math.max(...local.map(q=>q.y))},matrix={...T.rotate({x:0,y:0},frame.rotation),tx:frame.x,ty:frame.y};
    const candidates=state.toolset==='cad'?[...cadQueryCandidates(query),...componentObjectsForCad(),...(state.cadPlanOverlay?cadPlanOverlayObjects().filter(o=>cadPolicy(o.id,'select').allowed):[])]:visibleSelectableObjects();
    return candidates.filter(o=>{let projected=T.transform(o,matrix);if(!projected){let points=null;if(o.type==='component'){const asset=componentLibrary.get(o.assetId);if(asset)points=rangePolygon(componentLibrary.localBounds(asset)).map(q=>componentLibrary.worldPoint(o,q));}else if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);if(g)points=[g.p1,g.p2];}else if(o.type==='dimension'){const g=dimensionGeometry(o);if(g)points=[g.d1,g.d2];}else if(o.type==='wall'&&isArcWall(o))points=sampleWallSegments(o).flatMap(e=>[e.a,e.b]);else if(o.a&&o.b)points=[o.a,o.b];else points=o.polygon||o.points;if(points?.length)projected={type:'cadLeader',points:points.map(q=>F.point(q,frame)),closed:points.length>2};else if(o.point)projected={type:'cadText',point:F.point(o.point,frame),text:'',height:0};}return projected&&(crossing?cadGeometry.crossesWindow(projected,r):cadGeometry.insideWindow(projected,r));});
  }
  function updateSelectionDragPreview(){if(!state.selectionDrag)return;state.selectionDrag.previewIds=new Set(selectionCandidatesForDrag(state.selectionDrag).map(o=>o.id));}
  function drawSelectionDrag(){const drag=state.selectionDrag;if(!drag)return;const a=toScreenCss(drag.start),b=toScreenCss(drag.current),x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(a.x-b.x),h=Math.abs(a.y-b.y),crossing=b.x<a.x,styles=getComputedStyle(document.documentElement),color=(crossing?styles.getPropertyValue('--success'):styles.getPropertyValue('--accent')).trim();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=.12;ctx.fillRect(x,y,w,h);ctx.globalAlpha=.9;ctx.lineWidth=1.2;ctx.setLineDash(crossing?[6,4]:[]);ctx.strokeRect(x+.5,y+.5,w,h);ctx.setLineDash([]);ctx.font='10px system-ui';ctx.fillStyle=color;ctx.fillText(crossing?'Crossing':'Window',x+6,y+14);ctx.restore();}
  function clipLineToRect(a,b,r){let t0=0,t1=1,dx=b.x-a.x,dy=b.y-a.y;for(const[p,q]of[[-dx,a.x-r.minx],[dx,r.maxx-a.x],[-dy,a.y-r.miny],[dy,r.maxy-a.y]]){if(Math.abs(p)<1e-12){if(q<0)return null;continue;}const t=q/p;if(p<0){if(t>t1)return null;if(t>t0)t0=t;}else{if(t<t0)return null;if(t<t1)t1=t;}}return[{x:a.x+dx*t0,y:a.y+dy*t0},{x:a.x+dx*t1,y:a.y+dy*t1}];}

  function cssCanvasSize() {
    const dpr = Number(canvas.dataset.dpr || 1);
    return { w: canvas.width / dpr, h: canvas.height / dpr, dpr };
  }

  function viewFloor(){return state.toolset==='cad'?(activeCadWorkRegion()?floorForRegion(state.cadWorkRegionId):null):activeFloor();}
  function projectionFrame(){return projectionFloorOverride?.transform||projectionFloorOverride?.floor?.viewAlignment||viewFloor()?.viewAlignment;}
  let renderProjection=null;
  function projectionState(frame=projectionFrame()){const {w,h}=cssCanvasSize(),rotation=frame?.rotation||0,a=rad(rotation);return{frame,rotation,c:Math.cos(a),s:Math.sin(a),center:buildingCamera(),zoom:state.camera.zoom,w,h,bounds:new Map()};}
  function viewAngle(){return renderProjection?.rotation??projectionFrame()?.rotation??0;}
  function buildingCamera(){const t=viewFloor()?.viewAlignment;return t?modules.floorAlignment.point({x:state.camera.cx,y:state.camera.cy},t):{x:state.camera.cx,y:state.camera.cy};}
  function alignedFloor(floor){return Boolean(floor&&(floor.viewAlignment||state.floors.some(f=>f.buildingId===floor.buildingId&&f.viewAlignment?.referenceFloorId===floor.id)));}
  function preserveFloorCamera(previous,next,position){if(previous?.buildingId===next?.buildingId&&alignedFloor(previous)&&alignedFloor(next)){const p=modules.floorAlignment.inverse(position,next.viewAlignment);state.camera.cx=p.x;state.camera.cy=p.y;return true;}return false;}
  let viewportBoundsCache=null;
  function viewportLocalBounds(pad=40){if(renderProjection?.bounds.has(pad))return renderProjection.bounds.get(pad);const f=renderProjection||projectionState(),{w,h,center:c,zoom}=f,pts=[{x:-pad,y:-pad},{x:w+pad,y:-pad},{x:w+pad,y:h+pad},{x:-pad,y:h+pad}].map(q=>modules.floorAlignment.inverse({x:c.x+(q.x-w/2)/zoom,y:c.y-(q.y-h/2)/zoom},f.frame)),value={minx:Math.min(...pts.map(p=>p.x)),maxx:Math.max(...pts.map(p=>p.x)),miny:Math.min(...pts.map(p=>p.y)),maxy:Math.max(...pts.map(p=>p.y))};renderProjection?.bounds.set(pad,value);return value;}
  function applyWorldCanvasTransform(origin={x:0,y:0},scale=1){const q=toScreenCss(origin);ctx.translate(q.x,q.y);ctx.rotate(-rad(viewAngle()));ctx.scale(state.camera.zoom*scale,-state.camera.zoom*scale);}
  function toScreenCss(p) {
    const f=renderProjection||projectionState(),t=f.frame,q=t?{x:t.x+p.x*f.c-p.y*f.s,y:t.y+p.x*f.s+p.y*f.c}:p;return{x:f.w/2+(q.x-f.center.x)*f.zoom,y:f.h/2-(q.y-f.center.y)*f.zoom};
  }

  function screenCssToWorld(p) {
    const { w, h } = cssCanvasSize();
    const c=buildingCamera();return modules.floorAlignment.inverse({x:c.x+(p.x-w/2)/state.camera.zoom,y:c.y-(p.y-h/2)/state.camera.zoom},viewFloor()?.viewAlignment);
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
    renderProjection=projectionState();
    const { w, h } = cssCanvasSize();
    state.editableLabels = [];
    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h);
    syncPdfReferenceLayer();
    for (const ref of referencesForRender()) drawReference(ref);
    featureFill?.drawOverlays();if (state.toolset === 'plan') drawPlanWorkspace(); else drawCadWorkspace();
    drawDrawingRegions();
    drawCadRotateGuide();
    drawWallRecognitionPreview();
    drawCurveReconstructionPreview();
    drawCadAnnotationPreview();
    drawSpaceHoverPreview();
    drawSpaceGapDiagnostic();
    drawSelectionDrag();
    drawPreview();
    drawTrimPreview();
    drawCadOperationPreview();
    drawCalibrationPreview();
    drawReferenceClipPreview();
    drawOpeningPreview();
    drawStairPreview();
    drawSmartGuides();
    drawSnapIndicator();
    drawConstraintInteraction();
    featureFill?.drawSelection();
    dom.emptyState.hidden = state.references.length > 0 || state.objects.length > 0;
    dom.statusZoom.textContent = `${Math.round(state.camera.zoom / 0.12 * 100)}%`;renderProjection=null;
  }

  function drawGrid(w, h) {
    if (!state.grid) return;
    const zoom = state.camera.zoom;
    let step = 100;
    while (step * zoom < 14) step *= 2;
    while (step * zoom > 42) step /= 2;
    const major = step * 5;
    const v=viewportLocalBounds(0),minX=v.minx,maxX=v.maxx,minY=v.miny,maxY=v.maxy;
    const styles = getComputedStyle(document.documentElement);
    const minorColor = styles.getPropertyValue('--grid-minor').trim();
    const majorColor = styles.getPropertyValue('--grid-major').trim();
    ctx.save();
    ctx.lineWidth = 1;
    for (let x = Math.floor(minX / step) * step; x <= maxX; x += step) {
      const a=toScreenCss({x,y:minY}),b=toScreenCss({x,y:maxY});
      ctx.strokeStyle = Math.abs((x / major) - Math.round(x / major)) < 1e-6 ? majorColor : minorColor;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }
    for (let y = Math.floor(minY / step) * step; y <= maxY; y += step) {
      const a=toScreenCss({x:minX,y}),b=toScreenCss({x:maxX,y});
      ctx.strokeStyle = Math.abs((y / major) - Math.round(y / major)) < 1e-6 ? majorColor : minorColor;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }
    ctx.restore();
  }

  function getLinkedCadRenderCache(ref,region){
    const sig=`${region.id}:${region.minx}:${region.miny}:${region.maxx}:${region.maxy}`,prev=linkedCadRenderCache.get(ref);
    if(prev&&prev.revision===state.cadRenderRevision&&prev.sig===sig)return prev;
    const linkedObjects=cadObjectsForRegion(region);const layers=new Map(),snapSegments=[],entry=layer=>{if(!layers.has(layer))layers.set(layer,{path:new Path2D(),texts:[]});return layers.get(layer);};
    for(const obj of linkedObjects){const layer=cadLayerForObject(obj),data=entry(layer),path=data.path;
      if(obj.type==='cadHatch'){const pts=obj.points||[];if(pts.length){path.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)path.lineTo(pts[i].x,pts[i].y);path.closePath();for(let i=0;i<pts.length;i++)snapSegments.push({a:pts[i],b:pts[(i+1)%pts.length],layer,id:obj.id});}}
      else if(obj.type==='cadDimension'){for(const seg of(obj.segments||annotationDimensionSegments(obj))){path.moveTo(seg.a.x,seg.a.y);path.lineTo(seg.b.x,seg.b.y);snapSegments.push({a:seg.a,b:seg.b,layer,id:obj.id});}const g=cadDimensionGeometry(obj),lp=g?.labelPoint||g?.d1||g?.end;if(lp)data.texts.push({point:{...lp},text:cadDimensionLabel(obj,g),height:140,rotation:0});}
      else if(obj.type==='cadLeader'){const pts=obj.points||[];for(let i=1;i<pts.length;i++){path.moveTo(pts[i-1].x,pts[i-1].y);path.lineTo(pts[i].x,pts[i].y);snapSegments.push({a:pts[i-1],b:pts[i],layer,id:obj.id});}if(pts.length)data.texts.push({point:{...pts.at(-1)},text:obj.text||'',height:obj.height||140,rotation:0});}
      else if(modules.cadPolyline.is(obj)){for(const e of modules.cadPolyline.get(obj).edges){if(e.type==='cadLine'){path.moveTo(e.a.x,e.a.y);path.lineTo(e.b.x,e.b.y);snapSegments.push({a:e.a,b:e.b,layer,id:e.edgeId});}else{const a0=rad(e.startAngle),a1=rad(e.startAngle+e.sweep);path.moveTo(e.center.x+Math.cos(a0)*e.radius,e.center.y+Math.sin(a0)*e.radius);path.arc(e.center.x,e.center.y,e.radius,a0,a1,e.sweep<0);}}}
      else if(obj.type==='cadLine'||obj.type==='line'){path.moveTo(obj.a.x,obj.a.y);path.lineTo(obj.b.x,obj.b.y);snapSegments.push({a:{...obj.a},b:{...obj.b},layer,id:obj.id});}
      else if(obj.type==='cadCircle'){path.moveTo(obj.center.x+obj.radius,obj.center.y);path.arc(obj.center.x,obj.center.y,obj.radius,0,Math.PI*2);}
      else if(obj.type==='cadArc'){const a0=rad(obj.startAngle||0),a1=rad((obj.startAngle||0)+(obj.sweep||0));path.moveTo(obj.center.x+Math.cos(a0)*obj.radius,obj.center.y+Math.sin(a0)*obj.radius);path.arc(obj.center.x,obj.center.y,obj.radius,a0,a1,(obj.sweep||0)<0);}
      else if(obj.type==='cadText')data.texts.push({point:{...obj.point},text:obj.text||'',height:obj.height||180,rotation:obj.rotation||0});
    }
    let snapIndex=buildSegmentSnapIndex(snapSegments);
    if(linkedObjects.some(modules.cadPolyline.is)){snapIndex=snapIndexForObjects(linkedObjects,{cad:true});const byId=new Map(linkedObjects.map(o=>[o.id,o]));snapIndex.polyQuery=modules.cadQueryIndex.create(linkedObjects,snapIndex,cadGeometry,id=>byId.get(id));for(const points of snapIndex.cells.values())for(const q of points)q.layer=byId.get(q.objectId)?cadLayerForObject(byId.get(q.objectId)):(q.layer||'0');}
    const cache={revision:state.cadRenderRevision,sig,layers,snapIndex};linkedCadRenderCache.set(ref,cache);return cache;
  }

  function referenceBelongsToFloor(ref,floor){
    if(!ref||!floor)return false;
    if(ref.type==='linkedCadRegion')return Boolean(floor.sourceRegionId&&ref.regionId===floor.sourceRegionId);
    return !ref.floorId||ref.floorId===floor.id;
  }
  function floorReferencePlacements(floor){
    if(!floor)return[];
    return state.references.filter(ref=>ref.type==='linkedCadRegion'?referenceBelongsToFloor(ref,floor):ref.floorId===floor.id);
  }
  function referencesForRender(){
    if(state.toolset==='cad')return state.references.filter(ref=>ref.visible&&ref.type!=='linkedCadRegion');
    const floor=activeFloor();
    return state.references.filter(ref=>ref.visible&&referenceBelongsToFloor(ref,floor));
  }

  function referenceClipScreenRect(ref){if(!ref?.clip)return null;const a=toScreenCss(referenceLocalToWorld(ref,{x:ref.clip.minx,y:ref.clip.miny})),b=toScreenCss(referenceLocalToWorld(ref,{x:ref.clip.maxx,y:ref.clip.maxy}));return{x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(a.x-b.x),h:Math.abs(a.y-b.y)};}
  function canvasPolygon(points){ctx.beginPath();points.map(toScreenCss).forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();}
  function rangePolygon(r){return[{x:r.minx,y:r.miny},{x:r.maxx,y:r.miny},{x:r.maxx,y:r.maxy},{x:r.minx,y:r.maxy}];}
  function applyReferenceCanvasClip(ref){if(!ref?.clip)return;canvasPolygon(rangePolygon(ref.clip).map(p=>referenceLocalToWorld(ref,p)));ctx.clip();}
  function syncPdfReferenceLayer(){
    if(!dom.pdfReferenceLayer)return;
    const entries=referencesForRender().filter(r=>r.type==='pdf'&&r.visible!==false).map(ref=>({ref,id:ref.id,transform:projectionFrame(),opacity:ref.opacity??.62}));
    for(const f of featureFill?.overlayFrames()||[])for(const ref of floorReferencePlacements(f.floor))if(ref.type==='pdf'&&ref.visible!==false)entries.push({ref,id:`ghost-${f.floor.id}-${ref.id}-${f.opacity}`,transform:f.transform||modules.floorAlignment.identity,opacity:(ref.opacity??.62)*f.opacity});
    const ids=new Set(entries.map(e=>e.id));for(const child of [...dom.pdfReferenceLayer.children])if(!ids.has(child.dataset.referenceId))child.remove();
    for(const entry of entries){const {ref}=entry;let item=[...dom.pdfReferenceLayer.children].find(el=>el.dataset.referenceId===entry.id);if(!item){item=document.createElement('div');item.className='pdf-reference-item';item.dataset.referenceId=entry.id;item.setAttribute('aria-hidden','true');const embed=document.createElement('embed');embed.type='application/pdf';embed.setAttribute('aria-hidden','true');item.append(embed);dom.pdfReferenceLayer.append(item);}const embed=item.firstElementChild,src=`${ref.dataUrl||''}#page=1&toolbar=0&navpanes=0&scrollbar=0`;if(embed.dataset.srcKey!==String(ref.sourceMeta?.hash||ref.dataUrl?.length||'')){embed.src=src;embed.dataset.srcKey=String(ref.sourceMeta?.hash||ref.dataUrl?.length||'');}
      const F=modules.floorAlignment,q=F.point(referenceLocalToWorld(ref,{x:0,y:ref.height}),entry.transform),camera=buildingCamera(),{w,h}=cssCanvasSize(),x=w/2+(q.x-camera.x)*state.camera.zoom,y=h/2-(q.y-camera.y)*state.camera.zoom;
      item.style.left=`${x}px`;item.style.top=`${y}px`;item.style.width=`${Math.max(1,ref.width*ref.scale*state.camera.zoom)}px`;item.style.height=`${Math.max(1,ref.height*ref.scale*state.camera.zoom)}px`;item.style.transform=`rotate(${-F.normalize(entry.transform).rotation}deg)`;item.style.opacity=String(entry.opacity);
      if(ref.clip){const l=clamp(ref.clip.minx/ref.width*100,0,100),r=clamp((ref.width-ref.clip.maxx)/ref.width*100,0,100),t=clamp((ref.height-ref.clip.maxy)/ref.height*100,0,100),b=clamp(ref.clip.miny/ref.height*100,0,100);item.style.clipPath=`inset(${t}% ${r}% ${b}% ${l}%)`;}else item.style.clipPath='none';
    }
  }
  function drawReferenceClipPreview(){const d=state.referenceClipDraft;if(!d?.p1)return;const ref=state.references.find(r=>r.id===d.refId);if(!ref)return;const q=d.current||referenceWorldToLocal(ref,state.cursorWorld),r=rectFromPoints(d.p1,q);ctx.save();ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#3478F6';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);canvasPolygon(rangePolygon(r).map(p=>referenceLocalToWorld(ref,p)));ctx.stroke();ctx.restore();}
  function drawReference(ref) {
    if(ref.type==='pdf')return;
    ctx.save();
    ctx.globalAlpha = ref.opacity;
    if(ref.clip)applyReferenceCanvasClip(ref);
    if (ref.type === 'image') {
      const tl=toScreenCss(referenceLocalToWorld(ref,{x:0,y:ref.height}));ctx.translate(tl.x,tl.y);ctx.rotate(-rad(viewAngle()));ctx.drawImage(ref.image,0,0,ref.width*ref.scale*state.camera.zoom,ref.height*ref.scale*state.camera.zoom);
    } else if (ref.type === 'linkedCadRegion') {
      const region=state.drawingRegions.find(r=>r.id===ref.regionId);if(!region){ctx.restore();return;}
      const color=getComputedStyle(document.documentElement).getPropertyValue('--cad-muted').trim()||'#8a8f98',cache=getLinkedCadRenderCache(ref,region),{w,h}=cssCanvasSize();
      ctx.strokeStyle=color;ctx.fillStyle=color;ctx.save();canvasPolygon(rangePolygon(region));ctx.clip();
      ctx.save();applyWorldCanvasTransform();ctx.lineWidth=1/Math.max(state.camera.zoom,.000001);for(const [layer,data] of cache.layers){if(!cadLayerVisible(layer,region.id))continue;ctx.stroke(data.path);}ctx.restore();
      for(const [layer,data] of cache.layers){if(!cadLayerVisible(layer,region.id))continue;for(const e of data.texts){const rawFontPx=Math.max(1,(Number(e.height)||180)*state.camera.zoom);if(rawFontPx<2)continue;const fontPx=state.toolset==='plan'?Math.max(8,rawFontPx):rawFontPx,sp=toScreenCss(e.point);ctx.save();ctx.translate(sp.x,sp.y);ctx.rotate(-rad((Number(e.rotation)||0)+viewAngle()));ctx.font=`${Math.min(fontPx,900)}px system-ui`;ctx.fillStyle=color;ctx.textBaseline='alphabetic';ctx.fillText(e.text||'',0,0);ctx.restore();}}
      ctx.restore();
    } else if (ref.type === 'dxf') {
      const visibleLayers = ref.visibleLayers;
      const color = getComputedStyle(document.documentElement).getPropertyValue('--text-2').trim() || '#9ca3af';
      const { w, h } = cssCanvasSize();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.save();
      applyWorldCanvasTransform(ref.origin,ref.scale);
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
        ctx.save();ctx.translate(sp.x,sp.y);ctx.rotate(-rad((Number(e.rotation)||0)+viewAngle()));ctx.font=`${Math.min(fontPx,900)}px system-ui`;ctx.fillStyle=color;ctx.textBaseline='alphabetic';ctx.fillText(e.text||'',0,0);ctx.restore();
      }
    }
    ctx.restore();
  }

  function layerVisible(id) { return planLayers.find(l => l.id === id)?.visible !== false; }
  function cadGlobalLayerVisible(name){return cadLayerModule.globalVisible(state.cadLayerVisibility,name);}
  function cadRegionLayerMap(regionId,{create=false}={}){return cadLayerModule.regionMap(state.cadRegionLayerVisibility,regionId,{create});}
  function cadRegionLayerVisible(regionId,name){return cadLayerModule.regionVisible(state.cadRegionLayerVisibility,regionId,name);}
  function cadRegionLayerOverride(regionId,name){return cadLayerModule.regionOverride(state.cadRegionLayerVisibility,regionId,name);}
  function cadLayerHasOverride(name,regionId=state.cadWorkRegionId){return Boolean(regionId)&&cadLayerModule.hasOverride(state.cadRegionLayerVisibility,regionId,name);}
  function cadLayerVisible(name,regionId=(state.toolset==='cad'?state.cadWorkRegionId:null)){return cadLayerModule.effectiveVisible(state.cadLayerVisibility,state.cadRegionLayerVisibility,regionId,name);}
  function cadLayerInheritedOff(name,regionId=state.cadWorkRegionId){return Boolean(regionId)&&!cadLayerHasOverride(name,regionId)&&!cadGlobalLayerVisible(name);}
  function clearCadLayerVisibilityOverride(layer){
    const regionId=state.cadWorkRegionId;if(!regionId||!cadLayerHasOverride(layer,regionId))return false;
    pushHistory();cadLayerModule.clearOverride(state.cadRegionLayerVisibility,regionId,layer);touchCadLayer();cadSelectionService?.prune();markDirty(true);updateAll();return true;
  }
  function cadKnownLayers(){
    if(!cadLayerStore)initializeCadServices();
    const names=new Set(cadLayerModule.knownLayers(state.cadLayerVisibility,state.objects,cadSourceObject));
    for(const obj of state.objects)if(cadSourceObject(obj))names.add(cadLayerForObject(obj));
    for(const name of cadLayerStore.names())names.add(name);
    for(const [,map] of state.cadRegionLayerVisibility)for(const name of map.keys())names.add(name);
    names.add('0');
    return [...names];
  }
  function setCadLayerVisibilityUndoable(layer,visible){
    const regionId=state.cadWorkRegionId,next=Boolean(visible);
    const current=cadLayerModule.scopedToggleValue(state.cadLayerVisibility,state.cadRegionLayerVisibility,regionId,layer);
    if(current===next)return;
    pushHistory();
    cadLayerModule.setScoped(state.cadLayerVisibility,state.cadRegionLayerVisibility,regionId,layer,next);
    touchCadLayer();cadSelectionService?.prune();markDirty(true);updateAll();
  }
  function soloLayer(layer){
    const regionId=state.cadWorkRegionId,keys=cadKnownLayers();
    if(cadLayerModule.isSoloScoped(state.cadLayerVisibility,state.cadRegionLayerVisibility,regionId,keys,layer))return;
    pushHistory();cadLayerModule.soloScoped(state.cadLayerVisibility,state.cadRegionLayerVisibility,regionId,keys,layer);
    touchCadLayer();cadSelectionService?.prune();markDirty(true);updateAll();
  }
  function showAllCadLayers(){
    const regionId=state.cadWorkRegionId,keys=cadKnownLayers();
    if(!cadLayerModule.hasHiddenScoped(state.cadLayerVisibility,state.cadRegionLayerVisibility,regionId,keys))return;
    pushHistory();cadLayerModule.showAllScoped(state.cadLayerVisibility,state.cadRegionLayerVisibility,regionId,keys);
    touchCadLayer();markDirty(true);updateAll();
  }
  function serializeCadRegionLayerVisibility(){return cadLayerModule.serialize(state.cadRegionLayerVisibility);}
  function restoreCadRegionLayerVisibility(raw){state.cadRegionLayerVisibility=cadLayerModule.deserialize(raw);}


  function validCadLayerName(raw){const name=String(raw??'').trim();return name&&name.length<=255&&!/[<>\\/:;?*|=",]/.test(name)?name:null;}
  function nextCadLayerName(){let n=1,name;do{name=`LAYER_${n++}`;}while(cadLayerStore?.has(name));return name;}
  function ensureCadLayerMaps(name){if(!state.cadLayerVisibility.has(name))state.cadLayerVisibility.set(name,true);cadLayerStore?.ensure(name);}
  function cadMappingUsesLayer(name){if(!state.cadMapping)return false;return ['wallLayer','doorLayer','windowLayer','dimensionLayer'].some(key=>state.cadMapping[key]===name);}
  function setActiveCadLayer(name){if(!cadLayerStore)initializeCadServices();if(!cadLayerStore.has(name))return false;if(state.activeCadLayer===name)return true;state.activeCadLayer=name;ensureCadLayerMaps(name);touchCadLayer();markDirty(true);renderCadLayersPanel();renderProperties();return true;}
  function createCadLayer(name=null,{beginRename=false}={}){
    if(!cadLayerStore)initializeCadServices();const candidate=validCadLayerName(name||nextCadLayerName());
    if(!candidate){setCommandStatus(t('layer.invalidName'),'error');return null;}
    if(cadLayerStore.has(candidate)){setCommandStatus(t('layer.exists',{name:candidate}),'error');return null;}
    pushHistory();const def=cadLayerStore.create(candidate);state.cadLayerVisibility.set(candidate,true);state.activeCadLayer=candidate;touchCadLayer();markDirty(true);
    if(beginRename)cadLayerRenameTarget=candidate;updateAll();return def;
  }
  function renameCadLayer(from,rawTo){
    if(!cadLayerStore)initializeCadServices();const to=validCadLayerName(rawTo);if(!to){setCommandStatus(t('layer.invalidName'),'error');return false;}
    if(from===to){cadLayerRenameTarget=null;renderCadLayersPanel();return true;}
    if(cadLayerStore.has(to)){setCommandStatus(t('layer.exists',{name:to}),'error');return false;}
    if(!cadLayerStore.has(from))return false;
    pushHistory();
    cadLayerStore.rename(from,to);
    for(const obj of state.objects)if(cadSourceObject(obj)&&cadLayerForObject(obj)===from)obj.cadLayer=to;
    if(state.cadLayerVisibility.has(from)){const v=state.cadLayerVisibility.get(from);state.cadLayerVisibility.delete(from);state.cadLayerVisibility.set(to,v);}else state.cadLayerVisibility.set(to,true);
    for(const [,map] of state.cadRegionLayerVisibility){if(map.has(from)){const v=map.get(from);map.delete(from);map.set(to,v);}}
    if(state.activeCadLayer===from)state.activeCadLayer=to;
    if(state.cadMapping){for(const key of['wallLayer','doorLayer','windowLayer','dimensionLayer'])if(state.cadMapping[key]===from)state.cadMapping[key]=to;}
    cadLayerRenameTarget=null;touchCadLayer();touchCadGeometry();markDirty(true);rebuildObjectSnapIndex({touch:false});updateAll();return true;
  }
  function deleteCadLayer(name){
    if(!cadLayerStore||name==='0')return false;const used=state.objects.filter(o=>cadSourceObject(o)&&cadLayerForObject(o)===name).length;
    if(used){setCommandStatus(t('layer.inUse',{name,count:used}),'error');return false;}if(cadMappingUsesLayer(name)){setCommandStatus(t('layer.inMapping',{name}),'error');return false;}
    showAppConfirm({title:t('layer.deleteTitle',{name}),copy:t('layer.deleteConfirm',{name}),confirmLabel:t('action.delete'),onConfirm:()=>{
      pushHistory();cadLayerStore.remove(name);refreshCadAppearance();state.cadLayerVisibility.delete(name);for(const [,map] of state.cadRegionLayerVisibility)map.delete(name);if(state.activeCadLayer===name)state.activeCadLayer='0';cadLayerRenameTarget=null;touchCadLayer();markDirty(true);updateAll();
    }});return true;
  }
  function setCadLayerProperties(name,patch){
    if(state.toolset!=='cad'||!cadLayerStore?.has(name))return false;
    let values;try{values=modules.cadProperties.validate(patch,{layer:true});}catch(e){setCommandStatus(t('cadFault.generic'),'error');return false;}
    const before={...cadLayerStore.get(name)},after={...before,...values};if(JSON.stringify(before)===JSON.stringify(after))return false;
    state.cadLayerDefinitions.set(name,after);refreshCadAppearance();appendHistoryEntry({kind:'cad-layer-change',name,before,after:{...after}});
    touchCadLayer();state.cadRenderRevision++;markDirty(true);updateAll();return true;
  }
  function setCadLayerLocked(name,locked){return setCadLayerProperties(name,{locked:Boolean(locked)});}
  function setCadObjectProperties(ids,patch){
    if(state.toolset!=='cad')return false;let values;try{values=modules.cadProperties.validate(patch);}catch(e){return false;}
    const objects=[...ids].map(id=>cadContext.getById(id));if(!objects.length||objects.some(o=>!o||!cadPolicy(o.id,'modify').allowed))return false;
    const positions=new Map(state.objects.map((o,i)=>[o.id,i]));const changed=commitCadChanges('properties',objects.map(o=>({before:o,after:{...o,...values},index:positions.get(o.id)})));if(changed)updateAll();return changed;
  }
  function matchCadProperties(sourceId,ids,{refresh=true}={}){
    const source=cadContext.getById(sourceId);if(!source||cadSourceKind(source)!=='cad-source'||!cadPolicy(sourceId,'inspect').allowed)return false;
    const values=Object.fromEntries(modules.cadProperties.keys.map(k=>[k,source[k]??null])),targets=[...ids].filter(id=>id!==sourceId).map(id=>cadContext.getById(id));
    if(!targets.length||cadLayerLocked(cadLayerForObject(source))||targets.some(o=>!o||!cadPolicy(o.id,'modify').allowed))return false;
    const positions=new Map(state.objects.map((o,i)=>[o.id,i]));const result=commitCadChanges('MATCHPROP',targets.map(o=>({before:o,after:{...o,...values,cadLayer:cadLayerForObject(source)},index:positions.get(o.id)})));if(result&&refresh)updateAll();return result;
  }
  function reassignCadObjects(ids,targetLayer){
    if(!cadLayerStore)initializeCadServices();const layer=validCadLayerName(targetLayer);if(!layer||!cadLayerStore.has(layer))return false;
    const objects=[...ids].map(id=>cadContext.getById(id));if(!objects.length||objects.some(o=>!o))return false;
    const denied=objects.find(o=>!cadPolicy(o.id,'modify').allowed);if(denied){setCommandStatus(cadFaultMessage(cadPolicy(denied.id,'modify').reason),'error');return false;}
    if(objects.some(o=>cadSourceKind(o)!=='cad-source')){setCommandStatus(t('cadFault.notModifiable'),'error');return false;}
    if(objects.every(o=>cadLayerForObject(o)===layer))return true;
    if(cadLayerLocked(layer))return false;const positions=new Map(state.objects.map((o,i)=>[o.id,i]));const changes=objects.map(obj=>({before:obj,after:{...obj,cadLayer:layer},index:positions.get(obj.id)}));commitCadChanges('layer reassignment',changes);touchCadLayer();updateAll();return true;
  }
  function cadObjectModifiable(obj,{notify=true}={}){if(state.toolset!=='cad')return true;if(!obj)return false;const result=cadPolicy(obj.id,'modify');if(!result.allowed&&notify)setCommandStatus(cadFaultMessage(result.reason),'error');return result.allowed;}

  function setCadUnitSystem(system){const next=system==='imperial'?'imperial':'metric';if(state.unitSystem===next)return;state.unitSystem=next;markDirty(true);updateAll();}
  function cadLengthText(mm,{precision=1}={}){return cadUnitsModule.formatLength(mm,{system:state.unitSystem,precision});}
  function cadPointText(point,{precision=1}={}){return `${cadLengthText(point?.x??0,{precision})}, ${cadLengthText(point?.y??0,{precision})}`;}


  function drawComponentObject(obj,color,width=1.2){
    const asset=componentLibrary.get(obj.assetId);if(!asset||!obj.point)return;
    const b=componentLibrary.localBounds(asset),pt=p=>toScreenCss(componentLibrary.worldPoint(obj,p));
    const poly=(points,{close=false}={})=>{if(!points?.length)return;ctx.beginPath();points.forEach((p,i)=>{const q=pt(p);if(!i)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);});if(close)ctx.closePath();ctx.stroke();};
    ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';
    for(const path of componentLibrary.vectorPaths(asset))poly(path.points,{close:path.closed});
    if(isSelectedId(obj.id)){for(const p0 of[{x:b.minx,y:b.miny},{x:b.maxx,y:b.miny},{x:b.maxx,y:b.maxy},{x:b.minx,y:b.maxy}]){const q=pt(p0);ctx.fillRect(q.x-2.5,q.y-2.5,5,5);}}
    ctx.restore();
  }

  function drawPlanWorkspace() {
    const floor=activeFloor(),regionId=floor?.sourceRegionId||null,region=regionId?state.drawingRegions.find(r=>r.id===regionId)||null:null,linkedCadReference=state.references.find(r=>r.type==='linkedCadRegion'&&r.regionId===regionId),styles = getComputedStyle(document.documentElement),muted=styles.getPropertyValue('--cad-muted').trim(),line=styles.getPropertyValue('--line').trim(),wall=styles.getPropertyValue('--wall').trim(),dim=styles.getPropertyValue('--dimension').trim(),sel=styles.getPropertyValue('--selection').trim(),hover=styles.getPropertyValue('--hover').trim(),planObjects=getPlanObjects();
    if(!linkedCadReference) for (const obj of cadObjectsForRegion(region)) {if (!isCadObject(obj)) continue;if (!cadLayerVisible(cadLayerForObject(obj),regionId)) continue;const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id);drawCadObject(obj, selected ? sel : preview ? hover : muted, selected ? 2 : preview ? 1.8 : 1);}
    if(layerVisible('spaces')) for(const obj of planObjects) if(obj.type==='space') drawSpacePlan(obj);
    if(layerVisible('stairs')) for(const obj of planObjects) if(obj.type==='stair') drawStairPlan(obj);
    if(layerVisible('walls')) for(const obj of planObjects) if(obj.type==='wall') drawWallPlan(obj, isSelectedId(obj.id) ? sel : wall);
    for (const obj of planObjects) {if(obj.type==='door'&&layerVisible('doors'))drawOpeningPlan(obj,'door',isSelectedId(obj.id)?sel:styles.getPropertyValue('--door').trim());else if(obj.type==='window'&&layerVisible('windows'))drawOpeningPlan(obj,'window',isSelectedId(obj.id)?sel:styles.getPropertyValue('--window').trim());else if(obj.type==='dimension'&&layerVisible('dimensions'))drawDimension(obj,isSelectedId(obj.id)?sel:dim);else if(obj.type==='line'&&layerVisible('drawing'))drawLineObject(obj,isSelectedId(obj.id)?sel:line);else if(obj.type==='component'){const preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!isSelectedId(obj.id)&&!preview;drawComponentObject(obj,isSelectedId(obj.id)?sel:preview||hovered?hover:line,isSelectedId(obj.id)?2:preview||hovered?1.8:1.15);}}
  }

  function drawSpacePlan(obj){
    if(!obj.polygon?.length)return;const styles=getComputedStyle(document.documentElement),selected=isSelectedId(obj.id),stroke=selected?styles.getPropertyValue('--selection').trim():(obj.invalid?'#b45309':styles.getPropertyValue('--accent').trim()),bg=styles.getPropertyValue('--canvas').trim();
    ctx.save();ctx.fillStyle=stroke;ctx.globalAlpha=obj.invalid?.06:(selected?.18:.075);ctx.beginPath();obj.polygon.forEach((p,i)=>{const q=toScreenCss(p);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);});ctx.closePath();ctx.fill();ctx.globalAlpha=selected?.95:.68;ctx.strokeStyle=stroke;ctx.lineWidth=selected?2.4:1;ctx.setLineDash(obj.invalid?[5,4]:[]);ctx.stroke();ctx.setLineDash([]);
    const c=toScreenCss(polygonCentroid(obj.polygon)),name=obj.name||spaceDefaultName(1),area=`${formatNumber(displaySpaceAreaM2(obj),2)} m²`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    if(selected){ctx.font='600 12px system-ui';const tw=ctx.measureText(name).width,padX=9,w=tw+padX*2,h=24,x=c.x-w/2,y=c.y-h/2-5;ctx.globalAlpha=.96;ctx.fillStyle=bg;ctx.fillRect(x,y,w,h);ctx.strokeStyle=stroke;ctx.lineWidth=1.4;ctx.strokeRect(x+.5,y+.5,w-1,h-1);ctx.fillStyle=stroke;ctx.globalAlpha=1;ctx.fillText(name,c.x,c.y-5);ctx.font='9px system-ui';ctx.globalAlpha=.82;ctx.fillText(area,c.x,c.y+15);}else{ctx.font='600 11px system-ui';ctx.fillStyle=stroke;ctx.globalAlpha=.92;ctx.fillText(name,c.x,c.y-4);ctx.font='9px system-ui';ctx.globalAlpha=.68;ctx.fillText(area,c.x,c.y+10);}ctx.restore();
  }

  function recognizedSpaceBoundaries(){if(state.toolset!=='plan')return[];const selected=getPlanObjects().filter(o=>o.type==='space'&&isSelectedId(o.id)&&o.polygon?.length);return selected.length?selected.map(o=>o.polygon):state.activeTool==='space'&&state.spaceHoverPreview?.face?.polygon?[state.spaceHoverPreview.face.polygon]:[];}
  function drawRecognizedSpaceBoundaries(){const polygons=recognizedSpaceBoundaries();if(!polygons.length)return;ctx.save();const bg=getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();for(const polygon of polygons){canvasPolygon(polygon);ctx.strokeStyle=bg;ctx.lineWidth=7;ctx.setLineDash([]);ctx.stroke();ctx.strokeStyle='#d97800';ctx.lineWidth=3;ctx.setLineDash([9,4]);ctx.stroke();}ctx.setLineDash([]);ctx.fillStyle='#d97800';ctx.font='600 11px system-ui';const q=toScreenCss(polygons[0][0]);ctx.fillText(t(getPlanObjects().some(o=>o.type==='space'&&isSelectedId(o.id)&&o.invalid)?'space.lastRecognizedBoundary':'space.recognizedBoundary'),q.x+8,q.y-10);ctx.restore();}
  function ensureSpaceGapNotice(){let notice=host.querySelector('.space-gap-notice');if(notice)return notice;notice=document.createElement('div');notice.className='space-gap-notice';notice.hidden=true;notice.innerHTML=`<span class="space-gap-notice-text"></span><button type="button" class="space-gap-clear">${escapeHtml(t('space.clearOpenBoundary'))}</button>`;notice.querySelector('button').addEventListener('click',()=>clearSpaceGapDiagnostic());host.appendChild(notice);return notice;}
  function syncSpaceGapNotice(){const notice=ensureSpaceGapNotice(),d=state.spaceGapDiagnostic;if(!d||state.toolset!=='plan'){notice.hidden=true;return;}notice.hidden=false;notice.querySelector('.space-gap-notice-text').textContent=t('space.openBoundaryShown',{count:d.candidates?.length||0});}
  function clearSpaceGapDiagnostic({silent=false}={}){if(!state.spaceGapDiagnostic){syncSpaceGapNotice();return;}state.spaceGapDiagnostic=null;syncSpaceGapNotice();if(!silent)setCommandStatus(t('space.openBoundaryCleared'),'strong');render();}
  function drawSpaceGapDiagnostic(){drawRecognizedSpaceBoundaries();
    const d=state.spaceGapDiagnostic;syncSpaceGapNotice();if(!d||state.toolset!=='plan'||!d.candidates?.length)return;const styles=getComputedStyle(document.documentElement),danger=styles.getPropertyValue('--danger').trim()||'#F85149';ctx.save();ctx.strokeStyle=danger;ctx.fillStyle=danger;ctx.lineCap='round';
    d.candidates.slice(0,5).forEach((g,i)=>{const a=toScreenCss(g.a),b=toScreenCss(g.b),strong=i===0;ctx.globalAlpha=strong?.98:.48;ctx.lineWidth=strong?2.4:1.4;ctx.setLineDash(strong?[6,4]:[4,5]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);for(const p of[a,b]){ctx.beginPath();ctx.arc(p.x,p.y,strong?6:4,0,Math.PI*2);ctx.fill();}if(strong){const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,label=t('space.openGapLabel',{distance:formatNumber(g.distance,1)});ctx.font='600 10px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';const tw=ctx.measureText(label).width;ctx.globalAlpha=.96;ctx.fillStyle=styles.getPropertyValue('--canvas').trim();ctx.fillRect(mx-tw/2-6,my-22,tw+12,19);ctx.strokeStyle=danger;ctx.strokeRect(mx-tw/2-5.5,my-21.5,tw+11,18);ctx.fillStyle=danger;ctx.fillText(label,mx,my-12);}});ctx.restore();
  }


  function drawStairPlan(obj){if(!obj.polygon?.length)return;ctx.save();ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue(isSelectedId(obj.id)?'--selection':'--text-2').trim();ctx.lineWidth=isSelectedId(obj.id)?2:1.2;for(const g of modules.planStair.segments(obj)){const a=toScreenCss(g.a),b=toScreenCss(g.b);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}ctx.restore();}
  function stairAtCorners(a,b){const r=rectFromPoints(a,b);if(r.maxx-r.minx<10||r.maxy-r.miny<10)return null;return{type:'stair',layerId:'stairs',stairType:'straight',polygon:modules.planStair.footprint({x:r.minx,y:r.miny},r.maxx-r.minx,r.maxy-r.miny),treadCount:12,upDirection:1,floorId:state.activeFloorId};}
  function commitStair(a,b){const o=stairAtCorners(a,b);if(!o||state.toolset!=='plan')return false;pushHistory();o.id=uid('stair');state.objects.push(o);state.stairDraft=null;selectOnly(o.id);markDirty(true);rebuildObjectSnapIndex();setTool('select');setCommandStatus(t('command.finished'),'strong');updateAll();return o;}
  function drawStairPreview(){if(state.toolset!=='plan'||state.activeTool!=='stair'||!state.stairDraft||!state.previewEnd)return;const o=stairAtCorners(state.stairDraft,state.previewEnd);if(!o)return;ctx.save();ctx.globalAlpha=.6;drawStairPlan(o);ctx.restore();}
  function editStair(o,patch){if(state.toolset!=='plan'||o?.type!=='stair'||!objectOnActiveFloor(o))return false;let next;try{next=modules.planStair.edit(o,patch);}catch{setCommandStatus(t('stair.invalid'),'error');return false;}pushHistory();Object.assign(o,next);markDirty(true);rebuildObjectSnapIndex();updateAll();return true;}

  function drawDrawingRegions(){if(state.toolset!=='cad')return;const color=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),active=activeCadWorkRegion();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.setLineDash([6,5]);ctx.lineWidth=1.2;for(const region of state.drawingRegions){if(active&&region.id!==active.id)continue;ctx.globalAlpha=region.id===state.selectedRegionId?.95:.5;canvasPolygon(rangePolygon(region));ctx.stroke();const a=toScreenCss({x:region.minx,y:region.maxy});ctx.setLineDash([]);ctx.font='11px system-ui';ctx.fillText(region.name||t('region.unnamed'),a.x+6,a.y+15);ctx.setLineDash([6,5]);}ctx.restore();}

  function drawSnapIndicator(){const s=state.snapIndicator;if(!state.snap||temporarySnapOverride()||!s||isCompactViewer())return;const p=toScreenCss(s),styles=getComputedStyle(document.documentElement),color=styles.getPropertyValue('--accent').trim();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=styles.getPropertyValue('--canvas').trim();ctx.lineWidth=1.7;ctx.beginPath();if(s.kind==='midpoint'){ctx.moveTo(p.x,p.y-6);ctx.lineTo(p.x+6,p.y+5);ctx.lineTo(p.x-6,p.y+5);ctx.closePath();ctx.fill();}else if(s.kind==='center'||s.kind==='wall'||s.kind==='nearest'){ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();}else if(s.kind==='intersection'){ctx.moveTo(p.x-5,p.y-5);ctx.lineTo(p.x+5,p.y+5);ctx.moveTo(p.x+5,p.y-5);ctx.lineTo(p.x-5,p.y+5);}else if(s.kind==='perpendicular'){ctx.moveTo(p.x-5,p.y-5);ctx.lineTo(p.x-5,p.y+5);ctx.lineTo(p.x+5,p.y+5);ctx.moveTo(p.x-5,p.y);ctx.lineTo(p.x,p.y);ctx.lineTo(p.x,p.y+5);}else{ctx.rect(p.x-5,p.y-5,10,10);ctx.fill();}ctx.stroke();ctx.fillStyle=color;ctx.font='600 11px system-ui';ctx.textAlign='right';ctx.fillText(t('snap.'+(s.kind==='wall'?'nearest':s.kind))+(s.source==='reference'?' · REF':''),p.x-9,p.y-12);ctx.restore();}

  function cadJoinSourceEndpointPoints(){
    if(state.toolset!=='cad'||state.activeTool!=='join'||!cadModifySourceId)return[];const obj=cadContext?.getById(cadModifySourceId)||state.objects.find(o=>o.id===cadModifySourceId);if(!obj)return[];if(modules.cadPolyline.is(obj)&&!obj.closed&&obj.vertices?.length>=2)return[obj.vertices[0],obj.vertices.at(-1)].map(p=>({x:p.x,y:p.y}));if(obj.type==='cadLine'&&obj.a&&obj.b)return[obj.a,obj.b].map(p=>({x:p.x,y:p.y}));return[];
  }
  function drawCadJoinSourceEndpoints(){
    const points=cadJoinSourceEndpointPoints();if(!points.length)return;const styles=getComputedStyle(document.documentElement),color=styles.getPropertyValue('--selection').trim()||styles.getPropertyValue('--accent').trim(),bg=styles.getPropertyValue('--canvas').trim();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=bg;ctx.lineWidth=2;for(const p of points){const q=toScreenCss(p);ctx.beginPath();ctx.rect(q.x-5,q.y-5,10,10);ctx.fill();ctx.stroke();}ctx.restore();
  }
  function drawCadWorkspace() {
    const styles=getComputedStyle(document.documentElement),line=styles.getPropertyValue('--line').trim(),sel=styles.getPropertyValue('--selection').trim(),hover=styles.getPropertyValue('--hover').trim(),dim=styles.getPropertyValue('--dimension').trim(),door=styles.getPropertyValue('--door').trim(),windowColor=styles.getPropertyValue('--window').trim();
    const rotate=state.cadRotate,delta=cadRotatePreviewDelta(),previewing=rotate?.phase==='target'&&rotate.base&&Math.abs(delta)>1e-8,screenBase=previewing?toScreenCss(rotate.base):null;
    const cadRenderObjects=cadWorkObjects(),orderedCadRenderObjects=cadRenderObjects.some(o=>Number(o.drawOrder))?[...cadRenderObjects].sort((a,b)=>(Number(a.drawOrder)||0)-(Number(b.drawOrder)||0)):cadRenderObjects;
    for(const obj of orderedCadRenderObjects){if(!cadLayerVisible(cadLayerForObject(obj)))continue;const selected=isSelectedId(obj.id),commandSource=obj.id===cadModifySourceId,preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!commandSource&&!preview;if(previewing&&rotate.objectIds.has(obj.id)){ctx.save();ctx.translate(screenBase.x,screenBase.y);ctx.rotate(-rad(delta));ctx.translate(-screenBase.x,-screenBase.y);drawCadObject(obj,selected?sel:commandSource?sel:preview?hover:hovered?hover:line,selected||commandSource?2:preview?1.8:hovered?1.8:1.25);ctx.restore();}else drawCadObject(obj,selected?sel:commandSource?sel:preview?hover:hovered?hover:line,selected||commandSource?2:preview?1.8:hovered?1.8:1.25);}
    drawCadJoinSourceEndpoints();
    for(const obj of componentObjectsForCad()){const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview;drawComponentObject(obj,selected?sel:preview||hovered?hover:line,selected?2:preview||hovered?1.8:1.15);}
    if(!state.cadPlanOverlay)return;
    for(const obj of cadPlanOverlayObjects()){if(obj.type==='wall'&&cadLayerVisible(cadLayerForObject(obj))){const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview;drawWallCad(obj,selected?sel:preview?hover:hovered?hover:line);}}
    for(const obj of cadPlanOverlayObjects()){const selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview,color=selected?sel:preview?hover:hovered?hover:null;if(obj.type==='door'&&cadLayerVisible(cadLayerForObject(obj)))drawOpeningCad(obj,'door',color||door);else if(obj.type==='window'&&cadLayerVisible(cadLayerForObject(obj)))drawOpeningCad(obj,'window',color||windowColor);else if(obj.type==='dimension'&&cadLayerVisible(cadLayerForObject(obj)))drawDimension(obj,color||dim);else if(obj.type==='stair'&&cadLayerVisible(cadLayerForObject(obj)))drawStairPlan(obj);else if(obj.type==='line'&&cadLayerVisible(cadLayerForObject(obj)))drawLineObject(obj,color||line);}
  }
  function drawCadRotateGuide(){const r=state.cadRotate;if(state.toolset!=='cad'||!r?.base)return;const styles=getComputedStyle(document.documentElement),color=styles.getPropertyValue('--accent').trim(),base=toScreenCss(r.base);ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(base.x,base.y,5,0,Math.PI*2);ctx.stroke();if(r.referencePoint){const q=toScreenCss(r.referencePoint);ctx.globalAlpha=.55;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.lineTo(q.x,q.y);ctx.stroke();}if(r.targetPoint){const q=toScreenCss(r.targetPoint);ctx.globalAlpha=.95;ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.font='600 11px system-ui';ctx.fillText(`${formatNumber(cadRotatePreviewDelta(),2)}°`,q.x+8,q.y-8);}ctx.restore();}

  function isPlanDisplayArc(obj){return obj?.type==='line'&&obj?.planRole==='display'&&obj.geometry==='arc'&&obj.center&&Number.isFinite(obj.radius)&&Number.isFinite(obj.startAngle)&&Number.isFinite(obj.sweep);}
  function setPlanStroke(obj,style){
    if(state.toolset!=='plan'||!objectOnActiveFloor(obj)||!['solid','dashed','dotted','dashdot'].includes(style)||!['wall','line'].includes(obj.type))return false;
    if(obj.type==='wall'&&style==='solid'||obj.type==='line'&&obj.lineStyle===style)return false;
    if(obj.type==='wall'&&style!=='solid'){
      const c=obj.constraints||{},hosted=state.objects.some(o=>o.wallId===obj.id||o.id!==obj.id&&(o.attachments?.a?.wallId===obj.id||o.attachments?.b?.wallId===obj.id||o.constraints?.reference?.wallId===obj.id)),linked=Object.values(obj.attachments||{}).some(Boolean),fixed=c.fixed||c.orientation||c.reference||Number.isFinite(c.fixedAngle)||Number.isFinite(c.fixedLength);
      if(hosted||linked||fixed){setCommandStatus(t('plan.strokeBlocked'),'error');return false;}
    }
    pushHistory();obj.lineStyle=style;
    if(style==='solid'){obj.type='wall';obj.planRole='boundary';obj.layerId='walls';obj.thickness=Number(obj.thickness)||currentWallThickness();obj.attachments=obj.attachments||{};}
    else{obj.type='line';obj.planRole='display';obj.layerId='drawing';delete obj.cadLayer;}
    markDirty(true);rebuildObjectSnapIndex();refreshSpaces();updateAll();return true;
  }
  function planLineAppearance(){const s=state.toolSettings?.planLineAppearance||{};return {color:/^#[\da-f]{6}$/i.test(s.color||'')?s.color:'#8e9bab',width:clamp(Number(s.width)||1.4,.5,6),dashScale:clamp(Number(s.dashScale)||1,.5,3)};}
  function planDisplayDash(style,appearance=planLineAppearance()){const a=appearance.dashScale;return style==='dashed'?[9*a,5*a]:style==='dotted'?[1.5*a,5*a]:style==='dashdot'?[10*a,4*a,1.5*a,4*a]:[];}
  function drawLineObject(obj, color, width = 1.4) {
    const styles=getComputedStyle(document.documentElement),selected=isSelectedId(obj.id),preview=isSelectionPreviewId(obj.id),hovered=obj.id===state.hoveredObjectId&&!selected&&!preview;
    const stroke=selected?styles.getPropertyValue('--selection').trim():preview?styles.getPropertyValue('--hover').trim():hovered?styles.getPropertyValue('--hover').trim():color;
    const a=toScreenCss(obj.a),b=toScreenCss(obj.b),display=obj.planRole==='display',appearance=planLineAppearance();ctx.save();ctx.strokeStyle=selected||preview||hovered?stroke:display?appearance.color:stroke;ctx.lineWidth=selected?Math.max(2,width):preview||hovered?Math.max(1.8,width):display?appearance.width:width;if(display)ctx.setLineDash(planDisplayDash(obj.lineStyle||'solid',appearance));ctx.beginPath();if(isPlanDisplayArc(obj)){const c=toScreenCss(obj.center);ctx.arc(c.x,c.y,Math.max(.5,obj.radius*state.camera.zoom),-rad(obj.startAngle+viewAngle()),-rad(obj.startAngle+obj.sweep+viewAngle()),obj.sweep>=0);}else{ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();ctx.setLineDash([]);drawSelectionHandles(obj,[a,b]);ctx.restore();
  }

  function objectInViewport(obj){const {minx,maxx,miny,maxy}=viewportLocalBounds();let b=null;if(obj.type==='cadText'||obj.type==='cadDimension'||obj.type==='cadHatch'||obj.type==='cadLeader'||modules.cadPolyline.is(obj)){b=cadGeometry.bounds(obj);if(!b)return false;}else if(isPlanDisplayArc(obj))b={minx:obj.center.x-obj.radius,maxx:obj.center.x+obj.radius,miny:obj.center.y-obj.radius,maxy:obj.center.y+obj.radius};else if(obj.a&&obj.b)b={minx:Math.min(obj.a.x,obj.b.x),maxx:Math.max(obj.a.x,obj.b.x),miny:Math.min(obj.a.y,obj.b.y),maxy:Math.max(obj.a.y,obj.b.y)};else if(obj.center)b={minx:obj.center.x-obj.radius,maxx:obj.center.x+obj.radius,miny:obj.center.y-obj.radius,maxy:obj.center.y+obj.radius};else if(obj.point)b={minx:obj.point.x,maxx:obj.point.x,miny:obj.point.y,maxy:obj.point.y};if(!b)return true;return !(b.maxx<minx||b.minx>maxx||b.maxy<miny||b.miny>maxy);}

  function cadArcPointAt(obj,t){const a=rad((obj.startAngle||0)+(obj.sweep||0)*clamp(t,0,1));return{x:obj.center.x+Math.cos(a)*obj.radius,y:obj.center.y+Math.sin(a)*obj.radius};}
  function projectPointToCadArc(p,obj){const start=normalizeAngle(obj.startAngle||0),sweep=Number(obj.sweep)||0,angle=normalizeAngle(deg(Math.atan2(p.y-obj.center.y,p.x-obj.center.x)));let progress=sweep>=0?deltaCcw(start,angle)/Math.max(.000001,sweep):deltaCcw(angle,start)/Math.max(.000001,-sweep);if(progress>=0&&progress<=1){const point=cadArcPointAt(obj,progress);return{t:progress,point,distance:distance(p,point)};}const a=cadArcPointAt(obj,0),b=cadArcPointAt(obj,1),da=distance(p,a),db=distance(p,b);return da<=db?{t:0,point:a,distance:da}:{t:1,point:b,distance:db};}
  function drawLeaderGeometry(obj,color){if(!obj?.leaderAnchor||!obj?.point)return;const a=toScreenCss(obj.leaderAnchor),b=toScreenCss(obj.point),ang=Math.atan2(b.y-a.y,b.x-a.x),head=8;ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=isSelectedId(obj.id)?2:1.15;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x+Math.cos(ang+.5)*head,a.y+Math.sin(ang+.5)*head);ctx.lineTo(a.x+Math.cos(ang-.5)*head,a.y+Math.sin(ang-.5)*head);ctx.closePath();ctx.fill();ctx.restore();}
  function drawModelText(obj,color,worldScale=1){
    const layout=cadTextLayout(obj,{worldScale}),px=layout.px;if(layout.hidden)return;const p=toScreenCss(obj.point);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-rad((Number(obj.rotation)||0)+viewAngle()));ctx.fillStyle=color;ctx.font=`${Math.min(px,900)}px system-ui`;ctx.textBaseline='alphabetic';for(let i=0;i<layout.lines.length;i++)ctx.fillText(layout.lines[i],0,i*layout.lineAdvancePx);ctx.restore();
  }

  function cadDimensionGeometry(obj){return modules.cadAnnotation2.geometry(obj);}
  function cadAlignedDimensionGeometry(obj){return modules.cadAnnotation2.aligned({...obj,kind:'aligned'});}
  function cadDimensionLabel(obj,g){if(!g)return'';if(g.kind==='radius')return`R ${formatNumber(g.value,1)} mm`;if(g.kind==='diameter')return`Ø ${formatNumber(g.value,1)} mm`;if(g.kind==='angular')return`${formatNumber(g.value,1)}°`;return`${formatNumber(g.len,1)} mm`;}
  function drawDimensionTick(p,ang,color){const tick=5;ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(p.x-Math.cos(ang)*tick,p.y-Math.sin(ang)*tick);ctx.lineTo(p.x+Math.cos(ang)*tick,p.y+Math.sin(ang)*tick);ctx.stroke();}
  function drawArrowHead(tip,toward,color){const a=Math.atan2(toward.y-tip.y,toward.x-tip.x),size=8;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.lineTo(tip.x+Math.cos(a+.42)*size,tip.y+Math.sin(a+.42)*size);ctx.lineTo(tip.x+Math.cos(a-.42)*size,tip.y+Math.sin(a-.42)*size);ctx.closePath();ctx.fill();}
  function drawCadDimensionObject(obj,color){
    const g=cadDimensionGeometry(obj);if(!g)return;const styles=getComputedStyle(document.documentElement),bg=styles.getPropertyValue('--canvas').trim();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=isSelectedId(obj.id)?2:1.15;
    if(g.kind==='aligned'){
      const p1=toScreenCss(g.p1),p2=toScreenCss(g.p2),d1=toScreenCss(g.d1),d2=toScreenCss(g.d2);ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(d1.x,d1.y);ctx.moveTo(p2.x,p2.y);ctx.lineTo(d2.x,d2.y);ctx.moveTo(d1.x,d1.y);ctx.lineTo(d2.x,d2.y);ctx.stroke();const ang=Math.atan2(d2.y-d1.y,d2.x-d1.x)+Math.PI/4;drawDimensionTick(d1,ang,color);drawDimensionTick(d2,ang,color);
    }else if(g.kind==='radius'||g.kind==='diameter'){
      const a=toScreenCss(g.start),b=toScreenCss(g.end),edge=toScreenCss(g.edge);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();drawArrowHead(edge,b,color);
    }else if(g.kind==='angular'){
      const v=toScreenCss(g.vertex),a=toScreenCss(g.start),b=toScreenCss(g.end);ctx.beginPath();ctx.moveTo(v.x,v.y);ctx.lineTo(a.x,a.y);ctx.moveTo(v.x,v.y);ctx.lineTo(b.x,b.y);ctx.stroke();const n=Math.max(8,Math.ceil(Math.abs(g.sweep)/8)),pts=[];for(let i=0;i<=n;i++)pts.push(toScreenCss(modules.cadAnnotation2.pointAt(g.vertex,g.radius,g.startAngle+g.sweep*i/n)));ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.stroke();
    }
    const lp=toScreenCss(g.labelPoint||g.d1||g.end),text=cadDimensionLabel(obj,g);ctx.font='11px system-ui';ctx.textBaseline='middle';ctx.textAlign='center';const tw=ctx.measureText(text).width;ctx.fillStyle=bg;ctx.fillRect(lp.x-tw/2-5,lp.y-9,tw+10,18);ctx.fillStyle=color;ctx.fillText(text,lp.x,lp.y);ctx.restore();
  }
  function pointInPolygon2(p,pts){let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j],hit=((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/((b.y-a.y)||1e-12)+a.x);if(hit)inside=!inside;}return inside;}
  function hatchLineFamily(ctx,sp,angleDeg,step){const xs=sp.map(p=>p.x),ys=sp.map(p=>p.y),minx=Math.min(...xs)-150,maxx=Math.max(...xs)+150,miny=Math.min(...ys)-150,maxy=Math.max(...ys)+150,c={x:(minx+maxx)/2,y:(miny+maxy)/2},diag=Math.hypot(maxx-minx,maxy-miny),a=rad(angleDeg),u={x:Math.cos(a),y:Math.sin(a)},n={x:-u.y,y:u.x};for(let off=-diag;off<=diag;off+=step){ctx.beginPath();ctx.moveTo(c.x+n.x*off-u.x*diag,c.y+n.y*off-u.y*diag);ctx.lineTo(c.x+n.x*off+u.x*diag,c.y+n.y*off+u.y*diag);ctx.stroke();}}
  function drawCadHatchObject(obj,color){const pts=obj.points||[];if(pts.length<3)return;const sp=pts.map(toScreenCss),pattern=String(obj.pattern||'ANSI31').toUpperCase(),angle=Number(obj.angle??45),step=Math.max(6,Number(obj.spacingPx)||16);ctx.save();ctx.beginPath();sp.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();if(pattern==='SOLID'){ctx.fillStyle=color;ctx.globalAlpha=.14;ctx.fill();}else{ctx.fillStyle=color;ctx.globalAlpha=.05;ctx.fill();ctx.clip();ctx.globalAlpha=.28;ctx.strokeStyle=color;ctx.lineWidth=1;hatchLineFamily(ctx,sp,angle+viewAngle(),step);if(pattern==='CROSS')hatchLineFamily(ctx,sp,angle+90+viewAngle(),step);}ctx.restore();if(isSelectedId(obj.id)){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();sp.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke();ctx.restore();}}
  function drawCadLeaderObject(obj,color){const pts=obj.points||[];if(pts.length<2)return;const sp=pts.map(toScreenCss);ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=isSelectedId(obj.id)?2:1.15;ctx.beginPath();sp.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();drawArrowHead(sp[0],sp[1],color);ctx.restore();const textObj={...obj,type:'cadText',point:pts.at(-1),rotation:0,width:Math.max(0,Number(obj.width)||1200),height:Math.max(1,Number(obj.height)||140),lineSpacing:1.2};drawModelText(textObj,color);}
  function polylineBoundaryPoints(obj){if(!modules.cadPolyline.is(obj)||!obj.closed)return[];const out=[];for(const e of modules.cadPolyline.get(obj).edges){if(!out.length)out.push({...e.a});if(e.type==='cadLine')out.push({...e.b});else{const n=Math.max(4,Math.ceil(Math.abs(e.sweep||0)/10));for(let i=1;i<=n;i++)out.push(cadArcPointAt(e,i/n));}}if(out.length>1&&distance(out[0],out.at(-1))<1e-6)out.pop();return out;}
  function annotationDimensionSegments(obj){const g=cadDimensionGeometry(obj);if(!g)return[];if(g.kind==='aligned')return[[g.p1,g.d1],[g.p2,g.d2],[g.d1,g.d2]].map(([a,b])=>({a:{...a},b:{...b}}));if(g.kind==='radius'||g.kind==='diameter')return[{a:{...g.start},b:{...g.end}}];if(g.kind==='angular'){const out=[{a:{...g.vertex},b:{...g.start}},{a:{...g.vertex},b:{...g.end}}],n=Math.max(4,Math.ceil(Math.abs(g.sweep)/12));let prev=modules.cadAnnotation2.pointAt(g.vertex,g.radius,g.startAngle);for(let i=1;i<=n;i++){const q=modules.cadAnnotation2.pointAt(g.vertex,g.radius,g.startAngle+g.sweep*i/n);out.push({a:prev,b:q});prev=q;}return out;}return[];}
  function createCadDimension(data,label='DIMENSION',{finish=true}={}){const layer=state.activeCadLayer||'0';if(cadLayerLocked(layer))return false;const obj={id:uid('cadDimension'),type:'cadDimension',cadLayer:layer,source:'PieniPlan',...data};obj.segments=annotationDimensionSegments(obj);if(!obj.segments.length)return false;commitCadChanges(label,[{before:null,after:obj,index:state.objects.length}]);setSelectionIds(new Set([obj.id]));state.lastCadObjectId=obj.id;if(finish){state.annotationDraft=null;setTool('select','select');}setCommandStatus(t('annotation.dimensionCreated'),'strong');updateAll();return obj;}
  function commitCadTextAt(point){const raw=prompt(t('annotation.textPrompt'),t('annotation.textDefault'));if(raw===null)return false;const text=String(raw).trim();if(!text)return false;const layer=state.activeCadLayer||'0';if(cadLayerLocked(layer)){setCommandStatus(t('cadFault.activeLayerLocked'),'error');return false;}const obj={id:uid('cadText'),type:'cadText',cadLayer:layer,point:{...point},text,height:180,rotation:0,width:0,lineSpacing:1.25,source:'PieniPlan'};commitCadChanges('TEXT',[{before:null,after:obj,index:state.objects.length}]);setSelectionIds(new Set([obj.id]));state.annotationDraft=null;setTool('select','select');setCommandStatus(t('annotation.textCreated'),'strong');updateAll();return true;}
  function closeAnnotationTextDialog(){dom.annotationTextBackdrop.hidden=true;state.annotationDialogDraft=null;}
  function openAnnotationTextDialog(kind,data={}){
    const editing=data.objectId?state.objects.find(o=>o.id===data.objectId):null,isLeader=kind==='leader'||editing?.type==='cadLeader';
    state.annotationDialogDraft={kind,isLeader,editingId:editing?.id||null,...data};
    dom.annotationTextTitle.textContent=t(editing?(isLeader?'annotation.editLeaderTitle':'annotation.editTextTitle'):(isLeader?'annotation.leaderTitle':'annotation.multilineTitle'));
    dom.annotationTextCopy.textContent=t(editing?'annotation.editTextCopy':(isLeader?'annotation.leaderCopy':'annotation.multilineCopy'));
    dom.annotationTextArea.value=editing?.text||'';dom.annotationTextHeight.value=String(Number(editing?.height)||(isLeader?140:180));dom.annotationTextWidth.value=String(Math.max(0,Number(editing?.width)||(isLeader?1000:1200)));dom.annotationTextApplyBtn.textContent=t(editing?'annotation.saveText':'annotation.placeText');dom.annotationTextBackdrop.hidden=false;setTimeout(()=>{dom.annotationTextArea.focus();if(editing)dom.annotationTextArea.select();},0);
  }
  function openAnnotationTextEditor(obj){if(!obj||!['cadText','cadLeader'].includes(obj.type))return false;openAnnotationTextDialog(obj.type==='cadLeader'?'leader':'mtext',{objectId:obj.id});return true;}
  function applyAnnotationTextDialog(){
    const d=state.annotationDialogDraft;if(!d)return;const text=String(dom.annotationTextArea.value||'').trim(),height=Math.max(1,Number(dom.annotationTextHeight.value)||180),width=Math.max(0,Number(dom.annotationTextWidth.value)||0);if(!text)return;
    if(d.editingId){const obj=state.objects.find(o=>o.id===d.editingId);if(!obj)return closeAnnotationTextDialog();if(!cadObjectModifiable(obj))return;const changed=editCadObject(obj,{text,height,width,mtext:obj.type==='cadText'?(obj.mtext||text.includes('\n')||width>0):undefined},obj.type==='cadLeader'?'leader-text':'mtext-edit');if(changed)setCommandStatus(t('annotation.textUpdated'),'strong');closeAnnotationTextDialog();state.annotationDraft=null;updateAll();return;}
    const layer=state.activeCadLayer||'0';if(cadLayerLocked(layer)){setCommandStatus(t('cadFault.activeLayerLocked'),'error');return;}if(d.isLeader){const obj={id:uid('cadLeader'),type:'cadLeader',cadLayer:layer,points:d.points.map(p=>({...p})),text,height,width,lineSpacing:1.2,source:'PieniPlan'};commitCadChanges('LEADER',[{before:null,after:obj,index:state.objects.length}]);setSelectionIds(new Set([obj.id]));}else{const obj={id:uid('cadText'),type:'cadText',cadLayer:layer,point:{...d.point},text,height,width,lineSpacing:1.25,rotation:0,mtext:true,source:'PieniPlan'};commitCadChanges('MTEXT',[{before:null,after:obj,index:state.objects.length}]);setSelectionIds(new Set([obj.id]));}
    closeAnnotationTextDialog();state.annotationDraft=null;setTool('select','select');setCommandStatus(t(d.isLeader?'annotation.leaderCreated':'annotation.textCreated'),'strong');updateAll();
  }
  function latestAlignedCadDimension(){const selected=[...selectionIds()].map(id=>state.objects.find(o=>o.id===id)).find(o=>o?.type==='cadDimension'&&(o.kind||'aligned')==='aligned');if(selected)return selected;const last=state.objects.find(o=>o.id===state.lastCadObjectId);if(last?.type==='cadDimension'&&(last.kind||'aligned')==='aligned')return last;return[...state.objects].reverse().find(o=>o.type==='cadDimension'&&(o.kind||'aligned')==='aligned')||null;}
  function beginCadAnnotation(kind){if(state.toolset!=='cad')return false;let phase='source';const d={kind,phase,p1:null,p2:null};if(kind==='alignedDim'){d.phase='p1';}else if(kind==='angularDim'){d.phase='vertex';}else if(kind==='leader'){d.phase='anchor';}else if(kind==='continuousDim'||kind==='baselineDim'){const base=latestAlignedCadDimension();if(!base){setCommandStatus(t('annotation.dimensionNeedsPrevious'),'error');queueMicrotask(()=>setTool('select','select'));return false;}d.base=modules.cadChangeSet.clone(base);d.phase='endpoint';d.index=1;}state.annotationDraft=d;return true;}
  function handleCadAnnotationPoint(raw){const d=state.annotationDraft;if(!d)return false;const p=nearestSnap(raw);if(d.kind==='text')return commitCadTextAt(p);if(d.kind==='mtext'){openAnnotationTextDialog('mtext',{point:{...p}});return true;}if(d.kind==='leader'){if(d.phase==='anchor'){d.p1={...p};d.phase='textPoint';setCommandStatus(t('annotation.leaderTextPoint'),'strong');render();return true;}openAnnotationTextDialog('leader',{points:[d.p1,{...p}]});return true;}
    if(d.kind==='alignedDim'){if(d.phase==='p1'){d.p1={...p};d.phase='p2';setCommandStatus(t('annotation.dimensionSecond'),'strong');render();return true;}if(d.phase==='p2'){if(distance(d.p1,p)<1e-6)return false;d.p2={...p};d.phase='offset';setCommandStatus(t('annotation.dimensionOffset'),'strong');render();return true;}const dx=d.p2.x-d.p1.x,dy=d.p2.y-d.p1.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len,off=(p.x-d.p1.x)*nx+(p.y-d.p1.y)*ny;return Boolean(createCadDimension({kind:'aligned',p1:{...d.p1},p2:{...d.p2},offset:off},'ALIGNED DIMENSION'));}
    if(d.kind==='radiusDim'||d.kind==='diameterDim'){if(d.phase==='source'){const obj=hitObject(raw);if(!obj||!['cadCircle','cadArc'].includes(obj.type)){setCommandStatus(t('annotation.radialNeedsCurve'),'error');return false;}d.center={...obj.center};d.radius=obj.radius;d.phase='label';setCommandStatus(t('annotation.radialLabelPoint'),'strong');render();return true;}return Boolean(createCadDimension({kind:d.kind==='radiusDim'?'radius':'diameter',center:{...d.center},radius:d.radius,labelPoint:{...p}},d.kind==='radiusDim'?'RADIUS DIMENSION':'DIAMETER DIMENSION'));}
    if(d.kind==='angularDim'){if(d.phase==='vertex'){d.vertex={...p};d.phase='ray1';setCommandStatus(t('annotation.angleRay1'),'strong');render();return true;}if(d.phase==='ray1'){if(distance(d.vertex,p)<1e-6)return false;d.ray1={...p};d.phase='ray2';setCommandStatus(t('annotation.angleRay2'),'strong');render();return true;}if(distance(d.vertex,p)<1e-6)return false;const radius=Math.max(1,Math.min(distance(d.vertex,d.ray1),distance(d.vertex,p))*.72);return Boolean(createCadDimension({kind:'angular',vertex:{...d.vertex},ray1:{...d.ray1},ray2:{...p},radius},'ANGULAR DIMENSION'));}
    if(d.kind==='continuousDim'||d.kind==='baselineDim'){const base=d.base,p1=d.kind==='continuousDim'?base.p2:base.p1;if(distance(p1,p)<1e-6)return false;let offset=Number(base.offset)||0;if(d.kind==='baselineDim')offset+=(offset>=0?250:-250)*Math.max(1,Number(d.index)||1);const created=createCadDimension({kind:'aligned',p1:{...p1},p2:{...p},offset,chainKind:d.kind==='continuousDim'?'continuous':'baseline',chainSourceId:base.id},d.kind==='continuousDim'?'CONTINUE DIMENSION':'BASELINE DIMENSION',{finish:false});if(!created)return false;if(d.kind==='continuousDim')d.base=modules.cadChangeSet.clone(created);else d.index=(Number(d.index)||1)+1;d.phase='endpoint';setCommandStatus(t('annotation.dimensionChainNext'),'strong');return true;}
    return false;}
  function commitCadHatchAt(raw){let obj=hitObject(raw);if(!modules.cadPolyline.is(obj)||!obj.closed){const containing=state.objects.filter(o=>modules.cadPolyline.is(o)&&o.closed&&cadObjectModifiable(o,{notify:false})).map(o=>({o,points:polylineBoundaryPoints(o)})).filter(x=>x.points.length>=3&&pointInPolygon2(raw,x.points)).sort((a,b)=>{const area=pts=>Math.abs(pts.reduce((sum,p,i)=>{const q=pts[(i+1)%pts.length];return sum+p.x*q.y-q.x*p.y;},0))/2;return area(a.points)-area(b.points);});obj=containing[0]?.o||null;}if(!modules.cadPolyline.is(obj)||!obj.closed){setCommandStatus(t('annotation.hatchNeedsClosed'),'error');return false;}if(!cadObjectModifiable(obj,{notify:false}))return false;const points=polylineBoundaryPoints(obj);if(points.length<3)return false;const layer=state.activeCadLayer||'0',h={id:uid('cadHatch'),type:'cadHatch',cadLayer:layer,points,sourceBoundaryId:obj.id,pattern:'ANSI31',angle:45,spacingPx:16,source:'PieniPlan',drawOrder:-10};commitCadChanges('HATCH',[{before:null,after:h,index:state.objects.indexOf(obj)}]);setSelectionIds(new Set([h.id]));state.annotationDraft=null;setTool('select','select');setCommandStatus(t('annotation.hatchCreated'),'strong');updateAll();return true;}
  function updateHatchFromBoundary(hatch){const boundary=state.objects.find(o=>o.id===hatch?.sourceBoundaryId);if(!modules.cadPolyline.is(boundary)||!boundary.closed){setCommandStatus(t('annotation.hatchBoundaryMissing'),'error');return false;}const points=polylineBoundaryPoints(boundary);if(points.length<3)return false;const changed=editCadObject(hatch,{points},'HATCH BOUNDARY');if(changed)setCommandStatus(t('annotation.hatchBoundaryUpdated'),'strong');return changed;}
  function drawCadAnnotationPreview(){const d=state.annotationDraft;if(state.toolset!=='cad'||!d)return;const styles=getComputedStyle(document.documentElement),c=styles.getPropertyValue('--accent').trim();ctx.save();ctx.strokeStyle=c;ctx.fillStyle=c;ctx.setLineDash([5,4]);ctx.lineWidth=1.2;const cursor=state.cursorWorld;
    if(d.kind==='alignedDim'&&d.p1){const a=toScreenCss(d.p1),b=toScreenCss(d.p2||cursor);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    else if(d.kind==='leader'&&d.p1){const a=toScreenCss(d.p1),b=toScreenCss(cursor);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    else if(d.kind==='angularDim'&&d.vertex){const v=toScreenCss(d.vertex),q=toScreenCss(d.ray1||cursor);ctx.beginPath();ctx.moveTo(v.x,v.y);ctx.lineTo(q.x,q.y);if(d.ray1){const z=toScreenCss(cursor);ctx.moveTo(v.x,v.y);ctx.lineTo(z.x,z.y);}ctx.stroke();}
    else if((d.kind==='radiusDim'||d.kind==='diameterDim')&&d.center){const a=toScreenCss(d.center),b=toScreenCss(cursor);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    else if((d.kind==='continuousDim'||d.kind==='baselineDim')&&d.base){const p1=d.kind==='continuousDim'?d.base.p2:d.base.p1,a=toScreenCss(p1),b=toScreenCss(cursor);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    ctx.restore();}
  function drawCadObject(obj, color, width = 1.2) {
    const polyRotating=modules.cadPolyline.is(obj)&&state.cadRotate?.phase==='target'&&state.cadRotate.objectIds.has(obj.id)&&state.cadRotate.base;
    if(!polyRotating&&!objectInViewport(obj))return;const selected=isSelectedId(obj.id),commandSource=obj.id===cadModifySourceId;ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;
    if(cadAppearanceEnabled){const layer=cadLayerStore?.get(cadLayerForObject(obj)),strokeColor=obj.color??layer?.color,lineweight=obj.lineweight??layer?.lineweight,linetype=obj.linetype??layer?.linetype,highlight=selected||commandSource||isSelectionPreviewId(obj.id)||obj.id===state.hoveredObjectId;if(!highlight&&strokeColor){color=strokeColor;ctx.strokeStyle=color;ctx.fillStyle=color;}if(!highlight&&typeof lineweight==='number')ctx.lineWidth=Math.max(.5,lineweight*96/25.4);if(linetype==='DASHED')ctx.setLineDash([8,4]);else if(linetype==='CENTER')ctx.setLineDash([12,3,2,3]);}
    if(modules.cadPolyline.is(obj)){
      const z=state.camera.zoom,rect=viewportLocalBounds();
      let queryRect=rect;if(polyRotating){const points=[{x:rect.minx,y:rect.miny},{x:rect.minx,y:rect.maxy},{x:rect.maxx,y:rect.miny},{x:rect.maxx,y:rect.maxy}].map(p=>rotatePointAround(p,state.cadRotate.base,-cadRotatePreviewDelta()));queryRect={minx:Math.min(...points.map(p=>p.x)),maxx:Math.max(...points.map(p=>p.x)),miny:Math.min(...points.map(p=>p.y)),maxy:Math.max(...points.map(p=>p.y))};}
      ctx.beginPath();for(const e of modules.cadPolyline.candidates(obj,queryRect)){
        if(e.type==='cadLine'){const a=toScreenCss(e.a),b=toScreenCss(e.b);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
        else{const c=toScreenCss(e.center),a=toScreenCss(cadArcPointAt(e,0));ctx.moveTo(a.x,a.y);ctx.arc(c.x,c.y,e.radius*z,-rad(e.startAngle+viewAngle()),-rad(e.startAngle+e.sweep+viewAngle()),e.sweep>=0);}
      }ctx.stroke();if(selected&&obj.vertices.length<=500)drawSelectionHandles(obj,obj.vertices.map(toScreenCss));ctx.restore();return;
    }
    if(obj.type==='cadLine'){const a=toScreenCss(obj.a),b=toScreenCss(obj.b);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();drawSelectionHandles(obj,[a,b]);}
    else if(obj.type==='cadCircle'){const c=toScreenCss(obj.center);ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.5,obj.radius*state.camera.zoom),0,Math.PI*2);ctx.stroke();if(selected)drawSelectionHandles(obj,[c]);}
    else if(obj.type==='cadArc'){const c=toScreenCss(obj.center),start=-rad((obj.startAngle||0)+viewAngle()),end=-rad((obj.startAngle||0)+(obj.sweep||0)+viewAngle());ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.5,obj.radius*state.camera.zoom),start,end,obj.sweep>=0);ctx.stroke();if(selected)drawSelectionHandles(obj,[toScreenCss(cadArcPointAt(obj,0)),toScreenCss(cadArcPointAt(obj,1))]);}
    else if(obj.type==='cadText'){ctx.restore();drawModelText(obj,color,1);return;}
    else if(obj.type==='cadDimension'){ctx.restore();drawCadDimensionObject(obj,color);return;}
    else if(obj.type==='cadHatch'){ctx.restore();drawCadHatchObject(obj,color);return;}
    else if(obj.type==='cadLeader'){ctx.restore();drawCadLeaderObject(obj,color);return;}ctx.restore();
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
    for (const other of planGeometryIndex().walls) {
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
    for (const o of planGeometryIndex().openings) {
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
    if(obj.wallId){const wall=planGeometryIndex().wallsById.get(obj.wallId);if(wall){const p1=wallPointAt(wall,Number.isFinite(obj.t1)?obj.t1:0),p2=wallPointAt(wall,Number.isFinite(obj.t2)?obj.t2:1),v={x:p2.x-p1.x,y:p2.y-p1.y};const len=Math.max(.000001,Math.hypot(v.x,v.y)),nx=-v.y/len,ny=v.x/len,off=Number(obj.offset)||0;return{p1,p2,d1:{x:p1.x+nx*off,y:p1.y+ny*off},d2:{x:p2.x+nx*off,y:p2.y+ny*off},nx,ny,len,offset:off,associated:true,wall};}}
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

  function signedAngleDeltaRad(from,to){let d=(to-from)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;}
  function hingedLeafGeometry(obj,g,t0=0,t1=1,{hinge=null,swingSide=null}={}){
    const pA=t0===0?g.p1:wallPointAt(g.wall,g.t1+(g.t2-g.t1)*t0),pB=t1===1?g.p2:wallPointAt(g.wall,g.t1+(g.t2-g.t1)*t1),hingeEnd=(hinge||obj.hinge)==='end',hp=hingeEnd?pB:pA,other=hingeEnd?pA:pB,width=Math.max(1,distance(hp,other)),closed={x:(other.x-hp.x)/width,y:(other.y-hp.y)/width},side=swingSide??doorSwingSide(obj),open={x:g.nx*side,y:g.ny*side},leafEnd={x:hp.x+open.x*width,y:hp.y+open.y*width},a0=Math.atan2(closed.y,closed.x),a1=Math.atan2(open.y,open.x),delta=signedAngleDeltaRad(a0,a1);return{hinge:hp,other,width,closed,open,leafEnd,a0,a1,delta,side};
  }
  function doorGeometry(obj) {const g=openingGeometry(obj);if(!g)return null;return {...g,...hingedLeafGeometry(obj,g)};}
  function doubleLeafSplit(obj){return clamp(Number.isFinite(Number(obj?.firstLeafRatio))?Number(obj.firstLeafRatio):.5,.1,.9);}
  function doorSwingSectors(obj){const g=openingGeometry(obj);if(!g||!isHingedDoorType(obj.doorType))return[];const type=obj.doorType||'hingedSingle',sides=isDoubleActingDoorType(type)?[doorSwingSide(obj),-doorSwingSide(obj)]:[doorSwingSide(obj)],split=doubleLeafSplit(obj),leaves=isDoubleLeafDoorType(type)?[[0,split,'start'],[split,1,'end']]:[[0,1,obj.hinge||'start']],out=[];for(const [t0,t1,hinge] of leaves)for(const side of sides)out.push(hingedLeafGeometry(obj,g,t0,t1,{hinge,swingSide:side}));return out;}
  function pointInDoorSwingSector(p,s){const dx=p.x-s.hinge.x,dy=p.y-s.hinge.y,r=Math.hypot(dx,dy);if(r>s.width+1e-6)return false;const a=Math.atan2(dy,dx),rel=signedAngleDeltaRad(s.a0,a);return s.delta>=0?rel>=-1e-7&&rel<=s.delta+1e-7:rel<=1e-7&&rel>=s.delta-1e-7;}

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
    const appearance=planLineAppearance(),unified=obj.planRole==='boundary';ctx.save();ctx.strokeStyle=unified&&!selected&&!preview&&!hovered?appearance.color:stroke;ctx.lineWidth=selected?3:preview||hovered?2.6:unified?appearance.width:2.2;ctx.lineCap='round';ctx.lineJoin='round';
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
    const wall=planGeometryIndex().wallsById.get(obj.wallId);if(!wall)return null;
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
      if(type==='hingedSingle'||type==='fireDoor')drawHingedLeaf(obj,g,stroke,0,1,{hinge:obj.hinge||'start'});
      else if(type==='fireShutter'){
        const off=Math.max(24,(g.wall.thickness||150)*.24);ctx.save();ctx.setLineDash([5,3]);for(const sign of[-1,1])drawWorldLine({x:g.p1.x+g.nx*off*sign,y:g.p1.y+g.ny*off*sign},{x:g.p2.x+g.nx*off*sign,y:g.p2.y+g.ny*off*sign},1.7);ctx.setLineDash([]);const c=toScreenCss(g.center);ctx.font='bold 10px system-ui';ctx.fillStyle=stroke;ctx.fillText('FS',c.x+6,c.y-6);ctx.restore();
      }
      else if(type==='hingedDouble'){drawHingedLeaf(obj,g,stroke,0,doubleLeafSplit(obj),{hinge:'start'});drawHingedLeaf(obj,g,stroke,doubleLeafSplit(obj),1,{hinge:'end'});}
      else if(type==='doubleActingSingle'){drawHingedLeaf(obj,g,stroke,0,1,{hinge:obj.hinge||'start'});drawHingedLeaf(obj,g,stroke,0,1,{hinge:obj.hinge||'start',swingSide:-doorSwingSide(obj),alpha:.42});}
      else if(type==='doubleActingDouble'){for(const side of[doorSwingSide(obj),-doorSwingSide(obj)]){drawHingedLeaf(obj,g,stroke,0,doubleLeafSplit(obj),{hinge:'start',swingSide:side,alpha:side===doorSwingSide(obj)?1:.42});drawHingedLeaf(obj,g,stroke,doubleLeafSplit(obj),1,{hinge:'end',swingSide:side,alpha:side===doorSwingSide(obj)?1:.42});}}
      else if(type==='fireShutter'){const tg=wallTangentAt(g.wall,obj.t??.5),off=Math.max(24,(g.wall.thickness||150)*.24);for(const sign of[-1,1])out+=dxfLine(layer,{x:g.p1.x-g.nx*off*sign,y:g.p1.y-g.ny*off*sign},{x:g.p2.x-g.nx*off*sign,y:g.p2.y-g.ny*off*sign});}
    else if(type==='slidingSingle'||type==='pocket'){
        const off=(type==='pocket'?0.22:0.72)*wallHalf*dir,panelLen=g.width*.82,shift=dir*g.width*.34,center=wallPointAt(g.wall,clamp((obj.t??.5)+shift/Math.max(wallLength(g.wall),1),0,1)),tg=wallTangentAt(g.wall,obj.t??.5),a={x:center.x-tg.ux*panelLen/2+g.nx*off,y:center.y-tg.uy*panelLen/2+g.ny*off},b={x:center.x+tg.ux*panelLen/2+g.nx*off,y:center.y+tg.uy*panelLen/2+g.ny*off};drawWorldLine(a,b,2);if(type==='pocket'){ctx.setLineDash([4,3]);drawWorldLine(g.p1,g.p2,1);ctx.setLineDash([]);}
      }else if(type==='slidingDouble'){
        const off=.68*wallHalf*dir,tg=wallTangentAt(g.wall,obj.t??.5),half=g.width*.45;for(const sign of[-1,1]){const c={x:g.center.x+tg.ux*sign*g.width*.22+g.nx*off,y:g.center.y+tg.uy*sign*g.width*.22+g.ny*off};drawWorldLine({x:c.x-tg.ux*half/2,y:c.y-tg.uy*half/2},{x:c.x+tg.ux*half/2,y:c.y+tg.uy*half/2},2);}}
      if(type==='fireDoor'){const c=toScreenCss(g.center);ctx.font='bold 10px system-ui';ctx.fillStyle=stroke;ctx.fillText('FD',c.x+6,c.y-6);}
    }else for(const off of[-wallHalf*.34,0,wallHalf*.34])drawWorldLine({x:g.p1.x+g.nx*off,y:g.p1.y+g.ny*off},{x:g.p2.x+g.nx*off,y:g.p2.y+g.ny*off},1.4);
    if(selected)drawOpeningHandles(obj,g);ctx.restore();
  }
  function drawWorldLine(a,b,width=1.5){const sa=toScreenCss(a),sb=toScreenCss(b);ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(sa.x,sa.y);ctx.lineTo(sb.x,sb.y);ctx.stroke();}
  function drawHingedLeaf(obj,g,color,t0=0,t1=1,{hinge=null,swingSide=null,alpha=1}={}){
    const spec=hingedLeafGeometry(obj,g,t0,t1,{hinge,swingSide});ctx.save();ctx.globalAlpha=alpha;drawWorldLine(spec.hinge,spec.leafEnd,2);ctx.globalAlpha=alpha*.62;ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<=16;i++){const a=spec.a0+spec.delta*i/16,p=toScreenCss({x:spec.hinge.x+Math.cos(a)*spec.width,y:spec.hinge.y+Math.sin(a)*spec.width});if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();ctx.restore();
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

  function drawPolylinePreview(){
    const p=state.polylinePreview;if(state.activeTool!=='polyline'||state.toolset!=='cad'||!p)return false;
    const styles=getComputedStyle(document.documentElement),color=styles.getPropertyValue('--accent').trim()||'#58A6FF';
    const points=Array.isArray(p.points)?p.points:[];
    ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.5;ctx.globalAlpha=.78;ctx.setLineDash([6,4]);
    const drawEdge=(a,b,bulge=0)=>{if(!a||!b||distance(a,b)<1e-9)return;const edge=modules.cadPolyline.deriveEdge(a,b,bulge);if(edge.type==='cadLine'){const sa=toScreenCss(edge.a),sb=toScreenCss(edge.b);ctx.beginPath();ctx.moveTo(sa.x,sa.y);ctx.lineTo(sb.x,sb.y);ctx.stroke();}else{const c=toScreenCss(edge.center),start=-rad(edge.startAngle+viewAngle()),end=-rad(edge.startAngle+edge.sweep+viewAngle());ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.5,edge.radius*state.camera.zoom),start,end,edge.sweep>=0);ctx.stroke();}};
    for(let i=0;i<points.length-1;i++)drawEdge(points[i],points[i+1],Number(points[i].bulge)||0);
    const last=points.at(-1),pointer=p.pointer;
    if(last&&pointer){
      if(p.mode==='arc'&&p.arcEnd){const g=circleFromThreePoints(last,p.arcEnd,pointer);if(g){const c=toScreenCss(g.center),start=-rad(g.startAngle+viewAngle()),end=-rad(g.startAngle+g.sweep+viewAngle());ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.5,g.radius*state.camera.zoom),start,end,g.sweep>=0);ctx.stroke();}}
      else drawEdge(last,pointer,0);
    }
    ctx.setLineDash([]);ctx.globalAlpha=.95;for(const q of points){const sp=toScreenCss(q);ctx.beginPath();ctx.rect(sp.x-2.5,sp.y-2.5,5,5);ctx.fill();}
    if(p.arcEnd){const sp=toScreenCss(p.arcEnd);ctx.beginPath();ctx.arc(sp.x,sp.y,3.5,0,Math.PI*2);ctx.fill();}
    ctx.restore();return true;
  }

  function drawCadPrimitivePreview(){
    const p=state.cadPrimitivePreview;if(state.toolset!=='cad'||!p)return false;const color=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.5;ctx.globalAlpha=.78;ctx.setLineDash([6,4]);const mark=q=>{if(!q)return;const s=toScreenCss(q);ctx.fillRect(s.x-2.5,s.y-2.5,5,5);};
    if(p.kind==='rectangle'&&p.first&&p.pointer){const a=toScreenCss(p.first),b=toScreenCss(p.pointer);ctx.strokeRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(b.x-a.x),Math.abs(b.y-a.y));mark(p.first);mark(p.pointer);}
    else if(p.kind==='circle'&&p.center&&p.pointer){const c=toScreenCss(p.center),r=distance(p.center,p.pointer)*state.camera.zoom;if(r>0){ctx.beginPath();ctx.arc(c.x,c.y,r,0,Math.PI*2);ctx.stroke();}mark(p.center);mark(p.pointer);}
    else if(p.kind==='arc'&&p.start){mark(p.start);mark(p.through);mark(p.pointer);if(p.through&&p.pointer){const g=circleFromThreePoints(p.start,p.pointer,p.through);if(g){const c=toScreenCss(g.center);ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.5,g.radius*state.camera.zoom),-rad(g.startAngle+viewAngle()),-rad(g.startAngle+g.sweep+viewAngle()),g.sweep>=0);ctx.stroke();}}else if(p.pointer){const a=toScreenCss(p.start),b=toScreenCss(p.pointer);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
    ctx.restore();return true;
  }
  function drawPreview() {
    if(drawPolylinePreview())return;
    if(drawCadPrimitivePreview())return;
    if(state.activeTool==='component'&&state.previewEnd){const asset=componentLibrary.get(state.activeComponentAssetId);if(asset){const color=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();ctx.save();ctx.globalAlpha=.65;drawComponentObject({id:'__component_preview__',type:'component',assetId:asset.id,point:{...state.previewEnd},rotation:0,mirrorX:false,mirrorY:false,scaleX:1,scaleY:1},color,1.5);ctx.restore();}return;}
    let start=null,end=null,color=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),width=1.5;
    if(state.activeTool==='line'||state.activeTool==='wall'){start=state.drawStart;end=state.previewEnd;if(state.activeTool==='wall')width=state.toolset==='plan'?2:Math.max(2,currentWallThickness()*state.camera.zoom);}else if(state.activeTool==='measure'){start=state.measureStart;end=state.previewEnd;color=getComputedStyle(document.documentElement).getPropertyValue('--dimension').trim();}
    if(!start||!end)return;if(state.activeTool==='measure'){drawDimension({p1:start,p2:end,offset:Math.max(250,Math.min(600,distance(start,end)*.08))},color);return;}
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=state.toolset==='plan'&&['line','wall'].includes(state.activeTool)?planLineAppearance().width:width;ctx.setLineDash(state.toolset==='plan'&&['line','wall'].includes(state.activeTool)?planDisplayDash(state.toolSettings.planDisplayStyle||'solid'):[]);ctx.globalAlpha=.72;ctx.lineCap='butt';
    if(state.activeTool==='wall'&&state.toolSettings.wallType==='arc'&&state.arcDraft?.a&&state.arcDraft?.b){const g=circleFromThreePoints(state.arcDraft.a,state.arcDraft.b,end);if(g){const tmp={...g,a:state.arcDraft.a,b:state.arcDraft.b,geometry:'arc'};const steps=Math.max(8,Math.ceil(Math.abs(g.sweep)/6));ctx.beginPath();for(let i=0;i<=steps;i++){const p=toScreenCss(wallPointAt(tmp,i/steps));if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();const bp=toScreenCss(end);ctx.font='11px system-ui';ctx.fillStyle=color;ctx.fillText(`R ${formatNumber(g.radius,1)} mm · ${formatNumber(wallLength(tmp),1)} mm`,bp.x+8,bp.y-8);ctx.restore();return;}}
    const a=toScreenCss(start),b=toScreenCss(end);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.font='11px system-ui';ctx.fillStyle=color;ctx.fillText(`${formatNumber(distance(start,end),1)} mm · ${formatNumber(angleDeg(start,end),1)}°`,b.x+8,b.y-8);ctx.restore();
  }
  function drawOpeningPreview() {
    const p=state.previewOpening;if(!p||!['door','window'].includes(state.activeTool))return;const temp={id:'preview',type:state.activeTool,wallId:p.wall.id,t:p.t,width:currentOpeningWidth(),hinge:'start',swing:1,doorType:state.toolSettings.doorType||'hingedSingle',slideDirection:1};const styles=getComputedStyle(document.documentElement),color=state.activeTool==='door'?styles.getPropertyValue('--door').trim():styles.getPropertyValue('--window').trim();ctx.save();ctx.globalAlpha=.65;drawOpeningPlan(temp,state.activeTool,color);ctx.restore();
  }

  function drawCadOperationPreview(){
    if(state.toolset!=='cad'||!cadOperationPreview)return;if(!cadContextTokenCurrent(cadOperationPreview.token)){cadOperationPreview=null;return;}
    const styles=getComputedStyle(document.documentElement);ctx.save();ctx.globalAlpha=.7;ctx.setLineDash([6,4]);
    for(const o of cadOperationPreview.after||[])drawCadObject({...o,id:'__cad_preview__',color:styles.getPropertyValue('--accent').trim(),linetype:'CONTINUOUS',lineweight:null},styles.getPropertyValue('--accent').trim(),2);
    for(const o of cadOperationPreview.removed||[])drawCadObject({...o,id:'__cad_preview__',color:styles.getPropertyValue('--danger').trim()},styles.getPropertyValue('--danger').trim(),4);
    ctx.restore();
  }
  function materializeCadPolylineIds(obj,ownerId){const copy=modules.cadChangeSet.clone(obj);copy.id=ownerId;for(const v of copy.vertices||[]){if(/^__(?:break|offset|fillet|chamfer|topology|vertexedit)_new_cadVertex_/.test(String(v.id)))v.id=uid('cadVertex');if(v.outgoing&&/^__(?:break|offset|fillet|chamfer|topology|vertexedit)_new_cadEdge_/.test(String(v.outgoing.id)))v.outgoing.id=uid('cadEdge');}return modules.cadPolyline.validate(copy);}
  function commitCadOperation(label,plan){
    if(!plan?.after)return false;const originals=new Map((plan.before||[]).map(o=>[o.id,o])),used=new Set(),changes=[];
    for(const o of plan.after){const before=originals.get(o.id),keep=before&&!used.has(o.id);if(keep)used.add(o.id);const ownerId=keep?o.id:uid(o.type),after=modules.cadPolyline.is(o)?materializeCadPolylineIds(o,ownerId):{...o,id:ownerId};changes.push({before:keep?before:null,after,index:keep?state.objects.indexOf(before):state.objects.length+changes.filter(c=>!c.before).length});}
    for(const o of originals.values())if(!used.has(o.id))changes.push({before:o,after:null,index:state.objects.indexOf(o)});
    const changed=commitCadChanges(label,changes);if(changed&&plan.topology==='cadPolyline'){setSelectionIds(new Set(changes.filter(c=>c.after).map(c=>c.after.id)));}
    return changed;
  }
  function freshenCadObjectIds(obj){
    const copy=modules.cadChangeSet.clone(obj);copy.id=uid(copy.type||'cadObject');
    if(modules.cadPolyline.is(copy)){copy.id=uid('cadPolyline');copy.vertices=copy.vertices.map(v=>({id:uid('cadVertex'),x:v.x,y:v.y,...(v.outgoing?{outgoing:{id:uid('cadEdge'),bulge:v.outgoing.bulge}}:{})}));modules.cadPolyline.validate(copy);}
    if(copy.type==='cadHatch')copy.sourceBoundaryId=null;return copy;
  }
  function cadTransformSelectedObjects(ids){return [...ids].map(id=>cadContext?.getById(id)||state.objects.find(o=>o.id===id)).filter(o=>o&&cadSourceKind(o)==='cad-source'&&cadPolicy(o.id,'modify').allowed&&modules.cadTransformOperations.supports(o));}
  function planCadMatrix(ids,matrix,{copy=false}={}){if(!modules.cadTransformOperations.validMatrix(matrix))return null;const before=cadTransformSelectedObjects(ids);if(!before.length)return null;const after=before.map(o=>modules.cadTransformOperations.transform(modules.cadChangeSet.clone(o),matrix)).filter(Boolean);if(after.length!==before.length)return null;return{kind:copy?'COPY':'TRANSFORM',before,after,copy:Boolean(copy),matrix};}
  function planCadArray(ids,{columns=1,rows=1,dx=0,dy=0}={}){columns=Math.max(1,Math.round(columns));rows=Math.max(1,Math.round(rows));if(columns*rows<=1||!Number.isFinite(dx)||!Number.isFinite(dy)||(columns>1&&Math.abs(dx)<1e-9)||(rows>1&&Math.abs(dy)<1e-9))return null;const sources=cadTransformSelectedObjects(ids);if(!sources.length)return null;const after=[];for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){if(r===0&&c===0)continue;const m=modules.cadTransformOperations.translate(c*dx,r*dy);for(const o of sources){const q=modules.cadTransformOperations.transform(modules.cadChangeSet.clone(o),m);if(q)after.push(q);}}return after.length?{kind:'ARRAY',before:sources,after,copy:true,array:{columns,rows,dx,dy}}:null;}
  function planCadPolarArray(ids,{center=null,items=2,angle=360}={}){items=Math.max(2,Math.round(items));angle=Number(angle);if(!modules.commandFoundation.finitePoint(center)||!Number.isFinite(angle)||Math.abs(angle)<1e-9)return null;const sources=cadTransformSelectedObjects(ids);if(!sources.length)return null;const full=Math.abs(angle)>=360-1e-7,step=full?angle/items:angle/(items-1),after=[];for(let i=1;i<items;i++){const m=modules.cadTransformOperations.rotate(center,step*i);for(const o of sources){const q=modules.cadTransformOperations.transform(modules.cadChangeSet.clone(o),m);if(q)after.push(q);}}return after.length?{kind:'ARRAY',before:sources,after,copy:true,array:{type:'polar',center:{...center},items,angle}}:null;}
  const cadPointInRect=(p,r)=>Boolean(p&&r&&p.x>=r.minx&&p.x<=r.maxx&&p.y>=r.miny&&p.y<=r.maxy);
  function cadStretchControlPoints(o){if(modules.cadPolyline.is(o))return o.vertices.map(v=>({x:v.x,y:v.y}));if(o.type==='cadLine')return[o.a,o.b];if(o.type==='cadCircle'||o.type==='cadArc')return[o.center];if(o.type==='cadText')return[o.point];if(o.type==='cadDimension'){const k=o.kind||'aligned';if(k==='aligned')return[o.p1,o.p2].filter(Boolean);if(k==='radius'||k==='diameter')return[o.center,o.labelPoint].filter(Boolean);if(k==='angular')return[o.vertex,o.ray1,o.ray2].filter(Boolean);}if(o.type==='cadHatch'||o.type==='cadLeader')return o.points||[];return[];}
  function cadStretchCandidates(rect){return cadWorkObjects().filter(o=>cadSourceKind(o)==='cad-source'&&cadPolicy(o.id,'modify').allowed&&modules.cadTransformOperations.supports(o)&&cadStretchControlPoints(o).some(p=>cadPointInRect(p,rect))).map(o=>o.id);}
  function cadStretchObject(o,rect,delta){const out=modules.cadChangeSet.clone(o),move=p=>cadPointInRect(p,rect)?{x:p.x+delta.x,y:p.y+delta.y}:{...p};
    if(modules.cadPolyline.is(out)){let changed=false;out.vertices=out.vertices.map(v=>{if(!cadPointInRect(v,rect))return{...v,...(v.outgoing?{outgoing:{...v.outgoing}}:{})};changed=true;return{...v,x:v.x+delta.x,y:v.y+delta.y,...(v.outgoing?{outgoing:{...v.outgoing}}:{})};});if(!changed)return null;try{return modules.cadPolyline.validate(out);}catch(_){return null;}}
    if(out.type==='cadLine'){const a=move(out.a),b=move(out.b);if(distance(a,out.a)<1e-12&&distance(b,out.b)<1e-12||distance(a,b)<1e-8)return null;out.a=a;out.b=b;return out;}
    if(out.type==='cadCircle'||out.type==='cadArc'){if(!cadPointInRect(out.center,rect))return null;out.center={x:out.center.x+delta.x,y:out.center.y+delta.y};return out;}
    if(out.type==='cadText'){if(!cadPointInRect(out.point,rect))return null;out.point={x:out.point.x+delta.x,y:out.point.y+delta.y};return out;}
    if(out.type==='cadDimension'){const kind=out.kind||'aligned';if(kind==='aligned'){const a=move(out.p1),b=move(out.p2);if(distance(a,out.p1)<1e-12&&distance(b,out.p2)<1e-12||distance(a,b)<1e-8)return null;out.p1=a;out.p2=b;}else{const pts=cadStretchControlPoints(out);if(!pts.length||!pts.every(p=>cadPointInRect(p,rect)))return null;const matrix=modules.cadTransformOperations.translate(delta.x,delta.y),moved=modules.cadTransformOperations.transform(out,matrix);if(!moved)return null;return moved;}out.segments=annotationDimensionSegments(out);return out;}
    if(out.type==='cadHatch'||out.type==='cadLeader'){let changed=false;out.points=(out.points||[]).map(p=>{if(!cadPointInRect(p,rect))return{...p};changed=true;return{x:p.x+delta.x,y:p.y+delta.y};});if(!changed)return null;if(out.type==='cadHatch')out.sourceBoundaryId=null;return out;}return null;
  }
  function planCadStretch(rect,delta){if(!rect||!delta||!Number.isFinite(delta.x)||!Number.isFinite(delta.y)||(Math.abs(delta.x)<1e-12&&Math.abs(delta.y)<1e-12))return null;const before=cadTransformSelectedObjects(new Set(cadStretchCandidates(rect))),after=[];const kept=[];for(const o of before){const q=cadStretchObject(o,rect,delta);if(q){kept.push(o);after.push(q);}}return after.length?{kind:'STRETCH',before:kept,after,copy:false,rect,delta}:null;}
  function commitCadTransformPlan(label,plan){if(!plan?.after?.length)return false;const changes=[],resultIds=[];
    if(plan.copy){for(const candidate of plan.after){const after=freshenCadObjectIds(candidate);changes.push({before:null,after,index:state.objects.length+changes.length});resultIds.push(after.id);}}
    else{for(let i=0;i<plan.after.length;i++){const before=plan.before[i],after=plan.after[i];changes.push({before,after,index:state.objects.indexOf(before)});resultIds.push(after.id);}}
    const changed=commitCadChanges(label,changes);if(changed){setSelectionIds(new Set(resultIds));recordEdit('cad-transform',{command:label,count:resultIds.length,copy:Boolean(plan.copy)});updateAll();}return changed;
  }
  let connectedCadCache=null;
  function selectCadConnected(seedId=state.selectedObjectId){
    if(state.toolset!=='cad'||state.activeTool!=='select')return false;
    const seed=cadContext?.getById(seedId);if(!seed||!cadSourceObject(seed)||!cadPolicy(seedId,'select').allowed)return false;
    const revision=state.cadRenderRevision||0;if(!connectedCadCache||connectedCadCache.source!==state.objects||connectedCadCache.revision!==revision)connectedCadCache={source:state.objects,revision,index:modules.connectedSelection.create(state.objects.filter(cadSourceObject))};
    const result=connectedCadCache.index.connected([seedId],o=>cadPolicy(o.id,'select').allowed&&cadObjectInWorkScope(o));
    if(!result.ids.length)return false;applySelectionSet(result.ids,'replace');setCommandStatus(t('selection.connectedResult',{count:result.ids.length}),'strong');renderProperties();render();return result;
  }
  function selectCadPrevious(){const ids=[...(state.previousCadSelectionIds||[])].filter(id=>cadContext?.getById(id)&&cadPolicy(id,'select').allowed);if(!ids.length)return false;setSelectionIds(new Set(ids));updateAll();return true;}
  function selectCadLast(){const id=state.lastCadObjectId,obj=id&&(cadContext?.getById(id)||state.objects.find(o=>o.id===id));if(!obj||!cadPolicy(id,'select').allowed)return false;setSelectionIds(new Set([id]));updateAll();return true;}
  function selectCadSimilar(){const exemplar=[...selectionIds()].map(id=>cadContext?.getById(id)||state.objects.find(o=>o.id===id)).find(o=>o&&cadSourceKind(o)==='cad-source');if(!exemplar)return false;const layer=cadLayerForObject(exemplar),type=exemplar.type,ids=cadWorkObjects().filter(o=>cadSourceKind(o)==='cad-source'&&cadPolicy(o.id,'select').allowed&&o.type===type&&cadLayerForObject(o)===layer).map(o=>o.id);if(!ids.length)return false;setSelectionIds(new Set(ids));updateAll();return true;}

  function cadModifyPreviewCurrent(p){
    return Boolean(p&&state.toolset==='cad'&&cadContextTokenCurrent(p.token)&&p.previewTool===state.activeTool&&p.previewCommand===state.activeCommand&&p.previewFloorId===state.activeFloorId&&cadContext.getById(p.targetId)===p.before&&cadPolicy(p.targetId,'modify').allowed);
  }
  function drawTrimPreview(){
    if(state.toolset==='cad'&&state.trimPreview&&!cadModifyPreviewCurrent(state.trimPreview)){state.trimPreview=null;return;}
    const p=state.trimPreview;if(!p||!(state.toolset==='cad'?['trim','extend'].includes(state.activeTool):['trim','extend'].includes(state.activeTool)))return;
    const styles=getComputedStyle(document.documentElement),danger=p.kind==='extend'?(styles.getPropertyValue('--accent').trim()||'#58A6FF'):(styles.getPropertyValue('--danger').trim()||'#F85149');
    ctx.save();ctx.strokeStyle=danger;ctx.fillStyle=danger;ctx.globalAlpha=.82;ctx.lineCap='round';ctx.lineWidth=p.kind==='extend'?2:5;if(p.kind==='extend')ctx.setLineDash([6,4]);
    if(Array.isArray(p.previewGeometry)&&p.previewGeometry.length){for(const g of p.previewGeometry)drawCadObject({...g,id:'__cad_extend_preview__',cadLayer:cadLayerForObject(p.before)},danger,2);}
    else{const a=toScreenCss(p.a),b=toScreenCss(p.b);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    ctx.globalAlpha=.95;ctx.lineWidth=1.5;for(const q of p.cuts||[]){const sp=toScreenCss(q);ctx.beginPath();ctx.arc(sp.x,sp.y,4,0,Math.PI*2);ctx.fill();}
    if(p.kind==='extend'&&p.a&&p.b){const label=toScreenCss(p.b);ctx.setLineDash([]);ctx.font='11px system-ui';ctx.fillText(formatNumber(distance(p.a,p.b),1)+' mm',label.x+10,label.y+14);}
    ctx.restore();
  }

  function drawCalibrationPreview(){const c=state.calibration;if(!c?.p1)return;const p2=c.p2||state.previewEnd;if(!p2)return;const a=toScreenCss(c.p1),b=toScreenCss(p2);ctx.save();ctx.strokeStyle='#ffb55a';ctx.fillStyle='#ffb55a';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);for(const p of[a,b]){ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();}ctx.restore();}

  function applyNumericLabelEdit(label,value){if(!label||!Number.isFinite(value))return;const obj=state.objects.find(o=>o.id===label.objectId);if(!obj)return;if(label.kind==='openingWidth'&&(obj.type==='door'||obj.type==='window')){if(value<=0)return;pushHistory();obj.width=value;markDirty(true);rebuildObjectSnapIndex();updateAll();return;}if(label.kind==='wallLength'&&obj.type==='wall'){if(isArcWall(obj)){if(value<=0)return;pushHistory();const sweepRad=Math.max(.000001,Math.abs(rad(obj.sweep))),r=value/sweepRad;obj.radius=r;obj.a=wallPointAt({...obj,radius:r},0);obj.b=wallPointAt({...obj,radius:r},1);markDirty(true);rebuildObjectSnapIndex();refreshSpaces();updateAll();return;}setWallLengthConstraintFromInput(obj,value);return;}if(label.kind==='wallRadius'&&obj.type==='wall'&&isArcWall(obj)){if(value<=0)return;pushHistory();obj.radius=value;obj.a=wallPointAt({...obj,radius:value},0);obj.b=wallPointAt({...obj,radius:value},1);markDirty(true);rebuildObjectSnapIndex();refreshSpaces();updateAll();return;}if(label.kind==='wallAngle'&&obj.type==='wall'){setWallAngleConstraintFromInput(obj,value);return;}if(label.kind==='dimensionLength'&&obj.type==='dimension'){const g=dimensionGeometry(obj);if(!g?.associated||value<=0)return;const span=Math.abs((obj.t2??1)-(obj.t1??0));if(span<1e-6)return;setWallLengthConstraintFromInput(g.wall,value/span);}}
  function beginCanvasNumberEdit(label){host.querySelector('.canvas-number-editor')?.remove();const input=document.createElement('input');input.className='canvas-number-editor';input.type='number';input.step='0.01';input.value=String(Math.round(Number(label.value)*100)/100);input.style.left=`${Math.max(4,label.rect.x)}px`;input.style.top=`${Math.max(4,label.rect.y-5)}px`;input.style.width=`${Math.max(92,label.rect.w+24)}px`;let cancelled=false,committed=false;const commit=()=>{if(committed||cancelled)return;committed=true;const value=Number(input.value);input.remove();applyNumericLabelEdit(label,value);};input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}else if(e.key==='Escape'){e.preventDefault();cancelled=true;input.remove();host.focus();}});input.addEventListener('blur',commit);host.appendChild(input);input.focus();input.select();}
  function onCanvasDoubleClick(e){if(featureFill?.selection.current)return;if(isCompactViewer())return;const s=fromPointerEvent(e),label=hitEditableLabel(s);if(label){e.preventDefault();e.stopPropagation();beginCanvasNumberEdit(label);return;}if(state.toolset!=='cad'||state.activeTool!=='select'||selectionIds().size!==1)return;const obj=cadContext?.getById(state.selectedObjectId)||state.objects.find(o=>o.id===state.selectedObjectId);if(!modules.cadPolyline.is(obj)||obj.vertices.length>500||!cadObjectModifiable(obj,{notify:false}))return;const raw=screenCssToWorld(s),hit=modules.cadPolyline.nearest(obj,raw),tol=modules.geometryQuery.tolerance.world(10,state.camera.zoom);if(!hit||hit.distance>tol)return;e.preventDefault();e.stopPropagation();insertCadPolylineVertexAt(obj,hit.point);}

  function currentWallThickness(){const input=document.querySelector('[data-context="thickness"]');const n=Number(input?.value);if(Number.isFinite(n)&&n>0)state.toolSettings.wallThickness=n;return state.toolSettings.wallThickness;}
  function currentOpeningWidth(){const input=document.querySelector('[data-context="width"]');const n=Number(input?.value);const key=state.activeTool==='window'?'windowWidth':'doorWidth';if(Number.isFinite(n)&&n>0)state.toolSettings[key]=n;return state.toolSettings[key];}

  function dispatchActiveCadCommandAction(value){if(state.toolset!=='cad'||!cadCommandSession?.activeId)return false;const result=reportCadCommand(cadCommands().dispatch({type:'keyword',value}));if(result?.ok&&String(result.code||'').startsWith('committed')){state.polylinePreview=null;setTool('select','select');setCommandStatus(t('command.finished'),'strong');return result;}updateContextBar();render();return result;}

  function updateContextBar(){
    const contextTools=new Set(['line','polyline','wall','door','window','constraint','space','move','copy','rotate','mirror','scale','stretch','array','align','break','offset','fillet','chamfer','reconstruct']);const shouldShow=Boolean(state.calibration)||contextTools.has(state.activeTool);
    dom.contextBar.hidden=!shouldShow;
    if(!shouldShow){dom.contextFields.innerHTML='';return;}
    const keys={select:'context.select',constraint:'context.constraint',line:'context.line',polyline:'tool.polyline',wall:'context.wall',door:'context.door',window:'context.window',space:'context.space',region:'context.region',measure:'context.measure',trim:'tool.trim',extend:'tool.extend',delete:'context.delete',move:'tool.move',copy:'tool.copy',rotate:'tool.rotate',mirror:'tool.mirror',scale:'tool.scale',stretch:'tool.stretch',array:'tool.array',align:'tool.align',break:'tool.break',join:'tool.join',offset:'tool.offset',fillet:'tool.fillet',chamfer:'tool.chamfer',reconstruct:'tool.curveReconstruct'};
    dom.contextToolName.textContent=state.activeTool==='constraint'&&state.constraintMode?`${t('context.constraint')} · ${constraintModeLabel(state.constraintMode)}`:(state.toolset==='plan'&&state.activeTool==='wall'?t('tool.arcLine'):t(keys[state.activeTool]||`tool.${state.activeTool}`));
    const contextTitleWrap=dom.contextToolName.closest('.context-title-wrap');const showContextTitle=Boolean(state.calibration)||state.activeTool==='constraint';if(contextTitleWrap)contextTitleWrap.hidden=!showContextTitle;
    dom.contextFields.innerHTML='';
    let hint=t('hint.select');
    if(state.calibration){dom.contextToolName.textContent=t('context.calibration');dom.contextHint.textContent=state.calibration.p1?t('hint.calibrationSecond'):t('hint.calibrationFirst');return;}
    if(state.activeTool==='line'||state.activeTool==='wall'){
      dom.contextFields.appendChild(contextNumberField(t('context.length'),'length','','mm'));
      dom.contextFields.appendChild(contextNumberField(t('context.angle'),'angle','','°'));
      if(state.activeTool==='wall'&&state.toolset==='cad')dom.contextFields.appendChild(contextNumberField(t('context.thickness'),'thickness',String(state.toolSettings.wallThickness),'mm'));
      if(state.toolset==='plan'){const select=document.createElement('select');select.className='select-input plan-display-style-select';select.setAttribute('aria-label',t('plan.lineStyle'));for(const value of ['solid','dashed','dotted','dashdot']){const opt=document.createElement('option');opt.value=value;opt.textContent=t('plan.stroke.'+value);select.append(opt);}select.value=state.toolSettings.planDisplayStyle||'solid';select.addEventListener('change',()=>{state.toolSettings.planDisplayStyle=select.value;state.toolSettings.planDisplayMode=select.value!=='solid';updateContextBar();render();});dom.contextFields.append(select);}
      hint=(state.activeTool==='wall'&&state.toolSettings.wallType==='arc'&&state.arcDraft)?t('hint.arcWallCurve'):(state.drawStart?t('hint.segmentEnd'):t('hint.segmentStart'));
    }else if(state.activeTool==='polyline'&&state.toolset==='cad'){
      const desc=cadCommandSession?.activeId==='PL'?cadCommandSession.describe?.():null,v=cadCommandSession?.activeId==='PL'?cadCommandSession.view:null,mode=v?.mode||'line',actions=Array.isArray(desc?.actions)?desc.actions:[];
      const group=document.createElement('div');group.className='context-choice-group';
      for(const action of actions){const b=document.createElement('button');b.type='button';b.className='context-choice'+(action.active?' active':'');b.textContent=t(action.labelKey);b.disabled=action.enabled===false;b.addEventListener('click',()=>dispatchActiveCadCommandAction(action.id));group.appendChild(b);}dom.contextFields.appendChild(group);
      hint=v?.phase==='start'?t('hint.polylineFirst'):v?.phase==='arc-control'?t('hint.polylineArcControl'):(mode==='arc'?t('hint.polylineArcEnd'):t('hint.polylineNext'));
    }else if(state.activeTool==='reconstruct'){
      const cr=state.curveReconstruction,fit=cr?.fit,count=cr?.includedIds?.size||0,group=document.createElement('div');group.className='context-choice-group';
      const addButton=(label,run,disabled=false)=>{const b=document.createElement('button');b.type='button';b.className='context-choice';b.textContent=label;b.disabled=Boolean(disabled);b.addEventListener('click',run);group.appendChild(b);};
      addButton(t('curveReconstruct.findMore'),findMoreCurveReconstruction,!fit);addButton(t('curveReconstruct.clear'),clearCurveReconstruction,!count&&!cr?.excludedIds?.size);addButton(t('curveReconstruct.commit'),commitCurveReconstruction,!fit);dom.contextFields.appendChild(group);
      hint=fit?t('curveReconstruct.ready',{count,radius:formatNumber(fit.radius,1),error:formatNumber(fit.maxResidual,2)}):(count?t('curveReconstruct.noFit'):t('curveReconstruct.selectPieces'));
    }else if(state.activeTool==='door'||state.activeTool==='window'){
      const value=state.activeTool==='door'?state.toolSettings.doorWidth:state.toolSettings.windowWidth;
      dom.contextFields.appendChild(contextNumberField(t('context.width'),'width',String(value),'mm'));
      hint=t('hint.opening');
    }else if(state.activeTool==='measure')hint=state.measureStart?t('hint.measureSecond'):t('hint.measureFirst');
    else if(state.activeTool==='space')hint=t('hint.space');
    else if(state.activeTool==='constraint'){
      if(!state.constraintMode)hint=t('hint.constraintChoose');
      else if(state.constraintMode==='coincident')hint=state.constraintPicks.length?t('hint.constraintCoincidentSecond'):t('hint.constraintCoincidentFirst');
      else if(state.constraintMode==='parallel'||state.constraintMode==='perpendicular')hint=state.constraintPicks.length?t('hint.constraintSecondWall'):t('hint.constraintFirstWall');
      else hint=t('hint.constraintWall');
    }else if(state.activeTool==='trim')hint=t(state.toolset==='plan'?'hint.trimPlan':'hint.trim');
    else if(state.activeTool==='extend')hint=t(state.toolset==='plan'?'hint.extendPlan':'hint.extend');
    else if(state.activeTool==='break'){const phase=cadCommandSession?.describe?.().phase||'source';hint=t(phase==='result'?'cadModify.breakSecond':'cadModify.'+phase);}
    else if(state.activeTool==='join'){const phase=cadCommandSession?.describe?.().phase||'source';hint=t(phase==='source'?'cadModify.joinSource':'cadModify.joinSecond');}
    else if(state.activeTool==='offset'){const phase=cadCommandSession?.describe?.().phase||'distance';hint=t('cadModify.'+phase);}
    else if(state.activeTool==='fillet'){const phase=cadCommandSession?.describe?.().phase||'distance';hint=t(phase==='source'?'cadModify.filletSource':phase==='second'?'cadModify.filletSecond':'cadModify.'+phase);}
    else if(state.activeTool==='chamfer'){const phase=cadCommandSession?.describe?.().phase||'distance';hint=t(phase==='source'?'cadModify.chamferSource':phase==='second'?'cadModify.chamferSecond':'cadModify.'+phase);}
    else if(['move','copy','rotate','mirror','scale','stretch','array','align'].includes(state.activeTool)){const phase=cadCommandSession?.describe?.().phase||'select';hint=t('cadTransform.'+phase);}
    else if(state.activeTool==='delete')hint=t('hint.delete');
    else if(state.activeTool==='region')hint=t('hint.region');
    dom.contextHint.textContent=hint;
  }

  function contextNumberField(label,key,value,unit){const wrap=document.createElement('div');wrap.className='context-field';const lab=document.createElement('label');lab.textContent=label;const input=document.createElement('input');input.type='number';input.step='0.01';input.value=value;input.dataset.context=key;const u=document.createElement('span');u.className='context-unit';u.textContent=unit;
    input.addEventListener('input',()=>{if(key==='thickness'){const n=Number(input.value);if(Number.isFinite(n)&&n>0)state.toolSettings.wallThickness=n;}if(key==='width'){const n=Number(input.value);if(Number.isFinite(n)&&n>0){if(state.activeTool==='door')state.toolSettings.doorWidth=n;else if(state.activeTool==='window')state.toolSettings.windowWidth=n;}render();}});
    input.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&(state.activeTool==='line'||state.activeTool==='wall')&&state.drawStart){e.preventDefault();commitNumericSegment();}});wrap.append(lab,input,u);return wrap;}

  function commitNumericSegment(){if(!state.drawStart)return;const lengthInput=document.querySelector('[data-context="length"]');const angleInput=document.querySelector('[data-context="angle"]');const explicitLength=String(lengthInput?.value||'').trim()!=='';const explicitAngle=String(angleInput?.value||'').trim()!=='';let len=Number(lengthInput?.value),ang=Number(angleInput?.value);if(!Number.isFinite(len)||len<=0)len=state.previewEnd?distance(state.drawStart,state.previewEnd):NaN;if(!Number.isFinite(ang))ang=state.previewEnd?angleDeg(state.drawStart,state.previewEnd):0;if(!Number.isFinite(len)||len<=0)return;const end={x:state.drawStart.x+Math.cos(rad(ang))*len,y:state.drawStart.y+Math.sin(rad(ang))*len};const obj=commitSegment(state.drawStart,end,state.activeTool);if(obj?.type==='wall'){const c=ensureWallConstraints(obj);if(explicitLength)c.fixedLength=len;if(explicitAngle)c.fixedAngle=angleDelta(ang,baseAxisAngle());enforceWallConstraints(obj);syncDependentsOfWall(obj.id);updateAll();}}

  function categoryRepresentative(cat,catalog){const items=(catalog[cat.id]||[]).filter(x=>x.ready);if(!items.length)return null;const active=items.find(x=>x.id===state.activeTool);if(active){toolCategoryMemory[state.toolset][cat.id]=active.id;return active;}return items.find(x=>x.id===toolCategoryMemory[state.toolset][cat.id])||items[0];}
  function activatePlanDrawing(id,category){const tool=id==='displayLine'?'line':id==='displayArc'?'wall':id;if(tool==='wall')state.toolSettings.wallType='arc';if(id.startsWith('display'))state.toolSettings.planDisplayStyle='dashed';setTool(tool,category);renderToolRail();updateContextBar();return true;}
  function activateRepresentative(item,category,button){if(!item?.ready)return;if(state.toolset==='plan'&&['line','wall','displayLine','displayArc'].includes(item.id)){activatePlanDrawing(item.id,category);return;}if(item.id==='component'){openComponentPalette(button);return;}if(state.toolset==='plan'&&item.id==='constraint'){openPlanConstraintPalette(button);return;}if(state.toolset==='plan'&&item.id==='wall'){state.toolSettings.wallType='arc';setTool('wall',category);return;}setTool(item.id,category);}
  function positionToolPopover(anchor){if(!anchor||!dom.toolPopover)return;dom.toolPopover.hidden=false;const anchorRect=anchor.getBoundingClientRect(),menuRect=dom.toolPopover.getBoundingClientRect(),margin=8,gap=5;let left=anchorRect.left;left=Math.max(margin,Math.min(window.innerWidth-menuRect.width-margin,left));let top=anchorRect.bottom+gap;if(top+menuRect.height>window.innerHeight-margin)top=Math.max(margin,anchorRect.top-menuRect.height-gap);dom.toolPopover.style.left=`${Math.round(left)}px`;dom.toolPopover.style.top=`${Math.round(top)}px`;}
  function renderToolRail(){
    dom.toolRail.innerHTML='';const categories=state.toolset==='plan'?planCategories:cadCategories,catalog=state.toolset==='plan'?planToolCatalog:cadToolCatalog;
    for(const cat of categories){
      const items=catalog[cat.id]||[],active=items.some(x=>x.id===state.activeTool),rep=categoryRepresentative(cat,catalog),icon=(state.toolset==='plan'&&rep?.id==='wall')?'arc':(toolIconFallback[rep?.id]||cat.icon),label=rep?t(rep.labelKey):t(cat.labelKey);
      const split=document.createElement('div');split.className=`tool-category-split ${active?'active':''}`;split.dataset.category=cat.id;split.dataset.categoryKey=cat.labelKey;split.dataset.representative=rep?.id||'';
      const main=document.createElement('button');main.type='button';main.className=`tool-category ${active?'active':''}`;main.innerHTML=`<span class="tool-icon ui-icon icon-${icon}" aria-hidden="true"></span><span class="tool-text">${escapeHtml(label)}</span>`;main.setAttribute('aria-label',label);main.addEventListener('click',()=>activateRepresentative(rep,cat.id,split));
      const menu=document.createElement('button');menu.type='button';menu.className='tool-category-menu';menu.innerHTML='<span aria-hidden="true">▾</span>';menu.setAttribute('aria-label',`${t(cat.labelKey)} · ${t('action.more')}`);menu.addEventListener('click',e=>{e.stopPropagation();openToolCategory(cat.id,split,catalog);});
      split.addEventListener('contextmenu',e=>{e.preventDefault();openToolCategory(cat.id,split,catalog);});split.append(main,menu);dom.toolRail.appendChild(split);
    }
  }
  function openComponentPalette(anchor){featureFill?.openComponents();dom.toolPopover.hidden=true;}

  function openToolCategory(category,anchor,catalog){state.activeCategory=category;const items=catalog[category]||[];dom.toolPopover.innerHTML='';for(const item of items){const b=document.createElement('button');const displayItem=item.id==='displayLine'||item.id==='displayArc',activePlanDrawing=state.toolset==='plan'&&category==='draw'&&['line','wall','displayLine','displayArc'].includes(item.id);b.className=`tool-item ${activePlanDrawing?(state.activeTool===(item.id==='displayLine'?'line':item.id==='displayArc'?'wall':item.id)&&(!displayItem||Boolean(state.toolSettings.planDisplayMode))?'active':''):(state.activeTool===item.id?'active':'')}`;b.disabled=!item.ready;const note=item.ready?(item.note||''):t('tool.planned');b.innerHTML=`<span class="ui-icon icon-${state.toolset==='plan'&&item.id==='wall'?'arc':toolIconFallback[item.id]||'draw'}" aria-hidden="true"></span><span>${escapeHtml(t(item.labelKey))}</span><span class="tool-item-note">${escapeHtml(note)}</span>`;if(item.ready&&item.note)b.dataset.shortcut=item.note;b.addEventListener('click',()=>{if(!item.ready)return;if(item.id==='component')openComponentPalette(anchor);else if(state.toolset==='plan'&&['line','wall','displayLine','displayArc'].includes(item.id))activatePlanDrawing(item.id,category);else if(state.toolset==='plan'&&item.id==='constraint')openPlanConstraintPalette(anchor);else if(state.toolset==='plan'&&item.id==='wall'){state.toolSettings.wallType='arc';setTool('wall',category);}else if(state.toolset==='plan'&&item.id==='door')openPlanDoorPalette(anchor);else setTool(item.id,category);});dom.toolPopover.appendChild(b);}positionToolPopover(anchor);}

  function openPlanTypePalette(anchor,catalog,selected,onPick,title){dom.toolPopover.innerHTML='';let lastGroup=null;for(const item of catalog){if(catalog===doorTypeCatalog&&item.group!==lastGroup){lastGroup=item.group;const h=document.createElement('div');h.className='tool-popover-heading';h.textContent=t(`doorGroup.${item.group}`);dom.toolPopover.appendChild(h);}const b=document.createElement('button');b.className=`tool-item ${selected===item.id?'active':''}`;b.innerHTML=`<span class="ui-icon icon-${catalog===doorTypeCatalog?'door':item.id==='arc'?'arc':'line'}" aria-hidden="true"></span><span>${escapeHtml(t(item.labelKey))}</span>`;b.addEventListener('click',()=>{onPick(item.id);dom.toolPopover.hidden=true;});dom.toolPopover.appendChild(b);}positionToolPopover(anchor);}
  function openPlanWallPalette(button){openPlanTypePalette(button,wallTypeCatalog,state.toolSettings.wallType,id=>{state.toolSettings.wallType=id;setTool('wall','plan');},t('tool.wall'));}
  function openPlanDoorPalette(button){openPlanTypePalette(button,doorTypeCatalog,state.toolSettings.doorType,id=>{state.toolSettings.doorType=id;setTool('door','plan');},t('tool.door'));}
  function ensureActiveCadLayerVisible(){
    const layer=state.activeCadLayer||'0';ensureCadLayerMaps(layer);let changed=false;
    if(!cadGlobalLayerVisible(layer)){state.cadLayerVisibility.set(layer,true);changed=true;}
    if(state.cadWorkRegionId&&!cadLayerVisible(layer,state.cadWorkRegionId)){cadRegionLayerMap(state.cadWorkRegionId,{create:true}).set(layer,true);changed=true;}
    if(changed){touchCadLayer();markDirty(true);renderPrimaryPanel();}
  }


  function visibleCadLines(excludeId=null){return cadWorkObjects().filter(o=>o.type==='cadLine'&&o.id!==excludeId&&cadLayerVisible(cadLayerForObject(o)));}
  function computeCadModifyPlan(mode,target,click){
    if(!target||!cadPolicy(target.id,'modify').allowed)return null;
    let plan=null;
    if(target.type==='cadLine'){const start=distance(click,target.a)<=distance(click,target.b),from=start?target.b:target.a,to=start?target.a:target.b;const raw=mode==='extend'?cadQueryIndex?.rayCandidates({a:from,b:to})||[]:cadQueryCandidates(cadGeometry.bounds(target),'snap');const cutters=raw.filter(o=>o.id!==target.id&&(mode==='extend'||!modules.cadPolyline.is(o))&&cadPolicy(o.id,'snap').allowed);plan=modules.cadModifyGeometry.plan(mode,target,click,cutters);}
    else if(modules.cadPolyline.is(target)&&mode==='trim'){const hit=modules.cadPolyline.nearest(target,click);if(!hit)return null;const edge=modules.cadPolyline.get(target).edges.find(e=>e.edgeId===hit.edgeId);if(!edge)return null;const raw=cadQueryCandidates(cadGeometry.bounds(edge),'snap');const cutters=raw.filter(o=>o.id!==target.id&&cadPolicy(o.id,'snap').allowed);plan=modules.cadPolyline.trimAt(target,click,cutters);}
    else if(mode==='extend'&&modules.cadPolyline.is(target)){const support=modules.cadPolyline.extensionSupport(target,click);if(!support)return null;const raw=support.queryKind==='ray'?(cadQueryIndex?.rayCandidates(support.query)||[]):cadQueryCandidates(cadGeometry.bounds(support.query),'snap');const cutters=raw.filter(o=>o.id!==target.id&&cadPolicy(o.id,'snap').allowed);plan=modules.cadPolyline.extendTerminal(target,click,cutters);}
    return plan?{...plan,token:cadContextToken(),previewTool:state.activeTool,previewCommand:state.activeCommand,previewFloorId:state.activeFloorId}:null;
  }
  function computeCadTrimSegment(target,click){return computeCadModifyPlan('trim',target,click);}
  function updateTrimPreview(raw,{shift=false}={}){
    state.trimPreview=null;
    if(state.toolset==='plan'){if(!['trim','extend'].includes(state.activeTool))return;const obj=hitObject(raw);if(!obj||(obj.type!=='line'&&!(obj.type==='wall'&&!isArcWall(obj))))return;state.trimPreview=state.activeTool==='extend'?computePlanExtend(obj,raw):computePlanTrimSegment(obj,raw);if(state.trimPreview?.kind==='extend')updateSmartGuides(state.trimPreview.b,obj[ state.trimPreview.endpoint==='a'?'b':'a' ],obj.id);return;}
    if(!['trim','extend'].includes(state.activeTool))return;
    const mode=shift?(state.activeTool==='trim'?'extend':'trim'):state.activeTool;
    state.trimPreview=computeCadModifyPlan(mode,hitObject(raw),raw);
  }
  function commitCadModifyPlan(plan){
    if(!cadModifyPreviewCurrent(plan))return false;
    const index=state.objects.indexOf(plan.before),after=plan.after.map((o,i)=>({...o,id:i?uid('cadLine'):plan.before.id}));
    const changes=[{before:plan.before,after:after[0]||null,index}];for(const o of after.slice(1))changes.push({before:null,after:o,index:state.objects.length});
    try{const ok=commitCadChanges(plan.kind,changes);state.trimPreview=null;if(ok)updateAll();return ok;}catch(error){state.trimPreview=null;setCommandStatus(cadFaultMessage(error.message),'error');return false;}
  }
  function commitCadPolylineTrimPlan(plan){
    if(!cadModifyPreviewCurrent(plan))return false;
    try{const ok=commitCadOperation('trim',{...plan,before:[plan.before]});state.trimPreview=null;if(ok)updateAll();return ok;}catch(error){state.trimPreview=null;setCommandStatus(cadFaultMessage(error.message),'error');return false;}
  }
  function trimCadLineAtClick(target,click){const plan=computeCadModifyPlan('trim',target,click);return modules.cadPolyline.is(target)?commitCadPolylineTrimPlan(plan):commitCadModifyPlan(plan);}
  function extendCadLineAtClick(target,click){return commitCadModifyPlan(computeCadModifyPlan('extend',target,click));}
  function planLinearObjects(excludeId=null){return state.objects.filter(o=>o.id!==excludeId&&objectOnActiveFloor(o)&&((o.type==='line'&&!isPlanDisplayArc(o))||(o.type==='wall'&&!isArcWall(o))));}
  function linearEnds(o){return o&&((o.type==='line'&&!isPlanDisplayArc(o))||(o.type==='wall'&&!isArcWall(o)))?[o.a,o.b]:null;}
  function remapWallDependentsAfterTrim(wall,{mode,t0,t1,newWall=null}){const remove=[];for(const dep of state.objects){if(dep.wallId!==wall.id)continue;if(dep.type==='door'||dep.type==='window'){const ot=Number(dep.t??.5);if(mode==='head'){if(ot<t1){remove.push(dep.id);continue;}dep.t=(ot-t1)/Math.max(1e-9,1-t1);}else if(mode==='tail'){if(ot>t0){remove.push(dep.id);continue;}dep.t=ot/Math.max(1e-9,t0);}else{if(ot<t0)dep.t=ot/Math.max(1e-9,t0);else if(ot>t1&&newWall){dep.wallId=newWall.id;dep.t=(ot-t1)/Math.max(1e-9,1-t1);}else remove.push(dep.id);}}else if(dep.type==='dimension'){const a=Number(dep.t1??0),b=Number(dep.t2??1),lo=Math.min(a,b),hi=Math.max(a,b);if(mode==='head'){if(hi<t1){remove.push(dep.id);continue;}dep.t1=(a-t1)/Math.max(1e-9,1-t1);dep.t2=(b-t1)/Math.max(1e-9,1-t1);}else if(mode==='tail'){if(lo>t0){remove.push(dep.id);continue;}dep.t1=a/Math.max(1e-9,t0);dep.t2=b/Math.max(1e-9,t0);}else if(hi<=t0){dep.t1=a/Math.max(1e-9,t0);dep.t2=b/Math.max(1e-9,t0);}else if(lo>=t1&&newWall){dep.wallId=newWall.id;dep.t1=(a-t1)/Math.max(1e-9,1-t1);dep.t2=(b-t1)/Math.max(1e-9,1-t1);}else remove.push(dep.id);}}if(remove.length)state.objects=state.objects.filter(o=>!remove.includes(o.id));}
  function computePlanTrimSegment(target,click){
    const ends=linearEnds(target);if(!ends)return null;const hits=[];for(const other of planLinearObjects(target.id)){const oe=linearEnds(other);if(!oe)continue;const x=segmentIntersection(ends[0],ends[1],oe[0],oe[1]);if(x&&x.t>1e-6&&x.t<1-1e-6)hits.push(x.t);}if(!hits.length)return null;
    const pr=projectPointToSegment(click,ends[0],ends[1]),cuts=[0,...[...new Set(hits.map(v=>Math.round(v*1e7)/1e7))].sort((a,b)=>a-b),1];let k=0;for(let i=0;i<cuts.length-1;i++)if(pr.t>=cuts[i]-1e-8&&pr.t<=cuts[i+1]+1e-8){k=i;break;}
    const t0=cuts[k],t1=cuts[k+1],a=ends[0],b=ends[1],point=t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});return{targetId:target.id,t0,t1,a:point(t0),b:point(t1),cuts:[...(t0>1e-8?[point(t0)]:[]),...(t1<1-1e-8?[point(t1)]:[])]};
  }

  function trimPlanLinearAtClick(target,click){const preview=computePlanTrimSegment(target,click);if(!preview)return false;const {t0,t1}=preview,oldA={...target.a},oldB={...target.b},point=t=>({x:oldA.x+(oldB.x-oldA.x)*t,y:oldA.y+(oldB.y-oldA.y)*t});pushHistory();if(target.type==='line'){if(t0<=1e-8)target.a=point(t1);else if(t1>=1-1e-8)target.b=point(t0);else{target.b=point(t0);state.objects.push({...structuredClone(target),id:uid('line'),a:point(t1),b:oldB,floorId:target.floorId||state.activeFloorId});}}else{target.attachments=target.attachments||{};const oldAttach=structuredClone(target.attachments||{}),oldConstraints=structuredClone(target.constraints||{});if(t0<=1e-8){target.a=point(t1);delete target.attachments.a;remapWallDependentsAfterTrim(target,{mode:'head',t0,t1});}else if(t1>=1-1e-8){target.b=point(t0);delete target.attachments.b;remapWallDependentsAfterTrim(target,{mode:'tail',t0,t1});}else{target.b=point(t0);delete target.attachments.b;const newWall={...structuredClone(target),id:uid('wall'),a:point(t1),b:oldB,attachments:{},constraints:{...oldConstraints,fixedLength:null}};if(oldAttach.b)newWall.attachments.b=oldAttach.b;state.objects.push(newWall);remapWallDependentsAfterTrim(target,{mode:'middle',t0,t1,newWall});}}markDirty(true);refreshSpaces();rebuildObjectSnapIndex();updateAll();return true;}
  function detachAutoDependentsAtEndpoint(parentId,targetEndpoint){
    let count=0;for(const child of getPlanObjects().filter(o=>o.type==='wall'&&o.id!==parentId)){for(const ep of ['a','b']){const att=child.attachments?.[ep];if(att?.wallId===parentId&&att.kind==='coincident'&&att.targetEndpoint===targetEndpoint&&att.autoJunction){delete child.attachments[ep];count++;}}}return count;
  }
  function attachEndpointToExactBoundary(target,endpoint,boundary,point){
    if(target?.type!=='wall'||boundary?.type!=='wall')return false;target.attachments=target.attachments||{};const pr=wallProjectPoint(point,boundary),endTol=1e-5;
    if(distance(point,boundary.a)<=endTol){target[endpoint]={...boundary.a};target.attachments[endpoint]={wallId:boundary.id,t:0,kind:'coincident',targetEndpoint:'a',autoJunction:false};}
    else if(distance(point,boundary.b)<=endTol){target[endpoint]={...boundary.b};target.attachments[endpoint]={wallId:boundary.id,t:1,kind:'coincident',targetEndpoint:'b',autoJunction:false};}
    else{target[endpoint]={...pr.point};target.attachments[endpoint]={wallId:boundary.id,t:pr.t,kind:'pointOnLine',targetEndpoint:null,autoJunction:false};}
    return true;
  }
  function computePlanExtend(target,click){
    const ends=linearEnds(target);if(!ends)return null;
    const endpoint=distance(click,ends[0])<=distance(click,ends[1])?'a':'b',extendA=endpoint==='a',c=target.constraints;
    if(c?.fixed||Number.isFinite(c?.fixedLength)||c?.endpointLocks?.[endpoint])return null;
    const candidates=[],support={a:ends[0],b:ends[1],mode:'line'};
    for(const other of getPlanObjects()){if(other.id===target.id||!['wall','line'].includes(other.type))continue;const geometry=isArcWall(other)?planArcGeometry(other):other;for(const point of cadGeometry.intersections(support,geometry)){const t=cadGeometry.parameter?cadGeometry.parameter(support,point):((point.x-ends[0].x)*(ends[1].x-ends[0].x)+(point.y-ends[0].y)*(ends[1].y-ends[0].y))/Math.max(1e-12,(ends[1].x-ends[0].x)**2+(ends[1].y-ends[0].y)**2);if((extendA&&t<-.00001)||(!extendA&&t>1.00001))candidates.push({t,point,boundaryId:other.id});}}
    candidates.sort((x,y)=>extendA?y.t-x.t:x.t-y.t);const hit=candidates[0];return hit?{kind:'extend',targetId:target.id,endpoint,boundaryId:hit.boundaryId,a:{...target[endpoint]},b:{...hit.point},cuts:[{...hit.point}],floorId:state.activeFloorId,projectId:state.projectId,before:JSON.stringify(target)}:null;
  }
  function extendPlanLinearAtClick(target,click){
    const plan=computePlanExtend(target,click);if(!plan||plan.floorId!==state.activeFloorId)return false;
    const boundary=state.objects.find(o=>o.id===plan.boundaryId),oldA={...target.a},oldB={...target.b},oldPoint=t=>({x:oldA.x+(oldB.x-oldA.x)*t,y:oldA.y+(oldB.y-oldA.y)*t});
    pushHistory();
    if(target.type==='wall'){
      target.attachments=target.attachments||{};delete target.attachments[plan.endpoint];
      // EX edits one owner. Every incoming relation at the departing endpoint detaches,
      // including explicit relations. Interior relations remap t and keep world geometry.
      for(const child of getPlanObjects().filter(o=>o.type==='wall'&&o.id!==target.id))for(const ep of ['a','b']){const att=child.attachments?.[ep];if(att?.wallId===target.id&&att.kind==='coincident'&&att.targetEndpoint===plan.endpoint)delete child.attachments[ep];}
    }
    target[plan.endpoint]={...plan.b};
    if(target.type==='wall'){
      for(const child of getPlanObjects().filter(o=>o.type==='wall'&&o.id!==target.id))for(const ep of ['a','b']){const att=child.attachments?.[ep];if(att?.wallId!==target.id)continue;const pr=wallProjectPoint(child[ep],target);if(pr.distance>1e-5)delete child.attachments[ep];else att.t=pr.t;}
      for(const dep of state.objects.filter(o=>o.wallId===target.id)){if(dep.type==='door'||dep.type==='window')dep.t=wallProjectPoint(oldPoint(dep.t??.5),target).t;else if(dep.type==='dimension'){dep.t1=wallProjectPoint(oldPoint(dep.t1??0),target).t;dep.t2=wallProjectPoint(oldPoint(dep.t2??1),target).t;}}
      if(boundary?.type==='wall')attachEndpointToExactBoundary(target,plan.endpoint,boundary,plan.b);
    }
    state.trimPreview=null;recordEdit('extend',{targetId:target.id,endpoint:plan.endpoint,boundaryId:plan.boundaryId,before:plan.a,after:plan.b});markDirty(true);refreshSpaces();rebuildObjectSnapIndex();updateAll();return true;
  }

  function applyTrimExtendAtPoint(raw,mode,{shift=state.shiftDown}={}){const obj=hitObject(raw);if(!obj)return false;if(state.toolset==='cad'&&!cadObjectModifiable(obj))return false;const actual=state.toolset==='plan'?mode:(Boolean(shift)?(mode==='trim'?'extend':'trim'):mode);let ok=false;if(state.toolset==='cad'&&(obj.type==='cadLine'||modules.cadPolyline.is(obj)))ok=actual==='trim'?trimCadLineAtClick(obj,raw):extendCadLineAtClick(obj,raw);else if(state.toolset==='plan'&&((obj.type==='line'&&!isPlanDisplayArc(obj))||(obj.type==='wall'&&!isArcWall(obj))))ok=actual==='trim'?trimPlanLinearAtClick(obj,raw):extendPlanLinearAtClick(obj,raw);if(ok)recordEdit(actual,{targetId:obj.id,toolset:state.toolset});setCommandStatus(ok?t(actual==='trim'?'command.trimApplied':'command.extendApplied'):t(actual==='trim'?'command.trimNoBoundary':'command.extendNoBoundary'),ok?'strong':'error');return ok;}

  function parseCadPointText(raw,{base=null,direction=null}={}){
    const text=String(raw??'').trim();if(!text)return{ok:false,code:'empty-coordinate'};
    const plain=modules.commandFoundation.parseInput(text,{expect:'point',base,direction});if(plain.ok&&plain.kind==='point')return plain;
    const relative=text.startsWith('@'),body=relative?text.slice(1):text,origin=relative?(base||null):{x:0,y:0};if(relative&&!origin)return{ok:false,code:'base-required'};
    if(body.includes(',')){const parts=body.split(',').map(v=>v.trim());if(parts.length!==2)return{ok:false,code:'invalid-coordinate'};const x=cadUnitsModule.parseLength(parts[0],{defaultUnit:state.unitSystem==='imperial'?'in':'mm'}),y=cadUnitsModule.parseLength(parts[1],{defaultUnit:state.unitSystem==='imperial'?'in':'mm'});if(!x.ok||!y.ok)return{ok:false,code:'invalid-coordinate'};return{ok:true,kind:'point',point:{x:origin.x+x.mm,y:origin.y+y.mm},relative};}
    if(body.includes('<')){const parts=body.split('<').map(v=>v.trim());if(parts.length!==2)return{ok:false,code:'invalid-polar'};const d=cadUnitsModule.parseLength(parts[0],{defaultUnit:state.unitSystem==='imperial'?'in':'mm'}),a=Number(parts[1]);if(!d.ok||!Number.isFinite(a)||d.mm<0)return{ok:false,code:'invalid-polar'};const r=rad(a);return{ok:true,kind:'point',point:{x:origin.x+d.mm*Math.cos(r),y:origin.y+d.mm*Math.sin(r)},relative};}
    const d=cadUnitsModule.parseLength(body,{defaultUnit:state.unitSystem==='imperial'?'in':'mm'});if(d.ok&&base&&direction&&Math.hypot(direction.x,direction.y)>1e-9){const len=Math.hypot(direction.x,direction.y);return{ok:true,kind:'point',point:{x:base.x+d.mm*direction.x/len,y:base.y+d.mm*direction.y/len},relative:false};}
    return{ok:false,code:'invalid-coordinate'};
  }
  function resolveCadPoint(point,{base=null,shift=false,typed=false}={}){
    if(typed)return{point:{...point},source:'typed'};let resolved=nearestSnap(point,null,base);let source=state.snapIndicator?`snap:${state.snapIndicator.kind||'point'}`:'pointer';
    if(base&&(shift||state.ortho||state.polar)){const constrained=constrainOrtho(base,resolved);if(distance(constrained,resolved)>1e-8)source=shift||state.ortho?'ortho':'polar';resolved=constrained;}
    return{point:{...resolved},source};
  }
  function commitNativeCadLine(a,b){
    if(!modules.commandFoundation.finitePoint(a)||!modules.commandFoundation.finitePoint(b))throw new Error('invalid-point');
    const layer=state.activeCadLayer||'0';ensureCadLayerMaps(layer);if(cadLayerLocked(layer)){const err=new Error('active-layer-locked');err.code='locked-layer';throw err;}if(distance(a,b)<1e-8)return false;
    const obj={id:uid('cadLine'),type:'cadLine',cadLayer:layer,layerId:'drawing',a:{...a},b:{...b},source:'PieniPlan'};commitCadChanges('LINE',[{before:null,after:obj,index:state.objects.length}]);cadLineContinuationPoint={...b};setSelectionIds(new Set([obj.id]));recordEdit('line',{objectId:obj.id,layer});return obj;
  }
  function startNativeCadLineSession({seed=cadLineContinuationPoint}={}){
    if(state.toolset!=='cad'||state.activeTool!=='line')return false;if(cadLayerLocked(state.activeCadLayer||'0')){setCommandStatus(t('cadFault.activeLayerLocked'),'error');return false;}const session=cadCommands();if(session.activeId==='L')return true;const result=reportCadCommand(session.start('L'));if(!result?.ok)return false;if(seed){const seeded=reportCadCommand(session.dispatch({type:'point',point:{...seed},shift:false}));if(!seeded?.ok)return false;}return true;
  }
  function commitNativeCadPolyline(points,closed=false){
    if(!Array.isArray(points)||points.length<(closed?3:2))return false;const layer=state.activeCadLayer||'0';ensureCadLayerMaps(layer);if(cadLayerLocked(layer)){const err=new Error('active-layer-locked');err.code='locked-layer';throw err;}
    const ownerId=uid('cadPolyline'),vertices=points.map((p,i)=>{const v={id:uid('cadVertex'),x:Number(p.x),y:Number(p.y)};if(i<points.length-1||closed)v.outgoing={id:uid('cadEdge'),bulge:Number(p.bulge)||0};return v;});
    const obj={id:ownerId,type:'cadPolyline',closed:Boolean(closed),cadLayer:layer,layerId:'drawing',vertices,source:'PieniPlan'};modules.cadPolyline.validate(obj);commitCadChanges('PLINE',[{before:null,after:obj,index:state.objects.length}]);setSelectionIds(new Set([obj.id]));recordEdit('polyline',{objectId:obj.id,layer,closed:obj.closed,vertices:obj.vertices.length});return obj;
  }
  function commitNativeCadRectangle(a,b){
    if(!modules.commandFoundation.finitePoint(a)||!modules.commandFoundation.finitePoint(b)||Math.abs(a.x-b.x)<1e-8||Math.abs(a.y-b.y)<1e-8)return false;const layer=state.activeCadLayer||'0';ensureCadLayerMaps(layer);if(cadLayerLocked(layer)){const err=new Error('active-layer-locked');err.code='locked-layer';throw err;}
    const points=[{x:a.x,y:a.y},{x:b.x,y:a.y},{x:b.x,y:b.y},{x:a.x,y:b.y}],ownerId=uid('cadPolyline'),vertices=points.map(p=>({id:uid('cadVertex'),x:p.x,y:p.y,outgoing:{id:uid('cadEdge'),bulge:0}})),obj={id:ownerId,type:'cadPolyline',closed:true,cadLayer:layer,layerId:'drawing',vertices,source:'PieniPlan Rectangle'};modules.cadPolyline.validate(obj);commitCadChanges('RECTANGLE',[{before:null,after:obj,index:state.objects.length}]);setSelectionIds(new Set([obj.id]));recordEdit('rectangle',{objectId:obj.id,layer});return obj;
  }
  function commitNativeCadCircle(center,radius){
    if(!modules.commandFoundation.finitePoint(center)||!(Number(radius)>1e-8))return false;const layer=state.activeCadLayer||'0';ensureCadLayerMaps(layer);if(cadLayerLocked(layer)){const err=new Error('active-layer-locked');err.code='locked-layer';throw err;}const obj={id:uid('cadCircle'),type:'cadCircle',cadLayer:layer,layerId:'drawing',center:{...center},radius:Number(radius),source:'PieniPlan'};commitCadChanges('CIRCLE',[{before:null,after:obj,index:state.objects.length}]);setSelectionIds(new Set([obj.id]));recordEdit('circle',{objectId:obj.id,layer,radius:obj.radius});return obj;
  }
  function commitNativeCadArc(geometry){
    if(!geometry||!modules.commandFoundation.finitePoint(geometry.center)||!(Number(geometry.radius)>1e-8)||!Number.isFinite(Number(geometry.startAngle))||!Number.isFinite(Number(geometry.sweep))||Math.abs(Number(geometry.sweep))<1e-6)return false;const layer=state.activeCadLayer||'0';ensureCadLayerMaps(layer);if(cadLayerLocked(layer)){const err=new Error('active-layer-locked');err.code='locked-layer';throw err;}const obj={id:uid('cadArc'),type:'cadArc',cadLayer:layer,layerId:'drawing',center:{...geometry.center},radius:Number(geometry.radius),startAngle:Number(geometry.startAngle),sweep:Number(geometry.sweep),sourceType:'ARC',source:'PieniPlan'};commitCadChanges('ARC',[{before:null,after:obj,index:state.objects.length}]);setSelectionIds(new Set([obj.id]));recordEdit('arc',{objectId:obj.id,layer,radius:obj.radius,sweep:obj.sweep});return obj;
  }
  function startNativeCadPolylineSession(){
    if(state.toolset!=='cad'||state.activeTool!=='polyline')return false;if(cadLayerLocked(state.activeCadLayer||'0')){setCommandStatus(t('cadFault.activeLayerLocked'),'error');return false;}const session=cadCommands();if(session.activeId==='PL')return true;return Boolean(reportCadCommand(session.start('PL'))?.ok);
  }
  function cloneCadPolylineWithFreshIds(obj,{dx=0,dy=0}={}){
    modules.cadPolyline.validate(obj);const copy=modules.cadChangeSet.clone(obj);copy.id=uid('cadPolyline');copy.vertices=obj.vertices.map(v=>({id:uid('cadVertex'),x:v.x+dx,y:v.y+dy,...(v.outgoing?{outgoing:{id:uid('cadEdge'),bulge:v.outgoing.bulge}}:{})}));return modules.cadPolyline.validate(copy);
  }
  function transformCadPolylineOwner(obj,kind){
    if(!modules.cadPolyline.is(obj)||state.toolset!=='cad'||!cadPolicy(obj.id,'modify').allowed)return false;
    const b=cadGeometry.bounds(obj);if(!b)return false;const cx=(b.minx+b.maxx)/2,cy=(b.miny+b.maxy)/2;let matrix,label='POLYLINE-TRANSFORM';
    if(kind==='rotate90'){matrix={a:0,b:1,c:-1,d:0,tx:cx+cy,ty:cy-cx};label='ROTATE';}
    else if(kind==='mirrorX'){matrix={a:-1,b:0,c:0,d:1,tx:2*cx,ty:0};label='MIRROR';}
    else if(kind==='mirrorY'){matrix={a:1,b:0,c:0,d:-1,tx:0,ty:2*cy};label='MIRROR';}
    else return false;
    const before=modules.cadChangeSet.clone(obj),after=modules.cadPolyline.transform(before,matrix);const changed=commitCadChanges(label,[{before,after,index:state.objects.indexOf(obj)}]);if(changed){setSelectionIds(new Set([after.id]));updateAll();}return changed;
  }
  function setCadPolylineClosed(obj,closed){
    if(!modules.cadPolyline.is(obj)||state.toolset!=='cad'||!cadPolicy(obj.id,'modify').allowed)return false;
    const current=cadContext?.getById(obj.id)||state.objects.find(o=>o.id===obj.id);if(current!==obj||cadLayerLocked(cadLayerForObject(obj)))return false;
    const plan=modules.cadPolyline.setClosed(obj,closed);if(!plan){setCommandStatus(t(closed?'cadModify.closeFailed':'cadModify.openFailed'),'error');return false;}
    try{const changed=commitCadOperation(closed?'POLYLINE CLOSE':'POLYLINE OPEN',plan);if(changed){setCommandStatus(t(closed?'cadModify.closed':'cadModify.opened'),'strong');updateAll();}return changed;}catch(error){setCommandStatus(cadFaultMessage(error.message),'error');return false;}
  }

  function insertCadPolylineVertexAt(obj,point){
    if(!modules.cadPolyline.is(obj)||!point||state.toolset!=='cad'||!cadObjectModifiable(obj))return false;
    const current=cadContext?.getById(obj.id)||state.objects.find(o=>o.id===obj.id);if(current!==obj)return false;
    let plan=null;try{plan=modules.cadPolyline.insertVertexAt(obj,point);}catch(_){plan=null;}
    if(!plan){setCommandStatus(t('polyline.vertexInsertFailed'),'error');return false;}
    try{const changed=commitCadOperation('POLYLINE VERTEX INSERT',plan);if(changed){setSelectionIds(new Set([obj.id]));setCommandStatus(t('polyline.vertexInserted'),'strong');updateAll();}return changed;}catch(error){setCommandStatus(cadFaultMessage(error.message),'error');return false;}
  }
  function deleteCadPolylineVertex(obj,index){
    if(!modules.cadPolyline.is(obj)||!Number.isInteger(index)||state.toolset!=='cad'||!cadObjectModifiable(obj))return false;
    const current=cadContext?.getById(obj.id)||state.objects.find(o=>o.id===obj.id);if(current!==obj)return false;
    const min=obj.closed?3:2;if(obj.vertices.length<=min){setCommandStatus(t('polyline.vertexDeleteMin'),'error');return false;}
    let plan=null;try{plan=modules.cadPolyline.deleteVertex(obj,index);}catch(_){plan=null;}
    if(!plan){setCommandStatus(t('polyline.vertexDeleteUnsupported'),'error');return false;}
    try{const changed=commitCadOperation('POLYLINE VERTEX DELETE',plan);if(changed){setSelectionIds(new Set([obj.id]));setCommandStatus(t('polyline.vertexDeleted'),'strong');updateAll();}return changed;}catch(error){setCommandStatus(cadFaultMessage(error.message),'error');return false;}
  }


  // Build52 — semi-automatic Curve Reconstruction. Persistent document geometry is
  // untouched until the user explicitly commits the fitted preview.
  function curveReconstructionObjectById(id){return state.toolset==='cad'?(cadContext?.getById(id)||state.objects.find(o=>o.id===id)):state.objects.find(o=>o.id===id);}
  function curveReconstructionEligibleObject(obj,{notify=false}={}){
    if(!obj)return false;
    if(state.toolset==='cad'){
      const typeOk=obj.type==='cadLine'||obj.type==='cadArc';
      if(!typeOk){if(notify&&modules.cadPolyline.is(obj))setCommandStatus(t('curveReconstruct.unsupportedCad'),'error');return false;}
      const policy=cadPolicy(obj.id,'modify'),visible=cadLayerVisible(cadLayerForObject(obj),state.cadWorkRegionId);
      if(!policy.allowed||!visible){if(notify&&!policy.allowed)setCommandStatus(cadFaultMessage(policy.reason),'error');return false;}
      return true;
    }
    return obj.type==='wall'&&objectOnActiveFloor(obj)&&layerVisible('walls');
  }
  function curveReconstructionPiece(obj){
    if(!obj)return null;
    if(obj.type==='cadLine')return{id:obj.id,kind:'line',a:{...obj.a},b:{...obj.b}};
    if(obj.type==='cadArc')return{id:obj.id,kind:'arc',center:{...obj.center},radius:Number(obj.radius),startAngle:Number(obj.startAngle)||0,sweep:Number(obj.sweep)||0};
    if(obj.type==='wall')return isArcWall(obj)?{id:obj.id,kind:'arc',center:{...obj.center},radius:Number(obj.radius),startAngle:Number(obj.startAngle)||0,sweep:Number(obj.sweep)||0}:{id:obj.id,kind:'line',a:{...obj.a},b:{...obj.b}};
    return null;
  }
  function curveReconstructionCandidates(){return(state.toolset==='cad'?cadWorkObjects():getPlanObjects()).filter(o=>curveReconstructionEligibleObject(o)).map(o=>curveReconstructionPiece(o)).filter(Boolean);}
  function curveReconstructionSources(){const cr=state.curveReconstruction;if(!cr)return[];const out=[];for(const id of cr.includedIds){const o=curveReconstructionObjectById(id);if(curveReconstructionEligibleObject(o))out.push(o);}return out;}
  function recomputeCurveReconstruction(){
    const cr=state.curveReconstruction;if(!cr)return null;
    for(const id of [...cr.includedIds])if(!curveReconstructionEligibleObject(curveReconstructionObjectById(id)))cr.includedIds.delete(id);
    const pieces=curveReconstructionSources().map(curveReconstructionPiece).filter(Boolean);
    cr.fit=modules.curveReconstruction.fitPieces(pieces);return cr.fit;
  }
  function beginCurveReconstruction(){
    const includedIds=new Set([...selectionIds()].filter(id=>curveReconstructionEligibleObject(curveReconstructionObjectById(id))));
    state.curveReconstruction={mode:state.toolset,includedIds,excludedIds:new Set(),hoverId:null,fit:null};
    recomputeCurveReconstruction();return state.curveReconstruction;
  }
  function clearCurveReconstruction(){const cr=state.curveReconstruction;if(!cr)return false;cr.includedIds.clear();cr.excludedIds.clear();cr.hoverId=null;cr.fit=null;updateContextBar();render();return true;}
  function toggleCurveReconstructionObject(obj){
    const cr=state.curveReconstruction;if(!cr||!curveReconstructionEligibleObject(obj,{notify:true}))return false;
    if(cr.includedIds.has(obj.id)){cr.includedIds.delete(obj.id);cr.excludedIds.add(obj.id);}else{cr.includedIds.add(obj.id);cr.excludedIds.delete(obj.id);}
    recomputeCurveReconstruction();updateContextBar();render();return true;
  }
  function findMoreCurveReconstruction(){
    const cr=state.curveReconstruction;if(!cr)return false;const fit=recomputeCurveReconstruction();if(!fit){setCommandStatus(t('curveReconstruct.noFit'),'error');updateContextBar();render();return false;}
    const suggestions=modules.curveReconstruction.suggestMore(fit,curveReconstructionCandidates(),{includedIds:cr.includedIds,excludedIds:cr.excludedIds,limit:12});
    if(!suggestions.length){setCommandStatus(t('curveReconstruct.noMore'),'strong');return false;}
    for(const piece of suggestions)cr.includedIds.add(piece.id);recomputeCurveReconstruction();setCommandStatus(t('curveReconstruct.moreAdded',{count:suggestions.length}),'strong');updateContextBar();render();return true;
  }
  function curveReconstructionCadAppearanceKey(obj){return JSON.stringify([cadLayerForObject(obj),obj.color??null,obj.linetype??null,obj.lineweight??null]);}
  function commitCadCurveReconstruction(sources,fit){
    if(!sources.length||!fit)return false;const first=sources[0],key=curveReconstructionCadAppearanceKey(first);
    if(sources.some(o=>!curveReconstructionEligibleObject(o)||curveReconstructionCadAppearanceKey(o)!==key||cadLayerLocked(cadLayerForObject(o)))){setCommandStatus(t('curveReconstruct.incompatibleCad'),'error');return false;}
    const layer=cadLayerForObject(first),newArc={id:uid('cadArc'),type:'cadArc',cadLayer:layer,center:{...fit.center},radius:fit.radius,startAngle:fit.startAngle,sweep:fit.sweep,source:'PieniPlan Curve Reconstruction',sourceType:'ARC'};
    if(Object.hasOwn(first,'layerId'))newArc.layerId=first.layerId;if(Object.hasOwn(first,'color'))newArc.color=first.color;if(Object.hasOwn(first,'linetype'))newArc.linetype=first.linetype;if(Object.hasOwn(first,'lineweight'))newArc.lineweight=first.lineweight;
    const indices=sources.map(o=>state.objects.indexOf(o)).filter(i=>i>=0),insertAt=indices.length?Math.min(...indices):state.objects.length,changes=sources.map(o=>({before:o,after:null,index:state.objects.indexOf(o)}));changes.push({before:null,after:newArc,index:insertAt});
    try{if(!commitCadChanges('CURVE RECONSTRUCTION',changes))return false;}catch(error){setCommandStatus(cadFaultMessage(error.message),'error');return false;}
    state.curveReconstruction=null;setTool('select','select');setSelectionIds(new Set([newArc.id]));recordEdit('curveReconstruct',{toolset:'cad',sourceIds:sources.map(o=>o.id),resultId:newArc.id,radius:fit.radius});setCommandStatus(t('curveReconstruct.committedCad',{count:sources.length}),'strong');updateAll();return true;
  }
  function planCurveConstraintMeaningful(wall){const c=wall?.constraints||{};return Boolean(c.orientation||c.reference||Number.isFinite(c.fixedAngle)||Number.isFinite(c.fixedLength)||c.fixed||c.endpointLocks?.a||c.endpointLocks?.b);}
  function planCurveReconstructionIssue(sources){
    if(!sources.length)return'curveReconstruct.noFit';const ids=new Set(sources.map(o=>o.id)),floorId=state.activeFloorId,thicknesses=sources.map(o=>Number(o.thickness)||150),mid=median(thicknesses),tol=Math.max(15,mid*.1);
    if(sources.some(o=>o.type!=='wall'||o.floorId&&o.floorId!==floorId))return'curveReconstruct.planDependent';
    const layerIds=new Set(sources.map(o=>o.layerId||'walls'));if(layerIds.size>1)return'curveReconstruct.planDependent';
    if(Math.max(...thicknesses)-Math.min(...thicknesses)>tol)return'curveReconstruct.planThickness';
    if(ids.has(state.baseAxisWallId))return'curveReconstruct.planDependent';
    for(const wall of sources){if(planCurveConstraintMeaningful(wall))return'curveReconstruct.planDependent';for(const ep of['a','b']){const rel=wall.attachments?.[ep];if(rel?.wallId&&!ids.has(rel.wallId))return'curveReconstruct.planDependent';}}
    for(const o of getPlanObjects()){
      if((o.type==='door'||o.type==='window'||o.type==='dimension')&&ids.has(o.wallId))return'curveReconstruct.planDependent';
      if(o.type==='wall'&&!ids.has(o.id)){if(['a','b'].some(ep=>ids.has(o.attachments?.[ep]?.wallId)))return'curveReconstruct.planDependent';const c=o.constraints||{};if(ids.has(c.reference?.wallId))return'curveReconstruct.planDependent';}
    }
    return null;
  }
  function commitPlanCurveReconstruction(sources,fit){
    if(!sources.length||!fit)return false;const issue=planCurveReconstructionIssue(sources);if(issue){setCommandStatus(t(issue),'error');return false;}
    const first=sources[0],ids=new Set(sources.map(o=>o.id)),thickness=Math.round(median(sources.map(o=>Number(o.thickness)||150))*10)/10,indexes=sources.map(o=>state.objects.indexOf(o)).filter(i=>i>=0),insertAt=indexes.length?Math.min(...indexes):state.objects.length;
    const wall={id:uid('wall'),type:'wall',planRole:'boundary',layerId:first.layerId||'walls',floorId:first.floorId||state.activeFloorId,geometry:'arc',a:{...fit.a},b:{...fit.b},center:{...fit.center},radius:fit.radius,startAngle:fit.startAngle,sweep:fit.sweep,thickness,attachments:{}};
    const recognized=sources.every(o=>o.recognizedFromCad),regions=new Set(sources.map(o=>o.sourceRegionId).filter(Boolean));if(recognized){wall.recognizedFromCad=true;wall.recognitionDetached=true;if(regions.size===1)wall.sourceRegionId=[...regions][0];wall.recognitionSourceIds=[...new Set(sources.flatMap(o=>o.recognitionSourceIds||[]))];}
    pushHistory();state.objects=state.objects.filter(o=>!ids.has(o.id));state.objects.splice(Math.min(insertAt,state.objects.length),0,wall);state.curveReconstruction=null;markDirty(true);rebuildObjectSnapIndex();refreshSpaces();setTool('select','plan');setSelectionIds(new Set([wall.id]));recordEdit('curveReconstruct',{toolset:'plan',sourceIds:[...ids],resultId:wall.id,radius:fit.radius});setCommandStatus(t('curveReconstruct.committedPlan',{count:sources.length}),'strong');updateAll();return true;
  }
  function commitCurveReconstruction(){
    const cr=state.curveReconstruction;if(!cr)return false;const fit=recomputeCurveReconstruction(),sources=curveReconstructionSources();if(!fit){setCommandStatus(t(sources.length?'curveReconstruct.noFit':'curveReconstruct.selectPieces'),'error');updateContextBar();render();return false;}
    return state.toolset==='cad'?commitCadCurveReconstruction(sources,fit):commitPlanCurveReconstruction(sources,fit);
  }
  function drawCurveReconstructionPrimitive(piece,color,width=2,{dash=[],alpha=1}={}){
    if(!piece)return;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.setLineDash(dash);
    if(piece.kind==='line'){const a=toScreenCss(piece.a),b=toScreenCss(piece.b);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    else if(piece.kind==='arc'){const c=toScreenCss(piece.center);ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.5,piece.radius*state.camera.zoom),-rad(piece.startAngle+viewAngle()),-rad(piece.startAngle+piece.sweep+viewAngle()),piece.sweep>=0);ctx.stroke();}
    ctx.restore();
  }
  function drawCurveReconstructionPreview(){
    const cr=state.curveReconstruction;if(state.activeTool!=='reconstruct'||!cr||cr.mode!==state.toolset)return;const styles=getComputedStyle(document.documentElement),accent=styles.getPropertyValue('--accent').trim()||'#3478F6',danger=styles.getPropertyValue('--danger').trim()||'#F85149',hover=styles.getPropertyValue('--hover').trim()||accent,success=styles.getPropertyValue('--success').trim()||accent;
    for(const id of cr.excludedIds){const obj=curveReconstructionObjectById(id),piece=curveReconstructionPiece(obj);if(piece)drawCurveReconstructionPrimitive(piece,danger,2,{dash:[3,4],alpha:.38});}
    for(const id of cr.includedIds){const obj=curveReconstructionObjectById(id),piece=curveReconstructionPiece(obj);if(piece)drawCurveReconstructionPrimitive(piece,accent,4,{dash:[7,4],alpha:.62});}
    if(cr.hoverId&&!cr.includedIds.has(cr.hoverId)){const obj=curveReconstructionObjectById(cr.hoverId),piece=curveReconstructionPiece(obj);if(piece)drawCurveReconstructionPrimitive(piece,hover,2.5,{alpha:.72});}
    const fit=cr.fit;if(!fit)return;drawCurveReconstructionPrimitive({kind:'arc',center:fit.center,radius:fit.radius,startAngle:fit.startAngle,sweep:fit.sweep},success,3,{alpha:.95});ctx.save();ctx.fillStyle=success;for(const p of[fit.a,fit.b]){const q=toScreenCss(p);ctx.fillRect(q.x-3,q.y-3,6,6);}ctx.restore();
  }

  function focusCadModifyDistanceInput(expectedId=null){
    const info=cadCommandSession?.describe?.()||{id:null,phase:'idle'};
    if(!modules.nativeModifyCommands.ids.includes(info.id)||info.phase!=='distance'||(expectedId&&info.id!==expectedId))return false;
    queueMicrotask(()=>{const now=cadCommandSession?.describe?.()||{id:null,phase:'idle'};if(modules.nativeModifyCommands.ids.includes(now.id)&&now.phase==='distance'&&(!expectedId||now.id===expectedId)){dom.commandInput.focus();commandConsole.hideSuggestions();}});
    return true;
  }

  function setTool(tool,category=null){if(state.toolset==='plan'&&['line','wall'].includes(tool))state.toolSettings.planDisplayMode=(state.toolSettings.planDisplayStyle||'solid')!=='solid';
    if(featureFill?.selection.current)return false;
    if(tool==='region'&&featureFill){featureFill.selectRegion();return true;}

    if(state.dragEdit)cancelDirectDrag({status:false});
    if(!['text','mtext','leader','aligned-dim','radius-dim','diameter-dim','angle-dim','continuous-dim','baseline-dim','hatch'].includes(tool))state.annotationDraft=null;
    if(tool!=='reconstruct')state.curveReconstruction=null;
    cadCommandSession?.cancel('tool-change');
    if(!(state.toolset==='cad'&&tool==='line'))cadLineContinuationPoint=null;
    state.stairDraft=null;state.smartGuides=[];state.snapIndicator=null;state.activeTool=tool;state.commandPending=null;const commandMap={stair:'ST',line:'L',polyline:'PL',rectangle:'REC',circle:'C',arc:'A',trim:'TR',extend:'EX',break:'BR',join:'J',offset:'O',fillet:'F',chamfer:'CH',reconstruct:'CR',delete:'E',measure:'DI',move:'M',copy:'CO',rotate:'RO',mirror:'MI',scale:'SC',stretch:'S',array:'AR',align:'AL','region-rotate':'RR',text:'T',mtext:'MT',leader:'LE','aligned-dim':'DLI','radius-dim':'DRA','diameter-dim':'DDI','angle-dim':'DAN','continuous-dim':'DCO','baseline-dim':'DBA',hatch:'H'};state.activeCommand=commandMap[tool]||null;state.spaceHoverPreview=null;state.shiftGuide=null;
    {const catalog=state.toolset==='plan'?planToolCatalog:cadToolCatalog;for(const [group,items] of Object.entries(catalog))if(items.some(item=>item.id===tool)){toolCategoryMemory[state.toolset][group]=tool;break;}}
    if(state.toolset==='cad'&&['line','polyline','rectangle','circle','arc'].includes(tool))ensureActiveCadLayerVisible();
    if(state.toolset==='cad'&&['wall','door','window'].includes(tool)&&!state.cadPlanOverlay){state.cadPlanOverlay=true;renderReferences();}
    if(state.toolset==='cad'&&['line','polyline','rectangle','circle','arc'].includes(tool)&&cadLayerLocked(state.activeCadLayer||'0')){setCommandStatus(t('cadFault.activeLayerLocked'),'error');tool='select';state.activeTool='select';state.activeCommand=null;}
    if(tool!=='constraint')clearConstraintInteraction();if(category&&category!=='plan')state.activeCategory=category;state.stairDraft=null;state.drawStart=null;state.drawReferenceAngle=null;state.arcDraft=null;state.polylinePreview=null;state.cadPrimitivePreview=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;state.calibration=null;state.regionDrag=null;state.wallRecognitionPreview=null;state.snapIndicator=null;state.trimPreview=null;if(tool!=='region-rotate')state.cadRotate=null;host.dataset.tool=tool;dom.toolPopover.hidden=true;
    if(tool==='region-rotate'&&state.toolset==='cad'&&activeCadWorkRegion())beginCadRegionRotation();
    if(tool==='line'&&state.toolset==='cad')startNativeCadLineSession({seed:null});
    if(tool==='polyline'&&state.toolset==='cad')startNativeCadPolylineSession();
    if(state.toolset==='cad'&&['rectangle','circle','arc'].includes(tool))reportCadCommand(cadCommands().start(commandMap[tool]));
    if(tool==='break'&&state.toolset==='cad')reportCadCommand(cadCommands().start('BR'));
    if(tool==='join'&&state.toolset==='cad')reportCadCommand(cadCommands().start('J'));
    if(tool==='offset'&&state.toolset==='cad'){const started=reportCadCommand(cadCommands().start('O'));if(started?.ok)focusCadModifyDistanceInput('O');}
    if(tool==='fillet'&&state.toolset==='cad'){const started=reportCadCommand(cadCommands().start('F'));if(started?.ok)focusCadModifyDistanceInput('F');}
    if(tool==='chamfer'&&state.toolset==='cad'){const started=reportCadCommand(cadCommands().start('CH'));if(started?.ok)focusCadModifyDistanceInput('CH');}
    if(state.toolset==='cad'&&['move','copy','rotate','mirror','scale','stretch','array','align'].includes(tool)){const id=commandMap[tool];reportCadCommand(cadCommands().start(id));}
    if(tool==='reconstruct')beginCurveReconstruction();
    if(state.toolset==='cad'&&tool==='text')beginCadAnnotation('text');
    if(state.toolset==='cad'&&tool==='mtext')beginCadAnnotation('mtext');
    if(state.toolset==='cad'&&tool==='leader')beginCadAnnotation('leader');
    if(state.toolset==='cad'&&tool==='aligned-dim')beginCadAnnotation('alignedDim');
    if(state.toolset==='cad'&&tool==='radius-dim')beginCadAnnotation('radiusDim');
    if(state.toolset==='cad'&&tool==='diameter-dim')beginCadAnnotation('diameterDim');
    if(state.toolset==='cad'&&tool==='angle-dim')beginCadAnnotation('angularDim');
    if(state.toolset==='cad'&&tool==='continuous-dim'&&!beginCadAnnotation('continuousDim')){state.activeTool='select';state.activeCommand=null;host.dataset.tool='select';}
    if(state.toolset==='cad'&&tool==='baseline-dim'&&!beginCadAnnotation('baselineDim')){state.activeTool='select';state.activeCommand=null;host.dataset.tool='select';}
    if(state.toolset==='cad'&&tool==='hatch')beginCadAnnotation('hatch');
    renderToolRail();updateContextBar();renderProperties();render();return state.activeTool===tool;
  }

  function openCategory(category,button){openToolCategory(category,button,cadToolCatalog);}

  function switchToolset(next,{skipMapping=false,historyMode='push',regionId=undefined}={}){
    if(next!==state.toolset&&activeImportJob&&!activeImportJob.committing)cancelImportJob();
    if(next==='cad'&&!skipMapping&&hasSemanticObjects()&&!state.cadMapping&&!state.sourceDxfName&&!state.objects.some(isCadObject)){openMappingDialog('switch-cad');return;}
    if(next!==state.toolset){cadCommandSession?.cancel('mode-change');state.curveReconstruction=null;}
    const previous=state.toolset,sameWorkspace=next===state.toolset&&state.view==='workspace';
    const changed=next!==state.toolset;
    if(next==='cad'){if(regionId!==undefined)state.cadWorkRegionId=state.drawingRegions.some(r=>r.id===regionId)?regionId:null;else if(previous==='plan'){const rid=rememberedCadRegion(activeFloor());state.cadWorkRegionId=state.drawingRegions.some(r=>r.id===rid)?rid:null;}state.cadPlanOverlay=false;}
    state.toolset=next;dom.appShell.classList.toggle('plan-tools',next==='plan');dom.appShell.classList.toggle('cad-tools',next==='cad');dom.planToolsBtn.classList.toggle('active',next==='plan');dom.cadToolsBtn.classList.toggle('active',next==='cad');dom.commandBar.hidden=false;
    if(changed||!(next==='cad'?state.cadSnapIndex:state.planSnapIndex))rebuildObjectSnapIndex({touch:false,scope:next});
    if(changed){state.activeCategory='select';state.activeTool='select';state.activeCommand=null;state.commandPending=null;clearConstraintInteraction();state.drawStart=null;state.drawReferenceAngle=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;state.trimPreview=null;host.dataset.tool='select';dom.toolPopover.hidden=true;}
    if(next==='plan')initializeBuildingNameFromReference();
    updateEmptyState();renderToolRail();renderCadScopeControl();renderPrimaryPanel();renderReferences();renderProperties();updateContextBar();render();showWorkspace({historyMode:sameWorkspace?'none':historyMode});
  }

  function updateEmptyState(){const plan=state.toolset==='plan',compact=isCompactViewer();dom.emptyKicker.hidden=true;dom.emptyTitle.textContent=t(plan?'empty.planTitle':'empty.cadTitle');dom.emptyCopy.textContent=t(compact?'empty.viewerCopy':plan?'empty.planCopy':'empty.cadCopy');dom.emptyPrimaryBtn.hidden=compact;dom.emptyPrimaryBtn.textContent=t(plan?'empty.planPrimary':'empty.cadPrimary');dom.emptyOpenBtn.textContent=t(compact?(plan?'empty.planViewerOpen':'empty.cadViewerOpen'):plan?'empty.planSecondary':'empty.cadSecondary');dom.appShell.classList.toggle('plan-section-inspector',plan);dom.primaryInspectorTab.textContent=t(plan?'tab.sections':'tab.layers');const refTab=document.querySelector('.inspector-tab[data-tab="reference"]');if(refTab){refTab.textContent=t('tab.reference');refTab.hidden=plan;}if(plan&&refTab?.classList.contains('active'))switchInspector('primary');if(dom.primaryPanelTitle)dom.primaryPanelTitle.textContent=t(plan?'panel.sections':'tab.layers');if(dom.primaryPanelSubtitle)dom.primaryPanelSubtitle.textContent='';const refTitle=document.querySelector('[data-panel="reference"] .panel-title'),refSub=document.querySelector('[data-panel="reference"] .panel-subtitle');if(refTitle)refTitle.textContent=t('panel.references');if(refSub)refSub.textContent=t('panel.referencesSub');if(dom.addReferenceBtn)dom.addReferenceBtn.hidden=plan;const showMapping=!plan&&hasSemanticObjects();if(dom.cadMappingCard)dom.cadMappingCard.hidden=!showMapping;if(dom.mappingSettingsBtn)dom.mappingSettingsBtn.hidden=!showMapping;}

  function defaultCadMapping(){return{wallRepresentation:'outline',wallLayer:'WALL',doorLayer:'DOOR',windowLayer:'WINDOW',dimensionLayer:'DIM'};}
  function openMappingDialog(action){const m=state.cadMapping||defaultCadMapping();state.mappingPendingAction=action;dom.wallRepresentation.value=m.wallRepresentation;dom.wallLayerInput.value=m.wallLayer;dom.doorLayerInput.value=m.doorLayer;dom.windowLayerInput.value=m.windowLayer;dom.dimensionLayerInput.value=m.dimensionLayer;dom.mappingBackdrop.hidden=false;setTimeout(()=>dom.wallRepresentation.focus(),0);}
  function applyMapping(){markDirty(true);state.cadMapping={wallRepresentation:dom.wallRepresentation.value,wallLayer:(dom.wallLayerInput.value||'WALL').trim(),doorLayer:(dom.doorLayerInput.value||'DOOR').trim(),windowLayer:(dom.windowLayerInput.value||'WINDOW').trim(),dimensionLayer:(dom.dimensionLayerInput.value||'DIM').trim()};for(const name of Object.values({w:state.cadMapping.wallLayer,d:state.cadMapping.doorLayer,wi:state.cadMapping.windowLayer,di:state.cadMapping.dimensionLayer})){if(!state.cadLayerVisibility.has(name))state.cadLayerVisibility.set(name,true);cadLayerStore?.ensure(name);}touchCadLayer();const action=state.mappingPendingAction;state.mappingPendingAction=null;dom.mappingBackdrop.hidden=true;renderPrimaryPanel();renderProperties();render();if(action==='switch-cad')switchToolset('cad',{skipMapping:true});else if(action==='export')void exportDxfNow();else if(action==='tool'){const p=state.pendingToolAfterMapping;state.pendingToolAfterMapping=null;if(p)setTool(p.tool,p.category);}}
  function cancelMapping(){const action=state.mappingPendingAction;state.mappingPendingAction=null;state.pendingToolAfterMapping=null;dom.mappingBackdrop.hidden=true;if(action==='switch-cad'){dom.planToolsBtn.classList.add('active');dom.cadToolsBtn.classList.remove('active');}}

  function commitCadChanges(label,changes){
    if(state.toolset!=='cad')throw new Error('cad-mode-required');
    for(const c of changes){if(c.before&&!cadPolicy(c.before.id,'modify').allowed)throw new Error('target-not-modifiable');if(c.after&&(cadSourceKind(c.after)!=='cad-source'||cadLayerLocked(cadLayerForObject(c.after))))throw new Error('target-not-modifiable');}
    const afterObjects=changes.filter(c=>c.after).map(c=>c.after);modules.projectStaging.validate({format:'PieniPlan',schemaVersion:PROJECT_SCHEMA,requiredCapabilities:PROJECT_CAPABILITIES(),drawing:{objects:afterObjects}});
    for(const o of afterObjects){if(o.a&&o.b){const cells=[o.a.x,o.a.y,o.b.x,o.b.y].map(v=>Math.floor(v/1000));if(cells.some(v=>!Number.isSafeInteger(v))||(Math.abs(cells[0]-cells[2])+1)*(Math.abs(cells[1]-cells[3])+1)>100000)throw new Error('snap-index-budget-exceeded');}}
    const entry=modules.cadChangeSet.create(label,changes);if(!entry.ops.length)return false;
    
    const previous=state.objects,next=modules.cadChangeSet.apply(entry,state.objects);
    // Validate the proposed document before publication when topology identity is involved.
    if(changes.some(c=>modules.cadPolyline.is(c.before)||modules.cadPolyline.is(c.after)))modules.projectStaging.validate({format:'PieniPlan',schemaVersion:PROJECT_SCHEMA,requiredCapabilities:PROJECT_CAPABILITIES(),drawing:{objects:next}});
    state.objects=next;
    try{rebuildObjectSnapIndex();}catch(error){state.objects=previous;rebuildObjectSnapIndex({touch:false});throw error;}
    appendHistoryEntry(entry);const created=changes.filter(c=>!c.before&&c.after).map(c=>c.after.id);if(created.length)state.lastCadObjectId=created.at(-1);
    markDirty(true);return true;
  }
  function editCadObject(obj,patch,label='properties'){
    if(!obj||!cadPolicy(obj.id,'modify').allowed)return false;
    const before=modules.cadChangeSet.clone(obj),after={...before,...patch};
    const changed=commitCadChanges(label,[{before,after,index:state.objects.indexOf(obj)}]);if(changed)updateAll();return changed;
  }
  function applyCadHistory(entry,inverse){
    if(entry.kind==='cad-layer-change'){
      const expected=inverse?entry.after:entry.before,value=inverse?entry.before:entry.after;
      if(JSON.stringify(cadLayerStore.get(entry.name))!==JSON.stringify(expected))throw new Error('stale-layer-change');
      state.cadLayerDefinitions.set(entry.name,modules.cadChangeSet.clone(value));refreshCadAppearance();touchCadLayer();state.cadRenderRevision++;clearMultiSelection();markDirty(true);return;
    }
    const previous=state.objects;state.objects=modules.cadChangeSet.apply(entry,state.objects,{inverse});
    try{rebuildObjectSnapIndex();}catch(error){state.objects=previous;rebuildObjectSnapIndex({touch:false});throw error;}
    clearMultiSelection();markDirty(true);
  }
  const HISTORY_MAX_ENTRIES=60;
  // Large Plan operations still use full-document snapshots. Keep a bounded retained
  // history budget until those remaining paths are migrated to narrow inverse deltas.
  // The estimate intentionally treats JS string code units as two bytes so a 102k-object
  // project cannot retain ten 16M-character snapshots indefinitely (B61-08).
  const HISTORY_RETENTION_BUDGET_BYTES=96*1024*1024;
  function historyEntryRetentionBytes(entry){
    if(typeof entry==='string')return entry.length*2;
    try{return JSON.stringify(entry).length*2;}catch{return 0;}
  }
  function historyRetentionStats(){
    const past=state.history.reduce((n,e)=>n+historyEntryRetentionBytes(e),0),future=state.future.reduce((n,e)=>n+historyEntryRetentionBytes(e),0);
    return{past,future,total:past+future,budget:HISTORY_RETENTION_BUDGET_BYTES,historyEntries:state.history.length,futureEntries:state.future.length};
  }
  function trimHistoryRetention({budget=HISTORY_RETENTION_BUDGET_BYTES,maxEntries=HISTORY_MAX_ENTRIES}={}){
    while(state.history.length>maxEntries)state.history.shift();
    while(state.future.length>maxEntries)state.future.shift();
    let stats=historyRetentionStats();
    // Remove the farthest reachable state first. Keep at least the nearest one-step
    // Undo/Redo on each side even when a single unusually large snapshot exceeds budget.
    while(stats.total>budget){
      const canPast=state.history.length>1,canFuture=state.future.length>1;
      if(!canPast&&!canFuture)break;
      const pastBytes=canPast?historyEntryRetentionBytes(state.history[0]):-1;
      const futureBytes=canFuture?historyEntryRetentionBytes(state.future[0]):-1;
      if(canFuture&&(!canPast||futureBytes>pastBytes))state.future.shift();else state.history.shift();
      stats=historyRetentionStats();
    }
    return stats;
  }
  function appendHistoryEntry(entry,{clearFuture=true}={}){state.history.push(entry);if(clearFuture)state.future=[];trimHistoryRetention();updateUndoRedo();return entry;}
  function historySnapshot(){return JSON.stringify({cadMapping:state.cadMapping,objects:state.objects,drawingRegions:state.drawingRegions,linkedReferences:state.references.filter(r=>r.type==='linkedCadRegion').map(serializeReference),referenceViews:state.references.map(r=>({id:r.id,visible:r.visible!==false,opacity:Number(r.opacity??.5),scale:Number(r.scale??1),origin:r.origin?{...r.origin}:{x:0,y:0},floorId:r.floorId||null,clip:r.clip?{...r.clip}:null})),cadLayerDefinitions:cadLayerStore?cadLayerStore.serialize():cadLayersModule.serialize(state.cadLayerDefinitions),cadLayerVisibility:[...state.cadLayerVisibility],cadRegionLayerVisibility:serializeCadRegionLayerVisibility(),activeCadLayer:state.activeCadLayer,unitSystem:state.unitSystem,sheets:state.sheets,baseAxisAngle:state.baseAxisAngle,baseAxisWallId:state.baseAxisWallId,dirty:state.dirty,buildings:state.buildings,activeBuildingId:state.activeBuildingId,floors:state.floors,activeFloorId:state.activeFloorId,planLineAppearance:planLineAppearance()});}
  function restoreHistorySnapshot(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed)){state.objects=parsed;state.drawingRegions=[];}else{if(Object.hasOwn(parsed,'cadMapping'))state.cadMapping=parsed.cadMapping;state.objects=parsed.objects||[];state.drawingRegions=parsed.drawingRegions||[];if(Array.isArray(parsed.cadLayerVisibility))state.cadLayerVisibility=new Map(parsed.cadLayerVisibility);restoreCadRegionLayerVisibility(parsed.cadRegionLayerVisibility);state.cadLayerDefinitions=cadLayersModule.synthesize(parsed.cadLayerDefinitions,state.objects,state.cadLayerVisibility);state.unitSystem=parsed.unitSystem==='imperial'?'imperial':'metric';state.sheets=Array.isArray(parsed.sheets)?parsed.sheets:[];if(parsed.planLineAppearance)state.toolSettings.planLineAppearance={...parsed.planLineAppearance};if(parsed.activeCadLayer)state.activeCadLayer=parsed.activeCadLayer;initializeCadServices();state.baseAxisAngle=Number(parsed.baseAxisAngle)||0;state.baseAxisWallId=parsed.baseAxisWallId||null;if('dirty' in parsed)state.dirty=Boolean(parsed.dirty);if(Array.isArray(parsed.buildings)&&parsed.buildings.length)state.buildings=parsed.buildings;if(parsed.activeBuildingId)state.activeBuildingId=parsed.activeBuildingId;if(Array.isArray(parsed.floors)&&parsed.floors.length)state.floors=parsed.floors;if(parsed.activeFloorId)state.activeFloorId=parsed.activeFloorId;if(Array.isArray(parsed.linkedReferences)){const nonLinked=state.references.filter(r=>r.type!=='linkedCadRegion'),linked=parsed.linkedReferences.map(raw=>({...raw,origin:raw.origin?{...raw.origin}:{x:0,y:0},clip:raw.clip?{...raw.clip}:null,layers:Array.isArray(raw.layers)?raw.layers:[],visibleLayers:new Set(Array.isArray(raw.visibleLayers)?raw.visibleLayers:(raw.layers||[]))}));state.references=[...nonLinked,...linked];}if(Array.isArray(parsed.referenceViews)){const byId=new Map(parsed.referenceViews.map(v=>[v.id,v]));for(const r of state.references){const v=byId.get(r.id);if(!v)continue;r.visible=v.visible!==false;r.opacity=Number(v.opacity??r.opacity??.5);r.scale=Number(v.scale??r.scale??1);r.origin=v.origin?{...v.origin}:r.origin;r.floorId=v.floorId||null;r.clip=v.clip?{...v.clip}:null;}}ensureFloorModel();}state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectedRegionId=null;rebuildObjectSnapIndex();refreshSpaces();}
  function pushHistory(){appendHistoryEntry(historySnapshot());}
  function performUndo(){if(!state.history.length)return false;documentWriteEpoch++;const entry=state.history.at(-1);if(['cad-change-set','cad-layer-change'].includes(entry?.kind)){applyCadHistory(entry,true);state.history.pop();state.future.push(entry);}else{const current=historySnapshot();restoreHistorySnapshot(entry);state.history.pop();state.future.push(current);}trimHistoryRetention();updateAll();return true;}
  function performRedo(){if(!state.future.length)return false;documentWriteEpoch++;const entry=state.future.at(-1);if(['cad-change-set','cad-layer-change'].includes(entry?.kind)){applyCadHistory(entry,false);state.future.pop();state.history.push(entry);}else{const current=historySnapshot();restoreHistorySnapshot(entry);state.future.pop();state.history.push(current);}trimHistoryRetention();updateAll();return true;}
  function undo(){cadCommandSession?.cancel('undo');return performUndo();}
  function redo(){cadCommandSession?.cancel('redo');return performRedo();}
  function updateUndoRedo(){dom.undoBtn.disabled=!state.history.length;dom.redoBtn.disabled=!state.future.length;}

  function commitSegment(a,b,type){
    if(distance(a,b)<.001)return null;
    pushHistory();
    let obj;
    const isPlanDisplay=state.toolset==='plan'&&state.toolSettings.planDisplayMode&&type==='line';const semanticPlanEdge=state.toolset==='plan'&&(type==='line'||type==='wall')&&!isPlanDisplay;
    if(semanticPlanEdge){
      // Plan Mode exposes one drawing primitive: a semantic floor-plan edge. Internally it
      // remains a wall-compatible object so rooms, openings, topology and DXF export share
      // one geometry model instead of diverging Line vs Wall behavior.
      obj={id:uid('wall'),type:'wall',planRole:'boundary',lineStyle:'solid',layerId:'walls',a:{...a},b:{...b},thickness:currentWallThickness(),geometry:'straight',attachments:{},floorId:state.activeFloorId};
    }else if(type==='wall'){
      obj={id:uid('wall'),type:'wall',layerId:'walls',a:{...a},b:{...b},thickness:currentWallThickness(),geometry:'straight',attachments:{},floorId:state.activeFloorId};
    }else{
      obj={id:uid('cadLine'),type:state.toolset==='cad'?'cadLine':'line',cadLayer:state.activeCadLayer||'0',layerId:'drawing',a:{...a},b:{...b},...(isPlanDisplay?{planRole:'display',lineStyle:state.toolSettings.planDisplayStyle||'dashed',geometry:'straight'}:{})};
      if(obj.type==='cadLine'){state.cadLayerVisibility.set(obj.cadLayer,true);cadLayerStore?.ensure(obj.cadLayer);}else obj.floorId=state.activeFloorId;
    }
    state.objects.push(obj);
    if(obj.type==='wall'){
      repairPersistentPlanJunctions(obj.floorId||state.activeFloorId);
      refreshSpaces();
    }
    if(state.toolset==='plan'){state.selectedObjectId=null;state.selectedObjectIds.clear();state.hoveredObjectId=null;}else{state.selectedObjectId=obj.id;state.selectedObjectIds=new Set([obj.id]);}state.drawStart={...obj.b};state.drawReferenceAngle=obj.type==='wall'&&!isArcWall(obj)?angleDeg(obj.a,obj.b):null;state.previewEnd={...obj.b};markDirty(true);rebuildObjectSnapIndex();updateAll();return obj;
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
      if(o.type!=='line'||!o.floorId||(o.planRole==='display'&&(o.lineStyle||'solid')!=='solid'))continue;
      o.type='wall';o.id=o.id||uid('wall');o.planRole='boundary';o.layerId='walls';o.thickness=Number(o.thickness)||state.toolSettings.wallThickness||150;o.geometry=o.geometry==='arc'?'arc':'straight';o.lineStyle='solid';o.attachments=o.attachments||{};changed=true;
    }
    if(changed)for(const floor of state.floors||[])repairPersistentPlanJunctions(floor.id);
    return changed;
  }
  function syncDependentsOfWall(parentId,visited=new Set()){if(visited.has(parentId))return;visited.add(parentId);const parent=state.objects.find(o=>o.id===parentId&&o.type==='wall');if(!parent)return;for(const wall of getPlanObjects()){if(wall.type!=='wall'||wall.id===parentId)continue;let changed=false;for(const endpoint of['a','b']){const att=wall.attachments?.[endpoint];if(att?.wallId===parentId){if(att.kind==='coincident'&&att.targetEndpoint&&parent[att.targetEndpoint]){wall[endpoint]={...parent[att.targetEndpoint]};att.t=att.targetEndpoint==='a'?0:1;}else solvePointOnEdgeAttachment(wall,endpoint,parent);changed=true;}}const c=ensureWallConstraints(wall);if(c.reference?.wallId===parentId){enforceWallConstraints(wall);changed=true;}if(changed)syncDependentsOfWall(wall.id,visited);}refreshSpaces();}
  function detachWallBodyTopology(wall){
    if(!wall||wall.type!=='wall')return 0;
    // Body drag means rigid object translation, not junction editing. The moved wall keeps hosted
    // semantic elements (doors/windows/dimensions) because they are parametric on wallId/t, while
    // wall-to-wall topology is detached so neighboring geometry never stretches or follows.
    let detached=0;
    wall.attachments=wall.attachments||{};
    for(const endpoint of ['a','b'])if(wall.attachments[endpoint]){delete wall.attachments[endpoint];detached++;}
    for(const other of getPlanObjects()){
      if(other.type!=='wall'||other.id===wall.id)continue;
      for(const endpoint of ['a','b'])if(other.attachments?.[endpoint]?.wallId===wall.id){delete other.attachments[endpoint];detached++;}
    }
    return detached;
  }
  function syncCoincidentNodeOnly(parentId,targetEndpoint,point,{excludeId=null}={}){
    if(!parentId||!['a','b'].includes(targetEndpoint)||!point)return;
    for(const wall of getPlanObjects()){
      if(wall.type!=='wall'||wall.id===parentId||wall.id===excludeId)continue;
      for(const endpoint of ['a','b']){
        const att=wall.attachments?.[endpoint];
        if(att?.wallId!==parentId||att.kind!=='coincident'||att.targetEndpoint!==targetEndpoint)continue;
        wall[endpoint]={...point};att.t=targetEndpoint==='a'?0:1;
      }
    }
  }

  function detectClosedWallFaces(){
    const revision=state.cadRenderRevision||0,floorId=state.activeFloorId,cache=state.spaceFaceCache;
    if(cache&&cache.revision===revision&&cache.floorId===floorId)return cache.faces;
    const walls=getPlanObjects().filter(o=>o.type==='wall');if(walls.length<2){state.spaceFaceCache={revision,floorId,faces:[]};return[];}
    const segments=[];for(const w of walls)for(const seg of sampleWallSegments(w,{maxAngle:8,maxLength:280}))segments.push({id:`${w.id}:${seg.t0}`,wallId:w.id,a:seg.a,b:seg.b});
    const faces=detectFacesFromSegments(segments,{minArea:10000,ignoreInteriorCrossings:false,connectNearJunctions:true});state.spaceFaceCache={revision,floorId,faces};return faces;
  }
  function detectFacesFromSegments(segments,{minArea=10000,maxArea=Infinity,snapTol=3,ignoreInteriorCrossings=false,connectNearJunctions=false}={}){
    if(!segments?.length)return[];const splits=new Map(segments.map(seg=>[seg.id,new Set([0,1])]));
    for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){const x=segmentIntersection(segments[i].a,segments[i].b,segments[j].a,segments[j].b);if(!x)continue;if(ignoreInteriorCrossings){const e=.012,meaningful=x.t<=e||x.t>=1-e||x.u<=e||x.u>=1-e;if(!meaningful)continue;}splits.get(segments[i].id).add(x.t);splits.get(segments[j].id).add(x.u);}
    const tol=Math.max(.5,snapTol),nodes=new Map(),adj=new Map(),edgeWall=new Map(),cells=new Map();
    // Space topology only: split endpoint-on-edge junctions, including collinear overlap.
    // Keep the existing 3mm tolerance; source wall coordinates remain untouched.
    if(connectNearJunctions)for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){
      for(const [source,target] of [[segments[i],segments[j]],[segments[j],segments[i]]])for(const p of [source.a,source.b]){
        const dx=target.b.x-target.a.x,dy=target.b.y-target.a.y,len2=dx*dx+dy*dy;if(len2<1e-16)continue;
        const t=clamp(((p.x-target.a.x)*dx+(p.y-target.a.y)*dy)/len2,0,1),q={x:target.a.x+dx*t,y:target.a.y+dy*t};
        if(distance(p,q)<=tol)splits.get(target.id).add(t);
      }
    }
    const nodeFor=p=>{
      if(!connectNearJunctions){const k=`${Math.round(p.x/tol)},${Math.round(p.y/tol)}`;if(!nodes.has(k))nodes.set(k,{x:Math.round(p.x/tol)*tol,y:Math.round(p.y/tol)*tol});if(!adj.has(k))adj.set(k,new Set());return k;}
      const gx=Math.floor(p.x/tol),gy=Math.floor(p.y/tol);let best=null,bestDistance=tol+1e-9;
      for(let x=gx-1;x<=gx+1;x++)for(let y=gy-1;y<=gy+1;y++)for(const k of cells.get(`${x},${y}`)||[]){const d=distance(p,nodes.get(k));if(d<=tol&&d<bestDistance){best=k;bestDistance=d;}}
      if(best!==null)return best;
      const k=String(nodes.size),cell=`${gx},${gy}`;nodes.set(k,{...p});adj.set(k,new Set());if(!cells.has(cell))cells.set(cell,[]);cells.get(cell).push(k);return k;
    };
    for(const seg of segments){const ts=[...splits.get(seg.id)].sort((a,b)=>a-b);for(let i=1;i<ts.length;i++){if(ts[i]-ts[i-1]<1e-8)continue;const p1={x:seg.a.x+(seg.b.x-seg.a.x)*ts[i-1],y:seg.a.y+(seg.b.y-seg.a.y)*ts[i-1]},p2={x:seg.a.x+(seg.b.x-seg.a.x)*ts[i],y:seg.a.y+(seg.b.y-seg.a.y)*ts[i]},a=nodeFor(p1),b=nodeFor(p2);if(a===b)continue;adj.get(a).add(b);adj.get(b).add(a);const edgeKey=[a,b].sort().join('|');if(!edgeWall.has(edgeKey))edgeWall.set(edgeKey,new Set());edgeWall.get(edgeKey).add(seg.wallId||seg.id);}}
    for(const[k,set]of adj){const p0=nodes.get(k);adj.set(k,[...set].sort((ka,kb)=>{const a=nodes.get(ka),b=nodes.get(kb);return Math.atan2(a.y-p0.y,a.x-p0.x)-Math.atan2(b.y-p0.y,b.x-p0.x);}));}
    const visited=new Set(),faces=[];for(const[u,neighbors]of adj)for(const v0 of neighbors){const start=`${u}>${v0}`;if(visited.has(start))continue;let a=u,b=v0,poly=[],wallIds=new Set(),guard=0,closed=false;while(guard++<4000){const dir=`${a}>${b}`;if(visited.has(dir)&&dir!==start)break;visited.add(dir);poly.push(nodes.get(a));for(const id of edgeWall.get([a,b].sort().join('|'))||[])wallIds.add(id);const list=adj.get(b)||[],idx=list.indexOf(a);if(idx<0||!list.length)break;const c=list[(idx-1+list.length)%list.length];a=b;b=c;if(`${a}>${b}`===start){closed=true;break;}}if(!closed||poly.length<3)continue;const area=polygonArea(poly);if(area>minArea&&area<maxArea)faces.push({polygon:poly,area,wallIds:[...wallIds].filter(Boolean)});}
    const unique=[];for(const f of faces.sort((a,b)=>a.area-b.area)){const c=polygonCentroid(f.polygon);if(unique.some(u=>Math.abs(u.area-f.area)/Math.max(f.area,1)<.015&&distance(c,polygonCentroid(u.polygon))<20))continue;unique.push(f);}return unique;
  }
  function faceAtPoint(p){return detectClosedWallFaces().find(f=>pointInPolygon(p,f.polygon))||null;}
  function updateSpaceHoverPreview(p){if(state.toolset!=='plan'||state.activeTool!=='space'){state.spaceHoverPreview=null;return;}const face=faceAtPoint(p);if(!face){state.spaceHoverPreview=null;return;}const existing=state.objects.find(o=>o.type==='space'&&objectOnActiveFloor(o)&&o.polygon?.length&&pointInPolygon(p,o.polygon));state.spaceHoverPreview={face,existingId:existing?.id||null};}
  function drawSpaceHoverPreview(){const hp=state.spaceHoverPreview;if(!hp||state.toolset!=='plan'||state.activeTool!=='space'||!hp.face?.polygon?.length)return;const styles=getComputedStyle(document.documentElement),color=hp.existingId?styles.getPropertyValue('--selection').trim():styles.getPropertyValue('--accent').trim();ctx.save();ctx.fillStyle=color;ctx.strokeStyle=color;ctx.globalAlpha=.10;ctx.beginPath();hp.face.polygon.forEach((q,i)=>{const s=toScreenCss(q);if(i===0)ctx.moveTo(s.x,s.y);else ctx.lineTo(s.x,s.y);});ctx.closePath();ctx.fill();ctx.globalAlpha=.72;ctx.setLineDash([6,4]);ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);const c=toScreenCss(polygonCentroid(hp.face.polygon));const existing=hp.existingId&&state.objects.find(o=>o.id===hp.existingId),text=existing?t('space.hoverExisting',{name:existing.name||t('space.unnamed')}):t('space.hoverCandidate');ctx.font='11px system-ui';const tw=ctx.measureText(text).width,bg=styles.getPropertyValue('--canvas').trim();ctx.globalAlpha=.94;ctx.fillStyle=bg;ctx.fillRect(c.x-tw/2-7,c.y-11,tw+14,22);ctx.globalAlpha=1;ctx.fillStyle=color;ctx.fillText(text,c.x-tw/2,c.y+4);ctx.restore();}
  function pointToSegmentDistance(p,a,b){return projectPointToSegment(p,a,b).distance;}
  function endpointTouchesOtherBoundary(wall,endpoint,walls,tol=6){const p=wall?.[endpoint];if(!p)return false;for(const other of walls){if(other.id===wall.id)continue;const pr=wallProjectPoint(p,other);if(pr.distance<=tol)return true;}return false;}
  function findSpaceBoundaryGapCandidates(p,{maxGap=900,limit=8,touchTol=6}={}){
    const walls=getPlanObjects().filter(o=>o.type==='wall'),raw=[];for(const wall of walls)for(const endpoint of['a','b']){if(wall.attachments?.[endpoint])continue;if(endpointTouchesOtherBoundary(wall,endpoint,walls,touchTol))continue;const a=wall[endpoint];let best=null;for(const other of walls){if(other.id===wall.id)continue;const pr=wallProjectPoint(a,other),d=pr.distance;if(d<=touchTol||d>maxGap)continue;if(!best||d<best.distance)best={a:{...a},b:{...pr.point},distance:d,wallId:wall.id,otherWallId:other.id,endpoint,targetT:pr.t};}if(best){best.score=pointToSegmentDistance(p,best.a,best.b)*.08+best.distance;raw.push(best);}}
    const unique=[];for(const g of raw.sort((a,b)=>a.score-b.score)){if(unique.some(u=>(u.wallId===g.otherWallId&&u.otherWallId===g.wallId)||(distance(u.a,g.a)<touchTol&&distance(u.b,g.b)<touchTol)))continue;unique.push(g);if(unique.length>=limit)break;}return unique;
  }
  function refreshSpaces(){const spaces=state.objects.filter(o=>o.type==='space'&&objectOnActiveFloor(o));if(!spaces.length)return;const faces=detectClosedWallFaces();for(const space of spaces){const face=faces.find(f=>pointInPolygon(space.seed||polygonCentroid(space.polygon||[]),f.polygon));if(face){space.polygon=face.polygon.map(p=>({...p}));space.wallIds=[...face.wallIds];space.areaM2=face.area/1e6;space.invalid=false;}else space.invalid=true;}}
  function commitSpace(p){const face=faceAtPoint(p);if(!face){const candidates=findSpaceBoundaryGapCandidates(p);state.spaceGapDiagnostic={origin:{...p},candidates};setCommandStatus(candidates.length?t('space.openBoundaryDiagnostic',{count:candidates.length}):t('space.openBoundaryUnknown'),'error');render();return;}clearSpaceGapDiagnostic({silent:true});const existing=state.objects.find(o=>o.type==='space'&&objectOnActiveFloor(o)&&o.polygon?.length&&pointInPolygon(p,o.polygon));if(existing){state.spaceHoverPreview=null;selectOnly(existing.id);renderPrimaryPanel();renderProperties();render();return;}pushHistory();const floor=activeFloor(),obj={id:uid('space'),type:'space',layerId:'spaces',spaceUuid:makeStableUuid(),name:nextSpaceName(floor?.id),spaceType:'unspecified',floorId:floor?.id||state.activeFloorId,seed:{...p},polygon:face.polygon.map(q=>({...q})),wallIds:[...face.wallIds],areaM2:face.area/1e6,managedAreaM2:null,managedAreaSource:null,areaMode:'calculated',manualAreaM2:null,invalid:false};state.objects.push(obj);state.spaceHoverPreview=null;selectOnly(obj.id);markDirty(true);updateAll();}
  function commitOpening(kind,projection){if(!projection){alert(t('alert.noWallForOpening'));return;}pushHistory();const width=kind==='door'?state.toolSettings.doorWidth:state.toolSettings.windowWidth,obj={id:uid(kind),type:kind,layerId:kind==='door'?'doors':'windows',wallId:projection.wall.id,t:projection.t,width};if(kind==='door'){obj.doorType=state.toolSettings.doorType||'hingedSingle';obj.hinge='start';obj.swing=1;obj.swingSide=1;obj.slideDirection=1;if(obj.doorType==='fireDoor'){obj.elementKind='door';obj.fireProtection='fireDoor';obj.fireRating=null;}else if(obj.doorType==='fireShutter'){obj.elementKind='fireShutter';obj.fireProtection='fireShutter';obj.fireRating=null;}}state.objects.push(obj);state.selectedObjectId=obj.id;state.selectedObjectIds=new Set([obj.id]);markDirty(true);rebuildObjectSnapIndex();updateAll();}
  let planArcSnapTree=null;
  function planArcGeometry(w){return {id:w.id,type:'cadArc',center:{...w.center},radius:w.radius,startAngle:w.startAngle,sweep:w.sweep};}
  function collectObjectSnapPoints(objects=state.objects){
    const pts=[];for(const o of objects||[]){
      if(modules.cadPolyline.is(o)){for(const q of modules.cadPolyline.snapPoints(o))pts.push(q);continue;}
      if((o.type==='wall'&&isArcWall(o))||isPlanDisplayArc(o)){for(const u of [0,1,.5])pts.push({...isPlanDisplayArc(o)?cadArcPointAt(o,u):wallPointAt(o,u),objectId:o.id,kind:u===.5?'midpoint':'endpoint'});}
      if(o.center)pts.push({x:o.center.x,y:o.center.y,objectId:o.id,kind:'center'});
      if(o.type==='cadArc'){for(const t of[0,.5,1]){const ap=cadArcPointAt(o,t);pts.push({...ap,objectId:o.id,kind:t===.5?'midpoint':'endpoint'});}}
      if(o.type==='component'){for(const q of componentLibrary.snapPoints(o))pts.push({...q,objectId:o.id,kind:'endpoint'});}
      else if(o.point)pts.push({x:o.point.x,y:o.point.y,objectId:o.id,kind:'point'});
      if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);if(g)pts.push({...g.p1,objectId:o.id,kind:'opening'},{...g.p2,objectId:o.id,kind:'opening'},{...g.center,objectId:o.id,kind:'center'});}
      if(o.type==='dimension'){const g=dimensionGeometry(o);if(g)pts.push({...g.p1,objectId:o.id,kind:'dimension'},{...g.p2,objectId:o.id,kind:'dimension'});}
    }return pts;
  }
  function snapIndexForObjects(objects,{cad=false}={}){
    const segments=[];let objectOrder=0;for(const o of objects||[]){objectOrder++;if(o.a&&o.b&&((cad&&cadSourceObject(o))||(!cad&&((o.type==='line'&&!isPlanDisplayArc(o))||(o.type==='wall'&&!isArcWall(o))))))segments.push({a:{...o.a},b:{...o.b},layer:cadLayerForObject(o),objectId:o.id,objectOrder});}
    const idx=buildSegmentSnapIndex(segments),extras=collectObjectSnapPoints(objects);
    const addPoint=q=>{const gx=Math.floor(q.x/idx.cellW),gy=Math.floor(q.y/idx.cellH),key=`${gx},${gy}`;if(!idx.cells.has(key))idx.cells.set(key,[]);idx.cells.get(key).push(q);};
    for(const q of extras)addPoint(q);return(idx.cells.size||idx.segments.length)?idx:null;
  }
  function rebuildObjectSnapIndex({touch=true,scope=null}={}){
    if(state.toolset==='cad')state.trimPreview=null;
    planGeometryCache={source:null,revision:-1,count:-1};
    state.cadRenderRevision=(state.cadRenderRevision||0)+1;
    const target=scope||state.toolset||'plan',buildPlan=target==='plan'||target==='all',buildCad=target==='cad'||target==='all';
    if(buildCad){if(!cadContext)initializeCadServices();else cadContext.rebuild();if(touch)touchCadGeometry();const cadObjects=state.objects.filter(cadSourceObject),components=componentObjectsForCad();modules.cadPolyline.retain(cadObjects);state.cadSnapIndex=snapIndexForObjects([...cadObjects,...components],{cad:true});cadQueryIndex=modules.cadQueryIndex.create(cadObjects,state.cadSnapIndex||buildSegmentSnapIndex([]),cadBroadGeometry,id=>cadContext.getById(id));refreshCadAppearance();}
    if(buildPlan){const planObjects=getPlanObjects();state.planSnapIndex=snapIndexForObjects(planObjects,{cad:false});planArcSnapTree=modules.cadSpatialTree.create(planObjects.filter(o=>(o.type==='wall'&&isArcWall(o))||isPlanDisplayArc(o)).map(o=>({o,b:cadGeometry.bounds(planArcGeometry(o))})));}
    state.objectSnapIndex=state.toolset==='cad'?state.cadSnapIndex:state.planSnapIndex;
  }
  function queryObjectSnapIndex(p,threshold,test,{index=null,candidateAllowed=null}={}){
    const idx=index||state.objectSnapIndex;if(!idx)return;const allowed=item=>!candidateAllowed||candidateAllowed(item)!==false;const gx=Math.floor(p.x/idx.cellW),gy=Math.floor(p.y/idx.cellH),rx=Math.max(1,Math.ceil(threshold/idx.cellW)),ry=Math.max(1,Math.ceil(threshold/idx.cellH)),segments=new Map();
    for(let dx=-rx;dx<=rx;dx++)for(let dy=-ry;dy<=ry;dy++){const key=`${gx+dx},${gy+dy}`;for(const q of idx.cells.get(key)||[]){if(!allowed(q))continue;if(distance(p,q)<=threshold)test(q);}for(const seg of idx.segmentCells?.get(key)||[]){if(!allowed(seg))continue;if(pointSegmentDistance(p,seg.a,seg.b)<=threshold)segments.set(seg.index,seg);}}
    if(state.toolset==='cad'&&idx===state.cadSnapIndex){const rect={minx:p.x-threshold,maxx:p.x+threshold,miny:p.y-threshold,maxy:p.y+threshold},list=cadQueryCandidates(rect,'snap').filter(o=>o.id!==null&&cadGeometry.hitDistance(o,p)<=threshold&&o.type!=='cadText');for(const o of list)if(modules.cadPolyline.is(o))for(const q of cadGeometry.intersections(o,o,undefined,rect))if(distance(p,q)<=threshold)test({...q,kind:'intersection',objectIds:[o.id]});for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)for(const q of cadGeometry.intersections(list[i],list[j],undefined,rect))if(distance(p,q)<=threshold)test({...q,kind:'intersection',objectIds:[list[i].id,list[j].id]});return;}
    if(state.toolset==='plan'&&idx===state.planSnapIndex){const rect={minx:p.x-threshold,maxx:p.x+threshold,miny:p.y-threshold,maxy:p.y+threshold},arcs=(planArcSnapTree?.query(rect)||[]).map(x=>x.o).filter(o=>o.id!==null),lines=[...segments.values()];for(let i=0;i<arcs.length;i++){const a=arcs[i];if(!allowed({objectId:a.id}))continue;for(const b of lines){if(!allowed(b))continue;for(const q of cadGeometry.intersections(planArcGeometry(a),b))if(distance(p,q)<=threshold)test({...q,kind:'intersection',objectIds:[a.id,b.objectId]});}for(let j=i+1;j<arcs.length;j++)if(allowed({objectId:arcs[j].id}))for(const q of cadGeometry.intersections(planArcGeometry(a),planArcGeometry(arcs[j])))if(distance(p,q)<=threshold)test({...q,kind:'intersection',objectIds:[a.id,arcs[j].id]});}}
    const list=[...segments.values()];for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){if(list[i].objectId&&list[i].objectId===list[j].objectId)continue;const x=segmentIntersection(list[i].a,list[i].b,list[j].a,list[j].b);if(x&&distance(p,x.point)<=threshold)test({...x.point,kind:'intersection',objectIds:[list[i].objectId,list[j].objectId].filter(Boolean)});}
  }

  function nearestSnap(p,excludeObjectId=null,base=null){
    state.snapIndicator=null;state.smartGuides=[];if(!state.snap||temporarySnapOverride())return p;const pixels=modules.precision.radius[state.snapSensitivity]||10,threshold=pixels/state.camera.zoom,candidates=[];let best=null,bestD=threshold;
    const test=(q,kind=q.kind||'endpoint',source='plan')=>{if(excludeObjectId&&(q.objectId===excludeObjectId||q.objectIds?.includes(excludeObjectId)))return;if(distance(p,q)>threshold)return;candidates.push({...q,kind,source,objectId:q.objectId||null,ownerId:q.ownerId||q.objectId||null});bestD=Math.min(bestD,distance(p,q));};
    const activeIndex=state.toolset==='cad'?state.cadSnapIndex:state.planSnapIndex;
    if(activeIndex)queryObjectSnapIndex(p,threshold,q=>test(q,q.kind,state.toolset==='cad'?'cad':'plan'),{index:activeIndex,candidateAllowed:state.toolset==='cad'?(item=>{const ids=item.objectIds||[item.objectId].filter(Boolean);return ids.every(id=>cadPolicy(id,'snap').allowed);}):null});
    const wantsWallProjection=state.activeTool==='wall'||(state.dragEdit&&state.objects.find(o=>o.id===state.dragEdit.objectId)?.type==='wall'&&['a','b'].includes(state.dragEdit.mode));
    if(wantsWallProjection){for(const wall of getPlanObjects()){if(wall.type!=='wall'||wall.id===excludeObjectId)continue;const pr=wallProjectPoint(p,wall);if(pr.distance<=threshold)test({...pr.point,objectId:wall.id},'wall','plan');}}
    const allowReferenceSnap=state.toolset!=='plan'||state.ctrlDown;
    if(allowReferenceSnap){for(const ref of referencesForRender()){
      if(ref.type==='dxf'&&ref.snapIndex){const local=referenceWorldToLocal(ref,p),lt=threshold/Math.max(.000001,ref.scale),visible=layer=>!ref.visibleLayers||ref.visibleLayers.has(layer),insideClip=q=>!ref.clip||(q.x>=ref.clip.minx&&q.x<=ref.clip.maxx&&q.y>=ref.clip.miny&&q.y<=ref.clip.maxy);queryReferenceSnapIndex(ref.snapIndex,local,lt,visible,(q,kind)=>{if(!insideClip(q))return;const w=referenceLocalToWorld(ref,q);test({...w,objectId:null},kind,'reference');});}
      else if(ref.type==='linkedCadRegion'){const region=state.drawingRegions.find(r=>r.id===ref.regionId);if(!region)continue;const idx=getLinkedCadRenderCache(ref,region).snapIndex,visible=layer=>cadLayerVisible(layer,region.id);queryReferenceSnapIndex(idx,p,threshold,visible,(q,kind)=>test({...q,objectId:null},kind,'reference'),base);}
    }}
    if(state.toolset==='cad'&&cadQueryIndex){
      const rect={minx:p.x-threshold,maxx:p.x+threshold,miny:p.y-threshold,maxy:p.y+threshold},owners=cadQueryIndex.polyCandidates(rect).filter(o=>o.id!==excludeObjectId&&cadPolicy(o.id,'snap').allowed);
      if(base)for(const o of owners)for(const q of cadGeometry.projectPerpendicular(o,base,rect))test({...q,objectId:o.id},'perpendicular','cad');
      if(!candidates.length)for(const o of owners){const q=cadGeometry.projectNearest(o,p);if(q)test({...q.point,objectId:o.id,ownerId:o.id,edgeId:q.edgeId,parameter:q.parameter},'nearest','cad');}
    }
    best=modules.precision.choose(p,candidates,state.camera.zoom,pixels);updateSmartGuides(best||p,base,excludeObjectId);
    if(best){state.snapIndicator=best;return{x:best.x,y:best.y};}return p;
  }
  function temporarySnapOverride(){return Boolean(state.altDown&&(state.dragEdit||['line','wall','polyline','rectangle','circle','arc','move','copy','rotate','mirror','scale','stretch','array','align','region-rotate','measure','stair','floor-refine'].includes(state.activeTool)));}
  function updateSmartGuides(point,base=null,exclude=null){
    state.smartGuides=[];if(temporarySnapOverride()||!state.snap||!point)return;
    const start=base||state.drawStart||state.dragEdit?.snapshot?.a||state.measureStart;
    if(!start&&!['extend','floor-refine'].includes(state.activeTool))return;
    const idx=state.toolset==='cad'?state.cadSnapIndex:state.planSnapIndex;if(!idx)return;
    const span=160/state.camera.zoom,x=Math.floor(point.x/idx.cellW),y=Math.floor(point.y/idx.cellH),rx=Math.min(8,Math.max(1,Math.ceil(span/idx.cellW))),ry=Math.min(8,Math.max(1,Math.ceil(span/idx.cellH))),anchors=[];
    for(let i=x-rx;i<=x+rx;i++)for(let j=y-ry;j<=y+ry;j++)for(const q of idx.cells.get(`${i},${j}`)||[]){if(q.objectId===exclude||distance(point,q)>span)continue;if(state.toolset==='cad'&&!cadPolicy(q.objectId,'snap').allowed)continue;if(anchors.length<400)anchors.push(q);}
    const selected=state.dragEdit?.snapshot,angle=selected?.a&&selected?.b?angleDeg(selected.a,selected.b):state.drawReferenceAngle;
    state.smartGuides=modules.precision.guides(point,anchors,{base:start,angle,tolerance:(modules.precision.radius[state.snapSensitivity]||10)/state.camera.zoom});
  }
  function drawSmartGuides(){
    if(!state.smartGuides?.length||isCompactViewer())return;ctx.save();ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--success').trim()||'#3aa76d';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=1.3;ctx.setLineDash([5,4]);ctx.font='11px system-ui';for(const g of state.smartGuides){const a=toScreenCss(g.a),b=toScreenCss(g.b);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.fillText(t('guide.'+g.kind),b.x+10,b.y+18);}ctx.restore();
  }
  function effectiveOrtho(){return state.toolset==='plan'?Boolean(state.ortho):(Boolean(state.ortho)!==Boolean(state.shiftDown));}
  function snapDirectionToStep(start,p,base,step=45){const dx=p.x-start.x,dy=p.y-start.y,len=Math.hypot(dx,dy);if(len<1e-9)return p;const ang=angleDeg(start,p),relative=angleDelta(ang,base),snapped=Math.round(relative/step)*step,a=rad(base+snapped);return{x:start.x+Math.cos(a)*len,y:start.y+Math.sin(a)*len};}
  function normalize180(a){let v=((Number(a)||0)%180+180)%180;return v;}
  function nearestAngleCandidate(start,p,candidates){const len=distance(start,p);if(len<1e-9)return{point:p,angle:null,source:null};const pointer=angleDeg(start,p),seen=new Map();for(const c of candidates||[]){if(!Number.isFinite(c.angle))continue;const a=((c.angle%360)+360)%360,key=Math.round(a*1000)/1000;if(!seen.has(key))seen.set(key,{...c,angle:a});}let best=null,bestDiff=Infinity;for(const c of seen.values()){const diff=Math.abs(angleDelta(pointer,c.angle));if(diff<bestDiff){bestDiff=diff;best=c;}}if(!best)return{point:p,angle:null,source:null};const a=rad(best.angle);return{point:{x:start.x+Math.cos(a)*len,y:start.y+Math.sin(a)*len},angle:best.angle,source:best.source||'GLOBAL'};}
  function angleFamily(base,step,source){const out=[];for(let a=0;a<360;a+=step)out.push({angle:base+a,source});return out;}
  function connectedWallAngles(wall){const out=[];if(!wall||wall.type!=='wall')return out;for(const ep of['a','b']){const att=wall.attachments?.[ep],parent=att&&state.objects.find(o=>o.id===att.wallId&&o.type==='wall');if(parent&&!isArcWall(parent))out.push(angleDeg(parent.a,parent.b));}for(const child of getPlanObjects().filter(o=>o.type==='wall'&&o.id!==wall.id&&!isArcWall(o))){let related=false;for(const ep of['a','b'])if(child.attachments?.[ep]?.wallId===wall.id)related=true;const tol=3;for(const p of [wall.a,wall.b]){if(distance(child.a,p)<=tol||distance(child.b,p)<=tol)related=true;else{const pr=wallProjectPoint(p,child);if(pr.distance<=tol&&pr.t>1e-6&&pr.t<1-1e-6)related=true;}}for(const p of [child.a,child.b]){const pr=wallProjectPoint(p,wall);if(pr.distance<=tol&&pr.t>1e-6&&pr.t<1-1e-6)related=true;}if(related)out.push(angleDeg(child.a,child.b));}return [...new Set(out.map(normalize180))];}
  function constrainTracking(start,p){
    if(!start)return p;const base=baseAxisAngle(),dx=p.x-start.x,dy=p.y-start.y,len=Math.hypot(dx,dy);if(len<1e-9)return p;
    // Build53: Shift uses the same rich 45-degree family in both Plan and CAD authoring.
    // CAD keeps F8 ORTHO as the explicit 90-degree toggle; holding Shift while drawing
    // LINE/PLINE instead snaps to the nearest global 45-degree family and, when a Base
    // Axis exists, the Base-Axis-relative 45-degree family. This makes the temporary
    // constraint predictable without silently changing persistent ORTHO/POLAR state.
    if(state.shiftDown&&((state.toolset==='plan'&&state.activeTool==='line')||(state.toolset==='cad'&&(state.activeTool==='line'||state.activeTool==='polyline')))){
      const candidates=[...angleFamily(0,45,'GLOBAL')];
      if(state.toolset==='plan'&&Number.isFinite(state.drawReferenceAngle))candidates.push(...angleFamily(state.drawReferenceAngle,45,'REF'));
      if(Math.abs(base)>1e-7)candidates.push(...angleFamily(base,45,'AXIS'));
      const picked=nearestAngleCandidate(start,p,candidates);state.shiftGuide=picked.angle==null?null:{angle:picked.angle,source:picked.source};return picked.point;
    }
    if(effectiveOrtho()){const a=rad(base),ux=Math.cos(a),uy=Math.sin(a),vx=-uy,vy=ux,du=dx*ux+dy*uy,dv=dx*vx+dy*vy;return Math.abs(du)>=Math.abs(dv)?{x:start.x+ux*du,y:start.y+uy*du}:{x:start.x+vx*dv,y:start.y+vy*dv};}
    if(state.polar){const ang=angleDeg(start,p),relative=angleDelta(ang,base),step=45,snapped=Math.round(relative/step)*step,diff=Math.abs(angleDelta(relative,snapped));if(diff<=7){const a=rad(base+snapped);return{x:start.x+Math.cos(a)*len,y:start.y+Math.sin(a)*len};}}
    return p;
  }
  function constrainOrtho(start,p){return constrainTracking(start,p);}
  function constrainEndpointWithShift(src,endpoint,p){
    if(!src?.a||!src?.b||!['a','b'].includes(endpoint))return p;const anchor=endpoint==='a'?src.b:src.a,current=angleDeg(anchor,endpoint==='a'?src.a:src.b),candidates=[{angle:current,source:'CURRENT'},...angleFamily(0,45,'GLOBAL')];for(const a of [angleDeg(src.a,src.b),...connectedWallAngles(src)])candidates.push(...angleFamily(a,45,'REF'));const base=baseAxisAngle();if(Math.abs(base)>1e-7)candidates.push(...angleFamily(base,45,'AXIS'));const picked=nearestAngleCandidate(anchor,p,candidates);state.shiftGuide=picked.angle==null?null:{angle:picked.angle,source:picked.source};return picked.point;
  }
  function constrainEndpointToOriginalAngle(src,endpoint,p){return constrainEndpointWithShift(src,endpoint,p);}
  function constrainBodyMoveDelta(src,delta){if(!state.shiftDown||!src?.a||!src?.b)return delta;const len=Math.hypot(delta.x,delta.y);if(len<1e-9)return delta;const candidates=[{angle:0,source:'GLOBAL'},{angle:90,source:'GLOBAL'},{angle:180,source:'GLOBAL'},{angle:270,source:'GLOBAL'}];for(const a of [angleDeg(src.a,src.b),...connectedWallAngles(src)]){candidates.push({angle:a,source:'REF'},{angle:a+90,source:'REF'},{angle:a+180,source:'REF'},{angle:a+270,source:'REF'});}const picked=nearestAngleCandidate({x:0,y:0},{x:delta.x,y:delta.y},candidates);state.shiftGuide=picked.angle==null?null:{angle:picked.angle,source:picked.source};return picked.point;}

  function planDrawReferenceAt(raw,point){
    if(state.toolset!=='plan')return null;if(temporarySnapOverride()||!state.snap)return {point,angle:null};let wall=null;
    const snapId=state.snapIndicator?.objectId;if(snapId)wall=state.objects.find(o=>o.id===snapId&&o.type==='wall');
    if(!wall){let bestD=(modules.precision.radius[state.snapSensitivity]||10)/state.camera.zoom;for(const w of getPlanObjects().filter(o=>o.type==='wall')){const pr=wallProjectPoint(raw,w);if(pr.distance<bestD){bestD=pr.distance;wall=w;point={...pr.point};}}}
    if(!wall)return{point,angle:null};const pr=wallProjectPoint(point,wall),tan=wallTangentAt(wall,pr.t);return{point:state.snapIndicator?{...point}:{...pr.point},angle:deg(Math.atan2(tan.uy,tan.ux))};
  }

  function hitHandle(p,obj){const tol=9/state.camera.zoom;if(!obj)return null;if(modules.cadPolyline.is(obj)&&obj.vertices.length<=500){for(let i=0;i<obj.vertices.length;i++)if(distance(p,obj.vertices[i])<=tol)return`poly:${i}`;}if((obj.type==='wall'||obj.type==='line'||obj.type==='cadLine')&&obj.a&&obj.b){if(distance(p,obj.a)<=tol)return'a';if(distance(p,obj.b)<=tol)return'b';if(obj.type==='wall'&&isArcWall(obj)&&distance(p,arcControlPoint(obj))<=tol)return'arcControl';}if(obj.type==='door'||obj.type==='window'){const g=openingGeometry(obj);if(g){if(distance(p,g.p1)<=tol)return'p1';if(distance(p,g.p2)<=tol)return'p2';if(distance(p,g.center)<=tol)return'center';}}if(obj.type==='dimension'){const g=dimensionGeometry(obj);if(g){if(!g.associated){if(distance(p,g.p1)<=tol)return'p1';if(distance(p,g.p2)<=tol)return'p2';}const c={x:(g.d1.x+g.d2.x)/2,y:(g.d1.y+g.d2.y)/2};if(distance(p,c)<=tol)return'offset';}}return null;}
  function objectBodyDistance(p,o){if(o.type==='component')return componentLibrary.hitDistance(o,p);if(state.toolset==='cad'&&cadSourceObject(o))return cadGeometry.hitDistance(o,p);if(o.type==='door'){const g=openingGeometry(o);if(!g)return Infinity;const type=o.doorType||'hingedSingle';if(isHingedDoorType(type)){const sectors=doorSwingSectors(o);if(sectors.some(s=>pointInDoorSwingSector(p,s)))return 0;let d=pointSegmentDistance(p,g.p1,g.p2);for(const s of sectors)d=Math.min(d,pointSegmentDistance(p,s.hinge,s.leafEnd),Math.abs(distance(p,s.hinge)-s.width));return d;}return pointSegmentDistance(p,g.p1,g.p2);}if(o.type==='window'){const g=openingGeometry(o);return g?pointSegmentDistance(p,g.p1,g.p2):Infinity;}if(o.type==='dimension'){const g=dimensionGeometry(o);return g?pointSegmentDistance(p,g.d1,g.d2):Infinity;}if(o.type==='space')return o.polygon?.length&&pointInPolygon(p,o.polygon)?0:Infinity;if(o.type==='stair')return o.polygon?.length&&pointInPolygon(p,o.polygon)?0:Infinity;if(o.type==='cadCircle')return Math.abs(distance(p,o.center)-o.radius);if(o.type==='cadArc'||isPlanDisplayArc(o))return projectPointToCadArc(p,o).distance;if(o.type==='wall'&&isArcWall(o)){const d=wallProjectPoint(p,o).distance;return state.toolset==='plan'?d:Math.max(0,d-(o.thickness||150)/2);}if(o.a&&o.b){let d=pointSegmentDistance(p,o.a,o.b);if(o.type==='wall'&&state.toolset!=='plan')d=Math.max(0,d-(o.thickness||150)/2);return d;}return Infinity;}
  function hitObjectsAt(p){const tolerance=modules.geometryQuery.tolerance.world(modules.geometryQuery.tolerance.clickPixels,state.camera.zoom),spaceHits=[],hits=[],objects=state.toolset==='plan'?getPlanObjects():[...cadQueryCandidates({minx:p.x-tolerance,maxx:p.x+tolerance,miny:p.y-tolerance,maxy:p.y+tolerance}),...componentObjectsForCad(),...(state.cadPlanOverlay?cadPlanOverlayObjects().filter(o=>cadPolicy(o.id,'select').allowed):[])];for(let i=objects.length-1;i>=0;i--){const o=objects[i],d=objectBodyDistance(p,o);if(o.type==='space'){if(d===0)spaceHits.push({o,d:0,order:i});continue;}if(d<tolerance)hits.push({o,d,order:i});}hits.sort((a,b)=>a.d-b.d||b.order-a.order);return hits.length?hits.map(x=>x.o):spaceHits.map(x=>x.o);}
  function hitObject(p){return hitObjectsAt(p)[0]||null;}
  function cycleHitObject(p){const list=hitObjectsAt(p);if(!list.length){state.overlapCycle=null;return null;}const tol=modules.geometryQuery.tolerance.world(5,state.camera.zoom),prior=state.overlapCycle,same=prior&&distance(prior.point,p)<=tol&&prior.ids.length===list.length&&prior.ids.every((id,i)=>id===list[i].id),index=same?(prior.index+1)%list.length:0;state.overlapCycle={point:{...p},ids:list.map(o=>o.id),index};return list[index];}
  function pointSegmentDistance(p,a,b){return projectPointToSegment(p,a,b).distance;}
  function doorDirectManipulationMode(p,obj){
    if(!obj||obj.type!=='door')return null;const h=hitHandle(p,obj);if(h==='p1'||h==='p2')return h;const g=openingGeometry(obj);if(!g)return null;const frameTol=Math.max((g.wall.thickness||150)/2,12/state.camera.zoom);if(pointSegmentDistance(p,g.p1,g.p2)<=frameTol)return'center';const type=obj.doorType||'hingedSingle';if(isHingedDoorType(type)){const strokeTol=10/state.camera.zoom;for(const sec of doorSwingSectors(obj)){if(pointSegmentDistance(p,sec.hinge,sec.leafEnd)<=strokeTol||(pointInDoorSwingSector(p,sec)&&Math.abs(distance(p,sec.hinge)-sec.width)<=strokeTol))return'body';}if(doorSwingSectors(obj).some(sec=>pointInDoorSwingSector(p,sec)))return'select';return null;}if(isFireShutterDoorType(type))return'select';return objectBodyDistance(p,obj)<9/state.camera.zoom?'body':null;
  }

  function captureDragCancelState(){return{workspace:historySnapshot(),history:[...state.history],future:[...state.future],selectionIds:[...state.selectedObjectIds],selectedObjectId:state.selectedObjectId,selectedReferenceId:state.selectedReferenceId,selectedRegionId:state.selectedRegionId};}
  function beginObjectDrag(e,p,obj,forcedMode=null){
    if(obj?.type==='space')return false;if(state.toolset==='cad'&&!cadObjectModifiable(obj))return false;const handle=hitHandle(p,obj),mode=forcedMode||handle||'body',cancelState=captureDragCancelState();state.dragEdit={pointerId:e.pointerId,objectId:obj.id,mode,start:{...p},snapshot:JSON.parse(JSON.stringify(obj)),historyPushed:false,cancelState};canvas.setPointerCapture?.(e.pointerId);host.dataset.drag='true';return true;
  }
  function beginCopyDrag(e,p,obj){
    if(!obj||obj.type==='space')return false;if(state.toolset==='cad'&&!cadObjectModifiable(obj))return false;const cancelState=captureDragCancelState();if(modules.cadPolyline.is(obj)){pushHistory();const copy=cloneCadPolylineWithFreshIds(obj);state.objects.push(copy);setSelectionIds(new Set([copy.id]));state.dragEdit={pointerId:e.pointerId,objectId:copy.id,mode:'body',start:{...p},snapshot:JSON.parse(JSON.stringify(copy)),historyPushed:true,copyCreated:true,cancelState};canvas.setPointerCapture?.(e.pointerId);host.dataset.drag='true';markDirty(true);rebuildObjectSnapIndex();renderPrimaryPanel();renderProperties();render();return true;}pushHistory();const copy=JSON.parse(JSON.stringify(obj));copy.id=uid(obj.type);delete copy.recognizedFromCad;delete copy.sourceRegionId;delete copy.recognitionSourceIds;delete copy.recognitionConfidence;delete copy.recognitionBaselineSignature;delete copy.recognitionDetached;if(copy.type==='wall')copy.attachments={};state.objects.push(copy);setSelectionIds(new Set([copy.id]));state.dragEdit={pointerId:e.pointerId,objectId:copy.id,mode:(copy.type==='door'||copy.type==='window')?'center':'body',start:{...p},snapshot:JSON.parse(JSON.stringify(copy)),historyPushed:true,copyCreated:true,cancelState};canvas.setPointerCapture?.(e.pointerId);host.dataset.drag='true';markDirty(true);rebuildObjectSnapIndex();renderPrimaryPanel();renderProperties();render();return true;
  }
  function ensureDragHistory(){if(state.dragEdit&&!state.dragEdit.historyPushed){pushHistory();state.dragEdit.historyPushed=true;}}
  function moveChildrenWithWall(wallId,dx,dy){/* openings are parametric on the wall and move with it automatically */}
  function applyObjectDrag(p){const d=state.dragEdit;if(!d)return;const obj=cadContext?.getById(d.objectId)||state.objects.find(o=>o.id===d.objectId);if(!obj)return;if(state.toolset==='cad'&&!cadObjectModifiable(obj,{notify:false}))return;const src=d.snapshot,rawDelta={x:p.x-d.start.x,y:p.y-d.start.y},delta=(d.mode==='body'&&['wall','line','cadLine'].includes(obj.type))?constrainBodyMoveDelta(src,rawDelta):rawDelta;
    if(modules.cadPolyline.is(obj)&&String(d.mode).startsWith('poly:')){const index=Number(String(d.mode).slice(5));if(!Number.isInteger(index)||!src.vertices[index])return;const vertices=src.vertices.map(v=>({id:v.id,x:v.x,y:v.y,...(v.outgoing?{outgoing:{id:v.outgoing.id,bulge:v.outgoing.bulge}}:{})}));vertices[index].x=p.x;vertices[index].y=p.y;const prev=index>0?vertices[index-1]:(src.closed?vertices.at(-1):null),next=index<vertices.length-1?vertices[index+1]:(src.closed?vertices[0]:null);if((prev&&distance(prev,vertices[index])<1e-7)||(next&&distance(next,vertices[index])<1e-7))return;const candidate={...src,vertices};try{modules.cadPolyline.validate(candidate);}catch(_){return;}ensureDragHistory();obj.vertices=vertices;modules.cadPolyline.invalidate(obj);markDirty(true);rebuildObjectSnapIndex();renderProperties();render();return;}
    ensureDragHistory();
    if(modules.cadPolyline.is(obj)&&d.mode==='body'){obj.vertices=src.vertices.map(v=>({id:v.id,x:v.x+delta.x,y:v.y+delta.y,...(v.outgoing?{outgoing:{id:v.outgoing.id,bulge:v.outgoing.bulge}}:{})}));modules.cadPolyline.invalidate(obj);}
    else if(obj.type==='component'&&src.point){obj.point={x:src.point.x+delta.x,y:src.point.y+delta.y};}
    else if((obj.type==='wall'||obj.type==='line'||obj.type==='cadLine')&&src.a&&src.b){
      if(obj.type==='wall'&&isArcWall(src)&&d.mode==='arcControl'){obj.a={...src.a};obj.b={...src.b};applyArcFromControl(obj,p);}
      else if(d.mode==='a'){const q=(state.toolset==='plan'&&state.shiftDown&&!isArcWall(src))?constrainEndpointToOriginalAngle(src,'a',p):p;obj.a={...q};if(obj.type==='wall'&&isArcWall(src)){const control=wallPointAt(src,.5);applyArcFromControl(obj,control);}else if(isPlanDisplayArc(src)){const control=cadArcPointAt(src,.5),arc=circleFromThreePoints(obj.a,obj.b,control);if(arc)Object.assign(obj,arc);else Object.assign(obj,structuredClone(src));}}
      else if(d.mode==='b'){const q=(state.toolset==='plan'&&state.shiftDown&&!isArcWall(src))?constrainEndpointToOriginalAngle(src,'b',p):p;obj.b={...q};if(obj.type==='wall'&&isArcWall(src)){const control=wallPointAt(src,.5);applyArcFromControl(obj,control);}else if(isPlanDisplayArc(src)){const control=cadArcPointAt(src,.5),arc=circleFromThreePoints(obj.a,obj.b,control);if(arc)Object.assign(obj,arc);else Object.assign(obj,structuredClone(src));}}
      else{obj.a={x:src.a.x+delta.x,y:src.a.y+delta.y};obj.b={x:src.b.x+delta.x,y:src.b.y+delta.y};if((obj.type==='wall'&&isArcWall(src))||isPlanDisplayArc(src)){obj.center={x:src.center.x+delta.x,y:src.center.y+delta.y};}}
      if(obj.type==='wall'){
        // SNAP is only a placement aid. Persistent endpoint relationships live in attachments/constraints.
        // Build60 direct-manipulation grammar: body drag is rigid object translation and detaches
        // wall-to-wall topology; endpoint drag is the explicit junction-edit gesture and preserves it.
        if(d.mode==='body')detachWallBodyTopology(obj);
        else if(src.attachments)obj.attachments=JSON.parse(JSON.stringify(src.attachments));
        if((d.mode==='a'||d.mode==='b')&&obj.attachments?.[d.mode]){
          const att=obj.attachments[d.mode],parent=state.objects.find(o=>o.id===att.wallId&&o.type==='wall');
          if(parent){
            if(att.kind==='coincident'&&att.targetEndpoint&&parent[att.targetEndpoint]){
              // A shared corner is one persistent junction. Dragging either side's endpoint
              // moves the common node instead of visually pulling the two walls apart.
              const q=(state.toolset==='plan'&&state.shiftDown&&!isArcWall(src))?constrainEndpointToOriginalAngle(src,d.mode,p):p,parentArcControl=isArcWall(parent)?wallPointAt(parent,.5):null,parentEndpointBefore={...parent[att.targetEndpoint]};
              parent[att.targetEndpoint]={...q};if(parentArcControl&&!applyArcFromControl(parent,parentArcControl))parent[att.targetEndpoint]=parentEndpointBefore;att.t=att.targetEndpoint==='a'?0:1;obj[d.mode]={...parent[att.targetEndpoint]};syncDependentsOfWall(parent.id);
            }else{
              const requested=(state.toolset==='plan'&&state.shiftDown&&!isArcWall(src))?constrainEndpointToOriginalAngle(src,d.mode,p):p;
              const pr=wallProjectPoint(requested,parent);att.t=pr.t;obj[d.mode]={...pr.point};
            }
          }
        }
        // Translation preserves the selected wall's own angle/length constraints by construction.
        // Body drag deliberately leaves neighboring walls where they were; endpoint drag remains
        // the topology-aware junction-edit path and may propagate the edited shared endpoint.
        if(d.mode!=='body'){enforceWallConstraints(obj,{changed:d.mode==='a'?'a':'b'});syncDependentsOfWall(obj.id);}refreshSpaces();
      }
    }
    else if(obj.type==='stair'){obj.polygon=src.polygon.map(q=>({x:q.x+delta.x,y:q.y+delta.y}));}
    else if(obj.type==='door'||obj.type==='window'){
      const wall=state.objects.find(o=>o.id===obj.wallId&&o.type==='wall');if(wall){const pr=wallProjectPoint(p,wall);
        if(d.mode==='center'){obj.t=pr.t;}
        else if(d.mode==='body'&&obj.type==='door'){
          const tg=wallTangentAt(wall,src.t??.5),dx=p.x-d.start.x,dy=p.y-d.start.y,along=dx*tg.ux+dy*tg.uy,across=dx*(-tg.uy)+dy*tg.ux,threshold=14/state.camera.zoom;
          if(!d.gestureResolved&&Math.max(Math.abs(along),Math.abs(across))>=threshold){
            const type=src.doorType||'hingedSingle';
            if(isHingedDoorType(type)){
              obj.swingSide=doorSwingSide(src);obj.hinge=src.hinge||'start';syncLegacyDoorSwing(obj);
              if(Math.abs(across)>Math.abs(along)){flipDoorSwingSide(obj);d.gestureResolved='swing';}
              else if(!isDoubleLeafDoorType(type)){flipDoorHingePreserveSide(obj);d.gestureResolved='hinge';}
            }else if(Math.abs(along)>=Math.abs(across)){obj.slideDirection=src.slideDirection===-1?1:-1;d.gestureResolved='slide';}
          }
        }
        else if(d.mode==='body'){obj.t=pr.t;}
        else if(d.mode==='p1'||d.mode==='p2'){const g0=openingGeometry(src);if(g0){const opposite=d.mode==='p1'?g0.p2:g0.p1,pp=wallProjectPoint(p,wall),po=wallProjectPoint(opposite,wall),len=wallLength(wall);obj.t=clamp((pp.t+po.t)/2,0,1);obj.width=Math.max(100,Math.abs(pp.t-po.t)*len);}}
      }
    }
    else if(obj.type==='dimension'){const g0=dimensionGeometry(src);if(g0){if(g0.associated){const base={x:(g0.p1.x+g0.p2.x)/2,y:(g0.p1.y+g0.p2.y)/2};obj.offset=(p.x-base.x)*g0.nx+(p.y-base.y)*g0.ny;}else if(d.mode==='p1')obj.p1={...p};else if(d.mode==='p2')obj.p2={...p};else if(d.mode==='offset'){const base={x:(obj.p1.x+obj.p2.x)/2,y:(obj.p1.y+obj.p2.y)/2},v={x:obj.p2.x-obj.p1.x,y:obj.p2.y-obj.p1.y},len=Math.max(.000001,Math.hypot(v.x,v.y)),nx=-v.y/len,ny=v.x/len;obj.offset=(p.x-base.x)*nx+(p.y-base.y)*ny;}else{obj.p1={x:g0.p1.x+delta.x,y:g0.p1.y+delta.y};obj.p2={x:g0.p2.x+delta.x,y:g0.p2.y+delta.y};}}}
    markDirty(true);rebuildObjectSnapIndex();renderProperties();render();}


  function updatePointerAffordance(p){state.pointerAffordance=null;if(state.activeTool!=='select'||state.dragEdit||isCompactViewer()){delete host.dataset.affordance;return;}const selected=state.objects.find(o=>o.id===state.selectedObjectId);if(selected&&selectionIds().size===1){if(selected.type==='door'){const mode=doorDirectManipulationMode(p,selected);if(mode==='p1'||mode==='p2')state.pointerAffordance='resize';else if(mode==='center')state.pointerAffordance='move';else if(mode==='body')state.pointerAffordance='offset';}else{const h=hitHandle(p,selected);if(h){if((selected.type==='wall'||selected.type==='line'||selected.type==='cadLine')&&(h==='a'||h==='b'))state.pointerAffordance='endpoint';else if(selected.type==='wall'&&h==='arcControl')state.pointerAffordance='offset';else if((selected.type==='door'||selected.type==='window')&&(h==='p1'||h==='p2'))state.pointerAffordance='resize';else if(selected.type==='dimension'&&h==='offset')state.pointerAffordance='offset';else state.pointerAffordance='move';}}}if(!state.pointerAffordance&&hitObject(p))state.pointerAffordance='move';if(state.pointerAffordance)host.dataset.affordance=state.pointerAffordance;else delete host.dataset.affordance;}
  function updateHover(p){if(state.activeTool!=='select'||state.dragEdit||isCompactViewer()||(state.toolset==='cad'&&cadSelectableObjects().length>5000)){state.hoveredObjectId=null;host.dataset.hover='false';updatePointerAffordance(p);return;}const o=hitObject(p);state.hoveredObjectId=o?.id||null;host.dataset.hover=state.hoveredObjectId?'true':'false';updatePointerAffordance(p);}

  function beginViewerPointer(e,s){state.viewerPointers.set(e.pointerId,s);canvas.setPointerCapture?.(e.pointerId);if(state.viewerPointers.size===1){state.pan={pointerId:e.pointerId,startScreen:s,startCamera:{...state.camera}};host.dataset.pan='true';}else if(state.viewerPointers.size===2){const pts=[...state.viewerPointers.values()],c={x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2},dist=Math.max(1,Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y));state.viewerGesture={startDistance:dist,startCenter:c,startCamera:{...state.camera},startZoom:state.camera.zoom,worldAtCenter:screenCssToWorld(c)};state.pan=null;}}
  function moveViewerPointer(e,s){if(!state.viewerPointers.has(e.pointerId))return false;state.viewerPointers.set(e.pointerId,s);if(state.viewerPointers.size>=2&&state.viewerGesture){const pts=[...state.viewerPointers.values()].slice(0,2),c={x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2},dist=Math.max(1,Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y)),g=state.viewerGesture;state.camera.zoom=clamp(g.startZoom*(dist/g.startDistance),.002,8);const after=screenCssToWorld(c);state.camera.cx+=g.worldAtCenter.x-after.x;state.camera.cy+=g.worldAtCenter.y-after.y;render();return true;}if(state.pan&&state.pan.pointerId===e.pointerId){const dx=(s.x-state.pan.startScreen.x)/state.camera.zoom,dy=(s.y-state.pan.startScreen.y)/state.camera.zoom;const v=modules.floorAlignment.inverse({x:-dx,y:dy},{version:1,x:0,y:0,rotation:viewAngle()});state.camera.cx=state.pan.startCamera.cx+v.x;state.camera.cy=state.pan.startCamera.cy+v.y;render();return true;}return true;}
  function endViewerPointer(e){state.viewerPointers.delete(e.pointerId);if(state.viewerPointers.size<2)state.viewerGesture=null;if(!state.viewerPointers.size){state.pan=null;host.dataset.pan='false';}try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}return true;}

  function onPointerMove(e){state.altDown=Boolean(e.altKey);state.lastCanvasPointer={clientX:e.clientX,clientY:e.clientY,pointerId:e.pointerId,buttons:e.buttons,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey,altKey:e.altKey};if(featureFill?.pointerMove(e))return;state.shiftDown=Boolean(e.shiftKey);if(state.toolset==='plan')state.ctrlDown=Boolean(e.ctrlKey);const s=fromPointerEvent(e);let p=screenCssToWorld(s);state.cursorWorld=p;dom.statusX.textContent=`X ${state.toolset==='cad'?cadLengthText(p.x,{precision:1}):formatNumber(p.x,1)}`;dom.statusY.textContent=`Y ${state.toolset==='cad'?cadLengthText(p.y,{precision:1}):formatNumber(p.y,1)}`;if(dom.statusUnits)dom.statusUnits.textContent=state.toolset==='cad'?(state.unitSystem==='imperial'?'ft/in':'mm'):'mm';
    if(isCompactViewer()&&moveViewerPointer(e,s))return;
    if(state.referenceClipDraft){const ref=state.references.find(r=>r.id===state.referenceClipDraft.refId);if(ref){state.referenceClipDraft.current=referenceWorldToLocal(ref,p);render();return;}}
    if(state.regionDrag&&state.regionDrag.pointerId===e.pointerId){state.regionDrag.current={...p};render();return;}
    if(state.selectionDrag&&state.selectionDrag.pointerId===e.pointerId){state.selectionDrag.current={...p};updateSelectionDragPreview();render();return;}
    if(state.pan){const dx=(s.x-state.pan.startScreen.x)/state.camera.zoom,dy=(s.y-state.pan.startScreen.y)/state.camera.zoom;const v=modules.floorAlignment.inverse({x:-dx,y:dy},{version:1,x:0,y:0,rotation:viewAngle()});state.camera.cx=state.pan.startCamera.cx+v.x;state.camera.cy=state.pan.startCamera.cy+v.y;render();return;}
    if(state.dragEdit){const dragged=cadContext?.getById(state.dragEdit.objectId)||state.objects.find(o=>o.id===state.dragEdit.objectId);applyObjectDrag((dragged?.type==='door'||dragged?.type==='window')?p:nearestSnap(p,state.dragEdit.objectId));return;}
    if(state.activeTool==='region-rotate'&&state.toolset==='cad'&&state.cadRotate){updateCadRotatePointer(p,{shift:e.shiftKey});state.hoveredObjectId=null;render();return;}
    if(state.activeTool==='line'&&state.toolset==='cad'){
      if(startNativeCadLineSession()){reportCadCommand(cadCommands().preview({point:p,shift:Boolean(e.shiftKey)}));const view=cadCommands().view;if(view?.phase==='start')state.previewEnd=nearestSnap(p);}
      state.hoveredObjectId=null;render();return;
    }
    if(state.toolset==='cad'&&cadCommandSession?.activeId==='PL'){reportCadCommand(cadCommands().preview({point:p,shift:Boolean(e.shiftKey)}));updateContextBar();render();return;}
    if(state.toolset==='cad'&&modules.nativeDrawCommands.ids.includes(cadCommandSession?.activeId)){reportCadCommand(cadCommands().preview({point:p,shift:Boolean(e.shiftKey)}));render();return;}
    if(state.toolset==='cad'&&modules.nativeTransformCommands.ids.includes(cadCommandSession?.activeId)){reportCadCommand(cadCommands().preview({point:p,shift:Boolean(e.shiftKey)}));render();return;}
    if(state.toolset==='cad'&&modules.nativeModifyCommands.ids.includes(cadCommandSession?.activeId)){reportCadCommand(cadCommands().preview({point:p,shift:Boolean(e.shiftKey)}));render();return;}
    if(state.activeTool==='reconstruct'&&state.curveReconstruction){const obj=hitObject(p);state.curveReconstruction.hoverId=curveReconstructionEligibleObject(obj)?obj.id:null;state.hoveredObjectId=null;render();return;}
    if(state.activeTool==='constraint')updateConstraintHover(p);else updateHover(p);
    if(state.activeTool==='space')updateSpaceHoverPreview(p);else state.spaceHoverPreview=null;
    if(['trim','extend'].includes(state.activeTool))updateTrimPreview(p,{shift:Boolean(e.shiftKey)});else state.trimPreview=null;
    if(state.activeTool==='door'||state.activeTool==='window')state.previewOpening=nearestWallProjection(p);else state.previewOpening=null;
    const start=state.drawStart||state.measureStart||state.calibration?.p1;if(start)p=constrainOrtho(start,nearestSnap(p));else p=nearestSnap(p);state.previewEnd=p;if(state.trimPreview?.kind==='extend'&&state.toolset==='plan')updateSmartGuides(state.trimPreview.b,state.trimPreview.a,state.trimPreview.targetId);render();}

  function placeComponent(point){
    const asset=componentLibrary.get(state.activeComponentAssetId);if(!asset||!point)return false;
    const floor=state.toolset==='cad'?(cadPlanFloor()||activeFloor()):activeFloor();
    pushHistory();
    const obj={id:uid('component'),type:'component',layerId:'components',floorId:floor?.id||state.activeFloorId,assetId:asset.id,point:{x:point.x,y:point.y},rotation:0,mirrorX:false,mirrorY:false,scaleX:1,scaleY:1};
    state.objects.push(obj);selectOnly(obj.id);markDirty(true);rebuildObjectSnapIndex({scope:'all'});updateAll();setCommandStatus(t('component.placed',{name:componentLibrary.label(asset,i18n.language)}),'strong');return obj;
  }
  function editComponent(obj,patch,label='COMPONENT'){
    if(!obj||obj.type!=='component')return false;if(state.toolset==='cad'&&!cadPolicy(obj.id,'modify').allowed)return false;
    pushHistory();Object.assign(obj,patch);markDirty(true);rebuildObjectSnapIndex({scope:'all'});recordEdit('component',{objectId:obj.id,label});updateAll();return true;
  }
  function rotateComponent90(obj){return editComponent(obj,{rotation:((Number(obj.rotation)||0)+90)%360},'rotate90');}
  function mirrorComponent(obj,axis){return editComponent(obj,axis==='y'?{mirrorY:!obj.mirrorY}:{mirrorX:!obj.mirrorX},axis==='y'?'mirrorY':'mirrorX');}

  function onPointerDown(e){state.altDown=Boolean(e.altKey);if(featureFill?.pointerDown(e))return;host.focus();hideContextMenu();state.shiftDown=Boolean(e.shiftKey);if(state.toolset==='plan')state.ctrlDown=Boolean(e.ctrlKey);const s=fromPointerEvent(e);if(isCompactViewer()){if(e.button===0||e.pointerType==='touch'){e.preventDefault();beginViewerPointer(e,s);}return;}const panGesture=e.button===1||(e.button===0&&state.spaceDown);if(panGesture){e.preventDefault();if(state.spaceGesture)state.spaceGesture.used=true;state.pan={pointerId:e.pointerId,startScreen:s,startCamera:{...state.camera}};host.dataset.pan='true';canvas.setPointerCapture?.(e.pointerId);return;}const ctrlSnapClick=state.toolset==='plan'&&e.ctrlKey&&['line','wall','measure','move','copy','trim','extend'].includes(state.activeTool);if(e.button!==0&&!(ctrlSnapClick&&e.button===2))return;if(ctrlSnapClick)e.preventDefault();const editableLabel=hitEditableLabel(s);if(editableLabel)return;let raw=screenCssToWorld(s),p=nearestSnap(raw);
    if(state.referenceClipDraft){handleReferenceClipPoint(raw);return;}
    if(state.activeTool==='stair'&&state.toolset==='plan'){if(!state.stairDraft){state.stairDraft={...p};state.previewEnd={...p};setCommandStatus(t('stair.second'),'strong');render();}else if(!commitStair(state.stairDraft,p))setCommandStatus(t('stair.invalid'),'error');return;}
    if(state.activeTool==='component'){placeComponent(p);return;}
    if(state.toolset==='cad'&&['text','mtext','leader','aligned-dim','radius-dim','diameter-dim','angle-dim','continuous-dim','baseline-dim'].includes(state.activeTool)){handleCadAnnotationPoint(raw);return;}
    if(state.toolset==='cad'&&state.activeTool==='hatch'){commitCadHatchAt(raw);return;}
    if(state.activeTool==='region'&&state.toolset==='cad'){state.regionDrag={pointerId:e.pointerId,start:{...raw},current:{...raw}};canvas.setPointerCapture?.(e.pointerId);render();return;}
    if(state.toolset==='cad'&&cadCommandSession?.activeId==='PL'){const result=reportCadCommand(cadCommands().dispatch({type:'point',point:raw,shift:Boolean(e.shiftKey)}));updateContextBar();render();return result;}
    if(state.toolset==='cad'&&modules.nativeDrawCommands.ids.includes(cadCommandSession?.activeId)){const result=reportCadCommand(cadCommands().dispatch({type:'point',point:raw,shift:Boolean(e.shiftKey)}));if(result?.ok&&String(result.code||'').startsWith('committed')){setTool('select','select');setCommandStatus(t('command.finished'),'strong');}else render();return result;}
    if(state.toolset==='cad'&&modules.nativeTransformCommands.ids.includes(cadCommandSession?.activeId))return reportCadCommand(cadCommands().dispatch({type:'point',point:raw,shift:Boolean(e.shiftKey)}));
    if(state.toolset==='cad'&&modules.nativeModifyCommands.ids.includes(cadCommandSession?.activeId))return reportCadCommand(cadCommands().dispatch({type:'point',point:raw,shift:Boolean(e.shiftKey)}));
    if(state.toolset==='cad'&&cadCommandSession?.activeId==='MA'){return reportCadCommand(cadCommands().dispatch({type:'object',objectId:hitObject(raw)?.id}));}
    if(state.activeTool==='reconstruct'){const obj=hitObject(raw);if(obj)toggleCurveReconstructionObject(obj);return;}
    if(state.activeTool==='constraint'&&state.toolset==='plan'){handleConstraintCanvasClick(raw);return;}
    if(state.calibration){if(!state.calibration.p1){state.calibration.p1=p;state.previewEnd=p;updateContextBar();render();}else{state.calibration.p2=p;openCalibrationDialog();}return;}
    if(state.activeTool==='region-rotate'&&state.toolset==='cad'&&state.cadRotate){reportCadCommand(cadCommands().dispatch({type:'point',point:raw,shift:Boolean(e.shiftKey)}));updateContextBar();render();return;}
    if(state.activeTool==='line'&&state.toolset==='cad'){if(!startNativeCadLineSession())return;const result=reportCadCommand(cadCommands().dispatch({type:'point',point:raw,shift:Boolean(e.shiftKey)}));updateContextBar();render();return result;}
    if(state.activeTool==='select'){const selected=cadContext?.getById(state.selectedObjectId)||state.objects.find(o=>o.id===state.selectedObjectId);if(selected){if(selected.type==='door'){const mode=doorDirectManipulationMode(raw,selected);if(mode&&mode!=='select'){if(beginObjectDrag(e,raw,selected,mode))return;}}else if(hitHandle(raw,selected)){if(beginObjectDrag(e,raw,selected))return;}}const obj=(state.toolset==='cad'&&e.altKey)?cycleHitObject(raw):hitObject(raw);if(obj){applyObjectClickSelection(obj,e);const selectionModifier=state.toolset==='plan'?Boolean(e.ctrlKey||e.metaKey):Boolean(e.shiftKey||e.ctrlKey||e.metaKey);if(!selectionModifier&&state.selectedObjectIds.size<=1){if(obj.type==='door'){const mode=doorDirectManipulationMode(raw,obj);if(mode&&mode!=='select')beginObjectDrag(e,raw,obj,mode);}else beginObjectDrag(e,raw,obj);}renderPrimaryPanel();renderProperties();render();return;}if(state.toolset==='cad'||state.toolset==='plan'){const mode=state.toolset==='plan'?(e.ctrlKey||e.metaKey?'toggle':'replace'):(e.shiftKey?'add':(e.ctrlKey||e.metaKey?'toggle':'replace'));state.selectionDrag={pointerId:e.pointerId,start:{...raw},current:{...raw},mode,previewIds:new Set()};canvas.setPointerCapture?.(e.pointerId);if(mode==='replace')setSelectionIds(new Set());state.selectedReferenceId=null;state.selectedRegionId=null;renderPrimaryPanel();renderProperties();render();return;}applyObjectClickSelection(null,e);renderPrimaryPanel();renderProperties();render();return;}
    if(state.toolset==='plan'&&(state.activeTool==='move'||state.activeTool==='copy')){const obj=hitObject(raw);if(!obj||obj.type==='space')return;setSelectionIds(new Set([obj.id]));if(state.activeTool==='copy')beginCopyDrag(e,raw,obj);else beginObjectDrag(e,raw,obj,(obj.type==='door'||obj.type==='window')?'center':'body');renderPrimaryPanel();renderProperties();render();return;}
    if(state.activeTool==='delete'){const obj=hitObject(raw);if(obj)deleteObjectById(obj.id);return;}
    if(state.activeTool==='trim'||state.activeTool==='extend'){const mode=state.activeCommand==='TR'?'trim':state.activeCommand==='EX'?'extend':state.activeTool;applyTrimExtendAtPoint(raw,mode,{shift:Boolean(e.shiftKey)});state.trimPreview=null;render();return;}
    if(state.activeTool==='line'||state.activeTool==='wall'){
      if(state.activeTool==='wall'&&state.toolset==='plan'&&state.toolSettings.wallType==='arc'){
        if(!state.drawStart){state.drawStart=p;state.previewEnd=p;state.arcDraft=null;updateContextBar();render();return;}
        if(!state.arcDraft){state.arcDraft={a:{...state.drawStart},b:{...constrainOrtho(state.drawStart,p)}};state.previewEnd=p;updateContextBar();render();return;}
        const g=circleFromThreePoints(state.arcDraft.a,state.arcDraft.b,p);if(g){pushHistory();const decorative=Boolean(state.toolSettings.planDisplayMode),obj=decorative?{id:uid('line'),type:'line',planRole:'display',layerId:'drawing',a:{...state.arcDraft.a},b:{...state.arcDraft.b},geometry:'arc',...g,lineStyle:state.toolSettings.planDisplayStyle||'dashed',floorId:state.activeFloorId}:{id:uid('wall'),type:'wall',planRole:'boundary',lineStyle:'solid',layerId:'walls',a:{...state.arcDraft.a},b:{...state.arcDraft.b},thickness:currentWallThickness(),geometry:'arc',...g,attachments:{},floorId:state.activeFloorId};state.objects.push(obj);clearMultiSelection();state.hoveredObjectId=null;state.drawStart=null;state.drawReferenceAngle=null;state.arcDraft=null;state.previewEnd=null;markDirty(true);rebuildObjectSnapIndex();if(!decorative)refreshSpaces();updateAll();}return;
      }
      if(!state.drawStart){if(state.toolset==='plan'&&state.activeTool==='line'){const ref=planDrawReferenceAt(raw,p);p=ref.point;state.drawReferenceAngle=ref.angle;}state.drawStart=p;state.previewEnd=p;updateContextBar();render();}else commitSegment(state.drawStart,constrainOrtho(state.drawStart,p),state.activeTool);return;
    }
    if(state.activeTool==='measure'){if(!state.measureStart){state.measureStart=p;state.previewEnd=p;updateContextBar();render();}else commitMeasurement(state.measureStart,constrainOrtho(state.measureStart,p));return;}
    if(state.activeTool==='space'&&state.toolset==='plan'){commitSpace(raw);return;}
    if(state.activeTool==='door'||state.activeTool==='window'){commitOpening(state.activeTool,nearestWallProjection(raw));return;}
  }
  function cancelDirectDrag({status=true}={}){
    const drag=state.dragEdit;if(!drag)return false;state.dragEdit=null;host.dataset.drag='false';try{canvas.releasePointerCapture?.(drag.pointerId);}catch(_){}
    if(drag.cancelState){documentWriteEpoch++;restoreHistorySnapshot(drag.cancelState.workspace);state.history=[...drag.cancelState.history];state.future=[...drag.cancelState.future];state.selectedObjectIds=new Set(drag.cancelState.selectionIds||[]);state.selectedObjectId=drag.cancelState.selectedObjectId||null;state.selectedReferenceId=drag.cancelState.selectedReferenceId||null;state.selectedRegionId=drag.cancelState.selectedRegionId||null;updateUndoRedo();if(state.dirty)scheduleRecoverySnapshot();else clearRecoverySnapshot({projectId:state.projectId,maxEpoch:documentWriteEpoch});}
    state.shiftGuide=null;state.smartGuides=[];state.snapIndicator=null;if(status)setCommandStatus(t('command.cancelled'));updateAll();return true;
  }
  function onPointerCancel(e){if(featureFill?.selection.current){featureFill.cancelSelection();return;}if(state.dragEdit&&state.dragEdit.pointerId===e.pointerId){cancelDirectDrag();return;}onPointerUp(e);}
  function onPointerUp(e){if(featureFill?.pointerUp(e))return;if(isCompactViewer()&&state.viewerPointers.has(e.pointerId)){endViewerPointer(e);return;}if(state.regionDrag&&state.regionDrag.pointerId===e.pointerId){const drag=state.regionDrag;state.regionDrag=null;try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}const r=rectFromPoints(drag.start,drag.current);if((r.maxx-r.minx)>20&&(r.maxy-r.miny)>20){const name=prompt(t('region.namePrompt'),t('region.defaultName',{n:state.drawingRegions.length+1}));if(name!==null){pushHistory();const region={id:uid('region'),name:(name||t('region.defaultName',{n:state.drawingRegions.length+1})).trim(),...r};state.drawingRegions.push(region);state.selectedRegionId=region.id;markDirty(true);updateAll();}}setTool('select','select');return;}if(state.selectionDrag&&state.selectionDrag.pointerId===e.pointerId){const drag=state.selectionDrag,candidates=[...(drag.previewIds||new Set())];state.selectionDrag=null;try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}applySelectionSet(candidates,drag.mode);renderPrimaryPanel();renderProperties();render();return;}if(state.dragEdit){const drag=state.dragEdit,hadChange=drag.historyPushed,obj=state.objects.find(o=>o.id===drag.objectId);state.dragEdit=null;host.dataset.drag='false';try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}if(hadChange&&obj?.type==='wall'){if(drag.mode!=='body')syncDependentsOfWall(obj.id);refreshSpaces();}if(hadChange){recordEdit('drag',{objectId:obj?.id||drag.objectId,mode:drag.mode,tool:state.activeTool});rebuildObjectSnapIndex();updateAll();}state.shiftGuide=null;return;}if(!state.pan)return;state.pan=null;host.dataset.pan='false';try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){} }
  function onWheel(e){e.preventDefault();if(featureFill?.selection.current)return;const s=fromPointerEvent(e),before=screenCssToWorld(s),factor=Math.exp(-e.deltaY*.0014);state.camera.zoom=clamp(state.camera.zoom*factor,.002,8);const after=screenCssToWorld(s);state.camera.cx+=before.x-after.x;state.camera.cy+=before.y-after.y;render();}

  function deleteObjectById(id){const target=cadContext?.getById(id)||state.objects.find(o=>o.id===id);if(!target)return false;if(state.toolset==='cad'&&target.type==='component'){if(!cadObjectModifiable(target))return false;pushHistory();state.objects=state.objects.filter(o=>o.id!==id);clearMultiSelection();markDirty(true);rebuildObjectSnapIndex({scope:'all'});updateAll();return true;}if(state.toolset==='cad'){if(!cadObjectModifiable(target))return false;commitCadChanges('ERASE',[{before:target,after:null,index:state.objects.indexOf(target)}]);clearMultiSelection();updateAll();return true;}pushHistory();const childIds=target.type==='wall'?new Set(state.objects.filter(o=>(o.type==='door'||o.type==='window'||o.type==='dimension')&&o.wallId===id).map(o=>o.id)):new Set();state.objects=state.objects.filter(o=>o.id!==id&&!childIds.has(o.id));if(target.type==='wall'){for(const wall of getPlanObjects().filter(o=>o.type==='wall')){for(const endpoint of['a','b'])if(wall.attachments?.[endpoint]?.wallId===id)delete wall.attachments[endpoint];const c=ensureWallConstraints(wall);if(c.reference?.wallId===id)c.reference=null;}if(state.baseAxisWallId===id){state.baseAxisWallId=null;state.baseAxisAngle=0;}refreshSpaces();}state.selectedObjectId=null;state.selectedObjectIds.delete(id);for(const childId of childIds)state.selectedObjectIds.delete(childId);markDirty(true);rebuildObjectSnapIndex();updateAll();return true;}
  function deleteSelectedObjects(){
    const ids=selectionIds();if(!ids.size)return false;
    if(state.toolset==='cad'){const denied=[...ids].map(id=>cadContext?.getById(id)).filter(Boolean).find(o=>!cadPolicy(o.id,'modify').allowed);if(denied){setCommandStatus(cadFaultMessage(cadPolicy(denied.id,'modify').reason),'error');return false;}}
    if(state.toolset==='cad'&&[...ids].some(id=>(cadContext?.getById(id)||state.objects.find(o=>o.id===id))?.type==='component')){pushHistory();state.objects=state.objects.filter(o=>!ids.has(o.id));clearMultiSelection();markDirty(true);rebuildObjectSnapIndex({scope:'all'});updateAll();return true;}
    if(state.toolset==='cad'){const changes=state.objects.flatMap((o,index)=>ids.has(o.id)?[{before:o,after:null,index}]:[]);if(!changes.length)return false;commitCadChanges('ERASE',changes);clearMultiSelection();updateAll();return true;}
    pushHistory();const remove=new Set(ids);for(const id of ids){const target=state.objects.find(o=>o.id===id);if(target?.type==='wall')for(const o of state.objects)if((o.type==='door'||o.type==='window'||o.type==='dimension')&&o.wallId===id)remove.add(o.id);}state.objects=state.objects.filter(o=>!remove.has(o.id));for(const wall of getPlanObjects().filter(o=>o.type==='wall')){for(const endpoint of['a','b'])if(remove.has(wall.attachments?.[endpoint]?.wallId))delete wall.attachments[endpoint];const c=ensureWallConstraints(wall);if(remove.has(c.reference?.wallId))c.reference=null;}if(remove.has(state.baseAxisWallId)){state.baseAxisWallId=null;state.baseAxisAngle=0;}clearMultiSelection();refreshSpaces();markDirty(true);rebuildObjectSnapIndex();updateAll();return true;
  }

  function referenceLocalBounds(ref,{main=false,ignoreClip=false}={}){let b=null;if(ref.type==='linkedCadRegion'){const r=state.drawingRegions.find(x=>x.id===ref.regionId);return r?{minx:r.minx,miny:r.miny,maxx:r.maxx,maxy:r.maxy}:{minx:0,miny:0,maxx:1000,maxy:1000};}if(ref.type==='image'||ref.type==='pdf')b={minx:0,miny:0,maxx:Number(ref.width)||1,maxy:Number(ref.height)||1};else b=(main&&ref.mainBounds)||ref.bounds||{minx:0,miny:0,maxx:1000,maxy:1000};if(!ignoreClip&&ref.clip){const c=ref.clip;b={minx:Math.max(b.minx,c.minx),miny:Math.max(b.miny,c.miny),maxx:Math.min(b.maxx,c.maxx),maxy:Math.min(b.maxy,c.maxy)};if(b.minx>=b.maxx||b.miny>=b.maxy)return referenceLocalBounds(ref,{main,ignoreClip:true});}return b;}
  function referenceBounds(ref,{main=false}={}){if(ref.type==='linkedCadRegion')return referenceLocalBounds(ref,{main});const b=referenceLocalBounds(ref,{main}),a=referenceLocalToWorld(ref,{x:b.minx,y:b.miny}),c=referenceLocalToWorld(ref,{x:b.maxx,y:b.maxy});return{minx:Math.min(a.x,c.x),miny:Math.min(a.y,c.y),maxx:Math.max(a.x,c.x),maxy:Math.max(a.y,c.y)};}
  function allBounds({full=false}={}){let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;const add=p=>{if(!p)return;minx=Math.min(minx,p.x);miny=Math.min(miny,p.y);maxx=Math.max(maxx,p.x);maxy=Math.max(maxy,p.y);};for(const r of state.references){const b=referenceBounds(r,{main:!full});add({x:b.minx,y:b.miny});add({x:b.maxx,y:b.maxy});}if(state.sourceDxfName&&state.objects.length&&state.sourceDxfMainBounds&&!full){const b=state.sourceDxfMainBounds;add({x:b.minx,y:b.miny});add({x:b.maxx,y:b.maxy});}else for(const o of state.objects){if(state.toolset==='plan'&&isSemanticObject(o)&&!objectOnActiveFloor(o))continue;if(modules.cadPolyline.is(o)){const b=cadGeometry.bounds(o);add({x:b.minx,y:b.miny});add({x:b.maxx,y:b.maxy});}if(o.a)add(o.a);if(o.b)add(o.b);if(o.type==='stair')for(const q of o.polygon||[])add(q);if(o.center){add({x:o.center.x-o.radius,y:o.center.y-o.radius});add({x:o.center.x+o.radius,y:o.center.y+o.radius});}if(o.type==='component'){const cb=componentLibrary.bounds(o);if(cb){add({x:cb.minx,y:cb.miny});add({x:cb.maxx,y:cb.maxy});}}else if(o.point)add(o.point);const g=(o.type==='door'||o.type==='window')?openingGeometry(o):null;if(g){add(g.p1);add(g.p2);}if(o.type==='dimension'){const d=dimensionGeometry(o);if(d){add(d.p1);add(d.p2);add(d.d1);add(d.d2);}}}return Number.isFinite(minx)?{minx,miny,maxx,maxy}:null;}
  function fitAll(){const b=allBounds({full:false});if(!b){state.camera={cx:0,cy:0,zoom:.12};render();return;}fitBounds(b);}
  function fitBounds(b){const{w,h}=cssCanvasSize(),frame=projectionFrame(),points=frame?rangePolygon(b).map(p=>modules.floorAlignment.point(p,frame)):rangePolygon(b),bw=Math.max(100,Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))),bh=Math.max(100,Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y)));state.camera.cx=(b.minx+b.maxx)/2;state.camera.cy=(b.miny+b.maxy)/2;state.camera.zoom=clamp(Math.min((w-90)/bw,(h-90)/bh),.002,8);render();}
  function drawingRegionForFit(){
    const byId=id=>id?state.drawingRegions.find(r=>r.id===id)||null:null;
    if(state.toolset==='cad'){const active=activeCadWorkRegion();if(active)return active;const selected=byId(state.selectedRegionId);if(selected)return selected;}
    if(state.toolset==='plan'){const floor=activeFloor(),linked=byId(floor?.sourceRegionId);if(linked)return linked;const ref=state.references.find(r=>r.id===state.selectedReferenceId&&r.type==='linkedCadRegion'),fromRef=byId(ref?.regionId);if(fromRef)return fromRef;const selected=byId(state.selectedRegionId);if(selected)return selected;}
    return state.drawingRegions.length===1?state.drawingRegions[0]:null;
  }
  function fitDrawingRegion(){const region=drawingRegionForFit();if(!region)return false;fitBounds(region);return true;}
  function updateViewMenuActions(){const region=drawingRegionForFit();if(dom.viewRegionAction){dom.viewRegionAction.hidden=!region;dom.viewRegionAction.disabled=!region;dom.viewRegionAction.title=region?.name||'';}return region;}
  function fitReference(ref){fitBounds(referenceBounds(ref,{main:true}));}

  function fitReferenceFull(ref){fitBounds(referenceBounds(ref,{main:false}));}
  function fitFullExtents(){const b=allBounds({full:true});if(b)fitBounds(b);}
  function scaleBounds(b,factor){return b?{minx:b.minx*factor,miny:b.miny*factor,maxx:b.maxx*factor,maxy:b.maxy*factor}:null;}

  async function sha256Hex(buffer){if(!globalThis.crypto?.subtle)return null;try{return[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(b=>b.toString(16).padStart(2,'0')).join('');}catch(_){return null;}}
  async function sourceMetaForFile(file,buffer=null){const bytes=buffer||await file.arrayBuffer();return{name:file.name,size:file.size,lastModified:Number(file.lastModified)||0,hash:await sha256Hex(bytes)};}
  function pdfMediaBoxSize(buffer){try{const bytes=new Uint8Array(buffer),slice=bytes.slice(0,Math.min(bytes.length,1024*1024)),text=new TextDecoder('latin1').decode(slice),m=text.match(/\/MediaBox\s*\[\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\]/);if(m){const w=Math.abs(Number(m[3])-Number(m[1]))*25.4/72,h=Math.abs(Number(m[4])-Number(m[2]))*25.4/72;if(w>1&&h>1)return{width:w,height:h};}}catch(_){}return{width:210,height:297};}
  function referenceSourceState(ref){if(!ref.sourceMeta)return'embedded';return ref.sourceState||'embedded';}
  function cancelImportJob(){const job=activeImportJob;if(!job)return false;activeImportJob=null;if(job.awaitingReplacement&&job.confirmCancelAction===state.confirmCancelAction&&!dom.confirmBackdrop.hidden)hideAppConfirm({cancel:true});job.controller.abort();hideProgress();return true;}
  async function runImportJob(run){
    cancelImportJob();const job={controller:new AbortController(),projectId:state.projectId,toolset:state.toolset,floorId:state.activeFloorId};activeImportJob=job;
    job.check=()=>{if(activeImportJob!==job||job.controller.signal.aborted||job.projectId!==state.projectId||job.toolset!==state.toolset||job.floorId!==state.activeFloorId)throw new DOMException('Import cancelled.','AbortError');};
    job.progress=(title,ratio,detail)=>{job.check();showProgress(title,ratio,detail);};
    try{return await run(job);}catch(err){if(activeImportJob===job)hideProgress();if(err.name!=='AbortError'){console.error(err);alert(err.message||String(err));}return false;}
    finally{if(activeImportJob===job){activeImportJob=null;hideProgress();}}
  }
  function reportDxfDiagnostics(parsed,job){
    if(activeImportJob===job)hideProgress();
    const stats=parsed.stats||{},omitted=Object.entries(stats.omittedByType||{}).map(([type,n])=>`${type}: ${n}`).join(', ');
    if(parsed.ignored||stats.approximatedCurves)alert(t('alert.dxfImportDiagnostics',{count:parsed.entities.length,omitted:parsed.ignored||0,types:omitted||'—',approx:stats.approximatedCurves||0}));
  }
  async function addDxfReference(file){return runImportJob(job=>addDxfReferenceImpl(file,job));}
  async function addImageReference(file){return runImportJob(job=>addImageReferenceImpl(file,job));}
  async function addPdfReference(file){return runImportJob(job=>addPdfReferenceImpl(file,job));}
  async function reconnectReferenceFile(ref,file){return runImportJob(job=>reconnectReferenceFileImpl(ref,file,job));}
  async function openEditableDxf(file){return runImportJob(job=>openEditableDxfImpl(file,job));}
  async function openReferenceFile(file){if(!file)return;const lower=file.name.toLowerCase();try{if(lower.endsWith('.dxf'))await addDxfReference(file);else if(lower.endsWith('.pdf')||file.type==='application/pdf')await addPdfReference(file);else if(file.type.startsWith('image/'))await addImageReference(file);else alert(t('alert.unsupportedReference'));}finally{dom.referenceFileInput.value='';}}
  async function addDxfReferenceImpl(file,job){job.progress(t('progress.readingDxf'),0,file.name);const buffer=await file.arrayBuffer(),text=new TextDecoder().decode(buffer);job.check();const parsed=await window.PieniPlanDXF.parseAndAnalyze(text,p=>job.progress(p.stage||t('progress.readingDxf'),p.ratio||0,p.detail||''),{signal:job.controller.signal});const factor=unitFactorToMm(parsed.unit),entities=parsed.entities.map(e=>normalizeEntityToMm(e,factor)),b=boundsEntities(entities),main=scaleBounds(parsed.analysis?.mainBounds,factor);const meta=await sourceMetaForFile(file,buffer);job.check();const ref={id:uid('ref'),type:'dxf',name:file.name,visible:true,opacity:.48,scale:1,origin:{x:0,y:0},floorId:state.toolset==='plan'?(activeFloor()?.id||null):null,entities,bounds:b,mainBounds:main||b,outlierCount:parsed.analysis?.outlierCount||0,sourceUnit:parsed.unit?.label||'unspecified',sourceUnitSpecified:parsed.unit?.metersPerUnit!=null,layers:parsed.layers||[],visibleLayers:new Set(parsed.layers||[]),pathsByLayer:buildDxfPaths(entities),textEntities:entities.filter(e=>e.type==='text'),snapIndex:buildSnapIndex(entities,b),sourceMeta:meta,sourceState:'embedded'};job.check();state.references.push(ref);state.selectedReferenceId=ref.id;if(state.toolset==='plan')initializeBuildingNameFromReference();touchCadReference();markDirty(true);updateAll();switchInspector(state.toolset==='plan'?'primary':'reference');fitReference(ref);reportDxfDiagnostics(parsed,job);}
  async function addImageReferenceImpl(file,job){const buffer=await file.arrayBuffer(),dataUrl=await readDataUrl(new Blob([buffer],{type:file.type||'application/octet-stream'})),image=await loadImage(dataUrl);const meta=await sourceMetaForFile(file,buffer);job.check();const ref={id:uid('ref'),type:'image',name:file.name,visible:true,opacity:.55,scale:1,origin:{x:0,y:0},floorId:state.toolset==='plan'?(activeFloor()?.id||null):null,image,width:image.naturalWidth,height:image.naturalHeight,sourceUnit:'px',dataUrl,sourceMeta:meta,sourceState:'embedded'};job.check();state.references.push(ref);state.selectedReferenceId=ref.id;if(state.toolset==='plan')initializeBuildingNameFromReference();touchCadReference();markDirty(true);updateAll();switchInspector(state.toolset==='plan'?'primary':'reference');fitReference(ref);}
  async function addPdfReferenceImpl(file,job){job.progress(t('reference.pdfReading'),0,file.name);const buffer=await file.arrayBuffer(),dataUrl=await readDataUrl(new Blob([buffer],{type:'application/pdf'})),size=pdfMediaBoxSize(buffer);const meta=await sourceMetaForFile(file,buffer);job.check();const ref={id:uid('ref'),type:'pdf',name:file.name,visible:true,opacity:.62,scale:1,origin:{x:0,y:0},floorId:state.toolset==='plan'?(activeFloor()?.id||null):null,width:size.width,height:size.height,sourceUnit:'mm',dataUrl,sourceMeta:meta,sourceState:'embedded'};job.check();state.references.push(ref);state.selectedReferenceId=ref.id;if(state.toolset==='plan')initializeBuildingNameFromReference();touchCadReference();markDirty(true);updateAll();switchInspector(state.toolset==='plan'?'primary':'reference');fitReference(ref);setCommandStatus(t('reference.pdfAdded'),'strong');}
  async function reconnectReferenceFileImpl(ref,file,job){if(!ref||!file)return false;const lower=file.name.toLowerCase(),expected=ref.type==='dxf'?lower.endsWith('.dxf'):ref.type==='pdf'?(lower.endsWith('.pdf')||file.type==='application/pdf'):file.type.startsWith('image/');if(!expected){setCommandStatus(t('reference.reconnectWrongType'),'error');return false;}const buffer=await file.arrayBuffer(),meta=await sourceMetaForFile(file,buffer),same=Boolean(ref.sourceMeta?.hash&&meta.hash&&ref.sourceMeta.hash===meta.hash);if(!same&&!confirm(t('reference.changedConfirm',{name:file.name})))return false;const keep={id:ref.id,visible:ref.visible,opacity:ref.opacity,scale:ref.scale,origin:{...ref.origin},floorId:ref.floorId||null,clip:ref.clip?{...ref.clip}:null};if(ref.type==='dxf'){job.progress(t('progress.readingDxf'),0,file.name);const text=new TextDecoder().decode(buffer),parsed=await window.PieniPlanDXF.parseAndAnalyze(text,p=>job.progress(p.stage||t('progress.readingDxf'),p.ratio||0,p.detail||''),{signal:job.controller.signal}),factor=unitFactorToMm(parsed.unit),entities=parsed.entities.map(e=>normalizeEntityToMm(e,factor)),b=boundsEntities(entities),main=scaleBounds(parsed.analysis?.mainBounds,factor);job.check();Object.assign(ref,keep,{name:file.name,entities,bounds:b,mainBounds:main||b,outlierCount:parsed.analysis?.outlierCount||0,sourceUnit:parsed.unit?.label||'unspecified',sourceUnitSpecified:parsed.unit?.metersPerUnit!=null,layers:parsed.layers||[],visibleLayers:new Set(parsed.layers||[]),pathsByLayer:buildDxfPaths(entities),textEntities:entities.filter(e=>e.type==='text'),snapIndex:buildSnapIndex(entities,b)});reportDxfDiagnostics(parsed,job);}else if(ref.type==='image'){const dataUrl=await readDataUrl(new Blob([buffer],{type:file.type||'application/octet-stream'})),image=await loadImage(dataUrl);job.check();Object.assign(ref,keep,{name:file.name,dataUrl,image,width:image.naturalWidth,height:image.naturalHeight,sourceUnit:'px'});}else{const dataUrl=await readDataUrl(new Blob([buffer],{type:'application/pdf'})),size=pdfMediaBoxSize(buffer);job.check();Object.assign(ref,keep,{name:file.name,dataUrl,width:size.width,height:size.height,sourceUnit:'mm'});}job.check();ref.sourceMeta=meta;ref.sourceState=same?'matched':'updated';markDirty(true);touchCadReference();renderReferences();render();setCommandStatus(t(same?'reference.sourceMatched':'reference.sourceUpdated'),'strong');return true;}
  function beginReferenceReconnect(ref){if(!ref||ref.type==='linkedCadRegion')return;state.referenceReconnectId=ref.id;dom.referenceReconnectFileInput.accept=ref.type==='dxf'?'.dxf':ref.type==='pdf'?'.pdf,application/pdf':'image/*';dom.referenceReconnectFileInput.click();}
  function beginReferenceClip(ref){if(!ref||ref.type==='linkedCadRegion')return;state.referenceClipDraft={refId:ref.id,p1:null,current:null};setCommandStatus(t('reference.clipFirst'),'strong');host.focus();render();}
  function handleReferenceClipPoint(world){const d=state.referenceClipDraft;if(!d)return false;const ref=state.references.find(r=>r.id===d.refId);if(!ref){state.referenceClipDraft=null;return false;}const local=referenceWorldToLocal(ref,world);if(!d.p1){d.p1=local;d.current=local;setCommandStatus(t('reference.clipSecond'),'strong');render();return true;}const clip={minx:Math.min(d.p1.x,local.x),miny:Math.min(d.p1.y,local.y),maxx:Math.max(d.p1.x,local.x),maxy:Math.max(d.p1.y,local.y)};if(clip.maxx-clip.minx<1e-6||clip.maxy-clip.miny<1e-6)return false;pushHistory();ref.clip=clip;state.referenceClipDraft=null;markDirty(true);renderReferences();render();setCommandStatus(t('reference.clipApplied'),'strong');return true;}
  function clearReferenceClip(ref){if(!ref?.clip)return;pushHistory();delete ref.clip;markDirty(true);renderReferences();render();}


  async function openEditableDxfImpl(file,job){
    cadCommandSession?.cancel('open-dxf');
    if(!file)return;
    try{
      job.awaitingReplacement=true;let replace;try{const pendingReplacement=requestWorkspaceReplacement();job.confirmCancelAction=state.confirmCancelAction;replace=await pendingReplacement;}finally{job.awaitingReplacement=false;job.confirmCancelAction=null;}if(!replace||activeImportJob!==job||job.controller.signal.aborted)return;Object.assign(job,{projectId:state.projectId,toolset:state.toolset,floorId:state.activeFloorId});job.check();
      job.progress(t('progress.importingDxf'),0,file.name);
      const text=await file.text();job.check();
      const parsed=await window.PieniPlanDXF.parseAndAnalyze(text,p=>job.progress(p.stage||t('progress.importingDxf'),p.ratio||0,p.detail||''),{signal:job.controller.signal});
      const fingerprint=await sha256Hex(new TextEncoder().encode(text).buffer);job.check();
      const factor=unitFactorToMm(parsed.unit),entities=parsed.entities.map(e=>normalizeEntityToMm(e,factor)),editable=[];let nextId=1;const importId=prefix=>`${prefix}-${nextId++}`;
      for(const e of entities){
        const layer=e.layer||'0';
        if(e.type==='line')editable.push({id:importId('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.x1,y:e.y1},b:{x:e.x2,y:e.y2},source:'DXF'});
        else if(e.type==='polyline'&&e.points?.length>1){for(let i=1;i<e.points.length;i++)editable.push({id:importId('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.points[i-1][0],y:e.points[i-1][1]},b:{x:e.points[i][0],y:e.points[i][1]},source:'DXF'});if(e.closed)editable.push({id:importId('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.points.at(-1)[0],y:e.points.at(-1)[1]},b:{x:e.points[0][0],y:e.points[0][1]},source:'DXF'});}
        else if(e.type==='circle')editable.push({id:importId('cadCircle'),type:'cadCircle',cadLayer:layer,center:{x:e.cx,y:e.cy},radius:e.r,source:'DXF'});
        else if(e.type==='arc')editable.push({id:importId('cadArc'),type:'cadArc',cadLayer:layer,center:{x:e.cx,y:e.cy},radius:e.r,startAngle:e.startAngle||0,sweep:e.sweep||0,sourceType:e.sourceType||'ARC',source:'DXF'});
        else if(e.type==='text')editable.push({id:importId('cadText'),type:'cadText',cadLayer:layer,point:{x:e.x,y:e.y},text:e.text||'',height:e.height||180,rotation:e.rotation||0,sourceType:e.sourceType||'TEXT',source:'DXF'});
      }
      if(!editable.some(o=>o.type==='cadLine'||o.type==='cadCircle'||o.type==='cadArc'))alert(t('alert.dxfNoEditableEntities'));
      const visibility=new Map([['0',true],...(parsed.layers||[]).map(name=>[name,true])]),definitions=cadLayersModule.synthesize((parsed.layers||[]).map(name=>({name})),editable,visibility);job.check();job.committing=true;
      state.objects=[];state.references=[];state.drawingRegions=[];state.selectedRegionId=null;state.wallRecognitionPreview=null;state.curveReconstruction=null;state.annotationDraft=null;state.recognitionHistory=[];state.selectedObjectId=null;state.selectedObjectIds.clear();state.previousCadSelectionIds=new Set();state.lastCadObjectId=null;state.overlapCycle=null;state.selectionDrag=null;state.selectedReferenceId=null;state.layerFilter='';state.layerRevealRequested=false;state.baseAxisAngle=0;state.baseAxisWallId=null;state.history=[];state.future=[];state.editLog=[];state.activeCommand=null;state.spaceHoverPreview=null;state.cadWorkRegionId=null;state.cadPlanOverlay=false;state.cadRotate=null;state.nextId=1;state.cadMapping=null;state.cadLayerVisibility=new Map([['0',true]]);state.cadRegionLayerVisibility=new Map();state.cadLayerDefinitions=new Map([['0',cadLayersModule.defaults('0')]]);state.activeCadLayer='0';state.unitSystem=safeReadDefaultUnit();state.sheets=[];state.buildings=[{id:'building_1',name:t('building.defaultName'),order:0}];state.activeBuildingId='building_1';state.floors=[{id:'floor_1',name:'1F',sourceRegionId:null,discipline:'architectural',buildingId:'building_1',order:0}];state.activeFloorId='floor_1';state.expandedBuildingIds=new Set(['building_1']);state.expandedFloorIds=new Set();state.projectId=stableId('project');state.projectFileName=null;state.projectFileHandle=null;state.projectLocalKey=null;state.sessionKind='normal';sampleReturnWorkspace=null;
      state.objects=editable;state.nextId=nextId;state.cadLayerVisibility=visibility;state.cadLayerDefinitions=definitions;initializeCadServices({newDocument:true});state.projectFileName=null;state.projectFileHandle=null;state.sourceDxfName=file.name;state.sourceDxfFingerprint=fingerprint;state.sourceDxfSize=file.size||text.length;state.sourceDxfLastModified=file.lastModified||0;state.sourceDxfFullBounds=boundsEntities(entities);state.sourceDxfMainBounds=scaleBounds(parsed.analysis?.mainBounds,factor)||state.sourceDxfFullBounds;state.sourceDxfOutlierCount=parsed.analysis?.outlierCount||0;state.activeCadLayer=(parsed.layers||[])[0]||'0';state.dirty=false;rebuildObjectSnapIndex();switchToolset('cad',{skipMapping:true});updateAll();fitAll();reportDxfDiagnostics(parsed,job);
    }
    finally{dom.dxfEditFileInput.value='';}
  }

  function normalizeEntityToMm(e,factor){const out={...e};if(e.type==='line'){out.x1=e.x1*factor;out.y1=e.y1*factor;out.x2=e.x2*factor;out.y2=e.y2*factor;}else if(e.type==='polyline')out.points=(e.points||[]).map(p=>[p[0]*factor,p[1]*factor]);else if(e.type==='circle'||e.type==='arc'){out.cx=e.cx*factor;out.cy=e.cy*factor;out.r=e.r*factor;}else if(e.type==='text'){out.x=e.x*factor;out.y=e.y*factor;out.height=(e.height||180)*factor;}return out;}
  function buildDxfPaths(entities){const paths=new Map(),get=layer=>{const key=layer||'0';if(!paths.has(key))paths.set(key,new Path2D());return paths.get(key);};for(const e of entities){const path=get(e.layer);if(e.type==='line'){path.moveTo(e.x1,e.y1);path.lineTo(e.x2,e.y2);}else if(e.type==='polyline'&&e.points?.length){path.moveTo(e.points[0][0],e.points[0][1]);for(let i=1;i<e.points.length;i++)path.lineTo(e.points[i][0],e.points[i][1]);if(e.closed)path.closePath();}else if(e.type==='circle'&&e.r>0){path.moveTo(e.cx+e.r,e.cy);path.arc(e.cx,e.cy,e.r,0,Math.PI*2);}else if(e.type==='arc'&&e.r>0){const a0=rad(e.startAngle||0),a1=rad((e.startAngle||0)+(e.sweep||0));path.moveTo(e.cx+Math.cos(a0)*e.r,e.cy+Math.sin(a0)*e.r);path.arc(e.cx,e.cy,e.r,a0,a1,(e.sweep||0)<0);}}return paths;}
  function buildSegmentSnapIndex(segments){
    const cellW=1000,cellH=1000,cells=new Map(),segmentCells=new Map(),clean=[];
    const addPoint=(p,layer='0',kind='endpoint',meta={})=>{if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y))return;const gx=Math.floor(p.x/cellW),gy=Math.floor(p.y/cellH),key=`${gx},${gy}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push({x:p.x,y:p.y,layer,kind,...meta});};
    const addSeg=seg=>{if(!seg?.a||!seg?.b||distance(seg.a,seg.b)<1e-9)return;const item={...seg,index:clean.length};clean.push(item);const meta={objectId:item.objectId||null};addPoint(item.a,item.layer,'endpoint',meta);addPoint(item.b,item.layer,'endpoint',meta);addPoint({x:(item.a.x+item.b.x)/2,y:(item.a.y+item.b.y)/2},item.layer,'midpoint',meta);const minx=Math.min(item.a.x,item.b.x),maxx=Math.max(item.a.x,item.b.x),miny=Math.min(item.a.y,item.b.y),maxy=Math.max(item.a.y,item.b.y);for(let gx=Math.floor(minx/cellW);gx<=Math.floor(maxx/cellW);gx++)for(let gy=Math.floor(miny/cellH);gy<=Math.floor(maxy/cellH);gy++){const key=`${gx},${gy}`;if(!segmentCells.has(key))segmentCells.set(key,[]);segmentCells.get(key).push(item);}};
    for(const seg of segments||[])addSeg(seg);return{minx:0,miny:0,cellW,cellH,cells,segmentCells,segments:clean};
  }
  function buildSnapIndex(entities,bounds){
    const segments=[],extra=[];let seq=0;const seg=(a,b,layer='0')=>segments.push({a,b,layer,id:`s${++seq}`});
    for(const e of entities){const layer=e.layer||'0';if(e.type==='line')seg({x:e.x1,y:e.y1},{x:e.x2,y:e.y2},layer);else if(e.type==='polyline'){const pts=e.points||[];for(let i=1;i<pts.length;i++)seg({x:pts[i-1][0],y:pts[i-1][1]},{x:pts[i][0],y:pts[i][1]},layer);if(e.closed&&pts.length>1)seg({x:pts[pts.length-1][0],y:pts[pts.length-1][1]},{x:pts[0][0],y:pts[0][1]},layer);}else if(e.type==='circle'){extra.push({x:e.cx,y:e.cy,layer,kind:'center'});extra.push({x:e.cx-e.r,y:e.cy,layer,kind:'quadrant'},{x:e.cx+e.r,y:e.cy,layer,kind:'quadrant'},{x:e.cx,y:e.cy-e.r,layer,kind:'quadrant'},{x:e.cx,y:e.cy+e.r,layer,kind:'quadrant'});}else if(e.type==='arc'){extra.push({x:e.cx,y:e.cy,layer,kind:'center'});const a0=rad(e.startAngle||0),a1=rad((e.startAngle||0)+(e.sweep||0));extra.push({x:e.cx+Math.cos(a0)*e.r,y:e.cy+Math.sin(a0)*e.r,layer,kind:'endpoint'},{x:e.cx+Math.cos(a1)*e.r,y:e.cy+Math.sin(a1)*e.r,layer,kind:'endpoint'});}}
    const idx=buildSegmentSnapIndex(segments);for(const q of extra){const gx=Math.floor(q.x/idx.cellW),gy=Math.floor(q.y/idx.cellH),key=`${gx},${gy}`;if(!idx.cells.has(key))idx.cells.set(key,[]);idx.cells.get(key).push(q);}return idx;
  }
  function queryReferenceSnapIndex(idx,p,threshold,visibleLayer,test,base=null){
    if(!idx)return;let discrete=false;const emit=(q,kind)=>{discrete=true;test(q,kind);};const gx=Math.floor(p.x/idx.cellW),gy=Math.floor(p.y/idx.cellH),rx=Math.max(1,Math.ceil(threshold/idx.cellW)),ry=Math.max(1,Math.ceil(threshold/idx.cellH)),segments=new Map();
    for(let dx=-rx;dx<=rx;dx++)for(let dy=-ry;dy<=ry;dy++){const key=`${gx+dx},${gy+dy}`;for(const q of idx.cells.get(key)||[]){if(visibleLayer&&!visibleLayer(q.layer||'0'))continue;if(distance(p,q)<=threshold)emit(q,q.kind||'endpoint');}for(const seg of idx.segmentCells?.get(key)||[]){if(visibleLayer&&!visibleLayer(seg.layer||'0'))continue;if(pointSegmentDistance(p,seg.a,seg.b)<=threshold)segments.set(seg.index,seg);}}
    if(state.toolset==='cad'&&idx===state.cadSnapIndex){const rect={minx:p.x-threshold,maxx:p.x+threshold,miny:p.y-threshold,maxy:p.y+threshold},list=cadQueryCandidates(rect,'snap').filter(o=>o.id!==null&&cadGeometry.hitDistance(o,p)<=threshold&&o.type!=='cadText');for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)for(const q of cadGeometry.intersections(list[i],list[j],undefined,rect))if(distance(p,q)<=threshold)test({...q,kind:'intersection',objectIds:[list[i].id,list[j].id]});return;}
    if(state.toolset==='plan'&&idx===state.planSnapIndex){const rect={minx:p.x-threshold,maxx:p.x+threshold,miny:p.y-threshold,maxy:p.y+threshold},arcs=(planArcSnapTree?.query(rect)||[]).map(x=>x.o).filter(o=>o.id!==null),lines=[...segments.values()];for(let i=0;i<arcs.length;i++){const a=arcs[i];if(!allowed({objectId:a.id}))continue;for(const b of lines){if(!allowed(b))continue;for(const q of cadGeometry.intersections(planArcGeometry(a),b))if(distance(p,q)<=threshold)test({...q,kind:'intersection',objectIds:[a.id,b.objectId]});}for(let j=i+1;j<arcs.length;j++)if(allowed({objectId:arcs[j].id}))for(const q of cadGeometry.intersections(planArcGeometry(a),planArcGeometry(arcs[j])))if(distance(p,q)<=threshold)test({...q,kind:'intersection',objectIds:[a.id,arcs[j].id]});}}
    const list=[...segments.values()];for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const x=segmentIntersection(list[i].a,list[i].b,list[j].a,list[j].b);if(x&&distance(p,x.point)<=threshold)emit({...x.point,layer:list[i].layer},'intersection');}
    if(idx.polyQuery){const rect={minx:p.x-threshold,maxx:p.x+threshold,miny:p.y-threshold,maxy:p.y+threshold},owners=idx.polyQuery.candidates(rect).filter(o=>(!visibleLayer||visibleLayer(cadLayerForObject(o)))&&cadGeometry.hitDistance(o,p)<=threshold);
      for(let i=0;i<owners.length;i++){const o=owners[i];if(modules.cadPolyline.is(o)){for(const q of cadGeometry.intersections(o,o,undefined,rect))if(distance(p,q)<=threshold)emit(q,'intersection');if(base)for(const q of cadGeometry.projectPerpendicular(o,base,rect))if(distance(p,q)<=threshold)emit(q,'perpendicular');}
        for(let j=i+1;j<owners.length;j++)if(modules.cadPolyline.is(o)||modules.cadPolyline.is(owners[j]))for(const q of cadGeometry.intersections(o,owners[j],undefined,rect))if(distance(p,q)<=threshold)emit(q,'intersection');}
      if(!discrete)for(const o of owners)if(modules.cadPolyline.is(o)){const q=cadGeometry.projectNearest(o,p);if(q&&q.distance<=threshold)test({...q.point,ownerId:o.id,edgeId:q.edgeId,parameter:q.parameter},'nearest');}
    }
    // Preserve discrete snaps; nearest is a local indexed-edge fallback.
    if(!discrete)for(const seg of list){const q=modules.geometryQuery.projectNearest(seg,p);if(q&&q.distance<=threshold)test({...q.point,layer:seg.layer},'nearest');}
  }
  function boundsEntities(entities){let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;const add=(x,y)=>{if(Number.isFinite(x)&&Number.isFinite(y)){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);}};for(const e of entities){if(e.type==='line'){add(e.x1,e.y1);add(e.x2,e.y2);}else if(e.type==='polyline')for(const p of e.points||[])add(p[0],p[1]);else if(e.type==='circle'||e.type==='arc'){add(e.cx-e.r,e.cy-e.r);add(e.cx+e.r,e.cy+e.r);}else if(e.type==='text')add(e.x,e.y);}return Number.isFinite(minx)?{minx,miny,maxx,maxy}:{minx:0,miny:0,maxx:1000,maxy:1000};}
  function readDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});}
  function loadImage(src){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=rej;img.src=src;});}


  function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
  function normalizeDxfFilename(name){let clean=sanitizeFilename(String(name||'PieniPlan').trim());if(!/\.dxf$/i.test(clean))clean+=`.dxf`;return clean;}
  function dxfFilePickerTypes(){return[{description:'DXF Drawing',accept:{'application/dxf':['.dxf'],'text/plain':['.dxf']}}];}
  async function writeDxfToHandle(handle,blob,name){const writable=await handle.createWritable();await writable.write(blob);await writable.close();const savedName=handle.name||name;setCommandStatus(t('exportDxf.saved',{name:savedName}),'strong');return savedName;}
  function closeDxfFallbackSaveDialog(){if(dom.exportSaveBackdrop)dom.exportSaveBackdrop.hidden=true;state.pendingDxfExport=null;}
  function openDxfFallbackSaveDialog(blob,name){state.pendingDxfExport={blob,name:normalizeDxfFilename(name)};if(!dom.exportSaveBackdrop){downloadBlob(blob,state.pendingDxfExport.name);setCommandStatus(t('exportDxf.downloadedFallback',{name:state.pendingDxfExport.name}),'strong');state.pendingDxfExport=null;return;}dom.exportSaveName.value=state.pendingDxfExport.name;dom.exportSaveBackdrop.hidden=false;setTimeout(()=>{dom.exportSaveName.focus();dom.exportSaveName.select();},0);}
  function applyDxfFallbackSave(){const pending=state.pendingDxfExport;if(!pending)return closeDxfFallbackSaveDialog();const name=normalizeDxfFilename(dom.exportSaveName?.value||pending.name);downloadBlob(pending.blob,name);closeDxfFallbackSaveDialog();setCommandStatus(t('exportDxf.downloadedFallback',{name}),'strong');}
  async function saveDxfBlob(blob,name){const suggested=normalizeDxfFilename(name);if(typeof window.showSaveFilePicker==='function'){try{const handle=await window.showSaveFilePicker({suggestedName:suggested,types:dxfFilePickerTypes(),excludeAcceptAllOption:false});if(!handle)return false;await writeDxfToHandle(handle,blob,suggested);return true;}catch(err){if(err?.name==='AbortError')return false;console.warn('DXF Save As picker unavailable; using browser download fallback.',err);}}openDxfFallbackSaveDialog(blob,suggested);return null;}
  function serializeReference(ref){
    const base={id:ref.id,type:ref.type,name:ref.name,visible:ref.visible!==false,opacity:Number(ref.opacity??.5),scale:Number(ref.scale??1),origin:ref.origin?{...ref.origin}:{x:0,y:0},floorId:ref.floorId||null,sourceUnit:ref.sourceUnit||null,sourceMeta:ref.sourceMeta?{...ref.sourceMeta}:null,sourceState:ref.sourceState||null,clip:ref.clip?{...ref.clip}:null};
    if(ref.type==='image')return{...base,width:ref.width,height:ref.height,dataUrl:ref.dataUrl||null};
    if(ref.type==='pdf')return{...base,width:ref.width,height:ref.height,dataUrl:ref.dataUrl||null,page:1};
    if(ref.type==='dxf')return{...base,entities:ref.entities||[],bounds:ref.bounds||null,mainBounds:ref.mainBounds||null,outlierCount:ref.outlierCount||0,sourceUnitSpecified:Boolean(ref.sourceUnitSpecified),layers:ref.layers||[],visibleLayers:[...(ref.visibleLayers||[]) ]};
    if(ref.type==='linkedCadRegion')return{...base,regionId:ref.regionId,layers:ref.layers||[],visibleLayers:[...(ref.visibleLayers||[]) ]};
    return base;
  }
  async function hydrateReference(raw){
    const ref={...raw,origin:raw.origin?{...raw.origin}:{x:0,y:0},clip:raw.clip?{...raw.clip}:null,sourceMeta:raw.sourceMeta?{...raw.sourceMeta}:null,sourceState:raw.sourceState||'embedded'};
    if(ref.type==='image'){
      if(!ref.dataUrl)return null;
      try{ref.image=await loadImage(ref.dataUrl);ref.width=ref.width||ref.image.naturalWidth;ref.height=ref.height||ref.image.naturalHeight;}catch(_){return null;}
    }else if(ref.type==='pdf'){
      if(!ref.dataUrl||!Number.isFinite(ref.width)||!Number.isFinite(ref.height))return null;
    }else if(ref.type==='dxf'){
      ref.entities=Array.isArray(ref.entities)?ref.entities:[];ref.layers=Array.isArray(ref.layers)?ref.layers:[];ref.visibleLayers=new Set(Array.isArray(raw.visibleLayers)?raw.visibleLayers:ref.layers);ref.pathsByLayer=buildDxfPaths(ref.entities);ref.textEntities=ref.entities.filter(e=>e.type==='text');ref.bounds=ref.bounds||boundsEntities(ref.entities);ref.mainBounds=ref.mainBounds||ref.bounds;ref.snapIndex=buildSnapIndex(ref.entities,ref.bounds);
    }else if(ref.type==='linkedCadRegion'){
      ref.layers=Array.isArray(ref.layers)?ref.layers:[];ref.visibleLayers=new Set(Array.isArray(raw.visibleLayers)?raw.visibleLayers:ref.layers);
    }
    return ref;
  }
  function makeProjectPayload(){
    return{
      format:'PieniPlan',fileType:'pieniplan-project',schemaVersion:PROJECT_SCHEMA,requiredCapabilities:PROJECT_CAPABILITIES(),projectId:state.projectId||stableId('project'),app:{version:VERSION,build:BUILD},savedAt:new Date().toISOString(),
      sourceDxf:{name:state.sourceDxfName||null,fingerprint:state.sourceDxfFingerprint||null,size:state.sourceDxfSize||0,lastModified:state.sourceDxfLastModified||0,mainBounds:state.sourceDxfMainBounds||null,fullBounds:state.sourceDxfFullBounds||null,outlierCount:state.sourceDxfOutlierCount||0},
      drawing:{objects:state.objects,drawingRegions:state.drawingRegions,references:state.references.map(serializeReference),cadLayerDefinitions:cadLayerStore?cadLayerStore.serialize():cadLayersModule.serialize(state.cadLayerDefinitions),cadLayerVisibility:[...state.cadLayerVisibility],cadRegionLayerVisibility:serializeCadRegionLayerVisibility(),activeCadLayer:state.activeCadLayer,unitSystem:state.unitSystem,sheets:state.sheets,cadMapping:state.cadMapping,baseAxisAngle:state.baseAxisAngle,baseAxisWallId:state.baseAxisWallId,camera:state.camera,toolset:state.toolset,toolSettings:state.toolSettings,planLayerVisibility:planLayers.map(l=>[l.id,l.visible!==false]),recognitionHistory:state.recognitionHistory,buildings:state.buildings,activeBuildingId:state.activeBuildingId,floors:state.floors,activeFloorId:state.activeFloorId,cadWorkRegionId:state.cadWorkRegionId,cadPlanOverlay:Boolean(state.cadPlanOverlay),nextId:state.nextId},debug:{editLog:state.editLog.slice(-100)}
    };
  }
  function projectBaseName(){const raw=state.sourceDxfName||state.projectFileName||'PieniPlan';return sanitizeFilename(String(raw).replace(/\.(dxf|pprj|ppln|pieniplan|ppkg)$/i,''));}
  function projectFilePickerTypes(){return[{description:'PieniPlan Project (PPRJ)',accept:{'application/json':['.pprj','.ppln','.pieniplan']}}];}
  function planPackageFilePickerTypes(){return[{description:'PieniPlan Plan Package (PPKG)',accept:{'application/json':['.ppkg']}}];}
  function readBrowserSavedMeta(){try{const raw=localStorage.getItem(LOCAL_PROJECT_META_KEY);return raw?JSON.parse(raw):null;}catch(_){return null;}}
  function writeBrowserSavedMeta(meta){state.browserSavedMeta=meta||null;try{if(meta)localStorage.setItem(LOCAL_PROJECT_META_KEY,JSON.stringify(meta));else localStorage.removeItem(LOCAL_PROJECT_META_KEY);}catch(_){}updateContinueCard();}
  function openLocalProjectDb(){return new Promise((resolve,reject)=>{if(!('indexedDB' in window))return reject(new Error('IndexedDB unavailable'));const req=indexedDB.open(LOCAL_PROJECT_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(LOCAL_PROJECT_STORE))db.createObjectStore(LOCAL_PROJECT_STORE,{keyPath:'key'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB open failed'));});}
  function finalizeSuccessfulProjectSave(revision,{handle=null,localKey=null,name,browserMeta=null}={}){
    if(!documentRevisionIsCurrent(revision)){setCommandStatus(t('project.savedOlderRevision'),'error');return false;}
    state.projectFileHandle=handle;state.projectLocalKey=localKey;state.projectFileName=name;state.sessionKind='normal';sampleReturnWorkspace=null;documentWriteEpoch++;state.dirty=false;updateDocumentStatus();updateContinueCard();
    if(browserMeta)writeBrowserSavedMeta(browserMeta);
    clearRecoverySnapshot({projectId:revision.projectId,maxEpoch:revision.epoch});
    return true;
  }
  async function saveProjectToBrowserStore(json,name,revision){
    const savedAt=new Date().toISOString(),task=async()=>{const db=await openLocalProjectDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction(LOCAL_PROJECT_STORE,'readwrite');tx.objectStore(LOCAL_PROJECT_STORE).put({key:LOCAL_PROJECT_KEY,name,json,savedAt,projectId:revision.projectId,epoch:revision.epoch});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('IndexedDB write failed'));tx.onabort=()=>reject(tx.error||new Error('IndexedDB write aborted'));});}finally{db.close();}};
    const run=browserSaveChain.then(task);browserSaveChain=run.catch(()=>{});await run;
    const meta={name,savedAt,projectId:revision.projectId,epoch:revision.epoch};writeBrowserSavedMeta(meta);
    if(!finalizeSuccessfulProjectSave(revision,{handle:null,localKey:LOCAL_PROJECT_KEY,name,browserMeta:meta}))return false;
    setCommandStatus(t('project.savedLocal',{name}),'strong');return true;
  }
  async function readBrowserStoredProject(){const db=await openLocalProjectDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(LOCAL_PROJECT_STORE,'readonly'),req=tx.objectStore(LOCAL_PROJECT_STORE).get(LOCAL_PROJECT_KEY);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error||new Error('IndexedDB read failed'));});}finally{db.close();}}
  async function writeProjectToHandle(handle,json,name,revision){
    const task=async()=>{const writable=await handle.createWritable();await writable.write(json);await writable.close();},run=fileSaveChain.then(task);fileSaveChain=run.catch(()=>{});await run;
    const savedName=handle.name||name;if(!finalizeSuccessfulProjectSave(revision,{handle,localKey:null,name:savedName}))return false;setCommandStatus(t('project.saved',{name:savedName}),'strong');return true;
  }
  async function saveProjectFile({saveAs=false}={}){
    try{
      const revision=captureDocumentRevision(),payload=makeProjectPayload(),json=JSON.stringify(payload,null,2),name=`${projectBaseName()}.pprj`;
      // Save is deliberately non-download. Completion is accepted only for the exact
      // document revision that started the write, so a later edit can never be marked clean.
      if(!saveAs&&state.projectFileHandle?.createWritable)return await writeProjectToHandle(state.projectFileHandle,json,name,revision);
      return await saveProjectToBrowserStore(json,(state.projectFileName||name).replace(/\.(?:pieniplan|ppln|ppkg)$/i,'.pprj'),revision);
    }catch(err){if(err?.name==='AbortError')return false;console.error(err);alert(t('project.saveFailed',{message:String(err?.message||err)}));return false;}
  }
  function downloadProjectFile(){try{const payload=makeProjectPayload(),json=JSON.stringify(payload,null,2),name=`${projectBaseName()}.pprj`;downloadBlob(new Blob([json],{type:'application/json;charset=utf-8'}),name);setCommandStatus(t('project.downloaded',{name}),'strong');}catch(err){console.error(err);alert(t('project.saveFailed',{message:String(err?.message||err)}));}}
  async function chooseAndOpenProjectFile(){
    if(typeof window.showOpenFilePicker==='function'){
      try{const [handle]=await window.showOpenFilePicker({types:projectFilePickerTypes(),multiple:false,excludeAcceptAllOption:false});if(!handle)return;const file=await handle.getFile();await openProjectFile(file,{handle});return;}catch(err){if(err?.name==='AbortError')return;console.warn('File System Access open failed; falling back to file input.',err);}
    }
    dom.projectFileInput.click();
  }
  async function openBrowserSavedProject(){try{const record=await readBrowserStoredProject();if(!record?.json)throw new Error('No browser-saved project');const file=new File([record.json],record.name||'PieniPlan.pprj',{type:'application/json'});await openProjectFile(file,{localKey:LOCAL_PROJECT_KEY,skipConfirm:true,restoredLocal:true});}catch(err){console.error(err);writeBrowserSavedMeta(null);alert(t('project.openFailed',{message:String(err?.message||err)}));}}
  async function openProjectFile(file,{handle=null,localKey=null,skipConfirm=false,restoredLocal=false}={}){cadCommandSession?.cancel('open-project');
    if(!file)return false;if(!skipConfirm&&!(await requestWorkspaceReplacement()))return false;const request=++projectLoadSequence,epoch=documentWriteEpoch;let saved=null,oldPlanVisibility=null,savedServices=null;
    try{
      const raw=modules.projectStaging.validate(JSON.parse(await file.text()));
      const d=raw.drawing,refs=[];for(const rr of d.references||[]){const ref=await hydrateReference(rr);if(!ref)throw new Error('reference-hydration-failed');refs.push(ref);}
      if(request!==projectLoadSequence||epoch!==documentWriteEpoch)throw new Error('stale-project-load');
      cancelImportJob();featureFill?.discardTransient();saved={...state};oldPlanVisibility=planLayers.map(l=>l.visible);savedServices={cadLayerStore,cadContext,cadSelectionService,cadAppearanceEnabled,cadQueryIndex,planObjectCache,planGeometryCache};
      state.selectedObjectIds=new Set();state.spaceFaceCache={revision:-1,floorId:null,faces:[]};planObjectCache={revision:-1,count:-1,floorId:null,objects:[]};
      state.editLog=Array.isArray(raw.debug?.editLog)?raw.debug.editLog.slice(-100):[];
      state.objects=Array.isArray(d.objects)?d.objects:[];state.drawingRegions=Array.isArray(d.drawingRegions)?d.drawingRegions:[];state.references=refs;state.cadLayerVisibility=new Map(Array.isArray(d.cadLayerVisibility)?d.cadLayerVisibility:[['0',true]]);restoreCadRegionLayerVisibility(d.cadRegionLayerVisibility);state.cadLayerDefinitions=cadLayersModule.synthesize(d.cadLayerDefinitions,state.objects,state.cadLayerVisibility);state.activeCadLayer=d.activeCadLayer||'0';state.unitSystem=d.unitSystem==='imperial'?'imperial':'metric';state.sheets=Array.isArray(d.sheets)?d.sheets:[];state.cadMapping=d.cadMapping||null;state.baseAxisAngle=Number(d.baseAxisAngle)||0;state.baseAxisWallId=d.baseAxisWallId||null;state.camera=d.camera&&Number.isFinite(d.camera.zoom)?{...d.camera}:{cx:0,cy:0,zoom:.12};state.toolSettings={...state.toolSettings,...(d.toolSettings||{}),planDisplayMode:false,planDisplayStyle:'solid',planLineAppearance:{color:'#8e9bab',width:1.4,dashScale:1,...(d.toolSettings?.planLineAppearance||{})}};state.recognitionHistory=Array.isArray(d.recognitionHistory)?d.recognitionHistory:[];state.buildings=Array.isArray(d.buildings)&&d.buildings.length?d.buildings:[{id:'building_1',name:t('building.defaultName'),order:0}];state.activeBuildingId=d.activeBuildingId||state.buildings[0].id;state.floors=Array.isArray(d.floors)&&d.floors.length?d.floors:[{id:'floor_1',name:'1F',sourceRegionId:null,buildingId:state.buildings[0].id,order:0}];state.activeFloorId=d.activeFloorId||state.floors[0].id;state.cadWorkRegionId=d.cadWorkRegionId&&state.drawingRegions.some(r=>r.id===d.cadWorkRegionId)?d.cadWorkRegionId:null;state.cadPlanOverlay=Boolean(d.cadPlanOverlay);ensureFloorModel();const legacyEdgeChanged=migrateLegacyPlanLinesToEdges();repairDefaultFloorNamesFromRegions();const floorIsolationChanged=repairFloorRegionIsolation();const spaceMetadataChanged=ensureSpaceMetadata(),doorMetadataChanged=ensureDoorMetadata();let junctionRepairChanged=false;for(const floor of state.floors)junctionRepairChanged=repairPersistentPlanJunctions(floor.id)||junctionRepairChanged;state.nextId=Math.max(Number(d.nextId)||1,state.objects.length+state.references.length+state.drawingRegions.length+1);
      if(Array.isArray(d.planLayerVisibility)){const vis=new Map(d.planLayerVisibility);for(const l of planLayers)l.visible=vis.get(l.id)!==false;}
      const src=raw.sourceDxf||{};state.sourceDxfName=src.name||null;state.sourceDxfFingerprint=src.fingerprint||null;state.sourceDxfSize=Number(src.size)||0;state.sourceDxfLastModified=Number(src.lastModified)||0;state.sourceDxfMainBounds=src.mainBounds||null;state.sourceDxfFullBounds=src.fullBounds||null;state.sourceDxfOutlierCount=Number(src.outlierCount)||0;state.projectId=raw.projectId||raw.project?.id||stableId('project');state.projectFileName=file.name;state.projectFileHandle=/\.pprj$/i.test(file.name)?handle:null;state.projectLocalKey=localKey;state.sessionKind='normal';sampleReturnWorkspace=null;
      state.selectedObjectId=null;state.selectedObjectIds.clear();state.previousCadSelectionIds=new Set();state.lastCadObjectId=null;state.overlapCycle=null;state.selectedReferenceId=null;state.selectedRegionId=null;state.wallRecognitionPreview=null;state.curveReconstruction=null;state.annotationDraft=null;state.spaceGapDiagnostic=null;state.expandedBuildingIds=new Set([state.activeBuildingId]);state.expandedFloorIds=new Set();state.buildingOrderEditing=false;state.floorOrderEditingBuildingId=null;state.history=[];state.future=[];state.layerFilter='';state.layerRevealRequested=false;state.dirty=Boolean(floorIsolationChanged||legacyEdgeChanged||spaceMetadataChanged||doorMetadataChanged||junctionRepairChanged);initializeCadServices({newDocument:true});rebuildObjectSnapIndex({touch:false});refreshSpaces();saved=null;switchToolset(d.toolset==='cad'?'cad':'plan',{skipMapping:true});updateAll();setCommandStatus(restoredLocal?t('project.restoredLocal',{name:file.name}):t('project.opened',{name:file.name}),'strong');return true;
    }catch(err){if(saved){Object.assign(state,saved);planLayers.forEach((l,i)=>l.visible=oldPlanVisibility[i]);({cadLayerStore,cadContext,cadSelectionService,cadAppearanceEnabled,cadQueryIndex,planObjectCache,planGeometryCache}=savedServices);}console.error(err);alert(t('project.openFailed',{message:String(err?.message||err)}));return false;}
  }

  function planObjectsForDrawing(floorId){return state.objects.filter(o=>o.floorId===floorId&&(isSemanticObject(o)||o.type==='line')).map(o=>JSON.parse(JSON.stringify(o)));}
  function makePlanPackage({buildingName=projectBaseName(),discipline=''}={}){
    ensureFloorModel();ensureSpaceMetadata();
    const buildings=state.buildings.map((building,buildingIndex)=>{const drawings=floorsForBuilding(building.id).map((floor,index)=>({id:floor.id,name:floor.name||`${t('floor.drawing')} ${index+1}`,order:index,discipline:discipline||floor.discipline||'architectural',sourceProjectId:state.projectId||null,sourceRegionId:floor.sourceRegionId||null,objects:planObjectsForDrawing(floor.id)}));return{id:building.id||stableId('building'),name:String(state.buildings.length===1?(buildingName||building.name):(building.name||defaultBuildingName(buildingIndex))).trim()||defaultBuildingName(buildingIndex),order:buildingIndex,drawings};});
    return{format:'PieniPlanPlanPackage',fileType:'pieniplan-plan-package',schemaVersion:1,packageId:stableId('ppkg'),createdAt:new Date().toISOString(),app:{version:VERSION,build:BUILD},buildings};
  }
  function validatePlanPackage(raw){if(raw?.format!=='PieniPlanPlanPackage'||!Array.isArray(raw.buildings))throw new Error(t('ppkg.invalid'));const buildingIds=new Set(),drawingIds=new Set(),objectIds=new Set();for(const building of raw.buildings){if(!building?.id||!Array.isArray(building.drawings)||buildingIds.has(building.id))throw new Error(t('ppkg.invalid'));buildingIds.add(building.id);for(const drawing of building.drawings||[]){if(!drawing?.id||!Array.isArray(drawing.objects)||drawingIds.has(drawing.id))throw new Error(t('ppkg.invalid'));drawingIds.add(drawing.id);for(const obj of drawing.objects){if(!obj?.id||objectIds.has(obj.id))throw new Error(t('ppkg.invalid'));objectIds.add(obj.id);}}}return raw;}
  function downloadPlanPackage(pkg,name){downloadBlob(new Blob([JSON.stringify(pkg,null,2)],{type:'application/json;charset=utf-8'}),`${sanitizeFilename(name||'PieniPlan_Plans')}.ppkg`);}
  function openPlanPackageExportDialog(){ensureFloorModel();const single=state.buildings.length===1;dom.planPackageBuildingName.value=single?(state.buildings[0]?.name||projectBaseName()):projectBaseName();dom.planPackageBuildingName.disabled=!single;dom.planPackageBuildingName.title=single?'':t('building.multiExportHint');dom.planPackageDiscipline.value='';dom.planPackageBackdrop.hidden=false;setTimeout(()=>{if(single){dom.planPackageBuildingName.focus();dom.planPackageBuildingName.select();}else dom.planPackageDiscipline.focus();},0);}
  function closePlanPackageExportDialog(){dom.planPackageBackdrop.hidden=true;}
  function exportPlanPackageNow(){try{const buildingName=(dom.planPackageBuildingName.value||projectBaseName()).trim()||projectBaseName(),discipline=dom.planPackageDiscipline.value||'',pkg=makePlanPackage({buildingName,discipline}),packageName=state.buildings.length===1?`${buildingName}_Plan`:`${projectBaseName()}_Plans`;downloadPlanPackage(pkg,packageName);closePlanPackageExportDialog();setCommandStatus(t('ppkg.exported',{name:`${packageName}.ppkg`}),'strong');}catch(err){console.error(err);alert(t('ppkg.exportFailed',{message:String(err?.message||err)}));}}
  async function readPlanPackageFile(file){return validatePlanPackage(JSON.parse(await file.text()));}
  function remapImportedPlanObject(obj,idMap,floorId,usedObjectIds){const copy=JSON.parse(JSON.stringify(obj)),oldId=copy.id;let nextId=oldId;if(!nextId||usedObjectIds.has(nextId))nextId=stableId(copy.type||'obj');copy.id=nextId;if(oldId)idMap.set(oldId,nextId);usedObjectIds.add(nextId);copy.floorId=floorId;return copy;}
  function repairImportedPlanRelations(objects,idMap){for(const o of objects){if(o.wallId&&idMap.has(o.wallId))o.wallId=idMap.get(o.wallId);if(Array.isArray(o.wallIds))o.wallIds=o.wallIds.map(id=>idMap.get(id)||id);if(o.constraints?.reference?.wallId&&idMap.has(o.constraints.reference.wallId))o.constraints.reference.wallId=idMap.get(o.constraints.reference.wallId);if(o.attachments)for(const ep of['a','b'])if(o.attachments?.[ep]?.wallId&&idMap.has(o.attachments[ep].wallId))o.attachments[ep].wallId=idMap.get(o.attachments[ep].wallId);}}
  function pristinePlaceholderDrawing(){
    ensureFloorModel();if(state.buildings.length!==1||state.floors.length!==1)return null;const floor=state.floors[0];if(floor.sourceRegionId)return null;
    if(state.objects.some(o=>o.floorId===floor.id))return null;if(state.references.some(r=>r.floorId===floor.id))return null;
    const name=String(floor.name||'').trim().toLocaleLowerCase();if(!['1f','drawing 1','도면 1'].includes(name))return null;return floor;
  }
  function importedPlanPackageData(building,{existingFloorIds=new Set(),existingObjectIds=new Set(),buildingId=null}={}){
    const floors=[],objects=[],usedFloorIds=new Set(existingFloorIds),usedObjectIds=new Set(existingObjectIds),targetBuildingId=buildingId||building.id||stableId('building');
    for(const drawing of [...(building.drawings||[])].sort((a,b)=>(a.order??0)-(b.order??0))){
      let floorId=drawing.id;if(!floorId||usedFloorIds.has(floorId))floorId=stableId('drawing');usedFloorIds.add(floorId);
      const floor={id:floorId,name:drawing.name||t('floor.drawing'),sourceRegionId:null,discipline:drawing.discipline||'architectural',sourceDrawingId:drawing.id&&drawing.id!==floorId?drawing.id:null,buildingId:targetBuildingId,order:floors.length};floors.push(floor);
      const idMap=new Map(),objs=(drawing.objects||[]).map(o=>remapImportedPlanObject(o,idMap,floorId,usedObjectIds));repairImportedPlanRelations(objs,idMap);objects.push(...objs);
    }
    if(!floors.length)throw new Error(t('ppkg.invalid'));return{floors,objects};
  }
  function replaceWorkspaceWithPlanPackage(pkg,file){
    const buildings=[],floors=[],objects=[],usedBuildingIds=new Set(),usedFloorIds=new Set(),usedObjectIds=new Set();
    for(const [index,source] of [...pkg.buildings].sort((a,b)=>(a.order??0)-(b.order??0)).entries()){
      let buildingId=source.id||stableId('building');if(usedBuildingIds.has(buildingId))buildingId=stableId('building');usedBuildingIds.add(buildingId);const building={id:buildingId,name:source.name||defaultBuildingName(index),order:index};buildings.push(building);const data=importedPlanPackageData(source,{existingFloorIds:usedFloorIds,existingObjectIds:usedObjectIds,buildingId});for(const f of data.floors)usedFloorIds.add(f.id);for(const o of data.objects)usedObjectIds.add(o.id);floors.push(...data.floors);objects.push(...data.objects);
    }
    if(!buildings.length||!floors.length)return false;
    state.references=[];state.objects=objects;state.drawingRegions=[];state.cadLayerVisibility=new Map([['0',true]]);state.cadRegionLayerVisibility=new Map();state.cadLayerDefinitions=new Map([['0',cadLayersModule.defaults('0')]]);state.activeCadLayer='0';state.cadMapping=null;state.baseAxisAngle=0;state.baseAxisWallId=null;state.sheets=[];state.sourceDxfName=null;state.sourceDxfFingerprint=null;state.sourceDxfSize=0;state.sourceDxfLastModified=0;state.sourceDxfMainBounds=null;state.sourceDxfFullBounds=null;state.sourceDxfOutlierCount=0;state.buildings=buildings;state.floors=floors;state.activeBuildingId=buildings[0].id;state.activeFloorId=floors[0].id;state.projectId=pkg.packageId||stableId('project');state.projectFileName=file?.name||`${buildings[0].name||'PieniPlan'}.ppkg`;state.projectFileHandle=null;state.projectLocalKey=null;state.sessionKind='normal';sampleReturnWorkspace=null;state.cadWorkRegionId=null;state.cadPlanOverlay=false;state.expandedBuildingIds=new Set([buildings[0].id]);state.expandedFloorIds=new Set();state.buildingOrderEditing=false;state.floorOrderEditing=false;state.floorOrderEditingBuildingId=null;state.history=[];state.future=[];state.editLog=[];clearMultiSelection();state.selectedReferenceId=null;state.selectedRegionId=null;state.dirty=false;normalizeHierarchyOrder();initializeCadServices({newDocument:true});rebuildObjectSnapIndex({touch:false});refreshSpaces();switchToolset('plan',{skipMapping:true});updateAll();fitAll();return true;
  }
  async function importPlanPackageFile(file,{mode='import'}={}){if(!file)return;try{const pkg=await readPlanPackageFile(file);if(mode==='open'){if(!(await requestWorkspaceReplacement()))return;replaceWorkspaceWithPlanPackage(pkg,file);setCommandStatus(t('ppkg.opened',{name:file.name}),'strong');return;}if((state.objects.length||state.references.length)&&!pristinePlaceholderDrawing()&&!confirm(t('ppkg.importConfirm')))return;const placeholder=pristinePlaceholderDrawing(),existingFloorIds=new Set((placeholder?[]:state.floors).map(f=>f.id)),existingObjectIds=new Set(state.objects.map(o=>o.id)),existingBuildingIds=new Set((placeholder?[]:state.buildings).map(b=>b.id));pushHistory();if(placeholder){state.floors=[];state.buildings=[];}let importedCount=0,firstFloor=null,firstBuilding=null;for(const [index,source] of [...pkg.buildings].sort((a,b)=>(a.order??0)-(b.order??0)).entries()){let buildingId=source.id||stableId('building');if(existingBuildingIds.has(buildingId))buildingId=stableId('building');existingBuildingIds.add(buildingId);const building={id:buildingId,name:source.name||defaultBuildingName(state.buildings.length+index),order:state.buildings.length};state.buildings.push(building);const data=importedPlanPackageData(source,{existingFloorIds,existingObjectIds,buildingId});for(const f of data.floors)existingFloorIds.add(f.id);for(const o of data.objects)existingObjectIds.add(o.id);state.floors.push(...data.floors);state.objects.push(...data.objects);importedCount+=data.floors.length;if(!firstFloor)firstFloor=data.floors[0];if(!firstBuilding)firstBuilding=building;}normalizeHierarchyOrder();if(firstFloor){state.activeFloorId=firstFloor.id;state.activeBuildingId=firstBuilding.id;state.expandedBuildingIds.add(firstBuilding.id);}clearMultiSelection();touchCadGeometry();markDirty(true);rebuildObjectSnapIndex();refreshSpaces();updateAll();switchInspector('primary');setCommandStatus(t('ppkg.imported',{count:importedCount}),'strong');}catch(err){console.error(err);alert(t('ppkg.openFailed',{message:String(err?.message||err)}));}finally{dom.planPackageFileInput.value='';state.planPackageOpenMode='import';}}

  function closePlanMergeDialog(){dom.planMergeBackdrop.hidden=true;state.planMergeEntries=[];dom.planMergeList.innerHTML='';dom.planMergeSummary.textContent='';dom.planMergeFileInput.value='';}
  function renderPlanMergeDialog(){dom.planMergeList.innerHTML='';let drawingCount=0;state.planMergeEntries.forEach((entry,index)=>{const card=document.createElement('div');card.className='plan-merge-entry';const name=document.createElement('input');name.className='text-input plan-merge-building-input';name.value=entry.buildingName;name.addEventListener('input',()=>entry.buildingName=name.value);const meta=document.createElement('div');meta.className='plan-merge-entry-meta';meta.textContent=t('ppkg.mergeEntryMeta',{file:entry.fileName,count:entry.drawings.length});const discipline=document.createElement('select');discipline.className='select-input plan-merge-discipline';for(const [value,key] of [['','ppkg.keepDiscipline'],['architectural','ppkg.disciplineArchitectural'],['fire','ppkg.disciplineFire'],['electrical','ppkg.disciplineElectrical'],['communications','ppkg.disciplineCommunications'],['mechanical','ppkg.disciplineMechanical'],['facility','ppkg.disciplineFacility'],['structural','ppkg.disciplineStructural'],['other','ppkg.disciplineOther']]){const o=document.createElement('option');o.value=value;o.textContent=t(key);discipline.append(o);}discipline.value=entry.disciplineOverride||'';discipline.addEventListener('change',()=>entry.disciplineOverride=discipline.value);const remove=document.createElement('button');remove.className='mini-action';remove.textContent=t('action.delete');remove.addEventListener('click',()=>{state.planMergeEntries.splice(index,1);renderPlanMergeDialog();});const top=document.createElement('div');top.className='plan-merge-entry-top';top.append(name,remove);const bottom=document.createElement('div');bottom.className='plan-merge-entry-bottom';bottom.append(meta,discipline);card.append(top,bottom);dom.planMergeList.append(card);drawingCount+=entry.drawings.length;});dom.planMergeSummary.textContent=t('ppkg.mergeSummary',{packages:state.planMergeEntries.length,drawings:drawingCount});dom.planMergeExportBtn.disabled=!state.planMergeEntries.length;}
  async function addPlanMergeFiles(files){for(const file of files||[]){try{const pkg=await readPlanPackageFile(file);for(const building of pkg.buildings){const drawings=(building.drawings||[]).map(d=>JSON.parse(JSON.stringify(d)));state.planMergeEntries.push({fileName:file.name,buildingId:building.id||stableId('building'),buildingName:building.name||file.name.replace(/\.ppkg$/i,''),disciplineOverride:'',drawings});}}catch(err){console.error(err);alert(t('ppkg.openFailed',{message:`${file.name}: ${String(err?.message||err)}`}));}}renderPlanMergeDialog();}
  function openPlanMergeDialog(){state.planMergeEntries=[];renderPlanMergeDialog();dom.planMergeBackdrop.hidden=false;dom.planMergeFileInput.click();}
  function mergedDrawingClone(d,disciplineOverride,usedDrawingIds,usedObjectIds){const copy=JSON.parse(JSON.stringify(d));const originalDrawingId=copy.id;if(!copy.id||usedDrawingIds.has(copy.id)){copy.sourceDrawingId=originalDrawingId||null;copy.id=stableId('drawing');}usedDrawingIds.add(copy.id);if(disciplineOverride)copy.discipline=disciplineOverride;copy.discipline=copy.discipline||'architectural';const idMap=new Map();for(const obj of copy.objects||[]){obj.floorId=copy.id;const old=obj.id;if(!old||usedObjectIds.has(old)){const next=stableId(obj.type||'obj');if(old)idMap.set(old,next);obj.id=next;}usedObjectIds.add(obj.id);}if(idMap.size)repairImportedPlanRelations(copy.objects||[],idMap);return copy;}
  function exportMergedPlanPackage(){if(!state.planMergeEntries.length)return;const grouped=new Map(),usedBuildingIds=new Set(),usedDrawingIds=new Set(),usedObjectIds=new Set();for(const entry of state.planMergeEntries){const name=String(entry.buildingName||'Building').trim()||'Building',key=name.toLocaleLowerCase();if(!grouped.has(key)){let id=entry.buildingId||stableId('building');if(usedBuildingIds.has(id))id=stableId('building');usedBuildingIds.add(id);grouped.set(key,{id,name,drawings:[]});}const building=grouped.get(key);for(const d of entry.drawings){const copy=mergedDrawingClone(d,entry.disciplineOverride,usedDrawingIds,usedObjectIds);copy.order=building.drawings.length;building.drawings.push(copy);}}const pkg={format:'PieniPlanPlanPackage',fileType:'pieniplan-plan-package',schemaVersion:1,packageId:stableId('ppkg'),createdAt:new Date().toISOString(),app:{version:VERSION,build:BUILD},buildings:[...grouped.values()]};downloadPlanPackage(pkg,'PieniPlan_Merged_Plans');setCommandStatus(t('ppkg.mergedExported',{count:pkg.buildings.length}),'strong');closePlanMergeDialog();}

  function showProgress(title,ratio,detail){dom.progressToast.hidden=false;dom.progressTitle.textContent=title;dom.progressBar.style.width=`${clamp(ratio,0,1)*100}%`;dom.progressDetail.textContent=detail;}
  function hideProgress(){dom.progressToast.hidden=true;}

  function selectedPlanCalibrationSegment(floorId){
    const ids=selectionIds();if(ids.size!==1)return null;const obj=state.objects.find(o=>o.id===[...ids][0]);
    if(!obj||obj.floorId!==floorId||!obj.a||!obj.b||obj.type==='space'||(obj.type==='wall'&&isArcWall(obj)))return null;
    return{objectId:obj.id,p1:{...obj.a},p2:{...obj.b}};
  }
  function beginCalibration(refId,{preferSelection=true}={}){const ref=state.references.find(r=>r.id===refId);if(!ref||ref.type==='linkedCadRegion')return;const floor=activeFloor(),seg=preferSelection&&floor?selectedPlanCalibrationSegment(floor.id):null;state.selectedReferenceId=refId;state.calibration={refId,floorId:floor?.id||ref.floorId||null,p1:seg?.p1||null,p2:seg?.p2||null,sourceObjectId:seg?.objectId||null};state.drawStart=null;state.drawReferenceAngle=null;state.measureStart=null;state.previewEnd=seg?.p2||null;if(seg)openCalibrationDialog();else{updateContextBar();render();}}
  function scalePointAround(p,anchor,factor){return{x:anchor.x+(p.x-anchor.x)*factor,y:anchor.y+(p.y-anchor.y)*factor};}
  function scaleCurrentFloorGeometry(floorId,anchor,factor){
    if(!floorId||!Number.isFinite(factor)||factor<=0)return;
    for(const o of state.objects){if(o.floorId!==floorId||(!(isSemanticObject(o)||o.type==='line')))continue;
      if(o.p1)o.p1=scalePointAround(o.p1,anchor,factor);if(o.p2)o.p2=scalePointAround(o.p2,anchor,factor);if(o.a)o.a=scalePointAround(o.a,anchor,factor);if(o.b)o.b=scalePointAround(o.b,anchor,factor);if(o.center)o.center=scalePointAround(o.center,anchor,factor);if(o.point)o.point=scalePointAround(o.point,anchor,factor);if(o.seed)o.seed=scalePointAround(o.seed,anchor,factor);if(Array.isArray(o.polygon))o.polygon=o.polygon.map(p=>scalePointAround(p,anchor,factor));
      if(Number.isFinite(o.radius))o.radius*=factor;if(Number.isFinite(o.thickness))o.thickness*=factor;if(Number.isFinite(o.width))o.width*=factor;if(Number.isFinite(o.offset))o.offset*=factor;
      if(o.constraints&&Number.isFinite(o.constraints.fixedLength))o.constraints.fixedLength*=factor;
      if(o.axis&&o.axisBounds){const au=anchor.x*o.axis.ux+anchor.y*o.axis.uy,an=anchor.x*o.axis.nx+anchor.y*o.axis.ny;o.axisBounds={minU:au+(o.axisBounds.minU-au)*factor,maxU:au+(o.axisBounds.maxU-au)*factor,minN:an+(o.axisBounds.minN-an)*factor,maxN:an+(o.axisBounds.maxN-an)*factor};}
      if(o.type==='space'){o.areaM2=Math.abs(polygonArea(o.polygon||[]))/1e6;/* managedAreaM2 is intentionally authoritative and is not scaled. */}
    }
    repairPersistentPlanJunctions(floorId);refreshSpaces();
  }
  function openCalibrationDialog(){const c=state.calibration;if(!c?.p1||!c?.p2)return;const measured=distance(c.p1,c.p2);const floor=c.floorId&&state.floors.find(f=>f.id===c.floorId),hasPlan=Boolean(floor&&floorHasPlanObjects(floor.id));dom.dialogTitle.textContent=t('dialog.calibrate');dom.dialogCopy.textContent=t(c.sourceObjectId?'dialog.calibrationFromPlanCopy':'dialog.calibrationCopy',{distance:formatNumber(measured,2)});dom.dialogInput.value=String(Math.round(measured*100)/100);if(dom.dialogScaleFloorRow){dom.dialogScaleFloorRow.hidden=!hasPlan;dom.dialogScaleFloor.checked=Boolean(hasPlan&&c.sourceObjectId);}dom.dialogBackdrop.hidden=false;setTimeout(()=>{dom.dialogInput.focus();dom.dialogInput.select();},0);}
  function applyCalibration(){const actual=Number(dom.dialogInput.value),c=state.calibration;if(!c||!Number.isFinite(actual)||actual<=0)return;const ref=state.references.find(r=>r.id===c.refId);if(!ref||ref.type==='linkedCadRegion')return;const current=distance(c.p1,c.p2);if(current<=0)return;const factor=actual/current,scaleFloor=Boolean(dom.dialogScaleFloorRow&&!dom.dialogScaleFloorRow.hidden&&dom.dialogScaleFloor?.checked&&c.floorId);pushHistory();const localAnchor=referenceWorldToLocal(ref,c.p1),newScale=ref.scale*factor;ref.scale=newScale;ref.origin={x:c.p1.x-localAnchor.x*newScale,y:c.p1.y-localAnchor.y*newScale};if(scaleFloor)scaleCurrentFloorGeometry(c.floorId,c.p1,factor);state.calibration=null;dom.dialogBackdrop.hidden=true;state.previewEnd=null;markDirty(true);rebuildObjectSnapIndex();updateAll();setCommandStatus(t(scaleFloor?'command.referenceAndFloorCalibrated':'command.referenceCalibrated'),'strong');}

  function visibleCadLayers(region=null){const layers=new Set();for(const o of state.objects){if(!(isCadObject(o)||o.type==='line'))continue;const layer=cadLayerForObject(o);if(!cadLayerVisible(layer,region?.id||null))continue;if(region&&!objectTouchesRegion(o,region))continue;layers.add(layer);}return layers;}
  function regionObjectCount(region){return state.objects.filter(o=>(isCadObject(o)||o.type==='line')&&cadLayerVisible(cadLayerForObject(o),region?.id||null)&&objectTouchesRegion(o,region)).length;}
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
    const building=activeBuilding(),name=uniqueFloorName(suggested||region.name||`${state.floors.length+1}F`),created={id:`floor_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name,sourceRegionId:region.id,buildingId:building.id,order:floorsForBuilding(building.id).length};state.floors.push(created);state.activeBuildingId=building.id;state.activeFloorId=created.id;normalizeHierarchyOrder();return created;
  }
  function repairFloorRegionIsolation(){
    ensureFloorModel();const recognized=state.objects.filter(o=>isSemanticObject(o)&&o.recognizedFromCad&&o.sourceRegionId);if(!recognized.length)return false;let changed=false;const regionIds=[...new Set(recognized.map(o=>o.sourceRegionId))];
    // Prefer explicit floor-name ↔ region-name matches before trusting a stale sourceRegionId.
    for(const regionId of regionIds){const region=state.drawingRegions.find(r=>r.id===regionId),suggested=suggestedFloorNameFromRegion(region);if(!suggested)continue;const byName=state.floors.find(f=>String(f.name||'').toUpperCase()===suggested.toUpperCase());if(byName&&byName.sourceRegionId!==regionId){byName.sourceRegionId=regionId;changed=true;}}
    for(const regionId of regionIds){const region=state.drawingRegions.find(r=>r.id===regionId);if(!region)continue;const suggested=suggestedFloorNameFromRegion(region);let floor=state.floors.find(f=>f.sourceRegionId===regionId);
      if(!floor&&suggested)floor=state.floors.find(f=>String(f.name||'').toUpperCase()===suggested.toUpperCase());
      if(!floor){const building=activeBuilding();floor={id:`floor_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name:uniqueFloorName(suggested||region.name||'Floor'),sourceRegionId:regionId,buildingId:building.id,order:floorsForBuilding(building.id).length};state.floors.push(floor);normalizeHierarchyOrder();changed=true;}
      if(floor.sourceRegionId!==regionId){floor.sourceRegionId=regionId;changed=true;}
      for(const o of recognized){if(o.sourceRegionId===regionId&&o.floorId!==floor.id){o.floorId=floor.id;changed=true;}}
    }
    return changed;
  }

  function openRegionInPlan(region){const floor=ensureFloorForRegion(region);let ref=state.references.find(r=>r.type==='linkedCadRegion'&&r.regionId===region.id);if(!ref){const layers=visibleCadLayers(region);ref={id:uid('ref'),type:'linkedCadRegion',regionId:region.id,floorId:floor.id,name:`${region.name} · CAD`,visible:true,opacity:.48,layers:[...layers],visibleLayers:new Set(layers)};state.references.push(ref);}else{ref.visible=true;ref.floorId=floor.id;}state.activeBuildingId=floor.buildingId;state.activeFloorId=floor.id;state.expandedBuildingIds.add(floor.buildingId);state.expandedFloorIds.add(floor.id);state.selectedReferenceId=ref.id;markDirty(true);switchToolset('plan',{skipMapping:true});switchInspector('primary');fitBounds(region);updateAll();}
  function dxfCadAnnotationEntities(o,layer,region=null){
    let entities='';
    const segment=(a,b)=>{if(!a||!b)return;const clipped=region?clipLineToRect(a,b,region):[a,b];if(clipped)entities+=dxfLine(layer,clipped[0],clipped[1]);};
    const visiblePoint=p=>Boolean(p&&(!region||pointInRect(p,region)));
    if(o.type==='cadText'){
      const lines=cadTextLayout(o,{natural:true}).lines,height=Number(o.height)||180,spacing=height*(Number(o.lineSpacing)||1.25),a=rad(Number(o.rotation)||0);
      for(let i=0;i<lines.length;i++){const point={x:o.point.x+Math.sin(a)*spacing*i,y:o.point.y-Math.cos(a)*spacing*i};if(visiblePoint(point))entities+=dxfText(layer,point,lines[i],height,o.rotation||0);}
    }else if(o.type==='cadDimension'){
      const g=cadDimensionGeometry(o);if(g){for(const seg of(o.segments||annotationDimensionSegments(o)))segment(seg.a,seg.b);const lp=g.labelPoint||g.d1||g.end;if(visiblePoint(lp))entities+=dxfText(layer,lp,cadDimensionLabel(o,g),140);}
    }else if(o.type==='cadLeader'){
      const pts=o.points||[],height=Number(o.height)||140,spacing=height*(Number(o.lineSpacing)||1.2);for(let i=1;i<pts.length;i++)segment(pts[i-1],pts[i]);
      if(pts.length){const anchor=pts.at(-1);for(const [i,line] of String(o.text||'').split(/\r?\n/).entries()){const point={x:anchor.x,y:anchor.y-spacing*i};if(visiblePoint(point))entities+=dxfText(layer,point,line,height,0);}}
    }else if(o.type==='cadHatch'){
      const pts=o.points||[];for(let i=0;i<pts.length;i++)segment(pts[i],pts[(i+1)%pts.length]);
    }
    return entities;
  }
  function dxfLineTypeTable(){return dxfPair(0,'TABLE')+dxfPair(2,'LTYPE')+dxfPair(70,4)+[['CONTINUOUS',0,[]],['DASHED',12,[7,-5]],['DOTTED',5,[0.8,-4.2]],['CENTER',20,[10,-4,2,-4]]].map(([name,len,dashes])=>dxfPair(0,'LTYPE')+dxfPair(2,name)+dxfPair(70,0)+dxfPair(3,name)+dxfPair(72,65)+dxfPair(73,dashes.length)+dxfPair(40,len)+dashes.map(v=>dxfPair(49,v)).join('')).join('')+dxfPair(0,'ENDTAB');}
  function buildRegionDxf(region){
    const ltypeTable=dxfLineTypeTable(),visible=visibleCadLayers();let entities='',layers=new Set(['0']);
    for(const o of state.objects){
      if(o.type==='stair'&&o.floorId===floorForRegion(region.id)?.id){const layer=cadLayerForObject(o);if(cadLayerVisible(layer,region.id)){layers.add(layer);for(const g of modules.planStair.segments(o)){const c=clipLineToRect(g.a,g.b,region);if(c)entities+=dxfLine(layer,c[0],c[1]);}}continue;}
      if(!(isCadObject(o)||o.type==='line')||!objectTouchesRegion(o,region))continue;
      const layer=cadLayerForObject(o);if(!visible.has(layer))continue;layers.add(layer);
      if(modules.cadPolyline.is(o)){for(const e of modules.cadPolyline.get(o).edges){if(e.type==='cadLine'){const clipped=clipLineToRect(e.a,e.b,region);if(clipped)entities+=dxfLine(layer,clipped[0],clipped[1]);}else entities+=dxfCadArc(layer,e);}}
      else if(o.type==='cadLine'||o.type==='line'){const clipped=clipLineToRect(o.a,o.b,region),data=isPlanDisplayArc(o)?dxfCadArc(layer,o):clipped?dxfLine(layer,clipped[0],clipped[1]):'';if(data)entities+=data+(o.planRole==='display'?dxfPair(6,({solid:'CONTINUOUS',dashed:'DASHED',dotted:'DOTTED',dashdot:'CENTER'}[o.lineStyle]||'CONTINUOUS')):'');}
      else if(o.type==='cadCircle')entities+=dxfCircle(layer,o.center,o.radius);
      else if(o.type==='cadArc')entities+=dxfCadArc(layer,o);
      else if(['cadText','cadDimension','cadLeader','cadHatch'].includes(o.type))entities+=dxfCadAnnotationEntities(o,layer,region);
    }
    let layerTable=dxfPair(0,'TABLE')+dxfPair(2,'LAYER')+dxfPair(70,layers.size);for(const name of layers)layerTable+=dxfPair(0,'LAYER')+dxfPair(2,sanitizeLayer(name))+dxfPair(70,0)+dxfPair(62,7)+dxfPair(6,'CONTINUOUS');layerTable+=dxfPair(0,'ENDTAB');
    return dxfPair(0,'SECTION')+dxfPair(2,'HEADER')+dxfPair(9,'$ACADVER')+dxfPair(1,'AC1009')+dxfPair(9,'$INSUNITS')+dxfPair(70,4)+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'TABLES')+ltypeTable+layerTable+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'ENTITIES')+entities+dxfPair(0,'ENDSEC')+dxfPair(0,'EOF');
  }
  async function exportRegionDxf(region){const dxf=buildRegionDxf(region),blob=new Blob([dxf],{type:'application/dxf;charset=utf-8'});await saveDxfBlob(blob,`${sanitizeFilename(region.name||'region')}_PieniPlan.dxf`);}
  function downloadTextFile(text,filename,type='text/plain;charset=utf-8'){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function sanitizeFilename(name){return String(name||'PieniPlan').replace(/[\/:*?"<>|]+/g,'_').trim()||'PieniPlan';}
  function deleteRegion(regionId){pushHistory();state.drawingRegions=state.drawingRegions.filter(r=>r.id!==regionId);state.references=state.references.filter(r=>!(r.type==='linkedCadRegion'&&r.regionId===regionId));if(state.selectedRegionId===regionId)state.selectedRegionId=null;if(state.cadWorkRegionId===regionId)state.cadWorkRegionId=null;markDirty(true);updateAll();}


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
    addContextMenuItem(t('action.editThisRegion'),()=>setCadWorkRegion(region.id,{fit:true}));
    addContextMenuItem(t('action.fit'),()=>{state.selectedRegionId=region.id;fitBounds(region);renderPrimaryPanel();render();});
    addContextMenuItem(t('action.rename'),()=>renameRegion(region));addContextMenuItem(t('feature.editRegion'),()=>featureFill.selectRegion(region));
    addContextMenuDivider();
    addContextMenuItem(t('action.openInPlanReference'),()=>openRegionInPlan(region));
    addContextMenuItem(t('action.openInPlanRecognizeWalls'),()=>beginWallRecognition(region));
    addContextMenuItem(t('action.exportRegionDxf'),()=>exportRegionDxf(region));
    addContextMenuDivider();
    addContextMenuItem(t('action.delete'),()=>deleteRegion(region.id),{danger:true});
    positionContextMenuAtElement(button);
  }

  function wallRecognitionSourceLines(region){
    const result=[];for(const o of state.objects){if(!(o.type==='cadLine'||o.type==='line'))continue;const layer=cadLayerForObject(o);if(!cadLayerVisible(layer,region?.id||null))continue;const clipped=clipLineToRect(o.a,o.b,region);if(!clipped)continue;const len=distance(clipped[0],clipped[1]);if(len<120)continue;let angle=angleDeg(clipped[0],clipped[1])%180;if(angle<0)angle+=180;result.push({id:o.id,layer,a:clipped[0],b:clipped[1],length:len,angle});}return result;
  }
  function wallRecognitionSourceArcs(region){
    const result=[];for(const o of state.objects){if(o.type!=='cadArc')continue;const layer=cadLayerForObject(o);if(!cadLayerVisible(layer,region?.id||null)||!objectTouchesRegion(o,region))continue;const r=Number(o.radius)||0,sweep=Number(o.sweep)||0;if(r<120||Math.abs(sweep)<6)continue;result.push({id:o.id,layer,center:{...o.center},radius:r,startAngle:Number(o.startAngle)||0,sweep,sourceType:o.sourceType||'ARC'});}return result;
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
    const candidates=[];for(const o of state.objects){if(o.type!=='cadArc'||arcWallSourceIds.has(o.id)||!cadLayerVisible(cadLayerForObject(o),region?.id||null)||!objectTouchesRegion(o,region))continue;const sweep=Math.abs(Number(o.sweep)||0),r=Number(o.radius)||0;if(sweep<55||sweep>125||r<450||r>1800)continue;let best=null,bestD=Infinity;for(const w of walls){const pr=candidateWallProjectPoint(o.center,w),limit=Math.max(360,(w.thickness||150)*1.8);if(pr.distance<limit&&pr.distance<bestD){bestD=pr.distance;best={w,pr};}}if(!best)continue;candidates.push({id:`doorCandidate_${candidates.length+1}`,wallCandidateId:best.w.id,t:best.pr.t,width:r,doorType:'hingedSingle',hinge:'start',swing:1,sourceIds:[o.id],confidence:Math.max(.55,1-bestD/800)});}const out=[];for(const c of candidates.sort((a,b)=>b.confidence-a.confidence)){if(out.some(x=>x.wallCandidateId===c.wallCandidateId&&Math.abs(x.t-c.t)<.05))continue;out.push(c);}return out.slice(0,120);
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
    for(const [kind,key] of [['walls','recognition.wallsCount'],['spaces','recognition.spacesCount'],['doors','recognition.doorsCount'],['stairs','recognition.stairsCount']]){const count=result[kind].length,el=dom.recognitionCountEls?.[kind];if(el)el.textContent=t(key,{count:count.toLocaleString()});}const previous=[...(state.recognitionHistory||[])].reverse().find(h=>h.regionId===region.id)?.applied||null;dom.recognitionCreateWalls.checked=result.walls.length>0&&(previous?.walls??true);dom.recognitionCreateSpaces.checked=result.spaces.length>0&&(previous?.spaces??false);dom.recognitionCreateDoors.checked=result.doors.length>0&&(previous?.doors??false);dom.recognitionCreateStairs.checked=result.stairs.length>0&&(previous?.stairs??false);for(const [kind,box]of [['walls',dom.recognitionCreateWalls],['spaces',dom.recognitionCreateSpaces],['doors',dom.recognitionCreateDoors],['stairs',dom.recognitionCreateStairs]])box.disabled=!result[kind].length;dom.recognitionApplyBtn.disabled=result.safetyExceeded;dom.recognitionBackdrop.hidden=false;render();
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
    if(o.type==='door')return`D:${[...(o.recognitionSourceIds||[])].sort().join(',')}:${Math.round((o.t??.5)*1000)}:${Math.round((o.width||0)/5)}:${o.doorType||'hingedSingle'}:${o.hinge||'start'}:${doorSwingSide(o)}:${o.slideDirection===-1?-1:1}`;
    if(o.type==='stair')return`S:${[...(o.recognitionSourceIds||[])].sort().join(',')}:${Number(o.treadCount)||0}:${polygonRecognitionSignature(o.polygon)}`;
    if(o.type==='space')return`P:${polygonRecognitionSignature(o.polygon)}`;
    return`${o.type||'object'}:${o.id||''}`;
  }
  function stampRecognitionBaseline(o){o.recognitionBaselineSignature=recognitionObjectSignature(o);return o;}
  function doorCandidateEquivalentToObject(o,c){if(!o||!c)return false;if(sourceIdOverlapRatio(o.recognitionSourceIds,c.sourceIds)<.5)return false;const widthTol=Math.max(30,Math.max(Number(o.width)||0,Number(c.width)||0)*.08);return Math.abs((o.t??.5)-(c.t??.5))<=.03&&Math.abs((Number(o.width)||0)-(Number(c.width)||0))<=widthTol&&(o.doorType||'hingedSingle')===(c.doorType||'hingedSingle')&&(o.hinge||'start')===(c.hinge||'start')&&doorSwingSide(o)===(c.hinge==='end'?-(c.swing===-1?-1:1):(c.swing===-1?-1:1));}
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

    if(createDoors){for(const c of p.doors||[]){const wallId=wallMap.get(c.wallCandidateId);if(!wallId)continue;if(findExistingDoorForCandidate(c,wallId,floor.id,region.id))continue;const o={id:uid('door'),type:'door',layerId:'doors',wallId,t:c.t,width:c.width,doorType:c.doorType||'hingedSingle',hinge:c.hinge||'start',swing:c.swing||1,swingSide:(c.hinge==='end'?-(c.swing===-1?-1:1):(c.swing===-1?-1:1)),slideDirection:1,recognizedFromCad:true,sourceRegionId:region.id,recognitionSourceIds:[...(c.sourceIds||[])],recognitionConfidence:c.confidence||null,floorId:floor.id};stampRecognitionBaseline(o);state.objects.push(o);}}
    if(createStairs){for(const c of p.stairs||[]){const o={id:uid('stair'),type:'stair',layerId:'stairs',stairType:'straight',polygon:c.polygon.map(q=>({...q})),axis:{...c.axis},axisBounds:{...c.axisBounds},treadCount:c.treadCount,recognizedFromCad:true,sourceRegionId:region.id,recognitionSourceIds:[...(c.sourceIds||[])],recognitionConfidence:c.confidence||null,floorId:floor.id};stampRecognitionBaseline(o);state.objects.push(o);}}
    if(createSpaces){for(const c of p.spaces||[]){const wallIds=(c.wallIds||[]).map(id=>wallMap.get(id)).filter(Boolean);const o={id:uid('space'),type:'space',layerId:'spaces',spaceUuid:makeStableUuid(),name:nextSpaceName(floor.id),spaceType:'unspecified',seed:polygonCentroid(c.polygon),polygon:c.polygon.map(q=>({...q})),wallIds,areaM2:c.area/1e6,managedAreaM2:null,managedAreaSource:null,areaMode:'calculated',manualAreaM2:null,invalid:false,recognizedFromCad:true,sourceRegionId:region.id,recognitionConfidence:c.confidence||null,floorId:floor.id};stampRecognitionBaseline(o);state.objects.push(o);}}

    repairPersistentPlanJunctions(floor.id);
    state.recognitionHistory.push({at:new Date().toISOString(),regionId:region.id,sourceLines:p.lines.length,sourceArcs:p.arcs?.length||0,walls:p.walls.length,spaces:p.spaces.length,doors:p.doors.length,stairs:p.stairs.length,thicknesses:p.thicknessClusters.map(x=>x.value),applied:{walls:createWalls,spaces:createSpaces,doors:createDoors,stairs:createStairs},accepted:{walls:createWalls?p.walls.map(candidateSignature):[],spaces:createSpaces?p.spaces.map(candidateSignature):[],doors:createDoors?p.doors.map(candidateSignature):[],stairs:createStairs?p.stairs.map(candidateSignature):[]}});
    state.wallRecognitionPreview=null;dom.recognitionBackdrop.hidden=true;dom.recognitionApplyBtn.disabled=false;markDirty(true);rebuildObjectSnapIndex();openRegionInPlan(region);renderPrimaryPanel();renderProperties();render();
  }


  function renderPrimaryPanel(){if(state.toolset==='plan')renderPlanFloorPanel();else renderCadLayersPanel();}
  function closeFloorActionMenu(){if(state.floorMenuEl){state.floorMenuEl.remove();state.floorMenuEl=null;}}
  function beginInlineBuildingRename(building,row){closeFloorActionMenu();const nameEl=row.querySelector('.building-name'),wrap=nameEl?.parentElement;if(!wrap)return;const input=document.createElement('input');input.className='floor-inline-rename';input.value=building.name;wrap.replaceChildren(input);let done=false;const finish=commit=>{if(done)return;done=true;if(commit)commitBuildingRename(building,input.value);else renderPlanFloorPanel();};input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();finish(true);}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false);}});input.addEventListener('blur',()=>finish(true),{once:true});setTimeout(()=>{input.focus();input.select();},0);}
  function showBuildingActionMenu(building,owner,row){closeFloorActionMenu();const menu=document.createElement('div');menu.className='floor-action-menu';const add=(label,run,cls='')=>{const b=document.createElement('button');b.textContent=label;if(cls)b.className=cls;b.addEventListener('click',e=>{e.stopPropagation();closeFloorActionMenu();run();});menu.appendChild(b);};add(t('building.rename'),()=>beginInlineBuildingRename(building,row));add(t('building.addDrawing'),()=>addFloor(building.id));add(t('action.delete'),()=>deleteBuilding(building),'danger');document.body.appendChild(menu);state.floorMenuEl=menu;const r=owner.getBoundingClientRect(),m=menu.getBoundingClientRect(),margin=8;let left=Math.min(window.innerWidth-m.width-margin,Math.max(margin,r.right-m.width)),top=r.bottom+5;if(top+m.height>window.innerHeight-margin)top=r.top-m.height-5;menu.style.left=`${Math.round(left)}px`;menu.style.top=`${Math.round(Math.max(margin,top))}px`;}
  function beginInlineFloorRename(floor,row){closeFloorActionMenu();const nameEl=row.querySelector('.floor-name'),wrap=nameEl?.parentElement;if(!wrap)return;const input=document.createElement('input');input.className='floor-inline-rename';input.value=floor.name;wrap.replaceChildren(input);let done=false;const finish=commit=>{if(done)return;done=true;if(commit)commitFloorRename(floor,input.value);else renderPlanFloorPanel();};input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();finish(true);}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false);}});input.addEventListener('blur',()=>finish(true),{once:true});setTimeout(()=>{input.focus();input.select();},0);}
  function showFloorActionMenu(floor,owner,row){closeFloorActionMenu();const menu=document.createElement('div');menu.className='floor-action-menu';const add=(label,run,cls='')=>{const b=document.createElement('button');b.textContent=label;if(cls)b.className=cls;b.addEventListener('click',e=>{e.stopPropagation();closeFloorActionMenu();run();});menu.appendChild(b);};add(t('action.rename'),()=>beginInlineFloorRename(floor,row));if(floor.id===state.activeFloorId&&state.toolset==='plan')add(t('feature.refine'),()=>featureFill.openRefinement(floor.id));add(t('feature.alignment'),()=>featureFill.openAlignment(floor.id));add(t('action.openReference'),()=>{setActiveFloor(floor.id);state.expandedFloorIds.add(floor.id);dom.referenceFileInput.click();});add(t('action.delete'),()=>deleteFloor(floor),'danger');document.body.appendChild(menu);state.floorMenuEl=menu;const r=owner.getBoundingClientRect(),m=menu.getBoundingClientRect(),margin=8;let left=Math.min(window.innerWidth-m.width-margin,Math.max(margin,r.right-m.width)),top=r.bottom+5;if(top+m.height>window.innerHeight-margin)top=r.top-m.height-5;menu.style.left=`${Math.round(left)}px`;menu.style.top=`${Math.round(Math.max(margin,top))}px`;}
  function commitSpaceRename(space,value){const name=String(value||'').trim();if(!space||!name)return renderPlanFloorPanel();if(name===space.name)return renderPlanFloorPanel();pushHistory();space.name=name;markSpaceUserEdited(space);markDirty(true);updateAll();}
  function beginInlineSpaceRename(space,row){const nameEl=row.querySelector('.floor-space-name'),wrap=nameEl?.parentElement;if(!wrap)return;const input=document.createElement('input');input.className='floor-inline-rename space-inline-rename';input.value=space.name||'';wrap.replaceChildren(input);let done=false;const finish=commit=>{if(done)return;done=true;if(commit)commitSpaceRename(space,input.value);else renderPlanFloorPanel();};input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();finish(true);}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false);}});input.addEventListener('blur',()=>finish(true),{once:true});setTimeout(()=>{input.focus();input.select();},0);}
  function deleteSpace(space){if(!space)return;showAppConfirm({title:t('space.deleteTitle',{name:space.name||t('value.space')}),copy:t('space.deleteConfirm',{name:space.name||t('value.space')}),confirmLabel:t('space.deleteAction'),onConfirm:()=>{pushHistory();state.objects=state.objects.filter(o=>o.id!==space.id);if(isSelectedId(space.id))clearMultiSelection();markDirty(true);updateAll();}});}
  function selectSpaceFromTree(floor,space){if(state.activeFloorId!==floor.id){state.activeBuildingId=floor.buildingId;state.activeFloorId=floor.id;state.expandedBuildingIds.add(floor.buildingId);state.expandedFloorIds.add(floor.id);const region=floor.sourceRegionId&&state.drawingRegions.find(x=>x.id===floor.sourceRegionId);if(region)fitBounds(region);}selectOnly(space.id);state.selectedReferenceId=null;state.selectedRegionId=null;renderPlanFloorPanel();renderProperties();render();}
  function showSpaceActionMenu(space,owner,row){closeFloorActionMenu();const menu=document.createElement('div');menu.className='floor-action-menu space-action-menu';const add=(label,run,cls='')=>{const b=document.createElement('button');b.type='button';b.textContent=label;if(cls)b.className=cls;b.addEventListener('click',e=>{e.stopPropagation();closeFloorActionMenu();run();});menu.appendChild(b);};add(t('action.rename'),()=>beginInlineSpaceRename(space,row));const typeWrap=document.createElement('label');typeWrap.className='space-menu-field';const typeLabel=document.createElement('span');typeLabel.textContent=t('property.spaceType');const select=document.createElement('select');for(const item of spaceTypeCatalog){const opt=document.createElement('option');opt.value=item.id;opt.textContent=t(item.labelKey);opt.selected=item.id===(space.spaceType||'unspecified');select.append(opt);}select.addEventListener('click',e=>e.stopPropagation());select.addEventListener('change',e=>{pushHistory();space.spaceType=e.target.value;markSpaceUserEdited(space);markDirty(true);closeFloorActionMenu();updateAll();});typeWrap.append(typeLabel,select);menu.append(typeWrap);const areaWrap=document.createElement('div');areaWrap.className='space-menu-field space-area-editor';const areaLabel=document.createElement('span');areaLabel.textContent=t('space.managedArea');const areaLine=document.createElement('div');areaLine.className='space-area-input-row';const input=document.createElement('input');input.type='number';input.min='0.01';input.step='0.01';input.value=String(Math.round(displaySpaceAreaM2(space)*100)/100);input.setAttribute('aria-label',t('space.managedArea'));input.addEventListener('click',e=>e.stopPropagation());input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();if(setSpaceManualArea(space,input.value))closeFloorActionMenu();}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeFloorActionMenu();}});const unit=document.createElement('span');unit.textContent='m²';const apply=document.createElement('button');apply.type='button';apply.className='space-area-apply';apply.textContent=t('action.apply');apply.addEventListener('click',e=>{e.stopPropagation();if(setSpaceManualArea(space,input.value))closeFloorActionMenu();});areaLine.append(input,unit,apply);areaWrap.append(areaLabel,areaLine);menu.append(areaWrap);if(usesManualSpaceArea(space))add(t('space.useCalculatedArea'),()=>setSpaceCalculatedArea(space));add(t('action.delete'),()=>deleteSpace(space),'danger');document.body.appendChild(menu);state.floorMenuEl=menu;const r=owner.getBoundingClientRect(),m=menu.getBoundingClientRect(),margin=8;let left=Math.min(window.innerWidth-m.width-margin,Math.max(margin,r.right-m.width)),top=r.bottom+5;if(top+m.height>window.innerHeight-margin)top=r.top-m.height-5;menu.style.left=`${Math.round(left)}px`;menu.style.top=`${Math.round(Math.max(margin,top))}px`;}
  function setReferenceOpacity(ref,value,{refreshPanel=true}={}){const pct=clamp(Number(value)||0,0,100);ref.opacity=pct/100;markDirty(true);if(refreshPanel)renderPlanFloorPanel();renderReferences();render();}
  function floorReferenceDisplayName(floor,ref){
    if(ref?.type==='linkedCadRegion'){
      const region=state.drawingRegions.find(r=>r.id===ref.regionId);
      return `${region?.name||floor?.name||''} CAD`.trim();
    }
    return ref?.name||t('panel.reference');
  }
  function renderFloorReferencePlacement(floor,ref){
    const row=document.createElement('div');row.className=`floor-reference-placement ${state.selectedReferenceId===ref.id?'selected':''}`;row.dataset.referenceId=ref.id;
    const header=document.createElement('div');header.className='floor-reference-header';
    const main=document.createElement('button');main.type='button';main.className='floor-reference-main';main.innerHTML=`<span class="floor-reference-name">${escapeHtml(t('panel.reference'))} · ${escapeHtml(floorReferenceDisplayName(floor,ref))}</span>`;main.addEventListener('click',()=>{setActiveFloor(floor.id);state.selectedReferenceId=ref.id;state.selectedObjectId=null;renderPlanFloorPanel();renderProperties();render();});
    const view=document.createElement('button');view.type='button';view.className='mini-action floor-reference-view';view.textContent=t('action.viewReference');view.addEventListener('click',e=>{e.stopPropagation();setActiveFloor(floor.id);fitReference(ref);});
    header.append(main,view);
    const controls=document.createElement('div');controls.className='floor-reference-controls';
    const eye=document.createElement('button');eye.className='eye-button floor-reference-eye';configureVisibilityButton(eye,ref.visible!==false,'reference');eye.addEventListener('click',e=>{e.stopPropagation();ref.visible=!ref.visible;markDirty(true);renderPlanFloorPanel();renderReferences();render();});
    const slider=document.createElement('input');slider.className='floor-reference-slider';slider.type='range';slider.min='0';slider.max='100';slider.step='1';slider.value=String(Math.round((ref.opacity??.5)*100));slider.setAttribute('aria-label',t('panel.opacity'));
    const number=document.createElement('input');number.type='number';number.min='0';number.max='100';number.step='1';number.value=slider.value;number.className='floor-reference-opacity-number';number.setAttribute('aria-label',t('panel.opacityPercent'));
    const unit=document.createElement('span');unit.className='floor-reference-percent-unit';unit.textContent='%';
    slider.addEventListener('input',e=>{number.value=e.target.value;setReferenceOpacity(ref,e.target.value,{refreshPanel:false});});
    number.addEventListener('change',e=>{const v=clamp(Number(e.target.value)||0,0,100);e.target.value=String(Math.round(v));slider.value=e.target.value;setReferenceOpacity(ref,v,{refreshPanel:false});});
    controls.append(eye,slider,number,unit);row.append(header,controls);return row;
  }
  function reorderBuilding(fromId,toId,position='before'){
    if(fromId===toId)return;const from=state.buildings.findIndex(b=>b.id===fromId);if(from<0||!state.buildings.some(b=>b.id===toId))return;
    pushHistory();const [item]=state.buildings.splice(from,1);const target=state.buildings.findIndex(b=>b.id===toId);if(target<0){state.buildings.splice(from,0,item);return;}state.buildings.splice(target+(position==='after'?1:0),0,item);normalizeHierarchyOrder();markDirty(true);renderPlanFloorPanel();
  }
  function reorderFloor(fromId,toId,position='before'){
    if(fromId===toId)return;const fromFloor=state.floors.find(f=>f.id===fromId),toFloor=state.floors.find(f=>f.id===toId);if(!fromFloor||!toFloor||fromFloor.buildingId!==toFloor.buildingId)return;
    const siblings=floorsForBuilding(fromFloor.buildingId),from=siblings.findIndex(f=>f.id===fromId),targetOriginal=siblings.findIndex(f=>f.id===toId);if(from<0||targetOriginal<0)return;pushHistory();const [item]=siblings.splice(from,1);const target=siblings.findIndex(f=>f.id===toId);siblings.splice(target+(position==='after'?1:0),0,item);siblings.forEach((f,i)=>f.order=i);normalizeHierarchyOrder();markDirty(true);renderPlanFloorPanel();
  }
  function renderPlanFloorPanel(){
    ensureFloorModel();ensureSpaceMetadata();closeFloorActionMenu();dom.primaryControls.hidden=false;dom.primaryControls.innerHTML='';dom.primaryList.className='panel-list plan-section-list';dom.primaryList.innerHTML='';
    const toolbar=document.createElement('div');toolbar.className='floor-toolbar';
    const addBuildingBtn=document.createElement('button');addBuildingBtn.className='small-button';addBuildingBtn.textContent=t('building.add');addBuildingBtn.addEventListener('click',addBuilding);
    const reorderBuildings=document.createElement('button');reorderBuildings.className=`small-button ${state.buildingOrderEditing?'active':''}`;reorderBuildings.textContent=t(state.buildingOrderEditing?'building.finishOrder':'building.editOrder');reorderBuildings.addEventListener('click',()=>{state.buildingOrderEditing=!state.buildingOrderEditing;state.floorOrderEditingBuildingId=null;renderPlanFloorPanel();});
    toolbar.append(addBuildingBtn,reorderBuildings);dom.primaryControls.append(toolbar);

    const buildingList=document.createElement('div');buildingList.className=`building-list ${state.buildingOrderEditing?'order-editing':''}`;let dragBuildingId=null;
    for(const building of state.buildings){
      const expanded=state.expandedBuildingIds.has(building.id),selected=state.activeBuildingId===building.id,buildingFloors=floorsForBuilding(building.id),floorOrderEditing=state.floorOrderEditingBuildingId===building.id;
      const card=document.createElement('section');card.className=`building-card ${expanded?'expanded':''} ${selected?'selected':''}`;card.dataset.buildingId=building.id;
      if(state.buildingOrderEditing){
        card.draggable=true;
        card.addEventListener('dragstart',e=>{dragBuildingId=building.id;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',building.id);});
        card.addEventListener('dragend',()=>{card.classList.remove('dragging');dragBuildingId=null;buildingList.querySelectorAll('.drop-before,.drop-after').forEach(x=>{x.classList.remove('drop-before','drop-after');delete x.dataset.dropPosition;});});
        card.addEventListener('dragover',e=>{e.preventDefault();if(dragBuildingId&&dragBuildingId!==building.id){const r=card.getBoundingClientRect(),position=e.clientY<r.top+r.height/2?'before':'after';card.dataset.dropPosition=position;card.classList.toggle('drop-before',position==='before');card.classList.toggle('drop-after',position==='after');}});
        card.addEventListener('dragleave',()=>{card.classList.remove('drop-before','drop-after');delete card.dataset.dropPosition;});
        card.addEventListener('drop',e=>{e.preventDefault();const from=dragBuildingId||e.dataTransfer.getData('text/plain'),position=card.dataset.dropPosition||'before';card.classList.remove('drop-before','drop-after');delete card.dataset.dropPosition;if(from)reorderBuilding(from,building.id,position);});
      }
      const header=document.createElement('div');header.className='building-header';
      if(state.buildingOrderEditing){const handle=document.createElement('span');handle.className='building-reorder-handle';handle.textContent='☰';handle.setAttribute('aria-hidden','true');header.append(handle);}
      const disclosure=document.createElement('button');disclosure.type='button';disclosure.className='building-disclosure';disclosure.textContent=expanded?'▾':'▸';disclosure.setAttribute('aria-label',t(expanded?'building.collapse':'building.expand',{name:building.name}));disclosure.addEventListener('click',e=>{e.stopPropagation();if(expanded)state.expandedBuildingIds.delete(building.id);else state.expandedBuildingIds.add(building.id);renderPlanFloorPanel();});
      const main=document.createElement('div');main.className='building-main';main.innerHTML=`<div class="building-name">${escapeHtml(building.name)}</div>`;main.addEventListener('click',e=>{if(state.buildingOrderEditing||e.target.closest('input'))return;state.activeBuildingId=building.id;renderPlanFloorPanel();});main.addEventListener('dblclick',e=>{if(state.buildingOrderEditing)return;e.preventDefault();beginInlineBuildingRename(building,header);});
      const more=document.createElement('button');more.className='mini-action building-more';more.textContent='•••';more.setAttribute('aria-label',t('action.more'));more.addEventListener('click',e=>{e.stopPropagation();showBuildingActionMenu(building,e.currentTarget,header);});header.append(disclosure,main,more);card.append(header);

      const buildingReveal=document.createElement('div');buildingReveal.className='building-expand-shell';const buildingInner=document.createElement('div');buildingInner.className='building-expand-inner';
      const floorToolbar=document.createElement('div');floorToolbar.className='building-floor-toolbar';
      const addFloorBtn=document.createElement('button');addFloorBtn.className='small-button';addFloorBtn.textContent=t('building.addDrawing');addFloorBtn.addEventListener('click',()=>addFloor(building.id));
      const reorderFloorsBtn=document.createElement('button');reorderFloorsBtn.className=`small-button ${floorOrderEditing?'active':''}`;reorderFloorsBtn.textContent=t(floorOrderEditing?'floor.finishOrder':'building.drawingOrder');reorderFloorsBtn.disabled=buildingFloors.length<2;reorderFloorsBtn.addEventListener('click',()=>{state.floorOrderEditingBuildingId=floorOrderEditing?null:building.id;state.buildingOrderEditing=false;renderPlanFloorPanel();});floorToolbar.append(addFloorBtn,reorderFloorsBtn);buildingInner.append(floorToolbar);

      const list=document.createElement('div');list.className=`floor-list ${floorOrderEditing?'order-editing':''}`;let dragFloorId=null;
      if(!buildingFloors.length){const empty=document.createElement('div');empty.className='section-copy building-empty-copy';empty.textContent=t('building.noDrawings');list.append(empty);}
      for(const floor of buildingFloors){
        const objs=state.objects.filter(o=>o.floorId===floor.id&&(isSemanticObject(o)||o.type==='line')),spaces=objs.filter(o=>o.type==='space'),placements=floorReferencePlacements(floor),floorExpanded=state.expandedFloorIds.has(floor.id),hasChildren=Boolean(spaces.length||placements.length);
        const group=document.createElement('div');group.className=`floor-tree-group ${floor.id===state.activeFloorId?'active':''} ${floorExpanded?'expanded':''}`;group.dataset.floorId=floor.id;
        if(floorOrderEditing){
          group.draggable=true;
          group.addEventListener('dragstart',e=>{dragFloorId=floor.id;group.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',floor.id);});
          group.addEventListener('dragend',()=>{group.classList.remove('dragging');dragFloorId=null;list.querySelectorAll('.drop-before,.drop-after').forEach(x=>{x.classList.remove('drop-before','drop-after');delete x.dataset.dropPosition;});});
          group.addEventListener('dragover',e=>{e.preventDefault();if(dragFloorId&&dragFloorId!==floor.id){const r=group.getBoundingClientRect(),position=e.clientY<r.top+r.height/2?'before':'after';group.dataset.dropPosition=position;group.classList.toggle('drop-before',position==='before');group.classList.toggle('drop-after',position==='after');}});
          group.addEventListener('dragleave',()=>{group.classList.remove('drop-before','drop-after');delete group.dataset.dropPosition;});
          group.addEventListener('drop',e=>{e.preventDefault();const position=group.dataset.dropPosition||'before',from=dragFloorId||e.dataTransfer.getData('text/plain');group.classList.remove('drop-before','drop-after');delete group.dataset.dropPosition;if(from)reorderFloor(from,floor.id,position);});
        }
        const row=document.createElement('div');row.className='floor-row';if(floorOrderEditing){const handle=document.createElement('span');handle.className='floor-reorder-handle';handle.textContent='☰';handle.setAttribute('aria-hidden','true');row.append(handle);}
        const floorDisclosure=document.createElement('button');floorDisclosure.type='button';floorDisclosure.className='floor-disclosure';floorDisclosure.disabled=!hasChildren;floorDisclosure.textContent=hasChildren?(floorExpanded?'▾':'▸'):'';floorDisclosure.setAttribute('aria-label',t(floorExpanded?'floor.collapseSpaces':'floor.expandSpaces',{name:floor.name}));floorDisclosure.addEventListener('click',e=>{e.stopPropagation();if(!hasChildren)return;if(floorExpanded)state.expandedFloorIds.delete(floor.id);else state.expandedFloorIds.add(floor.id);renderPlanFloorPanel();});
        const floorMain=document.createElement('div');floorMain.className='floor-main';floorMain.innerHTML=`<div class="floor-name">${escapeHtml(floor.name)}</div>`;const floorMore=document.createElement('button');floorMore.className='mini-action floor-more';floorMore.setAttribute('aria-label',t('action.more'));floorMore.textContent='•••';
        row.append(floorDisclosure,floorMain,floorMore);row.addEventListener('dblclick',e=>{if(!floorOrderEditing&&!e.target.closest('button'))beginInlineFloorRename(floor,row);});row.addEventListener('click',e=>{if(floorOrderEditing)return;if(!e.target.closest('button')&&!e.target.closest('input'))setActiveFloor(floor.id);});floorMore.addEventListener('click',e=>{e.stopPropagation();showFloorActionMenu(floor,e.currentTarget,row);});group.append(row);
        if(hasChildren){const reveal=document.createElement('div');reveal.className='floor-expand-shell';const inner=document.createElement('div');inner.className='floor-expand-inner';if(placements.length){const refs=document.createElement('div');refs.className='floor-reference-list';for(const placement of placements)refs.append(renderFloorReferencePlacement(floor,placement));inner.append(refs);}if(spaces.length){const children=document.createElement('div');children.className='floor-space-list';for(const space of spaces){const srow=document.createElement('div');srow.className=`floor-space-row ${isSelectedId(space.id)?'selected':''}`;srow.dataset.spaceId=space.id;srow.innerHTML=`<div class="floor-space-main"><div class="floor-space-name">${escapeHtml(space.name||nextSpaceName(floor.id))}</div></div><button class="mini-action floor-space-more" aria-label="${escapeHtml(t('action.more'))}">•••</button>`;srow.addEventListener('click',e=>{if(e.target.closest('button')||e.target.closest('input')||e.target.closest('select'))return;selectSpaceFromTree(floor,space);});srow.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;e.preventDefault();e.stopPropagation();beginInlineSpaceRename(space,srow);});srow.querySelector('.floor-space-more').addEventListener('click',e=>{e.stopPropagation();showSpaceActionMenu(space,e.currentTarget,srow);});children.append(srow);}inner.append(children);}reveal.append(inner);group.append(reveal);}
        list.append(group);
      }
      buildingInner.append(list);buildingReveal.append(buildingInner);card.append(buildingReveal);buildingList.append(card);
    }
    dom.primaryList.append(buildingList);
  }
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
  const LAYER_COLOR_RECENT_KEY='pieniplan-recent-layer-colors';
  function readRecentLayerColors(){try{const raw=JSON.parse(localStorage.getItem(LAYER_COLOR_RECENT_KEY)||'[]');return Array.isArray(raw)?raw.filter(x=>/^#[0-9a-f]{6}$/i.test(x)).slice(0,8):[];}catch(_){return[];}}
  function rememberLayerColor(color){if(!/^#[0-9a-f]{6}$/i.test(String(color)))return;const next=[color.toUpperCase(),...readRecentLayerColors().filter(x=>x.toUpperCase()!==color.toUpperCase())].slice(0,8);try{localStorage.setItem(LAYER_COLOR_RECENT_KEY,JSON.stringify(next));}catch(_){}}
  let layerColorOutsideCleanup=null;
  function closeLayerColorPopover(){document.querySelector('.layer-color-popover')?.remove();layerColorOutsideCleanup?.();layerColorOutsideCleanup=null;}
  function openLayerColorPopover(layer,owner){
    closeLayerColorPopover();closeFloorActionMenu();
    const palette=['#FFFFFF','#C9D1D9','#8B949E','#F85149','#FF9F0A','#FFD60A','#3FB950','#32D7E8','#58A6FF','#3478F6','#A371F7','#FF6BBA','#8B5A2B','#000000','#6E7681','#E6EDF3'];
    const pop=document.createElement('div');pop.className='layer-color-popover';pop.setAttribute('role','dialog');pop.setAttribute('aria-label',t('layer.colorTitle'));
    const title=document.createElement('div');title.className='layer-color-popover-title';title.textContent=t('layer.colorTitle');pop.append(title);
    const makeGrid=(colors)=>{const grid=document.createElement('div');grid.className='layer-color-grid';for(const hex of colors){const b=document.createElement('button');b.type='button';b.className='layer-color-choice';b.style.setProperty('--choice',hex);b.title=hex;b.setAttribute('aria-label',hex);b.addEventListener('click',()=>{rememberLayerColor(hex);setCadLayerProperties(layer,{color:hex});closeLayerColorPopover();});grid.append(b);}return grid;};
    pop.append(makeGrid(palette));
    const recent=readRecentLayerColors();if(recent.length){const label=document.createElement('div');label.className='layer-color-recent-label';label.textContent=t('layer.recentColors');pop.append(label,makeGrid(recent));}
    const custom=document.createElement('button');custom.type='button';custom.className='layer-color-custom';custom.textContent=t('layer.customColor');
    const input=document.createElement('input');input.type='color';input.value=/^#[0-9a-f]{6}$/i.test(String(cadLayerDefinition(layer).color||''))?cadLayerDefinition(layer).color:'#808080';input.hidden=true;
    custom.addEventListener('click',()=>input.click());input.addEventListener('input',()=>{const hex=input.value.toUpperCase();rememberLayerColor(hex);setCadLayerProperties(layer,{color:hex});closeLayerColorPopover();});
    pop.append(custom,input);document.body.append(pop);
    const r=owner.getBoundingClientRect(),m=pop.getBoundingClientRect(),margin=8;let left=Math.max(margin,Math.min(r.left,window.innerWidth-m.width-margin)),top=r.bottom+5;if(top+m.height>window.innerHeight-margin)top=r.top-m.height-5;pop.style.left=`${Math.round(left)}px`;pop.style.top=`${Math.round(Math.max(margin,top))}px`;
    const outside=e=>{if(!pop.contains(e.target)&&e.target!==owner)closeLayerColorPopover();};const outsideTimer=setTimeout(()=>document.addEventListener('pointerdown',outside,true),0);layerColorOutsideCleanup=()=>{clearTimeout(outsideTimer);document.removeEventListener('pointerdown',outside,true);};
  }
  function showCadLayerActionMenu(layer,owner,count){closeLayerColorPopover();closeFloorActionMenu();const menu=document.createElement('div');menu.className='floor-action-menu cad-layer-action-menu';const add=(label,run,{danger=false,disabled=false}={})=>{const b=document.createElement('button');b.type='button';b.textContent=label;if(danger)b.className='danger';b.disabled=disabled;b.addEventListener('click',e=>{e.stopPropagation();if(disabled)return;closeFloorActionMenu();run();});menu.appendChild(b);};if(state.cadWorkRegionId&&cadLayerHasOverride(layer,state.cadWorkRegionId))add(t('layer.useGlobal'),()=>clearCadLayerVisibilityOverride(layer));add(t('action.rename'),()=>{cadLayerRenameTarget=layer;renderCadLayersPanel();});add(t('action.delete'),()=>deleteCadLayer(layer),{danger:true,disabled:layer==='0'||count>0||cadMappingUsesLayer(layer)});document.body.appendChild(menu);state.floorMenuEl=menu;const r=owner.getBoundingClientRect(),m=menu.getBoundingClientRect(),margin=8;let left=Math.min(window.innerWidth-m.width-margin,Math.max(margin,r.right-m.width)),top=r.bottom+5;if(top+m.height>window.innerHeight-margin)top=r.top-m.height-5;menu.style.left=`${Math.round(left)}px`;menu.style.top=`${Math.round(Math.max(margin,top))}px`;}
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
    const layerHeader=document.createElement('div');layerHeader.className='cad-section-header cad-layer-section-header';
    const layerScopeNote=document.createElement('div');layerScopeNote.className='cad-layer-scope-note';const scopeRegion=activeCadWorkRegion();layerScopeNote.textContent=scopeRegion?t('panel.layerScopeRegion',{name:scopeRegion.name||t('region.unnamed')}):t('panel.layerScopeGlobal');
    const layerHeaderActions=document.createElement('div');layerHeaderActions.className='cad-layer-header-actions';
    const addLayer=document.createElement('button');addLayer.className='mini-action';addLayer.textContent=t('action.newLayer');addLayer.addEventListener('click',()=>createCadLayer(null,{beginRename:true}));
    const allOn=document.createElement('button');allOn.className='mini-action cad-layers-all-on';allOn.textContent=t('action.turnAllOn');allOn.addEventListener('click',showAllCadLayers);
    layerHeaderActions.append(addLayer,allOn);layerHeader.append(layerScopeNote,layerHeaderActions);
    const layerColumns=document.createElement('div');layerColumns.className='cad-layer-columns';layerColumns.innerHTML=`<span>${escapeHtml(t('layer.columnVisible'))}</span><span>${escapeHtml(t('layer.columnName'))}</span><span>${escapeHtml(t('layer.columnObjects'))}</span><span>${escapeHtml(t('layer.columnLock'))}</span><span>${escapeHtml(t('layer.columnMore'))}</span>`;
    const layerList=document.createElement('div');
    layerList.className='cad-layer-list';
    layersSection.append(layerHeader,layerColumns,layerList);

    const counts=new Map();
    for(const o of cadWorkObjects()){
      const layer=cadLayerForObject(o);
      counts.set(layer,(counts.get(layer)||0)+1);
    }

    const selectedIds=selectionIds();
    const selectedObjects=[...selectedIds].map(id=>cadContext?.getById(id)||state.objects.find(o=>o.id===id)).filter(Boolean);
    const selectedLayers=new Set(selectedObjects.filter(o=>cadSourceKind(o)==='cad-source').map(cadLayerForObject));
    const selectedLayer=selectedLayers.size===1?[...selectedLayers][0]:null;
    const filter=(state.layerFilter||'').trim().toLocaleLowerCase();
    const entries=cadKnownLayers().map(layer=>[layer,counts.get(layer)||0]).sort((a,b)=>a[0].localeCompare(b[0]));
    let shown=0;

    if(!entries.length){
      const empty=document.createElement('div');
      empty.className='section-copy';
      empty.textContent=t('panel.noCadLayers');
      layerList.appendChild(empty);
    }else{
      for(const[layer,count]of entries){
        if(filter&&!layer.toLocaleLowerCase().includes(filter)&&!selectedLayers.has(layer))continue;
        shown++;
        if(!state.cadLayerVisibility.has(layer))state.cadLayerVisibility.set(layer,true);
        const regionId=state.cadWorkRegionId,override=regionId?cadRegionLayerOverride(regionId,layer):null,hasOverride=override!=null,visible=cadLayerVisible(layer,regionId),row=document.createElement('div');
        const filterForced=Boolean(filter&&selectedLayers.has(layer)&&!layer.toLocaleLowerCase().includes(filter));
        row.className=`list-row cad-layer-row ${selectedLayers.has(layer)?'selected':''} ${filterForced?'filter-forced':''} ${hasOverride?(override?'override-on':'override-off'):''}`.trim();
        row.dataset.layer=layer;

        const eye=document.createElement('button');
        eye.className='eye-button';
        configureVisibilityButton(eye,visible,'layer');
        eye.addEventListener('click',e=>{e.stopPropagation();setCadLayerVisibilityUndoable(layer,!visible);});

        const main=document.createElement('div');main.className='row-main';
        const meta=String(count);
        if(cadLayerRenameTarget===layer){
          const input=document.createElement('input');input.className='cad-layer-name-input';input.value=layer;input.setAttribute('aria-label',t('layer.renameAria',{name:layer}));
          let done=false;const finish=()=>{if(done)return;done=true;const value=input.value;cadLayerRenameTarget=null;if(!renameCadLayer(layer,value))renderCadLayersPanel();};
          input.addEventListener('click',e=>e.stopPropagation());input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();finish();}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();done=true;cadLayerRenameTarget=null;renderCadLayersPanel();}});input.addEventListener('blur',finish,{once:true});main.append(input);setTimeout(()=>{input.focus();input.select();},0);
        }else{
          const def=cadLayerDefinition(layer),color=document.createElement('button');color.type='button';color.className='cad-layer-color-dot';const swatch=/^#[0-9a-f]{6}$/i.test(String(def.color||''))?def.color:'var(--text-3)';color.style.setProperty('--layer-swatch',swatch);color.title=t('layer.colorAria',{name:layer});color.setAttribute('aria-label',color.title);color.addEventListener('click',e=>{e.stopPropagation();openLayerColorPopover(layer,color);});
          const title=document.createElement('div');title.className='row-title';title.title=layer;title.textContent=layer;main.append(color,title);
          if(hasOverride){const mark=document.createElement('span');mark.className='cad-layer-local-override';mark.title=override?t('layer.overrideOn'):t('layer.overrideOff');mark.setAttribute('aria-label',mark.title);main.append(mark);}
        }
        const objectCount=document.createElement('span');objectCount.className='cad-layer-object-count';objectCount.textContent=meta;objectCount.title=t('panel.entities',{count});
        const locked=Boolean(cadLayerDefinition(layer).locked),lockBtn=document.createElement('button');lockBtn.className=`cad-layer-compact-action ${locked?'active':''}`;lockBtn.innerHTML=iconMarkup(locked?'lock':'lock-open');lockBtn.title=locked?t('layer.unlock'):t('layer.lock');lockBtn.setAttribute('aria-label',lockBtn.title);lockBtn.addEventListener('click',e=>{e.stopPropagation();setCadLayerLocked(layer,!locked);});
        const more=document.createElement('button');more.type='button';more.className='cad-layer-compact-action cad-layer-more';more.textContent='⋯';more.title=t('action.more');more.setAttribute('aria-label',t('action.more'));more.addEventListener('click',e=>{e.stopPropagation();showCadLayerActionMenu(layer,more,count);});
        const active=document.createElement('span');active.className='layer-active';active.hidden=state.activeCadLayer!==layer;active.title=t('panel.active');
        row.addEventListener('click',e=>{if(e.target.closest('button,input'))return;setActiveCadLayer(layer);});
        row.append(eye,main,objectCount,lockBtn,more,active);layerList.appendChild(row);
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
      row.className=`region-row compact ${state.selectedRegionId===region.id?'selected':''} ${state.cadWorkRegionId===region.id?'active-scope':''}`.trim();
      row.dataset.region=region.id;
      const main=document.createElement('button');
      main.className='region-main compact';
      main.innerHTML=`<strong title="${escapeHtml(region.name)}">${escapeHtml(region.name)}${regionPlanExists(region)?' <span class="region-plan-badge">'+escapeHtml(t('region.hasPlan'))+'</span>':''}</strong><span>${escapeHtml(t('region.entities',{count:regionObjectCount(region).toLocaleString()}))}</span>`;if(state.cadWorkRegionId===region.id)main.setAttribute('aria-current','true');
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
      if(selectedLayer&&state.layerRevealRequested){
        const row=layerList.querySelector(`[data-layer="${CSS.escape(selectedLayer)}"]`);
        if(row){
          requestAnimationFrame(()=>revealCadLayerRow(layerList,row));
          state.layerRevealRequested=false;
        }
      }
    });
  }

  function revealCadLayerRow(layerList,row){
    if(!layerList||!row)return false;
    // Let the browser resolve the real rendered geometry first. `nearest` avoids
    // gratuitous movement when the row is already visible and stays resilient
    // across text-size presets, Safari/Retina metrics and resized Inspector panes.
    try{row.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});}catch{row.scrollIntoView(false);}
    requestAnimationFrame(()=>{
      if(!row.isConnected||!layerList.isConnected)return;
      const rr=row.getBoundingClientRect(),lr=layerList.getBoundingClientRect(),style=getComputedStyle(layerList);
      const top=lr.top+(parseFloat(style.paddingTop)||0),bottom=lr.bottom-(parseFloat(style.paddingBottom)||0);
      let correction=0;
      if(rr.top<top)correction=rr.top-top;
      else if(rr.bottom>bottom)correction=rr.bottom-bottom;
      if(Math.abs(correction)>.5)layerList.scrollBy({top:correction,left:0,behavior:'auto'});
      row.classList.remove('focus-reveal');void row.offsetWidth;row.classList.add('focus-reveal');
      setTimeout(()=>{if(row.isConnected)row.classList.remove('focus-reveal');},1100);
    });
    return true;
  }

  function cadLayerForObject(obj){const m=state.cadMapping||defaultCadMapping();if(obj?.type==='wall')return m.wallLayer;if(obj?.type==='door')return m.doorLayer;if(obj?.type==='window')return m.windowLayer;if(obj?.type==='dimension')return m.dimensionLayer;return String(obj?.cadLayer||obj?.layer||obj?.sourceLayer||'0');}

  function renderReferences(){
    dom.referenceList.innerHTML='';
    const refs=[];
    if(state.toolset==='plan'){
      const floor=activeFloor();
      refs.push(...state.references.filter(r=>referenceBelongsToFloor(r,floor)));
    }else{
      const overlay=document.createElement('div');overlay.className='plan-overlay-card';
      const floor=cadPlanFloor(),active=activeCadWorkRegion();
      const eye=document.createElement('button');eye.className='eye-button';configureVisibilityButton(eye,Boolean(state.cadPlanOverlay),'reference');
      eye.addEventListener('click',()=>{state.cadPlanOverlay=!state.cadPlanOverlay;clearMultiSelection();renderReferences();render();});
      const copy=document.createElement('div');copy.className='row-main';copy.innerHTML=`<div class="row-title">${escapeHtml(t('cadScope.planOverlay'))}</div><div class="row-meta">${escapeHtml(active&&floor?t('cadScope.planOverlayFloor',{name:floor.name}):t('cadScope.planOverlayUnavailable'))}</div>`;
      overlay.append(eye,copy);dom.referenceList.append(overlay);
      refs.push(...state.references.filter(r=>r.type!=='linkedCadRegion'));
    }
    if(!refs.length){const empty=document.createElement('div');empty.className='section-copy reference-empty';empty.textContent=t(state.toolset==='plan'?'panel.noPlanReferences':'panel.noReferences');dom.referenceList.append(empty);return;}
    for(const r of refs)renderReferenceEntry(r);
  }

  function renderReferenceEntry(r){
    const row=document.createElement('div');row.className=`list-row ${state.selectedReferenceId===r.id?'selected':''}`;
    const eye=document.createElement('button');eye.className='eye-button';configureVisibilityButton(eye,r.visible,'reference');eye.addEventListener('click',e=>{e.stopPropagation();r.visible=!r.visible;markDirty(true);renderReferences();render();});
    const main=document.createElement('div');main.className='row-main';let meta='';
    if(r.type==='dxf')meta=`${t('panel.entities',{count:r.entities.length.toLocaleString()})} · ${r.sourceUnitSpecified?r.sourceUnit:t('panel.unitUnspecified')}${r.outlierCount?` · ${t('document.outliers',{count:r.outlierCount.toLocaleString()})}`:''}`;
    else if(r.type==='pdf')meta=t('reference.pdfMeta',{w:formatNumber(r.width,1),h:formatNumber(r.height,1)});
    else if(r.type==='linkedCadRegion'){const region=state.drawingRegions.find(x=>x.id===r.regionId);meta=region?t('region.linkedReference',{name:region.name,layers:r.visibleLayers?.size||0}):t('region.missing');}
    else meta=`${r.width}×${r.height}px`;
    const sourceBadge=r.type!=='linkedCadRegion'?`<span class="reference-status-badge ${escapeHtml(referenceSourceState(r))}">${escapeHtml(t(`reference.status.${referenceSourceState(r)}`))}</span>`:'';
    main.innerHTML=`<div class="row-title">${escapeHtml(r.name||t('panel.reference'))}${sourceBadge}</div><div class="row-meta">${escapeHtml(meta)}${r.clip?` · ${escapeHtml(t('reference.clipped'))}`:''}</div>`;
    const actions=document.createElement('div');actions.className='row-actions';
    if(r.type!=='linkedCadRegion'){
      const calibrate=document.createElement('button');calibrate.className='mini-action';calibrate.textContent=t('action.referenceDimension');calibrate.dataset.tooltipTitle=t('action.referenceDimension');calibrate.dataset.tooltipKey='tooltip.scaleReference';calibrate.addEventListener('click',e=>{e.stopPropagation();beginCalibration(r.id,{preferSelection:true});});actions.append(calibrate);
      const reconnect=document.createElement('button');reconnect.className='mini-action';reconnect.textContent=t('reference.reconnect');reconnect.addEventListener('click',e=>{e.stopPropagation();beginReferenceReconnect(r);});actions.append(reconnect);
      const clip=document.createElement('button');clip.className='mini-action';clip.textContent=t(r.clip?'reference.reclip':'reference.clip');clip.addEventListener('click',e=>{e.stopPropagation();beginReferenceClip(r);});actions.append(clip);
      if(r.clip){const clear=document.createElement('button');clear.className='mini-action';clear.textContent=t('reference.clearClip');clear.addEventListener('click',e=>{e.stopPropagation();clearReferenceClip(r);});actions.append(clear);}
    }else if(state.toolset==='plan'){
      const region=state.drawingRegions.find(x=>x.id===r.regionId);const re=document.createElement('button');re.className='mini-action';re.textContent=t('floor.reRecognize');re.disabled=!region;re.addEventListener('click',e=>{e.stopPropagation();region&&beginWallRecognition(region);});const cad=document.createElement('button');cad.className='mini-action';cad.textContent=t('floor.editCadShort');cad.disabled=!region;cad.addEventListener('click',e=>{e.stopPropagation();switchToolset('cad',{skipMapping:true,regionId:region?.id||null});});actions.append(re,cad);
    }else{
      const refresh=document.createElement('button');refresh.className='mini-action';refresh.textContent=t('action.refreshLayers');refresh.addEventListener('click',e=>{e.stopPropagation();const region=state.drawingRegions.find(x=>x.id===r.regionId),layers=visibleCadLayers(region||null);r.layers=[...layers];r.visibleLayers=new Set(layers);markDirty(true);renderReferences();render();});actions.append(refresh);
    }
    const fit=document.createElement('button');fit.className='mini-action';fit.textContent=t('action.fit');fit.addEventListener('click',e=>{e.stopPropagation();fitReference(r);});actions.append(fit);
    if(r.type==='dxf'&&r.outlierCount>0){const full=document.createElement('button');full.className='mini-action';full.textContent=t('action.fitAllEntities');full.addEventListener('click',e=>{e.stopPropagation();fitReferenceFull(r);});actions.append(full);}
    row.addEventListener('click',()=>{state.selectedReferenceId=r.id;state.selectedObjectId=null;renderReferences();renderProperties();});row.append(eye,main,actions);dom.referenceList.appendChild(row);
    if(state.toolset==='cad'){
      const control=document.createElement('div');control.className='panel-section reference-opacity-control';control.innerHTML=`<div class="property-row"><div class="property-label">${escapeHtml(t('panel.opacity'))}</div><div class="property-value"><input type="range" min="0.05" max="1" step="0.05" value="${r.opacity}"></div></div>`;control.querySelector('input').addEventListener('input',e=>{r.opacity=Number(e.target.value);markDirty(true);render();});dom.referenceList.appendChild(control);
      if(r.type==='dxf'||r.type==='linkedCadRegion')renderReferenceLayerControls(r);
    }
  }


  function renderReferenceLayerControls(ref){const section=document.createElement('div');section.className='panel-section';const heading=document.createElement('div');heading.className='section-heading';heading.textContent=t('panel.dxfLayers',{count:ref.layers.length});section.appendChild(heading);const actions=document.createElement('div');actions.className='reference-layer-actions';const all=document.createElement('button');all.className='mini-action';all.textContent=t('action.all');const none=document.createElement('button');none.className='mini-action';none.textContent=t('action.none');all.addEventListener('click',()=>{ref.visibleLayers=new Set(ref.layers);markDirty(true);renderReferences();render();});none.addEventListener('click',()=>{ref.visibleLayers=new Set();markDirty(true);renderReferences();render();});actions.append(all,none);section.appendChild(actions);const list=document.createElement('div');list.className='reference-layer-list';for(const layer of ref.layers){const label=document.createElement('label');label.className='reference-layer-row';const cb=document.createElement('input');cb.type='checkbox';cb.checked=ref.visibleLayers.has(layer);cb.addEventListener('change',()=>{cb.checked?ref.visibleLayers.add(layer):ref.visibleLayers.delete(layer);markDirty(true);render();});const text=document.createElement('span');text.textContent=layer;label.append(cb,text);list.appendChild(label);}section.appendChild(list);dom.referenceList.appendChild(section);}


  function iconMarkup(name){return`<span class="ui-icon icon-${name}" aria-hidden="true"></span>`;}

  function configureVisibilityButton(button,visible,kind){const showKey=kind==='reference'?'tooltip.showReference':'tooltip.showLayer',hideKey=kind==='reference'?'tooltip.hideReference':'tooltip.hideLayer';button.innerHTML=iconMarkup(visible?'eye':'eye-off');button.setAttribute('aria-label',t(visible?hideKey:showKey));button.dataset.tooltipTitleKey=visible?hideKey:showKey;delete button.dataset.tooltipKey;delete button.dataset.shortcut;}

  function localizedObjectType(type){if(state.toolset==='plan'&&type==='wall')return t('value.planEdge');const key=type==='cadLine'?'value.cadLine':type==='cadPolyline'?'value.cadPolyline':`value.${type}`;return t(key);}
  function localizedToolName(tool){const keys={select:'tool.select',constraint:'tool.constraint',line:'tool.line',polyline:'tool.polyline',wall:'tool.wall',door:'tool.door',window:'tool.window',space:'tool.space',component:'tool.component',region:'tool.region',measure:'tool.measure',trim:'tool.trim',extend:'tool.extend',rotate:'tool.rotate',reconstruct:'tool.curveReconstruct',delete:'tool.delete'};return t(keys[tool]||`tool.${tool}`);}
  function wallConstraintSummary(wall){const c=ensureWallConstraints(wall),parts=[];if(c.reference)parts.push(t(`constraint.${c.reference.type}`));if(c.orientation)parts.push(t(`constraint.${c.orientation}`));if(Number.isFinite(c.fixedAngle))parts.push(t('constraint.fixedAngleValue',{value:formatNumber(c.fixedAngle,1)}));if(Number.isFinite(c.fixedLength))parts.push(t('constraint.fixedLengthValue',{value:formatNumber(c.fixedLength,1)}));if(c.fixed)parts.push(t('constraint.fixed'));for(const ep of['a','b']){const att=wall.attachments?.[ep];if(att)parts.push(t(att.kind==='coincident'?'constraint.endpointCoincident':'constraint.pointOnLine',{endpoint:ep.toUpperCase()}));}return parts.length?parts.join(' · '):t('constraint.none');}
  function renderProperties(){dom.propertiesPanel.innerHTML='';const ids=selectionIds();if(ids.size>1){propertyText(t('property.selection'),t('value.objectsSelected',{count:ids.size}));if(state.toolset==='cad'){const objects=[...ids].map(id=>cadContext?.getById(id)||state.objects.find(o=>o.id===id)).filter(Boolean),cadObjects=objects.filter(o=>cadSourceKind(o)==='cad-source');const layers=new Set(cadObjects.map(cadLayerForObject));propertyText(t('property.layers'),layers.size?`${layers.size}`:'—');if(cadObjects.length===objects.length&&cadObjects.length){const options=cadKnownLayers().sort((a,b)=>a.localeCompare(b)).map(name=>({value:name,label:name}));const value=layers.size===1?[...layers][0]:'__mixed__';if(value==='__mixed__')options.unshift({value:'__mixed__',label:t('value.mixed')});propertySelect(t('property.layer'),value,options,v=>{if(v!=='__mixed__')reassignCadObjects(ids,v);});renderCadAppearanceProperties(cadObjects);const denied=cadObjects.find(o=>!cadPolicy(o.id,'modify').allowed);if(denied)propertyText(t('property.status'),cadPolicy(denied.id,'modify').reason==='locked-layer'?t('layer.locked'):t('cad.readOnly'));}else propertyText(t('property.status'),t('cad.readOnlySelection'));}return;}const onlyId=ids.size===1?[...ids][0]:state.selectedObjectId,obj=cadContext?.getById(onlyId)||state.objects.find(o=>o.id===onlyId);if(obj){state.selectedObjectId=obj.id;propertyText(t('property.type'),localizedObjectType(obj.type));if(obj.type==='component'){const asset=componentLibrary.get(obj.assetId);propertyText(t('component.asset'),asset?componentLibrary.label(asset,i18n.language):(obj.assetId||'—'));propertyText(t('component.category'),asset?componentLibrary.categoryLabel(asset.category,i18n.language):'—');propertyNumber(t('component.rotation'),Number(obj.rotation)||0,v=>{if(Number.isFinite(v))editComponent(obj,{rotation:((v%360)+360)%360},'rotation');},'°');propertyText(t('component.width'),asset?`${formatNumber(asset.width*Math.abs(Number(obj.scaleX)||1),0)} mm`:'—');propertyText(t('component.depth'),asset?`${formatNumber(asset.depth*Math.abs(Number(obj.scaleY)||1),0)} mm`:'—');propertyActions([{label:t('component.rotate90'),run:()=>rotateComponent90(obj)},{label:t('component.mirrorX'),run:()=>mirrorComponent(obj,'x')},{label:t('component.mirrorY'),run:()=>mirrorComponent(obj,'y')},{label:t('action.duplicate'),run:()=>duplicateObject(obj)}]);return;}if(state.toolset==='cad'&&cadSourceKind(obj)!=='cad-source'){propertyText(t('property.status'),t('cad.planOverlayReadonly'));return;}
      if(state.toolset==='cad'&&obj.type!=='space'){const layer=cadLayerForObject(obj),sourceKind=cadSourceKind(obj);if(sourceKind==='cad-source'){propertySelect(t('property.layer'),layer,cadKnownLayers().sort((a,b)=>a.localeCompare(b)).map(name=>({value:name,label:name})),v=>reassignCadObjects([obj.id],v));propertyText(t('property.layerState'),cadLayerLocked(layer)?t('layer.locked'):t('layer.unlocked'));propertyActions([{label:cadLayerVisible(layer)?t('action.hideLayer'):t('action.showLayer'),run:()=>setCadLayerVisibilityUndoable(layer,!cadLayerVisible(layer))},{label:cadLayerLocked(layer)?t('layer.unlock'):t('layer.lock'),run:()=>setCadLayerLocked(layer,!cadLayerLocked(layer))},{label:t('action.soloLayer'),run:()=>soloLayer(layer)},{label:t('action.showInLayers'),run:()=>{state.layerRevealRequested=true;switchInspector('primary');renderCadLayersPanel();}}]);}else{propertyText(t('property.layer'),layer||'—');propertyText(t('property.status'),t('cad.planOverlayReadonly'));}}
      if(state.toolset==='cad'){renderCadAppearanceProperties([obj]);
        if(obj.type==='cadText'){propertyText(t('annotation.textContent'),String(obj.text||'').replace(/\s*\n\s*/g,' / ').slice(0,120)||'—');propertyNumber(t('annotation.textHeight'),Number(obj.height)||180,v=>{if(v>0)editCadObject(obj,{height:v},'text-height');},'mm');if(obj.mtext||Number(obj.width)>0)propertyNumber(t('annotation.textWidth'),Number(obj.width)||0,v=>{if(v>=0)editCadObject(obj,{width:v},'text-width');},'mm');propertyActions([{label:t('annotation.editText'),run:()=>openAnnotationTextEditor(obj)}]);return;}
        if(obj.type==='cadLeader'){propertyText(t('annotation.textContent'),String(obj.text||'').replace(/\s*\n\s*/g,' / ').slice(0,120)||'—');propertyNumber(t('annotation.textHeight'),Number(obj.height)||140,v=>{if(v>0)editCadObject(obj,{height:v},'leader-height');},'mm');propertyNumber(t('annotation.textWidth'),Number(obj.width)||1000,v=>{if(v>=0)editCadObject(obj,{width:v},'leader-width');},'mm');propertyActions([{label:t('annotation.editText'),run:()=>openAnnotationTextEditor(obj)}]);return;}
        if(obj.type==='cadHatch'){propertySelect(t('annotation.hatchPattern'),String(obj.pattern||'ANSI31'),['ANSI31','CROSS','SOLID'].map(value=>({value,label:value})),v=>editCadObject(obj,{pattern:v},'hatch-pattern'));if(String(obj.pattern||'ANSI31').toUpperCase()!=='SOLID'){propertyNumber(t('annotation.hatchAngle'),Number(obj.angle??45),v=>{if(Number.isFinite(v))editCadObject(obj,{angle:v},'hatch-angle');},'°');propertyNumber(t('annotation.hatchSpacing'),Number(obj.spacingPx)||16,v=>{if(v>=4)editCadObject(obj,{spacingPx:v},'hatch-spacing');},'px');}if(obj.sourceBoundaryId)propertyActions([{label:t('annotation.updateHatchBoundary'),run:()=>updateHatchFromBoundary(obj)}]);return;}
        if(obj.type==='cadDimension'){const g=cadDimensionGeometry(obj);propertyText(t('annotation.dimensionType'),t('annotation.dimensionType.'+(g?.kind||'aligned')));if(g)propertyText(t('annotation.dimensionValue'),cadDimensionLabel(obj,g));return;}
        if(modules.cadPolyline.is(obj)){const info=modules.cadPolyline.get(obj),modifiable=cadPolicy(obj.id,'modify').allowed;propertyText(t('polyline.vertices'),String(obj.vertices.length));propertyText(t('polyline.segments'),String(info.edges.length));propertyText(t('property.status'),t(obj.closed?'polyline.closed':'polyline.open'));if(modifiable)propertyActions([{label:t(obj.closed?'action.openPolyline':'action.closePolyline'),run:()=>setCadPolylineClosed(obj,!obj.closed)},{label:t('action.duplicate'),run:()=>duplicateObject(obj)},{label:t('action.rotate90'),run:()=>transformCadPolylineOwner(obj,'rotate90')},{label:t('action.mirrorHorizontal'),run:()=>transformCadPolylineOwner(obj,'mirrorX')},{label:t('action.mirrorVertical'),run:()=>transformCadPolylineOwner(obj,'mirrorY')}]);if(obj.source)propertyText(t('property.source'),obj.source);return;}if(!cadPolicy(obj.id,'modify').allowed){if(obj.a&&obj.b)propertyText(t('property.length'),cadLengthText(distance(obj.a,obj.b)));return;}}
      if(((obj.type==='wall'&&!isArcWall(obj))||(obj.type==='line'&&!isPlanDisplayArc(obj))||obj.type==='cadLine')&&obj.a&&obj.b){const cadLength=state.toolset==='cad'&&cadSourceKind(obj)==='cad-source';const changeLength=v=>{if(v>0){if(state.toolset==='cad'&&!cadObjectModifiable(obj))return;if(obj.type==='wall'){setWallLengthConstraintFromInput(obj,v);return;}const ang=rad(angleDeg(obj.a,obj.b));if(state.toolset==='cad')return editCadObject(obj,{b:{x:obj.a.x+Math.cos(ang)*v,y:obj.a.y+Math.sin(ang)*v}},'length');pushHistory();obj.b={x:obj.a.x+Math.cos(ang)*v,y:obj.a.y+Math.sin(ang)*v};markDirty(true);rebuildObjectSnapIndex();updateAll();}};if(cadLength)propertyLength(t('property.length'),distance(obj.a,obj.b),changeLength);else propertyNumber(t('property.length'),distance(obj.a,obj.b),changeLength,'mm');propertyNumber(t('property.angle'),angleDeg(obj.a,obj.b),v=>{if(Number.isFinite(v)){if(state.toolset==='cad'&&!cadObjectModifiable(obj))return;if(obj.type==='wall'){setWallAngleConstraintFromInput(obj,v);return;}const len=distance(obj.a,obj.b),a=rad(v);if(state.toolset==='cad')return editCadObject(obj,{b:{x:obj.a.x+Math.cos(a)*len,y:obj.a.y+Math.sin(a)*len}},'angle');pushHistory();obj.b={x:obj.a.x+Math.cos(a)*len,y:obj.a.y+Math.sin(a)*len};markDirty(true);rebuildObjectSnapIndex();updateAll();}},'°');propertyText(t('property.start'),cadLength?cadPointText(obj.a):`${formatNumber(obj.a.x,1)}, ${formatNumber(obj.a.y,1)}`);propertyText(t('property.end'),cadLength?cadPointText(obj.b):`${formatNumber(obj.b.x,1)}, ${formatNumber(obj.b.y,1)}`);}
      if(state.toolset==='plan'&&((obj.type==='line'&&obj.planRole==='display')||obj.type==='wall'))propertySelect(t('plan.lineStyle'),obj.type==='wall'?'solid':obj.lineStyle||'solid',['solid','dashed','dotted','dashdot'].map(value=>({value,label:t('plan.stroke.'+value)})),v=>setPlanStroke(obj,v));
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
      if(obj.type==='door'||obj.type==='window'){propertyNumber(t('property.width'),obj.width,v=>{if(v>0){pushHistory();obj.width=v;markDirty(true);rebuildObjectSnapIndex();updateAll();}},'mm');if(obj.type==='door'){const dt=obj.doorType||'hingedSingle';propertyText(t('property.doorType'),t(`doorType.${dt}`));if(isHingedDoorType(dt)){propertyText(t('property.openingSide'),`${isDoubleLeafDoorType(dt)?t('value.doubleLeaf'):obj.hinge==='end'?t('value.hingeEnd'):t('value.hingeStart')} · ${doorSwingSide(obj)===-1?t('value.swingReverse'):t('value.swingNormal')}`);if(isDoubleLeafDoorType(dt))propertyNumber(t('property.firstLeafRatio'),Math.round(doubleLeafSplit(obj)*100),v=>{if(!Number.isFinite(v)||v<10||v>90)return;pushHistory();obj.firstLeafRatio=v/100;markDirty(true);updateAll();},'%');const actions=[];if(!isDoubleLeafDoorType(dt))actions.push({label:t('action.flipHinge'),run:()=>{pushHistory();flipDoorHingePreserveSide(obj);markDirty(true);updateAll();}});actions.push({label:t('action.flipSwing'),run:()=>{pushHistory();flipDoorSwingSide(obj);markDirty(true);updateAll();}});propertyActions(actions);}else if(!isFireShutterDoorType(dt))propertyActions([{label:t('action.flipSlide'),run:()=>{pushHistory();obj.slideDirection=obj.slideDirection===-1?1:-1;markDirty(true);updateAll();}}]);else propertyText(t('property.fireProtection'),t('doorType.fireShutter'));}}
      if(obj.type==='dimension'){const g=dimensionGeometry(obj);if(g){if(g.associated)propertyNumber(t('property.length'),g.len,v=>applyNumericLabelEdit({objectId:obj.id,kind:'dimensionLength'},v),'mm');else propertyText(t('property.length'),`${formatNumber(g.len,2)} mm`);if(g.associated)propertyText(t('property.association'),t('value.wallLinked'));propertyNumber(t('property.offset'),g.offset,v=>{pushHistory();obj.offset=v;markDirty(true);updateAll();},'mm');}}
      if(obj.type==='space'){propertyTextInput(t('property.spaceName'),obj.name||nextSpaceName(obj.floorId),v=>{const name=String(v||'').trim();if(!name||name===obj.name)return;pushHistory();obj.name=name;markSpaceUserEdited(obj);markDirty(true);updateAll();});propertySelect(t('property.spaceType'),obj.spaceType||'unspecified',spaceTypeCatalog.map(x=>({value:x.id,label:t(x.labelKey)})),v=>{if(v===obj.spaceType)return;pushHistory();obj.spaceType=v;markSpaceUserEdited(obj);markDirty(true);updateAll();});propertySelect(t('property.areaMode'),usesManualSpaceArea(obj)?'manual':'calculated',[{value:'calculated',label:t('space.areaCalculated')},{value:'manual',label:t('space.areaManual')}],v=>{if(v==='calculated'){if(usesManualSpaceArea(obj))setSpaceCalculatedArea(obj);return;}if(!usesManualSpaceArea(obj)){pushHistory();obj.managedAreaM2=Math.max(.01,calculatedSpaceAreaM2(obj));obj.managedAreaSource='user';obj.areaMode='manual';obj.manualAreaM2=obj.managedAreaM2;markSpaceUserEdited(obj);markDirty(true);updateAll();}});if(usesManualSpaceArea(obj))propertyNumber(t('space.managedArea'),obj.managedAreaM2,v=>setSpaceManualArea(obj,v),'m²');propertyText(t('property.calculatedArea'),`${formatNumber(calculatedSpaceAreaM2(obj),2)} m²`);propertyText(t('property.spaceId'),obj.spaceUuid||'—');propertyText(t('property.boundaryWalls'),String(obj.wallIds?.length||0));if(obj.invalid)propertyText(t('property.status'),t('space.invalid'));}
      if(obj.type==='stair'){const f=modules.planStair.frame(obj);if(f){propertyNumber(t('stair.length'),f.length,v=>editStair(obj,{length:v}),'mm');propertyNumber(t('stair.width'),f.width,v=>editStair(obj,{width:v}),'mm');propertyNumber(t('property.treads'),Number(obj.treadCount)||12,v=>editStair(obj,{treadCount:v}),'');propertyNumber(t('stair.spacing'),f.length/(obj.treadCount||12),v=>editStair(obj,{length:v*(obj.treadCount||12)}),'mm');propertyNumber(t('component.rotation'),f.rotation,v=>editStair(obj,{rotation:v}),'°');propertyActions([{label:t('stair.reverse'),run:()=>editStair(obj,{upDirection:obj.upDirection===-1?1:-1})},{label:t('component.rotate90'),run:()=>editStair(obj,{rotation:f.rotation+90})},{label:t('action.duplicate'),run:()=>duplicateObject(obj)}]);}propertyText(t('property.status'),obj.recognizedFromCad?t('value.recognizedFromCad'):t('value.free'));}
      if(obj.type==='cadCircle')propertyText(t('property.length'),`R ${cadLengthText(obj.radius,{precision:2})}`);if(obj.source)propertyText(t('property.source'),obj.source);return;}
    const ref=state.references.find(r=>r.id===state.selectedReferenceId);if(ref){propertyText(t('property.reference'),ref.name);propertyText(t('property.type'),ref.type==='dxf'?'DXF':ref.type==='pdf'?'PDF':ref.type==='linkedCadRegion'?t('value.linkedCadReference'):t('value.image'));if(ref.type==='linkedCadRegion'){const region=state.drawingRegions.find(x=>x.id===ref.regionId);if(region)propertyText(t('property.region'),region.name);propertyText(t('property.layers'),String(ref.visibleLayers?.size||0));}else{propertyText(t('property.scale'),`${formatNumber(ref.scale,6)}×`);propertyText(t('property.origin'),`${formatNumber(ref.origin.x,1)}, ${formatNumber(ref.origin.y,1)}`);}propertyText(t('property.opacity'),`${Math.round(ref.opacity*100)}%`);const actions=[{label:t('action.fit'),run:()=>fitReference(ref)}];if(ref.type!=='linkedCadRegion'){actions.push({label:t('reference.reconnect'),run:()=>beginReferenceReconnect(ref)},{label:t(ref.clip?'reference.reclip':'reference.clip'),run:()=>beginReferenceClip(ref)});if(ref.clip)actions.push({label:t('reference.clearClip'),run:()=>clearReferenceClip(ref)});}if(state.toolset==='plan'&&ref.type!=='linkedCadRegion')actions.push({label:t('action.referenceDimension'),run:()=>beginCalibration(ref.id,{preferSelection:true})});propertyActions(actions);return;}
    if(state.toolset==='plan'){ensureFloorModel();propertyText(t('property.floor'),activeFloor()?.name||'—');propertyText(t('property.document'),currentDocumentName());propertyText(t('property.units'),INTERNAL_UNIT);return;}renderCadLayerProperties();propertyText(t('property.version'),`v${VERSION} · Build ${BUILD}`);propertyText(t('property.document'),currentDocumentName());propertyText(t('property.toolset'),t('value.cadTools'));propertySelect(t('property.units'),state.unitSystem,[{value:'metric',label:t('units.metric')},{value:'imperial',label:t('units.imperial')}],setCadUnitSystem);propertyText(t('property.tool'),localizedToolName(state.activeTool));propertyText(t('property.baseAxis'),`${formatNumber(baseAxisAngle(),1)}°`);if(state.cadMapping)propertyText(t('property.mapping'),mappingSummary());}
  function setCadDrawOrder(ids,front=true){
    const objects=[...ids].map(id=>cadContext.getById(id));if(!objects.length||objects.some(o=>!o||!cadPolicy(o.id,'modify').allowed))return false;
    let edge=0;for(const o of state.objects){if(cadSourceObject(o)&&Number.isFinite(o.drawOrder))edge=front?Math.max(edge,o.drawOrder):Math.min(edge,o.drawOrder);}
    const value=edge+(front?1:-1);if(!Number.isSafeInteger(value))return false;
    const positions=new Map(state.objects.map((o,i)=>[o.id,i]));const changed=commitCadChanges('DRAWORDER',objects.map(o=>({before:o,after:{...o,drawOrder:value},index:positions.get(o.id)})));if(changed)updateAll();return changed;
  }
  function renderCadAppearanceProperties(objects){
    const readonly=objects.some(o=>!cadPolicy(o.id,'modify').allowed),ids=objects.map(o=>o.id),props=modules.cadProperties;
    for(const key of props.keys){const common=props.common(objects,key),value=common.mixed?'__mixed__':common.value;
      if(readonly){propertyText(t('cadProperty.'+key),common.mixed?t('value.mixed'):String(value??t('cadProperty.byLayer')));continue;}
      if(key==='color')propertyTextInput(t('cadProperty.color')+(common.mixed?' · '+t('value.mixed'):''),common.mixed?'':value||'',v=>{if(!setCadObjectProperties(ids,{color:v.trim()||null}))renderProperties();});
      else{const choices=key==='linetype'?['CONTINUOUS','DASHED','CENTER']:['DEFAULT',0.13,0.18,0.25,0.35,0.5,0.7,1];const options=[{value:'',label:t('cadProperty.byLayer')},...choices.map(v=>({value:String(v),label:String(v)}))];if(common.mixed)options.unshift({value:'__mixed__',label:t('value.mixed')});propertySelect(t('cadProperty.'+key),value==null?'':String(value),options,v=>{if(v==='__mixed__')return;setCadObjectProperties(ids,{[key]:v===''?null:key==='lineweight'&&v!=='DEFAULT'?Number(v):v});});}
    }
    if(!readonly)propertyActions([{label:t('cadProperty.front'),run:()=>setCadDrawOrder(ids,true)},{label:t('cadProperty.back'),run:()=>setCadDrawOrder(ids,false)}]);
    if(!readonly&&objects.length>1)propertyActions([{label:t('cadProperty.matchFirst'),run:()=>matchCadProperties(objects[0].id,ids)}]);
  }
  function renderCadLayerProperties(){
    const name=state.activeCadLayer||'0',def=cadLayerDefinition(name);propertySelect(t('cadProperty.currentLayer'),name,cadKnownLayers().map(value=>({value,label:value})),setActiveCadLayer);
    propertySelect(t('cadProperty.linetype'),def.linetype||'CONTINUOUS',['CONTINUOUS','DASHED','CENTER'].map(value=>({value,label:value})),v=>setCadLayerProperties(name,{linetype:v}));
    propertySelect(t('cadProperty.lineweight'),String(def.lineweight??'DEFAULT'),['DEFAULT',.13,.18,.25,.35,.5,.7,1].map(v=>({value:String(v),label:String(v)})),v=>setCadLayerProperties(name,{lineweight:v==='DEFAULT'?v:Number(v)}));
    propertySelect(t('cadProperty.printable'),def.printable===false?'no':'yes',[{value:'yes',label:t('cadProperty.yes')},{value:'no',label:t('cadProperty.no')}],v=>setCadLayerProperties(name,{printable:v==='yes'}));
  }
  function propertyActions(items){const actions=document.createElement('div');actions.className='property-actions';for(const item of items){const b=document.createElement('button');b.className='property-action';b.textContent=item.label;b.addEventListener('click',item.run);actions.appendChild(b);}dom.propertiesPanel.appendChild(actions);}
  function propertyConstraintList(items){const section=document.createElement('div');section.className='constraint-property-section';const heading=document.createElement('div');heading.className='section-heading';heading.textContent=t('property.constraints');section.appendChild(heading);if(!items.length){const empty=document.createElement('div');empty.className='section-copy';empty.textContent=t('constraint.none');section.appendChild(empty);}for(const item of items){const row=document.createElement('div');row.className='constraint-property-row';const text=document.createElement('span');text.textContent=item.label;const remove=document.createElement('button');remove.className='constraint-remove';remove.textContent=t('action.removeConstraint');remove.addEventListener('click',item.run);row.append(text,remove);section.appendChild(row);}dom.propertiesPanel.appendChild(section);}

  function mappingSummary(){const m=state.cadMapping;if(!m)return'—';return t('mapping.summary',{wallMode:t(`mapping.${m.wallRepresentation}`),wallLayer:m.wallLayer,doorLayer:m.doorLayer,windowLayer:m.windowLayer});}
  function propertyText(label,value){const row=document.createElement('div');row.className='property-row';row.innerHTML=`<div class="property-label">${escapeHtml(label)}</div><div class="property-value">${escapeHtml(String(value))}</div>`;dom.propertiesPanel.appendChild(row);}
  function propertyNumber(label,value,onChange,unit=''){const row=document.createElement('div');row.className='property-row';const l=document.createElement('div');l.className='property-label';l.textContent=label;const v=document.createElement('div');v.className='property-value';const input=document.createElement('input');input.type='number';input.step='0.01';input.value=String(Math.round(Number(value)*100)/100);input.addEventListener('change',()=>onChange(Number(input.value)));v.appendChild(input);if(unit){const u=document.createElement('span');u.className='property-unit';u.textContent=unit;v.appendChild(u);}row.append(l,v);dom.propertiesPanel.appendChild(row);}
  function propertyLength(label,valueMm,onChange){const row=document.createElement('div');row.className='property-row';const l=document.createElement('div');l.className='property-label';l.textContent=label;const v=document.createElement('div');v.className='property-value';const input=document.createElement('input');input.type='text';input.inputMode='decimal';input.value=cadLengthText(valueMm,{precision:2});const commit=()=>{const parsed=cadUnitsModule.parseLength(input.value,{defaultUnit:state.unitSystem==='imperial'?'in':'mm'});if(!parsed.ok||!Number.isFinite(parsed.mm)||parsed.mm<=0){setCommandStatus(t('cadFault.invalidLength'),'error');input.value=cadLengthText(valueMm,{precision:2});return;}onChange(parsed.mm);};input.addEventListener('change',commit);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();input.blur();}});v.appendChild(input);row.append(l,v);dom.propertiesPanel.appendChild(row);}
  function propertyTextInput(label,value,onChange){const row=document.createElement('div');row.className='property-row';const l=document.createElement('div');l.className='property-label';l.textContent=label;const v=document.createElement('div');v.className='property-value';const input=document.createElement('input');input.type='text';input.value=String(value??'');input.addEventListener('change',()=>onChange(input.value));v.appendChild(input);row.append(l,v);dom.propertiesPanel.appendChild(row);}
  function propertySelect(label,value,options,onChange){const row=document.createElement('div');row.className='property-row';const l=document.createElement('div');l.className='property-label';l.textContent=label;const v=document.createElement('div');v.className='property-value';const select=document.createElement('select');for(const option of options){const el=document.createElement('option');el.value=option.value;el.textContent=option.label;el.selected=option.value===value;select.append(el);}select.addEventListener('change',()=>onChange(select.value));v.append(select);row.append(l,v);dom.propertiesPanel.appendChild(row);}

  function switchInspector(tab){document.querySelectorAll('.inspector-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.inspector-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===tab));}
  function updateAxisStatus(){
    if(!dom.statusAxis)return;
    dom.statusAxis.textContent=`AXIS ${formatNumber(baseAxisAngle(),1)}°`;
    dom.statusAxis.classList.toggle('active',Boolean(state.baseAxisWallId));
    dom.statusAxis.title=state.baseAxisWallId?t('property.baseAxis'):'';
  }
  function updateAll(){ensureFloorModel();if(dom.statusUnits)dom.statusUnits.textContent=state.toolset==='cad'?(state.unitSystem==='imperial'?'ft/in':'mm'):'mm';updateUndoRedo();updateEmptyState();updateContextBar();updateDocumentStatus();updateCompactViewerState();updateAxisStatus();renderToolRail();renderCadScopeControl();renderPrimaryPanel();renderReferences();renderProperties();render();}

  async function resetProject({skipGuard=false}={}){cadCommandSession?.cancel('new-project');if(!skipGuard&&!(await requestWorkspaceReplacement()))return false;cancelImportJob();featureFill?.discardTransient();state.references=[];state.objects=[];state.drawingRegions=[];state.selectedRegionId=null;state.wallRecognitionPreview=null;state.curveReconstruction=null;state.annotationDraft=null;state.spaceGapDiagnostic=null;state.expandedFloorIds=new Set();state.selectedReferenceId=null;state.selectedObjectId=null;state.selectedObjectIds.clear();state.previousCadSelectionIds=new Set();state.lastCadObjectId=null;state.overlapCycle=null;state.selectionDrag=null;state.hoveredObjectId=null;state.layerFilter='';state.baseAxisAngle=0;state.baseAxisWallId=null;state.history=[];state.future=[];state.editLog=[];state.activeCommand=null;state.spaceHoverPreview=null;state.cadWorkRegionId=null;state.cadPlanOverlay=false;state.nextId=1;state.camera={cx:0,cy:0,zoom:.12};state.cadMapping=null;state.cadLayerVisibility=new Map([['0',true]]);state.cadRegionLayerVisibility=new Map();state.cadLayerDefinitions=new Map([['0',cadLayersModule.defaults('0')]]);state.activeCadLayer='0';state.unitSystem=safeReadDefaultUnit();state.toolSettings.planLineAppearance={color:'#8e9bab',width:1.4,dashScale:1};state.toolSettings.planDisplayMode=false;state.toolSettings.planDisplayStyle='solid';state.sheets=[];state.sourceDxfName=null;state.sourceDxfFingerprint=null;state.sourceDxfSize=0;state.sourceDxfLastModified=0;state.sourceDxfMainBounds=null;state.sourceDxfFullBounds=null;state.sourceDxfOutlierCount=0;state.projectId=stableId('project');state.projectFileName=null;state.projectFileHandle=null;state.projectLocalKey=null;state.sessionKind='normal';sampleReturnWorkspace=null;state.recognitionHistory=[];state.buildings=[{id:'building_1',name:t('building.defaultName'),order:0}];state.activeBuildingId='building_1';state.floors=[{id:'floor_1',name:'1F',sourceRegionId:null,discipline:'architectural',buildingId:'building_1',order:0}];state.expandedBuildingIds=new Set(['building_1']);state.expandedFloorIds=new Set();state.buildingOrderEditing=false;state.floorOrderEditing=false;state.floorOrderEditingBuildingId=null;state.activeFloorId='floor_1';state.dirty=false;initializeCadServices({newDocument:true});rebuildObjectSnapIndex({touch:false});setTool('select',state.toolset==='plan'?'plan':'select');updateAll();updateContinueCard();return true;}

  function createSample(){cadCommandSession?.cancel('sample');if(state.sessionKind!=='sample'){captureSampleReturnWorkspace();if(state.dirty&&state.recoveryEnabled)saveRecoverySnapshot();}if(recoveryTimer){clearTimeout(recoveryTimer);recoveryTimer=null;}projectLoadSequence++;documentWriteEpoch++;state.sessionKind='sample';state.references=[];state.objects=[];state.drawingRegions=[];state.sheets=[];state.camera={cx:0,cy:0,zoom:.12};state.projectId=stableId('sample');state.projectFileName=null;state.projectFileHandle=null;state.projectLocalKey=null;state.workspaceVisited=false;state.buildings=[{id:'building_1',name:defaultBuildingName(0),order:0}];state.activeBuildingId='building_1';state.floors=[{id:'floor_1',name:'1F',sourceRegionId:null,discipline:'architectural',buildingId:'building_1',order:0}];state.activeFloorId='floor_1';state.expandedBuildingIds=new Set(['building_1']);state.expandedFloorIds=new Set();state.buildingOrderEditing=false;state.floorOrderEditing=false;state.floorOrderEditingBuildingId=null;state.unitSystem=safeReadDefaultUnit();state.selectedRegionId=null;state.wallRecognitionPreview=null;state.curveReconstruction=null;state.annotationDraft=null;state.spaceGapDiagnostic=null;state.referenceClipDraft=null;state.recognitionHistory=[];state.cadRotate=null;state.hoveredObjectId=null;state.pan=null;state.shiftGuide=null;state.selectedObjectIds.clear();state.previousCadSelectionIds=new Set();state.lastCadObjectId=null;state.overlapCycle=null;state.selectionDrag=null;state.layerFilter='';state.baseAxisAngle=0;state.baseAxisWallId=null;state.history=[];state.future=[];state.editLog=[];state.activeCommand=null;state.spaceHoverPreview=null;state.cadWorkRegionId=null;state.cadPlanOverlay=false;state.nextId=1;
    const wall=(a,b,th=180)=>{const o={id:uid('wall'),type:'wall',layerId:'walls',floorId:state.activeFloorId,a:{...a},b:{...b},thickness:th,geometry:'straight',attachments:{}};state.objects.push(o);return o;};
    const arcWall=(a,b,control,th=180)=>{const g=circleFromThreePoints(a,b,control);if(!g)return wall(a,b,th);const o={id:uid('wall'),type:'wall',layerId:'walls',floorId:state.activeFloorId,a:{...a},b:{...b},thickness:th,geometry:'arc',...g,attachments:{}};state.objects.push(o);return o;};
    /* Build56 sample: a real editable floor plan whose wall layout reads as the PieniPlan “P”. */
    const left=wall({x:0,y:-5000},{x:0,y:5200},180),top=wall({x:0,y:5200},{x:1800,y:5200},180),spine=wall({x:1800,y:-5000},{x:1800,y:5200},180),bottom=wall({x:1800,y:-5000},{x:0,y:-5000},180);
    const bowlOuter=arcWall({x:1800,y:5200},{x:1800,y:700},{x:6900,y:3000},180);
    const bowlInner=arcWall({x:1800,y:4050},{x:1800,y:1850},{x:4700,y:2950},150);
    const lowerRoom=wall({x:0,y:-1050},{x:1800,y:-1050},150),upperRoom=wall({x:0,y:1100},{x:1800,y:1100},150);
    [top,bottom,lowerRoom,upperRoom].forEach(w=>{attachWallEndpoint(w,'a');attachWallEndpoint(w,'b');});
    attachWallEndpoint(bowlOuter,'a');attachWallEndpoint(bowlOuter,'b');attachWallEndpoint(bowlInner,'a');attachWallEndpoint(bowlInner,'b');
    state.objects.push(
      {id:uid('door'),type:'door',layerId:'doors',floorId:state.activeFloorId,wallId:spine.id,t:.34,width:850,doorType:'hingedSingle',hinge:'start',swing:1,slideDirection:1},
      {id:uid('door'),type:'door',layerId:'doors',floorId:state.activeFloorId,wallId:spine.id,t:.62,width:900,doorType:'hingedSingle',hinge:'end',swing:-1,slideDirection:1},
      {id:uid('window'),type:'window',layerId:'windows',floorId:state.activeFloorId,wallId:bowlOuter.id,t:.30,width:1500},
      {id:uid('window'),type:'window',layerId:'windows',floorId:state.activeFloorId,wallId:bowlOuter.id,t:.69,width:1500},
      {id:uid('window'),type:'window',layerId:'windows',floorId:state.activeFloorId,wallId:left.id,t:.22,width:1200},
      {id:uid('dimension'),type:'dimension',layerId:'dimensions',floorId:state.activeFloorId,wallId:left.id,t1:0,t2:1,offset:700}
    );
    state.cadLayerVisibility=new Map([['0',true]]);state.cadRegionLayerVisibility=new Map();state.cadLayerDefinitions=cadLayersModule.synthesize([{name:'0'}],state.objects,state.cadLayerVisibility);initializeCadServices({newDocument:false});state.cadMapping=null;state.sourceDxfName=null;state.sourceDxfFingerprint=null;state.sourceDxfSize=0;state.sourceDxfLastModified=0;state.sourceDxfMainBounds=null;state.sourceDxfFullBounds=null;state.sourceDxfOutlierCount=0;state.dirty=false;state.selectedObjectId=null;state.selectedObjectIds.clear();state.selectedReferenceId=null;rebuildObjectSnapIndex();switchToolset('plan',{skipMapping:true});updateAll();updateContinueCard();fitAll();}

  function commandMatches(query){return commandCore.matches(query,{plan:state.toolset==='plan'});}
  function renderCommandSuggestions(){commandConsole.renderSuggestions();}
  function renderCommandConsole(){commandConsole.render();}
  function activateCommand(command,tool,category,statusKey){const activated=setTool(tool,category);if(activated===false||state.activeTool!==tool){dom.commandInput.blur();host.focus();return false;}state.activeCommand=command;state.commandPending=null;state.trimPreview=null;state.spaceHoverPreview=null;dom.commandInput.blur();host.focus();recordEdit('command',{command,tool,toolset:state.toolset});if(tool!=='rotate')setCommandStatus(t(statusKey),'strong');return true;}
  function exactCommandToken(upper){return Boolean(upper&&commandMatches(upper).some(item=>(item.aliases||[]).includes(upper)));}
  function finishActiveCommand(){
    const sessionId=state.toolset==='cad'?cadCommandSession?.activeId:null;
    if(sessionId&&!['L','PL'].includes(sessionId))cadCommandSession.cancel('finished');
    if(state.activeTool!=='select'||state.activeCommand||sessionId){setTool('select',state.toolset==='plan'?'plan':'select');setCommandStatus(t('command.finished'),'strong');return true;}
    return false;
  }
  function runCommand(raw){if(state.commandComposing)return false;if(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/.test(String(raw))){setCommandStatus(t('command.englishOnly'),'error');return false;}if(featureFill?.selection.current)return false;
    if(String(raw||'').trim())commandConsole.push('› '+String(raw).trim(),'input');
    const command=String(raw||'').trim();const upper=command.toUpperCase();
    const sessionId=state.toolset==='cad'?cadCommandSession?.activeId:null,plineKeyword=sessionId==='PL'&&['L','LINE','A','ARC','B','BACK','UNDO','C','CLOSE'].includes(upper);
    if(sessionId&&command&&exactCommandToken(upper)&&!plineKeyword){cadCommandSession.cancel('superseded');cadOperationPreview=null;state.activeCommand=null;state.activeTool='select';host.dataset.tool='select';}
    if(state.toolset==='cad'&&modules.nativeDrawCommands.ids.includes(cadCommandSession?.activeId)&&command){const result=reportCadCommand(cadCommands().dispatch({type:'text',text:command}));if(result?.ok&&String(result.code||'').startsWith('committed')){setTool('select','select');setCommandStatus(t('command.finished'),'strong');dom.commandInput.blur();host.focus();}return result;}
    if(state.toolset==='cad'&&modules.nativeTransformCommands.ids.includes(cadCommandSession?.activeId)){const result=reportCadCommand(cadCommands().dispatch(command?{type:'text',text:command}:{type:'enter'}));return result;}
    if(state.toolset==='cad'&&modules.nativeModifyCommands.ids.includes(cadCommandSession?.activeId)){const before=cadCommandSession.describe();const result=reportCadCommand(cadCommands().dispatch({type:'text',text:command}));const after=cadCommandSession.describe();if(before.phase==='distance'){if(result?.ok&&after.phase!=='distance'){dom.commandInput.blur();host.focus();}else focusCadModifyDistanceInput(before.id);}return result;}
    if(state.toolset==='cad'&&modules.nativeModifyCommands.resolve(upper)){const id=modules.nativeModifyCommands.resolve(upper);clearMultiSelection();state.lastCommand=id;if(['BR','J','O','F','CH'].includes(id)){if(!['O','F','CH'].includes(id)){dom.commandInput.blur();host.focus();}const tool=id==='BR'?'break':id==='J'?'join':id==='O'?'offset':id==='CH'?'chamfer':'fillet',activated=setTool(tool,'modify');if(['O','F','CH'].includes(id)&&activated!==false&&state.activeTool===tool)focusCadModifyDistanceInput(id);return{ok:activated!==false&&state.activeTool===tool,code:activated!==false?'started':'unavailable'};}setTool('select','select');state.activeCommand=id;const started=reportCadCommand(cadCommands().start(id));if(started?.ok&&cadCommands().describe()?.phase==='distance')focusCadModifyDistanceInput(id);else{dom.commandInput.blur();host.focus();}return started;}
    if(state.toolset==='cad'&&cadCommandSession?.activeId==='MA')return reportCadCommand(cadCommands().dispatch({type:'text',text:command}));
    if(state.toolset==='cad'&&['MA','MATCHPROP'].includes(upper)){setTool('select','select');clearMultiSelection();state.lastCommand='MA';state.activeCommand='MA';dom.commandInput.blur();host.focus();return reportCadCommand(cadCommands().start('MA'));}
    if(state.toolset==='cad'&&modules.nativeTransformCommands.resolve(upper)){const id=modules.nativeTransformCommands.resolve(upper),tool={M:'move',CO:'copy',RO:'rotate',MI:'mirror',SC:'scale',S:'stretch',AR:'array',AL:'align'}[id];state.lastCommand=id;const activated=setTool(tool,'modify');return{ok:activated!==false&&state.activeTool===tool,code:activated!==false?'started':'unavailable'};}
    if(state.toolset==='cad'&&cadCommandSession?.activeId==='L'&&command){const view=cadCommandSession.view,base=view?.start||null,direction=base&&view?.lastPointer?{x:view.lastPointer.x-base.x,y:view.lastPointer.y-base.y}:null,parsed=parseCadPointText(command,{base,direction});if(!parsed.ok){setCommandStatus(t('command.invalidCoordinate'),'error');return;}const result=reportCadCommand(cadCommands().dispatch({type:'text',text:command,parsed}));if(result?.ok){dom.commandInput.blur();host.focus();}return result;}
    if(state.toolset==='cad'&&cadCommandSession?.activeId==='PL'&&command){const v=cadCommandSession.view,base=v?.points?.at(-1)||null,direction=base&&v?.pointer?{x:v.pointer.x-base.x,y:v.pointer.y-base.y}:null;let parsed=null;const up=command.toUpperCase();if(!['L','LINE','A','ARC','B','BACK','UNDO','C','CLOSE'].includes(up)){parsed=parseCadPointText(command,{base,direction});if(!parsed.ok){setCommandStatus(t('command.invalidCoordinate'),'error');return;}}const result=reportCadCommand(cadCommands().dispatch({type:'text',text:command,parsed}));if(result?.ok&&String(result.code||'').startsWith('committed')){state.polylinePreview=null;setTool('select','select');setCommandStatus(t('command.finished'),'strong');dom.commandInput.blur();host.focus();return result;}updateContextBar();if(result?.ok){dom.commandInput.blur();host.focus();}return result;}
    if(!upper){if(state.toolset==='cad'&&['L','PL'].includes(cadCommandSession?.activeId)){finishContinuousCommand();return;}if(state.commandPending){setCommandStatus(t('command.finished'),'strong');state.commandPending=null;return;}if(state.lastCommand){return runCommand(state.lastCommand);}setCommandStatus(t('command.noPrevious'),'strong');dom.commandInput.focus();return;}
    if(state.commandPending==='zoom'){if(upper==='E'||upper==='EXTENTS'){fitAll();setCommandStatus(t('command.zoomExtents'),'strong');state.commandPending=null;dom.commandInput.blur();host.focus();return;}setCommandStatus(t('command.unknown',{command:upper}),'error');return;}
    if(state.toolset==='cad'&&state.activeCommand==='RR'&&state.cadRotate?.phase==='target'){const result=reportCadCommand(cadCommands().dispatch({type:'text',text:upper}));if(result.ok||result.code==='command-failed')return;}
    const plan=state.toolset==='plan';
    const nativeDrawId=!plan?modules.nativeDrawCommands.resolve(upper):null;
    if(nativeDrawId){const tool={REC:'rectangle',C:'circle',A:'arc'}[nativeDrawId];state.lastCommand=nativeDrawId;const activated=setTool(tool,'draw');if(activated!==false&&state.activeTool===tool){state.activeCommand=nativeDrawId;dom.commandInput.blur();host.focus();}return{ok:activated!==false&&state.activeTool===tool,code:activated!==false?'started':'unavailable'};}
    if(plan&&['ST','STAIR'].includes(upper)){state.lastCommand='ST';activateCommand('ST','stair','architecture','stair.first');}
    else if(upper==='L'||upper==='LINE'){state.lastCommand='L';if(plan)activateCommand('L','line','draw','command.line');else{const activated=setTool('line','draw');if(activated!==false&&state.activeTool==='line'){state.activeCommand='L';dom.commandInput.blur();host.focus();setCommandStatus(t('command.lineFirst'),'strong');}}}
    else if(!plan&&['PL','PLINE','POLYLINE'].includes(upper)){state.lastCommand='PL';const activated=setTool('polyline','draw');if(activated!==false&&state.activeTool==='polyline'){state.activeCommand='PL';dom.commandInput.blur();host.focus();setCommandStatus(t('command.polylineFirst'),'strong');}}
    else if(upper==='TR'||upper==='TRIM'){state.lastCommand='TR';activateCommand('TR','trim','modify',plan?'command.trimPlan':'command.trim');}
    else if(upper==='EX'||upper==='EXTEND'){state.lastCommand='EX';activateCommand('EX','extend','modify',plan?'command.extendPlan':'command.extend');}
    else if(['CR','CURVERECONSTRUCT','RECONSTRUCT'].includes(upper)){state.lastCommand='CR';activateCommand('CR','reconstruct','modify','command.curveReconstruct');}
    else if(upper==='E'||upper==='ERASE'){state.lastCommand='E';if(selectionIds().size){if(deleteSelectedObjects()){state.activeCommand=null;dom.commandInput.blur();host.focus();setCommandStatus('ERASE','strong');}}else activateCommand('E','delete','modify','command.erase');}
    else if(upper==='DI'||upper==='DIST'){state.lastCommand='DI';activateCommand('DI','measure',plan?'select':'dimension','command.distance');}
    else if(!plan&&['T','TEXT'].includes(upper)){state.lastCommand='T';activateCommand('T','text','annotation','annotation.textPoint');}
    else if(!plan&&['MT','MTEXT'].includes(upper)){state.lastCommand='MT';activateCommand('MT','mtext','annotation','annotation.mtextPoint');}
    else if(!plan&&['LE','LEADER','MLEADER'].includes(upper)){state.lastCommand='LE';activateCommand('LE','leader','annotation','annotation.leaderAnchor');}
    else if(!plan&&['DLI','DIM','DIMALIGNED'].includes(upper)){state.lastCommand='DLI';activateCommand('DLI','aligned-dim','dimension','annotation.dimensionFirst');}
    else if(!plan&&['DRA','DIMRADIUS'].includes(upper)){state.lastCommand='DRA';activateCommand('DRA','radius-dim','dimension','annotation.dimensionPickCircle');}
    else if(!plan&&['DDI','DIMDIAMETER'].includes(upper)){state.lastCommand='DDI';activateCommand('DDI','diameter-dim','dimension','annotation.dimensionPickCircle');}
    else if(!plan&&['DAN','DIMANGULAR'].includes(upper)){state.lastCommand='DAN';activateCommand('DAN','angle-dim','dimension','annotation.angularVertex');}
    else if(!plan&&['DCO','DIMCONTINUE'].includes(upper)){if(latestAlignedCadDimension()){state.lastCommand='DCO';activateCommand('DCO','continuous-dim','dimension','annotation.dimensionChainNext');}else setCommandStatus(t('annotation.dimensionNeedsBase'),'error');}
    else if(!plan&&['DBA','DIMBASELINE'].includes(upper)){if(latestAlignedCadDimension()){state.lastCommand='DBA';activateCommand('DBA','baseline-dim','dimension','annotation.dimensionChainNext');}else setCommandStatus(t('annotation.dimensionNeedsBase'),'error');}
    else if(!plan&&['H','HATCH'].includes(upper)){state.lastCommand='H';activateCommand('H','hatch','annotation','annotation.hatchPick');}
    else if(!plan&&['SHEET','PLOT','PRINT'].includes(upper)){state.lastCommand='SHEET';openQuickSheetPrint();}
    else if((upper==='M'||upper==='MOVE')&&plan){state.lastCommand='M';activateCommand('M','move','modify','command.move');}
    else if((upper==='CO'||upper==='COPY')&&plan){state.lastCommand='CO';activateCommand('CO','copy','modify','command.copy');}
    else if(!plan&&['RR','REGIONROTATE'].includes(upper)){if(!activeCadWorkRegion()){setCommandStatus(t('command.rotateNeedsRegion'),'error');return;}state.lastCommand='RR';state.activeTool='region-rotate';state.activeCommand='RR';host.dataset.tool='region-rotate';beginCadRegionRotation();renderToolRail();updateContextBar();render();}
    else if(!plan&&['SELPREV','SELECTPREVIOUS'].includes(upper)){state.lastCommand='SELPREV';setCommandStatus(selectCadPrevious()?t('cadSelection.previousApplied'):t('cadSelection.none'),'strong');}
    else if(!plan&&['SELLAST','SELECTLAST'].includes(upper)){state.lastCommand='SELLAST';setCommandStatus(selectCadLast()?t('cadSelection.lastApplied'):t('cadSelection.none'),'strong');}
    else if(!plan&&['SIMILAR','SELECTSIMILAR'].includes(upper)){state.lastCommand='SIMILAR';setCommandStatus(selectCadSimilar()?t('cadSelection.similarApplied'):t('cadSelection.none'),'strong');}
    else if(upper==='Z'||upper==='ZOOM'){cadCommandSession?.cancel('zoom');state.lastCommand='Z';state.activeCommand='Z';state.commandPending='zoom';dom.commandInput.blur();host.focus();setCommandStatus(t('command.zoom'),'strong');}
    else if(upper==='U'||upper==='UNDO'){state.lastCommand='U';state.activeCommand=null;if(plan)undo();else reportCadCommand(cadCommands().start('U'));dom.commandInput.blur();host.focus();setCommandStatus(t('command.undo'),'strong');}
    else if(upper==='REDO'){state.lastCommand='REDO';state.activeCommand=null;if(plan)redo();else reportCadCommand(cadCommands().start('REDO'));dom.commandInput.blur();host.focus();setCommandStatus(t('command.redo'),'strong');}
    else if((upper==='S'||upper==='STRETCH')&&plan){setCommandStatus(t('command.stretchNotReady'),'error');}
    else if(upper==='WALL'){state.lastCommand=plan?'L':'WALL';setTool(plan?'line':'wall',plan?'draw':'architecture');if(plan||state.cadMapping){state.activeCommand=plan?'L':'WALL';dom.commandInput.blur();host.focus();setCommandStatus(plan?t('command.line'):'WALL','strong');}}
    else if(upper==='DOOR'){state.lastCommand='DOOR';setTool('door','architecture');if(plan||state.cadMapping){state.activeCommand='DOOR';dom.commandInput.blur();host.focus();setCommandStatus('DOOR','strong');}}
    else if(upper==='WINDOW'){state.lastCommand='WINDOW';setTool('window','architecture');if(plan||state.cadMapping){state.activeCommand='WINDOW';dom.commandInput.blur();host.focus();setCommandStatus('WINDOW','strong');}}
    else setCommandStatus(t('command.unknown',{command:upper}),'error');
  }

  function acceptCanvasCommand(){
    if(state.toolset==='cad'&&modules.nativeTransformCommands.ids.includes(cadCommandSession?.activeId))return reportCadCommand(cadCommands().dispatch({type:'enter'}));
    if(state.activeTool==='reconstruct')return commitCurveReconstruction();
    if(state.activeTool==='polyline'&&state.toolset==='cad')return finishContinuousCommand();
    if(state.activeTool==='line'&&state.drawStart)return finishContinuousCommand();
    if(state.commandPending)return runCommand('');
    if((state.toolset==='cad'&&cadCommandSession?.activeId)||state.activeCommand||state.activeTool!=='select')return finishActiveCommand();
    return runCommand('');
  }

  function finishContinuousCommand(){
    if(state.activeTool==='polyline'&&state.toolset==='cad'){const result=reportCadCommand(cadCommands().dispatch({type:'keyword',value:'finish'}));if(result?.ok){state.polylinePreview=null;setTool('select','select');setCommandStatus(t('command.finished'),'strong');return true;}setCommandStatus(t('polyline.needMore'),'error');return false;}
    if(state.activeTool==='line'){cadCommandSession?.cancel('line-finished');cadLineContinuationPoint=null;state.drawStart=null;state.drawReferenceAngle=null;state.previewEnd=null;state.hoveredObjectId=null;if(state.toolset==='plan')clearMultiSelection();setTool('select','select');setCommandStatus(t('command.finished'),'strong');return true;}return false;}
  function setCommandStatus(text,kind=''){commandConsole.push(text,kind);}

  function dxfPair(code,value){return`${code}\n${value}\n`;}
  function sanitizeLayer(name){return String(name||'0').replace(/[<>\\/:;?*|=",]/g,'_').slice(0,255)||'0';}
  function dxfLine(layer,a,b){return dxfPair(0,'LINE')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,a.x.toFixed(4))+dxfPair(20,a.y.toFixed(4))+dxfPair(30,'0')+dxfPair(11,b.x.toFixed(4))+dxfPair(21,b.y.toFixed(4))+dxfPair(31,'0');}
  function dxfCircle(layer,c,r){return dxfPair(0,'CIRCLE')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,c.x.toFixed(4))+dxfPair(20,c.y.toFixed(4))+dxfPair(30,'0')+dxfPair(40,r.toFixed(4));}
  // DXF ARC is CCW: reversing endpoint order preserves a clockwise source locus.
  function dxfCadArc(layer,o){
    const start=o.startAngle||0,sweep=o.sweep||0;
    return dxfArc(layer,o.center,o.radius,normalizeAngle(sweep<0?start+sweep:start),normalizeAngle(sweep<0?start:start+sweep));
  }
  function dxfArc(layer,c,r,startDeg,endDeg){return dxfPair(0,'ARC')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,c.x.toFixed(4))+dxfPair(20,c.y.toFixed(4))+dxfPair(30,'0')+dxfPair(40,r.toFixed(4))+dxfPair(50,startDeg.toFixed(6))+dxfPair(51,endDeg.toFixed(6));}
  function dxfText(layer,p,text,height=180,rotation=0){return dxfPair(0,'TEXT')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,p.x.toFixed(4))+dxfPair(20,p.y.toFixed(4))+dxfPair(30,'0')+dxfPair(40,Number(height||180).toFixed(2))+dxfPair(50,Number(rotation||0).toFixed(4))+dxfPair(1,String(text).replace(/[\r\n]/g,' '));}
  function dxfDoorEntities(obj,layer){
    const g=openingGeometry(obj);if(!g)return'';const type=obj.doorType||'hingedSingle',dir=obj.slideDirection===-1?-1:1;let out='';
    const emitSpec=spec=>{out+=dxfLine(layer,spec.hinge,spec.leafEnd);let a0=(spec.a0*180/Math.PI+360)%360,a1=(spec.a1*180/Math.PI+360)%360;if(spec.delta<0)[a0,a1]=[a1,a0];out+=dxfArc(layer,spec.hinge,spec.width,a0,a1);};
    const emitLeaf=(t0,t1,hinge,side=doorSwingSide(obj))=>emitSpec(hingedLeafGeometry(obj,g,t0,t1,{hinge,swingSide:side}));
    if(type==='hingedSingle'||type==='fireDoor')emitLeaf(0,1,obj.hinge||'start');
    else if(type==='hingedDouble'){emitLeaf(0,doubleLeafSplit(obj),'start');emitLeaf(doubleLeafSplit(obj),1,'end');}
    else if(type==='doubleActingSingle'){emitLeaf(0,1,obj.hinge||'start');emitLeaf(0,1,obj.hinge||'start',-doorSwingSide(obj));}
    else if(type==='doubleActingDouble'){for(const side of[doorSwingSide(obj),-doorSwingSide(obj)]){emitLeaf(0,doubleLeafSplit(obj),'start',side);emitLeaf(doubleLeafSplit(obj),1,'end',side);}}
    else if(type==='slidingSingle'||type==='pocket'){const wallHalf=(g.wall.thickness||150)/2,off=(type==='pocket'?.22:.72)*wallHalf*dir,panelLen=g.width*.82,shift=dir*g.width*.34,center=wallPointAt(g.wall,clamp((obj.t??.5)+shift/Math.max(wallLength(g.wall),1),0,1)),tg=wallTangentAt(g.wall,obj.t??.5),a={x:center.x-tg.ux*panelLen/2+g.nx*off,y:center.y-tg.uy*panelLen/2+g.ny*off},b={x:center.x+tg.ux*panelLen/2+g.nx*off,y:center.y+tg.uy*panelLen/2+g.ny*off};out+=dxfLine(layer,a,b);if(type==='pocket')out+=dxfLine(layer,g.p1,g.p2);}
    else if(type==='slidingDouble'){const wallHalf=(g.wall.thickness||150)/2,off=.68*wallHalf*dir,tg=wallTangentAt(g.wall,obj.t??.5),half=g.width*.45;for(const sign of[-1,1]){const c={x:g.center.x+tg.ux*sign*g.width*.22+g.nx*off,y:g.center.y+tg.uy*sign*g.width*.22+g.ny*off};out+=dxfLine(layer,{x:c.x-tg.ux*half/2,y:c.y-tg.uy*half/2},{x:c.x+tg.ux*half/2,y:c.y+tg.uy*half/2});}}
    return out;
  }
  function exportDxf(){if(hasSemanticObjects()&&!state.cadMapping){openMappingDialog('export');return;}void exportDxfNow();}
  function xmlEsc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function sheetPaperSize(sheet){const p=modules.sheetLayout.paper(sheet);return[p.width,p.height];}
  function cadLayerPrintable(name){const def=cadLayerStore?.get(name);return def?.printable!==false;}
  // Output resolves floor membership explicitly; it never switches the active document floor.
  function planOutputPages(all=false){
    const floors=all?floorsForBuilding(state.activeBuildingId):[activeFloor()].filter(Boolean),pages=[];
    for(const floor of floors){const objects=state.objects.filter(o=>(isSemanticObject(o)||o.type==='line')&&(!o.floorId||o.floorId===floor.id)),points=[];
      for(const o of objects){if(o.a&&o.b)points.push(o.a,o.b);if(o.polygon)points.push(...o.polygon);if(o.type==='component'){const asset=componentLibrary.get(o.assetId);if(asset)for(const path of componentLibrary.vectorPaths(asset))points.push(...path.points.map(v=>componentLibrary.worldPoint(o,v)));}if(isArcWall(o)||isPlanDisplayArc(o))for(let i=0;i<=32;i++)points.push(cadArcPointAt(o,i/32));if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);if(g){points.push(g.p1,g.p2);for(const side of[-1,1])points.push({x:g.center.x+g.nx*g.width*side,y:g.center.y+g.ny*g.width*side});}}if(o.type==='dimension'){const g=dimensionGeometry(o);if(g)points.push(g.d1,g.d2,g.p1,g.p2);}}
      const region=state.drawingRegions.find(r=>r.id===floor.sourceRegionId);
      if(!points.length&&region)points.push({x:region.minx,y:region.miny},{x:region.maxx,y:region.maxy});
      if(!points.length)continue;let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;for(const v of points){minx=Math.min(minx,v.x);miny=Math.min(miny,v.y);maxx=Math.max(maxx,v.x);maxy=Math.max(maxy,v.y);}const pad=Math.max(250,Math.max(maxx-minx,maxy-miny)*.04);
      pages.push({name:floor.name,floorId:floor.id,regionId:region?.id||null,range:{minx:minx-pad,miny:miny-pad,maxx:maxx+pad,maxy:maxy+pad}});
    }return pages;
  }
  function planSheetMarkup(sheet,floor,scale){
    if(!floor)return'';const parts=[],P=p=>`${p.x},${-p.y}`,appearance=planLineAppearance(),sw=.18*scale,poly=(pts,attrs='')=>`<polyline points="${pts.map(P).join(' ')}" fill="none" ${attrs}/>`,line=(a,b,attrs='')=>`<line x1="${a.x}" y1="${-a.y}" x2="${b.x}" y2="${-b.y}" ${attrs}/>`,arc=(center,radius,start,sweep,attrs='')=>{const pt=a=>({x:center.x+Math.cos(rad(a))*radius,y:center.y+Math.sin(rad(a))*radius}),a=pt(start),b=pt(start+sweep);return `<path d="M ${P(a)} A ${radius} ${radius} 0 ${Math.abs(sweep)>180?1:0} ${sweep<0?1:0} ${P(b)}" fill="none" ${attrs}/>`;},text=(point,value,size=2.5*scale,attrs='')=>`<text x="${point.x}" y="${-point.y}" font-family="system-ui, sans-serif" font-size="${size}" text-anchor="middle" ${attrs}>${xmlEsc(value)}</text>`;
    const objects=state.objects.filter(o=>(isSemanticObject(o)||o.type==='line')&&(!o.floorId||o.floorId===floor.id)).sort((a,b)=>(a.type==='space'?-1:0)-(b.type==='space'?-1:0));
    const visible=o=>sheet.mode==='plan'?layerVisible(o.layerId||(o.type==='wall'?'walls':o.type+'s')):cadLayerVisible(cadLayerForObject(o),sheet.regionId||null)&&cadLayerPrintable(cadLayerForObject(o));
    for(const o of objects){if(!visible(o))continue;const out=[],stroke=`stroke="#111" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
      if(o.type==='wall'){
        if(sheet.mode==='plan'){const app=o.planRole==='boundary'?`stroke="${appearance.color}" stroke-width="${sw*appearance.width/1.4}" stroke-linecap="round"`:stroke;for(const seg of wallVisibleSegments(o,{extendConnectedEnds:false}))out.push(seg.kind==='line'?line(seg.a,seg.b,app):arc(o.center,o.radius,o.startAngle+o.sweep*seg.t0,o.sweep*(seg.t1-seg.t0),app));}
        else{const mapping=state.cadMapping||defaultCadMapping(),mode=mapping.wallRepresentation||'outline';if(mode==='outline'||mode==='both')for(const [a,b]of wallOutlineVisibleWorld(o))out.push(line(a,b,stroke));if(mode==='centerline'||mode==='both')for(const seg of wallVisibleSegments(o,{extendConnectedEnds:false}))out.push(seg.kind==='line'?line(seg.a,seg.b,stroke):arc(o.center,o.radius,o.startAngle+o.sweep*seg.t0,o.sweep*(seg.t1-seg.t0),stroke));}
      }else if(o.type==='line'){const dash=planDisplayDash(o.lineStyle||'solid',appearance).map(v=>v*scale*.18/1.4).join(' '),attrs=`stroke="${appearance.color}" stroke-width="${sw*appearance.width/1.4}"${dash?` stroke-dasharray="${dash}"`:''}`;out.push(isPlanDisplayArc(o)?arc(o.center,o.radius,o.startAngle,o.sweep,attrs):line(o.a,o.b,attrs));}
      else if(o.type==='door'||o.type==='window'){
        const g=openingGeometry(o);if(!g)continue;const half=(g.wall.thickness||150)/2,jamb=p=>line({x:p.x+g.nx*half,y:p.y+g.ny*half},{x:p.x-g.nx*half,y:p.y-g.ny*half},stroke);out.push(jamb(g.p1),jamb(g.p2));
        if(o.type==='window'){const offsets=sheet.mode==='plan'?[-half*.34,0,half*.34]:[-Math.min(50,half*.7),Math.min(50,half*.7)];for(const off of offsets)out.push(line({x:g.p1.x+g.nx*off,y:g.p1.y+g.ny*off},{x:g.p2.x+g.nx*off,y:g.p2.y+g.ny*off},stroke));}
        else{const type=o.doorType||'hingedSingle',leaf=(t0,t1,hinge,side=doorSwingSide(o),opacity=1)=>{const k=hingedLeafGeometry(o,g,t0,t1,{hinge,swingSide:side});out.push(line(k.hinge,k.leafEnd,`${stroke} opacity="${opacity}"`),arc(k.hinge,k.width,deg(k.a0),deg(k.delta),`${stroke} opacity="${opacity*.62}"`));};
          if(['hingedSingle','fireDoor','doubleActingSingle'].includes(type)){leaf(0,1,o.hinge||'start');if(type==='doubleActingSingle')leaf(0,1,o.hinge||'start',-doorSwingSide(o),.42);}
          else if(['hingedDouble','doubleActingDouble'].includes(type)){leaf(0,doubleLeafSplit(o),'start');leaf(doubleLeafSplit(o),1,'end');if(type==='doubleActingDouble'){leaf(0,doubleLeafSplit(o),'start',-doorSwingSide(o),.42);leaf(doubleLeafSplit(o),1,'end',-doorSwingSide(o),.42);}}
          else if(type==='fireShutter'){const off=Math.max(24,(g.wall.thickness||150)*.24);for(const sign of[-1,1])out.push(line({x:g.p1.x+g.nx*off*sign,y:g.p1.y+g.ny*off*sign},{x:g.p2.x+g.nx*off*sign,y:g.p2.y+g.ny*off*sign},stroke+' stroke-dasharray="'+[5,3].map(v=>v*sw/1.4).join(' ')+'"'));}
          else if(type==='slidingSingle'||type==='pocket'){const dir=o.slideDirection===-1?-1:1,off=(type==='pocket'?.22:.72)*half*dir,len=g.width*.82,tg=wallTangentAt(g.wall,o.t??.5),c=wallPointAt(g.wall,clamp((o.t??.5)+dir*g.width*.34/Math.max(wallLength(g.wall),1),0,1));out.push(line({x:c.x-tg.ux*len/2+g.nx*off,y:c.y-tg.uy*len/2+g.ny*off},{x:c.x+tg.ux*len/2+g.nx*off,y:c.y+tg.uy*len/2+g.ny*off},stroke));if(type==='pocket')out.push(line(g.p1,g.p2,stroke));}
          else if(type==='slidingDouble'){const dir=o.slideDirection===-1?-1:1,tg=wallTangentAt(g.wall,o.t??.5),off=.68*half*dir,len=g.width*.45;for(const sign of[-1,1]){const c={x:g.center.x+tg.ux*sign*g.width*.22+g.nx*off,y:g.center.y+tg.uy*sign*g.width*.22+g.ny*off};out.push(line({x:c.x-tg.ux*len/2,y:c.y-tg.uy*len/2},{x:c.x+tg.ux*len/2,y:c.y+tg.uy*len/2},stroke));}}
          if(type==='fireDoor'||type==='fireShutter')out.push(text({x:g.center.x+2*scale,y:g.center.y+2*scale},type==='fireDoor'?'FD':'FS',2*scale));
        }
      }else if(o.type==='space'&&o.polygon?.length){const c=polygonCentroid(o.polygon);out.push(`<polygon points="${o.polygon.map(P).join(' ')}" fill="#3478f6" fill-opacity=".075" stroke="#3478f6" stroke-width="${sw*.7}"/>`,text({x:c.x,y:c.y+1.4*scale},o.name||spaceDefaultName(1),2.5*scale),text({x:c.x,y:c.y-2*scale},`${formatNumber(displaySpaceAreaM2(o),2)} m²`,2*scale));}
      else if(o.type==='stair')for(const g of modules.planStair.segments(o))out.push(line(g.a,g.b,stroke));
      else if(o.type==='component'){const asset=componentLibrary.get(o.assetId);if(asset)for(const path of componentLibrary.vectorPaths(asset)){const pts=path.points.map(v=>componentLibrary.worldPoint(o,v));if(path.closed)pts.push(pts[0]);out.push(poly(pts,stroke));}}
      else if(o.type==='dimension'){const g=dimensionGeometry(o);if(g){out.push(line(g.p1,g.d1,stroke),line(g.p2,g.d2,stroke),line(g.d1,g.d2,stroke),text({x:(g.d1.x+g.d2.x)/2,y:(g.d1.y+g.d2.y)/2+2*scale},formatNumber(g.len,1)+' mm'));for(const pt of[g.d1,g.d2])out.push(line({x:pt.x-scale,y:pt.y-scale},{x:pt.x+scale,y:pt.y+scale},stroke));}}
      if(out.length)parts.push(`<g data-object-id="${xmlEsc(o.id)}" data-type="${o.type}">${out.join('')}</g>`);
    }return parts.join('');
  }
  function sheetSvg(sheet){
    const printable=modules.sheetLayout.printable(sheet),legacyScale=Number(sheet.scale)||100,legacyCenter=sheet.center||{x:state.camera.cx,y:state.camera.cy},range=sheet.range||{minx:legacyCenter.x-printable.w*legacyScale/2,maxx:legacyCenter.x+printable.w*legacyScale/2,miny:legacyCenter.y-printable.h*legacyScale/2,maxy:legacyCenter.y+printable.h*legacyScale/2},mapping=modules.sheetLayout.layout(range,{...sheet,sizeMode:sheet.sizeMode||'fixed',scale:legacyScale}),{paper:page,scale,modelW:mw,modelH:mh,center}=mapping,pw=page.width,ph=page.height,printableW=page.w,printableH=page.h,cx=center.x,cy=center.y,minx=cx-mw/2,miny=-(cy+mh/2),sw=.18*scale,txt=2.5*scale,parts=[],defs=[];
    const seed=String(sheet.id||sheet.regionId||JSON.stringify(range)),hash=[...seed].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,0),prefix=`s${hash.toString(36)}`,clipId=`${prefix}-range`;defs.push(`<clipPath id="${clipId}"><rect x="${range.minx}" y="${-range.maxy}" width="${range.maxx-range.minx}" height="${range.maxy-range.miny}"/></clipPath>`);
    let ink='#111',weight=sw;const P=p=>`${p.x},${-p.y}`,line=(a,b,w=weight)=>`<line x1="${a.x}" y1="${-a.y}" x2="${b.x}" y2="${-b.y}" stroke="${ink}" stroke-width="${w}"/>`;
    const floor=state.floors.find(f=>f.id===sheet.floorId)||(sheet.regionId?floorForRegion(sheet.regionId):sheet.mode==='plan'?activeFloor():cadPlanFloor());
    const planMarkup=planSheetMarkup(sheet,floor,scale);
    const analyticArc=o=>{const a=cadArcPointAt(o,0),b=cadArcPointAt(o,1);return `<path d="M ${P(a)} A ${o.radius} ${o.radius} 0 ${Math.abs(o.sweep)>180?1:0} ${o.sweep<0?1:0} ${P(b)}" fill="none" stroke="${ink}" stroke-width="${weight}"/>`;};
    const arrow=(tip,toward)=>{const a=Math.atan2(toward.y-tip.y,toward.x-tip.x),size=2*scale,pts=[tip,{x:tip.x+Math.cos(a+.42)*size,y:tip.y+Math.sin(a+.42)*size},{x:tip.x+Math.cos(a-.42)*size,y:tip.y+Math.sin(a-.42)*size}];return `<polygon points="${pts.map(P).join(' ')}" fill="${ink}"/>`;};
    for(const o of [...state.objects].sort((a,b)=>(Number(a.drawOrder)||0)-(Number(b.drawOrder)||0))){
      if(!isCadObject(o)||!cadLayerPrintable(cadLayerForObject(o))||!cadLayerVisible(cadLayerForObject(o),sheet.regionId||null))continue;
      if(sheet.range&&['cadLine','cadCircle','cadArc','cadPolyline'].includes(o.type)&&!objectTouchesRegion(o,range))continue;
      const layer=cadLayerStore?.get(cadLayerForObject(o));ink=o.color||layer?.color||'#111';if(!/^#[0-9a-f]{3,8}$/i.test(ink))ink='#111';const width=o.lineweight??layer?.lineweight;weight=typeof width==='number'?width*scale:sw;const style=o.linetype||layer?.linetype||'CONTINUOUS',dash=style==='DASHED'?[8,4]:style==='CENTER'?[12,3,2,3]:[],start=parts.length;
      if(o.type==='cadLine')parts.push(line(o.a,o.b));
      else if(modules.cadPolyline.is(o)){for(const e of (sheet.range?modules.cadPolyline.candidates(o,range):modules.cadPolyline.get(o).edges)){if(e.type==='cadLine')parts.push(line(e.a,e.b));else parts.push(analyticArc(e));}}
      else if(o.type==='cadCircle')parts.push(`<circle cx="${o.center.x}" cy="${-o.center.y}" r="${o.radius}" fill="none" stroke="${ink}" stroke-width="${weight}"/>`);
      else if(o.type==='cadArc')parts.push(analyticArc(o));
      else if(o.type==='cadText'){const layout=cadTextLayout(o,{natural:true}),font=Number(o.height)||txt,lineStep=(Number(o.height)||font)*(Number(o.lineSpacing)||1.25),spans=layout.lines.map((v,i)=>`<tspan x="${o.point.x}" dy="${i?lineStep:0}">${xmlEsc(v)}</tspan>`).join('');parts.push(`<text x="${o.point.x}" y="${-o.point.y}" font-family="system-ui, sans-serif" font-size="${font}" transform="rotate(${-Number(o.rotation||0)} ${o.point.x} ${-o.point.y})" fill="${ink}">${spans}</text>`);}
      else if(o.type==='cadDimension'){const g=cadDimensionGeometry(o);if(g){if(g.kind==='angular'){parts.push(line(g.vertex,g.start),line(g.vertex,g.end),analyticArc({center:g.vertex,radius:g.radius,startAngle:g.startAngle,sweep:g.sweep}));}else for(const seg of g.segments||annotationDimensionSegments(o))parts.push(line(seg.a,seg.b));if(g.kind==='aligned'){const a=Math.atan2(g.d2.y-g.d1.y,g.d2.x-g.d1.x)-Math.PI/4;for(const q of [g.d1,g.d2])parts.push(line({x:q.x-Math.cos(a)*scale,y:q.y-Math.sin(a)*scale},{x:q.x+Math.cos(a)*scale,y:q.y+Math.sin(a)*scale}));}else if(g.kind==='radius'||g.kind==='diameter')parts.push(arrow(g.edge,g.end));const lp=g.labelPoint||g.d1||g.end;parts.push(`<text x="${lp.x}" y="${-lp.y}" font-family="system-ui, sans-serif" font-size="${txt}" text-anchor="middle" dominant-baseline="middle" fill="${ink}">${xmlEsc(cadDimensionLabel(o,g))}</text>`);}}
      else if(o.type==='cadLeader'){const pts=o.points||[];for(let i=1;i<pts.length;i++)parts.push(line(pts[i-1],pts[i]));if(pts.length){if(pts.length>1)parts.push(arrow(pts[0],pts[1]));const lp=pts.at(-1),layout=cadTextLayout({...o,type:'cadText',point:lp,rotation:0,width:Math.max(0,Number(o.width)||1200),lineSpacing:1.2},{natural:true}),lines=layout.lines,step=(Number(o.height)||140)*1.2;parts.push(`<text x="${lp.x}" y="${-lp.y}" font-family="system-ui, sans-serif" font-size="${Number(o.height)||140}" fill="${ink}">${lines.map((v,i)=>`<tspan x="${lp.x}" dy="${i?step:0}">${xmlEsc(v)}</tspan>`).join('')}</text>`);}}
      else if(o.type==='cadHatch'){const pts=(o.points||[]).map(P).join(' '),pattern=String(o.pattern||'ANSI31').toUpperCase();if(pattern==='SOLID')parts.push(`<polygon points="${pts}" fill="${ink}" fill-opacity="0.14" stroke="#555" stroke-width="${sw*.7}"/>`);else{const id=`${prefix}-h${defs.length}`,spacing=Math.max(4,Number(o.spacingPx)||16)*scale*.4,angle=Number(o.angle??45);defs.push(`<pattern id="${id}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}" patternTransform="rotate(${-angle})"><line x1="0" y1="0" x2="0" y2="${spacing}" stroke="#555" stroke-width="${sw*.6}"/>${pattern==='CROSS'?`<line x1="0" y1="0" x2="${spacing}" y2="0" stroke="#555" stroke-width="${sw*.6}"/>`:''}</pattern>`);parts.push(`<polygon points="${pts}" fill="url(#${id})" stroke="#555" stroke-width="${sw*.7}"/>`);}}
      if(parts.length>start){const elements=parts.splice(start);parts.push(`<g data-object-id="${xmlEsc(o.id)}" data-type="${o.type}"${dash.length&&['cadLine','cadArc','cadCircle','cadPolyline'].includes(o.type)?` stroke-dasharray="${dash.map(v=>v*scale*.18/1.4).join(' ')}"`:''}>${elements.join('')}</g>`);}
    }
    // Outer user units are physical millimetres. Geometry lives in a nested printable
    // viewport whose world-unit dimensions are printable-mm * denominator, so 1000 mm
    // at 1:100 is exactly 10 mm before the browser print dialog applies any user scale.
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}mm" height="${ph}mm" viewBox="0 0 ${pw} ${ph}"><rect x="0" y="0" width="${pw}" height="${ph}" fill="white"/><svg x="${page.x}" y="${page.y}" width="${printableW}" height="${printableH}" viewBox="${minx} ${miny} ${mw} ${mh}" preserveAspectRatio="none">${defs.length?`<defs>${defs.join('')}</defs>`:''}<g clip-path="url(#${clipId})">${planMarkup}${parts.join('')}</g></svg>${sheet.preview?`<rect x="${page.x}" y="${page.y}" width="${page.w}" height="${page.h}" fill="none" stroke="#888" stroke-width=".25" stroke-dasharray="2 1"/><rect x="${page.x+(range.minx-minx)/scale}" y="${page.y+(-range.maxy-miny)/scale}" width="${(range.maxx-range.minx)/scale}" height="${(range.maxy-range.miny)/scale}" fill="none" stroke="#3478f6" stroke-width=".3"/>`:''}</svg>`;
  }
  function sheetPrintHtml(sheet,svg=sheetSvg(sheet)){
    const [pw,ph]=sheetPaperSize(sheet),name=sheet.name||'PieniPlan Sheet',content=svg.trim().startsWith('<svg')?`<section class="sheet-page">${svg}</section>`:svg;
    return `<!doctype html><html><head><meta charset="utf-8"><title>${xmlEsc(name)}</title><style>@page{size:${pw}mm ${ph}mm;margin:0}html,body{margin:0;padding:0;background:#fff}.sheet-page{width:${pw}mm;height:${ph}mm;break-after:page;page-break-after:always}.sheet-page:last-of-type{break-after:auto;page-break-after:auto}.sheet-page>svg{display:block;width:100%;height:100%}</style></head><body>${content}<script>window.addEventListener('load',async()=>{if(document.fonts)await document.fonts.ready;setTimeout(()=>window.print(),120);});<\/script></body></html>`;
  }
  function printSheetOutputJob(job){
    if(!job?.pages?.length)throw new Error('no-output-pages');
    // Validate every page before creating a popup or modifying the sheet/history model.
    const sheets=job.pages.map((page,i)=>{const mapping=modules.sheetLayout.layout(page.range,job);if(!mapping.fits)throw new Error('fixed-scale-does-not-fit');return{name:`${job.name||'Sheet'}${job.pages.length>1?' · '+(page.name||i+1):''}`,paper:job.paper,orientation:job.orientation,sizeMode:job.sizeMode,scale:mapping.scale,margins:{...mapping.paper.margins},range:{...mapping.range},center:{...mapping.center},regionId:page.regionId||null,floorId:page.floorId||null,mode:job.mode||state.toolset};});
    const html=sheetPrintHtml(sheets[0],sheets.map(sheet=>`<section class="sheet-page">${sheetSvg(sheet)}</section>`).join('')),url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),win=window.open('about:blank','_blank','width=1200,height=900');
    if(!win){URL.revokeObjectURL(url);setCommandStatus(t('sheet.popupBlocked'),'error');return false;}
    try{win.opener=null;win.location.replace(url);}catch(error){try{win.close();}catch{}URL.revokeObjectURL(url);setCommandStatus(t('sheet.popupBlocked'),'error');return false;}
    pushHistory();for(const sheet of sheets)sheet.id=uid('sheet');state.sheets.push(...sheets);markDirty(true);setTimeout(()=>URL.revokeObjectURL(url),60000);setCommandStatus(t('sheet.printOpened',{name:job.name||'Sheet'}),'strong');updateAll();return true;
  }
  function openQuickSheetPrint(){return featureFill.openOutput();}


  async function exportDxfNow(){const m=state.cadMapping||defaultCadMapping();let entities='';const layers=new Set(['0']);for(const o of state.objects){if(o.type==='stair'){const layer='STAIRS';layers.add(layer);for(const g of modules.planStair.segments(o))entities+=dxfLine(layer,g.a,g.b);}else if(modules.cadPolyline.is(o)){const layer=cadLayerForObject(o);layers.add(layer);for(const e of modules.cadPolyline.get(o).edges)entities+=e.type==='cadLine'?dxfLine(layer,e.a,e.b):dxfCadArc(layer,e);}else if(o.type==='cadLine'||o.type==='line'){const layer=o.planRole==='display'?'PLAN_DISPLAY':cadLayerForObject(o);layers.add(layer);const data=isPlanDisplayArc(o)?dxfCadArc(layer,o):dxfLine(layer,o.a,o.b);entities+=o.planRole==='display'?data+dxfPair(6,({solid:'CONTINUOUS',dashed:'DASHED',dotted:'DOTTED',dashdot:'CENTER'}[o.lineStyle]||'CONTINUOUS')):data;}else if(o.type==='cadCircle'){const layer=cadLayerForObject(o);layers.add(layer);entities+=dxfCircle(layer,o.center,o.radius);}else if(o.type==='cadArc'){const layer=cadLayerForObject(o);layers.add(layer);entities+=dxfCadArc(layer,o);}else if(['cadText','cadDimension','cadLeader','cadHatch'].includes(o.type)){const layer=cadLayerForObject(o);layers.add(layer);entities+=dxfCadAnnotationEntities(o,layer);}else if(o.type==='wall'){layers.add(m.wallLayer);if(m.wallRepresentation==='outline'||m.wallRepresentation==='both')for(const[a,b]of wallOutlineVisibleWorld(o))entities+=dxfLine(m.wallLayer,a,b);if(m.wallRepresentation==='centerline'||m.wallRepresentation==='both'){if(isArcWall(o)){let a0=normalizeAngle(o.startAngle||0),a1=normalizeAngle((o.startAngle||0)+(o.sweep||0));if((o.sweep||0)<0)[a0,a1]=[a1,a0];entities+=dxfArc(m.wallLayer,o.center,o.radius,a0,a1);}else entities+=dxfLine(m.wallLayer,o.a,o.b);}}else if(o.type==='door'){layers.add(m.doorLayer);entities+=dxfDoorEntities(o,m.doorLayer);}else if(o.type==='window'){/* emitted below */}else if(o.type==='dimension'){const g=dimensionGeometry(o);if(g){layers.add(m.dimensionLayer);entities+=dxfLine(m.dimensionLayer,g.d1,g.d2);entities+=dxfLine(m.dimensionLayer,g.p1,g.d1);entities+=dxfLine(m.dimensionLayer,g.p2,g.d2);entities+=dxfText(m.dimensionLayer,{x:(g.d1.x+g.d2.x)/2,y:(g.d1.y+g.d2.y)/2},`${formatNumber(g.len,1)} mm`,140);}}}
    // windows are added in a separate pass to keep the main loop readable after semantic conversion.
    for(const o of state.objects){if(o.type!=='window')continue;const g=openingGeometry(o);if(!g)continue;layers.add(m.windowLayer);const off=Math.min(50,(g.wall.thickness||150)*.35);for(const sign of[-1,1])entities+=dxfLine(m.windowLayer,{x:g.p1.x+g.nx*off*sign,y:g.p1.y+g.ny*off*sign},{x:g.p2.x+g.nx*off*sign,y:g.p2.y+g.ny*off*sign});}
    let layerTable=dxfPair(0,'TABLE')+dxfPair(2,'LAYER')+dxfPair(70,layers.size);for(const name of layers){layerTable+=dxfPair(0,'LAYER')+dxfPair(2,sanitizeLayer(name))+dxfPair(70,0)+dxfPair(62,7)+dxfPair(6,'CONTINUOUS');}layerTable+=dxfPair(0,'ENDTAB');
    const ltypeTable=dxfLineTypeTable();
    const dxf=dxfPair(0,'SECTION')+dxfPair(2,'HEADER')+dxfPair(9,'$ACADVER')+dxfPair(1,'AC1009')+dxfPair(9,'$INSUNITS')+dxfPair(70,4)+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'TABLES')+ltypeTable+layerTable+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'ENTITIES')+entities+dxfPair(0,'ENDSEC')+dxfPair(0,'EOF');
    const blob=new Blob([dxf],{type:'application/dxf;charset=utf-8'}),name=state.sourceDxfName?state.sourceDxfName.replace(/\.dxf$/i,'')+'_PieniPlan.dxf':`PieniPlan_v${VERSION}_Build${BUILD}.dxf`;await saveDxfBlob(blob,name);}

  const contextMenu=document.createElement('div');contextMenu.className='canvas-context-menu';contextMenu.hidden=true;document.body.appendChild(contextMenu);
  const contextToolRelations=Object.freeze({
    plan:Object.freeze({trim:['extend'],extend:['trim'],door:['window','space','component'],window:['door','space','component'],space:['door','window','component'],component:['door','window','space']}),
    cad:Object.freeze({trim:['extend','break','offset','fillet'],extend:['trim','break','offset'],break:['trim','extend','offset'],join:['offset','fillet'],offset:['join','trim','extend','break','fillet'],fillet:['offset','join','trim'],wall:['door','window','component'],door:['wall','window','component'],window:['wall','door','component'],component:['wall','door','window']})
  });
  function hideContextMenu(){contextMenu.hidden=true;contextMenu.innerHTML='';}
  function addContextMenuItem(label,run,{danger=false,disabled=false,note='',primary=false,checked=false}={}){const b=document.createElement('button');b.className=`context-menu-item ${danger?'danger':''} ${primary?'context-primary':''} ${checked?'checked':''}`;b.disabled=disabled;const main=document.createElement('span');main.className='context-menu-label';main.textContent=(checked?'✓ ':'')+label;b.appendChild(main);if(note){const n=document.createElement('span');n.className='context-menu-note';n.textContent=note;b.appendChild(n);}b.addEventListener('click',()=>{hideContextMenu();run();});contextMenu.appendChild(b);}
  function addContextMenuDivider(){const d=document.createElement('div');d.className='context-menu-divider';contextMenu.appendChild(d);}
  function duplicateObject(obj){if(!obj||obj.type==='space')return;
    if(obj.type==='component'){if(state.toolset==='cad'&&!cadPolicy(obj.id,'modify').allowed){setCommandStatus(cadFaultMessage('target-not-modifiable'),'error');return false;}pushHistory();const copy=JSON.parse(JSON.stringify(obj));copy.id=uid('component');copy.point={x:(obj.point?.x||0)+200,y:obj.point?.y||0};state.objects.push(copy);selectOnly(copy.id);markDirty(true);rebuildObjectSnapIndex({scope:'all'});updateAll();return true;}
    if(state.toolset==='cad'){
      const token=cadContextToken(),source=cadContext.getById(obj.id);
      if(modules.cadPolyline.is(obj)){if(source!==obj||!cadPolicy(obj.id,'modify').allowed||cadLayerLocked(cadLayerForObject(obj))){setCommandStatus(cadFaultMessage('target-not-modifiable'),'error');return false;}const copy=cloneCadPolylineWithFreshIds(obj,{dx:200,dy:0});if(!cadContextTokenCurrent(token))return false;try{if(!commitCadChanges('DUPLICATE',[{before:null,after:copy,index:state.objects.length}]))return false;}catch(error){setCommandStatus(cadFaultMessage(error.message),'error');return false;}setSelectionIds(new Set([copy.id]));updateAll();return true;}
      if(source!==obj||cadSourceKind(source)!=='cad-source'||!cadPolicy(obj.id,'modify').allowed||cadLayerLocked(cadLayerForObject(obj))){setCommandStatus(cadFaultMessage('target-not-modifiable'),'error');return false;}
      const matrix=modules.cadTransformOperations.translate(200,0),copy=modules.cadTransformOperations.transform(obj,matrix);if(!copy)return false;copy.id=uid(obj.type);
      if(!cadContextTokenCurrent(token))return false;
      try{if(!commitCadChanges('DUPLICATE',[{before:null,after:copy,index:state.objects.length}]))return false;}catch(error){setCommandStatus(cadFaultMessage(error.message),'error');return false;}
      setSelectionIds(new Set([copy.id]));updateAll();return true;
    }
    pushHistory();const copy=JSON.parse(JSON.stringify(obj));copy.id=uid(obj.type);delete copy.recognizedFromCad;delete copy.sourceRegionId;delete copy.recognitionSourceIds;delete copy.recognitionConfidence;delete copy.recognitionBaselineSignature;delete copy.recognitionDetached;if(copy.type==='door'||copy.type==='window'){copy.t=clamp((copy.t??.5)+.08,0,1);}else if(copy.type==='dimension'){copy.offset=(copy.offset||0)+120;}else if(copy.a&&copy.b){copy.a.x+=200;copy.b.x+=200;if((isArcWall(copy)||isPlanDisplayArc(copy))&&copy.center)copy.center.x+=200;if(copy.type==='wall')copy.attachments={};}else if(copy.type==='cadCircle')copy.center.x+=200;else if(copy.point)copy.point.x+=200;else if(copy.polygon)copy.polygon=copy.polygon.map(q=>({x:q.x+200,y:q.y}));state.objects.push(copy);if(copy.type==='stair')selectOnly(copy.id);else state.selectedObjectId=copy.id;markDirty(true);rebuildObjectSnapIndex();updateAll();}
  function toolCatalogFor(mode){return mode==='plan'?planToolCatalog:cadToolCatalog;}
  function toolCategoriesFor(mode){return mode==='plan'?planCategories:cadCategories;}
  function activeCategoryForTool(mode,tool){const catalog=toolCatalogFor(mode);for(const [group,items] of Object.entries(catalog))if(items.some(item=>item.id===tool))return group;return'select';}
  function activateContextTool(mode,tool,category){if(state.toolset!==mode)return false;if(mode==='plan'&&tool==='wall'&&!state.toolSettings.wallType)state.toolSettings.wallType='straight';return setTool(tool,category);}
  function contextObjectCommandDefinitions(mode,obj,{settings=false}={}){
    const cad=mode==='cad',defs=[];
    const available=predicate=>settings?true:Boolean(predicate);
    defs.push({key:`${mode}:object:properties`,mode,group:'object',label:t('action.properties'),labelKey:'action.properties',basePriority:100,section:'current',available:available(obj),recommended:available(obj),run:()=>switchInspector('properties')});
    defs.push({key:`${mode}:object:duplicate`,mode,group:'object',label:t('action.duplicate'),labelKey:'action.duplicate',basePriority:55,section:'current',available:available(obj&&obj.type!=='space'),recommended:available(obj&&obj.type!=='space'),run:()=>duplicateObject(obj)});
    defs.push({key:`${mode}:object:polylineCloseOpen`,mode,group:'object',label:t(obj?.closed?'action.openPolyline':'action.closePolyline'),labelKey:obj?.closed?'action.openPolyline':'action.closePolyline',settingsLabelKey:'action.closePolyline',basePriority:58,section:'current',available:available(cad&&modules.cadPolyline.is(obj)),recommended:available(cad&&modules.cadPolyline.is(obj)),run:()=>{if(obj)setCadPolylineClosed(obj,!obj.closed);}});
    defs.push({key:`${mode}:object:rotate90`,mode,group:'object',label:t('action.rotate90'),labelKey:'action.rotate90',basePriority:54,section:'current',available:available(cad&&modules.cadPolyline.is(obj)),recommended:available(cad&&modules.cadPolyline.is(obj)),run:()=>transformCadPolylineOwner(obj,'rotate90')});
    defs.push({key:`${mode}:object:mirrorHorizontal`,mode,group:'object',label:t('action.mirrorHorizontal'),labelKey:'action.mirrorHorizontal',basePriority:53,section:'current',available:available(cad&&modules.cadPolyline.is(obj)),recommended:available(cad&&modules.cadPolyline.is(obj)),run:()=>transformCadPolylineOwner(obj,'mirrorX')});
    defs.push({key:`${mode}:object:mirrorVertical`,mode,group:'object',label:t('action.mirrorVertical'),labelKey:'action.mirrorVertical',basePriority:52,section:'current',available:available(cad&&modules.cadPolyline.is(obj)),recommended:false,run:()=>transformCadPolylineOwner(obj,'mirrorY')});
    defs.push({key:`${mode}:object:delete`,mode,group:'object',label:t('action.delete'),labelKey:'action.delete',basePriority:45,section:'current',available:available(obj),recommended:available(obj),danger:true,run:()=>deleteObjectById(obj?.id)});
    defs.push({key:`${mode}:object:flipHinge`,mode,group:'object',label:t('action.flipHinge'),labelKey:'action.flipHinge',basePriority:86,section:'current',available:available(obj?.type==='door'&&isHingedDoorType(obj.doorType||'hingedSingle')&&!isDoubleLeafDoorType(obj.doorType||'hingedSingle')),recommended:available(obj?.type==='door'&&isHingedDoorType(obj.doorType||'hingedSingle')&&!isDoubleLeafDoorType(obj.doorType||'hingedSingle')),run:()=>{if(!obj)return;pushHistory();flipDoorHingePreserveSide(obj);markDirty(true);updateAll();}});
    defs.push({key:`${mode}:object:flipSwing`,mode,group:'object',label:t('action.flipSwing'),labelKey:'action.flipSwing',basePriority:84,section:'current',available:available(obj?.type==='door'&&isHingedDoorType(obj.doorType||'hingedSingle')),recommended:available(obj?.type==='door'&&isHingedDoorType(obj.doorType||'hingedSingle')),run:()=>{if(!obj)return;pushHistory();flipDoorSwingSide(obj);markDirty(true);updateAll();}});
    defs.push({key:`${mode}:object:flipSlide`,mode,group:'object',label:t('action.flipSlide'),labelKey:'action.flipSlide',basePriority:84,section:'current',available:available(obj?.type==='door'&&!isHingedDoorType(obj.doorType||'hingedSingle')&&!isFireShutterDoorType(obj.doorType||'hingedSingle')),recommended:available(obj?.type==='door'&&!isHingedDoorType(obj.doorType||'hingedSingle')&&!isFireShutterDoorType(obj.doorType||'hingedSingle')),run:()=>{if(!obj)return;pushHistory();obj.slideDirection=obj.slideDirection===-1?1:-1;markDirty(true);updateAll();}});
    const wallConnected=Boolean(obj?.attachments?.a||obj?.attachments?.b);
    defs.push({key:`${mode}:object:wallJoint`,mode,group:'object',label:t(wallConnected?'action.detachJoint':'action.attachJoint'),labelKey:wallConnected?'action.detachJoint':'action.attachJoint',settingsLabelKey:'action.attachJoint',basePriority:82,section:'current',available:available(obj?.type==='wall'),recommended:available(obj?.type==='wall'),run:()=>{if(!obj)return;pushHistory();if(wallConnected)detachWallConnections(obj);else if(!attachTouchingWallEndpoints(obj)){state.history.pop();alert(t('alert.noJointNearby'));return;}markDirty(true);updateAll();}});
    defs.push({key:`${mode}:object:showInLayers`,mode,group:'object',label:t('action.showInLayers'),labelKey:'action.showInLayers',basePriority:72,section:'current',available:available(cad&&obj&&obj.type!=='space'),recommended:available(cad&&obj&&obj.type!=='space'),run:()=>{state.layerRevealRequested=true;switchInspector('primary');renderCadLayersPanel();}});
    const layer=obj&&cad?cadLayerForObject(obj):null;
    defs.push({key:`${mode}:object:layerVisibility`,mode,group:'object',label:t(layer&&cadLayerVisible(layer)?'action.hideLayer':'action.showLayer'),labelKey:'action.hideLayer',settingsLabelKey:'action.hideLayer',basePriority:25,section:'current',available:available(cad&&obj&&obj.type!=='space'),recommended:false,run:()=>{if(layer)setCadLayerVisibilityUndoable(layer,!cadLayerVisible(layer));}});
    defs.push({key:`${mode}:object:soloLayer`,mode,group:'object',label:t('action.soloLayer'),labelKey:'action.soloLayer',basePriority:20,section:'current',available:available(cad&&obj&&obj.type!=='space'),recommended:false,run:()=>{if(layer)soloLayer(layer);}});
    return defs;
  }
  function activeCommandContextDefinitions(mode,{settings=false}={}){if(settings||mode!=='cad'||state.toolset!=='cad'||!cadCommandSession?.activeId)return[];const desc=cadCommandSession.describe?.(),actions=Array.isArray(desc?.actions)?desc.actions:[];return actions.map((action,index)=>({key:`${mode}:active:${desc.id}:${action.id}`,mode,group:'active',label:t(action.labelKey),labelKey:action.labelKey,basePriority:116-index,section:'current',available:true,recommended:true,enabled:action.enabled!==false,checked:Boolean(action.active),run:()=>dispatchActiveCadCommandAction(action.id)}));}
  function contextCommandDefinitions(mode=state.toolset,{obj=null,settings=false}={}){
    const catalog=toolCatalogFor(mode),categories=toolCategoriesFor(mode),defs=[];
    const activeTool=state.toolset===mode?state.activeTool:'select',activeCategory=activeCategoryForTool(mode,activeTool),related=new Set(contextToolRelations[mode]?.[activeTool]||[]);
    defs.push({key:`${mode}:utility:returnSelect`,mode,group:'select',label:t('action.returnToSelect'),labelKey:'action.returnToSelect',basePriority:120,section:'escape',available:true,recommended:activeTool!=='select',primary:true,run:()=>setTool('select','select')});
    for(const cat of categories){for(let index=0;index<(catalog[cat.id]||[]).length;index++){const item=catalog[cat.id][index];if(!item.ready||item.id==='select')continue;const isRelated=related.has(item.id),sameGroup=cat.id===activeCategory&&item.id!==activeTool;defs.push({key:`${mode}:tool:${item.id}`,mode,group:cat.id,label:t(item.labelKey),labelKey:item.labelKey,note:item.note||'',tool:item.id,category:cat.id,basePriority:80-index,section:isRelated?'current':sameGroup?'group':'other',available:true,recommended:!obj&&(isRelated||sameGroup),run:()=>activateContextTool(mode,item.id,cat.id)});}}
    defs.push(...activeCommandContextDefinitions(mode,{settings}));
    defs.push(...contextObjectCommandDefinitions(mode,obj,{settings}));
    if(mode==='plan')defs.push({key:'plan:object:floorRefine',mode,group:'object',label:t('feature.refine'),labelKey:'feature.refine',basePriority:91,section:'current',available:settings||Boolean(obj&&['wall','line','stair'].includes(obj.type)),recommended:true,run:()=>featureFill.openRefinement(state.activeFloorId,obj?.id)});
    if(mode==='cad')defs.push({key:'cad:object:connected',mode,group:'object',label:t('selection.connected'),labelKey:'selection.connected',basePriority:90,section:'current',available:settings||Boolean(obj&&cadSourceObject(obj)&&modules.connectedSelection.endpoints(obj).length&&activeTool==='select'),recommended:true,run:()=>selectCadConnected(obj?.id)});
    defs.push({key:`${mode}:utility:fit`,mode,group:'other',label:t('action.fit'),labelKey:'action.fit',basePriority:30,section:'other',available:true,recommended:true,run:fitAll});
    if(mode==='cad'){
      defs.push({key:'cad:utility:fitAllEntities',mode,group:'other',label:t('action.fitAllEntities'),labelKey:'action.fitAllEntities',basePriority:24,section:'other',available:true,recommended:state.sourceDxfOutlierCount>0,run:fitFullExtents});
      defs.push({key:'cad:utility:showAllLayers',mode,group:'other',label:t('action.showAllLayers'),labelKey:'action.showAllLayers',basePriority:10,section:'other',available:true,recommended:false,run:showAllCadLayers});
    }
    return defs;
  }
  function contextSettingsGroups(mode){
    const groups=toolCategoriesFor(mode).map(cat=>({id:cat.id,label:t(cat.labelKey)}));
    groups.push({id:'object',label:t('settings.contextObjectGroup')},{id:'other',label:t('settings.contextOtherGroup')});
    return groups;
  }
  function contextCommandsForSection(defs,section,ctx){return contextMenuModule.sort(defs.filter(command=>command.section===section&&contextMenuModule.isVisible(command,ctx,contextMenuOverrides)),contextMenuOverrides);}
  function showCanvasContextMenu(e){if(featureFill?.selection.current)return;
    if(isCompactViewer())return;
    const ctrlSnapGesture=state.toolset==='plan'&&e.ctrlKey&&['line','wall','measure','move','copy','trim','extend'].includes(state.activeTool);e.preventDefault();if(ctrlSnapGesture)return;hideTooltip();
    const raw=screenCssToWorld(fromPointerEvent(e)),obj=hitObject(raw);
    if(obj){state.selectedObjectId=obj.id;state.selectedReferenceId=null;state.selectedRegionId=null;renderPrimaryPanel();renderProperties();render();}
    const defs=contextCommandDefinitions(state.toolset,{obj}),ctx={mode:state.toolset,obj,activeTool:state.activeTool,activeCategory:activeCategoryForTool(state.toolset,state.activeTool)};
    let vertexEditItem=false;
    if(state.toolset==='cad'&&modules.cadPolyline.is(obj)&&obj.vertices.length<=500&&cadObjectModifiable(obj,{notify:false})){
      const grip=hitHandle(raw,obj),match=/^poly:(\d+)$/.exec(String(grip||''));
      if(match){const index=Number(match[1]),min=obj.closed?3:2;addContextMenuItem(t('action.deletePolylineVertex'),()=>deleteCadPolylineVertex(obj,index),{danger:true,disabled:obj.vertices.length<=min});vertexEditItem=true;}
      else{const hit=modules.cadPolyline.nearest(obj,raw),tol=modules.geometryQuery.tolerance.world(10,state.camera.zoom);if(hit&&hit.distance<=tol){addContextMenuItem(t('action.insertPolylineVertex'),()=>insertCadPolylineVertexAt(obj,hit.point));vertexEditItem=true;}}
    }
    const sections=['escape','current','group','other'].map(section=>contextCommandsForSection(defs,section,ctx)).filter(items=>items.length);
    if(vertexEditItem&&sections.length)addContextMenuDivider();
    for(let si=0;si<sections.length;si++){if(si)addContextMenuDivider();for(const command of sections[si])addContextMenuItem(command.label,command.run,{danger:command.danger,note:command.note,primary:command.primary,disabled:command.enabled===false,checked:command.checked});}
    if(!contextMenu.childElementCount)return;
    contextMenu.hidden=false;contextMenu.style.left='0px';contextMenu.style.top='0px';const margin=8,rect=contextMenu.getBoundingClientRect();contextMenu.style.left=`${Math.max(margin,Math.min(e.clientX,window.innerWidth-rect.width-margin))}px`;contextMenu.style.top=`${Math.max(margin,Math.min(e.clientY,window.innerHeight-rect.height-margin))}px`;
  }

  let tooltipTimer=null,tooltipOwner=null;
  function tooltipTargetFrom(node){return node instanceof Element?node.closest('[data-tooltip-key],[data-tooltip-title-key],[data-tooltip-title]'):null;}
  function hideTooltip(){clearTimeout(tooltipTimer);tooltipTimer=null;tooltipOwner=null;dom.uiTooltip.hidden=true;dom.uiTooltip.innerHTML='';}
  function showTooltip(owner){if(!owner?.isConnected)return;const title=owner.dataset.tooltipTitleKey?t(owner.dataset.tooltipTitleKey):(owner.dataset.tooltipTitle||''),copy=owner.dataset.tooltipKey?t(owner.dataset.tooltipKey):'',shortcut=owner.dataset.shortcut||'';if(!title&&!copy&&!shortcut)return;const parts=[];if(title)parts.push(`<div class="tooltip-title">${escapeHtml(title)}</div>`);if(copy)parts.push(`<div class="tooltip-copy">${escapeHtml(copy)}</div>`);if(shortcut)parts.push(`<div class="tooltip-shortcut">${escapeHtml(t('tooltip.shortcut'))} · ${escapeHtml(shortcut)}</div>`);dom.uiTooltip.innerHTML=parts.join('');dom.uiTooltip.hidden=false;const rect=owner.getBoundingClientRect(),tip=dom.uiTooltip.getBoundingClientRect(),margin=8;let left=rect.left+rect.width/2-tip.width/2;left=Math.max(margin,Math.min(window.innerWidth-tip.width-margin,left));let top=rect.top-tip.height-margin;if(top<margin)top=rect.bottom+margin;top=Math.max(margin,Math.min(window.innerHeight-tip.height-margin,top));dom.uiTooltip.style.left=`${Math.round(left)}px`;dom.uiTooltip.style.top=`${Math.round(top)}px`;}
  function scheduleTooltip(owner,delay){clearTimeout(tooltipTimer);tooltipOwner=owner;tooltipTimer=setTimeout(()=>{if(tooltipOwner===owner)showTooltip(owner);},delay);}
  function installTooltips(){document.addEventListener('pointerover',e=>{const owner=tooltipTargetFrom(e.target);if(!owner||owner.contains(e.relatedTarget))return;scheduleTooltip(owner,650);});document.addEventListener('pointerout',e=>{const owner=tooltipTargetFrom(e.target);if(!owner||owner.contains(e.relatedTarget))return;hideTooltip();});document.addEventListener('focusin',e=>{const owner=tooltipTargetFrom(e.target);if(owner)scheduleTooltip(owner,450);});document.addEventListener('focusout',e=>{const owner=tooltipTargetFrom(e.target);if(owner)hideTooltip();});document.addEventListener('pointerdown',hideTooltip,true);}

  function isEditableTarget(target){return Boolean(target&&target.nodeType===1&&(['INPUT','TEXTAREA','SELECT'].includes(target.tagName)||target.isContentEditable||target.closest?.('[contenteditable="true"]')));}
  function isTyping(){return isEditableTarget(document.activeElement);}
  function canvasShortcutContext(){const a=document.activeElement;return !a||a===document.body||a===host||a===canvas;}
  function cancelTransient(){if(featureFill?.selection.current){featureFill.cancelSelection();return;}if(state.dragEdit){cancelDirectDrag();return;}cadCommandSession?.cancel('escape');cadLineContinuationPoint=null;const wasDrawing=['line','polyline','rectangle','circle','arc','trim','extend','break','join','offset','fillet','chamfer','reconstruct','move','copy','rotate','mirror','scale','stretch','array','align','region-rotate','text','mtext','leader','aligned-dim','radius-dim','diameter-dim','angle-dim','continuous-dim','baseline-dim','hatch','component','stair','floor-refine'].includes(state.activeTool);state.stairDraft=null;state.drawStart=null;state.drawReferenceAngle=null;state.arcDraft=null;state.polylinePreview=null;state.cadPrimitivePreview=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;state.calibration=null;state.regionDrag=null;state.wallRecognitionPreview=null;state.curveReconstruction=null;state.annotationDraft=null;state.referenceClipDraft=null;state.selectionDrag=null;state.snapIndicator=null;state.smartGuides=[];state.trimPreview=null;state.spaceHoverPreview=null;state.shiftGuide=null;state.cadRotate=null;state.commandPending=null;state.activeCommand=null;clearConstraintInteraction();if(state.activeTool==='constraint'||wasDrawing)state.activeTool='select';host.dataset.tool=state.activeTool;dom.toolPopover.hidden=true;dom.dialogBackdrop.hidden=true;if(dom.annotationTextBackdrop)dom.annotationTextBackdrop.hidden=true;state.annotationDialogDraft=null;dom.recognitionBackdrop.hidden=true;setCommandStatus(t('command.cancelled'));renderToolRail();updateContextBar();renderProperties();render();}
  function handleCancelShortcut(){if(cancelImportJob())return;if(featureFill?.cancelActive())return;
    if(dom.annotationTextBackdrop&&!dom.annotationTextBackdrop.hidden){closeAnnotationTextDialog();state.annotationDraft=null;setTool('select','select');return true;}
    if(state.referenceClipDraft){state.referenceClipDraft=null;setCommandStatus(t('command.cancelled'));render();return true;}
    if(dom.settingsBackdrop&&!dom.settingsBackdrop.hidden){closeSettingsDialog();return true;}
    if(state.toolset==='cad'&&cadCommandSession?.activeId==='MA'){cancelTransient();return true;}
    if(dom.planPackageBackdrop&&!dom.planPackageBackdrop.hidden){closePlanPackageExportDialog();return true;}
    if(dom.planMergeBackdrop&&!dom.planMergeBackdrop.hidden){closePlanMergeDialog();return true;}
    if(state.spaceGapDiagnostic){clearSpaceGapDiagnostic();return true;}
    if(dom.exportSaveBackdrop&&!dom.exportSaveBackdrop.hidden){closeDxfFallbackSaveDialog();return true;}
    if(!dom.confirmBackdrop.hidden){hideAppConfirm({cancel:true});return true;}
    if(state.dragEdit){cancelDirectDrag();return true;}
    hideTooltip();hideContextMenu();closeFloorActionMenu();
    if(state.selectionDrag){state.selectionDrag=null;render();}
    else if(state.activeTool==='constraint')cancelTransient();
    else if(state.activeTool==='select'&&selectionIds().size){clearMultiSelection();renderPrimaryPanel();renderProperties();render();}
    else cancelTransient();
    return true;
  }

  async function startToolsetFromHome(toolset){
    if(state.sessionKind==='sample'||hasLiveCurrentWork()){switchToolset(toolset,{skipMapping:true});return;}
    if(state.browserSavedMeta){if(!(await requestWorkspaceReplacement()))return;await resetProject({skipGuard:true});}
    switchToolset(toolset,{skipMapping:true});
  }
  dom.startPlanBtn.addEventListener('click',()=>startToolsetFromHome('plan'));
  dom.startOpenProjectBtn?.addEventListener('click',chooseAndOpenProjectFile);
  dom.startOpenPackageBtn?.addEventListener('click',()=>{state.planPackageOpenMode='open';dom.planPackageFileInput.click();});
  dom.startMergePlanBtn?.addEventListener('click',openPlanMergeDialog);
  dom.startCadBtn.addEventListener('click',()=>startToolsetFromHome('cad'));
  dom.startSampleBtn.addEventListener('click',createSample);
  dom.continueWorkBtn.addEventListener('click',async()=>{if(state.sessionKind==='sample'&&sampleReturnWorkspace){restoreSampleReturnWorkspace({openWorkspace:true});return;}if(hasCurrentWork())switchToolset(state.toolset,{skipMapping:true});else if(state.browserSavedMeta)await openBrowserSavedProject();});
  dom.backBtn.addEventListener('click',()=>history.back());
  dom.homeBtn.addEventListener('click',()=>showStartScreen());
  dom.planToolsBtn.addEventListener('click',()=>switchToolset('plan'));
  dom.cadToolsBtn.addEventListener('click',()=>switchToolset('cad'));
  dom.appearanceBtn.addEventListener('click',e=>{e.stopPropagation();toggleAppearanceMenu(dom.appearanceBtn);});
  dom.startAppearanceBtn.addEventListener('click',e=>{e.stopPropagation();toggleAppearanceMenu(dom.startAppearanceBtn);});
  dom.viewMenuBtn?.addEventListener('click',e=>{e.stopPropagation();updateViewMenuActions();toggleTopMenu(dom.viewMenu,dom.viewMenuBtn);});
  dom.fileMenuBtn?.addEventListener('click',e=>{e.stopPropagation();toggleTopMenu(dom.fileMenu,dom.fileMenuBtn);});
  dom.settingsMenuBtn?.addEventListener('click',e=>{e.stopPropagation();toggleTopMenu(dom.settingsMenu,dom.settingsMenuBtn);});
  dom.openSettingsAction?.addEventListener('click',openSettingsDialog);
  dom.settingsCloseBtn?.addEventListener('click',closeSettingsDialog);dom.settingsCloseIcon?.addEventListener('click',closeSettingsDialog);dom.settingsBackdrop?.addEventListener('pointerdown',e=>{if(e.target===dom.settingsBackdrop)closeSettingsDialog();});
  dom.settingsLanguage?.addEventListener('change',()=>applyLanguagePreference(dom.settingsLanguage.value));
  dom.settingsDefaultUnit?.addEventListener('change',()=>{try{localStorage.setItem(DEFAULT_UNIT_STORAGE_KEY,dom.settingsDefaultUnit.value==='imperial'?'imperial':'metric');}catch(_){}setCommandStatus(t('settings.saved'),'strong');});
  try{const v=localStorage.getItem('pieniplan-snap-sensitivity');state.snapSensitivity=modules.precision.radius[v]?v:'normal';}catch{state.snapSensitivity='normal';}
  dom.settingsSnapSensitivity?.addEventListener('change',()=>{state.snapSensitivity=dom.settingsSnapSensitivity.value;try{localStorage.setItem('pieniplan-snap-sensitivity',state.snapSensitivity);}catch{}state.snapIndicator=null;setCommandStatus(t('settings.saved'),'strong');render();});
  dom.settingsTextSize?.addEventListener('change',()=>{applyTextSize(dom.settingsTextSize.value);setCommandStatus(t('settings.saved'),'strong');});
  dom.settingsRecoveryEnabled?.addEventListener('change',()=>{state.recoveryEnabled=Boolean(dom.settingsRecoveryEnabled.checked);try{localStorage.setItem(RECOVERY_ENABLED_STORAGE_KEY,String(state.recoveryEnabled));}catch(_){}if(state.recoveryEnabled)scheduleRecoverySnapshot();else if(recoveryTimer){clearTimeout(recoveryTimer);recoveryTimer=null;}setCommandStatus(t('settings.saved'),'strong');});
  dom.settingsOpenRecovery?.addEventListener('click',openRecoverySnapshot);
  document.querySelectorAll('[data-settings-page]').forEach(button=>button.addEventListener('click',()=>showSettingsPage(button.dataset.settingsPage)));
  for(const [id,key,min,max] of [['settingsPlanLineColor','color',null,null],['settingsPlanLineWidth','width',.5,6],['settingsPlanDashScale','dashScale',.5,3]]){const el=document.getElementById(id);el?.addEventListener('change',()=>{const old=planLineAppearance(),value=key==='color'?el.value:Number(el.value);if(key==='color'?!/^#[\da-f]{6}$/i.test(value):!Number.isFinite(value)||value<min||value>max){el.value=String(old[key]);return;}if(String(old[key])===String(value))return;pushHistory();state.toolSettings.planLineAppearance={...old,[key]:value};markDirty(true);updateAll();});}
  document.querySelectorAll('[data-context-mode]').forEach(button=>button.addEventListener('click',()=>{settingsContextMode=button.dataset.contextMode==='plan'?'plan':'cad';renderSettingsContextMenu();}));
  dom.settingsContextReset?.addEventListener('click',()=>{contextMenuOverrides=Object.create(null);persistContextMenuOverrides();renderSettingsContextMenu();setCommandStatus(t('settings.contextResetDone'),'strong');});
  dom.viewFitAction?.addEventListener('click',()=>{closeTopMenus();fitAll();});
  dom.viewRegionAction?.addEventListener('click',()=>{closeTopMenus();fitDrawingRegion();});
  dom.viewAllAction?.addEventListener('click',()=>{closeTopMenus();fitFullExtents();});
  dom.fileNewAction?.addEventListener('click',()=>{closeTopMenus();resetProject();});
  dom.fileOpenProjectAction?.addEventListener('click',()=>{closeTopMenus();chooseAndOpenProjectFile();});
  dom.fileSaveProjectAction?.addEventListener('click',()=>{closeTopMenus();saveProjectFile();});
  dom.fileDownloadProjectAction?.addEventListener('click',()=>{closeTopMenus();downloadProjectFile();});
  dom.fileExportPlanPackageAction?.addEventListener('click',()=>{closeTopMenus();openPlanPackageExportDialog();});
  dom.fileImportPlanPackageAction?.addEventListener('click',()=>{closeTopMenus();state.planPackageOpenMode='import';dom.planPackageFileInput.click();});
  dom.fileOpenDxfAction?.addEventListener('click',()=>{closeTopMenus();dom.dxfEditFileInput.click();});
  dom.fileExportDxfAction?.addEventListener('click',()=>{closeTopMenus();exportDxf();});
  dom.fileSheetPdfAction?.addEventListener('click',()=>{closeTopMenus();openQuickSheetPrint();});
  dom.helpBtn?.addEventListener('click',()=>openHelp());dom.aboutBtn?.addEventListener('click',openAbout);
  dom.helpCloseBtn?.addEventListener('click',()=>dom.helpBackdrop.hidden=true);dom.aboutCloseBtn?.addEventListener('click',()=>dom.aboutBackdrop.hidden=true);
  dom.helpBackdrop?.addEventListener('click',e=>{if(e.target===dom.helpBackdrop)dom.helpBackdrop.hidden=true;});dom.aboutBackdrop?.addEventListener('click',e=>{if(e.target===dom.aboutBackdrop)dom.aboutBackdrop.hidden=true;});
  document.querySelectorAll('.help-nav-item').forEach(b=>b.addEventListener('click',()=>openHelp(b.dataset.helpSection)));
  document.addEventListener('click',e=>{if(!e.target.closest('.top-menu')&&!e.target.closest('#viewMenuBtn')&&!e.target.closest('#fileMenuBtn')&&!e.target.closest('#settingsMenuBtn'))closeTopMenus();});
    document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{applyTheme(button.dataset.themeChoice);dom.appearanceMenu.hidden=true;if(dom.settingsMenu)dom.settingsMenu.hidden=true;}));
  document.querySelectorAll('.inspector-tab').forEach(b=>b.addEventListener('click',()=>switchInspector(b.dataset.tab)));

  dom.openProjectBtn.addEventListener('click',chooseAndOpenProjectFile);
  dom.projectFileInput.addEventListener('change',async()=>{const file=dom.projectFileInput.files?.[0];if(file)await openProjectFile(file);dom.projectFileInput.value='';});
  dom.planPackageFileInput?.addEventListener('change',async()=>{const file=dom.planPackageFileInput.files?.[0];if(file)await importPlanPackageFile(file,{mode:state.planPackageOpenMode||'import'});});
  dom.planMergeFileInput?.addEventListener('change',async()=>{const files=[...(dom.planMergeFileInput.files||[])];dom.planMergeFileInput.value='';if(files.length)await addPlanMergeFiles(files);});
  dom.planPackageCancelBtn?.addEventListener('click',closePlanPackageExportDialog);dom.planPackageExportBtn?.addEventListener('click',exportPlanPackageNow);dom.planPackageBackdrop?.addEventListener('pointerdown',e=>{if(e.target===dom.planPackageBackdrop)closePlanPackageExportDialog();});
  dom.planMergeAddBtn?.addEventListener('click',()=>dom.planMergeFileInput.click());dom.planMergeCancelBtn?.addEventListener('click',closePlanMergeDialog);dom.planMergeExportBtn?.addEventListener('click',exportMergedPlanPackage);dom.planMergeBackdrop?.addEventListener('pointerdown',e=>{if(e.target===dom.planMergeBackdrop)closePlanMergeDialog();});
  dom.saveProjectBtn.addEventListener('click',saveProjectFile);
  dom.openRefBtn.addEventListener('click',()=>dom.referenceFileInput.click());dom.emptyOpenBtn.addEventListener('click',()=>state.toolset==='cad'?dom.dxfEditFileInput.click():dom.referenceFileInput.click());dom.addReferenceBtn.addEventListener('click',()=>dom.referenceFileInput.click());
  dom.referenceFileInput.addEventListener('change',()=>openReferenceFile(dom.referenceFileInput.files?.[0]));
  dom.referenceReconnectFileInput?.addEventListener('change',async()=>{const file=dom.referenceReconnectFileInput.files?.[0],ref=state.references.find(r=>r.id===state.referenceReconnectId);dom.referenceReconnectFileInput.value='';state.referenceReconnectId=null;if(file&&ref)await reconnectReferenceFile(ref,file);});
  dom.openDxfBtn.addEventListener('click',()=>dom.dxfEditFileInput.click());dom.dxfEditFileInput.addEventListener('change',()=>openEditableDxf(dom.dxfEditFileInput.files?.[0]));
  dom.fitBtn.addEventListener('click',fitAll);dom.newBtn.addEventListener('click',resetProject);dom.undoBtn.addEventListener('click',undo);dom.redoBtn.addEventListener('click',redo);dom.exportDxfBtn.addEventListener('click',exportDxf);
  dom.emptyPrimaryBtn.addEventListener('click',()=>setTool('line','draw'));
  dom.mappingSettingsBtn.addEventListener('click',()=>openMappingDialog('settings'));dom.mappingApplyBtn.addEventListener('click',applyMapping);dom.mappingCancelBtn.addEventListener('click',cancelMapping);dom.recognitionApplyBtn.addEventListener('click',applyWallRecognition);dom.recognitionCancelBtn.addEventListener('click',cancelWallRecognition);
  dom.gridToggle.addEventListener('click',()=>{state.grid=!state.grid;dom.gridToggle.classList.toggle('active',state.grid);render();});dom.snapToggle.addEventListener('click',()=>{state.snap=!state.snap;dom.snapToggle.classList.toggle('active',state.snap);});dom.orthoToggle.addEventListener('click',()=>{state.ortho=!state.ortho;dom.orthoToggle.classList.toggle('active',state.ortho);render();});dom.polarToggle.addEventListener('click',()=>{state.polar=!state.polar;dom.polarToggle.classList.toggle('active',state.polar);render();});
  dom.annotationTextCancelBtn?.addEventListener('click',()=>{closeAnnotationTextDialog();state.annotationDraft=null;setTool('select','select');});dom.annotationTextApplyBtn?.addEventListener('click',applyAnnotationTextDialog);dom.annotationTextBackdrop?.addEventListener('pointerdown',e=>{if(e.target===dom.annotationTextBackdrop){closeAnnotationTextDialog();state.annotationDraft=null;setTool('select','select');}});dom.annotationTextArea?.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeAnnotationTextDialog();state.annotationDraft=null;setTool('select','select');}else if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();applyAnnotationTextDialog();}});
  dom.dialogCancelBtn.addEventListener('click',()=>{dom.dialogBackdrop.hidden=true;if(dom.dialogScaleFloorRow)dom.dialogScaleFloorRow.hidden=true;state.calibration=null;state.previewEnd=null;updateAll();});dom.dialogApplyBtn.addEventListener('click',applyCalibration);dom.dialogInput.addEventListener('keydown',e=>{if(e.key==='Enter')applyCalibration();if(e.key==='Escape')dom.dialogCancelBtn.click();});
  dom.confirmCancelBtn.addEventListener('click',()=>hideAppConfirm({cancel:true}));dom.confirmSaveBtn?.addEventListener('click',()=>{const fn=state.confirmSecondaryAction;hideAppConfirm();if(fn)fn();});dom.confirmApplyBtn.addEventListener('click',()=>{const fn=state.confirmAction;hideAppConfirm();if(fn)fn();});dom.confirmBackdrop.addEventListener('pointerdown',e=>{if(e.target===dom.confirmBackdrop)hideAppConfirm({cancel:true});});
  dom.exportSaveCancelBtn?.addEventListener('click',closeDxfFallbackSaveDialog);dom.exportSaveApplyBtn?.addEventListener('click',applyDxfFallbackSave);dom.exportSaveBackdrop?.addEventListener('pointerdown',e=>{if(e.target===dom.exportSaveBackdrop)closeDxfFallbackSaveDialog();});dom.exportSaveName?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyDxfFallbackSave();}else if(e.key==='Escape'){e.preventDefault();closeDxfFallbackSaveDialog();}});
  dom.commandInput.addEventListener('compositionstart',()=>{state.commandComposing=true;commandConsole.hideSuggestions();});
  dom.commandInput.addEventListener('compositionend',()=>{state.commandComposing=false;if(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/.test(dom.commandInput.value)){commandConsole.hideSuggestions();setCommandStatus(t('command.englishOnly'),'error');}});
  dom.commandInput.addEventListener('keydown',e=>{if(e.isComposing||e.keyCode===229||state.commandComposing)return;if(e.key==='Tab'&&!dom.commandSuggestions?.hidden){if(commandConsole.completeFirst())e.preventDefault();}else if(e.metaKey&&e.code==='Period'){e.preventDefault();e.stopPropagation();dom.commandInput.value='';commandConsole.hideSuggestions();handleCancelShortcut();host.focus();}else if(e.key==='Enter'){e.preventDefault();e.stopPropagation();const raw=dom.commandInput.value;if(!/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/.test(raw))dom.commandInput.value='';commandConsole.hideSuggestions();runCommand(raw);}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dom.commandInput.value='';commandConsole.hideSuggestions();handleCancelShortcut();host.focus();}});

  canvas.addEventListener('pointermove',onPointerMove);canvas.addEventListener('pointerdown',onPointerDown);canvas.addEventListener('pointerup',onPointerUp);canvas.addEventListener('pointercancel',onPointerCancel);canvas.addEventListener('dblclick',onCanvasDoubleClick);canvas.addEventListener('wheel',onWheel,{passive:false});canvas.addEventListener('contextmenu',showCanvasContextMenu);
  host.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});host.addEventListener('drop',e=>{e.preventDefault();const file=e.dataTransfer.files?.[0];if(file)openReferenceFile(file);});
  window.addEventListener('resize',()=>{updateCompactViewerState();resizeCanvas();});
  window.addEventListener('blur',()=>{if(state.dragEdit)cancelDirectDrag({status:false});});
  window.addEventListener('popstate',e=>applyRoute(e.state));
  window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change',()=>{if(state.theme==='system'){updateThemeMeta();render();}});
  window.addEventListener('keydown',e=>{
    if(e.isComposing||e.keyCode===229||state.commandComposing)return;
    if(featureFill?.selection.current||isEditableTarget(e.target))return;
    if(state.view!=='workspace'){if(e.key==='Escape')dom.appearanceMenu.hidden=true;return;}
    if(state.toolset==='cad'&&e.metaKey&&e.code==='Period'){e.preventDefault();e.stopPropagation();handleCancelShortcut();return;}
    if(e.key==='Shift'&&!isTyping()){state.shiftDown=true;if(state.toolset==='cad'&&state.cursorWorld)updateTrimPreview(state.cursorWorld,{shift:true});render();}
    if(e.key==='Control'&&!isTyping()){state.ctrlDown=true;render();}
    if(e.code==='Space'&&!isTyping()&&canvasShortcutContext()){if(!state.spaceDown)state.spaceGesture={used:false,started:performance.now()};state.spaceDown=true;e.preventDefault();}
    if(!isTyping()&&e.key==='F3'){e.preventDefault();state.snap=!state.snap;dom.snapToggle.classList.toggle('active',state.snap);render();}
    if(!isTyping()&&e.key==='F7'){e.preventDefault();state.grid=!state.grid;dom.gridToggle.classList.toggle('active',state.grid);render();}
    if(!isTyping()&&e.key==='F8'){e.preventDefault();state.ortho=!state.ortho;dom.orthoToggle.classList.toggle('active',state.ortho);render();}
    if(!isTyping()&&e.key==='F10'){e.preventDefault();state.polar=!state.polar;dom.polarToggle.classList.toggle('active',state.polar);render();}
    if(!isTyping()&&e.key==='Enter'){e.preventDefault();acceptCanvasCommand();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveProjectFile();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!isTyping()){e.preventDefault();e.shiftKey?redo():undo();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'&&!isTyping()){e.preventDefault();redo();}
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();handleCancelShortcut();}
    if((e.key==='Delete'||e.key==='Backspace')&&!isTyping()&&selectionIds().size){e.preventDefault();deleteSelectedObjects();}
    if(!isTyping()&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&/^[a-zA-Z]$/.test(e.key)){e.preventDefault();dom.commandInput.focus();dom.commandInput.value=e.key.toUpperCase();}
  });
  window.addEventListener('keydown',e=>{if(e.key==='Alt'){state.altDown=true;state.snapIndicator=null;state.smartGuides=[];if(state.lastCanvasPointer&&!isTyping())onPointerMove({...state.lastCanvasPointer,altKey:true,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey});render();}});
  window.addEventListener('blur',()=>{state.altDown=false;state.lastCanvasPointer=null;state.smartGuides=[];});
  window.addEventListener('keyup',e=>{if(e.key==='Alt'){state.altDown=false;if(state.lastCanvasPointer&&!isTyping())onPointerMove({...state.lastCanvasPointer,altKey:false,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey});render();}if(e.key==='Shift'){state.shiftDown=false;if(state.toolset==='cad'&&state.cursorWorld)updateTrimPreview(state.cursorWorld,{shift:false});state.shiftGuide=null;render();}if(e.key==='Control'){state.ctrlDown=false;state.snapIndicator=null;render();}if(e.code==='Space'){const gesture=state.spaceGesture;state.spaceDown=false;state.spaceGesture=null;if(!state.pan)host.dataset.pan='false';if(gesture&&!gesture.used&&(performance.now()-gesture.started)<420&&state.view==='workspace'&&!isTyping()&&canvasShortcutContext()){if(state.toolset==='plan')setTool('select','plan');else if(state.toolset==='cad')acceptCanvasCommand();}}});
  window.addEventListener('pagehide',()=>{if(state.dirty&&state.recoveryEnabled)saveRecoverySnapshot();});
  window.addEventListener('beforeunload',e=>{if(state.dirty){if(state.recoveryEnabled)saveRecoverySnapshot();e.preventDefault();e.returnValue='';}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.tool-rail')&&!e.target.closest('.tool-popover'))dom.toolPopover.hidden=true;if(!e.target.closest('#appearanceMenu')&&!e.target.closest('#appearanceBtn')&&!e.target.closest('#startAppearanceBtn'))dom.appearanceMenu.hidden=true;if(!e.target.closest('.canvas-context-menu'))hideContextMenu();if(!e.target.closest('.floor-action-menu')&&!e.target.closest('.floor-row .mini-action')&&!e.target.closest('.floor-space-row .mini-action'))closeFloorActionMenu();});

  const floorGhostKeys=new WeakMap();
  let floorGhostCache={objects:null,revision:-1,groups:new Map()};
  function floorSemanticObjects(floor){if(floorGhostCache.objects!==state.objects||floorGhostCache.revision!==state.cadRenderRevision){const groups=new Map();for(const o of state.objects){if(!o.floorId)continue;if(!groups.has(o.floorId))groups.set(o.floorId,[]);groups.get(o.floorId).push(o);}floorGhostCache={objects:state.objects,revision:state.cadRenderRevision,groups};}return floorGhostCache.groups.get(floor.id)||[];}
  function planFloorRefinement(ids,referenceId,sourcePoint,targetPoint,axis='both'){
    if(state.toolset!=='plan'||!['both','horizontal','vertical'].includes(axis))return null;
    const floor=activeFloor(),reference=state.floors.find(f=>f.id===referenceId&&f.id!==floor?.id&&f.buildingId===floor?.buildingId),objects=ids.map(id=>state.objects.find(o=>o.id===id));
    if(!reference||!objects.length||objects.some(o=>!o||!objectOnActiveFloor(o)||!['wall','line','stair'].includes(o.type)||o.constraints?.fixed||o.constraints?.reference||Object.values(o.constraints?.endpointLocks||{}).some(Boolean)))return null;
    const A=modules.floorAlignment,source=A.point(sourcePoint,floor.viewAlignment),target=A.point(targetPoint,reference.viewAlignment);
    if(axis==='horizontal')target.y=source.y;if(axis==='vertical')target.x=source.x;const local=A.inverse(target,floor.viewAlignment),delta={x:local.x-sourcePoint.x,y:local.y-sourcePoint.y};if(!Number.isFinite(delta.x)||!Number.isFinite(delta.y))return null;
    const before=objects.map(o=>JSON.stringify(o)),after=objects.map(o=>{const copy=structuredClone(o);for(const key of ['a','b','center'])if(copy[key])copy[key]={x:copy[key].x+delta.x,y:copy[key].y+delta.y};if(copy.polygon)copy.polygon=copy.polygon.map(q=>({x:q.x+delta.x,y:q.y+delta.y}));return copy;});
    return{projectId:state.projectId,floorId:floor.id,referenceId,registrations:JSON.stringify([floor.viewAlignment,reference.viewAlignment]),ids:[...ids],before,after,delta};
  }
  function commitFloorRefinement(plan){
    const floor=activeFloor(),ref=state.floors.find(f=>f.id===plan?.referenceId);if(!plan||state.toolset!=='plan'||plan.projectId!==state.projectId||plan.floorId!==floor?.id||JSON.stringify([floor.viewAlignment,ref?.viewAlignment])!==plan.registrations||plan.ids.some((id,i)=>JSON.stringify(state.objects.find(o=>o.id===id))!==plan.before[i]))return false;
    if(Math.hypot(plan.delta.x,plan.delta.y)<1e-7)return false;
    pushHistory();for(let i=0;i<plan.ids.length;i++){const o=state.objects.find(o=>o.id===plan.ids[i]);if(o.type==='wall')detachWallBodyTopology(o);for(const key of ['a','b','center','polygon'])if(plan.after[i][key])o[key]=structuredClone(plan.after[i][key]);}
    setSelectionIds(new Set(plan.ids));refreshSpaces();markDirty(true);rebuildObjectSnapIndex();recordEdit('floor-refinement',{ids:plan.ids,referenceId:plan.referenceId,delta:plan.delta});updateAll();return true;
  }
  function featureFloorGeometry(floor){const region=state.drawingRegions.find(r=>r.id===floor.sourceRegionId);return [...floorSemanticObjects(floor).filter(o=>o.type==='wall'||o.type==='line'),...(region?cadObjectsForRegion(region):[])];}
  function drawFloorGhost(floor,transform,opacity){const before=projectionFloorOverride,previousProjection=renderProjection;ctx.save();try{projectionFloorOverride={floor,transform:transform||modules.floorAlignment.identity};renderProjection=projectionState();ctx.globalAlpha*=opacity;const color=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#3478f6';ctx.strokeStyle=color;ctx.lineWidth=1;const line=(a,b)=>{const x=toScreenCss(a),y=toScreenCss(b);ctx.beginPath();ctx.moveTo(x.x,x.y);ctx.lineTo(y.x,y.y);ctx.stroke();};const region=state.drawingRegions.find(r=>r.id===floor.sourceRegionId);if(region){const ref=state.references.find(r=>r.type==='linkedCadRegion'&&r.regionId===region.id),key=ref||floorGhostKeys.get(floor)||{},cache=(floorGhostKeys.set(floor,key),getLinkedCadRenderCache(key,region));ctx.save();applyWorldCanvasTransform();ctx.lineWidth=1/Math.max(state.camera.zoom,.000001);for(const [layer,data] of cache.layers)if(cadLayerVisible(layer,region.id))ctx.stroke(data.path);ctx.restore();for(const [layer,data]of cache.layers){if(!cadLayerVisible(layer,region.id))continue;for(const text of data.texts){const size=(text.height||180)*state.camera.zoom;if(size<2)continue;const q=toScreenCss(text.point);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(-rad((text.rotation||0)+viewAngle()));ctx.font=`${Math.min(size,900)}px system-ui`;ctx.fillStyle=color;ctx.fillText(text.text,0,0);ctx.restore();}}}
    for(const ref of floorReferencePlacements(floor))if(ref.visible!==false&&ref.type!=='linkedCadRegion'&&ref.type!=='pdf')drawReference({...ref,opacity:(ref.opacity??.62)*opacity});
    for(const o of floor.previewObjects||floorSemanticObjects(floor)){if(o.type==='wall'){for(const [a,b]of wallOutlineVisibleWorld(o))line(a,b);}else if(o.type==='line')line(o.a,o.b);else if(o.type==='stair')for(const g of modules.planStair.segments(o))line(g.a,g.b);else if(o.type==='component'){const asset=componentLibrary.get(o.assetId);if(asset)for(const path of componentLibrary.vectorPaths(asset)){const pts=path.points.map(pt=>toScreenCss(componentLibrary.worldPoint(o,pt)));ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));if(path.closed)ctx.closePath();ctx.stroke();}}else if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);if(g)line(g.p1,g.p2);}else if(o.type==='dimension'){const g=dimensionGeometry(o);if(g){line(g.d1,g.d2);line(g.p1,g.d1);line(g.p2,g.d2);}}else{const pts=o.polygon||o.points;if(pts?.length){for(let i=1;i<pts.length;i++)line(pts[i-1],pts[i]);if(o.type==='space'||o.type==='stair')line(pts.at(-1),pts[0]);}}}
  }finally{projectionFloorOverride=before;renderProjection=previousProjection;ctx.restore();}}
  featureFill=modules.postFeatureFill.create({state,host,canvas,ctx,t,language:()=>i18n.language,status:setCommandStatus,render,update:updateAll,history:pushHistory,changed:()=>markDirty(true),rebuild:()=>rebuildObjectSnapIndex(),uid,eventWorld:e=>screenCssToWorld(fromPointerEvent(e)),snap:nearestSnap,screen:toScreenCss,canvasSize:cssCanvasSize,cancelEditing:()=>{cancelTransient();if(state.pan)try{canvas.releasePointerCapture(state.pan.pointerId);}catch{}state.pan=null;state.spaceDown=false;state.spaceGesture=null;host.dataset.pan='false';},setFloor:setActiveFloor,viewFloor,buildingCamera,drawGhost:drawFloorGhost,floorGeometry:featureFloorGeometry,refinementPlan:planFloorRefinement,refinementCommit:commitFloorRefinement,selectionIds:()=>[...selectionIds()],tool:setTool,inspector:switchInspector,currentRegion:activeCadWorkRegion,planOutputPages,svg:sheetSvg,print:printSheetOutputJob,closeMenus:closeTopMenus});
  applyShortcutMetadata(dom.gridToggle,'grid','tooltip.grid');applyShortcutMetadata(dom.snapToggle,'snap','tooltip.snap');applyShortcutMetadata(dom.orthoToggle,'ortho','tooltip.ortho');applyShortcutMetadata(dom.polarToggle,'polar','tooltip.polar');
  if(window.__PIENIPLAN_TEST_HOOK__){Object.assign(window.__PIENIPLAN_TEST_HOOK__,{state,featureFill,setPlanStroke,recognizedSpaceBoundaries,planOutputPages,drawFloorGhost,featureFloorGeometry,viewFloor,buildingCamera,printSheetOutputJob,cadCommands,markDirty,cancelTransient,undo,redo,onPointerDown,onPointerMove,commitSegment,applyObjectDrag,syncDependentsOfWall,isPlanDisplayArc,planLineAppearance,activatePlanDrawing,doubleLeafSplit,drawLineObject,openPlanTypePalette,planDrawReferenceAt,detectWallCandidates,beginWallRecognition,applyWallRecognition,cancelWallRecognition,render,updateAll,fitAll,fitBounds,drawingRegionForFit,fitDrawingRegion,updateViewMenuActions,showWorkspace,showStartScreen,switchToolset,setTool,rebuildObjectSnapIndex,renderCadLayersPanel,revealCadLayerRow,applyTextSize,safeReadTextSize,showCanvasContextMenu,contextCommandDefinitions,renderSettingsContextMenu,showSettingsPage,setContextMenuOverride,safeReadContextMenuOverrides,cadLayerForObject,openLayerColorPopover,closeLayerColorPopover,setCadLayerProperties,clearCadLayerVisibilityOverride,cadRegionLayerOverride,cadLayerHasOverride,placeComponent,editComponent,rotateComponent90,mirrorComponent,componentObjectsForCad,deleteObjectById,duplicateObject,renderProperties,openProjectFile,saveProjectFile,saveRecoverySnapshot,clearRecoverySnapshot,requestWorkspaceReplacement,startToolsetFromHome,createSample,restoreSampleReturnWorkspace,cancelDirectDrag,onPointerCancel,historySnapshot,restoreHistorySnapshot,downloadProjectFile,makeProjectPayload,makePlanPackage,validatePlanPackage,importPlanPackageFile,importedPlanPackageData,replaceWorkspaceWithPlanPackage,mergedDrawingClone,pristinePlaceholderDrawing,syncCoincidentNodeOnly,detachWallBodyTopology,dxfDoorEntities,constrainTracking,constrainEndpointWithShift,constrainBodyMoveDelta,connectedWallAngles,applyTrimExtendAtPoint,extendPlanLinearAtClick,ensureBuildingModel,activeBuilding,floorsForBuilding,ensureFloorModel,ensureFloorForRegion,repairFloorRegionIsolation,setActiveFloor,addBuilding,addFloor,renderPlanFloorPanel,reorderBuilding,reorderFloor,getPlanObjects,detectClosedWallFaces,updateSpaceHoverPreview,findSpaceBoundaryGapCandidates,endpointTouchesOtherBoundary,commitSpace,ensureSpaceMetadata,nextSpaceName,calculatedSpaceAreaM2,displaySpaceAreaM2,usesManualSpaceArea,setSpaceManualArea,setSpaceCalculatedArea,clearSpaceGapDiagnostic,doorSwingSide,doorSwingSectors,doorDirectManipulationMode,hingedLeafGeometry,flipDoorHingePreserveSide,flipDoorSwingSide,getLinkedCadRenderCache,recordEdit,runCommand,commandMatches,renderCommandConsole,trimArchitecturalWallOverruns,solveArchitecturalWallJunctions,healArchitecturalEndpointGaps,normalizeArchitecturalJunctionEndpoints,cleanupArchitecturalWallTopology,repairPersistentPlanJunctions,migrateLegacyPlanLinesToEdges,solvePointOnEdgeAttachment,computePlanTrimSegment,computeCadTrimSegment,updateTrimPreview,activeCadWorkRegion,cadObjectsForRegion,cadWorkObjects,cadObjectInWorkScope,cadSelectableObjects,setCadWorkRegion,renderCadScopeControl,cadGlobalLayerVisible,cadRegionLayerVisible,cadLayerVisible,cadLayerInheritedOff,cadKnownLayers,cadLayerDefinition,cadLayerLocked,createCadLayer,renameCadLayer,deleteCadLayer,setCadLayerLocked,reassignCadObjects,setActiveCadLayer,cadMappingUsesLayer,setCadUnitSystem,cadPolicy,cadContextToken,cadContextTokenCurrent,initializeCadServices,applySelectionSet,deleteSelectedObjects,beginObjectDrag,captureDragCancelState,deleteRegion,setCadLayerVisibilityUndoable,showAllCadLayers,serializeCadRegionLayerVisibility,restoreCadRegionLayerVisibility,renderReferences,referencesForRender,referenceBelongsToFloor,floorReferencePlacements,renderFloorReferencePlacement,beginCalibration,applyCalibration,scaleCurrentFloorGeometry,cadPlanOverlayObjects,beginCadRegionRotation,cadRotatePreviewDelta,rotatePointAround,commitCadRegionRotation,setCadRotateAbsoluteAngle,buildSegmentSnapIndex,queryReferenceSnapIndex,queryObjectSnapIndex,nearestSnap,parseCadPointText,resolveCadPoint,commitNativeCadLine,startNativeCadLineSession,commitNativeCadPolyline,startNativeCadPolylineSession,cloneCadPolylineWithFreshIds,transformCadPolylineOwner,setCadPolylineClosed,insertCadPolylineVertexAt,deleteCadPolylineVertex,commitNativeCadRectangle,commitNativeCadCircle,commitNativeCadArc,beginCurveReconstruction,recomputeCurveReconstruction,toggleCurveReconstructionObject,findMoreCurveReconstruction,clearCurveReconstruction,commitCurveReconstruction,curveReconstructionPiece,curveReconstructionEligibleObject,drawCurveReconstructionPreview,dispatchActiveCadCommandAction,commitCadOperation,getCadModifySourceId:()=>cadModifySourceId,cadJoinSourceEndpointPoints,snapDirectionToStep,constrainEndpointToOriginalAngle,detectSegmentedDoorCandidates,toScreenCss,screenCssToWorld,clientToCanvasCss,hitObject,hitObjectsAt,cycleHitObject,planCadMatrix,planCadArray,planCadPolarArray,planCadStretch,commitCadTransformPlan,selectCadPrevious,selectCadLast,selectCadSimilar,cadStretchCandidates,objectBodyDistance,wallVisibleSegments,suggestedFloorNameFromRegion,repairDefaultFloorNamesFromRegions,recognitionBaselineWallSignatures,recognizedWallSourceMatch,recognitionObjectSignature,recognizedObjectIsAutoOwned,saveDxfBlob,exportDxfNow,exportRegionDxf,buildRegionDxf,dxfCadAnnotationEntities,openQuickSheetPrint,sheetSvg,sheetPrintHtml,historyRetentionStats,trimHistoryRetention,appendHistoryEntry,cadDimensionGeometry,cadAlignedDimensionGeometry,createCadDimension,beginCadAnnotation,openAnnotationTextDialog,applyAnnotationTextDialog,updateHatchFromBoundary,polylineBoundaryPoints,handleCadAnnotationPoint,commitCadHatchAt,openReferenceFile,addPdfReference,reconnectReferenceFile,beginReferenceClip,handleReferenceClipPoint,clearReferenceClip,serializeReference,hydrateReference,syncPdfReferenceLayer});}

  state.unitSystem=safeReadDefaultUnit();contextMenuOverrides=safeReadContextMenuOverrides();dom.dialogBackdrop.hidden=true;if(dom.settingsBackdrop)dom.settingsBackdrop.hidden=true;if(dom.planPackageBackdrop)dom.planPackageBackdrop.hidden=true;if(dom.planMergeBackdrop)dom.planMergeBackdrop.hidden=true;dom.mappingBackdrop.hidden=true;dom.recognitionBackdrop.hidden=true;dom.confirmBackdrop.hidden=true;if(dom.exportSaveBackdrop)dom.exportSaveBackdrop.hidden=true;dom.commandBar.hidden=false;i18n.apply(document);state.browserSavedMeta=readBrowserSavedMeta();state.recoveryEnabled=safeReadRecoveryEnabled();state.recoveryMeta=readRecoveryMeta();state.inspectorSplit=safeReadInspectorSplit();state.theme=safeReadTheme();applyTheme(state.theme,{persist:false});state.textSize=safeReadTextSize();applyTextSize(state.textSize,{persist:false});installTooltips();updateEmptyState();renderToolRail();updateAll();if(dom.aboutVersion)dom.aboutVersion.textContent=`Version ${VERSION} · Build ${BUILD}`;if(dom.startVersion)dom.startVersion.textContent=`PieniPlan v${VERSION} · Build ${BUILD}`;renderCommandConsole();updateContinueCard();history.replaceState({[ROUTE_MARKER]:true,view:'start',toolset:state.toolset},'',location.href);showStartScreen({historyMode:'none'});setTimeout(resizeCanvas,0);console.info(`PieniPlan v${VERSION} · Build ${BUILD}`);
})();
