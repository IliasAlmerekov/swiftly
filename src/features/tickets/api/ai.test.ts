import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '@/test/mocks/server';
import { API_BASE_URL } from '@/shared/api/client';

import { sendChatMessage } from './ai';

const baseChatRequest = {
  role: 'user' as const,
  message: 'Need help with VPN',
  content: 'Need help with VPN',
  timestamp: new Date().toISOString(),
};

describe('sendChatMessage', () => {
  it('accepts backend payload with message field', async () => {
    server.use(
      http.post(`${API_BASE_URL}/ai/chat`, () =>
        HttpResponse.json(
          {
            success: true,
            data: {
              sessionId: 'session-1',
              message: 'Please restart your VPN client.',
              type: 'guidance',
              shouldCreateTicket: false,
            },
          },
          { status: 200 },
        ),
      ),
    );

    const result = await sendChatMessage(baseChatRequest);

    expect(result.data.sessionId).toBe('session-1');
    expect(result.data.message).toBe('Please restart your VPN client.');
    expect(result.data.response).toBe('Please restart your VPN client.');
  });

  it('accepts legacy payload with response field', async () => {
    server.use(
      http.post(`${API_BASE_URL}/ai/chat`, () =>
        HttpResponse.json(
          {
            success: true,
            data: {
              sessionId: 'session-2',
              response: 'Try resetting your password.',
            },
          },
          { status: 200 },
        ),
      ),
    );

    const result = await sendChatMessage(baseChatRequest);

    expect(result.data.sessionId).toBe('session-2');
    expect(result.data.response).toBe('Try resetting your password.');
    expect(result.data.message).toBe('Try resetting your password.');
  });

  it('throws BAD_RESPONSE when both message and response are missing', async () => {
    server.use(
      http.post(`${API_BASE_URL}/ai/chat`, () =>
        HttpResponse.json(
          {
            success: true,
            data: {
              sessionId: 'session-3',
            },
          },
          { status: 200 },
        ),
      ),
    );

    await expect(sendChatMessage(baseChatRequest)).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'BAD_RESPONSE',
    });
  });
});
