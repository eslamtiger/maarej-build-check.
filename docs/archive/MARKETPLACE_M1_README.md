# V1.09 — Marketplace Integration, Phase M1

Install: `npm ci`. Build: `npm run build`. The existing Next.js static export stays in `apps/maarej-web/out`.

Routes: `/`, `/teachers`, `/teachers/tch-m1-bb7bef77b6c7` (first demo teacher), `/student/*` (unchanged Student workspace).

Marketplace source lives in `apps/maarej-web/src/marketplace/`: `types`, `data`, `adapters` and `components`. The sanitized demo fixture is the single search data source; the explicit ID map bridges legacy IDs and migration routes. This DTO is not a final backend schema. No operational Student records are generated from Marketplace data.

The one-time script `python3 scripts/migrate-marketplace-teachers.py /path/to/extracted-v662/data.json` regenerates the migration fixtures and inspected photo copies. The old project's assets must be beside its data.json; that external source is only needed to regenerate, never to install/build/run the current app.

Checks:
- `node --experimental-vm-modules scripts/check-marketplace-m1.mjs`
- `node --experimental-vm-modules scripts/check-student-closure.mjs`
- `node --experimental-vm-modules scripts/check-order-details.mjs`
- After build: `python3 scripts/check-marketplace-export.py` and `python3 scripts/check-order-export.py`.

Center/Co-space navigation stays inactive. Public teacher profiles are safe placeholders for M2. Marketplace maps, ratings, prices and people are explicitly demo data; no availability or booking confirmation is implied.
