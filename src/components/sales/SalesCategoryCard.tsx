'use client';

import { Cell, Pie, PieChart } from 'recharts';

import { Card } from '@components/_common/Card/Card';
import { ChartContainer } from '@components/_common/Chart/ChartContainer';

import type { SalesCategory } from './salesDashboardData';

interface SalesCategoryCardProps {
  categories: SalesCategory[];
}

function SalesCategoryCard({ categories }: SalesCategoryCardProps) {
  const config = Object.fromEntries(
    categories.map(({ key, label, color }) => [key, { label, color }]),
  );

  return (
    <Card
      radius="2xl"
      padding="lg"
      className="h-[518px] shadow-[0_0_30px_rgba(0,0,0,0.05)] max-tablet:order-1 max-tablet:h-[305px] max-tablet:p-5"
    >
      <Card.Header className="flex-col gap-0">
        <Card.Title className="text-2xl font-semibold text-slate-900 max-tablet:text-lg">
          카테고리 구성
        </Card.Title>
        <p className="text-base font-semibold text-slate-500 max-tablet:text-xs">
          10월 누계
        </p>
      </Card.Header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 max-tablet:flex-row max-tablet:gap-3">
        <div className="relative size-[250px] shrink-0 max-tablet:size-[170px]">
          <ChartContainer
            config={config}
            className="aspect-auto size-full"
            initialDimension={{ width: 250, height: 250 }}
          >
            <PieChart accessibilityLayer>
              <Pie
                data={categories}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="90%"
                stroke="none"
                isAnimationActive={false}
              >
                {categories.map((category) => (
                  <Cell key={category.key} fill={category.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-sm font-semibold text-slate-950 max-tablet:text-[10px]">
            <span>10월 매출</span>
            <strong>000,000,000 원</strong>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs font-medium text-slate-800 max-tablet:flex-col max-tablet:text-[10px]">
          {categories.map((category) => (
            <span key={category.key} className="inline-flex items-center gap-1">
              <span
                className="size-2 rounded-sm"
                style={{ backgroundColor: category.color }}
              />
              {category.label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export { SalesCategoryCard };
