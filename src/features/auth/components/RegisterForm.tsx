import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import React from 'react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import useRegister from '../hooks/useRegister';

export default function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
  const {
    email,
    password,
    name,
    error,
    success,
    handleSubmit,
    handleEmailChange,
    handlePasswordChange,
    handleNameChange,
  } = useRegister();
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Registration Page</CardTitle>
          <CardDescription>Please fill in the form to create an account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-md">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name.surname@solutions-it.com"
                  required
                  autoComplete="email"
                  value={email}
                  className="h-10"
                  onChange={handleEmailChange}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password" className="text-md">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  value={password}
                  className="h-10"
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-md">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  className="h-10"
                  onChange={handleNameChange}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && (
                <p className="text-sm text-green-600">
                  Registration successful! Redirecting to login...
                </p>
              )}
              <Button type="submit" className="text-md mt-8 w-full">
                Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
