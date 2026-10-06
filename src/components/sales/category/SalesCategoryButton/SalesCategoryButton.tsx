'use client';

import { TagIcon } from 'lucide-react';
import { overlay } from 'overlay-kit';

import { Button } from '@components/_common/Button/Button';
import { SalesCategoryModal } from '@components/sales/category/SalesCategoryModal/SalesCategoryModal';

import { cn } from '@lib/utilities/cn';

interface SalesCategoryButtonProps {
  isIconOnly?: boolean;
}

function SalesCategoryButton({ isIconOnly = false }: SalesCategoryButtonProps) {
  return (
    <Button
      type="button"
      hierarchy={isIconOnly ? 'primary' : 'secondary'}
      size="small"
      aria-label="카테고리 관리"
      icon={
        <TagIcon
          aria-hidden="true"
          className={isIconOnly ? 'text-primary-500' : undefined}
        />
      }
      className={cn(
        isIconOnly
          ? 'size-10 bg-slate-50 p-0 shadow-[0_1px_4px_var(--color-slate-600)] hover:bg-slate-100'
          : '',
      )}
      onClick={(event) => {
        const returnFocus = event.currentTarget;
        overlay.open((controller) => (
          <SalesCategoryModal {...controller} returnFocus={returnFocus} />
        ));
      }}
    >
      {isIconOnly ? null : '카테고리 관리'}
    </Button>
  );
}

export { SalesCategoryButton };
