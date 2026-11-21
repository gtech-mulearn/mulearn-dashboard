# Phase 7: people and privacy

| | |
|---|---|
| Epic | phase-7-people-and-privacy |
| Phase / milestone | Phase 7: People and privacy |
| Labels | arch, phase:7, type:epic |

## What it will contain

Follows the backend's Phase 7 epic ([backend Phase 7](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/phase-7-people-and-privacy.md)), which is flagged for legal advice:

- **Consent at sign-up:** show the notice and record the user's choice, with the fields the backend adds. These are new fields the dashboard sends, so each goes behind a flag ([ADR-011](../../adr/ADR-011-flags-for-new-sends.md)).
- **An age gate** on sign-up, as counsel confirms.
- **Rights workflows:** request an export, correct personal data, request erasure, and show their status.
- **Account deletion** follows the backend's move from deleting to anonymising.

## Entry conditions

- Counsel has reviewed the design.
- The backend's sign-up accepts the new optional fields.

## Exit criteria

- Every new sign-up passes the consent and age steps.
- Rights requests can be made from the dashboard.
