import type { Metadata } from 'next';

import { AuthLayout } from '@components/auth/AuthLayout';
import { OnboardingForm } from '@components/auth/OnboardingForm';

export const metadata: Metadata = {
  title: '추가 정보 입력',
};

export default function OnboardingPage() {
  return (
    <AuthLayout>
      <div className="flex flex-col gap-2 px-1">
        <h1 className="text-xl font-semibold tracking-[-0.03em] text-slate-700">
          추가 정보 입력
        </h1>
        <p className="text-base tracking-[-0.03em] text-slate-400">
          서비스 이용을 위해 업종과 약관 동의가 필요해요.
        </p>
      </div>
      <OnboardingForm />
    </AuthLayout>
  );
}
