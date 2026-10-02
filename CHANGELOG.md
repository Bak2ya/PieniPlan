# Changelog

## v0.43.2 · Build 60 — 2026-10-02

- Feature Freeze를 유지한 **Plan direct-manipulation 안정화 + 시작화면 polish PATCH**입니다. PPRJ는 schema7 그대로이며 migration/capability 변경이 없습니다.
- P 형태 샘플 도면에서 연결된 벽/곡선을 하나씩 몸통 drag했을 때 인접 벽의 끝점이 따라 움직이거나 늘어나면서 도형이 해체되는 실사용 회귀를 수정했습니다.
- Plan Mode 직접 조작 문법을 명확히 분리했습니다: **벽/곡선 몸통 drag = 선택 객체만 강체 이동 + Wall-to-Wall 접합 해제**, **끝점 handle drag = persistent junction 편집**입니다. 문·창·연결 치수처럼 `wallId/t`로 host되는 의미 요소는 선택 벽과 함께 유지됩니다.
- Shift whole-body constraint는 기존처럼 GLOBAL H/V 또는 연결선 기준 평행/수직 방향을 제공하지만, 이웃 벽 geometry를 끌고 가지 않습니다.
- 시작화면의 hover를 background/border/shadow 변화만으로 끝내지 않고 `translateY(-2px)`을 더해 카드가 살짝 떠오르는 느낌으로 강화했습니다. Reduced Motion에서는 이동을 제거합니다.
- Plan Mode / CAD Mode 카드 위의 작은 장식 아이콘을 제거하고 카드 높이/상단 여백을 정리했습니다. 상단 `첫 공구함` 설명 폭을 넓혀 한국어 마지막 `다.`가 단독 줄로 떨어지는 현상을 없앴습니다.
- 공개 README를 제품 소개 중심으로 축약하고, PieniPlan의 출발점과 **Plan Mode → Facility Manager reader/추가 편집 흐름**을 핵심 관계로 다시 명시했습니다.
- Verification: Plan body-drag focused Chromium **12/12 PASS**, start-screen **16/16**, Final Feature Fill **13/13**, CAD Core2 **16/16**, Stage4 **10/10**, Legacy **21/21**, Annotation/Reference **12/12**. Product JS syntax **34/34**, i18n EN/KO **920/920**, local refs **41/41**, 테스트 대상 page/console error 0.

## v0.43.1 · Build 59 — 2026-10-02

- Feature Freeze를 유지한 **시작화면 polish PATCH**입니다. 기능·geometry·storage/schema 계약은 변경하지 않았습니다.
- 시작화면의 최대 폭을 줄여 넓은 화면에서도 핵심 선택지가 한 덩어리로 읽히게 했고, `Plan Mode` / `CAD Mode` 이름을 더 큰 주 제목으로 올려 두 작업공간의 위계를 강화했습니다.
- 상단 설명을 `여기서 고르는 것은 첫 공구함뿐입니다` 메시지로 통합하고, 하단의 중복 안내 문구를 제거했습니다.
- `이어하기` 안의 `프로젝트 열기 (.pprj)` / `플랜 패키지 열기 (.ppkg)` / `현재 도면 계속하기`를 같은 row 문법으로 통일했습니다. 현재 도면만 accent surface로 강조하며, 파일명과 browser-saved/current-work action을 상태에 맞게 표시합니다. 사이트 데이터 삭제 안내는 현재 도면 카드 안으로 이동했습니다.
- `플랜 패키지 열기` 설명에 단일 건물 또는 여러 건물이 포함될 수 있음을 명시했습니다.
- `DWG2DXF`는 실제 웹앱의 `icon-192.png`를 사용하고 `DWG2DXF 열기`와 `GitHub에서 보기`를 분리했습니다. 네트워크에서 아이콘을 불러오지 못하면 기존 DWG/DXF badge가 fallback으로 남습니다.
- 시작 카드/이어하기/추가 도구 hover를 위치 이동 없이 background/border/shadow가 약 170ms로 자연스럽게 스며드는 방식으로 통일했고 `prefers-reduced-motion`을 존중합니다.
- Verification: Build59 start-screen Chromium **21/21 PASS**, Final Feature Fill **13/13**, CAD Core2 **16/16**, Stage4 **10/10**, Legacy **21/21**, Annotation/Reference **12/12**. JS syntax **34/34**, i18n EN/KO **920/920**, local refs **41/41**, 테스트 대상 page/console error 0. 오프라인 자동화에서는 외부 DWG2DXF icon request를 stub하고 URL/구조를 별도로 검증했습니다.

## v0.43.0 · Build 58 — 2026-10-02

- Feature Freeze 전 **Final Feature Fill**을 완료했습니다. CAD Draw에 `REC/RECTANG/RECTANGLE`, `C/CIRCLE`, `A/ARC`를 정식 authoring command로 열어 Rectangle, analytic Circle, standalone analytic Arc를 직접 작성할 수 있습니다.
- `ARRAY (AR)`에 **Polar Array**를 추가했습니다. 중심점 → 전체 항목 수 → 채움 각도(Enter 기본 360°) 흐름이며 analytic Circle/Arc와 persistent PLINE을 similarity transform으로 유지합니다. 기존 `AR → 열/행/간격` rectangular 입력은 첫 숫자를 열 개수로 해석해 하위호환을 유지합니다.
- persistent PLINE grip 편집에 **vertex 삽입/삭제**를 추가했습니다. edge 우클릭 또는 더블클릭으로 삽입하고 vertex 우클릭으로 삭제합니다. 기존 owner/source edge identity를 가능한 범위에서 유지하고 ARC 삽입은 analytic sweep을 정확히 분할합니다. 혼합/비호환 curved topology 삭제는 근사하지 않고 fail-closed합니다.
- `A/ARC`와 `AR/ARRAY` 같은 prefix 충돌에서 정확히 입력한 command를 autocomplete prefix 후보보다 우선하도록 command matching을 정리했습니다.
- 현재 구현과 모순되던 `STRETCH 미지원`, `ARRAY rectangular only`, `Circle / Arc` 묶음 표기 등 runtime 도움말/README의 stale 상태 문구를 정리했습니다.
- 저장 형식은 **PPRJ schema7 그대로**이며 새 capability를 요구하지 않습니다. Build57 Annotation v2 / PDF reference 및 기존 CAD Core2 동작을 유지합니다.
- Verification: Build58 focused Chromium **13/13 PASS**, CAD Core2 inherited **16/16**, Stage4 **10/10**, Legacy **21/21**, Annotation/Reference **12/12**, pure Final Feature Fill core **6/6**. JS syntax **34/34**, i18n EN/KO **918/918**, local refs **41/41**, page/console error 0.

## v0.42.0 · Build 57 — 2026-10-02

- Annotation / Output 2차 feature-fill을 추가했습니다. `MT/MTEXT` 여러 줄 문자와 줄바꿈/폭, `LE/LEADER` Callout, `DRA` 반지름, `DDI` 지름, `DAN` 각도, `DCO` 연속, `DBA` 기준선 치수를 persistent CAD 객체로 저장합니다.
- HATCH에 ANSI31 / Cross / Solid 패턴, 각도, 간격 편집과 기존 draw-order 조절을 연결했습니다. source boundary가 남아 있는 경우 경계 업데이트 흐름도 보존합니다.
- Sheet/PDF quick output이 여러 줄 문자, Leader, 고급 Dimension, Hatch 패턴을 반영합니다. 고급 주석의 DXF R12 출력은 LINE/TEXT 호환 fallback을 사용합니다.
- Reference 2차로 PDF 참조를 추가했습니다. PDF 첫 페이지를 브라우저 내장 PDF 렌더러 underlay로 표시하고, 배치/불투명도/축척/사각 Clip을 유지합니다.
- 이미지/DXF/PDF 참조에 원본 이름·크기·수정시각·SHA-256 source metadata를 기록하고, 사용자가 원본 파일을 다시 선택하면 수동 재연결 및 변경 여부를 비교합니다. 브라우저 보안 모델 때문에 로컬 파일을 백그라운드에서 자동 감시하지는 않습니다.
- PPRJ를 schema7로 올리고 `cad.annotation.v2`, `reference.pdf.v1` capability를 추가했습니다. schema5 Polyline 및 schema6 Annotation v1 프로젝트는 계속 검증/열기 가능하도록 유지합니다.
- Build56 시작화면/P 샘플과 Build55 CAD Core2 동작을 회귀검사로 유지했습니다.

## v0.41.1 · Build 56 — 2026-10-02

- 시작화면의 정보 위계를 다시 정리했습니다. `Plan Mode · 빠른 평면도` / `CAD Mode · DXF 도면`에서 모드 이름을 주 제목으로 올리고 설명을 더 사용자 친화적으로 다듬었으며, 진입 CTA를 카드 오른쪽 아래에 정렬했습니다.
- `현재 도면 이어하기`와 PPRJ/PPKG 열기를 하나의 **이어하기** 카드로 묶었습니다. 이어갈 작업이 없을 때도 카드 구조가 유지되고 자연스러운 empty state를 표시합니다. 브라우저 사이트 데이터 삭제 시 browser-saved project/recovery data가 사라질 수 있다는 안내를 추가했습니다.
- `플랜 병합`과 외부 보조도구 `DWG2DXF`를 동일 크기의 **추가 도구** 카드로 묶고, DWG2DXF는 별도 변환 badge로 시각적 위계를 높였습니다.
- `샘플 도면으로 둘러보기`를 하단의 가벼운 진입 버튼으로 이동하고, 기존 사각형 샘플을 PieniPlan 아이콘을 연상시키는 **P 형태의 실제 editable Plan 도면**(직선/곡선 벽, 문, 창, 치수)으로 교체했습니다.
- 기능/저장 schema는 변경하지 않습니다. PPRJ schema6 + 기존 capabilities와 Build55 CAD Core 2 동작을 그대로 유지합니다.

