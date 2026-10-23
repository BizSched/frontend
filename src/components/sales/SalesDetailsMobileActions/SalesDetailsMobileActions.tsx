import { PlusIcon } from 'lucide-react';

import { Button } from '@components/_common/Button/Button';
import { SalesCategoryButton } from '@components/sales/category/SalesCategoryButton/SalesCategoryButton';
import { SalesEntryButton } from '@components/sales/form/SalesEntryButton/SalesEntryButton';

function SalesDetailsMobileActions() {
  return (
    <div
      className="fixed right-3 bottom-3 z-10 hidden flex-col items-center gap-1 max-tablet:flex"
      aria-label="매출 관리"
    >
      <SalesCategoryButton isIconOnly />
      <SalesEntryButton isIconOnly />
      <Button
        type="button"
        aria-label="매출 관리 메뉴"
        className="size-14 p-0 shadow-[0_1px_4px_var(--color-slate-600)]"
      >
        <PlusIcon aria-hidden="true" />
      </Button>
    </div>
  );
}

export { SalesDetailsMobileActions };
