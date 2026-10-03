// One sign-in for customers, store owners, delivery partners and admins.
import { useState } from 'react';
import { Text } from '@/components/text';
import { Link, router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { AuthShell } from '@/components/auth-shell';
import { Button, Field } from '@/components/ui';
import { useToast } from '@/components/toast';
import { api, errorMessage } from '@/lib/api';
import { homeForRole, useSession } from '@/lib/session';
import { colors } from '@/theme/theme';
import type { SessionUser } from '@/types/catalog';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useSession();
  const toast = useToast();

  const login = useMutation({
    mutationFn: () => api<{ user: SessionUser; token: string }>('/login', { method: 'POST', body: { email: email.trim(), password } }),
    onSuccess: async ({ user, token }) => {
      await signIn(user, token);
      router.replace(homeForRole(user.role));
    },
    onError: (err) => toast(errorMessage(err, 'Sign-in failed'), 'error')
  });

  return (
    <AuthShell
      title="Sign in to Easy Cart"
      subtitle="Your effortless shopping companion."
      footer={
        <>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>New here? <Link href="/register" style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Create an account</Link></Text>
          <Text style={{ fontSize: 12, color: colors.textFaint }}>Ride a bike? <Link href="/rider-register" style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Become a delivery partner</Link></Text>
        </>
      }
    >
      <Field icon="mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="Email address" />
      <Field icon="lock" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Password" onSubmitEditing={() => login.mutate()} />
      <Button label="Sign in" onPress={() => login.mutate()} loading={login.isPending} disabled={!email || !password} />
    </AuthShell>
  );
}
