// Email input field with mail icon prefix
import { Mail } from 'lucide-react';

interface EmailFieldProps {
  value: string;
  onChange: (val: string) => void;
  id?: string;
}

export function EmailField({ value, onChange, id = 'email' }: EmailFieldProps) {
  return (
    <div className="relative flex items-center">
      <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        id={id}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Email address"
        required
        className="w-full text-xs h-10 pl-10 pr-3.5 rounded-xl bg-slate-100/80 border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
      />
    </div>
  );
}
