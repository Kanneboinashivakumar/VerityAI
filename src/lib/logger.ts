type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  job_id?: string;
  stage?: string;
  source_id?: string;
  provider?: string;
  duration_ms?: number;
  retry_count?: number;
  error_code?: string;
  [key: string]: unknown;
}

class StructuredLogger {
  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    });
  }

  debug(message: string, context?: LogContext) {
    if (process.env.LOG_LEVEL === "debug") {
      console.debug(this.formatLog("debug", message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatLog("info", message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatLog("warn", message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatLog("error", message, context));
  }
}

export const logger = new StructuredLogger();
