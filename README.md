# PieniPlan

**Small Web Floor Plan Editor**

**Quick launch:** https://bak2ya.github.io/PieniPlan/  
**GitHub:** https://github.com/Bak2ya/PieniPlan

PieniPlan is a browser-based floor-plan and lightweight 2D CAD prototype built on one shared, real-world drawing coordinate system.

The same drawing can be approached with two connected tool sets:

- **Plan Tools** — walls, doors, windows, spaces and dimensions without requiring CAD structure knowledge.
- **CAD Tools** — editable DXF geometry, layers, precision controls and command input for experienced CAD users.

Choosing a path on the start screen only selects the first toolbox. Both tool sets use the same canvas, millimetre coordinates and DXF output path.

## v0.5.0 · Build 6

This build strengthens direct editing in Plan Tools and adds the first practical CAD → Plan bridge through **Drawing Regions**.

### Plan Tools

- Door/window openings remain attached to walls.
- Select a door or window to reveal its opening handles. Drag either square end handle along the wall to change the width; the current width is shown beside the selected opening.
- Drag the center/body along the wall to move a door/window. For a door, dragging across the wall also flips the swing side.
- Door Properties and right-click menu provide explicit **Flip hinge** and **Flip swing** actions.
- Wall endpoints snap to nearby endpoints and wall segments. A visible snap marker shows the target.
- T-junction wall endpoints can stay linked to another wall. Moving the parent wall makes the attached branch follow; the joint can be detached or reattached from Properties/right-click.
- A quick tap of **Space** returns Plan Tools to Select. Holding **Space + drag** continues to pan the canvas.
- **Define Space** recognizes a closed semantic-wall boundary and assigns it a stable space ID. Existing spaces follow wall edits while their boundary remains valid.
- Plan dimensions are associative: a placed dimension references a wall instead of floating independently. Wall edits update the dimension; the dimension line offset remains editable.
- Right-click menus expose object-specific actions instead of forcing every operation into the side panel.

### CAD Tools

- Selecting an object highlights its layer in the Layers panel and exposes quick **hide / isolate / show in Layers** actions in Properties.
- CAD right-click menus include object/layer actions; empty-canvas right-click includes view/layer/region actions.
- **Drawing Region** lets you drag a rectangular CAD area, name it (for example `1층`), fit to it, export that region as DXF, or open it in Plan Tools as a linked vector reference.
- A linked Drawing Region uses the same coordinates as the source CAD, so no extra scale calibration is needed.
- Its visible-layer snapshot is preserved until the user explicitly chooses **Update visible layers**; source CAD geometry itself remains linked.

### Shortcuts and discoverability

PieniPlan keeps shortcut help attached only to controls where it is useful. Current notable shortcuts include:

- `Space` — Select in Plan Tools; hold + drag to Pan
- `F3` — SNAP
- `F7` — GRID
- `F8` — ORTHO
- `Ctrl/Cmd+Z` — Undo
- `Ctrl/Cmd+Shift+Z` — Redo
- CAD command aliases currently implemented: `L`, `E`, `DI`, `Z`, `U`, `REDO`

## Current CAD prototype

Implemented basics include:

- DXF as an editable drawing or a separate reference underlay
- LINE / POLYLINE-derived segments / CIRCLE / TEXT import
- Layers and layer visibility
- main-drawing Smart Fit plus full extents for distant outliers
- GRID / SNAP / ORTHO
- command input with a small supported familiar alias set
- Plan → CAD representation mapping for semantic objects
- basic whole-drawing and Drawing Region DXF export

Unsupported commands shown in the UI are marked as planned rather than pretending to work.

## Reference tracing

DXF and images can be added as references. A normal reference can be calibrated by selecting two known points and entering the real-world distance.

A CAD Drawing Region can also become a linked Plan reference without calibration because it already shares PieniPlan's world coordinate system.

PDF is part of the intended workflow but is not parsed in this prototype yet.

## Run locally

PieniPlan is a static web app. Use GitHub Pages or another local/static HTTP server.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

Opening `index.html` directly with `file://` may prevent the DXF Web Worker from loading in some browsers.

## Prototype limitations

- Project save/load is not implemented yet. Browser Home navigation preserves the in-memory drawing, but reload/browser close does not.
- MOVE / COPY / OFFSET / TRIM / EXTEND and many CAD operations are still planned.
- Define Space currently recognizes closed **semantic Plan walls**; it does not silently interpret arbitrary raw DXF lines as walls.
- FACMAP export is not implemented yet, although defined spaces already receive stable IDs for that future workflow.
- Drawing Region export is an early implementation: line geometry is clipped to the rectangle, while overlapping circle entities are currently preserved as whole circles.
- DXF entity support is intentionally limited and should be validated against real production drawings before critical use.
- Mobile/narrow layouts are viewer-only by design.

## Third-party notices

PieniPlan includes a small local subset of Tabler Icons. See `THIRD_PARTY_LICENSES.md`.
