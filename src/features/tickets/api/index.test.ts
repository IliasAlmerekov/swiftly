import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '@/test/mocks/server';
import type { Ticket, User } from '@/types';
import { API_BASE_URL } from '@/shared/api/client';

import { createTicket, getTicketById, getTickets } from './index';

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
      http.post(`${API_BASE_URL}/tickets`, () => HttpResponse.json(ticket, { status: 201 })),
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

  it('throws BAD_RESPONSE for malformed payload', async () => {
    server.use(
      http.post(`${API_BASE_URL}/tickets`, () =>
        HttpResponse.json(
          { success: true, data: { title: 'Missing required fields' } },
          { status: 201 },
        ),
      ),
    );

    await expect(createTicket({ title: 'Title', description: 'Desc' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'BAD_RESPONSE',
    });
  });

  it('maps timeout errors to status 408 and TIMEOUT code', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new DOMException('The operation was aborted.', 'AbortError'));

    try {
      await expect(createTicket({ title: 'Title', description: 'Desc' })).rejects.toMatchObject({
        name: 'ApiError',
        status: 408,
        code: 'TIMEOUT',
      });
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('preserves unauthorized responses as UNAUTHORIZED errors', async () => {
    server.use(
      http.post(`${API_BASE_URL}/tickets`, () =>
        HttpResponse.json({ message: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 }),
      ),
    );

    await expect(createTicket({ title: 'Title', description: 'Desc' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });
});

describe('getTickets pagination normalization', () => {
  it('normalizes missing pagination fields to items/pageInfo contract', async () => {
    server.use(
      http.get(`${API_BASE_URL}/tickets`, () =>
        HttpResponse.json({ items: [buildTicket()] }, { status: 200 }),
      ),
    );

    const result = await getTickets({ limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.pageInfo).toEqual({
      limit: 10,
      hasNextPage: false,
      nextCursor: null,
    });
  });

  it('accepts partial list items and applies safe defaults', async () => {
    server.use(
      http.get(`${API_BASE_URL}/tickets`, () =>
        HttpResponse.json(
          {
            items: [{ _id: 't-partial', title: 'List ticket', status: 'open' }],
          },
          { status: 200 },
        ),
      ),
    );

    const result = await getTickets({ limit: 15 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      _id: 't-partial',
      title: 'List ticket',
      status: 'open',
      description: '',
      comments: [],
      owner: {
        _id: 'unknown-user',
      },
      createdBy: {
        _id: 'unknown-user',
      },
    });
    expect(result.items[0].createdAt).toBe('1970-01-01T00:00:00.000Z');
    expect(result.items[0].updatedAt).toBe('1970-01-01T00:00:00.000Z');
    expect(result.pageInfo).toEqual({
      limit: 15,
      hasNextPage: false,
      nextCursor: null,
    });
  });

  it('throws BAD_RESPONSE when ticket list items are malformed', async () => {
    server.use(
      http.get(`${API_BASE_URL}/tickets`, () =>
        HttpResponse.json({
          items: [{ _id: 'broken-ticket' }],
          pageInfo: { limit: 20, hasNextPage: false, nextCursor: null },
        }),
      ),
    );

    await expect(getTickets()).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'BAD_RESPONSE',
    });
  });
});

describe('getTicketById', () => {
  it('returns ticket for raw API responses', async () => {
    const ticket = buildTicket();
    server.use(http.get(`${API_BASE_URL}/tickets/${ticket._id}`, () => HttpResponse.json(ticket)));

    const result = await getTicketById(ticket._id);

    expect(result._id).toBe(ticket._id);
    expect(result.title).toBe(ticket.title);
  });

  it('unwraps ApiResponse payloads', async () => {
    const ticket = buildTicket();
    server.use(
      http.get(`${API_BASE_URL}/tickets/${ticket._id}`, () =>
        HttpResponse.json({ success: true, data: ticket }),
      ),
    );

    const result = await getTicketById(ticket._id);

    expect(result._id).toBe(ticket._id);
    expect(result.description).toBe(ticket.description);
  });

  it('unwraps nested ApiResponse payloads with data.ticket', async () => {
    const ticket = buildTicket();
    server.use(
      http.get(`${API_BASE_URL}/tickets/${ticket._id}`, () =>
        HttpResponse.json({ success: true, data: { ticket } }),
      ),
    );

    const result = await getTicketById(ticket._id);

    expect(result._id).toBe(ticket._id);
    expect(result.title).toBe(ticket.title);
  });

  it('accepts partial nested ticket payload and applies defaults', async () => {
    server.use(
      http.get(`${API_BASE_URL}/tickets/t-partial-detail`, () =>
        HttpResponse.json({
          success: true,
          data: {
            ticket: {
              _id: 't-partial-detail',
              title: 'Partial detail ticket',
              status: 'open',
              owner: null,
              createdBy: null,
            },
          },
        }),
      ),
    );

    const result = await getTicketById('t-partial-detail');

    expect(result).toMatchObject({
      _id: 't-partial-detail',
      title: 'Partial detail ticket',
      status: 'open',
      description: '',
      comments: [],
      owner: { _id: 'unknown-user' },
      createdBy: { _id: 'unknown-user' },
    });
  });

  it('keeps owner identity when backend omits owner role field', async () => {
    server.use(
      http.get(`${API_BASE_URL}/tickets/t-owner-no-role`, () =>
        HttpResponse.json({
          _id: 't-owner-no-role',
          title: 'Ticket with owner',
          description: 'Owner should be visible',
          status: 'open',
          owner: {
            _id: 'u-owner-1',
            name: 'Ilias Almerekov',
            email: 'ilias@example.com',
            avatar: null,
          },
          createdBy: {
            _id: 'u-owner-1',
            name: 'Ilias Almerekov',
            email: 'ilias@example.com',
            avatar: null,
          },
          comments: [],
          createdAt: '2026-02-23T08:00:00.000Z',
          updatedAt: '2026-02-23T08:00:00.000Z',
        }),
      ),
    );

    const result = await getTicketById('t-owner-no-role');

    expect(result.owner).toMatchObject({
      _id: 'u-owner-1',
      name: 'Ilias Almerekov',
      email: 'ilias@example.com',
      role: 'user',
    });
  });

  it('throws BAD_RESPONSE for malformed payload', async () => {
    server.use(
      http.get(`${API_BASE_URL}/tickets/t-broken`, () =>
        HttpResponse.json({ success: true, data: { _id: 't-broken' } }),
      ),
    );

    await expect(getTicketById('t-broken')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'BAD_RESPONSE',
    });
  });

  it('preserves unauthorized responses as UNAUTHORIZED errors', async () => {
    server.use(
      http.get(`${API_BASE_URL}/tickets/t401`, () =>
        HttpResponse.json({ message: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 }),
      ),
    );

    await expect(getTicketById('t401')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });
});
