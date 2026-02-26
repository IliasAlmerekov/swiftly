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
