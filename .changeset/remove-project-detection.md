---
'@ankhorage/utility': major
---

Remove the project detection implementation and the @ankhorage/utility/project public subpath. Import detectProject from @ankhorage/project-detector and its public types from @ankhorage/project-detector/types instead. The standalone detector also provides bounded filesystem inspection through its /node subpath. Utility does not depend on the detector or retain a compatibility re-export.
