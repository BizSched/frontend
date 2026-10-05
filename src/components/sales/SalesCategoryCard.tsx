import { Card } from '@components/_common/Card/Card';

import { SalesCategoryDonut } from './SalesCategoryDonut';
import { SALES_MONTH_LABEL } from './salesDashboardData';

function SalesCategoryCard() {
  return (
    <Card
      radius="2xl"
      padding="lg"
      className="h-[518px] shadow-[0_0_30px_rgba(0,0,0,0.05)] max-laptop:order-1 max-tablet:h-[305px] max-tablet:p-5"
    >
      <Card.Header className="flex-col gap-0">
        <Card.Title className="text-2xl font-semibold text-slate-900 max-tablet:text-lg">
          카테고리 구성
        </Card.Title>
        <p className="text-base font-semibold text-slate-500 max-tablet:text-xs">
          {SALES_MONTH_LABEL} 누계
        </p>
      </Card.Header>

      <div className="flex min-h-0 flex-1 items-center justify-center max-tablet:hidden">
        <SalesCategoryDonut />
      </div>

      <div className="hidden min-h-0 flex-1 items-center justify-center max-tablet:flex">
        <SalesCategoryDonut isCompact />
      </div>
    </Card>
  );
}

export { SalesCategoryCard };
