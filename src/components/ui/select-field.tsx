import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SelectFieldOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function SelectField({ value, onValueChange, options, placeholder, className, disabled }: SelectFieldProps) {
  const normalizedValue = value || "__UNSELECTED__";

  return (
    <Select
      value={normalizedValue}
      onValueChange={(next) => onValueChange(next === "__UNSELECTED__" ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger className={cn(className)} disabled={disabled}>
        <SelectValue placeholder={placeholder || "Selecione"} />
      </SelectTrigger>
      <SelectContent>
        {placeholder ? <SelectItem value="__UNSELECTED__">{placeholder}</SelectItem> : null}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
