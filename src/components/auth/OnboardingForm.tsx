'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@components/_common/Button/Button';
import { AuthBusinessTypeField } from '@components/auth/AuthBusinessTypeField';
import { AuthForm } from '@components/auth/AuthForm';
import {
  TERMS_AGREEMENT_DEFAULT_VALUES,
  TermsAgreement,
  type TermsAgreementValues,
} from '@components/auth/TermsAgreement';

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

function OnboardingForm() {
  const router = useRouter();
  const { control, register, handleSubmit } = useForm<OnboardingFormValues>({
    defaultValues: ONBOARDING_FORM_DEFAULT_VALUES,
  });

  const handleOnboardingSubmit = () => {
    router.push(ROUTE_PATHS.dashboard());
  };

  return (
    <AuthForm
      onSubmit={handleSubmit(handleOnboardingSubmit)}
      className="flex flex-col gap-8"
    >
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
      <Controller
        control={control}
        name="terms"
        render={({ field }) => (
          <TermsAgreement value={field.value} onChange={field.onChange} />
        )}
      />
      <Button type="submit" className="w-full">
        시작하기
      </Button>
    </AuthForm>
  );
}

export { OnboardingForm };
