export interface ErrorLogContext {
  componentStack?: string;
  digest?: string;
  [key: string]: unknown;
}

export interface LoggerAdapter {
  log(error: Error, context?: ErrorLogContext): void;
}

const PII_KEYS = new Set([
  "email",
  "password",
  "phone",
  "address",
  "ssn",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "secret",
  "creditCard",
  "cardNumber",
]);

function scrubPII(context: ErrorLogContext): ErrorLogContext {
  const cleaned: ErrorLogContext = {};
  for (const [key, value] of Object.entries(context)) {
    if (PII_KEYS.has(key.toLowerCase()) || PII_KEYS.has(key)) {
      cleaned[key] = "[REDACTED]";
    } else if (typeof value === "string" && /\S+@\S+\.\S+/.test(value)) {
      cleaned[key] = "[REDACTED_EMAIL]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      cleaned[key] = scrubPII(value as ErrorLogContext);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

class ConsoleLogger implements LoggerAdapter {
  log(error: Error, context?: ErrorLogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary Caught Error");
      console.error(error);
      if (context) {
        console.table(context);
      }
      console.groupEnd();
    } else {
      console.error(
        `[ErrorBoundary] ${error.name}: ${error.message}`,
        context?.digest ? `(digest: ${context.digest})` : "",
      );
    }
  }
}

class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private adapters: LoggerAdapter[] = [];

  private constructor() {
    this.registerAdapter(new ConsoleLogger());
  }

  public static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  public registerAdapter(adapter: LoggerAdapter): void {
    this.adapters.push(adapter);
  }

  public logError(error: Error, context?: ErrorLogContext): void {
    const safeContext = context ? scrubPII(context) : context;
    this.adapters.forEach((adapter) => {
      adapter.log(error, safeContext);
    });
  }
}

export const errorLogger = ErrorLoggingService.getInstance();
