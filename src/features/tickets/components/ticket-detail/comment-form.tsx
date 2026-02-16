import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
}

export const CommentForm = ({ onSubmit, isSubmitting = false }: CommentFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  const handleFormSubmit = (data: CommentFormData) => {
    onSubmit(data.content);
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add comment</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="comment">Message</Label>
            <Textarea
              id="comment"
              {...register('content')}
              placeholder="Add a comment..."
              rows={3}
              disabled={isSubmitting}
              aria-invalid={!!errors.content}
            />
            {errors.content && <p className="text-destructive text-sm">{errors.content.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post comment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
