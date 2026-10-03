import { SalesCategoryButton } from '@components/sales/category/SalesCategoryButton/SalesCategoryButton';
import { SalesEntryButton } from '@components/sales/form/SalesEntryButton/SalesEntryButton';

function SalesDetailsHeader() {
  return (
    <header className="flex items-center justify-between px-2 max-tablet:sr-only">
      <h1 className="text-2xl font-bold text-gray-900 max-tablet:text-xl">
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
