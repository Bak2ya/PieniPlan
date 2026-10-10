<p align="center">
  <img src="assets/pieniplan-logo-github.png" width="144" alt="PieniPlan icon">
</p>

# PieniPlan

**Small Web Floor Plan Editor**  
**Plan simply. Draft precisely.**

PieniPlan은 브라우저에서 빠르게 평면을 만들고, 필요하면 같은 도면을 CAD 방식으로 더 정밀하게 다룰 수 있는 웹 도면 편집기입니다.

처음에는 **Facility Manager에서 사용할 간단한 시설 평면을 만들기 위한 도구**로 시작했으며, 이후 같은 도면을 Plan Mode와 CAD Mode에서 함께 다룰 수 있는 편집기로 발전했습니다.

- **바로 실행:** https://bak2ya.github.io/PieniPlan/
- **GitHub:** https://github.com/Bak2ya/PieniPlan

> **Plan Mode는 편하고 단순하게, CAD Mode는 CAD답게.**

Plan Mode와 CAD Mode는 같은 도면과 실제 좌표를 공유하며, 작업 중 언제든 서로 전환할 수 있습니다.

---

## 두 가지 작업 방식

### Plan Mode

시설 관리와 공간 정보 활용을 위한 평면을 빠르고 단순하게 만드는 작업공간입니다.

- 실제 치수 기반의 벽·곡선·공간 작성
- 문·창·계단과 기본 구성품 배치
- 건물 → 도면 → 공간 구조 관리
- 참조 도면을 이용한 트레이싱과 기준 치수 맞추기
- CAD geometry를 Plan 객체로 정리하는 작업 흐름
- Facility Manager에서 이어서 활용할 수 있는 건물·공간 정보의 기반 작성

### CAD Mode

같은 도면을 일반적인 2D CAD 방식으로 더 정밀하게 작성하고 수정하는 작업공간입니다.

- DXF 열기 및 편집
- Layer / Grid / Snap / Ortho / Polar
- LINE / PLINE / Rectangle / Circle / Arc 작성
- TRIM / EXTEND / BREAK / JOIN / OFFSET / FILLET / ARRAY 등 주요 2D CAD 편집
- 문자·치수·Leader·Hatch와 치수 스타일 관리
- 공유 CAD 블록 만들기·삽입·정의 편집·분해 및 반복 배치
- 양방향 기준선(XLINE)·반직선(RAY)
- 시트별 도면번호·개정·표제란과 여러 용지·축척을 유지하는 실제 PDF 출력

---

## 건축 CAD 작업

CAD 도형을 선택하고 `BLOCK`으로 이름과 기준점을 지정한 뒤 `INSERT`로 여러 위치에 배치할 수 있습니다. 도구 막대의 블록 편집에서 공유 정의를 적용하면 같은 블록의 배치가 함께 갱신됩니다. 정의 편집은 좌표·속성 양식과 미리보기 방식입니다. 치수 스타일은 CAD 도구 막대에서 관리하며, 출력 창과 시트 관리에서 도면번호·개정·용지·축척을 설정합니다.

DXF는 지원되는 블록과 치수 의미를 유지합니다. 복잡한 글꼴·해치·동적 블록 등의 일부 표현은 근사 표시 또는 읽기 전용 원본 보존으로 처리하므로 가져오기 후 표시 제한 안내를 확인하세요. 전체 DXF 내보내기와 영역 내보내기의 지원 범위는 다릅니다. 외부 CAD 전달 전 결과를 확인하는 것이 좋습니다.

소스는 정적 웹 서버에서 실행할 수 있습니다. `samples/architectural-blocks.pprj`는 블록·치수·표제란을 살펴볼 수 있는 합성 예제입니다.

---

## Facility Manager와의 관계

PieniPlan의 **Plan Mode에서 만든 건물·공간 정보는 Facility Manager에서 시설 관리용 평면으로 이어서 활용하는 것을 전제로 합니다.**

Facility Manager는 이 Plan 데이터를 읽어 시설 정보를 표시하고, 실제 관리 과정에서 필요한 내용을 이어서 편집하는 역할도 담당합니다. PieniPlan은 도면을 만들고 정리하는 단계에, Facility Manager는 그 도면을 실제 시설 관리에 활용하는 단계에 더 초점을 둡니다.

---

## 주요 기능

