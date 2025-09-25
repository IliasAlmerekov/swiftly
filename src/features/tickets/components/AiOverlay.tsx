import { sendChatMessage } from "@/api/api";
import type { ChatRequest, AIResponse } from "@/types";
import React, { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import sendIcon from "@/assets/send.png";

// Format AI messages to show numbered lists properly
const formatAIMessage = (content: string) => {
  // No numbers? Just return plain text
  if (!content.includes("1.") && !content.includes("2.")) {
    return <span>{content}</span>;
  }

  // Find text before the list
  const beforeList = content.split(/\d+\./)[0].trim();

  // Extract all numbered items (1. 2. 3. etc.)
  const listMatches = content.match(/\d+\.\s+[^.]+\./g) || [];

  // Clean up list items (remove numbers and periods)
  const listItems = listMatches.map((item) =>
    item
      .replace(/^\d+\.\s+/, "")
      .replace(/\.$/, "")
      .trim()
  );

  // Find text after the list
  const lastMatch = listMatches[listMatches.length - 1];
  const afterList = lastMatch ? content.split(lastMatch)[1]?.trim() : "";

  return (
    <div>
      {beforeList && <span>{beforeList} </span>}
      {listItems.length > 0 && (
        <ol className="list-decimal list-inside space-y-1 my-2">
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
  onClose: () => void;
  onAllowCreateTicket: () => void;
  onNavigate: () => void;
}

const AiOverlay: React.FC<AIAssistantOverlayProps> = ({
  isOpen,
  onClose,
  onAllowCreateTicket,
  onNavigate,
}) => {
  const [message, setMessage] = useState<ChatRequest[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId] = useState<string>(
    () => `session_${Date.now()}_${Math.random()}`
  );
  const [canCreateTicket, setCanCreateTicket] = useState<boolean>(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && message.length === 0) {
      const initialMessage: ChatRequest = {
        role: "assistant",
        message:
          "Hallo😊! Ich bin Ihr ITO-Assistent. Bevor Sie ein neues Ticket erstellen, kann ich Ihnen vielleicht direkt helfen. Beschreiben Sie mir bitte Ihr Problem, und ich suche nach einer Lösung für Sie.",
        content:
          "Hallo😊! Ich bin Ihr ITO-Assistent. Bevor Sie ein neues Ticket erstellen, kann ich Ihnen vielleicht direkt helfen. Beschreiben Sie mir bitte Ihr Problem, und ich suche nach einer Lösung für Sie.",
        timestamp: new Date().toISOString(),
      };
      setMessage([initialMessage]);
    }
  }, [isOpen, message.length]);

  // auto scroll to bottom when message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatRequest = {
      role: "user",
      message: currentMessage.trim(),
      content: currentMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessage((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const chatRequest: ChatRequest = {
        role: "user",
        message: currentMessage.trim(),
        content: currentMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      // Add sessionId for API request
      const apiRequest = { ...chatRequest, sessionId };

      const response = await sendChatMessage(apiRequest as ChatRequest);
      console.log("AI Response received:", response);

      const aiMessage: ChatRequest = {
        role: "assistant",
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
      const aiText = (responseData.response || "").toLowerCase();
      const explicitFlag = responseData.shouldCreateTicket === true;
      const escalationType = aiType === "escalation_required";
      const ticketPhrases =
        /(ticket erstellen|create ticket|support[- ]?ticket|technicker|administrator|it[- ]?support|admin)/i;
      const escalationHints =
        /(manuelle prüfung|berechtigung|sensible|sensitive|kundendaten|personenbezogene|personal data|privat|private|rechtliche|legal|datenschutz|data protection|client data)/i;
      if (
        explicitFlag ||
        escalationType ||
        ticketPhrases.test(aiText) ||
        escalationHints.test(aiText)
      ) {
        setCanCreateTicket(true);
      }
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage: ChatRequest = {
        role: "assistant",
        message:
          "Entschuldigung, es gab ein Problem bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es später erneut oder erstellen Sie ein Ticket.",
        content:
          "Entschuldigung, es gab ein Problem bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es später erneut oder erstellen Sie ein Ticket.",
        timestamp: new Date().toISOString(),
      };
      setMessage((prev) => [...prev, errorMessage]);
      setCanCreateTicket(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (message.length >= 5) {
      setCanCreateTicket(true);
    }
  }, [message.length]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateTicket = () => {
    onAllowCreateTicket();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Bot className="w-10 h-10 rounded-full" />
            AI-Helpdesk-Assistent
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-xl font-bold p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            onClick={onNavigate}
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {message.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {msg.role === "assistant"
                      ? formatAIMessage(msg.content || "")
                      : msg.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.role === "user"
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 mb-2">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Beschreiben Sie Ihr Problem..."
                className="flex-1 resize-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                disabled={isLoading}
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !currentMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[48px]"
              >
                <img src={sendIcon} alt="Send" className="w-5 h-5" />
              </button>
            </div>

            {canCreateTicket && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Es tut mir wirklich leid, dass ich hier nicht weiterhelfen
                  konnte. Dafür sind aber meine menschlichen Kollegen da
                </p>
                <button
                  onClick={handleCreateTicket}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Create Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiOverlay;