## v0.41.0 · Build 55 — 2026-10-02

- CAD Core 2 feature-fill: 일반 CAD source 객체에 selection-first `MOVE (M)`, `COPY (CO)`, `ROTATE (RO)`, `MIRROR (MI)`, uniform `SCALE (SC)`를 추가했습니다. 기존 Drawing Region 회전은 `RR / REGIONROTATE`로 분리해 보존합니다.
- `STRETCH (S)` crossing/control-point 편집, rectangular `ARRAY (AR)`, 2-point `ALIGN (AL)`(+ 선택적 uniform scale)을 추가했습니다.
- `CHAMFER (CH)`를 primitive LINE↔LINE 및 persistent PLINE 내부 인접 LINE↔LINE 코너에 추가했습니다. PLINE owner/source edge identity는 가능한 범위에서 유지하며 새 bevel topology에만 fresh ID를 부여합니다.
- CAD selection에 Previous / Last / Select Similar command, Option/Alt-click overlap cycling을 추가했습니다.
- persistent PLINE 선택 시 vertex grip을 표시하고 각 vertex를 직접 drag 편집할 수 있게 했습니다. 500 vertex를 넘는 owner는 화면 grip 폭증을 피하기 위해 개별 grip 표시를 생략합니다.
- transform은 LINE/CIRCLE/ARC/TEXT/DIMENSION/HATCH/persistent PLINE의 analytic geometry를 유지하며, non-uniform scale/ellipse 변환은 이번 범위에 포함하지 않습니다.
- Verification: CAD Core 2 focused Chromium **16/16 PASS**, inherited Stage4 **10/10**, legacy geometry/Polyline **21/21**, pure Core 2 **8/8**, Polyline Modify core **11/11**, static JS **32/32**, i18n EN/KO **826/826**, local refs **39/39**.

## v0.40.0 · Build 54 — 2026-10-02

- Annotation/Sheet Stage4 최소 수직 단면을 구현했습니다.
- CAD `TEXT (T)`, 정렬 치수 `DLI/DIM`, 닫힌 PLINE 기반 `HATCH (H)` 작성 지원.
- 주석 객체를 PPRJ schema6 / `cad.annotation.v1` capability로 저장·재열기합니다.
- File → Sheet / PDF 및 `SHEET/PLOT/PRINT`로 현재 CAD 뷰 중심을 A3/A4, portrait/landscape, 지정 축척 시트로 저장하고 브라우저 인쇄/Save as PDF 경로를 엽니다.
- Sheet 출력은 CAD 레이어의 printable 설정을 존중합니다.
- Build53의 CAD L/PL Shift 45° + Base Axis 임시 제약을 포함합니다.
- 104k 실제 프로젝트 성능 검증은 사용자 결정대로 Stabilization 단계로 보류합니다.

## v0.39.0 · Build 53 — 2026-10-02

- CAD `L` / `PL`에서 Shift 임시 제약을 기존 90° ORTHO 반전이 아니라 **가까운 45° 방향 계열**로 확장했습니다.
- Base Axis가 설정되어 있으면 Shift 후보에 **Base-Axis 기준 45° 계열**도 함께 포함합니다.
- F8 ORTHO, F10 POLAR의 persistent 상태는 그대로 유지하며 Shift는 작성 중 임시 제약으로만 작동합니다.
- Build52 Curve Reconstruction 및 Build51 Polyline Modify 계약은 변경하지 않았습니다.

## v0.38.0 · Build 52 — 2026-10-02

- Added semi-automatic **Curve Reconstruction (`CR`)** in both CAD and Plan modes. Users select curve fragments, review a live fitted-circle preview, click included fragments again to exclude them, use **Find more** to add nearby matching candidates, then explicitly commit the result.
- CAD reconstruction currently accepts editable primitive **LINE / ARC** fragments on the same editable layer and appearance, replacing them atomically with one analytic `cadArc`. Persistent Polyline owners are intentionally kept intact rather than partially exploded.
- Plan reconstruction converts safe wall fragments into one persistent **Curved Wall** while preserving wall thickness and CAD-recognition provenance where possible. It fails closed when selected walls have hosted openings/dimensions, external wall relations, geometric constraints, incompatible layers, or materially different thicknesses.
- Reconstruction is preview-only until explicit commit. CAD uses the existing ChangeSet history path; Plan uses project history, and both support Undo/Redo and normal PPRJ persistence without changing schema5 / PPKG schema1.
- Added a pure circle-fit/candidate module (`modules/cad/curve-reconstruction.js`) with conservative residual/radius/sweep guards and explicit exclusion handling for Find more.
- Verification: Curve Reconstruction pure core **7/7 PASS**, focused Chromium **13/13**, inherited focused **21/21**, full **14/14**, PLINE baseline **11/11**, Context baseline **7/7**, command lifecycle **8/8**, Shift **3/3**, JOIN **7/7**, OFFSET input **7/7**, OFFSET **8/8**, FILLET **11/11**, Polyline Modify **10/10**. Current-schema P0 **28/28** and Polyline Modify core **11/11** remain PASS. Product JS syntax **30/30**, i18n **774/774**, local HTML refs **37/37**. Safari/Retina hands-on remains to be verified.

## v0.37.0 · Build 51 — 2026-10-02

- Completed the persistent Polyline **FILLET** family for adjacent LINE↔LINE, LINE↔ARC and ARC↔ARC corners. The solver uses exact tangent loci, keeps retained source ARC segments on their original circle locus, preserves existing owner/edge identity where possible, and fails closed on degenerate or ambiguous solutions rather than linearizing curves.
- Added explicit persistent Polyline **Close / Open** actions in Properties and the object context menu. Close adds one straight last→first closing edge with fresh topology; Open removes that stored closing edge. JOIN still does not silently auto-close loops.
- Improved Polyline **JOIN** guidance without changing its geometry contract: after the first open source is selected, both eligible source endpoints are highlighted and the prompt explicitly asks for a second open object whose endpoint touches one of them.
- Added integrated Polyline Modify verification across TRIM / JOIN / OFFSET / FILLET / Close / Open, including Undo/Redo and PPRJ save→reload. PPRJ remains schema5 with `cad.polyline.lineArc.v1`; PPKG remains schema1.
- Verification: Build51 Polyline Modify core **11/11 PASS**, integrated browser regression **10/10**, FILLET **11/11**, command lifecycle **8/8**, OFFSET input **7/7**, OFFSET **8/8**, JOIN **7/7**, Shift **3/3**, PLINE baseline **11/11**, Context baseline **7/7**, focused **21/21**, full **14/14**. Pure BREAK/EXTEND/TRIM/JOIN **9/9 each**, OFFSET **7/7**, current-schema P0 **28/28**. Product JS syntax **29/29**, i18n **758/758**, local HTML refs **36/36**.

## v0.36.0 · Build 50 — 2026-10-01

- Added the first persistent Polyline **FILLET** gate. `F` / Modify → Fillet accepts a radius, then two adjacent LINE segments on the same open or closed `cadPolyline` owner.
- FILLET keeps the Polyline owner and both original adjacent LINE edge IDs, moves the shared corner vertex to the incoming tangent point, and inserts one fresh tangent vertex plus one fresh ARC edge. Primitive LINE↔LINE FILLET remains unchanged.
- The two clicks identify the exact adjacent segments. Non-adjacent segments, same-segment picks, oversize radii, cross-owner Polyline picks, and LINE↔ARC / ARC↔ARC corners fail closed rather than guessing or approximating.
- Added Fillet to the CAD Modify Ribbon/context flow with the same radius-entry focus behavior as OFFSET and transient source highlight behavior from Build49.
- PPRJ remains schema5 with `cad.polyline.lineArc.v1`; PPKG remains schema1. Existing open-Polyline Close/Open, Curve Reconstruction and Annotation/Sheet Stage4 remain separate gates.

## v0.35.1 · Build 49 — 2026-10-01

- Fixed OFFSET command input focus: after `O` starts, the Command Console now keeps focus for immediate distance entry; invalid distance input stays editable, and a valid distance advances to canvas source selection without requiring a manual click back into the command field.
- Added a transient Modify-source highlight after OFFSET/other native Modify source selection so a persistent Polyline is visibly acknowledged before the result-side click. This highlight is command state only and does not alter document selection; it clears on cancel/finish.
- Kept the Build48 Polyline OFFSET geometry/topology contract unchanged. No FILLET work is included in this PATCH; PPRJ remains schema5 with `cad.polyline.lineArc.v1`, PPKG remains schema1.
- Verification: Build49 OFFSET-input focused Chromium **7/7 PASS**, command lifecycle **8/8**, OFFSET regression **8/8**, inherited focused **21/21**, full **14/14**, PLINE baseline **11/11**, Context baseline **7/7**, JOIN **7/7**, Shift regression **3/3**. Pure OFFSET **7/7**, JOIN/TRIM/EXTEND/BREAK **9/9 each**, current-schema P0 **28/28**. Product JS syntax **29/29**, i18n **749/749**, local HTML refs **36/36**.

## v0.35.0 · Build 48 — 2026-10-01

