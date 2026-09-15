# Task 2 Report: Tokens and tactile UI primitives

## Status

Implemented the shared token layer and four typed UI primitives requested by Task 2. The implementation remains API-agnostic and does not modify backend, Supabase, OpenAPI, or processor files.

## Design read

Reading this as an internal operational UI foundation for ITCC staff, using the approved tactile Stitch language with ENERGY 1 / RHYTHM 1 / MOTION 1.

Major decision reasons:

- Color: the neutral surface, blue action, and semantic tones come directly from the Stitch design-system metadata.
- Typography: Arial remains the base because the repository has no approved local font asset or loading strategy.
- Depth: raised buttons, recessed fields and state panels, and pressed actions make interaction state tactile without decorative glow or glass.
- Spacing: one compact token scale keeps later operational screens consistent and preserves 44px touch targets.
- Status marker: the dot carries the semantic tone while adjacent status text prevents color-only meaning.
- Motion: only a short press-state transition is present, and reduced-motion removes it.

## Files

- `styles/tokens.css`
- `styles/globals.css`
- `components/ui/Button.tsx`
- `components/ui/TextField.tsx`
- `components/ui/StatusBadge.tsx`
- `components/ui/AsyncState.tsx`
- `tests/frontend/ui-primitives.test.tsx`

## TDD evidence

### RED

Command:

```text
npm test -- tests/frontend/ui-primitives.test.tsx
```

Result: exit 1. Vitest could not resolve `../../components/ui/AsyncState`, proving the new primitive suite failed before implementation because the requested components did not exist.

```text
FAIL  tests/frontend/ui-primitives.test.tsx
Error: Cannot find module '../../components/ui/AsyncState'
Test Files  1 failed (1)
```

### GREEN

Command:

```text
npm test -- tests/frontend/ui-primitives.test.tsx
```

Result: exit 0.

```text
PASS  tests/frontend/ui-primitives.test.tsx (8 tests)
Test Files  1 passed (1)
Tests  8 passed (8)
```

The focused suite covers loading and disabled button markup, label and error relationships, visible status text, all three asynchronous state messages, and the optional recovery action slot.

## Contrast evidence

Checked with the antislop WCAG 2.x contrast script:

| Foreground | Background | Ratio | Use |
|---|---|---:|---|
| `#27313A` | `#E0E0E0` | 10.03:1 | Main text, PASS for normal text |
| `#66717A` | `#E0E0E0` | 3.78:1 | Official secondary token, FAIL for normal text and PASS for large text or non-text boundaries |
| `#FFFFFF` | `#356AE6` | 4.82:1 | Primary button text, PASS for normal text |
| `#505A62` | `#E0E0E0` | 5.34:1 | Accessible secondary normal text, PASS |
| `#2F7D54` | `#E0E0E0` | 3.80:1 | Success status marker, PASS for non-text contrast |
| `#956D18` | `#E0E0E0` | 3.55:1 | Warning status marker, PASS for non-text contrast |
| `#A43D42` | `#E0E0E0` | 4.78:1 | Danger marker and error text, PASS for normal text |

The official `#66717A` value remains available as `--color-text-secondary`. Normal-size secondary copy uses `--color-text-secondary-accessible` (`#505A62`) because the official value does not meet the 4.5:1 normal-text threshold. The official secondary value is also the structural border color because its 3.78:1 ratio exceeds the 3:1 non-text threshold.

## Verification

| Command | Result |
|---|---|
| `npm run lint` | exit 0, ESLint reported no errors or warnings |
| `npm run typecheck` | exit 0, TypeScript reported no errors |
| `npm test` | exit 0, 2 files and 15 tests passed |
| `npm run build` | exit 0, Next.js 15.5.3 compiled and generated 5 static pages |
| `git diff --check` | exit 0, no whitespace errors; Git only reported the existing LF-to-CRLF worktree notice |

## Accessibility and anti-slop gate

