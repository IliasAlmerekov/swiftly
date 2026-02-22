import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { CATEGORY_OPTIONS } from '@/features/tickets/utils/ticketUtils';

// ============ Validation Schema ============
const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
});

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;

const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024;

// ============ Types ============
interface CreateTicketFormProps {
  isStaff: boolean;
  onSubmit: (data: CreateTicketFormData, attachment: File | null) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  success?: boolean;
}

// ============ Main Component ============
/**
 * Create ticket form component using react-hook-form.
 *
 * Follows bulletproof-react patterns:
 * - react-hook-form isolates form state preventing parent re-renders
 * - Zod schema for validation
 * - Single Responsibility: Only handles form rendering and validation
 */
export const CreateTicketForm = memo(function CreateTicketForm({
  isStaff,
  onSubmit,
  isSubmitting = false,
  error,
  success,
}: CreateTicketFormProps) {
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const attachmentRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: undefined,
      category: undefined,
    },
  });

  // Reset form on success
  useEffect(() => {
    if (success) {
      reset();
      setAttachment(null);
      setAttachmentError(null);
      if (attachmentRef.current) {
        attachmentRef.current.value = '';
      }
    }
  }, [success, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setAttachment(null);
      setAttachmentError(null);
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      setAttachmentError('File size must not exceed 25MB');
      setAttachment(null);
      if (attachmentRef.current) {
        attachmentRef.current.value = '';
      }
      return;
    }

    setAttachmentError(null);
    setAttachment(file);
  };

  const handleFormSubmit = useCallback(
    async (data: CreateTicketFormData) => {
      // For non-staff, only send title and description
      const payload = isStaff ? data : { title: data.title, description: data.description };
      await onSubmit(payload as CreateTicketFormData, attachment);
    },
    [isStaff, onSubmit, attachment],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Support Ticket</CardTitle>
        <CardDescription>Fill out the form below to submit a new support request</CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 text-green-500">
            Ticket created successfully! We will get back to you soon
          </div>
        )}
        {error && <div className="mb-4 text-red-500">{error}</div>}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                {...register('title')}
                placeholder="Brief description of the issue"
                aria-invalid={!!errors.title}
                disabled={isSubmitting}
              />
              {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>

            {/* Priority Field (Staff only) */}
            {isStaff && (
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={6}
              placeholder="Please provide a detailed description of the issue, including any error messages and steps to reproduce the problem..."
              className="min-h-[120px]"
              aria-invalid={!!errors.description}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>

          {/* Category Field (Staff only) */}
          {isStaff && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          )}

          {/* Attachment Field */}
          <div className="space-y-2">
            <Label htmlFor="file">Attach a file (optional)</Label>
            <Input
              id="file"
              type="file"
              name="file"
              ref={attachmentRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.mp3,.mp4"
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-xs">
              Max size 25MB. Supported: jpg, png, gif, webp, pdf, doc/docx, xls/xlsx, mp3, mp4.
            </p>
            {attachmentError && <p className="text-destructive text-sm">{attachmentError}</p>}
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1 md:flex-none" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

export default CreateTicketForm;
