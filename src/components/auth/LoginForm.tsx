'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@components/_common/Button/Button';
import { Input } from '@components/_common/Input/Input';
import { AuthField } from '@components/auth/AuthField';
import { AuthForm } from '@components/auth/AuthForm';
import { AuthSwitchLink } from '@components/auth/AuthSwitchLink';
import { PasswordInput } from '@components/auth/PasswordInput';

import { ROUTE_PATHS } from '@lib/utilities/routePaths';

interface LoginFormValues {
  email: string;
  password: string;
}

const LOGIN_FORM_DEFAULT_VALUES: LoginFormValues = {
  email: '',
  password: '',
};

function LoginForm() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: LOGIN_FORM_DEFAULT_VALUES,
  });

  const handleLoginSubmit = () => {
    router.push(ROUTE_PATHS.dashboard());
  };

  return (
    <AuthForm
      onSubmit={handleSubmit(handleLoginSubmit)}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-4">
        <AuthField id="login-email" label="이메일" isLabelHidden>
          <Input
            type="email"
            autoComplete="email"
            placeholder="이메일을 입력해주세요"
            {...register('email')}
          />
        </AuthField>
        <AuthField id="login-password" label="비밀번호" isLabelHidden>
          <PasswordInput
            placeholder="비밀번호를 입력해주세요"
            {...register('password')}
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
  );
}

export { LoginForm };
