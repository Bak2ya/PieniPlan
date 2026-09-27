# PieniPlan

**Small Web Floor Plan Editor**

브라우저에서 빠르게 평면도를 만들고, 필요하면 같은 도면을 DXF/CAD 방식으로 더 정밀하게 다룰 수 있는 웹 도면 편집기입니다.

- **바로 실행:** https://bak2ya.github.io/PieniPlan/
- **GitHub:** https://github.com/Bak2ya/PieniPlan

PieniPlan은 **하나의 프로젝트 · Plan Mode와 CAD Mode · 실제 좌표를 공유하는 도면**을 지향합니다.

- **Plan Mode(빠른도면)** — CAD 구조를 몰라도 연결된 **선**으로 평면 경계를 만들고, 문·창·공간 같은 **요소**를 붙여 실제 치수를 정확하게 다룹니다.
- **CAD Mode** — DXF 객체, 레이어, 정밀 선택, GRID/SNAP/ORTHO/POLAR, 명령 입력을 이용해 DXF를 직접 편집합니다.

처음 화면의 선택은 어떤 모드로 시작할지만 정합니다. 작업 중 같은 프로젝트에서 Plan Mode와 CAD Mode를 오갈 수 있습니다. Plan Mode는 층별 의미 객체를 정리하고, CAD Mode는 원본/편집 DXF의 세부 형상을 다룹니다.

## 할 수 있는 것

### Plan Mode · 층별 평면

