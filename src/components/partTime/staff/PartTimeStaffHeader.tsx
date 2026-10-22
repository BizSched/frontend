import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@components/_common/Button/Button';
import { Input } from '@components/_common/Input/Input';

function PartTimeStaffHeader() {
  return (
    <header className="flex items-center justify-between gap-2.5 px-2 max-mobile:sr-only">
      <h1 className="min-w-0 text-2xl font-semibold tracking-[-0.03em] break-keep text-black max-tablet:text-xl">
        아르바이트생 관리
      </h1>
      <div className="flex shrink-0 items-center gap-2.5 max-mobile:hidden">
        <Input
          variant="search"
          aria-label="아르바이트생 검색"
          placeholder="아르바이트생을 검색해주세요"
          className="hidden w-80 max-laptop:w-70"
        />
        <Button
          size="small"
          nativeButton={false}
          render={<Link href="/partTime/staff/new" />}
          icon={<PlusIcon size={24} strokeWidth={1.5} />}
        >
          아르바이트생
        </Button>
      </div>
    </header>
  );
}

export { PartTimeStaffHeader };
