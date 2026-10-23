import { SalesCategoryButton } from '@components/sales/category/SalesCategoryButton/SalesCategoryButton';
import { SalesEntryButton } from '@components/sales/form/SalesEntryButton/SalesEntryButton';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

function SalesDetailsHeader() {
  return (
    <header className="flex items-center justify-between px-2 max-tablet:sr-only">
      <h1
        className={cn(
          typographyVariants({ role: 'pageTitle' }),
          'text-balance text-gray-900',
        )}
      >
        매출 내역
      </h1>
      <div className="flex gap-3 max-desktop:gap-1 max-tablet:hidden">
        <SalesCategoryButton />
        <SalesEntryButton />
      </div>
    </header>
  );
}

export { SalesDetailsHeader };
