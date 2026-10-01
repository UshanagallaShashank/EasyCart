// Labelled auth form input with a leading icon, optional trailing control, and hint text.
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface AuthTextFieldProps {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange(value: string): void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  trailing?: ReactNode;
  hint?: ReactNode;
}

export function AuthTextField({ id, label, icon: Icon, value, onChange, type = 'text', placeholder, autoComplete, trailing, hint }: AuthTextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-3.5 size-4 text-slate-400" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-describedby={hint ? `${id}-hint` : undefined}
          required
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-11 pl-10 text-sm text-slate-900 shadow-2xs outline-none transition-colors placeholder:text-slate-400 focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
        />
        {trailing && <div className="absolute right-1.5">{trailing}</div>}
      </div>
      {hint && <p id={`${id}-hint`} className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
