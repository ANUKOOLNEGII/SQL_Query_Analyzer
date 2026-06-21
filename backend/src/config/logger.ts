import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { env } from './env';

const logsDir = path.join(__dirname, '../logs');
try {
  fs.mkdirSync(logsDir, { recursive: true });
  fs.accessSync(logsDir, fs.constants.W_OK);
} catch (error) {
  console.warn(`Unable to create or access logs directory at ${logsDir}:`, error);
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `[${timestamp}] ${level}: ${message}${stack ? `\n${stack}` : ''}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
    }),
  ],
});
