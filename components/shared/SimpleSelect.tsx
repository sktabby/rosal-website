"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SimpleOption {
  value: string;
  label: string;
}

export default function SimpleSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  error,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SimpleOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger error={error}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
