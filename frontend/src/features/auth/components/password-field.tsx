// Password input field with toggleable show/hide eye button
import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id?: string;
}

export function PasswordField({ value, onChange, placeholder = 'Password', id = 'password' }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center">
      <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full text-xs h-10 pl-10 pr-10 rounded-xl bg-slate-100/80 border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
