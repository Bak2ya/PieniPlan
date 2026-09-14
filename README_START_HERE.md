# PieniPlan — START HERE

Current baseline: **v0.1.0 · Build 2**

PieniPlan is a browser-based floor plan editor split from FacilityManager's Drawing Studio direction.

Build 2 is still an early workspace/interaction baseline. The priority is validating the editor's long-term structure before adding a large catalog of CAD tools.

## First test

1. Serve this folder through HTTP or GitHub Pages.
2. Open PieniPlan in a desktop browser.
3. Confirm that no scale-calibration dialog appears on first launch.
4. On a Korean browser/OS, confirm the general UI appears in Korean while GRID / SNAP / ORTHO / DXF remain in English.
5. Hover over GRID / SNAP / ORTHO for about 0.65 seconds and confirm the concise explanation appears.
6. Confirm labeled/self-explanatory buttons are not covered in unnecessary tooltips.
7. Open `samples/PieniPlan_SAMPLE.dxf` or another DXF/image reference.
8. Use **Reference → Scale** (Korean UI: **참조 도면 → 축척**) and pick two known points.
9. Enter the real distance in millimetres.
10. Use **Draw → Line** or **Architecture → Wall** and test exact Length / Angle input.
11. Check wheel Zoom, middle-button Pan, Space+drag Pan, SNAP and ORTHO.

## Most important Build 2 validation

Judge whether the workspace feels like the right long-term home for:

- exact coordinate/dimension work
- DXF/PDF/image references
- Layers / Reference / Properties
- Select / Draw / Architecture / Dimension / Modify
- CAD-like navigation without becoming visually heavy
- beginner help that appears only when it is actually useful

Use `PROJECT_HANDOFF.md` as the persistent project state.
