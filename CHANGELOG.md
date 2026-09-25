# Changelog

## v0.13.0 · Build 14 — 2026-09-25

- 프로젝트 `저장`과 portable file `다운로드`를 분리했습니다. File System Access 지원 브라우저는 기존처럼 같은 `.pieniplan` 파일을 갱신하고, 미지원 브라우저는 자동 다운로드하지 않고 IndexedDB 기반 browser-local project storage에 저장합니다. File 메뉴에 **프로젝트 파일 다운로드**를 별도 제공했습니다.
- CAD/Plan 공통 Command 문법을 보강했습니다. 캔버스에 포커스가 있어도 명령을 입력해 Enter로 실행할 수 있고, 아무 명령도 입력하지 않은 상태에서 **Enter는 마지막 명령을 반복**합니다.
- Plan Command feedback 위치를 command input 자체에 anchor하도록 수정해 울트라와이드/대형 모니터에서도 메시지가 오른쪽 아래로 떠버리지 않게 했습니다.
- Floor와 CAD Drawing Region의 관계를 **1 Floor ↔ 1 Region**으로 강제하는 isolation/migration을 추가했습니다. 다른 Region을 Plan으로 열거나 재인식할 때 현재 Floor에 결과를 누적하지 않고 대응 Floor를 재사용하거나 새로 만듭니다.
- 사용자 제공 창의관 프로젝트에서 `6F` 하나에 `６Ｆ`와 `5F`의 자동 인식 결과가 섞여 있던 실제 상태를 확인하고, 명확한 Floor/Region 이름과 `sourceRegionId`를 이용해 로드 시 보수적으로 분리·복구하도록 했습니다. 해당 fixture에서 6F source 151개와 5F source 176개의 recognized semantic object가 각각 올바른 Floor로 분리되는 회귀 테스트를 통과했습니다.
- architectural recognition에 **Junction Solver**를 추가했습니다. L-corner와 T-junction의 wall endpoint를 실제 교점까지 정규화하고 host wall은 유지하며 branch만 붙입니다. pure interior X crossing은 기존 결정대로 자동 분절하지 않습니다.
- DXF에 실제 ARC entity가 없고 LINE chain으로 분해된 문 여닫이 호를 보수적으로 복원하는 **segmented door swing recognition**을 추가했습니다.
- 사용자 제공 창의관 프로젝트의 실제 CAD line subset을 Build 14 인식기에 통과시킨 결과: `６Ｆ` region에서 123 wall / 18 space / 3 door / 13 stair, `5F` region에서 153 wall / 25 space / 9 door / 20 stair 후보를 생성했고 safety limit에 걸리지 않았습니다. 실제 브라우저에서의 시각적 정확도/오검출은 사용자 실기 확인이 남아 있습니다.
- Build 10~12 회귀 smoke test와 Build 14 command/status, junction solver, segmented door, 실제 Floor/Region migration smoke test를 모두 통과했습니다. JS syntax와 i18n EN/KO 439/439 parity도 확인했습니다.

## v0.12.0 · Build 13 — 2026-09-25

