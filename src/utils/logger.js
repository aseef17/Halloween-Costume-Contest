/**
 * Logger utility for environment-aware logging
 * Only logs in development mode, silences logs in production
 */

const isDevelopment =
  import.meta.env.DEV || import.meta.env.MODE === "development";

/**
 * Logger class with methods that only output in development mode
 */
class Logger {
  /**
   * Log general information (console.log)
   */
  log(...args) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Log errors (console.error)
   * Note: Errors are logged in both dev and production for debugging
   */
  error(...args) {
    console.error(...args);
  }

  /**
   * Log warnings (console.warn)
   */
  warn(...args) {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  /**
   * Log informational messages (console.info)
   */
  info(...args) {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  /**
   * Log debug information (console.debug)
   */
  debug(...args) {
    if (isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Group logs together (console.group)
   */
  group(label) {
    if (isDevelopment) {
      console.group(label);
    }
  }

  /**
   * End a log group (console.groupEnd)
   */
  groupEnd() {
    if (isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Log a table (console.table)
   */
  table(data) {
    if (isDevelopment) {
      console.table(data);
    }
  }

  /**
   * Start a timer (console.time)
   */
  time(label) {
    if (isDevelopment) {
      console.time(label);
    }
  }

  /**
   * End a timer (console.timeEnd)
   */
  timeEnd(label) {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }

  /**
   * Check if we're in development mode
   */
  get isDev() {
    return isDevelopment;
  }
}

// Export a singleton instance
const logger = new Logger();

export default logger;
