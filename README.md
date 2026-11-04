# Maarej New Project

**Current version:** V1.04 — Mobile Render Fix + Interaction Completion + QA Readiness  
**Base:** V1.02 — Youthful Gamification Polish + Real Open-Source Components

V1.04 is a targeted Student render/interaction completion release. It does not rebuild the project, change the approved Product Architecture, replace the Student data model, or redefine Financial Logic.

## Preserved architecture

- Home structure and youthful gamification direction.
- Taallami five-tab workspace.
- Rehlati Growth / Mission / Badges / Recognition / Rewards.
- Unified Schedule agenda structure.
- Finance information architecture and financial language.
- Exact five-item Student bottom navigation: **الرئيسية · تعلّمي · رحلتي · الجدول · حسابي**.

## V1.04 additions

- Android-safe static achievement border; no CSS mask/mask-composite continuous shine.
- Completed Student interaction flows and removed dead clickable-looking UI.
- Group Workspace and linked Teacher Profile routes.
- Homework / Exam / Schedule detail interactions.
- Payment / Top-up simulation drawers and conditional Withdrawal flow.
- Account actions converted to working routes, disabled states, or static rows.
- Schedule events filtered by selected ISO date.
- `data-testid` coverage for key QA actions.
- Temporary `/qa` preview route for demo state and interaction checklist.

## Routes added in V1.04

- `/student/learning/groups/[groupId]`
- `/teachers/[teacherId]`
- `/student/profile`
- `/student/security`
- `/student/settings`
- `/qa` — preview QA helper; not present in normal navigation.

## Run

```bash
npm install
npm run dev
```

## Review

See `INTERACTION_QA_V1.04.md`, `V1.04_REVIEW.md`, and `review-v103/`.
