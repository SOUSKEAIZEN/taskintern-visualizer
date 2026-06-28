// taskintern-visualizer/lib/logger.ts

type LogLevel = 'info' | 'warn' | 'error';

/**
 * Unified logging utility for both Client and Server components in Next.js.
 * Ensures consistent formatting and timestamping for precise error tracking.
 */
export const logger = {
  info: (message: string, data?: any) => log('info', message, data),
  warn: (message: string, data?: any) => log('warn', message, data),
  error: (message: string, data?: any) => log('error', message, data),
};

const log = (level: LogLevel, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  
  // Formats the log exactly so we can trace the timeline of events
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (data) {
    console[level](`${prefix} ${message}`, data);
  } else {
    console[level](`${prefix} ${message}`);
  }
};