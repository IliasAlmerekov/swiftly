import { http, HttpResponse } from 'msw';
import { db, createMockUser } from '../db';

const API_URL = '/api';

export const authHandlers = [
  // POST /api/auth/login
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    const user = db.users.find((u) => u.email === body.email);

    if (!user || body.password !== 'password123') {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    db.currentUser = user;

    return HttpResponse.json({
      user,
      token: 'mock-jwt-token',
    });
  }),

  // POST /api/auth/register
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; name: string };

    const existingUser = db.users.find((u) => u.email === body.email);

    if (existingUser) {
      return HttpResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const newUser = createMockUser({
      email: body.email,
      name: body.name,
    });

    db.users.push(newUser);
    db.currentUser = newUser;

    return HttpResponse.json({
      user: newUser,
      token: 'mock-jwt-token',
    });
  }),

  // GET /api/auth/me
  http.get(`${API_URL}/auth/me`, () => {
    if (!db.currentUser) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json(db.currentUser);
  }),

  // POST /api/auth/logout
  http.post(`${API_URL}/auth/logout`, () => {
    db.currentUser = null;
    return HttpResponse.json({ message: 'Logged out' });
  }),
];
