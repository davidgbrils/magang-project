# Task 1 Report

Status: DONE

## Scope

- Added the typed `ApiError` and `ApiClientError` boundary in `lib/api-client.ts`.
- Kept bearer authentication opt-in through `RequestOptions.accessToken`; requests without a supplied token do not receive an `Authorization` header.
- Parsed valid JSON bodies independently of `content-type`.
- Converted malformed, non-JSON, and empty non-2xx bodies to the typed `HTTP_ERROR` fallback instead of leaking a JSON parser error.
- Added focused tests for the common error envelope, a missing `content-type`, malformed and non-JSON errors, successful JSON, and token opt-in.

## TDD evidence

### RED

Command:

```text
npm test -- tests/frontend/api-client.test.ts
```

Result: exit code 1. Vitest ran 6 tests: 2 failed and 4 passed.

Expected failures:

```text
FAIL  tests/frontend/api-client.test.ts > request API error boundary > parses a JSON error envelope even when content type is missing
Expected code/message: FORBIDDEN / Akses ditolak.
Received code/message: HTTP_ERROR / Permintaan gagal (403).

FAIL  tests/frontend/api-client.test.ts > request API error boundary > keeps malformed JSON errors inside ApiClientError
Expected: ApiClientError with status 502 and code HTTP_ERROR.
Received: SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2).
```

### GREEN

Command:

```text
npm test -- tests/frontend/api-client.test.ts
```

Result: exit code 0. `tests/frontend/api-client.test.ts` passed, 6 of 6 tests green.

## Final verification

| Command | Result |
| --- | --- |
| `npm run lint` | PASS, exit code 0; ESLint completed without findings. |
| `npm run typecheck` | PASS, exit code 0; `tsc --noEmit` completed without diagnostics. |
| `npm test` | PASS, exit code 0; 1 test file and 6 tests passed. |
| `npm run build` | PASS, exit code 0; Next.js 15.5.3 compiled and generated 5 static pages, including `/` and `/login`. |

## Concerns

None within Task 1 scope.
