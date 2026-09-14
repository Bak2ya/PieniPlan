(() => {
  'use strict';

  const messages = {
    en: {
      'action.new': 'New',
      'action.openReference': 'Open Reference',
      'action.fit': 'Fit',
      'action.add': 'Add',
      'action.cancel': 'Cancel',
      'action.applyScale': 'Apply scale',
      'action.scale': 'Scale',
      'action.all': 'Show all',
      'action.none': 'Hide all',
      'action.undo': 'Undo',
      'action.redo': 'Redo',
      'aria.drawingTools': 'Drawing tools',
      'aria.canvas': 'Drawing canvas',

      'context.tool': 'Tool',
      'context.select': 'Select',
      'context.line': 'Line',
      'context.wall': 'Wall',
      'context.measure': 'Distance',
      'context.delete': 'Delete',
      'context.calibration': 'Scale calibration',
      'context.length': 'Length',
      'context.angle': 'Angle',
      'context.thickness': 'Thickness',
      'hint.select': 'Click an object to inspect it.',
      'hint.calibrationFirst': 'Click the first point of a known distance.',
      'hint.calibrationSecond': 'Click the second point on the reference.',
      'hint.segmentStart': 'Click the start point.',
      'hint.segmentEnd': 'Click to place the endpoint, or type length/angle and press Enter.',
      'hint.measureFirst': 'Click the first point.',
      'hint.measureSecond': 'Click the second point to create a persistent measurement.',
      'hint.delete': 'Click an object to delete it.',

      'category.select': 'Select',
      'category.draw': 'Draw',
      'category.architecture': 'Architecture',
      'category.dimension': 'Dimension',
      'category.modify': 'Modify',

      'tool.select': 'Select',
      'tool.line': 'Line',
      'tool.polyline': 'Polyline',
      'tool.rectangle': 'Rectangle',
      'tool.circle': 'Circle / Arc',
      'tool.wall': 'Wall',
      'tool.door': 'Door',
      'tool.window': 'Window',
      'tool.space': 'Room / Space',
      'tool.measure': 'Distance',
      'tool.alignedDim': 'Aligned Dimension',
      'tool.angleDim': 'Angle',
      'tool.move': 'Move',
      'tool.copy': 'Copy',
      'tool.rotate': 'Rotate',
      'tool.trim': 'Trim / Extend',
      'tool.offset': 'Offset',
      'tool.delete': 'Delete',
      'tool.planned': 'planned',

      'empty.title': 'Start with a reference or draw from scratch.',
      'empty.copy': 'Open a DXF or image, then trace it using real-world coordinates.',
      'progress.readingDxf': 'Reading DXF…',

      'tab.layers': 'Layers',
      'tab.reference': 'Reference',
      'tab.properties': 'Properties',
      'panel.drawingLayers': 'Drawing layers',
      'panel.drawingLayersSub': 'Objects created in PieniPlan',
      'panel.references': 'References',
      'panel.referencesSub': 'DXF and image underlays',
      'panel.pdfPlanned': 'PDF reference tracing is planned after the workspace and coordinate model are validated.',
      'panel.properties': 'Properties',
      'panel.propertiesSub': 'Selected object or active tool',
      'panel.noReferences': 'No references yet. Add a DXF or image.',
      'panel.dxfLayers': 'DXF layers ({count})',
      'panel.opacity': 'Opacity',
      'panel.active': 'Active',
      'panel.objects': '{count} objects',
      'panel.entities': '{count} entities',
      'panel.unitUnspecified': 'unit unspecified → mm',

      'layer.drawing': 'Drawing',
      'layer.walls': 'Walls',
      'layer.dimensions': 'Dimensions',

      'property.type': 'Type',
      'property.layer': 'Layer',
      'property.length': 'Length',
      'property.angle': 'Angle',
      'property.thickness': 'Thickness',
      'property.start': 'Start',
      'property.end': 'End',
      'property.reference': 'Reference',
      'property.scale': 'Scale',
      'property.origin': 'Origin',
      'property.opacity': 'Opacity',
      'property.version': 'Version',
      'property.units': 'Units',
      'property.tool': 'Tool',
      'value.line': 'Line',
      'value.wall': 'Wall',
      'value.dimension': 'Dimension',
      'value.image': 'Image',

      'dialog.calibrate': 'Calibrate reference',
      'dialog.actualDistance': 'Actual distance (mm)',
      'dialog.calibrationCopy': 'The two picked points are currently {distance} mm apart. Enter the real-world distance; the reference will scale while the first picked point stays fixed.',

      'confirm.newDrawing': 'Start a new drawing? Current unsaved drawing objects and references will be cleared.',
      'alert.unsupportedReference': 'This build supports DXF and image references. PDF tracing will be added after the workspace model is validated.',

      'tooltip.shortcut': 'Shortcut',
      'tooltip.undo': 'Undo the last drawing change.',
      'tooltip.redo': 'Redo the last undone drawing change.',
      'tooltip.grid': 'Show or hide the drawing reference grid.',
      'tooltip.snap': 'Snap to precise points such as endpoints.',
      'tooltip.ortho': 'Constrain drawing to horizontal or vertical directions.',
      'tooltip.hideLayer': 'Hide this layer.',
      'tooltip.showLayer': 'Show this layer.',
      'tooltip.hideReference': 'Hide this reference.',
      'tooltip.showReference': 'Show this reference.',
      'tooltip.scaleReference': 'Match the reference scale using a known real-world distance.'
    },

    ko: {
      'action.new': '새 도면',
      'action.openReference': '참조 도면 열기',
      'action.fit': '화면 맞춤',
      'action.add': '추가',
      'action.cancel': '취소',
      'action.applyScale': '축척 적용',
      'action.scale': '축척',
      'action.all': '전체 표시',
      'action.none': '전체 숨김',
      'action.undo': '실행 취소',
      'action.redo': '다시 실행',
      'aria.drawingTools': '도면 도구',
      'aria.canvas': '도면 작업 영역',

      'context.tool': '도구',
      'context.select': '선택',
      'context.line': '선',
      'context.wall': '벽',
      'context.measure': '거리',
      'context.delete': '삭제',
      'context.calibration': '축척 보정',
      'context.length': '길이',
      'context.angle': '각도',
      'context.thickness': '두께',
      'hint.select': '객체를 클릭하면 속성을 확인할 수 있습니다.',
      'hint.calibrationFirst': '실제 거리를 알고 있는 구간의 첫 번째 점을 선택하세요.',
      'hint.calibrationSecond': '참조 도면에서 두 번째 점을 선택하세요.',
      'hint.segmentStart': '시작점을 클릭하세요.',
      'hint.segmentEnd': '끝점을 클릭하거나 길이/각도를 입력한 뒤 Enter를 누르세요.',
      'hint.measureFirst': '첫 번째 점을 클릭하세요.',
      'hint.measureSecond': '두 번째 점을 클릭하면 거리 치수가 만들어집니다.',
      'hint.delete': '삭제할 객체를 클릭하세요.',

      'category.select': '선택',
      'category.draw': '그리기',
      'category.architecture': '건축',
      'category.dimension': '치수',
      'category.modify': '수정',

      'tool.select': '선택',
      'tool.line': '선',
      'tool.polyline': '폴리라인',
      'tool.rectangle': '사각형',
      'tool.circle': '원 / 호',
      'tool.wall': '벽',
      'tool.door': '문',
      'tool.window': '창문',
      'tool.space': '공간 / 방',
      'tool.measure': '거리',
      'tool.alignedDim': '정렬 치수',
      'tool.angleDim': '각도',
      'tool.move': '이동',
      'tool.copy': '복사',
      'tool.rotate': '회전',
      'tool.trim': '자르기 / 연장',
      'tool.offset': '간격 복사',
      'tool.delete': '삭제',
      'tool.planned': '준비 중',

      'empty.title': '참조 도면을 열거나 빈 도면에서 시작하세요.',
      'empty.copy': 'DXF 또는 이미지를 불러온 뒤 실제 좌표와 치수에 맞춰 트레이싱할 수 있습니다.',
      'progress.readingDxf': 'DXF 읽는 중…',

      'tab.layers': '레이어',
      'tab.reference': '참조 도면',
      'tab.properties': '속성',
      'panel.drawingLayers': '도면 레이어',
      'panel.drawingLayersSub': 'PieniPlan에서 만든 객체',
      'panel.references': '참조 도면',
      'panel.referencesSub': 'DXF 및 이미지 밑그림',
      'panel.pdfPlanned': 'PDF 참조 도면 트레이싱은 작업공간과 좌표 모델을 검증한 뒤 추가할 예정입니다.',
      'panel.properties': '속성',
      'panel.propertiesSub': '선택한 객체 또는 현재 도구',
      'panel.noReferences': '참조 도면이 없습니다. DXF 또는 이미지를 추가하세요.',
      'panel.dxfLayers': 'DXF 레이어 ({count})',
      'panel.opacity': '불투명도',
      'panel.active': '활성',
      'panel.objects': '객체 {count}개',
      'panel.entities': '요소 {count}개',
      'panel.unitUnspecified': '단위 미지정 → mm',

      'layer.drawing': '도면',
      'layer.walls': '벽',
      'layer.dimensions': '치수',

      'property.type': '종류',
      'property.layer': '레이어',
      'property.length': '길이',
      'property.angle': '각도',
      'property.thickness': '두께',
      'property.start': '시작점',
      'property.end': '끝점',
      'property.reference': '참조 도면',
      'property.scale': '축척',
      'property.origin': '기준점',
      'property.opacity': '불투명도',
      'property.version': '버전',
      'property.units': '단위',
      'property.tool': '도구',
      'value.line': '선',
      'value.wall': '벽',
      'value.dimension': '치수',
      'value.image': '이미지',

      'dialog.calibrate': '참조 도면 축척 보정',
      'dialog.actualDistance': '실제 거리 (mm)',
      'dialog.calibrationCopy': '선택한 두 점의 현재 거리는 {distance} mm입니다. 실제 거리를 입력하면 첫 번째 점을 고정한 채 참조 도면의 크기를 맞춥니다.',

      'confirm.newDrawing': '새 도면을 시작할까요? 저장되지 않은 도면 객체와 참조 도면이 모두 지워집니다.',
      'alert.unsupportedReference': '현재 빌드에서는 DXF와 이미지 참조 도면을 지원합니다. PDF 트레이싱은 작업공간 모델을 검증한 뒤 추가할 예정입니다.',

      'tooltip.shortcut': '단축키',
      'tooltip.undo': '마지막 도면 변경을 취소합니다.',
      'tooltip.redo': '취소한 도면 변경을 다시 실행합니다.',
      'tooltip.grid': '도면 작업용 기준 격자를 표시하거나 숨깁니다.',
      'tooltip.snap': '끝점처럼 정확한 위치에 맞춰 그릴 수 있게 합니다.',
      'tooltip.ortho': '수평 또는 수직 방향으로만 그리도록 제한합니다.',
      'tooltip.hideLayer': '이 레이어를 숨깁니다.',
      'tooltip.showLayer': '이 레이어를 표시합니다.',
      'tooltip.hideReference': '이 참조 도면을 숨깁니다.',
      'tooltip.showReference': '이 참조 도면을 표시합니다.',
      'tooltip.scaleReference': '알고 있는 실제 거리로 참조 도면의 축척을 맞춥니다.'
    }
  };

  function resolveLanguage() {
    const forced = new URLSearchParams(location.search).get('lang');
    const candidates = forced ? [forced] : (navigator.languages?.length ? navigator.languages : [navigator.language]);
    for (const candidate of candidates) {
      const normalized = String(candidate || '').toLowerCase();
      if (normalized.startsWith('ko')) return 'ko';
      if (normalized.startsWith('en')) return 'en';
    }
    return 'en';
  }

  const language = resolveLanguage();

  function t(key, vars = {}) {
    let value = messages[language]?.[key] ?? messages.en[key] ?? key;
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
    return value;
  }

  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
  }

  document.documentElement.lang = language;
  window.PieniPlanI18n = { language, t, apply };
})();
