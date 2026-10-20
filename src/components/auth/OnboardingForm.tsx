'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { match, P } from 'ts-pattern';

import { Button } from '@components/_common/Button/Button';
import { AuthBusinessTypeField } from '@components/auth/AuthBusinessTypeField';
import { AuthForm } from '@components/auth/AuthForm';
import {
  TERMS_AGREEMENT_DEFAULT_VALUES,
  TermsAgreement,
  type TermsAgreementValues,
} from '@components/auth/TermsAgreement';

import { useCompleteSocialSignupMutation } from '@hooks/api/auth/useAuth';
import { useTerms } from '@hooks/api/terms/useTerms';

import { ApiError } from '@lib/api/apiError';
import {
  formatSignupError,
  SIGNUP_ERROR_MESSAGES,
} from '@lib/api/entities/auth/formatSignupError';
import { createSocialErrorPath } from '@lib/utilities/auth/createSocialErrorPath';
import { isValidSignupIndustry } from '@lib/utilities/auth/isValidSignupIndustry';
import { ROUTE_PATHS } from '@lib/utilities/routePaths';

interface OnboardingFormValues {
  businessType: string;
  businessTypeCustom: string;
  terms: TermsAgreementValues;
}

const ONBOARDING_FORM_DEFAULT_VALUES: OnboardingFormValues = {
  businessType: '',
  businessTypeCustom: '',
  terms: TERMS_AGREEMENT_DEFAULT_VALUES,
};

const ONBOARDING_FORM_RULES = {
  businessType: {
    required: '업종을 선택해주세요.',
    validate: (value: string) =>
      isValidSignupIndustry(value) ||
      SIGNUP_ERROR_MESSAGES.INVALID_INDUSTRY_VALUE,
  },
} as const;

const getSocialErrorPath = (error: unknown) =>
  match(error)
    .with(
      P.instanceOf(ApiError).and(
        P.union(
          { status: 401, errorCode: 'INVALID_TEMP_TOKEN' },
          {
            status: 409,
            errorCode: P.union(
              'SOCIAL_ACCOUNT_ALREADY_REGISTERED',
              'SOCIAL_EMAIL_CONFLICT',
            ),
          },
        ),
      ),
      ({ errorCode, data }) => createSocialErrorPath(errorCode, data),
    )
    .otherwise(() => undefined);

function OnboardingForm() {
  const router = useRouter();
  const {
    data: terms,
    isSuccess: isTermsSuccess,
    refetch: refetchTerms,
  } = useTerms();
  const [isTermsRefreshing, setIsTermsRefreshing] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const isTermsReady = isTermsSuccess && !isTermsRefreshing;
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    defaultValues: ONBOARDING_FORM_DEFAULT_VALUES,
  });
  const {
    mutate: completeSocialSignup,
    isPending,
    isSuccess,
  } = useCompleteSocialSignupMutation();
  const isFormLocked = isPending || isSuccess || isLeaving;
  const isSubmitDisabled = !isTermsReady || isFormLocked;

  const handleOnboardingSubmit = (values: OnboardingFormValues) => {
    if (
      !isTermsReady ||
      isFormLocked ||
      !isValidSignupIndustry(values.businessType)
    )
      return;

    completeSocialSignup(
      {
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
        onSuccess: () => router.push(ROUTE_PATHS.dashboard()),
        onError: (error) => {
          const socialErrorPath = getSocialErrorPath(error);
          if (socialErrorPath) {
            setIsLeaving(true);
            window.location.assign(socialErrorPath);
            return;
          }

          const field = match(error)
            .with(P.instanceOf(ApiError), ({ errorCode }) =>
              match(errorCode)
                .with('INVALID_INDUSTRY_VALUE', () => 'businessType' as const)
                .with('REQUIRED_TERMS_NOT_AGREED', () => 'terms' as const)
                .otherwise(() => 'root.server' as const),
            )
            .otherwise(() => 'root.server' as const);
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
      onSubmit={handleSubmit(handleOnboardingSubmit)}
      className="flex flex-col gap-8"
    >
      <Controller
        control={control}
        name="businessType"
        rules={ONBOARDING_FORM_RULES.businessType}
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
      <div className="flex flex-col gap-2">
        {errors.root?.server && (
          <p
            role="alert"
            className="pl-1 text-sm tracking-[-0.03em] text-warning-500"
          >
            {errors.root.server.message}
          </p>
        )}
        <Button type="submit" disabled={isSubmitDisabled} className="w-full">
          시작하기
        </Button>
      </div>
    </AuthForm>
  );
}

export { OnboardingForm };
