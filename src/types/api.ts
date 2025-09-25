// API Configuration types
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

// HTTP types
export interface RequestOptions extends RequestInit {
  timeout?: number;
}

// Token storage types
export type TokenStorage = "localStorage" | "sessionStorage";

export interface AuthOptions {
  persistent?: boolean;
  storage?: TokenStorage;
}