- Expanded **OFFSET (O)** to persistent open/closed `cadPolyline` owners while preserving the existing primitive LINE/CIRCLE/ARC OFFSET path.
- Polyline OFFSET creates a new owner and never mutates the source. The side click chooses one consistent traversal-relative side; LINE edges stay parallel and ARC edges stay concentric with their signed traversal preserved.
- Adjacent offset LINE/ARC supports are joined analytically at their local intersection. Ambiguous/unresolved joins and collapsed ARC radii fail closed instead of silently approximating geometry.
- New offset owners, vertices and edges receive fresh IDs at commit; the source owner and every source sub-ID remain untouched. Undo/Redo and PPRJ validation continue through one CAD ChangeSet. PPRJ remains schema5 with `cad.polyline.lineArc.v1`; PPKG remains schema1.
- Carried forward the Build47 command-lifecycle repair so Enter/Space can normally finish the active CAD command and an exact new command can supersede an active command without requiring a preliminary Esc. PLINE local keywords and numeric/coordinate command input remain local to their active command.
- Verification: OFFSET focused Chromium **8/8 PASS**, OFFSET pure **7/7**, command lifecycle **8/8**, inherited focused **21/21**, full **14/14**, PLINE baseline **11/11**, Context baseline **7/7**, JOIN focused **7/7**, Shift regression **3/3**, JOIN/TRIM/EXTEND/BREAK pure **9/9 each**, current-schema P0 **28/28**, product JS **29/29**, resource refs **65/65**, i18n **749/749**, index local refs **36/36**. Safari/Retina hands-on OFFSET and integrated 104k real-project performance remain unverified.

## v0.34.1 · Build 47 — 2026-10-01

- Fixed CAD command lifecycle behavior that could leave the previous command owning input after the user had finished it, forcing an unnecessary Esc before the next command.
- Enter/Space now performs a normal finish for active non-continuous CAD commands and returns to Select. LINE/PLINE keep their explicit continuous-command finish path.
- Typing an exact global command while another CAD command session is active now supersedes the old session directly. PLINE-local `LINE/ARC/BACK/CLOSE` keywords and numeric/coordinate input are still dispatched to the active command rather than stolen by global command resolution.
- Focused Chromium lifecycle regression **7/7 PASS**. This PATCH was used as the clean command-state baseline for Build48; JOIN geometry/topology was not changed.

## v0.34.0 · Build 46 — 2026-10-01

- Added **JOIN (J)** for persistent open `cadPolyline` owners while preserving the existing primitive `cadLine` JOIN path.
- Polyline JOIN accepts exactly one coincident terminal endpoint pair. It does not bridge gaps, guess interior attachments, combine mismatched owner metadata, join closed owners, mix LINE↔Polyline topology, or silently close a loop.
- The first selected Polyline owner and its shared terminal vertex survive. The second junction vertex retires while all other retained vertex/edge IDs remain stable. Required traversal reversal preserves edge identity and the analytic ARC locus while flipping signed bulge direction as needed.
- JOIN uses the existing CAD operation preview and one ChangeSet commit, so Undo/Redo and PPRJ save/reopen remain atomic. PPRJ stays schema5 with `cad.polyline.lineArc.v1`; PPKG stays schema1.
- Updated Modify Ribbon, command help/shortcut text, Context metadata, and README for the now-ready JOIN command. Polyline OFFSET and FILLET remain the next gates; post-authoring Close/Open remains separate.
- Verification: JOIN focused Chromium **7/7 PASS**, JOIN pure **9/9 PASS**, inherited focused **21/21**, full **14/14**, PLINE baseline **11/11**, Context baseline **7/7**, Shift regression **3/3**, TRIM/EXTEND/BREAK pure **9/9 each**, existing core **85/85**, product JS **29/29**, resource refs **65/65**, i18n **749/749**, index local refs **36/36**. Build46 JOIN still needs real Safari/Retina use confirmation.

## v0.33.1 · Build 45 — 2026-10-01

- Fixed a CAD TRIM modifier-state regression where a stale internal Shift state could make a normal Polyline TRIM click execute the temporary EXTEND path instead, producing `해당 방향에서 연장할 경계를 찾지 못했습니다.` even though Shift was not held.
- Pointer move/down now resynchronize CAD Shift state from the actual pointer event, and TRIM/EXTEND commit receives that event modifier explicitly so preview and commit use the same modifier state.
- Preserved intentional CAD Shift inversion: holding Shift during TRIM still temporarily requests EXTEND, while Plan Mode Shift remains geometry-constraint-only.
- No Polyline topology/schema contract changed; ARC TRIM continues to use the Build44 analytic geometry path. PPRJ remains schema5 with `cad.polyline.lineArc.v1`; PPKG remains schema1.

## v0.33.0 · Build 44 — 2026-09-30

- Expanded **TRIM (TR)** to persistent `cadPolyline`. The clicked analytic edge is the local trim domain; valid interior cutter crossings split that edge into intervals and the interval under the click is removed without silently consuming neighboring edges.
- Added straight and ARC Polyline trimming. Retained ARC fragments stay on the same circle and signed traversal while authoritative bulges are recomputed.
- Open Polyline TRIM can leave one or two open owners; closed Polyline TRIM removes the clicked interval and reopens the remaining traversal as one owner. Existing retained vertex/edge IDs survive where possible, while new cut boundaries and additional owners receive fresh IDs at commit.
- Another Polyline can act as a read-only TRIM cutter. Hidden/work-range-excluded geometry remains ineligible, locked targets fail before mutation, and Undo/Redo commits topology changes atomically through the existing CAD ChangeSet path.
- Added a subtle **DWG2DXF** helper to the PieniPlan start screen and README for users who need to prepare a DWG as DXF. DWG2DXF remains a separate optional tool rather than a required PieniPlan component.
- Deferred Polyline JOIN/OFFSET/FILLET, post-authoring Close/Open, Curve Reconstruction, and Stage4 to later gates; PPRJ schema5 and `cad.polyline.lineArc.v1` remain unchanged.
- Verification: Build44 focused Chromium **21/21 PASS**, inherited full Chromium **14/14 PASS**, PLINE baseline **11/11 PASS**, Context Menu baseline **7/7 PASS**, Polyline TRIM pure **9/9 PASS**, EXTEND pure **9/9 PASS**, BREAK pure **9/9 PASS**, existing CAD core **85/85 PASS**, product JS syntax **29/29 PASS**, i18n **EN/KO 746/746** exact parity/no duplicates, local refs **36/36**, browser page/console errors **0**. Safari/Retina and integrated 104k real-project performance remain real-device/fixture checks, not claimed here.

## v0.32.0 · Build 43 — 2026-09-30

- Expanded **EXTEND (EX)** to persistent `cadPolyline` as the next P3 Modify gate. Open polylines can extend from the first or last terminal segment; clicking an interior segment never guesses a distant endpoint, and closed polylines remain intentionally unsupported in this gate.
- Added both straight and ARC terminal extension. Straight segments continue on their terminal ray; ARC segments stay on the same circle and signed traversal direction while recomputing the authoritative bulge. Owner, vertex, and edge IDs remain unchanged because EXTEND moves only the terminal vertex/curve endpoint and does not split topology.
- Polyline EXTEND uses the nearest valid visible/snappable boundary and can use another Polyline as a read-only boundary. Hidden/work-range-excluded geometry remains ineligible.
- Extended the Polyline owner spatial-tree broad phase with bounds-predicate ray traversal so pointer preview does not fall back to a flat scan across Polyline owners.
- EXTEND preview now renders the actual extension geometry: dashed straight continuation for LINE terminal edges and a true curved ARC continuation for ARC terminal edges. Existing cadLine EXTEND and Shift TRIM/EXTEND grammar are preserved.
- Deferred Polyline TRIM/JOIN/OFFSET/FILLET and Curve Reconstruction to later gates; schema5 and `cad.polyline.lineArc.v1` remain unchanged.
- Verification: Build43 focused Chromium **14/14 PASS**, inherited full Chromium **14/14 PASS**, PLINE baseline **11/11 PASS**, Context Menu baseline **7/7 PASS**, new Polyline EXTEND pure core **9/9 PASS**, Polyline BREAK pure core **9/9 PASS**, existing CAD core **85/85 PASS**, product JS syntax **29/29 PASS**, i18n **EN/KO 744/744** exact parity/no duplicates, page/console errors **0**. Safari/Retina and integrated 104k real-project performance remain real-device/fixture checks, not claimed here.

## v0.31.0 · Build 42 — 2026-09-30

- Added the first topology-changing persistent Polyline Modify command: **BREAK (BR)** now accepts `cadPolyline` as well as the existing `cadLine` path. Open polylines can split into two owners; closed polylines remove the first-pick→second-pick forward path and become one open owner.
- Defined and implemented BREAK identity rules: untouched vertex/edge IDs survive, the first retained fragment of a split edge keeps the original edge ID, later retained fragments receive fresh IDs, the first retained owner keeps the original owner ID, and additional owners receive fresh IDs. Preview-only topology uses placeholder IDs so pointer movement never consumes persistent IDs.
- Preserved exact ARC loci during BREAK by deriving partial bulges from the retained signed sub-sweep. Positive/negative bulges and same-edge splitting are covered by focused pure tests.
- Unified active-command action metadata for the PLINE Context strip and Canvas right-click menu. While PLINE is active, `직선 / 호 / 되돌리기 / 닫기` are sourced from the same command-session `actions` description; the active choice is checked and unavailable actions remain visible but disabled. These ephemeral command actions do not create individual Settings rows.
- Added a ready **끊기 / Break** entry to the CAD Modify Ribbon and kept the existing `BR` command grammar. Locked/hidden/work-range policy remains authoritative before topology mutation, and Undo/Redo stores the change as one CAD ChangeSet.
- Deferred Polyline EXTEND/TRIM/JOIN/OFFSET/FILLET and Curve Reconstruction to later gates; schema5 and `cad.polyline.lineArc.v1` remain unchanged.
- Verification: Build42 focused Chromium **8/8 PASS**, PLINE baseline **11/11 PASS**, inherited full Chromium **14/14 PASS**, Context Menu baseline **7/7 PASS**, new Polyline BREAK pure core **9/9 PASS**, existing CAD core **85/85 PASS**, product JS syntax **29/29 PASS**, i18n **EN/KO 744/744** exact parity/no duplicates, page/console errors **0**. Safari/Retina and integrated 104k real-project performance remain real-device/fixture checks, not claimed here.

