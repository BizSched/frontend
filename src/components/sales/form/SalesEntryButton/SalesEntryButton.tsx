'use client';

import { PencilIcon, PlusIcon } from 'lucide-react';
import { overlay } from 'overlay-kit';

import { Button } from '@components/_common/Button/Button';
import { SalesEntryModal } from '@components/sales/form/SalesEntryModal/SalesEntryModal';

import { cn } from '@lib/utilities/cn';

interface SalesEntryButtonProps {
  isIconOnly?: boolean;
}

function SalesEntryButton({ isIconOnly = false }: SalesEntryButtonProps) {
  const Icon = isIconOnly ? PencilIcon : PlusIcon;
  return (
    <Button
      type="button"
      hierarchy="primary"
      size="medium"
      aria-label="오늘 매출 입력"
      icon={
        <Icon
          aria-hidden="true"
          className={isIconOnly ? 'text-primary-500' : undefined}
        />
      }
      className={cn(
        isIconOnly
          ? 'size-10 bg-slate-50 p-0 shadow-[0_1px_4px_var(--color-slate-600)] hover:bg-slate-100'
          : 'max-desktop:w-auto max-desktop:text-[10px]',
      )}
      onClick={(event) => {
        const returnFocus = event.currentTarget;
        overlay.open((controller) => (
          <SalesEntryModal {...controller} returnFocus={returnFocus} />
        ));
      }}
    >
      {isIconOnly ? null : '오늘 매출 입력'}
    </Button>
  );
}

export { SalesEntryButton };
