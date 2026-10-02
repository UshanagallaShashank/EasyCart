// Customer sign-up.
import { useState } from 'react';
import { Text } from 'react-native';
import { Link, router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { AuthShell } from '@/components/auth-shell';
import { Button, Field } from '@/components/ui';
import { useToast } from '@/components/toast';
import { api, errorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';
import { colors } from '@/theme/theme';
import type { SessionUser } from '@/types/catalog';

const PASSWORD_HINT = '8–20 characters with a capital letter, a number and a symbol';

export default function RegisterScreen() {
  const [form, setForm] = useState({ username: '', email: '', phone_number: '', password: '' });
  const set = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const { signIn } = useSession();
  const toast = useToast();

  const register = useMutation({
    mutationFn: () => api<{ user: Omit<SessionUser, 'role'>; token: string }>('/customers/register', { method: 'POST', body: { ...form, email: form.email.trim() } }),
    onSuccess: async ({ user, token }) => {
      await signIn({ ...user, role: 'customer' }, token);
      router.replace('/shop');
    },
    onError: (err) => toast(errorMessage(err, 'Sign-up failed'), 'error')
  });

  return (
    <AuthShell title="Create your account" subtitle="Shop from independent stores near you." footer={<Text style={{ fontSize: 13, color: colors.textMuted }}>Already have an account? <Link href="/login" style={{ color: colors.primary, fontWeight: '600' }}>Log in</Link></Text>}>
      <Field label="Username" value={form.username} onChangeText={set('username')} autoCapitalize="none" placeholder="Letters, numbers, _" />
      <Field label="Mobile number" value={form.phone_number} onChangeText={set('phone_number')} keyboardType="phone-pad" placeholder="10 digits" />
      <Field label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
      <Field label="Password" value={form.password} onChangeText={set('password')} secureTextEntry hint={PASSWORD_HINT} />
      <Button label="Create account" onPress={() => register.mutate()} loading={register.isPending} />
    </AuthShell>
  );
}
