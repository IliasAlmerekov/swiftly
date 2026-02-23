import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';

import { canAccess } from '@/shared/security/access-matrix';
import { server } from '@/test/mocks/server';
import { createMockTicket, createMockUser, db, seedDb } from '@/test/mocks/db';

describe('Critical flow integration', () => {
  describe('auth flow', () => {
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

  describe('create ticket flow', () => {
    it('creates ticket and returns persisted data', async () => {
      const payload = {
        title: 'New Ticket',
        description: 'Test description',
        priority: 'high',
        category: 'bug',
      };

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toMatchObject(payload);
      expect(db.tickets).toHaveLength(1);
    });
  });

  describe('status change flow', () => {
    it('updates ticket status via API', async () => {
      const ticket = createMockTicket({ status: 'open' });
      seedDb({ tickets: [ticket] });

      const response = await fetch(`/api/tickets/${ticket._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
      const updated = await response.json();

      expect(response.ok).toBe(true);
      expect(updated.status).toBe('resolved');
      expect(db.tickets[0]?.status).toBe('resolved');
    });
  });

  describe('role access flow', () => {
    it('allows user to access only own profile route', () => {
      expect(
        canAccess('route.userById', 'user', {
          actorUserId: 'user-1',
          targetUserId: 'user-1',
        }),
      ).toBe(true);
      expect(
        canAccess('route.userById', 'user', {
          actorUserId: 'user-1',
          targetUserId: 'user-2',
        }),
      ).toBe(false);
    });

    it('allows support and admin to access restricted routes', () => {
      expect(canAccess('component.dashboard.analyticsTab', 'support1')).toBe(true);
      expect(canAccess('component.dashboard.adminTab', 'admin')).toBe(true);
      expect(canAccess('component.dashboard.adminTab', 'support1')).toBe(false);
    });
  });

  describe('ticket handlers compatibility', () => {
    it('returns empty array when no tickets exist', async () => {
      const response = await fetch('/api/tickets?scope=mine');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.items).toEqual([]);
      expect(data.pageInfo).toMatchObject({
        hasNextPage: false,
      });
    });

    it('returns seeded tickets', async () => {
      const mockTickets = [
        createMockTicket({ title: 'Test 1' }),
        createMockTicket({ title: 'Test 2' }),
      ];

      seedDb({ tickets: mockTickets });

      const response = await fetch('/api/tickets?scope=mine');
      const data = await response.json();

      expect(data.items).toHaveLength(2);
      expect(data.items.map((ticket: { title: string }) => ticket.title)).toEqual(
        expect.arrayContaining(['Test 1', 'Test 2']),
      );
    });

    it('returns 404 for non-existent ticket', async () => {
      const response = await fetch('/api/tickets/999');

      expect(response.status).toBe(404);
    });
  });

  describe('Handler Overrides', () => {
    it('can override handlers for specific tests', async () => {
      // Override the default handler for this test only
      server.use(
        http.get('/api/tickets', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        }),
      );

      const response = await fetch('/api/tickets?scope=mine');

      expect(response.status).toBe(500);
    });
  });

  describe('auth/register side effect compatibility', () => {
    it('registers new user into in-memory DB', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'new.user@example.com',
          password: 'password123',
          name: 'New User',
        }),
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.user.email).toBe('new.user@example.com');
      expect(
        db.users.some((user) => user.email === 'new.user@example.com' && user.name === 'New User'),
      ).toBe(true);
    });

    it('supports seeded currentUser for /auth/me', async () => {
      const seededUser = createMockUser({
        _id: 'u-auth-me',
        email: 'me@example.com',
        name: 'Me',
      });
      seedDb({ currentUser: seededUser });

      const response = await fetch('/api/auth/me');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data._id).toBe('u-auth-me');
      expect(data.email).toBe('me@example.com');
    });
  });
});
