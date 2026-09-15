# Task 1 Brief: Establish frontend baseline and contract boundary

Read this brief first. It is the exact requirement for Task 1.

Work in `C:\Users\LENOVO\Documents\ITCC\magang.worktrees\frontend`. The branch starts with README and copied docs only. Build a minimal Next.js App Router TypeScript frontend baseline and typed API boundary. Do not edit `backend/`, `supabase/`, `docs/api/openapi.yaml`, or processor files. Do not add fake production data or service-role credentials.

Requirements:

- Preserve the existing package manager if one appears; otherwise use npm scripts.
- Enable TypeScript strict mode.
- Add a test runner suitable for TypeScript/React tests, but keep dependencies minimal.
- Add a typed common API error model matching `docs/TECH-SPEC.md`:

```ts
type ApiFieldError = { field: string; message: string };
type ApiError = {
  error: {
    code: string;
    message: string;
    fields?: ApiFieldError[];
    requestId?: string;
  };
};
```

- Implement a single `request<T>(path, init?)` boundary in `lib/api-client.ts`. It must use `NEXT_PUBLIC_API_BASE_URL`, attach a bearer token only when a caller supplies one through an explicit function option, parse JSON, and throw a typed error for non-2xx responses. Never log token values.
- Add a focused failing test first for parsing the common error envelope, run it and verify the failure, then implement the minimum code and run it green.
- Add a basic app route proving the baseline builds without dead links. Keep UI minimal; tactile visual primitives belong to Task 2.
- Run lint, typecheck, test, and build. Record exact commands and results in the report.

Report path: `.superpowers/sdd/2026-09-15-frontend-design-execution/task-1-report.md`.
Return only status (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`), commit SHA(s), one-line test summary, and concerns. Do not dispatch subagents or reviewers.
