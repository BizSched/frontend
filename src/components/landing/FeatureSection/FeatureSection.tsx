import Image from 'next/image';

import ImgFeatureNoteSticker from '@assets/images/landing/img_feature-note-sticker.svg';
import ImgFeatureProgressBadge from '@assets/images/landing/img_feature-progress-badge.svg';
import ImgFeatureSchedule from '@assets/images/landing/img_feature-schedule.png';
import ImgNote from '@assets/images/landing/img_note.svg';
import ImgProgress from '@assets/images/landing/img_progress.svg';
import ImgTask from '@assets/images/landing/img_task.svg';

const FEATURES = [
  { icon: ImgTask, label: '아르바이트생 서류 관리' },
  { icon: ImgProgress, label: '한눈에 보는 근무 스케줄' },
  { icon: ImgNote, label: '간편한 출퇴근 체크' },
] as const;

function FeatureSection() {
  return (
    <section className="bg-primary-500">
      <div className="mx-auto flex max-w-[744px] flex-col px-[72px] pt-[81px] pb-[87px] max-tablet:px-7 max-tablet:pt-11 max-tablet:pb-[54px]">
        <div className="flex flex-col gap-3 max-tablet:gap-1">
          <p className="text-2xl font-semibold text-primary-300 max-tablet:text-base">
            더 똑똑한 아르바이트생 관리
          </p>
          <h2 className="text-display-md font-bold text-white max-tablet:text-xl">
            비즈 스케드가 특별한 이유
          </h2>
        </div>
        <ul className="mt-11 flex flex-col gap-4">
          {FEATURES.map(({ icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 text-xl font-bold text-white max-tablet:gap-2 max-tablet:text-base"
            >
              <Image
                src={icon}
                alt=""
                unoptimized
                className="size-10 max-tablet:size-8"
              />
              {label}
            </li>
          ))}
        </ul>
        <div className="relative mt-[74px] w-[604px] shrink-0 self-center max-tablet:mt-11 max-tablet:w-[322px]">
          <Image
            src={ImgFeatureSchedule}
            alt="아르바이트생 스케줄 관리 캘린더 화면"
            sizes="(max-width: 743px) 322px, 604px"
            className="h-auto w-full"
          />
          <Image
            src={ImgFeatureProgressBadge}
            alt=""
            unoptimized
            className="absolute top-[267px] left-[-70px] w-[229px] max-w-none max-tablet:top-[148px] max-tablet:left-[-27px] max-tablet:w-[116px]"
          />
          <Image
            src={ImgFeatureNoteSticker}
            alt=""
            unoptimized
            className="absolute top-[-26px] left-[523px] w-[152px] max-w-none max-tablet:top-[-1px] max-tablet:left-[274px] max-tablet:w-[77px]"
          />
        </div>
      </div>
    </section>
  );
}

export { FeatureSection };
