# PieniPlan v0.1.0 · Build 1 — Build Changes

## Purpose

Create the first GitHub Pages-ready PieniPlan baseline so the product can be opened in a real browser and iterated from actual use instead of continuing only as a layout discussion.

## Product decisions applied

- Project name: PieniPlan
- Subtitle: Small Web Floor Plan Editor
- Product split from FacilityManager
- Reference inspirations: AutoCAD / LibreCAD / magicplan
- Foundational real-world coordinate and dimension model
- DXF can be used as a tracing/reference underlay
- Left categories: Select / Draw / Architecture / Dimension / Modify
- Right side roles: Layers / Reference / Properties
- Context-specific exact numeric inputs near the top
- CAD-style status information at the bottom

## Implementation

### DXF
- reused and separated FacilityManager Build 11 DXF parsing Worker
- retained browser-local parsing
- converts recognized DXF units to millimetres
- Canvas/Path2D cached rendering instead of SVG entity DOM
- reference layers can be individually shown/hidden
- 64×64 local snap index avoids whole-DXF endpoint scanning on every pointer move

### Reference
- DXF reference import
- image reference import
- visibility
- opacity
- fit view
- scale calibration from two known points and an actual mm distance
- first calibration point remains fixed while scale changes

### Drawing
- Line
- Wall
- Distance measurement
- Delete
- Select
- Length / Angle numeric entry
- Wall thickness numeric entry
- GRID / SNAP / ORTHO
- persistent measurement objects
- drawing object properties
- Undo / Redo for PieniPlan-created objects

### Navigation
- wheel Zoom around cursor
- middle-button Pan
- Space + left-drag Pan
- Fit
- drag & drop reference import

### UI
- top document/action bar
- context tool bar
- left category rail
- central drawing canvas
- right inspector tabs
- bottom status bar with coordinates and precision toggles
- system light/dark color-scheme support

## Verification performed

- JavaScript syntax check with Node for `app.js`, `drawing-studio.js`, and `workers/dxf-worker.js`
- DXF Worker parse test with a minimal ASCII DXF containing two LINE entities and `$INSUNITS=mm`
- verified Worker returned 2 entities, `WALL` layer, mm unit metadata, and expected 4200×3000 bounds
- static HTTP serving verified with Python HTTP server and curl

## Verification limitation

A Chromium headless screenshot run in the build container did not complete because the container's Chromium environment hung on system-service/database initialization. Therefore Build 1 still needs normal desktop-browser visual/runtime verification after upload.

## Known limitations

- no PDF tracing yet
- no project persistence/export yet
- no architectural recognition yet
- many catalog tools are intentionally visible as planned/disabled to validate information architecture without pretending they are implemented
