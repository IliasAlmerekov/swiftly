import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import LogoWhite from "../../../assets/logos.png";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useLogin } from "../hooks/useLogin";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: React.ComponentProps<"div"> & LoginFormProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    keepLoggedIn,
    loading,
    handleSubmit,
    handleKeepLoggedInChange,
  } = useLogin({ onLoginSuccess });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form id="login-form" className="p-8 md:p-12" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your account to continue
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-md">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name.surname@scooteq.com"
                  required
                  autoComplete="username"
                  value={email}
                  className="h-10"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-md">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  autoComplete="current-password"
                  value={password}
                  className="h-10"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <Input
                  type="checkbox"
                  id="checkbox"
                  checked={keepLoggedIn}
                  onChange={handleKeepLoggedInChange}
                  className="mr-2 h-4 w-4"
                />
                <Label htmlFor="checkbox">Remember me</Label>
              </div>
            </div>
            <Button
              type="submit"
              form="login-form"
              className="w-full mt-8 text-md"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </Button>
            {error && (
              <p className="text-red-500 flex items-center justify-center pt-2.5">
                {error}
              </p>
            )}
            <div className="text-center text-sm py-2">
              Don&apos;t have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src={LogoWhite}
              alt="Logo"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
