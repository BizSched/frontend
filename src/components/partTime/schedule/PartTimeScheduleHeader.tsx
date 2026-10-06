import { LinkIcon } from 'lucide-react';

import { Button } from '@components/_common/Button/Button';
import { PartTimeScheduleAddButton } from '@components/partTime/schedule/PartTimeScheduleAddButton';

function PartTimeScheduleHeader() {
  return (
    <header className="flex items-center justify-between gap-2.5 px-2 max-mobile:sr-only">
      <h1 className="min-w-0 text-2xl font-semibold tracking-[-0.03em] break-keep text-black max-tablet:text-xl">
        아르바이트생 스케쥴 관리
      </h1>
      <div className="flex shrink-0 items-center gap-2.5 max-mobile:hidden">
        <Button
          hierarchy="secondary"
          size="small"
          icon={<LinkIcon strokeWidth={1.8} aria-hidden="true" />}
          className="text-accent-500 [&_svg]:size-5"
        >
          스케쥴 공유
        </Button>
        <PartTimeScheduleAddButton />
      </div>
    </header>
  );
}

export { PartTimeScheduleHeader };
