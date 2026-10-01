// Labelled password input with a show/hide toggle.
import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { AuthTextField } from './auth-text-field';

interface PasswordFieldProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  isNew?: boolean;
  id?: string;
}

export function PasswordField({ value, onChange, label = 'Password', isNew = false, id = 'password' }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const toggle = (
    <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );

  return <AuthTextField id={id} label={label} icon={Lock} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={isNew ? 'At least 8 characters' : 'Your password'} autoComplete={isNew ? 'new-password' : 'current-password'} trailing={toggle} />;
}
