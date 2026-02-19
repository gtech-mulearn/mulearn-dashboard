export interface ErrorLogContext {
  componentStack?: string;
  digest?: string;
  [key: string]: unknown;
}

export interface LoggerAdapter {
  log(error: Error, context?: ErrorLogContext): void;
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
      // Minimal production logging (can be expanded later)
      console.error(error.message);
    }
  }
}

class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private adapters: LoggerAdapter[] = [];

  private constructor() {
    // Register default adapters
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
    this.adapters.forEach((adapter) => {
      adapter.log(error, context);
    });
  }
}

export const errorLogger = ErrorLoggingService.getInstance();
