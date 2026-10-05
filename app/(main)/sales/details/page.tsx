import { SalesDetailsHeader } from '@components/sales/SalesDetailsHeader/SalesDetailsHeader';
import { SalesDetailsMobileActions } from '@components/sales/SalesDetailsMobileActions/SalesDetailsMobileActions';
import { SalesDetailsSection } from '@components/sales/SalesDetailsSection/SalesDetailsSection';

function SalesDetailPage() {
  return (
    <main className="mx-auto w-full max-w-[1320px] space-y-6 px-[88px] pt-[100px] pb-8 max-desktop:px-6 max-desktop:pt-12 max-tablet:px-3 max-tablet:pt-6 max-tablet:pb-24">
      <SalesDetailsHeader />

      <SalesDetailsSection />

      <SalesDetailsMobileActions />
    </main>
  );
}

export default SalesDetailPage;
