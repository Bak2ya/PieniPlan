(() => {
  'use strict';

  const VERSION = '0.1.0';
  const BUILD = 2;
  const INTERNAL_UNIT = 'mm';
  const i18n = window.PieniPlanI18n;
  const t = (key, vars) => i18n.t(key, vars);
  i18n.apply(document);

  const $ = (id) => document.getElementById(id);
  const canvas = $('drawingCanvas');
  const host = $('canvasHost');
  const ctx = canvas.getContext('2d');

  const dom = {
    newBtn: $('newBtn'), openRefBtn: $('openRefBtn'), emptyOpenBtn: $('emptyOpenBtn'), addReferenceBtn: $('addReferenceBtn'),
    fileInput: $('referenceFileInput'), fitBtn: $('fitBtn'), undoBtn: $('undoBtn'), redoBtn: $('redoBtn'),
    contextToolName: $('contextToolName'), contextFields: $('contextFields'), contextHint: $('contextHint'),
    toolPopover: $('toolPopover'), emptyState: $('emptyState'), layerList: $('layerList'), referenceList: $('referenceList'),
    propertiesPanel: $('propertiesPanel'), statusX: $('statusX'), statusY: $('statusY'), statusUnits: $('statusUnits'), statusZoom: $('statusZoom'),
    gridToggle: $('gridToggle'), snapToggle: $('snapToggle'), orthoToggle: $('orthoToggle'),
    progressToast: $('progressToast'), progressTitle: $('progressTitle'), progressBar: $('progressBar'), progressDetail: $('progressDetail'),
    dialogBackdrop: $('dialogBackdrop'), dialogCopy: $('dialogCopy'), dialogInput: $('dialogInput'), dialogCancelBtn: $('dialogCancelBtn'), dialogApplyBtn: $('dialogApplyBtn'),
    uiTooltip: $('uiTooltip')
  };

  const layers = [
    { id: 'drawing', nameKey: 'layer.drawing', visible: true, kind: 'line' },
    { id: 'walls', nameKey: 'layer.walls', visible: true, kind: 'wall' },
    { id: 'dimensions', nameKey: 'layer.dimensions', visible: true, kind: 'dimension' }
  ];

  const toolCatalog = {
    select: [
      { id: 'select', labelKey: 'tool.select', ready: true }
    ],
    draw: [
      { id: 'line', labelKey: 'tool.line', ready: true },
      { id: 'polyline', labelKey: 'tool.polyline', ready: false },
      { id: 'rectangle', labelKey: 'tool.rectangle', ready: false },
      { id: 'circle', labelKey: 'tool.circle', ready: false }
    ],
    architecture: [
      { id: 'wall', labelKey: 'tool.wall', ready: true },
      { id: 'door', labelKey: 'tool.door', ready: false },
      { id: 'window', labelKey: 'tool.window', ready: false },
      { id: 'space', labelKey: 'tool.space', ready: false }
    ],
    dimension: [
      { id: 'measure', labelKey: 'tool.measure', ready: true },
      { id: 'aligned-dim', labelKey: 'tool.alignedDim', ready: false },
      { id: 'angle-dim', labelKey: 'tool.angleDim', ready: false }
    ],
    modify: [
      { id: 'move', labelKey: 'tool.move', ready: false },
      { id: 'copy', labelKey: 'tool.copy', ready: false },
      { id: 'rotate', labelKey: 'tool.rotate', ready: false },
      { id: 'trim', labelKey: 'tool.trim', ready: false },
      { id: 'offset', labelKey: 'tool.offset', ready: false },
      { id: 'delete', labelKey: 'tool.delete', ready: true, note: 'Del' }
    ]
  };

  const state = {
    camera: { cx: 0, cy: 0, zoom: 0.12 }, // pixels per mm
    cursorWorld: { x: 0, y: 0 },
    activeCategory: 'select',
    activeTool: 'select',
    activeLayer: 'drawing',
    references: [],
    selectedReferenceId: null,
    objects: [],
    selectedObjectId: null,
    drawStart: null,
    previewEnd: null,
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
    toolSettings: { wallThickness: 150 }
  };

  function uid(prefix) { return `${prefix}-${state.nextId++}`; }
  function deg(rad) { return rad * 180 / Math.PI; }
  function rad(degValue) { return degValue * Math.PI / 180; }
  function distance(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
  function angleDeg(a, b) { return (deg(Math.atan2(b.y - a.y, b.x - a.x)) + 360) % 360; }
  function formatNumber(n, digits = 1) { return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—'; }
  function unitFactorToMm(unit) {
    if (unit?.metersPerUnit != null) return unit.metersPerUnit * 1000;
    return 1; // DXF with unspecified units: treat as mm until calibrated.
  }

  function worldToScreen(p) {
    return {
      x: canvas.width / 2 + (p.x - state.camera.cx) * state.camera.zoom,
      y: canvas.height / 2 - (p.y - state.camera.cy) * state.camera.zoom
    };
  }
  function screenToWorld(p) {
    return {
      x: state.camera.cx + (p.x - canvas.width / 2) / state.camera.zoom,
      y: state.camera.cy - (p.y - canvas.height / 2) / state.camera.zoom
    };
  }

  function referenceLocalToWorld(ref, p) {
    return { x: ref.origin.x + p.x * ref.scale, y: ref.origin.y + p.y * ref.scale };
  }
  function referenceWorldToLocal(ref, p) {
    return { x: (p.x - ref.origin.x) / ref.scale, y: (p.y - ref.origin.y) / ref.scale };
  }

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

  function cssCanvasSize() {
    const dpr = Number(canvas.dataset.dpr || 1);
    return { w: canvas.width / dpr, h: canvas.height / dpr, dpr };
  }

  function toScreenCss(p) {
    const { w, h, dpr } = cssCanvasSize();
    return {
      x: w / 2 + (p.x - state.camera.cx) * state.camera.zoom,
      y: h / 2 - (p.y - state.camera.cy) * state.camera.zoom,
      dpr
    };
  }

  function fromPointerEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function screenCssToWorld(p) {
    const { w, h } = cssCanvasSize();
    return {
      x: state.camera.cx + (p.x - w / 2) / state.camera.zoom,
      y: state.camera.cy - (p.y - h / 2) / state.camera.zoom
    };
  }

  function render() {
    const { w, h } = cssCanvasSize();
    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h);
    for (const ref of state.references) if (ref.visible) drawReference(ref);
    drawObjects();
    drawPreview();
    drawCalibrationPreview();
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

  function layerVisible(id) { return layers.find(l => l.id === id)?.visible !== false; }

  function drawObjects() {
    const styles = getComputedStyle(document.documentElement);
    const lineColor = styles.getPropertyValue('--line').trim();
    const wallColor = styles.getPropertyValue('--wall').trim();
    const dimColor = styles.getPropertyValue('--dimension').trim();
    const selColor = styles.getPropertyValue('--selection').trim();

    for (const obj of state.objects) {
      if (!layerVisible(obj.layerId)) continue;
      const a = toScreenCss(obj.a), b = toScreenCss(obj.b);
      ctx.save();
      if (obj.type === 'wall') {
        ctx.strokeStyle = obj.id === state.selectedObjectId ? selColor : wallColor;
        ctx.lineWidth = Math.max(2, obj.thickness * state.camera.zoom);
        ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.lineWidth = 1;
      } else if (obj.type === 'dimension') {
        ctx.strokeStyle = obj.id === state.selectedObjectId ? selColor : dimColor;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.setLineDash([]);
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        ctx.font = '11px system-ui';
        const text = `${formatNumber(distance(obj.a, obj.b), 1)} mm`;
        const tw = ctx.measureText(text).width;
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();
        ctx.fillRect(mx - tw / 2 - 4, my - 9, tw + 8, 16);
        ctx.fillStyle = obj.id === state.selectedObjectId ? selColor : dimColor;
        ctx.fillText(text, mx - tw / 2, my + 3);
      } else {
        ctx.strokeStyle = obj.id === state.selectedObjectId ? selColor : lineColor;
        ctx.lineWidth = obj.id === state.selectedObjectId ? 2 : 1.4;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (obj.id === state.selectedObjectId) {
        ctx.fillStyle = selColor;
        for (const s of [a, b]) { ctx.beginPath(); ctx.arc(s.x, s.y, 3.5, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore();
    }
  }

  function drawPreview() {
    let start = null, end = null, color = '#7db7ff', width = 1.5;
    if (state.activeTool === 'line' || state.activeTool === 'wall') {
      start = state.drawStart; end = state.previewEnd;
      if (state.activeTool === 'wall') width = Math.max(2, currentWallThickness() * state.camera.zoom);
    } else if (state.activeTool === 'measure') {
      start = state.measureStart; end = state.previewEnd; color = '#f0c973';
    }
    if (!start || !end) return;
    const a = toScreenCss(start), b = toScreenCss(end);
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = .85; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.setLineDash([]);
    const len = distance(start, end);
    const text = `${formatNumber(len, 1)} mm · ${formatNumber(angleDeg(start, end), 1)}°`;
    ctx.font = '11px system-ui'; ctx.fillStyle = color;
    ctx.fillText(text, b.x + 8, b.y - 8);
    ctx.restore();
  }

  function drawCalibrationPreview() {
    const c = state.calibration;
    if (!c?.p1) return;
    const p2 = c.p2 || state.previewEnd;
    if (!p2) return;
    const a = toScreenCss(c.p1), b = toScreenCss(p2);
    ctx.save(); ctx.strokeStyle = '#ffb55a'; ctx.fillStyle = '#ffb55a'; ctx.lineWidth = 2; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); ctx.setLineDash([]);
    for (const p of [a,b]) { ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fill(); }
    ctx.restore();
  }

  function currentWallThickness() {
    const input = document.querySelector('[data-context="thickness"]');
    const n = Number(input?.value);
    if (Number.isFinite(n) && n > 0) state.toolSettings.wallThickness = n;
    return state.toolSettings.wallThickness;
  }

  function updateContextBar() {
    const toolNameKeys = {
      select:'context.select', line:'context.line', wall:'context.wall', measure:'context.measure', delete:'context.delete'
    };
    dom.contextToolName.textContent = t(toolNameKeys[state.activeTool] || `tool.${state.activeTool}`);
    dom.contextFields.innerHTML = '';
    let hint = t('hint.select');

    if (state.calibration) {
      dom.contextToolName.textContent = t('context.calibration');
      hint = state.calibration.p1 ? t('hint.calibrationSecond') : t('hint.calibrationFirst');
      dom.contextHint.textContent = hint;
      return;
    }

    if (state.activeTool === 'line' || state.activeTool === 'wall') {
      dom.contextFields.appendChild(contextNumberField(t('context.length'), 'length', '', 'mm'));
      dom.contextFields.appendChild(contextNumberField(t('context.angle'), 'angle', '', '°'));
      if (state.activeTool === 'wall') dom.contextFields.appendChild(contextNumberField(t('context.thickness'), 'thickness', String(state.toolSettings.wallThickness), 'mm'));
      hint = state.drawStart ? t('hint.segmentEnd') : t('hint.segmentStart');
    } else if (state.activeTool === 'measure') {
      hint = state.measureStart ? t('hint.measureSecond') : t('hint.measureFirst');
    } else if (state.activeTool === 'delete') {
      hint = t('hint.delete');
    }
    dom.contextHint.textContent = hint;
  }

  function contextNumberField(label, key, value, unit) {
    const wrap = document.createElement('div'); wrap.className = 'context-field';
    const lab = document.createElement('label'); lab.textContent = label;
    const input = document.createElement('input'); input.type = 'number'; input.step = '0.01'; input.value = value; input.dataset.context = key;
    const u = document.createElement('span'); u.className = 'context-unit'; u.textContent = unit;
    input.addEventListener('input', () => {
      if (key === 'thickness') {
        const n = Number(input.value);
        if (Number.isFinite(n) && n > 0) state.toolSettings.wallThickness = n;
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (state.activeTool === 'line' || state.activeTool === 'wall') && state.drawStart) {
        e.preventDefault(); commitNumericSegment();
      }
    });
    wrap.append(lab, input, u); return wrap;
  }

  function commitNumericSegment() {
    if (!state.drawStart) return;
    const lengthInput = document.querySelector('[data-context="length"]');
    const angleInput = document.querySelector('[data-context="angle"]');
    let len = Number(lengthInput?.value);
    let ang = Number(angleInput?.value);
    if (!Number.isFinite(len) || len <= 0) len = state.previewEnd ? distance(state.drawStart, state.previewEnd) : NaN;
    if (!Number.isFinite(ang)) ang = state.previewEnd ? angleDeg(state.drawStart, state.previewEnd) : 0;
    if (!Number.isFinite(len) || len <= 0) return;
    const end = { x: state.drawStart.x + Math.cos(rad(ang)) * len, y: state.drawStart.y + Math.sin(rad(ang)) * len };
    commitSegment(state.drawStart, end, state.activeTool);
  }

  function setTool(tool, category = null) {
    state.activeTool = tool;
    if (category) state.activeCategory = category;
    state.drawStart = null; state.measureStart = null; state.previewEnd = null; state.calibration = null;
    host.dataset.tool = tool;
    document.querySelectorAll('.tool-category').forEach(b => b.classList.toggle('active', b.dataset.category === state.activeCategory));
    dom.toolPopover.hidden = true;
    updateContextBar();
    render();
  }

  function openCategory(category, button) {
    state.activeCategory = category;
    document.querySelectorAll('.tool-category').forEach(b => b.classList.toggle('active', b.dataset.category === category));
    const items = toolCatalog[category] || [];
    dom.toolPopover.innerHTML = `<div class="tool-popover-title">${escapeHtml(t(button.dataset.categoryKey))}</div>`;
    for (const item of items) {
      const b = document.createElement('button');
      b.className = `tool-item ${state.activeTool === item.id ? 'active' : ''}`;
      b.disabled = !item.ready;
      const note = item.ready ? (item.note || '') : t('tool.planned');
      b.innerHTML = `<span>${escapeHtml(t(item.labelKey))}</span><span class="tool-item-note">${escapeHtml(note)}</span>`;
      b.addEventListener('click', () => setTool(item.id, category));
      dom.toolPopover.appendChild(b);
    }
    const top = Math.min(button.offsetTop, Math.max(8, host.clientHeight - 220));
    dom.toolPopover.style.top = `${top}px`;
    dom.toolPopover.hidden = false;
  }

  function pushHistory() {
    state.history.push(JSON.stringify(state.objects));
    if (state.history.length > 50) state.history.shift();
    state.future = [];
    updateUndoRedo();
  }
  function undo() {
    if (!state.history.length) return;
    state.future.push(JSON.stringify(state.objects));
    state.objects = JSON.parse(state.history.pop());
    state.selectedObjectId = null;
    updateAll();
  }
  function redo() {
    if (!state.future.length) return;
    state.history.push(JSON.stringify(state.objects));
    state.objects = JSON.parse(state.future.pop());
    state.selectedObjectId = null;
    updateAll();
  }
  function updateUndoRedo() { dom.undoBtn.disabled = !state.history.length; dom.redoBtn.disabled = !state.future.length; }

  function commitSegment(a, b, type) {
    if (distance(a, b) < 0.001) return;
    pushHistory();
    const obj = {
      id: uid(type), type,
      layerId: type === 'wall' ? 'walls' : 'drawing',
      a: { ...a }, b: { ...b }
    };
    if (type === 'wall') obj.thickness = currentWallThickness();
    state.objects.push(obj);
    state.selectedObjectId = obj.id;
    state.drawStart = { ...b };
    state.previewEnd = { ...b };
    updateAll();
  }

  function commitMeasurement(a, b) {
    if (distance(a, b) < 0.001) return;
    pushHistory();
    const obj = { id: uid('dimension'), type:'dimension', layerId:'dimensions', a:{...a}, b:{...b} };
    state.objects.push(obj); state.selectedObjectId = obj.id; state.measureStart = null; state.previewEnd = null;
    updateAll();
  }

  function nearestSnap(p) {
    if (!state.snap) return p;
    const threshold = 10 / state.camera.zoom;
    let best = null, bestD = threshold;
    const test = (q) => { const d = distance(p, q); if (d < bestD) { bestD = d; best = q; } };
    for (const o of state.objects) { test(o.a); test(o.b); }
    for (const ref of state.references) {
      if (!ref.visible || ref.type !== 'dxf' || !ref.snapIndex) continue;
      const local = referenceWorldToLocal(ref, p);
      const { minx, miny, cellW, cellH, cells } = ref.snapIndex;
      const gx = Math.floor((local.x - minx) / cellW);
      const gy = Math.floor((local.y - miny) / cellH);
      const localThreshold = threshold / Math.max(.000001, ref.scale);
      const radiusX = Math.max(1, Math.ceil(localThreshold / cellW));
      const radiusY = Math.max(1, Math.ceil(localThreshold / cellH));
      for (let dx = -radiusX; dx <= radiusX; dx++) {
        for (let dy = -radiusY; dy <= radiusY; dy++) {
          const bucket = cells.get(`${gx + dx},${gy + dy}`);
          if (!bucket) continue;
          for (const q of bucket) {
            if (ref.visibleLayers && !ref.visibleLayers.has(q.layer || '0')) continue;
            test(referenceLocalToWorld(ref, q));
          }
        }
      }
    }
    return best ? { ...best } : p;
  }

  function constrainOrtho(start, p) {
    if (!state.ortho || !start) return p;
    const dx = p.x - start.x, dy = p.y - start.y;
    return Math.abs(dx) >= Math.abs(dy) ? { x:p.x, y:start.y } : { x:start.x, y:p.y };
  }

  function hitObject(p) {
    const tolerance = 8 / state.camera.zoom;
    let best = null, bestD = tolerance;
    for (const o of state.objects) {
      const d = pointSegmentDistance(p, o.a, o.b);
      const effective = o.type === 'wall' ? Math.max(tolerance, o.thickness / 2) : tolerance;
      if (d < Math.max(bestD, effective) && d < effective) { best = o; bestD = d; }
    }
    return best;
  }

  function pointSegmentDistance(p, a, b) {
    const vx = b.x-a.x, vy = b.y-a.y, wx = p.x-a.x, wy = p.y-a.y;
    const c2 = vx*vx+vy*vy; if (!c2) return distance(p,a);
    const t = Math.max(0,Math.min(1,(wx*vx+wy*vy)/c2));
    return Math.hypot(p.x-(a.x+t*vx), p.y-(a.y+t*vy));
  }

  function onPointerMove(e) {
    const s = fromPointerEvent(e);
    let p = screenCssToWorld(s);
    state.cursorWorld = p;
    dom.statusX.textContent = `X ${formatNumber(p.x, 1)}`;
    dom.statusY.textContent = `Y ${formatNumber(p.y, 1)}`;

    if (state.pan) {
      const dx = (s.x - state.pan.startScreen.x) / state.camera.zoom;
      const dy = (s.y - state.pan.startScreen.y) / state.camera.zoom;
      state.camera.cx = state.pan.startCamera.cx - dx;
      state.camera.cy = state.pan.startCamera.cy + dy;
      render(); return;
    }

    const start = state.drawStart || state.measureStart || state.calibration?.p1;
    if (start) p = constrainOrtho(start, nearestSnap(p));
    else p = nearestSnap(p);
    state.previewEnd = p;
    render();
  }

  function onPointerDown(e) {
    host.focus();
    const s = fromPointerEvent(e);
    const panGesture = e.button === 1 || (e.button === 0 && state.spaceDown);
    if (panGesture) {
      e.preventDefault();
      state.pan = { startScreen:s, startCamera:{...state.camera} };
      host.dataset.pan = 'true';
      canvas.setPointerCapture?.(e.pointerId);
      return;
    }
    if (e.button !== 0) return;

    let p = screenCssToWorld(s);
    p = nearestSnap(p);

    if (state.calibration) {
      if (!state.calibration.p1) {
        state.calibration.p1 = p; state.previewEnd = p; updateContextBar(); render();
      } else {
        state.calibration.p2 = p;
        openCalibrationDialog();
      }
      return;
    }

    if (state.activeTool === 'select') {
      const obj = hitObject(p); state.selectedObjectId = obj?.id || null; updateAll(); return;
    }
    if (state.activeTool === 'delete') {
      const obj = hitObject(p); if (!obj) return;
      pushHistory(); state.objects = state.objects.filter(o => o.id !== obj.id); state.selectedObjectId = null; updateAll(); return;
    }
    if (state.activeTool === 'line' || state.activeTool === 'wall') {
      if (!state.drawStart) { state.drawStart = p; state.previewEnd = p; updateContextBar(); render(); }
      else commitSegment(state.drawStart, constrainOrtho(state.drawStart,p), state.activeTool);
      return;
    }
    if (state.activeTool === 'measure') {
      if (!state.measureStart) { state.measureStart = p; state.previewEnd = p; updateContextBar(); render(); }
      else commitMeasurement(state.measureStart, constrainOrtho(state.measureStart,p));
    }
  }

  function onPointerUp(e) {
    if (!state.pan) return;
    state.pan = null; host.dataset.pan = 'false';
    try { canvas.releasePointerCapture?.(e.pointerId); } catch (_) {}
  }

  function onWheel(e) {
    e.preventDefault();
    const s = fromPointerEvent(e);
    const before = screenCssToWorld(s);
    const factor = Math.exp(-e.deltaY * 0.0014);
    state.camera.zoom = Math.max(0.002, Math.min(8, state.camera.zoom * factor));
    const after = screenCssToWorld(s);
    state.camera.cx += before.x - after.x;
    state.camera.cy += before.y - after.y;
    render();
  }

  function referenceBounds(ref) {
    if (ref.type === 'image') {
      const a = referenceLocalToWorld(ref,{x:0,y:0}), b = referenceLocalToWorld(ref,{x:ref.width,y:ref.height});
      return {minx:Math.min(a.x,b.x),miny:Math.min(a.y,b.y),maxx:Math.max(a.x,b.x),maxy:Math.max(a.y,b.y)};
    }
    const b = ref.bounds;
    const a = referenceLocalToWorld(ref,{x:b.minx,y:b.miny}), c = referenceLocalToWorld(ref,{x:b.maxx,y:b.maxy});
    return {minx:Math.min(a.x,c.x),miny:Math.min(a.y,c.y),maxx:Math.max(a.x,c.x),maxy:Math.max(a.y,c.y)};
  }

  function allBounds() {
    let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;
    const include = (p) => { minx=Math.min(minx,p.x); miny=Math.min(miny,p.y); maxx=Math.max(maxx,p.x); maxy=Math.max(maxy,p.y); };
    for (const r of state.references) { const b=referenceBounds(r); include({x:b.minx,y:b.miny}); include({x:b.maxx,y:b.maxy}); }
    for (const o of state.objects) { include(o.a); include(o.b); }
    return Number.isFinite(minx) ? {minx,miny,maxx,maxy} : null;
  }

  function fitAll() {
    const b = allBounds(); if (!b) { state.camera={cx:0,cy:0,zoom:.12}; render(); return; }
    const {w,h} = cssCanvasSize();
    const bw=Math.max(100,b.maxx-b.minx), bh=Math.max(100,b.maxy-b.miny);
    state.camera.cx=(b.minx+b.maxx)/2; state.camera.cy=(b.miny+b.maxy)/2;
    state.camera.zoom=Math.max(.002, Math.min(8, Math.min((w-80)/bw,(h-80)/bh)));
    render();
  }

  async function openReferenceFile(file) {
    if (!file) return;
    const lower = file.name.toLowerCase();
    try {
      if (lower.endsWith('.dxf')) await addDxfReference(file);
      else if (file.type.startsWith('image/')) await addImageReference(file);
      else alert(t('alert.unsupportedReference'));
    } finally { dom.fileInput.value=''; }
  }

  async function addDxfReference(file) {
    showProgress(t('progress.readingDxf'), 0, file.name);
    const text = await file.text();
    const parsed = await window.PieniPlanDXF.parseAndAnalyze(text, (p) => showProgress(p.stage || t('progress.readingDxf'), p.ratio || 0, p.detail || ''));
    const factor = unitFactorToMm(parsed.unit);
    const entities = parsed.entities.map(e => normalizeEntityToMm(e, factor));
    const b = boundsEntities(entities);
    const ref = {
      id: uid('ref'), type:'dxf', name:file.name, visible:true, opacity:.48, scale:1, origin:{x:0,y:0},
      entities, bounds:b, sourceUnit:parsed.unit?.label || 'unspecified', sourceUnitSpecified: parsed.unit?.metersPerUnit != null,
      layers: parsed.layers || [], visibleLayers:new Set(parsed.layers || []),
      pathsByLayer: buildDxfPaths(entities), textEntities: entities.filter(e => e.type === 'text'), snapIndex: buildSnapIndex(entities, b)
    };
    state.references.push(ref); state.selectedReferenceId = ref.id;
    hideProgress(); updateAll(); switchInspector('reference'); fitAll();
  }

  function normalizeEntityToMm(e, factor) {
    const out = {...e};
    if (e.type==='line') { out.x1=e.x1*factor;out.y1=e.y1*factor;out.x2=e.x2*factor;out.y2=e.y2*factor; }
    else if (e.type==='polyline') out.points=(e.points||[]).map(p=>[p[0]*factor,p[1]*factor]);
    else if (e.type==='circle') { out.cx=e.cx*factor;out.cy=e.cy*factor;out.r=e.r*factor; }
    else if (e.type==='text') { out.x=e.x*factor;out.y=e.y*factor; }
    return out;
  }


  function buildDxfPaths(entities) {
    const paths = new Map();
    const get = (layer) => {
      const key = layer || '0';
      if (!paths.has(key)) paths.set(key, new Path2D());
      return paths.get(key);
    };
    for (const e of entities) {
      const path = get(e.layer);
      if (e.type === 'line') {
        path.moveTo(e.x1, e.y1); path.lineTo(e.x2, e.y2);
      } else if (e.type === 'polyline' && e.points?.length) {
        path.moveTo(e.points[0][0], e.points[0][1]);
        for (let i = 1; i < e.points.length; i++) path.lineTo(e.points[i][0], e.points[i][1]);
        if (e.closed) path.closePath();
      } else if (e.type === 'circle' && e.r > 0) {
        path.moveTo(e.cx + e.r, e.cy); path.arc(e.cx, e.cy, e.r, 0, Math.PI * 2);
      }
    }
    return paths;
  }

  function buildSnapIndex(entities, bounds) {
    const cols = 64, rows = 64;
    const cellW = Math.max(1e-6, (bounds.maxx - bounds.minx) / cols);
    const cellH = Math.max(1e-6, (bounds.maxy - bounds.miny) / rows);
    const cells = new Map();
    const add = (x, y, layer = '0') => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const gx = Math.max(0, Math.min(cols - 1, Math.floor((x - bounds.minx) / cellW)));
      const gy = Math.max(0, Math.min(rows - 1, Math.floor((y - bounds.miny) / cellH)));
      const key = `${gx},${gy}`;
      if (!cells.has(key)) cells.set(key, []);
      cells.get(key).push({ x, y, layer });
    };
    for (const e of entities) {
      if (e.type === 'line') { add(e.x1, e.y1, e.layer); add(e.x2, e.y2, e.layer); }
      else if (e.type === 'polyline') for (const p of e.points || []) add(p[0], p[1], e.layer);
      else if (e.type === 'circle') { add(e.cx - e.r, e.cy, e.layer); add(e.cx + e.r, e.cy, e.layer); add(e.cx, e.cy - e.r, e.layer); add(e.cx, e.cy + e.r, e.layer); }
    }
    return { minx: bounds.minx, miny: bounds.miny, cellW, cellH, cells };
  }

  function boundsEntities(entities) {
    let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;
    const add=(x,y)=>{if(Number.isFinite(x)&&Number.isFinite(y)){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y)}};
    for(const e of entities){
      if(e.type==='line'){add(e.x1,e.y1);add(e.x2,e.y2)}
      else if(e.type==='polyline') for(const p of e.points||[]) add(p[0],p[1]);
      else if(e.type==='circle'){add(e.cx-e.r,e.cy-e.r);add(e.cx+e.r,e.cy+e.r)}
      else if(e.type==='text')add(e.x,e.y);
    }
    return Number.isFinite(minx)?{minx,miny,maxx,maxy}:{minx:0,miny:0,maxx:1000,maxy:1000};
  }

  async function addImageReference(file) {
    const dataUrl = await readDataUrl(file);
    const image = await loadImage(dataUrl);
    const ref = { id:uid('ref'), type:'image', name:file.name, visible:true, opacity:.55, scale:1, origin:{x:0,y:0}, image, width:image.naturalWidth, height:image.naturalHeight, sourceUnit:'px' };
    state.references.push(ref); state.selectedReferenceId=ref.id;
    updateAll(); switchInspector('reference'); fitAll();
  }

  function readDataUrl(file) { return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)}); }
  function loadImage(src) { return new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=rej;img.src=src}); }

  function showProgress(title, ratio, detail) {
    dom.progressToast.hidden=false; dom.progressTitle.textContent=title; dom.progressBar.style.width=`${Math.max(0,Math.min(1,ratio))*100}%`; dom.progressDetail.textContent=detail;
  }
  function hideProgress() { dom.progressToast.hidden=true; }

  function beginCalibration(refId) {
    const ref=state.references.find(r=>r.id===refId); if(!ref)return;
    state.selectedReferenceId=refId;
    state.calibration={refId,p1:null,p2:null}; state.drawStart=null;state.measureStart=null;state.previewEnd=null;
    updateContextBar(); render();
  }

  function openCalibrationDialog() {
    const c=state.calibration; if(!c?.p1||!c?.p2)return;
    const measured=distance(c.p1,c.p2);
    dom.dialogCopy.textContent = t('dialog.calibrationCopy', { distance: formatNumber(measured, 2) });
    dom.dialogInput.value=String(Math.round(measured*100)/100);
    dom.dialogBackdrop.hidden=false; setTimeout(()=>{dom.dialogInput.focus();dom.dialogInput.select()},0);
  }

  function applyCalibration() {
    const actual=Number(dom.dialogInput.value); const c=state.calibration; if(!c||!Number.isFinite(actual)||actual<=0)return;
    const ref=state.references.find(r=>r.id===c.refId); if(!ref)return;
    const current=distance(c.p1,c.p2); if(current<=0)return;
    const localAnchor=referenceWorldToLocal(ref,c.p1);
    const newScale=ref.scale*(actual/current);
    ref.scale=newScale;
    ref.origin={x:c.p1.x-localAnchor.x*newScale,y:c.p1.y-localAnchor.y*newScale};
    state.calibration=null; dom.dialogBackdrop.hidden=true; state.previewEnd=null;
    updateAll();
  }

  function iconMarkup(name) {
    return `<span class="ui-icon icon-${name}" aria-hidden="true"></span>`;
  }

  function configureVisibilityButton(button, visible, kind) {
    const showKey = kind === 'reference' ? 'tooltip.showReference' : 'tooltip.showLayer';
    const hideKey = kind === 'reference' ? 'tooltip.hideReference' : 'tooltip.hideLayer';
    button.innerHTML = iconMarkup(visible ? 'eye' : 'eye-slash');
    button.setAttribute('aria-label', t(visible ? hideKey : showKey));
    button.dataset.tooltipTitleKey = visible ? hideKey : showKey;
    delete button.dataset.tooltipKey;
    delete button.dataset.shortcut;
  }

  function renderLayers() {
    dom.layerList.innerHTML='';
    for(const l of layers){
      const row=document.createElement('div');row.className='list-row';
      const eye=document.createElement('button');eye.className='eye-button';configureVisibilityButton(eye,l.visible,'layer');
      eye.addEventListener('click',()=>{l.visible=!l.visible;renderLayers();render()});
      const main=document.createElement('div');main.className='row-main';
      main.innerHTML=`<div class="row-title">${escapeHtml(t(l.nameKey))}</div><div class="row-meta">${escapeHtml(t('panel.objects',{count:state.objects.filter(o=>o.layerId===l.id).length}))}</div>`;
      const count=document.createElement('span');count.className='row-meta';count.textContent=l.id===state.activeLayer?t('panel.active'):'';
      row.append(eye,main,count);dom.layerList.appendChild(row);
    }
  }

  function renderReferences() {
    dom.referenceList.innerHTML='';
    if(!state.references.length){dom.referenceList.innerHTML=`<div class="section-copy">${escapeHtml(t('panel.noReferences'))}</div>`;return;}
    for(const r of state.references){
      const row=document.createElement('div');row.className=`list-row ${state.selectedReferenceId===r.id?'selected':''}`;
      const eye=document.createElement('button');eye.className='eye-button';configureVisibilityButton(eye,r.visible,'reference');
      eye.addEventListener('click',(e)=>{e.stopPropagation();r.visible=!r.visible;renderReferences();render()});
      const main=document.createElement('div');main.className='row-main';
      const meta=r.type==='dxf'
        ?`${t('panel.entities',{count:r.entities.length.toLocaleString()})} · ${r.sourceUnitSpecified?r.sourceUnit:t('panel.unitUnspecified')}`
        :`${r.width}×${r.height}px`;
      main.innerHTML=`<div class="row-title">${escapeHtml(r.name)}</div><div class="row-meta">${escapeHtml(meta)}</div>`;
      const actions=document.createElement('div');actions.className='row-actions';
      const calibrate=document.createElement('button');calibrate.className='mini-action';calibrate.textContent=t('action.scale');calibrate.dataset.tooltipTitle=t('action.scale');calibrate.dataset.tooltipKey='tooltip.scaleReference';calibrate.addEventListener('click',(e)=>{e.stopPropagation();beginCalibration(r.id)});
      const fit=document.createElement('button');fit.className='mini-action';fit.textContent=t('action.fit');fit.addEventListener('click',(e)=>{e.stopPropagation();fitReference(r)});
      actions.append(calibrate,fit); row.append(eye,main,actions);
      row.addEventListener('click',()=>{state.selectedReferenceId=r.id;renderReferences();renderProperties()});
      dom.referenceList.appendChild(row);

      if(state.selectedReferenceId===r.id){
        const control=document.createElement('div');control.className='panel-section';
        control.innerHTML=`<div class="section-heading">${escapeHtml(t('panel.opacity'))}</div><input data-opacity="${r.id}" type="range" min="0.08" max="1" step="0.01" value="${r.opacity}" style="width:100%;margin-top:7px">`;
        control.querySelector('input').addEventListener('input',(e)=>{r.opacity=Number(e.target.value);render()});
        dom.referenceList.appendChild(control);
        if (r.type === 'dxf' && r.layers.length) renderReferenceLayerControls(r);
      }
    }
  }

  function renderReferenceLayerControls(ref) {
    const section = document.createElement('details');
    section.className = 'panel-section';
    const summary = document.createElement('summary');
    summary.className = 'section-heading';
    summary.textContent = t('panel.dxfLayers',{count:ref.layers.length});
    section.appendChild(summary);
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:5px;margin:8px 0;';
    const all = document.createElement('button'); all.className='mini-action'; all.textContent=t('action.all');
    const none = document.createElement('button'); none.className='mini-action'; none.textContent=t('action.none');
    all.addEventListener('click',()=>{ref.visibleLayers=new Set(ref.layers);renderReferences();render()});
    none.addEventListener('click',()=>{ref.visibleLayers=new Set();renderReferences();render()});
    actions.append(all,none); section.appendChild(actions);
    const list = document.createElement('div'); list.style.cssText='display:grid;gap:5px;max-height:220px;overflow:auto;';
    for (const layer of ref.layers) {
      const label = document.createElement('label');
      label.style.cssText='display:grid;grid-template-columns:auto minmax(0,1fr);gap:7px;align-items:center;font-size:9.5px;color:var(--text-2);';
      const cb = document.createElement('input'); cb.type='checkbox'; cb.checked=ref.visibleLayers.has(layer);
      cb.addEventListener('change',()=>{cb.checked?ref.visibleLayers.add(layer):ref.visibleLayers.delete(layer);render()});
      const text = document.createElement('span'); text.textContent=layer; text.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      label.append(cb,text); list.appendChild(label);
    }
    section.appendChild(list); dom.referenceList.appendChild(section);
  }

  function fitReference(ref){const b=referenceBounds(ref);fitBounds(b)}
  function fitBounds(b){const {w,h}=cssCanvasSize();const bw=Math.max(100,b.maxx-b.minx),bh=Math.max(100,b.maxy-b.miny);state.camera.cx=(b.minx+b.maxx)/2;state.camera.cy=(b.miny+b.maxy)/2;state.camera.zoom=Math.max(.002,Math.min(8,Math.min((w-80)/bw,(h-80)/bh)));render()}

  function localizedObjectType(type) {
    return t(`value.${type}`);
  }

  function localizedToolName(tool) {
    const keys = { select:'tool.select', line:'tool.line', wall:'tool.wall', measure:'tool.measure', delete:'tool.delete' };
    return t(keys[tool] || `tool.${tool}`);
  }

  function renderProperties() {
    dom.propertiesPanel.innerHTML='';
    const obj=state.objects.find(o=>o.id===state.selectedObjectId);
    if(obj){
      propertyText(t('property.type'),localizedObjectType(obj.type));
      const layer=layers.find(l=>l.id===obj.layerId);
      propertyText(t('property.layer'),layer?t(layer.nameKey):obj.layerId);
      propertyText(t('property.length'),`${formatNumber(distance(obj.a,obj.b),2)} mm`);
      propertyText(t('property.angle'),`${formatNumber(angleDeg(obj.a,obj.b),2)}°`);
      if(obj.type==='wall')propertyNumber(t('property.thickness'),obj.thickness,(v)=>{if(v>0){pushHistory();obj.thickness=v;updateAll()}});
      propertyText(t('property.start'),`${formatNumber(obj.a.x,1)}, ${formatNumber(obj.a.y,1)}`);
      propertyText(t('property.end'),`${formatNumber(obj.b.x,1)}, ${formatNumber(obj.b.y,1)}`);
      return;
    }
    const ref=state.references.find(r=>r.id===state.selectedReferenceId);
    if(ref){
      propertyText(t('property.reference'),ref.name);
      propertyText(t('property.type'),ref.type==='dxf'?'DXF':t('value.image'));
      propertyText(t('property.scale'),`${formatNumber(ref.scale,6)}×`);
      propertyText(t('property.origin'),`${formatNumber(ref.origin.x,1)}, ${formatNumber(ref.origin.y,1)}`);
      propertyText(t('property.opacity'),`${Math.round(ref.opacity*100)}%`);
      return;
    }
    propertyText(t('property.version'),`v${VERSION} · Build ${BUILD}`);
    propertyText(t('property.units'),INTERNAL_UNIT);
    propertyText(t('property.tool'),localizedToolName(state.activeTool));
  }

  function propertyText(label,value){const row=document.createElement('div');row.className='property-row';row.innerHTML=`<div class="property-label">${escapeHtml(label)}</div><div class="property-value">${escapeHtml(String(value))}</div>`;dom.propertiesPanel.appendChild(row)}
  function propertyNumber(label,value,onChange){const row=document.createElement('div');row.className='property-row';const l=document.createElement('div');l.className='property-label';l.textContent=label;const v=document.createElement('div');v.className='property-value';const input=document.createElement('input');input.type='number';input.value=String(value);input.addEventListener('change',()=>onChange(Number(input.value)));v.appendChild(input);row.append(l,v);dom.propertiesPanel.appendChild(row)}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function switchInspector(tab){document.querySelectorAll('.inspector-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.inspector-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===tab))}
  function updateAll(){updateUndoRedo();updateContextBar();renderLayers();renderReferences();renderProperties();render()}

  function resetProject(){
    if((state.references.length||state.objects.length)&&!confirm(t('confirm.newDrawing')))return;
    state.references=[];state.objects=[];state.selectedReferenceId=null;state.selectedObjectId=null;state.history=[];state.future=[];state.nextId=1;state.camera={cx:0,cy:0,zoom:.12};setTool('select','select');updateAll();
  }

  let tooltipTimer = null;
  let tooltipOwner = null;

  function tooltipTargetFrom(node) {
    return node instanceof Element ? node.closest('[data-tooltip-key],[data-tooltip-title-key],[data-tooltip-title]') : null;
  }

  function hideTooltip() {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
    tooltipOwner = null;
    dom.uiTooltip.hidden = true;
    dom.uiTooltip.innerHTML = '';
  }

  function showTooltip(owner) {
    if (!owner?.isConnected) return;
    const title = owner.dataset.tooltipTitleKey ? t(owner.dataset.tooltipTitleKey) : (owner.dataset.tooltipTitle || '');
    const copy = owner.dataset.tooltipKey ? t(owner.dataset.tooltipKey) : '';
    const shortcut = owner.dataset.shortcut || '';
    if (!title && !copy && !shortcut) return;

    const parts = [];
    if (title) parts.push(`<div class="tooltip-title">${escapeHtml(title)}</div>`);
    if (copy) parts.push(`<div class="tooltip-copy">${escapeHtml(copy)}</div>`);
    if (shortcut) parts.push(`<div class="tooltip-shortcut">${escapeHtml(t('tooltip.shortcut'))} · ${escapeHtml(shortcut)}</div>`);
    dom.uiTooltip.innerHTML = parts.join('');
    dom.uiTooltip.hidden = false;

    const rect = owner.getBoundingClientRect();
    const tip = dom.uiTooltip.getBoundingClientRect();
    const margin = 8;
    let left = rect.left + rect.width / 2 - tip.width / 2;
    left = Math.max(margin, Math.min(window.innerWidth - tip.width - margin, left));
    let top = rect.top - tip.height - margin;
    if (top < margin) top = rect.bottom + margin;
    top = Math.max(margin, Math.min(window.innerHeight - tip.height - margin, top));
    dom.uiTooltip.style.left = `${Math.round(left)}px`;
    dom.uiTooltip.style.top = `${Math.round(top)}px`;
  }

  function scheduleTooltip(owner, delay) {
    clearTimeout(tooltipTimer);
    tooltipOwner = owner;
    tooltipTimer = setTimeout(() => {
      if (tooltipOwner === owner) showTooltip(owner);
    }, delay);
  }

  function installTooltips() {
    document.addEventListener('pointerover', (e) => {
      const owner = tooltipTargetFrom(e.target);
      if (!owner || owner.contains(e.relatedTarget)) return;
      scheduleTooltip(owner, 650);
    });
    document.addEventListener('pointerout', (e) => {
      const owner = tooltipTargetFrom(e.target);
      if (!owner || owner.contains(e.relatedTarget)) return;
      hideTooltip();
    });
    document.addEventListener('focusin', (e) => {
      const owner = tooltipTargetFrom(e.target);
      if (owner) scheduleTooltip(owner, 450);
    });
    document.addEventListener('focusout', (e) => {
      const owner = tooltipTargetFrom(e.target);
      if (owner) hideTooltip();
    });
    document.addEventListener('pointerdown', hideTooltip, true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideTooltip();
    }, true);
  }

  document.querySelectorAll('.tool-category').forEach(b=>b.addEventListener('click',(e)=>openCategory(b.dataset.category,b)));
  document.querySelectorAll('.inspector-tab').forEach(b=>b.addEventListener('click',()=>switchInspector(b.dataset.tab)));
  dom.openRefBtn.addEventListener('click',()=>dom.fileInput.click()); dom.emptyOpenBtn.addEventListener('click',()=>dom.fileInput.click()); dom.addReferenceBtn.addEventListener('click',()=>dom.fileInput.click());
  dom.fileInput.addEventListener('change',()=>openReferenceFile(dom.fileInput.files?.[0])); dom.fitBtn.addEventListener('click',fitAll); dom.newBtn.addEventListener('click',resetProject);
  dom.undoBtn.addEventListener('click',undo); dom.redoBtn.addEventListener('click',redo);
  dom.gridToggle.addEventListener('click',()=>{state.grid=!state.grid;dom.gridToggle.classList.toggle('active',state.grid);render()});
  dom.snapToggle.addEventListener('click',()=>{state.snap=!state.snap;dom.snapToggle.classList.toggle('active',state.snap)});
  dom.orthoToggle.addEventListener('click',()=>{state.ortho=!state.ortho;dom.orthoToggle.classList.toggle('active',state.ortho);render()});
  dom.dialogCancelBtn.addEventListener('click',()=>{dom.dialogBackdrop.hidden=true;state.calibration=null;state.previewEnd=null;updateAll()});
  dom.dialogApplyBtn.addEventListener('click',applyCalibration); dom.dialogInput.addEventListener('keydown',(e)=>{if(e.key==='Enter')applyCalibration();if(e.key==='Escape')dom.dialogCancelBtn.click()});

  canvas.addEventListener('pointermove',onPointerMove); canvas.addEventListener('pointerdown',onPointerDown); canvas.addEventListener('pointerup',onPointerUp); canvas.addEventListener('pointercancel',onPointerUp);
  host.addEventListener('dragover',(e)=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});
  host.addEventListener('drop',(e)=>{e.preventDefault();const file=e.dataTransfer.files?.[0];if(file)openReferenceFile(file);});
  canvas.addEventListener('wheel',onWheel,{passive:false}); canvas.addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('resize',resizeCanvas);
  window.addEventListener('keydown',(e)=>{
    if(e.code==='Space' && !isTyping()){state.spaceDown=true;e.preventDefault()}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!isTyping()){e.preventDefault();e.shiftKey?redo():undo()}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'&&!isTyping()){e.preventDefault();redo()}
    if(e.key==='Escape'){
      state.drawStart=null;state.measureStart=null;state.previewEnd=null;state.calibration=null;dom.toolPopover.hidden=true;dom.dialogBackdrop.hidden=true;updateContextBar();render();
    }
    if((e.key==='Delete'||e.key==='Backspace')&&!isTyping()&&state.selectedObjectId){e.preventDefault();pushHistory();state.objects=state.objects.filter(o=>o.id!==state.selectedObjectId);state.selectedObjectId=null;updateAll()}
  });
  window.addEventListener('keyup',(e)=>{if(e.code==='Space'){state.spaceDown=false;if(!state.pan)host.dataset.pan='false'}});
  window.addEventListener('beforeunload',(e)=>{if(state.objects.length||state.references.length){e.preventDefault();e.returnValue='';}});
  document.addEventListener('pointerdown',(e)=>{if(!e.target.closest('.tool-rail')&&!e.target.closest('.tool-popover'))dom.toolPopover.hidden=true});

  function isTyping(){const a=document.activeElement;return a&&(['INPUT','TEXTAREA','SELECT'].includes(a.tagName)||a.isContentEditable)}

  dom.dialogBackdrop.hidden = true;
  i18n.apply(document);
  installTooltips();
  resizeCanvas(); updateAll(); host.dataset.tool='select';
  console.info(`PieniPlan v${VERSION} Build ${BUILD}`);
})();
