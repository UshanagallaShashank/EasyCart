// Username and phone number input fields
import { User, Phone } from 'lucide-react';

interface Props {
  username: string;
  phone: string;
  onUpdate: (key: 'username' | 'phone_number', val: string) => void;
}

export function UserCredentialFields({ username, phone, onUpdate }: Props) {
  return (
    <div className="space-y-2.5">
      <div className="relative flex items-center">
        <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => onUpdate('username', e.target.value)}
          placeholder="Owner username"
          required
          className="w-full text-xs h-10 pl-10 pr-3.5 rounded-xl bg-slate-100/80 border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>
      <div className="relative flex items-center">
        <Phone className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="phone_number"
          type="tel"
          value={phone}
          onChange={(e) => onUpdate('phone_number', e.target.value)}
          placeholder="Phone number"
          required
          className="w-full text-xs h-10 pl-10 pr-3.5 rounded-xl bg-slate-100/80 border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