- `.pieniplan` 저장을 브라우저 다운로드와 분리했습니다. File System Access를 지원하는 브라우저에서는 처음 선택한 프로젝트 파일 핸들을 유지해 이후 `Ctrl/Cmd+S`가 같은 파일을 직접 갱신하며, 지원하지 않는 브라우저에서만 다운로드 저장으로 대체합니다.
- Command의 단독 `S`를 저장 명령으로 사용하지 않고 CAD 문법의 STRETCH 용도로 예약했습니다. STRETCH는 아직 미구현이며 저장은 `Ctrl/Cmd+S`를 사용합니다.
- Wall recognition 후처리에 **Plan Geometry Cleanup**을 추가했습니다. 짧게 교차점을 지나친 wall tail은 다음 유효 접합이 없고 길이/비율 조건을 통과할 때만 교차점까지 Trim합니다. 여러 교차를 통과해 다음 벽까지 연결되는 wall은 중간 교차에서 끊지 않습니다.
- 이미 신뢰도 높은 Wall의 한쪽 CAD edge가 짧게 더 이어지는 경우 기존 wall axis/thickness를 사용해 누락된 짧은 run을 제한적으로 복원합니다. 무제한 single-line wall 생성은 하지 않습니다.
- Re-recognition에서 기존 `recognizedFromCad` Wall의 source IDs와 과거 recognition signature를 대조합니다. 마지막 인식 이후 geometry가 바뀌지 않은 자동 인식 Wall만 새 결과로 갱신하고, 사용자가 수정한 Wall은 덮어쓰지 않습니다.
- Drawing Region 이름이 `6F`, `６Ｆ`, `6층`, `지하 2층`처럼 명확하면 처음 Floor와 연결할 때 층 이름을 자동으로 이어받습니다. 기존 단일 `1F` 프로젝트가 `６Ｆ` 같은 명확한 Region에 연결되어 있으면 로드 시 기본 이름만 보수적으로 보정합니다.
- 사용자가 제공한 Build 12 창의관 `.pieniplan`의 134개 자동 인식 Wall이 최신 recognition history signature와 모두 일치함을 확인했습니다. 즉 현재 파일의 Wall들은 사용자가 geometry를 수정한 것으로 판정되지 않아 Build 13 재인식 시 안전 갱신 대상이 될 수 있습니다.
- 같은 실제 파일의 기존 Wall geometry를 대상으로 새 overrun 조건을 검산했을 때 보수적 자동 Trim 후보 4개를 확인했습니다. 전체 창의관 DXF를 Build 13 recognition pipeline으로 다시 돌리는 브라우저 실기 검증은 사용자 환경에서 확인이 필요합니다.

## v0.11.0 · Build 12 — 2026-09-20

- 상단 아래에 남아 있던 불필요한 overflow/scroll 흔적과 항상 표시되던 Context Bar를 정리하고, 실제 입력 맥락이 필요한 도구에서만 Context Bar가 나타나게 했습니다.
- 기존 페이지 하단 Command/좌표/GRID/SNAP/ORTHO/POLAR 상태줄을 제거하고 캔버스 하단의 **한 줄 compact HUD**로 통합했습니다. Command 입력은 기본적으로 짧게 유지되고 포커스 시 확장됩니다.
- Plan Mode에서는 CAD 전용 좌표/GRID/SNAP/ORTHO/POLAR 상태를 숨기되 Command 입력은 유지합니다. `L`, `TR`, `EX`, `E`, `DI`, Undo/Redo를 Plan 의미 객체에 적용할 수 있습니다.
- Plan TRIM/EXTEND가 현재 층의 직선 Wall/Line을 편집하며 raw DXF는 변경하지 않도록 분리했습니다. Wall trim 시 연결된 opening/dimension 관계도 가능한 범위에서 재매핑합니다.
- Plan drag Window/Crossing 다중 선택이 실제로 Plan Mode에서도 시작되도록 누락된 입력 경로를 수정했습니다.
- 공간 topology에서 T자/끝점 접합은 분기점으로 사용하되, 단순 interior X crossing은 방 경계를 불필요하게 분절하지 않도록 Plan 공간 검출 규칙을 보완했습니다.
- Plan Mode의 hover/selection/render가 거대한 CAD 원본 배열을 반복 순회하지 않도록 active-floor Plan object cache를 추가하고, linked CAD reference는 Path2D 기반 render cache를 재사용하도록 최적화했습니다.
- `층`의 `…` 메뉴에서 브라우저 `prompt()`를 제거하고 PieniPlan 내부 메뉴 + inline 이름 변경 + 별도 삭제 확인 UI로 통일했습니다.
- 왼쪽 도구막대를 선택/그리기/건축/수정/측정 그룹으로 고밀도 재구성했습니다. 일반 클릭은 그룹의 마지막 사용 도구를 재실행하고, 길게 누르기·우클릭·모서리 표시는 전체 그룹을 엽니다.
- Build 11 회귀와 Build 12 HUD/Plan Command·TRIM/다중선택/Floor menu/topology/cache 회귀 테스트를 통과했습니다. 실제 창의관 DXF의 브라우저 체감 성능과 복잡 Wall/Arc trim은 사용자 실기 확인이 남아 있습니다.

## v0.10.0 · Build 11 — 2026-09-20

