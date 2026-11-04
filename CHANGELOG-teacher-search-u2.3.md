# V1.09.5 — Teacher Search Art Direction Pass

Base: Library V1.09.4, without reverting the functional engine.

## Presentation
- New portrait-led compact card composition, stage tags in the identity column and an integrated tinted price/profile footer. Existing trust, subjects, location, prices and profile links remain.
- Removed the selected-teacher check square. Focus uses a quiet border, portrait outline and mild elevation, matching the selected map pin ring.
- Search-only silhouette fallback at the portrait ratio, with small initials. Default profile portrait markup is preserved.
- Single-select sheets now expose actual radio semantics, visually showing a check only for the selected row. Compact dividers replace independent heavy row cards; long lists retain search and sticky result actions.
- Full filters grouped as subject/stage, place, educational system, rating and price, with existing callbacks and values.
- Shorter intro, quieter map texture, compact segmented control and intentional results-sheet layering. Existing motion durations and reduced-motion behavior retained.

## Scope isolation
Only teacher-card.tsx, teacher-search.tsx, filter-selection-sheet.tsx and marketplace.module.css changed in application source. Art-direction CSS is gated by the search-only wrapper; the shared Teacher Profile shell/portrait and Marketplace Home are preserved. No Student source, data, IDs, routes, adapters, normalization, query contracts, filtering/sorting or map/card state functions changed.

## Validation
Typecheck; production build; Student closure; Marketplace/Search; Unified Product; export checks; server-render checks for default profile/card compatibility, selected card without a check, avatar fallback, price/trust/profile link preservation and exclusive selection semantics. Source freeze verified against the extracted Library base.

## Verification limit
Supervised preview started, but the cloud browser failed with connection/navigation/frame-tree timeouts. Browser interaction, the seven viewport visual checks, the 15–20% height reduction target and side-by-side visual acceptance are unverified. No claim of completed browser QA is made.
