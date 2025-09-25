import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type Role = "user" | "admin";

interface JwtPayload {
  id?: string;
  name?: string;
  email?: string;
  role?: Role;
  exp?: number;
}

interface AuthState {
  role: Role | null;
  email: string | null;
  userName: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    role: null,
    email: null,
    userName: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      // Redirect to login if no token
      window.location.href = "/login";
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      // Check token expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        // Token expired - clear storage and redirect to login
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      setAuthState({
        role: decoded.role || "user",
        email: decoded.email || null,
        userName: decoded.name || null,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Failed to decode token:", error);
      // Invalid token - clear storage and redirect to login
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  return authState;
};
