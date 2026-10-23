import { Card } from '@components/_common/Card/Card';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

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
      <h2
        className={cn(
          typographyVariants({ role: 'sectionTitle' }),
          'text-slate-800',
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          typographyVariants({ role: 'metric' }),
          isAccent ? 'text-primary-700' : 'text-slate-900',
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          typographyVariants({ role: 'supporting' }),
          'text-slate-500',
        )}
      >
        {caption}
      </p>
    </Card>
  );
}

export { SalesSummaryCard };
