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
  title: '회원가입 | BizSched',
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <h1 className="sr-only">회원가입</h1>
      <AuthForm className="mt-2 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <AuthField id="signup-name" label="이름">
            <Input
              name="name"
              autoComplete="name"
              placeholder="이름을 입력해주세요"
            />
          </AuthField>
          <AuthField id="signup-email" label="이메일">
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="이메일을 입력해주세요"
            />
          </AuthField>
          <AuthField id="signup-password" label="비밀번호">
            <PasswordInput
              name="password"
              autoComplete="new-password"
              placeholder="비밀번호를 입력해주세요"
            />
          </AuthField>
          <AuthField id="signup-password-confirm" label="비밀번호 확인">
            <PasswordInput
              name="passwordConfirm"
              autoComplete="new-password"
              placeholder="비밀번호를 한 번 더 입력해주세요"
            />
          </AuthField>
        </div>
        <div className="flex flex-col gap-6">
          <Button type="submit" className="w-full">
            회원가입 하기
          </Button>
          <AuthSwitchLink
            question="이미 회원이신가요?"
            linkLabel="로그인"
            href="/login"
          />
        </div>
      </AuthForm>
      <AuthSocialLogin title="SNS 계정으로 회원가입" actionLabel="회원가입" />
    </AuthLayout>
  );
}
