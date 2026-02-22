import { useState, useCallback, useEffect, useRef } from 'react';
import { sendChatMessage } from '@/features/tickets/api/ai';
import type { AIResponse, ChatRequest } from '@/types';

const INITIAL_MESSAGE =
  'Hallo 😊! Ich bin Ihr ITO-Assistent. Bevor Sie ein neues Ticket erstellen, kann ich Ihnen vielleicht direkt helfen. Beschreiben Sie mir bitte Ihr Problem, und ich suche nach einer Lösung für Sie.';

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
          /(ticket erstellen|create ticket|support[- ]?ticket|technicker|administrator|it[- ]?support|admin)/i;
        const ticketRequestPhrases =
          /((bitte|please).{0,40}ticket|ticket.{0,40}(erstellen|create)|erstellen\s+(?:sie\s+)?(?:ein\s+)?ticket|helpdesk[- ]?formular|formular ausf(ü|u)llen|1st level support|first level support|support übernimmt|helpdesk-formular|helpdeskformular)/i;
        const escalationHints =
          /(manuelle prüfung|berechtigung|sensible|sensitive|kundendaten|personenbezogene|personal data|privat|private|rechtliche|legal|datenschutz|data protection|client data)/i;
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
              message:
                'Entschuldigung, ich kann Ihnen nicht direkt helfen. Bitte erstellen Sie ein Ticket.',
              content:
                'Entschuldigung, ich kann Ihnen nicht direkt helfen. Bitte erstellen Sie ein Ticket.',
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
              'Entschuldigung, es gab ein Problem bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es später erneut oder erstellen Sie ein Ticket.',
            content:
              'Entschuldigung, es gab ein Problem bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es später erneut oder erstellen Sie ein Ticket.',
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
