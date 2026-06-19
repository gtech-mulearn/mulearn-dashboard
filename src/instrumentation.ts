import * as Sentry from "@sentry/nextjs";

// Next.js 16 + Turbopack auto-loads `sentry.server.config.ts` and
// `sentry.edge.config.ts`. Manually importing them here (the old webpack-era
// `register()` pattern) breaks Turbopack with a MODULE_UNPARSABLE error, so we
// only expose the request-error hook.
export const onRequestError = Sentry.captureRequestError;
