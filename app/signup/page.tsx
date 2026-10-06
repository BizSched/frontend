import type { Metadata } from 'next';

import { AuthLayout } from '@components/auth/AuthLayout';
import { AuthSocialLogin } from '@components/auth/AuthSocialLogin';
import { SignupForm } from '@components/auth/SignupForm';

export const metadata: Metadata = {
  title: '회원가입',
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <h1 className="sr-only">회원가입</h1>
      <SignupForm />
      <AuthSocialLogin title="SNS 계정으로 회원가입" actionLabel="회원가입" />
    </AuthLayout>
  );
}
