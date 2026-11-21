# ADR-005: Parse every response with zod; generated types later

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: in place: responses are parsed with zod schemas, and mismatches are logged (`logSchemaMismatch` in `src/api/errors.ts`), but only in development.

## Context

The backend's responses aren't described by a reliable contract today; its OpenAPI file is hand-kept. Parsing each response with zod at the edge of the app catches backend drift early. The backend plans a generated OpenAPI spec in CI (its Phase 8 epic).

## Options considered

- **Keep hand-written zod schemas now; generate types from OpenAPI once it exists.**
- **Generate types from today's hand-kept OpenAPI.** It is stale, so the types would be wrong.

## Decision

- Every endpoint call parses its response with a zod schema kept in the feature that owns the call.
- New optional backend fields are added to schemas as optional.
- When the backend publishes a generated OpenAPI spec, types are generated from it and the zod schemas are checked against them in CI.

## Consequences

- A backend change that breaks a schema is logged with the endpoint, not a blank screen.

## Revisit when

- The backend's generated OpenAPI is in CI and stable.

## Related ADRs

- [ADR-006: One API client and one error model](ADR-006-one-api-client-and-error-model.md)
