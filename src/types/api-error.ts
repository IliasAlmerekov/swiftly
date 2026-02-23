export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'BAD_RESPONSE'
  | 'UNKNOWN_ERROR';

export interface ApiErrorOptions {
  code?: ApiErrorCode;
  userMessage?: string;
  cause?: unknown;
}

export interface ApiErrorLike {
  status?: number;
  code?: ApiErrorCode;
  userMessage?: string;
}

interface NormalizeApiErrorOptions {
  fallbackMessage: string;
  fallbackStatus?: number;
  fallbackCode?: ApiErrorCode;
  fallbackDetails?: unknown;
}

const STATUS_TO_ERROR_CODE: Record<number, ApiErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  408: 'TIMEOUT',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMITED',
};

const API_ERROR_USER_MESSAGES: Record<ApiErrorCode, string> = {
  BAD_REQUEST: 'Invalid request. Please check your input.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'This resource already exists.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  BAD_RESPONSE: 'Received an invalid server response. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

export const getApiErrorCodeByStatus = (status: number): ApiErrorCode => {
  if (status in STATUS_TO_ERROR_CODE) {
    return STATUS_TO_ERROR_CODE[status];
  }
  if (status >= 500) {
    return 'SERVER_ERROR';
  }
  return 'UNKNOWN_ERROR';
};

export const mapApiErrorToUserMessage = (
  error: ApiErrorLike,
  fallback = API_ERROR_USER_MESSAGES.UNKNOWN_ERROR,
): string => {
  const safeMessage = error.userMessage?.trim();
  if (safeMessage) {
    return safeMessage;
  }

  if (typeof error.code === 'string' && error.code in API_ERROR_USER_MESSAGES) {
    return API_ERROR_USER_MESSAGES[error.code];
  }

  if (typeof error.status === 'number') {
    const code = getApiErrorCodeByStatus(error.status);
    return API_ERROR_USER_MESSAGES[code] ?? fallback;
  }

  return fallback;
};

export class ApiError extends Error {
  public status: number;
  public code: ApiErrorCode;
  public details?: unknown;
  public userMessage: string;

  constructor(message: string, status = 500, details?: unknown, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.code = options.code ?? getApiErrorCodeByStatus(status);
    this.userMessage = mapApiErrorToUserMessage({
      status,
      code: this.code,
      userMessage: options.userMessage,
    });

    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export const toApiError = (error: unknown, options: NormalizeApiErrorOptions): ApiError => {
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
    return new ApiError(options.fallbackMessage, 408, options.fallbackDetails, {
      code: 'TIMEOUT',
      cause: error,
    });
  }

  if (error instanceof TypeError) {
    return new ApiError(options.fallbackMessage, 503, options.fallbackDetails, {
      code: 'NETWORK_ERROR',
      cause: error,
    });
  }

  return new ApiError(
    options.fallbackMessage,
    options.fallbackStatus ?? 500,
    options.fallbackDetails,
    {
      code: options.fallbackCode,
      cause: error,
    },
  );
};