- 건물을 **층(Floor)** 단위로 분리해 관리하며 각 층은 안정적인 내부 ID를 가집니다. Drawing Region 이름이 `6F`, `６Ｆ`, `6층`, `지하 2층`처럼 명확하면 처음 연결할 때 층 이름을 자동으로 이어받습니다.
- 오른쪽 패널은 **층 / 참조 도면 / 속성**으로 구성됩니다. `참조 도면`에서는 현재 층에 연결된 CAD Region의 표시/숨김, 불투명도, 레이어 표시를 제어할 수 있습니다.
- Plan Mode에서는 사용자에게 `선`과 `벽`을 따로 나누지 않습니다. `L` 명령과 왼쪽 **선** 도구는 같은 semantic 평면 경계선을 만들고, 내부적으로 필요한 두께·공간 경계·문/창 host 속성은 그 선의 속성으로 유지합니다. 화면에 보이는 선은 실제 endpoint에서 정확히 끝나며, 선택 판정도 보이는 선을 기준으로 일정한 화면 픽셀 허용범위를 사용합니다.
- 계단은 복잡한 CAD 디딤판 선을 그대로 반복 렌더링하지 않고 의미 객체로 단순화해 표시합니다.
- CAD Drawing Region은 Plan Floor와 **1:1로 연결**합니다. 다른 층의 Region을 열거나 재인식해도 기존 Floor에 결과를 섞지 않고 대응 Floor를 재사용하거나 새로 만듭니다.
- 기존 프로젝트에서 한 Floor에 여러 Region의 자동 인식 결과가 섞여 있으면, 명확한 층 이름과 `sourceRegionId`를 기준으로 로드 시 보수적으로 Floor를 분리·복구합니다.
- **재인식은 현재 CAD Region의 자동 인식 레이어를 현재 선택 옵션으로 다시 생성**합니다. 체크를 끈 Wall/Door/Space/Stair의 기존 자동 인식 객체는 제거되며, 사용자가 직접 만든 객체와 인식 후 수동 수정한 객체는 보호합니다.
- 벽 인식 후에는 **Junction Solver + endpoint gap healing + final exact endpoint pass**가 L/T 접합을 실제 교점까지 정규화하고, 작은 collinear gap/근접 endpoint를 제한적으로 연결하며, 의미 없는 짧은 overrun tail을 Trim합니다. 단순 X crossing은 host wall을 불필요하게 쪼개지 않습니다.
- 확실한 벽의 한쪽 제도선이 짧게 더 이어진 경우 기존 벽 축/두께를 이용해 누락 구간을 제한적으로 복원합니다.
- 실제 DXF `ARC`가 없어도 짧은 LINE chain이 90° 전후의 문 여닫이 호로 설명되면 보수적으로 Door candidate로 복원합니다.
- 층의 `…` 메뉴는 앱 내부 메뉴로 열리며, 이름 변경은 inline 편집, 삭제는 별도 확인 흐름으로 처리합니다.
- Plan 렌더링/선택은 현재 층의 Plan 객체를 캐시해 처리하고, 연결된 CAD 참조는 정적 Path cache를 재사용해 대형 원본 DXF의 반복 순회를 줄입니다. Canvas resize/Retina/browser zoom에서도 렌더 좌표와 pointer 좌표가 같은 변환을 사용하도록 보정합니다.
- Plan Mode의 드래그 Window/Crossing 다중 선택은 현재 층의 의미 객체를 대상으로 동작합니다.
- 왼쪽 도구막대는 **선택 / 그리기 / 요소 / 수정** 4그룹으로 압축됩니다. `거리`는 선택 그룹, `문·창·공간 지정`은 요소, `이동·복사·TR·EX·삭제`는 수정 그룹에 들어갑니다. 문은 여닫이·양개·미닫이 등 자주 쓰는 종류를 같은 그룹에서 고릅니다. 버튼을 누르면 마지막 사용 도구를 다시 실행하고 길게 누르기·우클릭·모서리 표시로 그룹을 펼칩니다.
- Plan Mode에서도 `L`, `M`, `CO`, `TR`, `EX`, `E`, `DI`, Undo/Redo 같은 익숙한 명령을 사용할 수 있습니다. 이 명령은 원본 DXF가 아니라 현재 층의 Plan 객체를 편집합니다. `TR`에서는 커서가 가리키는 **실제 삭제 예정 구간만 빨간 반투명 overlay**로 먼저 보여주고 클릭할 때 확정합니다.
- 직선 선끼리의 접합은 편집 자유도에 따라 구분합니다. **Endpoint↔Endpoint는 같은 persistent Junction node**를 공유하고, **Endpoint↔Segment 중간 접합은 Point-on-Edge 제약**으로 유지합니다. 중간 접합은 host 선의 특정 비율 위치에 고정되지 않고 선 위에서 이동할 수 있으며, host 이동·길이 변경·회전 시 branch의 기존 수평/수직/각도를 가능한 한 유지한 새 교점을 계산합니다. 단순 interior X crossing은 자동 연결하지 않습니다.
- Plan Mode에서 `Shift`는 **기하 제약 전용키**입니다. 그리기/끝점 편집에서는 GLOBAL 0/45/90/…°와 연결선 기준 REF 0/45/90/…° 후보를 동시에 평가하며, 기존 선의 현재 각도도 후보에 포함합니다. 선 전체를 이동할 때는 GLOBAL 수평·수직과 연결선의 평행·수직 방향 중 포인터 이동 방향에 가장 가까운 축으로 제한해 주변 선이 불필요하게 뒤틀리는 것을 줄입니다. Plan에서는 Shift가 TR/EX를 서로 뒤집지 않습니다.
- `L` 같은 도구를 실행할 때 길이·각도 입력은 캔버스 **왼쪽 위 Floating Context HUD**에만 나타납니다. HUD가 열리고 닫혀도 캔버스 높이나 도면 좌표는 바뀌지 않습니다.
- 문 직접 조작은 **선택 영역과 드래그 조작 영역을 분리**합니다. 문틀/개구부 span 전체를 끌면 host 선을 따라 위치 이동하고, 문짝 또는 개폐호 stroke 근처를 끌 때만 열림/경첩 방향 gesture가 동작합니다. 부채꼴 내부는 넓게 선택할 수 있지만 그 내부를 끌었다고 방향이 뒤집히지는 않습니다. 가운데 점은 위치 이동 affordance로 남고, 판단은 화면 X/Y가 아니라 host 선의 로컬 축을 사용합니다.
- 공간 face 분석에서는 실제 Plan 선의 interior crossing을 **가상 topology node**로 사용해 닫힌 면을 찾습니다. 다만 편집 topology에서는 단순 X crossing을 persistent Junction이나 실제 split으로 만들지 않아, 공간 계산 때문에 선들이 서로 끌려다니지 않습니다.
- 분절된 직선 체인이 하나의 원호로 설명될 때 보수적으로 Arc Wall 후보로 복원합니다.
- A4/A3 같은 종이 규격은 편집 모델에 강제하지 않습니다. 출력 레이아웃은 별도 출력/FacilityManager 단계의 책임으로 둡니다.
- 실제 치수 기반 **직선 / 곡선 평면 경계선** 그리기
- 선 길이·각도·두께 속성과 곡선 반지름/호 길이 편집
- 평면 선에 붙는 문 / 창문 배치와 폭 조절
- 문 종류
  - 일반 여닫이문
  - 양개 여닫이문
  - 양방향 여닫이문
  - 양개 양방향 여닫이문
  - 슬라이딩문
  - 양개 슬라이딩문
  - 포켓 도어
  - 방화문
  - 방화셔터
