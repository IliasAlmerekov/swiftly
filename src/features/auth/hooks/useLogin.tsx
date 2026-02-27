import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { loginUser } from '@/features/auth/api';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { useAuthContext } from '@/shared/context/AuthContext';

interface UseLoginProps {
  onLoginSuccess: () => void;
}

export function useLogin({ onLoginSuccess }: UseLoginProps) {
  const { login } = useAuthContext();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [keepLoggedIn, setKeepLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setError(null);
    setLoading(true);

    try {
      const { user } = await loginUser(email, password, keepLoggedIn);

      login({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      onLoginSuccess();
    } catch (error: unknown) {
      isSubmittingRef.current = false;
      setError(getApiErrorMessage(error, 'Invalid email or password'));
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
