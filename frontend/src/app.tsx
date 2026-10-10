import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/shared/auth/auth-provider';
import { CustomerAuthProvider } from '@/shared/customer-auth/customer-auth-provider';
import { AppRoutes } from '@/routes/app-routes';

export function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <AppRoutes />
        <Toaster position="top-center" />
      </CustomerAuthProvider>

    </AuthProvider>
  );
}
