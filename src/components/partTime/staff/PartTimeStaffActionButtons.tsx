'use client';

import { PencilIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ActionButton } from '@components/_common/ActionButton/ActionButton';

function PartTimeStaffActionButtons() {
  const router = useRouter();

  return (
    <div className="fixed right-3 bottom-3 z-20 hidden max-mobile:flex">
      <ActionButton
        aria-label="아르바이트생 액션 열기"
        actions={[
          {
            icon: <PencilIcon />,
            label: '아르바이트생 추가',
            onClick: () => router.push('/partTime/staff/new'),
          },
        ]}
      />
    </div>
  );
}

export { PartTimeStaffActionButtons };
