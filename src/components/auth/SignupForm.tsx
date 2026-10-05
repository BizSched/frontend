'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@components/_common/Button/Button';
import { Input } from '@components/_common/Input/Input';
import { AuthBusinessTypeField } from '@components/auth/AuthBusinessTypeField';
import { AuthField } from '@components/auth/AuthField';
import { AuthForm } from '@components/auth/AuthForm';
import { AuthSwitchLink } from '@components/auth/AuthSwitchLink';
import { PasswordInput } from '@components/auth/PasswordInput';
import {
  TERMS_AGREEMENT_DEFAULT_VALUES,
  TermsAgreement,
  type TermsAgreementValues,
} from '@components/auth/TermsAgreement';

import { ROUTE_PATHS } from '@lib/utilities/routePaths';

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  businessType: string;
  businessTypeCustom: string;
  terms: TermsAgreementValues;
}

const SIGNUP_FORM_DEFAULT_VALUES: SignupFormValues = {
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  businessType: '',
  businessTypeCustom: '',
  terms: TERMS_AGREEMENT_DEFAULT_VALUES,
};

function SignupForm() {
  const router = useRouter();
  const { control, register, handleSubmit } = useForm<SignupFormValues>({
    defaultValues: SIGNUP_FORM_DEFAULT_VALUES,
  });

  const handleSignupSubmit = () => {
    router.push(ROUTE_PATHS.dashboard());
  };

  return (
    <AuthForm
      onSubmit={handleSubmit(handleSignupSubmit)}
      className="mt-2 flex flex-col gap-8"
    >
      <div className="flex flex-col gap-4">
        <AuthField id="signup-name" label="이름">
          <Input
            autoComplete="name"
            placeholder="이름을 입력해주세요"
            {...register('name')}
          />
        </AuthField>
        <AuthField id="signup-email" label="이메일">
          <Input
            type="email"
            autoComplete="email"
            placeholder="이메일을 입력해주세요"
            {...register('email')}
          />
        </AuthField>
        <AuthField id="signup-password" label="비밀번호">
          <PasswordInput
            autoComplete="new-password"
            placeholder="비밀번호를 입력해주세요"
            {...register('password')}
          />
        </AuthField>
        <AuthField id="signup-password-confirm" label="비밀번호 확인">
          <PasswordInput
            autoComplete="new-password"
            placeholder="비밀번호를 한 번 더 입력해주세요"
            {...register('passwordConfirm')}
          />
        </AuthField>
        <Controller
          control={control}
          name="businessType"
          render={({ field }) => (
            <AuthBusinessTypeField
              value={field.value}
              onChange={field.onChange}
              customInputProps={register('businessTypeCustom')}
            />
          )}
        />
      </div>
      <Controller
        control={control}
        name="terms"
        render={({ field }) => (
          <TermsAgreement value={field.value} onChange={field.onChange} />
        )}
      />
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
  );
}

export { SignupForm };
