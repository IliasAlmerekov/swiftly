import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '@/test/mocks/server';
import type { Ticket, User } from '@/types';
import { API_BASE_URL } from '@/shared/api/client';

import { createTicket } from './index';

const baseUser: User = {
  _id: 'u1',
  email: 'user@example.com',
  name: 'User',
  role: 'user',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const buildTicket = (): Ticket => ({
  _id: 't1',
  owner: baseUser,
  title: 'Server maintenance required',
  description: 'Disk space is running low.',
  status: 'open',
  priority: 'low',
  createdBy: baseUser,
  comments: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
});

describe('createTicket', () => {
  it('returns ticket for raw API responses', async () => {
    const ticket = buildTicket();
    server.use(
      http.post(`${API_BASE_URL}/tickets`, () =>
        HttpResponse.json(ticket, { status: 201 }),
      ),
    );

    const result = await createTicket({ title: 'Title', description: 'Desc' });

    expect(result._id).toBe(ticket._id);
    expect(result.title).toBe(ticket.title);
  });

  it('unwraps ApiResponse payloads', async () => {
    const ticket = buildTicket();
    server.use(
      http.post(`${API_BASE_URL}/tickets`, () =>
        HttpResponse.json({ success: true, data: ticket }, { status: 201 }),
      ),
    );

    const result = await createTicket({ title: 'Title', description: 'Desc' });

    expect(result._id).toBe(ticket._id);
    expect(result.title).toBe(ticket.title);
  });
});
