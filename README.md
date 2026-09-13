# PieniPlan

**Small Web Floor Plan Editor**

PieniPlan is a lightweight browser-based 2D floor plan editor focused on turning existing references into accurate drawings with real-world dimensions.

Current version: **v0.1.0 · Build 1**

## Build 1 focus

This is the first working baseline for validating the PieniPlan workspace and interaction model.

### Working now

- Static web app suitable for GitHub Pages
- DXF reference import and Canvas/Path2D rendering
- Image reference import
- Reference opacity and visibility controls
- DXF reference layer visibility controls
- Reference scale calibration using two picked points + a real distance in mm
- Real-world drawing coordinates in millimetres
- CAD-style navigation
  - mouse wheel: zoom
  - middle-button drag: pan
  - Space + left drag: pan
- Left tool categories
  - Select
  - Draw
  - Architecture
  - Dimension
  - Modify
- Usable Build 1 tools
  - Select
  - Line
  - Wall
  - Distance
  - Delete
- Line/Wall direct numeric entry
  - length
  - angle
  - wall thickness
- GRID / SNAP / ORTHO status controls
- Undo / Redo for PieniPlan drawing objects
- Right inspector structure
  - Layers
  - Reference
  - Properties

### Intentionally not implemented yet

- PDF reference tracing
- wall/door/window automatic recognition
- door/window/room object tools
- Polyline / Rectangle / Circle / Arc
- Move / Copy / Rotate / Trim / Extend / Offset
- direct editing/conversion of DXF reference entities
- project save/load package
- DXF export
- FACMAP export

Build 1 keeps these incomplete features out of the working path instead of pretending they are finished.

## Run locally

Because DXF parsing uses a Web Worker, run PieniPlan through HTTP instead of opening `index.html` directly with `file://`.

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages

Upload the contents of this folder to the repository root. Then enable GitHub Pages for the branch containing `index.html`.

No build step, package manager, backend, database, or paid service is required for Build 1.

## Data / privacy

Build 1 processes imported DXF and image files in the browser. It does not upload drawing files to a PieniPlan server.

## Project direction

Reference products:

- AutoCAD: precision, coordinates, numeric input, snapping and familiar CAD interaction grammar
- LibreCAD: lightweight 2D CAD workflow and layer-oriented editing
- magicplan: approachable floor-plan creation and dimension-correction flow

PieniPlan is not intended to become a full general-purpose AutoCAD clone. Its focus is creating and correcting accurate floor plans from DXF, PDF and image references, then passing spatial structure to FacilityManager through FACMAP.

See `PROJECT_HANDOFF.md` for the current product state and `docs/FACMAP_SPEC_v0.1.0.md` for the exchange contract.

## Included sample

For a quick first run, open:

`samples/PieniPlan_Build1_SAMPLE.dxf`

It is an 8000 × 6000 mm simple four-room test drawing with separate wall/door/window/text layers.
