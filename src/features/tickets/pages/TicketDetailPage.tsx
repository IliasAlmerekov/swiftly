import { getAdminUsers } from '@/shared/api';
import { addComment, getTicketById, updateTicket } from '@/features/tickets/api';
import { useAuthContext } from '@/shared/context/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import type { Ticket, UpdateTicketFormData, User } from '@/types';
import { TicketIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import konto from '@/assets/konto.png';
import {
  CATEGORY_OPTIONS,
  getPriorityColor,
  getStatusColor,
} from '@/features/tickets/utils/ticketUtils';

const STATUS_OPTIONS: Ticket['status'][] = ['open', 'in-progress', 'resolved', 'closed'];
const normalizeCategoryValue = (category?: string): string | undefined => {
  if (!category) return undefined;
  const trimmed = category.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.toLowerCase();
  const known = CATEGORY_OPTIONS.find(
    (option) =>
      option.value.toLowerCase() === normalized || option.label.toLowerCase() === normalized,
  );
  return known ? known.value : trimmed;
};

const formatCategoryLabel = (category?: string): string => {
  if (!category) return 'Not set';
  const trimmed = category.trim();
  if (!trimmed) return 'Not set';
  const normalized = trimmed.toLowerCase();
  const known = CATEGORY_OPTIONS.find(
    (option) =>
      option.value.toLowerCase() === normalized || option.label.toLowerCase() === normalized,
  );
  return known ? known.label : trimmed;
};

interface EditingTicketState {
  title: string;
  description: string;
  priority: Ticket['priority'];
  category: string;
}

const INITIAL_EDITED_TICKET: EditingTicketState = {
  title: '',
  description: '',
  priority: 'low',
  category: '',
};

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // State
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const currentUser: User | null = user
    ? {
        _id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        createdAt: '',
        updatedAt: '',
      }
    : null;
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  // UI State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTicket, setEditedTicket] = useState<EditingTicketState>(INITIAL_EDITED_TICKET);

  // Load ticket data
  useEffect(() => {
    const loadTicket = async () => {
      if (!ticketId) {
        setError('Ticket ID is required');
        setLoading(false);
        return;
      }

      try {
        const ticketData = await getTicketById(ticketId);
        setTicket(ticketData);
        setEditedTicket({
          title: ticketData.title,
          description: ticketData.description,
          priority: ticketData.priority ?? 'low',
          category: formatCategoryLabel(ticketData.category ?? ''),
        });
      } catch (err) {
        setError('Failed to load ticket');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId]);

  // Load admin users for assignment
  useEffect(() => {
    const loadAdminUsers = async () => {
      if (currentUser?.role === 'admin' || currentUser?.role === 'support1') {
        try {
          const response = await getAdminUsers();
          setAdminUsers(response.users);
        } catch (err) {
          console.error('Failed to load admin users:', err);
        }
      }
    };

    loadAdminUsers();
  }, [currentUser?.role]);

  const isStaff = (): boolean => {
    return currentUser?.role === 'admin' || currentUser?.role === 'support1';
  };

  const updateTicketAndRefresh = async (
    updateData: Partial<UpdateTicketFormData>,
    errorMessage: string,
  ): Promise<boolean> => {
    if (!ticketId) return false;

    try {
      await updateTicket(ticketId, updateData);
      const updatedTicket = await getTicketById(ticketId);
      setTicket(updatedTicket);
      return true;
    } catch (err) {
      setError(errorMessage);
      console.error(err);
      return false;
    }
  };

  const handleStatusChange = async (status: Ticket['status']) => {
    await updateTicketAndRefresh({ status }, 'Failed to update ticket status');
  };

  const handleAssignTicket = async (userId: string) => {
    await updateTicketAndRefresh({ assignedTo: userId }, 'Failed to assign ticket');
  };

  const handlePriorityChange = async (priority: Ticket['priority']) => {
    await updateTicketAndRefresh({ priority }, 'Failed to update ticket priority');
  };

  const handleCategoryChange = async (category: string) => {
    await updateTicketAndRefresh(
      { category: normalizeCategoryValue(category) },
      'Failed to update ticket category',
    );
  };

  const handleEditToggle = (): void => {
    setIsEditing(!isEditing);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedTicket((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatePayload: Partial<UpdateTicketFormData> = {
      title: editedTicket.title,
      description: editedTicket.description,
    };
    if (isStaff()) {
      updatePayload.priority = editedTicket.priority;
      updatePayload.category = normalizeCategoryValue(editedTicket.category);
    }
    const success = await updateTicketAndRefresh(updatePayload, 'Failed to update ticket');
    if (success) {
      setIsEditing(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comment.trim() || !ticketId) return;

    try {
      await addComment(ticketId, comment);
      setComment('');

      const updatedTicket = await getTicketById(ticketId);
      setTicket(updatedTicket);
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  const goBack = (): void => {
    navigate(-1);
  };

  const getInitials = (value?: string) => {
    if (!value) return 'U';
    const parts = value.trim().split(' ');
    const letters = parts
      .map((part) => part[0])
      .slice(0, 2)
      .join('');
    return letters.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="py-8 text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="py-8 text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="py-8 text-center text-red-500">Ticket not found</div>
      </div>
    );
  }

  const priorityLabel = ticket.priority ?? 'untriaged';
  const canEdit = isStaff() || currentUser?._id === ticket.owner?._id;
  const commentCount = ticket.comments?.length ?? 0;
  const formattedCreatedAt = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—';
  const formattedUpdatedAt = ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '—';
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
  const attachments = ticket.attachments ?? [];

  return (
    <div className="@container/main flex-1 overflow-auto p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <TicketIcon className="text-primary h-4 w-4" />
              Ticket #{ticket._id.substring(0, 8)}
            </div>
            <h1 className="text-2xl font-semibold">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${getPriorityColor(priorityLabel)} capitalize`}>
                {priorityLabel} priority
              </Badge>
              <Badge className={`${getStatusColor(ticket.status)} capitalize`}>
                {ticket.status}
              </Badge>
              {ticket.category && (
                <Badge variant="outline">{formatCategoryLabel(ticket.category)}</Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={goBack}>
              Back
            </Button>
            {canEdit && !isEditing && <Button onClick={handleEditToggle}>Edit</Button>}
            {isEditing && (
              <>
                <Button type="submit" form="edit-ticket-form">
                  Save
                </Button>
                <Button variant="outline" onClick={handleEditToggle}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Tabs defaultValue="details">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments">Comments ({commentCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {isEditing ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit ticket</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        id="edit-ticket-form"
                        className="grid gap-4"
                        onSubmit={handleEditSubmit}
                      >
                        <div className="grid gap-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            name="title"
                            value={editedTicket.title}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={editedTicket.description}
                            onChange={handleEditChange}
                            rows={5}
                            placeholder="Enter ticket description..."
                          />
                        </div>
                        {isStaff() && (
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor="priority">Priority</Label>
                              <Select
                                value={editedTicket.priority ?? 'low'}
                                onValueChange={(value) =>
                                  setEditedTicket((prev) => ({
                                    ...prev,
                                    priority: value as Ticket['priority'],
                                  }))
                                }
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
                                name="category"
                                value={editedTicket.category}
                                onChange={handleEditChange}
                                placeholder="e.g. Hardware, Access, Software"
                              />
                            </div>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Ticket details</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Created</Label>
                          <p className="text-sm">{formattedCreatedAt}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Last updated</Label>
                          <p className="text-sm">{formattedUpdatedAt}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Requester</Label>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={ticket.owner?.avatar?.url}
                                alt={ticket.owner?.name}
                              />
                              <AvatarFallback>{getInitials(ticket.owner?.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {ticket.owner?.name || 'Unknown'}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {ticket.owner?.email || '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Category</Label>
                          <p className="text-sm">{formatCategoryLabel(ticket.category)}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{ticket.description}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Attachments</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {attachments.length > 0 ? (
                          attachments.map((attachment, index) => {
                            const displayName =
                              attachment.name || attachment.filename || `Attachment ${index + 1}`;
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
                  </>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {commentCount > 0 ? (
                      <div className="space-y-3">
                        {ticket.comments.map((entry) => (
                          <div key={entry._id} className="rounded-lg border p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage
                                    src={entry.author?.avatar?.url || konto}
                                    alt={entry.author?.name}
                                  />
                                  <AvatarFallback>
                                    {getInitials(entry.author?.name || entry.author?.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {entry.author?.name || entry.author?.email || 'Unknown'}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {entry.author?.email || '—'}
                                  </p>
                                </div>
                              </div>
                              <span className="text-muted-foreground text-xs">
                                {new Date(entry.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <Separator className="my-3" />
                            <p className="text-sm">{entry.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No comments yet.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Add comment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleAddComment}>
                      <div className="space-y-2">
                        <Label htmlFor="comment">Message</Label>
                        <Textarea
                          id="comment"
                          value={comment}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setComment(e.target.value)
                          }
                          placeholder="Add a comment..."
                          rows={3}
                          required
                        />
                      </div>
                      <Button type="submit">Post comment</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  {isStaff() ? (
                    <Select value={ticket.status} onValueChange={handleStatusChange}>
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
                    <Badge className={`${getStatusColor(ticket.status)} capitalize`}>
                      {ticket.status}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Assignee</Label>
                  {isStaff() ? (
                    <Select onValueChange={handleAssignTicket}>
                      <SelectTrigger>
                        <SelectValue placeholder={ticket.assignedTo?.name || 'Unassigned'} />
                      </SelectTrigger>
                      <SelectContent>
                        {currentUser?._id && (
                          <SelectItem value={currentUser._id}>Assign to me</SelectItem>
                        )}
                        {adminUsers
                          .filter((admin) => admin._id !== currentUser?._id)
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
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Priority</Label>
                  {isStaff() ? (
                    <Select
                      value={ticket.priority ?? undefined}
                      onValueChange={(value) => handlePriorityChange(value as Ticket['priority'])}
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
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Category</Label>
                  {isStaff() ? (
                    <Select value={normalizedCategory} onValueChange={handleCategoryChange}>
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

            <Card>
              <CardHeader>
                <CardTitle>Requester</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={ticket.owner?.avatar?.url} alt={ticket.owner?.name} />
                  <AvatarFallback>{getInitials(ticket.owner?.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{ticket.owner?.name || 'Unknown'}</p>
                  <p className="text-muted-foreground text-xs">{ticket.owner?.email || '—'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
