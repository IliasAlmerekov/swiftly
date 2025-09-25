import LoginForm from "@/features/auth/components/LoginForm";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (): void => {
    navigate("/dashboard");
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-8 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;
