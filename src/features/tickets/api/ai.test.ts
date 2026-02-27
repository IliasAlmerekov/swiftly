import { beforeEach, describe, expect, it, vi } from 'vitest';

const baseChatRequest = {
  role: 'user' as const,
  message: 'Need help with VPN',
  content: 'Need help with VPN',
  timestamp: new Date().toISOString(),
};

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

describe('sendChatMessage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('accepts backend payload with message field', async () => {
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
            success: true,
            data: {
              sessionId: 'session-1',
              message: 'Please restart your VPN client.',
              type: 'guidance',
              shouldCreateTicket: false,
            },
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      );

    const { sendChatMessage } = await import('./ai');
    const result = await sendChatMessage(baseChatRequest);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const chatRequest = fetchSpy.mock.calls[1]?.[1] as RequestInit;
    expect(chatRequest.credentials).toBe('include');
    expect(getHeaderValue(chatRequest.headers, 'X-CSRF-Token')).toBe('csrf-1');
    expect(result.data.sessionId).toBe('session-1');
    expect(result.data.message).toBe('Please restart your VPN client.');
    expect(result.data.response).toBe('Please restart your VPN client.');
  });

  it('accepts legacy payload with response field', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: 'csrf-legacy' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              sessionId: 'session-2',
              response: 'Try resetting your password.',
            },
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      );

    const { sendChatMessage } = await import('./ai');
    const result = await sendChatMessage(baseChatRequest);

    expect(result.data.sessionId).toBe('session-2');
    expect(result.data.response).toBe('Try resetting your password.');
    expect(result.data.message).toBe('Try resetting your password.');
  });

  it('throws BAD_RESPONSE when both message and response are missing', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: 'csrf-bad-response' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              sessionId: 'session-3',
            },
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      );

    const { sendChatMessage } = await import('./ai');
    await expect(sendChatMessage(baseChatRequest)).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'BAD_RESPONSE',
    });
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
        new Response(
          JSON.stringify({
            success: true,
            data: {
              sessionId: 'session-retry',
              message: 'Retry succeeded',
            },
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      );

    const { sendChatMessage } = await import('./ai');
    const result = await sendChatMessage(baseChatRequest);

    expect(fetchSpy).toHaveBeenCalledTimes(4);
    const firstChatRequest = fetchSpy.mock.calls[1]?.[1] as RequestInit;
    const retryChatRequest = fetchSpy.mock.calls[3]?.[1] as RequestInit;
    expect(getHeaderValue(firstChatRequest.headers, 'X-CSRF-Token')).toBe('csrf-1');
    expect(getHeaderValue(retryChatRequest.headers, 'X-CSRF-Token')).toBe('csrf-2');
    expect(result.data.sessionId).toBe('session-retry');
    expect(result.data.message).toBe('Retry succeeded');
  });
});
