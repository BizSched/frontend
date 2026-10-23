import { cn } from '@lib/utilities/cn';

interface CardContentProps extends Omit<
  React.ComponentPropsWithRef<'div'>,
  'className'
> {
  className?: string;
}

function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

export { CardContent };
export type { CardContentProps };
