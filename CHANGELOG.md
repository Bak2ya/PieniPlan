# Changelog

## v0.3.1 · Build 4 — 2026-09-15

Navigation and appearance refinement for the unified Plan/CAD prototype.

- connected PieniPlan screen/tool-set navigation to the browser History API
- browser Back/Forward now restores PieniPlan start/workspace/tool-set states; mouse thumb Back/Forward works when the browser/OS maps those buttons to browser navigation
- added explicit in-app Back and Home controls
- returning to the start screen preserves the current in-memory drawing instead of clearing it
- added a Continue current drawing card on the start screen
- added System / Light / Dark appearance selection
- appearance preference is persisted locally and applied before the main stylesheet paints when possible
- kept drawing Undo/Redo fully separate from navigation Back/Forward

## v0.3.0 · Build 3 — 2026-09-15

Prototype of the unified Plan/CAD product direction.

- added a start screen with Plan Tools and CAD Tools as two entry paths into the same drawing
- kept one shared mm coordinate system and canvas across both tool sets
- added Plan wall / door / window workflow with exact dimensions
- added first-time Plan → CAD representation mapping for walls and layer names
- added CAD → Plan simplified presentation without discarding CAD geometry
- added editable DXF opening for common basic entities
- added CAD command input with a small supported familiar alias set
- added basic shared-drawing DXF export
- kept DXF/image reference tracing and calibration
- separated the public GitHub package from AI/development handoff documents

## v0.2.0 · Build 2 — 2026-09-14

Localization and UI grammar baseline.

- fixed scale-calibration dialog appearing on first launch
- added Korean/English localization with browser/OS auto-detection and English fallback
- kept GRID / SNAP / ORTHO / DXF as intentional English CAD terms in Korean UI
- replaced improvised Unicode UI glyphs with a local Font Awesome Free SVG subset
- added selective delayed hover/focus tooltips
- removed unvalidated arbitrary single-letter tool-selection shortcuts
- localized DXF Worker progress/error messages

## v0.1.0 · Build 1 — 2026-09-14

First executable PieniPlan baseline.

- established the initial CAD-like workspace
- added DXF and image references
- added real-world mm coordinates and reference calibration
- added Line, Wall, Distance, Select and Delete
- added numeric Length / Angle / Wall Thickness input
- added GRID / SNAP / ORTHO and CAD-style navigation
- added DXF Canvas/Path2D rendering and endpoint snap indexing
