import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { Ticket } from '@/types';
import { useMemo } from 'react';

interface TicketStatsProps {
  tickets: Ticket[];
}

type Counters = Record<Ticket['status'], number>;

export function TicketStats({ tickets }: TicketStatsProps) {
  const counts = useMemo(() => {
    const initial: Counters = { open: 0, 'in-progress': 0, resolved: 0, closed: 0 };
    for (const ticket of tickets ?? []) {
      if (ticket.status in initial) initial[ticket.status as Ticket['status']] += 1;
    }
    return initial;
  }, [tickets]);

  return (
    <section
      aria-label="Ticket statistics"
      aria-live="polite"
      className="grid gap-4 md:grid-cols-4"
    >
      <StatCard title="Open Tickets" value={counts.open} />
      <StatCard title="In Progress" value={counts['in-progress']} />
      <StatCard title="Resolved" value={counts.resolved} />
      <StatCard title="Closed" value={counts.closed} />
    </section>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>
          <h3 className="text-sm font-medium">{title}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" aria-live="polite" aria-atomic="true">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
