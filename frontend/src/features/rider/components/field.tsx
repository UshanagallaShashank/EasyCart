// Labelled input used across the rider forms, with an optional hint under it.
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: ReactNode;
}

export function Field({ id, label, hint, className, ...props }: FieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-slate-700">{label}{props.required && <span className="text-rose-500"> *</span>}</Label>
      <Input id={id} className={className} {...props} />
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
