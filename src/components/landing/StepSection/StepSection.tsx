import Image from 'next/image';

import ImgStepDocument from '@assets/images/landing/img_step-document.svg';
import ImgStepRegister from '@assets/images/landing/img_step-register.svg';
import ImgStepSchedule from '@assets/images/landing/img_step-schedule.svg';

const STEPS = [
  {
    icon: ImgStepRegister,
    title: '아르바이트생\n등록하기',
    description: '이름과 연락처만 입력하면\n바로 시작할 수 있어요',
  },
  {
    icon: ImgStepDocument,
    title: '서류 첨부하기',
    description: '보건증, 통장사본,\n근무계약서를\n한 번에 관리해요',
  },
  {
    icon: ImgStepSchedule,
    title: '스케줄 확인하기',
    description: '캘린더에서\n근무 일정과 출퇴근을\n한눈에 확인해요',
  },
] as const;

function StepSection() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto flex max-w-[744px] flex-col items-center px-6 pt-[100px] pb-10 max-tablet:px-4 max-tablet:pt-14 max-tablet:pb-14">
        <div className="flex flex-col gap-3 text-center font-bold max-tablet:gap-1">
          <p className="text-2xl text-primary-600 max-tablet:text-base max-tablet:font-semibold">
            목표 설정부터 기록까지
          </p>
          <h2 className="text-display-md text-slate-700 max-tablet:text-xl">
            쉽고 빠르게 할 일을 시작해요
          </h2>
        </div>
        <ol className="mt-[72px] flex w-full items-center gap-4 max-tablet:mt-[46px] max-tablet:flex-col max-tablet:items-stretch">
          {STEPS.map(({ icon, title, description }, index) => (
            <li
              key={title}
              className="flex flex-1 flex-col items-center gap-4 rounded-[32px] bg-white px-8 pt-8 pb-10 text-center whitespace-pre shadow-[0_0_60px_rgba(0,0,0,0.05)]"
            >
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-full bg-primary-500 text-xl font-bold text-white drop-shadow-[0_4px_8px_rgba(255,158,89,0.2)]"
              >
                {index + 1}
              </span>
              <Image src={icon} alt="" unoptimized />
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-slate-700">
                  {title}
                </h3>
                <p className="font-medium text-slate-400">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export { StepSection };
