import type {
  ApiResponse,
  Ticket,
  AuthToken,
  UpdateTicketFormData,
  ChatRequest,
  AIResponse,
  SolutionSearchResult,
  AdminUsersResponse,
  User,
} from "../types";
import { ApiError } from "../types";

// API base URL - uses environment variable or falls back to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Helper function to get authentication token
const getAuthToken = (): string => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    throw new ApiError("Not authenticated", 401);
  }

  return token;
};

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  return response.json();
};

// Authentication functions
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthToken> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    return handleApiResponse<AuthToken>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to login", 500);
  }
};

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  role: "user" | "admin" = "user"
): Promise<AuthToken> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    });

    return handleApiResponse<AuthToken>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to register", 500);
  }
};

// Ticket functions
export const getUserTickets = async (): Promise<Ticket[]> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/tickets/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleApiResponse<Ticket[]>(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch user tickets", 500);
  }
};

export const getSupportUsers = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/support`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch support users", 500);
  }
};

export const getTicketStatsOfMonth = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/tickets/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch ticket stats", 500);
  }
};

export const getUserTicketStats = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/tickets/user/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch user ticket stats", 500);
  }
};

export const setUserStatusOnline = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/status/online`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to set user status to online:", error);
  }
};

export const setUserStatusOffline = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/status/offline`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to set user status to offline:", error);
  }
};

// activity heartbeat to keep user online

export const activityInterval = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/status/activity`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to update user activity status:", error);
  }
};

export const getAllTickets = async (): Promise<Ticket[]> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/tickets?admin=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleApiResponse<Ticket[]>(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch all tickets", 500);
  }
};

export const getTicketById = async (ticketId: string): Promise<Ticket> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return handleApiResponse<Ticket>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch ticket details", 500);
  }
};

export const createTicket = async (
  ticketData: UpdateTicketFormData
): Promise<Ticket> => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ticketData),
    });

    const data = await handleApiResponse<ApiResponse<Ticket>>(response);
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to create ticket", 500);
  }
};

export const updateTicket = async (
  ticketId: string,
  updatedData: UpdateTicketFormData
): Promise<Ticket> => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await handleApiResponse<ApiResponse<Ticket>>(response);
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to update ticket", 500);
  }
};

export const addComment = async (
  ticketId: string,
  content: string
): Promise<Ticket> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    const data = await handleApiResponse<ApiResponse<Ticket>>(response);
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to add comment", 500);
  }
};

export const getAdminUsers = async (): Promise<AdminUsersResponse> => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}/auth/admins`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleApiResponse<AdminUsersResponse>(response);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch admin users", 500);
  }
};


// Utility functions
export const isAuthenticated = (): boolean => {
  return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
};

export const clearAuthToken = (): void => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};

export const setAuthToken = (token: string, persistent = false): void => {
  if (persistent) {
    localStorage.setItem("token", token);
    sessionStorage.removeItem("token");
  } else {
    sessionStorage.setItem("token", token);
    localStorage.removeItem("token");
  }
};

// =================
// USER API FUNCTIONS
// =================

// get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}/users/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleApiResponse<User[]>(response);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch all users", 500);
  }
};

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return handleApiResponse<User>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch user profile", 500);
  }
};

// Get user profile by ID (admin only)
export const getUserProfileById = async (userId: string): Promise<User> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return handleApiResponse<User>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch user profile", 500);
  }
};

// Update user profile
export const updateUserProfile = async (
  userData: Partial<User>
): Promise<User> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    return handleApiResponse<User>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to update user profile", 500);
  }
};

// Update user profile by ID (admin only)
export const updateUserProfileById = async (
  userId: string,
  userData: Partial<User>
): Promise<User> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    return handleApiResponse<User>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to update user profile", 500);
  }
};

// Upload user avatar
export const uploadUserAvatar = async (file: File): Promise<User> => {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_URL}/upload/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await handleApiResponse<{
      success: boolean;
      message: string;
      user: User;
    }>(response);
    return data.user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to upload avatar", 500);
  }
};

// =================
// AI API FUNCTIONS
// =================

const makeAIRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || "AI request failed",
      response.status
    );
  }

  return response.json();
};

export const sendChatMessage = async (
  data: ChatRequest
): Promise<ApiResponse<AIResponse>> => {
  return makeAIRequest(`${API_URL}/ai/chat`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const searchSolutions = async (
  query: string
): Promise<ApiResponse<SolutionSearchResult[]>> => {
  return makeAIRequest(
    `${API_URL}/ai/solutions/search?query=${encodeURIComponent(query)}`,
    { method: "GET" }
  );
};

export const getTicketSuggestions = async (
  ticketId: string
): Promise<ApiResponse<AIResponse>> => {
  return makeAIRequest(`${API_URL}/ai/tickets/${ticketId}/suggestions`, {
    method: "GET",
  });
};

export const generateSolution = async (
  ticketId: string
): Promise<ApiResponse<AIResponse>> => {
  return makeAIRequest(`${API_URL}/ai/tickets/${ticketId}/solution`, {
    method: "POST",
  });
};

export const submitAIFeedback = async (
  sessionId: string,
  isHelpful: boolean,
  feedback?: string
): Promise<ApiResponse<{ message: string }>> => {
  return makeAIRequest(`${API_URL}/ai/feedback`, {
    method: "POST",
    body: JSON.stringify({ sessionId, isHelpful, feedback }),
  });
};

export const getAIStats = async () => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}/ai/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch AI stats", 500);
  }
};
