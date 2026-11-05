# V1.08.2 — Order Details Compact Rework

Extension of the published V1.08.1 Student baseline with Order Details prototype.

- Compact, opt-in Student header for Order routes; Search actions hidden only here.
- Compact status panel, booking summary with the session schedule, and a combined provider/location section.
- Finance and receipts share one surface; recorded remaining balance has clearer emphasis.
- Connected timeline grouped by date, compact next-step callout and clearly disabled unavailable actions.
- Order navigation inherits a validated return context; direct links have no falsely active tab.
- Scoped mobile-first spacing and desktop two-column layout. Data fixtures, statuses, finance records and business rules remain unchanged.

Validation: build, TypeScript, existing Student closure checks, Order fixture/context checks and exported HTML checks passed. No lint script is configured. Browser viewport QA and measured page-height reduction are unverified because the required managed browser capability is unavailable; no percentage reduction is claimed.

Install: npm ci. Build: npm run build. Static export: apps/maarej-web/out.
