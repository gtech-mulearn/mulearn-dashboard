# Later: edge verification and token storage

| | |
|---|---|
| Epic | later-on-demand |
| Phase / milestone | Later: on demand |
| Labels | arch, phase:later, type:epic |

## What it will contain

- **Edge verification.** When the authserver publishes public keys (backend ADR-046, phase 2, in the backend's [later epic](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/later-on-demand.md)), verify tokens in `src/proxy.ts` instead of only decoding them.
- **Token storage revisited** ([ADR-008](../../adr/ADR-008-token-storage.md)): with rotating refresh tokens and revocation in place, decide whether tokens move to cookies scripts can't read, which brings back a server-side step.
- **Revisit option 2** ([ADR-001](../../adr/ADR-001-one-app-strict-feature-modules.md)) if a second client type needs server-side data, or data must be hidden from the browser.

## Entry conditions

The backend starts phase 2 of its key separation, or a trigger in ADR-001 or ADR-008 fires.

## Exit criteria

The token-storage ADR has a successor decision, and `src/proxy.ts` verifies tokens if public keys exist.