## v0.30.0 · Build 41 — 2026-09-30

- Opened the Astra P1/P2 persistent Polyline foundation as the first user-facing **P3 PLINE vertical slice** in CAD Mode. PLINE now authors one persistent `cadPolyline` owner instead of exploding the result into independent LINE/ARC objects.
- Added continuous straight-segment input plus ARC segment mode using endpoint + on-arc control point. The live preview and committed bulge use the same circle fit, and users can switch Line/Arc, Back the current draft, Close a valid chain, or finish an open chain with Enter/Space. Esc cancels without publishing draft geometry.
- Added typed CAD coordinates to PLINE, including absolute/relative input through the existing unit parser and command grammar.
- Added whole-owner Polyline interactions without topology edits: direct body Move, Duplicate with fresh owner/vertex/edge IDs, 90° Rotate, left/right and up/down Mirror, Properties topology summary, Selection, Undo/Redo, and PPRJ schema5 save/reopen. Similarity transforms preserve owner/vertex/edge identity; mirrors reverse bulge sign as required.
- Added a compact PLINE Context strip (`직선 / 호 / 되돌리기 / 닫기`) and transient line/arc preview. The persistent model is not changed until final commit.
- Preserved Build40 Context Menu/Settings override behavior, Build38 Layer reveal, Build37 Layer policy, Build35 Components, and the existing P1/P2 Render/Selection/Snap/GeometryQuery cache/index architecture.
- Intentionally did **not** add Polyline TRIM/EXTEND/BREAK/JOIN/OFFSET/FILLET, Curve Reconstruction, associative annotation, or Sheet expansion. Those remain separate gates because they can change topology identity/remapping rules.
- Verification: Build41 focused Chromium regression **11/11 PASS**, Build41 inherited full Chromium regression **14/14 PASS**, core pure suites **85/85 PASS**, product JS syntax **29/29 PASS**, i18n **EN/KO 742/742** with exact key parity and no duplicates. Browser page/console errors **0** in both regression runs. Safari/Retina feel remains a real-device check.

## v0.29.1 · Build 40 — 2026-09-30

- Fixed Context Menu `Show` override coexistence for the Select group. `Return to Select` is now treated as an always-executable, idempotent command whose **Auto** recommendation appears only when another tool is active; if the user explicitly sets it to **Show**, it can remain visible even while Select is already active.
- Preserved additive `Show` semantics across distinct commands: setting both `Return to Select` and `Define Drawing Region` to **Show** keeps both commands in the same right-click menu instead of letting recommendation state suppress one of them.
- `Show` still does not bypass real mode/object/permission/lock applicability for commands that are genuinely unavailable. No project schema, geometry, Layer, Polyline, Component, or Settings-storage contract changes are included.
- Verification: Build40 focused Chromium regression **7/7 PASS**, Build40 full Chromium regression **14/14 PASS**, core pure suites **85/85 PASS**, product JS syntax **28/28 PASS**, i18n **EN/KO 719/719** with exact key parity. Page/console errors **0** in browser regressions.

## v0.29.0 · Build 39 — 2026-09-29

- Rebuilt the Canvas right-click menu as a contextual command surface driven by the existing tool/command catalog instead of maintaining separate per-tool menu trees. Runtime order follows the approved grammar: return to Select, current/related commands, same tool-group commands, then other recommendations.
- Added command-context preference policy with safe defaults and user overrides. Each eligible command can use `Auto / Show / Hide` visibility and `Default / High / Normal / Low` priority without changing its group, mode, applicability, permission, or execution rules.
- Added a Settings sidebar. Existing preferences remain under **General**, while **Context Menu** provides Plan/CAD mode selectors and one-level collapsible groups that mirror the tool categories. Overrides are app-local preferences and never become PPRJ project data.
- Added reset-to-default behavior for Context Menu overrides. Defaults continue to follow PieniPlan updates unless the user has explicitly overridden a command.
- Tightened the right-click menu to intrinsic/content-fit width with command shortcut notes while preserving the existing Compact Ribbon and Canvas space.
- Cleaned up the Layer color popover lifecycle so its outside-click listener is removed immediately when the popover closes by color selection.
- No PLINE/P3, Polyline Modify, Curve Reconstruction, or Stage4 feature expansion is included in this build.
- Verification: Build39 focused Chromium regression **6/6 PASS**, Build39 full Chromium regression **14/14 PASS**, core pure suites **85/85 PASS**. Final static resource/i18n counts are recorded in the Build39 verification summary. Safari/Retina real-project feel remains a user-device check.

## v0.28.2 · Build 38 — 2026-09-29

- Reworked CAD object → Layer reveal using the browser’s actual rendered geometry instead of assuming a row offset. The selected Layer uses `scrollIntoView({block: "nearest"})`, then checks the real row/list `getBoundingClientRect()` values and applies only the minimum `scrollBy()` correction if Safari/other layout metrics still leave the row clipped.
- Added a brief Layer focus pulse after reveal so the user can immediately identify the exact selected-object Layer without changing the current Layer, visibility, or Region override.
- Clarified Compact Ribbon split buttons: tool groups have more space between them, a subtle group surface, and only a short internal divider between the main tool and chevron, avoiding the visual reading of `|▼ 벽|` as one combined control.
- Removed `공간 지정 / Space designation` from the CAD Architecture menu. Space remains a Plan semantic workflow; future CAD closed-area tools should use CAD-specific Region/Hatch/area concepts instead.
- Renamed the Select-menu command `도면 영역 / Drawing Region` to `도면 영역 지정 / Define Drawing Region` so the menu item reads as an action while the Inspector section remains the noun `도면 영역`.
- Verification: Build38 focused Chromium regression **4/4 PASS**, Build38 full Chromium regression **14/14 PASS**, Polyline **26/26**, GeometryQuery **13/13**, History **6/6**, Modify **7/7**, Command/Core **5/5**, P0 correctness **28/28**; page/console errors **0**. Safari/Retina real-project feel remains the final user-device check.

## v0.28.1 · Build 37 — 2026-09-29

- Fixed CAD Wall/Door/Window authoring visibility: activating any semantic architectural authoring tool now enables the Plan overlay before drawing, so newly created walls/openings remain visible and selectable instead of being created behind an off overlay.
- Unified CAD source Layer resolution across `cadLayer`, legacy `layer`, and `sourceLayer` for render visibility, Selection, Snap, Modify/lock policy, Layer focus, properties, layer rename/delete usage checks, DXF export, and recognition helpers.
- Updated CAD document context and Layer synthesis/visibility helpers so legacy source geometry no longer falls back to Layer 0 internally while the Inspector shows a different Layer.
- Preserved Build36 schema5/cadPolyline, Components, Region Layer overrides, Compact Ribbon, typography, and tool Context behavior. No PLINE/P3/Curve Reconstruction/Stage4 expansion is included.
- Verification: Build37 focused Chromium regression **3/3 PASS**, Build37 full Chromium regression **14/14 PASS**, core pure suites **85/85 PASS**, JS syntax PASS, local resources **63/63**, i18n **EN/KO 702/702**, page/console errors **0**. Safari/Retina remains the final hands-on check.

## v0.28.0 · Build 36 — 2026-09-29

- Integrated the reviewed Astra P1/P2 foundation into the Build35 source without replacing Build35 UI/Layer/Component work: persistent `cadPolyline`, PPRJ schema5 capability gating, stable owner/vertex/edge identity, derived analytic LINE/ARC cache, spatial indexing, and shared Render/Selection/Snap/GeometryQuery semantics.
- Preserved Build35 `ComponentInstance`, Layer scope/color/settings, File/View menus, and Starter Components while merging the Polyline path; project validation now recognizes both `component` and `cadPolyline`.
- Rebased UI text-size presets after real Safari review: Build35 **Small** is now the new **Default**, with denser **Small** and **Smaller** presets plus **Large**. Brand text remains stable while content-fit Ribbon/popover/context spacing tightens with smaller text.
- Fixed CAD object → Layer focus to use one layer resolver across native CAD objects, legacy source lines and `cadPolyline`; focus/auto-scroll never changes visibility, current Layer or Region override state.
- Changed CAD Wall/Door/Window activation to start the tool immediately like LINE instead of opening the CAD mapping modal from the tool button. Their active-tool Context strip remains visible while the tool is active.
- Kept PLINE authoring, Polyline TRIM/EXTEND/OFFSET/FILLET/BREAK/JOIN, Curve Reconstruction and Stage4 outside this build. Build36 establishes the shared owner/query foundation only.
- Verification: Astra/core pure suites **85/85 PASS**, Build36 focused Chromium regression **8/8 PASS**, Build35-descendant full Chromium regression **14/14 PASS**, page errors **0**, console errors **0**. Safari/Retina remains the final user-device feel check.

