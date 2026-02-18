import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './mocks/server';
import { resetDb } from './mocks/db';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers and database after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
});

// Close MSW server after all tests
afterAll(() => {
  server.close();
});
