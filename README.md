# PieniPlan

**Small Web Floor Plan Editor**

PieniPlan is a browser-based floor-plan and lightweight 2D CAD prototype built around one shared, real-world drawing coordinate system.

The same drawing can be approached with two tool sets:

- **Plan Tools** — walls, doors, windows and exact dimensions without requiring CAD knowledge.
- **CAD Tools** — editable DXF geometry, layers, precision tools and a command line for experienced CAD users.

Choosing one on the start screen only selects the first toolbox. You can switch at any time without converting the project into a different file format.

## v0.3.1 · Build 4 prototype

Implemented in this prototype:

- start screen with Plan Tools / CAD Tools entry paths
- browser History navigation so browser Back/Forward and standard mouse thumb Back/Forward can move between PieniPlan start/workspace/tool-set history when the browser maps those buttons to navigation
- in-app Back and Home controls; returning Home keeps the current in-memory drawing and shows a Continue current drawing card
- System / Light / Dark appearance selection with the choice persisted in the browser
- shared canvas, mm world coordinates, Zoom / Pan / GRID / SNAP / ORTHO
- exact wall Length / Angle / Thickness input
- door and window placement on walls with exact width
- DXF and image references with scale calibration
- DXF reference layer visibility
- editable DXF import for common LINE / POLYLINE / CIRCLE / TEXT geometry
- Plan → CAD representation mapping for wall style and layer names
- CAD → Plan simplified view that hides low-level CAD structure
- CAD command input with a small supported alias set (`L`, `E`, `DI`, `Z`, `U`, `REDO`)
- basic DXF export from the shared drawing
- Korean / English UI auto-detection
- local browser processing; no server-side drawing upload

## Prototype limitations

This is still an early prototype, not a full CAD replacement.

- PDF appears in the planned reference workflow but is not parsed yet.
- DXF editing currently focuses on common basic 2D entities.
- MOVE / COPY / OFFSET / TRIM / EXTEND and many other CAD commands are not implemented yet.
- Space/room recognition and FACMAP export are not implemented yet.
- Project save/load is not implemented yet. Returning Home preserves the current drawing only for the current page session; reload/browser close still loses unsaved project state.
- DXF export is intentionally basic and should be validated with real production drawings before relying on it for critical work.

## Run

PieniPlan is a static web app. Use GitHub Pages or another local/static HTTP server.

For a quick local test with Python:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

Opening `index.html` directly with `file://` may prevent the DXF Web Worker from loading in some browsers.

## Reference files

- DXF can be opened as an **editable drawing** in CAD Tools.
- DXF can also be added as a **reference underlay** for tracing.
- Images can be added as reference underlays and calibrated from a known real-world distance.

## Third-party notices

PieniPlan includes a small local subset of Font Awesome Free SVG icons. See `THIRD_PARTY_LICENSES.md`.
