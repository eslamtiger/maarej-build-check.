# INTERACTION_QA_V1.05 — Phase 1

Scope: Phase 1 interaction wiring. Existing V1.03/V1.04 flows outside the changed composition remain preserved.

| Element | Action | Expected | Actual | Result |
|---|---|---|---|---|
| Header identity mark | Tap | Open Journey identity section | `/student/journey#identity` | PASS |
| Home next-step CTA | Tap | Open current learning/homework context | `/student/learning#homework` | PASS |
| Home “عرض رحلتي” | Tap | Open Journey identity section | `/student/journey#identity` | PASS |
| Home Mission CTA | Tap | Open linked homework context | `/student/learning#homework` | PASS |
| Now session | Tap | Open group workspace | `/student/learning/groups/math-excellence` | PASS |
| Next homework | Tap | Open homework tab/context | `/student/learning#homework` | PASS |
| Achievement preview | Tap | Open achievement preview sheet | `onClick → setAchievementOpen(true)` | PASS |
| Reward preview | Tap | Open Reward Details | `/student/rewards/attendance` | PASS |
| Important activity | Tap | Open transaction/activity sheet | `onClick → setActivityOpen(true)` | PASS |
| At Risk recovery CTA | Tap | Open actionable learning context | `/student/learning#homework` | PASS |
| Downgraded restore CTA | Tap | Open actionable learning context | `/student/learning#homework` | PASS |
| QA Active state | Tap | Switch presentation QA state | `writeQaIdentityMode("active")` | PASS |
| QA At Risk state | Tap | Switch presentation QA state | `writeQaIdentityMode("atRisk")` | PASS |
| QA Downgraded state | Tap | Switch presentation QA state | `writeQaIdentityMode("downgraded")` | PASS |
| Journey SVG nodes | Visual | Must not imply click if no action exists | No button/cursor/tap affordance attached | PASS |
| Bottom navigation | Tap | Preserve five existing student routes | Existing navigation unchanged | PASS |

## Source checks
- 63 TS/TSX files parsed with TypeScript transpilation: 0 syntax errors.
- Local `@/` import audit: 0 missing imports.
- No new XP / Coins / Leaderboard logic introduced.
- Finance logic, schedule date filtering, withdrawal branching, and existing Student routes were not changed in Phase 1.

## Build note
`npm run build` cannot execute in this environment because project dependencies are not installed and `next` is therefore unavailable. This is an environment/dependency gate, not a reported TypeScript source error. Full Next runtime build/E2E remains required before release packaging.
