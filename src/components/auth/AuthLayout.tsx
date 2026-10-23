import { type ReactNode } from 'react';

import { cn } from '@lib/utilities/cn';

import { AuthLogo } from './AuthLogo';

interface AuthLayoutProps {
  className?: string;
  children: ReactNode;
}

function AuthLayout({ className, children }: AuthLayoutProps) {
  return (
    <main
      data-slot="auth-layout"
      className="flex min-h-dvh flex-1 items-center justify-center bg-slate-50 px-6 py-20 max-tablet:px-4 max-tablet:py-12"
    >
      <div className={cn('flex w-full max-w-100 flex-col gap-10', className)}>
        <AuthLogo />
        {children}
      </div>
    </main>
  );
}

export { AuthLayout };
