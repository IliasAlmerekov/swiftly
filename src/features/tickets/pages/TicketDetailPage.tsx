import { addComment, getAdminUsers, getTicketById, updateTicket } from '@/api/api';
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
import type { Ticket, UpdateTicketFormData, User } from '@/types';
import { jwtDecode } from 'jwt-decode';
import { TicketIcon, ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import konto from '@/assets/konto.png';

const STATUS_OPTIONS: Ticket['status'][] = ['open', 'in-progress', 'resolved', 'closed'];

interface EditingTicketState {
  title: string;
  description: string;
  priority: Ticket['priority'];
}

const INITIAL_EDITED_TICKET: EditingTicketState = {
  title: '',
  description: '',
  priority: 'low',
};

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  name: string;
}

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  // State
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  // UI State
  const [statusDropDown, setStatusDropDown] = useState<boolean>(false);
  const [assignDropDownOpen, setAssignDropDownOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTicket, setEditedTicket] = useState<EditingTicketState>(INITIAL_EDITED_TICKET);

  // Helper functions for user authentication
  const getUserFromToken = (): User | null => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        return {
          _id: decoded.id,
          email: decoded.email,
          role: decoded.role as 'user' | 'admin',
          name: decoded.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.error('Invalid token', err);
        return null;
      }
    }
    return null;
  };

  // Load user data from token
  useEffect(() => {
    const userData = getUserFromToken();
    setCurrentUser(userData);
  }, []);

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
          priority: ticketData.priority,
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
      if (currentUser?.role === 'admin') {
        try {
          const response = await getAdminUsers();
          setAdminUsers(response.users);
        } catch (err) {
          console.error('Failed to load admin users:', err);
        }
      }
    };

    loadAdminUsers();
  }, [currentUser]);

  const isAdmin = (): boolean => {
    return currentUser?.role === 'admin';
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
    const success = await updateTicketAndRefresh({ status }, 'Failed to update ticket status');
    if (success) setStatusDropDown(false);
  };

  const handleAssignTicket = async (userId: string) => {
    const success = await updateTicketAndRefresh({ assignedTo: userId }, 'Failed to assign ticket');
    if (success) setAssignDropDownOpen(false);
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
    const success = await updateTicketAndRefresh(editedTicket, 'Failed to update ticket');
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

  return (
    <div className="@container/main flex-1 overflow-auto p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TicketIcon className="text-primary h-6 w-6" />
            <h1 className="text-2xl font-bold">Ticket {ticket._id.substring(0, 8)}</h1>
          </div>
          <Button variant="outline" onClick={goBack}>
            ← Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-muted-foreground text-2xl font-bold">Title:</h2>
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl text-[var(--chart-4)]">{ticket?.title}</span>
              {(isAdmin() || currentUser?._id === ticket.owner?._id) && (
                <Button variant="outline" onClick={handleEditToggle}>
                  {isEditing ? 'Cancel' : 'Edit Ticket'}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="flex items-center space-x-4">
                <Badge
                  variant={
                    ticket.priority === 'low'
                      ? 'secondary'
                      : ticket.priority === 'medium'
                        ? 'default'
                        : 'destructive'
                  }
                >
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                </Badge>
                <div className="relative">
                  <Badge
                    variant={
                      ticket.status === 'open'
                        ? 'default'
                        : ticket.status === 'in-progress'
                          ? 'secondary'
                          : ticket.status === 'resolved'
                            ? 'outline'
                            : 'destructive'
                    }
                    className="cursor-pointer"
                    onClick={() => setStatusDropDown(!statusDropDown)}
                  >
                    {ticket.status} <ChevronDown className="ml-1 h-3 w-3" />
                  </Badge>
                  {statusDropDown && isAdmin() && (
                    <div className="bg-popover absolute top-full z-10 mt-1 min-w-32 rounded-md border shadow-lg">
                      {STATUS_OPTIONS.map((status) => (
                        <div
                          key={status}
                          className="hover:bg-accent cursor-pointer px-3 py-2 text-sm"
                          onClick={() => handleStatusChange(status)}
                        >
                          {status}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form id="edit-ticket-form" className="space-y-4" onSubmit={handleEditSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={editedTicket.title}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={editedTicket.priority}
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
              </form>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground text-sm font-medium">Created by</Label>
                <p className="pt-3 text-sm">
                  <Avatar className="mr-2 inline-block h-8 w-8 overflow-hidden rounded-full align-middle">
                    <AvatarImage src={ticket.owner?.avatar?.url} alt={ticket.owner?.name} />
                  </Avatar>
                  {ticket.owner?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm font-medium">Created at</Label>
                <p className="pt-3 text-sm">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground text-sm font-medium">Assignment</Label>
                {ticket.assignedTo ? (
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm">{ticket.assignedTo.name}</p>
                    {isAdmin() && (
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAssignDropDownOpen(!assignDropDownOpen)}
                        >
                          Reassign <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                        {assignDropDownOpen && (
                          <div className="bg-popover absolute top-full z-10 mt-1 min-w-32 rounded-md border shadow-lg">
                            <div
                              className="hover:bg-accent cursor-pointer px-3 py-2 text-sm"
                              onClick={() => {
                                if (currentUser && currentUser._id) {
                                  handleAssignTicket(currentUser._id);
                                }
                              }}
                            >
                              Assign to me
                            </div>
                            {adminUsers.map(
                              (admin) =>
                                currentUser &&
                                admin._id !== currentUser._id && (
                                  <div
                                    key={admin._id}
                                    className="hover:bg-accent cursor-pointer px-3 py-2 text-sm"
                                    onClick={() => handleAssignTicket(admin._id)}
                                  >
                                    {admin.name}
                                  </div>
                                ),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : isAdmin() ? (
                  <div className="relative mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssignDropDownOpen(!assignDropDownOpen)}
                    >
                      Assign Ticket <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                    {assignDropDownOpen && (
                      <div className="bg-popover absolute top-full z-10 mt-1 min-w-32 rounded-md border shadow-lg">
                        <div
                          className="hover:bg-accent cursor-pointer px-3 py-2 text-sm"
                          onClick={() => {
                            if (currentUser && currentUser._id) {
                              handleAssignTicket(currentUser._id);
                            } else {
                              setError('User information not available');
                            }
                          }}
                        >
                          Assign to me
                        </div>
                        {adminUsers.map(
                          (admin) =>
                            currentUser &&
                            admin._id !== currentUser._id && (
                              <div
                                key={admin._id}
                                className="hover:bg-accent cursor-pointer px-3 py-2 text-sm"
                                onClick={() => handleAssignTicket(admin._id)}
                              >
                                {admin.name}
                              </div>
                            ),
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">Unassigned</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={editedTicket.description}
                    onChange={handleEditChange}
                    rows={4}
                    placeholder="Enter ticket description..."
                  />
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{ticket.description}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          <Avatar className="mr-2 inline-block h-8 w-8 overflow-hidden rounded-4xl align-middle">
                            <AvatarImage
                              src={comment.author?.avatar?.url || konto}
                              alt={comment.author?.name}
                            />
                          </Avatar>
                          {comment.author?.email || 'Unknown'}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No comments yet</p>
              )}
            </div>

            <Separator />

            <form className="space-y-4" onSubmit={handleAddComment}>
              <div className="space-y-2">
                <Label htmlFor="comment">Add Comment</Label>
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
              <Button type="submit">Add Comment</Button>
            </form>

            {isEditing && (
              <>
                <Separator />
                <div className="flex space-x-2">
                  <Button type="submit" form="edit-ticket-form" variant="default">
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={handleEditToggle}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketDetailPage;
