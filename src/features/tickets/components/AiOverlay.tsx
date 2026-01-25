import { sendChatMessage } from '@/api/ai';
import type { AIResponse, ChatRequest } from '@/types';
import React, { useEffect, useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';

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
          'Hallo 😊! Ich bin Ihr ITO-Assistent. Bevor Sie ein neues Ticket erstellen, kann ich Ihnen vielleicht direkt helfen. Beschreiben Sie mir bitte Ihr Problem, und ich suche nach einer Lösung für Sie.',
        content:
          'Hallo 😊! Ich bin Ihr ITO-Assistent. Bevor Sie ein neues Ticket erstellen, kann ich Ihnen vielleicht direkt helfen. Beschreiben Sie mir bitte Ihr Problem, und ich suche nach einer Lösung für Sie.',
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="flex h-[75vh] min-h-[640px] w-full max-w-5xl flex-col overflow-hidden shadow-2xl">
        <CardHeader className="relative flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex items-center gap-4">
            <Avatar className="size-11 border">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">AI-Helpdesk-Assistent</CardTitle>
              <CardDescription>
                Soforthilfe für häufige Probleme, bevor Sie ein Ticket erstellen.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">ITO Support</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigate}
            aria-label="Schließen"
            className="absolute top-4 right-4"
          >
            <X className="size-4" />
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
          <div className="bg-muted/20 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-xl border p-4">
            <div className="flex-1 space-y-5 overflow-y-auto pr-2">
              {message.map((msg, index) => {
                const isUser = msg.role === 'user';
                const timeLabel = new Date(msg.timestamp).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-3',
                      isUser ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {!isUser && (
                      <Avatar className="mt-1 size-8 border">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                        isUser
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-background text-foreground rounded-bl-sm border',
                      )}
                    >
                      <div className="text-sm leading-relaxed">
                        {msg.role === 'assistant'
                          ? formatAIMessage(msg.content || '')
                          : msg.content}
                      </div>
                      <div
                        className={cn(
                          'mt-2 text-xs',
                          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground',
                        )}
                      >
                        {timeLabel}
                      </div>
                    </div>
                    {isUser && (
                      <Avatar className="mt-1 size-8 border">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          DU
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="mt-1 size-8 border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-background rounded-2xl rounded-bl-sm border px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" />
                      <span
                        className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <span
                        className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex-col gap-4 px-4 py-4">
          <div className="flex w-full gap-3">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Beschreiben Sie Ihr Problem in 1-2 Sätzen..."
              className="min-h-[56px] flex-1"
              disabled={isLoading}
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !currentMessage.trim()}
              className="h-auto min-w-[52px] px-4"
            >
              <Send className="size-4" />
            </Button>
          </div>
          <div className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm sm:max-w-[70%]">
              Wenn der Assistent nicht weiterhilft, erstellen Sie bitte ein Ticket. So können wir
              uns gezielt um komplexe Fälle kümmern. Vielen Dank für Ihr Verständnis! Ihr ITO-Team.
            </p>
            <Button
              onClick={handleCreateTicket}
              variant="secondary"
              className="w-full sm:w-auto sm:min-w-[200px]"
            >
              Ticket erstellen
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AiOverlay;
