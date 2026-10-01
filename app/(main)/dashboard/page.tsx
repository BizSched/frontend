import { SalesChartSection } from '@components/dashboard/SalesChartSection/SalesChartSection';
import { TodayWorkerSection } from '@components/dashboard/TodayWorkerSection/TodayWorkerSection';

function DashboardPage() {
  return (
    <main className="mx-auto max-w-[1920px] flex-1 space-y-6 p-6 max-tablet:p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 max-tablet:text-xl">
          김사장님의 대시보드
        </h1>
      </header>
      <TodayWorkerSection />
      <SalesChartSection />
    </main>
  );
}
export default DashboardPage;
