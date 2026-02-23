// Base types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CursorPageInfo {
  limit: number;
  hasNextPage: boolean;
  nextCursor: string | null;
}

export interface CursorPage<T> {
  items: T[];
  pageInfo: CursorPageInfo;
}
export {
  ApiError,
  getApiErrorCodeByStatus,
  mapApiErrorToUserMessage,
  toApiError,
  type ApiErrorCode,
  type ApiErrorLike,
} from './api-error';

export type UserRole = 'user' | 'support1' | 'admin';

// User types
export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  onlineCount?: number;
  users?: number;
  company?: string;
  department?: string;
  position?: string;
  manager?: {
    _id: string;
    name: string;
    email: string;
    avatar?: {
      public_id: string;
      url: string;
    };
    department?: string;
    position?: string;
  };
  country?: string;
  city?: string;
  address?: string;
  postalCode?: number;
  isOnline?: boolean;
  lastSeen?: string;
  avatar?: {
    public_id: string;
    url: string;
  };
}

export interface AuthToken {
  token: string;
  user: User;
}

export interface AdminUsersResponse {
  users: User[];
  onlineCount: number;
  totalCount: number;
}

// Auth form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

// Ticket types
export interface Comment {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface TicketAttachment {
  _id?: string;
  url: string;
  name?: string;
  filename?: string;
  size?: number;
  uploadedAt?: string;
}

export interface Ticket {
  _id: string;
  owner: User;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category?: string;
  createdBy: User;
  assignedTo?: User;
  comments: Comment[];
  attachments?: TicketAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketFormData {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export interface UpdateTicketFormData {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  category?: string;
  assignedTo?: string;
}

export interface AddCommentFormData {
  content: string;
}

// AI types
export interface ChatRequest {
  role: 'user' | 'assistant';
  message?: string;
  content?: string;
  ticketId?: string;
  timestamp: string;
}

export interface AIResponse {
  response: string;
  sessionId: string;
  suggestions?: string[];
  confidence?: number;
  message?: string;
}

export interface SolutionSearchResult {
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  category: string;
}

// Navigation Types
export type TabType =
  | 'dashboard'
  | 'tickets'
  | 'analytics'
  | 'create-ticket'
  | 'admin-dashboard'
  | 'user-profile';

// Re-export API types
export * from './api';
