import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/shared/auth/auth-provider';
import { AppRoutes } from '@/routes/app-routes';

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
}
