import { MoveRight } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@components/_common/Card/Card';
import { StackedChart } from '@components/_common/Chart/StackedChart';
export function SalesChartSection() {
  return (
    <Card padding="lg" className="gap-6">
      <Card.Header>
        <Card.Title>이번 달 매출 차트</Card.Title>
        <Card.Title className="flex cursor-pointer items-center text-lg text-gray-500 underline">
          <Link href="/sales" className="flex items-center">
            자세히 보기
            <MoveRight className="ml-2 text-gray-500" size={16} />
          </Link>
        </Card.Title>
      </Card.Header>

      <Card.Content>
        <StackedChart />
      </Card.Content>
    </Card>
  );
}
