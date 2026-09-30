import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomerRegister } from '../hooks/use-customer-register';
import { ApiError } from '@/shared/api/api-error';
import type { CustomerRegisterPayload } from '../types/customer-auth-types';

const EMPTY_FORM: CustomerRegisterPayload = { username: '', email: '', password: '', phone_number: '' };

export function CustomerRegisterForm() {
  const [form, setForm] = useState<CustomerRegisterPayload>(EMPTY_FORM);
  const register = useCustomerRegister();

  function set<K extends keyof CustomerRegisterPayload>(key: K, value: CustomerRegisterPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    register.mutate(form, {
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Registration failed')
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" value={form.username} onChange={(e) => set('username', e.target.value)} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone_number">Phone number</Label>
        <Input id="phone_number" value={form.phone_number} onChange={(e) => set('phone_number', e.target.value)} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required />
      </div>
      <Button type="submit" disabled={register.isPending}>
        {register.isPending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
