import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  placeholder?: string;
  error?: boolean;
}

export const CustomSelect = React.forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ className = '', options = [], placeholder, error, children, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={`appearance-none w-full h-9 pl-3 pr-8 rounded-sm border text-xs font-sans bg-card text-foreground transition-all duration-150 cursor-pointer select-none
            focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted
            ${
              error
                ? 'border-destructive focus:ring-destructive'
                : 'border-border hover:border-input'
            }
            ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-card text-foreground py-1"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center">
          <ChevronDown className="size-3.5 opacity-70" />
        </div>
      </div>
    );
  }
);

CustomSelect.displayName = 'CustomSelect';
