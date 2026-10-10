# Output dependencies — Build70

Local, pinned official distributions; no runtime CDN. Lazy load only when an output job requests these resources.

- jsPDF 4.2.1, MIT: https://github.com/parallax/jsPDF — full original LICENSE and distribution copyright header retained.
- svg2pdf.js 2.8.1, MIT: https://github.com/yWorks/svg2pdf.js — full LICENSE retained.
- PDF.js pdfjs-dist 6.4.299, Apache-2.0: https://github.com/mozilla/pdf.js — LICENSE and asset-specific license files retained. Adobe CMaps, BSD Foxit fonts, OpenJPEG/QCMS/JBIG2 resources retain their individual notices.
- Noto Sans KR / PieniPlanOutputSans.ttf: SIL Open Font License 1.1, https://github.com/google/fonts/tree/main/ofl/notosanskr. Derived static weight400 instance; full OFL/copyright retained in FONT_OFL.txt. Original source URL/hash and derivation recorded in PROVENANCE.json. Bundled font is not sold by itself; fontTools was a build-time tool only.

PDF.js Liberation TTF files are deliberately not bundled. If an unembedded PDF font asks for those files, the output-only loader substitutes the OFL Noto font and shows a substitution notice. Embedded PDF fonts remain handled by PDF.js. Font substitution can change the appearance of such PDF underlays.

Declared bundled-dependency license texts are also retained under dependency-notices (fflate, fast-png, Babel runtime, cssesc, svgpath, specificity, font-family-papandreou, iobuffer, pako). MANIFEST records the upstream notice version used; it does not claim that the minified distributions resolve every semver dependency to that exact version. jsPDF preserves embedded original notices. Pako contains MIT and Zlib notices.

PROVENANCE.json records downloaded files' exact SHA256. dependency-notices/MANIFEST.json records additional notice files' SHA256. Existing CADdillo and Tabler notices remain unchanged.

QuickJS bundled WASM retains its MIT notice under pdfjs-dist/wasm/LICENSE_QUICKJS_MIT. Upstream provenance/licensing: https://github.com/mozilla/pdf.js/tree/master/external/quickjs . PDF scripting is not used by this output raster path.
