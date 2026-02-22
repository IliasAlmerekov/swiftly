import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/config/paths';
import { createTicket, uploadTicketAttachment } from '@/features/tickets/api';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import type { CreateTicketFormData } from '@/features/tickets/components/CreateTicketForm';

interface UseCreateTicketFormOptions {
  isStaff: boolean;
  isRoleReady: boolean;
}

interface UseCreateTicketFormResult {
  // UI state
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  showOverlay: boolean;
  showAIAssistant: boolean;
  canCreateTicket: boolean;

  // Handlers
  handleSubmit: (data: CreateTicketFormData, attachment: File | null) => Promise<void>;
  handleOverlayClose: () => void;
  handleAllowCreateTicket: () => void;
  handleNavigateToDashboard: () => void;
}

/**
 * Custom hook for managing CreateTicket page state and logic.
 * Form state is now managed by react-hook-form inside CreateTicketForm.
 * This hook only handles submission logic and UI state.
 */
export function useCreateTicketForm({
  isStaff,
  isRoleReady,
}: UseCreateTicketFormOptions): UseCreateTicketFormResult {
  const navigate = useNavigate();

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [canCreateTicket, setCanCreateTicket] = useState(false);

  // Show AI Assistant when component mounts for non-staff users
  useEffect(() => {
    if (!isRoleReady) return;
    if (isStaff) {
      setShowAIAssistant(false);
      setCanCreateTicket(true);
    } else {
      setShowAIAssistant(true);
      setCanCreateTicket(false);
    }
  }, [isStaff, isRoleReady]);

  // Reset success message after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = useCallback(async (data: CreateTicketFormData, attachment: File | null) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const createdTicket = await createTicket(data);

      if (attachment) {
        try {
          await uploadTicketAttachment(createdTicket._id, attachment);
        } catch (uploadError) {
          setError(
            getApiErrorMessage(uploadError, 'Attachment upload failed. Ticket created without it.'),
          );
        }
      }

      setSuccess(true);
      setShowOverlay(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create ticket'));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleOverlayClose = () => {
    setShowOverlay(false);
  };

  const handleAllowCreateTicket = () => {
    setCanCreateTicket(true);
    setShowAIAssistant(false);
  };

  const handleNavigateToDashboard = useCallback(() => {
    navigate(paths.app.dashboard.getHref(paths.tabs.dashboard));
  }, [navigate]);

  return {
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
  };
}
