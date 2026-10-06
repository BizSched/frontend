import type { Metadata } from 'next';

import { SalesDetailsHeader } from '@components/sales/SalesDetailsHeader/SalesDetailsHeader';
import { SalesDetailsMobileActions } from '@components/sales/SalesDetailsMobileActions/SalesDetailsMobileActions';
import { SalesDetailsSection } from '@components/sales/SalesDetailsSection/SalesDetailsSection';

export const metadata: Metadata = {
  title: '매출 내역',
};

function SalesDetailPage() {
  return (
    <main className="flex-1 px-6 pt-25 pb-8 max-desktop:pt-12 max-tablet:px-3 max-tablet:pt-6 max-tablet:pb-24">
      <div className="mx-auto w-full max-w-330 space-y-6">
        <SalesDetailsHeader />

        <SalesDetailsSection />

        <SalesDetailsMobileActions />
      </div>
    </main>
  );
}

export default SalesDetailPage;
