# Interaction QA — V1.03

**Viewport:** Android-like 390×844, plus Home validation at 430×932.  
**User agent:** Samsung Internet / Android-style mobile UA.  
**Result:** 42 checks, 42 PASS, 0 FAIL in the browser-rendered QA surface.

> Runtime note: the current execution environment cannot resolve `registry.npmjs.org`, so dependencies cannot be installed and the full Next.js runtime cannot be launched here. Interaction tests therefore run against a browser-rendered QA surface that mirrors the V1.03 states and actions, while source-level audits verify the actual routes, handlers, `data-testid`s, disabled states, schedule filtering, and financial branching. Production deployment must remain build-gated.

| Screen | Element | Expected | Actual | Result |
|---|---|---|---|---|
| Bottom navigation | `nav-home` | working route | ?screen=home | **PASS** |
| Bottom navigation | `nav-learn` | working route | ?screen=learn | **PASS** |
| Bottom navigation | `nav-journey` | working route | ?screen=journey | **PASS** |
| Bottom navigation | `nav-schedule` | working route | ?screen=schedule | **PASS** |
| Bottom navigation | `nav-account` | working route | ?screen=account | **PASS** |
| Home | `home-daily-mission` | learning homework anchor | ?screen=learn#homework | **PASS** |
| Home | `home-reward` | reward detail route | ?screen=reward | **PASS** |
| Home | `home-next-achievement` | open achievement drawer | drawer opened | **PASS** |
| Taallami | `group-open-math-excellence` | group route/href | #group | **PASS** |
| Taallami | `homework-open-algebra-practice-4` | open homework details | drawer opened | **PASS** |
| Taallami | `exam-open-physics-unit-2` | open exam details | drawer opened | **PASS** |
| Taallami | `exam-open-algebra-short` | open result details | drawer opened | **PASS** |
| Taallami | `teacher-profile-ahmed-salem` | teacher profile route | #teacher | **PASS** |
| Taallami | `material-disabled` | disabled when no file | disabled | **PASS** |
| Schedule | `schedule-day-2026-09-28` | agenda updates to selected day | 4:30 م / حصة / رياضيات · مجموعة التفوق / 7:00 م / واجب / واجب الجبر · الدرس 4 | **PASS** |
| Schedule | `schedule-day-2026-09-29` | agenda updates to selected day | 8:30 م / مراجعة / مراجعة اختبار الفيزياء | **PASS** |
| Schedule | `schedule-day-2026-09-30` | agenda updates to selected day | 6:00 م / اختبار / فيزياء · اختبار الوحدة الثانية / 7:00 م / حصة / فيزياء · أساسيات الفيزياء | **PASS** |
| Schedule | `date-filter-distinct` | selected dates show distinct agendas | ['4:30 م\nحصة\nرياضيات · مجموعة التفوق\n7:00 ', '8:30 م\nمراجعة\nمراجعة اختبار الفيزياء', '6:00 م\nاختبار\n… | **PASS** |
| Finance | `finance-pay` | open payment drawer | drawer opened | **PASS** |
| Finance | `finance-topup` | open top-up drawer | drawer opened | **PASS** |
| Finance | `finance-withdraw dependent` | show parent approval branch | طلب سحب /  / حدد المبلغ وطريقة السحب ثم راجع الطلب. /  / المبلغ /  / المتاح للسحب: 1,240 ج.م /  / محفظة إلك… | **PASS** |
| Finance | `withdraw-amount` | editable amount input | 500 | **PASS** |
| Finance | `withdraw-method-wallet` | wallet method available | available | **PASS** |
| Finance | `withdraw-method-bank` | bank method available | available | **PASS** |
| Finance | `withdraw-submit` | submit action available | available | **PASS** |
| Finance | `finance-withdraw independent` | no parent approval branch | طلب سحب /  / حدد المبلغ وطريقة السحب ثم راجع الطلب. /  / المبلغ /  / المتاح للسحب: 1,240 ج.م /  / محفظة إلك… | **PASS** |
| Account | `account-profile` | working route | #profile | **PASS** |
| Account | `account-security` | working route | #security | **PASS** |
| Account | `account-settings` | working route | #settings | **PASS** |
| Account | `account-referral` | disabled/non-button state | accountrow disabled | **PASS** |
| Plans | `plan-upgrade` | disabled without pricing | disabled | **PASS** |
| Plans | `plan-change` | disabled without pricing | disabled | **PASS** |
| Plans | `plan-cancel` | open confirmation dialog | dialog opened | **PASS** |
| Visual 390 | `home` | no horizontal overflow | {'sw': 390, 'cw': 390} | **PASS** |
| Visual 390 | `learn` | no horizontal overflow | {'sw': 390, 'cw': 390} | **PASS** |
| Visual 390 | `journey` | no horizontal overflow | {'sw': 390, 'cw': 390} | **PASS** |
| Visual 390 | `schedule` | no horizontal overflow | {'sw': 390, 'cw': 390} | **PASS** |
| Visual 390 | `finance` | no horizontal overflow | {'sw': 390, 'cw': 390} | **PASS** |
| Visual 390 | `account` | no horizontal overflow | {'sw': 390, 'cw': 390} | **PASS** |
| Visual 390 | `plans` | no horizontal overflow | {'sw': 390, 'cw': 390} | **PASS** |
| Android render | `Home` | no mask-composite in QA surface | absent | **PASS** |
| Visual 430 | `Home` | no horizontal overflow / stable static achievement border | {'sw': 430, 'cw': 430} | **PASS** |

## Source-level audit

- All `Pressable` usages in the Student screen source have an `onClick` action.
- `TapWrap` is used only inside real `Link` elements.
- Raw action buttons are either wired to handlers or explicitly disabled.
- Materials without a real URL/file show `غير متاح حاليًا` and are disabled.
- Plans upgrade/change are disabled because the current seed has no active pricing values; cancel renewal opens confirmation.
- Schedule events are filtered by `selectedDate`; the date adapter is presentation/interaction data and does not alter the approved Student data model.
- The original `student-v101.ts` data file has the same SHA-256 as V1.02: `152519f6b7c804b55c4f7510ec27eba8226640772c696d199b7bc7bb16c6c11b`.
- Source scan found no `mask-composite` implementation; the only mention is a comment documenting its removal.
- Local TypeScript/TSX syntax pass: 46 files, 0 syntax diagnostics.
- Local relative-import audit: 0 missing local imports.

## Build gate

`npm install` cannot complete in this execution environment because DNS access to `registry.npmjs.org` is blocked. A full `next build` result is therefore **not claimed** here. Sites/deployment must run the real build and stop if it fails.