## v0.27.0 · Build 35 — 2026-09-28

- Added app-level **Text Size** presets (Small / Default / Large) without changing control, row, padding, or Inspector dimensions. The PieniPlan identity remains 17px and micro text does not drop below 12px.
- Reworked the CAD Layer manager to stay inside the 286px Inspector at every text-size preset: five columns, flexible ellipsized layer name, wrapped header actions, and no horizontal overflow.
- Replaced the separate Layer color column with a compact circular color indicator beside the layer name. Clicking it opens an anchored palette with common colors, recent colors, and a custom color picker; object Properties continue to own ByLayer/per-object overrides.
- Upgraded Drawing Region Layer visibility to three-state scope semantics: inherit global / force on / force off. Render, Selection, Snap and Modify policy use the same effective visibility, and the More menu can restore global inheritance.
- Simplified File/View popovers to content-fit width and cleaned File terminology: project Open/Save/Save As, Plan Import/Export, DXF Import/Export, without repeated format suffixes or ellipsis.
- Added the first **ComponentInstance** foundation for Plan and CAD: one-object insertion, selection, move/copy, 90° rotation, mirror, delete, snap, Properties, PPRJ round-trip and PPKG inclusion.
- Added 24 normalized Starter Components for common bathroom, kitchen, laundry and furniture use. Their source footprint/insertion references come from the CADdillo CC0 1.0 catalogue; provenance and normalization notes are recorded in `assets/components/ASSET_PROVENANCE.md`. The bundled symbols are PieniPlan redraws, not byte/vertex copies of CADdillo DXF files.
- Preserved Build34 TRIM/EXTEND hidden-layer behavior and CAD/Plan Space/Escape/⌘. keyboard grammar. Persistent `cadPolyline`, schema5, Curve Reconstruction and Stage4 remain deferred to the next Astra architecture gate.

## v0.26.2 · Build 34 — 2026-09-28

- Fixed CAD TRIM/EXTEND activation so hidden global or Region-local Layers remain hidden; only LINE may reveal the active drawing Layer when needed.
- Reduced the Build32/33 typography scale by one step for primary/control/body/secondary text while keeping the 17px PieniPlan identity and 12px micro metadata baseline.
- Added CAD Space-tap handling through the same accept path as Enter while preserving Space+drag Pan and Plan Mode's Space-to-Select behavior.
- Unified CAD cancellation routing: Esc still cancels the active command and returns to Select, and macOS gets `⌘.` as an auxiliary Cancel shortcut for Safari/full-screen use.
- Updated shortcut/help copy to match the actual Plan/CAD keyboard grammar.
- Preserved Build33 P0 correctness fixes, PPRJ schema4, PPKG schema1, Build32 layout, and the pending Polyline P1/P2 gate.

## v0.26.1 · Build 33 — 2026-09-28

- Reject future PPRJ schemas and unsupported persistent object types before installing a project.
- Preserve supported legacy 2D POLYLINE bulges; explicitly reject unsupported flags and planes.
- Correct signed CAD ARC exports and mirrored/negative-uniform INSERT arc transforms.
- Include closing Reference polyline edges in snaps, with local nearest fallback after discrete snaps.
- Enforce CAD Duplicate policy, translate ARC centers, and use atomic ChangeSet undo/redo.
- Invalidate TRIM/EXTEND previews immediately on geometry, layer, selection, and context changes.
- Preserve Build32 UI, Plan semantics, PPRJ schema4 and PPKG schema1. No persistent Polyline or Stage4 addition.

## v0.26.0 · Build 32 — 2026-09-28

- Refined the Compact Ribbon into anchored split buttons that show the current tool without duplicate group labels.
- Reworked Ribbon dropdowns into compact command menus anchored directly below their trigger.
- Added shared keyboard ownership so editable fields keep Enter/Escape instead of leaking them to CAD commands.
- Increased the global UI typography scale and reduced unnecessary nested padding in the Plan building/drawing hierarchy.
- Converted the CAD layer list into a labeled table with Show / Layer / Objects / Lock / Color / More columns; destructive/low-frequency actions moved under More.
- Removed redundant context headings and repeated CAD/Plan wording where the active tab/mode already provides that information.
- Simplified the floating tool HUD and CAD scope metadata so controls describe parameters/state instead of repeating the active tool or scope.

## v0.25.0 · Build 31 — 2026-09-28

- Plan의 `구획`을 **건물 → 도면 → 공간** 계층으로 확장했다. 건물과 도면은 각각 명시적인 순서를 가지며, 선택과 펼침/접힘은 서로 독립적으로 동작한다. 기존 프로젝트는 건물 정보가 없으면 기본 건물 아래로 호환 로드한다.
- Reference 제어를 별도 중첩 카드가 아니라 펼쳐진 도면 surface 안에 직접 통합했다.
- Plan/CAD가 동일한 **Compact Ribbon → Canvas + Inspector → Command/Status** 공간 문법을 사용하도록 정리했다. 작은 menu/popover는 내용에 맞는 compact width를 사용한다.
- Settings를 추가했다: 한국어/English, 새 프로젝트 기본 Metric/Imperial, System/Light/Dark/Black 테마, 별도 Recovery snapshot. Recovery는 원본 PPRJ를 자동 덮어쓰지 않는다.
- CAD 공통 GeometryQuery 기반을 추가해 Circle Crossing selection, 곡선/TEXT hit-test, LINE/CIRCLE/ARC 교점 Snap을 정밀화했다.
- CAD History는 가능한 명령부터 ChangeSet + inverse를 사용하고 복잡한 기존 경로는 snapshot fallback을 유지한다.
- TRIM/EXTEND/OFFSET/FILLET/BREAK/JOIN의 검증된 형상 범위를 추가했다. EXTEND는 commit 전에 실제 추가 구간을 ghost preview로 보여준다.
- Layer appearance fast-path와 다중 Properties mixed color 표시의 불필요한 경로를 정리했다.
- C2 CAD core와 UI 통합 후 core/static/runtime 회귀를 재검증했다. 일부 Modify 조합, Stage 4 Annotation/Sheet, 실제 Safari Recovery persistence 검증은 계속 진행 중이다.

## v0.24.0 · Build 30 — 2026-09-27
- Renamed the primary PieniPlan project file role to **PPRJ** (`.pprj`, `fileType=pieniplan-project`, schemaVersion 4). Legacy `.ppln` / `.pieniplan` projects remain readable; new portable project exports use `.pprj` and the UI labels project open/save/export explicitly as PPRJ.
- Added **PPKG (PieniPlan Plan Package)** for Plan-only semantic exchange. PPKG excludes raw CAD source and reference payloads, can preserve/override drawing disciplines, can be opened/imported, and supports multi-building/multi-discipline merge through the start-screen **Merge Plans** workflow. Duplicate drawing/object IDs are remapped safely during merge.
- Reframed Plan's top-level hierarchy as **Sections / 구획** rather than assuming one top-level item always equals one physical floor. New items use `+ 도면 추가 / + Add drawing`; explicit **Edit order** mode provides drag reordering and the stored drawing order is preserved in PPRJ/PPKG.
- Plan selection and disclosure are now independent. Selecting a drawing no longer auto-expands it. Collapsed drawing rows are compact, while disclosure uses a short slide/fade transition (with reduced-motion support) to reveal Reference controls and Space child cards.
- Integrated Reference visibility/opacity directly into the parent drawing card instead of rendering a nested Reference card. The expanded parent shows `참조 도면 · <name>` / `Reference · <name>`, View, eye, slider and editable percentage on the same hierarchy surface.
- Fixed the remaining Plan **Shift whole-wall drag** propagation problem: a moved wall remains rigid, its directly joined endpoint may adjust, but a second-step point-on-edge dependent elsewhere on the neighboring host is no longer dragged as collateral propagation. Completed Plan lines also clear selection/hover focus instead of staying highlighted after commit.
- Reworked the public GitHub README to be product-facing only: purpose, Plan/CAD capabilities, file flow and philosophy. Internal Build/Astra/test history remains in CHANGELOG and DEV-only continuity documents.
- Added a DEV-only file ecosystem contract for **PPRJ / PPKG / future FACL**. FACL is not implemented here: it is reserved for a future Facility Manager container that may embed a PPKG while keeping facility-operation data under Facility Manager ownership and future authentication/revision safeguards.
- Verification: Build30 smoke **76/76 PASS**, command/context/unit core **5/5 PASS**, non-vendor JavaScript syntax **15/15**, EN/KO parity **615/615**, and all **46** referenced local runtime resources resolved. The synthetic 104k harness completed. A real legacy Changui Hall `.ppln` fixture (104,563 objects / 3 drawings / 3 Regions / 3 References) loaded successfully in the Chromium harness and produced a schemaVersion 4 PPRJ payload without being bundled into the source package. Actual Safari/Retina interaction remains the user-device validation authority.

