import LoginForm from '@/features/auth/components/LoginForm';
import AuthBackground from '@/features/auth/components/AuthBackground';
import { useNavigate } from 'react-router-dom';

import { paths } from '@/config/paths';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (): void => {
    navigate(paths.app.dashboard.getHref());
  };

  return (
    <div className="bg-card relative flex h-svh w-full items-center justify-center overflow-hidden">
      <AuthBackground />
      <div className="relative z-10 w-full max-w-md">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;
