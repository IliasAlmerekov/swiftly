import LoginForm from '@/features/auth/components/LoginForm';
import Aurora from '@/components/Aurora';
import { useNavigate } from 'react-router-dom';

import { paths } from '@/config/paths';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (): void => {
    navigate(paths.app.dashboard.getHref());
  };

  return (
    <div className="bg-muted relative flex h-svh w-full items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <Aurora colorStops={['#0ea5e9', '#f59e0b', '#22c55e']} amplitude={1.1} blend={0.7} />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;