## v0.23.1 · Build 29 — 2026-09-27
- Integrated all five approved Astra B1 repairs from the real Changui Hall project audit without promoting the Astra candidate itself: Plan wall/opening derived lookup index, active-Floor-only Space refresh with correct Undo cache order, `cadMapping` history restore, duplicate-object-ID preflight before project state swap, and Known-dimension scaling of free-dimension `p1/p2`.
- Restored the approved Plan **Shift + whole-wall drag** contract. In Plan Mode, Shift is again a geometry-constraint key even when held before pointer-down; Ctrl/Cmd handles selection toggling instead. CAD Mode keeps its existing CAD selection modifier behavior.
- Rebuilt the Plan Floor inspector hierarchy. A Floor is now the parent card, and a collapsed Floor shows only its name and menu. Expanding it reveals that Floor's Reference Drawing control and nested Space child cards.
- Simplified Floor/Space rows to emphasize identity: larger names, no always-visible object/space counts, area or type metadata. Detailed actions remain available from each `…` menu / selection context.
- Removed the separate **References** tab from Plan Mode. Plan now exposes **Floors / Properties**; routine Reference visibility and opacity live inside the expanded Floor, while Reference-specific actions are available through the Floor/reference context.
- Reworded the per-Floor control as **Reference Drawing · <name>** with a compact **View** action, eye toggle, opacity slider and editable percentage. Reference controls disappear when the Floor is collapsed.
- Preserved Build28 calibration/reference behavior and Build27 CAD/Plan workload isolation. Verification: Build29 smoke **66/66 PASS**, command/context/unit core **5/5 PASS**, JavaScript syntax **15/15**, local runtime assets **23/23**, EN/KO parity **571/571**, and synthetic 104k performance harness completed. The synthetic first-edit/drag path still includes the known full-document history snapshot cost; actual Safari and the user's real Changui Hall project remain the final runtime validation.

## v0.23.0 · Build 28 — 2026-09-27
- Reworked Plan reference information architecture: every Floor now shows its linked CAD/DXF/image placements directly underneath with visibility, opacity slider and editable percentage. Per-placement opacity/visibility remains independent across Floors.
- Removed duplicate DXF layer checklists from Plan References. Linked CAD underlays now follow the authoritative CAD Full-drawing AND Region-local layer visibility; layer editing stays in CAD Mode.
- Added **Known dimension** uniform calibration for image/DXF tracing. Use a selected straight Plan segment or pick two reference points, enter the actual length, and optionally scale the current Floor Plan together around the first point. Other Floors and `managedAreaM2` are protected.
- Calibration Undo now restores reference transform through lightweight reference-view history without duplicating large DXF entity arrays into every history entry.
- Applied the approved PieniPlan blueprint icon to app header, start screen, About, favicon, Apple touch/PWA icons and GitHub README; added a 1280×640 GitHub Social Preview asset.
- PDF tracing remains a planned use of the same placement/calibration architecture, but Build28 does not expose PDF import until an actual renderer is integrated.
- Preserved Build27 Plan/CAD snap isolation and large-DXF underlay caching. Verification: Build28 smoke **64/64 PASS**, core **5/5 PASS**, JS syntax PASS, EN/KO parity **570/570**, synthetic 104k performance check PASS. Actual Safari/real-project UX validation remains user-device work.

## v0.22.1 · Build 27 — 2026-09-27
- Fixed the Build26 Plan Mode performance regression without undoing the CAD 104k gains: Plan and CAD now keep separate snap indexes, and CAD intersection work applies Context eligibility before pairwise intersection calculation.
- Prevented Plan pointer/drag paths from rebuilding or scanning dense CAD working sets every frame. Linked raw-CAD underlays reuse cached geometry/viewport rendering instead of repeatedly walking the full source drawing.
- Enlarged CAD Layer inspector typography, row height and hit targets. Replaced temporary `L` / `·` / glyph actions with consistent local Tabler-style eye/lock/lock-open/pencil/trash outline icons; long layer names ellipsize without pushing action controls.
- Added Plan-vs-massive-CAD snap regression coverage and kept CAD policy-before-intersection coverage. Build27 smoke **58/58 PASS**, command/context/unit core **5/5 PASS**, JS syntax PASS and synthetic 104k performance harness PASS. Actual Safari/user-project validation remained required.

## v0.22.0 · Build 26 — 2026-09-27
- Integrated the accepted Astra A1 command foundation into the Build25 application instead of treating A1 as an all-or-nothing patch. Command Registry/Session/typed-input parsing are adopted; transaction/session ownership was hardened before native command expansion.
- Native transactions now fail closed when no history recorder exists. Persistent commit and transient finalization are separated, and U/REDO no longer depend on recursively cancelling the Session that is executing them.
- Added CAD Document Context with by-ID lookup and revisions. Render/inspect/select/snap/modify are explicit purposes rather than one shared eligibility flag. Plan Overlay remains read-only from CAD; locked CAD layers remain visible/selectable but non-modifiable.
- Moved existing CAD selection onto a dedicated Selection owner while preserving click, Window/Crossing, replace/add/toggle behavior. Existing spatial Snap indexing is reused through Context/byId policy with endpoint/midpoint/center/intersection foundations.
- Added real CAD Layer definitions separate from visibility: create, rename, delete-unused, current layer, lock/unlock and selected-object layer reassignment. Existing Full drawing AND Region-local visibility remains unchanged.
- Added UnitService for canonical-mm Metric/Imperial parsing/formatting. Default experience stays Korean + Metric while the architecture treats Imperial as a first-class input/display system.
- `.ppln` advances to schemaVersion 3 and persists CAD Layer definitions, active CAD layer, unit system and future-ready `sheets: []`; schemaVersion 2 and legacy `.pieniplan` remain load-compatible. Multi-sheet UI is intentionally deferred.
- Added the first native reference command, `L / LINE`, using the new Session → Context/Precision → active Layer → transaction/history path. Locked active layers reject LINE safely; cancel leaves no object; Undo/Redo are regression-tested.
- Product scope decision: native DWG support is excluded. PieniPlan uses DXF for CAD interchange; PDF/output and multi-sheet publication remain later milestones. Reference embed-vs-link remains a future user-selectable policy, not silently changed in this build.
- Verification: Build26 smoke suite PASS, command/context/unit core tests **5/5 PASS**, and 100k synthetic performance check completed. Synthetic full-snapshot commit/Undo/Redo measured roughly **0.95 s / 1.29 s / 1.29 s**, confirming the JSON snapshot transaction remains migration-only until ChangeSet/inverse replaces it. Actual Safari and the user's real 104k drawing still require hands-on validation.

## v0.21.1 · Build 25 — 2026-09-27
- Bugfix-only pre-Astra baseline. No new CAD command/status-bar product grammar was finalized in this build.
- Removed the second topbar sliver at its actual root: the legacy hidden `fullExtentsBtn` proxy was being unhidden whenever source-DXF outliers existed. Clicking that blank control executed **All extents**, fitting distant outliers and making the main drawing appear to disappear. The proxy DOM/state/event path is removed; the explicit **View → All extents** and CAD context-menu action remain available.
- Aligned CAD bottom status controls and coordinates to a shared fixed 23 px baseline/height. GRID/SNAP/ORTHO/POLAR, AXIS/Zoom and X/Y/units now remain vertically aligned without redefining their final visual grammar.
- Added an internal Astra Architectural CAD Core starter brief/package under `_AI_NOT_GITHUB/ASTRA_CAD_CORE/` with a curated reading order, architecture brief, current-symbol map, deliverable contract, recent decision extract and token-efficient attachment manifest.
- `BUILD25_SMOKE_TEST.py` passes **45/45**: Build24 regressions plus orphan Full-extents proxy removal and real layout-baseline checks for CAD status/coordinates. JS syntax and runtime asset checks remain clean.

## v0.21.0 · Build 24 — 2026-09-27
- Added hierarchical CAD layer visibility by Working Area: **Full drawing** is the parent gate and each Drawing Region keeps its own local layer visibility. Effective visibility is parent AND local; Region state is persisted in `.ppln`.
- Added Region-local **Turn all on / 모두 켜기** without overriding Full-drawing hidden layers. Parent-hidden layers remain visible in the list as dimmed/disabled inherited state instead of disappearing or losing their local preference.
- Fixed the top-left `CAD mapping` sliver at its root by removing the orphan hidden topbar proxy and moving the mapping action into an explicit CAD References card.
- Compacted the left tool rail to about 54 px on desktop while preserving tool icons and interaction targets.
- Replaced the static COMMAND alias board with a persistent Plan/CAD **Command Console** containing recent log/history, current prompt/status, always-visible input and autocomplete suggestions. CAD X/Y stays in the independent fixed-width far-right status area.
- Introduced the first CAD-core module boundaries after freezing and regression-testing the user-facing changes: CAD layer-visibility policy, Region transforms, command catalog/aliases and Command Console now live under `modules/` and are called from the application orchestrator through explicit APIs.
- `BUILD24_SMOKE_TEST.py` passes **43/43**: all Build23 regressions plus scoped-layer inheritance/persistence, layer scope UI, mapping-control placement, Command Console/autocomplete, compact rail and module-boundary loading. JS syntax passes for app/i18n/drawing-studio/worker/modules, EN/KO key parity is **529/529**, and local runtime asset references are complete.
- Real Safari/Retina feel, Changui Hall 104k-object persistence/performance and long-session Command Console ergonomics still require user-device validation.

