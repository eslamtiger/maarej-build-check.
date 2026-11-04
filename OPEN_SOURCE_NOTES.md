# Open Source Notes — V1.04

V1.04 uses only the approved UI stack: shadcn/ui-style local source primitives, Magic UI source components already vendored in the project, Motion, and Lucide React. No fifth UI framework was added.

## Application primitives
- Button — shadcn/ui local source pattern — `components/ui/button.tsx` — copied/localized and restyled with Maarej tokens — MIT.
- Card — shadcn/ui local source pattern — `components/ui/card.tsx` — copied/localized and restyled — MIT.
- Tabs — shadcn/ui local source pattern — `components/ui/tabs.tsx` — copied/localized and restyled — MIT.
- Progress — shadcn/ui local source pattern — `components/ui/progress.tsx` — copied/localized, Motion fill customized — MIT.
- Drawer — shadcn/ui/Vaul local source pattern — `components/ui/drawer.tsx` — copied/localized and restyled — MIT.
- Avatar — shadcn/ui local source pattern — `components/ui/avatar.tsx` — copied/localized and restyled — MIT.
- Badge — shadcn/ui local source pattern — `components/ui/badge.tsx` — copied/localized and restyled — MIT.
- Skeleton — shadcn/ui local source pattern — `components/ui/skeleton.tsx` — copied/localized and restyled — MIT.
- ScrollArea / Separator / Dialog / Tooltip / Dropdown application primitives remain local source-owned in `components/ui/application.tsx` and are restyled with Maarej tokens.

## Magic UI
- NumberTicker — Magic UI — `components/magicui/number-ticker.tsx` — local source copy customized for Maarej — MIT.
- AnimatedCircularProgressBar — Magic UI — `components/magicui/animated-circular-progress-bar.tsx` — local source copy customized — MIT.
- AnimatedList — Magic UI — `components/magicui/animated-list.tsx` — local source copy customized — MIT.
- Confetti — Magic UI pattern using canvas-confetti — `components/magicui/confetti.tsx` — local source copy customized — Magic UI MIT; canvas-confetti ISC.

`ShineBorder` is not used by V1.04.
