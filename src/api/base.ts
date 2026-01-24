import { ApiError } from '../types';
import { getStoredToken } from '@/shared/utils/token';

// API base URL - uses environment variable or falls back to localhost for development
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Get authentication token from storage
 * @throws ApiError if token is missing
 */
export const getAuthToken = (): string => {
  const token = getStoredToken();

  if (!token) {
    throw new ApiError('Not authenticated', 401);
  }

  return token;
};

/**
 * Handle API response
 * @deprecated Use apiClient from @/shared/api/client
 */
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = `HTTP error! status: ${response.status}`;
    let details: unknown;

    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === 'object' && 'message' in errorData) {
        message = String(errorData.message) || message;
      }
      if (errorData && typeof errorData === 'object' && 'details' in errorData) {
        details = (errorData as { details?: unknown }).details;
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

  return response.json();
};
