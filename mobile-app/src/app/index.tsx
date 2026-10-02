// Opens the right part of the app for whoever is signed in.
import { Redirect } from 'expo-router';
import { Loading } from '@/components/ui';
import { homeForRole, useSession } from '@/lib/session';

export default function Index() {
  const { user, isReady } = useSession();
  if (!isReady) return <Loading />;
  return <Redirect href={user ? homeForRole(user.role) : '/login'} />;
}
