import { z } from 'zod';

import type {
  AdminUsersResponse,
  AIResponse,
  AuthLogoutResponse,
  AuthRefreshResponse,
  AuthUserResponse,
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
const optionalNullableStringSchema = z
  .string()
  .nullish()
  .transform((value) => value ?? undefined);
const optionalNullablePostalCodeSchema = z.preprocess(
  (value) => (value === null || value === undefined || value === '' ? undefined : value),
  z.coerce.number().optional(),
);
const userRoleSchema = z.enum(['user', 'support1', 'admin']);
const ticketPrioritySchema = z.enum(['low', 'medium', 'high']);
const ticketStatusSchema = z.enum(['open', 'in-progress', 'resolved', 'closed']);
const DEFAULT_USER_TIMESTAMP = '1970-01-01T00:00:00.000Z';
const roleOrDefaultSchema = z
  .union([userRoleSchema, z.null(), z.undefined()])
  .transform((value) => value ?? 'user');
const timestampOrDefaultSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value ?? DEFAULT_USER_TIMESTAMP);

const avatarObjectSchema = z
  .object({
    public_id: z.string(),
    url: z.string().min(1),
  })
  .passthrough();
const nullableAvatarSchema = z.preprocess((value) => {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== 'object') {
    return value;
  }

  const avatar = value as Record<string, unknown>;
  const publicId = typeof avatar.public_id === 'string' ? avatar.public_id.trim() : '';
  const url = typeof avatar.url === 'string' ? avatar.url.trim() : '';

  if (!publicId || !url) {
    return undefined;
  }

  return { ...avatar, public_id: publicId, url };
}, avatarObjectSchema.optional());

const managerSchema = z
  .object({
    _id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar: nullableAvatarSchema,
    department: optionalNullableStringSchema,
    position: optionalNullableStringSchema,
  })
  .passthrough();

export const userSchema: z.ZodType<User, z.ZodTypeDef, unknown> = z
  .object({
    _id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: roleOrDefaultSchema,
    createdAt: timestampOrDefaultSchema,
    updatedAt: timestampOrDefaultSchema,
    onlineCount: z.number().optional(),
    users: z.number().optional(),
    company: optionalNullableStringSchema,
    department: optionalNullableStringSchema,
    position: optionalNullableStringSchema,
    manager: z
      .union([managerSchema, z.string(), z.null(), z.undefined()])
      .transform((value) => (typeof value === 'string' || value == null ? undefined : value)),
    country: optionalNullableStringSchema,
    city: optionalNullableStringSchema,
    address: optionalNullableStringSchema,
    postalCode: optionalNullablePostalCodeSchema,
    isOnline: z.boolean().optional(),
    lastSeen: optionalNullableStringSchema,
    avatar: nullableAvatarSchema,
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

export const ticketSchema: z.ZodType<Ticket, z.ZodTypeDef, unknown> = z
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

const DEFAULT_LIST_TIMESTAMP = DEFAULT_USER_TIMESTAMP;
const DEFAULT_LIST_USER: User = {
  _id: 'unknown-user',
  email: 'unknown.user@helpdesk.local',
  name: 'Unknown User',
  role: 'user',
  createdAt: DEFAULT_LIST_TIMESTAMP,
  updatedAt: DEFAULT_LIST_TIMESTAMP,
};

const listUserSchema = z.union([userSchema, z.null(), z.undefined()]).catch(undefined);

// Ticket list payloads are often lighter than detail payloads; normalize them to the Ticket model.
export const ticketListItemSchema: z.ZodType<Ticket, z.ZodTypeDef, unknown> = z
  .object({
    _id: z.string(),
    owner: listUserSchema.optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    priority: ticketPrioritySchema.optional(),
    status: ticketStatusSchema,
    category: z.string().optional(),
    createdBy: listUserSchema.optional(),
    assignedTo: listUserSchema.optional(),
    comments: z.array(commentSchema).optional(),
    attachments: z.array(ticketAttachmentSchema).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough()
  .transform((ticket): Ticket => {
    const owner = ticket.owner ?? DEFAULT_LIST_USER;
    const createdBy = ticket.createdBy ?? owner;
    const createdAt = ticket.createdAt ?? DEFAULT_LIST_TIMESTAMP;

    return {
      _id: ticket._id,
      owner,
      title: ticket.title ?? 'Untitled ticket',
      description: ticket.description ?? '',
      priority: ticket.priority,
      status: ticket.status,
      category: ticket.category,
      createdBy,
      assignedTo: ticket.assignedTo ?? undefined,
      comments: ticket.comments ?? [],
      attachments: ticket.attachments,
      createdAt,
      updatedAt: ticket.updatedAt ?? createdAt,
    };
  });

export const ticketEntitySchema: z.ZodType<Ticket, z.ZodTypeDef, unknown> = z.union([
  ticketSchema,
  ticketListItemSchema,
  z.object({ ticket: ticketSchema }).transform((payload) => payload.ticket),
  z.object({ ticket: ticketListItemSchema }).transform((payload) => payload.ticket),
]);

export const authTokenSchema: z.ZodType<AuthToken, z.ZodTypeDef, unknown> = z
  .object({
    token: z.string().min(1),
    user: userSchema,
  })
  .passthrough();

export const authUserResponseSchema: z.ZodType<AuthUserResponse, z.ZodTypeDef, unknown> = z
  .object({
    user: userSchema,
    authenticated: z.literal(true),
  })
  .passthrough();

export const authRefreshResponseSchema: z.ZodType<AuthRefreshResponse> = z
  .object({
    authenticated: z.literal(true),
  })
  .passthrough();

export const authLogoutResponseSchema: z.ZodType<AuthLogoutResponse> = z
  .object({
    success: z.literal(true),
    message: z.string(),
  })
  .passthrough();

export const adminUsersResponseSchema: z.ZodType<AdminUsersResponse, z.ZodTypeDef, unknown> = z
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

export const aiResponseSchema: z.ZodType<AIResponse, z.ZodTypeDef, unknown> = z
  .object({
    sessionId: z.string(),
    response: z.string().optional(),
    message: z.string().optional(),
    suggestions: z.array(z.string()).optional(),
    confidence: z.number().optional(),
    type: z.string().optional(),
    shouldCreateTicket: z.boolean().optional(),
    relatedSolutions: z.array(z.unknown()).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .passthrough()
  .refine((payload) => Boolean(payload.response || payload.message), {
    message: 'Either response or message is required',
  })
  .transform((payload) => {
    const normalizedMessage = payload.message ?? payload.response ?? '';
    const normalizedResponse = payload.response ?? payload.message ?? '';

    return {
      ...payload,
      message: normalizedMessage,
      response: normalizedResponse,
    };
  });

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
