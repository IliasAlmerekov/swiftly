import { registerUser } from '@/api/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '@/types';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { useAuthContext } from '@/shared/context/AuthContext';

export default function useRegister() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const { token } = await registerUser(email, password, name, role);
      if (token) {
        // Используем централизованный метод login из AuthContext
        login(token, true);
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
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

  const handleRoleChange = (value: UserRole) => {
    setRole(value);
  };

  return {
    email,
    password,
    name,
    role,
    error,
    success,
    handleSubmit,
    handleEmailChange,
    handlePasswordChange,
    handleNameChange,
    handleRoleChange,
  };
}
