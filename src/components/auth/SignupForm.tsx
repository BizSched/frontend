'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { match, P } from 'ts-pattern';

import { Button } from '@components/_common/Button/Button';
import { Input } from '@components/_common/Input/Input';
import { toast } from '@components/_common/Toast/Toaster';
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

import { useSignupMutation } from '@hooks/api/auth/useAuth';
import { useTerms } from '@hooks/api/terms/useTerms';

import { ApiError } from '@lib/api/apiError';
import {
  formatSignupError,
  SIGNUP_ERROR_MESSAGES,
} from '@lib/api/entities/auth/formatSignupError';
import { isValidEmail } from '@lib/utilities/auth/isValidEmail';
import { isValidSignupIndustry } from '@lib/utilities/auth/isValidSignupIndustry';
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

const SIGNUP_ERROR_TOAST_ID = 'signup-error';

const SIGNUP_FORM_RULES = {
  name: {
    required: '이름을 입력해주세요.',
    maxLength: { value: 20, message: '이름은 20자 이하로 입력해주세요.' },
  },
  email: {
    required: '이메일을 입력해주세요.',
    validate: (value: string) =>
      isValidEmail(value) || SIGNUP_ERROR_MESSAGES.INVALID_EMAIL_FORMAT,
  },
  password: {
    required: '비밀번호를 입력해주세요.',
    pattern: {
      value: /^(?=.*[A-Za-z])(?=.*\d)(?!.*\s)\S{8,20}$/,
      message: SIGNUP_ERROR_MESSAGES.INVALID_PASSWORD_FORMAT,
    },
  },
  businessType: {
    required: '업종을 선택해주세요.',
    validate: (value: string) =>
      isValidSignupIndustry(value) ||
      SIGNUP_ERROR_MESSAGES.INVALID_INDUSTRY_VALUE,
  },
} as const;

function SignupForm() {
  const router = useRouter();
  const {
    data: terms,
    isSuccess: isTermsSuccess,
    refetch: refetchTerms,
  } = useTerms();
  const [isTermsRefreshing, setIsTermsRefreshing] = useState(false);
  const isTermsReady = isTermsSuccess && !isTermsRefreshing;
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: SIGNUP_FORM_DEFAULT_VALUES,
  });
  const { mutate: signup, isPending, isSuccess } = useSignupMutation();
  const isFormLocked = isPending || isSuccess;
  const isSubmitDisabled = !isTermsReady || isFormLocked;

  const handleSignupSubmit = (values: SignupFormValues) => {
    if (
      !isTermsReady ||
      isPending ||
      isSuccess ||
      !isValidSignupIndustry(values.businessType)
    )
      return;

    toast.dismiss(SIGNUP_ERROR_TOAST_ID);
    signup(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        industry: values.businessType,
        ...(values.businessType === 'CUSTOM' && {
          industryDetail: values.businessTypeCustom,
        }),
        termsAgreed: terms.map(({ id }) => ({
          termsId: id,
          agreed: values.terms[id] === true,
        })),
      },
      {
        onSuccess: () => router.push(ROUTE_PATHS.login()),
        onError: (error) => {
          const field = match(error)
            .with(P.instanceOf(ApiError), ({ errorCode }) =>
              match(errorCode)
                .with(
                  'EMAIL_ALREADY_EXISTS',
                  'INVALID_EMAIL_FORMAT',
                  () => 'email' as const,
                )
                .with('INVALID_PASSWORD_FORMAT', () => 'password' as const)
                .with('INVALID_INDUSTRY_VALUE', () => 'businessType' as const)
                .with('REQUIRED_TERMS_NOT_AGREED', () => 'terms' as const)
                .otherwise(() => null),
            )
            .otherwise(() => null);
          if (!field) {
            toast.error(formatSignupError(error), {
              id: SIGNUP_ERROR_TOAST_ID,
            });
            return;
          }
          setError(field, {
            type: 'server',
            message: formatSignupError(error),
          });
          if (field === 'terms') {
            setIsTermsRefreshing(true);
            void refetchTerms().finally(() => setIsTermsRefreshing(false));
          }
        },
      },
    );
  };

  return (
    <AuthForm
      onSubmit={handleSubmit(handleSignupSubmit)}
      className="mt-2 flex flex-col gap-8"
    >
      <fieldset disabled={isFormLocked} className="flex flex-col gap-4">
        <legend className="sr-only">계정 정보</legend>
        <AuthField
          id="signup-name"
          label="이름"
          errorMessage={errors.name?.message}
        >
          <Input
            autoComplete="name"
            placeholder="이름을 입력해주세요"
            {...register('name', SIGNUP_FORM_RULES.name)}
          />
        </AuthField>
        <AuthField
          id="signup-email"
          label="이메일"
          errorMessage={errors.email?.message}
        >
          <Input
            type="email"
            autoComplete="email"
            placeholder="이메일을 입력해주세요"
            {...register('email', SIGNUP_FORM_RULES.email)}
          />
        </AuthField>
        <AuthField
          id="signup-password"
          label="비밀번호"
          errorMessage={errors.password?.message}
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="비밀번호를 입력해주세요"
            {...register('password', {
              ...SIGNUP_FORM_RULES.password,
              deps: 'passwordConfirm',
            })}
          />
        </AuthField>
        <AuthField
          id="signup-password-confirm"
          label="비밀번호 확인"
          errorMessage={errors.passwordConfirm?.message}
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="비밀번호를 한 번 더 입력해주세요"
            {...register('passwordConfirm', {
              required: '비밀번호를 한 번 더 입력해주세요.',
              validate: (value) =>
                value === getValues('password') ||
                '비밀번호가 일치하지 않습니다.',
            })}
          />
        </AuthField>
        <Controller
          control={control}
          name="businessType"
          rules={SIGNUP_FORM_RULES.businessType}
          render={({ field }) => (
            <AuthBusinessTypeField
              value={field.value}
              onChange={field.onChange}
              disabled={isFormLocked}
              errorMessage={errors.businessType?.message}
              customErrorMessage={errors.businessTypeCustom?.message}
              customInputProps={register('businessTypeCustom', {
                validate: {
                  required: (value) =>
                    getValues('businessType') !== 'CUSTOM' ||
                    !!value ||
                    '업종을 입력해주세요.',
                  maxLength: (value) =>
                    getValues('businessType') !== 'CUSTOM' ||
                    value.length <= 20 ||
                    '업종은 20자 이하로 입력해주세요.',
                },
              })}
            />
          )}
        />
      </fieldset>
      <Controller
        control={control}
        name="terms"
        rules={{
          validate: (value) =>
            (terms ?? []).every(
              ({ id, required }) => !required || value[id] === true,
            ) || SIGNUP_ERROR_MESSAGES.REQUIRED_TERMS_NOT_AGREED,
        }}
        render={({ field }) => (
          <TermsAgreement
            value={field.value}
            onChange={field.onChange}
            errorMessage={errors.terms?.message}
            disabled={isFormLocked || isTermsRefreshing}
          />
        )}
      />
      <div className="flex flex-col gap-6">
        <Button type="submit" disabled={isSubmitDisabled} className="w-full">
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
