# PieniPlan AI CONTINUATION PROMPT

Continue PieniPlan from **v0.1.0 · Build 1**.

Read in this order:

1. `PROJECT_HANDOFF.md`
2. latest `BUILD_CHANGES_*.md`
3. `CHANGELOG.md`
4. `docs/FACMAP_SPEC_v0.1.0.md`

If the user's cross-project master collaboration/design rule files are provided in the session, apply them above general AI conventions and below the user's newest explicit PieniPlan decisions.

Important current decisions:

- PieniPlan = Small Web Floor Plan Editor
- independent from FacilityManager
- reference AutoCAD / LibreCAD / magicplan selectively
- world coordinates and exact dimensions are foundational
- DXF/PDF/image should all be usable as references; Build 1 implements DXF/image, PDF is pending
- DXF may be traced instead of directly edited
- Reference and Drawing are separate
- left categories are Select / Draw / Architecture / Dimension / Modify
- right inspector is Layers / Reference / Properties
- do not turn it into a giant general-purpose CAD product without floor-plan value
- FACMAP remains the boundary contract with FacilityManager

Before the next build, first review real browser feedback from Build 1 and update the layout/interaction baseline before adding a large feature set.
