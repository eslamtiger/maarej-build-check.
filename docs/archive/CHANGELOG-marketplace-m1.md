# MAAREJ NEW PROJECT V1.09 — Marketplace Integration, Phase M1

Base: `maarej-new-project-v1.08.2-order-details-compact.zip` (latest NEW PROJECT Library source and published Site source).

## Implemented
- `/` is now a compact Public Marketplace foundation, separate from `/student`.
- Public Marketplace shell uses the current typography/tokens; no Student bottom navigation on public pages. Center and Co-space entries are visibly inactive.
- `/teachers`: map-first discovery following V7's search hierarchy, responsive cards and accessible filter drawer.
- Ported V6.53 Arabic normalization, multi-subject/system/area matching, province/area hierarchy, stages, strict rating thresholds, overlapping price-range matching, sorting, result counts, selected filters and reset.
- Query parameters preserve search/filter/sort/list state and the return path from profile placeholders.
- Controlled schematic marker selection opens the same TeacherCard as the list, consistent with V6.53 pin/list parity. It is explicitly not a live geographic map. No geolocation, nearest-distance claims or fake availability.
- 30 demo teacher records pass through the isolated Marketplace adapter. Explicit `tch-m1-*` route aliases retain `legacyId`; names and array indexes never identify routes. Numeric legacy aliases redirect to the canonical migration route.
- Public teacher routes are minimal next-phase placeholders. They do not redirect into Student Teacher Relationship pages.
- Matching inspected legacy demo portraits are reused; mismatched portrait records use neutral initials. No verified badges, review system, persisted favorites, booking or financial actions were added.

## References and boundaries
- Visual authority: V7_REFERENCE_GUIDE.txt and approved Search, Teacher Profile and Center Profile PNGs. The search PNG guides hierarchy, geography/filters, portrait cards, density and RTL; existing Maarej tokens remain in use. Reference booking buttons are replaced by the requested `عرض الملف`.
- Functional reference: V6.62 archive, `teachers-v653.js`, `search-data.js`, `data.json` and V6.53 changelog.
- V6.59 profile behavior is referenced in the archive through `teacher-profile-v649.js?v=659`; full profile migration is deferred.
- Center V6.40/41/42 and Co-space V6.52 remain migration references for later phases; none of their legacy code is a runtime dependency.
- Legacy files/CSS/DOM renderer/Parent code were not copied. The legacy archive remains untouched in Library.
- External product patterns were not used; V7 and the supplied legacy sources were sufficient.

## Deferred deliberately
Full profiles/groups/weekly schedules; Center and Co-space search; nearest sorting requiring an approved map/location source; favorites persistence; reviews; authentication; booking/payment/backend/database/provider integrations.

## Validation
Build, standalone TypeScript, M1 search/alias/query tests, Student closure tests, Order fixture tests and Public/Student exported route audits passed. A byte comparison against V1.08.2 found no modifications outside the three requested Public route files; new Marketplace files are additive.
Browser viewport QA for 360/390/412/430/768/1024/1440 is unverified: the required managed browser capability is unavailable. No screenshots or measured viewport claims are provided.

## Source provenance
- Base ZIP SHA256: `ae92a1aa462451f9b3542e32d32b3377e6de0ac70dd6b195c45f2b580416afc9`
- Legacy ZIP SHA256: `a601245876c3dda3f5b34a8808b7c9c7c8e49c0451fdb20adbfffd765f0b23ac`
- Source package contains the full current project, configurations, lockfile, adapted fixtures, assets, migration script and relevant tests; generated outputs/dependencies/Git credentials are excluded.
