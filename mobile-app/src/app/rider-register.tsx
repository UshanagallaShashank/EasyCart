// Delivery partner sign-up. Details, location and documents are added next, inside the rider area.
import { useState } from 'react';
import { Text } from 'react-native';
import { Link, router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { AuthShell } from '@/components/auth-shell';
import { Button, Field, Notice } from '@/components/ui';
import { useToast } from '@/components/toast';
import { api, errorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';
import { colors } from '@/theme/theme';
import type { SessionUser } from '@/types/catalog';

export default function RiderRegisterScreen() {
  const [form, setForm] = useState({ full_name: '', username: '', email: '', phone_number: '', password: '' });
  const set = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const { signIn } = useSession();
  const toast = useToast();

  const register = useMutation({
    mutationFn: () => api<{ user: SessionUser; token: string }>('/riders/register', { method: 'POST', body: { ...form, email: form.email.trim() } }),
    onSuccess: async ({ user, token }) => {
      await signIn(user, token);
      router.replace('/rider/application');
    },
    onError: (err) => toast(errorMessage(err, 'Sign-up failed'), 'error')
  });

  return (
    <AuthShell title="Deliver with Easy Cart" subtitle="Earn on every order you deliver near you." footer={<Text style={{ fontSize: 13, color: colors.textMuted }}>Already a partner? <Link href="/login" style={{ color: colors.primary, fontWeight: '600' }}>Sign in</Link></Text>}>
      <Notice icon="shield">After this you add your vehicle, licence, RC and ID. An admin checks them before you can go online.</Notice>
      <Field label="Full name (as on your licence)" value={form.full_name} onChangeText={set('full_name')} />
      <Field label="Username" value={form.username} onChangeText={set('username')} autoCapitalize="none" />
      <Field label="Mobile number" value={form.phone_number} onChangeText={set('phone_number')} keyboardType="phone-pad" />
      <Field label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={form.password} onChangeText={set('password')} secureTextEntry hint="8–20 characters with a capital letter, a number and a symbol" />
      <Button label="Continue" onPress={() => register.mutate()} loading={register.isPending} />
    </AuthShell>
  );
}
