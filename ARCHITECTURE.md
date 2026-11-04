# Maarej New Project — Architecture

## Platform shape

V1.02 keeps the V1.00/V1.01 platform architecture unchanged.

- `apps/maarej-web` → `maarej.com`, currently Student + Parent.
- Future apps remain possible for `teacher.maarej.com`, `center.maarej.com`, and `admin.maarej.com` without rebuilding shared foundations.
- `packages/design-tokens` → cross-experience design tokens.
- `packages/ui` → shared experience primitives inherited from the foundation.
- `apps/maarej-web/src/components/ui` → local shadcn-based application primitives.
- `apps/maarej-web/src/components/magicui` → selected real Magic UI components, locally owned and restyled.
- `apps/maarej-web/src/components/gamification` → Maarej-specific gamification composition with no new economy/business rules.
- `apps/maarej-web/src/components/student` → Student experience composition.

## Student route architecture

Unchanged from V1.01:

- `/student` — Today / command-center home.
- `/student/learning` — Taallami workspace.
- `/student/journey` — gamified learning journey.
- `/student/schedule` — unified student schedule.
- `/student/account` — account and service entry points.
- `/student/finance` — finance reached from Account/deep links, never a sixth bottom-nav item.
- `/student/rewards/attendance` — reward detail.
- `/student/notifications` — notifications.
- `/student/plans` — versioned plan presentation.

## Product/data boundary

V1.02 does not add XP, levels, virtual coins, leaderboards, social feeds, new reward economy, new payment rules, or new financial states.

`src/data/student-v102-view.ts` is presentation-only UI configuration used to express the approved seed data with stronger hierarchy. The original V1.01 Student demo/data source remains intact.

`ConsistencyStreak` renders only when a streak value exists in the current data; it does not calculate or create a new streak rule.

## Interaction architecture

- Motion `layoutId` → active tab, bottom-nav pill, selected schedule day.
- Motion `whileTap` → interactive cards/actions; approximate scale 0.98.
- shadcn/Radix/Vaul primitives → application interactions and drawers.
- Magic UI → only ticker, circular progress, shine, animated list, and achievement confetti.
- `prefers-reduced-motion` is respected in Motion/Magic interaction wrappers.

## RTL/mobile contract

- Root language/direction remain Arabic RTL.
- shadcn project config remains RTL-enabled.
- Directional styling uses logical positioning where relevant.
- Student header remains compact (~64px).
- Bottom navigation respects safe area and remains five items.
- Review target: 390×844 with no horizontal overflow.
