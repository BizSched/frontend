import type { Metadata } from 'next';

import { AuthLayout } from '@components/auth/AuthLayout';
import { AuthSocialLogin } from '@components/auth/AuthSocialLogin';
import { LoginForm } from '@components/auth/LoginForm';

export const metadata: Metadata = {
  title: '로그인 | BizSched',
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <h1 className="sr-only">로그인</h1>
      <LoginForm />
      <AuthSocialLogin title="SNS 계정으로 로그인" actionLabel="로그인" />
    </AuthLayout>
  );
}
