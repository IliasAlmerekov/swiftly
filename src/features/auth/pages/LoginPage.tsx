import LoginForm from '@/features/auth/components/LoginForm';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (): void => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-muted flex h-svh w-full items-center justify-center overflow-hidden">
      <div className="w-full max-w-md">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;
