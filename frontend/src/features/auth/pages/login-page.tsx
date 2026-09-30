import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import { LoginForm } from '../components/login-form';

export function LoginPage() {
  return (
    <div className="bg-secondary/30 flex min-h-svh flex-col items-center justify-center p-4">
      <AppLogo className="mb-6" />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Log in to your store</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LoginForm />
          <p className="text-muted-foreground text-sm">
            No account? <Link to="/register" className="underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