- 상단바를 PieniPlan 홈, `Plan Mode | CAD Mode`, 중앙 문서명/변경 표시, Undo/Redo/View/File/Settings 아이콘 구조로 재편했습니다.
- View에는 화면 맞춤/전체 요소 보기만 남기고, File에는 새 도면/프로젝트 열기/프로젝트 저장/DXF 열기/DXF 내보내기를 정리했습니다.
- Settings에서 Light/Dark/Black을 즉시 바꿀 수 있게 하고, 별도 정식 사용 안내와 About 창을 추가했습니다.
- Plan Mode의 역할을 `CAD 표현 복제`가 아닌 **층별 semantic floor-plan model**로 명확히 하고 `층 / 팔레트 / 속성` inspector를 추가했습니다.
- `.pieniplan` schemaVersion 2에 floors/activeFloorId를 저장하며 기존 프로젝트는 기본 1F로 호환 로드합니다.
- 각 Plan semantic object를 active floor에 귀속시키고, Plan 표시/선택을 현재 층으로 제한했습니다.
- Plan Wall은 semantic thickness를 유지하면서 화면에서는 일정한 선 굵기로 표시하고, Stair는 복잡한 tread 반복 대신 semantic bounds + label로 단순화했습니다.
- Plan Mode에서도 기존 Window/Crossing 드래그 다중 선택을 current-floor 의미 객체에 적용했습니다.
- 연결된 짧은 LINE chain이 원호에 안정적으로 맞는 경우 하나의 Arc Wall 후보로 복원하는 보수적 segmented-curve recognition을 추가했습니다.
- current floor와 Drawing Region을 연결하고 `재인식`/`CAD에서 편집` 흐름을 추가했습니다. 재인식은 기존 Plan 사용자 작업을 자동 삭제하지 않는 preview 기반 foundation입니다.
- 실제 source/editable CAD로 단순 복귀할 때 Plan→CAD mapping dialog가 뜨지 않도록 전환 조건을 수정했습니다.
- Plan reference의 작은 DXF text는 최소 읽기 크기를 적용하고 CAD Mode는 true world-scale text + LOD를 유지합니다.
- A4/A3 page canvas는 Plan editing model에서 제외하고 향후 FacilityManager/print layout 책임으로 남겼습니다.
- Build 10 회귀 테스트와 Build 11 topbar/floor/segmented-curve/Plan-visual regression을 통과했습니다.

## v0.9.0 · Build 10 — 2026-09-20

- `.pieniplan` 프로젝트 저장/열기를 추가해 현재 CAD/Plan 객체, 레이어 표시 상태, Drawing Region, 기준축/제약, 인식 이력과 원본 DXF 식별 정보를 함께 보관할 수 있게 했습니다.
- DXF TEXT/MTEXT/Attribute를 도면 좌표계 크기로 렌더링하고 극저배율에서는 LOD로 숨겨 전체 도면 축소 시 텍스트가 겹치는 문제를 줄였습니다.
- CAD 객체 선택 시 해당 레이어가 검색 필터 밖에 있더라도 Layers 내부 목록에서 선택 행을 확실히 표시하며, 바깥 페이지/캔버스는 스크롤하지 않도록 보강했습니다.
- Layers와 Drawing Regions 사이에 높이 조절 Splitter를 추가하고 비율 저장, 키보드 조절, 더블클릭 초기화를 지원합니다.
- `L / LINE`을 첫점 → Preview → 둘째점 즉시 생성 → 연속 그리기 → Enter/Esc 종료의 CAD 문법으로 수정했습니다. 숨겨진 활성 레이어는 그리기 시작 시 자동 표시합니다.
- `TR / TRIM`, `EX / EXTEND`를 추가하고 작업 중 Shift로 반대 기능을 임시 사용할 수 있게 했습니다.
- Shift를 누르는 동안 ORTHO 상태를 임시 반전하고 `F10 POLAR`를 Base Axis 기준 45° 추적에 연결했습니다.
- Plan Tools 벽을 직선 벽 / 곡선 벽(Arc Wall)으로 확장하고 곡선 벽의 반지름·호 길이 편집과 곡선 벽 부착 문/창을 지원합니다.
- Plan Tools 문 종류를 일반 여닫이문, 양개 여닫이문, 슬라이딩문, 양개 슬라이딩문, 포켓 도어로 확장하고 각 타입의 Plan/DXF 표현을 추가했습니다.
- 계단 semantic 객체와 CAD 계단 후보 인식 기반을 추가했습니다.
- CAD→Plan 인식을 단순 평행선 쌍 생성 방식에서 **건축 구조 인식**으로 재설계했습니다. 여러 제도선을 Wall Band로 묶고, 반복 벽 두께/주 방향/작은 문 간격/코너를 통합하며, 계단 반복선을 분리하고, 방 face를 이용해 구조를 검증합니다.
- 인식 후보는 적용 전까지 lightweight Preview로만 유지하며, 병합 후에도 후보가 과도하면 semantic Wall 대량 생성을 막는 안전장치를 추가했습니다.
- 곡선 CAD 원호 쌍에서 Arc Wall 후보를 만들고, 여닫이문 ARC를 문 후보로 분리합니다.
- 3~4중 평행선 벽, 문 간격, 네 개 연속 방, 큰 방, 계단 반복선, 곡선 벽을 포함한 synthetic 건축 도면 회귀 테스트에서 81개 선/7개 원호를 10개 벽 후보(직선 9 + 곡선 1), 6개 공간 후보, 4개 문 후보, 1개 계단 후보로 단순화하는 것을 확인했습니다.
- 좁은 Viewer-only 레이아웃의 grid-row 회귀를 수정해 캔버스가 전체 남은 높이를 사용하도록 했습니다.
- GitHub Ready 패키징 전에 HTML/CSS/Worker가 참조하는 로컬 runtime asset 존재 여부를 검사하도록 검증 절차를 강화했습니다.

