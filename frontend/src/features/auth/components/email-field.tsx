// Labelled email input used by every login and registration form.
import { Mail } from 'lucide-react';
import { AuthTextField } from './auth-text-field';

export function EmailField({ value, onChange, id = 'email' }: { value: string; onChange: (val: string) => void; id?: string }) {
  return <AuthTextField id={id} label="Email" icon={Mail} type="email" value={value} onChange={onChange} placeholder="you@example.com" autoComplete="email" />;
}
