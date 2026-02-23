import RegisterForm from '../components/RegisterForm';
import AuthBackground from '@/features/auth/components/AuthBackground';
const RegisterPage = () => {
  return (
    <div className="bg-card relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-6 md:p-10">
      <AuthBackground />
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
