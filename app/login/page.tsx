import type { Metadata } from 'next';

import { Button } from '@components/_common/Button/Button';
import { Input } from '@components/_common/Input/Input';
import { AuthField } from '@components/auth/AuthField';
import { AuthForm } from '@components/auth/AuthForm';
import { AuthLayout } from '@components/auth/AuthLayout';
import { AuthSocialLogin } from '@components/auth/AuthSocialLogin';
import { AuthSwitchLink } from '@components/auth/AuthSwitchLink';
import { PasswordInput } from '@components/auth/PasswordInput';

export const metadata: Metadata = {
  title: '로그인 | BizSched',
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <h1 className="sr-only">로그인</h1>
      <AuthForm className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <AuthField id="login-email" label="이메일" isLabelHidden>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="이메일을 입력해주세요"
            />
          </AuthField>
          <AuthField id="login-password" label="비밀번호" isLabelHidden>
            <PasswordInput
              name="password"
              placeholder="비밀번호를 입력해주세요"
            />
          </AuthField>
        </div>
        <div className="flex flex-col gap-6">
          <Button type="submit" className="w-full">
            로그인하기
          </Button>
          <AuthSwitchLink
            question="BizSched가 처음이신가요?"
            linkLabel="회원가입"
            href="/signup"
          />
        </div>
      </AuthForm>
      <AuthSocialLogin title="SNS 계정으로 로그인" actionLabel="로그인" />
    </AuthLayout>
  );
}
