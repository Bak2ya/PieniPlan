# Changelog

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
