import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '@/test/mocks/server';
import { db, createMockTicket, seedDb } from '@/test/mocks/db';

describe('MSW Integration', () => {
  describe('Ticket Handlers', () => {
    it('returns empty array when no tickets exist', async () => {
      const response = await fetch('/api/tickets/user');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual([]);
    });

    it('returns seeded tickets', async () => {
      const mockTickets = [
        createMockTicket({ title: 'Test 1' }),
        createMockTicket({ title: 'Test 2' }),
      ];

      seedDb({ tickets: mockTickets });

      const response = await fetch('/api/tickets/user');
      const data = await response.json();

      expect(data).toHaveLength(2);
      expect(data[0].title).toBe('Test 1');
      expect(data[1].title).toBe('Test 2');
    });

    it('creates a new ticket', async () => {
      const newTicket = {
        title: 'New Ticket',
        description: 'Test description',
        priority: 'high',
        category: 'bug',
      };

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('New Ticket');
      expect(data.priority).toBe('high');
      expect(db.tickets).toHaveLength(1);
    });

    it('returns 404 for non-existent ticket', async () => {
      const response = await fetch('/api/tickets/999');

      expect(response.status).toBe(404);
    });
  });

  describe('Auth Handlers', () => {
    it('logs in with valid credentials', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.user.email).toBe('test@example.com');
      expect(data.token).toBe('mock-jwt-token');
    });

    it('rejects invalid credentials', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Handler Overrides', () => {
    it('can override handlers for specific tests', async () => {
      // Override the default handler for this test only
      server.use(
        http.get('/api/tickets/user', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        }),
      );

      const response = await fetch('/api/tickets/user');

      expect(response.status).toBe(500);
    });
  });
});
