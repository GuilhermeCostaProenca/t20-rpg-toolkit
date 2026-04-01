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
  return (
    <select
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      disabled={disabled}
      className={cn(
        "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground",
        className
      )}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
