# PieniPlan — START HERE

Current baseline: **v0.1.0 · Build 1**

PieniPlan is a browser-based floor plan editor split from FacilityManager's Drawing Studio direction.

The first build is intentionally a working layout/interaction baseline rather than a feature-complete CAD application.

## First test

1. Serve this folder through HTTP or GitHub Pages.
2. Open PieniPlan in a desktop browser.
3. Open a DXF or image with **Open Reference** or drag a file onto the canvas.
4. Use **Fit**.
5. In the **Reference** inspector, use **Scale** and pick two known points.
6. Enter the real distance in millimetres.
7. Use **Draw → Line** or **Architecture → Wall**.
8. After the first point, enter Length / Angle and press Enter for an exact segment.
9. Check mouse wheel Zoom, middle-button Pan, Space+drag Pan, SNAP and ORTHO.

## Most important Build 1 validation

Do not judge feature count yet. Judge whether the workspace feels like the right long-term home for:

- exact coordinate/dimension work
- DXF/PDF/image references
- Layers / Reference / Properties
- Select / Draw / Architecture / Dimension / Modify
- CAD-like navigation without becoming visually heavy

Use `PROJECT_HANDOFF.md` as the persistent project state.
