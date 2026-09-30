import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import { RegisterForm } from '../components/register-form';

export function RegisterPage() {
  return (
    <div className="bg-secondary/30 flex min-h-svh flex-col items-center justify-center p-4">
      <AppLogo className="mb-6" />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Create your store</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <RegisterForm />
          <p className="text-muted-foreground text-sm">
            Already have an account? <Link to="/login" className="underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
