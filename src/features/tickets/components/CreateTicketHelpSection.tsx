import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

/**
 * Help section component for CreateTicket page.
 * Provides tips and guidelines for creating tickets.
 *
 * Wrapped with memo as it's static content that never changes.
 */
export const CreateTicketHelpSection = memo(function CreateTicketHelpSection() {
  return (
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
  );
});

export default CreateTicketHelpSection;
