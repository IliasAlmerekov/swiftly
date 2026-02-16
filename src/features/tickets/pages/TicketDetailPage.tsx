import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAuthContext } from '@/shared/context/AuthContext';
import { useTicket, useUpdateTicket, useAddComment } from '@/features/tickets/hooks/useTickets';
import { useAdminUsers } from '@/shared/hooks/useAdminUsers';
import { normalizeCategoryValue } from '@/features/tickets/utils/ticketUtils';
import type { Ticket, UpdateTicketFormData } from '@/types';

import {
  TicketHeader,
  TicketDetailsCard,
  TicketDescriptionCard,
  TicketAttachmentsCard,
  TicketEditForm,
  type TicketEditFormData,
  TicketComments,
  CommentForm,
  TicketWorkflowCard,
  TicketRequesterCard,
} from '../components/ticket-detail';

// ============ Loading Component ============
const LoadingState = () => (
  <div className="flex flex-1 items-center justify-center">
    <div className="py-8 text-center">Loading...</div>
  </div>
);

// ============ Error Component ============
const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-1 items-center justify-center">
    <div className="py-8 text-center text-red-500">{message}</div>
  </div>
);

// ============ Main Component ============
const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // UI State
  const [isEditing, setIsEditing] = useState(false);

  // Memoize current user to prevent unnecessary re-renders
  const currentUser = useMemo(
    () =>
      user
        ? {
            _id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          }
        : null,
    [user],
  );

  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'support1';

  // ============ Queries ============
  const { data: ticket, isLoading, error } = useTicket(ticketId ?? '');

  const { data: adminUsersData } = useAdminUsers(isStaff);
  const adminUsers = adminUsersData?.users ?? [];

  // ============ Mutations ============
  const updateTicketMutation = useUpdateTicket();
  const addCommentMutation = useAddComment();

  // ============ Handlers ============
  const handleBack = () => navigate(-1);

  const handleEditToggle = () => setIsEditing((prev) => !prev);

  const handleEditSubmit = (data: TicketEditFormData) => {
    if (!ticketId) return;

    const updatePayload: Partial<UpdateTicketFormData> = {
      title: data.title,
      description: data.description,
    };

    if (isStaff) {
      updatePayload.priority = data.priority;
      updatePayload.category = normalizeCategoryValue(data.category);
    }

    updateTicketMutation.mutate(
      { ticketId, data: updatePayload },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const handleStatusChange = (status: Ticket['status']) => {
    if (!ticketId) return;
    updateTicketMutation.mutate({ ticketId, data: { status } });
  };

  const handleAssignTicket = (userId: string) => {
    if (!ticketId) return;
    updateTicketMutation.mutate({ ticketId, data: { assignedTo: userId } });
  };

  const handlePriorityChange = (priority: Ticket['priority']) => {
    if (!ticketId) return;
    updateTicketMutation.mutate({ ticketId, data: { priority } });
  };

  const handleCategoryChange = (category: string) => {
    if (!ticketId) return;
    updateTicketMutation.mutate({
      ticketId,
      data: { category: normalizeCategoryValue(category) },
    });
  };

  const handleAddComment = (content: string) => {
    if (!ticketId) return;
    addCommentMutation.mutate({ ticketId, content });
  };

  // ============ Render States ============
  if (!ticketId) {
    return <ErrorState message="Ticket ID is required" />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message="Failed to load ticket" />;
  }

  if (!ticket) {
    return <ErrorState message="Ticket not found" />;
  }

  // ============ Computed Values ============
  const canEdit = isStaff || currentUser?._id === ticket.owner?._id;
  const commentCount = ticket.comments?.length ?? 0;
  const attachments = ticket.attachments ?? [];

  return (
    <div className="@container/main flex-1 overflow-auto p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Header */}
        <TicketHeader
          ticket={ticket}
          canEdit={canEdit}
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
          onBack={handleBack}
          isSaving={updateTicketMutation.isPending}
        />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left Column - Details & Comments */}
          <div className="space-y-6">
            <Tabs defaultValue="details">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments">Comments ({commentCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {isEditing ? (
                  <TicketEditForm
                    ticket={ticket}
                    isStaff={isStaff}
                    onSubmit={handleEditSubmit}
                    isSubmitting={updateTicketMutation.isPending}
                  />
                ) : (
                  <>
                    <TicketDetailsCard ticket={ticket} />
                    <TicketDescriptionCard description={ticket.description} />
                    <TicketAttachmentsCard attachments={attachments} />
                  </>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-6">
                <TicketComments comments={ticket.comments ?? []} />
                <CommentForm
                  onSubmit={handleAddComment}
                  isSubmitting={addCommentMutation.isPending}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Workflow & Requester */}
          <div className="space-y-6">
            <TicketWorkflowCard
              ticket={ticket}
              isStaff={isStaff}
              currentUserId={currentUser?._id}
              adminUsers={adminUsers}
              onStatusChange={handleStatusChange}
              onAssignTicket={handleAssignTicket}
              onPriorityChange={handlePriorityChange}
              onCategoryChange={handleCategoryChange}
              isUpdating={updateTicketMutation.isPending}
            />
            <TicketRequesterCard owner={ticket.owner} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
