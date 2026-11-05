# MAAREJ NEW PROJECT V1.09.2 — Teacher Search Visual Rebuild

Base: V1.09.1 unified product. Phase U2.

- Teacher Search visual rebuild with compact Public header scoped to /teachers.
- Map-first discovery refinement: schematic street texture, larger portrait pins, selected state and compact experimental badge.
- Teacher card hierarchy rebuild: portrait, name, subject, rating/review count, area/stage, existing price and profile CTA.
- Single-column filter sheet with stage/rating chips, all existing values and sticky actions.
- Rounded results surface on mobile, sticky map/results split on desktop, compact map/list toggle.
- No search, adapter, data, business, finance, permission or Student UX changes.
- Teacher Profile remains the existing placeholder. No Center/Co-space work.

References actually reviewed: approved V7 Search PNG and V7_REFERENCE_GUIDE.txt; current Maarej Student tokens; Preply official search listings/help; Orcas official subject, school-system and grade presentation. Outschool/Wyzant were not needed.

Validation: TypeScript and production static build passed; Student closure, Marketplace M1 search, Unified Product U1 and Order regression suites passed. Export route checks passed.

Verification limitation: managed browser-control skill is unavailable in this environment. Browser interactions, viewport screenshots and actual layout QA at 360/390/412/430/768/1024/1440 have not been verified. Responsive CSS was implemented for these widths; this is not a claim of completed visual QA.
