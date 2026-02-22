import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { useAuthContext } from '@/shared/context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

vi.mock('@/shared/context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

const mockedUseAuthContext = vi.mocked(useAuthContext);

describe('ProtectedRoute security', () => {
  beforeEach(() => {
    mockedUseAuthContext.mockReset();
  });

  it('redirects unauthenticated users to login', () => {
    mockedUseAuthContext.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute access="route.dashboard">
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('blocks forbidden access when matrix denies route permission', () => {
    mockedUseAuthContext.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: 'user',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/users/user-2']}>
        <Routes>
          <Route
            path="/users/:userId"
            element={
              <ProtectedRoute access="route.userById">
                <div>User Profile Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('User Profile Content')).not.toBeInTheDocument();
  });

  it('allows own profile access for user role via PBAC condition', () => {
    mockedUseAuthContext.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: 'user',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/users/user-1']}>
        <Routes>
          <Route
            path="/users/:userId"
            element={
              <ProtectedRoute access="route.userById">
                <div>User Profile Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('User Profile Content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });
});