## v0.8.0 · Build 9 — 2026-09-20

- CAD 레이어와 도면 영역을 서로 독립된 관리 영역으로 재구성했습니다.
- 도면 영역을 한 줄 compact row로 표시하고 이름 변경, 화면 맞춤, Plan Tools 연계, 영역 DXF 내보내기, 삭제를 `…` 메뉴로 정리했습니다.
- 도면 영역 지정은 CAD `선택` 도구군의 정식 도구로 유지하고 패널에서도 빠르게 진입할 수 있게 했습니다.
- 선택 도구일 때 의미 없이 차지하던 Context Bar를 숨기고 실제 입력/안내가 필요한 도구에서만 표시합니다.
- `CAD 표현` 설정은 Layers 패널에서 제거하고 CAD 상단 작업 영역으로 이동했습니다. Plan semantic object가 있을 때만 노출합니다.
- 도면 영역의 현재 표시 CAD 선에서 평행선 쌍을 찾아 Plan Wall 후보를 만드는 `벽 자동 인식` preview/apply 흐름을 추가했습니다.
- 자동 인식은 현재 표시 레이어와 지정 영역만 사용하며, 적용 전 실제 벽 두께 형태로 후보를 미리 보여줍니다.
- GitHub README는 한국어 사용자 문서로 유지하며 현재 가능한 기능과 간단한 사용법 중심으로 갱신했습니다.

## v0.7.0 · Build 8 — 2026-09-20

- Plan Tools 왼쪽에 정식 `제약` 도구군 추가
- Shift 다중선택 후 Wall 간 평행/직각 관계 적용
- Constraint-first 흐름과 endpoint→endpoint / endpoint→line 일치 지정
- Properties를 적용된 제약 목록 + 개별 해제 중심으로 정리
- Wall 길이/각도 숫자 입력을 지속되는 dimensional constraint로 변경
- numeric 입력으로 새 Wall을 만들 때 명시된 길이/각도 constraint 유지
- 평행/직각 적용 시 불필요한 180° 방향 반전 방지
- endpoint / resize / move / dimension offset cursor affordance 보강


## v0.6.0 · Build 7 — 2026-09-20

Constraint / selection / large-layer UX milestone.

- separated transient SNAP placement from persistent wall constraints
- added directly editable on-canvas wall length/angle, opening width and associated-dimension values
- added Constraint v1: horizontal, vertical, axis-parallel, axis-perpendicular, fixed angle, fixed length and position Fix
- added explicit endpoint coincidence / point-on-line wall relationships and kept constrained endpoints attached during drag
- added user-defined wall Base Axis and made ORTHO / axis-relative constraints follow it
- added selected-wall constraint hints and conflict confirmation before breaking fixed angle/length/position constraints
- expanded Undo/Redo snapshots to include constraints/base-axis and CAD layer visibility state
- added CAD left→right Window selection and right→left Crossing selection with live candidate preview, Shift-add, Ctrl/Cmd-toggle and Esc-clear
- made layer hide / isolate / restore undoable
- fixed selected-layer reveal so it scrolls only the layer list instead of the outer workspace/page
- made the CAD Layers panel independently scrollable, searchable and compact for large layer counts
- preserved Drawing Region controls below the layer list
- fixed direct numeric double-click so the first click does not clear the selected object before the editor opens

