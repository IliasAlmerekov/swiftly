import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Pen, Upload } from 'lucide-react';
import { memo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import type { User } from '@/types';

interface UserCardProps {
  user: User;
  isViewingOtherUser?: boolean;
  onAvatarUpload: (file: File) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
  uploadingAvatar: boolean;
}

const UserCard = memo(function UserCard({
  user,
  isViewingOtherUser = false,
  onAvatarUpload,
  onAvatarRemove,
  uploadingAvatar,
}: UserCardProps) {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAvatarUpload(file);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-55 w-55">
              <AvatarImage src={user.avatar?.url || ''} alt="Profile" />
              <AvatarFallback className="text-4xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="relative">
              {!isViewingOtherUser && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-muted absolute -top-20 -right-2 h-8 w-8 rounded-full p-0 shadow-md"
                      disabled={uploadingAvatar}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4" side="right" align="start">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Change Avatar</h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start bg-transparent"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          disabled={uploadingAvatar}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {uploadingAvatar ? 'Uploading...' : 'Upload new photo'}
                        </Button>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileSelect}
                          disabled={uploadingAvatar}
                        />
                        {user.avatar?.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive w-full justify-start"
                            onClick={onAvatarRemove}
                            disabled={uploadingAvatar}
                          >
                            Remove photo
                          </Button>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-foreground text-3xl font-semibold">{user.name}</h1>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              {user.position && <p className="text-muted-foreground text-sm">{user.position}</p>}
              {(user.city || user.country) && (
                <p className="text-muted-foreground text-sm">
                  {[user.city, user.country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default UserCard;
