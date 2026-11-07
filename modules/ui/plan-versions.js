/* One focused change-drawing dialog and contextual existing-inspector content.
 * Publication, permissions, snapshots and camera policy belong to the host. */
(() => {
  'use strict';
  const M = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  function create(p) {
    const V = M.planVersions, L = (ko, en) => p.language() === 'ko' ? ko : en;
    const el = (tag, className = '', text = '') => { const node = document.createElement(tag); node.className = className; node.textContent = text; return node; };
    const button = (text, action, cls = 'small-button') => { const b = el('button', cls, text); b.type = 'button'; b.onclick = action; return b; };
    const label = (text, input) => { const l = el('label', 'plan-version-field'); l.append(el('span', '', text), input); return l; };
    const status = v => ({ planned: L('예정', 'Planned'), current: L('현재 적용', 'Applied'), past: L('과거 · 읽기 전용', 'Historical / read only'), draft: L('작업 중', 'Draft') })[V.status(v)];
    let dialog = null, closing = false, area = 'history'; const collapsed = new Set();
    function modalKeys(modal,e) {
      e.stopPropagation();
      if(e.key!=='Tab'||e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
      const controls=[...modal.querySelectorAll('button,input,select,textarea,a[href],summary,[tabindex]')].filter(n=>!n.disabled&&n.tabIndex>=0&&!n.closest('[inert]')&&n.getClientRects().length);
      if(!controls.length){e.preventDefault();modal.focus();return;}
      const first=controls[0],last=controls.at(-1),current=document.activeElement;
      if(!modal.contains(current)||e.shiftKey&&current===first||!e.shiftKey&&current===last){e.preventDefault();(e.shiftKey?last:first).focus();}
    }
    function disclosure(key, className, text) { const node = el('details', className); node.open = !collapsed.has(key); node.append(el('summary', '', text)); node.addEventListener('toggle', () => { if (node.isConnected) { if (node.open) collapsed.delete(key); else collapsed.add(key); } }); return node; }
    function close(force = false) {
      if (!dialog) return true;
      if (!force && dialog.__dirty()) {
        if (closing) return false; closing = true;
        const pending = dialog; Promise.resolve(p.confirmDiscard(pending)).then(yes => { closing = false; if (yes && dialog === pending) close(true); }).catch(err => { closing = false; p.notice?.(p.error(err)); }); return false;
      }
      const previous = dialog, focus = previous.__returnFocus; dialog = null;
      p.cancelConfirm?.(previous); previous.close(); previous.remove(); if (focus?.isConnected) focus.focus(); return true;
    }
    function openCreate() {
      if (!p.enabled()) return p.activate();
      if (dialog) return;
      if (p.beforeOpen?.() === false) return;
      const s = p.state(), current = V.row(s), token = p.token(); if (!current) return;
      const choices = s.drawingModel.versions.filter(v => v.levelId === current.levelId);
      dialog = el('dialog', 'plan-version-dialog'); const modal = dialog, returnFocus = document.activeElement;
      modal.__returnFocus = returnFocus;
      const title = el('h2', '', L('변경 도면 만들기', 'Create change drawing')); title.id = 'plan-version-create-title'; modal.setAttribute('aria-labelledby', title.id);
      const form = el('form', 'plan-version-form'); form.noValidate = true;
      const body = el('div', 'plan-version-body'), footer = el('div', 'plan-version-actions');
      const name = el('input', 'text-input'); name.type = 'text'; name.maxLength = 255; name.required = true; name.autofocus = true;
      name.placeholder = L('예: 2028년 증축 대안 B', 'For example: 2028 extension, alternative B');
      const description = el('textarea', 'text-input'); description.rows = 3; description.maxLength = 100000;
      const source = el('select', 'text-input');
      choices.forEach((v, i) => { const option = el('option', '', `${v.name} · ${v.modifiedDate || L('기준일 미지정', 'Date unspecified')} · ${status(v)} · ${i + 1}`); option.value = v.drawingId; source.append(option); });
      source.value = current.drawingId;
      const inheritance = el('fieldset', 'plan-version-inheritance'), legend = el('legend', '', L('승계할 항목', 'Items to inherit'));
      const selectActions = el('div', 'plan-version-inline-actions'), checks = el('div', 'plan-version-checks'), dependency = el('p', 'plan-version-note'); dependency.setAttribute('aria-live', 'polite');
      const modified = el('input', 'text-input'); modified.type = 'date'; modified.required = true; modified.value = p.today();
      const applied = el('input', 'text-input'); applied.type = 'date'; applied.setAttribute('aria-label', L('적용일', 'Application date'));
      const planned = el('input'); planned.type = 'checkbox';
      const dates = el('div', 'plan-version-dates'), appliedField = el('div', 'plan-version-field'), appliedHeading = el('span', 'plan-version-date-heading');
      const plannedLabel = el('label', 'plan-version-planned'); plannedLabel.append(planned, document.createTextNode(L('예정', 'Planned')));
      appliedHeading.append(document.createTextNode(L('적용일', 'Application date')), plannedLabel); appliedField.append(appliedHeading, applied);
      dates.append(label(L('수정일', 'Business modification date'), modified), appliedField);
      const error = el('p', 'plan-version-error'); error.setAttribute('role', 'alert');
      let selected = new Set(), fingerprint = null, base = null, signature = null;
      const cancel = button(L('취소', 'Cancel'), () => close());
      const submit = button(L('변경 도면 만들기', 'Create change drawing'), () => {}, 'toolbar-button primary'); submit.type = 'submit'; submit.disabled = true;
      footer.append(cancel, submit);
      const values = () => ({ name: name.value, description: description.value, sourceDrawingId: source.value, levelId: current.levelId,
        layerIds: [...selected].sort(), modifiedDate: modified.value, appliedDate: applied.value || null, planned: planned.checked, sourceFingerprint: fingerprint });
      const dirty = () => signature !== null && JSON.stringify(values()) !== signature;
      modal.__dirty = dirty;
      function recompute() {
        error.textContent = ''; submit.disabled = true;
        try {
          if (!p.current(token)) throw Error(L('문서가 바뀌었습니다. 창을 닫고 다시 열어 주세요.', 'The document changed. Reopen this dialog.'));
          const summary = p.inheritance(source.value, [...selected]);
          const automatic = summary.layers.filter(l => !selected.has(l.id)).map(l => l.name);
          dependency.textContent = automatic.length ? L('참조 무결성을 위해 함께 포함: ', 'Included to preserve references: ') + automatic.join(', ') : L('승계할 실제 객체 ', 'Objects to inherit: ') + summary.objects.length;
          for (const input of checks.querySelectorAll('input')) input.indeterminate = !selected.has(input.value) && summary.layers.some(l => l.id === input.value);
          V.date(modified.value, true); V.date(applied.value);
          submit.disabled = !name.value.trim() || name.value.trim().length > 255;
        } catch (e) { error.textContent = p.error(e); }
      }
      function loadSource() {
        checks.replaceChildren(); error.textContent = ''; selected = new Set();
        try {
          if (!p.current(token)) throw Error(L('문서가 바뀌었습니다.', 'The document changed.'));
          base = V.row(p.state(), source.value); if (!base || base.levelId !== current.levelId) throw Error('plan-versions:source');
          fingerprint = p.state().drawingModel.records[source.value].fingerprint;
          const actual = p.inheritance(source.value).counts.filter(l => l.count > 0);
          for (const item of actual) {
            selected.add(item.id); const input = el('input'); input.type = 'checkbox'; input.value = item.id; input.checked = true;
            const row = el('label', 'plan-version-check'); row.append(input, document.createTextNode(`${item.name} · ${item.count}`)); checks.append(row);
            input.onchange = () => { if (input.checked) selected.add(item.id); else selected.delete(item.id); recompute(); };
          }
          if (!actual.length) checks.append(el('p', 'plan-version-note', L('기준 도면에 승계할 객체가 없습니다. 빈 도면으로 만들 수 있습니다.', 'There are no source objects. An empty drawing can be created.')));
          recompute();
        } catch (e) { submit.disabled = true; error.textContent = p.error(e); }
      }
      selectActions.append(button(L('전체 선택', 'Select all'), () => { for (const input of checks.querySelectorAll('input')) { selected.add(input.value); input.checked = true; } recompute(); }),
        button(L('전체 해제', 'Clear all'), () => { selected.clear(); for (const input of checks.querySelectorAll('input')) input.checked = false; recompute(); }));
      inheritance.append(legend, selectActions, checks, dependency);
      body.append(label(L('도면 이름', 'Drawing name'), name), label(L('변경 내용', 'Change description'), description), label(L('기준 도면', 'Source drawing'), source), inheritance, dates, error);
      form.append(body, footer); modal.append(title, form); document.body.append(modal);
      source.onchange = loadSource;
      for (const input of [name, description, modified, applied, planned]) input.addEventListener('input', recompute);
      form.onsubmit = e => {
        e.preventDefault(); recompute(); if (submit.disabled) return;
        try {
          if (!p.current(token)) throw Error('plan-versions:stale-context');
          submit.disabled = true; p.create(values(), token); close(true);
        } catch (err) { recompute(); error.textContent = p.error(err); }
      };
      modal.addEventListener('cancel', e => { e.preventDefault(); close(); });
      modal.addEventListener('keydown', e => modalKeys(modal,e));
      loadSource(); signature = JSON.stringify(values()); modal.showModal(); name.focus();
    }
    function openLineage() {
      if (!p.enabled() || dialog || !p.lineage || V.readonly(p.state()) || p.beforeOpen?.() === false) return;
      const s = p.state(), v = V.row(s), token = p.token(), ancestry = [v.drawingId]; let cursor = v;
      while (cursor.sourceDrawingId) { ancestry.push(cursor.sourceDrawingId); cursor = V.row(s, cursor.sourceDrawingId); }
      dialog = el('dialog', 'plan-version-dialog'); const modal = dialog; modal.__returnFocus = document.activeElement;
      const title = el('h2', '', L('공간 분할·병합 관계', 'Space split / merge relationships')); title.id = 'plan-version-lineage-title'; modal.setAttribute('aria-labelledby', title.id);
      const form = el('form', 'plan-version-form'), body = el('div', 'plan-version-body'), footer = el('div', 'plan-version-actions');
      const note = el('p', 'plan-version-note', L('벽과 새 공간을 먼저 작성한 뒤 연결하세요. 현재 도면의 기존 공간 표시는 종료하고 원본·공간 식별자·마지막 형상은 보존합니다. 벽을 자동으로 분할하거나 병합하지 않습니다.', 'Create the new boundaries and spaces first. Parent labels in this drawing are retired while original drawings, identities and last geometry remain. This does not automatically split or merge walls.'));
      const kind = el('select', 'text-input'); kind.setAttribute('aria-label', L('관계 유형', 'Relationship kind'));
      for (const [value, text] of [['split', L('분할 · 1개 → 여러 공간', 'Split / one to several')], ['merge', L('병합 · 여러 공간 → 1개', 'Merge / several to one')]]) { const option = el('option', '', text); option.value = value; kind.append(option); } kind.value = 'split';
      const parents = new Set(), children = new Set(), error = el('p', 'plan-version-error'); error.setAttribute('role', 'alert');
      const signature = () => JSON.stringify([kind.value, [...parents].sort(), [...children].sort()]), initial = signature(); modal.__dirty = () => signature() !== initial;
      const submit = button(L('관계 기록', 'Record relationships'), () => {}, 'toolbar-button primary'); submit.type = 'submit'; submit.disabled = true;
      const refresh = () => { error.textContent = ''; submit.disabled = true;
        if (!p.current(token)) { error.textContent = L('문서가 바뀌었습니다. 다시 열어 주세요.', 'The document changed. Reopen this dialog.'); return; }
        if ([...parents].some(id => children.has(id))) { error.textContent = L('기존 공간과 새 공간은 서로 달라야 합니다.', 'Parent and child spaces must be different.'); return; }
        submit.disabled = !(kind.value === 'split' ? parents.size === 1 && children.size >= 2 : parents.size >= 2 && children.size === 1);
      };
      function choices(title, items, selected, label) {
        const field = el('fieldset', 'plan-version-inheritance'); field.append(el('legend', '', title));
        for (const item of items) { const input = el('input'); input.type = 'checkbox'; input.value = item.spaceUuid; input.setAttribute('aria-label', label + ': ' + item.name);
          input.onchange = () => { if (input.checked) selected.add(item.spaceUuid); else selected.delete(item.spaceUuid); refresh(); }; const row = el('label', 'plan-version-check'); row.append(input, document.createTextNode(item.name)); field.append(row);
        }
        if (!items.length) field.append(el('p', 'plan-version-note', L('해당 공간이 없습니다.', 'There are no eligible spaces.'))); return field;
      }
      const parentOptions = Object.entries(s.drawingModel.spaceRegistry).flatMap(([uuid, entry]) => {
        const item = ancestry.map(id => Object.values(entry.instances).find(i => i.drawingId === id)).find(Boolean); if (!item) return [];
        return [{ spaceUuid: uuid, name: `${item.snapshot.name || uuid} · ${item.excluded ? L('종료됨', 'Retired') : item.drawingId === v.drawingId ? L('현재 도면', 'This drawing') : L('기준 이력', 'Source history')} · ${uuid}` }];
      });
      const childOptions = V.objects(s, v.drawingId).filter(o => o.type === 'space' && v.origins[o.id].sourceObjectId === null && V.editable(s, o)).map(o => ({ spaceUuid: o.spaceUuid, name: `${o.name || o.spaceUuid} · ${o.spaceUuid}` }));
      body.append(note, label(L('관계 유형', 'Relationship kind'), kind), choices(L('기존 공간', 'Parent spaces'), parentOptions, parents, 'parent'), choices(L('새 공간', 'Child spaces'), childOptions, children, 'child'), error);
      footer.append(button(L('취소', 'Cancel'), () => close()), submit); form.append(body, footer); modal.append(title, form); document.body.append(modal);
      kind.onchange = refresh; form.onsubmit = e => { e.preventDefault(); refresh(); if (submit.disabled) return;
        try { p.lineage({ drawingId: v.drawingId, kind: kind.value, parents: [...parents], children: [...children] }, token); close(true); } catch (err) { refresh(); error.textContent = p.error(err); }
      };
      modal.addEventListener('cancel', e => { e.preventDefault(); close(); }); modal.addEventListener('keydown', e => modalKeys(modal,e)); refresh(); modal.showModal(); kind.focus();
    }
    function openCompare() {
      if (!p.enabled() || dialog || !p.compare || !p.comparisonView || p.beforeOpen?.() === false) return;
      const s = p.state(), current = V.row(s), choices = s.drawingModel.versions.filter(v => v.levelId === current.levelId), token = p.token();
      if (choices.length < 2) return;
      dialog = el('dialog','plan-version-dialog plan-comparison-dialog'); const modal = dialog; modal.__returnFocus = document.activeElement; modal.__dirty = () => false;
      const title = el('h2','',L('도면 버전 비교 · 읽기 전용','Compare drawing versions / read only')); title.id = 'plan-version-comparison-title'; modal.setAttribute('aria-labelledby',title.id);
      const body = el('div','plan-version-body'), controls = el('div','plan-version-dates'), before = el('select','text-input'), after = el('select','text-input'), mode = el('select','text-input');
      const labelVersion = v => `${v.name} · ${v.modifiedDate || '—'} / ${v.appliedDate || '—'} · ${status(v)}`;
      for (const v of choices) for (const select of [before,after]) { const option = el('option','',labelVersion(v)); option.value = v.drawingId; select.append(option); }
      before.value = current.sourceDrawingId || choices.find(v => v.drawingId !== current.drawingId).drawingId; after.value = current.drawingId;
      for (const [value,text] of [['overlay',L('중첩 비교','Overlay')],['split',L('좌우 비교','Side by side')]]) { const option = el('option','',text); option.value = value; mode.append(option); } mode.value = 'overlay';
      controls.append(label(L('기준 도면','Before'),before),label(L('비교 도면','After'),after));
      const layers = el('fieldset','plan-version-inheritance'), checks = el('div','plan-version-compare-layers'), note = el('p','plan-version-note',L('공간·도면 객체를 같은 좌표로 비교합니다. 객체 계보와 정규화된 형상 입력을 구분하며, 기하 위상 동일성·물리적 충돌 판정은 하지 않습니다. CAD·PDF 배경은 원본 데이터 일치 여부를 별도로 표시합니다.','Drawing objects share a common coordinate view. Root identity and normalized geometry inputs are compared separately; this is not topological equality or physical collision detection. CAD/PDF source-data equality is reported separately.'));
      layers.append(el('legend','',L('비교할 레이어','Comparison layers')),checks);
      const summary = el('p','plan-version-note'), error = el('p','plan-version-error'); error.setAttribute('role','alert'); const preview = el('div','plan-version-comparison-preview'), details = el('details','plan-version-comparison-details'); details.append(el('summary','',L('객체별 비교 결과','Object comparison details')));
      const items = el('div'); details.append(items); let selected = new Set();
      const names = {added:L('추가','Added'),removed:L('제외','Removed'),modified:L('변경','Modified'),same:L('동일 기술 데이터','Same technical data'),unverified:L('형상 판정 보류','Geometry unverified')};
      function refresh(reset = false) {
        error.textContent = ''; preview.replaceChildren(); items.replaceChildren(); summary.textContent = '';
        try {
          if (!p.current(token)) throw Error(L('문서가 바뀌었습니다. 창을 다시 열어 주세요.','The document changed. Reopen this dialog.'));
          const result = p.compare(before.value,after.value,null);
          if (reset) { selected = new Set(result.layers.map(l => l.id)); checks.replaceChildren();
            for (const layer of result.layers) { const input = el('input'); input.type = 'checkbox'; input.checked = true; input.value = layer.id; input.onchange = () => { if (input.checked) selected.add(layer.id); else selected.delete(layer.id); refresh(); }; const row = el('label','plan-version-check'); row.append(input,document.createTextNode(layer.name)); checks.append(row); }
          }
          const compared = p.compare(before.value,after.value,[...selected]), measured = [p.comparisonView(before.value,[...selected],{measureOnly:true}),p.comparisonView(after.value,[...selected],{measureOnly:true})], ranges = measured.map(v => v.bounds).filter(Boolean);
          const commonScale=ranges.length?Math.max(1,Math.max(...ranges.map(b=>b.maxx))-Math.min(...ranges.map(b=>b.minx)),Math.max(...ranges.map(b=>b.maxy))-Math.min(...ranges.map(b=>b.miny)))/200:1,views=[p.comparisonView(before.value,[...selected],{scale:commonScale}),p.comparisonView(after.value,[...selected],{scale:commonScale})];
          summary.textContent = Object.entries(compared.counts).map(([k,n])=>`${names[k]} ${n}`).join(' · ') + ' / ' + L('배경: ','Background: ') + ({'same-source-data':L('동일 원본 데이터','Same source data'),'different-source-data':L('원본 데이터 다름','Different source data'),unverified:L('미확인','Unverified')})[compared.background];
          if (views.some(v => v.objectCount !== v.boundedCount)) summary.textContent += L(' · 일부 객체의 표시 범위를 계산하지 못했습니다.',' / Some object bounds could not be evaluated.');
          const minx = ranges.length ? Math.min(...ranges.map(b=>b.minx)) : 0, maxx = ranges.length ? Math.max(...ranges.map(b=>b.maxx)) : 1000, miny = ranges.length ? Math.min(...ranges.map(b=>b.miny)) : 0, maxy = ranges.length ? Math.max(...ranges.map(b=>b.maxy)) : 1000, pad = Math.max(50,maxx-minx,maxy-miny)*.06, viewBox = [minx-pad,-maxy-pad,Math.max(1,maxx-minx)+2*pad,Math.max(1,maxy-miny)+2*pad].join(' ');
          const groups = views.map((v,i)=>{const group = el('div','plan-comparison-pane'); group.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="${viewBox}">${v.markup}</svg>`; const svg = group.querySelectorAll('svg')[0]; if(svg)svg.setAttribute('aria-label',i?L('비교 도면','After drawing'):L('기준 도면','Before drawing'));
            const byId = new Map(compared.items.map(item => [i?item.afterId:item.beforeId,item])); for(const node of group.querySelectorAll('g')) { const item = byId.get(node.getAttribute('data-object-id')); if(item) {node.setAttribute('data-comparison-status',item.status);node.setAttribute('data-comparison-side',i?'after':'before');} } return group; });
          preview.className = 'plan-version-comparison-preview ' + (mode.value === 'split'?'is-split':'is-overlay'); preview.append(...groups);
          for(const item of compared.items){const text = `${names[item.status]} · ${item.rootObjectId} · ${item.geometry === 'same-representation'?L('동일 형상 입력','Same geometry inputs'):item.geometry === 'different-representation'?L('형상 입력 다름','Different geometry inputs'):item.geometry === 'not-paired'?L('대응 객체 없음','No paired object'):L('정확한 형상 비교 미확인','Exact shape comparison unverified')}`;items.append(el('p','plan-version-note',text));}
        } catch(e) { error.textContent = p.error(e); }
      }
      before.onchange = after.onchange = () => refresh(true); mode.onchange = () => refresh();
      const footer = el('div','plan-version-actions'); footer.append(button(L('닫기','Close'),()=>close())); body.append(controls,label(L('표시 방식','Display mode'),mode),layers,note,summary,error,preview,details); modal.append(title,body,footer);document.body.append(modal);
      modal.addEventListener('cancel',e=>{e.preventDefault();close();});modal.addEventListener('keydown',e=>modalKeys(modal,e));refresh(true);modal.showModal();before.focus();
    }
    function render(controls, list) {
      if (!p.enabled()) { controls.append(button(L('날짜별 도면 관리 시작', 'Enable dated drawings'), p.activate)); return false; }
      const s = p.state(), v = V.row(s); if (!v) return false;
      const toolbar = el('div', 'floor-toolbar');
      toolbar.append(button(L('도면 이력', 'Drawing history'), () => { area = 'history'; p.refresh(); }), button(L('레이어', 'Layers'), () => { area = 'layers'; p.refresh(); }), button(L('변경 도면 만들기', 'Create change drawing'), openCreate));
      controls.append(toolbar, el('p', 'plan-version-current', `${v.name} · ${status(v)} · ${v.modifiedDate || L('수정일 미지정', 'Modification date unspecified')} / ${v.appliedDate || L('적용일 미지정', 'Application date unspecified')}`));
      if(p.compare && p.comparisonView){const compare=button(L('도면 비교','Compare drawings'),openCompare);compare.disabled=s.drawingModel.versions.filter(x=>x.levelId===v.levelId).length<2;controls.append(compare);}
      if (p.enableBackgrounds) {
        const fixed = p.backgroundsEnabled?.(), background = button(fixed ? L('CAD 배경 갱신', 'Refresh CAD background') : L('도면별 참조 배경 고정', 'Preserve version backgrounds'), () => fixed ? p.refreshBackground() : p.enableBackgrounds());
        background.disabled = Boolean(fixed && V.readonly(s)); controls.append(background);
        controls.append(el('p', 'plan-version-note', fixed ? L('참조 배경은 도면별로 보존됩니다.', 'Background sources are preserved per drawing.') : L('이 파일의 배경은 아직 공유 상태입니다. 도면별 고정이 필요합니다.', 'This file still uses shared backgrounds. Capture per-drawing sources.')));
      }
      if (p.lineage) { const lineage = button(L('공간 분할·병합 관계', 'Space relationships'), openLineage); lineage.disabled = V.readonly(s); controls.append(lineage); }
      if (V.readonly(s)) controls.append(el('p', 'plan-version-note', L('읽기 전용 · 변경 도면을 만들어 수정할 수 있습니다.', 'Read only / Create a change drawing to edit.')));
      if (area === 'history') {
        if (p.addBuilding) controls.append(button(L('건물 추가', 'Add building'), () => p.addBuilding()));
        for (const building of s.buildings) {
          const card = disclosure('building:' + building.id, 'plan-version-building', building.name);
          if (p.addLevel) card.append(button(L('층 추가', 'Add floor'), () => p.addLevel(building.id)));
          for (const level of s.drawingModel.levels.filter(l => l.buildingId === building.id)) {
            const group = disclosure('level:' + level.id, 'plan-version-level', level.name);
            const versions = s.drawingModel.versions.filter(x => x.levelId === level.id).slice().sort((a, b) => (a.appliedDate || a.modifiedDate || '').localeCompare(b.appliedDate || b.modifiedDate || '') || a.createdAt.localeCompare(b.createdAt));
            versions.forEach((item, i) => {
              const entry = el('div', 'plan-version-history-entry');
              const choose = button(`${item.name} · ${status(item)} · ${item.modifiedDate || '—'} / ${item.appliedDate || '—'} · ${i + 1}`, () => p.select(item.drawingId), 'floor-main small-button');
              choose.setAttribute('aria-current', String(item.drawingId === s.activeFloorId)); entry.append(choose);
              if (!item.current) entry.append(button(L('실제 적용 확정', 'Mark as applied'), () => p.apply(item.drawingId)));
              group.append(entry);
              if (item.drawingId === s.activeFloorId && p.selectObject) {
                const spaces = V.objects(s, item.drawingId).filter(o => o.type === 'space' && V.visible(s, o));
                if (spaces.length) { const list = el('div', 'plan-version-space-list');
                  for (const space of spaces) list.append(button(p.objectLabel?.(space) || space.name || L('공간', 'Space'), () => p.selectObject(space.id), 'floor-main small-button'));
                  group.append(list);
                }
              }
            }); card.append(group);
          }
          list.append(card);
        }
      } else {
        const active = v.layers.find(l => l.id === v.activeLayerId);
        list.append(el('p', 'plan-version-note', L('현재 편집 레이어: ', 'Current editing layer: ') + (active?.name || L('도구 기본값', 'Tool default')) + (v.activeLayerExplicit ? '' : L(' · 자동', ' / automatic'))));
        for (const group of V.groups) {
          const block = disclosure(v.drawingId + ':group:' + group.id, 'plan-version-layer-group', L(group.ko, group.en));
          for (const l of v.layers.filter(l => l.group === group.id)) {
            const line = el('div', 'plan-version-layer-row'), choose = el('input'); choose.type = 'radio'; choose.name = 'plan-version-active-layer'; choose.checked = l.id === v.activeLayerId;
            choose.disabled = V.readonly(s) || l.locked || !l.visible; choose.setAttribute('aria-label', L('편집 레이어 선택: ', 'Edit layer: ') + l.name); choose.onchange = () => p.activeLayer(l.id);
            const count = V.objects(s, v.drawingId).filter(o => v.assignments[o.id] === l.id).length;
            const name = el('input', 'text-input'); name.type = 'text'; name.value = l.name; name.maxLength = 255; name.disabled = V.readonly(s) || !p.renameLayer; name.setAttribute('aria-label', L('레이어 이름', 'Layer name')); name.onchange = () => p.renameLayer?.(l.id, name.value);
            const eye = el('input'); eye.type = 'checkbox'; eye.checked = l.visible; eye.setAttribute('aria-label', L('표시: ', 'Visible: ') + l.name); eye.onchange = () => p.layer(l.id, { visible: eye.checked });
            const lock = el('input'); lock.type = 'checkbox'; lock.checked = l.locked; lock.setAttribute('aria-label', L('잠금: ', 'Locked: ') + l.name); lock.onchange = () => p.layer(l.id, { locked: lock.checked });
            line.append(choose, name, el('span', '', String(count)), label(L('표시', 'Visible'), eye), label(L('잠금', 'Lock'), lock));
            if (p.assign) { const move = button(L('선택 객체 배치', 'Place selected objects'), () => p.assign(l.id)); move.disabled = V.readonly(s) || l.locked || !l.visible || !p.selectionIds?.().length; line.append(move); }
            block.append(line);
          }
          const add = button(L('레이어 추가', 'Add layer'), () => p.addLayer(group.id)); add.disabled = V.readonly(s); block.append(add); list.append(block);
        }
      }
      return true;
    }
    return Object.freeze({ render, openCreate, openLineage, openCompare, close, get active() { return Boolean(dialog); } });
  }
  M.planVersionsUI = Object.freeze({ create });
})();
