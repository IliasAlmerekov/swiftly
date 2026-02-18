import { memo, type ReactNode } from 'react';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

// ============ Types ============
interface SelectOption {
  value: string;
  label: string;
}

interface WorkflowFieldProps {
  /** Field label */
  label: string;
  /** Whether user can edit (staff mode) */
  isEditable: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Current value */
  value?: string;
  /** Display value when not editable */
  displayValue: ReactNode;
  /** Placeholder text for select */
  placeholder?: string;
  /** Options for select dropdown */
  options: SelectOption[];
  /** Called when value changes */
  onChange: (value: string) => void;
  /** Optional badge color class */
  badgeClassName?: string;
}

/**
 * Reusable workflow field component.
 * Renders either a select dropdown (editable) or a badge/text (read-only).
 *
 * Follows Single Responsibility Principle - only handles one field.
 * Wrapped with memo to prevent unnecessary re-renders.
 */
export const WorkflowField = memo(function WorkflowField({
  label,
  isEditable,
  disabled = false,
  value,
  displayValue,
  placeholder,
  options,
  onChange,
  badgeClassName,
}: WorkflowFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      {isEditable ? (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : typeof displayValue === 'string' ? (
        <Badge className={badgeClassName}>{displayValue}</Badge>
      ) : (
        displayValue
      )}
    </div>
  );
});

export default WorkflowField;
