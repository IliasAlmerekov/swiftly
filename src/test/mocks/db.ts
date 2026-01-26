import type { Ticket, User, UserRole } from '@/types';

// ============ Mock Data Factories ============

let ticketIdCounter = 1;
let userIdCounter = 1;

const createMockUserBase = (overrides?: Partial<User>): User => {
  const id = `user_${userIdCounter++}`;
  return {
    _id: id,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as UserRole,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

export const createMockUser = (overrides?: Partial<User>): User => createMockUserBase(overrides);

export const createMockTicket = (overrides?: Partial<Ticket>): Ticket => {
  const id = `ticket_${ticketIdCounter++}`;
  const owner = createMockUserBase();
  return {
    _id: id,
    title: `Test Ticket ${ticketIdCounter}`,
    description: `Description for test ticket ${ticketIdCounter}`,
    status: 'open',
    priority: 'medium',
    category: 'general',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner,
    createdBy: owner,
    comments: [],
    ...overrides,
  };
};

// ============ Mock Database ============

interface MockDatabase {
  tickets: Ticket[];
  users: User[];
  currentUser: User | null;
}

export const db: MockDatabase = {
  tickets: [],
  users: [createMockUser()],
  currentUser: null,
};

// Reset database between tests
export const resetDb = () => {
  ticketIdCounter = 1;
  userIdCounter = 1;
  db.tickets = [];
  db.users = [createMockUser()];
  db.currentUser = null;
};

// Seed database with data
export const seedDb = (data: Partial<MockDatabase>) => {
  if (data.tickets) db.tickets = data.tickets;
  if (data.users) db.users = data.users;
  if (data.currentUser) db.currentUser = data.currentUser;
};