- 여닫이문의 경첩·열림 방향, 슬라이딩문의 이동 방향 전환
- 방화문/방화셔터 semantic 요소. 현재 `FD`/`FS` 표시는 PieniPlan 내부 식별용이며 법정 도면 기호나 성능 등급을 주장하지 않습니다.
- 곡선에서도 선의 접선/법선을 기준으로 문·창 배치
- 닫힌 평면 경계를 찾아 공간 지정
- 공간은 면적값이 아니라 `공간 1`, `공간 2` 같은 안정적인 이름으로 식별합니다. **도면 계산 면적**과 사용자가 입력하는 **관리 면적**은 별도 값으로 유지하며 geometry를 고쳐도 관리 면적을 자동 변경하지 않습니다. 활성 층 아래 트리에서 공간을 선택·이름 변경할 수 있고 `미지정/강의실/사무실/복도/화장실/계단실/창고/공용공간/기계실/기타` 유형을 지정할 수 있습니다. 공간 지정 도구에서는 hover한 닫힌 face를 반투명 preview로 보여주고, 닫힘 실패 시 의심되는 미세 gap을 빨간 진단 overlay로 표시합니다.
- 선을 따라 움직이는 연결 치수
- 화면의 길이·각도·폭 숫자를 더블클릭해 직접 입력
- SNAP과 별개로 유지되는 Constraint(제약)
  - 일치
  - 수평 / 수직
  - 평행 / 직각
  - 각도 / 길이 고정
  - 위치 고정
- 살짝 회전된 실제 건물에 맞추는 **기준축(Base Axis)**
- DXF / 이미지 참조 도면을 같은 실제 좌표계에서 트레이싱
- Plan Mode에서 배경 CAD/DXF는 **기본적으로 스냅 대상에서 제외**하고, `Ctrl`을 누르는 동안에만 참조 도면의 끝점·중간점·교점 스냅을 임시 활성화합니다. `Shift`는 각도 제약 전용이며 `Ctrl+Shift`로 두 기능을 함께 사용할 수 있습니다.
- CAD 도면 영역에서 **건축 구조 인식**을 실행해 단순화된 벽·방·문·계단 후보를 확인한 뒤 Plan 객체로 생성

### CAD Mode

- **Build 26 CAD Core foundation:** CAD 객체는 하나의 Context 정책에서 render / inspect / select / snap / modify 권한을 분리합니다. Plan Overlay와 외부 Reference는 CAD source와 같은 수정 대상으로 취급하지 않으며, locked layer 객체도 보거나 선택할 수는 있지만 수정은 차단합니다.
- 실제 **CAD Layer 정의**를 지원합니다. 빈 레이어 생성, 이름 변경, 안전한 삭제, current layer, lock/unlock, 선택 객체의 레이어 재지정이 가능하며, 기존 `전체 도면 AND Region-local` 표시 상태는 별도 visibility 정책으로 유지됩니다.
- CAD 속성에서 **Metric / Imperial** 표시 체계를 선택할 수 있습니다. 내부 geometry는 mm 기준을 유지하고 길이 입력/표시는 UnitService에서 변환합니다. 초기 기본값은 한국어 + Metric입니다.
- `LINE`은 새 Command Registry/Session 기반의 첫 native reference command로 동작하며 typed coordinate, Snap/ORTHO/POLAR, active layer, Undo/Redo 경로를 하나의 lifecycle로 통과합니다.
- 프로젝트 데이터는 future-ready `Sheets[]` 구조를 가지며 여러 출력 Sheet를 수용할 수 있게 준비되어 있습니다. Sheet UI/출력 workflow는 후속 단계입니다.
- Native DWG는 지원 범위에서 제외합니다. 외부 DWG는 필요 시 DXF로 변환해 가져오며 PieniPlan의 CAD 교환 포맷은 DXF입니다.

