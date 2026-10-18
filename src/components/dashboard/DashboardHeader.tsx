'use client';

import { useMe } from '@hooks/api/users/useMe';

function DashboardHeader() {
  const { data } = useMe();
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900 max-tablet:text-xl">
        {data ? `${data.name}님의 대시보드` : '대시보드'}
      </h1>
    </header>
  );
}

export { DashboardHeader };
