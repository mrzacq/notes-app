import { Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import { LoggingMiddleware } from './logging.middleware.js';

vi.mock('node:fs', () => ({
  appendFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

describe('LoggingMiddleware', () => {
  it('calls next()', () => {
    const middleware = new LoggingMiddleware();
    const next = vi.fn();
    const req = { method: 'GET', originalUrl: '/notes' };
    const res = { on: vi.fn(), statusCode: 200 };

    middleware.use(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('logs the request once the response finishes', () => {
    const logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const middleware = new LoggingMiddleware();
    const next = vi.fn();
    const handlers: Record<string, () => void> = {};
    const req = { method: 'GET', originalUrl: '/notes' };
    const res = {
      on: vi.fn((event: string, cb: () => void) => {
        handlers[event] = cb;
      }),
      statusCode: 200,
    };

    middleware.use(req as never, res as never, next);
    handlers.finish();

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('GET /notes 200');

    logSpy.mockRestore();
  });

  it('does not write to the error log when the response succeeds', () => {
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const middleware = new LoggingMiddleware();
    const next = vi.fn();
    const handlers: Record<string, () => void> = {};
    const req = { method: 'GET', originalUrl: '/notes' };
    const res = {
      on: vi.fn((event: string, cb: () => void) => {
        handlers[event] = cb;
      }),
      statusCode: 200,
    };

    middleware.use(req as never, res as never, next);
    handlers.finish();

    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.appendFileSync).not.toHaveBeenCalled();
  });

  it('writes to the error log when the response fails', () => {
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const middleware = new LoggingMiddleware();
    const next = vi.fn();
    const handlers: Record<string, () => void> = {};
    const req = { method: 'GET', originalUrl: '/notes/999' };
    const res = {
      on: vi.fn((event: string, cb: () => void) => {
        handlers[event] = cb;
      }),
      statusCode: 404,
    };

    middleware.use(req as never, res as never, next);
    handlers.finish();

    expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
    expect(fs.appendFileSync).toHaveBeenCalledTimes(1);
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.stringContaining('error.log'),
      expect.stringContaining('GET /notes/999 404'),
    );
  });
});
