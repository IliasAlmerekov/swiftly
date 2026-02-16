import { ApiError } from '@/types';
import { getStoredToken, clearStoredToken } from '@/shared/utils/token';
import { API_BASE_URL } from '@/config/env';

// ============ Configuration ============

export { API_BASE_URL };

/**
 * Default request timeout in milliseconds
 */
const DEFAULT_TIMEOUT = 30000;

// ============ Types ============

interface RequestConfig extends Omit<RequestInit, 'body'> {
  timeout?: number;
  skipAuth?: boolean;
  body?: unknown;
}

interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  onUnauthorized?: () => void;
}

// ============ Response Handler ============

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP error! status: ${response.status}`;
    let details: unknown;

    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === 'object') {
        if ('message' in errorData) {
          message = String(errorData.message) || message;
        }
        if ('details' in errorData) {
          details = errorData.details;
        }
      }
    } catch {
      try {
        const text = await response.text();
        if (text) {
          message = text;
        }
      } catch {
        // ignore parsing errors
      }
    }

    throw new ApiError(message, response.status, details);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return response.json();
}

// ============ API Client Factory ============

/**
 * Creates an API client instance with the given configuration
 */
function createApiClient(config: ApiClientConfig = {}) {
  const { baseUrl = API_BASE_URL, timeout = DEFAULT_TIMEOUT, onUnauthorized } = config;

  /**
   * Base method for making requests
   */
  async function request<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
    const {
      timeout: requestTimeout = timeout,
      skipAuth = false,
      body,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Add Authorization header if not skipAuth
    if (!skipAuth) {
      const token = getStoredToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    // AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
        body: body ? JSON.stringify(body) : undefined,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        clearStoredToken();
        if (onUnauthorized) {
          onUnauthorized();
        }
        throw new ApiError('Unauthorized', 401);
      }

      return handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message, 500);
      }

      throw new ApiError('Unknown error occurred', 500);
    }
  }

  return {
    /**
     * GET request
     */
    get: <T>(endpoint: string, options?: Omit<RequestConfig, 'method' | 'body'>) =>
      request<T>(endpoint, { ...options, method: 'GET' }),

    /**
     * POST request
     */
    post: <T>(endpoint: string, data?: unknown, options?: Omit<RequestConfig, 'method' | 'body'>) =>
      request<T>(endpoint, { ...options, method: 'POST', body: data }),

    /**
     * PUT request
     */
    put: <T>(endpoint: string, data?: unknown, options?: Omit<RequestConfig, 'method' | 'body'>) =>
      request<T>(endpoint, { ...options, method: 'PUT', body: data }),

    /**
     * PATCH request
     */
    patch: <T>(
      endpoint: string,
      data?: unknown,
      options?: Omit<RequestConfig, 'method' | 'body'>,
    ) => request<T>(endpoint, { ...options, method: 'PATCH', body: data }),

    /**
     * DELETE request
     */
    delete: <T>(endpoint: string, options?: Omit<RequestConfig, 'method' | 'body'>) =>
      request<T>(endpoint, { ...options, method: 'DELETE' }),

    /**
     * File upload (FormData)
     */
    upload: async <T>(
      endpoint: string,
      formData: FormData,
      options?: Omit<RequestConfig, 'method' | 'body'>,
    ): Promise<T> => {
      const { skipAuth = false, headers: customHeaders, ...fetchOptions } = options || {};

      const headers: HeadersInit = { ...customHeaders };
      // Do not set Content-Type - the browser will set it with boundary

      if (!skipAuth) {
        const token = getStoredToken();
        if (token) {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...fetchOptions,
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        clearStoredToken();
        if (onUnauthorized) {
          onUnauthorized();
        }
        throw new ApiError('Unauthorized', 401);
      }

      return handleResponse<T>(response);
    },
  };
}

// ============ Default Client Instance ============

/**
 * Default API client instance
 */
export const apiClient = createApiClient({
  onUnauthorized: () => {
    // Redirect to login on 401
    window.location.href = '/login';
  },
});

export default apiClient;
