# List every anonymous backend call the dashboard makes

| | |
|---|---|
| ID | 0033 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | api-client |
| Size | M |
| Labels | arch, phase:2, module:api-client, type:chore, size:M, core-review |
| Depends on | 0001 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

The backend plans to require a session by default and list public endpoints explicitly (its Phase 5). Ten files outside `src/api/` (not counting tests) call the backend without a session through `publicApiClient`. `apiClient` also sends no token when the visitor is signed out, so pages a signed-out visitor can open make anonymous calls too. If one of those endpoints isn't on the backend's public list when the switch happens, that page breaks ([08-auth-and-access.md](../08-auth-and-access.md#calls-without-a-session)).

## Before you start

- Issue 0001 must be merged.
- Read [Rules for the check scripts](README.md#rules-for-the-check-scripts).
- Find the calls: `grep -rn "publicApiClient" src --include=*.ts --include=*.tsx`. For `apiClient` calls made while signed out, start from the pages a signed-out visitor can open (the public routes in `src/proxy.ts`).

## What to do

1. Create `scripts/check-public-calls.ts`. It finds every `publicApiClient` call and the endpoint it uses.
2. Compare with a new `scripts/allowlists/public-calls.txt`, one line per endpoint: `<endpoint path> | <feature> | <why it needs no session>`. Exit 1 on an unlisted call, and on a listed endpoint no longer called. Follow the [Rules for the check scripts](README.md#rules-for-the-check-scripts).
3. Seed the list, with a reason for each endpoint. Add by hand the `apiClient` calls made while signed out, marked `signed-out apiClient`; the script doesn't check those.
4. Add a step to the `lint` job in `.github/workflows/ci.yml`.
5. Add `scripts/check-public-calls.test.ts` with fixtures.
6. Link the list file from "Calls without a session" in `docs/architecture/08-auth-and-access.md`; don't copy it into the page.
7. If an endpoint returns data that looks like it should need a session, leave it out of the pull request and report it privately, as the [issues README](README.md#reporting-a-vulnerability) says.

## Acceptance criteria

- [ ] Every `publicApiClient` call is listed, with a reason.
- [ ] On a throwaway branch, a new `publicApiClient` call fails the step until it is listed.
- [ ] Page 08 links the list.
- [ ] A maintainer has reviewed the list before it is shared with the backend for its Phase 5.

## How to test

```sh
bun run test scripts/check-public-calls.test.ts
bun scripts/check-public-calls.ts
```

## Out of scope

- Changing which calls need a session.

## Notes for reviewers

Two reviewers: the list decides which endpoints stay public. Check calls built from a variable endpoint are found too, or listed by hand with a note.
