// Name and phone number inputs shared by merchant and customer registration.
import { User, Phone } from 'lucide-react';
import { AuthTextField } from './auth-text-field';

interface Props {
  username: string;
  phone: string;
  onUpdate: (key: 'username' | 'phone_number', val: string) => void;
}

export function UserCredentialFields({ username, phone, onUpdate }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AuthTextField id="username" label="Your name" icon={User} value={username} onChange={(v) => onUpdate('username', v)} placeholder="Asha Rao" autoComplete="name" />
      <AuthTextField id="phone_number" label="Phone" icon={Phone} type="tel" value={phone} onChange={(v) => onUpdate('phone_number', v)} placeholder="98765 43210" autoComplete="tel" />
    </div>
  );
}