- 기존 DXF 열기 및 편집
- 새 DXF 도면 작성
- 레이어 표시 / 숨김 / 단독 보기 / 검색. **전체 도면**의 레이어 표시가 상위 gate이고, 특정 Drawing Region에서는 그 Region만의 local 표시 상태를 따로 기억합니다. 실제 표시는 `전체 도면 ON + 현재 Region ON`일 때만 켜지며, Region별 상태는 프로젝트에 저장됩니다. Region의 `모두 켜기`는 local 상태만 복원합니다.
- **작업 범위**는 CAD inspector 상단에서 항상 보이는 편집 context입니다. 전체 도면 또는 특정 Drawing Region을 선택하며, Region 모드에서는 렌더/선택/스냅/TR·EX 등 CAD 작업 후보와 Region-local layer view를 해당 working set으로 제한합니다.
- 특정 Drawing Region이 작업 범위일 때 `RO / ROTATE`로 그 Region의 source CAD를 기준점 → 기준 방향 → 목표 방향 순서로 회전할 수 있습니다. `H`/`V`/숫자 absolute angle도 지원하며 linked Plan semantic 객체는 자동으로 함께 돌지 않습니다.
- 객체를 선택하면 해당 레이어를 **레이어 목록 내부에서 자동으로 찾아 표시**
- 레이어 목록과 도면 영역 목록의 높이를 Splitter로 직접 조절
- 왼쪽 → 오른쪽 **Window Selection**
- 오른쪽 → 왼쪽 **Crossing Selection**
- GRID / SNAP / ORTHO / POLAR
- Base Axis를 기준으로 한 ORTHO/POLAR 방향 추적
- `Shift`를 누르는 동안 ORTHO 상태 임시 반전
- 연속 LINE 그리기와 마우스 Preview
- 캔버스 왼쪽 아래에는 Plan/CAD 공통 **Command Console**을 둡니다. 최근 작업/명령 로그, 현재 prompt, 항상 열린 입력창과 autocomplete 후보가 같은 영역에서 이어집니다. CAD X/Y는 오른쪽 끝의 고정폭 숫자 영역에 분리해 좌표 자릿수가 변해도 레이아웃이 움직이지 않습니다.
- `TR / TRIM` 잘라내기
- `EX / EXTEND` 연장
- TRIM/EXTEND 사용 중 `Shift`로 반대 동작 임시 사용
- 도면에 속한 TEXT/MTEXT/Attribute는 Zoom에 맞춰 실제 크기로 확대·축소되며, 너무 작아지면 LOD로 숨김
- 도면 일부를 **도면 영역**으로 지정
  - 화면 맞춤
  - 이름 변경
  - 해당 영역만 DXF 내보내기
  - Plan Mode에서 같은 좌표의 벡터 참조로 열기
  - 현재 표시 CAD 도형에서 건축 구조 인식
- DXF 내보내기 시 지원 브라우저에서는 저장 위치/파일명을 직접 선택하고, 미지원 브라우저에서는 filename confirmation 후 다운로드 위치 fallback을 안내

## 상단바와 설정

현재 상단은 작업에 필요한 정보만 남기고, 명령/상태 정보는 캔버스 안쪽 HUD로 분리했습니다.

