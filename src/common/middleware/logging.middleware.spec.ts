import { Logger } from '@nestjs/common';
import { LoggingMiddleware } from './logging.middleware.js';

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
});
