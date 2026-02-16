import { memo, useMemo } from 'react';
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

// ============ Constants ============
const STATUS_OPTIONS: { value: Ticket['status']; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// ============ Types ============
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

// ============ Sub-components ============
interface WorkflowFieldProps {
  label: string;
  children: React.ReactNode;
}

const WorkflowField = memo(function WorkflowField({ label, children }: WorkflowFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      {children}
    </div>
  );
});

// ============ Main Component ============
/**
 * Ticket workflow card component.
 *
 * Follows bulletproof-react patterns:
 * - Memoized with extracted sub-components
 * - Configuration-driven options
 * - Clear separation between staff and user views
 */
export const TicketWorkflowCard = memo(function TicketWorkflowCard({
  ticket,
  isStaff,
  currentUserId,
  adminUsers,
  onStatusChange,
  onAssignTicket,
  onPriorityChange,
  onCategoryChange,
  isUpdating = false,
}: TicketWorkflowCardProps) {
  const priorityLabel = ticket.priority ?? 'untriaged';
  const normalizedCategory = normalizeCategoryValue(ticket.category);

  const categoryOptions = useMemo(() => {
    if (!ticket.category) return CATEGORY_OPTIONS;

    const exists = CATEGORY_OPTIONS.some(
      (option) =>
        option.value === normalizedCategory ||
        option.label.toLowerCase() === (ticket.category ?? '').trim().toLowerCase(),
    );

    return exists
      ? CATEGORY_OPTIONS
      : [{ value: ticket.category, label: ticket.category }, ...CATEGORY_OPTIONS];
  }, [ticket.category, normalizedCategory]);

  const assigneeOptions = useMemo(() => {
    const options = adminUsers
      .filter((admin) => admin._id !== currentUserId)
      .map((admin) => ({ value: admin._id, label: admin.name }));

    if (currentUserId) {
      options.unshift({ value: currentUserId, label: 'Assign to me' });
    }

    return options;
  }, [adminUsers, currentUserId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <WorkflowField label="Status">
          {isStaff ? (
            <Select value={ticket.status} onValueChange={onStatusChange} disabled={isUpdating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge className={`${getStatusColor(ticket.status)} capitalize`}>{ticket.status}</Badge>
          )}
        </WorkflowField>

        {/* Assignee */}
        <WorkflowField label="Assignee">
          {isStaff ? (
            <Select onValueChange={onAssignTicket} disabled={isUpdating}>
              <SelectTrigger>
                <SelectValue placeholder={ticket.assignedTo?.name || 'Unassigned'} />
              </SelectTrigger>
              <SelectContent>
                {assigneeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm">{ticket.assignedTo?.name || 'Unassigned'}</p>
          )}
        </WorkflowField>

        {/* Priority */}
        <WorkflowField label="Priority">
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
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge className={`${getPriorityColor(priorityLabel)} capitalize`}>
              {priorityLabel}
            </Badge>
          )}
        </WorkflowField>

        {/* Category */}
        <WorkflowField label="Category">
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
        </WorkflowField>
      </CardContent>
    </Card>
  );
});
