import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import type { Metadata } from 'next';

import { AuthLayout } from '@components/auth/AuthLayout';
import { OnboardingForm } from '@components/auth/OnboardingForm';

import { termsQueryOptions } from '@hooks/api/terms/termsQueryOptions';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

export const metadata: Metadata = {
  title: '추가 정보 입력',
};

export default async function OnboardingPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    termsQueryOptions({ next: { revalidate: 3600 } }),
  );
  return (
    <AuthLayout>
      <div className="flex flex-col gap-2 px-1">
        <h1
          className={cn(
            typographyVariants({ role: 'pageTitle' }),
            'text-slate-700',
          )}
        >
          추가 정보 입력
        </h1>
        <p
          className={cn(
            typographyVariants({ role: 'supporting' }),
            'text-slate-400',
          )}
        >
          서비스 이용을 위해 업종과 약관 동의가 필요해요.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <OnboardingForm />
      </HydrationBoundary>
    </AuthLayout>
  );
}
