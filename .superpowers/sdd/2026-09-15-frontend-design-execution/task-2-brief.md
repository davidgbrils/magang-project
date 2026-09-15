# Task 2 Brief: Tokens and tactile UI primitives

Work only in `C:\Users\LENOVO\Documents\ITCC\magang.worktrees\frontend`.

Read this first — it is the exact requirement for Task 2. The existing baseline is committed at `854384a`. Use the Stitch design system and copied docs as authority. Do not edit backend, supabase, OpenAPI, processor, or other agent files.

Implement reusable UI primitives used by later pages:

- `styles/tokens.css`: CSS variables for `#E0E0E0` base, `#FFFFFF` highlight, `#BEBEBE` dark shadow, `#27313A` main text, `#66717A` secondary text, `#356AE6` primary action, and semantic success/warning/danger colors from the Stitch design system. Include raised, recessed, and pressed shadow variables. Keep all values token-driven.
- `styles/globals.css`: import tokens and apply accessible base typography, backgrounds, focus-visible styling, and responsive root defaults. Preserve the existing Arial fallback unless a local font strategy is explicit; do not add external font fetching.
- `components/ui/Button.tsx`: typed button with `variant` (`primary`/`secondary`/`quiet`), `loading`, `disabled`, and `children`; native button semantics; loading text must remain perceivable and prevent duplicate activation.
- `components/ui/TextField.tsx`: labelled input with optional hint/error, `aria-describedby`, and invalid state. Keep keyboard behaviour native.
- `components/ui/StatusBadge.tsx`: status text plus semantic tone (`success`/`warning`/`danger`/`neutral`); never colour-only.
- `components/ui/AsyncState.tsx`: explicit loading, empty, and error variants with a human-readable message and optional action slot.

TDD requirements:

1. Add focused tests first in `tests/frontend/ui-primitives.test.tsx` for button loading/disabled semantics, field label/error wiring, status text, and AsyncState messages. Run and verify a meaningful RED failure before implementation.
2. Implement the smallest components with no speculative abstraction.
3. Run the focused tests, then full lint, typecheck, all tests, and production build.
4. Check the contrast of `#27313A` and `#66717A` on `#E0E0E0` and primary button white text on `#356AE6`; do not claim unverified ratios.
5. Write full report to `.superpowers/sdd/2026-09-15-frontend-design-execution/task-2-report.md`, including RED/GREEN and exact command results. Commit only Task 2 files with `feat(frontend): add tactile ui primitives`.

Do not dispatch subagents. Return only status, commit SHA, one-line test summary, and concerns.
