import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCurrentSession, logoutCurrentSession } from '@/shared/api/auth';

import { AuthProvider, useAuthContext } from './AuthContext';

vi.mock('@/shared/api/auth', () => ({
  getCurrentSession: vi.fn(),
  logoutCurrentSession: vi.fn(),
}));

const mockedGetCurrentSession = vi.mocked(getCurrentSession);
const mockedLogoutCurrentSession = vi.mocked(logoutCurrentSession);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLogoutCurrentSession.mockResolvedValue({
      success: true,
      message: 'Logged out',
    });
  });

  it('loads authenticated user from server session on mount', async () => {
    mockedGetCurrentSession.mockResolvedValueOnce({
      authenticated: true,
      user: {
        _id: 'u1',
        email: 'user@example.com',
        name: 'User',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    });

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({
      id: 'u1',
      email: 'user@example.com',
      name: 'User',
      role: 'admin',
    });
  });

  it('stays unauthenticated when server session is absent', async () => {
    mockedGetCurrentSession.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('updates user state on login using provided user payload', async () => {
    mockedGetCurrentSession.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.login({
        id: 'u2',
        email: 'new@example.com',
        name: 'New User',
        role: 'support1',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({
      id: 'u2',
      email: 'new@example.com',
      name: 'New User',
      role: 'support1',
    });
  });

  it('calls logout API before clearing local auth state', async () => {
    mockedGetCurrentSession.mockResolvedValueOnce({
      authenticated: true,
      user: {
        _id: 'u1',
        email: 'user@example.com',
        name: 'User',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    });

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockedLogoutCurrentSession).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
