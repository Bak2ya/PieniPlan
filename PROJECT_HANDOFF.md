# PieniPlan PROJECT HANDOFF

Current version: **v0.1.0 · Build 1**

Product subtitle: **Small Web Floor Plan Editor**

## 1. Product role

PieniPlan is an independent web app for opening existing drawing material and producing/correcting accurate 2D floor plans in the browser.

Primary reference inputs:
- DXF
- PDF (planned after Build 1)
- image / scanned plan

DWG is outside the editor itself and may be converted to DXF through the separate DWG → DXF web tool.

## 2. Product boundary with FacilityManager

PieniPlan owns drawing geometry and spatial structure.

PieniPlan should know:
- building/floor drawing geometry
- walls, doors, windows and drawing symbols
- closed spaces / room geometry
- stable space IDs
- drawing coordinates, dimensions, scale and reference alignment

PieniPlan should not own FacilityManager operational fields such as:
- department / assignment
- access passwords
- fire inspection records
- equipment maintenance history
- construction history

Exchange with FacilityManager uses `docs/FACMAP_SPEC_v0.1.0.md`.

## 3. Core product direction

Reference three products without copying them mechanically:

- **AutoCAD** → precision, coordinate system, numeric length/angle entry, snap/ortho grammar
- **LibreCAD** → lightweight 2D CAD, layers and familiar desktop drawing workflow
- **magicplan** → approachable floor-plan creation, tracing and real-dimension correction

PieniPlan focus:

> Easy to begin like a floor-plan tool, but accurate like CAD.

A recurring product idea is:

> Draw roughly, then make it exact with numbers.

Do not turn PieniPlan into a giant general-purpose CAD program unless a feature clearly serves floor-plan creation/correction.

## 4. Coordinate / measurement model

This is a foundational requirement, not a later add-on.

- Internal working unit is millimetres for Build 1.
- Screen pixels and drawing coordinates are separate.
- DXF units are converted to millimetres when `$INSUNITS` is available.
- DXF with unspecified units is provisionally treated as mm and can be calibrated.
- Image references begin with a provisional scale and are expected to be calibrated from a known real distance.
- Reference scale calibration: pick two points → enter actual mm distance → scale reference while preserving the first picked point.
- New Line/Wall geometry is stored in real drawing coordinates.

Future architecture must preserve this separation so PDF/image tracing, dimensions, FACMAP geometry and exports use one coherent world-coordinate model.

## 5. Workspace layout — current baseline

### Top
Document/reference actions and Undo/Redo.

### Context bar
Current tool and exact numeric inputs such as Length / Angle / Wall Thickness.

### Left tool rail
Confirmed top-level categories:
- Select
- Draw
- Architecture
- Dimension
- Modify

The category structure is intentionally familiar to CAD users.

### Center
Drawing canvas.

### Right inspector
- Layers
- Reference
- Properties

### Bottom status bar
- X / Y coordinate
- units
- GRID
- SNAP
- ORTHO
- zoom

Important principle: tool position should follow established CAD expectations where useful, but PieniPlan should remain lighter and easier to scan than a full desktop CAD UI.

## 6. Reference model

A reference is source material used to create a new accurate PieniPlan drawing.

Build 1:
- DXF reference
- Image reference

Planned:
- PDF reference

DXF is not only an editable source format; it can also be used as an underlay for re-tracing old/dirty drawings into a cleaner accurate drawing.

Reference and Drawing are separate concepts.

Reference may have:
- visibility
- opacity
- scale
- origin/alignment
- DXF layer visibility

PieniPlan Drawing contains the actual newly created geometry.

Future direction may allow selected DXF reference entities to be converted into editable PieniPlan objects.

## 7. Build 1 implemented

- static GitHub Pages-ready structure
- local browser processing, no backend
- FacilityManager-derived DXF Worker separated from FacilityManager business logic
- Canvas/Path2D DXF rendering
- 64×64 local spatial index for reference endpoint snapping
- DXF layer visibility controls
- image underlay
- reference scale calibration
- CAD navigation: wheel Zoom / middle Pan / Space+left Pan
- Select / Line / Wall / Distance / Delete
- exact Line/Wall Length + Angle entry
- wall thickness
- GRID / SNAP / ORTHO
- drawing layer structure
- Reference / Properties inspector
- Undo/Redo for drawing objects
- drag & drop reference import

## 8. Build 1 intentionally pending

- PDF
- persistent project save/load
- auto wall recognition
- architectural Door/Window/Space tools
- full drawing tool set
- modify tools except Delete
- DXF entity conversion/editing
- DXF export
- FACMAP export
- stable room UUID UI/logic
- automatic closed-space recognition

## 9. Performance baseline

FacilityManager Build 11 taught an important rule:

- large DXF reference rendering must not create tens of thousands of DOM/SVG nodes
- reference DXF should use Canvas/Path2D-style rendering
- pointer-move snapping must not scan every DXF entity on every event

Build 1 therefore caches DXF paths and builds a 64×64 endpoint snap index.

The previous FacilityManager real-world regression file was approximately 37k elements / 67 layers. PieniPlan should eventually be tested with similarly large drawings.

## 10. Next recommended validation

Before adding many tools, visually and interactively validate Build 1 in a real browser:

1. overall workspace density
2. left category positions and popover interaction
3. context-bar numeric entry flow
4. right inspector width and tab structure
5. bottom status density
6. DXF performance
7. reference scale calibration UX
8. line/wall drawing feel
9. dark/light appearance
10. whether PieniPlan feels familiar without feeling like a heavy CAD clone

## 11. Do not casually change

- PieniPlan name and current subtitle without a new user decision
- Select / Draw / Architecture / Dimension / Modify top-level tool categories
- world-coordinate-first architecture
- separation of Reference and Drawing
- FacilityManager / PieniPlan responsibility boundary
- FACMAP stable-space-ID concept
- user control over automatically recognized/traced results
