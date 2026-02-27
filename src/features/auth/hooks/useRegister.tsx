import { registerUser } from '@/features/auth/api';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { paths } from '@/config/paths';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { useAuthContext } from '@/shared/context/AuthContext';

export default function useRegister() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const isSubmittingRef = useRef(false);
  const redirectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const { user, authenticated } = await registerUser(email, password, name, true);
      if (!authenticated) {
        setError('Registration failed');
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      login({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      setSuccess(true);
      redirectTimerRef.current = window.setTimeout(() => {
        navigate(paths.auth.login.getHref());
      }, 2000);
    } catch (err) {
      isSubmittingRef.current = false;
      setLoading(false);
      setError(getApiErrorMessage(err, 'Registration failed'));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return {
    email,
    password,
    name,
    error,
    success,
    loading,
    handleSubmit,
    handleEmailChange,
    handlePasswordChange,
    handleNameChange,
  };
}
