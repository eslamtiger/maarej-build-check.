# V1.05.3 — Functional QA

Viewport used for interaction run: 390×844. Responsive containment was additionally checked at 360×800, 412×915, and 430×932.

| Screen | Element | Expected | Actual | Result |
|---|---|---|---|---|
| Global | Bottom navigation | 5 items visible, no crop/overflow | 5/5 visible within viewport | PASS |
| Journey | Journey nodes | Tap opens contextual bottom sheet | Node detail sheet opens; no dead node UI | PASS |
| Journey | Current mission | CTA opens the real linked learning record | Source CTA points to `/student/learning#homework` | PASS |
| Journey | Badge | Tap opens badge details | Badge drawer/sheet wired to existing badge data | PASS |
| Journey | Recognition | Rows without extra detail are non-interactive; “عرض الكل” works | Rows are static; “عرض الكل” opens details sheet | PASS |
| Journey | Reward | Tap opens Reward Details | Links to `/student/rewards/attendance` | PASS |
| Home | Mission CTA | Opens the linked learning task | CTA links to `/student/learning#homework` | PASS |
| Home | Journey CTA | Opens Journey identity area | CTA links to `/student/journey#identity` | PASS |

## Responsive checks

| Viewport | document scrollWidth | Bottom nav | Nodes + labels | Mission bounds | Result |
|---|---:|---|---|---|---|
| 360×800 | 360px | 5/5 visible | Inside safe bounds | Inside viewport | PASS |
| 390×844 | 390px | 5/5 visible | Inside safe bounds | Inside viewport | PASS |
| 412×915 | 412px | 5/5 visible | Inside safe bounds | Inside viewport | PASS |
| 430×932 | 430px | 5/5 visible | Inside safe bounds | Inside viewport | PASS |

No horizontal scroll was present in the tested mobile review surfaces.
