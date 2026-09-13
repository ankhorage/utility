---
'@ankhorage/utility': minor
---

Remove the public `@ankhorage/utility/image` entrypoint and its Contracts, Sharp, OpenCV,
Tesseract and Pixelmatch dependencies. The entire image-analysis capability belongs in a
separate repository. Preserve its implementation and tests as commented source at the
maintainer's request; exclude that source from the published build.

This is a breaking API removal in the pre-1.0 package. Screenshot-analysis consumers such
as the zora-designer skill must move to the future owning package before using this API
again. The remaining Utility subpaths are unchanged, and Utility no longer depends on
Contracts.
