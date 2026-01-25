import RegisterForm from '../components/RegisterForm';
import Aurora from '@/components/Aurora';
const RegisterPage = () => {
  return (
    <div className="bg-muted relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0">
        <Aurora colorStops={['#0ea5e9', '#f59e0b', '#22c55e']} amplitude={1.1} blend={0.7} />
      </div>
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
