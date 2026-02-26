import type { Page, Route } from '@playwright/test';

type Role = 'user' | 'support1' | 'admin';

interface MockUser {
  _id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

interface MockTicket {
  _id: string;
  owner: MockUser;
  createdBy: MockUser;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  assignedTo?: MockUser;
  comments: Array<{
    _id: string;
    content: string;
    createdAt: string;
    author: MockUser;
  }>;
  attachments?: Array<{
    _id?: string;
    name?: string;
    url: string;
    uploadedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface MockState {
  users: Record<Role, MockUser>;
  tickets: MockTicket[];
}

const NOW = '2026-02-23T10:00:00.000Z';

const json = (route: Route, status: number, body: unknown) =>
  route.fulfill({
    status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const toBase64Url = (value: string): string => Buffer.from(value, 'utf8').toString('base64url');

const createJwt = (user: MockUser): string => {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64Url(
    JSON.stringify({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }),
  );
  return `${header}.${payload}.signature`;
};

const createState = (): MockState => {
  const users: Record<Role, MockUser> = {
    user: {
      _id: 'user-100',
      email: 'lena.hoffmann@swiftly.com',
      name: 'Lena Hoffmann',
      role: 'user',
      createdAt: NOW,
      updatedAt: NOW,
    },
    support1: {
      _id: 'support-100',
      email: 'support.agent@swiftly.com',
      name: 'Support Agent',
      role: 'support1',
      createdAt: NOW,
      updatedAt: NOW,
    },
    admin: {
      _id: 'admin-100',
      email: 'ilias.almerekov@swiftly.com',
      name: 'Ilias Almerekov',
      role: 'admin',
      createdAt: NOW,
      updatedAt: NOW,
    },
  };

  const tickets: MockTicket[] = [
    {
      _id: 'ticket-100',
      owner: users.user,
      createdBy: users.user,
      title: 'VPN connection keeps timing out',
      description: 'VPN drops every 5 minutes when working from home.',
      status: 'open',
      priority: 'medium',
      category: 'network',
      assignedTo: users.support1,
      comments: [],
      attachments: [],
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  return { users, tickets };
};

const getCurrentUserFromAuthorization = (
  requestHeaders: { [key: string]: string },
  state: MockState,
): MockUser | null => {
  const authHeader = requestHeaders.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length);
  const [, payload] = token.split('.');
  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: Role;
      id?: string;
    };
    if (parsed.role && state.users[parsed.role]) {
      return state.users[parsed.role];
    }
    const byId = Object.values(state.users).find((user) => user._id === parsed.id);
    return byId ?? null;
  } catch {
    return null;
  }
};

const toTicketList = (tickets: MockTicket[]) =>
  tickets.map((ticket) => ({
    ...ticket,
  }));

export const setupMockApi = async (page: Page) => {
  const state = createState();
  let ticketCounter = 1000;
  let currentUserId: string | null = null;

  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname, searchParams } = url;

    if (!pathname.startsWith('/api/')) {
      await route.continue();
      return;
    }

    const method = request.method();
    const authorizationUser = getCurrentUserFromAuthorization(request.headers(), state);
    if (authorizationUser) {
      currentUserId = authorizationUser._id;
    }
    const currentUser =
      currentUserId != null
        ? (Object.values(state.users).find((user) => user._id === currentUserId) ?? null)
        : null;

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = (await request.postDataJSON()) as { email?: string; password?: string };
      const matchedUser = Object.values(state.users).find((user) => user.email === body.email);
      if (!matchedUser || body.password !== 'pass123') {
        return json(route, 401, { message: 'Invalid credentials' });
      }

      currentUserId = matchedUser._id;
      return json(route, 200, { token: createJwt(matchedUser) });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      currentUserId = null;
      return json(route, 200, { success: true });
    }

    if (pathname === '/api/auth/admins' && method === 'GET') {
      const admins = [state.users.support1, state.users.admin];
      return json(route, 200, {
        users: admins,
        onlineCount: admins.length,
        totalCount: admins.length,
      });
    }

    if (pathname === '/api/users/support' && method === 'GET') {
      const supportUsers = [state.users.support1, state.users.admin];
      return json(route, 200, {
        users: supportUsers,
        onlineCount: supportUsers.length,
        totalCount: supportUsers.length,
      });
    }

    if (pathname.startsWith('/api/users/status/') && method === 'PUT') {
      return json(route, 200, { success: true });
    }

    if (pathname === '/api/users/profile' && method === 'GET') {
      if (!currentUser) {
        return json(route, 401, { message: 'Unauthorized' });
      }
      return json(route, 200, currentUser);
    }

    if (pathname === '/api/users' && method === 'GET') {
      return json(route, 200, Object.values(state.users));
    }

    if (pathname.startsWith('/api/users/') && method === 'GET') {
      const targetId = pathname.split('/').at(-1);
      const user = Object.values(state.users).find((entry) => entry._id === targetId);
      if (!user) {
        return json(route, 404, { message: 'User not found' });
      }
      return json(route, 200, user);
    }

    if (pathname === '/api/tickets/user/stats' && method === 'GET') {
      return json(route, 200, {
        stats: [{ count: 3, year: 2026, monthNumber: 2, month: 'February' }],
        period: 'Last 6 months',
        userId: 1,
      });
    }

    if (pathname === '/api/tickets/stats' && method === 'GET') {
      return json(route, 200, {
        stats: [{ month: 'February', monthNumber: 2, count: state.tickets.length, year: 2026 }],
        currentMonth: 2,
        currentYear: 2026,
      });
    }

    if (pathname === '/api/ai/stats' && method === 'GET') {
      return json(route, 200, [{ date: '2026-02-23', ai_requests: 7 }]);
    }

    if (pathname === '/api/ai/chat' && method === 'POST') {
      return json(route, 200, {
        success: true,
        data: {
          response: 'Please provide additional details.',
          sessionId: 'session-1',
          suggestions: ['Restart VPN', 'Check router'],
        },
      });
    }

    if (pathname === '/api/tickets' && method === 'GET') {
      const status = searchParams.get('status');
      const statuses =
        status
          ?.split(',')
          .map((value) => value.trim())
          .filter(Boolean) ?? [];
      const filtered =
        statuses.length > 0
          ? state.tickets.filter((ticket) => statuses.includes(ticket.status))
          : state.tickets;

      return json(route, 200, {
        items: toTicketList(filtered),
        pageInfo: {
          limit: Number(searchParams.get('limit') ?? 20),
          hasNextPage: false,
          nextCursor: null,
        },
      });
    }

    if (pathname === '/api/tickets' && method === 'POST') {
      if (!currentUser) {
        return json(route, 401, { message: 'Unauthorized' });
      }
      const body = (await request.postDataJSON()) as {
        title?: string;
        description?: string;
        priority?: 'low' | 'medium' | 'high';
        category?: string;
      };
      const created: MockTicket = {
        _id: `ticket-${++ticketCounter}`,
        owner: currentUser,
        createdBy: currentUser,
        title: body.title ?? 'Untitled',
        description: body.description ?? '',
        priority: body.priority,
        status: 'open',
        category: body.category,
        comments: [],
        attachments: [],
        createdAt: NOW,
        updatedAt: NOW,
      };
      state.tickets.unshift(created);
      return json(route, 201, created);
    }

    if (pathname.match(/^\/api\/tickets\/[^/]+\/attachments$/) && method === 'POST') {
      return json(route, 200, {
        success: true,
        attachments: [
          {
            _id: 'attachment-1',
            name: 'evidence.txt',
            url: 'https://example.com/evidence.txt',
            uploadedAt: NOW,
          },
        ],
      });
    }

    if (pathname.match(/^\/api\/tickets\/[^/]+$/) && method === 'GET') {
      const ticketId = pathname.split('/').at(-1);
      const ticket = state.tickets.find((entry) => entry._id === ticketId);
      if (!ticket) {
        return json(route, 404, { message: 'Ticket not found' });
      }
      return json(route, 200, ticket);
    }

    if (pathname.match(/^\/api\/tickets\/[^/]+$/) && method === 'PUT') {
      const ticketId = pathname.split('/').at(-1);
      const ticket = state.tickets.find((entry) => entry._id === ticketId);
      if (!ticket) {
        return json(route, 404, { message: 'Ticket not found' });
      }
      const body = (await request.postDataJSON()) as Partial<MockTicket>;
      Object.assign(ticket, body, { updatedAt: NOW });
      return json(route, 200, ticket);
    }

    return json(route, 404, { message: `Unhandled mock route: ${method} ${pathname}` });
  });
};

export const loginAs = async (page: Page, credentials: { email: string; password: string }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(credentials.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard**');
};
