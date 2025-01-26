type LogLevel = "info" | "warn" | "error" | "debug";

export class Logger {
  constructor(private readonly context: string) {}

  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log("error", message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args);
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${level.toUpperCase()} [${
      this.context
    }] ${message}`;

    if (args.length) {
      console[level](formattedMessage, ...args);
    } else {
      console[level](formattedMessage);
    }
  }
}