## v0.20.0 · Build 23 — 2026-09-27
- Recovered Plan linked-CAD tracing controls by replacing the duplicate Palette inspector with **Floors / References / Properties**. References now exposes linked Region visibility, opacity and linked-layer visibility.
- Fixed stale inspector content when switching Plan/CAD modes; CAD References now consistently shows the opt-in Plan overlay plus external references only.
- Promoted CAD **Working Area** to a persistent inspector context above all CAD tabs. Full drawing/Region selection and working-set object count no longer share a cramped row with layer search.
- Unified the bottom HUD: COMMAND stays bottom-left in both modes, while CAD X/Y is reserved at the far right with right-aligned tabular numerals so changing coordinate width cannot reflow the HUD.
- Removed the small horizontal scrollbar around the Plan/CAD mode switch and enlarged Floor-tree disclosure triangles to roughly 170% of the previous visual size with a larger hit area.
- Added Region-scoped `RO / ROTATE`. A specific Drawing Region is required; the command snapshots its source-CAD working set, previews rotation with a temporary canvas transform, then commits geometry once. `H`, `V`, numeric absolute target angles and Shift 90° targeting are supported. Linked Plan semantic objects are intentionally not auto-rotated.
- Region bounds are updated to the rotated result's axis-aligned bounding box. This keeps the existing Region data model but can slightly expand the working set after rotation; real drawings should be checked near adjacent geometry.
- `BUILD23_SMOKE_TEST.py` passes **37/37** including Build21/22 regressions plus reference recovery, scope layout, HUD stability, disclosure size, Region-only rotate and topbar overflow. JS syntax checks pass for app/i18n/drawing-studio/worker.

## v0.19.0 · Build 22
- Added a CAD **Working Area** model. The original CAD geometry remains single-source; selecting a Drawing Region activates a cached working set for CAD rendering, selection/hit-testing, snap filtering, TR/EX cutter candidates and layer counts instead of treating every floor/region as simultaneously active.
- Plan → CAD now enters the active Floor's linked Drawing Region automatically. CAD can return to **Full drawing** at any time, and a Region `…` menu can activate **Edit this region only**.
- CAD Mode no longer draws Plan semantic geometry by default. **Plan overlay** is opt-in and, when enabled, is limited to the Floor linked to the active CAD Region.
- Plan Mode renders only the active Floor's linked CAD Region. Other floor-linked CAD references are excluded from the render/reference path; external references remain independent.
- CAD Reference inspector no longer lists internal Floor `linkedCadRegion` views as if they were duplicated external reference drawings.
- Added a revision/region CAD working-set cache and reused it in linked-region rendering so repeated render/hit workflows do not rebuild the active CAD subset on every pointer frame.
- Added CAD Mode TR destructive preview: hover shows the exact segment that will be removed in red with cut markers before click. Preview/cutter calculation respects the active working Region.
- Verified against the user-provided Changui Hall project data: 104,498 raw CAD objects total; 6F region bounds include 7,867 (7.53%) and 5F 11,204 (10.72%). These counts demonstrate the working-set reduction; real Safari frame-time/memory improvement still requires user runtime validation.
- Build 22 smoke, Build 10 and Build 11 regression suites pass; JS syntax passes; EN/KO i18n key parity is 504/504.

## v0.18.0 · Build 21
- Reworked Plan command activation so the typed command, active pointer command, and last-command repeat are separate states. `TR → EX` / `EX → TR` now tears down the previous command before the next click; command-input Enter no longer leaks to the global handler.
- Removed Plan Shift TR/EX inversion. In Plan Mode Shift is reserved for geometry constraints; CAD Mode keeps its existing temporary TRIM/EXTEND behavior.
- EXTEND now attaches only to the exact boundary intersected by the extension ray. It no longer performs a nearby-wall reattachment pass, and stale automatic coincident dependents at the extended endpoint are detached before the exact relation is created.
- Expanded Plan Shift geometry: drawing/endpoints evaluate GLOBAL 45° and connected/reference 45° candidates together; whole-line movement can lock to GLOBAL horizontal/vertical or connected-line parallel/perpendicular axes.
- Added Space Designation mode feedback and hover face preview so the prospective closed area is visible before click. Existing spaces are identified instead of duplicated.
- Refined direct door manipulation zones: the whole frame/opening span moves the door along its host; leaf/arc stroke proximity controls hinge/swing gestures; swing-sector interior remains selectable but does not flip on drag.
- Added semantic Fire Door and Fire Shutter elements. `FD`/`FS` are PieniPlan semantic markers only and are not presented as statutory symbols or fire-rating claims.
- Separated drawing-calculated area from managed area. Geometry updates do not overwrite managed area. FACMAP v0.2.0 documents that PieniPlan owns drawing area while FacilityManager owns authoritative managed/official area; legacy FACMAP v0.1 `areaM2` is treated as drawing area only.
- Added a compact persisted recent-edit log (up to 100 entries) to `.ppln` debug metadata to make command/EX/junction regressions easier to reproduce.
- Added Build 21 regression coverage for TR→EX state transitions, Plan Shift semantics, exact-boundary EX, stale dependent detachment, combined GLOBAL/REF angle candidates, Shift body-axis constraints, Space hover/HUD, door interaction zones, fire elements, managed-area migration and edit-log ring behavior.

## v0.17.0 · Build 20
- Fixed Space face detection at Plan-line interior crossings by using virtual topology nodes only for room/space analysis. Editing X-crossings remain non-junctions.
- Reduced false open-boundary warnings by excluding endpoints already touching another semantic boundary. Added a floating “Clear markers” action and Esc dismissal.
- Added collapsible Floor → Space trees and per-Space `…` management for rename, type, manual/calculated area, and delete.
- Separated geometry-calculated area from optional manual display area so scanned plans and facility-register values can coexist without changing Plan geometry.


## v0.16.0 · Build 19 — 2026-09-26

- Space identity를 면적 중심에서 **이름 + stable UUID + 공간 유형** 중심으로 바꿨습니다. 새 공간은 층별 `공간 1`, `공간 2`(영문 UI는 `Space N`)로 생성되고 면적은 secondary value로 표시합니다.
- 활성 Floor 아래에 Space child tree를 추가했습니다. 공간 row에서 선택을 동기화하고 double-click inline rename을 지원하며, Properties에서 이름과 `미지정/강의실/사무실/복도/화장실/계단실/창고/공용공간/기계실/기타` 유형을 편집할 수 있습니다. 사용자가 이름/유형을 편집한 recognized Space는 재인식 ownership에서 detach되어 보호됩니다.
- 공간 폐합 실패를 generic alert로 끝내지 않고 **의심되는 열린 경계 위치를 red dashed overlay + endpoint circles + gap 거리 label**로 표시합니다. 현재 층 semantic wall endpoint를 기준으로 진단하며 Door leaf/swing geometry는 room boundary hole로 판정하지 않습니다. 실제 사용자 제공 창의관 6F fixture에서도 약 81 mm gap candidate를 검출했습니다.
- selected Space는 stronger fill과 padded name chip으로 강조합니다. Hinged Door는 leaf/arc뿐 아니라 **개폐 부채꼴 내부 전체**를 selection hit area로 사용합니다.
- Door의 `hinge`와 world-relative `swingSide`를 분리했습니다. host-tangent hinge gesture는 현재 opening side를 보존한 채 hinge만 반전하고, host-normal gesture만 opening side를 반전합니다. 일반 `양개 여닫이문`은 두 leaf가 같은 wall side로 열리며, `양방향 여닫이문`과 `양개 양방향 여닫이문`을 추가해 양쪽 swing을 표시합니다.
- portable project 기본 확장자를 **`.ppln`**으로 줄였습니다. 기존 `.pieniplan` 파일은 계속 열 수 있고 새 portable download는 `.ppln`으로 생성합니다.
- `프로젝트 저장` 경로를 다시 정리해 **새 파일 picker/download를 호출하지 않도록** 했습니다. 이미 writable handle로 연 프로젝트만 같은 파일을 갱신하고, 그 외(Safari 포함)는 IndexedDB browser-local storage에 저장합니다. portable 파일 다운로드는 별도 메뉴 action에서만 수행합니다.
- Build19 smoke PASS: Space 생성/metadata/tree, 80 mm open-gap 진단, hinge flip world-side 보존, same-side double hinged, double-acting 양쪽 swing, door sector hit-test, Build18 Point-on-Edge 회귀. Build10/11 원본 smoke와 Build18 supersession-aware smoke도 PASS, JS syntax PASS, EN/KO 474/474 parity PASS. 사용자 제공 프로젝트 fixture에서 5F 기존 25 Space metadata migration 및 6F gap scan을 추가 검증했습니다.
- 실제 Safari 저장 persistence UX, 실제 6F 클릭 위치에서 gap diagnostic의 우선순위, 복잡한 곡선/다중 문 geometry의 selection 감각은 실사용 확인이 계속 필요합니다.

## v0.15.0 · Build 18 — 2026-09-26

