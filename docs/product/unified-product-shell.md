# Maarej — Unified Product, U1 / V1.09.1

`maarej.com = Public Marketplace + Student Experience` in one source package. The current Sites URL is the preview host; no custom domain or authentication has been provisioned.

## Route ownership
- Public: `/`, `/teachers`, `/teachers/[teacherId]`. Teacher profiles remain minimal placeholders.
- Reserved public contracts only: `/centers`, `/centers/[centerId]`, `/spaces`, `/spaces/[spaceId]`. Search/profile pages are not implemented; inactive entries stay visibly disabled.
- Student: `/student`, `/student/learning/*`, `/student/journey/*`, `/student/finance/*`, `/student/settings/*`, `/student/notifications/*`, `/student/orders/*`. Existing `/student/account`, profile/security/plans aliases remain operational.
- `product/routes.ts` owns context classification and entity route builders. Public pages never render Student bottom navigation; Student pages retain their five tabs.

## Compositions and shared brand
`PublicMarketplaceShell` and `StudentV101Shell` have different navigation tasks. Both compose shared `MaarejLogo`, `ProductHeaderLink` and focus semantics. Student notifications use `ProductNotifications`; Public does not invent unread or signed-in state. Existing Maarej typography, color tokens and Lucide icons are retained. Student cards/screens are not redesigned.

Logo returns to `/`. Public `تعلّمي` opens `/student`. Student's existing teacher-search entry opens `/teachers`; its avatar menu also offers Discovery for compact internal pages. Center search stays disabled pending implementation. No new bottom tab or login flow is introduced.

## Shared teacher identity
`product/teacher-identities.ts` is the registry over existing seed sources and explicit aliases. It contains the 30 migrated Marketplace identities and the 3 distinct Student teacher identities. There is no evidence that these represent matching people, so no name-based merge is performed.

Marketplace IDs remain unchanged. Student route aliases (`ahmed-salem`, etc.) remain unchanged and resolve to explicit canonical `tch-student-*` identities. Student relationship projections expose `canonicalTeacherId`; names resolve through the same registry. Public placeholders resolve canonical IDs from either source. Only the existing 30 discovery records appear in Teacher Search; no Student teacher gets invented public discovery metrics.

`PublicTeacherProfile != StudentTeacherRelationship`: the former is discovery, the latter is the learner's actual relationship, group and records. Teacher source links inside Student resolve to `/student/learning/teachers/[alias]`, never to Public by accident.

Subject aliases are explicit in `product/subject-identities.ts`, preserving existing `math`, `physics`, `arabic`, `english` IDs. No fuzzy cross-source identity matching. Center and CoSpace have separate contracts, never interchangeable entities.

## Orders and future integration
Existing Order Details and its view model remain unchanged. A future Marketplace→Profile→Request→Order flow can carry a canonical provider ID and explicit source alias. U1 does not create orders, bookings, financial rules, authentication, maps or databases. Unmatched demo order provider IDs are not guessed into the registry.

## Development base
V1.09.1 is one editable source package for Public and Student. Future work extends it; do not split sources or reintroduce legacy DOM/CSS/Student/auth code.

## Verification limit
Build/typecheck, Student/M1/U1 tests and static shell/route audits run. Browser viewport QA remains unavailable in the managed environment; no claim of pixel-level visual regression or tested device sizes is made.
