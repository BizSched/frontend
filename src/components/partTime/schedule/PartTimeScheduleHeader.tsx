import { PartTimeScheduleAddButton } from '@components/partTime/schedule/PartTimeScheduleAddButton';
import { PartTimeScheduleImageSaveButton } from '@components/partTime/schedule/PartTimeScheduleImageSaveButton';

function PartTimeScheduleHeader() {
  return (
    <header className="flex items-center justify-between gap-2.5 px-2 max-mobile:sr-only">
      <h1 className="min-w-0 text-2xl font-semibold tracking-[-0.03em] break-keep text-black max-tablet:text-xl">
        아르바이트생 스케줄 관리
      </h1>
      <div className="flex shrink-0 items-center gap-2.5 max-mobile:hidden">
        <PartTimeScheduleImageSaveButton />
        <PartTimeScheduleAddButton />
      </div>
    </header>
  );
}

export { PartTimeScheduleHeader };
