import { ApiError, getApiErrorCodeByStatus, type ApiErrorCode } from '@/types';
import { API_BASE_URL } from '@/config/env';
import { reportError } from '@/shared/lib/observability';

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

interface ErrorPayload {
  message?: string;
  details?: unknown;
  code?: ApiErrorCode;
  userMessage?: string;
}

// ============ Response Handler ============

/**
 * Handle API response
 */
async function parseSuccessResponse<T>(response: Response): Promise<T> {
  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return response.json();
}

const API_ERROR_CODES: ReadonlySet<ApiErrorCode> = new Set([
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'TIMEOUT',
  'SERVER_ERROR',
  'NETWORK_ERROR',
  'BAD_RESPONSE',
  'UNKNOWN_ERROR',
]);

const isApiErrorCode = (value: unknown): value is ApiErrorCode =>
  typeof value === 'string' && API_ERROR_CODES.has(value as ApiErrorCode);

const parseErrorPayload = async (response: Response): Promise<ErrorPayload | null> => {
  try {
    const payload = await response.clone().json();
    if (payload && typeof payload === 'object') {
      const typedPayload = payload as Record<string, unknown>;
      return {
        message: typeof typedPayload.message === 'string' ? typedPayload.message : undefined,
        details: typedPayload.details,
        code: isApiErrorCode(typedPayload.code) ? typedPayload.code : undefined,
        userMessage:
          typeof typedPayload.userMessage === 'string' ? typedPayload.userMessage : undefined,
      };
    }
  } catch {
    // ignore JSON parse errors and fallback to text
  }

  try {
    const text = (await response.text()).trim();
    if (text) {
      return { message: text };
    }
  } catch {
    // ignore text parse errors
  }

  return null;
};

const createHttpError = async (response: Response): Promise<ApiError> => {
  const payload = await parseErrorPayload(response);
  const status = response.status;
  const code = payload?.code ?? getApiErrorCodeByStatus(status);
  const message = payload?.message?.trim() || `HTTP error! status: ${status}`;

  return new ApiError(message, status, payload?.details, {
    code,
    userMessage: payload?.userMessage,
  });
};

const normalizeRequestError = (error: unknown, fallbackMessage: string): ApiError => {
  const isAbortLikeError =
    (error instanceof Error && error.name === 'AbortError') ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name?: unknown }).name === 'AbortError');

  if (error instanceof ApiError) {
    return error;
  }

  if (isAbortLikeError) {
    return new ApiError(fallbackMessage, 408, undefined, { code: 'TIMEOUT', cause: error });
  }

  if (error instanceof TypeError) {
    return new ApiError(fallbackMessage, 503, undefined, {
      code: 'NETWORK_ERROR',
      cause: error,
    });
  }

  return new ApiError(fallbackMessage, 500, undefined, { code: 'SERVER_ERROR', cause: error });
};

// ============ API Client Factory ============

/**
 * Creates an API client instance with the given configuration
 */
export function createApiClient(config: ApiClientConfig = {}) {
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
    void skipAuth;
    const method = (fetchOptions.method ?? 'GET').toUpperCase();

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...fetchOptions,
        cache: fetchOptions.cache ?? (method === 'GET' ? 'no-store' : undefined),
        credentials: fetchOptions.credentials ?? 'include',
        headers,
        signal: controller.signal,
        body: body ? JSON.stringify(body) : undefined,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        onUnauthorized?.();
      }

      if (!response.ok) {
        throw await createHttpError(response);
      }

      return parseSuccessResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      const normalizedError = normalizeRequestError(error, 'Failed to execute request');
      reportError('api-client', normalizedError, `${method} ${endpoint}`);
      throw normalizedError;
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
      const {
        timeout: requestTimeout = timeout,
        skipAuth = false,
        headers: customHeaders,
        ...fetchOptions
      } = options || {};
      void skipAuth;

      const headers: HeadersInit = { ...customHeaders };
      // Do not set Content-Type - the browser will set it with boundary

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          ...fetchOptions,
          method: 'POST',
          credentials: fetchOptions.credentials ?? 'include',
          headers,
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 401) {
          onUnauthorized?.();
        }

        if (!response.ok) {
          throw await createHttpError(response);
        }

        return parseSuccessResponse<T>(response);
      } catch (error) {
        clearTimeout(timeoutId);
        const normalizedError = normalizeRequestError(error, 'Failed to upload file');
        reportError('api-client', normalizedError, `UPLOAD ${endpoint}`);
        throw normalizedError;
      }
    },
  };
}

// ============ Default Client Instance ============

/**
 * Default API client instance
 */
export const apiClient = createApiClient({
  onUnauthorized: () => {
    if (import.meta.env.MODE === 'test') {
      return;
    }

    // Redirect to login on 401
    window.location.assign('/login');
  },
});

export default apiClient;