- 왼쪽: PieniPlan 홈 + `Plan Mode | CAD Mode`
- 가운데: 현재 프로젝트/도면 이름, 저장되지 않은 변경이 있으면 상태 점 표시
- 오른쪽: Undo / Redo / 보기 / 파일 / 설정 아이콘
- 보기: 화면 맞춤 / 전체 요소 보기
- 파일: 새 도면 / 프로젝트 열기 / 프로젝트 저장 / **프로젝트 파일 다운로드** / DXF 열기 / DXF 내보내기
- **DXF 내보내기**는 지원 브라우저에서 운영체제의 `다른 이름으로 저장` 창을 열어 위치와 파일명을 직접 고릅니다. 미지원 브라우저에서는 PieniPlan이 파일명을 먼저 확인한 뒤 브라우저 다운로드 위치를 사용한다는 점을 명확히 안내합니다.
- 설정: Light / Dark / Black을 즉시 변경, 별도 **사용 안내**와 **정보** 창 제공
- CAD Mode의 좌표/GRID/SNAP/ORTHO/POLAR/배율과 Command는 페이지 하단 고정 행이 아니라 도면 위 HUD입니다. Plan/CAD 모두 왼쪽 아래 Command Console을 공유하고, CAD 전용 X/Y 및 상태값만 별도 영역에 표시합니다.

앱 안의 사용 안내에는 두 모드의 목적, 주요 기능, 파일 흐름, 단축키, 인식/스냅과 문제 해결을 정리합니다. 시작 화면 마지막 줄에는 현재 `Version · Build`를 표시해 캡처만으로도 실행 중인 빌드를 확인할 수 있습니다.

## `.ppln` 프로젝트 저장

PieniPlan의 portable 프로젝트 파일 기본 확장자는 `.ppln`입니다. 기존 `.pieniplan` 파일도 계속 열 수 있으며, 새 portable 파일은 `.ppln`으로 생성합니다.

프로젝트 파일에는 현재 작업에 필요한 상태가 포함됩니다.

- 현재 CAD/Plan 객체
- CAD 전체 레이어 표시 상태 + Drawing Region별 local 레이어 표시 상태
- 삭제·편집된 CAD 상태
- 도면 영역
- Plan 선·문·창·공간·계단·치수
- 기준축과 제약
- 건축 구조 인식 결과/판단 기록
- 원본 DXF 파일명과 식별용 정보

브라우저 보안 때문에 `.ppln` 프로젝트가 같은 폴더의 DXF를 자동으로 읽는 방식은 사용하지 않습니다. 프로젝트 파일 자체가 현재 작업 상태를 복원하며, 원본 DXF 정보는 출처 확인용으로 함께 기록합니다.

직접 쓰기 권한이 있는 파일 핸들로 연 프로젝트는 `Ctrl/Cmd+S`에서 그 파일을 갱신합니다. 그 외의 프로젝트, 특히 Safari처럼 일반 로컬 파일 직접 쓰기를 제공하지 않는 환경에서는 **프로젝트 저장이 다운로드를 만들지 않고 browser-local project storage에 저장**됩니다. 다른 기기나 브라우저로 옮길 `.ppln` 파일이 필요할 때만 File 메뉴의 **프로젝트 파일 다운로드**를 사용합니다. Command의 단독 `S`는 저장 명령으로 사용하지 않으며 CAD 문법의 STRETCH 용도로 예약되어 있습니다.

## FacilityManager 연동 면적 원칙

PieniPlan은 공간 geometry에서 **도면 계산 면적**을 제공하지만, 이 값을 FacilityManager의 공식/관리 면적으로 자동 승격하지 않습니다. FacilityManager의 **관리 면적**은 시설대장·행정자료·사용자 확정값을 보존하는 별도 값이며 새 도면을 가져와도 자동 덮어쓰지 않습니다. PieniPlan 프로젝트에서 참고용 관리 면적을 입력할 수 있지만 geometry 변화와 분리됩니다. FACMAP v0.2.0은 이 책임 경계를 명시합니다.

## 간단한 사용법

### 빠른 평면도 만들기

1. 시작 화면에서 **빠른 평면도**를 선택합니다.
2. 왼쪽 **그리기**에서 `선` 또는 `곡선`을 선택합니다. `L` 명령도 같은 Plan 선을 만듭니다.
3. **요소 → 문**을 누르면 여닫이문·양개문·미닫이문 등 필요한 문 종류를 선택할 수 있습니다.
4. 객체를 선택하면 나타나는 핸들을 끌어 위치·크기·곡률을 조절합니다. 문은 문틀/개구부 전체를 잡아 host 선을 따라 위치 이동하고, 문짝/개폐호 stroke 근처에서만 열림/경첩 방향 gesture를 사용합니다.
5. 표시되는 길이·각도·폭 숫자를 더블클릭하면 정확한 값을 직접 입력할 수 있습니다.
6. **선택 → 제약**으로 일치·수평·수직·평행·직각·각도·길이·위치 고정을 적용합니다. 거리 확인도 **선택 → 거리**에서 사용합니다.
7. 선으로 둘러싸인 곳은 **요소 → 공간 지정**으로 공간 객체를 만듭니다.
8. 필요하면 CAD Mode로 전환해 같은 도면을 더 세밀하게 편집합니다.

