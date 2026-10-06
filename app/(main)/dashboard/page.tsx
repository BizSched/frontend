import type { Metadata } from 'next';

import { SalesChartSection } from '@components/dashboard/SalesChartSection/SalesChartSection';
import { TodayWorkerSection } from '@components/dashboard/TodayWorkerSection/TodayWorkerSection';

export const metadata: Metadata = {
  title: '대시보드',
};

function DashboardPage() {
  return (
    <main className="flex-1 p-6 pt-25 max-desktop:pt-12 max-tablet:p-4">
      <div className="mx-auto w-full max-w-330 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 max-tablet:text-xl">
            김사장님의 대시보드
          </h1>
        </header>
        <TodayWorkerSection />
        <SalesChartSection />
      </div>
    </main>
  );
}
export default DashboardPage;
