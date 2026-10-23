import { PartTimeScheduleAddButton } from '@components/partTime/schedule/PartTimeScheduleAddButton';
import { PartTimeScheduleImageSaveButton } from '@components/partTime/schedule/PartTimeScheduleImageSaveButton';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

function PartTimeScheduleHeader() {
  return (
    <header className="flex items-center justify-between gap-2.5 px-2 max-mobile:sr-only">
      <h1
        className={cn(
          typographyVariants({ role: 'pageTitle' }),
          'min-w-0 break-keep text-black',
        )}
      >
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
