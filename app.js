(() => {
  'use strict';

  const VERSION = '0.3.0';
  const BUILD = 3;
  const INTERNAL_UNIT = 'mm';
  const i18n = window.PieniPlanI18n;
  const t = (key, vars) => i18n.t(key, vars);
  i18n.apply(document);

  const $ = (id) => document.getElementById(id);
  const canvas = $('drawingCanvas');
  const host = $('canvasHost');
  const ctx = canvas.getContext('2d');

  const dom = {
    appShell: $('appShell'), startScreen: $('startScreen'), startPlanBtn: $('startPlanBtn'), startCadBtn: $('startCadBtn'), startSampleBtn: $('startSampleBtn'),
    planToolsBtn: $('planToolsBtn'), cadToolsBtn: $('cadToolsBtn'), toolRail: $('toolRail'), toolPopover: $('toolPopover'),
    newBtn: $('newBtn'), openRefBtn: $('openRefBtn'), emptyOpenBtn: $('emptyOpenBtn'), addReferenceBtn: $('addReferenceBtn'),
    openDxfBtn: $('openDxfBtn'), dxfEditFileInput: $('dxfEditFileInput'), referenceFileInput: $('referenceFileInput'),
    fitBtn: $('fitBtn'), undoBtn: $('undoBtn'), redoBtn: $('redoBtn'), exportDxfBtn: $('exportDxfBtn'),
    contextToolName: $('contextToolName'), contextFields: $('contextFields'), contextHint: $('contextHint'),
    emptyState: $('emptyState'), emptyKicker: $('emptyKicker'), emptyTitle: $('emptyTitle'), emptyCopy: $('emptyCopy'), emptyPrimaryBtn: $('emptyPrimaryBtn'),
    primaryInspectorTab: $('primaryInspectorTab'), primaryPanelTitle: $('primaryPanelTitle'), primaryPanelSubtitle: $('primaryPanelSubtitle'), primaryList: $('primaryList'), mappingSettingsBtn: $('mappingSettingsBtn'),
    referenceList: $('referenceList'), propertiesPanel: $('propertiesPanel'),
    statusX: $('statusX'), statusY: $('statusY'), statusUnits: $('statusUnits'), statusZoom: $('statusZoom'),
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
    { id: 'dimensions', nameKey: 'layer.dimensions', visible: true }
  ];

  const planToolCatalog = [
    { id: 'select', labelKey: 'tool.select', icon: 'select', ready: true },
    { id: 'wall', labelKey: 'tool.wall', icon: 'wall', ready: true },
    { id: 'door', labelKey: 'tool.door', icon: 'door', ready: true },
    { id: 'window', labelKey: 'tool.window', icon: 'window', ready: true },
    { id: 'space', labelKey: 'tool.space', icon: 'space', ready: false },
    { separator: true },
    { id: 'measure', labelKey: 'tool.measure', icon: 'dimension', ready: true }
  ];

  const cadToolCatalog = {
    select: [
      { id: 'select', labelKey: 'tool.select', ready: true }
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
      { id: 'copy', labelKey: 'tool.copy', ready: false, note: 'CP' },
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
    drawStart: null,
    previewEnd: null,
    previewOpening: null,
    measureStart: null,
    calibration: null,
    grid: true,
    snap: true,
    ortho: false,
    spaceDown: false,
    pan: null,
    nextId: 1,
    history: [],
    future: [],
    toolSettings: { wallThickness: 150, doorWidth: 900, windowWidth: 1200 },
    cadMapping: null,
    mappingPendingAction: null,
    pendingToolAfterMapping: null,
    commandPending: null,
    sourceDxfName: null
  };

  function uid(prefix) { return `${prefix}-${state.nextId++}`; }
  function deg(radValue) { return radValue * 180 / Math.PI; }
  function rad(degValue) { return degValue * Math.PI / 180; }
  function distance(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
  function angleDeg(a, b) { return (deg(Math.atan2(b.y - a.y, b.x - a.x)) + 360) % 360; }
  function formatNumber(n, digits = 1) { return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—'; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  function unitFactorToMm(unit) { return unit?.metersPerUnit != null ? unit.metersPerUnit * 1000 : 1; }
  function isSemanticObject(o) { return ['wall','door','window','dimension'].includes(o?.type); }
  function isCadObject(o) { return ['cadLine','cadCircle','cadText'].includes(o?.type); }
  function hasSemanticObjects() { return state.objects.some(isSemanticObject); }

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
    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h);
    for (const ref of state.references) if (ref.visible) drawReference(ref);
    if (state.toolset === 'plan') drawPlanWorkspace(); else drawCadWorkspace();
    drawPreview();
    drawCalibrationPreview();
    drawOpeningPreview();
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

  function drawPlanWorkspace() {
    const styles = getComputedStyle(document.documentElement);
    const muted = styles.getPropertyValue('--cad-muted').trim();
    const line = styles.getPropertyValue('--line').trim();
    const wall = styles.getPropertyValue('--wall').trim();
    const dim = styles.getPropertyValue('--dimension').trim();
    const sel = styles.getPropertyValue('--selection').trim();

    for (const obj of state.objects) {
      if (!isCadObject(obj)) continue;
      if (!cadLayerVisible(obj.cadLayer)) continue;
      drawCadObject(obj, obj.id === state.selectedObjectId ? sel : muted, obj.id === state.selectedObjectId ? 2 : 1);
    }

    for (const obj of state.objects) {
      if (obj.type === 'wall' && layerVisible('walls')) drawWallPlan(obj, obj.id === state.selectedObjectId ? sel : wall);
    }
    for (const obj of state.objects) {
      if (obj.type === 'door' && layerVisible('doors')) drawOpeningPlan(obj, 'door', obj.id === state.selectedObjectId ? sel : styles.getPropertyValue('--door').trim());
      else if (obj.type === 'window' && layerVisible('windows')) drawOpeningPlan(obj, 'window', obj.id === state.selectedObjectId ? sel : styles.getPropertyValue('--window').trim());
      else if (obj.type === 'dimension' && layerVisible('dimensions')) drawDimension(obj, obj.id === state.selectedObjectId ? sel : dim);
      else if (obj.type === 'line' && layerVisible('drawing')) drawLineObject(obj, obj.id === state.selectedObjectId ? sel : line);
    }
  }

  function drawCadWorkspace() {
    const styles = getComputedStyle(document.documentElement);
    const line = styles.getPropertyValue('--line').trim();
    const sel = styles.getPropertyValue('--selection').trim();
    const dim = styles.getPropertyValue('--dimension').trim();
    const door = styles.getPropertyValue('--door').trim();
    const windowColor = styles.getPropertyValue('--window').trim();

    for (const obj of state.objects) {
      if (!isCadObject(obj) || !cadLayerVisible(obj.cadLayer)) continue;
      drawCadObject(obj, obj.id === state.selectedObjectId ? sel : line, obj.id === state.selectedObjectId ? 2 : 1.25);
    }

    for (const obj of state.objects) {
      if (obj.type === 'wall') drawWallCad(obj, obj.id === state.selectedObjectId ? sel : line);
    }
    for (const obj of state.objects) {
      if (obj.type === 'door' && cadLayerVisible(cadLayerForObject(obj))) drawOpeningCad(obj, 'door', obj.id === state.selectedObjectId ? sel : door);
      else if (obj.type === 'window' && cadLayerVisible(cadLayerForObject(obj))) drawOpeningCad(obj, 'window', obj.id === state.selectedObjectId ? sel : windowColor);
      else if (obj.type === 'dimension' && cadLayerVisible(cadLayerForObject(obj))) drawDimension(obj, obj.id === state.selectedObjectId ? sel : dim);
      else if (obj.type === 'line' && cadLayerVisible(obj.cadLayer || '0')) drawLineObject(obj, obj.id === state.selectedObjectId ? sel : line);
    }
  }

  function drawLineObject(obj, color, width = 1.4) {
    const a = toScreenCss(obj.a), b = toScreenCss(obj.b);
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    drawSelectionHandles(obj, [a,b]);
    ctx.restore();
  }

  function drawCadObject(obj, color, width = 1.2) {
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    if (obj.type === 'cadLine') {
      const a = toScreenCss(obj.a), b = toScreenCss(obj.b);
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      drawSelectionHandles(obj, [a,b]);
    } else if (obj.type === 'cadCircle') {
      const c = toScreenCss(obj.center);
      ctx.beginPath(); ctx.arc(c.x,c.y,Math.max(.5,obj.radius*state.camera.zoom),0,Math.PI*2); ctx.stroke();
      if (obj.id === state.selectedObjectId) drawSelectionHandles(obj, [c]);
    } else if (obj.type === 'cadText') {
      const p = toScreenCss(obj.point); ctx.font = '10px system-ui'; ctx.fillText(obj.text || '', p.x, p.y);
    }
    ctx.restore();
  }

  function drawWallPlan(obj, color) {
    const a = toScreenCss(obj.a), b = toScreenCss(obj.b);
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, obj.thickness * state.camera.zoom); ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    ctx.lineWidth = 1;
    drawSelectionHandles(obj, [a,b]);
    ctx.restore();
  }

  function wallOutlineWorld(obj) {
    const dx = obj.b.x - obj.a.x, dy = obj.b.y - obj.a.y;
    const len = Math.max(.000001, Math.hypot(dx,dy));
    const nx = -dy / len, ny = dx / len;
    const h = (obj.thickness || 150) / 2;
    return [
      [{ x: obj.a.x + nx*h, y: obj.a.y + ny*h }, { x: obj.b.x + nx*h, y: obj.b.y + ny*h }],
      [{ x: obj.a.x - nx*h, y: obj.a.y - ny*h }, { x: obj.b.x - nx*h, y: obj.b.y - ny*h }]
    ];
  }

  function drawWallCad(obj, color) {
    const mapping = state.cadMapping || defaultCadMapping();
    const layer = mapping.wallLayer || 'WALL';
    if (!cadLayerVisible(layer)) return;
    const mode = mapping.wallRepresentation || 'outline';
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = obj.id === state.selectedObjectId ? 2 : 1.2;
    if (mode === 'outline' || mode === 'both') {
      for (const [wa,wb] of wallOutlineWorld(obj)) {
        const a=toScreenCss(wa),b=toScreenCss(wb);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
    if (mode === 'centerline' || mode === 'both') {
      const a=toScreenCss(obj.a),b=toScreenCss(obj.b); if (mode === 'both') ctx.setLineDash([5,4]);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
    }
    if (obj.id === state.selectedObjectId) drawSelectionHandles(obj, [toScreenCss(obj.a),toScreenCss(obj.b)]);
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
    const g = openingGeometry(obj); if (!g) return;
    const a=toScreenCss(g.p1),b=toScreenCss(g.p2),c=toScreenCss(g.center);
    ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    if (kind === 'door') {
      const leafEnd = toScreenCss({x:g.p1.x+g.nx*g.width,y:g.p1.y+g.ny*g.width});
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(leafEnd.x,leafEnd.y);ctx.stroke();
      ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(a.x,a.y,g.width*state.camera.zoom,-Math.atan2(g.uy,g.ux),-Math.atan2(g.uy,g.ux)+Math.PI/2);ctx.stroke();ctx.globalAlpha=1;
    } else {
      const off = Math.max(2, Math.min(5, (g.wall.thickness||150)*state.camera.zoom*.25));
      const nx=-g.uy,ny=g.ux;
      ctx.beginPath();ctx.moveTo(a.x+nx*off,a.y-ny*off);ctx.lineTo(b.x+nx*off,b.y-ny*off);ctx.stroke();
      ctx.beginPath();ctx.moveTo(a.x-nx*off,a.y+ny*off);ctx.lineTo(b.x-nx*off,b.y+ny*off);ctx.stroke();
    }
    if (obj.id===state.selectedObjectId) {ctx.beginPath();ctx.arc(c.x,c.y,4,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }

  function drawOpeningCad(obj, kind, color) {
    const g = openingGeometry(obj); if(!g) return;
    const a=toScreenCss(g.p1),b=toScreenCss(g.p2);
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=obj.id===state.selectedObjectId?2:1.2;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    if(kind==='door'){
      const leafEnd=toScreenCss({x:g.p1.x+g.nx*g.width,y:g.p1.y+g.ny*g.width});ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(leafEnd.x,leafEnd.y);ctx.stroke();
    } else {
      const p1o=toScreenCss({x:g.p1.x+g.nx*50,y:g.p1.y+g.ny*50});const p2o=toScreenCss({x:g.p2.x+g.nx*50,y:g.p2.y+g.ny*50});
      const p1i=toScreenCss({x:g.p1.x-g.nx*50,y:g.p1.y-g.ny*50});const p2i=toScreenCss({x:g.p2.x-g.nx*50,y:g.p2.y-g.ny*50});
      ctx.beginPath();ctx.moveTo(p1o.x,p1o.y);ctx.lineTo(p2o.x,p2o.y);ctx.stroke();ctx.beginPath();ctx.moveTo(p1i.x,p1i.y);ctx.lineTo(p2i.x,p2i.y);ctx.stroke();
    }
    ctx.restore();
  }

  function drawDimension(obj, color) {
    const a=toScreenCss(obj.a),b=toScreenCss(obj.b);
    ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1;ctx.setLineDash([5,3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
    const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;ctx.font='11px system-ui';const text=`${formatNumber(distance(obj.a,obj.b),1)} mm`;const tw=ctx.measureText(text).width;
    ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();ctx.fillRect(mx-tw/2-4,my-9,tw+8,16);ctx.fillStyle=color;ctx.fillText(text,mx-tw/2,my+3);
    if(obj.id===state.selectedObjectId) drawSelectionHandles(obj,[a,b]);ctx.restore();
  }

  function drawSelectionHandles(obj, points) {
    if (obj.id !== state.selectedObjectId) return;
    const color = getComputedStyle(document.documentElement).getPropertyValue('--selection').trim();
    ctx.fillStyle = color;
    for (const p of points) { ctx.beginPath(); ctx.arc(p.x,p.y,3.5,0,Math.PI*2); ctx.fill(); }
  }

  function drawPreview() {
    let start=null,end=null,color='#7db7ff',width=1.5;
    if(state.activeTool==='line'||state.activeTool==='wall'){start=state.drawStart;end=state.previewEnd;if(state.activeTool==='wall')width=Math.max(2,currentWallThickness()*state.camera.zoom);}
    else if(state.activeTool==='measure'){start=state.measureStart;end=state.previewEnd;color='#f0c973';}
    if(!start||!end)return;
    const a=toScreenCss(start),b=toScreenCss(end);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=.85;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
    const text=`${formatNumber(distance(start,end),1)} mm · ${formatNumber(angleDeg(start,end),1)}°`;ctx.font='11px system-ui';ctx.fillStyle=color;ctx.fillText(text,b.x+8,b.y-8);ctx.restore();
  }

  function drawOpeningPreview() {
    const p=state.previewOpening;if(!p||!['door','window'].includes(state.activeTool))return;
    const styles=getComputedStyle(document.documentElement);const color=state.activeTool==='door'?styles.getPropertyValue('--door').trim():styles.getPropertyValue('--window').trim();
    const wall=p.wall;const width=currentOpeningWidth();const dx=wall.b.x-wall.a.x,dy=wall.b.y-wall.a.y,len=Math.max(.000001,Math.hypot(dx,dy));const ux=dx/len,uy=dy/len;const half=Math.min(width,len*.9)/2;
    const a=toScreenCss({x:p.point.x-ux*half,y:p.point.y-uy*half}),b=toScreenCss({x:p.point.x+ux*half,y:p.point.y+uy*half});ctx.save();ctx.strokeStyle=color;ctx.globalAlpha=.75;ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();
  }

  function drawCalibrationPreview(){const c=state.calibration;if(!c?.p1)return;const p2=c.p2||state.previewEnd;if(!p2)return;const a=toScreenCss(c.p1),b=toScreenCss(p2);ctx.save();ctx.strokeStyle='#ffb55a';ctx.fillStyle='#ffb55a';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);for(const p of[a,b]){ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();}ctx.restore();}

  function currentWallThickness(){const input=document.querySelector('[data-context="thickness"]');const n=Number(input?.value);if(Number.isFinite(n)&&n>0)state.toolSettings.wallThickness=n;return state.toolSettings.wallThickness;}
  function currentOpeningWidth(){const input=document.querySelector('[data-context="width"]');const n=Number(input?.value);const key=state.activeTool==='window'?'windowWidth':'doorWidth';if(Number.isFinite(n)&&n>0)state.toolSettings[key]=n;return state.toolSettings[key];}

  function updateContextBar(){
    const keys={select:'context.select',line:'context.line',wall:'context.wall',door:'context.door',window:'context.window',measure:'context.measure',delete:'context.delete'};
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
        const b=document.createElement('button');b.className=`tool-direct ${state.activeTool===item.id?'active':''}`;b.disabled=!item.ready;b.innerHTML=`<span class="tool-icon ui-icon icon-${item.icon}" aria-hidden="true"></span><span class="tool-text">${escapeHtml(t(item.labelKey))}</span>`;b.addEventListener('click',()=>{if(item.ready)setTool(item.id,'plan');});dom.toolRail.appendChild(b);
      }
    }else{
      for(const cat of cadCategories){const b=document.createElement('button');b.className=`tool-category ${state.activeCategory===cat.id?'active':''}`;b.dataset.category=cat.id;b.dataset.categoryKey=cat.labelKey;b.innerHTML=`<span class="tool-icon ui-icon icon-${cat.icon}" aria-hidden="true"></span><span class="tool-text">${escapeHtml(t(cat.labelKey))}</span>`;b.addEventListener('click',()=>openCategory(cat.id,b));dom.toolRail.appendChild(b);}
    }
  }

  function setTool(tool,category=null){
    if(state.toolset==='cad'&&['wall','door','window'].includes(tool)&&!state.cadMapping){state.pendingToolAfterMapping={tool,category:category||'architecture'};openMappingDialog('tool');return;}
    state.activeTool=tool;if(category&&category!=='plan')state.activeCategory=category;state.drawStart=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;state.calibration=null;host.dataset.tool=tool;dom.toolPopover.hidden=true;renderToolRail();updateContextBar();renderProperties();render();
  }

  function openCategory(category,button){state.activeCategory=category;renderToolRail();const items=cadToolCatalog[category]||[];dom.toolPopover.innerHTML=`<div class="tool-popover-title">${escapeHtml(t(button.dataset.categoryKey))}</div>`;for(const item of items){const b=document.createElement('button');b.className=`tool-item ${state.activeTool===item.id?'active':''}`;b.disabled=!item.ready;const note=item.ready?(item.note||''):t('tool.planned');b.innerHTML=`<span>${escapeHtml(t(item.labelKey))}</span><span class="tool-item-note">${escapeHtml(note)}</span>`;b.addEventListener('click',()=>setTool(item.id,category));dom.toolPopover.appendChild(b);}const top=Math.min(button.offsetTop,Math.max(8,host.clientHeight-220));dom.toolPopover.style.top=`${top}px`;dom.toolPopover.hidden=false;}

  function switchToolset(next,{skipMapping=false}={}){
    if(next===state.toolset){dom.startScreen.hidden=true;dom.appShell.removeAttribute('aria-hidden');return;}
    if(next==='cad'&&!skipMapping&&hasSemanticObjects()&&!state.cadMapping){openMappingDialog('switch-cad');return;}
    state.toolset=next;dom.appShell.classList.toggle('plan-tools',next==='plan');dom.appShell.classList.toggle('cad-tools',next==='cad');dom.planToolsBtn.classList.toggle('active',next==='plan');dom.cadToolsBtn.classList.toggle('active',next==='cad');dom.commandBar.hidden=next!=='cad';
    state.activeCategory='select';state.activeTool='select';state.drawStart=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;host.dataset.tool='select';dom.toolPopover.hidden=true;
    updateEmptyState();renderToolRail();renderPrimaryPanel();renderProperties();updateContextBar();render();setTimeout(resizeCanvas,0);dom.startScreen.hidden=true;dom.appShell.removeAttribute('aria-hidden');
  }

  function updateEmptyState(){const plan=state.toolset==='plan';dom.emptyKicker.textContent=plan?'Plan Tools':'CAD Tools';dom.emptyTitle.textContent=t(plan?'empty.planTitle':'empty.cadTitle');dom.emptyCopy.textContent=t(plan?'empty.planCopy':'empty.cadCopy');dom.emptyPrimaryBtn.textContent=t(plan?'empty.planPrimary':'empty.cadPrimary');dom.primaryInspectorTab.textContent=t(plan?'tab.objects':'tab.layers');dom.primaryPanelTitle.textContent=t(plan?'panel.planObjects':'panel.cadLayers');dom.primaryPanelSubtitle.textContent=t(plan?'panel.planObjectsSub':'panel.cadLayersSub');}

  function defaultCadMapping(){return{wallRepresentation:'outline',wallLayer:'WALL',doorLayer:'DOOR',windowLayer:'WINDOW',dimensionLayer:'DIM'};}
  function openMappingDialog(action){const m=state.cadMapping||defaultCadMapping();state.mappingPendingAction=action;dom.wallRepresentation.value=m.wallRepresentation;dom.wallLayerInput.value=m.wallLayer;dom.doorLayerInput.value=m.doorLayer;dom.windowLayerInput.value=m.windowLayer;dom.dimensionLayerInput.value=m.dimensionLayer;dom.mappingBackdrop.hidden=false;setTimeout(()=>dom.wallRepresentation.focus(),0);}
  function applyMapping(){state.cadMapping={wallRepresentation:dom.wallRepresentation.value,wallLayer:(dom.wallLayerInput.value||'WALL').trim(),doorLayer:(dom.doorLayerInput.value||'DOOR').trim(),windowLayer:(dom.windowLayerInput.value||'WINDOW').trim(),dimensionLayer:(dom.dimensionLayerInput.value||'DIM').trim()};for(const name of Object.values({w:state.cadMapping.wallLayer,d:state.cadMapping.doorLayer,wi:state.cadMapping.windowLayer,di:state.cadMapping.dimensionLayer}))if(!state.cadLayerVisibility.has(name))state.cadLayerVisibility.set(name,true);const action=state.mappingPendingAction;state.mappingPendingAction=null;dom.mappingBackdrop.hidden=true;renderPrimaryPanel();renderProperties();render();if(action==='switch-cad')switchToolset('cad',{skipMapping:true});else if(action==='export')exportDxfNow();else if(action==='tool'){const p=state.pendingToolAfterMapping;state.pendingToolAfterMapping=null;if(p)setTool(p.tool,p.category);}}
  function cancelMapping(){const action=state.mappingPendingAction;state.mappingPendingAction=null;state.pendingToolAfterMapping=null;dom.mappingBackdrop.hidden=true;if(action==='switch-cad'){dom.planToolsBtn.classList.add('active');dom.cadToolsBtn.classList.remove('active');}}

  function pushHistory(){state.history.push(JSON.stringify(state.objects));if(state.history.length>60)state.history.shift();state.future=[];updateUndoRedo();}
  function undo(){if(!state.history.length)return;state.future.push(JSON.stringify(state.objects));state.objects=JSON.parse(state.history.pop());state.selectedObjectId=null;updateAll();}
  function redo(){if(!state.future.length)return;state.history.push(JSON.stringify(state.objects));state.objects=JSON.parse(state.future.pop());state.selectedObjectId=null;updateAll();}
  function updateUndoRedo(){dom.undoBtn.disabled=!state.history.length;dom.redoBtn.disabled=!state.future.length;}

  function commitSegment(a,b,type){if(distance(a,b)<.001)return;pushHistory();let obj;if(type==='wall'){obj={id:uid('wall'),type:'wall',layerId:'walls',a:{...a},b:{...b},thickness:currentWallThickness()};}else{obj={id:uid('cadLine'),type:state.toolset==='cad'?'cadLine':'line',cadLayer:state.activeCadLayer||'0',layerId:'drawing',a:{...a},b:{...b}};if(obj.type==='cadLine'&&!state.cadLayerVisibility.has(obj.cadLayer))state.cadLayerVisibility.set(obj.cadLayer,true);}state.objects.push(obj);state.selectedObjectId=obj.id;state.drawStart={...b};state.previewEnd={...b};updateAll();}
  function commitMeasurement(a,b){if(distance(a,b)<.001)return;pushHistory();const obj={id:uid('dimension'),type:'dimension',layerId:'dimensions',a:{...a},b:{...b}};state.objects.push(obj);state.selectedObjectId=obj.id;state.measureStart=null;state.previewEnd=null;updateAll();}

  function nearestWallProjection(p){let best=null,bestD=Infinity;for(const wall of state.objects.filter(o=>o.type==='wall')){const pr=projectPointToSegment(p,wall.a,wall.b);const threshold=Math.max((wall.thickness||150)/2,18/state.camera.zoom);if(pr.distance<threshold&&pr.distance<bestD){bestD=pr.distance;best={wall,t:pr.t,point:pr.point,distance:pr.distance};}}return best;}
  function projectPointToSegment(p,a,b){const vx=b.x-a.x,vy=b.y-a.y,wx=p.x-a.x,wy=p.y-a.y,c2=vx*vx+vy*vy;if(!c2)return{t:0,point:{...a},distance:distance(p,a)};const tt=clamp((wx*vx+wy*vy)/c2,0,1);const q={x:a.x+tt*vx,y:a.y+tt*vy};return{t:tt,point:q,distance:distance(p,q)};}
  function commitOpening(kind,projection){if(!projection){alert(t('alert.noWallForOpening'));return;}pushHistory();const width=kind==='door'?state.toolSettings.doorWidth:state.toolSettings.windowWidth;const obj={id:uid(kind),type:kind,layerId:kind==='door'?'doors':'windows',wallId:projection.wall.id,t:projection.t,width};state.objects.push(obj);state.selectedObjectId=obj.id;updateAll();}

  function nearestSnap(p){if(!state.snap)return p;const threshold=10/state.camera.zoom;let best=null,bestD=threshold;const test=q=>{const d=distance(p,q);if(d<bestD){bestD=d;best=q;}};for(const o of state.objects){if(o.a)test(o.a);if(o.b)test(o.b);if(o.center)test(o.center);const g=(o.type==='door'||o.type==='window')?openingGeometry(o):null;if(g){test(g.p1);test(g.p2);}}
    for(const ref of state.references){if(!ref.visible||ref.type!=='dxf'||!ref.snapIndex)continue;const local=referenceWorldToLocal(ref,p);const{minx,miny,cellW,cellH,cells}=ref.snapIndex;const gx=Math.floor((local.x-minx)/cellW),gy=Math.floor((local.y-miny)/cellH);const lt=threshold/Math.max(.000001,ref.scale),rx=Math.max(1,Math.ceil(lt/cellW)),ry=Math.max(1,Math.ceil(lt/cellH));for(let dx=-rx;dx<=rx;dx++)for(let dy=-ry;dy<=ry;dy++){const bucket=cells.get(`${gx+dx},${gy+dy}`);if(!bucket)continue;for(const q of bucket){if(ref.visibleLayers&&!ref.visibleLayers.has(q.layer||'0'))continue;test(referenceLocalToWorld(ref,q));}}}
    return best?{...best}:p;}
  function constrainOrtho(start,p){if(!state.ortho||!start)return p;const dx=p.x-start.x,dy=p.y-start.y;return Math.abs(dx)>=Math.abs(dy)?{x:p.x,y:start.y}:{x:start.x,y:p.y};}

  function hitObject(p){const tolerance=8/state.camera.zoom;let best=null,bestD=Infinity;for(const o of state.objects){let d=Infinity;if(o.type==='door'||o.type==='window'){const g=openingGeometry(o);if(g)d=distance(p,g.center);}else if(o.type==='cadCircle')d=Math.abs(distance(p,o.center)-o.radius);else if(o.a&&o.b)d=pointSegmentDistance(p,o.a,o.b);if(o.type==='wall')d=Math.max(0,d-(o.thickness||150)/2);if(d<tolerance&&d<bestD){best=o;bestD=d;}}return best;}
  function pointSegmentDistance(p,a,b){return projectPointToSegment(p,a,b).distance;}

  function onPointerMove(e){const s=fromPointerEvent(e);let p=screenCssToWorld(s);state.cursorWorld=p;dom.statusX.textContent=`X ${formatNumber(p.x,1)}`;dom.statusY.textContent=`Y ${formatNumber(p.y,1)}`;
    if(state.pan){const dx=(s.x-state.pan.startScreen.x)/state.camera.zoom,dy=(s.y-state.pan.startScreen.y)/state.camera.zoom;state.camera.cx=state.pan.startCamera.cx-dx;state.camera.cy=state.pan.startCamera.cy+dy;render();return;}
    if(state.activeTool==='door'||state.activeTool==='window')state.previewOpening=nearestWallProjection(p);else state.previewOpening=null;
    const start=state.drawStart||state.measureStart||state.calibration?.p1;if(start)p=constrainOrtho(start,nearestSnap(p));else p=nearestSnap(p);state.previewEnd=p;render();}

  function onPointerDown(e){host.focus();const s=fromPointerEvent(e);const panGesture=e.button===1||(e.button===0&&state.spaceDown);if(panGesture){e.preventDefault();state.pan={startScreen:s,startCamera:{...state.camera}};host.dataset.pan='true';canvas.setPointerCapture?.(e.pointerId);return;}if(e.button!==0)return;let p=nearestSnap(screenCssToWorld(s));
    if(state.calibration){if(!state.calibration.p1){state.calibration.p1=p;state.previewEnd=p;updateContextBar();render();}else{state.calibration.p2=p;openCalibrationDialog();}return;}
    if(state.activeTool==='select'){const obj=hitObject(p);state.selectedObjectId=obj?.id||null;renderProperties();render();return;}
    if(state.activeTool==='delete'){const obj=hitObject(p);if(obj)deleteObjectById(obj.id);return;}
    if(state.activeTool==='line'||state.activeTool==='wall'){if(!state.drawStart){state.drawStart=p;state.previewEnd=p;updateContextBar();render();}else commitSegment(state.drawStart,constrainOrtho(state.drawStart,p),state.activeTool);return;}
    if(state.activeTool==='measure'){if(!state.measureStart){state.measureStart=p;state.previewEnd=p;updateContextBar();render();}else commitMeasurement(state.measureStart,constrainOrtho(state.measureStart,p));return;}
    if(state.activeTool==='door'||state.activeTool==='window'){commitOpening(state.activeTool,nearestWallProjection(p));return;}
  }
  function onPointerUp(e){if(!state.pan)return;state.pan=null;host.dataset.pan='false';try{canvas.releasePointerCapture?.(e.pointerId);}catch(_){}}
  function onWheel(e){e.preventDefault();const s=fromPointerEvent(e),before=screenCssToWorld(s),factor=Math.exp(-e.deltaY*.0014);state.camera.zoom=clamp(state.camera.zoom*factor,.002,8);const after=screenCssToWorld(s);state.camera.cx+=before.x-after.x;state.camera.cy+=before.y-after.y;render();}

  function deleteObjectById(id){const target=state.objects.find(o=>o.id===id);if(!target)return;pushHistory();const childIds=target.type==='wall'?new Set(state.objects.filter(o=>(o.type==='door'||o.type==='window')&&o.wallId===id).map(o=>o.id)):new Set();state.objects=state.objects.filter(o=>o.id!==id&&!childIds.has(o.id));state.selectedObjectId=null;updateAll();}

  function referenceBounds(ref){if(ref.type==='image'){const a=referenceLocalToWorld(ref,{x:0,y:0}),b=referenceLocalToWorld(ref,{x:ref.width,y:ref.height});return{minx:Math.min(a.x,b.x),miny:Math.min(a.y,b.y),maxx:Math.max(a.x,b.x),maxy:Math.max(a.y,b.y)};}const b=ref.bounds,a=referenceLocalToWorld(ref,{x:b.minx,y:b.miny}),c=referenceLocalToWorld(ref,{x:b.maxx,y:b.maxy});return{minx:Math.min(a.x,c.x),miny:Math.min(a.y,c.y),maxx:Math.max(a.x,c.x),maxy:Math.max(a.y,c.y)};}
  function allBounds(){let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;const add=p=>{if(!p)return;minx=Math.min(minx,p.x);miny=Math.min(miny,p.y);maxx=Math.max(maxx,p.x);maxy=Math.max(maxy,p.y);};for(const r of state.references){const b=referenceBounds(r);add({x:b.minx,y:b.miny});add({x:b.maxx,y:b.maxy});}for(const o of state.objects){if(o.a)add(o.a);if(o.b)add(o.b);if(o.center){add({x:o.center.x-o.radius,y:o.center.y-o.radius});add({x:o.center.x+o.radius,y:o.center.y+o.radius});}const g=(o.type==='door'||o.type==='window')?openingGeometry(o):null;if(g){add(g.p1);add(g.p2);}}return Number.isFinite(minx)?{minx,miny,maxx,maxy}:null;}
  function fitAll(){const b=allBounds();if(!b){state.camera={cx:0,cy:0,zoom:.12};render();return;}fitBounds(b);}
  function fitBounds(b){const{w,h}=cssCanvasSize(),bw=Math.max(100,b.maxx-b.minx),bh=Math.max(100,b.maxy-b.miny);state.camera.cx=(b.minx+b.maxx)/2;state.camera.cy=(b.miny+b.maxy)/2;state.camera.zoom=clamp(Math.min((w-90)/bw,(h-90)/bh),.002,8);render();}
  function fitReference(ref){fitBounds(referenceBounds(ref));}

  async function openReferenceFile(file){if(!file)return;const lower=file.name.toLowerCase();try{if(lower.endsWith('.dxf'))await addDxfReference(file);else if(file.type.startsWith('image/'))await addImageReference(file);else alert(t('alert.unsupportedReference'));}finally{dom.referenceFileInput.value='';}}
  async function addDxfReference(file){showProgress(t('progress.readingDxf'),0,file.name);const text=await file.text();const parsed=await window.PieniPlanDXF.parseAndAnalyze(text,p=>showProgress(p.stage||t('progress.readingDxf'),p.ratio||0,p.detail||''));const factor=unitFactorToMm(parsed.unit),entities=parsed.entities.map(e=>normalizeEntityToMm(e,factor)),b=boundsEntities(entities);const ref={id:uid('ref'),type:'dxf',name:file.name,visible:true,opacity:.48,scale:1,origin:{x:0,y:0},entities,bounds:b,sourceUnit:parsed.unit?.label||'unspecified',sourceUnitSpecified:parsed.unit?.metersPerUnit!=null,layers:parsed.layers||[],visibleLayers:new Set(parsed.layers||[]),pathsByLayer:buildDxfPaths(entities),textEntities:entities.filter(e=>e.type==='text'),snapIndex:buildSnapIndex(entities,b)};state.references.push(ref);state.selectedReferenceId=ref.id;hideProgress();updateAll();switchInspector('reference');fitAll();}
  async function addImageReference(file){const dataUrl=await readDataUrl(file),image=await loadImage(dataUrl);const ref={id:uid('ref'),type:'image',name:file.name,visible:true,opacity:.55,scale:1,origin:{x:0,y:0},image,width:image.naturalWidth,height:image.naturalHeight,sourceUnit:'px'};state.references.push(ref);state.selectedReferenceId=ref.id;updateAll();switchInspector('reference');fitAll();}

  async function openEditableDxf(file){if(!file)return;try{if((state.objects.length||state.references.length)&&!confirm(t('confirm.newDrawing')))return;state.objects=[];state.references=[];state.selectedObjectId=null;state.selectedReferenceId=null;state.history=[];state.future=[];state.nextId=1;state.cadMapping=null;state.cadLayerVisibility=new Map([['0',true]]);state.activeCadLayer='0';showProgress(t('progress.importingDxf'),0,file.name);const text=await file.text();const parsed=await window.PieniPlanDXF.parseAndAnalyze(text,p=>showProgress(p.stage||t('progress.importingDxf'),p.ratio||0,p.detail||''));const factor=unitFactorToMm(parsed.unit);const entities=parsed.entities.map(e=>normalizeEntityToMm(e,factor));const editable=[];for(const e of entities){const layer=e.layer||'0';state.cadLayerVisibility.set(layer,true);if(e.type==='line')editable.push({id:uid('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.x1,y:e.y1},b:{x:e.x2,y:e.y2},source:'DXF'});else if(e.type==='polyline'&&e.points?.length>1){for(let i=1;i<e.points.length;i++)editable.push({id:uid('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.points[i-1][0],y:e.points[i-1][1]},b:{x:e.points[i][0],y:e.points[i][1]},source:'DXF'});if(e.closed)editable.push({id:uid('cadLine'),type:'cadLine',cadLayer:layer,a:{x:e.points.at(-1)[0],y:e.points.at(-1)[1]},b:{x:e.points[0][0],y:e.points[0][1]},source:'DXF'});}else if(e.type==='circle')editable.push({id:uid('cadCircle'),type:'cadCircle',cadLayer:layer,center:{x:e.cx,y:e.cy},radius:e.r,source:'DXF'});else if(e.type==='text')editable.push({id:uid('cadText'),type:'cadText',cadLayer:layer,point:{x:e.x,y:e.y},text:e.text||'',source:'DXF'});}
      if(!editable.some(o=>o.type==='cadLine'||o.type==='cadCircle'))alert(t('alert.dxfNoEditableEntities'));state.objects=editable;state.references=[];state.selectedObjectId=null;state.selectedReferenceId=null;state.history=[];state.future=[];state.sourceDxfName=file.name;state.activeCadLayer=(parsed.layers||[])[0]||'0';hideProgress();switchToolset('cad',{skipMapping:true});updateAll();fitAll();}catch(err){hideProgress();console.error(err);alert(err.message||String(err));}finally{dom.dxfEditFileInput.value='';}}

  function normalizeEntityToMm(e,factor){const out={...e};if(e.type==='line'){out.x1=e.x1*factor;out.y1=e.y1*factor;out.x2=e.x2*factor;out.y2=e.y2*factor;}else if(e.type==='polyline')out.points=(e.points||[]).map(p=>[p[0]*factor,p[1]*factor]);else if(e.type==='circle'){out.cx=e.cx*factor;out.cy=e.cy*factor;out.r=e.r*factor;}else if(e.type==='text'){out.x=e.x*factor;out.y=e.y*factor;}return out;}
  function buildDxfPaths(entities){const paths=new Map(),get=layer=>{const key=layer||'0';if(!paths.has(key))paths.set(key,new Path2D());return paths.get(key);};for(const e of entities){const path=get(e.layer);if(e.type==='line'){path.moveTo(e.x1,e.y1);path.lineTo(e.x2,e.y2);}else if(e.type==='polyline'&&e.points?.length){path.moveTo(e.points[0][0],e.points[0][1]);for(let i=1;i<e.points.length;i++)path.lineTo(e.points[i][0],e.points[i][1]);if(e.closed)path.closePath();}else if(e.type==='circle'&&e.r>0){path.moveTo(e.cx+e.r,e.cy);path.arc(e.cx,e.cy,e.r,0,Math.PI*2);}}return paths;}
  function buildSnapIndex(entities,bounds){const cols=64,rows=64,cellW=Math.max(1e-6,(bounds.maxx-bounds.minx)/cols),cellH=Math.max(1e-6,(bounds.maxy-bounds.miny)/rows),cells=new Map();const add=(x,y,layer='0')=>{if(!Number.isFinite(x)||!Number.isFinite(y))return;const gx=clamp(Math.floor((x-bounds.minx)/cellW),0,cols-1),gy=clamp(Math.floor((y-bounds.miny)/cellH),0,rows-1),key=`${gx},${gy}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push({x,y,layer});};for(const e of entities){if(e.type==='line'){add(e.x1,e.y1,e.layer);add(e.x2,e.y2,e.layer);}else if(e.type==='polyline')for(const p of e.points||[])add(p[0],p[1],e.layer);else if(e.type==='circle'){add(e.cx-e.r,e.cy,e.layer);add(e.cx+e.r,e.cy,e.layer);add(e.cx,e.cy-e.r,e.layer);add(e.cx,e.cy+e.r,e.layer);}}return{minx:bounds.minx,miny:bounds.miny,cellW,cellH,cells};}
  function boundsEntities(entities){let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;const add=(x,y)=>{if(Number.isFinite(x)&&Number.isFinite(y)){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);}};for(const e of entities){if(e.type==='line'){add(e.x1,e.y1);add(e.x2,e.y2);}else if(e.type==='polyline')for(const p of e.points||[])add(p[0],p[1]);else if(e.type==='circle'){add(e.cx-e.r,e.cy-e.r);add(e.cx+e.r,e.cy+e.r);}else if(e.type==='text')add(e.x,e.y);}return Number.isFinite(minx)?{minx,miny,maxx,maxy}:{minx:0,miny:0,maxx:1000,maxy:1000};}
  function readDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});}
  function loadImage(src){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=rej;img.src=src;});}
  function showProgress(title,ratio,detail){dom.progressToast.hidden=false;dom.progressTitle.textContent=title;dom.progressBar.style.width=`${clamp(ratio,0,1)*100}%`;dom.progressDetail.textContent=detail;}
  function hideProgress(){dom.progressToast.hidden=true;}

  function beginCalibration(refId){const ref=state.references.find(r=>r.id===refId);if(!ref)return;state.selectedReferenceId=refId;state.calibration={refId,p1:null,p2:null};state.drawStart=null;state.measureStart=null;state.previewEnd=null;updateContextBar();render();}
  function openCalibrationDialog(){const c=state.calibration;if(!c?.p1||!c?.p2)return;const measured=distance(c.p1,c.p2);dom.dialogTitle.textContent=t('dialog.calibrate');dom.dialogCopy.textContent=t('dialog.calibrationCopy',{distance:formatNumber(measured,2)});dom.dialogInput.value=String(Math.round(measured*100)/100);dom.dialogBackdrop.hidden=false;setTimeout(()=>{dom.dialogInput.focus();dom.dialogInput.select();},0);}
  function applyCalibration(){const actual=Number(dom.dialogInput.value),c=state.calibration;if(!c||!Number.isFinite(actual)||actual<=0)return;const ref=state.references.find(r=>r.id===c.refId);if(!ref)return;const current=distance(c.p1,c.p2);if(current<=0)return;const localAnchor=referenceWorldToLocal(ref,c.p1),newScale=ref.scale*(actual/current);ref.scale=newScale;ref.origin={x:c.p1.x-localAnchor.x*newScale,y:c.p1.y-localAnchor.y*newScale};state.calibration=null;dom.dialogBackdrop.hidden=true;state.previewEnd=null;updateAll();}

  function renderPrimaryPanel(){if(state.toolset==='plan')renderPlanObjectsPanel();else renderCadLayersPanel();}
  function renderPlanObjectsPanel(){dom.primaryList.innerHTML='';const groups=[['wall','group.walls','wall'],['door','group.doors','door'],['window','group.windows','window'],['dimension','group.dimensions','dimension']];let any=false;for(const[type,key,icon]of groups){const count=state.objects.filter(o=>o.type===type).length;if(!count)continue;any=true;dom.primaryList.appendChild(summaryRow(icon,t(key),t('panel.objects',{count})));}const cadCount=state.objects.filter(isCadObject).length;if(cadCount){any=true;dom.primaryList.appendChild(summaryRow('vector',t('group.cadGeometry'),t('panel.hiddenCad',{count:cadCount})));}if(!any)dom.primaryList.innerHTML=`<div class="section-copy">${escapeHtml(t('panel.noPlanObjects'))}</div>`;}
  function summaryRow(icon,title,meta){const row=document.createElement('div');row.className='list-row';row.innerHTML=`<div class="object-swatch"><span class="ui-icon icon-${icon}" aria-hidden="true"></span></div><div class="row-main"><div class="row-title">${escapeHtml(title)}</div><div class="row-meta">${escapeHtml(meta)}</div></div><span></span>`;return row;}
  function renderCadLayersPanel(){dom.primaryList.innerHTML='';const counts=new Map();for(const o of state.objects){let layer=null;if(isCadObject(o)||o.type==='line')layer=o.cadLayer||'0';else if(isSemanticObject(o))layer=cadLayerForObject(o);if(layer)counts.set(layer,(counts.get(layer)||0)+1);}if(!counts.size){dom.primaryList.innerHTML=`<div class="section-copy">${escapeHtml(t('panel.noCadLayers'))}</div>`;return;}for(const[layer,count]of[...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){if(!state.cadLayerVisibility.has(layer))state.cadLayerVisibility.set(layer,true);const visible=cadLayerVisible(layer),row=document.createElement('div');row.className='list-row';const eye=document.createElement('button');eye.className='eye-button';configureVisibilityButton(eye,visible,'layer');eye.addEventListener('click',()=>{state.cadLayerVisibility.set(layer,!visible);renderCadLayersPanel();render();});const main=document.createElement('div');main.className='row-main';main.innerHTML=`<div class="row-title">${escapeHtml(layer)}</div><div class="row-meta">${escapeHtml(t('panel.entities',{count}))}</div>`;const active=document.createElement('span');active.className='row-meta';active.textContent=state.activeCadLayer===layer?t('panel.active'):'';row.addEventListener('click',e=>{if(e.target.closest('button'))return;state.activeCadLayer=layer;renderCadLayersPanel();});row.append(eye,main,active);dom.primaryList.appendChild(row);}}

  function cadLayerForObject(obj){const m=state.cadMapping||defaultCadMapping();if(obj.type==='wall')return m.wallLayer;if(obj.type==='door')return m.doorLayer;if(obj.type==='window')return m.windowLayer;if(obj.type==='dimension')return m.dimensionLayer;return obj.cadLayer||'0';}

  function renderReferences(){dom.referenceList.innerHTML='';if(!state.references.length){dom.referenceList.innerHTML=`<div class="section-copy">${escapeHtml(t('panel.noReferences'))}</div>`;return;}for(const r of state.references){const row=document.createElement('div');row.className=`list-row ${state.selectedReferenceId===r.id?'selected':''}`;const eye=document.createElement('button');eye.className='eye-button';configureVisibilityButton(eye,r.visible,'reference');eye.addEventListener('click',e=>{e.stopPropagation();r.visible=!r.visible;renderReferences();render();});const main=document.createElement('div');main.className='row-main';const meta=r.type==='dxf'?`${t('panel.entities',{count:r.entities.length.toLocaleString()})} · ${r.sourceUnitSpecified?r.sourceUnit:t('panel.unitUnspecified')}`:`${r.width}×${r.height}px`;main.innerHTML=`<div class="row-title">${escapeHtml(r.name)}</div><div class="row-meta">${escapeHtml(meta)}</div>`;const actions=document.createElement('div');actions.className='row-actions';const calibrate=document.createElement('button');calibrate.className='mini-action';calibrate.textContent=t('action.scale');calibrate.dataset.tooltipTitle=t('action.scale');calibrate.dataset.tooltipKey='tooltip.scaleReference';calibrate.addEventListener('click',e=>{e.stopPropagation();beginCalibration(r.id);});const fit=document.createElement('button');fit.className='mini-action';fit.textContent=t('action.fit');fit.addEventListener('click',e=>{e.stopPropagation();fitReference(r);});actions.append(calibrate,fit);row.addEventListener('click',()=>{state.selectedReferenceId=r.id;state.selectedObjectId=null;renderReferences();renderProperties();});row.append(eye,main,actions);dom.referenceList.appendChild(row);const control=document.createElement('div');control.className='panel-section';control.innerHTML=`<div class="property-row"><div class="property-label">${escapeHtml(t('panel.opacity'))}</div><div class="property-value"><input type="range" min="0.05" max="1" step="0.05" value="${r.opacity}"></div></div>`;control.querySelector('input').addEventListener('input',e=>{r.opacity=Number(e.target.value);render();});dom.referenceList.appendChild(control);if(r.type==='dxf')renderReferenceLayerControls(r);}}
  function renderReferenceLayerControls(ref){const section=document.createElement('div');section.className='panel-section';const heading=document.createElement('div');heading.className='section-heading';heading.textContent=t('panel.dxfLayers',{count:ref.layers.length});section.appendChild(heading);const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px;margin:8px 0;';const all=document.createElement('button');all.className='mini-action';all.textContent=t('action.all');const none=document.createElement('button');none.className='mini-action';none.textContent=t('action.none');all.addEventListener('click',()=>{ref.visibleLayers=new Set(ref.layers);renderReferences();render();});none.addEventListener('click',()=>{ref.visibleLayers=new Set();renderReferences();render();});actions.append(all,none);section.appendChild(actions);const list=document.createElement('div');list.style.cssText='display:grid;gap:5px;max-height:220px;overflow:auto;';for(const layer of ref.layers){const label=document.createElement('label');label.style.cssText='display:grid;grid-template-columns:auto minmax(0,1fr);gap:7px;align-items:center;font-size:9.5px;color:var(--text-2);';const cb=document.createElement('input');cb.type='checkbox';cb.checked=ref.visibleLayers.has(layer);cb.addEventListener('change',()=>{cb.checked?ref.visibleLayers.add(layer):ref.visibleLayers.delete(layer);render();});const text=document.createElement('span');text.textContent=layer;text.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';label.append(cb,text);list.appendChild(label);}section.appendChild(list);dom.referenceList.appendChild(section);}
  function iconMarkup(name){return`<span class="ui-icon icon-${name}" aria-hidden="true"></span>`;}
  function configureVisibilityButton(button,visible,kind){const showKey=kind==='reference'?'tooltip.showReference':'tooltip.showLayer',hideKey=kind==='reference'?'tooltip.hideReference':'tooltip.hideLayer';button.innerHTML=iconMarkup(visible?'eye':'eye-slash');button.setAttribute('aria-label',t(visible?hideKey:showKey));button.dataset.tooltipTitleKey=visible?hideKey:showKey;delete button.dataset.tooltipKey;delete button.dataset.shortcut;}

  function localizedObjectType(type){const key=type==='cadLine'?'value.cadLine':`value.${type}`;return t(key);}
  function localizedToolName(tool){const keys={select:'tool.select',line:'tool.line',wall:'tool.wall',door:'tool.door',window:'tool.window',measure:'tool.measure',delete:'tool.delete'};return t(keys[tool]||`tool.${tool}`);}
  function renderProperties(){dom.propertiesPanel.innerHTML='';const obj=state.objects.find(o=>o.id===state.selectedObjectId);if(obj){propertyText(t('property.type'),localizedObjectType(obj.type));if(state.toolset==='cad')propertyText(t('property.layer'),cadLayerForObject(obj));if(obj.a&&obj.b){propertyText(t('property.length'),`${formatNumber(distance(obj.a,obj.b),2)} mm`);propertyText(t('property.angle'),`${formatNumber(angleDeg(obj.a,obj.b),2)}°`);propertyText(t('property.start'),`${formatNumber(obj.a.x,1)}, ${formatNumber(obj.a.y,1)}`);propertyText(t('property.end'),`${formatNumber(obj.b.x,1)}, ${formatNumber(obj.b.y,1)}`);}if(obj.type==='wall')propertyNumber(t('property.thickness'),obj.thickness,v=>{if(v>0){pushHistory();obj.thickness=v;updateAll();}});if(obj.type==='door'||obj.type==='window')propertyNumber(t('property.width'),obj.width,v=>{if(v>0){pushHistory();obj.width=v;updateAll();}});if(obj.type==='cadCircle')propertyText(t('property.length'),`R ${formatNumber(obj.radius,2)} mm`);if(obj.source)propertyText(t('property.source'),obj.source);return;}
    const ref=state.references.find(r=>r.id===state.selectedReferenceId);if(ref){propertyText(t('property.reference'),ref.name);propertyText(t('property.type'),ref.type==='dxf'?'DXF':t('value.image'));propertyText(t('property.scale'),`${formatNumber(ref.scale,6)}×`);propertyText(t('property.origin'),`${formatNumber(ref.origin.x,1)}, ${formatNumber(ref.origin.y,1)}`);propertyText(t('property.opacity'),`${Math.round(ref.opacity*100)}%`);return;}
    propertyText(t('property.version'),`v${VERSION} · Build ${BUILD}`);propertyText(t('property.toolset'),t(state.toolset==='plan'?'value.planTools':'value.cadTools'));propertyText(t('property.units'),INTERNAL_UNIT);propertyText(t('property.tool'),localizedToolName(state.activeTool));if(state.cadMapping)propertyText(t('property.mapping'),mappingSummary());}
  function mappingSummary(){const m=state.cadMapping;if(!m)return'—';return t('mapping.summary',{wallMode:t(`mapping.${m.wallRepresentation}`),wallLayer:m.wallLayer,doorLayer:m.doorLayer,windowLayer:m.windowLayer});}
  function propertyText(label,value){const row=document.createElement('div');row.className='property-row';row.innerHTML=`<div class="property-label">${escapeHtml(label)}</div><div class="property-value">${escapeHtml(String(value))}</div>`;dom.propertiesPanel.appendChild(row);}
  function propertyNumber(label,value,onChange){const row=document.createElement('div');row.className='property-row';const l=document.createElement('div');l.className='property-label';l.textContent=label;const v=document.createElement('div');v.className='property-value';const input=document.createElement('input');input.type='number';input.value=String(value);input.addEventListener('change',()=>onChange(Number(input.value)));v.appendChild(input);row.append(l,v);dom.propertiesPanel.appendChild(row);}

  function switchInspector(tab){document.querySelectorAll('.inspector-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.inspector-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===tab));}
  function updateAll(){updateUndoRedo();updateEmptyState();updateContextBar();renderToolRail();renderPrimaryPanel();renderReferences();renderProperties();render();}

  function resetProject(){if((state.references.length||state.objects.length)&&!confirm(t('confirm.newDrawing')))return;state.references=[];state.objects=[];state.selectedReferenceId=null;state.selectedObjectId=null;state.history=[];state.future=[];state.nextId=1;state.camera={cx:0,cy:0,zoom:.12};state.cadMapping=null;state.cadLayerVisibility=new Map([['0',true]]);state.activeCadLayer='0';state.sourceDxfName=null;setTool('select',state.toolset==='plan'?'plan':'select');updateAll();}

  function createSample(){state.references=[];state.objects=[];state.history=[];state.future=[];state.nextId=1;const wall=(a,b,th=150)=>{const o={id:uid('wall'),type:'wall',layerId:'walls',a,b,thickness:th};state.objects.push(o);return o;};const outer=[wall({x:0,y:0},{x:8000,y:0},180),wall({x:8000,y:0},{x:8000,y:6000},180),wall({x:8000,y:6000},{x:0,y:6000},180),wall({x:0,y:6000},{x:0,y:0},180)];const innerV=wall({x:4200,y:0},{x:4200,y:6000},150),innerH=wall({x:0,y:3100},{x:4200,y:3100},150);state.objects.push({id:uid('door'),type:'door',layerId:'doors',wallId:innerV.id,t:.48,width:900},{id:uid('window'),type:'window',layerId:'windows',wallId:outer[2].id,t:.7,width:1600},{id:uid('window'),type:'window',layerId:'windows',wallId:outer[0].id,t:.25,width:1200},{id:uid('dimension'),type:'dimension',layerId:'dimensions',a:{x:0,y:-650},b:{x:8000,y:-650}},{id:uid('cadLine'),type:'cadLine',cadLayer:'AXIS',a:{x:4200,y:-900},b:{x:4200,y:6900},source:'sample DXF'});state.cadLayerVisibility=new Map([['0',true],['AXIS',true]]);state.cadMapping=null;state.selectedObjectId=null;state.selectedReferenceId=null;switchToolset('plan',{skipMapping:true});updateAll();fitAll();}

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
  function dxfText(layer,p,text,height=180){return dxfPair(0,'TEXT')+dxfPair(8,sanitizeLayer(layer))+dxfPair(10,p.x.toFixed(4))+dxfPair(20,p.y.toFixed(4))+dxfPair(30,'0')+dxfPair(40,height.toFixed(2))+dxfPair(1,String(text).replace(/[\r\n]/g,' '));}
  function exportDxf(){if(hasSemanticObjects()&&!state.cadMapping){openMappingDialog('export');return;}exportDxfNow();}
  function exportDxfNow(){const m=state.cadMapping||defaultCadMapping();let entities='';const layers=new Set(['0']);for(const o of state.objects){if(o.type==='cadLine'||o.type==='line'){const layer=o.cadLayer||'0';layers.add(layer);entities+=dxfLine(layer,o.a,o.b);}else if(o.type==='cadCircle'){const layer=o.cadLayer||'0';layers.add(layer);entities+=dxfCircle(layer,o.center,o.radius);}else if(o.type==='cadText'){const layer=o.cadLayer||'0';layers.add(layer);entities+=dxfText(layer,o.point,o.text||'');}else if(o.type==='wall'){layers.add(m.wallLayer);if(m.wallRepresentation==='outline'||m.wallRepresentation==='both')for(const[a,b]of wallOutlineWorld(o))entities+=dxfLine(m.wallLayer,a,b);if(m.wallRepresentation==='centerline'||m.wallRepresentation==='both')entities+=dxfLine(m.wallLayer,o.a,o.b);}else if(o.type==='door'){const g=openingGeometry(o);if(g){layers.add(m.doorLayer);entities+=dxfLine(m.doorLayer,g.p1,g.p2);entities+=dxfLine(m.doorLayer,g.p1,{x:g.p1.x+g.nx*g.width,y:g.p1.y+g.ny*g.width});}}else if(o.type==='window'){const g=openingGeometry(o);if(g){layers.add(m.windowLayer);const off=50;entities+=dxfLine(m.windowLayer,{x:g.p1.x+g.nx*off,y:g.p1.y+g.ny*off},{x:g.p2.x+g.nx*off,y:g.p2.y+g.ny*off});entities+=dxfLine(m.windowLayer,{x:g.p1.x-g.nx*off,y:g.p1.y-g.ny*off},{x:g.p2.x-g.nx*off,y:g.p2.y-g.ny*off});}}else if(o.type==='dimension'){layers.add(m.dimensionLayer);entities+=dxfLine(m.dimensionLayer,o.a,o.b);entities+=dxfText(m.dimensionLayer,{x:(o.a.x+o.b.x)/2,y:(o.a.y+o.b.y)/2},`${formatNumber(distance(o.a,o.b),1)} mm`,140);}}
    let layerTable=dxfPair(0,'TABLE')+dxfPair(2,'LAYER')+dxfPair(70,layers.size);for(const name of layers){layerTable+=dxfPair(0,'LAYER')+dxfPair(2,sanitizeLayer(name))+dxfPair(70,0)+dxfPair(62,7)+dxfPair(6,'CONTINUOUS');}layerTable+=dxfPair(0,'ENDTAB');
    const dxf=dxfPair(0,'SECTION')+dxfPair(2,'HEADER')+dxfPair(9,'$ACADVER')+dxfPair(1,'AC1009')+dxfPair(9,'$INSUNITS')+dxfPair(70,4)+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'TABLES')+layerTable+dxfPair(0,'ENDSEC')+dxfPair(0,'SECTION')+dxfPair(2,'ENTITIES')+entities+dxfPair(0,'ENDSEC')+dxfPair(0,'EOF');
    const blob=new Blob([dxf],{type:'application/dxf;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`PieniPlan_v${VERSION}_Build${BUILD}.dxf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

  let tooltipTimer=null,tooltipOwner=null;
  function tooltipTargetFrom(node){return node instanceof Element?node.closest('[data-tooltip-key],[data-tooltip-title-key],[data-tooltip-title]'):null;}
  function hideTooltip(){clearTimeout(tooltipTimer);tooltipTimer=null;tooltipOwner=null;dom.uiTooltip.hidden=true;dom.uiTooltip.innerHTML='';}
  function showTooltip(owner){if(!owner?.isConnected)return;const title=owner.dataset.tooltipTitleKey?t(owner.dataset.tooltipTitleKey):(owner.dataset.tooltipTitle||''),copy=owner.dataset.tooltipKey?t(owner.dataset.tooltipKey):'',shortcut=owner.dataset.shortcut||'';if(!title&&!copy&&!shortcut)return;const parts=[];if(title)parts.push(`<div class="tooltip-title">${escapeHtml(title)}</div>`);if(copy)parts.push(`<div class="tooltip-copy">${escapeHtml(copy)}</div>`);if(shortcut)parts.push(`<div class="tooltip-shortcut">${escapeHtml(t('tooltip.shortcut'))} · ${escapeHtml(shortcut)}</div>`);dom.uiTooltip.innerHTML=parts.join('');dom.uiTooltip.hidden=false;const rect=owner.getBoundingClientRect(),tip=dom.uiTooltip.getBoundingClientRect(),margin=8;let left=rect.left+rect.width/2-tip.width/2;left=Math.max(margin,Math.min(window.innerWidth-tip.width-margin,left));let top=rect.top-tip.height-margin;if(top<margin)top=rect.bottom+margin;top=Math.max(margin,Math.min(window.innerHeight-tip.height-margin,top));dom.uiTooltip.style.left=`${Math.round(left)}px`;dom.uiTooltip.style.top=`${Math.round(top)}px`;}
  function scheduleTooltip(owner,delay){clearTimeout(tooltipTimer);tooltipOwner=owner;tooltipTimer=setTimeout(()=>{if(tooltipOwner===owner)showTooltip(owner);},delay);}
  function installTooltips(){document.addEventListener('pointerover',e=>{const owner=tooltipTargetFrom(e.target);if(!owner||owner.contains(e.relatedTarget))return;scheduleTooltip(owner,650);});document.addEventListener('pointerout',e=>{const owner=tooltipTargetFrom(e.target);if(!owner||owner.contains(e.relatedTarget))return;hideTooltip();});document.addEventListener('focusin',e=>{const owner=tooltipTargetFrom(e.target);if(owner)scheduleTooltip(owner,450);});document.addEventListener('focusout',e=>{const owner=tooltipTargetFrom(e.target);if(owner)hideTooltip();});document.addEventListener('pointerdown',hideTooltip,true);}

  function isTyping(){const a=document.activeElement;return a&&(['INPUT','TEXTAREA','SELECT'].includes(a.tagName)||a.isContentEditable);}
  function cancelTransient(){state.drawStart=null;state.measureStart=null;state.previewEnd=null;state.previewOpening=null;state.calibration=null;state.commandPending=null;dom.toolPopover.hidden=true;dom.dialogBackdrop.hidden=true;setCommandStatus(t('command.cancelled'));updateContextBar();render();}

  dom.startPlanBtn.addEventListener('click',()=>switchToolset('plan',{skipMapping:true}));
  dom.startCadBtn.addEventListener('click',()=>switchToolset('cad',{skipMapping:true}));
  dom.startSampleBtn.addEventListener('click',createSample);
  dom.planToolsBtn.addEventListener('click',()=>switchToolset('plan'));
  dom.cadToolsBtn.addEventListener('click',()=>switchToolset('cad'));
  document.querySelectorAll('.inspector-tab').forEach(b=>b.addEventListener('click',()=>switchInspector(b.dataset.tab)));

  dom.openRefBtn.addEventListener('click',()=>dom.referenceFileInput.click());dom.emptyOpenBtn.addEventListener('click',()=>dom.referenceFileInput.click());dom.addReferenceBtn.addEventListener('click',()=>dom.referenceFileInput.click());
  dom.referenceFileInput.addEventListener('change',()=>openReferenceFile(dom.referenceFileInput.files?.[0]));
  dom.openDxfBtn.addEventListener('click',()=>dom.dxfEditFileInput.click());dom.dxfEditFileInput.addEventListener('change',()=>openEditableDxf(dom.dxfEditFileInput.files?.[0]));
  dom.fitBtn.addEventListener('click',fitAll);dom.newBtn.addEventListener('click',resetProject);dom.undoBtn.addEventListener('click',undo);dom.redoBtn.addEventListener('click',redo);dom.exportDxfBtn.addEventListener('click',exportDxf);
  dom.emptyPrimaryBtn.addEventListener('click',()=>setTool(state.toolset==='plan'?'wall':'line',state.toolset==='plan'?'plan':'draw'));
  dom.mappingSettingsBtn.addEventListener('click',()=>openMappingDialog('settings'));dom.mappingApplyBtn.addEventListener('click',applyMapping);dom.mappingCancelBtn.addEventListener('click',cancelMapping);
  dom.gridToggle.addEventListener('click',()=>{state.grid=!state.grid;dom.gridToggle.classList.toggle('active',state.grid);render();});dom.snapToggle.addEventListener('click',()=>{state.snap=!state.snap;dom.snapToggle.classList.toggle('active',state.snap);});dom.orthoToggle.addEventListener('click',()=>{state.ortho=!state.ortho;dom.orthoToggle.classList.toggle('active',state.ortho);render();});
  dom.dialogCancelBtn.addEventListener('click',()=>{dom.dialogBackdrop.hidden=true;state.calibration=null;state.previewEnd=null;updateAll();});dom.dialogApplyBtn.addEventListener('click',applyCalibration);dom.dialogInput.addEventListener('keydown',e=>{if(e.key==='Enter')applyCalibration();if(e.key==='Escape')dom.dialogCancelBtn.click();});
  dom.commandInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const raw=dom.commandInput.value;dom.commandInput.value='';runCommand(raw);}else if(e.key==='Escape'){e.preventDefault();dom.commandInput.value='';cancelTransient();host.focus();}});

  canvas.addEventListener('pointermove',onPointerMove);canvas.addEventListener('pointerdown',onPointerDown);canvas.addEventListener('pointerup',onPointerUp);canvas.addEventListener('pointercancel',onPointerUp);canvas.addEventListener('wheel',onWheel,{passive:false});canvas.addEventListener('contextmenu',e=>e.preventDefault());
  host.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});host.addEventListener('drop',e=>{e.preventDefault();const file=e.dataTransfer.files?.[0];if(file)openReferenceFile(file);});
  window.addEventListener('resize',resizeCanvas);
  window.addEventListener('keydown',e=>{
    if(e.code==='Space'&&!isTyping()){state.spaceDown=true;e.preventDefault();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!isTyping()){e.preventDefault();e.shiftKey?redo():undo();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'&&!isTyping()){e.preventDefault();redo();}
    if(e.key==='Escape'){hideTooltip();cancelTransient();}
    if((e.key==='Delete'||e.key==='Backspace')&&!isTyping()&&state.selectedObjectId){e.preventDefault();deleteObjectById(state.selectedObjectId);}
    if(state.toolset==='cad'&&!isTyping()&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&/^[a-zA-Z]$/.test(e.key)){e.preventDefault();dom.commandInput.focus();dom.commandInput.value=e.key.toUpperCase();}
  });
  window.addEventListener('keyup',e=>{if(e.code==='Space'){state.spaceDown=false;if(!state.pan)host.dataset.pan='false';}});
  window.addEventListener('beforeunload',e=>{if(state.objects.length||state.references.length){e.preventDefault();e.returnValue='';}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.tool-rail')&&!e.target.closest('.tool-popover'))dom.toolPopover.hidden=true;});

  dom.dialogBackdrop.hidden=true;dom.mappingBackdrop.hidden=true;dom.commandBar.hidden=true;i18n.apply(document);installTooltips();updateEmptyState();renderToolRail();updateAll();setCommandStatus(t('command.ready'));setTimeout(resizeCanvas,0);console.info(`PieniPlan v${VERSION} · Build ${BUILD}`);
})();
