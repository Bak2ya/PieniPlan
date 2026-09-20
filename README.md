# PieniPlan

**Small Web Floor Plan Editor**

PieniPlan is a browser-based floor-plan and lightweight 2D CAD prototype built on one shared, real-world drawing coordinate system.

The same drawing can be approached with two connected tool sets:

- **Plan Tools** — walls, doors, windows and dimensions without requiring CAD structure knowledge.
- **CAD Tools** — editable DXF geometry, layers, precision controls and command input for experienced CAD users.

Choosing a path on the start screen only selects the first toolbox. Both tool sets use the same canvas, millimetre coordinates and DXF output path.

## v0.4.0 · Build 5

This prototype focuses on making Plan Tools directly manipulable and making real DXF files safer to open.

- Wall / Door / Window / Dimension objects use visible selection handles that match what can actually be edited.
- Walls can be moved or reshaped by dragging their body/endpoints.
- Doors/windows stay attached to walls and can be moved along the wall or resized by their opening handles.
- Doors use a conventional leaf + 90° swing arc, with hinge/swing flip actions.
- Connected thick walls visually extend into joins, and wall strokes are opened where doors/windows exist.
- Dimensions now include extension lines, dimension line, endpoint marks and editable offset.
- Exact wall/line Length and Angle remain editable numerically.
- DXF import uses the worker's detected main drawing region for default Fit when distant outlier entities exist; **All extents** remains available.
- Large editable DXF endpoint snapping uses a spatial index instead of scanning every endpoint on every pointer move.
- System / Light / Dark / Black (OLED) themes follow the shared House palette baseline.
- UI icons use a local **Tabler Icons** outline subset.
- Very narrow/mobile layouts intentionally become a **viewer-only** workspace with pan/zoom rather than a cramped full editor.
- Korean / English UI remains automatic; CAD-standard terms such as GRID / SNAP / ORTHO / DXF intentionally remain in English.

## Current CAD prototype

Implemented basics include:

- DXF as an editable drawing or a separate reference underlay
- LINE / POLYLINE-derived segments / CIRCLE / TEXT import
- Layers and layer visibility
- GRID / SNAP / ORTHO
- command input with a small supported familiar alias set (`L`, `E`, `DI`, `Z`, `U`, `REDO`)
- Plan → CAD representation mapping for semantic objects
- basic DXF export from the shared drawing

Unsupported commands shown in the UI are marked as planned rather than pretending to work.

## Reference tracing

DXF and images can be added as references. A reference can be calibrated by selecting two known points and entering the real-world distance.

PDF is part of the intended workflow but is not parsed in this prototype yet.

## Run

PieniPlan is a static web app. Use GitHub Pages or another local/static HTTP server.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

Opening `index.html` directly with `file://` may prevent the DXF Web Worker from loading in some browsers.

## Prototype limitations

- Project save/load is not implemented yet. Browser Home navigation preserves the in-memory drawing, but reload/browser close does not.
- MOVE / COPY / OFFSET / TRIM / EXTEND and many CAD operations are still planned.
- Space/room recognition and FACMAP export are not implemented yet.
- DXF entity support is intentionally limited and should be validated against real production drawings before critical use.
- Mobile/narrow layouts are viewer-only by design.

## Third-party notices

PieniPlan includes a small local subset of Tabler Icons. See `THIRD_PARTY_LICENSES.md`.
