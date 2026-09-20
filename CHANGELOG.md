# Changelog

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
