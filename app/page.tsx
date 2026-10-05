import type { Metadata } from 'next';

import { CtaSection } from '@components/landing/CtaSection/CtaSection';
import { FeatureSection } from '@components/landing/FeatureSection/FeatureSection';
import { HeroSection } from '@components/landing/HeroSection/HeroSection';
import { NotificationSection } from '@components/landing/NotificationSection/NotificationSection';
import { StepSection } from '@components/landing/StepSection/StepSection';

export const metadata: Metadata = {
  title: 'BizSched',
  description: '아르바이트생 관리부터 운영까지, 비즈스케드로 계획해요',
};

export default function LandingPage() {
  return (
    <main className="flex-1 tracking-[-0.03em]">
      <HeroSection />
      <FeatureSection />
      <StepSection />
      <NotificationSection />
      <CtaSection />
    </main>
  );
}
