import Image from 'next/image';

import { LandingStartLink } from '@components/landing/LandingStartLink/LandingStartLink';

import ImgCtaCheckbox from '@assets/images/landing/img_cta-checkbox.svg';
import ImgCtaDot from '@assets/images/landing/img_cta-dot.svg';
import ImgCtaStar from '@assets/images/landing/img_cta-star.svg';

function CtaSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[744px] p-8 max-tablet:px-4 max-tablet:pt-[15px] max-tablet:pb-[19px]">
        <div className="relative flex h-[518px] flex-col items-center gap-12 rounded-[64px] bg-[#fff8e4] pt-[163px] text-center max-tablet:h-[295px] max-tablet:gap-[30px] max-tablet:rounded-[32px] max-tablet:pt-[86px]">
          <Image
            src={ImgCtaStar}
            alt=""
            unoptimized
            className="absolute top-[62px] left-[117px] w-[49px] max-tablet:top-[31px] max-tablet:left-[59px] max-tablet:w-[25px]"
          />
          <Image
            src={ImgCtaDot}
            alt=""
            unoptimized
            className="absolute top-[131px] left-[45px] w-9 max-tablet:top-[66px] max-tablet:left-[23px] max-tablet:w-[18px]"
          />
          <Image
            src={ImgCtaCheckbox}
            alt=""
            unoptimized
            className="absolute top-[337px] left-[551px] w-[91px] max-tablet:top-[170px] max-tablet:left-[278px] max-tablet:w-[46px]"
          />
          <div className="relative flex flex-col gap-3 font-bold max-tablet:gap-1">
            <p className="text-2xl text-primary-600 max-tablet:text-base max-tablet:font-semibold">
              BizSched 하나로 알바 관리부터 운영까지
            </p>
            <h2 className="text-display-md text-slate-700 max-tablet:text-xl">
              아르바이트생 관리,
              <br />
              비즈스케드로 계획해요
            </h2>
          </div>
          <LandingStartLink />
        </div>
      </div>
    </section>
  );
}

export { CtaSection };
