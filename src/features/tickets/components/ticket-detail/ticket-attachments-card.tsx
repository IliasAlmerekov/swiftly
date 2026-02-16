import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import type { TicketAttachment } from '@/types';

interface TicketAttachmentsCardProps {
  attachments: TicketAttachment[];
}

export const TicketAttachmentsCard = ({ attachments }: TicketAttachmentsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {attachments.length > 0 ? (
          attachments.map((attachment, index) => {
            const displayName = attachment.name || attachment.filename || `Attachment ${index + 1}`;
            return (
              <div
                key={attachment._id ?? `${displayName}-${index}`}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  {attachment.uploadedAt && (
                    <p className="text-muted-foreground text-xs">
                      {new Date(attachment.uploadedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                {attachment.url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={attachment.url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-muted-foreground text-sm">No files attached.</p>
        )}
      </CardContent>
    </Card>
  );
};