### CAD에서 LINE 그리기

명령창에서 `L` 또는 `LINE`을 입력하고 Enter를 누릅니다.

1. 시작점을 클릭합니다.
2. 마우스를 움직이면 다음 선을 미리 볼 수 있습니다.
3. 끝점을 클릭하면 즉시 선 하나가 확정됩니다.
4. 방금 끝점에서 계속 다음 선을 그릴 수 있습니다.
5. 진행 중 `Enter` 또는 `Esc`로 종료합니다. 명령이 없는 상태에서 `Enter`를 누르면 마지막 명령을 다시 실행합니다.

현재 활성 레이어가 숨겨져 있으면 그리기 시작 시 자동으로 표시합니다.

### DXF 일부를 Plan Mode로 가져오기

1. CAD Mode에서 필요한 레이어만 켭니다.
2. **선택 → 도면 영역**으로 필요한 층이나 범위를 지정합니다.
3. 오른쪽 **도면 영역** 목록에서 해당 행의 `…` 메뉴를 엽니다.
4. 목적에 따라 다음 중 하나를 선택합니다.
   - **Plan Mode에서 참조로 열기** — 현재 CAD를 같은 좌표와 축척의 벡터 밑그림으로 사용합니다.
   - **구조 인식해서 Plan Mode로 열기** — 현재 표시 도형을 분석해 벽·방·문·계단 후보를 미리 확인합니다.
   - **이 영역 DXF 내보내기** — 지정 범위만 별도 DXF로 저장합니다.

### 건축 구조 인식

구조 인식은 CAD 선 하나를 Plan 선 하나로 단순 변환하지 않습니다. CAD의 벽 표현을 해석한 뒤 Plan의 연결된 평면 경계선과 요소로 단순화합니다.

- 여러 겹의 평행 제도선을 먼저 하나의 **Wall Band**로 묶습니다.
- 반복되는 벽 두께와 건물의 주 방향을 참고해 같은 벽 조각을 병합합니다.
- 문 때문에 끊긴 정도의 작은 간격은 건축적으로 같은 벽인지 검토합니다.
- 일정 간격으로 반복되는 계단 디딤판 패턴은 벽 후보에서 분리합니다.
- 벽 후보가 만드는 닫힌 경계를 이용해 방/공간 후보를 찾고, 공간 구조를 다시 벽 판단에 활용합니다.
- 원호가 겹쳐 표현된 곡선 벽도 곡선 벽 후보로 분석합니다.
- 결과는 **적용 전까지 가벼운 Preview**로만 유지됩니다. `재인식` 적용 시 이전 자동 인식 레이어를 현재 체크 옵션으로 교체하므로, 예를 들어 계단을 체크 해제하면 이전 자동 인식 계단도 제거됩니다. 직접 만든/수동 수정한 Plan 객체는 유지합니다.
- 병합 후에도 후보가 비정상적으로 많으면 적용을 막고, 레이어를 더 정리하거나 도면 영역을 줄이도록 안내합니다.

자동 인식은 도면 작성 방식에 따라 결과가 달라질 수 있으므로 원본 CAD는 유지하고 Preview를 확인한 뒤 적용하는 흐름을 사용합니다.

## 주요 조작

- `Ctrl/Cmd + Z` — Undo
- `Ctrl/Cmd + Shift + Z` — Redo
- `Delete / Backspace` — 선택 객체 삭제
- `Esc` — 현재 작업 취소 / 선택 해제
- `Space` 짧게 누르기 — Plan Mode에서 선택으로 복귀
- `Space`를 누른 채 Drag — Pan
- `F3` — SNAP
- `F7` — GRID
- `F8` — ORTHO
- `F10` — POLAR
- `Shift` — **Plan Mode:** GLOBAL 45° + 연결선 기준 REF 45° 기하 후보를 동시에 사용. 선 전체 이동은 GLOBAL 수평/수직 + 연결선 평행/수직 축으로 제한. TR/EX 명령 반전에는 사용하지 않음. **CAD Mode:** ORTHO 상태 임시 반전
- `Enter` — 진행 중 단계 확정 / 빈 Command에서 마지막 명령 반복
- `Ctrl/Cmd + S` — 프로젝트 저장 (자동 다운로드 아님)

