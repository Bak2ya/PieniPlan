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
- 문자·치수·Leader·Hatch
- A3/A4 Sheet 및 PDF 출력

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
