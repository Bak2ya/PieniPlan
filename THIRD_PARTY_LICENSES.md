# Third-party notices

## CADdillo — Starter Components source reference

PieniPlan Build35 uses the **CADdillo** CAD block catalogue as the source/provenance reference for Starter Component names, published plan footprints and insertion datums.

Source library: https://caddillo.com/blocks/  
License information: https://caddillo.com/license/  
License: **Creative Commons CC0 1.0 Universal**

The Build35 runtime does **not** bundle verbatim CADdillo DXF binaries. It contains normalized PieniPlan redraws based on the published catalogue dimensions and insertion references. Per-asset source, unit and normalization notes are recorded in `assets/components/ASSET_PROVENANCE.md`.

## Tabler Icons

PieniPlan includes a small local subset of **Tabler Icons v3.46.0** outline SVG icons.

Source project: Tabler Icons (`tabler/tabler-icons`)

License: MIT License  
Copyright (c) 2020-2026 Paweł Kuna

The complete license text used by this project is included at:

`vendor/tabler/LICENSE.txt`

Only the icons needed by the PieniPlan interface are bundled locally. No icon CDN is required at runtime.


### Local outline icon extensions

`vendor/tabler/file.svg`, `printer.svg`, `rectangle.svg`, `circle.svg`, `arc.svg` are PieniPlan-authored simple 24×24, 2px outline additions matching the existing menu grammar. They are not newly downloaded third-party images. Existing Tabler subset licensing remains in vendor/tabler/LICENSE.txt. Component vector provenance remains in assets/components/ASSET_PROVENANCE.md.


## PDF output and font dependencies (Build70)

Pinned jsPDF4.2.1 (MIT), svg2pdf.js2.8.1 (MIT), PDF.js6.4.299 (Apache2.0 plus asset-specific notices), and static Noto Sans KR400 (SIL OFL1.1) are bundled locally. Full upstream notices, dependency notices, provenance and font derivation are in `vendor/output/THIRD_PARTY_NOTICES.md`, associated LICENSE files and `PROVENANCE.json`. No runtime CDN is required.
