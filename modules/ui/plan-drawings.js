/* Local drawing draft using existing House controls and guarded document commits. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  function create(port) {
    let overlay = null, previous = null;
    const L = (ko, en) => port.language() === 'ko' ? ko : en;
    function close() { overlay?.remove(); overlay = null; if (previous?.isConnected) previous.focus({ preventScroll: true }); }
    function open(floorId, { derive = false } = {}) {
      const floor = port.state.floors.find(f => f.id === floorId); if (!floor) return false;
      close(); previous = document.activeElement;
      overlay = document.createElement('div'); overlay.className = 'feature-backdrop';
      const box = document.createElement('section'); box.className = 'feature-dialog drawing-dialog'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', L(derive ? '파생 도면 만들기' : '도면 설정', derive ? 'Create derived drawing' : 'Drawing settings'));
      overlay.append(box); document.body.append(overlay);
      const title = document.createElement('h2'); title.textContent = box.getAttribute('aria-label'); box.append(title);
      const note = document.createElement('p'); note.className = 'settings-section-copy'; note.textContent = derive ? L('기준 도면은 읽기 전용으로 참조합니다. 새 도면에는 고유 요소만 추가하며 동일한 공간 ID를 공유합니다.', 'The base drawing is a read-only reference. Add only local elements; physical space identities remain shared.') : L('도면과 물리적인 층은 별개입니다. 한 층에 여러 도면을 연결하거나 층 없이 사용할 수 있습니다.', 'Drawings and physical levels are separate. Several drawings can share a level, or have no level.'); box.append(note);if(floor.referenceSourcesOmitted){const omitted=document.createElement('p');omitted.className='settings-section-copy';omitted.textContent=L('교환 패키지에는 원본 CAD·PDF·이미지가 포함되지 않았습니다. 원본이 필요하면 PPRJ에서 작업하거나 참조를 다시 연결하세요.','Original CAD/PDF/image sources were omitted from exchange. Use the authoring PPRJ or reconnect sources when required.');box.append(omitted);}
      const fields = {};
      function field(key, label, type = 'text') {
        const row = document.createElement('label'); row.className = 'settings-row';
        const text = document.createElement('span'); text.className = 'settings-row-label'; text.textContent = label;
        const operation = document.createElement('span'); operation.className = 'settings-operation';
        const input = document.createElement(type === 'select' ? 'select' : 'input'); if (type !== 'select') input.type = type;
        input.id = 'drawing90-' + key; input.className = type === 'select' ? 'select-input' : 'text-input'; input.setAttribute('aria-label', label);
        operation.append(input); row.append(text, operation); box.append(row); fields[key] = input; return input;
      }
      function option(select, value, label) { const o = document.createElement('option'); o.value = value; o.textContent = label; select.append(o); return o; }
      const name = field('name', L('도면 이름', 'Drawing name')); name.maxLength = 255; name.value = derive ? floor.name + L(' · 소방', ' · Fire') : floor.name;
      const discipline = field('discipline', L('도면 유형', 'Drawing discipline')); discipline.value = derive ? 'fire' : floor.discipline || 'architectural'; discipline.maxLength = 128;
      const list = document.createElement('datalist'); list.id = 'drawing90-types';
      for (const [value, ko, en] of [['architectural', '건축', 'Architectural'], ['fire', '소방', 'Fire'], ['electrical', '전기', 'Electrical'], ['communications', '통신', 'Communications'], ['mechanical', '설비', 'Mechanical']]) { const o = document.createElement('option'); o.value = value; o.label = L(ko, en); list.append(o); }
      box.append(list); discipline.setAttribute('list', list.id);
      const typeCopy = document.createElement('p'); typeCopy.className = 'settings-section-copy'; typeCopy.textContent = L('목록에서 고르거나 사용자 정의 유형을 입력하세요.', 'Choose a suggestion or enter a custom discipline.'); box.append(typeCopy);
      const level = field('level', L('물리적인 층', 'Physical level'), 'select'); option(level, '', L('층 연결 없음 · 건물 전체/계통도', 'No level · building-wide or schematic'));
      for (const item of port.state.drawingModel?.levels || []) if (item.buildingId === floor.buildingId) option(level, item.id, item.name);
      option(level, '__new__', L('새 층 연결…', 'Create level…')); level.value = floor.levelId || '';
      const levelName = field('levelName', L('새 층 이름', 'New level name')); levelName.maxLength = 255; levelName.closest('label').hidden = true;
      level.onchange = () => { levelName.closest('label').hidden = level.value !== '__new__'; if (level.value === '__new__') levelName.focus(); };
      const base = field('base', L('기준 도면', 'Base drawing'), 'select');
      if (!derive) option(base, '', L('독립 도면 · 참조 없음', 'Independent drawing · no reference'));
      for (const f of port.state.floors) if (derive ? f.id === floor.id : f.id !== floor.id) option(base, f.id, f.name);
      const missing = !derive && floor.baseDrawingId && !port.state.floors.some(f => f.id === floor.baseDrawingId);
      if (missing) option(base, floor.baseDrawingId, L('누락된 기준 도면', 'Missing base drawing') + ' · ' + floor.baseDrawingId);
      base.value = derive ? floor.id : floor.baseDrawingId || ''; base.disabled = derive;
      const visible = field('visible', L('기준 도면 표시', 'Show base drawing'), 'checkbox'); visible.checked = floor.baseView?.visible !== false;
      const opacity = field('opacity', L('기준 도면 불투명도 (%)', 'Base opacity (%)'), 'number'); opacity.min = '0'; opacity.max = '100'; opacity.step = '1'; opacity.value = String(Math.round((floor.baseView?.opacity ?? .35) * 100));
      const print = field('print', L('기준 도면 출력 포함', 'Include base in output'), 'checkbox'); print.checked = floor.baseView?.print !== false;
      const layers = document.createElement('fieldset'); layers.className = 'settings-snap-grid'; const legend = document.createElement('legend'); legend.textContent = L('기준 도면의 Plan 레이어', 'Base Plan layers'); layers.append(legend);
      const layerInputs = [];
      for (const item of port.layers()) {
        const label = document.createElement('label'); label.className = 'settings-check-row'; const input = document.createElement('input'); input.type = 'checkbox'; input.value = item.id; input.checked = !floor.baseView?.layers || floor.baseView.layers.includes(item.id); label.append(input, document.createTextNode(item.name)); layers.append(label); layerInputs.push(input);
      }
      box.append(layers);
      function baseFields() { const enabled = Boolean(base.value); for (const k of [visible, opacity, print]) k.closest('label').hidden = !enabled; layers.hidden = !enabled; }
      base.onchange = baseFields; baseFields();
      const status = document.createElement('p'); status.setAttribute('role', 'status'); status.className = 'settings-section-copy'; box.append(status);
      const actions = document.createElement('div'); actions.className = 'text-style-actions'; box.append(actions);
      const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'small-button'; cancel.textContent = L('취소', 'Cancel'); cancel.onclick = close;
      const apply = document.createElement('button'); apply.type = 'button'; apply.className = 'small-button primary'; apply.textContent = L(derive ? '파생 도면 만들기' : '적용', derive ? 'Create derived drawing' : 'Apply'); apply.id = 'drawing90-apply';
      apply.onclick = () => { try { port.commit({ floorId, derive, name: name.value.trim(), discipline: discipline.value.trim(), levelId: level.value, levelName: levelName.value.trim(), baseDrawingId: base.value || null, baseView: { visible: visible.checked, opacity: Number(opacity.value) / 100, print: print.checked, layers: layerInputs.filter(i => i.checked).map(i => i.value) } }); close(); } catch (e) { status.textContent = port.error(e); } };
      actions.append(cancel, apply);
      if (!derive && !floor.baseDrawingId) {
        const lineage = document.createElement('button'); lineage.type = 'button'; lineage.className = 'small-button'; lineage.textContent = L('공간 분할·통합 관계 기록…', 'Record space split/merge…');
        lineage.onclick = () => openLineage(floor.id); actions.prepend(lineage);
      }
      overlay.onclick = e => { if (e.target === overlay) close(); };
      overlay.onkeydown = e => {
        e.stopPropagation();
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        if (e.key === 'Tab') { const items = [...box.querySelectorAll('button,input,select')].filter(el => !el.disabled && el.getClientRects().length), i = items.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); items.at(-1)?.focus(); } else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0]?.focus(); } }
      };
      name.focus(); name.select(); return true;
    }
    function openLineage(floorId) {
      close(); previous = document.activeElement;
      overlay = document.createElement('div'); overlay.className = 'feature-backdrop';
      const box = document.createElement('section'); box.className = 'feature-dialog drawing-dialog'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', L('공간 계승 관계', 'Space lineage')); overlay.append(box); document.body.append(overlay);
      const heading = document.createElement('h2'); heading.textContent = box.getAttribute('aria-label');
      const note = document.createElement('p'); note.className = 'settings-section-copy'; note.textContent = L('벽과 새 공간을 먼저 작성한 뒤 기존 공간과 새 공간의 관계를 기록하세요. 기존 공간 표시는 종료하고 ID를 보존합니다. 벽 형상이나 시설관리 이력은 변경하지 않습니다.', 'Create the new boundaries and spaces first, then identify their predecessors. Parent space labels are retired with IDs retained. Wall geometry and facility business history are unchanged.'); box.append(heading, note);
      const kind = document.createElement('select'); kind.className = 'select-input'; kind.setAttribute('aria-label', L('관계 유형', 'Lineage kind'));
      for (const [id, label] of [['split', L('분할 · 1개 → 여러 공간', 'Split · one → several')], ['merge', L('통합 · 여러 공간 → 1개', 'Merge · several → one')]]) { const o = document.createElement('option'); o.value = id; o.textContent = label; kind.append(o); } box.append(kind);
      const spaces = port.state.objects.filter(o => o.type === 'space' && o.floorId === floorId), retired = (port.state.drawingModel?.retiredSpaceUuids || []).filter(id => port.state.drawingModel?.spaceOrigins?.[id] === floorId);
      function choices(label, items) { const fieldset = document.createElement('fieldset'), legend = document.createElement('legend'); legend.textContent = label; fieldset.append(legend); const inputs = []; for (const item of items) { const row = document.createElement('label'); row.className = 'settings-check-row'; const input = document.createElement('input'); input.type = 'checkbox'; input.value = item.id; row.append(input, document.createTextNode(item.name + ' · ' + item.id)); fieldset.append(row); inputs.push(input); } box.append(fieldset); return () => inputs.filter(x => x.checked).map(x => x.value); }
      const parents = choices(L('기존 공간', 'Parent spaces'), [...spaces.map(o => ({ id: o.spaceUuid, name: o.name || o.id })), ...retired.map(id => ({ id, name: L('종료된 공간', 'Retired space') }))]), children = choices(L('새 공간', 'Child spaces'), spaces.map(o => ({ id: o.spaceUuid, name: o.name || o.id })));
      const status = document.createElement('p'); status.setAttribute('role', 'status'); box.append(status);
      const actions = document.createElement('div'); actions.className = 'text-style-actions'; const cancel = document.createElement('button'); cancel.className = 'small-button'; cancel.textContent = L('취소', 'Cancel'); cancel.onclick = close;
      const apply = document.createElement('button'); apply.className = 'small-button primary'; apply.textContent = L('관계 기록', 'Record lineage'); apply.onclick = () => { try { port.lineage({ drawingId: floorId, kind: kind.value, parents: parents(), children: children() }); close(); } catch (e) { status.textContent = port.error(e); } }; actions.append(cancel, apply); box.append(actions); overlay.onkeydown = e => { e.stopPropagation(); if (e.key === 'Escape') close(); }; cancel.focus();
    }
    function summary(floor) {
      if (!floor?.baseDrawingId) return null;
      const wrap = document.createElement('div'); wrap.className = 'drawing-reference-summary'; wrap.dataset.baseDrawingId = floor.baseDrawingId;
      const base = port.state.floors.find(f => f.id === floor.baseDrawingId), status = root.planDrawings.referenceStatus(port.state, floor), rev = root.planDrawings.record(port.state, floor.baseDrawingId);
      const text = document.createElement('div'); text.className = 'settings-section-copy'; text.textContent = L('기준 · ', 'Base · ') + (base?.name || floor.baseDrawingId) + ' · ' + ({ current: L('현재 리비전', 'Current revision'), changed: L('기준 변경 · 영향 확인 필요', 'Base changed · review local placement'), missing: L('기준 누락 · 고유 요소 유지', 'Missing base · local elements retained') }[status] || status) + (rev ? ' r' + floor.baseRevision + ' → r' + rev.revision : ''); wrap.append(text);
      if (status === 'changed' && rev?.delta) { const delta = document.createElement('div'); delta.className = 'settings-section-copy'; delta.textContent = L('기준 비교 · ', 'Base delta · ') + '+' + rev.delta.added.length + ' / ~' + rev.delta.modified.length + ' / −' + rev.delta.deleted.length + L(' · 고유 요소의 위치·공간 관계를 확인하세요.', ' · Review local placement and space relations.'); wrap.append(delta); }
      const actions = document.createElement('div'); actions.className = 'floor-toolbar';
      const settings = document.createElement('button'); settings.className = 'small-button'; settings.textContent = L('참조 표시 설정', 'Reference display'); settings.onclick = () => open(floor.id); actions.append(settings);
      if (base) { const go = document.createElement('button'); go.className = 'small-button'; go.textContent = L('기준 도면 열기', 'Open base drawing'); go.onclick = () => port.activate(base.id); actions.append(go); }
      if (status === 'changed') { const review = document.createElement('button'); review.className = 'small-button'; review.textContent = L('변경 확인 기록', 'Acknowledge drawing change'); review.onclick = () => port.acknowledge(floor.id); actions.append(review); }
      wrap.append(actions); return wrap;
    }
    return { open, close, summary };
  }
  root.planDrawingUI = Object.freeze({ create });
})();
