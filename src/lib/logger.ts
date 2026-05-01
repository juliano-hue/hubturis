type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
}

function writeToConsole(level: LogLevel, message: string, meta?: any) {
  const formatted = formatMessage(level, message, meta);
  
  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.log(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug(message: string, meta?: any) {
    if (shouldLog('debug') && isDevelopment) {
      writeToConsole('debug', message, meta);
    }
  },
  info(message: string, meta?: any) {
    if (shouldLog('info')) {
      writeToConsole('info', message, meta);
    }
  },
  warn(message: string, meta?: any) {
    if (shouldLog('warn')) {
      writeToConsole('warn', message, meta);
    }
  },
  error(message: string, meta?: any) {
    if (shouldLog('error')) {
      writeToConsole('error', message, meta);
    }
  },
};