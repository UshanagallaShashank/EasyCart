import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import { CustomerRegisterForm } from '../components/customer-register-form';

export function CustomerRegisterPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  return (
    <div className="bg-secondary/30 flex min-h-svh flex-col items-center justify-center p-4">
      <AppLogo className="mb-6" />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <CustomerRegisterForm />
          <p className="text-muted-foreground text-sm">
            Already have an account?{' '}
            <Link to={redirect ? `/customer/login?redirect=${encodeURIComponent(redirect)}` : '/customer/login'} className="underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
