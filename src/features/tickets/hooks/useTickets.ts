import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateTicketFormData, Ticket, UpdateTicketFormData } from '@/types';

import {
  addComment,
  createTicket,
  getAllTickets,
  getTicketById,
  getTicketStatsOfMonth,
  getUserTickets,
  getUserTicketStats,
  updateTicket,
  uploadTicketAttachment,
} from '../api';

// ============ Query Keys ============

export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...ticketKeys.lists(), filters] as const,
  userTickets: () => [...ticketKeys.all, 'user'] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  stats: () => [...ticketKeys.all, 'stats'] as const,
  userStats: () => [...ticketKeys.all, 'userStats'] as const,
};

// ============ Query Hooks ============

export function useUserTickets() {
  return useQuery({
    queryKey: ticketKeys.userTickets(),
    queryFn: () => getUserTickets(),
    select: (ticketPage) => ticketPage.items,
  });
}

export function useAllTickets() {
  return useQuery({
    queryKey: ticketKeys.list({ scope: 'all' }),
    queryFn: () => getAllTickets(),
    select: (ticketPage) => ticketPage.items,
  });
}

export function useTicket(ticketId: string) {
  return useQuery({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: () => getTicketById(ticketId),
    enabled: !!ticketId,
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: ticketKeys.stats(),
    queryFn: getTicketStatsOfMonth,
  });
}

export function useUserTicketStats() {
  return useQuery({
    queryKey: ticketKeys.userStats(),
    queryFn: getUserTicketStats,
  });
}

// ============ Mutation Hooks ============

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketFormData) => createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: UpdateTicketFormData }) =>
      updateTicket(ticketId, data),
    onSuccess: (updatedTicket: Ticket) => {
      queryClient.setQueryData(ticketKeys.detail(updatedTicket._id), updatedTicket);
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string; content: string }) =>
      addComment(ticketId, content),
    onSuccess: (updatedTicket: Ticket) => {
      queryClient.setQueryData(ticketKeys.detail(updatedTicket._id), updatedTicket);
    },
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, file }: { ticketId: string; file: File }) =>
      uploadTicketAttachment(ticketId, file),
    onSuccess: (_response, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
    },
  });
}