## v0.5.0 · Build 6 — 2026-09-20

Plan interaction and CAD → Plan linkage milestone.

- added README quick-launch and repository links
- improved door/window resize discoverability with larger opening handles and live width labels
- added door swing flipping by perpendicular drag while keeping explicit hinge/swing flip actions
- added object-specific Plan right-click menus
- added visible wall endpoint/wall-segment snapping for Plan wall drawing/editing
- added attachable T-junction wall relationships; attached branches follow parent-wall movement and can be detached/re-attached
- added quick `Space` → Select in Plan Tools while preserving hold-Space + drag Pan
- added F3 SNAP / F7 GRID / F8 ORTHO to the shared shortcut registry and delayed tooltips
- renamed Space to **Define Space / 공간 지정** and added closed semantic-wall space recognition with stable IDs
- made Plan dimensions associative with their source wall
- highlighted the selected CAD object's layer and added quick hide/isolate/show-in-Layers actions
- added context-sensitive CAD right-click menus
- added **Drawing Regions**: name a rectangular CAD area, fit to it, export it as DXF, or open it in Plan Tools as a linked vector reference
- linked Drawing Region references preserve their visible-layer snapshot until explicitly refreshed
- kept narrow/mobile workspaces viewer-only

## v0.4.0 · Build 5 — 2026-09-20

Direct-manipulation and real-DXF reliability milestone.

- changed CAD Tools empty-state actions to purpose-driven **Draw new / Edit existing DXF**
- added beginner-oriented direct manipulation for Plan walls, doors, windows and dimensions
- added conventional door leaf + 90° swing arc and hinge/swing flip controls
- cut wall display around door/window openings and improved connected thick-wall joins
- upgraded dimensions with witness/extension lines, dimension line, ticks and editable offset
- made wall/line Length and Angle editable from Properties
- added separate hover / selection / drag states and meaningful object handles
- added main-drawing smart Fit for DXFs with detected distant outlier entities, plus **All extents**
- added object endpoint spatial indexing for large editable DXFs
- added document/source status and Modified state; unload warning now follows actual dirty state
- aligned themes with House Light / Dark / Black(OLED) palette direction
- added Black(OLED) appearance mode
- replaced the previous Font Awesome subset with a local Tabler Icons outline subset
- added viewer-only behavior for very narrow/mobile workspaces with pan/zoom
- kept browser Back/Forward navigation separate from drawing Undo/Redo

## v0.3.1 · Build 4 — 2026-09-15

- connected PieniPlan navigation to browser History API
- added in-app Back and Home controls
- returning Home preserves the current in-memory drawing
- added Continue current drawing on the start screen
- added System / Light / Dark appearance selection
- kept drawing Undo/Redo separate from navigation Back/Forward

## v0.3.0 · Build 3 — 2026-09-15

- added a start screen with Plan Tools and CAD Tools as two entry paths into the same drawing
- kept one shared mm coordinate system and canvas across both tool sets
- added Plan wall / door / window workflow with exact dimensions
- added first-time Plan → CAD representation mapping
- added editable DXF opening for common basic entities
- added CAD command input with a small supported familiar alias set
- added basic shared-drawing DXF export
- kept DXF/image reference tracing and calibration

## v0.2.0 · Build 2 — 2026-09-14

- fixed scale-calibration dialog appearing on first launch
- added Korean/English localization
- kept GRID / SNAP / ORTHO / DXF as intentional CAD terms
- replaced improvised Unicode glyphs with a temporary SVG icon set
- added selective delayed tooltips
- removed unvalidated arbitrary single-letter tool shortcuts

## v0.1.0 · Build 1 — 2026-09-14

- first executable workspace baseline
- DXF/image references and calibration
- real-world mm coordinates
- Line / Wall / Distance / Select / Delete
- numeric Length / Angle / Wall Thickness input
- GRID / SNAP / ORTHO and CAD-style navigation
