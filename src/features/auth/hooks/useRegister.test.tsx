import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, FormEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { registerUser } from '@/features/auth/api';
import { useAuthContext } from '@/shared/context/AuthContext';
import type { AuthSession } from '@/types';

import useRegister from './useRegister';

vi.mock('@/features/auth/api', () => ({
  registerUser: vi.fn(),
}));

vi.mock('@/shared/context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

const mockedRegisterUser = vi.mocked(registerUser);
const mockedUseAuthContext = vi.mocked(useAuthContext);

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

describe('useRegister', () => {
  const loginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuthContext.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: loginMock,
      logout: vi.fn(),
      getToken: vi.fn(),
    });
  });

  it('resets loading and exposes error message on failed submit', async () => {
    mockedRegisterUser.mockRejectedValueOnce(new Error('Registration failed'));
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleEmailChange({
        target: { value: 'user@example.com' },
      } as ChangeEvent<HTMLInputElement>);
      result.current.handlePasswordChange({
        target: { value: 'password123' },
      } as ChangeEvent<HTMLInputElement>);
      result.current.handleNameChange({
        target: { value: 'User Name' },
      } as ChangeEvent<HTMLInputElement>);
    });

    const event = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Registration failed');
    expect(loginMock).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('ignores duplicate submits while request is already in flight', async () => {
    const deferred = createDeferred<AuthSession>();
    mockedRegisterUser.mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleEmailChange({
        target: { value: 'user@example.com' },
      } as ChangeEvent<HTMLInputElement>);
      result.current.handlePasswordChange({
        target: { value: 'password123' },
      } as ChangeEvent<HTMLInputElement>);
      result.current.handleNameChange({
        target: { value: 'User Name' },
      } as ChangeEvent<HTMLInputElement>);
    });

    const firstEvent = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;
    const secondEvent = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;

    act(() => {
      void result.current.handleSubmit(firstEvent);
      void result.current.handleSubmit(secondEvent);
    });

    expect(result.current.loading).toBe(true);
    expect(mockedRegisterUser).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.reject(new Error('Abort pending request'));
      try {
        await deferred.promise;
      } catch {
        // expected rejection for cleanup
      }
    });

    expect(result.current.loading).toBe(false);
  });
});
