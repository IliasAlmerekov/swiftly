import { memo } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCreateTicketForm } from '@/features/tickets/hooks/useCreateTicketForm';
import { AiOverlay } from '@/features/tickets/components/ai-overlay';
import ConfirmOverlay from '@/features/tickets/components/ConfirmOverlay';
import { CreateTicketForm } from '@/features/tickets/components/CreateTicketForm';
import { CreateTicketHelpSection } from '@/features/tickets/components/CreateTicketHelpSection';

/**
 * Create ticket page component.
 *
 * Follows bulletproof-react patterns:
 * - Custom hook for UI state (useCreateTicketForm)
 * - react-hook-form inside CreateTicketForm for form state isolation
 * - Extracted form and help section into separate components
 * - Single Responsibility: Composes sub-components
 * - Clean separation between staff and user flows
 */
export const CreateTicket = memo(function CreateTicket() {
  const { role } = useAuth();
  const isStaff = role === 'admin' || role === 'support1';
  const isRoleReady = role !== undefined && role !== null;

  const {
    isSubmitting,
    error,
    success,
    showOverlay,
    showAIAssistant,
    canCreateTicket,
    handleSubmit,
    handleOverlayClose,
    handleAllowCreateTicket,
    handleNavigateToDashboard,
  } = useCreateTicketForm({ isStaff, isRoleReady });

  return (
    <div className="space-y-6">
      {/* AI Assistant for non-staff users */}
      {isRoleReady && !isStaff && (
        <AiOverlay
          isOpen={showAIAssistant}
          onAllowCreateTicket={handleAllowCreateTicket}
          onNavigate={handleNavigateToDashboard}
        />
      )}

      {/* Success Overlay */}
      <ConfirmOverlay
        show={showOverlay}
        onClose={handleOverlayClose}
        title="Ticket created successfully!"
        message="Your ticket has been submitted and will be processed soon. We'll notify you when there's an update."
        buttonText="Close"
      />

      {/* Main Form - only shown when allowed */}
      {(isStaff || canCreateTicket) && (
        <CreateTicketForm
          isStaff={isStaff}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
          success={success}
        />
      )}

      {/* Help Section */}
      <CreateTicketHelpSection />
    </div>
  );
});

export default CreateTicket;
