const IS_DEV = true;

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
  }

  info(message: string, data?: any) {
    if (IS_DEV) console.log(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage('error', message), error);
  }

  debug(message: string, data?: any) {
    if (IS_DEV) console.debug(this.formatMessage('debug', message, data));
  }
}

export const logger = new Logger();