CAD 명령창에서 현재 지원하는 주요 Alias:

- `L / LINE`
- `M / MOVE` (Plan)
- `CO / COPY` (Plan)
- `TR / TRIM`
- `EX / EXTEND`
- `RO / ROTATE` (특정 CAD 작업 범위)
- `E / ERASE`
- `DI / DIST`
- `Z / ZOOM` → `E / EXTENTS`
- `U / UNDO`
- `REDO`

## 참조 도면

DXF와 이미지를 참조 도면으로 추가할 수 있습니다. 일반 참조 도면은 실제 길이를 알고 있는 두 점을 지정한 뒤 실제 거리를 입력해 축척을 맞출 수 있습니다.

PDF 참조는 예정된 기능이며 현재는 직접 파싱하지 않습니다.

## 화면 모드

- 시스템
- 라이트
- 다크
- 블랙(OLED)

아주 좁은 화면이나 모바일에서는 편집 UI를 억지로 축소하지 않고 **Viewer 중심**으로 동작합니다.

## 현재 범위

PieniPlan은 아직 개발 중입니다. 현재 다음 영역은 계속 확장 중입니다.

- 자동 저장 및 브라우저 복구
- PDF Reference 직접 읽기
- MOVE / COPY / OFFSET 등 더 많은 CAD 편집 명령
- 더 다양한 DXF Entity의 완전한 round-trip 보존
- 문·계단·복잡한 곡선 구조 자동 인식 고도화
- Junction Solver tolerance와 segmented door recognition의 실제 도면별 보정
- 자유 SPLINE을 semantic 평면선으로 편집하는 기능
- FACMAP 내보내기와 FacilityManager 연계

## 로컬에서 실행하기

PieniPlan은 정적 웹앱입니다.

```bash
python3 -m http.server 8000
```

그 뒤 브라우저에서 `http://localhost:8000/`을 엽니다.

브라우저에 따라 `file://`로 `index.html`을 직접 열면 DXF Web Worker가 제한될 수 있습니다.

## 개발 구조

Build 24부터 CAD 확장을 위해 일부 코어 책임을 `modules/`로 분리했고, Build 25는 Astra CAD Core 분기 전 bugfix-only 기준선으로 정리했습니다. 현재 `app.js`는 통합 state와 application orchestration을 유지하고, CAD layer visibility policy, Region transform, command catalog, Command Console은 명시적 module API를 사용합니다. 이 분리는 기능을 바꾸기 위한 것이 아니라 이후 건축 CAD command/selection/snap/block/asset 코어를 독립적으로 확장하기 위한 기반입니다.

## Third-party notices

PieniPlan은 Tabler Icons의 일부 outline SVG 아이콘을 로컬로 포함합니다. 자세한 내용은 `THIRD_PARTY_LICENSES.md`를 확인하세요.


## Build 25 — Pre-Astra Bugfix Baseline

- Removed the legacy hidden `fullExtentsBtn` topbar proxy that could appear as a thin blank bar when DXF outliers existed. The legitimate **All extents** action remains in View/context menus.
- Normalized the existing CAD bottom status strip to one vertical baseline/height so status controls and X/Y coordinates line up. Final compact/icon/responsive status-bar design is deliberately deferred until after the Architectural CAD Core work.
- Added internal Astra handoff material under `_AI_NOT_GITHUB/ASTRA_CAD_CORE/`; it is excluded from GitHub-ready delivery.

## Build 24 — Scoped Layers, Command Console & CAD Core Boundaries

