import { cn } from '@lib/utilities/cn';

interface CardHeaderProps extends Omit<
  React.ComponentPropsWithRef<'header'>,
  'className'
> {
  className?: string;
}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <header
      data-slot="card-header"
      className={cn('flex items-start justify-between gap-4', className)}
      {...props}
    />
  );
}

export { CardHeader };
export type { CardHeaderProps };
