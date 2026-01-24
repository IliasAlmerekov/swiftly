import { sendChatMessage } from '@/api/ai';
import type { ChatRequest, AIResponse } from '@/types';
import React, { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import sendIcon from '@/assets/send.png';

// Format AI messages to show numbered lists properly
const formatAIMessage = (content: string) => {
  // No numbers? Just return plain text
  if (!content.includes('1.') && !content.includes('2.')) {
    return <span>{content}</span>;
  }

  // Find text before the list
  const beforeList = content.split(/\d+\./)[0].trim();

  // Extract all numbered items (1. 2. 3. etc.)
  const listMatches = content.match(/\d+\.\s+[^.]+\./g) || [];

  // Clean up list items (remove numbers and periods)
  const listItems = listMatches.map((item) =>
    item
      .replace(/^\d+\.\s+/, '')
      .replace(/\.$/, '')
      .trim(),
  );

  // Find text after the list
  const lastMatch = listMatches[listMatches.length - 1];
  const afterList = lastMatch ? content.split(lastMatch)[1]?.trim() : '';

  return (
    <div>
      {beforeList && <span>{beforeList} </span>}
      {listItems.length > 0 && (
        <ol className="my-2 list-inside list-decimal space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      )}
      {afterList && <span>{afterList}</span>}
    </div>
  );
};

interface AIAssistantOverlayProps {
  isOpen: boolean;
  onAllowCreateTicket: () => void;
  onNavigate: () => void;
}

const AiOverlay: React.FC<AIAssistantOverlayProps> = ({
  isOpen,
  onAllowCreateTicket,
  onNavigate,
}) => {
  const [message, setMessage] = useState<ChatRequest[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => `session_${Date.now()}_${Math.random()}`);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && message.length === 0) {
      const initialMessage: ChatRequest = {
        role: 'assistant',
        message:
          'Hallo😊! Ich bin Ihr ITO-Assistent. Bevor Sie ein neues Ticket erstellen, kann ich Ihnen vielleicht direkt helfen. Beschreiben Sie mir bitte Ihr Problem, und ich suche nach einer Lösung für Sie.',
        content:
          'Hallo😊! Ich bin Ihr ITO-Assistent. Bevor Sie ein neues Ticket erstellen, kann ich Ihnen vielleicht direkt helfen. Beschreiben Sie mir bitte Ihr Problem, und ich suche nach einer Lösung für Sie.',
        timestamp: new Date().toISOString(),
      };
      setMessage([initialMessage]);
    }
  }, [isOpen, message.length]);

  // auto scroll to bottom when message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatRequest = {
      role: 'user',
      message: currentMessage.trim(),
      content: currentMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessage((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const chatRequest: ChatRequest = {
        role: 'user',
        message: currentMessage.trim(),
        content: currentMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      // Add sessionId for API request
      const apiRequest = { ...chatRequest, sessionId };

      const response = await sendChatMessage(apiRequest as ChatRequest);

      const aiMessage: ChatRequest = {
        role: 'assistant',
        message: response.data.message,
        content: response.data.message,
        timestamp: new Date().toISOString(),
      };

      setMessage((prev) => [...prev, aiMessage]);

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
        const errorAiMessage: ChatRequest = {
          role: 'assistant',
          message:
            'Entschuldigung, ich kann Ihnen nicht direkt helfen. Bitte erstellen Sie ein Ticket.',
          content:
            'Entschuldigung, ich kann Ihnen nicht direkt helfen. Bitte erstellen Sie ein Ticket.',
          timestamp: new Date().toISOString(),
        };
        setMessage((prev) => [...prev, errorAiMessage]);
      }
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage: ChatRequest = {
        role: 'assistant',
        message:
          'Entschuldigung, es gab ein Problem bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es später erneut oder erstellen Sie ein Ticket.',
        content:
          'Entschuldigung, es gab ein Problem bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es später erneut oder erstellen Sie ein Ticket.',
        timestamp: new Date().toISOString(),
      };
      setMessage((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateTicket = () => {
    onAllowCreateTicket();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
      <div className="mx-4 flex h-[600px] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
            <Bot className="h-10 w-10 rounded-full" />
            AI-Helpdesk-Assistent
          </h2>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full p-1 text-xl font-bold text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            onClick={onNavigate}
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {message.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                    msg.role === 'user'
                      ? 'rounded-br-none bg-blue-600 text-white'
                      : 'rounded-bl-none bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {msg.role === 'assistant' ? formatAIMessage(msg.content || '') : msg.content}
                  </div>
                  <div
                    className={`mt-1 text-xs ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs rounded-lg rounded-bl-none bg-gray-100 px-4 py-2 text-gray-900 lg:max-w-md dark:bg-gray-800 dark:text-gray-100">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="mb-2 flex gap-2">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Beschreiben Sie Ihr Problem..."
                className="flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:disabled:bg-gray-700"
                disabled={isLoading}
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !currentMessage.trim()}
                className="flex min-w-[48px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <img src={sendIcon} alt="Send" className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center">
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                Bitte erstellen Sie ein Ticket, falls der AI-Assistent Ihnen nicht weiterhelfen
                konnte. So können wir uns auf komplexe Probleme konzentrieren. Vielen Dank für Ihr
                Verständnis! Ihr ITO-Team
              </p>
              <button
                onClick={handleCreateTicket}
                className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-900"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiOverlay;
