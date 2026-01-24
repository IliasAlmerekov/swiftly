import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import type { CreateTicketFormData } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, uploadTicketAttachment } from '@/api/tickets';
import AiOverlay from '@/features/tickets/components/AiOverlay';
import ConfirmOverlay from '@/features/tickets/components/ConfirmOverlay';
import { useAuth } from '@/shared/hooks/useAuth';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';

export function CreateTicket() {
  const navigate = useNavigate();
  const { role } = useAuth();

  // Zustand für Ticketdaten initialisieren
  const [ticketData, setTicketData] = useState<CreateTicketFormData>({
    title: '',
    description: '',
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const attachmentRef = useRef<HTMLInputElement | null>(null);

  // Zustand für Ladevorgang und Fehler
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  // AI Assistant States
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(true);
  const [canCreateTicket, setCanCreateTicket] = useState<boolean>(false);

  // Show AI Assistant when component mounts
  useEffect(() => {
    if (role === 'admin' || role === 'support1') {
      setShowAIAssistant(false);
      setCanCreateTicket(true);
    } else {
      setShowAIAssistant(true);
    }
  }, [role]);

  // Handler für Änderungen in Formularfeldern
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setTicketData({
      ...ticketData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    setAttachment(file);
  };

  // Funktion zum Absenden des Formulars
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); // Standard-Formularverhalten verhindern

    setIsLoading(true);
    setError(null);

    try {
      const createdTicket = await createTicket(ticketData);
      if (attachment) {
        try {
          await uploadTicketAttachment(createdTicket._id, attachment);
        } catch (uploadError) {
          setError(
            getApiErrorMessage(uploadError, 'Attachment upload failed. Ticket created without it.'),
          );
        }
      }

      // Erfolg setzen und Formular zurücksetzen
      setSuccess(true);
      setShowOverlay(true); // Show the overlay on successful ticket creation
      setTicketData({
        title: '',
        description: '',
      });
      setAttachment(null);
      if (attachmentRef.current) {
        attachmentRef.current.value = '';
      }

      // Erfolgsmeldung nach 3 Sekunden zurücksetzen
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create ticket'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClose = (): void => {
    setShowOverlay(false);
  };

  const handleAllowCreateTicket = (): void => {
    setCanCreateTicket(true);
    setShowAIAssistant(false);
  };

  const handleToNavigate = (): void => {
    navigate('/dashboard?tab=dashboard');
  };
  return (
    <div className="space-y-6">
      <AiOverlay
        isOpen={showAIAssistant}
        onAllowCreateTicket={handleAllowCreateTicket}
        onNavigate={handleToNavigate}
      />
      {canCreateTicket && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Support Ticket</CardTitle>
            <CardDescription>
              Fill out the form below to submit a new support request
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <div className="text-green-500">
                Ticket created successfully! We will get back to you soon
              </div>
            )}
            {error && <div className="text-red-500">{error}</div>}
            <ConfirmOverlay
              show={showOverlay}
              onClose={handleOverlayClose}
              title="Ticket created successfully!"
              message="Your ticket has been submitted and will be processed soon. We'll notify you when there's an update."
              buttonText="Close"
            />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    name="title"
                    value={ticketData.title}
                    onChange={handleChange}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={ticketData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Please provide a detailed description of the issue, including any error messages and steps to reproduce the problem..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Attach a file (optional)</Label>
                <Input
                  id="file"
                  type="file"
                  name="file"
                  ref={attachmentRef}
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 md:flex-none" disabled={isLoading}>
                  {isLoading ? 'Will create...' : 'Create Ticket'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 font-medium">Before submitting a ticket:</h4>
            <ul className="text-muted-foreground ml-4 space-y-1 text-sm">
              <li>Check our knowledge base for common solutions</li>
              <li>Restart your computer or application</li>
              <li>Try using a different browser or device</li>
              <li>Check your internet connection</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium">For faster resolution:</h4>
            <ul className="text-muted-foreground ml-4 space-y-1 text-sm">
              <li>Provide as much detail as possible</li>
              <li>Include screenshots if applicable</li>
              <li>Mention your operating system and browser</li>
              <li>Include any error messages exactly as they appear</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
