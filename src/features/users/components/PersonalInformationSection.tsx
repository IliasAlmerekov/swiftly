import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Avatar, AvatarImage } from '@/shared/components/ui/avatar';
import ManagerSelect from './ManagerSelect';
import type { User } from '@/types';
import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface PersonalInformationSectionProps {
  user: User;
  currentUser: User | null;
  editMode: boolean;
  formData: Partial<User>;
  selectedManagerId: string;
  allUsers: User[];
  onEdit: () => void;
  onSave: () => void;
  onInputChange: (field: keyof User, value: string | number) => void;
}

const PersonalInformationSection = memo(function PersonalInformationSection({
  user,
  currentUser,
  editMode,
  formData,
  selectedManagerId,
  allUsers,
  onEdit,
  onSave,
  onInputChange,
}: PersonalInformationSectionProps) {
  const navigate = useNavigate();
  const handleManagerChange = useCallback(
    (value: string) => {
      onInputChange('manager', value);
    },
    [onInputChange],
  );

  const handleUserClick = (userId: string): void => {
    navigate(`/users/${userId}`);
  };

  const handleOwnerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!selectedManagerId) {
      return;
    }

    handleUserClick(selectedManagerId);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-foreground text-lg font-semibold">
          Personal Information
        </CardTitle>
        {currentUser?.role === 'admin' ? (
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            onClick={editMode ? onSave : onEdit}
          >
            {editMode ? 'Save' : 'Edit'}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <Label htmlFor="name" className="text-foreground text-sm font-medium">
              Full Name
            </Label>
            {editMode ? (
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={formData.name || ''}
                onChange={(e) => onInputChange('name', e.target.value)}
                className="mt-1"
              />
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
                name="company"
                autoComplete="organization"
                value={formData.company || ''}
                onChange={(e) => onInputChange('company', e.target.value)}
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
              <Input
                id="department"
                name="department"
                value={formData.department || ''}
                onChange={(e) => onInputChange('department', e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-[var(--ring)]">{user.department || 'N/A'}</p>
            )}
          </div>
          <div>
            <Label htmlFor="position" className="text-foreground text-sm font-medium">
              Position
            </Label>
            {editMode ? (
              <Input
                id="position"
                name="position"
                value={formData.position || ''}
                onChange={(e) => onInputChange('position', e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-[var(--ring)]">{user.position || 'N/A'}</p>
            )}
          </div>
          <div>
            <span className="text-foreground text-sm font-medium">Manager</span>
            {editMode ? (
              <ManagerSelect
                selectedManagerId={selectedManagerId}
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
                <Button variant="secondary" className="cursor-pointer" onClick={handleOwnerClick}>
                  <p className="mt-1 text-white">{user.manager?.name || 'N/A'}</p>
                </Button>
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
                  name="country"
                  autoComplete="country-name"
                  value={formData.country || ''}
                  onChange={(e) => onInputChange('country', e.target.value)}
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
                  name="city"
                  value={formData.city || ''}
                  autoComplete="address-level2"
                  onChange={(e) => onInputChange('city', e.target.value)}
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
                  name="address"
                  autoComplete="street-address"
                  value={formData.address || ''}
                  onChange={(e) => onInputChange('address', e.target.value)}
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
                  name="postalCode"
                  type="number"
                  autoComplete="postal-code"
                  value={formData.postalCode ? formData.postalCode.toString() : ''}
                  onChange={(e) => onInputChange('postalCode', e.target.value)}
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
