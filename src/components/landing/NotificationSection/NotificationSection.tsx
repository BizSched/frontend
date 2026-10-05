import Image from 'next/image';

import ImgNotification from '@assets/images/landing/img_notification.png';

function NotificationSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[744px] flex-col pt-[69px] pb-[23px] max-tablet:pt-[54px] max-tablet:pb-[25px]">
        <div className="flex flex-col items-end gap-6 pr-[54px] text-right max-tablet:gap-3 max-tablet:pr-[23px]">
          <p className="text-2xl font-semibold text-primary-600 max-tablet:text-base">
            놓치는 일 없이
          </p>
          <h2 className="flex flex-col gap-2 text-display-md font-bold text-slate-700 max-tablet:gap-0 max-tablet:text-xl">
            <span>중요한 순간을</span>
            <span>미리 알려드려요</span>
          </h2>
        </div>
        <Image
          src={ImgNotification}
          alt=""
          sizes="(max-width: 743px) 344px, 713px"
          className="mt-14 ml-[31px] h-auto w-[713px] max-tablet:mt-7 max-tablet:ml-[18px] max-tablet:w-[344px]"
        />
      </div>
    </section>
  );
}

export { NotificationSection };
