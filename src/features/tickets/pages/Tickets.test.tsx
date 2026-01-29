import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/shared/api/client';
import { server } from '@/test/mocks/server';
import { render, screen } from '@/test/test-utils';
import { useAuth } from '@/shared/hooks/useAuth';

import { Tickets } from './Tickets';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const emptyList = {
  items: [],
  pageInfo: { limit: 20, hasNextPage: false, nextCursor: null },
};

beforeEach(() => {
  server.use(
    http.get(`${API_BASE_URL}/tickets`, () => HttpResponse.json(emptyList)),
  );
});

describe('Tickets', () => {
  it('shows status dropdown for admin', async () => {
    mockedUseAuth.mockReturnValue({
      userId: null,
      role: 'admin',
      email: null,
      userName: null,
      isLoading: false,
      isAuthenticated: true,
    });

    render(<Tickets />);

    expect(await screen.findByLabelText('Ticket filter')).toBeInTheDocument();
  });
});
