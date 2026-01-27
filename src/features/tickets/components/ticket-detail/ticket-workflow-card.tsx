import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { Ticket, User } from '@/types';
import {
  CATEGORY_OPTIONS,
  getPriorityColor,
  getStatusColor,
  normalizeCategoryValue,
  formatCategoryLabel,
} from '@/features/tickets/utils/ticketUtils';

const STATUS_OPTIONS: Ticket['status'][] = ['open', 'in-progress', 'resolved', 'closed'];

interface TicketWorkflowCardProps {
  ticket: Ticket;
  isStaff: boolean;
  currentUserId?: string;
  adminUsers: User[];
  onStatusChange: (status: Ticket['status']) => void;
  onAssignTicket: (userId: string) => void;
  onPriorityChange: (priority: Ticket['priority']) => void;
  onCategoryChange: (category: string) => void;
  isUpdating?: boolean;
}

export const TicketWorkflowCard = ({
  ticket,
  isStaff,
  currentUserId,
  adminUsers,
  onStatusChange,
  onAssignTicket,
  onPriorityChange,
  onCategoryChange,
  isUpdating = false,
}: TicketWorkflowCardProps) => {
  const priorityLabel = ticket.priority ?? 'untriaged';
  const normalizedCategory = normalizeCategoryValue(ticket.category);

  const categoryOptions = ticket.category
    ? CATEGORY_OPTIONS.some(
        (option) =>
          option.value === normalizedCategory ||
          option.label.toLowerCase() === (ticket.category ?? '').trim().toLowerCase(),
      )
      ? CATEGORY_OPTIONS
      : [{ value: ticket.category, label: ticket.category }, ...CATEGORY_OPTIONS]
    : CATEGORY_OPTIONS;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Status</Label>
          {isStaff ? (
            <Select value={ticket.status} onValueChange={onStatusChange} disabled={isUpdating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge className={`${getStatusColor(ticket.status)} capitalize`}>{ticket.status}</Badge>
          )}
        </div>

        {/* Assignee */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Assignee</Label>
          {isStaff ? (
            <Select onValueChange={onAssignTicket} disabled={isUpdating}>
              <SelectTrigger>
                <SelectValue placeholder={ticket.assignedTo?.name || 'Unassigned'} />
              </SelectTrigger>
              <SelectContent>
                {currentUserId && <SelectItem value={currentUserId}>Assign to me</SelectItem>}
                {adminUsers
                  .filter((admin) => admin._id !== currentUserId)
                  .map((admin) => (
                    <SelectItem key={admin._id} value={admin._id}>
                      {admin.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm">{ticket.assignedTo?.name || 'Unassigned'}</p>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Priority</Label>
          {isStaff ? (
            <Select
              value={ticket.priority ?? undefined}
              onValueChange={(value) => onPriorityChange(value as Ticket['priority'])}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className={`${getPriorityColor(priorityLabel)} capitalize`}>
              {priorityLabel}
            </Badge>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Category</Label>
          {isStaff ? (
            <Select
              value={normalizedCategory}
              onValueChange={onCategoryChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline">{formatCategoryLabel(ticket.category)}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
