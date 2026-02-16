import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { Ticket } from '@/types';

const ticketEditSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
});

export type TicketEditFormData = z.infer<typeof ticketEditSchema>;

interface TicketEditFormProps {
  ticket: Ticket;
  isStaff: boolean;
  onSubmit: (data: TicketEditFormData) => void;
  isSubmitting?: boolean;
}

export const TicketEditForm = ({
  ticket,
  isStaff,
  onSubmit,
  isSubmitting = false,
}: TicketEditFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TicketEditFormData>({
    resolver: zodResolver(ticketEditSchema),
    defaultValues: {
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority ?? 'low',
      category: ticket.category ?? '',
    },
  });

  const priority = watch('priority');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="edit-ticket-form" className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              disabled={isSubmitting}
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={5}
              placeholder="Enter ticket description..."
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>
          {isStaff && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority ?? 'low'}
                  onValueChange={(value) =>
                    setValue('priority', value as 'low' | 'medium' | 'high')
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="e.g. Hardware, Access, Software"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
