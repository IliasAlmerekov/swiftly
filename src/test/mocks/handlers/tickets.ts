import { http, HttpResponse } from 'msw';
import { db, createMockTicket } from '../db';

const API_URL = '/api';

export const ticketHandlers = [
  // GET /api/tickets/user - Get user's tickets
  http.get(`${API_URL}/tickets/user`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit')) || 50;
    const cursor = Number(url.searchParams.get('cursor') ?? 0);
    const offset = Number.isNaN(cursor) ? 0 : cursor;

    const tickets = [...db.tickets].sort((a, b) => {
      const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b._id.localeCompare(a._id);
    });

    const paginatedTickets = tickets.slice(offset, offset + limit);
    const hasNextPage = offset + limit < tickets.length;

    return HttpResponse.json({
      items: paginatedTickets,
      pageInfo: {
        limit,
        hasNextPage,
        nextCursor: hasNextPage ? String(offset + limit) : null,
      },
    });
  }),

  // GET /api/tickets - Get all tickets (admin)
  http.get(`${API_URL}/tickets`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit')) || 50;
    const cursor = Number(url.searchParams.get('cursor') ?? 0);
    const offset = Number.isNaN(cursor) ? 0 : cursor;
    const status = url.searchParams.get('status');

    let tickets = [...db.tickets];

    if (status) {
      tickets = tickets.filter((t) => t.status === status);
    }

    tickets.sort((a, b) => {
      const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b._id.localeCompare(a._id);
    });
    const paginatedTickets = tickets.slice(offset, offset + limit);
    const hasNextPage = offset + limit < tickets.length;

    return HttpResponse.json({
      items: paginatedTickets,
      pageInfo: {
        limit,
        hasNextPage,
        nextCursor: hasNextPage ? String(offset + limit) : null,
      },
    });
  }),

  // GET /api/tickets/:id - Get single ticket
  http.get(`${API_URL}/tickets/:id`, ({ params }) => {
    const ticket = db.tickets.find((t) => t._id === params.id);

    if (!ticket) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    return HttpResponse.json(ticket);
  }),

  // POST /api/tickets - Create ticket
  http.post(`${API_URL}/tickets`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    const newTicket = createMockTicket({
      title: body.title as string,
      description: body.description as string,
      priority: body.priority as 'low' | 'medium' | 'high',
      category: body.category as string,
    });

    db.tickets.push(newTicket);

    return HttpResponse.json(newTicket, { status: 201 });
  }),

  // PATCH /api/tickets/:id - Update ticket
  http.patch(`${API_URL}/tickets/:id`, async ({ params, request }) => {
    const ticketIndex = db.tickets.findIndex((t) => t._id === params.id);

    if (ticketIndex === -1) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    db.tickets[ticketIndex] = {
      ...db.tickets[ticketIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(db.tickets[ticketIndex]);
  }),

  // DELETE /api/tickets/:id - Delete ticket
  http.delete(`${API_URL}/tickets/:id`, ({ params }) => {
    const ticketIndex = db.tickets.findIndex((t) => t._id === params.id);

    if (ticketIndex === -1) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    db.tickets.splice(ticketIndex, 1);

    return HttpResponse.json({ message: 'Ticket deleted' });
  }),

  // GET /api/tickets/stats - Get ticket stats
  http.get(`${API_URL}/tickets/stats`, () => {
    const now = new Date();
    return HttpResponse.json({
      stats: [
        { month: 'January', monthNumber: 1, count: 5, year: now.getFullYear() },
        { month: 'February', monthNumber: 2, count: 8, year: now.getFullYear() },
      ],
      currentMonth: now.getMonth() + 1,
      currentYear: now.getFullYear(),
    });
  }),
];
