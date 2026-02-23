import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApiClient } from './client';

vi.mock('@/shared/utils/token', () => ({
  getStoredToken: vi.fn(() => null),
  clearStoredToken: vi.fn(),
}));

describe('createApiClient cache policy', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses no-store cache by default for GET requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createApiClient({ baseUrl: 'http://localhost:4000/api' });
    const result = await client.get<{ ok: boolean }>('/tickets/1');

    expect(result).toEqual({ ok: true });
    const fetchOptions = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(fetchOptions.method).toBe('GET');
    expect(fetchOptions.cache).toBe('no-store');
  });

  it('preserves explicit cache option on GET requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createApiClient({ baseUrl: 'http://localhost:4000/api' });
    await client.get('/tickets/1', { cache: 'reload' });

    const fetchOptions = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(fetchOptions.cache).toBe('reload');
  });

  it('does not force no-store cache on POST requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createApiClient({ baseUrl: 'http://localhost:4000/api' });
    await client.post('/tickets', { title: 'test' });

    const fetchOptions = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(fetchOptions.method).toBe('POST');
    expect(fetchOptions.cache).toBeUndefined();
  });
});
