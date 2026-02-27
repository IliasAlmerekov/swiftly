import { beforeEach, describe, expect, it, vi } from 'vitest';

const buildUser = () => ({
  _id: 'u-1',
  email: 'user@example.com',
  name: 'User',
  role: 'user' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const getHeaderValue = (headers: HeadersInit | undefined, name: string): string | null => {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(name);
  }

  if (Array.isArray(headers)) {
    const match = headers.find(([key]) => key.toLowerCase() === name.toLowerCase());
    return match?.[1] ?? null;
  }

  const key = Object.keys(headers).find((item) => item.toLowerCase() === name.toLowerCase());
  return key ? (headers as Record<string, string>)[key] : null;
};

describe('shared/api/auth csrf flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('adds csrf header and include credentials for login', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: 'csrf-1' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ authenticated: true, user: buildUser() }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const { loginWithSession } = await import('./auth');
    await loginWithSession('user@example.com', 'password123', true);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const loginRequest = fetchSpy.mock.calls[1]?.[1] as RequestInit;
    expect(loginRequest.credentials).toBe('include');
    expect(getHeaderValue(loginRequest.headers, 'X-CSRF-Token')).toBe('csrf-1');
  });

  it('fails when csrf bootstrap response does not include token', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const { loginWithSession } = await import('./auth');

    await expect(loginWithSession('user@example.com', 'password123')).rejects.toMatchObject({
      message: 'CSRF bootstrap did not return csrfToken',
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('adds csrf header for refresh requests', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: 'csrf-refresh' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ authenticated: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const { refreshCurrentSession } = await import('./auth');
    await refreshCurrentSession();

    const refreshRequest = fetchSpy.mock.calls[1]?.[1] as RequestInit;
    expect(getHeaderValue(refreshRequest.headers, 'X-CSRF-Token')).toBe('csrf-refresh');
  });

  it('retries once after csrf refresh when api returns CSRF_INVALID', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: 'csrf-1' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
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
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: 'csrf-2' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ authenticated: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const { refreshCurrentSession } = await import('./auth');
    await refreshCurrentSession();

    expect(fetchSpy).toHaveBeenCalledTimes(4);
    const firstRefreshRequest = fetchSpy.mock.calls[1]?.[1] as RequestInit;
    const retryRefreshRequest = fetchSpy.mock.calls[3]?.[1] as RequestInit;
    expect(getHeaderValue(firstRefreshRequest.headers, 'X-CSRF-Token')).toBe('csrf-1');
    expect(getHeaderValue(retryRefreshRequest.headers, 'X-CSRF-Token')).toBe('csrf-2');
  });

  it('does not retry when api returns AUTH_FORBIDDEN', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: 'csrf-1' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: 'AUTH_FORBIDDEN',
              message: 'Access is forbidden',
            },
          }),
          {
            status: 403,
            headers: { 'content-type': 'application/json' },
          },
        ),
      );

    const { refreshCurrentSession } = await import('./auth');

    await expect(refreshCurrentSession()).rejects.toMatchObject({
      status: 403,
      code: 'AUTH_FORBIDDEN',
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
