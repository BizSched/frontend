import Image from 'next/image';

import { LandingStartLink } from '@components/landing/LandingStartLink/LandingStartLink';

import ImgHeroDashboard from '@assets/images/landing/img_hero-dashboard.png';

function HeroSection() {
  return (
    <section className="flex h-[680px] flex-col items-center overflow-hidden bg-[linear-gradient(218deg,#fff9e5_20.8%,#d4fffe_93.3%)] pt-[100px] max-tablet:h-[454px] max-tablet:pt-20">
      <div className="flex flex-col items-center gap-12 text-center max-tablet:gap-10">
        <div className="flex flex-col gap-3 font-bold max-tablet:gap-1">
          <p className="text-2xl text-primary-600 max-tablet:text-base max-tablet:font-semibold">
            BizSched 하나로 알바 관리부터 운영까지
          </p>
          <h1 className="text-display-md text-slate-700 max-tablet:text-xl">
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
