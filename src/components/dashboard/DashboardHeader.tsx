'use client';

import { useMe } from '@hooks/api/users/useMe';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

function DashboardHeader() {
  const { data } = useMe();
  return (
    <header className="flex items-center justify-between">
      <h1
        className={cn(
          typographyVariants({ role: 'pageTitle' }),
          'text-gray-900',
        )}
      >
        {data ? `${data.name}님의 대시보드` : '대시보드'}
      </h1>
    </header>
  );
}

export { DashboardHeader };
