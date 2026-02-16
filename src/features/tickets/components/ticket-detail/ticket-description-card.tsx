import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface TicketDescriptionCardProps {
  description: string;
}

export const TicketDescriptionCard = ({ description }: TicketDescriptionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};
