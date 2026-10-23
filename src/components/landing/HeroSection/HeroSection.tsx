import Image from 'next/image';

import { LandingStartLink } from '@components/landing/LandingStartLink/LandingStartLink';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

import ImgHeroDashboard from '@assets/images/landing/img_hero-dashboard.png';

function HeroSection() {
  return (
    <section className="flex h-[680px] flex-col items-center overflow-hidden bg-[linear-gradient(218deg,#fff9e5_20.8%,#d4fffe_93.3%)] pt-[100px] max-tablet:h-[454px] max-tablet:pt-20">
      <div className="flex w-full min-w-0 flex-col items-center gap-12 px-4 text-center max-tablet:gap-10">
        <div className="flex flex-col gap-3 max-tablet:gap-1">
          <p
            className={cn(
              typographyVariants({ role: 'subtitle' }),
              'text-primary-600',
            )}
          >
            BizSched 하나로 아르바이트 관리부터 운영까지
          </p>
          <h1 className="text-display-md font-bold tracking-[-0.03em] text-slate-700 max-tablet:text-xl">
            아르바이트생 관리, 비즈스케드로 계획해요
          </h1>
        </div>
        <LandingStartLink />
      </div>
      <Image
        src={ImgHeroDashboard}
        alt="BizSched 대시보드 화면"
        sizes="(max-width: 743px) 316px, 682px"
        preload
        className="mt-12 h-auto w-[682px] shrink-0 rounded-[26.41px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] max-tablet:mt-[35px] max-tablet:w-[316px]"
      />
    </section>
  );
}

export { HeroSection };
