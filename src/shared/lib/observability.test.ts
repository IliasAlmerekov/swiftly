import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/types';

import { reportError } from './observability';

describe('reportError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as { __APP_ERROR_REPORTER__?: unknown }).__APP_ERROR_REPORTER__;
  });

  it('uses global reporter when available', () => {
    const reporter = vi.fn();
    (globalThis as { __APP_ERROR_REPORTER__?: unknown }).__APP_ERROR_REPORTER__ = reporter;

    reportError('api-client', new ApiError('failed', 500), 'GET /tickets');

    expect(reporter).toHaveBeenCalledTimes(1);
    expect(reporter.mock.calls[0]?.[0]).toMatchObject({
      source: 'api-client',
      context: 'GET /tickets',
      message: 'failed',
      status: 500,
    });
  });

  it('falls back to console.error when reporter is absent', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    reportError('react-query', new Error('query failed'), 'query');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0]?.[0]).toBe('[observability]');
  });
});
