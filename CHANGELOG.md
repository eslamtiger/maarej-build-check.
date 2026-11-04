# Changelog

## V1.03 — Mobile Render Fix + Interaction Completion + QA Readiness

Extends V1.02 without changing approved Product Architecture or Financial Logic.

- Replaced the animated masked ShineBorder implementation with an Android-safe static/subtle border treatment.
- Disabled mobile backdrop-filter on the active V1.02 navigation/drawer layers and kept Home content animation to stable transform/opacity/SVG progress patterns.
- Completed Home next-achievement action with an Achievement Preview Drawer.
- Added real Group Workspace route and linked teacher profile route using existing Student relationships.
- Added Homework and Exam detail interactions; materials without a real file are explicitly unavailable rather than fake-download actions.
- Fixed Schedule date behavior so agenda events are filtered by selected date and empty days show a real empty state.
- Added Payment and Top-up simulation drawers without pretending to execute a production payment.
- Replaced hard-coded Withdrawal behavior with editable amount validation and Dependent/Independent + funding-source branching.
- Converted Account rows and Plan actions to working, disabled, or static states as appropriate.
- Added key `data-testid` attributes and a temporary `/qa` preview route.
- Added Android-like 390px/430px visual QA and interaction audit artifacts.

## V1.02 — Youthful Gamification Polish + Real Open-Source Components

Extends V1.01 without changing the approved Student information architecture, routes, data model, or financial architecture.

- Integrated real local shadcn/ui application primitives for Card, Button, Badge, Avatar, Tabs, Progress, Drawer, and Skeleton.
- Integrated real local Magic UI components for NumberTicker, AnimatedCircularProgressBar, ShineBorder, AnimatedList, and Confetti, all restyled for Maarej.
- Kept interaction implementation to Motion + shadcn where Animate UI / React Bits source was not required.
- Added global press/tap feedback and Motion `layoutId` transitions for bottom navigation, tabs, and schedule day selection.
- Polished Student Home with Daily Mission, next-achievement preview, reward preview, restrained ticker/progress feedback, and approved streak rendering.
- Rebuilt the visual layer of Rehlati around Growth Hero, selectable growth tracks, premium Mission presentation, collectible Badge states, Achievement moment, Recognition timeline, and Reward system.
- Added `ConsistencyStreak` component that renders only when streak data exists.
- Polished Taallami group cards without changing its five-tab workspace architecture.
- Polished Schedule event type language and interaction without changing agenda structure.
- Kept Finance intentionally low-gamification and preserved its information architecture and financial logic.
- Kept Account architecture intact with light identity/tap polish only.
- Added real-shape Journey and Learning loading skeletons and compact empty-state language.
- Added 390×844 visual review artifacts and an interaction GIF.

## V1.01 — Student UX & Visual System Integration

Extends V1.00 without rebuilding the project.

- Rebuilt Student visual/application layer only.
- Replaced oversized Student navigation cards with compact learning, journey, schedule, finance, and account patterns.
- Added compact 64px Student header and retained exactly five bottom-nav destinations.
- Completed Taallami tabs: groups, homework, exams, teachers, materials.
- Rebuilt Rehlati around growth profile, current mission, badges, recognition, and rewards.
- Added badge and schedule event bottom sheets.
- Refined Finance and implemented a three-step withdrawal flow with explicit parental-approval state when required.
- Added Notifications and Plans student surfaces.
- Removed user-visible developer/backend terminology from Student UI.
- Parent Experience remains V1.00 and is not rebuilt.
