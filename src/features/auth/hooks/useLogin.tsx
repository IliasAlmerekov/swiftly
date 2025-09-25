import { useState, type ChangeEvent, type FormEvent } from 'react';
import { loginUser } from '@/api/api';

interface UseLoginProps {
  onLoginSuccess: () => void;
}

interface LoginResponse {
  token: string;
}

export function useLogin({ onLoginSuccess }: UseLoginProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [keepLoggedIn, setKeepLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = (await loginUser(email, password)) as LoginResponse;

      if (keepLoggedIn) {
        localStorage.setItem('token', token);
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
      }

      onLoginSuccess();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleKeepLoggedInChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setKeepLoggedIn(e.target.checked);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    keepLoggedIn,
    loading,
    handleSubmit,
    handleKeepLoggedInChange,
  };
}
