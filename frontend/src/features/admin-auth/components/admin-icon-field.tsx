// Icon-prefixed input in the same style as the other auth fields, for admin username and passcode.
import type { LucideIcon } from 'lucide-react';

interface AdminIconFieldProps {
  id: string;
  icon: LucideIcon;
  value: string;
  onChange(value: string): void;
  placeholder: string;
  type?: string;
}

export function AdminIconField({ id, icon: Icon, value, onChange, placeholder, type = 'text' }: AdminIconFieldProps) {
  return (
    <div className="relative flex items-center">
      <Icon className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'off' : 'username'}
        aria-label={placeholder}
        required
        className="w-full text-xs h-10 pl-10 pr-3.5 rounded-xl bg-slate-100/80 border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
      />
    </div>
  );
}
