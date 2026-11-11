/* Preserved CAD130 IDs and navigation links. Not completion promotion. */
(()=>{
'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
M.cadFeatureMap=Object.freeze([
 {
  "id": "C01",
  "label": "LINE 연속 숫자 좌표",
  "implementation": "구현·검증 완료",
  "commands": [
   "LINE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C02",
  "label": "LINE Close/Undo/이전 끝점 이어가기",
  "implementation": "구현·검증 완료",
  "commands": [
   "LINE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C03",
  "label": "PLINE 직선·Close·한 객체",
  "implementation": "구현·검증 완료",
  "commands": [
   "PLINE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C04",
  "label": "PLINE 호·폭·길이 옵션",
  "implementation": "구현·검증 완료",
  "commands": [
   "PLINE",
   "PLINEWID",
   "PLINEGEN"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C05",
  "label": "RECTANG 대각 두 점",
  "implementation": "구현·검증 완료",
  "commands": [
   "RECTANGLE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C06",
  "label": "RECTANG Dimensions/Area/Rotation 등",
  "implementation": "구현·검증 완료",
  "commands": [
   "RECTANGLE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C07",
  "label": "CIRCLE 중심/반지름",
  "implementation": "구현·검증 완료",
  "commands": [
   "CIRCLE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C08",
  "label": "CIRCLE Diameter/2P/3P/TTR",
  "implementation": "구현·검증 완료",
  "commands": [
   "CIRCLE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C09",
  "label": "ARC 3점",
  "implementation": "구현·검증 완료",
  "commands": [
   "ARC"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C10",
  "label": "ARC 중심·각도·반지름·접선 계속",
  "implementation": "구현·검증 완료",
  "commands": [
   "ARC"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N01",
  "label": "끝점",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N02",
  "label": "중간점",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N03",
  "label": "중심점",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N04",
  "label": "교차점",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N05",
  "label": "기준점에서 수직점",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N06",
  "label": "독립 그리드 스냅 F9",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N07",
  "label": "Shift+우클릭 단일 객체 스냅 선택",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N08",
  "label": "스냅 유형별 running 설정/후보 Tab",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N09",
  "label": "Tangent/Quadrant/Node 등 확장 스냅",
  "implementation": "부분 구현",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N10",
  "label": "획득점 유지·Object Snap Tracking/F11",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N11",
  "label": "ORTHO 기본 축 제한",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "N12",
  "label": "Polar 각도/설정",
  "implementation": "구현·검증 완료",
  "commands": [
   "POLARMODE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "I01",
  "label": "절대·@상대·거리<각도 좌표",
  "implementation": "구현·검증 완료",
  "commands": [
   "UCS"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "I02",
  "label": "직접 거리 입력",
  "implementation": "부분 구현",
  "commands": [
   "LINE",
   "MOVE",
   "COPY",
   "PEDIT",
   "DIMTEDIT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "I03",
  "label": "<각도 일시 잠금",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "I04",
  "label": "커서 근처 동적 입력/F12/Tab",
  "implementation": "부분 구현",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "S01",
  "label": "좌→우 Window / 우→좌 Crossing",
  "implementation": "구현·검증 완료",
  "commands": [
   "SELECT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "S02",
  "label": "Shift로 선택 제거",
  "implementation": "구현·검증 완료",
  "commands": [
   "SELECT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "S03",
  "label": "연속 단일 클릭의 선택 추가",
  "implementation": "구현·검증 완료",
  "commands": [
   "SELECT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "S04",
  "label": "Fence/Window polygon/Crossing polygon",
  "implementation": "구현·검증 완료",
  "commands": [
   "SELECT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G01",
  "label": "일반 polyline 꼭짓점 한 개 편집",
  "implementation": "구현·검증 완료",
  "commands": [
   "PEDIT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G02",
  "label": "Shift 다중 그립",
  "implementation": "구현·검증 완료",
  "commands": [
   "GRIPOBJLIMIT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G03",
  "label": "중점/다기능 그립·Ctrl 옵션",
  "implementation": "부분 구현",
  "commands": [
   "GRIPMULTIFUNCTIONAL",
   "PEDIT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G04",
  "label": "활성 그립 Enter/Space 모드 순환·Ctrl 복사",
  "implementation": "구현·검증 완료",
  "commands": [
   "GRIPMULTIFUNCTIONAL"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G05",
  "label": "다중 객체 그립",
  "implementation": "부분 구현",
  "commands": [
   "GRIPOBJLIMIT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G06",
  "label": "Crossing STRETCH로 사각형 폭 수정",
  "implementation": "부분 구현",
  "commands": [
   "STRETCH"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "T01",
  "label": "MOVE 기본 기준점/대상점",
  "implementation": "구현·검증 완료",
  "commands": [
   "MOVE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "T02",
  "label": "COPY 기본 및 반복 모드",
  "implementation": "구현·검증 완료",
  "commands": [
   "COPY"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "T03",
  "label": "ROTATE 기본 및 Reference/Copy",
  "implementation": "구현·검증 완료",
  "commands": [
   "ROTATE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "T04",
  "label": "SCALE 기본 및 포인터/Reference/Copy",
  "implementation": "구현·검증 완료",
  "commands": [
   "SCALE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "T05",
  "label": "MIRROR 원본 보존/삭제 선택",
  "implementation": "구현·검증 완료",
  "commands": [
   "MIRROR"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "K01",
  "label": "Shift 임시 ORTHO",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "K02",
  "label": "F8/F10 상호 배타",
  "implementation": "구현·검증 완료",
  "commands": [
   "POLARMODE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "K03",
  "label": "F3/F7 기본 기능",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "K04",
  "label": "F2/F9/F11/F12 기본 기능 경로",
  "implementation": "구현·검증 완료",
  "commands": [
   "TEXTSCR",
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "K05",
  "label": "Alt 일시 스냅 해제",
  "implementation": "의도적 차이",
  "commands": [],
  "surface": "캔버스: 기존 임시 스냅 조작 규칙",
  "kind": "existing-surface"
 },
 {
  "id": "K06",
  "label": "Space/Enter 확인·반복과 Plan 선택 복귀",
  "implementation": "부분 구현",
  "commands": [
   "SELECT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "K07",
  "label": "Esc 취소·명령 전환·Undo/Redo",
  "implementation": "부분 구현",
  "commands": [
   "UNDO",
   "REDO"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "K08",
  "label": "우클릭 상황별 메뉴/시간 민감 Enter",
  "implementation": "구현·검증 완료",
  "commands": [
   "SELECT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "K09",
  "label": "개인 별칭·키 조합·재시작·예약키",
  "implementation": "부분 구현",
  "commands": [],
  "surface": "설정 > 조작 > 명령 별칭·키 조합",
  "kind": "existing-surface"
 },
 {
  "id": "K10",
  "label": "편집창 공백·IME·일반 시스템 키",
  "implementation": "부분 구현",
  "commands": [
   "TEXT",
   "MTEXT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "K11",
  "label": "Space+drag 화면 이동",
  "implementation": "의도적 차이",
  "commands": [],
  "surface": "캔버스: Space+드래그 화면 이동",
  "kind": "existing-surface"
 },
 {
  "id": "K12",
  "label": "일반 CAD 기본 별칭 T/CH/DLI",
  "implementation": "구현·검증 완료",
  "commands": [
   "TEXT",
   "MTEXT",
   "CHAMFER",
   "DIMLINEAR",
   "DIMALIGNED"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "A11",
  "label": "ELLIPSE/타원호 생성",
  "implementation": "구현·검증 완료",
  "commands": [
   "ELLIPSE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "A12",
  "label": "POLYGON 정다각형",
  "implementation": "구현·검증 완료",
  "commands": [
   "POLYGON",
   "POLYSIDES"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "A13",
  "label": "XLINE/RAY 구성선",
  "implementation": "구현·검증 완료",
  "commands": [
   "XLINE",
   "RAY"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "A14",
  "label": "생성 미리보기·종료·취소",
  "implementation": "부분 구현",
  "commands": [
   "LINE",
   "PLINE",
   "RECTANGLE",
   "CIRCLE",
   "ARC",
   "ELLIPSE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "B13",
  "label": "Nearest/가까운 점",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "B14",
  "label": "Geometric Center",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "B15",
  "label": "Extension snap/추적선",
  "implementation": "구현·검증 완료",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "B16",
  "label": "화면 확대와 스냅 허용 오차",
  "implementation": "검증 보류",
  "commands": [
   "OSNAP"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "B17",
  "label": "UCS와 좌표·기준 축",
  "implementation": "구현·검증 완료",
  "commands": [
   "UCS"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C13",
  "label": "겹친 객체·선택 순서·그리기 순서",
  "implementation": "구현·검증 완료",
  "commands": [
   "SELECTIONCYCLING"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C14",
  "label": "폴리라인 정점 추가·삭제",
  "implementation": "구현·검증 완료",
  "commands": [
   "PEDIT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C15",
  "label": "Previous/Last/Similar 선택",
  "implementation": "구현·검증 완료",
  "commands": [
   "SELECTPREVIOUS",
   "SELECTLAST",
   "SELECTSIMILAR",
   "SELECTSIMILARMODE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "C16",
  "label": "선택 우클릭·Esc",
  "implementation": "구현·검증 완료",
  "commands": [
   "SELECT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D11",
  "label": "TRIM",
  "implementation": "구현·검증 완료",
  "commands": [
   "TRIM"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D12",
  "label": "EXTEND",
  "implementation": "구현·검증 완료",
  "commands": [
   "EXTEND"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D13",
  "label": "OFFSET 거리·방향·반복",
  "implementation": "부분 구현",
  "commands": [
   "OFFSET"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D14",
  "label": "FILLET",
  "implementation": "부분 구현",
  "commands": [
   "FILLET",
   "FILLETPOLYARC"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D15",
  "label": "CHAMFER",
  "implementation": "부분 구현",
  "commands": [
   "CHAMFER"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D16",
  "label": "BREAK",
  "implementation": "구현·검증 완료",
  "commands": [
   "BREAK"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D17",
  "label": "JOIN",
  "implementation": "부분 구현",
  "commands": [
   "JOIN"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D18",
  "label": "EXPLODE",
  "implementation": "부분 구현",
  "commands": [
   "EXPLODE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D19",
  "label": "ARRAY",
  "implementation": "부분 구현",
  "commands": [
   "ARRAY",
   "ARRAYEDIT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D20",
  "label": "ALIGN",
  "implementation": "구현·검증 완료",
  "commands": [
   "ALIGN"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D21",
  "label": "LENGTHEN",
  "implementation": "구현·검증 완료",
  "commands": [
   "LENGTHEN"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D22",
  "label": "PEDIT 전용 편집 명령",
  "implementation": "부분 구현",
  "commands": [
   "PEDIT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D23",
  "label": "ERASE·복원·Undo/Redo",
  "implementation": "구현·검증 완료",
  "commands": [
   "ERASE",
   "OOPS",
   "UNDO",
   "REDO"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D24",
  "label": "명령 원자성·실패 rollback",
  "implementation": "부분 구현",
  "commands": [
   "UNDO",
   "REDO"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D25",
  "label": "곡선 복원 편의 기능",
  "implementation": "의도적 차이",
  "commands": [
   "CURVERECONSTRUCT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "D26",
  "label": "MATCHPROP 속성 일치",
  "implementation": "부분 구현",
  "commands": [
   "MATCHPROP",
   "MATCHPROPSETTINGS"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E01",
  "label": "레이어 생성·삭제·이름",
  "implementation": "구현·검증 완료",
  "commands": [
   "LAYER",
   "-LAYER"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E02",
  "label": "현재 레이어",
  "implementation": "구현·검증 완료",
  "commands": [
   "LAYER",
   "-LAYER"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E03",
  "label": "레이어 표시·잠금·영역",
  "implementation": "부분 구현",
  "commands": [
   "LAYER",
   "-LAYER"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E04",
  "label": "레이어 색상·선종류·선가중치",
  "implementation": "부분 구현",
  "commands": [
   "LAYER",
   "-LAYER",
   "LTSCALE",
   "CELTSCALE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E05",
  "label": "ByLayer·객체 override",
  "implementation": "부분 구현",
  "commands": [
   "SETBYLAYER",
   "SETBYLAYERMODE",
   "CETRANSPARENCY"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E06",
  "label": "객체 레이어 이동",
  "implementation": "구현·검증 완료",
  "commands": [
   "LAYER",
   "PROPERTIES"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E07",
  "label": "레이어 검색·필터",
  "implementation": "부분 구현",
  "commands": [
   "LAYERFILTER"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E08",
  "label": "다중 객체 속성",
  "implementation": "부분 구현",
  "commands": [
   "BATCHPROPERTIES"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E09",
  "label": "블록 생성·기준점",
  "implementation": "부분 구현",
  "commands": [
   "BLOCK",
   "WBLOCK"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E10",
  "label": "블록 삽입·회전·축척·반복",
  "implementation": "구현·검증 완료",
  "commands": [
   "INSERT",
   "BLOCKS"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E11",
  "label": "블록 정의 편집",
  "implementation": "부분 구현",
  "commands": [
   "BEDIT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E12",
  "label": "중첩 블록·분해",
  "implementation": "부분 구현",
  "commands": [
   "BLOCKS",
   "EXPLODE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "E13",
  "label": "외부 DWG XREF 관리",
  "implementation": "범위 밖",
  "commands": [],
  "surface": "명시적 개발 범위 제외",
  "kind": "excluded"
 },
 {
  "id": "E14",
  "label": "이미지·PDF·DXF 참조",
  "implementation": "의도적 차이",
  "commands": [],
  "surface": "오른쪽 패널 > 참조 및 가져오기",
  "kind": "existing-surface"
 },
 {
  "id": "E15",
  "label": "편집 가능 범위·읽기 전용",
  "implementation": "부분 구현",
  "commands": [
   "PROPERTIES"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F01",
  "label": "HATCH 경계·패턴·면",
  "implementation": "부분 구현",
  "commands": [
   "HATCH",
   "HPTRANSPARENCY"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F02",
  "label": "HATCH 연관 경계 갱신",
  "implementation": "구현·검증 완료",
  "commands": [
   "HATCH"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F03",
  "label": "TEXT·MTEXT 작성·편집",
  "implementation": "부분 구현",
  "commands": [
   "TEXT",
   "MTEXT",
   "TEXTEDIT",
   "TEXTEDITMODE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F04",
  "label": "한글 IME·OS 입력",
  "implementation": "검증 보류",
  "commands": [
   "TEXT",
   "MTEXT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F05",
  "label": "문자 STYLE 관리",
  "implementation": "부분 구현",
  "commands": [
   "STYLE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F06",
  "label": "DIMSTYLE",
  "implementation": "부분 구현",
  "commands": [
   "DIMSTYLE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F07",
  "label": "선형·정렬·반지름·직경·각도·연속·기준 치수",
  "implementation": "부분 구현",
  "commands": [
   "DIMLINEAR",
   "DIMALIGNED",
   "DIMRADIUS",
   "DIMDIAMETER",
   "DIMANGULAR",
   "DIMCONTINUE",
   "DIMBASELINE",
   "DIMORDINATE",
   "DIMARC",
   "DIMJOGGED"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F08",
  "label": "치수 수정·기하 연관성",
  "implementation": "부분 구현",
  "commands": [
   "DIMEDIT",
   "DIMTEDIT",
   "DIMREASSOCIATE",
   "DIMDISASSOCIATE",
   "DIMREGEN",
   "DIMASSOC"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F09",
  "label": "지시선·주석",
  "implementation": "부분 구현",
  "commands": [
   "LEADER"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F10",
  "label": "주석 축척·annotative 표현",
  "implementation": "부분 구현",
  "commands": [
   "DIMSCALE",
   "DIMTXT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F11",
  "label": "선종류·선가중치 출력",
  "implementation": "검증 보류",
  "commands": [
   "LTSCALE",
   "CELTSCALE",
   "SHEET"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "F12",
  "label": "기존 표기 보존",
  "implementation": "검증 보류",
  "commands": [
   "TEXT",
   "MTEXT",
   "DIMSTYLE",
   "SHEET"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G13",
  "label": "명령 입력·기록",
  "implementation": "부분 구현",
  "commands": [
   "TEXTSCR",
   "COMMANDLOG",
   "LOGFILEON",
   "LOGFILEOFF",
   "COPYHIST"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G14",
  "label": "Pan/Zoom 및 명령 중 이동",
  "implementation": "구현·검증 완료",
  "commands": [
   "ZOOM"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G15",
  "label": "트랙패드·장치·DPI",
  "implementation": "검증 보류",
  "commands": [
   "ZOOM"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G16",
  "label": "포커스·브라우저 예약키",
  "implementation": "부분 구현",
  "commands": [
   "SELECT"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "G17",
  "label": "패널·Compact 작업공간",
  "implementation": "의도적 차이",
  "commands": [],
  "surface": "기존 상단·오른쪽 패널 펼침/핀",
  "kind": "existing-surface"
 },
 {
  "id": "G18",
  "label": "명령 등록·미등록·내부 구현 구분",
  "implementation": "부분 구현",
  "commands": [],
  "surface": "그룹 드롭다운 및 명령 입력",
  "kind": "existing-surface"
 },
 {
  "id": "H01",
  "label": "DXF 편집 import/export",
  "implementation": "부분 구현",
  "commands": [],
  "surface": "파일 메뉴 > DXF 열기·내보내기",
  "kind": "existing-surface"
 },
 {
  "id": "H02",
  "label": "미지원 DXF entity/extension 원본 보존",
  "implementation": "부분 구현",
  "commands": [],
  "surface": "DXF 열기·내보내기의 RAW 보존 경로",
  "kind": "existing-surface"
 },
 {
  "id": "H03",
  "label": "레이어·블록·치수·문자 DXF 의미",
  "implementation": "부분 구현",
  "commands": [
   "LAYER",
   "BLOCKS",
   "DIMSTYLE",
   "STYLE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "H04",
  "label": "외부 참조 DXF 교환",
  "implementation": "검증 보류",
  "commands": [],
  "surface": "오른쪽 패널 > 참조 및 DXF 교환",
  "kind": "existing-surface"
 },
 {
  "id": "H05",
  "label": "단위·축척",
  "implementation": "부분 구현",
  "commands": [
   "INSUNITSDEFSOURCE",
   "INSUNITSDEFTARGET"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "H06",
  "label": "PPRJ 저장·재열기",
  "implementation": "의도적 차이",
  "commands": [],
  "surface": "파일 메뉴 > PPRJ 저장·열기",
  "kind": "existing-surface"
 },
 {
  "id": "H07",
  "label": "PPKG 다중 Plan 교환",
  "implementation": "의도적 차이",
  "commands": [],
  "surface": "파일 메뉴 > Plan PPKG 가져오기·내보내기",
  "kind": "existing-surface"
 },
 {
  "id": "H08",
  "label": "벡터 PDF",
  "implementation": "부분 구현",
  "commands": [
   "SHEET"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "H09",
  "label": "용지·범위·배율·출력선",
  "implementation": "부분 구현",
  "commands": [
   "SHEET",
   "SHEETMANAGER",
   "PLOTTRANSPARENCYOVERRIDE"
  ],
  "surface": "기존 그룹 메뉴 / 명령 옵션 / 캔버스 조작",
  "kind": "command"
 },
 {
  "id": "H10",
  "label": "여러 도면·Region·Floor 작업",
  "implementation": "부분 구현",
  "commands": [
   "REGIONROTATE"
  ],
  "surface": "기존 도면 영역·건물·층 관리자",
  "kind": "command"
 },
 {
  "id": "H11",
  "label": "DWG 직접 편집",
  "implementation": "의도적 차이",
  "commands": [],
  "surface": "명시적 개발 범위 제외",
  "kind": "excluded"
 },
 {
  "id": "X01",
  "label": "3D solids/rendering",
  "implementation": "범위 밖",
  "commands": [],
  "surface": "명시적 개발 범위 제외",
  "kind": "excluded"
 },
 {
  "id": "X02",
  "label": "기계/CAM·제조전용",
  "implementation": "범위 밖",
  "commands": [],
  "surface": "명시적 개발 범위 제외",
  "kind": "excluded"
 },
 {
  "id": "X03",
  "label": "토목측량·구조해석·시뮬레이션",
  "implementation": "범위 밖",
  "commands": [],
  "surface": "명시적 개발 범위 제외",
  "kind": "excluded"
 },
 {
  "id": "X04",
  "label": "전체 BIM·대규모자동화",
  "implementation": "범위 밖",
  "commands": [],
  "surface": "명시적 개발 범위 제외",
  "kind": "excluded"
 }
]);
})();
