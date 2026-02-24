import { useState, useCallback, useEffect, useRef } from 'react';
import { sendChatMessage } from '@/features/tickets/api/ai';
import type { AIResponse, ChatRequest } from '@/types';

const INITIAL_MESSAGE =
  "Hello! I'm your ITO assistant. Before creating a new ticket, I may be able to help right away. Please describe your issue, and I'll look for a solution.";

interface UseAiChatOptions {
  isOpen: boolean;
}

interface UseAiChatResult {
  messages: ChatRequest[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: (content: string) => Promise<void>;
}

/**
 * Hook for managing AI chat state and API communication.
 * Separates chat logic from presentation.
 */
export function useAiChat({ isOpen }: UseAiChatOptions): UseAiChatResult {
  const [messages, setMessages] = useState<ChatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          message: INITIAL_MESSAGE,
          content: INITIAL_MESSAGE,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: ChatRequest = {
        role: 'user',
        message: content.trim(),
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const chatRequest: ChatRequest = {
          role: 'user',
          message: content.trim(),
          content: content.trim(),
          timestamp: new Date().toISOString(),
        };

        const response = await sendChatMessage({ ...chatRequest, sessionId } as ChatRequest);

        const aiMessage: ChatRequest = {
          role: 'assistant',
          message: response.data.message,
          content: response.data.message,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Check for escalation patterns
        const responseData = response.data as AIResponse & {
          type?: string;
          shouldCreateTicket?: boolean;
        };
        const aiType = responseData.type;
        const aiText = (response.data.message || responseData.response || '').toLowerCase();
        const explicitFlag = responseData.shouldCreateTicket === true;
        const escalationType = aiType === 'escalation_required';
        const ticketPhrases =
          /(ticket erstellen|create ticket|support[- ]?ticket|technicker|techniker|technician|administrator|it[- ]?support|admin)/i;
        const ticketRequestPhrases =
          /((bitte|please).{0,40}ticket|ticket.{0,40}(erstellen|create)|erstellen\s+(?:sie\s+)?(?:ein\s+)?ticket|helpdesk[- ]?formular|formular ausf(ü|u)llen|1st level support|first level support|support übernimmt|helpdesk-formular|helpdeskformular|please.{0,40}(create|open).{0,20}ticket)/i;
        const escalationHints =
          /(manuelle prüfung|berechtigung|sensible|sensitive|kundendaten|personenbezogene|personal data|privat|private|rechtliche|legal|datenschutz|data protection|client data|manual review|permission|permissions|confidential|regulated)/i;
        const aiAlreadyRequestsTicket = ticketRequestPhrases.test(aiText);

        if (
          (explicitFlag ||
            escalationType ||
            ticketPhrases.test(aiText) ||
            escalationHints.test(aiText)) &&
          !aiAlreadyRequestsTicket
        ) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              message: 'Sorry, I cannot resolve this directly. Please create a ticket.',
              content: 'Sorry, I cannot resolve this directly. Please create a ticket.',
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            message:
              'Sorry, there was a problem processing your request. Please try again later or create a ticket.',
            content:
              'Sorry, there was a problem processing your request. Please try again later or create a ticket.',
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId],
  );

  return {
    messages,
    isLoading,
    messagesEndRef,
    sendMessage,
  };
}
