import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";
import ManagerSelect from "./ManagerSelect";
import type { User } from "@/types";
import { memo, useCallback } from "react";

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
  const handleManagerChange = useCallback(
    (value: string) => {
      onInputChange("manager", value);
    },
    [onInputChange]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Personal Information
        </CardTitle>
        {currentUser?.role === "admin" ? (
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={editMode ? onSave : onEdit}
          >
            {editMode ? "Save" : "Edit"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Full Name
            </Label>
            {editMode ? (
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={formData.name || ""}
                onChange={(e) => onInputChange("name", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="text-[var(--ring)] mt-1">{user.name}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Email</p>
            <p className="text-[var(--ring)] mt-1">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label
              htmlFor="company"
              className="text-sm font-medium text-foreground"
            >
              Company
            </Label>
            {editMode ? (
              <Input
                id="company"
                name="company"
                autoComplete="organization"
                value={formData.company || ""}
                onChange={(e) => onInputChange("company", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="text-[var(--ring)] mt-1">{user.company || "N/A"}</p>
            )}
          </div>
          <div>
            <Label
              htmlFor="department"
              className="text-sm font-medium text-foreground"
            >
              Department
            </Label>
            {editMode ? (
              <Input
                id="department"
                name="department"
                value={formData.department || ""}
                onChange={(e) => onInputChange("department", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="text-[var(--ring)] mt-1">
                {user.department || "N/A"}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="position"
              className="text-sm font-medium text-foreground"
            >
              Position
            </Label>
            {editMode ? (
              <Input
                id="position"
                name="position"
                value={formData.position || ""}
                onChange={(e) => onInputChange("position", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="text-[var(--ring)] mt-1">
                {user.position || "N/A"}
              </p>
            )}
          </div>
          <div>
            <span className="text-sm font-medium text-foreground">Manager</span>
            {editMode ? (
              <ManagerSelect
                selectedManagerId={selectedManagerId}
                allUsers={allUsers}
                disabled={!editMode}
                onValueChange={handleManagerChange}
              />
            ) : (
              <div className="flex items-center gap-2 p-2">
                <Avatar>
                  <AvatarImage
                    src={user.manager?.avatar?.url || ""}
                    alt={user.manager?.name || "Manager"}
                  />
                </Avatar>
                <p className="text-[var(--ring)] mt-1">
                  {user.manager?.name || "N/A"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Address Section */}
        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label
                htmlFor="country"
                className="text-sm font-medium text-foreground"
              >
                Country
              </Label>
              {editMode ? (
                <Input
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  value={formData.country || ""}
                  onChange={(e) => onInputChange("country", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-[var(--ring)] mt-1">
                  {user.country || "N/A"}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="city"
                className="text-sm font-medium text-foreground"
              >
                City
              </Label>
              {editMode ? (
                <Input
                  id="city"
                  name="city"
                  value={formData.city || ""}
                  autoComplete="address-level2"
                  onChange={(e) => onInputChange("city", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-[var(--ring)] mt-1">{user.city || "N/A"}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="address"
                className="text-sm font-medium text-foreground"
              >
                Address
              </Label>
              {editMode ? (
                <Input
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  value={formData.address || ""}
                  onChange={(e) => onInputChange("address", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-[var(--ring)] mt-1">
                  {user.address || "N/A"}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="postalCode"
                className="text-sm font-medium text-foreground"
              >
                Postal Code
              </Label>
              {editMode ? (
                <Input
                  id="postalCode"
                  name="postalCode"
                  type="number"
                  autoComplete="postal-code"
                  value={
                    formData.postalCode ? formData.postalCode.toString() : ""
                  }
                  onChange={(e) => onInputChange("postalCode", e.target.value)}
                  className="mt-1"
                  min="1"
                />
              ) : (
                <p className="text-[var(--ring)] mt-1">
                  {user.postalCode || "N/A"}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default PersonalInformationSection;
