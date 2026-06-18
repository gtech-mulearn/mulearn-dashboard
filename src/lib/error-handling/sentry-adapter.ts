import * as Sentry from "@sentry/nextjs";
import type { ErrorLogContext, LoggerAdapter } from "./error-logging.service";

export class SentryAdapter implements LoggerAdapter {
  log(error: Error, context?: ErrorLogContext): void {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}
