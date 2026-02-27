import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApiClient } from './client';

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

describe('createApiClient authMode credentials policy', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses include credentials by default when authMode is required', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const client = createApiClient({ baseUrl: 'http://localhost:4000/api' });

    await client.get('/tickets');

    const fetchOptions = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(fetchOptions.credentials).toBe('include');
  });

  it('uses omit credentials when authMode is none', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const client = createApiClient({ baseUrl: 'http://localhost:4000/api' });

    await client.post(
      '/auth/login',
      { email: 'test@example.com', password: 'password123' },
      { authMode: 'none' },
    );

    const fetchOptions = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(fetchOptions.credentials).toBe('omit');
  });

  it('preserves explicit credentials include when authMode is none', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const client = createApiClient({ baseUrl: 'http://localhost:4000/api' });

    await client.post(
      '/auth/login',
      { email: 'test@example.com', password: 'password123' },
      { authMode: 'none', credentials: 'include' },
    );

    const fetchOptions = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(fetchOptions.credentials).toBe('include');
  });

  it('uses authMode mapping for upload requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const client = createApiClient({ baseUrl: 'http://localhost:4000/api' });
    const formData = new FormData();
    formData.append('file', new Blob(['hello'], { type: 'text/plain' }), 'a.txt');

    await client.upload('/files', formData, { authMode: 'none' });

    const fetchOptions = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(fetchOptions.credentials).toBe('omit');
  });
});

describe('createApiClient error payload parsing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses nested error envelope payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: { field: 'email' },
          },
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );
    const client = createApiClient({ baseUrl: 'http://localhost:4000/api' });

    await expect(
      client.post('/auth/login', { email: 'invalid', password: 'password123' }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: { field: 'email' },
    });
  });

  it('preserves contract auth error code from nested envelope', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'CSRF_INVALID',
            message: 'CSRF token is missing or invalid',
          },
        }),
        {
          status: 403,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );
    const client = createApiClient({ baseUrl: 'http://localhost:4000/api' });

    await expect(client.post('/auth/refresh')).rejects.toMatchObject({
      status: 403,
      code: 'CSRF_INVALID',
      message: 'CSRF token is missing or invalid',
    });
  });
});