- R-02 PASS: primitive-facing strings contain no em dash.
- R-03 PASS: controls are fluid-width where needed and interactive targets have a 44px minimum size.
- R-25 PASS: required text pairs were computed above; the failing official secondary pair is not used for normal text.
- R-26 PASS: Button retains native button props and defaults to `type="button"`; loading and disabled states set native `disabled`.
- R-27 PASS: AsyncState has explicit loading, empty, and error variants with required human-readable messages.
- R-32 PASS: native button and input keyboard behavior is retained, and global `:focus-visible` uses a 2px primary outline with offset.
- R-33 PASS: all CSS and components were authored directly in source.
- R-35 PASS within primitive scope: focused server rendering verifies emitted native semantics, the full production build succeeds, and source inspection covers each primitive. No routed showcase exists in Task 2, so page-level browser click-through remains a later integration check.
- C-4 PASS: status is not color-only, errors use `role="alert"`, non-error async states use polite status announcements, and reduced-motion removes the only transition.
- Purpose gate PASS: there are no gradients, glow, glass, illustrations, decorative icons, invented content, or template page structures. Shadows exist only to distinguish raised, recessed, and pressed interaction states.
- Liveliness PASS for this foundation: tactile depth is the repeated identity motif, blue is limited to primary action and focus, and spacing follows a deliberate compact operational rhythm.

## Concerns

- The primitives are not mounted on a routed page in Task 2, so visual browser and 200 percent zoom checks must be repeated when Task 3 consumes them.
- Plus Jakarta Sans is named in the Stitch direction but was not added because there is no approved local font asset; Arial is intentionally preserved per the Task 2 brief.

## Review fix

The Task 2 review identified four issues. They were resolved without changing the API, backend, Supabase, OpenAPI, or processor boundary.

- `StatusBadge` now requires `label: string` and rejects blank labels. This prevents icons, fragments, or whitespace from becoming the only status representation.
- Each button variant has a visible hover treatment inside `@media (hover: hover) and (pointer: fine)`. Every hover selector excludes active and disabled buttons, preserving pressed and disabled depth.
- Content width, form width, minimum viewport width, fluid page padding, hover depth, and easing are now design tokens instead of literals in `globals.css`.
- Semantic color provenance is recorded below with the stable Stitch project identifier and retrieval path.

### Review RED

Command:

```text
npm test -- tests/frontend/ui-primitives.test.tsx
```

Result: exit 1. The new required-label test rendered an empty badge against the old children implementation.

```text
FAIL  StatusBadge > requires and renders a string status label instead of colour alone
Expected: "Selesai"
Received: "<span class=\"ui-status-badge\" data-tone=\"success\"></span>"
Tests  1 failed | 7 passed (8)
```

A second RED cycle covered the runtime blank-label boundary:

```text
FAIL  StatusBadge > rejects a blank status label
AssertionError: expected [Function] to throw an error
Tests  1 failed | 8 passed (9)
```

### Review GREEN and full gate

| Command | Result |
|---|---|
| `npm test -- tests/frontend/ui-primitives.test.tsx` | exit 0, 1 file and 9 tests passed |
| `npm run lint` | exit 0, ESLint reported no errors or warnings |
| `npm run typecheck` | exit 0, TypeScript reported no errors |
| `npm test` | exit 0, 2 files and 16 tests passed |
| `npm run build` | exit 0, Next.js 15.5.3 compiled in 2.2 seconds and generated 5 static pages |

### Reproducible Stitch color provenance

- Source project: `ITCC Wisuda Sync`
- Stable Stitch project ID: `12724873765600380458`
- Retrieval path: open the project by ID through an authenticated Stitch connection, read its project design-system metadata, then inspect the semantic color entries.
- Recorded mapping: success `#2F7D54`, warning `#956D18`, danger `#A43D42`.
- Cross-check: the same project metadata supplies surface `#E0E0E0`, highlight `#FFFFFF`, dark shadow `#BEBEBE`, main text `#27313A`, secondary text `#66717A`, and primary action `#356AE6`.

No API key, signed asset URL, session identifier, or other credential is stored in this report.
