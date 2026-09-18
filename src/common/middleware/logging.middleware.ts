import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LOGS_DIR = join(process.cwd(), 'logs');
const ERROR_LOG_FILE = join(LOGS_DIR, 'error.log');

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const message = `${method} ${originalUrl} ${statusCode} ${duration}ms`;

      this.logger.log(message);

      if (statusCode >= 400) {
        this.writeErrorLog(message);
      }
    });

    next();
  }

  private writeErrorLog(message: string): void {
    mkdirSync(LOGS_DIR, { recursive: true });
    appendFileSync(ERROR_LOG_FILE, `${new Date().toISOString()} ${message}\n`);
  }
}