- Build 17의 persistent junction을 **Endpoint↔Endpoint node**와 **Endpoint↔Segment Point-on-Edge constraint**로 분리했습니다. 중간 접합은 host의 저장된 `t` 비율에 매달리지 않고, host가 이동·연장·축소·회전할 때 branch의 기존 방향을 가능한 한 유지하는 새 교점을 계산합니다. pure interior X crossing은 계속 자동 연결하지 않습니다.
- Plan Mode `TR`에 destructive preview를 추가했습니다. hover한 위치에서 실제 삭제될 segment만 빨간색·굵은 반투명 overlay로 표시하고 cut point를 함께 보여준 뒤 클릭 시 확정합니다. `Esc`는 취소하며 Shift로 임시 Extend를 사용하는 동안에는 빨간 삭제 preview를 숨깁니다.
- Plan tool rail을 **선택 / 그리기 / 요소 / 수정** 4그룹으로 정리했습니다. `거리(DI)`는 선택으로 이동했고, 수정 그룹은 `이동(M) / 복사(CO) / 잘라내기(TR) / 연장(EX) / 삭제(E)`를 포함합니다.
- Plan Mode에서 배경 CAD/reference 스냅을 기본 비활성으로 바꿨습니다. `Ctrl`을 누르는 동안에만 reference endpoint/midpoint/intersection을 스냅 후보로 허용하고 별도 `REF` marker로 구분합니다. `Shift`는 기존 각도 제약 역할을 유지하며 `Ctrl+Shift` 조합도 지원합니다. macOS의 Ctrl-click context menu는 해당 편집 gesture 중 억제합니다.
- Move/Copy는 Plan semantic 객체에 직접 적용되며 Copy는 recognition ownership metadata를 제거해 새 user-created 객체로 취급합니다. Door/Window copy는 host 위 center 이동 문법을 사용합니다.
- Build 18 smoke에서 4-group rail, M/CO/DI command routing, Point-on-Edge 방향 보존/비율 비고정, TR preview interval, Ctrl-only reference midpoint/intersection snap을 검증했습니다. Build 10/11은 원본 회귀 PASS, Build 12/14/15/16/17은 이후 제품 계약에 의해 폐기된 Version/Plan primitive/rail 기대값만 갱신한 supersession-aware 회귀에서 나머지 기능이 PASS했습니다. JS syntax와 EN/KO key parity도 확인했습니다.
- 실제 대형 창의관 CAD에서 Ctrl을 누른 상태의 dense reference intersection 후보 성능과 Point-on-Edge 연쇄 제약 감각은 실사용 확인이 계속 필요합니다.

## v0.14.0 · Build 17 — 2026-09-26

- Plan Mode의 사용자 모델을 `Line`과 `Wall` 두 종류에서 **하나의 semantic `선` 경계 모델**로 통합했습니다. `L` 명령과 왼쪽 선 도구가 같은 Plan boundary를 생성하며, 기존 room/opening/topology/DXF 호환을 위해 내부 저장은 wall-compatible semantic object를 사용합니다. 구형 Plan `type: line` 객체는 로드 시 semantic boundary로 보수적으로 마이그레이션합니다.
- 기존 수동 곡선 작성 기능을 잃지 않도록 **그리기 그룹의 `곡선`**으로 유지했습니다. Plan UI에서는 `벽`이라는 별도 그리기 객체를 노출하지 않습니다.
- 왼쪽 Plan tool rail의 `건축/벽` 성격 그룹을 **`요소`**로 정리했습니다. 문·창·공간 지정이 이 그룹에 들어가고, 문은 여닫이/양개/미닫이/양개 미닫이/포켓 종류를 같은 그룹형 선택에서 사용합니다.
- 자동 인식이나 수동 작성으로 만들어진 직선 Plan 경계의 L/T 접합을 **persistent Junction attachment**로 보강했습니다. 단순히 좌표만 일치시키지 않고 연결 관계를 남기며, 공유 corner endpoint를 끌거나 연결된 선을 이동할 때 이웃 선의 공유 endpoint가 함께 따라가 접합이 쉽게 벌어지지 않습니다. T branch의 point-on-line 관계도 host 위를 유지합니다.
- Plan Mode `Shift` 문법을 정리했습니다. 기존 직선 endpoint를 Shift+drag하면 원래 선 각도를 정확히 유지한 채 길이만 바뀌고, 기존 선에서 새 선을 시작하면 그 선의 접선 방향을 기준으로 45° 단위에 스냅합니다. 독립 새 선은 Base Axis 기준 45° 단위를 사용합니다. CAD Mode의 기존 Shift/ORTHO 문법은 유지합니다.
- 기존 top Context Bar를 제거하고 캔버스 **왼쪽 위 Floating Context HUD**로 이동했습니다. `L` 등 도구를 시작/종료해도 workspace row나 canvas 높이가 바뀌지 않아 도면과 pointer 위치가 레이아웃 reflow로 흔들리지 않습니다.
- 문 직접 조작을 wall-local/line-local 축 기준으로 정리했습니다. 선택한 문의 **가운데 점 drag = host 선을 따라 위치 이동**, 여닫이문 몸체를 host 선에 수직으로 drag = 열림 방향 반전, host 선을 따라 drag = 경첩 방향 반전입니다. 미닫이문은 선 방향 gesture로 이동 방향을 반전합니다.
- 오른쪽 Plan 속성에서는 내부 wall-compatible 저장 형식을 그대로 노출하지 않고 사용자에게 `선`/`선 종류`로 표시합니다.
- Build 17 smoke에서 floating HUD 무 reflow, semantic line 생성, legacy line migration, persistent junction parent/child follow와 joined-line body move, Shift local 45° snap/endpoint angle lock, door direct gesture, 곡선 도구 접근을 검증했습니다. Build 10/11 및 Build 12(새 semantic-line 계약으로 기대값 갱신), Build 14/15/16 회귀도 통과했습니다.

## v0.13.2 · Build 16 — 2026-09-26

- Plan Mode의 얇은 semantic wall 중심선이 접합점에서 실제 endpoint보다 반 두께만큼 더 그려지던 시각적 overlap을 제거했습니다. 화면에 보이는 선 끝과 실제 wall geometry/selection handle이 일치합니다.
- Plan wall hit-test가 semantic wall thickness까지 선택 범위로 사용하던 문제를 수정해, 보이는 중심선 기준의 일정한 화면 픽셀 tolerance로 선택합니다. 두꺼운 wall 데이터 때문에 멀리 떨어진 위치에서 다른 벽이 잡히는 현상을 줄였습니다.
- pointer 좌표를 canvas CSS 좌표로 변환할 때 실제 `getBoundingClientRect()`와 backing-canvas CSS 크기의 비율을 보정하고, Canvas host에 `ResizeObserver`를 추가했습니다. Retina/browser zoom/inspector·context 레이아웃 변화 후에도 render/hit/snap 좌표가 같은 변환을 사용합니다.
- Architectural cleanup 마지막에 exact endpoint junction pass를 추가해 가까운 L/T terminal endpoint를 실제 line-line intersection으로 한 번 더 정규화합니다. Pure interior X crossing은 계속 자동 분절하지 않습니다.
- 연결된 wall 여부 판단은 같은 Floor의 wall만 사용하도록 제한해 다른 층 semantic geometry가 Plan join 표현에 영향을 주지 않게 했습니다.
- Build 10~12 회귀와 Build 16 coordinate/selection/junction smoke를 통과했습니다. 실제 창의관 fresh recognition에서 남는 인식 누락/접합 품질은 계속 실기 비교가 필요합니다.
- DEV/GitHub ZIP 생성 시 디렉터리 `755`, 일반 파일 `644` 권한을 명시해 macOS Finder에서 하위 폴더가 권한 오류로 열리지 않던 패키징 회귀를 방지합니다.

## v0.13.1 · Build 15 — 2026-09-26

- **DXF 내보내기 저장 UX**를 수정했습니다. `showSaveFilePicker`를 지원하는 브라우저에서는 운영체제의 Save As 창으로 위치와 파일명을 직접 선택하고, 미지원 브라우저에서는 PieniPlan 자체 filename dialog에서 이름을 먼저 확인한 뒤 브라우저 다운로드 위치를 사용한다는 점을 명확히 안내합니다. 전체 DXF와 Drawing Region DXF가 같은 흐름을 사용합니다.
- DXF 내보내기는 프로젝트 저장과 별개 동작으로 정리해 export 자체가 project dirty state를 임의로 clean 처리하지 않게 했습니다.
- **재인식 의미를 additive update에서 automatic-recognition-layer rebuild로 변경**했습니다. 현재 Region의 자동 인식 Wall/Door/Space/Stair를 현재 체크 옵션 기준으로 교체하며, 체크 해제한 종류의 이전 자동 인식 객체는 제거됩니다.
- 자동 인식 객체에 baseline signature/source metadata를 기록해 **사용자가 직접 만든 객체나 인식 후 수동 수정한 객체는 재인식 시 보존**합니다. legacy recognized Wall/Door도 기존 recognition history/source IDs와 비교해 가능한 범위에서 보호합니다. 복제한 객체는 recognition-owned metadata를 제거합니다.
- 재인식 창은 해당 Region에서 마지막으로 적용한 Wall/Room/Door/Stair 체크 상태를 기억하고, 설명 문구도 “선택한 자동 인식 레이어를 다시 생성하며 직접 작업은 유지”하는 의미로 변경했습니다.
- architectural cleanup 마지막 단계에 **endpoint gap healing**을 추가했습니다. L/T endpoint를 실제 교점으로 제한적으로 snap/extend하고, 작은 collinear gap을 연결한 뒤 Junction Solver/overrun trim을 다시 수행합니다. pure interior X crossing은 계속 자동 split하지 않습니다.
- 시작 화면 마지막 줄에 `PieniPlan v0.13.1 · Build 15`를 표시해 실행 중인 빌드를 바로 확인할 수 있게 했습니다.
- 사용자 제공 Build 14 창의관 프로젝트 subset으로 `5F`의 기존 자동 인식 Stair 20개가 stair 체크 해제 재인식 후 제거되고, 선택한 Wall/Door/Space는 다시 생성되는 회귀를 검증했습니다. 수동 수정 recognized Door 보존, L/T/collinear gap healing, pure-X 비변경도 synthetic test로 확인했습니다.
- Build 10~12 회귀, Build 14 회귀, Build 15 smoke, JS syntax, i18n EN/KO 446/446 parity를 통과했습니다. 실제 대형 도면에서 junction/recognition의 시각적 정확도와 native Save As/fallback 브라우저별 동작은 사용자 실기 확인이 남아 있습니다.

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