- **하나의 도면, 두 가지 작업 방식** — Plan과 CAD가 같은 좌표와 프로젝트를 공유합니다.
- **참조 도면** — DXF, 이미지, PDF를 밑그림으로 불러와 표시·투명도·기준 치수를 조정할 수 있습니다.
- **기본 구성품** — 위생기구, 가구, 가전 등 평면 작업에 자주 쓰는 구성품을 배치할 수 있습니다.
- **정밀 편집** — 선택, Snap, Grip, Layer와 익숙한 CAD식 편집 흐름을 제공합니다.
- **주석과 출력** — 문자, 치수, Leader, Hatch와 빠른 Sheet/PDF 출력을 지원합니다.
- **안전한 작업 흐름** — Undo/Redo, 프로젝트 저장, 브라우저 복구 데이터를 통해 작업을 이어갈 수 있습니다.
- **한국어 / English**, **Metric / Imperial**, **Light / Dark / Black** 환경을 지원합니다.

---

## 프로젝트 파일

### `.pprj` — PieniPlan Project

CAD, Plan, Layer, 참조 도면 등 **전체 작업 상태를 저장하는 프로젝트 파일**입니다.

### `.ppkg` — PieniPlan Plan Package

Plan Mode의 의미 도면을 **공유하거나 여러 도면·건물을 병합하기 위한 가벼운 패키지**입니다.

```text
전체 작업 보관        → .pprj
Plan 결과 공유·병합   → .ppkg
```

메인 화면의 **플랜 병합**을 이용하면 여러 `.ppkg`를 하나의 도면 세트로 정리할 수 있습니다.

---

## DWG 파일 사용

PieniPlan은 DXF를 중심으로 작업합니다. DWG 파일은 별도 경량 변환 도구인 **DWG2DXF**로 DXF로 변환한 뒤 PieniPlan에서 이어서 사용할 수 있습니다.

- **DWG2DXF 웹:** https://bak2ya.github.io/DWGtoDXF/
- **DWG2DXF GitHub:** https://github.com/Bak2ya/DWGtoDXF

---

## 프로젝트 방향

**PieniPlan은 기존 CAD 프로그램의 모든 기능을 담기보다, 2D 건축 평면 작업에 필요한 기능을 단순하고 익숙한 방식으로 제공하는 데 집중합니다.**

Plan Mode와 CAD Mode의 역할은 분명하게 유지하면서도, 사용자가 필요에 따라 두 작업공간을 자연스럽게 오갈 수 있는 도구를 목표로 합니다. 또한 Plan Mode에서 정리한 건물·공간 정보를 Facility Manager의 시설 관리 흐름까지 자연스럽게 이어갈 수 있도록 발전시키고 있습니다.


## 다층 도면과 출력

층 메뉴에서 기준층과 대응점을 지정하면 원본 좌표를 유지한 채 화면 위치·방향을 정렬할 수 있습니다. 보기의 층 겹쳐보기는 비교층을 반투명하게 표시합니다. 정렬은 프로젝트의 보기 정보로 저장됩니다.

CAD 구성품 버튼은 오른쪽의 검색 가능한 벡터 구성품 브라우저를 엽니다. 구성품을 선택해 클릭으로 배치하고 Esc로 종료합니다. 속성 탭은 그대로 사용할 수 있습니다.

시트 / PDF 출력에서 용지, 출력 범위, 축척과 페이지 여백을 설정합니다. 현재 층, 직접 지정한 범위, 현재 화면, 기존 도면 영역과 저장된 시트 범위를 사용할 수 있습니다. DXF·PDF·이미지 참조는 현재 표시 상태를 초기값으로 포함하며, 출력창에서 표시 여부와 불투명도를 조정해도 편집 상태는 바뀌지 않습니다. 미리보기와 같은 도면 장면으로 실제 PDF를 직접 저장합니다. PDF를 인쇄할 때는 인쇄창의 용지 방향과 크기 조절100%를 확인하세요. PDF 참조는 최대300dpi 이미지로 포함됩니다.


## 도면 위 문자 편집

Plan과 CAD의 문자·여러 줄 문자 도구에서 위치를 지정하고 도면 위에 직접 입력합니다. 높이·정렬·회전·줄 폭을 바꿀 수 있으며, 기존 문자도 더블클릭하거나 속성에서 편집합니다. 단일행은 Enter로 완료, 여러줄은 Enter로 줄바꿈하고 Cmd/Ctrl+Enter로 완료합니다. Esc는 취소하고 정상적으로 입력창 밖을 클릭하면 완료합니다. Plan 문자는 해당 층에 저장되며 CAD에서는 읽기 전용 Plan Overlay로 표시됩니다.
