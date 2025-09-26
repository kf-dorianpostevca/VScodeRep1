/**
 * Winston-based logging utility
 * Provides structured logging with different levels and formats
 */

import winston from 'winston';

/**
 * Log levels for the application
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Creates a configured winston logger instance
 * @param component - Component name for log context
 * @param level - Minimum log level to output
 * @returns Configured winston logger
 */
export function createLogger(component: string, level: LogLevel = 'info'): winston.Logger {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  // Don't log anything in test environment unless explicitly enabled
  if (isTest && !process.env.ENABLE_TEST_LOGS) {
    return winston.createLogger({
      silent: true,
    });
  }

  const logger = winston.createLogger({
    level,
    defaultMeta: { component },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      // Always log errors to file
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Log all messages to combined file
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 10,
      }),
    ],
  });

  // Add console logging in development
  if (isDevelopment) {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ level, message, component, timestamp, ...meta }) => {
            const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${component}] ${level}: ${message}${metaString}`;
          })
        ),
      })
    );
  }

  return logger;
}

/**
 * Default application logger
 */
export const logger = createLogger('app');

/**
 * Database-specific logger
 */
export const dbLogger = createLogger('database');