import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import type { Metadata } from 'next';

import { AuthLayout } from '@components/auth/AuthLayout';
import { AuthSocialLogin } from '@components/auth/AuthSocialLogin';
import { SignupForm } from '@components/auth/SignupForm';

import { termsQueryOptions } from '@hooks/api/terms/termsQueryOptions';

export const metadata: Metadata = {
  title: '회원가입',
};

export default async function SignupPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    termsQueryOptions({ next: { revalidate: 3600 } }),
  );
  return (
    <AuthLayout>
      <h1 className="sr-only">회원가입</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SignupForm />
      </HydrationBoundary>
      <AuthSocialLogin title="SNS 계정으로 회원가입" actionLabel="회원가입" />
    </AuthLayout>
  );
}
