import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Avatar, AvatarImage } from '@/shared/components/ui/avatar';
import ManagerSelect from './ManagerSelect';
import type { User } from '@/types';
import { memo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { paths } from '@/config/paths';

/**
 * Schema for profile form validation
 */
const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  manager: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface PersonalInformationSectionProps {
  user: User;
  currentUser: User | null;
  allUsers: User[];
  onSave: (data: ProfileFormData) => Promise<void>;
  onError?: (message: string) => void;
}

/**
 * Personal information form section with isolated form state.
 * Uses react-hook-form to prevent parent re-renders on input changes.
 */
const PersonalInformationSection = memo(function PersonalInformationSection({
  user,
  currentUser,
  allUsers,
  onSave,
  onError,
}: PersonalInformationSectionProps) {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'support1';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      company: user.company || '',
      department: user.department || '',
      position: user.position || '',
      manager: user.manager?._id || '',
      country: user.country || '',
      city: user.city || '',
      address: user.address || '',
      postalCode: user.postalCode?.toString() || '',
    },
  });

  // Sync form with user data when user prop changes
  useEffect(() => {
    reset({
      name: user.name || '',
      company: user.company || '',
      department: user.department || '',
      position: user.position || '',
      manager: user.manager?._id || '',
      country: user.country || '',
      city: user.city || '',
      address: user.address || '',
      postalCode: user.postalCode?.toString() || '',
    });
  }, [user, reset]);

  const selectedManagerId = watch('manager');

  const handleManagerChange = useCallback(
    (value: string) => {
      if (value === user._id) {
        onError?.('A user cannot be their own manager');
        return;
      }
      setValue('manager', value);
    },
    [setValue, user._id, onError],
  );

  const handleUserClick = (userId: string): void => {
    navigate(paths.app.user.getHref(userId));
  };

  const handleOwnerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!selectedManagerId) return;
    handleUserClick(selectedManagerId);
  };

  const handleEdit = useCallback(() => {
    setEditMode(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditMode(false);
    reset({
      name: user.name || '',
      company: user.company || '',
      department: user.department || '',
      position: user.position || '',
      manager: user.manager?._id || '',
      country: user.country || '',
      city: user.city || '',
      address: user.address || '',
      postalCode: user.postalCode?.toString() || '',
    });
  }, [reset, user]);

  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      setIsSaving(true);
      try {
        await onSave(data);
        setEditMode(false);
      } finally {
        setIsSaving(false);
      }
    },
    [onSave],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-foreground text-lg font-semibold">
          Personal Information
        </CardTitle>
        {isAdmin && (
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <Label htmlFor="name" className="text-foreground text-sm font-medium">
              Full Name
            </Label>
            {editMode ? (
              <>
                <Input
                  id="name"
                  autoComplete="name"
                  {...register('name')}
                  className="mt-1"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
              </>
            ) : (
              <p className="mt-1 text-[var(--ring)]">{user.name}</p>
            )}
          </div>
          <div>
            <p className="text-foreground mb-1 text-sm font-medium">Email</p>
            <p className="mt-1 text-[var(--ring)]">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <Label htmlFor="company" className="text-foreground text-sm font-medium">
              Company
            </Label>
            {editMode ? (
              <Input
                id="company"
                autoComplete="organization"
                {...register('company')}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-[var(--ring)]">{user.company || 'N/A'}</p>
            )}
          </div>
          <div>
            <Label htmlFor="department" className="text-foreground text-sm font-medium">
              Department
            </Label>
            {editMode ? (
              <Input id="department" {...register('department')} className="mt-1" />
            ) : (
              <p className="mt-1 text-[var(--ring)]">{user.department || 'N/A'}</p>
            )}
          </div>
          <div>
            <Label htmlFor="position" className="text-foreground text-sm font-medium">
              Position
            </Label>
            {editMode ? (
              <Input id="position" {...register('position')} className="mt-1" />
            ) : (
              <p className="mt-1 text-[var(--ring)]">{user.position || 'N/A'}</p>
            )}
          </div>
          <div>
            <span className="text-foreground text-sm font-medium">Manager</span>
            {editMode ? (
              <ManagerSelect
                selectedManagerId={selectedManagerId || ''}
                allUsers={allUsers}
                disabled={!editMode}
                onValueChange={handleManagerChange}
              />
            ) : (
              <div className="flex items-center gap-2 pt-2">
                {user.manager?.avatar?.url && (
                  <Avatar>
                    <AvatarImage
                      src={user.manager?.avatar?.url || ''}
                      alt={user.manager?.name || 'Manager'}
                    />
                  </Avatar>
                )}
                {isStaff ? (
                  <Button variant="secondary" className="cursor-pointer" onClick={handleOwnerClick}>
                    <p className="mt-1 text-white">{user.manager?.name || 'N/A'}</p>
                  </Button>
                ) : (
                  <p className="mt-1 text-[var(--ring)]">{user.manager?.name || 'N/A'}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Address Section */}
        <div className="border-t pt-4">
          <h3 className="text-foreground mb-4 text-lg font-semibold">Address Information</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <Label htmlFor="country" className="text-foreground text-sm font-medium">
                Country
              </Label>
              {editMode ? (
                <Input
                  id="country"
                  autoComplete="country-name"
                  {...register('country')}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-[var(--ring)]">{user.country || 'N/A'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="city" className="text-foreground text-sm font-medium">
                City
              </Label>
              {editMode ? (
                <Input
                  id="city"
                  autoComplete="address-level2"
                  {...register('city')}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-[var(--ring)]">{user.city || 'N/A'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address" className="text-foreground text-sm font-medium">
                Address
              </Label>
              {editMode ? (
                <Input
                  id="address"
                  autoComplete="street-address"
                  {...register('address')}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-[var(--ring)]">{user.address || 'N/A'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="postalCode" className="text-foreground text-sm font-medium">
                Postal Code
              </Label>
              {editMode ? (
                <Input
                  id="postalCode"
                  type="number"
                  autoComplete="postal-code"
                  {...register('postalCode')}
                  className="mt-1"
                  min="1"
                />
              ) : (
                <p className="mt-1 text-[var(--ring)]">{user.postalCode || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default PersonalInformationSection;

export type { ProfileFormData };
