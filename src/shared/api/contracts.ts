import { z } from 'zod';

import type {
  AdminUsersResponse,
  AIResponse,
  ApiResponse,
  AuthToken,
  CursorPage,
  CursorPageInfo,
  SolutionSearchResult,
  Ticket,
  TicketAttachment,
  User,
} from '@/types';
import { ApiError, toApiError } from '@/types';

const stringOrNullSchema = z.string().nullable();
const userRoleSchema = z.enum(['user', 'support1', 'admin']);
const ticketPrioritySchema = z.enum(['low', 'medium', 'high']);
const ticketStatusSchema = z.enum(['open', 'in-progress', 'resolved', 'closed']);

const avatarSchema = z
  .object({
    public_id: z.string(),
    url: z.string().min(1),
  })
  .passthrough();

const managerSchema = z
  .object({
    _id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar: avatarSchema.optional(),
    department: z.string().optional(),
    position: z.string().optional(),
  })
  .passthrough();

export const userSchema: z.ZodType<User> = z
  .object({
    _id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: userRoleSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    onlineCount: z.number().optional(),
    users: z.number().optional(),
    company: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    manager: managerSchema.optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    postalCode: z.number().optional(),
    isOnline: z.boolean().optional(),
    lastSeen: z.string().optional(),
    avatar: avatarSchema.optional(),
  })
  .passthrough();

const commentSchema = z
  .object({
    _id: z.string(),
    content: z.string(),
    author: userSchema,
    createdAt: z.string(),
  })
  .passthrough();

export const ticketAttachmentSchema: z.ZodType<TicketAttachment> = z
  .object({
    _id: z.string().optional(),
    url: z.string().min(1),
    name: z.string().optional(),
    filename: z.string().optional(),
    size: z.number().optional(),
    uploadedAt: z.string().optional(),
  })
  .passthrough();

export const ticketSchema: z.ZodType<Ticket> = z
  .object({
    _id: z.string(),
    owner: userSchema,
    title: z.string(),
    description: z.string(),
    priority: ticketPrioritySchema.optional(),
    status: ticketStatusSchema,
    category: z.string().optional(),
    createdBy: userSchema,
    assignedTo: userSchema.optional(),
    comments: z.array(commentSchema),
    attachments: z.array(ticketAttachmentSchema).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

export const authTokenSchema: z.ZodType<AuthToken> = z
  .object({
    token: z.string().min(1),
    user: userSchema,
  })
  .passthrough();

export const adminUsersResponseSchema: z.ZodType<AdminUsersResponse> = z
  .object({
    users: z.array(userSchema),
    onlineCount: z.number().int().min(0),
    totalCount: z.number().int().min(0),
  })
  .passthrough();

export const adminUsersFlexibleSchema = z
  .union([adminUsersResponseSchema, z.array(userSchema)])
  .transform(
    (value): AdminUsersResponse =>
      Array.isArray(value)
        ? {
            users: value,
            onlineCount: 0,
            totalCount: value.length,
          }
        : value,
  );

const cursorPageInfoPartialSchema = z
  .object({
    limit: z.coerce.number().int().positive().optional(),
    hasNextPage: z.boolean().optional(),
    nextCursor: stringOrNullSchema.optional(),
  })
  .passthrough();

export const cursorPageInfoSchema: z.ZodType<CursorPageInfo> = z
  .object({
    limit: z.coerce.number().int().positive(),
    hasNextPage: z.boolean(),
    nextCursor: stringOrNullSchema,
  })
  .passthrough();

export const ticketStatsOfMonthSchema = z
  .object({
    stats: z.array(
      z
        .object({
          month: z.string(),
          monthNumber: z.number().int().min(1).max(12),
          count: z.number().int().min(0),
          year: z.number().int(),
        })
        .passthrough(),
    ),
    currentMonth: z.number().int().min(1).max(12),
    currentYear: z.number().int(),
  })
  .passthrough();

export const userTicketStatsSchema = z
  .object({
    stats: z.array(
      z
        .object({
          count: z.number().int().min(0),
          year: z.number().int(),
          monthNumber: z.number().int().min(1).max(12),
          month: z.string(),
        })
        .passthrough(),
    ),
    period: z.string(),
    userId: z.number().int(),
  })
  .passthrough();

export const aiResponseSchema: z.ZodType<AIResponse> = z
  .object({
    response: z.string(),
    sessionId: z.string(),
    suggestions: z.array(z.string()).optional(),
    confidence: z.number().optional(),
    message: z.string().optional(),
  })
  .passthrough();

export const solutionSearchResultSchema: z.ZodType<SolutionSearchResult> = z
  .object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    relevanceScore: z.number(),
    category: z.string(),
  })
  .passthrough();

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      success: z.boolean(),
      data: dataSchema,
      message: z.string().optional(),
    })
    .passthrough();

export const uploadAvatarResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
    user: userSchema,
  })
  .passthrough();

export const ticketAttachmentUploadResponseSchema = z
  .object({
    success: z.boolean(),
    attachments: z.array(ticketAttachmentSchema),
  })
  .passthrough();

export const aiStatsResponseSchema = z.record(z.string(), z.unknown());

interface ParsePayloadOptions {
  endpoint: string;
}

const createMalformedResponseError = (endpoint: string, error: z.ZodError): ApiError => {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join('.') || 'root',
    message: issue.message,
  }));

  return new ApiError(
    'Invalid API response payload',
    500,
    { endpoint, issues },
    { code: 'BAD_RESPONSE' },
  );
};

export const parseApiPayload = <T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  payload: unknown,
  options: ParsePayloadOptions,
): T => {
  const parsed = schema.safeParse(payload);
  if (parsed.success) {
    return parsed.data;
  }

  throw createMalformedResponseError(options.endpoint, parsed.error);
};

export const parseEntityOrApiResponse = <T>(
  payload: unknown,
  entitySchema: z.ZodType<T, z.ZodTypeDef, unknown>,
  options: ParsePayloadOptions,
): T => {
  const apiEnvelope = apiResponseSchema(entitySchema).safeParse(payload);
  if (apiEnvelope.success) {
    return parseApiPayload(entitySchema, apiEnvelope.data.data, options);
  }

  return parseApiPayload(entitySchema, payload, options);
};

export const normalizeCursorPageContract = <T>(
  payload: unknown,
  itemSchema: z.ZodType<T, z.ZodTypeDef, unknown>,
  fallbackLimit: number,
  endpoint: string,
): CursorPage<T> => {
  const schema = z
    .object({
      items: z.array(itemSchema).optional(),
      pageInfo: cursorPageInfoPartialSchema.optional(),
    })
    .passthrough();

  const data = parseApiPayload(schema, payload, { endpoint });

  return {
    items: data.items ?? [],
    pageInfo: {
      limit: data.pageInfo?.limit ?? fallbackLimit,
      hasNextPage: Boolean(data.pageInfo?.hasNextPage),
      nextCursor: data.pageInfo?.nextCursor ?? null,
    },
  };
};

export const normalizeApiModuleError = (error: unknown, fallbackMessage: string): ApiError =>
  toApiError(error, {
    fallbackMessage,
    fallbackStatus: 500,
    fallbackCode: 'SERVER_ERROR',
  });

export type GenericApiResponse<T> = ApiResponse<T>;
