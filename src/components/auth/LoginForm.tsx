'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { match, P } from 'ts-pattern';

import { Button } from '@components/_common/Button/Button';
import { Checkbox } from '@components/_common/Checkbox/Checkbox';
import { Input } from '@components/_common/Input/Input';
import { toast } from '@components/_common/Toast/Toaster';
import { AuthField } from '@components/auth/AuthField';
import { AuthForm } from '@components/auth/AuthForm';
import { AuthSwitchLink } from '@components/auth/AuthSwitchLink';
import { PasswordInput } from '@components/auth/PasswordInput';

import { useLoginMutation } from '@hooks/api/auth/useAuth';

import { ApiError } from '@lib/api/apiError';
import { formatAuthError } from '@lib/api/entities/auth/formatAuthError';
import { isValidEmail } from '@lib/utilities/auth/isValidEmail';
import { ROUTE_PATHS } from '@lib/utilities/routePaths';

const LOGIN_ERROR_TOAST_ID = 'login-error';

const isInvalidCredentialsError = (error: unknown) =>
  match(error)
    .with(
      P.instanceOf(ApiError),
      ({ errorCode }) => errorCode === 'INVALID_CREDENTIALS',
    )
    .otherwise(() => false);

interface LoginFormValues {
  email: string;
  password: string;
  autoLogin: boolean;
}

const LOGIN_FORM_DEFAULT_VALUES: LoginFormValues = {
  email: '',
  password: '',
  autoLogin: false,
};

const LOGIN_FORM_RULES = {
  email: {
    required: '이메일을 입력해주세요.',
    validate: (value: string) =>
      isValidEmail(value) || '올바른 이메일 형식이 아닙니다.',
  },
  password: {
    required: '비밀번호를 입력해주세요.',
  },
} as const;

function LoginForm() {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: LOGIN_FORM_DEFAULT_VALUES,
  });
  const { mutate: login, isPending, isSuccess } = useLoginMutation();
  // NOTE: 성공 후 대시보드로 이동하기 전까지 다시 제출하면 refresh 토큰이 추가 발급되므로 버튼을 계속 막는다
  const isSubmitDisabled = isPending || isSuccess;

  const handleLoginSubmit = (values: LoginFormValues) => {
    toast.dismiss(LOGIN_ERROR_TOAST_ID);
    login(values, {
      onSuccess: () => router.push(ROUTE_PATHS.dashboard()),
      onError: (error) => {
        if (isInvalidCredentialsError(error)) {
          setError('root.server', { message: formatAuthError(error) });
          return;
        }
        toast.error(formatAuthError(error), { id: LOGIN_ERROR_TOAST_ID });
      },
    });
  };

  return (
    <AuthForm
      onSubmit={handleSubmit(handleLoginSubmit)}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-4">
        <AuthField
          id="login-email"
          label="이메일"
          isLabelHidden
          errorMessage={errors.email?.message}
        >
          <Input
            type="email"
            autoComplete="email"
            placeholder="이메일을 입력해주세요"
            {...register('email', LOGIN_FORM_RULES.email)}
          />
        </AuthField>
        <AuthField
          id="login-password"
          label="비밀번호"
          isLabelHidden
          errorMessage={errors.password?.message}
        >
          <PasswordInput
            placeholder="비밀번호를 입력해주세요"
            {...register('password', LOGIN_FORM_RULES.password)}
          />
        </AuthField>
        <Controller
          control={control}
          name="autoLogin"
          render={({ field }) => (
            <label className="flex w-fit cursor-pointer items-center gap-2 pl-1 text-sm leading-5 tracking-[-0.03em] text-slate-500">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
              />
              <span>자동 로그인</span>
            </label>
          )}
        />
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {errors.root?.server && (
            <p
              role="alert"
              className="pl-1 text-sm tracking-[-0.03em] text-warning-500"
            >
              {errors.root.server.message}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
            로그인하기
          </Button>
        </div>
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