- CAD layer visibility now follows **Full drawing parent → Region local** hierarchy. Each Region remembers its own hidden layers, while a Full-drawing OFF state gates every Region without erasing their local preferences.
- Region layer panels expose **Turn all on / 모두 켜기** for the current local context. A layer hidden by Full drawing remains listed with an inherited disabled state so the reason is visible.
- Removed the clipped top-left CAD-mapping proxy and moved CAD mapping to a proper References card. The left tool rail is slightly narrower without shrinking the icon language.
- Replaced the static COMMAND hint board with a persistent Plan/CAD Command Console with history, live prompts, input and autocomplete; CAD coordinates remain fixed on the far right.
- Began behavior-preserving modularization for future Architectural CAD expansion: layer visibility, Region transform and Command/Console responsibilities now have explicit `modules/` APIs instead of continuing to grow as unrelated `app.js` internals.

## Build 23 — UI recovery, Working Area & Region Rotate

- Plan inspector is now **Floors / References / Properties**. The duplicate Palette tab was removed; Door/Window/Space creation remains in the left Elements group.
- The active Floor's linked CAD tracing is controllable again from References: visibility, opacity and linked-layer visibility can be changed without leaving Plan Mode.
- CAD Working Area is now a persistent inspector context above Layer/Reference/Properties content, with Full drawing/Region selection and active object count.
- Mode changes rerender the Reference inspector so Plan palette content cannot remain under the CAD Reference title.
- Bottom HUD grammar is unified: COMMAND on the left in both modes, CAD X/Y on the far right with reserved numeric width. The top mode switch no longer exposes a horizontal scrollbar.
- Floor tree disclosure triangles are about 170% of the previous visual size with a larger hit target.
- Added Region-scoped `RO / ROTATE`: choose a base point, current reference direction and target direction with live preview. Full drawing rotation is intentionally blocked; linked Plan semantic geometry is not silently rotated with the source CAD.

## Build 22 — CAD Region working set & CAD TR preview

- CAD geometry is kept as one source model. Floor-linked references store Region/view state rather than copying the DXF geometry per floor.
- CAD Mode can work in **Full drawing** or a specific Drawing Region. A Region working set is cached and reused for rendering, selection/hit-test, snap filtering, layer counts and TR/EX cutter candidates.
- Switching from Plan to CAD automatically activates the current Floor's linked Region. Use **Full drawing** to return to the complete CAD.
- Plan semantic geometry is hidden in CAD by default. **Plan overlay** is optional and limited to the Floor associated with the current CAD Region.
- Plan Mode renders only the active Floor's linked CAD reference; linked references for other floors no longer participate in normal rendering.
- Internal floor-linked CAD views are not repeated in CAD's external Reference list.
- CAD `TR` now previews the exact segment to be removed in red before click, matching Plan Mode's destructive-preview principle.

## Build 21 — Command, constraint & semantic workflow refinement

- TR/EX command activation is now state-machine based: typed command, active execution command and last-command repeat are separate states. Switching `TR → EX` or `EX → TR` clears the previous transient operation before the next click.
- Plan Shift is geometry-only: GLOBAL/REF 45° candidates are combined for drawing/endpoints, and whole-line movement can lock to global horizontal/vertical or connected-line parallel/perpendicular axes.
- EX attaches only to the exact intersected boundary and does not perform a nearby-wall reattachment pass. Stale automatic dependents at the extended endpoint are detached conservatively.
- Space Designation has a floating mode HUD and hover face preview.
- Door frame/opening span is the move zone; leaf/arc strokes are direction-gesture zones; swing-sector interior is selection-only.
- Added Fire Door / Fire Shutter semantic elements without claiming a legal-standard symbol.
- Space drawing area and managed area are separated, matching FACMAP v0.2.0 / FacilityManager ownership.
- Recent edit operations are retained in a compact 100-entry debug log inside `.ppln` for reproducible editing diagnostics.

## Build 20 — Space boundary & management refinement

- Space detection treats geometric Plan-line crossings as virtual topology nodes without turning them into persistent editing junctions.
- Open-boundary diagnostics ignore endpoints that already touch another boundary and can be dismissed from a floating control or with Esc.
- Floor space trees are collapsible. Each Space has a compact action menu for rename, type, managed area / calculated drawing area, and delete.
- Managed/reference area is stored separately from drawing-calculated area, so scanned/legacy facility records can coexist without distorting geometry or silently redefining FacilityManager official area.
