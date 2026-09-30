import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import { CustomerLoginForm } from '../components/customer-login-form';

export function CustomerLoginPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  return (
    <div className="bg-secondary/30 flex min-h-svh flex-col items-center justify-center p-4">
      <AppLogo className="mb-6" />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Log in</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <CustomerLoginForm />
          <p className="text-muted-foreground text-sm">
            No account?{' '}
            <Link to={redirect ? `/customer/register?redirect=${encodeURIComponent(redirect)}` : '/customer/register'} className="underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
