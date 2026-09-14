# PieniPlan

**Small Web Floor Plan Editor**

PieniPlan is a lightweight browser-based 2D floor plan editor focused on turning existing references into accurate drawings with real-world dimensions.

Current version: **v0.1.0 · Build 2**

## Current focus

Build 2 keeps the Build 1 drawing/coordinate baseline and corrects the first real-browser UI feedback before the feature set grows.

### Working now

- Static web app suitable for GitHub Pages
- Korean / English UI
  - browser/OS language auto-detection
  - English fallback
  - `?lang=ko` / `?lang=en` testing override
- DXF reference import and Canvas/Path2D rendering
- Image reference import
- Reference opacity and visibility controls
- DXF reference layer visibility controls
- Reference scale calibration using two picked points + a real distance in mm
- Real-world drawing coordinates in millimetres
- CAD-style navigation
  - mouse wheel: Zoom
  - middle-button drag: Pan
  - Space + left drag: Pan
- Left tool categories
  - Select
  - Draw
  - Architecture
  - Dimension
  - Modify
- Current drawing tools
  - Select
  - Line
  - Wall
  - Distance
  - Delete
- Line/Wall direct numeric entry
  - Length
  - Angle
  - Wall Thickness
- GRID / SNAP / ORTHO status controls
- Undo / Redo for PieniPlan drawing objects
- Right inspector structure
  - Layers
  - Reference
  - Properties
- consistent standard SVG icon family instead of improvised Unicode icons
- delayed contextual tooltips only where explanation is useful

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
- Information/Help page for CAD terminology
- final CAD shortcut map

## Language and CAD terms

PieniPlan currently supports Korean and English.

The Korean UI intentionally keeps several established CAD terms in English:

- GRID
- SNAP
- ORTHO
- DXF

These terms will later receive concise explanations in the Information/Help area. GRID/SNAP/ORTHO also provide delayed hover/focus explanations in the working UI.

## Icons

PieniPlan uses a small local subset of Font Awesome Free SVG icons. It does not use an icon font or external icon CDN.

See `THIRD_PARTY_LICENSES.md`.

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

Upload the contents of this folder to the repository root and enable GitHub Pages for the branch containing `index.html`.

No build step, package manager, backend, database, or paid service is required.

## Data / privacy

Imported DXF and image files are processed in the browser. PieniPlan does not upload drawing files to a PieniPlan server.

## Project direction

Reference products:

- AutoCAD: precision, coordinates, numeric input, snapping and familiar CAD interaction grammar
- LibreCAD: lightweight 2D CAD workflow and layer-oriented editing
- magicplan: approachable floor-plan creation and dimension-correction flow

PieniPlan is not intended to become a full general-purpose AutoCAD clone. Its focus is creating and correcting accurate floor plans from DXF, PDF and image references, then passing spatial structure to FacilityManager through FACMAP.

See `PROJECT_HANDOFF.md` for the current product state and `docs/FACMAP_SPEC_v0.1.0.md` for the exchange contract.

## Included sample

For a quick first run, open:

`samples/PieniPlan_SAMPLE.dxf`

It is an 8000 × 6000 mm simple four-room test drawing with separate wall/door/window/text layers.
