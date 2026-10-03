import { Card } from '@components/_common/Card/Card';

import { cn } from '@lib/utilities/cn';

interface SalesSummaryCardProps {
  title: string;
  value: string;
  caption: string;
  isAccent?: boolean;
  className?: string;
}

function SalesSummaryCard({
  title,
  value,
  caption,
  isAccent = false,
  className,
}: SalesSummaryCardProps) {
  return (
    <Card
      radius="2xl"
      padding="lg"
      className={cn(
        'h-[206px] justify-between shadow-[0_0_30px_rgba(0,0,0,0.05)] max-tablet:h-[132px] max-tablet:p-5',
        className,
      )}
    >
      <h2 className="text-2xl font-semibold text-slate-800 max-tablet:text-base">
        {title}
      </h2>
      <p
        className={cn(
          'text-3xl font-bold max-tablet:text-xl',
          isAccent ? 'text-primary-700' : 'text-slate-900',
        )}
      >
        {value}
      </p>
      <p className="text-sm font-medium text-slate-500 max-tablet:text-xs">
        {caption}
      </p>
    </Card>
  );
}

export { SalesSummaryCard };
